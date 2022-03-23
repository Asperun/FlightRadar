import {domAnimation, LazyMotion, m} from 'framer-motion';
import {ReactNode} from "react";
import {NextSeo} from "next-seo";

type Props = {
  children: ReactNode;
  title: string;
  description: string;
  dontAnimate?: boolean;
}

const variants = {
  hidden: {opacity: 0, x: -200, y: 0},
  enter: {opacity: 1, x: 0, y: 0},
  exit: {opacity: 0, x: 0, y: -100},
}

const Layout = ({children, title, description, dontAnimate}: Props): JSX.Element => {
  return (
    <>
      <NextSeo title={title} description={description} openGraph={{title, description}} />
      {dontAnimate ?
        <div>
          {children}
        </div>
        :
        <LazyMotion features={domAnimation}>


          <m.div initial="hidden"
                 animate="enter"
                 exit="exit"
                 variants={variants}
                 transition={{type: 'linear'}}>
            {children}
          </m.div>
        </LazyMotion>
      }
    </>
  );
}

export default Layout