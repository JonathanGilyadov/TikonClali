import React, { useState } from "react";
import {
  TextField,
  Button,
  Container,
  Paper,
  Typography,
  Alert,
} from "@mui/material";

const AdminLoginPage = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (password === "adminpass123") {
      // 🔐 Should match .env ADMIN_TOKEN
      localStorage.setItem("adminToken", "supersecret123");
      window.location.href = "/admin";
    } else {
      setError("סיסמה שגויה");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          כניסת מנהל
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          fullWidth
          type="password"
          label="סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ my: 2 }}
        />
        <Button fullWidth variant="contained" onClick={handleLogin}>
          התחבר
        </Button>
      </Paper>
    </Container>
  );
};

export default AdminLoginPage;
