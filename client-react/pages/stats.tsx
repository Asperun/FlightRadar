import {convertCountryToAlpha3Code} from "../utils/countryUtils";
import NavBar from "../components/NavBar";
import {useEffect, useState} from "react";
import Layout from "../components/Layout";
import {NextPage} from "next";
import GeoMap from "../components/GeoMap";
import {GeoGraphData, LinearGraphData} from "../types/graph";
import LinearGraph from "../components/LinearGraph";

const title = "Stats"
const description = "Daily stats for flight tracker"

type Props = {
  hourlyStats: LinearGraphData[]
  regionStats: GeoGraphData[]
  hourlyPerRegionStats: LinearGraphData[]
}

const Stats: NextPage = ({hourlyStats, regionStats, hourlyPerRegionStats}: Props): JSX.Element => {
  const [screenWidth, setScreenWidth] = useState<number>(0);

  useEffect(() => {
    setScreenWidth(screen.width > 900 ? 900 : screen.width)
  }, []);


  return (
    <>
      <NavBar />
    <Layout title={title} description={description}>
      <div className={"w-full flex flex-col gap-12 mt-12 content-center justify-center"}>
        <div className={"mx-auto"}>
          <h1 className={"text-xl"}>Total unique aircraft recorded today</h1>
          <div className={"mt-4 bg-black shadow-xl dark-surface rounded-md"}>
            <LinearGraph data={hourlyStats} width={screenWidth} />
          </div>
        </div>
        <div className={"mx-auto"}>
          <h1 className={"text-xl"}>Total unique aircraft across the regions recorded today</h1>
          <div className={"mt-4 bg-black shadow-xl dark-surface rounded-md"}>
            <LinearGraph data={hourlyPerRegionStats} width={screenWidth} />
          </div>
        </div>
        <div className={"mx-auto mb-8"}>
          <h1 className={"text-xl"}>Total aircraft registered per country</h1>
          <div className={"mt-4 bg-black shadow-xl dark-surface rounded-md"}>
            <GeoMap data={regionStats} width={screenWidth} />
          </div>
        </div>
      </div>
    </Layout>
      </>
  )
}



export default Stats;


// !Mess, have to rewrite it asap!
export async function getStaticProps() {

  const promises: Promise<any>[] = [
    fetch('https://fantasea.pl/api/v1/planes/stats/hourly?pastDays=1').then(res => res.json()),
    fetch('https://fantasea.pl/api/v1/planes/stats/planesregistered').then(res => res.json()),
    fetch('https://fantasea.pl/api/v1/planes/stats/hourlyperregion').then(res => res.json())
  ]

  const [hourlyStatsJson, regionStatsJson, hourlyPerRegionStatsJson] = await Promise.all(promises);

  // Geo Map data
  const regionStats: GeoGraphData[] = regionStatsJson.map(obj =>
    ({id: convertCountryToAlpha3Code(obj.country), value: obj.count})
  )

  // Hourly total stats
  const hourlyGrouped = groupBy(hourlyStatsJson, "day");
  let hourlyStats:LinearGraphData[] = [];
  for (let newArrKey in hourlyGrouped) {
    hourlyStats.push(
      {
        id: hourlyGrouped[newArrKey][0].month + " " + newArrKey,
        data: hourlyGrouped[newArrKey].map((arrObj) => {
          return {
            x: arrObj.hour,
            y: arrObj.count
          }
        })
      }
    )
  }

  let hourlyStats2:LinearGraphData[] = [];
  const regionNames:string[] = ["Europe", "North America"]
  for (let k = 0; k < hourlyPerRegionStatsJson.length; k++) {
    const grouped = groupBy(hourlyPerRegionStatsJson[k], "day");
    for (let newArrKey in grouped) {
      hourlyStats2.push(
        {
          id: regionNames.pop(),
          data: grouped[newArrKey].map((arrObj) => {
            return {
              x: arrObj.hour,
              y: arrObj.count
            }
          })
        }
      )
    }
  }

  return {
    props: {
      hourlyStats,
      hourlyPerRegionStats:hourlyStats2,
      regionStats
    },
    revalidate: 7200, // 2hr in seconds
  }
}

function groupBy(arr: [], property: string) {
  return arr.reduce(function (memo, x) {
    if (!memo[x[property]]) {
      memo[x[property]] = [];
    }
    memo[x[property]].push(x);
    return memo;
  }, {});
}
