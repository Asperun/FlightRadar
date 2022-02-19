import {MapContainer, Polyline, TileLayer, useMapEvents,} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import {memo, ReactElement, useCallback, useReducer, useRef, useState} from "react";
import SideBar from "./SideBar";
import PlaneMarker from "./PlaneMarker";
import {useApiPlaneDetails} from "../utils/requestHelper";
import {Plane} from "../types/plane";


const InteractiveMap = ():JSX.Element => {
    const [selectedPlane, setSelectedPlane] = useState<Plane | null>(null);
    const [numPlanes, setNumPlanes] = useState<number>(400);
    const [_, forceUpdate] = useReducer((x) => x + 1, 0);

    const mapRef = useRef(null);
    const eventSource = useRef<EventSource>(null);
    const mapData = useRef({planes: [], amountReceived: 0});

    const {data: planeInfo} = useApiPlaneDetails(selectedPlane?.icao24)

    const updateSelectedPlane = useCallback((plane: Plane) => {
        if (selectedPlane && mapData.current.planes) {
            const index = mapData.current.planes.findIndex(p => p.icao24 === selectedPlane.icao24);
            if (index > -1) {
                mapData.current.planes[index].isSelected = false;
            } else {
                selectedPlane.isSelected = false;
            }
        }

        if (plane) plane.isSelected = true;

        setSelectedPlane(plane)

    }, [selectedPlane]);

    function subscribeToSSE() {
        if (eventSource.current) eventSource.current.close();
        const bounds = mapRef.current?.getBounds();
        if (!bounds) return;

        eventSource.current = new EventSource(`https://fantasea.pl/api/v1/planes/subscribeToPlanes?minLat=${bounds.getSouthWest().lat}&minLong=${bounds.getSouthWest().lng}&maxLat=${bounds.getNorthEast().lat}&maxLong=${bounds.getNorthEast().lng}&limitPlanes=${numPlanes}`);
        eventSource.current.onmessage = processData;
    }

    const processData = (e: { data: string; }): void => {
        const response: Plane[] = JSON.parse(e.data).planes;
        const planesReceived: number = response.length;
        let currentPlanes: Plane[] = mapData.current.planes;


        for (let i = currentPlanes.length; i-- > 0;) {
            const index = response.findIndex(plane => plane.icao24 === currentPlanes[i].icao24);

            if (index !== -1) {
                currentPlanes[i] = {...currentPlanes[i], ...response[index]}
                response.splice(index, 1);
            } else {
                // delete currentPlanes[i]; // remove it from the list but preserve index
                currentPlanes[i].callSign = null;
            }
        }
        currentPlanes = [...currentPlanes, ...response];
        mapData.current = {planes: currentPlanes, amountReceived: planesReceived};
        forceUpdate()
    }

    function renderPlanes() {
        return mapData.current.planes.map((plane: Plane, i: number) => {
                return plane.callSign &&
                    <PlaneMarker key={i} plane={plane} setSelectedPlane={updateSelectedPlane} />
            }
        );
    }

    const LocationMarker = memo(function LocationMarker(props): ReactElement | null {
        useMapEvents({
            moveend(e) {
                subscribeToSSE();
            },
        });
        return null;
    }, () => true)

    return (
        <div onContextMenu={(e) => e.preventDefault()}
             className="flex flex-col h-screen relative w-screen">
            <div className="basis-full">
                <MapContainer center={[51.505, 19]}
                              zoom={7}
                              zoomControl={false}
                              scrollWheelZoom={true}
                              minZoom={3}
                              preferCanvas={true}
                              whenCreated={(mapInstance) => {
                                  mapRef.current = mapInstance;
                                  subscribeToSSE();
                              }}
                              style={{height: "100%", width: "100%"}}

                >
                    <TileLayer url={`https://api.mapbox.com/styles/v1/fantasm/ckwwgvv1afty214ocxjqoh1bj/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZmFudGFzbSIsImEiOiJja3d3Z3M0NjYwM2xwMnZsY3BkNWlhejA4In0.LOXrdlU8qMW5KHAPhPSO5A`}
                               attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>' />
                    {<LocationMarker />}
                    {renderPlanes()}

                    {planeInfo && planeInfo.flights?.length > 0 && planeInfo.flights[0].checkpoints?.length > 0 &&
                        <Polyline positions={getPath()}
                                  pathOptions={{
                                      interactive: false,
                                      color: "lime",
                                      bubblingMouseEvents: false,
                                      smoothFactor: 1.0,
                                      lineJoin: "round",
                                      opacity: 0.8,
                                      weight: 3
                                  }} />}
                </MapContainer>
                <SideBar plane={selectedPlane}
                         setSelectedPlane={updateSelectedPlane}
                         totalPlanes={mapData.current.amountReceived}
                />
            </div>

        </div>
    )

    function getPath() {
        const arr = planeInfo.flights[0].checkpoints.map((position) => [position.latitude, position.longitude]);
        arr.push([planeInfo.latitude, planeInfo.longitude])
        return arr;
    }
}

export default InteractiveMap;