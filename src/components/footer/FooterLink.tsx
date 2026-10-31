'use client';

import React from 'react';
import { Link } from '@/lib/router';

interface FooterLinkProps {
  text: string;
  href: string;
  disabled?: boolean;
  /** Open in a new tab (external links only). */
  newTab?: boolean;
  onClick?: () => void;
}

export const FooterLink: React.FC<FooterLinkProps> = ({ text, href, disabled, newTab, onClick }) => {
  if (disabled) {
    return (
      <span className="text-inherit" style={{ color: 'inherit' }}>
        {text}
      </span>
    );
  }

  const isExternal = /^(mailto:|tel:|https?:)/i.test(href);
  if (isExternal) {
    return (
      <a
        href={href}
        target={newTab ? '_blank' : undefined}
        rel={newTab ? 'noopener noreferrer' : undefined}
        onClick={onClick}
        className="hover:underline"
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        {text}
      </a>
    );
  }

  return (
    <Link
      to={href}
      className="hover:underline"
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      {text}
    </Link>
  );
};
