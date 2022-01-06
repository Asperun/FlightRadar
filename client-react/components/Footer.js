import { memo } from "react";

const Footer = () => {
  return (
      <>
        {console.log("Rendering footer")}
        <div className="absolute bottom-0 text-center w-screen z-50">
          <footer className="text-white">
            {new Date().getFullYear()} fantasm
          </footer>
        </div>
      </>
  );
};

export default memo(Footer);
