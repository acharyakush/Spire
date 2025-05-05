"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import dayjs from "dayjs";
import jsPDF from "jspdf";
import axios from "axios";
import html2canvas from "html2canvas";
import MyConstants from "@/utilities/constants";

import { useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

export default function NewQuotaionPreview({ inquiry, quotation, unmount }) {
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
				clientId: quotation?.targetClient?.id,
				clientContactPerson: quotation?.targetClient?.contactPerson,
				clientAddress: quotation?.targetClient?.address,
				date: quotation?.main?.date,
				firmId: quotation?.sourceFirm?.id,
				proposalNumber: quotation?.main?.proposalNumber,
				services: quotation?.services,
				termsConditions: quotation?.sourceFirm?.termsConditions,
			};

			const response = await axios.post(MyConstants.ApiEndpoints.Inquiries.AddQuotation, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				// reload();

				MyGlobal.AddActivity(`Generated quotation <b>${quotation?.main?.proposalNumber}</b> for <b>${inquiry?.id}</b>`, MyConstants.Modules.Derived.NewQuotation);

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

				// return axios.post(MyConstants.ApiEndpoints.Inquiries.UploadQuotation, formData, {
				// 	headers: { "Content-Type": "multipart/form-data" },
				// });
			})
			// .then(() => addQuotation())
			.finally(() => {
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
					<span className="w-1/2 pr-5 text-right font-medium-12 gray-text">Total Professional Fees</span>
					<span className="w-1/2 pl-1.5 font-medium-12">{MyGlobal.FormatCurrency(totalProfessionalFees)}</span>
				</div>
				<div className="flex w-full justify-between items-center">
					<span className="w-1/2 pr-5 text-right font-medium-12 gray-text">Total Government Fees</span>
					<span className="w-1/2 pl-1.5 font-medium-12">{MyGlobal.FormatCurrency(totalGovernmentFees)}</span>
				</div>
				<div className="flex w-full justify-between items-center">
					<span className="w-1/2 pr-5 text-right font-medium-12 gray-text">Total Fees</span>
					<span className="w-1/2 pl-1.5 font-bold-14">{MyGlobal.FormatCurrency(finalAmount)}</span>
				</div>
			</div>
		);
	}

	function uiProposal() {
		return (
			<div className="flex flex-col w-1/2 justify-center items-start">
				<span className="font-medium-12 gray-text">Proposal</span>
				<span className="font-bold-14 text-black">{quotation?.main?.proposalNumber}</span>
			</div>
		);
	}

	function uiServicesProposalHeaders() {
		return (
			<div className="flex w-full py-3 justify-center items-center bg-blue-100 bottom-border font-bold-12">
				<span className="flex justify-center items-center w-[5%]">SN</span>
				<span className="flex justify-center items-center w-1/4">Services</span>
				<span className="flex justify-center items-center w-1/4">Inclusions</span>
				<span className="flex justify-center items-center w-1/4">Remarks</span>
				<span className="flex justify-center items-center w-[10%]">Professional Fees</span>
				<span className="flex justify-center items-center w-[10%]">Government Fees</span>
			</div>
		);
	}

	function uiServicesProposalRows() {
		return quotation?.services?.map((m, i) => {
			const showBottomBorder = i !== quotation?.services?.length - 1 ? "bottom-border" : "";
			const wrapper = `flex w-full py-2 justify-center items-center font-medium-12 ${showBottomBorder}`;

			return (
				<div className={wrapper}>
					<span className="flex justify-center items-center w-[5%]">{i + 1}</span>
					<span className="flex w-1/4 justify-center items-center">{m?.services}</span>
					<span className="flex w-1/4 justify-center items-center">{m?.inclusions}</span>
					<span className="flex w-1/4 justify-center items-center">{m?.remarks}</span>
					<span className="flex w-[10%] justify-center items-center">{MyGlobal.FormatCurrency(m?.professionalFees)}</span>
					<span className="flex w-[10%] justify-center items-center">{MyGlobal.FormatCurrency(m?.governmentFees)}</span>
				</div>
			);
		});
	}

	function uiSourceFirm() {
		return (
			<div className="flex flex-col w-1/2 justify-center items-start">
				<div className="flex justify-start items-center">
					<span className="font-bold-14 text-black">{quotation?.sourceFirm?.name}</span>
				</div>
				<span className="font-medium-12 gray-text">{quotation?.sourceFirm?.address}</span>
			</div>
		);
	}

	function uiSourceFirmSignature() {
		return (
			<div className="flex flex-col w-[70%] justify-center items-start">
				<span className="font-bold-12 text-black">For {quotation?.sourceFirm?.name}</span>
				<span className="w-52 h-10 bottom-border" />
				<span className="font-medium-11 gray-text">Authorized Signature</span>
			</div>
		);
	}

	function uiTargetClient() {
		return (
			<div className="flex flex-col w-1/2 justify-center items-start">
				<div className="flex justify-start items-center">
					<span className="font-bold-14">{quotation?.targetClient?.name}</span>
				</div>
				<span className="font-medium-12 gray-text">{quotation?.targetClient?.address}</span>
				<div className="flex space-x-2 justify-start items-center">
					<span className="font-medium-12 gray-text">Contact Person</span>
					<span className="font-bold-14">{quotation?.targetClient?.contactPerson}</span>
				</div>
			</div>
		);
	}

	function uiTargetClientSignature() {
		return (
			<div className="flex flex-col w-[30%] justify-center items-start">
				<span className="font-bold-12 text-black">For {quotation?.targetClient?.name}</span>
				<span className="w-52 h-10 bottom-border" />
				<span className="font-medium-11 gray-text">Authorized Signature</span>
			</div>
		);
	}

	function uiTermsConditions() {
		let termsConditions = "";

		if (typeof quotation?.sourceFirm?.termsConditions === "string") {
			termsConditions = quotation?.sourceFirm?.termsConditions.split("\\n").map((m, i) => (
				<span className="py-0.5 whitespace-pre-line" key={i}>
					{m}
				</span>
			));
		}

		return <div className="flex flex-col w-full p-4 justify-center items-start rounded bg-blue-50 full-border font-regular-12">{termsConditions}</div>;
	}

	function uiTotalAmountsInWords() {
		return (
			<div className="flex w-1/2 space-x-5 justify-start items-center font-medium-12">
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
					{uiSourceFirm()}
					{uiTargetClient()}
				</div>
				<div className="flex flex-col w-full justify-center items-start">
					<span className="font-bold-14">Services Proposal</span>
					<div className="w-full rounded-md full-border">
						{uiServicesProposalHeaders()}
						{uiServicesProposalRows()}
					</div>
				</div>
				<div className="flex w-full space-x-5 justify-between items-center">
					<div className="flex flex-col w-full justify-center items-start">
						<span className="font-bold-14">Terms & Conditions</span>
						{uiTermsConditions()}
					</div>
				</div>
				<div className="flex w-full justify-between items-center">
					{uiTotalAmountsInWords()}
					{uiFinalAmounts()}
				</div>
				<div className="flex w-full justify-between items-center">
					{uiSourceFirmSignature()}
					{uiTargetClientSignature()}
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
