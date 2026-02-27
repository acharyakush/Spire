"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import MyConstants from "@/utilities/constants";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { Spinner } from "@/components/Elements";
import { TextArea, TextInput } from "@/components/Inputs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { faAt, faFont, faHome, faIdBadge, faPhone, faStickyNote, faXmark } from "@fortawesome/free-solid-svg-icons";

export function EditClient({ client, mount, reload, unmount }) {
	// Business Logic
	const [main, setMain] = useState({
		address: "",
		email_address: "",
		isBoxMoved: false,
		isLoading: false,
		name: "",
		notes: "",
		phone_number: "",
	});

	const titleBarCursor = main.isBoxMoved ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header shadow draggable-handle ${titleBarCursor}`;

	const disableEditButton = main.isLoading ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";

	const editButtonStyle = `primary-button-condensed ${disableEditButton}`;

	// Functions
	async function doEditing() {
		setMain((s) => ({ ...s, isLoading: true }));

		const body = {
			address: main.address,
			email_address: main.email_address,
			id: client.id,
			name: main.name,
			notes: main.notes,
			phone_number: main.phone_number,
			type: "edit-client",
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reload();

				MyGlobal.AddActivity(getActivityMessage(), MyConstants.Modules.Other.SingleClient);

				MyGlobal.ShowSuccessToast(MyConstants.Messages.ClientEdited);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Edit Client");
		} finally {
			setMain((s) => ({ ...s, isLoading: false }));
			unmount(false);
		}
	}

	function getActivityMessage() {
		const changes = [];

		["address", "email_address", "notes", "name", "phone_number"].forEach((fe) => {
			if (client[fe] !== main[fe]) {
				changes.push({
					old: client[fe] ?? "blank",
					new: main[fe],
					label: MyGlobal.Capitalize(fe.replace("_", " ")),
				});
			}
		});

		const messages = changes.map((m) => `${m.label} from <b>${m.old}</b> to <b>${m.new}</b>`);
		const finalMessage = messages.join(", ");

		return `Edited ${finalMessage} of <b>${client.id}</b>.`;
	}

	function prefillOldData() {
		setMain((s) => ({
			...s,
			address: client.address,
			email_address: client.email_address,
			name: client.name,
			notes: client.notes,
			phone_number: client.phone_number,
		}));
	}

	function setBoxDrag() {
		setMain((s) => ({ ...s, isBoxMoved: !s.isBoxMoved }));
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
				<TextInput icon={faFont} key={1} label="Name" onChange={(e) => setInputs("name", e.target.value)} onKeyPress={() => {}} tabIndex="1" value={main.name} width="w-full" />
				<TextInput icon={faPhone} key={2} label="Phone Number" onChange={(e) => setInputs("phone_number", e.target.value)} onKeyPress={(e) => !MyGlobal.HasNumbers(e.key) && e.preventDefault()} tabIndex="2" value={main.phone_number} width="w-full" />
				<TextInput icon={faAt} key={3} label="Email Address" onChange={(e) => setInputs("email_address", e.target.value)} onKeyPress={() => {}} tabIndex="3" value={main.email_address} width="w-full" />
			</div>
		);
	}

	function uiSection2() {
		return (
			<div className="flex flex-col w-1/2 space-y-2.5 justify-center items-start">
				<TextInput icon={faStickyNote} key={4} label="Note" onChange={(e) => setInputs("notes", e.target.value)} onKeyPress={() => {}} tabIndex="4" value={main.notes} width="w-full" />
				<TextArea icon={faHome} key={5} label="Address" onChange={(e) => setInputs("address", e.target.value)} onKeyDown={() => {}} rows={2} tabIndex="5" value={main.address} width="w-full" />
			</div>
		);
	}

	function uiTitleBar() {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">Edit Client</span>
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
			</div>
		</Dialog>
	);
}

export function EditCompany({ company, mount, reload, unmount }) {
	// Business Logic
	const [main, setMain] = useState({
		address: "",
		email_address: "",
		gstin: "",
		isBoxMoved: false,
		isLoading: false,
		name: "",
		pan: "",
		phone_number: "",
	});

	const titleBarCursor = main.isBoxMoved ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header shadow draggable-handle ${titleBarCursor}`;

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
			id: company.id,
			name: main.name,
			pan: main.pan,
			type: "edit-company",
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reload("reload-root");

				MyGlobal.AddActivity(getActivityMessage(), MyConstants.Modules.Other.SingleClient);
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
			if (company.details[fe] !== main[fe]) {
				changes.push({
					old: company.details[fe] ?? "blank",
					new: main[fe],
					label: MyGlobal.Capitalize(fe.replace("_", " ")),
				});
			}
		});

		const messages = changes.map((m) => `${m.label} from <b>${m.old}</b> to <b>${m.new}</b>`);
		const finalMessage = messages.join(", ");

		return `Edited ${finalMessage} of <b>${company.id}</b> of <b>${company.details.client_id}</b>.`;
	}

	function prefillOldData() {
		setMain((s) => ({
			...s,
			address: company.details.address,
			phone_number: company.details.phone_number,
			email_address: company.details.email_address,
			gstin: company.details.gstin,
			name: company.details.name,
			pan: company.details.pan,
		}));
	}

	function setBoxDrag() {
		setMain((s) => ({ ...s, isBoxMoved: !s.isBoxMoved }));
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
				<TextInput icon={faFont} key={1} label="Name" onChange={(e) => setInputs("name", e.target.value)} onKeyPress={() => {}} tabIndex={1} value={main.name} width="w-full" />
				<TextInput icon={faPhone} key={2} label="Phone Number" onChange={(e) => setInputs("phone_number", e.target.value)} onKeyPress={(e) => !MyGlobal.HasNumbers(e.key) && e.preventDefault()} tabIndex={2} value={main.phone_number} width="w-full" />
				<TextInput icon={faAt} key={3} label="Email Address" onChange={(e) => setInputs("email_address", e.target.value)} onKeyPress={() => {}} tabIndex={3} value={main.email_address} width="w-full" />
			</div>
		);
	}

	function uiSection2() {
		return (
			<div className="flex flex-col w-1/2 space-y-2.5 justify-center items-start">
				<TextInput icon={faIdBadge} key={5} label="PAN" maxLength="10" onChange={(e) => setInputs("pan", e.target.value)} onKeyPress={() => {}} tabIndex={5} value={main.pan} width="w-full" />
				<TextInput icon={faIdBadge} key={6} label="GSTIN" maxLength="15" onChange={(e) => setInputs("gstin", e.target.value)} onKeyPress={() => {}} tabIndex={6} value={main.gstin} width="w-full" />
				<TextArea icon={faHome} label="Address" onChange={(e) => setInputs("address", e.target.value)} onKeyDown={() => {}} rows={2} tabIndex={4} value={main.address} width="w-full" />
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
			</div>
		</Dialog>
	);
}
