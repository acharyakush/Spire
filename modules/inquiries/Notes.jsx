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

export default function Notes({ allClients, allNotes, reloadInquiries, selectedInquiry, unmount }) {
	// Business Logic
	const [mainData, setMainState] = useState({
		entryDate: { from: "", to: "" },
		hasMounted: false,
		isAddBoxOpen: false,
		isLoading: false,
		notes: { api: [], apiCopy: [] },
		searchTerm: "",
		sort: { column: "Date", isAscending: false },
	});

	const clientName = allClients?.filter((client) => client.id == selectedInquiry?.client_id).at(0)?.name;

	const showSearchClearButton = mainData.searchTerm ? "cursor-pointer primary-text" : "hidden";
	const showFromDateClearButton = mainData.entryDate.from ? "cursor-pointer primary-text" : "hidden";
	const showToDateClearButton = mainData.entryDate.to ? "cursor-pointer primary-text" : "hidden";

	// Functions
	const doFiltering = (dataToFind) => {
		const filteredData = mainData.notes.apiCopy.filter((note) => {
			const searchTerm = mainData.searchTerm.toLowerCase();
			const content = String(note.content).toLowerCase();

			const writer = MyGlobal.GetAllUsers()
				?.filter((user) => user.id == note.entry_by)
				.at(0);

			const writerFullName = String(writer.full_name).toLowerCase();

			const checkDate = new Date(note.entry_date);
			const startDate = mainData.entryDate.from;
			const endDate = mainData.entryDate.to;

			if (dataToFind == "date") {
				if (checkDate >= startDate && checkDate <= endDate) {
					return note;
				}
			} else {
				return content.includes(searchTerm) || writerFullName.includes(searchTerm);
			}
		});

		setMainState((old) => ({ ...old, notes: { ...old.notes, api: filteredData } }));
	};

	const doSorting = () => {
		return mainData.notes.api.sort((a, b) => {
			const aEntryDate = new Date(a.entry_date);
			const bEntryDate = new Date(b.entry_date);

			const aWriter = MyGlobal.GetAnyDataFromId(a.entry_by, "full_name");
			const bWriter = MyGlobal.GetAnyDataFromId(b.entry_by, "full_name");

			if (mainData.sort.column == "Date" && mainData.sort.isAscending) {
				return aEntryDate - bEntryDate;
			} else if (mainData.sort.column == "Date" && !mainData.sort.isAscending) {
				return bEntryDate - aEntryDate;
			} else if (mainData.sort.column == "Note" && mainData.sort.isAscending) {
				return a.note.localeCompare(b.note);
			} else if (mainData.sort.column == "Note" && !mainData.sort.isAscending) {
				return b.note.localeCompare(a.note);
			} else if (mainData.sort.column == "Writer" && mainData.sort.isAscending) {
				return aWriter.localeCompare(bWriter);
			} else if (mainData.sort.column == "Writer" && !mainData.sort.isAscending) {
				return bWriter.localeCompare(aWriter);
			} else {
				return bEntryDate - aEntryDate;
			}
		});
	};

	const getCounts = () => {
		if (mainData.notes.api.length != mainData.notes.apiCopy.length) {
			return `${mainData.notes.api.length} / ${mainData.notes.apiCopy.length}`;
		} else {
			return mainData.notes.api.length;
		}
	};

	const getNotes = async () => {
		try {
			const response = await axios.get(MyConstants.ApiEndpoints.Getter, MyGlobal.GetHeaders({ type: "get-notes" }));

			if (response.status === 200) {
				reloadInquiries();
				setNotesByInquiry(response.data);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, `Inquiries => ${selectedInquiry.id} => Get Notes`);
		}
	};

	const setInputs = (key, value) => {
		if (key == "from" || key == "to") {
			setMainState((old) => ({ ...old, entryDate: { ...old.entryDate, [key]: value } }));
		} else {
			setMainState((old) => ({ ...old, [key]: value }));
		}
	};

	const setNotesByInquiry = (source) => {
		const notesByInquiry = source?.filter((note) => note.inquiry_id == selectedInquiry?.id);
		setMainState((old) => ({ ...old, notes: { api: notesByInquiry, apiCopy: notesByInquiry } }));
	};

	const setSort = (column) => {
		setMainState((old) => ({ ...old, sort: { column, isAscending: !mainData.sort.isAscending } }));
	};

	const toggleAddBox = () => {
		setMainState((old) => ({ ...old, isAddBoxOpen: !mainData.isAddBoxOpen }));
	};

	// UI Components
	const uiBody = () => {
		if (!mainData.notes.api.length && mainData.notes.apiCopy.length) {
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
						totalCount={mainData.notes.api.length}
					/>
				</div>
			);
		}
	};

	const uiFromDate = () => {
		return (
			<div className="flex w-36 h-[30px] px-2.5 space-x-1 justify-start items-center rounded bottom-shadow contrast-background full-border">
				<FontAwesomeIcon className="primary-text" icon={faCalendar} size="sm" />
				<ReactDatePicker
					className="w-20 h-6 bg-transparent outline-none font-medium-11"
					dateFormat="dd-MM-YYYY"
					endDate={mainData.entryDate.to}
					onChange={(e) => setInputs("from", e)}
					placeholderText="From"
					tabIndex={1}
					selected={mainData.entryDate.from}
					selectsStart
					startDate={mainData.entryDate.from}
				/>
				<FontAwesomeIcon className={showFromDateClearButton} onClick={() => setInputs("from", "")} icon={faMultiply} />
			</div>
		);
	};

	const uiHeaders = () => {
		return Object.values(MyConstants.TableHeaders.Notes).map((header, index) => {
			const showIndicator = header == mainData.sort.column ? "visible" : "invisible";

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
		const style = "flex w-1/3 min-h-9 justify-center items-center text-center right-border contrast-background";

		const entryDate = dayjs(note.entry_date).format("DD MMM, YYYY");
		const content = MyGlobal.HighlightText(note.content, mainData.searchTerm);

		const writer = MyGlobal.GetAllUsers()
			?.filter((user) => user.id == note.entry_by)
			.at(0);

		const writerFullName = MyGlobal.HighlightText(writer?.full_name, mainData.searchTerm);

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
				value={mainData.searchTerm}
				width="w-36"
			/>
		);
	};

	const uiSortArrows = (column) => {
		if (mainData.sort.column == column) {
			if (mainData.sort.isAscending) {
				return <FontAwesomeIcon className="text-white" icon={faSortAmountAsc} />;
			} else {
				return <FontAwesomeIcon className="text-white" icon={faSortAmountDesc} />;
			}
		}
	};

	const uiToDate = () => {
		return (
			<div className="flex w-36 h-[30px] px-2.5 space-x-1 justify-start items-center rounded bottom-shadow contrast-background full-border">
				<FontAwesomeIcon className="primary-text" icon={faCalendar} size="sm" />
				<ReactDatePicker
					className="w-20 h-6 bg-transparent outline-none font-medium-11"
					dateFormat="dd-MM-YYYY"
					endDate={mainData.entryDate.to}
					onChange={(e) => setInputs("to", e)}
					placeholderText="To"
					tabIndex={2}
					selected={mainData.entryDate.to}
					selectsEnd
					startDate={mainData.entryDate.to}
				/>
				<FontAwesomeIcon className={showToDateClearButton} onClick={() => setInputs("to", "")} icon={faMultiply} />
			</div>
		);
	};

	// Hooks
	useEffect(() => {
		setNotesByInquiry(allNotes);
		setMainState((old) => ({ ...old, hasMounted: true }));
	}, []);

	useEffect(() => {
		if (mainData.hasMounted) {
			doFiltering("");
		}
	}, [mainData.searchTerm]);

	useEffect(() => {
		if (mainData.hasMounted) {
			if (mainData.entryDate.from && mainData.entryDate.to) {
				doFiltering("date");
			} else {
				doFiltering("");
			}
		}
	}, [mainData.entryDate]);

	// Main UI
	if (mainData.hasMounted) {
		return (
			<>
				<div className="flex w-full px-5 py-2.5 justify-between items-center">
					<div className="flex w-1/2 space-x-2 justify-start items-center">
						<FontAwesomeIcon className="pr-1 cursor-pointer black-text" icon={faChevronLeft} onClick={() => unmount("", false)} />
						<span className="view-heading">{clientName}'s Notes</span>
						<span className="flex h-8 justify-center items-center">{mainData.notes.api.length > 0 && <Badge value={getCounts()} />}</span>
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

				{mainData.isAddBoxOpen && (
					<AddNote mount={mainData.isAddBoxOpen} reloadNotes={getNotes} selectedInquiry={selectedInquiry} unmount={toggleAddBox} />
				)}
			</>
		);
	}
}
