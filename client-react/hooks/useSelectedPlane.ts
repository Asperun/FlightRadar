import { useEffect, useState } from "react";
import { Plane, PlaneDetails } from "../types/plane";
import {
  fetchManufactuerDetails,
  fetchPlaneImage,
  fetchTrackDetails,
} from "../service/requestHelper";

export const useSelectedPlane = () => {
  // This is our internal state
  const [selectedPlane, setSelectedPlane] = useState<PlaneDetails | null>(null);

  // This is our external state to expose to the rest of the app
  const [planeDetails, setPlaneDetails] = useState<PlaneDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Update plane details everytime the selected plane changes
  useEffect(() => {
    if (!selectedPlane) return;
    fetchAdditionalPlaneData();
    return () => {
      setSelectedPlane(null);
    };
  }, [selectedPlane]);

  const fetchAdditionalPlaneData = async () => {
    const icao24 = selectedPlane?.icao24;
    if (!icao24) return;
    setLoading(true);

    // we need to make 3 fetch requests to get the all plane details
    // 1. PlaneSpotterApi - for picture
    // 2. OpenSkyNetwork - for plane manufacture details
    // 3. Fantasea backend - for track details
    // 4. Merge all responses into one object and expose
    const imagePromise = fetchPlaneImage(icao24);
    const manufacturerPromise = fetchManufactuerDetails(icao24);
    const trackPromise = fetchTrackDetails(icao24);

    // Make 3 requests
    // Sometimes one of them returns null, but it's ok
    const [imageData, manufacturerData, trackData] = await Promise.all([
      imagePromise,
      manufacturerPromise,
      trackPromise,
    ]);

    // if(icao24 !== selectedPlane?.icao24) { setLoading(false); return}; // second check if the plane has changed

    const temp: PlaneDetails = {
      ...imageData,
      ...manufacturerData,
      ...trackData,
      isSelected: true,
    };

    console.log(temp);

    setPlaneDetails(temp);

    setLoading(false);
  };

  const setSelectedPlaneFromOutside = (plane: PlaneDetails | null) => {
    if (loading) return; // don't update if we are fetching
    setSelectedPlane(plane);
    if (plane === null) setPlaneDetails(null);
  };

  const getSelectedPlaneFromOutside = (): PlaneDetails | null => {
    if (!planeDetails || loading) return null;
    return planeDetails;
  };

  const updateSelectedPlaneFromOutside = (plane: Plane) => {
    console.log("updated object", { ...planeDetails, ...plane }.longitude);
    if (loading) return;
    // let currentPlane = planeDetails
    // currentPlane.latitude = plane.latitude
    // currentPlane.longitude = plane.longitude
    // setPlaneDetails({...planeDetails,latitude:plane.latitude,longitude:plane.longitude})
  };

  return {
    setSelectedPlane: setSelectedPlaneFromOutside,
    getSelectedPlane: getSelectedPlaneFromOutside,
    updateSelectedPlane: updateSelectedPlaneFromOutside,
  };
};
