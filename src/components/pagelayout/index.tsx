import Header from "../../sections/Header";

type PageLayoutProps = {
  children: React.ReactNode;
};

const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <div>
      <Header />
      <div>{children}</div>
    </div>
  );
};

export default PageLayout;
