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
		const [cashFlows, companies, invoices, transactionsHistory, mainProjects, projects, subProjects] = await Promise.all([
			query("SELECT * FROM cash_flows WHERE is_deleted=0", []), // Queries
			query("SELECT * FROM companies", []),
			query("SELECT * FROM invoices", []),
			query("SELECT * FROM invoices_payment_history", []),
			query("SELECT * FROM main_projects", []),
			query("SELECT * FROM projects WHERE is_deleted=0", []),
			query("SELECT * FROM sub_projects", []),
		]);

		return res.status(200).json({ cashFlows, companies, invoices, transactionsHistory, mainProjects, projects, subProjects });
	} catch (error) {
		console.error(error);
		return res.status(500).send("Internal Server Error");
	}
}
