"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import Global from "@/utilities/global";
import Constants from "@/utilities/constants";
import Elements from "@/utilities/ui-elements";

import { useState } from "react";
import { Menu } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGooglePay } from "@fortawesome/free-brands-svg-icons";
import { EmailAddress, TextArea, TextInput } from "@/components/Inputs";
import { faBank, faCheck, faChevronDown, faFileLines, faFileInvoice, faFont, faHashtag, faHome, faIdCard, faList, faPhone, faChevronLeft } from "@fortawesome/free-solid-svg-icons";

export default function NewCompany({ close, refreshAdminCompanies }) {
	// Business Logic
	const [data, setData] = useState({
		address: "",
		bank: {
			accountNumber: "",
			accountType: "",
			address: "",
			ifsc: "",
			name: "",
			phone: "",
			upiId: "",
		},
		email: "",
		gst: "",
		name: "",
		pendingResult: false,
		pan: "",
		phone: "",
		termsAndConditions: "",
	});

	const isCompanyFilled = Object.values(data).reduce((acc, value) => acc && value !== "", true);
	const isBankFilled = Object.values(data.bank).reduce((acc, value) => acc && value !== "" && value !== false, true);

	const addButtonPointerEvents = isCompanyFilled && isBankFilled ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-25";
	const addButtonStyle = `primary-button-condensed ${addButtonPointerEvents}`;

	// Functions
	const add = () => {
		setData((s) => ({ ...s, pendingResult: true }));

		const companyIntials = Global.getInitials(data.name);
		const termsAndConditions = data.termsAndConditions.replace(new RegExp("\n", "g"), "nnn.");

		const query = Global.encrypt(`INSERT INTO admin_companies (admin_company_id, name, address, phone, email, pan, gst, banks, terms_conditions) VALUES('${companyIntials}', '${data.name}', '${data.address}', '${data.phone}', '${data.email}', '${data.pan}', '${data.gst}', '[${JSON.stringify(data.bank)}]', '${termsAndConditions}')`);

		const body = { request: query, source: "admin_companies" };

		axios
			.post(Constants.apiEndpoints.setter, body, Global.getHeaders())
			.then((response) => {
				if (response.status == 200) {
					Global.addActivity(`Added new admin company ${companyIntials}.`);
					Global.showToasts(Constants.toastType.success, Constants.messages.adminCompanyAdded);
				} else {
					Global.showToasts(Constants.toastType.error, Constants.messages.someErrorOccurred);
				}

				refreshAdminCompanies();
				setData(null);
				close(true);
			})
			.catch((error) => Global.handleErrors(error, "Add Admin Company"))
			.finally(() => setData((s) => ({ ...s, pendingResult: false })));
	};

	const handleBankInputs = (key, value) => {
		setData((s) => ({ ...s, bank: { ...s.bank, [key]: value } }));
	};

	const handleInputs = (key, value) => {
		setData((s) => ({ ...s, [key]: value }));
	};

	// UI
	const uiAccountNumber = () => {
		return <TextInput icon={faHashtag} isNew={false} label="Bank Account Number" onChange={(e) => handleBankInputs("accountNumber", e.target.value)} onKeyPress={() => {}} tabIndex={9} value={data.bank.accountNumber} width="w-1/3" />;
	};

	const uiAccountTypeList = () => {
		return ["Current", "Savings"].map((type, index) => {
			return (
				<Menu.Item as="div" className="flex w-full p-2 space-x-2.5 justify-between items-center cursor-pointer font-regular-10 black-text hovered-rows" key={index} onClick={() => handleBankInputs("accountType", type)}>
					<span>{type}</span>
					{data.bank.accountType == type && <FontAwesomeIcon className="primary-text" icon={faCheck} />}
				</Menu.Item>
			);
		});
	};

	const uiAccountType = () => {
		return (
			<div className="flex flex-col w-1/3 p-2 space-y-1 justify-center items-center">
				<span className="flex w-full justify-start items-center font-regular-10 light-slate-gray-text">Bank Account Type</span>
				<div className="flex w-full h-8 px-2 space-x-1 justify-start items-center rounded bottom-shadow full-border black-white-background">
					<FontAwesomeIcon className="primary-text" icon={faList} />
					<Menu as="div" className="w-full relative text-left">
						<Menu.Button className="flex w-full px-1 space-x-1 justify-between items-center rounded focus:outline-none relative z-40" tabIndex={10}>
							<span className="font-regular-10">{data.bank.accountType}</span>
							<FontAwesomeIcon className="gray-text" icon={faChevronDown} size="xs" />
						</Menu.Button>
						<Menu.Items className="absolute w-full top-[26px] -right-[8.5px] origin-top-right divide-y divide-gray-100 rounded bottom-shadow focus:outline-none z-50 black-white-background full-border">{uiAccountTypeList()}</Menu.Items>
					</Menu>
				</div>
			</div>
		);
	};

	const uiAdd = () => {
		if (data.pendingResult) {
			return (
				<span className="px-3.5">
					<Elements.Spinner />
				</span>
			);
		} else {
			return "Add";
		}
	};

	const uiAddress = () => {
		return <TextArea icon={faHome} isNew={false} label="Address" onChange={(e) => handleInputs("address", e.target.value)} onKeyDown={() => {}} rows={2} tabIndex={4} value={data.address} width="w-full" />;
	};

	const uiBankAddress = () => {
		return <TextArea icon={faBank} isNew={false} label="Bank Address" onChange={(e) => handleBankInputs("address", e.target.value)} onKeyDown={() => {}} rows={2} tabIndex={14} value={data.bank.address} width="w-full" />;
	};

	const uiBankName = () => {
		return <TextInput icon={faBank} isNew={false} label="Bank Name" onChange={(e) => handleBankInputs("name", Global.capitalize(e.target.value))} onKeyPress={() => {}} tabIndex={8} value={data.bank.name} width="w-1/3" />;
	};

	const uiBankPhoneNumber = () => {
		return <TextInput icon={faPhone} isNew={false} label="Bank Phone Number" onChange={(e) => handleBankInputs("phone", e.target.value)} onKeyPress={(e) => !Global.hasNumbers(e.key) && e.preventDefault()} tabIndex={11} value={data.bank.phone} width="w-1/3" />;
	};

	const uiEmailAddress = () => {
		return <EmailAddress isNew={false} onChange={(e) => handleInputs("email", e.target.value)} suffix="" tabIndex={3} value={data.email} width="w-1/3" />;
	};

	const uiGstin = () => {
		return <TextInput icon={faFileInvoice} isNew={false} label="GST" maxLength={15} onChange={(e) => handleInputs("gst", e.target.value.toUpperCase())} onKeyPress={() => {}} tabIndex={6} value={data.gst} width="w-1/2" />;
	};

	const uiIfsc = () => {
		return <TextInput icon={faFileInvoice} isNew={false} label="IFSC" maxLength={11} onChange={(e) => handleBankInputs("ifsc", String(e.target.value).toUpperCase())} onKeyPress={() => {}} tabIndex={12} value={data.bank.ifsc} width="w-1/3" />;
	};

	const uiName = () => {
		return <TextInput icon={faFont} isNew={false} label="Name" onChange={(e) => handleInputs("name", Global.capitalize(e.target.value))} onKeyPress={() => {}} tabIndex={1} value={data.name} width="w-1/3" />;
	};

	const uiPan = () => {
		return <TextInput icon={faIdCard} isNew={false} label="PAN" maxLength={10} onChange={(e) => handleInputs("pan", e.target.value.toUpperCase())} onKeyPress={() => {}} tabIndex={5} value={data.pan} width="w-1/2" />;
	};

	const uiPhoneNumber = () => {
		return <TextInput icon={faPhone} isNew={false} label="Phone Number" maxLength={20} onChange={(e) => handleInputs("phone", e.target.value)} onKeyPress={(e) => !Global.hasNumbers(e.key) && e.preventDefault()} tabIndex={2} value={data.phone} width="w-1/3" />;
	};

	const uiTermsAndConditions = () => {
		return <TextArea icon={faFileLines} isNew={false} label="Terms & Conditions" onChange={(e) => handleInputs("termsAndConditions", e.target.value)} onKeyDown={() => {}} rows={2} tabIndex={7} value={data.termsAndConditions} width="w-full" />;
	};

	const uiUpiId = () => {
		return <TextInput icon={faGooglePay} isNew={false} label="UPI ID" onChange={(e) => handleBankInputs("upiId", e.target.value)} onKeyPress={() => {}} tabIndex={13} value={data.bank.upiId} width="w-1/3" />;
	};

	// Main UI
	return (
		<>
			<div className="flex w-full px-5 py-2.5 justify-between items-center bottom-border black-white-background">
				<div className="flex w-full space-x-2.5 justify-start items-center">
					<FontAwesomeIcon className="pr-1 cursor-pointer black-text" icon={faChevronLeft} onClick={() => close()} />
					<div className="flex w-full justify-start items-center">
						<span className="view-heading">Add Admin Company</span>
					</div>
				</div>
			</div>
			<div className="flex flex-col w-1/2 h-[calc(100vh-102px)] justify-start items-center overflow-y-auto">
				<div className="flex w-full px-3 space-x-5 justify-between items-center">
					{uiName()}
					{uiPhoneNumber()}
					{uiEmailAddress()}
				</div>
				<div className="flex w-full px-3 space-x-5 justify-between items-center">{uiAddress()}</div>
				<div className="flex w-full px-3 space-x-5 justify-between items-center">
					{uiPan()}
					{uiGstin()}
				</div>
				<div className="flex w-full px-3 space-x-5 justify-between items-center">{uiTermsAndConditions()}</div>
				<div className="flex w-full px-3 space-x-5 justify-between items-center">
					{uiBankName()}
					{uiAccountNumber()}
					{uiAccountType()}
				</div>
				<div className="flex w-full px-3 space-x-5 justify-between items-center">
					{uiBankPhoneNumber()}
					{uiIfsc()}
					{uiUpiId()}
				</div>
				<div className="flex w-full px-3 space-x-5 justify-between items-center">{uiBankAddress()}</div>
			</div>
			<footer className="w-full dialog-footer">
				<button className={addButtonStyle} onClick={() => add()}>
					{uiAdd()}
				</button>
			</footer>
		</>
	);
}
