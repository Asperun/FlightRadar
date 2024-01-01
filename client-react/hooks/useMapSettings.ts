import { useRecoilState } from 'recoil';

import { maxPlanesState, showLandedState, showPathsState } from '../atoms/settingsAtom';

export const useMapSettings = () => {
  const [maxPlanes, setMaxPlanes] = useRecoilState(maxPlanesState);
  const [showPaths, setShowPaths] = useRecoilState(showPathsState);
  const [showLanded, setShowLanded] = useRecoilState(showLandedState);

  const setMaxPlanesInternal = (amount: number) => {
    localStorage.setItem('maxPlanes', amount.toString());
    setMaxPlanes(amount);
  };

  const setShowLandedPlanesInternal = (showLandedPlanes: boolean) => {
    localStorage.setItem('showLandedPlanes', showLandedPlanes.toString());
    setShowLanded(showLandedPlanes);
  };

  const setShowPathsInternal = (value: boolean) => {
    localStorage.setItem('showPaths', value.toString());
    setShowPaths(value);
  };

  return {
    maxPlanes,
    setMaxPlanes: setMaxPlanesInternal,
    showLanded,
    setShowLanded: setShowLandedPlanesInternal,
    showPaths,
    setShowPaths: setShowPathsInternal
  };
};
