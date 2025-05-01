"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import SlotCounter from "react-slot-counter";
import MyConstants from "@/utilities/constants";

import { BadgeLarge2 } from "@/components/Elements";
import { faCheckDouble, faCirclePause, faLock, faUnlock } from "@fortawesome/free-solid-svg-icons";

export default function Projects({ projects, setModuleProps }) {
	// Business Logic
	const projectsStatus = MyConstants.Statuses.Projects;

	// Functions
	function getBackgroundAndIcon(status) {
		const object = { background: "", icon: "" };

		switch (true) {
			case status == projectsStatus.Closed:
				object.background = "dashboard-blue-2";
				object.icon = faLock;
				break;
			case status == projectsStatus.Active:
				object.background = "dashboard-orange-1";
				object.icon = faUnlock;
				break;
			case status == projectsStatus.Completed:
				object.background = "dashboard-blue-3";
				object.icon = faCheckDouble;
				break;
			case status == projectsStatus.Hold:
				object.background = "dashboard-blue-4";
				object.icon = faCirclePause;
				break;
		}

		return object;
	}

	// UI Components
	function uiBlock(key) {
		const aesthetics = getBackgroundAndIcon(key);

		const _key = String(key).toLowerCase();
		const value = projects?.[_key] ?? 0;

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
				<div className={`flex w-full py-6 justify-center items-center rounded shadow-md ${zoomRotate} ${aesthetics.background}`}>
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

	function uiMain() {
		return (
			<div className="flex flex-col w-full justify-between items-center animate__animated animate__slideInDown">
				<div className="flex w-full space-x-2.5 justify-start items-center font-bold-16 primary-text">
					<span>{MyConstants.Modules.Base.Projects}</span>
					<BadgeLarge2>
						<SlotCounter value={projects?.total ?? 0} />
					</BadgeLarge2>
				</div>
				<div className="w-full pt-2.5 grid grid-cols-2 gap-5">
					{uiBlock(projectsStatus.Active)}
					{uiBlock(projectsStatus.Completed)}
					{uiBlock(projectsStatus.Closed)}
					{uiBlock(projectsStatus.Hold)}
				</div>
			</div>
		);
	}

	// Main UI
	return uiMain();
}
