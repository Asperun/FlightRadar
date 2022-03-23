import "../styles/global.scss";
import Head from "next/head";
import {DefaultSeo} from "next-seo";
import {AppProps} from "next/app";
import {AnimatePresence} from "framer-motion";

function MyApp({Component, pageProps, router}: AppProps) {
  const url = process.env.NEXT_PUBLIC_DOMAIN_NAME + router.asPath
  return (
    <>
      <Head>
        <link rel="icon" type="image/webp" href="/images/plane-orange.webp" />
      </Head>
      <DefaultSeo
        defaultTitle="Flight Tracker"
        openGraph={{
          type: 'website',
          locale: 'en_IE',
          url,
          description: 'View planes in real time on interactive map',
          site_name: 'Flight Tracker | ft.fantasea.pl',
          images: [],
        }}
        canonical={url}
      />
      <AnimatePresence exitBeforeEnter initial={true} onExitComplete={() => window.scrollTo(0, 0)}>
        <Component {...pageProps} canonical={url} key={router.pathname} />
      </AnimatePresence>
    </>
  );
}

export default MyApp;