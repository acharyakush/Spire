/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import MyConstants from "@/utilities/constants";

import { MyGlobal } from "@/utilities/global";
import { query } from "@/utilities/dbConnection";

export default async function handler(req, res) {
	if (!MyGlobal.IsApiCallMethodValid(req)) {
		res.status(403).send(MyConstants.Messages.ApiCallForbidden);
	} else if (req.method !== "POST") {
		res.status(405).end();
	} else {
		try {
			res.setHeader("Cache-Control", "no-store, max-age=0");

			const request = req.body;

			let queryParameters = "";
			let queryString = "";

			if (request.type == "add-user-activity") {
				let ipAddress =
					String(req.headers["x-forwarded-for"] || "")
						.split(",")
						.at(0)
						.trim() ||
					req.socket.remoteAddress ||
					"";

				if (ipAddress === "::1" || ipAddress === "127.0.0.1" || ipAddress === "::ffff:127.0.0.1") {
					ipAddress = "Localhost";
				}

				const userAgent = req.headers["user-agent"] || "";

				queryString = "INSERT INTO activities (user_id, module, activity, ip_address, user_agent, session_token, details) VALUES (?, ?, ?, ?, ?, ?, ?)";

				queryParameters = [request.userId, request.module, request.activity, ipAddress, userAgent, request.sessionToken, ""];
			} else if (request.type == "set-user-status") {
				queryString = "UPDATE employees SET is_active=? WHERE id=?";
				queryParameters = [request.status, request.userId];
			} else if (request.type == "update-inquiry-status") {
				queryString = `UPDATE inquiries SET status=?, is_closed=0, closure_reason="", updated_at=NOW() WHERE id=?`;
				queryParameters = [request.status, request.inquiryId];
			} else if (request.type == "close-inquiry") {
				queryString = "UPDATE inquiries SET status=?, is_closed=1, closure_reason=?, updated_at=NOW() WHERE id=?";
				queryParameters = [request.status, request.reason, request.inquiryId];
			} else if (request.type == "add-note") {
				queryString = "INSERT INTO notes (inquiry_id, user_id, content, source) VALUES (?, ?, ?, ?)";
				queryParameters = [request.id, request.userId, request.content, request.source];
			} else if (request.type == "update-project-status") {
				queryString = "UPDATE projects SET status=? WHERE id=? AND client_id=? AND company_id=? AND inquiry_id=?";
				queryParameters = [request.new_status, request.projectId, request.client_id, request.company_id, request.inquiry_id];
			} else if (request.type == "delete-project") {
				queryString = "UPDATE projects SET is_deleted=1, updated_at=NOW() WHERE id=?";
				queryParameters = [request.id];
			} else if (request.type == "mark-task-as-completed") {
				queryString = "UPDATE tasks SET is_completed=1, completed_on=? WHERE id=? AND project_id=?";
				queryParameters = [request.completedOn, request.taskId, request.projectId];
			} else if (request.type == "handle-government-id") {
				queryString = "UPDATE projects SET government_id=? WHERE id=?";
				queryParameters = [request.governmentId, request.projectId];
			} else if (request.type == "update-quote") {
				queryString = "UPDATE projects SET quote=? WHERE id=?";
				queryParameters = [request.quote, request.projectId];
			}

			const response = await query(queryString, queryParameters);

			if (response.affectedRows > 0) {
				res.status(200).end();
			} else {
				res.status(400).end();
			}
		} catch (error) {
			console.log(error);
			res.status(500).send(error);
		}
	}
}
