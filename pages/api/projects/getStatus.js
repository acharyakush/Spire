import MyConstants from "@/utilities/constants";

import { MyGlobal } from "@/utilities/global";
import { query } from "@/utilities/dbConnection";

export default async function handler(req, res) {
	if (req.method !== "GET" || !MyGlobal.IsApiCallMethodValid(req)) {
		return res.status(405).send(MyConstants.Messages.ApiCallForbidden);
	}

	res.setHeader("Cache-Control", "no-store, max-age=0");

	try {
		const [tasks, project_expenses] = await Promise.all([
			query("SELECT * FROM tasks WHERE project_id=?", [req.query.projectId]), // Queries
			query("SELECT * FROM project_expenses WHERE project_id=?", [req.query.projectId]),
		]);

		return res.status(200).json({ tasks, project_expenses });
	} catch (error) {
		console.error(error);
		return res.status(500).send("Internal Server Error");
	}
}
