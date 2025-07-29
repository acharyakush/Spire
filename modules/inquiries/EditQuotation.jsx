"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import MyConstants from "@/utilities/constants";
import EditQuotaionPreview from "./EditQuotationPreview";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { Badge } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ComboBox2, DatePicker, TextArea, TextInput } from "@/components/Inputs";
import { faCalendar, faChevronLeft, faHashtag, faHome, faIndianRupee, faListCheck, faMinusCircle, faPhone, faPlusCircle, faStickyNote, faTasks, faUser } from "@fortawesome/free-solid-svg-icons";

export default function EditQuotation({ clients, inquiry, reload, unmount }) {
	// Business Logic
	const [api, setApi] = useState({
		banks: [],
		firms: [],
		quotations: [],
	});

	const [client, setClient] = useState({
		address: inquiry?.address,
		id: inquiry?.client_id,
		name: inquiry?.client_name,
		phoneNumber: inquiry?.phone_number,
	});

	const [firm, setFirm] = useState({
		address: "",
		emailAddress: "",
		gstin: "",
		id: "",
		name: "",
		pan: "",
		phoneNumber: "",
		proposalNumber: "",
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

	// Functions
	function addRow() {
		const copy = [...services];

		let greatestId = copy.sort((a, b) => b.rowId - a.rowId).at(0).rowId;
		greatestId++;

		copy.push({
			governmentFees: 0,
			inclusions: "",
			professionalFees: 0,
			rowId: greatestId,
			services: "",
		});

		setServices(copy);
	}

	function deleteRow(object) {
		const copy = [...services];
		const doesExist = copy.filter((f) => f.rowId == object.rowId);

		if (doesExist.length) {
			const revised = copy.filter((f) => f.rowId != object.rowId);
			setServices(revised);
		}
	}

	function getClientName() {
		let name = "";

		if (clients?.length) {
			const obj = clients?.find((f) => f.id == client.id);

			if (typeof obj === "object") {
				name = obj.name;
			}
		}

		return name;
	}

	function getFilteredClients() {
		let list = !clients?.length ? [] : clients;

		if (list.length) {
			const value = String(main.find);

			if (value !== "undefined") {
				list = clients?.filter((f) => {
					return String(f.name).toLowerCase().includes(value.toLowerCase());
				});
			}
		}

		return list;
	}

	async function getSupportData() {
		try {
			setValues("isLoading", true);

			const result = await axios.get(MyConstants.ApiEndpoints.Inquiries.GetEditQuotationSupport, MyGlobal.GetHeaders());

			if (result.status === 200) {
				setApi({ banks: result.data.banks, firms: result.data.firms, quotations: result.data.quotations });

				const objQtn = result.data.quotations.filter((f) => f.custom_id === inquiry.quotation_id).at(0);
				const objQtnServices = result.data.quotationServices.filter((f) => f.quotation_id === inquiry.quotation_id);

				const objBank = result.data.banks.filter((f) => f.firm_id === objQtn.firm_id).at(0);
				const objFirm = result.data.firms.filter((f) => f.id === objQtn.firm_id).at(0);

				setFirm({
					address: objFirm.address,
					emailAddress: objFirm.email_address,
					gstin: objFirm.gstin,
					id: objFirm.id,
					name: objFirm.name,
					pan: objFirm.pan,
					phoneNumber: objFirm.phone_number,
					proposalNumber: objQtn.custom_id,
					selectedBank: objBank,
					termsConditions: objFirm.terms_conditions,
				});

				const services = [];

				objQtnServices.forEach((fe) => services.push({ governmentFees: fe.government_fees, inclusions: fe.inclusions, professionalFees: fe.professional_fees, rowId: objQtnServices.length + 1, services: fe.services }));

				setServices(services);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Inquiries > Edit Quotation > getSupportData()");
		} finally {
			setValues("isLoading", false);
		}
	}

	function setClientObject(value) {
		if (value) {
			setClient({
				address: value.address ?? "",
				id: value.id,
				name: value.name,
				phoneNumber: value.phone_number,
			});
		}
	}

	function setClientValue(key, value) {
		if (value) {
			setClient((s) => ({ ...s, [key]: value }));
		}
	}

	function setFirmValue(value) {
		if (value) {
			const selectedBank = api.banks.filter((f) => f.firm_id === value.id).at(0);

			setFirm({
				address: value.address,
				emailAddress: value.email_address,
				gstin: value.gstin,
				id: value.id,
				name: value.name,
				pan: value.pan,
				phoneNumber: value.phone_number,
				selectedBank,
				termsConditions: value.terms_conditions,
			});
		}
	}

	function setFirmSingleValue(key, value) {
		if (value) {
			setFirm((s) => ({ ...s, [key]: value }));
		}
	}

	function setServicesValue(key, rowId, value) {
		const copy = [...services];
		const obj = copy.filter((f) => f.rowId == rowId);

		if (obj.length) {
			const idx = copy.findIndex((f) => f.rowId === rowId);
			const _obj = copy.at(idx);

			_obj[key] = key == "amount" ? +value : value;

			const revised = copy.filter((f) => f.rowId != rowId);
			revised.push(_obj);

			setServices(revised);
		}
	}

	function setValues(key, value) {
		setMain((s) => ({ ...s, [key]: value }));
	}

	function togglePreview(value) {
		setMain((s) => ({ ...s, openPreview: value }));
	}

	function unmountAndReloadRoot() {
		reload("edit-quotation");
		unmount({}, false);
	}

	// UI Components
	function uiClient() {
		return (
			<ComboBox2
				allowCreatingNewItem={false}
				comparingValue1="name"
				comparingValue2={client.name}
				displayValue="name"
				filteredData={getFilteredClients}
				hasDataObject={false}
				icon={faUser}
				isReadOnly={false}
				label="Client"
				onChange={(e) => setClientObject(e)}
				onClick={() => {}}
				onInputChange={(e) => setValues("find", e.target.value)}
				onKeyPress={() => {}}
				searchedItem={main.find}
				tabIndex={2}
				value={getClientName()}
				width="w-full"
			/>
		);
	}

	function uiClientAddress() {
		return (
			<TextArea
				icon={faHome}
				label="Client's Address"
				onChange={(e) => setClientValue("address", e.target.value)}
				onKeyDown={() => {}}
				rows={2}
				tabIndex={10}
				value={client.address}
				width="w-full"
			/>
		);
	}

	function uiClientPhoneNumber() {
		return (
			<TextInput
				icon={faPhone}
				id="clientPhoneNumber"
				isReadOnly
				label="Client's Phone Number"
				onChange={(e) => setClientValue("phoneNumber", e.target.value)}
				onKeyPress={() => {}}
				tabIndex={8}
				value={client.phoneNumber}
				width="w-full"
			/>
		);
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
				onChange={(e) => setFirmValue(e)}
				onClick={() => {}}
				onInputChange={() => {}}
				onKeyPress={() => {}}
				searchedItem=""
				tabIndex={1}
				value={firm.name}
				width="w-full"
			/>
		);
	}

	function uiDate() {
		return (
			<DatePicker
				icon={faCalendar}
				label="Date"
				onChange={(e) => setValues("date", e)}
				tabIndex={7}
				value={main.date}
				width="w-full"
			/>
		);
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
		return (
			<TextInput
				icon={faHashtag}
				id="proposalNumber"
				isReadOnly
				label="Proposal Number"
				onChange={(e) => setValues("proposalNumber", e.target.value)}
				onKeyPress={() => {}}
				tabIndex={8}
				value={firm.id ? firm.proposalNumber : ""}
				width="w-full"
			/>
		);
	}

	function uiRemarks() {
		return (
			<TextArea
				icon={faStickyNote}
				label="Remarks"
				onChange={(e) => setValues("remarks", e.target.value)}
				onKeyDown={() => {}}
				rows={2}
				tabIndex={10}
				value={main.remarks}
				width="w-full"
			/>
		);
	}

	function uiServices(row) {
		return (
			<TextInput
				icon={faTasks}
				id={`services${row.rowId}`}
				label="Services"
				onChange={(e) => setServicesValue("services", row.rowId, e.target.value)}
				onKeyPress={() => {}}
				tabIndex={row.rowId}
				value={row.services}
				width="w-full"
			/>
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
		return services
			.sort((a, b) => a.rowId - b.rowId)
			.map((m, i) => {
				const showAddButton = i == services.length - 1 ? "visible" : "invisible";
				const showDeleteButton = services.length > 1 ? "visible" : "invisible";

				const addButtonWrapper = `flex w-fit h-[55px] justify-center items-center ${showAddButton}`;
				const deleteButtonWrapper = `flex w-fit h-[55px] justify-center items-center ${showDeleteButton}`;

				const reverseButtons = services.length > 1 ? "flex-row" : "flex-row-reverse";
				const buttonsWrapper = `flex ${reverseButtons} w-fit h-full pl-2.5 space-x-3 justify-center items-end`;

				return (
					<div
						className="flex w-full justify-between items-center"
						key={m.rowId}>
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
								<FontAwesomeIcon
									className="cursor-pointer green-text"
									icon={faPlusCircle}
									onClick={() => addRow()}
									size="lg"
								/>
							</div>
							<div className={deleteButtonWrapper}>
								<FontAwesomeIcon
									className="cursor-pointer red-text"
									icon={faMinusCircle}
									onClick={() => deleteRow(m)}
									size="lg"
								/>
							</div>
						</div>
					</div>
				);
			});
	}

	function uiTermsConditions() {
		let termsConditions = "";
		let termsConditionsLength = "";

		if (typeof firm.termsConditions === "string") {
			termsConditions = firm.termsConditions.replace(/\\n/g, "\n");
			termsConditionsLength = termsConditions.split("\n").length;
		}

		return (
			<TextArea
				icon={faListCheck}
				label="Terms & Conditions"
				onChange={(e) => setFirmSingleValue("termsConditions", e.target.value)}
				onKeyDown={() => {}}
				rows={termsConditionsLength + 1}
				tabIndex={9}
				value={termsConditions}
				width="w-full"
			/>
		);
	}

	// Hooks
	useEffect(() => {
		getSupportData();
	}, []);

	// Main UI
	if (main.openPreview) {
		return (
			<EditQuotaionPreview
				inquiry={inquiry}
				quotation={{ client, firm, main, services, proposalNumber: firm.proposalNumber }}
				reload={unmountAndReloadRoot}
				unmount={togglePreview}
			/>
		);
	}

	return (
		<div className="flex flex-col w-full h-full justify-center items-center">
			<div className="flex w-full px-5 py-2.5 justify-between items-center bottom-border primary-light-background">
				<div className="flex w-full space-x-2.5 justify-start items-center">
					<FontAwesomeIcon
						className="pr-1 cursor-pointer black-text"
						icon={faChevronLeft}
						onClick={() => unmount({}, false)}
					/>
					<div className="flex w-full justify-start items-center">
						<span className="view-heading">Edit Quotation</span>
					</div>
				</div>
			</div>
			<div className="flex w-full h-[calc(100vh-148px)] justify-center items-center overflow-y-auto contrast-background">{uiInputs()}</div>
			<footer className="w-full dialog-footer">
				<button
					className="primary-button-condensed"
					onClick={() => togglePreview(true)}>
					Preview
				</button>
			</footer>
		</div>
	);
}
