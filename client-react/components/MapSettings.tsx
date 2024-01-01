import type { HTMLProps } from 'react';
import { useEffect, useState } from 'react';
import { BsFillGearFill } from 'react-icons/bs';

import { useMapSettings } from '../hooks/useMapSettings';

interface Props extends HTMLProps<any> {}

const MapSettings = (props: Props): JSX.Element => {
  const [isHidden, setIsHidden] = useState(true);
  const { maxPlanes, setMaxPlanes, showPaths, setShowPaths, showLanded, setShowLanded } = useMapSettings();

  useEffect(() => {
    const maxPlanesStorage = localStorage.getItem('maxPlanes');
    if (maxPlanesStorage) {
      setMaxPlanes(parseInt(maxPlanesStorage, 10));
    }
    const showLandedPlanes = localStorage.getItem('showLandedPlanes');
    if (showLandedPlanes) {
      setShowLanded(showLandedPlanes === 'true');
    }
    const showPathsStorage = localStorage.getItem('showPaths');
    if (showPathsStorage) {
      setShowPaths(showPathsStorage === 'true');
    }
  }, []);

  const handleGearsClick = (): void => {
    setIsHidden(!isHidden);
  };

  return (
    <div {...props}>
      <BsFillGearFill size={32} onClick={handleGearsClick} className={'cursor-pointer hover:text-sky-600'} />
      {!isHidden && (
        <div className={'flex flex-col gap-2 rounded-md bg-gray-800/70 p-2'}>
          <div>
            <span>Max planes:</span>
            <input type='number' min={1} max={300} value={maxPlanes} onChange={(e): void => setMaxPlanes(Math.max(1, Number(e.target.value)))} />
          </div>
          <div>
            <span>Show paths:</span>
            <input type='checkbox' checked={showPaths} onChange={(e): void => setShowPaths(e.target.checked)} />
          </div>
          <div>
            <span>Show landed:</span>
            <input type='checkbox' checked={showLanded} onChange={(e): void => setShowLanded(e.target.checked)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MapSettings;
