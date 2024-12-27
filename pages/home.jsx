"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import Dashboard from "./dashboard";
import Projects from "@/modules/project";
import Inquiries from "@/modules/inquiry";
import MyConstants from "@/utilities/constants";

import { useRouter } from "next/navigation";
import { ErrorBoundary } from "react-error-boundary";
import { useEffect, useLayoutEffect, useState } from "react";
import { applicationName, MyGlobal } from "@/utilities/global";
import { ErrorFallbackComponent } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { faCheck, faCog, faDatabase, faSignOut, faUserCircle, faUserClock, faUserCog, faUserGroup } from "@fortawesome/free-solid-svg-icons";

export default function Home() {
	// Business Logic
	const router = useRouter();
	const baseModules = MyConstants.Modules.Base;

	const [apiData, setApiData] = useState({
		allPermissions: [],
		allUsers: [],
		modules: [],
		settings: [],
	});

	const [mainData, setMainData] = useState({
		isDarkModeEnabled: false,
		loggedInUser: {},
		selectedModule: { name: baseModules.Dashboard, sequence: 0 },
		singleProjectObject: {},
		theme: null,
	});

	const [hasMounted, setHasMounted] = useState({
		activitiesView: false,
		employeesView: false,
		profileView: false,
		settingsView: false,
	});

	// Functions
	const changeTheme = () => {
		const newTheme = mainData.theme == "light" ? "dark" : "light";
		MyGlobal.Storages.Local.Set("AppMode", newTheme);

		setMainData((old) => ({ ...old, isDarkModeEnabled: !mainData.isDarkModeEnabled, theme: newTheme }));
	};

	const closeProjectsView = () => {
		setMainData((old) => ({
			...old,
			selectedModule: { name: baseModules.Dashboard, sequence: 0 },
			singleProjectObject: {},
		}));
	};

	const doPreRenderingOperations = () => {
		document.body.setAttribute("app-theme", "light");

		const initialTheme = MyGlobal.GetTheme() ?? "light";
		const isDarkModeEnabled = MyGlobal.GetTheme() !== "light";

		const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
		colorScheme.addEventListener("change", (e) => setMainData((old) => ({ ...old, isDarkModeEnabled: e.matches, theme: e.matches ? "dark" : "light" })));

		setMainData((old) => ({ ...old, isDarkModeEnabled: isDarkModeEnabled, theme: initialTheme }));
	};

	const getPermissions = async () => {
		try {
			const response = await axios.get(MyConstants.ApiEndpoints.Getter, MyGlobal.GetHeaders({ type: "get-permissions" }));

			const modules = [];
			const getLoggedInUserData = MyGlobal.GetUserFullDetails();

			response.data
				.filter((permission) => permission.type == "Base")
				.filter((permission) => {
					if (getLoggedInUserData.permissions != -1) {
						const permissions = String(getLoggedInUserData.permissions).split(",");
						const permissionId = String(permission.id);

						if (permissions.includes(permissionId)) {
							modules.push(permission);
						}
					} else {
						modules.push(permission);
					}
				});

			const sequentialModules = modules.sort((a, b) => a.sequence - b.sequence);

			MyGlobal.SetPermission(response.data);

			setApiData((old) => ({ ...old, allPermissions: response.data, modules: sequentialModules }));
			setMainData((old) => ({ ...old, selectedModule: { name: sequentialModules.at(0).module, sequence: sequentialModules.at(0).sequence - 1 } }));
		} catch (error) {
			MyGlobal.HandleErrors(error, "Get All Permissions");
		}
	};

	const getSettings = async () => {
		try {
			const response = await axios.get(MyConstants.ApiEndpoints.Getter, MyGlobal.GetHeaders({ type: "get-settings" }));

			if (response.status == 200) {
				setApiData((old) => ({ ...old, settings: response.data }));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Get Settings");
		}
	};

	const getUserData = () => {
		if (!MyGlobal.Storages.Session.DoesExist(`${applicationName}Token`)) {
			MyGlobal.ShowErrorToast(MyConstants.Messages.UnauthorizedAccess);
			router.replace("/");
		} else {
			MyGlobal.SetUserStatus(1);
			setMainData((old) => ({ ...old, loggedInUser: MyGlobal.GetUserFullDetails() }));
		}
	};

	const getUserMenuClickAction = (menuItem) => {
		switch (menuItem) {
			case MyConstants.UserMenu.Activity:
				toggleActivitiesView();
				break;
			case MyConstants.UserMenu.Employees:
				toggleEmployeeView();
				break;
			case MyConstants.UserMenu.Profile:
				toggleProfileView();
				break;
			case MyConstants.UserMenu.Settings:
				toggleSettingsView();
				break;
			case MyConstants.UserMenu.Logout:
				logout();
				break;
		}
	};

	const getUserMenuIcons = (menuItem) => {
		switch (menuItem) {
			case MyConstants.UserMenu.Activity:
				return faUserClock;
			case MyConstants.UserMenu.Employees:
				return faUserGroup;
			case MyConstants.UserMenu.Profile:
				return faUserCog;
			case MyConstants.UserMenu.Settings:
				return faCog;
			case MyConstants.UserMenu.Storage:
				return faDatabase;
			case MyConstants.UserMenu.Logout:
				return faSignOut;
		}
	};

	const getUsers = async () => {
		try {
			const response = await axios.get(MyConstants.ApiEndpoints.Getter, MyGlobal.GetHeaders({ type: "get-users" }));

			if (response.status == 200) {
				const allUsers = [];

				response.data.administrators.forEach((administrator) => allUsers.push(administrator));
				response.data.employees.forEach((employee) => allUsers.push(employee));

				setApiData((old) => ({ ...old, allUsers }));
				MyGlobal.SetAllUsers(allUsers);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Get Users");
		}
	};

	const goToProjects = (object) => {
		// setData((s) => ({
		// 	...s,
		// 	activeViewIndex: 2,
		// 	activeView: Constants.primaryModules.projects.name,
		// 	singleProjectObject: object,
		// }));
	};

	const logout = () => {
		MyGlobal.AddActivity("Logged out.");
		MyGlobal.SetUserStatus(0);
		MyGlobal.ClearAllUserData();

		router.replace("/");
	};

	const setModule = (module, sequence) => {
		setMainData((old) => ({ ...old, selectedModule: { name: module.name, sequence: sequence - 1 } }));
	};

	const toggleActivitiesView = () => {
		setHasMounted((s) => ({ ...s, activitiesView: !hasMounted.activitiesView }));
	};

	const toggleEmployeeView = () => {
		setHasMounted((s) => ({ ...s, employeesView: !hasMounted.employeesView }));
	};

	const toggleProfileView = () => {
		setHasMounted((s) => ({ ...s, profileView: !hasMounted.profileView }));
	};

	const toggleSettingsView = () => {
		setHasMounted((s) => ({ ...s, settingsView: !hasMounted.settingsView }));
	};

	const toggleTheme = () => {
		setMainData((old) => ({ ...old, isDarkModeEnabled: !mainData.isDarkModeEnabled }));
	};

	// UI Components
	const uiMain = () => {
		if (hasMounted.activitiesView) {
			return <Activities staff={apiData.allUsers} close={toggleActivitiesView} />;
		} else if (hasMounted.employeesView) {
			return <EmployeeManagement close={toggleEmployeeView} staffData={apiData.allUsers} />;
		} else if (hasMounted.settingsView) {
			return <Settings close={toggleSettingsView} reloadAllSettings={getSettings} settings={apiData.settings} staff={apiData.allUsers} />;
		} else if (hasMounted.profileView) {
			return <ProfileManagement close={toggleProfileView} payload={mainData.loggedInUser} />;
		} else {
			return uiSelectedModule();
		}
	};

	const uiModules = () => {
		return apiData.modules
			.filter((module) => module.sequence <= 8)
			.map((module, index) => {
				const aesthetics =
					index == mainData.selectedModule.sequence
						? "primary-border-colour primary-background-transparent-01 primary-text"
						: "border-transparent gray-text";
				const wrapper = `p-2 border-b-4 whitespace-nowrap font-regular-12 ${aesthetics}`;

				return (
					<button key={index} className={wrapper} onClick={() => setModule(module, module.sequence)}>
						{module.name}
					</button>
				);
			});
	};

	const uiOtherModules = () => {
		const aesthetics =
			mainData.selectedModule.sequence == -1 ? "primary-border-colour primary-background-transparent-01 primary-text" : "border-transparent gray-text";
		const wrapper = `p-2 border-b-4 whitespace-nowrap font-regular-12 ${aesthetics}`;

		return (
			<Menu as="div" className="relative z-50 inline-block text-left">
				<MenuButton className={wrapper}>
					<span>More</span>
				</MenuButton>
				<MenuItems anchor="bottom" className="absolute w-max rounded focus:outline-none bottom-shadow black-white-background full-border black-text">
					{uiOtherModulesList()}
				</MenuItems>
			</Menu>
		);
	};

	const uiOtherModulesList = () => {
		return apiData.modules
			.filter((module) => module.sequence > 8)
			.map((module, index) => {
				const isSelected = module.name == mainData.selectedModule.name;
				const selectedModuleTextStyle = isSelected ? "primary-background-transparent-01 primary-text" : "gray-text";

				return (
					<MenuItem
						as="div"
						className={`p-2 space-x-2.5 cursor-pointer border-y ${selectedModuleTextStyle} hovered-rows`}
						key={index}
						onClick={() => setModule(module, 0)}>
						{isSelected && <FontAwesomeIcon icon={faCheck} />}
						<span>{module.name}</span>
					</MenuItem>
				);
			});
	};

	const uiSelectedModule = () => {
		switch (mainData.selectedModule.name) {
			case baseModules.Dashboard:
				return (
					<ErrorBoundary
						key="ErrorBoundary_Dashboard"
						onError={(error) => MyGlobal.LogErrors(error.message, baseModules.Dashboard)}
						FallbackComponent={ErrorFallbackComponent}>
						<Dashboard />
					</ErrorBoundary>
				);
			// case Constants.primaryModules.clients.name:
			// 	return (
			// 		<ErrorBoundary
			// 			key="ErrorBoundary_Clients"
			// 			onError={(error) => Global.handleErrors(error.message, "Clients")}
			// 			FallbackComponent={ErrorFallbackComponent}>
			// 			<Clients />
			// 		</ErrorBoundary>
			// 	);
			case baseModules.Inquiries:
				return (
					<ErrorBoundary
						key="ErrorBoundary_Inquiries"
						onError={(error) => MyGlobal.LogErrors(error.message, baseModules.Inquiries)}
						FallbackComponent={ErrorFallbackComponent}>
						<Inquiries />
					</ErrorBoundary>
				);
			case baseModules.Projects:
				return (
					<ErrorBoundary
						key="ErrorBoundary_Projects"
						onError={(error) => MyGlobal.LogErrors(error.message, baseModules.Projects)}
						FallbackComponent={ErrorFallbackComponent}>
						<Projects />
					</ErrorBoundary>
				);
			// case Constants.primaryModules.affiliates.name:
			// 	return (
			// 		<ErrorBoundary
			// 			key="ErrorBoundary_Affiliates"
			// 			onError={(error) => Global.handleErrors(error.message, "Affiliates")}
			// 			FallbackComponent={ErrorFallbackComponent}>
			// 			<Affiliates />
			// 		</ErrorBoundary>
			// 	);
			// case Constants.primaryModules.admins.name:
			// 	return (
			// 		<ErrorBoundary
			// 			key="ErrorBoundary_Admins"
			// 			onError={(error) => Global.handleErrors(error.message, "Admins")}
			// 			FallbackComponent={ErrorFallbackComponent}>
			// 			<Admins />
			// 		</ErrorBoundary>
			// 	);
			// case Constants.primaryModules.invoices.name:
			// 	return (
			// 		<ErrorBoundary
			// 			key="ErrorBoundary_Invoices"
			// 			onError={(error) => Global.handleErrors(error.message, "Invoices")}
			// 			FallbackComponent={ErrorFallbackComponent}>
			// 			<Invoices />
			// 		</ErrorBoundary>
			// 	);
			// case Constants.primaryModules.cashFlow.name:
			// 	return (
			// 		<ErrorBoundary
			// 			key="ErrorBoundary_Cash Flow"
			// 			onError={(error) => Global.handleErrors(error.message, "Cash Flow")}
			// 			FallbackComponent={ErrorFallbackComponent}>
			// 			<CashFlow settings={cashFlowSettings} />
			// 		</ErrorBoundary>
			// 	);
		}
	};

	const uiUserMenu = () => {
		return (
			<Menu as="div" className="relative z-50 inline-block text-left">
				<MenuButton className="inline-flex w-full py-2 justify-center items-center focus:outline-none black-text">
					<FontAwesomeIcon className="primary-text" icon={faUserCircle} size="lg" />
				</MenuButton>
				<MenuItems
					anchor="bottom"
					className="absolute w-max mt-2 rounded focus:outline-none bottom-shadow black-white-background full-border black-text">
					<div className="flex flex-col p-2 font-medium-14">
						<span>{mainData.loggedInUser.full_name || ""}</span>
						<span className="font-regular-10 gray-text">{mainData.loggedInUser.designation || ""}</span>
					</div>
					{uiUserMenuList()}
				</MenuItems>
			</Menu>
		);
	};

	const uiUserMenuList = () => {
		return Object.values(MyConstants.UserMenu)
			.filter((item) => {
				if (mainData.loggedInUser.role == MyConstants.UserType.Employees) {
					return ![MyConstants.UserMenu.Activity, MyConstants.UserMenu.Employees, MyConstants.UserMenu.Storage].includes(item);
				} else {
					return item;
				}
			})
			.map((item, index) => {
				return (
					<MenuItem
						as="div"
						className="p-3 space-x-3 cursor-pointer border-y font-regular-12 black-text hovered-rows"
						key={index}
						onClick={() => getUserMenuClickAction(item)}>
						<FontAwesomeIcon className="w-5 primary-text" icon={getUserMenuIcons(item)} />
						<span>{item}</span>
					</MenuItem>
				);
			});
	};

	// Hooks
	useLayoutEffect(() => {
		if (!MyGlobal.Storages.Session.DoesExist(`${applicationName}Token`)) {
			MyGlobal.ShowErrorToast(MyConstants.Messages.UnauthorizedAccess);
			router.replace("/");
		} else {
			doPreRenderingOperations();

			getUserData();
			getUsers();

			getPermissions();
			getSettings();
		}
	}, []);

	useEffect(() => {
		document.body.setAttribute("app-theme", mainData.theme);
	}, [mainData.theme]);

	useEffect(() => {
		if (mainData.loggedInUser) {
			document.title = `${mainData.loggedInUser.full_name || ""} ${String.fromCharCode(183)} ${applicationName}`;
		}
	}, [mainData.loggedInUser]);

	// Main UI
	return (
		<main className="flex flex-col min-w-[1024px] h-screen overflow-y-hidden">
			<div className="flex w-full h-11 px-5 justify-between items-center relative shadow black-white-background">
				<div className="flex w-full justify-start items-center">
					<span className="uppercase dashboard-heading">{applicationName}</span>
				</div>
				<div className="flex w-full justify-center items-center">
					<div className="flex space-x-2 relative text-white">
						{uiModules()} {uiOtherModules()}
					</div>
				</div>
				<div className="flex w-full justify-end items-center">{uiUserMenu()}</div>
			</div>
			<div className="flex w-full h-[calc(100vh-45px)] justify-center items-center">{uiMain()}</div>
		</main>
	);
}
