// theme.js
import { createTheme } from "@mui/material/styles";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";
import createCache from "@emotion/cache";

export const theme = createTheme({
  direction: "rtl",
  typography: {
    fontFamily: `'Assistant', 'Rubik', 'Arial', sans-serif`,
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { color: "#666" },
  },
  palette: {
    primary: {
      main: "#2E7D32", // deep green
    },
    secondary: {
      main: "#1565C0", // deep blue
    },
    background: {
      default: "#F7FAFC",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          padding: "1.5rem",
          boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
          borderRadius: "16px",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: "none",
          fontWeight: 600,
          paddingInline: "1.5rem",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "12px 16px",
          fontSize: "0.95rem",
        },
        head: {
          backgroundColor: "#F0F4F8",
          fontWeight: "bold",
          color: "#333",
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 8,
          borderRadius: 4,
        },
        bar: {
          borderRadius: 4,
        },
      },
    },
  },
});

export const cacheRtl = createCache({
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
});
