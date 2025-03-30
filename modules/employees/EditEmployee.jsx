"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import MyConstants from "@/utilities/constants";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { Spinner } from "@/components/Elements";
import { ComboBox, ComboBox2 } from "@/components/Inputs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBriefcase, faSquare, faSquareCheck, faUsers } from "@fortawesome/free-solid-svg-icons";

export default function EditEmployee() {
	// Business Logic
	const [api, setApi] = useState({
		administrators: [],
		employees: [],
		permissions: [],
	});

	const [loading, setLoading] = useState({
		editing: false,
		supportData: false,
	});

	const [main, setMain] = useState({
		designation: "",
		employee: {
			id: "",
			name: "",
		},
		employmentType: "",
		permissions: [],
		reportsTo: {
			id: "",
			name: "",
		},
	});

	const [other, setOther] = useState({
		find: {
			employee: "",
			reportsTo: "",
		},
	});

	const disableEditButton = loading.editing ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";
	const editButtonStyle = `primary-button-wide ${disableEditButton}`;

	// Functions
	async function doEditing() {
		setLoading((s) => ({ ...s, editing: true }));

		const body = {
			...main,
			permissions: main.permissions.map((m) => m.id).join(","),
			userId: MyGlobal.GetUserId(),
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.Employees.EditEmployee, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				MyGlobal.AddActivity(`Edited employee <b>${main.employee.name} (${main.employee.id})</b>.`, MyConstants.Modules.Base.Employees);

				MyGlobal.ShowSuccessToast(MyConstants.Messages.EmployeeEdited);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Employees => New Employee => Do Editing");
		} finally {
			setLoading((s) => ({ ...s, editing: false }));
		}
	}

	async function getSupportData() {
		try {
			setLoading((s) => ({ ...s, supportData: true }));

			const response = await axios.get(MyConstants.ApiEndpoints.Employees.GetSupportData, MyGlobal.GetHeaders());

			if (response.status === 200) {
				const administrators = [];
				const employees = [];

				MyGlobal.GetAllUsers().forEach((fe) => {
					if (String(fe.id).startsWith("A")) {
						administrators.push({ ...fe, name: fe.full_name });
					}
				});

				response.data.employees.forEach((fe) => {
					const reportsTo = { id: "", name: "" };
					const administrator = administrators.find((f) => f.id === fe.administrator_id);

					if (typeof administrator === "object") {
						reportsTo.id = administrator.id;
						reportsTo.name = administrator.name;
					}
					employees.push({
						...fe,
						name: fe.full_name,
						reports_to: reportsTo,
					});
				});

				setApi((s) => ({
					...s,
					administrators,
					employees,
					permissions: response.data.permissions,
				}));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Employees => New Employess => Get Support Data");
		} finally {
			setLoading((s) => ({ ...s, supportData: false }));
		}
	}

	function setEmployee() {
		const employee = api.employees.find((f) => f.id === main.employee.id);
		const permissions = [];

		if (typeof employee.permissions === "string") {
			String(employee.permissions)
				.split(",")
				.forEach((fe) => {
					const permission = api.permissions.find((f) => f.id === Number(fe));

					if (typeof permission === "object") {
						permissions.push(permission);
					}
				});
		}

		if (typeof employee === "object") {
			setMain((s) => ({
				...s,
				designation: employee.designation,
				employmentType: employee.employment_type,
				reportsTo: employee.reports_to,
				permissions,
			}));
		}
	}

	function setFind(key, value) {
		setOther((s) => ({ ...s, find: { ...s.find, [key]: value } }));
	}

	function setHeavyInputs(key, value) {
		if (value) {
			if (typeof value === "object") {
				if ("id" in value && "name" in value) {
					setMain((s) => ({ ...s, [key]: { id: value.id, name: value.name } }));
				}
			}
		} else {
			setMain((s) => ({ ...s, [key]: { id: "", name: "" } }));
		}
	}

	function setLightInputs(key, value) {
		setMain((s) => ({ ...s, [key]: value }));
	}

	function setPermission(permission) {
		const old = [...main.permissions];
		let newData = old;

		if (old.includes(permission)) {
			newData = old.filter((f) => f != permission);
		} else {
			newData.unshift(permission);
		}

		setMain((s) => ({ ...s, permissions: newData }));
	}

	// UI Components
	function uiEdit() {
		if (loading.editing) {
			return (
				<span className="space-x-3.5">
					<Spinner />
				</span>
			);
		}

		return "Edit";
	}

	function uiEmployees() {
		return (
			<ComboBox2
				allowCreatingNewItem={false}
				comparingValue1="name"
				comparingValue2={main.employee.name}
				displayValue="name"
				filteredData={api.employees}
				hasDataObject
				icon={faUsers}
				isReadOnly={false}
				label="Employee"
				onChange={(e) => setHeavyInputs("employee", e)}
				onClick={() => {}}
				onInputChange={(e) => setFind("employee", e.target.value)}
				onKeyPress={() => {}}
				searchedItem={other.find.employee}
				tabIndex="1"
				value={main.employee.name}
				width="w-full"
			/>
		);
	}

	function uiDesignation() {
		return (
			<ComboBox
				allowCreatingNewItem={false}
				comparisonValue=""
				filteredData={Object.values(MyConstants.Designation)}
				icon={faBriefcase}
				label="Designation"
				onChange={(e) => setLightInputs("designation", e)}
				onClick={() => {}}
				onKeyPress={() => {}}
				searchedItem=""
				tabIndex="3"
				value={main.designation}
				width="w-full"
			/>
		);
	}

	function uiEmploymentType() {
		return (
			<ComboBox
				allowCreatingNewItem={false}
				comparisonValue=""
				filteredData={Object.values(MyConstants.EmploymentType)}
				icon={faBriefcase}
				label="Employment Type"
				onChange={(e) => setLightInputs("employmentType", e)}
				onClick={() => {}}
				onKeyPress={() => {}}
				searchedItem=""
				tabIndex="4"
				value={main.employmentType}
				width="w-full"
			/>
		);
	}

	function uiPermissions() {
		return (
			<div className="flex flex-col w-full p-2 space-y-1 justify-center items-center">
				<span className="flex w-full space-x-5 justify-between items-center font-regular-10 light-slate-gray-text">Permissions</span>
				<div className="w-full p-3 columns-3 rounded bottom-shadow contrast-background full-border">{uiPermissionsItems()}</div>
			</div>
		);
	}

	function uiPermissionsItems() {
		return api.permissions.map((m, n) => {
			const isSelected = main.permissions.includes(m);
			const icon = isSelected ? faSquareCheck : faSquare;
			const iconColour = `cursor-pointer ${isSelected ? "primary-text" : "gray-text"}`;

			return (
				<div className="flex w-full space-x-2 justify-start items-center" key={n}>
					<FontAwesomeIcon className={iconColour} icon={icon} onClick={() => setPermission(m)} />
					<span className="font-regular-10 black-text">{m.name}</span>
				</div>
			);
		});
	}

	function uiReportTo() {
		return (
			<ComboBox2
				allowCreatingNewItem={false}
				comparingValue1="name"
				comparingValue2={main.reportsTo.name}
				displayValue="name"
				filteredData={api.administrators}
				hasDataObject
				icon={faUsers}
				isReadOnly={false}
				label="Will Report To"
				onChange={(e) => setHeavyInputs("reportsTo", e)}
				onClick={() => {}}
				onInputChange={(e) => setFind("reportsTo", e.target.value)}
				onKeyPress={() => {}}
				searchedItem={other.find.reportsTo}
				tabIndex="2"
				value={main.reportsTo.name}
				width="w-full"
			/>
		);
	}

	// Hooks
	useEffect(() => {
		getSupportData();
	}, []);

	useEffect(() => {
		if (main.employee.id.length) {
			setEmployee();
		}
	}, [main.employee.id]);

	// Main UI
	return (
		<div className="flex flex-col w-full h-[calc(100vh-140px)] justify-between items-center relative rounded shadow overflow-y-auto scrollbar-gutter contrast-background">
			<div className="flex w-full px-5 py-2.5 space-x-10 justify-between items-center">
				{uiEmployees()}
				<div className="w-full" />
				<div className="w-full" />
			</div>
			<div className="flex w-full px-5 py-2.5 space-x-10 justify-between items-center">
				{uiReportTo()}
				{uiDesignation()}
				{uiEmploymentType()}
			</div>
			<div className="flex w-full px-5 py-2.5 justify-between items-center">{uiPermissions()}</div>
			<footer className="w-full dialog-footer !px-7 !py-5">
				<button className={editButtonStyle} onClick={() => doEditing()}>
					{uiEdit()}
				</button>
			</footer>
		</div>
	);
}
