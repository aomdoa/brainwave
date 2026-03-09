/*
  Warnings:

  - You are about to drop the `ThoughtGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ThoughtToThoughtGroup` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ThoughtGroup";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_ThoughtToThoughtGroup";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "ThoughtBodyHistory" (
    "thoughtBodyHistoryId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "thoughtId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "body" TEXT NOT NULL,
    CONSTRAINT "ThoughtBodyHistory_thoughtId_fkey" FOREIGN KEY ("thoughtId") REFERENCES "Thought" ("thoughtId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ThoughtBodyHistory_thoughtId_idx" ON "ThoughtBodyHistory"("thoughtId");
