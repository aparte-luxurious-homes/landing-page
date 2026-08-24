/** @type {import('tailwindcss').Config} */
export default {
  /**
   * The App Router lives in ./app, and it was missing from this list, which
   * was still the Vite-era config. Any utility used ONLY in an app/** file was
   * therefore purged from the bundle: `flex` survived because src/** uses it
   * too, while `gap-x-4` existed nowhere else and was dropped, which is why the
   * shortlets "Other destinations" links rendered with no spacing.
   *
   * ./index.html is gone with the Vite shell, so it is no longer scanned.
   */
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      sm: "600px",
      md: "900px",
      lg: "1200px",
      xl: "1536px",
      "lg-md": "1024px",
    },


    // colors: {
    //   "other-white": "#fff",
    //   teal: {
    //     DEFAULT: "#028090",
    //     500: "#028090",
    //   },
    // },

    extend: {
      borderRadius: {
        "4xl": "2rem",
      },
      fontFamily: {
        serif: ["Fraunces", "ui-serif", "Georgia", "serif"],
      },
      colors: {
        teal: {
          DEFAULT: "#028090",
          soft: "#e6f1f3",
        },
        ink: "#0d1b1e",
      },
    },
  },

  plugins: [],
};
