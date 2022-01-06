import NavBar from "./NavBar";
import Footer from "./Footer";
import { memo } from "react";

const Layout = ( {children} ) => {
  return (<div className="w-screen h-screen flex flex-col">
    <NavBar />
    <main className="h-full w-full">{children}</main>
    <Footer />
  </div>);
};

export default memo(Layout);
