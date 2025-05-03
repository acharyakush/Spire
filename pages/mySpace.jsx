"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import SlotCounter from "react-slot-counter";
import MyConstants from "@/utilities/constants";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { BadgeLarge2 } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarCheck, faCalendarPlus, faCalendarWeek, faCalendarXmark, faCheckDouble, faCirclePause, faFaceGrinStars, faLock, faUnlock } from "@fortawesome/free-solid-svg-icons";

export default function MySpace({ setModuleProps }) {
	// Business Logic

	const [main, setMain] = useState({
		inquiries: { closed: 0, confirmed: 0, hold: 0, my: 0, open: 0, total: 0 },
		isLoading: false,
		projects: { active: 0, closed: 0, completed: 0, hold: 0, my: 0, total: 0 },
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
			case status == inquiriesStatus.Open || status == projectsStatus.Active:
				object.background = "dashboard-orange-1";
				object.icon = faUnlock;
				break;
			case status == inquiriesStatus.Confirmed || status == projectsStatus.Completed:
				object.background = "dashboard-blue-3";
				object.icon = faCheckDouble;
				break;
			case status == inquiriesStatus.Hold || status == projectsStatus.Hold:
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
				object.background = "dashboard-blue-3";
				object.icon = faCalendarPlus;
				break;
			case status == "Overdue":
				object.background = "dashboard-orange-1";
				object.icon = faCalendarXmark;
				break;
			default:
				object.background = "yellow-background";
				object.icon = faFaceGrinStars;
				break;
		}

		return object;
	}

	async function getSupportData() {
		try {
			setMain((s) => ({ ...s, isLoading: true }));

			const response = await axios.get(MyConstants.ApiEndpoints.GetMySpace, MyGlobal.GetHeaders({ userId: MyGlobal.GetUserId() }));

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

				setMain((s) => ({
					...s,
					inquiries: inquiriesCount,
					projects: projectsCount,
					tasks: tasksCount,
				}));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Dashboard => Get My Space Data");
		} finally {
			setMain((s) => ({ ...s, isLoading: false }));
		}
	}

	// UI Components
	function uiInquiries(key) {
		const aesthetics = getBackgroundAndIcon(key);

		const _key = String(key).toLowerCase();
		const value = main.inquiries[_key];

		let effect = "";
		let zoomRotate = "";

		if (key === inquiriesStatus.Open) {
			effect = "anim fade-in-top-left";
			zoomRotate = "zoom-rotate-right";
		} else if (key === inquiriesStatus.Closed) {
			effect = "anim fade-in-top-left";
			zoomRotate = "zoom-rotate-left";
		} else if (key === inquiriesStatus.Hold) {
			effect = "anim fade-in-top-right";
			zoomRotate = "zoom-rotate-left";
		} else {
			effect = "anim fade-in-top-right";
			zoomRotate = "zoom-rotate-right";
		}

		const wrapper = `flex w-full text-white cursor-pointer ${effect}`;

		return (
			<div className={wrapper} onClick={() => setModuleProps(baseModules.Inquiries, `MySpace${key}`)}>
				<div className={`flex w-full py-6 justify-between items-center rounded-2xl shadow-xl ${zoomRotate} ${aesthetics.background}`}>
					<div className="py-4 px-8 rounded-r-full shadow-2xl gray-background-transparent-02">
						<FontAwesomeIcon className="text-white" icon={aesthetics.icon} size="xl" />
					</div>
					<div className="flex flex-col px-8 justify-center items-center">
						<span className="tracking-widest uppercase font-medium-8 light-gray-text">{key}</span>
						<span className="font-bold-28">
							<SlotCounter value={value} />
						</span>
					</div>
				</div>
			</div>
		);
	}

	function uiProjectsAndTasks() {
		return (
			<div className="flex w-full p-5 justify-between items-start">
				<div className="flex flex-col w-1/2 justify-between items-start">
					<div className="flex w-4/5 space-x-2.5 justify-start items-center font-bold-24 primary-text anim slide-in-down">
						<span>{baseModules.Projects}</span>
						<BadgeLarge2>
							<SlotCounter value={main.projects.total} />
						</BadgeLarge2>
					</div>
					<div className="w-4/5 pt-2.5 grid grid-cols-2 gap-5">
						<div className="flex flex-col space-y-5 justify-start items-start">
							{uiProjects(projectsStatus.Active)}
							{uiProjects(projectsStatus.Closed)}
						</div>
						<div className="flex flex-col space-y-5 justify-start items-start">
							{uiProjects(projectsStatus.Completed)}
							{uiProjects(projectsStatus.Hold)}
						</div>
					</div>
				</div>
				<div className="flex flex-col w-1/2 justify-between items-end">
					<div className="flex w-4/5 space-x-2.5 justify-start items-center font-bold-24 primary-text anim slide-in-down">
						<span>{baseModules.Tasks}</span>
						<BadgeLarge2>
							<SlotCounter value={main.tasks.total} />
						</BadgeLarge2>
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

		let effect = "";
		let zoomRotate = "";

		if (key === projectsStatus.Active) {
			effect = "anim fade-in-top-left";
			zoomRotate = "zoom-rotate-right";
		} else if (key === projectsStatus.Closed) {
			effect = "anim fade-in-left";
			zoomRotate = "zoom-rotate-left";
		} else if (key === projectsStatus.Hold) {
			effect = "anim fade-in-bottom-right";
			zoomRotate = "zoom-rotate-right";
		} else if (key === projectsStatus.Completed) {
			effect = "anim fade-in-top-right";
			zoomRotate = "zoom-rotate-left";
		} else {
			effect = "anim fade-in-bottom-right";
		}

		const wrapper = `flex w-full text-white cursor-pointer ${effect}`;

		return (
			<div className={wrapper} onClick={() => setModuleProps("projectsOrTasks", `MySpace${key}`)}>
				<div className={`flex w-full py-6 justify-between items-center rounded-2xl shadow-xl ${zoomRotate} ${aesthetics.background}`}>
					<div className="py-4 px-8 rounded-r-full shadow-2xl gray-background-transparent-02">
						<FontAwesomeIcon className="text-white" icon={aesthetics.icon} size="xl" />
					</div>
					<div className="flex flex-col px-8 justify-center items-center">
						<span className="tracking-widest uppercase font-medium-8 light-gray-text">{key}</span>
						<span className="font-bold-28">
							<SlotCounter value={value} />
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
			effect = "anim fade-in-top-left";
			zoomRotate = "zoom-rotate-right";
		} else if (key === "Today") {
			effect = "anim fade-in-bottom-left";
			zoomRotate = "zoom-rotate-left";
		} else if (key === "Tomorrow") {
			effect = "anim fade-in-top-right";
			zoomRotate = "zoom-rotate-left";
		} else {
			effect = "anim fade-in-bottom-right";
			zoomRotate = "zoom-rotate-right";
		}

		const wrapper = `flex w-full text-white cursor-pointer ${effect}`;

		return (
			<div className={wrapper} onClick={() => setModuleProps("projectsOrTasks", `MySpace${key}`)}>
				<div className={`flex w-full py-6 justify-between items-center rounded-2xl shadow-xl ${zoomRotate} ${aesthetics.background}`}>
					<div className="py-4 px-8 rounded-r-full shadow-2xl gray-background-transparent-02">
						<FontAwesomeIcon className="text-white" icon={aesthetics.icon} size="xl" />
					</div>
					<div className="flex flex-col px-8 justify-center items-center">
						<span className="tracking-widest uppercase font-medium-8 light-gray-text">{key}</span>
						<span className="font-bold-28">
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
			<div className="flex flex-col w-full p-5 space-y-2.5 justify-between items-center">
				<div className="flex w-full space-x-2.5 justify-start items-center font-bold-24 primary-text anim slide-in-down">
					<span>{baseModules.Inquiries}</span>
					<BadgeLarge2>
						<SlotCounter value={main.inquiries.total} />
					</BadgeLarge2>
				</div>
				<div className="flex w-full space-x-14 justify-between items-center">
					{uiInquiries(inquiriesStatus.Open)}
					{uiInquiries(inquiriesStatus.Closed)}
					{uiInquiries(inquiriesStatus.Confirmed)}
					{uiInquiries(inquiriesStatus.Hold)}
				</div>
			</div>
			{uiProjectsAndTasks()}
		</div>
	);
}
