
import Hero from "../../sections/Hero";
import Apartments from "../../sections/Apartments";
import PageLayout from "../../components/pagelayout/index";

/**
 * Stays a server component: title/description/canonical now come from
 * app/page.tsx's `metadata`, and the Organization + WebSite JSON-LD is
 * emitted server-side by app/layout.tsx. The old client-side <Seo> here
 * would have pulled react-helmet-async (and its React context) into the
 * server bundle.
 */
const HomePage = () => {
  return (
    <PageLayout
      children={
        <>
          <Hero />
          <Apartments />
        </>
      }
    />
  );
};

export default HomePage;
