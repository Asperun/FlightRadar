import type { DivIcon } from 'leaflet';
import { divIcon } from 'leaflet';
import Image from 'next/image';
import type { ReactElement } from 'react';
import { memo, useMemo, useState } from 'react';
// @ts-ignore
import { renderToString } from 'react-dom/server';
import { Tooltip } from 'react-leaflet';
import ReactLeafletDriftMarker from 'react-leaflet-drift-marker';

import planeImgOrange from '../public/plane-orange.webp';
import type { Plane, PlaneDetails } from '../types/plane';

type Props = {
  plane: Plane;
  setSelectedPlane: (plane: PlaneDetails | null) => void;
};

const PlaneMarker = ({ plane, setSelectedPlane }: Props): JSX.Element => {
  const [tooltip, setTooltip] = useState<boolean>(false);

  function MarkerIcon(): ReactElement {
    return (
      <Image
        width={32}
        height={32}
        style={{ transform: `rotate(${plane.trueTrack}deg)` }}
        className={`click:hue-rotate-60 overflow-hidden hover:hue-rotate-60 ${plane.isSelected === true && 'hue-rotate-90'}`}
        src={planeImgOrange.src}
        alt='plane.webp'
      />
    );
  }
  const orangePlaneIcon: DivIcon = useMemo(
    () =>
      divIcon({
        className: 'overflow-hidden',
        iconSize: [32, 32],
        html: renderToString(<MarkerIcon />)
      }),
    [Math.floor(plane.trueTrack % 5) === 0, plane.isSelected]
  );

  return (
    <ReactLeafletDriftMarker
      position={[plane.latitude, plane.longitude]}
      icon={orangePlaneIcon}
      eventHandlers={{
        mouseover: () => {
          setTooltip(true);
        },
        mouseout: () => {
          setTooltip(false);
        },
        click: () => {
          setSelectedPlane(plane as PlaneDetails);
        }
      }}
      duration={8000}>
      {tooltip && <Tooltip direction={'top'}>{plane.callSign}</Tooltip>}
    </ReactLeafletDriftMarker>
  );
};

function areEqual(prevProps: Props, nextProps: Props): boolean {
  if (nextProps.plane.isSelected) {
    return false;
  }
  return (
    prevProps.plane.longitude === nextProps.plane.longitude &&
    prevProps.plane.latitude === nextProps.plane.latitude &&
    prevProps.plane.isSelected === nextProps.plane.isSelected
  );
}

export default memo(PlaneMarker, areEqual);
