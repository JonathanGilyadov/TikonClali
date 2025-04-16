// src/pages/HomePage.js
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchRequests, fetchChapters } from "../api/api";
import RequestTable from "../components/RequestTable";

const HomePage = () => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchChapters()
      .then((res) => {
        setChapters(res);
        setErrorMessage("");
      })
      .catch((err) => setErrorMessage(err.message));
  }, []);

  useEffect(() => {
    loadRequests(searchQuery);
  }, [searchQuery]);

  const loadRequests = async (query = "") => {
    try {
      const reqs = await fetchRequests(query);
      setRequests(reqs);
      setErrorMessage("");
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Typography variant="h4" align="center" gutterBottom>
        תיקון כללי - קריאת פרקים למען אחרים
      </Typography>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <Typography
        variant="subtitle1"
        align="center"
        color="text.secondary"
        gutterBottom
      >
        בחרו בקשה לקריאה או צרו חדשה
      </Typography>

      <Box textAlign="center" sx={{ mb: 4 }}>
        <Button variant="contained" onClick={() => navigate("/create-request")}>
          יצירת בקשה חדשה
        </Button>
      </Box>

      <TextField
        label="חיפוש לפי שם"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={handleSearchChange}
        sx={{ mb: 3 }}
        inputProps={{ style: { textAlign: "right" } }}
      />

      <Typography variant="h6" gutterBottom>
        בקשות פעילות
      </Typography>

      <RequestTable requests={requests} chapters={chapters} />
    </Container>
  );
};

export default HomePage;
