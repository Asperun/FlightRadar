import { memo } from "react";

const Layout = ( {children} ) => {
  return (
      <div className="w-screen h-screen flex flex-col grow-0 overflow-x-hidden">
        {/*<NavBar />*/}
        <main className={"w-full h-full"}>{children}</main>
        {/*<Footer />*/}
      </div>);
};

export default memo(Layout);
