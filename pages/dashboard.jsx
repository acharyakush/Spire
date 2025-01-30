"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import MyConstants from "@/utilities/constants";

import { useEffect, useState } from "react";
import { Badge } from "@/components/Elements";
import { MyGlobal } from "@/utilities/global";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCalendarCheck,
	faCalendarPlus,
	faCalendarWeek,
	faCalendarXmark,
	faCheckDouble,
	faCirclePause,
	faLock,
	faUnlock,
} from "@fortawesome/free-solid-svg-icons";

export default function Dashboard({ setModuleProps }) {
	// Business Logic

	const [main, setMain] = useState({
		inquiries: { closed: 0, confirmed: 0, hold: 0, open: 0, total: 0 },
		invoices: {
			due: { amount: 0, count: 0, label: "DUE" },
			generated: { amount: 0, count: 0, label: "GENERATED" },
			notGenerated: { amount: 0, count: 0, label: "NOT GENERATED" },
			total: 0,
		},
		isLoading: false,
		projects: { active: 0, closed: 0, completed: 0, hold: 0, total: 0 },
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
		}

		return object;
	}

	async function getSupportData() {
		try {
			setMain((s) => ({ ...s, isLoading: true }));

			const response = await axios.get(MyConstants.ApiEndpoints.Dashboard, MyGlobal.GetHeaders());

			if (response.status == 200) {
				const inquiriesCount = { closed: 0, confirmed: 0, hold: 0, open: 0, total: response.data.inquiries.length };

				for (const inquiry of response.data.inquiries) {
					if (inquiry.status == inquiriesStatus.Closed) {
						inquiriesCount.closed++;
					} else if (inquiry.status == inquiriesStatus.Confirmed) {
						inquiriesCount.confirmed++;
					} else if (inquiry.status == inquiriesStatus.Hold) {
						inquiriesCount.hold++;
					} else if (inquiry.status == inquiriesStatus.Open) {
						inquiriesCount.open++;
					}
				}

				const projectsCount = { active: 0, closed: 0, completed: 0, hold: 0, total: response.data.projects.length };

				for (const project of response.data.projects) {
					if (project.status == projectsStatus.Active) {
						projectsCount.active++;
					} else if (project.status == projectsStatus.Closed) {
						projectsCount.closed++;
					} else if (project.status == projectsStatus.Completed) {
						projectsCount.completed++;
					} else if (project.status == projectsStatus.Hold) {
						projectsCount.hold++;
					}
				}

				const tasksCount = { overdue: 0, today: 0, tomorrow: 0, total: response.data.tasks.length, upcoming: 0 };

				for (const task of response.data.tasks) {
					if (dayjs(task.due_on).isBefore(today)) {
						tasksCount.overdue++;
					} else if (dayjs(task.due_on).isSame(today)) {
						tasksCount.today++;
					} else if (dayjs(task.due_on).isSame(today.add(1, "day"), "day")) {
						tasksCount.tomorrow++;
					} else if (dayjs(task.due_on).isAfter(today.add(1, "day"), "day")) {
						tasksCount.upcoming++;
					}
				}

				const invoicesData = Object.assign({}, main.invoices);

				response.data.invoices.forEach((fe) => {
					if (dayjs(fe.due_date).isBefore(today)) {
						invoicesData.due.amount += Number(fe.amount);
						invoicesData.due.count += 1;
					}

					if (fe.custom_id) {
						invoicesData.generated.amount += Number(fe.amount);
						invoicesData.generated.count += 1;
					}
				});

				const invoiceProjectIds = new Set(response.data.invoices.map((m) => m.project_id));

				const isNotGenerated = response.data.projects.filter((f) => !invoiceProjectIds.has(f.id));

				isNotGenerated.forEach((fe, i) => {
					invoicesData.notGenerated.amount += Number(fe.quote);
					invoicesData.notGenerated.count = i + 1;
				});

				invoicesData.total = response.data.invoices.length;

				setMain((s) => ({
					...s,
					invoices: invoicesData,
					inquiries: inquiriesCount,
					projects: projectsCount,
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

		const wrapper = `flex flex-col w-full px-6 pb-4 justify-between items-center rounded shadow-xl text-white cursor-pointer ${aesthetics.background}`;

		return (
			<div className={wrapper} onClick={() => setModuleProps(baseModules.Inquiries, key)}>
				<div className="py-4 px-8 rounded-b-full shadow-2xl gray-background-transparent-01">
					<FontAwesomeIcon className="text-2xl text-white" icon={aesthetics.icon} />
				</div>
				<div className="flex flex-col pt-2 justify-center items-center">
					<span className="tracking-widest uppercase font-medium-8 light-gray-text">{key}</span>
					<span className="font-bold-20">{value}</span>
				</div>
			</div>
		);
	}

	function uiInvoices(key) {
		const aesthetics = getBackgroundAndIcon(key);

		const _key = MyGlobal.TrimInnerSpace(key).toLowerCase();

		const amount = key == main.invoices.notGenerated.label ? main.invoices.notGenerated.amount : main.invoices[_key]?.amount;

		const count = key == main.invoices.notGenerated.label ? main.invoices.notGenerated.count : main.invoices[_key]?.count;

		const wrapper = `flex flex-col w-full px-6 pb-4 justify-between items-center rounded shadow-xl text-white cursor-pointer ${aesthetics.background}`;

		return (
			<div className={wrapper} onClick={() => setModuleProps(baseModules.Invoices, key)}>
				<div className="py-2.5 px-8 rounded-b-full shadow-2xl font-semibold-24 text-white gray-background-transparent-01">{count}</div>
				<div className="flex flex-col pt-2 justify-center items-center">
					<span className="tracking-widest uppercase font-medium-8 light-gray-text">{key}</span>
					<span className="font-bold-20">{MyGlobal.FormatCurrency(amount)}</span>
				</div>
			</div>
		);
	}

	function uiProjectsAndTasks() {
		return (
			<div className="flex w-full p-5 space-x-10 justify-between items-center">
				<div className="flex flex-col w-1/2 space-y-2.5 justify-between items-center">
					<div className="flex w-full space-x-2.5 justify-start items-center font-semibold-30 primary-text">
						<span>{baseModules.Projects}</span>
						<Badge value={main.projects.total} />
					</div>
					<div className="w-full space-y-10 columns-2 gap-x-10">
						{uiProjects(projectsStatus.Active)}
						{uiProjects(projectsStatus.Closed)}
						{uiProjects(projectsStatus.Completed)}
						{uiProjects(projectsStatus.Hold)}
					</div>
				</div>
				<div className="flex flex-col w-1/2 space-y-2.5 justify-between items-center">
					<div className="flex w-full space-x-2.5 justify-start items-center font-semibold-30 primary-text">
						<span>{baseModules.Tasks}</span>
						<Badge value={main.projects.total} />
					</div>
					<div className="w-full space-y-10 columns-2 gap-x-10">
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

		const wrapper = `flex flex-col w-full px-6 pb-4 justify-between items-center rounded shadow-xl text-white cursor-pointer ${aesthetics.background}`;

		return (
			<div className={wrapper} onClick={() => setModuleProps(baseModules.Projects, key)}>
				<div className="py-4 px-8 rounded-b-full shadow-2xl gray-background-transparent-01">
					<FontAwesomeIcon className="text-2xl text-white" icon={aesthetics.icon} />
				</div>
				<div className="flex flex-col pt-2 justify-center items-center">
					<span className="tracking-widest uppercase font-medium-8 light-gray-text">{key}</span>
					<span className="font-bold-20">{value}</span>
				</div>
			</div>
		);
	}

	function uiTasks(key) {
		const aesthetics = getBackgroundAndIcon(key);

		const _key = String(key).toLowerCase();
		const value = main.tasks[_key];

		const wrapper = `flex flex-col w-full px-6 pb-4 justify-between items-center rounded shadow-xl text-white cursor-pointer ${aesthetics.background}`;

		return (
			<div className={wrapper} onClick={() => setModuleProps(baseModules.Tasks, key)}>
				<div className="py-4 px-8 rounded-b-full shadow-2xl gray-background-transparent-01">
					<FontAwesomeIcon className="text-2xl text-white" icon={aesthetics.icon} />
				</div>
				<div className="flex flex-col pt-2 justify-center items-center">
					<span className="tracking-widest uppercase font-medium-8 light-gray-text">{key}</span>
					<span className="font-bold-20">{value}</span>
				</div>
			</div>
		);
	}

	// Hooks
	useEffect(() => {
		getSupportData();
	}, []);

	return (
		<div className="w-full h-full p-5 space-y-5 overflow-y-auto">
			<div className="flex flex-col w-full p-5 space-y-2.5 justify-between items-center">
				<div className="flex w-full space-x-2.5 justify-start items-center font-semibold-30 primary-text">
					<span>{baseModules.Inquiries}</span>
					<Badge value={main.inquiries.total} />
				</div>
				<div className="flex w-full space-x-10 justify-between items-center">
					{uiInquiries(inquiriesStatus.Open)}
					{uiInquiries(inquiriesStatus.Closed)}
					{uiInquiries(inquiriesStatus.Confirmed)}
					{uiInquiries(inquiriesStatus.Hold)}
				</div>
			</div>
			{uiProjectsAndTasks()}
			<div className="flex flex-col w-full p-5 space-y-2.5 justify-between items-center">
				<div className="flex w-full space-x-2.5 justify-start items-center font-semibold-30 primary-text">
					<span>{baseModules.Invoices}</span>
					<Badge value={main.invoices.total} />
				</div>
				<div className="flex w-full space-x-10 justify-between items-center">
					{uiInvoices(main.invoices.due.label)}
					{uiInvoices(main.invoices.generated.label)}
					{uiInvoices(main.invoices.notGenerated.label)}
				</div>
			</div>
		</div>
	);
}
