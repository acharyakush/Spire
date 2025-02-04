"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import Draggable from "react-draggable";
import MyConstants from "@/utilities/constants";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { Spinner, SpinnerBig } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGooglePay } from "@fortawesome/free-brands-svg-icons";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { ComboBox2, DatePicker, EmailAddress, TextInput } from "@/components/Inputs";
import { faBank, faBuilding, faCalendar, faClipboardQuestion, faFont, faIndianRupee, faPhone, faXmark } from "@fortawesome/free-solid-svg-icons";

export default function NewEntity({ module, mount, reload, unmount }) {
	// Business Logic
	const [api, setApi] = useState({
		ownerFirms: [],
		ownerFirmsBanks: { copy: [], data: [] },
		paymentSources: { copy: [], data: [] },
	});

	const [loading, setLoading] = useState({
		adding: false,
		supportData: false,
	});

	const [main, setMain] = useState({
		amount: "",
		emailAddress: "",
		entryAt: new Date(),
		name: "",
		ownerFirm: { banks: [], id: "", name: "", selectedBank: { id: "", name: "" } },
		paymentSource: { id: "", name: "" },
		phoneNumber: "",
		purpose: "",
		upiId: "",
	});

	const [other, setOther] = useState({
		find: {
			ownerFirms: "",
			ownerFirmsBank: "",
			paymentSource: "",
		},
		isBoxMoved: false,
	});

	const titleBarCursor = other.isBoxMoved ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header shadow draggable-handle ${titleBarCursor}`;

	// Functions
	function areAllDetailsFilled() {
		if (!main.amount || !main.entryAt || !main.name || !main.purpose) {
			return false;
		}

		if (!main.paymentSource.id || !main.paymentSource.name) {
			return false;
		}

		if (!main.ownerFirm.id || !main.ownerFirm.name || !main.ownerFirm.selectedBank.id || !main.ownerFirm.selectedBank.name) {
			return false;
		}

		return true;
	}

	async function doAddition() {
		setLoading((s) => ({ ...s, adding: true }));

		const body = {
			amount: Number(main.amount),
			emailAddress: main.emailAddress,
			entryAt: main.entryAt,
			moduleId: module.id,
			name: main.name,
			ownerFirmsId: main.ownerFirm.id,
			ownerFirmsBankId: main.ownerFirm.selectedBank.id,
			paymentSource: main.paymentSource.id,
			phoneNumber: main.phoneNumber,
			purpose: main.purpose,
			userId: MyGlobal.GetUserId(),
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.CashFlowsModules.AddEntity, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reload("reload-root-statistics");
				resetFields();
				getSupportData();

				MyGlobal.AddActivity(`Added entity for <b>${module.name}</b>.`, MyConstants.Modules.Base.CashFlow);

				MyGlobal.ShowSuccessToast(MyConstants.Messages.EntityAdded);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, `Cash Flow => ${module.name} => New Entity`);
		} finally {
			setLoading((s) => ({ ...s, adding: false }));
		}
	}

	function getAddButtonStyle() {
		const disableAddButton = loading.adding || !areAllDetailsFilled() ? "pointer-events-none" : "pointer-events-auto";

		return `primary-button-condensed ${disableAddButton}`;
	}

	function getFilteredOwnerFirms() {
		let list = api.ownerFirms;
		const term = String(other.find.ownerFirms);

		if (term !== "undefined") {
			list = api.ownerFirms.filter((f) => {
				return String(f.name).toLowerCase().includes(term.toLowerCase());
			});
		}

		return list;
	}

	function getFilteredOwnerFirmsBanks() {
		let list = api.ownerFirmsBanks.copy;
		const term = String(other.find.ownerFirmsBank);

		if (term !== "undefined") {
			list = api.ownerFirmsBanks.copy.filter((f) => {
				return String(f.name).toLowerCase().includes(term.toLowerCase());
			});
		}

		return list;
	}

	function getPaymentSources() {
		let list = !api.paymentSources.copy.length ? [] : api.paymentSources.copy;

		if (list.length) {
			const value = String(other.find.paymentSource);

			if (value !== "undefined") {
				list = api.paymentSources.copy.filter((f) => {
					return String(f.name).toLowerCase().includes(value.toLowerCase());
				});
			}
		}

		return list;
	}

	async function getSupportData() {
		setLoading((s) => ({ ...s, supportData: true }));

		try {
			const response = await axios.get(MyConstants.ApiEndpoints.CashFlows.GetNewTransactionSupportData, MyGlobal.GetHeaders({}));

			if (response.status === 200) {
				const basicPaymentSourceList = MyGlobal.GetBasicPaymentSourceList();

				setApi({
					ownerFirms: response.data.ownerFirms,
					ownerFirmsBanks: {
						copy: response.data.ownerFirmsBanks,
						data: response.data.ownerFirmsBanks,
					},
					paymentSources: {
						copy: basicPaymentSourceList,
						data: basicPaymentSourceList,
					},
				});

				setOther((s) => ({ ...s, hasMounted: true }));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, `${MyConstants.Modules.Base.CashFlow} => ${module.name} => New Entity`);
		} finally {
			setLoading((s) => ({ ...s, supportData: false }));
		}
	}

	function resetFields() {
		setMain({
			amount: "",
			entryAt: new Date(),
			name: "",
			ownerFirm: { banks: [], id: "", name: "", selectedBank: { id: "", name: "" } },
			paymentSource: { id: "", name: "" },
			purpose: "",
		});
	}

	function setBoxDrag() {
		setOther((s) => ({ ...s, isBoxMoved: !s.isBoxMoved }));
	}

	function setInputs(key, value) {
		if (typeof value === "object") {
			if (key == "ownerFirms") {
				const banks = api.ownerFirmsBanks.copy.filter((f) => f.owner_firm_id == value.id);

				const revisedPaymentSources = MyGlobal.GetRevisedPaymentSourceList([banks.at(0)]);

				setApi((s) => ({
					...s,
					paymentSources: {
						copy: revisedPaymentSources,
						data: revisedPaymentSources,
					},
				}));

				setMain((s) => ({
					...s,
					ownerFirm: {
						banks,
						id: value.id,
						name: value.name,
						selectedBank: { id: banks.at(0).id, name: banks.at(0).name },
					},
				}));
			} else if (key == "ownerFirmsBank") {
				setMain((s) => ({
					...s,
					ownerFirm: {
						...s.ownerFirm,
						selectedBank: { id: value.id, name: value.name },
					},
				}));
			} else {
				setMain((s) => ({
					...s,
					paymentSource: {
						id: value.id,
						name: value.name,
					},
				}));
			}

			setOther((s) => ({ ...s, find: { ...s.find, ownerFirms: "", ownerFirmsBank: "" } }));
		} else {
			setMain((s) => ({ ...s, [key]: value }));
		}
	}

	// UI Components
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

	function uiAmount() {
		return (
			<TextInput
				icon={faIndianRupee}
				id="Amount"
				label="Amount"
				onChange={(e) => setInputs("amount", e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasNumbers(e.key) && e.preventDefault()}
				tabIndex="6"
				value={main.amount}
				width="w-full"
			/>
		);
	}

	function uiBody() {
		if (loading.supportData) {
			return (
				<div className="flex w-full h-[436px] justify-center items-center">
					<SpinnerBig />
				</div>
			);
		} else {
			return (
				<div className="flex flex-col w-full pt-2 pb-4 justify-between items-center">
					<div className="flex flex-col w-full h-full px-5 space-y-2 justify-center items-center">
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
							{uiAmount()}
						</div>
						<div className="flex w-full space-x-5 justify-between items-center">
							{uiOwnerFirms()}
							{uiOwnerFirmsBanks()}
						</div>
						<div className="flex w-full space-x-5 justify-between items-center">
							{uiPaymentSource()}
							{uiUpiId()}
						</div>
					</div>
				</div>
			);
		}
	}

	function uiEmailAddress() {
		return (
			<EmailAddress
				label="Email Address (Optional)"
				onChange={(e) => setInputs("emailAddress", e.target.value)}
				suffix=""
				tabIndex="3"
				value={main.emailAddress}
				width="w-full"
			/>
		);
	}

	function uiEntryAt() {
		return <DatePicker icon={faCalendar} label="Date" onChange={(e) => setInputs("entryAt", e)} tabIndex="1" value={main.entryAt} width="w-full" />;
	}

	function uiFooter() {
		return (
			<footer className="w-full dialog-footer">
				<button className={getAddButtonStyle()} onClick={() => doAddition()} tabIndex="8">
					{uiAdd()}
				</button>
			</footer>
		);
	}

	function uiName() {
		return (
			<TextInput
				icon={faFont}
				id="name"
				label="Name"
				onChange={(e) => setInputs("name", e.target.value)}
				onKeyPress={() => {}}
				tabIndex="2"
				value={main.name}
				width="w-full"
			/>
		);
	}

	function uiOwnerFirms() {
		return (
			<ComboBox2
				allowCreatingNewItem={false}
				comparingValue1="name"
				comparingValue2={main.ownerFirm.name}
				displayValue="name"
				filteredData={getFilteredOwnerFirms}
				hasDataObject
				icon={faBuilding}
				isReadOnly={false}
				label="Firm"
				onChange={(e) => setInputs("ownerFirms", e)}
				onClick={() => {}}
				onInputChange={(e) => setFind("ownerFirms", e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasAlphabets(e.key) && e.preventDefault()}
				searchedItem={other.find.ownerFirms}
				tabIndex="7"
				value={main.ownerFirm.name}
				width="w-full"
			/>
		);
	}

	function uiOwnerFirmsBanks() {
		return (
			<ComboBox2
				allowCreatingNewItem={false}
				comparingValue1="name"
				comparingValue2={main.ownerFirm.selectedBank.name}
				displayValue="name"
				filteredData={!main.ownerFirm.banks.length ? getFilteredOwnerFirmsBanks : main.ownerFirm.banks}
				hasDataObject
				icon={faBank}
				isReadOnly={false}
				label="Banks"
				onChange={(e) => setInputs("ownerFirmsBank", e)}
				onClick={() => {}}
				onInputChange={(e) => setFind("ownerFirmsBank", e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasAlphabets(e.key) && e.preventDefault()}
				searchedItem={other.find.ownerFirmsBank}
				tabIndex="8"
				value={main.ownerFirm.selectedBank.name}
				width="w-full"
			/>
		);
	}

	function uiPaymentSource() {
		return (
			<ComboBox2
				allowCreatingNewItem={false}
				comparingValue1="name"
				comparingValue2={main.paymentSource.name}
				displayValue="name"
				filteredData={getPaymentSources}
				hasDataObject
				icon={faBank}
				isMenuInverted
				isReadOnly={false}
				label="Payment Source"
				onChange={(e) => setInputs("paymentSource", e)}
				onClick={() => {}}
				onInputChange={(e) => setFind("paymentSource", e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasAlphabets(e.key) && e.preventDefault()}
				searchedItem={other.find.paymentSource}
				tabIndex="9"
				value={main.paymentSource.name}
				width="w-full"
			/>
		);
	}

	function uiPhoneNumber() {
		return (
			<TextInput
				icon={faPhone}
				label="Phone Number (Optional)"
				maxLength={12}
				onChange={(e) => setInputs("phoneNumber", e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasNumbers(e.key) && e.preventDefault()}
				tabIndex="4"
				value={main.phoneNumber}
				width="w-full"
			/>
		);
	}

	function uiPurpose() {
		return (
			<TextInput
				icon={faClipboardQuestion}
				id="purpose"
				label="Purpose"
				onChange={(e) => setInputs("purpose", e.target.value)}
				onKeyPress={() => {}}
				tabIndex="5"
				value={main.purpose}
				width="w-full"
			/>
		);
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
		return (
			<TextInput
				icon={faGooglePay}
				id="upiId"
				label="UPI ID (Optional)"
				onChange={(e) => setInputs("upiId", e.target.value)}
				onKeyPress={() => {}}
				tabIndex="10"
				value={main.upiId}
				width="w-full"
			/>
		);
	}

	useEffect(() => {
		getSupportData();
	}, []);

	// Main UI

	return (
		<Dialog as="div" className="relative z-50" open={mount} onClose={() => unmount()}>
			<div className="fixed inset-0 bg-black/50" />
			<div className="flex w-full justify-center items-center fixed inset-0 overflow-y-auto">
				<Draggable handle=".draggable-handle" onStart={() => setBoxDrag()} onStop={() => setBoxDrag()}>
					<DialogPanel className="w-1/2 transform overflow-hidden rounded contrast-background shadow">
						{uiTitleBar()}
						{uiBody()}
						{uiFooter()}
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}
