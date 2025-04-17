import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Button,
  Alert,
  TextField,
} from "@mui/material";
import { fetchRequests } from "../api/api";

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  const loadRequests = async (query = "") => {
    try {
      const res = await fetchRequests(query);
      setRequests(res);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadRequests(searchQuery);
  }, [searchQuery]);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/admin/request/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("מחיקה נכשלה");
      loadRequests(searchQuery); // reload after delete
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        ניהול בקשות
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <TextField
        fullWidth
        label="חיפוש לפי שם"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ my: 3 }}
        inputProps={{ style: { textAlign: "right" } }}
      />

      <Paper sx={{ p: 3 }}>
        {requests.map((req) => (
          <Paper
            key={req.id}
            sx={{
              p: 2,
              mb: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography>
              {req.name} - {req.purpose}
            </Typography>
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleDelete(req.id)}
            >
              מחק
            </Button>
          </Paper>
        ))}
      </Paper>
    </Container>
  );
};

export default AdminDashboard;
