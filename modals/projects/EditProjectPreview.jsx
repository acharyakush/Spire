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
	const [isBoxMoved, setIsBoxMoved] = useState(false);

	const titleBarCursor = isBoxMoved ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header shadow draggable-handle ${titleBarCursor}`;

	const changedValues = MyGlobal.GetChangedValues(oldProject, newProject);

	// UI Components
	const uiRow = (index, label, value) => {
		const key = String(label)
			.toLowerCase()
			.replace(/[_\s.]/g, "");

		const isNewValue = Array.isArray(changedValues) && changedValues.some((f) => String(f).toLowerCase().includes(key)).length > 0;

		let aesthetics = "black-text bottom-border";

		if (index == "old") {
			if (isNewValue) {
				aesthetics = "red-tag-transparent-02";
			}
		} else {
			if (isNewValue) {
				aesthetics = "green-tag-transparent-01";
			}
		}

		const labelStyle = "flex w-1/3 h-6 justify-start items-center font-regular-10 gray-text bottom-border";
		const valueStyle = "flex w-2/3 h-6 justify-start items-center font-medium-11 bottom-border";

		const labelTextColour = !value ? "red-text red-bottom-border" : "gray-text bottom-border";
		const valueTextColour = !value ? "red-text red-bottom-border" : aesthetics;

		return (
			<div className="flex w-full px-5 justify-center items-center">
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
				<Draggable handle=".draggable-handle" onStart={() => setIsBoxMoved(!isBoxMoved)} onStop={() => setIsBoxMoved(!isBoxMoved)}>
					<DialogPanel className="w-3/4 transform overflow-hidden rounded shadow contrast-background">
						{uiTitleBar()}
						<div className="flex w-full p-6 space-x-3 justify-between items-center primary-light-background">
							<div className="flex flex-col w-full p-3 space-y-3 justify-between items-center rounded full-border contrast-background">
								{uiRow("old", "Client", oldProject.client.name)}
								{uiRow("old", "Company", oldProject.company.name)}
								{uiRow("old", "Phone Number", oldProject.phoneNumber)}
								{uiRow("old", "Main Project", oldProject.mainProject.name)}
								{uiRow("old", "Sub Project", oldProject.subProject.name)}
								{uiRow("old", "Due On", dayjs(oldProject.dueOn).format("DD MMMM, YYYY").toString())}
								{uiRow("old", "Invoice", MyGlobal.ThousandSeparator(oldProject.invoiceFees))}
								{uiRow("old", "Teams", oldProject.teams.map((m) => m.full_name).join(", "))}
								{uiRow("old", "Invoice Firm", oldProject.invoiceFirm.name)}
							</div>
							<FontAwesomeIcon icon={faArrowsUpToLine} rotation={90} />
							<div className="flex flex-col w-full p-3 space-y-3 justify-between items-center rounded full-border contrast-background">
								{uiRow("new", "Client", newProject.client.name)}
								{uiRow("new", "Company", newProject.company.name)}
								{uiRow("new", "Phone Number", newProject.phoneNumber)}
								{uiRow("new", "Main Project", newProject.mainProject.name)}
								{uiRow("new", "Sub Project", newProject.subProject.name)}
								{uiRow("new", "Due On", dayjs(newProject.dueOn).format("DD MMMM, YYYY").toString())}
								{uiRow("new", "Invoice", MyGlobal.ThousandSeparator(newProject.invoiceFees))}
								{uiRow("new", "Teams", newProject.teams.map((m) => m.full_name).join(", "))}
								{uiRow("new", "Invoice Firm", newProject.invoiceFirm.name)}
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
