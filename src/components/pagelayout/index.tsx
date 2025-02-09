import Header from "../../sections/Header";
import Footer from "../../sections/Footer";
import Partner from "../../sections/Partner";

type PageLayoutProps = {
  children: React.ReactNode;
};

const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <div>
      <Header />
      <div>{children}</div>
      <Partner />
      <Footer />
    </div>
  );
};

export default PageLayout;
