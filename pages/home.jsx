"use client";

import axios from "axios";
import dynamic from "next/dynamic";
import { AccountMenu, ApiEndpoints, BaseModules, DerivedModules, Messages } from "@/utilities/constants";

import { useRouter } from "next/navigation";
import { ErrorBoundary } from "react-error-boundary";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ErrorFallbackComponent } from "@/components/Elements";
import { applicationName, MyGlobal } from "@/utilities/global";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { faSignOut, faSun, faUserCircle, faUserClock, faUserGroup } from "@fortawesome/free-solid-svg-icons";
import { clearAllUserData } from "@/utilities/myGlobal";
import Projects from "@/modules/projects/Index2";

const DynamicMySpace = dynamic(() => import("./mySpace"), { ssr: false });
const DynamicTodos = dynamic(() => import("@/modules/todo/Index"), { ssr: false });
const DynamicDashboard = dynamic(() => import("./dashboard/index"), { ssr: false });
const DynamicFirms = dynamic(() => import("@/modules/firms/index"), { ssr: false });
const DynamicClients = dynamic(() => import("@/modules/clients/index"), { ssr: false });
const DynamicProjects = dynamic(() => import("@/modules/projects/index"), { ssr: false });
const DynamicInquiries = dynamic(() => import("@/modules/inquiries/index"), { ssr: false });
const DynamicCashFlows = dynamic(() => import("@/modules/cashFlows/index"), { ssr: false });
const DynamicEmployees = dynamic(() => import("@/modules/employees/index"), { ssr: false });
const DynamicActivities = dynamic(() => import("@/modules/activities/index"), { ssr: false });
const DynamicAffiliates = dynamic(() => import("@/modules/cashFlows/affiliates/index"), { ssr: false });

