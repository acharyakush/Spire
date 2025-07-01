"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import { useState } from "react";
import { BadgeLarge2 } from "@/components/Elements";
import { isDevelopment, MyGlobal } from "@/utilities/global";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSortAmountAsc, faSortAmountDesc } from "@fortawesome/free-solid-svg-icons";

export default function PendingPayments({ invoices }) {
	// Business Logic
	const [main, setMain] = useState({
		sort: { column: "Amount", isAscending: false },
	});

	const total = invoices?.reduce((t, c) => t + +c.amount_pending, 0);

	// Functions
	function doSorting() {
		return invoices?.sort((a, b) => {
			const { column, isAscending } = main.sort;

			if (column == "Amount" && isAscending) {
				return a.amount_pending - b.amount_pending;
			} else if (column == "Amount" && !isAscending) {
				return b.amount_pending - a.amount_pending;
			} else {
				return b.amount_pending - a.amount_pending;
			}
		});
	}

	function setSort(header) {
		if (header === "Amount") {
			setMain((s) => ({ ...s, sort: { column: header, isAscending: !s.sort.isAscending } }));
		}
	}

	// UI Components
	function uiHeaders() {
		return ["#", "Name", "Amount"].map((m, i) => {
			const showSortArrow = m == main.sort.column ? "block" : "hidden";
			const width = i === 0 ? "w-[5%]" : "w-[95%]";
			const cursor = i === 2 ? "cursor-pointer" : "cursor-default";
			const wrapper = `flex ${width} pr-2.5 space-x-2 justify-center items-center text-white ${cursor} font-medium-9`;

			return (
				<span
					className={wrapper}
					key={i}
					onClick={() => setSort(m)}>
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

		const transition = isDevelopment ? "" : "anim zoom-in";
		const wrapper = "flex flex-col w-full space-y-2 justify-start items-center " + transition;

		return (
			<div className={wrapper}>
				<div className="flex w-full justify-between items-center">
					<div className={firstRowStyle}>
						<span>Pending Payments</span>
						<BadgeLarge2>
							<span>{MyGlobal.ThousandSeparator(total)}</span>
						</BadgeLarge2>
					</div>
				</div>
				<div className="flex flex-col w-full justify-between items-center shadow-md contrast-background">
					<div className="flex flex-col w-full h-full justify-center items-start">
						<div className="flex w-full h-9 pl-2.5 justify-center items-center rounded-tl rounded-tr primary-background">{uiHeaders()}</div>
						<div className="flex flex-col w-full h-[240px] pl-2.5 overflow-y-auto full-border no-top-row rounded-br rounded-bl">{uiRows()}</div>
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
				<div
					className={wrapper}
					key={i}>
					<span className={`${style} w-[5%]`}>{i + 1}</span>
					<span className={`${style} w-[95%] px-5`}>{m.company_name}</span>
					<span className={`${style} w-[95%] justify-center`}>{MyGlobal.FormatCurrency(m.amount_pending)}</span>
				</div>
			);
		});
	}

	function uiSortArrows(column) {
		if (main.sort.column == column) {
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

	// Main UI
	return uiMain();
}
