"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import "tippy.js/animations/shift-away.css";

import SlotCounter from "react-slot-counter";
import MyConstants from "@/utilities/constants";

import { BadgeLarge2, TooltipList } from "@/components/Elements";
import { faCalendarCheck, faCalendarPlus, faCalendarWeek, faCalendarXmark, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Tippy from "@tippyjs/react";

export default function Tasks({ setModuleProps, tasks }) {
	// Functions
	function getBackgroundAndIcon(status) {
		const object = { background: "", icon: "" };

		switch (true) {
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

	// UI Components
	function uiBlock(key) {
		const aesthetics = getBackgroundAndIcon(key);

		const _key = String(key).toLowerCase();
		const value = tasks?.[_key] ?? 0;

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
			<div className="flex flex-col w-full justify-between items-center anim slide-in-down">
				<div className="flex w-full space-x-2.5 justify-between items-center font-bold-16 primary-text">
					<div className="flex w-full space-x-2.5 justify-start items-center">
						<span>{MyConstants.Modules.Base.Tasks}</span>
						<BadgeLarge2>
							<SlotCounter value={tasks?.total ?? 0} />
						</BadgeLarge2>
					</div>
					<Tippy animation="shift-away" content={<TooltipList payload={[`Completed: ${tasks?.completed}`, `Disabled: ${tasks?.disabled}`, `Others: ${tasks?.others}`]} />} placement="bottom">
						<FontAwesomeIcon className="text-yellow-500" icon={faStar} />
					</Tippy>
				</div>
				<div className="w-full pt-2.5 grid grid-cols-2 gap-5">
					{uiBlock("Overdue")}
					{uiBlock("Today")}
					{uiBlock("Tomorrow")}
					{uiBlock("Upcoming")}
				</div>
			</div>
		);
	}

	// Main UI
	return uiMain();
}
