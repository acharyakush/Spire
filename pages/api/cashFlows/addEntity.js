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
		const { amount, entryAt, moduleId, name, ownerFirmsId, ownerFirmsBankId, paymentSource, purpose, userId } = req.body;

		const result = await query(
			"INSERT INTO cash_flows_entities (module_id, owner_firms_id, owner_firms_banks_id, name, amount, payment_source, purpose, entry_at, entry_by_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
			[moduleId, ownerFirmsId, ownerFirmsBankId, name, amount, paymentSource, purpose, entryAt, userId],
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
