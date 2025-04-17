import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = localStorage.getItem("adminToken") === "supersecret123";

  return (
    <AppBar
      position="static"
      elevation={1}
      sx={{
        backgroundColor: "#2E7D32",
        borderRadius: 0,
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        padding: "0 16px",
      }}
    >
      <Container maxWidth="lg">
        <Toolbar
          disableGutters
          sx={{
            display: "flex",
            justifyContent: "space-between",
            minHeight: 48,
            px: 2,
          }}
        >
          <Typography variant="h6" component="div" fontWeight={600}>
            תיקון כללי
          </Typography>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              color="inherit"
              onClick={() => navigate("/")}
              disabled={location.pathname === "/"}
            >
              דף הבית
            </Button>
            <Button
              color="inherit"
              onClick={() => navigate("/create-request")}
              disabled={location.pathname === "/create-request"}
            >
              יצירת בקשה
            </Button>

            {isAdmin && (
              <Button
                color="inherit"
                onClick={() => navigate("/admin")}
                disabled={location.pathname === "/admin"}
              >
                ניהול
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
