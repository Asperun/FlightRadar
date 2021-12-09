import { memo, useEffect } from "react";
import Head from "next/head";

const AboutUs = () => {
  return (
    <>
      {console.log("Rendering about us")}
      <Head>
        <title>Flight Radar - About</title>
      </Head>

      <div className="bg-clouds h-screen">
        <div
          className="flex flex-col container mx-auto my-auto justify-center 
        h-screen items-center max-w-2xl text-center"
        >
          <p className="text-4xl font-bold">ABOUT THE PROJECT</p>
          <p className="text-2xl font-bold mt-24">
            FLIGHT RADAR USES REAL TIME AUTHENTIC DATA FROM RELIABLE PROVIDER{" "}
            <a href="https://opensky-network.org/" className="text-blue-500">
              OPENSKY NETWORK
            </a>
          </p>
          <p className="text-xl mt-8">
            This web app was built for educational purposes. It uses
            technologies like:{" "}
            <a href="https://nextjs.org/" className="text-green-400 font-bold">
              Next.js 12.0
            </a>{" "}
            <a
              href="https://tailwindcss.com/"
              className="text-blue-400 font-bold"
            >
              Tailwind CSS
            </a>{" "}
            <a
              href="https://docs.microsoft.com/en-us/aspnet/core/?view=aspnetcore-6.0"
              className="text-blue-900 font-bold"
            >
              ASP.NET Core 6.0
            </a>{" "}
            <a
              href="https://www.microsoft.com/en-us/sql-server/sql-server-downloads"
              className="font-bold text-yellow-600"
            >
              SQL Server 2019
            </a>{" "}
            <a
              href="https://www.docker.com/"
              className="text-blue-400 font-bold"
            >
              Docker
            </a>
          </p>

          <div className="flex flex-col justify-center items-center min-w-full gap-2 sm:flex-row my-8">
            <button
              className="border-2 rounded-md h-8 w-60 border-gray-700 border-opacity-70 bg-gray-600 bg-opacity-0
             hover:bg-opacity-80
             hover:text-white
             hover:rounded-none
             duration-200 ease-linear
             transition-all
             focus:outline-none"
            >
              <p>Open source</p>
            </button>
            <button
              className="border-2 rounded-md h-8 w-60 border-blue-800 border-opacity-70 bg-blue-800 bg-opacity-0
             hover:bg-opacity-80
             hover:text-white
             hover:rounded-none
             transition-all
             duration-200 ease-linear
             focus:outline-none"
            >
              Contact me
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default memo(AboutUs);
