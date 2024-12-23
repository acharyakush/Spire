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
import { faCalendar, faCoins, faIdCardClip, faIndianRupeeSign, faListCheck, faNoteSticky, faXmark } from "@fortawesome/free-solid-svg-icons";

export function AddTask({ addTask, mount, unmount }) {
	// Business Logic
	const today = new Date();
	const sevenDaysFromToday = today.setDate(today.getDate() + 7);

	const [state, setState] = useState({
		content: "",
		due_on: sevenDaysFromToday,
		expense: 0,
		id: "TK000000",
		isBoxDragged: false,
		remark: "",
	});

	const titleBarCursor = state.isBoxDragged ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header draggable-handle ${titleBarCursor}`;

	// Functions
	const addNewTask = () => {
		addTask(state);

		setState({
			content: "",
			due_on: sevenDaysFromToday,
			expense: 0,
			id: "TK000000",
			isBoxDragged: false,
			remark: "",
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
					<DialogPanel className="w-[400px] transform overflow-hidden rounded black-white-background shadow">
						{uiTitleBar()}
						<div className="flex flex-col w-full p-2.5 space-y-2 justify-between items-center">
							<TextArea
								icon={faListCheck}
								key={1}
								label="Task"
								onChange={(event) => setInputs("content", event.target.value)}
								onKeyDown={() => {}}
								rows={2}
								tabIndex={1}
								value={state.content}
								width="w-full"
							/>
							<DatePicker
								icon={faCalendar}
								label="Date"
								onChange={(event) => setInputs("due_on", event)}
								tabIndex={2}
								value={state.due_on}
								width="w-full"
							/>
							<TextArea
								icon={faNoteSticky}
								key={2}
								label="Remark"
								onChange={(event) => setInputs("remark", event.target.value)}
								onKeyDown={() => {}}
								rows={2}
								tabIndex={3}
								value={state.remark}
								width="w-full"
							/>
							<TextInput
								icon={faCoins}
								label="Expense"
								onChange={(event) => setInputs("expense", event.target.value)}
								onKeyPress={(event) => !MyGlobal.HasNumbers(event.key) && event.preventDefault()}
								tabIndex={4}
								value={state.expense}
								width="w-full"
							/>
						</div>
						<footer className="dialog-footer">
							<button className="primary-button-condensed" onClick={() => addNewTask()}>
								{uiButton()}
							</button>
						</footer>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}

export function ManageGovernmentId({ mount, reloadProjects, selectedProject, unmount }) {
	// Business Logic
	const isTypeAdd = !selectedProject.government_id ? true : false;

	const [state, setState] = useState({
		id: "",
		isBoxBeingDragged: false,
		isLoading: false,
	});

	const activityMessage = isTypeAdd
		? `Added government id <b>${state.id}</b> in <b>${selectedProject.id}</b>.`
		: `Updated government id of <b>${selectedProject.id}</b> to <b>${state.id}</b> from <b>${selectedProject.government_id}</b>.`;

	const successMessage = isTypeAdd ? MyConstants.Messages.GovernmentIdAdded : MyConstants.Messages.GovernmentIdUpdated;

	const titleBarText = isTypeAdd ? "Add Government ID" : "Update Government ID";

	const titleBarCursor = state.isBoxBeingDragged ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header draggable-handle ${titleBarCursor}`;

	const buttonClickEvent = state.isLoading || !state.id ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";
	const buttonStyle = `primary-button-condensed ${buttonClickEvent}`;

	// Functions
	const manageGovernmentId = async () => {
		setState((old) => ({ ...old, isLoading: true }));

		const body = {
			governmentId: state.id,
			projectId: selectedProject.id,
			type: "handle-government-id",
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reloadProjects(selectedProject.id);

				MyGlobal.AddActivity(activityMessage, MyConstants.Modules.Base.Projects);
				MyGlobal.ShowSuccessToast(successMessage);

				unmount();
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, titleBarText);
		} finally {
			setState((old) => ({ ...old, isLoading: false, id: "" }));
		}
	};

	const setBoxDrag = () => {
		setState((old) => ({ ...old, isBoxBeingDragged: !state.isBoxBeingDragged }));
	};

	const setInput = (id) => {
		setState((old) => ({ ...old, id: String(id).toUpperCase() }));
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
			return isTypeAdd ? "Add" : "Update";
		}
	};

	const uiTitleBar = () => {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">{titleBarText}</span>
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
					<DialogPanel className="w-[400px] transform overflow-hidden rounded black-white-background shadow">
						{uiTitleBar()}
						<div className="flex flex-col w-full p-2.5 space-y-2 justify-center items-center">
							{!isTypeAdd && (
								<TextInput
									icon={faIdCardClip}
									isReadOnly
									label="Current Government ID"
									onChange={() => {}}
									onKeyPress={() => {}}
									tabIndex={1}
									value={selectedProject.government_id}
									width="w-full"
								/>
							)}
							<TextInput
								icon={faIdCardClip}
								label="New Government ID"
								onChange={(event) => setInput(event.target.value)}
								onKeyPress={() => {}}
								tabIndex={2}
								value={state.id}
								width="w-full"
							/>
						</div>
						<footer className="dialog-footer">
							<button className={buttonStyle} onClick={() => manageGovernmentId()}>
								{uiButton()}
							</button>
						</footer>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}

