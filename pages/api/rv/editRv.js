/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import { Messages } from "@/utilities/constants";

import { MyGlobal } from "@/utilities/global";
import { query } from "@/utilities/dbConnection";

export default async function handler(req, res) {
	if (req.method !== "POST" || !MyGlobal.IsApiCallMethodValid(req)) {
		return res.status(405).send(Messages.ApiCallForbidden);
	}

	res.setHeader("Cache-Control", "no-store, max-age=0");

	try {
		const { amount, amountPending, amountReceived, bankId, customId, clientId, dueDate, id, particulars, projectId, receiptDate } = req.body;

		const response = await query("UPDATE rv SET custom_id=?, client_id=?, project_id=?, bank_id=?, particulars=?, amount=?, amount_received=?, amount_pending=?, due_date=?, receipt_date=? WHERE id=?", [customId, clientId, projectId, bankId, JSON.stringify(particulars), amount, amountReceived, amountPending, dueDate, receiptDate, id]);

		if (response.affectedRows > 0) {
			res.status(200).end();
		} else {
			res.status(400).end();
		}
	} catch (error) {
		console.error(error);
		return res.status(500).end(error.message);
	}
}
