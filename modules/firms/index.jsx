"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import Tippy from "@tippyjs/react";
import MyConstants from "@/utilities/constants";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { TextArea, TextInput } from "@/components/Inputs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Badge, SpinnerBig, Tooltip } from "@/components/Elements";
import { faGooglePay, faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { faAt, faFileInvoice, faFileLines, faHashtag, faHome, faIdCard, faList, faPencil, faPhone } from "@fortawesome/free-solid-svg-icons";

export default function Firms() {
	// Business Logic
	const [data, setData] = useState({
		activeTab: {
			details: {},
			id: "All",
		},
		firms: [],
		hasMounted: false,
		isAddViewOpen: false,
		isEditViewOpen: false,
		pendingResult: false,
	});

	const blankDataWrapper = "flex w-full h-full justify-center items-center black-white-background full-border";

	// Functions
	const getFirms = () => {
		setData((s) => ({ ...s, pendingResult: true }));

		axios
			.get(MyConstants.ApiEndpoints.Firms.GetFirms, MyGlobal.GetHeaders())
			.then((response) => {
				if (response.status == 200) {
					const firms = [];

					response.data.firms.forEach((fe) => {
						const banks = response.data.banks.filter((f) => f.firm_id === fe.id);

						firms.push({ ...fe, banks });
					});

					setData((s) => ({
						...s,
						activeTab: {
							details: firms.at(0),
							id: firms.at(0).id,
						},
						firms: firms,
						hasMounted: true,
					}));
				}
			})
			.catch((error) => MyGlobal.HandleErrors(error, "Get Firms"))
			.finally(() => setData((s) => ({ ...s, pendingResult: false })));
	};

	const handleTab = (company) => {
		setData((s) => ({ ...s, activeTab: { details: company, id: company.id } }));
	};

	const openEmailClient = (email) => {
		globalThis.window.open(`mailto:${email}`, "_blank");
	};

	const openWhatsApp = (phone) => {
		globalThis.window.open(`https://wa.me/1${phone}`, "_blank");
	};

	const toggleAddView = () => {
		setData((s) => ({ ...s, isAddViewOpen: !data.isAddViewOpen }));
	};

	const toggleEditView = (status) => {
		setData((s) => ({ ...s, isEditViewOpen: status }));
	};

	// UI Components
	const uiNew = () => {
		if (MyGlobal.HasPermission(MyConstants.Modules.Derived.NewFirm)) {
			return (
				<button className="primary-button-condensed" onClick={() => toggleAddView()}>
					<span>New</span>
				</button>
			);
		}
	};

	const uiBankCard = (bank, rowIndex) => {
		return (
			<div className="flex flex-col w-full px-6 py-3 space-y-1 justify-center items-start font-regular-11 black-text" key={rowIndex}>
				<div className="flex w-1/2 justify-start items-center primary-text">
					<div className="flex w-full space-x-5 justify-start items-center">
						<span className="font-medium-14">
							#{rowIndex + 1} {bank.name}
						</span>
					</div>
				</div>
				<div className="flex w-full space-x-5 justify-between items-center">
					<TextInput icon={faHashtag} isNew={false} isReadOnly label="Account Number" onChange={() => {}} onKeyPress={() => {}} tabIndex={1} value={bank.accountNumber} width="w-1/5" />

					<TextInput icon={faList} isNew={false} isReadOnly label="Account Type" onChange={() => {}} onKeyPress={() => {}} tabIndex={2} value={bank.accountType} width="w-1/5" />

					<TextInput icon={faFileInvoice} isNew={false} isReadOnly label="IFSC" maxLength={11} onChange={() => {}} onKeyPress={() => {}} tabIndex={3} value={bank.ifsc} width="w-1/5" />

					<TextInput icon={faGooglePay} isNew={false} isReadOnly label="UPI ID" onChange={() => {}} onKeyPress={() => {}} tabIndex={4} value={bank.upiId} width="w-1/5" />

					<TextInput icon={faPhone} isNew={false} isReadOnly label="Phone Number" onChange={() => {}} onKeyPress={() => {}} tabIndex={5} value={bank.phone} width="w-1/5" />
				</div>

				<TextArea icon={faHome} isNew={false} isReadOnly label="Address" onChange={() => {}} onKeyDown={() => {}} rows={2} tabIndex={6} value={bank.address} width="w-full" />
			</div>
		);
	};

	const uiBody = () => {
		if (data.pendingResult) {
			return (
				<div className={blankDataWrapper}>
					<SpinnerBig />
				</div>
			);
		} else if (!data.firms.length) {
			return (
				<div className={blankDataWrapper}>
					<span className="font-regular-12 gray-text">No admins registered.</span>
				</div>
			);
		} else {
			const firms = data.firms.filter((f) => f.id == data.activeTab.id);
			const banks = firms.at(0).banks;

			return (
				<div className="flex w-full h-full justify-center items-start">
					<div className="flex flex-col w-[10%] space-y-2.5 mx-5 justify-start items-center">{uiTabs()}</div>
					<div className="flex flex-col w-[90%] h-[calc(100vh-100px)] scrollbar-gutter overflow-y-auto justify-start items-center full-border contrast-background rounded shadow">
						{uiCompanyCard(firms.at(0))}
						{banks.map((bank, rowIndex) => uiBankCard(bank, rowIndex))}
					</div>
				</div>
			);
		}
	};

	const uiCompanyCard = (company) => {
		const termsConditions = String(company.terms_conditions).replace(new RegExp("nnn.", "g"), "\n");

		return (
			<div className="flex flex-col w-full px-6 py-3 space-y-1 justify-center items-start font-regular-11 black-text">
				<div className="flex w-1/2 justify-start items-center primary-text">
					<div className="flex w-full space-x-5 justify-start items-center">
						<span className="font-semibold-16">{company.name}</span>
						{/* <FontAwesomeIcon className="cursor-pointer" icon={faPencil} onClick={() => toggleEditView(true)} size="sm" /> */}
					</div>
				</div>
				<div className="flex w-full space-x-5 justify-between items-center">
					<Tippy content={<Tooltip text="Open this contact on WhatsApp Web" />}>
						<span className="w-full cursor-pointer" onClick={() => openWhatsApp(company.phone)}>
							<TextInput icon={faWhatsapp} isNew={false} isReadOnly label="Phone Number" onChange={() => {}} onKeyPress={() => {}} tabIndex={1} value={company.phone} width="w-full" />
						</span>
					</Tippy>
					<Tippy content={<Tooltip text="Send an email to this address" />}>
						<span className="w-full cursor-pointer" onClick={() => openEmailClient(company.email)}>
							<TextInput icon={faAt} isNew={false} isReadOnly label="Email Address" onChange={() => {}} onKeyPress={() => {}} tabIndex={2} value={company.email} width="w-full" />
						</span>
					</Tippy>
					<TextInput icon={faIdCard} isNew={false} isReadOnly label="PAN" onChange={() => {}} onKeyPress={() => {}} tabIndex={3} value={company.pan} width="w-full" />
					<TextInput icon={faFileInvoice} isNew={false} isReadOnly label="GSTIN" onChange={() => {}} onKeyPress={() => {}} tabIndex={4} value={company.gst} width="w-full" />
				</div>

				<TextArea icon={faHome} isNew={false} isReadOnly label="Address" onChange={() => {}} onKeyDown={() => {}} rows={2} tabIndex={5} value={company.address} width="w-full" />

				<TextArea icon={faFileLines} isNew={false} isReadOnly label="Terms & Conditions" onChange={() => {}} onKeyDown={() => {}} rows={2} tabIndex={6} value={termsConditions} width="w-full" />
			</div>
		);
	};

	const uiMain = () => {
		if (data.isAddViewOpen) {
			return <NewCompany close={toggleAddView} open={data.isAddViewOpen} refreshAdminCompanies={getFirms} />;
		} else if (data.isEditViewOpen) {
			return <EditCompany close={toggleEditView} refreshAdminCompanies={getFirms} thisAdminCompany={data.activeTab.details} />;
		} else {
			return (
				<>
					<div className="flex w-full px-5 py-2.5 justify-between items-center">
						<div className="flex w-1/2 space-x-2 justify-start items-center">
							<span className="view-heading">Firms</span>
							{data.firms.length > 0 && <Badge value={data.firms.length} />}
						</div>
						<div className="flex w-1/2 space-x-2 justify-end items-center"></div>
					</div>
					<div className="flex w-full h-full justify-center items-start">{uiBody()}</div>
				</>
			);
		}
	};

	const uiTabs = () => {
		return data.firms.map((company, index) => {
			const style = company.id == data.activeTab.id ? "primary-border primary-background-transparent-01 primary-text" : "full-border bg-white black-text";

			const wrapper = `flex w-full px-4 py-2 justify-between items-center rounded shadow ${style} font-regular-10 hovered-rows`;

			return (
				<button className={wrapper} key={index} onClick={() => handleTab(company)}>
					<Tippy content={<Tooltip text={company.name} />}>
						<span>{company.name}</span>
					</Tippy>
				</button>
			);
		});
	};

	// Hooks
	useEffect(() => {
		getFirms();
	}, []);

	// Main UI
	return <div className="flex flex-col w-full h-full justify-start items-center">{uiMain()}</div>;
}
