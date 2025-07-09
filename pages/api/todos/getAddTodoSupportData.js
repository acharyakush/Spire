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
		const [clients, projects, mainProjects, subProjects, companies] = await Promise.all([
			query("SELECT * FROM clients WHERE is_confirmed=1 AND is_deleted=0 ORDER BY id DESC", []),
			query("SELECT * FROM projects WHERE is_deleted=0 AND status='Active' ORDER BY id DESC", []),
			query("SELECT * FROM main_projects", []),
			query("SELECT * FROM sub_projects", []),
			query("SELECT * FROM companies", []),
		]);

		if (!clients.length && !projects.length) {
			return res.status(204).end();
		}

		return res.status(200).json({ clients, projects, mainProjects, subProjects, companies });
	} catch (error) {
		console.error(error);
		return res.status(500).send("Internal Server Error");
	}
}
