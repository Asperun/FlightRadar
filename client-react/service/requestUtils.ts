import type { GeoGraphData, LinearGraphData } from '../types/graph';
import { convertCountryToAlpha3Code } from './countryUtils';

// const apiBase = process.env.NODE_ENV === "production" ? "https://api.fantasea.pl/v1/planes" : "http://localhost:5001/v1/planes";
const apiBase = 'https://api.fantasea.pl/v1/planes';

export async function fetchSidePanelStats() {
  const response = await fetch(`${apiBase}/stats/global`);
  if (response.ok) {
    return response.json();
  }
  return null;
}

export function getHourlyGraphData(): Promise<any> {
  return fetch(`${apiBase}/stats/hourly?pastDays=1`);
}

export function getHourlyPerRegionGraphData(): Promise<any> {
  return fetch(`${apiBase}/stats/hourlyperregion`);
}

export function getRegisteredPlanesGraphData(): Promise<any> {
  return fetch(`${apiBase}/stats/registered`);
}

export function getLandingPageStats(): Promise<any> {
  return fetch(`${apiBase}/stats/main`);
}

export async function fetchPlaneImage(icao24: string) {
  try {
    const response = await fetch(`https://api.planespotters.net/pub/photos/hex/${icao24}`);
    if (response.ok) {
      const { photos } = await response.json();
      if (photos.length > 0) {
        return {
          url: photos[0].thumbnail_large.src,
          photographer: photos[0].photographer
        };
      }
    }
  } catch (e) {
    console.log('Error fetching plane image', e);
  }
  return null;
}

export async function fetchManufacturerDetails(icao24: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN_NAME}/api/details?icao24=${icao24}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.log('Error fetching plane image', e);
  }
  return null;
}

export async function fetchTrackDetails(icao24: string) {
  try {
    const response = await fetch(`${apiBase}/icao24/${icao24}?checkpoints=true`);
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.log('Error fetching plane image', e);
  }
  return null;
}

export function subscribeToUpdates(
  minLat: number,
  minLong: number,
  maxLat: number,
  maxLong: number,
  limit: number = 300,
  showLanded = false
): EventSource {
  return new EventSource(
    `${apiBase}/subscribe?minLat=${minLat}&minLong=${minLong}&maxLat=${maxLat}&maxLong=${maxLong}&limit=${limit}&showLanded=${showLanded}`
  );
}

// one day i will rewrite this
export function mapHourlyToGraph(hourly: any): LinearGraphData[] | null {
  if (!hourly) {
    return null;
  }

  const hourlyGrouped = groupBy(hourly, 'day');
  const returnArray: LinearGraphData[] = [];

  Object.keys(hourlyGrouped).forEach((newArrKey) => {
    returnArray.push({
      // @ts-ignore
      id: `${hourlyGrouped[newArrKey][0].month} ${newArrKey}`,
      // @ts-ignore
      data: hourlyGrouped[newArrKey].map((arrObj: any) => {
        return {
          x: arrObj.hour,
          y: arrObj.count
        };
      })
    });
  });
  return returnArray;
}

export function mapHourlyPerRegionToGraph(hourlyPerRegion: any): LinearGraphData[] {
  const regionNames: string[] = ['Europe', 'North America'];
  const returnArray: LinearGraphData[] = [];

  for (let k = 0; k < hourlyPerRegion.length; k += 1) {
    const grouped = groupBy(hourlyPerRegion[k], 'day');
    Object.keys(grouped).forEach((newArrKey) => {
      returnArray.push({
        // @ts-ignore
        id: regionNames.pop(),
        // @ts-ignore
        data: grouped[newArrKey].map((arrObj) => {
          return {
            x: arrObj.hour,
            y: arrObj.count
          };
        })
      });
    });
  }
  return returnArray;
}

export function mapRegisteredToGraph(registered: any): GeoGraphData[] {
  return registered.map((obj: { country: string; count: any }) => ({
    id: convertCountryToAlpha3Code(obj.country),
    value: obj.count
  }));
}

function groupBy(arr: [], property: string) {
  return arr.reduce(function (memo, x) {
    if (!memo[x[property]]) {
      // @ts-ignore
      // eslint-disable-next-line no-param-reassign
      memo[x[property]] = [];
    }
    // @ts-ignore
    memo[x[property]].push(x);
    return memo;
  }, {});
}
