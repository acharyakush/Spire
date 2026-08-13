/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import { BaseModules, Messages, Statuses } from "@/utilities/constants";

import { MyGlobal } from "@/utilities/global";
import { query } from "@/utilities/dbConnection";
import { escapeString } from "@/utilities/myGlobal";

export default async function handler(req, res) {
	if (req.method !== "POST" || !MyGlobal.IsApiCallMethodValid(req)) {
		return res.status(405).send(Messages.ApiCallForbidden);
	}

	res.setHeader("Cache-Control", "no-store, max-age=0");

	try {
		const { clientId, company, financialYear, remarks, inquiryId, invoiceFees, invoiceFirm, mainProject, note, quote, subProject, teams, userId, workFrequency } = req.body;

		// New Project ID
		await query("CALL generate_id('PJ', 'projects', @new_project_id)", []);
		const [projectResponse] = await query("SELECT @new_project_id AS new_id;", []);

		// New Company ID
		let newCompanyId = company.id;

		if (company.id == 0) {
			await query("CALL generate_id('CP', 'companies', @new_company_id)", []);
			const [companyResponse] = await query("SELECT @new_company_id AS new_id;", []);

			newCompanyId = companyResponse.new_id;

			const response = await query(`INSERT INTO companies (id, client_id, name, entry_by_id) VALUES (?, ?, ?, ?)`, [newCompanyId, clientId, company.name, userId]);

			if (response.affectedRows == 0) {
				res.status(400).send("Could not add Company.");
			}
		}

		// New Sub Project ID
		let newSubProjectId = subProject.id;

		if (subProject.id == 0) {
			await query("CALL generate_id('SP', 'sub_projects', @new_sub_project_id)", []);
			const [subProjectResponse] = await query("SELECT @new_sub_project_id AS new_id;", []);

			newSubProjectId = subProjectResponse.new_id;

			const response = await query("INSERT INTO sub_projects (id, name, entry_by_id) VALUES (?, ?, ?)", [newSubProjectId, subProject.name, userId]);

			if (response.affectedRows == 0) {
				res.status(400).send("Could not add Sub Project.");
			}
		}

		const response = await query(`INSERT INTO projects (id, client_id, company_id, inquiry_id, firm_id, main_project_id, sub_project_id, quote, remarks, invoice_fees, teams, status, entry_by_id, financial_year, work_frequency) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [projectResponse.new_id, clientId, newCompanyId, inquiryId, invoiceFirm.id, mainProject.id, newSubProjectId, quote, remarks ?? "Need to add financial year later on.", invoiceFees, teams, Statuses.Projects.Active, userId, financialYear, workFrequency.name]);

		const clientQuery = `UPDATE clients SET company_id=?, is_confirmed=1 WHERE id=?`;
		const clientParameters = [newCompanyId, clientId];

		const inquiryQuery = `UPDATE inquiries SET closure_reason=?, follow_ups=?, main_project_id=?, sub_project_id=?, status=?, quote=? WHERE id=?`;
		const inquiryParameters = ["", teams, mainProject.id, newSubProjectId, Statuses.Inquiries.Confirmed, quote, inquiryId];

		const noteQuery = `INSERT INTO notes (inquiry_id, project_id, original_entry_by_id, entry_by_id, content, source) VALUES (?, ?, ?, ?, ?, ?)`;
		const noteParameters = [inquiryId, projectResponse.new_id, userId, userId, escapeString(note), BaseModules.Projects];

		const [clientRows, inquiryRows, noteRows] = await Promise.all([query(clientQuery, clientParameters), query(inquiryQuery, inquiryParameters), query(noteQuery, noteParameters)]);

		if (response.affectedRows > 0 || clientRows.affectedRows > 0 || inquiryRows.affectedRows > 0 || noteRows.affectedRows > 0) {
			res.status(200).send(projectResponse.new_id);
		} else {
			res.status(400).end();
		}
	} catch (error) {
		console.error(error);
		return res.status(500).end(error.message);
	}
}
