/*
  Warnings:

  - A unique constraint covering the columns `[Ebay_Item_ID]` on the table `Catalog_Item` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Catalog_Item` ADD COLUMN `Ebay_Item_ID` VARCHAR(191) NULL,
    ADD COLUMN `Image_Cached_At` DATETIME(0) NULL,
    ADD COLUMN `Item_Description` TEXT NULL,
    ADD COLUMN `Item_Image_URL` VARCHAR(500) NULL,
    ADD COLUMN `Point_Price` INTEGER NULL,
    MODIFY `Item_Name` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `Sponsor_Org` ADD COLUMN `Point_Dollar_Value` DECIMAL(10, 2) NULL DEFAULT 1.00;

-- CreateTable
CREATE TABLE `Driver_Application` (
    `Application_ID` INTEGER NOT NULL AUTO_INCREMENT,
    `User_ID` INTEGER NOT NULL,
    `Org_ID` INTEGER NOT NULL,
    `Status` VARCHAR(1) NOT NULL DEFAULT 'P',
    `Application_Date` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `Review_Date` DATETIME(0) NULL,

    INDEX `Driver_Application_User_ID_idx`(`User_ID`),
    INDEX `Driver_Application_Org_ID_idx`(`Org_ID`),
    PRIMARY KEY (`Application_ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Driver_Sponsor_Org` (
    `User_ID` INTEGER NOT NULL,
    `Org_ID` INTEGER NOT NULL,
    `Point_Count` INTEGER NOT NULL DEFAULT 0,

    INDEX `Driver_Sponsor_Org_Org_ID_idx`(`Org_ID`),
    PRIMARY KEY (`User_ID`, `Org_ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Catalog_Item_Ebay_Item_ID_key` ON `Catalog_Item`(`Ebay_Item_ID`);

-- AddForeignKey
ALTER TABLE `Driver_Application` ADD CONSTRAINT `Driver_Application_User_ID_fkey` FOREIGN KEY (`User_ID`) REFERENCES `User`(`User_ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Driver_Application` ADD CONSTRAINT `Driver_Application_Org_ID_fkey` FOREIGN KEY (`Org_ID`) REFERENCES `Sponsor_Org`(`Org_ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Driver_Sponsor_Org` ADD CONSTRAINT `Driver_Sponsor_Org_User_ID_fkey` FOREIGN KEY (`User_ID`) REFERENCES `Driver`(`User_ID`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Driver_Sponsor_Org` ADD CONSTRAINT `Driver_Sponsor_Org_Org_ID_fkey` FOREIGN KEY (`Org_ID`) REFERENCES `Sponsor_Org`(`Org_ID`) ON DELETE CASCADE ON UPDATE NO ACTION;
