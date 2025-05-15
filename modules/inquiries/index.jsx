"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getScrollPosition, MyGlobal, saveScrollPosition } from "@/utilities/global";
import { AvatarCircle, Badge, BadgeSmallWithBackground, Tooltip } from "@/components/Elements";
import { faCalendar, faChevronDown, faFileDownload, faFileExcel, faFilter, faIndianRupee, faMultiply, faPlusCircle, faReceipt, faSearch, faSortAmountAsc, faSortAmountDesc } from "@fortawesome/free-solid-svg-icons";

const DynamicEditInquiry = dynamic(() => import("./EditInquiry"), { ssr: false });
const DynamicMyInquiries = dynamic(() => import("./MyInquiries"), { ssr: false });
const DynamicNotes = dynamic(() => import("./Notes"), { ssr: false });
const DynamicNewInquiry = dynamic(() => import("./NewInquiry"), { ssr: false });
const DynamicNewProject = dynamic(() => import("../projects/NewProject"), { ssr: false });
const DynamicNewQuotation = dynamic(() => import("./NewQuotation"), { ssr: false });
const DynamicUpdateStatus = dynamic(() => import("@/modals/inquiries/miscellaneous").then((t) => ({ default: t.UpdateStatus })), { ssr: false });

function filterMergedInquiries(data, { from, to, findText }) {
	const isSearchFilterActive = !!findText;
	const isDateFilterActive = !!from && !!to;

	const lowerText = isSearchFilterActive ? findText.toLowerCase() : null;
	const startDate = isDateFilterActive ? new Date(from).getTime() : null;
	const endDate = isDateFilterActive ? new Date(to).getTime() : null;

	const filtered = [];

	for (let i = 0; i < data.length; i++) {
		const item = data[i];

		// ✅ Date filter
		if (isDateFilterActive) {
			const entryTime = new Date(item.entry_date).getTime();
			if (isNaN(entryTime) || entryTime < startDate || entryTime > endDate) continue;
		}

		// ✅ Text filter
		if (isSearchFilterActive) {
			let found = false;
			const fields = [
				item.client_id,
				item.client_name,
				item.phone_number,
				item.main_project,
				item.sub_project,
				item.reference_id,
				item.reference_name,
				item.follow_ups,
				item.follow_ups_initials,
				item.quote,
				item.status,
				item.notes,
				item.entry_by_name,
			];

			for (let j = 0; j < fields.length; j++) {
				const val = fields[j];

				if (val && String(val).toLowerCase().includes(lowerText)) {
					found = true;
					break; // 🧠 short-circuit!
				}
			}

			if (!found) continue;
		}

		filtered.push(item);
	}

	return filtered;
}

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

	const allowQuotation = MyGlobal.HasPermission(MyConstants.Modules.Derived.Quotation);

	const headers = useMemo(() => MyConstants.TableHeaders.Inquiries, []);
	const statuses = useMemo(() => MyConstants.Statuses.Inquiries, []);

	const thisView = MyConstants.Modules.Base.Inquiries;
	const isAdministrator = MyGlobal.IsUserAdministrator();
	const newInquiryButton = MyGlobal.HasPermission(MyConstants.Modules.Derived.NewInquiry) ? "block space-x-1.5 primary-button-transparent-background" : "hidden";

	const currentScrollPositionReference = useRef(null); // prevents multiple restorations

	const showFromDateClearButton = useMemo(() => (main.filter.from ? "cursor-pointer primary-text" : "hidden"), [main.filter.from]);
	const showToDateClearButton = useMemo(() => (main.filter.to ? "cursor-pointer primary-text" : "hidden"), [main.filter.to]);
	const showFindClearButton = useMemo(() => (main.findText ? "cursor-pointer primary-text" : "hidden"), [main.findText]);

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

	const doExcelExport = useCallback(() => {
		const records = [];
		const _records = [];

		const columnsWidth = [];
		const dataHeaders = [];

		const rowHeight = 34;
		const maximumColumnWidth = 20;

		const rowHeaders = Object.values(headers);
		const blankRows = [{ span: rowHeaders.length, height: rowHeight, colSpan: 2 }];

		sortedData.forEach((fe) => {
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
	}, []);

	const doSorting = useCallback(
		(data) => {
			const { column, isAscending } = main.sort;

			// If no sort column specified, just return data in original order or sorted by ID
			if (!column) {
				return [...data].sort((a, b) => b.id - a.id);
			}

			// Create a sort function map for better organization and performance
			const sortFunctions = {
				[headers.Client]: (a, b) => (isAscending ? a.client_name.localeCompare(b.client_name) : b.client_name.localeCompare(a.client_name)),
				[headers.Projects]: (a, b) => (isAscending ? a.main_project.localeCompare(b.main_project) : b.main_project.localeCompare(a.main_project)),
				[headers.References]: (a, b) => (isAscending ? a.reference_name.localeCompare(b.reference_name) : b.reference_name.localeCompare(a.reference_name)),
				[headers.FollowUps]: (a, b) => (isAscending ? a.follow_ups.localeCompare(b.follow_ups) : b.follow_ups.localeCompare(a.follow_ups)),
				[headers.Quote]: (a, b) => (isAscending ? a.quote - b.quote : b.quote - a.quote),
				[headers.Status]: (a, b) => (isAscending ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status)),
				default: (a, b) => b.id - a.id,
			};

			// Use the appropriate sort function or default
			const sortFunction = sortFunctions[column] || sortFunctions.default;

			// Return sorted data
			return [...data].sort(sortFunction);
		},
		[main.sort, headers],
	);

	function downloadQuotation(quotationId) {
		const link = document.createElement("a");
		const fileName = String(quotationId).replace("/", "_").replace("/", "_");

		link.href = `/quotations/${fileName}.pdf`;
		link.download = `${fileName}.pdf`;

		link.click();
	}

	const sortedData = useMemo(() => doSorting(api.inquiries.data), [api.inquiries.data, doSorting]);

	function getIconOrBadge() {
		return api.inquiries.data.length > 0 && <Badge value={getRowsCount()} />;
	}

	async function getInquiries(supportData) {
		setMain((s) => ({ ...s, isLoading: true }));

		try {
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

					const client = supportData.clients.find((f) => f.id == obj.client_id);

					if (typeof client === "object") {
						if (client.is_edited == 1) {
							phoneNumber = client.phone_number;
						}
					}

					const nextfollowUpOn = supportData?.notes?.filter((f) => f.inquiry_id == obj.id);

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

				const filtered = filterMergedInquiries(merged, {
					from: main.filter.from,
					to: main.filter.to,
					findText: main.findText,
				});

				setApi((s) => ({ ...s, inquiries: { ...s.inquiries, copy: revisedCopy, data: filtered, mergedWithNotes: merged } }));
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

	const mergeInquiriesAndNotesById = useCallback(
		(inquiries) => {
			// Early return if no data
			if (!inquiries.length || !api.notes.length) return inquiries;

			// Create a notes lookup map (much faster than repeated array searches)
			const notesMap = {};
			api.notes.forEach((note) => {
				if (!notesMap[note.inquiry_id]) {
					notesMap[note.inquiry_id] = note.content;
				} else {
					notesMap[note.inquiry_id] += `\n${note.content}`;
				}
			});

			// Map inquiries with their notes in one pass
			return inquiries.map((inquiry) => {
				return {
					...inquiry,
					notes: notesMap[inquiry.id] || "",
				};
			});
		},
		[api.notes],
	);

	const openEmailAddress = useCallback((emailAddress) => {
		globalThis.window.open(`mailto://${emailAddress}`, "_blank");
	}, []);

	const openWhatsAppWeb = useCallback((phoneNumber) => {
		globalThis.window.open(`https://wa.me/1${phoneNumber}`, "_blank");
	}, []);

	const prepareInquiryStatusChangeData = useCallback((inquiry, newStatus) => {
		setMain((s) => ({ ...s, selectedInquiryForStatusChange: { ...inquiry, new_status: newStatus } }));
	}, []);

	function setInputs(key, value) {
		if (key == "from" || key == "to") {
			setMain((s) => ({ ...s, filter: { ...s.filter, [key]: value } }));
		} else {
			setMain((s) => ({ ...s, [key]: value }));
		}
	}

	const setSort = useCallback((header) => {
		if (header != headers.Contacts) {
			setMain((s) => ({ ...s, sort: { column: header, isAscending: !main.sort.isAscending } }));
		}
	}, []);

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

	const reloadSupportData = useCallback(() => {
		setSupportData();
	}, []);

	const toggleAddQuotation = useCallback((inquiry, type) => {
		const client = api.clients.find((f) => f.id === inquiry.client_id);
		const obj = { ...inquiry, client };

		setMain((s) => ({ ...s, selectedInquiryForNotes: obj }));
		setMounted((s) => ({ ...s, addQuotation: type }));
	}, []);

	const toggleEditInquiryView = useCallback((inquiry, type) => {
		setMain((s) => ({ ...s, selectedInquiryForNotes: inquiry }));
		setMounted((s) => ({ ...s, editInquiry: type }));
	}, []);

	const toggleNewInquiryView = useCallback(() => {
		setMounted((s) => ({ ...s, newInquiry: !s.newInquiry }));
	}, []);

	const toggleNotesView = useCallback((inquiry, type) => {
		setMain((s) => ({ ...s, selectedInquiryForNotes: inquiry }));
		setMounted((s) => ({ ...s, notes: type }));
	}, []);

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

	const handleRangeChange = useCallback((range) => {
		saveScrollPosition("inquiries", range.startIndex); // topmost visible item index
	}, []);

	// Memoized
	const Headers = memo(function renderHeaders({ headers, main, setSort, uiSortArrows, uiStatusFilter }) {
		return Object.values(headers).map((m, i) => {
			const showSortArrow = m == main.sort.column ? "block" : "hidden";
			const showStatusFilter = m == headers.Status ? "block" : "hidden";
			return (
				<span className="flex w-[12.50%] cursor-pointer justify-center items-center font-medium-10" key={i}>
					<div className="flex w-full space-x-2 justify-center items-center text-white" onClick={() => setSort(m)}>
						<span>{m}</span>
						<span className={showSortArrow}>{uiSortArrows(m)}</span>
					</div>
					<span className={showStatusFilter}>{uiStatusFilter(m)}</span>
				</span>
			);
		});
	});

	const Rows = memo(function renderRows({
		row,
		main,
		statuses,
		getStatusSeverityBackground,
		getStatusSeverityBackground2,
		MyGlobal,
		toggleEditInquiryView,
		openWhatsAppWeb,
		openEmailAddress,
		toggleAddQuotation,
		toggleNotesView,
		getTotalNotesByInquiry,
		uiStatusMenu,
		uiNotes,
	}) {
		const style = "flex flex-col w-[12.50%] justify-center items-center text-center";
		const childStyle = "flex w-full justify-center items-center";

		const fancyRightBorderStyle = "absolute w-3 h-[50px] rounded-tr-full rounded-br-full " + getStatusSeverityBackground2(row.status) + " -left-1";

		const parentLabelStyle = childStyle + " font-bold-12";
		const childLabelStyle = childStyle + " gray-text";

		const avatarWrapper = style + " !flex-row space-x-1";

		const followUpsNames = String(row.follow_ups).split(",");

		return (
			<div className="flex w-full py-3 justify-center items-center contrast-background bottom-border font-regular-10 black-text relative" key={row.id}>
				<span className={fancyRightBorderStyle} />

				{uiClientAndInquiryDate(childStyle, main.findText, getStatusSeverityBackground, MyGlobal, row, statuses, style, toggleEditInquiryView)}

				{uiContactDetails(childStyle, main.findText, MyGlobal, openEmailAddress, openWhatsAppWeb, row, style)}

				{uiProjects(childLabelStyle, main.findText, MyGlobal, parentLabelStyle, row, style)}

				<span className={avatarWrapper}>
					<AvatarCircle names={followUpsNames} />
				</span>

				{uiQuote(childStyle, main.findText, MyGlobal, row, style, toggleAddQuotation, uiAddQuotation, uiDownloadQuotation)}

				<span className={`${style} font-bold-12`}>{row.next_follow_up_on}</span>

				{uiStatus(childStyle, getStatusSeverityBackground, getTotalNotesByInquiry, row, style, uiNotes, uiStatusMenu, toggleNotesView)}

				{uiReferences(childLabelStyle, main.findText, MyGlobal, parentLabelStyle, row, style)}
			</div>
		);
	});

	const uiBody = useMemo(() => {
		if (main.isLoading) {
			return (
				<div className="flex flex-col w-full h-full justify-center items-start full-border relative">
					<div className="flex w-full h-9 justify-center items-center primary-background animate-pulse">
						{Object.values(headers).map((_, i) => (
							<div key={i} className="flex w-[12.50%] justify-center items-center">
								<div className="h-4 w-20 bg-gray-200 rounded" />
							</div>
						))}
					</div>
					<div className="w-full h-full overflow-y-auto contrast-background">{[...Array(9)].map((_, i) => uiSkeletion(i))}</div>
				</div>
			);
		} else if (!api.inquiries.copy.length) {
			return <div className={blankDataWrapper}>No inquiries generated.</div>;
		} else if (!api.inquiries.data.length) {
			return <div className={blankDataWrapper}>No inquiries found.</div>;
		} else {
			return (
				<div className="flex flex-col w-full h-full justify-center items-start full-border relative">
					<div className="flex w-full h-9 justify-center items-center primary-background">
						<Headers headers={headers} main={main} setSort={setSort} uiSortArrows={uiSortArrows} uiStatusFilter={uiStatusFilter} />
					</div>
					<Virtuoso
						ref={currentScrollPositionReference}
						rangeChanged={handleRangeChange}
						className="w-full h-full overflow-y-auto contrast-background"
						data={api.inquiries.data}
						itemContent={(_, row) => (
							<Rows
								row={row}
								main={main}
								statuses={statuses}
								getStatusSeverityBackground={getStatusSeverityBackground}
								getStatusSeverityBackground2={getStatusSeverityBackground2}
								MyGlobal={MyGlobal}
								toggleEditInquiryView={toggleEditInquiryView}
								openWhatsAppWeb={openWhatsAppWeb}
								openEmailAddress={openEmailAddress}
								toggleAddQuotation={toggleAddQuotation}
								toggleNotesView={toggleNotesView}
								getTotalNotesByInquiry={getTotalNotesByInquiry}
								uiStatusMenu={uiStatusMenu}
								uiNotes={uiNotes}
							/>
						)}
						totalCount={api.inquiries.data.length}
						overscan={20}
						components={{
							Footer: () => (
								<div className="fixed bottom-2.5 right-2.5 space-x-2.5 px-5 py-1 flex justify-between items-center rounded-tr-full rounded-br-full green-background-transparent-01 green-border">
									<span className="text-white flex justify-center items-center w-10 h-10 rounded-full green-background absolute -left-5">
										<FontAwesomeIcon icon={faIndianRupee} />
									</span>
									<span className="text-center green-text font-bold-12">{getTotalQuote()}</span>
								</div>
							),
						}}
					/>
				</div>
			);
		}
	}, [
		main.isLoading,
		api.inquiries.copy.length,
		api.inquiries.data.length,
		headers,
		main,
		setSort,
		uiSortArrows,
		uiStatusFilter,
		api.inquiries.data,
		statuses,
		isAdministrator,
		getStatusSeverityBackground,
		getStatusSeverityBackground2,
		MyGlobal,
		toggleEditInquiryView,
		openWhatsAppWeb,
		openEmailAddress,
		toggleAddQuotation,
		toggleNotesView,
		getTotalNotesByInquiry,
		uiStatusMenu,
		uiNotes,
		getTotalQuote,
		blankDataWrapper,
	]);

	// UI Components
	function uiAddQuotation(row, toggleAddQuotation) {
		if (isAdministrator || allowQuotation) {
			return (
				<Tippy animation="shift-away" content={<Tooltip text="Add a quotation for this inquiry." />} placement="bottom">
					<FontAwesomeIcon className="cursor-pointer green-text" icon={faReceipt} onClick={() => toggleAddQuotation(row, true)} size="xs" />
				</Tippy>
			);
		}
	}

	function uiClientAndInquiryDate(childStyle, findText, getStatusSeverityBackground, MyGlobal, row, statuses, style, toggleEditInquiryView) {
		const clientName = MyGlobal.HighlightText(row.client_name, findText);
		const clientNameTextStyle = row.status == statuses.Confirmed ? "cursor-not-allowed green-text" : "cursor-pointer primary-text";

		const wrapper = style + " font-semibold-12 space-x-2 " + clientNameTextStyle;
		const clientNameStyle = childStyle + " !w-3/4 " + getStatusSeverityBackground(row.status).text;

		return (
			<div className={wrapper}>
				<Tippy content={<Tooltip text={row.client_id_and_name} />} placement="bottom">
					<span className={clientNameStyle} dangerouslySetInnerHTML={{ __html: clientName }} onClick={() => toggleEditInquiryView(row, true)} />
				</Tippy>
				<span className="flex w-full justify-center items-center font-regular-10 gray-text">{row.entry_date}</span>
			</div>
		);
	}

	function uiContactDetails(childStyle, findText, MyGlobal, openEmailAddress, openWhatsAppWeb, row, style) {
		const phoneNumber = MyGlobal.HighlightText(row.phone_number, findText);
		const emailAddress = MyGlobal.HighlightText(row.email_address, findText);

		const phoneNumberStyle = childStyle + " font-bold-10";
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

	function uiDownloadQuotation(row) {
		if (isAdministrator || allowQuotation) {
			const showDownloadButton = row.quotation_id ? "cursor-pointer visible primary-text" : "invisible";

			return (
				<Tippy animation="shift-away" content={<Tooltip text="Download this quotation." />} placement="bottom">
					<FontAwesomeIcon className={showDownloadButton} icon={faFileDownload} onClick={() => downloadQuotation(row.quotation_id)} size="xs" />
				</Tippy>
			);
		}
	}

	function uiExport() {
		if (api.inquiries.data.length && api.inquiries.copy.length) {
			return (
				<button className="primary-button-transparent-background" onClick={doExcelExport}>
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

	function uiMain() {
		if (mounted.addQuotation) {
			return <DynamicNewQuotation clients={api.clients} inquiry={main.selectedInquiryForNotes} reload={reloadSupportData} unmount={toggleAddQuotation} />;
		} else if (mounted.editInquiry) {
			return <DynamicEditInquiry inquiry={main.selectedInquiryForNotes} reload={reloadSupportData} unmount={toggleEditInquiryView} />;
		} else if (mounted.newInquiry) {
			return <DynamicNewInquiry reload={reloadSupportData} unmount={toggleNewInquiryView} />;
		} else if (mounted.newProject) {
			return <DynamicNewProject inquiry={main.selectedInquiryForStatusChange} reload={reloadSupportData} unmount={closeNewProjectView} />;
		} else if (mounted.notes) {
			return <DynamicNotes clients={api.clients} inquiry={main.selectedInquiryForNotes} reload={reloadSupportData} unmount={toggleNotesView} />;
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
					<div className="flex w-full h-full justify-center items-center">{uiBody}</div>
				</>
			);
		}
	}

	function uiNew() {
		return (
			<button className={newInquiryButton} onClick={toggleNewInquiryView}>
				<FontAwesomeIcon icon={faPlusCircle} />
				<span>New</span>
			</button>
		);
	}

	function uiNotes(getStatusSeverityBackground, getTotalNotesByInquiry, row, toggleNotesView) {
		const totalNotes = getTotalNotesByInquiry(row.id);
		const wrapper = totalNotes > 0 ? "cursor-pointer primary-text" : "cursor-default black-text";

		return (
			<span className={wrapper} onClick={() => totalNotes && toggleNotesView(row, true)}>
				<BadgeSmallWithBackground style={getStatusSeverityBackground(row.status)} value={totalNotes} />
			</span>
		);
	}

	function uiProjects(childLabelStyle, findText, MyGlobal, parentLabelStyle, row, style) {
		const mainProject = MyGlobal.HighlightText(row.main_project, findText);
		const subProject = MyGlobal.HighlightText(row.sub_project, findText);

		return (
			<div className={style}>
				<span className={parentLabelStyle} dangerouslySetInnerHTML={{ __html: subProject }} />
				<span className={childLabelStyle} dangerouslySetInnerHTML={{ __html: mainProject }} />
			</div>
		);
	}

	function uiQuote(childStyle, findText, MyGlobal, row, style, toggleAddQuotation, uiAddQuotation, uiDownloadQuotation) {
		const quote = MyGlobal.HighlightText(row.quote, findText);

		const wrapper = style + " !flex-row space-x-2 font-bold-12";
		const quotationBlockStyle = childStyle + " !w-3/5 !justify-start space-x-2.5";

		return (
			<div className={wrapper}>
				<span className="flex w-4/5 justify-end items-center" dangerouslySetInnerHTML={{ __html: MyGlobal.FormatCurrency(quote) }} />
				<div className={quotationBlockStyle}>
					{uiAddQuotation(row, toggleAddQuotation)}
					{uiDownloadQuotation(row)}
				</div>
			</div>
		);
	}

	function uiReferences(childLabelStyle, findText, MyGlobal, parentLabelStyle, row, style) {
		const referenceName = MyGlobal.HighlightText(row.reference_name, findText);
		const entryBy = MyGlobal.HighlightText(row.entry_by_name, findText);

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

	function uiSkeletion(index) {
		return (
			<div className="flex w-full py-3 justify-center items-center contrast-background bottom-border relative animate-pulse" key={index}>
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
		if (main.sort.column == column) {
			if (main.sort.isAscending) {
				return <FontAwesomeIcon className="text-white" icon={faSortAmountDesc} size="sm" />;
			} else {
				return <FontAwesomeIcon className="text-white" icon={faSortAmountAsc} size="sm" />;
			}
		}
	}

	function uiStatus(childStyle, getStatusSeverityBackground, getTotalNotesByInquiry, row, style, uiNotes, uiStatusMenu, toggleNotesView) {
		const wrapper = style + " !flex-row space-x-2";
		const childElementsStyle = childStyle + " !w-fit";

		return (
			<div className={wrapper}>
				<span className={childElementsStyle}>{uiStatusMenu(row)}</span>
				<span className={childElementsStyle}>{uiNotes(getStatusSeverityBackground, getTotalNotesByInquiry, row, toggleNotesView)}</span>
			</div>
		);
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
		if (!mounted.notes && currentScrollPositionReference.current) {
			const savedIndex = getScrollPosition("inquiries");
			currentScrollPositionReference.current.scrollToIndex({
				index: savedIndex,
				align: "nearest",
				behavior: "auto", // or "smooth" if you like
			});
		}
	}, [mounted.notes]);

	useEffect(() => {
		// Only run filtering when mergedWithNotes is available
		if (api.inquiries.mergedWithNotes.length) {
			const filtered = filterMergedInquiries(api.inquiries.mergedWithNotes, {
				from: main.filter.from,
				to: main.filter.to,
				findText: main.findText,
			});

			setApi((s) => ({
				...s,
				inquiries: {
					...s.inquiries,
					data: filtered,
				},
			}));
		}
	}, [main.findText, main.filter, api.inquiries.mergedWithNotes]);

	useEffect(() => {
		if (mounted.mainComponent) {
			if (Object.keys(main.selectedInquiryForStatusChange).length) {
				toggleUpdateStatus(true);
			}
		}
	}, [main.selectedInquiryForStatusChange]);

	if (mounted.myInquiries) {
		return <DynamicMyInquiries presetStatus={presetStatus} setModuleProps={setModuleProps} unmount={closeMyInquiries} />;
	}

	return (
		<div className="flex flex-col w-full h-full justify-start items-center primary-light-background">
			{uiMain()}

			{mounted.updateStatus && <DynamicUpdateStatus inquiry={main.selectedInquiryForStatusChange} mount={mounted.updateStatus} reload={reloadSupportData} unmount={toggleUpdateStatus} />}
		</div>
	);
}
