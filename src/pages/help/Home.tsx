import { Helmet } from "react-helmet-async";
import Header from "@/sections/Header";
import Footer from "@/sections/Footer";
import { HelpHome } from "@/components/help/HelpHome";

export default function HelpHomePage() {
  return (
    <>
      <Helmet>
        <title>Help Center · Aparte</title>
        <meta
          name="description"
          content="Find answers about listing your property, booking a stay, managing payments, and getting support on Aparte."
        />
        <meta property="og:title" content="Aparte Help Center" />
        <meta
          property="og:description"
          content="How-to guides and answers for hosts and guests on the Aparte platform."
        />
        <meta property="og:type" content="website" />
      </Helmet>
      <Header />
      <main className="bg-white pt-24 pb-32 lg:pb-44 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <header className="mb-8">
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-ink leading-tight">
              How can we help?
            </h1>
            <p className="mt-2 text-gray-600">
              Browse guides by role, or jump straight to the{" "}
              <a href="/help/faq" className="text-teal font-semibold hover:underline">
                FAQ
              </a>
              .
            </p>
          </header>
          <HelpHome />
        </div>
      </main>
      <Footer />
    </>
  );
}
