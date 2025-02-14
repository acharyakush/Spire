-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 14, 2025 at 06:21 PM
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
(286, 'A3', 'General', 'Logged out.', 'Localhost', '2025-01-31 00:15:43', ''),
(287, 'A3', 'General', 'Logged in.', 'Localhost', '2025-01-31 19:22:05', ''),
(288, 'A3', 'General', 'Logged out.', 'Localhost', '2025-01-31 20:11:44', ''),
(289, 'A3', 'General', 'Logged in.', 'Localhost', '2025-01-31 20:11:47', ''),
(290, 'A3', 'General', 'Logged out.', 'Localhost', '2025-01-31 20:12:17', ''),
(291, 'A3', 'General', 'Logged in.', 'Localhost', '2025-01-31 20:24:09', ''),
(292, 'A3', 'New Invoice', 'Generated invoice <b>SA/2024-25/00003</b> for <b>PJ000001</b>', 'Localhost', '2025-01-31 20:52:39', ''),
(293, 'A3', 'New Invoice', 'Generated invoice <b>SA/2024-25/00004</b> for <b>PJ000001</b>', 'Localhost', '2025-01-31 20:57:08', ''),
(294, 'A3', 'New Invoice', 'Generated invoice <b>SA/2024-25/00005</b> for <b>PJ000001</b>', 'Localhost', '2025-01-31 20:58:07', ''),
(295, 'A3', 'New Invoice', 'Generated invoice <b>SA/2024-25/00006</b> for <b>PJ000001</b>', 'Localhost', '2025-01-31 20:58:22', ''),
(296, 'A3', 'New Invoice', 'Generated invoice <b>SA/2024-25/00007</b> for <b>PJ000001</b>', 'Localhost', '2025-01-31 20:58:41', ''),
(297, 'A3', 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000003</b>.', 'Localhost', '2025-01-31 23:01:12', ''),
(298, 'A3', 'Tasks', 'Edited Particular from <b>Hi</b> to <b>His</b> of <b>TK000007</b> in <b>PJ000003</b>.', 'Localhost', '2025-01-31 23:01:18', ''),
(299, 'A3', 'Tasks', 'Edited Remark from <b>Bye</b> to <b>Byes</b> of <b>TK000007</b> in <b>PJ000003</b>.', 'Localhost', '2025-01-31 23:01:24', ''),
(300, 'A3', 'Tasks', 'Edited Task from <b>Task @1</b> to <b>Tasks @1</b> of <b>TK000007</b> in <b>PJ000003</b>.', 'Localhost', '2025-01-31 23:01:31', ''),
(301, 'A3', 'Tasks', 'Disabled <b>TK000007</b> in <b>PJ000003</b> due to <b>Lol.</b>', 'Localhost', '2025-01-31 23:01:53', ''),
(302, 'A3', 'Tasks', 'Enabled <b>TK000007</b> in <b>PJ000003</b> due to <b>Pop.</b>', 'Localhost', '2025-01-31 23:02:13', ''),
(303, 'A3', 'General', 'Logged out.', 'Localhost', '2025-02-01 01:16:15', ''),
(304, 'A3', 'General', 'Logged in.', 'Localhost', '2025-02-01 11:30:30', ''),
(305, 'A3', 'Inquiries', 'Added <b>IQ000011</b>.', 'Localhost', '2025-02-01 12:07:57', ''),
(306, 'A3', 'Inquiries', 'Added <b>IQ000012</b>.', 'Localhost', '2025-02-01 12:16:46', ''),
(307, 'A3', 'Inquiries', 'Added <b>IQ000013</b>.', 'Localhost', '2025-02-01 12:18:42', ''),
(308, 'A3', 'Inquiries', 'Closed <b>IQ000010</b> due to <b>#Hashtag@ 123</b>.', 'Localhost', '2025-02-01 12:19:54', ''),
(309, 'A3', 'Inquiries', 'Edited <b>IQ000007</b>.', 'Localhost', '2025-02-01 12:24:45', ''),
(310, 'A3', 'Inquiries', 'Edited <b>IQ000012</b>.', 'Localhost', '2025-02-01 12:32:52', ''),
(311, 'A3', 'Single Client', 'Edited Email Address from <b>suresh@Yahoo.com</b> to <b>suresh@outlook.com</b>, Phone Number from <b>8780577811</b> to <b>9099300543</b> of <b>CN000006</b>.', 'Localhost', '2025-02-01 13:14:29', ''),
(312, 'A3', 'Single Client', 'Edited Email Address from <b>soni.dipen@gmail.com</b> to <b>change@gmail.com</b>, Phone Number from <b>9909436171</b> to <b>9998733006</b> of <b>CN000005</b>.', 'Localhost', '2025-02-01 13:15:42', ''),
(313, 'A3', 'Inquiries', 'Added <b>IQ000014</b>.', 'Localhost', '2025-02-01 13:39:03', ''),
(314, 'A3', 'Inquiries', 'Added <b>IQ000015</b>.', 'Localhost', '2025-02-01 13:41:07', ''),
(315, 'A3', 'Inquiries', 'Added <b>IQ000016</b>.', 'Localhost', '2025-02-01 13:42:18', ''),
(316, 'A3', 'Inquiries', 'Update status of <b>IQ000015</b> to <b>Hold</b> from <b>Open</b>.', 'Localhost', '2025-02-01 13:42:33', ''),
(317, 'A3', 'Inquiries', 'Closed <b>IQ000014</b> due to <b>Not Interested.</b>.', 'Localhost', '2025-02-01 13:42:42', ''),
(318, 'A3', 'Inquiries', 'Update status of <b>IQ000016</b> to <b>Hold</b> from <b>Open</b>.', 'Localhost', '2025-02-01 13:43:40', ''),
(319, 'A3', 'Inquiries', 'Added <b>PJ000004</b>.', 'Localhost', '2025-02-01 13:44:26', ''),
(320, 'A3', 'Single Client', 'Edited Email Address from <b>salma@salim.com</b> to <b>abhishek@sal.com</b>, Name from <b>Salman</b> to <b>Gor Maharaj</b>, Phone Number from <b>254546816846</b> to <b>8000721554</b> of <b>CN000012</b>.', 'Localhost', '2025-02-01 13:51:09', ''),
(321, 'A3', 'Single Client', 'Edited Name from <b>Sameer</b> to <b>DS</b> of <b>CN000011</b>.', 'Localhost', '2025-02-01 13:51:45', ''),
(322, 'A3', 'Inquiries', 'Added <b>IQ000017</b>.', 'Localhost', '2025-02-01 13:59:09', ''),
(323, 'A3', 'Inquiries', 'Edited <b>IQ000017</b>.', 'Localhost', '2025-02-01 14:04:19', ''),
(324, 'A3', 'Inquiries', 'Edited <b>IQ000004</b>.', 'Localhost', '2025-02-01 14:13:44', ''),
(325, 'A3', 'Inquiries', 'Edited <b>IQ000017</b>.', 'Localhost', '2025-02-01 15:22:13', ''),
(326, 'A3', 'Inquiries', 'Edited <b>IQ000017</b>.', 'Localhost', '2025-02-01 15:24:17', ''),
(327, 'A3', 'Inquiries', 'Added <b>PJ000005</b>.', 'Localhost', '2025-02-01 15:26:58', ''),
(328, 'A3', 'Inquiries', 'Added <b>PJ000006</b>.', 'Localhost', '2025-02-01 15:41:10', ''),
(329, 'A3', 'Inquiries', 'Added <b>PJ000007</b>.', 'Localhost', '2025-02-01 15:43:00', ''),
(330, 'A3', 'Projects', 'Cancelled <b>PJ000001</b> from <b>Active</b>', 'Localhost', '2025-02-01 15:59:05', ''),
(331, 'A3', 'Projects', 'Resumed <b>PJ000001</b> from <b>Cancelled</b>', 'Localhost', '2025-02-01 15:59:12', ''),
(332, 'A3', 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000001</b>.', 'Localhost', '2025-02-01 16:01:19', ''),
(333, 'A3', 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000001</b>.', 'Localhost', '2025-02-01 16:01:35', ''),
(334, 'A3', 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000001</b>.', 'Localhost', '2025-02-01 16:01:44', ''),
(335, 'A3', 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000001</b>.', 'Localhost', '2025-02-01 16:01:49', ''),
(336, 'A3', 'Tasks', 'Deleted particular <b>adnasdnk</b> with remark <b>qdknksdfnkszndf</b> of <b>TK000003</b> in <b>PJ000001</b>', 'Localhost', '2025-02-01 16:01:59', ''),
(337, 'A3', 'Tasks', 'Deleted particular <b>zzzzzzzzzzzzz</b> with remark <b>aaaaaaaaaaaaaaaaa</b> of <b>TK000003</b> in <b>PJ000001</b>', 'Localhost', '2025-02-01 16:02:03', ''),
(338, 'A3', 'Tasks', 'Edited Particular from <b>popopopopop</b> to <b>adnaannnnnnnnnnnnnn</b>, Remark from <b>lolololooo</b> to <b>cv</b> of <b>TK000003</b> in <b>PJ000001</b>.', 'Localhost', '2025-02-01 16:02:18', ''),
(339, 'A3', 'Tasks', 'Edited Particular from <b>vvvvvvvvvvv</b> to <b>r</b>, Remark from <b>sssssssssssssss</b> to <b>t</b> of <b>TK000003</b> in <b>PJ000001</b>.', 'Localhost', '2025-02-01 16:02:26', ''),
(340, 'A3', 'Tasks', 'Marked sub task having <b>adnaannnnnnnnnnnnnn</b> & <b>cv</b> as completed of <b>TK000003</b> in <b>PJ000001</b>', 'Localhost', '2025-02-01 16:03:33', ''),
(341, 'A3', 'Tasks', 'Marked sub task having <b>r</b> & <b>t</b> as completed of <b>TK000003</b> in <b>PJ000001</b>', 'Localhost', '2025-02-01 16:04:15', ''),
(342, 'A3', 'Tasks', 'Marked Task as Completed <b>TK000003</b> in <b>PJ000001</b> due to <b>yyyyy</b>', 'Localhost', '2025-02-01 16:04:23', ''),
(343, 'A3', 'Tasks', 'Marked all sub tasks as completed of <b>TK000003</b> in <b>PJ000001</b>', 'Localhost', '2025-02-01 16:04:23', ''),
(344, 'A3', 'Tasks', 'Disabled <b>TK000004</b> in <b>PJ000001</b> due to <b>rrrrrrrrrrrrr</b>', 'Localhost', '2025-02-01 16:04:33', ''),
(345, 'A3', 'Tasks', 'Enabled <b>TK000004</b> in <b>PJ000001</b> due to <b>xxxxxxxxxx</b>', 'Localhost', '2025-02-01 16:05:18', ''),
(346, 'A3', 'Tasks', 'Disabled <b>TK000004</b> in <b>PJ000001</b> due to <b>xxxxxxxxxx</b>', 'Localhost', '2025-02-01 16:05:39', ''),
(347, 'A3', 'Tasks', 'Enabled <b>TK000004</b> in <b>PJ000001</b> due to <b>vvvvvvv</b>', 'Localhost', '2025-02-01 16:06:07', ''),
(348, 'A3', 'Tasks', 'Deleted <b>TK000004</b> in <b>PJ000001</b>', 'Localhost', '2025-02-01 16:08:33', ''),
(349, 'A3', 'Tasks', 'Added <b>TK000009</b> in <b>PJ000001</b>', 'Localhost', '2025-02-01 16:09:02', ''),
(350, 'A3', 'Tasks', 'Disabled <b>TK000009</b> in <b>PJ000001</b> due to <b>Ret.</b>', 'Localhost', '2025-02-01 16:09:16', ''),
(351, 'A3', 'Tasks', 'Deleted <b>TK000009</b> in <b>PJ000001</b>', 'Localhost', '2025-02-01 16:22:07', ''),
(352, 'A3', 'Tasks', 'Marked project <b>PJ000001</b> completed.', 'Localhost', '2025-02-01 16:22:16', ''),
(353, 'A3', 'Projects', '<b>PJ000003</b> kept on <b>Hold</b> from <b>Active</b>', 'Localhost', '2025-02-01 16:23:09', ''),
(354, 'A3', 'Projects', '<b>PJ000004</b> kept on <b>Hold</b> from <b>Active</b>', 'Localhost', '2025-02-01 16:23:13', ''),
(355, 'A3', 'Projects', '<b>PJ000005</b> kept on <b>Hold</b> from <b>Active</b>', 'Localhost', '2025-02-01 16:23:18', ''),
(356, 'A3', 'Projects', '<b>PJ000006</b> kept on <b>Hold</b> from <b>Active</b>', 'Localhost', '2025-02-01 16:23:27', ''),
(357, 'A3', 'Projects', '<b>PJ000007</b> kept on <b>Hold</b> from <b>Active</b>', 'Localhost', '2025-02-01 16:23:32', ''),
(358, 'A3', 'Projects', 'Resumed <b>PJ000007</b> from <b>Hold</b>', 'Localhost', '2025-02-01 16:24:36', ''),
(359, 'A3', 'Projects', 'Resumed <b>PJ000006</b> from <b>Hold</b>', 'Localhost', '2025-02-01 16:24:58', ''),
(360, 'A3', 'Projects', 'Resumed <b>PJ000005</b> from <b>Hold</b>', 'Localhost', '2025-02-01 16:25:00', ''),
(361, 'A3', 'Projects', 'Resumed <b>PJ000004</b> from <b>Hold</b>', 'Localhost', '2025-02-01 16:25:03', ''),
(362, 'A3', 'Projects', 'Resumed <b>PJ000003</b> from <b>Hold</b>', 'Localhost', '2025-02-01 16:25:05', ''),
(363, 'A3', 'Tasks', 'Added <b>TK000009</b> in <b>PJ000004</b>', 'Localhost', '2025-02-01 16:25:42', ''),
(364, 'A3', 'Tasks', 'Edited Expense from <b>2525.00</b> to <b>4545</b> of <b>TK000009</b> in <b>PJ000004</b>.', 'Localhost', '2025-02-01 16:26:26', ''),
(365, 'A3', 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000004</b>.', 'Localhost', '2025-02-01 16:26:30', ''),
(366, 'A3', 'Tasks', 'Deleted particular <b>c</b> with remark <b>v</b> of <b>TK000009</b> in <b>PJ000004</b>', 'Localhost', '2025-02-01 16:28:29', ''),
(367, 'A3', 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000004</b>.', 'Localhost', '2025-02-01 16:28:33', ''),
(368, 'A3', 'Tasks', 'Added <b>TK000010</b> in <b>PJ000005</b>', 'Localhost', '2025-02-01 16:28:53', ''),
(369, 'A3', 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000005</b>.', 'Localhost', '2025-02-01 16:28:59', ''),
(370, 'A3', 'Tasks', 'Added <b>TK000011</b> in <b>PJ000007</b>', 'Localhost', '2025-02-01 16:29:23', ''),
(371, 'A3', 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000007</b>.', 'Localhost', '2025-02-01 16:29:30', ''),
(372, 'A3', 'Tasks', 'Added <b>TK000012</b> in <b>PJ000001</b>', 'Localhost', '2025-02-01 16:30:02', ''),
(373, 'A3', 'Projects', 'Resumed <b>PJ000001</b> from <b>Completed</b>', 'Localhost', '2025-02-01 16:42:57', ''),
(374, 'A3', 'Projects', '<b>PJ000003</b> kept on <b>Hold</b> from <b>Active</b>', 'Localhost', '2025-02-01 16:46:52', ''),
(375, 'A3', 'Projects', '<b>PJ000005</b> kept on <b>Hold</b> from <b>Active</b> due to <b>vvvvvvvvvvvvv</b>', 'Localhost', '2025-02-01 16:49:53', ''),
(376, 'A3', 'Projects', 'Resumed <b>PJ000005</b> from <b>Hold</b>', 'Localhost', '2025-02-01 16:51:22', ''),
(377, 'A3', 'Tasks', 'Added <b>TK000013</b> in <b>PJ000005</b>', 'Localhost', '2025-02-01 16:52:32', ''),
(378, 'A3', 'Tasks', 'Deleted particular <b>v</b> with remark <b>v</b> of <b>TK000010</b> in <b>PJ000005</b>', 'Localhost', '2025-02-01 16:56:38', ''),
(379, 'A3', 'Tasks', 'Deleted <b>TK000010</b> in <b>PJ000005</b>', 'Localhost', '2025-02-01 16:56:43', ''),
(380, 'A3', 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000005</b>.', 'Localhost', '2025-02-01 16:57:36', ''),
(381, 'A3', 'Tasks', 'Added <b>TK000014</b> in <b>PJ000005</b>', 'Localhost', '2025-02-01 16:57:40', ''),
(382, 'A3', 'Tasks', 'Deleted <b>TK000014</b> in <b>PJ000005</b>', 'Localhost', '2025-02-01 17:03:42', ''),
(383, 'A3', 'Tasks', 'Deleted particular <b>c</b> with remark <b>c</b> of <b>TK000013</b> in <b>PJ000005</b>', 'Localhost', '2025-02-01 17:03:52', ''),
(384, 'A3', 'Tasks', 'Deleted <b>TK000013</b> in <b>PJ000005</b>', 'Localhost', '2025-02-01 17:04:09', ''),
(385, 'A3', 'Projects', 'Edited <b>PJ000007</b>.', 'Localhost', '2025-02-01 17:06:41', ''),
(386, 'A3', 'Tasks', 'Marked Task as Completed <b>TK000007</b> in <b>PJ000003</b> due to <b>bbbb</b>', 'Localhost', '2025-02-01 17:08:43', ''),
(387, 'A3', 'Tasks', 'Marked all sub tasks as completed of <b>TK000007</b> in <b>PJ000003</b>', 'Localhost', '2025-02-01 17:08:43', ''),
(388, 'A3', 'Invoices', 'Added transaction in <b></b>.', 'Localhost', '2025-02-01 20:32:37', ''),
(389, 'A3', 'Invoices', 'Added transaction in <b></b>.', 'Localhost', '2025-02-01 20:32:53', ''),
(390, 'A3', 'Projects', 'Mapped <b>(AF000002)</b> to <b>PJ000001</b>.', 'Localhost', '2025-02-01 20:56:32', ''),
(391, 'A3', 'Cash Flow', 'Added <b>Affiliates</b> entry.', 'Localhost', '2025-02-01 20:58:04', ''),
(392, 'A3', 'Projects', 'Mapped <b>(AF000002)</b> to <b>PJ000004</b>.', 'Localhost', '2025-02-01 20:58:48', ''),
(393, 'A3', 'Projects', 'Mapped <b>(AF000002)</b> to <b>PJ000007</b>.', 'Localhost', '2025-02-01 20:59:05', ''),
(394, 'A3', 'General', 'Logged out.', 'Localhost', '2025-02-01 21:46:31', ''),
(395, 'A3', 'General', 'Logged in.', 'Localhost', '2025-02-02 13:50:03', ''),
(396, 'A3', 'Affiliates', 'Added transaction for <b>AF000001</b>.', 'Localhost', '2025-02-02 19:16:39', ''),
(397, 'A3', 'Affiliates', 'Added transaction for <b>AF000001</b>.', 'Localhost', '2025-02-02 19:45:20', ''),
(398, 'A3', 'Affiliates', 'Added transaction for <b>AF000001</b>.', 'Localhost', '2025-02-02 20:56:10', ''),
(399, 'A3', 'Affiliates', 'Added transaction for <b>AF000002</b>.', 'Localhost', '2025-02-02 22:01:48', ''),
(400, 'A3', 'Affiliates', 'Added transaction for <b>AF000002</b>.', 'Localhost', '2025-02-02 22:02:50', ''),
(401, 'A3', 'Affiliates', 'Added transaction for <b>AF000002</b>.', 'Localhost', '2025-02-02 22:06:03', ''),
(402, 'A3', 'Affiliates', 'Added transaction for <b>AF000001</b>.', 'Localhost', '2025-02-02 22:07:33', ''),
(403, 'A3', 'Affiliates', 'Added transaction for <b>AF000002</b>.', 'Localhost', '2025-02-02 22:13:18', ''),
(404, 'A3', 'Affiliates', 'Added transaction for <b>AF000001</b>.', 'Localhost', '2025-02-02 22:18:57', ''),
(405, 'A3', 'Affiliates', 'Added transaction for <b>AF000002</b>.', 'Localhost', '2025-02-02 22:20:01', ''),
(406, 'A3', 'Affiliates', 'Added transaction for <b>Outward Office Expense</b>.', 'Localhost', '2025-02-02 23:26:12', ''),
(407, 'A3', 'Cash Flow', 'Added transaction for <b>Outward Other Expense</b>.', 'Localhost', '2025-02-02 23:32:20', ''),
(408, 'A3', 'Cash Flow', 'Added transaction for <b>Outward Petty Cash</b>.', 'Localhost', '2025-02-02 23:32:47', ''),
(409, 'A3', 'Cash Flow', 'Added transaction for <b>Inward Other Income</b>.', 'Localhost', '2025-02-02 23:33:38', ''),
(410, 'A3', 'General', 'Logged out.', 'Localhost', '2025-02-02 23:43:50', ''),
(411, 'A3', 'General', 'Logged in.', 'Localhost', '2025-02-02 23:43:57', ''),
(412, 'A3', 'General', 'Logged out.', 'Localhost', '2025-02-03 00:01:32', ''),
(413, 'A3', 'General', 'Logged in.', 'Localhost', '2025-02-03 19:33:51', ''),
(414, 'A3', 'Affiliates', 'Added transaction for <b>AF000001</b>.', 'Localhost', '2025-02-03 21:09:53', ''),
(415, 'A3', 'Affiliates', 'Added transaction for <b>AF000001</b>.', 'Localhost', '2025-02-03 21:10:50', ''),
(416, 'A3', 'Cash Flow', 'Added transaction for <b>Outward Office Expense</b>.', 'Localhost', '2025-02-03 21:32:34', ''),
(417, 'A3', 'Cash Flow', 'Added transaction for <b>Outward Office Expense</b>.', 'Localhost', '2025-02-03 21:33:07', ''),
(418, 'A3', 'Cash Flow', 'Added transaction for <b>Outward Office Expense</b>.', 'Localhost', '2025-02-03 21:52:27', ''),
(419, 'A3', 'Cash Flow', 'Added transaction for <b>Outward Office Expense</b>.', 'Localhost', '2025-02-03 21:53:36', ''),
(420, 'A3', 'Cash Flow', 'Added transaction for <b>Outward Office Expense</b>.', 'Localhost', '2025-02-03 21:56:56', ''),
(421, 'A3', 'Inquiries', 'Added <b>PJ000008</b>.', 'Localhost', '2025-02-03 22:56:42', ''),
(422, 'A3', 'General', 'Logged out.', 'Localhost', '2025-02-03 23:29:46', ''),
(423, 'A3', 'General', 'Logged in.', 'Localhost', '2025-02-04 19:53:30', ''),
(424, 'A3', 'Cash Flow', 'Added entity for <b>Office Expense</b>.', 'Localhost', '2025-02-04 22:57:17', ''),
(425, 'A3', 'Cash Flow', 'Added entity for <b>Office Expense</b>.', 'Localhost', '2025-02-05 00:18:24', ''),
(426, 'A3', 'General', 'Logged out.', '', '2025-02-05 00:21:22', ''),
(427, 'A3', 'General', 'Logged in.', 'Localhost', '2025-02-05 00:22:10', ''),
(428, 'A3', 'General', 'Logged out.', '', '2025-02-05 00:24:41', ''),
(429, 'A3', 'General', 'Logged in.', 'Localhost', '2025-02-05 19:42:58', ''),
(430, 'A3', 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000001</b>.', 'Localhost', '2025-02-05 20:13:33', ''),
(431, 'A3', 'Tasks', 'Disabled <b>TK000012</b> in <b>PJ000001</b> due to <b>lolsss.</b>', 'Localhost', '2025-02-05 20:48:23', ''),
(432, 'A3', 'Tasks', 'Enabled <b>TK000012</b> in <b>PJ000001</b> due to <b>molp.</b>', 'Localhost', '2025-02-05 20:50:12', ''),
(433, 'A3', 'General', 'Logged out.', '', '2025-02-05 20:50:38', ''),
(434, 'A3', 'General', 'Logged in.', 'Localhost', '2025-02-05 20:54:36', ''),
(435, 'A3', 'Tasks', 'Edited Expense from <b>0.00</b> to <b>150</b>, Task from <b>zzzzzz</b> to <b>Task #4</b> of <b>TK000012</b> in <b>PJ000001</b>.', 'Localhost', '2025-02-05 21:01:57', ''),
(436, 'A3', 'Tasks', 'Added <b>TK000013</b> in <b>PJ000001</b>', 'Localhost', '2025-02-05 21:21:11', ''),
(437, 'A3', 'Tasks', 'Added <b>TK000014</b> in <b>PJ000001</b>', 'Localhost', '2025-02-05 21:21:19', ''),
(438, 'A3', 'Tasks', 'Added <b>TK000015</b> in <b>PJ000001</b>', 'Localhost', '2025-02-05 21:21:28', ''),
(439, 'A3', 'Tasks', 'Added <b>TK000016</b> in <b>PJ000001</b>', 'Localhost', '2025-02-05 21:21:37', ''),
(440, 'A3', 'Tasks', 'Edited Task from <b>Task 5</b> to <b>Task #5</b> of <b>TK000013</b> in <b>PJ000001</b>.', 'Localhost', '2025-02-05 21:21:46', ''),
(441, 'A3', 'Tasks', 'Added <b>TK000017</b> in <b>PJ000001</b>', 'Localhost', '2025-02-05 21:22:00', ''),
(442, 'A3', 'Tasks', 'Added <b>TK000018</b> in <b>PJ000001</b>', 'Localhost', '2025-02-05 21:22:10', ''),
(443, 'A3', 'Tasks', 'Edited Remark from <b>pl;</b> to <b>pl;s</b> of <b>TK000012</b> in <b>PJ000001</b>.', 'Localhost', '2025-02-05 21:57:01', ''),
(444, 'A3', 'Tasks', 'Added <b>TK000019</b> in <b>PJ000001</b>', 'Localhost', '2025-02-05 22:08:27', ''),
(445, 'A3', 'Tasks', 'Disabled <b>TK000013</b> in <b>PJ000001</b> due to <b>mko</b>', 'Localhost', '2025-02-05 22:18:58', ''),
(446, 'A3', 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000001</b>.', 'Localhost', '2025-02-05 22:21:07', ''),
(447, 'A3', 'Tasks', 'Edited Expense from <b>150.00</b> to <b>157.00</b> of <b>TK000012</b> in <b>PJ000001</b>.', 'Localhost', '2025-02-05 22:21:26', ''),
(448, 'A3', 'Tasks', 'Disabled <b>TK000012</b> in <b>PJ000001</b> due to <b>vcbcvb</b>', 'Localhost', '2025-02-05 22:21:37', ''),
(449, 'A3', 'Tasks', 'Enabled <b>TK000012</b> in <b>PJ000001</b> due to <b>poll.</b>', 'Localhost', '2025-02-05 22:33:28', ''),
(450, 'A3', 'Tasks', 'Edited Expense from <b>157.00</b> to <b>158.00</b> of <b>TK000012</b> in <b>PJ000001</b>.', 'Localhost', '2025-02-05 22:36:14', ''),
(451, 'A3', 'Tasks', 'Disabled <b>TK000012</b> in <b>PJ000001</b> due to <b>mkop</b>', 'Localhost', '2025-02-05 22:36:20', ''),
(452, 'A3', 'Tasks', 'Enabled <b>TK000012</b> in <b>PJ000001</b> due to <b>vvbh</b>', 'Localhost', '2025-02-05 22:36:27', ''),
(453, 'A3', 'Tasks', 'Enabled <b>TK000013</b> in <b>PJ000001</b> due to <b>mlp</b>', 'Localhost', '2025-02-05 22:36:37', ''),
(454, 'A3', 'Tasks', 'Marked Task as Completed <b>TK000012</b> in <b>PJ000001</b> due to <b>bbnju</b>', 'Localhost', '2025-02-05 22:36:47', ''),
(455, 'A3', 'Tasks', 'Marked all sub tasks as completed of <b>TK000012</b> in <b>PJ000001</b>', 'Localhost', '2025-02-05 22:36:47', ''),
(456, 'A3', 'Tasks', 'Edited Task from <b>Task #5</b> to <b>Task #56</b> of <b>TK000013</b> in <b>PJ000001</b>.', 'Localhost', '2025-02-05 23:08:13', ''),
(457, 'A3', 'Tasks', 'Edited Task from <b>Task #56</b> to <b>Task #567</b> of <b>TK000013</b> in <b>PJ000001</b>.', 'Localhost', '2025-02-05 23:08:23', ''),
(458, 'A3', 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000001</b>.', 'Localhost', '2025-02-05 23:10:53', ''),
(459, 'A3', 'Tasks', 'Added <b>TK000020</b> in <b>PJ000006</b>', 'Localhost', '2025-02-05 23:39:47', ''),
(460, 'A3', 'General', 'Logged out.', '', '2025-02-05 23:43:21', ''),
(461, 'A3', 'General', 'Logged in.', 'Localhost', '2025-02-06 18:32:34', ''),
(462, 'A3', 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000001</b>.', 'Localhost', '2025-02-06 18:33:29', ''),
(463, 'A3', 'Tasks', 'Added a particular and remark in <b>undefined</b> in <b>PJ000001</b>.', 'Localhost', '2025-02-06 18:33:37', ''),
(464, 'A3', 'Tasks', 'Disabled <b>TK000013</b> in <b>PJ000001</b> due to <b>mko</b>', 'Localhost', '2025-02-06 18:35:25', ''),
(465, 'A3', 'Tasks', 'Enabled <b>TK000013</b> in <b>PJ000001</b> due to <b>bjhbj</b>', 'Localhost', '2025-02-06 18:35:57', ''),
(466, 'A3', 'Cash Flow', 'Added card for <b>Office Expense</b>.', 'Localhost', '2025-02-06 19:12:41', ''),
(467, 'A3', 'Cash Flow', 'Added card for <b>Office Expense</b>.', 'Localhost', '2025-02-06 19:23:08', ''),
(468, 'A3', 'Cash Flow', 'Added card for <b>2</b> in <b>Canteen</b> in <b>OFEX</b>.', 'Localhost', '2025-02-06 19:35:36', ''),
(469, 'A3', 'Vendors', 'Added vendor(s).', 'Localhost', '2025-02-06 19:44:32', ''),
(470, 'A3', 'Cash Flow', 'Added entity for <b>Petty Cash</b>.', 'Localhost', '2025-02-06 19:59:38', ''),
(471, 'A3', 'Cash Flow', 'Added card for <b>3</b> in <b>pos</b> in <b>PECA</b>.', 'Localhost', '2025-02-06 20:00:03', ''),
(472, 'A3', 'Cash Flow', 'Added card for <b>3</b> in <b>pos</b> in <b>PECA</b>.', 'Localhost', '2025-02-06 20:00:23', ''),
(473, 'A3', 'General', 'Logged out.', '', '2025-02-06 20:52:07', ''),
(474, 'A3', 'General', 'Logged in.', 'Localhost', '2025-02-06 20:55:44', ''),
(475, 'A3', 'Cash Flow', 'Added entity in <b>Office Expense</b>.', 'Localhost', '2025-02-06 22:04:09', ''),
(476, 'A3', 'Cash Flow', 'Added entity in <b>Office Expense</b>.', 'Localhost', '2025-02-06 22:05:21', ''),
(477, 'A3', 'Cash Flow', 'Added head for <b>Tea Stall</b> in <b>Office Expense</b>.', 'Localhost', '2025-02-06 23:21:38', ''),
(478, 'A3', 'Cash Flow', 'Added transaction in <b>1</b>.', 'Localhost', '2025-02-07 00:54:57', ''),
(479, 'A3', 'General', 'Logged out.', '', '2025-02-07 01:19:11', ''),
(480, 'A3', 'General', 'Logged in.', 'Localhost', '2025-02-07 19:34:52', ''),
(481, 'A3', 'Cash Flow', 'Added transaction in <b>Office Expense</b> in Tea Stall in For monthly tea/coffee.', 'Localhost', '2025-02-07 20:00:29', ''),
(482, 'A3', 'Cash Flow', 'Added transaction in <b>Office Expense</b> in Tea Stall in For monthly tea/coffee.', 'Localhost', '2025-02-07 20:01:25', '');
INSERT INTO `activities` (`id`, `entry_by_id`, `module`, `activity`, `ip_address`, `entry_at`, `details`) VALUES
(483, 'A3', 'Cash Flow', 'Added transaction in <b>Office Expense</b> in <b>Canteen</b> in <b>Snacks for Clients</b>.', 'Localhost', '2025-02-07 20:02:38', ''),
(484, 'A3', 'Cash Flow', 'Added transaction in <b>Office Expense</b> in <b>Tea Stall</b> in <b>For monthly tea/coffee</b>.', 'Localhost', '2025-02-07 20:33:29', ''),
(485, 'A3', 'Cash Flow', 'Added transaction in <b>Petty Cash</b>.', 'Localhost', '2025-02-07 22:29:46', ''),
(486, 'A3', 'Cash Flow', 'Added transaction in <b>Petty Cash</b>.', 'Localhost', '2025-02-07 22:30:57', ''),
(487, 'A3', 'Affiliates', 'Added transaction for <b>AF000002</b>.', 'Localhost', '2025-02-07 23:23:56', ''),
(488, 'A3', 'Affiliates', 'Added transaction for <b>AF000002</b>.', 'Localhost', '2025-02-07 23:30:09', ''),
(489, 'A3', 'Cash Flow', 'Added entity <b></b> in <b>Other Income</b>.', 'Localhost', '2025-02-07 23:31:26', ''),
(490, 'A3', 'Cash Flow', 'Added head for <b>abc</b> in <b>Other Income</b>.', 'Localhost', '2025-02-07 23:31:46', ''),
(491, 'A3', 'Cash Flow', 'Added transaction in <b>Other Income</b> in <b>abc</b> in <b>mm</b>.', 'Localhost', '2025-02-07 23:36:31', ''),
(492, 'A3', 'General', 'Logged out.', '', '2025-02-07 23:42:20', ''),
(493, 'A3', 'General', 'Logged in.', 'Localhost', '2025-02-08 18:39:39', ''),
(494, 'A3', 'General', 'Logged in.', 'Localhost', '2025-02-08 18:55:25', ''),
(495, 'A3', 'Affiliates', 'Unmapped affiliate <b>AF000001</b> from <b>PJ000001</b> due to <b>pops</b>.', 'Localhost', '2025-02-08 21:37:17', ''),
(496, 'A3', 'Affiliates', 'Unmapped affiliate <b>AF000001</b> from <b>PJ000001</b> due to <b>mmm</b>.', 'Localhost', '2025-02-08 21:42:45', ''),
(497, 'A3', 'Projects', 'Mapped <b>(AF000001)</b> to <b>PJ000001</b>.', 'Localhost', '2025-02-08 21:51:06', ''),
(498, 'A3', 'Projects', 'Mapped <b>(AF000001,AF000002)</b> to <b>PJ000001</b>.', 'Localhost', '2025-02-08 22:26:56', ''),
(499, 'A3', 'Cash Flow', 'Added head for <b>anuj shah</b> in <b>Office Expense</b>.', 'Localhost', '2025-02-08 22:46:20', ''),
(500, 'A3', 'Cash Flow', 'Added head for <b>anuj shah</b> in <b>Office Expense</b>.', 'Localhost', '2025-02-08 22:54:12', ''),
(501, 'A3', 'Cash Flow', 'Added head for <b>mitesh patel</b> in <b>Office Expense</b>.', 'Localhost', '2025-02-08 22:55:41', ''),
(502, 'A3', 'Cash Flow', 'Added head <b>lolp</b> for <b>mitesh patel</b> in <b>Office Expense</b>.', 'Localhost', '2025-02-08 23:01:29', ''),
(503, 'A3', 'Cash Flow', 'Added head <b>zsxcf</b> for <b>mitesh patel</b> in <b>Office Expense</b>.', 'Localhost', '2025-02-08 23:02:08', ''),
(504, 'A3', 'Cash Flow', 'Added transaction in <b>Office Expense</b> in <b>Tea Stall</b> in <b>For monthly tea/coffee</b>.', 'Localhost', '2025-02-08 23:53:30', ''),
(505, 'A3', 'Cash Flow', 'Edited transaction of <b>Office Expense</b> in <b>Canteen</b> in <b>Snacks for Clients</b>.', 'Localhost', '2025-02-09 00:09:28', ''),
(506, 'A3', 'Cash Flow', 'Edited transaction of <b>Office Expense</b> in <b>Tea Stall</b> in <b>For monthly tea/coffee</b>.', 'Localhost', '2025-02-09 00:11:07', ''),
(507, 'A3', 'Cash Flow', 'Edited transaction of <b>Office Expense</b> in <b>Tea Stall</b> in <b>For monthly tea/coffee</b>.', 'Localhost', '2025-02-09 00:16:09', ''),
(508, 'A3', 'Cash Flow', 'Edited transaction of <b>Office Expense</b> in <b>Tea Stall</b> in <b>For monthly tea/coffee</b>.', 'Localhost', '2025-02-09 00:17:22', ''),
(509, 'A3', 'Cash Flow', 'Edited transaction of <b>Office Expense</b> in <b>Tea Stall</b> in <b>For monthly tea/coffee</b>.', 'Localhost', '2025-02-09 00:18:51', ''),
(510, 'A3', 'Cash Flow', 'Edited transaction of <b>Office Expense</b> in <b>Tea Stall</b> in <b>For monthly tea/coffee</b>.', 'Localhost', '2025-02-09 00:21:00', ''),
(511, 'A3', 'Cash Flow', 'Added transaction in <b>Office Expense</b> in <b>Tea Stall</b> in <b>For monthly tea/coffee</b>.', 'Localhost', '2025-02-09 00:21:21', ''),
(512, 'A3', 'Cash Flow', 'Added transaction in <b>Office Expense</b> in <b>Canteen</b> in <b>Snacks for Clients</b>.', 'Localhost', '2025-02-09 00:22:20', ''),
(513, 'A3', 'Cash Flow', 'Added transaction in <b>Office Expense</b> in <b>anuj shah</b> in <b>snacks of dskr</b>.', 'Localhost', '2025-02-09 00:23:09', ''),
(514, 'A3', 'General', 'Logged out.', '', '2025-02-09 00:24:59', ''),
(515, 'A3', 'General', 'Logged in.', 'Localhost', '2025-02-09 12:17:10', ''),
(516, 'A3', 'General', 'Logged in.', 'Localhost', '2025-02-09 12:42:08', ''),
(517, 'A3', 'Cash Flow', 'Added transaction in <b>Petty Cash</b>.', 'Localhost', '2025-02-09 13:59:47', ''),
(518, 'A3', 'Cash Flow', 'Added transaction in <b>Petty Cash</b>.', 'Localhost', '2025-02-09 14:11:16', ''),
(519, 'A3', 'Cash Flow', 'Added transaction in <b>Petty Cash</b>.', 'Localhost', '2025-02-09 14:12:59', ''),
(520, 'A3', 'Cash Flow', 'Added transaction in <b>Petty Cash</b>.', 'Localhost', '2025-02-09 14:13:49', ''),
(521, 'A3', 'Cash Flow', 'Added transaction in <b>Petty Cash</b>.', 'Localhost', '2025-02-09 14:14:22', ''),
(522, 'A3', 'Cash Flow', 'Added transaction in <b>Petty Cash</b>.', 'Localhost', '2025-02-09 14:15:45', ''),
(523, 'A3', 'Cash Flow', 'Added transaction in <b>Petty Cash</b>.', 'Localhost', '2025-02-09 14:16:31', ''),
(524, 'A3', 'Cash Flow', 'Added transaction in <b>Petty Cash</b>.', 'Localhost', '2025-02-09 14:16:58', ''),
(525, 'A3', 'Cash Flow', 'Added transaction in <b>Petty Cash</b>.', 'Localhost', '2025-02-09 14:17:20', ''),
(526, 'A3', 'Invoices', 'Added transaction in <b></b>.', 'Localhost', '2025-02-09 14:53:58', ''),
(527, 'A3', 'Invoices', 'Added transaction in <b></b>.', 'Localhost', '2025-02-09 16:02:10', ''),
(528, 'A3', 'Invoices', 'Added transaction in <b></b>.', 'Localhost', '2025-02-09 16:09:17', ''),
(529, 'A3', 'Invoices', 'Added transaction in <b></b>.', 'Localhost', '2025-02-09 16:19:37', ''),
(530, 'A3', 'New RV', 'Generated RV <b>SA/2024-25/00001</b> for <b>PJ000001</b>', 'Localhost', '2025-02-09 16:47:19', ''),
(531, 'A3', 'General', 'Logged out.', '', '2025-02-09 23:06:45', ''),
(532, 'A3', 'General', 'Logged in.', 'Localhost', '2025-02-10 20:26:15', ''),
(533, 'A3', 'General', 'Logged out.', '', '2025-02-11 01:04:42', ''),
(534, 'A3', 'General', 'Logged in.', 'Localhost', '2025-02-11 19:20:14', ''),
(535, 'A3', 'Inquiries', 'Added <b>IQ000018</b>.', 'Localhost', '2025-02-11 20:48:05', ''),
(536, 'A3', 'Projects', 'Mapped <b>(null,AF000001,AF000002)</b> to <b>PJ000006</b>.', 'Localhost', '2025-02-11 21:12:56', ''),
(537, 'A3', 'Invoices', 'Added transaction in <b></b>.', 'Localhost', '2025-02-11 21:51:38', ''),
(538, 'A3', 'Cash Flow', 'Added head <b>kjsdnkasjd</b> in <b>Anuj</b>.', 'Localhost', '2025-02-11 23:14:56', ''),
(539, 'A3', 'Invoices', 'Added transaction in <b></b>.', 'Localhost', '2025-02-11 23:20:42', ''),
(540, 'A3', 'Invoices', 'Added transaction in <b></b>.', 'Localhost', '2025-02-11 23:20:52', ''),
(541, 'A3', 'Invoices', 'Added transaction in <b></b>.', 'Localhost', '2025-02-11 23:25:09', ''),
(542, 'A3', 'Invoices', 'Added transaction in <b></b>.', 'Localhost', '2025-02-11 23:26:53', ''),
(543, 'A3', 'Invoices', 'Added transaction in <b></b>.', 'Localhost', '2025-02-11 23:33:31', ''),
(544, 'A3', 'Invoices', 'Added transaction in <b></b>.', 'Localhost', '2025-02-11 23:34:43', ''),
(545, 'A3', 'General', 'Logged out.', '', '2025-02-11 23:40:36', ''),
(546, 'A3', 'General', 'Logged in.', 'Localhost', '2025-02-12 19:27:07', ''),
(547, 'A3', 'General', 'Logged out.', '', '2025-02-12 19:42:28', ''),
(548, 'A3', 'General', 'Logged in.', 'Localhost', '2025-02-12 19:47:17', ''),
(549, 'A3', 'Vendors', 'Added vendor(s).', 'Localhost', '2025-02-12 20:06:49', ''),
(550, 'A3', 'Cash Flow', 'Added head <b>Airtel Broadband Internet</b> in <b>Anuj</b>.', 'Localhost', '2025-02-12 20:08:55', ''),
(551, 'A3', 'Cash Flow', 'Added head <b>Office Sweeper</b> in <b>Manish Patel</b>.', 'Localhost', '2025-02-12 20:12:41', ''),
(552, 'A3', 'Vendors', 'Added transaction for <b>undefined</b>.', 'Localhost', '2025-02-12 21:51:40', ''),
(553, 'A3', 'General', 'Logged out.', '', '2025-02-12 22:02:05', ''),
(554, 'A3', 'General', 'Logged in.', 'Localhost', '2025-02-13 19:25:08', ''),
(555, 'A3', 'General', 'Logged in.', 'Localhost', '2025-02-13 19:33:03', ''),
(556, 'A3', 'General', 'Logged out.', '', '2025-02-13 23:02:20', ''),
(557, 'A3', 'General', 'Logged in.', 'Localhost', '2025-02-14 20:21:30', ''),
(558, 'A3', 'General', 'Logged out.', '', '2025-02-14 21:37:45', '');

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
(1, 'AF000001', 'CN000001', 'PJ000001', NULL, 0.00, 5000.00),
(2, 'AF000001', 'CN000001', 'PJ000001', NULL, 0.00, 5000.00),
(3, 'AF000001', 'CN000001', 'PJ000001', NULL, 0.00, 5000.00),
(4, 'AF000001', 'CN000005', 'PJ000002', NULL, 0.00, 1250.00),
(5, 'AF000002', 'CN000001', 'PJ000001', NULL, 0.00, 500.00),
(6, 'AF000002', 'CN000012', 'PJ000004', NULL, 0.00, 1000.00),
(7, 'AF000002', 'CN000011', 'PJ000007', NULL, 0.00, 2000.00),
(8, 'AF000001', 'CN000001', 'PJ000001', NULL, 0.00, 8550.00),
(9, 'AF000002', 'CN000001', 'PJ000001', NULL, 0.00, 110.00),
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
(4, 'AF000001', 'PJ000002', 'AC01', 'BK01', 88965.00, 'mmk', 'CC', 'Professional Fees', 'ppol', '2025-02-02 15:21:03', 'A3'),
(6, 'AF000002', 'PJ000004', 'AC04', 'BK04', 225.00, 'nnm', 'NETBANKING', 'Professional Fees', 'mmn', '2025-02-19 16:31:25', 'A3'),
(7, 'AF000002', 'PJ000007', 'AC02', 'BK02', 153.00, 'lop', 'CC', 'Reimbursement Voucher', 'njo', '2025-02-02 16:32:33', 'A3'),
(8, 'AF000002', 'PJ000007', 'AC01', 'BK01', 316.00, 'l', 'CHEQUE', 'Reimbursement Voucher', 'b', '2025-02-02 16:35:47', 'A3'),
(9, 'AF000001', 'PJ000001', 'AC02', 'BK02', 1.00, 'm', 'CASH', 'Professional Fees', 'b', '2025-02-02 16:37:14', 'A3'),
(10, 'AF000002', 'PJ000004', 'AC02', 'BK02', 152.00, 'ppol', 'DC', 'Reimbursement Voucher', 'mkop', '2025-02-02 16:42:59', 'A3'),
(11, 'AF000001', 'PJ000002', 'AC04', 'BK04', 1.00, 'mlll', 'CHEQUE', 'Reimbursement Voucher', 'bbm', '2025-02-02 16:48:37', 'A3'),
(12, 'AF000002', 'PJ000004', 'AC03', 'BK03', 99.00, 'op', 'INSTAMOJO', 'Reimbursement Voucher', 'hghg', '2025-02-02 16:49:46', 'A3'),
(13, 'AF000001', 'PJ000001', 'AC04', 'BK04', 8889.00, 'mko', 'CHEQUE', 'Professional Fees', 'mklo', '2025-02-03 15:38:46', 'A3'),
(14, 'AF000001', 'PJ000001', 'AC02', 'BK02', 12.00, 'er', 'BK02', 'Professional Fees', 'tr', '2025-02-05 15:40:37', 'A3'),
(15, 'AF000002', 'PJ000007', 'AC03', 'BK03', 1.00, 'zz', 'CASH', 'Professional Fees', 'aa', '2025-02-07 17:53:43', 'A3'),
(16, 'AF000002', 'PJ000004', 'AC02', 'BK02', 3.00, 'qq', 'CASH', 'Reimbursement Voucher', 'dd', '2025-02-07 17:59:57', 'A3');

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
-- Table structure for table `cash_flows`
--

CREATE TABLE `cash_flows` (
  `id` int(11) UNSIGNED NOT NULL,
  `affiliate_id` char(8) DEFAULT NULL,
  `firm_id` char(8) DEFAULT NULL,
  `bank_id` char(8) DEFAULT NULL,
  `amount_paid` decimal(10,2) DEFAULT NULL,
  `amount_received` decimal(10,2) DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `module` varchar(50) NOT NULL,
  `particulars` varchar(1000) DEFAULT NULL,
  `payment_source` varchar(500) DEFAULT NULL,
  `payment_type` varchar(50) DEFAULT NULL,
  `remarks` varchar(500) DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `entry_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `entry_by_id` char(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cash_flows`
--

INSERT INTO `cash_flows` (`id`, `affiliate_id`, `firm_id`, `bank_id`, `amount_paid`, `amount_received`, `total_amount`, `module`, `particulars`, `payment_source`, `payment_type`, `remarks`, `is_deleted`, `entry_at`, `entry_by_id`) VALUES
(1, NULL, 'AC01', 'BK01', NULL, 500.00, 0.00, 'Office Expense', 'NA', 'Aaj Tak News Subscription.', NULL, '', 0, '2025-01-18 07:16:50', 'A3'),
(2, NULL, 'AC02', 'BK02', NULL, 557.00, 0.00, 'Office Expense', 'NA', 'Aaj Tak News Subscription.', NULL, '', 0, '2025-01-18 07:16:50', 'A3'),
(3, NULL, 'AC02', 'BK02', NULL, 557.00, 0.00, '', 'NA', 'Aaj Tak News Subscription.', NULL, '', 0, '2025-01-18 07:16:50', 'A3'),
(4, '', 'AC01', 'BK01', 0.00, 2500.00, 15750.00, 'Other Income', 'Other Income Particular #1', 'Other Income Payment For #1', 'Professional Fees', 'Other Income Remarks #1', 0, '2025-01-30 07:08:21', 'A3'),
(5, '', 'AC01', 'BK01', 0.00, 2500.00, 15750.00, 'Other Income', 'Other Income Particular #1', 'Other Income Payment For #1', 'Professional Fees', 'Other Income Remarks #1', 0, '2025-01-30 07:08:21', 'A3'),
(6, 'AF000002', 'AC03', 'BK03', 7500.00, 0.00, 0.00, 'Affiliates', 'Affiliates Particulars #1', 'Affiliates Payment For #1', 'Professional Fees', 'Affiliates Remarks #1', 0, '2025-01-30 07:13:24', 'A3'),
(7, 'AF000002', 'AC02', 'BK02', 7500.00, 0.00, 0.00, 'Affiliates', 'Affiliates Particulars #1', 'Affiliates Payment For #1', 'Professional Fees', 'Affiliates Remarks #1', 0, '2025-01-31 07:14:28', 'A3'),
(8, 'AF000001', 'AC04', 'BK04', 7500.00, 0.00, 0.00, 'Affiliates', 'Affiliates Particulars #1', 'Affiliates Payment For #1', 'Professional Fees', 'Affiliates Remarks #1', 0, '2025-01-31 07:24:26', 'A3'),
(9, 'AF000001', 'AC04', 'BK04', 7500.00, 0.00, 0.00, 'Affiliates', 'Affiliates Particulars #1', 'Affiliates Payment For #1', 'Professional Fees', 'Affiliates Remarks #1', 0, '2025-01-31 07:29:19', 'A3'),
(10, '', 'AC01', 'BK01', 3500.00, 0.00, 15750.00, 'Other Expense', 'Other Expense Particulars #1', 'Other Expense Payment For #1', 'Professional Fees', 'Other Expense Remarks #1', 0, '2025-01-30 07:30:36', 'A3'),
(11, '', 'AC03', 'BK03', 5525.00, 0.00, 0.00, 'Office Expense', 'Office Expense Particulars #1', 'Office Expense Payment For #1', 'Professional Fees', 'Office Expense Remarks #1', 0, '2025-01-30 07:31:32', 'A3'),
(12, '', 'AC02', 'BK02', 11500.00, 0.00, 0.00, 'Petty Cash', 'Petty Cash Particulars #1', 'Petty Cash Payment For #1', 'Professional Fees', 'Petty Cash Remarks #1', 0, '2025-01-31 07:32:24', 'A3'),
(13, 'AF000002', 'AC02', 'BK02', 500.00, 0.00, 0.00, 'Affiliates', 'pp', 'bb', 'Professional Fees', 'ppm', 0, '2025-02-01 04:27:35', 'A3'),
(14, NULL, 'AC03', 'BK03', 75.00, 0.00, 0.00, 'Office Expense', 'polll', 'DC', 'Professional Fees', 'jhjhbjbj', 0, '2025-02-02 06:55:46', 'A3'),
(15, NULL, 'AC03', 'BK03', 45.00, 0.00, 15750.00, 'Other Expense', 'p[]', 'CHEQUE', 'Reimbursement Voucher', 'l', 0, '2025-02-20 07:01:56', 'A3'),
(16, NULL, 'AC04', 'BK04', 200.00, 0.00, 0.00, 'Petty Cash', 'popop', 'CC', 'Professional Fees', 'nbjbjbj', 0, '2025-02-02 07:02:30', 'A3'),
(17, NULL, 'AC01', 'BK01', 0.00, 1500.00, 0.00, 'Other Income', 'mlp', 'CHEQUE', 'Professional Fees', 'mklp', 0, '2025-02-06 07:03:09', 'A3'),
(18, NULL, 'AC01', 'BK01', 75.00, 0.00, 0.00, 'Office Expense', '323', 'CHEQUE', 'Professional Fees', '2232', 0, '2025-02-03 05:02:20', 'A3'),
(19, NULL, 'AC01', 'BK01', 25.00, 0.00, 0.00, 'Office Expense', '889', 'BK01', 'Professional Fees', '6665', 0, '2025-02-03 05:02:50', 'A3'),
(20, NULL, 'AC02', 'BK02', 885.00, 0.00, 0.00, 'Office Expense', 'zxc', 'NETBANKING', 'Professional Fees', 'zxc', 0, '2025-02-03 05:19:31', 'A3'),
(21, NULL, 'AC02', 'BK02', 1.00, 0.00, 0.00, 'Office Expense', 'qwe', 'CHEQUE', 'Reimbursement Voucher', 'qwer', 0, '2025-02-03 05:23:09', 'A3'),
(22, NULL, 'AC03', 'BK03', 14.00, 0.00, 0.00, 'Office Expense', 'geret', 'UPI', 'Reimbursement Voucher', '64564564', 0, '2025-02-03 05:26:33', 'A3');

-- --------------------------------------------------------

--
-- Table structure for table `cash_flows_entities`
--

CREATE TABLE `cash_flows_entities` (
  `id` int(11) UNSIGNED NOT NULL,
  `module_id` char(4) NOT NULL,
  `bank_id` char(8) NOT NULL,
  `name` varchar(500) NOT NULL,
  `email_address` varchar(200) DEFAULT NULL,
  `phone_number` bigint(12) DEFAULT NULL,
  `payment_source` varchar(500) NOT NULL,
  `purpose` varchar(500) NOT NULL,
  `upi_id` varchar(200) DEFAULT NULL,
  `entry_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `entry_by_id` char(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cash_flows_entities`
--

INSERT INTO `cash_flows_entities` (`id`, `module_id`, `bank_id`, `name`, `email_address`, `phone_number`, `payment_source`, `purpose`, `upi_id`, `entry_at`, `entry_by_id`) VALUES
(1, 'OFEX', 'BK03', 'Tea Stall', 'ramesh.parmar@gmail.com', 8000721554, 'INSTAMOJO', 'For monthly tea/coffee', 'parmar.ramesh@axl', '2025-02-04 11:55:20', 'A3'),
(2, 'OFEX', 'BK02', 'Canteen', NULL, NULL, 'CC', 'Snacks for Clients', NULL, '2025-02-04 13:12:41', 'A3'),
(3, 'PECA', 'BK02', 'pos', NULL, NULL, 'CC', 'dsdfsd', NULL, '2025-02-06 08:59:08', 'A3'),
(4, 'OFEX', 'BK02', 'anuj shah', '', NULL, 'INSTAMOJO', 'snacks of dskr', '', '2025-02-10 11:03:02', 'A3'),
(5, 'OFEX', 'BK01', 'mitesh patel', 'mitesh.patel@gmail.com', 9978075347, 'CHEQUE', 'new employee induction expense', '', '2025-02-06 11:04:39', 'A3'),
(6, 'OTIN', 'BK03', 'abc', '', 0, 'CASH', 'mm', 'kjdnkajsndkasd', '2025-02-07 12:30:58', 'A3');

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
(14, 5, 'OFEX', 'AC02', 'BK02', 1123.00, 'CC', 'zsxcf', 'eert', '2025-02-08 12:01:29', 'A3');

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
(20, 6, 9, 'OTIN', 'AC02', 'BK02', 524.00, 'ss', 'CHEQUE', 'Professional Fees', 'dd', '2025-02-07 18:06:15', 'A3'),
(21, 1, 3, 'OFEX', 'AC02', 'BK02', 750.00, 'mmlpmm', 'CHEQUE', '', 'mkl', '2025-02-08 07:23:08', 'A3'),
(22, 1, 8, 'OFEX', 'AC03', 'BK03', 114.00, 'njkl', 'CHEQUE', '', 'b', '2025-02-08 18:51:06', 'A3'),
(23, 2, 5, 'OFEX', 'AC04', 'BK04', 55.00, 'd', 'CC', '', 'a', '2025-02-08 18:52:06', 'A3'),
(24, 4, 11, 'OFEX', 'AC02', 'BK02', 1250.00, 'm', 'CHEQUE', '', 'b', '2025-02-08 18:52:55', 'A3');

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
('CN000002', NULL, NULL, 'RF000002', 'Kevin Vyas', NULL, 8780577812, 'vyas.kevin@outlook.com', 0, 0, '2024-12-18 00:05:18', NULL, 0, '2024-12-18 00:05:18', NULL),
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
('CP000002', 'CN000005', 'Vivek Football League', NULL, NULL, NULL, NULL, NULL, NULL, 557.00, 1250088500.00, '2025-01-12 11:41:51', 'A3'),
('CP000003', 'CN000004', 'Mitesh Enterprise', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-01-28 23:46:17', 'A3'),
('CP000004', 'CN000012', 'Being Human', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1000.00, '2025-02-01 13:44:26', 'A3'),
('CP000005', 'CN000007', 'Al Habibi Pvt Ltd', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-02-01 15:26:57', 'A3'),
('CP000006', 'CN000011', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-02-01 15:43:00', 'A3'),
('CP000007', 'CN000011', 'Babul', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-02-01 17:05:28', 'A3'),
('CP000008', 'CN000011', 'Babul', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2000.00, '2025-02-01 17:06:39', 'A3'),
('CP000009', 'CN000001', 'Moon Pharma Pvt Ltd', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-02-03 22:56:42', 'A3');

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
('IQ000018', 'CN000002', 'RF000002', 'MP000003', 'SP000040', '2025-02-11 15:17:00', 8780577812, 'vyas.kevin@outlook.com', 'A2,A3', 0, 0, NULL, 8500.00, 'Open', NULL, '2025-02-11 20:48:04', 'A3');

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
(37, 'IQ000018', NULL, NULL, '', 'A3', 'Hello.', 'Inquiries', '2025-02-11 20:48:04');

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
(46, 'New Task', 'Tasks', 'Derived', 0),
(47, 'RV', 'RV', 'Base', 13),
(48, 'Delete RV', 'RV', 'Derived', 0),
(49, 'Edit RV', 'RV', 'Derived', 0),
(50, 'New RV', 'RV', 'Derived', 0);

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
('PJ000004', 'AF000002', 'CN000012', 'CP000004', 'AC03', NULL, 'IQ000015', 'MP000011', 'SP000025', '2025-01-31 18:30:00', NULL, '2025-02-01 13:44:26', 80000.00, 15000.00, 1000.00, '', 'Active', 'A3,A1', 0, 0, '2025-02-01 13:44:26', 'A3'),
('PJ000005', NULL, 'CN000007', 'CP000005', 'AC01', NULL, 'IQ000010', 'MP000005', 'SP000036', '2026-07-12 18:30:00', NULL, '2025-02-01 15:26:57', 515000.00, 15000.00, NULL, '', 'Active', 'A2', 0, 0, '2025-02-01 15:26:57', 'A3'),
('PJ000006', 'AF000001,AF000002', 'CN000005', 'CP000002', 'AC01', NULL, 'IQ000013', 'MP000007', 'SP000006', '2025-03-02 18:30:00', NULL, '2025-02-01 15:41:09', 500.00, 100.00, 99999999.99, '', 'Active', 'A1,A2,A3', 0, 0, '2025-02-01 15:41:09', 'A3'),
('PJ000007', 'AF000002', 'CN000011', 'CP000008', 'AC01', NULL, 'IQ000014', 'MP000006', 'SP000039', '2025-02-19 13:00:00', NULL, '2025-02-01 15:43:00', 30002.00, 30000.00, 2000.00, '', 'Active', 'A3', 0, 0, '2025-02-01 15:43:00', 'A3'),
('PJ000008', NULL, 'CN000001', 'CP000009', 'AC03', NULL, 'IQ000008', 'MP000005', 'SP000014', '2025-01-11 18:30:00', NULL, '2025-02-03 22:56:42', 123345.00, 123345.00, NULL, NULL, 'Active', 'A1,A3', 0, 0, '2025-02-03 22:56:42', 'A3');

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
(1, 'SA/2024-25/00001', 'CN000001', 'PJ000001', 5750.00, 1292.00, 11516.00, '2025-02-16 11:17:15', '2025-02-09 16:47:19', '2025-02-09 11:17:15');

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
(33, 'TK000013', 'PJ000001', 'pol', 'mkop', 0, NULL, 'A3', '2025-02-06 18:33:37');

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
('TK000020', 'CN000005', 'PJ000006', 'pol', '2025-02-12', 0.00, NULL, 0, 0, NULL, '2025-02-05 23:39:46', 'A3');

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
('VD000002', 'Manish Patel', 'manish.patel@gmail.com', '9978075347', 'manish.patel@oksbi', '2025-02-12 14:36:48', 'Active', '2025-02-12 14:36:48', 'A3');

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
('VH000003', 'VD000002', 'AC03', 'BK03', 5000.00, 'UPI', 'Office Sweeper', 'Cleans efficiently.', '2025-02-10 09:12:00', 'A3');

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
(1, 'VD000001', 'VH000001', 'AC02', 'BK02', 500.00, 'sed', 'CASH', 'Reimbursement Voucher', 'sedddd', '2025-02-12 16:14:07', 'A3');

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
-- Indexes for table `cash_flows`
--
ALTER TABLE `cash_flows`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cash_flows_entities`
--
ALTER TABLE `cash_flows_entities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_cfe_bank_id` (`bank_id`),
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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=559;

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
-- AUTO_INCREMENT for table `cash_flows`
--
ALTER TABLE `cash_flows`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `cash_flows_entities`
--
ALTER TABLE `cash_flows_entities`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `cash_flows_heads`
--
ALTER TABLE `cash_flows_heads`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `cash_flows_settings`
--
ALTER TABLE `cash_flows_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `cash_flows_transactions`
--
ALTER TABLE `cash_flows_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

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
-- AUTO_INCREMENT for table `projects_settings`
--
ALTER TABLE `projects_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `rv`
--
ALTER TABLE `rv`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `tasks_settings`
--
ALTER TABLE `tasks_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `vendors_transactions`
--
ALTER TABLE `vendors_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
  ADD CONSTRAINT `fk_cfe_bank_id` FOREIGN KEY (`bank_id`) REFERENCES `banks` (`id`),
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
