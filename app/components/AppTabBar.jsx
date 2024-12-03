"use client";

// Imports
import axios from "axios";
import MyConstants from "@/utilities/constants";

import { Avatar } from "primereact/avatar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menubar } from "primereact/menubar";
import { applicationName, MyGlobal } from "@/utilities/global";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faBriefcase,
	faBuilding,
	faCircleQuestion,
	faFileInvoiceDollar,
	faHouseChimneyWindow,
	faIdCard,
	faListCheck,
	faNoteSticky,
	faRightLeft,
	faSitemap,
	faUserGroup,
	faUserShield,
	faUserTag,
	faUserTie,
} from "@fortawesome/free-solid-svg-icons";

// Business Logic

// Component
export default function AppTabBar() {
	// Business Logic
	const router = useRouter();

	const [otherData, setOtherData] = useState({ modules: [] });

	const loggedInUserDetails = MyGlobal.getLoggedInUserDetails();

	// Functions
	const generateMenuItems = (modules) => {
		const icons = {
			admins: <FontAwesomeIcon className="mr-2" size="sm" icon={faUserGroup} />,
			affiliates: <FontAwesomeIcon className="mr-2" size="sm" icon={faSitemap} />,
			cashFlow: <FontAwesomeIcon className="mr-2" size="sm" icon={faRightLeft} rotation={90} />,
			clients: <FontAwesomeIcon className="mr-2" size="sm" icon={faUserTie} />,
			companies: <FontAwesomeIcon className="mr-2" size="sm" icon={faBuilding} />,
			dashboard: <FontAwesomeIcon className="mr-2" size="sm" icon={faHouseChimneyWindow} />,
			employees: <FontAwesomeIcon className="mr-2" size="sm" icon={faIdCard} />,
			inquiries: <FontAwesomeIcon className="mr-2" size="sm" icon={faCircleQuestion} />,
			invoices: <FontAwesomeIcon className="mr-2" size="sm" icon={faFileInvoiceDollar} />,
			notes: <FontAwesomeIcon className="mr-2" size="sm" icon={faNoteSticky} />,
			projects: <FontAwesomeIcon className="mr-2" size="sm" icon={faBriefcase} />,
			references: <FontAwesomeIcon className="mr-2" size="sm" icon={faUserTag} />,
			tasks: <FontAwesomeIcon className="mr-2" size="sm" icon={faListCheck} />,
		};

		const visibleModules = ["Dashboard", "Inquiries", "Projects", "Clients", "Affiliates", "Invoices", "Cash Flow"];

		const mainModules = modules.filter((module) => visibleModules.includes(module.name));
		const moreModules = modules.filter((module) => !visibleModules.includes(module.name));

		const moreSection = {
			label: "More",
			items: moreModules
				.map((module) => ({
					label: module.name,
					icon: icons[module.name.toLowerCase()],
					command: () => router.push(MyConstants.PageRoutes[module.name.toLowerCase()]),
				}))
				.sort((a, b) => a.label.localeCompare(b.label)),
		};

		const menuBarModules = mainModules.map((module) => ({
			label: module.name,
			icon: icons[module.name.toLowerCase()],
			command: () => {
				if (typeof MyConstants.PageRoutes[module.name.toLowerCase()] === "object") {
					router.push(MyConstants.PageRoutes[module.name.toLowerCase()]?.index);
				} else {
					router.push(MyConstants.PageRoutes[module.name.toLowerCase()]);
				}
			},
		}));

		menuBarModules.push(moreSection);

		return menuBarModules;
	};

	const getAllPermissions = async () => {
		try {
			const response = await axios.get(MyConstants.ApiEndpoints.getData, { params: { table: "permissions" } });

			const revisedModules = response.data.at(0).data.reduce((group, currentItem) => {
				if (currentItem.type === "Base") {
					group.push({ ...currentItem, children: [] });
				} else {
					const parent = group.find((group) => group.module === currentItem.module && group.type === "Base");

					if (parent) {
						if (currentItem.sidebar_visibility) {
							parent.children.push(currentItem);
						}
					}
				}
				return group;
			}, []);

			setOtherData((old) => ({ ...old, modules: revisedModules }));
		} catch (error) {
			if ("response" in error) {
				showSnackbar(error.response.data.error, MyConstants.ToastTypes.error);
			}
		}
	};

	const logout = () => {
		router.replace("/");
	};

	const setPageTitle = () => {
		return `${loggedInUserDetails?.user?.first_name} ${loggedInUserDetails?.user?.last_name} :: ${applicationName}`;
	};

	// UI Components

	// Hooks
	useEffect(() => {
		document.title = setPageTitle();
		getAllPermissions();
	}, []);

	// Main UI
	return (
		<div className="custom-menubar">
			<div className="custom-menubar-start">
				<span className="w-full py-3 text-center font-semibold text-2xl">{process.env.NEXT_PUBLIC_APPLICATION_NAME.toUpperCase()}</span>
			</div>
			<div className="custom-menubar-items">
				<Menubar model={generateMenuItems(otherData.modules)} style={{ border: "none" }} />
			</div>
			<div className="custom-menubar-end">
				<div className="flex w-full justify-center items-center">
					<Avatar image="https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png" onClick={logout} shape="circle" />
				</div>
			</div>
		</div>
	);
}
