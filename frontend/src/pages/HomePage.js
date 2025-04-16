import React, { useEffect, useState } from "react";
import { Container, Typography, Box, Button, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchRequests, fetchChapters } from "../api/api";
import RequestTable from "../components/RequestTable";

const HomePage = () => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Load chapters once on mount
  useEffect(() => {
    fetchChapters()
      .then(setChapters)
      .catch((err) => console.error("Failed to load chapters:", err));
  }, []);

  // Load requests on mount and whenever searchQuery changes
  useEffect(() => {
    loadRequests(searchQuery);
  }, [searchQuery]);

  const loadRequests = async (query = "") => {
    try {
      const reqs = await fetchRequests(query);
      setRequests(reqs);
    } catch (err) {
      console.error("Failed to load requests:", err);
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
