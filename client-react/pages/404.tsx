import {useEffect, useState} from "react";
import {NextPage} from "next";
import {NextRouter, useRouter} from "next/router";

const ErrorPage: NextPage = (): JSX.Element => {
  const [time, setTime] = useState<number>(5);
  const router: NextRouter = useRouter();
  useEffect(() => {
    if (time <= 0) {
      router.push("/");
      return;
    }
    setTimeout(() => {
      setTime((redirectSeconds) => redirectSeconds - 1);
    }, 1000)
  }, [time]);

  return (
    <div className={"flex h-96"}>
      <div className={"m-auto"}>
        <p>Page not found</p>
        <p>Redirecting in {time}</p>
      </div>
    </div>
  );
}

export default ErrorPage