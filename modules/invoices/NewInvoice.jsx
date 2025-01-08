"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import Tippy from "@tippyjs/react";
import ReactDatePicker from "react-datepicker";
import MyConstants from "@/utilities/constants";
import NewInvoicePreview from "@/modals/invoices/NewInvoicePreview";

import { QRCode } from "react-qrcode-logo";
import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { Tooltip } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { faCheck, faChevronLeft, faCircleMinus } from "@fortawesome/free-solid-svg-icons";

export default function NewInvoice({ invoice, reload, unmount }) {
	// Business Logic
	const financialYear = `${dayjs(new Date()).format("YYYY")}-${dayjs(new Date()).add(1, "y").format("YY")}`;

	const [api, setApi] = useState({
		cashFlows: [],
		clients: [],
		companies: [],
		invoices: [],
		ownerFirms: [],
		ownerFirmsBanks: [],
	});

	const [main, setMain] = useState({
		createdAt: new Date(),
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
		id: "",
		ownerFirm: { address: "", id: "", name: "", termsConditions: "" },
		particulars: "",
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

	const quote = Number(invoice.quote);
	const totalPendingAmount = Math.abs(quote - main.totalAmountReceived);

	const finalPendingAmount = String.fromCharCode(8377) + ` ${MyGlobal.ThousandSeparator(totalPendingAmount)}`;

	// Functions
	function addInvoice() {}

	function getCompanyDetails() {
		const company = api.companies.filter((f) => f.id == invoice.company_id);

		if (company.length) {
			return company.at(0);
		} else {
			const clientName = api.clients.find((f) => f.id == invoice.client_id).name;
			return { address: "", name: `M/S ${clientName}` };
		}
	}

	async function getSupportData() {
		try {
			setLoading((s) => ({ ...s, supportData: true }));

			const response = await axios.get(MyConstants.ApiEndpoints.Invoices.GetNewInvoiceSupportData, MyGlobal.GetHeaders());

			if (response.status === 200) {
				const id = MyGlobal.MakeNewInvoiceId(response.data.invoices);

				const ownerFirm = response.data.ownerFirms.find((f) => f.id == invoice.project_id);

				const ownerFirmsBank = response.data.ownerFirmsBanks.find((f) => f.owner_firm_id == ownerFirm.id);

				const getAmountReceived = response.data.cashFlows.filter((f) => {
					return f.client_id == invoice.client_id && f.company_id == invoice.company_id && f.project_id == invoice.project_id;
				});

				const totalAmountReceived = getAmountReceived.reduce((pv, cv) => {
					return pv + Number(cv.amount_received);
				}, 0);

				setMain((s) => ({
					...s,

					bank: {
						...s.bank,
						id: ownerFirmsBank.id,
						name: ownerFirmsBank.name,
					},
					id,
					ownerFirm: {
						address: ownerFirm.address,
						id: ownerFirm.id,
						name: ownerFirm.name,
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
		setMain((s) => ({ ...s, [key]: value }));
	}

	function togglePreview(value) {
		if (value) {
			addInvoice();
		}

		setMounted((s) => ({ ...s, preview: !mounted.preview }));
	}

	// UI Components
	function uiBankDetails() {
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

	function uiBanksList() {
		if (main.ownerFirm.id) {
			return main.bank.list.map((m, i) => {
				return (
					<MenuItem
						as="div"
						className="w-full p-2 space-x-2.5 cursor-pointer font-regular-10 black-text hovered-rows"
						key={i}
						onClick={() => setBank(m)}>
						{main.bank.id == m.id && <FontAwesomeIcon className="primary-text" icon={faCheck} />}
						<span>{m.name}</span>
					</MenuItem>
				);
			});
		}
	}

	function uiBilledBy() {
		const formattedAddress = main.ownerFirm.address.length > 95 ? main.ownerFirm.address.substring(0, 95) + "..." : main.ownerFirm.address;

		return (
			<div className="flex flex-col w-full h-[135px] p-3 justify-start items-center rounded logo-green-border logo-green-background-transparent-01 text-black">
				<span className="w-full text-left font-medium-12 logo-green-text">Billed By</span>
				<span className="w-full text-left font-medium-14">{main.ownerFirm.name}</span>
				<span className="w-full text-left font-regular-10">
					<Tippy allowHTML content={<Tooltip text={main.ownerFirm.address} />}>
						<span>{formattedAddress}</span>
					</Tippy>
				</span>
			</div>
		);
	}

	function uiBilledTo() {
		const address = String(getCompanyDetails().address);
		const formattedAddress = address.length > 95 ? address.substring(0, 95) + "..." : address;

		return (
			<div className="flex flex-col w-full h-[135px] p-3 justify-start items-center rounded logo-green-border logo-green-background-transparent-01">
				<span className="w-full text-left font-medium-12 logo-green-text">Billed To</span>
				<span className="w-full text-left font-medium-14">{getCompanyDetails().name}</span>
				<span className="w-full text-left font-regular-10">
					<Tippy allowHTML content={<Tooltip text={formattedAddress} />}>
						<span>{formattedAddress}</span>
					</Tippy>
				</span>
			</div>
		);
	}

	function uiInvoice() {
		return (
			<div className="flex flex-col w-full space-y-1 justify-start items-center">
				<span className="w-full text-left font-medium-16 logo-green-text">Invoice</span>
				<span className="flex w-full justify-start items-center font-regular-10">
					<span className="w-1/3 gray-text">Invoice #</span>
					<span className="flex w-2/3 space-x-1 black-text">
						<div className="w-max relative text-left">
							<div className="flex w-full px-1 space-x-1 justify-between items-center rounded focus:outline-none relative top-px z-40">
								<span>{main.ownerFirm.name}</span>
							</div>
						</div>
						<span>/</span>
						<input
							autoComplete="off"
							className="inputs-autofit"
							maxLength="255"
							onChange={(e) => setInputs("financialYear", e.target.value)}
							tabIndex={1}
							type="text"
							value={main.financialYear}
						/>
						<span>/</span>
						<input
							autoComplete="off"
							className="inputs-autofit"
							maxLength="255"
							onChange={(e) => setInputs("id", e.target.value)}
							tabIndex={2}
							type="text"
							value={main.id}
						/>
					</span>
				</span>
				<span className="flex w-full justify-start items-center font-regular-10">
					<span className="w-1/3 gray-text">Invoice Date</span>
					<span className="flex w-2/3">
						<ReactDatePicker
							className="inputs-autofit !w-[100px] cursor-pointer"
							dateFormat="dd MMM, YYYY"
							onChange={(e) => setInputs("createdAt", e)}
							selected={main.createdAt}
							tabIndex={3}
						/>
					</span>
				</span>
				<span className="flex w-full justify-start items-center font-regular-10">
					<span className="w-1/3 gray-text">Default Bank</span>
					<span className="flex w-2/3 black-text">
						<Menu as="div" className="w-max relative text-left">
							<MenuButton className="flex w-full px-1 space-x-1 justify-between items-center rounded focus:outline-none relative z-40">
								<span>{main.bank.name}</span>
							</MenuButton>
							<MenuItems className="absolute w-max left-0 origin-top-left divide-y divide-gray-100 rounded black-white-background full-border bottom-shadow focus:outline-none z-50">
								{uiBanksList()}
							</MenuItems>
						</Menu>
					</span>
				</span>
			</div>
		);
	}

	function uiParticulars() {
		return (
			<div className="flex flex-col w-full justify-center items-start">
				<div className="flex w-full h-8 justify-between items-center rounded-tr rounded-tl font-regular-10 text-white logo-green-background">
					<span className="w-1/2 text-center">Professional Service</span>
					<span className="w-1/4 text-center">Particulars</span>
					<span className="w-1/4 text-center">Amount</span>
				</div>
				<div className="flex w-full justify-between items-center rounded-br rounded-bl font-regular-10 text-black full-border logo-green-background-transparent-01 no-top-border">
					<span className="flex w-1/2 h-14 justify-center items-center">{invoice.main_project}</span>
					<span className="flex w-1/4 h-14 justify-center items-center left-border right-border">
						<input
							className="inputs text-center align-middle"
							onChange={(e) => setInputs("particulars", e.target.value)}
							placeholder={invoice.sub_project}
							tabIndex={1}
							value={main.particulars}
						/>
					</span>
					<span className="flex w-1/4 h-14 justify-center items-center">{MyGlobal.ThousandSeparator(quote)}</span>
				</div>
			</div>
		);
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
		const termsConditions = main.ownerFirm.termsConditions.split("nnn.").map((entry, index) => <li key={index}>{entry}</li>);

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
					<span className="w-1/2 text-left text-black">Pending Amount</span>
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
		<>
			<div className="flex w-full px-5 py-2.5 justify-between items-center bottom-border light-gray-background">
				<div className="flex w-full space-x-2.5 justify-start items-center">
					<FontAwesomeIcon className="pr-1 cursor-pointer black-text" icon={faChevronLeft} onClick={() => unmount()} />
					<div className="flex w-full justify-start items-center">
						<span className="view-heading">New Invoice</span>
					</div>
				</div>
			</div>
			<div className="flex w-3/5 h-full justify-start items-center overflow-y-auto">
				<div className="flex w-full justify-center items-center relative z-50">
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
						{uiParticulars()}
						<div className="flex w-full h-full space-x-2.5 justify-between items-end">
							{uiBankDetails()}
							{uiQrCode()}
						</div>
						{uiTotalAmount()}
						<div className="flex w-full h-full justify-between items-end">{uiTermsAndConditions()}</div>
					</div>
				</div>
			</div>
			<footer className="w-full dialog-footer">
				<button className="primary-button-condensed" onClick={() => togglePreview()}>
					Preview
				</button>
			</footer>

			{mounted.preview && <NewInvoicePreview mount={mounted.preview} invoice={main} unmount={togglePreview} />}
		</>
	);
}
