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
		const { bankDetails, emailAddress, entryAt, moduleId, name, phoneNumber, purpose, upiId, userId } = req.body;

		const result = await query(
			"INSERT INTO cash_flows_entities (module_id, name, email_address, phone_number, purpose, account_holder_name, account_number, ifsc, upi_id, entry_at, entry_by_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
			[
				moduleId,
				name,
				emailAddress,
				phoneNumber,
				purpose,
				bankDetails.accountHolderName,
				bankDetails.accountNumber,
				bankDetails.ifsc,
				upiId,
				entryAt,
				userId,
			],
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
