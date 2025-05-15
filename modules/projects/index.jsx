"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import Tippy from "@tippyjs/react";
import MyProjects from "./MyProjects";
import EditProject from "./EditProject";
import writeXlsxFile from "write-excel-file";
import SingleProject from "../singleProject";
import MyConstants from "@/utilities/constants";

import { Virtuoso } from "react-virtuoso";
import { MyGlobal } from "@/utilities/global";
import { TextInputNative } from "@/components/Inputs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Badge, BadgeSmall, Spinner, SpinnerSmall, Tooltip } from "@/components/Elements";
import { EditStatus, DeleteProject, ProjectStatus } from "@/modals/projects/miscellaneous";
import { faCheck, faCheckCircle, faChevronDown, faFileExcel, faFilterCircleXmark, faPencil, faSearch, faSortAmountAsc, faSortAmountDesc, faTrash } from "@fortawesome/free-solid-svg-icons";

export default function Projects({ presetStatus, setModuleProps }) {
	// Business Logic
	const [api, setApi] = useState({
		notes: [],
		projects: { data: [], copy: [] },
	});

	const [main, setMain] = useState({
		activeModule: { items: [], name: "All" },
		dueDate: { from: "", to: "" },
		filter: "",
		findText: presetStatus ?? "",
		isLoading: { selectedProject: false, supportData: false },
		revisedStatuses: {},
		selectedClient: {},
		selectedProject: {},
		showIconButton: { deleteProject: 0, editProject: 0 },
		sort: { column: "ID", isAscending: false },
	});

	const [mounted, setMounted] = useState({
		deleteProject: false,
		editProject: false,
		editStatus: false,
		mainComponent: false,
		myProjects: presetStatus === "my-projects" || String(presetStatus).includes("MySpace"),
		projectStatus: false,
		singleProject: false,
	});

	const today = useMemo(() => dayjs(), []);
	const statuses = MyConstants.Statuses.Projects;
	const thisView = MyConstants.Modules.Base.Projects;
	const tableHeaders = MyConstants.TableHeaders.Projects;
	const isUserAdministrator = MyGlobal.IsUserAdministrator();

	const allowDeletingProject = useMemo(() => MyGlobal.HasPermission(MyConstants.Modules.Derived.DeleteProject), []);
	const allowEditingProject = useMemo(() => MyGlobal.HasPermission(MyConstants.Modules.Derived.EditProject), []);

	const showFindBoxClearButton = main.findText ? "cursor-pointer primary-text" : "hidden";
	const blankDataWrapper = "flex w-full h-full justify-center items-center contrast-background full-border";

	// Add debounce for search function
	const [debouncedFindText, setDebouncedFindText] = useState(presetStatus ?? "");

	// Functions
	const autoFocusFindBox = useCallback((event) => {
		if (event.ctrlKey && event.key == "f") {
			event.preventDefault();
			document.getElementById("findBox").focus();
		}
	}, []);

	const calculateStatusCounts = useCallback(
		(projectsList) => {
			const counts = {
				[statuses.Active]: 0,
				[statuses.Cancelled]: 0,
				[statuses.Closed]: 0,
				[statuses.Completed]: 0,
				[statuses.Hold]: 0,
			};

			projectsList.forEach((project) => {
				if (counts.hasOwnProperty(project.status)) {
					counts[project.status]++;
				}
			});

			return counts;
		},
		[statuses],
	);

	const clearFilter = useCallback(() => {
		const source = main.activeModule.name === "All" ? api.projects.copy : main.activeModule.items;

		// Apply only text filter if it exists to get accurate status counts
		if (main.findText) {
			const textFilteredData = source.filter((project) => {
				const findText = main.findText.toLowerCase();
				return (
					String(project.id).toLowerCase().includes(findText) ||
					String(project.government_id || "")
						.toLowerCase()
						.includes(findText) ||
					String(project.client_id).toLowerCase().includes(findText) ||
					project.client_name.toLowerCase().includes(findText) ||
					project.company_name.toLowerCase().includes(findText) ||
					project.main_project_name.toLowerCase().includes(findText) ||
					project.sub_project_name.toLowerCase().includes(findText) ||
					String(project.team_names).toLowerCase().includes(findText) ||
					String(project.team_names_initials).toLowerCase().includes(findText) ||
					project.status.toLowerCase().includes(findText)
				);
			});

			const revisedStatuses = calculateStatusCounts(textFilteredData);

			setMain((s) => ({
				...s,
				filter: "",
				revisedStatuses,
			}));
		} else {
			// If no text filter, just use the entire source
			const revisedStatuses = calculateStatusCounts(source);

			setMain((s) => ({
				...s,
				filter: "",
				revisedStatuses,
			}));
		}
	}, [api.projects.copy, main.activeModule, main.findText, calculateStatusCounts]);

	const closeMyProjects = useCallback(() => {
		setMain((s) => ({ ...s, findText: "" }));
		setMounted((s) => ({ ...s, myProjects: false }));
	}, []);

	const setMouseEnter = useCallback(
		(projectId) => {
			if (allowDeletingProject) {
				setMain((s) => ({ ...s, showIconButton: { ...s.showIconButton, deleteProject: projectId } }));
			}

			if (allowEditingProject) {
				setMain((s) => ({ ...s, showIconButton: { ...s.showIconButton, editProject: projectId } }));
			}
		},
		[allowDeletingProject, allowEditingProject],
	);

	const setMouseLeave = useCallback(() => {
		setMain((s) => ({ ...s, showIconButton: { deleteProject: 0, editProject: 0 } }));
	}, []);

	const setSort = useCallback((column) => {
		setMain((s) => ({ ...s, sort: { column, isAscending: !s.sort.isAscending } }));
	}, []);

	const setFilter = useCallback(
		(value) => {
			// If clicking on the same filter, clear it
			if (value === main.filter) {
				setMain((s) => ({ ...s, filter: "" }));

				// Recalculate status counts based on the text search only
				if (main.findText) {
					const source = main.activeModule.name === "All" ? api.projects.copy : main.activeModule.items;
					const textFilteredData = source.filter((project) => {
						const findText = main.findText.toLowerCase();
						return (
							String(project.id).toLowerCase().includes(findText) ||
							String(project.government_id || "")
								.toLowerCase()
								.includes(findText) ||
							String(project.client_id).toLowerCase().includes(findText) ||
							project.client_name.toLowerCase().includes(findText) ||
							project.company_name.toLowerCase().includes(findText) ||
							project.main_project_name.toLowerCase().includes(findText) ||
							project.sub_project_name.toLowerCase().includes(findText) ||
							String(project.team_names).toLowerCase().includes(findText) ||
							String(project.team_names_initials).toLowerCase().includes(findText) ||
							project.status.toLowerCase().includes(findText)
						);
					});

					const revisedStatuses = calculateStatusCounts(textFilteredData);
					setMain((s) => ({ ...s, revisedStatuses }));
				} else {
					// If no text filter, use the entire module data
					const source = main.activeModule.name === "All" ? api.projects.copy : main.activeModule.items;
					const revisedStatuses = calculateStatusCounts(source);
					setMain((s) => ({ ...s, revisedStatuses }));
				}
			} else {
				// Set the new filter
				setMain((s) => ({ ...s, filter: value }));
			}
		},
		[main.filter, main.findText, main.activeModule, api.projects.copy, calculateStatusCounts],
	);

	const setInputs = useCallback((key, value) => {
		if (key === "findText") {
			setMain((s) => ({ ...s, [key]: value }));

			// Clear any existing timeout
			if (window.searchTimeout) {
				clearTimeout(window.searchTimeout);
			}

			// Set a new timeout
			window.searchTimeout = setTimeout(() => {
				setDebouncedFindText(value);
			}, 250); // 250ms debounce
		} else {
			setMain((s) => ({ ...s, [key]: value }));
		}
	}, []);

	// Define setSupportData earlier in the component
	const setSupportData = useCallback(
		async (projectId) => {
			setMain((s) => ({ ...s, isLoading: { ...s.isLoading, supportData: true } }));

			try {
				const response = await axios.get(MyConstants.ApiEndpoints.Projects.GetProjects, MyGlobal.GetHeaders());

				if (response.status === 200) {
					// Create lookup maps for faster access
					const clientsMap = new Map(response.data.clients.map((client) => [client.id, client.name]));
					const companiesMap = new Map(response.data.companies.map((company) => [company.id, company.name]));
					const mainProjectsMap = new Map(response.data.mainProjects.map((project) => [project.id, project.name]));
					const subProjectsMap = new Map(response.data.subProjects.map((project) => [project.id, project.name]));

					// Preprocess tasks by project_id for O(1) lookups
					const tasksByProject = response.data.tasks.reduce((acc, task) => {
						if (!acc[task.project_id]) {
							acc[task.project_id] = [];
						}
						acc[task.project_id].push(task);
						return acc;
					}, {});

					const revised = response.data.projects.map((project) => {
						// Get project details from maps
						const clientName = clientsMap.get(project.client_id) || "";
						const companyName = companiesMap.get(project.company_id) || "";
						const mainProjectName = mainProjectsMap.get(project.main_project_id) || "";
						const subProjectName = subProjectsMap.get(project.sub_project_id) || "";
						const teamNames = MyGlobal.GetAnyDataFromId(project.teams, "full_name");

						// Process tasks for this project
						let hasTasksOverdue = false;
						let hasTasksDueTomorrow = false;
						let hasTasksDueToday = false;
						let hasTasksUpcoming = false;
						let reimburseVoucher = 0;

						const projectTasks = tasksByProject[project.id] || [];
						projectTasks.forEach((task) => {
							reimburseVoucher += Number(task.expense);
							const tasksDueDate = dayjs(task.due_on);

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
						});

						return {
							...project,
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
							teams_data: MyGlobal.GetFullDetailsFromIds(project.teams),
						};
					});

					setApi({
						notes: response.data.notes,
						projects: {
							copy: revised,
							data: revised,
						},
					});

					if (projectId) {
						const updateSelectedProject = revised.find((f) => f.id == projectId);
						setMain((s) => ({ ...s, selectedProject: updateSelectedProject }));
					}

					const revisedStatuses = calculateStatusCounts(revised);

					setMain((s) => ({
						...s,
						revisedStatuses,
						isLoading: { ...s.isLoading, supportData: false },
					}));
					setMounted((s) => ({ ...s, mainComponent: true }));
				}
			} catch (error) {
				MyGlobal.HandleErrors(error, `${thisView} => Get Support Data`);
				setMain((s) => ({ ...s, isLoading: { ...s.isLoading, supportData: false } }));
			}
		},
		[today, calculateStatusCounts, thisView],
	);

	const setModule = useCallback(
		(module) => {
			const source = module.key === "All" ? api.projects.copy : module?.items;
			const revisedStatuses = calculateStatusCounts(source);

			setMain((s) => ({
				...s,
				activeModule: { items: module?.items, name: module?.key },
				filter: "",
				revisedStatuses,
			}));
		},
		[api.projects.copy, calculateStatusCounts],
	);

	// Memoized derived data
	const aggregatedProjects = useMemo(() => {
		if (!api.projects.copy.length) return [];

		const groupedByMainProject = api.projects.copy.reduce((pv, cv) => {
			if (!pv[cv.main_project_name]) {
				pv[cv.main_project_name] = [];
			}

			if (!pv["All"]) {
				pv["All"] = [{ name: "All" }];
			}

			pv[cv.main_project_name].push(cv);
			return pv;
		}, {});

		return Object.keys(groupedByMainProject)
			.map((m) => ({ key: m, items: groupedByMainProject[m] }))
			.sort((a, b) => {
				if (a.key == "All") return -1;
				if (b.key == "All") return 1;

				return a.key.localeCompare(b.key);
			});
	}, [api.projects.copy]);

	// Setup cache for expensive data operations
	const dataCache = useMemo(
		() => ({
			projectDataCache: null,
			lastParams: {
				activeModuleName: "",
				filter: "",
				findText: "",
			},
		}),
		[],
	);

	const getSelectedProjectData = useCallback(() => {
		// Check if we can use cached data
		const currentParams = {
			activeModuleName: main.activeModule.name,
			filter: main.filter,
			findText: main.findText,
		};

		const paramsMatch = dataCache.lastParams.activeModuleName === currentParams.activeModuleName && dataCache.lastParams.filter === currentParams.filter && dataCache.lastParams.findText === currentParams.findText;

		if (dataCache.projectDataCache && paramsMatch) {
			return dataCache.projectDataCache;
		}

		// Otherwise compute the data
		let source = [];

		if (!api.projects.copy.length) return source;

		if (main.activeModule.name === "All") {
			source = api.projects.copy;
		} else {
			const moduleData = aggregatedProjects.find((f) => f.key === main.activeModule.name);
			source = moduleData?.items || [];
		}

		// Apply all filters
		const filtered = source.filter((project) => {
			let matchesTextFilter = true;
			let matchesStatusFilter = true;

			// Text filter logic
			if (main.findText) {
				if (Object.values(statuses).includes(main.findText)) {
					matchesTextFilter = project.status.includes(main.findText);
				} else if (main.findText === "Overdue") {
					matchesTextFilter = project.has_tasks_overdue;
				} else if (main.findText === "Today") {
					matchesTextFilter = project.has_tasks_due_today;
				} else if (main.findText === "Tomorrow") {
					matchesTextFilter = project.has_tasks_due_tomorrow;
				} else if (main.findText === "Upcoming") {
					matchesTextFilter = project.has_tasks_upcoming;
				} else {
					const findText = main.findText.toLowerCase();
					matchesTextFilter =
						String(project.id).toLowerCase().includes(findText) ||
						String(project.government_id || "")
							.toLowerCase()
							.includes(findText) ||
						String(project.client_id).toLowerCase().includes(findText) ||
						project.client_name.toLowerCase().includes(findText) ||
						project.company_name.toLowerCase().includes(findText) ||
						project.main_project_name.toLowerCase().includes(findText) ||
						project.sub_project_name.toLowerCase().includes(findText) ||
						String(project.team_names).toLowerCase().includes(findText) ||
						String(project.team_names_initials).toLowerCase().includes(findText) ||
						project.status.toLowerCase().includes(findText);
				}
			}

			// Status filter logic
			if (main.filter) {
				matchesStatusFilter = project.status === main.filter;
			}

			// Both filters must match
			return matchesTextFilter && matchesStatusFilter;
		});

		// Update cache
		dataCache.projectDataCache = filtered;
		dataCache.lastParams = { ...currentParams };

		return filtered;
	}, [api.projects.copy, main.activeModule.name, main.filter, main.findText, statuses, aggregatedProjects, dataCache]);

	const filteredProjects = useMemo(() => {
		return getSelectedProjectData();
	}, [getSelectedProjectData]);

	const sortedProjects = useMemo(() => {
		return filteredProjects.sort((a, b) => {
			const aStartedOn = new Date(a.started_on);
			const bStartedOn = new Date(b.started_on);

			const { column, isAscending } = main.sort;

			switch (true) {
				case column == tableHeaders.Started && isAscending:
					return aStartedOn - bStartedOn;
				case column == tableHeaders.Started && !isAscending:
					return bStartedOn - aStartedOn;
				case column == tableHeaders.GovermentId && isAscending:
					if (a.government_id) {
						return a.government_id.localeCompare(b.government_id);
					}
				case column == tableHeaders.GovermentId && !isAscending:
					if (b.government_id) {
						return b.government_id.localeCompare(a.government_id);
					}
				case column == tableHeaders.Client && isAscending:
					return a.client_name.localeCompare(b.client_name);
				case column == tableHeaders.Client && !isAscending:
					return b.client_name.localeCompare(a.client_name);
				case column == tableHeaders.Company && isAscending:
					return a.company_name.localeCompare(b.company_name);
				case column == tableHeaders.Company && !isAscending:
					return b.company_name.localeCompare(a.company_name);
				case column == tableHeaders.MainProject && isAscending:
					return a.main_project_name.localeCompare(b.main_project_name);
				case column == tableHeaders.MainProject && !isAscending:
					return b.main_project_name.localeCompare(a.main_project_name);
				case column == tableHeaders.SubProject && isAscending:
					return a.sub_project_name.localeCompare(b.sub_project_name);
				case column == tableHeaders.SubProject && !isAscending:
					return b.sub_project_name.localeCompare(a.sub_project_name);
				case column == tableHeaders.Status && isAscending:
					return a.status.localeCompare(b.status);
				case column == tableHeaders.Status && !isAscending:
					return b.status.localeCompare(a.status);
				default:
					return 0;
			}
		});
	}, [filteredProjects, main.sort, tableHeaders]);

	const projectStatusCounts = useMemo(() => calculateStatusCounts(filteredProjects), [filteredProjects, calculateStatusCounts]);

	const doExcelExport = useCallback(() => {
		const records = [];
		const _records = [];

		const columnsWidth = [];
		const dataHeaders = [];

		const rowHeight = 34;
		const headerHeight = 44;
		const maximumColumnWidth = 20;

		const headers = Object.values(tableHeaders);
		const blankRows = [{ span: headers.length, height: rowHeight, colSpan: 2 }];

		// Use the already sorted data to avoid re-sorting
		sortedProjects.forEach((project) => {
			const lastNote = api.notes
				.filter((f) => f.project_id == project.id)
				.sort((a, b) => b.id - a.id)
				.at(0);

			records.push(
				project.id,
				!project.government_id ? "" : project.government_id,
				project.client_id_and_name,
				project.company_name,
				project.main_project_name,
				project.sub_project_name,
				project.team_names,
				dayjs(project.due_on).format("DD MMM, YYYY"),
				`${dayjs(lastNote?.entry_date).format("hh:mm:ss A - DD MMM YYYY")}\n${lastNote?.content || ""}`,
				project.status,
			);
		});

		// Batch process records into _records
		records.forEach((record) => {
			_records.push({
				align: "center",
				alignVertical: "center",
				color: "#000000",
				height: rowHeight,
				type: String,
				value: String(record),
				wrap: true,
			});
		});

		// Batch process headers
		headers.forEach((header) => {
			dataHeaders.push({
				align: "center",
				alignVertical: "center",
				fontWeight: "bold",
				height: rowHeight,
				value: header,
				width: maximumColumnWidth,
			});

			columnsWidth.push({ width: maximumColumnWidth });
		});

		const separatedRowValues = MyGlobal.SeparateObjectsIntoArrays(_records, headers.length);
		const headerText = `${thisView} (${sortedProjects.length})`;

		const header = [
			{
				align: "center",
				alignVertical: "center",
				fontSize: 16,
				fontWeight: "bold",
				height: headerHeight,
				span: headers.length,
				value: headerText,
			},
		];

		const finalData = [header, blankRows, dataHeaders, ...separatedRowValues];

		writeXlsxFile(finalData, {
			fontFamily: "Segoe UI",
			fontSize: 9,
			columns: columnsWidth,
			fileName: `${thisView}.xlsx`,
		});
	}, [sortedProjects, api.notes, tableHeaders, thisView]);

	// UI Component Optimizations
	const getRowsCount = useCallback(() => {
		const filteredCount = filteredProjects.length;
		const totalCount = api.projects.copy.length;

		if (filteredCount !== totalCount) {
			return `${filteredCount} / ${totalCount}`;
		} else {
			return filteredCount;
		}
	}, [filteredProjects.length, api.projects.copy.length]);

	const getIconOrBadge = useCallback(() => {
		if (main.isLoading.supportData) {
			return (
				<span className="pl-5 relative">
					<Spinner />
				</span>
			);
		} else {
			return filteredProjects.length > 0 && <Badge value={getRowsCount()} />;
		}
	}, [main.isLoading.supportData, filteredProjects.length, getRowsCount]);

	// Memoized UI components
	const uiClearFilter = useCallback(() => {
		return <FontAwesomeIcon className="cursor-pointer outline-none focus:outline-none red-text" icon={faFilterCircleXmark} onClick={clearFilter} />;
	}, [clearFilter]);

	const uiExport = useCallback(() => {
		if (filteredProjects.length && api.projects.copy.length) {
			return (
				<button className="primary-button-transparent-background" onClick={doExcelExport}>
					<FontAwesomeIcon className="primary-text" icon={faFileExcel} />
				</button>
			);
		}
		return null;
	}, [filteredProjects.length, api.projects.copy.length, doExcelExport]);

	const uiFind = useCallback(() => {
		if (api.projects.copy.length) {
			return (
				<TextInputNative
					id="findBox"
					icon={faSearch}
					onChange={(e) => setInputs("findText", e.target.value)}
					onClearButtonClick={() => setInputs("findText", "")}
					placeholder="Find"
					showClearButton={showFindBoxClearButton}
					tabIndex={1}
					value={main.findText}
					width="w-60"
				/>
			);
		}
		return null;
	}, [api.projects.copy.length, main.findText, setInputs, showFindBoxClearButton]);

	const uiFilterMenuList = useMemo(() => {
		// Ensure we're showing the counts from the current filter state
		return Object.entries(main.revisedStatuses).map(([key, value], i) => {
			const isSelected = key == main.filter;
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
	}, [main.revisedStatuses, main.filter, setFilter]);

	const uiFilter = useCallback(() => {
		return (
			<Menu as="div" className="flex w-40 h-[30px] justify-center items-center relative rounded shadow contrast-background full-border">
				<MenuButton className="flex w-full h-[30px] px-2 justify-between items-center font-regular-10 gray-text">
					<span>{main.filter || "Status"}</span>
					<FontAwesomeIcon icon={faChevronDown} />
				</MenuButton>
				<MenuItems className="absolute w-full top-8 right-0 origin-top-right rounded z-50 contrast-background bottom-shadow full-border">{uiFilterMenuList}</MenuItems>
			</Menu>
		);
	}, [main.filter, uiFilterMenuList]);

	const uiHeaders = useCallback(() => {
		return Object.values(tableHeaders).map((header, i) => {
			const showArrow = header == main.sort.column ? "visible" : "invisible";
			const sortIcon = main.sort.isAscending ? faSortAmountDesc : faSortAmountAsc;

			return (
				<span className="w-[12.5%] space-x-1 cursor-pointer text-center text-white font-medium-10" onClick={() => setSort(header)} key={i}>
					<span>{header}</span>
					<span className={showArrow}>
						<FontAwesomeIcon className="text-white" icon={sortIcon} />
					</span>
				</span>
			);
		});
	}, [tableHeaders, main.sort.column, main.sort.isAscending, setSort]);

	const uiList = useCallback(() => {
		if (!api.projects.copy.length) return null;

		return aggregatedProjects.map((module, i) => {
			const style = module.key == main.activeModule.name ? "primary-border primary-background-transparent-01 primary-text" : "full-border bg-white black-text";

			const wrapper = `flex w-full px-4 py-2 justify-between items-center rounded shadow ${style} font-regular-10 hovered-rows`;

			return (
				<button className={wrapper} key={i} onClick={() => setModule(module)}>
					<span className="text-left">{module.key}</span>
					{module.key != "All" && module?.items?.length > 0 && <span className="font-regular-10 gray-text">{module.items.length}</span>}
				</button>
			);
		});
	}, [api.projects.copy.length, aggregatedProjects, main.activeModule.name, setModule]);

	// Toggle functions optimized with batched updates
	const toggleDeleteProjectBox = useCallback((project) => {
		const newProject = project ?? {};
		setMain((s) => ({
			...s,
			selectedProject: newProject,
		}));
		setMounted((s) => ({
			...s,
			deleteProject: Boolean(project),
		}));
	}, []);

	const toggleEditProjectView = useCallback((project) => {
		const newProject = project ?? {};
		setMain((s) => ({
			...s,
			selectedProject: newProject,
		}));
		setMounted((s) => ({
			...s,
			editProject: Boolean(project),
		}));
	}, []);

	const toggleEditStatusBox = useCallback((project) => {
		const newProject = project ?? {};
		setMain((s) => ({
			...s,
			selectedProject: newProject,
		}));
		setMounted((s) => ({
			...s,
			editStatus: Boolean(project),
		}));
	}, []);

	const toggleProjectStatusBox = useCallback((project) => {
		const newProject = project ?? {};
		setMain((s) => ({
			...s,
			selectedProject: newProject,
		}));
		setMounted((s) => ({
			...s,
			projectStatus: Boolean(project),
		}));
	}, []);

	const toggleSingleProjectView = useCallback((project) => {
		const newProject = project ?? {};
		setMain((s) => ({
			...s,
			selectedProject: newProject,
		}));
		setMounted((s) => ({
			...s,
			singleProject: Boolean(project),
		}));
	}, []);

	// Optimized row rendering logic
	const uiClientName = useCallback(
		(row, tooltipText) => {
			if (main.isLoading.selectedProject == row.id) {
				return <SpinnerSmall />;
			} else {
				const clientName = MyGlobal.HighlightText(row.client_name, main.findText);

				return (
					<Tippy allowHTML className="whitespace-pre-line" content={<Tooltip text={tooltipText} />} placement="bottom">
						<span dangerouslySetInnerHTML={{ __html: clientName }} onClick={() => toggleSingleProjectView(row)} />
					</Tippy>
				);
			}
		},
		[main.isLoading.selectedProject, main.findText, toggleSingleProjectView],
	);

	const uiTeamsTooltip = useCallback((badgeText, tooltipText) => {
		return (
			<Tippy content={<Tooltip text={tooltipText} />} placement="bottom" trigger="mouseenter" appendTo={() => document.body}>
				<span className="cursor-help">
					<BadgeSmall value={badgeText} />
				</span>
			</Tippy>
		);
	}, []);

	const uiTeamsListTooltip = useCallback((teams) => {
		const splitted = String(teams).split(",");

		return (
			<div className="flex flex-col w-full p-1 justify-between items-center font-regular-9">
				{!teams
					? "No teams involved"
					: splitted.map((m, i) => {
							const bottomBorder = i != splitted.length - 1 ? "bottom-border" : "border-transparent";
							const wrapper = `flex w-full justify-start items-center ${bottomBorder}`;

							return (
								<div className={wrapper} key={i}>
									{i + 1}. {m}
								</div>
							);
					  })}
			</div>
		);
	}, []);

	const uiTeams = useCallback(
		(row) => {
			const names = String(row.team_names);
			const singleUserInitials = row.team_names_initials;
			const total = names.split(",").length;

			if (names.includes(",")) {
				if (total > 2) {
					return (
						<Tippy content={uiTeamsListTooltip(names)} placement="bottom">
							<span className="cursor-help primary-text">{total}</span>
						</Tippy>
					);
				} else {
					return names.split(",").map((m, i) => <span key={i}>{uiTeamsTooltip(MyGlobal.GetInitials(m), m)}</span>);
				}
			} else {
				return uiTeamsTooltip(singleUserInitials, names);
			}
		},
		[uiTeamsListTooltip, uiTeamsTooltip],
	);

	const editStatus = useCallback(
		(project, status) => {
			const object = { ...project };
			object["new_status"] = status;

			if (status != statuses.Completed) {
				toggleEditStatusBox(object);
			} else {
				toggleProjectStatusBox(object);
			}
		},
		[statuses, toggleEditStatusBox, toggleProjectStatusBox],
	);

	const uiStatusMenuList = useCallback(
		(row) => {
			return Object.values(statuses).map((status, i) => {
				const isSelected = status == row.status;
				const aesthetics = isSelected ? "primary-background-transparent-01 primary-text" : "contrast-background black-text";
				const wrapper = `flex w-full p-2 space-x-2.5 justify-between items-center cursor-pointer border-y ${aesthetics} hovered-rows`;

				return (
					<MenuItem as="div" className={wrapper} key={i} onClick={() => editStatus(row, status)}>
						<span className="font-regular-11">{status}</span>
						{isSelected && <FontAwesomeIcon className="primary-text" icon={faCheck} />}
					</MenuItem>
				);
			});
		},
		[statuses, editStatus],
	);

	const uiStatusMenu = useCallback(
		(row) => {
			const isCompleted = row.status == statuses.Completed;
			const wrapper = `flex w-full px-4 justify-between items-center focus:outline-none font-regular-11 !py-0`;

			return (
				<Menu as="div" className="flex w-24 justify-center items-center relative">
					<MenuButton className={wrapper}>
						{isCompleted && <FontAwesomeIcon className="green-text mr-1.5" icon={faCheckCircle} />}
						<span dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(row.status, main.findText) }} />
						{!isCompleted && <FontAwesomeIcon icon={faChevronDown} />}
					</MenuButton>
					{(!isCompleted || isUserAdministrator) && (
						<MenuItems className="absolute w-full top-7 right-0 origin-top-right rounded focus:outline-none z-50 contrast-background bottom-shadow full-border">{uiStatusMenuList(row)}</MenuItems>
					)}
				</Menu>
			);
		},
		[statuses, main.findText, isUserAdministrator, uiStatusMenuList],
	);

	const uiRows = useCallback(
		(row) => {
			const style = `flex w-[12.5%] min-h-9 justify-center items-center text-center`;

			const governmentId = MyGlobal.HighlightText(row.government_id ?? "", main.findText);
			const governmentIdTextColour = !row.government_id ? "gray-text" : "primary-text";

			const clientIdAndName = [`Client ID - ${row.client_id}`, <br key="br" />, `Project ID - ${row.id}`];
			const companyName = MyGlobal.HighlightText(row.company_name, main.findText);

			const mainProjectName = MyGlobal.HighlightText(row.main_project_name, main.findText);
			const subProjectName = MyGlobal.HighlightText(row.sub_project_name, main.findText);

			const background = row.status == statuses.Completed ? "green-background-transparent-01" : "contrast-background";

			const wrapper = `flex w-full justify-center items-center ${background} bottom-border font-regular-11 black-text`;

			// Optimize Tippy usage - only show Tippy when needed
			const handleMouseEnter = () => setMouseEnter(row.id);

			return (
				<div className={wrapper} key={row.id} onMouseEnter={handleMouseEnter} onMouseLeave={setMouseLeave}>
					<div className={`${style} cursor-help primary-text`}>
						{/* Lazy Tippy only renders when hovered */}
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
							appendTo={() => document.body} // Attach to body to reduce reflows
						>
							<span>{dayjs(row.started_on).format("DD MMM, YYYY")}</span>
						</Tippy>
					</div>

					<span className={`${style} wrap-text ${governmentIdTextColour}`} dangerouslySetInnerHTML={{ __html: governmentId || "NA" }} />

					<span className={`${style} space-x-5 cursor-pointer relative primary-text`}>{uiClientName(row, clientIdAndName)}</span>

					<span className={style} dangerouslySetInnerHTML={{ __html: companyName }} />
					<span className={style} dangerouslySetInnerHTML={{ __html: mainProjectName }} />

					<Tippy content={<Tooltip text={`Remarks ${row.remarks}`} />} placement="bottom" trigger="mouseenter" appendTo={() => document.body}>
						<span className={style} dangerouslySetInnerHTML={{ __html: subProjectName }} />
					</Tippy>

					<span className={`${style} space-x-1`}>{uiTeams(row)}</span>
					<span className={style}>{uiStatusMenu(row)}</span>
				</div>
			);
		},
		[main.findText, statuses, allowDeletingProject, setMouseEnter, setMouseLeave, toggleDeleteProjectBox, toggleEditProjectView, uiClientName, uiTeams, uiStatusMenu],
	);

	const uiBody = useCallback(() => {
		return (
			<div className="flex w-full h-full justify-center items-start">
				<div className="flex flex-col w-[10%] space-y-2.5 mx-5 justify-start items-center">{uiList()}</div>
				<div className="flex flex-col w-[90%] h-full mr-5 justify-start items-center">
					<div className="flex flex-col w-full h-full justify-center items-start full-border">
						<div className="flex w-full h-9 justify-center items-center primary-background">{uiHeaders()}</div>
						<Virtuoso
							className="w-full h-full overflow-y-auto bottom-border contrast-background"
							data={sortedProjects}
							itemContent={(i, row) => uiRows(row)}
							totalCount={sortedProjects.length}
							// overscan={200}
							// fixedItemHeight={36}
							// increaseViewportBy={{ top: 400, bottom: 400 }}
							// components={{
							// 	ScrollSeekPlaceholder: ({ index }) => {
							// 		// Create placeholder that matches the real content's appearance
							// 		const background = index % 2 === 0 ? "contrast-background" : "gray-background-transparent-01";
							// 		return (
							// 			<div className={`flex w-full h-9 justify-center items-center ${background} bottom-border`}>
							// 				{Array(8)
							// 					.fill(0)
							// 					.map((_, i) => (
							// 						<div key={i} className="flex w-[12.5%] h-full justify-center items-center">
							// 							<div className="w-3/4 h-4 rounded bg-gray-200"></div>
							// 						</div>
							// 					))}
							// 			</div>
							// 		);
							// 	},
							// }}
							// scrollSeekConfiguration={{
							// 	enter: (velocity) => Math.abs(velocity) > 800, // Higher threshold to avoid triggering too easily
							// 	exit: (velocity) => Math.abs(velocity) < 50, // Higher exit threshold
							// 	change: () => null, // Don't show placeholders on small position changes
							// 	items: 5, // How many items to render during fast scrolling
							// }}
							// itemKey={(index) => sortedProjects[index].id}
						/>
					</div>
				</div>
			</div>
		);
	}, [uiList, uiHeaders, sortedProjects, uiRows]);

	const uiMain = useCallback(() => {
		if (main.isLoading.supportData) {
			return (
				<div className={blankDataWrapper}>
					<span className="font-regular-12 gray-text">Loading Projects ...</span>
				</div>
			);
		} else if (!filteredProjects.length && api.projects.copy.length) {
			return (
				<div className={blankDataWrapper}>
					<span className="font-regular-12 gray-text">No projects found.</span>
				</div>
			);
		} else if (!filteredProjects.length && !api.projects.copy.length) {
			return (
				<div className={blankDataWrapper}>
					<span className="font-regular-12 gray-text">No projects created.</span>
				</div>
			);
		} else if (mounted.editProject) {
			return <EditProject project={main.selectedProject} reload={setSupportData} unmount={toggleEditProjectView} />;
		} else if (mounted.singleProject) {
			return <SingleProject client={main.selectedClient} project={main.selectedProject} reload={setSupportData} source="Single Project" unmount={toggleSingleProjectView} />;
		} else {
			return uiBody();
		}
	}, [
		main.isLoading.supportData,
		filteredProjects.length,
		api.projects.copy.length,
		mounted.editProject,
		mounted.singleProject,
		main.selectedProject,
		main.selectedClient,
		setSupportData,
		toggleEditProjectView,
		toggleSingleProjectView,
		uiBody,
		blankDataWrapper,
	]);

	// Hooks
	useEffect(() => {
		// Delay the initial data loading to ensure component is fully mounted
		const initializationDelay = setTimeout(() => {
			setSupportData();
		}, 100);

		window.addEventListener("keydown", autoFocusFindBox);

		return () => {
			clearTimeout(initializationDelay);
			setModuleProps("projectsOrTasks", "");
			window.removeEventListener("keydown", autoFocusFindBox);

			// Clean up search timeout on unmount
			if (window.searchTimeout) {
				clearTimeout(window.searchTimeout);
			}
		};
	}, [setSupportData, autoFocusFindBox, setModuleProps]);

	// Use debouncedFindText in useEffect
	useEffect(() => {
		if (mounted.mainComponent) {
			const source = main.activeModule.name === "All" ? api.projects.copy : main.activeModule.items || [];

			// First, calculate status counts based on text filter ONLY
			// This updates the counts shown in the status filter menu
			if (debouncedFindText) {
				const textFilteredData = source.filter((project) => {
					if (Object.values(statuses).includes(debouncedFindText)) {
						return project.status.includes(debouncedFindText);
					} else if (debouncedFindText === "Overdue") {
						return project.has_tasks_overdue;
					} else if (debouncedFindText === "Today") {
						return project.has_tasks_due_today;
					} else if (debouncedFindText === "Tomorrow") {
						return project.has_tasks_due_tomorrow;
					} else if (debouncedFindText === "Upcoming") {
						return project.has_tasks_upcoming;
					} else {
						const findText = debouncedFindText.toLowerCase();
						return (
							String(project.id).toLowerCase().includes(findText) ||
							String(project.government_id || "")
								.toLowerCase()
								.includes(findText) ||
							String(project.client_id).toLowerCase().includes(findText) ||
							project.client_name.toLowerCase().includes(findText) ||
							project.company_name.toLowerCase().includes(findText) ||
							project.main_project_name.toLowerCase().includes(findText) ||
							project.sub_project_name.toLowerCase().includes(findText) ||
							String(project.team_names).toLowerCase().includes(findText) ||
							String(project.team_names_initials).toLowerCase().includes(findText) ||
							project.status.toLowerCase().includes(findText)
						);
					}
				});

				// Update status counts to reflect text-filtered data
				const revisedStatuses = calculateStatusCounts(textFilteredData);
				setMain((s) => ({ ...s, revisedStatuses }));
			} else {
				// If no text filter, update counts based on module data
				const revisedStatuses = calculateStatusCounts(source);
				setMain((s) => ({ ...s, revisedStatuses }));
			}

			// Now, apply both filters for the actual displayed data
			const filteredData = source.filter((project) => {
				let matchesTextFilter = true;
				let matchesStatusFilter = true;

				// Text filter logic
				if (debouncedFindText) {
					if (Object.values(statuses).includes(debouncedFindText)) {
						matchesTextFilter = project.status.includes(debouncedFindText);
					} else if (debouncedFindText === "Overdue") {
						matchesTextFilter = project.has_tasks_overdue;
					} else if (debouncedFindText === "Today") {
						matchesTextFilter = project.has_tasks_due_today;
					} else if (debouncedFindText === "Tomorrow") {
						matchesTextFilter = project.has_tasks_due_tomorrow;
					} else if (debouncedFindText === "Upcoming") {
						matchesTextFilter = project.has_tasks_upcoming;
					} else {
						const findText = debouncedFindText.toLowerCase();
						matchesTextFilter =
							String(project.id).toLowerCase().includes(findText) ||
							String(project.government_id || "")
								.toLowerCase()
								.includes(findText) ||
							String(project.client_id).toLowerCase().includes(findText) ||
							project.client_name.toLowerCase().includes(findText) ||
							project.company_name.toLowerCase().includes(findText) ||
							project.main_project_name.toLowerCase().includes(findText) ||
							project.sub_project_name.toLowerCase().includes(findText) ||
							String(project.team_names).toLowerCase().includes(findText) ||
							String(project.team_names_initials).toLowerCase().includes(findText) ||
							project.status.toLowerCase().includes(findText);
					}
				}

				// Status filter logic
				if (main.filter) {
					matchesStatusFilter = project.status === main.filter;
				}

				// Both filters must match
				return matchesTextFilter && matchesStatusFilter;
			});

			setApi((prev) => ({
				...prev,
				projects: {
					...prev.projects,
					data: filteredData,
				},
			}));
		}
	}, [debouncedFindText, main.filter, main.activeModule, api.projects.copy, mounted.mainComponent, statuses, calculateStatusCounts]);

	// Add a windowed approach for list rendering
	useEffect(() => {
		// Add passive event listeners for scroll events
		const scrollElements = document.querySelectorAll(".overflow-y-auto");
		scrollElements.forEach((element) => {
			element.addEventListener("scroll", null, { passive: true });
		});

		return () => {
			scrollElements.forEach((element) => {
				element.removeEventListener("scroll", null);
			});
		};
	}, []);

	// Main UI render with optimized components
	return mounted.myProjects ? (
		<MyProjects presetStatus={presetStatus} setModuleProps={setModuleProps} unmount={closeMyProjects} />
	) : (
		<div className="flex flex-col w-full h-full justify-start items-center">
			<>
				{!mounted.editProject && !mounted.singleProject && (
					<div className="flex w-full px-5 py-2.5 justify-between items-center">
						<div className="flex w-1/3 space-x-2 justify-start items-center">
							<span className="view-heading">{thisView}</span>
							{getIconOrBadge()}
						</div>
						<div className="flex w-1/3 space-x-5 justify-center items-center">
							{uiFind()}
							{uiFilter()}

							<Tippy content={<Tooltip text={`Clear filters of ${main.activeModule.name}`} />} placement="bottom">
								{uiClearFilter()}
							</Tippy>
						</div>
						<div className="flex w-1/3 justify-end items-center">{uiExport()}</div>
					</div>
				)}
				{uiMain()}
			</>

			{mounted.deleteProject && <DeleteProject mount={mounted.deleteProject} projectId={main.selectedProject.id} reload={setSupportData} unmount={toggleDeleteProjectBox} />}

			{mounted.editStatus && <EditStatus mount={mounted.editStatus} project={main.selectedProject} reload={setSupportData} unmount={toggleEditStatusBox} />}

			{mounted.projectStatus && <ProjectStatus mount={mounted.projectStatus} project={main.selectedProject} reload={setSupportData} unmount={toggleProjectStatusBox} />}
		</div>
	);
}
