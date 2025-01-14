"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import MyConstants from "@/utilities/constants";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { Spinner } from "@/components/Elements";
import { EmailAddress, TextInput } from "@/components/Inputs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGooglePay } from "@fortawesome/free-brands-svg-icons";
import { faChevronLeft, faCircleMinus, faPhone, faPlusCircle, faTriangleExclamation, faUser } from "@fortawesome/free-solid-svg-icons";

export default function NewAffiliate({ reloadAffiliates, unmount }) {
	// Business Logic

	const [api, setApi] = useState({ allAffiliates: [] });

	const [main, setMain] = useState({
		error: "",
		group: [{ emailAddress: "", name: "", phoneNumber: "", upiId: "", rowId: 0 }],
		hasMounted: false,
		isLoading: false,
	});

	const errorVisibility = main.error ? " visible" : "invisible";
	const errorTextStyle = `flex w-fit ml-2 px-4 py-2 space-x-5 justify-start items-center ${errorVisibility} rounded whitespace-pre-wrap font-regular-10 red-border red-text red-background-transparent-01`;

	const disableAddButton = main.isLoading || main.error ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";
	const addButtonStyle = `primary-button-condensed ${disableAddButton}`;

	// Functions
	async function addToDatabase() {
		const revisedGroup = main.group.filter((f) => f.emailAddress && f.name && f.phoneNumber);

		if (!revisedGroup.length) {
			MyGlobal.ShowErrorToast("Please fill up all the fields.");
			return;
		}

		try {
			setMain((s) => ({ ...s, isLoading: true }));

			const response = await axios.post(
				MyConstants.ApiEndpoints.Affiliates.AddAffiliate,
				MyGlobal.GetHeaders({ group: revisedGroup, userId: MyGlobal.GetUserId() }),
			);

			if (response.status === 200) {
				reloadAffiliates();

				MyGlobal.AddActivity("Added affiliate(s).", MyConstants.Modules.Base.Affiliates);
				MyGlobal.ShowSuccessToast(MyConstants.Messages.AffiliateAdded);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}

			unmount();
		} catch (error) {
			MyGlobal.HandleErrors(error, "Add Affiliates");
		} finally {
			setMain((s) => ({ ...s, isLoading: false, error: "" }));
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

	async function getAllAffiliates() {
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
			const doesExist = api.allAffiliates.find((s) => String(s.name).toLowerCase() == String(value).toLowerCase());

			error = typeof doesExist === "object" ? `This affiliate already exists.\n<b>${doesExist.id} - ${doesExist.name}</b>` : "";
		}

		const copy = [...main.group];
		const object = copy.find((f) => f.rowId == rowId);

		object[key] = key == "name" ? MyGlobal.Capitalize(value) : value;

		const revised = copy.filter((f) => f.rowId != rowId);
		revised.push({ ...object });

		setMain((s) => ({ ...s, error, group: revised }));
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

	function uiEmailAddress(object, rowId) {
		return (
			<EmailAddress
				key={1}
				label={`Email Address #${rowId + 1}`}
				onChange={(e) => setInputs("emailAddress", rowId, e.target.value)}
				suffix=""
				tabIndex={`${rowId}3`}
				value={object.emailAddress}
				width="w-1/4"
			/>
		);
	}

	function uiName(object, rowId) {
		return (
			<TextInput
				icon={faUser}
				id={`name${rowId}`}
				label={`Name #${rowId + 1}`}
				onChange={(e) => setInputs("name", rowId, e.target.value)}
				onKeyPress={() => {}}
				tabIndex={`${rowId}1`}
				value={object.name}
				width="w-1/4"
			/>
		);
	}

	function uiPhoneNumber(object, rowId) {
		return (
			<TextInput
				icon={faPhone}
				id={`phoneNumber${rowId}`}
				label={`Phone Number #${rowId + 1}`}
				onChange={(e) => setInputs("phoneNumber", rowId, e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasNumbers(e.key) && e.preventDefault()}
				tabIndex={`${rowId}2`}
				value={object.phoneNumber}
				width="w-1/4"
			/>
		);
	}

	function uiUpiId(object, rowId) {
		return (
			<TextInput
				icon={faGooglePay}
				iconSize="2x"
				id={`upiId${rowId}`}
				label={`UPI ID #${rowId + 1}`}
				onChange={(e) => setInputs("upiId", rowId, e.target.value)}
				onKeyPress={() => {}}
				tabIndex={`${rowId}4`}
				value={object.upiId}
				width="w-1/4"
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
					<div className="flex w-full space-x-3 justify-between items-end" key={m.rowId}>
						{uiName(m, i)}
						{uiPhoneNumber(m, i)}
						{uiEmailAddress(m, i)}
						{uiUpiId(m, i)}
						<div className={addButtonWrapper}>
							<FontAwesomeIcon className="cursor-pointer primary-text" icon={faPlusCircle} onClick={() => addToGroup()} size="lg" />
						</div>
						<div className={deleteButtonWrapper}>
							<FontAwesomeIcon className="cursor-pointer red-text" icon={faCircleMinus} onClick={() => deleteFromGroup(m)} size="lg" />
						</div>
					</div>
				);
			});
	}

	// Hooks
	useEffect(() => {
		getAllAffiliates();
	}, []);

	if (!main.hasMounted) {
		return;
	}

	return (
		<div className="flex flex-col w-full h-full justify-center items-center">
			<div className="flex w-full px-5 py-2.5 justify-between items-center bottom-border light-gray-background">
				<div className="flex w-full space-x-2.5 justify-start items-center">
					<FontAwesomeIcon className="pr-1 cursor-pointer black-text" icon={faChevronLeft} onClick={() => unmount()} />
					<div className="flex w-full justify-start items-center">
						<span className="view-heading">New Affiliate</span>
					</div>
				</div>
			</div>
			<div className="flex w-full h-full justify-center items-center contrast-background">
				<div className="flex flex-col w-4/5 h-full space-y-3 justify-start items-center">
					<div className="flex flex-col w-full h-full p-4 space-y-2.5 overflow-y-auto">
						{uiRows()}
						<div className={errorTextStyle}>
							<FontAwesomeIcon icon={faTriangleExclamation} size="2x" />
							<span dangerouslySetInnerHTML={{ __html: main.error }} />
						</div>
					</div>

					<span className="py-2 italic font-regular-11 gray-text">
						*** Fill up all the rows and fields. Partially filled rows will not be saved. ***
					</span>
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
