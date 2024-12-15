"use client";

import axios from "axios";
import dayjs from "dayjs";
import ReactDatePicker from "react-datepicker";
import MyConstants from "@/utilities/constants";

import { Virtuoso } from "react-virtuoso";
import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { Badge } from "@/components/Elements";
import { TextInputNative } from "@/components/Inputs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faChevronLeft, faMultiply, faPlusCircle, faSearch, faSortAmountAsc, faSortAmountDesc } from "@fortawesome/free-solid-svg-icons";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

export default function InquiryNotes({ allClients, allNotes, selectedInquiry, unmount }) {
	// Business Logic
	const [data, setData] = useState({
		entryDate: { from: "", to: "" },
		hasMounted: false,
		isAddBoxOpen: false,
		isLoading: false,
		notes: { api: [], apiCopy: [] },
		searchTerm: "",
		sort: { column: "Date", isAscending: false },
	});

	const clientName = allClients?.filter((client) => client.id == selectedInquiry?.client_id).at(0)?.name;

	const showSearchClearButton = data.searchTerm ? "cursor-pointer primary-text" : "hidden";
	const showFromDateClearButton = data.entryDate.from ? "cursor-pointer primary-text" : "hidden";
	const showToDateClearButton = data.entryDate.to ? "cursor-pointer primary-text" : "hidden";

	// Functions
	const doFiltering = (dataToFind) => {
		const filteredData = data.notes.apiCopy.filter((note) => {
			const searchTerm = data.searchTerm.toLowerCase();
			const content = String(note.content).toLowerCase();

			const writer = MyGlobal.GetAllUsers()
				?.filter((user) => user.id == note.user_id)
				.at(0);

			const writerFullName = String(writer.full_name).toLowerCase();

			const checkDate = new Date(note.entry_date);
			const startDate = data.entryDate.from;
			const endDate = data.entryDate.to;

			if (dataToFind == "date") {
				if (checkDate >= startDate && checkDate <= endDate) {
					return note;
				}
			} else {
				return content.includes(searchTerm) || writerFullName.includes(searchTerm);
			}
		});

		setData((s) => ({ ...s, notes: { ...s.notes, api: filteredData } }));
	};

	const doSorting = () => {
		return data.notes.api.sort((a, b) => {
			const aEntryDate = new Date(a.entry_date);
			const bEntryDate = new Date(b.entry_date);

			const aWriter = MyGlobal.GetAnyDataFromId(a.user_id, "full_name");
			const bWriter = MyGlobal.GetAnyDataFromId(b.user_id, "full_name");

			if (data.sort.column == "Date" && data.sort.isAscending) {
				return aEntryDate - bEntryDate;
			} else if (data.sort.column == "Date" && !data.sort.isAscending) {
				return bEntryDate - aEntryDate;
			} else if (data.sort.column == "Note" && data.sort.isAscending) {
				return a.note.localeCompare(b.note);
			} else if (data.sort.column == "Note" && !data.sort.isAscending) {
				return b.note.localeCompare(a.note);
			} else if (data.sort.column == "Writer" && data.sort.isAscending) {
				return aWriter.localeCompare(bWriter);
			} else if (data.sort.column == "Writer" && !data.sort.isAscending) {
				return bWriter.localeCompare(aWriter);
			} else {
				return bEntryDate - aEntryDate;
			}
		});
	};

	const getCounts = () => {
		if (data.notes.api.length != data.notes.apiCopy.length) {
			return `${data.notes.api.length} / ${data.notes.apiCopy.length}`;
		} else {
			return data.notes.api.length;
		}
	};

	const getNotes = async () => {
		try {
			const response = await axios.get(MyConstants.ApiEndpoints.Getter, MyGlobal.GetHeaders({ type: "get-notes" }));

			if (response.status === 200) {
				setNotesByInquiry(response.data);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, `Inquiries => ${selectedInquiry.id} => Get Notes`);
		}
	};

	const setInputs = (key, value) => {
		if (key == "from" || key == "to") {
			setData((s) => ({ ...s, entryDate: { ...s.entryDate, [key]: value } }));
		} else {
			setData((s) => ({ ...s, [key]: value }));
		}
	};

	const setNotesByInquiry = (source) => {
		const notesByInquiry = source?.filter((note) => note.inquiry_id == selectedInquiry?.id);
		setData((s) => ({ ...s, notes: { api: notesByInquiry, apiCopy: notesByInquiry } }));
	};

	const setSort = (column) => {
		setData((s) => ({ ...s, sort: { column, isAscending: !data.sort.isAscending } }));
	};

	const toggleAddBox = () => {
		setData((s) => ({ ...s, isAddBoxOpen: !data.isAddBoxOpen }));
	};

	// UI Components
	const uiBody = () => {
		if (!data.notes.api.length && data.notes.apiCopy.length) {
			return (
				<div className="flex w-full h-[calc(100vh-120px)] p-6 justify-center items-center rounded full-border">
					<span className="font-regular-12 black-text">No notes found.</span>
				</div>
			);
		} else {
			return (
				<div className="flex flex-col w-full h-full justify-center items-start full-border">
					<div className="flex w-full h-9 justify-center items-center primary-background">{uiHeaders()}</div>
					<Virtuoso
						className="w-full h-full overflow-y-auto"
						data={doSorting()}
						itemContent={(index, note) => uiRows(note, index)}
						totalCount={data.notes.api.length}
					/>
				</div>
			);
		}
	};

	const uiFromDate = () => {
		return (
			<div className="flex w-36 h-[30px] px-2.5 space-x-1 justify-start items-center rounded bottom-shadow black-white-background full-border">
				<FontAwesomeIcon className="primary-text" icon={faCalendar} size="sm" />
				<ReactDatePicker
					className="w-20 h-6 bg-transparent outline-none font-medium-11"
					dateFormat="dd-MM-YYYY"
					endDate={data.entryDate.to}
					onChange={(e) => setInputs("from", e)}
					placeholderText="From"
					tabIndex={1}
					selected={data.entryDate.from}
					selectsStart
					startDate={data.entryDate.from}
				/>
				<FontAwesomeIcon className={showFromDateClearButton} onClick={() => setInputs("from", "")} icon={faMultiply} />
			</div>
		);
	};

	const uiHeaders = () => {
		return Object.values(MyConstants.TableHeaders.Notes).map((header, index) => {
			const showIndicator = header == data.sort.column ? "visible" : "invisible";

			return (
				<span className="w-1/3 space-x-1 cursor-pointer text-center font-medium-10 text-white" onClick={() => setSort(header)} key={index}>
					<span>{header}</span>
					<span className={showIndicator}>{uiSortArrows(header)}</span>
				</span>
			);
		});
	};

	const uiNew = () => {
		return (
			<button className="space-x-1.5 primary-button-transparent-background" onClick={() => toggleAddBox()} tabIndex={4}>
				<FontAwesomeIcon className="primary-text" icon={faPlusCircle} />
				<span>New</span>
			</button>
		);
	};

	const uiRows = (note, rowIndex) => {
		const style = "flex w-1/3 min-h-9 justify-center items-center text-center right-border black-white-background";

		const entryDate = dayjs(note.entry_date).format("DD MMM, YYYY");
		const content = MyGlobal.HighlightText(note.content, data.searchTerm);

		const writer = MyGlobal.GetAllUsers()
			?.filter((user) => user.id == note.user_id)
			.at(0);

		const writerFullName = MyGlobal.HighlightText(writer?.full_name, data.searchTerm);

		return (
			<div className="flex w-full justify-center items-center bottom-border font-regular-10 black-text" key={rowIndex}>
				<span className={style}>{entryDate}</span>
				<span className={style} dangerouslySetInnerHTML={{ __html: content }} />
				<span className={style}>
					<span dangerouslySetInnerHTML={{ __html: writerFullName }} />
				</span>
			</div>
		);
	};

	const uiSearch = () => {
		return (
			<TextInputNative
				id=""
				icon={faSearch}
				onChange={(e) => setInputs("searchTerm", e.target.value)}
				onClearButtonClick={() => setInputs("searchTerm", "")}
				placeholder="Search"
				showClearButton={showSearchClearButton}
				tabIndex={3}
				value={data.searchTerm}
				width="w-36"
			/>
		);
	};

	const uiSortArrows = (column) => {
		if (data.sort.column == column) {
			if (data.sort.isAscending) {
				return <FontAwesomeIcon className="text-white" icon={faSortAmountAsc} />;
			} else {
				return <FontAwesomeIcon className="text-white" icon={faSortAmountDesc} />;
			}
		}
	};

	const uiToDate = () => {
		return (
			<div className="flex w-36 h-[30px] px-2.5 space-x-1 justify-start items-center rounded bottom-shadow black-white-background full-border">
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
	};

	// Hooks
	useEffect(() => {
		setNotesByInquiry(allNotes);
		setData((s) => ({ ...s, hasMounted: true }));
	}, []);

	useEffect(() => {
		if (data.hasMounted) {
			doFiltering("");
		}
	}, [data.searchTerm]);

	useEffect(() => {
		if (data.hasMounted) {
			if (data.entryDate.from && data.entryDate.to) {
				doFiltering("date");
			} else {
				doFiltering("");
			}
		}
	}, [data.entryDate]);

	// Main UI
	if (data.hasMounted) {
		return (
			<>
				<div className="flex w-full px-5 py-2.5 justify-between items-center">
					<div className="flex w-1/2 space-x-2 justify-start items-center">
						<FontAwesomeIcon className="pr-1 cursor-pointer black-text" icon={faChevronLeft} onClick={() => unmount(false)} />
						<span className="view-heading">{clientName}'s Notes</span>
						<span className="flex h-8 justify-center items-center">{data.notes.api.length > 0 && <Badge value={getCounts()} />}</span>
					</div>
					<div className="flex w-1/2 space-x-2 justify-end items-center">
						<div className="flex w-1/2 space-x-2 justify-end items-center">
							{uiFromDate()}
							{uiToDate()}
						</div>
						{uiSearch()}
						{uiNew()}
					</div>
				</div>
				<div className="flex w-full h-full justify-center items-center">{uiBody()}</div>

				{data.isAddBoxOpen && <InquiryModals.AddNote close={toggleAddBox} inquiry={selectedInquiry} open={data.isAddBoxOpen} refreshNotes={getNotes} />}
			</>
		);
	}
}
