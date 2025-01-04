"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import MyConstants from "@/utilities/constants";

import { MyGlobal } from "@/utilities/global";
import { useEffect, useRef, useState } from "react";
import { Badge, SpinnerBig } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAt, faBank, faPhone } from "@fortawesome/free-solid-svg-icons";

export default function Affiliates() {
	// Business Logic
	const cardContainerReference = useRef(null);

	const [apiData, setApiData] = useState({
		allAffiliates: [],
		allClients: [],
		allCompanies: [],
		mainProjects: [],
		subProjects: [],
	});

	const [cards, setCards] = useState([]);

	const [mounted, setMounted] = useState({ mainComponent: false });

	const [main, setMain] = useState({
		isLoading: false,
		searchTerm: "",
		selectedAffiliate: { details: {}, id: 0 },
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
		setMain((old) => ({ ...old, isLoading: true }));

		try {
			const response = await axios.get(MyConstants.ApiEndpoints.Affiliates.GetAffiliates, MyGlobal.GetHeaders());

			if (response.status === 200) {
				const allAffiliates = response.data.affiliates.map((m) => {
					const projects = response.data.affiliatesProjects.filter((f) => f.affiliate_id == m.id);
					return { ...m, projects };
				});

				setApiData({
					allAffiliates,
					allClients: response.data.clients,
					allCompanies: response.data.companies,
					mainProjects: response.data.mainProjects,
					subProjects: response.data.subProjects,
				});

				setMounted((old) => ({ ...old, mainComponent: true }));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, `${thisView} => Get All Affiliates`);
		} finally {
			setMain((old) => ({ ...old, isLoading: false }));
		}
	}

	function handleCardClick() {
		const updatedCards = [...cards];
		const [clickedCard] = updatedCards.splice(index, 1);

		updatedCards.unshift(clickedCard);
		setCards(updatedCards);
	}

	function openEmailClient() {
		globalThis.window.open(`mailto:${main.selectedAffiliate.details.email_address}`, "_blank");
	}

	function openWhatsAppWeb() {
		globalThis.window.open(`https://wa.me/1${main.selectedAffiliate.details.phone_number}`, "_blank");
	}

	function setSelectedAffiliate(object) {
		setMain((s) => ({ ...s, selectedAffiliate: { details: object, id: object.id } }));
	}

	function updateCardPositions() {
		const container = cardContainerReference.current;
		if (!container) return;

		const cardElements = Array.from(container.children);

		cardElements.forEach((fe, i) => {
			fe.style.transform = `translateX(${i * 200}px)`;
			fe.style.zIndex = cardElements.length - i;

			if (i === 0) {
				fe.style.height = "500px";
			} else if (i === 1) {
				fe.style.height = "300px";
			} else {
				fe.style.height = "150px";
			}
		});
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
		return cards.map((m, i) => <div key={m.id} className="card" onClick={() => handleCardClick(i)}></div>);
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
		} else {
			return uiBody();
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

	function uiSelectedAffiliate() {
		return (
			<div className="flex flex-col w-full h-full px-5 py-2.5 justify-start items-center">
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
				<div className="flex w-full justify-start items-center">
					<div className="affiliates-card-container" ref={cardContainerReference}>
						{uiCards()}
					</div>
				</div>
			</div>
		);
	}

	// Hooks
	useEffect(() => {
		getSupportData();

		globalThis.addEventListener("keydown", detectKeystrokes);
		return () => globalThis.removeEventListener("keydown", detectKeystrokes);
	}, []);

	useEffect(() => {
		updateCardPositions();
	}, [cards]);

	// Main UI
	if (!mounted.mainComponent) {
		return;
	}

	return (
		<div className="flex flex-col w-full h-full justify-start items-center">
			<div className="flex w-full px-5 py-2.5 justify-between items-center">
				<div className="flex w-1/5 space-x-2 justify-start items-center">
					<span className="view-heading">{thisView}</span>
					{apiData.allAffiliates.length > 0 && <Badge value={apiData.allAffiliates.length} />}
				</div>
			</div>

			{uiMain()}
		</div>
	);
}
