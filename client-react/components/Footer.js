import { memo } from "react";

const Footer = () => {
  return (
    <>
      {console.log("Rendering footer")}
      <div className="absolute bottom-0 text-center w-screen">
        <footer className="text-gray-700">
          {new Date().getFullYear()} fantasm
        </footer>
      </div>
    </>
  );
};

export default memo(Footer);
