import dynamic from 'next/dynamic';
import Link from 'next/link';

import Footer from '../components/Footer';
import Layout from '../components/Layout';
import NavBar from '../components/NavBar';
import {
  getHourlyGraphData,
  getHourlyPerRegionGraphData,
  getRegisteredPlanesGraphData,
  mapHourlyPerRegionToGraph,
  mapHourlyToGraph,
  mapRegisteredToGraph
} from '../service/requestUtils';
import type { GeoGraphData, LinearGraphData } from '../types/graph';

const title = 'Stats - Flight Tracker';
const description = 'Daily stats for flight tracker';

type Props = {
  hourly: LinearGraphData[];
  registered: GeoGraphData[];
  hourlyPerRegion: LinearGraphData[];
};

const DynamicLinearGraph = dynamic(() => import('../components/LinearGraph'), {
  ssr: false
});
const DynamicGeoMap = dynamic(() => import('../components/GeoMap'), {
  ssr: false
});

const Stats = ({ hourly, registered, hourlyPerRegion }: Props): JSX.Element => {
  return (
    <Layout title={title} description={description}>
      <NavBar className='flex w-full gap-4 py-6 pl-8 lg:justify-end lg:gap-8 lg:py-8 lg:pr-24' />
      <main className={'my-16 grid w-screen max-w-full sm:my-24'}>
        <div className={'container flex max-w-full flex-col gap-24 p-1 sm:max-w-7xl sm:gap-32 sm:p-2'}>
          <div className={'rounded-md bg-dark-el-1/70 px-6 py-12'}>
            <h2 className={'p-4 text-2xl'}>
              The graph below shows how many unique aircraft were in the air at the same time in a specific hour; the data covers the past 48 hours.
            </h2>
            <div className={'max-w-[360px] overflow-auto sm:max-w-full'}>
              <div className={'h-[30rem] w-[600px] overflow-hidden sm:w-full'}>
                <DynamicLinearGraph data={hourly} />
              </div>
            </div>
          </div>
          <div className={'rounded-md bg-dark-el-1/70 sm:px-6 sm:py-12'}>
            <h2 className={'p-4 text-xl sm:text-2xl'}>
              The graph below illustrates how many distinct airplanes were in the air at the same time in Europe and North America at a certain hour;
              the data covers the past 24 hours.
            </h2>
            <div className={'max-w-[360px] overflow-auto sm:max-w-full'}>
              <div className={'h-[30rem] w-[600px] overflow-hidden sm:w-full'}>
                <DynamicLinearGraph data={hourlyPerRegion} />
              </div>
            </div>
          </div>
          <div className={'rounded-md bg-dark-el-1/70 sm:px-6 sm:py-12'}>
            <h2 className={'p-4 text-2xl'}>
              The graph below depicts the number of unique planes registered in each nation throughout the world; the data includes all planes tracked
              by application.
            </h2>
            <div className={'max-w-[360px] overflow-auto sm:max-w-full'}>
              <div className={'h-[36rem] w-[800px] sm:w-full'}>
                <DynamicGeoMap data={registered} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer className={'w-screen max-w-full text-center text-slate-300'}>
        Copyright {new Date().getFullYear()} -{' '}
        <Link className={'text-sky-400'} href={'https://fantasea.pl/ '} prefetch={false}>
          Fantasea
        </Link>
      </Footer>
    </Layout>
  );
};

export default Stats;

export async function getStaticProps() {
  let hourly = null;
  let hourlyPerRegion = null;
  let registered = null;
  try {
    const [hourlyData, registeredData, hourlyPerRegionData] = await Promise.all([
      getHourlyGraphData(),
      getRegisteredPlanesGraphData(),
      getHourlyPerRegionGraphData()
    ]);

    hourly = mapHourlyToGraph(await hourlyData.json());
    hourlyPerRegion = mapHourlyPerRegionToGraph(await hourlyPerRegionData.json());
    registered = mapRegisteredToGraph(await registeredData.json());
  } catch (e) {
    // console.log(e);
  }

  return {
    props: {
      hourly,
      hourlyPerRegion,
      registered
    },
    revalidate: 2 * 60 * 60 // 2 hours
  };
}
