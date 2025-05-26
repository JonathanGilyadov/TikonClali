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
  fetchRequestById,
} from "../api/api";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

export default function RequestReadingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [chapter, setChapter] = useState(null);
  const [chaptersData, setChaptersData] = useState([]);
  const [requestInfo, setRequestInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [released, setReleased] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [lockExpired, setLockExpired] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 1) initial load
  useEffect(() => {
    const load = async () => {
      try {
        const [allChaps, nextChap, reqInfo] = await Promise.all([
          fetchChapters(),
          fetchNextChapter(id),
          fetchRequestById(id),
        ]);
        setChaptersData(allChaps);
        setChapter(nextChap);
        setRequestInfo(reqInfo);
      } catch (err) {
        setErrorMessage(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // 2) countdown
  useEffect(() => {
    if (!chapter?.lockedAt) return;
    const until = new Date(new Date(chapter.lockedAt).getTime() + 20 * 60000);
    const iv = setInterval(() => {
      const diff = until.getTime() - Date.now();
      if (diff <= 0) {
        setLockExpired(true);
        clearInterval(iv);
      } else {
        setTimeLeft(diff);
      }
    }, 1000);
    return () => clearInterval(iv);
  }, [chapter?.lockedAt]);

  // 3) complete handler
  const handleComplete = async () => {
    setTransitioning(true);
    try {
      await completeChapter(chapter.id);
      const [next, updatedReq] = await Promise.all([
        fetchNextChapter(id),
        fetchRequestById(id),
      ]);
      setRequestInfo(updatedReq);
      if (next) {
        setChapter(next);
        setReleased(false);
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

  // 4) release-only handler (the 👍 for “אין לי זמן”)
  const handleReleaseOnly = async () => {
    setTransitioning(true);
    try {
      const updated = await releaseChapter(chapter.id);
      setChapter(updated); // <-- keep chapter in place
      setReleased(true); // <-- disable buttons + show inline msg
      setShowSnackbar(true);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setTransitioning(false);
    }
  };

  // 5) release + next
  const handleReleaseAndNext = async () => {
    setTransitioning(true);
    try {
      const next = await fetchNextChapter(id);
      await releaseChapter(chapter.id);
      if (next) {
        setChapter(next);
        setReleased(false);
        setLockExpired(false);
      } else {
        setChapter(null);
        setErrorMessage("אין כרגע פרקים זמינים נוספים");
      }
    } catch {
      setErrorMessage("לא ניתן להשיג פרק חדש");
    } finally {
      setTransitioning(false);
    }
  };

  // 6) share helpers
  const handleShare = () => {
    navigator.clipboard
      .writeText(`${window.location.origin}/read/${id}`)
      .then(() => setShowCopied(true));
  };
  const handleWhatsAppShare = () => {
    const url = `${window.location.origin}/read/${id}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(
        `תיקון הכללי ביחד - לחצו לקריאה: ${url}`,
      )}`,
      "_blank",
    );
  };

  const chapterContent =
    chapter && chaptersData.length > 0 && chaptersData[chapter.number];

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
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
          src="/quote2.jpg"
          alt="Centered image"
          sx={{
            width: "100%",
            height: "300px",

            borderRadius: 2,

            objectFit: "cover",
            // borderRadius: 2,
            // boxShadow: 3,
          }}
        />
      </Box>

      <Paper sx={{ p: 4 }}>
        {/* header */}
        {requestInfo && (
          <>
            <Typography variant="h5" align="center">
              קריאת פרק עבור {requestInfo.name}
            </Typography>
            <Typography
              variant="subtitle1"
              align="center"
              color="text.secondary"
            >
              🎯 מטרה: {requestInfo.purpose}
            </Typography>
            {requestInfo.notes && (
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ whiteSpace: "pre-line", mb: 2 }}
              >
                📝 {requestInfo.notes}
              </Typography>
            )}
            <Typography align="center" color="text.secondary" sx={{ mb: 2 }}>
              📚 סבבים הושלמו: {requestInfo.cycleCount}
            </Typography>
          </>
        )}

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        {/* loading / countdown */}
        {loading || transitioning ? (
          <Box textAlign="center" sx={{ mt: 4 }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>
              {loading ? "טוען פרק..." : "מעבד..."}
            </Typography>
          </Box>
        ) : chapter && chapterContent ? (
          lockExpired ? (
            <Box textAlign="center">
              <Typography variant="h6" sx={{ mb: 2 }}>
                ⏰ זמן הקריאה נגמר
              </Typography>
              <Button
                variant="contained"
                onClick={handleReleaseAndNext}
                disabled={transitioning}
              >
                🔄 נסה פרק חדש
              </Button>
            </Box>
          ) : (
            <>
              {timeLeft != null && (
                <Typography
                  align="center"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  זמן לנעילה: {Math.floor(timeLeft / 60000)}:
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
                align="center"
                color="text.secondary"
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

              {/* actions */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleComplete}
                  disabled={transitioning || released}
                >
                  סיימתי לקרוא ✅
                </Button>

                <Button
                  variant="outlined"
                  color="warning"
                  onClick={handleReleaseAndNext}
                  disabled={transitioning || released}
                >
                  חפש לי פרק אחר 🔄
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleReleaseOnly}
                  disabled={transitioning || released}
                >
                  אין לי זמן עכשיו, שחרר פרק זה ❌
                </Button>

                {released && (
                  <Typography align="center" color="info.main" sx={{ mt: 1 }}>
                    הפרק שוחרר בהצלחה
                  </Typography>
                )}
              </Box>

              {/* share */}
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
          ✔ פעולה בוצעה!
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
}
