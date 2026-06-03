import * as React from "react";
import { Container, Box } from "@mui/material";
import { FooterSection } from "../components/footer/FooterSection";
import { Link } from 'react-router-dom';
import vector from "../assets/images/footer/Vector10.png";
import rectangle from "../assets/images/footer/Rectangle54.png";
import FooterAccordion from "../components/footer/FooterAccordion";
import { clearConsent, isGaConfigured, isClarityConfigured } from "@/analytics";

const Footer: React.FC = () => {
  // Only offer the re-open control where analytics actually runs (production).
  const analyticsAvailable = isGaConfigured() || isClarityConfigured();
  const openCookieSettings = () => {
    clearConsent();
    window.location.reload();
  };

  const supportLinks = [
    { text: "About Us", href: "/about" },
    { text: "Help Center", href: "/help" },
    { text: "FAQ", href: "/help/faq" },
    { text: "Contact us", href: "mailto:support@aparte.ng" },
  ];

  const listingLinks = [
    { text: "List your Aparte", href: "/list" },
    { text: "Owner Help Center", href: "/help/owners" },
    { text: "Agent Help Center", href: "/help/agents" },
    { text: "Guest Help Center", href: "/help/guests" },
  ];

  const legalLinks = [
    { text: "Terms & Conditions", href: "/terms" },
    { text: "Privacy Policy", href: "/privacy-policy" },
    { text: "Cancellation Policy", href: "/cancellation-policy" },
  ];

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const currentYear = new Date().getFullYear();
  
  return (
    <footer
      className="flex flex-col relative bg-cover bg-center lg:-mt-40 -mt-28"
      style={{
        border: "none",
      }}
    >
      <img
        loading="lazy"
        src={rectangle}
        alt=""
        className="object-cover absolute inset-0 size-full"
      />
      <Container
        maxWidth="xl"
        sx={{
          px: { xs: 0, sm: 0, md: 4, lg: 5, xl: 6 },
        }}
      >
        <div className="flex relative flex-col items-center py-6 px-4 sm:py-10 md:py-8 lg:py-6 xl:py-4 w-full min-h-[586px] max-md:max-w-full">
          <button className="flex flex-col items-center" onClick={scrollToTop}>
            <img
              src={vector}
              alt="Back to top button"
              className="absolute z-10"
              style={{ border: "none" }}
            />
            <span className="relative mt-8 text-base font-medium text-center text-black">
              Back to Top
            </span>
          </button>

          <div className="relative grid gap-10 mt-28 w-full max-w-[1465px] grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-md:mt-10 max-md:max-w-full">
            <div className="flex flex-col text-xl leading-8 text-black max-md:mt-10 pl-4 md:pl-12">
              <Link to="/about" style={{ textDecoration: 'none', color: 'inherit' }}>
                <img
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/3b38bbc7c5ff8c386fd93465ae15df57abad2ed77415c2a134724b60741e6ac0?placeholderIfAbsent=true&apiKey=8e9d8cabec6941f3ad44d75c45253ccb"
                  alt="Aparte Luxurious Home logo"
                  className="object-contain max-w-full aspect-[5.03] w-[161px]"
                  style={{ border: "none" }} 
                />
                <p className="mt-5">
                  Aparte Luxurious Home is a premier apartment hosting platform
                  that connects discerning travelers with upscale, handpicked
                  accommodations.
                </p>
              </Link>
            </div>
            
            {/* Desktop View */}
            <Box sx={{ display: { xs: 'none', md: 'grid' }, gridColumn: '2 / -1', gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div className="pl-12">
                <FooterSection title="Support" links={supportLinks} />
              </div>
              <div className="pl-12">
                <FooterSection title="Hosting" links={listingLinks} />
              </div>
              <div className="pl-12">
                <FooterSection title="Legal" links={legalLinks} />
              </div>
            </Box>

            {/* Mobile View */}
            <Box sx={{ display: { xs: 'block', md: 'none' }, gridColumn: '1 / -1', px: 2 }}>
              <FooterAccordion title="Support" links={supportLinks} />
              <FooterAccordion title="Hosting" links={listingLinks} />
              <FooterAccordion title="Legal" links={legalLinks} />
            </Box>
          </div>

          <hr className="w-full border-t border-gray-300 mt-12" />

          <div className="flex relative flex-wrap gap-1 md:gap-5 mt-12 w-full text-xl text-black max-md:mt-10">
            <div className="flex flex-auto flex-col md:flex-row items-center gap-3 md:gap-5 justify-center md:justify-between">
              <p className="text-black max-md:text-[#028090] text-center md:text-left text-base md:text-xl">
                © {currentYear} Aparte Luxurious Homes - All rights reserved
              </p>
              {analyticsAvailable && (
                <button
                  type="button"
                  onClick={openCookieSettings}
                  className="text-sm md:text-base text-black/70 hover:text-black underline underline-offset-2"
                >
                  Cookie settings
                </button>
              )}
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
