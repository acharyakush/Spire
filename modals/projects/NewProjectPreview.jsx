"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import dayjs from "dayjs";
import Draggable from "react-draggable";

import { useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

export default function NewProjectPreview({ mount, projectData, unmount }) {
	// Business Logic
	const [isBoxBeingDragged, setIsBoxBeingDragged] = useState(false);

	const titleBarCursor = isBoxBeingDragged ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header draggable-handle ${titleBarCursor}`;

	const wrapper = "flex w-full px-5 justify-center items-center";
	const labelStyle = "flex w-1/4 h-6 justify-start items-center font-regular-10 gray-text bottom-border";
	const valueStyle = "flex w-3/4 h-6 justify-start items-center font-medium-11 black-text bottom-border";

	// UI Components
	const uiRow = (_label, _value) => {
		const labelTextColour = !_value ? "red-text red-bottom-border" : "gray-text bottom-border";
		const valueTextColour = !_value ? "red-text red-bottom-border" : "black-text bottom-border";

		return (
			<div className={wrapper}>
				<span className={`${labelStyle} ${labelTextColour}`}>{_label}</span>
				<span className={`${valueStyle} ${valueTextColour}`}>{_value}</span>
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
				<Draggable
					handle=".draggable-handle"
					onStart={() => setIsBoxBeingDragged(!isBoxBeingDragged)}
					onStop={() => setIsBoxBeingDragged(!isBoxBeingDragged)}>
					<DialogPanel className="w-1/2 transform overflow-hidden rounded shadow contrast-background">
						{uiTitleBar()}
						<div className="flex flex-col w-full h-[410px] py-3 space-y-3 justify-between items-center overflow-y-auto light-gray-background">
							{uiRow("Client", projectData.clientName)}
							{uiRow("Company", projectData.company.name)}
							{uiRow("Phone Number", projectData.phoneNumber)}
							{uiRow("Main Project", projectData.mainProject.name)}
							{uiRow("Sub Project", projectData.subProject.name)}
							{uiRow("Due On", dayjs(projectData.dueOn).format("DD-MM-YYYY"))}
							{uiRow("Invoice", MyGlobal.ThousandSeparator(projectData.invoiceFees))}
							{uiRow("Reimbursement Voucher", MyGlobal.ThousandSeparator(projectData.reimbursementVoucher))}
							{uiRow("Teams", projectData.teams.map((user) => user.full_name).join(", "))}
							{uiRow("Invoice Firm", projectData.invoiceFirm.name)}
							{uiRow("Note", projectData.note || "")}
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
