import { Link as RouterLink } from "react-router-dom";
import type { ReactNode } from "react";

interface HelpLinkProps {
  to: string;
  className?: string;
  onClick?: () => void;
  children: ReactNode;
}

export function HelpLink({ to, className, onClick, children }: HelpLinkProps) {
  return (
    <RouterLink to={to} className={className} onClick={onClick}>
      {children}
    </RouterLink>
  );
}
