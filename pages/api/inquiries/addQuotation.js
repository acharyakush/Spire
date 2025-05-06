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
		const { customId, firmId, clientId, inquiryId, clientAddress, services, remarks, date, termsConditions, userId } = req.body;

		await query("INSERT INTO inquiries_quotations (custom_id, firm_id, client_id, client_address, remarks, date, terms_conditions, entry_by_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
			customId,
			firmId,
			clientId,
			clientAddress,
			remarks,
			date,
			termsConditions,
			userId,
		]);

		await query("UPDATE inquiries SET quotation_id=? WHERE id=?", [customId, inquiryId]);

		await Promise.all(
			services.map((s) =>
				query("INSERT INTO inquiries_quotations_services (quotation_id, services, inclusions, professional_fees, government_fees) VALUES (?, ?, ?, ?, ?)", [
					customId,
					s?.services,
					s?.inclusions,
					s?.professionalFees,
					s?.governmentFees,
				]),
			),
		);

		return res.status(200).end();
	} catch (error) {
		console.error(error);
		return res.status(500).send("Internal Server Error");
	}
}
