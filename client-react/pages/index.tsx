import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import Link from "next/link";
import Layout from "../components/Layout";
import { getLandingPageStats } from "../service/requestUtils";

const title = "Flight Tracker - Interactive Map";
const description = "Real-time representation of flying planes on an interactive map";

type Props = {
  data: { totalPlanes: number; totalFlights: number; totalCheckpoints: number };
};

const Index = ({ data }: Props): JSX.Element => {
  return (
    <Layout title={title} description={description}>
      <div className={"grid h-screen max-w-screen max-w-full max-h-screen group overflow-hidden"}>
        <svg
          className={"w-screen max-w-full max-h-screen h-screen absolute -z-10 opacity-40 group-hover:-translate-x-1/2 transition-all duration-[600000ms] ease-linear"}
          id="visual"
          viewBox="0 0 960 540"
          width="960"
          height="540"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          version="1.1"
        >
          <g>
            <g transform="translate(339 316)">
              <path
                d="M97.4 -34.6C109.3 5 90.4 51.8 58.3 73.5C26.1 95.3 -19.3 92.2 -51 69.4C-82.6 46.6 -100.6 4 -89.8 -34.1C-79 -72.1 -39.5 -105.8 1.6 -106.3C42.7 -106.8 85.5 -74.2 97.4 -34.6Z"
                stroke="#ffffff"
                fill="none"
                strokeWidth="18"
              ></path>
            </g>
            <g transform="translate(886 105)">
              <path
                d="M67.5 -22.2C77.8 9.7 69.8 47.4 46.6 64.3C23.3 81.2 -15.1 77.4 -43.3 57.5C-71.4 37.5 -89.4 1.3 -80.5 -28.8C-71.5 -58.9 -35.8 -82.8 -3.6 -81.7C28.6 -80.5 57.2 -54.2 67.5 -22.2Z"
                stroke="#ffffff"
                fill="none"
                strokeWidth="18"
              ></path>
            </g>
            <g transform="translate(720 475)">
              <path
                d="M59.7 -19.9C67.6 4.9 57.5 35.1 37.1 49.5C16.7 64 -14 62.8 -35.1 47.6C-56.1 32.5 -67.6 3.4 -60.1 -20.8C-52.7 -44.9 -26.3 -64.2 -0.2 -64.2C25.9 -64.1 51.8 -44.7 59.7 -19.9Z"
                stroke="#ffffff"
                fill="none"
                strokeWidth="18"
              ></path>
            </g>
          </g>
        </svg>
        <NavBar
          className="absolute top-0 flex opacity-80
      gap-4 lg:gap-8
      lg:justify-end lg:py-8 lg:pr-24
      py-6 pl-8 w-full"
        />
        <div className={"container self-center max-w-3xl text-center"}>
          <div className="text-6xl sm:text-7xl md:text-8xl font-bold tracking-widest text-highlighted">
            <h1>FLIGHT</h1>
            <h1>TRACKER</h1>
          </div>
          <div className="border-white border-b-2 pb-4 w-1/2 sm:w-1/2 md:w-2/3 mx-auto opacity-80" />
          <p className="bg-dark-el-1 rounded-xl mt-6 text-xl md:text-2xl text-slate-300 tracking-wide p-3">
            Currently tracking <span className="text-sky-400 tracking-normal">{data?.totalPlanes ?? 0}</span> aircraft with{" "}
            <span className="text-sky-400">{data?.totalFlights ?? 0}</span> flights and{" "}
            <span className="text-sky-400">{data?.totalCheckpoints ?? 0}</span> checkpoints across <span className="text-sky-400">2</span> regions
          </p>
          <div className={"p-4 mt-4"}>
            <Link href="/map">
              <a
                className={
                  "px-16 py-3 mt font-semibold rounded-3xl border border-white hover:bg-gradient-to-l hover:from-indigo-400 hover:to-indigo-900 hover:rounded-none hover:text-white hover:border-1 hover:border-indigo-900 transition-all duration-300"
                }
              >
                Map
              </a>
            </Link>
          </div>
        </div>
      </div>
      <Footer className={"absolute bottom-0 max-w-full w-screen text-center text-slate-300"}>
        Copyright {new Date().getFullYear()} -{" "}
        <Link href={"https://fantasea.pl/ "} prefetch={false}>
          <a className={"text-sky-400"}>Fantasea</a>
        </Link>
      </Footer>
    </Layout>
  );
};

export async function getStaticProps() {
  let data = null;
  try {
    const response = await getLandingPageStats();
    data = response.ok ? await response.json() : null;
  } catch (e) {
    console.log(e);
  }

  return {
    props: {
      data,
    },
    revalidate: 2 * 60 * 60, // 2 hours
  };
}

export default Index;
