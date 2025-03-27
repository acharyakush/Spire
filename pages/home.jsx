"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import MySpace from "./mySpace";
import Dashboard from "./dashboard";
import Firms from "@/modules/firms";
import Clients from "@/modules/clients";
import Projects from "@/modules/projects";
import Inquiries from "@/modules/inquiries";
import CashFlows from "@/modules/cashFlows";
import Employees from "@/modules/employees";
import Activities from "@/modules/activities";
import MyConstants from "@/utilities/constants";
import Affiliates from "@/modules/cashFlows/affiliates";

import { useRouter } from "next/navigation";
import { ErrorBoundary } from "react-error-boundary";
import { applicationName, MyGlobal } from "@/utilities/global";
import { ErrorFallbackComponent } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { faCheck, faCog, faDatabase, faSignOut, faSun, faUserCircle, faUserClock, faUserCog, faUserGroup } from "@fortawesome/free-solid-svg-icons";

export default function Home() {
	// Business Logic
	const router = useRouter();

	const tabRefs = useRef([]);
	const gliderRef = useRef(null);
	const tabsContainerRef = useRef(null);

	const baseModules = MyConstants.Modules.Base;

	const [api, setApi] = useState({
		allPermissions: [],
		allUsers: [],
		modules: [],
	});

	const [main, setMain] = useState({
		isDarkModeEnabled: false,
		mode: null,
		selectedModule: {
			index: 0,
			name: baseModules.Dashboard,
		},
		singleProjectObject: {},
		status: {
			firms: "",
			inquiries: "",
			invoicesOrRv: { find: "", module: "" },
			projectsOrTasks: "",
		},
		user: {
			fullName: "",
			designation: "",
			role: "",
		},
	});

	const [mounted, setMounted] = useState({
		activities: false,
		employees: false,
		profile: false,
		settings: false,
	});

	// Functions
	function changeMode() {
		const mode = main.mode == "light" ? "dark" : "light";
		MyGlobal.Storages.Local.Set("AppMode", mode);

		setMain((s) => ({ ...s, isDarkModeEnabled: !main.isDarkModeEnabled, mode }));
	}

	function doPreRenderingOperations() {
		document.body.setAttribute("app-theme", "light");

		const initialTheme = MyGlobal.GetTheme() ?? "light";
		const isDarkModeEnabled = MyGlobal.GetTheme() !== "light";

		const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");

		colorScheme.addEventListener("change", (e) => setMain((s) => ({ ...s, isDarkModeEnabled: e.matches, mode: e.matches ? "dark" : "light" })));

		setMain((s) => ({ ...s, isDarkModeEnabled, mode: initialTheme }));
	}

	async function getPermissions() {
		try {
			const response = await axios.get(MyConstants.ApiEndpoints.Getter, MyGlobal.GetHeaders({ type: "get-permissions" }));

			MyGlobal.SetPermission(response.data);

			const modules = [];
			const userData = MyGlobal.GetUserData();

			response.data
				.filter((f) => f.type == "Base")
				.filter((f) => {
					if (userData.permissions != -1) {
						const permissions = String(userData.permissions).split(",");

						if (permissions.includes(f.id)) {
							modules.push({ ...f, sequence: getSequence(f.module) });
						}
					} else {
						modules.push({ ...f, sequence: getSequence(f.module) });
					}
				});

			modules.sort((a, b) => a.sequence - b.sequence);

			setApi((s) => ({ ...s, allPermissions: response.data, modules }));

			const firstModule = modules.find((f) => f.sequence === 0);
			const selectedModule = { index: 0, name: "" };

			if (typeof firstModule === "object") {
				selectedModule.index = firstModule.sequence;
				selectedModule.name = firstModule.name;
			}

			setMain((s) => ({ ...s, selectedModule }));
		} catch (error) {
			MyGlobal.HandleErrors(error, "Get All Permissions");
		}
	}

	function getSequence(module) {
		switch (module) {
			case baseModules.CashFlow:
				return 7;
			case baseModules.Clients:
				return 5;
			case baseModules.Dashboard:
				return 0;
			case baseModules.Inquiries:
				return 2;
			case baseModules.Projects:
				return 3;
			case baseModules.Firms:
				return 8;
			case baseModules.MySpace:
				return 1;
			default:
				return -1;
		}
	}

	function getUserData() {
		if (!MyGlobal.Storages.Session.DoesExist(`${applicationName}Token`)) {
			MyGlobal.ShowErrorToast(MyConstants.Messages.UnauthorizedAccess);
			router.replace("/");
		} else {
			const userData = MyGlobal.GetUserData();

			setMain((s) => ({
				...s,
				user: {
					designation: userData.designation,
					fullName: userData.full_name,
					role: userData.role,
				},
			}));
		}
	}

	function getUserMenuClickAction(menuItem) {
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
	}

	function getUserMenuIcons(menuItem) {
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
			default:
				return faSun;
		}
	}

	async function getUsers() {
		try {
			const response = await axios.get(MyConstants.ApiEndpoints.Getter, MyGlobal.GetHeaders({ type: "get-users" }));

			if (response.status == 200) {
				const allUsers = [];

				response.data.administrators.forEach((fe) => allUsers.push(fe));
				response.data.employees.forEach((fe) => allUsers.push(fe));

				setApi((s) => ({ ...s, allUsers }));
				MyGlobal.SetAllUsers(allUsers);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Get Users");
		}
	}

	function logout() {
		try {
			MyGlobal.AddActivity("Logged out.");
			MyGlobal.ClearAllUserData();

			setTimeout(() => {
				router.replace("/");
			}, 0);
		} catch (error) {
			MyGlobal.HandleErrors(error, "Logout");
			console.error("Logout failed: ", error);
			window.location.href = "/";
		}
	}

	function setModule(index, module) {
		if (index === main.selectedModule.index && module.name === main.selectedModule.name) {
			setMain((s) => ({ ...s, selectedModule: { index: "", name: "" } }));

			setTimeout(() => {
				setMain((s) => ({ ...s, selectedModule: { index, name: module.name } }));
			}, 0);
		} else {
			setMain((s) => ({ ...s, selectedModule: { index, name: module.name } }));
		}

		unmountChildViews();
	}

	function setModuleProps(key, value) {
		const _key = String(key).toLowerCase();

		if (key === baseModules.Invoices || key === baseModules.Rv) {
			setMain((s) => ({ ...s, status: { ...s.status, invoicesOrRv: { find: value, module: value ? key : null } } }));
		} else if (key === "projectsOrTasks") {
			setMain((s) => ({ ...s, status: { ...s.status, projectsOrTasks: value } }));
		} else {
			setMain((s) => ({ ...s, status: { ...s.status, [_key]: value } }));
		}
	}

	function toggleActivitiesView() {
		setMounted((s) => ({ ...s, activities: !mounted.activities }));
	}

	function toggleEmployeeView() {
		setMounted((s) => ({ ...s, employees: !mounted.employees }));
	}

	function toggleProfileView() {
		setMounted((s) => ({ ...s, profile: !mounted.profile }));
	}

	function toggleSettingsView() {
		setMounted((s) => ({ ...s, settings: !mounted.settings }));
	}

	function updateGliderPosition() {
		if (!gliderRef.current || !tabRefs.current[main.selectedModule.index] || !tabsContainerRef.current) return;

		const tab = tabRefs.current[main.selectedModule.index];
		const container = tabsContainerRef.current;

		const tabRect = tab.getBoundingClientRect();
		const containerRect = container.getBoundingClientRect();

		const tabOffset = tabRect.left - containerRect.left + container.scrollLeft;
		const tabWidth = tabRect.width;

		window.requestAnimationFrame(() => {
			gliderRef.current.style.width = `${tabWidth}px`;
			gliderRef.current.style.transform = `translateX(${tabOffset - 12}px)`;
			gliderRef.current.style.transition = "transform 0.25s ease-out, width 0.25s ease-out";
			gliderRef.current.style.opacity = "1";
			gliderRef.current.style.display = "block";
		});
	}

	function unmountChildViews() {
		setMounted((s) => ({
			...s,
			activities: false,
			employees: false,
			profile: false,
			settings: false,
		}));
	}

	// UI Components
	function uiMain() {
		if (mounted.activities) {
			return <Activities unmount={toggleActivitiesView} />;
		} else if (mounted.employees) {
			return <Employees unmount={toggleEmployeeView} />;
		} else {
			return uiSelectedModule();
		}
	}

	function uiModules() {
		return api.modules
			.filter((f) => f.name != baseModules.Affiliates && f.name != baseModules.Invoices)
			.filter((f) => f.sequence >= 0)
			.map((m, i) => {
				const isSelected = i == main.selectedModule.index;

				return (
					<span className="flex justify-center items-center relative font-regular-11" key={i} onClick={() => setModule(i, m)}>
						<input type="radio" id={`radio${i}`} name="tabs" checked={isSelected} readOnly />
						<label className="whitespace-nowrap tab" htmlFor={`radio${i}`} ref={(r) => (tabRefs.current[i] = r)}>
							{m.name}
						</label>
					</span>
				);
			});
	}

	function uiOtherModules() {
		const aesthetics = main.selectedModule.index == -1 ? "primary-border-colour primary-background-transparent-01 primary-text" : "border-transparent gray-text";
		const wrapper = `py-2 font-regular-11 ${aesthetics}`;

		return (
			<Menu as="div" className="relative z-50 -top-0 inline-block text-left">
				<MenuButton className={wrapper}>
					<span>More</span>
				</MenuButton>
				<MenuItems anchor="bottom" className="absolute w-max rounded focus:outline-none bottom-shadow contrast-background full-border black-text">
					{uiOtherModulesList()}
				</MenuItems>
			</Menu>
		);
	}

	function uiOtherModulesList() {
		return api.modules
			.filter((f) => f.sequence <= 0)
			.map((m, i) => {
				const isSelected = m.name == main.selectedModule.name;
				const aesthetics = isSelected ? "primary-background-transparent-01 primary-text" : "gray-text";

				return (
					<MenuItem as="div" className={`p-2 space-x-2.5 cursor-pointer border-y ${aesthetics} font-regular-11 hovered-rows`} key={i} onClick={() => setModule(i, m)}>
						{isSelected && <FontAwesomeIcon icon={faCheck} />}
						<span>{m.name}</span>
					</MenuItem>
				);
			});
	}

	function uiSelectedModule() {
		switch (main.selectedModule.name) {
			case baseModules.Affiliates:
				return (
					<ErrorBoundary key={`ErrorBoundary_${baseModules.Affiliates}`} onError={(e) => MyGlobal.LogErrors(e.message, baseModules.Affiliates)} FallbackComponent={ErrorFallbackComponent}>
						<Affiliates />
					</ErrorBoundary>
				);
			case baseModules.CashFlow:
				return (
					<ErrorBoundary key={`ErrorBoundary_${baseModules.CashFlow}`} onError={(e) => MyGlobal.LogErrors(e.message, baseModules.CashFlow)} FallbackComponent={ErrorFallbackComponent}>
						<CashFlows presetStatus={main.status.invoicesOrRv} setModuleProps={setModuleProps} />
					</ErrorBoundary>
				);
			case baseModules.Clients:
				return (
					<ErrorBoundary key={`ErrorBoundary_${baseModules.Clients}`} onError={(e) => MyGlobal.LogErrors(e.message, baseModules.Clients)} FallbackComponent={ErrorFallbackComponent}>
						<Clients />
					</ErrorBoundary>
				);
			case baseModules.Dashboard:
				return (
					<ErrorBoundary key={`ErrorBoundary_${baseModules.Dashboard}`} onError={(e) => MyGlobal.LogErrors(e.message, baseModules.Dashboard)} FallbackComponent={ErrorFallbackComponent}>
						<Dashboard setModuleProps={setModuleProps} />
					</ErrorBoundary>
				);
			case baseModules.MySpace:
				return (
					<ErrorBoundary key={`ErrorBoundary_${baseModules.MySpace}`} onError={(e) => MyGlobal.LogErrors(e.message, baseModules.MySpace)} FallbackComponent={ErrorFallbackComponent}>
						<MySpace setModuleProps={setModuleProps} />
					</ErrorBoundary>
				);
			case baseModules.Firms:
				return (
					<ErrorBoundary key={`ErrorBoundary_${baseModules.Firms}`} onError={(e) => MyGlobal.LogErrors(e.message, baseModules.Firms)} FallbackComponent={ErrorFallbackComponent}>
						<Firms presetStatus={main.status.firms} setModuleProps={setModuleProps} />
					</ErrorBoundary>
				);
			case baseModules.Inquiries:
				return (
					<ErrorBoundary key={`ErrorBoundary_${baseModules.Inquiries}`} onError={(e) => MyGlobal.LogErrors(e.message, baseModules.Inquiries)} FallbackComponent={ErrorFallbackComponent}>
						<Inquiries presetStatus={main.status.inquiries} setModuleProps={setModuleProps} />
					</ErrorBoundary>
				);
			case baseModules.Projects:
				return (
					<ErrorBoundary key={`ErrorBoundary_${baseModules.Projects}`} onError={(e) => MyGlobal.LogErrors(e.message, baseModules.Projects)} FallbackComponent={ErrorFallbackComponent}>
						<Projects presetStatus={main.status.projectsOrTasks} setModuleProps={setModuleProps} />
					</ErrorBoundary>
				);
		}
	}

	function uiUserMenu() {
		return (
			<Menu as="div" className="relative z-50 inline-block text-left">
				<MenuButton className="inline-flex w-full py-2 justify-center items-center focus:outline-none black-text">
					<FontAwesomeIcon className="primary-text" icon={faUserCircle} size="lg" />
				</MenuButton>
				<MenuItems anchor="left start" className="absolute w-max mt-2 left-5 rounded focus:outline-none bottom-shadow contrast-background full-border black-text">
					<div className="flex flex-col p-3 font-semibold-16">
						<span>{main.user.fullName}</span>
						<span className="font-regular-10 gray-text">{main.user.designation}</span>
					</div>
					{/* <MenuItem
						as="div"
						className="px-3 py-2 space-x-3 cursor-pointer border-y font-regular-10 black-text hovered-rows"
						onClick={() => changeMode()}>
						<FontAwesomeIcon className="w-5 primary-text" icon={getUserMenuIcons()} />
						<span>Mode</span>
					</MenuItem> */}
					{uiUserMenuList()}
				</MenuItems>
			</Menu>
		);
	}

	function uiUserMenuList() {
		return Object.values(MyConstants.UserMenu)
			.filter((f) => {
				if (main.user.role == MyConstants.UserType.Employees) {
					return ![MyConstants.UserMenu.Activity, MyConstants.UserMenu.Employees, MyConstants.UserMenu.Storage].includes(f);
				} else {
					return f;
				}
			})
			.map((m, i) => {
				return (
					<MenuItem as="div" className="p-3 space-x-3 cursor-pointer border-y font-medium-12 black-text hovered-rows" key={i} onClick={() => getUserMenuClickAction(m)}>
						<FontAwesomeIcon className="w-5 primary-text" icon={getUserMenuIcons(m)} />
						<span>{m}</span>
					</MenuItem>
				);
			});
	}

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
		}
	}, []);

	useEffect(() => {
		const interval = setInterval(() => {
			if (tabRefs.current[main.selectedModule.index]) {
				updateGliderPosition();
				clearInterval(interval);
			}
		}, 10);

		window.addEventListener("resize", updateGliderPosition);

		return () => {
			window.removeEventListener("resize", updateGliderPosition);
			clearInterval(interval);
		};
	}, []);

	useEffect(() => {
		updateGliderPosition();
		window.addEventListener("resize", updateGliderPosition);

		return () => window.removeEventListener("resize", updateGliderPosition);
	}, [main.selectedModule.index]);

	useEffect(() => {
		if (main.user) {
			document.title = `${main.user.fullName || ""} ${String.fromCharCode(183)} ${applicationName}`;
		}
	}, [main.user]);

	useEffect(() => {
		if (main.status.inquiries) {
			setModule(2, { name: baseModules.Inquiries });
		} else if (main.status.invoicesOrRv.find && main.status.invoicesOrRv.module) {
			setModule(5, { name: baseModules.CashFlow });
		} else if (main.status.projectsOrTasks) {
			setModule(3, { name: baseModules.Projects });
		}
	}, [main.status]);

	useEffect(() => {
		document.body.setAttribute("app-theme", main.mode);
	}, [main.mode]);

	// Main UI
	return (
		<main className="flex flex-col min-w-[1024px] h-screen overflow-y-hidden">
			<div className="flex w-full h-11 px-5 justify-between items-center relative shadow contrast-background">
				<div className="flex w-full justify-start items-center">
					<span className="cursor-pointer uppercase dashboard-heading" onClick={() => setModule(0, { name: baseModules.Dashboard })}>
						{applicationName}
					</span>
				</div>
				<div className="flex w-full justify-center items-center">
					<div className="flex justify-center items-center relative">
						<div className="tabs relative" ref={tabsContainerRef}>
							{uiModules()}
							<span className="glider absolute" ref={gliderRef} />
						</div>
						{/* {uiOtherModules()} */}
					</div>
				</div>
				<div className="flex w-full justify-end items-center">{uiUserMenu()}</div>
			</div>
			<div className="flex w-full h-[calc(100vh-45px)] justify-center items-center overflow-y-auto">{uiMain()}</div>
		</main>
	);
}
