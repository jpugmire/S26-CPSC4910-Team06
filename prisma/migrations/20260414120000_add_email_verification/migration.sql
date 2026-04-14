ALTER TABLE `User` ADD COLUMN `emailVerified` BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE `Email_Verification_Token` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `token` VARCHAR(191) NOT NULL,
  `userId` INTEGER NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Email_Verification_Token_token_key` (`token`),
  INDEX `Email_Verification_Token_userId_fkey` (`userId`),
  CONSTRAINT `Email_Verification_Token_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`User_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
