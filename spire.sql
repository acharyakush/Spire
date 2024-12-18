-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 18, 2024 at 07:16 PM
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
CREATE DEFINER=`spire`@`%` PROCEDURE `generate_dynamic_id` (`prefix` VARCHAR(8), `table_name` VARCHAR(255), OUT `new_id` VARCHAR(8))   BEGIN
    DECLARE current_max_id VARCHAR(8) DEFAULT NULL;
    DECLARE new_number INT DEFAULT 1;
    DECLARE sql_query VARCHAR(255);
    DECLARE lock_acquired BOOLEAN DEFAULT FALSE;
    DECLARE id_exists INT DEFAULT 0;
    DECLARE max_attempts INT DEFAULT 10;
    DECLARE attempt INT DEFAULT 0;
    DECLARE full_prefix VARCHAR(8);

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
  `user_id` varchar(8) NOT NULL,
  `activity` varchar(255) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `user_agent` text NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `session_token` varchar(255) NOT NULL,
  `details` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activities`
--

INSERT INTO `activities` (`id`, `user_id`, `activity`, `ip_address`, `user_agent`, `created_at`, `session_token`, `details`) VALUES
(1, 'A3', 'Added new inquiry IQ000001.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-15 15:28:07', '', ''),
(2, 'A3', 'Logged out.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-15 23:32:18', '', ''),
(3, '', 'Logged in.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-16 19:05:52', 'ozL/w8dlz6aBNwTzaig7mJQJAPYIAnOZ8/zIIHgrzFn01Q3ZDsxuQHsbzzIXHiaS2M5Utj4ce3VgrrCdnjm8ZA==', ''),
(4, 'A3', 'Inquiries :: Changed status of IQ000001 from Hold to Open.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-16 20:01:07', '', ''),
(5, 'A3', 'Inquiries :: Changed status of IQ000001 from Open to Closed.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-16 20:01:12', '', ''),
(6, 'A3', 'Inquiries :: Changed status of IQ000001 from Closed to Hold.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-16 20:01:18', '', ''),
(7, 'A3', 'Inquiries :: Changed status of IQ000001 from Hold to Open.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-16 20:01:22', '', ''),
(8, 'A3', 'Inquiries :: Changed status of IQ000001 from Open to Closed.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-16 20:01:26', '', ''),
(9, 'A3', 'Inquiries :: Changed status of IQ000001 from Closed to Open.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-16 20:02:10', '', ''),
(10, 'A3', 'Inquiries :: Changed status of IQ000001 from Open to Closed.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-16 20:31:16', '', ''),
(11, 'A3', 'Inquiries :: Changed status of IQ000001 from Closed to Open.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-16 20:34:05', '', ''),
(12, 'A3', 'Inquiries :: Closed inquiry (IQ000001) due to Hello..', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-16 20:38:33', '', ''),
(13, 'A3', 'Inquiries :: Changed status of IQ000001 from Closed to Open.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-16 20:39:06', '', ''),
(14, 'A3', 'Inquiries :: Changed status of IQ000001 from Open to Hold.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-16 20:39:10', '', ''),
(15, 'A3', 'Inquiries :: Closed inquiry (IQ000001) due to Bye..', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-16 20:39:18', '', ''),
(16, 'A3', 'Inquiries :: Changed status of IQ000001 from Closed to Open.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-16 20:40:04', '', ''),
(17, 'A3', 'Inquiries :: Changed status of IQ000001 from Open to Hold.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-16 20:40:38', '', ''),
(18, 'A3', 'Inquiries :: Closed inquiry (IQ000001) due to Yes.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-16 20:40:49', '', ''),
(19, 'A3', 'Inquiries :: Changed status of IQ000001 from Closed to Open.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-16 20:40:57', '', ''),
(20, 'A3', 'Notes :: Added a note for inquiry IQ000001.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-16 20:52:47', '', ''),
(21, 'A3', 'Notes :: Added a note for inquiry (IQ000001).', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-16 20:54:45', '', ''),
(22, 'A3', 'Inquiries :: Edited inquiry (IQ000001).', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-16 23:26:19', '', ''),
(23, 'A3', 'Inquiries :: Changed status of inquiry (IQ000001) from Open to Hold.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-17 21:35:57', '', ''),
(24, 'A3', 'Inquiries :: Changed status of inquiry (IQ000001) from Hold to Open.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-17 21:36:01', '', ''),
(25, 'A3', 'Inquiries :: Changed status of inquiry (IQ000001) from Open to Hold.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-17 21:36:49', '', ''),
(26, 'A3', 'Inquiries :: Changed status of inquiry (IQ000001) from Hold to Open.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-17 21:36:51', '', ''),
(27, 'A3', 'Inquiries :: Changed status of inquiry (IQ000001) from Open to Hold.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-17 21:37:01', '', ''),
(28, 'A3', 'Inquiries :: Closed inquiry (IQ000001) due to Hello..', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-17 21:38:43', '', ''),
(29, 'A3', 'Inquiries :: Changed status of inquiry (IQ000001) from Closed to Open.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-17 21:38:49', '', ''),
(30, 'A3', 'Inquiries :: Changed status of inquiry (IQ000001) from Open to Hold.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-17 21:38:53', '', ''),
(31, 'A3', 'Inquiries :: Added new project (PJ000001).', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-17 23:48:42', '', ''),
(32, 'A3', 'Added new inquiry IQ000002.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-18 00:05:19', '', ''),
(33, 'A3', 'Logged out.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-18 00:12:39', '', ''),
(34, '', 'Logged in.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-18 19:39:44', 'Dkm2jY9u7kZ/177jvniI7omUGvFSGAoOBodba/sL0rQjh+ZtAUg/L9nfaO0J6KrlzBYAmqq+cIZ+Ka1GXicxyQ==', ''),
(35, 'A3', 'Inquiries :: Closed inquiry (IQ000002) due to Hello..', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-18 19:47:52', 'Dkm2jY9u7kZ/177jvniI7omUGvFSGAoOBodba/sL0rQjh+ZtAUg/L9nfaO0J6KrlzBYAmqq+cIZ+Ka1GXicxyQ==', ''),
(36, 'A3', 'Inquiries :: Changed status of inquiry (IQ000002) from Closed to Open.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-18 19:49:15', 'Dkm2jY9u7kZ/177jvniI7omUGvFSGAoOBodba/sL0rQjh+ZtAUg/L9nfaO0J6KrlzBYAmqq+cIZ+Ka1GXicxyQ==', ''),
(37, 'A3', 'Inquiries :: Changed status of inquiry (IQ000002) from Open to Hold.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-18 19:50:06', 'Dkm2jY9u7kZ/177jvniI7omUGvFSGAoOBodba/sL0rQjh+ZtAUg/L9nfaO0J6KrlzBYAmqq+cIZ+Ka1GXicxyQ==', ''),
(38, 'A3', 'Inquiries :: Changed status of inquiry (IQ000002) from Hold to Open.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-18 19:50:10', 'Dkm2jY9u7kZ/177jvniI7omUGvFSGAoOBodba/sL0rQjh+ZtAUg/L9nfaO0J6KrlzBYAmqq+cIZ+Ka1GXicxyQ==', ''),
(39, 'A3', 'Inquiries :: Changed status of inquiry (IQ000002) from Open to Hold.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-18 19:50:27', 'Dkm2jY9u7kZ/177jvniI7omUGvFSGAoOBodba/sL0rQjh+ZtAUg/L9nfaO0J6KrlzBYAmqq+cIZ+Ka1GXicxyQ==', ''),
(40, 'A3', 'Inquiries :: Closed inquiry (IQ000002) due to Bye.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-18 19:55:03', 'Dkm2jY9u7kZ/177jvniI7omUGvFSGAoOBodba/sL0rQjh+ZtAUg/L9nfaO0J6KrlzBYAmqq+cIZ+Ka1GXicxyQ==', ''),
(41, 'A3', 'Inquiries :: Changed status of inquiry (IQ000002) from Closed to Open.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-18 19:55:08', 'Dkm2jY9u7kZ/177jvniI7omUGvFSGAoOBodba/sL0rQjh+ZtAUg/L9nfaO0J6KrlzBYAmqq+cIZ+Ka1GXicxyQ==', ''),
(42, 'A3', 'Inquiries :: Changed status of inquiry (IQ000002) from Open to Hold.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-18 19:55:14', 'Dkm2jY9u7kZ/177jvniI7omUGvFSGAoOBodba/sL0rQjh+ZtAUg/L9nfaO0J6KrlzBYAmqq+cIZ+Ka1GXicxyQ==', ''),
(43, 'A3', 'Logged out.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-18 20:34:14', '', ''),
(44, '', 'Logged in.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-18 22:35:21', 'jXuEufuJPjPediJAb2V0+7BLcfq+OzSyBBVXlIZBZch3Y1Q6SPAOd5AEXJC8sN235HbdfYaWoEab5c2SnkbfyQ==', ''),
(45, 'A3', 'Logged out.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-18 23:45:53', '', '');

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
  `gender` enum('Male','Female','Other','Prefer not to say') DEFAULT NULL,
  `phone_number` varchar(15) NOT NULL,
  `designation` varchar(100) NOT NULL,
  `role` varchar(13) NOT NULL,
  `permissions` mediumtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `administrators`
--

INSERT INTO `administrators` (`id`, `first_name`, `last_name`, `full_name`, `username`, `email_address`, `password`, `address`, `birth_date`, `gender`, `phone_number`, `designation`, `role`, `permissions`) VALUES
('A1', 'Drashti', 'Sharma', 'Drashti Sharma', 'DrashtiSharma', 'drashti@admins.spire.com', 'F5LJjzb6a7sEeK6rx62/u5eC3aQVhJFPQa5Zh0WPLhE=', '', '1993-10-05', 'Female', '9998733006', 'Founder, CEO', 'Administrator', '-1'),
('A2', 'Abhishek', 'Gor', 'Abhishek Gor', 'AbhishekGor', 'abhishek@admins.spire.com', 'VUWKfX4Ro/NPJdv8QZHWfGBDB5iIL1GC1ZUGbeqWOUU=', '', '1993-07-13', 'Male', '8000721554', 'Founder, CEO', 'Administrator', '-1'),
('A3', 'Kush', 'Acharya', 'Kush Acharya', 'KushAcharya', 'kush@admins.spire.com', '7SJcdDe9kjBvjuYWsvP4LZJPqnz5HVVmqjj16/MtKLM=', 'AFF8, Aakansha Apartments, Jaymala Cross Roads, Isanpur, Ahmedabad, GJ - 380015', '1993-04-26', 'Male', '8780577704', 'Chief Technical Officer', 'Administrator', '-1');

-- --------------------------------------------------------

--
-- Table structure for table `administrators_companies`
--

CREATE TABLE `administrators_companies` (
  `id` varchar(4) NOT NULL,
  `name` varchar(100) NOT NULL,
  `address` varchar(500) NOT NULL,
  `contact_number` varchar(15) NOT NULL,
  `email_address` varchar(100) NOT NULL,
  `pan` varchar(10) NOT NULL,
  `gstin` varchar(15) NOT NULL,
  `terms_conditions` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_by` varchar(8) NOT NULL,
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `updated_by` varchar(8) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `administrators_companies`
--

