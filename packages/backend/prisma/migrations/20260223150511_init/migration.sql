-- CreateTable
CREATE TABLE "User" (
    "userId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Thought" (
    "thoughtId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" DATETIME NOT NULL,
    "lastFollowUp" DATETIME,
    "nextReminder" DATETIME,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Thought_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("userId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tag" (
    "tagId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("userId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ThoughtRelation" (
    "thoughtRelationId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "relationType" TEXT NOT NULL DEFAULT 'RELATED',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "thoughtOneId" INTEGER NOT NULL,
    "thoughtTwoId" INTEGER NOT NULL,
    CONSTRAINT "ThoughtRelation_thoughtOneId_fkey" FOREIGN KEY ("thoughtOneId") REFERENCES "Thought" ("thoughtId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ThoughtRelation_thoughtTwoId_fkey" FOREIGN KEY ("thoughtTwoId") REFERENCES "Thought" ("thoughtId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ThoughtGroup" (
    "thoughtGroupId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "ThoughtGroup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("userId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ThoughtToThoughtGroup" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_ThoughtToThoughtGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "Thought" ("thoughtId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ThoughtToThoughtGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "ThoughtGroup" ("thoughtGroupId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_TagToThought" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_TagToThought_A_fkey" FOREIGN KEY ("A") REFERENCES "Tag" ("tagId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_TagToThought_B_fkey" FOREIGN KEY ("B") REFERENCES "Thought" ("thoughtId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Thought_userId_idx" ON "Thought"("userId");

-- CreateIndex
CREATE INDEX "Tag_userId_idx" ON "Tag"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_userId_name_key" ON "Tag"("userId", "name");

-- CreateIndex
CREATE INDEX "ThoughtRelation_thoughtOneId_idx" ON "ThoughtRelation"("thoughtOneId");

-- CreateIndex
CREATE INDEX "ThoughtRelation_thoughtTwoId_idx" ON "ThoughtRelation"("thoughtTwoId");

-- CreateIndex
CREATE UNIQUE INDEX "ThoughtRelation_thoughtOneId_thoughtTwoId_key" ON "ThoughtRelation"("thoughtOneId", "thoughtTwoId");

-- CreateIndex
CREATE INDEX "ThoughtGroup_userId_idx" ON "ThoughtGroup"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "_ThoughtToThoughtGroup_AB_unique" ON "_ThoughtToThoughtGroup"("A", "B");

-- CreateIndex
CREATE INDEX "_ThoughtToThoughtGroup_B_index" ON "_ThoughtToThoughtGroup"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_TagToThought_AB_unique" ON "_TagToThought"("A", "B");

-- CreateIndex
CREATE INDEX "_TagToThought_B_index" ON "_TagToThought"("B");
