"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import Draggable from "react-draggable";
import ReactDatePicker from "react-datepicker";
import MyConstants from "@/utilities/constants";

import { Virtuoso } from "react-virtuoso";
import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { Badge, Spinner, SpinnerBig } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { ComboBox2, DatePicker, TextArea, TextInput, TextInputNative } from "@/components/Inputs";
import {
	faAngleRight,
	faBank,
	faCalendar,
	faExclamationTriangle,
	faFileDownload,
	faFileExcel,
	faIndianRupee,
	faMultiply,
	faNoteSticky,
	faPlusCircle,
	faSearch,
	faSortAmountAsc,
	faSortAmountDesc,
	faXmark,
} from "@fortawesome/free-solid-svg-icons";

export function Transactions({ mount, project, reload, unmount }) {
	// Business Logic
	const headers = MyConstants.TableHeaders.Transactions.Invoice;
	const thisView = MyConstants.Modules.Base.Rv;

	const [api, setApi] = useState({
		banks: { copy: [], data: [] },
		transactions: { copy: [], data: [] },
	});

	const [loading, setLoading] = useState({
		adding: false,
		supportData: false,
	});

	const [main, setMain] = useState({
		amountReceived: "",
		entryAt: new Date(),
		particulars: "",
		paymentSource: { id: "", name: "" },
	});

	const [other, setOther] = useState({
		find: {
			entryAt: { from: "", to: "" },
			paymentSource: "",
			transaction: "",
		},
		hasError: false,
		isBoxMoved: false,
		sort: { column: "", isAscending: false },
	});

	let totalAmountPending = 0;

	if (project.amount_received === 0) {
		totalAmountPending = project.amount;
	} else {
		totalAmountPending = project.amount_pending;
	}

	const wrapper = "flex flex-col w-full h-full justify-center items-center";
	const errorStyle = other.hasError
		? "flex w-full h-[58px] p-2 mt-5 space-x-2.5 justify-center items-center rounded font-regular-10 red-background-transparent-01 red-border red-text"
		: "h-[58px] mt-5 invisible";

	const showFromDateClearButton = other.find.entryAt.from ? "cursor-pointer primary-text" : "hidden";
	const showToDateClearButton = other.find.entryAt.to ? "cursor-pointer primary-text" : "hidden";
	const showFindClearButton = other.find.transaction ? "cursor-pointer primary-text" : "hidden";

	const titleBarCursor = other.isBoxMoved ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header shadow draggable-handle ${titleBarCursor}`;

	// Functions
	async function doAddition() {
		try {
			setLoading((s) => ({ ...s, adding: true }));

			const body = {
				amount: main.amountReceived,
				customId: project.rv_id,
				entryAt: main.entryAt,
				particulars: main.particulars,
				projectId: project.id,
				source: main.paymentSource.id,
			};

			const response = await axios.post(MyConstants.ApiEndpoints.Rv.AddTransaction, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reload();

				setMain({
					amountReceived: "",
					entryAt: new Date(),
					particulars: "",
					paymentSource: { id: "", name: "" },
				});

				MyGlobal.AddActivity(`Added transaction in <b>${project.invoice_id}</b>.`, MyConstants.Modules.Base.Invoices);

				MyGlobal.ShowSuccessToast(MyConstants.Messages.TransactionAdded);

				getSupportData();
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, `${thisView} => Transactions => Add Transaction`);
		} finally {
			setLoading((s) => ({ ...s, adding: false }));
		}
	}

	function doFiltering(type) {
		const filteredData = api.transactions.data.filter((f) => {
			if (type == "entryAt") {
				const startDate = main.filter.from;
				const endDate = main.filter.to;

				if (f.entry_at >= startDate && f.entry_at <= endDate) {
					return f;
				}
			} else {
				const findTerm = other.find.transaction.toLowerCase();
				const particulars = String(f.particulars).toLowerCase();
				const paymentSource = String(f.source).toLowerCase();

				return particulars.includes(findTerm) || paymentSource.includes(findTerm) || String(f.amount).includes(findTerm);
			}
		});

		setApi((s) => ({ ...s, transactions: { ...s.transactions, data: filteredData } }));
	}

	function doSorting() {
		if (other.sort.column != "") {
			return api.transactions.data.sort((a, b) => {
				const { column, isAscending } = other.sort;

				if (column == headers.Particulars && isAscending) {
					return a.particulars.localeCompare(b.particulars);
				} else if (column == headers.Particulars && !isAscending) {
					return b.particulars.localeCompare(a.particulars);
				} else if (column == headers.AmountReceived && isAscending) {
					return a.amount - b.amount;
				} else if (column == headers.AmountReceived && !isAscending) {
					return b.amount - a.amount;
				} else if (column == headers.PaymentSource && isAscending) {
					return a.source.localeCompare(b.source);
				} else if (column == headers.PaymentSource && !isAscending) {
					return b.source.localeCompare(a.source);
				}
			});
		} else {
			return api.transactions.data;
		}
	}

	function findPaymentSource(name) {
		if (typeof name === "string") {
			setOther((s) => ({ ...s, find: { ...s.find, paymentSource: name } }));
		}
	}

	function getPaymentSources() {
		let list = !api.banks.copy.length ? [] : api.banks.copy;

		if (list.length) {
			const value = String(other.find.paymentSource);

			if (value !== "undefined") {
				list = api.banks.copy.filter((f) => {
					return String(f.name).toLowerCase().includes(value.toLowerCase());
				});
			}
		}

		return list;
	}

	async function getSupportData() {
		setLoading((s) => ({ ...s, supportData: true }));

		try {
			const response = await axios.get(
				MyConstants.ApiEndpoints.Rv.GetNewTransactionSupportData,
				MyGlobal.GetHeaders({
					firmId: project.firm_id,
					projectId: project.id,
				}),
			);

			if (response.status === 200) {
				const banks = MyGlobal.GetRevisedPaymentSourceList(response.data.banks);

				const _transactions = response.data.transactions.map((m) => {
					let source = "";
					const getSource = banks.find((f) => f.id === m.source);

					if (typeof getSource === "object") {
						source = getSource.name;
					}

					return {
						...m,
						amount: Number(m.amount),
						entry_at: new Date(m.entry_at),
						source,
					};
				});

				setApi({
					banks: {
						copy: banks,
						data: banks,
					},
					transactions: {
						copy: _transactions,
						data: _transactions,
					},
				});
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, `${thisView} => Payment Received => Get Support Data`);
		} finally {
			setLoading((s) => ({ ...s, supportData: false }));
		}
	}

	function getTotalAmount() {
		let total = 0;

		for (const i of api.transactions.copy) {
			total += i.amount;
		}

		return MyGlobal.ThousandSeparator(total);
	}

	function isAddEligible() {
		const clickEvent =
			!main.amountReceived || !main.particulars || !main.paymentSource.id || other.hasError || loading.adding
				? "pointer-events-none opacity-50"
				: "pointer-events-auto opacity-100";

		return `primary-button-condensed w-full mt-5 ${clickEvent}`;
	}

	function setBoxDrag() {
		setOther((s) => ({ ...s, isBoxMoved: !s.isBoxMoved }));
	}

	function setInputs(key, value) {
		if (value) {
			if (key === "amountReceived") {
				const hasError = Number(value) > totalAmountPending;

				setOther((s) => ({ ...s, hasError }));
				setMain((s) => ({ ...s, amountReceived: value }));
			} else {
				setMain((s) => ({ ...s, [key]: value }));
			}
		} else {
			setMain((s) => ({ ...s, [key]: value }));
		}
	}

	function setOthers(key, value) {
		if (value) {
			setOther((s) => ({ ...s, [key]: value }));
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

	function uiAmountReceived() {
		return (
			<TextInput
				icon={faIndianRupee}
				id="amountReceived"
				label="Amount Received"
				onChange={(e) => setInputs("amountReceived", e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasNumbers(e.key) && e.preventDefault()}
				tabIndex="3"
				value={main.amountReceived}
				width="w-full"
			/>
		);
	}

	function uiDate() {
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
				onChange={(e) => setInputs("transaction", e.target.value)}
				onClearButtonClick={() => setInputs("transaction", "")}
				placeholder="Find"
				showClearButton={showFindClearButton}
				tabIndex={3}
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
					endDate={other.find.entryAt.to}
					onChange={(e) => setInputs("from", e)}
					peekNextMonth
					placeholderText="From"
					tabIndex={1}
					selected={other.find.entryAt.from}
					selectsStart
					startDate={other.find.entryAt.from}
					showMonthDropdown
					showYearDropdown
				/>
				<FontAwesomeIcon className={showFromDateClearButton} onClick={() => setInputs("from", "")} icon={faMultiply} />
			</div>
		);
	}

	function uiFooter() {
		return Object.values(headers).map((m, i) => {
			const showTotalAmount = i == 2 ? "visible" : "invisible";
			const wrapper = `w-1/4 space-x-1 text-center primary-text font-medium-10 ${showTotalAmount}`;

			return (
				<span className={wrapper} key={i}>
					<span>{getTotalAmount()}</span>
				</span>
			);
		});
	}

	function uiHeaders() {
		return Object.values(headers).map((m, i) => {
			const showSortArrow = m == other.sort.column ? "block" : "hidden";

			return (
				<span className="flex w-1/4 justify-center items-center cursor-pointer font-medium-10" key={i}>
					<div className="flex w-full space-x-2 justify-center items-center primary-text" onClick={() => setSort(m)}>
						<span>{m}</span>
						<span className={showSortArrow}>{uiSortArrows(m)}</span>
					</div>
				</span>
			);
		});
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
					<div className="flex w-full pb-4 space-x-2 justify-start items-center font-medium-16 primary-text">
						<span>{project.company_name}</span>
						<FontAwesomeIcon className="gray-text" icon={faAngleRight} size="xs" />
						<span>{project.main_project_name}</span>
						<FontAwesomeIcon className="gray-text" icon={faAngleRight} size="xs" />
						<span>{project.sub_project_name}</span>
					</div>
					<div className="flex w-full pb-2 space-x-2 justify-end items-center">
						{uiFromDate()}
						{uiToDate()}
						{uiFind()}
						{uiExport()}
					</div>
					<div className="flex w-full h-9 justify-center items-center rounded-tl rounded-tr primary-background-transparent-01 primary-border">
						{uiHeaders()}
					</div>
					<Virtuoso
						className="w-full h-full overflow-y-auto scrollbar-gutter primary-horizontal-border contrast-background"
						data={doSorting()}
						itemContent={(i, row) => uiRows(row, i)}
						totalCount={api.transactions.copy.length}
					/>
					<div className="flex w-full h-9 justify-center items-center rounded-bl rounded-br primary-border primary-background-transparent-01">
						{uiFooter()}
					</div>
				</div>
			);
		}
	}

	function uiParticulars() {
		return (
			<TextArea
				icon={faNoteSticky}
				label="Particulars"
				onChange={(e) => setInputs("particulars", e.target.value)}
				onKeyDown={() => {}}
				rows={2}
				tabIndex="4"
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
				onInputChange={(e) => findPaymentSource(e.target.value)}
				onKeyPress={() => {}}
				searchedItem={other.find.paymentSource}
				tabIndex="2"
				value={main.paymentSource.name}
				width="w-full"
			/>
		);
	}

	function uiRows(row, i) {
		const style = "flex flex-wrap w-1/4 min-h-9 justify-center items-center text-center";

		const particulars = MyGlobal.HighlightText(row.particulars, other.find.transaction);
		const amount = MyGlobal.HighlightText(row.amount, other.find.transaction);
		const source = MyGlobal.HighlightText(row.source, other.find.transaction);

		return (
			<div className="flex w-full justify-center items-center contrast-background bottom-border font-regular-10 black-text" key={i}>
				<span className={style}>{dayjs(row.entry_at).format("DD-MM-YYYY")}</span>

				<span className={style} dangerouslySetInnerHTML={{ __html: particulars }} />
				<span className={style} dangerouslySetInnerHTML={{ __html: amount }} />
				<span className={style} dangerouslySetInnerHTML={{ __html: source }} />
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

	function uiTitleBar() {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full space-x-3 justify-start items-center">
					<span>{thisView}</span>
					<FontAwesomeIcon className="gray-text" icon={faAngleRight} size="xs" />
					<span>Amount Received</span>
				</span>
				<FontAwesomeIcon className="cursor-pointer" icon={faXmark} onClick={() => unmount(false)} />
			</DialogTitle>
		);
	}

	function uiToDate() {
		return (
			<div className="flex w-36 h-[30px] px-2.5 space-x-1 justify-center items-center rounded bottom-shadow contrast-background">
				<FontAwesomeIcon className="primary-text" icon={faCalendar} size="sm" />
				<ReactDatePicker
					className="w-20 h-6 bg-transparent outline-none font-regular-10"
					dateFormat="dd-MM-YYYY"
					dropdownMode="select"
					endDate={other.find.entryAt.to}
					onChange={(e) => setInputs("to", e)}
					placeholderText="To"
					peekNextMonth
					selected={other.find.entryAt.to}
					selectsEnd
					startDate={other.find.entryAt.to}
					showMonthDropdown
					showYearDropdown
					tabIndex={2}
				/>
				<FontAwesomeIcon className={showToDateClearButton} onClick={() => setInputs("to", "")} icon={faMultiply} />
			</div>
		);
	}

	// Hooks
	useEffect(() => {
		getSupportData();
	}, []);

	useEffect(() => {
		doFiltering("");
	}, [other.find.transaction]);

	useEffect(() => {
		if (other.find.entryAt.from && other.find.entryAt.to) {
			doFiltering("entryAt");
		}
	}, [other.find.entryAt]);

	// Main UI
	return (
		<Dialog as="div" className="relative z-50" open={mount} onClose={() => unmount()}>
			<div className="fixed inset-0 bg-black/50" />
			<div className="flex w-full justify-center items-center fixed inset-0 overflow-y-auto">
				<Draggable handle=".draggable-handle" onStart={() => setBoxDrag()} onStop={() => setBoxDrag()}>
					<DialogPanel className="w-4/5 h-[90%] transform overflow-hidden rounded contrast-background shadow">
						{uiTitleBar()}
						<div className="flex w-full h-[calc(100%-45px)] p-5 space-x-10 justify-center items-center overflow-y-auto scrollbar-gutter primary-light-background">
							<div className="flex w-3/4 h-full justify-center items-start">{uiTransactions()}</div>
							<div className="flex flex-col w-1/4 h-full justify-center items-start">
								{uiDate()}
								{uiPaymentSource()}
								{uiAmountReceived()}
								{uiParticulars()}
								<button className={isAddEligible()} onClick={() => doAddition()}>
									{uiAdd()}
								</button>
								<div className={errorStyle}>
									<span>Amount received cannot be more than the Amount pending</span>
									<span className="font-bold-12">{MyGlobal.ThousandSeparator(totalAmountPending)}</span>
								</div>
							</div>
						</div>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}

export function RvList({ mount, project, unmount }) {
	// Business Logic
	const headers = MyConstants.TableHeaders.Transactions.RvList;
	const thisView = MyConstants.Modules.Base.Rv;

	const [api, setApi] = useState({
		list: { copy: [], data: [] },
	});

	const [loading, setLoading] = useState({
		adding: false,
		supportData: false,
	});

	const [other, setOther] = useState({
		find: {
			createdAt: { from: "", to: "" },
			term: "",
		},
		isBoxMoved: false,
		sort: { column: "", isAscending: false },
	});

	const wrapper = "flex flex-col w-full h-full justify-center items-center";

	const showFromDateClearButton = other.find.createdAt.from ? "cursor-pointer primary-text" : "hidden";
	const showToDateClearButton = other.find.createdAt.to ? "cursor-pointer primary-text" : "hidden";
	const showFindClearButton = other.find.term ? "cursor-pointer primary-text" : "hidden";

	const titleBarCursor = other.isBoxMoved ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header shadow draggable-handle ${titleBarCursor}`;

	// Functions
	function doFiltering(type) {
		const filteredData = api.list.copy.filter((f) => {
			if (type == "createdAt") {
				const startDate = other.find.createdAt.from;
				const endDate = other.find.createdAt.to;

				if (f.created_at >= startDate && f.created_at <= endDate) {
					return f;
				}
			} else {
				const findTerm = other.find.term.toLowerCase();
				const id = String(f.custom_id).toLowerCase();
				const amount = String(f.amount).toLowerCase();

				return id.includes(findTerm) || amount.includes(findTerm);
			}
		});

		setApi((s) => ({ ...s, list: { ...s.list, data: filteredData } }));
	}

	function doSorting() {
		if (other.sort.column != "") {
			return api.list.data.sort((a, b) => {
				const aCreatedAt = new Date(a.created_at);
				const bCreatedAt = new Date(b.created_at);

				const { column, isAscending } = other.sort;

				if (column == headers.Date && isAscending) {
					return aCreatedAt - bCreatedAt;
				} else if (column == headers.Date && !isAscending) {
					return bCreatedAt - aCreatedAt;
				} else if (column == headers.Id && isAscending) {
					return a.custom_id.localeCompare(b.custom_id);
				} else if (column == headers.Id && !isAscending) {
					return b.custom_id.localeCompare(a.custom_id);
				} else if (column == headers.amount && isAscending) {
					return a.amount - b.amount;
				} else if (column == headers.amount && !isAscending) {
					return b.amount - a.amount;
				}
			});
		} else {
			return api.list.data;
		}
	}

	function getDataCount() {
		if (api.list.data.length != api.list.copy.length) {
			return `${api.list.data.length} / ${api.list.copy.length}`;
		} else {
			return api.list.data.length;
		}
	}

	async function getSupportData() {
		setLoading((s) => ({ ...s, supportData: true }));

		try {
			const response = await axios.get(
				MyConstants.ApiEndpoints.Getter,
				MyGlobal.GetHeaders({
					projectId: project.id,
					type: "get-rv-list",
				}),
			);

			if (response.status === 200) {
				setApi({
					list: {
						copy: response.data,
						data: response.data,
					},
				});
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, `${thisView} => Get Support Data`);
		} finally {
			setLoading((s) => ({ ...s, supportData: false }));
		}
	}

	function getTotalAmount() {
		let total = 0;

		for (const i of api.list.copy) {
			total += Number(i.amount);
		}

		return MyGlobal.ThousandSeparator(total);
	}

	function setBoxDrag() {
		setOther((s) => ({ ...s, isBoxMoved: !s.isBoxMoved }));
	}

	function setInputs(key, value) {
		if (key == "from" || key == "to") {
			setOther((s) => ({ ...s, find: { ...s.find, createdAt: { ...s.find.createdAt, [key]: value } } }));
		} else {
			setOther((s) => ({ ...s, find: { ...s.find, [key]: value } }));
		}
	}

	function setSort(header) {
		if (header != headers.Date || header != headers.Download) {
			setOther((s) => ({ ...s, sort: { column: header, isAscending: !s.sort.isAscending } }));
		}
	}

	// UI Components
	function uiBody() {
		if (loading.supportData) {
			return (
				<div className={wrapper}>
					<SpinnerBig />
				</div>
			);
		} else if (api.list.copy.length && !api.list.data.length) {
			return (
				<div className={wrapper}>
					<FontAwesomeIcon className="text-yellow-500" icon={faExclamationTriangle} size="7x" />
					<span className="font-regular-12 gray-text">No RVs found.</span>
				</div>
			);
		} else {
			return (
				<div className="flex flex-col w-full h-full justify-center items-start">
					<div className="flex w-full px-4 justify-center items-center rounded-tl rounded-tr primary-background">{uiHeaders()}</div>
					<Virtuoso
						className="w-full h-full overflow-y-auto scrollbar-gutter primary-horizontal-border contrast-background"
						data={doSorting()}
						itemContent={(i, row) => uiRows(row, i)}
						totalCount={api.list.copy.length}
					/>
				</div>
			);
		}
	}

	function uiExport() {
		if (api.list.data.length && api.list.copy.length) {
			return (
				<button className="primary-button-transparent-background" onClick={() => {}}>
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
				onChange={(e) => setInputs("term", e.target.value)}
				onClearButtonClick={() => setInputs("term", "")}
				placeholder="Find"
				showClearButton={showFindClearButton}
				tabIndex="3"
				value={other.find.term}
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
					endDate={other.find.createdAt.to}
					onChange={(e) => setInputs("from", e)}
					peekNextMonth
					placeholderText="From"
					tabIndex="1"
					selected={other.find.createdAt.from}
					selectsStart
					startDate={other.find.createdAt.from}
					showMonthDropdown
					showYearDropdown
				/>
				<FontAwesomeIcon className={showFromDateClearButton} onClick={() => setInputs("from", "")} icon={faMultiply} />
			</div>
		);
	}

	function uiHeaders() {
		return Object.values(headers).map((m, i) => {
			const showSortArrow = m == other.sort.column ? "block" : "hidden";

			return (
				<span className="flex w-1/4 justify-center items-center cursor-pointer" key={i}>
					<div className="flex w-full h-9 space-x-1.5 justify-center items-center text-white font-medium-11" onClick={() => setSort(m)}>
						<span>{m}</span>
						<span className={showSortArrow}>{uiSortArrows(m)}</span>
					</div>
				</span>
			);
		});
	}

	function uiNew() {
		return (
			<button className="space-x-1.5 primary-button-transparent-background" onClick={() => unmount({ open_new_rv: true })}>
				<FontAwesomeIcon icon={faPlusCircle} />
				<span>New</span>
			</button>
		);
	}

	function uiRows(row, i) {
		const style = "flex flex-wrap w-1/4 min-h-9 justify-center items-center text-center";

		const amount = MyGlobal.HighlightText(row.amount, other.find.term);
		const id = MyGlobal.HighlightText(row.custom_id, other.find.term);

		return (
			<div
				className="flex w-full px-4 py-2 justify-center items-center rounded bottom-shadow contrast-background bottom-border font-regular-11 black-text"
				key={i}>
				<span className={style}>{dayjs(row.created_at).format("DD-MM-YYYY")}</span>
				<span className={style} dangerouslySetInnerHTML={{ __html: id }} />
				<span className={style} dangerouslySetInnerHTML={{ __html: amount }} />
				<span className={style}>
					<FontAwesomeIcon
						className="cursor-pointer visible primary-text"
						icon={faFileDownload}
						onClick={() => {
							const link = document.createElement("a");

							link.href = `/invoices/${project.id}.pdf`;
							link.download = `${project.id}.pdf`;
							link.click();
						}}
						size="lg"
					/>
				</span>
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

	function uiTitleBar() {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full space-x-3 justify-start items-center">
					<span>RV List</span>
				</span>
				<FontAwesomeIcon className="cursor-pointer" icon={faXmark} onClick={() => unmount(false)} />
			</DialogTitle>
		);
	}

	function uiToDate() {
		return (
			<div className="flex w-36 h-[30px] px-2.5 space-x-1 justify-center items-center rounded bottom-shadow contrast-background">
				<FontAwesomeIcon className="primary-text" icon={faCalendar} size="sm" />
				<ReactDatePicker
					className="w-20 h-6 bg-transparent outline-none font-regular-10"
					dateFormat="dd-MM-YYYY"
					dropdownMode="select"
					endDate={other.find.createdAt.to}
					onChange={(e) => setInputs("to", e)}
					placeholderText="To"
					peekNextMonth
					selected={other.find.createdAt.to}
					selectsEnd
					startDate={other.find.createdAt.to}
					showMonthDropdown
					showYearDropdown
					tabIndex={2}
				/>
				<FontAwesomeIcon className={showToDateClearButton} onClick={() => setInputs("to", "")} icon={faMultiply} />
			</div>
		);
	}

	// Hooks
	useEffect(() => {
		getSupportData();
	}, []);

	useEffect(() => {
		doFiltering("");
	}, [other.find.term]);

	useEffect(() => {
		if (other.find.createdAt.from && other.find.createdAt.to) {
			doFiltering("createdAt");
		}
	}, [other.find.createdAt]);

	// Main UI
	return (
		<Dialog as="div" className="relative z-50" open={mount} onClose={() => unmount()}>
			<div className="fixed inset-0 bg-black/50" />
			<div className="flex w-full justify-center items-center fixed inset-0 overflow-y-auto">
				<Draggable handle=".draggable-handle" onStart={() => setBoxDrag()} onStop={() => setBoxDrag()}>
					<DialogPanel className="w-4/5 h-[90%] transform overflow-hidden rounded contrast-background shadow">
						{uiTitleBar()}
						<div className="flex w-full h-[calc(100%-45px)] p-5 space-x-10 justify-center items-center overflow-y-auto scrollbar-gutter primary-light-background">
							<div className="flex flex-col w-full h-full justify-center items-start">
								<div className="flex w-full pb-2 justify-between items-center">
									<div className="flex w-1/2 space-x-2 justify-start items-center">
										<span className="view-heading">Generated</span>
										<Badge value={getDataCount()} />
									</div>
									<div className="flex w-1/2 space-x-2 justify-end items-center">
										{uiFromDate()}
										{uiToDate()}
										{uiFind()}
										{uiExport()}
										{uiNew()}
									</div>
								</div>
								{uiBody()}
							</div>
						</div>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}
