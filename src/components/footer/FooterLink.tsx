import * as React from "react";

interface FooterLinkProps {
  text: string;
  href: string;
}

export const FooterLink: React.FC<FooterLinkProps> = ({ text, href }) => (
  <a
    href={href}
    className={`mt-2.5 hover:underline ${
      text === "Become a Partner" ? "text-[#028090] underline" : ""
    }`}
  >
    {text}
  </a>
);
