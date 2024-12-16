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
									isNew={false}
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
	const [data, setData] = useState({ isBoxDragged: false, isLoading: false });

	const titleBarCursor = data.isBoxDragged ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header draggable-handle ${titleBarCursor}`;

	let message = "";

	if (selectedInquiry?.new_status == MyConstants.Statuses.Inquiries.Open) {
		message = `Are you sure you want to re-open this inquiry?`;
	} else if (selectedInquiry?.new_status == MyConstants.Statuses.Inquiries.Closed) {
		message = `Are you sure you want to close this inquiry? You are required to write a reason for the closure.`;
	} else if (selectedInquiry?.new_status == MyConstants.Statuses.Inquiries.Confirmed) {
		message = `Are you sure you want to convert this inquiry to project? If you affirm to this, you will be redirected to <b>New Project</b> page.\n\nOnce affirmed, this action cannot be reversed.`;
	} else if (selectedInquiry?.new_status == MyConstants.Statuses.Inquiries.Hold) {
		message = `Are you sure you want to keep this inquiry on hold?`;
	}

	// Functions
	const changeStatus = async () => {
		if (selectedInquiry.new_status == MyConstants.Statuses.Inquiries.Closed || selectedInquiry.new_status == MyConstants.Statuses.Inquiries.Confirmed) {
			unmount(false);
		} else {
			setData((old) => ({ ...old, isLoading: true }));

			const body = {
				id: selectedInquiry.id,
				status: selectedInquiry.new_status,
				type: "change-inquiry-status",
				userId: MyGlobal.GetUserId(),
			};

			try {
				const response = await axios.post(MyConstants.ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

				if (response.status === 200) {
					reloadInquiries();

					MyGlobal.AddActivity(
						`Inquiries :: Changed status of inquiry (${selectedInquiry.id}) from ${selectedInquiry.status} to ${selectedInquiry.new_status}.`,
					);

					MyGlobal.ShowSuccessToast(MyConstants.Messages.InquiryEdited);
				} else {
					MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
				}
			} catch (error) {
				MyGlobal.HandleErrors(error, "Change Inquiry Status");
			} finally {
				setData((old) => ({ ...old, isLoading: false }));
				unmount(false);
			}
		}
	};

	const setBoxDrag = () => {
		setData((old) => ({ ...old, isBoxDragged: !data.isBoxDragged }));
	};

	// UI
	const uiTitleBar = () => {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">Change Status</span>
				<FontAwesomeIcon className="cursor-pointer" icon={faXmark} onClick={() => unmount("")} />
			</DialogTitle>
		);
	};

	// Main UI
	return (
		<Dialog as="div" className="relative z-50" open={mount} onClose={() => unmount(false)}>
			<div className="fixed inset-0 bg-black/50" />
			<div className="flex w-full justify-center items-center fixed inset-0 overflow-y-auto">
				<Draggable handle=".draggable-handle" onStart={() => setBoxDrag()} onStop={() => setBoxDrag()}>
					<DialogPanel className="w-[400px] transform overflow-hidden rounded light-gray-background shadow">
						{uiTitleBar()}
						<span className="block w-full p-5 whitespace-pre-line font-regular-11 black-text" dangerouslySetInnerHTML={{ __html: message }} />
						<footer className="dialog-footer">
							<button className="primary-button-condensed" onClick={() => changeStatus()}>
								Yes
							</button>
						</footer>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}

export function CloseInquiry({ mount, reloadInquiries, selectedInquiry, unmount }) {
	// Business Logic
	const [data, setData] = useState({ isBoxDragged: false, isLoading: false, reason: "" });

	const titleBarCursor = data.isBoxDragged ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header draggable-handle ${titleBarCursor}`;

	const disableSaveButton = data.isLoading || !data.reason ? "pointer-events-none" : "pointer-events-auto";
	const saveButtonStyle = `primary-button-condensed ${disableSaveButton}`;

	// Functions
	const closeInquiry = async () => {
		setData((old) => ({ ...old, isLoading: true }));

		const body = {
			id: selectedInquiry.id,
			reason: data.reason,
			status: MyConstants.Statuses.Inquiries.Closed,
			type: "close-inquiry",
			userId: MyGlobal.GetUserId(),
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reloadInquiries();

				MyGlobal.AddActivity(`Inquiries :: Closed inquiry (${selectedInquiry.id}) due to ${data.reason}.`);
				MyGlobal.ShowSuccessToast(MyConstants.Messages.InquiryClosed);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Close Inquiry");
		} finally {
			setData((old) => ({ ...old, isLoading: false, reason: "" }));
			unmount(false);
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
			return "Save";
		}
	};

	const uiTitleBar = () => {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">Close Inquiry</span>
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
						<div className="flex flex-col w-full p-2.5 justify-center items-center">
							<TextArea
								icon={faNoteSticky}
								isNew={false}
								key={1}
								label="Reason"
								onChange={(e) => setReason(e.target.value)}
								onKeyDown={() => {}}
								rows={3}
								tabIndex={1}
								value={data.reason}
								width="w-full"
							/>
						</div>
						<footer className="dialog-footer">
							<button className={saveButtonStyle} onClick={() => closeInquiry()}>
								{uiButtonLabel()}
							</button>
						</footer>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}
