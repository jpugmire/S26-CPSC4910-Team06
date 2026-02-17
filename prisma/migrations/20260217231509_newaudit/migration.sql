/*
  Warnings:

  - Added the required column `Message` to the `Audit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Message_Type_ID` to the `Audit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Audit` ADD COLUMN `Message` VARCHAR(255) NOT NULL,
    ADD COLUMN `Message_Type_ID` INTEGER NOT NULL;
