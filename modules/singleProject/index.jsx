"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import dayjs from "dayjs";
import axios from "axios";
import Tasks from "./Tasks";
import Tippy from "@tippyjs/react";
import MyConstants from "@/utilities/constants";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { SpinnerBig, SpinnerSmall, TooltipList } from "@/components/Elements";
import { EditQuote, ManageGovernmentId } from "@/modals/singleProject/project";
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
	faStopwatch,
	faUserGroup,
} from "@fortawesome/free-solid-svg-icons";

export default function SingleProject({ reloadProjects, reloadNotes, selectedClient, selectedProject, source, unmount }) {
	// Business Logic
	const isSourceSingleClient = source === "Single Client => Single Project";

	const relativeTime = require("dayjs/plugin/relativeTime");
	dayjs.extend(relativeTime);

	const [apiData, setApiData] = useState({
		allAffiliates: [],
		allCompanies: [],
		allCashFlows: [],
		allMainProjects: [],
		allSubProjects: [],
		allInvoices: [],
		ownerFirms: [],
		ownerFirmsBanks: [],
	});

	const [hasMounted, setHasMounted] = useState({
		generateInvoice: false,
		governmentId: false,
		mainComponent: false,
		mapAffiliates: false,
		notesBar: false,
		updateQuote: false,
	});

	const [mainData, setMainData] = useState({
		isLoading: false,
		searchTerm: "",
	});

	const blankDataWrapper = "flex w-full h-full justify-center items-center contrast-background full-border";

	// Functions
	const getCompanyName = () => {
		if (apiData.allCompanies.length) {
			return apiData.allCompanies.filter((company) => company.id == selectedProject.company_id).at(0).name;
		} else {
			return "";
		}
	};

	const getMainProjectName = () => {
		if (apiData.allMainProjects.length) {
			return apiData.allMainProjects.filter((mainProject) => mainProject.id == selectedProject.main_project_id).at(0).name;
		} else {
			return "";
		}
	};

	const getSubProjectName = () => {
		if (apiData.allSubProjects.length) {
			return apiData.allSubProjects.filter((subProject) => subProject.id == selectedProject.sub_project_id).at(0).name;
		} else {
			return "";
		}
	};

	const getSupportData = async () => {
		setMainData((old) => ({ ...old, isLoading: true }));

		try {
			const response = await axios.get(MyConstants.ApiEndpoints.SingleProject.GetSupportData, MyGlobal.GetHeaders());

			if (response.status === 200) {
				setApiData({
					allAffiliates: [],
					allCompanies: response.data.companies,
					allCashFlows: [],
					allMainProjects: response.data.mainProjects,
					allSubProjects: response.data.subProjects,
					allInvoices: response.data.invoices,
					ownerFirms: response.data.ownerFirms,
					ownerFirmsBanks: response.data.ownerFirmsBanks,
				});

				setHasMounted((old) => ({ ...old, mainComponent: true }));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Single Project => Get Support Data");
		} finally {
			setMainData((old) => ({ ...old, isLoading: false }));
		}
	};

	const openEmailClient = (emailAddress) => {
		globalThis.window.open(`mailto:${emailAddress}`, "_blank");
	};

	const openWhatsApp = (phoneNumber) => {
		globalThis.window.open(`https://wa.me/1${phoneNumber}`, "_blank");
	};

	const toggleGovernmentIdBox = () => {
		setHasMounted((old) => ({ ...old, governmentId: !hasMounted.governmentId }));
	};

	const toggleUpdateQuoteBox = () => {
		setHasMounted((old) => ({ ...old, updateQuote: !hasMounted.updateQuote }));
	};

	// UI Components
	const uiClientInformationTooltip = () => {
		return (
			<div className="flex flex-col w-full p-0 justify-center items-center cursor-pointer font-regular-12 text-white">
				<div className="w-full p-2 space-x-2.5 hovered-rows-white">
					<FontAwesomeIcon icon={faIdBadge} />
					<span>
						{selectedClient.name} ({selectedClient.id})
					</span>
				</div>
				<div className="w-full p-2 space-x-2.5 hovered-rows-white" onClick={() => openWhatsApp(selectedClient.phone_number)}>
					<FontAwesomeIcon icon={faWhatsapp} />
					<span>{selectedClient.phone_number}</span>
				</div>
				<div className="w-full p-2 space-x-2.5 hovered-rows-white" onClick={() => openEmailClient(selectedClient.email_address)}>
					<FontAwesomeIcon icon={faEnvelope} />
					<span>{selectedClient.email_address}</span>
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
			<div className="flex flex-col w-full justify-center items-center font-regular-12">
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
		const style = "w-full p-3 space-x-3 cursor-pointer border-y font-regular-11 black-text hovered-rows";

		return (
			<Menu as="div" className="w-max relative text-left">
				<MenuButton className="flex w-full justify-between items-center focus:outline-none relative z-40">
					<FontAwesomeIcon className="primary-text" icon={faBars} />
				</MenuButton>
				<MenuItems anchor="bottom" className="absolute w-max mt-2 rounded bottom-shadow focus:outline-none contrast-background full-border black-text">
					<MenuItem as="div" className={style} onClick={() => saveAsExcel()}>
						<FontAwesomeIcon className="w-5 primary-text" icon={faFileExcel} />
						<span>Export to Excel</span>
					</MenuItem>

					<MenuItem as="div" className={style} onClick={() => toggleGovernmentIdBox()}>
						<FontAwesomeIcon className="w-5 primary-text" icon={faIdCardClip} />
						<span>Manage Government ID</span>
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

					<MenuItem as="div" className={style} onClick={() => toggleUpdateQuoteBox()}>
						<FontAwesomeIcon className="w-5 primary-text" icon={faIndianRupeeSign} />
						<span>Update Quote</span>
					</MenuItem>
				</MenuItems>
			</Menu>
		);
	};

	const uiMissingGovernmentId = () => {
		return (
			<div className="flex flex-col w-fit space-y-1 justify-center items-center font-normal blink red-text red-tag-transparent-01">
				<span>Missing Government ID. </span>
				<span>
					Click <FontAwesomeIcon className="red-text" icon={faBars} />, Select <b>Add Government ID</b>
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
					<FontAwesomeIcon className="w-5 primary-text" icon={faCoins} />
					<span>Payment Received</span>
				</>
			);
		}
	};

	const uiProjectInformationBlock = () => {
		const wrapperSansAesthetics = "flex w-full space-x-1.5 justify-start items-center";

		const columnWrapper = "flex flex-col justify-center items-center cursor-pointer primary-tag-transparent-01";

		const redColumnWrapper = "flex flex-col justify-center items-center cursor-pointer font-normal red-tag-transparent-01";

		const dueOnTimeLeft =
			dayjs(selectedProject.due_on).format("DD-MM-YYYY") == dayjs().format("DD-MM-YYYY") ? "Today" : dayjs(selectedProject.due_on).fromNow();

		const quote = Number(selectedProject.quote);
		const teamsNames = MyGlobal.GetAnyDataFromId(selectedProject.teams, "full_name");
		const affiliateInitials = MyGlobal.GetAffiliatesInitials(selectedProject.affiliate_ids, apiData.allAffiliates);

		const affiliatesNames = selectedProject.affiliate_ids
			? selectedProject.affiliate_ids.split(",").map((id) => {
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
			  })
			: "";

		return (
			<div className="flex w-full justify-between items-center">
				<div className="flex w-4/5 space-x-2.5 justify-start items-center">
					<div className="flex flex-col w-fit -space-y-2 justify-center items-start">
						<span className="font-medium-10 primary-text">{getCompanyName()}</span>
						<Tippy allowHTML content={uiClientInformationTooltip()} disabled={!isSourceSingleClient} interactive>
							<span className="view-heading">{getSubProjectName()}</span>
						</Tippy>
					</div>
					<div className={redColumnWrapper}>
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
								<span>{MyGlobal.ThousandSeparator(quote)}</span>
							</span>
						</Tippy>
					</div>
					<div className={columnWrapper}>
						<span className={wrapperSansAesthetics}>
							<FontAwesomeIcon className="w-4 primary-text" icon={faFile} />
							<span>{getMainProjectName()}</span>
						</span>
						<span className={wrapperSansAesthetics}>
							<FontAwesomeIcon className="w-4 primary-text" icon={faCopy} />
							<span>{getSubProjectName()}</span>
						</span>
					</div>
					<div className={columnWrapper}>
						<Tippy allowHTML content={<TooltipList payload={affiliatesNames} />} disabled={!affiliatesNames} placement="top">
							<span className={wrapperSansAesthetics}>
								<FontAwesomeIcon className="w-4 primary-text" icon={faBriefcase} />
								<span>{affiliateInitials || "No affiliates mapped"}</span>
							</span>
						</Tippy>
						<Tippy allowHTML content={<TooltipList payload={teamsNames} />} placement="bottom">
							<span className={wrapperSansAesthetics}>
								<FontAwesomeIcon className="w-4 primary-text" icon={faUserGroup} />
								<span>{MyGlobal.GetMultipleInitials(teamsNames)}</span>
							</span>
						</Tippy>
					</div>
					{!selectedProject.government_id && uiMissingGovernmentId()}
				</div>
				<div className="flex w-1/5 justify-end items-center">{uiHamburgerMenu()}</div>
			</div>
		);
	};

	// Hooks
	useEffect(() => {
		getSupportData();
	}, []);

	// Main UI
	if (mainData.isLoading) {
		return (
			<div className={blankDataWrapper}>
				<SpinnerBig />
			</div>
		);
	} else {
		return (
			<>
				<div className="flex flex-col w-full px-5 py-2.5 space-y-3 justify-between items-center relative">
					<div className="flex w-full space-x-3 justify-start items-center">
						<FontAwesomeIcon className="cursor-pointer black-text" icon={faChevronLeft} onClick={() => unmount(false)} />
						{uiProjectInformationBlock()}
					</div>
				</div>
				<div className="flex flex-col w-full h-full justify-start items-center transition bottom-border">
					<Tasks selectedClient={selectedClient} selectedProject={selectedProject} source={source} />
				</div>

				{hasMounted.governmentId && (
					<ManageGovernmentId
						mount={hasMounted.governmentId}
						reloadProjects={reloadProjects}
						selectedProject={selectedProject}
						unmount={toggleGovernmentIdBox}
					/>
				)}

				{hasMounted.updateQuote && (
					<EditQuote
						mount={hasMounted.updateQuote}
						reloadProjects={reloadProjects}
						selectedProject={selectedProject}
						unmount={toggleUpdateQuoteBox}
					/>
				)}
			</>
		);
	}
}
