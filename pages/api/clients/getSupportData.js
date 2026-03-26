import { Messages } from "@/utilities/constants";

import { MyGlobal } from "@/utilities/global";
import { query } from "@/utilities/dbConnection";

export default async function handler(req, res) {
	if (req.method !== "GET" || !MyGlobal.IsApiCallMethodValid(req)) return res.status(405).send(Messages.ApiCallForbidden);

	res.setHeader("Cache-Control", "no-store, max-age=0");

	try {
		const clientId = req.query.clientId;

		const [companies, projects, reference] = await Promise.all([
			query("SELECT * FROM companies WHERE client_id=? AND is_deleted = 0", [clientId]),
			query(
				`SELECT
					p.*,
					COALESCE(c.name, '') AS company_name,
					COALESCE(f.name, '') AS invoice_firm_name,
					COALESCE(mp.name, '') AS main_project_name,
					COALESCE(sp.name, '') AS sub_project_name,
					COALESCE(it.invoice_amount_received, 0) AS invoice_amount_received,
					COALESCE(rvt.rv_amount_received, 0) AS rv_amount_received,
					COALESCE(pe.reimburse_voucher, 0) AS reimburse_voucher,
					COALESCE(p.invoice_fees, 0) AS invoice_fees,
					COALESCE(it.invoice_amount_received, 0) + COALESCE(rvt.rv_amount_received, 0) AS amount_received,
					(COALESCE(p.invoice_fees, 0) + COALESCE(pe.reimburse_voucher, 0)) AS total_fees,
					((COALESCE(p.invoice_fees, 0) + COALESCE(pe.reimburse_voucher, 0)) - (COALESCE(it.invoice_amount_received, 0) + COALESCE(rvt.rv_amount_received, 0))) AS amount_pending
				FROM projects p
				LEFT JOIN companies c ON c.id = p.company_id
				LEFT JOIN firms f ON f.id = p.firm_id
				LEFT JOIN main_projects mp ON mp.id = p.main_project_id
				LEFT JOIN sub_projects sp ON sp.id = p.sub_project_id
				LEFT JOIN (
					SELECT project_id, SUM(amount) AS invoice_amount_received
					FROM invoices_transactions
					GROUP BY project_id
				) it ON it.project_id = p.id
				LEFT JOIN (
					SELECT project_id, SUM(amount) AS rv_amount_received
					FROM rv_transactions
					GROUP BY project_id
				) rvt ON rvt.project_id = p.id
				LEFT JOIN (
					SELECT project_id, SUM(expense) AS reimburse_voucher
					FROM project_expenses
					GROUP BY project_id
				) pe ON pe.project_id = p.id
				WHERE p.client_id = ? AND p.is_deleted = 0`,
				[clientId],
			),
			query("SELECT name FROM the_references WHERE client_id=? LIMIT 1", [clientId]),
		]);

		return res.status(200).json({
			companies,
			projects,
			referenceName: reference.length ? reference[0].name : "",
		});
	} catch (error) {
		console.error(error);
		return res.status(500).send("Internal Server Error");
	}
}
