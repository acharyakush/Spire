"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import { ApiEndpoints, BaseModules, Messages } from "@/utilities/constants";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { Spinner, SpinnerBig } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGooglePay } from "@fortawesome/free-brands-svg-icons";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { DatePicker, EmailAddress, TextInput } from "@/components/Inputs";
import { faCalendar, faClipboardQuestion, faCode, faFont, faHashtag, faPhone, faXmark } from "@fortawesome/free-solid-svg-icons";

export default function NewEntity({ module, mount, reload, unmount }) {
	// Business Logic
	const [api, setApi] = useState({
		paymentSources: { copy: [], data: [] },
	});

	const [loading, setLoading] = useState({
		adding: false,
		supportData: false,
	});

	const [main, setMain] = useState({
		emailAddress: "",
		entryAt: new Date(),
		name: "",
		bank: {
			accountHolderName: "",
			accountNumber: "",
			ifsc: "",
		},
		paymentSource: { id: "", name: "" },
		phoneNumber: "",
		purpose: "",
		upiId: "",
	});

	const [other, setOther] = useState({
		find: {
			bank: "",
			paymentSource: "",
		},
		isBoxMoved: false,
	});

	const thisView = BaseModules.CashFlow;

	const titleBarCursor = other.isBoxMoved ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header shadow draggable-handle ${titleBarCursor}`;

	// Functions

	async function doAddition() {
		setLoading((s) => ({ ...s, adding: true }));

		const body = {
			bankDetails: main.bank,
			emailAddress: main.emailAddress,
			entryAt: main.entryAt,
			moduleId: module.id,
			name: main.name,
			phoneNumber: main.phoneNumber,
			purpose: main.purpose,
			upiId: main.upiId,
			userId: MyGlobal.GetUserId(),
		};

		try {
			const response = await axios.post(ApiEndpoints.CashFlows.Modules.Entities.AddEntity, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reload();
				unmount();

				MyGlobal.AddActivity(`Added entity <b>${main.name}</b> in <b>${module.name}</b>.`, thisView);
				MyGlobal.ShowSuccessToast(Messages.EntityAdded);
			} else {
				MyGlobal.ShowErrorToast(Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, `${thisView} => ${module.name} => New Entity`);
		} finally {
			setLoading((s) => ({ ...s, adding: false }));
		}
	}

	function getAddButtonStyle() {
		const disableAddButton = loading.adding || !isAddEligible() ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";

		return `primary-button-condensed ${disableAddButton}`;
	}

	function isAddEligible() {
		if (!main.entryAt || !main.name || !main.purpose) {
			return false;
		}

		if (!main.bank.accountHolderName || !main.bank.accountNumber || !main.bank.ifsc) {
			return false;
		}

		return true;
	}

	function setBoxDrag() {
		setOther((s) => ({ ...s, isBoxMoved: !s.isBoxMoved }));
	}

	function setInputs(key, value) {
		if (value) {
			if (typeof value === "object") {
				if (key === "entryAt") {
					setMain((s) => ({ ...s, entryAt: value }));
				}
			} else if (key === "accountHolderName" || key === "accountNumber" || key === "ifsc") {
				setMain((s) => ({
					...s,
					bank: { ...s.bank, [key]: value },
				}));
			} else {
				setMain((s) => ({ ...s, [key]: value }));
			}
		} else {
			if (key === "accountHolderName" || key === "accountNumber" || key === "ifsc") {
				setMain((s) => ({
					...s,
					bank: { ...s.bank, [key]: "" },
				}));
			} else {
				setMain((s) => ({ ...s, [key]: "" }));
			}
		}
	}

	// UI Components
	function uiAccountHolderName() {
		return <TextInput icon={faFont} id="accountHolderName" label="Account Holder Name" onChange={(e) => setInputs("accountHolderName", e.target.value)} onKeyPress={() => {}} tabIndex="5" value={main.bank.accountHolderName} width="w-full" />;
	}

	function uiAccountNumber() {
		return <TextInput icon={faHashtag} id="accountNumber" label="Account Number" onChange={(e) => setInputs("accountNumber", e.target.value)} onKeyPress={() => {}} tabIndex="5" value={main.bank.accountNumber} width="w-full" />;
	}

	function uiAdd() {
		if (loading.adding) {
			return (
				<span className="px-3.5">
					<Spinner />
				</span>
			);
		} else {
			return "Add";
		}
	}

	function uiBody() {
		if (loading.supportData) {
			return (
				<div className="flex w-full h-115 justify-center items-center">
					<SpinnerBig />
				</div>
			);
		} else {
			return (
				<div className="flex flex-col w-full p-5 justify-between items-center">
					<div className="flex flex-col w-full h-full px-5 space-y-2.5 justify-center items-center">
						<div className="flex w-full space-x-5 justify-between items-center">
							{uiEntryAt()}
							{uiName()}
						</div>
						<div className="flex w-full space-x-5 justify-between items-center">
							{uiEmailAddress()}
							{uiPhoneNumber()}
						</div>
						<div className="flex w-full space-x-5 justify-between items-center">
							{uiPurpose()}
							{uiUpiId()}
						</div>
						<div className="flex w-full space-x-5 justify-between items-center">
							{uiAccountHolderName()}
							{uiAccountNumber()}
						</div>
						<div className="flex w-full space-x-6 justify-between items-center">
							{uiIfsc()}
							<div className="w-full" />
						</div>
					</div>
				</div>
			);
		}
	}

	function uiEmailAddress() {
		return <EmailAddress label="Email Address (Optional)" onChange={(e) => setInputs("emailAddress", e.target.value)} suffix="" tabIndex="3" value={main.emailAddress} width="w-full" />;
	}

	function uiEntryAt() {
		return <DatePicker icon={faCalendar} label="Date" onChange={(e) => setInputs("entryAt", e)} tabIndex="1" value={main.entryAt} width="w-full" />;
	}

	function uiFooter() {
		return (
			<footer className="w-full dialog-footer">
				<button className={getAddButtonStyle()} onClick={() => doAddition()} tabIndex="9">
					{uiAdd()}
				</button>
			</footer>
		);
	}

	function uiIfsc() {
		return <TextInput icon={faCode} id="ifsc" label="IFS Code" onChange={(e) => setInputs("ifsc", e.target.value)} onKeyPress={() => {}} tabIndex="5" value={main.bank.ifsc} width="w-full" />;
	}

	function uiName() {
		return <TextInput icon={faFont} id="name" label="Name" onChange={(e) => setInputs("name", e.target.value)} onKeyPress={() => {}} tabIndex="2" value={main.name} width="w-full" />;
	}

	function uiPhoneNumber() {
		return <TextInput icon={faPhone} label="Phone Number (Optional)" maxLength={12} onChange={(e) => setInputs("phoneNumber", e.target.value)} onKeyPress={(e) => !MyGlobal.HasNumbers(e.key) && e.preventDefault()} tabIndex="4" value={main.phoneNumber} width="w-full" />;
	}

	function uiPurpose() {
		return <TextInput icon={faClipboardQuestion} id="purpose" label="Purpose" onChange={(e) => setInputs("purpose", e.target.value)} onKeyPress={() => {}} tabIndex="7" value={main.purpose} width="w-full" />;
	}

	function uiTitleBar() {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">New Entity</span>
				<FontAwesomeIcon className="cursor-pointer" icon={faXmark} onClick={() => unmount()} />
			</DialogTitle>
		);
	}

	function uiUpiId() {
		return <TextInput icon={faGooglePay} id="upiId" label="UPI ID (Optional)" onChange={(e) => setInputs("upiId", e.target.value)} onKeyPress={() => {}} tabIndex="8" value={main.upiId} width="w-full" />;
	}

	// Main UI

	return (
		<Dialog as="div" className="relative z-50" open={mount} onClose={() => unmount()}>
			<div className="fixed inset-0 bg-black/50" />
			<div className="flex w-full justify-center items-center fixed inset-0 overflow-y-auto">
				<DialogPanel className="w-1/2 transform overflow-hidden rounded contrast-background shadow">
					{uiTitleBar()}
					{uiBody()}
					{uiFooter()}
				</DialogPanel>
			</div>
		</Dialog>
	);
}
