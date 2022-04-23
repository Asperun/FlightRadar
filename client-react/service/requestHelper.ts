import { GeoGraphData, LinearGraphData } from "../types/graph";
import { convertCountryToAlpha3Code } from "./countryUtils";

const apiEndpoint =
  process.env.NODE_ENV === "production"
    ? "https://api.fantasea.pl/v1/planes"
    : "http://localhost:5001/v1/planes";
// const apiEndpoint = "https://api.fantasea.pl/v1/planes";

export async function fetchSidePanelStats() {
  const response = await fetch(`${apiEndpoint}/stats/global`);
  if (response.ok) {
    return await response.json();
  }
  return null;
}

export function getHourlyGraphData(): Promise<any> {
  return fetch(`${apiEndpoint}/stats/hourly?pastDays=1`);
}

export function getHourlyPerRegionGraphData(): Promise<any> {
  return fetch(`${apiEndpoint}/stats/hourlyperregion`);
}

export function getRegisteredPlanesGraphData(): Promise<any> {
  return fetch(`${apiEndpoint}/stats/registered`);
}

export function getMainStats(): Promise<any> {
  return fetch(`${apiEndpoint}/stats/main`);
}

export async function fetchPlaneImage(icao24: string) {
  try {
    const response = await fetch(`https://api.planespotters.net/pub/photos/hex/${icao24}`);
    if (response.ok) {
      const { photos } = await response.json();
      if (photos.length > 0) {
        return {
          url: photos[0].thumbnail_large.src,
          photographer: photos[0].photographer,
        };
      }
    }
  } catch (e) {
    console.log("Error fetching plane image", e);
  }
  return null;
}

export async function fetchManufactuerDetails(icao24: string) {
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_DOMAIN_NAME + `/api/details?icao24=${icao24}`
    );
    // const response = await fetch(
    // `http://localhost:3000/flight-tracker/api/details?icao24=${icao24}`
    // );
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.log("Error fetching plane image", e);
  }
  return null;
}

export async function fetchTrackDetails(icao24: string) {
  try {
    const response = await fetch(`${apiEndpoint}/icao24/${icao24}?checkpoints=true`);
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.log("Error fetching plane image", e);
  }
  return null;
}

export function subscribeToPlaneUpdates(
  minLat: number,
  minLong: number,
  maxLat: number,
  maxLong: number,
  limit: number = 200
): EventSource {
  return new EventSource(
    `${apiEndpoint}/subscribe?minLat=${minLat}&minLong=${minLong}&maxLat=${maxLat}&maxLong=${maxLong}&limit=${limit}`
  );
}

// one day i will rewrite this too
export function mapHourlyToGraph(hourly: any): LinearGraphData[] | null {
  if (!hourly) {
    return null;
  }

  const hourlyGrouped = groupBy(hourly, "day");
  const returnArray: LinearGraphData[] = [];

  for (let newArrKey in hourlyGrouped) {
    returnArray.push({
      id: hourlyGrouped[newArrKey][0].month + " " + newArrKey,
      data: hourlyGrouped[newArrKey].map((arrObj: any) => {
        return {
          x: arrObj.hour,
          y: arrObj.count,
        };
      }),
    });
  }

  return returnArray;
}

export function mapHourlyPerRegionToGraph(hourlyPerRegion: any): LinearGraphData[] {
  const regionNames: string[] = ["Europe", "North America"];
  const returnArray: LinearGraphData[] = [];

  for (let k = 0; k < hourlyPerRegion.length; k++) {
    const grouped = groupBy(hourlyPerRegion[k], "day");
    for (let newArrKey in grouped) {
      returnArray.push({
        id: regionNames.pop(),
        data: grouped[newArrKey].map((arrObj) => {
          return {
            x: arrObj.hour,
            y: arrObj.count,
          };
        }),
      });
    }
  }
  return returnArray;
}

export function mapRegisteredToGraph(registered: any): GeoGraphData[] {
  return registered.map((obj) => ({
    id: convertCountryToAlpha3Code(obj.country),
    value: obj.count,
  }));
}

function groupBy(arr: [], property: string) {
  return arr.reduce(function (memo, x) {
    if (!memo[x[property]]) {
      memo[x[property]] = [];
    }
    memo[x[property]].push(x);
    return memo;
  }, {});
}
