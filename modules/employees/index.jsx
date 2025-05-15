"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import NewEmployee from "./NewEmployee";
import EditEmployee from "./EditEmployee";
import MyConstants from "@/utilities/constants";

import { useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallbackComponent } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faPencil, faPlusCircle } from "@fortawesome/free-solid-svg-icons";

export default function Employees({ unmount }) {
	// Business Logic
	const modules = MyConstants.Modules.Other.Employees;
	const thisView = MyConstants.Modules.Base.Employees;

	const [main, setMain] = useState({
		module: modules.Edit,
	});

	// Functions
	function toggleModule(module) {
		setMain((s) => ({ ...s, module }));
	}

	// UI Components
	function uiBody() {
		return (
			<div className="flex w-full h-full px-6 py-5 justify-center items-start">
				<div className="flex flex-col w-[10%] px-5 space-y-5 justify-start items-center">{uiModules()}</div>
				<div className="flex flex-col w-[90%] h-full justify-start items-center">{uiSelectedModule()}</div>
			</div>
		);
	}

	function uiModules() {
		return Object.values(modules)
			.filter((f) => {
				if (MyGlobal.IsUserAdministrator()) return true;

				const canEdit = MyGlobal.HasPermission(MyConstants.Modules.Derived.EditEmployee);
				const canNew = MyGlobal.HasPermission(MyConstants.Modules.Derived.NewEmployee);

				if (!canEdit && f === modules.Edit) return false;
				if (!canNew && f === modules.New) return false;

				return true;
			})
			.map((m, i) => {
				const icon = m == modules.New ? faPlusCircle : faPencil;

				const selectedStyle = m == main.module ? "primary-border primary-background-transparent-01 primary-text" : "full-border bg-white black-text";

				const wrapper = `flex w-full px-4 py-2 space-x-3 justify-start items-center rounded shadow ${selectedStyle} font-medium-12 hovered-rows`;

				return (
					<button className={wrapper} key={i} onClick={() => toggleModule(m)}>
						<FontAwesomeIcon icon={icon} size="sm" />
						<span>{m}</span>
					</button>
				);
			});
	}

	function uiSelectedModule() {
		if (main.module === modules.New) {
			return (
				<ErrorBoundary key={`ErrorBoundary_${module}`} onError={(e) => MyGlobal.LogErrors(e.message, module)} FallbackComponent={ErrorFallbackComponent}>
					<NewEmployee />
				</ErrorBoundary>
			);
		} else {
			return (
				<ErrorBoundary key={`ErrorBoundary_${module}`} onError={(e) => MyGlobal.LogErrors(e.message, module)} FallbackComponent={ErrorFallbackComponent}>
					<EditEmployee />
				</ErrorBoundary>
			);
		}
	}

	// Main UI
	return (
		<div className="flex flex-col w-full h-full justify-start items-center">
			<div className="flex w-full px-5 py-2.5 justify-start items-center">
				<FontAwesomeIcon className="pr-1 cursor-pointer black-text" icon={faChevronLeft} onClick={() => unmount()} />
				<div className="flex w-2/5 pl-2.5 justify-start items-center">
					<span className="view-heading">{thisView}</span>
				</div>
			</div>
			{uiBody()}
		</div>
	);
}
