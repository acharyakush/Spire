/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import { BaseModules, Messages } from "@/utilities/constants";

import { MyGlobal } from "@/utilities/global";
import { query } from "@/utilities/dbConnection";

export default async function handler(req, res) {
	if (req.method !== "GET" || !MyGlobal.IsApiCallMethodValid(req)) {
		return res.status(405).send(Messages.ApiCallForbidden);
	}

	res.setHeader("Cache-Control", "no-store, max-age=0");

	try {
		const rows = await query("SELECT * FROM notes WHERE inquiry_id=? AND source=?", [req.query.inquiryId, BaseModules.Inquiries]);

		if (!rows.length) {
			return res.status(204).end();
		}

		return res.status(200).json(rows);
	} catch (error) {
		console.error(error);
		return res.status(500).send("Internal Server Error");
	}
}
