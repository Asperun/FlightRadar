import { MapContainer, Polyline, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { memo, useRef, useState } from "react";
import { subscribeToPlaneUpdates } from "../service/requestHelper";
import { MapData, Plane } from "../types/plane";
import dynamic from "next/dynamic";
import { useSelectedPlane } from "../hooks/useSelectedPlane";
import { useRouter } from "next/router";
import { Map as LeafletMap } from "leaflet";
import { getPath } from "../service";

// Split conditionaly rendered components to separate chunks
const DynamicSideBar = dynamic(() => import("./SideBar"), { ssr: false });
const DynamicMarker = dynamic(() => import("./PlaneMarker"), { ssr: false });

const maxPlanesToFetch = 300;

const InteractiveMap = (): JSX.Element => {
  const { setSelectedPlane, getSelectedPlane, updateSelectedPlane } = useSelectedPlane();
  const mapRef = useRef<LeafletMap | null>(null);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const [mapData, setMapData] = useState<MapData>({ planes: [], amountReceived: 0 });
  const router = useRouter();

  const updateCoordinates = () => {
    const currentMap = mapRef.current;
    if (!currentMap) return;
    updateUrl(currentMap.getCenter().lat, currentMap.getCenter().lng, currentMap.getZoom());

    const bounds = currentMap.getBounds();

    if (eventSource && eventSource instanceof EventSource) {
      eventSource.close();
    }

    const newStream = subscribeToPlaneUpdates(
      bounds.getSouthWest().lat,
      bounds.getSouthWest().lng,
      bounds.getNorthEast().lat,
      bounds.getNorthEast().lng,
      maxPlanesToFetch
    );
    newStream.onmessage = processData;

    setEventSource(newStream);
  };

  const selectedPlane = getSelectedPlane();

  const processData = (e: { data: string }): void => {
    const response: Plane[] = JSON.parse(e.data).planes;
    const planesReceived: number = response.length;

    if (selectedPlane) {
      const selectedPlaneIndex = response.findIndex((p) => p.icao24 === selectedPlane.icao24);
      if (selectedPlaneIndex !== -1) {
        const matchedPlane = response[selectedPlaneIndex];
        updateSelectedPlane(matchedPlane);
      }
    }
    setMapData({ planes: response, amountReceived: planesReceived });
  };

  const renderPlanes = () => {
    let recentFetchedPlanes = [...mapData.planes];
    if (!recentFetchedPlanes) return;

    let currentSelected = null;
    if (selectedPlane) {
      const selectedPlaneIndex = recentFetchedPlanes.findIndex(
        (plane) => plane.icao24 === selectedPlane.icao24
      );

      if (selectedPlaneIndex > -1) {
        // recentFetchedPlanes[selectedPlaneIndex].isSelected = true;
        recentFetchedPlanes.splice(selectedPlaneIndex, 1);
      }

      currentSelected = (
        <DynamicMarker
          key={selectedPlane?.icao24}
          plane={selectedPlane}
          setSelectedPlane={setSelectedPlane}
        />
      );
    }

    return [
      currentSelected,
      ...recentFetchedPlanes.map((plane: Plane, i: number) => {
        return (
          plane.callSign && (
            <DynamicMarker
              // key={i}
              key={plane.icao24}
              plane={plane}
              setSelectedPlane={setSelectedPlane}
            />
          )
        );
      }),
    ];
  };

  // Base marker to handle mouse movement
  const LocationMarker = memo(
    function LocationMarker() {
      useMapEvents({
        moveend(e) {
          updateCoordinates();
        },
      });
      return null;
    },
    () => true
  );

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      className="w-screen max-w-full h-screen max-h-screen"
    >
      <MapContainer
        doubleClickZoom={false}
        center={[router.query.x ? +router.query.x : 51.505, router.query.y ? +router.query.y : 19]}
        zoom={router.query.z ? +router.query.z : 7}
        zoomControl={false}
        scrollWheelZoom={true}
        minZoom={3}
        preferCanvas={true}
        whenCreated={(mapInstance) => {
          mapRef.current = mapInstance;
          updateCoordinates();
        }}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url={`https://api.mapbox.com/styles/v1/fantasm/ckwwgvv1afty214ocxjqoh1bj/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZmFudGFzbSIsImEiOiJja3d3Z3M0NjYwM2xwMnZsY3BkNWlhejA4In0.LOXrdlU8qMW5KHAPhPSO5A`}
          attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>'
        />
        <LocationMarker />
        {renderPlanes()}
        {selectedPlane &&
          selectedPlane.flights &&
          selectedPlane.flights.length > 0 &&
          selectedPlane.flights[0].checkpoints && (
            <Polyline
              interactive={false}
              positions={getPath(selectedPlane)}
              pathOptions={{
                interactive: false,
                color: "lime",
                bubblingMouseEvents: false,
                lineJoin: "round",
                opacity: 0.8,
                weight: 3,
              }}
            />
          )}
      </MapContainer>
      <DynamicSideBar
        plane={selectedPlane || undefined}
        setSelectedPlane={setSelectedPlane}
        totalPlanes={mapData.amountReceived}
      />
    </div>
  );
};

function updateUrl(x: number, y: number, z: number) {
  const url = new URL(window.location.href);
  url.searchParams.set("x", x.toString());
  url.searchParams.set("y", y.toString());
  url.searchParams.set("z", z.toString());
  window.history.replaceState({}, "", url.toString());
}

export default InteractiveMap;
