import fs from "fs";
import path from "path";
import multer from "multer";

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const clientId = req.body.clientId;
		const clientFolder = path.join(process.cwd(), "public", clientId);

		if (!fs.existsSync(clientFolder)) {
			fs.mkdirSync(clientFolder, { recursive: true });
		}

		cb(null, clientFolder);
	},
	filename: (req, file, cb) => {
		cb(null, file.originalname);
	},
});

const upload = multer({ storage });

export const config = {
	api: {
		bodyParser: false,
	},
};

export default async function handler(req, res) {
	upload.array("files")(req, res, (err) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ error: "Error uploading files." });
		}

		const clientId = req.body.clientId;

		if (!clientId) {
			return res.status(400).json({ message: "Client ID is required." });
		}

		res.status(200).json({ message: "Files uploaded successfully." });
	});
}
