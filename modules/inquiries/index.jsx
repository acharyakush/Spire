"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import "tippy.js/animations/shift-toward.css";
import "react-datepicker/dist/react-datepicker.css";

import axios from "axios";
import dayjs from "dayjs";
import Tippy from "@tippyjs/react";
import dynamic from "next/dynamic";
import writeXlsxFile from "write-excel-file";
import ReactDatePicker from "react-datepicker";
import MyConstants from "@/utilities/constants";

import { Virtuoso } from "react-virtuoso";
import { TextInputNative } from "@/components/Inputs";
import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { getScrollPosition, MyGlobal, saveScrollPosition } from "@/utilities/global";
import { AvatarCircle, Badge, BadgeSmall, BadgeSmallWithBackground, Tooltip } from "@/components/Elements";
import { faBolt, faCalendar, faChevronDown, faDownload, faFilterCircleXmark, faIndianRupee, faMultiply, faPen, faPlus, faSearch, faSortAmountAsc, faSortAmountDesc } from "@fortawesome/free-solid-svg-icons";

const DynamicNotes = dynamic(() => import("./Notes"), { ssr: false });
const DynamicNewInquiry = dynamic(() => import("./NewInquiry"), { ssr: false });
const DynamicEditInquiry = dynamic(() => import("./EditInquiry"), { ssr: false });
const DynamicMyInquiries = dynamic(() => import("./MyInquiries"), { ssr: false });
const DynamicNewQuotation = dynamic(() => import("./NewQuotation"), { ssr: false });
const DynamicEditQuotation = dynamic(() => import("./EditQuotation"), { ssr: false });
const DynamicNewProject = dynamic(() => import("../projects/NewProject"), { ssr: false });
const DynamicUpdateStatus = dynamic(() => import("@/modals/inquiries/miscellaneous").then((t) => ({ default: t.UpdateStatus })), { ssr: false });

