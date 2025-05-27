// src/pages/CreateRequestPage.js
import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Box,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import { createRequest } from "../api/api";
import { useNavigate } from "react-router-dom";

const CreateRequestPage = () => {
  const [form, setForm] = useState({
    name: "",
    purpose: "",
    chapterCount: "10",
    notes: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const chapterCount = parseInt(form.chapterCount, 10);
      const indices = Array.from({ length: 10 }, (_, i) => i);
      const shuffled = indices.sort(() => 0.5 - Math.random());
      const chapterIndices = shuffled.slice(0, chapterCount);

      const newRequest = {
        name: form.name,
        purpose: form.purpose,
        notes: form.notes,
        chapterIndices,
      };

      const res = await createRequest(newRequest);
      navigate(`/read/${res.id}`);
      setForm({
        name: "",
        purpose: "",
        chapterCount: "10",
        notes: "",
      });
      setErrorMessage("");
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          יצירת בקשת קריאה
        </Typography>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="שם האדם עבורו מתבצעת הבקשה"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            margin="normal"
          />

          <TextField
            select
            fullWidth
            label="מטרה"
            name="purpose"
            value={form.purpose}
            onChange={handleChange}
            required
            margin="normal"
          >
            <MenuItem value="רפואה שלמה">רפואה שלמה</MenuItem>
            <MenuItem value="הצלחה">הצלחה</MenuItem>
            <MenuItem value="זיווג">זיווג</MenuItem>
            <MenuItem value="שלום בית">שלום בית</MenuItem>
            <MenuItem value="פרנסה">פרנסה</MenuItem>
            <MenuItem value="אחר">אחר</MenuItem>
          </TextField>

          <TextField
            fullWidth
            label="מספר פרקים לבקשה"
            name="chapterCount"
            type="number"
            value={form.chapterCount}
            onChange={handleChange}
            required
            margin="normal"
          />

          <TextField
            fullWidth
            label="הערות (אופציונלי)"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            multiline
            rows={3}
            margin="normal"
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
          >
            שליחת בקשה
          </Button>
        </Box>
      </Paper>

      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="300px" // or 100vh for full page
        width="100%"
        sx={{
          my: 4,
        }}
      >
        <Box
          component="img"
          src="fountain.jpg"
          alt="Centered image"
          sx={{
            width: "100%",
            objectFit: "cover",

            // borderRadius: 2,
          }}
        />
      </Box>

      <Snackbar
        open={showSuccess}
        autoHideDuration={4000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowSuccess(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          הבקשה נשלחה בהצלחה!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CreateRequestPage;
