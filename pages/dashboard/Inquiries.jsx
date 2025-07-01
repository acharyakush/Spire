"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import SlotCounter from "react-slot-counter";
import MyConstants from "@/utilities/constants";

import { isDevelopment } from "@/utilities/global";
import { BadgeLarge2 } from "@/components/Elements";
import { faCheckDouble, faCirclePause, faLock, faUnlock } from "@fortawesome/free-solid-svg-icons";

export default function Inquiries({ inquiries, setModuleProps }) {
	// Business Logic
	const baseModules = MyConstants.Modules.Base;
	const inquiriesStatus = MyConstants.Statuses.Inquiries;

	// Functions
	function getBackgroundAndIcon(status) {
		const object = { background: "", icon: "" };

		switch (true) {
			case status == inquiriesStatus.Closed:
				object.background = "dashboard-blue-2";
				object.icon = faLock;
				break;
			case status == inquiriesStatus.Open:
				object.background = "dashboard-orange-1";
				object.icon = faUnlock;
				break;
			case status == inquiriesStatus.Confirmed:
				object.background = "dashboard-blue-3";
				object.icon = faCheckDouble;
				break;
			case status == inquiriesStatus.Hold:
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
		const value = inquiries?.[_key] ?? 0;

		let effect = "";
		let zoomRotate = "";

		if (!isDevelopment) {
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
				effect = "anim fade-in-down";
				zoomRotate = "zoom-rotate-right";
			}
		}

		const wrapper = `flex w-full text-white cursor-pointer ${effect}`;

		return (
			<div
				className={wrapper}
				onClick={() => setModuleProps(baseModules.Inquiries, key)}>
				<div className={`flex w-full py-6 justify-center items-center rounded shadow-md ${zoomRotate} ${aesthetics.background}`}>
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

	function uiMain() {
		const transition = isDevelopment ? "" : "anim slide-in-down";
		const wrapper = "flex flex-col w-full justify-between items-start " + transition;

		return (
			<div className={wrapper}>
				<div className="flex w-full space-x-2.5 justify-start items-center font-bold-16 primary-text ">
					<span>{baseModules.Inquiries}</span>
					<BadgeLarge2>
						<SlotCounter value={inquiries?.totalCount ?? 0} />
					</BadgeLarge2>
				</div>
				<div className="w-full pt-2.5 grid grid-cols-2 gap-5">
					{uiBlock(inquiriesStatus.Open)}
					{uiBlock(inquiriesStatus.Closed)}
					{uiBlock(inquiriesStatus.Confirmed)}
					{uiBlock(inquiriesStatus.Hold)}
				</div>
			</div>
		);
	}

	// Main UI
	return uiMain();
}
