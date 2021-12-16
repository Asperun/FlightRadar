import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import { useEffect, useMemo, useRef } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import SideBar from "./SideBar";

const MapNoSSR = () => {
  // const [mapData, setMapData] = useState(null);
  const markerRef = useRef(null);
  const mapRef = useRef(null);
  var eventSource = null;

  const dragHandlers = useMemo(
    () => ({
      click: () => {
        console.log("Click!");
        subscribeToSSE();
      },

      moveend: () => {
        console.log("moveEnd");
      },
    }),
    []
  );

  useEffect(() => {
    subscribeToSSE();
  }, []);

  const subscribeToSSE = () => {
    if (eventSource) {
      console.log("Closing event source");
      eventSource.close();
    }

    const bounds = mapRef.current?.getBounds();

    if (!bounds) return;

    eventSource = new EventSource(
      `https://localhost:5001/api/v1/planes/subscribeToPlanes?minLat=${bounds._southWest.lat}&maxLat=${bounds._northEast.lat}&minLong=${bounds._southWest.lng}&maxLong=${bounds._northEast.lng}&limitPlanes=20`
    );
    eventSource.onmessage = ({ data }) => {
      // console.log(data);
      console.log("new msg");
    };
  };

  return (
    <div class="">
      <MapContainer
        center={[51.505, -0.09]}
        zoom={7}
        scrollWheelZoom={true}
        minZoom={3}
        style={{ height: "100%", width: "100%" }}
        eventHandlers={dragHandlers}
        whenCreated={(mapInstance) => {
          mapRef.current = mapInstance;
        }}
      >
        <TileLayer
          url={`https://api.mapbox.com/styles/v1/fantasm/ckwwgvv1afty214ocxjqoh1bj/tiles/256/{z}/{x}/{y}@2x?access_token=${process.env.NEXT_PUBLIC_MAPBOX_API_KEY}`}
          attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>'
        />
        {/* {planes && renderPlanes()} */}
        <LocationMarker />

        <Marker
          ref={markerRef}
          position={[40.8054, -74.0241]}
          draggable={true}
          eventHandlers={dragHandlers}
          animate={true}
        >
          {console.log("Rendering marker")}
          <Popup>Hey ! you found me</Popup>
        </Marker>
      </MapContainer>
      <SideBar />
    </div>
  );

  function LocationMarker() {
    const map = useMapEvents({
      moveend(e) {
        subscribeToSSE();
      },
    });
    // return position === null ? null : (
    //   <Marker position={position}>
    //     <Popup>You are here</Popup>
    //   </Marker>
    return null;
  }
};

export default MapNoSSR;
