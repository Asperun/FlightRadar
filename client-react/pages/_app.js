import "tailwindcss/tailwind.css";
import "../styles/global.scss";
import Layout from "../components/Layout";

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

function MyApp( {Component, pageProps} ) {
  return (
      <Layout>
        <Component {...pageProps} />
      </Layout>
  );
}

export default MyApp;
