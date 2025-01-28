"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import Draggable from "react-draggable";
import MyConstants from "@/utilities/constants";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { TextArea } from "@/components/Inputs";
import { Spinner, SpinnerBig } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { faAnglesRight, faArrowRight, faCircleCheck, faCircleXmark, faNoteSticky, faXmark } from "@fortawesome/free-solid-svg-icons";

export function DeleteProject({ mount, projectId, reload, unmount }) {
	// Business Logic
	const [main, setMain] = useState({
		isBoxMoving: false,
		isLoading: false,
	});

	const buttonClickEvent = main.isLoading ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";
	const buttonStyle = `primary-button-condensed ${buttonClickEvent}`;

	const titleBarCursor = main.isBoxMoving ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header draggable-handle ${titleBarCursor}`;

	// Functions
	async function doProjectDeletion() {
		try {
			setMain((s) => ({ ...s, isLoading: true }));

			const body = { id: projectId, type: "delete-project" };
			const response = await axios.post(MyConstants.ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reload();

				MyGlobal.AddActivity(`Deleted <b>${projectId}</b>`, MyConstants.Modules.Base.Projects);
				MyGlobal.ShowSuccessToast(MyConstants.Messages.ProjectDeleted);

				unmount();
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Delete Project");
		} finally {
			setMain((s) => ({ ...s, isLoading: false }));
		}
	}

	function setBoxDrag() {
		setMain((s) => ({ ...s, isBoxMoving: !main.isBoxMoving }));
	}

	// UI
	function uiButton() {
		if (main.isLoading) {
			return (
				<span className="px-3.5">
					<Spinner />
				</span>
			);
		} else {
			return <span>Yes</span>;
		}
	}

	function uiTitleBar() {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">Delete Project</span>
				<FontAwesomeIcon className="cursor-pointer" icon={faXmark} onClick={() => unmount()} />
			</DialogTitle>
		);
	}

	// Main UI
	return (
		<Dialog as="div" className="relative z-50" open={mount} onClose={() => unmount()}>
			<div className="fixed inset-0 bg-black/50" />
			<div className="flex w-full justify-center items-center fixed inset-0 overflow-y-auto">
				<Draggable handle=".draggable-handle" onStart={() => setBoxDrag()} onStop={() => setBoxDrag()}>
					<DialogPanel className="w-[400px] transform overflow-hidden rounded shadow contrast-background">
						{uiTitleBar()}
						<div className="flex flex-col w-full p-4 justify-center items-center font-regular-12 black-text">
							<div className="flex flex-col px-1 text-left">
								<span className="py-2">
									Do you want to delete the project <b>{projectId}</b>?
								</span>

								<span className="py-2">
									Please consider having a look at <b>Status</b> (<b>Status</b> <FontAwesomeIcon icon={faArrowRight} size="xs" />{" "}
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
							<button className={buttonStyle} onClick={() => doProjectDeletion()}>
								{uiButton()}
							</button>
						</footer>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}

export function EditStatus({ mount, project, reload, unmount }) {
	// Business Logic
	const [main, setMain] = useState({
		isBoxMoved: false,
		isLoading: false,
		reason: "",
	});

	const statuses = MyConstants.Statuses.Projects;
	const isNewStatusNotActive = project.new_status != statuses.Active;

	const reasonBoxStyle = isNewStatusNotActive ? "flex flex-col w-full px-2.5 pt-0 pb-5 justify-center items-center" : "hidden";
	const titleBarCursor = main.isBoxMoved ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header draggable-handle ${titleBarCursor}`;

	let disableUpdateButton = main.isLoading ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";

	if (isNewStatusNotActive) {
		disableUpdateButton = main.isLoading || !main.reason ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";
	}

	const updateButtonStyle = `primary-button-condensed ${disableUpdateButton}`;

	let messageBody = "";
	let activityMessage = "";

	switch (project.new_status) {
		case statuses.Active:
			activityMessage = `Resumed <b>${project.id}</b> from <b>${project.status}</b>`;
			messageBody = "Are you sure you want to re-active this project?";
			break;
		case statuses.Cancelled:
			activityMessage = `Cancelled <b>${project.id}</b> from <b>${project.status}</b>`;
			messageBody = "Are you sure you want to cancel this project? You are required to write a cancellation reason below.";
			break;
		case statuses.Closed:
			activityMessage = `Closed <b>${project.id}</b> from <b>${project.status}</b>`;
			messageBody = "Are you sure you want to close this project? You are required to write a closure reason below.";
			break;
		case statuses.Hold:
			activityMessage = `<b>${project.id}</b> kept on <b>${project.new_status}</b> from <b>${project.status}</b>`;
			messageBody = "Are you sure you want to keep this project on hold? You are required to write a reason below.";
			break;
	}

	// Functions
	async function doStatusEditing() {
		setMain((s) => ({ ...s, isLoading: true }));

		const body = {
			clientId: project.client_id,
			companyId: project.company_id,
			id: project.id,
			inquiryId: project.inquiry_id,
			reason: main.reason,
			status: project.new_status,
			type: "edit-project-status",
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reload();

				MyGlobal.AddActivity(activityMessage, MyConstants.Modules.Base.Projects);
				MyGlobal.ShowSuccessToast(MyConstants.Messages.ProjectStatusEdited);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Edit Project Status");
		} finally {
			setMain((s) => ({ ...s, isLoading: false, reason: "" }));
			unmount(false);
		}
	}

	function setBoxDrag() {
		setMain((s) => ({ ...s, isBoxMoved: !s.isBoxMoved }));
	}

	function setReason(reason) {
		setMain((s) => ({ ...s, reason }));
	}

	// UI Components
	function uiButton() {
		if (main.isLoading) {
			return (
				<span className="px-3.5">
					<Spinner />
				</span>
			);
		} else {
			return "Update";
		}
	}

	function uiCharactersLeft() {
		let count = 1000;

		if (main.reason.length) {
			count = 1000 - main.reason.length;
		}

		return <span className="font-regular-10 gray-text">{count} characters left.</span>;
	}

	function uiTitleBar() {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">Update Status</span>
				<FontAwesomeIcon className="cursor-pointer" icon={faXmark} onClick={() => unmount(false)} />
			</DialogTitle>
		);
	}

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
								onChange={(e) => setReason(e.target.value)}
								onKeyDown={() => {}}
								rows={3}
								tabIndex={1}
								value={main.reason}
								width="w-full"
							/>
							{uiCharactersLeft()}
						</div>
						<footer className="dialog-footer">
							<button className={updateButtonStyle} onClick={() => doStatusEditing()}>
								{uiButton()}
							</button>
						</footer>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}

