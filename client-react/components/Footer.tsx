const Footer = (): JSX.Element => {
  return (<div className={"mt-4 mb-2 sm:mt-8 text-center text-slate-400"}>Copyright {new Date().getFullYear()} - <a className={"text-sky-500"} href="https://fantasm.vercel.app/">Fantasm</a></div>);
};

export default Footer;