INSERT INTO `administrators_companies` (`id`, `name`, `address`, `contact_number`, `email_address`, `pan`, `gstin`, `terms_conditions`, `created_at`, `created_by`, `updated_at`, `updated_by`) VALUES
('AC01', 'Signiix Advisors', 'D-608, The First, Behind ITC Narmada, Vastrapur - 3800016', '9898110703', 'admin@signiixadvisors.com', 'BBXPA8126Q', '', '1. Payment is due within 30 days from the invoice date unless otherwise agreed in writing.nnn.2. A late fee of 1.5% per month will be applied to overdue balances.nnn.3. Any disputes regarding this invoice must be communicated within 15 days of receipts.nnn.4. All payments should be made via the methods specified on the invoice.', '2024-12-17 20:02:11', 'A1', NULL, NULL),
('AC02', 'Branchitects Firm', 'AFF8, Aakansha Flats, Opp Jaymala Cross Roads, Isanpur, Ahmedabad - 3800008', '792265411259', 'support@branchitects.com', 'BBXPA8126A', '', '1. Payment is due within 15 days from the invoice date unless otherwise agreed in writing.nnn.2. A late fee of 3.5% per month will be applied to overdue balances.nnn.3. Any disputes regarding this invoice must be communicated within 30 days of receipt.nnn.4. All payments should be made via the methods specified on the invoice.', '2024-12-17 20:02:11', 'A1', NULL, NULL),
('AC03', 'Pandya Sharma', 'D-608, The First, Behind ITC Narmada, Vastrapur - 3800016', '7925460175', 'support@pandya.sharma.com', 'BBXPA8126Q', '29GGGGG1314R9Z6', '1. Payment is due within 30 days from the invoice date unless otherwise agreed in writing.nnn.2. A late fee of 1.5% per month will be applied to overdue balances.nnn.3. Any disputes regarding this invoice must be communicated within 15 days of receipts.nnn.4. All payments should be made via the methods specified on the invoice.', '2024-12-17 20:02:11', 'A3', NULL, NULL),
('AC04', 'Abhishek Gor', '101, Shakti Flora, 9B Prankunj Society, Kankaria, Ahmedabad', '8000721554', 'abhishekgor@hotmail.com', 'BADGP9433M', 'NA', 'General', '2024-12-17 20:02:11', 'A3', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `administrators_companies_banks`
--

CREATE TABLE `administrators_companies_banks` (
  `id` varchar(8) NOT NULL,
  `administrator_company_id` varchar(4) NOT NULL,
  `name` varchar(100) NOT NULL,
  `account_number` varchar(50) NOT NULL,
  `ifsc_code` varchar(20) NOT NULL,
  `branch_name` varchar(100) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_by` varchar(8) NOT NULL,
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `updated_by` varchar(8) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `administrators_companies_banks`
--

INSERT INTO `administrators_companies_banks` (`id`, `administrator_company_id`, `name`, `account_number`, `ifsc_code`, `branch_name`, `created_at`, `created_by`, `updated_at`, `updated_by`) VALUES
('BK01', 'AC01', 'HDFC Bank Limited', '50200093685321', 'HDFC0000383', 'Naranpura Branch', '2024-12-17 20:03:18', 'A1', NULL, ''),
('BK02', 'AC02', 'Bandhan Bank', '10210010518171', 'BDBL0001474', 'Panchwati Branch', '2024-12-17 20:03:18', 'A1', NULL, ''),
('BK03', 'AC03', 'HDFC Bank', '50200061991892', 'HDFC0005064', 'Motera Branch', '2024-12-17 20:03:18', 'A1', NULL, ''),
('BK04', 'AC04', 'Bank Of Baroda', '18260100014353', 'BARB0BHAIRA', 'Bhairavnath Ahmedabad', '2024-12-17 20:03:18', 'A1', NULL, '');

-- --------------------------------------------------------

--
-- Table structure for table `clients`
--

CREATE TABLE `clients` (
  `id` varchar(8) NOT NULL,
  `affiliate_ids` varchar(2000) DEFAULT NULL,
  `company_id` varchar(8) DEFAULT NULL,
  `reference_id` varchar(8) DEFAULT NULL,
  `name` varchar(200) NOT NULL,
  `address` varchar(500) DEFAULT NULL,
  `contact_number` bigint(20) DEFAULT NULL,
  `email_address` varchar(200) DEFAULT NULL,
  `industry` varchar(100) DEFAULT NULL,
  `is_confirmed` tinyint(1) DEFAULT 0,
  `is_deleted` tinyint(1) DEFAULT 0,
  `joined_on` datetime DEFAULT current_timestamp(),
  `notes` varchar(500) DEFAULT NULL,
  `rating` tinyint(3) UNSIGNED DEFAULT 0,
  `tags` varchar(500) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `created_by` varchar(8) DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp(),
  `updated_by` varchar(8) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `clients`
--

INSERT INTO `clients` (`id`, `affiliate_ids`, `company_id`, `reference_id`, `name`, `address`, `contact_number`, `email_address`, `industry`, `is_confirmed`, `is_deleted`, `joined_on`, `notes`, `rating`, `tags`, `created_at`, `created_by`, `updated_at`, `updated_by`) VALUES
('CN000001', NULL, 'CP000001', 'RF000001', 'Kush Acharya', NULL, 8780577704, 'acharyakush2604@gmail.com', NULL, 1, 0, '2024-12-15 15:28:07', NULL, 0, NULL, '2024-12-15 15:28:07', NULL, '2024-12-15 15:28:07', NULL),
('CN000002', NULL, NULL, 'RF000002', 'Kevin Vyas', NULL, 8780577812, 'vyas.kevin@outlook.com', NULL, 0, 0, '2024-12-18 00:05:18', NULL, 0, NULL, '2024-12-18 00:05:18', NULL, '2024-12-18 00:05:18', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `companies`
--

CREATE TABLE `companies` (
  `id` varchar(8) NOT NULL,
  `client_id` varchar(8) NOT NULL,
  `name` varchar(200) NOT NULL,
  `contact_number` varchar(15) DEFAULT NULL,
  `email_address` varchar(200) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `pan` varchar(10) DEFAULT NULL,
  `gst` varchar(15) DEFAULT NULL,
  `reimbursement_voucher` decimal(12,2) DEFAULT NULL CHECK (`reimbursement_voucher` >= 0),
  `invoice_fees` decimal(12,2) DEFAULT NULL CHECK (`invoice_fees` >= 0),
  `total_affiliate_fees` decimal(12,2) DEFAULT NULL CHECK (`total_affiliate_fees` >= 0),
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_by` varchar(8) NOT NULL,
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `updated_by` varchar(8) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `companies`
--

INSERT INTO `companies` (`id`, `client_id`, `name`, `contact_number`, `email_address`, `address`, `pan`, `gst`, `reimbursement_voucher`, `invoice_fees`, `total_affiliate_fees`, `created_at`, `created_by`, `updated_at`, `updated_by`) VALUES
('CP000001', 'CN000001', 'Sun Pharma Pvt Ltd', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2024-12-17 23:48:41', 'A3', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email_address` varchar(100) NOT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
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
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp(),
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
  `emergency_contact_name` varchar(100) NOT NULL,
  `emergency_contact_relation` varchar(50) NOT NULL,
  `emergency_contact_phone` varchar(15) NOT NULL,
  `address` text NOT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `pincode` char(6) DEFAULT NULL,
  `employment_type` enum('Annually Confirmed','Articleship','Half Yearly Confirmed','Intern','On Contract','Permanent','Quarterly Confirmed') DEFAULT 'Intern',
  `employment_status` enum('Active','Ad-Hoc','Inactive','Intern','On Contract','On Leave','Probation','Resigned','Terminated') DEFAULT 'Active',
  `joining_date` datetime DEFAULT current_timestamp(),
  `termination_date` datetime DEFAULT NULL,
  `termination_reason` varchar(1000) DEFAULT NULL,
  `access_revoked` tinyint(1) DEFAULT 0,
  `revocation_reason` varchar(1000) DEFAULT NULL,
  `permissions` text NOT NULL,
  `allow_remote_working` tinyint(1) DEFAULT 0,
  `allowed_ip_addresses` varchar(200) DEFAULT NULL,
  `last_login` datetime DEFAULT current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `created_by` char(8) NOT NULL,
  `updated_at` datetime DEFAULT current_timestamp(),
  `updated_by` char(8) DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inquiries`
--

CREATE TABLE `inquiries` (
  `id` varchar(8) NOT NULL,
  `client_id` varchar(8) NOT NULL,
  `reference_id` varchar(8) NOT NULL,
  `main_project_id` varchar(8) NOT NULL,
  `sub_project_id` varchar(8) NOT NULL,
  `entry_date` datetime DEFAULT current_timestamp(),
  `contact_number` bigint(20) NOT NULL,
  `email_address` varchar(200) NOT NULL,
  `follow_ups` varchar(255) NOT NULL,
  `is_closed` tinyint(1) DEFAULT 0,
  `closure_reason` varchar(255) DEFAULT NULL,
  `quote` decimal(10,2) NOT NULL DEFAULT 2500.00,
  `status` enum('Closed','Confirmed','Hold','Open') NOT NULL DEFAULT 'Open',
  `tags` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `created_by` varchar(8) NOT NULL,
  `updated_at` datetime DEFAULT current_timestamp(),
  `updated_by` varchar(8) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inquiries`
--

INSERT INTO `inquiries` (`id`, `client_id`, `reference_id`, `main_project_id`, `sub_project_id`, `entry_date`, `contact_number`, `email_address`, `follow_ups`, `is_closed`, `closure_reason`, `quote`, `status`, `tags`, `created_at`, `created_by`, `updated_at`, `updated_by`) VALUES
('IQ000001', 'CN000001', 'RF000001', 'MP000004', 'SP000003', '2024-12-15 09:39:42', 8780577704, 'acharyakush2604@gmail.com', 'A1,A2', 0, '', 2500.00, 'Confirmed', NULL, '2024-12-15 15:28:07', 'A3', '2024-12-17 21:38:53', 'A3'),
('IQ000002', 'CN000002', 'RF000002', 'MP000011', 'SP000006', '2024-12-17 18:23:01', 8780577812, 'vyas.kevin@outlook.com', 'A3', 0, '', 15000.00, 'Hold', NULL, '2024-12-18 00:05:18', 'A3', '2024-12-18 19:55:14', 'A3');

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
  `created_at` datetime DEFAULT current_timestamp(),
  `created_by` varchar(8) NOT NULL,
  `updated_at` datetime DEFAULT current_timestamp(),
  `updated_by` varchar(8) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `main_projects`
--

CREATE TABLE `main_projects` (
  `id` varchar(8) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `created_by` varchar(8) NOT NULL,
  `updated_at` datetime DEFAULT current_timestamp(),
  `updated_by` varchar(8) DEFAULT NULL,
  `update_reason` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `main_projects`
--

INSERT INTO `main_projects` (`id`, `name`, `created_at`, `created_by`, `updated_at`, `updated_by`, `update_reason`) VALUES
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

--
-- Triggers `main_projects`
--
DELIMITER $$
CREATE TRIGGER `generate_new_main_project_id` BEFORE INSERT ON `main_projects` FOR EACH ROW BEGIN
    DECLARE prefix VARCHAR(2) DEFAULT 'MP';  -- Prefix for sub_projects
    DECLARE new_number INT;

    -- Get the last inserted ID from the sub_projects table
    SELECT MAX(CAST(SUBSTRING(id, 3) AS UNSIGNED)) INTO new_number FROM sub_projects;

    -- If no entries exist, start from 1
    IF new_number IS NULL THEN
        SET new_number = 1;
    ELSE
        SET new_number = new_number + 1;  -- Increment the last used ID by 1
    END IF;

    -- Generate the new ID with the prefix and leading zeros
    SET NEW.id = CONCAT(prefix, LPAD(new_number, 6, '0'));
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `notes`
--

CREATE TABLE `notes` (
  `id` int(11) NOT NULL,
  `inquiry_id` varchar(8) DEFAULT NULL,
  `project_id` varchar(8) DEFAULT NULL,
  `user_id` varchar(8) NOT NULL,
  `content` varchar(1000) NOT NULL,
  `entry_date` datetime DEFAULT current_timestamp(),
  `source` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notes`
--

INSERT INTO `notes` (`id`, `inquiry_id`, `project_id`, `user_id`, `content`, `entry_date`, `source`) VALUES
(1, 'IQ000001', NULL, 'A3', 'New client. Reference from CharteredWorks.', '2024-12-15 15:28:07', 'Inquiries'),
(2, 'IQ000001', NULL, 'A3', 'Test inquiry.', '2024-12-16 20:52:47', 'Inquiries'),
(3, 'IQ000001', NULL, 'A3', 'Inquiry note #3', '2024-12-16 20:54:45', 'Inquiries'),
(10, 'IQ000001', 'PJ000001', 'A3', 'First project. Wish me good luck.', '2024-12-17 23:48:41', 'Projects'),
(11, 'IQ000002', NULL, 'A3', 'Lives in Portugal.', '2024-12-18 00:05:18', 'Inquiries');

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
(1, 'Admins', 'Admins', 'Base'),
(2, 'New Admin Company', 'Admins', 'Derived'),
(3, 'Edit Admin Company', 'Admins', 'Derived'),
(4, 'Affiliates', 'Affiliates', 'Base'),
(5, 'Edit Affiliate', 'Affiliates', 'Derived'),
(6, 'Delete Affiliate', 'Affiliates', 'Derived'),
(7, 'Cash Flow', 'Cash Flow', 'Base'),
(8, 'Edit Cash Flow', 'Cash Flow', 'Derived'),
(9, 'Delete Cash Flow', 'Cash Flow', 'Derived'),
(10, 'Clients', 'Clients', 'Base'),
(11, 'Edit Client', 'Clients', 'Derived'),
(12, 'Delete Client', 'Clients', 'Derived'),
(13, 'Companies', 'Companies', 'Base'),
(14, 'Edit Company', 'Companies', 'Derived'),
(15, 'Delete Company', 'Companies', 'Derived'),
(16, 'Dashboard', 'Dashboard', 'Base'),
(17, 'Employees', 'Employees', 'Base'),
(18, 'Edit Employee', 'Employees', 'Derived'),
(19, 'Delete Employee ', 'Employees', 'Derived'),
(20, 'Inquiries', 'Inquiry', 'Base'),
(21, 'New Inquiry', 'Inquiry', 'Derived'),
(22, 'Edit Inquiry', 'Inquiry', 'Derived'),
(23, 'Delete Inquiry', 'Inquiry', 'Derived'),
(24, 'Convert Inquiry To Project', 'Inquiry', 'Derived'),
(25, 'Invoices', 'Invoices', 'Base'),
(26, 'Generate Invoice', 'Invoices', 'Derived'),
(27, 'Delete Invoice', 'Invoices', 'Derived'),
(28, 'Projects', 'Projects', 'Base'),
(29, 'Edit Project', 'Projects', 'Derived'),
(30, 'Delete Project', 'Projects', 'Derived'),
(31, 'Payment Received', 'Projects', 'Derived'),
(32, 'References', 'References', 'Base'),
(33, 'Edit Reference', 'References', 'Derived'),
(34, 'Delete Reference', 'References', 'Derived'),
(35, 'Tasks', 'Tasks', 'Base'),
(36, 'New Task', 'Tasks', 'Derived'),
(37, 'Update Task', 'Tasks', 'Derived'),
(38, 'Disable Task', 'Tasks', 'Derived'),
(39, 'Mark Task Completed', 'Tasks', 'Derived'),
(40, 'Delete Task From Reimbursement Voucher', 'Tasks', 'Derived');

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` varchar(8) NOT NULL,
  `client_id` varchar(8) NOT NULL,
  `company_id` varchar(8) NOT NULL,
  `affiliate_ids` varchar(2000) DEFAULT NULL,
  `inquiry_id` varchar(8) NOT NULL,
  `government_id` varchar(100) DEFAULT NULL,
  `main_project_id` varchar(8) NOT NULL,
  `sub_project_id` varchar(8) NOT NULL,
  `quote` decimal(10,2) NOT NULL CHECK (`quote` >= 0),
  `due_on` datetime NOT NULL DEFAULT current_timestamp(),
  `total_affiliate_fees` decimal(10,2) DEFAULT NULL,
  `reimbursement_voucher` decimal(10,2) NOT NULL CHECK (`reimbursement_voucher` >= 0),
  `invoice_fees` decimal(10,2) NOT NULL CHECK (`invoice_fees` >= 0),
  `invoice_firm` varchar(500) NOT NULL,
  `teams` varchar(500) NOT NULL,
  `started_on` datetime NOT NULL DEFAULT current_timestamp(),
  `status` enum('Active','Completed','On Hold','Cancelled') NOT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `is_edited` tinyint(1) DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_by` varchar(8) NOT NULL,
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `updated_by` varchar(8) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `client_id`, `company_id`, `affiliate_ids`, `inquiry_id`, `government_id`, `main_project_id`, `sub_project_id`, `quote`, `due_on`, `total_affiliate_fees`, `reimbursement_voucher`, `invoice_fees`, `invoice_firm`, `teams`, `started_on`, `status`, `is_deleted`, `is_edited`, `created_at`, `created_by`, `updated_at`, `updated_by`) VALUES
('PJ000001', 'CN000001', 'CP000001', NULL, 'IQ000001', NULL, 'MP000004', 'SP000003', 2500.00, '2024-12-15 04:09:42', NULL, 1250.00, 575.00, 'AC01', 'A3,A2', '2024-12-17 23:48:41', 'Active', 0, 0, '2024-12-17 23:48:41', 'A3', NULL, NULL);

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
  `id` varchar(8) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `created_by` varchar(8) NOT NULL,
  `updated_at` datetime DEFAULT current_timestamp(),
  `updated_by` varchar(8) DEFAULT NULL,
  `update_reason` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sub_projects`
--

INSERT INTO `sub_projects` (`id`, `name`, `created_at`, `created_by`, `updated_at`, `updated_by`, `update_reason`) VALUES
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

--
-- Triggers `sub_projects`
--
DELIMITER $$
CREATE TRIGGER `generate_new_sub_project_id` BEFORE INSERT ON `sub_projects` FOR EACH ROW BEGIN
    DECLARE prefix VARCHAR(2) DEFAULT 'SP';  -- Prefix for sub_projects
    DECLARE new_number INT;

    -- Get the last inserted ID from the sub_projects table
    SELECT MAX(CAST(SUBSTRING(id, 3) AS UNSIGNED)) INTO new_number FROM sub_projects;

    -- If no entries exist, start from 1
    IF new_number IS NULL THEN
        SET new_number = 1;
    ELSE
        SET new_number = new_number + 1;  -- Increment the last used ID by 1
    END IF;

    -- Generate the new ID with the prefix and leading zeros
    SET NEW.id = CONCAT(prefix, LPAD(new_number, 6, '0'));
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `the_references`
--

CREATE TABLE `the_references` (
  `id` varchar(8) NOT NULL,
  `client_id` varchar(8) NOT NULL,
  `name` varchar(100) NOT NULL,
  `address` varchar(200) DEFAULT NULL,
  `contact_number` bigint(20) DEFAULT NULL,
  `email_address` varchar(200) DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `joined_on` datetime DEFAULT current_timestamp(),
  `notes` varchar(500) DEFAULT NULL,
  `organization` varchar(200) DEFAULT NULL,
  `rating` tinyint(3) UNSIGNED DEFAULT 0,
  `relationship` varchar(100) DEFAULT NULL,
  `tags` varchar(500) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `created_by` varchar(8) DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp(),
  `updated_by` varchar(8) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `the_references`
--

INSERT INTO `the_references` (`id`, `client_id`, `name`, `address`, `contact_number`, `email_address`, `is_deleted`, `joined_on`, `notes`, `organization`, `rating`, `relationship`, `tags`, `created_at`, `created_by`, `updated_at`, `updated_by`) VALUES
('RF000001', 'CN000001', 'Yash Chopra', NULL, NULL, NULL, 0, '2024-12-15 15:28:07', NULL, NULL, 0, NULL, NULL, '2024-12-15 15:28:07', NULL, '2024-12-15 15:28:07', NULL),
('RF000002', 'CN000002', 'Vrushank Soni', NULL, NULL, NULL, 0, '2024-12-18 00:05:18', NULL, NULL, 0, NULL, NULL, '2024-12-18 00:05:18', NULL, '2024-12-18 00:05:18', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activities`
--
ALTER TABLE `activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `session_token` (`session_token`);

--
-- Indexes for table `administrators`
--
ALTER TABLE `administrators`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email_address` (`email_address`);

--
-- Indexes for table `administrators_companies`
--
ALTER TABLE `administrators_companies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email_address` (`email_address`);

--
-- Indexes for table `administrators_companies_banks`
--
ALTER TABLE `administrators_companies_banks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_administrators_companies_banks_administrator_company_id` (`administrator_company_id`);

--
-- Indexes for table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reference_id` (`reference_id`);

--
-- Indexes for table `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email_address` (`email_address`),
  ADD KEY `idx_company_name` (`name`),
  ADD KEY `idx_company_contact_number` (`contact_number`),
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
-- Indexes for table `inquiries`
--
ALTER TABLE `inquiries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_inquiry_client_id` (`client_id`),
  ADD KEY `fk_inquiry_reference_id` (`reference_id`),
  ADD KEY `fk_inquiry_main_project_id` (`main_project_id`),
  ADD KEY `fk_inquiry_sub_project_id` (`sub_project_id`);

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
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `module` (`module`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_project_client_id` (`client_id`),
  ADD KEY `fk_project_company_id` (`company_id`),
  ADD KEY `fk_project_inquiry_id` (`inquiry_id`),
  ADD KEY `fk_project_main_project_id` (`main_project_id`),
  ADD KEY `fk_project_sub_project_id` (`sub_project_id`);

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
-- Indexes for table `the_references`
--
ALTER TABLE `the_references`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activities`
--
ALTER TABLE `activities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `licenses`
--
ALTER TABLE `licenses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notes`
--
ALTER TABLE `notes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `statuses`
--
ALTER TABLE `statuses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `administrators_companies_banks`
--
ALTER TABLE `administrators_companies_banks`
  ADD CONSTRAINT `fk_administrators_companies_banks_administrator_company_id` FOREIGN KEY (`administrator_company_id`) REFERENCES `administrators_companies` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `clients`
--
ALTER TABLE `clients`
  ADD CONSTRAINT `fk_client_reference_id` FOREIGN KEY (`reference_id`) REFERENCES `the_references` (`id`);

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
  ADD CONSTRAINT `fk_project_main_project_id` FOREIGN KEY (`main_project_id`) REFERENCES `main_projects` (`id`),
  ADD CONSTRAINT `fk_project_sub_project_id` FOREIGN KEY (`sub_project_id`) REFERENCES `sub_projects` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
