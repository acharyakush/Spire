"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import MyConstants from "@/utilities/constants";
import NewQuotaionPreview from "./NewQuotationPreview";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { Badge } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ComboBox2, DatePicker, EmailAddress, TextArea, TextInput } from "@/components/Inputs";
import { faCalendar, faChevronLeft, faHashtag, faHome, faIndianRupee, faListCheck, faMinusCircle, faPerson, faPhone, faPlusCircle, faStickyNote, faTasks, faUser } from "@fortawesome/free-solid-svg-icons";

export default function NewQuotaion({ inquiry, unmount }) {
	// Business Logic
	const [api, setApi] = useState({
		banks: [],
		clients: [],
		clientsCopy: [],
		firms: [],
	});

	const [main, setMain] = useState({
		date: new Date(),
		find: "",
		isLoading: false,
		isPdfBeingDownloaded: false,
		proposalNumber: "",
		openPreview: false,
	});

	const [services, setServices] = useState([
		{
			governmentFees: 0,
			inclusions: "",
			professionalFees: 0,
			remarks: "",
			rowId: 0,
			services: "",
		},
	]);

	const [sourceFirm, setSourceFirm] = useState({
		address: "",
		emailAddress: "",
		gstin: "",
		id: "",
		name: "",
		pan: "",
		phoneNumber: "",
		termsConditions: "",
	});

	const [sourceFirmBank, setSourceFirmBank] = useState([
		{
			accountNumber: 0,
			accountType: "",
			address: "",
			emailAddress: "",
			firmId: "",
			id: "",
			ifsc: "",
			name: "",
			phoneNumber: "",
			upiId: "",
		},
	]);

	const [targetClient, setTargetClient] = useState({
		address: "",
		contactPerson: "",
		emailAddress: "",
		id: "",
		name: "",
		phoneNumber: "",
	});

	const generateButtonStyle = main.isPdfBeingDownloaded ? "opacity-50 pointer-events-none" : "opacity-100 pointers-events-auto";
	const generateButton = `primary-button-condensed ${generateButtonStyle}`;

	// Functions
	async function addQuotation() {
		try {
			const body = {
				clientId: targetClient.id,
				clientContactPerson: targetClient.contactPerson,
				clientAddress: targetClient.address,
				date: main.date,
				firmId: sourceFirm.id,
				proposalNumber: main.proposalNumber,
				services,
				termsConditions: sourceFirm.termsConditions,
			};

			const response = await axios.post(MyConstants.ApiEndpoints.Inquiries.AddQuotation, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				// reload();

				MyGlobal.AddActivity(`Generated quotation <b>${main.proposalNumber}</b> for <b>${inquiry?.id}</b>`, MyConstants.Modules.Derived.NewQuotation);

				MyGlobal.ShowSuccessToast(MyConstants.Messages.QuotationAdded);
			} else {
				MyGlobal.ShowSuccessToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, MyConstants.Modules.Derived.NewQuotation);
		} finally {
			unmount({}, false);
		}
	}

	function addRow() {
		const copy = [...services];

		let greatestId = copy.sort((a, b) => b.rowId - a.rowId).at(0).rowId;
		greatestId++;

		copy.push({
			governmentFees: 0,
			inclusions: "",
			professionalFees: 0,
			remarks: "",
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

	function downloadPdf() {
		setValues("isPdfBeingDownloaded", true);

		const pdf = new jsPDF("p", "mm", "a4", true);
		const invoiceBody = document.getElementById("invoiceBody");
		const pageHeight = pdf.internal.pageSize.getHeight();
		const marginBottom = 50;

		const originalStyle = {
			height: invoiceBody.style.height,
			overflow: invoiceBody.style.overflow,
		};

		invoiceBody.style.height = "auto";
		invoiceBody.style.overflow = "visible";

		html2canvas(invoiceBody, { scale: 2, scrollX: 0, scrollY: 0 })
			.then((c) => {
				const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
				const imgHeight = (c.height * pdfWidth) / c.width;
				const canvasHeight = c.height;

				let yPosition = 10;
				let remainingHeight = imgHeight;
				let sourceY = 0;

				while (remainingHeight > 0) {
					const cropHeight = Math.min(pageHeight - marginBottom, remainingHeight);
					const croppedCanvas = document.createElement("canvas");

					croppedCanvas.width = c.width;
					croppedCanvas.height = cropHeight * (c.width / pdfWidth);

					const ctx = croppedCanvas.getContext("2d");
					ctx.drawImage(c, 0, sourceY, c.width, croppedCanvas.height, 0, 0, croppedCanvas.width, croppedCanvas.height);

					const croppedImgData = croppedCanvas.toDataURL("image/png", 1);
					pdf.addImage(croppedImgData, "PNG", 10, yPosition, pdfWidth, cropHeight, "", "FAST");

					remainingHeight -= cropHeight;
					sourceY += cropHeight * (canvasHeight / imgHeight);

					if (remainingHeight > 0) {
						pdf.addPage();
						yPosition = 10;
					}
				}

				pdf.save(`${inquiry?.id}.pdf`);

				const pdfBlob = pdf.output("blob");

				const formData = new FormData();
				formData.append("file", pdfBlob, `${inquiry?.id}.pdf`);

				return axios.post(MyConstants.ApiEndpoints.Inquiries.UploadQuotation, formData, {
					headers: { "Content-Type": "multipart/form-data" },
				});
			})
			.then(() => addQuotation())
			.finally(() => {
				invoiceBody.style.height = originalStyle.height;
				invoiceBody.style.overflow = originalStyle.overflow;

				setValues("isPdfBeingDownloaded", false);
			});
	}

	function getClientName() {
		let name = "";

		if (api.clientsCopy.length) {
			const client = api.clientsCopy.find((f) => f.id == targetClient.id);

			if (typeof client === "object") {
				name = client.name;
			}
		}

		return name;
	}

	function getFilteredClients() {
		let list = !api.clientsCopy.length ? [] : api.clientsCopy;

		if (list.length) {
			const value = String(main.find);

			if (value !== "undefined") {
				list = api.clientsCopy.filter((f) => {
					return String(f.name).toLowerCase().includes(value.toLowerCase());
				});
			}
		}

		return list;
	}

	async function getSupportData() {
		try {
			setValues("isLoading", true);

			const result = await axios.get(MyConstants.ApiEndpoints.Inquiries.GetAddQuotationSupport, MyGlobal.GetHeaders());

			if (result.status === 200) {
				setApi({
					banks: result.data.banks,
					clients: result.data.clients,
					clientsCopy: result.data.clients,
					firms: result.data.firms,
				});
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Inquiries => New Quotation => Get Support Data");
		} finally {
			setValues("isLoading", false);
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

	function setSourceFirmValue(value) {
		if (value) {
			setSourceFirm({
				address: value.address,
				emailAddress: value.email_address,
				gstin: value.gstin,
				id: value.id,
				name: value.name,
				pan: value.pan,
				phoneNumber: value.phone_number,
				termsConditions: value.terms_conditions,
			});
		}
	}

	function setSourceFirmSingleValue(key, value) {
		if (value) {
			setSourceFirm((s) => ({ ...s, [key]: value }));
		}
	}

	function setTargetClientSingleValue(key, value) {
		if (value) {
			setTargetClient((s) => ({ ...s, [key]: value }));
		}
	}

	function setTargetClientValue(value) {
		if (value) {
			setTargetClient({
				address: value.address,
				emailAddress: value.email_address,
				gstin: value.gstin,
				id: value.id,
				name: value.name,
				pan: value.pan,
				phoneNumber: value.phone_number,
				termsConditions: value.terms_conditions,
			});
		}
	}

	function setValues(key, value) {
		setMain((s) => ({ ...s, [key]: value }));
	}

	function togglePreview() {
		setMain((s) => ({ ...s, openPreview: !main.openPreview }));
	}

	// UI Components
	function uiDate() {
		return <DatePicker icon={faCalendar} label="Date" onChange={(e) => setValues("date", e)} tabIndex={7} value={main.date} width="w-full" />;
	}

	function uiInputs() {
		return (
			<div className="flex flex-col w-full h-full px-4 py-2 space-y-1 justify-start items-center overflow-y-auto scrollbar-gutter bg-white">
				<div className="flex w-3/5 px-5 space-x-5 justify-between items-center">
					{uiSourceFirm()}
					{uiTargetClient()}
				</div>
				<div className="flex w-3/5 px-5 space-x-5 justify-between items-center">
					{uiSourceFirmPhoneNumber()}
					{uiTargetClientContactPerson()}
				</div>
				<div className="flex w-3/5 px-5 space-x-5 justify-between items-start">
					{uiSourceFirmEmailAddress()}
					{uiTargetClientAddress()}
				</div>
				<div className="flex w-3/5 px-5 space-x-5 justify-between items-center">
					{uiDate()}
					{uiProposalNumber()}
				</div>
				<div className="flex flex-col w-full px-5 justify-center items-center">{uiServicesRows()}</div>
				<div className="flex w-3/5 px-5 justify-center items-center">{uiTermsConditions()}</div>
			</div>
		);
	}

	function uiProposalNumber() {
		return <TextInput icon={faHashtag} id="proposalNumber" label="Proposal Number" onChange={(e) => setValues("proposalNumber", e.target.value)} onKeyPress={() => {}} tabIndex={8} value={main.proposalNumber} width="w-full" />;
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

	function uiServicesRemarks(row) {
		return (
			<TextInput icon={faStickyNote} id={`remarks${row.rowId}`} label="Remarks" onChange={(e) => setServicesValue("remarks", row.rowId, e.target.value)} onKeyPress={() => {}} tabIndex={row.rowId} value={row.remarks} width="w-full" />
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
					<div className="flex w-3/4 justify-between items-center" key={m.rowId}>
						<div className="flex w-fit h-10 pr-5 justify-center items-end">
							<Badge value={i + 1} />
						</div>
						<div className="flex w-full justify-between items-center">
							<div className="w-1/2">{uiServices(m)}</div>
							<div className="w-1/2">{uiServicesInclusions(m)}</div>
							<div className="w-1/2">{uiServicesRemarks(m)}</div>
							<div className="w-1/3">{uiServicesProfessionalFees(m)}</div>
							<div className="w-1/3">{uiServicesGovernmentFees(m)}</div>
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

	function uiSourceFirm() {
		return (
			<ComboBox2
				allowCreatingNewItem={false}
				comparingValue1="name"
				comparingValue2={sourceFirm.name}
				displayValue="name"
				filteredData={api.firms}
				hasDataObject={false}
				icon={faUser}
				isReadOnly={false}
				label="Source Firm"
				onChange={(e) => setSourceFirmValue(e)}
				onClick={() => {}}
				onInputChange={() => {}}
				onKeyPress={() => {}}
				searchedItem=""
				tabIndex={1}
				value={sourceFirm.name}
				width="w-full"
			/>
		);
	}

	function uiSourceFirmEmailAddress() {
		return <EmailAddress isReadOnly label="Source Firm's Email Address" onChange={(e) => setSourceFirmSingleValue("emailAddress", e.target.value)} suffix="" tabIndex={2} value={sourceFirm.emailAddress} width="w-full" />;
	}

	function uiSourceFirmPhoneNumber() {
		return (
			<TextInput
				icon={faPhone}
				isReadOnly
				label="Source Firm's Phone Number"
				maxLength={12}
				onChange={(e) => setSourceFirmSingleValue("phoneNumber", e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasNumbers(e.key) && e.preventDefault()}
				tabIndex={2}
				value={sourceFirm.phoneNumber}
				width="w-full"
			/>
		);
	}

	function uiTargetClient() {
		return (
			<ComboBox2
				allowCreatingNewItem={false}
				comparingValue1="name"
				comparingValue2={targetClient.name}
				displayValue="name"
				filteredData={getFilteredClients}
				hasDataObject={false}
				icon={faUser}
				isReadOnly={false}
				label="Target Client"
				onChange={(e) => setTargetClientValue(e)}
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

	function uiTargetClientAddress() {
		return <TextArea icon={faHome} label="Target Client's Address" onChange={(e) => setTargetClientSingleValue("address", e.target.value)} onKeyDown={() => {}} rows={2} tabIndex={10} value={targetClient.address} width="w-full" />;
	}

	function uiTargetClientContactPerson() {
		return (
			<TextInput
				icon={faPerson}
				id="targetClientContactPerson"
				label="Target Client's Contact Person"
				onChange={(e) => setTargetClientSingleValue("contactPerson", e.target.value)}
				onKeyPress={() => {}}
				tabIndex={8}
				value={targetClient.contactPerson}
				width="w-full"
			/>
		);
	}

	function uiTermsConditions() {
		let termsConditions = "";
		let termsConditionsLength = "";

		if (typeof sourceFirm.termsConditions === "string") {
			termsConditions = sourceFirm.termsConditions.replace(/\\n/g, "\n");
			termsConditionsLength = termsConditions.split("\n").length;
		}

		return (
			<TextArea
				icon={faListCheck}
				label="Terms & Conditions"
				onChange={(e) => setSourceFirmSingleValue("termsConditions", e.target.value)}
				onKeyDown={() => {}}
				rows={termsConditionsLength + termsConditionsLength}
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
		return <NewQuotaionPreview quotation={{ main, services, sourceFirm, targetClient }} unmount={togglePreview} />;
	}

	return (
		<div className="flex flex-col w-full h-full justify-center items-center">
			<div className="flex w-full px-5 py-2.5 justify-between items-center bottom-border primary-light-background">
				<div className="flex w-full space-x-2.5 justify-start items-center">
					<FontAwesomeIcon className="pr-1 cursor-pointer black-text" icon={faChevronLeft} onClick={() => unmount({}, false)} />
					<div className="flex w-full justify-start items-center">
						<span className="view-heading">New Quotation</span>
					</div>
				</div>
			</div>
			<div className="flex w-full h-[calc(100vh-148px)] justify-center items-center overflow-y-auto contrast-background">{uiInputs()}</div>
			<footer className="w-full dialog-footer">
				<button className={generateButton} onClick={() => togglePreview()}>
					Preview
				</button>
			</footer>
		</div>
	);
}
