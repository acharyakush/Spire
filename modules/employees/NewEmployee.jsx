"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import MyConstants from "@/utilities/constants";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { Spinner } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ComboBox, ComboBox2, DatePicker, EmailAddress, Password, TextArea, TextInput } from "@/components/Inputs";
import {
	faBirthdayCake,
	faBriefcase,
	faBuildingCircleXmark,
	faCircle,
	faCircleDot,
	faCity,
	faEye,
	faEyeSlash,
	faFont,
	faHome,
	faLocationDot,
	faPhone,
	faSquare,
	faSquareCheck,
	faUserCircle,
	faUsers,
	faVenusMars,
} from "@fortawesome/free-solid-svg-icons";

export default function NewEmployee() {
	// Business Logic
	const [api, setApi] = useState({
		administrators: [],
		allowedIpAddresses: [],
		permissions: [],
	});

	const [loading, setLoading] = useState({
		adding: false,
		supportData: false,
	});

	const [main, setMain] = useState({
		address: "",
		allowedIpAddress: "",
		allowRemoteWorking: 0,
		birthDate: new Date(),
		city: "",
		state: "",
		designation: "",
		emailAddress: "",
		employmentType: "",
		gender: "",
		name: { first: "", last: "", middle: "" },
		password: "",
		permissions: [],
		phoneNumber: "",
		reportsTo: { id: "", name: "" },
		username: "",
	});

	const [other, setOther] = useState({
		find: { reportsTo: "" },
		revealPassword: false,
	});

	const disableAddButton = loading.adding ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";
	const addButtonStyle = `primary-button-wide ${disableAddButton}`;

	const passwordType = !other.revealPassword ? "password" : "text";
	const eyeIconStyle = main.password.length ? "w-5 cursor-pointer visible" : "invisible";

	// Functions
	async function doAddition() {
		setLoading((s) => ({ ...s, adding: true }));

		const body = {
			...main,
			permissions: main.permissions.map((m) => m.id).join(","),
			userId: MyGlobal.GetUserId(),
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.Employees.AddEmployee, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				MyGlobal.AddActivity(`Added employee <b>${response.data}</b>.`, MyConstants.Modules.Base.Employees);

				MyGlobal.ShowSuccessToast(MyConstants.Messages.EmployeeAdded);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Employees => New Employee => Do Addition");
		} finally {
			setLoading((s) => ({ ...s, adding: false }));
		}
	}

	function fillIpAddresses() {
		setApi((s) => ({ ...s, allowedIpAddresses: Object.values(MyConstants.IpAddresses) }));
	}

	async function getSupportData() {
		try {
			setLoading((s) => ({ ...s, supportData: true }));

			const response = await axios.get(MyConstants.ApiEndpoints.Employees.GetSupportData, MyGlobal.GetHeaders());

			if (response.status === 200) {
				const administrators = [];

				MyGlobal.GetAllUsers().forEach((fe) => {
					administrators.push({ ...fe, name: fe.full_name });
				});

				setApi((s) => ({ ...s, administrators, permissions: response.data.permissions }));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Employees => New Employess => Get Support Data");
		} finally {
			setLoading((s) => ({ ...s, supportData: false }));
		}
	}

	function setFind(key, value) {
		setOther((s) => ({ ...s, find: { ...s.find, [key]: value } }));
	}

	function setHeavyInputs(key, value) {
		if (value) {
			if (typeof value === "object") {
				if (key === "reportsTo") {
					if ("id" in value && "name" in value) {
						setMain((s) => ({ ...s, reportsTo: { id: value.id, name: value.name } }));
					}
				} else {
					setMain((s) => ({ ...s, birthDate: value }));
				}
			} else {
				if (["first", "last", "middle"].includes(key)) {
					setMain((s) => ({ ...s, name: { ...s.name, [key]: value } }));
				}
			}
		} else {
			if (key === "reportsTo") {
				setMain((s) => ({ ...s, reportsTo: { id: "", name: "" } }));
			} else if (["first", "last", "middle"].includes(key)) {
				setMain((s) => ({ ...s, name: { ...s.name, [key]: "" } }));
			} else {
				setMain((s) => ({ ...s, [key]: value }));
			}
		}
	}

	function setIpAddressInputs(payload, source) {
		const old = [...api.allowedIpAddresses];
		const newData = old;

		if (source === 0) {
			newData.shift();
			newData.unshift(payload);
		} else {
			newData.pop();
			newData.push(payload);
		}

		setApi((s) => ({ ...s, allowedIpAddresses: newData }));
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

	function togglePasswordCharacters() {
		setOther((s) => ({ ...s, revealPassword: !other.revealPassword }));
	}

	// UI Components
	function uiAdd() {
		if (loading.adding) {
			return (
				<span className="space-x-3.5">
					<Spinner />
				</span>
			);
		}

		return "Add";
	}

	function uiAddress() {
		return (
			<TextArea
				icon={faHome}
				label="Address"
				onChange={(e) => setLightInputs("address", e.target.value)}
				onKeyDown={() => {}}
				rows={2}
				tabIndex="11"
				value={main.address}
				width="w-full"
			/>
		);
	}

	function uiAllowedIpAddresses() {
		return (
			<div className="flex flex-col w-full p-2 space-y-1 justify-center items-center">
				<span className="flex w-full justify-between items-center font-regular-10 light-slate-gray-text">
					<span>Allowed IP Addresses</span>
					<span className="cursor-pointer font-regular-11 primary-text" onClick={() => fillIpAddresses()}>
						Autofill
					</span>
				</span>
				{uiAllowedIpAddressesItems()}
			</div>
		);
	}

	function uiAllowedIpAddressesItems() {
		return (
			<div className="flex flex-col w-full p-2 space-y-1 justify-center items-start rounded bottom-shadow full-border">
				<TextInput
					icon={faLocationDot}
					label="Office"
					onChange={(e) => setIpAddressInputs(e.target.value, 0)}
					onKeyPress={() => {}}
					tabIndex="15"
					value={api.allowedIpAddresses.at(0)}
					width="w-full"
				/>
				<TextInput
					icon={faLocationDot}
					label="Remote"
					onChange={(e) => setIpAddressInputs(e.target.value, 1)}
					onKeyPress={() => {}}
					isReadOnly={main.allowRemoteWorking == 0}
					tabIndex="16"
					value={api.allowedIpAddresses.at(1)}
					width="w-full"
				/>
			</div>
		);
	}

	function uiAllowRemoteWorking() {
		return (
			<div className="flex flex-col w-full p-2 space-y-1 justify-center items-center">
				<span className="flex w-full justify-start items-center font-regular-10 light-slate-gray-text">Allow Remote Working</span>
				<div className="flex w-full h-9 px-2 space-x-1 justify-start items-center rounded bottom-shadow contrast-background full-border">
					<FontAwesomeIcon className="primary-text" icon={faBuildingCircleXmark} />
					<span className="flex w-full space-x-5 justify-between items-center">{uiAllowRemoteWorkingItems()}</span>
				</div>
			</div>
		);
	}

	function uiAllowRemoteWorkingItems() {
		const allowRemoteWorking = main.allowRemoteWorking == 1;

		const positiveIcon = allowRemoteWorking ? faCircleDot : faCircle;
		const negativeIcon = allowRemoteWorking ? faCircle : faCircleDot;

		const positiveIconColour = `cursor-pointer ${allowRemoteWorking ? "primary-text" : "gray-text"}`;
		const negativeIconColour = `cursor-pointer ${!allowRemoteWorking ? "primary-text" : "gray-text"}`;

		return (
			<>
				<div className="flex w-full space-x-2 justify-center items-center">
					<FontAwesomeIcon className={positiveIconColour} icon={positiveIcon} onClick={() => setLightInputs("allowRemoteWorking", 1)} />
					<span className="font-regular-10 black-text">Yes</span>
				</div>
				<div className="flex w-full space-x-2 justify-center items-center">
					<FontAwesomeIcon className={negativeIconColour} icon={negativeIcon} onClick={() => setLightInputs("allowRemoteWorking", 0)} />
					<span className="font-regular-10 black-text">No</span>
				</div>
			</>
		);
	}

	function uiBirthDate() {
		return (
			<DatePicker
				icon={faBirthdayCake}
				label="Birth Date"
				onChange={(e) => setHeavyInputs("birthDate", e)}
				tabIndex="8"
				value={main.birthDate}
				width="w-full"
			/>
		);
	}

	function uiCity() {
		return (
			<TextInput
				icon={faCity}
				label="City"
				onChange={(e) => setLightInputs("city", e.target.value)}
				onKeyPress={() => {}}
				tabIndex="12"
				value={main.city}
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
				tabIndex="15"
				value={main.designation}
				width="w-full"
			/>
		);
	}

	function uiEmailAddress() {
		return (
			<EmailAddress
				autoComplete={false}
				onChange={(e) => setLightInputs("emailAddress", e.target.value)}
				suffix="spire.com"
				tabIndex="5"
				value={main.emailAddress}
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
				tabIndex="14"
				value={main.employmentType}
				width="w-full"
			/>
		);
	}

	function uiEye() {
		if (other.revealPassword) {
			return <FontAwesomeIcon className="w-5 gray-text" icon={faEye} />;
		} else {
			return <FontAwesomeIcon className="w-5 gray-text" icon={faEyeSlash} />;
		}
	}

	function uiFirstName() {
		return (
			<TextInput
				icon={faFont}
				label="First Name"
				onChange={(e) => setHeavyInputs("first", e.target.value)}
				onKeyPress={() => {}}
				tabIndex="2"
				value={main.name.first}
				width="w-full"
			/>
		);
	}

	function uiLastName() {
		return (
			<TextInput
				icon={faFont}
				label="Last Name"
				onChange={(e) => setHeavyInputs("last", e.target.value)}
				onKeyPress={() => {}}
				tabIndex="4"
				value={main.name.last}
				width="w-full"
			/>
		);
	}

	function uiGender() {
		return (
			<ComboBox
				allowCreatingNewItem={false}
				comparisonValue=""
				filteredData={Object.values(MyConstants.Gender)}
				icon={faVenusMars}
				label="Gender"
				onChange={(e) => setLightInputs("gender", e)}
				onClick={() => {}}
				onKeyPress={() => {}}
				searchedItem=""
				tabIndex="9"
				value={main.gender}
				width="w-full"
			/>
		);
	}

	function uiMiddleName() {
		return (
			<TextInput
				icon={faFont}
				label="Middle Name"
				onChange={(e) => setHeavyInputs("middle", e.target.value)}
				onKeyPress={() => {}}
				tabIndex="3"
				value={main.name.middle}
				width="w-full"
			/>
		);
	}

	function uiPassword() {
		return (
			<Password
				eyeIconStyle={eyeIconStyle}
				eyeIconUi={uiEye}
				key="2"
				onChange={(e) => setLightInputs("password", e.target.value)}
				reference={{}}
				tabIndex="7"
				toggleCharacters={togglePasswordCharacters}
				type={passwordType}
				value={main.password}
				width="w-full"
			/>
		);
	}

	function uiPermissions() {
		return (
			<div className="flex flex-col w-full p-2 space-y-1 justify-center items-center">
				<span className="flex w-full justify-start items-center font-regular-10 light-slate-gray-text">Permissions</span>
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

	function uiPhoneNumber() {
		return (
			<TextInput
				icon={faPhone}
				label="Phone Number"
				maxLength={12}
				onChange={(e) => setLightInputs("phoneNumber", e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasNumbers(e.key) && e.preventDefault()}
				tabIndex="10"
				value={main.phoneNumber}
				width="w-full"
			/>
		);
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
				tabIndex="1"
				value={main.reportsTo.name}
				width="w-1/3"
			/>
		);
	}

	function uiState() {
		return (
			<TextInput
				icon={faCity}
				label="State"
				onChange={(e) => setLightInputs("state", e.target.value)}
				onKeyPress={() => {}}
				tabIndex="13"
				value={main.state}
				width="w-full"
			/>
		);
	}

	function uiUserName() {
		return (
			<TextInput
				icon={faUserCircle}
				label="User Name"
				onChange={(e) => setLightInputs("username", e.target.value)}
				onKeyPress={() => {}}
				tabIndex="6"
				value={main.username}
				width="w-full"
			/>
		);
	}

	// Hooks
	useEffect(() => {
		getSupportData();
	}, []);

	// Main UI
	return (
		<div className="flex flex-col w-full h-[calc(100vh-140px)] justify-between items-center relative rounded shadow overflow-y-auto scrollbar-gutter contrast-background">
			<div className="flex w-full px-5 py-2.5 space-x-10 justify-between items-center">
				{uiReportTo()}
				<div className="w-1/3" />
				<div className="w-1/3" />
			</div>
			<div className="flex w-full px-5 py-2.5 space-x-10 justify-between items-center">
				{uiFirstName()}
				{uiMiddleName()}
				{uiLastName()}
			</div>
			<div className="flex w-full px-5 py-2.5 space-x-10 justify-between items-center">
				{uiUserName()}
				{uiEmailAddress()}
				{uiPassword()}
			</div>
			<div className="flex w-full px-5 py-2.5 space-x-10 justify-between items-center">
				{uiBirthDate()}
				{uiGender()}
				{uiPhoneNumber()}
			</div>
			<div className="flex w-full px-5 py-2.5 space-x-10 justify-between items-center">
				{uiAddress()}
				{uiCity()}
				{uiState()}
			</div>
			<div className="flex w-full px-5 py-2.5 space-x-10 justify-between items-center">
				{uiAllowRemoteWorking()}
				{uiDesignation()}
				{uiEmploymentType()}
			</div>
			<div className="flex w-full px-5 py-2.5 justify-between items-center">{uiAllowedIpAddresses()}</div>
			<div className="flex w-full px-5 py-2.5 justify-between items-center">{uiPermissions()}</div>
			<footer className="w-full dialog-footer !px-7 !py-5">
				<button className={addButtonStyle} onClick={() => doAddition()}>
					{uiAdd()}
				</button>
			</footer>
		</div>
	);
}
