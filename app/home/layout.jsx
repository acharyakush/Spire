"use client";

// Imports
import AppMenuBar from "../components/AppMenuBar";

// Component
export default function HomeLayout({ children }) {
	// Main UI
	return (
		<div className="h-screen">
			<AppMenuBar />
			<main className="flex p-4">{children}</main>
		</div>
	);
}
