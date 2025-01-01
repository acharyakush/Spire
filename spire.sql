-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 01, 2025 at 08:15 PM
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
  `user_id` char(8) NOT NULL,
  `module` varchar(100) DEFAULT NULL,
  `activity` varchar(5000) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `user_agent` text NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `session_token` varchar(255) NOT NULL,
  `details` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activities`
--

INSERT INTO `activities` (`id`, `user_id`, `module`, `activity`, `ip_address`, `user_agent`, `created_at`, `session_token`, `details`) VALUES
(1, 'A3', 'Inquiries', 'Added <b>IQ000001</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-15 15:28:07', '', ''),
(2, 'A3', 'General', 'Logged out.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-15 23:32:18', '', ''),
(3, 'A3', 'General', 'Logged in.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-16 19:05:52', 'ozL/w8dlz6aBNwTzaig7mJQJAPYIAnOZ8/zIIHgrzFn01Q3ZDsxuQHsbzzIXHiaS2M5Utj4ce3VgrrCdnjm8ZA==', ''),
(4, 'A3', 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Hold</b> to <b>Open</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-16 20:01:07', '', ''),
(5, 'A3', 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Open</b> to Closed.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-16 20:01:12', '', ''),
(6, 'A3', 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Closed</b> to <b>Hold</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-16 20:01:18', '', ''),
(7, 'A3', 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Hold</b> to <b>Open</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-16 20:01:22', '', ''),
(8, 'A3', 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Open</b> to Closed.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-16 20:01:26', '', ''),
(9, 'A3', 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Closed</b> to <b>Open</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-16 20:02:10', '', ''),
(10, 'A3', 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Open</b> to <b>Closed</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-16 20:31:16', '', ''),
(11, 'A3', 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Closed</b> to <b>Open</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-16 20:34:05', '', ''),
(12, 'A3', 'Inquiries', 'Closed <b>IQ000001</b> due to <b>Hello..</b>', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-16 20:38:33', '', ''),
(13, 'A3', 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Closed</b> to <b>Open</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-16 20:39:06', '', ''),
(14, 'A3', 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Open</b> to <b>Hold</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-16 20:39:10', '', ''),
(15, 'A3', 'Inquiries', 'Closed <b>IQ000001</b> due to <b>Bye..</b>', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-16 20:39:18', '', ''),
(16, 'A3', 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Closed</b> to <b>Open</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-16 20:40:04', '', ''),
(17, 'A3', 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Open</b> to <b>Hold</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-16 20:40:38', '', ''),
(18, 'A3', 'Inquiries', 'Closed <b>IQ000001</b> due to <b>Yes</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-16 20:40:49', '', ''),
(19, 'A3', 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Closed</b> to <b>Open</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-16 20:40:57', '', ''),
(20, 'A3', 'Notes', 'Added in <b>IQ000001</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-16 20:52:47', '', ''),
(21, 'A3', 'Notes', 'Added in <b>IQ000001</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-16 20:54:45', '', ''),
(22, 'A3', 'Inquiries', 'Edited <b>IQ000001</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-16 23:26:19', '', ''),
(23, 'A3', 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Open</b> to <b>Hold</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-17 21:35:57', '', ''),
(24, 'A3', 'Inquiries', 'Changed status of <b>IQ000001</b> from <b>Hold</b> to <b>Open</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-17 21:36:01', '', ''),
(59, '', 'General', 'Logged in.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-22 21:38:29', '3/b/wwfGeFOF7QyQOL3KrB98ZtfYHTIZQYjfFKFcCK+aX6Cvq9AWT2LftyfykgzKBAVjssECqoroG/dMeF9/MQ==', ''),
(60, 'A3', 'Projects', 'Updated quote of <b>PJ000001</b> from <b>2500.00</b> to <b>5500</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-22 21:57:22', '', ''),
(61, 'A3', 'Projects', 'Added government id <b>PJ1/22/12/2024</b> in <b>PJ000001</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-22 22:21:31', '', ''),
(62, 'A3', 'Projects', 'Added government id <b>PJ1/22-12-2024</b> in <b>PJ000001</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-22 22:28:31', '', ''),
(63, 'A3', 'General', 'Logged out.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-22 23:12:16', '', ''),
(64, '', 'General', 'Logged in.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-22 23:15:34', 'b7T1l1KUi03yqcLxbfEDMUlz0YyFV1YtLIqEUlhCUXIhVig9CacaChT2/MG6/lkGaTPwM15tno/p9ct2V3Gz9Q==', ''),
(65, 'A3', 'Projects', 'Updated quote of <b>PJ000001</b> from <b>5500.00</b> to <b>5750</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-22 23:24:58', 'b7T1l1KUi03yqcLxbfEDMUlz0YyFV1YtLIqEUlhCUXIhVig9CacaChT2/MG6/lkGaTPwM15tno/p9ct2V3Gz9Q==', ''),
(66, 'A3', 'Projects', 'Added government id <b>PJ1/22/12/2024</b> in <b>PJ000001</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-22 23:27:22', 'b7T1l1KUi03yqcLxbfEDMUlz0YyFV1YtLIqEUlhCUXIhVig9CacaChT2/MG6/lkGaTPwM15tno/p9ct2V3Gz9Q==', ''),
(67, 'A3', 'General', 'Logged out.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-23 00:15:03', 'b7T1l1KUi03yqcLxbfEDMUlz0YyFV1YtLIqEUlhCUXIhVig9CacaChT2/MG6/lkGaTPwM15tno/p9ct2V3Gz9Q==', ''),
(68, '', 'General', 'Logged in.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-23 20:02:22', 'BwqFgqJ2FUyWKaLeoQ8hjMWj59fG3Ml7wumoSh9A2TLArKAum44ezUeRw1sEsvJd/LdFQRvYNLvkjeOmNko/rw==', ''),
(69, 'A3', 'Tasks', 'Added <b>TK000001</b> in <b>PJ000001</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-23 22:48:22', 'BwqFgqJ2FUyWKaLeoQ8hjMWj59fG3Ml7wumoSh9A2TLArKAum44ezUeRw1sEsvJd/LdFQRvYNLvkjeOmNko/rw==', ''),
(70, 'A3', 'General', 'Logged out.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-23 23:35:53', '', ''),
(71, 'A3', 'General', 'Logged in.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-23 23:35:56', 'sc5PsSmJDeky+goIXAGUiMIvWjsrr7OymshGiWnP10Z7MBAGAVVedLCLKKroTmeilh6n3bYjbOq9UwDd6HNUvQ==', ''),
(72, 'A3', 'General', 'Logged out.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-23 23:39:12', 'sc5PsSmJDeky+goIXAGUiMIvWjsrr7OymshGiWnP10Z7MBAGAVVedLCLKKroTmeilh6n3bYjbOq9UwDd6HNUvQ==', ''),
(73, '', 'General', 'Logged in.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-24 19:43:08', 'JLYFYKX7q06sG65LY7801Ap666F8/e88+Cf9SPjZ7X0cc2Oin4swkP+Nre8euOgspt5QsaGB+Mx0iJkT6l0JRQ==', ''),
(74, 'A3', 'Tasks', 'Updated <b>TK000001</b> in <b>PJ000001</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-24 19:53:05', 'JLYFYKX7q06sG65LY7801Ap666F8/e88+Cf9SPjZ7X0cc2Oin4swkP+Nre8euOgspt5QsaGB+Mx0iJkT6l0JRQ==', ''),
(75, 'A3', 'Tasks', 'Updated <b>TK000001</b> in <b>PJ000001</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-24 20:03:44', 'JLYFYKX7q06sG65LY7801Ap666F8/e88+Cf9SPjZ7X0cc2Oin4swkP+Nre8euOgspt5QsaGB+Mx0iJkT6l0JRQ==', ''),
(76, 'A3', 'Tasks', 'Updated <b>TK000001</b> in <b>PJ000001</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-24 20:04:04', 'JLYFYKX7q06sG65LY7801Ap666F8/e88+Cf9SPjZ7X0cc2Oin4swkP+Nre8euOgspt5QsaGB+Mx0iJkT6l0JRQ==', ''),
(77, 'A3', 'Tasks', 'Disabled <b>TK000001</b> due to <b>Nice Try.</b>', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-24 21:37:58', 'JLYFYKX7q06sG65LY7801Ap666F8/e88+Cf9SPjZ7X0cc2Oin4swkP+Nre8euOgspt5QsaGB+Mx0iJkT6l0JRQ==', ''),
(78, 'A3', 'Tasks', 'Enabled <b>TK000001</b> due to <b>Blue</b>', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-24 22:23:35', 'JLYFYKX7q06sG65LY7801Ap666F8/e88+Cf9SPjZ7X0cc2Oin4swkP+Nre8euOgspt5QsaGB+Mx0iJkT6l0JRQ==', ''),
(79, 'A3', 'Tasks', 'Closed <b>TK000001</b> due to <b>Lol</b>', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-24 22:24:17', 'JLYFYKX7q06sG65LY7801Ap666F8/e88+Cf9SPjZ7X0cc2Oin4swkP+Nre8euOgspt5QsaGB+Mx0iJkT6l0JRQ==', ''),
(80, 'A3', 'General', 'Logged out.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-24 22:40:43', 'JLYFYKX7q06sG65LY7801Ap666F8/e88+Cf9SPjZ7X0cc2Oin4swkP+Nre8euOgspt5QsaGB+Mx0iJkT6l0JRQ==', ''),
(81, 'A3', 'General', 'Logged in.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-24 22:40:45', 'yzKcCLif+2pD4FH5ZX0wbWz/iorWYPs16qcR8TXSvum4jsjWg0PusFs19xXm//G7HJVWJPVapV3f4t7ONfGZfA==', ''),
(82, 'A3', 'Tasks', 'Disabled <b>TK000001</b> due to <b>I dont like this task anymore.</b>', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-24 22:43:11', '', ''),
(83, 'A3', 'Tasks', 'Updated <b>TK000001</b> in <b>PJ000001</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-24 22:55:27', '', ''),
(84, 'A3', 'Tasks', 'Enabled <b>TK000001</b> due to <b>NA</b>', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-24 23:12:53', '', ''),
(85, 'A3', 'Tasks', 'Closed <b>TK000001</b> due to <b>Yes</b>', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-24 23:13:08', '', ''),
(86, 'A3', 'General', 'Logged out.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-24 23:59:57', '', ''),
(87, '', 'General', 'Logged in.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-25 16:01:46', '3Z0OAOBrwLZrdWalpYLaGbL6SUWoY92JHX0gQ9sy4HvANTCDECrkf0/48HwyLOTkPJ1IP6Mq85LzojUHRL1UTA==', ''),
(88, '', 'General', 'Logged in.', '::ffff:192.168.1.15', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-25 18:05:49', 'mPgO0KoG9gTrjJH1H05pbup7L3HlBlbI+YNOogYBUTNFzwlq2KTiBLaPXUbkN+G0r6xhLkF5AAl+beafIoj7yA==', ''),
(89, 'A3', 'General', 'Logged out.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-25 19:23:33', '', ''),
(90, '', 'General', 'Logged in.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-25 19:50:06', 'b4FxASSPyqdsuw40mdWJYwGAzas67RZjm5JcLpDz8N33BHUG5ftJQCeiRifShMJRVSLR9eINWsX7Zzv5s5tbpw==', ''),
(91, 'A3', 'General', 'Logged out.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-25 20:38:18', 'b4FxASSPyqdsuw40mdWJYwGAzas67RZjm5JcLpDz8N33BHUG5ftJQCeiRifShMJRVSLR9eINWsX7Zzv5s5tbpw==', ''),
(92, '', 'General', 'Logged in.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-26 18:51:18', 'OqftxFfSHWhmYzyF69mtxjSKDtNJuwFu634vJDRy+4uRoXlTPt10hv3sVmmyyDtgjl8uf5qPTtS4fjSPxmaRSg==', ''),
(93, 'A3', 'Tasks', 'Added <b>TK000002</b> in <b>PJ000001</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-26 19:27:25', 'OqftxFfSHWhmYzyF69mtxjSKDtNJuwFu634vJDRy+4uRoXlTPt10hv3sVmmyyDtgjl8uf5qPTtS4fjSPxmaRSg==', ''),
(94, 'A3', 'Tasks', 'Added <b>TK000001</b> in <b>PJ000001</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-26 20:13:12', '', ''),
(95, 'A3', 'General', 'Logged out.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-27 08:26:40', '', ''),
(96, '', 'General', 'Logged in.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-27 19:34:53', 'YBl02ecMk4kWvFAxtZ6ny9LQM8UyaXeW8GbLQ8yIdrMAgY5bgE9AMexYKAGc4/FiWHACSUE+9SXLxiA3m9QoJQ==', ''),
(97, 'A3', 'Tasks', 'Updated <b>Old Particular: Ledger of Loan</b> => <b>Ledger of Loans</b> of <b>TK000001</b> in <b>PJ000001</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-27 22:18:10', 'YBl02ecMk4kWvFAxtZ6ny9LQM8UyaXeW8GbLQ8yIdrMAgY5bgE9AMexYKAGc4/FiWHACSUE+9SXLxiA3m9QoJQ==', ''),
(98, 'A3', 'Tasks', 'Updated <b>Old Expense: 5000.00</b> => <b>5500.00</b> of <b>TK000001</b> in <b>PJ000001</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-27 22:23:52', 'YBl02ecMk4kWvFAxtZ6ny9LQM8UyaXeW8GbLQ8yIdrMAgY5bgE9AMexYKAGc4/FiWHACSUE+9SXLxiA3m9QoJQ==', ''),
(99, 'A3', 'Tasks', 'Updated <b>Old Expense: 5000.00</b> => <b>4500.00</b> of <b>TK000001</b> in <b>PJ000001</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-27 22:26:20', 'YBl02ecMk4kWvFAxtZ6ny9LQM8UyaXeW8GbLQ8yIdrMAgY5bgE9AMexYKAGc4/FiWHACSUE+9SXLxiA3m9QoJQ==', ''),
(101, 'A3', 'Tasks', 'Updated Task_id from <b>TK000001</b> to <b>undefined</b>, Project_id from <b>PJ000001</b> to <b>undefined</b>, Particular from <b>Ledger of Loans</b> to <b>Ledger of Loans.</b>, Remark from <b>Check CIBIL score for loan eligibility</b> to <b>Check CIBIL score for loan eligibility.</b>, Created_by from <b>A3</b> to <b>undefined</b>, Created_at from <b>2024-12-27T14:20:22.000Z</b> to <b>undefined</b>, Expense from <b>4500.00</b> to <b>5500.00</b>, Rowid from <b>2</b> to <b>undefined</b>, Task from <b>Task #1</b> to <b>Task #2</b> of <b>TK000001</b> in <b>PJ000001</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-27 22:33:52', 'YBl02ecMk4kWvFAxtZ6ny9LQM8UyaXeW8GbLQ8yIdrMAgY5bgE9AMexYKAGc4/FiWHACSUE+9SXLxiA3m9QoJQ==', ''),
(102, 'A3', 'Tasks', 'Updated Due Date from <b>2024-12-25T18:30:00.000Z</b> to <b>Wed Jan 01 2025 00:00:00 GMT+0530 (India Standard Time)</b>, Expense from <b>4500.00</b> to <b>5000.00</b>, Particular from <b>Prepare form for submission</b> to <b>Prepare form for submissions</b>, Task from <b>Task #1</b> to <b>Task #2</b> of <b>TK000001</b> in <b>PJ000001</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-27 22:39:43', 'YBl02ecMk4kWvFAxtZ6ny9LQM8UyaXeW8GbLQ8yIdrMAgY5bgE9AMexYKAGc4/FiWHACSUE+9SXLxiA3m9QoJQ==', ''),
(103, 'A3', 'General', 'Logged out.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-27 23:24:20', '', ''),
(104, '', 'General', 'Logged in.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-28 21:53:41', 'DDVQO7mrIw5x+nDlH5NWCx2lUjGlSnygPVwDxsg3vsug1hJeidzwEet0gU9bdKEU5+ngrO23ij/Sqm3nbY7IkQ==', ''),
(105, 'A3', 'Tasks', 'Updated Remark from <b>Get them from storage server</b> to <b>Get them from storage servers.</b> of <b>TK000001</b> in <b>PJ000001</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-29 22:57:34', '', ''),
(106, 'A3', 'General', 'Logged out.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-29 23:18:52', '', ''),
(107, '', 'General', 'Logged in.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-29 23:19:55', '1IhViwIrtOsnuSffeYPrTuI3NiEK++2WltXOZm0QPyYNIxH+vt8GQq8BycaKKZv8w2XExBDGKYKIvjmiFIZnZA==', ''),
(108, 'A3', 'General', 'Logged out.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-29 23:44:05', '1IhViwIrtOsnuSffeYPrTuI3NiEK++2WltXOZm0QPyYNIxH+vt8GQq8BycaKKZv8w2XExBDGKYKIvjmiFIZnZA==', ''),
(109, '', 'General', 'Logged in.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-31 15:33:54', 'i4YglNpfN7vYIps2KZ8L8CbIni0bo2vNakDOgczebZsZb8tHHDuFK0gutANv6RG1a5HD3xFqkc5bwcaOV0iSQQ==', ''),
(110, 'A3', 'Inquiries', 'Update status of <b>IQ000002</b> to <b>Open</b> from <b>Hold</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-31 16:44:57', 'i4YglNpfN7vYIps2KZ8L8CbIni0bo2vNakDOgczebZsZb8tHHDuFK0gutANv6RG1a5HD3xFqkc5bwcaOV0iSQQ==', ''),
(111, 'A3', 'General', 'Logged out.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2024-12-31 20:41:17', 'i4YglNpfN7vYIps2KZ8L8CbIni0bo2vNakDOgczebZsZb8tHHDuFK0gutANv6RG1a5HD3xFqkc5bwcaOV0iSQQ==', ''),
(112, '', 'General', 'Logged in.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2025-01-01 19:37:06', '75jLubFVJ1xMm3IbdwNQmYj9nIQ6dtOPbkUefbg5RxA1R0GTVVL1MtZ0V9uFXvz/rJ7rghcslFB9zt6tvGinsA==', ''),
(113, 'A3', 'General', 'Logged out.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2025-01-01 21:45:21', '', ''),
(114, '', 'General', 'Logged in.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2025-01-01 21:51:35', 'Wr9XkqBMicVwJpFdR6KxY35BieB68v4rlm/YNzSbRU3J0KrVHk+HiM1LcQT8V4dQvbompArgZfnTy1Yu504csw==', ''),
(115, 'A3', 'Tasks', 'Closed <b>TK000001</b> due to <b>I no longer require this.</b>', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2025-01-01 22:42:41', '', ''),
(116, 'A3', 'Tasks', 'Edited Due Date from <b>2024-12-31T18:30:00.000Z</b> to <b>Tue Jan 21 2025 00:00:00 GMT+0530 (India Standard Time)</b>, Expense from <b>5000.00</b> to <b>5100.00</b>, Task from <b>Task #2</b> to <b>Task #21</b> of <b>TK000001</b> in <b>PJ000001</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2025-01-01 22:59:02', '', ''),
(117, 'A3', 'Tasks', 'Disabled <b>TK000001</b> due to <b>I am done with this task</b>', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2025-01-01 23:00:04', '', ''),
(118, 'A3', 'Tasks', 'Enabled <b>TK000001</b> due to <b>I am not done with it.</b>', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2025-01-01 23:04:02', '', ''),
(119, 'A3', 'Tasks', 'Closed <b>TK000001</b> due to <b>I am done.</b>', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2025-01-01 23:04:25', '', ''),
(120, 'A3', 'Tasks', 'Edited Particular from <b>Prepare documents for load</b> to <b>Prepare documents for loads.</b> of <b>3</b> in <b>PJ000001</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2025-01-01 23:32:39', '', ''),
(121, 'A3', 'Tasks', 'Edited Remark from <b>Get them from storage servers.</b> to <b>Get them from storage servers</b> of <b>3</b> in <b>PJ000001</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2025-01-01 23:32:50', '', ''),
(122, 'A3', 'Tasks', 'Edited Remark from <b>Make sure the internet connectivity is normal</b> to <b>Make sure the internet connectivity is normal.</b> of <b>TK000001</b> in <b>PJ000001</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2025-01-01 23:33:42', '', ''),
(123, 'A3', 'Tasks', 'Added a particular and remark in <b>TK000001</b> in <b>PJ000001</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2025-01-01 23:45:36', '', ''),
(124, 'A3', 'Tasks', 'Edited Task from <b>Task #21</b> to <b>Task #1</b> of <b>TK000001</b> in <b>PJ000001</b>.', 'Localhost', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '2025-01-01 23:53:30', '', '');

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
  `created_by` char(8) NOT NULL,
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `administrators_companies`
--

INSERT INTO `administrators_companies` (`id`, `name`, `address`, `contact_number`, `email_address`, `pan`, `gstin`, `terms_conditions`, `created_at`, `created_by`, `updated_at`) VALUES
('AC01', 'Signiix Advisors', 'D-608, The First, Behind ITC Narmada, Vastrapur - 3800016', '9898110703', 'admin@signiixadvisors.com', 'BBXPA8126Q', '', '1. Payment is due within 30 days from the invoice date unless otherwise agreed in writing.nnn.2. A late fee of 1.5% per month will be applied to overdue balances.nnn.3. Any disputes regarding this invoice must be communicated within 15 days of receipts.nnn.4. All payments should be made via the methods specified on the invoice.', '2024-12-17 20:02:11', 'A1', NULL),
('AC02', 'Branchitects Firm', 'AFF8, Aakansha Flats, Opp Jaymala Cross Roads, Isanpur, Ahmedabad - 3800008', '792265411259', 'support@branchitects.com', 'BBXPA8126A', '', '1. Payment is due within 15 days from the invoice date unless otherwise agreed in writing.nnn.2. A late fee of 3.5% per month will be applied to overdue balances.nnn.3. Any disputes regarding this invoice must be communicated within 30 days of receipt.nnn.4. All payments should be made via the methods specified on the invoice.', '2024-12-17 20:02:11', 'A1', NULL),
('AC03', 'Pandya Sharma', 'D-608, The First, Behind ITC Narmada, Vastrapur - 3800016', '7925460175', 'support@pandya.sharma.com', 'BBXPA8126Q', '29GGGGG1314R9Z6', '1. Payment is due within 30 days from the invoice date unless otherwise agreed in writing.nnn.2. A late fee of 1.5% per month will be applied to overdue balances.nnn.3. Any disputes regarding this invoice must be communicated within 15 days of receipts.nnn.4. All payments should be made via the methods specified on the invoice.', '2024-12-17 20:02:11', 'A3', NULL),
('AC04', 'Abhishek Gor', '101, Shakti Flora, 9B Prankunj Society, Kankaria, Ahmedabad', '8000721554', 'abhishekgor@hotmail.com', 'BADGP9433M', 'NA', 'General', '2024-12-17 20:02:11', 'A3', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `administrators_companies_banks`
--

CREATE TABLE `administrators_companies_banks` (
  `id` char(8) NOT NULL,
  `administrator_company_id` varchar(4) NOT NULL,
  `name` varchar(100) NOT NULL,
  `account_number` varchar(50) NOT NULL,
  `ifsc_code` varchar(20) NOT NULL,
  `branch_name` varchar(100) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_by` char(8) NOT NULL,
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `administrators_companies_banks`
--

