import NavBar from "../components/NavBar";
import {useEffect, useState} from "react";
import Layout from "../components/Layout";
import {NextPage} from "next";
import GeoMap from "../components/GeoMap";
import {GeoGraphData, LinearGraphData} from "../types/graph";
import LinearGraph from "../components/LinearGraph";
import Footer from "../components/Footer";
import {
  getHourlyGraphData,
  getHourlyPerRegionGraphData,
  getRegisteredPlanesGraphData,
  mapHourlyPerRegionToGraph,
  mapHourlyToGraph,
  mapRegisteredToGraph
} from "../utils/requestHelper";

const title = "Stats"
const description = "Daily stats for flight tracker"


type Props = {
  hourly: LinearGraphData[]
  registered: GeoGraphData[]
  hourlyPerRegion: LinearGraphData[]
}

const Stats: NextPage = ({hourly, registered, hourlyPerRegion}: Props): JSX.Element => {
  const [screenWidth, setScreenWidth] = useState<number>(0);

  useEffect(() => {
    setScreenWidth(screen.width > 900 ? 900 : screen.width)
  }, []);


  return (
    <>
      <NavBar />
      <Layout title={title}
              description={description}>
        <div className={"w-full flex flex-col gap-12 mt-12 content-center justify-center"}>
          <div className={"mx-auto"}>
            <h1 className={"text-xl"}>Total unique aircraft recorded today</h1>
            <div className={"mt-4 bg-black shadow-xl dark-surface rounded-md"}>
              <LinearGraph data={hourly}
                           width={screenWidth} />
            </div>
          </div>
          <div className={"mx-auto"}>
            <h1 className={"text-xl"}>Total unique aircraft across the regions recorded today</h1>
            <div className={"mt-4 bg-black shadow-xl dark-surface rounded-md"}>
              <LinearGraph data={hourlyPerRegion}
                           width={screenWidth} />
            </div>
          </div>
          <div className={"mx-auto mb-8"}>
            <h1 className={"text-xl"}>Total aircraft registered per country</h1>
            <div className={"mt-4 bg-black shadow-xl dark-surface rounded-md"}>
              <GeoMap data={registered}
                      width={screenWidth} />
            </div>
          </div>
        </div>
      </Layout>
      <Footer />
    </>
  )
}

export default Stats;

export async function getStaticProps() {
  // Sent graph requests
  const results = await Promise.all([getHourlyGraphData(), getHourlyPerRegionGraphData(), getRegisteredPlanesGraphData()]);

  // Map results to graph data
  const hourly = mapHourlyToGraph(results[0].data)
  const hourlyPerRegion = mapHourlyPerRegionToGraph(results[1].data);
  const registered = mapRegisteredToGraph(results[2].data)

  return {
    props: {
      hourly,
      hourlyPerRegion,
      registered
    },
    revalidate: 7200, // 2hr in seconds
  }
}
