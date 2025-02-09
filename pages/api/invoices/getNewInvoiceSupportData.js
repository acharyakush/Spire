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
		const [cashFlows, clients, companies, invoices, invoicesPaymentHistory, ownerFirms, ownerFirmsBanks] = await Promise.all([
			query("SELECT * FROM cash_flows WHERE is_deleted=0", []), // Queries
			query("SELECT * FROM clients WHERE is_confirmed=1", []),
			query("SELECT * FROM companies", []),
			query("SELECT * FROM invoices", []),
			query("SELECT * FROM invoices_transactions WHERE project_id=?", [req.query.projectId]),
			query("SELECT * FROM owner_firms", []),
			query("SELECT * FROM owner_firms_banks", []),
		]);

		return res.status(200).json({ cashFlows, clients, companies, invoices, invoicesPaymentHistory, ownerFirms, ownerFirmsBanks });
	} catch (error) {
		console.error(error);
		return res.status(500).send("Internal Server Error");
	}
}
