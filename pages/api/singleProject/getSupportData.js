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
		const [affiliates, companies, cashFlows, mainProjects, ownerFirms, ownerFirmsBanks, subProjects, invoices] = await Promise.all([
			query("SELECT * FROM affiliates", []), // Queries
			query("SELECT * FROM companies", []),
			query("SELECT * FROM cash_flows", []),
			query("SELECT * FROM main_projects", []),
			query("SELECT * FROM owner_firms", []),
			query("SELECT * FROM owner_firms_banks", []),
			query("SELECT * FROM sub_projects", []),
			query("SELECT * FROM invoices", []),
		]);

		return res.status(200).json({ affiliates, companies, cashFlows, mainProjects, ownerFirms, ownerFirmsBanks, subProjects, invoices });
	} catch (error) {
		console.error(error);
		return res.status(500).send("Internal Server Error");
	}
}
