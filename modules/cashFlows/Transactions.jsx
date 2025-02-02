"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import ReactDatePicker from "react-datepicker";
import MyConstants from "@/utilities/constants";

import { Virtuoso } from "react-virtuoso";
import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { Badge, Spinner, SpinnerBig } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ComboBox, ComboBox2, DatePicker, TextInput, TextInputNative } from "@/components/Inputs";
import {
	faBank,
	faBuilding,
	faCalendar,
	faChevronRight,
	faExclamationTriangle,
	faFile,
	faFileExcel,
	faIndianRupee,
	faInfoCircle,
	faMultiply,
	faNoteSticky,
	faSearch,
	faSortAmountAsc,
	faSortAmountDesc,
} from "@fortawesome/free-solid-svg-icons";

export default function Transactions({ module, reload, unmount }) {
	// Business Logic
	const headers = MyConstants.TableHeaders.Transactions.General;

	const [api, setApi] = useState({
		ownerFirms: [],
		ownerFirmsBanks: { copy: [], data: [] },
		paymentTypes: [],
		paymentSources: { copy: [], data: [] },
		transactions: { copy: [], data: [] },
	});

	const [loading, setLoading] = useState({
		adding: false,
		supportData: false,
	});

	const [main, setMain] = useState({
		amount: "",
		entryAt: new Date(),
		ownerFirm: { banks: [], id: "", name: "", selectedBank: { id: "", name: "" } },
		particulars: "",
		paymentSource: { id: "", name: "" },
		paymentType: "",
		remarks: "",
	});

	const [other, setOther] = useState({
		find: {
			date: { from: "", to: "" },
			ownerFirms: "",
			ownerFirmsBank: "",
			paymentSource: "",
			transaction: "",
		},
		hasMounted: false,
		sort: { column: "", isAscending: false },
	});

	const wrapper = "flex flex-col w-full h-full justify-center items-center";

	const showFromDateClearButton = other.find.date.from ? "cursor-pointer primary-text" : "hidden";
	const showToDateClearButton = other.find.date.to ? "cursor-pointer primary-text" : "hidden";
	const showFindClearButton = other.find.transaction ? "cursor-pointer primary-text" : "hidden";

	// Functions
	function areAllDetailsFilled() {
		if (!main.amount || !main.particulars || !main.paymentType || !main.remarks) {
			return false;
		}

		if (!main.paymentSource.id || !main.paymentSource.name) {
			return false;
		}

		if (!main.ownerFirm.id || !main.ownerFirm.name || !main.ownerFirm.selectedBank.id || !main.ownerFirm.selectedBank.name) {
			return false;
		}

		return true;
	}

	async function doAddition() {
		setLoading((s) => ({ ...s, adding: true }));

		const body = {
			amount: Number(main.amount),
			entryAt: main.entryAt,
			module,
			ownerFirmsId: main.ownerFirm.id,
			ownerFirmsBankId: main.ownerFirm.selectedBank.id,
			particulars: main.particulars,
			paymentSource: main.paymentSource.id,
			paymentType: main.paymentType,
			remarks: main.remarks,
			userId: MyGlobal.GetUserId(),
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.CashFlows.AddTransaction, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reload("reload-root-statistics");
				resetFields();
				getSupportData();

				MyGlobal.AddActivity(`Added transaction for <b>${module}</b>.`, MyConstants.Modules.Base.CashFlow);

				MyGlobal.ShowSuccessToast(MyConstants.Messages.TransactionAdded);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Cash Flow => Affiliates => Single Affiliate => Add Transaction");
		} finally {
			setLoading((s) => ({ ...s, adding: false }));
		}
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
				const ownerFirmsName = String(f.owner_firms_name).toLowerCase();
				const ownerFirmsBanksName = String(f.owner_firms_banks_name).toLowerCase();
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
					return a.owner_firms_name.localeCompare(b.owner_firms_name);
				} else if (column == headers.Firm && !isAscending) {
					return b.owner_firms_name.localeCompare(a.owner_firms_name);
				} else if (column == headers.Bank && isAscending) {
					return a.owner_firms_banks_name.localeCompare(b.owner_firms_banks_name);
				} else if (column == headers.Bank && !isAscending) {
					return b.owner_firms_banks_name.localeCompare(a.owner_firms_banks_name);
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

	function getAddButtonStyle() {
		const disableAddButton = loading.adding || !areAllDetailsFilled() ? "pointer-events-none" : "pointer-events-auto";

		return `primary-button-condensed ${disableAddButton}`;
	}

	function getRowsCount() {
		if (api.transactions.data.length != api.transactions.copy.length) {
			return `${api.transactions.data.length} / ${api.transactions.copy.length}`;
		} else {
			return api.transactions.data.length;
		}
	}

	function getPaymentSources() {
		let list = !api.paymentSources.copy.length ? [] : api.paymentSources.copy;

		if (list.length) {
			const value = String(other.find.paymentSource);

			if (value !== "undefined") {
				list = api.paymentSources.copy.filter((f) => {
					return String(f.name).toLowerCase().includes(value.toLowerCase());
				});
			}
		}

		return list;
	}

	function getFilteredOwnerFirms() {
		let list = api.ownerFirms;
		const term = String(other.find.ownerFirms);

		if (term !== "undefined") {
			list = api.ownerFirms.filter((f) => {
				return String(f.name).toLowerCase().includes(term.toLowerCase());
			});
		}

		return list;
	}

	function getFilteredOwnerFirmsBanks() {
		let list = api.ownerFirmsBanks.copy;
		const term = String(other.find.ownerFirmsBank);

		if (term !== "undefined") {
			list = api.ownerFirmsBanks.copy.filter((f) => {
				return String(f.name).toLowerCase().includes(term.toLowerCase());
			});
		}

		return list;
	}

	function getTotalAmount() {
		let total = 0;

		for (const i of api.transactions.copy) {
			total += i.amount;
		}

		return MyGlobal.ThousandSeparator(total);
	}

	async function getSupportData() {
		setLoading((s) => ({ ...s, supportData: true }));

		try {
			const response = await axios.get(MyConstants.ApiEndpoints.CashFlows.GetTransactionSupportData, MyGlobal.GetHeaders({ module }));

			if (response.status === 200) {
				const basicPaymentSourceList = MyGlobal.GetBasicPaymentSourceList();

				const cashFlows = response.data.cashFlows.map((m) => {
					let ownerFirmsName = "";
					let ownerFirmsBanksName = "";

					const ownerFirmsObj = response.data.ownerFirms.find((f) => f.id === m.owner_firms_id);

					const ownerFirmsBanksObj = response.data.ownerFirmsBanks.find((f) => f.id === m.owner_firms_banks_id);

					if (typeof ownerFirmsObj === "object") {
						ownerFirmsName = ownerFirmsObj.name;
					}

					if (typeof ownerFirmsBanksObj === "object") {
						ownerFirmsBanksName = ownerFirmsBanksObj.name;
					}

					const isOutward = String(module).includes("Outward");

					const amount = isOutward ? Number(m.amount_paid) : Number(m.amount_received);

					return {
						...m,
						amount,
						entry_at: new Date(m.entry_at),
						entry_by_name: MyGlobal.GetAnyDataFromId(m.entry_by_id, "full_name"),
						owner_firms_name: ownerFirmsName,
						owner_firms_banks_name: ownerFirmsBanksName,
					};
				});

				setApi({
					ownerFirms: response.data.ownerFirms,
					ownerFirmsBanks: {
						copy: response.data.ownerFirmsBanks,
						data: response.data.ownerFirmsBanks,
					},
					paymentSources: {
						copy: basicPaymentSourceList,
						data: basicPaymentSourceList,
					},
					paymentTypes: JSON.parse(response.data.settings.at(0).value),
					transactions: {
						copy: cashFlows,
						data: cashFlows,
					},
				});

				setOther((s) => ({ ...s, hasMounted: true }));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, `${MyConstants.Modules.Base.CashFlow} => ${module} => Get Transaction Support Data Transaction`);
		} finally {
			setLoading((s) => ({ ...s, supportData: false }));
		}
	}

	function resetFields() {
		setMain({
			amount: "",
			entryAt: new Date(),
			ownerFirm: { banks: [], id: "", name: "", selectedBank: { id: "", name: "" } },
			particulars: "",
			paymentSource: { id: "", name: "" },
			paymentType: "",
			remarks: "",
		});
	}

	function setFind(key, value) {
		if (key == "from" || key == "to") {
			setOther((s) => ({ ...s, find: { ...s.find, date: { ...s.find.date, [key]: value } } }));
		} else {
			setOther((s) => ({ ...s, find: { ...s.find, [key]: value } }));
		}
	}

	function setInputs(key, value) {
		if (value) {
			if (key == "ownerFirms") {
				const banks = api.ownerFirmsBanks.copy.filter((f) => f.owner_firm_id == value.id);

				const revisedPaymentSources = MyGlobal.GetRevisedPaymentSourceList([banks.at(0)]);

				setApi((s) => ({
					...s,
					paymentSources: {
						copy: revisedPaymentSources,
						data: revisedPaymentSources,
					},
				}));

				setMain((s) => ({
					...s,
					ownerFirm: {
						banks,
						id: value.id,
						name: value.name,
						selectedBank: { id: banks.at(0).id, name: banks.at(0).name },
					},
				}));
			} else if (key == "ownerFirmsBank") {
				setMain((s) => ({
					...s,
					ownerFirm: {
						...s.ownerFirm,
						selectedBank: { id: value.id, name: value.name },
					},
				}));
			} else {
				setMain((s) => ({ ...s, [key]: value }));
			}

			setOther((s) => ({ ...s, find: { ...s.find, ownerFirms: "", ownerFirmsBank: "" } }));
		}
	}

	function setSort(header) {
		if (header != headers.Date) {
			setOther((s) => ({ ...s, sort: { column: header, isAscending: !s.sort.isAscending } }));
		}
	}

	// UI Components
	function uiAdd() {
		if (loading.adding) {
			return (
				<span className="px-3.5">
					<Spinner />
				</span>
			);
		} else {
			return "Add";
		}
	}

	function uiAmount() {
		return (
			<TextInput
				icon={faIndianRupee}
				id="amount"
				label="Amount"
				onChange={(e) => setInputs("amount", e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasNumbers(e.key) && e.preventDefault()}
				tabIndex="5"
				value={main.amount}
				width="w-full"
			/>
		);
	}

	function uiEntryAt() {
		return <DatePicker icon={faCalendar} label="Date" onChange={(e) => setInputs("entryAt", e)} tabIndex="1" value={main.entryAt} width="w-full" />;
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

	function uiFooter() {
		if (!loading.supportData) {
			return (
				<footer className="w-full dialog-footer">
					<button className={getAddButtonStyle()} onClick={() => doAddition()} tabIndex="10">
						{uiAdd()}
					</button>
				</footer>
			);
		}
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
				<div className="flex w-full h-full justify-between items-center">
					<div className="flex flex-col w-[70%] h-full space-y-2 justify-center items-center">{uiTransactions()}</div>
					<div className="flex flex-col w-[30%] h-full justify-between items-center">
						<div className="flex flex-col w-full h-full px-5 space-y-2 justify-center items-center primary-background-transparent-01">
							<div className="flex w-full space-x-4 justify-between items-center">
								{uiEntryAt()}
								{uiAmount()}
							</div>
							<div className="flex w-full space-x-4 justify-between items-center">
								{uiOwnerFirms()}
								{uiOwnerFirmsBanks()}
							</div>
							<div className="flex w-full space-x-4 justify-between items-center">
								{uiPaymentType()}
								{uiPaymentSource()}
							</div>
							<div className="flex w-full space-x-4 justify-center items-start">
								{uiParticulars()}
								{uiRemarks()}
							</div>
						</div>
						{uiFooter()}
					</div>
				</div>
			);
		}
	}

	function uiOwnerFirms() {
		return (
			<ComboBox2
				allowCreatingNewItem={false}
				comparingValue1="name"
				comparingValue2={main.ownerFirm.name}
				displayValue="name"
				filteredData={getFilteredOwnerFirms}
				hasDataObject
				icon={faBuilding}
				isReadOnly={false}
				label="Firm"
				onChange={(e) => setInputs("ownerFirms", e)}
				onClick={() => {}}
				onInputChange={(e) => setFind("ownerFirms", e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasAlphabets(e.key) && e.preventDefault()}
				searchedItem={other.find.ownerFirms}
				tabIndex="3"
				value={main.ownerFirm.name}
				width="w-full"
			/>
		);
	}

	function uiOwnerFirmsBanks() {
		return (
			<ComboBox2
				allowCreatingNewItem={false}
				comparingValue1="name"
				comparingValue2={main.ownerFirm.selectedBank.name}
				displayValue="name"
				filteredData={!main.ownerFirm.banks.length ? getFilteredOwnerFirmsBanks : main.ownerFirm.banks}
				hasDataObject
				icon={faBank}
				isReadOnly={false}
				label="Banks"
				onChange={(e) => setInputs("ownerFirmsBank", e)}
				onClick={() => {}}
				onInputChange={(e) => setFind("ownerFirmsBank", e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasAlphabets(e.key) && e.preventDefault()}
				searchedItem={other.find.ownerFirmsBank}
				tabIndex="4"
				value={main.ownerFirm.selectedBank.name}
				width="w-full"
			/>
		);
	}

	function uiParticulars() {
		return (
			<TextInput
				icon={faInfoCircle}
				id="particulars"
				label="Particulars"
				onChange={(e) => setInputs("particulars", e.target.value)}
				onKeyPress={() => {}}
				tabIndex="7"
				value={main.particulars}
				width="w-full"
			/>
		);
	}

	function uiPaymentSource() {
		return (
			<ComboBox2
				allowCreatingNewItem={false}
				comparingValue1="name"
				comparingValue2={main.paymentSource.name}
				displayValue="name"
				filteredData={getPaymentSources}
				hasDataObject
				icon={faBank}
				isReadOnly={false}
				label="Payment Source"
				onChange={(e) => setInputs("paymentSource", e)}
				onClick={() => {}}
				onInputChange={(e) => setFind("paymentSource", e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasAlphabets(e.key) && e.preventDefault()}
				searchedItem={other.find.paymentSource}
				tabIndex="2"
				value={main.paymentSource.name}
				width="w-full"
			/>
		);
	}

	function uiPaymentType() {
		return (
			<ComboBox
				allowCreatingNewItem={false}
				comparisonValue=""
				filteredData={api.paymentTypes}
				icon={faFile}
				label="Payment Type"
				onChange={(e) => setInputs("paymentType", e)}
				onClick={() => {}}
				onKeyPress={() => {}}
				searchedItem=""
				tabIndex="6"
				value={main.paymentType}
				width="w-full"
			/>
		);
	}

	function uiRemarks() {
		return (
			<TextInput
				icon={faNoteSticky}
				id="remarks"
				label="Remarks"
				onChange={(e) => setInputs("remarks", e.target.value)}
				onKeyPress={() => {}}
				tabIndex="8"
				value={main.remarks}
				width="w-full"
			/>
		);
	}

	function uiRows(row, i) {
		const style = "flex flex-wrap w-[11.11%] min-h-9 justify-center items-center text-center";

		const amount = MyGlobal.HighlightText(row.amount, other.find.transaction);

		const entryByName = MyGlobal.HighlightText(row.entry_by_name, other.find.transaction);

		const ownerFirmsName = MyGlobal.HighlightText(row.owner_firms_name, other.find.transaction);

		const ownerFirmsBanksName = MyGlobal.HighlightText(row.owner_firms_banks_name, other.find.transaction);

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
		return Object.values(headers).map((m, i) => {
			const showTotalAmount = i == 3 ? "visible" : "invisible";
			const wrapper = `w-[11.11%] space-x-1 text-center text-white font-medium-10 ${showTotalAmount}`;

			return (
				<span className={wrapper} key={i}>
					<span>{getTotalAmount()}</span>
				</span>
			);
		});
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
						<span className="cursor-pointer view-heading" onClick={() => unmount()}>
							{module}
						</span>
						<FontAwesomeIcon className="gray-text" icon={faChevronRight} size="xs" />
						<span className="view-heading">Transactions</span>
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
		</div>
	);
}
