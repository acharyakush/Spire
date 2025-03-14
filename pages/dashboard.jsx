"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import MyConstants from "@/utilities/constants";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { BadgeLarge } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare, faCalendarCheck, faCalendarPlus, faCalendarWeek, faCalendarXmark, faCheckDouble, faCirclePause, faFaceGrinStars, faLock, faUnlock } from "@fortawesome/free-solid-svg-icons";

export default function Dashboard({ setModuleProps }) {
	// Business Logic

	const [main, setMain] = useState({
		inquiries: { closed: 0, confirmed: 0, hold: 0, my: 0, open: 0, total: 0 },
		invoices: {
			due: { amount: 0, count: 0, label: "DUE" },
			generated: { amount: 0, count: 0, label: "GENERATED" },
			notGenerated: { amount: 0, count: 0, label: "NOT GENERATED" },
			total: 0,
		},
		isLoading: false,
		projects: { active: 0, closed: 0, completed: 0, hold: 0, my: 0, total: 0 },
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
				object.background = "primary-background-gradient";
				object.icon = faLock;
				break;
			case status == inquiriesStatus.Open || status == main.invoices.notGenerated.label || status == projectsStatus.Active:
				object.background = "orange-background-gradient";
				object.icon = faUnlock;
				break;
			case status == inquiriesStatus.Confirmed || status == main.invoices.generated.label || status == projectsStatus.Completed:
				object.background = "green-background-gradient";
				object.icon = faCheckDouble;
				break;
			case status == inquiriesStatus.Hold || status == main.invoices.due.label || status == projectsStatus.Hold:
				object.background = "red-background-gradient";
				object.icon = faCirclePause;
				break;
			case status == "Tomorrow":
				object.background = "primary-background-gradient";
				object.icon = faCalendarWeek;
				break;
			case status == "Today":
				object.background = "orange-background-gradient";
				object.icon = faCalendarCheck;
				break;
			case status == "Upcoming":
				object.background = "green-background-gradient";
				object.icon = faCalendarPlus;
				break;
			case status == "Overdue":
				object.background = "red-background-gradient";
				object.icon = faCalendarXmark;
				break;
			default:
				object.background = "yellow-background-gradient";
				object.icon = faFaceGrinStars;
				break;
		}

		return object;
	}

	async function getSupportData() {
		try {
			setMain((s) => ({ ...s, isLoading: true }));

			const response = await axios.get(MyConstants.ApiEndpoints.Dashboard, MyGlobal.GetHeaders());

			if (response.status == 200) {
				const inquiriesCount = { closed: 0, confirmed: 0, hold: 0, my: 0, open: 0, total: response.data.inquiries.length };

				const projectsCount = { active: 0, closed: 0, completed: 0, hold: 0, my: 0, total: response.data.projects.length };

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
				}

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
				}

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
					if (dayjs(fe.due_date).isBefore(today)) {
						invoicesObj.due.amount += Number(fe.amount);
						invoicesObj.due.count += 1;
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
				const notGeneratedRv = response.data.projects.filter((f) => !rvProjectIds.has(f.id));

				notGeneratedRv.forEach((fe, i) => {
					rvObj.notGenerated.amount += Number(fe.quote);
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
	function uiInquiries(key) {
		const aesthetics = getBackgroundAndIcon(key);

		const _key = String(key).toLowerCase();
		const value = main.inquiries[_key];

		const wrapper = `flex w-full py-6 justify-between items-center rounded shadow-xl text-white cursor-pointer ${aesthetics.background}`;

		return (
			<div className={wrapper} onClick={() => setModuleProps(baseModules.Inquiries, key)}>
				<div className="py-4 px-8 rounded-r-full shadow-2xl gray-background-transparent-02">
					<FontAwesomeIcon className="text-white" icon={aesthetics.icon} size="xl" />
				</div>
				<div className="flex flex-col px-8 justify-center items-center">
					<span className="tracking-widest uppercase font-medium-8 light-gray-text">{key}</span>
					<span className="font-bold-28">{value}</span>
				</div>
			</div>
		);
	}

	function uiInvoices(key) {
		const aesthetics = getBackgroundAndIcon(key);

		const _key = MyGlobal.TrimInnerSpace(key).toLowerCase();

		const amount = key == main.invoices.notGenerated.label ? main.invoices.notGenerated.amount : main.invoices[_key]?.amount;

		const count = key == main.invoices.notGenerated.label ? main.invoices.notGenerated.count : main.invoices[_key]?.count;

		const wrapper = `flex w-full py-6 justify-between items-center rounded shadow-xl text-white cursor-pointer ${aesthetics.background}`;

		return (
			<div className={wrapper} onClick={() => setModuleProps(baseModules.Invoices, key)}>
				<div className="py-4 px-8 rounded-r-full shadow-2xl font-semibold-24 text-white gray-background-transparent-02">{count}</div>
				<div className="flex flex-col px-8 justify-center items-center">
					<span className="tracking-widest uppercase font-medium-8 light-gray-text">{key}</span>
					<span className="font-bold-28">{MyGlobal.FormatCurrency(amount)}</span>
				</div>
			</div>
		);
	}

	function uiMyInquiries() {
		const aesthetics = getBackgroundAndIcon();

		const wrapper = `flex w-full py-6 justify-between items-center rounded shadow-xl text-white cursor-pointer ${aesthetics.background}`;

		return (
			<div className={wrapper} onClick={() => setModuleProps(baseModules.Inquiries, "my-inquiries")}>
				<div className="py-4 px-8 rounded-r-full shadow-2xl gray-background-transparent-02">
					<FontAwesomeIcon className="text-white" icon={aesthetics.icon} size="xl" />
				</div>
				<div className="flex flex-col px-8 justify-center items-center">
					<span className="tracking-widest uppercase font-medium-8 light-gray-text">Mine</span>
					<span className="font-bold-28">{main.inquiries.my}</span>
				</div>
			</div>
		);
	}

	function uiMyProjects() {
		const aesthetics = getBackgroundAndIcon();

		const wrapper = `flex w-full py-6 justify-between items-center rounded shadow-xl text-white cursor-pointer ${aesthetics.background}`;

		return (
			<div className={wrapper} onClick={() => setModuleProps("projectsOrTasks", "my-projects")}>
				<div className="py-4 px-8 rounded-r-full shadow-2xl gray-background-transparent-02">
					<FontAwesomeIcon className="text-white" icon={aesthetics.icon} size="xl" />
				</div>
				<div className="flex flex-col px-8 justify-center items-center">
					<span className="tracking-widest uppercase font-medium-8 light-gray-text">Mine</span>
					<span className="font-bold-28">{main.projects.my}</span>
				</div>
			</div>
		);
	}

	function uiProjectsAndTasks() {
		return (
			<div className="flex w-full p-5 justify-between items-center">
				<div className="flex flex-col w-1/2 justify-between items-start">
					<div className="flex w-4/5 space-x-2.5 justify-start items-center font-bold-24 primary-text">
						<span>{baseModules.Projects}</span>
						<BadgeLarge value={main.projects.total} />
					</div>
					<div className="w-4/5 pt-2.5 space-y-5 columns-3 gap-x-5">
						{uiProjects(projectsStatus.Active)}
						{uiProjects(projectsStatus.Closed)}
						{uiProjects(projectsStatus.Completed)}
						{uiProjects(projectsStatus.Hold)}
						{uiMyProjects()}
					</div>
				</div>
				<div className="flex flex-col w-1/2 justify-between items-end">
					<div className="flex w-4/5 space-x-2.5 justify-start items-center font-bold-24 primary-text">
						<span>{baseModules.Tasks}</span>
						<BadgeLarge value={main.tasks.total} />
					</div>
					<div className="w-4/5 pt-2.5 space-y-5 columns-2 gap-x-5">
						{uiTasks("Overdue")}
						{uiTasks("Today")}
						{uiTasks("Tomorrow")}
						{uiTasks("Upcoming")}
					</div>
				</div>
			</div>
		);
	}

	function uiProjects(key) {
		const aesthetics = getBackgroundAndIcon(key);

		const _key = String(key).toLowerCase();
		const value = main.projects[_key];

		const wrapper = `flex w-full py-6 justify-between items-center rounded shadow-xl text-white cursor-pointer ${aesthetics.background}`;

		return (
			<div className={wrapper} onClick={() => setModuleProps("projectsOrTasks", key)}>
				<div className="py-4 px-8 rounded-r-full shadow-2xl gray-background-transparent-02">
					<FontAwesomeIcon className="text-white" icon={aesthetics.icon} size="xl" />
				</div>
				<div className="flex flex-col px-8 justify-center items-center">
					<span className="tracking-widest uppercase font-medium-8 light-gray-text">{key}</span>
					<span className="font-bold-28">{value}</span>
				</div>
			</div>
		);
	}

	function uiRv(key) {
		const aesthetics = getBackgroundAndIcon(key);

		const _key = MyGlobal.TrimInnerSpace(key).toLowerCase();

		const amount = key == main.rv.notGenerated.label ? main.rv.notGenerated.amount : main.rv[_key]?.amount;
		const count = key == main.rv.notGenerated.label ? main.rv.notGenerated.count : main.rv[_key]?.count;

		const wrapper = `flex w-full py-6 justify-between items-center rounded shadow-xl text-white cursor-pointer ${aesthetics.background}`;

		return (
			<div className={wrapper} onClick={() => setModuleProps(baseModules.Rv, key)}>
				<div className="py-4 px-8 rounded-r-full shadow-2xl font-semibold-24 text-white gray-background-transparent-02">{count}</div>
				<div className="flex flex-col px-8 justify-center items-center">
					<span className="tracking-widest uppercase font-medium-8 light-gray-text">{key}</span>
					<span className="font-bold-28">{MyGlobal.FormatCurrency(amount)}</span>
				</div>
			</div>
		);
	}

	function uiTasks(key) {
		const aesthetics = getBackgroundAndIcon(key);

		const _key = String(key).toLowerCase();
		const value = main.tasks[_key];

		const wrapper = `flex w-full py-6 justify-between items-center rounded shadow-xl text-white cursor-pointer ${aesthetics.background}`;

		return (
			<div className={wrapper} onClick={() => setModuleProps("projectsOrTasks", key)}>
				<div className="py-4 px-8 rounded-r-full shadow-2xl gray-background-transparent-02">
					<FontAwesomeIcon className="text-white" icon={aesthetics.icon} size="xl" />
				</div>
				<div className="flex flex-col px-8 justify-center items-center">
					<span className="tracking-widest uppercase font-medium-8 light-gray-text">{key}</span>
					<span className="font-bold-28">{value}</span>
				</div>
			</div>
		);
	}

	// Hooks
	useEffect(() => {
		getSupportData();
	}, []);

	return (
		<div className="w-full h-full p-5 space-y-1 overflow-y-auto">
			<div className="flex flex-col w-full p-5 space-y-2.5 justify-between items-center">
				<div className="flex w-full space-x-2.5 justify-start items-center font-bold-24 primary-text">
					<span>{baseModules.Inquiries}</span>
					<BadgeLarge value={main.inquiries.total} />
				</div>
				<div className="flex w-full space-x-14 justify-between items-center">
					{uiInquiries(inquiriesStatus.Open)}
					{uiInquiries(inquiriesStatus.Closed)}
					{uiInquiries(inquiriesStatus.Confirmed)}
					{uiInquiries(inquiriesStatus.Hold)}
					{uiMyInquiries()}
				</div>
			</div>
			{uiProjectsAndTasks()}
			<div className="flex flex-col w-full p-5 space-y-2.5 justify-between items-center">
				<div className="flex w-full space-x-2.5 justify-start items-center font-bold-24 primary-text">
					<span>{baseModules.Invoices}</span>
					<BadgeLarge value={main.projects.total} />
				</div>
				<div className="flex w-full space-x-48 justify-between items-center">
					{uiInvoices(main.invoices.due.label)}
					{uiInvoices(main.invoices.generated.label)}
					{uiInvoices(main.invoices.notGenerated.label)}
				</div>
			</div>
			<div className="flex flex-col w-full p-5 space-y-2.5 justify-between items-center">
				<div className="flex w-full space-x-2.5 justify-start items-center font-bold-24 primary-text">
					<span>{baseModules.Rv}</span>
					<BadgeLarge value={main.projects.total} />
				</div>
				<div className="flex w-full space-x-48 justify-between items-center">
					{uiRv(main.rv.due.label)}
					{uiRv(main.rv.generated.label)}
					{uiRv(main.rv.notGenerated.label)}
				</div>
			</div>
		</div>
	);
}
