/*
  Warnings:

  - You are about to drop the `Credentail` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Credentail";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "credential" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "credential_userId_name_key" ON "credential"("userId", "name");
