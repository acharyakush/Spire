"use client";

import axios from "axios";
import Draggable from "react-draggable";
import MyConstants from "@/utilities/constants";

import { useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { TextArea } from "@/components/Inputs";
import { Spinner } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { faArrowRight, faNoteSticky, faXmark } from "@fortawesome/free-solid-svg-icons";

export function ChangeStatus({ mount, reloadProjects, selectedProject, unmount }) {
	// Business Logic
	const [state, setState] = useState({ isBoxDragged: false, isLoading: false, reason: "" });

	const isNewStatusNotActive = selectedProject.new_status != MyConstants.Statuses.Projects.Active;

	const reasonBoxStyle = isNewStatusNotActive ? "flex flex-col w-full px-2.5 pt-0 pb-5 justify-center items-center" : "hidden";
	const titleBarCursor = state.isBoxDragged ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header draggable-handle ${titleBarCursor}`;

	let disableYesButton = state.isLoading ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";

	if (isNewStatusNotActive) {
		disableYesButton = state.isLoading || !state.reason ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";
	}

	const yesButtonStyle = `primary-button-condensed ${disableYesButton}`;

	let messageBody = "";
	let activityMessage = "";

	switch (selectedProject.new_status) {
		case MyConstants.Statuses.Projects.Active:
			activityMessage = `Projects :: Resumed project (${selectedProject.id}).`;
			messageBody = "Are you sure you want to re-active this project?";
			break;
		case MyConstants.Statuses.Projects.Cancelled:
			activityMessage = `Projects :: Cancelled project (${selectedProject.id}).`;
			messageBody = "Are you sure you want to cancel this project? You are required to write a cancellation reason below.";
			break;
		case MyConstants.Statuses.Projects.Closed:
			activityMessage = `Projects :: Closed project (${selectedProject.id}).`;
			messageBody = "Are you sure you want to close this project? You are required to write a closure reason below.";
			break;
		case MyConstants.Statuses.Projects.Hold:
			activityMessage = `Projects :: Project (${selectedProject.id}) kept on ${selectedProject.new_status}.`;
			messageBody = "Are you sure you want to keep this project on hold? You are required to write a reason below.";
			break;
	}

	// Functions
	const changeStatus = async () => {
		setState((old) => ({ ...old, isLoading: true }));

		const body = {
			id: selectedProject.id,
			reason: state.reason,
			status: selectedProject.new_status,
			type: "change-project-status",
			userId: MyGlobal.GetUserId(),
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reloadProjects();

				MyGlobal.AddActivity(`${activityMessage}. From ${selectedProject.status} to ${selectedProject.new_status}.`);

				MyGlobal.ShowSuccessToast(MyConstants.Messages.ProjectStatusChanged);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Change Project Status");
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
			return "Yes";
		}
	};

	const uiTitleBar = () => {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">Change Status</span>
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
							<button className={yesButtonStyle} onClick={() => changeStatus()}>
								{uiButton()}
							</button>
						</footer>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}

export function DeleteProject({ mount, projectId, reloadProjects, unmount }) {
	// Business Logic
	const [state, setState] = useState({ isBoxDragged: false, isLoading: false });

	const buttonClickEvent = state.isLoading ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";
	const buttonStyle = `primary-button-condensed ${buttonClickEvent}`;

	const titleBarCursor = state.isBoxDragged ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header draggable-handle ${titleBarCursor}`;

	// Functions
	const deleteProject = async () => {
		try {
			setState((s) => ({ ...s, isLoading: true }));

			const body = {
				id: projectId,
				type: "delete-project",
			};

			const response = await axios.post(MyConstants.ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reloadProjects();

				MyGlobal.AddActivity(`Projects :: Deleted project ${projectId}`);
				MyGlobal.ShowSuccessToast(MyConstants.Messages.ProjectDeleted);

				unmount();
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Delete Project");
		} finally {
			setState((s) => ({ ...s, isLoading: false }));
		}
	};

	const setBoxDrag = () => {
		setState((s) => ({ ...s, isBoxDragged: !state.isBoxDragged }));
	};

	// UI
	const uiButton = () => {
		if (state.isLoading) {
			return (
				<span className="px-3.5">
					<Spinner />
				</span>
			);
		} else {
			return <span>Yes</span>;
		}
	};

	const uiTitleBar = () => {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">Delete Project</span>
				<FontAwesomeIcon className="cursor-pointer" icon={faXmark} onClick={() => unmount()} />
			</DialogTitle>
		);
	};

	// Main UI
	return (
		<Dialog as="div" className="relative z-50" open={mount} onClose={() => unmount()}>
			<div className="fixed inset-0 bg-black/50" />
			<div className="flex w-full justify-center items-center fixed inset-0 overflow-y-auto">
				<Draggable handle=".draggable-handle" onStart={() => setBoxDrag()} onStop={() => setBoxDrag()}>
					<DialogPanel className="w-[400px] transform overflow-hidden rounded shadow black-white-background">
						{uiTitleBar()}
						<div className="flex flex-col w-full p-4 justify-center items-center font-regular-11 black-text">
							<div className="flex flex-col px-1 text-left">
								<span className="py-2">
									Do you want to delete the project <b>{projectId}</b>?
								</span>

								<span className="py-2">
									Please consider having a look at <b>Project Status</b> (<b>Status</b> <FontAwesomeIcon icon={faArrowRight} size="xs" />{" "}
									<b>Completed</b>) to see whether all the accounts have been settled or not.
								</span>

								<span className="py-2">
									If you are not fully sure about deletion, you can also change the project's status to <b>Closed</b> or <b>Hold</b>. This
									way, you can re-open this project in future.
								</span>

								<span className="py-2">Are you sure to proceed? Once done, This action cannot be reversed.</span>
							</div>
						</div>
						<footer className="dialog-footer">
							<button className={buttonStyle} onClick={() => deleteProject()}>
								{uiButton()}
							</button>
						</footer>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}
