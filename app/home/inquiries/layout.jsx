"use client";

// Imports
import axios from "axios";
import MyConstants from "@/utilities/constants";

import { useToast } from "@/app/context/ToastContext";
import { createContext, useEffect, useState } from "react";

export const NewInquiryContext = createContext();

// Component
export default function HomeLayout({ children }) {
	// Business Logic
	const showToast = useToast();

	const [data, setData] = useState({
		allClients: [],
		allStatuses: [],
	});

	// Functions
	const getAllClients = async () => {
		try {
			const response = await axios.get(
				MyConstants.ApiEndpoints.getAllClients,
			);

			if (response.status === 200) {
				setData((old) => ({ ...old, allClients: response.data }));
			}
		} catch (error) {
			if ("response" in error) {
				if ("object" in error.response.data) {
					showToast(
						error.response.data.object.name,
						MyConstants.ToastTypes.error,
					);
				} else {
					showToast(
						error.response.data.error,
						MyConstants.ToastTypes.error,
					);
				}
			}
		}
	};

	const getAllStatuses = async () => {
		try {
			const response = await axios.get(
				MyConstants.ApiEndpoints.getAllStatuses,
			);

			if (response.status === 200) {
				const getInquiryEntity = response.data
					.filter((status) => status.entity == "Inquiries")
					.at(0);

				const inquiryStatuses = JSON.parse(getInquiryEntity.statuses);

				setData((old) => ({ ...old, allStatuses: inquiryStatuses }));
			}
		} catch (error) {
			if ("response" in error) {
				if ("object" in error.response.data) {
					showToast(
						error.response.data.object.name,
						MyConstants.ToastTypes.error,
					);
				} else {
					showToast(
						error.response.data.error,
						MyConstants.ToastTypes.error,
					);
				}
			}
		}
	};

	// Hooks
	useEffect(() => {
		getAllClients();
		getAllStatuses();
	}, []);

	// Main UI
	return (
		<NewInquiryContext.Provider value={{ data }}>
			{children}
		</NewInquiryContext.Provider>
	);
}
