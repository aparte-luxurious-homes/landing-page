
import Hero from "../../sections/Hero";
import Apartments from "../../sections/Apartments";
import PageLayout from "../../components/pagelayout/index";
import Seo from "@/components/seo/Seo";
import { organizationSchema, websiteSchema } from "@/lib/seo/schema";


const HomePage = () => {
  return (
    <PageLayout
      children={
        <>
          <Seo canonicalPath="/" jsonLd={[organizationSchema(), websiteSchema()]} />
          <Hero />
          <Apartments />
        </>
      }
    />
  );
};

export default HomePage;
