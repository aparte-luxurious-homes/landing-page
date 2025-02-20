import * as React from 'react';
import { Box, Typography } from '@mui/material';
import { FooterLink } from './FooterLink';

interface FooterLinkProps {
  text: string;
  href: string;
  comingSoon?: boolean;
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
        <Box 
          key={index} 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mt: 1.5, 
            gap: 1,
            opacity: link.comingSoon ? 0.6 : 1,
            cursor: link.comingSoon ? 'not-allowed' : 'pointer',
          }}
        >
          <FooterLink {...link} disabled={link.comingSoon} />
          {link.comingSoon && (
            <Box
              sx={{
                backgroundColor: "transparent",
                color: "#028090",
                fontSize: "8px",
                padding: "1px 6px",
                borderRadius: "8px",
                fontWeight: "bold",
                border: "1px solid #028090",
                whiteSpace: 'nowrap',
                lineHeight: 1.2,
              }}
            >
              Coming Soon
            </Box>
          )}
        </Box>
      ))}
    </nav>
  </div>
);