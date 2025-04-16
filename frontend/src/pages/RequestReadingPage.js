// src/pages/RequestReadingPage.js
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchNextChapter,
  completeChapter,
  releaseChapter,
  fetchChapters,
} from "../api/api";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

const RequestReadingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [chapter, setChapter] = useState(null);
  const [chaptersData, setChaptersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [lockExpired, setLockExpired] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [chapterData] = await Promise.all([
          fetchChapters(),
          loadChapter(),
        ]);
        setChaptersData(chapterData);
      } catch (err) {
        setErrorMessage(err.message);
      }
    };
    loadAll();
  }, [id]);

  const loadChapter = async () => {
    setLoading(true);
    try {
      const data = await fetchNextChapter(id);
      setChapter(data);
      setLockExpired(false);
      setErrorMessage("");

      const lockedUntil = new Date(
        new Date(data.lockedAt).getTime() + 20 * 60000,
      );

      const updateTime = () => {
        const diff = lockedUntil.getTime() - Date.now();
        if (diff <= 0) {
          setTimeLeft(0);
          setLockExpired(true);
          clearInterval(timerId);
        } else {
          setTimeLeft(diff);
        }
      };

      updateTime();
      const timerId = setInterval(updateTime, 1000);
      return () => clearInterval(timerId);
    } catch (err) {
      setChapter(null);
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      await completeChapter(chapter.id);
      setShowSnackbar(true);
      loadChapter();
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleRelease = async () => {
    try {
      await releaseChapter(chapter.id);
      loadChapter();
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/read/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setShowCopied(true);
    });
  };

  const handleWhatsAppShare = () => {
    const url = `${window.location.origin}/read/${id}`;
    const text = `תיקון כללי - לחצו לקריאה: ${url}`;
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(shareUrl, "_blank");
  };

  const chapterContent =
    chapter && chaptersData.length > 0 ? chaptersData[chapter.number] : null;

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          קריאת פרק עבור בקשה #{id}
        </Typography>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {loading ? (
          <Box textAlign="center" sx={{ mt: 4 }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>טוען פרק לקריאה...</Typography>
          </Box>
        ) : chapter && chapterContent ? (
          lockExpired ? (
            <Box textAlign="center">
              <Typography variant="h6" sx={{ mb: 2 }}>
                ⏰ זמן הקריאה של הפרק נגמר.
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                יתכן שמישהו אחר נעל את הפרק. תוכל לנסות לנעול אותו מחדש.
              </Typography>
              <Button
                variant="contained"
                onClick={() => {
                  setLockExpired(false);
                  loadChapter();
                }}
              >
                🔁 נסה לנעול שוב
              </Button>
            </Box>
          ) : (
            <>
              {timeLeft !== null && (
                <Typography
                  align="center"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  זמן שנותר לנעילה: {Math.floor(timeLeft / 60000)}:
                  {String(Math.floor((timeLeft % 60000) / 1000)).padStart(
                    2,
                    "0",
                  )}
                </Typography>
              )}

              <Typography variant="h6" align="center" sx={{ mb: 1 }}>
                {chapterContent.title || `פרק ${chapterContent.number}`}
              </Typography>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                align="center"
                gutterBottom
              >
                {chapterContent.mizmor}
              </Typography>
              <Typography
                variant="body1"
                align="center"
                sx={{ whiteSpace: "pre-line", mb: 3 }}
              >
                {chapterContent.content}
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleComplete}
                >
                  ✅ סיימתי לקרוא
                </Button>
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={handleRelease}
                >
                  🟡 שחרר - לא הצלחתי לקרוא
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleRelease}
                >
                  🔴 שחרר - טקסט לא ברור
                </Button>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 2,
                  mt: 3,
                }}
              >
                <Button
                  variant="outlined"
                  startIcon={<ContentCopyIcon />}
                  onClick={handleShare}
                >
                  העתק קישור
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<WhatsAppIcon />}
                  onClick={handleWhatsAppShare}
                  color="success"
                >
                  שתף בוואטסאפ
                </Button>
              </Box>
            </>
          )
        ) : (
          <Typography align="center" sx={{ mt: 4 }}>
            אין כרגע פרקים זמינים לקריאה.
          </Typography>
        )}
      </Paper>

      <Button variant="text" sx={{ mt: 2 }} onClick={() => navigate("/")}>
        חזרה לרשימת הבקשות
      </Button>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowSnackbar(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          🎉 הפרק סומן כנקרא!
        </Alert>
      </Snackbar>

      <Snackbar
        open={showCopied}
        autoHideDuration={3000}
        onClose={() => setShowCopied(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowCopied(false)}
          severity="info"
          sx={{ width: "100%" }}
        >
          ✔ הקישור הועתק!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RequestReadingPage;
