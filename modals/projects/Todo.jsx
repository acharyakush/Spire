"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import { ApiEndpoints, BaseModules, Messages } from "@/utilities/constants";

import { useEffect, useState } from "react";
import { MyGlobal, safeJsonParse } from "@/utilities/global";
import { ComboBox2, TextArea } from "@/components/Inputs";
import { AvatarCircle, Spinner } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { faCheckCircle, faStar, faStickyNote, faXmark } from "@fortawesome/free-solid-svg-icons";

export default function ProjectTodos({ mount, project, reload, unmount }) {
	// Business Logic
	const [main, setMain] = useState({
		activeModule: "All",
		activeModuleData: {
			id: 0,
			custom_id: "",
			client_id: "",
			project_id: "",
			description: "",
			description_timeline: "",
			assigned_to: "",
			due_date: "",
			priority: "",
			status: "",
			notes: "",
			notes_timeline: "",
			is_deleted: 0,
			entry_at: "",
			entry_by: "",
		},
		activeModuleIndex: null,
		isBoxMoving: false,
		isLoading: false,
		newNote: "",
	});

	const titleBarCursor = main.isBoxMoving ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header shadow draggable-handle ${titleBarCursor}`;

	// Functions
	async function addNote() {
		try {
			setMain((s) => ({ ...s, isLoading: true }));

			const suffix = "::" + MyGlobal.GetUserId() + "::" + dayjs().format("hh:mm a, DD MMM, YYYY");

			let notesTimeline = main.activeModuleData.notes ? [main.newNote + suffix, main.activeModuleData.notes + suffix] : [main.newNote + suffix];

			if (main.activeModuleData.notes_timeline) {
				const parsed = JSON.parse(main.activeModuleData.notes_timeline);
				parsed.unshift(main.newNote + suffix);

				notesTimeline = parsed;
			}

			const body = {
				id: main.activeModuleData.id,
				notesTimeline,
				status: main.activeModuleData.status,
			};

			const response = await axios.post(ApiEndpoints.Todos.EditDetails, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reload(project.id);

				MyGlobal.AddActivity("Added a todo note <b>" + main.newNote + "</b> of <b>" + project.id + " (" + project.sub_project_name + ")</b>");
				MyGlobal.ShowSuccessToast("New note added.");

				setMain((s) => ({ ...s, newNote: "" }));

				// unmount();
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Projects > Todos > addTodo()");
		} finally {
			setMain((s) => ({ ...s, isLoading: false }));
		}
	}

	async function updateStatus(status) {
		try {
			const body = {
				customId: main.activeModuleData.custom_id,
				id: main.activeModuleData.id,
				projectId: project.id,
				status,
				type: "update-todo-status",
			};

			const response = await axios.post(ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reload();

				const activityMessage = `Edited Todo status from <b>${main.activeModuleData.status}</b> to <b>${status}</b>.`;

				MyGlobal.AddActivity(activityMessage, BaseModules.Projects);
				MyGlobal.ShowSuccessToast(Messages.TodoEdited);

				unmount();
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Projects > Todos > Update Status");
		}
	}

	function setBoxDrag() {
		setMain((s) => ({ ...s, isBoxMoving: !s.isBoxMoving }));
	}

	function setModule(module, index) {
		setMain((s) => ({
			...s,
			activeModule: module.description,
			activeModuleData: module,
			activeModuleIndex: index,
		}));
	}

	// UI
	function uiAssignedTo() {
		const assignedToNames = MyGlobal.GetAnyDataFromId(main.activeModuleData.assigned_to, "full_name");

		return (
			<div className="flex flex-col w-full justify-center items-start">
				<span className="font-regular-10 gray-text">Assigned To</span>
				<span className="font-medium-12 black-text">{assignedToNames}</span>
			</div>
		);
	}

	function uiBody() {
		return (
			<div className="flex flex-col w-full p-5 space-y-5 justify-center items-center">
				<div className="flex w-full justify-between items-center">
					{uiDescription()}
					{main.activeModuleData.due_date && (
						<div className="flex flex-col w-1/2 justify-center items-end">
							<span className="font-regular-10 gray-text">Due Date</span>
							<span className="font-medium-12 text-red-500">{dayjs(main.activeModuleData.due_date).format("DD MMM, YYYY")}</span>
						</div>
					)}
				</div>
				<div className="flex w-full justify-between items-center">
					{uiAssignedTo()}
					<div className="flex w-full justify-center items-end">
						{uiPriority()}
						{uiStatus()}
					</div>
				</div>
				{uiNotes()}
			</div>
		);
	}

	function uiButton() {
		if (main.isLoading) {
			return (
				<span className="px-3.5">
					<Spinner />
				</span>
			);
		} else {
			return <span>Add</span>;
		}
	}

	function uiDescription() {
		const description = main.activeModuleData.description_timeline ? JSON.parse(main.activeModuleData.description_timeline) : "";

		return (
			<div className="flex flex-col w-1/2 justify-center items-start">
				<span className="font-regular-10 gray-text">Description</span>
				<div className="w-full font-medium-12 px-4 black-text">
					{description
						? description?.map((m, i) => (
								<ul className="list-disc">
									<li>{m}</li>
								</ul>
							))
						: main.activeModuleData.description}
				</div>
			</div>
		);
	}

	function uiList() {
		return project.todos
			.sort((a, b) => String(b.status).localeCompare(a.status))
			.map((m, i) => {
				const style = m.status === "Completed" ? "border border-gray-500 bg-gray-100 text-gray-400" : m.description == main.activeModule ? "primary-border primary-background-transparent-01 primary-text hovered-rows" : "full-border bg-white black-text hovered-rows";

				const wrapper = `flex w-full px-4 py-2 justify-between items-center rounded relative shadow ${style} font-regular-10`;

				return (
					<button className={wrapper} key={i} onClick={() => setModule(m, i)}>
						{m.status === "Completed" && <FontAwesomeIcon className="absolute -top-2 -left-3 bg-white rounded-full text-green-500" icon={faCheckCircle} size="2x" />}
						<span className="text-left">{m.description}</span>
					</button>
				);
			});
	}

	function uiNotes() {
		try {
			const notesTimeline = main.activeModuleData.notes_timeline ? safeJsonParse(main.activeModuleData.notes_timeline) : [];

			return (
				<div className="flex flex-col w-full justify-start items-center ">
					<span className="w-full text-left font-regular-10 gray-text">Notes</span>
					<div className="w-full h-[200px] divide-y overflow-y-auto font-regular-12 space-y-2 p-4 bg-white rounded full-border">
						{notesTimeline
							? notesTimeline?.map((m, i) => {
									const [note, userId, timestamp] = String(m).split("::");
									const userFullName = MyGlobal.GetAnyDataFromId(userId, "full_name");

									return (
										<ul className="list-item" key={i}>
											<li>
												<div className="flex w-full justify-between items-center">
													<span className="w-3/5">
														{i + 1}. {note}
													</span>
													<div className="flex w-2/5 space-x-5 justify-end items-center">
														<span className="gray-text text-sm">{timestamp}</span>
														<AvatarCircle name={userFullName} />
													</div>
												</div>
											</li>
										</ul>
									);
								})
							: main.activeModuleData.notes}
					</div>
				</div>
			);
		} catch (error) {
			console.log(error);
		}
	}

	function uiPriority() {
		return (
			<div className="flex flex-col w-full h-[77px] justify-center items-start">
				<span className="font-regular-10 gray-text">Priority</span>
				<span className="font-medium-12 black-text">{main.activeModuleData.priority}</span>
			</div>
		);
	}

	function uiStatus() {
		return (
			<div className="flex flex-col w-full justify-center items-end">
				<ComboBox2 allowCreatingNewItem comparingValue1="" comparingValue2={main.activeModuleData.status} displayValue="" filteredData={["Completed", "InProgress", "Pending"]} icon={faStar} isReadOnly={main.activeModuleData.status === "Completed"} label="Status" onChange={(e) => updateStatus(e)} onClick={() => {}} onInputChange={() => {}} onKeyPress={() => {}} searchedItem={{}} tabIndex={4} value={main.activeModuleData.status} width="w-full" />
			</div>
		);
	}

	function uiTitleBar() {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">
					{project.client_name} - {project.sub_project_name} ({project.main_project_name}) :: Todos
				</span>
				<FontAwesomeIcon className="cursor-pointer" icon={faXmark} onClick={() => unmount()} />
			</DialogTitle>
		);
	}

	// Hooks
	useEffect(() => {
		setMain((s) => ({
			...s,
			activeModule: project.todos.at(0).description,
			activeModuleData: project.todos.at(0),
		}));
	}, []);

	useEffect(() => {
		setMain((s) => ({
			...s,
			activeModule: project.todos.at(main.activeModuleIndex).description,
			activeModuleData: project.todos.at(main.activeModuleIndex),
		}));
	}, [project]);

	// Main UI
	return (
		<Dialog as="div" className="relative z-50" open={mount} onClose={() => unmount()}>
			<div className="fixed inset-0 bg-black/50" />
			<div className="flex w-full justify-center items-center fixed inset-0 overflow-y-auto">
				<DialogPanel className="w-4/5 transform overflow-hidden rounded shadow contrast-background">
					{uiTitleBar()}
					<div className="flex flex-col w-full py-6 space-y-3 justify-between items-center">
						<div className="flex w-full px-6 justify-center items-start space-x-5">
							<div className="flex flex-col w-[10%] space-y-3 justify-start items-center">{uiList()}</div>
							<div className="flex flex-col w-[90%] h-full justify-start items-center full-border rounded bg-gray-50">{uiBody()}</div>
						</div>
						<div className="flex w-full px-6 justify-center items-end space-x-5">
							<div className="w-[10%]"></div>
							<div className="flex w-[90%] space-x-5 justify-center items-center">
								<TextArea icon={faStickyNote} label="Add Note" onChange={(e) => setMain((s) => ({ ...s, newNote: e.target.value }))} tabIndex={1} width="w-full" value={main.newNote} />
								<div className="h-[52px] flex justify-center items-end">
									<button className="primary-button-condensed" onClick={() => addNote()}>
										{uiButton()}
									</button>
								</div>
							</div>
						</div>
					</div>
				</DialogPanel>
			</div>
		</Dialog>
	);
}
