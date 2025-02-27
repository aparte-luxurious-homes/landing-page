import React, { useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Link } from 'react-router-dom';

interface FooterAccordionProps {
  title: string;
  links: Array<{
    text: string;
    href: string;
    comingSoon?: boolean;
  }>;
}

const FooterAccordion: React.FC<FooterAccordionProps> = ({ title, links }) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      sx={{
        backgroundColor: 'transparent',
        boxShadow: 'none',
        '&:before': {
          display: 'none',
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          padding: 0,
          '& .MuiAccordionSummary-content': {
            margin: '12px 0',
          },
        }}
      >
        <Typography
          sx={{
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: 'black',
          }}
        >
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ padding: '0 0 16px 0' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {links.map((link, index) => (
            <Box 
              key={index} 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 1,
                opacity: link.comingSoon ? 0.6 : 1,
                cursor: link.comingSoon ? 'not-allowed' : 'pointer',
              }}
            >
              {link.comingSoon ? (
                <span style={{ color: '#666', fontSize: '0.9rem' }}>
                  {link.text}
                </span>
              ) : (
                <Link
                  to={link.href}
                  style={{ 
                    textDecoration: 'none',
                    color: '#666',
                    fontSize: '0.9rem',
                  }}
                >
                  {link.text}
                </Link>
              )}
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
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default FooterAccordion; 