export function ProjectStatus({ mount, project, unmount }) {
	// Business Logic
	const [main, setMain] = useState({
		isBoxMoved: false,
		isLoading: false,
		status: {
			invoices: { anyGenerated: false, total: 0 },
			tasks: { allCompleted: false, total: 0, completed: 0 },
		},
	});

	const isCompletionEligible = main.status.invoices.anyGenerated && main.status.tasks.allCompleted;

	const titleBarCursor = main.isBoxMoved ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header draggable-handle ${titleBarCursor}`;

	const wrapper = "flex w-full p-2.5 h-[60.59px] justify-center items-center rounded bottom-shadow contrast-background full-border";
	const labelStyle = "flex w-4/5 space-x-2 justify-start items-center font-medium-11 black-text";
	const valueStyle = "flex w-1/5 justify-center items-center";

	// Functions
	function setBoxDrag() {
		setMain((s) => ({ ...s, isBoxMoved: !main.isBoxMoved }));
	}

	async function setSupportData() {
		setMain((s) => ({ ...s, isLoading: true }));

		try {
			const response = await axios.get(MyConstants.ApiEndpoints.Projects.GetStatus, MyGlobal.GetHeaders({ projectId: project.id }));

			if (response.status === 200) {
				const tasks = response.data.tasks;
				const invoices = response.data.invoices;

				const completedTasks = tasks.filter((f) => f.is_completed == 1).length;
				const areAllTasksCompleted = tasks.length && tasks.every((f) => f.is_completed == 1);

				setMain((s) => ({
					...s,
					status: {
						invoices: {
							anyGenerated: invoices.length > 0,
							total: invoices.length,
						},
						tasks: {
							allCompleted: areAllTasksCompleted,
							completed: completedTasks,
							total: tasks.length,
						},
					},
				}));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Projects => Get Project Status");
		} finally {
			setMain((s) => ({ ...s, isLoading: false }));
		}
	}

	// UI
	function uiBody() {
		if (main.isLoading) {
			return (
				<div className="flex flex-col w-full h-[199px] justify-center items-center">
					<SpinnerBig />
				</div>
			);
		} else {
			const label1 = (
				<div className="flex flex-col w-full -space-y-px">
					<span>All tasks have been completed?</span>
					<span className="font-regular-9">
						Completed {main.status.tasks.completed} / {main.status.tasks.total}
					</span>
				</div>
			);

			const label2 = (
				<div className="flex flex-col w-full -space-y-px">
					<span>Is any invoice generated?</span>
					<span className="font-regular-9">Generated {main.status.invoices.total}</span>
				</div>
			);

			return (
				<div className="flex flex-col w-full px-5 py-4 space-y-3 justify-between items-center">
					<div className="w-full text-left font-medium-11 black-text">These statistics determine the project's eligibility for completion.</div>
					{uiRow(label1, main.status.tasks.allCompleted)}
					{uiRow(label2, main.status.invoices.anyGenerated)}
				</div>
			);
		}
	}

	function uiButton() {
		if (isCompletionEligible) {
			return (
				<button className="primary-button-condensed" onClick={() => unmount(true)}>
					<span>Mark as Completed</span>
				</button>
			);
		} else {
			return (
				<button className="primary-button-condensed" onClick={() => unmount(false)}>
					<span>Close</span>
				</button>
			);
		}
	}

	function uiRow(label, value) {
		const _value = <FontAwesomeIcon className={value ? "green-text" : "red-text"} icon={value ? faCircleCheck : faCircleXmark} size="lg" />;

		return (
			<div className={wrapper}>
				<span className={labelStyle}>
					<FontAwesomeIcon className="gray-text" icon={faAnglesRight} size="xs" />
					<span>{label}</span>
				</span>
				<span className={valueStyle}>{_value}</span>
			</div>
		);
	}

	function uiTitleBar() {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">{project.client_name}'s Project Status</span>
			</DialogTitle>
		);
	}

	// Hooks
	useEffect(() => {
		setSupportData();
	}, []);

	// Main UI
	return (
		<Dialog as="div" className="relative z-50" open={mount} onClose={() => unmount(false)}>
			<div className="fixed inset-0 bg-black/50" />
			<div className="flex w-full justify-center items-center fixed inset-0 overflow-y-auto">
				<Draggable handle=".draggable-handle" onStart={() => setBoxDrag()} onStop={() => setBoxDrag()}>
					<DialogPanel className="w-[500px] transform overflow-hidden rounded primary-light-background shadow">
						{uiTitleBar()}
						{uiBody()}
						<footer className="dialog-footer">{uiButton()}</footer>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}
