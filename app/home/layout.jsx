"use client";

// Imports
import { CssBaseline } from "@mui/material";
import MySidebar from "../components/MySidebar";

// Component
export default function HomeLayout({ children }) {
	// Main UI
	return (
		<div style={{ display: "flex", height: "100vh" }}>
			<CssBaseline enableColorScheme />
			<MySidebar />
			<main style={{ flex: 1, padding: "1rem" }}>{children}</main>
		</div>
	);
}
