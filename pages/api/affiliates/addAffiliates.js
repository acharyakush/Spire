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
		const { group, userId } = req.body;
		let successCount = 0;

		for (let object of group) {
			const { bankAccountHolderName, bankAccountNumber, emailAddress, ifsc, name, phoneNumber, upiId } = object;

			await query("CALL generate_id('AF', 'affiliates', @new_affiliate_id)", []);
			const [response] = await query("SELECT @new_affiliate_id AS new_id;");

			const result = await query(
				`INSERT INTO affiliates (id, name, email_address, phone_number, bank_account_holder_name, bank_account_number, ifsc, upi_id, entry_by_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				[
					response.new_id,
					name,
					emailAddress ?? "",
					phoneNumber ?? "",
					bankAccountHolderName ?? "",
					bankAccountNumber ?? "",
					ifsc ?? "",
					upiId ?? "",
					userId,
				],
			);

			if (result && result.affectedRows > 0) {
				successCount++;
			}
		}

		if (successCount === group.length) {
			res.status(200).end();
		} else {
			res.status(400).send(`Only ${successCount} out of ${group.length} affiliate(s) were inserted.`);
		}
	} catch (error) {
		console.log(error);
		res.status(500).send(error);
	}
}
