/*
  Warnings:

  - You are about to drop the column `mentioned_user_id` on the `comments` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_mentioned_user_id_fkey";

-- DropIndex
DROP INDEX "comments_parent_id_idx";

-- AlterTable
ALTER TABLE "comments" DROP COLUMN "mentioned_user_id",
ADD COLUMN     "replied_to_comment_id" TEXT;

-- CreateIndex
CREATE INDEX "comments_parent_id_created_at_idx" ON "comments"("parent_id", "created_at");

-- CreateIndex
CREATE INDEX "comments_replied_to_comment_id_idx" ON "comments"("replied_to_comment_id");

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_replied_to_comment_id_fkey" FOREIGN KEY ("replied_to_comment_id") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
