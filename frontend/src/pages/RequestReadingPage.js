import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Chip,
  LinearProgress,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { Snackbar, Alert } from "@mui/material";
import {
  fetchChapters,
  fetchRequestById,
  updateRequestProgress,
} from "../api/api";
import confetti from "canvas-confetti";

const RequestReadingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [progress, setProgress] = useState([]);
  const [cycleCount, setCycleCount] = useState(0);
  const [showSnackbar, setShowSnackbar] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [req, allChapters] = await Promise.all([
        fetchRequestById(id),
        fetchChapters(),
      ]);

      setRequest(req);
      setChapters(allChapters);
      setProgress(req.progress || []);
      setCycleCount(req.cycleCount || 0);
    };

    loadData();
  }, [id]);

  const handleMarkRead = async (chapterId) => {
    const updated = await updateRequestProgress(request.id, chapterId);

    setRequest(updated);
    setProgress(updated.progress);
    setCycleCount(updated.cycleCount);

    // Detect cycle reset
    if (updated.cycleCount > cycleCount) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });

      setShowSnackbar(true);
    }
  };

  if (!request || chapters.length === 0) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h6" align="center">
          טוען...
        </Typography>
      </Container>
    );
  }

  const selectedChapters = request.chapterIndices.map((i) => chapters[i]);
  const unread = selectedChapters.filter((ch) => !progress.includes(ch.id));
  const percent = (progress.length / selectedChapters.length) * 100;
  const isComplete = unread.length === 0;
  const nextChapter = unread[0];

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          קריאה עבור: {request.name}
        </Typography>
        <Typography color="text.secondary">מטרה: {request.purpose}</Typography>
        {request.notes && (
          <Typography sx={{ mt: 1 }}>הערות: {request.notes}</Typography>
        )}

        <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
          מספר מחזורים שהושלמו: {request.cycleCount || 0}
        </Typography>

        <Box sx={{ mt: 3, mb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={percent}
            sx={{ transform: "scaleX(-1)" }}
            color={isComplete ? "success" : "primary"}
          />
          <Typography align="center" variant="body2" sx={{ mt: 1 }}>
            {progress.length}/{selectedChapters.length}
          </Typography>
        </Box>

        {isComplete ? (
          <Chip label="הבקשה הושלמה!" color="success" sx={{ mt: 2 }} />
        ) : (
          <>
            <Typography variant="h6" gutterBottom align="center">
              {nextChapter.title}
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              align="center"
              gutterBottom
            >
              {nextChapter.mizmor}
            </Typography>
            <Typography variant="body1" align="center" sx={{ mb: 3 }}>
              {nextChapter.content}
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={() => handleMarkRead(nextChapter.id)}
            >
              סמן כנקרא ועבור לפרק הבא
            </Button>
          </>
        )}
      </Paper>

      <Button variant="text" sx={{ mt: 2 }} onClick={() => navigate("/")}>
        חזרה לרשימת הבקשות
      </Button>
      <Snackbar
        open={showSnackbar}
        autoHideDuration={4000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowSnackbar(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          🎉 סבב קריאה הושלם! מתחילים מחדש
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RequestReadingPage;
