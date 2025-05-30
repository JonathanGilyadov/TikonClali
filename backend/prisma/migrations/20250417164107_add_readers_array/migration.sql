-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ReadCounter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "count" INTEGER NOT NULL DEFAULT 0,
    "todayCount" INTEGER NOT NULL DEFAULT 0,
    "todayDate" DATETIME,
    "readers" TEXT NOT NULL DEFAULT '[]'
);
INSERT INTO "new_ReadCounter" ("count", "id", "todayCount", "todayDate") SELECT "count", "id", "todayCount", "todayDate" FROM "ReadCounter";
DROP TABLE "ReadCounter";
ALTER TABLE "new_ReadCounter" RENAME TO "ReadCounter";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
