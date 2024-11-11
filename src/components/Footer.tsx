import { FunctionComponent } from "react";

export type FooterType = {
  className?: string;
};

const Footer: FunctionComponent<FooterType> = ({ className = "" }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  return (
    <div
      className={`absolute bottom-[0px] left-[calc(50%_-_864px)] w-[1650px] h-[586px] text-left text-md text-black font-tt-firs-neue-trl ${className}`}
    >
      <img
        className="absolute h-full w-full top-[0%] right-[0%] bottom-[0%] left-[0%] max-w-full overflow-hidden max-h-full"
        alt=""
        src="/rectangle-54.svg"
      />
      <div className="absolute h-[4.44%] w-[30.05%] top-[86.35%] right-[35%] bottom-[9.22%] left-[36.95%]">
        <a className="absolute top-[0%] left-[0%] text-black ">
          © 2024 Aparte Luxurious Homes
        </a>-
        <a className="absolute top-[0%] left-[66.68%] text-black ">
          All rights reserved
        </a>
        <a className="absolute top-[0%] left-[61.11%] font-medium text-black ">-</a>
      </div>
      <a href="#" className="absolute top-[31.06%] left-[37.79%] text-black  hover:text-teal no-underline font-bold">Support</a>
      <a href="#" className="absolute top-[31.06%] left-[59.26%] text-black hover:text-teal no-underline font-bold">Listing</a>
      <a href="#" className="absolute top-[38.91%] left-[59.26%] text-black hover:text-teal no-underline ">
        List your Aparte
      </a>
      <a href="#" className="absolute top-[38.91%] left-[37.79%] text-black hover:text-teal no-underline">Help Center</a>
      <a className="absolute w-[23.5%] top-[38.91%] left-[5.79%] leading-[32px] inline-block text-black">
        Aparte Luxurious Home is a premier apartment hosting platform that
        connects discerning travelers with upscale, handpicked accommodations.
      </a>
      <a href="#" className="absolute top-[38.91%] left-[80.5%] text-black hover:text-teal no-underline">Newsletter</a>
      <a href="#" className="absolute top-[45.05%] left-[59.26%] text-black hover:text-teal no-underline">
        Listing Resources
      </a>
      <a href="#" className="absolute top-[45.05%] left-[37.79%] text-black hover:text-teal no-underline">
        Get help with a safety issue
      </a>
      <a href="#" className="absolute top-[45.05%] left-[80.5%] text-black hover:text-teal no-underline">Features</a>
      <a href="#" className="absolute top-[51.19%] left-[59.26%] text-black hover:text-teal no-underline">Community</a>
      <a href="#" className="absolute top-[51.19%] left-[37.79%] text-black hover:text-teal no-underline">
        Disability Support
      </a>
      <a href="#" className="absolute top-[57.34%] left-[37.79%] text-black hover:text-teal no-underline">
        Cancellation Options
      </a>
      <a href="#" className="absolute top-[63.48%] left-[37.79%] text-black hover:text-teal no-underline ">
        Report Neighborhood concern
      </a>
      <a href="#" className="absolute top-[51.19%] left-[80.5%] text-black hover:text-teal no-underline">Careers</a>
      <a href="#" className="absolute top-[57.34%] left-[80.5%] text-black hover:text-teal no-underline">Investors</a>
      <a href="#" className="absolute top-[63.48%] left-[80.5%] [text-decoration:underline] font-medium text-teal">
        Become a Partner
      </a>
      <a href="#" className="absolute top-[31.06%] left-[80.5%] text-black hover:text-teal no-underline font-bold">Aparte</a>
      <img
        className="absolute h-[0.09%] w-full top-[78.16%] right-[0%] bottom-[21.76%] left-[0%] max-w-full overflow-hidden max-h-full"
        alt=""
        src="/vector-9.svg"
      />
      <div className="absolute h-[8.58%] w-[4.92%] top-[3.17%] right-[47.54%] bottom-[88.24%] left-[47.54%] text-center text-mini">
        <img
          className="absolute h-[41.55%] w-[70.59%] top-[0%] right-[14.71%] bottom-[58.45%] left-[14.71%] rounded-10xs max-w-full overflow-hidden max-h-full"
          alt=""
          src="/vector-10.svg"
        />
        <a href="#" className="absolute top-[62.23%] left-[8%] font-medium text-black hover:text-teal no-underline">
          Back to Top
        </a>
      </div>
      <img
        className="absolute h-[6.83%] w-[9.32%] top-[30.03%] right-[84.9%] bottom-[63.14%] left-[5.79%] max-w-full overflow-hidden max-h-full cursor-pointer transition-transform duration-500 ease-in-out transform hover:translate-y-[-10px]"
        alt=""
        src="/group-56.svg"
        onClick={scrollToTop}
      />
    </div>
  );
};

export default Footer;
