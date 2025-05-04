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
		const {} = req.body;

		await query("CALL generate_id('IQN', 'quotations', @new_quotation_id)", []);
		const [quotationResult] = await query("SELECT @new_quotation_id AS new_id;", []);

		const result = await query("INSERT INTO quotations () VALUES ()", []);

		if (result.affectedRows == 0) {
			return res.status(400).send("Could not add Quotation.");
		}

		return res.status(200).send(quotationResult.new_id);
	} catch (error) {
		console.error(error);
		return res.status(500).send("Internal Server Error");
	}
}
