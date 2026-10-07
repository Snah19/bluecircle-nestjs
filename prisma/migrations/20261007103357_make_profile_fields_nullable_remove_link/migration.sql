/*
  Warnings:

  - You are about to drop the column `link` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "link",
ALTER COLUMN "profile_image_url" DROP NOT NULL,
ALTER COLUMN "profile_image_url" DROP DEFAULT,
ALTER COLUMN "cover_image_url" DROP NOT NULL,
ALTER COLUMN "cover_image_url" DROP DEFAULT,
ALTER COLUMN "bio" DROP NOT NULL,
ALTER COLUMN "bio" DROP DEFAULT;
