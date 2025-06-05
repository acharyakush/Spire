"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import dayjs from "dayjs";
import Tippy from "@tippyjs/react";
import dynamic from "next/dynamic";
import MyConstants from "@/utilities/constants";

import { MyGlobal } from "@/utilities/global";
import { Menu, MenuButton } from "@headlessui/react";
import { TextInputNative } from "@/components/Inputs";
import { useCallback, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Badge, BadgeSmall, Spinner, Tooltip } from "@/components/Elements";
import { faCheck, faCheckCircle, faChevronDown, faFileExcel, faFilterCircleXmark, faPencil, faSearch, faSortAmountAsc, faSortAmountDesc, faTrash } from "@fortawesome/free-solid-svg-icons";

const DynamicEditProject = dynamic(() => import("./EditProject"), { ssr: false });
const DynamicMyProjects = dynamic(() => import("./MyProjects"), { ssr: false });
const DynamicSingleProject = dynamic(() => import("../singleProject"), { ssr: false });

const DynamicDeleteProject = dynamic(() => import("@/modals/projects/miscellaneous").then((t) => t.DeleteProject), { ssr: false });
const DynamicEditStatus = dynamic(() => import("@/modals/projects/miscellaneous").then((t) => t.EditStatus), { ssr: false });
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
		component: false,
		myProjects: presetStatus === "my-projects" || String(presetStatus).includes("MySpace"),
		projectStatus: false,
		singleProject: false,
	});

	const [projects, setProjects] = useState({ api: [], copy: [] });

	const today = useMemo(() => dayjs(), []);
	const statuses = useMemo(() => MyConstants.Statuses.Projects, []);
	const thisView = useMemo(() => MyConstants.Modules.Base.Projects, []);
	const tableHeaders = useMemo(() => MyConstants.TableHeaders.Projects, []);
	const isUserAdministrator = useMemo(() => MyGlobal.IsUserAdministrator(), []);

	const { Active: stActive, Cancelled: stCancelled, Closed: stClosed, Completed: stCompleted, Hold: stHold } = statuses;

	const apiSize = useMemo(() => projects.api.length, [projects.api]);
	const apiCopySize = useMemo(() => projects.copy.length, [projects.copy]);

	const allowDeletingProject = useMemo(() => MyGlobal.HasPermission(MyConstants.Modules.Derived.DeleteProject), []);
	const allowEditingProject = useMemo(() => MyGlobal.HasPermission(MyConstants.Modules.Derived.EditProject), []);

	const showFindBoxClearButton = useMemo(() => (main.search ? "cursor-pointer primary-text" : "hidden"), [main.search]);

	const blankDataWrapper = "flex w-full h-full justify-center items-center contrast-background full-border";

	// Functions
	const autoFocusSearchBox = useCallback((e) => {
		if (e.ctrlKey && e.key === "f") {
			e.preventDefault();
			document.getElementById("searchBox").focus();
		}
	}, []);

	const clearFilters = useCallback(() => {
		const source = activeModule.name === "All" ? projects.copy : activeModule.list;
		setMain((s) => ({ ...s, filter: "", revisedStatuses: getRevisedStatuses(source) }));
	}, []);

	const closeMyProjects = useCallback(() => {
		setMounted((s) => ({ ...s, myProjects: false }));
	}, []);

	const doFiltering = useCallback(() => {
		const filtered = getSelectedProjectData().filter((f) => {
			if (main.filter) return String(f.status) === main.filter;

			const findText = main.search.toLowerCase();

			const projectId = String(f.id).toLowerCase();
			const governmentId = String(f.government_id).toLowerCase();

			const clientId = String(f.client_id).toLowerCase();
			const clientName = String(f.client_name).toLowerCase();

			const companyName = String(f.company_name).toLowerCase();

			const mainProjectName = String(f.main_project_name).toLowerCase();
			const subProjectName = String(f.sub_project_name).toLowerCase();

			const teamNames = String(f.team_names).toLowerCase();
			const teamNamesInitials = String(f.team_names_initials).toLowerCase();

			const status = String(f.status).toLowerCase();

			return (
				projectId.includes(findText) ||
				governmentId.includes(findText) ||
				clientId.includes(findText) ||
				clientName.includes(findText) ||
				companyName.includes(findText) ||
				mainProjectName.includes(findText) ||
				subProjectName.includes(findText) ||
				teamNames.includes(findText) ||
				teamNamesInitials.includes(findText) ||
				status.includes(findText)
			);
		});

		setProjects((s) => ({ ...s, api: filtered }));
	}, [main.filter]);

	const doSorting = useCallback(() => {
		return getSelectedProjectData().sort((a, b) => {
			const aStartedOn = new Date(a.started_on);
			const bStartedOn = new Date(b.started_on);

			const { column, isAscending } = main.sort;

			switch (true) {
				case column === tableHeaders.Started && isAscending:
					return aStartedOn - bStartedOn;
				case column === tableHeaders.Started && !isAscending:
					return bStartedOn - aStartedOn;
				case column === tableHeaders.GovermentId && isAscending:
					if (a.government_id) {
						return String(a.government_id).localeCompare(b.government_id);
					}
				case column === tableHeaders.GovermentId && !isAscending:
					if (b.government_id) {
						return String(b.government_id).localeCompare(a.government_id);
					}
				case column === tableHeaders.Client && isAscending:
					return String(a.client_name).localeCompare(b.client_name);
				case column === tableHeaders.Client && !isAscending:
					return String(b.client_name).localeCompare(a.client_name);
				case column === tableHeaders.Company && isAscending:
					return String(a.company_name).localeCompare(b.company_name);
				case column === tableHeaders.Company && !isAscending:
					return String(b.company_name).localeCompare(a.company_name);
				case column === tableHeaders.MainProject && isAscending:
					return String(a.main_project_name).localeCompare(b.main_project_name);
				case column === tableHeaders.MainProject && !isAscending:
					return String(b.main_project_name).localeCompare(a.main_project_name);
				case column === tableHeaders.SubProject && isAscending:
					return String(a.sub_project_name).localeCompare(b.sub_project_name);
				case column === tableHeaders.SubProject && !isAscending:
					return String(b.sub_project_name).localeCompare(a.sub_project_name);
				case column === tableHeaders.Status && isAscending:
					return String(a.status).localeCompare(b.status);
				case column === tableHeaders.Status && !isAscending:
					return String(b.status).localeCompare(a.status);
			}
		});
	}, [main.sort]);

	const editStatus = useCallback((project, status) => {
		const object = { ...project };

		object["new_status"] = status;

		if (status !== stCompleted) {
			toggleEditStatusBox(object);
		} else {
			toggleProjectStatusBox(object);
		}
	}, []);

	const getAggregatedProjects = useCallback(() => {
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

				return a.key.localeCompare(b.key);
			});
	}, []);

	const getEmptyDataMessage = useCallback((message) => {
		return (
			<div className={blankDataWrapper}>
				<span className="font-regular-12 gray-text">{message}</span>
			</div>
		);
	}, []);

	const getIconOrBadge = useCallback(() => {
		if (!main.isSupportDataLoading) return apiSize > 0 && <Badge value={getRowsCount()} />;

		return (
			<span className="pl-5 relative">
				<Spinner />
			</span>
		);
	}, [main.isSupportDataLoading]);

	const getRevisedStatuses = useCallback((source) => {
		if (!Array.isArray(source)) return [];
		if (!source.length) return [];

		const object = { [stActive]: 0, [stCancelled]: 0, [stClosed]: 0, [stCompleted]: 0, [stHold]: 0 };

		source.forEach((fe) => {
			if (fe.status === stActive) object.Active++;
			if (fe.status === stCancelled) object.Cancelled++;
			if (fe.status === stClosed) object.Closed++;
			if (fe.status === stCompleted) object.Completed++;
			if (fe.status === stHold) object.Hold++;
		});

		return object;
	}, []);

	const getRowsCount = useCallback(() => {
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
	}, [main.search]);

	const getSelectedProjectData = useCallback(() => {
		let data = [];

		if (apiCopySize > 0) {
			const list = activeModule.name === "All" ? projects.copy : getAggregatedProjects().find((f) => f.key == activeModule.name).items;

			const { filter, search } = main;

			data = list.filter((f) => {
				if (main.search.length) {
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
	}, []);

	const setFilter = useCallback((value) => {
		setMain((s) => ({ ...s, filter: value }));
	}, []);

	const setInputs = useCallback((key, value) => {
		setMain((s) => ({ ...s, [key]: value }));
	}, []);

	const setModule = useCallback((module) => {
		const source = module.key === "All" ? projects.copy : module?.items;

		setActiveModule({ list: module?.items, name: module?.key });
		setMain((s) => ({ ...s, filter: "", revisedStatuses: getRevisedStatuses(source) }));
	}, []);

	const setMouseEnter = useCallback((projectId) => {
		if (allowDeletingProject) {
			setMain((s) => ({ ...s, contextMenu: { ...s.contextMenu, deleteProject: projectId } }));
		}

		if (allowEditingProject) {
			setMain((s) => ({ ...s, contextMenu: { ...s.contextMenu, editProject: projectId } }));
		}
	}, []);

	const setMouseLeave = useCallback(() => {
		setMain((s) => ({ ...s, contextMenu: { deleteProject: 0, editProject: 0 } }));
	}, []);

	const setSort = useCallback((column) => {
		setMain((s) => ({ ...s, sort: { column, isAscending: !s.sort.isAscending } }));
	}, []);

	const getSupportData = useCallback(async (projectId) => {
		setMain((s) => ({ ...s, isSupportDataLoading: true }));

		try {
			const response = await axios.get(MyConstants.ApiEndpoints.Projects.GetProjects, MyGlobal.GetHeaders());

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
	}, []);

	const toggleDeleteProjectBox = useCallback((project) => {
		setMain((s) => ({ ...s, selectedProject: project ?? {} }));
		setMounted((s) => ({ ...s, deleteProject: project ? true : false }));
	}, []);

	const toggleEditProjectView = useCallback((project) => {
		setMain((s) => ({ ...s, selectedProject: project ?? {} }));
		setMounted((s) => ({ ...s, editProject: project ? true : false }));
	}, []);

	const toggleEditStatusBox = useCallback((project) => {
		setMain((s) => ({ ...s, selectedProject: project ?? {} }));
		setMounted((s) => ({ ...s, editStatus: project ? true : false }));
	}, []);

	const toggleProjectStatusBox = useCallback((project) => {
		setMain((s) => ({ ...s, selectedProject: project ?? {} }));
		setMounted((s) => ({ ...s, projectStatus: project ? true : false }));
	}, []);

	const toggleSingleProjectView = useCallback((project) => {
		setMain((s) => ({ ...s, selectedProject: project ?? {} }));
		setMounted((s) => ({ ...s, singleProject: project ? true : false }));
	}, []);

	// UI Components
	const uiClearFilter = useCallback(() => {
		return (
			<FontAwesomeIcon
				className="cursor-pointer outline-none focus:outline-none red-text"
				icon={faFilterCircleXmark}
				onClick={() => clearFilters()}
			/>
		);
	}, []);

	const uiClientName = useCallback(
		(row, tooltipText) => {
			const clientName = MyGlobal.HighlightText(row.client_name, main.search);

			return (
				<Tippy
					allowHTML
					className="whitespace-pre-line"
					content={<Tooltip text={tooltipText} />}
					placement="bottom">
					<span
						dangerouslySetInnerHTML={{ __html: clientName }}
						onClick={() => toggleSingleProjectView(row)}
					/>
				</Tippy>
			);
		},
		[main.search, toggleSingleProjectView],
	);

	const uiExport = useCallback(() => {
		if (apiSize && apiCopySize) {
			return (
				<button
					className="primary-button-transparent-background"
					onClick={() => doExcelExport()}>
					<FontAwesomeIcon
						className="primary-text"
						icon={faFileExcel}
					/>
				</button>
			);
		}
	}, [apiSize, apiCopySize]);

	const uiFilter = useCallback(() => {
		const wrapper = "flex w-full h-[30px] px-2 justify-between items-center font-regular-10 gray-text";

		return (
			<Menu
				as="div"
				className="flex w-40 h-[30px] justify-center items-center relative rounded shadow contrast-background full-border">
				<MenuButton className={wrapper}>
					<span>{main.filter || "Status"}</span>
					<FontAwesomeIcon icon={faChevronDown} />
				</MenuButton>
				<MenuItems className="absolute w-full top-8 right-0 origin-top-right rounded z-50 contrast-background bottom-shadow full-border">{uiFilterList()}</MenuItems>
			</Menu>
		);
	}, [main.filter]);

	const uiFilterList = useCallback(() => {
		return Object.entries(main.revisedStatuses).map(([key, value], i) => {
			const isSelected = key === main.filter;
			const aesthetics = isSelected ? "primary-background-transparent-01 primary-text" : "contrast-background black-text";
			const wrapper = `flex w-full p-2 space-x-2.5 justify-between items-center cursor-pointer border-y ${aesthetics} hovered-rows`;

			return (
				<MenuItem
					as="div"
					className={wrapper}
					key={i}
					onClick={() => setFilter(key)}>
					<span className="flex w-full justify-between items-center font-regular-11">
						<span>{key}</span>
						{value > 0 && <BadgeSmall value={value} />}
					</span>
				</MenuItem>
			);
		});
	}, [main.filter, main.revisedStatuses]);

	const uiFind = useCallback(() => {
		if (apiSize) {
			return (
				<TextInputNative
					id="searchBox"
					icon={faSearch}
					onChange={(e) => setInputs("search", e.target.value)}
					onClearButtonClick={() => setInputs("search", "")}
					placeholder="Search"
					showClearButton={showFindBoxClearButton}
					tabIndex={1}
					value={main.search}
					width="w-60"
				/>
			);
		}
	}, [main.search]);

	const uiHeaders = useCallback(() => {
		return Object.values(tableHeaders).map((m, i) => {
			const showArrow = m === main.sort.column ? "visible" : "invisible";

			return (
				<span
					className="w-[12.5%] space-x-1 cursor-pointer text-center text-white font-medium-10"
					onClick={() => setSort(m)}
					key={i}>
					<span>{m}</span>
					<span className={showArrow}>{uiSortArrows(m)}</span>
				</span>
			);
		});
	}, [main.sort]);

	const uiList = useCallback(() => {
		const modules = apiCopySize > 0 ? getAggregatedProjects() : [];

		return modules.map((m, i) => {
			const style = m.key === activeModule.name ? "primary-border primary-background-transparent-01 primary-text" : "full-border bg-white black-text";

			const wrapper = `flex w-full px-4 py-2 justify-between items-center rounded shadow ${style} font-regular-10 hovered-rows`;

			return (
				<button
					className={wrapper}
					key={i}
					onClick={() => setModule(m)}>
					<span className="text-left">{m.key}</span>
					{m.key !== "All" && m?.items.length && <span className="font-regular-10 gray-text">{m?.items.length}</span>}
				</button>
			);
		});
	}, [activeModule.name, apiCopySize]);

	const uiMain = useCallback(() => {
		if (main.isSupportDataLoading) return getEmptyDataMessage("Loading...");

		if (!apiSize && apiCopySize) return getEmptyDataMessage("No projects found...");

		if (!apiSize && !apiCopySize) return getEmptyDataMessage("No projects created");

		if (mounted.editProject) {
			return (
				<DynamicEditProject
					project={main.selectedProject}
					reload={getSupportData}
					unmount={toggleEditProjectView}
				/>
			);
		}

		if (mounted.myProjects) {
			return (
				<DynamicMyProjects
					presetStatus={presetStatus}
					setModuleProps={setModuleProps}
					unmount={closeMyProjects}
				/>
			);
		}

		if (mounted.singleProject) {
			return (
				<DynamicSingleProject
					client={main.selectedClient}
					project={main.selectedProject}
					reload={getSupportData}
					source="Single Project"
					unmount={toggleSingleProjectView}
				/>
			);
		}

		return uiBody();
	}, [apiCopySize, apiSize, main.isSupportDataLoading, mounted.editProject, mounted.myProjects, mounted.singleProject]);

	const uiRows = useCallback(
		(row) => {
			const style = `flex w-[12.5%] min-h-9 justify-center items-center text-center`;

			const { client_id, company_name, government_id, id, main_project_name, remarks, status, sub_project_name } = row;

			const governmentId = MyGlobal.HighlightText(government_id ?? "", main.search);
			const governmentIdTextColour = !government_id ? "gray-text" : "primary-text";

			const clientIdAndName = [`Client ID - ${client_id}`, <br />, `Project ID - ${id}`];
			const companyName = MyGlobal.HighlightText(company_name, main.search);

			const mainProjectName = MyGlobal.HighlightText(main_project_name, main.search);
			const subProjectName = MyGlobal.HighlightText(sub_project_name, main.search);

			const background = status == stCompleted ? "green-background-transparent-01" : "contrast-background";

			const wrapper = `flex w-full justify-center items-center ${background} bottom-border font-regular-11 black-text`;

			return (
				<div
					className={wrapper}
					key={id}
					onMouseEnter={() => setMouseEnter(id)}
					onMouseLeave={() => setMouseLeave(id)}>
					<div className={`${style} cursor-help primary-text`}>{uiStartedOn(row)}</div>

					<span
						className={`${style} wrap-text ${governmentIdTextColour}`}
						dangerouslySetInnerHTML={{ __html: governmentId || "NA" }}
					/>

					<span className={`${style} space-x-5 cursor-pointer relative primary-text`}>{uiClientName(row, clientIdAndName)}</span>

					<span
						className={style}
						dangerouslySetInnerHTML={{ __html: companyName }}
					/>
					<span
						className={style}
						dangerouslySetInnerHTML={{ __html: mainProjectName }}
					/>

					<Tippy
						content={<Tooltip text={`Remarks ${remarks}`} />}
						placement="bottom">
						<span
							className={style}
							dangerouslySetInnerHTML={{ __html: subProjectName }}
						/>
					</Tippy>

					<span className={`${style} space-x-1`}>{uiTeams(row)}</span>
					<span className={style}>{uiStatusMenu(row)}</span>
				</div>
			);
		},
		[main.search],
	);

	const renderDeleteProject = useCallback(() => {
		if (!mounted.deleteProject) return null;

		return (
			<DynamicDeleteProject
				mount={mounted.deleteProject}
				projectId={main.selectedProject?.id}
				reload={getSupportData}
				unmount={toggleDeleteProjectBox}
			/>
		);
	}, [mounted.deleteProject, main.selectedProject?.id, toggleDeleteProjectBox]);

	const renderEditStatus = useCallback(() => {
		if (!mounted.editStatus) return null;

		return (
			<DynamicEditStatus
				mount={mounted.editStatus}
				project={main.selectedProject}
				reload={getSupportData}
				unmount={toggleEditStatusBox}
			/>
		);
	}, [mounted.editStatus, main.selectedProject, toggleEditStatusBox]);

	const renderprojectStatus = useCallback(() => {
		if (!mounted.projectStatus) return null;

		return (
			<DynamicProjectStatus
				mount={mounted.projectStatus}
				project={main.selectedProject}
				reload={getSupportData}
				unmount={toggleProjectStatusBox}
			/>
		);
	}, [mounted.projectStatus, main.selectedProject, toggleProjectStatusBox]);

	const uiSortArrows = useCallback(
		(column) => {
			if (main.sort.column === column) {
				return (
					<FontAwesomeIcon
						className="text-white"
						icon={main.sort.isAscending ? faSortAmountDesc : faSortAmountAsc}
					/>
				);
			}
		},
		[main.selectedProject],
	);

	const uiStartedOn = useCallback((row) => {
		const actionButtonStyle = "flex w-full p-2 space-x-2 justify-start items-center cursor-pointer font-regular-11 black-text";

		return (
			<Tippy
				content={
					<div className="flex flex-col py-1 justify-start items-center">
						{allowDeletingProject && (
							<div
								className={actionButtonStyle}
								onClick={() => toggleDeleteProjectBox(row)}>
								<FontAwesomeIcon icon={faTrash} />
								<span>Delete Project</span>
							</div>
						)}
						<div
							className={actionButtonStyle}
							onClick={() => toggleEditProjectView(row)}>
							<FontAwesomeIcon icon={faPencil} />
							<span>Edit Project</span>
						</div>
					</div>
				}
				interactive
				placement="right"
				theme="light">
				<span>{dayjs(row.started_on).format("DD MMM, YYYY")}</span>
			</Tippy>
		);
	}, []);

	const uiStatusMenu = useCallback(
		(row) => {
			const isCompleted = row.status === stCompleted;
			const wrapper = `flex w-full px-4 justify-between items-center focus:outline-none font-regular-11 !py-0`;

			return (
				<Menu
					as="div"
					className="flex w-24 justify-center items-center relative">
					<MenuButton className={wrapper}>
						{isCompleted && (
							<FontAwesomeIcon
								className="green-text mr-1.5"
								icon={faCheckCircle}
							/>
						)}
						<span dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(row.status, main.search) }} />
						{!isCompleted && <FontAwesomeIcon icon={faChevronDown} />}
					</MenuButton>
					{!isCompleted ? (
						<MenuItems className="absolute w-full top-7 right-0 origin-top-right rounded focus:outline-none z-50 contrast-background bottom-shadow full-border">{uiStatusList(row)}</MenuItems>
					) : (
						isUserAdministrator && <MenuItems className="absolute w-full top-7 right-0 origin-top-right rounded focus:outline-none z-50 contrast-background bottom-shadow full-border">{uiStatusList(row)}</MenuItems>
					)}
				</Menu>
			);
		},
		[main.search],
	);

	const uiStatusList = useCallback((row) => {
		return Object.values(statuses).map((m, i) => {
			const isSelected = m === row.status;
			const aesthetics = isSelected ? "primary-background-transparent-01 primary-text" : "contrast-background black-text";
			const wrapper = `flex w-full p-2 space-x-2.5 justify-between items-center cursor-pointer border-y ${aesthetics} hovered-rows`;

			return (
				<MenuItem
					as="div"
					className={wrapper}
					key={i}
					onClick={() => editStatus(row, m)}>
					<span className="font-regular-11">{m}</span>
					{isSelected && (
						<FontAwesomeIcon
							className="primary-text"
							icon={faCheck}
						/>
					)}
				</MenuItem>
			);
		});
	}, []);

	const uiTeams = useCallback((row) => {
		const names = String(row.team_names);
		const singleUserInitials = row.team_names_initials;
		const total = names.split(",").length;

		if (names.includes(",")) {
			if (total > 2) {
				return (
					<Tippy
						content={uiTeamsListTooltip(names)}
						placement="bottom">
						<span className="cursor-help primary-text">{total}</span>
					</Tippy>
				);
			} else {
				return names.split(",").map((m) => uiTeamsTooltip(MyGlobal.GetInitials(m), m));
			}
		} else {
			return uiTeamsTooltip(singleUserInitials, names);
		}
	}, []);

	const uiTeamsListTooltip = useCallback((teams) => {
		const splitted = String(teams).split(",");

		return (
			<div className="flex flex-col w-full p-1 justify-between items-center font-regular-9">
				{!teams
					? "No teams involved"
					: splitted.map((m, i) => {
							const bottomBorder = i !== splitted.length - 1 ? "bottom-border" : "border-transparent";
							const wrapper = `flex w-full justify-start items-center ${bottomBorder}`;

							return (
								<div
									className={wrapper}
									key={i}>
									{i + 1}. {m}
								</div>
							);
					  })}
			</div>
		);
	}, []);

	const uiTeamsTooltip = useCallback((badgeText, tooltipText) => {
		return (
			<Tippy
				content={<Tooltip text={tooltipText} />}
				placement="bottom">
				<span className="cursor-help">
					<BadgeSmall value={badgeText} />
				</span>
			</Tippy>
		);
	}, []);

	const uiTopBar = useCallback(() => {
		if (!mounted.editProject && !mounted.singleProject) {
			return (
				<div className="flex w-full px-5 py-2.5 justify-between items-center">
					<div className="flex w-1/3 space-x-2 justify-start items-center">
						<span className="view-heading">{thisView}</span>
						{getIconOrBadge()}
					</div>
					<div className="flex w-1/3 space-x-5 justify-center items-center">
						{uiFind()}
						{uiFilter()}

						<Tippy
							content={<Tooltip text={`Clear filters of ${activeModule.name}`} />}
							placement="bottom">
							{uiClearFilter()}
						</Tippy>
					</div>
					<div className="flex w-1/3 justify-end items-center">{uiExport()}</div>
				</div>
			);
		}
	}, [activeModule.name, mounted.editProject, mounted.singleProject]);

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
		if (mounted.component) {
			doFiltering();
		}
	}, [main.filter, main.search]);

	return (
		<div className="flex flex-col w-full h-full justify-start items-center">
			{uiTopBar()}
			{uiMain()}

			{renderDeleteProject()}
			{renderEditStatus()}
			{renderprojectStatus()}
		</div>
	);
}
