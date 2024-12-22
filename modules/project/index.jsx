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
import { UpdateStatus, DeleteProject, ProjectStatus } from "@/modals/projects/miscellaneous";
import { Badge, BadgeSmall, SpinnerBig, SpinnerSmall, Tooltip } from "@/components/Elements";
import {
	faBolt,
	faCheck,
	faChevronDown,
	faEye,
	faEyeSlash,
	faFileExcel,
	faPencil,
	faSearch,
	faSortAmountAsc,
	faSortAmountDesc,
	faTrash,
} from "@fortawesome/free-solid-svg-icons";

export default function Projects() {
	// Business Logic
	const [apiData, setApiData] = useState({
		allCompanies: [],
		allMainProjects: [],
		allNotes: [],
		allProjects: { api: [], apiCopy: [] },
		allSubProjects: [],
		confirmedClients: [],
	});

	const [hasMounted, setHasMounted] = useState({
		deleteProject: false,
		editProject: false,
		mainComponent: false,
		projectStatus: false,
		singleProject: false,
		updateStatus: false,
	});

	const [mainData, setMainData] = useState({
		activeModule: { details: [], name: "All" },
		dueDate: { from: "", to: "" },
		isLoading: { selectedProject: false, supportData: false },
		searchTerm: "",
		selectedClient: {},
		selectedProject: {},
		showIconButton: { deleteProject: 0, editProject: 0 },
		sort: { column: "ID", isAscending: false },
	});

	const thisView = MyConstants.Modules.Base.Projects;
	const projectStatuses = MyConstants.Statuses.Projects;
	const tableHeaders = MyConstants.TableHeaders.Projects;

	const allowDeletingProject = MyGlobal.HasPermission(MyConstants.Modules.Derived.DeleteProject);
	const allowEditingProject = MyGlobal.HasPermission(MyConstants.Modules.Derived.EditProject);

	const showSearchBoxClearButton = mainData.searchTerm ? "cursor-pointer primary-text" : "hidden";
	const blankDataWrapper = "flex w-full h-full justify-center items-center black-white-background full-border";

	// Functions
	const detectKeystrokes = (event) => {
		switch (true) {
			case event.ctrlKey && event.key == "f":
				event.preventDefault();
				document.getElementById("searchBox").focus();
				break;
		}
	};

	const doFiltering = () => {
		const selectedProject = getAggregatedProjects()
			.filter((project) => project.key == mainData.activeModule.name)
			.at(0);

		let selectedProjectList = [];

		if (selectedProject.key == "All") {
			selectedProjectList = apiData.allProjects.apiCopy;
		} else {
			selectedProjectList = selectedProject.items;
		}

		const filteredData = selectedProjectList.filter((project) => {
			const searchedText = mainData.searchTerm.toLowerCase();

			const projectId = String(project.id).toLowerCase();
			const governmentId = String(project.government_id).toLowerCase();

			const clientId = String(project.client_id).toLowerCase();
			const clientName = String(getClientName(project.client_id)).toLowerCase();

			const companyName = String(getCompanyName(project.company_id)).toLowerCase();

			const mainProjectName = String(getMainProjectName(project.main_project_id)).toLowerCase();
			const subProjectName = String(getSubProjectName(project.sub_project_id)).toLowerCase();

			const teamsName = MyGlobal.GetAnyDataFromId(project.teams, "full_name");
			const teamsNamesInitials = MyGlobal.GetInitials(teamsName);
			const _teamsName = String(teamsName).toLowerCase();

			const status = String(project.status).toLowerCase();

			return (
				projectId.includes(searchedText) ||
				governmentId.includes(searchedText) ||
				clientId.includes(searchedText) ||
				clientName.includes(searchedText) ||
				companyName.includes(searchedText) ||
				mainProjectName.includes(searchedText) ||
				subProjectName.includes(searchedText) ||
				_teamsName.includes(searchedText) ||
				teamsNamesInitials.includes(searchedText) ||
				status.includes(searchedText)
			);
		});

		setApiData((s) => ({ ...s, allProjects: { ...s.allProjects, api: filteredData } }));
	};

	const doSorting = () => {
		return apiData.allProjects.api.sort((a, b) => {
			const aClient = getClientName(a.client_id);
			const bClient = getClientName(b.client_id);

			const aCompany = getClientName(a.company_id);
			const bCompany = getClientName(b.company_id);

			const aMainProject = getMainProjectName(a.main_project_id);
			const bMainProject = getMainProjectName(b.main_project_id);

			const aSubProject = getSubProjectName(a.sub_project_id);
			const bSubProject = getSubProjectName(b.sub_project_id);

			const aDueOn = new Date(a.due_on);
			const bDueOn = new Date(b.due_on);

			switch (true) {
				case mainData.sort.column == tableHeaders.Id && mainData.sort.isAscending:
					return a.id.localeCompare(b.id);
				case mainData.sort.column == tableHeaders.Id && !mainData.sort.isAscending:
					return b.id.localeCompare(a.id);
				case mainData.sort.column == tableHeaders.GovermentId && mainData.sort.isAscending:
					if (a.government_id) {
						return a.government_id.localeCompare(b.government_id);
					}
				case mainData.sort.column == tableHeaders.GovermentId && !mainData.sort.isAscending:
					if (b.government_id) {
						return b.government_id.localeCompare(a.government_id);
					}
				case mainData.sort.column == tableHeaders.Client && mainData.sort.isAscending:
					return aClient.localeCompare(bClient);
				case mainData.sort.column == tableHeaders.Client && !mainData.sort.isAscending:
					return bClient.localeCompare(aClient);
				case mainData.sort.column == tableHeaders.Company && mainData.sort.isAscending:
					return aCompany.localeCompare(bCompany);
				case mainData.sort.column == tableHeaders.Company && !mainData.sort.isAscending:
					return bCompany.localeCompare(aCompany);
				case mainData.sort.column == tableHeaders.MainProject && mainData.sort.isAscending:
					return aMainProject.localeCompare(bMainProject);
				case mainData.sort.column == tableHeaders.MainProject && !mainData.sort.isAscending:
					return bMainProject.localeCompare(aMainProject);
				case mainData.sort.column == tableHeaders.SubProject && mainData.sort.isAscending:
					return aSubProject.localeCompare(bSubProject);
				case mainData.sort.column == tableHeaders.SubProject && !mainData.sort.isAscending:
					return bSubProject.localeCompare(aSubProject);
				case mainData.sort.column == tableHeaders.DueOn && mainData.sort.isAscending:
					return aDueOn - bDueOn;
				case mainData.sort.column == tableHeaders.DueOn && !mainData.sort.isAscending:
					return bDueOn - aDueOn;
				case mainData.sort.column == tableHeaders.Status && mainData.sort.isAscending:
					return a.status.localeCompare(b.status);
				case mainData.sort.column == tableHeaders.Status && !mainData.sort.isAscending:
					return b.status.localeCompare(a.status);
			}
		});
	};

	const exportAsExcel = () => {
		const records = [];
		const _records = [];

		const columnsWidth = [];
		const dataHeaders = [];

		const rowHeight = 34;
		const headerHeight = 44;
		const maximumColumnWidth = 20;

		const headers = Object.values(tableHeaders);
		const blankRows = [{ span: headers.length, height: rowHeight, colSpan: 2 }];

		doSorting().forEach((project) => {
			const lastNote = apiData.allNotes
				.filter((note) => note.project_id == project.id)
				.sort((a, b) => b.id - a.id)
				.at(0);

			records.push(
				project.id,
				!project.government_id ? "" : project.government_id,
				getClientName(project.client_id),
				getCompanyName(project.company_id),
				getMainProjectName(project.main_project_id),
				getSubProjectName(project.sub_project_id),
				MyGlobal.GetAnyDataFromId(project.teams, "full_name"),
				dayjs(project.due_on).format("DD MMM, YYYY"),
				`${dayjs(lastNote.entry_date).format("hh:mm:ss A - DD MMM YYYY")}\n${lastNote.content}`,
				project.status,
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
		const headerText = `${thisView} (${apiData.allProjects.api.length})`;

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
		separatedRowValues.forEach((row) => finalData.push(row));

		writeXlsxFile(finalData, {
			fontFamily: "Segoe UI",
			fontSize: 9,
			columns: columnsWidth,
			fileName: `${thisView}.xlsx`,
		});
	};

	const getAggregatedProjects = () => {
		const groupedByMainProject = apiData.allProjects.apiCopy.reduce((group, project) => {
			const mainProject = getMainProjectName(project.main_project_id);

			if (!group[mainProject]) {
				group[mainProject] = [];
			}

			if (!group[project.All]) {
				group["All"] = [{ details: [], name: "All" }];
			}

			group[mainProject].push(project);
			return group;
		}, {});

		return Object.keys(groupedByMainProject)
			.map((key) => ({ key, items: groupedByMainProject[key] }))
			.sort((a, b) => {
				if (a.key == "All") return -1;
				if (b.key == "All") return 1;

				return a.key.localeCompare(b.key);
			});
	};

	const getClientName = (clientId) => {
		if (apiData.confirmedClients.length) {
			return apiData.confirmedClients.filter((client) => client.id == clientId).at(0).name;
		} else {
			return "";
		}
	};

	const getCompanyName = (companyId) => {
		if (apiData.allCompanies.length) {
			return apiData.allCompanies.filter((company) => company.id == companyId).at(0).name;
		} else {
			return "";
		}
	};

	const getDataCount = () => {
		const apiCount = apiData.allProjects.api.length;
		const apiCopyCount = apiData.allProjects.apiCopy.length;

		if (apiCount != apiCopyCount) {
			return `${apiCount} / ${apiCopyCount}`;
		} else {
			return apiCount;
		}
	};

	const getMainProjectName = (mainProjectId) => {
		if (apiData.allMainProjects.length) {
			return apiData.allMainProjects.filter((mainProject) => mainProject.id == mainProjectId).at(0).name;
		} else {
			return "";
		}
	};

	const getSubProjectName = (subProjectId) => {
		if (apiData.allSubProjects.length) {
			return apiData.allSubProjects.filter((subProject) => subProject.id == subProjectId).at(0).name;
		} else {
			return "";
		}
	};

	const getSupportData = async (selectedProjectId) => {
		setMainData((old) => ({ ...old, isLoading: { ...old.isLoading, supportData: true } }));

		try {
			const response = await axios.get(MyConstants.ApiEndpoints.Projects.GetProjects, MyGlobal.GetHeaders());

			if (response.status === 200) {
				setApiData((old) => ({
					...old,
					allCompanies: response.data.companies,
					allMainProjects: response.data.mainProjects,
					allNotes: response.data.notes,
					allProjects: { api: response.data.projects, apiCopy: response.data.projects },
					allSubProjects: response.data.subProjects,
					confirmedClients: response.data.clients,
				}));

				if (selectedProjectId) {
					const updateSelectedProject = response.data.projects.filter((project) => project.id == selectedProjectId).at(0);

					setMainData((old) => ({ ...old, selectedProject: updateSelectedProject }));
				}

				setHasMounted((old) => ({ ...old, mainComponent: true }));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, `${thisView} => Get Support Data`);
		} finally {
			setMainData((old) => ({ ...old, isLoading: { ...old.isLoading, supportData: false } }));
		}
	};

	const setInputs = (key, value) => {
		setMainData((old) => ({ ...old, [key]: value }));
	};

	const setModule = (module) => {
		setMainData((old) => ({ ...old, activeModule: { details: module.items, name: module.key } }));
	};

	const setMouseEnter = (projectId) => {
		if (allowDeletingProject) {
			setMainData((old) => ({ ...old, showIconButton: { ...old.showIconButton, deleteProject: projectId } }));
		}

		if (allowEditingProject) {
			setMainData((old) => ({ ...old, showIconButton: { ...old.showIconButton, editProject: projectId } }));
		}
	};

	const setMouseLeave = () => {
		setMainData((old) => ({ ...old, showIconButton: { deleteProject: 0, editProject: 0 } }));
	};

	const setSort = (column) => {
		setMainData((old) => ({ ...old, sort: { column, isAscending: !mainData.sort.isAscending } }));
	};

	const toggleDeleteProjectBox = (project) => {
		setMainData((old) => ({ ...old, selectedProject: project ?? {} }));
		setHasMounted((old) => ({ ...old, deleteProject: project ? true : false }));
	};

	const toggleEditProjectView = (project) => {
		setMainData((old) => ({ ...old, selectedProject: project ?? {} }));
		setHasMounted((old) => ({ ...old, editProject: project ? true : false }));
	};

	const toggleProjectStatusBox = (project) => {
		setMainData((old) => ({ ...old, selectedProject: project ?? {} }));
		setHasMounted((old) => ({ ...old, projectStatus: project ? true : false }));
	};

	const toggleSingleProjectView = (project) => {
		setMainData((old) => ({ ...old, selectedProject: project ?? {} }));
		setHasMounted((old) => ({ ...old, singleProject: project ? true : false }));
	};

	const toggleUpdateStatusBox = (project) => {
		setMainData((old) => ({ ...old, selectedProject: project ?? {} }));
		setHasMounted((old) => ({ ...old, updateStatus: project ? true : false }));
	};

	const updateStatus = (clientName, selectedProject, status) => {
		const object = { ...selectedProject };

		object["new_status"] = status;
		object["client_name"] = clientName;

		if (status != projectStatuses.Completed) {
			toggleUpdateStatusBox(object);
		} else {
			toggleProjectStatusBox(object);
		}
	};

	// UI Components
	const uiBody = () => {
		return (
			<div className="flex w-full h-full justify-center items-start">
				<div className="flex flex-col w-[10%] justify-start items-center">{uiTabs()}</div>
				<div className="flex flex-col w-[90%] h-full justify-start items-center black-white-background">
					<div className="flex flex-col w-full h-full justify-center items-start full-border">
						<div className="flex w-full h-9 justify-center items-center primary-background">{uiHeaders()}</div>
						<Virtuoso
							className="w-full h-full overflow-y-auto bottom-border"
							data={doSorting()}
							itemContent={(index, project) => uiRows(project, index)}
							totalCount={apiData.allProjects.api.length}
						/>
					</div>
				</div>
			</div>
		);
	};

	const uiExport = () => {
		if (apiData.allProjects.api.length && apiData.allProjects.apiCopy.length) {
			return (
				<button className="space-x-1.5 primary-button-transparent-background" onClick={() => exportAsExcel()}>
					<FontAwesomeIcon className="primary-text" icon={faFileExcel} />
					<span>Export</span>
				</button>
			);
		}
	};

	const uiHeaders = () => {
		return Object.values(tableHeaders).map((header, index) => {
			const showIndicator = header == mainData.sort.column ? "visible" : "invisible";

			return (
				<span className="w-[10%] space-x-1 cursor-pointer text-center text-white font-medium-10" onClick={() => setSort(header)} key={index}>
					<span>{header}</span>
					<span className={showIndicator}>{uiSortArrows(header)}</span>
				</span>
			);
		});
	};

	const uiLastNote = (projectId, style) => {
		const lastNote = apiData.allNotes
			.filter((note) => note.project_id == projectId)
			.sort((a, b) => b.id - a.id)
			.at(0);

		const lastNoteIcon = !lastNote.content ? faEyeSlash : faEye;
		const lastNoteIconStyle = !lastNote.content ? "gray-text" : "black-text";

		return (
			<Tippy
				allowHTML
				content={
					<>
						<>{dayjs(lastNote.entry_date).format("hh:mm:ss A - DD MMM YYYY")}</>
						<br />
						<>{lastNote.content}</>
					</>
				}
				disabled={!lastNote.content}>
				<span className={`${style} cursor-help`}>
					<FontAwesomeIcon className={lastNoteIconStyle} icon={lastNoteIcon} />
				</span>
			</Tippy>
		);
	};

	const uiMain = () => {
		if (mainData.isLoading.supportData) {
			return (
				<div className={blankDataWrapper}>
					<SpinnerBig />
				</div>
			);
		} else if (!apiData.allProjects.api.length && apiData.allProjects.apiCopy.length) {
			return (
				<div className={blankDataWrapper}>
					<span className="font-regular-12 gray-text">No projects found.</span>
				</div>
			);
		} else if (!apiData.allProjects.api.length && !apiData.allProjects.apiCopy.length) {
			return (
				<div className={blankDataWrapper}>
					<span className="font-regular-12 gray-text">No projects created.</span>
				</div>
			);
		} else if (hasMounted.editProject) {
			return <EditProject reloadProjects={getSupportData} selectedProject={mainData.selectedProject} unmount={toggleEditProjectView} />;
		} else if (hasMounted.singleProject) {
			return (
				<SingleProject
					reloadProjects={getSupportData}
					selectedClient={mainData.selectedClient}
					selectedProject={mainData.selectedProject}
					source="Single Project"
					unmount={toggleSingleProjectView}
				/>
			);
		} else {
			return uiBody();
		}
	};

	const uiRows = (project) => {
		const style = `flex flex-wrap w-[10%] min-h-9 justify-center items-center text-center right-border`;
		const projectActionButtonStyle = "flex w-full p-2 space-x-2 justify-start items-center cursor-pointer text-white font-regular-12";

		const projectId = MyGlobal.HighlightText(project.id, mainData.searchTerm);

		const governmentId = MyGlobal.HighlightText(project.government_id ?? "", mainData.searchTerm);
		const governmentIdTextColour = !project.government_id ? "gray-text" : "primary-text";

		const client = MyGlobal.HighlightText(getClientName(project.client_id), mainData.searchTerm);
		const company = MyGlobal.HighlightText(getCompanyName(project.company_id), mainData.searchTerm);

		const mainProject = MyGlobal.HighlightText(getMainProjectName(project.main_project_id), mainData.searchTerm);
		const subProject = MyGlobal.HighlightText(getSubProjectName(project.sub_project_id), mainData.searchTerm);

		const dueOn = dayjs(project.due_on).format("DD MMM, YYYY");

		return (
			<div
				className="flex w-full justify-center items-center black-white-background bottom-border font-regular-10 black-text"
				key={projectId}
				onMouseEnter={() => setMouseEnter(projectId)}
				onMouseLeave={() => setMouseLeave(projectId)}>
				<div className={`${style} cursor-help primary-text`}>
					<Tippy
						arrow
						allowHTML
						content={
							<div className="flex flex-col py-1 justify-start items-center">
								<div className={projectActionButtonStyle} onClick={() => toggleDeleteProjectBox(project)}>
									<FontAwesomeIcon icon={faTrash} />
									<span>Delete Project</span>
								</div>
								<div className={projectActionButtonStyle} onClick={() => toggleEditProjectView(project)}>
									<FontAwesomeIcon icon={faPencil} />
									<span>Edit Project</span>
								</div>
							</div>
						}
						interactive
						placement="right"
						theme="light">
						<span dangerouslySetInnerHTML={{ __html: projectId }} />
					</Tippy>
				</div>

				<span className={`${style} ${governmentIdTextColour}`} dangerouslySetInnerHTML={{ __html: governmentId || "NA" }} />

				<span className={`${style} space-x-5 cursor-pointer relative primary-text`}>
					{mainData.isLoading.selectedProject == project.id ? (
						<SpinnerSmall />
					) : (
						<Tippy allowHTML={true} content={<Tooltip text={`${project.client_id} - ${client}`} />}>
							<span dangerouslySetInnerHTML={{ __html: client }} onClick={() => toggleSingleProjectView(project)} />
						</Tippy>
					)}
				</span>

				<span className={style} dangerouslySetInnerHTML={{ __html: company }} />
				<span className={style} dangerouslySetInnerHTML={{ __html: mainProject }} />
				<span className={style} dangerouslySetInnerHTML={{ __html: subProject }} />
				<span className={`${style} space-x-1`}>{uiTeams(project)}</span>
				<span className={style}>{dueOn}</span>

				{uiLastNote(project.id, style)}

				<span className={style}>{uiStatusMenu(client, project)}</span>
			</div>
		);
	};

	const uiSearch = () => {
		if (apiData.allProjects.apiCopy.length) {
			return (
				<TextInputNative
					id="searchBox"
					icon={faSearch}
					onChange={(event) => setInputs("searchTerm", event.target.value)}
					onClearButtonClick={() => setInputs("searchTerm", "")}
					placeholder=""
					showClearButton={showSearchBoxClearButton}
					tabIndex={1}
					value={mainData.searchTerm}
					width="w-44"
				/>
			);
		}
	};

	const uiSortArrows = (column) => {
		if (mainData.sort.column == column) {
			if (mainData.sort.isAscending) {
				return <FontAwesomeIcon className="text-white" icon={faSortAmountDesc} />;
			} else {
				return <FontAwesomeIcon className="text-white" icon={faSortAmountAsc} />;
			}
		}
	};

	const uiStatusMenu = (clientName, project) => {
		const isCompleted = project.status == projectStatuses.Completed;
		const wrapper = `flex w-full px-4 justify-between items-center focus:outline-none font-regular-10 !py-0`;

		const icon = isCompleted ? faBolt : faChevronDown;

		return (
			<Menu as="div" className="flex w-24 justify-center items-center relative">
				<MenuButton className={wrapper}>
					<span dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(project.status, mainData.searchTerm) }} />
					<FontAwesomeIcon icon={icon} />
				</MenuButton>
				{!isCompleted && (
					<MenuItems className="absolute w-full top-7 right-0 origin-top-right rounded focus:outline-none z-50 black-white-background bottom-shadow full-border">
						{uiStatusMenuList(clientName, project)}
					</MenuItems>
				)}
			</Menu>
		);
	};

	const uiStatusMenuList = (clientName, project) => {
		return Object.values(projectStatuses).map((status, index) => {
			const isSelected = status == project.status;
			const aesthetics = isSelected ? "primary-background-transparent-01 primary-text" : "black-white-background black-text";
			const wrapper = `flex w-full p-2 space-x-2.5 justify-between items-center cursor-pointer border-y ${aesthetics} hovered-rows`;

			return (
				<MenuItem as="div" className={wrapper} key={index} onClick={() => updateStatus(clientName, project, status)}>
					<span className="font-regular-10">{status}</span>
					{isSelected && <FontAwesomeIcon className="primary-text" icon={faCheck} />}
				</MenuItem>
			);
		});
	};

	const uiTabs = () => {
		const allModules = apiData.allProjects.apiCopy.length > 0 ? getAggregatedProjects() : {};

		return allModules.map((module, index) => {
			const backgroundAndText = module.key == mainData.activeModule.name ? "primary-background-transparent-01 primary-text" : "bg-transparent black-text";

			const labelStyle = "flex w-4/5 justify-start items-center";
			const countStyle = module.key != "All" && module.items.length ? "flex w-1/5 justify-end items-center font-regular-9 gray-text" : "hidden";

			const wrapper = `flex w-full py-2 px-4 space-x-2 justify-between items-center border-y hovered-rows ${backgroundAndText} font-regular-9`;

			return (
				<button className={wrapper} key={index} onClick={() => setModule(module)}>
					<span className={labelStyle}>{module.key}</span>
					<span className={countStyle}>{module.items.length}</span>
				</button>
			);
		});
	};

	const uiTeams = (project) => {
		const names = MyGlobal.GetAnyDataFromId(project.teams, "full_name");
		const initials = MyGlobal.GetInitials(names);
		const total = String(names).split(",").length;

		if (String(names).includes(",")) {
			if (total > 2) {
				return (
					<Tippy allowHTML content={uiTeamsListTooltip(names)}>
						<span className="cursor-help primary-text">{total}</span>
					</Tippy>
				);
			} else {
				return String(names)
					.split(",")
					.map((name) => uiTeamsTooltip(MyGlobal.GetInitials(name), name));
			}
		} else {
			return uiTeamsTooltip(initials, names);
		}
	};

	const uiTeamsListTooltip = (teams) => {
		const splitted = String(teams).split(",");

		return (
			<div className="flex flex-col w-full p-1 justify-between items-center font-regular-9">
				{!teams
					? "No teams involved"
					: splitted.map((member, index) => {
							const bottomBorder = index != splitted.length - 1 ? "bottom-border" : "border-transparent";
							const wrapper = `flex w-full justify-start items-center ${bottomBorder}`;

							return (
								<div className={wrapper} key={index}>
									{index + 1}. {member}
								</div>
							);
					  })}
			</div>
		);
	};

	const uiTeamsTooltip = (badgeText, tooltipText) => {
		return (
			<Tippy allowHTML content={<Tooltip text={tooltipText} />}>
				<span className="cursor-help">
					<BadgeSmall value={badgeText} />
				</span>
			</Tippy>
		);
	};

	// Hooks
	useEffect(() => {
		getSupportData();

		globalThis.addEventListener("keydown", detectKeystrokes);
		return () => globalThis.removeEventListener("keydown", detectKeystrokes);
	}, []);

	useEffect(() => {
		if (hasMounted.mainComponent) {
			doFiltering();
		}
	}, [mainData.searchTerm]);

	// Main UI
	if (!hasMounted.mainComponent) {
		return;
	}

	return (
		<div className="flex flex-col w-full h-full justify-start items-center">
			<>
				{!hasMounted.editProject && !hasMounted.singleProject && (
					<div className="flex w-full px-5 py-2.5 justify-between items-center">
						<div className="flex w-1/5 space-x-2 justify-start items-center">
							<span className="view-heading">{thisView}</span>
							{apiData.allProjects.api.length > 0 && <Badge value={getDataCount()} />}
						</div>
						<div className="flex w-1/2 space-x-2 justify-end items-center">
							{uiSearch()}
							{uiExport()}
						</div>
					</div>
				)}
				{uiMain()}
			</>

			{hasMounted.deleteProject && (
				<DeleteProject
					mount={hasMounted.deleteProject}
					projectId={mainData.selectedProject.id}
					reloadProjects={getSupportData}
					unmount={toggleDeleteProjectBox}
				/>
			)}

			{hasMounted.projectStatus && (
				<ProjectStatus mount={hasMounted.projectStatus} selectedProject={mainData.selectedProject} unmount={toggleProjectStatusBox} />
			)}

			{hasMounted.updateStatus && (
				<UpdateStatus
					mount={hasMounted.updateStatus}
					reloadProjects={getSupportData}
					selectedProject={mainData.selectedProject}
					unmount={toggleUpdateStatusBox}
				/>
			)}
		</div>
	);
}
