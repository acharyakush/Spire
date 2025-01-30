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
		const {
			affiliate,
			amountPaid,
			amountReceived,
			entryAt,
			module,
			ownerFirmsId,
			ownerFirmsBankId,
			particulars,
			paymentFor,
			paymentType,
			remarks,
			userId,
		} = req.body;

		let affiliateId = "";

		if (affiliate.id != "" && affiliate.name != "") {
			affiliateId = affiliate.id;

			const response = await query("UPDATE affiliates_projects SET paid_fees=? WHERE affiliate_id=?", [amountPaid, affiliate.id]);

			if (response.affectedRows == 0) {
				res.status(400).send(`Could not update paid fees of ${affiliate.name}.`);
			}
		}

		const response = await query(
			"INSERT INTO cash_flows (affiliate_id, owner_firm_id, owner_firm_bank_id, particulars, payment_for, payment_type, amount_paid, amount_received, remarks, module, entry_at, entry_by_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
			[affiliateId, ownerFirmsId, ownerFirmsBankId, particulars, paymentFor, paymentType, amountPaid, amountReceived, remarks, module, entryAt, userId],
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
