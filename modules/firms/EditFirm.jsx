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
import { faCheck, faChevronDown, faFileLines, faFileInvoice, faFont, faHashtag, faIdCard, faList, faPhone, faChevronLeft, faPencil, faPlusCircle, faLocationDot } from "@fortawesome/free-solid-svg-icons";

export default function EditCompany({ close, refreshAdminCompanies, thisAdminCompany }) {
	// Business Logic
	const termsAndConditions = String(thisAdminCompany?.terms_conditions);
	const _termsAndConditions = termsAndConditions.replace(new RegExp("nnn.", "g"), "\n");

	let banks = [];

	if (thisAdminCompany?.banks) {
		banks = JSON.parse(thisAdminCompany?.banks);
	}

	const [data, setData] = useState({
		activeTab: Constants.modules.adminCompany.editCompany.name,
		company: {
			address: thisAdminCompany?.address,
			email: thisAdminCompany?.email,
			gst: thisAdminCompany?.gst,
			name: thisAdminCompany?.name,
			pan: thisAdminCompany?.pan,
			phone: thisAdminCompany?.phone,
			termsAndConditions: _termsAndConditions,
		},
		banks,
		newBanks: [],
		pendingResult: false,
	});

	const isNewBankView = data.activeTab == Constants.modules.adminCompany.addBank.name;
	const newBankWrapper = data.newBanks.length > 0 ? "p-0" : "flex w-full h-full justify-center items-center";

	const pointerEvents = isNewBankView && !data.newBanks.length ? "pointer-events-none opacity-25" : "pointer-events-auto opacity-100";
	const editButtonStyle = `space-x-1 primary-button-condensed ${pointerEvents}`;

	// Functions
	const addBank = () => {
		let greatestId = 1;
		const copy = [...data.newBanks];

		if (copy.length > 0) {
			greatestId = copy.sort((a, b) => b.id - a.id).at(0).id;
			greatestId++;
		}

		copy.push({
			accountNumber: "",
			accountType: "Current",
			address: "",
			id: greatestId,
			ifsc: "",
			name: "",
			phone: "",
			upiId: "",
		});

		copy.sort((a, b) => a.id - b.id);

		setData((s) => ({ ...s, newBanks: copy }));
	};

	const edit = () => {
		setData((s) => ({ ...s, pendingResult: true }));

		let banks = data.banks;

		if (data.newBanks.length) {
			data.newBanks.forEach((newBank) => banks.push(newBank));
		}

		const body = {
			adminCompanyId: thisAdminCompany.id,
			banks,
			company: data.company,
		};

		axios
			.post(Constants.apiEndpoints.admins, body, Global.getHeaders())
			.then((response) => {
				if (response.status == 200) {
					refreshAdminCompanies();
					Global.showToasts(Constants.toastType.success, Constants.messages.adminCompanyEdit);
					close();
				} else {
					Global.showToasts(Constants.toastType.error, Constants.messages.someErrorOccurred);
				}
			})
			.catch((error) => Global.handleErrors(error, "Edit Admin Company"))
			.finally(() => setData((s) => ({ ...s, pendingResult: false })));
	};

	const handleCompanyInputs = (key, value) => {
		setData((s) => ({ ...s, company: { ...s.company, [key]: value } }));
	};

	const handleOldBankInputs = (key, rowIndex, value) => {
		const copy = [...data.banks];
		const target = { ...copy[rowIndex] };

		target[key] = value;
		copy[rowIndex] = target;

		setData((s) => ({ ...s, banks: copy }));
	};

	const handleNewBankInputs = (key, newBank, value) => {
		const copy = [...data.newBanks];

		const obj = copy.filter((_newBank) => _newBank.id == newBank.id).at(0);
		obj[key] = value;

		const newBanks = copy.filter((_newBank) => _newBank.id != newBank.id);

		newBanks.push(obj);
		newBanks.sort((obj1, obj2) => obj1.id - obj2.id);

		setData((s) => ({ ...s, newBanks }));
	};

	const handleTab = (tab) => {
		setData((s) => ({ ...s, activeTab: tab }));
	};

	// UI
	// Company Details UI
	const uiCompanyAddress = () => {
		return <TextArea icon={faLocationDot} isNew={false} key={3} label="Address" onChange={(e) => handleCompanyInputs("address", e.target.value)} onKeyDown={() => {}} rows={2} tabIndex={4} value={data.company.address} width="w-full" />;
	};

	const uiCompanyEmailAddress = () => {
		return <EmailAddress isNew={false} onChange={(e) => handleCompanyInputs("email", e.target.value)} suffix="" tabIndex={3} value={data.company.email} width="w-1/3" />;
	};

	const uiCompanyGstNumber = () => {
		return <TextInput icon={faFileInvoice} isNew={false} label="GST" maxLength={15} onChange={(e) => handleCompanyInputs("gst", String(e.target.value).toUpperCase())} onKeyPress={() => {}} tabIndex={6} value={data.company.gst} width="w-1/2" />;
	};

	const uiCompany = () => {
		return (
			<div className="flex flex-col w-3/5 px-4 pb-4 justify-center items-center">
				<div className="w-full text-left p-2 font-medium-12 black-text">{data.company.name}</div>
				<div className="flex w-full space-x-5 justify-between items-center">
					{uiCompanyName()}
					{uiCompanyPhoneNumber()}
					{uiCompanyEmailAddress()}
				</div>
				<div className="flex w-full space-x-5 justify-between items-center">
					{uiCompanyPanNumber()}
					{uiCompanyGstNumber()}
				</div>
				{uiCompanyAddress()}
				{uiCompanyTermsAndConditions()}
			</div>
		);
	};

	const uiCompanyName = () => {
		return <TextInput icon={faFont} isNew={false} label="Name" onChange={(e) => handleCompanyInputs("name", e.target.value)} onKeyPress={() => {}} tabIndex={1} value={data.company.name} width="w-1/3" />;
	};

	const uiCompanyPanNumber = () => {
		return <TextInput icon={faIdCard} isNew={false} label="PAN" maxLength={10} onChange={(e) => handleCompanyInputs("pan", String(e.target.value).toUpperCase())} onKeyPress={() => {}} tabIndex={5} value={data.company.pan} width="w-1/2" />;
	};

	const uiCompanyPhoneNumber = () => {
		return <TextInput icon={faPhone} isNew={false} label="Phone Number" maxLength={10} onChange={(e) => handleCompanyInputs("phone", e.target.value)} onKeyPress={(e) => !Global.hasNumbers(e.key) && e.preventDefault()} tabIndex={2} value={data.company.phone} width="w-1/3" />;
	};

	const uiCompanyTermsAndConditions = () => {
		return <TextArea icon={faFileLines} isNew={false} key={14} label="Terms & Conditions" onChange={(e) => handleCompanyInputs("termsAndConditions", e.target.value)} onKeyDown={() => {}} rows={termsAndConditions.split("nnn.").length} tabIndex={14} value={data.company.termsAndConditions} width="w-full" />;
	};

	// Old Bank UI
	const uiOldBankAccountNumber = (oldBank, rowIndex) => {
		return <TextInput icon={faHashtag} isNew={false} label="Account Number" onChange={(e) => handleOldBankInputs("accountNumber", rowIndex, e.target.value)} tabIndex={`${rowIndex}2`} value={oldBank.accountNumber} width="w-1/3" />;
	};

	const uiOldBankAccountTypeList = (oldBank, rowIndex) => {
		return ["Current", "Savings"].map((type, n) => {
			return (
				<Menu.Item as="div" className="flex w-full p-2 space-x-2.5 justify-between items-center cursor-pointer font-regular-10 black-text hovered-rows" key={n} onClick={() => handleOldBankInputs("accountType", rowIndex, type)}>
					<span>{type}</span>
					{oldBank.accountType == type && <FontAwesomeIcon className="primary-text" icon={faCheck} />}
				</Menu.Item>
			);
		});
	};

	const uiOldBankAccountType = (oldBank, rowIndex) => {
		return (
			<div className="flex flex-col w-1/3 p-2 space-y-1 justify-center items-center">
				<span className="flex w-full justify-start items-center font-regular-10 light-slate-gray-text">Account Type</span>
				<div className="flex w-full h-8 px-2 space-x-1 justify-start items-center rounded bottom-shadow black-white-background full-border">
					<FontAwesomeIcon className="primary-text" icon={faList} />
					<Menu as="div" className="w-full relative text-left">
						<Menu.Button className="flex w-full px-1 space-x-1 justify-between items-center rounded focus:outline-none relative z-40" tabIndex={`${rowIndex}3`}>
							<span className="font-regular-10">{oldBank.accountType}</span>
							<FontAwesomeIcon className="gray-text" icon={faChevronDown} size="xs" />
						</Menu.Button>
						<Menu.Items className="absolute w-full top-[26px] -right-[8.5px] origin-top-right divide-y divide-gray-100 rounded bottom-shadow focus:outline-none z-50 black-white-background full-border">{uiOldBankAccountTypeList(oldBank, rowIndex)}</Menu.Items>
					</Menu>
				</div>
			</div>
		);
	};

	const uiOldBankAddress = (oldBank, rowIndex) => {
		return <TextArea icon={faLocationDot} isNew={false} label="Address" onChange={(e) => handleOldBankInputs("address", rowIndex, e.target.value)} onKeyDown={() => {}} rows={2} tabIndex={`${rowIndex}7`} value={oldBank.address} width="w-full" />;
	};

	const uiOldBankIfsc = (oldBank, rowIndex) => {
		return <TextInput icon={faFileInvoice} isNew={false} label="IFSC" maxLength={11} onChange={(e) => handleOldBankInputs("ifsc", rowIndex, e.target.value)} tabIndex={`${rowIndex}5`} value={oldBank.ifsc} width="w-1/3" />;
	};

	const uiOldBank = () => {
		if (!data.banks.length) {
			return <div className="flex w-full h-full justify-center items-center font-regular-11 gray-text">No banks found.</div>;
		} else {
			return data.banks.map((bank, index) => {
				const series = index + 1;

				return (
					<div className="flex flex-col w-3/5 px-4 pb-4 justify-center items-center" key={index}>
						<div className="w-full text-left p-2 font-medium-12 black-text">
							#{series} {bank.name}
						</div>
						<div className="flex w-full space-x-5 justify-between items-center">
							{uiOldBankName(bank, index)}
							{uiOldBankAccountNumber(bank, index)}
							{uiOldBankAccountType(bank, index)}
						</div>
						<div className="flex w-full space-x-5 justify-between items-center">
							{uiOldBankPhoneNumber(bank, index)}
							{uiOldBankIfsc(bank, index)}
							{uiOldBankUpiId(bank, index)}
						</div>
						{uiOldBankAddress(bank, index)}
					</div>
				);
			});
		}
	};

	const uiOldBankName = (oldBank, rowIndex) => {
		return <TextInput icon={faFont} isNew={false} label="Name" onChange={(e) => handleOldBankInputs("name", rowIndex, e.target.value)} tabIndex={`${rowIndex}1`} value={oldBank.name} width="w-1/3" />;
	};

	const uiOldBankPhoneNumber = (oldBank, rowIndex) => {
		return <TextInput icon={faPhone} isNew={false} label="Phone Number" onChange={(e) => handleOldBankInputs("phone", rowIndex, e.target.value)} onKeyPress={(e) => !Global.hasNumbers(e.key) && e.preventDefault()} tabIndex={`${rowIndex}4`} value={oldBank.phone} width="w-1/3" />;
	};

	const uiOldBankUpiId = (oldBank, rowIndex) => {
		return <TextInput icon={faGooglePay} isNew={false} label="UPI ID" onChange={(e) => handleOldBankInputs("upiId", rowIndex, e.target.value)} tabIndex={`${rowIndex}6`} value={oldBank.upiId} width="w-1/3" />;
	};

	// New Banks UI
	const uiNewBankAccountNumber = (newBank) => {
		return <TextInput icon={faHashtag} label="Account Number" onChange={(e) => handleNewBankInputs("accountNumber", newBank, e.target.value)} tabIndex={newBank.id} value={newBank.accountNumber} width="w-1/3" />;
	};

	const uiNewBankAccountTypeList = (newBank) => {
		return ["Current", "Savings"].map((type, index) => {
			return (
				<Menu.Item as="div" className="flex w-full p-2 space-x-2.5 justify-between items-center cursor-pointer font-regular-10 black-text hovered-rows" key={index} onClick={() => handleNewBankInputs("accountType", newBank, type)}>
					<span>{type}</span>
					{newBank.accountType == type && <FontAwesomeIcon className="primary-text" icon={faCheck} />}
				</Menu.Item>
			);
		});
	};

	const uiNewBankAccountType = (newBank) => {
		return (
			<div className="flex flex-col w-1/3 p-2 space-y-1 justify-center items-center">
				<span className="flex w-full justify-start items-center font-regular-10 light-slate-gray-text">Account Type</span>
				<div className="flex w-full h-8 px-2 space-x-1 justify-start items-center rounded bottom-shadow black-white-background full-border">
					<FontAwesomeIcon className="primary-text" icon={faList} />
					<Menu as="div" className="w-full relative text-left">
						<Menu.Button className="flex w-full px-1 space-x-1 justify-between items-center rounded focus:outline-none relative z-40" tabIndex={newBank.id}>
							<span className="font-regular-10">{newBank.accountType}</span>
							<FontAwesomeIcon className="gray-text" icon={faChevronDown} size="xs" />
						</Menu.Button>
						<Menu.Items className="absolute w-full top-[26px] -right-[8.5px] origin-top-right divide-y divide-gray-100 rounded bottom-shadow focus:outline-none z-50 black-white-background full-border">{uiNewBankAccountTypeList(newBank)}</Menu.Items>
					</Menu>
				</div>
			</div>
		);
	};

	const uiNewBankAddButton = () => {
		return (
			<div className="flex w-3/5 justify-center items-center">
				<button className="space-x-1.5 primary-button-transparent-background" onClick={() => addBank()}>
					<FontAwesomeIcon className="primary-text" icon={faPlusCircle} />
					<span>Add</span>
				</button>
			</div>
		);
	};

	const uiNewBankAddress = (newBank) => {
		return <TextArea icon={faLocationDot} label="Address" onChange={(e) => handleNewBankInputs("address", newBank, e.target.value)} onKeyDown={() => {}} rows={2} tabIndex={newBank.id} value={newBank.address} width="w-full" />;
	};

	const uiNewBankIfsc = (newBank) => {
		return <TextInput icon={faFileInvoice} label="IFSC" onChange={(e) => handleNewBankInputs("ifsc", newBank, e.target.value)} tabIndex={newBank.id} value={newBank.ifsc} width="w-1/3" />;
	};

	const uiNewBank = () => {
		return data.newBanks.map((newBank, index) => {
			return (
				<div className="flex flex-col w-3/5 px-4 pb-4 justify-center items-center" key={index}>
					<div className="w-full text-left p-2 font-medium-12 black-text">Bank #{newBank.id}</div>
					<div className="flex w-full space-x-5 justify-between items-center">
						{uiNewBankName(newBank)}
						{uiNewBankAccountNumber(newBank)}
						{uiNewBankAccountType(newBank)}
					</div>
					<div className="flex w-full space-x-5 justify-between items-center">
						{uiNewBankPhoneNumber(newBank)}
						{uiNewBankIfsc(newBank)}
						{uiNewBankUpiId(newBank)}
					</div>
					{uiNewBankAddress(newBank)}
				</div>
			);
		});
	};

	const uiNewBankName = (newBank) => {
		return <TextInput icon={faFont} label="Name" onChange={(e) => handleNewBankInputs("name", newBank, Global.capitalize(e.target.value))} tabIndex={newBank.id} value={newBank.name} width="w-1/3" />;
	};

	const uiNewBankPhoneNumber = (newBank) => {
		return <TextInput icon={faPhone} label="Phone Number" onChange={(e) => handleNewBankInputs("phone", newBank, e.target.value)} onKeyPress={(e) => !Global.hasNumbers(e.key) && e.preventDefault()} tabIndex={newBank.id} value={newBank.phone} width="w-1/3" />;
	};

	const uiNewBankUpiId = (newBank) => {
		return <TextInput icon={faGooglePay} label="UPI ID" onChange={(e) => handleNewBankInputs("upiId", newBank, e.target.value)} tabIndex={newBank.id} value={newBank.upiId} width="w-1/3" />;
	};

	// Miscellaneous UI
	const uiEdit = () => {
		if (data.pendingResult) {
			return (
				<span className="px-3.5">
					<Elements.Spinner />
				</span>
			);
		} else {
			const label = isNewBankView ? "Add" : "Edit";
			return <span>{label}</span>;
		}
	};

	const uiTabContents = () => {
		switch (data.activeTab) {
			case Constants.modules.adminCompany.addBank.name:
				return (
					<div className={newBankWrapper}>
						{uiNewBank()}
						{uiNewBankAddButton()}
					</div>
				);
			case Constants.modules.adminCompany.editBank.name:
				return uiOldBank();
			case Constants.modules.adminCompany.editCompany.name:
				return uiCompany();
		}
	};

	const uiTabs = () => {
		return Object.values(Constants.modules.adminCompany).map((module, index) => {
			const icon = index == 0 ? faPlusCircle : faPencil;
			const aesthetics = module.name == data.activeTab ? "primary-background-transparent-01 primary-text" : "bg-transparent gray-text";
			const wrapper = `w-full p-2 space-x-2.5 text-left font-medium-11 ${aesthetics}`;

			return (
				<button key={index} className={wrapper} onClick={() => handleTab(module.name)}>
					<FontAwesomeIcon icon={icon} />
					<span>{module.name}</span>
				</button>
			);
		});
	};

	// Main UI
	return (
		<>
			<div className="flex w-full px-5 py-2.5 justify-between items-center bottom-border black-white-background">
				<div className="flex w-full space-x-2.5 justify-start items-center">
					<FontAwesomeIcon className="pr-1 cursor-pointer black-text" icon={faChevronLeft} onClick={() => close()} />
					<div className="flex w-full justify-start items-center">
						<span className="view-heading">Edit Admin Company</span>
					</div>
				</div>
			</div>
			<div className="flex w-full h-[calc(100vh-102px)] justify-center items-center">
				<div className="flex flex-col w-1/6 h-full py-4 space-y-1.5 justify-center items-center black-white-background">{uiTabs()}</div>
				<div className="w-5/6 h-[calc(100vh-148px)] overflow-y-auto left-border">{uiTabContents()}</div>
			</div>
			<footer className="w-full dialog-footer">
				<button className={editButtonStyle} onClick={() => edit()}>
					{uiEdit()}
				</button>
			</footer>
		</>
	);
}
