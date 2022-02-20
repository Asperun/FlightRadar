import {useEffect, useState} from "react";
import Link from "next/link";

const NavBar = (): JSX.Element => {
  const [activeTab, setActiveTab] = useState<string>("/");
  const getInActiveClassName: string = "hover:opacity-100 hover:text-orange-400 transition-colors text-md hover:-translate-y-0.5 duration-200 ease-linear";
  const getActiveClassName: string = "hover:opacity-100 text-orange-400 transition-colors duration-200 ease-linear text-md border-b-2 border-orange-400";

  useEffect(() => {
    setActiveTab(window.location.pathname)
  }, [])

  return (<div className="flex opacity-80
      gap-4 lg:gap-8
      lg:justify-end lg:py-8 lg:pr-24
      py-6 pl-8">
    <button onClick={() => handleClick("/")} className={activeTab === "/" ? getActiveClassName : getInActiveClassName}>
      <Link href="/">Main</Link>
    </button>
    <button onClick={() => handleClick("/map")} className={activeTab === "/map" ? getActiveClassName : getInActiveClassName}>
      <Link href="/map">Map</Link>
    </button>
    <button onClick={() => handleClick("/stats")} className={activeTab === "/stats" ? getActiveClassName : getInActiveClassName}>
      <Link href="/stats">Stats</Link>
    </button>
  </div>);

  function handleClick(tabName: string): void {
    setActiveTab(tabName);
  }

};

export default NavBar;