"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import Draggable from "react-draggable";
import MyConstants from "@/utilities/constants";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { Spinner, SpinnerBig } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { ComboBox, ComboBox2, DatePicker, TextInput } from "@/components/Inputs";
import { faBank, faBuilding, faCalendar, faFile, faIndianRupee, faInfoCircle, faList, faXmark } from "@fortawesome/free-solid-svg-icons";

export default function EditTransaction({ entity, mount, reload, transaction, unmount }) {
	// Business Logic
	const [api, setApi] = useState({
		ownerFirms: [],
		ownerFirmsBanks: { copy: [], data: [] },
		paymentSources: { copy: [], data: [] },
		paymentTypes: [],
	});

	const [loading, setLoading] = useState({
		editing: false,
		supportData: false,
	});

	const [main, setMain] = useState({
		amount: "",
		entryAt: new Date(),
		ownerFirm: { id: "", name: "" },
		ownerFirmBank: { id: "", list: [], name: "" },
		particulars: "",
		paymentSource: { id: "", name: "" },
		paymentType: "",
		remarks: "",
	});

	const [other, setOther] = useState({
		find: {
			ownerFirm: "",
			ownerFirmBank: "",
			paymentSource: "",
		},
		isBoxMoved: false,
	});

	const isOfficeExpense = entity.module.id === MyConstants.Modules.Other.CashFlowModules.OfficeExpense.id;

	const titleBarCursor = other.isBoxMoved ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header shadow draggable-handle ${titleBarCursor}`;

	// Functions
	async function doEditing() {
		setLoading((s) => ({ ...s, editing: true }));

		const body = {
			amount: Number(main.amount),
			entityId: entity.id,
			entryAt: main.entryAt,
			headId: entity.head.id,
			isOfficeExpense,
			moduleId: entity.module.id,
			ownerFirmsId: main.ownerFirm.id,
			ownerFirmsBankId: main.ownerFirmBank.id,
			particulars: main.particulars,
			paymentSource: main.paymentSource.id,
			paymentType: main.paymentType,
			remarks: main.remarks,
			userId: MyGlobal.GetUserId(),
			transactionId: transaction.id,
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.CashFlows.Modules.EditTransaction, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reload();

				MyGlobal.AddActivity(
					`Edited transaction of <b>${entity.module.name}</b> in <b>${entity.name}</b> in <b>${entity.purpose}</b>.`,
					MyConstants.Modules.Base.CashFlow,
				);
				MyGlobal.ShowSuccessToast(MyConstants.Messages.TransactionEdited);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, `Cash Flow => ${entity.module.name} => ${entity.name} => ${entity.purpose} => New Transaction`);
		} finally {
			setLoading((s) => ({ ...s, editing: false }));
			unmount();
		}
	}

	function getEditButtonStyle() {
		const disableEditButton = loading.editing ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";
		return `primary-button-condensed ${disableEditButton}`;
	}

	function getFilteredOwnerFirms() {
		let list = api.ownerFirms;
		const term = String(other.find.ownerFirm);

		if (term !== "undefined") {
			list = api.ownerFirms.filter((f) => {
				return String(f.name).toLowerCase().includes(term.toLowerCase());
			});
		}

		return list;
	}

	function getFilteredOwnerFirmsBanks() {
		if (main.ownerFirmBank.list.length) {
			return main.ownerFirmBank.list;
		} else {
			let list = api.ownerFirmsBanks.copy;
			const term = String(other.find.ownerFirmBank);

			if (term !== "undefined") {
				list = api.ownerFirmsBanks.copy.filter((f) => {
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
			const response = await axios.get(MyConstants.ApiEndpoints.CashFlows.Modules.GetNewTransactionSupportData, MyGlobal.GetHeaders({}));

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
					paymentTypes: JSON.parse(response.data.settings.at(0).value),
				});

				setMain({
					amount: transaction.amount,
					entryAt: transaction.entry_at,
					ownerFirm: {
						id: transaction.owner_firm_id,
						name: transaction.owner_firm_name,
					},
					ownerFirmBank: {
						id: transaction.owner_firm_bank_id,
						list: [],
						name: transaction.owner_firm_bank_name,
					},
					particulars: transaction.particulars,
					paymentSource: {
						id: transaction.payment_source,
						name: transaction.payment_source_name,
					},
					paymentType: transaction.payment_type,
					remarks: transaction.remarks,
				});

				setOther((s) => ({ ...s, hasMounted: true }));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, `${MyConstants.Modules.Base.CashFlow} => ${entity.name} => Edit Transaction`);
		} finally {
			setLoading((s) => ({ ...s, supportData: false }));
		}
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
				if (key === "ownerFirm") {
					const banks = api.ownerFirmsBanks.copy.filter((f) => f.owner_firm_id == value.id);
					const _paymentSources = MyGlobal.GetRevisedPaymentSourceList([banks.at(0)]);

					setApi((s) => ({
						...s,
						paymentSources: { copy: _paymentSources, data: _paymentSources },
					}));

					setMain((s) => ({
						...s,
						ownerFirm: { id: value.id, name: value.name },
						ownerFirmBank: { id: banks.at(0).id, list: banks, name: banks.at(0).name },
					}));
				} else if (key === "ownerFirmBank") {
					setMain((s) => ({
						...s,
						ownerFirmBank: { ...s.ownerFirmBank, id: value.id, name: value.name },
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

			setOther((s) => ({ ...s, find: { ownerFirm: "", ownerFirmBank: "", paymentSource: "" } }));
		} else {
			if (!["ownerFirm", "ownerFirmBank", "paymentSource"].includes(key)) {
				setMain((s) => ({ ...s, [key]: value }));
			}
		}
	}

	// UI Components
	function uiEdit() {
		if (loading.editing) {
			return (
				<span className="px-3.5">
					<Spinner />
				</span>
			);
		} else {
			return "Edit";
		}
	}

	function uiAmount() {
		return (
			<TextInput
				icon={faIndianRupee}
				id="amount"
				label="Amount"
				onChange={(e) => setInputs("amount", e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasNumbers(e.key) && e.preventDefault()}
				tabIndex="2"
				value={main.amount}
				width="w-full"
			/>
		);
	}

	function uiBody() {
		if (loading.supportData) {
			return (
				<div className="flex w-full h-[352px] justify-center items-center">
					<SpinnerBig />
				</div>
			);
		} else {
			return (
				<div className="flex flex-col w-full pt-2 pb-4 justify-between items-center">
					<div className="flex flex-col w-full h-full px-5 space-y-2 justify-center items-center">
						<div className="flex w-full space-x-5 justify-between items-center">
							{uiEntryAt()}
							{uiAmount()}
						</div>
						<div className="flex w-full space-x-5 justify-between items-center">
							{uiOwnerFirms()}
							{uiOwnerFirmsBanks()}
						</div>
						<div className="flex w-full space-x-5 justify-between items-center">
							{uiPaymentType()}
							{uiPaymentSource()}
						</div>
						<div className="flex w-full space-x-5 justify-center items-start">
							{uiParticulars()}
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
				<button className={getEditButtonStyle()} onClick={() => doEditing()} tabIndex="10">
					{uiEdit()}
				</button>
			</footer>
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
				onChange={(e) => setInputs("ownerFirm", e)}
				onClick={() => {}}
				onInputChange={(e) => setFind("ownerFirm", e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasAlphabets(e.key) && e.preventDefault()}
				searchedItem={other.find.ownerFirm}
				tabIndex="3"
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
				comparingValue2={main.ownerFirmBank.name}
				displayValue="name"
				filteredData={getFilteredOwnerFirmsBanks}
				hasDataObject
				icon={faBank}
				isReadOnly={false}
				label="Banks"
				onChange={(e) => setInputs("ownerFirmBank", e)}
				onClick={() => {}}
				onInputChange={(e) => setFind("ownerFirmBank", e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasAlphabets(e.key) && e.preventDefault()}
				searchedItem={other.find.ownerFirmBank}
				tabIndex="4"
				value={main.ownerFirmBank.name}
				width="w-full"
			/>
		);
	}

	function uiParticulars() {
		return (
			<TextInput
				icon={faInfoCircle}
				id="particulars"
				label="Particulars"
				onChange={(e) => setInputs("particulars", e.target.value)}
				onKeyPress={() => {}}
				tabIndex="7"
				value={main.particulars}
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
				isReadOnly={false}
				label="Payment Source"
				onChange={(e) => setInputs("paymentSource", e)}
				onClick={() => {}}
				onInputChange={(e) => setFind("paymentSource", e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasAlphabets(e.key) && e.preventDefault()}
				searchedItem={other.find.paymentSource}
				tabIndex="6"
				value={main.paymentSource.name}
				width="w-full"
			/>
		);
	}

	function uiPaymentType() {
		return (
			<ComboBox
				allowCreatingNewItem={false}
				comparisonValue=""
				filteredData={api.paymentTypes}
				icon={faFile}
				isReadOnly={isOfficeExpense}
				label="Payment Type"
				onChange={(e) => setInputs("paymentType", e)}
				onClick={() => {}}
				onKeyPress={() => {}}
				searchedItem=""
				tabIndex="5"
				value={main.paymentType}
				width="w-full"
			/>
		);
	}

	function uiRemarks() {
		return (
			<TextInput
				icon={faList}
				id="remarks"
				label="Remarks"
				onChange={(e) => setInputs("remarks", e.target.value)}
				onKeyPress={() => {}}
				tabIndex="8"
				value={main.remarks}
				width="w-full"
			/>
		);
	}

	function uiTitleBar() {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">Edit Transaction</span>
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
