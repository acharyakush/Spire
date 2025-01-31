"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import dayjs from "dayjs";
import Draggable from "react-draggable";

import { useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

export default function NewInquiryPreview({ inquiry, mount, unmount }) {
	// Business Logic
	const [isBoxDragged, setIsBoxDragged] = useState(false);

	const followUps = Array.isArray(inquiry.followUps) ? inquiry.followUps.map((m) => m.full_name).join(", ") : "";

	const titleBarCursor = isBoxDragged ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header shadow draggable-handle ${titleBarCursor}`;

	// UI Components
	const uiRow = (label, value) => {
		const labelStyle = "flex w-1/4 h-6 justify-start items-center font-regular-10 gray-text bottom-border";

		const valueStyle = "flex w-3/4 h-6 justify-start items-center font-medium-11 black-text bottom-border";

		const labelTextColour = !value ? "red-text red-bottom-border" : "gray-text bottom-border";
		const valueTextColour = !value ? "red-text red-bottom-border" : "black-text bottom-border";

		return (
			<div className="flex w-full px-5 space-x-2.5 justify-center items-center">
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
					<DialogPanel className="w-[600px] transform overflow-hidden rounded shadow contrast-background">
						{uiTitleBar()}
						<div className="flex flex-col w-full py-3 space-y-3 justify-between items-center primary-light-background">
							{uiRow("Client", inquiry.client.name)}
							{uiRow("Email Address", inquiry.emailAddress)}
							{uiRow("Phone Number", inquiry.phoneNumber)}
							{uiRow("Main Project", inquiry.mainProject.name)}
							{uiRow("Sub Project", inquiry.subProject.name)}
							{uiRow("Reference", inquiry.reference.name)}
							{uiRow("Entry Date", dayjs(inquiry.entryDate).format("DD MMMM, YYYY"))}
							{uiRow("Quote", MyGlobal.FormatCurrency(inquiry.quote))}
							{uiRow("Follow Ups", followUps)}
							{uiRow("Note", inquiry.note)}
						</div>
						<footer className="dialog-footer">
							<button className="primary-button-condensed" onClick={() => unmount(true)}>
								Add
							</button>
						</footer>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}
