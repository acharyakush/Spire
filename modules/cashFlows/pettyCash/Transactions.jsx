"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import ReactDatePicker from "react-datepicker";
import MyConstants from "@/utilities/constants";

import { Virtuoso } from "react-virtuoso";
import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { TextInputNative } from "@/components/Inputs";
import { Badge, SpinnerBig } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NewTransaction } from "@/modals/cashFlows/pettyCash/miscellaneous";
import {
	faCalendar,
	faChevronRight,
	faExclamationTriangle,
	faFileExcel,
	faMultiply,
	faPlusCircle,
	faSearch,
	faSortAmountAsc,
	faSortAmountDesc,
} from "@fortawesome/free-solid-svg-icons";

export default function Transactions({ reload, unmount }) {
	// Business Logic
	const headers = MyConstants.TableHeaders.Transactions.PettyCash;
	const modules = MyConstants.Modules.Other.CashFlowModules;
	const thisView = MyConstants.Modules.Base.CashFlow;

	const [api, setApi] = useState({
		transactions: { copy: [], data: [] },
	});

	const [loading, setLoading] = useState({
		adding: false,
		supportData: false,
	});

	const [other, setOther] = useState({
		find: {
			date: { from: "", to: "" },
			transaction: "",
		},
		hasMounted: false,
		sort: { column: "", isAscending: false },
	});

	const [mounted, setMounted] = useState({
		newTransaction: false,
	});

	const wrapper = "flex flex-col w-full h-full justify-center items-center";

	const showFromDateClearButton = other.find.date.from ? "cursor-pointer primary-text" : "hidden";
	const showToDateClearButton = other.find.date.to ? "cursor-pointer primary-text" : "hidden";
	const showFindClearButton = other.find.transaction ? "cursor-pointer primary-text" : "hidden";

	// Functions
	function doFiltering(type) {
		const filtered = api.transactions.copy.filter((f) => {
			if (type == "entryAt") {
				const startDate = new Date(other.find.date.from);
				const endDate = new Date(other.find.date.to);

				if (f.entry_at >= startDate && f.entry_at <= endDate) {
					return f;
				}
			} else {
				const findTerm = other.find.transaction.toLowerCase();

				const amountPaid = String(f.amount_received);
				const amountReceived = String(f.amount_received);
				const balance = String(f.balance);
				const entryByName = String(f.entry_by_name).toLowerCase();
				const ownerFirmsName = String(f.owner_firm_name).toLowerCase();
				const ownerFirmsBanksName = String(f.owner_firm_bank_name).toLowerCase();
				const particulars = String(f.particulars).toLowerCase();
				const paymentSource = String(f.payment_source).toLowerCase();
				const paymentType = String(f.payment_type).toLowerCase();
				const remarks = String(f.remarks).toLowerCase();

				return (
					amountPaid.includes(findTerm) ||
					amountReceived.includes(findTerm) ||
					balance.includes(findTerm) ||
					entryByName.includes(findTerm) ||
					ownerFirmsName.includes(findTerm) ||
					ownerFirmsBanksName.includes(findTerm) ||
					particulars.includes(findTerm) ||
					paymentSource.includes(findTerm) ||
					paymentType.includes(findTerm) ||
					remarks.includes(findTerm)
				);
			}
		});

		setApi((s) => ({ ...s, transactions: { ...s.transactions, data: filtered } }));
	}

	function doSorting() {
		if (other.sort.column != "") {
			return api.transactions.data.sort((a, b) => {
				const aEntryAt = new Date(a.entry_at);
				const bEntryAt = new Date(b.entry_at);

				const { column, isAscending } = other.sort;

				if (column == headers.Date && isAscending) {
					return aEntryAt - bEntryAt;
				} else if (column == headers.Date && !isAscending) {
					return bEntryAt - aEntryAt;
				} else if (column == headers.Firm && isAscending) {
					return a.owner_firm_name.localeCompare(b.owner_firm_name);
				} else if (column == headers.Firm && !isAscending) {
					return b.owner_firm_name.localeCompare(a.owner_firm_name);
				} else if (column == headers.Bank && isAscending) {
					return a.owner_firm_bank_name.localeCompare(b.owner_firm_bank_name);
				} else if (column == headers.Bank && !isAscending) {
					return b.owner_firm_bank_name.localeCompare(a.owner_firm_bank_name);
				} else if (column == headers.AmountPaid && isAscending) {
					return a.amount_paid - b.amount_paid;
				} else if (column == headers.AmountPaid && !isAscending) {
					return b.amount_paid - a.amount_paid;
				} else if (column == headers.AmountReceived && isAscending) {
					return a.amount_received - b.amount_received;
				} else if (column == headers.AmountReceived && !isAscending) {
					return b.amount_received - a.amount_received;
				} else if (column == headers.Balance && isAscending) {
					return a.balance - b.balance;
				} else if (column == headers.Balance && !isAscending) {
					return b.balance - a.balance;
				} else if (column == headers.Particulars && isAscending) {
					return a.particulars.localeCompare(b.particulars);
				} else if (column == headers.Particulars && !isAscending) {
					return b.particulars.localeCompare(a.particulars);
				} else if (column == headers.PaymentSource && isAscending) {
					return a.payment_source.localeCompare(b.payment_source);
				} else if (column == headers.PaymentSource && !isAscending) {
					return b.payment_source.localeCompare(a.payment_source);
				} else if (column == headers.PaymentType && isAscending) {
					return a.payment_type.localeCompare(b.payment_type);
				} else if (column == headers.PaymentType && !isAscending) {
					return b.payment_type.localeCompare(a.payment_type);
				} else if (column == headers.Remarks && isAscending) {
					return a.remarks.localeCompare(b.remarks);
				} else if (column == headers.Remarks && !isAscending) {
					return b.remarks.localeCompare(a.remarks);
				} else if (column == headers.EntryBy && isAscending) {
					return a.entry_by_name.localeCompare(b.entry_by_name);
				} else if (column == headers.EntryBy && !isAscending) {
					return b.entry_by_name.localeCompare(a.entry_by_name);
				} else {
					return bEntryAt - aEntryAt;
				}
			});
		} else {
			return api.transactions.data;
		}
	}

	function getRowsCount() {
		if (api.transactions.data.length != api.transactions.copy.length) {
			return `${api.transactions.data.length} / ${api.transactions.copy.length}`;
		} else {
			return api.transactions.data.length;
		}
	}

	async function getSupportData() {
		setLoading((s) => ({ ...s, supportData: true }));

		try {
			const response = await axios.get(MyConstants.ApiEndpoints.CashFlows.Modules.PettyCash.GetTransactions, MyGlobal.GetHeaders({}));

			if (response.status === 200) {
				let transactions = [];

				response.data.transactions.forEach((fe) => {
					let ownerFirmsName = "";
					let ownerFirmsBanksName = "";

					const ownerFirmsObj = response.data.ownerFirms.find((f) => f.id === fe.owner_firm_id);

					const ownerFirmsBanksObj = response.data.ownerFirmsBanks.find((f) => f.id === fe.owner_firm_bank_id);

					if (typeof ownerFirmsObj === "object") {
						ownerFirmsName = ownerFirmsObj.name;
					}

					if (typeof ownerFirmsBanksObj === "object") {
						ownerFirmsBanksName = ownerFirmsBanksObj.name;
					}

					transactions.push({
						...fe,
						amount: Number(fe.amount),
						entry_at: new Date(fe.entry_at),
						entry_by_name: MyGlobal.GetAnyDataFromId(fe.entry_by_id, "full_name"),
						owner_firm_name: ownerFirmsName,
						owner_firm_bank_name: ownerFirmsBanksName,
					});
				});

				transactions.unshift(response.data.openingBalance.at(0));

				setApi({
					transactions: {
						copy: transactions,
						data: transactions,
					},
				});
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, `${thisView} => ${modules.PettyCash.name} => Transactions => Get Support Data`);
		} finally {
			setLoading((s) => ({ ...s, supportData: false }));
		}
	}

	function setFind(key, value) {
		if (key == "from" || key == "to") {
			setOther((s) => ({ ...s, find: { ...s.find, date: { ...s.find.date, [key]: value } } }));
		} else {
			setOther((s) => ({ ...s, find: { ...s.find, [key]: value } }));
		}
	}

	function setSort(header) {
		if (header != headers.Date) {
			setOther((s) => ({ ...s, sort: { column: header, isAscending: !s.sort.isAscending } }));
		}
	}

	function toggleNewTransaction() {
		setMounted((s) => ({ ...s, newTransaction: !s.newTransaction }));
	}

	// UI Components
	function uiExport() {
		if (api.transactions.data.length && api.transactions.copy.length) {
			return (
				<button className="primary-button-transparent-background" onClick={() => doExcelExport()}>
					<FontAwesomeIcon className="primary-text" icon={faFileExcel} />
				</button>
			);
		}
	}

	function uiFind() {
		return (
			<TextInputNative
				id="findBox"
				icon={faSearch}
				onChange={(e) => setFind("transaction", e.target.value)}
				onClearButtonClick={() => setFind("transaction", "")}
				placeholder="Find"
				showClearButton={showFindClearButton}
				tabIndex="3"
				value={other.find.transaction}
				width="w-36"
			/>
		);
	}

	function uiFooter() {
		let totalAmountPaid = 0;
		let totalAmountReceived = 0;

		const totalBalance = Number(api.transactions.copy.at(-1)?.balance);
		const _totalBalance = MyGlobal.ThousandSeparator(totalBalance);

		api.transactions.data.forEach((fe) => {
			if ("amount_paid" in fe) {
				totalAmountPaid += Number(fe.amount_paid);
			}
			totalAmountReceived += Number(fe.amount_received);
		});

		return (
			<span className="w-full space-x-5 text-center text-white font-regular-10">
				<span>
					Paid <b className="font-bold-10">{MyGlobal.ThousandSeparator(totalAmountPaid)}</b>
				</span>
				<span />
				<span>
					Received <b className="font-bold-10">{MyGlobal.ThousandSeparator(totalAmountReceived)}</b>
				</span>
				<span />
				<span>
					Balance <b className="font-bold-10">{_totalBalance}</b>
				</span>
			</span>
		);
	}

	function uiFromDate() {
		return (
			<div className="flex w-36 h-[30px] px-2.5 space-x-1 justify-start items-center rounded bottom-shadow contrast-background">
				<FontAwesomeIcon className="primary-text" icon={faCalendar} size="sm" />
				<ReactDatePicker
					className="w-20 h-6 bg-transparent outline-none font-regular-10"
					dateFormat="dd-MM-YYYY"
					dropdownMode="select"
					endDate={other.find.date.to}
					onChange={(e) => setFind("from", e)}
					peekNextMonth
					placeholderText="From"
					selected={other.find.date.from}
					selectsStart
					startDate={other.find.date.from}
					showMonthDropdown
					showYearDropdown
					tabIndex="1"
				/>
				<FontAwesomeIcon className={showFromDateClearButton} onClick={() => setFind("from", "")} icon={faMultiply} />
			</div>
		);
	}

	function uiHeaders() {
		return Object.values(headers).map((m, i) => {
			const showSortArrow = m == other.sort.column ? "block" : "hidden";

			return (
				<span className="flex w-[12.50%] justify-center items-center cursor-pointer font-medium-10" key={i}>
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
		} else {
			return (
				<div className="flex w-full h-full space-y-2 justify-center items-center relative">
					{uiTransactions()}
					<div className="absolute right-5 bottom-10 cursor-pointer" onClick={() => toggleNewTransaction()}>
						<FontAwesomeIcon className="primary-text" icon={faPlusCircle} size="3x" />
					</div>
				</div>
			);
		}
	}

	function uiNewStartingBalance() {
		return <FontAwesomeIcon className="cursor-pointer primary-text" icon={faPlusCircle} onClick={() => toggleNewStartingBalance()} />;
	}

	function uiRows(row, i) {
		const style = "flex flex-wrap w-[12.50%] min-h-9 justify-center items-center text-center";

		const colour = Number(row.balance) < 1000 ? "orange-text font-bold-10" : "black-text";

		const ownerFirmsName = MyGlobal.HighlightText(row.owner_firm_name, other.find.transaction);
		const paymentType = MyGlobal.HighlightText(row.payment_type, other.find.transaction);

		const remarks = MyGlobal.HighlightText(row.remarks, other.find.transaction);

		const amountPaid = MyGlobal.HighlightText(MyGlobal.ThousandSeparator(row.amount_paid), other.find.transaction);
		const amountReceived = MyGlobal.HighlightText(MyGlobal.ThousandSeparator(row.amount_received), other.find.transaction);

		const balance = MyGlobal.HighlightText(MyGlobal.ThousandSeparator(row.balance), other.find.transaction);

		let particulars = "";
		let entryByName = "";

		if (i === 0) {
			entryByName = "Signiix Advisors";
			particulars = "SHREE GANESHAY NAMAH";
		} else {
			entryByName = MyGlobal.HighlightText(row.entry_by_name, other.find.transaction);
			particulars = MyGlobal.HighlightText(row.particulars, other.find.transaction);
		}

		return (
			<div className="flex w-full justify-center items-center contrast-background bottom-border font-regular-10 black-text" key={i}>
				<span className={style}>{dayjs(row.entry_at).format("DD-MM-YYYY")}</span>
				<span className={style} dangerouslySetInnerHTML={{ __html: ownerFirmsName }} />
				<span className={style} dangerouslySetInnerHTML={{ __html: paymentType }} />
				<span className={style} dangerouslySetInnerHTML={{ __html: particulars }} />
				<span className={style} dangerouslySetInnerHTML={{ __html: remarks }} />
				<span className={`${style} red-text`} dangerouslySetInnerHTML={{ __html: amountPaid }} />
				<span className={`${style} green-text`} dangerouslySetInnerHTML={{ __html: amountReceived }} />
				<span className={`${style} ${colour}`} dangerouslySetInnerHTML={{ __html: balance }} />
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
			<div className="flex w-36 h-[30px] px-2.5 space-x-1 justify-center items-center rounded bottom-shadow contrast-background">
				<FontAwesomeIcon className="primary-text" icon={faCalendar} size="sm" />
				<ReactDatePicker
					className="w-20 h-6 bg-transparent outline-none font-regular-10"
					dateFormat="dd-MM-YYYY"
					dropdownMode="select"
					endDate={other.find.date.to}
					onChange={(e) => setFind("to", e)}
					placeholderText="To"
					peekNextMonth
					selected={other.find.date.to}
					selectsEnd
					startDate={other.find.date.to}
					showMonthDropdown
					showYearDropdown
					tabIndex="2"
				/>
				<FontAwesomeIcon className={showToDateClearButton} onClick={() => setFind("to", "")} icon={faMultiply} />
			</div>
		);
	}

	function uiTransactions() {
		if (!api.transactions.copy.length && !api.transactions.data.length) {
			return (
				<div className={wrapper}>
					<FontAwesomeIcon className="text-yellow-500" icon={faExclamationTriangle} size="7x" />
					<span className="font-regular-12 gray-text">No transactions found.</span>
				</div>
			);
		} else if (api.transactions.copy.length && !api.transactions.data.length) {
			return (
				<div className={wrapper}>
					<FontAwesomeIcon className="text-yellow-500" icon={faExclamationTriangle} size="7x" />
					<span className="font-regular-12 gray-text">No transactions found. Try using different search term.</span>
				</div>
			);
		} else {
			return (
				<div className="flex flex-col w-full h-full justify-center items-start">
					<div className="flex w-full h-9 justify-center items-center primary-background primary-border">{uiHeaders()}</div>
					<Virtuoso
						className="w-full h-full overflow-y-auto scrollbar-gutter primary-horizontal-border contrast-background"
						data={doSorting()}
						itemContent={(i, row) => uiRows(row, i)}
						totalCount={api.transactions.copy.length}
					/>
					<div className="flex w-full h-9 justify-center items-center primary-border primary-background">{uiFooter()}</div>
				</div>
			);
		}
	}

	useEffect(() => {
		getSupportData();
	}, []);

	useEffect(() => {
		doFiltering("");
	}, [other.find.transaction]);

	useEffect(() => {
		if (other.find.date.from && other.find.date.to) {
			doFiltering("entryAt");
		}
	}, [other.find.date]);

	// Main UI
	return (
		<div className="flex flex-col w-full h-full justify-start items-center">
			<div className="flex w-full px-5 py-2.5 justify-between items-center">
				<div className="flex w-1/2 space-x-2 justify-start items-center">
					<div className="flex w-full space-x-2 justify-start items-center">
						<span
							className="cursor-pointer hover:underline hover:underline-offset-8 hover:decoration-[--primary] view-heading"
							onClick={() => unmount()}>
							{thisView}
						</span>
						<FontAwesomeIcon className="gray-text" icon={faChevronRight} size="xs" />
						<span className="view-heading">{modules.PettyCash.name}'s Transactions</span>
						{api.transactions.copy.length > 0 && <Badge value={getRowsCount()} />}
					</div>
				</div>
				<div className="flex w-1/2 space-x-2 justify-end items-center">
					<div className="flex w-full space-x-2 justify-end items-center">
						{uiNewStartingBalance()}
						{uiFromDate()}
						{uiToDate()}
					</div>
					{uiFind()}
					{uiExport()}
				</div>
			</div>
			<div className="flex flex-col w-full h-full justify-center items-center contrast-background">{uiMain()}</div>
			{mounted.newTransaction && (
				<NewTransaction lastTransaction={api.transactions.copy.at(-1)} mount={mounted.newTransaction} reload={reload} unmount={toggleNewTransaction} />
			)}
		</div>
	);
}
