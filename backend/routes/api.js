const express = require("express");
const router = express.Router();
const prisma = require("../prisma");
const fs = require("fs");
const path = require("path");
const { validateNewRequest, validateInt } = require("../utils/validate");
const adminAuth = require("../middleware/adminAuth");
const anonIdMiddleware = require("../middleware/anonIdMiddleware");

router.get("/requests", anonIdMiddleware, async (req, res) => {
  try {
    const { search } = req.query;

    const requests = await prisma.request.findMany({
      where: search
        ? {
            name: {
              contains: search,
            },
          }
        : {},
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const enriched = await Promise.all(
      requests.map(async (r) => {
        const chapterIndices = JSON.parse(r.chapterIndices || "[]");

        const recentChapters = await prisma.chapter.findMany({
          where: { requestId: r.id },
          orderBy: { id: "asc" }, // ✅ Important: use oldest N chapters = current cycle
          take: chapterIndices.length,
        });

        const read = recentChapters.filter((ch) => ch.status === "read").length;

        return {
          ...r,
          chapterIndices,
          progress: [], // progress field is deprecated
          totalChapters: chapterIndices.length,
          readChapters: read,
        };
      }),
    );

    res.json(enriched);
  } catch (err) {
    console.error("Failed to load requests:", err);
    res.status(500).json({ error: "שגיאה בטעינת הבקשות" });
  }
});

router.post("/requests", anonIdMiddleware, async (req, res, next) => {
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
router.get("/requests/:id", anonIdMiddleware, async (req, res, next) => {
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
router.post(
  "/requests/:id/progress",
  anonIdMiddleware,
  async (req, res, next) => {
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
  },
);

// GET /chapters
router.get("/chapters", anonIdMiddleware, (req, res, next) => {
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
router.post(
  "/chapter/:id/release",
  anonIdMiddleware,
  async function (req, res) {
    const anonId = req.anonId;
    const chapterId = parseInt(req.params.id);
    const error = validateInt(chapterId, "ID פרק");
    if (error) return res.status(400).json({ error });

    try {
      const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId },
      });

      if (!chapter || chapter.lockedBy !== anonId) {
        return res
          .status(403)
          .json({ error: "אין לך הרשאה לשחרר את הפרק הזה" });
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
  },
);

// POST /chapter/:id/complete
// POST /chapter/:id/complete
router.post(
  "/chapter/:id/complete",
  anonIdMiddleware,
  async function (req, res) {
    const anonId = req.anonId;
    const chapterId = parseInt(req.params.id);
    const error = validateInt(chapterId, "ID פרק");
    if (error) return res.status(400).json({ error });

    try {
      const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId },
      });

      if (!chapter) {
        return res.status(404).json({ error: "הפרק לא נמצא" });
      }

      if (chapter.status === "read") {
        return res.status(200).json(chapter);
      }

      if (chapter.lockedBy !== anonId) {
        return res.status(403).json({ error: "אין לך הרשאה לסמן את הפרק הזה" });
      }

      // ✅ Mark the chapter as read
      await prisma.chapter.update({
        where: { id: chapterId },
        data: {
          status: "read",
          lockedBy: null,
          lockedAt: null,
          readAt: new Date(),
          readBy: anonId,
        },
      });

      // ✅ Update read counter
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const current = await prisma.readCounter.findUnique({ where: { id: 1 } });
      const readersSet = new Set(JSON.parse(current?.readers || "[]"));
      readersSet.add(anonId);

      if (
        !current ||
        !current.todayDate ||
        new Date(current.todayDate).getTime() !== today.getTime()
      ) {
        // It's a new day → reset todayCount
        await prisma.readCounter.upsert({
          where: { id: 1 },
          update: {
            count: { increment: 1 },
            todayCount: 1,
            todayDate: today,
            readers: JSON.stringify(Array.from(readersSet)),
          },
          create: {
            id: 1,
            count: 1,
            todayCount: 1,
            todayDate: today,
            readers: JSON.stringify(Array.from(readersSet)),
          },
        });
      } else {
        // Same day → increment todayCount
        await prisma.readCounter.update({
          where: { id: 1 },
          data: {
            count: { increment: 1 },
            todayCount: { increment: 1 },
            readers: JSON.stringify(Array.from(readersSet)),
          },
        });
      }

      // ✅ Check if all chapters are read — reset cycle if needed
      const unreadCount = await prisma.chapter.count({
        where: {
          requestId: chapter.requestId,
          status: { not: "read" },
        },
      });

      if (unreadCount === 0) {
        await prisma.request.update({
          where: { id: chapter.requestId },
          data: {
            cycleCount: { increment: 1 },
          },
        });

        await prisma.chapter.updateMany({
          where: { requestId: chapter.requestId },
          data: {
            status: "unread",
            lockedBy: null,
            lockedAt: null,
          },
        });
      }

      res.json({ success: true });
    } catch (err) {
      console.error("Failed to complete chapter:", err);
      res.status(500).json({ error: "שגיאת שרת" });
    }
  },
);

// GET /request/:id/next-chapter
router.get("/request/:id/next-chapter", anonIdMiddleware, async (req, res) => {
  const anonId = req.anonId;
  const requestId = parseInt(req.params.id);
  const error = validateInt(requestId, "ID בקשה");
  if (error) return res.status(400).json({ error });

  const now = new Date();
  const twentyMinutesAgo = new Date(now.getTime() - 20 * 60 * 1000);

  try {
    const request = await prisma.request.findUnique({
      where: { id: requestId },
    });
    if (!request) return res.status(404).json({ error: "הבקשה לא נמצאה" });

    const tryFindChapter = async () => {
      return await prisma.chapter.findFirst({
        where: {
          requestId,
          status: { in: ["unread", "released"] },
          OR: [
            { lockedAt: null },
            { lockedAt: { lt: twentyMinutesAgo } },
            { lockedBy: { not: anonId } }, // 👈 ignore ones locked by this user!
          ],
        },
        orderBy: { number: "asc" },
      });
    };

    let chapter = await tryFindChapter();

    if (!chapter) {
      // All chapters completed — restart cycle
      await prisma.request.update({
        where: { id: requestId },
        data: {
          cycleCount: { increment: 1 },
        },
      });

      await prisma.chapter.updateMany({
        where: { requestId },
        data: {
          status: "unread",
          lockedBy: null,
          lockedAt: null,
        },
      });

      // Try again after resetting
      chapter = await tryFindChapter();
    }

    if (!chapter) {
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
// GET /stats
router.get("/stats", anonIdMiddleware, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Midnight today

    const [totalRequests, totalCycles, readRow] = await Promise.all([
      prisma.request.count(),
      prisma.request.aggregate({ _sum: { cycleCount: true } }),
      prisma.readCounter.findUnique({ where: { id: 1 } }),
    ]);

    // Calculate today's reads correctly
    let chaptersReadToday = 0;
    if (readRow?.todayDate) {
      const lastUpdated = new Date(readRow.todayDate);
      lastUpdated.setHours(0, 0, 0, 0);
      if (lastUpdated.getTime() === today.getTime()) {
        chaptersReadToday = readRow.todayCount;
      }
    }

    // Total participants
    const totalParticipants = readRow?.readers
      ? JSON.parse(readRow.readers).length
      : 0;

    res.json({
      totalRequests,
      totalChaptersRead: readRow?.count || 0,
      totalCyclesCompleted: totalCycles._sum.cycleCount || 0,
      totalParticipants,
      chaptersReadToday,
    });
  } catch (err) {
    console.error("Failed to load stats:", err);
    res.status(500).json({ error: "Failed to load stats" });
  }
});

router.delete("/admin/request/:id", adminAuth, async (req, res) => {
  const requestId = parseInt(req.params.id);
  if (!requestId) return res.status(400).json({ error: "Invalid request ID" });

  try {
    await prisma.chapter.deleteMany({ where: { requestId } });
    await prisma.request.delete({ where: { id: requestId } });

    res.json({ success: true });
  } catch (err) {
    console.error("Failed to delete request:", err);
    res.status(500).json({ error: "Failed to delete request" });
  }
});

module.exports = router;
