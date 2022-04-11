import "../styles/global.scss";
import Head from "next/head";
import { DefaultSeo } from "next-seo";
import { AppProps } from "next/app";

function MyApp({ Component, pageProps, router }: AppProps) {
  const url = process.env.NEXT_PUBLIC_DOMAIN_NAME + router.asPath;
  return (
    <>
      <Head>
        <link rel="icon" type="image/webp" href="/flight-tracker/plane-orange.webp" />
      </Head>
      <DefaultSeo
        openGraph={{
          type: "website",
          locale: "en_US",
          url,
          site_name: "Fantasea",
        }}
        canonical={url}
      />
      <Component {...pageProps} canonical={url} key={router.pathname} />
    </>
  );
}

export default MyApp;
