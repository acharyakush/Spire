"use client";

import axios from "axios";
import dayjs from "dayjs";
import Files from "./Files";
import Tippy from "@tippyjs/react";
import html2canvas from "html2canvas-pro";
import SingleProject from "../singleProject";
import ReactDatePicker from "react-datepicker";
import writeXlsxFile from "write-excel-file/browser";

import { Virtuoso } from "react-virtuoso";
import { MyGlobal } from "@/utilities/global";
import { DeleteCompany, EditCompany } from "@/modals/singleClient";
import { TextInputNative } from "@/components/Inputs";
import { SingleClientHeaders } from "@/utilities/headers";
import { useEffect, useMemo, useRef, useState } from "react";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ApiEndpoints, DerivedModules, Statuses } from "@/utilities/constants";
import { AvatarCircle, BadgeSmallWithBackground2, Tooltip } from "@/components/Elements";
import { faCalendar, faCamera, faCheck, faChevronLeft, faCloudUpload, faDownload, faEnvelope, faIndustry, faMultiply, faPencil, faSearch, faSortAmountAsc, faSortAmountDesc, faSpinner, faTrash, faUserTag } from "@fortawesome/free-solid-svg-icons";

const statuses = Statuses.Projects;
const arrHeaders = Object.values(SingleClientHeaders);

