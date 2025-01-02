"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import MyConstants from "@/utilities/constants";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { Badge, SpinnerBig } from "@/components/Elements";

export default function Affiliates() {
	// Business Logic
	const [apiData, setApiData] = useState({
		allAffiliates: [],
		allClients: [],
		allCompanies: [],
		allMainProjects: [],
		allSubProjects: [],
	});

	const [hasMounted, setHasMounted] = useState({ mainComponent: false });

	const [mainData, setMainData] = useState({
		isLoading: false,
		searchTerm: "",
		selectedAffiliate: {},
	});

	const thisView = MyConstants.Modules.Base.Affiliates;
	const blankDataWrapper = "flex w-full h-full justify-center items-center contrast-background full-border";

	// Functions
	const detectKeystrokes = (event) => {
		switch (true) {
			case event.ctrlKey && event.key == "f":
				event.preventDefault();
				document.getElementById("searchBox").focus();
				break;
		}
	};

	const getAllAffiliates = async () => {
		setMainData((old) => ({ ...old, isLoading: true }));

		try {
			const response = await axios.get(MyConstants.ApiEndpoints.Affiliates.GetAffiliates, MyGlobal.GetHeaders());

			if (response.status === 200) {
				setApiData({
					allAffiliates: response.data.affiliates,
					allClients: response.data.clients,
					allCompanies: response.data.companies,
					allMainProjects: response.data.mainProjects,
					allSubProjects: response.data.subProjects,
				});

				setHasMounted((old) => ({ ...old, mainComponent: true }));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, `${thisView} => Get All Affiliates`);
		} finally {
			setMainData((old) => ({ ...old, isLoading: false }));
		}
	};

	const getClientName = (clientId) => {
		if (apiData.allClients.length) {
			return apiData.allClients.filter((client) => client.id == clientId).at(0).name;
		} else {
			return "";
		}
	};

	const getCompanyName = (companyId) => {
		if (apiData.allCompanies.length) {
			return apiData.allCompanies.filter((company) => company.id == companyId).at(0).name;
		} else {
			return "";
		}
	};

	const getMainProjectName = (mainProjectId) => {
		if (apiData.allMainProjects.length) {
			return apiData.allMainProjects.filter((mainProject) => mainProject.id == mainProjectId).at(0).name;
		} else {
			return "";
		}
	};

	const getSubProjectName = (subProjectId) => {
		if (apiData.allSubProjects.length) {
			return apiData.allSubProjects.filter((subProject) => subProject.id == subProjectId).at(0).name;
		} else {
			return "";
		}
	};

	const setSelectedAffiliate = (affiliate) => {
		setMainData((old) => ({ ...old, selectedAffiliate: affiliate }));
	};

	// UI Components
	const uiAllAffiliatesList = () => {
		return apiData.allAffiliates.map((affiliate, index) => {
			const selectedAffiliateStyle =
				affiliate.id == mainData.selectedAffiliate.id
					? "primary-border primary-background-transparent-01 primary-text"
					: "full-border bg-white black-text";

			const wrapper = `flex w-full px-4 py-2 justify-between items-center rounded shadow ${selectedAffiliateStyle} font-regular-10 hovered-rows`;

			return (
				<button className={wrapper} key={index} onClick={() => setSelectedAffiliate(affiliate)}>
					{affiliate.name}
				</button>
			);
		});
	};

	const uiBody = () => {
		return (
			<div className="flex w-full h-full justify-center items-start">
				<div className="flex flex-col w-[10%] space-y-2.5 mx-5 justify-start items-center">{uiAllAffiliatesList()}</div>
				<div className="flex flex-col w-[90%] h-full mr-5 justify-start items-center">{uiSelectedAffiliate()}</div>
			</div>
		);
	};

	const uiMain = () => {
		if (mainData.isLoading) {
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
	};

	const uiSelectedAffiliate = () => {
		return <></>;
	};

	// Hooks
	useEffect(() => {
		getAllAffiliates();

		globalThis.addEventListener("keydown", detectKeystrokes);
		return () => globalThis.removeEventListener("keydown", detectKeystrokes);
	}, []);

	// Main UI
	if (!hasMounted.mainComponent) {
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
