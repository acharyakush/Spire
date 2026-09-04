"use client";

import dayjs from "dayjs";
import axios from "axios";
import Tippy from "@tippyjs/react";

import { MyGlobal } from "@/utilities/global";
import { AvatarCircle } from "@/components/Elements";
import HeadlessSelect from "@/components/ui/HeadlessSelect";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useEffect, useMemo, useState } from "react";
import { faMultiply, faPencil, faPlaneUp, faSpinner, faTrash } from "@fortawesome/free-solid-svg-icons";
import { ApiEndpoints, BaseModules, DerivedModules, ProjectStatusesBasic, ProjectStatusesFull } from "@/utilities/constants";

const thisView = BaseModules.Projects;
const arrProjectStatuses = Object.values(ProjectStatusesBasic);
const { active: sActive, cancelled: sCancelled, closed: sClosed, completed: sCompleted, hold: sHold, overdue: sOverdue, today: sToday, tomorrow: sTomorrow, upcoming: sUpcoming } = ProjectStatusesFull;

const arrTeamTypes = [
	{ key: "Assigned alone", value: "Assigned alone" },
	{ key: "Assigned with team", value: "Assigned with team" },
];

export default function Projects({ presetStatus = "", setModuleProps = () => {} }) {
	// Business Logic
	const defaultStatus = presetStatus.length ? presetStatus.replace("MySpace", "") : "Active";

	const [notes, setNotes] = useState([]);
	const [statuses, setStatuses] = useState({});
	const [projects, setProjects] = useState({ copy: [], data: [] });

	const [activeProject, setActiveProject] = useState({});
	const [activeView, setActiveView] = useState({ name: "All", records: [] });
	const [activeStaff, setActiveStaff] = useState({ fullName: "", id: "", type: "" });

	// Filters
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [dueDate, setDueDate] = useState({ from: "", to: "" });
	const [activeStatus, setActiveStatus] = useState(defaultStatus);
	const [sort, setSort] = useState({ column: "ID", isAscending: false });

	const [showGoToTopOrb, setShowGoToTopOrb] = useState(false);
	const [isLoading, setIsLoading] = useState({ activeProject: false, projects: false });
	const [showRecordMenu, setShowRecordMenu] = useState({ deleteProject: -1, editProject: -1 });

	const [isOpen, setIsOpen] = useState({ deleteProject: false, editProject: false, editStatus: false, mainComponent: false, projectStatus: false, singleProject: false, todo: false });

	// Single Initialization
	const today = useMemo(() => dayjs(), []);
	const isUserAdministrator = useMemo(() => MyGlobal.IsUserAdministrator(), []);

	const allowDeletingProject = useMemo(() => MyGlobal.HasPermission(DerivedModules.DeleteProject), []);
	const allowEditingProject = useMemo(() => MyGlobal.HasPermission(DerivedModules.EditProject), []);

	const arrStatuses = useMemo(() => Object.entries(statuses).map(([key, value]) => ({ count: value, label: key + (value > 0 ? " " + String.fromCharCode(183) + " " + value : ""), value: key })), [statuses]);
	const arrTeams = useMemo(() => MyGlobal.GetAllUsers().map((m) => ({ fullName: m.full_name, id: m.id, label: m.full_name, value: m.id })), []);

	const showSearchClearButton = search.length ? "cursor-pointer primary-text" : "hidden";
	const blankDataWrapper = "flex w-full h-full justify-center-safe items-center-safe contrast-background full-border";

	// Functions
	function autoFocusSearchBox(e) {
		if (e.ctrlKey && e.key === "f") {
			e.preventDefault();
			document.getElementById("searchBox").focus();
		}
	}

	async function getData(projectId) {
		setIsLoading((s) => ({ ...s, projects: true }));

		try {
			const response = await axios.get(ApiEndpoints.Projects.GetProjects, MyGlobal.GetHeaders());

			if (response.status === 200) {
				const isSingleUser = presetStatus.includes("MySpace");

				const source = response.data.projects.filter((f) => {
					if (isSingleUser) {
						const teamIds = String(f.teams || "")
							.split(",")
							.map((m) => m.trim())
							.filter(Boolean);

						return teamIds.includes(MyGlobal.GetUserId()) || String(f.entry_by_id) === MyGlobal.GetUserId();
					}

					return f;
				});

				setNotes(response.data.notes);
				setProjects({ copy: source, data: source });

				if (projectId) {
					const reloadedSelectedProject = source.find((f) => f.id == projectId);
					setActiveProject(reloadedSelectedProject);
				}

				console.log(getTotalStatusCountsByProject(source));
				setStatuses(getTotalStatusCountsByProject(source));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, `${thisView} => Get Support Data`);
		} finally {
			setIsLoading((s) => ({ ...s, projects: false }));
		}
	}

	function getStatusSeverityBackground(status) {
		switch (status) {
			case sActive:
				return "orange-text";
			case sClosed:
			case sCancelled:
				return "gray-text";
			case sHold:
				return "red-text";
			case sCompleted:
				return "green-text";
			default:
				return "orange-background";
		}
	}

	function getStatusSeverityBackground2(status) {
		switch (status) {
			case sActive:
				return "orange-background";
			case sClosed:
			case sCancelled:
				return "gray-background";
			case sHold:
				return "red-background";
			case sCompleted:
				return "green-background";
			default:
				return "orange-background";
		}
	}

	function getTotalQuote() {
		let total = 0;
		let fullTotal = 0;

		projects.data.forEach((fe) => (total += +fe.quote));
		projects.copy.forEach((fe) => (fullTotal += +fe.quote));

		if (search.length || activeStatus.length) return MyGlobal.ThousandSeparator(total) + " / " + MyGlobal.ThousandSeparator(fullTotal);

		return MyGlobal.ThousandSeparator(fullTotal);
	}

	function getTotalRecordsCount() {
		return projects.copy.length;
	}

	function getTotalStatusCountsByProject(list = []) {
		const counts = { [sActive]: 0, [sCancelled]: 0, [sClosed]: 0, [sCompleted]: 0, [sHold]: 0, [sOverdue]: 0, [sToday]: 0, [sTomorrow]: 0, [sUpcoming]: 0 };

		list.forEach((fe) => {
			if (counts.hasOwnProperty(fe.status)) counts[fe.status]++;
			if (fe.has_tasks_overdue) counts.Overdue++;
			if (fe.has_tasks_due_today) counts.Today++;
			if (fe.has_tasks_due_tomorrow) counts.Tomorrow++;
			if (fe.has_tasks_upcoming) counts.Upcoming++;
		});

		return counts;
	}

	const getTotalStatusesByProject = useCallback(() => {
		const source = activeView.name === "All" ? projects.copy : activeView.records;
		if (!search.length) return getTotalStatusCountsByProject(source);

		// Apply only text filter if it exists
		// To get accurate status counts
		const _search = search.toLowerCase();
		const filteredData = source.filter((f) => {
			return String(f.id).toLowerCase().includes(_search) || String(f.government_id).toLowerCase().includes(_search) || String(f.client_id).toLowerCase().includes(_search) || String(f.client_name).toLowerCase().includes(_search) || String(f.company_name).toLowerCase().includes(_search) || String(f.main_project_name).toLowerCase().includes(_search) || String(f.sub_project_name).toLowerCase().includes(_search) || String(f.team_names).toLowerCase().includes(_search) || String(f.team_names_initials).toLowerCase().includes(_search) || String(f.status).toLowerCase().includes(_search);
		});

		return getTotalStatusCountsByProject(filteredData);
	}, [activeView, projects.copy, search]);

	function setMouseEnter(id = -1) {
		if (allowDeletingProject) setShowRecordMenu((s) => ({ ...s, deleteProject: id }));
		if (allowEditingProject) setShowRecordMenu((s) => ({ ...s, editProject: id }));
	}

	function setMouseLeave(id = -1) {
		if (allowDeletingProject) setShowRecordMenu((s) => ({ ...s, deleteProject: -1 }));
		if (allowEditingProject) setShowRecordMenu((s) => ({ ...s, editProject: -1 }));
	}

	function setFilter(value) {
		setStatuses(getTotalStatusesByProject());
		setActiveStatus((s) => ({ ...s, selected: value }));
	}

	function setInputs(key, value) {
		if (key === "search") {
			setSearch(value);

			if (window.clearTimeout) clearTimeout(window.clearTimeout);
			window.clearTimeout = setTimeout(() => setDebouncedFindText(value), 250);
		} else {
			setMain((s) => ({ ...s, [key]: value }));
		}
	}

	function setView(key) {
		setActiveView({ name: key.key, records: key.items });
		setStatuses(getTotalStatusCountsByProject(key.records));
	}

	// UI Components
	function uiBody() {
		return (
			<div className="flex w-full h-full justify-center-safe items-start">
				{/* <div className="flex flex-col w-[10%] space-y-2.5 mx-5 items-center-safe">{uiList()}</div>
				<div className="flex flex-col w-[90%] h-full mr-5 items-center-safe">
					<div className="flex flex-col w-full h-full justify-center-safe items-start full-border">
						<div className="flex w-full h-9 justify-center-safe items-center-safe primary-background">{uiHeaders()}</div>
						<Virtuoso className="w-full h-full overflow-y-auto bottom-border contrast-background" data={sortedProjects} itemContent={(i_, row) => uiRows(row)} totalCount={sortedProjects.length} followOutput="auto" />
						<div className="fixed bottom-3 right-3 z-50 flex justify-center-safe items-center-safe space-x-3">
							{uiGoToTop()}
							{uiTotalQuote()}
						</div>
					</div>
				</div> */}
			</div>
		);
	}

	function uiGoToTop() {
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

	function uiMain() {
		if (isLoading.projects) {
			return (
				<div className={blankDataWrapper}>
					<FontAwesomeIcon icon={faSpinner} size="lg" spin />
				</div>
			);
		}

		if (!projects.copy.length) {
			return (
				<div className={blankDataWrapper}>
					<span className="font-regular-12 gray-text">No projects created.</span>
				</div>
			);
		}

		if (isOpen.editProject) return <EditProject project={activeProject} reload={getData} unmount={toggleEditProjectView} />;

		if (isOpen.singleProject) return <SingleProject client={main.selectedClient} project={activeProject} reload={getData} source="Single Project" unmount={toggleSingleProjectView} />;

		return uiBody();
	}

	function uiRows(row) {
		const style = `flex flex-col w-[16.66%] justify-center-safe items-center-safe text-center`;
		const childStyle = "flex w-full justify-center-safe items-center-safe";

		const parentLabelStyle = childStyle + " font-bold-12";
		const childLabelStyle = childStyle + " gray-text";

		const fancyRightBorderStyle = "absolute w-3 h-[50px] rounded-tr-full rounded-br-full " + getStatusSeverityBackground2(row.status) + " -left-1";

		const governmentId = MyGlobal.HighlightText(row.government_id ?? "", main.findText);

		const clientIdAndName = [`Client ID - ${row.client_id}`, <br key="br" />, `Project ID - ${row.id}`];
		const companyName = MyGlobal.HighlightText(row.company_name, main.findText);

		const mainProjectName = MyGlobal.HighlightText(row.main_project_name, main.findText);
		const subProjectName = MyGlobal.HighlightText(row.sub_project_name, main.findText);

		const background = row.status === sCompleted ? "green-background-transparent-01" : "contrast-background";

		const wrapper = `flex w-full py-3 justify-center-safe items-center-safe ${background} bottom-border font-regular-11 black-text`;

		const admins = row.teams_data.filter((f) => f.role === "Administrator").map((m) => m.full_name);
		const teams = row.teams_data.filter((f) => f.role !== "Administrator").map((m) => m.full_name);

		const spaceX = admins.length && teams.length ? "space-x-2.5" : "space-x-0";
		const avatarWrapper = style + " !flex-row " + spaceX;

		return (
			<div className={wrapper} key={row.id} onMouseEnter={() => setMouseEnter(row.id)} onMouseLeave={() => setMouseLeave()}>
				<div className={`${style} cursor-help primary-text`}>
					<span className={fancyRightBorderStyle} />
					<Tippy
						content={
							<div className="flex flex-col py-1 items-center-safe">
								{allowDeletingProject && (
									<div className="flex w-full p-2 space-x-2 items-center-safe cursor-pointer font-regular-11 black-text" onClick={() => toggleDeleteProjectBox(row)}>
										<FontAwesomeIcon icon={faTrash} />
										<span>Delete Project</span>
									</div>
								)}
								<div className="flex w-full p-2 space-x-2 items-center-safe cursor-pointer font-regular-11 black-text" onClick={() => toggleEditProjectView(row)}>
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
				<span className={style}>
					<HeadlessSelect data={arrProjectStatuses} placeholder={row.status} value={row.status} />
				</span>
			</div>
		);
	}

	// Hooks
	useEffect(() => {
		getData();

		window.addEventListener("keydown", autoFocusSearchBox);
		return () => window.removeEventListener("keydown", autoFocusSearchBox);
	}, []);

	useEffect(() => {
		console.log(activeStaff);
	}, [activeStaff]);

	// Main UI
	return (
		<div className="flex flex-col w-full h-full items-center-safe">
			{!isOpen.editProject && !isOpen.singleProject && (
				<div className="flex w-full px-5 py-2.5 justify-between items-center-safe">
					<div className="flex w-1/5 space-x-2 justify-start items-center-safe">
						<span className="view-heading">{thisView}</span>
						<span className="rounded bg-(--text) px-2 font-medium-12 text-white">
							{getTotalRecordsCount()}
						</span>
					</div>
					<div className="flex w-4/5 space-x-3 justify-center-safe items-center-safe">
						<div className="flex w-full h-9 px-3 space-x-1 justify-start items-center rounded primary-background-transparent-01 primary-bottom-border-transparent-05">
							<input className="inputs text-[10pt]!" onChange={(e) => setSearch(e.currentTarget.value)} placeholder="Search" value={search} />
							{search.length > 0 && <FontAwesomeIcon className="cursor-pointer text-gray-400" icon={faMultiply} onClick={() => setSearch("")} />}
						</div>

						<HeadlessSelect clearable data={arrStatuses} onClear={() => setActiveStatus("")} onChange={(value) => setActiveStatus(value)} placeholder="Status" value={activeStatus} />

						<HeadlessSelect clearable data={arrTeams} onClear={() => setActiveStaff((s) => ({ ...s, fullName: "", id: "" }))} onChange={(_, option) => setActiveStaff((s) => ({ ...s, fullName: option.fullName, id: option.id }))} placeholder="Team" value={activeStaff.id} />

						<HeadlessSelect clearable data={arrTeamTypes} onClear={() => setActiveStaff((s) => ({ ...s, type: "" }))} onChange={(value) => setActiveStaff((s) => ({ ...s, type: value }))} placeholder="Allotment" value={activeStaff.type} />
					</div>
				</div>
			)}
			{uiMain()}
		</div>
	);
}
