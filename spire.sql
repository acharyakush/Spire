-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 30, 2025 at 07:51 PM
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
CREATE DEFINER=`spire`@`%` PROCEDURE `generate_dynamic_id` (`prefix` CHAR(8), `table_name` VARCHAR(255), OUT `new_id` CHAR(8))   BEGIN
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
  `entry_by_id` char(8) NOT NULL,
  `module` varchar(100) DEFAULT NULL,
  `activity` varchar(5000) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `entry_at` datetime DEFAULT current_timestamp(),
  `details` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activities`
--

INSERT INTO `activities` (`id`, `entry_by_id`, `module`, `activity`, `ip_address`, `entry_at`, `details`) VALUES
(1, 'A3', 'Inquiries', 'Added <b>IQ000001</b>.', 'Localhost', '2024-12-15 15:28:07', ''),
(2, 'A3', 'General', 'Logged out.', 'Localhost', '2024-12-15 23:32:18', ''),
(3, 'A3', 'General', 'Logged in.', 'Localhost', '2024-12-16 19:05:52', ''),
(4, 'A3', 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Hold</b> to <b>Open</b>.', 'Localhost', '2024-12-16 20:01:07', ''),
(5, 'A3', 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Open</b> to Closed.', 'Localhost', '2024-12-16 20:01:12', ''),
(6, 'A3', 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Closed</b> to <b>Hold</b>.', 'Localhost', '2024-12-16 20:01:18', ''),
(7, 'A3', 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Hold</b> to <b>Open</b>.', 'Localhost', '2024-12-16 20:01:22', ''),
(8, 'A3', 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Open</b> to Closed.', 'Localhost', '2024-12-16 20:01:26', ''),
(9, 'A3', 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Closed</b> to <b>Open</b>.', 'Localhost', '2024-12-16 20:02:10', ''),
(10, 'A3', 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Open</b> to <b>Closed</b>.', 'Localhost', '2024-12-16 20:31:16', ''),
(11, 'A3', 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Closed</b> to <b>Open</b>.', 'Localhost', '2024-12-16 20:34:05', ''),
(12, 'A3', 'Inquiries', 'Closed <b>IQ000001</b> due to <b>Hello..</b>', 'Localhost', '2024-12-16 20:38:33', ''),
(13, 'A3', 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Closed</b> to <b>Open</b>.', 'Localhost', '2024-12-16 20:39:06', ''),
(14, 'A3', 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Open</b> to <b>Hold</b>.', 'Localhost', '2024-12-16 20:39:10', ''),
(15, 'A3', 'Inquiries', 'Closed <b>IQ000001</b> due to <b>Bye..</b>', 'Localhost', '2024-12-16 20:39:18', ''),
(16, 'A3', 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Closed</b> to <b>Open</b>.', 'Localhost', '2024-12-16 20:40:04', ''),
(17, 'A3', 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Open</b> to <b>Hold</b>.', 'Localhost', '2024-12-16 20:40:38', ''),
(18, 'A3', 'Inquiries', 'Closed <b>IQ000001</b> due to <b>Yes</b>.', 'Localhost', '2024-12-16 20:40:49', ''),
(19, 'A3', 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Closed</b> to <b>Open</b>.', 'Localhost', '2024-12-16 20:40:57', ''),
(20, 'A3', 'Notes', 'Added in <b>IQ000001</b>.', 'Localhost', '2024-12-16 20:52:47', ''),
(21, 'A3', 'Notes', 'Added in <b>IQ000001</b>.', 'Localhost', '2024-12-16 20:54:45', ''),
(22, 'A3', 'Inquiries', 'Edited <b>IQ000001</b>.', 'Localhost', '2024-12-16 23:26:19', ''),
(23, 'A3', 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Open</b> to <b>Hold</b>.', 'Localhost', '2024-12-17 21:35:57', ''),
(24, 'A3', 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Hold</b> to <b>Open</b>.', 'Localhost', '2024-12-17 21:36:01', ''),
(59, '', 'General', 'Logged in.', 'Localhost', '2024-12-22 21:38:29', ''),
(60, 'A3', 'Projects', 'Updated quote of <b>PJ000001</b> from <b>2500.00</b> to <b>5500</b>.', 'Localhost', '2024-12-22 21:57:22', ''),
(61, 'A3', 'Projects', 'Added government id <b>PJ1/22/12/2024</b> in <b>PJ000001</b>.', 'Localhost', '2024-12-22 22:21:31', ''),
(62, 'A3', 'Projects', 'Added government id <b>PJ1/22-12-2024</b> in <b>PJ000001</b>.', 'Localhost', '2024-12-22 22:28:31', ''),
(63, 'A3', 'General', 'Logged out.', 'Localhost', '2024-12-22 23:12:16', ''),
(64, '', 'General', 'Logged in.', 'Localhost', '2024-12-22 23:15:34', ''),
(65, 'A3', 'Projects', 'Updated quote of <b>PJ000001</b> from <b>5500.00</b> to <b>5750</b>.', 'Localhost', '2024-12-22 23:24:58', ''),
(66, 'A3', 'Projects', 'Added government id <b>PJ1/22/12/2024</b> in <b>PJ000001</b>.', 'Localhost', '2024-12-22 23:27:22', ''),
(67, 'A3', 'General', 'Logged out.', 'Localhost', '2024-12-23 00:15:03', ''),
(68, '', 'General', 'Logged in.', 'Localhost', '2024-12-23 20:02:22', ''),
(69, 'A3', 'Tasks', 'Added <b>TK000001</b> in <b>PJ000001</b>.', 'Localhost', '2024-12-23 22:48:22', ''),
(70, 'A3', 'General', 'Logged out.', 'Localhost', '2024-12-23 23:35:53', ''),
(71, 'A3', 'General', 'Logged in.', 'Localhost', '2024-12-23 23:35:56', ''),
(72, 'A3', 'General', 'Logged out.', 'Localhost', '2024-12-23 23:39:12', ''),
(73, '', 'General', 'Logged in.', 'Localhost', '2024-12-24 19:43:08', ''),
(74, 'A3', 'Tasks', 'Updated <b>TK000001</b> in <b>PJ000001</b>.', 'Localhost', '2024-12-24 19:53:05', ''),
(75, 'A3', 'Tasks', 'Updated <b>TK000001</b> in <b>PJ000001</b>.', 'Localhost', '2024-12-24 20:03:44', ''),
(76, 'A3', 'Tasks', 'Updated <b>TK000001</b> in <b>PJ000001</b>.', 'Localhost', '2024-12-24 20:04:04', ''),
(77, 'A3', 'Tasks', 'Disabled <b>TK000001</b> due to <b>Nice Try.</b>', 'Localhost', '2024-12-24 21:37:58', ''),
(78, 'A3', 'Tasks', 'Enabled <b>TK000001</b> due to <b>Blue</b>', 'Localhost', '2024-12-24 22:23:35', ''),
(79, 'A3', 'Tasks', 'Closed <b>TK000001</b> due to <b>Lol</b>', 'Localhost', '2024-12-24 22:24:17', ''),
(80, 'A3', 'General', 'Logged out.', 'Localhost', '2024-12-24 22:40:43', ''),
(81, 'A3', 'General', 'Logged in.', 'Localhost', '2024-12-24 22:40:45', ''),
(82, 'A3', 'Tasks', 'Disabled <b>TK000001</b> due to <b>I dont like this task anymore.</b>', 'Localhost', '2024-12-24 22:43:11', ''),
(83, 'A3', 'Tasks', 'Updated <b>TK000001</b> in <b>PJ000001</b>.', 'Localhost', '2024-12-24 22:55:27', ''),
(84, 'A3', 'Tasks', 'Enabled <b>TK000001</b> due to <b>NA</b>', 'Localhost', '2024-12-24 23:12:53', ''),
(85, 'A3', 'Tasks', 'Closed <b>TK000001</b> due to <b>Yes</b>', 'Localhost', '2024-12-24 23:13:08', ''),
(86, 'A3', 'General', 'Logged out.', 'Localhost', '2024-12-24 23:59:57', ''),
(87, '', 'General', 'Logged in.', 'Localhost', '2024-12-25 16:01:46', ''),
(88, '', 'General', 'Logged in.', '::ffff:192.168.1.15', '2024-12-25 18:05:49', ''),
(89, 'A3', 'General', 'Logged out.', 'Localhost', '2024-12-25 19:23:33', ''),
(90, '', 'General', 'Logged in.', 'Localhost', '2024-12-25 19:50:06', ''),
(91, 'A3', 'General', 'Logged out.', 'Localhost', '2024-12-25 20:38:18', ''),
(92, '', 'General', 'Logged in.', 'Localhost', '2024-12-26 18:51:18', ''),
(93, 'A3', 'Tasks', 'Added <b>TK000002</b> in <b>PJ000001</b>.', 'Localhost', '2024-12-26 19:27:25', ''),
(94, 'A3', 'Tasks', 'Added <b>TK000001</b> in <b>PJ000001</b>.', 'Localhost', '2024-12-26 20:13:12', ''),
(95, 'A3', 'General', 'Logged out.', 'Localhost', '2024-12-27 08:26:40', ''),
(96, '', 'General', 'Logged in.', 'Localhost', '2024-12-27 19:34:53', ''),
(97, 'A3', 'Tasks', 'Updated <b>Old Particular: Ledger of Loan</b> => <b>Ledger of Loans</b> of <b>TK000001</b> in <b>PJ000001</b>.', 'Localhost', '2024-12-27 22:18:10', ''),
(98, 'A3', 'Tasks', 'Updated <b>Old Expense: 5000.00</b> => <b>5500.00</b> of <b>TK000001</b> in <b>PJ000001</b>.', 'Localhost', '2024-12-27 22:23:52', ''),
(99, 'A3', 'Tasks', 'Updated <b>Old Expense: 5000.00</b> => <b>4500.00</b> of <b>TK000001</b> in <b>PJ000001</b>.', 'Localhost', '2024-12-27 22:26:20', ''),
(101, 'A3', 'Tasks', 'Updated Task_id from <b>TK000001</b> to <b>undefined</b>, Project_id from <b>PJ000001</b> to <b>undefined</b>, Particular from <b>Ledger of Loans</b> to <b>Ledger of Loans.</b>, Remark from <b>Check CIBIL score for loan eligibility</b> to <b>Check CIBIL score for loan eligibility.</b>, Created_by from <b>A3</b> to <b>undefined</b>, Created_at from <b>2024-12-27T14:20:22.000Z</b> to <b>undefined</b>, Expense from <b>4500.00</b> to <b>5500.00</b>, Rowid from <b>2</b> to <b>undefined</b>, Task from <b>Task #1</b> to <b>Task #2</b> of <b>TK000001</b> in <b>PJ000001</b>.', 'Localhost', '2024-12-27 22:33:52', ''),
(102, 'A3', 'Tasks', 'Updated Due Date from <b>2024-12-25T18:30:00.000Z</b> to <b>Wed Jan 01 2025 00:00:00 GMT+0530 (India Standard Time)</b>, Expense from <b>4500.00</b> to <b>5000.00</b>, Particular from <b>Prepare form for submission</b> to <b>Prepare form for submissions</b>, Task from <b>Task #1</b> to <b>Task #2</b> of <b>TK000001</b> in <b>PJ000001</b>.', 'Localhost', '2024-12-27 22:39:43', ''),
(103, 'A3', 'General', 'Logged out.', 'Localhost', '2024-12-27 23:24:20', ''),
(104, '', 'General', 'Logged in.', 'Localhost', '2024-12-28 21:53:41', ''),
(105, 'A3', 'Tasks', 'Updated Remark from <b>Get them from storage server</b> to <b>Get them from storage servers.</b> of <b>TK000001</b> in <b>PJ000001</b>.', 'Localhost', '2024-12-29 22:57:34', ''),
(106, 'A3', 'General', 'Logged out.', 'Localhost', '2024-12-29 23:18:52', ''),
(107, '', 'General', 'Logged in.', 'Localhost', '2024-12-29 23:19:55', ''),
(108, 'A3', 'General', 'Logged out.', 'Localhost', '2024-12-29 23:44:05', ''),
(109, '', 'General', 'Logged in.', 'Localhost', '2024-12-31 15:33:54', ''),
(110, 'A3', 'Inquiries', 'Update status of <b>IQ000002</b> to <b>Open</b> from <b>Hold</b>.', 'Localhost', '2024-12-31 16:44:57', ''),
(111, 'A3', 'General', 'Logged out.', 'Localhost', '2024-12-31 20:41:17', ''),
(112, '', 'General', 'Logged in.', 'Localhost', '2025-01-01 19:37:06', ''),
(113, 'A3', 'General', 'Logged out.', 'Localhost', '2025-01-01 21:45:21', ''),
(114, '', 'General', 'Logged in.', 'Localhost', '2025-01-01 21:51:35', ''),
(115, 'A3', 'Tasks', 'Closed <b>TK000001</b> due to <b>I no longer require this.</b>', 'Localhost', '2025-01-01 22:42:41', ''),
(116, 'A3', 'Tasks', 'Edited Due Date from <b>2024-12-31T18:30:00.000Z</b> to <b>Tue Jan 21 2025 00:00:00 GMT+0530 (India Standard Time)</b>, Expense from <b>5000.00</b> to <b>5100.00</b>, Task from <b>Task #2</b> to <b>Task #21</b> of <b>TK000001</b> in <b>PJ000001</b>.', 'Localhost', '2025-01-01 22:59:02', ''),
(117, 'A3', 'Tasks', 'Disabled <b>TK000001</b> due to <b>I am done with this task</b>', 'Localhost', '2025-01-01 23:00:04', ''),
(118, 'A3', 'Tasks', 'Enabled <b>TK000001</b> due to <b>I am not done with it.</b>', 'Localhost', '2025-01-01 23:04:02', ''),
(119, 'A3', 'Tasks', 'Closed <b>TK000001</b> due to <b>I am done.</b>', 'Localhost', '2025-01-01 23:04:25', ''),
(120, 'A3', 'Tasks', 'Edited Particular from <b>Prepare documents for load</b> to <b>Prepare documents for loads.</b> of <b>3</b> in <b>PJ000001</b>.', 'Localhost', '2025-01-01 23:32:39', ''),
(121, 'A3', 'Tasks', 'Edited Remark from <b>Get them from storage servers.</b> to <b>Get them from storage servers</b> of <b>3</b> in <b>PJ000001</b>.', 'Localhost', '2025-01-01 23:32:50', ''),
(122, 'A3', 'Tasks', 'Edited Remark from <b>Make sure the internet connectivity is normal</b> to <b>Make sure the internet connectivity is normal.</b> of <b>TK000001</b> in <b>PJ000001</b>.', 'Localhost', '2025-01-01 23:33:42', ''),
(123, 'A3', 'Tasks', 'Added a particular and remark in <b>TK000001</b> in <b>PJ000001</b>.', 'Localhost', '2025-01-01 23:45:36', ''),
(124, 'A3', 'Tasks', 'Edited Task from <b>Task #21</b> to <b>Task #1</b> of <b>TK000001</b> in <b>PJ000001</b>.', 'Localhost', '2025-01-01 23:53:30', ''),
(125, 'A3', 'General', 'Logged out.', 'Localhost', '2025-01-02 00:46:01', ''),
(126, '', 'General', 'Logged in.', 'Localhost', '2025-01-02 20:02:33', ''),
(127, 'A3', 'Tasks', 'Added <b>TK000002</b> in <b>PJ000001</b>', 'Localhost', '2025-01-02 20:19:22', ''),
(128, 'A3', 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000001</b>.', 'Localhost', '2025-01-02 20:27:04', ''),
(129, 'A3', 'General', 'Logged out.', 'Localhost', '2025-01-03 00:00:04', ''),
(130, '', 'General', 'Logged in.', 'Localhost', '2025-01-03 20:32:06', ''),
(131, 'A3', 'General', 'Logged out.', 'Localhost', '2025-01-04 00:22:27', ''),
(132, '', 'General', 'Logged in.', 'Localhost', '2025-01-04 18:35:41', ''),
(133, 'A3', 'General', 'Logged out.', 'Localhost', '2025-01-04 19:35:19', ''),
(134, 'A3', 'General', 'Logged in.', 'Localhost', '2025-01-04 20:25:19', ''),
(135, 'A3', 'Single Client', 'Edited  of <b>CP000001</b> of <b>undefined</b>.', 'Localhost', '2025-01-04 22:54:41', ''),
(136, 'A3', 'Single Client', 'Edited Contact Number from <b></b> to <b>07925462408</b> of <b>CP000001</b> of <b>CN000001</b>.', 'Localhost', '2025-01-04 23:03:53', ''),
(137, 'A3', 'Single Client', 'Edited Pan from <b>blank</b> to <b>BBXPA8126Q</b> of <b>CP000001</b> of <b>CN000001</b>.', 'Localhost', '2025-01-04 23:05:22', ''),
(138, 'A3', 'General', 'Logged out.', 'Localhost', '2025-01-05 00:21:24', ''),
(139, '', 'General', 'Logged in.', 'Localhost', '2025-01-05 22:25:58', ''),
(140, 'A3', 'General', 'Logged out.', 'Localhost', '2025-01-05 22:31:50', ''),
(141, 'A3', 'General', 'Logged in.', 'Localhost', '2025-01-07 18:49:28', ''),
(142, 'A3', 'General', 'Logged in.', 'Localhost', '2025-01-07 20:07:02', ''),
(143, 'A3', 'General', 'Logged in.', 'Localhost', '2025-01-07 23:17:28', ''),
(144, 'A3', 'General', 'Logged in.', 'Localhost', '2025-01-07 23:19:06', ''),
(145, 'A3', 'General', 'Logged out.', 'Localhost', '2025-01-07 23:19:34', ''),
(146, 'A3', 'General', 'Logged in.', 'Localhost', '2025-01-08 20:11:14', ''),
(147, 'A3', 'General', 'Logged in.', 'Localhost', '2025-01-08 21:30:38', ''),
(148, 'A3', 'General', 'Logged out.', 'Localhost', '2025-01-08 21:36:17', ''),
(149, 'A3', 'General', 'Logged in.', 'Localhost', '2025-01-09 19:10:30', ''),
(150, 'A3', 'General', 'Logged in.', 'Localhost', '2025-01-09 19:45:06', ''),
(151, 'A3', 'General', 'Logged in.', 'Localhost', '2025-01-09 20:12:30', ''),
(152, 'A3', 'General', 'Logged in.', 'Localhost', '2025-01-09 20:39:08', ''),
(153, 'A3', 'General', 'Logged in.', 'Localhost', '2025-01-09 21:14:09', ''),
(154, 'A3', 'General', 'Logged in.', 'Localhost', '2025-01-09 23:48:47', ''),
(155, 'A3', 'General', 'Logged out.', 'Localhost', '2025-01-10 00:00:13', ''),
(156, 'A3', 'General', 'Logged in.', 'Localhost', '2025-01-10 18:25:35', ''),
(157, 'A3', 'General', 'Logged in.', 'Localhost', '2025-01-10 18:26:56', ''),
(158, 'A3', 'General', 'Logged in.', 'Localhost', '2025-01-10 18:30:56', ''),
(159, 'A3', 'General', 'Logged in.', 'Localhost', '2025-01-10 18:34:12', ''),
(160, '', 'General', 'Logged out.', 'Localhost', '2025-01-10 20:18:57', ''),
(161, 'A3', 'General', 'Logged in.', 'Localhost', '2025-01-11 18:50:53', ''),
(162, 'A3', 'Inquiries', 'Added <b>IQ000004</b>.', 'Localhost', '2025-01-11 19:32:47', ''),
(163, 'A3', 'Inquiries', 'Added <b>IQ000005</b>.', 'Localhost', '2025-01-11 19:45:35', ''),
(164, 'A3', 'Inquiries', 'Added <b>IQ000006</b>.', 'Localhost', '2025-01-11 19:54:39', ''),
(165, 'A3', 'Inquiries', 'Closed <b>IQ000004</b> due to <b>Yes. I want to close this inquiry.</b>.', 'Localhost', '2025-01-11 20:10:19', ''),
(166, 'A3', 'Inquiries', 'Update status of <b>IQ000004</b> to <b>Hold</b> from <b>Closed</b>.', 'Localhost', '2025-01-11 20:10:42', ''),
(167, 'A3', 'Inquiries', 'Update status of <b>IQ000004</b> to <b>Open</b> from <b>Hold</b>.', 'Localhost', '2025-01-11 20:12:54', ''),
(168, 'A3', 'Inquiries', 'Update status of <b>IQ000004</b> to <b>Hold</b> from <b>Open</b>.', 'Localhost', '2025-01-11 20:12:57', ''),
(169, 'A3', 'Inquiries', 'Update status of <b>IQ000004</b> to <b>Open</b> from <b>Hold</b>.', 'Localhost', '2025-01-11 20:15:05', ''),
(170, 'A3', 'Inquiries', 'Update status of <b>IQ000004</b> to <b>Hold</b> from <b>Open</b>.', 'Localhost', '2025-01-11 20:15:12', ''),
(171, 'A3', 'Inquiries', 'Closed <b>IQ000006</b> due to <b>I am done with this work.</b>.', 'Localhost', '2025-01-11 20:15:28', ''),
(172, '', 'Inquiries', 'Edited <b>IQ000002</b>.', 'Localhost', '2025-01-11 21:55:22', ''),
(173, '', 'Inquiries', 'Edited <b>IQ000002</b>.', 'Localhost', '2025-01-11 21:55:31', ''),
(174, '', 'Inquiries', 'Edited <b>IQ000002</b>.', 'Localhost', '2025-01-11 21:56:08', ''),
(175, '', 'Inquiries', 'Edited <b>IQ000002</b>.', 'Localhost', '2025-01-11 21:56:23', ''),
(176, '', 'Inquiries', 'Edited <b>IQ000002</b>.', 'Localhost', '2025-01-11 21:56:34', ''),
(177, '', 'Inquiries', 'Edited <b>IQ000002</b>.', 'Localhost', '2025-01-11 21:57:34', ''),
(178, '', 'Inquiries', 'Edited <b>IQ000002</b>.', 'Localhost', '2025-01-11 22:13:09', ''),
(179, 'A3', 'Inquiries', 'Edited <b>IQ000002</b>.', 'Localhost', '2025-01-11 22:16:53', ''),
(180, 'A3', 'Inquiries', 'Edited <b>IQ000002</b>.', 'Localhost', '2025-01-11 22:17:12', ''),
(181, 'A3', 'Inquiries', 'Edited <b>IQ000002</b>.', 'Localhost', '2025-01-11 22:20:18', ''),
(182, 'A3', 'Inquiries', 'Edited <b>IQ000004</b>.', 'Localhost', '2025-01-11 22:20:42', ''),
(183, 'A3', 'Inquiries', 'Edited <b>IQ000003</b>.', 'Localhost', '2025-01-11 22:21:26', ''),
(184, 'A3', 'Inquiries', 'Update status of <b>IQ000003</b> to <b>Hold</b> from <b>Open</b>.', 'Localhost', '2025-01-11 22:27:30', ''),
(185, 'A3', 'Notes', 'Added in <b>IQ000001</b>.', 'Localhost', '2025-01-11 23:45:49', ''),
(186, 'A3', 'Notes', 'Added in <b>IQ000001</b>.', 'Localhost', '2025-01-11 23:46:31', ''),
(187, 'A3', 'Notes', 'Added in <b>IQ000004</b>.', 'Localhost', '2025-01-11 23:46:51', ''),
(188, 'A3', 'General', 'Logged out.', 'Localhost', '2025-01-11 23:49:52', ''),
(189, 'A3', 'General', 'Logged in.', 'Localhost', '2025-01-12 10:53:47', ''),
(190, 'A3', 'Inquiries', 'Added <b>IQ000007</b>.', 'Localhost', '2025-01-12 11:18:02', ''),
(191, 'A3', 'Inquiries', 'Added <b>PJ000002</b>.', 'Localhost', '2025-01-12 11:41:52', ''),
(192, 'A3', 'Inquiries', 'Added <b>IQ000008</b>.', 'Localhost', '2025-01-12 14:36:15', ''),
(193, 'A3', 'General', 'Logged out.', 'Localhost', '2025-01-12 14:43:58', ''),
(194, 'A3', 'General', 'Logged in.', 'Localhost', '2025-01-13 20:59:36', ''),
(195, 'A3', 'Projects', '<b>PJ000002</b> kept on <b>Hold</b> from <b>Active</b>', 'Localhost', '2025-01-13 21:05:47', ''),
(196, 'A3', 'Projects', '<b>PJ000002</b> kept on <b>Hold</b> from <b>Active</b>', 'Localhost', '2025-01-13 21:09:02', ''),
(197, 'A3', 'Projects', '<b>PJ000002</b> kept on <b>Hold</b> from <b>Active</b>', 'Localhost', '2025-01-13 21:12:21', ''),
(198, 'A3', 'General', 'Logged out.', 'Localhost', '2025-01-13 22:51:50', ''),
(199, 'A3', 'General', 'Logged in.', 'Localhost', '2025-01-13 22:55:00', ''),
(200, 'A3', 'General', 'Logged out.', 'Localhost', '2025-01-14 00:11:29', ''),
(201, 'A3', 'General', 'Logged in.', 'Localhost', '2025-01-14 10:49:01', ''),
(202, 'A3', 'General', 'Logged out.', 'Localhost', '2025-01-14 10:53:41', ''),
(203, 'A3', 'General', 'Logged in.', 'Localhost', '2025-01-14 11:03:16', ''),
(204, 'A3', 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000001</b>.', 'Localhost', '2025-01-14 13:44:25', ''),
(205, 'A3', 'Tasks', 'Added <b>TK000003</b> in <b>PJ000001</b>', 'Localhost', '2025-01-14 13:44:55', ''),
(206, 'A3', 'Tasks', 'Edited Particular from <b>Particular #2</b> to <b>Particular #21</b>, Remark from <b>Remark #2</b> to <b>Remark #23</b> of <b>TK000002</b> in <b>PJ000001</b>.', 'Localhost', '2025-01-14 14:19:07', ''),
(207, 'A3', 'General', 'Logged out.', 'Localhost', '2025-01-14 22:03:44', ''),
(208, 'A3', 'General', 'Logged in.', 'Localhost', '2025-01-17 00:13:44', ''),
(209, 'A3', 'General', 'Logged out.', 'Localhost', '2025-01-17 00:25:06', ''),
(210, 'A3', 'General', 'Logged in.', 'Localhost', '2025-01-17 19:27:38', ''),
(211, 'A3', 'New Invoice', 'Generated invoice <b>SA/2025-26/00001</b> for <b>PJ000001</b>', 'Localhost', '2025-01-17 22:25:50', ''),
(212, 'A3', 'New Invoice', 'Generated invoice <b>BF/2025-26/00002</b> for <b>PJ000002</b>', 'Localhost', '2025-01-17 22:26:51', ''),
(213, 'A3', 'Cash Flow', 'Added invoice cash flow entry.', 'Localhost', '2025-01-17 23:56:01', ''),
(214, 'A3', 'Affiliates', 'Added affiliate(s).', 'Localhost', '2025-01-18 00:24:44', ''),
(215, 'A3', 'General', 'Logged out.', 'Localhost', '2025-01-18 00:25:09', ''),
(216, 'A3', 'General', 'Logged in.', 'Localhost', '2025-01-18 01:36:22', ''),
(217, 'A3', 'General', 'Logged out.', 'Localhost', '2025-01-18 01:38:54', ''),
(218, 'A3', 'General', 'Logged in.', 'Localhost', '2025-01-25 16:06:27', ''),
(219, 'A3', 'Tasks', 'Added <b>TK000004</b> in <b>PJ000001</b>', 'Localhost', '2025-01-25 16:07:01', ''),
(220, 'A3', 'Tasks', 'Added <b>TK000005</b> in <b>PJ000002</b>', 'Localhost', '2025-01-25 16:07:27', ''),
(221, 'A3', 'Tasks', 'Added <b>TK000006</b> in <b>PJ000002</b>', 'Localhost', '2025-01-25 16:22:41', ''),
(222, 'A3', 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000002</b>.', 'Localhost', '2025-01-25 16:29:58', ''),
(223, 'A3', 'General', 'Logged out.', 'Localhost', '2025-01-25 16:32:53', ''),
(224, 'A3', 'General', 'Logged in.', 'Localhost', '2025-01-25 16:48:16', ''),
(225, 'A3', 'General', 'Logged out.', 'Localhost', '2025-01-25 16:49:50', ''),
(226, 'A3', 'General', 'Logged in.', 'Localhost', '2025-01-25 17:00:09', ''),
(227, 'A3', 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000002</b>.', 'Localhost', '2025-01-25 17:00:28', ''),
(228, 'A3', 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000002</b>.', 'Localhost', '2025-01-25 17:27:00', ''),
(229, 'A3', 'Tasks', 'Deleted particular <b>Hello</b> with remark <b>Bello</b> of <b>11</b> in <b>PJ000002</b>', 'Localhost', '2025-01-25 17:27:37', ''),
(230, 'A3', 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000002</b>.', 'Localhost', '2025-01-25 17:28:09', ''),
(231, 'A3', 'Tasks', 'Deleted particular <b>Hello</b> with remark <b>Trello</b> of <b>TK000005</b> in <b>PJ000002</b>', 'Localhost', '2025-01-25 17:29:04', ''),
(232, 'A3', 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000002</b>.', 'Localhost', '2025-01-25 17:29:19', ''),
(233, 'A3', 'Tasks', 'Deleted particular <b>Bello</b> with remark <b>Hello</b> of <b>TK000005</b> in <b>PJ000002</b>', 'Localhost', '2025-01-25 17:30:09', ''),
(234, 'A3', 'Tasks', 'Disabled <b>TK000005</b> due to <b>None.</b>', 'Localhost', '2025-01-25 17:30:33', ''),
(235, 'A3', 'Tasks', 'Enabled <b>TK000005</b> due to <b>Onel.</b>', 'Localhost', '2025-01-25 17:30:45', ''),
(236, 'A3', 'Tasks', 'Marked Task as Completed <b>TK000005</b> due to <b>Yes.</b>', 'Localhost', '2025-01-25 17:30:59', ''),
(237, 'A3', 'General', 'Logged out.', 'Localhost', '2025-01-25 17:31:12', ''),
(238, 'A3', 'General', 'Logged in.', 'Localhost', '2025-01-25 17:48:25', ''),
(239, 'A3', 'General', 'Logged out.', 'Localhost', '2025-01-25 17:52:52', ''),
(240, 'A3', 'General', 'Logged in.', 'Localhost', '2025-01-25 18:32:18', ''),
(241, 'A3', 'Invoices', 'Added transaction in <b>SA/2025-26/00001</b>.', 'Localhost', '2025-01-27 22:54:00', ''),
(242, 'A3', 'Invoices', 'Added transaction in <b>SA/2025-26/00001</b>.', 'Localhost', '2025-01-27 23:04:40', ''),
(243, 'A3', 'General', 'Logged in.', 'Localhost', '2025-01-28 21:15:28', ''),
(244, 'A3', 'Single Client', 'Edited Name from <b>Sun Pharma Pvt Ltd</b> to <b>Sun Pharmas Pvt Ltd</b> of <b>CP000001</b> of <b>CN000001</b>.', 'Localhost', '2025-01-28 22:17:14', ''),
(245, 'A3', 'Single Client', 'Edited Name from <b>Sun Pharmas Pvt Ltd</b> to <b>Sun Pharma Pvt Ltd</b> of <b>CP000001</b> of <b>CN000001</b>.', 'Localhost', '2025-01-28 22:17:27', ''),
(246, 'A3', 'Inquiries', 'Added <b>PJ000003</b>.', 'Localhost', '2025-01-28 23:46:18', ''),
(247, 'A3', 'General', 'Logged out.', 'Localhost', '2025-01-28 23:50:19', ''),
(248, 'A3', 'General', 'Logged in.', 'Localhost', '2025-01-29 20:35:35', ''),
(249, 'A3', 'Tasks', 'Added <b>TK000007</b> in <b>PJ000003</b>', 'Localhost', '2025-01-29 22:38:25', ''),
(250, 'A3', 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000003</b>.', 'Localhost', '2025-01-29 22:54:46', ''),
(251, 'A3', 'Tasks', 'Deleted particular <b>Particular 1</b> with remark <b>Remark 1</b> of <b>TK000007</b> in <b>PJ000003</b>', 'Localhost', '2025-01-29 23:02:20', ''),
(252, 'A3', 'General', 'Logged out.', 'Localhost', '2025-01-29 23:19:18', ''),
(253, 'A3', 'General', 'Logged in.', 'Localhost', '2025-01-29 23:20:58', ''),
(254, 'A3', 'Tasks', 'Marked sub task having <b>Particular #21</b> & <b>Remark #23</b> as completed of <b>10</b> in <b>PJ000001</b>', 'Localhost', '2025-01-29 23:35:05', ''),
(255, 'A3', 'Tasks', 'Marked sub task having <b>Particular #1</b> & <b>Remark #1</b> as completed of <b>9</b> in <b>PJ000001</b>', 'Localhost', '2025-01-29 23:37:54', ''),
(256, 'A3', 'Tasks', 'Marked Task as Completed <b>TK000002</b> due to <b>Lovely.</b>', 'Localhost', '2025-01-29 23:50:31', ''),
(257, 'A3', 'Tasks', 'Marked Task as Completed <b>TK000002</b> due to <b>Lovely.</b>', 'Localhost', '2025-01-29 23:51:44', ''),
(258, 'A3', 'Tasks', 'Marked Task as Completed <b>TK000002</b> due to <b>Hello.</b>', 'Localhost', '2025-01-29 23:53:29', ''),
(259, 'A3', 'Tasks', 'Marked Task as Completed <b>TK000002</b> due to <b>Hello.</b>', 'Localhost', '2025-01-29 23:56:08', ''),
(260, 'A3', 'Tasks', 'Marked all sub tasks as completed of <b>TK000002</b> in <b>PJ000001</b>', 'Localhost', '2025-01-29 23:56:08', ''),
(261, 'A3', 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000002</b>.', 'Localhost', '2025-01-30 00:15:32', ''),
(262, 'A3', 'General', 'Logged out.', 'Localhost', '2025-01-30 00:18:47', ''),
(263, 'A3', 'General', 'Logged in.', 'Localhost', '2025-01-30 00:18:50', ''),
(264, 'A3', 'Tasks', 'Marked Task as Completed <b>TK000001</b> in <b>PJ000001</b> due to <b>Nice.</b>', 'Localhost', '2025-01-30 00:24:45', ''),
(265, 'A3', 'Tasks', 'Marked all sub tasks as completed of <b>TK000001</b> in <b>PJ000001</b>', 'Localhost', '2025-01-30 00:24:45', ''),
(266, 'A3', 'Tasks', 'Marked Task as Completed <b>TK000006</b> in <b>PJ000002</b> due to <b>Lol.</b>', 'Localhost', '2025-01-30 00:26:57', ''),
(267, 'A3', 'Tasks', 'Marked all sub tasks as completed of <b>TK000006</b> in <b>PJ000002</b>', 'Localhost', '2025-01-30 00:26:57', ''),
(268, 'A3', 'Tasks', 'Added <b>TK000008</b> in <b>PJ000002</b>', 'Localhost', '2025-01-30 00:28:49', ''),
(269, 'A3', 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000002</b>.', 'Localhost', '2025-01-30 00:29:00', ''),
(270, 'A3', 'Tasks', 'Marked sub task having <b>Like</b> & <b>Mike</b> as completed of <b>TK000008</b> in <b>PJ000002</b>', 'Localhost', '2025-01-30 00:29:18', ''),
(271, 'A3', 'Tasks', 'Marked Task as Completed <b>TK000008</b> in <b>PJ000002</b> due to <b>Done.</b>', 'Localhost', '2025-01-30 00:29:26', ''),
(272, 'A3', 'Tasks', 'Marked all sub tasks as completed of <b>TK000008</b> in <b>PJ000002</b>', 'Localhost', '2025-01-30 00:29:26', ''),
(273, 'A3', 'Tasks', 'Marked project <b>PJ000002</b> completed.', 'Localhost', '2025-01-30 00:51:35', ''),
(274, 'A3', 'General', 'Logged out.', 'Localhost', '2025-01-30 00:52:05', ''),
(275, 'A3', 'General', 'Logged in.', 'Localhost', '2025-01-30 19:09:14', ''),
(276, 'A3', 'General', 'Logged out.', 'Localhost', '2025-01-30 19:09:18', ''),
(277, 'A3', 'General', 'Logged in.', 'Localhost', '2025-01-30 19:09:58', ''),
(278, 'A3', 'Inquiries', 'Added <b>IQ000009</b>.', 'Localhost', '2025-01-30 19:24:28', ''),
(279, 'A3', 'General', 'Logged out.', 'Localhost', '2025-01-30 19:25:23', ''),
(280, 'A3', 'General', 'Logged in.', 'Localhost', '2025-01-30 19:34:01', ''),
(281, 'A3', 'Cash Flow', 'Added cash flow entry.', 'Localhost', '2025-01-30 23:41:51', ''),
(282, 'A3', 'Cash Flow', 'Added <b>Affiliates</b> entry.', 'Localhost', '2025-01-30 23:59:55', ''),
(283, 'A3', 'Cash Flow', 'Added <b>Outward Office Expense</b> entry.', 'Localhost', '2025-01-31 00:01:16', ''),
(284, 'A3', 'Cash Flow', 'Added <b>Outward Office Expense</b> entry.', 'Localhost', '2025-01-31 00:02:00', ''),
(285, 'A3', 'Cash Flow', 'Added <b>Outward Petty Cash</b> entry.', 'Localhost', '2025-01-31 00:02:54', ''),
(286, 'A3', 'General', 'Logged out.', 'Localhost', '2025-01-31 00:15:43', '');

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
  `adjusted_fees` decimal(10,2) DEFAULT 0.00,
  `adjusted_project_id` char(8) DEFAULT NULL,
  `client_id` char(8) DEFAULT NULL,
  `project_id` char(8) DEFAULT NULL,
  `paid_fees` decimal(10,2) DEFAULT 0.00,
  `payment_mode` enum('Cash','Cheque','Credit Card','Debit Card','Net Banking','UPI') DEFAULT NULL,
  `total_fees` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `affiliates_projects`
--

INSERT INTO `affiliates_projects` (`id`, `affiliate_id`, `adjusted_fees`, `adjusted_project_id`, `client_id`, `project_id`, `paid_fees`, `payment_mode`, `total_fees`) VALUES
(1, 'AF000001', 0.00, NULL, 'CN000001', 'PJ000001', 7500.00, 'Cash', 5000.00),
(2, 'AF000001', 0.00, NULL, 'CN000001', 'PJ000001', 7500.00, 'Credit Card', 5000.00),
(3, 'AF000001', 0.00, NULL, 'CN000001', 'PJ000001', 7500.00, 'Net Banking', 5000.00),
(4, 'AF000001', 0.00, NULL, 'CN000005', 'PJ000002', 7500.00, NULL, 1250.00);

-- --------------------------------------------------------

--
-- Table structure for table `cash_flows`
--

CREATE TABLE `cash_flows` (
  `id` int(11) UNSIGNED NOT NULL,
  `affiliate_id` char(8) DEFAULT NULL,
  `owner_firm_id` char(8) DEFAULT NULL,
  `owner_firm_bank_id` char(8) DEFAULT NULL,
  `particulars` varchar(1000) DEFAULT NULL,
  `payment_for` varchar(500) DEFAULT NULL,
  `payment_type` varchar(50) DEFAULT NULL,
  `amount_paid` decimal(10,2) DEFAULT NULL,
  `amount_received` decimal(10,2) DEFAULT NULL,
  `remarks` varchar(500) DEFAULT NULL,
  `module` varchar(50) NOT NULL,
  `entry_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `entry_by_id` char(8) NOT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cash_flows`
--

INSERT INTO `cash_flows` (`id`, `affiliate_id`, `owner_firm_id`, `owner_firm_bank_id`, `particulars`, `payment_for`, `payment_type`, `amount_paid`, `amount_received`, `remarks`, `module`, `entry_at`, `entry_by_id`, `is_deleted`) VALUES
(1, NULL, 'AC01', 'BK01', 'NA', 'Aaj Tak News Subscription.', NULL, NULL, 500.00, '', '', '2025-01-18 12:46:50', 'A3', 0),
(2, NULL, 'AC02', 'BK02', 'NA', 'Aaj Tak News Subscription.', NULL, NULL, 557.00, '', '', '2025-01-18 12:46:50', 'A3', 0),
(3, NULL, 'AC02', 'BK02', 'NA', 'Aaj Tak News Subscription.', NULL, NULL, 557.00, '', '', '2025-01-18 12:46:50', 'A3', 0),
(4, '', 'AC01', 'BK01', 'Inward Other Expense Particular #1', 'Inward Other Expense Payment For #1', 'Professional Fees', 0.00, 2500.00, 'Inward Other Expense Remarks #1', 'Inward Other Expense', '2025-01-30 12:38:21', 'A3', 0),
(5, '', 'AC01', 'BK01', 'Inward Other Expense Particular #1', 'Inward Other Expense Payment For #1', 'Professional Fees', 0.00, 2500.00, 'Inward Other Expense Remarks #1', 'Inward Other Expense', '2025-01-30 12:38:21', 'A3', 0),
(6, 'AF000002', 'AC03', 'BK03', 'Outward Affiliates Particulars #1', 'Outward Affiliates Payment For #1', 'Professional Fees', 7500.00, 0.00, 'Outward Affiliates Remarks #1', 'Affiliates', '2025-01-30 12:43:24', 'A3', 0),
(7, 'AF000002', 'AC02', 'BK02', 'Outward Affiliates Particulars #1', 'Outward Affiliates Payment For #1', 'Professional Fees', 7500.00, 0.00, 'Outward Affiliates Remarks #1', 'Affiliates', '2025-01-31 12:44:28', 'A3', 0),
(8, 'AF000001', 'AC04', 'BK04', 'Outward Affiliates Particulars #1', 'Outward Affiliates Payment For #1', 'Professional Fees', 7500.00, 0.00, 'Outward Affiliates Remarks #1', 'Affiliates', '2025-01-31 12:54:26', 'A3', 0),
(9, 'AF000001', 'AC04', 'BK04', 'Outward Affiliates Particulars #1', 'Outward Affiliates Payment For #1', 'Professional Fees', 7500.00, 0.00, 'Outward Affiliates Remarks #1', 'Affiliates', '2025-01-31 12:59:19', 'A3', 0),
(10, '', 'AC01', 'BK01', 'Outward Other Expense Particulars #1', 'Outward Other Expense Payment For #1', 'Professional Fees', 3500.00, 0.00, 'Outward Other Expense Remarks #1', 'Outward Other Expense', '2025-01-30 13:00:36', 'A3', 0),
(11, '', 'AC03', 'BK03', 'Outward Office Expense Particulars #1', 'Outward Office Expense Payment For #1', 'Professional Fees', 5525.00, 0.00, 'Outward Office Expense Remarks #1', 'Outward Office Expense', '2025-01-30 13:01:32', 'A3', 0),
(12, '', 'AC02', 'BK02', 'Outward Petty Cash Particulars #1', 'Outward Petty Cash Payment For #1', 'Professional Fees', 11500.00, 0.00, 'Outward Petty Cash Remarks #1', 'Outward Petty Cash', '2025-01-31 13:02:24', 'A3', 0);

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
  `industry` varchar(100) DEFAULT NULL,
  `is_confirmed` tinyint(1) DEFAULT 0,
  `is_deleted` tinyint(1) DEFAULT 0,
  `joined_on` datetime DEFAULT current_timestamp(),
  `notes` varchar(500) DEFAULT NULL,
  `rating` tinyint(3) UNSIGNED DEFAULT 0,
  `tags` varchar(500) DEFAULT NULL,
  `entry_at` datetime DEFAULT current_timestamp(),
  `entry_by_id` char(8) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `clients`
--

INSERT INTO `clients` (`id`, `affiliate_ids`, `company_id`, `reference_id`, `name`, `address`, `phone_number`, `email_address`, `industry`, `is_confirmed`, `is_deleted`, `joined_on`, `notes`, `rating`, `tags`, `entry_at`, `entry_by_id`) VALUES
('CN000001', 'AF000001', 'CP000001', 'RF000001', 'Kush Acharya', NULL, 8780577704, 'acharyakush2604@gmail.com', NULL, 1, 0, '2024-12-15 15:28:07', NULL, 0, NULL, '2024-12-15 15:28:07', NULL),
('CN000002', NULL, NULL, 'RF000002', 'Kevin Vyas', NULL, 8780577812, 'vyas.kevin@outlook.com', NULL, 0, 0, '2024-12-18 00:05:18', NULL, 0, NULL, '2024-12-18 00:05:18', NULL),
('CN000003', NULL, NULL, 'RF000003', 'Mudra Rawal', NULL, 9601432558, 'mudra.rawal@gmail.com', NULL, 0, 0, '2025-01-11 19:15:23', NULL, 0, NULL, '2025-01-11 19:15:23', NULL),
('CN000004', NULL, 'CP000003', 'RF000003', 'Parth Acharya', NULL, 8866359953, 'parth.acharya@gmail.com', NULL, 1, 0, '2025-01-11 19:45:34', NULL, 0, NULL, '2025-01-11 19:45:34', NULL),
('CN000005', 'AF000001', 'CP000002', 'RF000005', 'Dipen Soni', NULL, 9909436171, 'soni.dipen@gmail.com', NULL, 1, 0, '2025-01-12 11:18:02', NULL, 0, NULL, '2025-01-12 11:18:02', NULL),
('CN000006', NULL, NULL, 'RF000003', 'Suresh', NULL, 9978075347, 'suresh@gmail.com', NULL, 0, 0, '2025-01-30 19:24:27', NULL, 0, NULL, '2025-01-30 19:24:27', NULL);

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
('CP000001', 'CN000001', 'Sun Pharma Pvt Ltd', '07925462408', 'support@sunpharma.com', NULL, 'BBXPA8126Q', NULL, NULL, 500.00, 5000.00, '2024-12-17 23:48:41', 'A3'),
('CP000002', 'CN000005', 'Vivek Football League', NULL, NULL, NULL, NULL, NULL, NULL, 557.00, 1250.00, '2025-01-12 11:41:51', 'A3'),
('CP000003', 'CN000004', 'Mitesh Enterprise', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-01-28 23:46:17', 'A3');

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
  `entry_at` datetime DEFAULT current_timestamp(),
  `entry_by_id` char(8) NOT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

INSERT INTO `inquiries` (`id`, `client_id`, `reference_id`, `main_project_id`, `sub_project_id`, `entry_date`, `phone_number`, `email_address`, `follow_ups`, `is_closed`, `closure_reason`, `quote`, `status`, `tags`, `entry_at`, `entry_by_id`) VALUES
('IQ000001', 'CN000001', 'RF000001', 'MP000004', 'SP000003', '2024-12-15 09:39:42', 8780577704, 'acharyakush2604@gmail.com', 'A1,A2', 0, '', 2500.00, 'Confirmed', NULL, '2024-12-15 15:28:07', 'A3'),
('IQ000002', 'CN000002', 'RF000002', 'MP000011', 'SP000004', '2024-12-18 12:00:00', 8780577812, 'vyas.kevin@outlook.com', 'A1,A3', 0, '', 15080.00, 'Open', NULL, '2024-12-18 00:05:18', 'A3'),
('IQ000003', 'CN000003', 'RF000003', 'MP000006', 'SP000012', '2025-01-10 12:00:00', 9601432558, 'mudra.rawal@gmail.com', 'A1,A2', 0, '', 7520.00, 'Hold', NULL, '2025-01-11 19:15:23', 'A3'),
('IQ000004', 'CN000002', 'RF000004', 'MP000005', 'SP000011', '2025-01-06 12:00:00', 8780577812, 'vyas.kevin@outlook.com', 'A1,A3', 0, '', 8550.00, 'Hold', NULL, '2025-01-11 19:32:46', 'A3'),
('IQ000005', 'CN000004', 'RF000003', 'MP000012', 'SP000023', '2025-01-05 14:13:11', 8866359953, 'parth.acharya@gmail.com', 'A1', 0, NULL, 2000.00, 'Confirmed', NULL, '2025-01-11 19:45:34', 'A3'),
('IQ000006', 'CN000003', 'RF000003', 'MP000003', 'SP000007', '2025-01-02 14:24:03', 9601432558, 'mudra.rawal@gmail.com', 'A2', 1, 'I am done with this work.', 10000.00, 'Closed', NULL, '2025-01-11 19:54:38', 'A3'),
('IQ000007', 'CN000005', 'RF000005', 'MP000001', 'SP000010', '2025-01-12 05:46:59', 9909436171, 'soni.dipen@gmail.com', 'A2', 0, NULL, 5000.00, 'Confirmed', NULL, '2025-01-12 11:18:02', 'A3'),
('IQ000008', 'CN000001', 'RF000001', 'MP000005', 'SP000014', '2025-01-12 09:05:32', 8780577704, 'acharyakush2604@gmail.com', 'A1', 0, NULL, 4550.00, 'Open', NULL, '2025-01-12 14:36:15', 'A3'),
('IQ000009', 'CN000006', 'RF000003', 'MP000002', 'SP000002', '2025-02-06 13:47:30', 9978075347, 'suresh@gmail.com', 'A3', 0, NULL, 2500.00, 'Open', NULL, '2025-01-30 19:24:27', 'A3');

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
(2, 'BF/2025-26/00002', 'CN000005', 'PJ000002', 2500.00, 557.00, '2025-01-24 20:03:34', '2025-01-17 22:26:51', '2025-01-17 22:26:51');

-- --------------------------------------------------------

--
-- Table structure for table `invoices_payment_history`
--

CREATE TABLE `invoices_payment_history` (
  `id` int(11) NOT NULL,
  `invoice_custom_id` varchar(100) NOT NULL,
  `project_id` char(8) NOT NULL,
  `entry_at` datetime DEFAULT current_timestamp(),
  `particulars` varchar(255) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `source` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoices_payment_history`
