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
		const { client, phoneNumber, emailAddress, entryDate, followUps, mainProjectId, note, quote, reference, subProject, userId } = req.body;

		await query("CALL generate_dynamic_id('IQ', 'inquiries', @new_inquiry_id)", []);
		const [inquiryResponse] = await query("SELECT @new_inquiry_id AS new_id;", []);

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
			const response = await query("INSERT INTO sub_projects (id, name, entry_by_id) VALUES (?, ?, ?)", [newSubProjectId, subProject.name, userId]);

			if (response.affectedRows == 0) {
				return res.status(400).send("Could not add Sub Project.");
			}
		}

		if (client.id == 0) {
			const response = await query("INSERT INTO clients (id, reference_id, name, phone_number, email_address) VALUES (?, ?, ?, ?, ?)", [
				newClientId,
				newReferenceId,
				client.name,
				phoneNumber,
				emailAddress,
			]);

			if (response.affectedRows == 0) {
				return res.status(400).send("Could not add Client.");
			}
		}

		const updateClientDetailsQueryResult = await query("UPDATE clients SET email_address=?, phone_number=? WHERE id=?", [
			emailAddress,
			phoneNumber,
			newClientId,
		]);

		if (updateClientDetailsQueryResult.affectedRows == 0) {
			return res.status(400).send("Could not update Client.");
		}

		const inquiryInsertResult = await query(
			"INSERT INTO inquiries (id, client_id, reference_id, main_project_id, sub_project_id, entry_date, phone_number, email_address, follow_ups, quote, status, entry_by_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
			[
				inquiryResponse.new_id,
				newClientId,
				newReferenceId,
				mainProjectId,
				newSubProjectId,
				entryDate,
				phoneNumber,
				emailAddress,
				followUps,
				quote,
				"Open",
				userId,
			],
		);

		if (inquiryInsertResult.affectedRows == 0) {
			return res.status(400).send("Could not add Inquiry.");
		}

		const noteInsertResult = await query("INSERT INTO notes (inquiry_id, entry_by_id, content, source) VALUES (?, ?, ?, ?)", [
			inquiryResponse.new_id,
			userId,
			MyGlobal.EscapeString(note),
			MyConstants.Modules.Base.Inquiries,
		]);

		if (noteInsertResult.affectedRows == 0) {
			return res.status(400).send("Could not add Note.");
		}

		return res.status(200).send(inquiryResponse.new_id);
	} catch (error) {
		console.error(error);
		return res.status(500).send("Internal Server Error");
	}
}
