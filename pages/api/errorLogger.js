const fs = require("fs");

export default function handler(req, res) {
	const errorText = req.body.errorText;
	const source = req.body.source;
	const userId = req.body.userId;

	const currentTimestamp = new Date()
		.toLocaleString("en-in", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			hour12: true,
			minute: "2-digit",
			second: "2-digit",
		})
		.replace(",", "");

	if (fs.existsSync("error-logs.log")) {
		const file = fs.readFileSync("error-logs.log", { encoding: "utf8" });
		fs.unlinkSync("error-logs.log");

		if (fs.existsSync("./public/error-logs.log")) {
			fs.unlinkSync("./public/error-logs.log");
		}

		const newRecord = `${userId}||${currentTimestamp}||${source}||${errorText}\n`;
		const data = `${newRecord}${file}`;

		fs.writeFileSync("error-logs.log", data);
		fs.copyFileSync("error-logs.log", "./public/error-logs.log");

		res.statusCode = 200;
		res.end();
	} else {
		const record = `${userId}||${currentTimestamp}||${source}||${errorText}\n`;

		fs.writeFileSync("error-logs.log", record);
		fs.copyFileSync("error-logs.log", "./public/error-logs.log");

		res.statusCode = 200;
		res.end();
	}
}
