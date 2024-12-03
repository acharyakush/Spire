"use client";

// Imports
import MyConstants from "@/utilities/constants";

import { Button } from "primereact/button";
import { useRouter } from "next/navigation";
import { Toolbar } from "primereact/toolbar";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { InputText } from "primereact/inputtext";

// Component
export default function Page() {
	// Business Logic
	const router = useRouter();

	// Functions
	const goToNewInquiry = () => {
		router.push(MyConstants.PageRoutes.inquiries.newInquiry);
	};

	// UI Components
	const centerContent = (
		<IconField iconPosition="left">
			<InputIcon className="pi pi-search" />
			<InputText className="p-inputtext-sm" placeholder="Search" />
		</IconField>
	);

	const endContent = <Button label="New" onClick={goToNewInquiry} size="small" />;

	const startContent = <h2>Inquiries</h2>;

	// Main UI
	return (
		<div className="flex w-full">
			<Toolbar className="w-full !py-0" start={startContent} center={centerContent} end={endContent} />
		</div>
	);
}
