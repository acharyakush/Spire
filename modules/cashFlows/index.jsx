"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import RV from "./rv";
import axios from "axios";
import dayjs from "dayjs";
import Others from "./others";
import Vendors from "./vendors";
import Invoices from "./invoices";
import Affiliates from "./affiliates";
import MyConstants from "@/utilities/constants";
import AllTransactions from "./allTransactions";
import Transactions from "./pettyCash/Transactions";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { ErrorBoundary } from "react-error-boundary";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Badge, ErrorFallbackComponent, SpinnerBig } from "@/components/Elements";
import { faArrowUpRightFromSquare, faStar, faTurnDown, faTurnUp } from "@fortawesome/free-solid-svg-icons";

export default function CashFlows({ presetStatus, setModuleProps }) {
	// Business Logic
	const baseModules = MyConstants.Modules.Base;
	const categories = MyConstants.Modules.Other.CashFlow;
	const modules = MyConstants.Modules.Other.CashFlowModules;

	const thisView = baseModules.CashFlow;
	const affiliatesView = baseModules.Affiliates;
	const vendorsView = baseModules.Vendors;
	const invoicesView = baseModules.Invoices;

	let module = "";

	if ("find" in presetStatus && "module" in presetStatus) {
		module = presetStatus.module;
	}

	const [api, setApi] = useState({
		affiliates: [],
		cashFlows: [],
		invoices: [],
		projects: [],
		reimburseVouchers: [],
		vendors: [],
	});

	const [main, setMain] = useState({
		affiliates: {
			pending: { amount: 0, count: 0, label: "PENDING" },
			paid: { amount: 0, count: 0, label: "PAID" },
			total: { amount: 0, count: 0, label: "TOTAL" },
		},
		invoices: {
			due: { amount: 0, count: 0, label: "DUE" },
			generated: { amount: 0, count: 0, label: "GENERATED" },
			notGenerated: { amount: 0, count: 0, label: "NOT GENERATED" },
		},
		hasMounted: false,
		isLoading: false,
		module,
		officeExpense: {
			pending: { amount: 0, label: "PENDING" },
			paid: { amount: 0, label: "PAID" },
			total: { amount: 0, label: "TOTAL" },
		},
		otherIncome: {
			pending: { amount: 0, label: "PENDING" },
			received: { amount: 0, label: "RECEIVED" },
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
		rv: {
			due: { amount: 0, count: 0, label: "DUE" },
			generated: { amount: 0, count: 0, label: "GENERATED" },
			notGenerated: { amount: 0, count: 0, label: "NOT GENERATED" },
		},
		selectedCategory: categories.Inward,
		totalInvoicesAmount: 0,
		totalRvAmount: 0,
		vendors: {
			pending: { amount: 0, count: 0, label: "PENDING" },
			paid: { amount: 0, count: 0, label: "PAID" },
			total: { amount: 0, count: 0, label: "TOTAL" },
		},
	});

	const blankDataWrapper = "flex w-full h-full justify-center items-center contrast-background full-border";

	// Functions
	function clearData() {
		setMain((s) => ({
			...s,
			affiliates: {
				pending: { amount: 0, count: 0, label: "PENDING" },
				paid: { amount: 0, count: 0, label: "PAID" },
				total: { amount: 0, count: 0, label: "TOTAL" },
			},
			invoices: {
				due: { amount: 0, count: 0, label: "DUE" },
				generated: { amount: 0, count: 0, label: "GENERATED" },
				notGenerated: { amount: 0, count: 0, label: "NOT GENERATED" },
			},
			officeExpense: {
				pending: { amount: 0, label: "PENDING" },
				paid: { amount: 0, label: "PAID" },
				total: { amount: 0, label: "TOTAL" },
			},
			otherIncome: {
				pending: { amount: 0, label: "PENDING" },
				received: { amount: 0, label: "PAID" },
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
			rv: {
				due: { amount: 0, count: 0, label: "DUE" },
				generated: { amount: 0, count: 0, label: "GENERATED" },
				notGenerated: { amount: 0, count: 0, label: "NOT GENERATED" },
			},
			totalInvoicesAmount: 0,
			totalRvAmount: 0,
			vendors: {
				pending: { amount: 0, count: 0, label: "PENDING" },
				paid: { amount: 0, count: 0, label: "PAID" },
				total: { amount: 0, count: 0, label: "TOTAL" },
			},
		}));
	}

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

	async function getSupportData() {
		setMain((s) => ({ ...s, isLoading: true }));

		try {
			const response = await axios.get(MyConstants.ApiEndpoints.CashFlows.GetSupportData, MyGlobal.GetHeaders());

			if (response.status == 200) {
				const today = dayjs().startOf("day");

				// ========== //
				// Affiliates //
				// ========== //

				const affiliates = Object.assign({}, main.affiliates);
				const paidAffiliatesList = [];

				response.data.affiliatesProjects.forEach((fe) => {
					affiliates.total.amount += Number(fe.total_fees);
					affiliates.total.count += 1;
				});

				response.data.affiliatesTransactions.forEach((fe) => {
					affiliates.paid.amount += Number(fe.amount);

					const paidAffiliates = response.data.affiliatesProjects.filter((f) => f.affiliate_id === fe.affiliate_id && f.project_id === fe.project_id);

					if (paidAffiliates.length) {
						if (!paidAffiliatesList.includes(paidAffiliates.at(0).id)) {
							paidAffiliatesList.push(paidAffiliates.at(0).id);
						}
					}
				});

				affiliates.paid.count = paidAffiliatesList.length;
				affiliates.pending.amount = affiliates.total.amount - affiliates.paid.amount;
				affiliates.pending.count = affiliates.total.count - affiliates.paid.count;

				// ======= //
				// Vendors //
				// ======= //

				const vendors = Object.assign({}, main.vendors);
				const paidVendorsList = [];

				response.data.vendorsHeads.forEach((fe) => {
					vendors.total.amount += Number(fe.amount);
					vendors.total.count += 1;
				});

				response.data.vendorsTransactions.forEach((fe) => {
					vendors.paid.amount += Number(fe.amount);

					const paidvendors = response.data.vendorsHeads.filter((f) => f.id === fe.head_id && f.vendor_id === fe.vendor_id);

					if (paidvendors.length) {
						if (!paidVendorsList.includes(paidvendors.at(0).id)) {
							paidVendorsList.push(paidvendors.at(0).id);
						}
					}
				});

				vendors.paid.count = paidVendorsList.length;
				vendors.pending.amount = vendors.total.amount - vendors.paid.amount;
				vendors.pending.count = vendors.total.count - vendors.paid.count;

				// ======== //
				// Invoices //
				// ======== //

				const _invoices = Object.assign({}, main.invoices);

				response.data.invoices.forEach((fe) => {
					if (dayjs(fe.due_date).isBefore(today)) {
						_invoices.due.amount += Number(fe.amount);
						_invoices.due.count++;
					}

					if (fe.custom_id) {
						_invoices.generated.amount += Number(fe.amount);
						_invoices.generated.count += 1;
					}
				});

				const invoiceProjectIds = new Set(response.data.invoices.map((m) => m.project_id));
				const notGeneratedInvoices = response.data.projects.filter((f) => !invoiceProjectIds.has(f.id));

				notGeneratedInvoices.forEach((fe, i) => {
					_invoices.notGenerated.amount += Number(fe.quote);
					_invoices.notGenerated.count = i + 1;
				});

				const allInvoicesAmount = response.data.invoices.reduce((pv, cv) => pv + Number(cv.amount), 0);
				const totalInvoicesAmount = allInvoicesAmount + _invoices.notGenerated.amount;

				// ================= //
				// Reimburse Voucher //
				// ================= //

				const _rv = Object.assign({}, main.rv);

				const rvIds = [];

				response.data.reimburseVouchers.forEach((fe) => {
					if (dayjs(fe.due_date).isBefore(today)) {
						_rv.due.amount += Number(fe.amount);
						_rv.due.count++;
					}

					if (fe.custom_id) {
						_rv.generated.amount += Number(fe.amount);
						_rv.generated.count += 1;
					}

					rvIds.push(fe.project_id);
				});

				response.data.projects.forEach((fe) => {
					if (!rvIds.includes(fe.id)) {
						_rv.notGenerated.count += 1;
					}
				});

				const rvProjectIds = new Set(response.data.reimburseVouchers.map((m) => m.project_id));
				const notGeneratedRvs = response.data.tasks.filter((f) => !rvProjectIds.has(f.project_id));

				notGeneratedRvs.forEach((fe, i) => {
					_rv.notGenerated.amount += Number(fe.expense);
				});

				const allRvAmount = response.data.reimburseVouchers.reduce((pv, cv) => pv + Number(cv.amount), 0);
				const totalRvAmount = allRvAmount + _rv.notGenerated.amount;

				setApi((s) => ({
					...s,
					invoices: response.data.invoices,
					projects: response.data.projects,
					reimburseVouchers: response.data.reimburseVouchers,
				}));

				const otherIncome = {
					pending: { amount: 0, label: "PENDING" },
					received: { amount: 0, label: "RECEIVED" },
					total: { amount: 0, label: "TOTAL" },
				};

				const officeExpense = {
					pending: { amount: 0, label: "PENDING" },
					paid: { amount: 0, label: "PAID" },
					total: { amount: 0, label: "TOTAL" },
				};

				const otherExpense = {
					pending: { amount: 0, label: "PENDING" },
					paid: { amount: 0, label: "PAID" },
					total: { amount: 0, label: "TOTAL" },
				};

				const pettyCash = {
					paid: { amount: 0, label: "PAID" },
					received: { amount: 0, label: "RECEIVED" },
					balance: { amount: 0, label: "BALANCE" },
				};

				response.data.cashFlowsHeads.forEach((fe) => {
					if (fe.module_id === modules.OfficeExpense.id) {
						officeExpense.total.amount += Number(fe.amount);
					} else if (fe.module_id === modules.OtherExpense.id) {
						otherExpense.total.amount += Number(fe.amount);
					} else if (fe.module_id === modules.OtherIncome.id) {
						otherIncome.total.amount += Number(fe.amount);
					}
				});

				response.data.cashFlowsTransactions.forEach((fe) => {
					if (fe.module_id === modules.OfficeExpense.id) {
						officeExpense.paid.amount += Number(fe.amount);
					} else if (fe.module_id === modules.OtherExpense.id) {
						otherExpense.paid.amount += Number(fe.amount);
					} else if (fe.module_id === modules.OtherIncome.id) {
						otherIncome.received.amount += Number(fe.amount);
					}
				});

				response.data.pettyCashTransactions.forEach((fe) => {
					pettyCash.paid.amount += Number(fe.amount_paid);
					pettyCash.received.amount += Number(fe.amount_received);
				});

				pettyCash.received.amount += Number(response.data.openingBalance.at(0).balance);

				otherIncome.pending.amount = otherIncome.total.amount - otherIncome.received.amount;
				officeExpense.pending.amount = officeExpense.total.amount - officeExpense.paid.amount;
				otherExpense.pending.amount = otherExpense.total.amount - otherExpense.paid.amount;
				pettyCash.balance.amount = pettyCash.received.amount - pettyCash.paid.amount;

				setMain((s) => ({
					...s,
					affiliates: affiliates,
					hasMounted: true,
					invoices: _invoices,
					otherIncome: otherIncome,
					officeExpense,
					otherExpense: otherExpense,
					pettyCash,
					rv: _rv,
					totalInvoicesAmount: MyGlobal.ThousandSeparator(totalInvoicesAmount),
					totalRvAmount: MyGlobal.ThousandSeparator(totalRvAmount),
				}));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, `${thisView} => Get Support Data`);
		} finally {
			setMain((s) => ({ ...s, isLoading: false }));
		}
	}

	function setCategory(module) {
		setMain((s) => ({ ...s, selectedCategory: module }));
	}

	function toggleModule(module) {
		if (main.hasMounted) {
			if (module) {
				setMain((s) => ({ ...s, module }));
				clearData();
			} else {
				setMain((s) => ({ ...s, module: "" }));

				setModuleProps(baseModules.Invoices, "");
				setModuleProps(baseModules.Rv, "");

				getSupportData();
			}
		}
	}

	// UI Components
	function uiAffiliates() {
		return (
			<div className="flex flex-col w-full p-2 space-y-2 justify-center items-start">
				<div className="flex w-full justify-start items-center">{uiHeading(affiliatesView)}</div>
				<div className="flex w-full space-x-32 justify-between items-center">{uiAffiliatesBlock()}</div>
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
						<span className="font-bold-24">{MyGlobal.FormatCurrency(m.amount)}</span>
					</div>
					<span className={`w-full p-2 text-center tracking-widest ${aesthetics.background} font-medium-10 text-white`}>{m.label}</span>
				</div>
			);
		});
	}

	function uiBody() {
		return (
			<div className="flex flex-col w-full h-full mx-5 justify-center items-start">
				<div className="flex flex-col w-full h-[calc(100vh-105px)] justify-start items-center rounded shadow overflow-y-auto scrollbar-gutter contrast-background">{uiSelectedModule()}</div>
			</div>
		);
	}

	function uiCategories() {
		return Object.values(categories).map((m, i) => {
			const icon = m == categories.Inward ? faTurnDown : m == categories.Outward ? faTurnUp : faStar;

			const selectedStyle = m == main.selectedCategory ? "primary-border primary-background-transparent-01 primary-text" : "full-border bg-white black-text";

			const wrapper = `flex w-fit px-4 py-1 space-x-2 justify-between items-center rounded shadow ${selectedStyle} font-medium-10 hovered-rows`;

			return (
				<button className={wrapper} key={i} onClick={() => setCategory(m)}>
					<FontAwesomeIcon icon={icon} size="sm" />
					<span>{m}</span>
				</button>
			);
		});
	}

	function uiHeading(category) {
		let heading = category;

		if (typeof category === "object") {
			if ("name" in category) {
				heading = category.name;
			}
		}

		return (
			<div className="flex w-fit space-x-2.5 justify-center items-center cursor-pointer hover:underline hover:underline-offset-4 decoration-[--primary] blue-text" onClick={() => toggleModule(category)}>
				<span className="view-heading">{heading}</span>
				<FontAwesomeIcon icon={faArrowUpRightFromSquare} />
			</div>
		);
	}

	function uiInward() {
		return (
			<div className="flex flex-col w-full h-full space-y-6 justify-start items-center">
				{uiInvoices()}
				{uiRVs()}
				{uiOtherIncome()}
			</div>
		);
	}

	function uiInvoices() {
		return (
			<div className="flex flex-col w-full p-2 space-y-2 justify-center items-start">
				<div className="flex w-full justify-between items-center">
					<div className="flex w-fit space-x-2.5 justify-start items-center">
						{uiHeading("Invoices")}
						<Badge value={api.projects.length} />
						<Badge value={`Total ${main.totalInvoicesAmount}`} />
					</div>
				</div>
				<div className="flex w-full space-x-32 justify-between items-center">{uiInvoicesBlock()}</div>
			</div>
		);
	}

	function uiInvoicesBlock() {
		return Object.values(main.invoices).map((m, n) => {
			const aesthetics = getAesthetics(n);

			return (
				<div className={`flex flex-col w-full justify-between items-center rounded shadow ${aesthetics.transparentBackground} ${aesthetics.border}`}>
					<div className={`flex flex-col w-full p-5 space-y-2.5 justify-center items-center ${aesthetics.textColour}`}>
						<div className="flex space-x-1 justify-center items-center">
							<span className="font-medium-18">{m.count}</span>
						</div>
						<span className="font-bold-24">{MyGlobal.FormatCurrency(m.amount)}</span>
					</div>
					<span className={`w-full p-2 text-center tracking-widest ${aesthetics.background} font-medium-10 text-white`}>{m.label}</span>
				</div>
			);
		});
	}

	function uiOtherIncome() {
		return (
			<div className="flex flex-col w-full p-2 space-y-2 justify-center items-start">
				<div className="flex w-full justify-start items-center">{uiHeading(modules.OtherIncome)}</div>
				<div className="flex w-full space-x-32 justify-between items-center">{uiOtherIncomeBlock()}</div>
			</div>
		);
	}

	function uiOtherIncomeBlock() {
		return Object.values(main.otherIncome).map((m, n) => {
			const aesthetics = getAesthetics(n);

			return (
				<div className={`flex flex-col w-full justify-between items-center rounded shadow ${aesthetics.transparentBackground} ${aesthetics.border}`}>
					<div className={`flex flex-col w-full p-5 justify-center items-center ${aesthetics.textColour}`}>
						<span className="font-bold-24">{MyGlobal.FormatCurrency(m.amount)}</span>
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
		} else if (main.module) {
			if (main.module == baseModules.Affiliates) {
				return (
					<ErrorBoundary key={`ErrorBoundary_${baseModules.Affiliates}`} onError={(e) => MyGlobal.LogErrors(e.message, baseModules.Affiliates)} FallbackComponent={ErrorFallbackComponent}>
						<Affiliates reload={getSupportData} unmount={toggleModule} />
					</ErrorBoundary>
				);
			} else if (main.module == baseModules.Invoices) {
				return (
					<ErrorBoundary key={`ErrorBoundary_${baseModules.Invoices}`} onError={(e) => MyGlobal.LogErrors(e.message, baseModules.Invoices)} FallbackComponent={ErrorFallbackComponent}>
						<Invoices presetStatus={presetStatus} unmount={toggleModule} />
					</ErrorBoundary>
				);
			} else if (main.module == baseModules.Vendors) {
				return (
					<ErrorBoundary key={`ErrorBoundary_${baseModules.Vendors}`} onError={(e) => MyGlobal.LogErrors(e.message, baseModules.Vendors)} FallbackComponent={ErrorFallbackComponent}>
						<Vendors reload={getSupportData} unmount={toggleModule} />
					</ErrorBoundary>
				);
			} else if (main.module?.id === modules.PettyCash.id) {
				return <Transactions reload={getSupportData} unmount={toggleModule} />;
			} else if (main.module == baseModules.Rv) {
				return (
					<ErrorBoundary key={`ErrorBoundary_${baseModules.Rv}`} onError={(e) => MyGlobal.LogErrors(e.message, baseModules.Rv)} FallbackComponent={ErrorFallbackComponent}>
						<RV reload={getSupportData} unmount={toggleModule} />
					</ErrorBoundary>
				);
			} else {
				return (
					<ErrorBoundary key={`ErrorBoundary_${module}`} onError={(e) => MyGlobal.LogErrors(e.message, module)} FallbackComponent={ErrorFallbackComponent}>
						<Others module={main.module} unmount={toggleModule} />
					</ErrorBoundary>
				);
			}
		} else {
			return (
				<div className="flex flex-col w-full h-full justify-between items-center">
					<div className="flex w-full px-5 py-2.5 justify-between items-center">
						<span className="flex w-2/5 pl-2.5 justify-start items-center view-heading">{thisView}</span>
						<div className="flex w-3/5 space-x-2 justify-start items-center">{uiCategories()}</div>
					</div>
					{uiBody()}
				</div>
			);
		}
	}

	function uiOutward() {
		return (
			<div className="flex flex-col w-full h-full space-y-6 justify-start items-center">
				{uiAffiliates()}
				{uiVendors()}
				{uiOfficeExpense()}
				{uiOtherExpense()}
				{uiPettyCash()}
			</div>
		);
	}

	function uiOfficeExpense() {
		return (
			<div className="flex flex-col w-full p-2 space-y-2 justify-center items-start">
				<div className="flex w-full justify-start items-center">{uiHeading(modules.OfficeExpense)}</div>
				<div className="flex w-full space-x-32 justify-between items-center">{uiOfficeExpenseBlock()}</div>
			</div>
		);
	}

	function uiOfficeExpenseBlock() {
		return Object.values(main.officeExpense).map((m, n) => {
			const aesthetics = getAesthetics(n);

			return (
				<div className={`flex flex-col w-full justify-between items-center rounded shadow ${aesthetics.transparentBackground} ${aesthetics.border}`}>
					<div className={`flex flex-col w-full p-5 justify-center items-center ${aesthetics.textColour}`}>
						<span className="font-bold-24">{MyGlobal.FormatCurrency(m.amount)}</span>
					</div>
					<span className={`w-full p-2 text-center tracking-widest ${aesthetics.background} font-medium-10 text-white`}>{m.label}</span>
				</div>
			);
		});
	}

	function uiOtherExpense() {
		return (
			<div className="flex flex-col w-full p-2 space-y-2 justify-center items-start">
				<div className="flex w-full justify-start items-center">{uiHeading(modules.OtherExpense)}</div>
				<div className="flex w-full space-x-32 justify-between items-center">{uiOtherExpenseBlock()}</div>
			</div>
		);
	}

	function uiOtherExpenseBlock() {
		return Object.values(main.otherExpense).map((m, n) => {
			const aesthetics = getAesthetics(n);

			return (
				<div className={`flex flex-col w-full justify-between items-center rounded shadow ${aesthetics.transparentBackground} ${aesthetics.border}`}>
					<div className={`flex flex-col w-full p-5 justify-center items-center ${aesthetics.textColour}`}>
						<span className="font-bold-24">{MyGlobal.FormatCurrency(m.amount)}</span>
					</div>
					<span className={`w-full p-2 text-center tracking-widest ${aesthetics.background} font-medium-10 text-white`}>{m.label}</span>
				</div>
			);
		});
	}

	function uiPettyCash() {
		return (
			<div className="flex flex-col w-full p-2 space-y-2 justify-center items-start">
				<div className="flex w-full justify-start items-center">{uiHeading(modules.PettyCash)}</div>
				<div className="flex w-full space-x-32 justify-between items-center">{uiPettyCashBlock()}</div>
			</div>
		);
	}

	function uiPettyCashBlock() {
		return Object.values(main.pettyCash).map((m, n) => {
			const aesthetics = getAesthetics(n);

			return (
				<div className={`flex flex-col w-full justify-between items-center rounded shadow ${aesthetics.transparentBackground} ${aesthetics.border}`}>
					<div className={`flex flex-col w-full p-5 justify-center items-center ${aesthetics.textColour}`}>
						<span className="font-bold-24">{MyGlobal.FormatCurrency(m.amount)}</span>
					</div>
					<span className={`w-full p-2 text-center tracking-widest ${aesthetics.background} font-medium-10 text-white`}>{m.label}</span>
				</div>
			);
		});
	}

	function uiRVs() {
		return (
			<div className="flex flex-col w-full p-2 space-y-2 justify-center items-start">
				<div className="flex w-full justify-between items-center">
					<div className="flex w-fit space-x-2.5 justify-start items-center">
						{uiHeading(baseModules.Rv)}
						<Badge value={api.projects.length} />
						<Badge value={`Total ${main.totalRvAmount}`} />
					</div>
				</div>
				<div className="flex w-full space-x-32 justify-between items-center">{uiRVsBlock()}</div>
			</div>
		);
	}

	function uiRVsBlock() {
		return Object.values(main.rv).map((m, n) => {
			const aesthetics = getAesthetics(n);

			return (
				<div className={`flex flex-col w-full justify-between items-center rounded shadow ${aesthetics.transparentBackground} ${aesthetics.border}`}>
					<div className={`flex flex-col w-full p-5 space-y-2.5 justify-center items-center ${aesthetics.textColour}`}>
						<div className="flex space-x-1 justify-center items-center">
							<span className="font-medium-18">{m.count}</span>
						</div>
						<span className="font-bold-24">{MyGlobal.FormatCurrency(m.amount)}</span>
					</div>
					<span className={`w-full p-2 text-center tracking-widest ${aesthetics.background} font-medium-10 text-white`}>{m.label}</span>
				</div>
			);
		});
	}

	function uiSelectedModule() {
		return (
			<div className="flex flex-col w-full h-full px-5 py-2.5 space-y-5 justify-start items-center">
				{main.selectedCategory == categories.All ? <AllTransactions /> : main.selectedCategory == categories.Inward ? uiInward() : uiOutward()}
			</div>
		);
	}

	function uiVendors() {
		return (
			<div className="flex flex-col w-full p-2 space-y-2 justify-center items-start">
				<div className="flex w-full justify-start items-center">{uiHeading(vendorsView)}</div>
				<div className="flex w-full space-x-32 justify-between items-center">{uiVendorsBlock()}</div>
			</div>
		);
	}

	function uiVendorsBlock() {
		return Object.values(main.vendors).map((m, n) => {
			const aesthetics = getAesthetics(n);

			return (
				<div className={`flex flex-col w-full justify-between items-center rounded shadow ${aesthetics.transparentBackground} ${aesthetics.border}`}>
					<div className={`flex flex-col w-full p-5 space-y-2.5 justify-center items-center ${aesthetics.textColour}`}>
						<div className="flex space-x-1 justify-center items-center">
							<span className="font-medium-18">{m.count}</span>
						</div>
						<span className="font-bold-24">{MyGlobal.FormatCurrency(m.amount)}</span>
					</div>
					<span className={`w-full p-2 text-center tracking-widest ${aesthetics.background} font-medium-10 text-white`}>{m.label}</span>
				</div>
			);
		});
	}

	// Hooks
	useEffect(() => {
		getSupportData();

		return () => {
			setModuleProps(invoicesView, null);
			setModuleProps(thisView, null);
		};
	}, []);

	// Main UI
	return uiMain();
}
