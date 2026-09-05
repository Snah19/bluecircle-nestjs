/*
  Warnings:

  - You are about to drop the column `views_count` on the `posts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "posts" DROP COLUMN "views_count",
ADD COLUMN     "total_views" INTEGER NOT NULL DEFAULT 0;
