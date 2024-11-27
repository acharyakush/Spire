"use client";

// Imports
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { usePathname, useRouter } from "next/navigation";
import { NavigateNextRounded } from "@mui/icons-material";
import { Breadcrumbs, Link, Typography } from "@mui/material";
import MyConstants from "@/utilities/constants";

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

	const rows = [
		{
			id: "IQ00001",
			client_id: "CN00001",
			reference_id: "RF00001",
			main_project_id: "MP000007",
			sub_project_id: "SP000024",
			contact_number: 9319733922,
			entry_date: "2024-10-12T09:00:00",
			email_address: "accounts@laseroptics.in",
			follow_ups: "EP00005,EP00001",
			inquiry_type_id: 1,
			is_closed: 0,
			closure_reason: "",
			quote: 15000.0,
			status: "Confirmed",
			tags: "GST, Returns",
			created_at: "2024-10-12T09:00:00",
			created_by: "SA001",
			updated_at: "2024-10-12T09:00:00",
			updated_by: "SA001",
		},
	];

	// Main UI
	return (
		<>
			<Breadcrumbs separator={<NavigateNextRounded fontSize="small" />} sx={{ marginBottom: 2 }}>
				{breadcrumbs}
			</Breadcrumbs>
			<h2>Inquiries</h2>
			<div style={{ height: 600, width: "100%" }}>
				<DataGrid
					columns={MyConstants.TABLE_HEADERS.inquiries}
					getEstimatedRowHeight={() => 200}
					getRowHeight={() => "auto"}
					rows={rows}
					slots={{ toolbar: GridToolbar }}
				/>
			</div>
		</>
	);
}
