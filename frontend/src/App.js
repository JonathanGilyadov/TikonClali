import React from "react";
import { ThemeProvider, CssBaseline, Box, TextField } from "@mui/material";
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
    </ThemeProvider>
  </CacheProvider>
);

export default App;
