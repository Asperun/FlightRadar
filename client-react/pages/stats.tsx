import NavBar from "../components/NavBar";
import Layout from "../components/Layout";
import { GeoGraphData, LinearGraphData } from "../types/graph";
import Footer from "../components/Footer";
import {
  getHourlyGraphData,
  getHourlyPerRegionGraphData,
  getRegisteredPlanesGraphData,
  mapHourlyPerRegionToGraph,
  mapHourlyToGraph,
  mapRegisteredToGraph,
} from "../service/requestHelper";
import Link from "next/link";
import dynamic from "next/dynamic";

const title = "Stats - Flight Tracker";
const description = "Daily stats for flight tracker";

type Props = {
  hourly: LinearGraphData[];
  registered: GeoGraphData[];
  hourlyPerRegion: LinearGraphData[];
};

// dynamically load graph components to reduce initial load time
const DynamicLinearGraph = dynamic(() => import("../components/LinearGraph"), {
  ssr: false,
});
const DynamicGeoMap = dynamic(() => import("../components/GeoMap"), {
  ssr: false,
});

const Stats = ({ hourly, registered, hourlyPerRegion }: Props): JSX.Element => {
  return (
    <Layout title={title} description={description}>
      <NavBar
        className="flex opacity-80
      gap-4 lg:gap-8
      lg:justify-end lg:py-8 lg:pr-24
      py-6 pl-8 w-full"
      />
      <main className={"grid my-16 sm:my-24 w-screen max-w-full"}>
        <div
          className={"container p-1 sm:p-2 max-w-full sm:max-w-7xl flex flex-col gap-24 sm:gap-32"}
        >
          <div className={"px-6 py-12 bg-dark-el-1 rounded-md bg-opacity-70"}>
            <h2 className={"text-2xl p-4"}>
              The graph below shows how many unique aircraft were in the air at the same time in a
              specific hour; the data covers the past 48 hours.
            </h2>
            <div className={"max-w-[360px] sm:max-w-full overflow-auto"}>
              <div className={"h-[30rem] w-[600px] sm:w-full"}>
                <DynamicLinearGraph data={hourly} />
              </div>
            </div>
          </div>
          <div className={"sm:px-6 sm:py-12 bg-dark-el-1 rounded-md bg-opacity-70 overflow-auto"}>
            <h2 className={"text-xl sm:text-2xl p-4"}>
              The graph below illustrates how many distinct airplanes were in the air at the same
              time in Europe and North America at a certain hour; the data covers the past 24 hours.
            </h2>
            <div className={"max-w-[360px] sm:max-w-full overflow-auto"}>
              <div className={"h-[30rem] w-[600px] sm:w-full"}>
                <DynamicLinearGraph data={hourlyPerRegion} />
              </div>
            </div>
          </div>
          <div className={"sm:px-6 sm:py-12 bg-dark-el-1 rounded-md bg-opacity-70"}>
            <h2 className={"text-2xl p-4"}>
              The graph below depicts the number of unique planes registered in each nation
              throughout the world; the data includes all planes tracked by application.
            </h2>
            <div className={"max-w-[360px] sm:max-w-full overflow-auto"}>
              <div className={"h-[36rem] w-[800px] sm:w-full"}>
                <DynamicGeoMap data={registered} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer className={"max-w-full w-screen text-center text-slate-300"}>
        Copyright {new Date().getFullYear()} -{" "}
        <Link href={"https://fantasea.pl/ "} prefetch={false}>
          <a className={"text-sky-400"}>Fantasea</a>
        </Link>
      </Footer>
    </Layout>
  );
};

export default Stats;

export async function getStaticProps() {
  let hourly = null,
    hourlyPerRegion = null,
    registered = null;
  try {
    const [hourlyData, registeredData, hourlyPerRegionData] = await Promise.all([
      getHourlyGraphData(),
      getRegisteredPlanesGraphData(),
      getHourlyPerRegionGraphData(),
    ]);

    hourly = mapHourlyToGraph(await hourlyData.json());
    hourlyPerRegion = mapHourlyPerRegionToGraph(await hourlyPerRegionData.json());
    registered = mapRegisteredToGraph(await registeredData.json());
  } catch (e) {
    console.log(e);
  }

  return {
    props: {
      hourly,
      hourlyPerRegion,
      registered,
    },
    revalidate: 2 * 60 * 60, // 2 hours
  };
}
