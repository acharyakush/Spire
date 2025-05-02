"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import RVs from "./RVs";
import axios from "axios";
import dayjs from "dayjs";
import Tasks from "./Tasks";
import Invoices from "./Invoices";
import Projects from "./Projects";
import Inquiries from "./Inquiries";
import InquiryAmount from "./InquiryAmount";
import MyConstants from "@/utilities/constants";
import PendingPayments from "./PendingPayments";
import PaymentsReceived from "./PaymentsReceived";
import ConfirmedProjects from "./ConfirmedProjects";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";

export default function Dashboard({ setModuleProps }) {
	// Business Logic
	const [main, setMain] = useState({
		inquiries: {
			api: [],
			closed: 0,
			confirmed: 0,
			hold: 0,
			my: 0,
			open: 0,
			totalCount: 0,
			totalQuote: 0,
		},
		invoices: {
			due: { amount: 0, count: 0, label: "DUE" },
			overdue: { amount: 0, count: 0, label: "OVERDUE" },
			generated: { amount: 0, count: 0, label: "GENERATED" },
			notGenerated: { amount: 0, count: 0, label: "NOT GENERATED" },
			pending: [],
			received: [],
			receivedCopy: [],
			totalCount: 0,
		},
		isLoading: false,
		projects: {
			active: 0,
			api: [],
			apiCopy: [],
			closed: 0,
			completed: 0,
			hold: 0,
			paymentReceived: [],
			my: 0,
			totalCount: 0,
			totalInvoiceFees: 0,
		},
		rv: {
			due: { amount: 0, count: 0, label: "DUE" },
			overdue: { amount: 0, count: 0, label: "OVERDUE" },
			generated: { amount: 0, count: 0, label: "GENERATED" },
			notGenerated: { amount: 0, count: 0, label: "NOT GENERATED" },
			total: 0,
		},
		tasks: {
			overdue: 0,
			today: 0,
			tomorrow: 0,
			total: 0,
			upcoming: 0,
		},
	});

	const today = dayjs();
	const inquiriesStatus = MyConstants.Statuses.Inquiries;
	const projectsStatus = MyConstants.Statuses.Projects;

	// Functions
	async function getSupportData() {
		try {
			setMain((s) => ({ ...s, isLoading: true }));

			const response = await axios.get(MyConstants.ApiEndpoints.Dashboard, MyGlobal.GetHeaders());

			if (response.status == 200) {
				const inquiriesObj = Object.assign({}, main.inquiries);
				const invoicesObj = Object.assign({}, main.invoices);
				const projectsObj = Object.assign({}, main.projects);
				const rvObj = Object.assign({}, main.rv);
				const tasksObj = Object.assign({}, main.tasks);

				// Inquiries
				for (const i of response.data.inquiries) {
					if (i.status == inquiriesStatus.Closed) {
						inquiriesObj.closed++;
					} else if (i.status == inquiriesStatus.Confirmed) {
						inquiriesObj.confirmed++;
					} else if (i.status == inquiriesStatus.Hold) {
						inquiriesObj.hold++;
					} else if (i.status == inquiriesStatus.Open) {
						inquiriesObj.open++;
					}

					if (String(i.follow_ups).includes(MyGlobal.GetUserId())) {
						inquiriesObj.my++;
					}

					inquiriesObj.totalQuote += Number(i.quote);
				}

				inquiriesObj.api = response.data.inquiries;
				inquiriesObj.totalCount = response.data.inquiries.length;
				projectsObj.totalCount = response.data.projects.length;
				tasksObj.total = response.data.tasks.length;

				const pending = [];
				const received = [];

				// Projects
				for (const p of response.data.projects) {
					if (p.status == projectsStatus.Active) {
						projectsObj.active++;
					} else if (p.status == projectsStatus.Closed) {
						projectsObj.closed++;
					} else if (p.status == projectsStatus.Completed) {
						projectsObj.completed++;
					} else if (p.status == projectsStatus.Hold) {
						projectsObj.hold++;
					}

					if (String(p.teams).includes(MyGlobal.GetUserId())) {
						projectsObj.my++;
					}

					projectsObj.totalInvoiceFees += Number(p.invoice_fees);

					let amountPending = 0;
					let amountReceived = 0;
					let companyName = "";
					let invoiceAmount = Number(p.invoice_fees);

					const invoice = response.data.invoices.filter((f) => f.project_id == p.id);

					if (Array.isArray(invoice) && invoice.length) {
						invoiceAmount = invoice.reduce((t, i) => t + Number(i.amount), 0);
					}

					const company = response.data.companies.find((f) => f.id == p.company_id);

					if (typeof company === "object") {
						companyName = company.name;
					}

					const transactions = response.data.transactions.filter((f) => f.project_id == p.id);

					if (Array.isArray(transactions) && transactions.length) {
						amountReceived = transactions.reduce((t, v) => {
							return t + Number(v.amount);
						}, 0);
					}

					amountPending = invoiceAmount - amountReceived;

					if (amountPending > 0) {
						pending.push({
							...p,
							amount: invoiceAmount,
							amount_pending: amountPending,
							amount_received: amountReceived,
							company_name: companyName,
						});
					}

					if (amountReceived > 0) {
						received.push({
							...p,
							amount: invoiceAmount,
							amount_pending: amountPending,
							amount_received: amountReceived,
							company_name: companyName,
						});
					}
				}

				projectsObj.api = response.data.projects;
				projectsObj.apiCopy = response.data.projects;
				projectsObj.paymentReceived = pending.filter((f) => f.amount_received !== 0);

				// Tasks
				for (const t of response.data.tasks) {
					const dueDate = dayjs(t.due_on);

					if (dueDate.isBefore(today, "date")) {
						tasksObj.overdue++;
					} else if (dueDate.isSame(today, "date")) {
						tasksObj.today++;
					} else if (dueDate.isSame(today.add(1, "day"), "date")) {
						tasksObj.tomorrow++;
					} else if (dueDate.isAfter(today.add(1, "day"), "date")) {
						if (t.is_completed == 0) {
							tasksObj.upcoming++;
						}
					}
				}

				// Invoices
				response.data.invoices.forEach((fe) => {
					if (fe.due_date) {
						if (dayjs(fe.due_date).isBefore(today, "day")) {
							invoicesObj.due.amount += Number(fe.amount);
							invoicesObj.due.count += 1;

							// Overdue
							const overdue = received.filter((f) => {
								if (f.amount_pending != Number(fe.amount)) {
									return f;
								}
							});

							if (overdue.length) {
								invoicesObj.overdue.amount = overdue.reduce((t, v) => t + v.amount_pending, 0);
								invoicesObj.overdue.count += 1;
							}
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

				invoicesObj.pending = pending;
				invoicesObj.received = received;
				invoicesObj.receivedCopy = received;
				invoicesObj.totalCount = response.data.invoices.length;

				// Reimbursement Voucher
				const rvArray = response.data.rv;
				const taskArray = response.data.tasks;
				const todayStr = dayjs(today).format("YYYY-MM-DD"); // So we don’t parse `today` N times

				const rvProjectIds = new Set();
				const rvArrayLength = rvArray.length;

				for (let i = 0; i < rvArrayLength; i++) {
					const fe = rvArray[i];
					const { due_date, amount, amount_pending, custom_id, project_id } = fe;

					const amountNum = +amount;
					const pendingNum = +amount_pending;

					rvProjectIds.add(project_id); // collect all project_ids from generated RVs

					if (dayjs(due_date).isBefore(todayStr)) {
						rvObj.due.amount += amountNum;
						rvObj.due.count += 1;

						if (pendingNum !== 0) {
							rvObj.overdue.amount += pendingNum;
							rvObj.overdue.count += 1;
						}
					}

					if (custom_id) {
						rvObj.generated.amount += amountNum;
						rvObj.generated.count += 1;
					}
				}

				const taskArrayLength = taskArray.length;

				for (let i = 0; i < taskArrayLength; i++) {
					const fe = taskArray[i];

					if (!rvProjectIds.has(fe.project_id)) {
						rvObj.notGenerated.amount += +fe.expense;
						rvObj.notGenerated.count += 1;
					}
				}

				rvObj.total = rvArrayLength;

				setMain((s) => ({
					...s,
					invoices: invoicesObj,
					inquiries: inquiriesObj,
					projects: projectsObj,
					rv: rvObj,
					tasks: tasksObj,
				}));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Dashboard => Get Support Data");
		} finally {
			setMain((s) => ({ ...s, isLoading: false }));
		}
	}

	// UI Components
	function uiFirstRow() {
		return (
			<div className="flex w-full px-2.5 space-x-10 justify-between items-center">
				<div className="flex w-full space-x-10 justify-between items-center">
					<Projects projects={main.projects} setModuleProps={setModuleProps} />
					<ConfirmedProjects projects={main.projects} />
				</div>
				<div className="flex w-full space-x-10 justify-between items-center">
					<Tasks setModuleProps={setModuleProps} tasks={main.tasks} />
					<PendingPayments invoices={main.invoices.pending} />
				</div>
			</div>
		);
	}

	function uiSecondRow() {
		return (
			<div className="flex w-full p-2.5 space-x-10 justify-between items-center">
				<div className="flex w-full space-x-10 justify-between items-center">
					<Inquiries inquiries={main.inquiries} setModuleProps={setModuleProps} />
					<InquiryAmount inquiries={main.inquiries} />
				</div>
				<div className="flex w-full space-x-10 justify-between items-center">
					<PaymentsReceived invoices={main.invoices} />
					{uiReports()}
				</div>
			</div>
		);
	}

	function uiThirdRow() {
		return (
			<div className="flex w-full p-2.5 space-x-10 justify-between items-center">
				<div className="flex w-full space-x-10 justify-between items-center">
					<Invoices invoices={main.invoices} setModuleProps={setModuleProps} />
				</div>
				<div className="flex w-full space-x-10 justify-between items-center">
					<RVs rv={main.rv} setModuleProps={setModuleProps} />
				</div>
			</div>
		);
	}

	function uiReports() {
		return (
			<div className="flex flex-col w-full space-y-2 justify-start items-center animate__animated animate__zoomIn">
				<div className="flex w-full justify-between items-center">
					<div className="flex w-full space-x-2.5 justify-start items-center font-bold-18 primary-text">
						<span>Reports</span>
					</div>
				</div>
				<div className="flex w-full h-[279.59px] justify-between items-center full-border rounded shadow-md contrast-background"></div>
			</div>
		);
	}

	// Hooks
	useEffect(() => {
		getSupportData();
	}, []);

	// Main UI
	return (
		<div className="w-full h-full p-5 space-y-5 overflow-x-hidden overflow-y-auto">
			{uiFirstRow()}
			{uiSecondRow()}
			{uiThirdRow()}
		</div>
	);
}
