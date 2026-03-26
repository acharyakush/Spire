const { parse } = require("url");
const { createServer } = require("http");

const next = require("next");

const dev = false;
const hostname = "localhost";
const port = 1993;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
	createServer(function (req, res) {
		try {
			const parsedUrl = parse(req.url, true);
			handle(req, res, parsedUrl);
		} catch (err) {
			console.error("Error occurred = ", req.url, err);
			res.statusCode = 500;
			res.end("Internal server error occured.");
		}
	}).listen(port, function (error) {
		if (error) throw error;
		console.log("\nServing on http://" + hostname + ":" + port);
	});
});
