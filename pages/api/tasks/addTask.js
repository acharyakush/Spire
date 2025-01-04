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
		const { clientId, dueOn, expense, projectId, task, userId } = req.body;

		await query("CALL generate_dynamic_id('TK', 'tasks', @new_task_id)", []);
		const [storedProcedureResult] = await query("SELECT @new_task_id AS new_id;", []);

		const taskInsertQueryResult = await query(
			"INSERT INTO tasks (id, client_id, project_id, task, due_on, entry_by, expense) VALUES (?, ?, ?, ?, ?, ?, ?)",
			[storedProcedureResult.new_id, clientId, projectId, task, dueOn, userId, expense],
		);

		if (taskInsertQueryResult.affectedRows > 0) {
			res.status(200).send(storedProcedureResult.new_id);
		} else {
			res.status(400).end();
		}
	} catch (error) {
		console.error(error);
		return res.status(500).end(error.message);
	}
}
