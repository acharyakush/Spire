"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import MyConstants from "@/utilities/constants";
import NewQuotaionPreview from "./NewQuotationPreview";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { Badge } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ComboBox2, DatePicker, TextArea, TextInput } from "@/components/Inputs";
import { faCalendar, faChevronLeft, faHashtag, faHome, faIndianRupee, faListCheck, faMinusCircle, faPhone, faPlusCircle, faStickyNote, faTasks, faUser } from "@fortawesome/free-solid-svg-icons";

export default function ViewQuotation({ clients, inquiry, reload, unmount }) {
	// Business Logic
	const [api, setApi] = useState({
		banks: [],
		firms: [],
		quotations: [],
	});

	const [client, setClient] = useState({
		address: inquiry?.client?.address,
		id: inquiry?.client?.id,
		name: inquiry?.client?.name,
		phoneNumber: inquiry?.client?.phone_number,
	});

	const [firm, setFirm] = useState({
		address: "",
		emailAddress: "",
		gstin: "",
		id: "",
		name: "",
		pan: "",
		phoneNumber: "",
		selectedBank: [],
		termsConditions: "",
	});

	const [main, setMain] = useState({
		date: new Date(),
		find: "",
		openPreview: false,
		remarks: "",
	});

	const [services, setServices] = useState([
		{
			governmentFees: 0,
			inclusions: "",
			professionalFees: 0,
			rowId: 0,
			services: "",
		},
	]);

	const proposalNumber = "QTN/" + MyGlobal.GetInitials(firm.name)[0] + "/" + MyGlobal.MakeNewQuotationId(api.quotations);

	// Functions
	async function getSupportData() {
		try {
			setValues("isLoading", true);

			const result = await axios.get(MyConstants.ApiEndpoints.Inquiries.GetAddQuotationSupport, MyGlobal.GetHeaders());

			if (result.status === 200) {
				setApi({ banks: result.data.banks, firms: result.data.firms, quotations: result.data.quotations });
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Inquiries => View Quotation => Get Support Data");
		} finally {
			setValues("isLoading", false);
		}
	}

	// UI Components
	function uiClient() {
		return (
			<ComboBox2
				allowCreatingNewItem={false}
				comparingValue1="name"
				comparingValue2={client.name}
				displayValue="name"
				filteredData={[]}
				hasDataObject={false}
				icon={faUser}
				isReadOnly={false}
				label="Client"
				onChange={() => {}}
				onClick={() => {}}
				onInputChange={() => {}}
				onKeyPress={() => {}}
				searchedItem={main.find}
				tabIndex={2}
				value={inquiry?.client_name}
				width="w-full"
			/>
		);
	}

	function uiClientAddress() {
		return <TextArea icon={faHome} label="Client's Address" onChange={() => {}} onKeyDown={() => {}} rows={2} tabIndex={10} value={inquiry?.client_address} width="w-full" />;
	}

	function uiClientPhoneNumber() {
		return <TextInput icon={faPhone} id="clientPhoneNumber" isReadOnly label="Client's Phone Number" onChange={() => {}} onKeyPress={() => {}} tabIndex={8} value={inquiry?.client_phone_number} width="w-full" />;
	}

	function uiFirm() {
		return (
			<ComboBox2
				allowCreatingNewItem={false}
				comparingValue1="name"
				comparingValue2={firm.name}
				displayValue="name"
				filteredData={api.firms}
				hasDataObject={false}
				icon={faUser}
				isReadOnly={false}
				label="Firm"
				onChange={() => {}}
				onClick={() => {}}
				onInputChange={() => {}}
				onKeyPress={() => {}}
				searchedItem=""
				tabIndex={1}
				value={inquiry?.quotation?.firm.name}
				width="w-full"
			/>
		);
	}

	function uiDate() {
		return <DatePicker icon={faCalendar} label="Date" onChange={() => {}} tabIndex={7} value={inquiry?.quotation?.date} width="w-full" />;
	}

	function uiInputs() {
		return (
			<div className="flex flex-col w-full h-full px-4 py-2 space-y-1 justify-start items-center overflow-y-auto scrollbar-gutter bg-white">
				<div className="flex w-3/4 px-5 space-x-5 justify-between items-center">
					{uiDate()}
					{uiFirm()}
					{uiProposalNumber()}
				</div>
				<div className="flex w-3/4 px-5 space-x-5 justify-between items-start">
					{uiClient()}
					{uiClientPhoneNumber()}
					{uiClientAddress()}
				</div>
				<div className="flex w-3/4 px-5 space-x-5 justify-center items-start">
					{uiTermsConditions()}
					{uiRemarks()}
				</div>
				<div className="flex flex-col w-3/4 px-5 justify-center items-center">{uiServicesRows()}</div>
			</div>
		);
	}

	function uiProposalNumber() {
		return <TextInput icon={faHashtag} id="proposalNumber" isReadOnly label="Proposal Number" onChange={() => {}} onKeyPress={() => {}} tabIndex={8} value={inquiry?.quotation?.custom_id} width="w-full" />;
	}

	function uiRemarks() {
		return <TextArea icon={faStickyNote} label="Remarks" onChange={() => {}} onKeyDown={() => {}} rows={2} tabIndex={10} value={inquiry?.quotation?.remarks} width="w-full" />;
	}

	function uiServices(row) {
		return (
			<TextInput icon={faTasks} id={`services${row.rowId}`} label="Services" onChange={(e) => setServicesValue("services", row.rowId, e.target.value)} onKeyPress={() => {}} tabIndex={row.rowId} value={row.services} width="w-full" />
		);
	}

	function uiServicesGovernmentFees(row) {
		return (
			<TextInput
				icon={faIndianRupee}
				id={`governmentFees${row.rowId}`}
				label="Government Fees"
				onChange={(e) => setServicesValue("governmentFees", row.rowId, e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasNumbers(e.key) && e.preventDefault()}
				tabIndex={row.rowId}
				value={row.governmentFees}
				width="w-full"
			/>
		);
	}

	function uiServicesInclusions(row) {
		return (
			<TextInput
				icon={faTasks}
				id={`inclusions${row.rowId}`}
				label="Inclusions"
				onChange={(e) => setServicesValue("inclusions", row.rowId, e.target.value)}
				onKeyPress={() => {}}
				tabIndex={row.rowId}
				value={row.inclusions}
				width="w-full"
			/>
		);
	}

	function uiServicesProfessionalFees(row) {
		return (
			<TextInput
				icon={faIndianRupee}
				id={`professionalFees${row.rowId}`}
				label="Professional Fees"
				onChange={(e) => setServicesValue("professionalFees", row.rowId, e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasNumbers(e.key) && e.preventDefault()}
				tabIndex={row.rowId}
				value={row.professionalFees}
				width="w-full"
			/>
		);
	}

	function uiServicesRows() {
		return inquiry?.quotation?.services
			?.sort((a, b) => a.rowId - b.rowId)
			?.map((m, i) => {
				const showAddButton = i == services.length - 1 ? "visible" : "invisible";
				const showDeleteButton = services.length > 1 ? "visible" : "invisible";

				const addButtonWrapper = `flex w-fit h-[55px] justify-center items-center ${showAddButton}`;
				const deleteButtonWrapper = `flex w-fit h-[55px] justify-center items-center ${showDeleteButton}`;

				const reverseButtons = services.length > 1 ? "flex-row" : "flex-row-reverse";
				const buttonsWrapper = `flex ${reverseButtons} w-fit h-full pl-2.5 space-x-3 justify-center items-end`;

				return (
					<div className="flex w-full justify-between items-center" key={m.rowId}>
						<div className="flex w-fit h-10 pr-5 justify-center items-end">
							<Badge value={i + 1} />
						</div>
						<div className="flex w-full space-x-5 justify-between items-center">
							<div className="w-1/2">{uiServices(m)}</div>
							<div className="w-1/2">{uiServicesInclusions(m)}</div>
							<div className="w-1/4">{uiServicesProfessionalFees(m)}</div>
							<div className="w-1/4">{uiServicesGovernmentFees(m)}</div>
						</div>
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

	function uiTermsConditions() {
		let termsConditions = "";
		let termsConditionsLength = "";

		if (typeof inquiry?.quotation?.terms_conditions === "string") {
			termsConditions = inquiry?.quotation?.terms_conditions?.replace(/\\n/g, "\n");
			termsConditionsLength = termsConditions.split("\n").length;
		}

		return <TextArea icon={faListCheck} label="Terms & Conditions" onChange={() => {}} onKeyDown={() => {}} rows={termsConditionsLength + 1} tabIndex={9} value={termsConditions} width="w-full" />;
	}

	// Hooks
	useEffect(() => {
		getSupportData();
	}, []);

	// Main UI
	if (main.openPreview) {
		return <NewQuotaionPreview inquiry={inquiry} quotation={{ client, firm, main, services, proposalNumber }} reload={unmountAndReloadRoot} unmount={togglePreview} />;
	}

	return (
		<div className="flex flex-col w-full h-full justify-center items-center">
			<div className="flex w-full px-5 py-2.5 justify-between items-center bottom-border primary-light-background">
				<div className="flex w-full space-x-2.5 justify-start items-center">
					<FontAwesomeIcon className="pr-1 cursor-pointer black-text" icon={faChevronLeft} onClick={() => unmount({}, false)} />
					<div className="flex w-full justify-start items-center">
						<span className="view-heading">{inquiry?.client_name}'s Quotation</span>
					</div>
				</div>
			</div>
			<div className="flex w-full h-[calc(100vh-148px)] justify-center items-center overflow-y-auto contrast-background">{uiInputs()}</div>
		</div>
	);
}
