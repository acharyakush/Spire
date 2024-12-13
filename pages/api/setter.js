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

			if (request.type == "set-user-activity") {
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

				queryString = `INSERT INTO activities (user_id, activity, ip_address, user_agent, session_token, details) VALUES (?, ?, ?, ?, ?, ?)`;

				queryParameters = [request.userId, request.activity, ipAddress, userAgent, request.sessionToken, ""];
			} else if (request.type == "set-user-status") {
				queryString = `UPDATE employees SET is_active = ? WHERE id = ?`;
				queryParameters = [request.status, request.userId];
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
