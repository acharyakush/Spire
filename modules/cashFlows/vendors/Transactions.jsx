"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import writeXlsxFile from "write-excel-file/browser";
import ReactDatePicker from "react-datepicker";
import MyConstants from "@/utilities/constants";
import NewTransaction from "@/modals/cashFlows/vendors/NewTransaction";
import EditTransaction from "@/modals/cashFlows/vendors/EditTransaction";

import { Virtuoso } from "react-virtuoso";
import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { TextInputNative } from "@/components/Inputs";
import { Badge, SpinnerBig } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faChevronRight, faExclamationTriangle, faFileExcel, faMultiply, faPlusCircle, faSearch, faSortAmountAsc, faSortAmountDesc } from "@fortawesome/free-solid-svg-icons";

export default function Transactions({ head, reload, unmount }) {
	// Business Logic
	const headers = MyConstants.TableHeaders.Transactions.General;
	const isUserAdministrator = MyGlobal.IsUserAdministrator();

	const [api, setApi] = useState({
		transactions: { copy: [], data: [] },
	});

	const [loading, setLoading] = useState({
		adding: false,
		supportData: false,
	});

	const [mounted, setMounted] = useState({
		editTransaction: false,
		newTransaction: false,
	});

	const [other, setOther] = useState({
		find: {
			date: { from: "", to: "" },
			transaction: "",
		},
		selectedTransaction: {},
		sort: { column: "", isAscending: false },
	});

	const wrapper = "flex flex-col w-full h-full justify-center items-center";

	const fromDateClearButtonStyle = other.find.date.from ? "cursor-pointer primary-text" : "hidden";
	const toDateClearButtonStyle = other.find.date.to ? "cursor-pointer primary-text" : "hidden";
	const findClearButtonStyle = other.find.transaction ? "cursor-pointer primary-text" : "hidden";

	// Functions
	function doExcelExport() {
		const records = [];
		const _records = [];

		const columnsWidth = [];
		const dataHeaders = [];

		const rowHeight = 34;
		const maximumColumnWidth = 20;

		const rowHeaders = Object.values(headers);
		const blankRows = [{ span: rowHeaders.length, height: rowHeight, colSpan: 2 }];

		doSorting().forEach((fe) => {
			records.push(dayjs(fe.entry_at).format("DD-MM-YYYY"), fe.firm_name, fe.bank_name, fe.amount, fe.particulars, fe.bank_name, fe.payment_type, fe.remarks, fe.entry_by_name);
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
				value: `${MyConstants.Modules.Base.Vendors} > ${head.purpose}'s Transactions (${api.transactions.data.length})`,
			},
		];

		const finalData = [header, blankRows, dataHeaders];
		MyGlobal.SeparateObjectsIntoArrays(_records, rowHeaders.length).forEach((fe) => finalData.push(fe));

		writeXlsxFile(finalData, {
			columns: columnsWidth,
			fileName: `${MyConstants.Modules.Base.Vendors} > ${head.purpose}'s Transactions.xlsx`,
			fontFamily: "Segoe UI",
			fontSize: 9,
		});
	}

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
				const paymentSource = String(f.payment_source).toLowerCase();
				const paymentType = String(f.payment_type).toLowerCase();
				const remarks = String(f.remarks).toLowerCase();

				return amount.includes(findTerm) || entryByName.includes(findTerm) || firmName.includes(findTerm) || bankName.includes(findTerm) || particulars.includes(findTerm) || paymentSource.includes(findTerm) || paymentType.includes(findTerm) || remarks.includes(findTerm);
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

	async function getSupportData(action) {
		if (action && action === "reload-root-statistics") {
			reload(action);
		}

		setLoading((s) => ({ ...s, supportData: true }));

		try {
			const response = await axios.get(MyConstants.ApiEndpoints.Vendors.GetTransactionsSupportData, MyGlobal.GetHeaders({ headId: head.id, vendorId: head.vendorId }));

			if (response.status === 200) {
				const transactions = response.data.transactions.map((m) => {
					let firmName = "";
					let bankName = "";

					const firms = response.data.firms.find((f) => f.id === m.firm_id);
					const banks = response.data.banks.find((f) => f.id === m.bank_id);

					if (typeof firms === "object") {
						firmName = firms.name;
					}

					if (typeof banks === "object") {
						bankName = banks.name;
					}

					return {
						...m,
						amount: Number(m.amount),
						bank_name: bankName,
						entry_at: new Date(m.entry_at),
						entry_by_name: MyGlobal.GetAnyDataFromId(m.entry_by_id, "full_name"),
						firm_name: firmName,
					};
				});

				transactions.unshift({
					amount: Number(head.amount),
					bank_name: head.bank.name,
					entry_at: new Date(head.entryAt),
					entry_by_name: head.entryBy.name,
					firm_name: head.firm.name,
					particulars: "",
					payment_source_name: head.paymentSource,
					payment_type: "",
					remarks: head.remarks,
				});

				setApi({
					transactions: {
						copy: transactions,
						data: transactions,
					},
				});
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, `${MyConstants.Modules.Base.CashFlow} => ${MyConstants.Modules.Base.Vendors} => ${MyConstants.Modules.Derived.NewVendor} => Add Transaction`);
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

	function toggleEditTransaction(object) {
		setOther((s) => ({ ...s, selectedTransaction: { ...object, head } ?? {} }));
		setMounted((s) => ({ ...s, editTransaction: object ? true : false }));
	}

	function toggleNewTransaction() {
		setMounted((s) => ({ ...s, newTransaction: !s.newTransaction }));
	}

	// UI Components
	function uiBody() {
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
		return <TextInputNative id="findBox" icon={faSearch} onChange={(e) => setFind("transaction", e.target.value)} onClearButtonClick={() => setFind("transaction", "")} placeholder="Find" showClearButton={findClearButtonStyle} tabIndex="3" value={other.find.transaction} width="w-36" />;
	}

	function uiFooter() {
		let totalAmount = 0;

		if ("amount" in head) {
			totalAmount = Number(head.amount);
		}

		const totalPaidAmount = MyGlobal.ThousandSeparator(head.amountPaid);
		const totalPending = MyGlobal.ThousandSeparator(head.amountPending);

		return (
			<span className="w-full space-x-5 text-center text-white font-regular-10">
				<span>
					Pending <b className="font-bold-10">{totalPending}</b>
				</span>
				<span />
				<span>
					Paid <b className="font-bold-10">{totalPaidAmount}</b>
				</span>
				<span />
				<span>
					Total <b className="font-bold-10">{MyGlobal.ThousandSeparator(totalAmount)}</b>
				</span>
			</span>
		);
	}

	function uiFromDate() {
		return (
			<div className="flex w-36 h-7.5 px-2.5 space-x-1 justify-start items-center rounded bottom-shadow contrast-background">
				<FontAwesomeIcon className="primary-text" icon={faCalendar} size="sm" />
				<ReactDatePicker className="w-20 h-6 bg-transparent outline-none font-regular-10" dateFormat="dd-MM-YYYY" dropdownMode="select" endDate={other.find.date.to} onChange={(e) => setFind("from", e)} peekNextMonth placeholderText="From" selected={other.find.date.from} selectsStart startDate={other.find.date.from} showMonthDropdown showYearDropdown tabIndex="1" />
				<FontAwesomeIcon className={fromDateClearButtonStyle} onClick={() => setFind("from", "")} icon={faMultiply} />
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
		return (
			<div className="flex flex-col w-full h-full justify-start items-center">
				<div className="flex w-full px-5 py-2.5 justify-between items-center">
					<div className="flex w-1/2 space-x-2 justify-start items-center">
						<div className="flex w-full space-x-2.5 justify-start items-center">
							<span className="cursor-pointer hover:underline hover:underline-offset-8 hover:decoration-[--primary] view-heading" onClick={() => unmount()}>
								{MyConstants.Modules.Base.Vendors}
							</span>
							<FontAwesomeIcon className="gray-text" icon={faChevronRight} size="xs" />
							<span className="view-heading">{head.purpose}'s Transactions</span>
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
				<div className="flex flex-col w-full h-full justify-center items-center contrast-background">{uiBody()}</div>
			</div>
		);
	}

	function uiRows(row, i) {
		const isParentRow = i == 0;

		const background = () => {
			if (isParentRow) {
				return "primary-background-transparent-01";
			} else {
				if (isUserAdministrator) {
					return "hovered-rows-2";
				} else {
					return "contrast-background";
				}
			}
		};

		const colour = () => {
			if (isParentRow) {
				return "cursor-not-allowed";
			} else {
				if (isUserAdministrator) {
					return "cursor-pointer";
				} else {
					return "cursor-default";
				}
			}
		};

		const style = `flex flex-wrap w-[11.11%] min-h-9 justify-center items-center text-center ${colour()}`;
		const wrapper = `flex w-full justify-center items-center ${background()} bottom-border font-regular-10 black-text`;

		const amount = MyGlobal.HighlightText(row.amount, other.find.transaction);
		const entryByName = MyGlobal.HighlightText(row.entry_by_name, other.find.transaction);
		const firmName = MyGlobal.HighlightText(row.firm_name, other.find.transaction);
		const bankName = MyGlobal.HighlightText(row.bank_name, other.find.transaction);
		const particulars = MyGlobal.HighlightText(row.particulars, other.find.transaction);
		const paymentSource = MyGlobal.HighlightText(row.payment_source, other.find.transaction);
		const paymentType = MyGlobal.HighlightText(row.payment_type, other.find.transaction);
		const remarks = MyGlobal.HighlightText(row.remarks, other.find.transaction);

		return (
			<div className={wrapper} key={i} onClick={() => !isParentRow && toggleEditTransaction(row)}>
				<span className={style}>{dayjs(row.entry_at).format("DD-MM-YYYY")}</span>

				<span className={style} dangerouslySetInnerHTML={{ __html: firmName }} />
				<span className={style} dangerouslySetInnerHTML={{ __html: bankName }} />
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
			<div className="flex w-36 h-7.5 px-2.5 space-x-1 justify-center items-center rounded bottom-shadow contrast-background">
				<FontAwesomeIcon className="primary-text" icon={faCalendar} size="sm" />
				<ReactDatePicker className="w-20 h-6 bg-transparent outline-none font-regular-10" dateFormat="dd-MM-YYYY" dropdownMode="select" endDate={other.find.date.to} onChange={(e) => setFind("to", e)} placeholderText="To" peekNextMonth selected={other.find.date.to} selectsEnd startDate={other.find.date.to} showMonthDropdown showYearDropdown tabIndex="2" />
				<FontAwesomeIcon className={toDateClearButtonStyle} onClick={() => setFind("to", "")} icon={faMultiply} />
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
					<Virtuoso className="w-full h-full overflow-y-auto scrollbar-gutter primary-horizontal-border contrast-background" data={doSorting()} itemContent={(i, row) => uiRows(row, i)} totalCount={api.transactions.copy.length} />
					<div className="flex w-full h-9 justify-center items-center primary-border primary-background">{uiFooter()}</div>
				</div>
			);
		}
	}

	useEffect(() => {
		getSupportData();
	}, []);

	useEffect(() => {
		if (other.find.date.from && other.find.date.to) {
			doFiltering("entryAt");
		}
	}, [other.find.date]);

	useEffect(() => {
		doFiltering("");
	}, [other.find.transaction]);

	return (
		<>
			{uiMain()}

			{mounted.editTransaction && <EditTransaction mount={mounted.editTransaction} reload={getSupportData} transaction={other.selectedTransaction} unmount={toggleEditTransaction} />}

			{mounted.newTransaction && <NewTransaction head={head} mount={mounted.newTransaction} reload={getSupportData} unmount={toggleNewTransaction} />}
		</>
	);
}
