/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import path from "path";
import { mkdir } from "fs/promises";
import { existsSync, createWriteStream } from "fs";

const Busboy = require("@fastify/busboy");

export const config = {
	api: {
		bodyParser: false,
	},
};

export default async function handler(req, res) {
	if (req.method !== "POST") {
		return res.status(405).end();
	}

	try {
		const invoicesDir = path.join(process.cwd(), "public", "quotations");

		if (!existsSync(invoicesDir)) {
			await mkdir(invoicesDir, { recursive: true });
		}

		const busboy = new Busboy({ headers: req.headers });

		busboy.on("file", (fieldname, file, filename) => {
			const filePath = path.join(invoicesDir, filename);
			const writeStream = createWriteStream(filePath);

			file.pipe(writeStream);

			writeStream.on("finish", () => {
				console.log(`File saved: ${filePath}`);
			});

			writeStream.on("error", (err) => {
				console.error("Stream error:", err);
				res.status(500).end();
			});
		});

		busboy.on("finish", () => {
			res.status(200).end();
		});

		req.pipe(busboy);
	} catch (error) {
		console.error("File upload error:", error);
		res.status(500).end();
	}
}
