"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import SlotCounter from "react-slot-counter";
import { BaseModules } from "@/utilities/constants";

import { MyGlobal } from "@/utilities/global";
import { BadgeLarge2 } from "@/components/Elements";
import { faCheckDouble, faCirclePause, faLock, faUnlock } from "@fortawesome/free-solid-svg-icons";

export default function RVs({ rv, setModuleProps }) {
	// Functions
	function getBackgroundAndIcon(status) {
		const object = { background: "", icon: "" };

		switch (true) {
			case status == "NOT GENERATED":
				object.background = "dashboard-orange-1";
				object.icon = faUnlock;
				break;
			case status == "GENERATED":
				object.background = "dashboard-blue-3";
				object.icon = faCheckDouble;
				break;
			case status == "DUE":
				object.background = "dashboard-blue-4";
				object.icon = faCirclePause;
				break;
			case status == "OVERDUE":
				object.background = "dashboard-blue-2";
				object.icon = faLock;
				break;
		}

		return object;
	}

	// UI Components
	function uiBlock(key) {
		const aesthetics = getBackgroundAndIcon(key);
		const _key = MyGlobal.TrimInnerSpace(key).toLowerCase();

		const amount = key == "NOT GENERATED" ? rv?.notGenerated?.amount : rv?.[_key]?.amount;
		const count = key == "NOT GENERATED" ? rv?.notGenerated?.count : rv?.[_key]?.count;

		let zoomRotate = "shrink";

		if (key === "DUE") {
			zoomRotate = "zoom-rotate-right";
		} else if (key === "NOT GENERATED") {
			zoomRotate = "zoom-rotate-left";
		}

		return (
			<div className="flex w-full text-white cursor-pointer" onClick={() => setModuleProps(BaseModules.Rv, key)}>
				<div className={`flex w-full py-6 justify-between items-center rounded shadow-md ${zoomRotate} ${aesthetics.background}`}>
					{/* <div className="p-4 rounded-r-full shadow-2xl font-bold-16 text-white gray-background-transparent-02">{count}</div> */}
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

	function uiMain() {
		return (
			<div className="flex flex-col w-full justify-between items-center">
				<div className="flex w-full space-x-2.5 justify-start items-center font-bold-16 primary-text">
					<span>{BaseModules.Rv}</span>
					<BadgeLarge2>
						<SlotCounter animateOnVisible={{ triggerOnce: true, rootMargin: "0px 0px -100px 0px" }} value={rv?.total ?? 0} />
					</BadgeLarge2>
				</div>
				<div className="w-full pt-2.5 grid grid-cols-2 gap-5">
					{uiBlock("DUE")}
					{uiBlock("OVERDUE")}
					{uiBlock("GENERATED")}
					{uiBlock("NOT GENERATED")}
				</div>
			</div>
		);
	}

	// Main UI
	return uiMain();
}
