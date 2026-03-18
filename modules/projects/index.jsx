"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import Tippy from "@tippyjs/react";
import EditProject from "./EditProject";
import writeXlsxFile from "write-excel-file/browser";
import SingleProject from "../singleProject";
import MyConstants from "@/utilities/constants";
import ProjectTodos from "@/modals/projects/Todo";

import { Virtuoso } from "react-virtuoso";
import { TextInputNative } from "@/components/Inputs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { EditStatus, DeleteProject, ProjectStatus } from "@/modals/projects/miscellaneous";
import { AvatarCircle, Badge, BadgeSmall, Spinner, SpinnerSmall, Tooltip } from "@/components/Elements";
import { MyGlobal } from "@/utilities/global";
import { faCheck, faCheckCircle, faChevronDown, faFileExcel, faFilter, faFilterCircleXmark, faIndianRupee, faListUl, faPencil, faPlaneUp, faSearch, faSortAmountAsc, faSortAmountDesc, faTrash, faUserAlt } from "@fortawesome/free-solid-svg-icons";

export default function Projects({ presetStatus, setModuleProps }) {
	// Business Logic
	const currentScrollPositionReference = useRef(null);
	const rangeChangeTimeoutReference = useRef(null);
	const goToTopAnimationFrameReference = useRef(null);
	const currentTopIndexReference = useRef(0);
	const showGoToTopReference = useRef(false);

	const [api, setApi] = useState({
		notes: [],
		projects: { data: [], copy: [] },
	});
	const [showGoToTopOrb, setShowGoToTopOrb] = useState(false);

	const [main, setMain] = useState({
		activeModule: { items: [], name: "All" },
		dueDate: { from: "", to: "" },
		filter: presetStatus ? String(presetStatus).replace("MySpace", "") : "Active",
		findText: "",
		isLoading: { selectedProject: false, supportData: false },
		revisedStatuses: {},
		selectedClient: {},
		selectedProject: {},
		selectedStaff: { fullName: "", id: "", type: "" },
		showIconButton: { deleteProject: 0, editProject: 0 },
		sort: { column: "ID", isAscending: false },
	});

	const [mounted, setMounted] = useState({
		deleteProject: false,
		editProject: false,
		editStatus: false,
		mainComponent: false,
		projectStatus: false,
		singleProject: false,
		todo: false,
	});

	const today = useMemo(() => dayjs(), []);
	const statuses = MyConstants.Statuses.Projects2;
	const thisView = MyConstants.Modules.Base.Projects;
	const tableHeaders = MyConstants.TableHeaders.Projects2;
	const isUserAdministrator = MyGlobal.IsUserAdministrator();

	const allowDeletingProject = useMemo(() => MyGlobal.HasPermission(MyConstants.Modules.Derived.DeleteProject), []);
	const allowEditingProject = useMemo(() => MyGlobal.HasPermission(MyConstants.Modules.Derived.EditProject), []);

	const showFindBoxClearButton = main.findText ? "cursor-pointer primary-text" : "hidden";
	const blankDataWrapper = "flex w-full h-full justify-center items-center contrast-background full-border";

	// Add debounce for search function
	const [debouncedFindText, setDebouncedFindText] = useState("");

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
				[statuses.Overdue]: 0,
				[statuses.Today]: 0,
				[statuses.Tomorrow]: 0,
				[statuses.Upcoming]: 0,
			};

			projectsList.forEach((fe) => {
				if (counts.hasOwnProperty(fe.status)) {
					counts[fe.status]++;
				}

				if (fe.has_tasks_overdue) {
					counts.Overdue++;
				}

				if (fe.has_tasks_due_today) {
					counts.Today++;
				}

				if (fe.has_tasks_due_tomorrow) {
					counts.Tomorrow++;
				}

				if (fe.has_tasks_upcoming) {
					counts.Upcoming++;
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
				selectedStaff: { fullName: "", id: "", type: "" },
			}));
		} else {
			// If no text filter, just use the entire source
			const revisedStatuses = calculateStatusCounts(source);

			setMain((s) => ({
				...s,
				filter: "",
				revisedStatuses,
				selectedStaff: { fullName: "", id: "", type: "" },
			}));
		}
	}, [api.projects.copy, main.activeModule, main.findText, calculateStatusCounts]);

	const setMouseEnter = useCallback(
		(projectId) => {
			if (allowDeletingProject) {
				setMain((s) => ({
					...s,
					showIconButton: { ...s.showIconButton, deleteProject: projectId },
				}));
			}

			if (allowEditingProject) {
				setMain((s) => ({
					...s,
					showIconButton: { ...s.showIconButton, editProject: projectId },
				}));
			}
		},
		[allowDeletingProject, allowEditingProject],
	);

	const setMouseLeave = useCallback(() => {
		setMain((s) => ({
			...s,
			showIconButton: { deleteProject: 0, editProject: 0 },
		}));
	}, []);

	const setSort = useCallback((column) => {
		setMain((s) => ({
			...s,
			sort: { column, isAscending: !s.sort.isAscending },
		}));
	}, []);

	function handleRangeChange(range) {
		currentTopIndexReference.current = range.startIndex;

		const shouldShowGoToTop = range.startIndex > 12;

		if (showGoToTopReference.current !== shouldShowGoToTop) {
			showGoToTopReference.current = shouldShowGoToTop;
			setShowGoToTopOrb(shouldShowGoToTop);
		}

		if (rangeChangeTimeoutReference.current) {
			clearTimeout(rangeChangeTimeoutReference.current);
		}

		rangeChangeTimeoutReference.current = setTimeout(() => {
			localStorage.setItem("projectsScrollPosition", String(range.startIndex));
		}, 150);
	}

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
			setMain((s) => ({
				...s,
				isLoading: { ...s.isLoading, supportData: true },
			}));

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

					const isSingleUser = String(presetStatus).includes("MySpace");

					const source = response.data.projects.filter((f) => {
						if (isSingleUser) return String(f.teams).includes(MyGlobal.GetUserId()) || f.entry_by_id === MyGlobal.GetUserId();
						return f;
					});

					const revised = source.map((project) => {
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

						projectTasks.forEach((t) => {
							reimburseVoucher += Number(t.expense);
							const tasksDueDate = dayjs(t.due_on);

							if (tasksDueDate.isBefore(today, "date")) {
								if (project.status == statuses.Active) {
									hasTasksOverdue = true;
								}
							}
							if (tasksDueDate.isSame(today, "date")) {
								if (t.is_disabled === 0 && t.is_completed === 0) hasTasksDueToday = true;
							}
							if (tasksDueDate.isSame(today.add(1, "day"), "date")) {
								if (t.is_disabled === 0 && t.is_completed === 0) hasTasksDueTomorrow = true;
							}
							if (tasksDueDate.isAfter(today.add(1, "day"), "date")) {
								if (t.is_disabled === 0 && t.is_completed === 0) hasTasksUpcoming = true;
							}
						});

						const todos = response.data.todos.filter((f) => project.id === f.project_id);

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
							todos,
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
				setMain((s) => ({
					...s,
					isLoading: { ...s.isLoading, supportData: false },
				}));
			}
		},
		[today, calculateStatusCounts, thisView],
	);

	const setModule = useCallback(
		(module) => {
			// Since aggregatedProjects now contains pre-filtered data,
			// we can use it directly without additional filtering
			const source = module.items || [];
			const revisedStatuses = calculateStatusCounts(source);

			// Update the state with our new module and status counts
			setMain((s) => ({
				...s,
				activeModule: { items: module?.items, name: module?.key },
				revisedStatuses,
			}));
		},
		[calculateStatusCounts],
	);

	// Memoized derived data
	const aggregatedProjects = useMemo(() => {
		if (!api.projects.copy.length) return [];

		// First, pre-filter data if we have a search/filter term from the dashboard
		let filteredCopy = [...api.projects.copy];

		// Apply any text/filter criteria from dashboard before grouping
		if (main.findText) {
			if (Object.values(statuses).includes(main.findText)) {
				// Handle status filters
				filteredCopy = filteredCopy.filter((project) => project.status.includes(main.findText));
			} else if (main.findText === "Overdue" || presetStatus === "Overdue") {
				filteredCopy = filteredCopy.filter((project) => project.has_tasks_overdue);
			} else if (main.findText === "Today" || presetStatus === "Today") {
				filteredCopy = filteredCopy.filter((project) => project.has_tasks_due_today);
			} else if (main.findText === "Tomorrow" || presetStatus === "Tomorrow") {
				filteredCopy = filteredCopy.filter((project) => project.has_tasks_due_tomorrow);
			} else if (main.findText === "Upcoming" || presetStatus === "Upcoming") {
				filteredCopy = filteredCopy.filter((project) => project.has_tasks_upcoming);
			} else {
				// Handle text search filters
				const findText = main.findText.toLowerCase();
				filteredCopy = filteredCopy.filter(
					(project) =>
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
						project.status.toLowerCase().includes(findText),
				);
			}
		}

		// Now group the already filtered data by main project
		const groupedByMainProject = filteredCopy.reduce((pv, cv) => {
			if (!pv[cv.main_project_name]) {
				pv[cv.main_project_name] = [];
			}

			if (!pv["All"]) {
				pv["All"] = [];
			}

			pv[cv.main_project_name].push(cv);
			pv["All"].push(cv);
			return pv;
		}, {});

		return Object.keys(groupedByMainProject)
			.map((m) => ({ key: m, items: groupedByMainProject[m] }))
			.sort((a, b) => {
				if (a.key == "All") return -1;
				if (b.key == "All") return 1;

				return a.key.localeCompare(b.key);
			});
	}, [api.projects.copy, main.findText, statuses]);

	const getSelectedProjectData = useCallback(() => {
		let source = [];

		if (!api.projects.copy.length) return source;

		if (main.activeModule.name === "All") {
			source = api.projects.copy;
		} else {
			const moduleData = aggregatedProjects.find((f) => f.key === main.activeModule.name);
			source = moduleData?.items || [];
		}

		// Apply all filters
		const filtered = source.filter((f) => {
			let matchesTextFilter = true;
			let matchesStatusFilter = true;
			let matchesTeamFilter = true;

			// Text filter logic
			if (main.findText) {
				if (Object.values(statuses).includes(main.findText)) {
					matchesTextFilter = f.status.includes(main.findText);
				} else if (main.findText === "Overdue" || presetStatus === "Overdue") {
					// Important: This filter is coming from the dashboard
					matchesTextFilter = f.has_tasks_overdue;
				} else if (main.findText === "Today" || presetStatus === "Today") {
					matchesTextFilter = f.has_tasks_due_today;
				} else if (main.findText === "Tomorrow" || presetStatus === "Tomorrow") {
					matchesTextFilter = f.has_tasks_due_tomorrow;
				} else if (main.findText === "Upcoming" || presetStatus === "Upcoming") {
					matchesTextFilter = f.has_tasks_upcoming;
				} else {
					const findText = main.findText.toLowerCase();
					matchesTextFilter =
						String(f.id).toLowerCase().includes(findText) ||
						String(f.government_id || "")
							.toLowerCase()
							.includes(findText) ||
						String(f.client_id).toLowerCase().includes(findText) ||
						f.client_name.toLowerCase().includes(findText) ||
						f.company_name.toLowerCase().includes(findText) ||
						f.main_project_name.toLowerCase().includes(findText) ||
						f.sub_project_name.toLowerCase().includes(findText) ||
						String(f.team_names).toLowerCase().includes(findText) ||
						String(f.team_names_initials).toLowerCase().includes(findText) ||
						f.status.toLowerCase().includes(findText);
				}
			}

			// Status filter logic
			if (main.filter) {
				if ([statuses.Overdue, statuses.Today, statuses.Tomorrow, statuses.Upcoming].includes(main.filter)) {
					if (main.filter === statuses.Overdue) {
						matchesStatusFilter = f.has_tasks_overdue;
					} else if (main.filter === statuses.Today) {
						matchesStatusFilter = f.has_tasks_due_today;
					} else if (main.filter === statuses.Tomorrow) {
						matchesStatusFilter = f.has_tasks_due_tomorrow;
					} else if (main.filter === statuses.Upcoming) {
						matchesStatusFilter = f.has_tasks_upcoming;
					}
				} else {
					matchesStatusFilter = f.status === main.filter;
				}
			}

			// Team filter logic
			if (main.selectedStaff.id) {
				if (main.selectedStaff.type === "Assigned alone") {
					matchesTeamFilter = f.teams === main.selectedStaff.id && f.status === statuses.Active;
				} else {
					matchesStatusFilter = String(f.teams).split(",").includes(main.selectedStaff.id) && f.status === statuses.Active;
				}
			}

			// Both filters must match
			return matchesTextFilter && matchesStatusFilter && matchesTeamFilter;
		});

		return filtered;
	}, [api.projects.copy, main.activeModule.name, main.filter, main.findText, statuses, main.selectedStaff, aggregatedProjects]);

	const filteredProjects = useMemo(() => {
		return getSelectedProjectData();
	}, [getSelectedProjectData]);

	const sortedProjects = useMemo(() => {
		return [...filteredProjects].sort((a, b) => {
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

			records.push(project.id, !project.government_id ? "" : project.government_id, project.client_id_and_name, project.company_name, project.main_project_name, project.sub_project_name, project.team_names, dayjs(project.due_on).format("DD MMM, YYYY"), `${dayjs(lastNote?.entry_date).format("hh:mm:ss A - DD MMM YYYY")}\n${lastNote?.content || ""}`, project.status);
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
			return <TextInputNative id="findBox" icon={faSearch} onChange={(e) => setInputs("findText", e.target.value)} onClearButtonClick={() => setInputs("findText", "")} placeholder="Find" showClearButton={showFindBoxClearButton} tabIndex={1} value={main.findText} width="w-40" />;
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
			<Menu as="div" className="flex w-40 h-7.5 justify-center items-center relative rounded shadow contrast-background full-border">
				<MenuButton className="flex w-full h-7.5 px-2 justify-between items-center font-regular-10 gray-text">
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
				<span className="w-[16.66%] space-x-1 cursor-pointer text-center text-white font-medium-10" onClick={() => setSort(header)} key={i}>
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

	function toggleTodoBox(project) {
		const newProject = project ?? {};
		setMain((s) => ({
			...s,
			selectedProject: newProject,
		}));
		setMounted((s) => ({
			...s,
			todo: Boolean(project),
		}));
	}

	function setStaff(obj) {
		setMain((s) => ({
			...s,
			selectedStaff: {
				...s.selectedStaff,
				fullName: obj.full_name,
				id: obj.id,
			},
		}));
	}

	function setStaffType(value) {
		setMain((s) => ({
			...s,
			selectedStaff: { ...s.selectedStaff, type: value },
		}));
	}

	function uiStaff() {
		const wrapper = "flex max-w-full min-w-40 h-[30px] px-2.5 space-x-2 justify-start items-center focus:outline-none relative z-40 rounded bottom-shadow contrast-background full-border font-regular-10";

		return (
			<Menu as="div" className="flex max-w-full min-w-40 justify-center items-center relative">
				<MenuButton className={wrapper}>
					<FontAwesomeIcon className="primary-text" icon={faUserAlt} />
					<span className="gray-text">{main.selectedStaff.fullName || "Team"}</span>
				</MenuButton>
				<MenuItems className="absolute w-full top-8 right-0 origin-top-right rounded contrast-background bottom-shadow focus:outline-none z-50 full-border">{uiStaffList()}</MenuItems>
			</Menu>
		);
	}

	function uiStaffList() {
		return MyGlobal.GetAllUsers().map((m, i) => {
			const isSelected = m.id === main.selectedStaff.id;
			const aesthetics = isSelected ? "primary-background-transparent-01 primary-text" : "contrast-background black-text";
			const wrapper = `flex w-full p-2 space-x-2.5 justify-start items-center cursor-pointer border-y ${aesthetics} font-regular-10 text-left hovered-rows`;

			return (
				<MenuItem as="div" className={wrapper} key={i} onClick={() => setStaff(m)}>
					<span>{m.full_name}</span>
				</MenuItem>
			);
		});
	}

	function uiStaffAdvanced() {
		const wrapper = "flex max-w-full min-w-40 h-[30px] px-2.5 space-x-2 justify-start items-center focus:outline-none relative z-40 rounded bottom-shadow contrast-background full-border font-regular-10";

		return (
			<Menu as="div" className="flex max-w-full min-w-40 justify-center items-center relative">
				<MenuButton className={wrapper}>
					<FontAwesomeIcon className="primary-text" icon={faFilter} />
					<span className="gray-text">{main.selectedStaff.type || "Type"}</span>
				</MenuButton>
				<MenuItems className="absolute w-full top-8 right-0 origin-top-right rounded contrast-background bottom-shadow focus:outline-none z-50 full-border">{uiStaffListAdvanced()}</MenuItems>
			</Menu>
		);
	}

	function uiStaffListAdvanced() {
		return ["Assigned alone", "Assigned with team"].map((m, i) => {
			const isSelected = m === main.selectedStaff.type;
			const aesthetics = isSelected ? "primary-background-transparent-01 primary-text" : "contrast-background black-text";
			const wrapper = `flex w-full p-2 space-x-2.5 justify-start items-center cursor-pointer border-y ${aesthetics} font-regular-10 text-left hovered-rows`;

			return (
				<MenuItem as="div" className={wrapper} key={i} onClick={() => setStaffType(m)}>
					<span>{m}</span>
				</MenuItem>
			);
		});
	}

	// Optimized row rendering logic
	const uiClientName = useCallback(
		(row, tooltipText) => {
			if (main.isLoading.selectedProject == row.id) {
				return <SpinnerSmall />;
			}
			const clientName = MyGlobal.HighlightText(row.client_name, main.findText);
			const textColour = getStatusSeverityBackground(row.status);

			return (
				<Tippy allowHTML className={`whitespace-pre-line`} content={<Tooltip text={tooltipText} />} placement="bottom">
					<span className={textColour} dangerouslySetInnerHTML={{ __html: clientName }} onClick={() => toggleSingleProjectView(row)} />
				</Tippy>
			);
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

	function getStatusSeverity(status) {
		switch (status) {
			case statuses.Active:
				return "orange-tag-transparent-01";
			case statuses.Closed:
			case statuses.Cancelled:
				return "gray-tag-transparent-01";
			case statuses.Hold:
				return "red-tag-transparent-02";
			case statuses.Completed:
				return "green-tag-transparent-01 cursor-pointer";
			default:
				return "orange-tag-transparent-01";
		}
	}

	const uiStatusMenuList = useCallback(
		(row) => {
			return Object.values(MyConstants.Statuses.Projects).map((status, i) => {
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
			const isCompleted = row.status === statuses.Completed;
			const wrapper = `flex w-full px-4 space-x-2 justify-between items-center focus:outline-none font-regular-12 ${getStatusSeverity(row.status)}`;

			return (
				<Menu as="div" className="flex w-fit justify-center items-center relative">
					<MenuButton className={wrapper}>
						{isCompleted && <FontAwesomeIcon className="green-text" icon={faCheckCircle} />}
						<span
							dangerouslySetInnerHTML={{
								__html: MyGlobal.HighlightText(row.status, main.findText),
							}}
						/>
						{!isCompleted && <FontAwesomeIcon icon={faChevronDown} />}
					</MenuButton>
					{(!isCompleted || isUserAdministrator) && <MenuItems className="absolute w-full top-9 right-0 origin-top-right rounded focus:outline-none z-50 contrast-background bottom-shadow full-border">{uiStatusMenuList(row)}</MenuItems>}
				</Menu>
			);
		},
		[statuses, main.findText, isUserAdministrator, uiStatusMenuList],
	);

	function getStatusSeverityBackground(status) {
		switch (status) {
			case statuses.Active:
				return "orange-text";
			case statuses.Closed:
			case statuses.Cancelled:
				return "gray-text";
			case statuses.Hold:
				return "red-text";
			case statuses.Completed:
				return "green-text";
			default:
				return "orange-background";
		}
	}

	function getStatusSeverityBackground2(status) {
		switch (status) {
			case statuses.Active:
				return "orange-background";
			case statuses.Closed:
			case statuses.Cancelled:
				return "gray-background";
			case statuses.Hold:
				return "red-background";
			case statuses.Completed:
				return "green-background";
			default:
				return "orange-background";
		}
	}

	const uiRows = useCallback(
		(row) => {
			const style = `flex flex-col w-[16.66%] justify-center items-center text-center`;
			const childStyle = "flex w-full justify-center items-center";

			const parentLabelStyle = childStyle + " font-bold-12";
			const childLabelStyle = childStyle + " gray-text";

			const fancyRightBorderStyle = "absolute w-3 h-[50px] rounded-tr-full rounded-br-full " + getStatusSeverityBackground2(row.status) + " -left-1";

			const governmentId = MyGlobal.HighlightText(row.government_id ?? "", main.findText);

			const clientIdAndName = [`Client ID - ${row.client_id}`, <br key="br" />, `Project ID - ${row.id}`];
			const companyName = MyGlobal.HighlightText(row.company_name, main.findText);

			const mainProjectName = MyGlobal.HighlightText(row.main_project_name, main.findText);
			const subProjectName = MyGlobal.HighlightText(row.sub_project_name, main.findText);

			const background = row.status == statuses.Completed ? "green-background-transparent-01" : "contrast-background";

			const wrapper = `flex w-full py-3 justify-center items-center ${background} bottom-border font-regular-11 black-text`;

			const admins = row.teams_data.filter((f) => f.role === "Administrator").map((m) => m.full_name);
			const teams = row.teams_data.filter((f) => f.role !== "Administrator").map((m) => m.full_name);

			const spaceX = admins.length && teams.length ? "space-x-2.5" : "space-x-0";
			const avatarWrapper = style + " !flex-row " + spaceX;

			const handleMouseEnter = () => setMouseEnter(row.id);

			return (
				<div className={wrapper} key={row.id} onMouseEnter={handleMouseEnter} onMouseLeave={setMouseLeave}>
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
							<span>{dayjs(row.started_on).format("DD MMM, YYYY")}</span>
						</Tippy>
					</div>

					<div className={style}>
						<div className={`${parentLabelStyle} cursor-pointer hover:underline hover:underline-offset-4 space-x-5`}>
							{uiClientName(row, clientIdAndName)}
							{row.todos?.length > 0 && <FontAwesomeIcon className="text-rose-800 cursor-pointer scale-100 hover:scale-125 duration-200" icon={faListUl} onClick={() => toggleTodoBox(row)} />}
						</div>
						<Tippy content={<Tooltip text={`Gov ID: ${governmentId || "NA"}`} />} placement="bottom" trigger="mouseenter" appendTo={() => document.body}>
							<span className={childLabelStyle} dangerouslySetInnerHTML={{ __html: companyName }} />
						</Tippy>
					</div>

					<div className={style}>
						<span className={parentLabelStyle} dangerouslySetInnerHTML={{ __html: subProjectName }} />
						<Tippy content={<Tooltip text={`Remarks ${row.remarks}`} />} placement="bottom" trigger="mouseenter" appendTo={() => document.body}>
							<span className={childLabelStyle} dangerouslySetInnerHTML={{ __html: mainProjectName }} />
						</Tippy>
					</div>

					<span className={avatarWrapper}>
						<AvatarCircle names={admins} />
						{admins.length && teams.length ? <span className="text-gray-300">|</span> : <></>}
						<AvatarCircle names={teams} />
					</span>

					<span className={`${style} font-bold-12`}>{MyGlobal.FormatCurrency(row.quote)}</span>
					<span className={style}>{uiStatusMenu(row)}</span>
				</div>
			);
		},
		[main.findText, statuses, allowDeletingProject, setMouseEnter, setMouseLeave, toggleDeleteProjectBox, toggleEditProjectView, uiClientName, uiTeams, uiStatusMenu],
	);

	function getTotalQuote() {
		let total = 0;
		let fullTotal = 0;

		for (const i of sortedProjects) {
			total += Number(i.quote);
		}

		for (const i of api.projects.copy) {
			fullTotal += Number(i.quote);
		}

		if (main.filter || main.findText) {
			return MyGlobal.ThousandSeparator(total) + " / " + MyGlobal.ThousandSeparator(fullTotal);
		} else {
			return MyGlobal.ThousandSeparator(fullTotal);
		}
	}

	function uiGoToTopOrb() {
		const handleClick = () => {
			const previousTopIndex = currentTopIndexReference.current;

			localStorage.setItem("projectsScrollPosition", 0);
			showGoToTopReference.current = false;
			setShowGoToTopOrb(false);

			if (rangeChangeTimeoutReference.current) {
				clearTimeout(rangeChangeTimeoutReference.current);
				rangeChangeTimeoutReference.current = null;
			}

			if (goToTopAnimationFrameReference.current) {
				cancelAnimationFrame(goToTopAnimationFrameReference.current);
				goToTopAnimationFrameReference.current = null;
			}

			if (currentScrollPositionReference.current) {
				if (previousTopIndex > 120) {
					currentScrollPositionReference.current.scrollToIndex({
						index: 18,
						align: "start",
						behavior: "auto",
					});

					goToTopAnimationFrameReference.current = globalThis.requestAnimationFrame(() => {
						currentScrollPositionReference.current?.scrollToIndex({
							index: 0,
							align: "start",
							behavior: "smooth",
						});
						goToTopAnimationFrameReference.current = null;
					});
				} else {
					currentScrollPositionReference.current.scrollToIndex({
						index: 0,
						align: "start",
						behavior: "smooth",
					});
				}
			}

			currentTopIndexReference.current = 0;
		};

		const wrapperStyle = showGoToTopOrb ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-90 translate-y-2 pointer-events-none";

		return (
			<div className={`transform-gpu transition-all duration-300 ease-out will-change-transform ${wrapperStyle}`} aria-hidden={!showGoToTopOrb}>
				<Tippy content={<Tooltip text="Go to top" />} disabled={!showGoToTopOrb} interactive placement="left" theme="dark" trigger="mouseenter" animation="shift-toward" appendTo={() => document.body}>
					<button type="button" aria-label="Go to top" className="w-10 h-10 flex items-center justify-center rounded-full bg-linear-to-br from-slate-200 via-indigo-300 to-violet-400 text-indigo-900 border border-indigo-500 shadow transition-all duration-300 ease-out hover:scale-105 hover:shadow-md cursor-pointer" onClick={handleClick} tabIndex={showGoToTopOrb ? 0 : -1}>
						<FontAwesomeIcon icon={faPlaneUp} size="1x" />
					</button>
				</Tippy>
			</div>
		);
	}

	const uiBody = useCallback(() => {
		const savedIndexStr = localStorage.getItem("projectsScrollPosition");
		const savedIndex = savedIndexStr ? Math.max(0, Math.min(Number(savedIndexStr), sortedProjects.length - 1)) : 0;

		return (
			<div className="flex w-full h-full justify-center items-start">
				<div className="flex flex-col w-[10%] space-y-2.5 mx-5 justify-start items-center">{uiList()}</div>
				<div className="flex flex-col w-[90%] h-full mr-5 justify-start items-center">
					{!filteredProjects.length && api.projects.copy.length ? (
						<div className={blankDataWrapper}>
							<span className="font-regular-12 gray-text">No projects found.</span>
						</div>
					) : (
						<div className="flex flex-col w-full h-full justify-center items-start full-border">
							<div className="flex w-full h-9 justify-center items-center primary-background">{uiHeaders()}</div>
							<Virtuoso ref={currentScrollPositionReference} className="w-full h-full overflow-y-auto bottom-border contrast-background" data={sortedProjects} itemContent={(i, row) => uiRows(row)} totalCount={sortedProjects.length} followOutput="auto" rangeChanged={handleRangeChange} initialTopMostItemIndex={savedIndex} />
							<div className="fixed bottom-3 right-3 z-50 flex items-center space-x-3">
								{uiGoToTopOrb()}
								{uiTotalQuote()}
							</div>
						</div>
					)}
				</div>
			</div>
		);
	}, [uiList, uiHeaders, sortedProjects, uiRows, showGoToTopOrb]);

	function uiTotalQuote() {
		return (
			<div className="group relative flex items-center w-fit px-0 transition-all duration-500 ease-in-out">
				<div className="absolute inset-0 rounded-full bg-linear-to-r from-emerald-600 via-emerald-500 to-emerald-400 border border-emerald-700 shadow-md z-0" />

				<div className="flex items-center justify-center w-10 h-10 group-hover:h-10 rounded-full text-white ring-emerald-700 group-hover:ring-0 transition-all duration-500 ease-in-out relative z-20 shrink-0">
					<FontAwesomeIcon icon={faIndianRupee} size="1x" />
				</div>

				<div className="transition-all duration-500 ease-in-out max-w-0 overflow-hidden group-hover:max-w-75">
					<div className="pl-2 pr-4 text-white font-bold-12 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out relative z-20">{getTotalQuote()}</div>
				</div>
			</div>
		);
	}

	const uiMain = useCallback(() => {
		if (main.isLoading.supportData) {
			return (
				<div className={blankDataWrapper}>
					<span className="font-regular-12 gray-text">Loading Projects ...</span>
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
	}, [main.isLoading.supportData, filteredProjects.length, api.projects.copy.length, mounted.editProject, mounted.singleProject, main.selectedProject, main.selectedClient, setSupportData, toggleEditProjectView, toggleSingleProjectView, uiBody, blankDataWrapper]);

	// Hooks
	useEffect(() => {
		const initializationDelay = setTimeout(() => {
			setSupportData();
		}, 200);

		window.addEventListener("keydown", autoFocusFindBox);

		return () => {
			clearTimeout(initializationDelay);
			if (rangeChangeTimeoutReference.current) {
				clearTimeout(rangeChangeTimeoutReference.current);
			}
			if (goToTopAnimationFrameReference.current) {
				cancelAnimationFrame(goToTopAnimationFrameReference.current);
			}
			setModuleProps("projectsOrTasks", "");
			window.removeEventListener("keydown", autoFocusFindBox);
		};
	}, [setSupportData, autoFocusFindBox, setModuleProps]);

	useEffect(() => {
		if (currentScrollPositionReference.current) {
			const savedIndex = localStorage.getItem("projectsScrollPosition");

			currentScrollPositionReference.current.scrollToIndex({
				index: savedIndex,
				align: "start",
				behavior: "auto",
			});
		}

		if (mounted.mainComponent) {
			// For "Overdue" filter specifically, we need to make sure the source is filtered for tasks_overdue
			// before we apply further filtering
			const source = main.activeModule.name === "All" ? api.projects.copy : main.activeModule.items || [];

			// First, calculate status counts based on text filter ONLY
			// This updates the counts shown in the status filter menu
			if (debouncedFindText) {
				const textFilteredData = source.filter((project) => {
					if (Object.values(statuses).includes(debouncedFindText)) {
						return project.status.includes(debouncedFindText);
					} else if (debouncedFindText === "Overdue") {
						// Important: This filter is coming from the dashboard
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
			const filteredData = source.filter((f) => {
				let matchesTextFilter = true;
				let matchesStatusFilter = true;
				let matchesTeamFilter = true;

				// Text filter logic
				if (debouncedFindText) {
					if (Object.values(statuses).includes(debouncedFindText)) {
						matchesTextFilter = f.status.includes(debouncedFindText);
					} else if (debouncedFindText === "Overdue") {
						matchesTextFilter = f.has_tasks_overdue;
					} else if (debouncedFindText === "Today") {
						matchesTextFilter = f.has_tasks_due_today;
					} else if (debouncedFindText === "Tomorrow") {
						matchesTextFilter = f.has_tasks_due_tomorrow;
					} else if (debouncedFindText === "Upcoming") {
						matchesTextFilter = f.has_tasks_upcoming;
					} else {
						const findText = debouncedFindText.toLowerCase();
						matchesTextFilter =
							String(f.id).toLowerCase().includes(findText) ||
							String(f.government_id || "")
								.toLowerCase()
								.includes(findText) ||
							String(f.client_id).toLowerCase().includes(findText) ||
							f.client_name.toLowerCase().includes(findText) ||
							f.company_name.toLowerCase().includes(findText) ||
							f.main_project_name.toLowerCase().includes(findText) ||
							f.sub_project_name.toLowerCase().includes(findText) ||
							String(f.team_names).toLowerCase().includes(findText) ||
							String(f.team_names_initials).toLowerCase().includes(findText) ||
							f.status.toLowerCase().includes(findText);
					}
				}

				// Status filter logic
				if (main.filter) {
					if ([statuses.Overdue, statuses.Today, statuses.Tomorrow, statuses.Upcoming].includes(main.filter)) {
						if (main.filter === statuses.Overdue) {
							matchesStatusFilter = f.has_tasks_overdue;
						} else if (main.filter === statuses.Today) {
							matchesStatusFilter = f.has_tasks_due_today;
						} else if (main.filter === statuses.Tomorrow) {
							matchesStatusFilter = f.has_tasks_due_tomorrow;
						} else if (main.filter === statuses.Upcoming) {
							matchesStatusFilter = f.has_tasks_upcoming;
						}
					} else {
						matchesStatusFilter = f.status === main.filter;
					}
				}

				// Team filter logic
				if (main.selectedStaff.id) {
					if (main.selectedStaff.type === "Assigned alone") {
						matchesTeamFilter = f.teams === main.selectedStaff.id;
					} else {
						matchesStatusFilter = String(f.teams).split(",").includes(main.selectedStaff.id);
					}
				}

				// Both filters must match
				return matchesTextFilter && matchesStatusFilter && matchesTeamFilter;
			});

			setApi((prev) => ({
				...prev,
				projects: {
					...prev.projects,
					data: filteredData,
				},
			}));
		}
	}, [debouncedFindText, main.selectedStaff, main.filter, main.activeModule, api.projects.copy, mounted.mainComponent, statuses, calculateStatusCounts]);

	useEffect(() => {
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

	// Main UI
	return (
		<div className="flex flex-col w-full h-full justify-start items-center">
			<>
				{!mounted.editProject && !mounted.singleProject && (
					<div className="flex w-full px-5 py-2.5 justify-between items-center">
						<div className="flex w-1/5 space-x-2 justify-start items-center">
							<span className="view-heading">{thisView}</span>
							{getIconOrBadge()}
						</div>
						<div className="flex w-3/5 space-x-5 justify-center items-center">
							{uiFind()}
							{uiFilter()}
							{uiStaff()}
							{uiStaffAdvanced()}
							<Tippy content={<Tooltip text={`Clear filters of ${main.activeModule.name}`} />} placement="bottom">
								{uiClearFilter()}
							</Tippy>
						</div>
						<div className="flex w-1/5 justify-end items-center">{uiExport()}</div>
					</div>
				)}
				{uiMain()}
			</>

			{mounted.deleteProject && <DeleteProject mount={mounted.deleteProject} projectId={main.selectedProject.id} reload={setSupportData} unmount={toggleDeleteProjectBox} />}

			{mounted.todo && <ProjectTodos mount={mounted.todo} project={main.selectedProject} reload={setSupportData} unmount={toggleTodoBox} />}

			{mounted.editStatus && <EditStatus mount={mounted.editStatus} project={main.selectedProject} reload={setSupportData} unmount={toggleEditStatusBox} />}

			{mounted.projectStatus && <ProjectStatus mount={mounted.projectStatus} project={main.selectedProject} reload={setSupportData} unmount={toggleProjectStatusBox} />}
		</div>
	);
}
