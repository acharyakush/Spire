"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import dayjs from "dayjs";
import Draggable from "react-draggable";

import { useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { faArrowsUpToLine, faXmark } from "@fortawesome/free-solid-svg-icons";

export default function EditProjectPreview({ mount, newProject, oldProject, unmount }) {
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
					<DialogPanel className="w-3/4 transform overflow-hidden rounded shadow black-white-background">
						{uiTitleBar()}
						<div className="flex w-full p-6 space-x-3 justify-between items-center light-gray-background">
							<div className="flex flex-col w-full p-3 space-y-3 justify-between items-center rounded full-border black-white-background">
								{uiRow("Client", oldProject.client.name)}
								{uiRow("Company", oldProject.company.name)}
								{uiRow("Contact Number", oldProject.contactNumber)}
								{uiRow("Main Project", oldProject.mainProject.name)}
								{uiRow("Sub Project", oldProject.subProject.name)}
								{uiRow("Due On", dayjs(oldProject.dueOn).format("DD MMMM, YYYY"))}
								{uiRow("Invoice", MyGlobal.ThousandSeparator(oldProject.invoiceFees))}
								{uiRow("R. Voucher", MyGlobal.ThousandSeparator(oldProject.reimbursementVoucher))}
								{uiRow("Teams", oldProject.teams.map((user) => user.full_name).join(", "))}
								{uiRow("Invoice Firm", oldProject.invoiceFirm.name)}
							</div>
							<FontAwesomeIcon icon={faArrowsUpToLine} rotation={90} />
							<div className="flex flex-col w-full p-3 space-y-3 justify-between items-center rounded full-border black-white-background">
								{uiRow("Client", newProject.client.name)}
								{uiRow("Company", newProject.company.name)}
								{uiRow("Contact Number", newProject.contactNumber)}
								{uiRow("Main Project", newProject.mainProject.name)}
								{uiRow("Sub Project", newProject.subProject.name)}
								{uiRow("Due On", dayjs(newProject.dueOn).format("DD MMMM, YYYY"))}
								{uiRow("Invoice", MyGlobal.ThousandSeparator(newProject.invoiceFees))}
								{uiRow("R. Voucher", MyGlobal.ThousandSeparator(newProject.reimbursementVoucher))}
								{uiRow("Teams", newProject.teams.map((user) => user.full_name).join(", "))}
								{uiRow("Invoice Firm", newProject.invoiceFirm.name)}
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