INSERT INTO `administrators_companies_banks` (`id`, `administrator_company_id`, `name`, `account_number`, `ifsc_code`, `branch_name`, `created_at`, `created_by`, `updated_at`) VALUES
('BK01', 'AC01', 'HDFC Bank Limited', '50200093685321', 'HDFC0000383', 'Naranpura Branch', '2024-12-17 20:03:18', 'A1', NULL),
('BK02', 'AC02', 'Bandhan Bank', '10210010518171', 'BDBL0001474', 'Panchwati Branch', '2024-12-17 20:03:18', 'A1', NULL),
('BK03', 'AC03', 'HDFC Bank', '50200061991892', 'HDFC0005064', 'Motera Branch', '2024-12-17 20:03:18', 'A1', NULL),
('BK04', 'AC04', 'Bank Of Baroda', '18260100014353', 'BARB0BHAIRA', 'Bhairavnath Ahmedabad', '2024-12-17 20:03:18', 'A1', NULL);

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
  `created_by` char(8) DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `clients`
--

INSERT INTO `clients` (`id`, `affiliate_ids`, `company_id`, `reference_id`, `name`, `address`, `contact_number`, `email_address`, `industry`, `is_confirmed`, `is_deleted`, `joined_on`, `notes`, `rating`, `tags`, `created_at`, `created_by`, `updated_at`) VALUES
('CN000001', NULL, 'CP000001', 'RF000001', 'Kush Acharya', NULL, 8780577704, 'acharyakush2604@gmail.com', NULL, 1, 0, '2024-12-15 15:28:07', NULL, 0, NULL, '2024-12-15 15:28:07', NULL, '2024-12-15 15:28:07'),
('CN000002', NULL, NULL, 'RF000002', 'Kevin Vyas', NULL, 8780577812, 'vyas.kevin@outlook.com', NULL, 0, 0, '2024-12-18 00:05:18', NULL, 0, NULL, '2024-12-18 00:05:18', NULL, '2024-12-18 00:05:18');

