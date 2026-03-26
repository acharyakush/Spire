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
		const { customId, firmId, clientId, clientAddress, services, remarks, date, termsConditions } = req.body;

		await query("UPDATE inquiries_quotations SET firm_id = ?, client_id = ?, client_address = ?, date = ?, remarks = ?, terms_conditions = ? WHERE custom_id = ?", [firmId, clientId, clientAddress ?? "", date, remarks, termsConditions, customId]);

		await Promise.all(services.map((s) => query("INSERT INTO inquiries_quotations_services (quotation_id, services, inclusions, professional_fees, government_fees) VALUES (?, ?, ?, ?, ?)", [customId, s?.services, s?.inclusions, s?.professionalFees, s?.governmentFees])));

		await Promise.all(services.map((s) => query("UPDATE inquiries_quotations_services SET services = ?, inclusions = ?, professional_fees = ?, government_fees = ? WHERE quotation_id = ?", [s?.services, s?.inclusions, s?.professionalFees, s?.governmentFees, customId])));

		return res.status(200).end();
	} catch (error) {
		console.error(error);
		return res.status(500).send("Internal Server Error");
	}
}
