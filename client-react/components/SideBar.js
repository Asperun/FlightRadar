import { memo, useMemo } from "react";
import Image from "next/image";
import { fetcher } from "../utils/requestHelper";
import useSWRImmutable from 'swr/immutable'
import useSWR from "swr";
import { Polyline } from "react-leaflet";

const SideBar = ( {plane, totalPlanes, setSelectedPlane} ) => {
  const date                 = useMemo(() => Date.now() / 1000, [plane]);
  const {data: routeInfo}    = useSWRImmutable(plane ? `https://stormy-lake-51427.herokuapp.com/https://opensky-network.org/api/routes?callsign=${plane.callSign}` : null, fetcher, {onErrorRetry: ( error ) => {if (error.status === 404) return }})
  const {data: planeInfo}    = useSWRImmutable(plane ? `https://localhost:5001/api/v1/planes/icao24/${plane.icao24}` : null, fetcher, {onErrorRetry: ( error ) => {if (error.status === 404) return }})
  const {data: planeDetails} = useSWRImmutable(plane ? `https://stormy-lake-51427.herokuapp.com/https://opensky-network.org/api/metadata/aircraft/icao/${plane.icao24}` : null, fetcher, {onErrorRetry: ( error ) => {if (error.status === 404) return }})
  const {data: routeDetails} = useSWRImmutable(routeInfo ? `https://stormy-lake-51427.herokuapp.com/https://opensky-network.org/api/flights/aircraft?icao24=${plane.icao24}&begin=${Math.floor(date - 612000)}&end=${Math.floor(date)}&limit=1&offset=0` : null, fetcher, {onErrorRetry: ( error ) => {if (error.status === 404) return }})
  const {data: airportDept}  = useSWRImmutable(routeDetails ? `https://stormy-lake-51427.herokuapp.com/https://opensky-network.org/api/airports/?icao=${routeDetails[0].estDepartureAirport}` : null, fetcher, {onErrorRetry: ( error ) => {if (error.status === 404) return }})
  const {data: airportArriv} = useSWRImmutable(routeDetails ? `https://stormy-lake-51427.herokuapp.com/https://opensky-network.org/api/airports/?icao=${routeDetails[0].estArrivalAirport}` : null, fetcher, {onErrorRetry: ( error ) => {if (error.status === 404) return }})


  if (plane) {
    return <RenderPlaneSidebar />
  } else {
    return <RenderGenericSideBar />
  }


  function RenderPlaneSidebar() {

    const path= [[plane.latitude,plane.longitude]];
    let progress;

    if(airportDept)
      path.unshift([airportDept.position.latitude,airportDept.position.longitude])

    if(airportArriv)
      path.push([airportArriv.position.latitude,airportArriv.position.longitude])

    if(airportArriv && airportDept){
      // const x =  Math.abs(path[2][1] - path[1][1]) / Math.abs(path[0][1] - path[1][1]) ;
      // const y =  Math.abs(path[2][0] - path[1][0]) / Math.abs(path[0][0] - path[2][0]) ;
      // // const y =  Math.abs(path[2][0] - path[1][0]) / Math.abs(path[0][0] - path[1][0]) ;
      // // progress = Math.floor((x+y)/2 * 100)
      // progress = Math.floor(y * 100)
      // console.log(progress)

      const totalDist = Math.abs(path[0][1] - path[2][1]);
      const deportPlaneDist = Math.abs(path[0][1] - path[1][1]);
      console.log(Math.floor((deportPlaneDist/totalDist)  * 100))
      progress = Math.floor((deportPlaneDist/totalDist)  * 100)
    }

    return (
        <div className="border-2 border-red-800 absolute left-4 top-4 bottom-4 z-[10000] bg-black bg-opacity-60 text-white w-72 no-scrollbar">
          <div className="flex flex-col text-white h-full w-full shrink-0 overflow-auto flex-nowrap no-scrollbar">
            <div className="border-2 border-red-800  basis-56 mb-1 relative flex flex-col flex-nowrap shrink-0 overflow-auto no-scrollbar">
              <button className="absolute top-1 right-2 z-[10000]"
                      onClick={() => setSelectedPlane(null)}>X
              </button>
              <div className="basis-2/12 fade-to-right">
                <img src={"https://hatscripts.github.io/circle-flags/flags/pl.svg"}
                     width={40}
                     height={24}
                     className="absolute left-0 maskBg"
                     alt={""} />
                <div className="flex items-center text-3xl text-white grow-0 overflow-auto shrink-0 flex-nowrap no-scrollbar">
                  <div className={"text-orange-400 whitespace-nowrap"}>{(planeDetails?.manufacturerName || "Unknown") + ' ' + (planeDetails?.model || "")}
                    <span className={"text-white"}>{'/' + plane.callSign}</span></div>
                </div>
              </div>
              <div className="basis-10/12 relative">
                <Image src="https://cdn.jetphotos.com/full/5/94069_1639068690.jpg"
                       alt={"plane.png"}
                       layout={"fill"}
                       loading={"lazy"} />
              </div>
            </div>
            <div className="flex flex-col border-2 border-red-800 basis-9/12">
              <div className="flex justify-between p-2 basis-1/5 items-center">
                <div className="flex justify-center items-center border-2 w-24 h-24 rounded-full border-red-800 text-center bg-opacity-50 relative">
                  {airportDept ? <> <Image className={"opacity-60"}
                                           src={`https://hatscripts.github.io/circle-flags/flags/${airportDept.country.toLowerCase()}.svg`}
                                           alt={''}
                                           layout={"fill"}
                                           loading={"lazy"} />
                    <div className="font-bold opacity-95">{airportDept.iata}</div>
                  </> : "Unknown"
                  }
                </div>
                <div className="border-2 rounded-full border-red-800">{'->'}</div>
                <div className="border-2 flex justify-center items-center w-24 h-24 rounded-full border-red-800 bg-opacity-50 relative">
                  {airportArriv ? <> <Image className={"opacity-60"}
                                            src={`https://hatscripts.github.io/circle-flags/flags/${airportArriv.country.toLowerCase()}.svg`}
                                            alt={''}
                                            layout={"fill"}
                                            loading={"lazy"} />
                    <div className="font-bold opacity-95">{airportArriv.iata}</div>
                  </> : "Unknown"
                  }
                </div>
              </div>
              {console.log(path)}
              <Polyline positions={path} pathOptions={{color: "lime", stroke: true, dashArray:[15,15], weight: 2}} />
              <div className="text-center mt-2 mb-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${progress ? progress : 0}%`}}>{progress ? progress + "%" : ""}</div>
                </div>
              </div>
              <div className="flex justify-between p-2 items-center basis-1/5">
                <div className="border-2 flex flex-col justify-center items-center w-24 h-24 rounded-full border-red-800 bg-red-900 bg-opacity-50">
                  <p>11:40</p>
                  <p>Deport time</p>
                </div>
                <h1>UTC</h1>
                <div className="border-2 flex flex-col justify-center items-center w-24 h-24 rounded-full border-red-800 bg-red-900 bg-opacity-50">
                  <p>15:25</p>
                  <p>Arrival time</p>
                </div>
              </div>
              <div className="grid p-2 items-end text-center grid-cols-3 grid-rows-2 basis-1/3">
                <div>
                  <p className={"text-orange-600"}>{planeInfo ? Math.floor(3.6 * planeInfo.velocity) + "km/h" : "NaN"}</p>
                  Speed
                </div>
                <div>
                  <p className={"text-orange-600"}>{planeInfo ? Math.floor(planeInfo?.baroAltitude) + "m" : "NaN"}</p>
                  Altitude
                </div>
                <div>
                  <p className={"text-orange-600"}>{planeInfo ? Math.floor(planeInfo?.trueTrack) + "°" : "NaN"}</p>
                  Direction
                </div>
                <div>
                  <p className={"text-orange-600"}>{planeInfo ? new Date().getSeconds() - new Date(planeInfo?.lastContact).getSeconds() + "s" : "NaN"}</p>
                  Updated
                </div>
                <div>
                  <p className={"text-orange-600"}>2019</p>
                  Registered
                </div>
                <div>
                  <p className={"text-orange-600"}>{plane.icao24}</p>
                  Icao24
                </div>
              </div>
              <div>
                I am History dropdown
              </div>
            </div>
          </div>
        </div>
    );
  }

  function RenderGenericSideBar() {
    const {
            data: stats,
            error: error
          } = useSWR(`https://localhost:5001/api/v1/planes/stats`, fetcher, {onErrorRetry: ( error ) => {if (error.status === 404) return }})
    if (error) return <h1>Error</h1>
    if (!stats && !error) return <h1>Loading</h1>
    // const {totalPlanes,inAir,zoneEu,zoneUs} = stats;
    return (
        <div className="border-2 border-red-800 absolute left-4 top-4 h-fit w-64 z-[10000] bg-black bg-opacity-60 text-white">
          {/*<Transition*/}
          {/*    appear={true}*/}
          {/*    show={true}*/}
          {/*    enter="transition-opacity duration-500"*/}
          {/*    enterFrom="opacity-0"*/}
          {/*    enterTo="opacity-100"*/}
          {/*    leave="transition-opacity duration-75"*/}
          {/*    leaveFrom="opacity-100"*/}
          {/*    leaveTo="opacity-0"*/}
          {/*>*/}
          <div className="flex flex-col gap-2 text-white w-full p-2">
            <p className="text-center bg-blue-900 bg-opacity-60">Stats</p>
            <p>Displaying {totalPlanes}/{stats.totalPlanes}</p>
            <p>In Air {stats.inAir}</p>
            <p>On Ground {stats.totalPlanes - stats.inAir}</p>
            <p>Traffic {Math.floor((stats.totalPlanes - (stats.totalPlanes - stats.inAir)) / (stats.totalPlanes) * 100)}%</p>
            <p className="text-center bg-blue-900 bg-opacity-60">Air Spaces</p>
            <p>US {stats.zoneUs}</p>
            <p>EU {stats.zoneEu}</p>
            <p>Other {stats.totalPlanes - stats.zoneEu - stats.zoneUs}</p>
          </div>
          {/*</Transition>*/}
        </div>
    );
  }

}


function areEqual( prevProps, nextProps ) {
  return prevProps.plane?.icao24 === nextProps.plane?.icao24 && prevProps.totalPlanes === nextProps.totalPlanes;
}

export default memo(SideBar, areEqual);
