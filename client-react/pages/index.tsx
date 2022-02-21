import {NextPage} from "next";
import axios from "axios";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import Link from "next/link";
import SocialLinks from "../components/SocialLinks";
import {RiArrowDownSLine, RiArrowUpSLine} from "react-icons/ri"
import Scroll from "react-scroll"
import Layout from "../components/Layout";
import {useEffect} from "react";

const title = "Info"
const description = "Main page for Flight Tracker"


type Props = {
  totalPlanes: number
  totalFlights: number
  totalCheckpoints: number
}

const Index: NextPage = ({data: {totalPlanes, totalFlights, totalCheckpoints}}: Props): JSX.Element => {

  useEffect(() => {
      document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    };
  }, []);


  return (
    <Layout title={title} description={description}>
      <div className={"max-w-full"}>
        <div className={"w-full h-screen flex flex-col justify-between items-center"}>
          <div className={"w-full"}>
            <NavBar />
          </div>
          <div className={"container max-w-3xl text-center"}>
            <div className="text-6xl sm:text-7xl md:text-8xl font-bold tracking-widest text-highlighted">
              <h1>FLIGHT</h1>
              <h1>TRACKER</h1>
            </div>
            <div className="border-white border-b-2 pb-4 w-1/2 sm:w-1/2 md:w-2/3 mx-auto opacity-80" />
            <p className="bg-dark-el-1 rounded-xl mt-6 text-xl md:text-2xl text-slate-300 tracking-wide p-3">
              Currently
              tracking <span className="text-sky-600 tracking-normal">{totalPlanes}</span> aircraft
              with <span className="text-sky-600">{totalFlights}</span> flights
              and <span className="text-sky-600">{totalCheckpoints}</span> checkpoints
              across <span className="text-sky-600">2</span> regions
            </p>
            <div className={"p-4 mt-4"}>
              <Link href="/map">
                <a className={"px-16 py-3 mt font-semibold rounded-3xl border border-white hover:bg-gradient-to-l hover:from-indigo-400 hover:to-indigo-900 hover:rounded-none hover:text-white hover:border-1 hover:border-indigo-900 transition-all duration-300"}>
                  Map
                </a>
              </Link>
            </div>
          </div>
          <button onClick={() => scrollTo("bottom")}>
            <RiArrowDownSLine size={48} className={"opacity-70 hover:opacity-100 hover:scale-125 hover:-translate-y-2 transition-all duration-300 ease-out"} />
          </button>
        </div>
        <div className={"w-full h-screen flex flex-col justify-between items-center"}>
          <button onClick={() => scrollTo("top")}>
            <RiArrowUpSLine size={48} className={"opacity-70 hover:opacity-100 hover:scale-125 hover:translate-y-2 transition-all duration-300 ease-out"} />
          </button>
          <div>
            <div className={"container max-w-3xl rounded-xl bg-dark-el-1 p-6"}>
              <article className={"hidden sm:block prose-xl sm:prose-2xl prose-invert"}>
                <p>Data used in Flight Tracker is 100% authentic and comes from OpenSky Network.</p>
                <p>Everyday, hundreds of thousands of coordinates are being processed and mapped to create interactive map.</p>
                <p>Currently, working to improve performance of database queries and move map markers from SVG to Canvas.</p>
                <div className="border-white border-b-2 w-3/4 mx-auto opacity-80" />
              </article>
              <p className={"mt-4 text-xl text-center"}>Contact me at:</p>
              <SocialLinks />
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </Layout>
  );
};

function scrollTo(direction: string): void {
  const scroll = Scroll.animateScroll
  const options = {duration: 1250, smooth: true}

  switch (direction.toLowerCase()) {
    case "top":
      return scroll.scrollToTop(options);
    case "bottom":
      return scroll.scrollToBottom(options)
  }
}

export async function getStaticProps() {
  const data = await axios.get('https://fantasea.pl/api/v1/planes/stats/mainpage').then(res => res.data)
  return {
    props: {
      data
    },
    revalidate: 7200,
  }
}

export default Index;