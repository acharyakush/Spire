"use client";

// Imports
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;

import "@mantine/core/styles.css";

import "@/styles/globals.css";
import "tippy.js/dist/tippy.css";
import "react-toastify/dist/ReactToastify.css";

import { useEffect } from "react";
import { MantineProvider } from "@mantine/core";
import { ToastContainer, Zoom } from "react-toastify";

export default function App({ Component, pageProps }) {
	// Hooks
	useEffect(() => {
		document.body.setAttribute("app-theme", "light");
	}, []);

	// Main UI
	return (
		<MantineProvider
			theme={{
				fontFamily: "var(--font-family)",
				headings: {
					fontFamily: "var(--font-family)",
				},
			}}>
			<ToastContainer newestOnTop pauseOnFocusLoss transition={Zoom} />
			<Component {...pageProps} />
		</MantineProvider>
	);
}
