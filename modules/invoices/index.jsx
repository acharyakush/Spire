"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import "react-datepicker/dist/react-datepicker.css";

import axios from "axios";
import dayjs from "dayjs";
import Tippy from "@tippyjs/react";
import NewInvoice from "./NewInvoice";
import writeXlsxFile from "write-excel-file";
import ReactDatePicker from "react-datepicker";
import MyConstants from "@/utilities/constants";

import { Virtuoso } from "react-virtuoso";
import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { TextInputNative } from "@/components/Inputs";
import { Badge, SpinnerBig } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCalendar,
	faCoins,
	faFileDownload,
	faFileExcel,
	faMultiply,
	faPlusCircle,
	faSearch,
	faSortAmountAsc,
	faSortAmountDesc,
} from "@fortawesome/free-solid-svg-icons";

export default function Invoices({ status }) {
	// Business Logic
	const headers = MyConstants.TableHeaders.Invoices;
	const thisView = MyConstants.Modules.Base.Invoices;

	const [api, setApi] = useState({
		projects: [],
		projectsCopy: [],
		uploadedFiles: [],
	});

	const [main, setMain] = useState({
		filter: { date: { from: "", to: "" }, find: "" },
		isLoading: false,
		sort: { column: headers.Id, isAscending: false },
	});

	const [mounted, setMounted] = useState({
		newInvoice: false,
	});

	const newInvoiceButtonStyle = MyGlobal.HasPermission(MyConstants.Modules.Derived.NewInvoice)
		? "block space-x-1.5 primary-button-transparent-background"
		: "hidden";

	const showFromDateClearIcon = main.filter.from ? "cursor-pointer primary-text" : "hidden";
	const showToDateClearIcon = main.filter.to ? "cursor-pointer primary-text" : "hidden";
	const showFindClearIcon = main.filter.find ? "cursor-pointer primary-text" : "hidden";

	const blankDataWrapper = "flex w-full h-full justify-center items-center font-regular-12 gray-text contrast-background full-border";

	// Functions
	function detectKeystrokes(event) {
		switch (true) {
			case event.ctrlKey && event.key == "f":
				event.preventDefault();
				document.getElementById("findBox").focus();
				break;
		}
	}

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
			records.push(
				fe.id,
				fe.company,
				fe.main_project,
				fe.sub_project,
				`${fe.created_at_time}\n${fe.created_at}`,
				fe.amount,
				fe.amount_received,
				fe.status,
				fe.file_url,
			);
		});

		records.forEach((record) => {
			_records.push({
				align: "center",
				alignVertical: "center",
				color: "#000000",
				height: rowHeight,
				type: String,
				value: String(record),
				wrap: true,
			});
		});

		rowHeaders.forEach((header) => {
			dataHeaders.push({
				align: "center",
				alignVertical: "center",
				fontWeight: "bold",
				height: rowHeight,
				value: header,
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
				value: `${thisView} (${api.projects.length})`,
			},
		];

		const finalData = [header, blankRows, dataHeaders];
		MyGlobal.SeparateObjectsIntoArrays(_records, rowHeaders.length).forEach((fe) => finalData.push(fe));

		writeXlsxFile(finalData, {
			columns: columnsWidth,
			fileName: `${thisView}.xlsx`,
			fontFamily: "Segoe UI",
			fontSize: 9,
		});
	}

	function doFiltering(query) {
		const filteredData = api.projectsCopy.filter((f) => {
			if (query == "createdAt") {
				const createdAt = new Date(f.entry_date);
				const startDate = main.filter.date.from;
				const endDate = main.filter.date.to;

				if (createdAt >= startDate && createdAt <= endDate) {
					return f;
				}
			} else {
				const findText = main.filter.find.toLowerCase();

				return (
					f.id.includes(findText) ||
					f.company.includes(findText) ||
					f.main_project.includes(findText) ||
					f.sub_project.includes(findText) ||
					String(f.amount).includes(findText) ||
					String(f.amount_received).includes(findText) ||
					f.status.includes(findText)
				);
			}
		});

		setApi((s) => ({ ...s, projects: filteredData }));
	}

	function doSorting() {
		return api.projects.sort((a, b) => {
			const { column, isAscending } = main.sort;

			if (column == headers.Id && isAscending) {
				return a.id.localeCompare(b.id);
			} else if (column == headers.Id && !isAscending) {
				return b.id.localeCompare(a.id);
			} else if (column == headers.Company && isAscending) {
				return a.company.localeCompare(b.company);
			} else if (column == headers.Company && !isAscending) {
				return b.company.localeCompare(a.company);
			} else if (column == headers.MainProject && isAscending) {
				return a.main_project.localeCompare(b.main_project);
			} else if (column == headers.MainProject && !isAscending) {
				return b.main_project.localeCompare(a.main_project);
			} else if (column == headers.SubProject && isAscending) {
				return a.sub_project.localeCompare(b.sub_project);
			} else if (column == headers.SubProject && !isAscending) {
				return b.sub_project.localeCompare(a.sub_project);
			} else if (column == headers.CreatedAt && isAscending) {
				return a.created_at - b.created_at;
			} else if (column == headers.CreatedAt && !isAscending) {
				return b.created_at - a.created_at;
			} else if (column == headers.Amount && isAscending) {
				return a.amount - b.amount;
			} else if (column == headers.Amount && !isAscending) {
				return b.amount - a.amount;
			} else if (column == headers.AmountReceived && isAscending) {
				return a.amount_received - b.amount_received;
			} else if (column == headers.AmountReceived && !isAscending) {
				return b.amount_received - a.amount_received;
			} else if (column == headers.InvoiceId && isAscending) {
				return a.status.localeCompare(b.status);
			} else if (column == headers.InvoiceId && !isAscending) {
				return b.status.localeCompare(a.status);
			} else {
				return b.id.localeCompare(a.id);
			}
		});
	}

	function getDataCount() {
		if (api.projects.length != api.projectsCopy.length) {
			return `${api.projects.length} / ${api.projectsCopy.length}`;
		} else {
			return api.projects.length;
		}
	}

	async function getSupportData() {
		try {
			setMain((s) => ({ ...s, isLoading: true }));

			const response = await axios.get(MyConstants.ApiEndpoints.Invoices.GetSupportData, MyGlobal.GetHeaders());

			if (response.status === 200) {
				const revised = response.data.projects.map((m) => {
					const cashFlow = response.data.cashFlows.find((f) => f.client_id == m.client_id);

					let amountReceived = "";

					if (typeof cashFlow === "object") {
						amountReceived = cashFlow.amount_received;
					}

					const company = response.data.companies.find((f) => f.id == m.company_id).name;

					const invoice = response.data.invoices.find((f) => f.project_id == m.id);

					let invoiceId = "";
					let invoiceCreatedAt = "";
					let invoiceCreatedAtTime = "";

					if (typeof invoice === "object") {
						invoiceId = invoice.custom_id;
						invoiceCreatedAt = dayjs(invoice.created_at).format("DD MMM, YYY");
						invoiceCreatedAtTime = dayjs(invoice.created_at).format("hh:mm:ss a");
					}

					const mainProject = response.data.mainProjects.find((f) => f.id == m.main_project_id).name;

					const subProject = response.data.subProjects.find((f) => f.id == m.sub_project_id).name;

					return {
						...m,
						amount: Number(m.quote),
						amount_received: Number(amountReceived),
						company,
						created_at: invoiceCreatedAt,
						created_at_time: invoiceCreatedAtTime,
						invoice_id: invoiceId,
						main_project: mainProject,
						sub_project: subProject,
					};
				});

				setApi((s) => ({
					...s,
					projects: revised,
					projectsCopy: revised,
				}));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, `${thisView} => Get Support Data`);
		} finally {
			setMain((s) => ({ ...s, isLoading: false }));
		}
	}

	function getTotalAmount() {
		let total = 0;

		for (const i of api.projects) {
			total += Number(i.amount);
		}

		return MyGlobal.ThousandSeparator(total);
	}

	function getTotalAmountReceived() {
		let total = 0;

		for (const i of api.projects) {
			total += Number(i.amount_received);
		}

		return MyGlobal.ThousandSeparator(total);
	}

	function setInputs(key, value) {
		if (key == "from" || key == "to") {
			setMain((s) => ({ ...s, filter: { ...s.filter, date: { ...s.filter.date, [key]: value } } }));
		} else {
			setMain((s) => ({ ...s, filter: { ...s.filter, [key]: value } }));
		}
	}

	function setSort(column) {
		setMain((s) => ({ ...s, sort: { column, isAscending: !main.sort.isAscending } }));
	}

	function toggleNewInvoice() {
		setMounted((s) => ({ ...s, newInvoice: !mounted.newInvoice }));
	}

	// UI Components
	function uiBody() {
		if (main.isLoading) {
			return (
				<div className={blankDataWrapper}>
					<SpinnerBig />
				</div>
			);
		} else if (!api.projectsCopy.length) {
			return <div className={blankDataWrapper}>No invoices generated.</div>;
		} else if (!api.projects.length) {
			return <div className={blankDataWrapper}>No invoices found.</div>;
		} else {
			return (
				<div className="flex flex-col w-full h-full justify-center items-start full-border">
					<div className="flex w-full h-9 justify-center items-center primary-background">{uiHeaders()}</div>
					<Virtuoso
						className="w-full h-full overflow-y-auto bottom-border contrast-background"
						data={doSorting()}
						itemContent={(i, object) => uiRows(object, i)}
						totalCount={api.projects.length}
					/>
					<div className="flex w-full h-9 justify-center items-center primary-background">{uiFooter()}</div>
				</div>
			);
		}
	}

	function uiExport() {
		if (api.projects.length && api.projectsCopy.length) {
			return (
				<button className="space-x-1.5 primary-button-transparent-background" onClick={() => doExcelExport()}>
					<FontAwesomeIcon className="primary-text" icon={faFileExcel} />
					<span>Export</span>
				</button>
			);
		}
	}

	function uiFooter() {
		return Object.values(headers).map((m, i) => {
			const showTotalQuote = i == 5 || i == 6 ? "visible" : "invisible";
			const wrapper = `w-[11.11%] space-x-1 text-center text-white font-medium-10 ${showTotalQuote}`;

			return (
				<span className={wrapper} key={i}>
					<span>{getTotalAmount()}</span>
					<span>{getTotalAmountReceived()}</span>
				</span>
			);
		});
	}

	function uiFromDate() {
		if (api.projectsCopy.length) {
			return (
				<div className="flex w-36 h-[30px] px-2.5 space-x-1 justify-start items-center rounded bottom-shadow contrast-background">
					<FontAwesomeIcon className="primary-text" icon={faCalendar} size="sm" />
					<ReactDatePicker
						className="w-20 h-6 bg-transparent outline-none font-medium-11"
						dateFormat="dd-MM-YYYY"
						dropdownMode="select"
						endDate={main.filter.date.to}
						onChange={(e) => setInputs("from", e)}
						peekNextMonth
						placeholderText="From"
						tabIndex={1}
						selected={main.filter.date.from}
						selectsStart
						startDate={main.filter.date.from}
						showMonthDropdown
						showYearDropdown
					/>
					<FontAwesomeIcon className={showFromDateClearIcon} onClick={() => setInputs("from", "")} icon={faMultiply} />
				</div>
			);
		}
	}

	function uiHeaders() {
		return Object.values(headers).map((m, i) => {
			const showSortArrow = m == main.sort.column ? "block" : "hidden";

			return (
				<span
					className="flex w-[10%] space-x-2 justify-center items-center cursor-pointer text-white font-medium-10"
					key={i}
					onClick={() => setSort(m)}>
					<span>{m}</span>
					<span className={showSortArrow}>{uiSortArrows(m)}</span>
				</span>
			);
		});
	}

	function uiMain() {
		if (!mounted.newInvoice) {
			return (
				<div className="flex flex-col w-full h-full justify-center items-center">
					<div className="flex w-full px-5 py-2.5 justify-between items-center">
						<div className="flex w-1/5 space-x-2 justify-start items-center">
							<span className="view-heading">{thisView}</span>
							{api.projectsCopy.length > 0 && <Badge value={getDataCount()} />}
						</div>
						<div className="flex w-4/5 space-x-2 justify-end items-center">
							<div className="flex w-1/2 space-x-2 justify-end items-center">
								{uiFromDate()}
								{uiToDate()}
							</div>
							{uiSearch()}
							{uiNew()}
							{uiExport()}
						</div>
					</div>
					<div className="flex w-full h-full justify-center items-center">{uiBody()}</div>
				</div>
			);
		} else {
			return <NewInvoice project={api.projects.at(0)} reload={getSupportData} unmount={toggleNewInvoice} />;
		}
	}

	function uiNew() {
		return (
			<button className={newInvoiceButtonStyle} onClick={() => toggleNewInvoice()}>
				<FontAwesomeIcon icon={faPlusCircle} />
				<span>New</span>
			</button>
		);
	}

	function uiRows(row, i) {
		const style = `flex flex-wrap w-[10%] min-h-9 justify-center items-center text-center`;

		const id = MyGlobal.HighlightText(row.id, main.filter.find);
		const invoiceId = MyGlobal.HighlightText(row.invoice_id, main.filter.find);
		const _invoiceId = !invoiceId ? "Generate" : invoiceId;
		const company = MyGlobal.HighlightText(row.company, main.filter.find);
		const mainProject = MyGlobal.HighlightText(row.main_project, main.filter.find);
		const subProject = MyGlobal.HighlightText(row.sub_project, main.filter.find);
		const amount = MyGlobal.HighlightText(row.amount, main.filter.find);

		const amountReceived = MyGlobal.HighlightText(row.amount_received, main.filter.find);

		const invoiceIdStyle = !row.invoice_id ? `${style} cursor-pointer primary-text` : `${style} cursor-help primary-text`;

		return (
			<div className="flex w-full justify-center items-center contrast-background bottom-border font-regular-10 black-text" key={i}>
				<span className={style} dangerouslySetInnerHTML={{ __html: id }} />
				<span className={style} dangerouslySetInnerHTML={{ __html: company }} />
				<span className={style} dangerouslySetInnerHTML={{ __html: mainProject }} />

				<span className={style} dangerouslySetInnerHTML={{ __html: subProject }} />

				<span className={`${style} cursor-help primary-text`}>
					<Tippy content={row.created_at_time}>
						<span className={style}>{row.created_at}</span>
					</Tippy>
				</span>

				<span className={style} dangerouslySetInnerHTML={{ __html: amount }} />
				<span className={style} dangerouslySetInnerHTML={{ __html: amountReceived }} />

				<span className={style} />
				<span className={invoiceIdStyle} dangerouslySetInnerHTML={{ __html: _invoiceId }} onClick={() => toggleNewInvoice()} />

				<span className={`${style} space-x-5`}>
					<FontAwesomeIcon className="primary-text" icon={faFileDownload} size="lg" />
					<FontAwesomeIcon className="primary-text" icon={faCoins} size="lg" />
				</span>
			</div>
		);
	}

	function uiSearch() {
		if (api.projectsCopy.length) {
			return (
				<TextInputNative
					id="findBox"
					icon={faSearch}
					onChange={(e) => setInputs("find", e.target.value)}
					onClearButtonClick={() => setInputs("find", "")}
					placeholder=""
					showClearButton={showFindClearIcon}
					tabIndex={3}
					value={main.filter.find}
					width="w-36"
				/>
			);
		}
	}

	function uiSortArrows(column) {
		if (main.sort.column == column) {
			if (main.sort.isAscending) {
				return <FontAwesomeIcon className="text-white" icon={faSortAmountDesc} size="sm" />;
			} else {
				return <FontAwesomeIcon className="text-white" icon={faSortAmountAsc} size="sm" />;
			}
		}
	}

	function uiToDate() {
		if (api.projectsCopy.length) {
			return (
				<div className="flex w-36 h-[30px] px-2.5 space-x-1 justify-center items-center rounded bottom-shadow contrast-background">
					<FontAwesomeIcon className="primary-text" icon={faCalendar} size="sm" />
					<ReactDatePicker
						className="w-20 h-6 bg-transparent outline-none font-medium-11"
						dateFormat="dd-MM-YYYY"
						dropdownMode="select"
						endDate={main.filter.date.to}
						onChange={(e) => setInputs("to", e)}
						placeholderText="To"
						peekNextMonth
						selected={main.filter.date.to}
						selectsEnd
						startDate={main.filter.date.to}
						showMonthDropdown
						showYearDropdown
						tabIndex={2}
					/>
					<FontAwesomeIcon className={showToDateClearIcon} onClick={() => setInputs("to", "")} icon={faMultiply} />
				</div>
			);
		}
	}

	// Hooks
	useEffect(() => {
		getSupportData();

		globalThis.addEventListener("keydown", detectKeystrokes);
		return () => globalThis.removeEventListener("keydown", detectKeystrokes);
	}, []);

	useEffect(() => {
		if (main.filter.date.from && main.filter.date.to) {
			doFiltering("createdAt");
		} else {
			doFiltering();
		}
	}, [main.filter.date]);

	useEffect(() => {
		doFiltering();
	}, [main.filter.search]);

	// Main UI
	return uiMain();
}
