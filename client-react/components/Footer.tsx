import type { ReactNode } from 'react';

interface Props extends React.HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}
const Footer = ({ children, ...props }: Props): JSX.Element => {
  return <footer {...props}>{children}</footer>;
};

export default Footer;
