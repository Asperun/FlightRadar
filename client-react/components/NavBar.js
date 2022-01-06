import { memo } from "react";
import Link from "next/link";

const NavBar = () => {
  return (
      <div className="p-2 text-xl font-extrabold z-10 bg-black text-white">
        {console.log("Rendering navbar")}
        <header className="flex justify-between">
          <nav className="flex items-center space-x-2 text-sm md:space-x-4 md:text-xl">
            <button className="hover:text-orange-400 transition-colors duration-200 ease-linear">
              <Link href="/">FLIGHT RADAR</Link>
            </button>
            <button className="hover:text-orange-400 transition-colors duration-200 ease-linear">
              <Link href="/map">Map</Link>
            </button>
            <button className="hover:text-orange-400 transition-colors duration-200 ease-linear">
              <Link href="/stats">Stats</Link>
            </button>
            <button className="hover:text-orange-400 transition-colors duration-200 ease-linear">
              <Link href="/about">About</Link>
            </button>
          </nav>
          <nav className="flex items-center space-x-2 text-sm md:space-x-4 md:text-xl">
            <button className="hover:text-orange-400 transition-colors duration-200 ease-linear">
              <Link href="/login"
                    className="flex items-center space-x-1">
                Sign in
              </Link>
            </button>
            <button className="hover:text-orange-400 transition-colors duration-200 ease-linear">
              <Link href="/api"
                    className="inline-block px-5 py-2">
                API
              </Link>
            </button>
          </nav>
        </header>
      </div>
  );
};

export default memo(NavBar);
