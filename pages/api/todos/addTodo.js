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
		const { assignedTo, description, dueDate, priority, userId } = req.body;

		await query("CALL generate_id('TD', 'todos', @new_todo_id)", []);
		const [storedProcedureResult] = await query("SELECT @new_todo_id AS new_id;", []);

		const todoInsertQueryResult = await query("INSERT INTO todos (custom_id, description, assigned_to, due_date, priority, entry_by) VALUES (?, ?, ?, ?, ?, ?)", [
			storedProcedureResult.new_id,
			description,
			assignedTo,
			dueDate,
			priority,
			userId,
		]);

		if (todoInsertQueryResult.affectedRows > 0) {
			res.status(200).end();
		} else {
			res.status(400).end();
		}
	} catch (error) {
		console.error(error);
		return res.status(500).end(error.message);
	}
}
