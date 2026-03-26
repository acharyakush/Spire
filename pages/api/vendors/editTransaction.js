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
		const { amount, entryAt, headId, firmId, bankId, id, particulars, paymentSource, paymentType, remarks, vendorId } = req.body;

		const insertQueryResult = await query("UPDATE vendors_transactions SET firm_id=?, bank_id=?, amount=?, particulars=?, payment_source=?, payment_type=?, remarks=?, entry_at=? WHERE id=? AND vendor_id=? AND head_id=?", [firmId, bankId, amount, particulars, paymentSource, paymentType, remarks, entryAt, id, vendorId, headId]);

		if (insertQueryResult.affectedRows == 0) {
			res.status(400).send();
		} else {
			res.status(200).send();
		}
	} catch (error) {
		console.log(error);
		res.status(500).send(error);
	}
}
