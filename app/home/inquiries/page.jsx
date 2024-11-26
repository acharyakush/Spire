"use client";

// Imports
import { usePathname, useRouter } from "next/navigation";
import { NavigateNextRounded } from "@mui/icons-material";
import { Breadcrumbs, Link, Typography } from "@mui/material";

// Component
export default function Page() {
	// Business Logic
	const router = useRouter();
	const pathname = usePathname();

	const pathSegments = pathname.split("/").filter((segment) => segment);

	const breadcrumbs = pathSegments.map((segment, index) => {
		const href = "/" + pathSegments.slice(0, index + 1).join("/");
		const label = segment.charAt(0).toUpperCase() + segment.slice(1);

		return index < pathSegments.length - 1 ? (
			<Link
				color="inherit"
				href={href}
				key={href}
				onClick={(e) => {
					e.preventDefault();
					router.push(href);
				}}
				underline="hover">
				{label}
			</Link>
		) : (
			<Typography color="primary" key={href}>
				{label}
			</Typography>
		);
	});

	// Main UI
	return (
		<>
			<Breadcrumbs separator={<NavigateNextRounded fontSize="small" />} sx={{ marginBottom: 2 }}>
				{breadcrumbs}
			</Breadcrumbs>
			<h2>Inquiries</h2>
		</>
	);
}
