"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import "react-datepicker/dist/react-datepicker.css";

import dayjs from "dayjs";
import dynamic from "next/dynamic";
import ReactDatePicker from "react-datepicker";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { Menu, MenuButton, MenuItems } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faCheckCircle, faFilter, faMultiply, faXmarkCircle } from "@fortawesome/free-solid-svg-icons";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function ConfirmedProjects({ projects }) {
	// Business Logic
	const [main, setMain] = useState({
		api: projects?.apiCopy,
		filter: { amountReceived: false, from: "", to: "" },
		total: projects?.totalInvoiceFees,
	});

	const months = [];
	const seriesData = [];

	const categories = main.api?.reduce((t, v) => {
		const month = dayjs(v.started_on).format("MMM YYYY");

		if (!t[month]) {
			t[month] = [];
		}

		t[month].push(v);

		return t;
	}, {});

	Object.entries(categories ?? {})?.forEach(([month, object]) => {
		if (!months.includes(month)) {
			months.push(month);
		}

		const totalFees = object.reduce((t, v) => t + Number(v.invoice_fees), 0);
		seriesData.push(totalFees);
	});

	// Functions
	function doFiltering() {
		const filtered = projects?.apiCopy?.filter((f) => {
			const checkDate = new Date(f.started_on);
			const startDate = main.filter.from;
			const endDate = main.filter.to;

			if (checkDate >= startDate && checkDate <= endDate) {
				return f;
			}
		});

		const total = filtered.reduce((t, v) => t + Number(v.invoice_fees), 0);
		setMain((s) => ({ ...s, api: filtered, total }));
	}

	function getChartOptions() {
		return {
			chart: {
				width: "100%",
				type: "line",
				zoom: {
					enabled: true,
				},
				fontFamily: "Tahoma, sans-serif",
				redrawOnParentResize: true,
				toolbar: {
					show: false,
				},
				events: {
					mounted: (c) => c.windowResizeHandler(),
				},
			},
			dataLabels: {
				enabled: true,
				formatter: (value) => {
					const _value = Math.trunc(Number(value));
					return MyGlobal.FormatCurrency(_value);
				},
				style: {
					fontSize: "12px",
				},
			},
			stroke: {
				curve: "smooth",
			},
			markers: {
				hover: {
					sizeOffset: 4,
				},
				size: 1,
			},
			tooltip: {
				y: {
					formatter: (val) => MyGlobal.FormatCurrency(val),
				},
			},
			grid: {
				row: {
					colors: ["#f3f3f3", "transparent"],
					opacity: 0.5,
				},
			},
			xaxis: {
				categories: months,
			},
		};
	}

	function getChartSeries() {
		return [
			{
				name: "Prices",
				data: seriesData,
			},
		];
	}

	function setInputs(key, value) {
		setMain((s) => ({ ...s, filter: { ...s.filter, [key]: value } }));
	}

	// UI Components
	function uiFilter() {
		return (
			<Menu as="div" className="relative z-50 inline-block text-left">
				<MenuButton className="inline-flex w-full py-2 justify-center items-center focus:outline-none black-text">
					<FontAwesomeIcon className="primary-text" icon={faFilter} size="lg" />
				</MenuButton>
				<MenuItems anchor="bottom start" className="absolute w-max h-auto rounded focus:outline-none bottom-shadow contrast-background full-border black-text">
					<div className="flex flex-col w-full p-5 space-y-5 justify-center items-center">
						<div className="flex w-full space-x-5 justify-between items-center">
							<div className="flex w-1/4 justify-start items-center font-regular-10">By Date</div>
							<div className="flex w-3/4 space-x-5 justify-start items-center">
								{uiFromDate()}
								{uiToDate()}
							</div>
						</div>
						<div className="flex w-full justify-between items-center font-regular-10">
							<div className="flex w-11/12 space-x-2.5 justify-start items-center">
								{main.filter.amountReceived && <FontAwesomeIcon className="green-text" icon={faCheckCircle} size="lg" />}
								<span className="cursor-pointer" onClick={() => setInputs("amountReceived", true)}>
									By Amount Received
								</span>
							</div>
							{main.filter.amountReceived && <FontAwesomeIcon className="cursor-pointer red-text" icon={faXmarkCircle} onClick={() => setInputs("amountReceived", false)} size="lg" />}
						</div>
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

	function uiMain() {
		return (
			<div className="flex flex-col w-full space-y-2 justify-between items-center animate__animated animate__zoomIn">
				<span className="flex w-full justify-start items-center font-bold-16 primary-text">Confirmed Projects</span>
				<div className="flex flex-col w-full justify-between items-center rounded shadow-md full-border contrast-background">
					<div className="flex w-full px-4 py-2 justify-between items-center">
						<span className="font-bold-20">{MyGlobal.FormatCurrency(main.total)}</span>
						{uiFilter()}
					</div>
					<div className="w-full">
						<div id="chart">
							<ReactApexChart options={getChartOptions()} series={getChartSeries()} height={205} type="line" width="100%" />
						</div>
						<div id="html-dist" />
					</div>
				</div>
			</div>
		);
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
		} else if (main.filter.amountReceived) {
			const total = projects?.paymentReceived?.reduce((t, v) => t + Number(v.amount_received), 0);
			setMain((s) => ({ ...s, api: projects?.paymentReceived, total }));
		} else {
			const total = projects?.apiCopy?.reduce((t, v) => t + Number(v.invoice_fees), 0);
			setMain((s) => ({ ...s, api: projects?.apiCopy, total }));
		}
	}, [main.filter]);

	// Main UI
	return uiMain();
}
