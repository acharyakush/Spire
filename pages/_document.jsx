"use client";

import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
	const isProd = process.env.NODE_ENV === "production";

	return (
		<Html lang="en">
			<Head>
				<link
					rel="icon"
					type="image/png"
					href="/favicon.png"
				/>
			</Head>
			<body className={`antialiased production-font-features`}>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
