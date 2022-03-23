import useSWR from 'swr'
import useSWRImmutable from "swr/immutable";
import axios, {AxiosResponse} from "axios";
import {GeoGraphData, LinearGraphData} from "../types/graph";
import {convertCountryToAlpha3Code} from "./countryUtils";

export const fetcher = (...args) => fetch(...args).then(res => res.json());

const apiEndpoint = process.env.NODE_ENV === 'production' ? "https://api.fantasea.pl/v1/planes" : "http://localhost:5001/v1/planes";
// const apiEndpoint = "https://api.fantasea.pl/v1/planes";

export function usePlaneImage(icao24: string) {
  const {data, error} = useSWRImmutable(`https://api.planespotters.net/pub/photos/hex/${icao24}`, fetcher);

  return {
    data: data,
    isLoading: !error && !data,
    isError: error
  }
}

export function useSkyPlaneDetails(icao24: string) {
  // const {data, error} = useSWRImmutable(`https://stormy-lake-51427.herokuapp.com/https://opensky-network.org/api/metadata/aircraft/icao/${icao24}`, fetcher);
  const {data, error} = useSWRImmutable(process.env.NEXT_PUBLIC_DOMAIN_NAME + `/api/details?icao24=${icao24}`, fetcher);

  return {
    data: data,
    isLoading: !error && !data,
    isError: error
  }
}

export function useApiPlaneDetails(icao24: string) {
  const {data, error} = useSWR(icao24 ? `${apiEndpoint}/icao24/${icao24}?checkpoints=true` : null, fetcher, {refreshInterval: 12_000});

  return {
    data: data,
    isLoading: !error && !data,
    isError: error
  }
}

export function useSidePanelStats() {
  const {data, error} = useSWR(`${apiEndpoint}/stats/global`, fetcher)

  return {
    data: data,
    isLoading: !error && !data,
    isError: error
  }
}

export function getHourlyGraphData(): Promise<AxiosResponse> {
  return axios.get(`${apiEndpoint}/stats/hourly?pastDays=1`);
}

export function getHourlyPerRegionGraphData(): Promise<AxiosResponse> {
  return axios.get(`${apiEndpoint}/stats/hourlyperregion`);
}

export function getRegisteredPlanesGraphData(): Promise<AxiosResponse> {
  return axios.get(`${apiEndpoint}/stats/registered`);
}

export function getMainStats(): Promise<AxiosResponse> {
  return axios.get(`${apiEndpoint}/stats/main`);
}

export function subscribeToPlaneUpdates(minLat: number, minLong: number, maxLat: number, maxLong: number, limit: number = 200): EventSource {
  return new EventSource(`${apiEndpoint}/subscribe?minLat=${minLat}&minLong=${minLong}&maxLat=${maxLat}&maxLong=${maxLong}&limit=${limit}`);
}

export function mapHourlyToGraph(hourly: any): LinearGraphData[] | null {

  if (!hourly) {
    return null;
  }

  const hourlyGrouped = groupBy(hourly, "day");
  const returnArray: LinearGraphData[] = [];

  for (let newArrKey in hourlyGrouped) {
    returnArray.push(
      {
        id: hourlyGrouped[newArrKey][0].month + " " + newArrKey,
        data: hourlyGrouped[newArrKey].map((arrObj) => {
          return {
            x: arrObj.hour,
            y: arrObj.count
          }
        })
      }
    )
  }

  return returnArray;
}

export function mapHourlyPerRegionToGraph(hourlyPerRegion): LinearGraphData[] {
  const regionNames: string[] = ["Europe", "North America"];
  const returnArray: LinearGraphData[] = [];

  for (let k = 0; k < hourlyPerRegion.length; k++) {
    const grouped = groupBy(hourlyPerRegion[k], "day");
    for (let newArrKey in grouped) {
      returnArray.push(
        {
          id: regionNames.pop(),
          data: grouped[newArrKey].map((arrObj) => {
            return {
              x: arrObj.hour,
              y: arrObj.count
            }
          })
        }
      )
    }
  }
  return returnArray
}

export function mapRegisteredToGraph(registered): GeoGraphData[] {
  return registered.map(obj => ({id: convertCountryToAlpha3Code(obj.country), value: obj.count}));
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
