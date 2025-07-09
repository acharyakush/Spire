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
		const [todos, projects, subProjects, clients] = await Promise.all([
			query("SELECT * FROM todos WHERE is_deleted=0 ORDER BY id DESC", []),
			query("SELECT * FROM projects WHERE is_deleted=0 AND status='Active' ORDER BY id DESC", []),
			query("SELECT * FROM sub_projects", []),
			query("SELECT * FROM clients", []),
		]);

		if (!todos.length) {
			return res.status(204).end();
		}

		return res.status(200).json({ todos, projects, subProjects, clients });
	} catch (error) {
		console.error(error);
		return res.status(500).send("Internal Server Error");
	}
}
