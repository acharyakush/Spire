"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import MyConstants from "@/utilities/constants";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { EmailAddress, TextInput } from "@/components/Inputs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGooglePay } from "@fortawesome/free-brands-svg-icons";
import { BadgeGreenLarge, Spinner, SpinnerBig } from "@/components/Elements";
import {
	faChevronRight,
	faCircleMinus,
	faCode,
	faFont,
	faHashtag,
	faPhone,
	faPlusCircle,
	faTriangleExclamation,
	faUser,
} from "@fortawesome/free-solid-svg-icons";

export default function NewAffiliate({ reload, unmount }) {
	// Business Logic

	const [api, setApi] = useState({ allAffiliates: [] });

	const [main, setMain] = useState({
		error: "",
		group: [
			{
				bankAccountHolderName: "",
				bankAccountNumber: "",
				emailAddress: "",
				ifsc: "",
				name: "",
				phoneNumber: "",
				rowId: 0,
				upiId: "",
			},
		],
		hasMounted: false,
		isLoading: false,
	});

	const errorVisibility = main.error ? " visible" : "invisible";
	const errorTextStyle = `flex w-fit ml-2 px-4 py-2 space-x-5 justify-start items-center ${errorVisibility} rounded whitespace-pre-wrap font-regular-10 red-border red-text red-background-transparent-01`;

	const disableAddButton = main.isLoading || main.error ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";
	const addButtonStyle = `primary-button-condensed ${disableAddButton}`;

	// Functions
	async function addToDatabase() {
		const revisedGroup = main.group.filter((f) => f.name && f.phoneNumber);

		if (!revisedGroup.length) {
			MyGlobal.ShowErrorToast("Please fill up all the fields.");
			return;
		}

		try {
			setMain((s) => ({ ...s, isLoading: true }));

			const body = { group: revisedGroup, userId: MyGlobal.GetUserId() };

			const response = await axios.post(MyConstants.ApiEndpoints.Affiliates.AddAffiliate, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reload();

				MyGlobal.AddActivity("Added affiliate(s).", MyConstants.Modules.Base.Affiliates);
				MyGlobal.ShowSuccessToast(MyConstants.Messages.AffiliateAdded);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "New Affiliate => Add Affiliates");
		} finally {
			setMain((s) => ({ ...s, isLoading: false, error: "" }));
			unmount();
		}
	}

	function addToGroup() {
		const copy = [...main.group];

		let greatestId = copy.sort((a, b) => b.rowId - a.rowId).at(0).rowId;
		greatestId++;

		copy.push({ name: "", rowId: greatestId });
		setMain((s) => ({ ...s, group: copy }));
	}

	function deleteFromGroup(object) {
		const copy = [...main.group];
		const doesExist = copy.some((s) => s.rowId == object.rowId);

		if (doesExist) {
			const revised = copy.filter((f) => f.rowId != object.rowId);
			setMain((s) => ({ ...s, group: revised }));
		}
	}

	async function setAllAffiliates() {
		setMain((s) => ({ ...s, isLoading: true }));

		try {
			const response = await axios.get(MyConstants.ApiEndpoints.Getter, MyGlobal.GetHeaders({ type: "get-affiliates" }));

			if (response.status === 200) {
				setApi({ allAffiliates: response.data });
				setMain((s) => ({ ...s, hasMounted: true }));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "New Affiliate => Get All Affiliates");
		} finally {
			setMain((s) => ({ ...s, isLoading: false }));
		}
	}

	function setInputs(key, rowId, value) {
		let error = "";

		if (key == "name") {
			const affiliate = api.allAffiliates.find((f) => String(f.name).toLowerCase() == String(value).toLowerCase());

			if (typeof affiliate === "object") {
				error = `This affiliate already exists.\n<b>${affiliate.id} - ${affiliate.name}</b>`;
			}
		}

		const copy = [...main.group];
		const object = copy.find((f) => f.rowId == rowId);

		if (typeof object === "object") {
			object[key] = key == "name" ? value : value;

			const revised = copy.filter((f) => f.rowId != rowId);
			revised.push({ ...object });

			setMain((s) => ({ ...s, error, group: revised }));
		}
	}

	// UI Components
	function uiAdd() {
		if (main.isLoading) {
			return (
				<span className="px-3.5">
					<Spinner />
				</span>
			);
		} else {
			return "Add";
		}
	}

	function uiBankAccountHolderName(object, rowId) {
		return (
			<TextInput
				icon={faFont}
				id={`bankAccountHolderName${rowId}`}
				label="Bank Account Holder Name"
				onChange={(e) => setInputs("bankAccountHolderName", rowId, e.target.value)}
				onKeyPress={() => {}}
				tabIndex={`${rowId}4`}
				value={object.bankAccountHolderName}
				width="w-full"
			/>
		);
	}

	function uiBankAccountNumber(object, rowId) {
		return (
			<TextInput
				icon={faHashtag}
				id={`bankAccountNumber${rowId}`}
				label="Bank Account Number"
				onChange={(e) => setInputs("bankAccountNumber", rowId, e.target.value)}
				onKeyPress={() => {}}
				tabIndex={`${rowId}5`}
				value={object.bankAccountNumber}
				width="w-full"
			/>
		);
	}

	function uiEmailAddress(object, rowId) {
		return (
			<EmailAddress
				label="Email Address"
				onChange={(e) => setInputs("emailAddress", rowId, e.target.value)}
				suffix=""
				tabIndex={`${rowId}3`}
				value={object.emailAddress}
				width="w-full"
			/>
		);
	}

	function uiEmailAddress1(object, rowId) {
		return (
			<EmailAddress
				label="Email Address"
				onChange={(e) => setInputs("emailAddress", rowId, e.target.value)}
				suffix=""
				tabIndex={`${rowId}3`}
				value={object.emailAddress}
				width="w-full invisible"
			/>
		);
	}

	function uiIfsc(object, rowId) {
		return (
			<TextInput
				icon={faCode}
				id={`ifsc${rowId}`}
				label="IFS Code"
				onChange={(e) => setInputs("ifsc", rowId, e.target.value)}
				onKeyPress={() => {}}
				tabIndex={`${rowId}6`}
				value={object.ifsc}
				width="w-full"
			/>
		);
	}

	function uiName(object, rowId) {
		return (
			<TextInput
				icon={faUser}
				id={`name${rowId}`}
				label="Name"
				onChange={(e) => setInputs("name", rowId, e.target.value)}
				onKeyPress={() => {}}
				tabIndex={`${rowId}1`}
				value={object.name}
				width="w-full"
			/>
		);
	}

	function uiPhoneNumber(object, rowId) {
		return (
			<TextInput
				icon={faPhone}
				id={`phoneNumber${rowId}`}
				label="Phone Number"
				onChange={(e) => setInputs("phoneNumber", rowId, e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasNumbers(e.key) && e.preventDefault()}
				tabIndex={`${rowId}2`}
				value={object.phoneNumber}
				width="w-full"
			/>
		);
	}

	function uiUpiId(object, rowId) {
		return (
			<TextInput
				icon={faGooglePay}
				iconSize="2x"
				id={`upiId${rowId}`}
				label="Unified Payment Interface ID"
				onChange={(e) => setInputs("upiId", rowId, e.target.value)}
				onKeyPress={() => {}}
				tabIndex={`${rowId}7`}
				value={object.upiId}
				width="w-full"
			/>
		);
	}

	function uiRows() {
		return main.group
			.sort((a, b) => a.rowId - b.rowId)
			.map((m, i) => {
				const showAddButton = i == main.group.length - 1 ? "visible" : "invisible";
				const showDeleteButton = main.group.length > 1 ? "visible" : "invisible";

				const addButtonWrapper = `flex w-fit h-[55px] justify-center items-center ${showAddButton}`;

				const deleteButtonWrapper = `flex w-fit h-[55px] justify-center items-center ${showDeleteButton}`;

				return (
					<div className="flex w-full space-x-3 justify-between items-center" key={m.rowId}>
						<div className="flex w-fit h-[55px] justify-center items-center">
							<BadgeGreenLarge value={i + 1} />
						</div>
						<div className="flex flex-col w-full py-2 px-4 justify-between items-center rounded primary-background-transparent-005 full-border bottom-shadow">
							<div className="flex w-full space-x-3 justify-between items-center">
								{uiName(m, i)}
								{uiPhoneNumber(m, i)}
								{uiEmailAddress(m, i)}
								{uiEmailAddress1(m, i)}
							</div>
							<div className="flex w-full space-x-3 justify-between items-center">
								{uiBankAccountHolderName(m, i)}
								{uiBankAccountNumber(m, i)}
								{uiIfsc(m, i)}
								{uiUpiId(m, i)}
							</div>
						</div>
						<div className={addButtonWrapper}>
							<FontAwesomeIcon className="cursor-pointer primary-text" icon={faPlusCircle} onClick={() => addToGroup()} size="2x" />
						</div>
						<div className={deleteButtonWrapper}>
							<FontAwesomeIcon className="cursor-pointer red-text" icon={faCircleMinus} onClick={() => deleteFromGroup(m)} size="2x" />
						</div>
					</div>
				);
			});
	}

	// Hooks
	useEffect(() => {
		setAllAffiliates();
	}, []);

	if (main.isLoading) {
		return (
			<div className="flex w-full h-full justify-center items-center font-regular-12 gray-text contrast-background full-border">
				<SpinnerBig />
			</div>
		);
	} else {
		return (
			<div className="flex flex-col w-full h-full justify-center items-center">
				<div className="flex w-full px-5 py-2.5 justify-between items-center bottom-border">
					<div className="flex w-full space-x-2.5 justify-start items-center">
						<div className="flex w-full space-x-2.5 justify-start items-center">
							<span className="cursor-pointer view-heading" onClick={() => unmount()}>
								{MyConstants.Modules.Base.Affiliates}
							</span>
							<FontAwesomeIcon className="gray-text" icon={faChevronRight} size="xs" />
							<span className="view-heading">{MyConstants.Modules.Derived.NewAffiliate}</span>
						</div>
					</div>
				</div>
				<div className="flex w-full h-[calc(100vh-150px)] justify-center items-center overflow-y-auto contrast-background scrollbar-gutter">
					<div className="flex flex-col w-4/5 h-full p-4 space-y-3 justify-start items-center">
						{uiRows()}
						<div className={errorTextStyle}>
							<FontAwesomeIcon icon={faTriangleExclamation} size="2x" />
							<span dangerouslySetInnerHTML={{ __html: main.error }} />
						</div>
					</div>
				</div>
				<footer className="w-full dialog-footer">
					<button className={addButtonStyle} onClick={() => addToDatabase()}>
						{uiAdd()}
					</button>
				</footer>
			</div>
		);
	}
}
