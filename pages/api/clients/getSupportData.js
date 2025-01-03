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
		const clientId = req.query.clientId;

		const [administratorsCompanies, companies, mainProjects, projects, reference, subProjects] = await Promise.all([
			query("SELECT * FROM administrators_companies", []), // Queries
			query("SELECT * FROM companies WHERE client_id=?", [clientId]),
			query("SELECT * FROM main_projects", []),
			query("SELECT * FROM projects", []),
			query("SELECT * FROM the_references WHERE client_id=?", [clientId]),
			query("SELECT * FROM sub_projects", []),
		]);

		return res.status(200).json({ administratorsCompanies, companies, mainProjects, projects, reference, subProjects });
	} catch (error) {
		console.error(error);
		return res.status(500).send("Internal Server Error");
	}
}
