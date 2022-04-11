import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

type NavLink = {
  label: string;
  slug: string;
};

const navLinks: NavLink[] = [
  {
    label: "Home",
    slug: "/",
  },
  {
    label: "Map",
    slug: "/map",
  },
  {
    label: "Statistics",
    slug: "/stats",
  },
];

interface Props extends React.HTMLAttributes<HTMLElement> {}

const NavBar = ({ ...props }: Props): JSX.Element => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("/");

  const getInActiveClassName: string =
    "hover:opacity-100 hover:text-orange-300 transition-colors text-md hover:-translate-y-0.5 duration-200 ease-linear";
  const getActiveClassName: string =
    "hover:opacity-100 text-orange-300 transition-colors duration-200 ease-linear text-md border-b-2 border-orange-300";

  useEffect(() => {
    const currentPath = router.pathname;
    setActiveTab(navLinks.find((link) => link.slug === currentPath)?.slug || "/");
  }, []);

  const handleClick = useCallback(
    (slug: string) => {
      setActiveTab(slug);
    },
    [setActiveTab]
  );

  return (
    <nav {...props}>
      {navLinks.map((link: NavLink) => (
        <>
          <Link href={link.slug} key={link.slug}>
            <a className={activeTab === link.slug ? getActiveClassName : getInActiveClassName}>
              <button onClick={() => handleClick("/")}>{link.label}</button>
            </a>
          </Link>
        </>
      ))}
    </nav>
  );
};

export default NavBar;
