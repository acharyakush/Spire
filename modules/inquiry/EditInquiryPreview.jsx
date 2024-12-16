"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import dayjs from "dayjs";
import Draggable from "react-draggable";

import { useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { faArrowsUpToLine, faXmark } from "@fortawesome/free-solid-svg-icons";

export default function EditInquiryPreview({ editInquiry, mount, oldInquiry, unmount }) {
	// Business Logic
	const [isBoxDragged, setIsBoxDragged] = useState(false);

	const newFollowUps = editInquiry.followUps.length ? editInquiry.followUps.map((user) => user.full_name).join(", ") : "";
	const oldFollowUps = oldInquiry.followUps.length ? oldInquiry.followUps.map((user) => user.full_name).join(", ") : "";

	const titleBarCursor = isBoxDragged ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header draggable-handle ${titleBarCursor}`;

	const wrapper = "flex w-full px-5 space-x-2.5 justify-center items-center";
	const labelStyle = "flex w-1/4 h-6 justify-start items-center font-regular-10 gray-text bottom-border";
	const valueStyle = "flex w-3/4 h-6 justify-start items-center font-medium-11 black-text bottom-border";

	// UI Components
	const uiRow = (label, value) => {
		const labelTextColour = !value ? "red-text red-bottom-border" : "gray-text bottom-border";
		const valueTextColour = !value ? "red-text red-bottom-border" : "black-text bottom-border";

		return (
			<div className={wrapper}>
				<span className={`${labelStyle} ${labelTextColour}`}>{label}</span>
				<span className={`${valueStyle} ${valueTextColour}`}>{value}</span>
			</div>
		);
	};

	const uiTitleBar = () => {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">Preview</span>
				<FontAwesomeIcon className="cursor-pointer" icon={faXmark} onClick={() => unmount(false)} />
			</DialogTitle>
		);
	};

	return (
		<Dialog as="div" className="relative z-50" open={mount ?? false} onClose={() => unmount(false)}>
			<div className="fixed inset-0 bg-black/50" />
			<div className="flex w-full justify-center items-center fixed inset-0 overflow-y-auto">
				<Draggable handle=".draggable-handle" onStart={() => setIsBoxDragged(true)} onStop={() => setIsBoxDragged(false)}>
					<DialogPanel className="w-3/4 transform overflow-hidden rounded shadow black-white-background">
						{uiTitleBar()}
						<div className="flex w-full p-6 space-x-3 justify-between items-center light-gray-background">
							<div className="flex flex-col w-full p-3 space-y-3 justify-between items-center rounded full-border black-white-background">
								{uiRow("Client", oldInquiry.client.name)}
								{uiRow("Email Address", oldInquiry.emailAddress)}
								{uiRow("Contact Number", oldInquiry.contactNumber)}
								{uiRow("Main Project", oldInquiry.mainProject.name)}
								{uiRow("Sub Project", oldInquiry.subProject.name)}
								{uiRow("Reference", oldInquiry.reference.name)}
								{uiRow("Entry Date", dayjs(oldInquiry.entryDate).format("DD MMMM, YYYY"))}
								{uiRow("Quote", MyGlobal.FormatCurrency(oldInquiry.quote))}
								{uiRow("Follow Ups", oldFollowUps)}
							</div>
							<FontAwesomeIcon icon={faArrowsUpToLine} rotation={90} />
							<div className="flex flex-col w-full p-3 space-y-3 justify-between items-center rounded full-border black-white-background">
								{uiRow("Client", editInquiry.client.name)}
								{uiRow("Email Address", editInquiry.emailAddress)}
								{uiRow("Contact Number", editInquiry.contactNumber)}
								{uiRow("Main Project", editInquiry.mainProject.name)}
								{uiRow("Sub Project", editInquiry.subProject.name)}
								{uiRow("Reference", editInquiry.reference.name)}
								{uiRow("Entry Date", dayjs(editInquiry.entryDate).format("DD MMMM, YYYY"))}
								{uiRow("Quote", MyGlobal.FormatCurrency(editInquiry.quote))}
								{uiRow("Follow Ups", newFollowUps)}
							</div>
						</div>
						<footer className="dialog-footer">
							<button className="primary-button-condensed" onClick={() => unmount(true)}>
								Edit
							</button>
						</footer>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}