export default function SingleClient({ client, unmount }) {
	// Business Logic
	const screenshotRef = useRef();
	const capturePreviewRef = useRef();

	const [companies, setCompanies] = useState([]);
	const [uploadedFiles, setUploadedFiles] = useState([]);
	const [singleClientProjects, setSingleClientProjects] = useState([]);
	const [allProjects, setAllProjects] = useState({ copy: [], data: [] });
	const [singleClientProjectsCopy, setSingleClientProjectsCopy] = useState([]);

	const [captureWidth, setCaptureWidth] = useState(0);
	const [referenceName, setReferenceName] = useState("");
	const [selectedProject, setSelectedProject] = useState({});
	const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);

	const [sort, setSort] = useState({ column: SingleClientHeaders.Id, isAscending: false });
	const [loading, setLoading] = useState({ singleClient: false, uploadedFiles: false });
	const [filter, setFilter] = useState({ financialYear: "", find: "", fromDate: "", toDate: "" });
	const [selectedCompany, setSelectedCompany] = useState({ id: 0, index: 0, name: "All", details: {} });
	const [isOpen, setIsOpen] = useState({ deleteCompany: false, editCompany: false, singleProject: false, uploadedFiles: false });

	const allowEditingCompany = MyGlobal.HasPermission(DerivedModules.EditCompany);
	const allowDeletingCompany = MyGlobal.HasPermission(DerivedModules.DeleteCompany);

	const financialYears = useMemo(() => {
		const set = new Set();

		singleClientProjectsCopy.forEach((fe) => {
			const date = new Date(fe.started_on);
			const year = date.getFullYear();
			const month = date.getMonth();

			let startYear;

			if (month >= 3) {
				startYear = year;
			} else {
				startYear = year - 1;
			}

			const fy = `${startYear}-${String(startYear + 1).slice(-2)}`;
			set.add(fy);
		});

		return Array.from(set).sort();
	}, [singleClientProjectsCopy]);

	const showClearCompanyButton = filter.financialYear ? "cursor-pointer text-gray-300" : "hidden!";
	const showClearSearchButton = filter.find ? "cursor-pointer text-gray-300" : "hidden!";
	const showToDateClearButton = filter.toDate ? "cursor-pointer text-gray-300" : "hidden!";
	const showFromDateClearButton = filter.fromDate ? "cursor-pointer text-gray-300" : "hidden!";

	// Functions
	async function captureScreenshot() {
		const sourceElement = capturePreviewRef.current;
		if (!sourceElement || isCapturingScreenshot) return;

		setCaptureWidth(Math.ceil(sourceElement.getBoundingClientRect().width));
		setIsCapturingScreenshot(true);

		try {
			await new Promise((resolve) => {
				if (typeof globalThis.requestAnimationFrame !== "function") {
					setTimeout(resolve, 100);
					return;
				}

				globalThis.requestAnimationFrame(() => globalThis.requestAnimationFrame(resolve));
			});

			const element = screenshotRef.current;
			if (!element) return;

			const canvas = await html2canvas(element, {
				backgroundColor: "#ffffff",
				height: element.scrollHeight,
				onclone: sanitizeScreenshotClone,
				scale: 1,
				useCORS: true,
				width: element.scrollWidth,
				windowHeight: element.scrollHeight,
				windowWidth: element.scrollWidth,
			});

			const blob = await new Promise((r) => canvas.toBlob(r));

			if (!blob) {
				console.error("Screenshot failed: blob is null");
				MyGlobal.ShowErrorToast("Screenshot failed. Try again.");
				return;
			}

			await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
			MyGlobal.ShowSuccessToast("Screenshot copied to clipboard.");
		} catch (err) {
			console.error("Failed to copy screenshot: ", err);
			MyGlobal.ShowErrorToast("Failed to copy screenshot.");
		} finally {
			setIsCapturingScreenshot(false);
		}
	}

	function doExcelExport() {
		const records = [];
		const _records = [];

		const columnsWidth = [];
		const dataHeaders = [];

		const rowHeight = 34;
		const headerHeight = 44;
		const maximumColumnWidth = 20;

		let _headers = Object.values(SingleClientHeaders);
		_headers.push("Status");
		_headers.push("Timestamp");

		const blankRows = [{ span: _headers.length, height: rowHeight, colSpan: 2 }];

		doSorting().forEach((fe) => {
			records.push(
				fe.id,
				`${fe.main_project_name}\n${fe.sub_project_name}`,
				fe.company_name,
				fe.teams.map((m) => m.full_name),
				fe.invoice_firm_name,
				fe.invoice_fees,
				fe.reimburse_voucher,
				fe.amount_received,
				fe.amount_pending,
				fe.total_fees,
				fe.status,
				`${dayjs(fe.started_on).format("hh:mm:ss A")}\n${dayjs(fe.started_on).format("DD MMMM, YYYY")}`,
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

		_headers.forEach((fe) => {
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

		const separatedRowValues = MyGlobal.SeparateObjectsIntoArrays(_records, _headers.length);

		const headerText = `${client.id} - ${client.name} (${allProjects.data.length})`;

		const header = [
			{
				align: "center",
				alignVertical: "center",
				fontSize: 16,
				fontWeight: "bold",
				height: headerHeight,
				span: _headers.length,
				value: headerText,
			},
		];

		const finalData = [header, blankRows, dataHeaders];
		separatedRowValues.forEach((fe) => finalData.push(fe));

		writeXlsxFile(finalData, {
			fontFamily: "Segoe UI",
			fontSize: 10,
			columns: columnsWidth,
			fileName: `${client.id}_${client.name}_(${allProjects.data.length}).xlsx`,
		});
	}

	function doFiltering(source) {
		const filtered = getSelectedCompanyProjects().filter((f) => {
			if (source == "date") {
				const checkDate = new Date(f.started_on);
				const startDate = filter.fromDate;
				const endDate = filter.toDate;

				if (checkDate >= startDate && checkDate <= endDate) return f;
			} else if (source == "financialYear") {
				const date = new Date(f.started_on);
				const year = date.getFullYear();
				const month = date.getMonth();

				const startYear = month >= 3 ? year : year - 1;
				const fy = `${startYear}-${String(startYear + 1).slice(-2)}`;

				return fy === filter.financialYear;
			} else {
				const findText = filter.find.toLowerCase();

				const id = String(f.id).toLowerCase();
				const company = String(f.company_name).toLowerCase();
				const subProject = String(f.sub_project_name).toLowerCase();
				const invoiceFirm = String(f.invoice_firm_name).toLowerCase();
				const status = String(f.status).toLowerCase();

				return id.includes(findText) || company.includes(findText) || subProject.includes(findText) || invoiceFirm.includes(findText) || String(f.invoice_fees).includes(findText) || String(f.reimburse_voucher).includes(findText) || String(f.amount_received).includes(findText) || String(f.amount_pending).includes(findText) || String(f.total_fees).includes(findText) || status.includes(findText);
			}
		});

		setAllProjects((s) => ({ ...s, data: filtered }));
		setSingleClientProjects(filtered);
	}

	function doSorting() {
		const { column, isAscending } = sort;

		return [...singleClientProjects].sort((a, b) => {
			if (column == SingleClientHeaders.Id && isAscending) return a.id.localeCompare(b.id);
			if (column == SingleClientHeaders.Id && !isAscending) return b.id.localeCompare(a.id);
			if (column == SingleClientHeaders.SubProject && isAscending) return a.sub_project_name.localeCompare(b.sub_project_name);
			if (column == SingleClientHeaders.SubProject && !isAscending) return b.sub_project_name.localeCompare(a.sub_project_name);
			if (column == SingleClientHeaders.Company && isAscending) return a.company_name.localeCompare(b.company_name);
			if (column == SingleClientHeaders.Company && !isAscending) return b.company_name.localeCompare(a.company_name);
			if (column == SingleClientHeaders.Teams && isAscending) return String(a.team_names).localeCompare(String(b.team_names));
			if (column == SingleClientHeaders.Teams && !isAscending) return String(b.team_names).localeCompare(String(a.team_names));
			if (column == SingleClientHeaders.InvoiceFirm && isAscending) return a.invoice_firm_name.localeCompare(b.invoice_firm_name);
			if (column == SingleClientHeaders.InvoiceFirm && !isAscending) return b.invoice_firm_name.localeCompare(a.invoice_firm_name);
			if (column == SingleClientHeaders.InvoiceFees && isAscending) return a.invoice_fees - b.invoice_fees;
			if (column == SingleClientHeaders.InvoiceFees && !isAscending) return b.invoice_fees - a.invoice_fees;
			if (column == SingleClientHeaders.ReimbursementVoucher && isAscending) return a.reimburse_voucher - b.reimburse_voucher;
			if (column == SingleClientHeaders.ReimbursementVoucher && !isAscending) return b.reimburse_voucher - a.reimburse_voucher;
			if (column == SingleClientHeaders.AmountPending && isAscending) return a.amount_pending - b.amount_pending;
			if (column == SingleClientHeaders.AmountPending && !isAscending) return b.amount_pending - a.amount_pending;
			if (column == SingleClientHeaders.AmountReceived && isAscending) return a.amount_received - b.amount_received;
			if (column == SingleClientHeaders.AmountReceived && !isAscending) return b.amount_received - a.amount_received;
			if (column == SingleClientHeaders.Total && isAscending) return a.total_fees - b.total_fees;
			if (column == SingleClientHeaders.Total && !isAscending) return b.total_fees - a.total_fees;
			return b.id.localeCompare(a.id);
		});
	}

	function normalizeSingleClientProject(project) {
		const invoiceFirmName = String(project.invoice_firm_name ?? "");
		const teamNames = MyGlobal.GetAnyDataFromId(project.teams, "full_name");

		return {
			...project,
			completed_on: dayjs(project.completed_on).format("hh:mm:ss A - DD/MM/YYYY"),
			invoice_fees: Number(project.invoice_fees),
			invoice_firm_initials: MyGlobal.GetInitials(invoiceFirmName),
			invoice_firm_name: invoiceFirmName,
			amount_pending: Number(project.amount_pending),
			amount_received: Number(project.amount_received),
			invoice_amount_received: Number(project.invoice_amount_received),
			reimburse_voucher: Number(project.reimburse_voucher),
			rv_amount_received: Number(project.rv_amount_received),
			teams: MyGlobal.GetFullDetailsFromIds(project.teams),
			team_names: teamNames,
			team_names_initials: MyGlobal.GetInitials(teamNames),
			total_amount_received: Number(project.amount_received),
			total_fees: Number(project.total_fees),
		};
	}

	async function getSingleClientData(action) {
		setLoading((s) => ({ ...s, singleClient: true }));

		try {
			const response = await axios.get(ApiEndpoints.Clients.GetSupportData, MyGlobal.GetHeaders({ clientId: client.id }));

			if (response.status === 200) {
				const companies = response.data.companies;
				const normalizedProjects = response.data.projects.map(normalizeSingleClientProject);

				let nextSelectedCompany = {
					details: {
						address: "",
						client_id: "",
						email_address: "",
						entry_at: "",
						entry_by_id: "",
						gstin: "",
						id: "",
						invoice_fees: "",
						name: "",
						pan: "",
						phone_number: "",
						reimbursement_voucher: "",
						total_affiliate_fees: "",
					},
					id: 0,
					index: 0,
					name: "All",
				};

				if (action && action === "reload-root") {
					const companyObj = companies.find((f) => f.id === selectedCompany.id);

					if (typeof companyObj === "object") {
						nextSelectedCompany = {
							details: {
								address: companyObj.address,
								client_id: companyObj.client_id,
								email_address: companyObj.email_address,
								entry_at: companyObj.entry_at,
								entry_by_id: companyObj.entry_by_id,
								gstin: companyObj.gstin,
								id: companyObj.id,
								invoice_fees: companyObj.invoice_fees,
								name: companyObj.name,
								pan: companyObj.pan,
								phone_number: companyObj.phone_number,
								reimbursement_voucher: companyObj.reimbursement_voucher,
								total_affiliate_fees: companyObj.total_affiliate_fees,
							},
							id: companyObj.id,
							index: selectedCompany.index,
							name: companyObj.name,
						};
					}
				}

				const visibleProjects = nextSelectedCompany.id == 0 ? normalizedProjects : normalizedProjects.filter((f) => f.company_id == nextSelectedCompany.id);

				setCompanies(companies);
				setAllProjects({ copy: normalizedProjects, data: visibleProjects });
				setReferenceName(response.data.referenceName || "");
				setSelectedCompany(nextSelectedCompany);
				setSingleClientProjects(visibleProjects);
				setSingleClientProjectsCopy(visibleProjects);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Single Client => Set Support Data");
		} finally {
			setLoading((s) => ({ ...s, singleClient: false }));
		}
	}

	function getStatusSeverityBackground(status) {
		switch (status) {
			case statuses.Active:
				return "orange-background";
			case statuses.Closed:
			case statuses.Cancelled:
				return "gray-background";
			case statuses.Hold:
				return "red-background";
			case statuses.Completed:
				return "green-background";
			default:
				return "orange-background";
		}
	}

	function getStatusSeverityBackground2(status) {
		switch (status) {
			case statuses.Open:
				return {
					background: "orange-background",
					border: "orange-border",
					text: "text-white",
				};
			case statuses.Closed:
			case statuses.Cancelled:
				return {
					background: "gray-background",
					border: "gray-border",
					text: "text-white",
				};
			case statuses.Hold:
				return {
					background: "red-background",
					border: "red-border",
					text: "text-white",
				};
			case statuses.Completed:
				return {
					background: "green-background",
					border: "green-border",
					text: "text-white",
				};
			default:
				return {
					background: "orange-background",
					border: "orange-border",
					text: "text-white",
				};
		}
	}

	async function getUploadedFiles() {
		try {
			setLoading((s) => ({ ...s, uploadedFiles: true }));

			const response = await axios.get(ApiEndpoints.Clients.GetFiles, MyGlobal.GetHeaders({ clientId: client.id }));

			if (response.status === 200) {
				setUploadedFiles(response.data);
			}
		} catch (error) {
			console.log("");
		} finally {
			setLoading((s) => ({ ...s, uploadedFiles: false }));
		}
	}

	function getTotalValues() {
		const total = {
			amountPending: 0,
			amountReceived: 0,
			invoiceFees: 0,
			reimburseVoucher: 0,
			totalFees: 0,
		};

		singleClientProjects.map((i) => {
			total.amountPending += Number(i.amount_pending);
			total.amountReceived += Number(i.amount_received);
			total.invoiceFees += Number(i.invoice_fees);
			total.reimburseVoucher += Number(i.reimburse_voucher);
			total.totalFees += Number(i.total_fees);
		});

		total.amountPending = MyGlobal.ThousandSeparator(total.amountPending);
		total.amountReceived = MyGlobal.ThousandSeparator(total.amountReceived);
		total.invoiceFees = MyGlobal.ThousandSeparator(total.invoiceFees);
		total.reimburseVoucher = MyGlobal.ThousandSeparator(total.reimburseVoucher);
		total.totalFees = MyGlobal.ThousandSeparator(total.totalFees);

		return total;
	}

	function openEmailAddress(emailAddress) {
		globalThis.window.open(`mailto:${emailAddress}`, "_blank");
	}

	function openWhatsApp(phoneNumber) {
		globalThis.window.open(`https://wa.me/1${phoneNumber}`, "_blank");
	}

	function sanitizeScreenshotClone(clonedDocument) {
		const sourceElement = screenshotRef.current;
		const clonedElement = clonedDocument.querySelector("[data-screenshot-root='true']");
		if (!sourceElement || !clonedElement) return;

		const sourceNodes = [sourceElement, ...sourceElement.querySelectorAll("*")];
		const clonedNodes = [clonedElement, ...clonedElement.querySelectorAll("*")];
		const styleProperties = ["backgroundColor", "backgroundImage", "borderTopColor", "borderRightColor", "borderBottomColor", "borderLeftColor", "boxShadow", "caretColor", "color", "fill", "outlineColor", "stroke", "textDecorationColor", "textShadow"];

		sourceNodes.forEach((sourceNode, index) => {
			const clonedNode = clonedNodes[index];
			if (!(sourceNode instanceof Element) || !(clonedNode instanceof Element)) return;

			const computedStyle = globalThis.getComputedStyle(sourceNode);

			clonedNode.style.animation = "none";
			clonedNode.style.transition = "none";

			styleProperties.forEach((fe) => {
				const value = computedStyle[fe];
				if (value) clonedNode.style[fe] = value;
			});
		});
	}

	function setInputs(key, value) {
		setFilter((s) => ({ ...s, [key]: value }));
	}

	function getSelectedCompanyProjects() {
		if (selectedCompany.id == 0) return allProjects.copy;
		return allProjects.copy.filter((f) => f.company_id == selectedCompany.id);
	}

	function setSelectedCompanysProjects() {
		const selectedCompanysProjects = getSelectedCompanyProjects();
		setAllProjects((s) => ({ ...s, data: selectedCompanysProjects }));
		setSingleClientProjects(selectedCompanysProjects);
		setSingleClientProjectsCopy(selectedCompanysProjects);
	}

	function toggleEditCompanyBox() {
		setIsOpen((s) => ({ ...s, editCompany: !s.editCompany }));
	}

	function toggleDeleteCompanyBox() {
		setIsOpen((s) => ({ ...s, deleteCompany: !s.deleteCompany }));
	}

	function toggleFilesView() {
		setIsOpen((s) => ({ ...s, uploadedFiles: !s.uploadedFiles }));
	}

	function toggleSingleProjectView(object) {
		setSelectedProject(object);
		setIsOpen((s) => ({ ...s, singleProject: object ? true : false }));
	}

	const sortedProjects = useMemo(() => doSorting(), [doSorting]);

	// UI Components
	function uiCompanies() {
		const _companies = companies.length ? [...companies] : [];
		_companies.unshift({ id: 0, name: "All" });

		return _companies.map((m, i) => {
			const selectedCompanyStyle = i == selectedCompany.index ? "blue-background text-white" : "bg-white text-gray-400";
			const wrapper = `flex w-full items-center-safe rounded shadow ${selectedCompanyStyle} font-regular-10 cursor-pointer relative hover:bg-(--blue) hover:text-white`;

			return (
				<button className={wrapper} key={i} onClick={() => setSelectedCompany({ details: m, id: m.id, index: i, name: m.name })}>
					<span className="px-4 py-2 w-full text-left">{m.name || "Unnamed"}</span>
					<div className="absolute -top-1 -right-2.5 flex rounded-full bg-white justify-center-safe items-center-safe">
						{allowEditingCompany && i > 0 && i == selectedCompany.index ? (
							<Tippy content={<Tooltip text={"Edit Company"} />} placement="bottom">
								<FontAwesomeIcon className="cursor-pointer text-green-600 bg-transparent p-2 rounded-full hover:text-white hover:bg-green-600 transition-colors duration-300" icon={faPencil} onClick={() => toggleEditCompanyBox()} size="md" />
							</Tippy>
						) : null}
						{allowDeletingCompany && i > 0 && i == selectedCompany.index ? (
							<Tippy content={<Tooltip text={"Delete Company"} />} placement="bottom">
								<FontAwesomeIcon className="cursor-pointer text-rose-600 bg-transparent p-2 rounded-full hover:text-white hover:bg-rose-600 transition-colors duration-300" icon={faTrash} onClick={() => toggleDeleteCompanyBox()} size="md" />
							</Tippy>
						) : null}
					</div>
				</button>
			);
		});
	}

	function uiFinancialYearList() {
		return financialYears.map((m, i) => {
			const isSelected = m === filter.financialYear;
			const aesthetics = isSelected ? "primary-background-transparent-01 primary-text" : "contrast-background black-text";
			const wrapper = `flex w-full p-2 space-x-2.5 justify-between items-center-safe cursor-pointer ${aesthetics} font-regular-10 text-left`;

			return (
				<MenuItem as="div" className={wrapper} key={i} onClick={() => setFilter((s) => ({ ...s, financialYear: m }))}>
					<div className="flex w-full space-x-2 items-center-safe">
						<span>{isSelected && <FontAwesomeIcon className="primary-text" icon={faCheck} />}</span>
						<span>{m}</span>
					</div>
				</MenuItem>
			);
		});
	}

	function uiFooter() {
		const totalValues = getTotalValues();

		return arrHeaders
			.filter((f) => {
				if (selectedCompany.id != 0) return f != SingleClientHeaders.Company;
				return f;
			})
			.map((m, i) => {
				if (selectedCompany.id != 0) {
					return (
						<span className="flex w-[11.11%] justify-center-safe items-center-safe text-white font-medium-12" key={i}>
							<span>{i == 4 && totalValues.invoiceFees}</span>
							<span>{i == 5 && totalValues.reimburseVoucher}</span>
							<span>{i == 6 && totalValues.amountReceived}</span>
							<span>{i == 7 && totalValues.amountPending}</span>
							<span>{i == 8 && totalValues.totalFees}</span>
						</span>
					);
				} else {
					return (
						<span className="flex w-[10%] justify-center-safe items-center-safe text-white font-medium-12" key={i}>
							<span>{i == 5 && totalValues.invoiceFees}</span>
							<span>{i == 6 && totalValues.reimburseVoucher}</span>
							<span>{i == 7 && totalValues.amountReceived}</span>
							<span>{i == 8 && totalValues.amountPending}</span>
							<span>{i == 9 && totalValues.totalFees}</span>
						</span>
					);
				}
			});
	}

	function uiHeaders() {
		return arrHeaders
			.filter((f) => {
				if (selectedCompany.id != 0) return f != SingleClientHeaders.Company;
				return f;
			})
			.map((m, i) => {
				const showArrow = m == sort.column ? "visible" : "invisible";
				const width = selectedCompany.id != 0 ? "w-[11.11%]" : "w-[10%]";
				const wrapper = `flex ${width} h-9 space-x-1.5 justify-center-safe items-center-safe cursor-pointer text-center text-white font-medium-10`;

				return (
					<span className={wrapper} onClick={() => setSort((s) => ({ ...s, column: m, isAscending: !s.isAscending }))} key={i}>
						<span>{m}</span>
						<span className={showArrow}>{uiSortArrows(m)}</span>
					</span>
				);
			});
	}

	function uiMain() {
		if (!isOpen.singleProject && !isOpen.uploadedFiles) {
			return (
				<>
					<div className="flex w-full px-5 py-2.5 space-x-3 justify-center-safe items-center-safe">
						<FontAwesomeIcon className="cursor-pointer black-text" icon={faChevronLeft} onClick={() => unmount()} />
						{uiTopBar()}
					</div>
					<div className="flex flex-col w-full h-full items-center-safe">
						<div className="flex w-full h-full px-5 space-x-5 justify-center-safe items-start">
							<div className="flex flex-col w-[10%] space-y-2.5 items-center-safe">{uiCompanies()}</div>
							<div className="flex flex-col w-[90%] h-full items-center-safe full-border" ref={capturePreviewRef}>
								<div className="flex w-full primary-background">{uiHeaders()}</div>
								{uiProjectList(sortedProjects)}
								<div className="flex w-full h-9 justify-center-safe items-center-safe primary-background">{uiFooter()}</div>
							</div>
						</div>
						{isCapturingScreenshot && (
							<div className="fixed top-0 -left-2500">
								<div className="flex flex-col items-center-safe full-border bg-white" data-screenshot-root="true" ref={screenshotRef} style={captureWidth ? { width: `${captureWidth}px` } : undefined}>
									<div className="flex w-full primary-background">{uiHeaders()}</div>
									{uiProjectList(sortedProjects, true)}
									<div className="flex w-full h-9 justify-center-safe items-center-safe primary-background">{uiFooter()}</div>
								</div>
							</div>
						)}
					</div>
				</>
			);
		}
	}

	function uiProjectList(projectRows, captureMode = false) {
		if (captureMode) return <div className="w-full bottom-border contrast-background">{projectRows.map((row, i) => uiRows(row, i))}</div>;

		return <Virtuoso className="w-full h-full overflow-y-auto bottom-border contrast-background" data={projectRows} itemContent={(i, row) => uiRows(row, i)} totalCount={projectRows.length} />;
	}

	function uiRows(row, i) {
		const width = selectedCompany.id != 0 ? "w-[11.11%]" : "w-[10%]";
		const style = `flex ${width} justify-center-safe items-center-safe text-center`;

		const tooltipStyle2 = `${style} cursor-help`;

		const fancyRightBorderStyle = "absolute w-3 h-[50px] rounded-tr-full rounded-br-full " + getStatusSeverityBackground(row.status) + " -left-1";

		const invoiceFeesColour = row.invoice_fees == 0 ? "text-gray-300" : "primary-text";
		const invoiceFeesStyle = `${tooltipStyle2} ${invoiceFeesColour}`;

		const rvFeesColour = row.reimburse_voucher == 0 ? "text-gray-300" : "primary-text";
		const rvFeesStyle = `${tooltipStyle2} ${rvFeesColour}`;

		const amountPendingColour = row.amount_pending == 0 ? "text-gray-300" : "red-text";
		const amountPendingStyle = `${style} font-semibold-11 ${amountPendingColour}`;

		const amountReceivedColour = row.amount_received == 0 ? "text-gray-300" : "green-text";
		const amountReceivedStyle = `font-semibold-11 ${amountReceivedColour}`;

		const totalFeesColour = row.total_fees == 0 ? "text-gray-300" : "primary-text";
		const totalFeesStyle = `${style} font-semibold-11 ${totalFeesColour}`;

		return (
			<div className="flex w-full py-3 justify-center-safe items-center-safe contrast-background bottom-border font-regular-10 black-text" key={i}>
				<div className={`${style} flex-col!`}>
					<span className={fancyRightBorderStyle} />
					<span
						className="font-semibold-11"
						dangerouslySetInnerHTML={{
							__html: MyGlobal.HighlightText(row.id, filter.find),
						}}
					/>
					<Tippy content={<Tooltip text={dayjs(row.started_on).format("hh:mm:ss A")} />} placement="bottom">
						<span className="cursor-pointer font-regular-9 gray-text">{dayjs(row.started_on).format("DD/MM/YYYY")}</span>
					</Tippy>
				</div>

				<Tippy content={<Tooltip text={row.main_project_name} />} placement="bottom">
					<span
						className={`${tooltipStyle2} cursor-pointer font-semibold-10 primary-text`}
						dangerouslySetInnerHTML={{
							__html: MyGlobal.HighlightText(row.sub_project_name, filter.find),
						}}
						onClick={() => toggleSingleProjectView(row)}
					/>
				</Tippy>

				{selectedCompany.id == 0 && (
					<span
						className={`${style} overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]`}
						dangerouslySetInnerHTML={{
							__html: MyGlobal.HighlightText(row.company_name, filter.find),
						}}
					/>
				)}

				<span className={`${style} space-x-1 cursor-help primary-text`}>
					<AvatarCircle names={row.teams.map((m) => m.full_name)} />
				</span>

				<div className={`${style} flex-col!`}>
					<Tippy content={<Tooltip text={row.invoice_firm_name} />} placement="bottom">
						<span
							className="font-semibold-10"
							dangerouslySetInnerHTML={{
								__html: MyGlobal.HighlightText(row.invoice_firm_name, filter.find),
							}}
						/>
					</Tippy>
					<Tippy content={<Tooltip text={row.completed_on} />} disabled={row.status != "Completed"} placement="bottom">
						<BadgeSmallWithBackground2 style={getStatusSeverityBackground2(row.status)} value={row.status} />
					</Tippy>
				</div>

				<span
					className={invoiceFeesStyle}
					dangerouslySetInnerHTML={{
						__html: MyGlobal.HighlightText(row.invoice_fees, filter.find),
					}}
				/>

				<span
					className={rvFeesStyle}
					dangerouslySetInnerHTML={{
						__html: MyGlobal.HighlightText(row.reimburse_voucher, filter.find),
					}}
				/>

				<div className={`${style} space-x-2 relative`}>
					<Tippy content={<Tooltip text={`Invoice - ${row.invoice_amount_received}\n, RV - ${row.rv_amount_received}`} />} placement="bottom">
						<span
							className={`${amountReceivedStyle} w-4/5 underline underline-offset-4 cursor-help`}
							dangerouslySetInnerHTML={{
								__html: MyGlobal.HighlightText(row.amount_received, filter.find),
							}}
						/>
					</Tippy>
				</div>

				<span
					className={amountPendingStyle}
					dangerouslySetInnerHTML={{
						__html: MyGlobal.HighlightText(row.amount_pending, filter.find),
					}}
				/>

				<span
					className={totalFeesStyle}
					dangerouslySetInnerHTML={{
						__html: MyGlobal.HighlightText(row.total_fees, filter.find),
					}}
				/>
			</div>
		);
	}

	function uiSortArrows(column) {
		if (sort.isAscending) return <FontAwesomeIcon icon={faSortAmountAsc} />;
		return <FontAwesomeIcon icon={faSortAmountDesc} />;
	}

	function uiTopBar() {
		return (
			<div className="flex w-full justify-between items-center-safe">
				<div className="flex flex-col w-1/4 justify-center-safe -space-y-1">
					<span className="text-gray-500 text-xs">{client.id}</span>
					<span className="view-heading text-xl!">{client.name}</span>
				</div>
				<div className="flex w-3/4 space-x-3 items-center-safe">
					<div className="flex p-2.5 space-x-3 justify-center-safe items-center-safe rounded-full shadow">
						<Tippy content={<Tooltip text={client.phoneNumber} />} placement="bottom">
							<FontAwesomeIcon className="bg-transparent cursor-pointer text-teal-600 transition-all duration-200 hover:scale-125 focus:outline-none" icon={faWhatsapp} onClick={() => openWhatsApp(client.phoneNumber)} size="md" />
						</Tippy>
						<Tippy content={<Tooltip text={client.emailAddress} />} placement="bottom">
							<FontAwesomeIcon className="bg-transparent cursor-pointer text-rose-600 transition-all duration-200 hover:scale-125 focus:outline-none" icon={faEnvelope} onClick={() => openEmailAddress(client.emailAddress)} size="md" />
						</Tippy>
						<Tippy content={<Tooltip text={referenceName} />} disabled={!referenceName.length} placement="bottom">
							<FontAwesomeIcon className="bg-transparent text-sky-600 transition-all duration-200 hover:scale-125 focus:outline-none" icon={faUserTag} size="md" />
						</Tippy>
					</div>
					<div className="flex p-2.5 space-x-3 justify-center-safe items-center-safe rounded-full shadow">
						<Menu as="div" className="flex w-35 justify-center-safe items-center-safe relative">
							<MenuButton className="flex w-full h-7.5 px-2.5 justify-between items-center-safe focus:outline-none relative z-40 rounded-full shadow contrast-background font-regular-10">
								<div className="flex w-full space-x-2.5 items-center-safe">
									<FontAwesomeIcon className="primary-text" icon={faCalendar} size="sm" />
									<span className="gray-text">{filter.financialYear || "Year"}</span>
								</div>
								<FontAwesomeIcon className={showClearCompanyButton} onClick={() => setFilter((s) => ({ ...s, financialYear: "" }))} icon={faMultiply} />
							</MenuButton>
							<MenuItems className="absolute w-full top-8 right-0 origin-top-right rounded contrast-background shadow focus:outline-none z-50">{uiFinancialYearList()}</MenuItems>
						</Menu>
						<div className="flex w-fit h-7.5 px-2.5 space-x-1 items-center-safe rounded-full shadow contrast-background">
							<FontAwesomeIcon className="blue-text" icon={faCalendar} size="sm" />
							<ReactDatePicker className="w-20 h-6 bg-transparent outline-none font-regular-10" dateFormat="dd-MM-YYYY" dropdownMode="select" endDate={filter.fromDate} onChange={(e) => setInputs("fromDate", e)} peekNextMonth placeholderText="From" tabIndex={1} selected={filter.fromDate} selectsStart startDate={filter.fromDate} showMonthDropdown showYearDropdown />
							<FontAwesomeIcon className={showFromDateClearButton} onClick={() => setInputs("fromDate", "")} icon={faMultiply} />
							<FontAwesomeIcon className="blue-text" icon={faCalendar} size="sm" />
							<ReactDatePicker className="w-20 h-6 bg-transparent outline-none font-regular-10" dateFormat="dd-MM-YYYY" dropdownMode="select" endDate={filter.toDate} onChange={(e) => setInputs("toDate", e)} peekNextMonth placeholderText="To" tabIndex={2} selected={filter.toDate} selectsStart startDate={filter.toDate} showMonthDropdown showYearDropdown />
							<FontAwesomeIcon className={showToDateClearButton} onClick={() => setInputs("toDate", "")} icon={faMultiply} />
						</div>
						<TextInputNative id="findBox" icon={faSearch} onChange={(e) => setInputs("find", e.target.value)} onClearButtonClick={() => setInputs("find", "")} placeholder="Find" showClearButton={showClearSearchButton} tabIndex={1} value={filter.find} width="w-[144px]" />
					</div>
					<div className="flex p-2.5 space-x-3 justify-center-safe items-center-safe rounded-full shadow">
						<Tippy content={<Tooltip text="Open uploaded files" />} placement="bottom">
							<FontAwesomeIcon className="bg-transparent cursor-pointer text-blue-600 transition-all duration-200 hover:scale-125 focus:outline-none" icon={loading.uploadedFiles ? faSpinner : faCloudUpload} onClick={() => toggleFilesView()} size="md" spin={loading.uploadedFiles} />
						</Tippy>
						<Tippy content={<Tooltip text="Download all clients data in Excel file." />} placement="bottom">
							<FontAwesomeIcon className="bg-transparent cursor-pointer text-emerald-600 transition-all duration-200 hover:scale-125 focus:outline-none" icon={faDownload} onClick={() => doExcelExport()} size="md" />
						</Tippy>
						<Tippy content={<Tooltip text="Capture screenshot" />} placement="bottom">
							<FontAwesomeIcon className="bg-transparent cursor-pointer text-purple-600 transition-all duration-200 hover:scale-125 focus:outline-none" icon={faCamera} onClick={() => captureScreenshot()} size="md" />
						</Tippy>
					</div>
				</div>
			</div>
		);
	}

	// Hooks
	useEffect(() => {
		getSingleClientData();
		getUploadedFiles();
	}, []);

	useEffect(() => {
		if (filter.fromDate && filter.toDate) doFiltering("date");
	}, [filter.fromDate, filter.toDate]);

	useEffect(() => {
		doFiltering();
	}, [filter.find]);

	useEffect(() => {
		doFiltering(filter.financialYear ? "financialYear" : "");
	}, [filter.financialYear]);

	useEffect(() => {
		if (filter.fromDate && filter.toDate) {
			doFiltering("date");
			return;
		}

		if (filter.financialYear) {
			doFiltering("financialYear");
			return;
		}

		if (filter.find) {
			doFiltering();
			return;
		}

		setSelectedCompanysProjects();
	}, [selectedCompany]);

	// Main UI
	return (
		<>
			{uiMain()}

			{isOpen.editCompany && <EditCompany company={selectedCompany} mount={isOpen.editCompany} reload={getSingleClientData} unmount={toggleEditCompanyBox} />}

			{isOpen.deleteCompany && <DeleteCompany company={selectedCompany} mount={isOpen.deleteCompany} reload={getSingleClientData} unmount={toggleDeleteCompanyBox} />}

			{isOpen.uploadedFiles && <Files close={toggleFilesView} files={uploadedFiles} refresh={getUploadedFiles} thisClient={client} />}

			{isOpen.singleProject && <SingleProject client={client} project={selectedProject} reload={getSingleClientData} source="Single Client => Single Project" unmount={toggleSingleProjectView} />}
		</>
	);
}
