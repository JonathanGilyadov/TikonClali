import React from "react";
import { ThemeProvider, CssBaseline, Box, Typography } from "@mui/material";
import { theme, cacheRtl } from "./theme";
import { CacheProvider } from "@emotion/react";
import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import CreateRequestPage from "./pages/CreateRequestPage";
import Header from "./components/Header";
import ReadPage from "./pages/ReadPage";
import RequestReadingPage from "./pages/RequestReadingPage";

const App = () => (
  <CacheProvider value={cacheRtl}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Flex container to push footer to bottom */}
      <Box
        dir="rtl"
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Header />

        {/* Main content grows to fill remaining space */}
        <Box component="main" sx={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create-request" element={<CreateRequestPage />} />
            <Route path="/read" element={<ReadPage />} />
            <Route path="/read/:id" element={<RequestReadingPage />} />
          </Routes>
        </Box>

        {/* Footer sticks to bottom */}
        <Box
          component="footer"
          sx={{
            py: 2,
            mt: 2,
            textAlign: "center",
            backgroundColor: (theme) => theme.palette.background.paper,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            האתר נבנה על ידי Tech Systems
          </Typography>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} תיקון הכללי ביחד. כל הזכויות שמורות גמח
            חסד מה'.
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  </CacheProvider>
);

export default App;
