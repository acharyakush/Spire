"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import Tippy from "@tippyjs/react";
import ReactDatePicker from "react-datepicker";
import MyConstants from "@/utilities/constants";

import { Virtuoso } from "react-virtuoso";
import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { EditCompany } from "@/modals/singleClient";
import { TextInputNative } from "@/components/Inputs";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SpinnerSmall, Tooltip, TooltipList } from "@/components/Elements";
import {
	faCalendar,
	faChevronLeft,
	faCloudUpload,
	faEnvelope,
	faFileExcel,
	faIdBadge,
	faMultiply,
	faPencil,
	faSearch,
	faSortAmountAsc,
	faSortAmountDesc,
	faUserTag,
} from "@fortawesome/free-solid-svg-icons";
import writeXlsxFile from "write-excel-file";

export default function SingleClient({ selectedClient, unmount }) {
	// Business Logic
	const tableHeaders = MyConstants.TableHeaders.SingleClient;

	const [apiData, setApiData] = useState({
		allProjects: { api: [], apiCopy: [] },
		cashFlows: [],
		companies: [],
		mainProjects: [],
		subProjects: [],
		ownerFirms: [],
		reference: {},
		tasks: [],
		uploadedFiles: [],
	});

	const [loading, setLoading] = useState({
		supportData: false,
		uploadedFiles: false,
	});

	const [main, setMain] = useState({
		filter: { date: { from: "", to: "" }, search: "" },
		projects: [],
		selectedCompany: {
			id: 0,
			index: 0,
			name: "All",
			details: {},
		},
		sort: { column: tableHeaders.Id, isAscending: false },
	});

	const [mounted, setMounted] = useState({
		editCompany: false,
		mainComponent: false,
		uploadedFiles: false,
	});

	const allowEditingCompany = MyGlobal.HasPermission(MyConstants.Modules.Derived.EditCompany);

	const showClearSearchButton = main.filter.search ? "cursor-pointer primary-text" : "hidden";
	const showFromDateClearButton = main.filter.date.from ? "cursor-pointer primary-text" : "hidden";
	const showToDateClearButton = main.filter.date.to ? "cursor-pointer primary-text" : "hidden";

	// Functions
	function doExcelExport() {
		const records = [];
		const _records = [];

		const columnsWidth = [];
		const dataHeaders = [];

		const rowHeight = 34;
		const headerHeight = 44;
		const maximumColumnWidth = 20;

		const headers = Object.values(tableHeaders);
		const blankRows = [{ span: headers.length, height: rowHeight, colSpan: 2 }];

		doSorting().forEach((fe) => {
			records.push(
				fe.id,
				`${dayjs(fe.started_on).format("hh:mm:ss A")}\n${dayjs(fe.started_on).format("DD MMMM, YYYY")}`,
				`${fe.main_project}\n${fe.sub_project}`,
				fe.teams.map((m) => m.full_name),
				fe.invoice_firm,
				fe.invoice_fees,
				fe.reimbursement_voucher,
				fe.amoun_received,
				fe.amount_pending,
				fe.total_fees,
				fe.status,
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

		headers.forEach((header) => {
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

		const separatedRowValues = MyGlobal.SeparateObjectsIntoArrays(_records, headers.length);
		const headerText = `${selectedClient.id} - ${selectedClient.name} (${apiData.allProjects.api.length})`;

		const header = [
			{
				align: "center",
				alignVertical: "center",
				fontSize: 16,
				fontWeight: "bold",
				height: headerHeight,
				span: headers.length,
				value: headerText,
			},
		];

		const finalData = [header, blankRows, dataHeaders];
		separatedRowValues.forEach((fe) => finalData.push(fe));

		writeXlsxFile(finalData, {
			fontFamily: "Segoe UI",
			fontSize: 10,
			columns: columnsWidth,
			fileName: `${selectedClient.id}_${selectedClient.name}_(${apiData.allProjects.api.length}).xlsx`,
		});
	}

	function doFiltering(source) {
		const filtered = getRevisedSelectedCompanyProject().filter((f) => {
			if (source == "date") {
				const checkDate = new Date(f.started_on);
				const startDate = main.filter.date.from;
				const endDate = main.filter.date.to;

				if (checkDate >= startDate && checkDate <= endDate) {
					return f;
				}
			} else {
				const searchText = main.filter.search.toLowerCase();

				const id = String(f.id).toLowerCase();
				const company = String(f.company).toLowerCase();
				const subProject = String(f.sub_project).toLowerCase();
				const invoiceFirm = String(f.invoice_firm).toLowerCase();
				const status = String(f.status).toLowerCase();

				return (
					id.includes(searchText) ||
					company.includes(searchText) ||
					subProject.includes(searchText) ||
					invoiceFirm.includes(searchText) ||
					String(f.invoice_fees).includes(searchText) ||
					String(f.reimbursement_voucher).includes(searchText) ||
					String(f.amount_received).includes(searchText) ||
					String(f.amount_pending).includes(searchText) ||
					String(f.total_fees).includes(searchText) ||
					status.includes(searchText)
				);
			}
		});

		setMain((s) => ({ ...s, projects: filtered }));
	}

	function doSorting() {
		return getRevisedSelectedCompanyProject().sort((a, b) => {
			const aStartedOn = new Date(a.started_on);
			const bStartedOn = new Date(b.started_on);

			const { column, isAscending } = main.sort;

			if (column == tableHeaders.Id && isAscending) {
				return a.id.localeCompare(b.id);
			} else if (column == tableHeaders.Id && !isAscending) {
				return b.id.localeCompare(a.id);
			} else if (column == tableHeaders.StartedOn && isAscending) {
				return aStartedOn - bStartedOn;
			} else if (column == tableHeaders.StartedOn && !isAscending) {
				return bStartedOn - aStartedOn;
			} else if (column == tableHeaders.SubProject && isAscending) {
				return a.sub_project.localeCompare(b.sub_project);
			} else if (column == tableHeaders.SubProject && !isAscending) {
				return b.sub_project.localeCompare(a.sub_project);
			} else if (column == tableHeaders.Company && isAscending) {
				return a.company.localeCompare(b.company);
			} else if (column == tableHeaders.Company && !isAscending) {
				return b.company.localeCompare(a.company);
			} else if (column == tableHeaders.Teams && isAscending) {
				return a.teams.localeCompare(b.teams);
			} else if (column == tableHeaders.Teams && !isAscending) {
				return b.teams.localeCompare(a.teams);
			} else if (column == tableHeaders.InvoiceFirm && isAscending) {
				return a.invoice_firm.localeCompare(b.invoice_firm);
			} else if (column == tableHeaders.InvoiceFirm && !isAscending) {
				return b.invoice_firm.localeCompare(a.invoice_firm);
			} else if (column == tableHeaders.InvoiceFees && isAscending) {
				return a.invoice_fees - b.invoice_fees;
			} else if (column == tableHeaders.InvoiceFees && !isAscending) {
				return b.invoice_fees - a.invoice_fees;
			} else if (column == tableHeaders.ReimbursementVoucher && isAscending) {
				return a.reimbursement_voucher - b.reimbursement_voucher;
			} else if (column == tableHeaders.ReimbursementVoucher && !isAscending) {
				return b.reimbursement_voucher - a.reimbursement_voucher;
			} else if (column == tableHeaders.Total && isAscending) {
				return a.total_fees - b.total_fees;
			} else if (column == tableHeaders.Total && !isAscending) {
				return b.total_fees - a.total_fees;
			} else if (column == tableHeaders.Status && isAscending) {
				return a.status.localeCompare(b.status);
			} else if (column == tableHeaders.Status && !isAscending) {
				return b.status.localeCompare(a.status);
			} else {
				return b.id.localeCompare(a.id);
			}
		});
	}

	function getCompanyName(project) {
		let name = "";

		if (apiData.companies.length) {
			name = apiData.companies.filter((f) => f.id == project.company_id).at(0).name;
		}

		return name;
	}

	function getMainProjectName(project) {
		let name = "";

		if (apiData.mainProjects.length) {
			name = apiData.mainProjects.filter((f) => f.id == project.main_project_id).at(0).name;
		}

		return name;
	}

	function getOwnerFirmName(project) {
		let name = "";

		if (apiData.ownerFirms.length) {
			name = apiData.ownerFirms.filter((f) => f.id == project.invoice_firm_id).at(0).name;
		} else {
			name = "";
		}

		return name;
	}

	function getRevisedSelectedCompanyProject() {
		return main.projects.map((m) => {
			const invoiceFees = Number(m.invoice_fees);
			const invoiceFirm = getOwnerFirmName(m);
			const teams = MyGlobal.GetFullDetailsFromIds(m.teams);

			const reimbursementVoucher = apiData.tasks.filter((f) => f.project_id == m.id).reduce((acc, v) => acc + Number(v.expense), 0);

			const amountReceived = apiData.cashFlows.filter((f) => f.project_id == m.id).reduce((acc, v) => acc + Number(v.amount_received), 0);

			const totalFees = invoiceFees + reimbursementVoucher;
			const amountPending = totalFees - amountReceived;

			return {
				...m,
				amount_pending: amountPending,
				amount_received: amountReceived,
				company: getCompanyName(m),
				completed_on: dayjs(m.completed_on).format("hh:mm:ss A - DD/MM/YYYY"),
				invoice_fees: invoiceFees,
				invoice_firm: invoiceFirm,
				invoice_firm_initials: MyGlobal.GetInitials(invoiceFirm),
				main_project: getMainProjectName(m),
				reimbursement_voucher: reimbursementVoucher,
				sub_project: getSubProjectName(m),
				teams,
				teams_list: teams.map((m) => m.full_name),
				total_fees: totalFees,
			};
		});
	}

	function getSubProjectName(project) {
		let name = "";

		if (apiData.subProjects.length) {
			name = apiData.subProjects.filter((f) => f.id == project.sub_project_id).at(0).name;
		}

		return name;
	}

	async function getSupportData() {
		setMain((s) => ({ ...s, supportData: true }));

		try {
			const response = await axios.get(MyConstants.ApiEndpoints.Clients.GetSupportData, MyGlobal.GetHeaders({ clientId: selectedClient.id }));

			if (response.status === 200) {
				setApiData((s) => ({
					...s,
					allProjects: { api: response.data.projects, apiCopy: response.data.projects },
					cashFlows: response.data.cashFlows,
					companies: response.data.companies,
					mainProjects: response.data.mainProjects,
					ownerFirms: response.data.ownerFirms,
					reference: response.data.reference.at(0),
					subProjects: response.data.subProjects,
					tasks: response.data.tasks,
				}));

				setMain((s) => ({ ...s, projects: response.data.projects.filter((f) => f.client_id == selectedClient.id) }));

				setMounted((s) => ({ ...s, mainComponent: true }));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Single Client => Get Support Data");
		} finally {
			setMain((s) => ({ ...s, supportData: false }));
		}
	}

	function getTotalValues() {
		const total = {
			amountPending: 0,
			amountReceived: 0,
			invoiceFees: 0,
			reimbursementVoucherCharges: 0,
			totalFees: 0,
		};

		for (const project of apiData.allProjects.api) {
			total.amountPending += Number(project.amount_pending);
			total.amountReceived += Number(project.amount_received);
			total.invoiceFees += Number(project.invoice_fees);
			total.reimbursementVoucherCharges += Number(project.reimbursement_voucher);
			total.totalFees += Number(project.total_fees);
		}

		total.amountPending = MyGlobal.ThousandSeparator(total.amountPending);
		total.amountReceived = MyGlobal.ThousandSeparator(total.amountReceived);
		total.invoiceFees = MyGlobal.ThousandSeparator(total.invoiceFees);
		total.reimbursementVoucherCharges = MyGlobal.ThousandSeparator(total.reimbursementVoucherCharges);
		total.totalFees = MyGlobal.ThousandSeparator(total.totalFees);

		return total;
	}

	async function getUploadedFiles() {
		setLoading((s) => ({ ...s, uploadedFiles: true }));

		try {
			const response = await axios.get(MyConstants.ApiEndpoints.Clients.GetUploadedFiles, MyGlobal.GetHeaders({ clientId: selectedClient.id }));

			if (response.status === 200) {
				setApiData((s) => ({ ...s, uploadedFiles: response.data }));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Single Client => Get Uploaded Files");
		} finally {
			setLoading((s) => ({ ...s, uploadedFiles: false }));
		}
	}

	function openEmailAddress(emailAddress) {
		globalThis.window.open(`mailto:${emailAddress}`, "_blank");
	}

	function openWhatsApp(phoneNumber) {
		globalThis.window.open(`https://wa.me/1${phoneNumber}`, "_blank");
	}

	function setInputs(key, value) {
		if (key == "from" || key == "to") {
			setMain((s) => ({ ...s, filter: { ...s.filter, date: { ...s.filter.date, [key]: value } } }));
		} else {
			setMain((s) => ({ ...s, filter: { ...s.filter, search: value } }));
		}
	}

	function setSelectedCompany(company, index) {
		setMain((s) => ({ ...s, selectedCompany: { details: company, id: company.id, index, name: company.name } }));
	}

	function setSelectedCompanysProjects() {
		if (main.selectedCompany.id == 0) {
			setMain((s) => ({ ...s, projects: apiData.allProjects.apiCopy }));
		} else {
			const selectedCompanysProjects = apiData.allProjects.apiCopy.filter((f) => f.company_id == main.selectedCompany.id);

			setMain((s) => ({ ...s, projects: selectedCompanysProjects }));
		}
	}

	function setSort(column) {
		setMain((s) => ({ ...s, sort: { column, isAscending: !main.sort.isAscending } }));
	}

	function toggleEditCompanyBox() {
		setMounted((s) => ({ ...s, editCompany: !mounted.editCompany }));
	}

	function toggleFilesView() {
		setMounted((s) => ({ ...s, files: !mounted.files }));
	}

	// UI Components
	function uiClientDetails() {
		const wrapper = "flex h-6 space-x-2 justify-center items-center cursor-pointer relative primary-tag-transparent-01";

		const uploadedFilesIcon = loading.uploadedFiles ? <SpinnerSmall /> : <FontAwesomeIcon className="primary-text" icon={faCloudUpload} />;

		return (
			<div className="flex w-full justify-between items-center">
				<div className="flex w-4/5 space-x-2.5 justify-start items-center">
					<span className="view-heading !text-lg">{selectedClient.name}</span>
					<span className={wrapper}>
						<FontAwesomeIcon className="primary-text" icon={faIdBadge} />
						<span>{selectedClient.id}</span>
					</span>
					<span className={wrapper} onClick={() => openWhatsApp(selectedClient.phone_number)}>
						<FontAwesomeIcon className="primary-text" icon={faWhatsapp} />
						<span>{selectedClient.phone_number}</span>
					</span>
					<span className={wrapper} onClick={() => openEmailAddress(selectedClient.email_address)}>
						<FontAwesomeIcon className="primary-text" icon={faEnvelope} />
						<span>{selectedClient.email_address}</span>
					</span>
					<span className={wrapper}>
						<FontAwesomeIcon className="primary-text" icon={faUserTag} />
						<span>{apiData.reference.name}</span>
					</span>
					<span className={wrapper} onClick={() => toggleFilesView()}>
						{uploadedFilesIcon}
						<span>{uiUploadedFiles()}</span>
					</span>
				</div>
				<div className="flex w-1/5 space-x-2.5 justify-end items-center cursor-pointer font-regular-10 primary-text">
					<button className="space-x-1.5 primary-button-transparent-background" onClick={() => doExcelExport()}>
						<FontAwesomeIcon className="primary-text" icon={faFileExcel} />
						<span>Export</span>
					</button>
				</div>
			</div>
		);
	}

	function uiCompanies() {
		const companies = apiData.companies.length ? [...apiData.companies] : [];
		companies.unshift({ id: 0, name: "All" });

		return companies.map((m, i) => {
			const selectedCompanyStyle =
				i == main.selectedCompany.index ? "primary-border primary-background-transparent-01 primary-text" : "full-border bg-white black-text";

			const wrapper = `flex w-full px-4 py-2 justify-between items-center rounded shadow ${selectedCompanyStyle} font-regular-10 hovered-rows`;

			return (
				<button className={wrapper} key={i} onClick={() => setSelectedCompany(m, i)}>
					<span>{m.name}</span>
				</button>
			);
		});
	}

	function uiFooter() {
		const totalValues = getTotalValues();

		return Object.values(tableHeaders).map((label, index) => {
			const showTotalValues = index > 5 && index < 11 ? "visible" : "invisible";
			const wrapper = `w-[8.33%] space-x-1 text-center text-white font-medium-10 ${showTotalValues}`;

			return (
				<span className={wrapper} key={index}>
					<span>{index == 6 && totalValues.invoiceFees}</span>
					<span>{index == 7 && totalValues.reimbursementVoucherCharges}</span>
					<span>{index == 8 && totalValues.amountReceived}</span>
					<span>{index == 9 && totalValues.amountPending}</span>
					<span>{index == 10 && totalValues.totalFees}</span>
				</span>
			);
		});
	}

	function uiFromDate() {
		return (
			<div className="flex w-36 h-[30px] px-2.5 space-x-1 justify-start items-center rounded shadow contrast-background">
				<FontAwesomeIcon className="primary-text" icon={faCalendar} size="sm" />
				<ReactDatePicker
					className="w-20 h-6 bg-transparent outline-none font-medium-11"
					dateFormat="dd-MM-YYYY"
					dropdownMode="select"
					endDate={main.filter.date.from}
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
				<FontAwesomeIcon className={showFromDateClearButton} onClick={() => setInputs("from", "")} icon={faMultiply} />
			</div>
		);
	}

	function uiHeaders() {
		return Object.values(tableHeaders)
			.filter((f) => {
				if (main.selectedCompany.id != 0) {
					return f != tableHeaders.Company;
				}
				return f;
			})
			.map((m, i) => {
				const showArrow = m == main.sort.column ? "visible" : "invisible";
				const width = main.selectedCompany.id != 0 ? "w-[14.28%]" : "w-[8.33%]";
				const wrapper = `flex ${width} h-9 space-x-1.5 justify-center items-center cursor-pointer text-center text-white font-medium-10`;

				return (
					<span className={wrapper} onClick={() => setSort(m)} key={i}>
						<span>{m}</span>
						<span className={showArrow}>{uiSortArrows(m)}</span>
					</span>
				);
			});
	}

	function uiMain() {
		if (!mounted.uploadedFiles) {
			const selectedCompanyNameStyle = main.selectedCompany.name != "All" ? "flex w-1/2 space-x-2.5 justify-start items-center visible" : "invisible";

			const showEditCompanyIcon = allowEditingCompany && main.selectedCompany.name != "All" ? "cursor-pointer visible green-text" : "invisible";

			return (
				<>
					<div className="flex w-full px-5 py-2.5 space-x-3 justify-center items-center">
						<FontAwesomeIcon className="cursor-pointer black-text" icon={faChevronLeft} onClick={() => unmount()} />
						{uiClientDetails()}
					</div>
					<div className="flex flex-col w-full h-full space-y-2 justify-start items-center">
						<div className="flex w-full px-5 space-x-5 justify-between items-center">
							<div className="w-[10%] h-7" />
							<div className="flex w-[90%] justify-between items-center">
								<div className={selectedCompanyNameStyle}>
									<span className="view-heading !text-lg">{main.selectedCompany.name}</span>
									<FontAwesomeIcon className={showEditCompanyIcon} icon={faPencil} onClick={() => toggleEditCompanyBox()} size="sm" />
								</div>
								<div className="flex w-1/2 space-x-5 justify-end items-center">
									{uiFromDate()}
									{uiToDate()}
									{uiSearch()}
								</div>
							</div>
						</div>
						<div className="flex w-full h-full px-5 space-x-5 justify-center items-start">
							<div className="flex flex-col w-[10%] space-y-2.5 justify-start items-center">{uiCompanies()}</div>
							<div className="flex flex-col w-[90%] h-full justify-start items-center">
								<div className="flex w-full primary-background">{uiHeaders()}</div>
								<Virtuoso
									className="w-full h-full overflow-y-auto bottom-border contrast-background"
									data={doSorting()}
									itemContent={(index, project) => uiRows(project, index)}
									totalCount={apiData.allProjects.api.length}
								/>
							</div>
						</div>
					</div>
					<div className="flex w-full h-9 justify-center items-center primary-background">{uiFooter()}</div>
				</>
			);
		}
	}

	function uiRows(object, i) {
		const width = main.selectedCompany.id != 0 ? "w-[14.28%]" : "w-[8.33%]";
		const style = `flex flex-wrap ${width} min-h-9 justify-center items-center text-center`;
		const tooltipStyle = `${style} cursor-help primary-text`;

		const amountPendingStyle = `${style} font-semibold-11 red-text`;
		const amountReceivedStyle = `${style} font-semibold-11 green-text`;
		const totalFeesStyle = `${style} font-semibold-11 primary-text`;

		return (
			<div className="flex w-full justify-center items-center black-white-background bottom-border font-regular-11 black-text" key={i}>
				<span className={style} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(object.id, main.filter.search) }} />

				<Tippy allowHTML content={dayjs(object.started_on).format("hh:mm:ss A")}>
					<span className={tooltipStyle}>{dayjs(object.started_on).format("DD/MM/YYYY")}</span>
				</Tippy>

				<Tippy allowHTML content={object.main_project}>
					<span className={tooltipStyle} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(object.sub_project, main.filter.search) }} />
				</Tippy>

				{main.selectedCompany.id == 0 && (
					<span className={style} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(object.company, main.filter.search) }} />
				)}

				<Tippy allowHTML content={<TooltipList payload={object.teams_list} />}>
					<span className={`${style} space-x-1 cursor-help primary-text`}>{object.teams.length}</span>
				</Tippy>

				<Tippy allowHTML content={<Tooltip text={object.invoice_firm} />}>
					<span className={style} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(object.invoice_firm_initials, main.filter.search) }} />
				</Tippy>

				<span className={tooltipStyle} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(object.invoice_fees, main.filter.search) }} />

				<span className={tooltipStyle} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(object.reimbursement_voucher, main.filter.search) }} />

				<span
					className={amountReceivedStyle}
					dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(object.amount_received, main.filter.search) }}
				/>

				<span className={amountPendingStyle} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(object.amount_pending, main.filter.search) }} />

				<span className={totalFeesStyle} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(object.total_fees, main.filter.search) }} />

				<Tippy allowHTML content={object.completed_on} disabled={object.status != "Completed"}>
					<span className={tooltipStyle} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(object.status, main.filter.search) }} />
				</Tippy>
			</div>
		);
	}

	function uiSearch() {
		return (
			<TextInputNative
				id="searchBox"
				icon={faSearch}
				onChange={(e) => setInputs("search", e.target.value)}
				onClearButtonClick={() => setInputs("search", "")}
				placeholder="Search"
				showClearButton={showClearSearchButton}
				tabIndex={1}
				value={main.filter.search}
				width="w-44"
			/>
		);
	}

	function uiSortArrows(column) {
		if (main.sort.column == column) {
			if (main.sort.isAscending) {
				return <FontAwesomeIcon icon={faSortAmountAsc} />;
			} else {
				return <FontAwesomeIcon icon={faSortAmountDesc} />;
			}
		}
	}

	function uiToDate() {
		return (
			<div className="flex w-36 h-[30px] px-2.5 space-x-1 justify-start items-center rounded shadow contrast-background">
				<FontAwesomeIcon className="primary-text" icon={faCalendar} size="sm" />
				<ReactDatePicker
					className="w-20 h-6 bg-transparent outline-none font-medium-11"
					dateFormat="dd-MM-YYYY"
					dropdownMode="select"
					endDate={main.filter.date.to}
					onChange={(e) => setInputs("to", e)}
					peekNextMonth
					placeholderText="To"
					tabIndex={3}
					selected={main.filter.date.to}
					selectsStart
					startDate={main.filter.date.to}
					showMonthDropdown
					showYearDropdown
				/>
				<FontAwesomeIcon className={showToDateClearButton} onClick={() => setInputs("to", "")} icon={faMultiply} />
			</div>
		);
	}

	function uiUploadedFiles() {
		if (!loading.uploadedFiles) {
			if (apiData.uploadedFiles.length) {
				const label = apiData.uploadedFiles.length == 1 ? "File" : "Files";

				return (
					<div>
						{apiData.uploadedFiles.length} {label}
					</div>
				);
			} else {
				return <span>Upload</span>;
			}
		}
	}

	// Hooks
	useEffect(() => {
		getSupportData();
		//getUploadedFiles();
	}, []);

	useEffect(() => {
		setSelectedCompanysProjects();
	}, [main.selectedCompany]);

	useEffect(() => {
		if (main.filter.date.from && main.filter.date.to) {
			doFiltering("date");
		}
	}, [main.filter.date]);

	useEffect(() => {
		doFiltering();
	}, [main.filter.search]);

	// Main UI
	return (
		<>
			{uiMain()}

			{mounted.editCompany && (
				<EditCompany
					mount={mounted.editCompany}
					reloadProjects={getSupportData}
					selectedCompany={main.selectedCompany}
					unmount={toggleEditCompanyBox}
				/>
			)}
		</>
	);
}
