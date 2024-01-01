import dynamic from 'next/dynamic';

import Layout from '../components/Layout';

const MapComponent = dynamic(() => import('../components/InteractiveMap'), {
  ssr: false
});

const title = 'Interactive Map - Flight Tracker';
const description = 'Flight Tracker interactive map';

const Map = (): JSX.Element | null => {
  return (
    <Layout title={title} description={description}>
      <MapComponent />
    </Layout>
  );
};

export default Map;
