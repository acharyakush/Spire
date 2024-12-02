"use client";

// Imports
import MyConstants from "@/utilities/constants";

import { useLayoutEffect } from "react";
import { useRouter } from "next/navigation";

// Component
export default function Home() {
	// Business Logic
	const router = useRouter();

	// Hooks
	useLayoutEffect(() => {
		router.replace(MyConstants.PageRoutes.inquiries.index);
	}, []);

	return null;
}
