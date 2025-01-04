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
import { faNoteSticky, faXmark } from "@fortawesome/free-solid-svg-icons";

export function AddNote({ mount, reloadNotes, selectedInquiry, unmount }) {
	// Business Logic
	const [state, setState] = useState({ isBoxDragged: false, isLoading: false, note: "" });

	const titleBarCursor = state.isBoxDragged ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header draggable-handle ${titleBarCursor}`;

	const disableSaveButton = state.isLoading || !state.note ? "pointer-events-none" : "pointer-events-auto";
	const saveButtonStyle = `primary-button-condensed ${disableSaveButton}`;

	// Functions
	const addNote = async () => {
		setState((old) => ({ ...old, isLoading: true }));

		const body = {
			content: state.note,
			id: selectedInquiry.id,
			source: MyConstants.Modules.Base.Inquiries,
			type: "add-note",
			userId: MyGlobal.GetUserId(),
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reloadNotes();

				MyGlobal.AddActivity(`Added in <b>${selectedInquiry.id}</b>.`, MyConstants.Modules.Base.Notes);
				MyGlobal.ShowSuccessToast(MyConstants.Messages.NoteAdded);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Inquiries => Add Note");
		} finally {
			setState((old) => ({ ...old, isLoading: false }));
			unmount(false);
		}
	};

	const setBoxDrag = () => {
		setState((old) => ({ ...old, isBoxDragged: !state.isBoxDragged }));
	};

	const setNote = (note) => {
		setState((old) => ({ ...old, note }));
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
				<span className="flex w-full justify-start items-center">Add Note</span>
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
						<div className="flex flex-col w-full pt-2 pb-4 justify-between items-center">
							<div className="flex w-full px-4 justify-center items-center">
								<TextArea
									icon={faNoteSticky}
									key={1}
									label="Notes"
									onChange={(e) => setNote(e.target.value)}
									onKeyDown={() => {}}
									rows={3}
									tabIndex={1}
									value={state.note}
									width="w-full"
								/>
							</div>
						</div>
						<footer className="dialog-footer">
							<button className={saveButtonStyle} onClick={() => addNote()}>
								{uiButton()}
							</button>
						</footer>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}

export function UpdateStatus({ mount, reloadInquiries, selectedInquiry, unmount }) {
	// Business Logic
	const [state, setState] = useState({ isBoxDragged: false, isLoading: false, reason: "" });

	const isStatusCloseInquiry = selectedInquiry?.new_status == MyConstants.Statuses.Inquiries.Closed;
	const titleBarText = isStatusCloseInquiry ? "Close Inquiry" : "Update Status";
	const buttonLabel = isStatusCloseInquiry ? "Close" : "Update";

	const reasonBoxStyle = isStatusCloseInquiry ? "flex flex-col w-full px-2.5 pt-0 pb-5 justify-center items-center" : "hidden";
	const titleBarCursor = state.isBoxDragged ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header draggable-handle ${titleBarCursor}`;

	let disableButton = state.isLoading ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";

	if (isStatusCloseInquiry) {
		disableButton = state.isLoading || !state.reason ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";
	}

	const buttonStyle = `primary-button-condensed ${disableButton}`;

	let message = "";

	if (selectedInquiry?.new_status == MyConstants.Statuses.Inquiries.Open) {
		message = `Are you sure you want to re-open this inquiry?`;
	} else if (isStatusCloseInquiry) {
		message = `Are you sure you want to close this inquiry? You are required to write a reason below for the closure.`;
	} else if (selectedInquiry?.new_status == MyConstants.Statuses.Inquiries.Confirmed) {
		message = `Are you sure you want to convert this inquiry to project? If you affirm to this, you will be redirected to <b>New Project</b> page.\n\nOnce affirmed, this action cannot be reversed.`;
	} else if (selectedInquiry?.new_status == MyConstants.Statuses.Inquiries.Hold) {
		message = `Are you sure you want to keep this inquiry on hold?`;
	}

	// Functions
	const setBoxDrag = () => {
		setState((old) => ({ ...old, isBoxDragged: !state.isBoxDragged }));
	};

	const setReason = (reason) => {
		setState((old) => ({ ...old, reason }));
	};

	const updateStatus = async () => {
		if (selectedInquiry.new_status == MyConstants.Statuses.Inquiries.Confirmed) {
			unmount("open-new-project");
		} else {
			setState((old) => ({ ...old, isLoading: true }));

			const body = {
				inquiryId: selectedInquiry.id,
				reason: state.reason,
				status: isStatusCloseInquiry ? MyConstants.Statuses.Inquiries.Closed : selectedInquiry.new_status,
				type: isStatusCloseInquiry ? "close-inquiry" : "update-inquiry-status",
				userId: MyGlobal.GetUserId(),
			};

			try {
				const response = await axios.post(MyConstants.ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

				if (response.status === 200) {
					reloadInquiries();

					let activityMessage = `Update status of <b>${selectedInquiry.id}</b> to <b>${selectedInquiry.new_status}</b> from <b>${selectedInquiry.status}</b>.`;

					let successMessage = MyConstants.Messages.InquiryEdited;

					if (isStatusCloseInquiry) {
						activityMessage = `Closed <b>${selectedInquiry.id}</b> due to <b>${state.reason}</b>.`;
						successMessage = MyConstants.Messages.InquiryClosed;
					}

					MyGlobal.AddActivity(activityMessage, MyConstants.Modules.Base.Inquiries);
					MyGlobal.ShowSuccessToast(successMessage);
				} else {
					MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
				}
			} catch (error) {
				const errorSource = isStatusCloseInquiry ? "Close Inquiry" : "Update Inquiry Status";
				MyGlobal.HandleErrors(error, errorSource);
			} finally {
				setState((old) => ({ ...old, isLoading: false, reason: "" }));
				unmount(false);
			}
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
			return buttonLabel;
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
		<Dialog as="div" className="relative z-50" open={mount} onClose={() => unmount(false)}>
			<div className="fixed inset-0 bg-black/50" />
			<div className="flex w-full justify-center items-center fixed inset-0 overflow-y-auto">
				<Draggable handle=".draggable-handle" onStart={() => setBoxDrag()} onStop={() => setBoxDrag()}>
					<DialogPanel className="w-[400px] transform overflow-hidden rounded contrast-background shadow">
						{uiTitleBar()}
						<span className="block w-full p-5 whitespace-pre-line font-regular-11 black-text" dangerouslySetInnerHTML={{ __html: message }} />
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
							<button className={buttonStyle} onClick={() => updateStatus()}>
								{uiButton()}
							</button>
						</footer>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}
