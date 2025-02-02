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
		const [
			affiliates,
			affiliatesProjects,
			affiliatesTransactions,
			cashFlows,
			clients,
			companies,
			invoices,
			mainProjects,
			ownerFirms,
			ownerFirmsBanks,
			projects,
			reimburseVouchers,
			settings,
		] = await Promise.all([
			query("SELECT * FROM affiliates", []), // Queries
			query("SELECT * FROM affiliates_projects", []),
			query("SELECT * FROM affiliates_transactions", []),
			query("SELECT * FROM cash_flows", []),
			query("SELECT * FROM clients WHERE is_confirmed=1", []),
			query("SELECT * FROM companies", []),
			query("SELECT * FROM invoices", []),
			query("SELECT * FROM main_projects", []),
			query("SELECT * FROM owner_firms", []),
			query("SELECT * FROM owner_firms_banks", []),
			query("SELECT * FROM projects", []),
			query("SELECT * FROM reimburse_voucher", []),
			query("SELECT * FROM cash_flows_settings WHERE `key`='payment_types'", []),
		]);

		return res.status(200).json({
			affiliates,
			affiliatesProjects,
			affiliatesTransactions,
			cashFlows,
			clients,
			companies,
			invoices,
			mainProjects,
			ownerFirms,
			ownerFirmsBanks,
			projects,
			reimburseVouchers,
			settings,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).send("Internal Server Error");
	}
}
