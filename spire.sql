SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;


CREATE TABLE `activities` (
  `id` int(11) NOT NULL,
  `user_id` varchar(8) NOT NULL,
  `activity` varchar(255) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `user_agent` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `session_id` varchar(255) NOT NULL,
  `details` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `administrators` (
  `id` char(2) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email_address` varchar(100) NOT NULL,
  `password` text NOT NULL,
  `address` varchar(500) NOT NULL,
  `birth_date` date DEFAULT NULL,
  `gender` enum('Male','Female','Other','Prefer not to say') NOT NULL,
  `phone_number` varchar(15) NOT NULL,
  `designation` varchar(100) NOT NULL,
  `permissions` mediumtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `administrators` (`id`, `first_name`, `last_name`, `username`, `email_address`, `password`, `address`, `birth_date`, `gender`, `phone_number`, `designation`, `permissions`) VALUES
('A1', 'Drashti', 'Sharma', 'DrashtiSharma', 'drashti@admins.spire.com', '0bccca92fe490584540ab07538c09229:ec533eb2bd2592ee7e5682d288be16d63cab8f799dbe99cd30fea4a421583f5b2ef26d5a3b86b602e7b64f24a01767e654b46ca18e3437adf82d579d5cdfc07e', '', '1993-10-05', 'Female', '9998733006', 'Founder, CEO', '-1'),
('A2', 'Abhishek', 'Gor', 'AbhishekGor', 'abhishek@admins.spire.com', '09100481e99086ad3caf3a7713c3b49e:653f4d886e519f11316658e8361cd3d39c257f320a2cf1a3ecd7c5b92f2b7efac0f313493f2ef2a8a16eaa112f2f81f4bf950c848093e81b8dc869af0d25fb63', '', '1993-07-13', 'Male', '8000721554', 'Founder, CEO', '-1'),
('A3', 'Kush', 'Acharya', 'KushAcharya', 'kush@admins.spire.com', '733c1afcb5748d3b316ee48ca440759b:5f509fc5bea6a1a5c0cee090ef8c1e22572fb300f63bce30de8fa39c87bdfa54bd556a89227fc4f87d5d3c14f5c5b563801d88796661333b8f84e32dbf2480a9', 'AFF8, Aakansha Apartments, Jaymala Cross Roads, Isanpur, Ahmedabad, GJ - 380015', '1993-04-26', 'Male', '8780577704', 'Chief Technical Officer', '-1');

CREATE TABLE `clients` (
  `id` varchar(8) NOT NULL,
  `name` varchar(200) NOT NULL,
  `affiliate_ids` varchar(2000) DEFAULT NULL,
  `company_id` varchar(8) DEFAULT NULL,
  `reference_id` varchar(8) DEFAULT NULL,
  `address` varchar(500) DEFAULT NULL,
  `contact_number` bigint(10) DEFAULT NULL,
  `email_address` varchar(200) DEFAULT NULL,
  `industry` varchar(100) DEFAULT NULL,
  `is_confirmed` tinyint(1) NOT NULL DEFAULT 0,
  `is_deleted` tinyint(1) DEFAULT 0,
  `joined_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `notes` varchar(500) DEFAULT NULL,
  `rating` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `tags` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` varchar(8) NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` varchar(8) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `employees` (
  `id` char(8) NOT NULL,
  `administrator_id` char(2) DEFAULT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `email_address` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `gender` enum('Male','Female','Other','Prefer not to say') DEFAULT NULL,
  `birth_date` date NOT NULL,
  `phone_number` varchar(15) NOT NULL,
  `emergency_contact_name` varchar(100) NOT NULL,
  `emergency_contact_relation` varchar(50) NOT NULL,
  `emergency_contact_phone` varchar(15) NOT NULL,
  `address` text NOT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `pincode` char(6) NOT NULL,
  `department_id` varchar(3) DEFAULT NULL,
  `employment_type` enum('Annually Confirmed','Articleship','Half Yearly Confirmed','Intern','On Contract','Permanent','Quarterly Confirmed') DEFAULT 'Intern',
  `employment_status` enum('Active','Ad-Hoc','Inactive','Intern','On Contract','On Leave','Probation','Resigned','Terminated') DEFAULT 'Active',
  `joining_date` datetime NOT NULL DEFAULT current_timestamp(),
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
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_by` char(8) NOT NULL,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` char(8) DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `inquiries` (
  `id` varchar(8) NOT NULL,
  `client_id` varchar(8) NOT NULL,
  `reference_id` varchar(8) DEFAULT NULL,
  `main_project_id` varchar(8) NOT NULL,
  `sub_project_id` varchar(8) DEFAULT NULL,
  `contact_number` bigint(10) NOT NULL,
  `entry_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `email_address` varchar(200) NOT NULL,
  `follow_ups` varchar(255) NOT NULL,
  `inquiry_type_id` int(11) DEFAULT NULL,
  `is_closed` tinyint(1) DEFAULT 0,
  `closure_reason` varchar(255) DEFAULT NULL,
  `quote` decimal(10,2) NOT NULL DEFAULT 2500.00,
  `status` enum('Closed','Confirmed','Hold','Open') NOT NULL DEFAULT 'Open',
  `tags` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` varchar(8) NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` varchar(8) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `inquiry_types` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` varchar(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `licenses` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `license_key` varchar(255) NOT NULL,
  `encrypted_license_data` text NOT NULL,
  `expiration_date` datetime NOT NULL,
  `status` enum('Active','Expired','Revoked') DEFAULT 'Active',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_by` varchar(8) NOT NULL,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` varchar(8) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `main_projects` (
  `id` varchar(8) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_by` varchar(8) NOT NULL,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` varchar(8) DEFAULT NULL,
  `update_reason` text DEFAULT NULL,
  `status` enum('Active','Cancelled','Closed','Completed','Hold','Inactive') DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `main_projects` (`id`, `name`, `created_at`, `created_by`, `updated_at`, `updated_by`, `update_reason`, `status`) VALUES
('MP000001', 'Accounting', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL, NULL, 'Active'),
('MP000002', 'Company Law', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL, NULL, 'Active'),
('MP000003', 'Consultancy', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL, NULL, 'Active'),
('MP000004', 'Drafting', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL, NULL, 'Active'),
('MP000005', 'FEMA', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL, NULL, 'Active'),
('MP000006', 'FSSAI', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL, NULL, 'Active'),
('MP000007', 'GST', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL, NULL, 'Active'),
('MP000008', 'Income Tax', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL, NULL, 'Active'),
('MP000009', 'LLP', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL, NULL, 'Active'),
('MP000010', 'Others', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL, NULL, 'Active'),
('MP000011', 'Registrations', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL, NULL, 'Active'),
('MP000012', 'Startup', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL, NULL, 'Active'),
('MP000013', 'Trademark', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL, NULL, 'Active');
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

CREATE TABLE `permissions` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `module` varchar(50) NOT NULL,
  `type` enum('Base','Derived') NOT NULL,
  `sidebar_visibility` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `permissions` (`id`, `name`, `module`, `type`, `sidebar_visibility`) VALUES
(1, 'Dashboard', 'Dashboard', 'Base', 1),
(2, 'Inquiries', 'Inquiry', 'Base', 1),
(3, 'New Inquiry', 'Inquiry', 'Derived', 1),
(4, 'Edit Inquiry', 'Inquiry', 'Derived', 0),
(5, 'Delete Inquiry', 'Inquiry', 'Derived', 0),
(6, 'Convert Inquiry To Project', 'Inquiry', 'Derived', 0),
(7, 'Projects', 'Projects', 'Base', 1),
(8, 'Edit Project', 'Projects', 'Derived', 0),
(9, 'Delete Project', 'Projects', 'Derived', 0),
(10, 'Payment Received', 'Projects', 'Derived', 0),
(11, 'Tasks', 'Tasks', 'Base', 1),
(12, 'New Task', 'Tasks', 'Derived', 1),
(13, 'Update Task', 'Tasks', 'Derived', 0),
(14, 'Disable Task', 'Tasks', 'Derived', 0),
(15, 'Mark Task Completed', 'Tasks', 'Derived', 0),
(16, 'Delete Task From Reimbursement Voucher', 'Tasks', 'Derived', 0),
(17, 'Clients', 'Clients', 'Base', 1),
(18, 'Edit Client', 'Clients', 'Derived', 0),
(19, 'Delete Client', 'Clients', 'Derived', 0),
(20, 'Companies', 'Companies', 'Base', 1),
(21, 'Edit Company', 'Companies', 'Derived', 0),
(22, 'Delete Company', 'Companies', 'Derived', 0),
(23, 'Affiliates', 'Affiliates', 'Base', 1),
(24, 'Edit Affiliate', 'Affiliates', 'Derived', 0),
(25, 'Delete Affiliate', 'Affiliates', 'Derived', 0),
(26, 'Admins', 'Admins', 'Base', 1),
(27, 'New Admin Company', 'Admins', 'Derived', 1),
(28, 'Edit Admin Company', 'Admins', 'Derived', 0),
(29, 'Employees', 'Employees', 'Base', 1),
(30, 'Edit Employee', 'Employees', 'Derived', 0),
(31, 'Delete Employee', 'Employees', 'Derived', 0),
(32, 'Invoices', 'Invoices', 'Base', 1),
(33, 'Generate Invoice', 'Invoices', 'Derived', 1),
(34, 'Delete Invoice', 'Invoices', 'Derived', 0),
(35, 'Cash Flow', 'Cash Flow', 'Base', 1),
(36, 'Edit Cash Flow', 'Cash Flow', 'Derived', 0),
(37, 'Delete Cash Flow', 'Cash Flow', 'Derived', 0),
(38, 'References', 'References', 'Base', 1),
(39, 'Edit Reference', 'References', 'Derived', 0),
(40, 'Delete Reference', 'References', 'Derived', 0);

CREATE TABLE `references` (
  `id` varchar(8) NOT NULL,
  `name` varchar(100) NOT NULL,
  `client_id` varchar(8) NOT NULL,
  `address` varchar(200) DEFAULT NULL,
  `contact_number` bigint(10) DEFAULT NULL,
  `email_address` varchar(200) DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `joined_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `notes` varchar(500) DEFAULT NULL,
  `organization` varchar(200) DEFAULT NULL,
  `rating` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `relationship` varchar(100) DEFAULT NULL,
  `tags` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` varchar(8) NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` varchar(8) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `sub_projects` (
  `id` varchar(8) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_by` varchar(8) NOT NULL,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` varchar(8) DEFAULT NULL,
  `update_reason` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `sub_projects` (`id`, `name`, `created_at`, `created_by`, `updated_at`, `updated_by`, `update_reason`) VALUES
('SP000001', 'Accounting', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000002', 'Accounting And Itr', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000003', 'Annual Compliance', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000004', 'Annual Filing', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000005', 'Application', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000006', 'Bdm', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000007', 'Darpan Registration', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000008', 'Drafting Of Terms And Conditions', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000009', 'Esic Registration', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000010', 'Fcgpr', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000011', 'Fla', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000012', 'Fssai Registration', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000013', 'Gst Return', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000014', 'Icegate Modification', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000015', 'Income Tax Return', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000016', 'Independent Director Remuneration', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000017', 'Llp Form Three', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000018', 'Mentorship', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000019', 'Minutes Preparation', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000020', 'Opposition Filing', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000021', 'Pf Registration', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000022', 'Psara Registration', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000023', 'Retainership', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000024', 'Returns', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000025', 'Statutory Audit', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000026', 'Tds Return', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000027', 'Trademark Assignment', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000028', 'Trademark Registration', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000029', 'Trademark Reply', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL);
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


ALTER TABLE `activities`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `administrators`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email_address` (`email_address`);

ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_reference_id` (`reference_id`);

ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email_address` (`email_address`),
  ADD KEY `license_key` (`license_key`);

ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email_address` (`email_address`),
  ADD KEY `fk_admin_id` (`administrator_id`),
  ADD KEY `fk_department_id` (`department_id`);

ALTER TABLE `inquiries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_inquiry_type_id` (`inquiry_type_id`),
  ADD KEY `fk_main_project_id` (`main_project_id`),
  ADD KEY `fk_sub_project_id` (`sub_project_id`);

ALTER TABLE `inquiry_types`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `licenses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `license_key` (`license_key`),
  ADD KEY `customer_id` (`customer_id`);

ALTER TABLE `main_projects`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

ALTER TABLE `references`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_client_id` (`client_id`);

ALTER TABLE `sub_projects`
  ADD PRIMARY KEY (`id`);


ALTER TABLE `activities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `licenses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;


ALTER TABLE `clients`
  ADD CONSTRAINT `fk_reference_id` FOREIGN KEY (`reference_id`) REFERENCES `references` (`id`);

ALTER TABLE `customers`
  ADD CONSTRAINT `fk_license_key` FOREIGN KEY (`license_key`) REFERENCES `licenses` (`license_key`);

ALTER TABLE `employees`
  ADD CONSTRAINT `fk_admin_id` FOREIGN KEY (`administrator_id`) REFERENCES `administrators` (`id`);

ALTER TABLE `inquiries`
  ADD CONSTRAINT `fk_inquiry_type_id` FOREIGN KEY (`inquiry_type_id`) REFERENCES `inquiry_types` (`id`),
  ADD CONSTRAINT `fk_main_project_id` FOREIGN KEY (`main_project_id`) REFERENCES `main_projects` (`id`),
  ADD CONSTRAINT `fk_sub_project_id` FOREIGN KEY (`sub_project_id`) REFERENCES `sub_projects` (`id`);

ALTER TABLE `licenses`
  ADD CONSTRAINT `fk_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`);

ALTER TABLE `references`
  ADD CONSTRAINT `fk_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
