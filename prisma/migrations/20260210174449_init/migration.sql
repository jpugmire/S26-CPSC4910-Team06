-- CreateTable
CREATE TABLE `User` (
    `User_ID` INTEGER NOT NULL AUTO_INCREMENT,
    `Username` VARCHAR(30) NOT NULL,
    `Password` VARCHAR(255) NOT NULL,
    `Status` VARCHAR(1) NOT NULL,
    `Date_Added` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `Date_Inactive` DATETIME(0) NULL,
    `User_Type` VARCHAR(1) NOT NULL,

    UNIQUE INDEX `User_Username_key`(`Username`),
    PRIMARY KEY (`User_ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Driver` (
    `User_ID` INTEGER NOT NULL,
    `Point_Count` INTEGER NOT NULL,
    `Org_ID` INTEGER NULL,

    INDEX `fk_Org_Id`(`Org_ID`),
    PRIMARY KEY (`User_ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sponsor` (
    `User_ID` INTEGER NOT NULL,
    `Org_ID` INTEGER NULL,

    INDEX `fk_Org_Id_Sponsor`(`Org_ID`),
    PRIMARY KEY (`User_ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Admin` (
    `User_ID` INTEGER NOT NULL,

    PRIMARY KEY (`User_ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Audit` (
    `Audit_ID` INTEGER NOT NULL AUTO_INCREMENT,
    `User_ID` INTEGER NOT NULL,
    `Date_Created` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `User_ID`(`User_ID`),
    PRIMARY KEY (`Audit_ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Catalog` (
    `Catalog_ID` INTEGER NOT NULL AUTO_INCREMENT,
    `Org_ID` INTEGER NOT NULL,
    `Catalog_Listing` INTEGER NULL,

    INDEX `Org_ID`(`Org_ID`),
    PRIMARY KEY (`Catalog_ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Catalog_Item` (
    `Item_ID` INTEGER NOT NULL AUTO_INCREMENT,
    `Item_Name` VARCHAR(30) NOT NULL,

    PRIMARY KEY (`Item_ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Catalog_Listing` (
    `Catalog_ID` INTEGER NOT NULL,
    `Item_ID` INTEGER NOT NULL,

    INDEX `fk_cci_item`(`Item_ID`),
    PRIMARY KEY (`Catalog_ID`, `Item_ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Point_Transaction` (
    `Transaction_ID` INTEGER NOT NULL AUTO_INCREMENT,
    `Price` DECIMAL(8, 2) NOT NULL,
    `Transaction_Date` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `User_ID` INTEGER NOT NULL,
    `Item_ID` INTEGER NOT NULL,

    INDEX `Item_ID`(`Item_ID`),
    INDEX `User_ID`(`User_ID`),
    PRIMARY KEY (`Transaction_ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sponsor_Org` (
    `Org_ID` INTEGER NOT NULL AUTO_INCREMENT,
    `Org_Name` VARCHAR(30) NOT NULL,

    PRIMARY KEY (`Org_ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Version` (
    `VersionID` INTEGER NOT NULL AUTO_INCREMENT,
    `VersionCreated` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `VersionNum` INTEGER NOT NULL,

    PRIMARY KEY (`VersionID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Driver` ADD CONSTRAINT `Driver_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `User`(`User_ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Driver` ADD CONSTRAINT `fk_Org_Id` FOREIGN KEY (`Org_ID`) REFERENCES `Sponsor_Org`(`Org_ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Sponsor` ADD CONSTRAINT `Sponsor_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `User`(`User_ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Sponsor` ADD CONSTRAINT `fk_Org_Id_Sponsor` FOREIGN KEY (`Org_ID`) REFERENCES `Sponsor_Org`(`Org_ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

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
ALTER TABLE `Point_Transaction` ADD CONSTRAINT `Point_Transaction_ibfk_1` FOREIGN KEY (`User_ID`) REFERENCES `User`(`User_ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Point_Transaction` ADD CONSTRAINT `Point_Transaction_ibfk_2` FOREIGN KEY (`Item_ID`) REFERENCES `Catalog_Item`(`Item_ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;
