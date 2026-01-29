/*
  Warnings:

  - You are about to drop the column `image` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Item" DROP COLUMN "image",
ADD COLUMN     "imagePublicId" TEXT,
ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "image",
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "avatarPublicId" TEXT;
