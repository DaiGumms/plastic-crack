/*
  Warnings:

  - You are about to drop the column `modelId` on the `model_tags` table. All the data in the column will be lost.
  - You are about to drop the column `collectionId` on the `models` table. All the data in the column will be lost.
  - You are about to drop the column `isPublic` on the `models` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `models` table. All the data in the column will be lost.
  - You are about to drop the column `paintingStatus` on the `models` table. All the data in the column will be lost.
  - You are about to drop the column `pointsCost` on the `models` table. All the data in the column will be lost.
  - You are about to drop the column `purchaseDate` on the `models` table. All the data in the column will be lost.
  - You are about to drop the column `purchasePrice` on the `models` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `models` table. All the data in the column will be lost.
  - You are about to drop the `model_likes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `model_photos` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userModelId,tagId]` on the table `model_tags` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,gameSystemId,factionId]` on the table `models` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userModelId` to the `model_tags` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "model_likes" DROP CONSTRAINT "model_likes_modelId_fkey";

-- DropForeignKey
ALTER TABLE "model_likes" DROP CONSTRAINT "model_likes_userId_fkey";

-- DropForeignKey
ALTER TABLE "model_photos" DROP CONSTRAINT "model_photos_modelId_fkey";

-- DropForeignKey
ALTER TABLE "model_tags" DROP CONSTRAINT "model_tags_modelId_fkey";

-- DropForeignKey
ALTER TABLE "models" DROP CONSTRAINT "models_collectionId_fkey";

-- DropForeignKey
ALTER TABLE "models" DROP CONSTRAINT "models_userId_fkey";

-- DropIndex
DROP INDEX "model_tags_modelId_tagId_key";

-- AlterTable
ALTER TABLE "model_tags" DROP COLUMN "modelId",
ADD COLUMN     "userModelId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "models" DROP COLUMN "collectionId",
DROP COLUMN "isPublic",
DROP COLUMN "notes",
DROP COLUMN "paintingStatus",
DROP COLUMN "pointsCost",
DROP COLUMN "purchaseDate",
DROP COLUMN "purchasePrice",
DROP COLUMN "userId",
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isOfficial" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "modelType" TEXT,
ADD COLUMN     "officialPointsCost" INTEGER;

-- DropTable
DROP TABLE "model_likes";

-- DropTable
DROP TABLE "model_photos";

-- CreateTable
CREATE TABLE "user_models" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "customName" TEXT,
    "paintingStatus" "PaintingStatus" NOT NULL DEFAULT 'UNPAINTED',
    "notes" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "purchasePrice" DECIMAL(10,2),
    "purchaseDate" TIMESTAMP(3),
    "customPointsCost" INTEGER,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_model_photos" (
    "id" TEXT NOT NULL,
    "userModelId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "description" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "fileSize" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "mimeType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_model_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_model_likes" (
    "id" TEXT NOT NULL,
    "userModelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_model_likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_models_modelId_collectionId_key" ON "user_models"("modelId", "collectionId");

-- CreateIndex
CREATE UNIQUE INDEX "user_model_likes_userModelId_userId_key" ON "user_model_likes"("userModelId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "model_tags_userModelId_tagId_key" ON "model_tags"("userModelId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "models_name_gameSystemId_factionId_key" ON "models"("name", "gameSystemId", "factionId");

-- AddForeignKey
ALTER TABLE "user_models" ADD CONSTRAINT "user_models_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_models" ADD CONSTRAINT "user_models_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_models" ADD CONSTRAINT "user_models_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_model_photos" ADD CONSTRAINT "user_model_photos_userModelId_fkey" FOREIGN KEY ("userModelId") REFERENCES "user_models"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_model_likes" ADD CONSTRAINT "user_model_likes_userModelId_fkey" FOREIGN KEY ("userModelId") REFERENCES "user_models"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_model_likes" ADD CONSTRAINT "user_model_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "model_tags" ADD CONSTRAINT "model_tags_userModelId_fkey" FOREIGN KEY ("userModelId") REFERENCES "user_models"("id") ON DELETE CASCADE ON UPDATE CASCADE;
