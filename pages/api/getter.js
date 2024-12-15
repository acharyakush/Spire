/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import MyConstants from "@/utilities/constants";

import { MyGlobal } from "@/utilities/global";
import { query } from "@/utilities/dbConnection";

export default async function handler(req, res) {
	if (!MyGlobal.IsApiCallMethodValid(req)) {
		return res.status(403).send(MyConstants.Messages.ApiCallForbidden);
	}

	if (req.method !== "GET") {
		return res.status(405).end();
	}

	try {
		res.setHeader("Cache-Control", "no-store, max-age=0");

		const request = req.query;

		let queryParameters = [];
		let queryString = "";

		if (request.type === "get-permissions") {
			queryString = `SELECT * FROM permissions`;
		} else if (request.type === "get-settings") {
			queryString = `SELECT * FROM settings`;
		} else if (request.type === "get-users") {
			const administrators = await query(`SELECT * FROM administrators`, []);
			const employees = await query(`SELECT * FROM employees WHERE access_revoked=0`, []);
			const response = { administrators, employees };

			return res.status(200).send(response);
		} else if (request.type === "get-notes") {
			queryString = `SELECT * FROM notes`;
		} else {
			return res.status(400).send({ error: "Invalid request type" });
		}

		const response = await query(queryString, queryParameters);
		res.status(200).send(response);
	} catch (error) {
		console.error("Error:", error);
		res.status(500).send({ error: error.message });
	}
}
