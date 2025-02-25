-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 25, 2025 at 04:49 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `spire`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`spire`@`%` PROCEDURE `generate_id` (IN `prefix` CHAR(8), IN `table_name` VARCHAR(255), OUT `new_id` CHAR(8))   BEGIN
    DECLARE current_max_id char(8) DEFAULT NULL;
    DECLARE new_number INT DEFAULT 1;
    DECLARE sql_query VARCHAR(255);
    DECLARE lock_acquired BOOLEAN DEFAULT FALSE;
    DECLARE id_exists INT DEFAULT 0;
    DECLARE max_attempts INT DEFAULT 10;
    DECLARE attempt INT DEFAULT 0;
    DECLARE full_prefix char(8);

    -- Retry loop to acquire lock
    lock_retry: REPEAT
        SELECT GET_LOCK('id_generation_lock', 5) INTO lock_acquired;

        IF lock_acquired THEN
            -- Lock acquired, proceed with ID generation
            SET full_prefix = CONCAT(prefix, '%');

            -- Select the current max ID
            SET sql_query = CONCAT('SELECT MAX(id) INTO @current_max_id FROM ', table_name, ' WHERE id LIKE ?');
            PREPARE stmt FROM sql_query;
            EXECUTE stmt USING full_prefix;
            DEALLOCATE PREPARE stmt;

            SELECT @current_max_id INTO current_max_id;

            -- Extract numeric part and generate new ID
            IF current_max_id IS NOT NULL THEN
                SET new_number = CAST(SUBSTRING(current_max_id, LENGTH(prefix) + 1) AS UNSIGNED) + 1;
            END IF;

            SET new_id = CONCAT(prefix, LPAD(new_number, 6, '0'));

            -- Check if new ID already exists
            SET sql_query = CONCAT('SELECT COUNT(*) INTO @id_exists FROM ', table_name, ' WHERE id = ?');
            PREPARE stmt FROM sql_query;
            EXECUTE stmt USING new_id;
            DEALLOCATE PREPARE stmt;

            SELECT @id_exists INTO id_exists;

            -- Regenerate if ID exists
            WHILE id_exists > 0 DO
                SET new_number = new_number + 1;
                SET new_id = CONCAT(prefix, LPAD(new_number, 6, '0'));

                PREPARE stmt FROM sql_query;
                EXECUTE stmt USING new_id;
                DEALLOCATE PREPARE stmt;

                SELECT @id_exists INTO id_exists;
            END WHILE;

            -- Release the lock
            DO RELEASE_LOCK('id_generation_lock');
            LEAVE lock_retry;

        ELSE
            -- Retry mechanism
            SET attempt = attempt + 1;
            IF attempt >= max_attempts THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Could not acquire lock for ID generation after max retries';
                LEAVE lock_retry;
            END IF;
        END IF;
    UNTIL lock_acquired END REPEAT;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `activities`
--

