import Link from 'next/link';

import Footer from '../components/Footer';
import Layout from '../components/Layout';
import NavBar from '../components/NavBar';
import { getLandingPageStats } from '../service/requestUtils';

const title = 'Flight Tracker - Interactive Map';
const description = 'Real-time representation of flying planes on an interactive map';

type Props = {
  data: { totalPlanes: number; totalFlights: number; totalCheckpoints: number };
};

const Index = ({ data }: Props): JSX.Element => {
  return (
    <Layout title={title} description={description}>
      <main className={'group grid h-screen max-h-screen max-w-full overflow-hidden'}>
        <div className={'absolute -z-50 h-screen w-screen'}>
          <svg
            className={
              'absolute -z-10 h-screen max-h-screen w-screen max-w-full opacity-40 transition-all duration-[600000ms] ease-linear group-hover:-translate-x-1/2'
            }
            id='visual'
            viewBox='0 0 960 540'
            width='960'
            height='540'
            xmlns='http://www.w3.org/2000/svg'
            xmlnsXlink='http://www.w3.org/1999/xlink'
            version='1.1'>
            <g>
              <g transform='translate(339 316)'>
                <path
                  d='M97.4 -34.6C109.3 5 90.4 51.8 58.3 73.5C26.1 95.3 -19.3 92.2 -51 69.4C-82.6 46.6 -100.6 4 -89.8 -34.1C-79 -72.1 -39.5 -105.8 1.6 -106.3C42.7 -106.8 85.5 -74.2 97.4 -34.6Z'
                  stroke='#ffffff'
                  fill='none'
                  strokeWidth='18'></path>
              </g>
              <g transform='translate(886 105)'>
                <path
                  d='M67.5 -22.2C77.8 9.7 69.8 47.4 46.6 64.3C23.3 81.2 -15.1 77.4 -43.3 57.5C-71.4 37.5 -89.4 1.3 -80.5 -28.8C-71.5 -58.9 -35.8 -82.8 -3.6 -81.7C28.6 -80.5 57.2 -54.2 67.5 -22.2Z'
                  stroke='#ffffff'
                  fill='none'
                  strokeWidth='18'></path>
              </g>
              <g transform='translate(720 475)'>
                <path
                  d='M59.7 -19.9C67.6 4.9 57.5 35.1 37.1 49.5C16.7 64 -14 62.8 -35.1 47.6C-56.1 32.5 -67.6 3.4 -60.1 -20.8C-52.7 -44.9 -26.3 -64.2 -0.2 -64.2C25.9 -64.1 51.8 -44.7 59.7 -19.9Z'
                  stroke='#ffffff'
                  fill='none'
                  strokeWidth='18'></path>
              </g>
            </g>
          </svg>
        </div>
        <NavBar
          className='absolute top-0 flex w-full
      gap-4 py-6
      pl-8 opacity-80 lg:justify-end
      lg:gap-8 lg:py-8 lg:pr-24'
        />
        <div className={'container max-w-3xl self-center text-center'}>
          <div className='text-highlighted text-6xl font-bold tracking-widest sm:text-7xl md:text-8xl'>
            <h1>FLIGHT</h1>
            <h1>TRACKER</h1>
          </div>
          <div className='mx-auto w-1/2 border-b-2 border-white pb-4 opacity-80 sm:w-1/2 md:w-2/3' />
          <p className='mt-6 rounded-xl bg-dark-el-1 p-3 text-xl tracking-wide text-slate-300 md:text-2xl'>
            Currently tracking <span className='tracking-normal text-sky-400'>{data?.totalPlanes ?? 0}</span> aircraft with{' '}
            <span className='text-sky-400'>{data?.totalFlights ?? 0}</span> flights and{' '}
            <span className='text-sky-400'>{data?.totalCheckpoints ?? 0}</span> checkpoints across <span className='text-sky-400'>2</span> regions
          </p>
          <div className={'mt-4 p-4'}>
            <Link
              className={
                'rounded-3xl border border-white px-16 py-3 font-semibold transition-all duration-300 hover:rounded-none hover:border hover:border-indigo-900 hover:bg-gradient-to-l hover:from-indigo-400 hover:to-indigo-900 hover:text-white'
              }
              href='/map'>
              Map
            </Link>
          </div>
        </div>
      </main>
      <Footer className={'absolute bottom-0 w-screen max-w-full text-center text-slate-300'}>
        Copyright {new Date().getFullYear()} -{' '}
        <Link className={'text-sky-400'} href={'https://fantasea.pl/ '} prefetch={false}>
          Fantasea
        </Link>
      </Footer>
    </Layout>
  );
};

export async function getStaticProps() {
  let data = null;
  try {
    const response = await getLandingPageStats();
    data = response.ok ? await response.json() : null;
  } catch (e) {
    // console.log(e);
  }

  return {
    props: {
      data
    },
    revalidate: 2 * 60 * 60 // 2 hours
  };
}

export default Index;
