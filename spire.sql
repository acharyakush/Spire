-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 20, 2025 at 08:20 PM
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
(1, 'Inquiries', 'Added <b>IQ000001</b>.', '', 'Localhost', 'A3', '2024-12-15 15:28:07'),
(2, 'General', 'Logged out.', '', 'Localhost', 'A3', '2024-12-15 23:32:18'),
(3, 'General', 'Logged in.', '', 'Localhost', 'A3', '2024-12-16 19:05:52'),
(4, 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Hold</b> to <b>Open</b>.', '', 'Localhost', 'A3', '2024-12-16 20:01:07'),
(5, 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Open</b> to Closed.', '', 'Localhost', 'A3', '2024-12-16 20:01:12'),
(6, 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Closed</b> to <b>Hold</b>.', '', 'Localhost', 'A3', '2024-12-16 20:01:18'),
(7, 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Hold</b> to <b>Open</b>.', '', 'Localhost', 'A3', '2024-12-16 20:01:22'),
(8, 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Open</b> to Closed.', '', 'Localhost', 'A3', '2024-12-16 20:01:26'),
(9, 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Closed</b> to <b>Open</b>.', '', 'Localhost', 'A3', '2024-12-16 20:02:10'),
(10, 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Open</b> to <b>Closed</b>.', '', 'Localhost', 'A3', '2024-12-16 20:31:16'),
(11, 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Closed</b> to <b>Open</b>.', '', 'Localhost', 'A3', '2024-12-16 20:34:05'),
(12, 'Inquiries', 'Closed <b>IQ000001</b> due to <b>Hello..</b>', '', 'Localhost', 'A3', '2024-12-16 20:38:33'),
(13, 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Closed</b> to <b>Open</b>.', '', 'Localhost', 'A3', '2024-12-16 20:39:06'),
(14, 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Open</b> to <b>Hold</b>.', '', 'Localhost', 'A3', '2024-12-16 20:39:10'),
(15, 'Inquiries', 'Closed <b>IQ000001</b> due to <b>Bye..</b>', '', 'Localhost', 'A3', '2024-12-16 20:39:18'),
(16, 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Closed</b> to <b>Open</b>.', '', 'Localhost', 'A3', '2024-12-16 20:40:04'),
(17, 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Open</b> to <b>Hold</b>.', '', 'Localhost', 'A3', '2024-12-16 20:40:38'),
(18, 'Inquiries', 'Closed <b>IQ000001</b> due to <b>Yes</b>.', '', 'Localhost', 'A3', '2024-12-16 20:40:49'),
(19, 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Closed</b> to <b>Open</b>.', '', 'Localhost', 'A3', '2024-12-16 20:40:57'),
(20, 'Notes', 'Added in <b>IQ000001</b>.', '', 'Localhost', 'A3', '2024-12-16 20:52:47'),
(21, 'Notes', 'Added in <b>IQ000001</b>.', '', 'Localhost', 'A3', '2024-12-16 20:54:45'),
(22, 'Inquiries', 'Edited <b>IQ000001</b>.', '', 'Localhost', 'A3', '2024-12-16 23:26:19'),
(23, 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Open</b> to <b>Hold</b>.', '', 'Localhost', 'A3', '2024-12-17 21:35:57'),
(24, 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Hold</b> to <b>Open</b>.', '', 'Localhost', 'A3', '2024-12-17 21:36:01'),
(59, 'General', 'Logged in.', '', 'Localhost', '', '2024-12-22 21:38:29'),
(60, 'Projects', 'Updated quote of <b>PJ000001</b> from <b>2500.00</b> to <b>5500</b>.', '', 'Localhost', 'A3', '2024-12-22 21:57:22'),
(61, 'Projects', 'Added government id <b>PJ1/22/12/2024</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2024-12-22 22:21:31'),
(62, 'Projects', 'Added government id <b>PJ1/22-12-2024</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2024-12-22 22:28:31'),
(63, 'General', 'Logged out.', '', 'Localhost', 'A3', '2024-12-22 23:12:16'),
(64, 'General', 'Logged in.', '', 'Localhost', '', '2024-12-22 23:15:34'),
(65, 'Projects', 'Updated quote of <b>PJ000001</b> from <b>5500.00</b> to <b>5750</b>.', '', 'Localhost', 'A3', '2024-12-22 23:24:58'),
(66, 'Projects', 'Added government id <b>PJ1/22/12/2024</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2024-12-22 23:27:22'),
(67, 'General', 'Logged out.', '', 'Localhost', 'A3', '2024-12-23 00:15:03'),
(68, 'General', 'Logged in.', '', 'Localhost', '', '2024-12-23 20:02:22'),
(69, 'Tasks', 'Added <b>TK000001</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2024-12-23 22:48:22'),
(70, 'General', 'Logged out.', '', 'Localhost', 'A3', '2024-12-23 23:35:53'),
(71, 'General', 'Logged in.', '', 'Localhost', 'A3', '2024-12-23 23:35:56'),
(72, 'General', 'Logged out.', '', 'Localhost', 'A3', '2024-12-23 23:39:12'),
(73, 'General', 'Logged in.', '', 'Localhost', '', '2024-12-24 19:43:08'),
(74, 'Tasks', 'Updated <b>TK000001</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2024-12-24 19:53:05'),
(75, 'Tasks', 'Updated <b>TK000001</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2024-12-24 20:03:44'),
(76, 'Tasks', 'Updated <b>TK000001</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2024-12-24 20:04:04'),
(77, 'Tasks', 'Disabled <b>TK000001</b> due to <b>Nice Try.</b>', '', 'Localhost', 'A3', '2024-12-24 21:37:58'),
(78, 'Tasks', 'Enabled <b>TK000001</b> due to <b>Blue</b>', '', 'Localhost', 'A3', '2024-12-24 22:23:35'),
(79, 'Tasks', 'Closed <b>TK000001</b> due to <b>Lol</b>', '', 'Localhost', 'A3', '2024-12-24 22:24:17'),
(80, 'General', 'Logged out.', '', 'Localhost', 'A3', '2024-12-24 22:40:43'),
(81, 'General', 'Logged in.', '', 'Localhost', 'A3', '2024-12-24 22:40:45'),
(82, 'Tasks', 'Disabled <b>TK000001</b> due to <b>I dont like this task anymore.</b>', '', 'Localhost', 'A3', '2024-12-24 22:43:11'),
(83, 'Tasks', 'Updated <b>TK000001</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2024-12-24 22:55:27'),
(84, 'Tasks', 'Enabled <b>TK000001</b> due to <b>NA</b>', '', 'Localhost', 'A3', '2024-12-24 23:12:53'),
(85, 'Tasks', 'Closed <b>TK000001</b> due to <b>Yes</b>', '', 'Localhost', 'A3', '2024-12-24 23:13:08'),
(86, 'General', 'Logged out.', '', 'Localhost', 'A3', '2024-12-24 23:59:57'),
(87, 'General', 'Logged in.', '', 'Localhost', '', '2024-12-25 16:01:46'),
(88, 'General', 'Logged in.', '', '::ffff:192.168.1.15', '', '2024-12-25 18:05:49'),
(89, 'General', 'Logged out.', '', 'Localhost', 'A3', '2024-12-25 19:23:33'),
(90, 'General', 'Logged in.', '', 'Localhost', '', '2024-12-25 19:50:06'),
(91, 'General', 'Logged out.', '', 'Localhost', 'A3', '2024-12-25 20:38:18'),
(92, 'General', 'Logged in.', '', 'Localhost', '', '2024-12-26 18:51:18'),
(93, 'Tasks', 'Added <b>TK000002</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2024-12-26 19:27:25'),
(94, 'Tasks', 'Added <b>TK000001</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2024-12-26 20:13:12'),
(95, 'General', 'Logged out.', '', 'Localhost', 'A3', '2024-12-27 08:26:40'),
(96, 'General', 'Logged in.', '', 'Localhost', '', '2024-12-27 19:34:53'),
(97, 'Tasks', 'Updated <b>Old Particular: Ledger of Loan</b> => <b>Ledger of Loans</b> of <b>TK000001</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2024-12-27 22:18:10'),
(98, 'Tasks', 'Updated <b>Old Expense: 5000.00</b> => <b>5500.00</b> of <b>TK000001</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2024-12-27 22:23:52'),
(99, 'Tasks', 'Updated <b>Old Expense: 5000.00</b> => <b>4500.00</b> of <b>TK000001</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2024-12-27 22:26:20'),
(101, 'Tasks', 'Updated Task_id from <b>TK000001</b> to <b>undefined</b>, Project_id from <b>PJ000001</b> to <b>undefined</b>, Particular from <b>Ledger of Loans</b> to <b>Ledger of Loans.</b>, Remark from <b>Check CIBIL score for loan eligibility</b> to <b>Check CIBIL score for loan eligibility.</b>, Created_by from <b>A3</b> to <b>undefined</b>, Created_at from <b>2024-12-27T14:20:22.000Z</b> to <b>undefined</b>, Expense from <b>4500.00</b> to <b>5500.00</b>, Rowid from <b>2</b> to <b>undefined</b>, Task from <b>Task #1</b> to <b>Task #2</b> of <b>TK000001</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2024-12-27 22:33:52'),
(102, 'Tasks', 'Updated Due Date from <b>2024-12-25T18:30:00.000Z</b> to <b>Wed Jan 01 2025 00:00:00 GMT+0530 (India Standard Time)</b>, Expense from <b>4500.00</b> to <b>5000.00</b>, Particular from <b>Prepare form for submission</b> to <b>Prepare form for submissions</b>, Task from <b>Task #1</b> to <b>Task #2</b> of <b>TK000001</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2024-12-27 22:39:43'),
(103, 'General', 'Logged out.', '', 'Localhost', 'A3', '2024-12-27 23:24:20'),
(104, 'General', 'Logged in.', '', 'Localhost', '', '2024-12-28 21:53:41'),
(105, 'Tasks', 'Updated Remark from <b>Get them from storage server</b> to <b>Get them from storage servers.</b> of <b>TK000001</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2024-12-29 22:57:34'),
(106, 'General', 'Logged out.', '', 'Localhost', 'A3', '2024-12-29 23:18:52'),
(107, 'General', 'Logged in.', '', 'Localhost', '', '2024-12-29 23:19:55'),
(108, 'General', 'Logged out.', '', 'Localhost', 'A3', '2024-12-29 23:44:05'),
(109, 'General', 'Logged in.', '', 'Localhost', '', '2024-12-31 15:33:54'),
(110, 'Inquiries', 'Update status of <b>IQ000002</b> to <b>Open</b> from <b>Hold</b>.', '', 'Localhost', 'A3', '2024-12-31 16:44:57'),
(111, 'General', 'Logged out.', '', 'Localhost', 'A3', '2024-12-31 20:41:17'),
(112, 'General', 'Logged in.', '', 'Localhost', '', '2025-01-01 19:37:06'),
(113, 'General', 'Logged out.', '', 'Localhost', 'A3', '2025-01-01 21:45:21'),
(114, 'General', 'Logged in.', '', 'Localhost', '', '2025-01-01 21:51:35'),
(115, 'Tasks', 'Closed <b>TK000001</b> due to <b>I no longer require this.</b>', '', 'Localhost', 'A3', '2025-01-01 22:42:41'),
(116, 'Tasks', 'Edited Due Date from <b>2024-12-31T18:30:00.000Z</b> to <b>Tue Jan 21 2025 00:00:00 GMT+0530 (India Standard Time)</b>, Expense from <b>5000.00</b> to <b>5100.00</b>, Task from <b>Task #2</b> to <b>Task #21</b> of <b>TK000001</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2025-01-01 22:59:02'),
(117, 'Tasks', 'Disabled <b>TK000001</b> due to <b>I am done with this task</b>', '', 'Localhost', 'A3', '2025-01-01 23:00:04'),
(118, 'Tasks', 'Enabled <b>TK000001</b> due to <b>I am not done with it.</b>', '', 'Localhost', 'A3', '2025-01-01 23:04:02'),
(119, 'Tasks', 'Closed <b>TK000001</b> due to <b>I am done.</b>', '', 'Localhost', 'A3', '2025-01-01 23:04:25'),
(120, 'Tasks', 'Edited Particular from <b>Prepare documents for load</b> to <b>Prepare documents for loads.</b> of <b>3</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2025-01-01 23:32:39'),
(121, 'Tasks', 'Edited Remark from <b>Get them from storage servers.</b> to <b>Get them from storage servers</b> of <b>3</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2025-01-01 23:32:50'),
(122, 'Tasks', 'Edited Remark from <b>Make sure the internet connectivity is normal</b> to <b>Make sure the internet connectivity is normal.</b> of <b>TK000001</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2025-01-01 23:33:42'),
(123, 'Tasks', 'Added a particular and remark in <b>TK000001</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2025-01-01 23:45:36'),
(124, 'Tasks', 'Edited Task from <b>Task #21</b> to <b>Task #1</b> of <b>TK000001</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2025-01-01 23:53:30'),
(125, 'General', 'Logged out.', '', 'Localhost', 'A3', '2025-01-02 00:46:01'),
(126, 'General', 'Logged in.', '', 'Localhost', '', '2025-01-02 20:02:33'),
(127, 'Tasks', 'Added <b>TK000002</b> in <b>PJ000001</b>', '', 'Localhost', 'A3', '2025-01-02 20:19:22'),
(128, 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2025-01-02 20:27:04'),
(129, 'General', 'Logged out.', '', 'Localhost', 'A3', '2025-01-03 00:00:04'),
(130, 'General', 'Logged in.', '', 'Localhost', '', '2025-01-03 20:32:06'),
(131, 'General', 'Logged out.', '', 'Localhost', 'A3', '2025-01-04 00:22:27'),
(132, 'General', 'Logged in.', '', 'Localhost', '', '2025-01-04 18:35:41'),
(133, 'General', 'Logged out.', '', 'Localhost', 'A3', '2025-01-04 19:35:19'),
(134, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-01-04 20:25:19'),
(135, 'Single Client', 'Edited  of <b>CP000001</b> of <b>undefined</b>.', '', 'Localhost', 'A3', '2025-01-04 22:54:41'),
(136, 'Single Client', 'Edited Contact Number from <b></b> to <b>07925462408</b> of <b>CP000001</b> of <b>CN000001</b>.', '', 'Localhost', 'A3', '2025-01-04 23:03:53'),
(137, 'Single Client', 'Edited Pan from <b>blank</b> to <b>BBXPA8126Q</b> of <b>CP000001</b> of <b>CN000001</b>.', '', 'Localhost', 'A3', '2025-01-04 23:05:22'),
(138, 'General', 'Logged out.', '', 'Localhost', 'A3', '2025-01-05 00:21:24'),
(139, 'General', 'Logged in.', '', 'Localhost', '', '2025-01-05 22:25:58'),
(140, 'General', 'Logged out.', '', 'Localhost', 'A3', '2025-01-05 22:31:50'),
(141, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-01-07 18:49:28'),
(142, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-01-07 20:07:02'),
(143, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-01-07 23:17:28'),
(144, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-01-07 23:19:06'),
(145, 'General', 'Logged out.', '', 'Localhost', 'A3', '2025-01-07 23:19:34'),
(146, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-01-08 20:11:14'),
(147, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-01-08 21:30:38'),
(148, 'General', 'Logged out.', '', 'Localhost', 'A3', '2025-01-08 21:36:17'),
(149, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-01-09 19:10:30'),
(150, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-01-09 19:45:06'),
(151, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-01-09 20:12:30'),
(152, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-01-09 20:39:08'),
(153, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-01-09 21:14:09'),
(154, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-01-09 23:48:47'),
(155, 'General', 'Logged out.', '', 'Localhost', 'A3', '2025-01-10 00:00:13'),
(156, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-01-10 18:25:35'),
(157, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-01-10 18:26:56'),
(158, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-01-10 18:30:56'),
(159, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-01-10 18:34:12'),
(160, 'General', 'Logged out.', '', 'Localhost', '', '2025-01-10 20:18:57'),
(161, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-01-11 18:50:53'),
(162, 'Inquiries', 'Added <b>IQ000004</b>.', '', 'Localhost', 'A3', '2025-01-11 19:32:47'),
(163, 'Inquiries', 'Added <b>IQ000005</b>.', '', 'Localhost', 'A3', '2025-01-11 19:45:35'),
(164, 'Inquiries', 'Added <b>IQ000006</b>.', '', 'Localhost', 'A3', '2025-01-11 19:54:39'),
(165, 'Inquiries', 'Closed <b>IQ000004</b> due to <b>Yes. I want to close this inquiry.</b>.', '', 'Localhost', 'A3', '2025-01-11 20:10:19'),
(166, 'Inquiries', 'Update status of <b>IQ000004</b> to <b>Hold</b> from <b>Closed</b>.', '', 'Localhost', 'A3', '2025-01-11 20:10:42'),
(167, 'Inquiries', 'Update status of <b>IQ000004</b> to <b>Open</b> from <b>Hold</b>.', '', 'Localhost', 'A3', '2025-01-11 20:12:54'),
(168, 'Inquiries', 'Update status of <b>IQ000004</b> to <b>Hold</b> from <b>Open</b>.', '', 'Localhost', 'A3', '2025-01-11 20:12:57'),
(169, 'Inquiries', 'Update status of <b>IQ000004</b> to <b>Open</b> from <b>Hold</b>.', '', 'Localhost', 'A3', '2025-01-11 20:15:05'),
(170, 'Inquiries', 'Update status of <b>IQ000004</b> to <b>Hold</b> from <b>Open</b>.', '', 'Localhost', 'A3', '2025-01-11 20:15:12'),
(171, 'Inquiries', 'Closed <b>IQ000006</b> due to <b>I am done with this work.</b>.', '', 'Localhost', 'A3', '2025-01-11 20:15:28'),
(172, 'Inquiries', 'Edited <b>IQ000002</b>.', '', 'Localhost', '', '2025-01-11 21:55:22'),
(173, 'Inquiries', 'Edited <b>IQ000002</b>.', '', 'Localhost', '', '2025-01-11 21:55:31'),
(174, 'Inquiries', 'Edited <b>IQ000002</b>.', '', 'Localhost', '', '2025-01-11 21:56:08'),
(175, 'Inquiries', 'Edited <b>IQ000002</b>.', '', 'Localhost', '', '2025-01-11 21:56:23'),
(176, 'Inquiries', 'Edited <b>IQ000002</b>.', '', 'Localhost', '', '2025-01-11 21:56:34'),
(177, 'Inquiries', 'Edited <b>IQ000002</b>.', '', 'Localhost', '', '2025-01-11 21:57:34'),
(178, 'Inquiries', 'Edited <b>IQ000002</b>.', '', 'Localhost', '', '2025-01-11 22:13:09'),
(179, 'Inquiries', 'Edited <b>IQ000002</b>.', '', 'Localhost', 'A3', '2025-01-11 22:16:53'),
(180, 'Inquiries', 'Edited <b>IQ000002</b>.', '', 'Localhost', 'A3', '2025-01-11 22:17:12'),
(181, 'Inquiries', 'Edited <b>IQ000002</b>.', '', 'Localhost', 'A3', '2025-01-11 22:20:18'),
(182, 'Inquiries', 'Edited <b>IQ000004</b>.', '', 'Localhost', 'A3', '2025-01-11 22:20:42'),
(183, 'Inquiries', 'Edited <b>IQ000003</b>.', '', 'Localhost', 'A3', '2025-01-11 22:21:26'),
(184, 'Inquiries', 'Update status of <b>IQ000003</b> to <b>Hold</b> from <b>Open</b>.', '', 'Localhost', 'A3', '2025-01-11 22:27:30'),
(185, 'Notes', 'Added in <b>IQ000001</b>.', '', 'Localhost', 'A3', '2025-01-11 23:45:49'),
(186, 'Notes', 'Added in <b>IQ000001</b>.', '', 'Localhost', 'A3', '2025-01-11 23:46:31'),
(187, 'Notes', 'Added in <b>IQ000004</b>.', '', 'Localhost', 'A3', '2025-01-11 23:46:51'),
(188, 'General', 'Logged out.', '', 'Localhost', 'A3', '2025-01-11 23:49:52'),
(189, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-01-12 10:53:47'),
(190, 'Inquiries', 'Added <b>IQ000007</b>.', '', 'Localhost', 'A3', '2025-01-12 11:18:02'),
(191, 'Inquiries', 'Added <b>PJ000002</b>.', '', 'Localhost', 'A3', '2025-01-12 11:41:52'),
(192, 'Inquiries', 'Added <b>IQ000008</b>.', '', 'Localhost', 'A3', '2025-01-12 14:36:15'),
(193, 'General', 'Logged out.', '', 'Localhost', 'A3', '2025-01-12 14:43:58'),
(194, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-01-13 20:59:36'),
(195, 'Projects', '<b>PJ000002</b> kept on <b>Hold</b> from <b>Active</b>', '', 'Localhost', 'A3', '2025-01-13 21:05:47'),
(196, 'Projects', '<b>PJ000002</b> kept on <b>Hold</b> from <b>Active</b>', '', 'Localhost', 'A3', '2025-01-13 21:09:02'),
(197, 'Projects', '<b>PJ000002</b> kept on <b>Hold</b> from <b>Active</b>', '', 'Localhost', 'A3', '2025-01-13 21:12:21'),
(198, 'General', 'Logged out.', '', 'Localhost', 'A3', '2025-01-13 22:51:50'),
(199, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-01-13 22:55:00'),
(200, 'General', 'Logged out.', '', 'Localhost', 'A3', '2025-01-14 00:11:29'),
(201, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-01-14 10:49:01'),
(202, 'General', 'Logged out.', '', 'Localhost', 'A3', '2025-01-14 10:53:41'),
(203, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-01-14 11:03:16'),
(204, 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2025-01-14 13:44:25'),
(205, 'Tasks', 'Added <b>TK000003</b> in <b>PJ000001</b>', '', 'Localhost', 'A3', '2025-01-14 13:44:55'),
(206, 'Tasks', 'Edited Particular from <b>Particular #2</b> to <b>Particular #21</b>, Remark from <b>Remark #2</b> to <b>Remark #23</b> of <b>TK000002</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2025-01-14 14:19:07'),
(207, 'General', 'Logged out.', '', 'Localhost', 'A3', '2025-01-14 22:03:44'),
(208, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-01-17 00:13:44'),
(209, 'General', 'Logged out.', '', 'Localhost', 'A3', '2025-01-17 00:25:06'),
(210, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-01-17 19:27:38'),
(211, 'New Invoice', 'Generated invoice <b>SA/2025-26/00001</b> for <b>PJ000001</b>', '', 'Localhost', 'A3', '2025-01-17 22:25:50'),
(212, 'New Invoice', 'Generated invoice <b>BF/2025-26/00002</b> for <b>PJ000002</b>', '', 'Localhost', 'A3', '2025-01-17 22:26:51'),
(213, 'Cash Flow', 'Added invoice cash flow entry.', '', 'Localhost', 'A3', '2025-01-17 23:56:01'),
(214, 'Affiliates', 'Added affiliate(s).', '', 'Localhost', 'A3', '2025-01-18 00:24:44'),
(215, 'General', 'Logged out.', '', 'Localhost', 'A3', '2025-01-18 00:25:09'),
(216, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-01-18 01:36:22'),
(217, 'General', 'Logged out.', '', 'Localhost', 'A3', '2025-01-18 01:38:54'),
(218, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-01-25 16:06:27'),
(219, 'Tasks', 'Added <b>TK000004</b> in <b>PJ000001</b>', '', 'Localhost', 'A3', '2025-01-25 16:07:01'),
(220, 'Tasks', 'Added <b>TK000005</b> in <b>PJ000002</b>', '', 'Localhost', 'A3', '2025-01-25 16:07:27'),
(221, 'Tasks', 'Added <b>TK000006</b> in <b>PJ000002</b>', '', 'Localhost', 'A3', '2025-01-25 16:22:41'),
(222, 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000002</b>.', '', 'Localhost', 'A3', '2025-01-25 16:29:58'),
(223, 'General', 'Logged out.', '', 'Localhost', 'A3', '2025-01-25 16:32:53'),
(224, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-01-25 16:48:16'),
(225, 'General', 'Logged out.', '', 'Localhost', 'A3', '2025-01-25 16:49:50'),
(226, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-01-25 17:00:09'),
(227, 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000002</b>.', '', 'Localhost', 'A3', '2025-01-25 17:00:28'),
(228, 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000002</b>.', '', 'Localhost', 'A3', '2025-01-25 17:27:00'),
(229, 'Tasks', 'Deleted particular <b>Hello</b> with remark <b>Bello</b> of <b>11</b> in <b>PJ000002</b>', '', 'Localhost', 'A3', '2025-01-25 17:27:37'),
(230, 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000002</b>.', '', 'Localhost', 'A3', '2025-01-25 17:28:09'),
(231, 'Tasks', 'Deleted particular <b>Hello</b> with remark <b>Trello</b> of <b>TK000005</b> in <b>PJ000002</b>', '', 'Localhost', 'A3', '2025-01-25 17:29:04'),
(232, 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000002</b>.', '', 'Localhost', 'A3', '2025-01-25 17:29:19'),
(233, 'Tasks', 'Deleted particular <b>Bello</b> with remark <b>Hello</b> of <b>TK000005</b> in <b>PJ000002</b>', '', 'Localhost', 'A3', '2025-01-25 17:30:09'),
(234, 'Tasks', 'Disabled <b>TK000005</b> due to <b>None.</b>', '', 'Localhost', 'A3', '2025-01-25 17:30:33'),
(235, 'Tasks', 'Enabled <b>TK000005</b> due to <b>Onel.</b>', '', 'Localhost', 'A3', '2025-01-25 17:30:45'),
(236, 'Tasks', 'Marked Task as Completed <b>TK000005</b> due to <b>Yes.</b>', '', 'Localhost', 'A3', '2025-01-25 17:30:59'),
(237, 'General', 'Logged out.', '', 'Localhost', 'A3', '2025-01-25 17:31:12'),
(238, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-01-25 17:48:25'),
(239, 'General', 'Logged out.', '', 'Localhost', 'A3', '2025-01-25 17:52:52'),
(240, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-01-25 18:32:18'),
(241, 'Invoices', 'Added transaction in <b>SA/2025-26/00001</b>.', '', 'Localhost', 'A3', '2025-01-27 22:54:00'),
(242, 'Invoices', 'Added transaction in <b>SA/2025-26/00001</b>.', '', 'Localhost', 'A3', '2025-01-27 23:04:40'),
(243, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-01-28 21:15:28'),
(244, 'Single Client', 'Edited Name from <b>Sun Pharma Pvt Ltd</b> to <b>Sun Pharmas Pvt Ltd</b> of <b>CP000001</b> of <b>CN000001</b>.', '', 'Localhost', 'A3', '2025-01-28 22:17:14'),
(245, 'Single Client', 'Edited Name from <b>Sun Pharmas Pvt Ltd</b> to <b>Sun Pharma Pvt Ltd</b> of <b>CP000001</b> of <b>CN000001</b>.', '', 'Localhost', 'A3', '2025-01-28 22:17:27'),
(246, 'Inquiries', 'Added <b>PJ000003</b>.', '', 'Localhost', 'A3', '2025-01-28 23:46:18'),
(247, 'General', 'Logged out.', '', 'Localhost', 'A3', '2025-01-28 23:50:19'),
(248, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-01-29 20:35:35'),
(249, 'Tasks', 'Added <b>TK000007</b> in <b>PJ000003</b>', '', 'Localhost', 'A3', '2025-01-29 22:38:25'),
(250, 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000003</b>.', '', 'Localhost', 'A3', '2025-01-29 22:54:46'),
(251, 'Tasks', 'Deleted particular <b>Particular 1</b> with remark <b>Remark 1</b> of <b>TK000007</b> in <b>PJ000003</b>', '', 'Localhost', 'A3', '2025-01-29 23:02:20'),
(252, 'General', 'Logged out.', '', 'Localhost', 'A3', '2025-01-29 23:19:18'),
(253, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-01-29 23:20:58'),
(254, 'Tasks', 'Marked sub task having <b>Particular #21</b> & <b>Remark #23</b> as completed of <b>10</b> in <b>PJ000001</b>', '', 'Localhost', 'A3', '2025-01-29 23:35:05'),
(255, 'Tasks', 'Marked sub task having <b>Particular #1</b> & <b>Remark #1</b> as completed of <b>9</b> in <b>PJ000001</b>', '', 'Localhost', 'A3', '2025-01-29 23:37:54'),
(256, 'Tasks', 'Marked Task as Completed <b>TK000002</b> due to <b>Lovely.</b>', '', 'Localhost', 'A3', '2025-01-29 23:50:31'),
(257, 'Tasks', 'Marked Task as Completed <b>TK000002</b> due to <b>Lovely.</b>', '', 'Localhost', 'A3', '2025-01-29 23:51:44'),
(258, 'Tasks', 'Marked Task as Completed <b>TK000002</b> due to <b>Hello.</b>', '', 'Localhost', 'A3', '2025-01-29 23:53:29'),
(259, 'Tasks', 'Marked Task as Completed <b>TK000002</b> due to <b>Hello.</b>', '', 'Localhost', 'A3', '2025-01-29 23:56:08'),
(260, 'Tasks', 'Marked all sub tasks as completed of <b>TK000002</b> in <b>PJ000001</b>', '', 'Localhost', 'A3', '2025-01-29 23:56:08'),
(261, 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000002</b>.', '', 'Localhost', 'A3', '2025-01-30 00:15:32'),
(262, 'General', 'Logged out.', '', 'Localhost', 'A3', '2025-01-30 00:18:47'),
(263, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-01-30 00:18:50'),
(264, 'Tasks', 'Marked Task as Completed <b>TK000001</b> in <b>PJ000001</b> due to <b>Nice.</b>', '', 'Localhost', 'A3', '2025-01-30 00:24:45'),
(265, 'Tasks', 'Marked all sub tasks as completed of <b>TK000001</b> in <b>PJ000001</b>', '', 'Localhost', 'A3', '2025-01-30 00:24:45'),
(266, 'Tasks', 'Marked Task as Completed <b>TK000006</b> in <b>PJ000002</b> due to <b>Lol.</b>', '', 'Localhost', 'A3', '2025-01-30 00:26:57'),
(267, 'Tasks', 'Marked all sub tasks as completed of <b>TK000006</b> in <b>PJ000002</b>', '', 'Localhost', 'A3', '2025-01-30 00:26:57'),
(268, 'Tasks', 'Added <b>TK000008</b> in <b>PJ000002</b>', '', 'Localhost', 'A3', '2025-01-30 00:28:49'),
(269, 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000002</b>.', '', 'Localhost', 'A3', '2025-01-30 00:29:00'),
(270, 'Tasks', 'Marked sub task having <b>Like</b> & <b>Mike</b> as completed of <b>TK000008</b> in <b>PJ000002</b>', '', 'Localhost', 'A3', '2025-01-30 00:29:18'),
(271, 'Tasks', 'Marked Task as Completed <b>TK000008</b> in <b>PJ000002</b> due to <b>Done.</b>', '', 'Localhost', 'A3', '2025-01-30 00:29:26'),
(272, 'Tasks', 'Marked all sub tasks as completed of <b>TK000008</b> in <b>PJ000002</b>', '', 'Localhost', 'A3', '2025-01-30 00:29:26'),
(273, 'Tasks', 'Marked project <b>PJ000002</b> completed.', '', 'Localhost', 'A3', '2025-01-30 00:51:35'),
(274, 'General', 'Logged out.', '', 'Localhost', 'A3', '2025-01-30 00:52:05'),
(275, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-01-30 19:09:14'),
(276, 'General', 'Logged out.', '', 'Localhost', 'A3', '2025-01-30 19:09:18'),
(277, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-01-30 19:09:58'),
(278, 'Inquiries', 'Added <b>IQ000009</b>.', '', 'Localhost', 'A3', '2025-01-30 19:24:28'),
(279, 'General', 'Logged out.', '', 'Localhost', 'A3', '2025-01-30 19:25:23'),
(280, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-01-30 19:34:01'),
(281, 'Cash Flow', 'Added cash flow entry.', '', 'Localhost', 'A3', '2025-01-30 23:41:51'),
(282, 'Cash Flow', 'Added <b>Affiliates</b> entry.', '', 'Localhost', 'A3', '2025-01-30 23:59:55'),
(283, 'Cash Flow', 'Added <b>Outward Office Expense</b> entry.', '', 'Localhost', 'A3', '2025-01-31 00:01:16'),
(284, 'Cash Flow', 'Added <b>Outward Office Expense</b> entry.', '', 'Localhost', 'A3', '2025-01-31 00:02:00'),
(285, 'Cash Flow', 'Added <b>Outward Petty Cash</b> entry.', '', 'Localhost', 'A3', '2025-01-31 00:02:54'),
(286, 'General', 'Logged out.', '', 'Localhost', 'A3', '2025-01-31 00:15:43'),
(287, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-01-31 19:22:05'),
(288, 'General', 'Logged out.', '', 'Localhost', 'A3', '2025-01-31 20:11:44'),
(289, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-01-31 20:11:47'),
(290, 'General', 'Logged out.', '', 'Localhost', 'A3', '2025-01-31 20:12:17'),
(291, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-01-31 20:24:09'),
(292, 'New Invoice', 'Generated invoice <b>SA/2024-25/00003</b> for <b>PJ000001</b>', '', 'Localhost', 'A3', '2025-01-31 20:52:39'),
(293, 'New Invoice', 'Generated invoice <b>SA/2024-25/00004</b> for <b>PJ000001</b>', '', 'Localhost', 'A3', '2025-01-31 20:57:08'),
(294, 'New Invoice', 'Generated invoice <b>SA/2024-25/00005</b> for <b>PJ000001</b>', '', 'Localhost', 'A3', '2025-01-31 20:58:07'),
(295, 'New Invoice', 'Generated invoice <b>SA/2024-25/00006</b> for <b>PJ000001</b>', '', 'Localhost', 'A3', '2025-01-31 20:58:22'),
(296, 'New Invoice', 'Generated invoice <b>SA/2024-25/00007</b> for <b>PJ000001</b>', '', 'Localhost', 'A3', '2025-01-31 20:58:41'),
(297, 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000003</b>.', '', 'Localhost', 'A3', '2025-01-31 23:01:12'),
(298, 'Tasks', 'Edited Particular from <b>Hi</b> to <b>His</b> of <b>TK000007</b> in <b>PJ000003</b>.', '', 'Localhost', 'A3', '2025-01-31 23:01:18'),
(299, 'Tasks', 'Edited Remark from <b>Bye</b> to <b>Byes</b> of <b>TK000007</b> in <b>PJ000003</b>.', '', 'Localhost', 'A3', '2025-01-31 23:01:24'),
(300, 'Tasks', 'Edited Task from <b>Task @1</b> to <b>Tasks @1</b> of <b>TK000007</b> in <b>PJ000003</b>.', '', 'Localhost', 'A3', '2025-01-31 23:01:31'),
(301, 'Tasks', 'Disabled <b>TK000007</b> in <b>PJ000003</b> due to <b>Lol.</b>', '', 'Localhost', 'A3', '2025-01-31 23:01:53'),
(302, 'Tasks', 'Enabled <b>TK000007</b> in <b>PJ000003</b> due to <b>Pop.</b>', '', 'Localhost', 'A3', '2025-01-31 23:02:13'),
(303, 'General', 'Logged out.', '', 'Localhost', 'A3', '2025-02-01 01:16:15'),
(304, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-02-01 11:30:30'),
(305, 'Inquiries', 'Added <b>IQ000011</b>.', '', 'Localhost', 'A3', '2025-02-01 12:07:57'),
(306, 'Inquiries', 'Added <b>IQ000012</b>.', '', 'Localhost', 'A3', '2025-02-01 12:16:46'),
(307, 'Inquiries', 'Added <b>IQ000013</b>.', '', 'Localhost', 'A3', '2025-02-01 12:18:42'),
(308, 'Inquiries', 'Closed <b>IQ000010</b> due to <b>#Hashtag@ 123</b>.', '', 'Localhost', 'A3', '2025-02-01 12:19:54'),
(309, 'Inquiries', 'Edited <b>IQ000007</b>.', '', 'Localhost', 'A3', '2025-02-01 12:24:45'),
(310, 'Inquiries', 'Edited <b>IQ000012</b>.', '', 'Localhost', 'A3', '2025-02-01 12:32:52'),
(311, 'Single Client', 'Edited Email Address from <b>suresh@Yahoo.com</b> to <b>suresh@outlook.com</b>, Phone Number from <b>8780577811</b> to <b>9099300543</b> of <b>CN000006</b>.', '', 'Localhost', 'A3', '2025-02-01 13:14:29'),
(312, 'Single Client', 'Edited Email Address from <b>soni.dipen@gmail.com</b> to <b>change@gmail.com</b>, Phone Number from <b>9909436171</b> to <b>9998733006</b> of <b>CN000005</b>.', '', 'Localhost', 'A3', '2025-02-01 13:15:42'),
(313, 'Inquiries', 'Added <b>IQ000014</b>.', '', 'Localhost', 'A3', '2025-02-01 13:39:03'),
(314, 'Inquiries', 'Added <b>IQ000015</b>.', '', 'Localhost', 'A3', '2025-02-01 13:41:07'),
(315, 'Inquiries', 'Added <b>IQ000016</b>.', '', 'Localhost', 'A3', '2025-02-01 13:42:18'),
(316, 'Inquiries', 'Update status of <b>IQ000015</b> to <b>Hold</b> from <b>Open</b>.', '', 'Localhost', 'A3', '2025-02-01 13:42:33'),
(317, 'Inquiries', 'Closed <b>IQ000014</b> due to <b>Not Interested.</b>.', '', 'Localhost', 'A3', '2025-02-01 13:42:42'),
(318, 'Inquiries', 'Update status of <b>IQ000016</b> to <b>Hold</b> from <b>Open</b>.', '', 'Localhost', 'A3', '2025-02-01 13:43:40'),
(319, 'Inquiries', 'Added <b>PJ000004</b>.', '', 'Localhost', 'A3', '2025-02-01 13:44:26'),
(320, 'Single Client', 'Edited Email Address from <b>salma@salim.com</b> to <b>abhishek@sal.com</b>, Name from <b>Salman</b> to <b>Gor Maharaj</b>, Phone Number from <b>254546816846</b> to <b>8000721554</b> of <b>CN000012</b>.', '', 'Localhost', 'A3', '2025-02-01 13:51:09'),
(321, 'Single Client', 'Edited Name from <b>Sameer</b> to <b>DS</b> of <b>CN000011</b>.', '', 'Localhost', 'A3', '2025-02-01 13:51:45'),
(322, 'Inquiries', 'Added <b>IQ000017</b>.', '', 'Localhost', 'A3', '2025-02-01 13:59:09'),
(323, 'Inquiries', 'Edited <b>IQ000017</b>.', '', 'Localhost', 'A3', '2025-02-01 14:04:19'),
(324, 'Inquiries', 'Edited <b>IQ000004</b>.', '', 'Localhost', 'A3', '2025-02-01 14:13:44'),
(325, 'Inquiries', 'Edited <b>IQ000017</b>.', '', 'Localhost', 'A3', '2025-02-01 15:22:13'),
(326, 'Inquiries', 'Edited <b>IQ000017</b>.', '', 'Localhost', 'A3', '2025-02-01 15:24:17'),
(327, 'Inquiries', 'Added <b>PJ000005</b>.', '', 'Localhost', 'A3', '2025-02-01 15:26:58'),
(328, 'Inquiries', 'Added <b>PJ000006</b>.', '', 'Localhost', 'A3', '2025-02-01 15:41:10'),
(329, 'Inquiries', 'Added <b>PJ000007</b>.', '', 'Localhost', 'A3', '2025-02-01 15:43:00'),
(330, 'Projects', 'Cancelled <b>PJ000001</b> from <b>Active</b>', '', 'Localhost', 'A3', '2025-02-01 15:59:05'),
(331, 'Projects', 'Resumed <b>PJ000001</b> from <b>Cancelled</b>', '', 'Localhost', 'A3', '2025-02-01 15:59:12'),
(332, 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2025-02-01 16:01:19'),
(333, 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2025-02-01 16:01:35'),
(334, 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2025-02-01 16:01:44'),
(335, 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2025-02-01 16:01:49'),
(336, 'Tasks', 'Deleted particular <b>adnasdnk</b> with remark <b>qdknksdfnkszndf</b> of <b>TK000003</b> in <b>PJ000001</b>', '', 'Localhost', 'A3', '2025-02-01 16:01:59'),
(337, 'Tasks', 'Deleted particular <b>zzzzzzzzzzzzz</b> with remark <b>aaaaaaaaaaaaaaaaa</b> of <b>TK000003</b> in <b>PJ000001</b>', '', 'Localhost', 'A3', '2025-02-01 16:02:03'),
(338, 'Tasks', 'Edited Particular from <b>popopopopop</b> to <b>adnaannnnnnnnnnnnnn</b>, Remark from <b>lolololooo</b> to <b>cv</b> of <b>TK000003</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2025-02-01 16:02:18'),
(339, 'Tasks', 'Edited Particular from <b>vvvvvvvvvvv</b> to <b>r</b>, Remark from <b>sssssssssssssss</b> to <b>t</b> of <b>TK000003</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2025-02-01 16:02:26'),
(340, 'Tasks', 'Marked sub task having <b>adnaannnnnnnnnnnnnn</b> & <b>cv</b> as completed of <b>TK000003</b> in <b>PJ000001</b>', '', 'Localhost', 'A3', '2025-02-01 16:03:33'),
(341, 'Tasks', 'Marked sub task having <b>r</b> & <b>t</b> as completed of <b>TK000003</b> in <b>PJ000001</b>', '', 'Localhost', 'A3', '2025-02-01 16:04:15'),
(342, 'Tasks', 'Marked Task as Completed <b>TK000003</b> in <b>PJ000001</b> due to <b>yyyyy</b>', '', 'Localhost', 'A3', '2025-02-01 16:04:23'),
(343, 'Tasks', 'Marked all sub tasks as completed of <b>TK000003</b> in <b>PJ000001</b>', '', 'Localhost', 'A3', '2025-02-01 16:04:23'),
(344, 'Tasks', 'Disabled <b>TK000004</b> in <b>PJ000001</b> due to <b>rrrrrrrrrrrrr</b>', '', 'Localhost', 'A3', '2025-02-01 16:04:33'),
(345, 'Tasks', 'Enabled <b>TK000004</b> in <b>PJ000001</b> due to <b>xxxxxxxxxx</b>', '', 'Localhost', 'A3', '2025-02-01 16:05:18'),
(346, 'Tasks', 'Disabled <b>TK000004</b> in <b>PJ000001</b> due to <b>xxxxxxxxxx</b>', '', 'Localhost', 'A3', '2025-02-01 16:05:39'),
(347, 'Tasks', 'Enabled <b>TK000004</b> in <b>PJ000001</b> due to <b>vvvvvvv</b>', '', 'Localhost', 'A3', '2025-02-01 16:06:07'),
(348, 'Tasks', 'Deleted <b>TK000004</b> in <b>PJ000001</b>', '', 'Localhost', 'A3', '2025-02-01 16:08:33'),
(349, 'Tasks', 'Added <b>TK000009</b> in <b>PJ000001</b>', '', 'Localhost', 'A3', '2025-02-01 16:09:02'),
(350, 'Tasks', 'Disabled <b>TK000009</b> in <b>PJ000001</b> due to <b>Ret.</b>', '', 'Localhost', 'A3', '2025-02-01 16:09:16'),
(351, 'Tasks', 'Deleted <b>TK000009</b> in <b>PJ000001</b>', '', 'Localhost', 'A3', '2025-02-01 16:22:07'),
(352, 'Tasks', 'Marked project <b>PJ000001</b> completed.', '', 'Localhost', 'A3', '2025-02-01 16:22:16'),
(353, 'Projects', '<b>PJ000003</b> kept on <b>Hold</b> from <b>Active</b>', '', 'Localhost', 'A3', '2025-02-01 16:23:09'),
(354, 'Projects', '<b>PJ000004</b> kept on <b>Hold</b> from <b>Active</b>', '', 'Localhost', 'A3', '2025-02-01 16:23:13'),
(355, 'Projects', '<b>PJ000005</b> kept on <b>Hold</b> from <b>Active</b>', '', 'Localhost', 'A3', '2025-02-01 16:23:18'),
(356, 'Projects', '<b>PJ000006</b> kept on <b>Hold</b> from <b>Active</b>', '', 'Localhost', 'A3', '2025-02-01 16:23:27'),
(357, 'Projects', '<b>PJ000007</b> kept on <b>Hold</b> from <b>Active</b>', '', 'Localhost', 'A3', '2025-02-01 16:23:32'),
(358, 'Projects', 'Resumed <b>PJ000007</b> from <b>Hold</b>', '', 'Localhost', 'A3', '2025-02-01 16:24:36'),
(359, 'Projects', 'Resumed <b>PJ000006</b> from <b>Hold</b>', '', 'Localhost', 'A3', '2025-02-01 16:24:58'),
(360, 'Projects', 'Resumed <b>PJ000005</b> from <b>Hold</b>', '', 'Localhost', 'A3', '2025-02-01 16:25:00'),
(361, 'Projects', 'Resumed <b>PJ000004</b> from <b>Hold</b>', '', 'Localhost', 'A3', '2025-02-01 16:25:03'),
(362, 'Projects', 'Resumed <b>PJ000003</b> from <b>Hold</b>', '', 'Localhost', 'A3', '2025-02-01 16:25:05'),
(363, 'Tasks', 'Added <b>TK000009</b> in <b>PJ000004</b>', '', 'Localhost', 'A3', '2025-02-01 16:25:42'),
(364, 'Tasks', 'Edited Expense from <b>2525.00</b> to <b>4545</b> of <b>TK000009</b> in <b>PJ000004</b>.', '', 'Localhost', 'A3', '2025-02-01 16:26:26'),
(365, 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000004</b>.', '', 'Localhost', 'A3', '2025-02-01 16:26:30'),
(366, 'Tasks', 'Deleted particular <b>c</b> with remark <b>v</b> of <b>TK000009</b> in <b>PJ000004</b>', '', 'Localhost', 'A3', '2025-02-01 16:28:29'),
(367, 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000004</b>.', '', 'Localhost', 'A3', '2025-02-01 16:28:33'),
(368, 'Tasks', 'Added <b>TK000010</b> in <b>PJ000005</b>', '', 'Localhost', 'A3', '2025-02-01 16:28:53'),
(369, 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000005</b>.', '', 'Localhost', 'A3', '2025-02-01 16:28:59'),
(370, 'Tasks', 'Added <b>TK000011</b> in <b>PJ000007</b>', '', 'Localhost', 'A3', '2025-02-01 16:29:23'),
(371, 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000007</b>.', '', 'Localhost', 'A3', '2025-02-01 16:29:30'),
(372, 'Tasks', 'Added <b>TK000012</b> in <b>PJ000001</b>', '', 'Localhost', 'A3', '2025-02-01 16:30:02'),
(373, 'Projects', 'Resumed <b>PJ000001</b> from <b>Completed</b>', '', 'Localhost', 'A3', '2025-02-01 16:42:57'),
(374, 'Projects', '<b>PJ000003</b> kept on <b>Hold</b> from <b>Active</b>', '', 'Localhost', 'A3', '2025-02-01 16:46:52'),
(375, 'Projects', '<b>PJ000005</b> kept on <b>Hold</b> from <b>Active</b> due to <b>vvvvvvvvvvvvv</b>', '', 'Localhost', 'A3', '2025-02-01 16:49:53'),
(376, 'Projects', 'Resumed <b>PJ000005</b> from <b>Hold</b>', '', 'Localhost', 'A3', '2025-02-01 16:51:22'),
(377, 'Tasks', 'Added <b>TK000013</b> in <b>PJ000005</b>', '', 'Localhost', 'A3', '2025-02-01 16:52:32'),
(378, 'Tasks', 'Deleted particular <b>v</b> with remark <b>v</b> of <b>TK000010</b> in <b>PJ000005</b>', '', 'Localhost', 'A3', '2025-02-01 16:56:38'),
(379, 'Tasks', 'Deleted <b>TK000010</b> in <b>PJ000005</b>', '', 'Localhost', 'A3', '2025-02-01 16:56:43'),
(380, 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000005</b>.', '', 'Localhost', 'A3', '2025-02-01 16:57:36'),
(381, 'Tasks', 'Added <b>TK000014</b> in <b>PJ000005</b>', '', 'Localhost', 'A3', '2025-02-01 16:57:40'),
(382, 'Tasks', 'Deleted <b>TK000014</b> in <b>PJ000005</b>', '', 'Localhost', 'A3', '2025-02-01 17:03:42'),
(383, 'Tasks', 'Deleted particular <b>c</b> with remark <b>c</b> of <b>TK000013</b> in <b>PJ000005</b>', '', 'Localhost', 'A3', '2025-02-01 17:03:52'),
(384, 'Tasks', 'Deleted <b>TK000013</b> in <b>PJ000005</b>', '', 'Localhost', 'A3', '2025-02-01 17:04:09'),
(385, 'Projects', 'Edited <b>PJ000007</b>.', '', 'Localhost', 'A3', '2025-02-01 17:06:41'),
(386, 'Tasks', 'Marked Task as Completed <b>TK000007</b> in <b>PJ000003</b> due to <b>bbbb</b>', '', 'Localhost', 'A3', '2025-02-01 17:08:43'),
(387, 'Tasks', 'Marked all sub tasks as completed of <b>TK000007</b> in <b>PJ000003</b>', '', 'Localhost', 'A3', '2025-02-01 17:08:43'),
(388, 'Invoices', 'Added transaction in <b></b>.', '', 'Localhost', 'A3', '2025-02-01 20:32:37'),
(389, 'Invoices', 'Added transaction in <b></b>.', '', 'Localhost', 'A3', '2025-02-01 20:32:53'),
(390, 'Projects', 'Mapped <b>(AF000002)</b> to <b>PJ000001</b>.', '', 'Localhost', 'A3', '2025-02-01 20:56:32'),
(391, 'Cash Flow', 'Added <b>Affiliates</b> entry.', '', 'Localhost', 'A3', '2025-02-01 20:58:04'),
(392, 'Projects', 'Mapped <b>(AF000002)</b> to <b>PJ000004</b>.', '', 'Localhost', 'A3', '2025-02-01 20:58:48'),
(393, 'Projects', 'Mapped <b>(AF000002)</b> to <b>PJ000007</b>.', '', 'Localhost', 'A3', '2025-02-01 20:59:05'),
(394, 'General', 'Logged out.', '', 'Localhost', 'A3', '2025-02-01 21:46:31'),
(395, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-02-02 13:50:03'),
(396, 'Affiliates', 'Added transaction for <b>AF000001</b>.', '', 'Localhost', 'A3', '2025-02-02 19:16:39'),
(397, 'Affiliates', 'Added transaction for <b>AF000001</b>.', '', 'Localhost', 'A3', '2025-02-02 19:45:20'),
(398, 'Affiliates', 'Added transaction for <b>AF000001</b>.', '', 'Localhost', 'A3', '2025-02-02 20:56:10'),
(399, 'Affiliates', 'Added transaction for <b>AF000002</b>.', '', 'Localhost', 'A3', '2025-02-02 22:01:48'),
(400, 'Affiliates', 'Added transaction for <b>AF000002</b>.', '', 'Localhost', 'A3', '2025-02-02 22:02:50'),
(401, 'Affiliates', 'Added transaction for <b>AF000002</b>.', '', 'Localhost', 'A3', '2025-02-02 22:06:03'),
(402, 'Affiliates', 'Added transaction for <b>AF000001</b>.', '', 'Localhost', 'A3', '2025-02-02 22:07:33'),
(403, 'Affiliates', 'Added transaction for <b>AF000002</b>.', '', 'Localhost', 'A3', '2025-02-02 22:13:18'),
(404, 'Affiliates', 'Added transaction for <b>AF000001</b>.', '', 'Localhost', 'A3', '2025-02-02 22:18:57'),
(405, 'Affiliates', 'Added transaction for <b>AF000002</b>.', '', 'Localhost', 'A3', '2025-02-02 22:20:01'),
(406, 'Affiliates', 'Added transaction for <b>Outward Office Expense</b>.', '', 'Localhost', 'A3', '2025-02-02 23:26:12'),
(407, 'Cash Flow', 'Added transaction for <b>Outward Other Expense</b>.', '', 'Localhost', 'A3', '2025-02-02 23:32:20'),
(408, 'Cash Flow', 'Added transaction for <b>Outward Petty Cash</b>.', '', 'Localhost', 'A3', '2025-02-02 23:32:47'),
(409, 'Cash Flow', 'Added transaction for <b>Inward Other Income</b>.', '', 'Localhost', 'A3', '2025-02-02 23:33:38'),
(410, 'General', 'Logged out.', '', 'Localhost', 'A3', '2025-02-02 23:43:50'),
(411, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-02-02 23:43:57'),
(412, 'General', 'Logged out.', '', 'Localhost', 'A3', '2025-02-03 00:01:32'),
(413, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-02-03 19:33:51'),
(414, 'Affiliates', 'Added transaction for <b>AF000001</b>.', '', 'Localhost', 'A3', '2025-02-03 21:09:53'),
(415, 'Affiliates', 'Added transaction for <b>AF000001</b>.', '', 'Localhost', 'A3', '2025-02-03 21:10:50'),
(416, 'Cash Flow', 'Added transaction for <b>Outward Office Expense</b>.', '', 'Localhost', 'A3', '2025-02-03 21:32:34'),
(417, 'Cash Flow', 'Added transaction for <b>Outward Office Expense</b>.', '', 'Localhost', 'A3', '2025-02-03 21:33:07'),
(418, 'Cash Flow', 'Added transaction for <b>Outward Office Expense</b>.', '', 'Localhost', 'A3', '2025-02-03 21:52:27'),
(419, 'Cash Flow', 'Added transaction for <b>Outward Office Expense</b>.', '', 'Localhost', 'A3', '2025-02-03 21:53:36'),
(420, 'Cash Flow', 'Added transaction for <b>Outward Office Expense</b>.', '', 'Localhost', 'A3', '2025-02-03 21:56:56'),
(421, 'Inquiries', 'Added <b>PJ000008</b>.', '', 'Localhost', 'A3', '2025-02-03 22:56:42'),
(422, 'General', 'Logged out.', '', 'Localhost', 'A3', '2025-02-03 23:29:46'),
(423, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-02-04 19:53:30'),
(424, 'Cash Flow', 'Added entity for <b>Office Expense</b>.', '', 'Localhost', 'A3', '2025-02-04 22:57:17'),
(425, 'Cash Flow', 'Added entity for <b>Office Expense</b>.', '', 'Localhost', 'A3', '2025-02-05 00:18:24'),
(426, 'General', 'Logged out.', '', '', 'A3', '2025-02-05 00:21:22'),
(427, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-02-05 00:22:10'),
(428, 'General', 'Logged out.', '', '', 'A3', '2025-02-05 00:24:41'),
(429, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-02-05 19:42:58'),
(430, 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2025-02-05 20:13:33'),
(431, 'Tasks', 'Disabled <b>TK000012</b> in <b>PJ000001</b> due to <b>lolsss.</b>', '', 'Localhost', 'A3', '2025-02-05 20:48:23'),
(432, 'Tasks', 'Enabled <b>TK000012</b> in <b>PJ000001</b> due to <b>molp.</b>', '', 'Localhost', 'A3', '2025-02-05 20:50:12'),
(433, 'General', 'Logged out.', '', '', 'A3', '2025-02-05 20:50:38'),
(434, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-02-05 20:54:36'),
(435, 'Tasks', 'Edited Expense from <b>0.00</b> to <b>150</b>, Task from <b>zzzzzz</b> to <b>Task #4</b> of <b>TK000012</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2025-02-05 21:01:57'),
(436, 'Tasks', 'Added <b>TK000013</b> in <b>PJ000001</b>', '', 'Localhost', 'A3', '2025-02-05 21:21:11'),
(437, 'Tasks', 'Added <b>TK000014</b> in <b>PJ000001</b>', '', 'Localhost', 'A3', '2025-02-05 21:21:19'),
(438, 'Tasks', 'Added <b>TK000015</b> in <b>PJ000001</b>', '', 'Localhost', 'A3', '2025-02-05 21:21:28'),
(439, 'Tasks', 'Added <b>TK000016</b> in <b>PJ000001</b>', '', 'Localhost', 'A3', '2025-02-05 21:21:37'),
(440, 'Tasks', 'Edited Task from <b>Task 5</b> to <b>Task #5</b> of <b>TK000013</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2025-02-05 21:21:46'),
(441, 'Tasks', 'Added <b>TK000017</b> in <b>PJ000001</b>', '', 'Localhost', 'A3', '2025-02-05 21:22:00'),
(442, 'Tasks', 'Added <b>TK000018</b> in <b>PJ000001</b>', '', 'Localhost', 'A3', '2025-02-05 21:22:10'),
(443, 'Tasks', 'Edited Remark from <b>pl;</b> to <b>pl;s</b> of <b>TK000012</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2025-02-05 21:57:01'),
(444, 'Tasks', 'Added <b>TK000019</b> in <b>PJ000001</b>', '', 'Localhost', 'A3', '2025-02-05 22:08:27'),
(445, 'Tasks', 'Disabled <b>TK000013</b> in <b>PJ000001</b> due to <b>mko</b>', '', 'Localhost', 'A3', '2025-02-05 22:18:58'),
(446, 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2025-02-05 22:21:07'),
(447, 'Tasks', 'Edited Expense from <b>150.00</b> to <b>157.00</b> of <b>TK000012</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2025-02-05 22:21:26'),
(448, 'Tasks', 'Disabled <b>TK000012</b> in <b>PJ000001</b> due to <b>vcbcvb</b>', '', 'Localhost', 'A3', '2025-02-05 22:21:37'),
(449, 'Tasks', 'Enabled <b>TK000012</b> in <b>PJ000001</b> due to <b>poll.</b>', '', 'Localhost', 'A3', '2025-02-05 22:33:28'),
(450, 'Tasks', 'Edited Expense from <b>157.00</b> to <b>158.00</b> of <b>TK000012</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2025-02-05 22:36:14'),
(451, 'Tasks', 'Disabled <b>TK000012</b> in <b>PJ000001</b> due to <b>mkop</b>', '', 'Localhost', 'A3', '2025-02-05 22:36:20'),
(452, 'Tasks', 'Enabled <b>TK000012</b> in <b>PJ000001</b> due to <b>vvbh</b>', '', 'Localhost', 'A3', '2025-02-05 22:36:27'),
(453, 'Tasks', 'Enabled <b>TK000013</b> in <b>PJ000001</b> due to <b>mlp</b>', '', 'Localhost', 'A3', '2025-02-05 22:36:37'),
(454, 'Tasks', 'Marked Task as Completed <b>TK000012</b> in <b>PJ000001</b> due to <b>bbnju</b>', '', 'Localhost', 'A3', '2025-02-05 22:36:47'),
(455, 'Tasks', 'Marked all sub tasks as completed of <b>TK000012</b> in <b>PJ000001</b>', '', 'Localhost', 'A3', '2025-02-05 22:36:47'),
(456, 'Tasks', 'Edited Task from <b>Task #5</b> to <b>Task #56</b> of <b>TK000013</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2025-02-05 23:08:13'),
(457, 'Tasks', 'Edited Task from <b>Task #56</b> to <b>Task #567</b> of <b>TK000013</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2025-02-05 23:08:23'),
(458, 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2025-02-05 23:10:53'),
(459, 'Tasks', 'Added <b>TK000020</b> in <b>PJ000006</b>', '', 'Localhost', 'A3', '2025-02-05 23:39:47'),
(460, 'General', 'Logged out.', '', '', 'A3', '2025-02-05 23:43:21'),
(461, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-02-06 18:32:34'),
(462, 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2025-02-06 18:33:29'),
(463, 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000001</b>.', '', 'Localhost', 'A3', '2025-02-06 18:33:37'),
(464, 'Tasks', 'Disabled <b>TK000013</b> in <b>PJ000001</b> due to <b>mko</b>', '', 'Localhost', 'A3', '2025-02-06 18:35:25'),
(465, 'Tasks', 'Enabled <b>TK000013</b> in <b>PJ000001</b> due to <b>bjhbj</b>', '', 'Localhost', 'A3', '2025-02-06 18:35:57'),
(466, 'Cash Flow', 'Added card for <b>Office Expense</b>.', '', 'Localhost', 'A3', '2025-02-06 19:12:41'),
(467, 'Cash Flow', 'Added card for <b>Office Expense</b>.', '', 'Localhost', 'A3', '2025-02-06 19:23:08'),
(468, 'Cash Flow', 'Added card for <b>2</b> in <b>Canteen</b> in <b>OFEX</b>.', '', 'Localhost', 'A3', '2025-02-06 19:35:36'),
(469, 'Vendors', 'Added vendor(s).', '', 'Localhost', 'A3', '2025-02-06 19:44:32'),
(470, 'Cash Flow', 'Added entity for <b>Petty Cash</b>.', '', 'Localhost', 'A3', '2025-02-06 19:59:38'),
(471, 'Cash Flow', 'Added card for <b>3</b> in <b>pos</b> in <b>PECA</b>.', '', 'Localhost', 'A3', '2025-02-06 20:00:03'),
(472, 'Cash Flow', 'Added card for <b>3</b> in <b>pos</b> in <b>PECA</b>.', '', 'Localhost', 'A3', '2025-02-06 20:00:23'),
(473, 'General', 'Logged out.', '', '', 'A3', '2025-02-06 20:52:07'),
(474, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-02-06 20:55:44'),
(475, 'Cash Flow', 'Added entity in <b>Office Expense</b>.', '', 'Localhost', 'A3', '2025-02-06 22:04:09'),
(476, 'Cash Flow', 'Added entity in <b>Office Expense</b>.', '', 'Localhost', 'A3', '2025-02-06 22:05:21'),
(477, 'Cash Flow', 'Added head for <b>Tea Stall</b> in <b>Office Expense</b>.', '', 'Localhost', 'A3', '2025-02-06 23:21:38'),
(478, 'Cash Flow', 'Added transaction in <b>1</b>.', '', 'Localhost', 'A3', '2025-02-07 00:54:57'),
(479, 'General', 'Logged out.', '', '', 'A3', '2025-02-07 01:19:11'),
(480, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-02-07 19:34:52'),
(481, 'Cash Flow', 'Added transaction in <b>Office Expense</b> in Tea Stall in For monthly tea/coffee.', '', 'Localhost', 'A3', '2025-02-07 20:00:29'),
(482, 'Cash Flow', 'Added transaction in <b>Office Expense</b> in Tea Stall in For monthly tea/coffee.', '', 'Localhost', 'A3', '2025-02-07 20:01:25');
INSERT INTO `activities` (`id`, `module`, `activity`, `details`, `ip_address`, `entry_by_id`, `entry_at`) VALUES
(483, 'Cash Flow', 'Added transaction in <b>Office Expense</b> in <b>Canteen</b> in <b>Snacks for Clients</b>.', '', 'Localhost', 'A3', '2025-02-07 20:02:38'),
(484, 'Cash Flow', 'Added transaction in <b>Office Expense</b> in <b>Tea Stall</b> in <b>For monthly tea/coffee</b>.', '', 'Localhost', 'A3', '2025-02-07 20:33:29'),
(485, 'Cash Flow', 'Added transaction in <b>Petty Cash</b>.', '', 'Localhost', 'A3', '2025-02-07 22:29:46'),
(486, 'Cash Flow', 'Added transaction in <b>Petty Cash</b>.', '', 'Localhost', 'A3', '2025-02-07 22:30:57'),
(487, 'Affiliates', 'Added transaction for <b>AF000002</b>.', '', 'Localhost', 'A3', '2025-02-07 23:23:56'),
(488, 'Affiliates', 'Added transaction for <b>AF000002</b>.', '', 'Localhost', 'A3', '2025-02-07 23:30:09'),
(489, 'Cash Flow', 'Added entity <b></b> in <b>Other Income</b>.', '', 'Localhost', 'A3', '2025-02-07 23:31:26'),
(490, 'Cash Flow', 'Added head for <b>abc</b> in <b>Other Income</b>.', '', 'Localhost', 'A3', '2025-02-07 23:31:46'),
(491, 'Cash Flow', 'Added transaction in <b>Other Income</b> in <b>abc</b> in <b>mm</b>.', '', 'Localhost', 'A3', '2025-02-07 23:36:31'),
(492, 'General', 'Logged out.', '', '', 'A3', '2025-02-07 23:42:20'),
(493, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-02-08 18:39:39'),
(494, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-02-08 18:55:25'),
(495, 'Affiliates', 'Unmapped affiliate <b>AF000001</b> from <b>PJ000001</b> due to <b>pops</b>.', '', 'Localhost', 'A3', '2025-02-08 21:37:17'),
(496, 'Affiliates', 'Unmapped affiliate <b>AF000001</b> from <b>PJ000001</b> due to <b>mmm</b>.', '', 'Localhost', 'A3', '2025-02-08 21:42:45'),
(497, 'Projects', 'Mapped <b>(AF000001)</b> to <b>PJ000001</b>.', '', 'Localhost', 'A3', '2025-02-08 21:51:06'),
(498, 'Projects', 'Mapped <b>(AF000001,AF000002)</b> to <b>PJ000001</b>.', '', 'Localhost', 'A3', '2025-02-08 22:26:56'),
(499, 'Cash Flow', 'Added head for <b>anuj shah</b> in <b>Office Expense</b>.', '', 'Localhost', 'A3', '2025-02-08 22:46:20'),
(500, 'Cash Flow', 'Added head for <b>anuj shah</b> in <b>Office Expense</b>.', '', 'Localhost', 'A3', '2025-02-08 22:54:12'),
(501, 'Cash Flow', 'Added head for <b>mitesh patel</b> in <b>Office Expense</b>.', '', 'Localhost', 'A3', '2025-02-08 22:55:41'),
(502, 'Cash Flow', 'Added head <b>lolp</b> for <b>mitesh patel</b> in <b>Office Expense</b>.', '', 'Localhost', 'A3', '2025-02-08 23:01:29'),
(503, 'Cash Flow', 'Added head <b>zsxcf</b> for <b>mitesh patel</b> in <b>Office Expense</b>.', '', 'Localhost', 'A3', '2025-02-08 23:02:08'),
(504, 'Cash Flow', 'Added transaction in <b>Office Expense</b> in <b>Tea Stall</b> in <b>For monthly tea/coffee</b>.', '', 'Localhost', 'A3', '2025-02-08 23:53:30'),
(505, 'Cash Flow', 'Edited transaction of <b>Office Expense</b> in <b>Canteen</b> in <b>Snacks for Clients</b>.', '', 'Localhost', 'A3', '2025-02-09 00:09:28'),
(506, 'Cash Flow', 'Edited transaction of <b>Office Expense</b> in <b>Tea Stall</b> in <b>For monthly tea/coffee</b>.', '', 'Localhost', 'A3', '2025-02-09 00:11:07'),
(507, 'Cash Flow', 'Edited transaction of <b>Office Expense</b> in <b>Tea Stall</b> in <b>For monthly tea/coffee</b>.', '', 'Localhost', 'A3', '2025-02-09 00:16:09'),
(508, 'Cash Flow', 'Edited transaction of <b>Office Expense</b> in <b>Tea Stall</b> in <b>For monthly tea/coffee</b>.', '', 'Localhost', 'A3', '2025-02-09 00:17:22'),
(509, 'Cash Flow', 'Edited transaction of <b>Office Expense</b> in <b>Tea Stall</b> in <b>For monthly tea/coffee</b>.', '', 'Localhost', 'A3', '2025-02-09 00:18:51'),
(510, 'Cash Flow', 'Edited transaction of <b>Office Expense</b> in <b>Tea Stall</b> in <b>For monthly tea/coffee</b>.', '', 'Localhost', 'A3', '2025-02-09 00:21:00'),
(511, 'Cash Flow', 'Added transaction in <b>Office Expense</b> in <b>Tea Stall</b> in <b>For monthly tea/coffee</b>.', '', 'Localhost', 'A3', '2025-02-09 00:21:21'),
(512, 'Cash Flow', 'Added transaction in <b>Office Expense</b> in <b>Canteen</b> in <b>Snacks for Clients</b>.', '', 'Localhost', 'A3', '2025-02-09 00:22:20'),
(513, 'Cash Flow', 'Added transaction in <b>Office Expense</b> in <b>anuj shah</b> in <b>snacks of dskr</b>.', '', 'Localhost', 'A3', '2025-02-09 00:23:09'),
(514, 'General', 'Logged out.', '', '', 'A3', '2025-02-09 00:24:59'),
(515, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-02-09 12:17:10'),
(516, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-02-09 12:42:08'),
(517, 'Cash Flow', 'Added transaction in <b>Petty Cash</b>.', '', 'Localhost', 'A3', '2025-02-09 13:59:47'),
(518, 'Cash Flow', 'Added transaction in <b>Petty Cash</b>.', '', 'Localhost', 'A3', '2025-02-09 14:11:16'),
(519, 'Cash Flow', 'Added transaction in <b>Petty Cash</b>.', '', 'Localhost', 'A3', '2025-02-09 14:12:59'),
(520, 'Cash Flow', 'Added transaction in <b>Petty Cash</b>.', '', 'Localhost', 'A3', '2025-02-09 14:13:49'),
(521, 'Cash Flow', 'Added transaction in <b>Petty Cash</b>.', '', 'Localhost', 'A3', '2025-02-09 14:14:22'),
(522, 'Cash Flow', 'Added transaction in <b>Petty Cash</b>.', '', 'Localhost', 'A3', '2025-02-09 14:15:45'),
(523, 'Cash Flow', 'Added transaction in <b>Petty Cash</b>.', '', 'Localhost', 'A3', '2025-02-09 14:16:31'),
(524, 'Cash Flow', 'Added transaction in <b>Petty Cash</b>.', '', 'Localhost', 'A3', '2025-02-09 14:16:58'),
(525, 'Cash Flow', 'Added transaction in <b>Petty Cash</b>.', '', 'Localhost', 'A3', '2025-02-09 14:17:20'),
(526, 'Invoices', 'Added transaction in <b></b>.', '', 'Localhost', 'A3', '2025-02-09 14:53:58'),
(527, 'Invoices', 'Added transaction in <b></b>.', '', 'Localhost', 'A3', '2025-02-09 16:02:10'),
(528, 'Invoices', 'Added transaction in <b></b>.', '', 'Localhost', 'A3', '2025-02-09 16:09:17'),
(529, 'Invoices', 'Added transaction in <b></b>.', '', 'Localhost', 'A3', '2025-02-09 16:19:37'),
(530, 'New RV', 'Generated RV <b>SA/2024-25/00001</b> for <b>PJ000001</b>', '', 'Localhost', 'A3', '2025-02-09 16:47:19'),
(531, 'General', 'Logged out.', '', '', 'A3', '2025-02-09 23:06:45'),
(532, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-02-10 20:26:15'),
(533, 'General', 'Logged out.', '', '', 'A3', '2025-02-11 01:04:42'),
(534, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-02-11 19:20:14'),
(535, 'Inquiries', 'Added <b>IQ000018</b>.', '', 'Localhost', 'A3', '2025-02-11 20:48:05'),
(536, 'Projects', 'Mapped <b>(null,AF000001,AF000002)</b> to <b>PJ000006</b>.', '', 'Localhost', 'A3', '2025-02-11 21:12:56'),
(537, 'Invoices', 'Added transaction in <b></b>.', '', 'Localhost', 'A3', '2025-02-11 21:51:38'),
(538, 'Cash Flow', 'Added head <b>kjsdnkasjd</b> in <b>Anuj</b>.', '', 'Localhost', 'A3', '2025-02-11 23:14:56'),
(539, 'Invoices', 'Added transaction in <b></b>.', '', 'Localhost', 'A3', '2025-02-11 23:20:42'),
(540, 'Invoices', 'Added transaction in <b></b>.', '', 'Localhost', 'A3', '2025-02-11 23:20:52'),
(541, 'Invoices', 'Added transaction in <b></b>.', '', 'Localhost', 'A3', '2025-02-11 23:25:09'),
(542, 'Invoices', 'Added transaction in <b></b>.', '', 'Localhost', 'A3', '2025-02-11 23:26:53'),
(543, 'Invoices', 'Added transaction in <b></b>.', '', 'Localhost', 'A3', '2025-02-11 23:33:31'),
(544, 'Invoices', 'Added transaction in <b></b>.', '', 'Localhost', 'A3', '2025-02-11 23:34:43'),
(545, 'General', 'Logged out.', '', '', 'A3', '2025-02-11 23:40:36'),
(546, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-02-12 19:27:07'),
(547, 'General', 'Logged out.', '', '', 'A3', '2025-02-12 19:42:28'),
(548, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-02-12 19:47:17'),
(549, 'Vendors', 'Added vendor(s).', '', 'Localhost', 'A3', '2025-02-12 20:06:49'),
(550, 'Cash Flow', 'Added head <b>Airtel Broadband Internet</b> in <b>Anuj</b>.', '', 'Localhost', 'A3', '2025-02-12 20:08:55'),
(551, 'Cash Flow', 'Added head <b>Office Sweeper</b> in <b>Manish Patel</b>.', '', 'Localhost', 'A3', '2025-02-12 20:12:41'),
(552, 'Vendors', 'Added transaction for <b>undefined</b>.', '', 'Localhost', 'A3', '2025-02-12 21:51:40'),
(553, 'General', 'Logged out.', '', '', 'A3', '2025-02-12 22:02:05'),
(554, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-02-13 19:25:08'),
(555, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-02-13 19:33:03'),
(556, 'General', 'Logged out.', '', '', 'A3', '2025-02-13 23:02:20'),
(557, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-02-14 20:21:30'),
(558, 'General', 'Logged out.', '', '', 'A3', '2025-02-14 21:37:45'),
(559, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-02-15 21:50:12'),
(560, 'New Invoice', 'Generated invoice <b>PS/2024-25/00003</b> for <b>PJ000003</b>', '', 'Localhost', 'A3', '2025-02-15 22:05:59'),
(561, 'New RV', 'Generated RV <b>PS/2024-25/00002</b> for <b>PJ000003</b>', '', 'Localhost', 'A3', '2025-02-15 22:32:39'),
(562, 'General', 'Logged out.', '', '', 'A3', '2025-02-15 22:39:06'),
(563, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-02-16 13:32:13'),
(564, 'General', 'Logged out.', '', '', 'A3', '2025-02-16 20:50:01'),
(565, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-02-16 20:50:10'),
(566, 'Employees', 'Added employee <b>EP000001</b>.', '', 'Localhost', 'A3', '2025-02-16 23:45:00'),
(567, 'General', 'Logged out.', '', '', 'A3', '2025-02-16 23:46:12'),
(568, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-02-16 23:46:14'),
(569, 'General', 'Logged out.', '', '', 'A3', '2025-02-16 23:46:22'),
(570, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-02-17 19:37:54'),
(571, 'Employees', 'Added employee <b>EP000001</b>.', '', 'Localhost', 'A3', '2025-02-17 19:55:40'),
(572, 'Employees', 'Added employee <b>EP000001</b>.', '', 'Localhost', 'A3', '2025-02-17 19:58:56'),
(573, 'General', 'Logged out.', '', '', 'A3', '2025-02-17 20:40:14'),
(574, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-02-19 21:36:55'),
(575, 'Inquiries', 'Added <b>PJ000009</b>.', '', 'Localhost', 'A3', '2025-02-19 21:44:23'),
(576, 'Tasks', 'Added <b>TK000021</b> in <b>PJ000008</b>', '', 'Localhost', 'A3', '2025-02-19 21:45:01'),
(577, 'Tasks', 'Deleted <b>TK000021</b> in <b>PJ000008</b>', '', 'Localhost', 'A3', '2025-02-19 21:45:19'),
(578, 'Projects', 'Edited quote of <b>PJ000008</b> from <b>123345.00</b> to <b>14856</b>.', '', 'Localhost', 'A3', '2025-02-19 21:45:51'),
(579, 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000007</b>.', '', 'Localhost', 'A3', '2025-02-19 21:56:22'),
(580, 'Tasks', 'Added <b>TK000021</b> in <b>PJ000007</b>', '', 'Localhost', 'A3', '2025-02-19 21:56:28'),
(581, 'Tasks', 'Disabled <b>TK000021</b> in <b>PJ000007</b> due to <b>not worth it.</b>', '', 'Localhost', 'A3', '2025-02-19 21:56:37'),
(582, 'Vendors', 'Added vendor(s).', '', 'Localhost', 'A3', '2025-02-19 22:53:48'),
(583, 'Cash Flow', 'Added head <b>January EMI</b> in <b>Riya Patel</b>.', '', 'Localhost', 'A3', '2025-02-19 22:54:13'),
(584, 'Cash Flow', 'Added entity <b>Hello</b> in <b>Other Expense</b>.', '', 'Localhost', 'A3', '2025-02-20 00:01:43'),
(585, 'Cash Flow', 'Added head <b>April\'s Birthday Treat</b> for <b>Hello</b> in <b>Other Expense</b>.', '', 'Localhost', 'A3', '2025-02-20 00:02:12'),
(586, 'Vendors', 'Added transaction for <b>undefined</b>.', '', 'Localhost', 'A3', '2025-02-20 00:24:29'),
(587, 'Vendors', 'Added transaction for <b>undefined</b>.', '', 'Localhost', 'A3', '2025-02-20 00:30:01'),
(588, 'Vendors', 'Added transaction for <b>undefined</b>.', '', 'Localhost', 'A3', '2025-02-20 00:33:43'),
(589, 'Single Client', 'Edited Name from <b>Mitesh Enterprise</b> to <b>Mitesh Enterprises</b> of <b>CP000003</b> of <b>CN000004</b>.', '', 'Localhost', 'A3', '2025-02-20 00:46:01'),
(590, 'Single Client', 'Edited Phone Number from <b>blank</b> to <b>8000721554</b>, Name from <b>Vivek Football League</b> to <b>Vivek Football Leagues</b> of <b>CP000002</b> of <b>CN000005</b>.', '', 'Localhost', 'A3', '2025-02-20 00:47:00'),
(591, 'Single Client', 'Edited Name from <b>Laal Dupatta Pvt Ltd</b> to <b>Laal Dupatta Pvt Ltds</b> of <b>CP000010</b> of <b>CN000002</b>.', '', 'Localhost', 'A3', '2025-02-20 00:58:09'),
(592, 'Single Client', 'Edited Phone Number from <b>blank</b> to <b>8866359953</b>, Name from <b>Laal Dupatta Pvt Ltds</b> to <b>Laal Dupatta Pvt Ltd...</b> of <b>CP000010</b> of <b>CN000002</b>.', '', 'Localhost', 'A3', '2025-02-20 00:58:42'),
(593, 'Single Client', 'Edited Name from <b>Laal Dupatta Pvt Ltd...</b> to <b>Baal Dupatta Pvt Ltd...</b> of <b>CP000010</b> of <b>CN000002</b>.', '', 'Localhost', 'A3', '2025-02-20 00:59:33'),
(594, 'Single Client', 'Edited Name from <b>Moon Pharma Pvt Ltd</b> to <b>Moon Pharma Pvt Ltd...</b> of <b>CP000009</b> of <b>CN000001</b>.', '', 'Localhost', 'A3', '2025-02-20 00:59:53'),
(595, 'Single Client', 'Edited Name from <b>Moon Pharma Pvt Ltd...</b> to <b>Honey Moon Pharma Pvt Ltd</b> of <b>CP000009</b> of <b>CN000001</b>.', '', 'Localhost', 'A3', '2025-02-20 01:00:39'),
(596, 'Single Client', 'Edited Phone Number from <b>blank</b> to <b>9099300543</b> of <b>CP000009</b> of <b>CN000001</b>.', '', 'Localhost', 'A3', '2025-02-20 01:00:50'),
(597, 'Single Client', 'Edited Name from <b>Honey Moon Pharma Pvt Ltd</b> to <b>Honey Moon Pharma Pvt Ltd.</b> of <b>CP000009</b> of <b>CN000001</b>.', '', 'Localhost', 'A3', '2025-02-20 01:01:06'),
(598, 'General', 'Logged out.', '', '', 'A3', '2025-02-20 01:05:16'),
(599, 'General', 'Logged in.', '', 'Localhost', 'A3', '2025-02-20 19:33:47'),
(600, 'Cash Flow', 'Added head <b>april payment</b> for <b>abc</b> in <b>Other Income</b>.', '', 'Localhost', 'A3', '2025-02-20 19:47:52'),
(601, 'New Invoice', 'Generated invoice <b>SA/2024-25/00004</b> for <b>PJ000005</b>', '', 'Localhost', 'A3', '2025-02-20 19:52:06'),
(602, 'New Invoice', 'Generated invoice <b>SA/2024-25/00005</b> for <b>PJ000006</b>', '', 'Localhost', 'A3', '2025-02-20 19:54:57'),
(603, 'New Invoice', 'Generated invoice <b>PS/2024-25/00006</b> for <b>PJ000004</b>', '', 'Localhost', 'A3', '2025-02-20 19:55:49'),
(604, 'New Invoice', 'Generated invoice <b>SA/2024-25/00007</b> for <b>PJ000007</b>', '', 'Localhost', 'A3', '2025-02-20 19:57:14'),
(605, 'New Invoice', 'Generated invoice <b>PS/2024-25/00008</b> for <b>PJ000008</b>', '', 'Localhost', 'A3', '2025-02-20 19:57:39'),
(606, 'Cash Flow', 'Edited transaction of <b>Other Income</b> in <b>abc</b> in <b>mm</b>.', '', 'Localhost', 'A3', '2025-02-20 20:56:15'),
(607, 'Vendors', 'Added transaction for <b>undefined</b>.', '', 'Localhost', 'A3', '2025-02-20 21:58:58'),
(608, 'Vendors', 'Added transaction for <b>undefined</b>.', '', 'Localhost', 'A3', '2025-02-20 22:04:06'),
(609, 'Vendors', 'Added transaction for <b>undefined</b>.', '', 'Localhost', 'A3', '2025-02-20 22:29:11'),
(610, 'Vendors', 'Added transaction for <b>undefined</b>.', '', 'Localhost', 'A3', '2025-02-20 22:29:32'),
(611, 'Cash Flow', 'Added transaction in <b>Other Expense</b> in <b>Hello</b> in <b>Nothing</b>.', '', 'Localhost', 'A3', '2025-02-20 22:33:58'),
(612, 'Cash Flow', 'Added transaction in <b>Other Expense</b> in <b>Hello</b> in <b>Nothing</b>.', '', 'Localhost', 'A3', '2025-02-20 22:39:02'),
(613, 'Cash Flow', 'Added entity <b>may payment</b> in <b>Other Income</b>.', '', 'Localhost', 'A3', '2025-02-20 23:22:36'),
(614, 'Cash Flow', 'Added entity <b>xyz</b> in <b>Other Income</b>.', '', 'Localhost', 'A3', '2025-02-20 23:23:53'),
(615, 'Cash Flow', 'Added entity <b>Ishita Karia</b> in <b>Other Income</b>.', '', 'Localhost', 'A3', '2025-02-20 23:34:08'),
(616, 'Affiliates', 'Unmapped affiliate <b>AF000002</b> from <b>PJ000004</b> due to <b>bnm.</b>.', '', 'Localhost', 'A3', '2025-02-21 00:16:34'),
(617, 'Affiliates', 'Unmapped affiliate <b>AF000002</b> from <b>PJ000004</b> due to <b>pol</b>.', '', 'Localhost', 'A3', '2025-02-21 00:42:02'),
(618, 'General', 'Logged out.', '', 'Localhost', 'A3', '2025-02-21 00:50:30');

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
  `upi_id` varchar(200) DEFAULT NULL,
  `joined_on` timestamp NULL DEFAULT current_timestamp(),
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `entry_at` timestamp NULL DEFAULT current_timestamp(),
  `entry_by_id` char(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `affiliates`
--

INSERT INTO `affiliates` (`id`, `name`, `email_address`, `phone_number`, `upi_id`, `joined_on`, `status`, `entry_at`, `entry_by_id`) VALUES
('AF000001', 'Drashti Vyas', 'vyas.drashti@gmail.com', '9978075347', 'acharyakush2604@axl.com', '2025-01-02 12:51:53', 'Active', '2025-01-02 12:51:53', 'A3'),
('AF000002', 'Ajay Shah', 'shah.ajay@gmail.com', '9978075347', 'ajayshah@okaxis.com', '2025-01-17 18:54:42', 'Active', '2025-01-17 18:54:42', 'A3');

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
(3, 'AF000001', 'CN000001', 'PJ000001', NULL, 0.00, 5000.00),
(4, 'AF000001', 'CN000005', 'PJ000002', NULL, 0.00, 1250.00),
(7, 'AF000002', 'CN000011', 'PJ000007', NULL, 0.00, 2000.00),
(10, 'AF000001', 'CN000005', 'PJ000006', NULL, 0.00, 12500.00),
(11, 'AF000002', 'CN000005', 'PJ000006', NULL, 0.00, 88500.00);

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
(1, 'AF000001', 'PJ000001', 'AC02', 'BK02', 55.00, 'pol', 'BK04', 'Professional Fees', '455 rto.', '2025-02-02 13:40:16', 'A3'),
(2, 'AF000001', 'PJ000001', 'AC02', 'BK02', 55.00, 'pol', 'BK04', 'Professional Fees', '455 rto.', '2025-02-02 13:40:16', 'A3'),
(3, 'AF000001', 'PJ000001', 'AC01', 'BK01', 78.00, 'mko', 'BK04', 'Reimbursement Voucher', 'bgt', '2025-02-20 14:11:46', 'A3'),
(4, 'AF000001', 'PJ000002', 'AC01', 'BK01', 225.00, 'mmk', 'CC', 'Professional Fees', 'ppol', '2025-02-02 15:21:03', 'A3'),
(7, 'AF000002', 'PJ000007', 'AC02', 'BK02', 153.00, 'lop', 'CC', 'Reimbursement Voucher', 'njo', '2025-02-02 16:32:33', 'A3'),
(8, 'AF000002', 'PJ000007', 'AC01', 'BK01', 316.00, 'l', 'CHEQUE', 'Reimbursement Voucher', 'b', '2025-02-02 16:35:47', 'A3'),
(9, 'AF000001', 'PJ000001', 'AC02', 'BK02', 1.00, 'm', 'CASH', 'Professional Fees', 'b', '2025-02-02 16:37:14', 'A3'),
(11, 'AF000001', 'PJ000002', 'AC04', 'BK04', 1.00, 'mlll', 'CHEQUE', 'Reimbursement Voucher', 'bbm', '2025-02-02 16:48:37', 'A3'),
(13, 'AF000001', 'PJ000001', 'AC04', 'BK04', 500.00, 'mko', 'CHEQUE', 'Professional Fees', 'mklo', '2025-02-03 15:38:46', 'A3'),
(14, 'AF000001', 'PJ000001', 'AC02', 'BK02', 12.00, 'er', 'BK02', 'Professional Fees', 'tr', '2025-02-05 15:40:37', 'A3'),
(15, 'AF000002', 'PJ000007', 'AC03', 'BK03', 1.00, 'zz', 'CASH', 'Professional Fees', 'aa', '2025-02-07 17:53:43', 'A3');

-- --------------------------------------------------------

--
-- Table structure for table `banks`
--

CREATE TABLE `banks` (
  `id` char(8) NOT NULL,
  `firm_id` char(4) NOT NULL,
  `name` varchar(100) NOT NULL,
  `account_number` varchar(50) NOT NULL,
  `ifsc_code` varchar(20) NOT NULL,
  `branch_name` varchar(100) NOT NULL,
  `upi_id` varchar(200) NOT NULL,
  `entry_at` datetime NOT NULL DEFAULT current_timestamp(),
  `entry_by_id` char(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `banks`
--

INSERT INTO `banks` (`id`, `firm_id`, `name`, `account_number`, `ifsc_code`, `branch_name`, `upi_id`, `entry_at`, `entry_by_id`) VALUES
('BK01', 'AC01', 'HDFC Bank Limited', '50200093685321', 'HDFC0000383', 'Naranpura Branch', 'acharyakush2604@axl', '2024-12-17 20:03:18', 'A1'),
('BK02', 'AC02', 'Bandhan Bank', '10210010518171', 'BDBL0001474', 'Panchwati Branch', 'acharyakush2604@axl', '2024-12-17 20:03:18', 'A1'),
('BK03', 'AC03', 'HDFC Bank', '50200061991892', 'HDFC0005064', 'Motera Branch', 'acharyakush2604@axl', '2024-12-17 20:03:18', 'A1'),
('BK04', 'AC04', 'Bank Of Baroda', '18260100014353', 'BARB0BHAIRA', 'Bhairavnath Ahmedabad', 'acharyakush2604@axl', '2024-12-17 20:03:18', 'A1');

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
(1, 'OFEX', 'Tea Stall', 'ramesh.parmar@gmail.com', 8000721554, 'For monthly tea/coffee', '', 0, '', 'parmar.ramesh@axl', '2025-02-04 11:55:20', 'A3'),
(2, 'OFEX', 'Canteen', NULL, NULL, 'Snacks for Clients', '', 0, '', NULL, '2025-02-04 13:12:41', 'A3'),
(3, 'PECA', 'pos', NULL, NULL, 'dsdfsd', '', 0, '', NULL, '2025-02-06 08:59:08', 'A3'),
(4, 'OFEX', 'anuj shah', '', NULL, 'snacks of dskr', '', 0, '', '', '2025-02-10 11:03:02', 'A3'),
(5, 'OFEX', 'mitesh patel', 'mitesh.patel@gmail.com', 9978075347, 'new employee induction expense', '', 0, '', '', '2025-02-06 11:04:39', 'A3'),
(6, 'OTIN', 'abc', '', 0, 'mm', '', 0, '', 'kjdnkajsndkasd', '2025-02-07 12:30:58', 'A3'),
(7, 'OTEX', 'Hello', '', 0, 'Nothing', '', 0, '', '', '2025-02-19 13:01:18', 'A3'),
(8, 'OTIN', 'may payment', '', 0, 'No purpose.', 'ACHARYA KUSH BHADRESH', 516843516816816, 'BOB168181381381', '', '2025-02-20 12:21:55', 'A3'),
(9, 'OTIN', 'xyz', '', 0, 'Purposeless.', 'SHAH MITESH PRAFULCHANDRA', 6846813513813813, 'KTKBNK813813813813', '', '2025-02-20 12:23:16', 'A3'),
(10, 'OTIN', 'Ishita Karia', 'karia.couple@outlook.com', 8000721554, 'Revenge of Bad Treatment', 'Karia Ishita Ravi', 75135974128863, 'SBI845332177866', 'ishita.karya@oksbi', '2025-02-17 13:00:00', 'A3');

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
(3, 1, 'OFEX', 'AC03', 'BK03', 5000.00, 'CHEQUE', 'kjaksdjasdk', 'sdadsajsd', '2025-02-06 08:11:41', 'A3'),
(4, 1, 'OFEX', 'AC02', 'BK02', 565165.00, 'CHEQUE', 'kjsdakjdbjabsd', 'sdadasdasd', '2025-02-06 08:22:53', 'A3'),
(5, 2, 'OFEX', 'AC03', 'BK03', 120.00, 'CC', 'dadasd', '500', '2025-02-25 08:32:40', 'A3'),
(6, 3, 'PECA', 'AC03', 'BK03', 5555.00, 'CC', 'sdfsdfsdf', 'sdadadsasd', '2025-02-06 08:59:52', 'A3'),
(7, 3, 'PECA', 'AC04', 'BK04', 111.00, 'CHEQUE', 'aaaaa', 'dfsdfsdfsdfs', '2025-02-06 09:00:10', 'A3'),
(8, 1, 'OFEX', 'AC04', 'BK04', 5000.00, 'CC', 'snacks for bf', 'no remarks here.', '2025-02-19 13:00:00', 'A3'),
(9, 6, 'OTIN', 'AC01', 'BK01', 1000.00, 'CHEQUE', 'march payment', 'pp', '2025-02-07 12:31:28', 'A3'),
(10, 4, 'OFEX', 'AC01', 'BK01', 9900.00, 'BK01', 'aasd', 'qqwe', '2025-02-08 11:46:05', 'A3'),
(11, 4, 'OFEX', 'AC02', 'BK02', 500.00, 'NETBANKING', 'cccds', 'xxxzxz', '2025-02-08 11:53:47', 'A3'),
(12, 5, 'OFEX', 'AC02', 'BK02', 1000.00, 'CHEQUE', 'pols', '1123', '2025-02-08 11:55:26', 'A3'),
(13, 5, 'OFEX', 'AC03', 'BK03', 1250.00, 'INSTAMOJO', 'lolp', 'ppol', '2025-02-08 12:01:03', 'A3'),
(14, 5, 'OFEX', 'AC02', 'BK02', 1123.00, 'CC', 'zsxcf', 'eert', '2025-02-08 12:01:29', 'A3'),
(15, 7, 'OTEX', 'AC02', 'BK02', 1500.00, 'CC', 'April\'s Birthday Treat', 'No remarks here.', '2025-02-19 13:01:46', 'A3'),
(16, 6, 'OTIN', 'AC03', 'BK03', 1525.00, 'CC', 'april payment', 'Nice one sir.', '2025-02-20 08:47:33', 'A3');

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

--
-- Dumping data for table `cash_flows_transactions`
--

INSERT INTO `cash_flows_transactions` (`id`, `entity_id`, `head_id`, `module_id`, `firm_id`, `bank_id`, `amount`, `particulars`, `payment_source`, `payment_type`, `remarks`, `entry_at`, `entry_by_id`) VALUES
(15, 1, 3, 'OFEX', 'AC03', 'BK03', 500.00, 'dbsjdhb', 'DC', '', 'jdshbjsdf', '2025-02-06 19:23:35', 'A3'),
(16, 1, 3, 'OFEX', 'AC01', 'BK01', 125.00, 'nnn0', 'NETBANKING', '', 'lllm', '2025-02-07 09:00:09', 'A3'),
(17, 1, 4, 'OFEX', 'AC04', 'BK04', 25000.00, 'ccc', 'CHEQUE', '', 'bbbb', '2025-02-07 14:31:13', 'A3'),
(18, 2, 5, 'OFEX', 'AC02', 'BK02', 55.00, 'cvcvb', 'UPI', '', 'deweqexx', '2025-02-07 09:02:24', 'A3'),
(19, 1, 8, 'OFEX', 'AC03', 'BK03', 115.00, 'pppn', 'NETBANKING', '', 'aaa', '2025-02-07 04:03:13', 'A3'),
(20, 6, 9, 'OTIN', 'AC02', 'BK02', 524.00, 'ss123', 'CHEQUE', 'Professional Fees', 'dd', '2025-02-07 12:36:15', 'A3'),
(21, 1, 3, 'OFEX', 'AC02', 'BK02', 750.00, 'mmlpmm', 'CHEQUE', '', 'mkl', '2025-02-08 07:23:08', 'A3'),
(22, 1, 8, 'OFEX', 'AC03', 'BK03', 114.00, 'njkl', 'CHEQUE', '', 'b', '2025-02-08 18:51:06', 'A3'),
(23, 2, 5, 'OFEX', 'AC04', 'BK04', 55.00, 'd', 'CC', '', 'a', '2025-02-08 18:52:06', 'A3'),
(24, 4, 11, 'OFEX', 'AC02', 'BK02', 1250.00, 'm', 'CHEQUE', '', 'b', '2025-02-08 18:52:55', 'A3'),
(25, 7, 15, 'OTEX', 'AC02', 'BK02', 1255.00, 'pols', 'BK02', '', 'pols', '2025-02-20 17:02:13', 'A3'),
(26, 7, 15, 'OTEX', 'AC01', 'BK01', 5.00, 'pol', 'CASH', '', 'bbn', '2025-02-20 17:08:47', 'A3');

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
('CN000001', 'AF000001,AF000002', 'CP000001', 'RF000001', 'Kush Acharya', NULL, 8780577704, 'acharyakush2604@gmail.com', 1, 0, '2024-12-15 15:28:07', NULL, 0, '2024-12-15 15:28:07', NULL),
('CN000002', NULL, 'CP000010', 'RF000002', 'Kevin Vyas', NULL, 8780577812, 'vyas.kevin@outlook.com', 1, 0, '2024-12-18 00:05:18', NULL, 0, '2024-12-18 00:05:18', NULL),
('CN000003', NULL, NULL, 'RF000003', 'Mudra Rawal', NULL, 9601432558, 'mudra.rawal@gmail.com', 0, 0, '2025-01-11 19:15:23', NULL, 0, '2025-01-11 19:15:23', NULL),
('CN000004', NULL, 'CP000003', 'RF000003', 'Parth Acharya', NULL, 8866359953, 'parth.acharya@gmail.com', 1, 0, '2025-01-11 19:45:34', NULL, 0, '2025-01-11 19:45:34', NULL),
('CN000005', 'null,AF000001,AF000002', 'CP000002', 'RF000005', 'Dipen Soni', NULL, 9998733006, 'change@gmail.com', 1, 0, '2025-01-12 11:18:02', NULL, 0, '2025-01-12 11:18:02', NULL),
('CN000006', NULL, NULL, 'RF000003', 'Suresh', NULL, 9099300543, 'suresh@outlook.com', 0, 0, '2025-01-30 19:24:27', NULL, 0, '2025-01-30 19:24:27', NULL),
('CN000007', NULL, 'CP000005', 'RF000013', 'Dilip Kumar', 'We also do not know yet.', 8780577704, 'dilip@gmail.com', 1, 0, '2025-02-01 12:06:43', 'Very good employee', 0, '2025-02-01 12:06:43', NULL),
('CN000008', NULL, NULL, 'RF000014', 'Mr Deelip', NULL, 8780577704, 'sna@sna.com', 0, 0, '2025-02-01 12:07:56', NULL, 0, '2025-02-01 12:07:56', NULL),
('CN000009', NULL, NULL, 'RF000015', 'Wadia', NULL, 15786465465, 'wadia@aidaw.com', 0, 0, '2025-02-01 12:16:46', NULL, 0, '2025-02-01 12:16:46', NULL),
('CN000010', NULL, NULL, 'RF000017', 'Sameer', NULL, 9099300543, 'sameer.patel@yahoo.com', 0, 0, '2025-02-01 13:37:22', NULL, 0, '2025-02-01 13:37:22', NULL),
('CN000011', 'AF000002', 'CP000008', 'RF000018', 'DS', NULL, 9099300543, 'sameer.patel@yahoo.com', 1, 0, '2025-02-01 13:39:02', NULL, 0, '2025-02-01 13:39:02', NULL),
('CN000012', 'AF000002', 'CP000004', 'RF000004', 'Gor Maharaj', NULL, 8000721554, 'abhishek@sal.com', 1, 0, '2025-02-01 13:41:07', NULL, 0, '2025-02-01 13:41:07', NULL);

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
('CP000001', 'CN000001', 'Sun Pharma Pvt Ltd', '07925462408', 'support@sunpharma.com', NULL, 'BBXPA8126Q', NULL, NULL, 500.00, 110.00, '2024-12-17 23:48:41', 'A3'),
('CP000002', 'CN000005', 'Vivek Football Leagues', '8000721554', NULL, NULL, NULL, NULL, NULL, 557.00, 1250088500.00, '2025-01-12 11:41:51', 'A3'),
('CP000003', 'CN000004', 'Mitesh Enterprises', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-01-28 23:46:17', 'A3'),
('CP000004', 'CN000012', 'Being Human', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1000.00, '2025-02-01 13:44:26', 'A3'),
('CP000005', 'CN000007', 'Al Habibi Pvt Ltd', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-02-01 15:26:57', 'A3'),
('CP000006', 'CN000011', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-02-01 15:43:00', 'A3'),
('CP000007', 'CN000011', 'Babul', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-02-01 17:05:28', 'A3'),
('CP000008', 'CN000011', 'Babul', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2000.00, '2025-02-01 17:06:39', 'A3'),
('CP000009', 'CN000001', 'Honey Moon Pharma Pvt Ltd.', '9099300543', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-02-03 22:56:42', 'A3'),
('CP000010', 'CN000002', 'Baal Dupatta Pvt Ltd...', '8866359953', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-02-19 21:44:22', 'A3');

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

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `administrator_id`, `first_name`, `last_name`, `full_name`, `email_address`, `password`, `gender`, `birth_date`, `phone_number`, `address`, `city`, `state`, `designation`, `employment_type`, `employment_status`, `joining_date`, `termination_date`, `termination_reason`, `access_revoked`, `revocation_reason`, `permissions`, `entry_at`, `entry_by_id`, `notes`) VALUES
('EP000001', 'A2', 'Aishwarya', 'Mandal', 'Aishwarya Mandal', 'aishwarya', 'aishwarya@123', 'Female', '2000-01-15', '9978075347', 'AFF8, Aakansha Flats, Opp Jaymala Cross Roads, Isanpur', 'Ahmedabad', 'Gujarat', 'Compliance Associate', 'Annually Confirmed', 'Active', '2025-02-17 19:58:56', NULL, NULL, 0, NULL, '41,43,49,47,35,36,38,18,19,21,24,26,28,30,31,34,17,16,14,10,6,5,2,1', '2025-02-17 19:58:56', 'A3', NULL);

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
('IQ000001', 'CN000001', 'RF000001', 'MP000004', 'SP000003', '2024-12-15 09:39:42', 8780577704, 'acharyakush2604@gmail.com', 'A1,A2', 0, 0, '', 2500.00, 'Confirmed', NULL, '2024-12-15 15:28:07', 'A3'),
('IQ000002', 'CN000002', 'RF000002', 'MP000011', 'SP000004', '2024-12-18 12:00:00', 8780577812, 'vyas.kevin@outlook.com', 'A1,A3', 0, 0, '', 15080.00, 'Open', NULL, '2024-12-18 00:05:18', 'A3'),
('IQ000003', 'CN000003', 'RF000003', 'MP000006', 'SP000012', '2025-01-10 12:00:00', 9601432558, 'mudra.rawal@gmail.com', 'A1,A2', 0, 0, '', 7520.00, 'Hold', NULL, '2025-01-11 19:15:23', 'A3'),
('IQ000004', 'CN000002', 'RF000004', 'MP000005', 'SP000011', '2025-01-06 12:00:00', 9000000000, 'vyas.kevin@outlook.com', 'A1,A3', 0, 0, '', 8550.00, 'Hold', NULL, '2025-01-11 19:32:46', 'A3'),
('IQ000005', 'CN000004', 'RF000003', 'MP000012', 'SP000023', '2025-01-05 14:13:11', 8866359953, 'parth.acharya@gmail.com', 'A1', 0, 0, NULL, 2000.00, 'Confirmed', NULL, '2025-01-11 19:45:34', 'A3'),
('IQ000006', 'CN000003', 'RF000003', 'MP000003', 'SP000007', '2025-01-02 14:24:03', 9601432558, 'mudra.rawal@gmail.com', 'A2', 1, 0, 'I am done with this work.', 10000.00, 'Closed', NULL, '2025-01-11 19:54:38', 'A3'),
('IQ000007', 'CN000005', 'RF000005', 'MP000001', 'SP000010', '2025-01-12 12:00:00', 9909436171, 'sony.dipens@gmail.com', 'A2', 0, 0, NULL, 5000.00, 'Confirmed', NULL, '2025-01-12 11:18:02', 'A3'),
('IQ000008', 'CN000001', 'RF000001', 'MP000005', 'SP000014', '2025-01-12 09:05:32', 8780577704, 'acharyakush2604@gmail.com', 'A1,A3', 0, 0, '', 123345.00, 'Confirmed', NULL, '2025-01-12 14:36:15', 'A3'),
('IQ000009', 'CN000006', 'RF000003', 'MP000002', 'SP000002', '2025-02-06 13:47:30', 9978075347, 'suresh@gmail.com', 'A3', 0, 0, NULL, 2500.00, 'Open', NULL, '2025-01-30 19:24:27', 'A3'),
('IQ000010', 'CN000007', 'RF000013', 'MP000005', 'SP000036', '2025-01-22 06:33:22', 8780577704, 'na@na.com', 'A2', 1, 0, '#Hashtag@ 123', 1800000.00, 'Confirmed', NULL, '2025-02-01 12:06:43', 'A3'),
('IQ000011', 'CN000008', 'RF000014', 'MP000011', 'SP000037', '2025-01-22 06:36:55', 8780577704, 'sna@sna.com', 'A2,A1,A3', 0, 0, NULL, 1800000.00, 'Open', NULL, '2025-02-01 12:07:56', 'A3'),
('IQ000012', 'CN000009', 'RF000015', 'MP000002', 'SP000004', '2024-12-20 12:00:00', 2222222222, 'wadia@gmail.com', 'A3', 0, 0, NULL, 250000.00, 'Open', NULL, '2025-02-01 12:16:46', 'A3'),
('IQ000013', 'CN000005', 'RF000016', 'MP000007', 'SP000006', '2025-03-03 06:47:14', 9909436171, 'sony.dipens@gmail.com', 'A1,A2,A3', 0, 0, NULL, 500.00, 'Confirmed', NULL, '2025-02-01 12:18:42', 'A3'),
('IQ000014', 'CN000011', 'RF000018', 'MP000006', 'SP000039', '2025-02-20 08:06:02', 9099300543, 'sameer.patel@yahoo.com', 'A3', 1, 0, 'Not Interested.', 30002.00, 'Confirmed', NULL, '2025-02-01 13:39:02', 'A3'),
('IQ000015', 'CN000012', 'RF000004', 'MP000011', 'SP000025', '2025-02-01 08:09:55', 254546816846, 'salma@salim.com', 'A3', 0, 0, '', 85000.00, 'Confirmed', NULL, '2025-02-01 13:41:07', 'A3'),
('IQ000016', 'CN000001', 'RF000001', 'MP000001', 'SP000003', '2025-03-05 08:11:12', 8780577704, 'acharyakush2604@gmail.com', 'A2', 0, 0, '', 50075.00, 'Hold', NULL, '2025-02-01 13:42:18', 'A3'),
('IQ000017', 'CN000012', 'RF000004', 'MP000002', 'SP000002', '2025-02-01 12:00:00', 9999999999, 'abhishek@sal.com', 'A3', 0, 0, NULL, 10000.00, 'Open', NULL, '2025-02-01 13:59:08', 'A3'),
('IQ000018', 'CN000002', 'RF000002', 'MP000003', 'SP000040', '2025-02-11 15:17:00', 8780577812, 'vyas.kevin@outlook.com', 'A2,A3', 0, 0, '', 8410.00, 'Confirmed', NULL, '2025-02-11 20:48:04', 'A3');

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` int(11) NOT NULL,
  `custom_id` varchar(100) NOT NULL,
  `client_id` char(8) DEFAULT NULL,
  `project_id` char(8) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL CHECK (`amount` >= 0),
  `amount_received` decimal(10,2) NOT NULL DEFAULT 0.00,
  `due_date` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `receipt_date` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`id`, `custom_id`, `client_id`, `project_id`, `amount`, `amount_received`, `due_date`, `created_at`, `receipt_date`) VALUES
(1, 'SA/2025-26/00001', 'CN000001', 'PJ000001', 5750.00, 127.00, '2025-01-24 20:03:34', '2025-01-17 22:25:48', '2025-01-17 22:25:48'),
(2, 'BF/2025-26/00002', 'CN000005', 'PJ000002', 2500.00, 557.00, '2025-01-24 20:03:34', '2025-01-17 22:26:51', '2025-01-17 22:26:51'),
(3, 'PS/2024-25/00003', 'CN000004', 'PJ000003', 2050.00, 0.00, NULL, '2025-02-15 22:05:58', '2025-02-15 16:33:49'),
(4, 'SA/2024-25/00004', 'CN000007', 'PJ000005', 515000.00, 0.00, NULL, '2025-02-20 19:52:05', '2025-02-20 14:21:55'),
(5, 'SA/2024-25/00005', 'CN000005', 'PJ000006', 500.00, 0.00, NULL, '2025-02-20 19:54:57', '2025-02-20 14:24:50'),
(6, 'PS/2024-25/00006', 'CN000012', 'PJ000004', 80000.00, 17000.00, NULL, '2025-02-20 19:55:49', '2025-02-20 14:25:43'),
(7, 'SA/2024-25/00007', 'CN000011', 'PJ000007', 30002.00, 0.00, NULL, '2025-02-20 19:57:13', '2025-02-20 14:27:04'),
(8, 'PS/2024-25/00008', 'CN000001', 'PJ000008', 14856.00, 0.00, NULL, '2025-02-20 19:57:39', '2025-02-20 14:27:33');

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
(1, 'SA/2025-26/00001', 'PJ000001', '2025-01-27 16:31:10', 'Jan-March Installments', 500.00, 'DC'),
(2, 'SA/2025-26/00001', 'PJ000001', '2025-01-30 17:18:47', 'Happy New Year.', 155.00, 'CASH'),
(3, 'SA/2025-26/00001', 'PJ000001', '2025-02-06 17:34:17', 'Good evening.', 855.00, 'BK01'),
(4, '', 'PJ000004', '2025-02-01 15:02:16', 'Salman crushed one person on footpath. ', 15000.00, 'CHEQUE'),
(5, '', 'PJ000004', '2025-02-01 15:02:34', 'Arbaz did the same too.', 2000.00, 'NETBANKING');

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
(1, 'IQ000001', NULL, NULL, 'A3', 'A3', 'New client. Reference from CharteredWorks.', 'Inquiries', '2024-12-15 15:28:07'),
(2, 'IQ000001', NULL, NULL, 'A3', 'A3', 'Test inquiry.', 'Inquiries', '2024-12-16 20:52:47'),
(3, 'IQ000001', NULL, NULL, 'A3', 'A3', 'Inquiry note #3', 'Inquiries', '2024-12-16 20:54:45'),
(10, 'IQ000001', 'PJ000001', 'TK000001', 'A3', 'A3', 'First project. Wish me good luck.', 'Projects', '2024-12-17 23:48:41'),
(11, 'IQ000002', NULL, NULL, 'A3', 'A3', 'Lives in Portugal.', 'Inquiries', '2024-12-18 00:05:18'),
(12, 'IQ000003', NULL, NULL, '', 'A3', 'This client is sister of Kush Acharya', 'Inquiries', '2025-01-11 19:15:23'),
(13, 'IQ000004', NULL, NULL, '', 'A3', 'The client is the friend of brother of Kush Acharya', 'Inquiries', '2025-01-11 19:32:46'),
(14, 'IQ000005', NULL, NULL, '', 'A3', 'The client is the first cousin of Kush Acharya', 'Inquiries', '2025-01-11 19:45:34'),
(15, 'IQ000006', NULL, NULL, '', 'A3', 'The client is the sister of Kush Acharya', 'Inquiries', '2025-01-11 19:54:38'),
(16, 'IQ000001', NULL, NULL, '', 'A3', '2025 Note.', 'Inquiries', '2025-01-11 23:45:49'),
(17, 'IQ000001', NULL, NULL, '', 'A3', 'Hello.', 'Inquiries', '2025-01-11 23:46:31'),
(18, 'IQ000004', NULL, NULL, '', 'A3', 'The client lives in Portugal.', 'Inquiries', '2025-01-11 23:46:51'),
(19, 'IQ000007', NULL, NULL, '', 'A3', 'The client is the flat friend of Kevin Vyas.', 'Inquiries', '2025-01-12 11:18:02'),
(20, 'IQ000007', 'PJ000002', NULL, 'A3', 'A3', 'This is a projects test.', 'Projects', '2025-01-12 11:41:51'),
(21, 'IQ000008', NULL, NULL, '', 'A3', 'Hello There.', 'Inquiries', '2025-01-12 14:36:15'),
(22, 'IQ000005', 'PJ000003', NULL, 'A3', 'A3', 'None.', 'Projects', '2025-01-28 23:46:17'),
(23, 'IQ000009', NULL, NULL, '', 'A3', 'sdfsdfsdfs', 'Inquiries', '2025-01-30 19:24:27'),
(24, 'IQ000010', NULL, NULL, '', 'A3', 'Hello.', 'Inquiries', '2025-02-01 12:06:43'),
(25, 'IQ000011', NULL, NULL, '', 'A3', 'Nice Guy To Work With.', 'Inquiries', '2025-02-01 12:07:56'),
(26, 'IQ000012', NULL, NULL, '', 'A3', 'Testing note.', 'Inquiries', '2025-02-01 12:16:46'),
(27, 'IQ000013', NULL, NULL, '', 'A3', '@#...', 'Inquiries', '2025-02-01 12:18:42'),
(28, 'IQ000014', NULL, NULL, '', 'A3', 'Notes #1.', 'Inquiries', '2025-02-01 13:39:02'),
(29, 'IQ000015', NULL, NULL, '', 'A3', 'Hello. Hello. Hello.', 'Inquiries', '2025-02-01 13:41:07'),
(30, 'IQ000016', NULL, NULL, '', 'A3', 'Lol.', 'Inquiries', '2025-02-01 13:42:18'),
(31, 'IQ000015', 'PJ000004', NULL, 'A3', 'A3', 'Nothing Important.', 'Projects', '2025-02-01 13:44:26'),
(32, 'IQ000017', NULL, NULL, '', 'A3', 'Lol.', 'Inquiries', '2025-02-01 13:59:08'),
(33, 'IQ000010', 'PJ000005', NULL, 'A3', 'A3', 'Where does the RV amount go?', 'Projects', '2025-02-01 15:26:57'),
(34, 'IQ000013', 'PJ000006', NULL, 'A3', 'A3', 'Lol.', 'Projects', '2025-02-01 15:41:09'),
(35, 'IQ000014', 'PJ000007', NULL, 'A3', 'A3', 'NA', 'Projects', '2025-02-01 15:43:00'),
(36, 'IQ000008', 'PJ000008', NULL, 'A3', 'A3', 'vbnm', 'Projects', '2025-02-03 22:56:42'),
(37, 'IQ000018', NULL, NULL, '', 'A3', 'Hello.', 'Inquiries', '2025-02-11 20:48:04'),
(38, 'IQ000018', 'PJ000009', NULL, 'A3', 'A3', 'Norms.', 'Projects', '2025-02-19 21:44:22');

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
(2, 'AC04', 25.00, 0.00, 975.00, 'Hello', 'Withdrawn from Bank', 'Yellow', '2025-02-09 08:42:46', 'A3'),
(3, 'AC01', 300.00, 0.00, 675.00, 'Nice', 'Office', 'Bye', '2025-02-09 08:43:35', 'A3'),
(4, 'AC04', 75.00, 0.00, 600.00, 'Lol', 'Others', 'Pol', '2025-02-09 08:44:09', 'A3'),
(6, 'AC01', 0.00, 55.00, 655.00, 'Hey', 'Others', 'Hi', '2025-02-09 08:46:17', 'A3'),
(7, 'AC03', 0.00, 45.00, 700.00, 'Rice', 'Withdrawn from Bank', 'Water', '2025-02-09 08:46:39', 'A3'),
(8, 'AC03', 30.00, 0.00, 670.00, 'Op', 'Office', 'Ops', '2025-02-09 08:47:02', 'A3');

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
('PJ000001', 'AF000001,AF000002', 'CN000001', 'CP000001', 'AC01', 'PJ1/22/12/2024', 'IQ000001', 'MP000004', 'SP000003', '2024-12-15 04:09:42', '2025-02-01 16:22:15', '2024-12-17 23:48:41', 5750.00, 575.00, 110.00, '', 'Active', 'A3,A2', 0, 0, '2024-12-17 23:48:41', 'A3'),
('PJ000002', 'AF000001', 'CN000005', 'CP000002', 'AC02', NULL, 'IQ000007', 'MP000001', 'SP000010', '2025-01-30 21:23:36', '2025-01-30 00:51:35', '2025-01-12 11:41:51', 2500.00, 1500.00, 1250.00, NULL, 'Completed', 'A3', 0, 0, '2025-01-12 11:41:51', 'A3'),
('PJ000003', NULL, 'CN000004', 'CP000003', 'AC03', NULL, 'IQ000005', 'MP000012', 'SP000023', '2025-01-04 18:30:00', NULL, '2025-01-28 23:46:17', 2050.00, 1500.00, NULL, 'mm', 'Hold', 'A1', 0, 0, '2025-01-28 23:46:17', 'A3'),
('PJ000004', '', 'CN000012', 'CP000004', 'AC03', NULL, 'IQ000015', 'MP000011', 'SP000025', '2025-01-31 18:30:00', NULL, '2025-02-01 13:44:26', 80000.00, 15000.00, 1000.00, '', 'Active', 'A3,A1', 0, 0, '2025-02-01 13:44:26', 'A3'),
('PJ000005', NULL, 'CN000007', 'CP000005', 'AC01', NULL, 'IQ000010', 'MP000005', 'SP000036', '2026-07-12 18:30:00', NULL, '2025-02-01 15:26:57', 515000.00, 15000.00, NULL, '', 'Active', 'A2', 0, 0, '2025-02-01 15:26:57', 'A3'),
('PJ000006', 'AF000001,AF000002', 'CN000005', 'CP000002', 'AC01', NULL, 'IQ000013', 'MP000007', 'SP000006', '2025-03-02 18:30:00', NULL, '2025-02-01 15:41:09', 500.00, 100.00, 99999999.99, '', 'Active', 'A1,A2,A3', 0, 0, '2025-02-01 15:41:09', 'A3'),
('PJ000007', 'AF000002', 'CN000011', 'CP000008', 'AC01', NULL, 'IQ000014', 'MP000006', 'SP000039', '2025-02-19 13:00:00', NULL, '2025-02-01 15:43:00', 30002.00, 30000.00, 2000.00, '', 'Active', 'A3', 0, 0, '2025-02-01 15:43:00', 'A3'),
('PJ000008', NULL, 'CN000001', 'CP000009', 'AC03', NULL, 'IQ000008', 'MP000005', 'SP000014', '2025-01-11 18:30:00', NULL, '2025-02-03 22:56:42', 14856.00, 14856.00, NULL, NULL, 'Active', 'A1,A3', 0, 0, '2025-02-03 22:56:42', 'A3'),
('PJ000009', NULL, 'CN000002', 'CP000010', 'AC01', NULL, 'IQ000018', 'MP000003', 'SP000040', '2025-02-10 18:30:00', NULL, '2025-02-19 21:44:22', 8410.00, 8410.00, NULL, NULL, 'Active', 'A2,A3', 0, 0, '2025-02-19 21:44:22', 'A3');

-- --------------------------------------------------------

--
-- Table structure for table `projects_settings`
--

CREATE TABLE `projects_settings` (
  `id` int(11) NOT NULL,
  `key` varchar(200) NOT NULL,
  `value` varchar(5000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `projects_settings`
--

INSERT INTO `projects_settings` (`id`, `key`, `value`) VALUES
(1, 'statuses', '[\"Active\", \"Cancelled\", \"Closed\", \"Completed\", \"Hold\"]');

-- --------------------------------------------------------

--
-- Table structure for table `rv`
--

CREATE TABLE `rv` (
  `id` int(11) NOT NULL,
  `custom_id` varchar(100) NOT NULL,
  `client_id` char(8) DEFAULT NULL,
  `project_id` char(8) DEFAULT NULL,
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

INSERT INTO `rv` (`id`, `custom_id`, `client_id`, `project_id`, `amount`, `amount_received`, `amount_pending`, `due_date`, `created_at`, `receipt_date`) VALUES
(1, 'SA/2024-25/00001', 'CN000001', 'PJ000001', 5750.00, 1292.00, 11516.00, '2025-02-16 11:17:15', '2025-02-09 16:47:19', '2025-02-09 11:17:15'),
(2, 'PS/2024-25/00002', 'CN000004', 'PJ000003', 2050.00, 1200.00, 1300.00, '2025-02-22 17:02:30', '2025-02-15 22:32:38', '2025-02-15 17:02:30');

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

--
-- Dumping data for table `rv_transactions`
--

INSERT INTO `rv_transactions` (`id`, `rv_custom_id`, `project_id`, `entry_at`, `particulars`, `amount`, `source`) VALUES
(3, '', 'PJ000001', '2025-02-09 10:33:39', 'Received from client', 1222.00, 'BK01'),
(4, '', 'PJ000001', '2025-02-09 10:49:27', 'lols', 70.00, 'CC'),
(5, '', 'PJ000002', '2025-02-11 16:21:17', 'pppp', 1300.00, 'CHEQUE'),
(6, '', 'PJ000003', '2025-02-11 17:50:32', 'mmm', 500.00, 'BK03'),
(7, '', 'PJ000003', '2025-02-11 17:50:40', 'ppp', 150.00, 'CASH'),
(8, '', 'PJ000003', '2025-02-11 17:54:57', 'pol', 250.00, 'CC'),
(9, '', 'PJ000003', '2025-02-11 17:56:32', 'mmm', 100.00, 'UPI'),
(10, '', 'PJ000003', '2025-02-11 18:03:08', 'pol.', 100.00, 'CASH'),
(11, '', 'PJ000003', '2025-02-11 18:04:29', 'pol,.', 100.00, 'CC');

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
('SP000029', 'Trademark Reply', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000030', 'Halal Certificates', '2025-02-01 11:55:04', 'A3', '2025-02-01 11:55:04', NULL, NULL),
('SP000031', 'Halal Certificates', '2025-02-01 11:58:18', 'A3', '2025-02-01 11:58:18', NULL, NULL),
('SP000032', 'Halal Certificates', '2025-02-01 11:59:20', 'A3', '2025-02-01 11:59:20', NULL, NULL),
('SP000033', 'Halal Certificates', '2025-02-01 12:00:15', 'A3', '2025-02-01 12:00:15', NULL, NULL),
('SP000034', 'Halala Certificates', '2025-02-01 12:04:19', 'A3', '2025-02-01 12:04:19', NULL, NULL),
('SP000035', 'Halala Certificates', '2025-02-01 12:06:12', 'A3', '2025-02-01 12:06:12', NULL, NULL),
('SP000036', 'Halala Certificates', '2025-02-01 12:06:43', 'A3', '2025-02-01 12:06:43', NULL, NULL),
('SP000037', 'Halalaa Certificates', '2025-02-01 12:07:56', 'A3', '2025-02-01 12:07:56', NULL, NULL),
('SP000038', 'Yakhni Pulao', '2025-02-01 13:37:22', 'A3', '2025-02-01 13:37:22', NULL, NULL),
('SP000039', 'Yakhni Pulao', '2025-02-01 13:39:02', 'A3', '2025-02-01 13:39:02', NULL, NULL),
('SP000040', 'rajkamal bakery', '2025-02-11 20:48:04', 'A3', '2025-02-11 20:48:04', NULL, NULL);

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
(1, 'TK000001', 'PJ000001', 'Accounts settlement', 'Send documents to CA', 1, 'By Administrator', 'A3', '2024-12-27 19:50:22'),
(2, 'TK000001', 'PJ000001', 'Ledger of Loans.', 'Check CIBIL score for loan eligibility.', 1, 'By Administrator', 'A3', '2024-12-27 19:50:22'),
(3, 'TK000001', 'PJ000001', 'Prepare documents for loads.', 'Get them from storage servers', 1, 'By Administrator', 'A3', '2024-12-27 19:51:20'),
(4, 'TK000001', 'PJ000001', 'Prepare form for submissions', 'First take permission from DS', 1, 'By Administrator', 'A3', '2024-12-27 19:51:20'),
(5, 'TK000001', 'PJ000001', 'Check status online', 'Make sure the internet connectivity is normal.', 1, 'By Administrator', 'A3', '2024-12-27 19:52:15'),
(6, 'TK000001', 'PJ000001', 'Pay & Upload', 'No remarks here.', 1, 'By Administrator', 'A3', '2024-12-27 19:52:15'),
(7, 'TK000001', 'PJ000001', 'Hello', 'Bellow', 1, 'By Administrator', 'A3', '2025-01-01 23:44:39'),
(8, 'TK000001', 'PJ000001', 'Hi', 'Bye', 1, 'By Administrator', 'A3', '2025-01-01 23:45:36'),
(9, 'TK000002', 'PJ000001', 'Particular #1', 'Remark #1', 1, 'By Administrator', 'A3', '2025-01-02 20:27:03'),
(10, 'TK000002', 'PJ000001', 'Particular #21', 'Remark #23', 1, 'By Administrator', 'A3', '2025-01-14 13:44:25'),
(13, 'TK000005', 'PJ000002', 'Trello', 'Yellow', 1, 'By Administrator', 'A3', '2025-01-25 17:27:00'),
(15, 'TK000005', 'PJ000002', 'Nice', 'One', 1, 'By Administrator', 'A3', '2025-01-25 17:29:19'),
(17, 'TK000006', 'PJ000002', 'Hello', 'Bello', 1, 'By Administrator', 'A3', '2025-01-30 00:15:32'),
(18, 'TK000008', 'PJ000002', 'Like', 'Mike', 1, 'By Administrator', 'A3', '2025-01-30 00:29:00'),
(19, 'TK000007', 'PJ000003', 'His', 'Byes', 1, 'By Administrator', 'A3', '2025-01-31 23:01:12'),
(21, 'TK000003', 'PJ000001', 'adnaannnnnnnnnnnnnn', 'cv', 1, 'By Administrator', 'A3', '2025-02-01 16:01:35'),
(22, 'TK000003', 'PJ000001', 'r', 't', 1, 'By Administrator', 'A3', '2025-02-01 16:01:43'),
(25, 'TK000009', 'PJ000004', 'v', 'b', 0, NULL, 'A3', '2025-02-01 16:28:33'),
(27, 'TK000011', 'PJ000007', 'v', 'g', 0, NULL, 'A3', '2025-02-01 16:29:29'),
(29, 'TK000012', 'PJ000001', 'lol', 'pl;s', 1, 'By Administrator', 'A3', '2025-02-05 20:13:33'),
(30, 'TK000012', 'PJ000001', 'vbcb', 'sdadasdasd', 1, 'By Administrator', 'A3', '2025-02-05 22:21:07'),
(31, 'TK000013', 'PJ000001', 'mop', 'mlp', 0, NULL, 'A3', '2025-02-05 23:10:53'),
(32, 'TK000013', 'PJ000001', 'abc', 'bcd', 0, NULL, 'A3', '2025-02-06 18:33:29'),
(33, 'TK000013', 'PJ000001', 'pol', 'mkop', 0, NULL, 'A3', '2025-02-06 18:33:37'),
(34, 'TK000011', 'PJ000007', 'nice', 'nice', 0, NULL, 'A3', '2025-02-19 21:56:22');

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
('TK000001', 'CN000001', 'PJ000001', 'Task #1', '2025-01-21', 5100.00, 'Nice.', 1, 0, NULL, '2025-02-05 22:14:55', 'A3'),
('TK000002', 'CN000001', 'PJ000001', 'Task #3', '2025-01-15', 450.00, 'Hello.', 1, 0, NULL, '2025-02-05 22:14:55', 'A3'),
('TK000003', 'CN000001', 'PJ000001', 'Task #2', '2025-02-11', 1500.00, 'yyyyy', 1, 0, NULL, '2025-02-05 22:14:55', 'A3'),
('TK000005', 'CN000005', 'PJ000002', 'Task #1', '2025-02-01', 500.00, 'Yes.', 1, 0, NULL, '2025-02-05 22:14:55', 'A3'),
('TK000006', 'CN000005', 'PJ000002', 'Task #2', '2025-02-01', 750.00, 'Lol.', 1, 0, NULL, '2025-02-05 22:14:55', 'A3'),
('TK000007', 'CN000004', 'PJ000003', 'Tasks @1', '2025-03-05', 2500.00, 'bbbb', 1, 0, NULL, '2025-02-05 22:14:55', 'A3'),
('TK000008', 'CN000005', 'PJ000002', 'One', '2025-02-06', 50.00, 'Done.', 1, 0, NULL, '2025-02-05 22:14:55', 'A3'),
('TK000009', 'CN000012', 'PJ000004', 'pop', '2024-12-08', 4545.00, NULL, 0, 0, NULL, '2025-02-05 22:14:55', 'A3'),
('TK000011', 'CN000011', 'PJ000007', 'zzz', '2025-02-10', 0.00, NULL, 0, 0, NULL, '2025-02-05 22:14:55', 'A3'),
('TK000012', 'CN000001', 'PJ000001', 'Task #4', '2025-02-08', 158.00, 'bbnju', 1, 0, NULL, '2025-02-05 22:14:55', 'A3'),
('TK000013', 'CN000001', 'PJ000001', 'Task #567', '2025-02-12', 0.00, 'bjhbj', 0, 0, NULL, '2025-02-05 22:14:55', 'A3'),
('TK000014', 'CN000001', 'PJ000001', 'Task #6', '2025-02-12', 0.00, NULL, 0, 0, NULL, '2025-02-05 22:14:55', 'A3'),
('TK000015', 'CN000001', 'PJ000001', 'Task #7', '2025-02-12', 0.00, NULL, 0, 0, NULL, '2025-02-05 22:14:55', 'A3'),
('TK000016', 'CN000001', 'PJ000001', 'Task #8', '2025-02-12', 0.00, NULL, 0, 0, NULL, '2025-02-05 22:14:55', 'A3'),
('TK000017', 'CN000001', 'PJ000001', 'Task #9', '2025-02-12', 0.00, NULL, 0, 0, NULL, '2025-02-05 22:14:55', 'A3'),
('TK000018', 'CN000001', 'PJ000001', 'Task #10', '2025-02-12', 0.00, NULL, 0, 0, NULL, '2025-02-05 22:14:55', 'A3'),
('TK000019', 'CN000001', 'PJ000001', 'Task #11', '2025-02-27', 5600.00, NULL, 0, 0, NULL, '2025-02-05 22:14:55', 'A3'),
('TK000020', 'CN000005', 'PJ000006', 'pol', '2025-02-12', 0.00, NULL, 0, 0, NULL, '2025-02-05 23:39:46', 'A3'),
('TK000021', 'CN000011', 'PJ000007', 'lols.', '2025-02-26', 0.00, 'not worth it.', 0, 1, NULL, '2025-02-19 21:56:28', 'A3');

-- --------------------------------------------------------

--
-- Table structure for table `tasks_settings`
--

CREATE TABLE `tasks_settings` (
  `id` int(11) NOT NULL,
  `key` varchar(200) NOT NULL,
  `value` varchar(5000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tasks_settings`
--

INSERT INTO `tasks_settings` (`id`, `key`, `value`) VALUES
(1, 'due_date_days_from_today', '7');

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
('RF000001', 'CN000001', 'Yash Chopra', NULL, NULL, NULL, 0, '2024-12-15 15:28:07', NULL, NULL, 0, NULL, NULL, '2024-12-15 15:28:07', NULL),
('RF000002', 'CN000002', 'Vrushank Soni', NULL, NULL, NULL, 0, '2024-12-18 00:05:18', NULL, NULL, 0, NULL, NULL, '2024-12-18 00:05:18', NULL),
('RF000003', 'CN000003', 'Krishna Patel', NULL, NULL, NULL, 0, '2025-01-11 19:15:23', NULL, NULL, 0, NULL, NULL, '2025-01-11 19:15:23', NULL),
('RF000004', 'CN000002', 'Ronak Patel', NULL, NULL, NULL, 0, '2025-01-11 19:32:46', NULL, NULL, 0, NULL, NULL, '2025-01-11 19:32:46', NULL),
('RF000005', 'CN000005', 'Ritesh Rami', NULL, NULL, NULL, 0, '2025-01-12 11:18:02', NULL, NULL, 0, NULL, NULL, '2025-01-12 11:18:02', NULL),
('RF000006', 'CN000007', 'Suresh Kumar', NULL, NULL, NULL, 0, '2025-02-01 11:53:12', NULL, NULL, 0, NULL, NULL, '2025-02-01 11:53:12', NULL),
('RF000007', 'CN000007', 'Suresh Kumar', NULL, NULL, NULL, 0, '2025-02-01 11:55:04', NULL, NULL, 0, NULL, NULL, '2025-02-01 11:55:04', NULL),
('RF000008', 'CN000007', 'Suresh Kumar', NULL, NULL, NULL, 0, '2025-02-01 11:58:18', NULL, NULL, 0, NULL, NULL, '2025-02-01 11:58:18', NULL),
('RF000009', 'CN000007', 'Suresh Kumar', NULL, NULL, NULL, 0, '2025-02-01 11:59:20', NULL, NULL, 0, NULL, NULL, '2025-02-01 11:59:20', NULL),
('RF000010', 'CN000007', 'Suresh Kumar', NULL, NULL, NULL, 0, '2025-02-01 12:00:15', NULL, NULL, 0, NULL, NULL, '2025-02-01 12:00:15', NULL),
('RF000011', 'CN000007', 'Abhishek Patel', NULL, NULL, NULL, 0, '2025-02-01 12:04:19', NULL, NULL, 0, NULL, NULL, '2025-02-01 12:04:19', NULL),
('RF000012', 'CN000007', 'Abhishek Patel', NULL, NULL, NULL, 0, '2025-02-01 12:06:12', NULL, NULL, 0, NULL, NULL, '2025-02-01 12:06:12', NULL),
('RF000013', 'CN000007', 'Abhishek Patel', NULL, NULL, NULL, 0, '2025-02-01 12:06:43', NULL, NULL, 0, NULL, NULL, '2025-02-01 12:06:43', NULL),
('RF000014', 'CN000008', 'Abhishek Ruchi', NULL, NULL, NULL, 0, '2025-02-01 12:07:55', NULL, NULL, 0, NULL, NULL, '2025-02-01 12:07:55', NULL),
('RF000015', 'CN000009', 'Prity Zinta', NULL, NULL, NULL, 0, '2025-02-01 12:16:45', NULL, NULL, 0, NULL, NULL, '2025-02-01 12:16:45', NULL),
('RF000016', 'CN000005', 'Dipen Soni', NULL, NULL, NULL, 0, '2025-02-01 12:18:42', NULL, NULL, 0, NULL, NULL, '2025-02-01 12:18:42', NULL),
('RF000017', 'CN000010', 'Hameer', NULL, NULL, NULL, 0, '2025-02-01 13:37:21', NULL, NULL, 0, NULL, NULL, '2025-02-01 13:37:21', NULL),
('RF000018', 'CN000011', 'Hameer', NULL, NULL, NULL, 0, '2025-02-01 13:39:02', NULL, NULL, 0, NULL, NULL, '2025-02-01 13:39:02', NULL);

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
('VD000001', 'Anuj', 'anuj@gandhi.com', '9978075347', 'anuj.gandhi@oksbi', '2025-02-06 14:14:32', 'Active', '2025-02-06 14:14:32', 'A3'),
('VD000002', 'Manish Patel', 'manish.patel@gmail.com', '9978075347', 'manish.patel@oksbi', '2025-02-12 14:36:48', 'Active', '2025-02-12 14:36:48', 'A3'),
('VD000003', 'Riya Patel', 'riya.patel@gmail.com', '8866359953', 'riya.patel@oksbi', '2025-02-19 17:23:47', 'Active', '2025-02-19 17:23:47', 'A3');

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
('VH000001', 'VD000001', 'AC02', 'BK02', 9999.00, 'CHEQUE', 'Ramesh Bhai Tea Seller', 'Great Taste', '2025-02-11 12:14:38', 'A3'),
('VH000002', 'VD000001', 'AC02', 'BK02', 1250.00, 'CHEQUE', 'Airtel Broadband Internet', 'Paying via cheque.', '2025-02-12 09:07:45', 'A3'),
('VH000003', 'VD000002', 'AC03', 'BK03', 5000.00, 'UPI', 'Office Sweeper', 'Cleans efficiently.', '2025-02-10 09:12:00', 'A3'),
('VH000004', 'VD000003', 'AC03', 'BK03', 1000.00, 'CC', 'January EMI', 'Remark #1', '2025-02-19 11:53:56', 'A3');

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
-- Dumping data for table `vendors_transactions`
--

INSERT INTO `vendors_transactions` (`id`, `vendor_id`, `head_id`, `firm_id`, `bank_id`, `amount`, `particulars`, `payment_source`, `payment_type`, `remarks`, `entry_at`, `entry_by_id`) VALUES
(1, 'VD000001', 'VH000001', 'AC02', 'BK02', 500.00, 'sed', 'CASH', 'Reimbursement Voucher', 'sedddd', '2025-02-12 16:14:07', 'A3'),
(2, 'VD000001', 'VH000001', 'AC01', 'BK01', 125.00, 'Call', 'CASH', 'Professional Fees', 'Mall', '2025-02-19 18:54:05', 'A3'),
(3, 'VD000002', 'VH000003', 'AC02', 'BK02', 1525.00, 'Hello', 'CASH', 'Professional Fees', 'Yellow', '2025-02-19 18:59:35', 'A3'),
(4, 'VD000001', 'VH000002', 'AC01', 'BK01', 100.00, 'Nice', 'INSTAMOJO', 'Reimbursement Voucher', 'Rice', '2025-02-19 19:03:26', 'A3'),
(5, 'VD000001', 'VH000001', 'AC02', 'BK02', 100.00, 'Pols.', 'BK02', '', 'Lols.', '2025-02-20 16:28:30', 'A3'),
(6, 'VD000001', 'VH000001', 'AC02', 'BK02', 6.00, 'Pols.', 'CC', '', 'Lols.', '2025-02-20 16:33:16', 'A3'),
(7, 'VD000001', 'VH000001', 'AC01', 'BK01', 9.00, 're', 'CHEQUE', '', 're', '2025-02-20 16:58:49', 'A3'),
(8, 'VD000001', 'VH000002', 'AC01', 'BK01', 50.00, 'qwe', 'CASH', '', 'qwe', '2025-02-20 16:59:21', 'A3');

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
  ADD KEY `fk_invoice_project_id` (`project_id`);

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
-- Indexes for table `projects_settings`
--
ALTER TABLE `projects_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `rv`
--
ALTER TABLE `rv`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_rv_client_id` (`client_id`),
  ADD KEY `fk_rv_project_id` (`project_id`);

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
-- Indexes for table `tasks_settings`
--
ALTER TABLE `tasks_settings`
  ADD PRIMARY KEY (`id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=619;

--
-- AUTO_INCREMENT for table `affiliates_projects`
--
ALTER TABLE `affiliates_projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `affiliates_transactions`
--
ALTER TABLE `affiliates_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `cash_flows_entities`
--
ALTER TABLE `cash_flows_entities`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `cash_flows_heads`
--
ALTER TABLE `cash_flows_heads`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `cash_flows_settings`
--
ALTER TABLE `cash_flows_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `cash_flows_transactions`
--
ALTER TABLE `cash_flows_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `invoices_transactions`
--
ALTER TABLE `invoices_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `licenses`
--
ALTER TABLE `licenses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notes`
--
ALTER TABLE `notes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `petty_cash`
--
ALTER TABLE `petty_cash`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `petty_cash_transactions`
--
ALTER TABLE `petty_cash_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

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
-- AUTO_INCREMENT for table `projects_settings`
--
ALTER TABLE `projects_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `rv`
--
ALTER TABLE `rv`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `rv_transactions`
--
ALTER TABLE `rv_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `statuses`
--
ALTER TABLE `statuses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `sub_tasks`
--
ALTER TABLE `sub_tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `tasks_settings`
--
ALTER TABLE `tasks_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `vendors_transactions`
--
ALTER TABLE `vendors_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

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
  ADD CONSTRAINT `fk_ofb_firm_id` FOREIGN KEY (`firm_id`) REFERENCES `firms` (`id`);

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
