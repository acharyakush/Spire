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
		const { address, birthDate, city, state, designation, emailAddress, employmentType, gender, name, password, permissions, phoneNumber, reportsTo, userId } = req.body;

		await query("CALL generate_id('EP', 'employees', @new_employee_id)", []);
		const [response] = await query("SELECT @new_employee_id AS new_id;");

		const result = await query(`INSERT INTO employees (id, administrator_id, first_name, last_name, full_name, email_address, password, gender, birth_date, phone_number, address, city, state, designation, employment_type, permissions, entry_by_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [response.new_id, reportsTo.id, name.first, name.last, `${name.first} ${name.last}`, emailAddress, password, gender, birthDate, phoneNumber, address, city, state, designation, employmentType, permissions, userId]);

		if (result.affectedRows > 0) {
			res.status(200).send(response.new_id);
		} else {
			res.status(400).end();
		}
	} catch (error) {
		console.log(error);
		res.status(500).send(error);
	}
}
