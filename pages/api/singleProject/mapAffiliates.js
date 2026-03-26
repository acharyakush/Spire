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
		const { affiliates, clientId, companyId, ids, projectId } = req.body;

		let affiliateUpdated = false;
		let clientUpdated = false;
		let companyUpdated = false;
		let projectUpdated = false;

		let queryCounter = 0;
		let totalFees = 0;

		for (const a of affiliates) {
			totalFees += a.fees;

			const response = await query("INSERT INTO affiliates_projects (affiliate_id, client_id, project_id, total_fees) VALUES (?, ?, ?, ?)", [a.id, clientId, projectId, a.fees]);

			if (response.affectedRows > 0) {
				queryCounter++;
			}
		}

		if (queryCounter == affiliates.length) {
			affiliateUpdated = true;
		}

		const updateClientQuery = await query("UPDATE clients SET affiliate_ids=?, company_id=? WHERE id=?", [ids, companyId, clientId]);

		if (updateClientQuery.affectedRows > 0) {
			clientUpdated = true;
		}

		const updateCompanyQuery = await query("UPDATE companies SET total_affiliate_fees=? WHERE id=? AND client_id=?", [totalFees, companyId, clientId]);

		if (updateCompanyQuery.affectedRows > 0) {
			companyUpdated = true;
		}

		const updateProjectQuery = await query("UPDATE projects SET affiliate_ids=?, total_affiliate_fees=? WHERE id=?", [ids, totalFees, projectId]);

		if (updateProjectQuery.affectedRows > 0) {
			projectUpdated = true;
		}

		if (affiliateUpdated && clientUpdated && companyUpdated && projectUpdated) {
			res.status(200).end();
		} else {
			let statuses = "";

			if (!affiliateUpdated) {
				statuses += "Affiliate Fees" + "\n";
			} else if (!clientUpdated) {
				statuses += "Affiliates in Client" + "\n";
			} else if (!companyUpdated) {
				statuses += "Affiliates in Company" + "\n";
			} else if (!projectUpdated) {
				statuses += "Affiliates in Project" + "\n";
			}

			res.status(400).send(`Following details could not be updated.\n\n${statuses}`);
		}
	} catch (error) {
		console.log(error);
		res.status(500).send(error);
	}
}
