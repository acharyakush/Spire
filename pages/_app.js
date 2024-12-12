"use client";

// Imports
import Head from "next/head";

import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;

import "@/styles/globals.css";
import "tippy.js/dist/tippy.css";
import "react-toastify/dist/ReactToastify.css";

import { useEffect } from "react";
import { ToastContainer, Zoom } from "react-toastify";

export default function App({ Component, pageProps }) {
	// Hooks
	useEffect(() => {
		document.body.setAttribute("app-theme", "light");
	}, []);

	// Main UI
	return (
		<>
			<ToastContainer newestOnTop pauseOnFocusLoss transition={Zoom} />
			<Component {...pageProps} />
		</>
	);
}
