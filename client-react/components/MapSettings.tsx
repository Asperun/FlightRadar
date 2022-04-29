import { HTMLProps, useEffect, useState } from "react";
import { BsFillGearFill } from "react-icons/bs";
import { useMapSettings } from "../hooks/useMapSettings";

interface Props extends HTMLProps<any> {}

const MapSettings = (props: Props): JSX.Element => {
  const [isHidden, setIsHidden] = useState(true);
  const { maxPlanes, setMaxPlanes, showPaths, setShowPaths, showLanded, setShowLanded } = useMapSettings();

  useEffect(() => {
    const maxPlanes = localStorage.getItem("maxPlanes");
    if (maxPlanes) {
      setMaxPlanes(parseInt(maxPlanes));
    }
    const showLandedPlanes = localStorage.getItem("showLandedPlanes");
    if (showLandedPlanes) {
      setShowLanded(showLandedPlanes === "true");
    }
    const showPaths = localStorage.getItem("showPaths");
    if (showPaths) {
      setShowPaths(showPaths === "true");
    }
  }, []);

  const handleGearsClick = (): void => {
    setIsHidden(!isHidden);
  };

  return (
    <div {...props}>
      <BsFillGearFill size={32} onClick={handleGearsClick} className={"hover:text-sky-600 cursor-pointer"} />
      {!isHidden && (
        <div className={"p-2 bg-gray-800 rounded-md bg-opacity-70 flex flex-col gap-2"}>
          <div>
            <label>Max planes:</label>
            <input type="number" min={1} max={300} value={maxPlanes} onChange={(e): void => setMaxPlanes(Math.max(1, Number(e.target.value)))} />
          </div>
          <div>
            <label>Show paths:</label>
            <input type="checkbox" checked={showPaths} onChange={(e): void => setShowPaths(e.target.checked)} />
          </div>
          <div>
            <label>Show landed:</label>
            <input type="checkbox" checked={showLanded} onChange={(e): void => setShowLanded(e.target.checked)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MapSettings;