-- --------------------------------------------------------

--
-- Table structure for table `companies`
--

CREATE TABLE `companies` (
  `id` char(8) NOT NULL,
  `client_id` char(8) NOT NULL,
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
  `created_by` char(8) NOT NULL,
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `companies`
--

INSERT INTO `companies` (`id`, `client_id`, `name`, `contact_number`, `email_address`, `address`, `pan`, `gst`, `reimbursement_voucher`, `invoice_fees`, `total_affiliate_fees`, `created_at`, `created_by`, `updated_at`) VALUES
('CP000001', 'CN000001', 'Sun Pharma Pvt Ltd', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2024-12-17 23:48:41', 'A3', NULL);

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
  `contact_number` bigint(20) NOT NULL,
  `email_address` varchar(200) NOT NULL,
  `follow_ups` varchar(255) NOT NULL,
  `is_closed` tinyint(1) DEFAULT 0,
  `closure_reason` varchar(255) DEFAULT NULL,
  `quote` decimal(10,2) NOT NULL DEFAULT 2500.00,
  `status` enum('Closed','Confirmed','Hold','Open') NOT NULL DEFAULT 'Open',
  `tags` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `created_by` char(8) NOT NULL,
  `updated_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inquiries`
--

INSERT INTO `inquiries` (`id`, `client_id`, `reference_id`, `main_project_id`, `sub_project_id`, `entry_date`, `contact_number`, `email_address`, `follow_ups`, `is_closed`, `closure_reason`, `quote`, `status`, `tags`, `created_at`, `created_by`, `updated_at`) VALUES
('IQ000001', 'CN000001', 'RF000001', 'MP000004', 'SP000003', '2024-12-15 09:39:42', 8780577704, 'acharyakush2604@gmail.com', 'A1,A2', 0, '', 2500.00, 'Confirmed', NULL, '2024-12-15 15:28:07', 'A3', '2024-12-17 21:38:53'),
('IQ000002', 'CN000002', 'RF000002', 'MP000011', 'SP000006', '2024-12-17 18:23:01', 8780577812, 'vyas.kevin@outlook.com', 'A3', 0, '', 15000.00, 'Open', NULL, '2024-12-18 00:05:18', 'A3', '2024-12-31 16:44:57');

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
  `expense` decimal(10,2) NOT NULL CHECK (`expense` >= 0),
  `creation_date` date NOT NULL DEFAULT current_timestamp(),
  `rv_id` varchar(16) NOT NULL,
  `rv_full_id` varchar(50) NOT NULL,
  `rv_creation_date` date DEFAULT NULL,
  `receipt_date` date DEFAULT NULL,
  `payment_received` tinyint(1) NOT NULL DEFAULT 0
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
  `created_by` char(8) NOT NULL,
  `updated_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `main_projects`
--

CREATE TABLE `main_projects` (
  `id` char(8) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `created_by` char(8) NOT NULL,
  `updated_at` datetime DEFAULT current_timestamp(),
  `update_reason` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `main_projects`
--

INSERT INTO `main_projects` (`id`, `name`, `created_at`, `created_by`, `updated_at`, `update_reason`) VALUES
('MP000001', 'Accounting', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL),
('MP000002', 'Company Law', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL),
('MP000003', 'Consultancy', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL),
('MP000004', 'Drafting', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL),
('MP000005', 'FEMA', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL),
('MP000006', 'FSSAI', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL),
('MP000007', 'GST', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL),
('MP000008', 'Income Tax', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL),
('MP000009', 'LLP', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL),
('MP000010', 'Others', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL),
('MP000011', 'Registrations', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL),
('MP000012', 'Startup', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL),
('MP000013', 'Trademark', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL);

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
  `original_user_id` char(8) NOT NULL,
  `user_id` char(8) NOT NULL,
  `content` varchar(1000) NOT NULL,
  `source` varchar(20) NOT NULL,
  `entry_date` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notes`
--

INSERT INTO `notes` (`id`, `inquiry_id`, `project_id`, `task_id`, `original_user_id`, `user_id`, `content`, `source`, `entry_date`) VALUES
(1, 'IQ000001', NULL, NULL, 'A3', 'A3', 'New client. Reference from CharteredWorks.', 'Inquiries', '2024-12-15 15:28:07'),
(2, 'IQ000001', NULL, NULL, 'A3', 'A3', 'Test inquiry.', 'Inquiries', '2024-12-16 20:52:47'),
(3, 'IQ000001', NULL, NULL, 'A3', 'A3', 'Inquiry note #3', 'Inquiries', '2024-12-16 20:54:45'),
(10, 'IQ000001', 'PJ000001', 'TK000001', 'A3', 'A3', 'First project. Wish me good luck.', 'Projects', '2024-12-17 23:48:41'),
(11, 'IQ000002', NULL, NULL, 'A3', 'A3', 'Lives in Portugal.', 'Inquiries', '2024-12-18 00:05:18');

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
(1, 'Administrators', 'Administrators', 'Base', 6),
(2, 'New Administrator Company', 'Administrators', 'Derived', 0),
(3, 'Edit Administrator Company', 'Administrators', 'Derived', 0),
(4, 'Affiliates', 'Affiliates', 'Base', 5),
(5, 'Edit Affiliate', 'Affiliates', 'Derived', 0),
(6, 'Delete Affiliate', 'Affiliates', 'Derived', 0),
(7, 'Cash Flow', 'Cash Flow', 'Base', 8),
(8, 'Edit Cash Flow', 'Cash Flow', 'Derived', 0),
(9, 'Delete Cash Flow', 'Cash Flow', 'Derived', 0),
(10, 'Clients', 'Clients', 'Base', 4),
(11, 'Edit Client', 'Clients', 'Derived', 0),
(12, 'Delete Client', 'Clients', 'Derived', 0),
(13, 'Companies', 'Companies', 'Base', 9),
(14, 'Edit Company', 'Companies', 'Derived', 0),
(15, 'Delete Company', 'Companies', 'Derived', 0),
(16, 'Dashboard', 'Dashboard', 'Base', 1),
(17, 'Employees', 'Employees', 'Base', 10),
(18, 'Edit Employee', 'Employees', 'Derived', 0),
(19, 'Delete Employee ', 'Employees', 'Derived', 0),
(20, 'Inquiries', 'Inquiry', 'Base', 2),
(21, 'New Inquiry', 'Inquiry', 'Derived', 0),
(22, 'Edit Inquiry', 'Inquiry', 'Derived', 0),
(23, 'Delete Inquiry', 'Inquiry', 'Derived', 0),
(24, 'Convert Inquiry To Project', 'Inquiry', 'Derived', 0),
(25, 'Invoices', 'Invoices', 'Base', 7),
(26, 'Generate Invoice', 'Invoices', 'Derived', 0),
(27, 'Delete Invoice', 'Invoices', 'Derived', 0),
(28, 'Projects', 'Projects', 'Base', 3),
(29, 'Edit Project', 'Projects', 'Derived', 0),
(30, 'Delete Project', 'Projects', 'Derived', 0),
(31, 'Payment Received', 'Projects', 'Derived', 0),
(32, 'References', 'References', 'Base', 11),
(33, 'Edit Reference', 'References', 'Derived', 0),
(34, 'Delete Reference', 'References', 'Derived', 0),
(35, 'Tasks', 'Tasks', 'Base', 12),
(36, 'New Task', 'Tasks', 'Derived', 0),
(37, 'Edit Task', 'Tasks', 'Derived', 0),
(38, 'Enable Task', 'Tasks', 'Derived', 0),
(39, 'Disable Task', 'Tasks', 'Derived', 0),
(40, 'Mark Task Completed', 'Tasks', 'Derived', 0),
(41, 'Delete Task From Reimbursement Voucher', 'Tasks', 'Derived', 0),
(42, 'Delete Particular And Remark', 'Tasks', 'Derived', 0),
(43, 'Edit Particular And Remark', 'Tasks', 'Derived', 0);

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
('spire', '[{\"db\":\"spire\",\"table\":\"tasks_particulars_remarks\"}]');

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
('spire', '2024-12-29 17:29:39', '{\"Console\\/Mode\":\"collapse\"}');

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
  `status` enum('Active','Completed','On Hold','Cancelled') NOT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `is_edited` tinyint(1) DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_by` char(8) NOT NULL,
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `client_id`, `company_id`, `affiliate_ids`, `inquiry_id`, `invoice_firm_id`, `government_id`, `main_project_id`, `sub_project_id`, `quote`, `due_on`, `total_affiliate_fees`, `reimbursement_voucher`, `invoice_fees`, `teams`, `started_on`, `status`, `is_deleted`, `is_edited`, `created_at`, `created_by`, `updated_at`) VALUES
('PJ000001', 'CN000001', 'CP000001', NULL, 'IQ000001', 'AC01', 'PJ1/22/12/2024', 'MP000004', 'SP000003', 5750.00, '2024-12-15 04:09:42', NULL, 1250.00, 575.00, 'A3,A2', '2024-12-17 23:48:41', 'Active', 0, 0, '2024-12-17 23:48:41', 'A3', '2024-12-22 23:27:21');

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
  `created_at` datetime DEFAULT current_timestamp(),
  `created_by` char(8) NOT NULL,
  `updated_at` datetime DEFAULT current_timestamp(),
  `update_reason` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sub_projects`
--

INSERT INTO `sub_projects` (`id`, `name`, `created_at`, `created_by`, `updated_at`, `update_reason`) VALUES
('SP000001', 'Accounting', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL),
('SP000002', 'Accounting And ITR', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL),
('SP000003', 'Annual Compliance', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL),
('SP000004', 'Annual Filing', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL),
('SP000005', 'Application', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL),
('SP000006', 'BDM', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL),
('SP000007', 'Darpan Registration', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL),
('SP000008', 'Drafting Of Terms And Conditions', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL),
('SP000009', 'Esic Registration', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL),
('SP000010', 'FCGPR', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL),
('SP000011', 'FLA', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL),
('SP000012', 'FSSAI Registration', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL),
('SP000013', 'GST Return', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL),
('SP000014', 'Icegate Modification', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL),
('SP000015', 'Income Tax Return', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL),
('SP000016', 'Independent Director Remuneration', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL),
('SP000017', 'LLP Form Three', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL),
('SP000018', 'Mentorship', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL),
('SP000019', 'Minutes Preparation', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL),
('SP000020', 'Opposition Filing', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL),
('SP000021', 'PF Registration', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL),
('SP000022', 'Psara Registration', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL),
('SP000023', 'Retainership', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL),
('SP000024', 'Returns', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL),
('SP000025', 'Statutory Audit', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL),
('SP000026', 'TDS Return', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL),
('SP000027', 'Trademark Assignment', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL),
('SP000028', 'Trademark Registration', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL),
('SP000029', 'Trademark Reply', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL);

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
  `input_by` char(8) NOT NULL,
  `expense` decimal(10,2) NOT NULL CHECK (`expense` >= 0),
  `is_completed` tinyint(1) NOT NULL DEFAULT 0,
  `is_disabled` tinyint(1) NOT NULL DEFAULT 0,
  `reason` varchar(500) DEFAULT NULL,
  `completed_on` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `client_id`, `project_id`, `task`, `due_on`, `input_by`, `expense`, `is_completed`, `is_disabled`, `reason`, `completed_on`) VALUES
('TK000001', 'CN000001', 'PJ000001', 'Task #1', '2025-01-21', 'A3', 5100.00, 0, 0, NULL, NULL);

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
  `created_by` char(8) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tasks_particulars_remarks`
--

INSERT INTO `tasks_particulars_remarks` (`id`, `task_id`, `project_id`, `particular`, `remark`, `created_by`, `created_at`) VALUES
(1, 'TK000001', 'PJ000001', 'Accounts settlement', 'Send documents to CA', 'A3', '2024-12-27 19:50:22'),
(2, 'TK000001', 'PJ000001', 'Ledger of Loans.', 'Check CIBIL score for loan eligibility.', 'A3', '2024-12-27 19:50:22'),
(3, 'TK000001', 'PJ000001', 'Prepare documents for loads.', 'Get them from storage servers', 'A3', '2024-12-27 19:51:20'),
(4, 'TK000001', 'PJ000001', 'Prepare form for submissions', 'First take permission from DS', 'A3', '2024-12-27 19:51:20'),
(5, 'TK000001', 'PJ000001', 'Check status online', 'Make sure the internet connectivity is normal.', 'A3', '2024-12-27 19:52:15'),
(6, 'TK000001', 'PJ000001', 'Pay & Upload', 'No remarks here.', 'A3', '2024-12-27 19:52:15'),
(7, 'TK000001', 'PJ000001', 'Hello', 'Bellow', 'A3', '2025-01-01 23:44:39'),
(8, 'TK000001', 'PJ000001', 'Hi', 'Bye', 'A3', '2025-01-01 23:45:36');

-- --------------------------------------------------------

--
-- Table structure for table `the_references`
--

CREATE TABLE `the_references` (
  `id` char(8) NOT NULL,
  `client_id` char(8) NOT NULL,
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
  `created_by` char(8) DEFAULT NULL,
  `updated_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `the_references`
--

INSERT INTO `the_references` (`id`, `client_id`, `name`, `address`, `contact_number`, `email_address`, `is_deleted`, `joined_on`, `notes`, `organization`, `rating`, `relationship`, `tags`, `created_at`, `created_by`, `updated_at`) VALUES
('RF000001', 'CN000001', 'Yash Chopra', NULL, NULL, NULL, 0, '2024-12-15 15:28:07', NULL, NULL, 0, NULL, NULL, '2024-12-15 15:28:07', NULL, '2024-12-15 15:28:07'),
('RF000002', 'CN000002', 'Vrushank Soni', NULL, NULL, NULL, 0, '2024-12-18 00:05:18', NULL, NULL, 0, NULL, NULL, '2024-12-18 00:05:18', NULL, '2024-12-18 00:05:18');

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
  ADD PRIMARY KEY (`id`);

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
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_invoice_client_id` (`client_id`),
  ADD KEY `fk_invoice_project_id` (`project_id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=125;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

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
-- AUTO_INCREMENT for table `statuses`
--
ALTER TABLE `statuses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `tasks_particulars_remarks`
--
ALTER TABLE `tasks_particulars_remarks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `administrators_companies_banks`
--
ALTER TABLE `administrators_companies_banks`
  ADD CONSTRAINT `fk_administrators_companies_banks_administrator_company_id` FOREIGN KEY (`administrator_company_id`) REFERENCES `administrators_companies` (`id`) ON DELETE CASCADE;

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
  ADD CONSTRAINT `fk_project_invoice_firm_id` FOREIGN KEY (`invoice_firm_id`) REFERENCES `administrators_companies` (`id`),
  ADD CONSTRAINT `fk_project_main_project_id` FOREIGN KEY (`main_project_id`) REFERENCES `main_projects` (`id`),
  ADD CONSTRAINT `fk_project_sub_project_id` FOREIGN KEY (`sub_project_id`) REFERENCES `sub_projects` (`id`);

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
