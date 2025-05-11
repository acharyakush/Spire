"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import ReactDatePicker from "react-datepicker";
import MyConstants from "@/utilities/constants";

import { Virtuoso } from "react-virtuoso";
import { MyGlobal } from "@/utilities/global";
import { Badge, Spinner } from "@/components/Elements";
import { useCallback, useEffect, useState } from "react";
import { TextArea, TextInputNative } from "@/components/Inputs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faChevronLeft, faMultiply, faNoteSticky, faSearch } from "@fortawesome/free-solid-svg-icons";

export default function Notes({ inquiry, reload, unmount }) {
	// Business Logic
	const [api, setApi] = useState({
		notes: { copy: [], data: [] },
	});

	const [main, setMain] = useState({
		filter: { from: "", to: "" },
		findText: "",
		isAddingNote: false,
		isLoading: false,
		note: "",
		sort: { column: "Date", isAscending: false },
	});

	const [mounted, setMounted] = useState({
		add: false,
		mainComponent: false,
	});

	const showSearchClearButton = main.findText ? "cursor-pointer primary-text" : "hidden";
	const showFromDateClearButton = main.filter.from ? "cursor-pointer primary-text" : "hidden";
	const showToDateClearButton = main.filter.to ? "cursor-pointer primary-text" : "hidden";

	const disableAddButton = main.isAddingNote || !main.note ? "pointer-events-none opacity-25" : "pointer-events-auto opacity-100";
	const addButtonStyle = `primary-button-condensed ${disableAddButton}`;

	// Functions
	async function doNoteAdding() {
		setMain((s) => ({ ...s, isAddingNote: true }));

		const body = {
			content: main.note,
			id: inquiry?.id,
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

	// UI Components
	function uiButton() {
		if (main.isAddingNote) {
			return (
				<span className="px-3.5">
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
				<div className="flex flex-col w-1/2 h-full justify-center items-start">
					<Virtuoso className="w-full h-full overflow-y-auto" data={api.notes.data} itemContent={(i, row) => uiRows(row, i)} totalCount={api.notes.data.length} />
					<div className="flex w-full space-x-5 justify-between items-center">
						<TextArea icon={faNoteSticky} key={1} label="" onChange={(e) => setInputs("note", e.target.value)} onKeyDown={() => {}} rows={2} tabIndex={1} value={main.note} width="w-full" />
						<button className={addButtonStyle} onClick={doNoteAdding}>
							{uiButton()}
						</button>
					</div>
				</div>
			);
		}
	}

	function uiDetails() {
		const labelStyle = "font-regular-10 gray-text";
		const valueStyle = "font-bold-12 black-text";
		const wrapperStyle = "flex flex-col w-full justify-center items-start";

		return (
			<div className="flex flex-col w-1/2 h-full p-5 space-y-2 justify-between items-center rounded contrast-background full-border">
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
						<span className={valueStyle}>{MyGlobal.FormatCurrency(inquiry?.quote)}</span>
					</div>
					<div className={wrapperStyle}>
						<span className={labelStyle}>Present Status</span>
						<span className={valueStyle}>{inquiry?.status}</span>
					</div>
					<div className={wrapperStyle}>
						<span className={labelStyle}>Referred By</span>
						<span className={valueStyle}>{inquiry?.reference_name}</span>
					</div>
				</div>
			</div>
		);
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
		const entryDate = dayjs(row.entry_date).format("DD MMM, YYYY");

		const content = MyGlobal.HighlightText(row.content, main.findText);
		const entryBy = MyGlobal.HighlightText(row.entry_by, main.findText);

		return (
			<div className="flex flex-col w-full p-2 mb-2 justify-center items-center rounded-md bottom-border bottom-shadow contrast-background" key={i}>
				<span className="flex w-full justify-start items-center font-medium-12 black-text" dangerouslySetInnerHTML={{ __html: content }} />
				<div className="flex w-full justify-between items-center font-regular-10">
					<span dangerouslySetInnerHTML={{ __html: entryBy }} />
					<span className="gray-text">{entryDate}</span>
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
	if (mounted.mainComponent) {
		return (
			<>
				<div className="flex w-full px-5 py-2.5 justify-between items-center">
					<div className="flex w-1/2 space-x-2 justify-start items-center">
						<FontAwesomeIcon className="pr-1 cursor-pointer black-text" icon={faChevronLeft} onClick={() => unmount("", false)} />
						<span className="view-heading">{inquiry.client_name}'s Notes</span>
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
			</>
		);
	}
}
