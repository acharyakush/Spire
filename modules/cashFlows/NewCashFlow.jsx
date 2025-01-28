"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import MyConstants from "@/utilities/constants";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { Spinner, SpinnerBig } from "@/components/Elements";
import { faCircle } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ComboBox, ComboBox2, DatePicker, TextArea, TextInput } from "@/components/Inputs";
import {
	faBank,
	faBriefcase,
	faBuilding,
	faCalendar,
	faChevronLeft,
	faCircleCheck,
	faDiagramProject,
	faFile,
	faIndianRupee,
	faInfoCircle,
	faMinusCircle,
	faNoteSticky,
	faPlusCircle,
	faReceipt,
	faUserGroup,
} from "@fortawesome/free-solid-svg-icons";

export default function NewCashFlow({ reload, unmount }) {
	// Business Logic
	const [api, setApi] = useState({
		affiliates: [],
		clients: [],
		companies: [],
		invoices: [],
		mainProjects: [],
		ownerFirms: [],
		ownerFirmsBanks: [],
		projects: [],
		paymentTypes: [],
	});

	const [main, setMain] = useState({
		affiliate: { id: "", isActive: false, name: "" },
		amountPaid: "",
		amountReceived: "",
		client: { id: "", isActive: true, list: [], name: "" },
		company: { id: "", list: [], name: "" },
		entryAt: new Date(),
		find: { affiliate: "", client: "", company: "", invoiceId: "", ownerFirm: "", ownerFirmsBank: "", project: "" },
		hasMounted: false,
		invoiceId: "",
		isOfficeExpense: false,
		ownerFirm: { banks: [], id: "", name: "", selectedBank: { id: "", name: "" } },
		particulars: "",
		paymentDetails: [{ amountPaid: 0, amountReceived: 0, paymentType: "", rowId: 0 }],
		paymentFor: "",
		paymentType: "",
		project: { id: "", list: [], name: "" },
	});

	const [loading, setLoading] = useState({
		addToDatabase: false,
		supportData: false,
	});

	const disableAddButton = loading.addToDatabase ? "pointer-events-none" : "pointer-events-auto";
	const addButtonStyle = `primary-button-condensed ${disableAddButton}`;

	// Functions
	function addPayment() {
		const copy = [...main.paymentDetails];

		let greatestId = copy.sort((a, b) => b.rowId - a.rowId).at(0).rowId;
		greatestId++;

		copy.push({ amountPaid: 0, amountReceived: 0, paymentType: "", rowId: greatestId });

		setMain((s) => ({ ...s, paymentDetails: copy }));
	}

	async function addInvoiceCashFlow() {
		setLoading((s) => ({ ...s, addToDatabase: true }));

		const invoiceObject = api.invoices.find((f) => f.custom_id == main.invoiceId);

		const body = {
			amountReceived: main.amountReceived,
			clientId: invoiceObject.client_id,
			entryAt: main.entryAt,
			invoiceId: main.invoiceId,
			ownerFirmsId: main.ownerFirm.id,
			ownerFirmsBankId: main.ownerFirm.selectedBank.id,
			particulars: main.particulars,
			paymentFor: main.paymentFor,
			paymentType: main.paymentType,
			projectId: invoiceObject.project_id,
			userId: MyGlobal.GetUserId(),
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.CashFlows.AddInvoice, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				MyGlobal.AddActivity(`Added invoice cash flow entry.`, MyConstants.Modules.Base.CashFlow);
				MyGlobal.ShowSuccessToast(MyConstants.Messages.CashFlowAdded);

				reload();
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Add Cash Flow");
		} finally {
			setLoading((s) => ({ ...s, addToDatabase: false }));
		}
	}

	async function addToDatabase() {
		setLoading((s) => ({ ...s, addToDatabase: true }));

		const object = {};

		main.paymentDetails.forEach((fe) => {
			object[fe.paymentType] = fe;
		});

		const amountPaid = Object.values(object).reduce((pv, cv) => pv + cv.amountPaid, 0);

		const amountReceived = Object.values(object).reduce((pv, cv) => pv + cv.amountReceived, 0);

		const body = {
			affiliate: main.affiliate,
			amountPaid,
			amountReceived,
			client: {
				id: main.client.id,
				isActive: main.client.isActive,
				name: main.client.name,
			},
			companyId: main.company.id,
			entryAt: dayjs(main.entryAt),
			isOfficeExpense: main.isOfficeExpense,
			ownerFirm: { bankId: main.ownerFirm.selectedBank.id, id: main.ownerFirm.id },
			particulars: main.particulars,
			paymentFor: main.paymentFor,
			projectId: main.project.id,
			userId: MyGlobal.GetUserId(),
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.CashFlows.AddCashFlow, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reload();
				unmount();

				MyGlobal.AddActivity("Added cash flow entry", MyConstants.Modules.Base.Tasks);

				MyGlobal.ShowSuccessToast(MyConstants.Messages.CashFlowAdded);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Add Cash Flow");
		} finally {
			setLoading((s) => ({ ...s, addToDatabase: false }));
		}
	}

	function clearFind() {
		setMain((s) => ({
			...s,
			find: { affiliate: "", client: "", company: "", ownerFirm: "", ownerFirmsBank: "", project: "" },
		}));
	}

	function deletePayment(record) {
		const copy = [...main.paymentDetails];
		const doesExist = copy.filter((f) => f.rowId == record.rowId);

		if (doesExist.length) {
			const revised = copy.filter((f) => f.rowId != record.rowId);
			setMain((s) => ({ ...s, paymentDetails: revised }));
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

	function getFilteredClients() {
		const value = String(main.find.client);
		let clients = api.clients;

		if (value !== "undefined") {
			clients = api.clients.filter((f) => {
				return String(f.name).toLowerCase().includes(value.toLowerCase());
			});
		}

		return clients;
	}

	function getFilteredCompanies() {
		const value = String(main.find.company);
		let companies = api.companies;

		if (value !== "undefined") {
			companies = api.companies.filter((f) => {
				return String(f.name).toLowerCase().includes(value.toLowerCase());
			});
		}

		return companies;
	}

	function getFilteredInvoices() {
		const value = String(main.find.invoiceId);
		let list = api.invoices;

		if (value !== "undefined") {
			list = api.invoices.filter((f) => {
				return String(f.custom_id).toLowerCase().includes(value.toLowerCase());
			});
		}

		return list;
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
				const revisedInvoices = response.data.invoices.map((m) => {
					return { ...m, name: m.custom_id };
				});

				const revisedProjects = response.data.projects.map((m) => {
					const name = response.data.mainProjects.find((f) => f.id == m.main_project_id).name;

					return { ...m, id_and_name: `${m.id} - ${name}`, name };
				});

				setApi({
					affiliates: response.data.affiliates,
					clients: response.data.clients,
					companies: response.data.companies,
					mainProjects: response.data.mainProjects,
					invoices: revisedInvoices,
					ownerFirms: response.data.ownerFirms,
					ownerFirmsBanks: response.data.ownerFirmsBanks,
					projects: revisedProjects,
					paymentTypes: JSON.parse(response.data.settings.at(0).value),
				});

				setMain((s) => ({ ...s, hasMounted: true, project: { ...s.project, list: revisedProjects } }));
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
			} else if (key == "client") {
				setMain((s) => ({
					...s,
					affiliate: { ...s.affiliate, id: "", name: "" },
					client: { ...s.client, id: value.id, name: value.name },
				}));
			} else if (key == "company") {
				const project = api.projects.filter((f) => f.company_id == value.id);

				if (project.length) {
					setMain((s) => ({
						...s,
						project: {
							...s.project,
							id: project.at(0).id,
							name: project.at(0).name,
						},
					}));
				}

				setMain((s) => ({ ...s, company: { ...s.company, id: value.id, name: value.name } }));
			} else if (key == "invoiceId") {
				setMain((s) => ({ ...s, invoiceId: value.name }));
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
			} else if (key == "project") {
				const project = api.projects.filter((f) => f.id == value.id);
				let company = [];

				if (project.length) {
					company = api.companies.filter((f) => f.id == project.at(0).company_id);

					if (company.length) {
						setMain((s) => ({ ...s, company: { ...s.company, id: company.id, name: company.name } }));
					}

					setMain((s) => ({ ...s, project: { ...s.project, id: value.id, name: value.name } }));
				}
			} else {
				setMain((s) => ({ ...s, [key]: value }));
			}

			clearFind();
		}
	}

	function setPayments(key, rowId, value) {
		const copy = [...main.paymentDetails];
		const object = copy.filter((f) => f.rowId == rowId).at(0);

		object[key] = key == "amountPaid" || key == "amountReceived" ? Number(value) : value;

		const revised = copy.filter((f) => f.rowId != rowId);
		revised.push({ ...object });

		setMain((s) => ({ ...s, paymentDetails: revised }));
	}

	function setSelectedAffiliatesProjects() {
		const project = api.projects.filter((f) => {
			if (f.affiliate_ids) {
				const affiliateIds = String(f.affiliate_ids);

				const names = affiliateIds.includes(",") ? affiliateIds.split(",") : [f.affiliate_ids];

				return names.length ? names.includes(main.affiliate.id) : false;
			}
		});

		if (project.length) {
			setMain((s) => ({
				...s,
				project: {
					id: project.at(0).id,
					list: project,
					name: project.at(0).name,
				},
			}));
		}
	}

	function setSelectedClientData() {
		const company = api.companies.filter((f) => f.client_id == main.client.id);
		const companyId = company.length ? company.at(0).id : 0;
		const companyName = company.length ? company.at(0).name : "";

		const project = api.projects.filter((f) => f.client_id == main.client.id);
		const projectId = project.length ? project.at(0).id : 0;
		const projectName = project.length ? project.at(0).name : "";

		setMain((s) => ({
			...s,
			company: { id: companyId, list: company, name: companyName },
			project: { id: projectId, list: project, name: projectName },
		}));
	}

	function toggleInputs(key, value) {
		if (key == "affiliate") {
			setMain((s) => ({
				...s,
				[key]: { ...s[key], isActive: value },
				client: { ...s.client, isActive: !value },
				isOfficeExpense: false,
			}));
		} else if (key == "officeExpense") {
			setMain((s) => ({
				...s,
				affiliate: { ...s.affiliate, isActive: false },
				client: { ...s.client, isActive: false },
				isOfficeExpense: value,
			}));
		} else {
			setMain((s) => ({
				...s,
				affiliate: { ...s.affiliate, isActive: !value },
				[key]: { ...s[key], isActive: value },
				isOfficeExpense: false,
			}));
		}
	}

	// UI Components
	function uiAdd() {
		if (loading.addToDatabase) {
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
		const icon = main.affiliate.isActive ? faCircleCheck : faCircle;
		const iconColour = main.affiliate.isActive ? "green-text" : "primary-text";

		const cursor = !main.affiliate.isActive ? "cursor-not-allowed" : "cursor-default";
		const wrapper = `flex w-full pl-2 space-x-2 justify-center items-center ${cursor}`;

		return (
			<div className={wrapper}>
				<button className="flex h-11 justify-center items-end cursor-pointer" onClick={() => toggleInputs("affiliate", !main.affiliate.isActive)}>
					<FontAwesomeIcon className={iconColour} icon={icon} size="xl" />
				</button>
				<ComboBox2
					allowCreatingNewItem={false}
					comparingValue1="name"
					comparingValue2={main.affiliate.name}
					displayValue="name"
					filteredData={getFilteredAffiliates}
					hasDataObject={true}
					icon={faUserGroup}
					isReadOnly={!main.affiliate.isActive}
					label="Affiliates"
					onChange={(e) => setInputs("affiliate", e)}
					onClick={() => {}}
					onInputChange={(e) => setFind("affiliate", e.target.value)}
					onKeyPress={(e) => !MyGlobal.HasAlphabets(e.key) && e.preventDefault()}
					searchedItem={main.find.affiliate}
					tabIndex={5}
					value={main.affiliate.name}
					width="w-full"
				/>
			</div>
		);
	}

	function uiAmountPaid(record, rowId) {
		const disable = record.amountReceived > 0;

		return (
			<TextInput
				disable={disable}
				icon={faIndianRupee}
				id={`amountPaid${rowId + 1}`}
				isReadOnly={disable}
				label={`Amount Paid #${rowId + 1}`}
				onChange={(e) => setPayments("amountPaid", rowId, e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasNumbers(e.key) && e.preventDefault()}
				tabIndex={`${rowId}1`}
				value={record.amountPaid}
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

	function uiClients() {
		const icon = main.client.isActive ? faCircleCheck : faCircle;
		const iconColour = main.client.isActive ? "green-text" : "primary-text";

		const cursor = !main.client.isActive || main.isOfficeExpense ? "cursor-not-allowed" : "cursor-default";
		const wrapper = `flex w-full space-x-2 justify-center items-center ${cursor}`;

		return (
			<div className={wrapper}>
				<button className="flex h-11 justify-center items-end cursor-pointer" onClick={() => toggleInputs("client", !main.client.isActive)}>
					<FontAwesomeIcon className={iconColour} icon={icon} size="xl" />
				</button>
				<ComboBox2
					allowCreatingNewItem={false}
					comparingValue1="name"
					comparingValue2={main.client.name}
					displayValue="name"
					filteredData={getFilteredClients}
					hasDataObject={true}
					icon={faUserGroup}
					isReadOnly={!main.client.isActive}
					label="Clients"
					onChange={(e) => setInputs("client", e)}
					onClick={() => {}}
					onInputChange={(e) => setFind("client", e.target.value)}
					onKeyPress={(e) => !MyGlobal.HasAlphabets(e.key) && e.preventDefault()}
					searchedItem={main.find.client}
					tabIndex={6}
					value={main.client.name}
					width="w-full"
				/>
			</div>
		);
	}

	function uiCompanies() {
		return (
			<ComboBox2
				allowCreatingNewItem={false}
				comparingValue1="name"
				comparingValue2={main.company.name}
				displayValue="name"
				filteredData={getFilteredCompanies}
				hasDataObject={true}
				icon={faBriefcase}
				isReadOnly={!main.client.isActive}
				label="Companies"
				onChange={(e) => setInputs("company", e)}
				onClick={() => {}}
				onInputChange={(e) => setFind("company", e.target.value)}
				onKeyPress={() => !MyGlobal.HasAlphabets(e.key) && e.preventDefault()}
				searchedItem={main.find.company}
				tabIndex={7}
				value={main.company.name}
				width="w-full"
			/>
		);
	}

	function uiEntryAt() {
		return <DatePicker icon={faCalendar} label="Date" onChange={(e) => setInputs("entryAt", e)} tabIndex={4} value={main.entryAt} width="w-full" />;
	}

	function uiFooter() {
		if (!loading.supportData) {
			return (
				<footer className="w-full dialog-footer">
					<button className={addButtonStyle} onClick={() => addInvoiceCashFlow()} tabIndex={11}>
						{uiAdd()}
					</button>
				</footer>
			);
		}
	}

	function uiInvoices() {
		return (
			<ComboBox2
				allowCreatingNewItem={false}
				comparingValue1="name"
				comparingValue2={main.invoiceId}
				displayValue="name"
				filteredData={getFilteredInvoices}
				hasDataObject={true}
				icon={faReceipt}
				label="Invoices"
				onChange={(e) => setInputs("invoiceId", e)}
				onClick={() => {}}
				onInputChange={(e) => setFind("invoiceId", e.target.value)}
				onKeyPress={() => {}}
				searchedItem={main.find.invoiceId}
				tabIndex={6}
				value={main.invoiceId}
				width="w-full"
			/>
		);
	}

	function uiIsOfficeExpense() {
		const icon = main.isOfficeExpense ? faCircleCheck : faCircle;
		const iconColour = main.isOfficeExpense ? "green-text" : "primary-text";

		return (
			<div className="flex w-full pl-2 space-x-4 justify-start items-end">
				<button className="flex h-11 justify-center items-end cursor-pointer" onClick={() => toggleInputs("officeExpense", !main.isOfficeExpense)}>
					<FontAwesomeIcon className={iconColour} icon={icon} tabIndex={3} size="xl" />
				</button>
				<span className="block font-medium-11 light-slate-gray-text">Is Office Expense?</span>
			</div>
		);
	}

	function uiMain() {
		if (loading.supportData) {
			return <SpinnerBig />;
		} else {
			return (
				<div className="flex flex-col w-3/5 h-full space-y-2 justify-start items-center">
					<div className="flex w-full space-x-8 justify-between items-center">
						{/* {uiIsOfficeExpense()} */}
						{uiEntryAt()}
						{uiInvoices()}
					</div>
					<div className="flex w-full space-x-7 justify-between items-center">
						{uiOwnerFirms()}
						{uiOwnerFirmsBanks()}
					</div>
					{/* <div className="flex w-full space-x-9 justify-between items-center">
						{uiAffiliates()}
						{uiClients()}
					</div> */}
					{/* <div className="flex w-full space-x-7 justify-between items-center">
						{uiCompanies()}
						{uiProjects()}
					</div> */}
					<div className="flex w-full space-x-7 justify-between items-center">
						{uiAmountReceived()}
						{uiPaymentType()}
					</div>
					<div className="flex w-full space-x-7 justify-center items-start">
						{uiParticulars()}
						{uiPaymentFor()}
					</div>
				</div>
			);
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
				hasDataObject={true}
				icon={faBuilding}
				isReadOnly={false}
				label="Firm"
				onChange={(e) => setInputs("ownerFirm", e)}
				onClick={() => {}}
				onInputChange={(e) => setFind("ownerFirm", e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasAlphabets(e.key) && e.preventDefault()}
				searchedItem={main.find.ownerFirm}
				tabIndex={1}
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
				hasDataObject={true}
				icon={faBank}
				isReadOnly={false}
				label="Banks"
				onChange={(e) => setInputs("ownerFirmsBank", e)}
				onClick={() => {}}
				onInputChange={(e) => setFind("ownerFirmsBank", e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasAlphabets(e.key) && e.preventDefault()}
				searchedItem={main.find.ownerFirmsBank}
				tabIndex={2}
				value={main.ownerFirm.selectedBank.name}
				width="w-full"
			/>
		);
	}

	function uiParticulars() {
		return (
			<TextArea
				icon={faNoteSticky}
				label="Particulars"
				onChange={(e) => setInputs("particulars", e.target.value)}
				onKeyDown={() => {}}
				rows={2}
				tabIndex={9}
				value={main.particulars}
				width="w-full"
			/>
		);
	}

	function uiPaymentFor() {
		return (
			<TextArea
				icon={faInfoCircle}
				label="Payment For"
				onChange={(e) => setInputs("paymentFor", MyGlobal.Capitalize(e.target.value))}
				onKeyDown={() => {}}
				rows={2}
				tabIndex={10}
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
				searchedItem={""}
				tabIndex="6"
				value={MyGlobal.GetInitials(main.paymentType)}
				width="w-full"
			/>
		);
	}

	function uiProjects() {
		const value = main.project.id && main.project.name ? `${main.project.id} - ${main.project.name}` : "";

		return (
			<ComboBox2
				allowCreatingNewItem={false}
				comparingValue1="name"
				comparingValue2={main.project.name}
				displayValue="id_and_name"
				filteredData={main.project.list}
				hasDataObject={true}
				icon={faDiagramProject}
				isReadOnly={main.isOfficeExpense}
				label="Projects"
				onChange={(e) => setInputs("project", e)}
				onClick={() => {}}
				onInputChange={(e) => setFind("project", e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasAlphabets(e.key) && e.preventDefault()}
				searchedItem={main.find.project}
				tabIndex={8}
				value={value}
				width="w-full"
			/>
		);
	}

	function uiRows() {
		return main.paymentDetails
			.sort((a, b) => a.rowId - b.rowId)
			.map((m, i) => {
				const showAddButton = i == main.paymentDetails.length - 1 && main.paymentDetails.length != api.paymentTypes.length ? "flex" : "hidden";

				const showDeleteButton = main.paymentDetails.length > 1 ? "flex" : "hidden";

				const addButtonWrapper = `${showAddButton} w-fit h-[55px] justify-center items-center`;

				const deleteButtonWrapper = `${showDeleteButton} w-fit h-[55px] justify-center items-center`;

				return (
					<div className="flex w-full space-x-3 justify-between items-end" key={m.rowId}>
						{uiAmountPaid(m, 8 + i)}
						{uiAmountReceived(m, 8 + i)}
						{uiPaymentType(m, 8 + i)}
						<div className={addButtonWrapper}>
							<FontAwesomeIcon className="cursor-pointer green-text" icon={faPlusCircle} onClick={() => addPayment()} size="lg" />
						</div>
						<div className={deleteButtonWrapper}>
							<FontAwesomeIcon className="cursor-pointer red-text" icon={faMinusCircle} onClick={() => deletePayment(m)} size="lg" />
						</div>
					</div>
				);
			});
	}

	// Hooks
	useEffect(() => {
		getSupportData();
	}, []);

	useEffect(() => {
		if (main.hasMounted) {
			setSelectedAffiliatesProjects();
		}
	}, [main.affiliate.id]);

	useEffect(() => {
		if (main.hasMounted) {
			setSelectedClientData();
		}
	}, [main.client.id]);

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
