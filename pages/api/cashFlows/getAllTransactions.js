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

		if (!tables.length) {
			return res.status(200).json({ message: "No tables found" });
		}

		// Define a mapping of table names to frontend keys
		const tableMappings = {
			affiliates_transactions: "affiliates",
			banks: "banks",
			cash_flows_transactions: "cashFlows",
			invoices_transactions: "invoices",
			petty_cash_transactions: "pettyCash",
			rv_transactions: "rv",
			vendors_transactions: "vendors",
		};

		const tableNames = tables.map((m) => Object.values(m).at(0)).filter((f) => tableMappings[f]);

		const results = {};

		for (const t of tableNames) {
			results[tableMappings[t]] = await query(`SELECT * FROM ${t}`, []);
		}

		return res.status(200).json(results);
	} catch (error) {
		console.error(error);
		return res.status(500).send("Internal Server Error");
	}
}
