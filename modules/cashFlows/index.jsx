"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import NewCashFlow from "./NewCashFlow";
import MyConstants from "@/utilities/constants";

import { useState } from "react";
import { Badge, SpinnerBig } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";

export default function CashFlows() {
	// Business Logic
	const modules = MyConstants.Modules.Other.CashFlow;

	const [api, setApi] = useState({
		affiliates: [],
		cashFlows: [],
		invoices: [],
		reimbursementVouchers: [],
		vendors: [],
	});

	const [main, setMain] = useState({
		isLoading: false,
		selectedModule: modules.Inward,
	});

	const [mounted, setMounted] = useState({
		newCashFlow: false,
	});

	const thisView = MyConstants.Modules.Base.CashFlow;
	const blankDataWrapper = "flex w-full h-full justify-center items-center contrast-background full-border";

	// Functions
	function setModule(module) {
		setMain((s) => ({ ...s, selectedModule: module }));
	}

	function toggleNewCashFlowView() {
		setMounted((s) => ({ ...s, newCashFlow: !mounted.newCashFlow }));
	}

	// UI Components
	function uiBody() {
		return (
			<div className="flex w-full h-full justify-center items-start">
				<div className="flex flex-col w-[10%] space-y-2.5 mx-5 justify-start items-center">{uiModules()}</div>
				<div className="flex flex-col w-[90%] h-full mr-5 justify-start items-center rounded shadow contrast-background">{uiSelectedModule()}</div>
			</div>
		);
	}

	function uiMain() {
		if (main.isLoading) {
			return (
				<div className={blankDataWrapper}>
					<SpinnerBig />
				</div>
			);
		} else if (mounted.newCashFlow) {
			return <NewCashFlow reload={{}} unmount={toggleNewCashFlowView()} />;
		} else {
			return (
				<div className="flex flex-col w-full h-full justify-start items-center">
					<div className="flex w-full px-5 py-2.5 justify-between items-center">
						<div className="flex w-1/2 space-x-2 justify-start items-center">
							<span className="view-heading">{thisView}</span>
							{api.cashFlows.length > 0 && <Badge value={api.cashFlows.length} />}
						</div>
						<div className="flex w-1/2 space-x-2 justify-end items-center">{uiNew()}</div>
					</div>
					{uiBody()}
				</div>
			);
		}
	}

	function uiModules() {
		return Object.values(modules).map((m, i) => {
			const selectedStyle =
				m == main.selectedModule ? "primary-border primary-background-transparent-01 primary-text" : "full-border bg-white black-text";

			const wrapper = `flex w-full px-4 py-2 justify-between items-center rounded shadow ${selectedStyle} font-regular-10 hovered-rows`;

			return (
				<button className={wrapper} key={i} onClick={() => setModule(m)}>
					{m}
				</button>
			);
		});
	}

	function uiNew() {
		return (
			<button className="space-x-1.5 primary-button-transparent-background" onClick={() => toggleNewCashFlowView()}>
				<FontAwesomeIcon icon={faPlusCircle} />
				<span>New</span>
			</button>
		);
	}

	function uiSelectedModule() {
		return <div className="flex flex-col w-full h-full px-5 py-2.5 space-y-5 justify-start items-center">{main.selectedModule}</div>;
	}

	// Main UI
	return uiMain();
}
