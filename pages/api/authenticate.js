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

			const decryptedBody = MyGlobal.Decrypt(req.body.credentials);
			const body = JSON.parse(decryptedBody);

			const emailAddress = String(body.emailAddress);
			const emailAddressDomain = String(emailAddress.split("@").at(1));

			const isAdministrator = emailAddressDomain.includes("admins.spire.com");
			const tableName = isAdministrator ? "administrators" : "employees";

			const response = await query(`SELECT * FROM ${tableName} WHERE email_address=? AND password=?`, [emailAddress, MyGlobal.Encrypt(body.password)]);

			if (!response.length) {
				res.status(404).end();
			} else if (response[0].access_revoked == 1 || response[0].employment_status !== "Active") {
				res.status(403).end();
			} else {
				const jsonResponse = JSON.stringify(response[0]);
				const encryptedResponse = MyGlobal.Encrypt(jsonResponse);

				res.status(200).send(encryptedResponse);
			}
		} catch (error) {
			console.log(error);
			res.status(500).send(error);
		}
	}
}
