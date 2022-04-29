import "../styles/global.scss";
import Head from "next/head";
import { DefaultSeo } from "next-seo";
import { AppProps } from "next/app";
import { RecoilRoot } from "recoil";

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
      <RecoilRoot>
        <Component {...pageProps} canonical={url} key={router.pathname} />
      </RecoilRoot>
    </>
  );
}

export default MyApp;
