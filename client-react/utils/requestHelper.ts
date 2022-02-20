import useSWR from 'swr'
import useSWRImmutable from "swr/immutable";
import axios from "axios";
import {GeoGraphData, LinearGraphData} from "../types/graph";
import {convertCountryToAlpha3Code} from "./countryUtils";

export const fetcher = (...args) => fetch(...args).then(res => res.json());


export function usePlaneImage(icao24: string) {
  const {data, error} = useSWRImmutable(`https://api.planespotters.net/pub/photos/hex/${icao24}`, fetcher)

  return {
    data: data,
    isLoading: !error && !data,
    isError: error
  }
}

export function useSkyPlaneDetails(icao24: string) {
  const {data, error} = useSWRImmutable(`https://stormy-lake-51427.herokuapp.com/https://opensky-network.org/api/metadata/aircraft/icao/${icao24}`, fetcher)

  return {
    data: data,
    isLoading: !error && !data,
    isError: error
  }
}

export function useApiPlaneDetails(icao24: string) {
  const {data, error} = useSWR(icao24 ? `https://fantasea.pl/api/v1/planes/icao24/${icao24}?checkpoints=true` : null, fetcher, {refreshInterval: 12_000})

  return {
    data: data,
    isLoading: !error && !data,
    isError: error
  }
}

export function useSidePanelStats() {
  const {data, error} = useSWR(`https://fantasea.pl/api/v1/planes/stats/global`, fetcher)

  return {
    data: data,
    isLoading: !error && !data,
    isError: error
  }
}

export function getHourlyGraphData(): Promise<any> {
  return axios.get("https://fantasea.pl/api/v1/planes/stats/hourly?pastDays=1");
}

export function getHourlyPerRegionGraphData(): Promise<any> {
  return axios.get("https://fantasea.pl/api/v1/planes/stats/hourlyperregion");
}

export function getRegisteredPlanesGraphData(): Promise<any> {
  return axios.get("https://fantasea.pl/api/v1/planes/stats/planesregistered")
}

export function mapHourlyToGraph(hourly): LinearGraphData[] {
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
  const regionNames: string[] = ["Europe", "North America"]
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
  return registered.map(obj => ({id: convertCountryToAlpha3Code(obj.country), value: obj.count}))
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
