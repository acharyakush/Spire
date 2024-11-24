"use client";

// Imports
import { CssBaseline } from "@mui/material";

// Component
export default function HomeLayout({ children }) {
	// Main UI
	return (
		<div>
			<CssBaseline enableColorScheme />
			<main>{children}</main>
		</div>
	);
}
