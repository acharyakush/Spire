"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import ReactDatePicker from "react-datepicker";
import MyConstants from "@/utilities/constants";

import { Virtuoso } from "react-virtuoso";
import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { Badge } from "@/components/Elements";
import { TextInputNative } from "@/components/Inputs";
import { AddNote } from "@/modals/inquiries/miscellaneous";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faChevronLeft, faMultiply, faPlusCircle, faSearch, faSortAmountAsc, faSortAmountDesc } from "@fortawesome/free-solid-svg-icons";

export default function Notes({ inquiry, reload, unmount }) {
	// Business Logic
	const [api, setApi] = useState({
		notes: { copy: [], data: [] },
	});

	const [main, setMain] = useState({
		filter: { from: "", to: "" },
		findText: "",
		isLoading: false,
		sort: { column: "Date", isAscending: false },
	});

	const [mounted, setMounted] = useState({
		add: false,
		mainComponent: false,
	});

	const showSearchClearButton = main.findText ? "cursor-pointer primary-text" : "hidden";
	const showFromDateClearButton = main.filter.from ? "cursor-pointer primary-text" : "hidden";
	const showToDateClearButton = main.filter.to ? "cursor-pointer primary-text" : "hidden";

	// Functions
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

	function doSorting() {
		return api.notes.data.sort((a, b) => {
			const aEntryDate = new Date(a.entry_date);
			const bEntryDate = new Date(b.entry_date);

			const { column, isAscending } = main.sort;

			if (column == "Date" && isAscending) {
				return aEntryDate - bEntryDate;
			} else if (column == "Date" && !isAscending) {
				return bEntryDate - aEntryDate;
			} else if (column == "Note" && isAscending) {
				return a.note.localeCompare(b.note);
			} else if (column == "Note" && !isAscending) {
				return b.note.localeCompare(a.note);
			} else if (column == "Entry By" && isAscending) {
				return a.entry_by.localeCompare(b.entry_by);
			} else if (column == "Entry By" && !isAscending) {
				return b.entry_by.localeCompare(a.entry_by);
			} else {
				return bEntryDate - aEntryDate;
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

	function setSort(column) {
		setMain((s) => ({ ...s, sort: { column, isAscending: !main.sort.isAscending } }));
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

	function toggleAddBox() {
		setMounted((s) => ({ ...s, add: !mounted.add }));
	}

	// UI Components
	function uiBody() {
		if (!api.notes.data.length && api.notes.copy.length) {
			return (
				<div className="flex w-full h-[calc(100vh-120px)] p-6 justify-center items-center rounded full-border">
					<span className="font-regular-12 black-text">No notes found.</span>
				</div>
			);
		} else {
			return (
				<div className="flex flex-col w-full h-full justify-center items-start full-border">
					<div className="flex w-full h-9 justify-center items-center primary-background">{uiHeaders()}</div>
					<Virtuoso className="w-full h-full overflow-y-auto" data={doSorting()} itemContent={(i, row) => uiRows(row, i)} totalCount={api.notes.data.length} />
				</div>
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

	function uiHeaders() {
		return Object.values(MyConstants.TableHeaders.Notes).map((m, i) => {
			const showArrow = m == main.sort.column ? "visible" : "invisible";

			return (
				<span className="w-1/3 space-x-1 cursor-pointer text-center font-medium-10 text-white" onClick={() => setSort(m)} key={i}>
					<span>{m}</span>
					<span className={showArrow}>{uiSortArrows(m)}</span>
				</span>
			);
		});
	}

	function uiNew() {
		return (
			<button className="space-x-1.5 primary-button-transparent-background" onClick={() => toggleAddBox()} tabIndex={4}>
				<FontAwesomeIcon className="primary-text" icon={faPlusCircle} />
				<span>New</span>
			</button>
		);
	}

	function uiRows(row, i) {
		const style = "flex w-1/3 min-h-9 justify-center items-center text-center";

		const entryDate = dayjs(row.entry_date).format("DD MMM, YYYY");

		const content = MyGlobal.HighlightText(row.content, main.findText);
		const entryBy = MyGlobal.HighlightText(row.entry_by, main.findText);

		return (
			<div className="flex w-full justify-center items-center bottom-border font-regular-10 black-text contrast-background" key={i}>
				<span className={style}>{entryDate}</span>
				<span className={style} dangerouslySetInnerHTML={{ __html: content }} />
				<span className={style}>
					<span dangerouslySetInnerHTML={{ __html: entryBy }} />
				</span>
			</div>
		);
	}

	function uiSortArrows(column) {
		if (main.sort.column == column) {
			if (main.sort.isAscending) {
				return <FontAwesomeIcon className="text-white" icon={faSortAmountAsc} />;
			} else {
				return <FontAwesomeIcon className="text-white" icon={faSortAmountDesc} />;
			}
		}
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
						{uiNew()}
					</div>
				</div>
				<div className="flex w-full h-full justify-center items-center">{uiBody()}</div>

				{mounted.add && <AddNote inquiry={inquiry} mount={mounted.add} reload={getNotes} unmount={toggleAddBox} />}
			</>
		);
	}
}