export function UpdateProjectStatus({ mount, reloadTasks, selectedTask, unmount }) {
	// Business Logic
	const [state, setState] = useState({ isBoxDragged: false, isLoading: false, reason: "" });

	const isStatusNotCompleted = selectedTask.status != MyConstants.Statuses.Tasks.Completed;

	const reasonBoxStyle = isStatusNotCompleted ? "flex flex-col w-full px-2.5 pt-0 pb-5 justify-center items-center" : "hidden";
	const titleBarCursor = state.isBoxDragged ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header draggable-handle ${titleBarCursor}`;

	let disableUpdateButton = state.isLoading ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";

	if (isStatusNotCompleted) {
		disableUpdateButton = state.isLoading || !state.reason ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";
	}

	const disableButtonStyle = `primary-button-condensed ${disableUpdateButton}`;

	let activityMessage = `Disabled <b>${selectedTask.id}</b>.`;
	let messageBody = "Are you sure you want to disable this task? You are required to write a reason below.";

	if (selectedTask.status == MyConstants.Statuses.Tasks.Enable) {
		activityMessage = `Enabled <b>${selectedTask.id}</b>.`;
		messageBody = "Are you sure you want to enable this task? You are required to write a reason below.";
	}

	// Functions
	const setBoxDrag = () => {
		setState((old) => ({ ...old, isBoxDragged: !state.isBoxDragged }));
	};

	const setReason = (reason) => {
		setState((old) => ({ ...old, reason }));
	};

	const updateStatus = async () => {
		setState((old) => ({ ...old, isLoading: true }));

		const body = {
			reason: state.reason,
			status: selectedTask.status,
			taskId: selectedTask.id,
			type: "update-task-status",
			userId: MyGlobal.GetUserId(),
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reloadTasks();

				const successMessage =
					selectedTask.status == MyConstants.Statuses.Tasks.Disable ? MyConstants.Messages.TaskDisabled : MyConstants.Messages.TaskEnabled;

				MyGlobal.AddActivity(activityMessage, MyConstants.Modules.Base.Tasks);
				MyGlobal.ShowSuccessToast(successMessage);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Change Task Status");
		} finally {
			setState((old) => ({ ...old, isLoading: false, reason: "" }));
			unmount(false);
		}
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
			return "Update";
		}
	};

	const uiTitleBar = () => {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">Update Status</span>
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
					<DialogPanel className="w-[400px] transform overflow-hidden rounded black-white-background shadow">
						{uiTitleBar()}
						<span className="block w-full p-5 whitespace-pre-line font-regular-11 black-text" dangerouslySetInnerHTML={{ __html: messageBody }} />
						<div className={reasonBoxStyle}>
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
							<button className={disableButtonStyle} onClick={() => updateStatus()}>
								{uiButton()}
							</button>
						</footer>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}

export function UpdateQuote({ mount, reloadProjects, selectedProject, unmount }) {
	// Business Logic
	const [state, setState] = useState({ isBoxDragged: false, isLoading: false, quote: "" });

	const titleBarCursor = state.isBoxDragged ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header draggable-handle ${titleBarCursor}`;

	const disableUpdateButton = state.isLoading || !state.quote ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";

	const updateButtonStyle = `primary-button-condensed ${disableUpdateButton}`;

	// Functions
	const setBoxDrag = () => {
		setState((old) => ({ ...old, isBoxDragged: !state.isBoxDragged }));
	};

	const setQuote = (quote) => {
		setState((old) => ({ ...old, quote }));
	};

	const updateQuote = async () => {
		setState((old) => ({ ...old, isLoading: true }));

		const body = {
			projectId: selectedProject.id,
			quote: state.quote,
			type: "update-quote",
			userId: MyGlobal.GetUserId(),
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reloadProjects(selectedProject.id);

				MyGlobal.AddActivity(
					`Updated quote of <b>${selectedProject.id}</b> from <b>${selectedProject.quote}</b> to <b>${state.quote}</b>.`,
					MyConstants.Modules.Base.Projects,
				);

				MyGlobal.ShowSuccessToast(MyConstants.Messages.QuoteUpdated);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Update Project Quote");
		} finally {
			setState((old) => ({ ...old, isLoading: false, quote: "" }));
			unmount(false);
		}
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
			return "Update";
		}
	};

	const uiTitleBar = () => {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">Update Quote</span>
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
					<DialogPanel className="w-[400px] transform overflow-hidden rounded shadow black-white-background">
						{uiTitleBar()}
						<div className="flex flex-col w-full p-2.5 space-y-2 justify-center items-center">
							<TextInput
								icon={faIndianRupeeSign}
								isReadOnly
								key={1}
								label="Current Quote"
								onChange={() => {}}
								onKeyPress={() => {}}
								tabIndex={1}
								value={selectedProject.quote}
								width="w-full"
							/>
							<TextInput
								icon={faIndianRupeeSign}
								key={2}
								label="New Quote"
								onChange={(event) => setQuote(event.target.value)}
								onKeyPress={(event) => !MyGlobal.HasNumbers(event.key) && event.preventDefault()}
								tabIndex={2}
								value={state.quote}
								width="w-full"
							/>
						</div>
						<footer className="dialog-footer">
							<button className={updateButtonStyle} onClick={() => updateQuote()}>
								{uiButton()}
							</button>
						</footer>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}

