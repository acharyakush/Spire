"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import dayjs from "dayjs";
import axios from "axios";
import Draggable from "react-draggable";
import MyConstants from "@/utilities/constants";

import { MyGlobal } from "@/utilities/global";
import { Spinner } from "@/components/Elements";
import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { ComboBox2, ComboBoxWithChips, DatePicker, TextArea } from "@/components/Inputs";
import { faCalendar, faDiagramProject, faNoteSticky, faStar, faUser, faUserGroup, faXmark } from "@fortawesome/free-solid-svg-icons";

export default function AddTodo({ mount, refresh, unmount }) {
	// Business Logic
	const assignedToMenuRef = useRef(null);

	const [data, setData] = useState({
		assignedTo: [],
		description: "",
		dueDate: "",
		priority: "Medium",
	});

	const [selectedClient, setSelectedClient] = useState({});
	const [clientSearch, setClientSearch] = useState("");

	const [selectedProject, setSelectedProject] = useState({});
	const [projectSearch, setProjectSearch] = useState("");

	const [supportData, setSupportData] = useState({ clients: [], clientsCopy: [], projects: [] });

	const [isFetching, setIsFetching] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isBoxDragged, setIsBoxDragged] = useState(false);

	const [mounted, setMounted] = useState({ assignedToMenu: false });

	const isUserAdministrator = useMemo(() => MyGlobal.IsUserAdministrator(), []);

	const disableAddButton = isLoading || !data.description || !data.assignedTo.length ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";
	const addButtonStyle = `primary-button-condensed ${disableAddButton}`;

	// Functions
	async function addTodo() {
		try {
			setIsLoading(true);

			const body = {
				clientId: selectedClient?.id,
				description: data.description,
				assignedTo: data.assignedTo.map((m) => m.id).join(","),
				dueDate: data.dueDate,
				priority: data.priority,
				projectId: selectedProject?.id,
				userId: MyGlobal.GetUserId(),
			};

			const response = await axios.post(MyConstants.ApiEndpoints.Todos.AddTodo, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				refresh();

				const assignedTos = data.assignedTo.map((m) => m.full_name).join(", ");

				let activityMessage = `Added <b>${data.description}</b> for <b>${assignedTos}</b> on <b>${data.priority}</b> basis.`;

				if (data.dueDate) {
					activityMessage = `Added <b>${data.description}</b> for <b>${assignedTos}</b> to be completed by <b>${dayjs(data.dueDate).format("DD/MM/YYYY")}</b> on <b>${data.priority}</b> basis.`;
				}

				MyGlobal.AddActivity(activityMessage, MyConstants.Modules.Base.Todos);
				MyGlobal.ShowSuccessToast(MyConstants.Messages.TodoAdded);

				unmount();
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Todos > Add Todo");
		} finally {
			setIsLoading(false);
		}
	}

	function detectOutsideClick(event) {
		if (assignedToMenuRef.current && !assignedToMenuRef.current.contains(event.target)) {
			setMounted((s) => ({ ...s, assignedToMenu: false }));
		}
	}

	function getFilteredClients() {
		let list = !supportData.clientsCopy.length ? [] : supportData.clientsCopy;

		if (list.length) {
			if (clientSearch) {
				list = supportData.clientsCopy.filter((f) => {
					return String(f.name).toLowerCase().includes(clientSearch.toLowerCase());
				});
			}
		}

		return list;
	}

	function getFilteredProjects() {
		let list = !selectedClient?.projects?.length ? [] : selectedClient?.projects;

		if (list.length) {
			if (projectSearch) {
				list = selectedClient?.projects?.filter((f) => {
					return String(f.main_project_name).toLowerCase().includes(projectSearch.toLowerCase());
				});
			}
		}

		return list;
	}

	async function getSupportData() {
		try {
			setIsFetching(true);

			const response = await axios.get(MyConstants.ApiEndpoints.Todos.GetAddTodoSupportData, MyGlobal.GetHeaders());

			if (response.status === 200) {
				const clients = response.data.clients.map((m) => {
					const projects = response.data.projects
						.filter((f) => f.client_id === m.id)
						.map((m) => {
							const mainProjectName = response.data.mainProjects.filter((f) => f.id === m.main_project_id).at(0).name;

							const subProjectName = response.data.subProjects.filter((f) => f.id === m.sub_project_id).at(0).name;

							return { ...m, main_project_name: mainProjectName, name: subProjectName };
						});

					return { ...m, projects };
				});
				setSupportData({ clients, clientsCopy: clients, projects: response.data.projects });
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Add Todo > getSupportData()");
		} finally {
			setIsFetching(false);
		}
	}

	function setValues(key, value) {
		if (key === "assignedTo") {
			let old = [...data.assignedTo];

			if (old.includes(value)) {
				old = old.filter((f) => f !== value);
			} else {
				old.push(value);
			}

			setData((s) => ({ ...s, assignedTo: old }));
		} else {
			setData((s) => ({ ...s, [key]: value }));
		}
	}

	function toggleAssignedToMenu() {
		setMounted((s) => ({ ...s, assignedToMenu: !s.assignedToMenu }));
	}

	// UI Components
	function uiAddButton() {
		if (isLoading) {
			return (
				<span className="px-3.5">
					<Spinner />
				</span>
			);
		} else {
			return "Add";
		}
	}

	function uiAssignedTo() {
		const showMenu = mounted.assignedToMenu ? "flex flex-col w-[98%] max-h-[220px] justify-start items-center absolute rounded overflow-y-auto bottom-shadow primary-light-background full-border" : "hidden";

		return (
			<div
				className="w-full"
				ref={assignedToMenuRef}>
				<ComboBoxWithChips
					displayKey="full_name"
					label="Assigned To"
					icon={faUserGroup}
					onBlur={() => toggleAssignedToMenu()}
					onItemClick={(e) => setValues("assignedTo", e)}
					onSelectedItemClick={(e) => setValues("assignedTo", e)}
					selectedItems={data.assignedTo}
					showList={showMenu}
					source={MyGlobal.GetAllUsers().filter((f) => {
						if (isUserAdministrator) return f;
						return !String(f.id).startsWith("A");
					})}
					toggleMenu={() => toggleAssignedToMenu()}
				/>
			</div>
		);
	}

	function uiClient() {
		return (
			<ComboBox2
				allowCreatingNewItem={false}
				comparingValue1="name"
				comparingValue2={selectedClient?.name}
				displayValue="name"
				filteredData={getFilteredClients}
				hasDataObject
				icon={faUser}
				isReadOnly={false}
				label="Clients"
				onChange={(e) => setSelectedClient(e)}
				onClick={() => {}}
				onInputChange={(e) => setClientSearch(!e.target.value ? "" : e.target.value)}
				onKeyPress={() => {}}
				searchedItem={clientSearch}
				showFullObject
				tabIndex={1}
				value={selectedClient?.name ?? ""}
				width="w-full"
			/>
		);
	}

	function uiDescription() {
		return (
			<TextArea
				icon={faNoteSticky}
				label="Description"
				onChange={(e) => setValues("description", e.target.value)}
				onKeyDown={() => {}}
				rows={5}
				tabIndex={1}
				value={data.description}
				width="w-full"
			/>
		);
	}

	function uiDueDate() {
		return (
			<DatePicker
				icon={faCalendar}
				label="Due Date"
				onChange={(e) => setValues("dueDate", e)}
				tabIndex={4}
				value={data.dueDate}
				width="w-full"
			/>
		);
	}

	function uiPriority() {
		return (
			<ComboBox2
				allowCreatingNewItem
				comparingValue1=""
				comparingValue2={data.priority}
				displayValue=""
				filteredData={["Low", "Medium", "High", "Urgent"]}
				icon={faStar}
				isReadOnly={false}
				label="Priority"
				onChange={(e) => setValues("priority", e)}
				onClick={() => {}}
				onInputChange={() => {}}
				onKeyPress={() => {}}
				searchedItem={{}}
				tabIndex={3}
				value={data.priority}
				width="w-full"
			/>
		);
	}

	function uiSelectedClientsProjects() {
		return (
			<ComboBox2
				allowCreatingNewItem={false}
				comparingValue1={["id", "name"]}
				comparingValue2={selectedProject?.id + " - " + selectedProject?.name}
				displayValue={["id", "name"]}
				filteredData={getFilteredProjects}
				hasDataObject
				icon={faDiagramProject}
				isMultipleDisplayValue
				multipleDisplayValue={["id", "name"]}
				isReadOnly={false}
				label="Projects"
				onChange={(e) => setSelectedProject(e)}
				onClick={() => {}}
				onInputChange={(e) => setProjectSearch(!e.target.value ? "" : e.target.value)}
				onKeyPress={() => {}}
				searchedItem={projectSearch}
				showFullObject
				tabIndex={1}
				value={selectedProject ? selectedProject?.id + " - " + selectedProject?.name : ""}
				width="w-full"
			/>
		);
	}

	function uiTitleBar() {
		const titleBarCursor = isBoxDragged ? "cursor-grabbing" : "cursor-grab";
		const titleBarStyle = `dialog-header shadow draggable-handle ${titleBarCursor}`;

		return (
			<DialogTitle
				as="h2"
				className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">Add To-Do</span>
				<FontAwesomeIcon
					className="cursor-pointer"
					icon={faXmark}
					onClick={() => unmount()}
				/>
			</DialogTitle>
		);
	}

	// Hooks
	useEffect(() => {
		getSupportData();
	}, []);

	useEffect(() => {
		setProjectSearch("");
		setSelectedProject(!selectedClient ? {} : selectedClient?.projects?.at(0));
	}, [selectedClient]);

	useEffect(() => {
		if (mounted.assignedToMenu) {
			document.addEventListener("mousedown", detectOutsideClick);
		}

		return () => document.removeEventListener("mousedown", detectOutsideClick);
	}, [mounted.assignedToMenu]);

	// Main UI
	return (
		<Dialog
			as="div"
			className="relative z-50"
			open={mount}
			onClose={() => unmount()}>
			<div className="fixed inset-0 bg-black/50" />
			<div className="flex w-full justify-center items-center fixed inset-0 overflow-y-auto">
				<Draggable
					handle=".draggable-handle"
					onStart={() => setIsBoxDragged(true)}
					onStop={() => setIsBoxDragged(false)}>
					<DialogPanel className="w-3/5 transform overflow-hidden rounded contrast-background shadow">
						{uiTitleBar()}
						<div className="flex flex-col w-full p-6 space-y-6 justify-between items-center">
							<div className="flex w-full space-x-6 justify-between items-center">
								{uiClient()}
								{uiSelectedClientsProjects()}
							</div>
							{uiAssignedTo()}
							<div className="flex w-full space-x-6 justify-between items-start">
								<div className="flex flex-col w-1/2 h-full justify-center items-center">{uiDescription()}</div>
								<div className="flex flex-col w-1/2 h-full space-y-4 justify-center items-center">
									{uiPriority()}
									{uiDueDate()}
								</div>
							</div>
						</div>
						<footer className="dialog-footer">
							<button
								className={addButtonStyle}
								onClick={() => addTodo()}>
								{uiAddButton()}
							</button>
						</footer>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}
