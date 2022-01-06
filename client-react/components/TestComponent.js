import { MapContainer, Polyline, TileLayer, useMapEvents, } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { memo, useCallback, useReducer, useRef, useState } from "react";
import SideBar from "./SideBar";
import PlaneMarker from "./PlaneMarker";

function TestComponent( props ) {
  const [selectedPlane, setSelectedPlane] = useState(null);
  // const [mapData, setMapData]             = useState([]);
  const [numPlanes, setNumPlanes]         = useState(400);
  const [_, forceUpdate]                  = useReducer(( x ) => x + 1, 0);

  const mapRef      = useRef(null);
  const eventSource = useRef(null);
  const mapData     = useRef({planes: [], amountReceived: 0});

  const updateSelectedPlane = useCallback(( plane ) => {
    console.log("setting selected plane=%o", plane);
    setSelectedPlane(plane)
  }, []);

  function subscribeToSSE() {
    if (eventSource.current) eventSource.current.close();
    const bounds = mapRef.current?.getBounds();
    if (!bounds) return;

    eventSource.current           = new EventSource(`https://localhost:5001/api/v1/planes/subscribeToPlanes?minLat=${bounds.getSouthWest().lat}&maxLat=${bounds.getNorthEast().lat}&minLong=${bounds.getSouthWest().lng}&maxLong=${bounds.getNorthEast().lng}&limitPlanes=${numPlanes}`);
    eventSource.current.onmessage = processData;
  }

  const processData = ( e ) => {
    const response       = JSON.parse(e.data).planes;
    const planesReceived = response.length;
    let currentPlanes    = mapData.current.planes;

    for (let i = currentPlanes.length; i-- > 0;) {
      const index = response.findIndex(plane => plane.icao24 === currentPlanes[i].icao24);

      if (index !== -1) { // we have a match -- update
        currentPlanes[i] = response[index];
        response.splice(index, 1); // remove it from the list;
      } else {
        // delete currentPlanes[i]; // remove it from the list but preserve index
        currentPlanes[i].callSign = null;
      }
    }
    currentPlanes   = [...currentPlanes, ...response];
    mapData.current = {planes: currentPlanes, amountReceived: planesReceived};
    forceUpdate()
  }

  function renderPlanes() {
    return mapData.current.planes.map(( plane, i ) => plane.callSign && <PlaneMarker
                                          key={i}
                                          plane={plane}
                                          setSelectedPlane={updateSelectedPlane}
                                      />
    );
  }

  const LocationMarker = memo(function LocationMarker( props ) {
    useMapEvents({
                   moveend( e ) {
                     subscribeToSSE();
                   },
                   click( e ) {
                     console.log(`lat=${e.latlng.lat} long=${e.latlng.lng}`);
                   }
                 });
    return null;
  }, () => true)

  return (
      // <div onContextMenu={( e ) => e.preventDefault()}
      <div className="flex flex-row h-full relative">
        {console.log("%cRerender Main", "color: green")}
        <div className="border-2 border-red-800 basis-full">
          <MapContainer center={[51.505, 19]}
                        zoom={7}
                        zoomControl={false}
                        scrollWheelZoom={true}
                        minZoom={3}
                        preferCanvas={true}
                        whenCreated={( mapInstance ) => {
                          mapRef.current = mapInstance;
                          subscribeToSSE();
                        }}
                        style={{height: "100%", width: "100%"}}

          >
            <TileLayer url={`https://api.mapbox.com/styles/v1/fantasm/ckwwgvv1afty214ocxjqoh1bj/tiles/256/{z}/{x}/{y}@2x?access_token=${process.env.NEXT_PUBLIC_MAPBOX_API_KEY}`}
                       attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>' />
            {<LocationMarker />}
            {renderPlanes()}
            {/*<Polyline positions={[[selectedPlane?.latitude,selectedPlane?.longitude],[airportDept?.position.latitude,airportDept?.position.longitude]]} pathOptions={{ color: 'lime' }}  />*/}

            {/*{selectedPlane && <Polyline positions={[[selectedPlane?.latitude,selectedPlane?.longitude],[55,-24],[57,-20]]} pathOptions={{color: "lime", stroke: true, dashArray:[15,15], weight: 2 }}  />}*/}
            <SideBar plane={selectedPlane}
                     setSelectedPlane={updateSelectedPlane}
                     totalPlanes={mapData.current.amountReceived}
            />
          </MapContainer>
        </div>

      </div>
  )
}

export default memo(TestComponent, () => true);