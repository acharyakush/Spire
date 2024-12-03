"use client";

// Imports
import AppTabBar from "../components/AppTabBar";

// Component
export default function HomeLayout({ children }) {
	// Main UI
	return (
		<div className="h-screen">
			<AppTabBar />
			<main className="flex p-4">{children}</main>
		</div>
	);
}
