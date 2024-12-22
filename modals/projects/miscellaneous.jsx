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
			setState((old) => ({ ...old, isLoading: true }));

			const body = { id: projectId, type: "delete-project" };
			const response = await axios.post(MyConstants.ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reloadProjects();

				MyGlobal.AddActivity(`Deleted <b>${projectId}</b>`, MyConstants.Modules.Base.Projects);
				MyGlobal.ShowSuccessToast(MyConstants.Messages.ProjectDeleted);

				unmount();
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Delete Project");
		} finally {
			setState((old) => ({ ...old, isLoading: false }));
		}
	};

	const setBoxDrag = () => {
		setState((old) => ({ ...old, isBoxDragged: !state.isBoxDragged }));
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
						<div className="flex flex-col w-full p-4 justify-center items-center font-regular-12 black-text">
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

export function ProjectStatus({ mount, selectedProject, unmount }) {
	// Business Logic
	const [state, setState] = useState({
		isBoxDragged: false,
		isLoading: false,
		status: {
			dues: { allPaidOff: false, totalAmountPending: 0, totalAmount: 0 },
			invoices: { anyGenerated: false, anyRvGenerated: false, total: 0 },
			tasks: { allCompleted: false, total: 0, completed: 0 },
		},
	});

	const isCompletionEligible =
		state.status.dues.allPaidOff && state.status.invoices.anyGenerated && state.status.invoices.anyRvGenerated && state.status.tasks.allCompleted;

	const titleBarCursor = state.isBoxDragged ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header draggable-handle ${titleBarCursor}`;

	const wrapper = "flex w-full p-2.5 h-[60.59px] justify-center items-center rounded bottom-shadow black-white-background full-border";
	const labelStyle = "flex w-4/5 space-x-2 justify-start items-center font-medium-11 black-text";
	const valueStyle = "flex w-1/5 justify-center items-center";

	// Functions
	const getSupportData = async () => {
		setState((old) => ({ ...old, isLoading: true }));

		try {
			const response = await axios.get(MyConstants.ApiEndpoints.Projects.GetStatus, MyGlobal.GetHeaders({ projectId: selectedProject.id }));

			if (response.status === 200) {
				const tasks = response.data.tasks;
				const invoices = response.data.invoices;

				const completedTasks = tasks.filter((task) => task.is_completed == 1).length;
				const areAllTasksCompleted = tasks.length && tasks.every((task) => task.is_completed == 1);

				// const areAnyDuesPending = invoices.length && invoices.every((ledger) => ledger.amount_received == ledger.total_amount);

				// const totalAmount = invoices.reduce((total, ledger) => total + Number(ledger.total_amount), 0);

				// const totalAmountPending = invoices.reduce((total, ledger) => total + (Number(ledger.total_amount) - Number(ledger.amount_received)), 0);

				const anyRvGenerated = response.data.invoices.length > 0 && Boolean(response.data.invoices[0].rv_id);

				setState((old) => ({
					...old,
					status: {
						dues: {
							allPaidOff: 0,
							totalAmount: 0,
							totalAmountPending: 0,
						},
						invoices: {
							anyGenerated: response.data.invoices.length > 0,
							anyRvGenerated,
							total: response.data.invoices.length,
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
			setState((old) => ({ ...old, isLoading: false }));
		}
	};

	const setBoxDrag = () => {
		setState((old) => ({ ...old, isBoxDragged: !state.isBoxDragged }));
	};

	// UI
	const uiBody = () => {
		if (state.isLoading) {
			return (
				<div className="flex flex-col w-full h-[328px] justify-center items-center">
					<SpinnerBig />
				</div>
			);
		} else {
			const label1 = (
				<div className="flex flex-col w-full -space-y-px">
					<span>All tasks have been completed?</span>
					<span className="font-regular-9">
						Completed {state.status.tasks.completed} / {state.status.tasks.total}
					</span>
				</div>
			);

			const label2 = (
				<div className="flex flex-col w-full -space-y-px">
					<span>All dues have been paid off?</span>
					<span className="font-regular-9">
						Total Pending {MyGlobal.ThousandSeparator(state.status.dues.totalAmountPending)} /{" "}
						{MyGlobal.ThousandSeparator(state.status.dues.totalAmount)}
					</span>
				</div>
			);

			const label3 = (
				<div className="flex flex-col w-full -space-y-px">
					<span>Is any invoice generated?</span>
					<span className="font-regular-9">Generated {state.status.invoices.total}</span>
				</div>
			);

			return (
				<div className="flex flex-col w-full px-5 py-4 space-y-3 justify-between items-center">
					<div className="w-full text-left font-medium-11 black-text">These statistics determine the project's eligibility for completion.</div>
					{uiRow(label1, state.status.tasks.allCompleted)}
					{uiRow(label2, state.status.dues.allPaidOff)}
					{uiRow(label3, state.status.invoices.anyGenerated)}
					{uiRow("Is any reimbursement voucher generated?", state.status.invoices.anyRvGenerated)}
				</div>
			);
		}
	};

	const uiButton = () => {
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
	};

	const uiRow = (label, value) => {
		const _value = value ? (
			<FontAwesomeIcon className="green-text" icon={faCircleCheck} size="lg" />
		) : (
			<FontAwesomeIcon className="red-text" icon={faCircleXmark} size="lg" />
		);

		return (
			<div className={wrapper}>
				<span className={labelStyle}>
					<FontAwesomeIcon className="gray-text" icon={faAnglesRight} size="xs" />
					<span>{label}</span>
				</span>
				<span className={valueStyle}>{_value}</span>
			</div>
		);
	};

	const uiTitleBar = () => {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">{selectedProject.client_name}'s Project Status</span>
			</DialogTitle>
		);
	};

	// Hooks
	useEffect(() => {
		getSupportData();
	}, []);

	// Main UI
	return (
		<Dialog as="div" className="relative z-50" open={mount} onClose={() => unmount(false)}>
			<div className="fixed inset-0 bg-black/50" />
			<div className="flex w-full justify-center items-center fixed inset-0 overflow-y-auto">
				<Draggable handle=".draggable-handle" onStart={() => setBoxDrag()} onStop={() => setBoxDrag()}>
					<DialogPanel className="w-[500px] transform overflow-hidden rounded light-gray-background shadow">
						{uiTitleBar()}
						{uiBody()}
						<footer className="dialog-footer">{uiButton()}</footer>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}

export function UpdateStatus({ mount, reloadProjects, selectedProject, unmount }) {
	// Business Logic
	const [state, setState] = useState({ isBoxDragged: false, isLoading: false, reason: "" });

	const isNewStatusNotActive = selectedProject.new_status != MyConstants.Statuses.Projects.Active;

	const reasonBoxStyle = isNewStatusNotActive ? "flex flex-col w-full px-2.5 pt-0 pb-5 justify-center items-center" : "hidden";
	const titleBarCursor = state.isBoxDragged ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header draggable-handle ${titleBarCursor}`;

	let disableUpdateButton = state.isLoading ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";

	if (isNewStatusNotActive) {
		disableUpdateButton = state.isLoading || !state.reason ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";
	}

	const updateButtonStyle = `primary-button-condensed ${disableUpdateButton}`;

	let messageBody = "";
	let activityMessage = "";

	switch (selectedProject.new_status) {
		case MyConstants.Statuses.Projects.Active:
			activityMessage = `Resumed <b>${selectedProject.id}</b> from <b>${selectedProject.status}</b>`;
			messageBody = "Are you sure you want to re-active this project?";
			break;
		case MyConstants.Statuses.Projects.Cancelled:
			activityMessage = `Cancelled <b>${selectedProject.id}</b> from <b>${selectedProject.status}</b>`;
			messageBody = "Are you sure you want to cancel this project? You are required to write a cancellation reason below.";
			break;
		case MyConstants.Statuses.Projects.Closed:
			activityMessage = `Closed <b>${selectedProject.id}</b> from <b>${selectedProject.status}</b>`;
			messageBody = "Are you sure you want to close this project? You are required to write a closure reason below.";
			break;
		case MyConstants.Statuses.Projects.Hold:
			activityMessage = `<b>${selectedProject.id}</b> kept on <b>${selectedProject.new_status}</b> from <b>${selectedProject.status}</b>`;
			messageBody = "Are you sure you want to keep this project on hold? You are required to write a reason below.";
			break;
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
			projectId: selectedProject.id,
			reason: state.reason,
			status: selectedProject.new_status,
			type: "update-project-status",
			userId: MyGlobal.GetUserId(),
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reloadProjects();

				MyGlobal.AddActivity(activityMessage, MyConstants.Modules.Base.Projects);
				MyGlobal.ShowSuccessToast(MyConstants.Messages.ProjectStatusUpdated);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Update Project Status");
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
							<button className={updateButtonStyle} onClick={() => updateStatus()}>
								{uiButton()}
							</button>
						</footer>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}
