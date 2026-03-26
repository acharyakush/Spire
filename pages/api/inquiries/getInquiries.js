/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import { Messages } from "@/utilities/constants";

import { MyGlobal } from "@/utilities/global";
import { query } from "@/utilities/dbConnection";

export default async function handler(req, res) {
	if (req.method !== "GET" || !MyGlobal.IsApiCallMethodValid(req)) {
		return res.status(405).send(Messages.ApiCallForbidden);
	}

	res.setHeader("Cache-Control", "no-store, max-age=0");

	try {
		const response = await query("SELECT * FROM inquiries ORDER BY id DESC", []);
		const response1 = await query("SELECT * FROM inquiries_quotations_services ORDER BY id DESC", []);

		if (!response.length) {
			return res.status(204).end();
		}

		return res.status(200).json({ inquiries: response, quotations_services: response1 });
	} catch (error) {
		console.error(error);
		return res.status(500).send("Internal Server Error");
	}
}
