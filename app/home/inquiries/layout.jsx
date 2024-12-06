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
		allMainProjects: [],
		allReferences: [],
		allStaff: [],
		allSubProjects: [],
		inquiryStatuses: [],
	});

	// Functions
	const extractApiResponseDataByEntity = (entity, payload) => {
		return payload.filter((object) => object.table == entity).at(0).data;
	};

	const getRequiredData = async () => {
		try {
			const response = await axios.get(MyConstants.ApiEndpoints.getData, {
				params: { table: "administrators,clients,employees,main_projects,the_references,statuses,sub_projects" },
			});

			if (response.status === 200) {
				const payload = response.data;

				const allClients = extractApiResponseDataByEntity("clients", payload);
				const allMainProjects = extractApiResponseDataByEntity("main_projects", payload);
				const allReferences = extractApiResponseDataByEntity("the_references", payload);
				const allAdministrators = extractApiResponseDataByEntity("administrators", payload);
				const allEmployees = extractApiResponseDataByEntity("employees", payload);
				const allStatuses = extractApiResponseDataByEntity("statuses", payload);
				const allSubProjects = extractApiResponseDataByEntity("sub_projects", payload);

				setData((old) => ({
					...old,
					allClients,
					allMainProjects,
					allReferences,
					allStaff: allAdministrators.concat(allEmployees),
					allSubProjects,
					inquiryStatuses: allStatuses.filter((status) => status.entity == "Inquiries").at(0).statuses,
				}));
			}
		} catch (error) {
			if ("response" in error) {
				if ("object" in error.response.data) {
					showToast(error.response.data.object.name, MyConstants.ToastTypes.error);
				} else {
					showToast(error.response.data.error, MyConstants.ToastTypes.error);
				}
			}
		}
	};

	// Hooks
	useEffect(() => {
		getRequiredData();
	}, []);

	// Main UI
	return <NewInquiryContext.Provider value={{ data }}>{children}</NewInquiryContext.Provider>;
}
