"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import "react-datepicker/dist/react-datepicker.css";

import ReactDatePicker from "react-datepicker";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { BadgeLarge2 } from "@/components/Elements";
import { Menu, MenuButton, MenuItems } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faFilter, faMultiply, faSortAmountAsc, faSortAmountDesc } from "@fortawesome/free-solid-svg-icons";

export default function PaymentsReceived({ invoices }) {
	// Business Logic
	const [main, setMain] = useState({
		api: invoices?.received,
		filter: { from: "", to: "" },
		sort: { column: "", isAscending: false },
		total: 0,
	});

	const total = main.api?.reduce((t, v) => t + Number(v.amount_received), 0);

	// Functions
	function doSorting() {
		return main.api?.sort((a, b) => {
			const { column, isAscending } = main.sort;

			if (column == "Amount" && isAscending) {
				return a.amount_received - b.amount_received;
			} else if (column == "Amount" && !isAscending) {
				return b.amount_received - a.amount_received;
			} else {
				return b.amount_received - a.amount_received;
			}
		});
	}

	function doFiltering() {
		const filtered = invoices?.received?.filter((f) => {
			const checkDate = new Date(f.entry_at);
			const startDate = main.filter.from;
			const endDate = main.filter.to;

			if (checkDate >= startDate && checkDate <= endDate) {
				return f;
			}
		});

		setMain((s) => ({ ...s, api: filtered }));
	}

	function resetFilters() {
		const total = invoices?.received?.reduce((t, v) => t + Number(v.amount), 0);
		setMain((s) => ({ ...s, api: invoices?.receivedCopy, total }));
	}

	function setInputs(key, value) {
		setMain((s) => ({ ...s, filter: { ...s.filter, [key]: value } }));
	}

	function setSort(header) {
		if (header === "Amount") {
			setMain((s) => ({ ...s, sort: { column: header, isAscending: !main.sort.isAscending } }));
		}
	}

	// UI Components
	function uiFilter() {
		return (
			<Menu as="div" className="relative z-50 inline-block text-left">
				<MenuButton className="inline-flex w-full py-2 justify-center items-center focus:outline-none black-text">
					<FontAwesomeIcon className="primary-text" icon={faFilter} />
				</MenuButton>
				<MenuItems anchor="bottom end" className="absolute w-max h-auto right-5 rounded focus:outline-none bottom-shadow contrast-background full-border black-text">
					<div className="flex w-full p-5 space-x-5 justify-center items-center">
						{uiFromDate()}
						{uiToDate()}
					</div>
				</MenuItems>
			</Menu>
		);
	}

	function uiFromDate() {
		return (
			<div className="flex w-36 h-[30px] px-2.5 space-x-1 justify-start items-center rounded bottom-shadow bg-[var(--primary-transparent-01)]">
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
					withPortal
				/>
				<FontAwesomeIcon className="cursor-pointer primary-text" onClick={() => setInputs("from", "")} icon={faMultiply} />
			</div>
		);
	}

	function uiHeaders() {
		return ["#", "Name", "Amount"].map((m, i) => {
			const showSortArrow = m == main.sort.column ? "block" : "hidden";
			const width = i === 0 ? "w-[5%]" : "w-[95%]";
			const cursor = i === 2 ? "cursor-pointer" : "cursor-default";
			const wrapper = `flex ${width} pr-2.5 space-x-2 justify-center items-center text-white ${cursor} font-medium-9`;

			return (
				<span className={wrapper} key={i} onClick={() => setSort(m)}>
					<span>{m}</span>
					<span className={showSortArrow}>{uiSortArrows(m)}</span>
				</span>
			);
		});
	}

	function uiMain() {
		const fontSize =
			"text-[16px] [@media(max-width:1351px)]:text-[15px] [@media(max-width:1299px)]:text-[14px]  [@media(max-width:1251px)]:text-[13px] [@media(max-width:1201px)]:text-[12px] [@media(max-width:1152px)]:text-[11px] [@media(max-width:1104px)]:text-[10px]";
		const firstRowStyle = `flex w-full space-x-2.5 justify-start items-center font-bold-16 ${fontSize} primary-text`;

		return (
			<div className="flex flex-col w-full space-y-2 justify-start items-center animate__animated animate__zoomIn">
				<div className="flex w-full justify-between items-center">
					<div className={firstRowStyle}>
						<span>Payments Received</span>
						<BadgeLarge2>
							<span>{MyGlobal.ThousandSeparator(total)}</span>
						</BadgeLarge2>
					</div>
					{uiFilter()}
				</div>
				<div className="flex flex-col w-full justify-between items-center shadow-md contrast-background">
					<div className="flex flex-col w-full h-full justify-center items-start">
						<div className="flex w-full h-9 pl-2.5 justify-center items-center rounded-tl rounded-tr primary-background">{uiHeaders()}</div>
						<div className="flex flex-col w-full h-[245px] pl-2.5 overflow-y-auto full-border no-top-row rounded-br rounded-bl">{uiRows()}</div>
					</div>
				</div>
			</div>
		);
	}

	function uiRows() {
		return doSorting()?.map((m, i) => {
			const wrapper = `flex w-full justify-center items-center contrast-background bottom-border font-regular-9 black-text`;
			const style = `flex min-h-9 items-center`;

			return (
				<div className={wrapper} key={i}>
					<span className={`${style} w-[5%]`}>{i + 1}</span>
					<span className={`${style} w-[95%] px-5`}>{m.company_name}</span>
					<span className={`${style} w-[95%] justify-center`}>{MyGlobal.FormatCurrency(m.amount_received)}</span>
				</div>
			);
		});
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

	function uiToDate() {
		return (
			<div className="flex w-36 h-[30px] px-2.5 space-x-1 justify-center items-center rounded bottom-shadow bg-[var(--primary-transparent-01)]">
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
					withPortal
				/>
				<FontAwesomeIcon className="cursor-pointer primary-text" onClick={() => setInputs("to", "")} icon={faMultiply} />
			</div>
		);
	}

	// Hooks
	useEffect(() => {
		setTimeout(() => {
			setInputs("from", "");
		}, 1000);
	}, []);

	useEffect(() => {
		if (main.filter.from && main.filter.to) {
			doFiltering();
		} else {
			resetFilters();
		}
	}, [main.filter]);

	// Main UI
	return uiMain();
}
