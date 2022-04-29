import { useRecoilState } from "recoil";
import { maxPlanesState, showLandedState, showPathsState } from "../atoms/settingsAtom";

export const useMapSettings = () => {
  const [maxPlanes, setMaxPlanes] = useRecoilState(maxPlanesState);
  const [showPaths, setShowPaths] = useRecoilState(showPathsState);
  const [showLanded, setShowLanded] = useRecoilState(showLandedState);

  const setMaxPlanesInternal = (maxPlanes: number) => {
    localStorage.setItem("maxPlanes", maxPlanes.toString());
    setMaxPlanes(maxPlanes);
  };

  const setShowLandedPlanesInternal = (showLandedPlanes: boolean) => {
    localStorage.setItem("showLandedPlanes", showLandedPlanes.toString());
    setShowLanded(showLandedPlanes);
  };

  const setShowPathsInternal = (showPaths: boolean) => {
    localStorage.setItem("showPaths", showPaths.toString());
    setShowPaths(showPaths);
  };

  return {
    maxPlanes,
    setMaxPlanes: setMaxPlanesInternal,
    showLanded,
    setShowLanded: setShowLandedPlanesInternal,
    showPaths,
    setShowPaths: setShowPathsInternal,
  };
};
