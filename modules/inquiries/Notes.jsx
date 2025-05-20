"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import Tippy from "@tippyjs/react";
import ReactDatePicker from "react-datepicker";
import MyConstants from "@/utilities/constants";

import { Virtuoso } from "react-virtuoso";
import { MyGlobal } from "@/utilities/global";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge, BadgeSmallWithBackground, Spinner, Tooltip } from "@/components/Elements";
import { DatePicker, TextArea, TextInputNative } from "@/components/Inputs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faChevronLeft, faFileDownload, faMultiply, faNoteSticky, faReceipt, faSearch } from "@fortawesome/free-solid-svg-icons";

const DynamicNewQuotation = dynamic(() => import("./NewQuotation"), { ssr: false });

export default function Notes({ clients, inquiry, reload, unmount }) {
	// Business Logic
	const [api, setApi] = useState({
		notes: { copy: [], data: [] },
	});

	const [main, setMain] = useState({
		filter: { from: "", to: "" },
		findText: "",
		isAddingNote: false,
		isLoading: false,
		nextfollowUpOn: new Date(),
		note: "",
		sort: { column: "Date", isAscending: false },
	});

	const [mounted, setMounted] = useState({
		add: false,
		addQuotation: false,
		mainComponent: false,
	});

	const isAdministrator = MyGlobal.IsUserAdministrator();

	const statuses = useMemo(() => MyConstants.Statuses.Inquiries, []);

	const showSearchClearButton = main.findText ? "cursor-pointer primary-text" : "hidden";
	const showFromDateClearButton = main.filter.from ? "cursor-pointer primary-text" : "hidden";
	const showToDateClearButton = main.filter.to ? "cursor-pointer primary-text" : "hidden";

	const disableAddButton = main.isAddingNote ? "pointer-events-none opacity-25" : "pointer-events-auto opacity-100";
	const addButtonStyle = `primary-button-condensed !h-9 ${disableAddButton}`;

	// Functions
	async function doNoteAdding() {
		setMain((s) => ({ ...s, isAddingNote: true }));

		const body = {
			content: main.note,
			id: inquiry?.id,
			nextfollowUpOn: main.nextfollowUpOn,
			source: MyConstants.Modules.Base.Inquiries,
			type: "add-note",
			userId: MyGlobal.GetUserId(),
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				setInputs("note", "");
				getNotes();

				MyGlobal.AddActivity(`Added in <b>${inquiry?.id}</b>.`, MyConstants.Modules.Base.Notes);
				MyGlobal.ShowSuccessToast(MyConstants.Messages.NoteAdded);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Inquiries => Add Note");
		} finally {
			setMain((s) => ({ ...s, isAddingNote: false }));
		}
	}

	function doFiltering(type) {
		const filteredData = api.notes.copy.filter((f) => {
			const text = main.findText.toLowerCase();
			const content = f.content.toLowerCase();
			const entryBy = f.entry_by.toLowerCase();

			const checkDate = new Date(f.entry_date);
			const startDate = main.filter.from;
			const endDate = main.filter.to;

			if (type == "entryDate") {
				if (checkDate >= startDate && checkDate <= endDate) {
					return f;
				}
			} else {
				return content.includes(text) || entryBy.includes(text);
			}
		});

		setApi((s) => ({ ...s, notes: { ...s.notes, data: filteredData } }));
	}

	const downloadQuotation = useCallback(() => {
		const link = document.createElement("a");
		const fileName = String(inquiry?.quotation_id).replace("/", "_").replace("/", "_");

		link.href = `/quotations/${fileName}.pdf`;
		link.download = `${fileName}.pdf`;

		link.click();
	}, []);

	function getIconOrBadge() {
		if (main.isLoading) {
			return (
				<span className="pl-5 relative">
					<Spinner />
				</span>
			);
		} else {
			return api.notes.data.length > 0 && <Badge value={getRowsCount()} />;
		}
	}

	async function getNotes() {
		try {
			const response = await axios.get(MyConstants.ApiEndpoints.Getter, MyGlobal.GetHeaders({ type: "get-notes" }));

			if (response.status === 200) {
				reload();
				setNotesByInquiry(response.data);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, `Inquiries => ${inquiry.id} => Get Notes`);
		}
	}

	function getRowsCount() {
		if (api.notes.data.length != api.notes.copy.length) {
			return `${api.notes.data.length} / ${api.notes.copy.length}`;
		} else {
			return api.notes.data.length;
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

	const openEmailAddress = useCallback((emailAddress) => {
		globalThis.window.open(`mailto://${emailAddress}`, "_blank");
	}, []);

	const openWhatsAppWeb = useCallback((phoneNumber) => {
		globalThis.window.open(`https://wa.me/1${phoneNumber}`, "_blank");
	}, []);

	function setInputs(key, value) {
		if (key == "from" || key == "to") {
			setMain((s) => ({ ...s, filter: { ...s.filter, [key]: value } }));
		} else {
			setMain((s) => ({ ...s, [key]: value }));
		}
	}

	function setNotesByInquiry(source = []) {
		let notesByInquiry = [];
		const array = source.filter((f) => f.inquiry_id == inquiry.id);

		if (array.length) {
			array.forEach((fe) => {
				const entryBy = MyGlobal.GetAnyDataFromId(fe.entry_by_id, "full_name");
				notesByInquiry.push({ ...fe, entry_by: entryBy });
			});
		}

		setApi((s) => ({ ...s, notes: { copy: notesByInquiry, data: notesByInquiry } }));
	}

	async function setSupportData() {
		try {
			const response = await axios.get(MyConstants.ApiEndpoints.Notes.GetNotes, MyGlobal.GetHeaders({ inquiryId: inquiry.id }));

			if (response.status === 200) {
				setApi({ notes: { copy: response.data, data: response.data } });
				setNotesByInquiry(response.data);
				setMounted((s) => ({ ...s, mainComponent: true }));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Notes => Get Notes");
		}
	}

	function toggleAddQuotation(_, type) {
		setMounted((s) => ({ ...s, addQuotation: type }));
	}

	// UI Components
	function uiAddQuotation() {
		if (isAdministrator) {
			return (
				<Tippy animation="shift-away" content={<Tooltip text="Add a quotation for this inquiry." />} placement="bottom">
					<FontAwesomeIcon className="cursor-pointer green-text" icon={faReceipt} onClick={() => toggleAddQuotation({}, true)} />
				</Tippy>
			);
		}
	}

	function uiButton() {
		if (main.isAddingNote) {
			return (
				<span className="w-[64.49px]">
					<Spinner />
				</span>
			);
		} else {
			return "Add";
		}
	}

	function uiBody() {
		if (!api.notes.data.length && api.notes.copy.length) {
			return (
				<div className="flex w-1/2 h-[calc(100vh-120px)] p-6 justify-center items-center rounded full-border">
					<span className="font-regular-12 black-text">No notes found.</span>
				</div>
			);
		} else {
			return (
				<div className="flex flex-col w-3/4 h-full justify-between items-center">
					<Virtuoso className="w-full h-full mb-5 overflow-y-auto" data={api.notes.data.sort((a, b) => b.id - a.id)} itemContent={(i, row) => uiRows(row, i)} totalCount={api.notes.data.length} />
					<div className="flex flex-col w-full h-[187px] p-2.5 justify-center items-center rounded shadow contrast-background">
						<TextArea icon={faNoteSticky} key={1} label="Note" onChange={(e) => setInputs("note", e.target.value)} onKeyDown={() => {}} rows={2} tabIndex={1} value={main.note} width="w-full" />
						{uiNextFollowUpDate()}
					</div>
				</div>
			);
		}
	}

	function uiNextFollowUpDate() {
		return (
			<div className="flex w-full pr-2.5 space-x-5 justify-between items-center">
				<DatePicker icon={faCalendar} label="Next Follow Up" onChange={(e) => setInputs("nextfollowUpOn", e)} tabIndex={7} value={main.nextfollowUpOn} width="w-full" />
				<div className="flex w-fit h-[59px] justify-center items-end">
					<button className={addButtonStyle} onClick={doNoteAdding}>
						{uiButton()}
					</button>
				</div>
			</div>
		);
	}

	function uiDetails() {
		const labelStyle = "font-regular-10 gray-text";
		const valueStyle = "font-bold-12 black-text";
		const wrapperStyle = "flex flex-col w-full justify-center items-start";

		const wrapper = `flex w-fit px-5 justify-center items-center focus:outline-none relative z-40 font-bold-12 black-text ${getStatusSeverity(inquiry?.status)} !rounded-md`;

		return (
			<div className="flex flex-col w-1/4 h-full p-5 space-y-2 justify-between items-center rounded contrast-background shadow">
				<div className="flex w-full pb-2.5 justify-between items-center bottom-border">
					<div className="flex w-full space-x-2 justify-start items-center">
						<span className="font-regular-12 gray-text">By</span>
						<span className="font-bold-12 black-text">{inquiry?.entry_by_name}</span>
					</div>
					<div className="flex w-full space-x-2 justify-end items-center">
						<span className="font-regular-12 gray-text">On</span>
						<span className="font-bold-12 black-text">{inquiry?.entry_date}</span>
					</div>
				</div>
				<div className="flex flex-col w-full h-full py-2.5 space-y-5 justify-start items-center">
					<div className={wrapperStyle}>
						<span className={labelStyle}>Client</span>
						<span className={valueStyle}>{inquiry?.client_name}</span>
					</div>
					<div className={wrapperStyle}>
						<span className={labelStyle}>Can be contacted on</span>
						<span className="cursor-pointer hover:text-blue-500 font-bold-12 black-text" onClick={() => openWhatsAppWeb(inquiry?.phone_number)}>
							{inquiry?.phone_number}
						</span>
						<span className="cursor-pointer hover:text-blue-500 font-bold-12 black-text" onClick={() => openEmailAddress(inquiry?.email_address)}>
							{inquiry?.email_address}
						</span>
					</div>
					<div className={wrapperStyle}>
						<span className={labelStyle}>Has projects</span>
						<span className={valueStyle}>{inquiry?.sub_project}</span>
						<span className={valueStyle}>{inquiry?.main_project}</span>
					</div>
					<div className={wrapperStyle}>
						<span className={labelStyle}>Will be followed up by</span>
						<span className={valueStyle}>{inquiry?.follow_ups}</span>
					</div>
					<div className={wrapperStyle}>
						<span className={labelStyle}>Has been quoted</span>
						<div className={`flex space-x-2.5 justify-center items-center ${valueStyle}`}>
							<span>{MyGlobal.FormatCurrency(inquiry?.quote)}</span>
							{uiAddQuotation()}
							{uiDownloadQuotation()}
						</div>
					</div>
					<div className={wrapperStyle}>
						<span className={labelStyle}>Present Status</span>
						<span className={wrapper}>{inquiry?.status}</span>
					</div>
					<div className={wrapperStyle}>
						<span className={labelStyle}>Referred By</span>
						<span className={valueStyle}>{inquiry?.reference_name}</span>
					</div>
				</div>
			</div>
		);
	}

	function uiDownloadQuotation() {
		if (isAdministrator) {
			const showDownloadButton = inquiry?.quotation_id ? "cursor-pointer visible primary-text" : "invisible";

			return (
				<Tippy animation="shift-away" content={<Tooltip text="Download this quotation." />} placement="bottom">
					<FontAwesomeIcon className={showDownloadButton} icon={faFileDownload} onClick={downloadQuotation} />
				</Tippy>
			);
		}
	}

	function uiFind() {
		return (
			<TextInputNative
				id=""
				icon={faSearch}
				onChange={(e) => setInputs("findText", e.target.value)}
				onClearButtonClick={() => setInputs("findText", "")}
				placeholder="Find"
				showClearButton={showSearchClearButton}
				tabIndex={3}
				value={main.findText}
				width="w-36"
			/>
		);
	}

	function uiFromDate() {
		return (
			<div className="flex w-36 h-[30px] px-2.5 space-x-1 justify-start items-center rounded bottom-shadow contrast-background full-border">
				<FontAwesomeIcon className="primary-text" icon={faCalendar} size="sm" />
				<ReactDatePicker
					className="w-20 h-6 bg-transparent outline-none font-medium-11"
					dateFormat="dd-MM-YYYY"
					endDate={main.filter.to}
					onChange={(e) => setInputs("from", e)}
					placeholderText="From"
					tabIndex={1}
					selected={main.filter.from}
					selectsStart
					startDate={main.filter.from}
				/>
				<FontAwesomeIcon className={showFromDateClearButton} onClick={() => setInputs("from", "")} icon={faMultiply} />
			</div>
		);
	}

	function uiRows(row, i) {
		const nextFollowUpOn = dayjs(row.next_follow_up_on).format("DD MMM, YYYY");
		const entryDate = dayjs(row.entry_date).format("DD MMM, YYYY");

		const content = MyGlobal.HighlightText(row.content, main.findText);
		const entryBy = MyGlobal.HighlightText(row.entry_by, main.findText);

		return (
			<div className="flex flex-col w-full p-2 mb-2 justify-center items-center rounded-md bottom-border bottom-shadow contrast-background" key={i}>
				<span className="flex w-full justify-start items-center font-medium-12 black-text" dangerouslySetInnerHTML={{ __html: content }} />
				<div className="flex w-full justify-between items-center font-regular-10">
					<span dangerouslySetInnerHTML={{ __html: entryBy }} />
					<div className="flex w-1/2 space-x-2.5 justify-end items-center">
						{i === 0 && row.next_follow_up_on && (
							<>
								<span className="inline-block px-5 blink red-text red-tag-transparent-01">
									Next Follow Up On <b>{nextFollowUpOn}</b>
								</span>
							</>
						)}
						<span className="gray-text">{entryDate}</span>
					</div>
				</div>
			</div>
		);
	}

	function uiToDate() {
		return (
			<div className="flex w-36 h-[30px] px-2.5 space-x-1 justify-start items-center rounded bottom-shadow contrast-background full-border">
				<FontAwesomeIcon className="primary-text" icon={faCalendar} size="sm" />
				<ReactDatePicker
					className="w-20 h-6 bg-transparent outline-none font-medium-11"
					dateFormat="dd-MM-YYYY"
					endDate={main.filter.to}
					onChange={(e) => setInputs("to", e)}
					placeholderText="To"
					tabIndex={2}
					selected={main.filter.to}
					selectsEnd
					startDate={main.filter.to}
				/>
				<FontAwesomeIcon className={showToDateClearButton} onClick={() => setInputs("to", "")} icon={faMultiply} />
			</div>
		);
	}

	// Hooks
	useEffect(() => {
		setSupportData();
	}, []);

	useEffect(() => {
		if (mounted.mainComponent) {
			doFiltering("");
		}
	}, [main.findText]);

	useEffect(() => {
		if (mounted.mainComponent) {
			if (main.filter.from && main.filter.to) {
				doFiltering("entryDate");
			} else {
				doFiltering("");
			}
		}
	}, [main.filter]);

	// Main UI
	if (mounted.addQuotation) {
		return <DynamicNewQuotation clients={clients} inquiry={inquiry} reload={reload} unmount={toggleAddQuotation} />;
	}

	if (mounted.mainComponent) {
		return (
			<div className="flex flex-col w-full h-full pb-5 justify-between items-center">
				<div className="flex w-full px-5 py-2.5 justify-between items-center">
					<div className="flex w-1/2 space-x-2 justify-start items-center">
						<FontAwesomeIcon className="pr-1 cursor-pointer black-text" icon={faChevronLeft} onClick={() => unmount("", false)} />
						<span className="view-heading">{String(inquiry.client_name).trimEnd()}'s Notes</span>
						<span className="flex h-8 justify-center items-center">{getIconOrBadge()}</span>
					</div>
					<div className="flex w-1/2 space-x-2 justify-end items-center">
						<div className="flex w-1/2 space-x-2 justify-end items-center">
							{uiFromDate()}
							{uiToDate()}
						</div>
						{uiFind()}
					</div>
				</div>
				<div className="flex w-full h-full px-5 space-x-10 justify-center items-center">
					{uiDetails()}
					{uiBody()}
				</div>
			</div>
		);
	}
}
