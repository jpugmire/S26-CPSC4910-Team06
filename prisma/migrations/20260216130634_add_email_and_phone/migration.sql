/*
  Warnings:

  - A unique constraint covering the columns `[Email]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `Email` VARCHAR(191) NULL,
    ADD COLUMN `Phone` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_Email_key` ON `User`(`Email`);
