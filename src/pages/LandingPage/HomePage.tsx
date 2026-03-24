
import Hero from "../../sections/Hero";
import Apartments from "../../sections/Apartments";
import PageLayout from "../../components/pagelayout/index";


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
