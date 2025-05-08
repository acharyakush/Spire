"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import "react-datepicker/dist/react-datepicker.css";

import axios from "axios";
import dayjs from "dayjs";
import Notes from "./Notes";
import Tippy from "@tippyjs/react";
import NewInquiry from "./NewInquiry";
import EditInquiry from "./EditInquiry";
import MyInquiries from "./MyInquiries";
import NewQuotaion from "./NewQuotation";
import writeXlsxFile from "write-excel-file";
import ReactDatePicker from "react-datepicker";
import NewProject from "../projects/NewProject";
import MyConstants from "@/utilities/constants";

import { Virtuoso } from "react-virtuoso";
import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { TextInputNative } from "@/components/Inputs";
import { UpdateStatus } from "@/modals/inquiries/miscellaneous";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { AvatarCircle, Badge, BadgeSmallWithBackground, Spinner, Tooltip, TooltipList } from "@/components/Elements";
import { faCalendar, faChevronDown, faCircleCheck, faFileDownload, faFileExcel, faFilter, faIndianRupee, faMultiply, faPlusCircle, faReceipt, faSearch, faSortAmountAsc, faSortAmountDesc } from "@fortawesome/free-solid-svg-icons";

export default function Inquiries({ presetStatus, setModuleProps }) {
	// Business Logic
	const [api, setApi] = useState({
		clients: [],
		inquiries: {
			copy: [],
			data: [],
			mergedWithNotes: [],
		},
		notes: [],
	});

	const [main, setMain] = useState({
		filter: { from: "", to: "" },
		findText: presetStatus ?? "",
		isLoading: false,
		selectedInquiryForNotes: {},
		selectedInquiryForStatusChange: {},
		sort: { column: "", isAscending: false },
	});

	const [mounted, setMounted] = useState({
		addQuotation: false,
		convertToProject: false,
		editInquiry: false,
		mainComponent: false,
		myInquiries: presetStatus === "my-inquiries" || String(presetStatus).startsWith("MySpace"),
		newInquiry: false,
		newProject: false,
		notes: false,
		updateStatus: false,
	});

	const allowConvertingToProject = MyGlobal.HasPermission(MyConstants.Modules.Derived.NewProject);

	const headers = MyConstants.TableHeaders.Inquiries;
	const thisView = MyConstants.Modules.Base.Inquiries;
	const statuses = MyConstants.Statuses.Inquiries;

	const isAdministrator = MyGlobal.IsUserAdministrator();

	const newInquiryButton = MyGlobal.HasPermission(MyConstants.Modules.Derived.NewInquiry) ? "block space-x-1.5 primary-button-transparent-background" : "hidden";

	const showFromDateClearButton = main.filter.from ? "cursor-pointer primary-text" : "hidden";
	const showToDateClearButton = main.filter.to ? "cursor-pointer primary-text" : "hidden";
	const showFindClearButton = main.findText ? "cursor-pointer primary-text" : "hidden";

	const blankDataWrapper = "flex w-full h-full justify-center items-center font-regular-12 gray-text contrast-background full-border";

	// Functions
	function closeMyInquiries() {
		setMain((s) => ({ ...s, findText: "" }));
		setMounted((s) => ({ ...s, myInquiries: false }));
	}

	function closeNewProjectView() {
		setMounted((s) => ({ ...s, newProject: false }));
	}

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
			records.push(fe.entry_date, fe.client_id_and_name, fe.phone_number, fe.main_project, fe.sub_project, fe.reference_id_and_name, fe.follow_ups, fe.quote, fe.status, getTotalNotesByInquiry(fe.id), fe.entry_by_id_and_name);
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
				value: `${thisView} (${api.inquiries.data.length})`,
			},
		];

		const finalData = [header, blankRows, dataHeaders];
		MyGlobal.SeparateObjectsIntoArrays(_records, rowHeaders.length).forEach((row) => finalData.push(row));

		writeXlsxFile(finalData, {
			columns: columnsWidth,
			fileName: `${thisView}.xlsx`,
			fontFamily: "Segoe UI",
			fontSize: 9,
		});
	}

	function doFiltering(type) {
		const filteredData = api.inquiries.mergedWithNotes.filter((f) => {
			if (type == "entryDate") {
				const checkDate = new Date(f.entry_date);
				const startDate = main.filter.from;
				const endDate = main.filter.to;

				if (checkDate >= startDate && checkDate <= endDate) {
					return f;
				}
			} else {
				const findText = main.findText.toLowerCase();

				return (
					String(f.client_id).toLowerCase().includes(findText) ||
					String(f.client_name).toLowerCase().includes(findText) ||
					String(f.phone_number).includes(findText) ||
					String(f.main_project).toLowerCase().includes(findText) ||
					String(f.sub_project).toLowerCase().includes(findText) ||
					String(f.reference_id).toLowerCase().includes(findText) ||
					String(f.reference_name).toLowerCase().includes(findText) ||
					String(f.follow_ups).toLowerCase().includes(findText) ||
					String(f.follow_ups_initials).toLowerCase().includes(findText) ||
					String(f.quote).includes(findText) ||
					String(f.status).toLowerCase().includes(findText) ||
					String(f.notes).toLowerCase().includes(findText) ||
					String(f.entry_by_name).toLowerCase().includes(findText)
				);
			}
		});

		setApi((s) => ({ ...s, inquiries: { ...s.inquiries, data: filteredData } }));
	}

	function doSorting() {
		return api.inquiries.data.sort((a, b) => {
			const { column, isAscending } = main.sort;

			if (column == headers.Client && isAscending) {
				return a.client_name.localeCompare(b.client_name);
			} else if (column == headers.Client && !isAscending) {
				return b.client_name.localeCompare(a.client_name);
			} else if (column == headers.Projects && isAscending) {
				return a.main_project.localeCompare(b.main_project);
			} else if (column == headers.Projects && !isAscending) {
				return b.main_project.localeCompare(a.main_project);
			} else if (column == headers.CreatedBy && isAscending) {
				return a.reference_name.localeCompare(b.reference_name);
			} else if (column == headers.CreatedBy && !isAscending) {
				return b.reference_name.localeCompare(a.reference_name);
			} else if (column == headers.FollowUps && isAscending) {
				return a.follow_ups.localeCompare(b.follow_ups);
			} else if (column == headers.FollowUps && !isAscending) {
				return b.follow_ups.localeCompare(a.follow_ups);
			} else if (column == headers.Quote && isAscending) {
				return a.quote - b.quote;
			} else if (column == headers.Quote && !isAscending) {
				return b.quote - a.quote;
			} else if (column == headers.Status && isAscending) {
				return a.status.localeCompare(b.status);
			} else if (column == headers.Status && !isAscending) {
				return b.status.localeCompare(a.status);
			} else {
				return b.id - a.id;
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
			return api.inquiries.data.length > 0 && <Badge value={getRowsCount()} />;
		}
	}

	async function getInquiries(supportData) {
		setMain((s) => ({ ...s, isLoading: true }));

		try {
			const response = await axios.get(MyConstants.ApiEndpoints.Inquiries.GetInquiries, MyGlobal.GetHeaders());

			if (response.status === 200) {
				let revised = [];
				const revisedCopy = [];

				response.data.forEach((fe) => {
					const clientName = MyGlobal.GetNameFromId(fe.client_id, supportData.clients);
					const referenceName = MyGlobal.GetNameFromId(fe.reference_id, supportData.references);
					const followUps = MyGlobal.GetAnyDataFromId(fe.follow_ups, "full_name");
					const entryBy = MyGlobal.GetAnyDataFromId(fe.entry_by_id, "full_name");

					let phoneNumber = fe.phone_number;

					const client = supportData.clients.find((f) => f.id == fe.client_id);

					if (typeof client === "object") {
						if (client.is_edited == 1) {
							phoneNumber = client.phone_number;
						}
					}

					const data = {
						...fe,
						client_id_and_name: `${fe.client_id} - ${clientName}`,
						client_name: clientName,
						entry_by_id_and_name: `${fe.entry_by_id} - ${entryBy}`,
						entry_date: dayjs(fe.entry_date).format("DD MMM, YYYY"),
						entry_by_name: entryBy,
						follow_ups: followUps,
						follow_ups_data: MyGlobal.GetFullDetailsFromIds(fe.follow_ups),
						follow_ups_initials: MyGlobal.GetInitials(followUps),
						main_project: MyGlobal.GetNameFromId(fe.main_project_id, supportData.mainProjects),
						notes: "",
						phone_number: phoneNumber,
						reference_id_and_name: `${fe.reference_id} - ${referenceName}`,
						reference_name: referenceName,
						sub_project: MyGlobal.GetNameFromId(fe.sub_project_id, supportData.subProjects),
					};

					revised.push(data);
					revisedCopy.push(data);
				});

				const status = String(presetStatus);

				if (status.length && Object.values(statuses).includes(status)) {
					const array = revised.filter((f) => f.status.includes(status));

					revised.length = 0;
					revised = array;
				}

				setApi((s) => ({ ...s, inquiries: { ...s.inquiries, copy: revisedCopy, data: revised, mergedWithNotes: mergeInquiriesAndNotesById(revisedCopy) } }));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Get Inquiries");
		} finally {
			setMain((s) => ({ ...s, isLoading: false }));
			setMounted((s) => ({ ...s, mainComponent: true }));
		}
	}

	function getRowsCount() {
		if (api.inquiries.data.length != api.inquiries.copy.length) {
			return `${api.inquiries.data.length} / ${api.inquiries.copy.length}`;
		} else {
			return api.inquiries.data.length;
		}
	}

	function getStatusSeverity(status) {
		switch (status) {
			case statuses.Open:
				return "orange-tag-transparent-01";
			case statuses.Closed:
				return "gray-tag-transparent-01";
			case statuses.Hold:
				return "red-tag-transparent-02";
			case statuses.Confirmed:
				return "green-tag-transparent-01 cursor-pointer";
		}
	}

	function getStatusSeverityBackground(status) {
		switch (status) {
			case statuses.Open:
				return {
					background: "orange-background-transparent-01",
					border: "orange-border",
					text: "orange-text",
				};
			case statuses.Closed:
				return {
					background: "gray-background-transparent-01",
					border: "gray-border",
					text: "gray-text",
				};
			case statuses.Hold:
				return {
					background: "red-background-transparent-01",
					border: "red-border",
					text: "red-text",
				};
			case statuses.Confirmed:
				return {
					background: "green-background-transparent-01",
					border: "green-border",
					text: "green-text",
				};
		}
	}

	function getStatusSeverityBackground2(status) {
		switch (status) {
			case statuses.Open:
				return "orange-background";
			case statuses.Closed:
				return "gray-background";
			case statuses.Hold:
				return "red-background";
			case statuses.Confirmed:
				return "green-background";
		}
	}

	function getTotalNotesByInquiry(id) {
		return api.notes.filter((f) => f.inquiry_id == id && f.source == thisView).length;
	}

	function getTotalQuote() {
		let total = 0;

		for (const i of api.inquiries.data) {
			total += Number(i.quote);
		}

		return MyGlobal.ThousandSeparator(total);
	}

	function highlightText(isTag, text) {
		const regex = new RegExp(main.findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
		const classByTag = isTag ? "highlight-characters" : "highlight-characters";

		let result = text;

		if (main.findText) {
			result = String(text).replace(regex, (match) => `<span class=${classByTag}>${match}</span>`);
		}

		return MyGlobal.StripHtmlTags(result);
	}

	function mergeInquiriesAndNotesById(inquiries) {
		const newArray = [];
		const mergedObject = {};
		const mergedArray = [];

		inquiries.forEach((fe) => {
			api.notes.forEach((_fe) => {
				if (fe.id == _fe.inquiry_id) {
					newArray.push({ id: _fe.inquiry_id, notes: _fe.content });
				}
			});
		});

		newArray.forEach((fe) => {
			if (!mergedObject[fe.id]) {
				mergedObject[fe.id] = { id: fe.id, notes: fe.notes };
			} else {
				mergedObject[fe.id].notes += `\n${fe.notes}`;
			}
		});

		inquiries.forEach((fe) => {
			Object.values(mergedObject).forEach((_fe) => {
				if (fe.id == _fe.id) {
					mergedArray.push({ ...fe, notes: _fe.notes });
				}
			});
		});

		const idsOfInquiries = inquiries.map((m) => m.id);
		const idsOfMergedArray = mergedArray.map((m) => m.id);
		const missingIds = idsOfInquiries.filter((f) => !idsOfMergedArray.includes(f));

		missingIds.forEach((fe) => {
			const missingObject = inquiries.find((f) => f.id == fe);
			mergedArray.push(missingObject);
		});

		return mergedArray;
	}

	function openEmailAddress(emailAddress) {
		globalThis.window.open(`mailto://${emailAddress}`, "_blank");
	}

	function openWhatsAppWeb(phoneNumber) {
		globalThis.window.open(`https://wa.me/1${phoneNumber}`, "_blank");
	}

	function prepareInquiryStatusChangeData(inquiry, newStatus) {
		setMain((s) => ({ ...s, selectedInquiryForStatusChange: { ...inquiry, new_status: newStatus } }));
	}

	function setInputs(key, value) {
		if (key == "from" || key == "to") {
			setMain((s) => ({ ...s, filter: { ...s.filter, [key]: value } }));
		} else {
			setMain((s) => ({ ...s, [key]: value }));
		}
	}

	function setSort(header) {
		if (header != headers.ContactInfo) {
			setMain((s) => ({ ...s, sort: { column: header, isAscending: !main.sort.isAscending } }));
		}
	}

	async function setSupportData() {
		try {
			const response = await axios.get(MyConstants.ApiEndpoints.Inquiries.GetSupportData, MyGlobal.GetHeaders());

			if (response.status === 200) {
				setApi((s) => ({
					...s,
					clients: response.data.clients,
					notes: response.data.notes,
				}));

				getInquiries(response.data);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Inquiries => Get Required Data");
		}
	}

	function toggleAddQuotation(inquiry, type) {
		const client = api.clients.find((f) => f.id === inquiry.client_id);
		const obj = { ...inquiry, client };

		setMain((s) => ({ ...s, selectedInquiryForNotes: obj }));
		setMounted((s) => ({ ...s, addQuotation: type }));
	}

	function toggleEditInquiryView(inquiry, type) {
		setMain((s) => ({ ...s, selectedInquiryForNotes: inquiry }));
		setMounted((s) => ({ ...s, editInquiry: type }));
	}

	function toggleNewInquiryView() {
		setMounted((s) => ({ ...s, newInquiry: !mounted.newInquiry }));
	}

	function toggleNotesView(inquiry, type) {
		setMain((s) => ({ ...s, selectedInquiryForNotes: inquiry }));
		setMounted((s) => ({ ...s, notes: type }));
	}

	function toggleUpdateStatus(value) {
		if (value === true) {
			setMounted((s) => ({ ...s, updateStatus: true }));
		} else if (value == "open-new-project") {
			setMounted((s) => ({ ...s, updateStatus: false, newProject: true }));
		} else {
			setMain((s) => ({ ...s, selectedInquiryForStatusChange: {} }));
			setMounted((s) => ({ ...s, updateStatus: false }));
		}
	}

	// UI Components
	function uiBody() {
		if (main.isLoading) {
			return (
				<div className={blankDataWrapper}>
					<span className="font-regular-12 gray-text">Loading Inquiries ...</span>
				</div>
			);
		} else if (!api.inquiries.copy.length) {
			return <div className={blankDataWrapper}>No inquiries generated.</div>;
		} else if (!api.inquiries.data.length) {
			return <div className={blankDataWrapper}>No inquiries found.</div>;
		} else {
			return (
				<div className="flex flex-col w-full h-full justify-center items-start full-border relative">
					<div className="flex w-full h-9 justify-center items-center primary-background">{uiHeaders()}</div>
					<Virtuoso className="w-full h-full overflow-y-auto contrast-background" data={doSorting()} itemContent={(i, row) => uiRows(row, i)} totalCount={api.inquiries.data.length} />
					<div className="absolute bottom-2.5 right-2.5 space-x-2.5 px-5 py-1 flex justify-between items-center rounded-tr-full rounded-br-full green-background-transparent-01 green-border">
						<span className="text-white flex justify-center items-center w-10 h-10 rounded-full green-background absolute -left-5">
							<FontAwesomeIcon icon={faIndianRupee} size="md" />
						</span>
						<span className="text-center green-text font-bold-12">{getTotalQuote()}</span>
					</div>
				</div>
			);
		}
	}

	function uiExport() {
		if (api.inquiries.data.length && api.inquiries.copy.length) {
			return (
				<button className="primary-button-transparent-background" onClick={() => doExcelExport()}>
					<FontAwesomeIcon className="primary-text" icon={faFileExcel} />
				</button>
			);
		}
	}

	function uiFind() {
		if (api.inquiries.copy.length) {
			return (
				<TextInputNative
					id="findBox"
					icon={faSearch}
					onChange={(e) => setInputs("findText", e.target.value)}
					onClearButtonClick={() => setInputs("findText", "")}
					placeholder="Find"
					showClearButton={showFindClearButton}
					tabIndex={3}
					value={main.findText}
					width="w-36"
				/>
			);
		}
	}

	function uiFromDate() {
		if (api.inquiries.copy.length) {
			return (
				<div className="flex w-36 h-[30px] px-2.5 space-x-1 justify-start items-center rounded bottom-shadow contrast-background">
					<FontAwesomeIcon className="primary-text" icon={faCalendar} size="sm" />
					<ReactDatePicker
						className="w-20 h-6 bg-transparent outline-none font-regular-10"
						dateFormat="dd-MM-YYYY"
						dropdownMode="select"
						endDate={main.filter.to}
						onChange={(e) => setInputs("from", e)}
						peekNextMonth
						placeholderText="From"
						tabIndex={1}
						selected={main.filter.from}
						selectsStart
						startDate={main.filter.from}
						showMonthDropdown
						showYearDropdown
					/>
					<FontAwesomeIcon className={showFromDateClearButton} onClick={() => setInputs("from", "")} icon={faMultiply} />
				</div>
			);
		}
	}

	function uiHeaders() {
		return Object.values(headers).map((m, i) => {
			const showSortArrow = m == main.sort.column ? "block" : "hidden";
			const showStatusFilter = m == headers.Status ? "block" : "hidden";

			return (
				<span className="flex w-[14.28%] cursor-pointer justify-center items-center font-medium-10" key={i}>
					<div className="flex w-full space-x-2 justify-center items-center text-white" onClick={() => setSort(m)}>
						<span>{m}</span>
						<span className={showSortArrow}>{uiSortArrows(m)}</span>
					</div>
					<span className={showStatusFilter}>{uiStatusFilter(m)}</span>
				</span>
			);
		});
	}

	function uiMain() {
		if (mounted.addQuotation) {
			return <NewQuotaion clients={api.clients} inquiry={main.selectedInquiryForNotes} reload={setSupportData} unmount={toggleAddQuotation} />;
		} else if (mounted.editInquiry) {
			return <EditInquiry inquiry={main.selectedInquiryForNotes} reload={setSupportData} unmount={toggleEditInquiryView} />;
		} else if (mounted.newInquiry) {
			return <NewInquiry reload={setSupportData} unmount={toggleNewInquiryView} />;
		} else if (mounted.newProject) {
			return <NewProject inquiry={main.selectedInquiryForStatusChange} reload={setSupportData} unmount={closeNewProjectView} />;
		} else if (mounted.notes) {
			return <Notes inquiry={main.selectedInquiryForNotes} reload={setSupportData} unmount={toggleNotesView} />;
		} else {
			return (
				<>
					<div className="flex w-full px-5 py-2.5 justify-between items-center">
						<div className="flex w-1/5 space-x-2 justify-start items-center">
							<span className="view-heading">{thisView}</span>
							{getIconOrBadge()}
						</div>
						<div className="flex w-4/5 space-x-2 justify-end items-center">
							<div className="flex w-1/2 space-x-2 justify-end items-center">
								{uiFromDate()}
								{uiToDate()}
							</div>
							{uiFind()}
							{uiNew()}
							{uiExport()}
						</div>
					</div>
					<div className="flex w-full h-full justify-center items-center">{uiBody()}</div>
				</>
			);
		}
	}

	function uiNew() {
		return (
			<button className={newInquiryButton} onClick={() => toggleNewInquiryView()}>
				<FontAwesomeIcon icon={faPlusCircle} />
				<span>New</span>
			</button>
		);
	}

	function uiNotes(row) {
		const totalNotes = getTotalNotesByInquiry(row.id);
		const wrapper = totalNotes > 0 ? "cursor-pointer primary-text" : "cursor-default black-text";

		return (
			<span className={wrapper} onClick={() => totalNotes && toggleNotesView(row, true)}>
				<BadgeSmallWithBackground style={getStatusSeverityBackground(row.status)} value={totalNotes} />
			</span>
		);
	}

	function uiRows(row, i) {
		const style = "flex flex-col w-[14.28%] justify-center items-center text-center";
		const childStyle = "flex w-full justify-center items-center";

		const clientNameTextStyle = row.status == statuses.Confirmed ? "cursor-not-allowed green-text" : "cursor-pointer primary-text";

		const showDownloadButton = row.quotation_id ? "cursor-pointer visible primary-text" : "invisible";

		const clientName = MyGlobal.HighlightText(row.client_name, main.findText);
		const phoneNumber = MyGlobal.HighlightText(row.phone_number, main.findText);
		const emailAddress = MyGlobal.HighlightText(row.email_address, main.findText);
		const mainProject = MyGlobal.HighlightText(row.main_project, main.findText);
		const subProject = MyGlobal.HighlightText(row.sub_project, main.findText);
		const referenceName = MyGlobal.HighlightText(row.reference_name, main.findText);
		const quote = MyGlobal.HighlightText(row.quote, main.findText);
		const entryBy = MyGlobal.HighlightText(row.entry_by_name, main.findText);

		return (
			<div className="flex w-full py-3 justify-center items-center contrast-background bottom-border font-regular-10 black-text relative" key={i}>
				<div className={`absolute w-3 h-[50px] rounded-tr-full rounded-br-full ${getStatusSeverityBackground2(row.status)} -left-1`} />
				<div className={`${style} font-semibold-12 space-x-2 ${clientNameTextStyle}`}>
					<Tippy content={<Tooltip text={row.client_id_and_name} />} placement="bottom">
						<span className={`${childStyle} ${getStatusSeverityBackground(row.status).text}`} dangerouslySetInnerHTML={{ __html: clientName }} onClick={() => toggleEditInquiryView(row, true)} />
					</Tippy>
					<span className="flex w-full justify-center items-center font-regular-10 gray-text">{row.entry_date}</span>
				</div>

				<div className={`${style} cursor-pointer primary-text`}>
					<Tippy content={<Tooltip text="Open this contact on WhatsApp Web." />} placement="bottom">
						<span className={`${childStyle} font-bold-10`} dangerouslySetInnerHTML={{ __html: phoneNumber }} onClick={() => openWhatsAppWeb(row.phone_number)} />
					</Tippy>
					<Tippy content={<Tooltip text="Send email to this address." />} placement="bottom">
						<span className={`${childStyle} font-regular-10 gray-text`} dangerouslySetInnerHTML={{ __html: emailAddress }} onClick={() => openEmailAddress(row.email_address)} />
					</Tippy>
				</div>

				<div className={style}>
					<span className={`${childStyle} font-bold-12`} dangerouslySetInnerHTML={{ __html: mainProject }} />
					<span className={`${childStyle} !italic gray-text`} dangerouslySetInnerHTML={{ __html: subProject }} />
				</div>

				<span className={`${style} !flex-row space-x-1`}>
					<AvatarCircle names={String(row.follow_ups).split(",")} />
				</span>

				<div className={`${style} !flex-row space-x-2 font-bold-12`}>
					<span className="flex w-4/5 justify-end items-center" dangerouslySetInnerHTML={{ __html: MyGlobal.FormatCurrency(quote) }} />
					<div className={`${childStyle} !w-3/5 !justify-start space-x-2.5`}>
						{isAdministrator && (
							<Tippy animation="shift-away" content={<Tooltip text="Add a quotation for this inquiry." />} placement="bottom">
								<FontAwesomeIcon className="cursor-pointer green-text" icon={faReceipt} onClick={() => toggleAddQuotation(row, true)} size="xs" />
							</Tippy>
						)}
						{isAdministrator && (
							<Tippy animation="shift-away" content={<Tooltip text="Download this quotation." />} placement="bottom">
								<FontAwesomeIcon
									className={showDownloadButton}
									icon={faFileDownload}
									onClick={() => {
										const link = document.createElement("a");
										const fileName = String(row.quotation_id).replace("/", "_").replace("/", "_");

										link.href = `/quotations/${fileName}.pdf`;
										link.download = `${fileName}.pdf`;

										link.click();
									}}
									size="xs"
								/>
							</Tippy>
						)}
					</div>
				</div>

				<div className={`${style} !flex-row space-x-2`}>
					<span className={`${childStyle} !w-fit`}>{uiStatusMenu(row)}</span>
					<span className={`${childStyle} !w-fit`}>{uiNotes(row)}</span>
				</div>

				<div className={`${style} cursor-help`}>
					<Tippy content={<Tooltip text={row.reference_id_and_name} />} placement="bottom">
						<span className={`${childStyle} font-bold-12`} dangerouslySetInnerHTML={{ __html: referenceName }} />
					</Tippy>
					<Tippy content={<Tooltip text={`Inquiry created by ${row.entry_by_name}`} />} placement="bottom">
						<span className={`${childStyle} !italic gray-text`} dangerouslySetInnerHTML={{ __html: entryBy }} />
					</Tippy>
				</div>
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

	function uiStatusFilter() {
		return (
			<Menu as="div" className="w-fit relative text-left">
				<MenuButton className="flex w-full justify-between items-center focus:outline-none relative z-40">
					<FontAwesomeIcon className="text-white" icon={faFilter} size="sm" />
				</MenuButton>
				<MenuItems className="absolute w-fit right-0 origin-top-right rounded contrast-background shadow-md focus:outline-none z-50">{uiStatusFilterMenu()}</MenuItems>
			</Menu>
		);
	}

	function uiStatusFilterMenu() {
		const uniqueStatus = [];

		api.inquiries.copy.forEach((fe) => {
			if (!uniqueStatus.includes(fe.status)) {
				uniqueStatus.push(fe.status);
			}
		});

		return uniqueStatus.map((m, i) => {
			return (
				<MenuItem as="div" className="w-full p-2 space-x-2.5 cursor-pointer border-y font-regular-10 black-text hovered-rows" key={i} onClick={() => setMain((s) => ({ ...s, findText: m }))}>
					<span>{m}</span>
				</MenuItem>
			);
		});
	}

	function uiStatusMenu(row) {
		const isConfirmed = row.status == statuses.Confirmed;

		const wrapper = `flex w-full space-x-2.5 justify-between items-center focus:outline-none relative z-40 font-medium-12 ${getStatusSeverity(row.status)}`;

		const icon = !isConfirmed && <FontAwesomeIcon icon={faChevronDown} size="xs" />;

		return (
			<Tippy content={<Tooltip text={row.closure_reason} />} disabled={row.is_closed == 0 && !row.closure_reason} placement="bottom">
				<Menu as="div" className="flex w-full justify-center items-center relative">
					<MenuButton className={wrapper}>
						<span dangerouslySetInnerHTML={{ __html: highlightText(true, row.status) }} />
						{icon}
					</MenuButton>
					{!isConfirmed && <MenuItems className="absolute w-full top-7 right-0 origin-top-right rounded contrast-background bottom-shadow focus:outline-none z-50 full-border">{uiStatusMenuList(row)}</MenuItems>}
				</Menu>
			</Tippy>
		);
	}

	function uiStatusMenuList(row) {
		return Object.values(statuses)
			.filter((f) => f != row.status)
			.filter((f) => {
				if (f == statuses.Confirmed && !allowConvertingToProject) {
					return f != statuses.Confirmed;
				}

				return f;
			})
			.map((m, i) => {
				const label = m == statuses.Closed ? "Close" : m == statuses.Confirmed ? "Confirm" : m;

				return (
					<MenuItem as="div" className="p-2 space-x-2.5 cursor-pointer border-y font-regular-10 black-text text-left hovered-rows" key={i} onClick={() => prepareInquiryStatusChangeData(row, m)}>
						<span>{label}</span>
					</MenuItem>
				);
			});
	}

	function uiToDate() {
		if (api.inquiries.copy.length) {
			return (
				<div className="flex w-36 h-[30px] px-2.5 space-x-1 justify-center items-center rounded bottom-shadow contrast-background">
					<FontAwesomeIcon className="primary-text" icon={faCalendar} size="sm" />
					<ReactDatePicker
						className="w-20 h-6 bg-transparent outline-none font-regular-10"
						dateFormat="dd-MM-YYYY"
						dropdownMode="select"
						endDate={main.filter.to}
						onChange={(e) => setInputs("to", e)}
						placeholderText="To"
						peekNextMonth
						selected={main.filter.to}
						selectsEnd
						startDate={main.filter.to}
						showMonthDropdown
						showYearDropdown
						tabIndex={2}
					/>
					<FontAwesomeIcon className={showToDateClearButton} onClick={() => setInputs("to", "")} icon={faMultiply} />
				</div>
			);
		}
	}

	// Hooks
	useEffect(() => {
		setSupportData();
		globalThis.addEventListener("keydown", detectKeystrokes);

		return () => {
			setModuleProps(thisView, "");
			globalThis.removeEventListener("keydown", detectKeystrokes);
		};
	}, []);

	useEffect(() => {
		doFiltering("");
	}, [main.findText]);

	useEffect(() => {
		if (main.filter.from && main.filter.to) {
			doFiltering("entryDate");
		} else {
			doFiltering("");
		}
	}, [main.filter]);

	useEffect(() => {
		if (mounted.mainComponent) {
			if (Object.keys(main.selectedInquiryForStatusChange).length) {
				toggleUpdateStatus(true);
			}
		}
	}, [main.selectedInquiryForStatusChange]);

	return mounted.myInquiries ? (
		<MyInquiries presetStatus={presetStatus} setModuleProps={setModuleProps} unmount={closeMyInquiries} />
	) : (
		<div className="flex flex-col w-full h-full justify-start items-center primary-light-background">
			{uiMain()}

			{mounted.updateStatus && <UpdateStatus inquiry={main.selectedInquiryForStatusChange} mount={mounted.updateStatus} reload={setSupportData} unmount={toggleUpdateStatus} />}
		</div>
	);
}
