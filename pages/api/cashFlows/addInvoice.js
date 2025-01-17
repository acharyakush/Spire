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
		const { amountReceived, clientId, entryAt, invoiceId, ownerFirmsId, ownerFirmsBankId, particulars, paymentFor, paymentType, projectId, userId } =
			req.body;

		const updateCompanyResult = await query("UPDATE companies SET invoice_fees=? WHERE client_id=?", [amountReceived, clientId]);

		const updateInvoiceResult = await query("UPDATE invoices SET amount_received=? WHERE custom_id=?", [amountReceived, invoiceId]);

		const addCashFlowResult = await query(
			"INSERT INTO cash_flows (client_id, project_id, invoice_id, owner_firm_id, owner_firm_bank_id, particulars, payment_for, amount_received, entry_at, entry_by_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
			[clientId, projectId, invoiceId, ownerFirmsId, ownerFirmsBankId, particulars, paymentFor, amountReceived, entryAt, userId],
		);

		if (updateCompanyResult.affectedRows > 0 && updateInvoiceResult.affectedRows > 0 && addCashFlowResult.affectedRows > 0) {
			res.status(200).send();
		} else {
			res.status(400).send("Failed to add cash flow entry.");
		}
	} catch (error) {
		console.log(error);
		res.status(500).send(error);
	}
}
