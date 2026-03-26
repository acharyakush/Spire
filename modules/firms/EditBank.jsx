"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import { ApiEndpoints, Messages } from "@/utilities/constants";

import { useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { Spinner } from "@/components/Elements";
import { ComboBox, TextInput } from "@/components/Inputs";
import { faGooglePay } from "@fortawesome/free-brands-svg-icons";
import { faFile, faFont, faHashtag, faIdCard } from "@fortawesome/free-solid-svg-icons";

export default function EditBank({ bank, reload }) {
	// Business Logic
	const [main, setMain] = useState({
		bank,
		pendingResult: false,
	});

	// Functions
	const edit = () => {
		setMain((s) => ({ ...s, pendingResult: true }));

		axios
			.post(ApiEndpoints.Firms.EditBank, main.bank, MyGlobal.GetHeaders())
			.then((response) => {
				if (response.status == 200) {
					reload();
					MyGlobal.ShowSuccessToast(Messages.BankEdited);
				} else {
					MyGlobal.ShowErrorToast(Messages.SomeErrorOccurred);
				}
			})
			.catch((error) => MyGlobal.HandleErrors(error, "Edit Bank"))
			.finally(() => setMain((s) => ({ ...s, pendingResult: false })));
	};

	const handleInputs = (key, index, value) => {
		const copy = [...main.bank];
		const old = { ...copy.at(index) };

		old[key] = value;

		copy.splice(index, 1);
		copy.push(old);

		setMain((s) => ({ ...s, bank: copy }));
	};

	// UI
	const uiAccountNumber = (value, index) => {
		return <TextInput icon={faHashtag} isNew={false} label="Account Number" onChange={(e) => handleInputs("account_number", index, e.target.value)} onKeyPress={() => {}} tabIndex="2" value={value} width="w-1/2" />;
	};

	const uiAccountType = (value, index) => {
		return <ComboBox allowCreatingNewItem={false} comparisonValue="" filteredData={["Current", "Savings"]} icon={faFile} label="Account Type" onChange={(e) => handleInputs("account_type", index, e)} onClick={() => {}} onKeyPress={() => {}} searchedItem="" tabIndex="3" value={value} width="w-1/2" />;
	};

	const uiEdit = () => {
		if (main.pendingResult) {
			return (
				<span className="px-3.5">
					<Spinner />
				</span>
			);
		} else {
			return <span>Edit</span>;
		}
	};

	const uiIfsc = (value, index) => {
		return <TextInput icon={faIdCard} isNew={false} label="IFS Code" maxLength={15} onChange={(e) => handleInputs("ifsc", index, String(e.target.value).toUpperCase())} onKeyPress={() => {}} tabIndex="4" value={value} width="w-1/2" />;
	};

	const uiMain = () => {
		return main.bank?.map((m, i) => {
			return (
				<div className="flex flex-col w-1/2 px-4 justify-center items-center" key={i}>
					<div className="flex w-full p-2 justify-start items-center primary-text font-semibold-16">
						{i + 1}. {m.name}
					</div>
					<div className="flex w-full space-x-5 justify-between items-center">
						{uiName(m?.name, i)}
						<div className="w-1/2" />
					</div>
					<div className="flex w-full space-x-5 justify-between items-center">
						{uiAccountNumber(m?.account_number, i)}
						{uiAccountType(m?.account_type, i)}
					</div>
					<div className="flex w-full space-x-5 justify-between items-center">
						{uiIfsc(m?.ifsc, i)}
						{uiUpiId(m?.upi_id, i)}
					</div>
				</div>
			);
		});
	};

	const uiName = (value, index) => {
		return <TextInput icon={faFont} isNew={false} label="Name" onChange={(e) => handleInputs("name", index, e.target.value)} onKeyPress={() => {}} tabIndex="1" value={value} width="w-1/2" />;
	};

	const uiUpiId = (value, index) => {
		return <TextInput icon={faGooglePay} isNew={false} label="UPI ID" onChange={(e) => handleInputs("upi_id", index, e.target.value)} onKeyPress={() => {}} tabIndex="5" value={value} width="w-1/2" />;
	};

	// Main UI
	return (
		<div className="flex flex-col w-full h-full justify-between items-center">
			<div className="flex w-full justify-start items-center">{uiMain()}</div>
			<footer className="w-full dialog-footer">
				<button className="space-x-1 primary-button-condensed" onClick={() => edit()}>
					{uiEdit()}
				</button>
			</footer>
		</div>
	);
}
