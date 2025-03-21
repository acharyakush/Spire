import fs from "fs";
import path from "path";

export const config = {
	api: {
		bodyParser: false,
	},
};

const handler = (req, res) => {
	if (req.method != "DELETE") {
		res.status(405).end();
	}

	const { clientId, fileNames } = req.query;

	if (!clientId || !fileNames) {
		res.status(400).end();
	}

	const clientFolder = path.join(process.cwd(), "public", clientId);
	const filenamesArray = Array.isArray(fileNames) ? fileNames : [fileNames];

	if (!fs.existsSync(clientFolder)) {
		res.status(404).end();
		return;
	}

	const results = filenamesArray.map((fileName) => {
		const filePath = path.join(clientFolder, fileName);

		if (!fs.existsSync(filePath)) {
			return { fileName, success: false, message: `${fileName} not found` };
		}

		try {
			fs.unlinkSync(filePath);
			return { fileName, success: true, message: "File deleted successfully" };
		} catch (error) {
			return { fileName, success: false, message: "Error deleting file", error: error.message };
		}
	});

	const successResults = results.filter((result) => result.success);
	const errorResults = results.filter((result) => !result.success);

	if (errorResults.length > 0) {
		res.status(500).send({
			message: "Some files could not be deleted",
			successResults,
			errorResults,
		});
	} else {
		res.status(200).end();
	}
};

export default handler;