--

INSERT INTO `invoices_payment_history` (`id`, `invoice_custom_id`, `project_id`, `entry_at`, `particulars`, `amount`, `source`) VALUES
(1, 'SA/2025-26/00001', 'PJ000001', '2025-01-27 16:31:10', 'Jan-March Installments', 500.00, 'DC'),
(2, 'SA/2025-26/00001', 'PJ000001', '2025-01-30 17:18:47', 'Happy New Year.', 155.00, 'CASH'),
(3, 'SA/2025-26/00001', 'PJ000001', '2025-02-06 17:34:17', 'Good evening.', 855.00, 'BK01');

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
(20, 'IQ000007', 'PJ000002', NULL, 'A3', 'A3', 'This is a project\'s test.', 'Projects', '2025-01-12 11:41:51'),
(21, 'IQ000008', NULL, NULL, '', 'A3', 'Hello There.', 'Inquiries', '2025-01-12 14:36:15'),
(22, 'IQ000005', 'PJ000003', NULL, 'A3', 'A3', 'None.', 'Projects', '2025-01-28 23:46:17'),
(23, 'IQ000009', NULL, NULL, '', 'A3', 'sdfsdfsdfs', 'Inquiries', '2025-01-30 19:24:27');

-- --------------------------------------------------------

--
-- Table structure for table `owner_firms`
--

