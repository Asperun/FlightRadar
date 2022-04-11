import { Tooltip } from "react-leaflet";
import { DivIcon, divIcon } from "leaflet";
import planeImgOrange from "../public/plane-orange.webp";
import { memo, ReactElement, useMemo, useState } from "react";
import ReactLeafletDriftMarker from "react-leaflet-drift-marker";
import { Plane } from "../types/plane";
import { renderToString } from "preact-render-to-string";
import Image from "next/image";

type Props = {
  plane: Plane;
  setSelectedPlane: any;
};

const PlaneMarker = ({ plane, setSelectedPlane }: Props): JSX.Element => {
  const [tooltip, setTooltip] = useState<boolean>(false);

  // Only update icon if plane rotated more than 5 degree or has been selected
  const orangePlaneIcon: DivIcon = useMemo(
    () =>
      divIcon({
        className: "overflow-hidden",
        iconSize: [32, 32],
        html: renderToString(<MarkerIcon />),
      }),
    [Math.floor(plane.trueTrack / 5), plane.isSelected]
  );

  function MarkerIcon(): ReactElement {
    return (
      <div>
        <Image
          priority
          layout={"fixed"}
          width="32"
          height="32"
          style={{ transform: `rotate(${plane.trueTrack}deg)` }}
          className={`hover:hue-rotate-60 click:hue-rotate-60 overflow-hidden ${
            plane.isSelected === true && "hue-rotate-90"
          }`}
          src={planeImgOrange}
          alt="plane.png"
        />
      </div>
    );
  }

  return (
    <>
      <ReactLeafletDriftMarker
        position={[plane.latitude, plane.longitude]}
        icon={orangePlaneIcon}
        eventHandlers={{
          mouseover: (e) => {
            setTooltip(true);
          },
          mouseout: (e) => {
            setTooltip(false);
          },
          click: (e) => {
            setSelectedPlane(plane);
          },
        }}
        duration={8000}
      >
        {tooltip && <Tooltip direction={"top"}>{plane.callSign}</Tooltip>}
      </ReactLeafletDriftMarker>
    </>
  );
};

function areEqual(prevProps: Props, nextProps: Props): boolean {
  return (
    prevProps.plane.longitude === nextProps.plane.longitude &&
    prevProps.plane.latitude === nextProps.plane.latitude &&
    prevProps.plane.isSelected === nextProps.plane.isSelected
  );
}

export default memo(PlaneMarker, areEqual);

// export default PlaneMarker;
