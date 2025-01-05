"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import MyConstants from "@/utilities/constants";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Badge, BadgeSmall, SpinnerBig } from "@/components/Elements";
import { faAt, faBank, faPhone, faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import NewAffiliate from "./NewAffiliate";

export default function Affiliates() {
	// Business Logic

	const [apiData, setApiData] = useState({
		allAffiliates: [],
		allClients: [],
		allCompanies: [],
		allProjects: [],
		mainProjects: [],
		subProjects: [],
	});

	const [mounted, setMounted] = useState({
		mainComponent: false,
		newAffiliate: false,
	});

	const [main, setMain] = useState({
		isLoading: false,
		searchTerm: "",
		selectedAffiliate: { details: {}, id: 0, projects: [] },
	});

	const thisView = MyConstants.Modules.Base.Affiliates;
	const blankDataWrapper = "flex w-full h-full justify-center items-center contrast-background full-border";

	// Functions
	function detectKeystrokes(event) {
		switch (true) {
			case event.ctrlKey && event.key == "f":
				event.preventDefault();
				document.getElementById("searchBox").focus();
				break;
		}
	}

	function getClientName(id) {
		if (apiData.allClients.length) {
			return apiData.allClients.filter((f) => f.id == id).at(0).name;
		} else {
			return "";
		}
	}

	function getCompanyName(id) {
		if (apiData.allCompanies.length) {
			return apiData.allCompanies.filter((f) => f.id == id).at(0).name;
		} else {
			return "";
		}
	}

	function getMainProjectName(id) {
		if (apiData.mainProjects.length) {
			return apiData.mainProjects.filter((f) => f.id == id).at(0).name;
		} else {
			return "";
		}
	}

	function getSubProjectName(id) {
		if (apiData.subProjects.length) {
			return apiData.subProjects.filter((f) => f.id == id).at(0).name;
		} else {
			return "";
		}
	}

	async function getSupportData() {
		setMain((s) => ({ ...s, isLoading: true }));

		try {
			const response = await axios.get(MyConstants.ApiEndpoints.Affiliates.GetAffiliates, MyGlobal.GetHeaders());

			if (response.status === 200) {
				const allProjects = response.data.allProjects;
				const companies = response.data.companies;
				const mainProjects = response.data.mainProjects;

				const allAffiliates = response.data.affiliates.map((m) => {
					const affiliatesProjects = response.data.affiliatesProjects.filter((f) => f.affiliate_id == m.id);

					const revised = [];

					affiliatesProjects.forEach((fe) => {
						const project = allProjects.find((f) => f.client_id == fe.client_id && f.id == fe.project_id);

						const company = companies.find((f) => f.client_id == fe.client_id);
						const mainProject = mainProjects.find((f) => f.id == project.main_project_id);

						revised.push({ ...fe, company: company.name, project: mainProject.name });
					});

					return { ...m, projects: revised };
				});

				setApiData({
					allAffiliates,
					allClients: response.data.clients,
					allCompanies: companies,
					allProjects,
					mainProjects,
					subProjects: response.data.subProjects,
				});

				setMounted((s) => ({ ...s, mainComponent: true }));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, `${thisView} => Get All Affiliates`);
		} finally {
			setMain((s) => ({ ...s, isLoading: false }));
		}
	}

	function openEmailClient() {
		globalThis.window.open(`mailto:${main.selectedAffiliate.details.email_address}`, "_blank");
	}

	function openWhatsAppWeb() {
		globalThis.window.open(`https://wa.me/1${main.selectedAffiliate.details.phone_number}`, "_blank");
	}

	function setSelectedAffiliate(object) {
		setMain((s) => ({ ...s, selectedAffiliate: { details: object, id: object.id, projects: object.projects } }));
	}

	function toggleNewAffiliateView() {
		setMounted((s) => ({ ...s, newAffiliate: !mounted.newAffiliate }));
	}

	// UI Components
	function uiBody() {
		return (
			<div className="flex w-full h-full justify-center items-start">
				<div className="flex flex-col w-[10%] space-y-2.5 mx-5 justify-start items-center">{uiModules()}</div>
				<div className="flex flex-col w-[90%] h-full mr-5 justify-start items-center rounded shadow contrast-background">{uiSelectedAffiliate()}</div>
			</div>
		);
	}

	function uiCards() {
		return main.selectedAffiliate.projects.map((m) => {
			const totalFees = Number(m.total_fees);
			const paidFees = Number(m.paid_fees);
			const pendingFees = MyGlobal.ThousandSeparator(totalFees - paidFees);

			return (
				<div
					className="flex flex-col w-1/3 p-4 space-y-3 justify-center items-center rounded shadow primary-border primary-background-transparent-01"
					key={m.id}>
					<span className="font-medium-16 black-text">{m.company}</span>
					<div className="flex space-x-2.5 justify-center items-center font-regular-14 black-text">
						<span>{m.project}</span>
						<BadgeSmall value={m.project_id} />
					</div>
					<div className="flex flex-col w-full p-4 space-y-2 rounded shadow contrast-background">
						<div className="flex w-full justify-between items-center">
							<span className="font-regular-12">Total Pending</span>
							<span className="font-medium-12 red-text">{MyGlobal.ThousandSeparator(pendingFees)}</span>
						</div>
						<div className="full-border" />
						<div className="flex w-full justify-between items-center">
							<span className="font-regular-12">Total Paid</span>
							<span className="font-medium-12 green-text">{MyGlobal.ThousandSeparator(paidFees)}</span>
						</div>
						<div className="full-border" />
						<div className="flex w-full justify-between items-center">
							<span className="font-regular-12">Total Fees</span>
							<span className="font-medium-14 black-text">{MyGlobal.ThousandSeparator(totalFees)}</span>
						</div>
					</div>
					<div className="flex flex-col w-full p-4 rounded shadow contrast-background">
						<div className="flex w-full justify-between items-center">
							<span className="font-regular-12">Payment Mode</span>
							<span className="font-medium-12 black-text">
								<BadgeSmall value={m.payment_mode} />
							</span>
						</div>
					</div>
				</div>
			);
		});
	}

	function uiMain() {
		if (main.isLoading) {
			return (
				<div className={blankDataWrapper}>
					<SpinnerBig />
				</div>
			);
		} else if (!apiData.allAffiliates.length) {
			return (
				<div className={blankDataWrapper}>
					<span className="font-regular-12 gray-text">No affiliates registered.</span>
				</div>
			);
		} else if (mounted.newAffiliate) {
			return <NewAffiliate reloadAffiliates={getSupportData} unmount={toggleNewAffiliateView} />;
		} else {
			return (
				<div className="flex flex-col w-full h-full justify-start items-center">
					<div className="flex w-full px-5 py-2.5 justify-between items-center">
						<div className="flex w-1/2 space-x-2 justify-start items-center">
							<span className="view-heading">{thisView}</span>
							{apiData.allAffiliates.length > 0 && <Badge value={apiData.allAffiliates.length} />}
						</div>
						<div className="flex w-1/2 space-x-2 justify-end items-center">{uiNew()}</div>
					</div>
					{uiBody()}
				</div>
			);
		}
	}

	function uiModules() {
		const modules = apiData.allAffiliates.length ? [...apiData.allAffiliates] : [];
		modules.unshift({ id: 0, name: "All" });

		return modules.map((m, i) => {
			const selectedStyle =
				m.id == main.selectedAffiliate.id ? "primary-border primary-background-transparent-01 primary-text" : "full-border bg-white black-text";

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
			<button className="space-x-1.5 primary-button-transparent-background" onClick={() => toggleNewAffiliateView()}>
				<FontAwesomeIcon icon={faPlusCircle} />
				<span>New</span>
			</button>
		);
	}

	function uiSelectedAffiliate() {
		return (
			<div className="flex flex-col w-full h-full px-5 py-2.5 space-y-5 justify-start items-center">
				<div className="flex w-full justify-between items-center">
					<div className="flex flex-col w-1/2 justify-center items-start">
						<span className="view-heading">{main.selectedAffiliate.details.name}</span>
						<span className="font-regular-11 gray-text">
							Associated since {dayjs(main.selectedAffiliate.details.joined_on).format("DD MMM, YYYY")}
						</span>
					</div>
					<div className="flex flex-col w-1/2 space-y-2 justify-center items-end">
						<div className="flex space-x-2.5 justify-center items-center">
							<FontAwesomeIcon className="primary-text" icon={faPhone} />
							<span className="cursor-pointer font-regular-11 primary-text" onClick={() => openWhatsAppWeb()}>
								{main.selectedAffiliate.details.phone_number}
							</span>
						</div>
						<div className="flex space-x-2.5 justify-center items-center">
							<FontAwesomeIcon className="primary-text" icon={faAt} />
							<span className="cursor-pointer font-regular-11 primary-text" onClick={() => openEmailClient()}>
								{main.selectedAffiliate.details.email_address}
							</span>
						</div>
						<div className="flex space-x-2.5 justify-center items-center">
							<FontAwesomeIcon className="gray-text" icon={faBank} />
							<span className="font-regular-11 gray-text">{main.selectedAffiliate.details.upi_id}</span>
						</div>
					</div>
				</div>
				<div className="flex w-full space-x-5 justify-start items-center">{uiCards()}</div>
			</div>
		);
	}

	// Hooks
	useEffect(() => {
		getSupportData();

		globalThis.addEventListener("keydown", detectKeystrokes);
		return () => globalThis.removeEventListener("keydown", detectKeystrokes);
	}, []);

	// Main UI
	if (!mounted.mainComponent) {
		return;
	}

	return uiMain();
}
