/*
  Warnings:

  - A unique constraint covering the columns `[name,color,stockId]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Category_name_stockId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_color_stockId_key" ON "Category"("name", "color", "stockId");
