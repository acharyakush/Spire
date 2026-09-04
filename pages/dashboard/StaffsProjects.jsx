"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import SlotCounter from "react-slot-counter";

import { isDevelopment } from "@/utilities/global";
import { BadgeLarge2 } from "@/components/Elements";
import { BaseModules, Statuses } from "@/utilities/constants";

export default function StaffsProjects({ data, setModuleProps }) {
	// Business Logic
	const projectsStatus = Statuses.Projects;
	const cardBackgrounds = ["staff-project-1", "staff-project-2", "staff-project-3", "staff-project-4", "staff-project-5", "staff-project-6"];

	// UI Components
	function uiBlock(name, count, index) {
		const wrapper = `flex w-full text-white cursor-pointer`;
		const background = cardBackgrounds[index % cardBackgrounds.length];

		return (
			<div className={wrapper} onClick={() => setModuleProps("projectsOrTasks", name)}>
				<div className={`flex w-full py-6 justify-center items-center rounded shadow-md ${background}`}>
					<div className="flex flex-col justify-center items-center">
						<span className="tracking-widest uppercase font-medium-8 light-gray-text">{name}</span>
						<span className="font-bold-30">
							<SlotCounter value={count} />
						</span>
					</div>
				</div>
			</div>
		);
	}

	function uiMain() {
		const transition = isDevelopment ? "" : "anim slide-in-down";
		const wrapper = "flex flex-col w-full space-y-2 justify-between items-center-safe " + transition;

		return (
			<div className={wrapper}>
				<div className="flex w-full space-x-2.5 justify-start items-center font-bold-16 primary-text">
					<span>{projectsStatus.Active} {BaseModules.Projects}</span>
					<BadgeLarge2>
						<SlotCounter value={data?.reduce((tv, pv) => tv + pv.count, 0) ?? 0} />
					</BadgeLarge2>
				</div>
				<div className="flex w-full space-x-10 justify-center-safe items-center-safe">
					{data?.map((m, index) => {
						return uiBlock(m.name, m.count, index)
					})}
				</div>
			</div>
		);
	}

	// Main UI
	return uiMain();
}
