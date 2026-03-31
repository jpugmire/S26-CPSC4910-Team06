CREATE TABLE `Password_Reset_Token` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `token` VARCHAR(191) NOT NULL,
  `userId` INT NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Password_Reset_Token_token_key` (`token`),
  INDEX `Password_Reset_Token_userId_fkey` (`userId`),
  CONSTRAINT `Password_Reset_Token_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `User` (`User_ID`)
    ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
