"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import Tippy from "@tippyjs/react";
import html2canvas from "html2canvas";
import MyConstants from "@/utilities/constants";

import { QRCode } from "react-qrcode-logo";
import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { Badge, Tooltip } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ComboBox2, DatePicker, TextArea, TextInput } from "@/components/Inputs";
import { faBank, faCalendar, faChevronLeft, faCircleMinus, faHashtag, faIndianRupee, faListCheck, faMinusCircle, faPlusCircle, faTasks } from "@fortawesome/free-solid-svg-icons";

export default function NewInvoice({ project, reload, unmount }) {
	// Business Logic
	const financialYear = `${dayjs(new Date()).subtract(1, "y").format("YYYY")}-${dayjs(new Date()).format("YY")}`;

	const today = new Date();
	const invoiceDueDate = new Date(today);
	invoiceDueDate.setDate(invoiceDueDate.getDate() + 7);

	const quote = Number(project.quote);

	const [api, setApi] = useState({
		clients: [],
		companies: [],
	});

	const [loading, setLoading] = useState({
		addInvoice: false,
		downloadPdf: false,
		supportData: false,
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
		firm: {
			address: "",
			id: "",
			name: "",
			termsConditions: "",
		},
		particulars: [
			{
				amount: quote,
				particulars: project.sub_project_name,
				professionalService: project.main_project_name,
				rowId: 0,
			},
		],
		transactions: [],
		totalAmountReceived: 0,
	});

	const totalParticularsAmount = main.particulars.reduce((pv, cv) => {
		return pv + Number(cv.amount);
	}, 0);

	const totalPendingAmount = Math.abs(totalParticularsAmount - main.totalAmountReceived);

	const finalPendingAmount = String.fromCharCode(8377) + ` ${MyGlobal.ThousandSeparator(totalPendingAmount)}`;

	const generateButtonStyle = loading.downloadPdf ? "opacity-50 pointer-events-none" : "opacity-100 pointers-events-auto";
	const generateButton = `primary-button-condensed ${generateButtonStyle}`;

	// Functions
	async function addInvoice() {
		try {
			const customId = `${MyGlobal.GetInitials(main.firm.name)}/${main.financialYear}/${main.invoiceId}`;

			const body = {
				amount: totalParticularsAmount,
				amountReceived: main.totalAmountReceived,
				bankId: main.bank.id,
				customId,
				clientId: project.client_id,
				dueDate: main.invoiceDueDate,
				id: project.id,
				particulars: main.particulars,
				receiptDate: main.invoiceDate,
			};

			const response = await axios.post(MyConstants.ApiEndpoints.Invoices.AddInvoice, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reload();

				MyGlobal.AddActivity(`Generated invoice <b>${customId}</b> for <b>${project.id}</b>`, MyConstants.Modules.Derived.NewInvoice);

				MyGlobal.ShowSuccessToast(MyConstants.Messages.InvoiceAdded);
			} else {
				MyGlobal.ShowSuccessToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, MyConstants.Modules.Derived.NewInvoice);
		} finally {
			unmount();
		}
	}

	function addRow() {
		const copy = [...main.particulars];

		let greatestId = copy.sort((a, b) => b.rowId - a.rowId).at(0).rowId;
		greatestId++;

		copy.push({
			amount: 0,
			particulars: "",
			professionalService: project.main_project_name,
			rowId: greatestId,
		});

		setMain((s) => ({ ...s, particulars: copy }));
	}

	function deleteRow(object) {
		const copy = [...main.particulars];
		const doesExist = copy.filter((f) => f.rowId == object.rowId);

		if (doesExist.length) {
			const revised = copy.filter((f) => f.rowId != object.rowId);
			setMain((s) => ({ ...s, particulars: revised }));
		}
	}

	function downloadPdf() {
		setLoading((s) => ({ ...s, downloadPdf: true }));

		const fileName = `${MyGlobal.GetInitials(main.firm.name)}_${main.financialYear}_${main.invoiceId}_${getCompanyDetails().name}`;

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

				let yPosition = 10;
				let remainingHeight = imgHeight;
				let sourceY = 0;
				const canvasHeight = c.height;

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

				pdf.save(`${fileName}.pdf`);

				const pdfBlob = pdf.output("blob");

				const formData = new FormData();
				formData.append("file", pdfBlob, `${project.id}.pdf`);

				return axios.post(MyConstants.ApiEndpoints.Invoices.UploadInvoice, formData, {
					headers: { "Content-Type": "multipart/form-data" },
				});
			})
			.then(() => addInvoice())
			.finally(() => {
				invoiceBody.style.height = originalStyle.height;
				invoiceBody.style.overflow = originalStyle.overflow;

				setLoading((s) => ({ ...s, downloadPdf: false }));
			});
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
		} else if (key == "invoiceDueDate") {
			setMain((s) => ({ ...s, invoiceDueDate: value }));
		} else if (key == "termsConditions") {
			setMain((s) => ({ ...s, firm: { ...s.firm, termsConditions: value } }));
		} else {
			setMain((s) => ({ ...s, [key]: value }));
		}
	}

	function setParticulars(key, rowId, value) {
		const copy = [...main.particulars];
		const object = copy.filter((f) => f.rowId == rowId);

		if (object.length) {
			const index = copy.findIndex((f) => f.rowId === rowId);
			const _object = copy.at(index);

			_object[key] = key == "amount" ? Number(value) : value;

			const revised = copy.filter((f) => f.rowId != rowId);
			revised.push(_object);

			setMain((s) => ({ ...s, particulars: revised }));
		}
	}

	async function setSupportData() {
		try {
			setLoading((s) => ({ ...s, supportData: true }));

			const response = await axios.get(MyConstants.ApiEndpoints.Invoices.GetNewInvoiceSupportData, MyGlobal.GetHeaders({ projectId: project.id }));

			if (response.status === 200) {
				const firmObj = {
					address: "",
					id: "",
					name: "",
					termsConditions: "",
				};

				const bankObj = {
					accountNumber: "",
					accountType: "",
					id: "",
					ifsc: "",
					name: "",
					upiId: "",
				};

				const firm = response.data.firms.find((f) => f.id == project.firm_id);

				if (typeof firm === "object") {
					firmObj.address = firm.address;
					firmObj.id = firm.id;
					firmObj.name = firm.name;
					firmObj.termsConditions = firm.terms_conditions;
				}

				const bank = response.data.banks.find((f) => f.firm_id == firmObj.id);

				if (typeof bank === "object") {
					bankObj.accountNumber = bank.account_number;
					bankObj.accountType = bank.account_type;
					bankObj.id = bank.id;
					bankObj.ifsc = bank.ifsc;
					bankObj.name = bank.name;
					bankObj.upiId = bank.upi_id;
				}

				const getAmountReceived = response.data.transactions.filter((f) => f.project_id == project.id);

				const totalAmountReceived = getAmountReceived.reduce((pv, cv) => {
					return pv + Number(cv.amount);
				}, 0);

				const transactions = response.data.transactions.map((m) => {
					let source = "";

					const getSource = MyGlobal.GetRevisedPaymentSourceList(response.data.banks).find((f) => f.id === m.source);

					if (typeof getSource === "object") {
						source = getSource.name;
					}

					return {
						...m,
						entry_at: dayjs(m.entry_at).format("DD MMMM, YYYY"),
						source,
					};
				});

				setApi({
					clients: response.data.clients,
					companies: response.data.companies,
				});

				setMain((s) => ({
					...s,
					bank: {
						...s.bank,
						accountNumber: bankObj.accountNumber,
						accountType: bankObj.accountType,
						id: bankObj.id,
						ifsc: bankObj.ifsc,
						name: bankObj.name,
						upiId: bankObj.upiId,
					},
					invoiceId: MyGlobal.MakeNewInvoiceId(firmObj.name, response.data.invoices),
					transactions,
					firm: firmObj,
					totalAmountReceived,
				}));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, MyConstants.Modules.Derived.NewInvoice);
		} finally {
			setLoading((s) => ({ ...s, supportData: false }));
		}
	}

	function generateAndDownload() {
		if (totalPendingAmount === 0 && totalParticularsAmount === 0) {
			MyGlobal.ShowErrorToast("Cannot generate an invoice of 0.");
		} else {
			downloadPdf();
		}
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
				hasDataObject
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
					<div className="flex flex-col w-full px-7 justify-between items-center">{uiInputParticularsRows()}</div>
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
		return <DatePicker icon={faCalendar} label="Invoice Date" onChange={(e) => setInputs("invoiceDate", e)} tabIndex={1} value={main.invoiceDate} width="w-full" />;
	}

	function uiInputInvoiceDueDate() {
		return <DatePicker icon={faCalendar} label="Due Date" onChange={(e) => setInputs("invoiceDueDate", e)} tabIndex={2} value={main.invoiceDueDate} width="w-full" />;
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

	function uiInputParticulars(object) {
		return (
			<TextInput
				icon={faTasks}
				id={`particulars${object.rowId}`}
				label="Particulars"
				onChange={(e) => setParticulars("particulars", object.rowId, e.target.value)}
				onKeyPress={() => {}}
				tabIndex={object.rowId}
				value={object.particulars}
				width="w-full"
			/>
		);
	}

	function uiInputAmount(object) {
		return (
			<TextInput
				icon={faIndianRupee}
				id={`amount${object.rowId}`}
				label="Amount"
				onChange={(e) => setParticulars("amount", object.rowId, e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasNumbers(e.key) && e.preventDefault()}
				tabIndex={object.rowId}
				value={object.amount}
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
					<div className="flex w-full space-x-3 justify-between items-end" key={m.rowId}>
						<div className="flex w-fit h-10 justify-center items-start">
							<Badge value={i + 1} />
						</div>
						{uiInputParticulars(m)}
						{uiInputAmount(m)}
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
		let termsConditions = "";
		let termsConditionsLength = "";

		if (typeof main.firm.termsConditions === "string") {
			termsConditions = main.firm.termsConditions.replace(/\\n/g, "\n");
			termsConditionsLength = termsConditions.split("\n").length;
		}

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
					<span className={value}>{main.firm.name}</span>
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
		const { address, name } = main.firm;

		let _address = "";

		if (address) {
			_address = address.length > 95 ? `${address.substring(0, 95)}...` : address;
		}

		return (
			<div className="flex flex-col w-full h-[135px] p-3 justify-start items-center rounded logo-green-border logo-green-background-transparent-01 text-black">
				<span className="w-full text-left font-medium-12 logo-green-text">Billed By</span>
				<span className="w-full text-left font-medium-14">{name}</span>
				<span className="w-full text-left font-regular-10">
					<Tippy content={<Tooltip text={address} />} placement="bottom">
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
					<Tippy content={<Tooltip text={_address} />} placement="bottom">
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
						<span>{MyGlobal.GetInitials(main.firm.name)}</span>
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
		let imageSource = "../logo.png";

		if (MyGlobal.GetInitials(main.firm.name) == "PS") {
			imageSource = "../cs.png";
		}

		return (
			<div className="flex w-1/2 h-full justify-center items-center" id="invoiceWrapper">
				<div className="flex flex-col w-full h-full px-4 py-2 space-y-4 justify-start items-center overflow-y-auto bg-white" id="invoiceBody">
					<div className="flex w-full justify-between items-center bg-white">
						{uiInvoice()}
						<div className="flex w-full justify-end items-center">
							<img src={imageSource} width="55" height="75" />
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
					{main.transactions.length > 0 && <div className="flex flex-col w-full h-full justify-between items-center rounded shadow full-border">
						<div className="flex w-full h-full justify-between items-center bottom-border">{uiTransactionHistoryHeaders()}</div>
						<div className="flex flex-col w-full h-full justify-between items-center">{uiTransactionHistory()}</div>
					</div>}
				</div>
			</div>
		);
	}

	function uiParticularsHeaders() {
		return (
			<div className="flex flex-col w-full justify-center items-start">
				<div className="flex w-full h-8 justify-between items-center rounded-tr rounded-tl font-regular-10 text-white logo-green-background">
					<span className="flex w-2/5 justify-center items-center">Professional Service</span>
					<span className="flex w-2/5 justify-center items-center">Particulars</span>
					<span className="flex w-1/5 justify-center items-center">Amount</span>
				</div>
			</div>
		);
	}

	function uiParticularsRows() {
		return main.particulars.map((m) => {
			return (
				<div className="flex flex-col w-full justify-center items-start">
					<div className="flex w-full justify-between items-center rounded-br rounded-bl font-regular-10 text-black full-border logo-green-background-transparent-01 no-top-border">
						<span className="flex w-2/5 h-14 justify-center items-center">{m.professionalService}</span>
						<span className="flex w-2/5 h-14 justify-center items-center">{m.particulars}</span>
						<span className="flex w-1/5 h-14 justify-center items-center">{m.amount}</span>
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
		let termsConditions = "";

		if (typeof main.firm.termsConditions === "string") {
			termsConditions = main.firm.termsConditions.split("\\n").map((m, i) => (
				<span className="whitespace-pre-line" key={i}>
					{m}
				</span>
			));
		}

		return (
			<div className="flex flex-col w-full space-y-px justify-start items-center">
				<span className="w-full text-left font-medium-14 logo-green-text">Terms and Conditions</span>
				<span className="flex flex-col w-full justify-center items-start font-regular-10">{termsConditions}</span>
			</div>
		);
	}

	function uiTransactionHistory() {
		return main.transactions.map((m, i) => {
			const bottomBorder = i == main.transactions.length - 1 ? "" : "bottom-border";
			const wrapper = `flex w-full justify-center items-center ${bottomBorder} font-regular-11`;

			return (
				<div className={wrapper} key={i}>
					<div className="flex w-1/3 py-2 justify-center items-center">{m.entry_at}</div>
					<div className="flex w-1/3 justify-center items-center">{m.amount}</div>
					<div className="flex w-1/3 justify-center items-center">{m.source}</div>
				</div>
			);
		});
	}

	function uiTransactionHistoryHeaders() {
		return ["Payment Received On", "Payment Amount", "Payment Via"].map((m, i) => {
			return (
				<span className="flex w-full py-2 justify-center items-center font-semibold-11 primary-text" key={i}>
					{m}
				</span>
			);
		});
	}

	function uiTotalAmount() {
		return (
			<div className="flex flex-col w-full justify-center items-center">
				<div className="flex w-full pt-1 justify-between items-center font-medium-16">
					<span className="w-1/2 text-left text-black">Professional Fees</span>
					<span className="w-1/2 text-right black-text">{MyGlobal.ThousandSeparator(totalParticularsAmount)}</span>
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
		setSupportData();
	}, []);

	// Main UI
	return (
		<div className="flex flex-col w-full h-full justify-center items-center">
			<div className="flex w-full px-5 py-2.5 justify-between items-center bottom-border primary-light-background">
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
				<button className={generateButton} onClick={() => generateAndDownload()}>
					Generate
				</button>
			</footer>
		</div>
	);
}
