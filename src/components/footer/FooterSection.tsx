import * as React from 'react';
import { FooterLink } from './FooterLink';

interface FooterLinkProps {
  text: string;
  href: string;
}


interface FooterSectionProps {
  title: string;
  links: FooterLinkProps[];
}

export const FooterSection: React.FC<FooterSectionProps> = ({ title, links }) => (
  <div className="flex flex-col items-start mt-1.5 text-xl text-black max-md:mt-10">
    <h3 className="font-semibold">{title}</h3>
    <nav className="flex flex-col mt-5">
      {links.map((link, index) => (
        <FooterLink key={index} {...link} />
      ))}
    </nav>
  </div>
);