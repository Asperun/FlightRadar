import Link from "next/link";
import Image from "next/image";
import { memo } from "react";
import bgImg from "../public/images/jet.jpg";
import Head from "next/head";

const TestPage = () => {
  return (
      <div>
        <Head>
          <title>Flight Radar</title>
        </Head>
        <Image
            className="-z-10"
            src={bgImg}
            alt="bg pic.jpg"
            layout="fill"
            objectFit="cover"
            objectPosition="center"
            quality={100}
        />
        <div className="flex relative flex-col container mx-auto my-auto justify-center items-center max-w-2xl text-center">
          <div className="self-center mx-auto mt-12 md:order-1 md:mt-0">
            <h1 className="mb-2 text-3xl font-bold  md:text-4xl lg:text-5xl md:mb-4 lg:mb-8">
              Welcome to Flight Radar
            </h1>
            <p className="mb-6 text-lg xl:text-xl lg:mb-8 xl:mb-10">
              A web app designed to track aircraft and display their position on
              interactive map
            </p>
            <div className="flex flex-col justify-center items-center min-w-full gap-2 sm:flex-row my-8">
              <Link href="/map">
                <button
                    className="inline-block w-40 px-5 py-2 font-semibold rounded-lg
                    focus:outline-none border-2  border-indigo-700
                    hover:bg-gradient-to-l hover:from-indigo-400 hover:to-indigo-900 hover:rounded-none hover:text-white
                    transition-all duration-300"
                >
                  Map
                </button>
              </Link>
              <Link href="/about">
                <button
                    className="inline-block w-40 px-5 py-2 font-semibold rounded-lg
                        focus:outline-none border-2  border-indigo-700
                        hover:bg-gradient-to-l hover:from-indigo-400 hover:to-indigo-900
                        hover:rounded-none hover:text-white
                        transition-all duration-300"
                >
                  About
                </button>
              </Link>
            </div>
            <p className="text-sm text-gray-400 text-gray-50 active">
              No credit card required. Cancel anytime.
            </p>
          </div>
        </div>
      </div>
  );
};

export default memo(TestPage);
