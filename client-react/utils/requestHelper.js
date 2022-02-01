import useSWR from 'swr'
import useSWRImmutable from "swr/immutable";

export const fetcher = ( ...args ) => fetch(...args).then(res =>  res.json());


export function usePlaneImage (icao24) {
  const { data, error } = useSWRImmutable(`https://api.planespotters.net/pub/photos/hex/${icao24}`,fetcher)

  return {
    data: data,
    isLoading: !error && !data,
    isError: error
  }
}

export function useSkyPlaneDetails (icao24) {
  const { data, error } = useSWRImmutable(`https://stormy-lake-51427.herokuapp.com/https://opensky-network.org/api/metadata/aircraft/icao/${icao24}`,fetcher)

  return {
    data: data,
    isLoading: !error && !data,
    isError: error
  }
}

export function useApiPlaneDetails (icao24) {
  const { data, error } = useSWR(icao24 ?`https://fantasea.pl/api/v1/planes/icao24/${icao24}?checkpoints=true`:null, fetcher, {refreshInterval: 12_000})

  return {
    data: data,
    isLoading: !error && !data,
    isError: error
  }
}

export function useSidePanelStats () {
  // const { data, error } = useSWR(`http://192.168.0.13:5001/api/v1/planes/stats/global`, fetcher)
  const { data, error } = useSWR(`https://fantasea.pl/api/v1/planes/stats/global`, fetcher)

  return {
    data: data,
    isLoading: !error && !data,
    isError: error
  }
}

