"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import dayjs from "dayjs";
import axios from "axios";
import Tippy from "@tippyjs/react";
import dynamic from "next/dynamic";
import { ApiEndpoints, BaseModules, DerivedModules, Statuses } from "@/utilities/constants";

import { Virtuoso } from "react-virtuoso";
import { MyGlobal } from "@/utilities/global";
import { useEffect, useMemo, useState } from "react";
import { TextInputNative } from "@/components/Inputs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { AvatarCircle, Badge, BadgeSmall, Spinner, Tooltip } from "@/components/Elements";
import { faCheck, faCheckCircle, faChevronDown, faFileExcel, faFilterCircleXmark, faIndianRupee, faListUl, faPencil, faSearch, faSortAmountAsc, faSortAmountDesc, faTrash } from "@fortawesome/free-solid-svg-icons";
import { ProjectsHeaders } from "@/utilities/headers";

const DynamicMyProjects = dynamic(() => import("./MyProjects"), { ssr: false });
const DynamicEditProject = dynamic(() => import("./EditProject"), { ssr: false });
const DynamicTodo = dynamic(() => import("@/modals/projects/Todo"), { ssr: false });
const DynamicSingleProject = dynamic(() => import("../singleProject"), { ssr: false });

const DynamicEditStatus = dynamic(() => import("@/modals/projects/miscellaneous").then((t) => t.EditStatus), { ssr: false });
const DynamicDeleteProject = dynamic(() => import("@/modals/projects/miscellaneous").then((t) => t.DeleteProject), { ssr: false });
const DynamicProjectStatus = dynamic(() => import("@/modals/projects/miscellaneous").then((t) => t.ProjectStatus), { ssr: false });

