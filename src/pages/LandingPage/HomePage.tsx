
import Hero from "../../sections/Hero";
// import PropertyTypes from "../../sections/PropertyTypes";
import Apartments from "../../sections/Apartments";
import PageLayout from "../../components/pagelayout/index";


const HomePage = () => {
  return (
    <PageLayout
      children={
        <>
          <Hero />
          {/* <PropertyTypes /> */}
          <Apartments />
        </>
      }
    />
  );
};

export default HomePage;
