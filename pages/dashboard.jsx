"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import SlotCounter from "react-slot-counter";
import MyConstants from "@/utilities/constants";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { BadgeLarge2 } from "@/components/Elements";
import { faCalendarCheck, faCalendarPlus, faCalendarWeek, faCalendarXmark, faCheckDouble, faCirclePause, faLock, faUnlock } from "@fortawesome/free-solid-svg-icons";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function Dashboard({ setModuleProps }) {
	// Business Logic

	const [main, setMain] = useState({
		inquiries: { api: [], closed: 0, confirmed: 0, hold: 0, my: 0, open: 0, total: 0, totalAmount: 0 },
		invoices: {
			due: { amount: 0, count: 0, label: "DUE" },
			overdue: { amount: 0, count: 0, label: "OVERDUE" },
			generated: { amount: 0, count: 0, label: "GENERATED" },
			notGenerated: { amount: 0, count: 0, label: "NOT GENERATED" },
			pending: [],
			total: 0,
		},
		isLoading: false,
		projects: { active: 0, api: [], closed: 0, completed: 0, hold: 0, my: 0, total: 0, totalAmount: 0 },
		rv: {
			due: { amount: 0, count: 0, label: "DUE" },
			generated: { amount: 0, count: 0, label: "GENERATED" },
			notGenerated: { amount: 0, count: 0, label: "NOT GENERATED" },
			total: 0,
		},
		tasks: { overdue: 0, today: 0, tomorrow: 0, total: 0, upcoming: 0 },
	});

	const today = dayjs();
	const baseModules = MyConstants.Modules.Base;
	const inquiriesStatus = MyConstants.Statuses.Inquiries;
	const projectsStatus = MyConstants.Statuses.Projects;

	// Functions
	function getBackgroundAndIcon(status) {
		const object = { background: "", icon: "" };

		switch (true) {
			case status == inquiriesStatus.Closed || status == projectsStatus.Closed:
				object.background = "dashboard-blue-2";
				object.icon = faLock;
				break;
			case status == inquiriesStatus.Open || status == main.invoices.notGenerated.label || status == projectsStatus.Active:
				object.background = "dashboard-orange-1";
				object.icon = faUnlock;
				break;
			case status == inquiriesStatus.Confirmed || status == main.invoices.generated.label || status == projectsStatus.Completed:
				object.background = "dashboard-blue-3";
				object.icon = faCheckDouble;
				break;
			case status == inquiriesStatus.Hold || status == main.invoices.due.label || status == projectsStatus.Hold:
				object.background = "dashboard-blue-4";
				object.icon = faCirclePause;
				break;
			case status == "Tomorrow":
				object.background = "dashboard-blue-2";
				object.icon = faCalendarWeek;
				break;
			case status == "Today":
				object.background = "dashboard-orange-2";
				object.icon = faCalendarCheck;
				break;
			case status == "Upcoming":
				object.background = "dashboard-blue-4";
				object.icon = faCalendarPlus;
				break;
			case status == "Overdue":
				object.background = "dashboard-orange-1";
				object.icon = faCalendarXmark;
				break;
		}

		return object;
	}

	async function getSupportData() {
		try {
			setMain((s) => ({ ...s, isLoading: true }));

			const response = await axios.get(MyConstants.ApiEndpoints.Dashboard, MyGlobal.GetHeaders());

			if (response.status == 200) {
				const inquiriesCount = { api: [], closed: 0, confirmed: 0, hold: 0, my: 0, open: 0, total: response.data.inquiries.length, totalAmount: 0 };

				const projectsCount = { active: 0, api: [], closed: 0, completed: 0, hold: 0, my: 0, total: response.data.projects.length, totalAmount: 0 };

				const tasksCount = { overdue: 0, today: 0, tomorrow: 0, total: response.data.tasks.length, upcoming: 0 };

				for (const i of response.data.inquiries) {
					if (i.status == inquiriesStatus.Closed) {
						inquiriesCount.closed++;
					} else if (i.status == inquiriesStatus.Confirmed) {
						inquiriesCount.confirmed++;
					} else if (i.status == inquiriesStatus.Hold) {
						inquiriesCount.hold++;
					} else if (i.status == inquiriesStatus.Open) {
						inquiriesCount.open++;
					}

					if (String(i.follow_ups).includes(MyGlobal.GetUserId())) {
						inquiriesCount.my++;
					}

					inquiriesCount.totalAmount += Number(i.quote);
				}

				inquiriesCount.api = response.data.inquiries;
				const pending = [];

				for (const p of response.data.projects) {
					if (p.status == projectsStatus.Active) {
						projectsCount.active++;
					} else if (p.status == projectsStatus.Closed) {
						projectsCount.closed++;
					} else if (p.status == projectsStatus.Completed) {
						projectsCount.completed++;
					} else if (p.status == projectsStatus.Hold) {
						projectsCount.hold++;
					}

					if (String(p.teams).includes(MyGlobal.GetUserId())) {
						projectsCount.my++;
					}

					projectsCount.totalAmount += Number(p.invoice_fees);

					let amountPending = 0;
					let amountReceived = 0;
					let companyName = "";

					const invoice = response.data.invoices.filter((f) => f.project_id == p.id);

					let invoiceAmount = Number(p.invoice_fees);

					if (Array.isArray(invoice) && invoice.length) {
						invoiceAmount = invoice.reduce((total, i) => total + Number(i.amount), 0);
					}

					const company = response.data.companies.find((f) => f.id == p.company_id);

					if (typeof company === "object") {
						companyName = company.name;
					}

					const transactions = response.data.transactions.filter((f) => f.project_id == p.id);

					if (Array.isArray(transactions) && transactions.length) {
						amountReceived = transactions.reduce((pv, cv) => {
							return pv + Number(cv.amount);
						}, 0);
					}

					amountPending = invoiceAmount - amountReceived;

					pending.push({ ...p, amount: invoiceAmount, amount_pending: amountPending, amount_received: amountReceived, company_name: companyName });
				}

				projectsCount.api = response.data.projects;

				for (const t of response.data.tasks) {
					const dueDate = dayjs(t.due_on);

					if (dueDate.isBefore(today, "date")) {
						tasksCount.overdue++;
					} else if (dueDate.isSame(today, "date")) {
						tasksCount.today++;
					} else if (dueDate.isSame(today.add(1, "day"), "date")) {
						tasksCount.tomorrow++;
					} else if (dueDate.isAfter(today.add(1, "day"), "date")) {
						if (t.is_completed == 0) {
							tasksCount.upcoming++;
						}
					}
				}

				// Invoices
				const invoicesObj = Object.assign({}, main.invoices);

				response.data.invoices.forEach((fe) => {
					if (fe.due_date) {
						if (dayjs(fe.due_date).isBefore(today, "day")) {
							invoicesObj.due.amount += Number(fe.amount);
							invoicesObj.due.count += 1;
						}
					}

					if (fe.custom_id) {
						invoicesObj.generated.amount += Number(fe.amount);
						invoicesObj.generated.count += 1;
					}
				});

				const invoiceProjectIds = new Set(response.data.invoices.map((m) => m.project_id));
				const isNotGenerated = response.data.projects.filter((f) => !invoiceProjectIds.has(f.id));

				isNotGenerated.forEach((fe, i) => {
					invoicesObj.notGenerated.amount += Number(fe.quote);
					invoicesObj.notGenerated.count = i + 1;
				});

				console.log(pending);

				invoicesObj.pending = pending;
				invoicesObj.total = response.data.invoices.length;

				// Reimbursement Voucher
				const rvObj = Object.assign({}, main.rv);

				response.data.rv.forEach((fe) => {
					if (dayjs(fe.due_date).isBefore(today)) {
						rvObj.due.amount += Number(fe.amount);
						rvObj.due.count += 1;
					}

					if (fe.custom_id) {
						rvObj.generated.amount += Number(fe.amount);
						rvObj.generated.count += 1;
					}
				});

				const rvProjectIds = new Set(response.data.rv.map((m) => m.project_id));
				const notGeneratedRv = response.data.tasks.filter((f) => !rvProjectIds.has(f.project_id));

				notGeneratedRv.forEach((fe, i) => {
					rvObj.notGenerated.amount += Number(fe.expense);
					rvObj.notGenerated.count = i + 1;
				});

				rvObj.total = response.data.rv.length;

				setMain((s) => ({
					...s,
					invoices: invoicesObj,
					inquiries: inquiriesCount,
					projects: projectsCount,
					rv: rvObj,
					tasks: tasksCount,
				}));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Dashboard => Get Support Data");
		} finally {
			setMain((s) => ({ ...s, isLoading: false }));
		}
	}

	// UI Components
	function uiCompletedProjects() {
		const months = [];
		const seriesData = [];

		const categories = main.projects.api.reduce((group, project) => {
			const month = dayjs(project.started_on).format("MMM YYYY");

			if (!group[month]) {
				group[month] = [];
			}

			group[month].push(project);

			return group;
		}, {});

		Object.entries(categories).forEach(([month, object]) => {
			if (!months.includes(month)) {
				months.push(month);
			}

			const totalRevenues = object.reduce((total, project) => total + Number(project.invoice_fees), 0);
			seriesData.push(totalRevenues);
		});

		return (
			<div className="flex flex-col w-1/2 px-5 space-y-2 justify-between items-center animate__animated animate__zoomIn">
				<span className="flex w-full justify-start items-center font-bold-20 primary-text">Confirmed Projects</span>
				<div className="flex flex-col w-full p-4 justify-between items-center rounded shadow-xl full-border contrast-background">
					<div className="flex w-full p-2 justify-between items-center">
						<span className="font-bold-20">{MyGlobal.FormatCurrency(main.projects.totalAmount)}</span>
						<button className="primary-button-transparent-background">Filter</button>
					</div>
					<div className="w-full">
						<div id="chart">
							<ReactApexChart
								options={{
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
								}}
								series={[
									{
										name: "Prices",
										data: seriesData,
									},
								]}
								height={165}
								type="line"
								width="100%"
							/>
						</div>
						<div id="html-dist"></div>
					</div>
				</div>
			</div>
		);
	}

	function uiHeaders() {
		return ["#", "Name", "Amount"].map((m, i) => {
			return (
				<span className="flex w-1/3 pr-2.5 space-x-2 justify-center items-center text-white font-medium-8" key={i}>
					<span>{m}</span>
				</span>
			);
		});
	}

	function uiInquiries(key) {
		const aesthetics = getBackgroundAndIcon(key);

		const _key = String(key).toLowerCase();
		const value = main.inquiries[_key];

		let effect = "";
		let zoomRotate = "";

		if (key === inquiriesStatus.Open) {
			effect = "animate__animated animate__fadeInTopLeft";
			zoomRotate = "zoom-rotate-right";
		} else if (key === inquiriesStatus.Closed) {
			effect = "animate__animated animate__fadeInTopLeft";
			zoomRotate = "zoom-rotate-left";
		} else if (key === inquiriesStatus.Hold) {
			effect = "animate__animated animate__fadeInTopRight";
			zoomRotate = "zoom-rotate-left";
		} else {
			effect = "animate__animated animate__fadeInDown";
			zoomRotate = "zoom-rotate-right";
		}

		const wrapper = `flex w-full text-white cursor-pointer ${effect}`;

		return (
			<div className={wrapper} onClick={() => setModuleProps(baseModules.Inquiries, key)}>
				<div className={`flex w-full py-6 justify-center items-center rounded shadow-xl ${zoomRotate} ${aesthetics.background}`}>
					<div className="flex flex-col px-8 justify-center items-center">
						<span className="tracking-widest uppercase font-medium-8 light-gray-text">{key}</span>
						<span className="font-bold-30">
							<SlotCounter value={value} />
						</span>
					</div>
				</div>
			</div>
		);
	}

	function uiInquiryAmount() {
		const months = [];
		const seriesData = [];

		const categories = main.inquiries.api.reduce((group, inquiry) => {
			const month = dayjs(inquiry.entry_date).format("MMM YYYY");

			if (!group[month]) {
				group[month] = [];
			}

			group[month].push(inquiry);
			return group;
		}, {});

		const sortedData = Object.keys(categories)
			.sort((a, b) => new Date(a) - new Date(b))
			.reduce((acc, key) => {
				acc[key] = categories[key];
				return acc;
			}, {});

		Object.entries(sortedData).forEach(([month, object]) => {
			if (!months.includes(month)) {
				months.push(month);
			}

			const totalAmount = object.reduce((total, inquiry) => total + Number(inquiry.quote), 0);
			seriesData.push(totalAmount);
		});

		return (
			<div className="flex flex-col w-1/2 px-5 space-y-2 justify-between items-center animate__animated animate__zoomIn">
				<span className="flex w-full justify-start items-center font-bold-20 primary-text">Inquiry Amount</span>
				<div className="flex flex-col w-full p-4 justify-between items-center rounded shadow-xl full-border contrast-background">
					<div className="flex w-full p-2 justify-between items-center">
						<span className="font-bold-20">{MyGlobal.FormatCurrency(main.inquiries.totalAmount)}</span>
						<button className="primary-button-transparent-background">Filter</button>
					</div>
					<div className="w-full">
						<div id="chart">
							<ReactApexChart
								options={{
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
								}}
								series={[
									{
										name: "Prices",
										data: seriesData,
									},
								]}
								height={175}
								type="line"
								width="100%"
							/>
						</div>
						<div id="html-dist"></div>
					</div>
				</div>
			</div>
		);
	}

	function uiInvoices(key) {
		const aesthetics = getBackgroundAndIcon(key);

		const _key = MyGlobal.TrimInnerSpace(key).toLowerCase();

		const amount = key == main.invoices.notGenerated.label ? main.invoices.notGenerated.amount : main.invoices[_key]?.amount;

		const count = key == main.invoices.notGenerated.label ? main.invoices.notGenerated.count : main.invoices[_key]?.count;

		let effect = "";
		let zoomRotate = "shrink";

		if (key === main.invoices.due.label) {
			effect = "animate__animated animate__fadeInDown";
			zoomRotate = "zoom-rotate-right";
		} else if (key === main.invoices.notGenerated.label) {
			effect = "animate__animated animate__fadeInUp";
			zoomRotate = "zoom-rotate-left";
		} else {
			effect = "animate__animated animate__zoomIn";
		}

		const wrapper = `flex w-full text-white cursor-pointer`;

		return (
			<div className={wrapper} onClick={() => setModuleProps(baseModules.Invoices, key)}>
				<div className={`flex w-full py-6 justify-between items-center rounded shadow-xl ${zoomRotate} ${aesthetics.background}`}>
					<div className="p-4 rounded-r-full shadow-2xl font-bold-16 text-white gray-background-transparent-02">{count}</div>
					<div className="flex flex-col w-full px-8 justify-center items-center">
						<span className="tracking-widest uppercase font-medium-8 light-gray-text">{key}</span>
						<span className="font-bold-30">
							<SlotCounter animateOnVisible={{ triggerOnce: true, rootMargin: "0px 0px -100px 0px" }} value={MyGlobal.FormatCurrency(amount)} />
						</span>
					</div>
				</div>
			</div>
		);
	}

	function uiPendingInvoice() {
		const total = main.invoices.pending.reduce((p, c) => p + Number(c.amount_pending), 0);

		return (
			<div className="flex flex-col w-1/2 px-5 space-y-2 justify-start items-center animate__animated animate__zoomIn">
				<div className="flex w-full space-x-2.5 justify-start items-center font-bold-18 primary-text">
					<span>Pending Invoices</span>
					<BadgeLarge2>
						<span>{MyGlobal.ThousandSeparator(total)}</span>
					</BadgeLarge2>
				</div>
				<div className="flex flex-col w-full p-4 justify-between items-center rounded shadow-xl full-border contrast-background">
					<div className="flex flex-col w-full h-full justify-center items-start full-border">
						<div className="flex w-full h-9 justify-center items-center primary-background">{uiHeaders()}</div>
						<div className="flex flex-col w-full h-[265px] overflow-y-auto">{uiPendingInvoiceRows()}</div>
						{/* <Virtuoso
							className="w-full h-full overflow-y-auto bottom-border contrast-background scrollbar-gutter"
							data={main.invoices.pending}
							itemContent={(i, row) => console.log(row)}
							totalCount={main.invoices.pending.length}
						/> */}
					</div>
				</div>
			</div>
		);
	}

	function uiPendingInvoiceRows() {
		return main.invoices.pending
			.sort((a, b) => b.amount_pending - a.amount_pending)
			.map((m, i) => {
				const style = `flex flex-wrap w-1/3 min-h-9 justify-center items-center text-center`;

				return (
					<div className="flex w-full justify-center items-center contrast-background bottom-border font-regular-12 black-text" key={i}>
						<span className={style}>{i + 1}</span>
						<span className={style}>{m.company_name}</span>
						<span className={style}>{MyGlobal.FormatCurrency(m.amount_pending)}</span>
					</div>
				);
			});
	}

	function uiProjectsAndTasks() {
		return (
			<div className="flex w-full px-5 space-x-2.5 justify-start items-center">
				<div className="flex w-1/2 space-x-10 justify-between items-center">
					<div className="flex flex-col w-full justify-between items-center">
						<div className="flex w-full space-x-2.5 justify-start items-center font-bold-20 primary-text animate__animated animate__slideInDown">
							<span>{baseModules.Projects}</span>
							<BadgeLarge2>
								<SlotCounter value={main.projects.total} />
							</BadgeLarge2>
						</div>
						<div className="w-full pt-2.5 grid grid-cols-2 gap-2.5">
							{uiProjects(projectsStatus.Active)}
							{uiProjects(projectsStatus.Closed)}
							{uiProjects(projectsStatus.Completed)}
							{uiProjects(projectsStatus.Hold)}
						</div>
					</div>
					<div className="flex flex-col w-full justify-between items-center">
						<div className="flex w-full space-x-2.5 justify-start items-center font-bold-20 primary-text animate__animated animate__slideInDown">
							<span>{baseModules.Tasks}</span>
							<BadgeLarge2>
								<SlotCounter value={main.tasks.total} />
							</BadgeLarge2>
						</div>
						<div className="w-full pt-2.5 grid grid-cols-2 gap-2.5">
							{uiTasks("Overdue")}
							{uiTasks("Today")}
							{uiTasks("Tomorrow")}
							{uiTasks("Upcoming")}
						</div>
					</div>
				</div>
				{uiCompletedProjects()}
			</div>
		);
	}

	function uiProjects(key) {
		const aesthetics = getBackgroundAndIcon(key);

		const _key = String(key).toLowerCase();
		const value = main.projects[_key];

		let effect = "";
		let zoomRotate = "";

		if (key === projectsStatus.Active) {
			effect = "animate__animated animate__fadeInTopLeft";
			zoomRotate = "zoom-rotate-right";
		} else if (key === projectsStatus.Closed) {
			effect = "animate__animated animate__fadeInLeft";
			zoomRotate = "zoom-rotate-left";
		} else if (key === projectsStatus.Hold) {
			effect = "animate__animated animate__fadeInBottomRight";
			zoomRotate = "zoom-rotate-right";
		} else if (key === projectsStatus.Completed) {
			effect = "animate__animated animate__fadeInTopRight";
			zoomRotate = "zoom-rotate-left";
		} else {
			effect = "animate__animated animate__fadeInBottomRight";
		}

		const wrapper = `flex w-full text-white cursor-pointer ${effect}`;

		return (
			<div className={wrapper} onClick={() => setModuleProps("projectsOrTasks", key)}>
				<div className={`flex w-full py-6 justify-center items-center rounded shadow-xl ${zoomRotate} ${aesthetics.background}`}>
					<div className="flex flex-col justify-center items-center">
						<span className="tracking-widest uppercase font-medium-8 light-gray-text">{key}</span>
						<span className="font-bold-30">
							<SlotCounter value={value} />
						</span>
					</div>
				</div>
			</div>
		);
	}

	function uiRv(key) {
		const aesthetics = getBackgroundAndIcon(key);

		const _key = MyGlobal.TrimInnerSpace(key).toLowerCase();

		const amount = key == main.rv.notGenerated.label ? main.rv.notGenerated.amount : main.rv[_key]?.amount;
		const count = key == main.rv.notGenerated.label ? main.rv.notGenerated.count : main.rv[_key]?.count;

		let effect = "";
		let zoomRotate = "shrink";

		if (key === main.rv.due.label) {
			effect = "animate__animated animate__fadeInDown";
			zoomRotate = "zoom-rotate-right";
		} else if (key === main.rv.notGenerated.label) {
			effect = "animate__animated animate__fadeInUp";
			zoomRotate = "zoom-rotate-left";
		} else {
			effect = "animate__animated animate__zoomIn";
		}

		const wrapper = `flex w-full text-white cursor-pointer`;

		return (
			<div className={wrapper} onClick={() => setModuleProps(baseModules.Rv, key)}>
				<div className={`flex w-full py-6 justify-between items-center rounded shadow-xl ${zoomRotate} ${aesthetics.background}`}>
					<div className="py-4 px-8 rounded-r-full shadow-2xl font-bold-20 text-white gray-background-transparent-02">{count}</div>
					<div className="flex flex-col px-8 justify-center items-center">
						<span className="tracking-widest uppercase font-medium-8 light-gray-text">{key}</span>
						<span className="font-bold-30">
							<SlotCounter animateOnVisible={{ triggerOnce: true, rootMargin: "0px 0px -50px 0px" }} value={MyGlobal.FormatCurrency(amount)} />
						</span>
					</div>
				</div>
			</div>
		);
	}

	function uiTasks(key) {
		const aesthetics = getBackgroundAndIcon(key);

		const _key = String(key).toLowerCase();
		const value = main.tasks[_key];

		let effect = "";
		let zoomRotate = "";

		if (key === "Overdue") {
			effect = "animate__animated animate__fadeInTopLeft";
			zoomRotate = "zoom-rotate-right";
		} else if (key === "Today") {
			effect = "animate__animated animate__fadeInBottomLeft";
			zoomRotate = "zoom-rotate-left";
		} else if (key === "Tomorrow") {
			effect = "animate__animated animate__fadeInTopRight";
			zoomRotate = "zoom-rotate-left";
		} else {
			effect = "animate__animated animate__fadeInBottomRight";
			zoomRotate = "zoom-rotate-right";
		}

		const wrapper = `flex w-full text-white cursor-pointer ${effect}`;

		return (
			<div className={wrapper} onClick={() => setModuleProps("projectsOrTasks", key)}>
				<div className={`flex w-full py-6 justify-center items-center rounded shadow-xl ${zoomRotate} ${aesthetics.background}`}>
					<div className="flex flex-col justify-center items-center">
						<span className="tracking-widest uppercase font-medium-8 light-gray-text">{key}</span>
						<span className="font-bold-30">
							<SlotCounter value={value} />
						</span>
					</div>
				</div>
			</div>
		);
	}

	// Hooks
	useEffect(() => {
		getSupportData();
	}, []);

	return (
		<div className="w-full h-full p-5 space-y-1 overflow-x-hidden overflow-y-auto">
			{uiProjectsAndTasks()}
			<div className="flex w-full p-5 space-x-2.5 justify-between items-center">
				<div className="flex flex-col w-1/2 justify-between items-start">
					<div className="flex w-full space-x-2.5 justify-start items-center font-bold-20 primary-text animate__animated animate__slideInDown">
						<span>{baseModules.Inquiries}</span>
						<BadgeLarge2>
							<SlotCounter value={main.inquiries.total} />
						</BadgeLarge2>
					</div>
					<div className="w-full pt-2.5 grid grid-cols-2 gap-10">
						{uiInquiries(inquiriesStatus.Open)}
						{uiInquiries(inquiriesStatus.Closed)}
						{uiInquiries(inquiriesStatus.Confirmed)}
						{uiInquiries(inquiriesStatus.Hold)}
					</div>
				</div>
				{uiInquiryAmount()}
			</div>
			<div className="flex w-full p-5 space-x-3 justify-between items-start">
				<div className="flex flex-col w-1/2 space-x-3 justify-between items-center">
					<div className="flex w-full space-x-2.5 justify-start items-center font-bold-20 primary-text">
						<span>{baseModules.Invoices}</span>
						<BadgeLarge2>
							<SlotCounter animateOnVisible={{ triggerOnce: true, rootMargin: "0px 0px -100px 0px" }} value={main.projects.total} />
						</BadgeLarge2>
					</div>
					<div className="w-full pt-2.5 mb-10 grid grid-cols-2 gap-10">
						{uiInvoices(main.invoices.due.label)}
						{uiInvoices(main.invoices.generated.label)}
					</div>
					{uiInvoices(main.invoices.notGenerated.label)}
				</div>
				{uiPendingInvoice()}
			</div>
			<div className="flex flex-col w-full p-5 space-y-2.5 justify-between items-center">
				<div className="flex w-full space-x-2.5 justify-start items-center font-bold-20 primary-text">
					<span>{baseModules.Rv}</span>
					<BadgeLarge2>
						<SlotCounter animateOnVisible={{ triggerOnce: true, rootMargin: "0px 0px -50px 0px" }} value={main.projects.total} />
					</BadgeLarge2>
				</div>
				<div className="flex w-full space-x-24 justify-between items-center">
					{uiRv(main.rv.due.label)}
					{uiRv(main.rv.generated.label)}
					{uiRv(main.rv.notGenerated.label)}
				</div>
			</div>
		</div>
	);
}
