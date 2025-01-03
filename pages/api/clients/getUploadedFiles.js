import fs from "fs";
import path from "path";

import { MyGlobal } from "@/utilities/global";

export const config = {
	api: {
		bodyParser: false,
	},
};

export default async function handler(req, res) {
	try {
		if (req.method !== "GET") {
			console.log("Method not allowed");
			res.status(405).end();
			return;
		}

		if (req.method !== "GET" || !MyGlobal.IsApiCallMethodValid(req)) {
			console.log("API calling method is not valid");
			res.status(403).end();
			return;
		}

		res.setHeader("Cache-Control", "no-store, max-age=0");

		const { clientId } = req.query;

		if (!clientId) {
			console.log("Client ID not provided");
			res.status(400).end();
			return;
		}

		const clientFolder = path.join(process.cwd(), "public", clientId);

		if (!fs.existsSync(clientFolder)) {
			res.status(404).end();
			return;
		}

		fs.readdir(clientFolder, (err, files) => {
			if (err) {
				res.status(500).send("Internal Server Error");
				return;
			}

			if (files.length === 0) {
				console.log("No files found");
				res.status(200).send([]);
				return;
			}

			const fileDetails = files.map((file) => {
				const filePath = path.join(clientFolder, file);
				const stats = fs.statSync(filePath);

				return {
					name: file,
					size: stats.size,
					type: path.extname(file),
					uploadDate: stats.mtime,
				};
			});

			res.status(200).send(fileDetails);
		});
	} catch (error) {
		console.error("Unexpected error:", error);
		res.status(500).end();
	}
}
