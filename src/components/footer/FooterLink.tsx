import React from 'react';
import { Link } from 'react-router-dom';

interface FooterLinkProps {
  text: string;
  href: string;
  disabled?: boolean;
}

export const FooterLink: React.FC<FooterLinkProps> = ({ text, href, disabled }) => {
  if (disabled) {
    return (
      <span className="text-inherit" style={{ color: 'inherit' }}>
        {text}
      </span>
    );
  }

  return (
    <Link
      to={href}
      className={`hover:underline ${
        text === "Become a Partner" ? "text-[#028090] underline" : ""
      }`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      {text}
    </Link>
  );
};
