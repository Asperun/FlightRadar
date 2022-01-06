import useSWR from 'swr'

export const fetcher = ( ...args ) => fetch(...args).then(res => {
  // console.log(args);
  return res.json()
});

// export function usePlaneDetails( icao24 ) {
//   const {data, error} = useSWR(`https://localhost:5001/api/v1/planes/icao24/${icao24}`, fetcher)
//   return {
//     plane: data, isLoading: !error && !data, isError: error
//   }
// }
export function usePlaneDetails( icao24 ) {
  const {data, error} = useSWR([`https://stormy-lake-51427.herokuapp.com/https://opensky-network.org/api/metadata/aircraft/icao/${icao24}`,{
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    }
  }], fetcher , {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
  return {
    planeInfo: data, isLoading: !error && !data, isError: error
  }
}

export function usePlaneRoutes( callSign ) {
  const {data, error} = useSWR([`https://stormy-lake-51427.herokuapp.com/https://opensky-network.org/api/routes?callsign=${callSign}`,{
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    }
  }], fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  })
  return { //{"callsign":"VKG819","route":["GVAC","EFHK","ESGG"],"updateTime":1640647465000,"operatorIata":"DK","flightNumber":819}
    planeRoutes: data, isLoading: !error && !data, isError: error
  }
}

export function usePlaneRouteDetails( icao24, time ) {
  const {data, error} = useSWR( ()=>`https://opensky-network.org/api/flights/aircraft?icao24=${icao24}&begin=1640041179&end=${time - 612000}&limit=1&offset=0`, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  })
  return {
    planeRoutes: data, isLoading: !error && !data, isError: error
  }
}

export function useGlobalStats() {
  const {data, error} = useSWR(`https://localhost:5001/api/v1/planes/globals`, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  })
  return {
    stats: data, isLoading: !error && !data, isError: error
  }
}
