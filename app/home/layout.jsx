"use client";

// Imports
import MySidebar from "../components/MySidebar";

// Component
export default function HomeLayout({ children }) {
	// Main UI
	return (
		<div className="flex h-screen">
			<MySidebar />
			<main className="flex p-4">{children}</main>
		</div>
	);
}
