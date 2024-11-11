/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      screens: {
        'xs': '480px',   // Extra small devices (phones)
        'sm': '640px',   // Small devices (landscape phones)
        'md': '768px',   // Medium devices (tablets)
        'lg': '1024px',  // Large devices (desktops)
        'xl': '1280px',  // Extra large devices (large desktops)
        '2xl': '1536px', // 2x large devices (larger desktops)
        '3xl': '1920px', // 3x large devices (very large desktops)
        '4xl': '2560px', // 4x large devices (ultra-wide screens)
      },


      colors: {
        "other-white": "#fff",
        teal: "#028090",
        gray: {
          100: "#888",
          200: "#1a1a1a",
        },
        black: "#000",
        whitesmoke: {
          100: "rgba(235, 235, 235, 0)",
          200: "rgba(243, 243, 243, 0.9)",
        },
        "usage-active": "#108ee9",
        "gapura-light-blue": "#18c1ff",
        "usage-body": "#727272",
        "usage-title": "#313131",
      },
      spacing: {},
      fontFamily: {
        "tt-firs-neue-trl": "'TT Firs Neue Trl'",
        "button-desktop-small": "Montserrat",
      },
      borderRadius: {
        "10xs": "3px",
        "3xs": "10px",
        "8xs": "5px",
        "11xl": "30px",
        "81xl": "100px",
        "181xl": "200px",
        "21xl": "40px",
        "35xl-5": "54.5px",
      },
    },
    fontSize: {

      'md': '1.125rem', 
      xl: "20px",
      mini: "15px",
      "11xl": "30px",
      xs: "12px",
      "smi-1": "12.1px",
      "3xl": "22px",
      "16xl": "35px",
      base: "16px",
      sm: "14px",
      "31xl": "50px",
      mid: "17px",
      "2xl": "21px",
      "33xl": "52px",
      inherit: "inherit",
    },
  },
  corePlugins: {
    preflight: false,
  },
};
