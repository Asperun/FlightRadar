import dynamic from "next/dynamic";
import Head from "next/head";
import * as React from "react";

const MapComponent = dynamic(() => import("../components/MapNoSSR"), {
  ssr: false,
});

const Map = () => {
  return (<>
        <Head>
          <title>Map - Flight Tracker</title>
        </Head>
        <MapComponent />
      </>);
};

export default Map;