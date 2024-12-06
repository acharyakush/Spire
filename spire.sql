-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 06, 2024 at 06:34 PM
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

CREATE DEFINER=`spire`@`%` PROCEDURE `generate_dynamic_reference_id` ()   BEGIN
    DECLARE current_max_id VARCHAR(8) DEFAULT NULL;
    DECLARE new_number INT DEFAULT 1;
    DECLARE sql_query VARCHAR(255);
    DECLARE lock_acquired BOOLEAN DEFAULT FALSE;
    DECLARE id_exists INT DEFAULT 0;
    DECLARE max_attempts INT DEFAULT 10;
    DECLARE attempt INT DEFAULT 0;
    DECLARE full_prefix VARCHAR(8) DEFAULT 'RF';  -- Fixed prefix 'RF'
    DECLARE table_name VARCHAR(20) DEFAULT 'references';  -- Fixed table name 'references'

    -- Start Debugging
    SELECT 'STARTING PROCEDURE' AS DebugMessage;

    -- Retry loop to acquire lock
    lock_retry: REPEAT
        SELECT 'Attempting to acquire lock' AS DebugMessage;  -- Debug message

        -- Increase timeout to 30 seconds
        SELECT GET_LOCK('reference_id_generation_lock', 30) INTO lock_acquired;

        IF lock_acquired THEN
            SELECT 'Lock acquired' AS DebugMessage;  -- Debug message

            -- Lock acquired, proceed with ID generation
            SET full_prefix = CONCAT(full_prefix, '%');  -- 'RF%' pattern

            -- Select the current max reference ID (replace reference_id with id if necessary)
            SET sql_query = CONCAT('SELECT MAX(id) INTO @current_max_id FROM ', '`', table_name, '` WHERE id LIKE ?');
            SELECT sql_query AS DebugMessage;  -- Debug message to show the query

            PREPARE stmt FROM sql_query;
            EXECUTE stmt USING full_prefix;
            DEALLOCATE PREPARE stmt;

            SELECT @current_max_id INTO current_max_id;
            SELECT current_max_id AS DebugMessage;  -- Debug message to show current_max_id

            -- Extract numeric part and generate new reference ID
            IF current_max_id IS NOT NULL THEN
                SET new_number = CAST(SUBSTRING(current_max_id, LENGTH(full_prefix) + 1) AS UNSIGNED) + 1;
            END IF;

            SET @new_reference_id = CONCAT(full_prefix, LPAD(new_number, 6, '0'));  -- Set session variable
            SELECT @new_reference_id AS DebugMessage;  -- Debug message to show the new reference ID

            -- Check if new reference ID already exists (replace reference_id with id if necessary)
            SET sql_query = CONCAT('SELECT COUNT(*) INTO @id_exists FROM ', '`', table_name, '` WHERE id = ?');
            PREPARE stmt FROM sql_query;
            EXECUTE stmt USING @new_reference_id;
            DEALLOCATE PREPARE stmt;

            SELECT @id_exists INTO id_exists;
            SELECT id_exists AS DebugMessage;  -- Debug message to show id_exists count

            -- Regenerate if reference ID exists
            WHILE id_exists > 0 DO
                SET new_number = new_number + 1;
                SET @new_reference_id = CONCAT(full_prefix, LPAD(new_number, 6, '0'));

                PREPARE stmt FROM sql_query;
                EXECUTE stmt USING @new_reference_id;
                DEALLOCATE PREPARE stmt;

                SELECT @id_exists INTO id_exists;
                SELECT id_exists AS DebugMessage;  -- Debug message to check if it goes into the loop
            END WHILE;

            -- Release the lock
            DO RELEASE_LOCK('reference_id_generation_lock');
            LEAVE lock_retry;

        ELSE
            -- Retry mechanism
            SET attempt = attempt + 1;
            IF attempt >= max_attempts THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Could not acquire lock for reference ID generation after max retries';
                LEAVE lock_retry;
            END IF;
        END IF;
    UNTIL lock_acquired END REPEAT;

    SELECT 'Procedure Finished' AS DebugMessage;  -- Debug message to mark end of procedure
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
  `session_id` varchar(255) NOT NULL,
  `details` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activities`
--

INSERT INTO `activities` (`id`, `user_id`, `activity`, `ip_address`, `user_agent`, `created_at`, `session_id`, `details`) VALUES
(1, 'A3', 'Logged in.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-05 14:46:35', 'HwBUclF+UGRxXwhIaVweRVdYQWB9WTcVOyMNIEwVezsMEg0/bVEKIzQoMDYkIkcqcAZFWw==', NULL),
(2, 'A3', 'Logged in.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-05 14:46:58', 'HwBUclF+Vm5xXwhIaVweRVdYQWB9WTcVOyMNIEwVezsMEg0/bVEKIzQoMDYkIkcqcAZFWw==', NULL),
(3, 'A3', 'Logged in.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-05 14:51:24', 'HwBUcVZ+UWRxXwhIaVweRVdYQWB9WTcVOyMNIEwVezsMEg0/bVEKIzQoMDYkIkcqcAZFWw==', NULL),
(4, 'A3', 'Logged in.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-06 14:15:16', 'Hw9Ud1J+UmVxXwhIaV8eRVdYQWB9WTcVOyMNIEwVezsMEg0/bVEKIzQoMDYkIkcqcAZFWw==', NULL),
(5, 'A3', 'Logged in.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-06 17:14:12', 'HghUd1N+U2NxXwhIaV8eRVdYQWB9WTcVOyMNIEwVezsMEg0/bVEKIzQoMDYkIkcqcAZFWw==', NULL),
(6, 'A3', 'Logged in.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-06 17:16:38', 'HghUd1F+UGBxXwhIaV8eRVdYQWB9WTcVOyMNIEwVezsMEg0/bVEKIzQoMDYkIkcqcAZFWw==', NULL);

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
  `permissions` mediumtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `administrators`
--

INSERT INTO `administrators` (`id`, `first_name`, `last_name`, `full_name`, `username`, `email_address`, `password`, `address`, `birth_date`, `gender`, `phone_number`, `designation`, `permissions`) VALUES
('A1', 'Drashti', 'Sharma', 'Drashti Sharma', 'DrashtiSharma', 'drashti@admins.spire.com', '0bccca92fe490584540ab07538c09229:ec533eb2bd2592ee7e5682d288be16d63cab8f799dbe99cd30fea4a421583f5b2ef26d5a3b86b602e7b64f24a01767e654b46ca18e3437adf82d579d5cdfc07e', '', '1993-10-05', 'Female', '9998733006', 'Founder, CEO', '-1'),
('A2', 'Abhishek', 'Gor', 'Abhishek Gor', 'AbhishekGor', 'abhishek@admins.spire.com', '09100481e99086ad3caf3a7713c3b49e:653f4d886e519f11316658e8361cd3d39c257f320a2cf1a3ecd7c5b92f2b7efac0f313493f2ef2a8a16eaa112f2f81f4bf950c848093e81b8dc869af0d25fb63', '', '1993-07-13', 'Male', '8000721554', 'Founder, CEO', '-1'),
('A3', 'Kush', 'Acharya', 'Kush Acharya', 'KushAcharya', 'kush@admins.spire.com', '733c1afcb5748d3b316ee48ca440759b:5f509fc5bea6a1a5c0cee090ef8c1e22572fb300f63bce30de8fa39c87bdfa54bd556a89227fc4f87d5d3c14f5c5b563801d88796661333b8f84e32dbf2480a9', 'AFF8, Aakansha Apartments, Jaymala Cross Roads, Isanpur, Ahmedabad, GJ - 380015', '1993-04-26', 'Male', '8780577704', 'Chief Technical Officer', '-1');

-- --------------------------------------------------------

--
-- Table structure for table `clients`
--

CREATE TABLE `clients` (
  `id` varchar(8) NOT NULL,
  `name` varchar(200) NOT NULL,
  `affiliate_ids` varchar(2000) DEFAULT NULL,
  `company_id` varchar(8) DEFAULT NULL,
  `reference_id` varchar(8) DEFAULT NULL,
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
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` varchar(8) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `skills` text DEFAULT NULL,
  `certifications` text DEFAULT NULL,
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
  `contact_number` bigint(20) NOT NULL,
  `entry_date` datetime DEFAULT current_timestamp(),
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
  `entered_on` datetime NOT NULL DEFAULT current_timestamp(),
  `source` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `module` varchar(50) NOT NULL,
  `type` enum('Base','Derived') DEFAULT NULL,
  `sidebar_visibility` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `module`, `type`, `sidebar_visibility`) VALUES
