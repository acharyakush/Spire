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
	const [data, setData] = useState({ isBoxDragged: false, isLoading: false, note: "" });

	const titleBarCursor = data.isBoxDragged ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header draggable-handle ${titleBarCursor}`;

	const disableSaveButton = data.isLoading || !data.note ? "pointer-events-none" : "pointer-events-auto";
	const saveButtonStyle = `primary-button-condensed ${disableSaveButton}`;

	// Functions
	const addNote = async () => {
		setData((old) => ({ ...old, isLoading: true }));

		const body = {
			content: data.note,
			id: selectedInquiry.id,
			source: MyConstants.Modules.Base.Inquiries,
			type: "add-note",
			userId: MyGlobal.GetUserId(),
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reloadNotes();

				MyGlobal.AddActivity(`Notes :: Added a note for inquiry (${selectedInquiry.id}).`);
				MyGlobal.ShowSuccessToast(MyConstants.Messages.NoteAdded);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Inquiries => Add Note");
		} finally {
			setData((old) => ({ ...old, isLoading: false }));
			unmount(false);
		}
	};

	const setBoxDrag = () => {
		setData((old) => ({ ...old, isBoxDragged: !data.isBoxDragged }));
	};

	const setNote = (note) => {
		setData((old) => ({ ...old, note }));
	};

	// UI Components
	const uiButtonLabel = () => {
		if (data.isLoading) {
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
				<span className="flex w-full justify-start items-center">New Note</span>
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
									value={data.note}
									width="w-full"
								/>
							</div>
						</div>
						<footer className="dialog-footer">
							<button className={saveButtonStyle} onClick={() => addNote()}>
								{uiButtonLabel()}
							</button>
						</footer>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}

export function ChangeStatus({ mount, reloadInquiries, selectedInquiry, unmount }) {
	// Business Logic
	const [data, setData] = useState({ isBoxDragged: false, isLoading: false, reason: "" });

	const isStatusCloseInquiry = selectedInquiry?.new_status == MyConstants.Statuses.Inquiries.Closed;
	const titleBarText = isStatusCloseInquiry ? "Close Inquiry" : "Change Status";

	const reasonBoxStyle = isStatusCloseInquiry ? "flex flex-col w-full px-2.5 pt-0 pb-5 justify-center items-center" : "hidden";
	const titleBarCursor = data.isBoxDragged ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header draggable-handle ${titleBarCursor}`;

	let disableYesButton = data.isLoading ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";

	if (isStatusCloseInquiry) {
		disableYesButton = data.isLoading || !data.reason ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";
	}

	const yesButtonStyle = `primary-button-condensed ${disableYesButton}`;

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
	const changeStatus = async () => {
		if (selectedInquiry.new_status == MyConstants.Statuses.Inquiries.Confirmed) {
			unmount("open-new-project");
		} else {
			setData((old) => ({ ...old, isLoading: true }));

			const body = {
				id: selectedInquiry.id,
				reason: data.reason,
				status: isStatusCloseInquiry ? MyConstants.Statuses.Inquiries.Closed : selectedInquiry.new_status,
				type: isStatusCloseInquiry ? "close-inquiry" : "change-inquiry-status",
				userId: MyGlobal.GetUserId(),
			};

			try {
				const response = await axios.post(MyConstants.ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

				if (response.status === 200) {
					reloadInquiries();

					let activityMessage = `Inquiries :: Changed status of inquiry (${selectedInquiry.id}) from ${selectedInquiry.status} to ${selectedInquiry.new_status}.`;

					let successMessage = MyConstants.Messages.InquiryEdited;

					if (isStatusCloseInquiry) {
						activityMessage = `Inquiries :: Closed inquiry (${selectedInquiry.id}) due to ${data.reason}.`;
						successMessage = MyConstants.Messages.InquiryClosed;
					}

					MyGlobal.AddActivity(activityMessage);
					MyGlobal.ShowSuccessToast(successMessage);
				} else {
					MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
				}
			} catch (error) {
				const errorSource = isStatusCloseInquiry ? "Close Inquiry" : "Change Inquiry Status";
				MyGlobal.HandleErrors(error, errorSource);
			} finally {
				setData((old) => ({ ...old, isLoading: false, reason: "" }));
				unmount(false);
			}
		}
	};

	const setBoxDrag = () => {
		setData((old) => ({ ...old, isBoxDragged: !data.isBoxDragged }));
	};

	const setReason = (reason) => {
		setData((old) => ({ ...old, reason }));
	};

	// UI Components
	const uiButtonLabel = () => {
		if (data.isLoading) {
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
					<DialogPanel className="w-[400px] transform overflow-hidden rounded black-white-background shadow">
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
								value={data.reason}
								width="w-full"
							/>
						</div>
						<footer className="dialog-footer">
							<button className={yesButtonStyle} onClick={() => changeStatus()}>
								{uiButtonLabel()}
							</button>
						</footer>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}
