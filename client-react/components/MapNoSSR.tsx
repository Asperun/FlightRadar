import {MapContainer, TileLayer, useMapEvents,} from "react-leaflet";
import {useEffect, useRef, useState} from "react";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import SideBar from "./SideBar";
import {Map as LeafletMap} from "leaflet";
import {Plane} from "../types/plane";
import PlaneMarker from "./PlaneMarker";

const MapNoSSR = () => {
    const [mapData, setMapData] = useState<Plane[] | null>(null);
    const [numPlanes, setNumPlanes] = useState<number>(400);
    const [selectedPlane, setSelectedPlane] = useState<Plane | null>(null);
    const mapRef = useRef<LeafletMap | null>(null);
    const eventSource = useRef<EventSource | null>(null);

    useEffect(() => {
        console.log("UseEffect");
         subscribeToSSE();
        // fetch initial planes from server
    }, []);

    const subscribeToSSE = () => {
        // ensure current connection is done zo
        if (eventSource.current) eventSource.current.close();

        let bounds = mapRef.current?.getBounds();

        // if map is not set bounds will be undefined
        if (!bounds) return;

        eventSource.current = new EventSource(`https://localhost:5001/api/v1/planes/subscribeToPlanes?minLat=${bounds.getSouthWest().lat}&maxLat=${bounds.getNorthEast().lat}&minLong=${bounds.getSouthWest().lng}&maxLong=${bounds.getNorthEast().lng}&limitPlanes=${numPlanes}`);

        eventSource.current.onmessage = ({data}) => {
            const planes: Plane[] = JSON.parse(data).planes;
            setMapData(planes);
        };
    };

    const renderPlanes = () => {
        return mapData?.map((plane, i) => {
            return plane.longitude && plane.latitude ? (<PlaneMarker
                key={i}
                plane={plane}
                setSelectedPlane={setSelectedPlane}
            />) : null;
        });
    };

    return (<div className="flex flex-col h-screen w-screen">
        <MapContainer
            center={[51.505, -0.09]}
            zoom={7}
            scrollWheelZoom={true}
            minZoom={3}
            style={{height: "100%", width: "100%"}}
            whenCreated={(mapInstance) => {
                mapRef.current = mapInstance;
            }}
        >
            <TileLayer
                url={`https://api.mapbox.com/styles/v1/fantasm/ckwwgvv1afty214ocxjqoh1bj/tiles/256/{z}/{x}/{y}@2x?access_token=${process.env.NEXT_PUBLIC_MAPBOX_API_KEY}`}
                attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>'
                noWrap={true}
            />
            {mapData && renderPlanes()}
            <LocationMarker /> {/*Handling map dragging events*/}
            {/*<SideBar />*/}
        </MapContainer>
    </div>);

    function LocationMarker() {
        const map = useMapEvents({
            moveend(e) {
                subscribeToSSE();
            },
        });
        return null;
    }
};

export default MapNoSSR;
