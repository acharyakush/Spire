"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import ReactDatePicker from "react-datepicker";
import MyConstants from "@/utilities/constants";
import NewTransaction from "@/modals/cashFlows/NewTransaction";
import EditTransaction from "@/modals/cashFlows/EditTransaction";

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
		selectedTransaction: {},
		sort: { column: "", isAscending: false },
	});

	const [mounted, setMounted] = useState({
		editTransaction: false,
		newTransaction: false,
	});

	console.log(entity);

	const isUserAdministrator = MyGlobal.IsUserAdministrator();

	const isOfficeExpense = entity.module.id !== MyConstants.Modules.Other.CashFlowModules.OfficeExpense.id;
	const columnWidth = isOfficeExpense ? "w-[11.11%]" : "w-[12.50%]";

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
				const firmName = String(f.firm_name).toLowerCase();
				const bankName = String(f.bank_name).toLowerCase();
				const particulars = String(f.particulars).toLowerCase();
				const paymentSource = String(f.payment_source_name).toLowerCase();
				const paymentType = String(f.payment_type).toLowerCase();
				const remarks = String(f.remarks).toLowerCase();

				return (
					amount.includes(findTerm) ||
					entryByName.includes(findTerm) ||
					firmName.includes(findTerm) ||
					bankName.includes(findTerm) ||
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
					return a.firm_name.localeCompare(b.firm_name);
				} else if (column == headers.Firm && !isAscending) {
					return b.firm_name.localeCompare(a.firm_name);
				} else if (column == headers.Bank && isAscending) {
					return a.bank_name.localeCompare(b.bank_name);
				} else if (column == headers.Bank && !isAscending) {
					return b.bank_name.localeCompare(a.bank_name);
				} else if (column == headers.Amount && isAscending) {
					return a.amount - b.amount;
				} else if (column == headers.Amount && !isAscending) {
					return b.amount - a.amount;
				} else if (column == headers.Particulars && isAscending) {
					return a.particulars.localeCompare(b.particulars);
				} else if (column == headers.Particulars && !isAscending) {
					return b.particulars.localeCompare(a.particulars);
				} else if (column == headers.PaymentSource && isAscending) {
					return a.payment_source_name.localeCompare(b.payment_source_name);
				} else if (column == headers.PaymentSource && !isAscending) {
					return b.payment_source_name.localeCompare(a.payment_source_name);
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
				MyGlobal.GetHeaders({
					entityId: entity.id,
					headId: entity.head.id,
					moduleId: entity.module.id,
				}),
			);

			if (response.status === 200) {
				const transactions = response.data.transactions.map((m) => {
					let firmName = "";
					let bankName = "";
					let paymentSourceName = "";

					const firms = response.data.firms.find((f) => f.id === m.firm_id);
					const banks = response.data.banks.find((f) => f.id === m.bank_id);

					if (typeof firms === "object") {
						firmName = firms.name;
					}

					if (typeof banks === "object") {
						bankName = banks.name;
					}

					const paymentSourceObj = MyGlobal.GetBasicPaymentSourceList().find((f) => f.id === m.payment_source);

					if (typeof paymentSourceObj === "object") {
						paymentSourceName = paymentSourceObj.name;
					}

					return {
						...m,
						amount: Number(m.amount),
						entry_at: new Date(m.entry_at),
						entry_by_name: MyGlobal.GetAnyDataFromId(m.entry_by_id, "full_name"),
						firm_name: firmName,
						bank_name: bankName,
						payment_source_name: paymentSourceName,
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

	function reloadRootAndUnmount() {
		reload();
		unmount();
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

	function toggleEditTransaction(object) {
		if (isUserAdministrator) {
			setOther((s) => ({ ...s, selectedTransaction: object ?? {} }));
			setMounted((s) => ({ ...s, editTransaction: object ? true : false }));
		}
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
		return Object.values(headers)
			.filter((f) => {
				if (!isOfficeExpense) {
					return f !== headers.PaymentType;
				}
				return f;
			})
			.map((m, i) => {
				const showSortArrow = m == other.sort.column ? "block" : "hidden";
				const wrapper = `flex ${columnWidth} justify-center items-center cursor-pointer font-medium-10`;

				return (
					<span className={wrapper} key={i}>
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
		const colour = isUserAdministrator && "cursor-pointer";
		const style = `flex flex-wrap ${columnWidth} min-h-9 justify-center items-center text-center ${colour}`;

		const background = isUserAdministrator ? "hovered-rows-2" : "contrast-background";
		const wrapper = `flex w-full justify-center items-center ${background} bottom-border font-regular-10 black-text`;

		const amount = MyGlobal.HighlightText(MyGlobal.ThousandSeparator(row.amount), other.find.transaction);
		const entryByName = MyGlobal.HighlightText(row.entry_by_name, other.find.transaction);
		const firmName = MyGlobal.HighlightText(row.firm_name, other.find.transaction);
		const bankName = MyGlobal.HighlightText(row.bank_name, other.find.transaction);
		const particulars = MyGlobal.HighlightText(row.particulars, other.find.transaction);
		const paymentSource = MyGlobal.HighlightText(row.payment_source_name, other.find.transaction);
		const paymentType = MyGlobal.HighlightText(row.payment_type, other.find.transaction);
		const remarks = MyGlobal.HighlightText(row.remarks, other.find.transaction);

		return (
			<div className={wrapper} key={i} onClick={() => toggleEditTransaction(row)}>
				<span className={style}>{dayjs(row.entry_at).format("DD-MM-YYYY")}</span>

				<span className={style} dangerouslySetInnerHTML={{ __html: firmName }} />
				<span className={style} dangerouslySetInnerHTML={{ __html: bankName }} />
				<span className={style} dangerouslySetInnerHTML={{ __html: amount }} />
				<span className={style} dangerouslySetInnerHTML={{ __html: particulars }} />
				<span className={style} dangerouslySetInnerHTML={{ __html: paymentSource }} />
				{isOfficeExpense && <span className={style} dangerouslySetInnerHTML={{ __html: paymentType }} />}
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
		let totalAmount = 0;

		if ("head" in entity) {
			if ("amount" in entity.head) {
				totalAmount = Number(entity.head.amount);
			}
		}

		const totalPaidAmount = api.transactions.data.reduce((pv, cv) => {
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
					Total <b className="font-bold-10">{MyGlobal.ThousandSeparator(totalAmount)}</b>
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
						<span className="view-heading">{entity.head.purpose}'s Transactions</span>
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

			{mounted.editTransaction && (
				<EditTransaction
					entity={entity}
					mount={mounted.editTransaction}
					reload={reloadRootAndUnmount}
					transaction={other.selectedTransaction}
					unmount={toggleEditTransaction}
				/>
			)}

			{mounted.newTransaction && (
				<NewTransaction entity={entity} mount={mounted.newTransaction} reload={reloadRootAndUnmount} unmount={toggleNewTransaction} />
			)}
		</div>
	);
}