(1, 'Admins', 'Admins', 'Base', 1),
(2, 'New Admin Company', 'Admins', 'Derived', 1),
(3, 'Edit Admin Company', 'Admins', 'Derived', 0),
(4, 'Affiliates', 'Affiliates', 'Base', 1),
(5, 'Edit Affiliate', 'Affiliates', 'Derived', 0),
(6, 'Delete Affiliate', 'Affiliates', 'Derived', 0),
(7, 'Cash Flow', 'Cash Flow', 'Base', 1),
(8, 'Edit Cash Flow', 'Cash Flow', 'Derived', 0),
(9, 'Delete Cash Flow', 'Cash Flow', 'Derived', 0),
(10, 'Clients', 'Clients', 'Base', 1),
(11, 'Edit Client', 'Clients', 'Derived', 0),
(12, 'Delete Client', 'Clients', 'Derived', 0),
(13, 'Companies', 'Companies', 'Base', 1),
(14, 'Edit Company', 'Companies', 'Derived', 0),
(15, 'Delete Company', 'Companies', 'Derived', 0),
(16, 'Dashboard', 'Dashboard', 'Base', 1),
(17, 'Employees', 'Employees', 'Base', 1),
(18, 'Edit Employee', 'Employees', 'Derived', 0),
(19, 'Delete Employee ', 'Employees', 'Derived', 0),
(20, 'Inquiries', 'Inquiry', 'Base', 1),
(21, 'New Inquiry', 'Inquiry', 'Derived', 1),
(22, 'Edit Inquiry', 'Inquiry', 'Derived', 0),
(23, 'Delete Inquiry', 'Inquiry', 'Derived', 0),
(24, 'Convert Inquiry To Project', 'Inquiry', 'Derived', 0),
(25, 'Invoices', 'Invoices', 'Base', 1),
(26, 'Generate Invoice', 'Invoices', 'Derived', 1),
(27, 'Delete Invoice', 'Invoices', 'Derived', 0),
(28, 'Projects', 'Projects', 'Base', 1),
(29, 'Edit Project', 'Projects', 'Derived', 0),
(30, 'Delete Project', 'Projects', 'Derived', 0),
(31, 'Payment Received', 'Projects', 'Derived', 0),
(32, 'References', 'References', 'Base', 1),
(33, 'Edit Reference', 'References', 'Derived', 0),
(34, 'Delete Reference', 'References', 'Derived', 0),
(35, 'Tasks', 'Tasks', 'Base', 1),
(36, 'New Task', 'Tasks', 'Derived', 1),
(37, 'Update Task', 'Tasks', 'Derived', 0),
(38, 'Disable Task', 'Tasks', 'Derived', 0),
(39, 'Mark Task Completed', 'Tasks', 'Derived', 0),
(40, 'Delete Task From Reimbursement Voucher', 'Tasks', 'Derived', 0);

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` varchar(8) NOT NULL,
  `client_id` varchar(8) NOT NULL,
  `company_id` varchar(8) NOT NULL,
  `affiliate_ids` varchar(2000) NOT NULL,
  `inquiry_id` varchar(8) NOT NULL,
  `government_id` varchar(100) DEFAULT NULL,
  `main_project_id` varchar(8) NOT NULL,
  `sub_project_id` varchar(8) NOT NULL,
  `quote` decimal(10,2) NOT NULL CHECK (`quote` >= 0),
  `due_on` datetime NOT NULL DEFAULT current_timestamp(),
  `total_affiliate_fees` decimal(10,2) NOT NULL CHECK (`total_affiliate_fees` >= 0),
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
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` varchar(8) DEFAULT NULL
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
  `name` varchar(100) NOT NULL,
  `client_id` varchar(8) NOT NULL,
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
-- Indexes for dumped tables
--

