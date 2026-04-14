-- CreateTable
CREATE TABLE `Admin` (
    `User_ID` INTEGER NOT NULL,

    PRIMARY KEY (`User_ID` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Audit` (
    `Audit_ID` INTEGER NOT NULL AUTO_INCREMENT,
    `User_ID` INTEGER NOT NULL,
    `Date_Created` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `Message` VARCHAR(255) NOT NULL,
    `Message_Type_ID` INTEGER NOT NULL,
    `Note` VARCHAR(255) NULL,

    INDEX `User_ID`(`User_ID` ASC),
    PRIMARY KEY (`Audit_ID` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Catalog` (
    `Catalog_ID` INTEGER NOT NULL AUTO_INCREMENT,
    `Org_ID` INTEGER NOT NULL,

    INDEX `Org_ID`(`Org_ID` ASC),
    PRIMARY KEY (`Catalog_ID` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Catalog_Item` (
    `Item_ID` INTEGER NOT NULL AUTO_INCREMENT,
    `Item_Name` VARCHAR(255) NOT NULL,
    `Ebay_Item_ID` VARCHAR(191) NULL,
    `Image_Cached_At` DATETIME(0) NULL,
    `Item_Description` TEXT NULL,
    `Item_Image_URL` VARCHAR(500) NULL,
    `Point_Price` INTEGER NULL,

    UNIQUE INDEX `Catalog_Item_Ebay_Item_ID_key`(`Ebay_Item_ID` ASC),
    PRIMARY KEY (`Item_ID` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Catalog_Listing` (
    `Catalog_ID` INTEGER NOT NULL,
    `Item_ID` INTEGER NOT NULL,

    INDEX `fk_cci_item`(`Item_ID` ASC),
    PRIMARY KEY (`Catalog_ID` ASC, `Item_ID` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Driver` (
    `User_ID` INTEGER NOT NULL,

    PRIMARY KEY (`User_ID` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Driver_Application` (
    `Application_ID` INTEGER NOT NULL AUTO_INCREMENT,
    `User_ID` INTEGER NOT NULL,
    `Org_ID` INTEGER NOT NULL,
    `Status` VARCHAR(1) NOT NULL DEFAULT 'P',
    `Application_Date` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `Review_Date` DATETIME(0) NULL,

    INDEX `Driver_Application_Org_ID_idx`(`Org_ID` ASC),
    INDEX `Driver_Application_User_ID_idx`(`User_ID` ASC),
    PRIMARY KEY (`Application_ID` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Driver_Sponsor_Org` (
    `User_ID` INTEGER NOT NULL,
    `Org_ID` INTEGER NOT NULL,
    `Point_Count` INTEGER NOT NULL DEFAULT 0,

    INDEX `Driver_Sponsor_Org_Org_ID_idx`(`Org_ID` ASC),
    PRIMARY KEY (`User_ID` ASC, `Org_ID` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Otp_Token` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Otp_Token_token_key`(`token` ASC),
    INDEX `Otp_Token_userId_fkey`(`userId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Password_Reset_Token` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Password_Reset_Token_token_key`(`token` ASC),
    INDEX `Password_Reset_Token_userId_fkey`(`userId` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Point_Transaction` (
    `Transaction_ID` INTEGER NOT NULL AUTO_INCREMENT,
    `Price` DECIMAL(8, 2) NOT NULL,
    `Transaction_Date` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `User_ID` INTEGER NOT NULL,
    `Item_ID` INTEGER NOT NULL,

    INDEX `Item_ID`(`Item_ID` ASC),
    INDEX `User_ID`(`User_ID` ASC),
    PRIMARY KEY (`Transaction_ID` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sponsor` (
    `User_ID` INTEGER NOT NULL,
    `Org_ID` INTEGER NULL,

    INDEX `fk_Org_Id_Sponsor`(`Org_ID` ASC),
    PRIMARY KEY (`User_ID` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sponsor_Org` (
    `Org_ID` INTEGER NOT NULL AUTO_INCREMENT,
    `Org_Name` VARCHAR(30) NOT NULL,
    `Point_Dollar_Value` DECIMAL(10, 2) NULL DEFAULT 1.00,

    PRIMARY KEY (`Org_ID` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `User_ID` INTEGER NOT NULL AUTO_INCREMENT,
    `Username` VARCHAR(30) NOT NULL,
    `Password` VARCHAR(255) NOT NULL,
    `Status` VARCHAR(1) NOT NULL,
    `Date_Added` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `Date_Inactive` DATETIME(0) NULL,
    `User_Type` VARCHAR(1) NOT NULL,
    `Email` VARCHAR(191) NULL,
    `Phone` VARCHAR(191) NULL,
    `twoFactorEnabled` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `User_Email_key`(`Email` ASC),
    UNIQUE INDEX `User_Username_key`(`Username` ASC),
    PRIMARY KEY (`User_ID` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Version` (
    `VersionID` INTEGER NOT NULL AUTO_INCREMENT,
    `VersionCreated` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `VersionNum` INTEGER NOT NULL,

    PRIMARY KEY (`VersionID` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Admin` ADD CONSTRAINT `Admin_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `User`(`User_ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Audit` ADD CONSTRAINT `Audit_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `User`(`User_ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Catalog` ADD CONSTRAINT `Catalog_ibfk_1` FOREIGN KEY (`Org_ID`) REFERENCES `Sponsor_Org`(`Org_ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Catalog_Listing` ADD CONSTRAINT `fk_cci_catalog` FOREIGN KEY (`Catalog_ID`) REFERENCES `Catalog`(`Catalog_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Catalog_Listing` ADD CONSTRAINT `fk_cci_item` FOREIGN KEY (`Item_ID`) REFERENCES `Catalog_Item`(`Item_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Driver` ADD CONSTRAINT `Driver_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `User`(`User_ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Driver_Application` ADD CONSTRAINT `Driver_Application_Org_ID_fkey` FOREIGN KEY (`Org_ID`) REFERENCES `Sponsor_Org`(`Org_ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Driver_Application` ADD CONSTRAINT `Driver_Application_User_ID_fkey` FOREIGN KEY (`User_ID`) REFERENCES `User`(`User_ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Driver_Sponsor_Org` ADD CONSTRAINT `Driver_Sponsor_Org_Org_ID_fkey` FOREIGN KEY (`Org_ID`) REFERENCES `Sponsor_Org`(`Org_ID`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Driver_Sponsor_Org` ADD CONSTRAINT `Driver_Sponsor_Org_User_ID_fkey` FOREIGN KEY (`User_ID`) REFERENCES `Driver`(`User_ID`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Otp_Token` ADD CONSTRAINT `Otp_Token_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Password_Reset_Token` ADD CONSTRAINT `Password_Reset_Token_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Point_Transaction` ADD CONSTRAINT `Point_Transaction_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `User`(`User_ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Point_Transaction` ADD CONSTRAINT `Point_Transaction_ibfk_2` FOREIGN KEY (`Item_ID`) REFERENCES `Catalog_Item`(`Item_ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Sponsor` ADD CONSTRAINT `Sponsor_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `User`(`User_ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Sponsor` ADD CONSTRAINT `fk_Org_Id_Sponsor` FOREIGN KEY (`Org_ID`) REFERENCES `Sponsor_Org`(`Org_ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

