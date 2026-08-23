/*
  Warnings:

  - A unique constraint covering the columns `[make,model]` on the table `Vehicle` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_make_model_key" ON "Vehicle"("make", "model");
