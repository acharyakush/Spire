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
		const { amount, entryAt, module, ownerFirmsId, ownerFirmsBankId, particulars, paymentSource, paymentType, remarks, userId } = req.body;

		let amountPaid = 0;
		let amountReceived = 0;

		if (String(module).includes("Outward")) {
			amountPaid = amount;
		} else {
			amountReceived = amount;
		}

		const result = await query(
			"INSERT INTO cash_flows (owner_firms_id, owner_firms_banks_id, amount_paid, amount_received, module, particulars, payment_source, payment_type, remarks, entry_at, entry_by_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
			[ownerFirmsId, ownerFirmsBankId, amountPaid, amountReceived, module, particulars, paymentSource, paymentType, remarks, entryAt, userId],
		);

		if (result.affectedRows == 0) {
			res.status(400).send();
		} else {
			res.status(200).send();
		}
	} catch (error) {
		console.log(error);
		res.status(500).send(error);
	}
}
