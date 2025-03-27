/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import MyConstants from "@/utilities/constants";

import { MyGlobal } from "@/utilities/global";
import { query } from "@/utilities/dbConnection";

export default async function handler(req, res) {
	if (req.method !== "GET" || !MyGlobal.IsApiCallMethodValid(req)) {
		return res.status(405).send(MyConstants.Messages.ApiCallForbidden);
	}

	res.setHeader("Cache-Control", "no-store, max-age=0");

	try {
		const [inquiries, invoices, projects, rv, tasks] = await Promise.all([
			query("SELECT * FROM inquiries WHERE FIND_IN_SET(?, follow_ups) > 0 ORDER BY id DESC", [req.query.userId]), // Queries
			query("SELECT * FROM invoices", []),
			query("SELECT * FROM projects WHERE FIND_IN_SET(?, teams) > 0 ORDER BY id DESC", [req.query.userId]),
			query("SELECT * FROM rv", []),
			query("SELECT * FROM tasks WHERE entry_by_id=?", [req.query.userId]),
		]);

		return res.status(200).json({ inquiries, invoices, projects, rv, tasks });
	} catch (error) {
		console.error(error);
		return res.status(500).send("Internal Server Error");
	}
}
