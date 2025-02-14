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
		const [history, banks] = await Promise.all([
			query("SELECT * FROM invoices_transactions WHERE project_id=? ORDER BY id DESC", [req.query.projectId]), // Queries
			query("SELECT * FROM banks WHERE firm_id=?", [req.query.firmId]),
		]);

		return res.status(200).json({ history, banks });
	} catch (error) {
		console.error(error);
		return res.status(500).send("Internal Server Error");
	}
}
