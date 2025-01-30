"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import MyConstants from "@/utilities/constants";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { Spinner, SpinnerBig } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ComboBox, ComboBox2, DatePicker, TextInput } from "@/components/Inputs";
import {
	faBank,
	faBuilding,
	faCalendar,
	faChevronLeft,
	faFile,
	faIndianRupee,
	faInfoCircle,
	faNoteSticky,
	faUserGroup,
} from "@fortawesome/free-solid-svg-icons";

export default function NewCashFlow({ module, reload, unmount }) {
	// Business Logic
	const [api, setApi] = useState({
		affiliates: [],
		ownerFirms: [],
		ownerFirmsBanks: [],
		paymentTypes: [],
	});

	const [main, setMain] = useState({
		affiliate: { id: "", name: "" },
		amountPaid: "",
		amountReceived: "",
		entryAt: new Date(),
		find: { affiliate: "", ownerFirm: "", ownerFirmsBank: "" },
		hasMounted: false,
		ownerFirm: { banks: [], id: "", name: "", selectedBank: { id: "", name: "" } },
		particulars: "",
		paymentFor: "",
		paymentType: "",
		remarks: "",
	});

	const [loading, setLoading] = useState({
		adding: false,
		supportData: false,
	});

	const disableAddButton = loading.adding ? "pointer-events-none" : "pointer-events-auto";
	const addButtonStyle = `primary-button-condensed ${disableAddButton}`;

	// Functions
	async function doAddition() {
		setLoading((s) => ({ ...s, adding: true }));

		const body = {
			affiliate: main.affiliate,
			amountPaid: main.amountPaid,
			amountReceived: main.amountReceived,
			entryAt: main.entryAt,
			module,
			ownerFirmsId: main.ownerFirm.id,
			ownerFirmsBankId: main.ownerFirm.selectedBank.id,
			particulars: main.particulars,
			paymentFor: main.paymentFor,
			paymentType: main.paymentType,
			remarks: main.remarks,
			userId: MyGlobal.GetUserId(),
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.CashFlows.AddCashFlow, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				MyGlobal.AddActivity(`Added <b>${module}</b> entry.`, MyConstants.Modules.Base.CashFlow);
				MyGlobal.ShowSuccessToast(MyConstants.Messages.CashFlowAdded);

				reload();
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "New Cash Flow");
		} finally {
			unmount();
			setLoading((s) => ({ ...s, adding: false }));
		}
	}

	function getFilteredAffiliates() {
		const value = String(main.find.affiliate);
		let affiliates = api.affiliates;

		if (value !== "undefined") {
			affiliates = api.affiliates.filter((f) => {
				return String(f.name).toLowerCase().includes(value.toLowerCase());
			});
		}

		return affiliates;
	}

	function getFilteredOwnerFirms() {
		const value = String(main.find.ownerFirm);
		let firms = api.ownerFirms;

		if (value !== "undefined") {
			firms = api.ownerFirms.filter((f) => {
				return String(f.name).toLowerCase().includes(value.toLowerCase());
			});
		}

		return firms;
	}

	function getFilteredOwnerFirmsBanks() {
		const value = String(main.find.ownerFirmsBank);
		let banks = api.ownerFirmsBanks;

		if (value !== "undefined") {
			banks = api.ownerFirmsBanks.filter((f) => {
				return String(f.name).toLowerCase().includes(value.toLowerCase());
			});
		}

		return banks;
	}

	async function getSupportData() {
		setLoading((s) => ({ ...s, supportData: true }));

		try {
			const response = await axios.get(MyConstants.ApiEndpoints.CashFlows.GetSupportData, MyGlobal.GetHeaders());

			if (response.status === 200) {
				const revisedProjects = response.data.projects.map((m) => {
					const name = response.data.mainProjects.find((f) => f.id == m.main_project_id).name;

					return { ...m, id_and_name: `${m.id} - ${name}`, name };
				});

				const affiliateIds = new Set(response.data.affiliatesProjects.map((m) => m.affiliate_id));

				const mappedAffiliates = response.data.affiliates.filter((f) => affiliateIds.has(f.id));

				setApi({
					affiliates: mappedAffiliates,
					ownerFirms: response.data.ownerFirms,
					ownerFirmsBanks: response.data.ownerFirmsBanks,
					paymentTypes: JSON.parse(response.data.settings.at(0).value),
				});

				setMain((s) => ({
					...s,
					hasMounted: true,
					project: { ...s.project, list: revisedProjects },
				}));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, `${MyConstants.Modules.Base.CashFlow} => New Cash Flow => Get Support Data`);
		} finally {
			setLoading((s) => ({ ...s, supportData: false }));
		}
	}

	function setFind(key, value) {
		setMain((s) => ({ ...s, find: { ...s.find, [key]: value } }));
	}

	function setInputs(key, value) {
		if (value) {
			if (key == "affiliate") {
				setMain((s) => ({
					...s,
					affiliate: { ...s.affiliate, id: value.id, name: value.name },
					client: { ...s.client, id: "", name: "" },
					project: { ...s.project, id: "", name: "" },
				}));
			} else if (key == "ownerFirm") {
				const banks = api.ownerFirmsBanks.filter((f) => f.owner_firm_id == value.id);

				setMain((s) => ({
					...s,
					ownerFirm: {
						banks,
						id: value.id,
						name: value.name,
						selectedBank: { id: banks.at(0).id, name: banks.at(0).name },
					},
				}));
			} else if (key == "ownerFirmsBank") {
				setMain((s) => ({ ...s, ownerFirm: { ...s.ownerFirm, selectedBank: { id: value.id, name: value.name } } }));
			} else {
				setMain((s) => ({ ...s, [key]: value }));
			}

			setMain((s) => ({ ...s, find: { affiliate: "", ownerFirm: "", ownerFirmsBank: "" } }));
		}
	}

	// UI Components
	function uiAdd() {
		if (loading.adding) {
			return (
				<span className="px-3.5">
					<Spinner />
				</span>
			);
		} else {
			return "Add";
		}
	}

	function uiAffiliates() {
		return (
			<ComboBox2
				allowCreatingNewItem={false}
				comparingValue1="name"
				comparingValue2={main.affiliate.name}
				displayValue="name"
				filteredData={getFilteredAffiliates}
				hasDataObject
				icon={faUserGroup}
				label="Affiliates"
				onChange={(e) => setInputs("affiliate", e)}
				onClick={() => {}}
				onInputChange={(e) => setFind("affiliate", e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasAlphabets(e.key) && e.preventDefault()}
				searchedItem={main.find.affiliate}
				tabIndex="2"
				value={main.affiliate.name}
				width="w-full"
			/>
		);
	}

	function uiAmountPaid() {
		return (
			<TextInput
				icon={faIndianRupee}
				id="amountPaid"
				label="Amount Paid"
				onChange={(e) => setInputs("amountPaid", e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasNumbers(e.key) && e.preventDefault()}
				tabIndex="5"
				value={main.amountPaid}
				width="w-full"
			/>
		);
	}

	function uiAmountReceived() {
		return (
			<TextInput
				icon={faIndianRupee}
				id="amountReceived"
				label="Amount Received"
				onChange={(e) => setInputs("amountReceived", e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasNumbers(e.key) && e.preventDefault()}
				tabIndex="5"
				value={main.amountReceived}
				width="w-full"
			/>
		);
	}

	function uiEntryAt() {
		return <DatePicker icon={faCalendar} label="Date" onChange={(e) => setInputs("entryAt", e)} tabIndex="1" value={main.entryAt} width="w-full" />;
	}

	function uiFooter() {
		if (!loading.supportData) {
			return (
				<footer className="w-full dialog-footer">
					<button className={addButtonStyle} onClick={() => doAddition()} tabIndex="10">
						{uiAdd()}
					</button>
				</footer>
			);
		}
	}

	function uiMain() {
		if (loading.supportData) {
			return <SpinnerBig />;
		} else {
			return (
				<div className="flex flex-col w-3/5 h-full space-y-2 justify-start items-center">
					<div className="flex w-full space-x-8 justify-between items-center">
						{uiEntryAt()}
						{uiModule()}
					</div>
					<div className="flex w-full space-x-7 justify-between items-center">
						{uiOwnerFirms()}
						{uiOwnerFirmsBanks()}
					</div>
					<div className="flex w-full space-x-7 justify-between items-center">
						{module == "Inward Other Expense" ? uiAmountReceived() : uiAmountPaid()}
						{uiPaymentType()}
					</div>
					<div className="flex w-full space-x-7 justify-center items-start">
						{uiParticulars()}
						{uiPaymentFor()}
					</div>
					<div className="flex w-full space-x-7 justify-center items-start">{uiRemarks()}</div>
				</div>
			);
		}
	}

	function uiModule() {
		if (module == MyConstants.Modules.Base.Affiliates) {
			return uiAffiliates();
		}
	}

	function uiOwnerFirms() {
		return (
			<ComboBox2
				allowCreatingNewItem={false}
				comparingValue1="name"
				comparingValue2={main.ownerFirm.name}
				displayValue="name"
				filteredData={getFilteredOwnerFirms}
				hasDataObject
				icon={faBuilding}
				isReadOnly={false}
				label="Firm"
				onChange={(e) => setInputs("ownerFirm", e)}
				onClick={() => {}}
				onInputChange={(e) => setFind("ownerFirm", e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasAlphabets(e.key) && e.preventDefault()}
				searchedItem={main.find.ownerFirm}
				tabIndex="3"
				value={main.ownerFirm.name}
				width="w-full"
			/>
		);
	}

	function uiOwnerFirmsBanks() {
		return (
			<ComboBox2
				allowCreatingNewItem={false}
				comparingValue1="name"
				comparingValue2={main.ownerFirm.selectedBank.name}
				displayValue="name"
				filteredData={!main.ownerFirm.banks.length ? getFilteredOwnerFirmsBanks : main.ownerFirm.banks}
				hasDataObject
				icon={faBank}
				isReadOnly={false}
				label="Banks"
				onChange={(e) => setInputs("ownerFirmsBank", e)}
				onClick={() => {}}
				onInputChange={(e) => setFind("ownerFirmsBank", e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasAlphabets(e.key) && e.preventDefault()}
				searchedItem={main.find.ownerFirmsBank}
				tabIndex="4"
				value={main.ownerFirm.selectedBank.name}
				width="w-full"
			/>
		);
	}

	function uiParticulars() {
		return (
			<TextInput
				icon={faInfoCircle}
				id="particulars"
				label="Particulars"
				onChange={(e) => setInputs("particulars", e.target.value)}
				onKeyPress={() => {}}
				tabIndex="7"
				value={main.particulars}
				width="w-full"
			/>
		);
	}

	function uiPaymentFor() {
		return (
			<TextInput
				icon={faInfoCircle}
				id="paymentFor"
				label="Payment For"
				onChange={(e) => setInputs("paymentFor", e.target.value)}
				onKeyPress={() => {}}
				tabIndex="8"
				value={main.paymentFor}
				width="w-full"
			/>
		);
	}

	function uiPaymentType() {
		return (
			<ComboBox
				allowCreatingNewItem={false}
				comparisonValue=""
				filteredData={api.paymentTypes}
				icon={faFile}
				label="Payment Type"
				onChange={(e) => setInputs("paymentType", e)}
				onClick={() => {}}
				onKeyPress={() => {}}
				searchedItem=""
				tabIndex="6"
				value={main.paymentType}
				width="w-full"
			/>
		);
	}

	function uiRemarks() {
		return (
			<TextInput
				icon={faNoteSticky}
				id="remarks"
				label="Remarks"
				onChange={(e) => setInputs("remarks", e.target.value)}
				onKeyPress={() => {}}
				tabIndex="9"
				value={main.remarks}
				width="w-full"
			/>
		);
	}

	// Hooks
	useEffect(() => {
		getSupportData();
	}, []);

	// Main UI
	if (!main.hasMounted) {
		return;
	}

	return (
		<div className="flex flex-col w-full h-full justify-start items-center contrast-background">
			<div className="flex w-full px-5 py-2.5 justify-between items-center bottom-border primary-light-background">
				<div className="flex w-full space-x-2.5 justify-start items-center">
					<FontAwesomeIcon className="pr-1 cursor-pointer black-text" icon={faChevronLeft} onClick={() => unmount()} />
					<div className="flex w-full justify-start items-center">
						<span className="view-heading">New Cash Flow</span>
					</div>
				</div>
			</div>
			<div className="flex flex-col w-full h-[calc(100vh-102px)] justify-center items-center overflow-y-auto scrollbar-gutter">{uiMain()}</div>
			{uiFooter()}
		</div>
	);
}
