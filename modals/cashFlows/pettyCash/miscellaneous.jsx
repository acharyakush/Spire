"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import "tippy.js/animations/shift-away.css";

import axios from "axios";
import MyConstants from "@/utilities/constants";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { Spinner, SpinnerBig } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { ComboBox, ComboBox2, DatePicker, TextInput } from "@/components/Inputs";
import { faBuilding, faCalendar, faFile, faIndianRupee, faInfoCircle, faList, faXmark } from "@fortawesome/free-solid-svg-icons";

export function EditTransaction({ lastTransaction, mount, reload, transaction, unmount }) {
	// Business Logic
	const [api, setApi] = useState({
		firms: [],
		openingBalance: 0,
	});

	const [loading, setLoading] = useState({
		editing: false,
		supportData: false,
	});

	const [main, setMain] = useState({
		amountPaid: "",
		amountReceived: "",
		balance: 0,
		entryAt: new Date(),
		firm: { id: "", name: "" },
		particulars: "",
		paymentType: "",
		remarks: "",
	});

	const [other, setOther] = useState({
		find: { firm: "" },
		hasError: false,
		isBoxMoved: false,
	});

	const titleBarCursor = other.isBoxMoved ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header shadow draggable-handle ${titleBarCursor}`;

	// Functions
	async function doEditing() {
		setLoading((s) => ({ ...s, editing: true }));

		let balance = 0;

		if (main.amountPaid.length) {
			balance = lastTransaction.id > 1 ? Number(lastTransaction.balance) - Number(main.amountPaid) : api.openingBalance - Number(main.amountPaid);
		} else {
			balance = lastTransaction.id > 1 ? Number(lastTransaction.balance) + Number(main.amountReceived) : api.openingBalance + Number(main.amountReceived);
		}

		const body = {
			amountPaid: Number(main.amountPaid),
			amountReceived: Number(main.amountReceived),
			balance,
			entryAt: main.entryAt,
			firmId: main.firm.id,
			id: transaction.id,
			particulars: main.particulars,
			paymentType: main.paymentType,
			remarks: main.remarks,
			userId: MyGlobal.GetUserId(),
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.CashFlows.Modules.PettyCash.EditTransaction, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reload("reload-transactions");

				MyGlobal.AddActivity(`Edited transaction in <b>${MyConstants.Modules.Other.CashFlowModules.PettyCash.name}</b>.`, MyConstants.Modules.Base.CashFlow);
				MyGlobal.ShowSuccessToast(MyConstants.Messages.TransactionEdited);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, `Cash Flow => ${MyConstants.Modules.Other.CashFlowModules.PettyCash.name} => Edit Transaction`);
		} finally {
			setLoading((s) => ({ ...s, editing: false }));
			unmount();
		}
	}

	function getAddButtonStyle() {
		const disableAddButton = !isAddEligible() ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";
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

	async function getSupportData() {
		setLoading((s) => ({ ...s, supportData: true }));

		try {
			const response = await axios.get(MyConstants.ApiEndpoints.CashFlows.Modules.GetNewTransactionSupportData, MyGlobal.GetHeaders({}));

			if (response.status === 200) {
				setApi({
					firms: response.data.firms,
					openingBalance: Number(response.data.openingBalance.at(0).balance),
				});

				setMain({
					amountPaid: Number(transaction.amount_paid),
					amountReceived: Number(transaction.amount_received),
					balance: Number(transaction.balance),
					entryAt: new Date(transaction.entry_at),
					firm: {
						id: transaction.firm_id,
						name: transaction.firm_name,
					},
					particulars: transaction.particulars,
					paymentType: transaction.payment_type,
					remarks: transaction.remarks,
				});
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, `${MyConstants.Modules.Base.CashFlow} => ${MyConstants.Modules.Other.CashFlowModules.PettyCash.name} => New Transaction`);
		} finally {
			setLoading((s) => ({ ...s, supportData: false }));
		}
	}

	function isAddEligible() {
		if (!main.particulars || !main.paymentType || !main.remarks) {
			return false;
		}

		if (!main.firm.id || !main.firm.name) {
			return false;
		}

		if (other.hasError || loading.editing) {
			return false;
		}

		return true;
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
					setMain((s) => ({
						...s,
						firm: { id: value.id, name: value.name },
					}));

					setOther((s) => ({ ...s, find: { firm: "" } }));
				} else if (key === "entryAt") {
					setMain((s) => ({ ...s, [key]: value }));
				}
			} else {
				if (key === "amountPaid") {
					if (Number(value) > Number(lastTransaction.balance)) {
						setOther((s) => ({ ...s, hasError: true }));
					} else {
						setOther((s) => ({ ...s, hasError: false }));
					}

					setMain((s) => ({ ...s, [key]: value }));
				} else {
					setMain((s) => ({ ...s, [key]: value }));
				}
			}
		} else {
			if (!["firm", "paymentType"].includes(key)) {
				setMain((s) => ({ ...s, [key]: value }));
			}

			setOther((s) => ({ ...s, hasError: false }));
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

	function uiAmountPaid() {
		const error = (
			<div className="p-2 space-x-1 font-regular-11">
				<span>Paying amount cannot be more than the current balance</span>
				<span className="font-bold-11">{MyGlobal.ThousandSeparator(lastTransaction.balance)}</span>
			</div>
		);

		return (
			<div className="flex flex-col w-full space-y-2 justify-center items-center">
				<TextInput errorText={error} hasError={other.hasError} icon={faIndianRupee} id="amountPaid" isReadOnly={transaction.amount_received != "0.00"} label="Amount Paid" onChange={(e) => setInputs("amountPaid", e.target.value)} onKeyPress={(e) => !MyGlobal.HasNumbers(e.key) && e.preventDefault()} tabIndex="6" value={main.amountPaid} width="w-full" />
			</div>
		);
	}

	function uiAmountReceived() {
		return <TextInput icon={faIndianRupee} id="amountReceived" isReadOnly={transaction.amount_paid != "0.00"} label="Amount Received" onChange={(e) => setInputs("amountReceived", e.target.value)} onKeyPress={(e) => !MyGlobal.HasNumbers(e.key) && e.preventDefault()} tabIndex="7" value={main.amountReceived} width="w-full" />;
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
						<div className="flex w-full space-x-6 justify-between items-center">
							{uiEntryAt()}
							<div className="w-full" />
						</div>
						<div className="flex w-full space-x-5 justify-between items-center">
							{uiFirms()}
							{uiPaymentType()}
						</div>
						<div className="flex w-full space-x-5 justify-center items-start">
							{uiParticulars()}
							{uiRemarks()}
						</div>
						<div className="flex w-full space-x-5 justify-between items-center">
							{uiAmountPaid()}
							{uiAmountReceived()}
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
				<button className={getAddButtonStyle()} onClick={() => doEditing()} tabIndex="10">
					{uiEdit()}
				</button>
			</footer>
		);
	}

	function uiFirms() {
		return <ComboBox2 allowCreatingNewItem={false} comparingValue1="name" comparingValue2={main.firm.name} displayValue="name" filteredData={getFilteredFirms} hasDataObject icon={faBuilding} isReadOnly={false} label="Firm" onChange={(e) => setInputs("firm", e)} onClick={() => {}} onInputChange={(e) => setFind("firm", e.target.value)} onKeyPress={() => {}} searchedItem={other.find.firm} tabIndex="2" value={main.firm.name} width="w-full" />;
	}

	function uiParticulars() {
		return <TextInput icon={faInfoCircle} id="particulars" label="Particulars" onChange={(e) => setInputs("particulars", e.target.value)} onKeyPress={() => {}} tabIndex="4" value={main.particulars} width="w-full" />;
	}

	function uiPaymentType() {
		return <ComboBox allowCreatingNewItem={false} comparisonValue="" filteredData={["Client", "Office", "Others", "Withdrawn from Bank"]} icon={faFile} label="Payment Type" onChange={(e) => setInputs("paymentType", e)} onClick={() => {}} onKeyPress={() => {}} searchedItem="" tabIndex="3" value={main.paymentType} width="w-full" />;
	}

	function uiRemarks() {
		return <TextInput icon={faList} id="remarks" label="Remarks" onChange={(e) => setInputs("remarks", e.target.value)} onKeyPress={() => {}} tabIndex="5" value={main.remarks} width="w-full" />;
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
				<DialogPanel className="w-1/2 transform overflow-hidden rounded contrast-background shadow">
					{uiTitleBar()}
					{uiBody()}
					{uiFooter()}
				</DialogPanel>
			</div>
		</Dialog>
	);
}

export function NewTransaction({ lastTransaction, mount, reload, unmount }) {
	// Business Logic
	const [api, setApi] = useState({
		firms: [],
		openingBalance: 0,
	});

	const [loading, setLoading] = useState({
		adding: false,
		supportData: false,
	});

	const [main, setMain] = useState({
		amountPaid: "",
		amountReceived: "",
		balance: 0,
		entryAt: new Date(),
		firm: { id: "", name: "" },
		particulars: "",
		paymentType: "",
		remarks: "",
	});

	const [other, setOther] = useState({
		find: { firm: "" },
		hasError: false,
		isBoxMoved: false,
	});

	const titleBarCursor = other.isBoxMoved ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header shadow draggable-handle ${titleBarCursor}`;

	// Functions
	async function doAddition() {
		setLoading((s) => ({ ...s, adding: true }));

		let balance = 0;

		if (main.amountPaid.length) {
			balance = lastTransaction.id > 1 ? Number(lastTransaction.balance) - Number(main.amountPaid) : api.openingBalance - Number(main.amountPaid);
		} else {
			balance = lastTransaction.id > 1 ? Number(lastTransaction.balance) + Number(main.amountReceived) : api.openingBalance + Number(main.amountReceived);
		}

		const body = {
			amountPaid: Number(main.amountPaid),
			amountReceived: Number(main.amountReceived),
			balance,
			entryAt: main.entryAt,
			firmId: main.firm.id,
			particulars: main.particulars,
			paymentType: main.paymentType,
			remarks: main.remarks,
			userId: MyGlobal.GetUserId(),
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.CashFlows.Modules.PettyCash.AddTransaction, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reload("reload-transactions");

				MyGlobal.AddActivity(`Added transaction in <b>${MyConstants.Modules.Other.CashFlowModules.PettyCash.name}</b>.`, MyConstants.Modules.Base.CashFlow);
				MyGlobal.ShowSuccessToast(MyConstants.Messages.TransactionAdded);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, `Cash Flow => ${MyConstants.Modules.Other.CashFlowModules.PettyCash.name} => New Transaction`);
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

	async function getSupportData() {
		setLoading((s) => ({ ...s, supportData: true }));

		try {
			const response = await axios.get(MyConstants.ApiEndpoints.CashFlows.Modules.GetNewTransactionSupportData, MyGlobal.GetHeaders({}));

			if (response.status === 200) {
				setApi({
					firms: response.data.firms,
					openingBalance: Number(response.data.openingBalance.at(0).balance),
				});

				setOther((s) => ({ ...s, hasMounted: true }));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, `${MyConstants.Modules.Base.CashFlow} => ${MyConstants.Modules.Other.CashFlowModules.PettyCash.name} => New Transaction`);
		} finally {
			setLoading((s) => ({ ...s, supportData: false }));
		}
	}

	function isAddEligible() {
		if (!main.particulars || !main.paymentType || !main.remarks) {
			return false;
		}

		if (!main.firm.id || !main.firm.name || other.hasError) {
			return false;
		}

		return true;
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
					setMain((s) => ({
						...s,
						firm: { id: value.id, name: value.name },
					}));

					setOther((s) => ({ ...s, find: { firm: "" } }));
				} else if (key === "entryAt") {
					setMain((s) => ({ ...s, [key]: value }));
				}
			} else {
				if (key === "amountPaid") {
					if (Number(value) > Number(lastTransaction.balance)) {
						setOther((s) => ({ ...s, hasError: true }));
					} else {
						setOther((s) => ({ ...s, hasError: false }));
					}

					setMain((s) => ({ ...s, [key]: value }));
				} else {
					setMain((s) => ({ ...s, [key]: value }));
				}
			}
		} else {
			if (!["firm", "paymentType"].includes(key)) {
				setMain((s) => ({ ...s, [key]: value }));
			}

			setOther((s) => ({ ...s, hasError: false }));
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

	function uiAmountPaid() {
		const error = (
			<div className="p-2 space-x-1 font-regular-11">
				<span>Paying amount cannot be more than the current balance</span>
				<span className="font-bold-11">{MyGlobal.ThousandSeparator(lastTransaction.balance)}</span>
			</div>
		);

		return (
			<div className="flex flex-col w-full space-y-2 justify-center items-center">
				<TextInput errorText={error} hasError={other.hasError} icon={faIndianRupee} id="amountPaid" isReadOnly={main.amountReceived.length} label="Amount Paid" onChange={(e) => setInputs("amountPaid", e.target.value)} onKeyPress={(e) => !MyGlobal.HasNumbers(e.key) && e.preventDefault()} tabIndex="6" value={main.amountPaid} width="w-full" />
			</div>
		);
	}

	function uiAmountReceived() {
		return <TextInput icon={faIndianRupee} id="amountReceived" isReadOnly={main.amountPaid.length} label="Amount Received" onChange={(e) => setInputs("amountReceived", e.target.value)} onKeyPress={(e) => !MyGlobal.HasNumbers(e.key) && e.preventDefault()} tabIndex="7" value={main.amountReceived} width="w-full" />;
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
						<div className="flex w-full space-x-6 justify-between items-center">
							{uiEntryAt()}
							<div className="w-full" />
						</div>
						<div className="flex w-full space-x-5 justify-between items-center">
							{uiFirms()}
							{uiPaymentType()}
						</div>
						<div className="flex w-full space-x-5 justify-center items-start">
							{uiParticulars()}
							{uiRemarks()}
						</div>
						<div className="flex w-full space-x-5 justify-between items-center">
							{uiAmountPaid()}
							{uiAmountReceived()}
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
				<button className={getAddButtonStyle()} onClick={() => doAddition()} tabIndex="10">
					{uiAdd()}
				</button>
			</footer>
		);
	}

	function uiFirms() {
		return <ComboBox2 allowCreatingNewItem={false} comparingValue1="name" comparingValue2={main.firm.name} displayValue="name" filteredData={getFilteredFirms} hasDataObject icon={faBuilding} isReadOnly={false} label="Firm" onChange={(e) => setInputs("firm", e)} onClick={() => {}} onInputChange={(e) => setFind("firm", e.target.value)} onKeyPress={() => {}} searchedItem={other.find.firm} tabIndex="2" value={main.firm.name} width="w-full" />;
	}

	function uiParticulars() {
		return <TextInput icon={faInfoCircle} id="particulars" label="Particulars" onChange={(e) => setInputs("particulars", e.target.value)} onKeyPress={() => {}} tabIndex="4" value={main.particulars} width="w-full" />;
	}

	function uiPaymentType() {
		return <ComboBox allowCreatingNewItem={false} comparisonValue="" filteredData={["Client", "Office", "Others", "Withdrawn from Bank"]} icon={faFile} label="Payment Type" onChange={(e) => setInputs("paymentType", e)} onClick={() => {}} onKeyPress={() => {}} searchedItem="" tabIndex="3" value={main.paymentType} width="w-full" />;
	}

	function uiRemarks() {
		return <TextInput icon={faList} id="remarks" label="Remarks" onChange={(e) => setInputs("remarks", e.target.value)} onKeyPress={() => {}} tabIndex="5" value={main.remarks} width="w-full" />;
	}

	function uiTitleBar() {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">New Transaction</span>
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
