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
		const { projectId, description, expense, entryDate, id } = req.body;

		const taskInsertQueryResult = await query("UPDATE project_expenses SET description=?, expense=?, entry_date=? WHERE id=? AND project_id=?", [description, expense, entryDate, id, projectId]);

		if (!taskInsertQueryResult || taskInsertQueryResult.affectedRows === 0) return res.status(400).end();
		if (!projectId || !description || expense == null) return res.status(400).end("Missing required fields");

		const rvRecords = await query("SELECT * FROM rv WHERE project_id = ? LIMIT 1", [projectId]);

		if (!rvRecords || rvRecords.length === 0) return res.status(404).end("RV record not found");

		const rv = rvRecords[0];
		const particulars = JSON.parse(rv.particulars);

		const newEntry = {
			amount: expense,
			particulars: description,
			rowId: particulars.length,
		};

		particulars.push(newEntry);

		const newAmount = particulars.reduce((sum, p) => sum + Number(p.amount), 0);
		const newAmountPending = newAmount - Number(rv.amount_received);

		const updateResult = await query("UPDATE rv SET particulars = ?, amount = ?, amount_pending = ? WHERE project_id = ?", [JSON.stringify(particulars), newAmount, newAmountPending, projectId]);

		if (updateResult.affectedRows > 0) {
			res.status(200).end();
		} else {
			res.status(400).end();
		}
	} catch (error) {
		console.error(error);
		return res.status(500).end(error.message);
	}
}
