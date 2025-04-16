// components/Header.jsx
import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppBar position="static">
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" component="div">
          תיקון כללי
        </Typography>

        <Box>
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
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
