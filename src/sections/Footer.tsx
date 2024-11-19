import * as React from "react";
import { Container } from "@mui/material";
import { FooterSection } from "../components/footer/FooterSection";
import vector from "../assets/images/footer/Vector10.png";
import rectangle from "../assets/images/footer/Rectangle54.png";

const Footer: React.FC = () => {
  const supportLinks = [
    { text: "Help Center", href: "#" },
    { text: "Get help with a safety issue", href: "#" },
    { text: "Disability Support", href: "#" },
    { text: "Cancellation Options", href: "#" },
    { text: "Report Neighborhood concern", href: "#" },
  ];

  const listingLinks = [
    { text: "List your Aparte", href: "#" },
    { text: "Listing Resources", href: "#" },
    { text: "Community", href: "#" },
    { text: "Become an Affiliate", href: "#" },
  ];

  const aparteLinks = [
    { text: "Newsletter", href: "#" },
    { text: "Features", href: "#" },
    { text: "Careers", href: "#" },
    { text: "Investors", href: "#" },
    { text: "Become a Partner", href: "#" },
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
            <div className="flex flex-col text-xl leading-8 text-black max-md:mt-10">
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/3b38bbc7c5ff8c386fd93465ae15df57abad2ed77415c2a134724b60741e6ac0?placeholderIfAbsent=true&apiKey=8e9d8cabec6941f3ad44d75c45253ccb"
                alt="Aparte Luxurious Home logo"
                className="object-contain max-w-full aspect-[5.03] w-[161px]"
                style={{ border: "none" }} // Ensure no border is applied
              />
              <p className="mt-5">
                Aparte Luxurious Home is a premier apartment hosting platform
                that connects discerning travelers with upscale, handpicked
                accommodations.
              </p>
            </div>
            <FooterSection title="Support" links={supportLinks} />
            <FooterSection title="Listing" links={listingLinks} />
            <FooterSection title="Aparte" links={aparteLinks} />
          </div>

          <hr className="w-full border-t border-gray-300 mt-12" />

          <div className="flex relative flex-wrap gap-1 md:gap-5 mt-12 max-w-full text-xl text-black w-[519px] max-md:mt-10">
            <div className="flex flex-auto gap-2">
              <p className="flex-auto text-black max-md:text-[#028090]">
                © {currentYear} Aparte Luxurious Homes
              </p>
              <span className="font-medium hidden md:inline">-</span>
            </div>
            <p className="grow shrink w-[138px]">All rights reserved</p>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
