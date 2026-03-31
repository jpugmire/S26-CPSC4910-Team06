ALTER TABLE `User` ADD COLUMN `twoFactorEnabled` BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE `Otp_Token` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `token` VARCHAR(191) NOT NULL,
  `userId` INT NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Otp_Token_token_key` (`token`),
  INDEX `Otp_Token_userId_fkey` (`userId`),
  CONSTRAINT `Otp_Token_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `User` (`User_ID`)
    ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;