"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import dayjs from "dayjs";
import jsPDF from "jspdf";
import axios from "axios";
import html2canvas from "html2canvas";
import { ApiEndpoints, Messages } from "@/utilities/constants";

import { useState } from "react";
import { QRCode } from "react-qrcode-logo";
import { MyGlobal } from "@/utilities/global";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

export default function EditQuotaionPreview({ inquiry, quotation, reload, unmount }) {
	// Business Logic
	const [main, setMain] = useState({ isPdfBeingDownloaded: false });

	const generateButtonStyle = main.isPdfBeingDownloaded ? "opacity-50 pointer-events-none" : "opacity-100 pointers-events-auto";
	const generateButton = `primary-button-condensed ${generateButtonStyle}`;

	const totalGovernmentFees = quotation?.services?.reduce((t, v) => t + +v.governmentFees, 0);
	const totalProfessionalFees = quotation?.services?.reduce((t, v) => t + +v.professionalFees, 0);
	const finalAmount = totalGovernmentFees + totalProfessionalFees;

	// Function
	async function editQuotation() {
		try {
			const body = {
				clientId: quotation?.client?.id,
				clientAddress: quotation?.client?.address,
				date: quotation?.main?.date,
				firmId: quotation?.firm?.id,
				customId: quotation?.proposalNumber,
				remarks: quotation?.main?.remarks,
				services: quotation?.services?.filter((f) => f.services && f.inclusions && f.professionalFees && f.governmentFees),
				termsConditions: quotation?.firm?.termsConditions,
			};

			const response = await axios.post(ApiEndpoints.Inquiries.EditQuotation, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reload();

				MyGlobal.AddActivity(`Edited quotation <b>${quotation?.proposalNumber}</b> for <b>${inquiry?.id}</b>`, "Edit Quotation");

				MyGlobal.ShowSuccessToast(Messages.QuotationEdited);
			} else {
				MyGlobal.ShowSuccessToast(Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Inquiries > Edit Quotation Preview > Edit Quotation");
		} finally {
			unmount(false);
		}
	}

	function addImagePage(pdf, src) {
		return new Promise((resolve) => {
			const img = new Image();
			img.onload = () => {
				const pageWidth = pdf.internal.pageSize.getWidth();
				const pageHeight = pdf.internal.pageSize.getHeight();

				const imgRatio = img.width / img.height;
				const pageRatio = pageWidth / pageHeight;

				let width, height;

				if (imgRatio > pageRatio) {
					width = pageWidth;
					height = pageWidth / imgRatio;
				} else {
					height = pageHeight;
					width = pageHeight * imgRatio;
				}

				const x = (pageWidth - width) / 2;
				const y = (pageHeight - height) / 2;

				pdf.addImage(img, "PNG", x, y, width, height);
				resolve();
			};
			img.src = src;
		});
	}

	async function downloadPdf() {
		setMain((s) => ({ ...s, isPdfBeingDownloaded: true }));

		const pdf = new jsPDF("p", "mm", "a4", true);
		const invoiceBody = document.getElementById("invoiceBody");

		const pageWidth = pdf.internal.pageSize.getWidth();
		const pageHeight = pdf.internal.pageSize.getHeight();
		const margin = 10;

		const originalStyle = {
			height: invoiceBody.style.height,
			overflow: invoiceBody.style.overflow,
		};

		try {
			/* ================= PREPEND IMAGE PAGES ================= */

			// Page 1
			await addImagePage(pdf, "/quotation-page-1.jpg");

			// Page 2
			pdf.addPage();
			await addImagePage(pdf, "/quotation-page-2.jpg");

			// Invoice starts on a NEW page
			pdf.addPage();

			/* ======================================================= */

			invoiceBody.style.height = "auto";
			invoiceBody.style.overflow = "visible";

			/* ---------------- HTML → CANVAS ---------------- */
			const canvas = await html2canvas(invoiceBody, {
				scale: 3,
				scrollX: 0,
				scrollY: 0,
				useCORS: true,
			});

			const imgWidth = pageWidth - 2 * margin;
			const pageHeightPx = (pageHeight * canvas.width) / imgWidth;

			let remainingHeight = canvas.height;
			let sourceY = 0;
			let firstInvoicePage = true;

			/* -------- REUSED PAGE CANVAS (MEMORY SAFE) -------- */
			const pageCanvas = document.createElement("canvas");
			const ctx = pageCanvas.getContext("2d");
			pageCanvas.width = canvas.width;

			while (remainingHeight > 0) {
				const cropHeight = Math.min(pageHeightPx, remainingHeight);

				pageCanvas.height = cropHeight;
				ctx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);

				ctx.drawImage(canvas, 0, sourceY, canvas.width, cropHeight, 0, 0, canvas.width, cropHeight);

				const imgData = pageCanvas.toDataURL("image/png");

				// IMPORTANT: avoid blank page before first invoice image
				if (!firstInvoicePage) pdf.addPage();
				firstInvoicePage = false;

				const imgHeight = (cropHeight * imgWidth) / canvas.width;

				pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight, "", "FAST");

				remainingHeight -= cropHeight;
				sourceY += cropHeight;
			}

			/* ---------------- FREE MEMORY ---------------- */
			canvas.width = 0;
			canvas.height = 0;
			pageCanvas.width = 0;
			pageCanvas.height = 0;

			/* ---------------- SAVE + UPLOAD ---------------- */
			const fileName = String(quotation?.proposalNumber).replaceAll("/", "_");

			const pdfBlob = pdf.output("blob");

			const formData = new FormData();
			formData.append("file", pdfBlob, `${fileName}.pdf`);

			await axios.post(ApiEndpoints.Inquiries.UploadQuotation, formData);

			await editQuotation();

			/* ---------------- DOWNLOAD LAST ---------------- */
			pdf.save(`${fileName}.pdf`);
		} catch (error) {
			console.error("downloadPdf (edit) failed:", error);
		} finally {
			invoiceBody.style.height = originalStyle.height;
			invoiceBody.style.overflow = originalStyle.overflow;

			setMain((s) => ({ ...s, isPdfBeingDownloaded: false }));
		}
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
		const label = "flex w-full justify-start items-center font-regular-12 gray-text";
		const value = `flex w-full justify-start items-center font-bold-12`;

		return (
			<div className="flex w-full p-4 space-x-5 justify-center items-center rounded full-border logo-green-background-transparent-01">
				<div className="flex w-1/4 justify-center items-center">{uiQrCode()}</div>
				<div className="w-3/4 space-y-3 columns-3">
					<div className="flex flex-col w-full justify-between items-center text-black">
						<span className={label}>Account Name</span>
						<span className={value}>{quotation?.firm?.selectedBank?.name}</span>
					</div>
					<div className="flex flex-col w-full justify-between items-center">
						<span className={label}>Account Number</span>
						<span className={value}>{quotation?.firm?.selectedBank?.account_number}</span>
					</div>
					<div className="flex flex-col w-full justify-between items-center">
						<span className={label}>Account Type</span>
						<span className={value}>{quotation?.firm?.selectedBank?.account_type}</span>
					</div>
					<div className="flex flex-col w-full justify-between items-center">
						<span className={label}>Bank Name</span>
						<span className={value}>{quotation?.firm?.selectedBank?.name}</span>
					</div>
					<div className="flex flex-col w-full justify-between items-center">
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
		return <div className="flex flex-col w-full p-4 justify-center items-start rounded logo-green-background-transparent-01 full-border font-regular-12">{quotation?.main?.remarks}</div>;
	}

	function uiServicesProposalHeaders() {
		return (
			<div className="flex w-full py-3 justify-center items-center logo-green-background bottom-border rounded-tr rounded-tl font-bold-11 text-white">
				<span className="flex justify-center items-center w-[5%]"></span>
				<span className="flex items-center text-left w-[30%]">Services</span>
				<span className="flex items-center text-left w-[30%]">Inclusions</span>
				<span className="flex justify-center items-center w-[15%]">Prof Fees</span>
				<span className="flex justify-center items-center w-[15%]">Gov/Other Cost</span>
				<span className="flex justify-center items-center w-[10%]">Total</span>
			</div>
		);
	}

	function uiServicesProposalRows() {
		return quotation?.services?.map((m, i) => {
			const showBottomBorder = i !== quotation?.services?.length - 1 ? "bottom-border" : "";
			const wrapper = `flex w-full py-2 justify-center items-center font-regular-12 ${showBottomBorder}`;

			const total = +m?.professionalFees + +m.governmentFees;

			return (
				<div className={wrapper}>
					<span className="flex w-[5%] justify-center items-center">{i + 1}</span>
					<span className="w-[30%] flex items-center text-left">{m?.services}</span>
					<span className="w-[30%] flex items-center text-left">{m?.inclusions}</span>
					<span className="flex w-[15%] justify-center items-center">{MyGlobal.FormatCurrency(m?.professionalFees)}</span>
					<span className="flex w-[15%] justify-center items-center">{MyGlobal.FormatCurrency(m?.governmentFees)}</span>
					<span className="flex w-[10%] justify-center items-center">{MyGlobal.FormatCurrency(total)}</span>
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
					<span className="font-bold-14 text-black">{inquiry?.client_name}</span>
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

		return <div className="flex flex-col w-full p-4 justify-center items-start rounded logo-green-background-transparent-01 full-border font-regular-12">{termsConditions}</div>;
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
		<div className="flex flex-col w-full h-full justify-center items-center contrast-background">
			<div className="flex w-full px-5 py-2.5 justify-between items-center bottom-border primary-light-background">
				<div className="flex w-full space-x-2.5 justify-start items-center">
					<FontAwesomeIcon className="pr-1 cursor-pointer black-text" icon={faChevronLeft} onClick={() => unmount(false)} />
					<div className="flex w-full justify-start items-center">
						<span className="view-heading">Edit Quotation Preview</span>
					</div>
				</div>
			</div>
			<div className="flex flex-col w-3/5 h-[calc(100vh-148px)] p-5 space-y-7 justify-start items-start overflow-y-auto contrast-background" id="invoiceBody">
				<div className="flex w-full justify-between items-center">
					{uiProposal()}
					<div className="flex flex-col w-full justify-center items-end">
						<span className="font-medium-12 gray-text">Date</span>
						<span className="font-bold-14 text-black">{dayjs(quotation?.main?.date).format("DD MMM, YYYY")}</span>
					</div>
				</div>
				<div className="flex w-full space-x-10 justify-between items-start">
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
				<div className="flex flex-col w-full space-y-5 justify-between items-start">
					{quotation?.main?.remarks?.length > 0 && (
						<div className="flex flex-col w-full justify-center items-start">
							<span className="font-bold-14">Remarks</span>
							{uiRemarks()}
						</div>
					)}
					<div className="flex flex-col w-full justify-center items-start">
						<span className="font-bold-14">Terms & Conditions</span>
						{uiTermsConditions()}
					</div>
					<div className="flex flex-col w-full justify-center items-start">
						<span className="font-bold-14">Bank Details</span>
						{uiBank()}
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
