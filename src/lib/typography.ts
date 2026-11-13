import { SERIF_STACK } from "./fonts";

/**
 * The type scale for the property page and the booking flow it hands off to.
 *
 * Sizes are Tailwind's own steps, so a size has the same name whether it is
 * set through MUI `sx` or a Tailwind class:
 *
 *   xs 0.75rem (12)   sm 0.875rem (14)   base 1rem (16)   lg 1.125rem (18)
 *   xl 1.25rem (20)   2xl 1.5rem (24)    3xl 1.875rem (30) 4xl 2.25rem (36)
 *   5xl 3rem (48)     6xl 3.75rem (60)
 *
 * Use them like this:
 *   eyebrows, captions, small labels    xs, weight 600-700
 *   secondary text, chips, nav          sm
 *   body, buttons, form values          base
 *   lead paragraph                      lg
 *   card and unit titles (serif)        xl
 *   price (serif)                       3xl
 *   section headings (serif)            3xl on phones, 4xl from md
 *   page title (serif)                  4xl / 5xl / 6xl
 *
 * Weights: 400 regular, 500 medium, 600 semibold, 700 bold. Nothing heavier.
 * Nothing smaller than 12px, except the price inside a calendar day (11px),
 * which has to fit a 40px circle.
 *
 * Fraunces (SERIF) is for headings only. Body text, labels and form values
 * stay in the sans face, which is set globally.
 */
export const TYPE = {
  xs: "0.75rem",
  sm: "0.875rem",
  base: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  "3xl": "1.875rem",
  "4xl": "2.25rem",
  "5xl": "3rem",
  "6xl": "3.75rem",
} as const;

/** Display face for headings: Fraunces, self-hosted by next/font. */
export const SERIF = SERIF_STACK;
