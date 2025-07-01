"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import dayjs from "dayjs";
import dynamic from "next/dynamic";

import { isDevelopment, MyGlobal } from "@/utilities/global";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function InquiryAmount({ inquiries }) {
	// Business Logic
	const months = [];
	const seriesData = [];

	const categories = inquiries?.api?.reduce((t, v) => {
		const month = dayjs(v.entry_date).format("MMM YYYY");

		if (!t[month]) {
			t[month] = [];
		}

		t[month].push(v);
		return t;
	}, {});

	const sortedData = Object.keys(categories ?? {})
		?.sort((a, b) => new Date(a) - new Date(b))
		?.reduce((t, v) => {
			t[v] = categories[v];
			return t;
		}, {});

	Object.entries(sortedData)?.forEach(([month, object]) => {
		if (!months.includes(month)) {
			months.push(month);
		}

		const totalQuote = object.reduce((t, v) => t + Number(v.quote), 0);
		seriesData.push(totalQuote);
	});

	// Functions
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
					colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
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

	// UI Components
	function uiMain() {
		const transition = isDevelopment ? "" : "anim zoom-in";
		const wrapper = "flex flex-col w-full space-y-2 justify-between items-center " + transition;

		return (
			<div className={wrapper}>
				<span className="flex w-full justify-start items-center font-bold-16 primary-text">Inquiry Amount</span>
				<div className="flex flex-col w-full p-4 justify-between items-center full-border rounded shadow-md contrast-background">
					<div className="flex w-full p-2 justify-between items-center">
						<span className="font-bold-20">{MyGlobal.FormatCurrency(inquiries?.totalQuote)}</span>
					</div>
					<div className="w-full">
						<div id="chart">
							<ReactApexChart
								options={getChartOptions()}
								series={getChartSeries()}
								height={175}
								type="line"
								width="100%"
							/>
						</div>
						<div id="html-dist" />
					</div>
				</div>
			</div>
		);
	}

	// Main UI
	return uiMain();
}
