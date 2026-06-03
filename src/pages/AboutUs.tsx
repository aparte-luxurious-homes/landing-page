import { Link } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import Header from "../sections/Header";
import Footer from "../sections/Footer";
import Partner from "../sections/Partner";
import { aboutContent } from "@/content/about";
import aboutUsImage from "../assets/images/about2.png";
import anotherImage from "../assets/images/about1.png";
import questionMarkImage from "../assets/images/question.png";

const AboutUs: React.FC = () => {
  const { hero, howItWorks, whyAparte, values, cta, faqTeaser } = aboutContent;

  return (
    <>
      <Seo
        title="About Us"
        description={hero.body}
        canonicalPath="/about"
        type="article"
      />
      <Header />

      <main className="bg-white">
        {/* Hero */}
        <section className="relative pt-28 pb-16 md:pt-32 md:pb-24 overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-teal mb-3">
                  {hero.eyebrow}
                </p>
                <h1 className="font-serif text-4xl md:text-5xl font-semibold text-ink leading-tight">
                  {hero.headline}
                </h1>
                <p className="mt-5 text-base md:text-lg text-gray-700 leading-relaxed max-w-xl">
                  {hero.body}
                </p>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={aboutUsImage}
                  alt="Aparte properties"
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-gray-50 py-16 md:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-ink text-center mb-12">
              {howItWorks.title}
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {howItWorks.columns.map((col, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-teal-soft text-teal flex items-center justify-center font-serif text-xl font-bold">
                    {i + 1}
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-ink mb-2">
                    {col.title}
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{col.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Aparte */}
        <section className="py-16 md:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 items-center">
              <div className="rounded-2xl overflow-hidden">
                <img
                  src={anotherImage}
                  alt="A welcoming Aparte interior"
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
              </div>
              <div>
                <h2 className="font-serif text-3xl md:text-4xl font-semibold text-ink mb-8">
                  {whyAparte.title}
                </h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  {whyAparte.pillars.map((p, i) => (
                    <div key={i}>
                      <h3 className="font-serif text-base font-semibold text-teal mb-2">
                        {p.title}
                      </h3>
                      <p className="text-sm text-gray-700 leading-relaxed">{p.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-[#f9f7f3] py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-ink text-center mb-10">
              {values.title}
            </h2>
            <div className="space-y-8">
              {values.items.map((v, i) => (
                <div
                  key={i}
                  className="flex flex-col md:flex-row gap-4 md:gap-8 md:items-start"
                >
                  <h3 className="font-serif text-lg font-semibold text-teal md:w-48 shrink-0">
                    {v.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{v.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA strip */}
        <section className="py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl bg-teal text-white p-8 md:p-12 text-center">
              <h2 className="font-serif text-2xl md:text-3xl font-semibold mb-3">
                {cta.headline}
              </h2>
              <p className="text-white/90 max-w-2xl mx-auto">{cta.body}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {cta.buttons.map((b) => (
                  <Link
                    key={b.label}
                    to={b.href}
                    className={`px-5 py-2.5 rounded-full text-sm font-semibold inline-block transition ${
                      b.variant === "primary"
                        ? "bg-white text-teal hover:bg-white/90"
                        : "bg-transparent text-white border border-white/40 hover:bg-white/10"
                    }`}
                  >
                    {b.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ teaser */}
        <section className="bg-gray-50 py-16 md:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-[1fr_1.5fr] gap-12 items-start">
              <div>
                <h2 className="font-serif text-3xl md:text-4xl font-semibold text-ink leading-tight mb-3">
                  {faqTeaser.title}
                </h2>
                <p className="text-gray-700 mb-6">{faqTeaser.subtitle}</p>
                <img
                  src={questionMarkImage}
                  alt=""
                  className="hidden lg:block w-48 mt-6 opacity-90"
                  loading="lazy"
                />
              </div>
              <div className="space-y-4">
                {faqTeaser.items.map((item, i) => (
                  <details
                    key={i}
                    className="group rounded-xl border border-gray-200 bg-white px-5 py-4"
                  >
                    <summary className="cursor-pointer list-none flex items-start justify-between gap-4 font-semibold text-ink">
                      <span>{item.question}</span>
                      <span
                        aria-hidden
                        className="text-gray-400 transition-transform group-open:rotate-180 mt-0.5"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </span>
                    </summary>
                    <p className="mt-3 text-sm text-gray-700 leading-relaxed">
                      {item.answer}
                    </p>
                  </details>
                ))}
                <div className="pt-2">
                  <Link
                    to={faqTeaser.cta.href}
                    className="text-sm font-semibold text-teal hover:underline"
                  >
                    {faqTeaser.cta.label}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Partner />
      <Footer />
    </>
  );
};

export default AboutUs;
