/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import path from "path";

import { mkdir, readdir } from "fs/promises";
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
		const rvDir = path.join(process.cwd(), "public", "rv");

		if (!existsSync(rvDir)) {
			await mkdir(rvDir, { recursive: true });
		}

		const busboy = new Busboy({ headers: req.headers });

		busboy.on("file", async (fieldname, file, filename) => {
			try {
				// const baseName = path.parse(filename).name;
				// const extension = path.parse(filename).ext;

				// Handle duplicate filenames like projectId_(1).pdf
				const finalFileName = filename;
				// let counter = 1;

				// const existingFiles = await readdir(rvDir);

				// while (existingFiles.includes(finalFileName)) {
				// 	finalFileName = `${baseName}_(${counter})${extension}`;
				// 	counter++;
				// }

				const filePath = path.join(rvDir, finalFileName);

				const writeStream = createWriteStream(filePath);
				file.pipe(writeStream);

				writeStream.on("finish", () => {
					console.log(`File saved: ${filePath}`);
				});

				writeStream.on("error", (err) => {
					console.error("Stream error:", err);
					res.status(500).end();
				});
			} catch (error) {
				console.error("File processing error:", error);
				res.status(500).end();
			}
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