CREATE TABLE `owner_firms` (
  `id` varchar(4) NOT NULL,
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
-- Dumping data for table `owner_firms`
--

INSERT INTO `owner_firms` (`id`, `name`, `address`, `phone_number`, `email_address`, `pan`, `gstin`, `terms_conditions`, `entry_at`, `entry_by_id`) VALUES
('AC01', 'Signiix Advisors', 'D-608, The First, Behind ITC Narmada, Vastrapur - 3800016', '9898110703', 'admin@signiixadvisors.com', 'BBXPA8126Q', '', '1. Payment is due within 30 days from the invoice date unless otherwise agreed in writing.\\n2. A late fee of 1.5% per month will be applied to overdue balances.\\n3. Any disputes regarding this invoice must be communicated within 15 days of receipts.\\n4. All payments should be made via the methods specified on the invoice.', '2024-12-17 20:02:11', 'A1'),
('AC02', 'Branchitects Firm', 'AFF8, Aakansha Flats, Opp Jaymala Cross Roads, Isanpur, Ahmedabad - 3800008', '792265411259', 'support@branchitects.com', 'BBXPA8126A', '', '1. Payment is due within 15 days from the invoice date unless otherwise agreed in writing.\\n2. A late fee of 3.5% per month will be applied to overdue balances.\\n3. Any disputes regarding this invoice must be communicated within 30 days of receipt.\\n4. All payments should be made via the methods specified on the invoice.', '2024-12-17 20:02:11', 'A1'),
('AC03', 'Pandya Sharma', 'D-608, The First, Behind ITC Narmada, Vastrapur - 3800016', '7925460175', 'support@pandya.sharma.com', 'BBXPA8126Q', '29GGGGG1314R9Z6', '1. Payment is due within 30 days from the invoice date unless otherwise agreed in writing.\\n2. A late fee of 1.5% per month will be applied to overdue balances.\\n3. Any disputes regarding this invoice must be communicated within 15 days of receipts.\\n4. All payments should be made via the methods specified on the invoice.', '2024-12-17 20:02:11', 'A3'),
('AC04', 'Abhishek Gor', '101, Shakti Flora, 9B Prankunj Society, Kankaria, Ahmedabad', '8000721554', 'abhishekgor@hotmail.com', 'BADGP9433M', 'NA', 'General', '2024-12-17 20:02:11', 'A3');

-- --------------------------------------------------------

--
-- Table structure for table `owner_firms_banks`
--

CREATE TABLE `owner_firms_banks` (
  `id` char(8) NOT NULL,
  `owner_firm_id` char(4) NOT NULL,
  `name` varchar(100) NOT NULL,
  `account_number` varchar(50) NOT NULL,
  `ifsc_code` varchar(20) NOT NULL,
  `branch_name` varchar(100) NOT NULL,
  `entry_at` datetime NOT NULL DEFAULT current_timestamp(),
  `entry_by_id` char(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `owner_firms_banks`
--

INSERT INTO `owner_firms_banks` (`id`, `owner_firm_id`, `name`, `account_number`, `ifsc_code`, `branch_name`, `entry_at`, `entry_by_id`) VALUES
('BK01', 'AC01', 'HDFC Bank Limited', '50200093685321', 'HDFC0000383', 'Naranpura Branch', '2024-12-17 20:03:18', 'A1'),
('BK02', 'AC02', 'Bandhan Bank', '10210010518171', 'BDBL0001474', 'Panchwati Branch', '2024-12-17 20:03:18', 'A1'),
('BK03', 'AC03', 'HDFC Bank', '50200061991892', 'HDFC0005064', 'Motera Branch', '2024-12-17 20:03:18', 'A1'),
('BK04', 'AC04', 'Bank Of Baroda', '18260100014353', 'BARB0BHAIRA', 'Bhairavnath Ahmedabad', '2024-12-17 20:03:18', 'A1');

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `module` varchar(50) NOT NULL,
  `type` enum('Base','Derived') DEFAULT NULL,
  `sequence` int(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `module`, `type`, `sequence`) VALUES
(1, 'Affiliates', 'Affiliates', 'Base', 5),
(2, 'Delete Affiliate', 'Affiliates', 'Derived', 0),
(3, 'Edit Affiliate', 'Affiliates', 'Derived', 0),
(4, 'Cash Flow', 'Cash Flow', 'Base', 8),
(5, 'Delete Cash Flow', 'Cash Flow', 'Derived', 0),
(6, 'Edit Cash Flow', 'Cash Flow', 'Derived', 0),
(7, 'Clients', 'Clients', 'Base', 4),
(8, 'Delete Client', 'Clients', 'Derived', 0),
(9, 'Edit Client', 'Clients', 'Derived', 0),
(10, 'Companies', 'Companies', 'Base', 9),
(11, 'Delete Company', 'Companies', 'Derived', 0),
(12, 'Edit Company', 'Companies', 'Derived', 0),
(13, 'Dashboard', 'Dashboard', 'Base', 1),
(14, 'Employees', 'Employees', 'Base', 10),
(15, 'Delete Employee ', 'Employees', 'Derived', 0),
(16, 'Edit Employee', 'Employees', 'Derived', 0),
(17, 'Inquiries', 'Inquiries', 'Base', 2),
(18, 'Delete Inquiry', 'Inquiries', 'Derived', 0),
(19, 'Edit Inquiry', 'Inquiries', 'Derived', 0),
(20, 'New Inquiry', 'Inquiries', 'Derived', 0),
(21, 'New Project', 'Inquiries', 'Derived', 0),
(22, 'Invoices', 'Invoices', 'Base', 7),
(23, 'Delete Invoice', 'Invoices', 'Derived', 0),
(24, 'Edit Invoice', 'Invoices', 'Derived', 0),
(25, 'New Invoice', 'Invoices', 'Derived', 0),
(26, 'Owners', 'Owners', 'Base', 6),
(27, 'Edit Owner Firm', 'Owners', 'Derived', 0),
(28, 'New Owner Firm', 'Owners', 'Derived', 0),
(29, 'Projects', 'Projects', 'Base', 3),
(30, 'Delete Project', 'Projects', 'Derived', 0),
(31, 'Edit Project', 'Projects', 'Derived', 0),
(32, 'View Payment Received', 'Projects', 'Derived', 0),
(33, 'References', 'References', 'Base', 11),
(34, 'Delete Reference', 'References', 'Derived', 0),
(35, 'Edit Reference', 'References', 'Derived', 0),
(36, 'Tasks', 'Tasks', 'Base', 12),
(37, 'Delete Particular And Remark', 'Tasks', 'Derived', 0),
(38, 'Delete Task', 'Tasks', 'Derived', 0),
(39, 'Delete Task From Reimburse Voucher', 'Tasks', 'Derived', 0),
(40, 'Disable Task', 'Tasks', 'Derived', 0),
(41, 'Edit Particular And Remark', 'Tasks', 'Derived', 0),
(42, 'Edit Task', 'Tasks', 'Derived', 0),
(43, 'Enable Task', 'Tasks', 'Derived', 0),
(44, 'Mark Sub Task Completed', 'Tasks', 'Derived', 0),
(45, 'Mark Task Completed', 'Tasks', 'Derived', 0),
(46, 'New Task', 'Tasks', 'Derived', 0);

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
('spire', '[{\"db\":\"spire\",\"table\":\"invoices_payment_history\"},{\"db\":\"spire\",\"table\":\"owner_firms_banks\"},{\"db\":\"spire\",\"table\":\"tasks_settings\"},{\"db\":\"spire\",\"table\":\"cash_flows_settings\"},{\"db\":\"spire\",\"table\":\"projects_settings\"},{\"db\":\"spire\",\"table\":\"owner_firms\"},{\"db\":\"spire\",\"table\":\"projects\"},{\"db\":\"spire\",\"table\":\"invoices\"},{\"db\":\"spire\",\"table\":\"tasks_particulars_remarks\"},{\"db\":\"spire\",\"table\":\"tasks\"}]');

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
('spire', '2025-01-28 13:37:12', '{\"Console\\/Mode\":\"collapse\"}');

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
  `client_id` char(8) NOT NULL,
  `company_id` char(8) NOT NULL,
  `affiliate_ids` varchar(2000) DEFAULT NULL,
  `inquiry_id` char(8) NOT NULL,
  `invoice_firm_id` varchar(4) NOT NULL,
  `government_id` varchar(100) DEFAULT NULL,
  `main_project_id` char(8) NOT NULL,
  `sub_project_id` char(8) NOT NULL,
  `quote` decimal(10,2) NOT NULL CHECK (`quote` >= 0),
  `due_on` datetime NOT NULL DEFAULT current_timestamp(),
  `total_affiliate_fees` decimal(10,2) DEFAULT NULL,
  `reimbursement_voucher` decimal(10,2) NOT NULL CHECK (`reimbursement_voucher` >= 0),
  `invoice_fees` decimal(10,2) NOT NULL CHECK (`invoice_fees` >= 0),
  `teams` varchar(500) NOT NULL,
  `started_on` datetime NOT NULL DEFAULT current_timestamp(),
  `status` enum('Active','Completed','Cancelled','Closed','Hold') NOT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `is_edited` tinyint(1) DEFAULT 0,
  `entry_at` datetime NOT NULL DEFAULT current_timestamp(),
  `entry_by_id` char(8) NOT NULL,
  `completed_on` datetime DEFAULT NULL,
  `reason` varchar(1000) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `client_id`, `company_id`, `affiliate_ids`, `inquiry_id`, `invoice_firm_id`, `government_id`, `main_project_id`, `sub_project_id`, `quote`, `due_on`, `total_affiliate_fees`, `reimbursement_voucher`, `invoice_fees`, `teams`, `started_on`, `status`, `is_deleted`, `is_edited`, `entry_at`, `entry_by_id`, `completed_on`, `reason`) VALUES
('PJ000001', 'CN000001', 'CP000001', 'AF000001', 'IQ000001', 'AC01', 'PJ1/22/12/2024', 'MP000004', 'SP000003', 5750.00, '2024-12-15 04:09:42', 5000.00, 1250.00, 575.00, 'A3,A2', '2024-12-17 23:48:41', 'Active', 0, 0, '2024-12-17 23:48:41', 'A3', NULL, NULL),
('PJ000002', 'CN000005', 'CP000002', 'AF000001', 'IQ000007', 'AC02', NULL, 'MP000001', 'SP000010', 2500.00, '2025-01-30 21:23:36', 1250.00, 1000.00, 1500.00, 'A3', '2025-01-12 11:41:51', 'Completed', 0, 0, '2025-01-12 11:41:51', 'A3', '2025-01-30 00:51:35', NULL),
('PJ000003', 'CN000004', 'CP000003', NULL, 'IQ000005', 'AC03', NULL, 'MP000012', 'SP000023', 2050.00, '2025-01-04 18:30:00', NULL, 550.00, 1500.00, 'A1', '2025-01-28 23:46:17', 'Active', 0, 0, '2025-01-28 23:46:17', 'A3', NULL, NULL);

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
-- Table structure for table `reimburse_vouchers`
--

CREATE TABLE `reimburse_vouchers` (
  `id` int(11) NOT NULL,
  `custom_id` varchar(100) NOT NULL,
  `client_id` char(8) DEFAULT NULL,
  `project_id` char(8) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL CHECK (`amount` >= 0),
  `expense` decimal(10,2) NOT NULL CHECK (`expense` >= 0),
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `receipt_date` datetime DEFAULT current_timestamp(),
  `payment_received` tinyint(1) NOT NULL DEFAULT 0
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
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` char(8) NOT NULL,
  `client_id` char(8) NOT NULL,
  `project_id` char(8) NOT NULL,
  `task` varchar(255) NOT NULL,
  `due_on` date NOT NULL,
  `entry_by_id` char(8) NOT NULL,
  `expense` decimal(10,2) NOT NULL CHECK (`expense` >= 0),
  `is_completed` tinyint(1) NOT NULL DEFAULT 0,
  `is_disabled` tinyint(1) NOT NULL DEFAULT 0,
  `reason` varchar(500) DEFAULT NULL,
  `completed_on` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `client_id`, `project_id`, `task`, `due_on`, `entry_by_id`, `expense`, `is_completed`, `is_disabled`, `reason`, `completed_on`) VALUES
('TK000001', 'CN000001', 'PJ000001', 'Task #1', '2025-01-21', 'A3', 5100.00, 1, 0, 'Nice.', NULL),
('TK000002', 'CN000001', 'PJ000001', 'Task #3', '2025-01-15', 'A3', 450.00, 1, 0, 'Hello.', NULL),
('TK000003', 'CN000001', 'PJ000001', 'Task #2', '2025-01-30', 'A3', 1500.00, 0, 0, NULL, NULL),
('TK000004', 'CN000001', 'PJ000001', 'Task #4', '2025-02-01', 'A3', 100.00, 0, 0, NULL, NULL),
('TK000005', 'CN000005', 'PJ000002', 'Task #1', '2025-02-01', 'A3', 500.00, 1, 0, 'Yes.', NULL),
('TK000006', 'CN000005', 'PJ000002', 'Task #2', '2025-02-01', 'A3', 750.00, 1, 0, 'Lol.', NULL),
('TK000007', 'CN000004', 'PJ000003', 'Task @1', '2025-03-05', 'A3', 2500.00, 0, 0, NULL, NULL),
('TK000008', 'CN000005', 'PJ000002', 'One', '2025-02-06', 'A3', 50.00, 1, 0, 'Done.', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tasks_particulars_remarks`
--

CREATE TABLE `tasks_particulars_remarks` (
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
-- Dumping data for table `tasks_particulars_remarks`
--

INSERT INTO `tasks_particulars_remarks` (`id`, `task_id`, `project_id`, `particular`, `remark`, `is_completed`, `reason`, `entry_by_id`, `entry_at`) VALUES
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
(18, 'TK000008', 'PJ000002', 'Like', 'Mike', 1, 'By Administrator', 'A3', '2025-01-30 00:29:00');

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
('RF000005', 'CN000005', 'Ritesh Rami', NULL, NULL, NULL, 0, '2025-01-12 11:18:02', NULL, NULL, 0, NULL, NULL, '2025-01-12 11:18:02', NULL);

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
  ADD KEY `fk_affiliates_projects_affiliate_id` (`affiliate_id`),
  ADD KEY `fk_affiliates_projects_client_id` (`client_id`),
  ADD KEY `fk_affiliates_projects_project_id` (`project_id`);

--
-- Indexes for table `cash_flows`
--
ALTER TABLE `cash_flows`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cash_flows_settings`
--
ALTER TABLE `cash_flows_settings`
  ADD PRIMARY KEY (`id`);

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
-- Indexes for table `invoices_payment_history`
--
ALTER TABLE `invoices_payment_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoices_payment_history_project_id` (`project_id`);

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
-- Indexes for table `owner_firms`
--
ALTER TABLE `owner_firms`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email_address` (`email_address`);

--
-- Indexes for table `owner_firms_banks`
--
ALTER TABLE `owner_firms_banks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_owner_firms_banks_owner_firm_id` (`owner_firm_id`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
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
  ADD KEY `fk_project_invoice_firm_id` (`invoice_firm_id`);

--
-- Indexes for table `projects_settings`
--
ALTER TABLE `projects_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `reimburse_vouchers`
--
ALTER TABLE `reimburse_vouchers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_reimburse_vouchers_client_id` (`client_id`),
  ADD KEY `fk_reimburse_vouchers_project_id` (`project_id`);

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
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_task_client_id` (`client_id`),
  ADD KEY `fk_task_project_id` (`project_id`);

--
-- Indexes for table `tasks_particulars_remarks`
--
ALTER TABLE `tasks_particulars_remarks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_task_particulars_remarks_task_id` (`task_id`),
  ADD KEY `fk_task_particulars_remarks_project_id` (`project_id`);

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
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activities`
--
ALTER TABLE `activities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=287;

--
-- AUTO_INCREMENT for table `affiliates_projects`
--
ALTER TABLE `affiliates_projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `cash_flows`
--
ALTER TABLE `cash_flows`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `cash_flows_settings`
--
ALTER TABLE `cash_flows_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `invoices_payment_history`
--
ALTER TABLE `invoices_payment_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `licenses`
--
ALTER TABLE `licenses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notes`
--
ALTER TABLE `notes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

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
-- AUTO_INCREMENT for table `reimburse_vouchers`
--
ALTER TABLE `reimburse_vouchers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `statuses`
--
ALTER TABLE `statuses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `tasks_particulars_remarks`
--
ALTER TABLE `tasks_particulars_remarks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `tasks_settings`
--
ALTER TABLE `tasks_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `affiliates_projects`
--
ALTER TABLE `affiliates_projects`
  ADD CONSTRAINT `fk_affiliates_projects_affiliate_id` FOREIGN KEY (`affiliate_id`) REFERENCES `affiliates` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_affiliates_projects_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  ADD CONSTRAINT `fk_affiliates_projects_project_id` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`);

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
-- Constraints for table `invoices_payment_history`
--
ALTER TABLE `invoices_payment_history`
  ADD CONSTRAINT `invoices_payment_history_project_id` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`);

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
-- Constraints for table `owner_firms_banks`
--
ALTER TABLE `owner_firms_banks`
  ADD CONSTRAINT `fk_owner_firms_banks_owner_firm_id` FOREIGN KEY (`owner_firm_id`) REFERENCES `owner_firms` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `fk_project_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  ADD CONSTRAINT `fk_project_company_id` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  ADD CONSTRAINT `fk_project_inquiry_id` FOREIGN KEY (`inquiry_id`) REFERENCES `inquiries` (`id`),
  ADD CONSTRAINT `fk_project_invoice_firm_id` FOREIGN KEY (`invoice_firm_id`) REFERENCES `owner_firms` (`id`),
  ADD CONSTRAINT `fk_project_main_project_id` FOREIGN KEY (`main_project_id`) REFERENCES `main_projects` (`id`),
  ADD CONSTRAINT `fk_project_sub_project_id` FOREIGN KEY (`sub_project_id`) REFERENCES `sub_projects` (`id`);

--
-- Constraints for table `reimburse_vouchers`
--
ALTER TABLE `reimburse_vouchers`
  ADD CONSTRAINT `fk_reimburse_vouchers_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  ADD CONSTRAINT `fk_reimburse_vouchers_project_id` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`);

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `fk_task_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  ADD CONSTRAINT `fk_task_project_id` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`);

--
-- Constraints for table `tasks_particulars_remarks`
--
ALTER TABLE `tasks_particulars_remarks`
  ADD CONSTRAINT `fk_task_particulars_remarks_project_id` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  ADD CONSTRAINT `fk_task_particulars_remarks_task_id` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
