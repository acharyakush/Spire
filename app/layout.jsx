"use client";

// Imports
import "./globals.css";
import "primeicons/primeicons.css";
import "primereact/resources/themes/lara-light-blue/theme.css";

import theme from "@/utilities/theme";

import { PrimeReactProvider } from "primereact/api";
import { ToastProvider } from "./context/ToastContext";

// Component
export default function RootLayout({ children }) {
	// Main UI
	return (
		<html suppressHydrationWarning>
			<head>
				<title>Welcome :: Spire</title>
			</head>
			<body>
				<PrimeReactProvider value={theme}>
					<ToastProvider>{children}</ToastProvider>
				</PrimeReactProvider>
			</body>
		</html>
	);
}
