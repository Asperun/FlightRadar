import { useEffect, useState } from "react";
import { Plane, PlaneDetails } from "../types/plane";
import { fetchManufacturerDetails, fetchPlaneImage, fetchTrackDetails } from "../service/requestUtils";

export const useSelectedPlane = () => {
  const [selectedPlane, setSelectedPlane] = useState<PlaneDetails | null>(null);
  const [planeDetails, setPlaneDetails] = useState<PlaneDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!selectedPlane) return;
    fetchAdditionalPlaneData(selectedPlane.icao24);
    return () => {
      setSelectedPlane(null);
    };
  }, [selectedPlane]);

  const fetchAdditionalPlaneData = async (icao24: string) => {
    if (!icao24) throw new Error("No ICAO24 provided");
    setLoading(true);

    // We need to make 3 fetch requests to get the all needed plane data and merge it into one object, then mark it as selected
    // 1. PlaneSpotterApi - for picture
    // 2. OpenSkyNetwork - for plane manufacturer details
    // 3. Fantasea backend - for track details
    const imagePromise = fetchPlaneImage(icao24);
    const manufacturerPromise = fetchManufacturerDetails(icao24);
    const trackPromise = fetchTrackDetails(icao24);

    const [imageData, manufacturerData, trackData] = await Promise.all([imagePromise, manufacturerPromise, trackPromise]);

    const merged: PlaneDetails = {
      ...imageData,
      ...manufacturerData,
      ...trackData,
      isSelected: true,
    };

    setPlaneDetails(merged);
    setLoading(false);
  };

  const setSelectedPlaneFromOutside = (plane: PlaneDetails | null) => {
    if (loading) return;
    setSelectedPlane(plane);
    if (plane === null) setPlaneDetails(null);
  };

  const getSelectedPlaneFromOutside = (): PlaneDetails | null => {
    if (!planeDetails || loading) return null;
    return planeDetails;
  };

  const updateSelectedPlaneFromOutside = (plane: Plane): void => {
    if (loading) return;
    setPlaneDetails({
      ...planeDetails,
      longitude: plane.longitude,
      latitude: plane.latitude,
    } as PlaneDetails);
  };

  return {
    setSelectedPlane: setSelectedPlaneFromOutside,
    getSelectedPlane: getSelectedPlaneFromOutside,
    updateSelectedPlane: updateSelectedPlaneFromOutside,
  };
};
