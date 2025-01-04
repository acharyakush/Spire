"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import Draggable from "react-draggable";
import MyConstants from "@/utilities/constants";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { Spinner } from "@/components/Elements";
import { TextArea, TextInput } from "@/components/Inputs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { faAt, faFont, faHome, faIdBadge, faPhone, faXmark } from "@fortawesome/free-solid-svg-icons";

export function EditCompany({ mount, reloadProjects, selectedCompany, unmount }) {
	// Business Logic
	const [main, setMain] = useState({
		address: "",
		phone_number: "",
		email_address: "",
		gstin: "",
		isBoxDragged: false,
		isLoading: false,
		name: "",
		pan: "",
	});

	const titleBarCursor = main.isBoxDragged ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header draggable-handle ${titleBarCursor}`;

	const disableEditButton = main.isLoading ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";

	const editButtonStyle = `primary-button-condensed ${disableEditButton}`;

	// Functions
	async function doEditing() {
		setMain((s) => ({ ...s, isLoading: true }));

		const body = {
			address: main.address,
			phoneNumber: main.phone_number,
			emailAddress: main.email_address,
			gstin: main.gstin,
			id: selectedCompany.id,
			name: main.name,
			pan: main.pan,
			type: "edit-company",
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reloadProjects();

				MyGlobal.AddActivity(getActivityMessage(), MyConstants.Modules.Derived.SingleClient);
				MyGlobal.ShowSuccessToast(MyConstants.Messages.CompanyEdited);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Edit Company");
		} finally {
			setMain((s) => ({ ...s, isLoading: false }));
			unmount(false);
		}
	}

	function getActivityMessage() {
		const changes = [];

		["address", "phone_number", "email_address", "gstin", "name", "pan"].forEach((fe) => {
			if (selectedCompany.details[fe] !== main[fe]) {
				changes.push({
					old: selectedCompany.details[fe] ?? "blank",
					new: main[fe],
					label: MyGlobal.Capitalize(fe.replace("_", " ")),
				});
			}
		});

		const messages = changes.map((m) => `${m.label} from <b>${m.old}</b> to <b>${m.new}</b>`);
		const finalMessage = messages.join(", ");

		return `Edited ${finalMessage} of <b>${selectedCompany.id}</b> of <b>${selectedCompany.details.client_id}</b>.`;
	}

	function prefillOldData() {
		setMain((s) => ({
			...s,
			address: selectedCompany.details.address,
			phone_number: selectedCompany.details.phone_number,
			email_address: selectedCompany.details.email_address,
			gstin: selectedCompany.details.gstin,
			name: selectedCompany.details.name,
			pan: selectedCompany.details.pan,
		}));
	}

	function setBoxDrag() {
		setMain((s) => ({ ...s, isBoxDragged: !main.isBoxDragged }));
	}

	function setInputs(key, value) {
		setMain((s) => ({ ...s, [key]: value }));
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
			return "Edit";
		}
	}

	function uiSection1() {
		return (
			<div className="flex flex-col w-1/2 space-y-2.5 justify-center items-start">
				<TextInput
					icon={faFont}
					key={1}
					label="Name"
					onChange={(event) => setInputs("name", event.target.value)}
					onKeyPress={() => {}}
					tabIndex={1}
					value={main.name}
					width="w-full"
				/>
				<TextInput
					icon={faPhone}
					key={2}
					label="Phone Number"
					onChange={(event) => setInputs("phone_number", event.target.value)}
					onKeyPress={(event) => !MyGlobal.HasNumbers(event.key) && event.preventDefault()}
					tabIndex={2}
					value={main.phone_number}
					width="w-full"
				/>
				<TextInput
					icon={faAt}
					key={3}
					label="Email Address"
					onChange={(event) => setInputs("email_address", event.target.value)}
					onKeyPress={() => {}}
					tabIndex={3}
					value={main.email_address}
					width="w-full"
				/>
			</div>
		);
	}

	function uiSection2() {
		return (
			<div className="flex flex-col w-1/2 space-y-2.5 justify-center items-start">
				<TextInput
					icon={faIdBadge}
					key={5}
					label="PAN"
					maxLength="10"
					onChange={(event) => setInputs("pan", event.target.value)}
					onKeyPress={() => {}}
					tabIndex={5}
					value={main.pan}
					width="w-full"
				/>
				<TextInput
					icon={faIdBadge}
					key={6}
					label="GSTIN"
					maxLength="15"
					onChange={(event) => setInputs("gstin", event.target.value)}
					onKeyPress={() => {}}
					tabIndex={6}
					value={main.gstin}
					width="w-full"
				/>
				<TextArea
					icon={faHome}
					key={4}
					label="Address"
					onChange={(event) => setInputs("address", event.target.value)}
					onKeyDown={() => {}}
					rows={2}
					tabIndex={4}
					value={main.address}
					width="w-full"
				/>
			</div>
		);
	}

	function uiTitleBar() {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">Edit Company</span>
				<FontAwesomeIcon className="cursor-pointer" icon={faXmark} onClick={() => unmount(false)} />
			</DialogTitle>
		);
	}

	// Hooks
	useEffect(() => {
		prefillOldData();
	}, []);

	// Main UI
	return (
		<Dialog as="div" className="relative z-50" open={mount} onClose={() => unmount(false)}>
			<div className="fixed inset-0 bg-black/50" />
			<div className="flex w-full justify-center items-center fixed inset-0 overflow-y-auto">
				<Draggable handle=".draggable-handle" onStart={() => setBoxDrag()} onStop={() => setBoxDrag()}>
					<DialogPanel className="w-1/2 transform overflow-hidden rounded shadow contrast-background">
						{uiTitleBar()}
						<div className="flex w-full p-5 space-x-10 justify-between items-start">
							{uiSection1()}
							{uiSection2()}
						</div>
						<footer className="dialog-footer">
							<button className={editButtonStyle} onClick={() => doEditing()}>
								{uiButton()}
							</button>
						</footer>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}
