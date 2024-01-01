import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

import type { Map as LeafletMap } from 'leaflet';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { memo, useEffect, useRef, useState } from 'react';
import { MapContainer, Polyline, TileLayer, useMapEvents } from 'react-leaflet';

import { useMapSettings } from '../hooks/useMapSettings';
import { useSelectedPlane } from '../hooks/useSelectedPlane';
import { getPath } from '../service';
import { subscribeToUpdates } from '../service/requestUtils';
import type { MapData, Plane } from '../types/plane';

const DynamicSideBar = dynamic(() => import('./SideBar'), { ssr: false });
const DynamicMarker = dynamic(() => import('./PlaneMarker'), { ssr: false });
const DynamicMapSettings = dynamic(() => import('./MapSettings'), { ssr: false });

const InteractiveMap = (): JSX.Element => {
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const [mapData, setMapData] = useState<MapData>({ planes: [], amountReceived: 0 });
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const { setSelectedPlane, getSelectedPlane, updateSelectedPlane } = useSelectedPlane();
  const { maxPlanes, showPaths, showLanded } = useMapSettings();
  const router = useRouter();

  const selectedPlane = getSelectedPlane();

  const processServerResponse = (e: { data: string }): void => {
    const response: Plane[] = JSON.parse(e.data).planes;
    const planesReceived: number = response.length;
    setMapData({ planes: response, amountReceived: planesReceived });
  };

  function updateUrl(x: number, y: number, z: number) {
    const url = new URL(window.location.href);
    url.searchParams.set('x', x.toString());
    url.searchParams.set('y', y.toString());
    url.searchParams.set('z', z.toString());
    window.history.replaceState({}, '', url.toString());
  }

  const updateCoordinates = () => {
    const currentMap = mapRef.current;
    if (!currentMap) return;
    updateUrl(currentMap.getCenter().lat, currentMap.getCenter().lng, currentMap.getZoom());

    const bounds = currentMap.getBounds();

    if (eventSource && eventSource instanceof EventSource) {
      eventSource.close();
    }

    const newStream = subscribeToUpdates(
      bounds.getSouthWest().lat,
      bounds.getSouthWest().lng,
      bounds.getNorthEast().lat,
      bounds.getNorthEast().lng,
      maxPlanes,
      showLanded
    );
    newStream.onmessage = processServerResponse;
    newStream.onerror = () => {
      setError('Resource temporarily unavailable');
    };

    setEventSource(newStream);
  };

  useEffect(() => {
    if (selectedPlane) {
      const selectedPlaneIndex = mapData.planes.findIndex((p) => p.icao24 === selectedPlane.icao24);
      if (selectedPlaneIndex !== -1) {
        const matchedPlane = mapData.planes[selectedPlaneIndex];
        updateSelectedPlane(matchedPlane!);
      }
    }
  }, [mapData]);

  useEffect(() => {
    setTimeout(() => {
      updateCoordinates();
    }, 750);
  }, []);

  const renderPlanes = () => {
    const recentFetchedPlanes = [...mapData.planes];
    if (!recentFetchedPlanes) return;

    let currentSelected = null;
    if (selectedPlane) {
      const selectedPlaneIndex = recentFetchedPlanes.findIndex((plane) => plane.icao24 === selectedPlane.icao24);

      if (selectedPlaneIndex > -1) {
        recentFetchedPlanes.splice(selectedPlaneIndex, 1);
      }

      currentSelected = <DynamicMarker key={selectedPlane.icao24} plane={selectedPlane} setSelectedPlane={setSelectedPlane} />;
    }

    // eslint-disable-next-line consistent-return
    return [
      currentSelected,
      ...recentFetchedPlanes.map((plane) => {
        return plane.callSign && <DynamicMarker key={plane.icao24} plane={plane} setSelectedPlane={setSelectedPlane} />;
      })
    ];
  };

  const renderPath = () => {
    if (!selectedPlane || !selectedPlane.flights || selectedPlane.flights.length === 0 || !selectedPlane.flights[0]?.checkpoints) return null;
    return (
      <Polyline
        interactive={false}
        positions={getPath(selectedPlane)}
        pathOptions={{
          interactive: false,
          color: 'lime',
          bubblingMouseEvents: false,
          lineJoin: 'round',
          opacity: 0.8,
          weight: 3
        }}
      />
    );
  };

  // Base marker to handle mouse movement
  const LocationMarker = memo(
    function LocationMarker() {
      useMapEvents({
        moveend() {
          updateCoordinates();
        }
      });
      return null;
    },
    () => true
  );

  return (
    <div onContextMenu={(e) => e.preventDefault()} className={`h-screen max-h-screen w-screen max-w-full ${error && 'opacity-50'}`}>
      <MapContainer
        doubleClickZoom={false}
        center={[router.query.x ? +router.query.x : 51.505, router.query.y ? +router.query.y : 19]}
        zoom={router.query.z ? +router.query.z : 7}
        zoomControl={false}
        scrollWheelZoom={true}
        minZoom={3}
        preferCanvas={true}
        ref={mapRef}
        style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url={`https://api.mapbox.com/styles/v1/fantasm/ckwwgvv1afty214ocxjqoh1bj/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZmFudGFzbSIsImEiOiJja3d3Z3M0NjYwM2xwMnZsY3BkNWlhejA4In0.LOXrdlU8qMW5KHAPhPSO5A`}
          attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>'
        />
        <LocationMarker />
        {error ? <h1 className={'absolute inset-x-0 top-1/2 z-[1000] mx-auto w-fit bg-gray-800 p-10 text-3xl'}>{error}</h1> : renderPlanes()}
        {!error && showPaths && renderPath()}
      </MapContainer>
      {!error && <DynamicSideBar plane={selectedPlane || undefined} setSelectedPlane={setSelectedPlane} totalPlanes={mapData.amountReceived} />}
      <DynamicMapSettings className={'absolute top-5 right-5 z-[1000] flex flex-col items-end justify-center gap-4'} />
    </div>
  );
};

export default InteractiveMap;
