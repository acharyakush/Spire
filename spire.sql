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
('A3', 'Kush', 'Acharya', 'KushAcharya', 'kush@admins.spire.com', '6894393effc2b2bb7c15baf2e0a987b0:2f07a9a58aaacae6420ead6136dd8f6d9eb38e0fdb043e0ada40f2aa12661cd1c70b8e30e35d96f594bce0251dceecc9ac67e2a46b21cac47c03d3fa924aa159', 'AFF8, Aakansha Apartments, Jaymala Cross Roads, Isanpur, Ahmedabad, GJ - 380015', '1993-04-26', 'Male', '8780577704', 'Chief Technical Officer', '-1');

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

CREATE TABLE `departments` (
  `id` varchar(3) NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `domain` enum('Business Consultancy','Event Management') NOT NULL DEFAULT 'Business Consultancy',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_by` varchar(8) NOT NULL DEFAULT 'A1',
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` varchar(8) NOT NULL DEFAULT 'A1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `departments` (`id`, `name`, `description`, `domain`, `created_at`, `created_by`, `updated_at`, `updated_by`) VALUES
('DP1', 'Business Development', 'Handles client acquisitions, partnerships, and business growth strategies.', 'Business Consultancy', '2024-11-08 17:32:37', 'A1', '2024-11-08 17:32:37', 'A1'),
('DP2', 'Tax and Compliance', 'Responsible for tax filings, compliance with regulations, and financial audits.', 'Business Consultancy', '2024-11-08 17:32:37', 'A1', '2024-11-08 17:32:37', 'A1'),
('DP3', 'Legal and Advisory', 'Provides legal consulting and support for clients.', 'Business Consultancy', '2024-11-08 17:32:37', 'A1', '2024-11-08 17:32:37', 'A1'),
('DP4', 'Client Relations', 'Manages client interactions, support, and relationship building.', 'Business Consultancy', '2024-11-08 17:32:37', 'A1', '2024-11-08 17:32:37', 'A1'),
('DP5', 'Event Planning', 'Plans events, coordinates logistics, and manages event timelines.', 'Event Management', '2024-11-08 17:32:37', 'A1', '2024-11-08 17:32:37', 'A1'),
('DP6', 'Vendor Management', 'Handles relationships with vendors and suppliers for events.', 'Event Management', '2024-11-08 17:32:37', 'A1', '2024-11-08 17:32:37', 'A1');
DELIMITER $$
CREATE TRIGGER `generate_new_department_id` BEFORE INSERT ON `departments` FOR EACH ROW BEGIN
    DECLARE new_id VARCHAR(3);
    DECLARE last_id VARCHAR(3);

    -- Fetch the most recent department ID
    SELECT MAX(id) INTO last_id FROM `departments`;

    -- If there is a last ID, increment the number part
    IF last_id IS NOT NULL THEN
        SET new_id = CONCAT('DP', CAST(SUBSTRING(last_id, 3) AS UNSIGNED) + 1);
    ELSE
        -- If no data exists, start with "DP1"
        SET new_id = 'DP1';
    END IF;

    -- Assign the new ID to the department
    SET NEW.id = new_id;
END
$$
DELIMITER ;

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
  `role_id` varchar(3) DEFAULT NULL,
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

CREATE TABLE `licenses` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `license_key` varchar(255) NOT NULL,
  `encrypted_license_data` text NOT NULL,
  `expiration_date` datetime NOT NULL,
  `status` enum('Active','Expired','Revoked') DEFAULT 'Active',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `main_projects` (
  `id` varchar(8) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_by` varchar(8) NOT NULL,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` varchar(8) DEFAULT NULL,
  `update_reason` text DEFAULT NULL,
  `status` enum('Active','Cancelled','Closed','Completed','Hold','Inactive') DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `main_projects` (`id`, `name`, `description`, `created_at`, `created_by`, `updated_at`, `updated_by`, `update_reason`, `status`) VALUES
('MP000001', 'Accounting', 'Projects related to accounting and financial management services.', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL, NULL, 'Active'),
('MP000002', 'Company Law', 'Projects dealing with corporate governance and compliance under company law.', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL, NULL, 'Active'),
('MP000003', 'Consultancy', 'Consultancy services across various business areas and industries.', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL, NULL, 'Active'),
('MP000004', 'Drafting', 'Projects focused on drafting legal documents and contracts.', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL, NULL, 'Active'),
('MP000005', 'FEMA', 'Projects involving the Foreign Exchange Management Act (FEMA) and related compliance.', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL, NULL, 'Active'),
('MP000006', 'FSSAI', 'Projects concerning Food Safety and Standards Authority of India (FSSAI) compliance.', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL, NULL, 'Active'),
('MP000007', 'GST', 'Goods and Services Tax (GST) compliance and advisory projects.', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL, NULL, 'Active'),
('MP000008', 'Income Tax', 'Projects related to income tax planning, filing, and compliance.', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL, NULL, 'Active'),
('MP000009', 'LLP', 'Projects involving Limited Liability Partnership (LLP) compliance and services.', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL, NULL, 'Active'),
('MP000010', 'Others', 'Other miscellaneous projects that do not fall under a specific category.', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL, NULL, 'Active'),
('MP000011', 'Registrations', 'Projects for business registrations and related regulatory compliance.', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL, NULL, 'Active'),
('MP000012', 'Startup', 'Projects focused on startup advisory and support services.', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL, NULL, 'Active'),
('MP000013', 'Trademark', 'Projects related to trademark registration, protection, and advisory.', '2024-11-08 21:35:04', 'A1', '2024-11-08 21:35:04', NULL, NULL, 'Active');
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
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

INSERT INTO `permissions` (`id`, `name`, `module`, `type`, `description`) VALUES
(1, 'View Dashboard', 'Dashboard', 'Base', 'Allows viewing of the dashboard'),
(2, 'Create Inquiry', 'Inquiry', 'Derived', 'Allows creating new inquiries'),
(3, 'View Inquiry', 'Inquiry', 'Base', 'Allows viewing of inquiries'),
(4, 'Edit Inquiry', 'Inquiry', 'Derived', 'Allows editing of inquiries'),
(5, 'Delete Inquiry', 'Inquiry', 'Derived', 'Allows deleting inquiries'),
(6, 'New Inquiry', 'Inquiry', 'Derived', 'Allows creating a new inquiry'),
(7, 'Convert Inquiry To Project', 'Inquiry', 'Derived', 'Allows converting an inquiry to a project'),
(8, 'Create Project', 'Projects', 'Derived', 'Allows creating new projects'),
(9, 'View Project', 'Projects', 'Base', 'Allows viewing of projects'),
(10, 'Edit Project', 'Projects', 'Derived', 'Allows editing of projects'),
(11, 'Delete Project', 'Projects', 'Derived', 'Allows deleting projects'),
(12, 'View Payment Received', 'Projects', 'Derived', 'Allows viewing payments received'),
(13, 'New Task', 'Projects', 'Derived', 'Allows creating a new task'),
(14, 'Update Task', 'Projects', 'Derived', 'Allows updating an existing task'),
(15, 'Disable Task', 'Projects', 'Derived', 'Allows disabling a task'),
(16, 'Mark Task Completed', 'Projects', 'Derived', 'Allows marking a task as completed'),
(17, 'Delete Task From Reimbursement Voucher', 'Projects', 'Derived', 'Allows deleting tasks from reimbursement vouchers'),
(18, 'Add Client', 'Clients', 'Derived', 'Allows adding new clients'),
(19, 'View Clients', 'Clients', 'Base', 'Allows viewing of clients'),
(20, 'Edit Client', 'Clients', 'Derived', 'Allows editing of clients'),
(21, 'Delete Client', 'Clients', 'Derived', 'Allows deleting clients'),
(22, 'Edit Company', 'Clients', 'Derived', 'Allows editing company details'),
(23, 'Delete Company', 'Clients', 'Derived', 'Allows deleting companies'),
(24, 'Add Affiliate', 'Affiliates', 'Derived', 'Allows adding new affiliates'),
(25, 'View Affiliates', 'Affiliates', 'Base', 'Allows viewing of affiliates'),
(26, 'Edit Affiliate', 'Affiliates', 'Derived', 'Allows editing of affiliates'),
(27, 'Delete Affiliate', 'Affiliates', 'Derived', 'Allows deleting affiliates'),
(28, 'Manage Admins', 'Admins', 'Derived', 'Allows management of admin users'),
(29, 'View Admins', 'Admins', 'Base', 'Allows viewing of admin users'),
(30, 'New Employee', 'Admins', 'Derived', 'Allows adding a new employee'),
(31, 'New Admin Company', 'Admins', 'Derived', 'Allows creating a new admin company'),
(32, 'Edit Admin Company', 'Admins', 'Derived', 'Allows editing an admin company'),
(33, 'Generate Invoice', 'Invoices', 'Derived', 'Allows generating invoices'),
(34, 'View Invoices', 'Invoices', 'Base', 'Allows viewing of invoices'),
(35, 'Delete Invoice', 'Invoices', 'Derived', 'Allows deleting invoices'),
(36, 'View Cash Flow', 'Cash Flow', 'Base', 'Allows viewing of cash flow'),
(37, 'Edit Cash Flow', 'Cash Flow', 'Derived', 'Allows editing of cash flow entries'),
(38, 'Delete Cash Flow', 'Cash Flow', 'Derived', 'Allows deleting cash flow entries');

CREATE TABLE `roles` (
  `id` varchar(3) NOT NULL,
  `department_id` varchar(3) DEFAULT NULL,
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_by` varchar(8) NOT NULL DEFAULT 'A1',
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` varchar(8) NOT NULL DEFAULT 'A1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `roles` (`id`, `department_id`, `name`, `description`, `created_at`, `created_by`, `updated_at`, `updated_by`) VALUES
('R1', 'DP1', 'Business Analyst', 'Analyzes business trends and data to inform strategy.', '2024-11-08 17:53:02', 'A1', '2024-11-08 17:53:02', 'A1'),
('R10', 'DP2', 'Event Coordinator', 'Coordinates event details, liaises with vendors, and manages timelines.', '2024-11-08 17:53:02', 'A1', '2024-11-08 17:53:02', 'A1'),
('R11', 'DP2', 'Event Planner', 'Develops event concepts, schedules, and manages client needs.', '2024-11-08 17:53:02', 'A1', '2024-11-08 17:53:02', 'A1'),
('R12', 'DP2', 'Event Manager', 'Oversees all aspects of events from planning to execution.', '2024-11-08 17:53:02', 'A1', '2024-11-08 17:53:02', 'A1'),
('R13', 'DP2', 'Logistics Manager', 'Manages logistics for events, ensuring smooth transportation and setup.', '2024-11-08 17:53:02', 'A1', '2024-11-08 17:53:02', 'A1'),
('R2', 'DP1', 'Business Associate', 'Supports business development activities and client interactions.', '2024-11-08 17:53:02', 'A1', '2024-11-08 17:53:02', 'A1'),
('R3', 'DP1', 'Compliance Associate', 'Assists in ensuring business compliance with regulatory standards.', '2024-11-08 17:53:02', 'A1', '2024-11-08 17:53:02', 'A1'),
('R4', 'DP1', 'HR Officer', 'Handles HR functions, including recruitment, onboarding, and employee support.', '2024-11-08 17:53:02', 'A1', '2024-11-08 17:53:02', 'A1'),
('R5', 'DP1', 'Senior Consultant', 'Leads consultancy projects and provides high-level client advice.', '2024-11-08 17:53:02', 'A1', '2024-11-08 17:53:02', 'A1'),
('R6', 'DP1', 'Junior Consultant', 'Supports senior consultants in research and client projects.', '2024-11-08 17:53:02', 'A1', '2024-11-08 17:53:02', 'A1'),
('R7', 'DP1', 'Office Boy', 'Assists with office tasks and supports team operations.', '2024-11-08 17:53:02', 'A1', '2024-11-08 17:53:02', 'A1'),
('R8', 'DP1', 'Team Leader', 'Leads a team, oversees project execution and coordinates activities.', '2024-11-08 17:53:02', 'A1', '2024-11-08 17:53:02', 'A1'),
('R9', 'DP2', 'Event Assistant', 'Provides support during event setup and management.', '2024-11-08 17:53:02', 'A1', '2024-11-08 17:53:02', 'A1');
DELIMITER $$
CREATE TRIGGER `generate_new_role_id` BEFORE INSERT ON `roles` FOR EACH ROW BEGIN
    DECLARE new_id VARCHAR(3);
    DECLARE last_id VARCHAR(3);
    DECLARE duplicate_check INT DEFAULT 1;

    -- Fetch the most recent role ID (max ID)
    SELECT MAX(id) INTO last_id FROM `roles`;

    -- Generate new ID based on the last ID, starting with R1 if no data exists
    IF last_id IS NOT NULL THEN
        SET new_id = CONCAT('R', CAST(SUBSTRING(last_id, 2) AS UNSIGNED) + 1);
    ELSE
        SET new_id = 'R1';
    END IF;

    -- Check for duplicates and increment if necessary
    WHILE duplicate_check > 0 DO
        -- Check if the new ID already exists
        SELECT COUNT(*) INTO duplicate_check FROM `roles` WHERE id = new_id;

        -- If a duplicate exists, increment the numeric part of new_id
        IF duplicate_check > 0 THEN
            SET new_id = CONCAT('R', CAST(SUBSTRING(new_id, 2) AS UNSIGNED) + 1);
        END IF;
    END WHILE;

    -- Assign the unique new ID to the role
    SET NEW.id = new_id;
END
$$
DELIMITER ;

CREATE TABLE `sub_projects` (
  `id` varchar(8) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_by` varchar(8) NOT NULL,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` varchar(8) DEFAULT NULL,
  `update_reason` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `sub_projects` (`id`, `name`, `description`, `created_at`, `created_by`, `updated_at`, `updated_by`, `update_reason`) VALUES
('SP000001', 'Accounting', 'Projects focused on accounting tasks and financial management.', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000002', 'Accounting And Itr', 'Accounting and Income Tax Return services and compliance.', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000003', 'Annual Compliance', 'Annual compliance for companies, including required filings.', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000004', 'Annual Filing', 'Filing of annual returns and financial statements.', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000005', 'Application', 'Projects involving application filings and submissions.', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000006', 'Bdm', 'Business Development and Management support projects.', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000007', 'Darpan Registration', 'Registration services for NGOs through the Darpan portal.', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000008', 'Drafting Of Terms And Conditions', 'Drafting terms and conditions for various agreements.', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000009', 'Esic Registration', 'Employee State Insurance Corporation (ESIC) registration projects.', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000010', 'Fcgpr', 'Foreign Currency-Gross Provisional Return (FC-GPR) filings.', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000011', 'Fla', 'Foreign Liabilities and Assets (FLA) returns and reporting.', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000012', 'Fssai Registration', 'Food Safety and Standards Authority of India (FSSAI) registration.', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000013', 'Gst Return', 'Goods and Services Tax (GST) return filing and compliance.', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000014', 'Icegate Modification', 'Modifications and services through the ICEGATE portal.', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000015', 'Income Tax Return', 'Income Tax Return (ITR) preparation and filing.', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000016', 'Independent Director Remuneration', 'Projects related to remuneration for independent directors.', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000017', 'Llp Form Three', 'Filing of LLP Form-3 for LLP amendments and agreements.', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000018', 'Mentorship', 'Mentorship services and guidance for business and compliance.', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000019', 'Minutes Preparation', 'Preparation of meeting minutes and documentation.', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000020', 'Opposition Filing', 'Trademark opposition filings and related procedures.', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000021', 'Pf Registration', 'Provident Fund (PF) registration and compliance services.', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000022', 'Psara Registration', 'Registration under the Private Security Agencies Regulation Act (PSARA).', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000023', 'Retainership', 'Retainership projects for ongoing advisory services.', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000024', 'Returns', 'Various compliance and regulatory returns filing.', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000025', 'Statutory Audit', 'Statutory audit services for companies.', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000026', 'Tds Return', 'Tax Deducted at Source (TDS) return preparation and filing.', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000027', 'Trademark Assignment', 'Trademark assignment services and filings.', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000028', 'Trademark Registration', 'Trademark registration services and compliance.', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL),
('SP000029', 'Trademark Reply', 'Responses to trademark objections or office actions.', '2024-11-08 22:10:44', 'A1', '2024-11-08 22:10:44', NULL, NULL);
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

ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email_address` (`email_address`),
  ADD KEY `license_key` (`license_key`);

ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email_address` (`email_address`),
  ADD KEY `fk_admin_id` (`administrator_id`),
  ADD KEY `fk_role_id` (`role_id`),
  ADD KEY `fk_department_id` (`department_id`);

ALTER TABLE `licenses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `license_key` (`license_key`),
  ADD KEY `customer_id` (`customer_id`);

ALTER TABLE `main_projects`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `fk_department_id` (`department_id`) USING BTREE;

ALTER TABLE `sub_projects`
  ADD PRIMARY KEY (`id`);


ALTER TABLE `activities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `licenses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;


ALTER TABLE `customers`
  ADD CONSTRAINT `customers_ibfk_1` FOREIGN KEY (`license_key`) REFERENCES `licenses` (`license_key`);

ALTER TABLE `employees`
  ADD CONSTRAINT `fk_admin_id` FOREIGN KEY (`administrator_id`) REFERENCES `administrators` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_department_id` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_role_id` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `licenses`
  ADD CONSTRAINT `licenses_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`);

ALTER TABLE `roles`
  ADD CONSTRAINT `abc` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
