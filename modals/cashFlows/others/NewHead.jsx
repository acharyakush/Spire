"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import MyConstants from "@/utilities/constants";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { Spinner, SpinnerBig } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { ComboBox2, DatePicker, TextInput } from "@/components/Inputs";
import { faBank, faBuilding, faCalendar, faClipboardQuestion, faIndianRupee, faList, faXmark } from "@fortawesome/free-solid-svg-icons";

export default function NewHead({ entity, mount, reload, unmount }) {
	// Business Logic
	const [api, setApi] = useState({
		firms: [],
		banks: { copy: [], data: [] },
		paymentSources: { copy: [], data: [] },
	});

	const [loading, setLoading] = useState({
		adding: false,
		supportData: false,
	});

	const [main, setMain] = useState({
		amount: "",
		entryAt: new Date(),
		firm: { id: "", name: "" },
		bank: { id: "", list: [], name: "" },
		paymentSource: { id: "", name: "" },
		purpose: "",
		remarks: "",
	});

	const [other, setOther] = useState({
		find: {
			firm: "",
			bank: "",
			paymentSource: "",
		},
		isBoxMoved: false,
	});

	const thisView = `${MyConstants.Modules.Base.CashFlow} => ${entity.module.name} => ${entity.name} => New Head`;

	const titleBarCursor = other.isBoxMoved ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header shadow draggable-handle ${titleBarCursor}`;

	// Functions
	async function doAddition() {
		setLoading((s) => ({ ...s, adding: true }));

		const body = {
			amount: Number(main.amount),
			entityId: entity.id,
			entryAt: main.entryAt,
			moduleId: entity.module.id,
			firmId: main.firm.id,
			bankId: main.bank.id,
			paymentSource: main.paymentSource.id,
			purpose: main.purpose,
			remarks: main.remarks,
			userId: MyGlobal.GetUserId(),
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.CashFlows.Modules.Entities.AddHead, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reload(entity.id, entity.module.id);
				resetFields();
				getSupportData();

				MyGlobal.AddActivity(`Added head <b>${main.purpose}</b> for <b>${entity.name}</b> in <b>${entity.module.name}</b>.`, MyConstants.Modules.Base.CashFlow);
				MyGlobal.ShowSuccessToast(MyConstants.Messages.CardAdded);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, thisView);
		} finally {
			setLoading((s) => ({ ...s, adding: false }));
			unmount();
		}
	}

	function getAddButtonStyle() {
		const disableAddButton = loading.adding || !isAddEligible() ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";

		return `primary-button-condensed ${disableAddButton}`;
	}

	function getFilteredFirms() {
		let list = api.firms;
		const term = String(other.find.firm);

		if (term !== "undefined") {
			list = api.firms.filter((f) => {
				return String(f.name).toLowerCase().includes(term.toLowerCase());
			});
		}

		return list;
	}

	function getFilteredBanks() {
		if (main.bank.list.length) {
			return main.bank.list;
		} else {
			let list = api.banks.copy;
			const term = String(other.find.bank);

			if (term !== "undefined") {
				list = api.banks.copy.filter((f) => {
					return String(f.name).toLowerCase().includes(term.toLowerCase());
				});
			}

			return list;
		}
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
			const response = await axios.get(MyConstants.ApiEndpoints.CashFlows.Modules.Entities.GetNewHeadSupportData, MyGlobal.GetHeaders({}));

			if (response.status === 200) {
				const basicPaymentSourceList = MyGlobal.GetBasicPaymentSourceList();

				setApi({
					firms: response.data.firms,
					banks: {
						copy: response.data.banks,
						data: response.data.banks,
					},
					paymentSources: {
						copy: basicPaymentSourceList,
						data: basicPaymentSourceList,
					},
				});

				setOther((s) => ({ ...s, hasMounted: true }));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, `${thisView} => Get Support Data`);
		} finally {
			setLoading((s) => ({ ...s, supportData: false }));
		}
	}

	function isAddEligible() {
		if (!main.amount || !main.purpose || !main.remarks) {
			return false;
		}

		if (!main.paymentSource.id || !main.paymentSource.name) {
			return false;
		}

		if (!main.firm.id || !main.firm.name || !main.bank.id || !main.bank.name) {
			return false;
		}

		return true;
	}

	function resetFields() {
		setMain({
			amount: "",
			entryAt: new Date(),
			firm: { id: "", name: "" },
			bank: { id: "", list: [], name: "" },
			paymentSource: { id: "", name: "" },
			purpose: "",
			remarks: "",
		});
	}

	function setBoxDrag() {
		setOther((s) => ({ ...s, isBoxMoved: !s.isBoxMoved }));
	}

	function setFind(key, value) {
		setOther((s) => ({ ...s, find: { ...s.find, [key]: value } }));
	}

	function setInputs(key, value) {
		if (value) {
			if (typeof value === "object") {
				if (key === "firm") {
					const banks = api.banks.copy.filter((f) => f.firm_id == value.id);
					const _paymentSources = MyGlobal.GetRevisedPaymentSourceList([banks.at(0)]);

					setApi((s) => ({
						...s,
						paymentSources: { copy: _paymentSources, data: _paymentSources },
					}));

					setMain((s) => ({
						...s,
						firm: { id: value.id, name: value.name },
						bank: { id: banks.at(0).id, list: banks, name: banks.at(0).name },
					}));
				} else if (key === "bank") {
					setMain((s) => ({
						...s,
						bank: { ...s.bank, id: value.id, name: value.name },
					}));
				} else if (key === "entryAt") {
					setMain((s) => ({ ...s, [key]: value }));
				} else if (key === "paymentSource") {
					setMain((s) => ({
						...s,
						paymentSource: { id: value.id, name: value.name },
					}));
				}
			} else {
				setMain((s) => ({ ...s, [key]: value }));
			}

			setOther((s) => ({ ...s, find: { firm: "", bank: "", paymentSource: "" } }));
		} else {
			if (["amount", "entryAt", "purpose", "remarks"].includes(key)) {
				setMain((s) => ({ ...s, [key]: value }));
			}
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
		return <TextInput icon={faIndianRupee} id="Amount" label="Amount" onChange={(e) => setInputs("amount", e.target.value)} onKeyPress={(e) => !MyGlobal.HasNumbers(e.key) && e.preventDefault()} tabIndex="2" value={main.amount} width="w-full" />;
	}

	function uiBody() {
		if (loading.supportData) {
			return (
				<div className="flex w-full h-88 justify-center items-center">
					<SpinnerBig />
				</div>
			);
		} else {
			return (
				<div className="flex flex-col w-full pt-2 pb-4 justify-between items-center">
					<div className="flex flex-col w-full h-full px-5 space-y-2 justify-center items-center">
						<div className="flex w-full space-x-6 justify-center items-center">
							{uiEntryAt()}
							<div className="w-full" />
						</div>
						<div className="flex w-full space-x-5 justify-between items-center">
							{uiPurpose()}
							{uiAmount()}
						</div>
						<div className="flex w-full space-x-5 justify-between items-center">
							{uiFirms()}
							{uiBanks()}
						</div>
						<div className="flex w-full space-x-5 justify-between items-center">
							{uiPaymentSource()}
							{uiRemarks()}
						</div>
					</div>
				</div>
			);
		}
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

	function uiFirms() {
		return <ComboBox2 allowCreatingNewItem={false} comparingValue1="name" comparingValue2={main.firm.name} displayValue="name" filteredData={getFilteredFirms} hasDataObject icon={faBuilding} isReadOnly={false} label="Firm" onChange={(e) => setInputs("firm", e)} onClick={() => {}} onInputChange={(e) => setFind("firm", e.target.value)} onKeyPress={() => {}} searchedItem={other.find.firm} tabIndex="4" value={main.firm.name} width="w-full" />;
	}

	function uiBanks() {
		return <ComboBox2 allowCreatingNewItem={false} comparingValue1="name" comparingValue2={main.bank.name} displayValue="name" filteredData={getFilteredBanks} hasDataObject icon={faBank} isReadOnly={false} label="Banks" onChange={(e) => setInputs("bank", e)} onClick={() => {}} onInputChange={(e) => setFind("bank", e.target.value)} onKeyPress={() => {}} searchedItem={other.find.bank} tabIndex="5" value={main.bank.name} width="w-full" />;
	}

	function uiPaymentSource() {
		return <ComboBox2 allowCreatingNewItem={false} comparingValue1="name" comparingValue2={main.paymentSource.name} displayValue="name" filteredData={getPaymentSources} hasDataObject icon={faBank} isMenuInverted isReadOnly={false} label="Payment Source" onChange={(e) => setInputs("paymentSource", e)} onClick={() => {}} onInputChange={(e) => setFind("paymentSource", e.target.value)} onKeyPress={() => {}} searchedItem={other.find.paymentSource} tabIndex="6" value={main.paymentSource.name} width="w-full" />;
	}

	function uiPurpose() {
		return <TextInput icon={faClipboardQuestion} id="purpose" label="Purpose" onChange={(e) => setInputs("purpose", e.target.value)} onKeyPress={() => {}} tabIndex="2" value={main.purpose} width="w-full" />;
	}

	function uiRemarks() {
		return <TextInput icon={faList} id="remarks" label="Remarks" onChange={(e) => setInputs("remarks", e.target.value)} onKeyPress={() => {}} tabIndex="7" value={main.remarks} width="w-full" />;
	}

	function uiTitleBar() {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">New Head</span>
				<FontAwesomeIcon className="cursor-pointer" icon={faXmark} onClick={() => unmount()} />
			</DialogTitle>
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
				<DialogPanel className="w-1/2 transform overflow-hidden rounded contrast-background shadow">
					{uiTitleBar()}
					{uiBody()}
					{uiFooter()}
				</DialogPanel>
			</div>
		</Dialog>
	);
}
