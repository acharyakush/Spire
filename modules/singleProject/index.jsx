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
import { SpinnerBig, TooltipList } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { EditQuote, ManageGovernmentId, ManageAffiliates } from "@/modals/singleProject/project";
import { faBars, faBriefcase, faChevronLeft, faCopy, faEnvelope, faFile, faFileExcel, faIdBadge, faIdCardClip, faIndianRupeeSign, faUserGroup } from "@fortawesome/free-solid-svg-icons";

export default function SingleProject({ client, project, reload, source, unmount }) {
	// Business Logic
	const isSourceSingleClient = source === "Single Client => Single Project";

	const relativeTime = require("dayjs/plugin/relativeTime");
	dayjs.extend(relativeTime);

	const [api, setApi] = useState({
		affiliates: [],
	});

	const [main, setMain] = useState({
		affiliates: { initials: "", tooltip: {} },
		find: "",
		isLoading: false,
	});

	const [mounted, setMounted] = useState({
		generateInvoice: false,
		governmentId: false,
		mainComponent: false,
		manageAffiliates: false,
		updateQuote: false,
	});

	const blankDataWrapper = "flex w-full h-full justify-center items-center contrast-background full-border";

	// Functions
	function openEmailClient(emailAddress) {
		globalThis.window.open(`mailto:${emailAddress}`, "_blank");
	}

	function openWhatsAppWeb(phoneNumber) {
		globalThis.window.open(`https://wa.me/1${phoneNumber}`, "_blank");
	}

	async function setSupportData() {
		setMain((s) => ({ ...s, isLoading: true }));

		try {
			const response = await axios.get(MyConstants.ApiEndpoints.SingleProject.GetSupportData, MyGlobal.GetHeaders());

			if (response.status === 200) {
				if ("affiliates" in response.data) {
					if (project.affiliate_ids) {
						const affiliateIds = String(project.affiliate_ids);
						const initials = MyGlobal.GetAffiliatesInitials(affiliateIds, response.data.affiliates);

						let tooltip = "";

						if (affiliateIds.length) {
							tooltip = affiliateIds.split(",").map((m) => {
								const affiliate = response.data.affiliates.find((f) => f.id == m);

								if (typeof affiliate === "object") {
									const affiliateProject = response.data.affiliatesProjects.filter((f) => f.affiliate_id == affiliate.id && f.project_id == project.id);

									if (Array.isArray(affiliateProject) && affiliateProject.length) {
										const totalFees = affiliateProject.reduce((pv, cv) => pv + Number(cv.total_fees), 0);

										return `${affiliate.name} (${totalFees})`;
									}
								} else {
									return "";
								}
							});
						}

						setApi({ affiliates: response.data.affiliates });
						setMain((s) => ({ ...s, affiliates: { initials, tooltip } }));
					}
				}
				setMounted((s) => ({ ...s, mainComponent: true }));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Single Project => Set Support Data");
		} finally {
			setMain((s) => ({ ...s, isLoading: false }));
		}
	}

	function toggleGovernmentId() {
		setMounted((s) => ({ ...s, governmentId: !s.governmentId }));
	}

	function toggleManageAffiliates() {
		setMounted((s) => ({ ...s, manageAffiliates: !s.manageAffiliates }));
	}

	function toggleUpdateQuote() {
		setMounted((s) => ({ ...s, updateQuote: !s.updateQuote }));
	}

	// UI Components
	function uiClientInformationTooltip() {
		return (
			<div className="flex flex-col w-full p-0 justify-center items-center cursor-pointer font-regular-10 text-white">
				<div className="w-full p-2 space-x-2.5 hovered-rows-white">
					<FontAwesomeIcon icon={faIdBadge} />
					<span>
						{client.name} ({client.id})
					</span>
				</div>
				<div
					className="w-full p-2 space-x-2.5 hovered-rows-white"
					onClick={() => openWhatsAppWeb(client.phone_number)}>
					<FontAwesomeIcon icon={faWhatsapp} />
					<span>{client.phone_number}</span>
				</div>
				<div
					className="w-full p-2 space-x-2.5 hovered-rows-white"
					onClick={() => openEmailClient(client.email_address)}>
					<FontAwesomeIcon icon={faEnvelope} />
					<span>{client.email_address}</span>
				</div>
			</div>
		);
	}

	function uiFeesBifurcationTooltip() {
		return (
			<div className="flex flex-col w-full justify-center items-center font-regular-12">
				<div className="flex w-full py-1 justify-between items-center bottom-border">
					<span className="flex w-1/2 justify-start items-center">Invoice</span>
					<span className="flex w-1/2 justify-end items-center">{project.invoice_fees}</span>
				</div>
				<div className="flex w-full py-1 justify-between items-center">
					<span className="flex w-1/2 justify-start items-center">Reimbursement Voucher</span>
					<span className="flex w-1/2 justify-end items-center">{project.reimburse_voucher}</span>
				</div>
			</div>
		);
	}

	function uiHamburgerMenu() {
		const style = "w-full p-3 space-x-3 cursor-pointer border-y font-regular-11 black-text hovered-rows";

		return (
			<Menu
				as="div"
				className="w-max relative text-left">
				<MenuButton className="flex w-full justify-between items-center focus:outline-none relative z-40">
					<FontAwesomeIcon
						className="primary-text"
						icon={faBars}
					/>
				</MenuButton>
				<MenuItems
					anchor="bottom"
					className="absolute w-max mt-2 rounded bottom-shadow focus:outline-none contrast-background full-border black-text">
					<MenuItem
						as="div"
						className={style}
						onClick={() => {}}>
						<FontAwesomeIcon
							className="w-5 primary-text"
							icon={faFileExcel}
						/>
						<span>Export to Excel</span>
					</MenuItem>

					<MenuItem
						as="div"
						className={style}
						onClick={() => toggleGovernmentId()}>
						<FontAwesomeIcon
							className="w-5 primary-text"
							icon={faIdCardClip}
						/>
						<span>Manage Government ID</span>
					</MenuItem>

					<MenuItem
						as="div"
						className={style}
						onClick={() => toggleManageAffiliates()}>
						<FontAwesomeIcon
							className="w-5 primary-text"
							icon={faUserGroup}
						/>
						<span>Manage Affiliates</span>
					</MenuItem>

					<MenuItem
						as="div"
						className={style}
						onClick={() => toggleUpdateQuote()}>
						<FontAwesomeIcon
							className="w-5 primary-text"
							icon={faIndianRupeeSign}
						/>
						<span>Update Quote</span>
					</MenuItem>
				</MenuItems>
			</Menu>
		);
	}

	function uiMissingGovernmentId() {
		return (
			<div className="flex flex-col w-fit px-2.5 space-y-1 justify-center items-center font-normal blink red-text red-tag-transparent-01">
				<span>Missing Government ID. </span>
				<span>
					Click{" "}
					<FontAwesomeIcon
						className="red-text"
						icon={faBars}
					/>
					, Select <b>Manage Government ID</b>
				</span>
			</div>
		);
	}

	function uiProjectInformationBlock() {
		const wrapperSansAesthetics = "flex w-full space-x-1.5 justify-start items-center";

		const columnWrapper = "flex flex-col justify-center items-center cursor-pointer primary-tag-transparent-01";

		// const redColumnWrapper = project.status === MyConstants.Statuses.Projects.Completed ? "hidden" : "flex flex-col justify-center items-center cursor-pointer font-normal red-tag-transparent-01";

		// const dueOnTimeLeft = dayjs(project.due_on).format("DD-MM-YYYY") == dayjs().format("DD-MM-YYYY") ? "Today" : dayjs(project.due_on).fromNow();

		const quote = Number(project.invoice_fees);
		const companyName = String(project.company_name).length > 25 ? String(project.company_name).substring(0, 25) + "..." : String(project.company_name) + "'s";

		return (
			<div className="flex w-full justify-between items-center">
				<div className="flex w-fit space-x-2.5 justify-start items-center">
					<div className="flex flex-col w-fit -space-y-2 justify-center items-start">
						<span className="font-medium-10 primary-text">{companyName}</span>
						<Tippy
							content={uiClientInformationTooltip()}
							disabled={!isSourceSingleClient}
							interactive
							placement="bottom">
							<span className="view-heading">{project.sub_project_name}</span>
						</Tippy>
					</div>
					{/* <div className={redColumnWrapper}>
						<span className={wrapperSansAesthetics}>
							<FontAwesomeIcon className="w-4 red-text" icon={faCalendarXmark} />
							<span>{dayjs(project.due_on).format("DD MMM, YYYY")}</span>
						</span>
						<span className={wrapperSansAesthetics}>
							<FontAwesomeIcon className="w-4 red-text" icon={faStopwatch} />
							<span>{dueOnTimeLeft}</span>
						</span>
					</div> */}
					<div className={columnWrapper}>
						<span className={wrapperSansAesthetics}>
							<FontAwesomeIcon
								className="w-4 primary-text"
								icon={faBriefcase}
							/>
							<span>{companyName}</span>
						</span>
						<Tippy
							className="w-full"
							content={uiFeesBifurcationTooltip()}
							disabled={!isSourceSingleClient}
							placement="bottom">
							<span className={wrapperSansAesthetics}>
								<FontAwesomeIcon
									className="w-4 primary-text"
									icon={faIndianRupeeSign}
								/>
								<span>{quote}</span>
							</span>
						</Tippy>
					</div>
					<div className={columnWrapper}>
						<span className={wrapperSansAesthetics}>
							<FontAwesomeIcon
								className="w-4 primary-text"
								icon={faFile}
							/>
							<span>{project.main_project_name}</span>
						</span>
						<span className={wrapperSansAesthetics}>
							<FontAwesomeIcon
								className="w-4 primary-text"
								icon={faCopy}
							/>
							<span>{project.sub_project_name}</span>
						</span>
					</div>
					<div className={columnWrapper}>
						<Tippy
							content={Object.keys(main.affiliates.tooltip).length && <TooltipList payload={main.affiliates.tooltip} />}
							disabled={!Object.keys(main.affiliates.tooltip).length}
							placement="top">
							<span className={wrapperSansAesthetics}>
								<FontAwesomeIcon
									className="w-4 primary-text"
									icon={faBriefcase}
								/>
								<span>{main.affiliates.initials || "No affiliates mapped"}</span>
							</span>
						</Tippy>
						<Tippy
							content={<TooltipList payload={project.team_names} />}
							placement="bottom">
							<span className={wrapperSansAesthetics}>
								<FontAwesomeIcon
									className="w-4 primary-text"
									icon={faUserGroup}
								/>
								<span>{String(project.team_names_initials)}</span>
							</span>
						</Tippy>
					</div>
					{!project.government_id && uiMissingGovernmentId()}
				</div>
				<div className="flex w-fit justify-end items-center">{uiHamburgerMenu()}</div>
			</div>
		);
	}

	// Hooks
	useEffect(() => {
		setSupportData();
	}, []);

	// Main UI
	if (main.isLoading) {
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
						<FontAwesomeIcon
							className="cursor-pointer black-text"
							icon={faChevronLeft}
							onClick={() => unmount(false)}
						/>
						{uiProjectInformationBlock()}
					</div>
				</div>
				<div className="flex flex-col w-full h-full justify-start items-center transition bottom-border">
					<Tasks
						client={client}
						project={project}
						source={source}
					/>
				</div>

				{mounted.governmentId && (
					<ManageGovernmentId
						mount={mounted.governmentId}
						project={project}
						reload={reload}
						unmount={toggleGovernmentId}
					/>
				)}

				{mounted.manageAffiliates && (
					<ManageAffiliates
						mount={mounted.manageAffiliates}
						project={project}
						reload={reload}
						unmount={toggleManageAffiliates}
					/>
				)}

				{mounted.updateQuote && (
					<EditQuote
						mount={mounted.updateQuote}
						project={project}
						reload={reload}
						unmount={toggleUpdateQuote}
					/>
				)}
			</>
		);
	}
}
