"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import dayjs from "dayjs";
import axios from "axios";
import Tasks from "./Tasks";
import Tippy from "@tippyjs/react";
import MyConstants from "@/utilities/constants";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { SpinnerSmall, TooltipList } from "@/components/Elements";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import {
	faBars,
	faBriefcase,
	faCalendarXmark,
	faChevronLeft,
	faCoins,
	faCopy,
	faEnvelope,
	faFile,
	faFileExcel,
	faIdBadge,
	faIdCardClip,
	faIndianRupeeSign,
	faReceipt,
	faStopwatch,
	faUserGroup,
} from "@fortawesome/free-solid-svg-icons";

export default function SingleProject({ reloadProjects, reloadNotes, selectedClient, selectedProject, source, unmount }) {
	// Business Logic
	const isSourceSingleClient = source === "Single Client => Single Project";

	const relativeTime = require("dayjs/plugin/relativeTime");
	dayjs.extend(relativeTime);

	const [apiData, setApiData] = useState({
		allAdministratorsCompanies: [],
		allAdministratorsCompaniesBanks: [],
		allAffiliates: [],
		allCompanies: [],
		allCashFlows: [],
		allInvoices: [],
	});

	const [hasMounted, setHasMounted] = useState({
		changeQuote: false,
		editGovernmentId: false,
		generateInvoice: false,
		governmentId: false,
		mainComponent: false,
		mapAffiliates: false,
		notesBar: false,
	});

	const [mainData, setMainData] = useState({
		isLoading: {},
		searchTerm: "",
	});

	// Functions
	const getCompanyName = () => {
		if (apiData.allCompanies.length) {
			return apiData.allCompanies.filter((company) => company.id == selectedProject.company_id).at(0).name;
		} else {
			return "";
		}
	};

	const getSupportData = async () => {
		setMainData((old) => ({ ...old, isLoading: { ...old.isLoading, supportData: true } }));

		try {
			const response = await axios.get(MyConstants.ApiEndpoints.SingleProject.GetSupportData, MyGlobal.GetHeaders());

			if (response.status === 200) {
				setApiData((old) => ({
					...old,
					allCompanies: response.data.companies,
					allInvoices: response.data.invoices,
				}));

				setHasMounted((old) => ({ ...old, mainComponent: true }));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, `Single Project => Get Support Data`);
		} finally {
			setMainData((old) => ({ ...old, isLoading: { ...old.isLoading, supportData: false } }));
		}
	};

	const openEmailClient = (emailAddress) => {
		globalThis.window.open(`mailto:${emailAddress}`, "_blank");
	};

	const openWhatsApp = (contactNumber) => {
		globalThis.window.open(`https://wa.me/1${contactNumber}`, "_blank");
	};

	// UI Components
	const uiClientInformation = () => {
		const wrapperSansAesthetics = "flex w-full space-x-1.5 justify-start items-center";

		const columnWrapper = "flex flex-col -space-y-px justify-center items-center cursor-pointer primary-tag-transparent-01";

		const redColumnWrapper = "flex flex-col -space-y-px justify-center items-center cursor-pointer font-normal red-tag-transparent-01";

		const dueOnTimeLeft =
			dayjs(selectedProject.due_on).format("DD-MM-YYYY") == dayjs().format("DD-MM-YYYY") ? "Today" : dayjs(selectedProject.due_on).fromNow();

		const quote = Number(selectedProject.quote);
		const _quote = MyGlobal.ThousandSeparator(quote);

		const teamsNames = MyGlobal.GetAnyDataFromId(selectedProject.teams, "full_name");
		const teamsNamesArray = String(teamsNames).split(",");

		let teamsInitials = "";

		teamsNamesArray.forEach((name, index) => {
			if (index != teamsNamesArray.length - 1) {
				teamsInitials += MyGlobal.GetInitials(name) + ", ";
			} else {
				teamsInitials += MyGlobal.GetInitials(name);
			}
		});

		const affiliateInitials = selectedProject.affiliate_ids
			? selectedProject.affiliate_ids.split(",").map((id) => {
					const affiliate = apiData.allAffiliates.filter((aff) => aff.id == id);

					if (affiliate.length) {
						return MyGlobal.getInitials(affiliate.at(0).name);
					} else {
						return "";
					}
			  })
			: [""];

		const affiliatesNames =
			selectedProject.affiliate_ids &&
			selectedProject.affiliate_ids.split(",").map((id) => {
				const affiliate = apiData.allAffiliates.filter((aff) => aff.id == id);

				if (affiliate.length) {
					const parsedDetails = JSON.parse(affiliate.at(0).details);

					const paidFees = Number(parsedDetails.at(0).paid_fees);
					const totalFees = Number(parsedDetails.at(0).total_fees);
					const pendingFees = totalFees - paidFees;

					return `${affiliate.at(0).name}\nPaid ${paidFees} | Pending ${pendingFees} | Total ${totalFees}`;
				} else {
					return "";
				}
			});

		return (
			<div className="flex w-full justify-between items-center">
				<div className="flex w-4/5 space-x-2.5 justify-start items-center">
					<div className="flex flex-col w-fit -space-y-2 justify-center items-start">
						<span className="font-regular-8 primary-text">{getCompanyName()}</span>
						<Tippy allowHTML content={uiClientInformationTooltip()} disabled={!isSourceSingleClient} interactive>
							<span className="view-heading !text-lg">{selectedProject.sub_project}</span>
						</Tippy>
					</div>
					<div className={redColumnWrapper} style={{ fontSize: "12px" }}>
						<span className={wrapperSansAesthetics}>
							<FontAwesomeIcon className="w-4 red-text" icon={faCalendarXmark} />
							<span>{dayjs(selectedProject.due_on).format("DD MMM, YYYY")}</span>
						</span>
						<span className={wrapperSansAesthetics}>
							<FontAwesomeIcon className="w-4 red-text" icon={faStopwatch} />
							<span>{dueOnTimeLeft}</span>
						</span>
					</div>
					<div className={columnWrapper}>
						<span className={wrapperSansAesthetics}>
							<FontAwesomeIcon className="w-4 primary-text" icon={faBriefcase} />
							<span>{getCompanyName()}</span>
						</span>
						<Tippy allowHTML className="w-full" content={uiFeesBifurcationTooltip()} disabled={!isSourceSingleClient}>
							<span className={wrapperSansAesthetics}>
								<FontAwesomeIcon className="w-4 primary-text" icon={faIndianRupeeSign} />
								<span>{_quote}</span>
							</span>
						</Tippy>
					</div>
					<div className={columnWrapper}>
						<span className={wrapperSansAesthetics}>
							<FontAwesomeIcon className="w-4 primary-text" icon={faFile} />
							<span>{selectedProject.main_project}</span>
						</span>
						<span className={wrapperSansAesthetics}>
							<FontAwesomeIcon className="w-4 primary-text" icon={faCopy} />
							<span>{selectedProject.sub_project}</span>
						</span>
					</div>
					<div className={columnWrapper}>
						<Tippy allowHTML content={<TooltipList payload={affiliatesNames} />} placement="top">
							<span className={wrapperSansAesthetics}>
								<FontAwesomeIcon className="w-4 primary-text" icon={faBriefcase} />
								<span>{affiliateInitials.join(",") || "No affiliates mapped"}</span>
							</span>
						</Tippy>
						<Tippy allowHTML content={<TooltipList payload={teamsNames} />} placement="bottom">
							<span className={wrapperSansAesthetics}>
								<FontAwesomeIcon className="w-4 primary-text" icon={faUserGroup} />
								<span>{teamsInitials}</span>
							</span>
						</Tippy>
					</div>
					{!selectedProject.government_id && uiMissingGovernmentId()}
				</div>
				<div className="flex w-1/5 justify-end items-center">{uiHamburgerMenu()}</div>
			</div>
		);
	};

	const uiClientInformationTooltip = () => {
		return (
			<div className="flex flex-col w-full p-0 justify-center items-center cursor-pointer font-regular-9 text-white">
				<div className="w-full p-2 space-x-2.5 hovered-rows-white">
					<FontAwesomeIcon icon={faIdBadge} />
					<span>
						{selectedClient.name} ({selectedClient.id})
					</span>
				</div>
				<div className="w-full p-2 space-x-2.5 hovered-rows-white" onClick={() => openWhatsApp(selectedClient.contact_number)}>
					<FontAwesomeIcon icon={faWhatsapp} />
					<span>{selectedClient.phone}</span>
				</div>
				<div className="w-full p-2 space-x-2.5 hovered-rows-white" onClick={() => openEmailClient(selectedClient.email_address)}>
					<FontAwesomeIcon icon={faEnvelope} />
					<span>{selectedClient.email}</span>
				</div>
			</div>
		);
	};

	const uiFeesBifurcationTooltip = () => {
		let totalBifurcatedAffiliateFees = 0;

		const bifurcatedAffiliateFeesUi = String(selectedProject.affiliate_ids)
			.split(",")
			.map((ids) => {
				const obj = apiData.allAffiliates.length
					? apiData.allAffiliates.filter((affiliate) => affiliate.id == ids && affiliate.client_id == selectedClient.id)
					: [];

				if (obj.length > 0) {
					return obj.map((affiliate) => {
						totalBifurcatedAffiliateFees += Number(affiliate.total_fees);

						return (
							<div className="flex w-full justify-between items-center" key={affiliate}>
								<span className="flex w-1/2 justify-start items-center">{affiliate.name}</span>
								<span className="flex w-1/2 justify-end items-center">{affiliate.total_fees}</span>
							</div>
						);
					});
				}
			});

		return (
			<div className="flex flex-col w-full justify-center items-center font-regular-9">
				<div className="flex w-full py-1 justify-between items-center bottom-border">
					<span className="flex w-1/2 justify-start items-center">Invoice</span>
					<span className="flex w-1/2 justify-end items-center">{selectedProject.invoice_fees}</span>
				</div>
				<div className="flex flex-col w-full py-1 justify-center items-center">
					<div className="flex flex-col w-full justify-center items-center">{bifurcatedAffiliateFeesUi}</div>
					<div className="flex w-full pb-1 justify-between items-center bottom-border">
						<span className="flex w-1/2 justify-start items-center">Total</span>
						<span className="flex w-1/2 justify-end items-center">{totalBifurcatedAffiliateFees}</span>
					</div>
				</div>
				<div className="flex w-full py-1 justify-between items-center">
					<span className="flex w-1/2 justify-start items-center">Reimbursement Voucher</span>
					<span className="flex w-1/2 justify-end items-center">{selectedProject.reimbursement_voucher}</span>
				</div>
			</div>
		);
	};

	const uiHamburgerMenu = () => {
		const style = "w-full p-2 space-x-2.5 cursor-pointer font-regular-10 black-text hovered-rows relative";

		const governmentIdClickAction = () => (selectedProject.government_id ? toggleEditGovernmentIdBox() : toggleGovernmentIdBox());

		const governmentIdLabel = selectedProject.government_id ? "Edit Government ID" : "Add Government ID";

		return (
			<Menu as="div" className="w-max relative text-left">
				<MenuButton className="flex w-full justify-between items-center focus:outline-none relative z-40">
					<FontAwesomeIcon className="primary-text" icon={faBars} />
				</MenuButton>
				<MenuItems className="absolute w-max right-0 origin-top-right divide-y divide-gray-100 rounded black-white-background shadow-md focus:outline-none z-50">
					<MenuItem as="div" className={style} onClick={() => toggleChangeQuoteBox()}>
						<FontAwesomeIcon className="w-5 primary-text" icon={faIndianRupeeSign} />
						<span>Change Quote</span>
					</MenuItem>

					<MenuItem as="div" className={style} onClick={() => governmentIdClickAction()}>
						<FontAwesomeIcon className="w-5 primary-text" icon={faIdCardClip} />
						<span>{governmentIdLabel}</span>
					</MenuItem>

					<MenuItem as="div" className={style} onClick={() => saveAsExcel()}>
						<FontAwesomeIcon className="w-5 primary-text" icon={faFileExcel} />
						<span>Export to Excel</span>
					</MenuItem>

					<MenuItem
						as="div"
						className={style}
						hidden={!MyGlobal.HasPermission(MyConstants.Modules.Derived.GenerateInvoice)}
						onClick={() => prepareGenerateInvoiceData()}>
						<FontAwesomeIcon className="w-5 primary-text" icon={faReceipt} />
						<span>Invoice & Reimbursement</span>
					</MenuItem>

					<MenuItem as="div" className={style} onClick={() => toggleMapAffiliatesBox()}>
						<FontAwesomeIcon className="w-5 primary-text" icon={faUserGroup} />
						<span>Map Affiliates</span>
					</MenuItem>

					<MenuItem
						as="div"
						className={style}
						hidden={!MyGlobal.HasPermission(MyConstants.Modules.Derived.PaymentReceived)}
						onClick={() => getCashFlow()}>
						{uiPaymentReceived()}
					</MenuItem>
				</MenuItems>
			</Menu>
		);
	};

	const uiMissingGovernmentId = () => {
		return (
			<div className="flex flex-col w-fit px-2 py-0.5 justify-center items-center rounded blink font-regular-9 red-text red-background-transparent-01 red-border">
				<span>Missing Government ID. </span>
				<span>
					Click <FontAwesomeIcon className="red-text" icon={faBars} />, select <b>Add Government ID</b>
				</span>
			</div>
		);
	};

	const uiPaymentReceived = () => {
		if (mainData.isLoading.paymentReceived) {
			return <SpinnerSmall />;
		} else {
			return (
				<>
					<FontAwesomeIcon className="primary-text w-5" icon={faCoins} />
					<span>Payment Received</span>
				</>
			);
		}
	};

	// Hooks
	useEffect(() => {
		getSupportData();
	}, []);

	// Main UI
	return (
		<>
			<div className="flex flex-col w-full px-5 py-2.5 space-y-3 justify-between items-center relative">
				<div className="flex w-full space-x-3 justify-start items-center">
					<FontAwesomeIcon className="cursor-pointer black-text" icon={faChevronLeft} onClick={() => unmount(false)} />
					{uiClientInformation()}
				</div>
			</div>
			<div className="flex flex-col w-full h-full justify-start items-center transition bottom-border">
				<Tasks reloadProjects={{}} selectedClient={selectedClient} selectedProject={selectedProject} source={source} />
			</div>
		</>
	);
}
