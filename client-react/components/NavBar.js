import { memo } from "react";
import Link from "next/link";

const NavBar = () => {
  return (
    <div
      className="opacity-0 hover:opacity-100 bg-opacity-0 absolute border-b-2 
    border-white border-opacity-60 
    min-w-full w-max 
    transition-all ease-linear duration-100 
    p-4 text-xl font-extrabold"
    >
      {console.log("Rendering navbar")}
      <header className="flex justify-between w-max min-w-full">
        <nav className="flex items-center space-x-2 text-sm md:space-x-4 md:text-xl">
          <button className="hover:text-white transition-colors duration-200 ease-linear">
            <Link href="/">FLIGHT RADAR</Link>
          </button>
          <button className="hover:text-white transition-colors duration-200 ease-linear">
            <Link href="/map">Map</Link>
          </button>
          <button className="hover:text-white transition-colors duration-200 ease-linear">
            <Link href="/about">About</Link>
          </button>
        </nav>
        <nav className="flex items-center space-x-2 text-sm md:space-x-4 md:text-xl">
          <button className="hover:text-white transition-colors duration-200 ease-linear">
            <Link href="/login" className="flex items-center space-x-1">
              Sign in
            </Link>
          </button>
          <button className="hover:text-white transition-colors duration-200 ease-linear">
            <Link href="/api" className="inline-block px-5 py-2">
              API
            </Link>
          </button>
        </nav>
      </header>
    </div>
  );
};

export default memo(NavBar);
