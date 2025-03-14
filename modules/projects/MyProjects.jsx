"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import Tippy from "@tippyjs/react";
import EditProject from "./EditProject";
import writeXlsxFile from "write-excel-file";
import SingleProject from "../singleProject";
import MyConstants from "@/utilities/constants";

import { Virtuoso } from "react-virtuoso";
import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { TextInputNative } from "@/components/Inputs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Badge, BadgeSmall, Spinner, SpinnerSmall, Tooltip } from "@/components/Elements";
import { EditStatus, DeleteProject, ProjectStatus } from "@/modals/projects/miscellaneous";
import { faCheck, faCheckCircle, faChevronDown, faChevronRight, faFileExcel, faPencil, faSearch, faSortAmountAsc, faSortAmountDesc, faTrash } from "@fortawesome/free-solid-svg-icons";

export default function MyProjects({ setModuleProps, unmount }) {
	// Business Logic
	const [api, setApi] = useState({
		notes: [],
		projects: { data: [], copy: [] },
	});

	const [main, setMain] = useState({
		activeModule: { items: [], name: "All" },
		dueDate: { from: "", to: "" },
		findText: "",
		isLoading: { selectedProject: false, supportData: false },
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
		projectStatus: false,
		singleProject: false,
	});

	const today = dayjs();
	const statuses = MyConstants.Statuses.Projects;
	const thisView = MyConstants.Modules.Base.Projects;
	const tableHeaders = MyConstants.TableHeaders.Projects;
	const isUserAdministrator = MyGlobal.IsUserAdministrator();

	const allowDeletingProject = MyGlobal.HasPermission(MyConstants.Modules.Derived.DeleteProject);
	const allowEditingProject = MyGlobal.HasPermission(MyConstants.Modules.Derived.EditProject);

	const showFindBoxClearButton = main.findText ? "cursor-pointer primary-text" : "hidden";
	const blankDataWrapper = "flex w-full h-full justify-center items-center contrast-background full-border";

	// Functions
	function autoFocusFindBox(event) {
		switch (true) {
			case event.ctrlKey && event.key == "f":
				event.preventDefault();
				document.getElementById("findBox").focus();
				break;
		}
	}

	function doFiltering() {
		const filtered = getSelectedProjectData().filter((f) => {
			const findText = main.findText.toLowerCase();

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

		setApi((s) => ({ ...s, projects: { ...s.projects, data: filtered } }));
	}

	function doSorting() {
		return getSelectedProjectData().sort((a, b) => {
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
			}
		});
	}

	function doExcelExport() {
		const records = [];
		const _records = [];

		const columnsWidth = [];
		const dataHeaders = [];

		const rowHeight = 34;
		const headerHeight = 44;
		const maximumColumnWidth = 20;

		const headers = Object.values(tableHeaders);
		const blankRows = [{ span: headers.length, height: rowHeight, colSpan: 2 }];

		doSorting().forEach((fe) => {
			const lastNote = api.notes
				.filter((f) => f.project_id == fe.id)
				.sort((a, b) => b.id - a.id)
				.at(0);

			records.push(
				fe.id,
				!fe.government_id ? "" : fe.government_id,
				fe.client_id_and_name,
				fe.company_name,
				fe.main_project_name,
				fe.sub_project_name,
				fe.team_names,
				dayjs(fe.due_on).format("DD MMM, YYYY"),
				`${dayjs(lastNote.entry_date).format("hh:mm:ss A - DD MMM YYYY")}\n${lastNote.content}`,
				fe.status,
			);
		});

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
		const headerText = `${thisView} (${api.projects.data.length})`;

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

		const finalData = [header, blankRows, dataHeaders];
		separatedRowValues.forEach((fe) => finalData.push(fe));

		writeXlsxFile(finalData, {
			fontFamily: "Segoe UI",
			fontSize: 9,
			columns: columnsWidth,
			fileName: `${thisView}.xlsx`,
		});
	}

	function editStatus(project, status) {
		const object = { ...project };

		object["new_status"] = status;

		if (status != statuses.Completed) {
			toggleEditStatusBox(object);
		} else {
			toggleProjectStatusBox(object);
		}
	}

	function getAggregatedProjects() {
		const groupedByMainProject = api.projects.copy.reduce((pv, cv) => {
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
				if (a.key == "All") return -1;
				if (b.key == "All") return 1;

				return a.key.localeCompare(b.key);
			});
	}

	function getIconOrBadge() {
		if (main.isLoading.supportData) {
			return (
				<span className="pl-5 relative">
					<Spinner />
				</span>
			);
		} else {
			return api.projects.data.length > 0 && <Badge value={getRowsCount()} />;
		}
	}

	function getRowsCount() {
		const apiCount = api.projects.data.filter((f) => {
			if (main.findText.length) {
				if (Object.values(statuses).includes(main.findText)) {
					return f.status.includes(main.findText);
				} else {
					if (main.findText === "Overdue") {
						return f.has_tasks_overdue;
					} else if (main.findText === "Today") {
						return f.has_tasks_due_today;
					} else if (main.findText === "Tomorrow") {
						return f.has_tasks_due_tomorrow;
					} else if (main.findText === "Upcoming") {
						return f.has_tasks_upcoming;
					}
				}
			}

			return f;
		}).length;

		const apiCopyCount = api.projects.copy.length;

		if (apiCount != apiCopyCount) {
			return `${apiCount} / ${apiCopyCount}`;
		} else {
			return apiCount;
		}
	}

	function getSelectedProjectData() {
		let source = [];

		if (api.projects.copy.length > 0) {
			if (main.activeModule.name == "All") {
				source = api.projects.copy.filter((f) => {
					if (main.findText.length) {
						if (Object.values(statuses).includes(main.findText)) {
							return f.status.includes(main.findText);
						} else {
							if (main.findText === "Overdue") {
								return f.has_tasks_overdue;
							} else if (main.findText === "Today") {
								return f.has_tasks_due_today;
							} else if (main.findText === "Tomorrow") {
								return f.has_tasks_due_tomorrow;
							} else if (main.findText === "Upcoming") {
								return f.has_tasks_upcoming;
							}
						}
					}

					return f;
				});
			} else {
				const items = getAggregatedProjects().find((f) => f.key == main.activeModule.name).items;

				if (Array.isArray(items) && items.length) {
					source = items;
				}
			}
		}

		return source;
	}

	function setInputs(key, value) {
		setMain((s) => ({ ...s, [key]: value }));
	}

	function setModule(module) {
		setMain((s) => ({ ...s, activeModule: { items: module.items, name: module.key } }));
	}

	function setMouseEnter(projectId) {
		if (allowDeletingProject) {
			setMain((s) => ({ ...s, showIconButton: { ...s.showIconButton, deleteProject: projectId } }));
		}

		if (allowEditingProject) {
			setMain((s) => ({ ...s, showIconButton: { ...s.showIconButton, editProject: projectId } }));
		}
	}

	function setMouseLeave() {
		setMain((s) => ({ ...s, showIconButton: { deleteProject: 0, editProject: 0 } }));
	}

	function setSort(column) {
		setMain((s) => ({ ...s, sort: { column, isAscending: !s.sort.isAscending } }));
	}

	async function setSupportData(projectId) {
		setMain((s) => ({ ...s, isLoading: { ...s.isLoading, supportData: true } }));

		try {
			const response = await axios.get(MyConstants.ApiEndpoints.Projects.GetMyProjects, MyGlobal.GetHeaders({ userId: MyGlobal.GetUserId() }));

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

				setMounted((s) => ({ ...s, mainComponent: true }));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, `${thisView} => Get Support Data`);
		} finally {
			setMain((s) => ({ ...s, isLoading: { ...s.isLoading, supportData: false } }));
		}
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

	// UI Components

	function uiBody() {
		return (
			<div className="flex w-full h-full justify-center items-start">
				<div className="flex flex-col w-[10%] space-y-2.5 mx-5 justify-start items-center">{uiList()}</div>
				<div className="flex flex-col w-[90%] h-full mr-5 justify-start items-center">
					<div className="flex flex-col w-full h-full justify-center items-start full-border">
						<div className="flex w-full h-9 justify-center items-center primary-background">{uiHeaders()}</div>
						<Virtuoso className="w-full h-full overflow-y-auto bottom-border contrast-background" data={doSorting()} itemContent={(i, row) => uiRows(row, i)} totalCount={api.projects.data.length} />
					</div>
				</div>
			</div>
		);
	}

	function uiClientName(row, tooltipText) {
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
	}

	function uiExport() {
		if (api.projects.data.length && api.projects.copy.length) {
			return (
				<button className="primary-button-transparent-background" onClick={() => doExcelExport()}>
					<FontAwesomeIcon className="primary-text" icon={faFileExcel} />
				</button>
			);
		}
	}

	function uiFind() {
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
	}

	function uiHeaders() {
		return Object.values(tableHeaders).map((m, i) => {
			const showArrow = m == main.sort.column ? "visible" : "invisible";

			return (
				<span className="w-[12.5%] space-x-1 cursor-pointer text-center text-white font-medium-10" onClick={() => setSort(m)} key={i}>
					<span>{m}</span>
					<span className={showArrow}>{uiSortArrows(m)}</span>
				</span>
			);
		});
	}

	function uiList() {
		const modules = api.projects.copy.length > 0 ? getAggregatedProjects() : [];

		return modules.map((m, i) => {
			const style = m.key == main.activeModule.name ? "primary-border primary-background-transparent-01 primary-text" : "full-border bg-white black-text";

			const wrapper = `flex w-full px-4 py-2 justify-between items-center rounded shadow ${style} font-regular-10 hovered-rows`;

			return (
				<button className={wrapper} key={i} onClick={() => setModule(m)}>
					<span className="text-left">{m.key}</span>
					{m.key != "All" && m.items.length && <span className="font-regular-10 gray-text">{m.items.length}</span>}
				</button>
			);
		});
	}

	function uiMain() {
		if (main.isLoading.supportData) {
			return (
				<div className={blankDataWrapper}>
					<span className="font-regular-12 gray-text">Loading Projects ...</span>
				</div>
			);
		} else if (!api.projects.data.length && api.projects.copy.length) {
			return (
				<div className={blankDataWrapper}>
					<span className="font-regular-12 gray-text">No projects found.</span>
				</div>
			);
		} else if (!api.projects.data.length && !api.projects.copy.length) {
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
	}

	function uiRows(row) {
		const style = `flex flex-wrap w-[12.5%] min-h-9 justify-center items-center text-center`;

		const governmentId = MyGlobal.HighlightText(row.government_id ?? "", main.findText);
		const governmentIdTextColour = !row.government_id ? "gray-text" : "primary-text";

		const clientIdAndName = [`Client ID - ${row.client_id}`, <br />, `Project ID - ${row.id}`];
		const companyName = MyGlobal.HighlightText(row.company_name, main.findText);

		const mainProjectName = MyGlobal.HighlightText(row.main_project_name, main.findText);
		const subProjectName = MyGlobal.HighlightText(row.sub_project_name, main.findText);

		const dueOn = dayjs(row.due_on).format("DD MMM, YYYY");

		const background = row.status == statuses.Completed ? "green-background-transparent-01" : "contrast-background";

		const wrapper = `flex w-full justify-center items-center ${background} bottom-border font-regular-11 black-text`;

		return (
			<div className={wrapper} key={row.id} onMouseEnter={() => setMouseEnter(row.id)} onMouseLeave={() => setMouseLeave(row.id)}>
				<div className={`${style} cursor-help primary-text`}>{uiStartedOn(row)}</div>

				<span className={`${style} ${governmentIdTextColour}`} dangerouslySetInnerHTML={{ __html: governmentId || "NA" }} />

				<span className={`${style} space-x-5 cursor-pointer relative primary-text`}>{uiClientName(row, clientIdAndName)}</span>

				<span className={style} dangerouslySetInnerHTML={{ __html: companyName }} />
				<span className={style} dangerouslySetInnerHTML={{ __html: mainProjectName }} />

				<Tippy content={<Tooltip text={`Due On ${dueOn}`} />} placement="bottom">
					<span className={style} dangerouslySetInnerHTML={{ __html: subProjectName }} />
				</Tippy>

				<span className={`${style} space-x-1`}>{uiTeams(row)}</span>
				<span className={style}>{uiStatusMenu(row)}</span>
			</div>
		);
	}

	function uiSortArrows(column) {
		if (main.sort.column == column) {
			if (main.sort.isAscending) {
				return <FontAwesomeIcon className="text-white" icon={faSortAmountDesc} />;
			} else {
				return <FontAwesomeIcon className="text-white" icon={faSortAmountAsc} />;
			}
		}
	}

	function uiStartedOn(row) {
		const actionButtonStyle = "flex w-full p-2 space-x-2 justify-start items-center cursor-pointer font-regular-11 black-text";

		return (
			<Tippy
				content={
					<div className="flex flex-col py-1 justify-start items-center">
						<div className={actionButtonStyle} onClick={() => toggleDeleteProjectBox(row)}>
							<FontAwesomeIcon icon={faTrash} />
							<span>Delete Project</span>
						</div>
						<div className={actionButtonStyle} onClick={() => toggleEditProjectView(row)}>
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
	}

	function uiStatusMenu(row) {
		const isCompleted = row.status == statuses.Completed;
		const wrapper = `flex w-full px-4 justify-between items-center focus:outline-none font-regular-11 !py-0`;

		return (
			<Menu as="div" className="flex w-24 justify-center items-center relative">
				<MenuButton className={wrapper}>
					{isCompleted && <FontAwesomeIcon className="green-text mr-1.5" icon={faCheckCircle} />}
					<span dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(row.status, main.findText) }} />
					{!isCompleted && <FontAwesomeIcon icon={faChevronDown} />}
				</MenuButton>
				{!isCompleted ? (
					<MenuItems className="absolute w-full top-7 right-0 origin-top-right rounded focus:outline-none z-50 contrast-background bottom-shadow full-border">{uiStatusMenuList(row)}</MenuItems>
				) : (
					isUserAdministrator && <MenuItems className="absolute w-full top-7 right-0 origin-top-right rounded focus:outline-none z-50 contrast-background bottom-shadow full-border">{uiStatusMenuList(row)}</MenuItems>
				)}
			</Menu>
		);
	}

	function uiStatusMenuList(row) {
		return Object.values(statuses).map((m, i) => {
			const isSelected = m == row.status;
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

	function uiTeams(row) {
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
				return names.split(",").map((m) => uiTeamsTooltip(MyGlobal.GetInitials(m), m));
			}
		} else {
			return uiTeamsTooltip(singleUserInitials, names);
		}
	}

	function uiTeamsListTooltip(teams) {
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
	}

	function uiTeamsTooltip(badgeText, tooltipText) {
		return (
			<Tippy content={<Tooltip text={tooltipText} />} placement="bottom">
				<span className="cursor-help">
					<BadgeSmall value={badgeText} />
				</span>
			</Tippy>
		);
	}

	// Hooks
	useEffect(() => {
		setSupportData();

		globalThis.addEventListener("keydown", autoFocusFindBox);

		return () => {
			setModuleProps("projectsOrTasks", "");
			globalThis.removeEventListener("keydown", autoFocusFindBox);
		};
	}, []);

	useEffect(() => {
		if (mounted.mainComponent) {
			doFiltering();
		}
	}, [main.findText]);

	// Main UI
	return (
		<div className="flex flex-col w-full h-full justify-start items-center">
			<>
				{!mounted.editProject && !mounted.singleProject && (
					<div className="flex w-full px-5 py-2.5 justify-between items-center">
						<div className="flex w-1/3 space-x-2 justify-start items-center">
							<span className="cursor-pointer hover:underline hover:underline-offset-8 view-heading" onClick={() => unmount()}>
								All {thisView}
							</span>
							<FontAwesomeIcon className="gray-text" icon={faChevronRight} size="xs" />
							<span className="view-heading">My {thisView}</span>
							{getIconOrBadge()}
						</div>
						<div className="flex w-1/3 justify-center items-center">{uiFind()}</div>
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
