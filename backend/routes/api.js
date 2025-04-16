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

module.exports = router;
