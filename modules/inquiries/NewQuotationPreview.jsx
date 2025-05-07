"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import dayjs from "dayjs";
import jsPDF from "jspdf";
import axios from "axios";
import html2canvas from "html2canvas";
import MyConstants from "@/utilities/constants";

import { useState } from "react";
import { QRCode } from "react-qrcode-logo";
import { MyGlobal } from "@/utilities/global";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

export default function NewQuotaionPreview({ inquiry, quotation, reload, unmount }) {
	// Business Logic
	const [main, setMain] = useState({
		isPdfBeingDownloaded: false,
	});

	const generateButtonStyle = main.isPdfBeingDownloaded ? "opacity-50 pointer-events-none" : "opacity-100 pointers-events-auto";
	const generateButton = `primary-button-condensed ${generateButtonStyle}`;

	const totalGovernmentFees = quotation?.services?.reduce((t, v) => t + +v.governmentFees, 0);
	const totalProfessionalFees = quotation?.services?.reduce((t, v) => t + +v.professionalFees, 0);
	const finalAmount = totalGovernmentFees + totalProfessionalFees;

	// Function
	async function addQuotation() {
		try {
			const body = {
				clientId: quotation?.client?.id,
				clientAddress: quotation?.client?.address,
				date: quotation?.main?.date,
				firmId: quotation?.firm?.id,
				customId: quotation?.proposalNumber,
				inquiryId: inquiry?.id,
				remarks: quotation?.main?.remarks,
				services: quotation?.services?.filter((f) => f.services && f.inclusions && f.professionalFees && f.governmentFees),
				termsConditions: quotation?.firm?.termsConditions,
				userId: MyGlobal.GetUserId(),
			};

			const response = await axios.post(MyConstants.ApiEndpoints.Inquiries.AddQuotation, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reload();

				MyGlobal.AddActivity(`Generated quotation <b>${quotation?.proposalNumber}</b> for <b>${inquiry?.id}</b>`, MyConstants.Modules.Derived.NewQuotation);

				MyGlobal.ShowSuccessToast(MyConstants.Messages.QuotationAdded);
			} else {
				MyGlobal.ShowSuccessToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, MyConstants.Modules.Derived.NewQuotation);
		} finally {
			unmount(false);
		}
	}

	function downloadPdf() {
		setMain((s) => ({ ...s, isPdfBeingDownloaded: true }));

		const pdf = new jsPDF("p", "mm", "a4", true);
		const invoiceBody = document.getElementById("invoiceBody");

		const pageHeight = pdf.internal.pageSize.getHeight();
		const pageWidth = pdf.internal.pageSize.getWidth();

		const originalStyle = {
			height: invoiceBody.style.height,
			overflow: invoiceBody.style.overflow,
			fontSize: invoiceBody.style.fontSize || "",
		};

		invoiceBody.style.fontSize = "18px";
		invoiceBody.style.height = "auto";
		invoiceBody.style.overflow = "visible";

		html2canvas(invoiceBody, { scale: 3 })
			.then((canvas) => {
				const imgWidth = pageWidth;
				const imgHeight = (canvas.height * imgWidth) / canvas.width;

				let y = 0;
				while (y < imgHeight) {
					const pageCanvas = document.createElement("canvas");
					const context = pageCanvas.getContext("2d");

					pageCanvas.width = canvas.width;
					pageCanvas.height = Math.min(canvas.height - y, (pageHeight * canvas.width) / pageWidth);

					context.drawImage(canvas, 0, y, canvas.width, pageCanvas.height, 0, 0, canvas.width, pageCanvas.height);

					const imgData = pageCanvas.toDataURL("image/png");
					pdf.addImage(imgData, "PNG", 0, 0, imgWidth, (pageCanvas.height * imgWidth) / canvas.width);

					y += pageCanvas.height;

					if (y < canvas.height) pdf.addPage();
				}

				pdf.save(`${quotation?.proposalNumber}.pdf`);

				// const pdfBlob = pdf.output("blob");

				// const formData = new FormData();
				// formData.append("file", pdfBlob, `${quotation?.proposalNumber}.pdf`);

				// return axios.post(MyConstants.ApiEndpoints.Inquiries.UploadQuotation, formData, {
				// 	headers: { "Content-Type": "multipart/form-data" },
				// });
			})
			// .then(() => addQuotation())
			.finally(() => {
				invoiceBody.style.fontSize = originalStyle.fontSize;
				invoiceBody.style.height = originalStyle.height;
				invoiceBody.style.overflow = originalStyle.overflow;

				setMain((s) => ({ ...s, isPdfBeingDownloaded: false }));
			});
	}

	// UI Components
	function uiFinalAmounts() {
		return (
			<div className="flex flex-col w-1/3 justify-center items-center font-medium-12">
				<div className="flex w-full justify-between items-center">
					<span className="w-1/2 pr-2.5 text-right font-medium-12 gray-text">Total Professional Fees</span>
					<span className="w-1/2 pl-1.5 font-medium-12">{MyGlobal.FormatCurrency(totalProfessionalFees)}</span>
				</div>
				<div className="flex w-full justify-between items-center">
					<span className="w-1/2 pr-2.5 text-right font-medium-12 gray-text">Total Government Cost</span>
					<span className="w-1/2 pl-1.5 font-medium-12">{MyGlobal.FormatCurrency(totalGovernmentFees)}</span>
				</div>
				<div className="flex w-full justify-between items-center">
					<span className="w-1/2 pr-2.5 text-right font-medium-12 gray-text">Final Amount</span>
					<span className="w-1/2 pl-1.5 font-bold-14">{MyGlobal.FormatCurrency(finalAmount)}</span>
				</div>
			</div>
		);
	}

	function uiBank() {
		const label = "flex w-1/2 justify-start items-center font-regular-12";
		const value = `flex w-1/2 justify-start items-center font-bold-12`;

		return (
			<div className="flex w-full p-4 space-x-5 justify-center items-center rounded full-border bg-blue-50">
				<div className="flex w-1/2 justify-center items-center">{uiQrCode()}</div>
				<div className="flex flex-col w-full space-y-2 justify-center items-center">
					<div className="flex w-full space-x-3 justify-between items-center text-black">
						<span className={label}>Account Name</span>
						<span className={value}>{quotation?.firm?.selectedBank?.name}</span>
					</div>
					<div className="flex w-full space-x-3 justify-between items-center">
						<span className={label}>Account Number</span>
						<span className={value}>{quotation?.firm?.selectedBank?.account_number}</span>
					</div>
					<div className="flex w-full space-x-3 justify-between items-center">
						<span className={label}>Account Type</span>
						<span className={value}>{quotation?.firm?.selectedBank?.account_type}</span>
					</div>
					<div className="flex w-full space-x-3 justify-between items-center">
						<span className={label}>Bank Name</span>
						<span className={value}>{quotation?.firm?.selectedBank?.name}</span>
					</div>
					<div className="flex w-full space-x-3 justify-between items-center">
						<span className={label}>IFSC</span>
						<span className={value}>{quotation?.firm?.selectedBank?.ifsc}</span>
					</div>
				</div>
			</div>
		);
	}

	function uiProposal() {
		return (
			<div className="flex flex-col w-1/2 justify-center items-start">
				<span className="font-medium-12 gray-text">Proposal</span>
				<span className="font-bold-14 text-black">{quotation?.proposalNumber}</span>
			</div>
		);
	}

	function uiRemarks() {
		return <div className="flex flex-col w-full p-4 justify-center items-start rounded bg-blue-50 full-border font-regular-12">{quotation?.main?.remarks}</div>;
	}

	function uiServicesProposalHeaders() {
		return (
			<div className="flex w-full py-3 justify-center items-center bg-blue-100 bottom-border font-bold-12">
				<span className="flex justify-center items-center w-[5%]">SN</span>
				<span className="flex justify-center items-center w-[19%]">Services</span>
				<span className="flex justify-center items-center w-[19%]">Inclusions</span>
				<span className="flex justify-center items-center w-[19%]">Professional Fees</span>
				<span className="flex justify-center items-center w-[19%]">Government/Other Cost</span>
				<span className="flex justify-center items-center w-[19%]">Total</span>
			</div>
		);
	}

	function uiServicesProposalRows() {
		return quotation?.services
			?.filter((f) => f.services && f.inclusions && f.professionalFees && f.governmentFees)
			?.map((m, i) => {
				const showBottomBorder = i !== quotation?.services?.length - 1 ? "bottom-border" : "";
				const wrapper = `flex w-full py-2 justify-center items-center font-regular-12 ${showBottomBorder}`;

				const total = +m?.professionalFees + +m.governmentFees;

				return (
					<div className={wrapper}>
						<span className="flex justify-center items-center w-[5%]">{i + 1}</span>
						<span className="flex w-[19%] justify-center items-center">{m?.services}</span>
						<span className="flex w-[19%] justify-center items-center">{m?.inclusions}</span>
						<span className="flex w-[19%] justify-center items-center">{MyGlobal.FormatCurrency(m?.professionalFees)}</span>
						<span className="flex w-[19%] justify-center items-center">{MyGlobal.FormatCurrency(m?.governmentFees)}</span>
						<span className="flex w-[19%] justify-center items-center">{MyGlobal.FormatCurrency(total)}</span>
					</div>
				);
			});
	}

	function uiFirm() {
		return (
			<div className="flex flex-col w-1/2 justify-center items-start">
				<div className="flex justify-start items-center">
					<span className="font-bold-14 text-black">{quotation?.firm?.name}</span>
				</div>
				<span className="font-regular-12 gray-text">{quotation?.firm?.address}</span>
			</div>
		);
	}

	function uiClient() {
		return (
			<div className="flex flex-col w-1/2 justify-center items-start">
				<div className="flex justify-start items-center">
					<span className="font-bold-14">{inquiry?.client_name}</span>
				</div>
				<span className="font-regular-12 gray-text">{quotation?.client?.address}</span>
			</div>
		);
	}

	function uiQrCode() {
		const qrCodeContent = `upi://pay?pa=${quotation?.firm?.selectedBank?.upi_id}&am=${finalAmount}&cu=INR`;

		return (
			<div className="flex w-full justify-start items-center">
				<QRCode quietZone={0} value={qrCodeContent} />
			</div>
		);
	}

	function uiTermsConditions() {
		let termsConditions = "";

		if (typeof quotation?.firm?.termsConditions === "string") {
			termsConditions = quotation?.firm?.termsConditions.split("\\n").map((m, i) => (
				<span className="py-1 whitespace-pre-line" key={i}>
					{m}
				</span>
			));
		}

		return <div className="flex flex-col w-full p-4 justify-center items-start rounded bg-blue-50 full-border font-regular-12">{termsConditions}</div>;
	}

	function uiTotalAmountsInWords() {
		return (
			<div className="flex flex-col w-1/2 space-y-1 justify-center items-start font-medium-12">
				<span className="font-medium-12 gray-text">Amount in words</span>
				<span className="font-bold-14">{MyGlobal.NumberToWordsIndian(finalAmount)}</span>
			</div>
		);
	}

	// Main UI
	return (
		<div className="flex flex-col w-full h-full justify-center items-center">
			<div className="flex w-full px-5 py-2.5 justify-between items-center bottom-border primary-light-background">
				<div className="flex w-full space-x-2.5 justify-start items-center">
					<FontAwesomeIcon className="pr-1 cursor-pointer black-text" icon={faChevronLeft} onClick={() => unmount(false)} />
					<div className="flex w-full justify-start items-center">
						<span className="view-heading">New Quotation Preview</span>
					</div>
				</div>
			</div>
			<div className="flex flex-col w-full h-[calc(100vh-148px)] p-5 space-y-5 justify-start items-start overflow-y-auto contrast-background" id="invoiceBody">
				<div className="flex w-full justify-between items-center">
					{uiProposal()}
					<div className="flex flex-col w-full justify-center items-end">
						<span className="font-medium-12 gray-text">Date</span>
						<span className="font-bold-14 text-black">{dayjs(quotation?.main?.date).format("DD MMM, YYYY")}</span>
					</div>
				</div>
				<div className="flex w-full justify-between items-center">
					{uiFirm()}
					{uiClient()}
				</div>
				<div className="flex flex-col w-full justify-center items-start">
					<span className="font-bold-14">Services Proposal</span>
					<div className="w-full rounded-md full-border">
						{uiServicesProposalHeaders()}
						{uiServicesProposalRows()}
					</div>
				</div>
				<div className="flex w-full space-x-5 justify-between items-start">
					<div className="flex flex-col w-2/5 space-y-5 justify-center items-start">
						<div className="flex flex-col w-full justify-center items-start">
							<span className="font-bold-14">Remarks</span>
							{uiRemarks()}
						</div>
						<div className="flex flex-col w-full justify-center items-start">
							<span className="font-bold-14">Bank Details</span>
							{uiBank()}
						</div>
					</div>
					<div className="flex flex-col w-3/5 justify-center items-start">
						<span className="font-bold-14">Terms & Conditions</span>
						{uiTermsConditions()}
					</div>
				</div>
			</div>
			<footer className="w-full dialog-footer">
				<button className={generateButton} onClick={() => downloadPdf()}>
					Generate
				</button>
			</footer>
		</div>
	);
}
