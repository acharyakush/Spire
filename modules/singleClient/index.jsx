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

export default function SingleClient({ selectedClient, unmount }) {
	// Business Logic
	const tableHeaders = MyConstants.TableHeaders.SingleClient;

	const [apiData, setApiData] = useState({
		allProjects: { api: [], apiCopy: [] },
		mainProjects: [],
		subProjects: [],
		companies: [],
		ownerFirms: [],
		reference: {},
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
		mainComponent: false,
		uploadedFiles: false,
	});

	const allowEditingCompany = MyGlobal.HasPermission(MyConstants.Modules.Derived.EditCompany);

	const showClearSearchButton = main.filter.search ? "cursor-pointer primary-text" : "hidden";
	const showFromDateClearButton = main.filter.date.from ? "cursor-pointer primary-text" : "hidden";
	const showToDateClearButton = main.filter.date.to ? "cursor-pointer primary-text" : "hidden";

	// Functions
	function doFiltering() {}

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

	function getOwnerFirmName(ownerFirmId) {
		if (apiData.ownerFirms.length) {
			return apiData.ownerFirms.filter((f) => f.id == ownerFirmId).at(0).name;
		} else {
			return "";
		}
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
					ownerFirms: response.data.administratorsCompanies,
					companies: response.data.companies,
					mainProjects: response.data.mainProjects,
					allProjects: { api: response.data.projects, apiCopy: response.data.projects },
					reference: response.data.reference.at(0),
					subProjects: response.data.subProjects,
				}));

				setMounted((s) => ({ ...s, mainComponent: true }));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Single Client => Get Support Data");
		} finally {
			setMain((s) => ({ ...s, supportData: false }));
		}
	}

	function getTotalValues() {
		let total = {
			amountPending: 0,
			amountReceived: 0,
			professionalFees: 0,
			reimbursementVoucherCharges: 0,
			totalFees: 0,
		};

		for (const project of apiData.allProjects.api) {
			total.amountPending += Number(project.amount_pending);
			total.amountReceived += Number(project.amount_received);
			total.professionalFees += Number(project.professional_fees);
			total.reimbursementVoucherCharges += Number(project.reimbursement_voucher);
			total.totalFees += Number(project.total_fees);
		}

		total.amountPending = MyGlobal.ThousandSeparator(total.amountPending);
		total.amountReceived = MyGlobal.ThousandSeparator(total.amountReceived);
		total.professionalFees = MyGlobal.ThousandSeparator(total.professionalFees);
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

	function openWhatsApp(contactNumber) {
		globalThis.window.open(`https://wa.me/1${contactNumber}`, "_blank");
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
					<span className={wrapper} onClick={() => openWhatsApp(selectedClient.contact_number)}>
						<FontAwesomeIcon className="primary-text" icon={faWhatsapp} />
						<span>{selectedClient.contact_number}</span>
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
					<button className="space-x-1.5 primary-button-transparent-background" onClick={() => exportAsExcel()}>
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

	function uiEditCompany(selectedCompanyName) {
		if (selectedCompanyName != "All") {
			return <FontAwesomeIcon className="primary-text" icon={faPencil} onClick={() => toggleEditCompanyBox()} size="sm" />;
		}
	}

	function uiFooter() {
		const totalValues = getTotalValues();

		return Object.values(tableHeaders).map((label, index) => {
			const showTotalValues = index > 5 && index < 11 ? "visible" : "invisible";
			const wrapper = `w-[8.33%] space-x-1 text-center text-white font-medium-10 ${showTotalValues}`;

			return (
				<span className={wrapper} key={index}>
					<span>{index == 6 && totalValues.professionalFees}</span>
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
		return Object.values(tableHeaders).map((label, index) => {
			const showArrow = label == main.sort.column ? "visible" : "invisible";

			return (
				<span
					className="flex w-[8.33%] h-9 space-x-1.5 justify-center items-center cursor-pointer text-center text-white font-medium-10"
					onClick={() => setSort(label)}
					key={index}>
					<span>{label}</span>
					<span className={showArrow}>{uiSortArrows(label)}</span>
				</span>
			);
		});
	}

	function uiMain() {
		if (!mounted.uploadedFiles) {
			return (
				<>
					<div className="flex w-full px-5 py-2.5 space-x-3 justify-center items-center">
						<FontAwesomeIcon className="cursor-pointer black-text" icon={faChevronLeft} onClick={() => unmount()} />
						{uiClientDetails()}
					</div>
					<div className="flex flex-col w-full h-full space-y-2 justify-start items-center">
						<div className="flex w-full px-5 justify-between items-center">
							<div className="flex w-3/5 justify-end items-center">{uiSearch()}</div>
							<div className="flex w-2/5 space-x-5 justify-end items-center">
								{uiFromDate()}
								{uiToDate()}
							</div>
						</div>
						<div className="flex w-full h-full px-5 space-x-5 justify-center items-start">
							<div className="flex flex-col w-[10%] space-y-2.5 justify-start items-center">{uiCompanies()}</div>
							<div className="flex flex-col w-[90%] h-full justify-start items-center">
								<div className="flex w-full primary-background">{uiHeaders()}</div>
								<Virtuoso
									className="w-full h-full overflow-y-auto bottom-border contrast-background"
									data={main.projects}
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

	function uiRows(project, rowIndex) {
		const style = "flex flex-wrap w-[8.33%] min-h-9 justify-center items-center text-center";
		const tooltipStyle = `${style} cursor-help primary-text`;

		const wrapper = `flex w-full justify-center items-center black-white-background bottom-border font-regular-11 black-text`;

		const company = getCompanyName(project);
		const mainProject = getMainProjectName(project);
		const subProject = getSubProjectName(project);

		const ownerFirmName = getOwnerFirmName(project.invoice_firm_id);
		const ownerFirmNameInitials = MyGlobal.GetInitials(ownerFirmName);

		const amountPendingStyle = `${style} font-semibold-11 red-text`;
		const amountReceivedStyle = `${style} font-semibold-11 green-text`;
		const totalFeesStyle = `${style} font-semibold-11 primary-text`;

		const completionDate = dayjs(project.completed_on).format("hh:mm:ss A - DD/MM/YYYY");

		return (
			<div className={wrapper} key={rowIndex}>
				<span className={style} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(project.id, main.filter.search) }} />

				<Tippy allowHTML content={dayjs(project.started_on).format("hh:mm:ss A")}>
					<span className={tooltipStyle}>{dayjs(project.started_on).format("DD/MM/YYYY")}</span>
				</Tippy>

				<Tippy allowHTML content={mainProject}>
					<span className={tooltipStyle} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(subProject, main.filter.search) }} />
				</Tippy>

				<span className={style} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(company, main.filter.search) }} />

				<span className={`${style} space-x-1`}>{uiTeams(project.teams)}</span>

				<Tippy allowHTML content={<Tooltip text={ownerFirmName} />}>
					<span className={style} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(ownerFirmNameInitials, main.filter.search) }} />
				</Tippy>

				<span className={tooltipStyle} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(project.invoice_fees, main.filter.search) }} />

				<span
					className={tooltipStyle}
					dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(project.reimbursement_voucher, main.filter.search) }}
				/>

				<span className={amountReceivedStyle} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(0, main.filter.search) }} />

				<span className={amountPendingStyle} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(0, main.filter.search) }} />

				<span className={totalFeesStyle} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(0, main.filter.search) }} />

				<Tippy allowHTML content={completionDate} disabled={project.status != "Completed"}>
					<span className={tooltipStyle} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(project.status, main.filter.search) }} />
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
				placeholder=""
				showClearButton={showClearSearchButton}
				tabIndex={1}
				value={main.filter.search}
				width="w-60"
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

	function uiTeams(teamsIds) {
		const teams = MyGlobal.GetFullDetailsFromIds(teamsIds);
		const names = teams.map((m) => m.full_name);

		return (
			<Tippy allowHTML content={<TooltipList payload={names.join(",")} />}>
				<span className="cursor-help primary-text">{names.length}</span>
			</Tippy>
		);
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
