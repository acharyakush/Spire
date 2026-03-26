"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import writeXlsxFile from "write-excel-file/browser";
import ReactDatePicker from "react-datepicker";
import { ApiEndpoints, BaseModules, CashFlowSubModules } from "@/utilities/constants";

import { Virtuoso } from "react-virtuoso";
import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { TextInputNative } from "@/components/Inputs";
import { Badge, SpinnerBig } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { faCalendar, faCheck, faExclamationTriangle, faFileExcel, faIndustry, faMultiply, faSearch, faSortAmountAsc, faSortAmountDesc } from "@fortawesome/free-solid-svg-icons";
import { AllTransactionsHeaders } from "@/utilities/headers";

export default function AllTransactions() {
	// Business Logic
	const thisView = BaseModules.CashFlow;

	const [api, setApi] = useState({
		allTransactions: { copy: [], data: [] },
		firms: [],
		totalAmountPaid: 0,
		totalAmountReceived: 0,
	});

	const [loading, setLoading] = useState({
		supportData: false,
	});

	const [other, setOther] = useState({
		find: {
			date: { from: "", to: "" },
			term: "",
		},
		company: {},
		sort: { column: "", isAscending: false },
	});

	const wrapper = "flex flex-col w-full h-full justify-center items-center";

	const showClearCompanyButton = Object.values(other.company).length ? "cursor-pointer primary-text" : "hidden";
	const showFromDateClearButton = other.find.date.from ? "cursor-pointer primary-text" : "hidden";
	const showToDateClearButton = other.find.date.to ? "cursor-pointer primary-text" : "hidden";
	const showFindClearButton = other.find.term ? "cursor-pointer primary-text" : "hidden";

	// Functions
	function doExcelExport() {
		const records = [];
		const _records = [];

		const columnsWidth = [];
		const dataHeaders = [];

		const rowHeight = 34;
		const maximumColumnWidth = 20;

		const rowHeaders = Object.values(AllTransactionsHeaders);
		const blankRows = [{ span: rowHeaders.length, height: rowHeight, colSpan: 2 }];

		doSorting().forEach((fe) => {
			const entryAt = dayjs(fe.entry_at).format("DD-MM-YYYY");

			records.push(entryAt, fe.module, fe.bank_name, fe.amount_paid, fe.amount_received, fe.particulars, fe.payment_source, fe.payment_type, fe.remarks, fe.entry_by_name);
		});

		records.forEach((fe) => {
			_records.push({
				align: "center",
				alignVertical: "center",
				color: "#000000",
				height: rowHeight,
				type: String,
				value: String(fe),
				wrap: true,
			});
		});

		rowHeaders.forEach((fe) => {
			dataHeaders.push({
				align: "center",
				alignVertical: "center",
				fontWeight: "bold",
				height: rowHeight,
				value: fe,
				width: maximumColumnWidth,
			});

			columnsWidth.push({ width: maximumColumnWidth });
		});

		const header = [
			{
				align: "center",
				alignVertical: "center",
				fontSize: 16,
				fontWeight: "bold",
				height: 44,
				span: rowHeaders.length,
				value: `${thisView} > All Transactions (${api.allTransactions.data.length})`,
			},
		];

		const finalData = [header, blankRows, dataHeaders];
		MyGlobal.SeparateObjectsIntoArrays(_records, rowHeaders.length).forEach((fe) => finalData.push(fe));

		writeXlsxFile(finalData, {
			columns: columnsWidth,
			fileName: `${thisView} - All Transactions.xlsx`,
			fontFamily: "Segoe UI",
			fontSize: 9,
		});
	}

	function doFiltering(type) {
		const filtered = api.allTransactions.copy.filter((f) => {
			if (type == "entryAt") {
				const entryAt = new Date(f.entry_at);

				if (entryAt >= other.find.date.from && entryAt <= other.find.date.to) {
					return f;
				}
			} else {
				if (Object.values(other.company).length) {
					return f.firm_id === other.company?.id;
				}

				const findTerm = other.find.term.toLowerCase();

				const module = String(f.module).toLowerCase();
				const bankName = String(f.bank_name).toLowerCase();
				const amountPaid = String(f.amount_paid).toLowerCase();
				const amountReceived = String(f.amount_received).toLowerCase();
				const particulars = String(f.particulars).toLowerCase();
				const paymentSource = String(f.payment_source).toLowerCase();
				const paymentType = String(f.payment_type).toLowerCase();
				const remarks = String(f.remarks).toLowerCase();
				const entryBy = String(f.entry_by_name).toLowerCase();

				return module.includes(findTerm) || bankName.includes(findTerm) || amountPaid.includes(findTerm) || amountReceived.includes(findTerm) || particulars.includes(findTerm) || paymentSource.includes(findTerm) || paymentType.includes(findTerm) || remarks.includes(findTerm) || entryBy.includes(findTerm);
			}
		});

		setApi((s) => ({ ...s, allTransactions: { ...s.allTransactions, data: filtered } }));
	}

	function doSorting() {
		if (other.sort.column != "") {
			return api.allTransactions.data.sort((a, b) => {
				const aEntryAt = new Date(a.entry_at);
				const bEntryAt = new Date(b.entry_at);

				const { column, isAscending } = other.sort;

				if (column == AllTransactionsHeaders.Date && isAscending) {
					return aEntryAt - bEntryAt;
				} else if (column == AllTransactionsHeaders.Date && !isAscending) {
					return bEntryAt - aEntryAt;
				} else if (column == AllTransactionsHeaders.Module && isAscending) {
					return a.module.localeCompare(b.module);
				} else if (column == AllTransactionsHeaders.Module && !isAscending) {
					return b.module.localeCompare(a.module);
				} else if (column == AllTransactionsHeaders.BankName && isAscending) {
					return a.bank_name.localeCompare(b.bank_name);
				} else if (column == AllTransactionsHeaders.BankName && !isAscending) {
					return b.bank_name.localeCompare(a.bank_name);
				} else if (column == AllTransactionsHeaders.AmountPaid && isAscending) {
					return a.amount_paid - b.amount_paid;
				} else if (column == AllTransactionsHeaders.AmountPaid && !isAscending) {
					return b.amount_paid - a.amount_paid;
				} else if (column == AllTransactionsHeaders.AmountReceived && isAscending) {
					return a.amount_received - b.amount_received;
				} else if (column == AllTransactionsHeaders.AmountReceived && !isAscending) {
					return b.amount_received - a.amount_received;
				} else if (column == AllTransactionsHeaders.Particulars && isAscending) {
					return a.particulars.localeCompare(b.particulars);
				} else if (column == AllTransactionsHeaders.Particulars && !isAscending) {
					return b.particulars.localeCompare(a.particulars);
				} else if (column == AllTransactionsHeaders.PaymentSource && isAscending) {
					return a.payment_source.localeCompare(b.payment_source);
				} else if (column == AllTransactionsHeaders.PaymentSource && !isAscending) {
					return b.payment_source.localeCompare(a.payment_source);
				} else if (column == AllTransactionsHeaders.PaymentType && isAscending) {
					return a.payment_type.localeCompare(b.payment_type);
				} else if (column == AllTransactionsHeaders.PaymentType && !isAscending) {
					return b.payment_type.localeCompare(a.payment_type);
				} else if (column == AllTransactionsHeaders.Remarks && isAscending) {
					return a.remarks.localeCompare(b.remarks);
				} else if (column == AllTransactionsHeaders.Remarks && !isAscending) {
					return b.remarks.localeCompare(a.remarks);
				} else if (column == AllTransactionsHeaders.EntryBy && isAscending) {
					return a.entry_by_name.localeCompare(b.entry_by_name);
				} else if (column == AllTransactionsHeaders.EntryBy && !isAscending) {
					return b.entry_by_name.localeCompare(a.entry_by_name);
				} else {
					return bEntryAt - aEntryAt;
				}
			});
		} else {
			return api.allTransactions.data;
		}
	}

	function getRowsCount() {
		if (api.allTransactions.data.length != api.allTransactions.copy.length) {
			return `${api.allTransactions.data.length} / ${api.allTransactions.copy.length}`;
		} else {
			return api.allTransactions.data.length;
		}
	}

	async function getSupportData() {
		setLoading((s) => ({ ...s, supportData: true }));

		try {
			const response = await axios.get(ApiEndpoints.CashFlows.GetAllTransactions, MyGlobal.GetHeaders());

			if (response.status == 200) {
				let totalAmountPaid = 0;
				let totalAmountReceived = 0;

				const transactions = [];

				Object.entries(response.data).forEach(([key, values]) => {
					function getModuleName() {
						switch (key) {
							case "affiliates":
								return BaseModules.Affiliates;
							case "cashFlows":
								return BaseModules.CashFlow;
							case "invoices":
								return BaseModules.Invoices;
							case "pettyCash":
								return CashFlowSubModules.PettyCash.name;
							case "rv":
								return BaseModules.Rv;
							case "vendors":
								return BaseModules.Vendors;
						}
					}

					const data = Array.isArray(values) ? values : [values];
					const moduleName = getModuleName();

					let amountPaid = 0;
					let amountReceived = 0;
					let firmId = "";
					let paymentSource = "";
					let paymentType = "";

					if (key !== "banks") {
						data.forEach((fe) => {
							if ([BaseModules.Invoices, BaseModules.Rv].includes(moduleName)) {
								amountReceived = Number(fe.amount);
							} else {
								paymentType = fe.payment_type;
								firmId = fe.firm_id;

								if (moduleName === CashFlowSubModules.PettyCash.name) {
									amountPaid = +fe.amount_paid;
								} else {
									if ("amount" in fe) {
										amountPaid = +fe.amount;
									}
								}
							}

							if (![BaseModules.Invoices, CashFlowSubModules.PettyCash.name, BaseModules.Rv].includes(moduleName)) {
								paymentSource = MyGlobal.GetBankName(fe.payment_source, response.data.banks);
							}

							if ("module_id" in fe) {
								if (fe.module_id === CashFlowSubModules.OtherIncome.id) {
									amountReceived = Number(fe.amount_received);
								} else {
									amountPaid = +fe.amount;
								}
							}

							transactions.push({
								amount_paid: amountPaid,
								amount_received: amountReceived,
								bank_name: paymentSource,
								entry_at: fe.entry_at,
								entry_by_name: MyGlobal.GetAnyDataFromId(fe.entry_by_id, "full_name"),
								firm_id: firmId,
								module: moduleName,
								particulars: fe.particulars,
								payment_source: paymentSource,
								payment_type: paymentType,
								remarks: fe.remarks,
							});
						});
					}
				});

				transactions.forEach((fe) => {
					totalAmountPaid += fe.amount_paid;
					totalAmountReceived += fe.amount_received;
				});

				setApi({
					allTransactions: {
						copy: transactions,
						data: transactions,
					},
					firms: response.data.firms,
					totalAmountPaid,
					totalAmountReceived,
				});
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, `${thisView} => Get All Transactions`);
		} finally {
			setLoading((s) => ({ ...s, supportData: false }));
		}
	}

	function setFind(key, value) {
		if (key == "from" || key == "to") {
			setOther((s) => ({ ...s, find: { ...s.find, date: { ...s.find.date, [key]: value } } }));
		} else {
			setOther((s) => ({ ...s, find: { ...s.find, term: value } }));
		}
	}

	function setCompany(value) {
		setOther((s) => ({ ...s, company: value }));
	}

	function setSort(header) {
		if (header != AllTransactionsHeaders.Date) {
			setOther((s) => ({ ...s, sort: { column: header, isAscending: !s.sort.isAscending } }));
		}
	}

	// UI Components
	function uiCompanies() {
		const wrapper = "flex max-w-full min-w-36 h-[30px] px-2.5 space-x-2 justify-start items-center focus:outline-none relative z-40 rounded bottom-shadow contrast-background full-border font-regular-10";

		return (
			<Menu as="div" className="flex max-w-full min-w-36 justify-center items-center relative">
				<MenuButton className={wrapper}>
					<FontAwesomeIcon className="primary-text" icon={faIndustry} size="sm" />
					<span className="gray-text">{other.company?.name || "Select Company"}</span>
					<FontAwesomeIcon className={showClearCompanyButton} onClick={() => setCompany({})} icon={faMultiply} />
				</MenuButton>
				<MenuItems className="absolute w-full top-8 right-0 origin-top-right rounded contrast-background bottom-shadow focus:outline-none z-50 full-border">{uiCompaniesList()}</MenuItems>
			</Menu>
		);
	}

	function uiCompaniesList() {
		return api.firms.map((m, i) => {
			const isSelected = m.id == other.company?.id;
			const aesthetics = isSelected ? "primary-background-transparent-01 primary-text" : "contrast-background black-text";
			const wrapper = `flex w-full p-2 space-x-2.5 justify-between items-center cursor-pointer border-y ${aesthetics} font-regular-10 text-left hovered-rows`;

			return (
				<MenuItem as="div" className={wrapper} key={i} onClick={() => setCompany(m)}>
					{m.name}
					{isSelected && <FontAwesomeIcon className="primary-text" icon={faCheck} />}
				</MenuItem>
			);
		});
	}

	function uiExport() {
		if (api.allTransactions.data.length && api.allTransactions.copy.length) {
			return (
				<button className="primary-button-transparent-background" onClick={() => doExcelExport()}>
					<FontAwesomeIcon className="primary-text" icon={faFileExcel} />
				</button>
			);
		}
	}

	function uiFind() {
		return <TextInputNative id="findBox" icon={faSearch} onChange={(e) => setFind("term", e.target.value)} onClearButtonClick={() => setFind("term", "")} placeholder="Find" showClearButton={showFindClearButton} tabIndex="3" value={other.find.term} width="w-36" />;
	}

	function uiFooter() {
		return Object.values(AllTransactionsHeaders).map((m, i) => {
			return (
				<div className="w-[10%] space-x-1 text-center text-white font-semibold-16" key={i}>
					{i === 3 && api.totalAmountReceived > 0 && MyGlobal.ThousandSeparator(api.totalAmountPaid)}
					{i === 4 && api.totalAmountReceived > 0 && MyGlobal.ThousandSeparator(api.totalAmountReceived)}
				</div>
			);
		});
	}

	function uiFromDate() {
		return (
			<div className="flex w-36 h-7.5 px-2.5 space-x-1 justify-start items-center rounded bottom-shadow contrast-background">
				<FontAwesomeIcon className="primary-text" icon={faCalendar} size="sm" />
				<ReactDatePicker className="w-20 h-6 bg-transparent outline-none font-regular-10" dateFormat="dd-MM-YYYY" dropdownMode="select" endDate={other.find.date.to} onChange={(e) => setFind("from", e)} peekNextMonth placeholderText="From" selected={other.find.date.from} selectsStart startDate={other.find.date.from} showMonthDropdown showYearDropdown tabIndex="1" />
				<FontAwesomeIcon className={showFromDateClearButton} onClick={() => setFind("from", "")} icon={faMultiply} />
			</div>
		);
	}

	function uiHeaders() {
		return Object.values(AllTransactionsHeaders).map((m, i) => {
			const showSortArrow = m == other.sort.column ? "block" : "hidden";

			return (
				<span className="flex w-[10%] justify-center items-center cursor-pointer font-medium-10" key={i}>
					<div className="flex w-full space-x-2 justify-center items-center text-center text-white" onClick={() => setSort(m)}>
						<span>{m}</span>
						<span className={showSortArrow}>{uiSortArrows(m)}</span>
					</div>
				</span>
			);
		});
	}

	function uiMain() {
		if (loading.supportData) {
			return <SpinnerBig />;
		} else if (!api.allTransactions.copy.length) {
			return (
				<div className={wrapper}>
					<FontAwesomeIcon className="text-yellow-500" icon={faExclamationTriangle} size="7x" />
					<span className="font-regular-12 gray-text">No transactions generated.</span>
				</div>
			);
		} else if (api.allTransactions.copy.length && !api.allTransactions.data.length) {
			return (
				<div className={wrapper}>
					<FontAwesomeIcon className="text-yellow-500" icon={faExclamationTriangle} size="7x" />
					<span className="font-regular-12 gray-text">No transactions found. Try changing your search term.</span>
				</div>
			);
		} else {
			return (
				<div className="flex w-full h-full space-y-2 justify-center items-center relative">
					<div className="flex flex-col w-full h-full justify-center items-start">
						<div className="flex w-full h-9 justify-center items-center primary-background primary-border">{uiHeaders()}</div>
						<Virtuoso className="w-full h-full overflow-y-auto scrollbar-gutter primary-horizontal-border contrast-background" data={doSorting()} itemContent={(i, row) => uiRows(row, i)} totalCount={api.allTransactions.data.length} />
						<div className="flex w-full h-9 justify-center items-center primary-background">{uiFooter()}</div>
					</div>
				</div>
			);
		}
	}

	function uiRows(row, i) {
		const style = "flex flex-wrap w-[10%] min-h-9 justify-center items-center text-center";

		const wrapper = `flex w-full justify-center items-center contrast-background bottom-border font-regular-11 black-text`;

		const entryAt = dayjs(row.entry_at).format("DD-MM-YYYY");
		const module = MyGlobal.HighlightText(row.module, other.find.term);
		const bankName = MyGlobal.HighlightText(row.bank_name, other.find.term);
		const amountPaid = MyGlobal.HighlightText(row.amount_paid, other.find.term);
		const amountReceived = MyGlobal.HighlightText(row.amount_received, other.find.term);
		const particulars = MyGlobal.HighlightText(row.particulars, other.find.term);
		const paymentSource = MyGlobal.HighlightText(row.payment_source, other.find.term);
		const paymentType = MyGlobal.HighlightText(row.payment_type, other.find.term);
		const remarks = MyGlobal.HighlightText(row.remarks, other.find.term);
		const entryByName = MyGlobal.HighlightText(row.entry_by_name, other.find.term);

		return (
			<div className={wrapper} key={i}>
				<span className={style}>{entryAt}</span>
				<span className={style} dangerouslySetInnerHTML={{ __html: module }} />
				<span className={style} dangerouslySetInnerHTML={{ __html: bankName }} />
				<span className={`${style} red-text`} dangerouslySetInnerHTML={{ __html: amountPaid || "" }} />
				<span className={`${style} green-text`} dangerouslySetInnerHTML={{ __html: amountReceived || "" }} />
				<span className={style} dangerouslySetInnerHTML={{ __html: particulars }} />
				<span className={style} dangerouslySetInnerHTML={{ __html: paymentSource }} />
				<span className={style} dangerouslySetInnerHTML={{ __html: paymentType }} />
				<span className={style} dangerouslySetInnerHTML={{ __html: remarks }} />
				<span className={style} dangerouslySetInnerHTML={{ __html: entryByName }} />
			</div>
		);
	}

	function uiSortArrows(column) {
		if (other.sort.column == column) {
			if (other.sort.isAscending) {
				return <FontAwesomeIcon className="text-white" icon={faSortAmountDesc} size="sm" />;
			} else {
				return <FontAwesomeIcon className="text-white" icon={faSortAmountAsc} size="sm" />;
			}
		}
	}

	function uiToDate() {
		return (
			<div className="flex w-36 h-7.5 px-2.5 space-x-1 justify-center items-center rounded bottom-shadow contrast-background">
				<FontAwesomeIcon className="primary-text" icon={faCalendar} size="sm" />
				<ReactDatePicker className="w-20 h-6 bg-transparent outline-none font-regular-10" dateFormat="dd-MM-YYYY" dropdownMode="select" endDate={other.find.date.to} onChange={(e) => setFind("to", e)} placeholderText="To" peekNextMonth selected={other.find.date.to} selectsEnd startDate={other.find.date.to} showMonthDropdown showYearDropdown tabIndex="2" />
				<FontAwesomeIcon className={showToDateClearButton} onClick={() => setFind("to", "")} icon={faMultiply} />
			</div>
		);
	}

	// Hooks
	useEffect(() => {
		getSupportData();
	}, []);

	useEffect(() => {
		doFiltering("");
	}, [other.find.term, other.company]);

	useEffect(() => {
		if (other.find.date.from && other.find.date.to) {
			doFiltering("entryAt");
		} else {
			doFiltering("");
		}
	}, [other.find.date]);

	// Main UI
	return (
		<div className="flex flex-col w-full h-full justify-start items-center">
			<div className="flex w-full pb-2.5 justify-between items-center">
				<div className="flex w-1/2 space-x-2 justify-start items-center">
					<div className="flex w-full space-x-2 justify-start items-center">
						<span className="view-heading">All Transactions</span>
						{api.allTransactions.data.length > 0 && <Badge value={getRowsCount()} />}
					</div>
				</div>
				<div className="flex w-1/2 space-x-2 justify-end items-center">
					<div className="flex w-full space-x-2 justify-end items-center">
						{uiCompanies()}
						{uiFromDate()}
						{uiToDate()}
					</div>
					{uiFind()}
					{uiExport()}
				</div>
			</div>
			<div className="flex flex-col w-full h-full justify-center items-center contrast-background">{uiMain()}</div>
		</div>
	);
}