export function UpdateTask({ mount, reloadTasks, selectedTask, unmount }) {
	// Business Logic
	const [state, setState] = useState({
		content: selectedTask.content,
		due_on: selectedTask.due_on,
		expense: selectedTask.expense,
		id: selectedTask.id,
		isBoxDragged: false,
		isLoading: false,
		remark: selectedTask.remark,
	});

	const titleBarCursor = state.isBoxDragged ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header draggable-handle ${titleBarCursor}`;

	// Functions
	const setBoxDrag = () => {
		setState((old) => ({ ...old, isBoxDragged: !state.isBoxDragged }));
	};

	const setInputs = (key, value) => {
		setState((old) => ({ ...old, [key]: value }));
	};

	const updateTask = async () => {
		setState((old) => ({ ...old, isLoading: true }));

		const body = {
			content: MyGlobal.EscapeString(selectedTask.content),
			due_on: dayjs(state.due_on).format("YYYY-MM-DD"),
			expense: Number(selectedTask.expense),
			taskId: selectedTask.id,
			remark: MyGlobal.EscapeString(selectedTask.remark),
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reloadTasks();

				MyGlobal.AddActivity(`Updated <b>${selectedTask.id}</b> in <b>${selectedTask.project_id}</b>.`, MyConstants.Modules.Base.Tasks);

				MyGlobal.ShowSuccessToast(MyConstants.Messages.TaskUpdated);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Update Task");
		} finally {
			setState((old) => ({ ...old, isLoading: false }));
		}
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
			return "Update";
		}
	};

	const uiTitleBar = () => {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">Update Task</span>
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
					<DialogPanel className="w-[400px] transform overflow-hidden rounded black-white-background shadow">
						{uiTitleBar()}
						<div className="flex flex-col w-full p-2.5 space-y-2 justify-between items-center">
							<TextArea
								icon={faListCheck}
								key={1}
								label="Task"
								onChange={(event) => setInputs("content", event.target.value)}
								onKeyDown={() => {}}
								rows={2}
								tabIndex={1}
								value={state.content}
								width="w-full"
							/>
							<DatePicker
								icon={faCalendar}
								label="Date"
								onChange={(event) => setInputs("due_on", event)}
								tabIndex={2}
								value={state.due_on}
								width="w-full"
							/>
							<TextArea
								icon={faNoteSticky}
								key={2}
								label="Remark"
								onChange={(event) => setInputs("remark", event.target.value)}
								onKeyDown={() => {}}
								rows={2}
								tabIndex={3}
								value={state.remark}
								width="w-full"
							/>
							<TextInput
								icon={faCoins}
								label="Expense"
								onChange={(event) => setInputs("expense", event.target.value)}
								onKeyPress={(event) => !MyGlobal.HasNumbers(event.key) && event.preventDefault()}
								tabIndex={4}
								value={state.expense}
								width="w-full"
							/>
						</div>
						<footer className="dialog-footer">
							<button className="primary-button-condensed" onClick={() => updateTask()}>
								{uiButton()}
							</button>
						</footer>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}
