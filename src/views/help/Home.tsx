import Header from "@/sections/Header";
import Footer from "@/sections/Footer";
import { HelpHome } from "@/components/help/HelpHome";

/**
 * Server component — title/description/canonical come from app/help/page.tsx
 * `metadata` and are rendered into the server HTML. The old client-side <Seo>
 * would have pulled react-helmet-async's React context into the server bundle.
 */
export default function HelpHomePage() {
  return (
    <>
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
