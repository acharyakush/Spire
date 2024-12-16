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
		const { client, contactNumber, emailAddress, entryDate, followUps, id, mainProjectId, quote, reference, subProject, userId } = req.body;

		let newReferenceId = reference.id;

		if (reference.id == 0) {
			await query("CALL generate_dynamic_id('RF', 'the_references', @new_reference_id)", []);
			const [response] = await query("SELECT @new_reference_id AS new_id;", []);

			newReferenceId = response.new_id;
		}

		let newSubProjectId = subProject.id;

		if (subProject.id == 0) {
			await query("CALL generate_dynamic_id('SP', 'sub_projects', @new_sub_project_id)", []);
			const [response] = await query("SELECT @new_sub_project_id AS new_id;", []);

			newSubProjectId = response.new_id;
		}

		let newClientId = client.id;

		if (client.id == 0) {
			await query("CALL generate_dynamic_id('CN', 'clients', @new_client_id)", []);
			const [response] = await query("SELECT @new_client_id AS new_id;", []);

			newClientId = response.new_id;
		}

		if (reference.id == 0) {
			const response = await query("INSERT INTO the_references (id, client_id, name) VALUES (?, ?, ?)", [newReferenceId, newClientId, reference.name]);

			if (response.affectedRows == 0) {
				return res.status(400).send("Could not add Reference.");
			}
		}

		if (subProject.id == 0) {
			const response = await query("INSERT INTO sub_projects (id, name, created_by) VALUES (?, ?, ?)", [newSubProjectId, subProject.name, userId]);

			if (response.affectedRows == 0) {
				return res.status(400).send("Could not add Sub Project.");
			}
		}

		if (client.id == 0) {
			const response = await query("INSERT INTO clients (id, reference_id, name, contact_number, email_address) VALUES (?, ?, ?, ?, ?)", [
				newClientId,
				newReferenceId,
				client.name,
				contactNumber,
				emailAddress,
			]);

			if (response.affectedRows == 0) {
				return res.status(400).send("Could not add Client.");
			}
		}

		const inquiryUpdateResult = await query(
			`UPDATE inquiries SET client_id = ?, reference_id = ?, main_project_id = ?, sub_project_id = ?, entry_date = ?, contact_number = ?, email_address = ?, follow_ups = ?, quote = ?, updated_at = ?, updated_by = ? WHERE id = ?`,
			[newClientId, newReferenceId, mainProjectId, subProject.id, entryDate, contactNumber, emailAddress, followUps, quote, "NOW()", userId, id],
		);

		if (inquiryUpdateResult.affectedRows == 0) {
			return res.status(400).send("Could not edit Inquiry.");
		}

		return res.status(200).end();
	} catch (error) {
		console.error(error);
		return res.status(500).send("Internal Server Error");
	}
}
