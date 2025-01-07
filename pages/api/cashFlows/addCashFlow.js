/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import MyConstants from "@/utilities/constants";

import { MyGlobal } from "@/utilities/global";
import { query } from "@/utilities/dbConnection";

export default async function handler(req, res) {
	if (req.method !== "POST" || !MyGlobal.IsApiCallMethodValid(req)) {
		return res.status(405).send(MyConstants.Messages.ApiCallForbidden);
	}

	res.setHeader("Cache-Control", "no-store, max-age=0");

	try {
		const { affiliate, amountPaid, amountReceived, client, companyId, entryAt, isOfficeExpense, particulars, paymentFor, projectId, userId } = req.body;

		const isAffiliate = affiliate.isActive && !client.isActive && !isOfficeExpense;
		const isClient = !affiliate.isActive && client.isActive && !isOfficeExpense;

		if (isAffiliate) {
			const response = await query("UPDATE affiliates_projects SET paid_fees=? WHERE id=?", [amountPaid, affiliate.id]);

			if (response.affectedRows == 0) {
				res.status(400).send(`Could not update paid fees of ${affiliate.name}.`);
			}
		}

		const affiliateId = isAffiliate ? affiliate.id : "";
		const clientId = isClient ? client.id : "";

		const response = await query(
			"INSERT INTO cash_flows (affiliate_id, client_id, company_id, project_id, particulars, payment_for, amount_paid, amount_received, is_office_expense, entry_at, entry_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
			[affiliateId, clientId, companyId, projectId, particulars, paymentFor, amountPaid, amountReceived, !isOfficeExpense ? 0 : 1, entryAt, userId],
		);

		if (response.affectedRows == 0) {
			res.status(400).send("Failed to add cash flow entry.");
		} else {
			res.status(200).send();
		}
	} catch (error) {
		console.log(error);
		res.status(500).send(error);
	}
}
