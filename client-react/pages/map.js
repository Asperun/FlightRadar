import dynamic from "next/dynamic";

const MyAwesomeMap = dynamic(() => import("../components/MapNoSSR"), {
  ssr: false,
});

const Map = () => {
  return (
    <div className="w-screen h-screen ">
      <MyAwesomeMap />
    </div>
  );
};

export default Map;
