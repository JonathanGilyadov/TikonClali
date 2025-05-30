import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Paper,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchRequests, fetchChapters, fetchStats } from "../api/api";
import RequestTable from "../components/RequestTable";

const Stat = ({ label, value }) => (
  <Box sx={{ minWidth: 120 }}>
    <Typography variant="subtitle2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="h5">{value ?? 0}</Typography>
  </Box>
);

const HomePage = () => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [stats, setStats] = useState({
    totalRequests: 0,
    totalChaptersRead: 0,
  });

  // Stats only need to be fetched once
  useEffect(() => {
    fetchStats()
      .then(setStats)
      .catch((err) => setErrorMessage(err.message));
  }, []);

  // Chapters for request preview table
  useEffect(() => {
    fetchChapters()
      .then((res) => {
        setChapters(res);
        setErrorMessage("");
      })
      .catch((err) => setErrorMessage(err.message));
  }, []);

  // Limited preview requests for display
  useEffect(() => {
    loadRequests(searchQuery);
  }, [searchQuery]);

  const loadRequests = async (query = "") => {
    try {
      const reqs = await fetchRequests(query);
      setRequests(reqs.slice(0, 10));
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
      {/* <Typography variant="h4" align="center" gutterBottom>
        תיקון הכללי ביחד - קריאת פרקים למען אחרים
      </Typography> */}

      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="300px" // or 100vh for full page
        sx={{
          mb: 4,
          w: "100%",
        }}
      >
        <Box
          component="img"
          src="main.jpg"
          alt="Centered image"
          sx={{
            width: { xs: "100%", sm: "60%" },
            objectFit: "fill",
            // height: "300px",
            // borderRadius: 2,
            // boxShadow: 3,
          }}
        />
      </Box>
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

      {stats && (
        <Box elevation={2} sx={{ p: 2, mb: 4, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom color="primary">
            ✨ סטטיסטיקות המיזם
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 4,
              flexWrap: "wrap",
            }}
          >
            <Stat label="סך כל הבקשות" value={stats.totalRequests} />
            <Stat label="פרקים שנקראו עד כה" value={stats.totalChaptersRead} />
            <Stat label="סבבים שהושלמו" value={stats.totalCyclesCompleted} />
            <Stat label="מספר משתתפים" value={stats.totalParticipants} />
            <Stat label="פרקים שנקראו היום" value={stats.chaptersReadToday} />
          </Box>
        </Box>
      )}

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
        בקשות פעילות (עד 10)
      </Typography>

      <RequestTable requests={requests} chapters={chapters} />

      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="300px" // or 100vh for full page
        sx={{
          mt: 4,
          w: "100%",
        }}
      >
        <Box
          component="img"
          src="quote.jpg"
          alt="Centered image"
          sx={{
            width: "100%",
            objectFit: "cover",
            // borderRadius: 2,
            // boxShadow: 3,
          }}
        />
      </Box>
    </Container>
  );
};

export default HomePage;
