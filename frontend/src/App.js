import React from "react";
import {
  ThemeProvider,
  CssBaseline,
  Box,
  TextField,
  Typography,
} from "@mui/material";
import { theme, cacheRtl } from "./theme";
import { CacheProvider } from "@emotion/react";
import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import CreateRequestPage from "./pages/CreateRequestPage";
import Header from "./components/Header";
import ReadPage from "./pages/ReadPage";
import RequestReadingPage from "./pages/RequestReadingPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => (
  <CacheProvider value={cacheRtl}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box dir="rtl">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create-request" element={<CreateRequestPage />} />
          <Route path="/read" element={<ReadPage />} />
          <Route path="/read/:id" element={<RequestReadingPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Box>
      <Box
        component="footer"
        sx={{
          py: 2,
          textAlign: "center",
          backgroundColor: (theme) => theme.palette.background.paper,
          position: "absolute",
          bottom: 0,
          width: "100%",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          האתר נבנה על ידי Tech Systems
        </Typography>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} תיקון כללי. כל הזכויות שמורות.
        </Typography>
      </Box>
    </ThemeProvider>
  </CacheProvider>
);

export default App;
