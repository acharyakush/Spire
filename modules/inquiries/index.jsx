"use client";

import "tippy.js/animations/shift-toward.css";
import "react-datepicker/dist/react-datepicker.css";

import axios from "axios";
import dayjs from "dayjs";
import Tippy from "@tippyjs/react";
import dynamic from "next/dynamic";
import ReactDatePicker from "react-datepicker";
import writeXlsxFile from "write-excel-file/browser";
import HoverPreviewWrapper from "@/components/HoverPreviewPdf";

import { Virtuoso } from "react-virtuoso";
import { MyGlobal } from "@/utilities/global";
import { TextInputNative, TextInputNative2 } from "@/components/Inputs";
import { InquiriesHeaders } from "@/utilities/headers";
import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ApiEndpoints, BaseModules, DerivedModules, Statuses } from "@/utilities/constants";
import { AvatarCircle, Badge, BadgeSmall, BadgeSmallWithBackground, Tooltip } from "@/components/Elements";
import { faCalendar, faCheckCircle, faChevronDown, faDownload, faFileDownload, faFilterCircleXmark, faIndianRupee, faInfoCircle, faMultiply, faPen, faPlaneUp, faPlus, faReceipt, faSearch, faSortAmountAsc, faSortAmountDesc } from "@fortawesome/free-solid-svg-icons";

const DynNotes = dynamic(() => import("./Notes"), { ssr: false });
const DynNewInquiry = dynamic(() => import("./NewInquiry"), { ssr: false });
const DynEditInquiry = dynamic(() => import("./EditInquiry"), { ssr: false });
const DynNewQuotation = dynamic(() => import("./NewQuotation"), { ssr: false });
const DynEditQuotation = dynamic(() => import("./EditQuotation"), { ssr: false });
const DynNewProject = dynamic(() => import("../projects/NewProject"), { ssr: false });
const DynUpdateStatus = dynamic(() => import("@/modals/inquiries/miscellaneous").then((t) => ({ default: t.UpdateStatus })), { ssr: false });

