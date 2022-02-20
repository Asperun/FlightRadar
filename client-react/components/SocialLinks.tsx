import ToastButton from "./ToastButton";
import {CgMail} from "react-icons/cg";
import {FaDiscord} from "react-icons/fa";
import {AiFillGithub} from "react-icons/ai";
import React from "react";

const SocialLinks = (): JSX.Element => {
  return (
    <div className={"flex flex-col sm:flex-row gap-4 p-4 justify-center items-center"}>
      <ToastButton className={"border-2 border-red-800 p-2 rounded-3xl hover:rounded-none hover:bg-red-800 transition-all duration-500 ease-out inline-flex w-56"}
                   toast={"Copied to clipboard!"}
                   onClick={copyValue}>
        <CgMail size={24} className={"mr-1"} /> <span>carnageepl@gmail.com</span>
      </ToastButton>
      <ToastButton className={"border-2 border-sky-600 p-2 rounded-3xl hover:rounded-none hover:bg-sky-600 transition-all duration-500 ease-out inline-flex w-56"}
                   toast={"Copied to clipboard!"}
                   onClick={copyValue}>
        <FaDiscord size={24} className={"mr-1"} /><span>fantasm#9591</span>
      </ToastButton>
      <ToastButton className={"border-2 border-gray-500 p-2 rounded-3xl hover:rounded-none hover:bg-gray-500 transition-all duration-500 ease-out inline-flex w-56"}
                   toast={"Bye!"}
                   onClick={() => redirectTo("https://github.com/Asperun")}>
        <AiFillGithub size={24} className={"mr-1"} /><span>Github</span>
      </ToastButton>
    </div>
  );
}

function redirectTo(site: string): void {
  location.href = site
}

async function copyValue(event: React.MouseEvent): Promise<any> {
  event.preventDefault();
  try {
    await navigator.clipboard.writeText(event.target.innerText);
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.log("Exception while copying value:", e.message)
    }
  }
}

export default SocialLinks