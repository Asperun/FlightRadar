import { memo } from "react";

const SideBar = (props) => {
  return (
    <div className="btn">
      <span>I am a sidebar</span>
      <h1>aaa</h1>
    </div>
  );
};

export default memo(SideBar);
