/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import { Messages } from "@/utilities/constants";

import { MyGlobal } from "@/utilities/global";
import { query } from "@/utilities/dbConnection";

export default async function handler(req, res) {
	if (req.method !== "GET" || !MyGlobal.IsApiCallMethodValid(req)) {
		return res.status(405).send(Messages.ApiCallForbidden);
	}

	res.setHeader("Cache-Control", "no-store, max-age=0");

	try {
		const [companies, inquiries, invoices, transactions, projects, rv, tasks] = await Promise.all([
			query("SELECT id, name FROM companies WHERE is_deleted = 0", []), // Queries
			query("SELECT status, follow_ups, quote, entry_date FROM inquiries", []),
			query("SELECT amount, due_date, custom_id, project_id FROM invoices", []),
			query("SELECT project_id, amount FROM invoices_transactions", []),
			query("SELECT id, status, teams, invoice_fees, company_id, quote, started_on, entry_at FROM projects WHERE is_deleted=0", []),
			query("SELECT due_date, amount, amount_pending, custom_id, project_id FROM rv", []),
			query("SELECT project_id, expense FROM tasks", []),
		]);

		return res.status(200).json({ companies, inquiries, invoices, transactions, projects, rv, tasks });
	} catch (error) {
		console.error(error);
		return res.status(500).send("Internal Server Error");
	}
}
