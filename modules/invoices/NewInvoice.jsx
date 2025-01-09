"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import Tippy from "@tippyjs/react";
import MyConstants from "@/utilities/constants";
import NewInvoicePreview from "@/modals/invoices/NewInvoicePreview";

import { QRCode } from "react-qrcode-logo";
import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { Tooltip } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ComboBox2, DatePicker, TextArea, TextInput } from "@/components/Inputs";
import {
	faBank,
	faCalendar,
	faChevronLeft,
	faCircleMinus,
	faHashtag,
	faIndianRupee,
	faListCheck,
	faMinusCircle,
	faPlusCircle,
	faTasks,
} from "@fortawesome/free-solid-svg-icons";

export default function NewInvoice({ project, reload, unmount }) {
	// Business Logic
	const financialYear = `${dayjs(new Date()).format("YYYY")}-${dayjs(new Date()).add(1, "y").format("YY")}`;

	const today = new Date();
	const invoiceDueDate = new Date(today);
	invoiceDueDate.setDate(invoiceDueDate.getDate() + 7);

	const [api, setApi] = useState({
		clients: [],
		companies: [],
	});

	const [main, setMain] = useState({
		bank: {
			accountNumber: "",
			accountType: "",
			id: "",
			ifsc: "",
			list: [],
			name: "",
			upiId: "",
		},
		financialYear,
		invoiceDate: new Date(),
		invoiceDueDate,
		invoiceId: 0,
		invoiceNumber: 0,
		ownerFirm: { address: "", id: "", name: "", termsConditions: "" },
		particulars: [
			{
				amount: project.quote,
				particulars: project.sub_project,
				professionalService: project.main_project,
				rowId: 0,
			},
		],
		totalAmountReceived: 0,
	});

	const [mounted, setMounted] = useState({
		mainComponent: false,
		preview: false,
	});

	const [loading, setLoading] = useState({
		addInvoice: false,
		downloadPdf: false,
		supportData: false,
	});

	const quote = project ? Number(project.quote) : 0;
	const totalPendingAmount = Math.abs(quote - main.totalAmountReceived);

	const finalPendingAmount = String.fromCharCode(8377) + ` ${MyGlobal.ThousandSeparator(totalPendingAmount)}`;

	// Functions
	function addInvoice() {}

	function addRow() {
		const copy = [...main.particulars];

		let greatestId = copy.sort((a, b) => b.rowId - a.rowId).at(0).rowId;
		greatestId++;

		copy.push({ amount: 0, particulars: "", professionalService: project.main_project, rowId: greatestId });

		setMain((s) => ({ ...s, particulars: copy }));
	}

	function deleteRow(record) {
		const copy = [...main.particulars];
		const doesExist = copy.filter((f) => f.rowId == record.rowId);

		if (doesExist.length) {
			const revised = copy.filter((f) => f.rowId != record.rowId);
			setMain((s) => ({ ...s, particulars: revised }));
		}
	}

	function getCompanyDetails() {
		const company = api.companies.find((f) => f.id == project.company_id);
		let object = { address: "", name: "" };

		if (typeof company === "object") {
			object.address = company.address;
			object.name = company.name;
		} else {
			const client = api.clients.find((f) => f.id == project.client_id);

			if (typeof client === "object") {
				object.name = `M/S ${client.name}`;
			}
		}

		return object;
	}

	async function getSupportData() {
		try {
			setLoading((s) => ({ ...s, supportData: true }));

			const response = await axios.get(MyConstants.ApiEndpoints.Invoices.GetNewInvoiceSupportData, MyGlobal.GetHeaders());

			if (response.status === 200) {
				const invoiceId = MyGlobal.MakeNewInvoiceId(response.data.invoices);

				const ownerFirm = response.data.ownerFirms.find((f) => f.id == project.invoice_firm_id);

				const ownerFirmsBank = response.data.ownerFirmsBanks.find((f) => f.owner_firm_id == ownerFirm.id);

				const getAmountReceived = response.data.cashFlows.filter((f) => {
					return f.client_id == project.client_id && f.company_id == project.company_id && f.project_id == project.id;
				});

				const totalAmountReceived = getAmountReceived.reduce((pv, cv) => {
					return pv + Number(cv.amount_received);
				}, 0);

				setApi({ clients: response.data.clients, companies: response.data.companies });

				setMain((s) => ({
					...s,
					bank: {
						...s.bank,
						id: ownerFirmsBank.id,
						name: ownerFirmsBank.name,
					},
					invoiceId: invoiceId,
					ownerFirm: {
						address: ownerFirm.address,
						id: ownerFirm.id,
						name: ownerFirm.name,
						termsConditions: ownerFirm.terms_conditions,
					},
					totalAmountReceived,
				}));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, MyConstants.Modules.Derived.NewInvoice);
		} finally {
			setLoading((s) => ({ ...s, supportData: false }));
		}
	}

	function setBank(object) {
		setMain((s) => ({
			...s,
			bank: {
				id: object.id,
				list: object.list,
				name: object.name,
				upiId: object.upi_id,
			},
		}));
	}

	function setInputs(key, value) {
		if (key == "invoiceDate") {
			const newDueDate = new Date(value);
			newDueDate.setDate(newDueDate.getDate() + 7);

			setMain((s) => ({ ...s, invoiceDueDate: newDueDate, invoiceDate: value }));
		} else {
			setMain((s) => ({ ...s, [key]: value }));
		}
	}

	function setParticulars(key, rowId, value) {
		const copy = [...main.particulars];
		const object = copy.filter((f) => f.rowId == rowId).at(0);

		object[key] = key == "amount" ? Number(value) : value;

		const revised = copy.filter((f) => f.rowId != rowId);
		revised.push({ ...object });

		setMain((s) => ({ ...s, particulars: revised }));
	}

	function togglePreview(value) {
		if (value) {
			addInvoice();
		}

		setMounted((s) => ({ ...s, preview: !mounted.preview }));
	}

	// UI Components

	// UI Input Fields
	function uiInputBank() {
		return (
			<ComboBox2
				allowCreatingNewItem={false}
				comparingValue1="name"
				comparingValue2={main.bank.name}
				displayValue="name"
				filteredData={main.bank.list}
				hasDataObject={true}
				icon={faBank}
				isReadOnly={false}
				label="Bank"
				onChange={(e) => setBank(e)}
				onClick={() => {}}
				onInputChange={() => {}}
				onKeyPress={() => {}}
				searchedItem=""
				tabIndex={5}
				value={main.bank.name}
				width="w-full"
			/>
		);
	}

	function uiInputFields() {
		return (
			<div className="flex w-1/2 h-full justify-center items-center">
				<div className="flex flex-col w-full h-full px-4 py-2 space-y-1 justify-start items-center overflow-y-auto bg-white">
					<div className="flex w-full px-5 space-x-5 justify-between items-center">
						{uiInputFinancialYear()}
						{uiInputInvoiceId()}
					</div>
					<div className="flex w-full px-5 space-x-5 justify-between items-center">
						{uiInputInvoiceDate()}
						{uiInputInvoiceDueDate()}
					</div>
					<div className="flex w-full px-5 space-x-5 justify-between items-center">{uiInputBank()}</div>
					<div className="flex flex-col w-full px-5 justify-between items-center">{uiInputParticularsRows()}</div>
					<div className="flex w-full px-5 justify-center items-center">{uiInputTermsConditions()}</div>
				</div>
			</div>
		);
	}

	function uiInputFinancialYear() {
		return (
			<TextInput
				icon={faCalendar}
				label="Financial Year"
				maxLength={7}
				onChange={(e) => setInputs("financialYear", e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasNumbers(e.key) && e.preventDefault()}
				tabIndex={1}
				value={main.financialYear}
				width="w-full"
			/>
		);
	}

	function uiInputInvoiceDate() {
		return (
			<DatePicker
				icon={faCalendar}
				label="Invoice Date"
				onChange={(e) => setInputs("invoiceDate", e)}
				tabIndex={1}
				value={main.invoiceDate}
				width="w-full"
			/>
		);
	}

	function uiInputInvoiceDueDate() {
		return (
			<DatePicker icon={faCalendar} label="Due Date" onChange={(e) => setInputs("dueDate", e)} tabIndex={2} value={main.invoiceDueDate} width="w-full" />
		);
	}

	function uiInputInvoiceId() {
		return (
			<TextInput
				icon={faHashtag}
				label="ID"
				maxLength={5}
				onChange={(e) => setInputs("invoiceId", e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasNumbers(e.key) && e.preventDefault()}
				tabIndex={2}
				value={main.invoiceId}
				width="w-full"
			/>
		);
	}

	function uiInputParticulars(record, rowId) {
		return (
			<TextInput
				icon={faTasks}
				id={`particulars${rowId + 1}`}
				label={`Particulars #${rowId + 1}`}
				onChange={(e) => setParticulars("particulars", rowId, e.target.value)}
				onKeyPress={() => {}}
				tabIndex={`${rowId}1`}
				value={record.particulars}
				width="w-full"
			/>
		);
	}

	function uiInputAmount(record, rowId) {
		return (
			<TextInput
				icon={faIndianRupee}
				id={`amount${rowId + 1}`}
				label={`Amount #${rowId + 1}`}
				onChange={(e) => setParticulars("amount", rowId, e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasNumbers(e.key) && e.preventDefault()}
				tabIndex={`${rowId}2`}
				value={record.amount}
				width="w-full"
			/>
		);
	}

	function uiInputParticularsRows() {
		return main.particulars
			.sort((a, b) => a.rowId - b.rowId)
			.map((m, i) => {
				const showAddButton = i == main.particulars.length - 1 ? "visible" : "invisible";

				const showDeleteButton = main.particulars.length > 1 ? "visible" : "invisible";

				const addButtonWrapper = `flex w-fit h-[55px] justify-center items-center ${showAddButton}`;

				const deleteButtonWrapper = `flex w-fit h-[55px] justify-center items-center ${showDeleteButton}`;

				const reverseButtons = main.particulars.length > 1 ? "flex-row" : "flex-row-reverse";

				const buttonsWrapper = `flex ${reverseButtons} w-fit space-x-3 justify-center items-end`;

				return (
					<div className="flex w-full space-x-3 justify-between items-end animate__animated animate__slideInDown" key={m.rowId}>
						{uiInputParticulars(m, i)}
						{uiInputAmount(m, i)}
						<div className={buttonsWrapper}>
							<div className={addButtonWrapper}>
								<FontAwesomeIcon className="cursor-pointer green-text" icon={faPlusCircle} onClick={() => addRow()} size="lg" />
							</div>
							<div className={deleteButtonWrapper}>
								<FontAwesomeIcon className="cursor-pointer red-text" icon={faMinusCircle} onClick={() => deleteRow(m)} size="lg" />
							</div>
						</div>
					</div>
				);
			});
	}

	function uiInputTermsConditions() {
		const termsConditions = main.ownerFirm.termsConditions.replace(/\\n/g, "\n");
		const termsConditionsLength = termsConditions.split("\n").length;

		return (
			<TextArea
				icon={faListCheck}
				label="Terms & Conditions"
				onChange={(e) => setInputs("termsConditions", e.target.value)}
				onKeyDown={() => {}}
				rows={termsConditionsLength + termsConditionsLength}
				tabIndex={9}
				value={termsConditions}
				width="w-full"
			/>
		);
	}

	// UI Invoice Sheet
	function uiBank() {
		const label = "flex w-1/2 justify-start items-center font-regular-10";
		const value = `flex w-1/2 justify-start items-center font-semibold-10`;

		return (
			<div className="flex flex-col w-[calc(100%-170px)] p-3 justify-center items-center rounded logo-green-border logo-green-background-transparent-01">
				<span className="w-full text-left font-medium-12 logo-green-text">Bank Details</span>
				<div className="flex w-full justify-between items-center text-black">
					<span className={label}>Account Name</span>
					<span className={value}>{main.ownerFirm.name}</span>
				</div>
				<div className="flex w-full justify-between items-center">
					<span className={label}>Account Number</span>
					<span className={value}>{main.bank.accountNumber}</span>
				</div>
				<div className="flex w-full justify-between items-center">
					<span className={label}>Account Type</span>
					<span className={value}>{main.bank.accountType}</span>
				</div>
				<div className="flex w-full justify-between items-center">
					<span className={label}>Bank Name</span>
					<span className={value}>{main.bank.name}</span>
				</div>
				<div className="flex w-full justify-between items-center">
					<span className={label}>IFSC</span>
					<span className={value}>{main.bank.ifsc}</span>
				</div>
			</div>
		);
	}

	function uiBilledBy() {
		const { address, name } = main.ownerFirm;
		const _address = address.length > 95 ? `${address.substring(0, 95)}...` : address;

		return (
			<div className="flex flex-col w-full h-[135px] p-3 justify-start items-center rounded logo-green-border logo-green-background-transparent-01 text-black">
				<span className="w-full text-left font-medium-12 logo-green-text">Billed By</span>
				<span className="w-full text-left font-medium-14">{name}</span>
				<span className="w-full text-left font-regular-10">
					<Tippy allowHTML content={<Tooltip text={address} />}>
						<span>{_address}</span>
					</Tippy>
				</span>
			</div>
		);
	}

	function uiBilledTo() {
		const { address, name } = getCompanyDetails();

		let _address = "";

		if (address) {
			_address = address.length > 95 ? `${address.substring(0, 95)}...` : address;
		}

		return (
			<div className="flex flex-col w-full h-[135px] p-3 justify-start items-center rounded logo-green-border logo-green-background-transparent-01">
				<span className="w-full text-left font-medium-12 logo-green-text">Billed To</span>
				<span className="w-full text-left font-medium-14">{name === "null" ? "" : name}</span>
				<span className="w-full text-left font-regular-10">
					<Tippy allowHTML content={<Tooltip text={_address} />}>
						<span>{_address}</span>
					</Tippy>
				</span>
			</div>
		);
	}

	function uiInvoice() {
		const invoiceDate = dayjs(main.invoiceDate).format("DD-MM-YYYY");
		const invoiceDueDate = dayjs(main.invoiceDueDate).format("DD-MM-YYYY");

		return (
			<div className="flex flex-col w-full space-y-1 justify-start items-center">
				<span className="w-full text-left font-medium-16 logo-green-text">Invoice</span>
				<div className="flex w-full justify-start items-center">
					<span className="w-2/5 font-regular-10 gray-text">Invoice</span>
					<div className="flex w-3/5 space-x-1 font-medium-10 black-text">
						<span>{MyGlobal.GetInitials(main.ownerFirm.name)}</span>
						<span>/</span>
						<span>{main.financialYear}</span>
						<span>/</span>
						<span>{main.invoiceId}</span>
					</div>
				</div>
				<div className="flex w-full justify-start items-center">
					<span className="w-2/5 font-regular-10 gray-text">Invoice Date</span>
					<span className="flex w-3/5 font-medium-10">{invoiceDate}</span>
				</div>
				<div className="flex w-full justify-start items-center">
					<span className="w-2/5 font-regular-10 gray-text">Invoice Due Date</span>
					<span className="flex w-3/5 font-medium-10">{invoiceDueDate}</span>
				</div>
				<div className="flex w-full justify-start items-center">
					<span className="w-2/5 font-regular-10 gray-text">Bank</span>
					<span className="flex w-3/5 font-medium-10 black-text">{main.bank.name}</span>
				</div>
			</div>
		);
	}

	function uiInvoiceSheet() {
		return (
			<div className="flex w-1/2 h-full justify-center items-center">
				<div className="flex flex-col w-full h-full px-4 py-2 space-y-4 justify-start items-center overflow-y-auto bg-white" id="invoiceBody">
					<div className="flex w-full justify-between items-center bg-white">
						{uiInvoice()}
						<div className="flex w-full justify-end items-center">
							<img src="../logo.png" width="55" height="75" />
						</div>
					</div>
					<div className="flex w-full space-x-5 justify-between items-start">
						{uiBilledBy()}
						{uiBilledTo()}
					</div>
					<div className="flex flex-col w-full justify-between items-center">
						{uiParticularsHeaders()}
						{uiParticularsRows()}
					</div>
					<div className="flex w-full h-full space-x-2.5 justify-between items-end">
						{uiBank()}
						{uiQrCode()}
					</div>
					{uiTotalAmount()}
					<div className="flex w-full h-full justify-between items-end">{uiTermsAndConditions()}</div>
				</div>
			</div>
		);
	}

	function uiParticularsHeaders() {
		return (
			<div className="flex flex-col w-full justify-center items-start">
				<div className="flex w-full h-8 justify-between items-center rounded-tr rounded-tl font-regular-10 text-white logo-green-background">
					<span className="w-1/2 text-center">Professional Service</span>
					<span className="w-1/4 text-center">Particulars</span>
					<span className="w-1/4 text-center">Amount</span>
				</div>
			</div>
		);
	}

	function uiParticularsRows() {
		return main.particulars.map((m) => {
			return (
				<div className="flex flex-col w-full justify-center items-start">
					<div className="flex w-full justify-between items-center rounded-br rounded-bl font-regular-10 text-black full-border logo-green-background-transparent-01 no-top-border">
						<span className="flex w-1/2 h-14 justify-center items-center">{m.professionalService}</span>
						<span className="flex w-1/2 h-14 justify-center items-center">{m.particulars}</span>
						<span className="flex w-1/4 h-14 justify-center items-center">{m.amount}</span>
					</div>
				</div>
			);
		});
	}

	function uiQrCode() {
		const qrCodeContent = `upi://pay?pa=${main.bank.upiId}&am=${totalPendingAmount}&cu=INR`;

		return (
			<div className="flex w-1/5 pt-2 justify-end items-center">
				<QRCode quietZone={0} value={qrCodeContent} />
			</div>
		);
	}

	function uiTermsAndConditions() {
		const termsConditions = main.ownerFirm.termsConditions
			? main.ownerFirm.termsConditions.split("nnn.").map((entry, index) => <li key={index}>{entry}</li>)
			: "";

		return (
			<div className="flex flex-col w-full space-y-px justify-start items-center">
				<span className="w-full text-left font-medium-14 logo-green-text">Terms and Conditions</span>
				<span className="flex w-full space-x-2 justify-start items-center font-regular-10">
					<ol className="whitespace-pre-line">{termsConditions}</ol>
				</span>
			</div>
		);
	}

	function uiTotalAmount() {
		return (
			<div className="flex flex-col w-full justify-center items-center">
				<div className="flex w-full pt-1 justify-between items-center font-medium-16">
					<span className="w-1/2 text-left text-black">Professional Fees</span>
					<span className="w-1/2 text-right black-text">{MyGlobal.ThousandSeparator(quote)}</span>
				</div>
				<div className="flex w-full pt-1 justify-between items-center border-gray border-t-2 font-medium-12">
					<span className="w-1/2 space-x-2.5 text-left text-black">
						<FontAwesomeIcon icon={faCircleMinus} />
						<span>Amount Received</span>
					</span>
					<span className="w-1/2 text-right black-text">{MyGlobal.ThousandSeparator(main.totalAmountReceived)}</span>
				</div>
				<div className="flex w-full pt-1 justify-between items-center border-gray border-y-2 font-medium-16">
					<span className="w-1/2 text-left text-black">Total</span>
					<span className="w-1/2 text-right logo-green-text">{finalPendingAmount}</span>
				</div>
			</div>
		);
	}

	// Hooks
	useEffect(() => {
		getSupportData();
	}, []);

	// Main UI
	return (
		<div className="flex flex-col w-full h-full justify-center items-center">
			<div className="flex w-full px-5 py-2.5 justify-between items-center bottom-border light-gray-background">
				<div className="flex w-full space-x-2.5 justify-start items-center">
					<FontAwesomeIcon className="pr-1 cursor-pointer black-text" icon={faChevronLeft} onClick={() => unmount()} />
					<div className="flex w-full justify-start items-center">
						<span className="view-heading">New Invoice</span>
					</div>
				</div>
			</div>
			<div className="flex w-full h-[calc(100vh-148px)] space-x-2.5 justify-between items-center overflow-y-auto contrast-background">
				{uiInputFields()}
				{uiInvoiceSheet()}
			</div>
			<footer className="w-full dialog-footer">
				<button className="primary-button-condensed" onClick={() => togglePreview()}>
					Preview
				</button>
			</footer>

			{mounted.preview && <NewInvoicePreview mount={mounted.preview} invoice={main} unmount={togglePreview} />}
		</div>
	);
}
