"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import "tippy.js/animations/shift-away.css";
import "react-datepicker/dist/react-datepicker.css";

import axios from "axios";
import dayjs from "dayjs";
import Tippy from "@tippyjs/react";
import NewInvoice from "./NewInvoice";
import EditInvoice from "./EditInvoice";
import writeXlsxFile from "write-excel-file/browser";
import ReactDatePicker from "react-datepicker";
import { ApiEndpoints, BaseModules, DerivedModules, Statuses } from "@/utilities/constants";

import { Virtuoso } from "react-virtuoso";
import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { TextInputNative } from "@/components/Inputs";
import { Badge, Spinner, Tooltip } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Transactions } from "../../../modals/invoices/Transactions";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { faCalendar, faCheck, faChevronRight, faCoins, faFileDownload, faFileExcel, faIndustry, faMultiply, faSearch, faSortAmountAsc, faSortAmountDesc } from "@fortawesome/free-solid-svg-icons";
import { InvoicesHeaders } from "@/utilities/headers";

export default function Invoices({ presetStatus, unmount }) {
	// Business Logic
	const thisView = BaseModules.Invoices;

	const [api, setApi] = useState({
		firms: [],
		projects: [],
		projectsCopy: [],
		uploadedFiles: [],
	});

	const [main, setMain] = useState({
		company: {},
		filter: {
			date: { from: "", to: "" },
			find: "",
		},
		isLoading: false,
		selectedProject: {},
		sort: { column: InvoicesHeaders.Id, isAscending: false },
	});

	const [mounted, setMounted] = useState({
		editInvoice: false,
		newInvoice: false,
		transactions: false,
	});

	const isUserAdministrator = MyGlobal.IsUserAdministrator();
	const allowEditInvoice = MyGlobal.HasPermission(DerivedModules.EditInvoice);
	const allowNewInvoice = MyGlobal.HasPermission(DerivedModules.NewInvoice);

	const showClearCompanyButton = Object.values(main.company).length ? "cursor-pointer primary-text visible" : "invisible";
	const showFromDateClearIcon = main.filter.from ? "cursor-pointer primary-text visible" : "invisible";
	const showToDateClearIcon = main.filter.to ? "cursor-pointer primary-text visible" : "invisible";
	const showFindClearIcon = main.filter.find ? "cursor-pointer primary-text visible" : "invisible";

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

		const rowHeaders = Object.values(InvoicesHeaders);
		rowHeaders.pop();

		const blankRows = [{ span: rowHeaders.length, height: rowHeight, colSpan: 2 }];

		doSorting().forEach((fe) => {
			records.push(fe.id, fe.company_name, fe.main_project_name, fe.sub_project_name, `${fe.created_at_time}\n${fe.created_at}`, fe.invoice_due_date, fe.amount, fe.amount_received, fe.amount_pending, fe.invoice_id);
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
		const filteredData = api.projectsCopy
			.filter((f) => {
				if (Object.values(main.company).length) {
					return f.firm_id === main.company?.id;
				}

				return f;
			})
			.filter((f) => {
				const findText = main.filter.find.toLowerCase();

				if (query === "createdAt") {
					const createdAt = new Date(f.entry_date);
					const startDate = main.filter.date.from;
					const endDate = main.filter.date.to;

					if (createdAt >= startDate && createdAt <= endDate) {
						return f;
					}
				} else if (query === "DUE") {
					return f.invoice?.some((fe) => {
						if (!fe?.due_date) return false;
						const dueDate = dayjs(fe.due_date);
						return dueDate.isBefore(dayjs(), "day");
					});
				} else if (query === "GENERATED") {
					return f.invoice_id && f.created_at;
				} else if (query === "NOT GENERATED") {
					return !f.invoice_id;
				} else {
					return (
						String(f.id).toLowerCase().includes(findText) ||
						String(f.company_name).toLowerCase().includes(findText) ||
						String(f.main_project_name).toLowerCase().includes(findText) ||
						String(f.sub_project_name).toLowerCase().includes(findText) ||
						String(f.amount).includes(findText) ||
						String(f.amount_received).includes(findText) ||
						String(f.amount_pending).includes(findText) ||
						String(f.invoice_id || "Generate")
							.toLowerCase()
							.includes(findText)
					);
				}
			});

		setApi((s) => ({ ...s, projects: filteredData }));
	}

	function doSorting() {
		return (
			api.projects
				// .filter((f) => f.invoice_due_date)
				// .filter((f) => f.amount_pending != 0)
				.sort((a, b) => {
					const { column, isAscending } = main.sort;

					if (column == InvoicesHeaders.Id && isAscending) {
						return a.id.localeCompare(b.id);
					} else if (column == InvoicesHeaders.Id && !isAscending) {
						return b.id.localeCompare(a.id);
					} else if (column == InvoicesHeaders.Company && isAscending) {
						return a.company_name.localeCompare(b.company_name);
					} else if (column == InvoicesHeaders.Company && !isAscending) {
						return b.company_name.localeCompare(a.company_name);
					} else if (column == InvoicesHeaders.MainProject && isAscending) {
						return a.main_project_name.localeCompare(b.main_project_name);
					} else if (column == InvoicesHeaders.MainProject && !isAscending) {
						return b.main_project_name.localeCompare(a.main_project_name);
					} else if (column == InvoicesHeaders.SubProject && isAscending) {
						return a.sub_project_name.localeCompare(b.sub_project_name);
					} else if (column == InvoicesHeaders.SubProject && !isAscending) {
						return b.sub_project_name.localeCompare(a.sub_project_name);
					} else if (column == InvoicesHeaders.CreatedAt && isAscending) {
						return a.created_at - b.created_at;
					} else if (column == InvoicesHeaders.CreatedAt && !isAscending) {
						return b.created_at - a.created_at;
					} else if (column == InvoicesHeaders.DueDate && isAscending) {
						return a.due_date - b.due_date;
					} else if (column == InvoicesHeaders.DueDate && !isAscending) {
						return b.due_date - a.due_date;
					} else if (column == InvoicesHeaders.Amount && isAscending) {
						return a.amount - b.amount;
					} else if (column == InvoicesHeaders.Amount && !isAscending) {
						return b.amount - a.amount;
					} else if (column == InvoicesHeaders.AmountReceived && isAscending) {
						return a.amount_received - b.amount_received;
					} else if (column == InvoicesHeaders.AmountReceived && !isAscending) {
						return b.amount_received - a.amount_received;
					} else if (column == InvoicesHeaders.InvoiceId && isAscending) {
						return a.status.localeCompare(b.status);
					} else if (column == InvoicesHeaders.InvoiceId && !isAscending) {
						return b.status.localeCompare(a.status);
					} else {
						return b.id.localeCompare(a.id);
					}
				})
		);
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
		let total = { amount: 0, pending: 0, received: 0 };

		for (const i of api.projects) {
			total.amount += Number(i.amount);
			total.pending += Number(i.amount_pending);
			total.received += i.amount_received;
		}

		return total;
	}

	function setCompany(value) {
		setMain((s) => ({ ...s, company: value }));
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

			const response = await axios.get(ApiEndpoints.Invoices.GetSupportData, MyGlobal.GetHeaders());

			if (response.status === 200) {
				const revised = response.data.projects
					.filter((f) => f.status !== Statuses.Projects.Cancelled)
					.map((m) => {
						let amountPending = 0;
						let amountReceived = 0;
						let companyName = "";
						let mainProjectName = "";
						let subProjectName = "";

						const invoice = response.data.invoices.filter((f) => f.project_id == m.id);

						let invoiceAmount = Number(m.invoice_fees);
						let invoiceId = "";
						let invoiceCreatedAt = "";
						let invoiceCreatedAtTime = "";
						let invoiceDueDate = "";
						let invoiceDueDateTime = "";

						if (Array.isArray(invoice) && invoice.length) {
							invoiceAmount = invoice.reduce((total, i) => total + Number(i.amount), 0);
							invoiceId = invoice.map((m) => m.custom_id).at(0);
							invoiceCreatedAt = invoice.map((m) => dayjs(m.created_at).format("DD/MM/YYYY")).at(0);
							invoiceCreatedAtTime = invoice.map((m) => dayjs(m.created_at).format("hh:mm:ss a")).at(0);
							invoiceDueDate = invoice.map((m) => (m.due_date ? dayjs(m.due_date).format("DD/MM/YYYY") : "")).at(0);
							invoiceDueDateTime = invoice.map((m) => (m.due_date ? dayjs(m.due_date).format("hh:mm:ss a") : "")).at(0);
						}

						const company = response.data.companies.find((f) => f.id == m.company_id);

						if (typeof company === "object") {
							companyName = company.name;
						}

						const transactions = response.data.transactions.filter((f) => f.project_id == m.id);

						if (Array.isArray(transactions) && transactions.length) {
							amountReceived = transactions.reduce((pv, cv) => {
								return pv + Number(cv.amount);
							}, 0);
						}

						if (amountReceived != 0) {
							amountPending = invoiceAmount - amountReceived;
						} else {
							amountPending = invoiceAmount;
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
							amount: invoiceAmount,
							amount_pending: amountPending,
							amount_received: amountReceived,
							company_name: companyName,
							created_at: invoiceCreatedAt,
							created_at_time: invoiceCreatedAtTime,
							invoice,
							invoice_id: invoiceId,
							invoice_due_date: invoiceDueDate,
							invoice_due_date_time: invoiceDueDateTime,
							main_project_name: mainProjectName,
							sub_project_name: subProjectName,
						};
					});

				const firms = [];

				response.data.firms.forEach((fe) => {
					const count = revised.filter((f) => f.firm_id === fe.id).length;
					firms.push({ ...fe, count });
				});

				setApi((s) => ({
					...s,
					firms,
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

	function toggleEditInvoice(object) {
		setMain((s) => ({ ...s, selectedProject: object }));
		setMounted((s) => ({ ...s, editInvoice: object ? true : false }));
	}

	function toggleNewInvoice(object) {
		setMain((s) => ({ ...s, selectedProject: object }));
		setMounted((s) => ({ ...s, newInvoice: object ? true : false }));
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
			return <div className={blankDataWrapper}>No invoices generated.</div>;
		} else if (!api.projects.length) {
			return <div className={blankDataWrapper}>No invoices found.</div>;
		} else {
			return (
				<div className="flex flex-col w-full h-full justify-center items-start full-border">
					<div className="flex w-full h-9 justify-center items-center primary-background">{uiHeaders()}</div>
					<Virtuoso className="w-full h-full overflow-y-auto bottom-border contrast-background scrollbar-gutter" data={doSorting()} itemContent={(i, row) => uiRows(row, i)} totalCount={api.projects.length} />
					<div className="flex w-full h-9 justify-center items-center primary-background">{uiFooter()}</div>
				</div>
			);
		}
	}

	function uiCompanies() {
		const wrapper = "flex w-60 h-[30px] px-2.5 justify-between items-center focus:outline-none relative z-40 rounded bottom-shadow contrast-background full-border font-regular-10";

		return (
			<Menu as="div" className="flex w-60 justify-center items-center relative">
				<MenuButton className={wrapper}>
					<div className="flex w-full space-x-2.5 justify-start items-center">
						<FontAwesomeIcon className="primary-text" icon={faIndustry} size="sm" />
						<span className="gray-text">{main.company?.name || "Select Company"}</span>
					</div>
					<FontAwesomeIcon className={showClearCompanyButton} onClick={() => setCompany({})} icon={faMultiply} />
				</MenuButton>
				<MenuItems className="absolute w-full top-8 right-0 origin-top-right rounded contrast-background bottom-shadow focus:outline-none z-50 full-border">{uiCompaniesList()}</MenuItems>
			</Menu>
		);
	}

	function uiCompaniesList() {
		return api.firms.map((m, i) => {
			const isSelected = m.id == main.company?.id;
			const aesthetics = isSelected ? "primary-background-transparent-01 primary-text" : "contrast-background black-text";
			const wrapper = `flex w-full p-2 space-x-2.5 justify-between items-center cursor-pointer border-y ${aesthetics} font-regular-10 text-left hovered-rows`;

			return (
				<MenuItem as="div" className={wrapper} key={i} onClick={() => setCompany(m)}>
					<div className="flex w-full space-x-2 justify-start items-center">
						<span>{isSelected && <FontAwesomeIcon className="primary-text" icon={faCheck} />}</span>
						<span>{m.name}</span>
					</div>
					<span className="gray-text">{m.count > 0 && m.count}</span>
				</MenuItem>
			);
		});
	}

	function uiExport() {
		const style = `primary-button-transparent-background ${api.projects.length && api.projectsCopy.length ? "visible" : "invisible"}`;

		return (
			<button className={style} onClick={() => doExcelExport()}>
				<FontAwesomeIcon className="primary-text" icon={faFileExcel} />
			</button>
		);
	}

	function uiFind() {
		if (api.projectsCopy.length) {
			return <TextInputNative id="findBox" icon={faSearch} onChange={(e) => setInputs("find", e.target.value)} onClearButtonClick={() => setInputs("find", "")} placeholder="" showClearButton={showFindClearIcon} tabIndex={3} value={main.filter.find} width="w-36" />;
		}
	}

	function uiFooter() {
		const totals = getTotals();

		return Object.values(InvoicesHeaders).map((m, i) => {
			return (
				<span className="flex w-[9.09%] space-x-2 justify-center items-center text-white font-semibold-12" key={i}>
					<span>{i == 6 && MyGlobal.ThousandSeparator(totals.amount)}</span>
					<span>{i == 7 && MyGlobal.ThousandSeparator(totals.received)}</span>
					<span>{i == 8 && MyGlobal.ThousandSeparator(totals.pending)}</span>
				</span>
			);
		});
	}

	function uiFromDate() {
		if (api.projectsCopy.length) {
			return (
				<div className="flex w-36 h-7.5 px-2.5 space-x-1 justify-start items-center rounded bottom-shadow contrast-background">
					<FontAwesomeIcon className="primary-text" icon={faCalendar} size="sm" />
					<ReactDatePicker className="w-20 h-6 bg-transparent outline-none font-medium-11" dateFormat="dd-MM-YYYY" dropdownMode="select" endDate={main.filter.date.to} onChange={(e) => setInputs("from", e)} peekNextMonth placeholderText="From" tabIndex={1} selected={main.filter.date.from} selectsStart startDate={main.filter.date.from} showMonthDropdown showYearDropdown />
					<FontAwesomeIcon className={showFromDateClearIcon} onClick={() => setInputs("from", "")} icon={faMultiply} />
				</div>
			);
		}
	}

	function uiHeaders() {
		return Object.values(InvoicesHeaders).map((m, i) => {
			const showSortArrow = m == main.sort.column ? "block" : "hidden";

			return (
				<span className="flex w-[9.09%] space-x-2 justify-center items-center cursor-pointer text-white font-medium-10" key={i} onClick={() => setSort(m)}>
					<span>{m}</span>
					<span className={showSortArrow}>{uiSortArrows(m)}</span>
				</span>
			);
		});
	}

	function uiMain() {
		if (!mounted.newInvoice && !mounted.editInvoice) {
			return (
				<div className="flex flex-col w-full h-full justify-center items-center">
					<div className="flex w-full px-5 py-2.5 justify-between items-center">
						<div className="flex w-1/2 space-x-2 justify-start items-center">
							<span className="cursor-pointer hover:underline hover:underline-offset-8 hover:decoration-[--primary] view-heading" onClick={() => unmount()}>
								{BaseModules.CashFlow}
							</span>
							<FontAwesomeIcon className="gray-text" icon={faChevronRight} size="xs" />
							<span className="view-heading">{BaseModules.Invoices}</span>
							{getIconOrBadge()}
						</div>
						<div className="flex w-1/2 space-x-2 justify-end items-center">
							<div className="flex w-1/2 space-x-2 justify-end items-center">
								{uiCompanies()}
								{uiFromDate()}
								{uiToDate()}
							</div>
							{uiFind()}
							{uiExport()}
						</div>
					</div>
					<div className="flex w-full h-full justify-center items-center">{uiBody()}</div>

					{mounted.transactions && <Transactions mount={mounted.transactions} project={main.selectedProject} reload={setSupportData} unmount={toggleTransactions} />}
				</div>
			);
		}

		if (mounted.editInvoice) {
			return <EditInvoice project={main.selectedProject} reload={setSupportData} unmount={toggleEditInvoice} />;
		}

		if (mounted.newInvoice) {
			return <NewInvoice project={main.selectedProject} reload={setSupportData} unmount={toggleNewInvoice} />;
		}
	}

	function uiRows(row, i) {
		const style = `flex flex-wrap w-[9.09%] min-h-9 justify-center items-center text-center`;

		const id = MyGlobal.HighlightText(row.id, main.filter.find);

		const label = !row.invoice_id ? "Generate" : row.invoice_id;
		const invoiceId = MyGlobal.HighlightText(label, main.filter.find);

		const companyName = MyGlobal.HighlightText(row.company_name, main.filter.find);
		const mainProjectName = MyGlobal.HighlightText(row.main_project_name, main.filter.find);
		const subProjectName = MyGlobal.HighlightText(row.sub_project_name, main.filter.find);
		const amount = MyGlobal.HighlightText(row.amount, main.filter.find);
		const amountPending = MyGlobal.HighlightText(row.amount_pending, main.filter.find);
		const amountReceived = MyGlobal.HighlightText(row.amount_received, main.filter.find);

		let generateInvoiceTooltip = "";

		if (!allowNewInvoice) {
			generateInvoiceTooltip = "You do not have permission to generate invoice.";
		} else if (invoiceId != "Generate") {
			if (isUserAdministrator || allowEditInvoice) {
				generateInvoiceTooltip = "Edit this invoice.";
			}
		}

		const hideGenerateButton = ["PJ000018", "PJ000016", "PJ000015", "PJ000012", "PJ000011", "PJ000010", "PJ000009", "PJ000004", "PJ000003", "PJ000002", "PJ000034", "PJ000024", "PJ000026"].includes(row.id);
		const showDownloadButton = row.invoice_id ? "cursor-pointer visible primary-text" : "invisible";

		return (
			<div className="flex w-full justify-center items-center contrast-background bottom-border font-regular-10 black-text" key={i}>
				<span className={style} dangerouslySetInnerHTML={{ __html: id }} />
				<span className={style} dangerouslySetInnerHTML={{ __html: companyName }} />
				<span className={style} dangerouslySetInnerHTML={{ __html: mainProjectName }} />
				<span className={style} dangerouslySetInnerHTML={{ __html: subProjectName }} />
				<span className={`${style} cursor-help primary-text`}>
					<Tippy animation="shift-away" content={<Tooltip text={row.created_at_time} />} disabled={!row.created_at} placement="bottom">
						<span className={style}>{row.created_at}</span>
					</Tippy>
				</span>
				<span className={`${style} cursor-help primary-text`}>
					<Tippy animation="shift-away" content={<Tooltip text={row.invoice_due_date_time} />} disabled={!row.invoice_due_date} placement="bottom">
						<span className={style}>{row.invoice_due_date}</span>
					</Tippy>
				</span>
				<span className={style} dangerouslySetInnerHTML={{ __html: amount }} />
				<span className={style} dangerouslySetInnerHTML={{ __html: amountReceived }} />
				<span className={style} dangerouslySetInnerHTML={{ __html: amountPending }} />
				{hideGenerateButton ? (
					<span className={style} />
				) : (
					<Tippy animation="shift-away" content={<Tooltip text={generateInvoiceTooltip} />} disabled={!generateInvoiceTooltip} placement="bottom">
						<span
							className={`${style} cursor-pointer primary-text`}
							dangerouslySetInnerHTML={{ __html: invoiceId }}
							onClick={() => {
								if (row.invoice_id) {
									if (isUserAdministrator || allowEditInvoice) {
										toggleEditInvoice(row);
									}
								} else {
									if (allowNewInvoice) {
										toggleNewInvoice(row);
									}
								}
							}}
						/>
					</Tippy>
				)}
				<span className={`${style} space-x-5`}>
					<Tippy animation="shift-away" content={<Tooltip text="Download this invoice." />} placement="bottom">
						<FontAwesomeIcon
							className={showDownloadButton}
							icon={faFileDownload}
							onClick={() => {
								const link = document.createElement("a");

								link.href = `/invoices/${row.id}.pdf`;
								link.download = `${row.id}.pdf`;

								link.click();
							}}
							size="lg"
						/>
					</Tippy>
					<Tippy animation="shift-away" content={<Tooltip text="Add & see transactions of this invoice." />} placement="bottom">
						<FontAwesomeIcon className="cursor-pointer primary-text" icon={faCoins} onClick={() => toggleTransactions(row)} size="lg" />
					</Tippy>
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
				<div className="flex w-36 h-7.5 px-2.5 space-x-1 justify-center items-center rounded bottom-shadow contrast-background">
					<FontAwesomeIcon className="primary-text" icon={faCalendar} size="sm" />
					<ReactDatePicker className="w-20 h-6 bg-transparent outline-none font-medium-11" dateFormat="dd-MM-YYYY" dropdownMode="select" endDate={main.filter.date.to} onChange={(e) => setInputs("to", e)} placeholderText="To" peekNextMonth selected={main.filter.date.to} selectsEnd startDate={main.filter.date.to} showMonthDropdown showYearDropdown tabIndex={2} />
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
		if (api.projectsCopy.length) {
			if ("find" in presetStatus) {
				doFiltering(presetStatus.find);
			}
		}
	}, [api.projectsCopy.length]);

	useEffect(() => {
		if (main.filter.date.from && main.filter.date.to) {
			doFiltering("createdAt");
		} else {
			doFiltering();
		}
	}, [main.filter.date]);

	useEffect(() => {
		doFiltering();
	}, [main.filter.find, main.company]);

	// Main UI
	return uiMain();
}
