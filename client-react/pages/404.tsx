import { useEffect, useState } from "react";
import { NextRouter, useRouter } from "next/router";
import Layout from "../components/Layout";
import pageNotFound from "../public/page-not-found.svg";
import Image from "next/image";

const title = "Page not found";
const description = "Error page";

const ErrorPage = (): JSX.Element => {
  const [time, setTime] = useState<number>(5);
  const router: NextRouter = useRouter();
  useEffect(() => {
    if (time <= 0) {
      router.push("/");
      return;
    }
    setTimeout(() => {
      setTime((redirectSeconds) => redirectSeconds - 1);
    }, 1000);
  }, [time]);

  return (
    <Layout title={title} description={description}>
      <div className={"w-screen h-screen flex justify-center items-center"}>
        <div className={"container p-2 max-w-xl text-center text-slate-400"}>
          <Image
            src={pageNotFound}
            alt={"logo.png"}
            layout={"responsive"}
            objectFit={"scale-down"}
            height={128}
            width={320}
          />
          <p className={"mt-4 text-xl"}>Page not found... redirecting in {time}</p>
        </div>
      </div>
    </Layout>
  );
};

export default ErrorPage;
