"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import MyConstants from "@/utilities/constants";

import { useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { Spinner } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { EmailAddress, TextArea, TextInput } from "@/components/Inputs";
import { faChevronLeft, faFileInvoice, faFileLines, faFont, faIdCard, faLocationDot, faPencil, faPhone, faPlusCircle } from "@fortawesome/free-solid-svg-icons";

export default function EditFirm({ close, refreshAdminCompanies, thisAdminCompany }) {
	// Business Logic
	const [data, setData] = useState({
		activeTab: MyConstants.Modules.Other.Firms.Edit,
		company: {
			address: thisAdminCompany?.address,
			email: thisAdminCompany?.email_address,
			gst: thisAdminCompany?.gstin,
			name: thisAdminCompany?.name,
			pan: thisAdminCompany?.pan,
			phone: thisAdminCompany?.phone_number,
			termsAndConditions: thisAdminCompany?.terms_conditions,
		},
		pendingResult: false,
	});

	const editButtonStyle = `space-x-1 primary-button-condensed`;

	// Functions
	const edit = () => {
		setData((s) => ({ ...s, pendingResult: true }));

		const termsConditions = data.company.termsAndConditions.replace(/\n/g, "\\n");
		const body = { id: thisAdminCompany.id, ...data.company, termsAndConditions: termsConditions };

		axios
			.post(MyConstants.ApiEndpoints.Firms.EditFirm, body, MyGlobal.GetHeaders())
			.then((response) => {
				if (response.status == 200) {
					refreshAdminCompanies();
					MyGlobal.ShowSuccessToast(MyConstants.Messages.FirmEdited);
					close();
				} else {
					MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
				}
			})
			.catch((error) => MyGlobal.HandleErrors(error, "Edit Firm"))
			.finally(() => setData((s) => ({ ...s, pendingResult: false })));
	};

	const handleCompanyInputs = (key, value) => {
		setData((s) => ({ ...s, company: { ...s.company, [key]: value } }));
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
		return (
			<TextInput
				icon={faFileInvoice}
				isNew={false}
				label="GST"
				maxLength={15}
				onChange={(e) => handleCompanyInputs("gst", String(e.target.value).toUpperCase())}
				onKeyPress={() => {}}
				tabIndex={6}
				value={data.company.gst}
				width="w-1/2"
			/>
		);
	};

	const uiCompany = () => {
		return (
			<div className="flex flex-col w-3/5 px-4 pb-4 justify-center items-center">
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
		return (
			<TextInput icon={faIdCard} isNew={false} label="PAN" maxLength={10} onChange={(e) => handleCompanyInputs("pan", String(e.target.value).toUpperCase())} onKeyPress={() => {}} tabIndex={5} value={data.company.pan} width="w-1/2" />
		);
	};

	const uiCompanyPhoneNumber = () => {
		return (
			<TextInput
				icon={faPhone}
				isNew={false}
				label="Phone Number"
				maxLength={10}
				onChange={(e) => handleCompanyInputs("phone", e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasNumbers(e.key) && e.preventDefault()}
				tabIndex={2}
				value={data.company.phone}
				width="w-1/3"
			/>
		);
	};

	const uiCompanyTermsAndConditions = () => {
		let termsConditions = "";
		let termsConditionsLength = "";

		if (typeof data.company.termsAndConditions === "string") {
			termsConditions = data.company.termsAndConditions.replace(/\\n/g, "\n");
			termsConditionsLength = termsConditions.split("\n").length;
		}

		return (
			<TextArea
				icon={faFileLines}
				isNew={false}
				key={14}
				label="Terms & Conditions"
				onChange={(e) => handleCompanyInputs("termsAndConditions", e.target.value)}
				onKeyDown={() => {}}
				rows={termsConditionsLength}
				tabIndex={14}
				value={termsConditions}
				width="w-full"
			/>
		);
	};

	// Miscellaneous UI
	const uiEdit = () => {
		if (data.pendingResult) {
			return (
				<span className="px-3.5">
					<Spinner />
				</span>
			);
		} else {
			return <span>Edit</span>;
		}
	};

	const uiTabs = () => {
		return Object.values(MyConstants.Modules.Other.Firms).map((m, i) => {
			const icon = i == 0 ? faPlusCircle : faPencil;
			const aesthetics = m == data.activeTab ? "primary-background-transparent-01 primary-text" : "bg-transparent gray-text";
			const wrapper = `w-full p-2 space-x-2.5 text-left font-medium-11 ${aesthetics}`;

			return (
				<button key={i} className={wrapper} onClick={() => handleTab(m)}>
					<FontAwesomeIcon icon={icon} />
					<span>{m}</span>
				</button>
			);
		});
	};

	// Main UI
	return (
		<>
			<div className="flex w-full px-5 py-2.5 justify-between items-center bottom-border contrast-background">
				<div className="flex w-full space-x-2.5 justify-start items-center">
					<FontAwesomeIcon className="pr-1 cursor-pointer black-text" icon={faChevronLeft} onClick={() => close()} />
					<div className="flex w-full justify-start items-center">
						<span className="view-heading">Edit {thisAdminCompany.name}</span>
					</div>
				</div>
			</div>
			<div className="flex w-full h-[calc(100vh-102px)] justify-center items-center contrast-background">
				<div className="flex flex-col w-1/6 h-full py-4 space-y-1.5 justify-center items-center">{uiTabs()}</div>
				<div className="w-5/6 h-[calc(100vh-148px)] overflow-y-auto left-border">{uiCompany()}</div>
			</div>
			<footer className="w-full dialog-footer">
				<button className={editButtonStyle} onClick={() => edit()}>
					{uiEdit()}
				</button>
			</footer>
		</>
	);
}
