"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import Draggable from "react-draggable";
import MyConstants from "@/utilities/constants";

import { useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { Spinner } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { DatePicker, TextArea, TextInput } from "@/components/Inputs";
import { faCalendar, faCoins, faListCheck, faNoteSticky, faStickyNote, faXmark } from "@fortawesome/free-solid-svg-icons";

export function AddParticularAndRemark({ mount, reloadTasks, selectedTask, unmount }) {
	// Business Logic
	const [state, setState] = useState({
		isBoxDragged: false,
		isLoading: false,
		particular: "",
		remark: "",
	});

	const addButtonAesthetics = state.particular && state.remark ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-25";
	const addButtonStyle = `primary-button-condensed ${addButtonAesthetics}`;

	const titleBarCursor = state.isBoxDragged ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header draggable-handle ${titleBarCursor}`;

	// Functions
	const doInsertion = async () => {
		setState((old) => ({ ...old, isLoading: true }));

		const body = {
			createdBy: MyGlobal.GetUserId(),
			particular: MyGlobal.EscapeString(state.particular),
			projectId: selectedTask.project_id,
			remark: MyGlobal.EscapeString(state.remark),
			taskId: selectedTask.task_id,
			type: "add-tasks-particular-and-remark",
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reloadTasks();

				MyGlobal.AddActivity(
					`Added a particular and remark in <b>${selectedTask.task_id}</b> in <b>${selectedTask.project_id}</b>.`,
					MyConstants.Modules.Base.Tasks,
				);

				MyGlobal.ShowSuccessToast(MyConstants.Messages.TaskParticularAndRemarkEdited);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Add Particular And Remark");
		} finally {
			setState((old) => ({ ...old, isLoading: false }));
			unmount();
		}
	};

	const setBoxDrag = () => {
		setState((old) => ({ ...old, isBoxDragged: !state.isBoxDragged }));
	};

	const setInputs = (key, value) => {
		setState((old) => ({ ...old, [key]: value }));
	};

	// UI Components
	const uiButton = () => {
		if (state.isLoading) {
			return (
				<span className="px-3.5">
					<Spinner />
				</span>
			);
		} else {
			return "Add";
		}
	};

	const uiTitleBar = () => {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">Add Particular & Remark</span>
				<FontAwesomeIcon className="cursor-pointer" icon={faXmark} onClick={() => unmount(false)} />
			</DialogTitle>
		);
	};

	// Main UI
	return (
		<Dialog as="div" className="relative z-50" open={mount} onClose={() => unmount()}>
			<div className="fixed inset-0 bg-black/50" />
			<div className="flex w-full justify-center items-center fixed inset-0 overflow-y-auto">
				<Draggable handle=".draggable-handle" onStart={() => setBoxDrag()} onStop={() => setBoxDrag()}>
					<DialogPanel className="w-[400px] transform overflow-hidden rounded contrast-background shadow">
						{uiTitleBar()}
						<div className="flex flex-col w-full p-2.5 space-y-2 justify-between items-center">
							<TextArea
								icon={faListCheck}
								key={1}
								label="Particular"
								onChange={(event) => setInputs("particular", event.target.value)}
								onKeyDown={() => {}}
								rows={2}
								tabIndex={1}
								value={state.particular}
								width="w-full"
							/>
							<TextArea
								icon={faStickyNote}
								key={2}
								label="Remark"
								onChange={(event) => setInputs("remark", event.target.value)}
								onKeyDown={() => {}}
								rows={2}
								tabIndex={2}
								value={state.remark}
								width="w-full"
							/>
						</div>
						<footer className="dialog-footer">
							<button className={addButtonStyle} onClick={() => doInsertion()}>
								{uiButton()}
							</button>
						</footer>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}

export function AddTask({ addTask, mount, unmount }) {
	// Business Logic
	const today = dayjs();
	const sevenDaysFromToday = today.add(7, "day");

	const [state, setState] = useState({
		due_on: sevenDaysFromToday.toDate(),
		expense: 0,
		id: "TK000000",
		isBoxDragged: false,
		task: "",
	});

	const addButtonAesthetics = state.task ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-25";
	const addButtonStyle = `primary-button-condensed ${addButtonAesthetics}`;

	const titleBarCursor = state.isBoxDragged ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header draggable-handle ${titleBarCursor}`;

	// Functions
	const doInsertion = () => {
		addTask(state);

		setState({
			due_on: sevenDaysFromToday.toDate(),
			expense: 0,
			id: "TK000000",
			isBoxDragged: false,
			task: "",
		});
	};

	const setBoxDrag = () => {
		setState((old) => ({ ...old, isBoxDragged: !state.isBoxDragged }));
	};

	const setInputs = (key, value) => {
		setState((old) => ({ ...old, [key]: value }));
	};

	// UI Components
	const uiButton = () => {
		if (state.isLoading) {
			return (
				<span className="px-3.5">
					<Spinner />
				</span>
			);
		} else {
			return "Add";
		}
	};

	const uiTitleBar = () => {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">Add Task</span>
				<FontAwesomeIcon className="cursor-pointer" icon={faXmark} onClick={() => unmount(false)} />
			</DialogTitle>
		);
	};

	// Main UI
	return (
		<Dialog as="div" className="relative z-50" open={mount} onClose={() => unmount()}>
			<div className="fixed inset-0 bg-black/50" />
			<div className="flex w-full justify-center items-center fixed inset-0 overflow-y-auto">
				<Draggable handle=".draggable-handle" onStart={() => setBoxDrag()} onStop={() => setBoxDrag()}>
					<DialogPanel className="w-[400px] h-[510px] transform overflow-hidden rounded contrast-background shadow">
						{uiTitleBar()}
						<div className="flex flex-col w-full h-[calc(100%-45px)] justify-between items-center">
							<div className="flex flex-col w-full h-full p-2.5 space-y-2 justify-start items-center">
								<TextInput
									icon={faListCheck}
									label="Task"
									onChange={(event) => setInputs("task", event.target.value)}
									onKeyPress={() => {}}
									tabIndex={1}
									value={state.task}
									width="w-full"
								/>
								<DatePicker
									icon={faCalendar}
									label="Due On"
									onChange={(event) => setInputs("due_on", event)}
									tabIndex={2}
									value={state.due_on}
									width="w-full"
								/>
								<TextInput
									icon={faCoins}
									label="Expense"
									onChange={(event) => setInputs("expense", event.target.value)}
									onKeyPress={(event) => !MyGlobal.HasNumbers(event.key) && event.preventDefault()}
									tabIndex={3}
									value={state.expense}
									width="w-full"
								/>
							</div>
							<footer className="dialog-footer w-full">
								<button className={addButtonStyle} onClick={() => doInsertion()}>
									{uiButton()}
								</button>
							</footer>
						</div>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}

export function EditParticularAndRemark({ mount, reloadTasks, selectedTask, unmount }) {
	// Business Logic
	const [state, setState] = useState({
		isBoxDragged: false,
		isLoading: false,
		particular: selectedTask.particular,
		remark: selectedTask.remark,
	});

	const titleBarCursor = state.isBoxDragged ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header draggable-handle ${titleBarCursor}`;

	// Functions
	const doEditing = async () => {
		setState((old) => ({ ...old, isLoading: true }));

		const body = {
			particular: MyGlobal.EscapeString(state.particular),
			projectId: selectedTask.project_id,
			remark: MyGlobal.EscapeString(state.remark),
			rowId: selectedTask.id,
			taskId: selectedTask.task_id,
			type: "edit-tasks-particular-and-remark",
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reloadTasks();

				MyGlobal.AddActivity(getAddActivityMessage(), MyConstants.Modules.Base.Tasks);
				MyGlobal.ShowSuccessToast(MyConstants.Messages.TaskParticularAndRemarkEdited);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Edit Selected Tasks Particular And Remark");
		} finally {
			setState((old) => ({ ...old, isLoading: false }));
			unmount();
		}
	};

	const getAddActivityMessage = () => {
		const changes = [];

		["particular", "remark"].forEach((key) => {
			if (selectedTask[key] !== state[key]) {
				changes.push({
					old: selectedTask[key],
					new: state[key],
					label: MyGlobal.Capitalize(key),
				});
			}
		});

		const messages = changes.map((change) => `${change.label} from <b>${change.old}</b> to <b>${change.new}</b>`);

		const finalMessage = messages.join(", ");

		return `Edited ${finalMessage} of <b>${selectedTask.task_id}</b> in <b>${selectedTask.project_id}</b>.`;
	};

	const setBoxDrag = () => {
		setState((old) => ({ ...old, isBoxDragged: !state.isBoxDragged }));
	};

	const setInputs = (key, value) => {
		setState((old) => ({ ...old, [key]: value }));
	};

	// UI Components
	const uiButton = () => {
		if (state.isLoading) {
			return (
				<span className="px-3.5">
					<Spinner />
				</span>
			);
		} else {
			return "Edit";
		}
	};

	const uiTitleBar = () => {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">Edit Task</span>
				<FontAwesomeIcon className="cursor-pointer" icon={faXmark} onClick={() => unmount(false)} />
			</DialogTitle>
		);
	};

	// Main UI
	return (
		<Dialog as="div" className="relative z-50" open={mount} onClose={() => unmount()}>
			<div className="fixed inset-0 bg-black/50" />
			<div className="flex w-full justify-center items-center fixed inset-0 overflow-y-auto">
				<Draggable handle=".draggable-handle" onStart={() => setBoxDrag()} onStop={() => setBoxDrag()}>
					<DialogPanel className="w-[400px] transform overflow-hidden rounded contrast-background shadow">
						{uiTitleBar()}
						<div className="flex flex-col w-full p-2.5 space-y-2 justify-center items-center">
							<TextArea
								icon={faListCheck}
								key={1}
								label="Particular"
								onChange={(event) => setInputs("particular", event.target.value)}
								onKeyDown={() => {}}
								rows={2}
								tabIndex={1}
								value={state.particular}
								width="w-full"
							/>
							<TextArea
								icon={faStickyNote}
								key={2}
								label="Remark"
								onChange={(event) => setInputs("remark", event.target.value)}
								onKeyDown={() => {}}
								rows={2}
								tabIndex={2}
								value={state.remark}
								width="w-full"
							/>
						</div>
						<footer className="dialog-footer">
							<button className="primary-button-condensed" onClick={() => doEditing()}>
								{uiButton()}
							</button>
						</footer>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}

export function EditTask({ mount, reloadTasks, selectedTask, unmount }) {
	// Business Logic
	const [state, setState] = useState({
		due_on: selectedTask.due_on,
		expense: selectedTask.expense,
		id: selectedTask.id,
		isBoxDragged: false,
		isLoading: false,
		task: selectedTask.task,
	});

	const titleBarCursor = state.isBoxDragged ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header draggable-handle ${titleBarCursor}`;

	// Functions
	const editTask = async () => {
		setState((old) => ({ ...old, isLoading: true }));

		const editTaskBody = {
			dueOn: dayjs(state.due_on).format("YYYY-MM-DD"),
			expense: Number(state.expense),
			task: MyGlobal.EscapeString(state.task),
			taskId: selectedTask.id,
			type: "edit-task",
		};

		try {
			const editTaskBodyResponse = await axios.post(MyConstants.ApiEndpoints.Setter, editTaskBody, MyGlobal.GetHeaders());

			if (editTaskBodyResponse.status === 200) {
				reloadTasks();

				MyGlobal.AddActivity(getAddActivityMessage(), MyConstants.Modules.Base.Tasks);
				MyGlobal.ShowSuccessToast(MyConstants.Messages.TaskEdited);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Edit Task");
		} finally {
			setState((old) => ({ ...old, isLoading: false }));
			unmount();
		}
	};

	const getAddActivityMessage = () => {
		const changes = [];

		["due_on", "expense", "task"].forEach((key) => {
			if (selectedTask[key] !== state[key]) {
				changes.push({
					old: selectedTask[key],
					new: state[key],
					label: key === "due_on" ? "Due Date" : MyGlobal.Capitalize(key),
				});
			}
		});

		const messages = changes.map((change) => `${change.label} from <b>${change.old}</b> to <b>${change.new}</b>`);

		const finalMessage = messages.join(", ");

		return `Edited ${finalMessage} of <b>${selectedTask.id}</b> in <b>${selectedTask.project_id}</b>.`;
	};

	const setBoxDrag = () => {
		setState((old) => ({ ...old, isBoxDragged: !state.isBoxDragged }));
	};

	const setInputs = (key, value) => {
		setState((old) => ({ ...old, [key]: value }));
	};

	// UI Components
	const uiButton = () => {
		if (state.isLoading) {
			return (
				<span className="px-3.5">
					<Spinner />
				</span>
			);
		} else {
			return "Edit";
		}
	};

	const uiTitleBar = () => {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">Edit Task</span>
				<FontAwesomeIcon className="cursor-pointer" icon={faXmark} onClick={() => unmount(false)} />
			</DialogTitle>
		);
	};

	// Main UI
	return (
		<Dialog as="div" className="relative z-50" open={mount} onClose={() => unmount()}>
			<div className="fixed inset-0 bg-black/50" />
			<div className="flex w-full justify-center items-center fixed inset-0 overflow-y-auto">
				<Draggable handle=".draggable-handle" onStart={() => setBoxDrag()} onStop={() => setBoxDrag()}>
					<DialogPanel className="w-[400px] h-[510px] transform overflow-hidden rounded contrast-background shadow">
						{uiTitleBar()}
						<div className="flex flex-col w-full h-[calc(100%-45px)] justify-between items-center">
							<div className="flex flex-col w-full h-full p-2.5 space-y-2 justify-start items-center">
								<TextInput
									icon={faListCheck}
									label="Task"
									onChange={(event) => setInputs("task", event.target.value)}
									onKeyPress={() => {}}
									tabIndex={1}
									value={state.task}
									width="w-full"
								/>
								<DatePicker
									icon={faCalendar}
									label="Due On"
									onChange={(event) => setInputs("due_on", event)}
									tabIndex={2}
									value={state.due_on}
									width="w-full"
								/>
								<TextInput
									icon={faCoins}
									label="Expense"
									onChange={(event) => setInputs("expense", event.target.value)}
									onKeyPress={(event) => !MyGlobal.HasNumbers(event.key) && event.preventDefault()}
									tabIndex={3}
									value={state.expense}
									width="w-full"
								/>
							</div>
							<footer className="dialog-footer w-full">
								<button className="primary-button-condensed" onClick={() => editTask()}>
									{uiButton()}
								</button>
							</footer>
						</div>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}

export function EditTaskStatus({ mount, reloadTasks, selectedTask, unmount }) {
	// Business Logic
	const [state, setState] = useState({ isBoxDragged: false, isLoading: false, reason: "" });

	const titleBarCursor = state.isBoxDragged ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header draggable-handle ${titleBarCursor}`;

	const editButtonClickEvent = state.isLoading || !state.reason ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";

	const editButtonStyle = `primary-button-condensed ${editButtonClickEvent}`;

	let isCompleted = 0;
	let isDisabled = 0;
	let messageBody = "";
	let activityMessage = "";

	switch (selectedTask.status) {
		case MyConstants.Statuses.Tasks.Enable:
			activityMessage = `Enabled <b>${selectedTask.id}</b> due to <b>${state.reason}</b>`;
			messageBody = "Are you sure you want to enable this task?";
			break;
		case MyConstants.Statuses.Tasks.Disable:
			isDisabled = 1;
			activityMessage = `Disabled <b>${selectedTask.id}</b> due to <b>${state.reason}</b>`;
			messageBody = "Are you sure you want to disable this task?";
			break;
		case MyConstants.Statuses.Tasks.Completed:
			isCompleted = 1;
			activityMessage = `Marked Task as Completed <b>${selectedTask.id}</b> due to <b>${state.reason}</b>`;
			messageBody = "Are you sure you want to mark this task completed?";
			break;
	}

	// Functions
	const editStatus = async () => {
		setState((old) => ({ ...old, isLoading: true }));

		const body = {
			isCompleted,
			isDisabled,
			reason: state.reason,
			taskId: selectedTask.id,
			type: "edit-task-status",
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reloadTasks();

				MyGlobal.AddActivity(activityMessage, MyConstants.Modules.Base.Tasks);
				MyGlobal.ShowSuccessToast(MyConstants.Messages.TaskEdited);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Edit Task Status");
		} finally {
			setState((old) => ({ ...old, isLoading: false, reason: "" }));
			unmount(false);
		}
	};

	const setBoxDrag = () => {
		setState((old) => ({ ...old, isBoxDragged: !state.isBoxDragged }));
	};

	const setReason = (reason) => {
		setState((old) => ({ ...old, reason }));
	};

	// UI Components
	const uiButton = () => {
		if (state.isLoading) {
			return (
				<span className="px-3.5">
					<Spinner />
				</span>
			);
		} else {
			return "Edit";
		}
	};

	const uiTitleBar = () => {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">Edit Status</span>
				<FontAwesomeIcon className="cursor-pointer" icon={faXmark} onClick={() => unmount(false)} />
			</DialogTitle>
		);
	};

	// Main UI
	return (
		<Dialog as="div" className="relative z-50" open={mount} onClose={() => unmount(false)}>
			<div className="fixed inset-0 bg-black/50" />
			<div className="flex w-full justify-center items-center fixed inset-0 overflow-y-auto">
				<Draggable handle=".draggable-handle" onStart={() => setBoxDrag()} onStop={() => setBoxDrag()}>
					<DialogPanel className="w-[400px] transform overflow-hidden rounded contrast-background shadow">
						{uiTitleBar()}
						<span className="flex w-full p-5 font-regular-12 black-text">{messageBody} You are required to write a reason below.</span>
						<div className="flex flex-col w-full px-2.5 pb-5 justify-center items-center">
							<TextArea
								icon={faNoteSticky}
								key={1}
								label="Reason"
								onChange={(event) => setReason(event.target.value)}
								onKeyDown={() => {}}
								rows={3}
								tabIndex={1}
								value={state.reason}
								width="w-full"
							/>
						</div>
						<footer className="dialog-footer">
							<button className={editButtonStyle} onClick={() => editStatus()}>
								{uiButton()}
							</button>
						</footer>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}
