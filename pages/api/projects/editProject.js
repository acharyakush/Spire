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
		const { client, company, phoneNumber, remarks, id, invoiceFees, invoiceFirmId, mainProjectId, quote, reimburseVoucher, subProject, teams, userId } = req.body;

		// New Client ID
		let newClientId = client.id;

		if (client.id == 0) {
			await query("CALL generate_id('CN', 'clients', @new_client_id)", []);
			const [storedProcedureResult] = await query("SELECT @new_client_id AS new_id;", []);

			newClientId = storedProcedureResult.new_id;

			const queryResult = await query("INSERT INTO clients (id, name, phone_number) VALUES (?, ?, ?)", [newClientId, client.name, phoneNumber]);

			if (queryResult.affectedRows == 0) {
				return res.status(400).send("Could not add Client.");
			}
		}

		// New Company ID
		let newCompanyId = company.id;

		if (company.id == 0) {
			await query("CALL generate_id('CP', 'companies', @new_company_id)", []);
			const [storedProcedureResult] = await query("SELECT @new_company_id AS new_id;", []);

			newCompanyId = storedProcedureResult.new_id;

			const queryResult = await query(`INSERT INTO companies (id, client_id, name, entry_by_id) VALUES (?, ?, ?, ?)`, [newCompanyId, newClientId, company.name, userId]);

			if (queryResult.affectedRows == 0) {
				res.status(400).send("Could not add Company.");
			}
		}

		// New Sub Project ID
		let newSubProjectId = subProject.id;

		if (subProject.id == 0) {
			await query("CALL generate_id('SP', 'sub_projects', @new_sub_project_id)", []);
			const [storedProcedureResult] = await query("SELECT @new_sub_project_id AS new_id;", []);

			newSubProjectId = storedProcedureResult.new_id;

			const queryResult = await query("INSERT INTO sub_projects (id, name, entry_by_id) VALUES (?, ?, ?)", [newSubProjectId, subProject.name, userId]);

			if (queryResult.affectedRows == 0) {
				res.status(400).send("Could not add Sub Project.");
			}
		}

		const projectQueryResult = await query("UPDATE projects SET client_id=?, company_id=?, main_project_id=?, sub_project_id=?, quote=?, remarks=?, invoice_fees=?, firm_id=?, teams=? WHERE id=?", [
			newClientId,
			newCompanyId,
			mainProjectId,
			newSubProjectId,
			quote,
			remarks,
			invoiceFees,
			invoiceFirmId,
			teams,
			id,
		]);

		if (client.id == 0) {
			const queryResult = await query(`UPDATE clients SET company_id=?, is_confirmed=1 WHERE id=?`, [newCompanyId, newClientId]);

			if (queryResult.affectedRows == 0) {
				res.status(400).send("Could not add Client.");
			}
		}

		if (projectQueryResult.affectedRows > 0) {
			res.status(200).end();
		} else {
			res.status(400).end();
		}
	} catch (error) {
		console.error(error);
		return res.status(500).end(error.message);
	}
}
