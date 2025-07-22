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
		const clientId = req.query.clientId;

		const [companies, transactions, mainProjects, firms, projects, subProjects, projectExpenses, rvTransactions, reference] = await Promise.all([
			query("SELECT * FROM companies WHERE client_id=?", [clientId]), // Queries
			query("SELECT * FROM invoices_transactions", []),
			query("SELECT * FROM main_projects", []),
			query("SELECT * FROM firms", []),
			query("SELECT * FROM projects WHERE is_deleted=0", []),
			query("SELECT * FROM sub_projects", []),
			query("SELECT * FROM project_expenses", []),
			query("SELECT * FROM rv_transactions", []),
			query("SELECT * FROM the_references WHERE client_id=?", [clientId]),
		]);

		return res.status(200).json({ companies, transactions, mainProjects, firms, projects, subProjects, projectExpenses, rvTransactions, reference });
	} catch (error) {
		console.error(error);
		return res.status(500).send("Internal Server Error");
	}
}
