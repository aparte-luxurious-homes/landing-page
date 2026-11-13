import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";

/**
 * The site's two typefaces, self-hosted by next/font at build time.
 *
 * Use them through the CSS variables, never by family name: next/font serves
 * each face under a generated family name, so a literal "Fraunces" or
 * "Plus Jakarta Sans" in a style matches nothing and falls back silently.
 *
 *   --font-sans   body text, UI   (Tailwind `font-sans`, MUI theme, index.css)
 *   --font-serif  display / headings (Tailwind `font-serif`, SERIF in
 *                 src/components/property/ui.tsx)
 *
 * Body text was "TT Firs Neue Trl" from fonts.cdnfonts.com: TypeType's trial
 * build, with no naira sign, so every price drew "₦" from a fallback font.
 * Plus Jakarta Sans has ₦ (in the latin-ext subset, hence both subsets) and is
 * the face of Aparte's PDF statements and reports.
 */
export const sans = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});

/** Variable font: every weight, plus the optical-size axis the headings use. */
export const serif = Fraunces({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-serif",
});

/** Fallback stacks, used where a raw font-family string is needed (MUI sx). */
export const SANS_STACK =
  "var(--font-sans), system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";
export const SERIF_STACK = "var(--font-serif), ui-serif, Georgia, serif";
