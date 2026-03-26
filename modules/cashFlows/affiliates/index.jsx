"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import NewAffiliate from "./NewAffiliate";
import Transactions from "./Transactions";
import { ApiEndpoints, BaseModules } from "@/utilities/constants";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Badge, BadgeGreenLarge, BadgeSmall, Spinner } from "@/components/Elements";
import { faBank, faChevronRight, faCoins, faEnvelope, faPhone, faPlusCircle } from "@fortawesome/free-solid-svg-icons";

export default function Affiliates({ unmount }) {
	// Business Logic

	const [api, setApi] = useState({
		affiliates: [],
	});

	const [main, setMain] = useState({
		find: "",
		isLoading: false,
		selectedAffiliate: {
			details: {
				bank_account_holder_name: "",
				bank_account_number: "",
				email_address: "",
				ifsc: "",
				joined_on: "",
				name: "",
				phone_number: "",
				upi_id: "",
			},
			id: 0,
			projects: [],
			selectedProject: {},
		},
	});

	const [mounted, setMounted] = useState({
		mainComponent: false,
		newAffiliate: false,
		transactions: false,
	});

	const thisView = BaseModules.Affiliates;
	const blankDataWrapper = "flex w-full h-full justify-center items-center contrast-background full-border";

	// Functions
	function detectKeystrokes(event) {
		switch (true) {
			case event.ctrlKey && event.key == "f":
				event.preventDefault();
				document.getElementById("findBox").focus();
				break;
		}
	}

	function getIconOrBadge() {
		if (main.isLoading) {
			return (
				<span className="pl-5 relative">
					<Spinner />
				</span>
			);
		} else {
			return api.affiliates.length > 0 && <Badge value={api.affiliates.length} />;
		}
	}

	function openEmailClient() {
		globalThis.window.open(`mailto:${main.selectedAffiliate.details.email_address}`, "_blank");
	}

	function openWhatsAppWeb() {
		globalThis.window.open(`https://wa.me/1${main.selectedAffiliate.details.phone_number}`, "_blank");
	}

	function setSelectedAffiliate(object) {
		setMain((s) => ({
			...s,
			selectedAffiliate: {
				...s.selectedAffiliate,
				details: object,
				id: object.id,
				projects: object.projects,
			},
		}));
	}

	async function setSupportData(action) {
		setMain((s) => ({ ...s, isLoading: true }));

		try {
			const response = await axios.get(ApiEndpoints.Affiliates.GetAffiliates, MyGlobal.GetHeaders());

			if (response.status === 200) {
				const affiliates = [];

				if (response.data.affiliates.length) {
					response.data.affiliates.forEach((fe) => {
						const projects = [];

						response.data.affiliatesProjects
							.filter((f) => f.affiliate_id == fe.id)
							.forEach((_fe) => {
								let companyName = "";
								let mainProjectName = "";

								const company = response.data.companies.find((f) => f.client_id == _fe.client_id);

								if (typeof company === "object") {
									companyName = company.name;
								}

								const project = response.data.projects.find((f) => f.client_id == _fe.client_id && f.id == _fe.project_id);

								if (typeof project === "object") {
									const mainProject = response.data.mainProjects.find((f) => f.id == project.main_project_id);

									if (typeof mainProject === "object") {
										mainProjectName = mainProject.name;
									}
								}

								let paidFees = 0;

								response.data.transactions.forEach((__fe) => {
									if (__fe.project_id == _fe.project_id) {
										paidFees += Number(__fe.amount);
									}
								});

								const totalFees = Number(_fe.total_fees);
								const pendingFees = MyGlobal.ThousandSeparator(totalFees - paidFees);

								projects.push({
									..._fe,
									company_name: companyName,
									main_project_name: mainProjectName,
									paid_fees: paidFees,
									pending_fees: pendingFees,
									total_fees: totalFees,
								});
							});

						affiliates.push({ ...fe, projects });
					});

					setApi({ affiliates });

					if (action && action === "reload-root-statistics") {
						const obj = affiliates.find((f) => f.id === main.selectedAffiliate.id);

						if (typeof obj === "object") {
							const selectedProject = obj.projects.find((f) => f.id === main.selectedAffiliate.selectedProject.id);

							setMain((s) => ({
								...s,
								selectedAffiliate: {
									...s.selectedAffiliate,
									details: obj,
									id: obj.id,
									projects: obj.projects,
									selectedProject,
								},
							}));
						}
					} else {
						setSelectedAffiliate(affiliates.at(0));
					}
				}
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, `${thisView} => Get All Affiliates`);
		} finally {
			setMain((s) => ({ ...s, isLoading: false }));
		}
	}

	function toggleNewAffiliate() {
		setMounted((s) => ({ ...s, newAffiliate: !s.newAffiliate }));
	}

	function toggleTransactions(object) {
		setMain((s) => ({ ...s, selectedAffiliate: { ...s.selectedAffiliate, selectedProject: object ?? {} } }));
		setMounted((s) => ({ ...s, transactions: object ? true : false }));
	}

	// UI Components
	function uiBody() {
		return (
			<div className="flex w-full h-full justify-center items-start">
				<div className="flex flex-col w-[10%] space-y-2.5 mx-5 justify-start items-center">{uiModules()}</div>
				<div className="flex flex-col w-[90%] h-[calc(100vh-100px)] mr-5 justify-start items-center rounded shadow contrast-background">{uiSelectedAffiliate()}</div>
			</div>
		);
	}

	function uiCards() {
		return main.selectedAffiliate.projects.map((m, i) => {
			return (
				<div className="flex flex-col w-full p-4 space-y-3 justify-center items-center relative rounded shadow full-border primary-background-transparent-01" key={m.id}>
					<span className="absolute -left-5 -top-2.5">
						<BadgeGreenLarge value={i + 1} />
					</span>
					<span className="font-medium-16 black-text">{m.company_name}</span>
					<div className="flex space-x-2.5 justify-center items-center font-regular-14 black-text">
						<span>{m.main_project_name}</span>
						<BadgeSmall value={m.project_id} />
					</div>
					<div className="flex flex-col w-full p-4 space-y-2 rounded shadow contrast-background">
						<div className="flex w-full justify-between items-center">
							<span className="font-regular-12">Total Pending</span>
							<span className="font-medium-12 red-text">{MyGlobal.ThousandSeparator(m.pending_fees)}</span>
						</div>
						<div className="full-border" />
						<div className="flex w-full justify-between items-center">
							<span className="font-regular-12">Total Paid</span>
							<span className="font-medium-12 green-text">{MyGlobal.ThousandSeparator(m.paid_fees)}</span>
						</div>
						<div className="full-border" />
						<div className="flex w-full justify-between items-center">
							<span className="font-regular-12">Total Fees</span>
							<span className="font-medium-14 black-text">{MyGlobal.ThousandSeparator(m.total_fees)}</span>
						</div>
					</div>
					<div className="absolute -bottom-5 cursor-pointer group" onClick={() => toggleTransactions(m)}>
						<span className="flex w-fit px-4 py-2 justify-center items-center rounded-full text-white font-medium-11 primary-background primary-border transition-all duration-500 ease-in-out">
							<FontAwesomeIcon icon={faCoins} />
							<span className="flex justify-center items-center max-w-0 overflow-hidden opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-3 transition-all duration-500 ease-in-out whitespace-nowrap">Transactions</span>
						</span>
					</div>
				</div>
			);
		});
	}

	function uiMain() {
		if (main.isLoading) {
			return (
				<div className={blankDataWrapper}>
					<span className="font-regular-12 gray-text">Loading...</span>
				</div>
			);
		} else if (!api.affiliates.length) {
			return (
				<div className={blankDataWrapper}>
					<span className="font-regular-12 gray-text">No affiliates registered.</span>
				</div>
			);
		} else {
			return uiBody();
		}
	}

	function uiModules() {
		const modules = api.affiliates.length ? [...api.affiliates] : [];

		return modules.map((m, i) => {
			const selectedStyle = m.id == main.selectedAffiliate.id ? "primary-border primary-background-transparent-01 primary-text" : "full-border bg-white black-text";

			const wrapper = `flex w-full px-4 py-2 justify-between items-center rounded shadow ${selectedStyle} font-regular-10 hovered-rows`;

			return (
				<button className={wrapper} key={i} onClick={() => setSelectedAffiliate(m)}>
					{m.name}
				</button>
			);
		});
	}

	function uiNew() {
		return (
			<button className="space-x-1.5 primary-button-transparent-background" onClick={() => toggleNewAffiliate()}>
				<FontAwesomeIcon icon={faPlusCircle} />
				<span>New</span>
			</button>
		);
	}

	function uiSelectedAffiliate() {
		if (main.selectedAffiliate.id == 0) {
			return <div className="flex flex-col w-full h-full px-5 py-2.5 space-y-5 justify-center items-center font-medium-12 gray-text">Select an affiliate</div>;
		} else {
			const showAccountHolderName = main.selectedAffiliate.details.bank_account_holder_name && main.selectedAffiliate.details.bank_account_holder_name.length > 0;

			const showAccountNumber = main.selectedAffiliate.details.bank_account_number && String(main.selectedAffiliate.details.bank_account_number).length > 0;

			const showIfsc = main.selectedAffiliate.details.ifsc && main.selectedAffiliate.details.ifsc.length > 0;

			const showEmailAddress = main.selectedAffiliate.details.email_address && main.selectedAffiliate.details.email_address.length > 0;

			const showPhoneNumber = main.selectedAffiliate.details.phone_number && String(main.selectedAffiliate.details.phone_number).length > 0;

			const showUpiId = main.selectedAffiliate.details.upi_id && main.selectedAffiliate.details.upi_id.length > 0;

			const wrapper = "flex h-[22px] space-x-2.5 justify-center items-center primary-text";

			const accountHolderNameWrapper = showAccountHolderName ? `${wrapper} visible` : "h-[22px] invisible";
			const accountNumberWrapper = showAccountNumber ? `${wrapper} visible` : "h-[22px] invisible";
			const ifscWrapper = showIfsc ? `${wrapper} visible` : "h-[22px] invisible";

			const emailAddressWrapper = showEmailAddress ? `${wrapper} visible` : "h-[22px] invisible";
			const phoneNumberWrapper = showPhoneNumber ? `${wrapper} visible` : "h-[22px] invisible";
			const upiIdWrapper = showUpiId ? `${wrapper} visible` : "h-[22px] invisible";

			return (
				<div className="flex flex-col w-full h-full px-5 py-2.5 space-y-5 justify-start items-center">
					<div className="flex w-full justify-between items-center">
						<div className="flex flex-col w-1/3 justify-center items-start">
							<div className="flex w-fit space-x-2.5 justify-center items-center">
								<span className="view-heading">{main.selectedAffiliate.details.name}</span>
								{main.selectedAffiliate.projects.length > 0 && <Badge value={main.selectedAffiliate.projects.length} />}
							</div>

							<div className="flex w-fit space-x-2 justify-start items-center gray-text">
								<span className="font-regular-11">Associated since</span>
								<span className="font-semibold-12">{dayjs(main.selectedAffiliate.details.joined_on).format("DD MMM, YYYY")}</span>
							</div>
						</div>

						<div className="flex flex-col w-1/3 space-y-2 justify-center items-start">
							<div className={accountHolderNameWrapper}>
								<span className="w-40 font-regular-11">Account Holder Name</span>
								<span className="cursor-pointer font-semibold-12 primary-text">{main.selectedAffiliate.details.bank_account_holder_name}</span>
							</div>

							<div className={accountNumberWrapper}>
								<span className="w-40 font-regular-11">Account Number</span>
								<span className="cursor-pointer font-semibold-12 primary-text">{main.selectedAffiliate.details.bank_account_number}</span>
							</div>

							<div className={ifscWrapper}>
								<span className="w-40 font-regular-11">IFS Code</span>
								<span className="font-semibold-12 primary-text">{main.selectedAffiliate.details.ifsc}</span>
							</div>
						</div>

						<div className="flex flex-col w-1/3 space-y-2 justify-center items-start">
							<div className={phoneNumberWrapper}>
								<div className="flex w-fit justify-start items-center gray-text">
									<span className="w-32 font-regular-11">Contact Number</span>
									<span className="cursor-pointer font-semibold-12 primary-text" onClick={() => openWhatsAppWeb()}>
										{main.selectedAffiliate.details.phone_number}
									</span>
								</div>
							</div>

							<div className={emailAddressWrapper}>
								<div className="flex w-fit justify-start items-center gray-text">
									<span className="w-32 font-regular-11">Email Address</span>
									<span className="cursor-pointer font-semibold-12 primary-text" onClick={() => openEmailClient()}>
										{main.selectedAffiliate.details.email_address}
									</span>
								</div>
							</div>

							<div className={upiIdWrapper}>
								<div className="flex w-fit justify-start items-center gray-text">
									<span className="w-32 font-regular-11">UPI ID</span>
									<span className="font-semibold-12 primary-text">{main.selectedAffiliate.details.upi_id}</span>
								</div>
							</div>
						</div>
					</div>
					<div className="w-full h-[calc(100%-105px)] p-5 overflow-y-auto scrollbar-gutter">
						<div className="w-full grid grid-cols-3 gap-x-20 gap-y-16 justify-items-start items-center">{uiCards()}</div>
					</div>
				</div>
			);
		}
	}

	// Hooks
	useEffect(() => {
		setSupportData();

		globalThis.addEventListener("keydown", detectKeystrokes);
		return () => globalThis.removeEventListener("keydown", detectKeystrokes);
	}, []);

	// Main UI
	if (mounted.newAffiliate) {
		return <NewAffiliate reload={setSupportData} unmount={toggleNewAffiliate} />;
	} else if (mounted.transactions) {
		return <Transactions project={main.selectedAffiliate.selectedProject} reload={setSupportData} unmount={toggleTransactions} />;
	} else {
		return (
			<div className="flex flex-col w-full h-full justify-start items-center">
				<div className="flex w-full px-5 py-2.5 justify-between items-center">
					<div className="flex w-full space-x-2 justify-start items-center">
						<span className="cursor-pointer hover:underline hover:underline-offset-8 hover:decoration-[--primary] view-heading" onClick={() => unmount()}>
							{BaseModules.CashFlow}
						</span>
						<FontAwesomeIcon className="gray-text" icon={faChevronRight} size="xs" />
						<span className="view-heading">{BaseModules.Affiliates}</span>
						{getIconOrBadge()}
					</div>
					<div className="flex w-1/2 space-x-2 justify-end items-center">{uiNew()}</div>
				</div>
				{uiMain()}
			</div>
		);
	}
}