export default function Inquiries({ presetStatus, setModuleProps }) {
	// Business Logic
	const currentScrollPositionReference = useRef(null);
	const rangeChangeTimeoutReference = useRef(null);
	const goToTopAnimationFrameReference = useRef(null);
	const currentTopIndexReference = useRef(0);
	const showGoToTopReference = useRef(false);

	const [api, setApi] = useState({ clients: [], notes: [] });
	const [showGoToTopOrb, setShowGoToTopOrb] = useState(false);
	const [shouldRestoreScrollPosition, setShouldRestoreScrollPosition] = useState(false);

	const [filter, setFilter] = useState({
		from: "",
		to: "",
		search: "",
		status: presetStatus ? String(presetStatus).replace("MySpace", "") : "Open",
	});

	const [inquiries, setInquiries] = useState({ copy: [], data: [] });

	const [main, setMain] = useState({
		isLoading: false,
		isStatus: presetStatus ?? false,
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
		newInquiry: false,
		newProject: false,
		notes: false,
		updateStatus: false,
	});

	const allowQuotation = useMemo(() => MyGlobal.HasPermission(DerivedModules.Quotation), []);
	const allowConvertingToProject = useMemo(() => MyGlobal.HasPermission(DerivedModules.NewProject), []);
	const allowNewInquiry = useMemo(() => MyGlobal.HasPermission(DerivedModules.NewInquiry), []);
	const allowEditQuotation = useMemo(() => MyGlobal.HasPermission(DerivedModules.EditQuotation), []);

	const thisView = useMemo(() => BaseModules.Inquiries, []);
	const statuses = useMemo(() => Statuses.Inquiries, []);

	const totalNotesByInquiryMap = useMemo(() => {
		const counts = {};

		for (const note of api.notes) {
			if (note.source === thisView) {
				counts[note.inquiry_id] = {
					firstRow: (
						<div className="flex flex-col w-full space-y-3 p-3 justify-center-safe">
							<span>{note.content}</span>
							<div className="flex flex-col w-full justify-center-safe">
								<span className="text-xs text-gray-300">{MyGlobal.GetAnyDataFromId(note.entry_by_id, "full_name")}</span>
								<span className="text-xs text-gray-300">{dayjs(note.entry_date).format("DD MMM, YYYY")}</span>
							</div>
						</div>
					),
					total: (counts[note.inquiry_id]?.total || 0) + 1,
				};
			}
		}

		return counts;
	}, [api.notes, thisView]);

	const sortedInquiries = useMemo(() => {
		const { column, isAscending } = main.sort;

		return [...inquiries.data].sort((a, b) => {
			const aNextFollowUp = new Date(a.next_follow_up_on);
			const bNextFollowUp = new Date(b.next_follow_up_on);

			if (column === InquiriesHeaders.Client) {
				if (isAscending) return String(a.client_name).localeCompare(b.client_name);
				return String(b.client_name).localeCompare(a.client_name);
			} else if (column === InquiriesHeaders.Projects) {
				if (isAscending) return String(a.sub_project).localeCompare(b.sub_project);
				return String(b.sub_project).localeCompare(a.sub_project);
			} else if (column === InquiriesHeaders.FollowUps) {
				if (isAscending) return String(a.follow_ups_initials).localeCompare(b.follow_ups_initials);
				return String(b.follow_ups_initials).localeCompare(a.follow_ups_initials);
			} else if (column === InquiriesHeaders.Quote) {
				if (isAscending) return a.quote - b.quote;
				return b.quote - a.quote;
			} else if (column === InquiriesHeaders.NextFollowUpOn) {
				if (isAscending) return aNextFollowUp - bNextFollowUp;
				return bNextFollowUp - aNextFollowUp;
			} else if (column === InquiriesHeaders.Status) {
				if (isAscending) return String(a.status).localeCompare(b.status);
				return String(b.status).localeCompare(a.status);
			} else if (column === InquiriesHeaders.References) {
				if (isAscending) return String(a.reference_name).localeCompare(b.reference_name);
				return String(b.reference_name).localeCompare(a.reference_name);
			}

			return 0;
		});
	}, [inquiries.data, main.sort]);

	const inquiriesSize = useMemo(() => inquiries.data.length, [inquiries.data]);
	const inquiriesCopySize = useMemo(() => inquiries.copy.length, [inquiries.copy]);

	const isAdministrator = useMemo(() => MyGlobal.IsUserAdministrator(), []);

	const showFromDateClearButton = useMemo(() => (filter.from ? "cursor-pointer primary-text" : "hidden!"), [filter.from]);
	const showToDateClearButton = useMemo(() => (filter.to ? "cursor-pointer primary-text" : "hidden!"), [filter.to]);
	const showFindClearButton = useMemo(() => (filter.search ? "cursor-pointer primary-text" : "hidden!"), [filter.search]);

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

	function closeNewProjectView() {
		setShouldRestoreScrollPosition(true);
		setMounted((s) => ({ ...s, newProject: false }));
	}

	function detectKeystrokes(event) {
		switch (true) {
			case event.ctrlKey && event.key === "f":
				event.preventDefault();
				document.getElementById("searchBox").focus();
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

		const rowHeaders = Object.values(InquiriesHeaders);
		const blankRows = [{ span: rowHeaders.length, height: rowHeight, colSpan: 2 }];

		sortedInquiries.forEach((fe) => {
			records.push(fe.client_name + "\n" + fe.entry_date, fe.phone_number + "\n" + fe.email_address, fe.sub_project + "\n" + fe.main_project, fe.follow_ups, fe.quote, fe.next_follow_up_on, fe.status + " (" + getTotalNotesByInquiry(fe.id)?.total + ")", fe.reference_name + "\n" + fe.entry_by_name);
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

	function downloadQuotation(quotationId) {
		const link = document.createElement("a");
		const fileName = String(quotationId).replace("/", "_").replace("/", "_");

		link.href = "/quotations/" + fileName;
		link.download = fileName + ".pdf";

		link.click();
	}

	function getFollowUpRemainingColour(value) {
		if (value > 3) {
			return "green-text font-medium-10";
		}

		switch (value) {
			case 0:
				return "red-text font-medium-10 blink";
			case 1:
				return "orange-text font-medium-10 blink";
			default:
				return "gray-text font-regular-10";
		}
	}

	function getIconOrBadge() {
		return inquiriesSize > 0 && <Badge value={getRowsCount()} />;
	}

	async function getInquiries(supportData) {
		try {
			setMain((s) => ({ ...s, isLoading: true }));

			const response = await axios.get(ApiEndpoints.Inquiries.GetInquiries, MyGlobal.GetHeaders());

			if (response.status === 200) {
				let revised = [];
				const revisedCopy = [];

				const isSingleUser = String(presetStatus).includes("MySpace");

				const source = response.data.inquiries.filter((f) => {
					if (isSingleUser) return String(f.follow_ups).includes(MyGlobal.GetUserId()) || f.entry_by_id === MyGlobal.GetUserId();
					return f;
				});

				const sourceLength = source.length;

				for (let i = 0; i < sourceLength; i++) {
					const obj = source[i];

					const clientName = MyGlobal.GetNameFromId(obj.client_id, supportData.clients);
					const referenceName = MyGlobal.GetNameFromId(obj.reference_id, supportData.references);
					const followUps = MyGlobal.GetAnyDataFromId(obj.follow_ups, "full_name");
					const entryBy = MyGlobal.GetAnyDataFromId(obj.entry_by_id, "full_name");

					let phoneNumber = obj.phone_number;

					if (obj.client_id === "CN000237") debugger;

					const client = supportData.clients.find((f) => f.id === obj.client_id);
					const quotation = response.data.quotations_services.find((f) => f.quotation_id === obj.quotation_id);

					let quotationAmount = 0;

					if (quotation) {
						quotationAmount = +quotation.professional_fees + +quotation.government_fees;
					}

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
						quotationAmount,
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
				} else {
					const array = revised.filter((f) => f.status === "Open");

					revised.length = 0;
					revised = array;
				}

				const merged = mergeInquiriesAndNotesById(revised);
				const revisedStatuses = calculateStatusCounts(revisedCopy);
				const filtered = doFiltering(merged);

				setInquiries({ copy: revisedCopy, data: filtered });
				setMain((s) => ({ ...s, revisedStatuses }));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, thisView + " > getInquiries()");
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
			const response = await axios.get(ApiEndpoints.Inquiries.GetSupportData, MyGlobal.GetHeaders());

			if (response.status === 200) {
				setApi((s) => ({ ...s, clients: response.data.clients, notes: response.data.notes }));
				getInquiries(response.data);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Inquiries => Get Required Data");
		}
	}

	function getTotalNotesByInquiry(id) {
		return totalNotesByInquiryMap[id] || 0;
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
		currentTopIndexReference.current = range.startIndex;

		const shouldShowGoToTop = range.startIndex > 12;

		if (showGoToTopReference.current !== shouldShowGoToTop) {
			showGoToTopReference.current = shouldShowGoToTop;
			setShowGoToTopOrb(shouldShowGoToTop);
		}

		if (rangeChangeTimeoutReference.current) {
			clearTimeout(rangeChangeTimeoutReference.current);
		}

		rangeChangeTimeoutReference.current = setTimeout(() => {
			localStorage.setItem("inquiriesScrollPosition", range.startIndex);
		}, 150);
	}

	function saveInquiriesScrollPosition() {
		if (rangeChangeTimeoutReference.current) {
			clearTimeout(rangeChangeTimeoutReference.current);
			rangeChangeTimeoutReference.current = null;
		}

		localStorage.setItem("inquiriesScrollPosition", String(currentTopIndexReference.current));
		setShouldRestoreScrollPosition(false);
	}

	function restoreInquiriesScrollPosition() {
		if (!currentScrollPositionReference.current) return;

		const savedIndex = Number(localStorage.getItem("inquiriesScrollPosition"));
		if (!Number.isFinite(savedIndex) || savedIndex < 0) return;
		const maxIndex = Math.max(sortedInquiries.length - 1, 0);
		const restoredIndex = Math.min(savedIndex, maxIndex);

		currentTopIndexReference.current = restoredIndex;
		showGoToTopReference.current = restoredIndex > 12;
		setShowGoToTopOrb(restoredIndex > 12);

		currentScrollPositionReference.current.scrollToIndex({
			index: restoredIndex,
			align: "start",
			behavior: "auto",
		});
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
		if (header !== InquiriesHeaders.Contacts) {
			setMain((s) => ({ ...s, sort: { column: header, isAscending: !s.sort.isAscending } }));
		}
	}

	function toggleAddQuotation(inquiry, type) {
		const client = api.clients.find((f) => f.id === inquiry.client_id);
		const obj = { ...inquiry, client };

		if (type) saveInquiriesScrollPosition();
		else setShouldRestoreScrollPosition(true);

		setMain((s) => ({ ...s, selectedInquiryForNotes: obj }));
		setMounted((s) => ({ ...s, addQuotation: type }));
	}

	function toggleEditQuotation(inquiry, type) {
		const client = api.clients.find((f) => f.id === inquiry.client_id);
		const obj = { ...inquiry, client };

		if (type) saveInquiriesScrollPosition();
		else setShouldRestoreScrollPosition(true);

		setMain((s) => ({ ...s, selectedInquiryForNotes: obj }));
		setMounted((s) => ({ ...s, editQuotation: type }));
	}

	function toggleEditInquiryView(inquiry, type) {
		if (type) saveInquiriesScrollPosition();
		else setShouldRestoreScrollPosition(true);

		setMain((s) => ({ ...s, selectedInquiryForNotes: inquiry }));
		setMounted((s) => ({ ...s, editInquiry: type }));
	}

	function toggleNewInquiryView() {
		if (!mounted.newInquiry) saveInquiriesScrollPosition();
		else setShouldRestoreScrollPosition(true);

		setMounted((s) => ({ ...s, newInquiry: !s.newInquiry }));
	}

	function toggleNotesView(inquiry, type) {
		if (type) saveInquiriesScrollPosition();
		else setShouldRestoreScrollPosition(true);

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
		if (main.isLoading) {
			return (
				<div className="flex flex-col w-full h-full justify-center items-start full-border relative">
					<div className="flex w-full h-9 justify-center items-center primary-background animate-pulse">
						{Object.values(InquiriesHeaders).map((_, i) => (
							<div key={i} className="flex w-[12.50%] justify-center items-center">
								<div className="h-4 w-20 bg-gray-200 rounded" />
							</div>
						))}
					</div>
					<div className="w-full h-full overflow-y-auto contrast-background">{[...Array(9)].map((_, i) => uiSkeletion(i))}</div>
				</div>
			);
		}

		if (!inquiriesCopySize) {
			return <div className={blankDataWrapper}>No inquiries generated.</div>;
		}

		if (!inquiriesSize) {
			return <div className={blankDataWrapper}>No inquiries found.</div>;
		}

		return (
			<div className="flex flex-col w-full h-full justify-center items-start full-border relative">
				<div className="flex w-full h-9 justify-center items-center primary-background">{uiHeaders()}</div>
				<Virtuoso ref={currentScrollPositionReference} rangeChanged={handleRangeChange} className="w-full h-full overflow-y-auto contrast-background" data={sortedInquiries} itemContent={(_, row) => uiRows(row)} totalCount={sortedInquiries.length} overscan={8} />
				<div className="flex fixed bottom-3 right-3 space-x-3 z-50">
					{uiGoToTopOrb()}
					{uiNewInquiry()}
					{uiTotalQuote()}
				</div>
			</div>
		);
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
					setInquiries((s) => ({ ...s, data: mergeInquiriesAndNotesById(inquiries.copy) }));
				}}
			/>
		);
	}

	function uiClientAndInquiryDate(childStyle, row, style) {
		const clientName = MyGlobal.HighlightText(row.client_name, filter.search);
		const clientNameTextStyle = row.status === statuses.Confirmed ? "cursor-not-allowed green-text" : "cursor-pointer primary-text";

		const wrapper = style + " font-medium-12 space-x-2 " + clientNameTextStyle;
		const clientNameStyle = childStyle + " !w-3/4 " + getStatusSeverityBackground3(row.status).text;

		return (
			<div className={wrapper} style={{ overflowWrap: "anywhere" }}>
				<Tippy content={<Tooltip text={row.client_id_and_name} />} placement="bottom">
					<span className={clientNameStyle} dangerouslySetInnerHTML={{ __html: clientName }} onClick={() => toggleEditInquiryView(row, true)} />
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
				<Tippy content={<Tooltip text="Open this contact on WhatsApp Web." />} placement="bottom">
					<span className={phoneNumberStyle} dangerouslySetInnerHTML={{ __html: phoneNumber }} onClick={() => openWhatsAppWeb(row.phone_number)} />
				</Tippy>
				<Tippy content={<Tooltip text="Send email to this address." />} placement="bottom">
					<span className={emailAddressStyle} dangerouslySetInnerHTML={{ __html: emailAddress }} onClick={() => openEmailAddress(row.email_address)} />
				</Tippy>
			</div>
		);
	}

	function uiFilter(source) {
		const topPosition = source === "orb" ? "bottom-full" : "top-full";
		const style = `absolute w-full ${topPosition} mb-2 rounded z-50 contrast-background shadow`;

		return (
			<Menu as="div" className="flex w-40 h-7.5 justify-center items-center relative rounded shadow contrast-background full-border">
				<MenuButton className="flex w-full h-7.5 px-2 justify-between items-center font-regular-10 gray-text cursor-pointer">
					<div className="flex space-x-2 items-center">
						<FontAwesomeIcon className="primary-text" icon={faInfoCircle} />
						<span>{filter.status || "Status"}</span>
					</div>
					<FontAwesomeIcon icon={faChevronDown} />
				</MenuButton>
				<MenuItems className={style}>{uiFilterMenuList()}</MenuItems>
			</Menu>
		);
	}

	function uiFilterMenuList() {
		return Object.entries(main.revisedStatuses).map(([key, value], i) => {
			const isSelected = key === filter.status;
			const aesthetics = isSelected ? "primary-background-transparent-01 primary-text" : "contrast-background black-text";
			const wrapper = `flex w-full p-2 space-x-2.5 justify-between items-center cursor-pointer border-y border-gray-300 ${aesthetics} hovered-rows-white-1`;

			return (
				<MenuItem
					as="div"
					className={wrapper}
					key={i}
					onClick={() => {
						setFilter((s) => ({ ...s, status: key }));
						setMain((s) => ({ ...s, isStatus: true }));
					}}>
					<span className="flex w-full justify-between items-center font-regular-10">
						<span>{key}</span>
						{isSelected ? <FontAwesomeIcon className="primary-text" icon={faCheckCircle} /> : value > 0 && <BadgeSmall value={value} />}
					</span>
				</MenuItem>
			);
		});
	}

	function uiGoToTopOrb() {
		const handleClick = () => {
			const previousTopIndex = currentTopIndexReference.current;

			localStorage.setItem("inquiriesScrollPosition", 0);
			showGoToTopReference.current = false;
			setShowGoToTopOrb(false);

			if (rangeChangeTimeoutReference.current) {
				clearTimeout(rangeChangeTimeoutReference.current);
				rangeChangeTimeoutReference.current = null;
			}

			if (goToTopAnimationFrameReference.current) {
				cancelAnimationFrame(goToTopAnimationFrameReference.current);
				goToTopAnimationFrameReference.current = null;
			}

			if (currentScrollPositionReference.current) {
				if (previousTopIndex > 120) {
					currentScrollPositionReference.current.scrollToIndex({
						index: 18,
						align: "start",
						behavior: "auto",
					});

					goToTopAnimationFrameReference.current = globalThis.requestAnimationFrame(() => {
						currentScrollPositionReference.current?.scrollToIndex({
							index: 0,
							align: "start",
							behavior: "smooth",
						});
						goToTopAnimationFrameReference.current = null;
					});
				} else {
					currentScrollPositionReference.current.scrollToIndex({
						index: 0,
						align: "start",
						behavior: "smooth",
					});
				}
			}

			currentTopIndexReference.current = 0;
		};

		const wrapperStyle = showGoToTopOrb ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-90 translate-y-2 pointer-events-none";

		return (
			<div className={`transform-gpu transition-all duration-300 ease-out will-change-transform ${wrapperStyle}`} aria-hidden={!showGoToTopOrb}>
				<Tippy content={<Tooltip text="Go to top" />} disabled={!showGoToTopOrb} interactive placement="left" theme="dark" trigger="mouseenter" animation="shift-toward" appendTo={() => document.body}>
					<button type="button" aria-label="Go to top" className="w-10 h-10 flex items-center justify-center rounded-full bg-linear-to-br from-slate-200 via-indigo-300 to-violet-400 text-indigo-900 border border-indigo-500 shadow transition-all duration-300 ease-out hover:scale-105 hover:shadow-md cursor-pointer" onClick={handleClick} tabIndex={showGoToTopOrb ? 0 : -1}>
						<FontAwesomeIcon icon={faPlaneUp} size="1x" />
					</button>
				</Tippy>
			</div>
		);
	}

	function uiFromDate() {
		if (inquiriesCopySize) {
			return (
				<div className="flex w-36 h-7.5 px-2.5 space-x-1 justify-center items-center rounded bottom-shadow contrast-background">
					<FontAwesomeIcon className="primary-text" icon={faCalendar} size="sm" />
					<ReactDatePicker className="w-20 h-6 bg-transparent outline-none font-regular-10" dateFormat="dd-MM-YYYY" dropdownMode="select" endDate={filter.to} onChange={(e) => setInputs("from", e)} peekNextMonth placeholderText="From" tabIndex={1} selected={filter.from} selectsStart startDate={filter.from} showMonthDropdown showYearDropdown />
					<FontAwesomeIcon className={showFromDateClearButton} onClick={() => setInputs("from", "")} icon={faMultiply} />
				</div>
			);
		}
	}

	function uiHeaders() {
		return Object.values(InquiriesHeaders).map((m, i) => {
			const showSortArrow = m == main.sort.column ? "block" : "hidden";
			return (
				<span className="flex w-[12.50%] cursor-pointer justify-center items-center font-medium-10" key={i}>
					<div className="flex w-full space-x-2 justify-center items-center text-white" onClick={() => setSort(m)}>
						<span>{m}</span>
						<span className={showSortArrow}>{uiSortArrows(m)}</span>
					</div>
				</span>
			);
		});
	}

	function uiMain() {
		if (mounted.addQuotation) {
			return <DynNewQuotation clients={api.clients} inquiry={main.selectedInquiryForNotes} reload={getSupportData} unmount={toggleAddQuotation} />;
		} else if (mounted.editQuotation) {
			return <DynEditQuotation clients={api.clients} inquiry={main.selectedInquiryForNotes} reload={getSupportData} unmount={toggleEditQuotation} />;
		} else if (mounted.editInquiry) {
			return <DynEditInquiry inquiry={main.selectedInquiryForNotes} reload={getSupportData} unmount={toggleEditInquiryView} />;
		} else if (mounted.newInquiry) {
			return <DynNewInquiry allInquiries={inquiries.copy} reload={getSupportData} unmount={toggleNewInquiryView} />;
		} else if (mounted.newProject) {
			return <DynNewProject inquiry={main.selectedInquiryForStatusChange} reload={getSupportData} unmount={closeNewProjectView} />;
		} else if (mounted.notes) {
			return <DynNotes clients={api.clients} inquiry={main.selectedInquiryForNotes} reload={getSupportData} unmount={toggleNotesView} />;
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
							{uiSearch()}
							{uiFilter()}
							<Tippy content={<Tooltip text="Clear filters" />} placement="bottom">
								{uiClearFilter()}
							</Tippy>
							<Tippy content={<Tooltip text="Download in Excel" />} placement="bottom">
								<FontAwesomeIcon className="cursor-pointer text-green-600" icon={faDownload} onClick={() => doExcelExport()} />
							</Tippy>
						</div>
					</div>
					<div className="flex w-full h-full justify-center items-center">{uiBody()}</div>
				</>
			);
		}
	}

	function uiNewInquiry() {
		if (isAdministrator || allowNewInquiry) {
			return (
				<div className="w-10 h-10 flex items-center justify-center rounded-full bg-linear-to-br from-blue-100 via-blue-200 to-blue-300 border border-blue-600 shadow transition-all duration-300 transform hover-pulse-glow cursor-pointer" onClick={() => toggleNewInquiryView()}>
					<FontAwesomeIcon icon={faPlus} className="text-blue-500" size="lg" />
				</div>
			);
		}
	}

	function uiProjects(childLabelStyle, parentLabelStyle, row, style) {
		const mainProject = MyGlobal.HighlightText(row.main_project, filter.search);
		const subProject = MyGlobal.HighlightText(row.sub_project, filter.search);

		return (
			<div className={style}>
				<span className={parentLabelStyle} dangerouslySetInnerHTML={{ __html: subProject }} />
				<span className={childLabelStyle} dangerouslySetInnerHTML={{ __html: mainProject }} />
			</div>
		);
	}

	function uiQuote(row, style) {
		const quote = MyGlobal.HighlightText(row.quote, filter.search);
		const quotationFile = String(row.quotation_id).replace("/", "_").replace("/", "_");

		return (
			<div className={`${style} justify-between! space-y-2 cursor-help`}>
				<span className="font-bold-12" dangerouslySetInnerHTML={{ __html: MyGlobal.FormatCurrency(quote) }} />
				<div className="flex w-full space-x-2 justify-center items-center">
					{(isAdministrator || allowQuotation) && (
						<Tippy content={<Tooltip text="New Quotation" />} placement="bottom">
							<FontAwesomeIcon className="w-5 text-blue-600 cursor-pointer scale-100 hover:scale-150 duration-200" icon={faReceipt} onClick={() => toggleAddQuotation(row, true)} size="1x" />
						</Tippy>
					)}
					{(isAdministrator || allowEditQuotation) && row.quotation_id && (
						<Tippy content={<Tooltip text="Edit Quotation" />} placement="bottom">
							<FontAwesomeIcon className="w-5 text-emerald-600 cursor-pointer scale-100 hover:scale-150 duration-200" onClick={() => toggleEditQuotation(row, true)} icon={faPen} size="1x" />
						</Tippy>
					)}
					{isAdministrator && row.quotation_id && (
						<Tippy content={<Tooltip text="Download Quotation" />} placement="bottom">
							<FontAwesomeIcon className="w-5 text-orange-600 cursor-pointer scale-100 hover:scale-150 duration-200" onClick={() => downloadQuotation(row.quotation_id)} icon={faDownload} size="1x" />
						</Tippy>
					)}
					{row.quotationAmount > 0 && <HoverPreviewWrapper fileUrl={`/quotations/${quotationFile}.pdf`} />}
				</div>
			</div>
		);
	}

	function uiReferences(childLabelStyle, parentLabelStyle, row, style) {
		const referenceName = MyGlobal.HighlightText(row.reference_name, filter.search);
		const entryBy = MyGlobal.HighlightText(row.entry_by_name, filter.search);

		const wrapper = style + " cursor-help";

		return (
			<div className={wrapper}>
				<Tippy content={<Tooltip text={row.reference_id_and_name} />} placement="bottom">
					<span className={parentLabelStyle} dangerouslySetInnerHTML={{ __html: referenceName }} />
				</Tippy>
				<Tippy content={<Tooltip text={`Inquiry created by ${row.entry_by_name}`} />} placement="bottom">
					<span className={childLabelStyle} dangerouslySetInnerHTML={{ __html: entryBy }} />
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

		const admins = row.follow_ups_data.filter((f) => f.role === "Administrator").map((m) => m.full_name);
		const teams = row.follow_ups_data.filter((f) => f.role !== "Administrator").map((m) => m.full_name);

		const spaceX = admins.length && teams.length ? "space-x-2.5" : "space-x-0";
		const avatarWrapper = style + " !flex-row " + spaceX;
		const nextFollowUpRemaining = dayjs(row.next_follow_up_on).diff(dayjs().format("DD MMM, YYYY"), "day");

		const followUpRemainingText = nextFollowUpRemaining === 1 ? "Tomorrow" : nextFollowUpRemaining === 0 ? "Today. Did you follow up?" : nextFollowUpRemaining < 0 ? Math.abs(nextFollowUpRemaining) + " days ago" : "After " + nextFollowUpRemaining + " days";

		return (
			<div className="flex w-full py-3 justify-center items-center contrast-background bottom-border font-regular-10 black-text relative" key={row.id}>
				<span className={fancyRightBorderStyle} />

				{uiClientAndInquiryDate(childStyle, row, style)}

				{uiContactDetails(childStyle, row, style)}

				{uiProjects(childLabelStyle, parentLabelStyle, row, style)}

				<span className={avatarWrapper}>
					<AvatarCircle names={admins} />
					{admins.length && teams.length ? <span className="text-gray-300">|</span> : <></>}
					<AvatarCircle names={teams} />
				</span>

				{uiQuote(row, style)}

				<div className={style}>
					<span className="font-bold-12">{row.next_follow_up_on}</span>
					{row.next_follow_up_on && <span className={getFollowUpRemainingColour(nextFollowUpRemaining)}>{followUpRemainingText}</span>}
				</div>

				{uiStatus(childStyle, row, style)}

				{uiReferences(childLabelStyle, parentLabelStyle, row, style)}
			</div>
		);
	}

	function uiSearch() {
		if (inquiriesCopySize) {
			return <TextInputNative2 id="searchBox" icon={faSearch} onChange={(e) => setInputs("search", e.target.value)} onClearButtonClick={() => setInputs("search", "")} placeholder="Find" showClearButton={showFindClearButton} tabIndex={3} value={filter.search} width="w-36" />;
		}
	}

	function uiSkeletion(index) {
		return (
			<div className="flex w-full py-3 justify-center items-center contrast-background bottom-border relative animate-pulse" key={index}>
				<div className="absolute w-3 h-12.5 rounded-tr-full rounded-br-full bg-gray-200 -left-1" />
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
				return <FontAwesomeIcon className="text-white" icon={faSortAmountDesc} size="sm" />;
			} else {
				return <FontAwesomeIcon className="text-white" icon={faSortAmountAsc} size="sm" />;
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

		const wrapper = "flex w-[94px] space-x-2.5 justify-between items-center focus:outline-none relative z-40 font-medium-10 " + getStatusSeverity(row.status);

		const icon = !isConfirmed && <FontAwesomeIcon icon={faChevronDown} size="xs" />;

		const { firstRow, total } = getTotalNotesByInquiry(row.id);
		const notesWrapper = total > 0 ? "cursor-pointer primary-text" : "cursor-default black-text";

		return (
			<Tippy content={<Tooltip text={row.closure_reason} />} disabled={row.is_closed === 0 && !row.closure_reason} placement="bottom">
				<Menu as="div" className="flex w-full space-x-2 justify-center items-center relative">
					<MenuButton className={wrapper}>
						<span dangerouslySetInnerHTML={{ __html: highlightText(true, row.status) }} />
						{icon}
					</MenuButton>
					<Tippy content={<Tooltip text={firstRow} />} disabled={!firstRow} placement="bottom">
						<span className={notesWrapper} onClick={() => total && toggleNotesView(row, true)}>
							<BadgeSmallWithBackground style={getStatusSeverityBackground(row.status)} value={total} />
						</span>
					</Tippy>
					{!isConfirmed && <MenuItems className="absolute w-full top-7 right-0 origin-top-right rounded contrast-background bottom-shadow focus:outline-none z-60 full-border">{uiStatusMenuList(row)}</MenuItems>}
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
					<MenuItem as="div" className="p-2 space-x-2.5 cursor-pointer border-y border-gray-300 font-regular-10 black-text text-left hovered-rows" key={i} onClick={() => prepareInquiryStatusChangeData(row, m)}>
						<span>{label}</span>
					</MenuItem>
				);
			});
	}

	function uiToDate() {
		if (inquiriesCopySize) {
			return (
				<div className="flex w-36 h-7.5 px-2.5 space-x-1 justify-center items-center rounded bottom-shadow contrast-background">
					<FontAwesomeIcon className="primary-text" icon={faCalendar} size="sm" />
					<ReactDatePicker className="w-20 h-6 bg-transparent outline-none font-regular-10" dateFormat="dd-MM-YYYY" dropdownMode="select" endDate={filter.to} onChange={(e) => setInputs("to", e)} placeholderText="To" peekNextMonth selected={filter.to} selectsEnd startDate={filter.to} showMonthDropdown showYearDropdown tabIndex={2} />
					<FontAwesomeIcon className={showToDateClearButton} onClick={() => setInputs("to", "")} icon={faMultiply} />
				</div>
			);
		}
	}

	function uiTotalQuote() {
		return (
			<div className="group relative flex items-center w-fit px-0 transition-all duration-500 ease-in-out">
				<div className="absolute inset-0 rounded-full bg-linear-to-r from-emerald-600 via-emerald-500 to-emerald-400 border border-emerald-700 shadow-md z-0" />

				<div className="flex items-center justify-center w-10 h-10 group-hover:h-9 rounded-full text-white ring-emerald-700 group-hover:ring-0 transition-all duration-500 ease-in-out relative z-20 shrink-0">
					<FontAwesomeIcon icon={faIndianRupee} size="1x" />
				</div>

				<div className="transition-all duration-500 ease-in-out max-w-0 overflow-hidden group-hover:max-w-75">
					<div className="pl-2 pr-4 text-white font-bold-12 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out relative z-20">{getTotalQuote()}</div>
				</div>
			</div>
		);
	}

	// Hooks
	useEffect(() => {
		getSupportData();
		globalThis.addEventListener("keydown", detectKeystrokes);

		return () => {
			if (rangeChangeTimeoutReference.current) {
				clearTimeout(rangeChangeTimeoutReference.current);
			}

			if (goToTopAnimationFrameReference.current) {
				cancelAnimationFrame(goToTopAnimationFrameReference.current);
			}

			setModuleProps(thisView, "");
			localStorage.removeItem("inquiriesScrollPosition");
			globalThis.removeEventListener("keydown", detectKeystrokes);
		};
	}, []);

	useEffect(() => {
		if (mounted.mainComponent) {
			const filtered = doFiltering(inquiries.copy);
			setInquiries((s) => ({ ...s, data: filtered }));
		}
	}, [filter, main.isStatus]);

	useEffect(() => {
		if (mounted.mainComponent) {
			if (Object.keys(main.selectedInquiryForStatusChange).length) {
				toggleUpdateStatus(true);
			}
		}
	}, [main.selectedInquiryForStatusChange]);

	useEffect(() => {
		if (mounted.addQuotation || mounted.editQuotation || mounted.editInquiry || mounted.newInquiry || mounted.newProject || mounted.notes) return;
		if (!shouldRestoreScrollPosition) return;

		const animationFrame = globalThis.requestAnimationFrame(() => {
			restoreInquiriesScrollPosition();
			setShouldRestoreScrollPosition(false);
		});

		return () => globalThis.cancelAnimationFrame(animationFrame);
	}, [mounted.addQuotation, mounted.editQuotation, mounted.editInquiry, mounted.newInquiry, mounted.newProject, mounted.notes, shouldRestoreScrollPosition, sortedInquiries.length]);

	return (
		<div className="flex flex-col w-full h-full items-center-safe">
			{uiMain()}

			{mounted.updateStatus && <DynUpdateStatus inquiry={main.selectedInquiryForStatusChange} mount={mounted.updateStatus} reload={getSupportData} unmount={toggleUpdateStatus} />}
		</div>
	);
}
