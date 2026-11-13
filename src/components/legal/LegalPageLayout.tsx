'use client';

import { useEffect } from "react";
import { useLocation } from '@/lib/router';
import Header from "@/sections/Header";
import Footer from "@/sections/Footer";
import type { LegalDocument } from "@/content/legal/types";

interface LegalPageLayoutProps {
  doc: LegalDocument;
}

export function LegalPageLayout({ doc }: LegalPageLayoutProps) {
  const { pathname } = useLocation();

  // Scroll to anchor on mount if URL has a hash.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.location.hash) return;
    const id = decodeURIComponent(window.location.hash.replace(/^#/, ""));
    const target = document.getElementById(id);
    if (target) {
      window.requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, []);

  return (
    <>
      <Header />
      <main className="bg-white pt-24 pb-32 lg:pb-44 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {doc.is_draft && (
            <div
              role="status"
              className="mb-6 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"
            >
              <strong className="font-semibold">DRAFT.</strong>{" "}
              This document is a working draft and has not been reviewed by legal counsel.
              Please don't rely on it for compliance until it has been finalized.
            </div>
          )}

          <header className="mb-10">
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-ink leading-tight">
              {doc.title}
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Last updated: {doc.effective_date}
            </p>
            <p className="mt-6 text-gray-700 leading-relaxed max-w-3xl">{doc.intro}</p>
          </header>

          <div className="grid lg:grid-cols-[260px_1fr] gap-10">
            {/* Sticky TOC */}
            <nav
              aria-label="Table of contents"
              className="hidden lg:block self-start lg:sticky lg:top-28"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                On this page
              </p>
              <ul className="space-y-2">
                {doc.sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="block text-sm text-gray-700 hover:text-teal leading-snug"
                    >
                      {s.heading}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Body */}
            <article className="max-w-3xl">
              {doc.sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="mb-10 scroll-mt-28"
                >
                  <h2 className="font-serif text-xl md:text-2xl font-semibold text-ink mb-3">
                    {section.heading}
                  </h2>
                  {section.body.map((para, i) => (
                    <p key={i} className="mb-3 text-gray-700 leading-relaxed">
                      {para}
                    </p>
                  ))}
                  {section.list && section.list.length > 0 && (
                    <ul className="list-disc ml-5 mb-4 text-gray-700 leading-relaxed space-y-1">
                      {section.list.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {section.subsections && section.subsections.length > 0 && (
                    <div className="mt-5 space-y-6">
                      {section.subsections.map((sub, i) => (
                        <div key={i} id={sub.id} className="scroll-mt-28">
                          <h3 className="font-serif text-base font-semibold text-teal mb-2">
                            {sub.heading}
                          </h3>
                          {sub.body.map((p, j) => (
                            <p key={j} className="mb-2 text-gray-700 leading-relaxed text-[15px]">
                              {p}
                            </p>
                          ))}
                          {sub.list && sub.list.length > 0 && (
                            <ul className="list-disc ml-5 text-gray-700 leading-relaxed space-y-1 text-[15px]">
                              {sub.list.map((item, j) => (
                                <li key={j}>{item}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ))}

              <hr className="my-10 border-gray-200" />
              <p className="text-sm text-gray-600">
                Questions about this policy? Email{" "}
                <a
                  href={`mailto:${doc.contact_email}`}
                  className="text-teal font-semibold hover:underline"
                >
                  {doc.contact_email}
                </a>
                .
              </p>
            </article>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
