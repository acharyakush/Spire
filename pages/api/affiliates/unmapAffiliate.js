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
		await query("UPDATE projects SET affiliate_ids=? WHERE id=?", [req.body.affiliateIds, req.body.projectId]);

		await query("DELETE FROM affiliates_projects WHERE affiliate_id=? AND client_id=? AND project_id=?", [req.body.affiliateId, req.body.clientId, req.body.projectId]);

		await query("DELETE FROM affiliates_transactions WHERE affiliate_id=? AND project_id=?", [req.body.affiliateId, req.body.projectId]);

		return res.status(200).end();
	} catch (error) {
		console.error(error);
		return res.status(500).send("Internal Server Error");
	}
}
