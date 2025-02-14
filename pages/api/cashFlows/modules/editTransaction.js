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
			amount,
			entityId,
			entryAt,
			headId,
			isOfficeExpense,
			moduleId,
			firmId,
			bankId,
			particulars,
			paymentSource,
			paymentType,
			remarks,
			userId,
			transactionId,
		} = req.body;

		let sqlQuery =
			"UPDATE cash_flows_transactions SET entity_id = ?, head_id = ?, module_id = ?, firm_id = ?, bank_id = ?, amount = ?, particulars = ?, payment_source = ?, payment_type = ?, remarks = ?, entry_at = ?, entry_by_id = ? WHERE id = ?";

		let parameters = [entityId, headId, moduleId, firmId, bankId, amount, particulars, paymentSource, paymentType, remarks, entryAt, userId, transactionId];

		if (isOfficeExpense) {
			sqlQuery =
				"UPDATE cash_flows_transactions SET entity_id = ?, head_id = ?, module_id = ?, firm_id = ?, bank_id = ?, amount = ?, particulars = ?, payment_source = ?, remarks = ?, entry_at = ?, entry_by_id = ? WHERE id = ?";

			parameters = [entityId, headId, moduleId, firmId, bankId, amount, particulars, paymentSource, remarks, entryAt, userId, transactionId];
		}

		const result = await query(sqlQuery, parameters);

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
