"use client";

import { ColorSchemeScript } from "@mantine/core";
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<link rel="icon" type="image/png" href="/favicon.png" />
				<ColorSchemeScript defaultColorScheme="auto" />
			</Head>
			<body className={`antialiased`}>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
