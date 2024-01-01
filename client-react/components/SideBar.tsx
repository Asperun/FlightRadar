import Image from 'next/image';
import type { ReactElement } from 'react';
import { memo, useEffect, useState } from 'react';

import { blurredShimmer } from '../service';
import { convertCountryToAlpha2Code } from '../service/countryUtils';
import { fetchSidePanelStats } from '../service/requestUtils';
import type { PlaneDetails } from '../types/plane';

type Props = {
  plane?: PlaneDetails;
  totalPlanes: number;
  setSelectedPlane: (plane: PlaneDetails | null) => void;
  loading?: boolean;
};

// todo: rewrite to use day.js
const SideBar = ({ plane, totalPlanes, setSelectedPlane }: Props): JSX.Element | null => {
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSidePanelStats()
      .then((res) => setStats(res))
      .catch((err) => {
        setError(err.message);
      });

    const interval = setInterval(() => fetchSidePanelStats().then((res) => setStats(res)), 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (error) {
    return null;
  }

  if (plane) {
    return <RenderPlaneSidebar />;
  }
  return <RenderGenericSideBar />;

  function RenderPlaneSidebar(): ReactElement {
    const planeManufactuer: string = plane?.manufacturerIcao
      ? plane.manufacturerIcao.charAt(0) + plane.manufacturerIcao.substring(1).toLowerCase()
      : 'Unknown';

    let timeSinceStart: string | undefined;
    let distanceSinceStart: number | undefined;

    if (plane?.flights && plane.flights.length > 0 && plane.flights[0]?.checkpoints && plane.flights[0].checkpoints.length > 0) {
      const { checkpoints } = plane.flights[0];

      timeSinceStart = convertSeconds(
        Math.floor((Date.parse(new Date().toUTCString()) - 3600000 - Date.parse(checkpoints[0]?.creationTime as unknown as string)) / 1000)
      );

      distanceSinceStart = calcDistance(
        plane.latitude,
        plane.longitude,
        checkpoints[checkpoints.length - 1]?.latitude ?? 0,
        checkpoints[checkpoints.length - 1]?.longitude ?? 0
      );
      for (let i = 0; i < checkpoints.length - 1; i += 1) {
        distanceSinceStart += calcDistance(
          checkpoints[i]?.latitude ?? 0,
          checkpoints[i]?.longitude ?? 0,
          checkpoints[i + 1]?.latitude ?? 0,
          checkpoints[i + 1]?.longitude ?? 0
        );
      }
    }

    return (
      <aside className='no-scrollbar absolute inset-y-0 left-0 z-[1000] w-48 rounded-md border-2 border-sky-900 bg-black/75 text-white sm:inset-y-4 sm:left-4 sm:w-72'>
        <div className='no-scrollbar flex h-full w-full flex-col overflow-auto text-white'>
          <div className='no-scrollbar relative flex shrink-0 basis-56 flex-col overflow-auto'>
            <button
              className='absolute top-1 right-2 z-[10000]'
              onClick={() => {
                setSelectedPlane(null);
              }}>
              X
            </button>
            <div className='fade-to-right basis-2/12'>
              <div className='no-scrollbar ml-2 flex items-center text-3xl text-white'>
                {(plane?.country || plane?.regCountry) && (
                  <Image
                    className={'opacity-100'}
                    src={`https://hatscripts.github.io/circle-flags/flags/${convertCountryToAlpha2Code((plane.country || plane.regCountry)!)}.svg`}
                    alt={''}
                    title={plane.country}
                    width={28}
                    height={28}
                    quality={100}
                  />
                )}
                <div className={'ml-1 whitespace-nowrap text-orange-400'}>
                  {planeManufactuer || 'Unknown'} <span className={'text-white'}>{plane?.typecode || ''}</span>
                </div>
              </div>
            </div>
            <div className='relative flex h-full content-center items-center justify-center'>
              {plane?.url && <Image src={plane.url} placeholder={'blur'} blurDataURL={blurredShimmer(284, 188)} fill alt={'plane.png'} />}
              {plane?.photographer && <span className={'absolute bottom-0 w-full bg-gray-800/80 py-1 text-center'}>by {plane.photographer}</span>}
            </div>
          </div>
          <div className='flex h-full flex-col'>
            <p className='bg-blue-900/60 text-center'>Aircraft</p>
            <div className='grid basis-1/2 grid-cols-6 grid-rows-3 items-center p-2 text-center'>
              <div className={'col-span-3'}>
                <p className={'text-orange-600'}>{plane?.owner || '?'} </p>
                Owner
              </div>
              <div className={'col-span-3'}>
                <p className={'text-orange-600'}>{plane?.operatorCallsign || '?'} </p>
                Operator
              </div>
              <div className={'col-span-3'}>
                <p className={'text-orange-600'}>{plane?.model || '?'} </p>
                Model
              </div>
              <div className={'col-span-3'}>
                <p className={'text-orange-600'}>{plane?.callSign || '?'} </p>
                Call Sign
              </div>
              <div className={'col-span-2'}>
                <p className={'text-orange-600'}>{plane?.icao24 || '?'} </p>
                <p>Icao</p>
              </div>
              <div className={'col-span-2'}>
                <p className={'text-orange-600'}>{plane?.registration || '?'}</p>
                <p>Registration</p>
              </div>
              <div className={'col-span-2'}>
                <p className={'text-orange-600'}>{plane?.serialNumber || '?'} </p>
                <p>Serial</p>
              </div>
            </div>

            <p className='bg-blue-900/60 text-center'>Route</p>
            <div className='grid basis-1/3 grid-cols-3 grid-rows-2 items-center p-2 text-center'>
              <div>
                <p className={'text-orange-600'}>{(plane?.velocity && `${Math.floor(3.6 * plane.velocity)}km/h`) || '?'}</p>
                Speed
              </div>
              <div>
                <p className={'text-orange-600'}>{(plane?.geoAltitude && `${Math.floor(plane.geoAltitude)}m`) || '?'}</p>
                Altitude
              </div>
              <div>
                <p className={'text-orange-600'}>{(plane?.trueTrack && `${Math.floor(plane.trueTrack)}°`) || '?'}</p>
                Direction`
              </div>
              <div>
                <p className={'text-orange-600'}>{'?'}</p>
                Updated
              </div>
              <div>
                <p className={'text-orange-600'}>{(timeSinceStart !== undefined && timeSinceStart) || '?'}</p>
                In air
              </div>
              <div>
                <p className={'text-orange-600'}>{(distanceSinceStart !== undefined && `${distanceSinceStart.toFixed()}km`) || '?'}</p>
                Distance
              </div>
            </div>
            <p className='bg-blue-900/60 text-center'>Checkpoints</p>
            <div className='grid grid-cols-3 grid-rows-1 items-center p-2 text-center'>
              <div>
                <p className={'text-orange-600'}>{(plane?.flights && plane.flights[0]?.checkpoints.length) || '?'}</p>
                Amount
              </div>
              <div>
                <p className={'text-orange-600'}>
                  {(plane?.flights &&
                    plane.flights.length > 0 &&
                    plane.flights[0]?.checkpoints.length! > 0 &&
                    `${Math.floor(
                      (plane.flights[0]!.checkpoints.reduce((total, next) => total + next.velocity, 0) / plane.flights[0]!.checkpoints.length) * 3.6
                    )}km/h`) ||
                    '?'}
                </p>
                Avg speed
              </div>
              <div>
                <p className={'text-orange-600'}>
                  {(plane?.flights &&
                    plane.flights.length > 0 &&
                    plane.flights[0]!.checkpoints.length > 0 &&
                    `${Math.floor(
                      plane.flights[0]!.checkpoints.reduce((total, next) => total + next.altitude, 0) / plane.flights[0]!.checkpoints.length
                    )}m`) ||
                    '?'}
                </p>
                Avg Altitude
              </div>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  function RenderGenericSideBar() {
    if (!stats) return null;

    return (
      <aside className='absolute left-0 top-0 z-[10000] h-fit w-48 border-2 border-sky-800 bg-black/60 text-white sm:left-4 sm:top-4 sm:w-64'>
        <div className='flex w-full flex-col gap-2 p-2 text-white'>
          <p className='bg-blue-900/60 text-center'>Stats</p>
          <p>
            Displaying {totalPlanes}/{stats.totalPlanes}
          </p>
          <p>In Air {stats.inAir}</p>
          <p>On Ground {stats.totalPlanes - stats.inAir}</p>
          <p>Traffic {Math.floor(((stats.totalPlanes - (stats.totalPlanes - stats.inAir)) / stats.totalPlanes) * 100)}%</p>
          <p className='bg-blue-900/60 text-center'>Air Spaces</p>
          <p>US {stats.zoneUs}</p>
          <p>EU {stats.zoneEu}</p>
          <p>Other {stats.totalPlanes - stats.zoneEu - stats.zoneUs}</p>
        </div>
      </aside>
    );
  }
};

function convertSeconds(seconds: number): string {
  return `${(Math.floor(seconds / (60 * 60)) > 0 ? `${(seconds / (60 * 60)).toFixed()}hr ` : '') + ((seconds / 60) % 60).toFixed()}min`;
}

function calcDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const p = 0.017453292519943295; // Math.PI / 180
  const c = Math.cos;
  const a = 0.5 - c((lat2 - lat1) * p) / 2 + (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

function areEqual(prevProps: Props, nextProps: Props): boolean {
  if (!prevProps.plane && !nextProps.plane) {
    return prevProps.totalPlanes === nextProps.totalPlanes;
  }
  return prevProps.plane?.icao24 === nextProps.plane?.icao24 || prevProps.plane?.trueTrack === nextProps.plane?.trueTrack;
}

export default memo(SideBar, areEqual);