CREATE TABLE `activities` (
  `id` int(11) NOT NULL,
  `module` varchar(100) DEFAULT NULL,
  `activity` varchar(5000) NOT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(45) NOT NULL,
  `entry_by_id` char(8) NOT NULL,
  `entry_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activities`
--

INSERT INTO `activities` (`id`, `module`, `activity`, `details`, `ip_address`, `entry_by_id`, `entry_at`) VALUES
(1, 'General', 'Logged in.', '', '152.59.15.125', 'A3', '2025-02-23 11:26:56'),
(2, 'General', 'Logged out.', '', '152.59.15.125', 'A3', '2025-02-23 11:30:27'),
(3, 'General', 'Logged in.', '', '152.59.15.125', 'A3', '2025-02-23 11:30:39'),
(4, 'General', 'Logged out.', '', '152.59.15.125', 'A3', '2025-02-23 11:34:37'),
(5, 'General', 'Logged in.', '', '152.59.15.125', 'A3', '2025-02-23 11:38:57'),
(6, 'General', 'Logged out.', '', '152.59.15.125', 'A3', '2025-02-23 11:40:02'),
(7, 'General', 'Logged in.', '', '152.59.34.36', 'A3', '2025-02-23 20:38:17'),
(8, 'Inquiries', 'Added <b>IQ000001</b>.', '', '152.59.34.36', 'A3', '2025-02-23 20:39:50'),
(9, 'Notes', 'Added in <b>IQ000001</b>.', '', '152.59.34.36', 'A3', '2025-02-23 20:40:15'),
(10, 'Inquiries', 'Added <b>PJ000001</b>.', '', '152.59.34.36', 'A3', '2025-02-23 20:41:29'),
(11, 'Projects', 'Added government id <b>RS/24/02/2025</b> in <b>PJ000001</b>.', '', '152.59.34.36', 'A3', '2025-02-23 20:42:49'),
(12, 'Tasks', 'Added <b>TK000001</b> in <b>PJ000001</b>', '', '152.59.34.36', 'A3', '2025-02-23 20:43:12'),
(13, 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000001</b>.', '', '152.59.34.36', 'A3', '2025-02-23 20:44:10'),
(14, 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000001</b>.', '', '152.59.34.36', 'A3', '2025-02-23 20:44:59'),
(15, 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000001</b>.', '', '152.59.34.36', 'A3', '2025-02-23 20:45:32'),
(16, 'Tasks', 'Added <b>TK000002</b> in <b>PJ000001</b>', '', '152.59.34.36', 'A3', '2025-02-23 20:45:54'),
(17, 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000001</b>.', '', '152.59.34.36', 'A3', '2025-02-23 20:46:19'),
(18, 'Single Client', 'Edited Address from <b>blank</b> to <b>102, Block 18, Rudram Apartments, Opp SK Farm, Rajpath Rangoli Road, Bodakdev, Ahmedabad 380054</b>, Notes from <b>blank</b> to <b>One of the team members since CharteredWorks</b> of <b>CN000001</b>.', '', '152.59.34.36', 'A3', '2025-02-23 20:47:20'),
(19, 'General', 'Logged out.', '', '152.59.34.36', 'A3', '2025-02-23 20:48:56'),
(20, 'General', 'Logged in.', '', '122.182.130.200', 'A2', '2025-02-24 06:00:10'),
(21, 'Inquiries', 'Added <b>IQ000002</b>.', '', '122.182.130.200', 'A2', '2025-02-24 06:13:54'),
(22, 'Inquiries', 'Added <b>PJ000002</b>.', '', '122.182.130.200', 'A2', '2025-02-24 06:14:22'),
(23, 'Tasks', 'Added <b>TK000003</b> in <b>PJ000002</b>', '', '122.182.130.200', 'A2', '2025-02-24 06:14:42'),
(24, 'Tasks', 'Added <b>TK000004</b> in <b>PJ000002</b>', '', '122.182.130.200', 'A2', '2025-02-24 06:14:50'),
(25, 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000002</b>.', '', '122.182.130.200', 'A2', '2025-02-24 06:14:58'),
(26, 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000002</b>.', '', '122.182.130.200', 'A2', '2025-02-24 06:15:06'),
(27, 'Tasks', 'Edited  of <b>TK000003</b> in <b>PJ000002</b>.', '', '122.182.130.200', 'A2', '2025-02-24 06:15:11'),
(28, 'Tasks', 'Edited  of <b>TK000004</b> in <b>PJ000002</b>.', '', '122.182.130.200', 'A2', '2025-02-24 06:17:28'),
(29, 'Tasks', 'Marked sub task having <b>20m</b> & <b>AJSANS</b> as completed of <b>TK000004</b> in <b>PJ000002</b>', '', '122.182.130.200', 'A2', '2025-02-24 06:17:33'),
(30, 'Tasks', 'Marked sub task having <b>20a</b> & <b>jasnd</b> as completed of <b>TK000003</b> in <b>PJ000002</b>', '', '122.182.130.200', 'A2', '2025-02-24 06:17:38'),
(31, 'Tasks', 'Marked Task as Completed <b>TK000003</b> in <b>PJ000002</b> due to <b>A</b>', '', '122.182.130.200', 'A2', '2025-02-24 06:17:43'),
(32, 'Tasks', 'Marked all sub tasks as completed of <b>TK000003</b> in <b>PJ000002</b>', '', '122.182.130.200', 'A2', '2025-02-24 06:17:43'),
(33, 'Tasks', 'Marked Task as Completed <b>TK000004</b> in <b>PJ000002</b> due to <b>C</b>', '', '122.182.130.200', 'A2', '2025-02-24 06:17:50'),
(34, 'Tasks', 'Marked all sub tasks as completed of <b>TK000004</b> in <b>PJ000002</b>', '', '122.182.130.200', 'A2', '2025-02-24 06:17:50'),
(35, 'Affiliates', 'Added affiliate(s).', '', '122.182.130.200', 'A2', '2025-02-24 06:18:34'),
(36, 'Projects', 'Added government id <b>XCM L ZC</b> in <b>PJ000002</b>.', '', '122.182.130.200', 'A2', '2025-02-24 06:18:47'),
(37, 'Projects', 'Mapped <b>(AF000001)</b> to <b>PJ000002</b>.', '', '122.182.130.200', 'A2', '2025-02-24 06:18:57'),
(38, 'Projects', 'Edited quote of <b>PJ000002</b> from <b>10000.00</b> to <b>20000</b>.', '', '122.182.130.200', 'A2', '2025-02-24 06:19:10'),
(39, 'New Invoice', 'Generated invoice <b>SA/2024-25/00001</b> for <b>PJ000002</b>', '', '122.182.130.200', 'A2', '2025-02-24 06:36:24'),
(40, 'Invoices', 'Added transaction in <b>SA/2024-25/00001</b>.', '', '122.182.130.200', 'A2', '2025-02-24 06:36:39'),
(41, 'New Invoice', 'Generated invoice <b>SA/2024-25/00002</b> for <b>PJ000001</b>', '', '122.182.130.200', 'A2', '2025-02-24 06:37:45'),
(42, 'New Invoice', 'Generated invoice <b>SA/2024-25/00003</b> for <b>PJ000001</b>', '', '122.182.130.200', 'A2', '2025-02-24 06:39:40'),
(43, 'New RV', 'Generated RV <b>SA/2024-25/00001</b> for <b>PJ000002</b>', '', '122.182.130.200', 'A2', '2025-02-24 06:42:55'),
(44, 'Vendors', 'Added vendor(s).', '', '122.182.130.200', 'A2', '2025-02-24 06:47:36'),
(45, 'Cash Flow', 'Added head <b>SDCSDC</b> in <b>JADEJA</b>.', '', '122.182.130.200', 'A2', '2025-02-24 06:47:52'),
(46, 'General', 'Logged in.', '', '152.58.35.111', 'A3', '2025-02-24 07:35:16'),
(47, 'General', 'Logged out.', '', '152.58.35.111', 'A3', '2025-02-24 07:48:50'),
(48, 'General', 'Logged in.', '', '152.58.35.111', 'A3', '2025-02-24 07:49:18'),
(49, 'Cash Flow', 'Added entity <b>Ramesh Acharya</b> in <b>Other Income</b>.', '', '152.58.35.111', 'A3', '2025-02-24 07:52:47'),
(50, 'General', 'Logged out.', '', '152.58.35.111', 'A3', '2025-02-24 07:59:15'),
(51, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-02-24 20:35:22'),
(52, 'New Invoice', 'Edited invoice <b>SA/2024-25/00002</b> for <b>PJ000001</b>', '', 'Localhost', 'A3', '2025-02-24 21:52:16'),
(53, 'Edit Invoice', 'Edited invoice <b>SA/2024-25/00002</b> for <b>PJ000001</b>', '', 'Localhost', 'A3', '2025-02-24 22:20:57'),
(54, 'Inquiries', 'Added <b>IQ000003</b>.', '', 'Localhost', 'A3', '2025-02-24 22:56:37'),
(55, 'Inquiries', 'Added <b>PJ000003</b>.', '', 'Localhost', 'A3', '2025-02-24 22:57:04'),
(56, 'New Invoice', 'Generated invoice <b>SA/2024-25/00003</b> for <b>PJ000003</b>', '', 'Localhost', 'A3', '2025-02-24 23:23:15'),
(57, 'Edit Invoice', 'Edited invoice <b>SA/2024-25/00003</b> for <b>PJ000003</b>', '', 'Localhost', 'A3', '2025-02-24 23:24:48'),
(58, 'Cash Flow', 'Added transaction in <b>Petty Cash</b>.', '', 'Localhost', 'A3', '2025-02-24 23:47:43'),
(59, 'Cash Flow', 'Edited transaction in <b>Petty Cash</b>.', '', 'Localhost', 'A3', '2025-02-24 23:47:54'),
(60, 'Cash Flow', 'Added entity <b>asdasd</b> in <b>Office Expense</b>.', '', 'Localhost', 'A3', '2025-02-24 23:56:22'),
(61, 'Cash Flow', 'Added head <b>sasdadasd</b> for <b>asdasd</b> in <b>Office Expense</b>.', '', 'Localhost', 'A3', '2025-02-24 23:56:36'),
(62, 'General', 'Logged out.', '', 'Localhost', 'A3', '2025-02-25 00:04:12'),
(63, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-02-25 19:26:31'),
(64, 'Edit RV', 'Edit RV <b>SA/2024-25/00001</b> of <b>PJ000002</b>', '', 'Localhost', 'A3', '2025-02-25 20:08:05'),
(65, 'Edit RV', 'Edit RV <b>SA/2024-25/00001</b> of <b>PJ000002</b>', '', 'Localhost', 'A3', '2025-02-25 20:14:03'),
(66, 'Edit RV', 'Edit RV <b>SA/2024-25/00001</b> of <b>PJ000002</b>', '', 'Localhost', 'A3', '2025-02-25 20:14:24'),
(67, 'Edit RV', 'Edit RV <b>SA/2024-25/00001</b> of <b>PJ000002</b>', '', 'Localhost', 'A3', '2025-02-25 20:14:42'),
(68, 'Edit RV', 'Edit RV <b>SA/2024-25/00001</b> of <b>PJ000002</b>', '', 'Localhost', 'A3', '2025-02-25 20:21:30'),
(69, 'New RV', 'Generated RV <b>SA/2024-25/00002</b> for <b>PJ000001</b>', '', 'Localhost', 'A3', '2025-02-25 20:22:24'),
(70, 'Affiliates', 'Added transaction for <b>AF000001</b>.', '', 'Localhost', 'A3', '2025-02-25 20:26:56'),
(71, 'Affiliates', 'Added transaction for <b>AF000001</b>.', '', 'Localhost', 'A3', '2025-02-25 20:30:06'),
(72, 'Affiliates', 'Added transaction for <b>AF000001</b>.', '', 'Localhost', 'A3', '2025-02-25 20:34:29');

-- --------------------------------------------------------

--
-- Table structure for table `administrators`
--

CREATE TABLE `administrators` (
  `id` char(2) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `full_name` varchar(500) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email_address` varchar(100) NOT NULL,
  `password` text NOT NULL,
  `address` varchar(500) NOT NULL,
  `birth_date` date DEFAULT NULL,
  `designation` varchar(100) NOT NULL,
  `gender` enum('Male','Female','Other','Prefer not to say') DEFAULT NULL,
  `permissions` mediumtext DEFAULT NULL,
  `phone_number` varchar(15) NOT NULL,
  `role` varchar(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `administrators`
--

INSERT INTO `administrators` (`id`, `first_name`, `last_name`, `full_name`, `username`, `email_address`, `password`, `address`, `birth_date`, `designation`, `gender`, `permissions`, `phone_number`, `role`) VALUES
('A1', 'Drashti', 'Sharma', 'Drashti Sharma', 'DrashtiSharma', 'drashti@admins.spire.com', 'F5LJjzb6a7sEeK6rx62/u5eC3aQVhJFPQa5Zh0WPLhE=', '', '1993-10-05', 'Founder, CEO', 'Female', '-1', '9998733006', 'Administrator'),
('A2', 'Abhishek', 'Gor', 'Abhishek Gor', 'AbhishekGor', 'abhishek@admins.spire.com', 'VUWKfX4Ro/NPJdv8QZHWfGBDB5iIL1GC1ZUGbeqWOUU=', '', '1993-07-13', 'Founder, CEO', 'Male', '-1', '8000721554', 'Administrator'),
('A3', 'Kush', 'Acharya', 'Kush Acharya', 'KushAcharya', 'kush@admins.spire.com', '7SJcdDe9kjBvjuYWsvP4LZJPqnz5HVVmqjj16/MtKLM=', 'AFF8, Aakansha Apartments, Jaymala Cross Roads, Isanpur, Ahmedabad, GJ - 380015', '1993-04-26', 'Chief Technical Officer', 'Male', '-1', '8780577704', 'Administrator');

-- --------------------------------------------------------

--
-- Table structure for table `affiliates`
--

CREATE TABLE `affiliates` (
  `id` char(8) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email_address` varchar(255) DEFAULT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `bank_account_holder_name` varchar(500) DEFAULT NULL,
  `bank_account_number` bigint(200) DEFAULT NULL,
  `ifsc` varchar(200) DEFAULT NULL,
  `upi_id` varchar(200) DEFAULT NULL,
  `joined_on` timestamp NULL DEFAULT current_timestamp(),
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `entry_at` timestamp NULL DEFAULT current_timestamp(),
  `entry_by_id` char(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `affiliates`
--

INSERT INTO `affiliates` (`id`, `name`, `email_address`, `phone_number`, `bank_account_holder_name`, `bank_account_number`, `ifsc`, `upi_id`, `joined_on`, `status`, `entry_at`, `entry_by_id`) VALUES
('AF000001', 'jENIT', 'NA@NA.COM', '989856231', 'BHAI', 0, 'KSMDMDM', 'KLKDMDCLDLC', '2025-02-24 13:18:34', 'Active', '2025-02-24 13:18:34', 'A2');

-- --------------------------------------------------------

--
-- Table structure for table `affiliates_projects`
--

CREATE TABLE `affiliates_projects` (
  `id` int(11) NOT NULL,
  `affiliate_id` char(8) NOT NULL,
  `client_id` char(8) DEFAULT NULL,
  `project_id` char(8) DEFAULT NULL,
  `adjusted_project_id` char(8) DEFAULT NULL,
  `adjusted_fees` decimal(10,2) DEFAULT 0.00,
  `total_fees` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `affiliates_projects`
--

INSERT INTO `affiliates_projects` (`id`, `affiliate_id`, `client_id`, `project_id`, `adjusted_project_id`, `adjusted_fees`, `total_fees`) VALUES
(1, 'AF000001', 'CN000002', 'PJ000002', NULL, 0.00, 6000.00);

-- --------------------------------------------------------

--
-- Table structure for table `affiliates_transactions`
--

CREATE TABLE `affiliates_transactions` (
  `id` int(11) NOT NULL,
  `affiliate_id` char(8) NOT NULL,
  `project_id` char(8) NOT NULL,
  `firm_id` char(4) NOT NULL,
  `bank_id` char(8) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `particulars` varchar(500) NOT NULL,
  `payment_source` varchar(500) NOT NULL,
  `payment_type` varchar(50) NOT NULL,
  `remarks` varchar(500) NOT NULL,
  `entry_at` datetime NOT NULL DEFAULT current_timestamp(),
  `entry_by_id` char(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `affiliates_transactions`
--

INSERT INTO `affiliates_transactions` (`id`, `affiliate_id`, `project_id`, `firm_id`, `bank_id`, `amount`, `particulars`, `payment_source`, `payment_type`, `remarks`, `entry_at`, `entry_by_id`) VALUES
(1, 'AF000001', 'PJ000002', 'AC02', 'BK02', 195.00, 'asdadad', 'BK02', 'Professional Fees', 'asdadasdas', '2025-02-25 14:56:44', 'A3'),
(2, 'AF000001', 'PJ000002', 'AC01', 'BK01', 5.00, 'f', 'BK01', 'Professional Fees', 'f', '2025-02-25 14:59:50', 'A3'),
(3, 'AF000001', 'PJ000002', 'AC01', 'BK01', 15.00, 'p', 'BK01', 'Professional Fees', 'p', '2025-02-25 15:04:15', 'A3');

-- --------------------------------------------------------

--
-- Table structure for table `banks`
--

CREATE TABLE `banks` (
  `id` char(8) NOT NULL,
  `firm_id` char(4) NOT NULL,
  `name` varchar(100) NOT NULL,
  `account_number` varchar(50) NOT NULL,
  `account_type` varchar(7) NOT NULL,
  `ifsc` varchar(100) NOT NULL,
  `branch` varchar(100) NOT NULL,
  `upi_id` varchar(200) NOT NULL,
  `entry_at` datetime NOT NULL DEFAULT current_timestamp(),
  `entry_by_id` char(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `banks`
--

INSERT INTO `banks` (`id`, `firm_id`, `name`, `account_number`, `account_type`, `ifsc`, `branch`, `upi_id`, `entry_at`, `entry_by_id`) VALUES
('BK01', 'AC01', 'HDFC Bank Limited', '50200093685321', 'Savings', 'HDFC0000383', 'Naranpura Branch', 'acharyakush2604@axl', '2024-12-17 20:03:18', 'A1'),
('BK02', 'AC02', 'Bandhan Bank', '10210010518171', 'Savings', 'BDBL0001474', 'Panchwati Branch', 'acharyakush2604@axl', '2024-12-17 20:03:18', 'A1'),
('BK03', 'AC03', 'HDFC Bank', '50200061991892', 'Savings', 'HDFC0005064', 'Motera Branch', 'acharyakush2604@axl', '2024-12-17 20:03:18', 'A1'),
('BK04', 'AC04', 'Bank Of Baroda', '18260100014353', 'Savings', 'BARB0BHAIRA', 'Bhairavnath Ahmedabad', 'acharyakush2604@axl', '2024-12-17 20:03:18', 'A1');

-- --------------------------------------------------------

--
-- Table structure for table `cash_flows_entities`
--

CREATE TABLE `cash_flows_entities` (
  `id` int(11) UNSIGNED NOT NULL,
  `module_id` char(4) NOT NULL,
  `name` varchar(500) NOT NULL,
  `email_address` varchar(200) DEFAULT NULL,
  `phone_number` bigint(12) DEFAULT NULL,
  `purpose` varchar(500) NOT NULL,
  `account_holder_name` varchar(500) NOT NULL,
  `account_number` bigint(100) NOT NULL,
  `ifsc` varchar(200) NOT NULL,
  `upi_id` varchar(200) DEFAULT NULL,
  `entry_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `entry_by_id` char(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cash_flows_entities`
--

INSERT INTO `cash_flows_entities` (`id`, `module_id`, `name`, `email_address`, `phone_number`, `purpose`, `account_holder_name`, `account_number`, `ifsc`, `upi_id`, `entry_at`, `entry_by_id`) VALUES
(18, 'OTIN', 'Ramesh Acharya', 'ramesh.acharya@gmail.com', 9978075347, 'Elder Family Member', 'ACHARYA RAMESH DAYASHANKAR', 1000000005236, 'UTIB0000124', 'ramesh.acharya@oksbi', '2025-02-24 21:49:29', 'A3'),
(19, 'OFEX', 'asdasd', 'asdasd', 34242342, 'adadasd', 'asdadsada', 0, 'eqweqweqweq', '342432342', '2025-02-24 12:56:09', 'A3');

-- --------------------------------------------------------

--
-- Table structure for table `cash_flows_heads`
--

CREATE TABLE `cash_flows_heads` (
  `id` int(11) UNSIGNED NOT NULL,
  `entity_id` int(11) NOT NULL,
  `module_id` char(4) NOT NULL,
  `firm_id` char(8) NOT NULL,
  `bank_id` char(8) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_source` varchar(500) NOT NULL,
  `purpose` varchar(500) NOT NULL,
  `remarks` varchar(500) DEFAULT NULL,
  `entry_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `entry_by_id` char(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cash_flows_heads`
--

INSERT INTO `cash_flows_heads` (`id`, `entity_id`, `module_id`, `firm_id`, `bank_id`, `amount`, `payment_source`, `purpose`, `remarks`, `entry_at`, `entry_by_id`) VALUES
(1, 19, 'OFEX', 'AC01', 'BK01', 3423234.00, 'CC', 'sasdadasd', '23423423423424', '2025-02-24 12:56:26', 'A3');

-- --------------------------------------------------------

--
-- Table structure for table `cash_flows_modules`
--

CREATE TABLE `cash_flows_modules` (
  `id` int(11) NOT NULL,
  `custom_id` char(4) NOT NULL,
  `name` varchar(100) NOT NULL,
  `entry_at` datetime NOT NULL,
  `entry_by` char(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cash_flows_modules`
--

INSERT INTO `cash_flows_modules` (`id`, `custom_id`, `name`, `entry_at`, `entry_by`) VALUES
(1, 'OFEX', 'Office Expense', '2025-02-04 19:20:29', 'A3'),
(2, 'OTEX', 'Other Expense', '2025-02-04 19:20:29', 'A3'),
(3, 'OTIN', 'Other Income', '2025-02-04 19:20:29', 'A3'),
(4, 'PECA', 'Petty Cash', '2025-02-04 19:20:29', 'A3');

-- --------------------------------------------------------

--
-- Table structure for table `cash_flows_settings`
--

CREATE TABLE `cash_flows_settings` (
  `id` int(11) NOT NULL,
  `key` varchar(200) NOT NULL,
  `value` varchar(5000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cash_flows_settings`
--

INSERT INTO `cash_flows_settings` (`id`, `key`, `value`) VALUES
(1, 'income_bifurcation', '{\"categories\":{\"A1\":10,\"A2\":10,\"Provision\":80},\"effect_date\":\"2024-11-27T00:00:00.000Z\"}'),
(2, 'payment_types', '[\"Professional Fees\", \"Reimbursement Voucher\"]');

-- --------------------------------------------------------

--
-- Table structure for table `cash_flows_transactions`
--

CREATE TABLE `cash_flows_transactions` (
  `id` int(11) NOT NULL,
  `entity_id` int(11) NOT NULL,
  `head_id` int(11) UNSIGNED NOT NULL,
  `module_id` char(4) NOT NULL,
  `firm_id` char(4) NOT NULL,
  `bank_id` char(8) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `particulars` varchar(500) NOT NULL,
  `payment_source` varchar(500) NOT NULL,
  `payment_type` varchar(50) NOT NULL,
  `remarks` varchar(500) NOT NULL,
  `entry_at` datetime NOT NULL DEFAULT current_timestamp(),
  `entry_by_id` char(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `clients`
--

CREATE TABLE `clients` (
  `id` char(8) NOT NULL,
  `affiliate_ids` varchar(2000) DEFAULT NULL,
  `company_id` char(8) DEFAULT NULL,
  `reference_id` char(8) DEFAULT NULL,
  `name` varchar(200) NOT NULL,
  `address` varchar(500) DEFAULT NULL,
  `phone_number` bigint(20) DEFAULT NULL,
  `email_address` varchar(200) DEFAULT NULL,
  `is_confirmed` tinyint(1) DEFAULT 0,
  `is_deleted` tinyint(1) DEFAULT 0,
  `joined_on` datetime DEFAULT current_timestamp(),
  `notes` varchar(500) DEFAULT NULL,
  `rating` tinyint(3) UNSIGNED DEFAULT 0,
  `entry_at` datetime DEFAULT current_timestamp(),
  `entry_by_id` char(8) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `clients`
--

INSERT INTO `clients` (`id`, `affiliate_ids`, `company_id`, `reference_id`, `name`, `address`, `phone_number`, `email_address`, `is_confirmed`, `is_deleted`, `joined_on`, `notes`, `rating`, `entry_at`, `entry_by_id`) VALUES
('CN000001', NULL, 'CP000001', 'RF000001', 'Kush Acharya', '102, Block 18, Rudram Apartments, Opp SK Farm, Rajpath Rangoli Road, Bodakdev, Ahmedabad 380054', 8780577704, 'acharyakush2604@gmail.com', 1, 0, '2025-02-23 20:39:50', 'One of the team members since CharteredWorks', 0, '2025-02-23 20:39:50', NULL),
('CN000002', 'AF000001', 'CP000002', 'RF000002', 'Henish Joshi', NULL, 9898256331, 'Henish@fash.com', 1, 0, '2025-02-24 06:13:54', NULL, 0, '2025-02-24 06:13:54', NULL),
('CN000003', NULL, 'CP000003', 'RF000003', 'Ravi Dubey', NULL, 8780577811, 'ravi.dubey@gmail.com', 1, 0, '2025-02-24 22:56:36', NULL, 0, '2025-02-24 22:56:36', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `companies`
--

CREATE TABLE `companies` (
  `id` char(8) NOT NULL,
  `client_id` char(8) NOT NULL,
  `name` varchar(200) NOT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `email_address` varchar(200) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `pan` varchar(10) DEFAULT NULL,
  `gstin` varchar(15) DEFAULT NULL,
  `reimbursement_voucher` decimal(12,2) DEFAULT NULL CHECK (`reimbursement_voucher` >= 0),
  `invoice_fees` decimal(12,2) DEFAULT NULL CHECK (`invoice_fees` >= 0),
  `total_affiliate_fees` decimal(12,2) DEFAULT NULL CHECK (`total_affiliate_fees` >= 0),
  `entry_at` datetime NOT NULL DEFAULT current_timestamp(),
  `entry_by_id` char(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `companies`
--

INSERT INTO `companies` (`id`, `client_id`, `name`, `phone_number`, `email_address`, `address`, `pan`, `gstin`, `reimbursement_voucher`, `invoice_fees`, `total_affiliate_fees`, `entry_at`, `entry_by_id`) VALUES
('CP000001', 'CN000001', 'Ruby Softwares Pvt Ltd', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-02-23 20:41:28', 'A3'),
('CP000002', 'CN000002', 'JKS Pvt Ltd', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 6000.00, '2025-02-24 06:14:22', 'A2'),
('CP000003', 'CN000003', 'Television & Media Pvt Ltd', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-02-24 22:57:04', 'A3');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email_address` varchar(100) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL,
  `state` varchar(50) DEFAULT NULL,
  `country` varchar(50) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `company_name` varchar(100) DEFAULT NULL,
  `industry` varchar(50) DEFAULT NULL,
  `subscription_type` enum('Basic','Enterprise','Free','Premium') DEFAULT 'Basic',
  `license_key` varchar(255) DEFAULT NULL,
  `status` enum('Active','Inactive','Suspended') DEFAULT 'Active',
  `entry_at` datetime DEFAULT current_timestamp(),
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` char(8) NOT NULL,
  `administrator_id` char(2) DEFAULT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `full_name` varchar(500) NOT NULL,
  `email_address` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `gender` enum('Male','Female','Other','Prefer not to say') DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `phone_number` varchar(15) NOT NULL,
  `address` text NOT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `designation` varchar(100) NOT NULL,
  `employment_type` enum('Annually Confirmed','Articleship','Half Yearly Confirmed','Intern','On Contract','Permanent','Quarterly Confirmed') DEFAULT 'Intern',
  `employment_status` enum('Active','Ad-Hoc','Inactive','On Contract','On Leave','Probation','Resigned','Terminated') DEFAULT 'Active',
  `joining_date` datetime DEFAULT current_timestamp(),
  `termination_date` datetime DEFAULT NULL,
  `termination_reason` varchar(1000) DEFAULT NULL,
  `access_revoked` tinyint(1) DEFAULT 0,
  `revocation_reason` varchar(1000) DEFAULT NULL,
  `permissions` text NOT NULL,
  `entry_at` datetime DEFAULT current_timestamp(),
  `entry_by_id` char(8) NOT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `firms`
--

CREATE TABLE `firms` (
  `id` char(4) NOT NULL,
  `name` varchar(100) NOT NULL,
  `address` varchar(500) NOT NULL,
  `phone_number` varchar(15) NOT NULL,
  `email_address` varchar(100) NOT NULL,
  `pan` varchar(10) NOT NULL,
  `gstin` varchar(15) NOT NULL,
  `terms_conditions` text NOT NULL,
  `entry_at` datetime NOT NULL DEFAULT current_timestamp(),
  `entry_by_id` char(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `firms`
--

INSERT INTO `firms` (`id`, `name`, `address`, `phone_number`, `email_address`, `pan`, `gstin`, `terms_conditions`, `entry_at`, `entry_by_id`) VALUES
('AC01', 'Signiix Advisors', 'D-608, The First, Behind ITC Narmada, Vastrapur - 3800016', '9898110703', 'admin@signiixadvisors.com', 'BBXPA8126Q', '', '1. Payment is due within 30 days from the invoice date unless otherwise agreed in writing.\\n2. A late fee of 1.5% per month will be applied to overdue balances.\\n3. Any disputes regarding this invoice must be communicated within 15 days of receipts.\\n4. All payments should be made via the methods specified on the invoice.', '2024-12-17 20:02:11', 'A1'),
('AC02', 'Branchitects Firm', 'AFF8, Aakansha Flats, Opp Jaymala Cross Roads, Isanpur, Ahmedabad - 3800008', '792265411259', 'support@branchitects.com', 'BBXPA8126A', '', '1. Payment is due within 15 days from the invoice date unless otherwise agreed in writing.\\n2. A late fee of 3.5% per month will be applied to overdue balances.\\n3. Any disputes regarding this invoice must be communicated within 30 days of receipt.\\n4. All payments should be made via the methods specified on the invoice.', '2024-12-17 20:02:11', 'A1'),
('AC03', 'Pandya Sharma', 'D-608, The First, Behind ITC Narmada, Vastrapur - 3800016', '7925460175', 'support@pandya.sharma.com', 'BBXPA8126Q', '29GGGGG1314R9Z6', '1. Payment is due within 30 days from the invoice date unless otherwise agreed in writing.\\n2. A late fee of 1.5% per month will be applied to overdue balances.\\n3. Any disputes regarding this invoice must be communicated within 15 days of receipts.\\n4. All payments should be made via the methods specified on the invoice.', '2024-12-17 20:02:11', 'A3'),
('AC04', 'Abhishek Gor', '101, Shakti Flora, 9B Prankunj Society, Kankaria, Ahmedabad', '8000721554', 'abhishekgor@hotmail.com', 'BADGP9433M', 'NA', 'General', '2024-12-17 20:02:11', 'A3');

-- --------------------------------------------------------

--
-- Table structure for table `inquiries`
--

CREATE TABLE `inquiries` (
  `id` char(8) NOT NULL,
  `client_id` char(8) NOT NULL,
  `reference_id` char(8) NOT NULL,
  `main_project_id` char(8) NOT NULL,
  `sub_project_id` char(8) NOT NULL,
  `entry_date` datetime DEFAULT current_timestamp(),
  `phone_number` bigint(20) NOT NULL,
  `email_address` varchar(200) NOT NULL,
  `follow_ups` varchar(255) NOT NULL,
  `is_closed` tinyint(1) DEFAULT 0,
  `is_edited` tinyint(1) NOT NULL DEFAULT 0,
  `closure_reason` varchar(255) DEFAULT NULL,
  `quote` decimal(10,2) NOT NULL DEFAULT 2500.00,
  `status` enum('Closed','Confirmed','Hold','Open') NOT NULL DEFAULT 'Open',
  `tags` varchar(255) DEFAULT NULL,
  `entry_at` datetime DEFAULT current_timestamp(),
  `entry_by_id` char(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inquiries`
--

INSERT INTO `inquiries` (`id`, `client_id`, `reference_id`, `main_project_id`, `sub_project_id`, `entry_date`, `phone_number`, `email_address`, `follow_ups`, `is_closed`, `is_edited`, `closure_reason`, `quote`, `status`, `tags`, `entry_at`, `entry_by_id`) VALUES
('IQ000001', 'CN000001', 'RF000001', 'MP000010', 'SP000041', '2025-02-24 03:38:21', 8780577704, 'acharyakush2604@gmail.com', 'A1,A2', 0, 0, '', 45000.00, 'Confirmed', NULL, '2025-02-23 20:39:50', 'A3'),
('IQ000002', 'CN000002', 'RF000002', 'MP000010', 'SP000042', '2025-02-24 13:12:39', 9898256331, 'Henish@fash.com', 'A1,A2', 0, 0, '', 10000.00, 'Confirmed', NULL, '2025-02-24 06:13:54', 'A2'),
('IQ000003', 'CN000003', 'RF000003', 'MP000003', 'SP000020', '2025-02-24 17:25:24', 8780577811, 'ravi.dubey@gmail.com', 'A2,A3', 0, 0, '', 25000.00, 'Confirmed', NULL, '2025-02-24 22:56:36', 'A3');

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` int(11) NOT NULL,
  `custom_id` varchar(100) NOT NULL,
  `client_id` char(8) NOT NULL,
  `project_id` char(8) NOT NULL,
  `bank_id` char(4) NOT NULL,
  `particulars` varchar(5000) NOT NULL,
  `amount` decimal(10,2) NOT NULL CHECK (`amount` >= 0),
  `amount_received` decimal(10,2) NOT NULL DEFAULT 0.00,
  `due_date` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `receipt_date` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`id`, `custom_id`, `client_id`, `project_id`, `bank_id`, `particulars`, `amount`, `amount_received`, `due_date`, `created_at`, `receipt_date`) VALUES
(1, 'SA/2024-25/00001', 'CN000002', 'PJ000002', 'BK01', '[{\"amount\":20000,\"particulars\":\"Money Lending\",\"professionalService\":\"Others\",\"rowId\":0}]', 20000.00, 0.00, '2025-03-03 06:36:24', '2025-02-24 06:36:24', '2025-02-24 13:19:41'),
(2, 'SA/2024-25/00002', 'CN000001', 'PJ000001', 'BK01', '[{\"amount\":45000,\"particulars\":\"Software Development\",\"professionalService\":\"Others\",\"rowId\":0},{\"amount\":160,\"particulars\":\"CRM Development\",\"professionalService\":\"Others\",\"rowId\":1}]', 45160.00, 0.00, '2025-03-02 19:36:24', '2025-02-24 06:37:44', '2025-02-24 01:07:44'),
(4, 'SA/2024-25/00003', 'CN000003', 'PJ000003', 'BK01', '[{\"amount\":25000,\"particulars\":\"Opposition Filing\",\"professionalService\":\"Consultancy\",\"rowId\":0},{\"amount\":500,\"particulars\":\"Opposition Voting\",\"professionalService\":\"Consultancy\",\"rowId\":1}]', 25500.00, 0.00, '2025-03-20 12:21:44', '2025-02-24 23:23:13', '2025-02-24 17:53:13');

-- --------------------------------------------------------

--
-- Table structure for table `invoices_transactions`
--

CREATE TABLE `invoices_transactions` (
  `id` int(11) NOT NULL,
  `invoice_custom_id` varchar(100) NOT NULL,
  `project_id` char(8) NOT NULL,
  `entry_at` datetime DEFAULT current_timestamp(),
  `particulars` varchar(255) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `source` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoices_transactions`
--

INSERT INTO `invoices_transactions` (`id`, `invoice_custom_id`, `project_id`, `entry_at`, `particulars`, `amount`, `source`) VALUES
(1, 'SA/2024-25/00001', 'PJ000002', '2025-02-24 13:36:31', 'DA', 20000.00, 'BK01');

-- --------------------------------------------------------

--
-- Table structure for table `licenses`
--

CREATE TABLE `licenses` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `license_key` varchar(255) NOT NULL,
  `encrypted_license_data` text NOT NULL,
  `expiration_date` datetime NOT NULL,
  `status` enum('Active','Expired','Revoked') DEFAULT 'Active',
  `entry_at` datetime DEFAULT current_timestamp(),
  `entry_by_id` char(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `main_projects`
--

CREATE TABLE `main_projects` (
  `id` char(8) NOT NULL,
  `name` varchar(255) NOT NULL,
  `entry_at` datetime DEFAULT current_timestamp(),
  `entry_by_id` char(8) NOT NULL,
  `updated_at` datetime DEFAULT current_timestamp(),
  `updated_by` char(8) DEFAULT NULL,
  `update_reason` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `main_projects`
--

INSERT INTO `main_projects` (`id`, `name`, `entry_at`, `entry_by_id`, `updated_at`, `updated_by`, `update_reason`) VALUES
('MP000001', 'Accounting', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL, NULL),
('MP000002', 'Company Law', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL, NULL),
('MP000003', 'Consultancy', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL, NULL),
('MP000004', 'Drafting', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL, NULL),
('MP000005', 'FEMA', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL, NULL),
('MP000006', 'FSSAI', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL, NULL),
('MP000007', 'GST', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL, NULL),
('MP000008', 'Income Tax', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL, NULL),
('MP000009', 'LLP', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL, NULL),
('MP000010', 'Others', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL, NULL),
('MP000011', 'Registrations', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL, NULL),
('MP000012', 'Startup', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL, NULL),
('MP000013', 'Trademark', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `notes`
--

CREATE TABLE `notes` (
  `id` int(11) NOT NULL,
  `inquiry_id` char(8) DEFAULT NULL,
  `project_id` char(8) DEFAULT NULL,
  `task_id` char(8) DEFAULT NULL,
  `original_entry_by_id` char(8) NOT NULL,
  `entry_by_id` char(8) NOT NULL,
  `content` varchar(1000) NOT NULL,
  `source` varchar(20) NOT NULL,
  `entry_date` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notes`
--

INSERT INTO `notes` (`id`, `inquiry_id`, `project_id`, `task_id`, `original_entry_by_id`, `entry_by_id`, `content`, `source`, `entry_date`) VALUES
(1, 'IQ000001', NULL, NULL, '', 'A3', 'Developing a CRM for in-house usage.', 'Inquiries', '2025-02-23 20:39:50'),
(2, 'IQ000001', NULL, NULL, '', 'A3', 'Highly appreciate the patience and perseverance shown by DS and AG', 'Inquiries', '2025-02-23 20:40:14'),
(3, 'IQ000001', 'PJ000001', NULL, 'A3', 'A3', 'Immense support from DS & AG.', 'Projects', '2025-02-23 20:41:28'),
(4, 'IQ000002', NULL, NULL, '', 'A2', 'Followed ', 'Inquiries', '2025-02-24 06:13:54'),
(5, 'IQ000002', 'PJ000002', NULL, 'A2', 'A2', 'Gvt fees 5000', 'Projects', '2025-02-24 06:14:22'),
(6, 'IQ000003', NULL, NULL, '', 'A3', 'A couple who works in TV medium.', 'Inquiries', '2025-02-24 22:56:36'),
(7, 'IQ000003', 'PJ000003', NULL, 'A3', 'A3', 'Nothing to note as of now.', 'Projects', '2025-02-24 22:57:04');

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `module` varchar(50) NOT NULL,
  `type` enum('Base','Derived') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `module`, `type`) VALUES
(1, 'Affiliates', 'Affiliates', 'Base'),
(2, 'Delete Affiliate', 'Affiliates', 'Derived'),
(3, 'Edit Affiliate', 'Affiliates', 'Derived'),
(4, 'Cash Flow', 'Cash Flow', 'Base'),
(5, 'Delete Cash Flow', 'Cash Flow', 'Derived'),
(6, 'Edit Cash Flow', 'Cash Flow', 'Derived'),
(7, 'Clients', 'Clients', 'Base'),
(8, 'Delete Client', 'Clients', 'Derived'),
(9, 'Edit Client', 'Clients', 'Derived'),
(10, 'Companies', 'Companies', 'Base'),
(11, 'Delete Company', 'Companies', 'Derived'),
(12, 'Edit Company', 'Companies', 'Derived'),
(13, 'Dashboard', 'Dashboard', 'Base'),
(14, 'Employees', 'Employees', 'Base'),
(15, 'Delete Employee ', 'Employees', 'Derived'),
(16, 'Edit Employee', 'Employees', 'Derived'),
(17, 'Firms', 'Firms', 'Base'),
(18, 'Edit Firm', 'Firms', 'Derived'),
(19, 'New Firm', 'Firms', 'Derived'),
(20, 'Inquiries', 'Inquiries', 'Base'),
(21, 'Delete Inquiry', 'Inquiries', 'Derived'),
(22, 'Edit Inquiry', 'Inquiries', 'Derived'),
(23, 'New Inquiry', 'Inquiries', 'Derived'),
(24, 'New Project', 'Inquiries', 'Derived'),
(25, 'Invoices', 'Invoices', 'Base'),
(26, 'Delete Invoice', 'Invoices', 'Derived'),
(27, 'Edit Invoice', 'Invoices', 'Derived'),
(28, 'New Invoice', 'Invoices', 'Derived'),
(29, 'Projects', 'Projects', 'Base'),
(30, 'Delete Project', 'Projects', 'Derived'),
(31, 'Edit Project', 'Projects', 'Derived'),
(32, 'References', 'References', 'Base'),
(33, 'Delete Reference', 'References', 'Derived'),
(34, 'Edit Reference', 'References', 'Derived'),
(35, 'Tasks', 'Tasks', 'Base'),
(36, 'Delete Sub Task', 'Tasks', 'Derived'),
(37, 'Delete Task', 'Tasks', 'Derived'),
(38, 'Delete Task From RV', 'Tasks', 'Derived'),
(39, 'Disable Task', 'Tasks', 'Derived'),
(40, 'Edit Sub Task', 'Tasks', 'Derived'),
(41, 'Edit Task', 'Tasks', 'Derived'),
(42, 'Enable Task', 'Tasks', 'Derived'),
(43, 'Mark Sub Task Completed', 'Tasks', 'Derived'),
(44, 'Mark Task Completed', 'Tasks', 'Derived'),
(45, 'New Task', 'Tasks', 'Derived'),
(46, 'RV', 'RV', 'Base'),
(47, 'Delete RV', 'RV', 'Derived'),
(48, 'Edit RV', 'RV', 'Derived'),
(49, 'New RV', 'RV', 'Derived');

-- --------------------------------------------------------

--
-- Table structure for table `petty_cash`
--

CREATE TABLE `petty_cash` (
  `id` int(11) NOT NULL,
  `amount_received` decimal(10,2) NOT NULL,
  `balance` decimal(10,2) NOT NULL,
  `entry_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `petty_cash`
--

INSERT INTO `petty_cash` (`id`, `amount_received`, `balance`, `entry_at`) VALUES
(1, 1000.00, 1000.00, '2025-02-07 16:54:57');

-- --------------------------------------------------------

--
-- Table structure for table `petty_cash_transactions`
--

CREATE TABLE `petty_cash_transactions` (
  `id` int(11) NOT NULL,
  `firm_id` char(4) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `amount_paid` decimal(10,2) DEFAULT NULL,
  `amount_received` decimal(10,2) DEFAULT NULL,
  `balance` decimal(10,2) NOT NULL,
  `particulars` varchar(500) NOT NULL,
  `payment_type` varchar(50) NOT NULL,
  `remarks` varchar(500) NOT NULL,
  `entry_at` datetime NOT NULL DEFAULT current_timestamp(),
  `entry_by_id` char(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `petty_cash_transactions`
--

INSERT INTO `petty_cash_transactions` (`id`, `firm_id`, `amount_paid`, `amount_received`, `balance`, `particulars`, `payment_type`, `remarks`, `entry_at`, `entry_by_id`) VALUES
(1, 'AC01', 55.00, 0.00, 945.00, 'lols', 'Office', 'bols', '2025-02-24 12:47:30', 'A3');

-- --------------------------------------------------------

--
-- Table structure for table `pma__bookmark`
--

CREATE TABLE `pma__bookmark` (
  `id` int(10) UNSIGNED NOT NULL,
  `dbase` varchar(255) NOT NULL DEFAULT '',
  `user` varchar(255) NOT NULL DEFAULT '',
  `label` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `query` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Bookmarks';

-- --------------------------------------------------------

--
-- Table structure for table `pma__central_columns`
--

CREATE TABLE `pma__central_columns` (
  `db_name` varchar(64) NOT NULL,
  `col_name` varchar(64) NOT NULL,
  `col_type` varchar(64) NOT NULL,
  `col_length` text DEFAULT NULL,
  `col_collation` varchar(64) NOT NULL,
  `col_isNull` tinyint(1) NOT NULL,
  `col_extra` varchar(255) DEFAULT '',
  `col_default` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Central list of columns';

-- --------------------------------------------------------

--
-- Table structure for table `pma__column_info`
--

CREATE TABLE `pma__column_info` (
  `id` int(5) UNSIGNED NOT NULL,
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `table_name` varchar(64) NOT NULL DEFAULT '',
  `column_name` varchar(64) NOT NULL DEFAULT '',
  `comment` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `mimetype` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `transformation` varchar(255) NOT NULL DEFAULT '',
  `transformation_options` varchar(255) NOT NULL DEFAULT '',
  `input_transformation` varchar(255) NOT NULL DEFAULT '',
  `input_transformation_options` varchar(255) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Column information for phpMyAdmin';

-- --------------------------------------------------------

--
-- Table structure for table `pma__designer_settings`
--

CREATE TABLE `pma__designer_settings` (
  `username` varchar(64) NOT NULL,
  `settings_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Settings related to Designer';

-- --------------------------------------------------------

--
-- Table structure for table `pma__export_templates`
--

CREATE TABLE `pma__export_templates` (
  `id` int(5) UNSIGNED NOT NULL,
  `username` varchar(64) NOT NULL,
  `export_type` varchar(10) NOT NULL,
  `template_name` varchar(64) NOT NULL,
  `template_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Saved export templates';

-- --------------------------------------------------------

--
-- Table structure for table `pma__favorite`
--

CREATE TABLE `pma__favorite` (
  `username` varchar(64) NOT NULL,
  `tables` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Favorite tables';

-- --------------------------------------------------------

--
-- Table structure for table `pma__history`
--

CREATE TABLE `pma__history` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `username` varchar(64) NOT NULL DEFAULT '',
  `db` varchar(64) NOT NULL DEFAULT '',
  `table` varchar(64) NOT NULL DEFAULT '',
  `timevalue` timestamp NOT NULL DEFAULT current_timestamp(),
  `sqlquery` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='SQL history for phpMyAdmin';

-- --------------------------------------------------------

--
-- Table structure for table `pma__navigationhiding`
--

CREATE TABLE `pma__navigationhiding` (
  `username` varchar(64) NOT NULL,
  `item_name` varchar(64) NOT NULL,
  `item_type` varchar(64) NOT NULL,
  `db_name` varchar(64) NOT NULL,
  `table_name` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Hidden items of navigation tree';

-- --------------------------------------------------------

--
-- Table structure for table `pma__pdf_pages`
--

CREATE TABLE `pma__pdf_pages` (
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `page_nr` int(10) UNSIGNED NOT NULL,
  `page_descr` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='PDF relation pages for phpMyAdmin';

-- --------------------------------------------------------

--
-- Table structure for table `pma__recent`
--

CREATE TABLE `pma__recent` (
  `username` varchar(64) NOT NULL,
  `tables` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Recently accessed tables';

--
-- Dumping data for table `pma__recent`
--

INSERT INTO `pma__recent` (`username`, `tables`) VALUES
('spire', '[{\"db\":\"spire\",\"table\":\"cash_flows_entities\"},{\"db\":\"spire\",\"table\":\"invoices_payment_history\"},{\"db\":\"spire\",\"table\":\"banks\"},{\"db\":\"spire\",\"table\":\"tasks_settings\"},{\"db\":\"spire\",\"table\":\"cash_flows_settings\"},{\"db\":\"spire\",\"table\":\"projects_settings\"},{\"db\":\"spire\",\"table\":\"firms\"},{\"db\":\"spire\",\"table\":\"projects\"},{\"db\":\"spire\",\"table\":\"invoices\"},{\"db\":\"spire\",\"table\":\"tasks_particulars_remarks\"}]');

-- --------------------------------------------------------

--
-- Table structure for table `pma__relation`
--

CREATE TABLE `pma__relation` (
  `master_db` varchar(64) NOT NULL DEFAULT '',
  `master_table` varchar(64) NOT NULL DEFAULT '',
  `master_field` varchar(64) NOT NULL DEFAULT '',
  `foreign_db` varchar(64) NOT NULL DEFAULT '',
  `foreign_table` varchar(64) NOT NULL DEFAULT '',
  `foreign_field` varchar(64) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Relation table';

-- --------------------------------------------------------

--
-- Table structure for table `pma__savedsearches`
--

CREATE TABLE `pma__savedsearches` (
  `id` int(5) UNSIGNED NOT NULL,
  `username` varchar(64) NOT NULL DEFAULT '',
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `search_name` varchar(64) NOT NULL DEFAULT '',
  `search_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Saved searches';

-- --------------------------------------------------------

--
-- Table structure for table `pma__table_coords`
--

CREATE TABLE `pma__table_coords` (
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `table_name` varchar(64) NOT NULL DEFAULT '',
  `pdf_page_number` int(11) NOT NULL DEFAULT 0,
  `x` float UNSIGNED NOT NULL DEFAULT 0,
  `y` float UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Table coordinates for phpMyAdmin PDF output';

-- --------------------------------------------------------

--
-- Table structure for table `pma__table_info`
--

CREATE TABLE `pma__table_info` (
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `table_name` varchar(64) NOT NULL DEFAULT '',
  `display_field` varchar(64) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Table information for phpMyAdmin';

--
-- Dumping data for table `pma__table_info`
--

INSERT INTO `pma__table_info` (`db_name`, `table_name`, `display_field`) VALUES
('spire', 'invoices', 'custom_id'),
('spire', 'reimburse_vouchers', 'custom_id');

-- --------------------------------------------------------

--
-- Table structure for table `pma__table_uiprefs`
--

CREATE TABLE `pma__table_uiprefs` (
  `username` varchar(64) NOT NULL,
  `db_name` varchar(64) NOT NULL,
  `table_name` varchar(64) NOT NULL,
  `prefs` text NOT NULL,
  `last_update` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Tables'' UI preferences';

-- --------------------------------------------------------

--
-- Table structure for table `pma__tracking`
--

CREATE TABLE `pma__tracking` (
  `db_name` varchar(64) NOT NULL,
  `table_name` varchar(64) NOT NULL,
  `version` int(10) UNSIGNED NOT NULL,
  `date_created` datetime NOT NULL,
  `date_updated` datetime NOT NULL,
  `schema_snapshot` text NOT NULL,
  `schema_sql` text DEFAULT NULL,
  `data_sql` longtext DEFAULT NULL,
  `tracking` set('UPDATE','REPLACE','INSERT','DELETE','TRUNCATE','CREATE DATABASE','ALTER DATABASE','DROP DATABASE','CREATE TABLE','ALTER TABLE','RENAME TABLE','DROP TABLE','CREATE INDEX','DROP INDEX','CREATE VIEW','ALTER VIEW','DROP VIEW') DEFAULT NULL,
  `tracking_active` int(1) UNSIGNED NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Database changes tracking for phpMyAdmin';

-- --------------------------------------------------------

--
-- Table structure for table `pma__userconfig`
--

CREATE TABLE `pma__userconfig` (
  `username` varchar(64) NOT NULL,
  `timevalue` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `config_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='User preferences storage for phpMyAdmin';

--
-- Dumping data for table `pma__userconfig`
--

INSERT INTO `pma__userconfig` (`username`, `timevalue`, `config_data`) VALUES
('spire', '2025-02-06 15:21:30', '{\"Console\\/Mode\":\"collapse\"}');

-- --------------------------------------------------------

--
-- Table structure for table `pma__usergroups`
--

CREATE TABLE `pma__usergroups` (
  `usergroup` varchar(64) NOT NULL,
  `tab` varchar(64) NOT NULL,
  `allowed` enum('Y','N') NOT NULL DEFAULT 'N'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='User groups with configured menu items';

-- --------------------------------------------------------

--
-- Table structure for table `pma__users`
--

CREATE TABLE `pma__users` (
  `username` varchar(64) NOT NULL,
  `usergroup` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Users and their assignments to user groups';

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` char(8) NOT NULL,
  `affiliate_ids` varchar(2000) DEFAULT NULL,
  `client_id` char(8) NOT NULL,
  `company_id` char(8) NOT NULL,
  `firm_id` varchar(4) NOT NULL,
  `government_id` varchar(100) DEFAULT NULL,
  `inquiry_id` char(8) NOT NULL,
  `main_project_id` char(8) NOT NULL,
  `sub_project_id` char(8) NOT NULL,
  `due_on` datetime NOT NULL DEFAULT current_timestamp(),
  `completed_on` datetime DEFAULT NULL,
  `started_on` datetime NOT NULL DEFAULT current_timestamp(),
  `quote` decimal(10,2) NOT NULL CHECK (`quote` >= 0),
  `invoice_fees` decimal(10,2) NOT NULL,
  `total_affiliate_fees` decimal(10,2) DEFAULT NULL,
  `reason` varchar(1000) DEFAULT NULL,
  `status` enum('Active','Completed','Cancelled','Closed','Hold') NOT NULL,
  `teams` varchar(500) NOT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `is_edited` tinyint(1) DEFAULT 0,
  `entry_at` datetime NOT NULL DEFAULT current_timestamp(),
  `entry_by_id` char(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `affiliate_ids`, `client_id`, `company_id`, `firm_id`, `government_id`, `inquiry_id`, `main_project_id`, `sub_project_id`, `due_on`, `completed_on`, `started_on`, `quote`, `invoice_fees`, `total_affiliate_fees`, `reason`, `status`, `teams`, `is_deleted`, `is_edited`, `entry_at`, `entry_by_id`) VALUES
('PJ000001', NULL, 'CN000001', 'CP000001', 'AC01', 'RS/24/02/2025', 'IQ000001', 'MP000010', 'SP000041', '2025-02-23 18:30:00', NULL, '2025-02-23 20:41:28', 45000.00, 45000.00, NULL, NULL, 'Active', 'A1,A2', 0, 0, '2025-02-23 20:41:28', 'A3'),
('PJ000002', 'AF000001', 'CN000002', 'CP000002', 'AC01', 'XCM L ZC', 'IQ000002', 'MP000010', 'SP000042', '2025-02-24 18:30:00', NULL, '2025-02-24 06:14:22', 20000.00, 20000.00, 6000.00, NULL, 'Active', 'A1,A2', 0, 0, '2025-02-24 06:14:22', 'A2'),
('PJ000003', NULL, 'CN000003', 'CP000003', 'AC01', NULL, 'IQ000003', 'MP000003', 'SP000020', '2025-02-23 18:30:00', NULL, '2025-02-24 22:57:04', 25000.00, 25000.00, NULL, NULL, 'Active', 'A2,A3', 0, 0, '2025-02-24 22:57:04', 'A3');

-- --------------------------------------------------------

--
-- Table structure for table `rv`
--

CREATE TABLE `rv` (
  `id` int(11) NOT NULL,
  `custom_id` varchar(100) NOT NULL,
  `client_id` char(8) DEFAULT NULL,
  `project_id` char(8) DEFAULT NULL,
  `bank_id` char(4) NOT NULL,
  `particulars` varchar(5000) NOT NULL,
  `amount` decimal(10,2) NOT NULL CHECK (`amount` >= 0),
  `amount_received` decimal(10,2) NOT NULL DEFAULT 0.00,
  `amount_pending` decimal(10,2) NOT NULL,
  `due_date` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `receipt_date` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rv`
--

INSERT INTO `rv` (`id`, `custom_id`, `client_id`, `project_id`, `bank_id`, `particulars`, `amount`, `amount_received`, `amount_pending`, `due_date`, `created_at`, `receipt_date`) VALUES
(1, 'SA/2024-25/00001', 'CN000002', 'PJ000002', 'BK01', '[{\"amount\":5000,\"particulars\":\"Money Lending\",\"professionalService\":\"Others\",\"rowId\":0},{\"amount\":15,\"particulars\":\"Honey Lending\",\"professionalService\":\"Others\",\"rowId\":1}]', 5015.00, 0.00, 5015.00, '2025-03-03 19:42:55', '2025-02-24 06:42:55', '2025-02-24 01:12:55'),
(3, 'SA/2024-25/00002', 'CN000001', 'PJ000001', 'BK01', '[{\"amount\":5000,\"particulars\":\"Software Development\",\"professionalService\":\"Others\",\"rowId\":0},{\"amount\":250,\"particulars\":\"CRM Development\",\"professionalService\":\"Others\",\"rowId\":1}]', 5000.00, 0.00, 5250.00, '2025-03-04 14:51:55', '2025-02-25 20:22:24', '2025-02-25 14:51:55');

-- --------------------------------------------------------

--
-- Table structure for table `rv_transactions`
--

CREATE TABLE `rv_transactions` (
  `id` int(11) NOT NULL,
  `rv_custom_id` varchar(100) NOT NULL,
  `project_id` char(8) NOT NULL,
  `entry_at` datetime DEFAULT current_timestamp(),
  `particulars` varchar(255) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `source` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `statuses`
--

CREATE TABLE `statuses` (
  `id` int(11) NOT NULL,
  `entity` varchar(50) DEFAULT NULL,
  `statuses` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `statuses`
--

INSERT INTO `statuses` (`id`, `entity`, `statuses`) VALUES
(1, 'Inquiries', '[\"Closed\", \"Confirmed\", \"Hold\", \"Open\"]'),
(2, 'Projects', '[\"Active\", \"Cancelled\", \"Closed\", \"Completed\", \"Hold\", \"Inactive\"]'),
(3, 'Licenses', '[\"Active\",\"Expired\",\"Revoked\"]'),
(4, 'Employees', '[\"Active\", \"Ad-Hoc\", \"Inactive\", \"Intern\", \"On Contract\", \"On Leave\", \"Probation\", \"Resigned\", \"Terminated\"]');

-- --------------------------------------------------------

--
-- Table structure for table `sub_projects`
--

CREATE TABLE `sub_projects` (
  `id` char(8) NOT NULL,
  `name` varchar(255) NOT NULL,
  `entry_at` datetime DEFAULT current_timestamp(),
  `entry_by_id` char(8) NOT NULL,
  `updated_at` datetime DEFAULT current_timestamp(),
  `updated_by` char(8) DEFAULT NULL,
  `update_reason` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sub_projects`
--

INSERT INTO `sub_projects` (`id`, `name`, `entry_at`, `entry_by_id`, `updated_at`, `updated_by`, `update_reason`) VALUES
('SP000001', 'Accounting', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000002', 'Accounting And ITR', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000003', 'Annual Compliance', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000004', 'Annual Filing', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000005', 'Application', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000006', 'BDM', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000007', 'Darpan Registration', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000008', 'Drafting Of Terms And Conditions', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000009', 'Esic Registration', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000010', 'FCGPR', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000011', 'FLA', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000012', 'FSSAI Registration', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000013', 'GST Return', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000014', 'Icegate Modification', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000015', 'Income Tax Return', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000016', 'Independent Director Remuneration', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000017', 'LLP Form Three', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000018', 'Mentorship', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000019', 'Minutes Preparation', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000020', 'Opposition Filing', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000021', 'PF Registration', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000022', 'Psara Registration', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000023', 'Retainership', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000024', 'Returns', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000025', 'Statutory Audit', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000026', 'TDS Return', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000027', 'Trademark Assignment', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000028', 'Trademark Registration', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000029', 'Trademark Reply', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `sub_tasks`
--

CREATE TABLE `sub_tasks` (
  `id` int(11) NOT NULL,
  `task_id` char(8) NOT NULL,
  `project_id` char(8) NOT NULL,
  `particular` varchar(500) NOT NULL,
  `remark` varchar(500) NOT NULL,
  `is_completed` tinyint(1) DEFAULT NULL,
  `reason` varchar(500) DEFAULT NULL,
  `entry_by_id` char(8) NOT NULL,
  `entry_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sub_tasks`
--

INSERT INTO `sub_tasks` (`id`, `task_id`, `project_id`, `particular`, `remark`, `is_completed`, `reason`, `entry_by_id`, `entry_at`) VALUES
(1, 'TK000001', 'PJ000001', '2250 - Taken on 28/05/2018', 'Will adjust in CRM fees.', 0, NULL, 'A3', '2025-02-23 20:44:10'),
(2, 'TK000001', 'PJ000001', '1800 - Lunch/Dinner charges', 'Will adjust in CRM fees as above.', 0, NULL, 'A3', '2025-02-23 20:44:58'),
(3, 'TK000001', 'PJ000001', '995 - Other miscellaneous expenses', 'Same remark as below.', 0, NULL, 'A3', '2025-02-23 20:45:31'),
(4, 'TK000002', 'PJ000001', 'Nothing decided as of now', 'Will start implementation after proper working of CRM', 0, NULL, 'A3', '2025-02-23 20:46:19'),
(5, 'TK000003', 'PJ000002', '20a', 'jasnd', 1, 'By Administrator', 'A2', '2025-02-24 06:14:57'),
(6, 'TK000004', 'PJ000002', '20m', 'AJSANS', 1, 'By Administrator', 'A2', '2025-02-24 06:15:06');

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` char(8) NOT NULL,
  `client_id` char(8) NOT NULL,
  `project_id` char(8) NOT NULL,
  `task` varchar(255) NOT NULL,
  `due_on` date NOT NULL,
  `expense` decimal(10,2) NOT NULL,
  `reason` varchar(500) DEFAULT NULL,
  `is_completed` tinyint(1) NOT NULL DEFAULT 0,
  `is_disabled` tinyint(1) NOT NULL DEFAULT 0,
  `completed_on` date DEFAULT NULL,
  `entry_at` datetime NOT NULL DEFAULT current_timestamp(),
  `entry_by_id` char(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `client_id`, `project_id`, `task`, `due_on`, `expense`, `reason`, `is_completed`, `is_disabled`, `completed_on`, `entry_at`, `entry_by_id`) VALUES
('TK000001', 'CN000001', 'PJ000001', 'Old Debt', '2025-03-03', 5000.00, NULL, 0, 0, NULL, '2025-02-23 20:43:11', 'A3'),
('TK000002', 'CN000001', 'PJ000001', 'Upcoming CRM changes', '2025-03-03', 0.00, NULL, 0, 0, NULL, '2025-02-23 20:45:53', 'A3'),
('TK000003', 'CN000002', 'PJ000002', 'Online', '2025-03-03', 4500.00, 'A', 1, 0, NULL, '2025-02-24 06:14:42', 'A2'),
('TK000004', 'CN000002', 'PJ000002', 'ofline', '2025-03-03', 500.00, 'C', 1, 0, NULL, '2025-02-24 06:14:50', 'A2');

-- --------------------------------------------------------

--
-- Table structure for table `the_references`
--

CREATE TABLE `the_references` (
  `id` char(8) NOT NULL,
  `client_id` char(8) NOT NULL,
  `name` varchar(100) NOT NULL,
  `address` varchar(200) DEFAULT NULL,
  `phone_number` bigint(20) DEFAULT NULL,
  `email_address` varchar(200) DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `joined_on` datetime DEFAULT current_timestamp(),
  `notes` varchar(500) DEFAULT NULL,
  `organization` varchar(200) DEFAULT NULL,
  `rating` tinyint(3) UNSIGNED DEFAULT 0,
  `relationship` varchar(100) DEFAULT NULL,
  `tags` varchar(500) DEFAULT NULL,
  `entry_at` datetime DEFAULT current_timestamp(),
  `entry_by_id` char(8) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `the_references`
--

INSERT INTO `the_references` (`id`, `client_id`, `name`, `address`, `phone_number`, `email_address`, `is_deleted`, `joined_on`, `notes`, `organization`, `rating`, `relationship`, `tags`, `entry_at`, `entry_by_id`) VALUES
('RF000001', 'CN000001', 'AG and DS', NULL, NULL, NULL, 0, '2025-02-23 20:39:50', NULL, NULL, 0, NULL, NULL, '2025-02-23 20:39:50', NULL),
('RF000002', 'CN000002', 'Kevin', NULL, NULL, NULL, 0, '2025-02-24 06:13:54', NULL, NULL, 0, NULL, NULL, '2025-02-24 06:13:54', NULL),
('RF000003', 'CN000003', 'Sargun Mehta', NULL, NULL, NULL, 0, '2025-02-24 22:56:36', NULL, NULL, 0, NULL, NULL, '2025-02-24 22:56:36', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `vendors`
--

CREATE TABLE `vendors` (
  `id` char(8) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email_address` varchar(255) DEFAULT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `upi_id` varchar(200) DEFAULT NULL,
  `joined_on` timestamp NULL DEFAULT current_timestamp(),
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `entry_at` timestamp NULL DEFAULT current_timestamp(),
  `entry_by_id` char(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vendors`
--

INSERT INTO `vendors` (`id`, `name`, `email_address`, `phone_number`, `upi_id`, `joined_on`, `status`, `entry_at`, `entry_by_id`) VALUES
('VD000001', 'JADEJA', 'ADCDC', '45844545454', 'ADCADCD', '2025-02-24 13:47:36', 'Active', '2025-02-24 13:47:36', 'A2');

-- --------------------------------------------------------

--
-- Table structure for table `vendors_heads`
--

CREATE TABLE `vendors_heads` (
  `id` char(8) NOT NULL,
  `vendor_id` char(8) NOT NULL,
  `firm_id` char(8) NOT NULL,
  `bank_id` char(8) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_source` varchar(500) NOT NULL,
  `purpose` varchar(500) NOT NULL,
  `remarks` varchar(500) DEFAULT NULL,
  `entry_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `entry_by_id` char(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vendors_heads`
--

INSERT INTO `vendors_heads` (`id`, `vendor_id`, `firm_id`, `bank_id`, `amount`, `payment_source`, `purpose`, `remarks`, `entry_at`, `entry_by_id`) VALUES
('VH000001', 'VD000001', 'AC02', 'BK02', 800.00, 'CHEQUE', 'SDCSDC', '555', '2025-02-24 20:47:39', 'A2');

-- --------------------------------------------------------

--
-- Table structure for table `vendors_transactions`
--

CREATE TABLE `vendors_transactions` (
  `id` int(11) NOT NULL,
  `vendor_id` char(8) NOT NULL,
  `head_id` char(8) NOT NULL,
  `firm_id` char(4) NOT NULL,
  `bank_id` char(8) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `particulars` varchar(500) NOT NULL,
  `payment_source` varchar(500) NOT NULL,
  `payment_type` varchar(50) NOT NULL,
  `remarks` varchar(500) NOT NULL,
  `entry_at` datetime NOT NULL DEFAULT current_timestamp(),
  `entry_by_id` char(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activities`
--
ALTER TABLE `activities`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `administrators`
--
ALTER TABLE `administrators`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email_address` (`email_address`);

--
-- Indexes for table `affiliates`
--
ALTER TABLE `affiliates`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `affiliates_projects`
--
ALTER TABLE `affiliates_projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_ap_affiliate_id` (`affiliate_id`),
  ADD KEY `fk_ap_client_id` (`client_id`),
  ADD KEY `fk_ap_project_id` (`project_id`);

--
-- Indexes for table `affiliates_transactions`
--
ALTER TABLE `affiliates_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_at_affiliate_id` (`affiliate_id`),
  ADD KEY `fk_at_bank_id` (`bank_id`),
  ADD KEY `fk_at_firm_id` (`firm_id`),
  ADD KEY `fk_at_project_id` (`project_id`);

--
-- Indexes for table `banks`
--
ALTER TABLE `banks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_ofb_firm_id` (`firm_id`);

--
-- Indexes for table `cash_flows_entities`
--
ALTER TABLE `cash_flows_entities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_cfe_module_id` (`module_id`);

--
-- Indexes for table `cash_flows_heads`
--
ALTER TABLE `cash_flows_heads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_cfh_bank_id` (`bank_id`),
  ADD KEY `fk_cfh_firm_id` (`firm_id`),
  ADD KEY `fk_cfh_module_id` (`module_id`);

--
-- Indexes for table `cash_flows_modules`
--
ALTER TABLE `cash_flows_modules`
  ADD PRIMARY KEY (`custom_id`);

--
-- Indexes for table `cash_flows_settings`
--
ALTER TABLE `cash_flows_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cash_flows_transactions`
--
ALTER TABLE `cash_flows_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_at_bank_id` (`bank_id`),
  ADD KEY `fk_at_firm_id` (`firm_id`),
  ADD KEY `fk_cft_module_id` (`module_id`),
  ADD KEY `fk_cft_head_id` (`head_id`);

--
-- Indexes for table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email_address` (`email_address`),
  ADD KEY `idx_company_name` (`name`),
  ADD KEY `idx_company_phone_number` (`phone_number`),
  ADD KEY `idx_company_email` (`email_address`),
  ADD KEY `fk_company_client` (`client_id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email_address` (`email_address`),
  ADD KEY `license_key` (`license_key`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email_address` (`email_address`),
  ADD KEY `administrator_id` (`administrator_id`);

--
-- Indexes for table `firms`
--
ALTER TABLE `firms`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email_address` (`email_address`);

--
-- Indexes for table `inquiries`
--
ALTER TABLE `inquiries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_inquiry_client_id` (`client_id`),
  ADD KEY `fk_inquiry_reference_id` (`reference_id`),
  ADD KEY `fk_inquiry_main_project_id` (`main_project_id`),
  ADD KEY `fk_inquiry_sub_project_id` (`sub_project_id`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_invoice_client_id` (`client_id`),
  ADD KEY `fk_invoice_project_id` (`project_id`),
  ADD KEY `fk_invoice_bank_id` (`bank_id`);

--
-- Indexes for table `invoices_transactions`
--
ALTER TABLE `invoices_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_it_project_id` (`project_id`);

--
-- Indexes for table `licenses`
--
ALTER TABLE `licenses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `license_key` (`license_key`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `main_projects`
--
ALTER TABLE `main_projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `name` (`name`);

--
-- Indexes for table `notes`
--
ALTER TABLE `notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_note_inquiry_id` (`inquiry_id`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `petty_cash`
--
ALTER TABLE `petty_cash`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `petty_cash_transactions`
--
ALTER TABLE `petty_cash_transactions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pma__bookmark`
--
ALTER TABLE `pma__bookmark`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pma__central_columns`
--
ALTER TABLE `pma__central_columns`
  ADD PRIMARY KEY (`db_name`,`col_name`);

--
-- Indexes for table `pma__column_info`
--
ALTER TABLE `pma__column_info`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `db_name` (`db_name`,`table_name`,`column_name`);

--
-- Indexes for table `pma__designer_settings`
--
ALTER TABLE `pma__designer_settings`
  ADD PRIMARY KEY (`username`);

--
-- Indexes for table `pma__export_templates`
--
ALTER TABLE `pma__export_templates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `u_user_type_template` (`username`,`export_type`,`template_name`);

--
-- Indexes for table `pma__favorite`
--
ALTER TABLE `pma__favorite`
  ADD PRIMARY KEY (`username`);

--
-- Indexes for table `pma__history`
--
ALTER TABLE `pma__history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `username` (`username`,`db`,`table`,`timevalue`);

--
-- Indexes for table `pma__navigationhiding`
--
ALTER TABLE `pma__navigationhiding`
  ADD PRIMARY KEY (`username`,`item_name`,`item_type`,`db_name`,`table_name`);

--
-- Indexes for table `pma__pdf_pages`
--
ALTER TABLE `pma__pdf_pages`
  ADD PRIMARY KEY (`page_nr`),
  ADD KEY `db_name` (`db_name`);

--
-- Indexes for table `pma__recent`
--
ALTER TABLE `pma__recent`
  ADD PRIMARY KEY (`username`);

--
-- Indexes for table `pma__relation`
--
ALTER TABLE `pma__relation`
  ADD PRIMARY KEY (`master_db`,`master_table`,`master_field`),
  ADD KEY `foreign_field` (`foreign_db`,`foreign_table`);

--
-- Indexes for table `pma__savedsearches`
--
ALTER TABLE `pma__savedsearches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `u_savedsearches_username_dbname` (`username`,`db_name`,`search_name`);

--
-- Indexes for table `pma__table_coords`
--
ALTER TABLE `pma__table_coords`
  ADD PRIMARY KEY (`db_name`,`table_name`,`pdf_page_number`);

--
-- Indexes for table `pma__table_info`
--
ALTER TABLE `pma__table_info`
  ADD PRIMARY KEY (`db_name`,`table_name`);

--
-- Indexes for table `pma__table_uiprefs`
--
ALTER TABLE `pma__table_uiprefs`
  ADD PRIMARY KEY (`username`,`db_name`,`table_name`);

--
-- Indexes for table `pma__tracking`
--
ALTER TABLE `pma__tracking`
  ADD PRIMARY KEY (`db_name`,`table_name`,`version`);

--
-- Indexes for table `pma__userconfig`
--
ALTER TABLE `pma__userconfig`
  ADD PRIMARY KEY (`username`);

--
-- Indexes for table `pma__usergroups`
--
ALTER TABLE `pma__usergroups`
  ADD PRIMARY KEY (`usergroup`,`tab`,`allowed`);

--
-- Indexes for table `pma__users`
--
ALTER TABLE `pma__users`
  ADD PRIMARY KEY (`username`,`usergroup`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_project_client_id` (`client_id`),
  ADD KEY `fk_project_company_id` (`company_id`),
  ADD KEY `fk_project_inquiry_id` (`inquiry_id`),
  ADD KEY `fk_project_main_project_id` (`main_project_id`),
  ADD KEY `fk_project_sub_project_id` (`sub_project_id`),
  ADD KEY `fk_project_invoice_firm_id` (`firm_id`);

--
-- Indexes for table `rv`
--
ALTER TABLE `rv`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_rv_client_id` (`client_id`),
  ADD KEY `fk_rv_project_id` (`project_id`),
  ADD KEY `fk_rv_bank_id` (`bank_id`);

--
-- Indexes for table `rv_transactions`
--
ALTER TABLE `rv_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_rvt_project_id` (`project_id`);

--
-- Indexes for table `statuses`
--
ALTER TABLE `statuses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sub_projects`
--
ALTER TABLE `sub_projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `name` (`name`);

--
-- Indexes for table `sub_tasks`
--
ALTER TABLE `sub_tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_st_task_id` (`task_id`),
  ADD KEY `fk_st_project_id` (`project_id`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_task_client_id` (`client_id`),
  ADD KEY `fk_task_project_id` (`project_id`);

--
-- Indexes for table `the_references`
--
ALTER TABLE `the_references`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `vendors`
--
ALTER TABLE `vendors`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `vendors_heads`
--
ALTER TABLE `vendors_heads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_vh_bank_id` (`bank_id`),
  ADD KEY `fk_vh_firm_id` (`firm_id`);

--
-- Indexes for table `vendors_transactions`
--
ALTER TABLE `vendors_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_vt_vendor_id` (`vendor_id`),
  ADD KEY `fk_vt_bank_id` (`bank_id`),
  ADD KEY `fk_vt_firm_id` (`firm_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activities`
--
ALTER TABLE `activities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT for table `affiliates_projects`
--
ALTER TABLE `affiliates_projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `affiliates_transactions`
--
ALTER TABLE `affiliates_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `cash_flows_entities`
--
ALTER TABLE `cash_flows_entities`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `cash_flows_heads`
--
ALTER TABLE `cash_flows_heads`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `cash_flows_settings`
--
ALTER TABLE `cash_flows_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `cash_flows_transactions`
--
ALTER TABLE `cash_flows_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `invoices_transactions`
--
ALTER TABLE `invoices_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `licenses`
--
ALTER TABLE `licenses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notes`
--
ALTER TABLE `notes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `petty_cash`
--
ALTER TABLE `petty_cash`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `petty_cash_transactions`
--
ALTER TABLE `petty_cash_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `pma__bookmark`
--
ALTER TABLE `pma__bookmark`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pma__column_info`
--
ALTER TABLE `pma__column_info`
  MODIFY `id` int(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pma__export_templates`
--
ALTER TABLE `pma__export_templates`
  MODIFY `id` int(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pma__history`
--
ALTER TABLE `pma__history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pma__pdf_pages`
--
ALTER TABLE `pma__pdf_pages`
  MODIFY `page_nr` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pma__savedsearches`
--
ALTER TABLE `pma__savedsearches`
  MODIFY `id` int(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rv`
--
ALTER TABLE `rv`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `rv_transactions`
--
ALTER TABLE `rv_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `statuses`
--
ALTER TABLE `statuses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `sub_tasks`
--
ALTER TABLE `sub_tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `vendors_transactions`
--
ALTER TABLE `vendors_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `affiliates_projects`
--
ALTER TABLE `affiliates_projects`
  ADD CONSTRAINT `fk_ap_affiliate_id` FOREIGN KEY (`affiliate_id`) REFERENCES `affiliates` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ap_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  ADD CONSTRAINT `fk_ap_project_id` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`);

--
-- Constraints for table `affiliates_transactions`
--
ALTER TABLE `affiliates_transactions`
  ADD CONSTRAINT `fk_at_affiliate_id` FOREIGN KEY (`affiliate_id`) REFERENCES `affiliates` (`id`),
  ADD CONSTRAINT `fk_at_bank_id` FOREIGN KEY (`bank_id`) REFERENCES `banks` (`id`),
  ADD CONSTRAINT `fk_at_firm_id` FOREIGN KEY (`firm_id`) REFERENCES `firms` (`id`),
  ADD CONSTRAINT `fk_at_project_id` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`);

--
-- Constraints for table `banks`
--
ALTER TABLE `banks`
  ADD CONSTRAINT `fk_bank_firm_id` FOREIGN KEY (`firm_id`) REFERENCES `firms` (`id`);

--
-- Constraints for table `cash_flows_entities`
--
ALTER TABLE `cash_flows_entities`
  ADD CONSTRAINT `fk_cfe_module_id` FOREIGN KEY (`module_id`) REFERENCES `cash_flows_modules` (`custom_id`);

--
-- Constraints for table `cash_flows_transactions`
--
ALTER TABLE `cash_flows_transactions`
  ADD CONSTRAINT `fk_cft_head_id` FOREIGN KEY (`head_id`) REFERENCES `cash_flows_heads` (`id`),
  ADD CONSTRAINT `fk_cft_module_id` FOREIGN KEY (`module_id`) REFERENCES `cash_flows_modules` (`custom_id`);

--
-- Constraints for table `companies`
--
ALTER TABLE `companies`
  ADD CONSTRAINT `fk_company_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `customers`
--
ALTER TABLE `customers`
  ADD CONSTRAINT `fk_customer_license_key` FOREIGN KEY (`license_key`) REFERENCES `licenses` (`license_key`);

--
-- Constraints for table `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `fk_employee_administrator_id` FOREIGN KEY (`administrator_id`) REFERENCES `administrators` (`id`);

--
-- Constraints for table `inquiries`
--
ALTER TABLE `inquiries`
  ADD CONSTRAINT `fk_inquiry_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  ADD CONSTRAINT `fk_inquiry_main_project_id` FOREIGN KEY (`main_project_id`) REFERENCES `main_projects` (`id`),
  ADD CONSTRAINT `fk_inquiry_reference_id` FOREIGN KEY (`reference_id`) REFERENCES `the_references` (`id`),
  ADD CONSTRAINT `fk_inquiry_sub_project_id` FOREIGN KEY (`sub_project_id`) REFERENCES `sub_projects` (`id`);

--
-- Constraints for table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `fk_invoice_bank_id` FOREIGN KEY (`bank_id`) REFERENCES `banks` (`id`),
  ADD CONSTRAINT `fk_invoice_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  ADD CONSTRAINT `fk_invoice_project_id` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`);

--
-- Constraints for table `invoices_transactions`
--
ALTER TABLE `invoices_transactions`
  ADD CONSTRAINT `fk_it_project_id` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`);

--
-- Constraints for table `licenses`
--
ALTER TABLE `licenses`
  ADD CONSTRAINT `fk_license_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`);

--
-- Constraints for table `notes`
--
ALTER TABLE `notes`
  ADD CONSTRAINT `fk_note_inquiry_id` FOREIGN KEY (`inquiry_id`) REFERENCES `inquiries` (`id`);

--
-- Constraints for table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `fk_project_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  ADD CONSTRAINT `fk_project_company_id` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  ADD CONSTRAINT `fk_project_inquiry_id` FOREIGN KEY (`inquiry_id`) REFERENCES `inquiries` (`id`),
  ADD CONSTRAINT `fk_project_invoice_firm_id` FOREIGN KEY (`firm_id`) REFERENCES `firms` (`id`),
  ADD CONSTRAINT `fk_project_main_project_id` FOREIGN KEY (`main_project_id`) REFERENCES `main_projects` (`id`),
  ADD CONSTRAINT `fk_project_sub_project_id` FOREIGN KEY (`sub_project_id`) REFERENCES `sub_projects` (`id`);

--
-- Constraints for table `rv`
--
ALTER TABLE `rv`
  ADD CONSTRAINT `fk_rv_bank_id` FOREIGN KEY (`bank_id`) REFERENCES `banks` (`id`),
  ADD CONSTRAINT `fk_rv_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  ADD CONSTRAINT `fk_rv_project_id` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`);

--
-- Constraints for table `rv_transactions`
--
ALTER TABLE `rv_transactions`
  ADD CONSTRAINT `fk_rvt_project_id` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`);

--
-- Constraints for table `sub_tasks`
--
ALTER TABLE `sub_tasks`
  ADD CONSTRAINT `fk_st_project_id` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  ADD CONSTRAINT `fk_st_task_id` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`);

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `fk_task_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  ADD CONSTRAINT `fk_task_project_id` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`);

--
-- Constraints for table `vendors_transactions`
--
ALTER TABLE `vendors_transactions`
  ADD CONSTRAINT `fk_vt_bank_id` FOREIGN KEY (`bank_id`) REFERENCES `banks` (`id`),
  ADD CONSTRAINT `fk_vt_firm_id` FOREIGN KEY (`firm_id`) REFERENCES `firms` (`id`),
  ADD CONSTRAINT `fk_vt_vendor_id` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
