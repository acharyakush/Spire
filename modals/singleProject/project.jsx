"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import Draggable from "react-draggable";
import MyConstants from "@/utilities/constants";

import { useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { Spinner } from "@/components/Elements";
import { TextArea, TextInput } from "@/components/Inputs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { faIdCardClip, faIndianRupeeSign, faNoteSticky, faXmark } from "@fortawesome/free-solid-svg-icons";

export function EditStatus({ mount, reloadTasks, selectedTask, unmount }) {
	// Business Logic
	const [state, setState] = useState({ isBoxDragged: false, isLoading: false, reason: "" });

	const isStatusNotCompleted = selectedTask.status != MyConstants.Statuses.Tasks.Completed;

	const reasonBoxStyle = isStatusNotCompleted ? "flex flex-col w-full px-2.5 pt-0 pb-5 justify-center items-center" : "hidden";

	const titleBarCursor = state.isBoxDragged ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header draggable-handle ${titleBarCursor}`;

	let disableEditButton = state.isLoading ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";

	if (isStatusNotCompleted) {
		disableEditButton = state.isLoading || !state.reason ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";
	}

	const disableButtonStyle = `primary-button-condensed ${disableEditButton}`;

	let activityMessage = `Disabled <b>${selectedTask.id}</b>.`;
	let messageBody = "Are you sure you want to disable this task? You are required to write a reason below.";

	if (selectedTask.status == MyConstants.Statuses.Tasks.Enable) {
		activityMessage = `Enabled <b>${selectedTask.id}</b>.`;
		messageBody = "Are you sure you want to enable this task? You are required to write a reason below.";
	}

	// Functions
	const editStatus = async () => {
		setState((old) => ({ ...old, isLoading: true }));

		const body = {
			reason: state.reason,
			status: selectedTask.status,
			taskId: selectedTask.id,
			type: "edit-task-status",
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
			MyGlobal.HandleErrors(error, "Edit Project Status");
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
							<button className={disableButtonStyle} onClick={() => editStatus()}>
								{uiButton()}
							</button>
						</footer>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}

export function EditQuote({ mount, reloadProjects, selectedProject, unmount }) {
	// Business Logic
	const [state, setState] = useState({ isBoxDragged: false, isLoading: false, quote: "" });

	const titleBarCursor = state.isBoxDragged ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header draggable-handle ${titleBarCursor}`;

	const disableEditButton = state.isLoading || !state.quote ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";

	const editButtonStyle = `primary-button-condensed ${disableEditButton}`;

	// Functions
	const editQuote = async () => {
		setState((old) => ({ ...old, isLoading: true }));

		const body = {
			projectId: selectedProject.id,
			quote: state.quote,
			type: "edit-quote",
			userId: MyGlobal.GetUserId(),
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reloadProjects(selectedProject.id);

				MyGlobal.AddActivity(
					`Edited quote of <b>${selectedProject.id}</b> from <b>${selectedProject.quote}</b> to <b>${state.quote}</b>.`,
					MyConstants.Modules.Base.Projects,
				);

				MyGlobal.ShowSuccessToast(MyConstants.Messages.QuoteEdited);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Edit Project Quote");
		} finally {
			setState((old) => ({ ...old, isLoading: false, quote: "" }));
			unmount(false);
		}
	};

	const setBoxDrag = () => {
		setState((old) => ({ ...old, isBoxDragged: !state.isBoxDragged }));
	};

	const setQuote = (quote) => {
		setState((old) => ({ ...old, quote }));
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
				<span className="flex w-full justify-start items-center">Edit Quote</span>
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
					<DialogPanel className="w-[400px] transform overflow-hidden rounded shadow contrast-background">
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
							<button className={editButtonStyle} onClick={() => editQuote()}>
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
		: `Edited government id of <b>${selectedProject.id}</b> to <b>${state.id}</b> from <b>${selectedProject.government_id}</b>.`;

	const successMessage = isTypeAdd ? MyConstants.Messages.GovernmentIdAdded : MyConstants.Messages.GovernmentIdEdited;

	const titleBarText = isTypeAdd ? "Add Government ID" : "Edit Government ID";

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
			type: "manage-government-id",
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
			return isTypeAdd ? "Add" : "Edit";
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
					<DialogPanel className="w-[400px] transform overflow-hidden rounded contrast-background shadow">
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
