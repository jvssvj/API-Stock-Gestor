/*
  Warnings:

  - A unique constraint covering the columns `[sku,stockId]` on the table `Item` will be added. If there are existing duplicate values, this will fail.
  - Made the column `sku` on table `Item` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Item" ALTER COLUMN "sku" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Item_sku_stockId_key" ON "Item"("sku", "stockId");