--
-- Indexes for table `activities`
--
ALTER TABLE `activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `session_id` (`session_id`);

--
-- Indexes for table `administrators`
--
ALTER TABLE `administrators`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email_address` (`email_address`);

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
  ADD PRIMARY KEY (`id`);

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
  ADD PRIMARY KEY (`id`);

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
  ADD PRIMARY KEY (`id`),
  ADD KEY `client_id` (`client_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activities`
--
ALTER TABLE `activities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
-- Constraints for table `licenses`
--
ALTER TABLE `licenses`
  ADD CONSTRAINT `fk_license_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`);

--
-- Constraints for table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `fk_project_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  ADD CONSTRAINT `fk_project_company_id` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  ADD CONSTRAINT `fk_project_inquiry_id` FOREIGN KEY (`inquiry_id`) REFERENCES `inquiries` (`id`),
  ADD CONSTRAINT `fk_project_main_project_id` FOREIGN KEY (`main_project_id`) REFERENCES `main_projects` (`id`),
  ADD CONSTRAINT `fk_project_sub_project_id` FOREIGN KEY (`sub_project_id`) REFERENCES `sub_projects` (`id`);

--
-- Constraints for table `the_references`
--
ALTER TABLE `the_references`
  ADD CONSTRAINT `fk_reference_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
