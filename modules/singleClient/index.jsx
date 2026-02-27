"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import Files from "./Files";
import Tippy from "@tippyjs/react";
import html2canvas from "html2canvas";
import writeXlsxFile from "write-excel-file/browser";
import SingleProject from "../singleProject";
import ReactDatePicker from "react-datepicker";
import MyConstants from "@/utilities/constants";

import { Virtuoso } from "react-virtuoso";
import { MyGlobal } from "@/utilities/global";
import { useEffect, useMemo, useRef, useState } from "react";
import { EditCompany } from "@/modals/singleClient";
import { TextInputNative } from "@/components/Inputs";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AvatarCircle, BadgeSmallWithBackground, BadgeSmallWithBackground2, SpinnerSmall, Tooltip, UsersTooltipList } from "@/components/Elements";
import { faCalendar, faCamera, faChevronLeft, faCloudUpload, faEnvelope, faFileExcel, faIdBadge, faMultiply, faPencil, faSearch, faSortAmountAsc, faSortAmountDesc, faUserTag } from "@fortawesome/free-solid-svg-icons";

export default function SingleClient({ client, unmount }) {
	// Business Logic
	const captureRef = useRef();
	const headers = MyConstants.TableHeaders.SingleClient;

	const [api, setApi] = useState({
		companies: [],
		projects: { copy: [], data: [] },
		referenceName: "",
		tasks: [],
		uploadedFiles: [],
	});

	const [loading, setLoading] = useState({
		supportData: false,
		uploadedFiles: false,
	});

	const [main, setMain] = useState({
		filter: {
			date: { from: "", to: "" },
			find: "",
		},
		projects: [],
		selectedCompany: {
			id: 0,
			index: 0,
			name: "All",
			details: {},
		},
		selectedProject: {},
		sort: { column: headers.Id, isAscending: false },
	});

	const [mounted, setMounted] = useState({
		editCompany: false,
		mainComponent: false,
		singleProject: false,
		uploadedFiles: false,
	});

	const allowEditingCompany = MyGlobal.HasPermission(MyConstants.Modules.Derived.EditCompany);

	const showClearSearchButton = main.filter.find ? "cursor-pointer primary-text" : "hidden";
	const showFromDateClearButton = main.filter.date.from ? "cursor-pointer primary-text" : "hidden";
	const showToDateClearButton = main.filter.date.to ? "cursor-pointer primary-text" : "hidden";

	// Functions
	async function captureScreenshot() {
		const element = captureRef.current;
		if (!element) return;

		await new Promise((res) => setTimeout(res, 500));

		const canvas = await html2canvas(element, {
			scale: 1,
			useCORS: true,
		});

		canvas.toBlob(async (blob) => {
			if (!blob) {
				console.error("Screenshot failed: blob is null");
				MyGlobal.ShowErrorToast("Screenshot failed. Try again.");
				return;
			}

			try {
				await navigator.clipboard.write([
					new ClipboardItem({
						[blob.type]: blob,
					}),
				]);
				MyGlobal.ShowSuccessToast("Screenshot copied to clipboard.");
			} catch (err) {
				console.error("Failed to copy screenshot: ", err);
				MyGlobal.ShowErrorToast("Failed to copy screenshot.");
			}
		});
	}

	function doExcelExport() {
		const records = [];
		const _records = [];

		const columnsWidth = [];
		const dataHeaders = [];

		const rowHeight = 34;
		const headerHeight = 44;
		const maximumColumnWidth = 20;

		const _headers = Object.values(headers);
		const blankRows = [{ span: _headers.length, height: rowHeight, colSpan: 2 }];

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

		const headerText = `${client.id} - ${client.name} (${api.projects.data.length})`;

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
			fileName: `${client.id}_${client.name}_(${api.projects.data.length}).xlsx`,
		});
	}

	function doFiltering(source) {
		const filtered = main.projects.filter((f) => {
			if (source == "date") {
				const checkDate = new Date(f.started_on);
				const startDate = main.filter.date.from;
				const endDate = main.filter.date.to;

				if (checkDate >= startDate && checkDate <= endDate) {
					return f;
				}
			} else {
				const findText = main.filter.find.toLowerCase();

				const id = String(f.id).toLowerCase();
				const company = String(f.company).toLowerCase();
				const subProject = String(f.sub_project).toLowerCase();
				const invoiceFirm = String(f.invoice_firm).toLowerCase();
				const status = String(f.status).toLowerCase();

				return id.includes(findText) || company.includes(findText) || subProject.includes(findText) || invoiceFirm.includes(findText) || String(f.invoice_fees).includes(findText) || String(f.reimbursement_voucher).includes(findText) || String(f.amount_received).includes(findText) || String(f.amount_pending).includes(findText) || String(f.total_fees).includes(findText) || status.includes(findText);
			}
		});

		setMain((s) => ({ ...s, projects: filtered }));
	}

	function doSorting() {
		return main.projects.sort((a, b) => {
			const { column, isAscending } = main.sort;

			if (column == headers.Id && isAscending) {
				return a.id.localeCompare(b.id);
			} else if (column == headers.Id && !isAscending) {
				return b.id.localeCompare(a.id);
			} else if (column == headers.SubProject && isAscending) {
				return a.sub_project.localeCompare(b.sub_project);
			} else if (column == headers.SubProject && !isAscending) {
				return b.sub_project.localeCompare(a.sub_project);
			} else if (column == headers.Company && isAscending) {
				return a.company.localeCompare(b.company);
			} else if (column == headers.Company && !isAscending) {
				return b.company.localeCompare(a.company);
			} else if (column == headers.Teams && isAscending) {
				return a.teams.localeCompare(b.teams);
			} else if (column == headers.Teams && !isAscending) {
				return b.teams.localeCompare(a.teams);
			} else if (column == headers.InvoiceFirm && isAscending) {
				return a.invoice_firm.localeCompare(b.invoice_firm);
			} else if (column == headers.InvoiceFirm && !isAscending) {
				return b.invoice_firm.localeCompare(a.invoice_firm);
			} else if (column == headers.InvoiceFees && isAscending) {
				return a.invoice_fees - b.invoice_fees;
			} else if (column == headers.InvoiceFees && !isAscending) {
				return b.invoice_fees - a.invoice_fees;
			} else if (column == headers.ReimbursementVoucher && isAscending) {
				return a.reimbursement_voucher - b.reimbursement_voucher;
			} else if (column == headers.ReimbursementVoucher && !isAscending) {
				return b.reimbursement_voucher - a.reimbursement_voucher;
			} else if (column == headers.Total && isAscending) {
				return a.total_fees - b.total_fees;
			} else if (column == headers.Total && !isAscending) {
				return b.total_fees - a.total_fees;
			} else if (column == headers.Status && isAscending) {
				return a.status.localeCompare(b.status);
			} else if (column == headers.Status && !isAscending) {
				return b.status.localeCompare(a.status);
			} else {
				return b.id.localeCompare(a.id);
			}
		});
	}

	function getTotalValues() {
		const total = {
			amountPending: 0,
			amountReceived: 0,
			invoiceFees: 0,
			reimburseVoucher: 0,
			totalFees: 0,
		};

		for (const i of main.projects) {
			total.amountPending += Number(i.amount_pending);
			total.amountReceived += Number(i.amount_received);
			total.invoiceFees += Number(i.invoice_fees);
			total.reimburseVoucher += Number(i.reimburse_voucher);
			total.totalFees += Number(i.total_fees);
		}

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

	function setInputs(key, value) {
		if (key == "from" || key == "to") {
			setMain((s) => ({
				...s,
				filter: { ...s.filter, date: { ...s.filter.date, [key]: value } },
			}));
		} else {
			setMain((s) => ({ ...s, filter: { ...s.filter, find: value } }));
		}
	}

	function setSelectedCompany(object, i) {
		setMain((s) => ({
			...s,
			selectedCompany: {
				details: object,
				id: object.id,
				index: i,
				name: object.name,
			},
		}));
	}

	function setSelectedCompanysProjects() {
		if (main.selectedCompany.id == 0) {
			setMain((s) => ({ ...s, projects: api.projects.copy }));
		} else {
			const selectedCompanysProjects = api.projects.copy.filter((f) => f.company_id == main.selectedCompany.id);

			setMain((s) => ({ ...s, projects: selectedCompanysProjects }));
		}
	}

	function setSort(column) {
		setMain((s) => ({
			...s,
			sort: { column, isAscending: !s.sort.isAscending },
		}));
	}

	async function setSupportData(action) {
		setMain((s) => ({ ...s, supportData: true }));

		try {
			const response = await axios.get(MyConstants.ApiEndpoints.Clients.GetSupportData, MyGlobal.GetHeaders({ clientId: client.id }));

			if (response.status === 200) {
				const companies = response.data.companies;
				const projects = response.data.projects;
				const projectExpenses = response.data.projectExpenses;

				const revisedProjects = [];

				projects
					.filter((f) => f.client_id == client.id)
					.forEach((fe) => {
						let companyName = "";
						const company = companies.find((f) => f.id == fe.company_id);

						if (typeof company === "object") {
							companyName = company.name;
						}

						const invoiceFees = Number(fe.invoice_fees);
						let invoiceFirmName = "";

						const invoiceFirm = response.data.firms.find((f) => f.id == fe.firm_id);

						if (typeof invoiceFirm === "object") {
							invoiceFirmName = invoiceFirm.name;
						}

						let mainProjectName = "";
						const mainProject = response.data.mainProjects.find((f) => f.id == fe.main_project_id);

						if (typeof mainProject === "object") {
							mainProjectName = mainProject.name;
						}

						let subProjectName = "";
						const subProject = response.data.subProjects.find((f) => f.id == fe.sub_project_id);

						if (typeof subProject === "object") {
							subProjectName = subProject.name;
						}

						const invoiceAmountReceived = response.data.transactions.filter((f) => f.project_id == fe.id).reduce((pv, cv) => pv + Number(cv.amount), 0);

						const rvAmountReceived = response.data.rvTransactions.filter((f) => f.project_id == fe.id).reduce((pv, cv) => pv + Number(cv.amount), 0);

						const totalAmountReceived = invoiceAmountReceived + rvAmountReceived;

						const reimburseVoucher = projectExpenses.filter((f) => f.project_id == fe.id).reduce((pv, cv) => pv + Number(cv.expense), 0);

						const teamNames = MyGlobal.GetAnyDataFromId(fe.teams, "full_name");

						const totalFees = invoiceFees + reimburseVoucher;

						revisedProjects.push({
							...fe,
							amount_pending: totalFees - totalAmountReceived,
							amount_received: totalAmountReceived,
							company_name: companyName,
							completed_on: dayjs(fe.completed_on).format("hh:mm:ss A - DD/MM/YYYY"),
							invoice_amount_received: invoiceAmountReceived,
							invoice_fees: invoiceFees,
							invoice_firm_name: invoiceFirmName,
							invoice_firm_initials: MyGlobal.GetInitials(invoiceFirmName),
							main_project_name: mainProjectName,
							reimburse_voucher: reimburseVoucher,
							rv_amount_received: rvAmountReceived,
							sub_project_name: subProjectName,
							teams: MyGlobal.GetFullDetailsFromIds(fe.teams),
							team_names: teamNames,
							team_names_initials: MyGlobal.GetInitials(teamNames),
							total_amount_received: totalAmountReceived,
							total_fees: totalFees,
						});
					});

				let referenceName = "";

				if ("reference" in response.data) {
					if (response.data.reference.length) {
						referenceName = response.data.reference.at(0).name;
					}
				}

				const selectedCompany = {
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
					const companyObj = companies.find((f) => f.id === main.selectedCompany.id);

					if (typeof companyObj === "object") {
						selectedCompany.details = {
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
						};
						selectedCompany.id = companyObj.id;
						selectedCompany.index = main.selectedCompany.index;
						selectedCompany.name = companyObj.name;
					}
				}

				setApi((s) => ({
					...s,
					companies,
					projects: {
						copy: revisedProjects,
						data: revisedProjects,
					},
					referenceName,
					tasks: projectExpenses,
				}));

				setMain((s) => ({ ...s, projects: revisedProjects, selectedCompany }));
				setMounted((s) => ({ ...s, mainComponent: true }));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Single Client => Set Support Data");
		} finally {
			setMain((s) => ({ ...s, supportData: false }));
		}
	}

	async function setUploadedFiles() {
		setLoading((s) => ({ ...s, uploadedFiles: true }));

		try {
			const response = await axios.get(MyConstants.ApiEndpoints.Clients.GetFiles, MyGlobal.GetHeaders({ clientId: client.id }));

			if (response.status === 200) {
				setApi((s) => ({ ...s, uploadedFiles: response.data }));
			}
		} catch (error) {
			console.log("");
			// MyGlobal.HandleErrors(error, "Single Client => Set Uploaded Files");
		} finally {
			setLoading((s) => ({ ...s, uploadedFiles: false }));
		}
	}

	function toggleEditCompanyBox() {
		setMounted((s) => ({ ...s, editCompany: !s.editCompany }));
	}

	function toggleFilesView() {
		setMounted((s) => ({ ...s, uploadedFiles: !s.uploadedFiles }));
	}

	function toggleSingleProjectView(object) {
		setMain((s) => ({ ...s, selectedProject: object }));
		setMounted((s) => ({ ...s, singleProject: object ? true : false }));
	}

	// UI Components
	function uiClientDetails() {
		const wrapper = "flex h-6 space-x-2 justify-center items-center cursor-pointer relative primary-tag-transparent-01";

		const uploadedFilesIcon = loading.uploadedFiles ? (
			<span className="px-2">
				<SpinnerSmall />
			</span>
		) : (
			<FontAwesomeIcon className="primary-text" icon={faCloudUpload} />
		);

		return (
			<div className="flex w-full justify-between items-center">
				<div className="flex w-4/5 space-x-2.5 justify-start items-center">
					<span className="view-heading text-lg!">{client.name}</span>
					<span className={wrapper}>
						<FontAwesomeIcon className="primary-text" icon={faIdBadge} />
						<span>{client.id}</span>
					</span>
					<span className={wrapper} onClick={() => openWhatsApp(client.phone_number)}>
						<FontAwesomeIcon className="primary-text" icon={faWhatsapp} />
						<span>{client.phone_number}</span>
					</span>
					<span className={wrapper} onClick={() => openEmailAddress(client.email_address)}>
						<FontAwesomeIcon className="primary-text" icon={faEnvelope} />
						<span>{client.email_address}</span>
					</span>
					<span className={wrapper}>
						<FontAwesomeIcon className="primary-text" icon={faUserTag} />
						<span>{api.referenceName}</span>
					</span>
					<span className={wrapper} onClick={() => toggleFilesView()}>
						{uploadedFilesIcon}
						<span>{uiUploadedFiles()}</span>
					</span>
				</div>
				<div className="flex w-1/5 space-x-2.5 justify-end items-center cursor-pointer font-regular-10 primary-text">
					<button className="primary-button-transparent-background" onClick={() => doExcelExport()}>
						<FontAwesomeIcon className="primary-text" icon={faFileExcel} />
					</button>
				</div>
			</div>
		);
	}

	function uiCompanies() {
		const companies = api.companies.length ? [...api.companies] : [];
		companies.unshift({ id: 0, name: "All" });

		return companies.map((m, i) => {
			const selectedCompanyStyle = i == main.selectedCompany.index ? "primary-border primary-background-transparent-01 primary-text" : "full-border bg-white black-text";

			const wrapper = `flex w-full px-4 py-2 justify-between items-center rounded shadow ${selectedCompanyStyle} font-regular-10 hovered-rows`;

			return (
				<button className={wrapper} key={i} onClick={() => setSelectedCompany(m, i)}>
					<span>{m.name || "Unnamed"}</span>
				</button>
			);
		});
	}

	function uiFind() {
		return <TextInputNative id="findBox" icon={faSearch} onChange={(e) => setInputs("find", e.target.value)} onClearButtonClick={() => setInputs("find", "")} placeholder="Find" showClearButton={showClearSearchButton} tabIndex={1} value={main.filter.find} width="w-44" />;
	}

	function uiFooter() {
		const totalValues = getTotalValues();

		return Object.values(headers)
			.filter((f) => {
				if (main.selectedCompany.id != 0) {
					return f != headers.Company;
				}
				return f;
			})
			.map((m, i) => {
				if (main.selectedCompany.id != 0) {
					return (
						<span className="flex w-[11.11%] justify-center items-center text-white font-medium-12" key={i}>
							<span>{i == 4 && totalValues.invoiceFees}</span>
							<span>{i == 5 && totalValues.reimburseVoucher}</span>
							<span>{i == 6 && totalValues.amountReceived}</span>
							<span>{i == 7 && totalValues.amountPending}</span>
							<span>{i == 8 && totalValues.totalFees}</span>
						</span>
					);
				} else {
					return (
						<span className="flex w-[10%] justify-center items-center text-white font-medium-12" key={i}>
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

	function uiFromDate() {
		return (
			<div className="flex w-36 h-7.5 px-2.5 space-x-1 justify-start items-center rounded shadow contrast-background">
				<FontAwesomeIcon className="primary-text" icon={faCalendar} size="sm" />
				<ReactDatePicker className="w-20 h-6 bg-transparent outline-none font-medium-11" dateFormat="dd-MM-YYYY" dropdownMode="select" endDate={main.filter.date.from} onChange={(e) => setInputs("from", e)} peekNextMonth placeholderText="From" tabIndex={1} selected={main.filter.date.from} selectsStart startDate={main.filter.date.from} showMonthDropdown showYearDropdown />
				<FontAwesomeIcon className={showFromDateClearButton} onClick={() => setInputs("from", "")} icon={faMultiply} />
			</div>
		);
	}

	function uiHeaders() {
		return Object.values(headers)
			.filter((f) => {
				if (main.selectedCompany.id != 0) {
					return f != headers.Company;
				}
				return f;
			})
			.map((m, i) => {
				const showArrow = m == main.sort.column ? "visible" : "invisible";
				const width = main.selectedCompany.id != 0 ? "w-[11.11%]" : "w-[10%]";
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
		if (!mounted.singleProject && !mounted.uploadedFiles) {
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
									<span className="view-heading text-lg!">{main.selectedCompany.name}</span>
									<FontAwesomeIcon className={showEditCompanyIcon} icon={faPencil} onClick={() => toggleEditCompanyBox()} size="sm" />
								</div>
								<div className="flex w-1/2 space-x-5 justify-end items-center">
									<FontAwesomeIcon className="cursor-pointer p-2 hover:w-fit hover:p-2 hover:bg-blue-500 hover:text-white hover:rounded-full hover:transition-all duration-500" icon={faCamera} onClick={() => captureScreenshot()} />
									{uiFromDate()}
									{uiToDate()}
									{uiFind()}
								</div>
							</div>
						</div>
						<div className="flex w-full h-full px-5 space-x-5 justify-center items-start">
							<div className="flex flex-col w-[10%] space-y-2.5 justify-start items-center">{uiCompanies()}</div>
							<div className="flex flex-col w-[90%] h-full justify-start items-center full-border" ref={captureRef}>
								<div className="flex w-full primary-background">{uiHeaders()}</div>
								<Virtuoso className="w-full h-full overflow-y-auto bottom-border contrast-background" data={doSorting()} itemContent={(i, row) => uiRows(row, i)} totalCount={api.projects.data.length} />
								<div className="flex w-full h-9 justify-center items-center primary-background">{uiFooter()}</div>
							</div>
						</div>
					</div>
				</>
			);
		}
	}

	const statuses = useMemo(() => MyConstants.Statuses.Projects2, []);

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

	function uiRows(row, i) {
		const width = main.selectedCompany.id != 0 ? "w-[11.11%]" : "w-[10%]";
		const style = `flex flex-wrap ${width} justify-center items-center text-center`;

		const tooltipStyle = `${style} cursor-help primary-text`;
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
			<div className="flex w-full py-3 justify-center items-center black-white-background bottom-border font-regular-10 black-text" key={i}>
				<div className={`${style} flex-col!`}>
					<span className={fancyRightBorderStyle} />
					<span
						className="font-semibold-11"
						dangerouslySetInnerHTML={{
							__html: MyGlobal.HighlightText(row.id, main.filter.find),
						}}
					/>
					<Tippy content={<Tooltip text={dayjs(row.started_on).format("hh:mm:ss A")} />} placement="bottom">
						<span className={`${tooltipStyle2} font-regular-9 gray-text`}>{dayjs(row.started_on).format("DD/MM/YYYY")}</span>
					</Tippy>
				</div>

				<Tippy content={<Tooltip text={row.main_project_name} />} placement="bottom">
					<span
						className={`${tooltipStyle2} cursor-pointer font-semibold-10 primary-text`}
						dangerouslySetInnerHTML={{
							__html: MyGlobal.HighlightText(row.sub_project_name, main.filter.find),
						}}
						onClick={() => toggleSingleProjectView(row)}
					/>
				</Tippy>

				{main.selectedCompany.id == 0 && (
					<span
						className={`${style} overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]`}
						dangerouslySetInnerHTML={{
							__html: MyGlobal.HighlightText(row.company_name, main.filter.find),
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
								__html: MyGlobal.HighlightText(row.invoice_firm_name, main.filter.find),
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
						__html: MyGlobal.HighlightText(row.invoice_fees, main.filter.find),
					}}
				/>

				<span
					className={rvFeesStyle}
					dangerouslySetInnerHTML={{
						__html: MyGlobal.HighlightText(row.reimburse_voucher, main.filter.find),
					}}
				/>

				<div className={`${style} space-x-2 relative`}>
					<Tippy content={<Tooltip text={`Invoice - ${row.invoice_amount_received}\n, RV - ${row.rv_amount_received}`} />} placement="bottom">
						<span
							className={`${amountReceivedStyle} w-4/5 underline underline-offset-4 cursor-help`}
							dangerouslySetInnerHTML={{
								__html: MyGlobal.HighlightText(row.amount_received, main.filter.find),
							}}
						/>
					</Tippy>
				</div>

				<span
					className={amountPendingStyle}
					dangerouslySetInnerHTML={{
						__html: MyGlobal.HighlightText(row.amount_pending, main.filter.find),
					}}
				/>

				<span
					className={totalFeesStyle}
					dangerouslySetInnerHTML={{
						__html: MyGlobal.HighlightText(row.total_fees, main.filter.find),
					}}
				/>
			</div>
		);
	}

	function uiSortArrows(column) {
		if (main.sort.column === column) {
			if (main.sort.isAscending) return <FontAwesomeIcon icon={faSortAmountAsc} />;
			return <FontAwesomeIcon icon={faSortAmountDesc} />;
		}
	}

	function uiToDate() {
		return (
			<div className="flex w-36 h-7.5 px-2.5 space-x-1 justify-start items-center rounded shadow contrast-background">
				<FontAwesomeIcon className="primary-text" icon={faCalendar} size="sm" />
				<ReactDatePicker className="w-20 h-6 bg-transparent outline-none font-medium-11" dateFormat="dd-MM-YYYY" dropdownMode="select" endDate={main.filter.date.to} onChange={(e) => setInputs("to", e)} peekNextMonth placeholderText="To" tabIndex={3} selected={main.filter.date.to} selectsStart startDate={main.filter.date.to} showMonthDropdown showYearDropdown />
				<FontAwesomeIcon className={showToDateClearButton} onClick={() => setInputs("to", "")} icon={faMultiply} />
			</div>
		);
	}

	function uiUploadedFiles() {
		if (!loading.uploadedFiles) {
			if (!api.uploadedFiles.length) return <span>Upload</span>;

			const label = api.uploadedFiles.length == 1 ? "File" : "Files";

			return (
				<div>
					{api.uploadedFiles.length} {label}
				</div>
			);
		}
	}

	// Hooks
	useEffect(() => {
		setSupportData();
		setUploadedFiles();
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
	}, [main.filter.find]);

	// Main UI
	return (
		<>
			{uiMain()}

			{mounted.editCompany && <EditCompany company={main.selectedCompany} mount={mounted.editCompany} reload={setSupportData} unmount={toggleEditCompanyBox} />}

			{mounted.uploadedFiles && <Files close={toggleFilesView} files={api.uploadedFiles} refresh={setUploadedFiles} thisClient={client} />}

			{mounted.singleProject && <SingleProject client={client} project={main.selectedProject} reload={setSupportData} source="Single Client => Single Project" unmount={toggleSingleProjectView} />}
		</>
	);
}
