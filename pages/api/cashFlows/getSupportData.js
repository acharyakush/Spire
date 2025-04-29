/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import MyConstants from "@/utilities/constants";

import { MyGlobal } from "@/utilities/global";
import { query } from "@/utilities/dbConnection";

export default async function handler(req, res) {
	if (req.method !== "GET" || !MyGlobal.IsApiCallMethodValid(req)) {
		return res.status(405).send(MyConstants.Messages.ApiCallForbidden);
	}

	res.setHeader("Cache-Control", "no-store, max-age=0");

	try {
		const tables = await query("SHOW TABLES", []);
		if (!tables.length) return res.status(200).json({ message: "No tables found" });

		// Define a mapping of table names to frontend keys
		const tableMapping = {
			affiliates: "affiliates",
			affiliates_projects: "affiliatesProjects",
			affiliates_transactions: "affiliatesTransactions",
			cash_flows_heads: "cashFlowsHeads",
			cash_flows_transactions: "cashFlowsTransactions",
			clients: "clients",
			companies: "companies",
			invoices: "invoices",
			main_projects: "mainProjects",
			firms: "firms",
			banks: "banks",
			petty_cash: "openingBalance",
			petty_cash_transactions: "pettyCashTransactions",
			projects: "projects",
			rv: "reimburseVouchers",
			cash_flows_settings: "settings",
			tasks: "tasks",
			vendors: "vendors",
			vendors_heads: "vendorsHeads",
			vendors_transactions: "vendorsTransactions",
		};

		// Convert table list into an array of valid table names
		const tableNames = tables.map((row) => Object.values(row)[0]).filter((table) => tableMapping[table]);

		// Fetch data for each table
		const results = {};
		for (const table of tableNames) {
			const _query = table == "projects" ? "SELECT * FROM projects WHERE is_deleted=0" : `SELECT * FROM ${table}`;
			results[tableMapping[table]] = await query(_query, []);
		}

		return res.status(200).json(results);
	} catch (error) {
		console.error(error);
		return res.status(500).send("Internal Server Error");
	}
}
