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
import { faPlusCircle, faTurnDown, faTurnUp } from "@fortawesome/free-solid-svg-icons";

export default function CashFlows({ setModuleProps }) {
	// Business Logic
	const modules = MyConstants.Modules.Other.CashFlow;

	const thisView = MyConstants.Modules.Base.CashFlow;
	const affiliatesView = MyConstants.Modules.Base.Affiliates;
	const invoicesView = MyConstants.Modules.Base.Invoices;

	const [api, setApi] = useState({
		affiliates: [],
		cashFlows: [],
		invoices: [],
		reimburseVouchers: [],
		vendors: [],
	});

	const [main, setMain] = useState({
		affiliates: {
			workPending: { amount: 0, count: 0, label: "WORK PENDING" },
			workCompleted: { amount: 0, count: 0, label: "WORK COMPLETED" },
			amountPending: { amount: 0, count: 0, label: "AMOUNT PENDING" },
			total: { amount: 0, count: 0, label: "TOTAL" },
		},
		invoices: {
			due: { amount: 0, count: 0, label: "DUE" },
			generated: { amount: 0, count: 0, label: "GENERATED" },
			notGenerated: { amount: 0, count: 0, label: "NOT GENERATED" },
		},
		isLoading: false,
		module: affiliatesView,
		officeExpense: {
			pending: { amount: 0, label: "PENDING" },
			paid: { amount: 0, label: "PAID" },
			total: { amount: 0, label: "TOTAL" },
		},
		otherExpense: {
			pending: { amount: 0, label: "PENDING" },
			paid: { amount: 0, label: "PAID" },
			total: { amount: 0, label: "TOTAL" },
		},
		pettyCash: {
			paid: { amount: 0, label: "PAID" },
			received: { amount: 0, label: "RECEIVED" },
			balance: { amount: 0, label: "BALANCE" },
		},
		reimburseVouchers: {
			due: { amount: 0, count: 0, label: "DUE" },
			generated: { amount: 0, count: 0, label: "GENERATED" },
			notGenerated: { amount: 0, count: 0, label: "NOT GENERATED" },
		},
		selectedModule: modules.Inward,
		totalInvoicesAmount: 0,
	});

	const [mounted, setMounted] = useState({
		newCashFlow: false,
	});

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
				object.background = "green-background";
				object.border = "green-border";
				object.textColour = "green-text";
				object.transparentBackground = "green-background-transparent-01";
				break;
			case 2:
				object.background = "orange-background";
				object.border = "orange-border";
				object.textColour = "orange-text";
				object.transparentBackground = "orange-background-transparent-01";
				break;
			case 3:
				object.background = "blue-background";
				object.border = "blue-border";
				object.textColour = "blue-text";
				object.transparentBackground = "blue-background-transparent-01";
				break;
		}

		return object;
	}

	function setModule(module) {
		setMain((s) => ({ ...s, selectedModule: module }));
	}

	async function setSupportData() {
		setMain((s) => ({ ...s, isLoading: true }));

		try {
			const response = await axios.get(MyConstants.ApiEndpoints.CashFlows.GetSupportData, MyGlobal.GetHeaders());

			if (response.status == 200) {
				const today = dayjs().startOf("day");
				const invoicesData = Object.assign({}, main.invoices);

				response.data.invoices.forEach((fe) => {
					if (dayjs(fe.due_date).isBefore(today)) {
						invoicesData.due.amount += Number(fe.amount);
						invoicesData.due.count++;
					}

					if (fe.custom_id) {
						invoicesData.generated.amount += Number(fe.amount);
						invoicesData.generated.count += 1;
					}
				});

				const invoiceProjectIds = new Set(response.data.invoices.map((m) => m.project_id));

				const isNotGenerated = response.data.projects.filter((f) => !invoiceProjectIds.has(f.id));

				isNotGenerated.forEach((fe, i) => {
					invoicesData.notGenerated.amount += Number(fe.quote);
					invoicesData.notGenerated.count = i + 1;
				});

				const allInvoicesAmount = response.data.invoices.reduce((pv, cv) => pv + Number(cv.amount), 0);

				const totalInvoicesAmount = allInvoicesAmount + invoicesData.notGenerated.amount;

				setApi((s) => ({
					...s,
					invoices: response.data.invoices,
					reimburseVouchers: response.data.reimburseVouchers,
				}));

				const reimburseVouchersData = Object.assign({}, main.reimburseVouchers);

				// response.data.reimburseVouchers.forEach((fe) => {
				// 	const isNotGenerated = response.data.projects.filter((f) => f.id == fe.project_id);

				// 	if (dayjs(fe.receipt_date).isAfter(today) && fe.amount_received == 0) {
				// 		reimburseVouchersData.due.amount++;
				// 		reimburseVouchersData.due.count++;
				// 	} else if (isNotGenerated.length) {
				// 		reimburseVouchersData.notGenerated.amount++;
				// 		reimburseVouchersData.notGenerated.count = isNotGenerated.length;
				// 	} else {
				// 		reimburseVouchersData.generated.amount++;
				// 		reimburseVouchersData.generated.count++;
				// 	}
				// });

				setMain((s) => ({
					...s,
					invoices: invoicesData,
					reimburseVouchers: reimburseVouchersData,
					totalInvoicesAmount: MyGlobal.ThousandSeparator(totalInvoicesAmount),
				}));
			}
		} catch (error) {
		} finally {
			setMain((s) => ({ ...s, isLoading: false }));
		}
	}

	function toggleNewCashFlowView(module) {
		setMain((s) => ({ ...s, module }));
		setMounted((s) => ({ ...s, newCashFlow: !mounted.newCashFlow }));
	}

	// UI Components
	function uiAffiliates() {
		return (
			<div className="flex flex-col w-full p-2 space-y-2 justify-center items-start">
				<div className="flex w-full justify-start items-center">
					<div className="flex w-fit space-x-2.5 justify-center items-center">
						<span className="view-heading">{affiliatesView}</span>
						{uiNew(affiliatesView)}
					</div>
				</div>
				<div className="flex w-full space-x-12 justify-between items-center">{uiAffiliatesBlock()}</div>
			</div>
		);
	}

	function uiAffiliatesBlock() {
		return Object.values(main.affiliates).map((m, n) => {
			const aesthetics = getAesthetics(n);

			return (
				<div className={`flex flex-col w-full justify-between items-center rounded shadow ${aesthetics.transparentBackground} ${aesthetics.border}`}>
					<div className={`flex flex-col w-full p-5 space-y-2.5 justify-center items-center ${aesthetics.textColour}`}>
						<div className="flex space-x-1 justify-center items-center">
							<span className="font-medium-18">{m.count}</span>
						</div>
						<span className="font-medium-22">{MyGlobal.FormatCurrency(m.amount)}</span>
					</div>
					<span className={`w-full p-2 text-center tracking-widest ${aesthetics.background} font-medium-10 text-white`}>{m.label}</span>
				</div>
			);
		});
	}

	function uiBody() {
		return (
			<div className="flex w-full h-full justify-center items-start">
				<div className="flex flex-col w-[10%] space-y-2.5 mx-5 justify-start items-center">{uiModules()}</div>
				<div className="flex flex-col w-[90%] h-[calc(100vh-100px)] mr-5 justify-start items-center rounded shadow overflow-y-auto scrollbar-gutter contrast-background">
					{uiSelectedModule()}
				</div>
			</div>
		);
	}

	function uiInward() {
		return (
			<div className="flex flex-col w-full h-full space-y-6 justify-start items-center">
				{uiInwardInvoices()}
				{uiInwardOtherExpense()}
			</div>
		);
	}

	function uiInwardInvoices() {
		return (
			<div className="flex flex-col w-full p-2 space-y-2 justify-center items-start">
				<div className="flex w-full justify-between items-center">
					<div className="flex w-fit space-x-2.5 justify-start items-center">
						<span className="view-heading">{invoicesView}</span>
						{uiNew("Inward Invoices")}
						<Badge value={api.invoices.length} />
						<Badge value={`Total ${main.totalInvoicesAmount}`} />
					</div>
				</div>
				<div className="flex w-full space-x-16 justify-between items-center">{uiInwardInvoicesBlock()}</div>
			</div>
		);
	}

	function uiInwardInvoicesBlock() {
		return Object.values(main.invoices).map((m, n) => {
			const aesthetics = getAesthetics(n);

			return (
				<div className={`flex flex-col w-full justify-between items-center rounded shadow ${aesthetics.transparentBackground} ${aesthetics.border}`}>
					<div className={`flex flex-col w-full p-5 space-y-2.5 justify-center items-center ${aesthetics.textColour}`}>
						<div className="flex space-x-1 justify-center items-center">
							<span className="font-medium-18">{m.count}</span>
						</div>
						<span className="font-medium-22">{MyGlobal.FormatCurrency(m.amount)}</span>
					</div>
					<span className={`w-full p-2 text-center tracking-widest ${aesthetics.background} font-medium-10 text-white`}>{m.label}</span>
				</div>
			);
		});
	}

	function uiInwardOtherExpense() {
		return (
			<div className="flex flex-col w-full p-2 space-y-2 justify-center items-start">
				<div className="flex w-full justify-start items-center">
					<div className="flex w-fit space-x-2.5 justify-center items-center">
						<span className="view-heading">Other Expense</span>
						{uiNew("Inward Other Expense")}
					</div>
				</div>
				<div className="flex w-full space-x-32 justify-between items-center">{uiInwardOtherExpenseBlock()}</div>
			</div>
		);
	}

	function uiInwardOtherExpenseBlock() {
		return Object.values(main.otherExpense).map((m, n) => {
			const aesthetics = getAesthetics(n);

			return (
				<div className={`flex flex-col w-full justify-between items-center rounded shadow ${aesthetics.transparentBackground} ${aesthetics.border}`}>
					<div className={`flex flex-col w-full p-5 justify-center items-center ${aesthetics.textColour}`}>
						<span className="font-medium-22">{MyGlobal.FormatCurrency(m.amount)}</span>
					</div>
					<span className={`w-full p-2 text-center tracking-widest ${aesthetics.background} font-medium-10 text-white`}>{m.label}</span>
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
		} else if (mounted.newCashFlow) {
			return <NewCashFlow module={main.module} reload={setSupportData} unmount={toggleNewCashFlowView} />;
		} else {
			return (
				<div className="flex flex-col w-full h-full justify-start items-center">
					<div className="flex w-full px-5 py-2.5 justify-between items-center">
						<div className="flex w-1/2 space-x-2 justify-start items-center">
							<span className="view-heading">{thisView}</span>
							{api.cashFlows.length > 0 && <Badge value={api.cashFlows.length} />}
						</div>
						<div className="flex w-1/2 space-x-2 justify-end items-center"></div>
					</div>
					{uiBody()}
				</div>
			);
		}
	}

	function uiModules() {
		return Object.values(modules).map((m, i) => {
			const icon = m == modules.Inward ? faTurnDown : faTurnUp;

			const selectedStyle =
				m == main.selectedModule ? "primary-border primary-background-transparent-01 primary-text" : "full-border bg-white black-text";

			const wrapper = `flex w-full px-4 py-2 justify-between items-center rounded shadow ${selectedStyle} font-medium-10 hovered-rows`;

			return (
				<button className={wrapper} key={i} onClick={() => setModule(m)}>
					<span>{m}</span>
					<FontAwesomeIcon icon={icon} />
				</button>
			);
		});
	}

	function uiNew(module) {
		const action = () => (module == "Inward Invoices" ? setModuleProps(invoicesView, 1) : toggleNewCashFlowView(module));

		return <FontAwesomeIcon className="cursor-pointer blue-text" icon={faPlusCircle} onClick={() => action()} size="lg" />;
	}

	function uiOutward() {
		return (
			<div className="flex flex-col w-full h-full space-y-6 justify-start items-center">
				{uiAffiliates()}
				{uiOutwardOfficeExpense()}
				{uiOutwardOtherExpense()}
				{uiOutwardPettyCash()}
			</div>
		);
	}

	function uiOutwardOfficeExpense() {
		return (
			<div className="flex flex-col w-full p-2 space-y-2 justify-center items-start">
				<div className="flex w-full justify-start items-center">
					<div className="flex w-fit space-x-2.5 justify-center items-center">
						<span className="view-heading">Office Expense</span>
						{uiNew("Outward Office Expense")}
					</div>
				</div>
				<div className="flex w-full space-x-32 justify-between items-center">{uiOutwardOfficeExpenseBlock()}</div>
			</div>
		);
	}

	function uiOutwardOfficeExpenseBlock() {
		return Object.values(main.officeExpense).map((m, n) => {
			const aesthetics = getAesthetics(n);

			return (
				<div className={`flex flex-col w-full justify-between items-center rounded shadow ${aesthetics.transparentBackground} ${aesthetics.border}`}>
					<div className={`flex flex-col w-full p-5 justify-center items-center ${aesthetics.textColour}`}>
						<span className="font-medium-22">{MyGlobal.FormatCurrency(m.amount)}</span>
					</div>
					<span className={`w-full p-2 text-center tracking-widest ${aesthetics.background} font-medium-10 text-white`}>{m.label}</span>
				</div>
			);
		});
	}

	function uiOutwardOtherExpense() {
		return (
			<div className="flex flex-col w-full p-2 space-y-2 justify-center items-start">
				<div className="flex w-full justify-start items-center">
					<div className="flex w-fit space-x-2.5 justify-center items-center">
						<span className="view-heading">Other Expense</span>
						{uiNew("Outward Other Expense")}
					</div>
				</div>
				<div className="flex w-full space-x-32 justify-between items-center">{uiOutwardOtherExpenseBlock()}</div>
			</div>
		);
	}

	function uiOutwardOtherExpenseBlock() {
		return Object.values(main.otherExpense).map((m, n) => {
			const aesthetics = getAesthetics(n);

			return (
				<div className={`flex flex-col w-full justify-between items-center rounded shadow ${aesthetics.transparentBackground} ${aesthetics.border}`}>
					<div className={`flex flex-col w-full p-5 justify-center items-center ${aesthetics.textColour}`}>
						<span className="font-medium-22">{MyGlobal.FormatCurrency(m.amount)}</span>
					</div>
					<span className={`w-full p-2 text-center tracking-widest ${aesthetics.background} font-medium-10 text-white`}>{m.label}</span>
				</div>
			);
		});
	}

	function uiOutwardPettyCash() {
		return (
			<div className="flex flex-col w-full p-2 space-y-2 justify-center items-start">
				<div className="flex w-full justify-start items-center">
					<div className="flex w-fit space-x-2.5 justify-center items-center">
						<span className="view-heading">Petty Cash</span>
						{uiNew("Outward Petty Cash")}
					</div>
				</div>
				<div className="flex w-full space-x-32 justify-between items-center">{uiOutwardPettyCashBlock()}</div>
			</div>
		);
	}

	function uiOutwardPettyCashBlock() {
		return Object.values(main.pettyCash).map((m, n) => {
			const aesthetics = getAesthetics(n);

			return (
				<div className={`flex flex-col w-full justify-between items-center rounded shadow ${aesthetics.transparentBackground} ${aesthetics.border}`}>
					<div className={`flex flex-col w-full p-5 justify-center items-center ${aesthetics.textColour}`}>
						<span className="font-medium-22">{MyGlobal.FormatCurrency(m.amount)}</span>
					</div>
					<span className={`w-full p-2 text-center tracking-widest ${aesthetics.background} font-medium-10 text-white`}>{m.label}</span>
				</div>
			);
		});
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
		setSupportData();

		return () => {
			setModuleProps(invoicesView, null);
			setModuleProps(thisView, null);
		};
	}, []);

	// Main UI
	return uiMain();
}