export default function Home() {
	// Business Logic
	const router = useRouter();

	const tabRefs = useRef([]);
	const gliderRef = useRef(null);
	const tabsContainerRef = useRef(null);

	const backgroundColour = useMemo(() => (MyGlobal.GetUserId() === "A3" ? "background-color: lightsteelblue" : ""), []);

	const [api, setApi] = useState({
		allPermissions: [],
		allUsers: [],
		modules: [],
		todos: [],
	});

	const [main, setMain] = useState({
		isDarkModeEnabled: false,
		isTodosLoading: false,
		mode: null,
		selectedModule: {
			index: 0,
			name: BaseModules.Dashboard,
		},
		singleProjectObject: {},
		status: {
			firms: "",
			inquiries: "",
			invoicesOrRv: { find: "", module: "" },
			projectsOrTasks: "",
			todos: "",
		},
		unreadTodos: 0,
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
	async function getPermissions() {
		try {
			const response = await axios.get(ApiEndpoints.Getter, MyGlobal.GetHeaders({ type: "get-permissions" }));

			const modules = [];
			const myPermissions = [];
			const userData = MyGlobal.GetUserData();

			response.data
				.filter((f) => f.type == "Base")
				.filter((f) => {
					if (userData.permissions != -1) {
						const permissions = String(userData.permissions).split(",");
						const id = String(f.id);

						if (permissions.includes(id)) {
							modules.push({ ...f, sequence: getSequence(f.module) });
						}
					} else {
						modules.push({ ...f, sequence: getSequence(f.module) });
					}
				});

			response.data.filter((f) => {
				if (userData.permissions != -1) {
					const permissions = String(userData.permissions).split(",");
					const id = String(f.id);

					if (permissions.includes(id)) {
						myPermissions.push(f);
					}
				} else {
					// modules.push({ ...f, sequence: getSequence(f.module) });
					myPermissions.push(f);
				}
			});

			MyGlobal.SetPermission(myPermissions);

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
			case BaseModules.Todos:
				return 9;
			case BaseModules.CashFlow:
				return 7;
			case BaseModules.Clients:
				return 5;
			case BaseModules.Dashboard:
				return 0;
			case BaseModules.Inquiries:
				return 2;
			case BaseModules.Projects:
				return 3;
			case BaseModules.Firms:
				return 8;
			case BaseModules.MySpace:
				return 1;
			default:
				return -1;
		}
	}

	function getUserData() {
		if (!MyGlobal.Storages.Session.DoesExist(`${applicationName}Token`)) {
			MyGlobal.ShowErrorToast(Messages.UnauthorizedAccess);
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
			case AccountMenu.Activity:
				toggleActivitiesView();
				break;
			case AccountMenu.Employees:
				toggleEmployeeView();
				break;
			case AccountMenu.Logout:
				logout();
				break;
		}
	}

	function getUserMenuIcons(menuItem) {
		switch (menuItem) {
			case AccountMenu.Activity:
				return faUserClock;
			case AccountMenu.Employees:
				return faUserGroup;
			case AccountMenu.Logout:
				return faSignOut;
			default:
				return faSun;
		}
	}

	async function getUsers() {
		try {
			const response = await axios.get(ApiEndpoints.Getter, MyGlobal.GetHeaders({ type: "get-users" }));

			if (response.status == 200) {
				const allUsers = [];

				response.data.administrators.forEach((fe) => allUsers.push(fe));
				response.data.employees.forEach((fe) => {
					if (fe.employment_status === "Active") {
						allUsers.push(fe);
					}
				});

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
			clearAllUserData();

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
			unmountChildViews();
			return;
		}

		setMain((s) => ({ ...s, selectedModule: { index, name: module.name } }));

		unmountChildViews();
	}

	const setModuleProps = useCallback((key, value) => {
		const _key = String(key).toLowerCase();

		if (key === BaseModules.Invoices || key === BaseModules.Rv) {
			setMain((s) => ({ ...s, status: { ...s.status, invoicesOrRv: { find: value, module: value ? key : null } } }));
		} else if (key === "projectsOrTasks") {
			setMain((s) => ({ ...s, status: { ...s.status, projectsOrTasks: value } }));
		} else if (key === "todos") {
			setMain((s) => ({ ...s, status: { ...s.status, todos: value } }));
		} else {
			setMain((s) => ({ ...s, status: { ...s.status, [_key]: value } }));
		}
	}, []);

	function toggleActivitiesView() {
		setMounted((s) => ({ ...s, activities: !s.activities }));
	}

	function toggleEmployeeView() {
		setMounted((s) => ({ ...s, employees: !s.employees }));
	}

	function toggleProfileView() {
		setMounted((s) => ({ ...s, profile: !s.profile }));
	}

	function toggleSettingsView() {
		setMounted((s) => ({ ...s, settings: !s.settings }));
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
			return <DynamicActivities unmount={toggleActivitiesView} />;
		} else if (mounted.employees) {
			return <DynamicEmployees unmount={toggleEmployeeView} />;
		} else {
			return uiSelectedModule();
		}
	}

	function uiModules() {
		const _modules = api.modules
			.filter((f) => f.name != BaseModules.Affiliates && f.name != BaseModules.Invoices)
			.filter((f) => f.sequence >= 0)
			.filter((f) => {
				if (!MyGlobal.IsUserAdministrator()) {
					return f.name != BaseModules.Firms;
				}
				return f;
			})
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

		return _modules;
	}

	function uiSelectedModule() {
		switch (main.selectedModule.name) {
			case BaseModules.Affiliates:
				return (
					<ErrorBoundary key={`ErrorBoundary_${BaseModules.Affiliates}`} onError={(e) => MyGlobal.LogErrors(e.message, BaseModules.Affiliates)} FallbackComponent={ErrorFallbackComponent}>
						<DynamicAffiliates />
					</ErrorBoundary>
				);
			case BaseModules.CashFlow:
				return (
					<ErrorBoundary key={`ErrorBoundary_${BaseModules.CashFlow}`} onError={(e) => MyGlobal.LogErrors(e.message, BaseModules.CashFlow)} FallbackComponent={ErrorFallbackComponent}>
						<DynamicCashFlows presetStatus={main.status.invoicesOrRv} setModuleProps={setModuleProps} />
					</ErrorBoundary>
				);
			case BaseModules.Clients:
				return (
					<ErrorBoundary key={`ErrorBoundary_${BaseModules.Clients}`} onError={(e) => MyGlobal.LogErrors(e.message, BaseModules.Clients)} FallbackComponent={ErrorFallbackComponent}>
						<DynamicClients />
					</ErrorBoundary>
				);
			case BaseModules.Dashboard:
				return (
					<ErrorBoundary key={`ErrorBoundary_${BaseModules.Dashboard}`} onError={(e) => MyGlobal.LogErrors(e.message, BaseModules.Dashboard)} FallbackComponent={ErrorFallbackComponent}>
						<DynamicDashboard setModuleProps={setModuleProps} />
					</ErrorBoundary>
				);
			case BaseModules.MySpace:
				return (
					<ErrorBoundary key={`ErrorBoundary_${BaseModules.MySpace}`} onError={(e) => MyGlobal.LogErrors(e.message, BaseModules.MySpace)} FallbackComponent={ErrorFallbackComponent}>
						<DynamicMySpace setModuleProps={setModuleProps} />
					</ErrorBoundary>
				);
			case BaseModules.Firms:
				return (
					<ErrorBoundary key={`ErrorBoundary_${BaseModules.Firms}`} onError={(e) => MyGlobal.LogErrors(e.message, BaseModules.Firms)} FallbackComponent={ErrorFallbackComponent}>
						<DynamicFirms presetStatus={main.status.firms} setModuleProps={setModuleProps} />
					</ErrorBoundary>
				);
			case BaseModules.Inquiries:
				return (
					<ErrorBoundary key={`ErrorBoundary_${BaseModules.Inquiries}`} onError={(e) => MyGlobal.LogErrors(e.message, BaseModules.Inquiries)} FallbackComponent={ErrorFallbackComponent}>
						<DynamicInquiries presetStatus={main.status.inquiries} setModuleProps={setModuleProps} />
					</ErrorBoundary>
				);
			case BaseModules.Projects:
				return (
					<ErrorBoundary key={`ErrorBoundary_${BaseModules.Projects}`} onError={(e) => MyGlobal.LogErrors(e.message, BaseModules.Projects)} FallbackComponent={ErrorFallbackComponent}>
						{/* {process.env.NODE_ENV === "development" ? <Projects presetStatus={main.status.projectsOrTasks} setModuleProps={setModuleProps} /> : <DynamicProjects presetStatus={main.status.projectsOrTasks} setModuleProps={setModuleProps} />} */}
						<DynamicProjects presetStatus={main.status.projectsOrTasks} setModuleProps={setModuleProps} />
					</ErrorBoundary>
				);
			case BaseModules.Todos:
				return (
					<ErrorBoundary key={`ErrorBoundary_${BaseModules.Todos}`} onError={(e) => MyGlobal.LogErrors(e.message, BaseModules.Todos)} FallbackComponent={ErrorFallbackComponent}>
						<DynamicTodos presetStatus={main.status.todos} setModuleProps={setModuleProps} />
					</ErrorBoundary>
				);
		}
	}

	function uiUserMenu() {
		return (
			<Menu as="div" className="relative z-50 inline-block text-left">
				<MenuButton className="inline-flex w-full py-2 justify-center-safe items-center-safe focus:outline-none black-text">
					<FontAwesomeIcon className="text-white" icon={faUserCircle} size="lg" />
				</MenuButton>
				<MenuItems anchor="left start" className="absolute w-max mt-10 rounded focus:outline-none bottom-shadow contrast-background full-border black-text">
					<div className="flex flex-col p-3 font-semibold-16">
						<span>{main.user.fullName}</span>
						<span className="font-regular-10 gray-text">{main.user.designation}</span>
					</div>
					{uiUserMenuList()}
				</MenuItems>
			</Menu>
		);
	}

	function uiUserMenuList() {
		return Object.values(AccountMenu)
			.filter((menuItem) => {
				const isAdmin = MyGlobal.IsUserAdministrator();

				const hasEmployeePermission = MyGlobal.HasPermission(DerivedModules.EditEmployee) || MyGlobal.HasPermission(DerivedModules.NewEmployee);

				// Special handling for restricted items
				if (menuItem === AccountMenu.Activity) {
					return isAdmin; // only admin sees them
				}

				if (menuItem === AccountMenu.Employees) {
					return hasEmployeePermission || isAdmin;
				}

				// All other items are allowed
				return true;
			})
			.map((m, i) => {
				return (
					<MenuItem as="div" className="p-3 space-x-3 cursor-pointer border-y border-gray-300 font-medium-12 black-text hovered-rows" key={i} onClick={() => getUserMenuClickAction(m)}>
						<FontAwesomeIcon className="w-5 primary-text" icon={getUserMenuIcons(m)} />
						<span>{m}</span>
					</MenuItem>
				);
			});
	}

	// Hooks
	useEffect(() => {
		document.body.setAttribute("app-theme", "light");

		if (!MyGlobal.Storages.Session.DoesExist(`${applicationName}Token`)) {
			MyGlobal.ShowErrorToast(Messages.UnauthorizedAccess);
			router.replace("/");
			return;
		}

		getUserData();
		getUsers();
		getPermissions();

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
			setModule(2, { name: BaseModules.Inquiries });
		} else if (main.status.invoicesOrRv.find && main.status.invoicesOrRv.module) {
			setModule(5, { name: BaseModules.CashFlow });
		} else if (main.status.projectsOrTasks) {
			setModule(3, { name: BaseModules.Projects });
		} else if (main.status.todos) {
			setModule(7, { name: BaseModules.Todos });
		}
	}, [main.status]);

	// Main UI
	return (
		<main className="flex flex-col min-w-5xl h-screen overflow-y-hidden">
			<div className="flex w-full h-13 px-5 justify-between items-center-safe relative shadow blue-background">
				<div className="flex w-full items-center-safe">
					<span className="cursor-pointer uppercase dashboard-heading" onClick={() => setModule(0, { name: BaseModules.Dashboard })}>
						{applicationName}
					</span>
				</div>
				<div className="flex w-full justify-center-safe items-center-safe">
					<div className="flex justify-center-safe items-center-safe relative">
						<div className="tabs relative" ref={tabsContainerRef}>
							{uiModules()}
							<span className="glider absolute" ref={gliderRef} />
						</div>
					</div>
				</div>
				<div className="flex w-full justify-end-safe items-center-safe">{uiUserMenu()}</div>
			</div>
			<div className="flex w-full h-[calc(100vh-45px)] justify-center-safe items-center-safe overflow-y-auto" style={{ backgroundColour }}>
				{uiMain()}
			</div>
		</main>
	);
}
