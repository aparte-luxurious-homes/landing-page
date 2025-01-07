import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Typography, Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import aboutUsImage from '../assets/images/about2.png';
import anotherImage from '../assets/images/about1.png';
import aboutImage2 from '../assets/images/about3.png';
import aboutImage3 from '../assets/images/about4.png';
import questionMarkImage from '../assets/images/question.png';
import assistImage from '../assets/images/assist.png'

const AboutUs: React.FC = () => {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <div className="">
      <div>
        <img 
          src={aboutUsImage} 
          alt="About Us" 
          style={{ 
            width: '100%', 
            maxWidth: 'none', 
            height: 'auto',
            borderRadius: '8px', 
            paddingTop: '100px',
          }} 
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
        <img 
          src={anotherImage} 
          alt="Another Image" 
          style={{ 
            width: '50%', 
            maxWidth: 'none', 
            height: 'auto',
            borderRadius: '8px' 
          }} 
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
        <img 
          src={aboutImage2} 
          alt="About Image 2" 
          style={{ 
            width: '70%', 
            maxWidth: 'none', 
            height: 'auto',
            borderRadius: '8px' 
          }} 
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
        <img 
          src={aboutImage3} 
          alt="About Image 2" 
          style={{ 
            width: '70%', 
            maxWidth: 'none', 
            height: 'auto',
            borderRadius: '8px' 
          }} 
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
        <Link to="/list-your-aparte" style={{ textDecoration: 'none' }}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#028090',
              color: 'white',
              borderRadius: '6px',
              padding: '10px 20px',
              '@media (min-width:600px)': {
                padding: '15px 50px',
              },
            }}
            component={Link}
            to="/list-your-aparte"
          >
            List Your Aparte
          </Button>
        </Link>
      </div>

    {/* Frequently Asked Questions Section */}
    <Box sx={{ backgroundColor: '#F4F4F4', py: 8, mt: 4,  position: 'relative' }}>
        <div className="px-4 sm:px-10">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: 2,
          }}
    >
      {/* Section Header */}
      <Box
        className="mt-4 text-left font-[24px] text-[28px]"
        sx={{
          width: '100%',
          marginLeft: { sm: '0', md: '85px', lg: '200px' },
          marginRight: 'auto',
          textAlign: { xs: 'left', md: 'left' }, 
          fontWeight: 'bold'
        }}
      >
        Frequently Asked <br /> Questions
      </Box>

      {/* Accordion Items */}
      <Box
        sx={{
          flex: '1 1 auto',
          marginRight: { xs: 0, md: 14, lg: 16 }, 
          marginTop: { xs: 2, md: 0 }, 
          position: 'relative',
          zIndex: 1,
        }}
      >
        {[
          { question: "What is Aparte Luxurious Home?", answer: "Aparte Luxurious Home is a premier apartment hosting platform that connects discerning travelers with upscale, handpicked accommodations." },
          { question: "How do I list my apartment?", answer: "You can list your apartment by clicking on the 'List Your Aparte' button and following the instructions." },
          { question: "What are the benefits of listing my apartment?", answer: "Listing your apartment with Aparte Luxurious Home provides you with access to a large audience of discerning travelers, professional marketing, and dedicated support." },
          { question: "How do I book an apartment?", answer: "You can book an apartment by browsing our listings, selecting your desired dates, and completing the booking process online." },
          { question: "What is the cancellation policy?", answer: "The cancellation policy varies by property. Please refer to the specific listing for details." },
        ].map((item, index) => (
          <Accordion
            key={index}
            expanded={expanded === `panel${index}`}
            onChange={handleChange(`panel${index}`)}
            sx={{
              backgroundColor: 'transparent',
              boxShadow: 'none',
              border: 'none',
              mb: 0.1,
              padding: '16px',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${index}bh-content`}
              id={`panel${index}bh-header`}
            >
              <Typography sx={{ fontWeight: 'bold', fontSize: '1rem' }}>{item.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography  sx={{ fontSize: '0.95rem', lineHeight: 1.6 }}>{item.answer}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
        <img
          src={questionMarkImage}
          alt="Question Mark"
          style={{
            position: 'absolute',
            top: '50%',
            right: '18%',
            transform: 'translateY(-50%)',
            width: '300px',
            height: '400px',
            opacity: 1,
            zIndex: 0,
          }}
        />
      </Box>
      </Box>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
        <img 
          src={assistImage} 
          alt="Assist Image" 
          style={{ 
            width: '80%', 
            maxWidth: 'none', 
            height: 'auto',
            borderRadius: '8px',
          }} 
        />
      </div>
      </Box>

    </div>
  );
};

export default AboutUs;
