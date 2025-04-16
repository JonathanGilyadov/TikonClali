// src/pages/ReadPage.js
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  LinearProgress,
  Box,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchRequests, fetchChapters } from "../api/api";

const ReadPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [chapters, setChapters] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [reqs, chaps] = await Promise.all([
        fetchRequests(),
        fetchChapters(),
      ]);
      setRequests(reqs);
      setChapters(chaps);
    };

    load();
  }, []);

  const getProgressData = (request) => {
    const selected = request.chapterIndices.map((i) => chapters[i]);
    const completed = selected.filter((ch) =>
      request.progress?.includes(ch.id),
    ).length;
    return {
      total: selected.length,
      completed,
      percent: (completed / selected.length) * 100,
      isComplete: completed === selected.length,
    };
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        בקשות קריאה פעילות
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>שם</TableCell>
              <TableCell>מטרה</TableCell>
              <TableCell>הערות</TableCell>
              <TableCell>התקדמות</TableCell>
              <TableCell align="center">סטטוס</TableCell>
              <TableCell align="center">פעולה</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((req) => {
              const { completed, total, percent, isComplete } =
                getProgressData(req);

              return (
                <TableRow key={req.id}>
                  <TableCell>{req.name}</TableCell>
                  <TableCell>{req.purpose}</TableCell>
                  <TableCell>{req.notes || "—"}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ width: "100%", transform: "scaleX(-1)" }}>
                        <LinearProgress
                          variant="determinate"
                          value={percent}
                          color={isComplete ? "success" : "primary"}
                        />
                      </Box>
                      <Typography variant="body2">
                        {completed}/{total}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    {isComplete ? (
                      <Chip label="הושלם" color="success" />
                    ) : (
                      <Chip label="ממתין" color="warning" />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/read/${req.id}`)}
                    >
                      מעבר לקריאה
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ReadPage;
