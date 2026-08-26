'use client';

import * as React from "react";
import { Container, Box } from "@mui/material";
import { FooterSection } from "../components/footer/FooterSection";
import { Link } from '@/lib/router';
import vector from "../assets/images/footer/Vector10.png";
import rectangle from "../assets/images/footer/Rectangle54.png";
import FooterAccordion from "../components/footer/FooterAccordion";
import { clearConsent, isGaConfigured, isClarityConfigured } from "@/analytics";
import {
  SITE_NAME,
  SITE_ALTERNATE_NAME,
  SITE_REGISTERED_NAME,
  SITE_RC_NUMBER,
} from "@/lib/seo/config";

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
    // Visible counterparts of Organization.sameAs (src/lib/seo/config.ts) —
    // keeps the social presence human-visible AND machine-readable.
    { text: "Instagram", href: "https://www.instagram.com/aparte_ng" },
    { text: "X (Twitter)", href: "https://x.com/theaparteng" },
    { text: "Facebook", href: "https://www.facebook.com/profile.php?id=100068835872133" },
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

  // Crawlable path into the city landing pages — the footer is the one
  // internal-link hub every route shares.
  const destinationLinks = [
    { text: "Shortlets in Lagos", href: "/shortlets/lagos" },
    { text: "Shortlets in Lekki", href: "/shortlets/lekki" },
    { text: "Shortlets in Abuja", href: "/shortlets/abuja" },
    { text: "Shortlets in Port Harcourt", href: "/shortlets/port-harcourt" },
    { text: "All destinations", href: "/shortlets" },
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
        src={rectangle.src}
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
              src={vector.src}
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
                  alt="Aparte logo"
                  className="object-contain max-w-full aspect-[5.03] w-[161px]"
                  style={{ border: "none" }} 
                />
                <p className="mt-5">
                  Aparte is a Nigerian short-let booking platform. Every
                  listing is verified before it goes live, caution fees are
                  refundable, and your payment is held until you check in.
                </p>
              </Link>
            </div>
            
            {/* Desktop View */}
            <Box sx={{ display: { xs: 'none', md: 'grid' }, gridColumn: '2 / -1', gridTemplateColumns: 'repeat(4, 1fr)' }}>
              <div className="pl-12">
                <FooterSection title="Support" links={supportLinks} />
              </div>
              <div className="pl-12">
                <FooterSection title="Hosting" links={listingLinks} />
              </div>
              <div className="pl-12">
                <FooterSection title="Destinations" links={destinationLinks} />
              </div>
              <div className="pl-12">
                <FooterSection title="Legal" links={legalLinks} />
              </div>
            </Box>

            {/* Mobile View */}
            <Box sx={{ display: { xs: 'block', md: 'none' }, gridColumn: '1 / -1', px: 2 }}>
              <FooterAccordion title="Support" links={supportLinks} />
              <FooterAccordion title="Hosting" links={listingLinks} />
              <FooterAccordion title="Destinations" links={destinationLinks} />
              <FooterAccordion title="Legal" links={legalLinks} />
            </Box>
          </div>

          <hr className="w-full border-t border-gray-300 mt-12" />

          <div className="flex relative flex-wrap gap-1 md:gap-5 mt-12 w-full text-xl text-black max-md:mt-10">
            <div className="flex flex-auto flex-col md:flex-row items-center gap-3 md:gap-5 justify-center md:justify-between">
              {/* Registered-entity disclosure. Mirrors Organization.legalName /
                  identifier in the JSON-LD (src/lib/seo/schema.ts, rendered by
                  app/layout.tsx) so the visible page and the structured data
                  tell bots and AI answer engines the same thing. */}
              <div className="flex flex-col gap-1 text-center md:text-left">
                <p className="text-black max-md:text-[#028090] text-base md:text-xl">
                  © {currentYear} {SITE_REGISTERED_NAME}. All rights reserved.
                </p>
                <p className="text-sm md:text-base text-black/70">
                  {SITE_NAME} and {SITE_ALTERNATE_NAME} are trading names of{" "}
                  {SITE_REGISTERED_NAME}, a company registered in Nigeria. RC{" "}
                  {SITE_RC_NUMBER}.
                </p>
              </div>
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
