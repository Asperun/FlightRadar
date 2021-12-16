import "tailwindcss/tailwind.css";
import "../styles/global.scss";

// import { useEffect } from "react";

function MyApp({ Component, pageProps }) {
  // useEffect(() => {
  //   console.log("Use effect Main page");
  //   document.getElementById("__next").className =
  //     "h-screen w-screen bg-gray-900 text-white";
  // }, []);
  return <Component {...pageProps} />;
}

export default MyApp;
