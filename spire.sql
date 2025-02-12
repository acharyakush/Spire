SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;


CREATE TABLE `activities` (
  `id` int(11) NOT NULL,
  `entry_by_id` char(8) NOT NULL,
  `module` varchar(100) DEFAULT NULL,
  `activity` varchar(5000) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `entry_at` datetime DEFAULT current_timestamp(),
  `details` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

CREATE TABLE `affiliates_projects` (
  `id` int(11) NOT NULL,
  `affiliate_id` char(8) NOT NULL,
  `client_id` char(8) DEFAULT NULL,
  `project_id` char(8) DEFAULT NULL,
  `adjusted_project_id` char(8) DEFAULT NULL,
  `adjusted_fees` decimal(10,2) DEFAULT 0.00,
  `total_fees` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `affiliates_transactions` (
  `id` int(11) NOT NULL,
  `affiliate_id` char(8) NOT NULL,
  `project_id` char(8) NOT NULL,
  `owner_firms_id` char(4) NOT NULL,
  `owner_firms_banks_id` char(8) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `particulars` varchar(500) NOT NULL,
  `payment_source` varchar(500) NOT NULL,
  `payment_type` varchar(50) NOT NULL,
  `remarks` varchar(500) NOT NULL,
  `entry_at` datetime NOT NULL DEFAULT current_timestamp(),
  `entry_by_id` char(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `cash_flows` (
  `id` int(11) UNSIGNED NOT NULL,
  `affiliate_id` char(8) DEFAULT NULL,
  `owner_firms_id` char(8) DEFAULT NULL,
  `owner_firms_banks_id` char(8) DEFAULT NULL,
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

CREATE TABLE `cash_flows_entities` (
  `id` int(11) UNSIGNED NOT NULL,
  `module_id` char(4) NOT NULL,
  `owner_firm_bank_id` char(8) NOT NULL,
  `name` varchar(500) NOT NULL,
  `email_address` varchar(200) DEFAULT NULL,
  `phone_number` bigint(12) DEFAULT NULL,
  `payment_source` varchar(500) NOT NULL,
  `purpose` varchar(500) NOT NULL,
  `upi_id` varchar(200) DEFAULT NULL,
  `entry_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `entry_by_id` char(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `cash_flows_heads` (
  `id` int(11) UNSIGNED NOT NULL,
  `entity_id` int(11) NOT NULL,
  `module_id` char(4) NOT NULL,
  `owner_firm_id` char(8) NOT NULL,
  `owner_firm_bank_id` char(8) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_source` varchar(500) NOT NULL,
  `purpose` varchar(500) NOT NULL,
  `remarks` varchar(500) DEFAULT NULL,
  `entry_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `entry_by_id` char(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `cash_flows_modules` (
  `id` int(11) NOT NULL,
  `custom_id` char(4) NOT NULL,
  `name` varchar(100) NOT NULL,
  `entry_at` datetime NOT NULL,
  `entry_by` char(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `cash_flows_settings` (
  `id` int(11) NOT NULL,
  `key` varchar(200) NOT NULL,
  `value` varchar(5000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `cash_flows_transactions` (
  `id` int(11) NOT NULL,
  `entity_id` int(11) NOT NULL,
  `head_id` int(11) UNSIGNED NOT NULL,
  `module_id` char(4) NOT NULL,
  `owner_firm_id` char(4) NOT NULL,
  `owner_firm_bank_id` char(8) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `particulars` varchar(500) NOT NULL,
  `payment_source` varchar(500) NOT NULL,
  `payment_type` varchar(50) NOT NULL,
  `remarks` varchar(500) NOT NULL,
  `entry_at` datetime NOT NULL DEFAULT current_timestamp(),
  `entry_by_id` char(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

CREATE TABLE `invoices_transactions` (
  `id` int(11) NOT NULL,
  `invoice_custom_id` varchar(100) NOT NULL,
  `project_id` char(8) NOT NULL,
  `entry_at` datetime DEFAULT current_timestamp(),
  `particulars` varchar(255) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `source` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

CREATE TABLE `main_projects` (
  `id` char(8) NOT NULL,
  `name` varchar(255) NOT NULL,
  `entry_at` datetime DEFAULT current_timestamp(),
  `entry_by_id` char(8) NOT NULL,
  `updated_at` datetime DEFAULT current_timestamp(),
  `updated_by` char(8) DEFAULT NULL,
  `update_reason` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

CREATE TABLE `owner_firms` (
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

CREATE TABLE `owner_firms_banks` (
  `id` char(8) NOT NULL,
  `owner_firm_id` char(4) NOT NULL,
  `name` varchar(100) NOT NULL,
  `account_number` varchar(50) NOT NULL,
  `ifsc_code` varchar(20) NOT NULL,
  `branch_name` varchar(100) NOT NULL,
  `upi_id` varchar(200) NOT NULL,
  `entry_at` datetime NOT NULL DEFAULT current_timestamp(),
  `entry_by_id` char(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `permissions` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `module` varchar(50) NOT NULL,
  `type` enum('Base','Derived') DEFAULT NULL,
  `sequence` int(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `petty_cash` (
  `id` int(11) NOT NULL,
  `amount_received` decimal(10,2) NOT NULL,
  `balance` decimal(10,2) NOT NULL,
  `entry_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `petty_cash_transactions` (
  `id` int(11) NOT NULL,
  `owner_firm_id` char(4) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `amount_paid` decimal(10,2) DEFAULT NULL,
  `amount_received` decimal(10,2) DEFAULT NULL,
  `balance` decimal(10,2) NOT NULL,
  `particulars` varchar(500) NOT NULL,
  `payment_type` varchar(50) NOT NULL,
  `remarks` varchar(500) NOT NULL,
  `entry_at` datetime NOT NULL DEFAULT current_timestamp(),
  `entry_by_id` char(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `vendor_id` char(8) DEFAULT NULL,
  `quote` decimal(10,2) NOT NULL CHECK (`quote` >= 0),
  `due_on` datetime NOT NULL DEFAULT current_timestamp(),
  `total_affiliate_fees` decimal(10,2) DEFAULT NULL,
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

CREATE TABLE `projects_settings` (
  `id` int(11) NOT NULL,
  `key` varchar(200) NOT NULL,
  `value` varchar(5000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

CREATE TABLE `rv_transactions` (
  `id` int(11) NOT NULL,
  `rv_custom_id` varchar(100) NOT NULL,
  `project_id` char(8) NOT NULL,
  `entry_at` datetime DEFAULT current_timestamp(),
  `particulars` varchar(255) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `source` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `statuses` (
  `id` int(11) NOT NULL,
  `entity` varchar(50) DEFAULT NULL,
  `statuses` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `sub_projects` (
  `id` char(8) NOT NULL,
  `name` varchar(255) NOT NULL,
  `entry_at` datetime DEFAULT current_timestamp(),
  `entry_by_id` char(8) NOT NULL,
  `updated_at` datetime DEFAULT current_timestamp(),
  `updated_by` char(8) DEFAULT NULL,
  `update_reason` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

CREATE TABLE `tasks_settings` (
  `id` int(11) NOT NULL,
  `key` varchar(200) NOT NULL,
  `value` varchar(5000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

CREATE TABLE `vendors_heads` (
  `id` char(8) NOT NULL,
  `vendor_id` char(8) NOT NULL,
  `owner_firm_id` char(8) NOT NULL,
  `owner_firm_bank_id` char(8) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_source` varchar(500) NOT NULL,
  `purpose` varchar(500) NOT NULL,
  `remarks` varchar(500) DEFAULT NULL,
  `entry_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `entry_by_id` char(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `vendors_transactions` (
  `id` int(11) NOT NULL,
  `vendor_id` char(8) NOT NULL,
  `head_id` char(8) NOT NULL,
  `owner_firms_id` char(4) NOT NULL,
  `owner_firms_banks_id` char(8) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `particulars` varchar(500) NOT NULL,
  `payment_source` varchar(500) NOT NULL,
  `payment_type` varchar(50) NOT NULL,
  `remarks` varchar(500) NOT NULL,
  `entry_at` datetime NOT NULL DEFAULT current_timestamp(),
  `entry_by_id` char(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


ALTER TABLE `activities`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `administrators`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email_address` (`email_address`);

ALTER TABLE `affiliates`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `affiliates_projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_ap_affiliate_id` (`affiliate_id`),
  ADD KEY `fk_ap_client_id` (`client_id`),
  ADD KEY `fk_ap_project_id` (`project_id`);

ALTER TABLE `affiliates_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_at_affiliate_id` (`affiliate_id`),
  ADD KEY `fk_at_owner_firms_bank_id` (`owner_firms_banks_id`),
  ADD KEY `fk_at_owner_firms_id` (`owner_firms_id`),
  ADD KEY `fk_at_project_id` (`project_id`);

ALTER TABLE `cash_flows`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `cash_flows_entities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_cfe_owner_firm_bank_id` (`owner_firm_bank_id`),
  ADD KEY `fk_cfe_module_id` (`module_id`);

ALTER TABLE `cash_flows_heads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_cfh_owner_firm_bank_id` (`owner_firm_bank_id`),
  ADD KEY `fk_cfh_owner_firm_id` (`owner_firm_id`),
  ADD KEY `fk_cfh_module_id` (`module_id`);

ALTER TABLE `cash_flows_modules`
  ADD PRIMARY KEY (`custom_id`);

ALTER TABLE `cash_flows_settings`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `cash_flows_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_at_owner_firms_bank_id` (`owner_firm_bank_id`),
  ADD KEY `fk_at_owner_firms_id` (`owner_firm_id`),
  ADD KEY `fk_cft_module_id` (`module_id`),
  ADD KEY `fk_cft_head_id` (`head_id`);

ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email_address` (`email_address`),
  ADD KEY `idx_company_name` (`name`),
  ADD KEY `idx_company_phone_number` (`phone_number`),
  ADD KEY `idx_company_email` (`email_address`),
  ADD KEY `fk_company_client` (`client_id`);

ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email_address` (`email_address`),
  ADD KEY `license_key` (`license_key`);

ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email_address` (`email_address`),
  ADD KEY `administrator_id` (`administrator_id`);

ALTER TABLE `inquiries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_inquiry_client_id` (`client_id`),
  ADD KEY `fk_inquiry_reference_id` (`reference_id`),
  ADD KEY `fk_inquiry_main_project_id` (`main_project_id`),
  ADD KEY `fk_inquiry_sub_project_id` (`sub_project_id`);

ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_invoice_client_id` (`client_id`),
  ADD KEY `fk_invoice_project_id` (`project_id`);

ALTER TABLE `invoices_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_it_project_id` (`project_id`);

ALTER TABLE `licenses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `license_key` (`license_key`),
  ADD KEY `customer_id` (`customer_id`);

ALTER TABLE `main_projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `name` (`name`);

ALTER TABLE `notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_note_inquiry_id` (`inquiry_id`);

ALTER TABLE `owner_firms`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email_address` (`email_address`);

ALTER TABLE `owner_firms_banks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_ofb_owner_firm_id` (`owner_firm_id`);

ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `petty_cash`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `petty_cash_transactions`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_project_client_id` (`client_id`),
  ADD KEY `fk_project_company_id` (`company_id`),
  ADD KEY `fk_project_inquiry_id` (`inquiry_id`),
  ADD KEY `fk_project_main_project_id` (`main_project_id`),
  ADD KEY `fk_project_sub_project_id` (`sub_project_id`),
  ADD KEY `fk_project_invoice_firm_id` (`invoice_firm_id`);

ALTER TABLE `projects_settings`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `rv`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_rv_client_id` (`client_id`),
  ADD KEY `fk_rv_project_id` (`project_id`);

ALTER TABLE `rv_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_rvt_project_id` (`project_id`);

ALTER TABLE `statuses`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `sub_projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `name` (`name`);

ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_task_client_id` (`client_id`),
  ADD KEY `fk_task_project_id` (`project_id`);

ALTER TABLE `sub_tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_st_task_id` (`task_id`),
  ADD KEY `fk_st_project_id` (`project_id`);

ALTER TABLE `tasks_settings`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `the_references`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `vendors`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `vendors_heads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_vh_owner_firm_bank_id` (`owner_firm_bank_id`),
  ADD KEY `fk_vh_owner_firm_id` (`owner_firm_id`);

ALTER TABLE `vendors_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_vt_vendor_id` (`vendor_id`),
  ADD KEY `fk_vt_owner_firms_bank_id` (`owner_firms_banks_id`),
  ADD KEY `fk_vt_owner_firms_id` (`owner_firms_id`);


ALTER TABLE `activities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `affiliates_projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `affiliates_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `cash_flows`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `cash_flows_entities`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `cash_flows_heads`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT;

ALTER TABLE `cash_flows_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `cash_flows_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `invoices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `invoices_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `licenses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `notes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `petty_cash`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `petty_cash_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `projects_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `rv`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `rv_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `statuses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `sub_tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `tasks_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `vendors_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;


ALTER TABLE `affiliates_projects`
  ADD CONSTRAINT `fk_ap_affiliate_id` FOREIGN KEY (`affiliate_id`) REFERENCES `affiliates` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ap_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  ADD CONSTRAINT `fk_ap_project_id` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`);

ALTER TABLE `affiliates_transactions`
  ADD CONSTRAINT `fk_at_affiliate_id` FOREIGN KEY (`affiliate_id`) REFERENCES `affiliates` (`id`),
  ADD CONSTRAINT `fk_at_owner_firms_bank_id` FOREIGN KEY (`owner_firms_banks_id`) REFERENCES `owner_firms_banks` (`id`),
  ADD CONSTRAINT `fk_at_owner_firms_id` FOREIGN KEY (`owner_firms_id`) REFERENCES `owner_firms` (`id`),
  ADD CONSTRAINT `fk_at_project_id` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`);

ALTER TABLE `cash_flows_entities`
  ADD CONSTRAINT `fk_cfe_module_id` FOREIGN KEY (`module_id`) REFERENCES `cash_flows_modules` (`custom_id`),
  ADD CONSTRAINT `fk_cfe_owner_firm_bank_id` FOREIGN KEY (`owner_firm_bank_id`) REFERENCES `owner_firms_banks` (`id`);

ALTER TABLE `cash_flows_transactions`
  ADD CONSTRAINT `fk_cft_head_id` FOREIGN KEY (`head_id`) REFERENCES `cash_flows_heads` (`id`),
  ADD CONSTRAINT `fk_cft_module_id` FOREIGN KEY (`module_id`) REFERENCES `cash_flows_modules` (`custom_id`);

ALTER TABLE `companies`
  ADD CONSTRAINT `fk_company_client` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `customers`
  ADD CONSTRAINT `fk_customer_license_key` FOREIGN KEY (`license_key`) REFERENCES `licenses` (`license_key`);

ALTER TABLE `employees`
  ADD CONSTRAINT `fk_employee_administrator_id` FOREIGN KEY (`administrator_id`) REFERENCES `administrators` (`id`);

ALTER TABLE `inquiries`
  ADD CONSTRAINT `fk_inquiry_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  ADD CONSTRAINT `fk_inquiry_main_project_id` FOREIGN KEY (`main_project_id`) REFERENCES `main_projects` (`id`),
  ADD CONSTRAINT `fk_inquiry_reference_id` FOREIGN KEY (`reference_id`) REFERENCES `the_references` (`id`),
  ADD CONSTRAINT `fk_inquiry_sub_project_id` FOREIGN KEY (`sub_project_id`) REFERENCES `sub_projects` (`id`);

ALTER TABLE `invoices`
  ADD CONSTRAINT `fk_invoice_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  ADD CONSTRAINT `fk_invoice_project_id` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`);

ALTER TABLE `invoices_transactions`
  ADD CONSTRAINT `fk_it_project_id` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`);

ALTER TABLE `licenses`
  ADD CONSTRAINT `fk_license_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`);

ALTER TABLE `notes`
  ADD CONSTRAINT `fk_note_inquiry_id` FOREIGN KEY (`inquiry_id`) REFERENCES `inquiries` (`id`);

ALTER TABLE `owner_firms_banks`
  ADD CONSTRAINT `fk_ofb_owner_firm_id` FOREIGN KEY (`owner_firm_id`) REFERENCES `owner_firms` (`id`);

ALTER TABLE `projects`
  ADD CONSTRAINT `fk_project_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  ADD CONSTRAINT `fk_project_company_id` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  ADD CONSTRAINT `fk_project_inquiry_id` FOREIGN KEY (`inquiry_id`) REFERENCES `inquiries` (`id`),
  ADD CONSTRAINT `fk_project_invoice_firm_id` FOREIGN KEY (`invoice_firm_id`) REFERENCES `owner_firms` (`id`),
  ADD CONSTRAINT `fk_project_main_project_id` FOREIGN KEY (`main_project_id`) REFERENCES `main_projects` (`id`),
  ADD CONSTRAINT `fk_project_sub_project_id` FOREIGN KEY (`sub_project_id`) REFERENCES `sub_projects` (`id`);

ALTER TABLE `rv`
  ADD CONSTRAINT `fk_rv_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  ADD CONSTRAINT `fk_rv_project_id` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`);

ALTER TABLE `rv_transactions`
  ADD CONSTRAINT `fk_rvt_project_id` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`);

ALTER TABLE `tasks`
  ADD CONSTRAINT `fk_task_client_id` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  ADD CONSTRAINT `fk_task_project_id` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`);

ALTER TABLE `sub_tasks`
  ADD CONSTRAINT `fk_st_project_id` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  ADD CONSTRAINT `fk_st_task_id` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`);

ALTER TABLE `vendors_transactions`
  ADD CONSTRAINT `fk_vt_owner_firms_bank_id` FOREIGN KEY (`owner_firms_banks_id`) REFERENCES `owner_firms_banks` (`id`),
  ADD CONSTRAINT `fk_vt_owner_firms_id` FOREIGN KEY (`owner_firms_id`) REFERENCES `owner_firms` (`id`),
  ADD CONSTRAINT `fk_vt_vendor_id` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`);
COMMIT;