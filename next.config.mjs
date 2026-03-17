// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
	cacheMaxMemorySize: 0,
	generateEtags: false,
	images: { unoptimized: true },
	onDemandEntries: {
		maxInactiveAge: 5000, // 5 seconds
		pagesBufferLength: 1, // only 1 page cached at a time
	},
	poweredByHeader: false,
	reactStrictMode: false,
};

export default nextConfig;
