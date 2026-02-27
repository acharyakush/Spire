"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import MyConstants from "@/utilities/constants";

import { useState } from "react";
import { AvatarCircle, Spinner } from "@/components/Elements";
import { ComboBox2, TextArea } from "@/components/Inputs";
import { MyGlobal, safeJsonParse } from "@/utilities/global";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { faNoteSticky, faStar, faXmark } from "@fortawesome/free-solid-svg-icons";

export default function Details({ mount, refresh, todo, unmount }) {
	// Business Logic
	const [data, setData] = useState({ notes: "", status: todo.status });

	const [isLoading, setIsLoading] = useState(false);
	const [isBoxDragged, setIsBoxDragged] = useState(false);

	const notesTimeline = todo.notes_timeline ? safeJsonParse(todo.notes_timeline) : "";

	// Functions
	async function saveTodo() {
		try {
			setIsLoading(true);

			let notesTimeline = [data.notes, todo.notes];

			if (todo.notes_timeline) {
				const parsed = JSON.parse(todo.notes_timeline);
				parsed.unshift(data.notes + "::" + MyGlobal.GetUserId() + "::" + dayjs().format("hh:mm a, DD MMM, YYYY"));

				notesTimeline = parsed;
			}

			const body = {
				id: todo.id,
				notes: data.notes,
				notesTimeline,
				status: data.status,
			};

			const response = await axios.post(MyConstants.ApiEndpoints.Todos.EditDetails, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				refresh();

				if (data.status != todo.priority) {
					const activityMessage = `Edited status from <b>${todo.priority}</b> to <b>${data.status}</b>.`;

					MyGlobal.AddActivity(activityMessage, MyConstants.Modules.Base.Todos);
					MyGlobal.ShowSuccessToast(MyConstants.Messages.TodoEdited);
				}

				unmount();
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Todos > Details > Save Todo");
		} finally {
			setIsLoading(false);
		}
	}

	function setValues(key, value) {
		setData((s) => ({ ...s, [key]: value }));
	}

	// UI Components
	function uiAssignedTo() {
		const assignedToNames = MyGlobal.GetAnyDataFromId(todo.assigned_to, "full_name");

		return (
			<div className="flex flex-col w-full justify-center items-start">
				<span className="font-regular-10 gray-text">Assigned To</span>
				<span className="font-medium-12 black-text">{assignedToNames}</span>
			</div>
		);
	}

	function uiDescription() {
		const timeline = todo.description_timeline ? JSON.parse(todo.description_timeline) : "";

		return (
			<div className="flex flex-col w-full justify-center items-start">
				<span className="font-regular-10 gray-text">Description</span>
				<div className="w-full font-medium-12 black-text">
					{timeline
						? timeline?.map((m, i) => (
								<div className="w-full">
									{i + 1}. {m}
								</div>
							))
						: todo.description}
				</div>
			</div>
		);
	}

	function uiDueDate() {
		const dueDate = todo.due_date ? dayjs(todo.due_date).format("DD MMM, YYYY") : "---";

		return (
			<div className="flex flex-col w-full pl-40 justify-center items-start">
				<span className="font-regular-10 gray-text">Due Date</span>
				<span className="font-medium-12 black-text">{dueDate}</span>
			</div>
		);
	}

	function uiNotes() {
		return <TextArea icon={faNoteSticky} key={1} label="Notes" onChange={(e) => setValues("notes", e.target.value)} onKeyDown={() => {}} rows={3} tabIndex={1} value={data.notes} width="w-full" />;
	}

	function uiPriority() {
		return (
			<div className="flex flex-col w-full justify-center items-start">
				<span className="font-regular-10 gray-text">Priority</span>
				<span className="font-medium-12 black-text">{todo.priority}</span>
			</div>
		);
	}

	function uiSaveButton() {
		if (isLoading) {
			return (
				<span className="px-3.5">
					<Spinner />
				</span>
			);
		} else {
			return "Save";
		}
	}

	function uiStatus() {
		if (MyGlobal.IsUserAdministrator()) {
			return (
				<div className="flex flex-col w-full pl-36 justify-center items-start">
					<ComboBox2 allowCreatingNewItem comparingValue1="" comparingValue2={data.status} displayValue="" filteredData={["Completed", "InProgress", "Pending"]} icon={faStar} isReadOnly={false} label="Status" onChange={(e) => setValues("status", e)} onClick={() => {}} onInputChange={() => {}} onKeyPress={() => {}} searchedItem={{}} tabIndex={4} value={data.status} width="w-full" />
				</div>
			);
		}
	}

	function uiClient() {
		return (
			<div className="flex flex-col w-full justify-center items-start">
				<span className="font-regular-10 gray-text">Client</span>
				<div className="w-full font-medium-12 black-text">{todo.client_name}</div>
			</div>
		);
	}

	function uiSubProject() {
		return (
			<div className="flex flex-col w-full justify-center items-start">
				<span className="font-regular-10 gray-text">Project</span>
				<div className="w-full font-medium-12 black-text">{todo.sub_project_name}</div>
			</div>
		);
	}

	function uiTitleBar() {
		const titleBarCursor = isBoxDragged ? "cursor-grabbing" : "cursor-grab";
		const titleBarStyle = `dialog-header shadow draggable-handle ${titleBarCursor}`;

		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">To-Do Details</span>
				<FontAwesomeIcon className="cursor-pointer" icon={faXmark} onClick={() => unmount()} />
			</DialogTitle>
		);
	}

	// Main UI
	return (
		<Dialog as="div" className="relative z-50" open={mount} onClose={() => unmount()}>
			<div className="fixed inset-0 bg-black/50" />
			<div className="flex w-full justify-center items-center fixed inset-0 overflow-y-auto">
				<DialogPanel className="w-4/5 transform overflow-hidden rounded contrast-background shadow">
					{uiTitleBar()}
					<div className="flex flex-col w-full p-6 space-y-6 justify-between items-center">
						<div className="flex w-full justify-between items-center">
							{uiDescription()}
							{todo.client_name && uiClient()}
							{todo.sub_project_name && uiSubProject()}
						</div>
						<div className="flex w-full justify-between items-center">
							{uiAssignedTo()}
							{uiDueDate()}
						</div>
						<div className="flex w-full justify-between items-center">
							{uiPriority()}
							{uiStatus()}
						</div>
						<div className="flex flex-col w-full justify-start items-center">
							{(todo.notes || todo.notes_timeline) && <span className="w-full text-left font-regular-10 gray-text">Notes</span>}
							<div className="w-full h-[150px] overflow-y-auto text-left font-medium-12 black-text">
								{todo.notes_timeline
									? notesTimeline?.map((m, i) => {
											const [note, clientId, timestamp] = String(m).split("::");
											let clientName = "";

											if (clientId) {
												clientName = MyGlobal.GetAnyDataFromId(clientId, "full_name");
											}

											return (
												<ul className="py-1 pr-5" key={i}>
													<li>
														<div className="flex w-full justify-between items-center">
															<div className="flex w-3/5 items-center">
																{i + 1}. {note}
															</div>
															<div className="flex w-2/5 space-x-5 justify-end items-center">
																<span className="gray-text text-sm">{timestamp}</span>
																<AvatarCircle name={clientName} />
															</div>
														</div>
													</li>
												</ul>
											);
										})
									: todo.notes}
							</div>
						</div>
						{uiNotes()}
					</div>
					<footer className="dialog-footer">
						<button className="primary-button-condensed" onClick={() => saveTodo()}>
							{uiSaveButton()}
						</button>
					</footer>
				</DialogPanel>
			</div>
		</Dialog>
	);
}