export default function Projects2({ presetStatus, setModuleProps }) {
	// Business Logic
	const [activeModule, setActiveModule] = useState({
		list: [],
		name: "All",
	});

	const [main, setMain] = useState({
		contextMenu: {
			deleteProject: 0,
			editProject: 0,
		},
		filter: presetStatus || "",
		search: "",
		isSupportDataLoading: false,
		revisedStatuses: {},
		selectedClient: {},
		selectedProject: {},
		sort: { column: "ID", isAscending: false },
	});

	const [mounted, setMounted] = useState({
		deleteProject: false,
		editProject: false,
		editStatus: false,
		myProjects: presetStatus === "my-projects" || String(presetStatus).includes("MySpace"),
		projectStatus: false,
		singleProject: false,
		todo: false,
	});

	const [projects, setProjects] = useState({ api: [], copy: [] });

	const today = useMemo(() => dayjs(), []);
	const statuses = useMemo(() => Statuses.Projects, []);
	const thisView = useMemo(() => BaseModules.Projects, []);
	const isUserAdministrator = useMemo(() => MyGlobal.IsUserAdministrator(), []);

	const { Active: stActive, Cancelled: stCancelled, Closed: stClosed, Completed: stCompleted, Hold: stHold, Overdue: stOverdue, Today: stToday, Tomorrow: stTomorrow, Upcoming: stUpcoming } = statuses;

	const apiSize = useMemo(() => projects.api.length, [projects.api]);
	const apiCopySize = useMemo(() => projects.copy.length, [projects.copy]);

	const allowDeletingProject = useMemo(() => MyGlobal.HasPermission(DerivedModules.DeleteProject), []);
	const allowEditingProject = useMemo(() => MyGlobal.HasPermission(DerivedModules.EditProject), []);

	const clearSearchStyle = useMemo(() => (main.search ? "cursor-pointer primary-text" : "hidden"), [main.search]);
	const blankDataWrapper = "flex w-full h-full justify-center items-center contrast-background full-border";

	// Functions
	function autoFocusSearchBox(e) {
		if (e.ctrlKey && e.key === "f") {
			e.preventDefault();
			document.getElementById("searchBox").focus();
		}
	}

	function clearFilters() {
		const source = activeModule.name === "All" ? projects.copy : activeModule.list;
		setMain((s) => ({ ...s, filter: "", revisedStatuses: getRevisedStatuses(source) }));
	}

	function closeMyProjects() {
		setMounted((s) => ({ ...s, myProjects: false }));
	}

	function doFiltering() {
		const filtered = getSelectedProjectData().filter((f) => {
			const { client_id, client_name, company_name, government_id, id, main_project_name, sub_project_name, team_names, team_names_initials, status } = f;

			if (main.filter) return String(status) === main.filter;

			const search = main.search.toLowerCase();

			const projectId = String(id).toLowerCase();
			const governmentId = String(government_id).toLowerCase();

			const clientId = String(client_id).toLowerCase();
			const clientName = String(client_name).toLowerCase();

			const companyName = String(company_name).toLowerCase();

			const mainProjectName = String(main_project_name).toLowerCase();
			const subProjectName = String(sub_project_name).toLowerCase();

			const teamNames = String(team_names).toLowerCase();
			const teamNamesInitials = String(team_names_initials).toLowerCase();

			const _status = String(status).toLowerCase();

			return projectId.includes(search) || governmentId.includes(search) || clientId.includes(search) || clientName.includes(search) || companyName.includes(search) || mainProjectName.includes(search) || subProjectName.includes(search) || teamNames.includes(search) || teamNamesInitials.includes(search) || _status.includes(search);
		});

		setProjects((s) => ({ ...s, api: filtered }));
	}

	function doSorting() {
		return getSelectedProjectData().sort((a, b) => {
			const aStartedOn = new Date(a.started_on);
			const bStartedOn = new Date(b.started_on);

			const { column, isAscending } = main.sort;

			switch (true) {
				case column === ProjectsHeaders.Started && isAscending:
					return aStartedOn - bStartedOn;
				case column === ProjectsHeaders.Started && !isAscending:
					return bStartedOn - aStartedOn;
				case column === ProjectsHeaders.GovermentId && isAscending:
					if (a.government_id) return String(a.government_id).localeCompare(b.government_id);
				case column === ProjectsHeaders.GovermentId && !isAscending:
					if (b.government_id) return String(b.government_id).localeCompare(a.government_id);
				case column === ProjectsHeaders.Client && isAscending:
					return String(a.client_name).localeCompare(b.client_name);
				case column === ProjectsHeaders.Client && !isAscending:
					return String(b.client_name).localeCompare(a.client_name);
				case column === ProjectsHeaders.Company && isAscending:
					return String(a.company_name).localeCompare(b.company_name);
				case column === ProjectsHeaders.Company && !isAscending:
					return String(b.company_name).localeCompare(a.company_name);
				case column === ProjectsHeaders.MainProject && isAscending:
					return String(a.main_project_name).localeCompare(b.main_project_name);
				case column === ProjectsHeaders.MainProject && !isAscending:
					return String(b.main_project_name).localeCompare(a.main_project_name);
				case column === ProjectsHeaders.SubProject && isAscending:
					return String(a.sub_project_name).localeCompare(b.sub_project_name);
				case column === ProjectsHeaders.SubProject && !isAscending:
					return String(b.sub_project_name).localeCompare(a.sub_project_name);
				case column === ProjectsHeaders.Status && isAscending:
					return String(a.status).localeCompare(b.status);
				case column === ProjectsHeaders.Status && !isAscending:
					return String(b.status).localeCompare(a.status);
			}
		});
	}

	function editStatus(project, status) {
		const copy = Object.assign({}, project);

		copy["new_status"] = status;

		if (status !== stCompleted) {
			toggleEditStatusBox(copy);
		} else {
			toggleProjectStatusBox(copy);
		}
	}

	function getAggregatedProjects() {
		const groupedByMainProject = projects.copy.reduce((pv, cv) => {
			if (!pv[cv.main_project_name]) {
				pv[cv.main_project_name] = [];
			}

			if (!pv[cv.All]) {
				pv["All"] = [{ name: "All" }];
			}

			pv[cv.main_project_name].push(cv);
			return pv;
		}, {});

		return Object.keys(groupedByMainProject)
			.map((m) => ({ key: m, items: groupedByMainProject[m] }))
			.sort((a, b) => {
				if (a.key === "All") return -1;
				if (b.key === "All") return 1;

				return String(a.key).localeCompare(b.key);
			});
	}

	function getClientNameColourByStatus(status) {
		switch (status) {
			case stActive:
				return "orange-text";
			case stClosed:
			case stCancelled:
				return "gray-text";
			case stHold:
				return "red-text";
			case stCompleted:
				return "green-text";
			default:
				return "orange-background";
		}
	}

	function getEmptyDataMessage(message) {
		return (
			<div className={blankDataWrapper}>
				<span className="font-regular-12 gray-text">{message}</span>
			</div>
		);
	}

	function getFancyBorderBackgroundByStatus(status) {
		switch (status) {
			case stActive:
				return "orange-background";
			case stClosed:
			case stCancelled:
				return "gray-background";
			case stHold:
				return "red-background";
			case stCompleted:
				return "green-background";
			default:
				return "orange-background";
		}
	}

	function getIconOrBadge() {
		if (!main.isSupportDataLoading) return apiSize > 0 && <Badge value={getRowsCount()} />;

		return (
			<span className="pl-5 relative">
				<Spinner />
			</span>
		);
	}

	function getRevisedStatuses(source) {
		if (!Array.isArray(source)) return [];
		if (!source.length) return [];

		const object = { [stActive]: 0, [stCancelled]: 0, [stClosed]: 0, [stCompleted]: 0, [stHold]: 0, [stOverdue]: 0, [stToday]: 0, [stTomorrow]: 0, [stUpcoming]: 0 };

		source.forEach((fe) => {
			if (fe.status === stActive) object.Active++;
			if (fe.status === stCancelled) object.Cancelled++;
			if (fe.status === stClosed) object.Closed++;
			if (fe.status === stCompleted) object.Completed++;
			if (fe.status === stHold) object.Hold++;
			if (fe.has_tasks_overdue) object.Overdue++;
			if (fe.has_tasks_due_today) object.Today++;
			if (fe.has_tasks_due_tomorrow) object.Tomorrow++;
			if (fe.has_tasks_upcoming) object.Upcoming++;
		});

		return object;
	}

	function getRowsCount() {
		const apiCount = projects.api.filter((f) => {
			const { search } = main;

			if (search.length) {
				if (Object.values(statuses).includes(search)) return String(f.status).includes(search);

				if (search === "Overdue") {
					return f.has_tasks_overdue;
				} else if (search === "Today") {
					return f.has_tasks_due_today;
				} else if (search === "Tomorrow") {
					return f.has_tasks_due_tomorrow;
				} else if (search === "Upcoming") {
					return f.has_tasks_upcoming;
				}
			}

			return f;
		}).length;

		if (apiCount !== apiCopySize) return apiCount + " / " + apiCopySize;

		return apiCount;
	}

	function getSelectedProjectData() {
		let data = [];

		if (apiCopySize > 0) {
			const list = activeModule.name === "All" ? (main.search.length ? projects.api : projects.copy) : getAggregatedProjects().find((f) => f.key == activeModule.name).items;

			const { filter, search } = main;

			data = list.filter((f) => {
				if (search.length) {
					if (Object.values(statuses).includes(search)) return String(f.status).includes(search);

					if (search === "Overdue") {
						return f.has_tasks_overdue;
					} else if (search === "Today") {
						return f.has_tasks_due_today;
					} else if (search === "Tomorrow") {
						return f.has_tasks_due_tomorrow;
					} else if (search === "Upcoming") {
						return f.has_tasks_upcoming;
					}
				} else if (filter.length) {
					return f.status === filter;
				}

				return f;
			});
		}

		return data;
	}

	function getStatusTags(status) {
		switch (status) {
			case stActive:
				return "orange-tag-transparent-01";
			case stClosed:
			case stCancelled:
				return "gray-tag-transparent-01";
			case stHold:
				return "red-tag-transparent-02";
			case stCompleted:
				return "green-tag-transparent-01 cursor-pointer";
			default:
				return "orange-tag-transparent-01";
		}
	}

	async function getSupportData(projectId) {
		try {
			setMain((s) => ({ ...s, isSupportDataLoading: true }));

			const response = await axios.get(ApiEndpoints.Projects.GetProjects, MyGlobal.GetHeaders());

			if (response.status === 200) {
				let revised = [];

				response.data.projects.forEach((fe) => {
					const clientName = MyGlobal.GetNameFromId(fe.client_id, response.data.clients);
					const companyName = MyGlobal.GetNameFromId(fe.company_id, response.data.companies);
					const mainProjectName = MyGlobal.GetNameFromId(fe.main_project_id, response.data.mainProjects);
					const subProjectName = MyGlobal.GetNameFromId(fe.sub_project_id, response.data.subProjects);
					const teamNames = MyGlobal.GetAnyDataFromId(fe.teams, "full_name");

					let hasTasksOverdue = false;
					let hasTasksDueTomorrow = false;
					let hasTasksDueToday = false;
					let hasTasksUpcoming = false;
					let reimburseVoucher = 0;

					response.data.tasks.forEach((_fe) => {
						if (_fe.project_id === fe.id) {
							reimburseVoucher += Number(_fe.expense);

							const tasksDueDate = dayjs(_fe.due_on);

							if (tasksDueDate.isBefore(today, "date")) {
								hasTasksOverdue = true;
							}

							if (tasksDueDate.isSame(today, "date")) {
								hasTasksDueToday = true;
							}

							if (tasksDueDate.isSame(today.add(1, "day"), "date")) {
								hasTasksDueTomorrow = true;
							}

							if (tasksDueDate.isAfter(today.add(1, "day"), "date")) {
								hasTasksUpcoming = true;
							}
						}
					});

					revised.push({
						...fe,
						client_name: clientName,
						company_name: companyName,
						has_tasks_overdue: hasTasksOverdue,
						has_tasks_due_today: hasTasksDueToday,
						has_tasks_due_tomorrow: hasTasksDueTomorrow,
						has_tasks_upcoming: hasTasksUpcoming,
						main_project_name: mainProjectName,
						reimburse_voucher: reimburseVoucher,
						sub_project_name: subProjectName,
						team_names: teamNames,
						team_names_initials: MyGlobal.GetInitials(teamNames),
						teams_data: MyGlobal.GetFullDetailsFromIds(fe.teams),
					});
				});

				setProjects({ api: revised, copy: revised });

				if (projectId) {
					const updateSelectedProject = revised.find((f) => f.id == projectId);
					setMain((s) => ({ ...s, selectedProject: updateSelectedProject }));
				}

				setMain((s) => ({ ...s, revisedStatuses: getRevisedStatuses(revised) }));
				setMounted((s) => ({ ...s, mainComponent: true }));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, thisView + " > Get Support Data");
		} finally {
			setMain((s) => ({ ...s, isSupportDataLoading: false }));
		}
	}

	function getTotalQuote() {
		let total = 0;
		let fullTotal = 0;

		for (const i of doSorting()) {
			total += Number(i.quote);
		}

		for (const i of projects.copy) {
			fullTotal += Number(i.quote);
		}

		if (main.filter || main.search) {
			return MyGlobal.ThousandSeparator(total) + " / " + MyGlobal.ThousandSeparator(fullTotal);
		}

		return MyGlobal.ThousandSeparator(fullTotal);
	}

	function setFilter(value) {
		setMain((s) => ({ ...s, filter: value }));
	}

	function setInputs(key, value) {
		setMain((s) => ({ ...s, [key]: value }));
	}

	function setModule(module) {
		const source = module.key === "All" ? projects.copy : module?.items;

		setActiveModule({ list: module?.items, name: module?.key });
		setMain((s) => ({ ...s, filter: "", revisedStatuses: getRevisedStatuses(source) }));
	}

	function setMouseEnter(projectId) {
		if (allowDeletingProject) {
			setMain((s) => ({ ...s, contextMenu: { ...s.contextMenu, deleteProject: projectId } }));
		}

		if (allowEditingProject) {
			setMain((s) => ({ ...s, contextMenu: { ...s.contextMenu, editProject: projectId } }));
		}
	}

	function setMouseLeave() {
		setMain((s) => ({ ...s, contextMenu: { deleteProject: 0, editProject: 0 } }));
	}

	function setSort(column) {
		setMain((s) => ({ ...s, sort: { column, isAscending: !s.sort.isAscending } }));
	}

	function toggleDeleteProjectBox(project) {
		setMain((s) => ({ ...s, selectedProject: project ?? {} }));
		setMounted((s) => ({ ...s, deleteProject: project ? true : false }));
	}

	function toggleEditProjectView(project) {
		setMain((s) => ({ ...s, selectedProject: project ?? {} }));
		setMounted((s) => ({ ...s, editProject: project ? true : false }));
	}

	function toggleEditStatusBox(project) {
		setMain((s) => ({ ...s, selectedProject: project ?? {} }));
		setMounted((s) => ({ ...s, editStatus: project ? true : false }));
	}

	function toggleProjectStatusBox(project) {
		setMain((s) => ({ ...s, selectedProject: project ?? {} }));
		setMounted((s) => ({ ...s, projectStatus: project ? true : false }));
	}

	function toggleSingleProjectView(project) {
		setMain((s) => ({ ...s, selectedProject: project ?? {} }));
		setMounted((s) => ({ ...s, singleProject: project ? true : false }));
	}

	function toggleTodoBox(project) {
		setMain((s) => ({ ...s, selectedProject: project ?? {} }));
		setMounted((s) => ({ ...s, todo: project ? true : false }));
	}

	// UI Components
	function uiBody() {
		return (
			<div className="flex w-full h-full justify-center items-start">
				<div className="flex flex-col w-[10%] space-y-2.5 mx-5 justify-start items-center">{uiList()}</div>
				<div className="flex flex-col w-[90%] h-full mr-5 justify-start items-center">
					<div className="flex flex-col w-full h-full justify-center items-start full-border">
						<div className="flex w-full h-9 justify-center items-center primary-background">{uiHeaders()}</div>
						<Virtuoso className="w-full h-full overflow-y-auto bottom-border contrast-background" data={doSorting()} itemContent={(_, row) => uiRows(row)} totalCount={doSorting().length} />
						<div className="fixed bottom-3 right-3 z-50">{uiTotalQuote()}</div>
					</div>
				</div>
			</div>
		);
	}

	function uiClearFilter() {
		return <FontAwesomeIcon className="cursor-pointer outline-none focus:outline-none red-text" icon={faFilterCircleXmark} onClick={() => clearFilters()} />;
	}

	function uiClientName(row, tooltipText) {
		const clientName = MyGlobal.HighlightText(row.client_name, main.search);
		const textColour = getClientNameColourByStatus(row.status);

		return (
			<Tippy allowHTML className="whitespace-pre-line" content={<Tooltip text={tooltipText} />} placement="bottom">
				<span className={textColour} dangerouslySetInnerHTML={{ __html: clientName }} onClick={() => toggleSingleProjectView(row)} />
			</Tippy>
		);
	}

	function uiDeleteProject() {
		if (!mounted.deleteProject) return null;

		return <DynamicDeleteProject mount={mounted.deleteProject} projectId={main.selectedProject?.id} reload={getSupportData} unmount={toggleDeleteProjectBox} />;
	}

	function uiEditStatus() {
		if (!mounted.editStatus) return null;

		return <DynamicEditStatus mount={mounted.editStatus} project={main.selectedProject} reload={getSupportData} unmount={toggleEditStatusBox} />;
	}

	function uiExport() {
		if (apiSize && apiCopySize) {
			return (
				<button className="primary-button-transparent-background" onClick={() => doExcelExport()}>
					<FontAwesomeIcon className="primary-text" icon={faFileExcel} />
				</button>
			);
		}
	}

	function uiFilter() {
		const wrapper = "flex w-full h-[30px] px-2 justify-between items-center font-regular-10 gray-text";

		return (
			<Menu as="div" className="flex w-40 h-[30px] justify-center items-center relative rounded shadow contrast-background full-border">
				<MenuButton className={wrapper}>
					<span>{main.filter || "Status"}</span>
					<FontAwesomeIcon icon={faChevronDown} />
				</MenuButton>
				<MenuItems className="absolute w-full top-8 right-0 origin-top-right rounded z-50 contrast-background bottom-shadow full-border">{uiFilterList()}</MenuItems>
			</Menu>
		);
	}

	function uiFilterList() {
		return Object.entries(main.revisedStatuses).map(([key, value], i) => {
			const isSelected = key === main.filter;
			const aesthetics = isSelected ? "primary-background-transparent-01 primary-text" : "contrast-background black-text";
			const wrapper = `flex w-full p-2 space-x-2.5 justify-between items-center cursor-pointer border-y ${aesthetics} hovered-rows`;

			return (
				<MenuItem as="div" className={wrapper} key={i} onClick={() => setFilter(key)}>
					<span className="flex w-full justify-between items-center font-regular-11">
						<span>{key}</span>
						{value > 0 && <BadgeSmall value={value} />}
					</span>
				</MenuItem>
			);
		});
	}

	function uiHeaders() {
		return Object.values(ProjectsHeaders).map((m, i) => {
			const showArrow = m === main.sort.column ? "visible" : "invisible";

			return (
				<span className="w-[16.66%] space-x-1 cursor-pointer text-center text-white font-medium-10" onClick={() => setSort(m)} key={i}>
					<span>{m}</span>
					<span className={showArrow}>{uiSortArrows(m)}</span>
				</span>
			);
		});
	}

	function uiList() {
		const modules = apiCopySize > 0 ? getAggregatedProjects() : [];

		return modules.map((m, i) => {
			const style = m.key === activeModule.name ? "primary-border primary-background-transparent-01 primary-text" : "full-border bg-white black-text";

			const wrapper = `flex w-full px-4 py-2 justify-between items-center rounded shadow ${style} font-regular-10 hovered-rows`;

			return (
				<button className={wrapper} key={i} onClick={() => setModule(m)}>
					<span className="text-left">{m.key}</span>
					{m.key !== "All" && m?.items.length && <span className="font-regular-10 gray-text">{m?.items.length}</span>}
				</button>
			);
		});
	}

	function uiMain() {
		if (main.isSupportDataLoading) return getEmptyDataMessage("Loading...");

		if (!apiSize && apiCopySize) return getEmptyDataMessage("No projects found...");

		if (!apiSize && !apiCopySize) return getEmptyDataMessage("No projects created");

		if (mounted.editProject) {
			return <DynamicEditProject project={main.selectedProject} reload={getSupportData} unmount={toggleEditProjectView} />;
		}

		if (mounted.myProjects) {
			return <DynamicMyProjects presetStatus={presetStatus} setModuleProps={setModuleProps} unmount={closeMyProjects} />;
		}

		if (mounted.singleProject) {
			return <DynamicSingleProject client={main.selectedClient} project={main.selectedProject} reload={getSupportData} source="Single Project" unmount={toggleSingleProjectView} />;
		}

		return uiBody();
	}

	function uiProjectStatus() {
		if (!mounted.projectStatus) return null;

		return <DynamicProjectStatus mount={mounted.projectStatus} project={main.selectedProject} reload={getSupportData} unmount={toggleProjectStatusBox} />;
	}

	function uiRows(row) {
		const { client_id, company_name, government_id, id, main_project_name, quote, remarks, started_on, status, sub_project_name, team_names, todos } = row;

		const style = `flex flex-col w-[16.66%] justify-center items-center text-center`;
		const childStyle = "flex w-full justify-center items-center";

		const parentLabelStyle = childStyle + " font-bold-12";
		const childLabelStyle = childStyle + " gray-text";

		const fancyRightBorderStyle = "absolute w-3 h-[50px] rounded-tr-full rounded-br-full " + getFancyBorderBackgroundByStatus(status) + " -left-1";

		const governmentId = MyGlobal.HighlightText(government_id ?? "", main.search);

		const clientIdAndName = [`Client ID - ${client_id}`, <br key="br" />, `Project ID - ${id}`];
		const companyName = MyGlobal.HighlightText(company_name, main.search);

		const mainProjectName = MyGlobal.HighlightText(main_project_name, main.search);
		const subProjectName = MyGlobal.HighlightText(sub_project_name, main.search);

		const background = status == stCompleted ? "green-background-transparent-01" : "contrast-background";

		const wrapper = `flex w-full py-3 justify-center items-center ${background} bottom-border font-regular-11 black-text`;

		const avatarWrapper = style + " !flex-row space-x-1";

		return (
			<div className={wrapper} key={id} onMouseEnter={() => setMouseEnter(id)} onMouseLeave={() => setMouseLeave(id)}>
				<div className={`${style} cursor-help primary-text`}>
					<span className={fancyRightBorderStyle} />
					<Tippy
						content={
							<div className="flex flex-col py-1 justify-start items-center">
								{allowDeletingProject && (
									<div className="flex w-full p-2 space-x-2 justify-start items-center cursor-pointer font-regular-11 black-text" onClick={() => toggleDeleteProjectBox(row)}>
										<FontAwesomeIcon icon={faTrash} />
										<span>Delete Project</span>
									</div>
								)}
								<div className="flex w-full p-2 space-x-2 justify-start items-center cursor-pointer font-regular-11 black-text" onClick={() => toggleEditProjectView(row)}>
									<FontAwesomeIcon icon={faPencil} />
									<span>Edit Project</span>
								</div>
							</div>
						}
						interactive
						placement="right"
						theme="light"
						trigger="mouseenter"
						appendTo={() => document.body}>
						<span>{dayjs(started_on).format("DD MMM, YYYY")}</span>
					</Tippy>
				</div>

				<div className={style}>
					<div className={`${parentLabelStyle} cursor-pointer hover:underline hover:underline-offset-4 space-x-5`}>
						{uiClientName(row, clientIdAndName)}
						{todos?.length > 0 && <FontAwesomeIcon className="text-rose-800 cursor-pointer scale-100 hover:scale-125 duration-200" icon={faListUl} onClick={() => toggleTodoBox(row)} />}
					</div>
					<Tippy content={<Tooltip text={`Gov ID: ${governmentId || "NA"}`} />} placement="bottom" trigger="mouseenter" appendTo={() => document.body}>
						<span className={childLabelStyle} dangerouslySetInnerHTML={{ __html: companyName }} />
					</Tippy>
				</div>

				<div className={style}>
					<span className={parentLabelStyle} dangerouslySetInnerHTML={{ __html: subProjectName }} />
					<Tippy content={<Tooltip text={`Remarks ${remarks}`} />} placement="bottom" trigger="mouseenter" appendTo={() => document.body}>
						<span className={childLabelStyle} dangerouslySetInnerHTML={{ __html: mainProjectName }} />
					</Tippy>
				</div>

				<span className={avatarWrapper}>
					<AvatarCircle names={String(team_names).split(",")} />
				</span>

				<span className={`${style} font-bold-12`}>{MyGlobal.FormatCurrency(quote)}</span>
				<span className={style}>{uiStatusMenu(row)}</span>
			</div>
		);
	}

	function uiSearch() {
		if (apiSize) {
			return <TextInputNative id="searchBox" icon={faSearch} onChange={(e) => setInputs("search", e.target.value)} onClearButtonClick={() => setInputs("search", "")} placeholder="Search" showClearButton={clearSearchStyle} tabIndex={1} value={main.search} width="w-60" />;
		}
	}

	function uiSortArrows(column) {
		if (main.sort.column === column) {
			return <FontAwesomeIcon className="text-white" icon={main.sort.isAscending ? faSortAmountDesc : faSortAmountAsc} />;
		}
	}

	function uiStatusMenu(row) {
		const isCompleted = row.status === stCompleted;
		const wrapper = `flex w-full px-4 space-x-2 justify-between items-center focus:outline-none font-regular-12 ${getStatusTags(row.status)}`;

		return (
			<Menu as="div" className="flex w-fit justify-center items-center relative">
				<MenuButton className={wrapper}>
					{isCompleted && <FontAwesomeIcon className="green-text" icon={faCheckCircle} />}
					<span dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(row.status, main.search) }} />
					{!isCompleted && <FontAwesomeIcon icon={faChevronDown} />}
				</MenuButton>
				{(!isCompleted || isUserAdministrator) && <MenuItems className="absolute w-full top-9 right-0 origin-top-right rounded focus:outline-none z-50 contrast-background bottom-shadow full-border">{uiStatusMenuList(row)}</MenuItems>}
			</Menu>
		);
	}

	function uiStatusMenuList(row) {
		return Object.values(statuses).map((m, i) => {
			const isSelected = m === row.status;
			const aesthetics = isSelected ? "primary-background-transparent-01 primary-text" : "contrast-background black-text";
			const wrapper = `flex w-full p-2 space-x-2.5 justify-between items-center cursor-pointer border-y ${aesthetics} hovered-rows`;

			return (
				<MenuItem as="div" className={wrapper} key={i} onClick={() => editStatus(row, m)}>
					<span className="font-regular-11">{m}</span>
					{isSelected && <FontAwesomeIcon className="primary-text" icon={faCheck} />}
				</MenuItem>
			);
		});
	}

	function uiTodos() {
		if (!mounted.todo) return null;

		return <DynamicTodo mount={mounted.todo} project={main.selectedProject} reload={getSupportData} unmount={toggleTodoBox} />;
	}

	function uiTopBar() {
		if (!mounted.editProject && !mounted.singleProject) {
			return (
				<div className="flex w-full px-5 py-2.5 justify-between items-center">
					<div className="flex w-1/3 space-x-2 justify-start items-center">
						<span className="view-heading">{thisView}</span>
						{getIconOrBadge()}
					</div>
					<div className="flex w-1/3 space-x-5 justify-center items-center">
						{uiSearch()}
						{uiFilter()}

						<Tippy content={<Tooltip text={`Clear filters of ${activeModule.name}`} />} placement="bottom">
							{uiClearFilter()}
						</Tippy>
					</div>
					<div className="flex w-1/3 justify-end items-center">{uiExport()}</div>
				</div>
			);
		}
	}

	function uiTotalQuote() {
		return (
			<div className="group relative flex items-center w-fit px-0 transition-all duration-500 ease-in-out">
				<div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400 border border-emerald-700 shadow-md z-0" />

				<div className="flex items-center justify-center w-10 h-10 group-hover:h-[36px] rounded-full text-white ring-emerald-700 group-hover:ring-0 transition-all duration-500 ease-in-out relative z-20 shrink-0">
					<FontAwesomeIcon icon={faIndianRupee} size="1x" />
				</div>

				<div className="transition-all duration-500 ease-in-out max-w-0 overflow-hidden group-hover:max-w-[300px]">
					<div className="pl-2 pr-4 text-white font-bold-12 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out relative z-20">{getTotalQuote()}</div>
				</div>
			</div>
		);
	}

	// Hooks
	useEffect(() => {
		getSupportData();

		globalThis.addEventListener("keydown", autoFocusSearchBox);

		return () => {
			setModuleProps("projectsOrTasks", "");
			globalThis.removeEventListener("keydown", autoFocusSearchBox);
		};
	}, []);

	useEffect(() => {
		doFiltering();
	}, [main.filter, main.search]);

	return (
		<div className="flex flex-col w-full h-full justify-start items-center">
			{uiTopBar()}
			{uiMain()}
			{uiDeleteProject()}
			{uiEditStatus()}
			{uiTodos()}
			{uiProjectStatus()}
		</div>
	);
}
