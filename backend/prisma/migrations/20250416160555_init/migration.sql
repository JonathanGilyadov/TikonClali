-- CreateTable
CREATE TABLE "Request" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "notes" TEXT,
    "chapterIndices" TEXT NOT NULL,
    "progress" TEXT NOT NULL,
    "cycleCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Chapter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "number" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "lockedBy" TEXT,
    "lockedAt" DATETIME,
    "requestId" INTEGER NOT NULL,
    CONSTRAINT "Chapter_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
