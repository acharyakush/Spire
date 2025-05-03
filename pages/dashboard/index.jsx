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
	const [data, setData] = useState({
		isLoading: false,
		showRow1: false,
		showRow2: false,
		showRow3: false,
	});

	const [inquiries, setInquiries] = useState({
		api: [],
		closed: 0,
		confirmed: 0,
		hold: 0,
		my: 0,
		open: 0,
		totalCount: 0,
		totalQuote: 0,
	});

	const [invoices, setInvoices] = useState({
		due: { amount: 0, count: 0, label: "DUE" },
		overdue: { amount: 0, count: 0, label: "OVERDUE" },
		generated: { amount: 0, count: 0, label: "GENERATED" },
		notGenerated: { amount: 0, count: 0, label: "NOT GENERATED" },
		pending: [],
		received: [],
		receivedCopy: [],
		totalCount: 0,
	});

	const [projects, setProjects] = useState({
		active: 0,
		api: [],
		apiCopy: [],
		closed: 0,
		completed: 0,
		hold: 0,
		paymentOverdue: [],
		paymentPending: [],
		paymentReceived: [],
		my: 0,
		totalCount: 0,
		totalInvoiceFees: 0,
	});

	const [rv, setRv] = useState({
		due: { amount: 0, count: 0, label: "DUE" },
		overdue: { amount: 0, count: 0, label: "OVERDUE" },
		generated: { amount: 0, count: 0, label: "GENERATED" },
		notGenerated: { amount: 0, count: 0, label: "NOT GENERATED" },
		total: 0,
	});

	const [tasks, setTasks] = useState({
		overdue: 0,
		today: 0,
		tomorrow: 0,
		total: 0,
		upcoming: 0,
	});

	const today = dayjs();
	const inqStatus = MyConstants.Statuses.Inquiries;
	const prjStatus = MyConstants.Statuses.Projects;

	// Functions
	function getInquiries(list) {
		const obj = Object.assign({}, inquiries);

		for (const i of list) {
			i.status == inqStatus.Closed && obj.closed++;
			i.status == inqStatus.Confirmed && obj.confirmed++;
			i.status == inqStatus.Hold && obj.hold++;
			i.status == inqStatus.Open && obj.open++;

			String(i.follow_ups).includes(MyGlobal.GetUserId()) && obj.my++;

			obj.totalQuote += +i.quote;
		}

		obj.api = list;
		obj.totalCount = list.length;

		setInquiries(obj);
	}

	function getInvoices(list, paymentOverdue, paymentPending, paymentReceived, prjList) {
		const obj = Object.assign({}, invoices);

		let dueAmount = 0;
		let dueCount = 0;

		let overDueAmount = 0;
		let overDueCount = 0;

		let generatedAmount = 0;
		let generatedCount = 0;

		for (let i = 0; i < list.length; i++) {
			const fe = list[i];
			const amount = +fe.amount;

			if (fe.due_date) {
				if (dayjs(fe.due_date).isBefore(today, "day")) {
					dueAmount += amount;
					dueCount += 1;
				}
			}

			if (fe.custom_id) {
				generatedAmount += amount;
				generatedCount += 1;
			}
		}

		for (let j = 0; j < paymentOverdue.length; j++) {
			const f = paymentOverdue[j];

			overDueAmount += f.amount_pending;
			overDueCount += 1;
		}

		obj.due.amount = dueAmount;
		obj.due.count = dueCount;

		obj.overdue.amount = overDueAmount;
		obj.overdue.count = overDueCount;

		obj.generated.amount = generatedAmount;
		obj.generated.count = generatedCount;

		const invoiceProjectIds = new Set(list.map((m) => m.project_id));
		const isNotGenerated = prjList.filter((f) => !invoiceProjectIds.has(f.id));

		let notGenAmount = 0;
		let notGenCount = 0;

		for (let i = 0; i < isNotGenerated.length; i++) {
			notGenAmount += +isNotGenerated[i].quote;
			notGenCount++;
		}

		obj.notGenerated.amount = notGenAmount;
		obj.notGenerated.count = notGenCount;

		obj.pending = paymentPending;
		obj.received = paymentReceived;
		obj.receivedCopy = paymentReceived;
		obj.totalCount = list.length;

		setInvoices(obj);
	}

	function getProjects(_companies, _invoices, invoicesTransactions, list) {
		const obj = Object.assign({}, projects);

		const moneyPendingPrjs = [];
		const moneyReceivedPrjs = [];
		const moneyOverduePrjs = [];

		for (const p of list) {
			p.status == prjStatus.Active && obj.active++;
			p.status == prjStatus.Closed && obj.closed++;
			p.status == prjStatus.Completed && obj.completed++;
			p.status == prjStatus.Hold && obj.hold++;

			String(p.teams).includes(MyGlobal.GetUserId()) && obj.my++;

			obj.totalInvoiceFees += +p.invoice_fees;

			let amountPending = 0;
			let amountReceived = 0;
			let companyName = "";
			let invoiceAmount = +p.invoice_fees;
			let invoiceDueDate = "";

			const invoice = _invoices.filter((f) => f.project_id == p.id);

			if (Array.isArray(invoice) && invoice.length) {
				invoiceAmount = invoice.reduce((t, i) => t + +i.amount, 0);
				invoiceDueDate = invoice.map((m) => (m.due_date ? dayjs(m.due_date).format("DD/MM/YYYY") : "")).at(0);
			}

			const company = _companies.find((f) => f.id == p.company_id);

			if (typeof company === "object") {
				companyName = company.name;
			}

			const transactions = invoicesTransactions.filter((f) => f.project_id == p.id);

			if (Array.isArray(transactions) && transactions.length) {
				amountReceived = transactions.reduce((t, v) => {
					return t + +v.amount;
				}, 0);
			}

			amountPending = invoiceAmount - amountReceived;

			const finalObj = {
				...p,
				amount: invoiceAmount,
				amount_pending: amountPending,
				amount_received: amountReceived,
				company_name: companyName,
				invoice_due_date: invoiceDueDate,
			};

			if (invoiceDueDate && amountPending != 0) {
				moneyOverduePrjs.push(finalObj);
			}

			if (amountPending > 0) {
				moneyPendingPrjs.push(finalObj);
			}

			if (amountReceived > 0) {
				moneyReceivedPrjs.push(finalObj);
			}
		}

		obj.api = list;
		obj.apiCopy = list;
		obj.paymentOverdue = moneyOverduePrjs;
		obj.paymentPending = moneyPendingPrjs;
		obj.paymentReceived = moneyReceivedPrjs;
		obj.totalCount = list.length;

		setProjects(obj);

		return obj;
	}

	function getRv(list, tskList) {
		const obj = Object.assign({}, rv);

		const rvProjectIds = new Set();
		const todayStr = dayjs(today).format("YYYY-MM-DD");

		let rvDueAmount = 0;
		let rvDueCount = 0;
		let rvOverDueAmount = 0;
		let rvOverDueCount = 0;
		let rvGenAmount = 0;
		let rvGenCount = 0;

		for (let i = 0; i < list.length; i++) {
			const fe = list[i];
			const { due_date, amount, amount_pending, custom_id, project_id } = fe;

			const amountNum = +amount;
			const pendingNum = +amount_pending;

			rvProjectIds.add(project_id); // collect all project_ids from generated RVs

			if (dayjs(due_date).isBefore(todayStr)) {
				rvDueAmount += amountNum;
				rvDueCount += 1;

				if (pendingNum !== 0) {
					rvOverDueAmount += pendingNum;
					rvOverDueCount += 1;
				}
			}

			if (custom_id) {
				rvGenAmount += amountNum;
				rvGenCount += 1;
			}
		}

		obj.due.amount = rvDueAmount;
		obj.due.count = rvDueCount;

		obj.overdue.amount = rvOverDueAmount;
		obj.overdue.count = rvOverDueCount;

		obj.generated.amount = rvGenAmount;
		obj.generated.count = rvGenCount;

		let notGenRvAmount = 0;
		let notGenRvCount = 0;

		for (let i = 0; i < tskList.length; i++) {
			const fe = tskList[i];

			if (!rvProjectIds.has(fe.project_id)) {
				notGenRvAmount += +fe.expense;
				notGenRvCount += 1;
			}
		}

		obj.notGenerated.amount = notGenRvAmount;
		obj.notGenerated.count = notGenRvCount;
		obj.total = list.length;

		setRv(obj);
	}

	function getTasks(list) {
		const obj = Object.assign({}, tasks);

		for (const t of list) {
			const dueDate = dayjs(t.due_on);

			dueDate.isBefore(today, "date") && obj.overdue++;
			dueDate.isSame(today, "date") && obj.today++;
			dueDate.isSame(today.add(1, "day"), "date") && obj.tomorrow++;

			if (dueDate.isAfter(today.add(1, "day"), "date")) {
				t.is_completed == 0 && obj.upcoming++;
			}
		}

		obj.total = list.length;

		setTasks(obj);
	}

	async function getSupportData() {
		try {
			setData((s) => ({ ...s, isLoading: true }));

			const response = await axios.get(MyConstants.ApiEndpoints.Dashboard, MyGlobal.GetHeaders());

			if (response.status == 200) {
				const { companies, inquiries, invoices, projects, rv, tasks, transactions } = response.data;

				const prjs = getProjects(companies, invoices, transactions, projects);

				getTasks(tasks);
				getInquiries(inquiries);
				getInvoices(invoices, prjs.paymentOverdue, prjs.paymentPending, prjs.paymentReceived, projects);
				getRv(rv, tasks);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Dashboard => Get Support Data");
		} finally {
			setData((s) => ({ ...s, isLoading: false }));
		}
	}

	function setValues(key, value) {
		setData((s) => ({ ...s, [key]: value }));
	}

	// UI Components
	function uiRow1() {
		if (data.showRow1) {
			const transition = `row-fade ${data.showRow1 ? "shown" : ""}`;

			return (
				<div className={transition}>
					<div className="flex w-full px-2.5 space-x-10 justify-between items-center">
						<div className="flex w-full space-x-10 justify-between items-center">
							<Projects projects={projects} setModuleProps={setModuleProps} />
							<ConfirmedProjects projects={projects} />
						</div>
						<div className="flex w-full space-x-10 justify-between items-center">
							<Tasks setModuleProps={setModuleProps} tasks={tasks} />
							<PendingPayments invoices={invoices.pending} />
						</div>
					</div>
				</div>
			);
		}
	}

	function uiRow2() {
		if (data.showRow2) {
			const transition = `row-fade ${data.showRow2 ? "shown" : ""}`;

			return (
				<div className={transition}>
					<div className="flex w-full p-2.5 space-x-10 justify-between items-center">
						<div className="flex w-full space-x-10 justify-between items-center">
							<Inquiries inquiries={inquiries} setModuleProps={setModuleProps} />
							<InquiryAmount inquiries={inquiries} />
						</div>
						<div className="flex w-full space-x-10 justify-between items-center">
							<PaymentsReceived invoices={invoices} />
							{uiReports()}
						</div>
					</div>
				</div>
			);
		}
	}

	function uiRow3() {
		if (data.showRow3) {
			const transition = `row-fade ${data.showRow3 ? "shown" : ""}`;

			return (
				<div className={transition}>
					<div className="flex w-full p-2.5 space-x-10 justify-between items-center">
						<div className="flex w-full space-x-10 justify-between items-center">
							<Invoices invoices={invoices} setModuleProps={setModuleProps} />
						</div>
						<div className="flex w-full space-x-10 justify-between items-center">
							<RVs rv={rv} setModuleProps={setModuleProps} />
						</div>
					</div>
				</div>
			);
		}
	}

	function uiReports() {
		return (
			<div className="flex flex-col w-full space-y-2 justify-start items-center anim zoom-in">
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

	useEffect(() => {
		const delay1 = setTimeout(() => setValues("showRow1", true), 400);
		const delay2 = setTimeout(() => setValues("showRow2", true), 800);
		const delay3 = setTimeout(() => setValues("showRow3", true), 1200);

		return () => {
			clearTimeout(delay1);
			clearTimeout(delay2);
			clearTimeout(delay3);
		};
	}, []);

	// Main UI
	return (
		<div className="w-full h-full p-5 space-y-5 overflow-x-hidden overflow-y-auto">
			{uiRow1()}
			{uiRow2()}
			{uiRow3()}
		</div>
	);
}
