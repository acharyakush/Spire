"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

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

export function AddNote({ inquiry, mount, reload, unmount }) {
	// Business Logic
	const [main, setMain] = useState({
		isBoxMoved: false,
		isLoading: false,
		note: "",
	});

	const titleBarCursor = main.isBoxMoved ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header draggable-handle ${titleBarCursor}`;

	const disableSaveButton = main.isLoading || !main.note ? "pointer-events-none" : "pointer-events-auto";
	const saveButtonStyle = `primary-button-condensed ${disableSaveButton}`;

	// Functions
	async function doNoteAdding() {
		setMain((s) => ({ ...s, isLoading: true }));

		const body = {
			content: main.note,
			id: inquiry.id,
			source: MyConstants.Modules.Base.Inquiries,
			type: "add-note",
			userId: MyGlobal.GetUserId(),
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reload();

				MyGlobal.AddActivity(`Added in <b>${inquiry.id}</b>.`, MyConstants.Modules.Base.Notes);
				MyGlobal.ShowSuccessToast(MyConstants.Messages.NoteAdded);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Inquiries => Add Note");
		} finally {
			setMain((s) => ({ ...s, isLoading: false }));
			unmount(false);
		}
	}

	function setBoxDrag() {
		setMain((s) => ({ ...s, isBoxMoved: !main.isBoxMoved }));
	}

	function setNote(note) {
		setMain((s) => ({ ...s, note }));
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
			return "Add";
		}
	}

	function uiTitleBar() {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">Add Note</span>
				<FontAwesomeIcon className="cursor-pointer" icon={faXmark} onClick={() => unmount(false)} />
			</DialogTitle>
		);
	}

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
									value={main.note}
									width="w-full"
								/>
							</div>
						</div>
						<footer className="dialog-footer">
							<button className={saveButtonStyle} onClick={() => doNoteAdding()}>
								{uiButton()}
							</button>
						</footer>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}

export function UpdateStatus({ inquiry, mount, reload, unmount }) {
	// Business Logic
	const [main, setMain] = useState({
		isBoxMoved: false,
		isLoading: false,
		reason: "",
	});

	const statuses = MyConstants.Statuses.Inquiries;
	const newStatus = "new_status" in inquiry ? inquiry.new_status : "";

	const isStatusCloseInquiry = newStatus == statuses.Closed;
	const titleBarText = isStatusCloseInquiry ? "Close Inquiry" : "Update Status";
	const buttonLabel = isStatusCloseInquiry ? "Close" : "Update";

	const reasonBoxStyle = isStatusCloseInquiry ? "flex flex-col w-full px-2.5 pt-0 pb-5 justify-center items-center" : "hidden";
	const titleBarCursor = main.isBoxMoved ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header draggable-handle ${titleBarCursor}`;

	let disableButton = main.isLoading ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";

	if (isStatusCloseInquiry) {
		disableButton = main.isLoading || !main.reason ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";
	}

	const buttonStyle = `primary-button-condensed ${disableButton}`;

	let message = "";

	if (newStatus == statuses.Open) {
		message = `Are you sure you want to re-open this inquiry?`;
	} else if (isStatusCloseInquiry) {
		message = `Are you sure you want to close this inquiry? You are required to write a reason below for the closure.`;
	} else if (newStatus == statuses.Confirmed) {
		message = `Are you sure you want to convert this inquiry to project? If you affirm to this, you will be redirected to <b>New Project</b> page.\n\nOnce affirmed, this action cannot be reversed.`;
	} else if (newStatus == statuses.Hold) {
		message = `Are you sure you want to keep this inquiry on hold?`;
	}

	// Functions
	async function doStatusUpdate() {
		if (newStatus == statuses.Confirmed) {
			unmount("open-new-project");
		} else {
			setMain((s) => ({ ...s, isLoading: true }));

			const body = {
				inquiryId: inquiry.id,
				reason: main.reason,
				status: isStatusCloseInquiry ? statuses.Closed : newStatus,
				type: isStatusCloseInquiry ? "close-inquiry" : "update-inquiry-status",
				userId: MyGlobal.GetUserId(),
			};

			try {
				const response = await axios.post(MyConstants.ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

				if (response.status === 200) {
					reload();

					let activityMessage = `Update status of <b>${inquiry.id}</b> to <b>${newStatus}</b> from <b>${inquiry.status}</b>.`;

					let successMessage = MyConstants.Messages.InquiryEdited;

					if (isStatusCloseInquiry) {
						activityMessage = `Closed <b>${inquiry.id}</b> due to <b>${main.reason}</b>.`;
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
				setMain((s) => ({ ...s, isLoading: false, reason: "" }));
				unmount(false);
			}
		}
	}

	function setBoxDrag() {
		setMain((s) => ({ ...s, isBoxMoved: !main.isBoxMoved }));
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
			return buttonLabel;
		}
	}

	function uiTitleBar() {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">{titleBarText}</span>
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
						<span className="block w-full p-5 whitespace-pre-line font-regular-11 black-text" dangerouslySetInnerHTML={{ __html: message }} />
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
						</div>
						<footer className="dialog-footer">
							<button className={buttonStyle} onClick={() => doStatusUpdate()}>
								{uiButton()}
							</button>
						</footer>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}
