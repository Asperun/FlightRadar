import NavBar from "../components/NavBar";
import Layout from "../components/Layout";
import {NextPage} from "next";
import SocialLinks from "../components/SocialLinks";
import Footer from "../components/Footer";

const title = "About"
const description = "About Flight Tracker"

const About: NextPage = (): JSX.Element => {
  return (
    <>
      <NavBar />
      <Layout title={title} description={description}>
        <div className="mx-auto px-10 sm:px-16 md:px-20 lg:px-28  container flex flex-col justify-center items-center  py-20 md:py-52">
          <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl tracking-wider text-center antialiased text-highlighted">About Flight Tracker</h1>
          <div className={"w-2/3 border-b border-2 border-white mt-2 mb-4"} />
          <p className={"tracking-wider text-center antialiased text:xl sm:text-2xl lg:text-3xl"}>Data used in this app is 100% authentic and comes from OpenSky Network.</p>
          <p className={"tracking-wider text-center antialiased text:xl md:text-2xl lg:text-3xl"}>
            Provided aircraft coordinates are processed in .NET Core back end, stored in SQL Server and displayed in
            <span className={"text-sky-400"}>React</span>
            (<span className={"text-green-400"}>Next.js</span>).
          </p>
          <p className={"mt-8 text-3xl sm:text-4xl md:text-4xl tracking-wider text-center antialiased"}>Contact me at:</p>
          <SocialLinks />
        </div>
        <Footer />
      </Layout>
    </>
  );
};

export default About