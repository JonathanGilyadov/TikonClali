const express = require("express");
const router = express.Router();
const prisma = require("../prisma");
const fs = require("fs");
const path = require("path");

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

// GET /requests/:id
router.get("/requests/:id", async (req, res, next) => {
  try {
    const row = await prisma.request.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!row) return res.status(404).json({ error: "Request not found" });

    row.chapterIndices = JSON.parse(row.chapterIndices);
    row.progress = JSON.parse(row.progress);
    res.json(row);
  } catch (err) {
    next(err);
  }
});

// POST /requests
router.get("/requests", async (req, res, next) => {
  try {
    const { search } = req.query;

    const rows = await prisma.request.findMany({
      where: search
        ? {
            name: {
              contains: search,
              mode: "insensitive", // case-insensitive search
            },
          }
        : {},
      orderBy: { createdAt: "desc" },
    });

    const parsed = rows.map((r) => ({
      ...r,
      chapterIndices: JSON.parse(r.chapterIndices),
      progress: JSON.parse(r.progress),
    }));

    res.json(parsed);
  } catch (err) {
    next(err);
  }
});

// PATCH /requests/:id/progress
router.post("/requests/:id/progress", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { chapterId } = req.body;

    const request = await prisma.request.findUnique({ where: { id } });
    if (!request) return res.status(404).json({ error: "Request not found" });

    const progressSet = new Set(JSON.parse(request.progress || "[]"));
    progressSet.add(chapterId);

    const chapterIndices = JSON.parse(request.chapterIndices);
    const chaptersRead = progressSet.size;
    const totalChapters = chapterIndices.length;

    let updatedProgress = Array.from(progressSet);
    let updatedCycleCount = request.cycleCount;

    // Cycle complete
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

// POST /api/chapter/:id/release
router.post("/api/chapter/:id/release", async function (req, res) {
  var anonId = req.anonId;
  var chapterId = req.params.id;

  try {
    var chapter = await prisma.chapter.findUnique({ where: { id: chapterId } });

    if (!chapter || chapter.lockedBy !== anonId) {
      return res
        .status(403)
        .json({ error: "You do not have permission to release this chapter" });
    }

    var updated = await prisma.chapter.update({
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
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/chapter/:id/complete
router.post("/api/chapter/:id/complete", async function (req, res) {
  var anonId = req.anonId;
  var chapterId = req.params.id;

  try {
    var chapter = await prisma.chapter.findUnique({ where: { id: chapterId } });

    if (!chapter || chapter.lockedBy !== anonId) {
      return res
        .status(403)
        .json({ error: "You do not have permission to complete this chapter" });
    }

    var updated = await prisma.chapter.update({
      where: { id: chapterId },
      data: {
        status: "read",
        lockedBy: null,
        lockedAt: null,
      },
    });

    // Now check if ALL chapters in the request are read
    var unreadCount = await prisma.chapter.count({
      where: {
        requestId: chapter.requestId,
        status: { not: "read" },
      },
    });

    // If all read, restart cycle (duplicate all chapters, status: 'unread')
    if (unreadCount === 0) {
      var originalChapters = await prisma.chapter.findMany({
        where: {
          requestId: chapter.requestId,
        },
        orderBy: { number: "asc" },
      });

      for (var i = 0; i < originalChapters.length; i++) {
        var c = originalChapters[i];
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

      // Optionally increment a cycle count field on the request
      await prisma.request.update({
        where: { id: chapter.requestId },
        data: {
          cyclesCompleted: { increment: 1 },
        },
      });
    }

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
