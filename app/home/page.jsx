"use client";

// Imports
import { useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import MyConstants from "@/utilities/constants";

// Component
export default function Home() {
	// Business Logic
	const router = useRouter();

	// Hooks
	useLayoutEffect(() => {
		router.replace(MyConstants.PAGE_ROUTES.inquiries);
	}, []);

	return null;
}
