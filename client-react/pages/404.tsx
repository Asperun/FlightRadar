import Image from 'next/image';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import Layout from '../components/Layout';
import pageNotFound from '../public/page-not-found.svg';

const title = 'Page not found';
const description = 'Error page';

const ErrorPage = (): JSX.Element => {
  const [time, setTime] = useState<number>(5);
  const router: NextRouter = useRouter();
  useEffect(() => {
    if (time <= 0) {
      router.push('/');
      return;
    }
    setTimeout(() => {
      setTime((redirectSeconds) => redirectSeconds - 1);
    }, 1000);
  }, [time]);

  return (
    <Layout title={title} description={description}>
      <div className={'flex h-screen w-screen items-center justify-center'}>
        <div className={'container max-w-xl p-2 text-center text-slate-400'}>
          <Image src={pageNotFound} alt={'logo.png'} height={128} width={320} />
          <p className={'mt-4 text-xl'}>Page not found... redirecting in {time}</p>
        </div>
      </div>
    </Layout>
  );
};

export default ErrorPage;
