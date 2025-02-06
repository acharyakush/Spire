"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import ReactDatePicker from "react-datepicker";
import MyConstants from "@/utilities/constants";
import NewTransaction from "@/modals/cashFlows/NewTransaction";

import { Virtuoso } from "react-virtuoso";
import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { TextInputNative } from "@/components/Inputs";
import { Badge, SpinnerBig } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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

export default function Transactions({ entity, reload, unmount }) {
	// Business Logic
	const headers = MyConstants.TableHeaders.Transactions.General;

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
		isNewTransactionsOpen: false,
		sort: { column: "", isAscending: false },
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

				const amount = String(f.amount);
				const entryByName = String(f.entry_by_name).toLowerCase();
				const ownerFirmsName = String(f.owner_firm_name).toLowerCase();
				const ownerFirmsBanksName = String(f.owner_firm_bank_name).toLowerCase();
				const particulars = String(f.particulars).toLowerCase();
				const paymentSource = String(f.payment_source).toLowerCase();
				const paymentType = String(f.payment_type).toLowerCase();
				const remarks = String(f.remarks).toLowerCase();

				return (
					amount.includes(findTerm) ||
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
				} else if (column == headers.Amount && isAscending) {
					return a.amount - b.amount;
				} else if (column == headers.Amount && !isAscending) {
					return b.amount - a.amount;
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
			const response = await axios.get(
				MyConstants.ApiEndpoints.CashFlows.Modules.GetTransactions,
				MyGlobal.GetHeaders({ entityId: entity.id, moduleId: entity.module.id }),
			);

			if (response.status === 200) {
				const transactions = response.data.transactions.map((m) => {
					let ownerFirmsName = "";
					let ownerFirmsBanksName = "";

					const ownerFirmsObj = response.data.ownerFirms.find((f) => f.id === m.owner_firm_id);

					const ownerFirmsBanksObj = response.data.ownerFirmsBanks.find((f) => f.id === m.owner_firm_bank_id);

					if (typeof ownerFirmsObj === "object") {
						ownerFirmsName = ownerFirmsObj.name;
					}

					if (typeof ownerFirmsBanksObj === "object") {
						ownerFirmsBanksName = ownerFirmsBanksObj.name;
					}

					return {
						...m,
						amount: Number(m.amount),
						entry_at: new Date(m.entry_at),
						entry_by_name: MyGlobal.GetAnyDataFromId(m.entry_by_id, "full_name"),
						owner_firm_name: ownerFirmsName,
						owner_firm_bank_name: ownerFirmsBanksName,
					};
				});

				setApi({
					transactions: {
						copy: transactions,
						data: transactions,
					},
				});

				setOther((s) => ({ ...s, hasMounted: true }));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, `${MyConstants.Modules.Base.CashFlow} => ${entity.module.name} => Transactions => Get Support Data`);
		} finally {
			setLoading((s) => ({ ...s, supportData: false }));
		}
	}

	function getTotalPaidAmount() {
		let total = 0;

		for (const i of api.transactions.copy) {
			total += Number(i.amount);
		}

		return total;
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
		setOther((s) => ({ ...s, isNewTransactionsOpen: !s.isNewTransactionsOpen }));
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
				<span className="flex w-[11.11%] justify-center items-center cursor-pointer font-medium-10" key={i}>
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

	function uiRows(row, i) {
		const style = "flex flex-wrap w-[11.11%] min-h-9 justify-center items-center text-center";

		const amount = MyGlobal.HighlightText(MyGlobal.ThousandSeparator(row.amount), other.find.transaction);
		const entryByName = MyGlobal.HighlightText(row.entry_by_name, other.find.transaction);
		const ownerFirmsName = MyGlobal.HighlightText(row.owner_firm_name, other.find.transaction);
		const ownerFirmsBanksName = MyGlobal.HighlightText(row.owner_firm_bank_name, other.find.transaction);
		const particulars = MyGlobal.HighlightText(row.particulars, other.find.transaction);
		const paymentSource = MyGlobal.HighlightText(row.payment_source, other.find.transaction);
		const paymentType = MyGlobal.HighlightText(row.payment_type, other.find.transaction);
		const remarks = MyGlobal.HighlightText(row.remarks, other.find.transaction);

		return (
			<div className="flex w-full justify-center items-center contrast-background bottom-border font-regular-10 black-text" key={i}>
				<span className={style}>{dayjs(row.entry_at).format("DD-MM-YYYY")}</span>

				<span className={style} dangerouslySetInnerHTML={{ __html: ownerFirmsName }} />
				<span className={style} dangerouslySetInnerHTML={{ __html: ownerFirmsBanksName }} />
				<span className={style} dangerouslySetInnerHTML={{ __html: amount }} />
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
		if (loading.supportData) {
			return (
				<div className={wrapper}>
					<SpinnerBig />
				</div>
			);
		} else if (!api.transactions.copy.length) {
			return (
				<div className={wrapper}>
					<FontAwesomeIcon className="text-yellow-500" icon={faExclamationTriangle} size="7x" />
					<span className="font-regular-12 gray-text">No transactions found.</span>
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
					<div className="flex w-full h-9 justify-center items-center primary-border primary-background">{uiTransactionsFooter()}</div>
				</div>
			);
		}
	}

	function uiTransactionsFooter() {
		console.log(entity);

		const totalPaidAmount = getTotalPaidAmount();
		const totalAmount = api.transactions.data.reduce((pv, cv) => {
			return pv + Number(cv.amount);
		}, 0);
		const totalPending = MyGlobal.ThousandSeparator(totalAmount - totalPaidAmount);

		return (
			<span className="w-full space-x-5 text-center text-white font-regular-10">
				<span>
					Pending <b className="font-bold-10">{totalPending}</b>
				</span>
				<span />
				<span>
					Paid <b className="font-bold-10">{MyGlobal.ThousandSeparator(totalPaidAmount)}</b>
				</span>
				<span />
				<span>
					Total <b className="font-bold-10">{MyGlobal.ThousandSeparator(entity.amount)}</b>
				</span>
			</span>
		);
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
	if (!other.hasMounted) {
		return;
	}

	return (
		<div className="flex flex-col w-full h-full justify-start items-center">
			<div className="flex w-full px-5 py-2.5 justify-between items-center">
				<div className="flex w-1/2 space-x-2 justify-start items-center">
					<div className="flex w-full space-x-2 justify-start items-center">
						<span className="view-heading">{MyConstants.Modules.Base.CashFlow}</span>
						<FontAwesomeIcon className="gray-text" icon={faChevronRight} size="xs" />
						<span className="cursor-pointer hover:underline hover:underline-offset-8 view-heading" onClick={() => unmount()}>
							{entity.module.name}
						</span>
						<FontAwesomeIcon className="gray-text" icon={faChevronRight} size="xs" />
						<span className="view-heading">{entity.name}'s Transactions</span>
						{api.transactions.copy.length > 0 && <Badge value={getRowsCount()} />}
					</div>
				</div>
				<div className="flex w-1/2 space-x-2 justify-end items-center">
					<div className="flex w-full space-x-2 justify-end items-center">
						{uiFromDate()}
						{uiToDate()}
					</div>
					{uiFind()}
					{uiExport()}
				</div>
			</div>
			<div className="flex flex-col w-full h-full justify-center items-center contrast-background">{uiMain()}</div>
			{other.isNewTransactionsOpen && (
				<NewTransaction entity={entity} mount={other.isNewTransactionsOpen} reload={reload} unmount={toggleNewTransaction} />
			)}
		</div>
	);
}
