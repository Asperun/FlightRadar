import '../styles/global.scss';

import type { AppProps } from 'next/app';
import { DefaultSeo } from 'next-seo';
import { RecoilRoot } from 'recoil';

function MyApp({ Component, pageProps, router }: AppProps) {
  const url = process.env.NEXT_PUBLIC_DOMAIN_NAME + router.asPath;
  return (
    <>
      <DefaultSeo
        openGraph={{
          type: 'website',
          locale: 'en_US',
          url,
          site_name: 'Fantasea'
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
