const express = require("express");
const router = express.Router();
const prisma = require("../prisma");
const fs = require("fs");
const path = require("path");
const { validateNewRequest, validateInt } = require("../utils/validate");

// GET /requests
router.get("/requests", async (req, res, next) => {
  try {
    const { search } = req.query;

    const requests = await prisma.request.findMany({
      where: search
        ? {
            name: {
              contains: search.toLowerCase(),
            },
          }
        : {},
      orderBy: { createdAt: "desc" },
    });

    const parsed = requests.map((r) => ({
      ...r,
      chapterIndices: JSON.parse(r.chapterIndices),
      progress: JSON.parse(r.progress),
    }));

    res.json(parsed);
  } catch (err) {
    next(err);
  }
});

router.post("/requests", async (req, res, next) => {
  const error = validateNewRequest(req.body);
  if (error) return res.status(400).json({ error });

  try {
    const { name, purpose, notes, chapterIndices } = req.body;

    const request = await prisma.request.create({
      data: {
        name: name.trim(),
        purpose,
        notes: notes?.trim() || null,
        chapterIndices: JSON.stringify(chapterIndices),
        progress: JSON.stringify([]),
        cycleCount: 0,
      },
    });

    for (const index of chapterIndices) {
      await prisma.chapter.create({
        data: {
          requestId: request.id,
          number: index,
          status: "unread",
          lockedBy: null,
          lockedAt: null,
        },
      });
    }

    res.json({
      ...request,
      chapterIndices,
      progress: [],
    });
  } catch (err) {
    console.error("Failed to create request:", err);
    res.status(500).json({ error: "שגיאה ביצירת הבקשה" });
  }
});

// GET /requests/:id
router.get("/requests/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const error = validateInt(id, "ID בקשה");
    if (error) return res.status(400).json({ error });

    const row = await prisma.request.findUnique({ where: { id } });
    if (!row) return res.status(404).json({ error: "הבקשה לא נמצאה" });

    row.chapterIndices = JSON.parse(row.chapterIndices);
    row.progress = JSON.parse(row.progress);
    res.json(row);
  } catch (err) {
    next(err);
  }
});

