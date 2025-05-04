"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import dayjs from "dayjs";

import { MyGlobal } from "@/utilities/global";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

export default function NewQuotaionPreview({ quotation, unmount }) {
	// Business Logic
	const generateButtonStyle = quotation?.main?.isPdfBeingDownloaded ? "opacity-50 pointer-events-none" : "opacity-100 pointers-events-auto";
	const generateButton = `primary-button-condensed ${generateButtonStyle}`;

	const totalGovernmentFees = quotation?.services?.reduce((t, v) => t + +v.governmentFees, 0);
	const totalProfessionalFees = quotation?.services?.reduce((t, v) => t + +v.professionalFees, 0);
	const finalAmount = totalGovernmentFees + totalProfessionalFees;

	// UI Components
	function uiFinalAmounts() {
		return (
			<div className="flex w-1/4 justify-end items-center">
				<span className="flex w-full justify-center items-center font-bold-12">{finalAmount}</span>
			</div>
		);
	}

	function uiProposal() {
		return (
			<div className="flex flex-col w-1/2 space-y-1 justify-center items-end">
				<span className="font-bold-16">Proposal</span>
				<span className="font-medium-12 gray-text">{quotation?.main?.proposalNumber}</span>
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
					<span className="flex justify-center items-center w-1/4">{m?.services}</span>
					<span className="flex justify-center items-center w-1/4">{m?.inclusions}</span>
					<span className="flex justify-center items-center w-1/4">{m?.remarks}</span>
					<span className="flex justify-center items-center w-[10%]">{m?.professionalFees}</span>
					<span className="flex justify-center items-center w-[10%]">{m?.governmentFees}</span>
				</div>
			);
		});
	}

	function uiSourceFirm() {
		return (
			<div className="flex flex-col w-1/2 space-y-1 justify-center items-start">
				<span className="font-bold-16">{quotation?.sourceFirm?.name}</span>
				<span className="font-medium-12 gray-text">{quotation?.sourceFirm?.address}</span>
			</div>
		);
	}

	function uiTargetClient() {
		return (
			<div className="flex flex-col w-1/2 space-y-1 justify-center items-start">
				<span className="font-medium-12 gray-text">To</span>
				<span className="font-bold-16">{quotation?.targetClient?.name}</span>
				<span className="font-medium-12 gray-text">{quotation?.targetClient?.address}</span>
			</div>
		);
	}

	function uiTotalAmounts() {
		return (
			<div className="flex w-1/4 justify-end items-center">
				<span className="flex w-1/2 justify-center items-center font-bold-12">{totalProfessionalFees}</span>
				<span className="flex w-1/2 justify-center items-center font-bold-12">{totalGovernmentFees}</span>
			</div>
		);
	}

	function uiTotalAmountsInWords() {
		return <div className="flex w-1/2 justify-start items-center font-medium-12">{MyGlobal.NumberToWordsIndian(finalAmount)}</div>;
	}

	// Main UI
	return (
		<div className="flex flex-col w-full h-full justify-center items-center">
			<div className="flex w-full px-5 py-2.5 justify-between items-center bottom-border primary-light-background">
				<div className="flex w-full space-x-2.5 justify-start items-center">
					<FontAwesomeIcon className="pr-1 cursor-pointer black-text" icon={faChevronLeft} onClick={() => unmount()} />
					<div className="flex w-full justify-start items-center">
						<span className="view-heading">New Quotation Preview</span>
					</div>
				</div>
			</div>
			<div className="flex flex-col w-full h-[calc(100vh-148px)] p-5 space-y-5 justify-start items-start overflow-y-auto contrast-background">
				<span className="font-bold-12">Date {dayjs(quotation?.main?.date).format("DD MMM, YYYY")}</span>
				<div className="flex w-full justify-between items-center">
					{uiSourceFirm()}
					{uiProposal()}
				</div>
				<div className="flex w-full justify-between items-center">{uiTargetClient()}</div>
				<div className="flex flex-col w-full justify-center items-start">
					<span className="font-bold-14">Services Proposal</span>
					<div className="w-full rounded-md">
						{uiServicesProposalHeaders()}
						{uiServicesProposalRows()}
					</div>
				</div>
				<div className="flex w-full justify-between items-center">
					<div className="w-3/4" />
					{uiTotalAmounts()}
				</div>
				<div className="flex w-full justify-between items-center">
					{uiTotalAmountsInWords()}
					{uiFinalAmounts()}
				</div>
			</div>
			<footer className="w-full dialog-footer">
				<button className={generateButton} onClick={() => unmount()}>
					Generate
				</button>
			</footer>
		</div>
	);
}
