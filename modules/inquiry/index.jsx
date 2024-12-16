"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import "react-datepicker/dist/react-datepicker.css";

import axios from "axios";
import dayjs from "dayjs";
import Tippy from "@tippyjs/react";
import NewInquiry from "./NewInquiry";
import InquiryNotes from "./InquiryNotes";
import writeXlsxFile from "write-excel-file";
import ReactDatePicker from "react-datepicker";
import MyConstants from "@/utilities/constants";

import { Virtuoso } from "react-virtuoso";
import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { TextInputNative } from "@/components/Inputs";
import { ChangeStatus, CloseInquiry } from "@/modals/Inquiry";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Badge, BadgeSmallWithBackground, SpinnerBig, Tooltip, TooltipList } from "@/components/Elements";
import {
	faBolt,
	faCalendar,
	faChevronDown,
	faFileExcel,
	faFilter,
	faMultiply,
	faPlusCircle,
	faSearch,
	faSortAmountAsc,
	faSortAmountDesc,
} from "@fortawesome/free-solid-svg-icons";
import EditInquiry from "./EditInquiry";

export default function Inquiry() {
	// Business Logic
	const [data, setData] = useState({
		allMainProjects: [],
		allNotes: [],
		allReferences: [],
		allSubProjects: [],
		clients: { all: [], confirmed: [] },
		entryDate: { from: "", to: "" },
		hasMounted: false,
		inquiries: { api: [], apiCopy: [], mergedWithNotes: [] },
		isLoading: false,
		searchTerm: "",
		selectedInquiryForNotes: {},
		selectedInquiryForStatusChange: {},
		sort: { column: "", isAscending: false },
	});

	const [hasMounted, setHasMounted] = useState({
		changeStatus: false,
		closeInquiry: false,
		convertToProject: false,
		editInquiry: false,
		newInquiry: false,
		newProject: false,
		notes: false,
	});

	const allowConvertingToProject = MyGlobal.HasPermission(MyConstants.Modules.Derived.ConvertInquiryToProject);

	const STATUSES = MyConstants.Statuses.Inquiries;
	const HEADERS = MyConstants.TableHeaders.Inquiries;
	const thisView = MyConstants.Modules.Base.Inquiries;

	const newInquiryButton = MyGlobal.HasPermission(MyConstants.Modules.Derived.NewInquiry)
		? "block space-x-1.5 primary-button-transparent-background"
		: "hidden";

	const showFromDateClearButton = data.entryDate.from ? "cursor-pointer primary-text" : "hidden";
	const showToDateClearButton = data.entryDate.to ? "cursor-pointer primary-text" : "hidden";
	const showFindClearButton = data.searchTerm ? "cursor-pointer primary-text" : "hidden";

	const blankDataWrapper = "flex w-full h-full justify-center items-center font-regular-12 gray-text black-white-background full-border";

	// Functions
	const detectKeystrokes = (event) => {
		switch (true) {
			case event.ctrlKey && event.key == "f":
				event.preventDefault();
				document.getElementById("searchBox").focus();
				break;
		}
	};

	const doFiltering = (query) => {
		const filteredData = data.inquiries.mergedWithNotes.filter((inquiry) => {
			if (query == "date") {
				const checkDate = new Date(inquiry.entry_date);
				const startDate = data.entryDate.from;
				const endDate = data.entryDate.to;

				if (checkDate >= startDate && checkDate <= endDate) {
					return inquiry;
				}
			} else {
				const searchTerm = data.searchTerm.toLowerCase();

				const client = data.clients.all.filter((client) => client.id == inquiry.client_id).at(0);
				const clientId = String(client.id).toLowerCase();
				const clientName = String(getClientName(client.id)).toLowerCase();

				const createdBy = MyGlobal.GetAnyDataFromId(inquiry.created_by, "full_name");
				const _createdBy = String(createdBy).toLowerCase();

				const reference = data.allReferences.filter((reference) => reference.id == inquiry.reference_id).at(0);
				const referenceId = String(reference.id).toLowerCase();
				const referenceName = String(getReferenceName(inquiry.reference_id)).toLowerCase();

				const followUpsNames = MyGlobal.GetAnyDataFromId(inquiry.follow_ups, "full_name");
				const followUpsInitials = getFollowUpsInitials(followUpsNames);

				const mainProject = String(getMainProjectName(inquiry.main_project_id)).toLowerCase();
				const notes = String(inquiry.notes).toLowerCase();
				const status = String(inquiry.status).toLowerCase();
				const subProject = String(getSubProjectName(inquiry.sub_project_id)).toLowerCase();

				return (
					clientId.includes(searchTerm) ||
					clientName.includes(searchTerm) ||
					String(inquiry.contact_number).includes(searchTerm) ||
					mainProject.includes(searchTerm) ||
					subProject.includes(searchTerm) ||
					referenceId.includes(searchTerm) ||
					referenceName.includes(searchTerm) ||
					followUpsInitials.includes(searchTerm) ||
					followUpsNames.includes(searchTerm) ||
					String(inquiry.quote).includes(searchTerm) ||
					status.includes(searchTerm) ||
					notes.includes(searchTerm) ||
					_createdBy.includes(searchTerm)
				);
			}
		});

		setData((old) => ({ ...old, inquiries: { ...old.inquiries, api: filteredData } }));
	};

	const doSorting = () => {
		return data.inquiries.api.sort((a, b) => {
			const aClient = getClientName(a.client_id);
			const bClient = getClientName(b.client_id);

			const aCreatedBy = MyGlobal.GetAnyDataFromId(a.created_by, "full_name");
			const bCreatedBy = MyGlobal.GetAnyDataFromId(b.created_by, "full_name");

			const aEntryDate = new Date(a.entry_date);
			const bEntryDate = new Date(b.entry_date);

			const aMainProject = getMainProjectName(a.main_project_id);
			const bMainProject = getMainProjectName(b.main_project_id);

			const aNotesCount = getTotalNotesByInquiry(a.id);
			const bNotesCount = getTotalNotesByInquiry(b.id);

			const aReference = data.allReferences.filter((reference) => reference.id == a.reference_id).at(0).name;
			const bReference = data.allReferences.filter((reference) => reference.id == b.reference_id).at(0).name;

			const aSubProject = getSubProjectName(a.sub_project_id);
			const bSubProject = getSubProjectName(b.sub_project_id);

			if (data.sort.column == HEADERS.EntryDate && data.sort.isAscending) {
				return aEntryDate - bEntryDate;
			} else if (data.sort.column == HEADERS.EntryDate && !data.sort.isAscending) {
				return bEntryDate - aEntryDate;
			} else if (data.sort.column == HEADERS.Client && data.sort.isAscending) {
				return aClient.localeCompare(bClient);
			} else if (data.sort.column == HEADERS.Client && !data.sort.isAscending) {
				return bClient.localeCompare(aClient);
			} else if (data.sort.column == HEADERS.MainProject && data.sort.isAscending) {
				return aMainProject.localeCompare(bMainProject);
			} else if (data.sort.column == HEADERS.MainProject && !data.sort.isAscending) {
				return bMainProject.localeCompare(aMainProject);
			} else if (data.sort.column == HEADERS.SubProject && data.sort.isAscending) {
				return aSubProject.localeCompare(bSubProject);
			} else if (data.sort.column == HEADERS.SubProject && !data.sort.isAscending) {
				return bSubProject.localeCompare(aSubProject);
			} else if (data.sort.column == HEADERS.Reference && data.sort.isAscending) {
				return aReference.localeCompare(bReference);
			} else if (data.sort.column == HEADERS.Reference && !data.sort.isAscending) {
				return bReference.localeCompare(aReference);
			} else if (data.sort.column == HEADERS.FollowUps && data.sort.isAscending) {
				return a.follow_ups.localeCompare(b.follow_ups);
			} else if (data.sort.column == HEADERS.FollowUps && !data.sort.isAscending) {
				return b.follow_ups.localeCompare(a.follow_ups);
			} else if (data.sort.column == HEADERS.Quote && data.sort.isAscending) {
				return a.quote - b.quote;
			} else if (data.sort.column == HEADERS.Quote && !data.sort.isAscending) {
				return b.quote - a.quote;
			} else if (data.sort.column == HEADERS.Status && data.sort.isAscending) {
				return a.status.localeCompare(b.status);
			} else if (data.sort.column == HEADERS.Status && !data.sort.isAscending) {
				return b.status.localeCompare(a.status);
			} else if (data.sort.column == HEADERS.Notes && data.sort.isAscending) {
				return aNotesCount - bNotesCount;
			} else if (data.sort.column == HEADERS.Notes && !data.sort.isAscending) {
				return bNotesCount - aNotesCount;
			} else if (data.sort.column == HEADERS.CreatedBy && data.sort.isAscending) {
				return aCreatedBy.localeCompare(bCreatedBy);
			} else if (data.sort.column == HEADERS.CreatedBy && !data.sort.isAscending) {
				return bCreatedBy.localeCompare(aCreatedBy);
			} else {
				return b.id - a.id;
			}
		});
	};

	const exportAsExcel = () => {
		const records = [];
		const _records = [];

		const columnsWidth = [];
		const dataHeaders = [];

		const rowHeight = 34;
		const maximumColumnWidth = 20;

		const rowHeaders = Object.values(HEADERS);
		const blankRows = [{ span: rowHeaders.length, height: rowHeight, colSpan: 2 }];

		doSorting().forEach((inquiry) => {
			const entryDate = dayjs(inquiry.entry_date).format("DD MMM, YYYY");
			const clientDetails = `${inquiry.client_id}\n${getClientName(inquiry.client_id)}`;

			const followUps = MyGlobal.GetAnyDataFromId(inquiry.follow_ups, "full_name");
			const _followUps = String(followUps).replace(",", "\n");

			const referenceName = data.allReferences.filter((reference) => reference.id == inquiry.reference_id).at(0).name;
			const referenceDetails = `${inquiry.reference_id}\n${referenceName}`;

			records.push(
				entryDate,
				clientDetails,
				inquiry.contact_number,
				getMainProjectName(inquiry.main_project_id),
				getSubProjectName(inquiry.sub_project_id),
				referenceDetails,
				_followUps,
				inquiry.quote,
				inquiry.status,
				getTotalNotesByInquiry(inquiry.id),
				MyGlobal.GetUserFullName(),
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
				value: `${thisView} (${data.inquiries.api.length})`,
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
	};

	const getClientName = (clientId) => {
		if (data.clients.all.length) {
			return data.clients.all.filter((client) => client.id == clientId).at(0).name;
		} else {
			return "";
		}
	};

	const getFollowUpsInitials = (names) => {
		if (names) {
			let initials = names;

			if (String(names).includes(",")) {
				initials = MyGlobal.GetInitials(names);
			}

			return initials;
		} else {
			return "Ex Employee";
		}
	};

	const getMainProjectName = (mainProjectId) => {
		if (data.allMainProjects.length) {
			return data.allMainProjects.filter((mainProject) => mainProject.id == mainProjectId).at(0).name;
		} else {
			return "";
		}
	};

	const getInquiries = async () => {
		setData((old) => ({ ...old, isLoading: true, hasMounted: false }));

		try {
			const response = await axios.get(MyConstants.ApiEndpoints.Inquiries.GetInquiries, MyGlobal.GetHeaders());

			if (response.status === 200) {
				getSupportData();

				const revised = response.data.map((inquiry) => ({ ...inquiry, notes: "" }));
				setData((old) => ({ ...old, inquiries: { api: revised, apiCopy: revised } }));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Get Inquiries");
		} finally {
			setData((old) => ({ ...old, isLoading: false, hasMounted: true }));
		}
	};

	const getProperCount = () => {
		if (data.inquiries.api.length != data.inquiries.apiCopy.length) {
			return `${data.inquiries.api.length} / ${data.inquiries.apiCopy.length}`;
		} else {
			return data.inquiries.api.length;
		}
	};

	const getReferenceName = (referenceId) => {
		if (data.allReferences.length) {
			return data.allReferences.filter((reference) => reference.id == referenceId).at(0).name;
		} else {
			return "";
		}
	};

	const getStatusSeverity = (status) => {
		switch (status) {
			case STATUSES.Open:
				return "orange-tag-transparent-01";
			case STATUSES.Closed:
				return "gray-tag-transparent-01";
			case STATUSES.Hold:
				return "red-tag-transparent-01";
			case STATUSES.Confirmed:
				return "green-tag-transparent-01 cursor-pointer";
		}
	};

	const getStatusSeverityBackground = (status) => {
		switch (status) {
			case STATUSES.Open:
				return {
					background: "orange-background-transparent-01",
					border: "orange-border",
					text: "orange-text",
				};
			case STATUSES.Closed:
				return {
					background: "gray-background-transparent-01",
					border: "gray-border",
					text: "gray-text",
				};
			case STATUSES.Hold:
				return {
					background: "red-background-transparent-01",
					border: "red-border",
					text: "red-text",
				};
			case STATUSES.Confirmed:
				return {
					background: "green-background-transparent-01",
					border: "green-border",
					text: "green-text",
				};
		}
	};

	const getSubProjectName = (subProjectId) => {
		if (data.allSubProjects.length) {
			return data.allSubProjects.filter((subProject) => subProject.id == subProjectId).at(0).name;
		} else {
			return "";
		}
	};

	const getSupportData = async () => {
		try {
			const response = await axios.get(MyConstants.ApiEndpoints.Inquiries.GetInquiriesSupportData, MyGlobal.GetHeaders());

			if (response.status === 200) {
				const confirmedClients = response.data.clients.filter((client) => client.is_confirmed == 1);

				setData((old) => ({
					...old,
					clients: { all: response.data.clients, confirmed: confirmedClients },
					allMainProjects: response.data.mainProjects,
					allNotes: response.data.notes,
					allReferences: response.data.references,
					allSubProjects: response.data.subProjects,
				}));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Inquiries => Get Required Data");
		}
	};

	const getTotalNotesByInquiry = (inquiryId) => {
		return data.allNotes.filter((note) => note.inquiry_id == inquiryId && note.source == thisView).length;
	};

	const getTotalQuote = () => {
		let total = 0;

		for (const inquiry of data.inquiries.api) {
			total += Number(inquiry.quote);
		}

		return MyGlobal.ThousandSeparator(total);
	};

	const highlightText = (isTag, text) => {
		const regex = new RegExp(data.searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
		const classByTag = isTag ? "highlight-tag-characters" : "highlight-characters";

		let result = text;

		if (data.searchTerm) {
			result = String(text).replace(regex, (match) => `<span class=${classByTag}>${match}</span>`);
		}

		return MyGlobal.StripHtmlTags(result);
	};

	const mergeInquiriesAndNotesById = () => {
		const newArray = [];
		const mergedObject = {};
		const mergedArray = [];

		data.inquiries.apiCopy.forEach((inquiry) => {
			data.allNotes.forEach((_note) => {
				if (inquiry.id == _note.inquiry_id) {
					newArray.push({ id: _note.inquiry_id, notes: _note.content });
				}
			});
		});

		newArray.forEach((_note) => {
			if (!mergedObject[_note.id]) {
				mergedObject[_note.id] = { id: _note.id, notes: _note.notes };
			} else {
				mergedObject[_note.id].notes += `\n${_note.notes}`;
			}
		});

		data.inquiries.apiCopy.forEach((inquiry) => {
			Object.values(mergedObject).forEach((note) => {
				if (inquiry.id == note.id) {
					mergedArray.push({ ...inquiry, notes: note.notes });
				}
			});
		});

		const idsOfInquiries = data.inquiries.apiCopy.map((inquiry) => inquiry.id);
		const idsOfMergedArray = mergedArray.map((inquiry) => inquiry.id);
		const missingIds = idsOfInquiries.filter((inquiryId) => !idsOfMergedArray.includes(inquiryId));

		missingIds.forEach((inquiryId) => {
			const missingObject = data.inquiries.apiCopy.filter((inquiry) => inquiry.id == inquiryId).at(0);
			mergedArray.push(missingObject);
		});

		setData((old) => ({ ...old, inquiries: { ...old.inquiries, mergedWithNotes: mergedArray } }));
	};

	const openWhatsAppWeb = (contactNumber) => {
		globalThis.window.open(`https://wa.me/1${contactNumber}`, "_blank");
	};

	const prepareInquiryStatusChangeData = (inquiry, newStatus) => {
		setData((old) => ({ ...old, selectedInquiryForStatusChange: { ...inquiry, new_status: newStatus } }));
	};

	const setInputs = (key, value) => {
		if (key == "from" || key == "to") {
			setData((old) => ({ ...old, entryDate: { ...old.entryDate, [key]: value } }));
		} else {
			setData((old) => ({ ...old, [key]: value }));
		}
	};

	const setSort = (header) => {
		if (header != HEADERS.ContactNumber) {
			setData((old) => ({ ...old, sort: { column: header, isAscending: !data.sort.isAscending } }));
		}
	};

	const toggleChangeStatus = (value) => {
		if (value) {
			setHasMounted((old) => ({ ...old, changeStatus: true }));
		} else {
			if (data.selectedInquiryForStatusChange.new_status != STATUSES.Closed) {
				setData((old) => ({ ...old, selectedInquiryForStatusChange: {} }));
				setHasMounted((old) => ({ ...old, changeStatus: false }));
			} else {
				setHasMounted((old) => ({ ...old, changeStatus: false, closeInquiry: true }));
			}
		}
	};

	const toggleCloseInquiryBox = (value) => {
		if (value) {
			setHasMounted((old) => ({ ...old, closeInquiry: true }));
		} else {
			setData((old) => ({ ...old, selectedInquiryForStatusChange: {} }));
			setHasMounted((old) => ({ ...old, closeInquiry: false }));
		}
	};

	const toggleEditInquiryView = (inquiry, type) => {
		setData((old) => ({ ...old, selectedInquiryForNotes: inquiry }));
		setHasMounted((old) => ({ ...old, editInquiry: type }));
	};

	const toggleNewInquiryView = () => {
		setHasMounted((old) => ({ ...old, newInquiry: !hasMounted.newInquiry }));
	};

	const toggleNotesView = (inquiry, type) => {
		setData((old) => ({ ...old, selectedInquiryForNotes: inquiry }));
		setHasMounted((old) => ({ ...old, notes: type }));
	};

	// UI Components
	const uiBody = () => {
		if (data.isLoading) {
			return (
				<div className={blankDataWrapper}>
					<SpinnerBig />
				</div>
			);
		} else if (!data.inquiries.apiCopy.length) {
			return <div className={blankDataWrapper}>No inquiries generated.</div>;
		} else if (!data.inquiries.api.length) {
			return <div className={blankDataWrapper}>No inquiries found.</div>;
		} else {
			return (
				<div className="flex flex-col w-full h-full justify-center items-start full-border">
					<div className="flex w-full h-9 justify-center items-center primary-background">{uiHeaders()}</div>
					<Virtuoso
						className="w-full h-full overflow-y-auto bottom-border"
						data={doSorting()}
						itemContent={(index, inquiry) => uiRows(inquiry, index)}
						totalCount={data.inquiries.api.length}
					/>
					<div className="flex w-full h-9 justify-center items-center primary-background">{uiFooter()}</div>
				</div>
			);
		}
	};

	const uiClientName = (clientId, clientName, inquiry) => {
		return (
			<Tippy allowHTML={true} content={<Tooltip text={`${clientId} - ${clientName}`} />}>
				<span dangerouslySetInnerHTML={{ __html: clientName }} onClick={() => toggleEditInquiryView(inquiry, true)} />
			</Tippy>
		);
	};

	const uiExport = () => {
		if (data.inquiries.apiCopy.length) {
			return (
				<button className="space-x-1.5 primary-button-transparent-background" onClick={() => exportAsExcel()}>
					<FontAwesomeIcon className="primary-text" icon={faFileExcel} />
					<span>Export</span>
				</button>
			);
		}
	};

	const uiFollowUps = (inquiry) => {
		const getNames = MyGlobal.GetAnyDataFromId(inquiry.follow_ups, "full_name");
		const singlePersonInitials = MyGlobal.GetInitials(getNames);
		const total = String(getNames).split(",").length;

		if (String(getNames).includes(",")) {
			if (total > 2) {
				return (
					<Tippy allowHTML content={<TooltipList payload={getNames} />}>
						<span className="cursor-help primary-text">{total}</span>
					</Tippy>
				);
			} else {
				return String(getNames)
					.split(",")
					.map((staffName) => uiFollowUpsTooltip(MyGlobal.GetInitials(staffName), inquiry, staffName));
			}
		} else {
			return uiFollowUpsTooltip(singlePersonInitials, inquiry, getNames);
		}
	};

	const uiFollowUpsTooltip = (badgeText, inquiry, tooltipText) => {
		return (
			<Tippy allowHTML content={<Tooltip text={tooltipText} />}>
				<span className="cursor-help">
					<BadgeSmallWithBackground style={getStatusSeverityBackground(inquiry.status)} value={badgeText} />
				</span>
			</Tippy>
		);
	};

	const uiFooter = () => {
		return Object.values(HEADERS).map((label, index) => {
			const showTotalQuote = index == 7 ? "visible" : "invisible";
			const wrapper = `w-1/6 space-x-1 text-center text-white font-medium-10 ${showTotalQuote}`;

			return (
				<span className={wrapper} key={index}>
					<span>{getTotalQuote()}</span>
				</span>
			);
		});
	};

	const uiFromDate = () => {
		if (data.inquiries.apiCopy.length) {
			return (
				<div className="flex w-36 h-[30px] px-2.5 space-x-1 justify-start items-center rounded bottom-shadow black-white-background">
					<FontAwesomeIcon className="primary-text" icon={faCalendar} size="sm" />
					<ReactDatePicker
						className="w-20 h-6 bg-transparent outline-none font-medium-11"
						dateFormat="dd-MM-YYYY"
						dropdownMode="select"
						endDate={data.entryDate.to}
						onChange={(e) => setInputs("from", e)}
						peekNextMonth
						placeholderText="From"
						tabIndex={1}
						selected={data.entryDate.from}
						selectsStart
						startDate={data.entryDate.from}
						showMonthDropdown
						showYearDropdown
					/>
					<FontAwesomeIcon className={showFromDateClearButton} onClick={() => setInputs("from", "")} icon={faMultiply} />
				</div>
			);
		}
	};

	const uiHeaders = () => {
		return Object.values(HEADERS).map((header, index) => {
			const showSortArrow = header == data.sort.column ? "block" : "hidden";
			const showStatusFilter = header == HEADERS.Status ? "block" : "hidden";

			return (
				<span className="flex w-[9.09%] cursor-pointer justify-center items-center font-medium-10" key={index}>
					<div className="flex w-full space-x-2 justify-center items-center text-white" onClick={() => setSort(header)}>
						<span>{header}</span>
						<span className={showSortArrow}>{uiSortArrows(header)}</span>
					</div>
					<span className={showStatusFilter}>{uiStatusFilter(header)}</span>
				</span>
			);
		});
	};

	const uiMain = () => {
		if (hasMounted.editInquiry) {
			return <EditInquiry unmount={toggleEditInquiryView} selectedInquiry={data.selectedInquiryForNotes} reloadInquiries={getInquiries} />;
		} else if (hasMounted.newInquiry) {
			return <NewInquiry reloadInquiries={getInquiries} unmount={toggleNewInquiryView} />;
		} else if (hasMounted.newProject) {
			// return <NewProject adminCompanies={data.adminCompanies} allClients={data.clients.all} allInquiries={data.inquiries.api} close={toggleNewProjectBox} refresh={getInquiries} thisInquiry={data.thisInquiry} />;
		} else if (hasMounted.notes) {
			return (
				<InquiryNotes
					allClients={data.clients.all}
					allNotes={data.allNotes}
					reloadInquiries={getInquiries}
					selectedInquiry={data.selectedInquiryForNotes}
					unmount={toggleNotesView}
				/>
			);
		} else {
			return (
				<>
					<div className="flex w-full px-5 py-2.5 justify-between items-center">
						<div className="flex w-1/5 space-x-2 justify-start items-center">
							<span className="view-heading">{thisView}</span>
							{data.inquiries.api.length > 0 && <Badge value={getProperCount()} />}
						</div>
						<div className="flex w-4/5 space-x-2 justify-end items-center">
							<div className="flex w-1/2 space-x-2 justify-end items-center">
								{uiFromDate()}
								{uiToDate()}
							</div>
							{uiSearch()}
							{uiNew()}
							{uiExport()}
						</div>
					</div>
					<div className="flex w-full h-full justify-center items-center">{uiBody()}</div>
				</>
			);
		}
	};

	const uiNew = () => {
		return (
			<button className={newInquiryButton} onClick={() => toggleNewInquiryView()}>
				<FontAwesomeIcon icon={faPlusCircle} />
				<span>New</span>
			</button>
		);
	};

	const uiNotes = (inquiry) => {
		const totalNotes = getTotalNotesByInquiry(inquiry.id);
		const wrapper = totalNotes > 0 ? "cursor-pointer primary-text" : "cursor-default black-text";

		return (
			<span className={wrapper} onClick={() => totalNotes && toggleNotesView(inquiry, true)}>
				{totalNotes}
			</span>
		);
	};

	const uiRows = (inquiry, rowId) => {
		const style = "flex flex-wrap w-[9.09%] min-h-9 justify-center items-center text-center right-border";

		const clientId = MyGlobal.HighlightText(inquiry.client_id, data.searchTerm);
		const clientName = MyGlobal.HighlightText(getClientName(inquiry.client_id), data.searchTerm);

		const clientNameTextStyle = inquiry.status == STATUSES.Confirmed ? "cursor-not-allowed green-text" : "cursor-pointer primary-text";

		const contactNumber = MyGlobal.HighlightText(inquiry.contact_number, data.searchTerm);
		const mainProject = MyGlobal.HighlightText(getMainProjectName(inquiry.main_project_id), data.searchTerm);
		const subProject = MyGlobal.HighlightText(getSubProjectName(inquiry.sub_project_id), data.searchTerm);

		const referenceId = MyGlobal.HighlightText(inquiry.reference_id, data.searchTerm);
		const referenceName = getReferenceName(inquiry.reference_id) ?? referenceId;
		const _referenceName = MyGlobal.HighlightText(referenceName, data.searchTerm);
		const referenceIdAndName = `${referenceId} - ${referenceName}`;

		const quote = MyGlobal.HighlightText(inquiry.quote, data.searchTerm);

		const createdBy = MyGlobal.GetAnyDataFromId(inquiry.created_by, "full_name");
		const _createdBy = MyGlobal.HighlightText(createdBy, data.searchTerm);
		const createdByIdAndName = `${inquiry.created_by} - ${createdBy}`;

		return (
			<div className="flex w-full justify-center items-center black-white-background bottom-border font-regular-10 black-text" key={rowId}>
				<span className={style}>{dayjs(inquiry.entry_date).format("DD MMM, YYYY")}</span>

				<span className={`${style} space-x-2 ${clientNameTextStyle}`}>{uiClientName(clientId, clientName, inquiry)}</span>

				<span className={`${style} cursor-pointer primary-text`}>
					<Tippy allowHTML={true} content={<Tooltip text={"Open this contact on WhatsApp Web."} />}>
						<span dangerouslySetInnerHTML={{ __html: contactNumber }} onClick={() => openWhatsAppWeb(inquiry.phone)} />
					</Tippy>
				</span>

				<span className={style} dangerouslySetInnerHTML={{ __html: mainProject }} />
				<span className={style} dangerouslySetInnerHTML={{ __html: subProject }} />

				<span className={`${style} cursor-help`}>
					<Tippy allowHTML={true} content={<Tooltip text={referenceIdAndName} />}>
						<span dangerouslySetInnerHTML={{ __html: _referenceName }} />
					</Tippy>
				</span>

				<span className={`${style} space-x-1`}>{uiFollowUps(inquiry)}</span>
				<span className={style} dangerouslySetInnerHTML={{ __html: quote }} />
				<span className={style}>{uiStatusMenu(inquiry)}</span>
				<span className={style}>{uiNotes(inquiry)}</span>

				<span className={`${style} cursor-help`}>
					<Tippy allowHTML={true} content={<Tooltip text={createdByIdAndName} />}>
						<span dangerouslySetInnerHTML={{ __html: _createdBy }} />
					</Tippy>
				</span>
			</div>
		);
	};

	const uiSearch = () => {
		if (data.inquiries.apiCopy.length) {
			return (
				<TextInputNative
					id="searchBox"
					icon={faSearch}
					onChange={(e) => setInputs("searchTerm", e.target.value)}
					onClearButtonClick={() => setInputs("searchTerm", "")}
					placeholder="Search"
					showClearButton={showFindClearButton}
					tabIndex={3}
					value={data.searchTerm}
					width="w-36"
				/>
			);
		}
	};

	const uiSortArrows = (column) => {
		if (data.sort.column == column) {
			if (data.sort.isAscending) {
				return <FontAwesomeIcon className="text-white" icon={faSortAmountDesc} size="sm" />;
			} else {
				return <FontAwesomeIcon className="text-white" icon={faSortAmountAsc} size="sm" />;
			}
		}
	};

	const uiStatusFilter = () => {
		return (
			<Menu as="div" className="w-fit relative text-left">
				<MenuButton className="flex w-full justify-between items-center focus:outline-none relative z-40">
					<FontAwesomeIcon className="text-white" icon={faFilter} size="sm" />
				</MenuButton>
				<MenuItems className="absolute w-fit right-0 origin-top-right rounded black-white-background shadow-md focus:outline-none z-50">
					{uiStatusFilterMenu()}
				</MenuItems>
			</Menu>
		);
	};

	const uiStatusFilterMenu = () => {
		const uniqueStatus = [];

		data.inquiries.apiCopy.forEach((inquiry) => {
			if (!uniqueStatus.includes(inquiry.status)) {
				uniqueStatus.push(inquiry.status);
			}
		});

		return uniqueStatus.map((status, index) => {
			return (
				<MenuItem
					as="div"
					className="w-full p-2 space-x-2.5 cursor-pointer border-y font-regular-10 black-text hovered-rows"
					key={index}
					onClick={() => setData((old) => ({ ...old, searchTerm: status }))}>
					<span>{status}</span>
				</MenuItem>
			);
		});
	};

	const uiStatusMenu = (inquiry) => {
		const isConfirmed = inquiry.status == STATUSES.Confirmed;
		const wrapper = `flex w-full px-4 justify-between items-center focus:outline-none relative z-40 font-medium-10 ${getStatusSeverity(
			inquiry.status,
		)} !py-0`;

		const icon = isConfirmed ? <FontAwesomeIcon icon={faBolt} size="sm" /> : <FontAwesomeIcon icon={faChevronDown} size="sm" />;

		return (
			<Tippy allowHTML={false} content={<Tooltip text={inquiry.closure_reason} />} disabled={inquiry.is_closed == 0 && !inquiry.closure_reason}>
				<Menu as="div" className="flex w-24 justify-center items-center relative">
					<MenuButton
						className={wrapper}
						onClick={() => {
							if (allowConvertingToProject && isConfirmed) {
								toggleConvertToProjectBox(inquiry, "inquiry", true);
							}
						}}>
						<span dangerouslySetInnerHTML={{ __html: highlightText(true, inquiry.status) }} />
						{icon}
					</MenuButton>
					{!isConfirmed && (
						<MenuItems className="absolute w-full top-7 right-0 origin-top-right rounded black-white-background bottom-shadow focus:outline-none z-50 full-border">
							{uiStatusMenuList(inquiry)}
						</MenuItems>
					)}
				</Menu>
			</Tippy>
		);
	};

	const uiStatusMenuList = (inquiry) => {
		return Object.values(STATUSES)
			.filter((status) => status != inquiry.status)
			.filter((status) => {
				if (status == STATUSES.Confirmed && !allowConvertingToProject) {
					return status != STATUSES.Confirmed;
				}

				return status;
			})
			.map((status, index) => {
				const label = status == STATUSES.Closed ? "Close" : status;

				return (
					<MenuItem
						as="div"
						className="p-2 space-x-2.5 cursor-pointer border-y font-regular-10 black-text text-left hovered-rows"
						key={index}
						onClick={() => prepareInquiryStatusChangeData(inquiry, status)}>
						<span>{label}</span>
					</MenuItem>
				);
			});
	};

	const uiToDate = () => {
		if (data.inquiries.apiCopy.length) {
			return (
				<div className="flex w-36 h-[30px] px-2.5 space-x-1 justify-center items-center rounded bottom-shadow black-white-background">
					<FontAwesomeIcon className="primary-text" icon={faCalendar} size="sm" />
					<ReactDatePicker
						className="w-20 h-6 bg-transparent outline-none font-medium-11"
						dateFormat="dd-MM-YYYY"
						endDate={data.entryDate.to}
						onChange={(e) => setInputs("to", e)}
						placeholderText="To"
						tabIndex={2}
						selected={data.entryDate.to}
						selectsEnd
						startDate={data.entryDate.to}
					/>
					<FontAwesomeIcon className={showToDateClearButton} onClick={() => setInputs("to", "")} icon={faMultiply} />
				</div>
			);
		}
	};

	// Hooks
	useEffect(() => {
		getInquiries();

		globalThis.addEventListener("keydown", detectKeystrokes);
		return () => globalThis.removeEventListener("keydown", detectKeystrokes);
	}, []);

	useEffect(() => {
		if (data.inquiries.apiCopy.length) {
			mergeInquiriesAndNotesById();
		}
	}, [data.inquiries.apiCopy]);

	useEffect(() => {
		doFiltering("");
	}, [data.searchTerm]);

	useEffect(() => {
		if (data.entryDate.from && data.entryDate.to) {
			doFiltering("date");
		} else {
			doFiltering("");
		}
	}, [data.entryDate]);

	useEffect(() => {
		if (data.hasMounted) {
			if (Object.keys(data.selectedInquiryForStatusChange).length) {
				toggleChangeStatus(true);
			}
		}
	}, [data.selectedInquiryForStatusChange]);

	return (
		<div className="flex flex-col w-full h-full justify-start items-center light-gray-background">
			{uiMain()}

			{hasMounted.convertToProject && (
				<InquiryModals.ConvertToProject close={toggleConvertToProjectBox} inquiry={data.selectedInquiryForNotes} open={hasMounted.convertToProject} />
			)}

			{hasMounted.changeStatus && (
				<ChangeStatus
					mount={hasMounted.changeStatus}
					reloadInquiries={getInquiries}
					selectedInquiry={data.selectedInquiryForStatusChange}
					unmount={toggleChangeStatus}
				/>
			)}

			{hasMounted.closeInquiry && (
				<CloseInquiry
					mount={hasMounted.closeInquiry}
					reloadInquiries={getInquiries}
					selectedInquiry={data.selectedInquiryForStatusChange}
					unmount={toggleCloseInquiryBox}
				/>
			)}
		</div>
	);
}
