"use client";

// Imports
import axios from "axios";
import MyConstants from "@/utilities/constants";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { applicationName, MyGlobal } from "@/utilities/global";

// Business Logic

// Component
export default function MySidebar() {
	// Business Logic
	const router = useRouter();

	const [hasMounted, setHasMounted] = useState({ sidebar: false });
	const [otherData, setOtherData] = useState({ modules: [] });

	const loggedInUserDetails = MyGlobal.getLoggedInUserDetails();

	// Functions
	const getAllPermissions = async () => {
		try {
			const response = await axios.get(MyConstants.API_ENDPOINTS.getPermissions);

			const revisedModules = response.data.reduce((group, currentItem) => {
				if (currentItem.type === "Base") {
					// Create a new group for the Base item
					group.push({ ...currentItem, children: [], is_expanded: false });
				} else {
					// Find the parent in the same module and add this as a child
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
				showSnackbar(error.response.data.error, MyConstants.NOTIFICATION_TYPES.error);
			}
		}
	};

	const getModuleIcon = (module) => {
		// switch (module) {
		// 	case "Affiliates":
		// 		return <SupervisorAccountRounded fontSize="small" />;
		// 	case "Cash Flow":
		// 		return <MultipleStopRounded fontSize="small" sx={{ transform: "rotate(90deg)" }} />;
		// 	case "Clients":
		// 		return <PeopleAltRounded fontSize="small" />;
		// 	case "Companies":
		// 		return <FactoryRounded fontSize="small" />;
		// 	case "Dashboard":
		// 		return <DashboardRounded fontSize="small" />;
		// 	case "Employees":
		// 		return <BadgeRounded fontSize="small" />;
		// 	case "Invoices":
		// 		return <ReceiptRounded fontSize="small" />;
		// 	case "Inquiry":
		// 		return <QuizRounded fontSize="small" />;
		// 	case "Admins":
		// 		return <StarRounded fontSize="small" />;
		// 	case "Projects":
		// 		return <AccountTreeRounded fontSize="small" />;
		// 	case "References":
		// 		return <GroupAddRounded fontSize="small" />;
		// 	case "Tasks":
		// 		return <PlaylistAddCheckRounded fontSize="small" />;
		// }
	};

	const logout = () => {
		router.replace("/");
	};

	const setPageTitle = () => {
		return `${loggedInUserDetails?.user?.first_name} ${loggedInUserDetails?.user?.last_name} :: ${applicationName}`;
	};

	const toggleModuleChildren = (module) => {
		const oldModules = [...otherData.modules];

		const updatedModule = oldModules.filter((_module) => _module.id == module.id).at(0);
		updatedModule.is_expanded = !updatedModule.is_expanded;

		const revisedModules = oldModules.filter((_module) => _module.id != module.id);
		revisedModules.push(updatedModule);
		revisedModules.sort((a, b) => a.id - b.id);

		setOtherData((old) => ({ ...old, modules: revisedModules }));
	};

	const toggleSidebar = () => {
		setHasMounted((old) => ({ ...old, sidebar: !hasMounted.sidebar }));
	};

	// UI Components
	const uiModules = () => {
		return otherData.modules.map((module, index) => {
			// return (
			// 	<ListItem disablePadding key={module.id} sx={{ display: "block" }}>
			// 		<ListItemButton
			// 			onClick={() => toggleModuleChildren(module)}
			// 			sx={[{ justifyContent: hasMounted.sidebar ? "initial" : "center", minHeight: 24, px: 2.5 }]}>
			// 			<ListItemIcon sx={[{ justifyContent: "center", minWidth: 0, mr: hasMounted.sidebar ? 3 : "auto" }]}>
			// 				{getModuleIcon(module.module)}
			// 			</ListItemIcon>
			// 			<ListItemText primary={module.module} sx={[{ opacity: hasMounted.sidebar ? 1 : 0 }]} />
			// 			{uiToggleChildrenArrows(module)}
			// 		</ListItemButton>
			// 		<Collapse in={module.is_expanded} key={index} timeout="auto" unmountOnExit>
			// 			{uiModulesChild(module)}
			// 		</Collapse>
			// 	</ListItem>
			// );
		});
	};

	const uiModulesChild = (module) => {
		return module.children.map((child) => {
			return <></>;
			// <List component="div" dense disablePadding key={child.id}>
			// 	<ListItemButton>
			// 		<ListItemText inset primary={child.name} />
			// 	</ListItemButton>
			// </List>
		});
	};

	const uiToggleChildrenArrows = (module) => {
		if (hasMounted.sidebar) {
			if (module.children.length) {
				// return module.is_expanded ? <ExpandLessRounded /> : <ExpandMoreRounded />;
			}
		}
	};

	// Hooks
	useEffect(() => {
		document.title = setPageTitle();
		getAllPermissions();
	}, []);

	// Main UI
	return <></>;
}
