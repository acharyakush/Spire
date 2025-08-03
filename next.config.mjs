// next.config.js
import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
	cacheMaxMemorySize: 0,
	eslint: { ignoreDuringBuilds: true },
	generateEtags: false,
	images: { unoptimized: true },
	onDemandEntries: {
		maxInactiveAge: 5000, // 5 seconds
		pagesBufferLength: 1, // only 1 page cached at a time
	},
	poweredByHeader: false,
	reactStrictMode: false,

	// ✅ Add this for PDF.js
	webpack(config) {
		config.module.rules.push({
			test: /\.mjs$/,
			include: /node_modules/,
			type: "javascript/auto",
		});
		config.resolve.alias["pdfjs-dist/build/pdf.worker.min.js"] = path.resolve("node_modules/pdfjs-dist/build/pdf.worker.min.js");
		return config;
	},
};

export default nextConfig;