// POST /requests/:id/progress
router.post("/requests/:id/progress", async (req, res, next) => {
  const id = parseInt(req.params.id);
  const error = validateInt(id, "ID בקשה");
  if (error) return res.status(400).json({ error });

  const { chapterId } = req.body;
  const chError = validateInt(chapterId, "פרק");
  if (chError) return res.status(400).json({ error: chError });

  try {
    const request = await prisma.request.findUnique({ where: { id } });
    if (!request) return res.status(404).json({ error: "הבקשה לא נמצאה" });

    const progressSet = new Set(JSON.parse(request.progress || "[]"));
    progressSet.add(chapterId);

    const chapterIndices = JSON.parse(request.chapterIndices);
    const chaptersRead = progressSet.size;
    const totalChapters = chapterIndices.length;

    let updatedProgress = Array.from(progressSet);
    let updatedCycleCount = request.cycleCount;

    if (chaptersRead >= totalChapters) {
      updatedProgress = [];
      updatedCycleCount += 1;
    }

    const updated = await prisma.request.update({
      where: { id },
      data: {
        progress: JSON.stringify(updatedProgress),
        cycleCount: updatedCycleCount,
      },
    });

    updated.chapterIndices = JSON.parse(updated.chapterIndices);
    updated.progress = JSON.parse(updated.progress);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// GET /chapters
router.get("/chapters", (req, res, next) => {
  try {
    const chaptersPath = path.join(__dirname, "../data/chapters.json");

    if (!fs.existsSync(chaptersPath)) {
      return res.status(500).json({ error: "chapters.json not found" });
    }

    const raw = fs.readFileSync(chaptersPath, "utf-8");
    const chapters = JSON.parse(raw);
    res.json(chapters);
  } catch (err) {
    next(err);
  }
});

// POST /chapter/:id/release
router.post("/chapter/:id/release", async function (req, res) {
  const anonId = req.anonId;
  const chapterId = parseInt(req.params.id);
  const error = validateInt(chapterId, "ID פרק");
  if (error) return res.status(400).json({ error });

  try {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
    });

    if (!chapter || chapter.lockedBy !== anonId) {
      return res.status(403).json({ error: "אין לך הרשאה לשחרר את הפרק הזה" });
    }

    const updated = await prisma.chapter.update({
      where: { id: chapterId },
      data: {
        status: "released",
        lockedBy: null,
        lockedAt: null,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "שגיאת שרת" });
  }
});

// POST /chapter/:id/complete
router.post("/chapter/:id/complete", async function (req, res) {
  const anonId = req.anonId;
  const chapterId = parseInt(req.params.id);
  const error = validateInt(chapterId, "ID פרק");
  if (error) return res.status(400).json({ error });

  try {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
    });

    if (!chapter || chapter.lockedBy !== anonId) {
      return res.status(403).json({ error: "אין לך הרשאה לסמן את הפרק הזה" });
    }

    const updated = await prisma.chapter.update({
      where: { id: chapterId },
      data: {
        status: "read",
        lockedBy: null,
        lockedAt: null,
      },
    });

    const unreadCount = await prisma.chapter.count({
      where: {
        requestId: chapter.requestId,
        status: { not: "read" },
      },
    });

    if (unreadCount === 0) {
      const originalChapters = await prisma.chapter.findMany({
        where: { requestId: chapter.requestId },
        orderBy: { number: "asc" },
      });

      for (const c of originalChapters) {
        await prisma.chapter.create({
          data: {
            requestId: c.requestId,
            number: c.number,
            status: "unread",
            lockedBy: null,
            lockedAt: null,
          },
        });
      }

      await prisma.request.update({
        where: { id: chapter.requestId },
        data: {
          cyclesCompleted: { increment: 1 },
        },
      });
    }

    res.json(updated);
  } catch (err) {
    console.error("Failed to complete chapter:", err);
    res.status(500).json({ error: "שגיאת שרת" });
  }
});

// GET /request/:id/next-chapter
router.get("/request/:id/next-chapter", async (req, res) => {
  const anonId = req.anonId;
  const requestId = parseInt(req.params.id);
  const now = new Date();
  const twentyMinutesAgo = new Date(now.getTime() - 20 * 60 * 1000);

  try {
    const possible = await prisma.chapter.findMany({
      where: {
        requestId,
        status: { in: ["unread", "released"] },
      },
    });

    console.log("Possible chapters:", possible);

    const chapter = await prisma.chapter.findFirst({
      where: {
        requestId,
        status: { in: ["unread", "released"] },
        OR: [{ lockedAt: null }, { lockedAt: { lt: twentyMinutesAgo } }],
      },
      orderBy: { number: "asc" },
    });

    if (!chapter) {
      console.log("No available chapters for request", requestId);
      return res.status(404).json({ error: "אין כרגע פרקים זמינים" });
    }

    const updated = await prisma.chapter.update({
      where: { id: chapter.id },
      data: {
        lockedBy: anonId,
        lockedAt: now,
        status: "in-progress",
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("Failed to get next chapter:", err);
    res.status(500).json({ error: "שגיאת שרת" });
  }
});

// GET /stats
router.get("/stats", async (req, res) => {
  try {
    const totalRequests = await prisma.request.count();

    const requests = await prisma.request.findMany({
      select: { progress: true },
    });

    const totalChaptersRead = requests.reduce(
      (sum, req) => sum + JSON.parse(req.progress || "[]").length,
      0,
    );

    res.json({ totalRequests, totalChaptersRead });
  } catch (err) {
    console.error("Failed to load stats:", err);
    res.status(500).json({ error: "Failed to load stats" });
  }
});

module.exports = router;
