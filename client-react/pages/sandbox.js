import * as React from 'react';
import dynamic from "next/dynamic";
import Head from 'next/head'

const MyTestComp = dynamic(() => import("../components/TestComponent"), {
  ssr: false,
});

export default function Sandbox( props ) {
  return (
      <>
        <Head>
          <title>Map - FlightRadar</title>
        </Head>
        <MyTestComp />
      </>
  );
};