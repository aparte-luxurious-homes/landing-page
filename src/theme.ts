import { createTheme } from "@mui/material/styles";

// Extend the Breakpoints interface to include custom breakpoints
declare module "@mui/material/styles" {
  interface BreakpointOverrides {
    xs: true;
    sm: true;
    md: true;
    lg: true;
    xl: true;
    lgMd: true;
  }
}

// Extend the PaletteOptions interface to include custom colors
declare module "@mui/material/styles/createPalette" {
  interface Palette {
    list: Palette["primary"];
    title: Palette["primary"];
  }
  interface PaletteOptions {
    list?: PaletteOptions["primary"];
    title?: PaletteOptions["primary"];
  }
}

// Extend the TypographyOptions interface to include custom typography styles
declare module "@mui/material/styles/createTypography" {
  interface Typography {
    list: React.CSSProperties;
    title: React.CSSProperties;
  }
  interface TypographyOptions {
    list?: React.CSSProperties;
    title?: React.CSSProperties;
  }
}

const theme = createTheme({
  palette: {
    primary: {
      main: "#028090",
    },
    background: {
      default: "#ffffff",
    },
    text: {
      primary: "#000000",
    },
    list: {
      main: "#888888",
    },
    title: {
      main: "#191919",
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
      lgMd: 1024,
  },
},
components: {
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundColor: "#191919",
      },
    },
  },
},
typography: {
  fontFamily: "TT Firs Neue TRL, sans-serif",
  body1: {
    // spell-checker: disable-next-line
    fontFamily: "TT Firs Neue TRL, sans-serif",
    lineHeight: "1.6",
  },
  list: {
    color: "#888888",
  },
  title: {
    color: "#191919",
  },
},
});

export default theme;