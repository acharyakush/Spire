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
		const updates = req.body.params.updatedOrder.map(async (m) => {
			await query("UPDATE sub_tasks SET sequence = ? WHERE id = ? AND task_id = ?", [m.sequence, m.id, m.task_id]);
		});

		await Promise.all(updates);

		return res.status(200).end();
	} catch (error) {
		console.error(error);
		return res.status(500).end(error.message);
	}
}
