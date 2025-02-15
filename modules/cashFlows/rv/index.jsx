"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import "tippy.js/animations/shift-away.css";
import "react-datepicker/dist/react-datepicker.css";

import axios from "axios";
import dayjs from "dayjs";
import NewRv from "./NewRv";
import Tippy from "@tippyjs/react";
import writeXlsxFile from "write-excel-file";
import ReactDatePicker from "react-datepicker";
import MyConstants from "@/utilities/constants";

import { Virtuoso } from "react-virtuoso";
import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { TextInputNative } from "@/components/Inputs";
import { RvList, Transactions } from "@/modals/rv/miscellaneous";
import { Badge, Spinner, Tooltip } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCalendar,
	faChevronRight,
	faCoins,
	faFileDownload,
	faFileExcel,
	faMultiply,
	faPlusCircle,
	faSearch,
	faSortAmountAsc,
	faSortAmountDesc,
} from "@fortawesome/free-solid-svg-icons";

export default function RV({ unmount }) {
	// Business Logic
	const headers = MyConstants.TableHeaders.ReimburseVouchers;
	const thisView = MyConstants.Modules.Base.Rv;

	const [api, setApi] = useState({
		projects: [],
		projectsCopy: [],
		uploadedFiles: [],
	});

	const [main, setMain] = useState({
		filter: {
			date: { from: "", to: "" },
			find: "",
		},
		isLoading: false,
		selectedProject: {},
		sort: { column: headers.Id, isAscending: false },
	});

	const [mounted, setMounted] = useState({
		history: false,
		newRv: false,
		rvList: false,
		transactions: false,
	});

	const allowNewRv = MyGlobal.HasPermission(MyConstants.Modules.Derived.NewRv);

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
				fe.company_name,
				fe.main_project_name,
				fe.sub_project_name,
				`${fe.created_at_time}\n${fe.created_at}`,
				fe.amount,
				fe.amount_received,
				fe.status,
				fe.file_url,
			);
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
					String(f.id).toLowerCase().includes(findText) ||
					String(f.company_name).toLowerCase().includes(findText) ||
					String(f.main_project_name).toLowerCase().includes(findText) ||
					String(f.sub_project_name).toLowerCase().includes(findText) ||
					String(f.amount).includes(findText) ||
					String(f.amount_received).includes(findText) ||
					String(f.amount_pending).includes(findText) ||
					String(f.custom_id).includes(findText)
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
				return a.company_name.localeCompare(b.company_name);
			} else if (column == headers.Company && !isAscending) {
				return b.company_name.localeCompare(a.company_name);
			} else if (column == headers.MainProject && isAscending) {
				return a.main_project_name.localeCompare(b.main_project_name);
			} else if (column == headers.MainProject && !isAscending) {
				return b.main_project_name.localeCompare(a.main_project_name);
			} else if (column == headers.SubProject && isAscending) {
				return a.sub_project_name.localeCompare(b.sub_project_name);
			} else if (column == headers.SubProject && !isAscending) {
				return b.sub_project_name.localeCompare(a.sub_project_name);
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

	function getIconOrBadge() {
		if (main.isLoading) {
			return (
				<span className="pl-5 relative">
					<Spinner />
				</span>
			);
		} else {
			return api.projectsCopy.length > 0 && <Badge value={getRowsCount()} />;
		}
	}

	function getRowsCount() {
		if (api.projects.length != api.projectsCopy.length) {
			return `${api.projects.length} / ${api.projectsCopy.length}`;
		} else {
			return api.projects.length;
		}
	}

	function getTotals() {
		const total = { amount: 0, pending: 0, received: 0 };

		for (const i of api.projects) {
			total.amount += i.amount;
			total.pending += i.amount_pending;
			total.received += i.amount_received;
		}

		return total;
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

	async function setSupportData() {
		try {
			setMain((s) => ({ ...s, isLoading: true }));

			const response = await axios.get(MyConstants.ApiEndpoints.Rv.GetSupportData, MyGlobal.GetHeaders());

			if (response.status === 200) {
				const revised = response.data.projects.map((m) => {
					let amountPending = 0;
					let amountReceived = 0;
					let companyName = "";
					let mainProjectName = "";
					let subProjectName = "";

					const transactions = response.data.rvTransactionsHistory.filter((f) => f.project_id == m.id);

					if (Array.isArray(transactions) && transactions.length) {
						amountReceived = transactions.reduce((pv, cv) => {
							return pv + Number(cv.amount);
						}, 0);
					}

					let amount = 0;

					response.data.tasks.filter((f) => {
						if (f.project_id === m.id) {
							amount += Number(f.expense);
						}
					});

					amountPending = amount - amountReceived;

					const company = response.data.companies.find((f) => f.id == m.company_id);

					if (typeof company === "object") {
						companyName = company.name;
					}

					const rv = response.data.rv.find((f) => f.project_id == m.id);

					let rvId = "";
					let rvCreatedAt = "";
					let rvCreatedAtTime = "";

					if (typeof rv === "object") {
						rvId = rv.custom_id;
						rvCreatedAt = dayjs(rv.created_at).format("DD/MM/YYYY");
						rvCreatedAtTime = dayjs(rv.created_at).format("hh:mm:ss a");
					}

					const mainProject = response.data.mainProjects.find((f) => f.id == m.main_project_id);

					if (typeof mainProject === "object") {
						mainProjectName = mainProject.name;
					}

					const subProject = response.data.subProjects.find((f) => f.id == m.sub_project_id);

					if (typeof subProject === "object") {
						subProjectName = subProject.name;
					}

					return {
						...m,
						amount,
						amount_pending: amountPending,
						amount_received: amountReceived,
						company_name: companyName,
						created_at: rvCreatedAt,
						created_at_time: rvCreatedAtTime,
						invoice_id: "",
						main_project_name: mainProjectName,
						sub_project_name: subProjectName,
						rv_id: rvId,
					};
				});

				setApi((s) => ({
					...s,
					projects: revised,
					projectsCopy: revised,
				}));

				const selectedProject = revised.filter((f) => f.id === main.selectedProject?.id)?.at(0);
				setMain((s) => ({ ...s, selectedProject }));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, `${thisView} => Get Support Data`);
		} finally {
			setMain((s) => ({ ...s, isLoading: false }));
		}
	}

	function toggleNewRV(object) {
		setMain((s) => ({ ...s, selectedProject: object }));
		setMounted((s) => ({ ...s, newRv: object ? true : false }));
	}

	function toggleRvList(object) {
		if (typeof object === "object") {
			if ("open_new_rv" in object) {
				setMounted((s) => ({ ...s, newRv: true, rvList: false }));
			} else {
				setMain((s) => ({ ...s, selectedProject: object }));
				setMounted((s) => ({ ...s, rvList: true }));
			}
		} else {
			setMain((s) => ({ ...s, selectedProject: {} }));
			setMounted((s) => ({ ...s, rvList: false }));
		}
	}

	function toggleTransactions(object) {
		setMain((s) => ({ ...s, selectedProject: object }));
		setMounted((s) => ({ ...s, transactions: object ? true : false }));
	}

	// UI Components
	function uiBody() {
		if (main.isLoading) {
			return <div className={blankDataWrapper}>Loading...</div>;
		} else if (!api.projectsCopy.length) {
			return <div className={blankDataWrapper}>No RVs generated.</div>;
		} else if (!api.projects.length) {
			return <div className={blankDataWrapper}>No RVs found.</div>;
		} else {
			return (
				<div className="flex flex-col w-full h-full justify-center items-start full-border">
					<div className="flex w-full h-9 justify-center items-center primary-background">{uiHeaders()}</div>
					<Virtuoso
						className="w-full h-full overflow-y-auto bottom-border contrast-background"
						data={doSorting()}
						itemContent={(i, row) => uiRows(row, i)}
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
				<button className="primary-button-transparent-background" onClick={() => doExcelExport()}>
					<FontAwesomeIcon className="primary-text" icon={faFileExcel} />
				</button>
			);
		}
	}

	function uiFind() {
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

	function uiFooter() {
		const totals = getTotals();

		return Object.values(headers).map((m, i) => {
			return (
				<span className="w-[11.11%] space-x-1 text-center text-white font-medium-10" key={i}>
					<span>{i == 5 && totals.amount}</span>
					<span>{i == 6 && totals.received}</span>
					<span>{i == 7 && totals.pending}</span>
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
		if (!mounted.newRv) {
			return (
				<div className="flex flex-col w-full h-full justify-center items-center">
					<div className="flex w-full px-5 py-2.5 justify-between items-center">
						<div className="flex w-1/5 space-x-2 justify-start items-center">
							<span
								className="cursor-pointer hover:underline hover:underline-offset-8 hover:decoration-[--primary] view-heading"
								onClick={() => unmount()}>
								{MyConstants.Modules.Base.CashFlow}
							</span>
							<FontAwesomeIcon className="gray-text" icon={faChevronRight} size="xs" />
							<span className="view-heading">{thisView}</span>
							{getIconOrBadge()}
						</div>
						<div className="flex w-4/5 space-x-2 justify-end items-center">
							<div className="flex w-1/2 space-x-2 justify-end items-center">
								{uiFromDate()}
								{uiToDate()}
							</div>
							{uiFind()}
							{uiExport()}
						</div>
					</div>
					<div className="flex w-full h-full justify-center items-center">{uiBody()}</div>

					{mounted.rvList && <RvList mount={mounted.rvList} project={main.selectedProject} unmount={toggleRvList} />}

					{mounted.transactions && (
						<Transactions mount={mounted.transactions} project={main.selectedProject} reload={setSupportData} unmount={toggleTransactions} />
					)}
				</div>
			);
		} else {
			return <NewRv project={main.selectedProject} reload={setSupportData} unmount={toggleNewRV} />;
		}
	}

	function uiRows(row, i) {
		const style = `flex flex-wrap w-[10%] min-h-9 justify-center items-center text-center`;

		const id = MyGlobal.HighlightText(row.id, main.filter.find);

		const rvId = MyGlobal.HighlightText(row.rv_id, main.filter.find);
		const _rvId = !row.rv_id ? "Generate" : rvId;

		const companyName = MyGlobal.HighlightText(row.company_name, main.filter.find);
		const mainProjectName = MyGlobal.HighlightText(row.main_project_name, main.filter.find);
		const subProjectName = MyGlobal.HighlightText(row.sub_project_name, main.filter.find);

		const amount = MyGlobal.HighlightText(row.amount, main.filter.find);
		const amountPending = MyGlobal.HighlightText(row.amount_pending, main.filter.find);
		const amountReceived = MyGlobal.HighlightText(row.amount_received, main.filter.find);

		let generateRvTooltip = "";

		if (_rvId != "Generate") {
			generateRvTooltip = "Download this RV";
		} else if (!allowNewRv) {
			generateRvTooltip = "You do not have permission to generate RV";
		}

		const showDownloadButton = row.rv_id ? "cursor-pointer visible primary-text" : "invisible";
		const showPlusButton = row.rv_id ? "cursor-pointer visible primary-text" : "invisible";

		return (
			<div className="flex w-full justify-center items-center contrast-background bottom-border font-regular-10 black-text" key={i}>
				<span className={style} dangerouslySetInnerHTML={{ __html: id }} />
				<span className={style} dangerouslySetInnerHTML={{ __html: companyName }} />
				<span className={style} dangerouslySetInnerHTML={{ __html: mainProjectName }} />
				<span className={style} dangerouslySetInnerHTML={{ __html: subProjectName }} />
				<span className={`${style} cursor-help primary-text`}>
					<Tippy animation="shift-away" content={<Tooltip text={row.created_at_time} />} placement="bottom">
						<span className={style}>{row.created_at}</span>
					</Tippy>
				</span>
				<span className={style} dangerouslySetInnerHTML={{ __html: amount }} />
				<span className={style} dangerouslySetInnerHTML={{ __html: amountReceived }} />
				<span className={style} dangerouslySetInnerHTML={{ __html: amountPending }} />
				<Tippy animation="shift-away" content={<Tooltip text={generateRvTooltip} />} disabled={!generateRvTooltip} placement="bottom">
					<span
						className={`${style} cursor-pointer primary-text`}
						dangerouslySetInnerHTML={{ __html: _rvId }}
						onClick={() => allowNewRv && toggleNewRV(row)}
					/>
				</Tippy>
				<span className={`${style} space-x-5`}>
					<FontAwesomeIcon className={showPlusButton} icon={faPlusCircle} onClick={() => toggleRvList(row)} size="lg" />

					<Tippy animation="shift-away" content={<Tooltip text="Download this reimbursement voucher." />} placement="bottom">
						<FontAwesomeIcon
							className={showDownloadButton}
							icon={faFileDownload}
							onClick={() => {
								const link = document.createElement("a");

								link.href = `/rv/${row.id}.pdf`;
								link.download = `${row.id}.pdf`;
								link.click();
							}}
							size="lg"
						/>
					</Tippy>

					<FontAwesomeIcon className="cursor-pointer primary-text" icon={faCoins} onClick={() => toggleTransactions(row)} size="lg" />
				</span>
			</div>
		);
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
		setSupportData();

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
	}, [main.filter.find]);

	// Main UI
	return uiMain();
}
