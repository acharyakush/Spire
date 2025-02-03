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
		const [clients, companies, mainProjects, projects, subProjects, vendors, vendorsProjects, vendorsTransactions] = await Promise.all([
			query("SELECT * FROM clients WHERE is_confirmed=1", []), // Queries
			query("SELECT * FROM companies", []),
			query("SELECT * FROM main_projects", []),
			query("SELECT * FROM projects", []),
			query("SELECT * FROM sub_projects", []),
			query("SELECT * FROM vendors", []),
			query("SELECT * FROM vendors_projects", []),
			query("SELECT * FROM vendors_transactions", []),
		]);

		return res.status(200).json({ clients, companies, mainProjects, projects, subProjects, vendors, vendorsProjects, vendorsTransactions });
	} catch (error) {
		console.error(error);
		return res.status(500).send("Internal Server Error");
	}
}
