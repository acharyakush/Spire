"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import Draggable from "react-draggable";
import MyConstants from "@/utilities/constants";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { TextArea } from "@/components/Inputs";
import { Spinner } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { faStickyNote, faXmark } from "@fortawesome/free-solid-svg-icons";

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

			let notesTimeline = main.activeModuleData.notes ? [main.newNote, main.activeModuleData.notes] : [main.newNote];

			if (main.activeModuleData.notes_timeline) {
				const parsed = JSON.parse(main.activeModuleData.notes_timeline);
				parsed.unshift(main.newNote);

				notesTimeline = parsed;
			}

			const body = {
				id: main.activeModuleData.id,
				notesTimeline,
				status: main.activeModuleData.status,
			};

			const response = await axios.post(MyConstants.ApiEndpoints.Todos.EditDetails, body, MyGlobal.GetHeaders());

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

	function setBoxDrag() {
		setMain((s) => ({ ...s, isBoxMoving: !main.isBoxMoving }));
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
					<div className="flex flex-col w-1/2 justify-center items-end">
						<span className="font-regular-10 gray-text">Due Date</span>
						<span className="font-medium-12 text-red-500">{dayjs(main.activeModuleData.due_date).format("DD MMM, YYYY")}</span>
					</div>
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
		return project.todos.map((m, i) => {
			const style = m.description == main.activeModule ? "primary-border primary-background-transparent-01 primary-text" : "full-border bg-white black-text";

			const wrapper = `flex w-full px-4 py-2 justify-between items-center rounded shadow ${style} font-regular-10 hovered-rows`;

			return (
				<button
					className={wrapper}
					key={i}
					onClick={() => setModule(m, i)}>
					<span className="text-left">{m.description}</span>
				</button>
			);
		});
	}

	function uiNotes() {
		const notesTimeline = main.activeModuleData.notes_timeline ? JSON.parse(main.activeModuleData.notes_timeline) : [];

		return (
			<div className="flex flex-col w-full justify-start items-center ">
				<span className="w-full text-left font-regular-10 gray-text">Notes</span>
				<div className="w-full font-regular-12 px-4">
					{notesTimeline
						? notesTimeline?.map((m, i) => (
								<ul className="list-disc">
									<li>{m}</li>
								</ul>
						  ))
						: main.activeModuleData.notes}
				</div>
			</div>
		);
	}

	function uiPriority() {
		return (
			<div className="flex flex-col w-full justify-center items-end">
				<span className="font-regular-10 gray-text">Priority</span>
				<span className="font-medium-12 black-text">{main.activeModuleData.priority}</span>
			</div>
		);
	}

	function uiStatus() {
		return (
			<div className="flex flex-col w-full justify-center items-end">
				<span className="font-regular-10 gray-text">Status</span>
				<span className="font-medium-12 black-text">{main.activeModuleData.status}</span>
			</div>
		);
	}

	function uiTitleBar() {
		return (
			<DialogTitle
				as="h2"
				className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">
					{project.client_name} - {project.sub_project_name} ({project.main_project_name}) :: Todos
				</span>
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
		setMain((s) => ({ ...s, activeModule: project.todos.at(0).description, activeModuleData: project.todos.at(0) }));
	}, []);

	useEffect(() => {
		setMain((s) => ({ ...s, activeModule: project.todos.at(main.activeModuleIndex).description, activeModuleData: project.todos.at(main.activeModuleIndex) }));
	}, [project]);

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
					onStart={() => setBoxDrag()}
					onStop={() => setBoxDrag()}>
					<DialogPanel className="w-4/5 transform overflow-hidden rounded shadow contrast-background">
						{uiTitleBar()}
						<div className="flex flex-col w-full py-6 space-y-3 justify-between items-center">
							<div className="flex w-full px-6 justify-center items-start space-x-5">
								<div className="flex flex-col w-[10%] space-y-2.5 justify-start items-center">{uiList()}</div>
								<div className="flex flex-col w-[90%] h-full justify-start items-center full-border rounded bg-gray-50">{uiBody()}</div>
							</div>
							<div className="flex w-full px-6 justify-center items-end space-x-5">
								<div className="w-[10%]"></div>
								<div className="flex w-[90%] space-x-5 justify-center items-center">
									<TextArea
										icon={faStickyNote}
										label="Add Note"
										onChange={(e) => setMain((s) => ({ ...s, newNote: e.target.value }))}
										tabIndex={1}
										width="w-full"
										value={main.newNote}
									/>
									<div className="h-[52px] flex justify-center items-end">
										<button
											className="primary-button-condensed"
											onClick={() => addNote()}>
											{uiButton()}
										</button>
									</div>
								</div>
							</div>
						</div>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}
