/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Podcast` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "_CategoryToPodcast" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CategoryToPodcast_A_fkey" FOREIGN KEY ("A") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CategoryToPodcast_B_fkey" FOREIGN KEY ("B") REFERENCES "Podcast" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Podcast" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "host" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "coverImage" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'published',
    "rating" REAL NOT NULL DEFAULT 0,
    "language" TEXT NOT NULL DEFAULT 'English',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "summary" TEXT NOT NULL DEFAULT '',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "plays" INTEGER NOT NULL DEFAULT 0,
    "episodeCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Podcast" ("coverImage", "createdAt", "description", "episodeCount", "featured", "host", "id", "language", "plays", "rating", "status", "summary", "tags", "title", "updatedAt") SELECT "coverImage", "createdAt", "description", "episodeCount", "featured", "host", "id", "language", "plays", "rating", "status", "summary", "tags", "title", "updatedAt" FROM "Podcast";
DROP TABLE "Podcast";
ALTER TABLE "new_Podcast" RENAME TO "Podcast";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_CategoryToPodcast_AB_unique" ON "_CategoryToPodcast"("A", "B");

-- CreateIndex
CREATE INDEX "_CategoryToPodcast_B_index" ON "_CategoryToPodcast"("B");
