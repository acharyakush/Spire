"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import NewCashFlow from "./NewCashFlow";
import MyConstants from "@/utilities/constants";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
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
		reimburseVouchers: [],
		vendors: [],
	});

	const [main, setMain] = useState({
		invoices: {
			due: { amount: 0, count: 0, label: "DUE" },
			generated: { amount: 0, count: 0, label: "GENERATED" },
			notGenerated: { amount: 0, count: 0, label: "NOT GENERATED" },
		},
		isLoading: false,
		reimburseVouchers: {
			due: { amount: 0, count: 0, label: "DUE" },
			generated: { amount: 0, count: 0, label: "GENERATED" },
			notGenerated: { amount: 0, count: 0, label: "NOT GENERATED" },
		},
		selectedModule: modules.Inward,
	});

	const [mounted, setMounted] = useState({
		newCashFlow: false,
	});

	const thisView = MyConstants.Modules.Base.CashFlow;
	const blankDataWrapper = "flex w-full h-full justify-center items-center contrast-background full-border";

	// Functions
	function getAesthetics(id) {
		const object = { background: "", border: "", textColour: "", transparentBackground: "" };

		switch (id) {
			case 0:
				object.background = "red-background";
				object.border = "red-border";
				object.textColour = "red-text";
				object.transparentBackground = "red-background-transparent-01";
				break;
			case 1:
				object.background = "orange-background";
				object.border = "orange-border";
				object.textColour = "orange-text";
				object.transparentBackground = "orange-background-transparent-01";
				break;
			case 2:
				object.background = "green-background";
				object.border = "green-border";
				object.textColour = "green-text";
				object.transparentBackground = "green-background-transparent-01";
				break;
		}

		return object;
	}

	async function getSupportData() {
		setMain((s) => ({ ...s, isLoading: true }));

		try {
			const response = await axios.get(MyConstants.ApiEndpoints.CashFlows.GetSupportData, MyGlobal.GetHeaders());

			if (response.status == 200) {
				const today = dayjs().startOf("day");
				const invoicesData = Object.assign({}, main.invoices);

				response.data.invoices.forEach((fe) => {
					const isNotGenerated = response.data.projects.filter((f) => f.id == fe.project_id);

					if (dayjs(fe.receipt_date).isAfter(today) && fe.payment_received == 0) {
						invoicesData.due.amount++;
						invoicesData.due.count++;
					} else if (isNotGenerated.length) {
						invoicesData.notGenerated.amount++;
						invoicesData.notGenerated.count = isNotGenerated.length;
					} else {
						invoicesData.generated.amount++;
						invoicesData.generated.count++;
					}
				});

				const reimburseVouchersData = Object.assign({}, main.reimburseVouchers);

				response.data.reimburseVouchers.forEach((fe) => {
					const isNotGenerated = response.data.projects.filter((f) => f.id == fe.project_id);

					if (dayjs(fe.receipt_date).isAfter(today) && fe.payment_received == 0) {
						reimburseVouchersData.due.amount++;
						reimburseVouchersData.due.count++;
					} else if (isNotGenerated.length) {
						reimburseVouchersData.notGenerated.amount++;
						reimburseVouchersData.notGenerated.count = isNotGenerated.length;
					} else {
						reimburseVouchersData.generated.amount++;
						reimburseVouchersData.generated.count++;
					}
				});

				setApi((s) => ({ ...s, invoices: response.data.invoices.length, reimburseVouchers: response.data.reimburseVouchers.length }));

				setMain((s) => ({ ...s, invoices: invoicesData, reimburseVouchers: reimburseVouchersData }));
			}
		} catch (error) {
		} finally {
			setMain((s) => ({ ...s, isLoading: false }));
		}
	}

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

	function uiInvoicesBlock() {
		return Object.values(main.invoices).map((m, n) => {
			const aesthetics = getAesthetics(n);

			return (
				<div className={`flex flex-col w-full justify-between items-center rounded shadow ${aesthetics.transparentBackground} ${aesthetics.border}`}>
					<div className={`flex flex-col w-full p-5 space-y-2.5 justify-center items-center ${aesthetics.textColour}`}>
						<div className="flex">
							<span className="font-medium-16">{m.count}</span>/<span className="font-medium-12">{api.invoices.length}</span>
						</div>
						<span className="font-medium-20">{m.amount}</span>
					</div>
					<span className={`w-full p-2 text-center tracking-widest ${aesthetics.background} font-medium-10 text-white`}>{m.label}</span>
				</div>
			);
		});
	}

	function uiInward() {
		return (
			<div className="flex flex-col w-full h-full space-y-6 justify-start items-center">
				<div className="flex flex-col w-full space-y-2 justify-center items-start">
					<span className="view-heading">{MyConstants.Modules.Base.Invoices}</span>
					<div className="flex w-full space-x-6 space-y-2 justify-center items-center">{uiInvoicesBlock()}</div>
				</div>
				<div className="flex flex-col w-full space-y-2 justify-center items-start">
					<span className="view-heading">RVs</span>
					<div className="flex w-full space-x-6 space-y-2 justify-center items-center">{uiReimburseVouchersBlock()}</div>
				</div>
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
			return <NewCashFlow reload={{}} unmount={toggleNewCashFlowView} />;
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

	function uiOutward() {
		return <></>;
	}

	function uiReimburseVouchersBlock() {
		return Object.values(main.reimburseVouchers).map((m, n) => {
			const aesthetics = getAesthetics(n);

			return (
				<div className={`flex flex-col w-full justify-between items-center rounded shadow ${aesthetics.transparentBackground} ${aesthetics.border}`}>
					<div className={`flex flex-col w-full p-5 space-y-2.5 justify-center items-center ${aesthetics.textColour}`}>
						<div className="flex">
							<span className="font-medium-16">{m.count}</span>/<span className="font-medium-12">{api.reimburseVouchers.length}</span>
						</div>
						<span className="font-medium-20">{m.amount}</span>
					</div>
					<span className={`w-full p-2 text-center tracking-widest ${aesthetics.background} font-medium-10 text-white`}>{m.label}</span>
				</div>
			);
		});
	}

	function uiSelectedModule() {
		return (
			<div className="flex flex-col w-full h-full px-5 py-2.5 space-y-5 justify-start items-center">
				{main.selectedModule == modules.Inward ? uiInward() : uiOutward()}
			</div>
		);
	}

	// Hooks
	useEffect(() => {
		getSupportData();
	}, []);

	// Main UI
	return uiMain();
}
