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
  fetchRequestById,
} from "../api/api";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

const RequestReadingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [chapter, setChapter] = useState(null);
  const [chaptersData, setChaptersData] = useState([]);
  const [requestInfo, setRequestInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [lockExpired, setLockExpired] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [chaptersJson, chapterData, request] = await Promise.all([
          fetchChapters(),
          fetchNextChapter(id),
          fetchRequestById(id),
        ]);
        setChaptersData(chaptersJson);
        setChapter(chapterData);
        setRequestInfo(request);
        setErrorMessage("");
      } catch (err) {
        setChapter(null);
        setErrorMessage(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, [id]);

  useEffect(() => {
    if (!chapter?.lockedAt) return;

    const lockedUntil = new Date(
      new Date(chapter.lockedAt).getTime() + 20 * 60000,
    );

    const interval = setInterval(() => {
      const diff = lockedUntil.getTime() - Date.now();

      if (diff <= 0) {
        setTimeLeft(0);
        setLockExpired(true);
        clearInterval(interval);
      } else {
        setTimeLeft(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [chapter?.lockedAt]);

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleComplete = async () => {
    try {
      setTransitioning(true);

      await completeChapter(chapter.id);
      const [next, updatedRequest] = await Promise.all([
        fetchNextChapter(id),
        fetchRequestById(id), // 👈 fetch updated progress and cycle count
      ]);

      setRequestInfo(updatedRequest);

      if (next) {
        setChapter(next);
        setLockExpired(false);
      } else {
        setChapter(null);
        setErrorMessage("🎉 כל הפרקים הושלמו בסבב זה!");
      }

      setShowSnackbar(true);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setTransitioning(false);
    }
  };

  const handleReleaseOnly = async () => {
    try {
      setTransitioning(true);
      await releaseChapter(chapter.id);
      setChapter(null);
      setShowSnackbar(true);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setTransitioning(false);
    }
  };

  const handleReleaseAndNext = async () => {
    try {
      setTransitioning(true);

      const next = await fetchNextChapter(id); // 👈 fetch first
      await releaseChapter(chapter.id); // 👈 then release this one

      if (next) {
        setChapter(next);
        setLockExpired(false);
      } else {
        setChapter(null);
        setErrorMessage("אין כרגע פרקים זמינים נוספים");
      }
    } catch (err) {
      setChapter(null);
      setErrorMessage("לא ניתן להשיג פרק חדש");
    } finally {
      setTransitioning(false);
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
        {requestInfo && (
          <>
            <Typography variant="h5" gutterBottom align="center">
              קריאת פרק עבור {requestInfo.name}
            </Typography>

            <Typography
              variant="subtitle1"
              align="center"
              color="text.secondary"
              gutterBottom
            >
              🎯 מטרה: {requestInfo.purpose}
            </Typography>

            {requestInfo.notes && (
              <Typography
                variant="body1"
                align="center"
                sx={{ mb: 2, whiteSpace: "pre-line" }}
                color="text.secondary"
              >
                📝 {requestInfo.notes}
              </Typography>
            )}

            <Typography align="center" color="text.secondary" sx={{ mb: 2 }}>
              📚 מספר סבבי קריאה שהושלמו: {requestInfo.cycleCount}
            </Typography>
          </>
        )}

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {loading || transitioning ? (
          <Box textAlign="center" sx={{ mt: 4 }}>
            <CircularProgress />
            <Typography sx={{ mt: 2, mb: 2 }}>
              {loading ? "טוען פרק לקריאה..." : "טוען פרק חדש..."}
            </Typography>
          </Box>
        ) : chapter && chapterContent ? (
          lockExpired ? (
            <Box textAlign="center">
              <Typography variant="h6" sx={{ mb: 2 }}>
                ⏰ זמן הקריאה של הפרק נגמר.
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                יתכן שמישהו אחר נעל את הפרק. תוכל לנסות לנעול אותו מחדש.
              </Typography>
              <Button
                variant="contained"
                onClick={() => handleReleaseAndNext()}
              >
                🔁 נסה לנעול פרק חדש
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
                  סיימתי לקרוא ✅
                </Button>
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={handleReleaseAndNext}
                >
                  חפש לי פרק אחר 🔄
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleReleaseOnly}
                >
                  אין לי זמן עכשיו, שחרר פרק זה ❌
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
          severity="info"
          sx={{ width: "100%" }}
        >
          ✔ הפרק שוחרר בהצלחה!
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
