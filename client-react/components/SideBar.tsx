import {memo, ReactElement} from "react";
import Image from "next/image";
import {useApiPlaneDetails, usePlaneImage, useSidePanelStats, useSkyPlaneDetails} from "../utils/requestHelper";
import {convertCountryToAlpha2Code} from "../utils/countryUtils";
import {Plane} from "../types/plane";

interface Props {
    plane: Plane
    totalPlanes: number;
    setSelectedPlane: any;
}

const SideBar = ({plane, totalPlanes, setSelectedPlane}: Props) => {

    if (plane) {
        return <RenderPlaneSidebar />
    } else {
        return <RenderGenericSideBar />
    }

    function RenderPlaneSidebar(): ReactElement {
        const openSkyPlaneInfo = useSkyPlaneDetails(plane.icao24);
        const dbPlaneInfo = useApiPlaneDetails(plane.icao24) // duplicate fetch, move to redux store at some point
        const planeImage = usePlaneImage(plane.icao24);
        const planeManufactuer: string = openSkyPlaneInfo.data?.manufacturerIcao.charAt(0) + openSkyPlaneInfo.data?.manufacturerIcao.substring(1).toLowerCase();

        let date: Date | undefined;

        if (dbPlaneInfo.data && dbPlaneInfo.data.flights.length > 0) {
            const flight = dbPlaneInfo.data.flights[0];
            const checkpoints = flight.checkpoints;
            date = new Date(Math.floor(new Date() / 1000) - Date.parse(checkpoints[0].creationTime));
        }

        return (<div className="border-2 border-sky-900 absolute left-4 top-4 bottom-4 z-[1000] bg-black bg-opacity-75 text-white w-72 no-scrollbar">
                <div className="flex flex-col text-white h-full w-full  overflow-auto no-scrollbar">
                    <div className="basis-56 relative flex flex-col shrink-0 overflow-auto no-scrollbar">
                        <button className="absolute top-1 right-2 z-[10000]"
                                onClick={() => setSelectedPlane(null)}>X
                        </button>
                        <div className="basis-2/12 fade-to-right">
                            <div className="ml-2 flex items-center text-3xl text-white no-scrollbar">
                                {openSkyPlaneInfo.data && <Image className={"opacity-100"}
                                                                 src={`https://hatscripts.github.io/circle-flags/flags/${convertCountryToAlpha2Code(openSkyPlaneInfo.data.country)}.svg`}
                                                                 alt={''}
                                                                 title={openSkyPlaneInfo.data.country}
                                                                 width={28}
                                                                 height={28}
                                                                 layout={"fixed"}
                                                                 quality={100} /> || openSkyPlaneInfo.isLoading && <svg className="animate-spin h-6 w-6"
                                                                                                                        viewBox="0 0 24 24">
                                  <path className="opacity-75"
                                        fill="#BB86FC"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                  <circle className="opacity-25"
                                          cx="12"
                                          cy="12"
                                          r="10"
                                          stroke="currentColor"
                                          strokeWidth="4" />
                                </svg> || openSkyPlaneInfo.isError && <strong>?</strong>}
                                <div className={"ml-1 text-orange-400 whitespace-nowrap"}>
                                    {(planeManufactuer || "Unknown")} {' '}
                                    <span className={"text-white"}>{(openSkyPlaneInfo.data?.typecode || "")}</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-full relative flex content-center items-center justify-center">
                            {planeImage.data && planeImage.data.photos.length > 0 && <Image src={planeImage.data.photos[0]?.thumbnail_large?.src}
                                                                                            alt={"plane.png"}
                                                                                            layout={"fill"} /> || planeImage.isLoading && <svg className="animate-spin h-12 w-12 "
                                                                                                                                               viewBox="0 0 24 24">
                              <path className="opacity-75"
                                    fill="#BB86FC"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              <circle className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4" />
                            </svg> || <strong className={"text-4xl opacity-80"}>?</strong>}

                        </div>
                    </div>
                    <div className="flex flex-col h-full">
                        <p className="text-center bg-blue-900 bg-opacity-60 ml-2 mr-2">Aircraft</p>
                        <div className="grid p-2 items-center text-center grid-cols-6 grid-rows-3 basis-1/2 items-center">

                            <div className={"col-span-3"}>
                                <p className={"text-orange-600"}>{openSkyPlaneInfo.data && openSkyPlaneInfo.data.owner || "?"} </p>
                                Owner
                            </div>
                            <div className={"col-span-3"}>
                                <p className={"text-orange-600"}>{openSkyPlaneInfo.data && openSkyPlaneInfo.data.operatorCallsign || "?"} </p>
                                Operator
                            </div>
                            <div className={"col-span-3"}>
                                <p className={"text-orange-600"}>{openSkyPlaneInfo.data && openSkyPlaneInfo.data.model || "?"} </p>
                                Model
                            </div>
                            <div className={"col-span-3"}>
                                <p className={"text-orange-600"}>{plane.callSign && plane.callSign || "?"} </p>
                                Call Sign
                            </div>
                            <div className={"col-span-2"}>
                                <p className={"text-orange-600"}>{plane.icao24 && plane.icao24 || "?"} </p>
                                <p>Icao</p>
                            </div>
                            <div className={"col-span-2"}>
                                <p className={"text-orange-600"}>{openSkyPlaneInfo.data && openSkyPlaneInfo.data.registration || "?"}</p>
                                <p>Registration</p>
                            </div>
                            <div className={"col-span-2"}>
                                <p className={"text-orange-600"}>{openSkyPlaneInfo.data && openSkyPlaneInfo.data.serialNumber || "?"} </p>
                                <p>Serial</p>
                            </div>

                        </div>

                        <p className="text-center bg-blue-900 bg-opacity-60 ml-2 mr-2">Route</p>
                        <div className="grid p-2 items-center text-center grid-cols-3 grid-rows-2 basis-1/3">
                            <div>
                                <p className={"text-orange-600"}>{dbPlaneInfo.data && Math.floor(3.6 * dbPlaneInfo.data.velocity) + "km/h" || "?"}</p>
                                Speed
                            </div>
                            <div>
                                <p className={"text-orange-600"}>{dbPlaneInfo.data && Math.floor(dbPlaneInfo.data.geoAltitude) + "m" || "?"}</p>
                                Altitude
                            </div>
                            <div>
                                <p className={"text-orange-600"}>{dbPlaneInfo.data && Math.floor(dbPlaneInfo.data.trueTrack) + "°" || "?"}</p>
                                Direction
                            </div>
                            <div>
                                <p className={"text-orange-600"}>{dbPlaneInfo.data && dbPlaneInfo.data.lastContact + "s" || "?"}</p>
                                Updated
                            </div>
                            <div>
                                <p className={"text-orange-600"}>{date && date.getHours() + "h" + date.getMinutes() + "min" || "?"}</p>
                                In air
                            </div>
                            <div>
                                <p className={"text-orange-600"}>?</p>
                                Distance
                            </div>
                        </div>
                        <p className="text-center bg-blue-900 bg-opacity-60 ml-2 mr-2">Checkpoints</p>
                        <div className="grid p-2 items-center text-center grid-cols-3 grid-rows-1">
                            <div>
                                <p className={"text-orange-600"}>{dbPlaneInfo.data && dbPlaneInfo.data.flights && dbPlaneInfo.data.flights[0]?.checkpoints.length || "?"}</p>
                                Amount
                            </div>
                            <div>
                                <p className={"text-orange-600"}>{dbPlaneInfo.data && dbPlaneInfo.data.flights && Math.floor((dbPlaneInfo.data.flights[0]?.checkpoints.reduce((total: number, next: Plane) => total + next.velocity, 0)) / dbPlaneInfo.data.flights[0]?.checkpoints.length * 3.6) + "km/h" || "?"}</p>
                                Avg speed
                            </div>
                            <div>
                                <p className={"text-orange-600"}>{dbPlaneInfo.data && dbPlaneInfo.data.flights && Math.floor(dbPlaneInfo.data.flights[0]?.checkpoints.reduce((total: number, next: Plane) => total + next.altitude, 0) / dbPlaneInfo.data.flights[0]?.checkpoints.length) + "m" || "?"}</p>
                                Avg Altitude
                            </div>
                        </div>
                    </div>
                </div>
            </div>);
    }

    function RenderGenericSideBar() {
        const stats = useSidePanelStats();
        if (stats.isError) return <h1>Error</h1>
        if (stats.isLoading) return <h1>Loading</h1>
        return (<div className="border-2 border-sky-800 absolute left-4 top-4 h-fit w-64 z-[10000] bg-black bg-opacity-60 text-white">
                <div className="flex flex-col gap-2 text-white w-full p-2">
                    <p className="text-center bg-blue-900 bg-opacity-60">Stats</p>
                    <p>Displaying {totalPlanes}/{stats.data.totalPlanes}</p>
                    <p>In Air {stats.data.inAir}</p>
                    <p>On Ground {stats.data.totalPlanes - stats.data.inAir}</p>
                    <p>Traffic {Math.floor((stats.data.totalPlanes - (stats.data.totalPlanes - stats.data.inAir)) / (stats.data.totalPlanes) * 100)}%</p>
                    <p className="text-center bg-blue-900 bg-opacity-60">Air Spaces</p>
                    <p>US {stats.data.zoneUs}</p>
                    <p>EU {stats.data.zoneEu}</p>
                    <p>Other {stats.data.totalPlanes - stats.data.zoneEu - stats.data.zoneUs}</p>
                </div>
            </div>);
    }

}

function areEqual(prevProps: Props, nextProps: Props) {
    if (!prevProps.plane && !nextProps.plane) {
        return prevProps.totalPlanes === nextProps.totalPlanes
    }
    return prevProps.plane?.icao24 === nextProps.plane?.icao24 || prevProps.plane?.trueTrack === nextProps.plane?.trueTrack;
}

export default memo(SideBar, areEqual);