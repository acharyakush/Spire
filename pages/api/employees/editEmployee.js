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
		const { designation, employee, employmentStatus, employmentType, permissions, reportsTo, userId } = req.body;

		const result = await query(`UPDATE employees SET administrator_id=?, designation=?, employment_type=?, employment_status=?, permissions=?, entry_by_id=? WHERE id=?`, [reportsTo.id, designation, employmentType, employmentStatus, permissions, userId, employee.id]);

		if (result.affectedRows > 0) {
			res.status(200).end();
		} else {
			res.status(400).end();
		}
	} catch (error) {
		console.log(error);
		res.status(500).send(error);
	}
}
