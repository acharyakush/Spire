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
		const [entities, modules, settings] = await Promise.all([
			query("SELECT * FROM cash_flows_entities WHERE module_id=?", [req.query.moduleId]), // Queries
			query("SELECT * FROM cash_flows_modules", []),
			query("SELECT * FROM cash_flows_settings WHERE `key`='payment_types'", []),
		]);

		return res.status(200).json({ entities, modules, settings });
	} catch (error) {
		console.error(error);
		return res.status(500).send("Internal Server Error");
	}
}