export default function Inquiries({ presetStatus, setModuleProps }) {
	// Business Logic
	const currentScrollPositionReference = useRef(null);

	const [api, setApi] = useState({ clients: [], notes: [] });

	const [filter, setFilter] = useState({
		from: "",
		to: "",
		search: presetStatus ?? "",
		status: "",
	});

	const [inquiries, setInquiries] = useState({ copy: [], data: [], merged: [] });

	const [main, setMain] = useState({
		isLoading: false,
		isStatus: false,
		revisedStatuses: {},
		selectedInquiryForNotes: {},
		selectedInquiryForStatusChange: {},
		sort: { column: "", isAscending: false },
	});

	const [mounted, setMounted] = useState({
		addQuotation: false,
		convertToProject: false,
		editInquiry: false,
		editQuotation: false,
		mainComponent: false,
		myInquiries: presetStatus === "my-inquiries" || String(presetStatus).startsWith("MySpace"),
		newInquiry: false,
		newProject: false,
		notes: false,
		updateStatus: false,
	});

	const allowQuotation = useMemo(() => MyGlobal.HasPermission(MyConstants.Modules.Derived.Quotation), []);
	const allowConvertingToProject = useMemo(() => MyGlobal.HasPermission(MyConstants.Modules.Derived.NewProject), []);
	const allowNewInquiry = useMemo(() => MyGlobal.HasPermission(MyConstants.Modules.Derived.NewInquiry), []);

	const statuses = useMemo(() => MyConstants.Statuses.Inquiries, []);
	const headers = useMemo(() => MyConstants.TableHeaders.Inquiries, []);

	const inquiriesSize = useMemo(() => inquiries.data.length, [inquiries.data]);
	const inquiriesCopySize = useMemo(() => inquiries.copy.length, [inquiries.copy]);

	const thisView = useMemo(() => MyConstants.Modules.Base.Inquiries, []);
	const isAdministrator = useMemo(() => MyGlobal.IsUserAdministrator(), []);

	const showFromDateClearButton = useMemo(() => (filter.from ? "cursor-pointer primary-text" : "hidden"), [filter.from]);
	const showToDateClearButton = useMemo(() => (filter.to ? "cursor-pointer primary-text" : "hidden"), [filter.to]);
	const showFindClearButton = useMemo(() => (filter.search ? "cursor-pointer primary-text" : "hidden"), [filter.search]);

	const blankDataWrapper = "flex w-full h-full justify-center items-center font-regular-12 gray-text contrast-background full-border";

	// Functions
	function calculateStatusCounts(list = []) {
		const counts = {
			[statuses.Closed]: 0,
			[statuses.Confirmed]: 0,
			[statuses.Hold]: 0,
			[statuses.Open]: 0,
		};

		list.forEach((fe) => {
			if (fe.status === statuses.Closed) counts.Closed++;
			if (fe.status === statuses.Confirmed) counts.Confirmed++;
			if (fe.status === statuses.Hold) counts.Hold++;
			if (fe.status === statuses.Open) counts.Open++;
		});

		return counts;
	}

	function closeMyInquiries() {
		setFilter((s) => ({ ...s, search: "" }));
		setMounted((s) => ({ ...s, myInquiries: false }));
	}

	function closeNewProjectView() {
		setMounted((s) => ({ ...s, newProject: false }));
	}

	function detectKeystrokes(event) {
		switch (true) {
			case event.ctrlKey && event.key === "f":
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
				fe.client_name + "\n" + fe.entry_date,
				fe.phone_number + "\n" + fe.email_address,
				fe.sub_project + "\n" + fe.main_project,
				fe.follow_ups,
				MyGlobal.FormatCurrency(fe.quote),
				fe.next_follow_up_on,
				fe.status + " (" + getTotalNotesByInquiry(fe.id) + ")",
				fe.reference_name + "\n" + fe.entry_by_name,
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
				value: thisView + " (" + inquiriesSize + ")",
			},
		];

		const finalData = [header, blankRows, dataHeaders];
		MyGlobal.SeparateObjectsIntoArrays(_records, rowHeaders.length).forEach((fe) => finalData.push(fe));

		writeXlsxFile(finalData, {
			columns: columnsWidth,
			fileName: thisView + ".xlsx",
			fontFamily: "Segoe UI",
			fontSize: 10,
		});
	}

	function doFiltering(data = []) {
		const { from, to, search, status } = filter;

		const isSearchFilterActive = Boolean(search);
		const isDateFilterActive = Boolean(from && to);

		const lowerText = String(search).toLowerCase() || "";
		const startDate = isDateFilterActive ? new Date(from).getTime() : null;
		const endDate = isDateFilterActive ? new Date(to).getTime() : null;

		const searchableFields = ["client_id", "client_name", "phone_number", "main_project", "sub_project", "reference_id", "reference_name", "follow_ups", "follow_ups_initials", "quote", "status", "notes", "entry_by_name"];

		return data.filter((f) => {
			if (isDateFilterActive) {
				const entryTime = new Date(f.entry_date).getTime();
				if (isNaN(entryTime) || entryTime < startDate || entryTime > endDate) return false;
			}

			if (!isSearchFilterActive && main.isStatus && status) {
				if (f.status !== status) return false;
			}

			if (isSearchFilterActive) {
				const match = searchableFields.some((s) => {
					const value = f[s];
					return value && String(value).toLowerCase().includes(lowerText);
				});

				if (!match) return false;
				if (main.isStatus && status && f.status !== status) return false;
			}

			return true;
		});
	}

	function doSorting() {
		const { column, isAscending } = main.sort;

		if (!column) return [...inquiries.data].sort((a, b) => b.id - a.id);

		const sortFunctions = {
			[headers.Client]: (a, b) => (isAscending ? a.client_name.localeCompare(b.client_name) : b.client_name.localeCompare(a.client_name)),
			[headers.Projects]: (a, b) => (isAscending ? a.main_project.localeCompare(b.main_project) : b.main_project.localeCompare(a.main_project)),
			[headers.References]: (a, b) => (isAscending ? a.reference_name.localeCompare(b.reference_name) : b.reference_name.localeCompare(a.reference_name)),
			[headers.FollowUps]: (a, b) => (isAscending ? a.follow_ups.localeCompare(b.follow_ups) : b.follow_ups.localeCompare(a.follow_ups)),
			[headers.Quote]: (a, b) => (isAscending ? a.quote - b.quote : b.quote - a.quote),
			[headers.Status]: (a, b) => (isAscending ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status)),
			default: (a, b) => b.id - a.id,
		};

		const sortFunction = sortFunctions[column] || sortFunctions.default;

		return [...inquiries.data].sort(sortFunction);
	}

	function downloadQuotation(quotationId) {
		const link = document.createElement("a");
		const fileName = String(quotationId).replace("/", "_").replace("/", "_");

		link.href = "/quotations/" + fileName;
		link.download = fileName + ".pdf";

		link.click();
	}

	function getIconOrBadge() {
		return inquiriesSize > 0 && <Badge value={getRowsCount()} />;
	}

	async function getInquiries(supportData) {
		try {
			setMain((s) => ({ ...s, isLoading: true }));

			const response = await axios.get(MyConstants.ApiEndpoints.Inquiries.GetInquiries, MyGlobal.GetHeaders());

			if (response.status === 200) {
				let revised = [];
				const revisedCopy = [];

				for (let i = 0; i < response.data.length; i++) {
					const obj = response.data[i];

					const clientName = MyGlobal.GetNameFromId(obj.client_id, supportData.clients);
					const referenceName = MyGlobal.GetNameFromId(obj.reference_id, supportData.references);
					const followUps = MyGlobal.GetAnyDataFromId(obj.follow_ups, "full_name");
					const entryBy = MyGlobal.GetAnyDataFromId(obj.entry_by_id, "full_name");

					let phoneNumber = obj.phone_number;

					const client = supportData.clients.find((f) => f.id === obj.client_id);

					if (typeof client === "object") {
						if (client.is_edited == 1) {
							phoneNumber = client.phone_number;
						}
					}

					const nextfollowUpOn = supportData?.notes?.filter((f) => f.inquiry_id === obj.id);

					const abc = nextfollowUpOn?.filter((f) => f.next_follow_up_on);
					abc?.sort((a, b) => b.id - a.id);

					const data = {
						...obj,
						client_id_and_name: `${obj.client_id} - ${clientName}`,
						client_name: clientName,
						entry_by_id_and_name: `${obj.entry_by_id} - ${entryBy}`,
						entry_date: dayjs(obj.entry_date).format("DD MMM, YYYY"),
						entry_by_name: entryBy,
						follow_ups: followUps,
						follow_ups_data: MyGlobal.GetFullDetailsFromIds(obj.follow_ups),
						follow_ups_initials: MyGlobal.GetInitials(followUps),
						main_project: MyGlobal.GetNameFromId(obj.main_project_id, supportData.mainProjects),
						next_follow_up_on: abc?.length ? dayjs(abc?.[0]?.next_follow_up_on).format("DD MMM, YYYY") : "",
						notes: "",
						phone_number: phoneNumber,
						reference_id_and_name: `${obj.reference_id} - ${referenceName}`,
						reference_name: referenceName,
						sub_project: MyGlobal.GetNameFromId(obj.sub_project_id, supportData.subProjects),
					};

					revised.push(data);
					revisedCopy.push(data);
				}

				const status = String(presetStatus);

				if (status.length && Object.values(statuses).includes(status)) {
					const array = revised.filter((f) => f.status.includes(status));

					revised.length = 0;
					revised = array;
				}

				const merged = mergeInquiriesAndNotesById(revisedCopy);
				const revisedStatuses = calculateStatusCounts(revisedCopy);
				const filtered = doFiltering(merged);

				setInquiries({ copy: revisedCopy, data: filtered, merged });
				setMain((s) => ({ ...s, revisedStatuses }));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, thisView + "> getInquiries()");
		} finally {
			setMain((s) => ({ ...s, isLoading: false }));
			setMounted((s) => ({ ...s, mainComponent: true }));
		}
	}

	function getRowsCount() {
		if (inquiriesSize !== inquiriesCopySize) {
			return inquiriesSize + " / " + inquiriesCopySize;
		}

		return inquiriesSize;
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
					background: "orange-background",
					border: "orange-border",
					text: "text-white",
				};
			case statuses.Closed:
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
			case statuses.Confirmed:
				return {
					background: "green-background",
					border: "green-border",
					text: "text-white",
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

	function getStatusSeverityBackground3(status) {
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

	async function getSupportData() {
		try {
			const response = await axios.get(MyConstants.ApiEndpoints.Inquiries.GetSupportData, MyGlobal.GetHeaders());

			if (response.status === 200) {
				setApi((s) => ({ ...s, clients: response.data.clients, notes: response.data.notes }));
				getInquiries(response.data);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Inquiries => Get Required Data");
		}
	}

	function getTotalNotesByInquiry(id) {
		return api.notes.filter((f) => f.inquiry_id === id && f.source === thisView).length;
	}

	function getTotalQuote() {
		let total = 0;
		let fullTotal = 0;

		for (const i of inquiries.data) {
			total += Number(i.quote);
		}

		for (const i of inquiries.copy) {
			fullTotal += Number(i.quote);
		}

		if (filter.from || filter.to || filter.search || filter.status) {
			return MyGlobal.ThousandSeparator(total) + " / " + MyGlobal.ThousandSeparator(fullTotal);
		}

		return MyGlobal.ThousandSeparator(fullTotal);
	}

	function handleRangeChange(range) {
		saveScrollPosition("inquiries", range.startIndex);
	}

	function highlightText(isTag, text) {
		const regex = new RegExp(String(filter.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
		const classByTag = isTag ? "highlight-characters" : "highlight-characters";

		let result = text;

		if (filter.search) {
			result = String(text).replace(regex, (m) => `<span class=${classByTag}>${m}</span>`);
		}

		return MyGlobal.StripHtmlTags(result);
	}

	function mergeInquiriesAndNotesById(inquiries) {
		if (!inquiries.length || !api.notes.length) return inquiries;

		const notesMap = {};

		api.notes.forEach((fe) => {
			if (!notesMap[fe.inquiry_id]) {
				notesMap[fe.inquiry_id] = fe.content;
			} else {
				notesMap[fe.inquiry_id] += `\n${fe.content}`;
			}
		});

		return inquiries.map((m) => {
			return { ...m, notes: notesMap[m.id] || "" };
		});
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
		if (key === "from" || key === "to" || key === "search") {
			setFilter((s) => ({ ...s, [key]: value }));
		} else {
			setMain((s) => ({ ...s, [key]: value }));
		}
	}

	function setSort(header) {
		if (header !== headers.Contacts) {
			setMain((s) => ({ ...s, sort: { column: header, isAscending: !s.sort.isAscending } }));
		}
	}

	function toggleAddQuotation(inquiry, type) {
		const client = api.clients.find((f) => f.id === inquiry.client_id);
		const obj = { ...inquiry, client };

		setMain((s) => ({ ...s, selectedInquiryForNotes: obj }));
		setMounted((s) => ({ ...s, addQuotation: type }));
	}

	function toggleEditQuotation(inquiry, type) {
		const client = api.clients.find((f) => f.id === inquiry.client_id);
		const obj = { ...inquiry, client };

		setMain((s) => ({ ...s, selectedInquiryForNotes: obj }));
		setMounted((s) => ({ ...s, editQuotation: type }));
	}

	function toggleEditInquiryView(inquiry, type) {
		setMain((s) => ({ ...s, selectedInquiryForNotes: inquiry }));
		setMounted((s) => ({ ...s, editInquiry: type }));
	}

	function toggleNewInquiryView() {
		setMounted((s) => ({ ...s, newInquiry: !s.newInquiry }));
	}

	function toggleNotesView(inquiry, type) {
		setMain((s) => ({ ...s, selectedInquiryForNotes: inquiry }));
		setMounted((s) => ({ ...s, notes: type }));
	}

	function toggleUpdateStatus(value) {
		if (value === true) {
			setMounted((s) => ({ ...s, updateStatus: true }));
		} else if (value === "open-new-project") {
			setMounted((s) => ({ ...s, updateStatus: false, newProject: true }));
		} else {
			setMain((s) => ({ ...s, selectedInquiryForStatusChange: {} }));
			setMounted((s) => ({ ...s, updateStatus: false }));
		}
	}

	// UI Components
	function uiBody() {
		if (mounted.mainComponent && main.isLoading) {
			return (
				<div className="flex flex-col w-full h-full justify-center items-start full-border relative">
					<div className="flex w-full h-9 justify-center items-center primary-background animate-pulse">
						{Object.values(headers).map((_, i) => (
							<div
								key={i}
								className="flex w-[12.50%] justify-center items-center">
								<div className="h-4 w-20 bg-gray-200 rounded" />
							</div>
						))}
					</div>
					<div className="w-full h-full overflow-y-auto contrast-background">{[...Array(9)].map((_, i) => uiSkeletion(i))}</div>
				</div>
			);
		} else if (mounted.mainComponent && !inquiriesCopySize) {
			return <div className={blankDataWrapper}>No inquiries generated.</div>;
		} else if (mounted.mainComponent && !inquiriesSize) {
			return <div className={blankDataWrapper}>No inquiries found.</div>;
		} else {
			const itemStyle = "flex w-full p-2 space-x-2 justify-start items-center rounded cursor-pointer hover:transition-all font-regular-11 text-white";

			return (
				<div className="flex flex-col w-full h-full justify-center items-start full-border relative">
					<div className="flex w-full h-9 justify-center items-center primary-background">{uiHeaders()}</div>
					<Virtuoso
						ref={currentScrollPositionReference}
						rangeChanged={handleRangeChange}
						className="w-full h-full overflow-y-auto contrast-background"
						data={inquiries.data}
						itemContent={(_, row) => uiRows(row)}
						totalCount={inquiriesSize}
						overscan={20}
						components={{
							Footer: () => (
								<div className="flex fixed bottom-3 right-3 space-x-3 z-50">
									<Tippy
										className="!py-2"
										content={
											<div className="flex flex-col space-y-1 justify-center items-center">
												{allowNewInquiry && (
													<div
														className={`${itemStyle} hover:bg-blue-500`}
														onClick={() => toggleNewInquiryView()}>
														<FontAwesomeIcon
															className="w-5"
															icon={faPlus}
															size="1x"
														/>
														<span>New Inquiry</span>
													</div>
												)}
												<div
													className={`${itemStyle} hover:bg-emerald-500`}
													onClick={() => doExcelExport()}>
													<FontAwesomeIcon
														className="w-5"
														icon={faDownload}
														size="1x"
													/>
													<span>Download Excel</span>
												</div>
											</div>
										}
										interactive
										placement="bottom"
										theme="dark"
										trigger="mouseenter"
										animation="shift-toward"
										appendTo={() => document.body}>
										<div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-amber-100 via-amber-200 to-amber-300 border border-amber-600 shadow transition-all duration-300 transform hover-pulse-glow cursor-help">
											<FontAwesomeIcon
												icon={faBolt}
												className="text-amber-500"
												size="lg"
											/>
										</div>
									</Tippy>
									<div className="group relative flex items-center w-fit px-0 transition-all duration-500 ease-in-out">
										<div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400 border border-emerald-700 shadow-md z-0" />

										<div className="flex items-center justify-center w-10 h-10 group-hover:h-[36px] rounded-full text-white ring-1 ring-emerald-700 group-hover:ring-0 transition-all duration-500 ease-in-out relative z-20 shrink-0">
											<FontAwesomeIcon
												icon={faIndianRupee}
												size="lg"
											/>
										</div>

										<div className="transition-all duration-500 ease-in-out max-w-0 overflow-hidden group-hover:max-w-[300px]">
											<div className="pl-2 pr-4 text-white font-bold-12 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out relative z-20">{getTotalQuote()}</div>
										</div>
									</div>
								</div>
							),
						}}
					/>
				</div>
			);
		}
	}

	function uiClearFilter() {
		const visibility = filter.status ? "visible" : "invisible";
		const style = "cursor-pointer outline-none focus:outline-none red-text " + visibility;

		return (
			<FontAwesomeIcon
				className={style}
				icon={faFilterCircleXmark}
				onClick={() => {
					setFilter((s) => ({ ...s, status: "" }));
					setMain((s) => ({ ...s, isStatus: false }));
				}}
			/>
		);
	}

	function uiClientAndInquiryDate(childStyle, row, style) {
		const clientName = MyGlobal.HighlightText(row.client_name, filter.search);
		const clientNameTextStyle = row.status === statuses.Confirmed ? "cursor-not-allowed green-text" : "cursor-pointer primary-text";

		const wrapper = style + " font-semibold-12 space-x-2 " + clientNameTextStyle;
		const clientNameStyle = childStyle + " !w-3/4 " + getStatusSeverityBackground3(row.status).text;

		return (
			<div
				className={wrapper}
				style={{ overflowWrap: "anywhere" }}>
				<Tippy
					content={<Tooltip text={row.client_id_and_name} />}
					placement="bottom">
					<span
						className={clientNameStyle}
						dangerouslySetInnerHTML={{ __html: clientName }}
						onClick={() => toggleEditInquiryView(row, true)}
					/>
				</Tippy>
				<span className="flex w-full justify-center items-center font-regular-10 gray-text">{row.entry_date}</span>
			</div>
		);
	}

	function uiContactDetails(childStyle, row, style) {
		const phoneNumber = MyGlobal.HighlightText(row.phone_number, filter.search);
		const emailAddress = MyGlobal.HighlightText(row.email_address, filter.search);

		const phoneNumberStyle = childStyle + " font-bold-12";
		const emailAddressStyle = childStyle + " font-regular-10 gray-text";
		const wrapper = style + " cursor-pointer primary-text";

		return (
			<div className={wrapper}>
				<Tippy
					content={<Tooltip text="Open this contact on WhatsApp Web." />}
					placement="bottom">
					<span
						className={phoneNumberStyle}
						dangerouslySetInnerHTML={{ __html: phoneNumber }}
						onClick={() => openWhatsAppWeb(row.phone_number)}
					/>
				</Tippy>
				<Tippy
					content={<Tooltip text="Send email to this address." />}
					placement="bottom">
					<span
						className={emailAddressStyle}
						dangerouslySetInnerHTML={{ __html: emailAddress }}
						onClick={() => openEmailAddress(row.email_address)}
					/>
				</Tippy>
			</div>
		);
	}

	function uiFilter() {
		return (
			<Menu
				as="div"
				className="flex w-40 h-[30px] justify-center items-center relative rounded shadow contrast-background full-border">
				<MenuButton className="flex w-full h-[30px] px-2 justify-between items-center font-regular-10 gray-text">
					<span>{filter.status || "Status"}</span>
					<FontAwesomeIcon icon={faChevronDown} />
				</MenuButton>
				<MenuItems className="absolute w-full top-8 right-0 origin-top-right rounded z-50 contrast-background bottom-shadow full-border">{uiFilterMenuList()}</MenuItems>
			</Menu>
		);
	}

	function uiFilterMenuList() {
		return Object.entries(main.revisedStatuses).map(([key, value], i) => {
			const isSelected = key === filter.status;
			const aesthetics = isSelected ? "primary-background-transparent-01 primary-text" : "contrast-background black-text";
			const wrapper = `flex w-full p-2 space-x-2.5 justify-between items-center cursor-pointer border-y ${aesthetics} hovered-rows`;

			return (
				<MenuItem
					as="div"
					className={wrapper}
					key={i}
					onClick={() => {
						setFilter((s) => ({ ...s, status: key }));
						setMain((s) => ({ ...s, isStatus: true }));
					}}>
					<span className="flex w-full justify-between items-center font-regular-11">
						<span>{key}</span>
						{value > 0 && <BadgeSmall value={value} />}
					</span>
				</MenuItem>
			);
		});
	}

	function uiFind() {
		if (inquiriesCopySize) {
			return (
				<TextInputNative
					id="findBox"
					icon={faSearch}
					onChange={(e) => setInputs("findText", e.target.value)}
					onClearButtonClick={() => setInputs("findText", "")}
					placeholder="Find"
					showClearButton={showFindClearButton}
					tabIndex={3}
					value={filter.search}
					width="w-36"
				/>
			);
		}
	}

	function uiFromDate() {
		if (inquiriesCopySize) {
			return (
				<div className="flex w-36 h-[30px] px-2.5 space-x-1 justify-start items-center rounded bottom-shadow contrast-background">
					<FontAwesomeIcon
						className="primary-text"
						icon={faCalendar}
						size="sm"
					/>
					<ReactDatePicker
						className="w-20 h-6 bg-transparent outline-none font-regular-10"
						dateFormat="dd-MM-YYYY"
						dropdownMode="select"
						endDate={filter.to}
						onChange={(e) => setInputs("from", e)}
						peekNextMonth
						placeholderText="From"
						tabIndex={1}
						selected={filter.from}
						selectsStart
						startDate={filter.from}
						showMonthDropdown
						showYearDropdown
					/>
					<FontAwesomeIcon
						className={showFromDateClearButton}
						onClick={() => setInputs("from", "")}
						icon={faMultiply}
					/>
				</div>
			);
		}
	}

	function uiHeaders() {
		return Object.values(headers).map((m, i) => {
			const showSortArrow = m == main.sort.column ? "block" : "hidden";
			return (
				<span
					className="flex w-[12.50%] cursor-pointer justify-center items-center font-medium-10"
					key={i}>
					<div
						className="flex w-full space-x-2 justify-center items-center text-white"
						onClick={() => setSort(m)}>
						<span>{m}</span>
						<span className={showSortArrow}>{uiSortArrows(m)}</span>
					</div>
				</span>
			);
		});
	}

	function uiMain() {
		if (mounted.addQuotation) {
			return (
				<DynamicNewQuotation
					clients={api.clients}
					inquiry={main.selectedInquiryForNotes}
					reload={getSupportData}
					unmount={toggleAddQuotation}
				/>
			);
		} else if (mounted.editQuotation) {
			return (
				<DynamicEditQuotation
					clients={api.clients}
					inquiry={main.selectedInquiryForNotes}
					reload={getSupportData}
					unmount={toggleEditQuotation}
				/>
			);
		} else if (mounted.editInquiry) {
			return (
				<DynamicEditInquiry
					inquiry={main.selectedInquiryForNotes}
					reload={getSupportData}
					unmount={toggleEditInquiryView}
				/>
			);
		} else if (mounted.newInquiry) {
			return (
				<DynamicNewInquiry
					reload={getSupportData}
					unmount={toggleNewInquiryView}
				/>
			);
		} else if (mounted.newProject) {
			return (
				<DynamicNewProject
					inquiry={main.selectedInquiryForStatusChange}
					reload={getSupportData}
					unmount={closeNewProjectView}
				/>
			);
		} else if (mounted.notes) {
			return (
				<DynamicNotes
					clients={api.clients}
					inquiry={main.selectedInquiryForNotes}
					reload={getSupportData}
					unmount={toggleNotesView}
				/>
			);
		} else {
			return (
				<>
					<div className="flex w-full px-5 py-2.5 justify-between items-center">
						<div className="flex w-[30%] space-x-2 justify-start items-center">
							<span className="view-heading">{thisView}</span>
							{getIconOrBadge()}
						</div>
						<div className="flex w-[70%] space-x-2 justify-start items-center">
							{uiFromDate()}
							{uiToDate()}
							{uiFind()}
							{uiFilter()}
							<Tippy
								content={<Tooltip text="Clear filters" />}
								placement="bottom">
								{uiClearFilter()}
							</Tippy>
						</div>
					</div>
					<div className="flex w-full h-full justify-center items-center">{uiBody()}</div>
				</>
			);
		}
	}

	function uiProjects(childLabelStyle, parentLabelStyle, row, style) {
		const mainProject = MyGlobal.HighlightText(row.main_project, filter.search);
		const subProject = MyGlobal.HighlightText(row.sub_project, filter.search);

		return (
			<div className={style}>
				<span
					className={parentLabelStyle}
					dangerouslySetInnerHTML={{ __html: subProject }}
				/>
				<span
					className={childLabelStyle}
					dangerouslySetInnerHTML={{ __html: mainProject }}
				/>
			</div>
		);
	}

	function uiQuote(row, style) {
		const quote = MyGlobal.HighlightText(row.quote, filter.search);
		const itemStyle = "flex w-full p-2 space-x-2 justify-start items-center rounded cursor-pointer hover:transition-all font-regular-11 text-white";

		return (
			<div className={`${style} cursor-help`}>
				<Tippy
					className="!shadow !py-2"
					content={
						<div className="flex flex-col space-y-1 justify-center items-center">
							{(isAdministrator || allowQuotation) && (
								<div
									className={`${itemStyle} hover:bg-blue-500`}
									onClick={() => toggleAddQuotation(row, true)}>
									<FontAwesomeIcon
										className="w-5"
										icon={faPlus}
										size="1x"
									/>
									<span>New Quotation</span>
								</div>
							)}
							{isAdministrator && row.quotation_id && (
								<div
									className={`${itemStyle} hover:bg-emerald-500`}
									onClick={() => toggleEditQuotation(row, true)}>
									<FontAwesomeIcon
										className="w-5"
										icon={faPen}
										size="1x"
									/>
									<span>Edit Quotation</span>
								</div>
							)}
							{isAdministrator && row.quotation_id && (
								<div
									className={`${itemStyle} hover:bg-amber-500`}
									onClick={() => downloadQuotation(row.quotation_id)}>
									<FontAwesomeIcon
										className="w-5"
										icon={faDownload}
										size="1x"
									/>
									<span>Download Quotation</span>
								</div>
							)}
						</div>
					}
					interactive
					placement="bottom"
					theme="dark"
					trigger="mouseenter"
					animation="shift-toward"
					appendTo={() => document.body}>
					<span
						className="flex w-fit justify-center items-center font-bold-12 hover:p-2 hover:bg-slate-200 hover:rounded-full hover:w-fit"
						dangerouslySetInnerHTML={{ __html: MyGlobal.FormatCurrency(quote) }}
					/>
				</Tippy>
			</div>
		);
	}

	function uiReferences(childLabelStyle, parentLabelStyle, row, style) {
		const referenceName = MyGlobal.HighlightText(row.reference_name, filter.search);
		const entryBy = MyGlobal.HighlightText(row.entry_by_name, filter.search);

		const wrapper = style + " cursor-help";

		return (
			<div className={wrapper}>
				<Tippy
					content={<Tooltip text={row.reference_id_and_name} />}
					placement="bottom">
					<span
						className={parentLabelStyle}
						dangerouslySetInnerHTML={{ __html: referenceName }}
					/>
				</Tippy>
				<Tippy
					content={<Tooltip text={`Inquiry created by ${row.entry_by_name}`} />}
					placement="bottom">
					<span
						className={childLabelStyle}
						dangerouslySetInnerHTML={{ __html: entryBy }}
					/>
				</Tippy>
			</div>
		);
	}

	function uiRows(row) {
		const style = "flex flex-col w-[12.50%] justify-center items-center text-center";
		const childStyle = "flex w-full justify-center items-center";

		const fancyRightBorderStyle = "absolute w-3 h-[50px] rounded-tr-full rounded-br-full " + getStatusSeverityBackground2(row.status) + " -left-1";

		const parentLabelStyle = childStyle + " font-bold-12";
		const childLabelStyle = childStyle + " gray-text";

		const avatarWrapper = style + " !flex-row space-x-1";

		const followUpsNames = String(row.follow_ups).split(",");

		return (
			<div
				className="flex w-full py-3 justify-center items-center contrast-background bottom-border font-regular-10 black-text relative"
				key={row.id}>
				<span className={fancyRightBorderStyle} />

				{uiClientAndInquiryDate(childStyle, row, style)}

				{uiContactDetails(childStyle, row, style)}

				{uiProjects(childLabelStyle, parentLabelStyle, row, style)}

				<span className={avatarWrapper}>
					<AvatarCircle names={followUpsNames} />
				</span>

				{uiQuote(row, style)}

				<span className={`${style} font-bold-12`}>{row.next_follow_up_on}</span>

				{uiStatus(childStyle, row, style)}

				{uiReferences(childLabelStyle, parentLabelStyle, row, style)}
			</div>
		);
	}

	function uiSkeletion(index) {
		return (
			<div
				className="flex w-full py-3 justify-center items-center contrast-background bottom-border relative animate-pulse"
				key={index}>
				<div className="absolute w-3 h-[50px] rounded-tr-full rounded-br-full bg-gray-200 -left-1" />
				<div className="flex flex-col w-[14.28%] justify-center items-center text-center space-y-2">
					<div className="h-4 w-24 bg-gray-200 rounded" />
					<div className="h-3 w-16 bg-gray-200 rounded" />
				</div>
				<div className="flex flex-col w-[14.28%] justify-center items-center text-center space-y-2">
					<div className="h-4 w-20 bg-gray-200 rounded" />
					<div className="h-3 w-28 bg-gray-200 rounded" />
				</div>
				<div className="flex flex-col w-[14.28%] justify-center items-center text-center space-y-2">
					<div className="h-4 w-24 bg-gray-200 rounded" />
					<div className="h-3 w-20 bg-gray-200 rounded" />
				</div>
				<div className="flex w-[14.28%] justify-center items-center">
					<div className="h-8 w-8 bg-gray-200 rounded-full" />
				</div>
				<div className="flex w-[14.28%] justify-center items-center">
					<div className="h-4 w-16 bg-gray-200 rounded" />
				</div>
				<div className="flex w-[14.28%] justify-center items-center space-x-2">
					<div className="h-6 w-16 bg-gray-200 rounded" />
					<div className="h-6 w-6 bg-gray-200 rounded" />
				</div>
				<div className="flex flex-col w-[14.28%] justify-center items-center text-center space-y-2">
					<div className="h-4 w-24 bg-gray-200 rounded" />
					<div className="h-3 w-20 bg-gray-200 rounded" />
				</div>
			</div>
		);
	}

	function uiSortArrows(column) {
		if (main.sort.column === column) {
			if (main.sort.isAscending) {
				return (
					<FontAwesomeIcon
						className="text-white"
						icon={faSortAmountDesc}
						size="sm"
					/>
				);
			} else {
				return (
					<FontAwesomeIcon
						className="text-white"
						icon={faSortAmountAsc}
						size="sm"
					/>
				);
			}
		}
	}

	function uiStatus(childStyle, row, style) {
		const wrapper = style + " !flex-row";
		const childElementsStyle = childStyle + " !w-fit";

		return (
			<div className={wrapper}>
				<span className={childElementsStyle}>{uiStatusMenu(row)}</span>
			</div>
		);
	}

	function uiStatusMenu(row) {
		const isConfirmed = row.status === statuses.Confirmed;

		const wrapper = "flex w-full space-x-2.5 justify-between items-center focus:outline-none relative z-40 font-medium-10 " + getStatusSeverity(row.status);

		const icon = !isConfirmed && (
			<FontAwesomeIcon
				icon={faChevronDown}
				size="xs"
			/>
		);

		const totalNotes = getTotalNotesByInquiry(row.id);
		const notesWrapper = totalNotes > 0 ? "cursor-pointer primary-text" : "cursor-default black-text";

		return (
			<Tippy
				content={<Tooltip text={row.closure_reason} />}
				disabled={row.is_closed === 0 && !row.closure_reason}
				placement="bottom">
				<Menu
					as="div"
					className="flex w-full justify-center items-center relative">
					<MenuButton className={wrapper}>
						<span dangerouslySetInnerHTML={{ __html: highlightText(true, row.status) }} />
						{icon}
					</MenuButton>
					<span
						className={`absolute ${notesWrapper} -top-3 -right-3 z-50`}
						onClick={() => totalNotes && toggleNotesView(row, true)}>
						<BadgeSmallWithBackground
							style={getStatusSeverityBackground(row.status)}
							value={totalNotes}
						/>
					</span>
					{!isConfirmed && <MenuItems className="absolute w-full top-7 right-0 origin-top-right rounded contrast-background bottom-shadow focus:outline-none z-50 full-border">{uiStatusMenuList(row)}</MenuItems>}
				</Menu>
			</Tippy>
		);
	}

	function uiStatusMenuList(row) {
		return Object.values(statuses)
			.filter((f) => f !== row.status)
			.filter((f) => {
				if (f === statuses.Confirmed && !allowConvertingToProject) return f !== statuses.Confirmed;
				return f;
			})
			.map((m, i) => {
				const label = m === statuses.Closed ? "Close" : m === statuses.Confirmed ? "Confirm" : m;

				return (
					<MenuItem
						as="div"
						className="p-2 space-x-2.5 cursor-pointer border-y font-regular-10 black-text text-left hovered-rows"
						key={i}
						onClick={() => prepareInquiryStatusChangeData(row, m)}>
						<span>{label}</span>
					</MenuItem>
				);
			});
	}

	function uiToDate() {
		if (inquiriesCopySize) {
			return (
				<div className="flex w-36 h-[30px] px-2.5 space-x-1 justify-center items-center rounded bottom-shadow contrast-background">
					<FontAwesomeIcon
						className="primary-text"
						icon={faCalendar}
						size="sm"
					/>
					<ReactDatePicker
						className="w-20 h-6 bg-transparent outline-none font-regular-10"
						dateFormat="dd-MM-YYYY"
						dropdownMode="select"
						endDate={filter.to}
						onChange={(e) => setInputs("to", e)}
						placeholderText="To"
						peekNextMonth
						selected={filter.to}
						selectsEnd
						startDate={filter.to}
						showMonthDropdown
						showYearDropdown
						tabIndex={2}
					/>
					<FontAwesomeIcon
						className={showToDateClearButton}
						onClick={() => setInputs("to", "")}
						icon={faMultiply}
					/>
				</div>
			);
		}
	}

	// Hooks
	useEffect(() => {
		getSupportData();
		globalThis.addEventListener("keydown", detectKeystrokes);

		return () => {
			setModuleProps(thisView, "");
			globalThis.removeEventListener("keydown", detectKeystrokes);
		};
	}, []);

	useEffect(() => {
		if (inquiries.merged.length) {
			const filtered = doFiltering(inquiries.merged);
			setInquiries((s) => ({ ...s, data: filtered }));
		}
	}, [inquiries.merged, filter, main.isStatus]);

	useEffect(() => {
		if (mounted.mainComponent) {
			if (Object.keys(main.selectedInquiryForStatusChange).length) {
				toggleUpdateStatus(true);
			}
		}
	}, [main.selectedInquiryForStatusChange]);

	useEffect(() => {
		if (!mounted.notes && currentScrollPositionReference.current) {
			const savedIndex = getScrollPosition("inquiries");

			currentScrollPositionReference.current.scrollToIndex({
				index: savedIndex,
				align: "nearest",
				behavior: "auto",
			});
		}
	}, [mounted.notes]);

	if (mounted.myInquiries) {
		return (
			<DynamicMyInquiries
				presetStatus={presetStatus}
				setModuleProps={setModuleProps}
				unmount={closeMyInquiries}
			/>
		);
	}

	return (
		<div className="flex flex-col w-full h-full justify-start items-center primary-light-background">
			{uiMain()}

			{mounted.updateStatus && (
				<DynamicUpdateStatus
					inquiry={main.selectedInquiryForStatusChange}
					mount={mounted.updateStatus}
					reload={getSupportData}
					unmount={toggleUpdateStatus}
				/>
			)}
		</div>
	);
}
