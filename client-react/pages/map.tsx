import dynamic from "next/dynamic";
import * as React from "react";
import {NextPage} from "next";
import Layout from "../components/Layout";

const MapComponent = dynamic(() => import("../components/InteractiveMap"), {
  ssr: false,
});

const title = "Map"
const description = "Flight Tracker interactive map"

const Map: NextPage = (): JSX.Element => {
  return (
    <Layout title={title} description={description}>
      <MapComponent />
    </Layout>
  );
};

export default Map;