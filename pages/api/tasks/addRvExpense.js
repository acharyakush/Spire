import { query } from "@/utilities/dbConnection";
import { Messages } from "@/utilities/constants";

export default async function handler(req, res) {
	if (req.method !== "POST") return res.status(405).send(Messages.ApiCallForbidden);

	res.setHeader("Cache-Control", "no-store, max-age=0");

	try {
		const { projectId, description, expense, entryDate, userId } = req.body;

		const taskInsertQueryResult = await query("INSERT INTO project_expenses (project_id, description, expense, entry_date, entry_by_id) VALUES (?, ?, ?, ?, ?)", [projectId, description, expense, entryDate, userId]);

		if (!taskInsertQueryResult || taskInsertQueryResult.affectedRows === 0) return res.status(400).end();
		if (!projectId || !description || expense == null) return res.status(400).end("Missing required fields");

		const rvRecords = await query("SELECT * FROM rv WHERE project_id = ? LIMIT 1", [projectId]);

		if (!rvRecords || rvRecords.length === 0) return res.status(404).end("RV record not found");

		const rv = rvRecords[0];
		const particulars = JSON.parse(rv.particulars);

		const newEntry = {
			amount: expense,
			particulars: description,
			rowId: particulars.length,
		};

		particulars.push(newEntry);

		const newAmount = particulars.reduce((sum, p) => sum + Number(p.amount), 0);
		const newAmountPending = newAmount - Number(rv.amount_received);

		const updateResult = await query("UPDATE rv SET particulars = ?, amount = ?, amount_pending = ? WHERE project_id = ?", [JSON.stringify(particulars), newAmount, newAmountPending, projectId]);

		if (updateResult.affectedRows > 0) {
			res.status(200).end();
		} else {
			res.status(400).end();
		}
	} catch (error) {
		console.error(error);
		return res.status(500).end(error.message);
	}
}
