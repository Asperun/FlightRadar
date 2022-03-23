import dynamic from "next/dynamic";
import Layout from "../components/Layout";

const MapComponent = dynamic(() => import("../components/InteractiveMap"), {
  ssr: false,
});

const title = "Map - Flight Tracker";
const description = "Flight Tracker interactive map";

const Map = (): JSX.Element => {
  return (
    <Layout title={title} description={description} dontAnimate={true}>
      <MapComponent />
    </Layout>
  );
};

export default Map;