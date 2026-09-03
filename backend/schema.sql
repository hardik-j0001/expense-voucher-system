-- Expense Voucher Management System
-- Database Schema (MySQL)

CREATE DATABASE IF NOT EXISTS `expense_voucher_db`;
USE `expense_voucher_db`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `Users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('employee', 'director', 'accounts') NOT NULL DEFAULT 'employee',
  `department` VARCHAR(255) DEFAULT NULL,
  `signature` VARCHAR(255) DEFAULT NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Vouchers Table
CREATE TABLE IF NOT EXISTS `Vouchers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `voucherNumber` VARCHAR(255) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `department` VARCHAR(255) NOT NULL,
  `expenseDate` DATETIME NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `category` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('draft', 'submitted', 'approved', 'rejected') NOT NULL DEFAULT 'draft',
  `employeeSignature` VARCHAR(255) DEFAULT NULL,
  `directorSignature` VARCHAR(255) DEFAULT NULL,
  `rejectionReason` TEXT DEFAULT NULL,
  `approvalDate` DATETIME DEFAULT NULL,
  `employeeId` INT NOT NULL,
  `directorId` INT DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_vouchers_employee` FOREIGN KEY (`employeeId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_vouchers_director` FOREIGN KEY (`directorId`) REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Indexes for performance
CREATE INDEX `idx_vouchers_status` ON `Vouchers` (`status`);
CREATE INDEX `idx_vouchers_employeeId` ON `Vouchers` (`employeeId`);
CREATE INDEX `idx_vouchers_expenseDate` ON `Vouchers` (`expenseDate`);
