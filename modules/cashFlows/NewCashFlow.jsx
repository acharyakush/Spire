"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import MyConstants from "@/utilities/constants";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { Spinner } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DatePicker, TextArea, TextInput } from "@/components/Inputs";
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import {
	faAngleDown,
	faBriefcase,
	faCalendar,
	faCheck,
	faChevronLeft,
	faDiagramProject,
	faFile,
	faIndianRupee,
	faInfoCircle,
	faMinusCircle,
	faNoteSticky,
	faPlusCircle,
	faSquare,
	faSquareCheck,
	faUserGroup,
} from "@fortawesome/free-solid-svg-icons";

export default function NewCashFlow({ reload, unmount }) {
	// Business Logic
	const [api, setApi] = useState({
		affiliates: [],
		clients: [],
		companies: [],
		mainProjects: [],
		projects: [],
		paymentTypes: [],
	});

	const [main, setMain] = useState({
		affiliate: { details: "", id: "", isActive: false, name: "" },
		amountPaid: "",
		amountReceived: "",
		client: { id: "", isActive: true, list: [], name: "" },
		company: { id: "", list: [], name: "" },
		entryDate: new Date(),
		find: { affiliate: "", client: "", company: "", project: "" },
		hasMounted: false,
		isLoading: false,
		isOfficeExpense: false,
		particulars: "",
		paymentDetails: [{ amountPaid: 0, amountReceived: 0, paymentType: "", rowId: 0 }],
		paymentFor: "",
		project: { id: "", list: [], name: "" },
	});

	const [loading, setLoading] = useState({
		addToDatabase: false,
		supportData: false,
	});

	const disableAddButton = main.isLoading ? "pointer-events-none" : "pointer-events-auto";
	const addButtonStyle = `primary-button-condensed ${disableAddButton}`;

	// Functions
	function addPayment() {
		const copy = [...main.paymentDetails];

		let greatestId = copy.sort((a, b) => b.rowId - a.rowId).at(0).rowId;
		greatestId++;

		copy.push({ amountPaid: 0, amountReceived: 0, paymentType: "", rowId: greatestId });

		setMain((s) => ({ ...s, paymentDetails: copy }));
	}

	async function addToDatabase() {
		setLoading((s) => ({ ...s, addToDatabase: true }));

		const object = {};

		main.paymentDetails.forEach((fe) => {
			object[fe.paymentType] = fe;
		});

		const amountPaid = Object.values(object).reduce((total, object) => total + object.amountPaid, 0);

		const amountReceived = Object.values(object).reduce((total, object) => total + object.amountReceived, 0);

		const parsedAffiliatesDetails = JSON.parse(main.affiliate.details);
		const revisedAffiliateDetails = parsedAffiliatesDetails?.filter((aff) => aff.project_id == main.project.id);

		let revisedAffiliates = [];
		let newObject = {};

		if (revisedAffiliateDetails?.length) {
			newObject = revisedAffiliateDetails?.at(0);
			newObject.paid_fees = amountPaid;

			const revisedAffiliates1 = parsedAffiliatesDetails?.filter((aff) => aff.project_id != main.project.id);
			revisedAffiliates = [...revisedAffiliates1, newObject];
		}

		const body = {
			affiliate: { ...main.affiliate, details: revisedAffiliates },
			amountPaid,
			amountReceived,
			client: main.client,
			companyId: main.company.id,
			date: dayjs(main.date).format("YYYY-MM-DD"),
			isOfficeExpense: main.isOfficeExpense,
			particulars: main.particulars,
			paymentDetails: JSON.stringify(object),
			paymentFor: main.paymentFor,
			projectId: main.project.id,
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.CashFlows.AddCashFlow, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reload();
				unmount();

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

	function getMainProjectName(id) {
		if (api.mainProjects.length) {
			return api.mainProjects.find((f) => f.id == id).name;
		}

		return "";
	}

	async function getSupportData() {
		setLoading((s) => ({ ...s, supportData: true }));

		try {
			const response = await axios.get(MyConstants.ApiEndpoints.CashFlows.GetSupportData, MyGlobal.GetHeaders());

			if (response.status === 200) {
				setApi({
					affiliates: response.data.affiliates,
					clients: response.data.clients,
					companies: response.data.companies,
					mainProjects: response.data.mainProjects,
					projects: response.data.projects,
					paymentTypes: JSON.parse(response.data.settings),
				});
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
		if (key == "affiliate") {
			setMain((s) => ({
				...s,
				affiliate: { ...s.affiliate, details: value.details, id: value.id, name: value.name },
				search: { ...s.search, affiliate: "", project: "" },
			}));
		} else if (key == "client") {
			setMain((s) => ({
				...s,
				client: { ...s.client, id: value.id, name: value.name },
				search: { ...s.search, client: "" },
			}));
		} else if (key == "company") {
			const project = api.projects.filter((f) => f.company_id == value.id);

			if (project.length) {
				const mainProject = api.mainProjects.find((f) => f.id == project.at(0).main_project_id);

				setMain((s) => ({
					...s,
					company: { ...s.company, id: value.id, name: value.name },
					search: { ...s.search, company: "" },
					project: {
						...s.project,
						id: project.at(0).id,
						main_project: mainProject.name,
					},
				}));
			} else {
				setMain((s) => ({
					...s,
					company: { ...s.company, id: value.id, name: value.name },
					search: { ...s.search, company: "" },
				}));
			}
		} else if (key == "project") {
			const project = api.projects.filter((f) => f.id == value.id);
			let company = [];

			if (project.length) {
				company = api.companies.filter((f) => f.id == project.at(0).company_id);

				if (company.length) {
					setMain((s) => ({
						...s,
						company: { ...s.company, id: company.id, name: company.name },
						search: { ...s.search, project: "" },
						project: { ...s.project, id: value.id, main_project: value.name },
					}));
				} else {
					setMain((s) => ({
						...s,
						search: { ...s.search, project: "" },
						project: { ...s.project, id: value.id, main_project: value.name },
					}));
				}
			}
		} else {
			setMain((s) => ({ ...s, [key]: value }));
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
			const names = f.affiliate_ids.includes(",") ? f.affiliate_ids.split(",") : [f.affiliate_ids];

			return names.length ? names.includes(main.affiliate.id) : false;
		});

		const projectName = getMainProjectName(project.at(0).main_project_id);

		setMain((s) => ({
			...s,
			project: {
				id: project.at(0).id,
				list: project,
				name: projectName,
			},
		}));
	}

	function setSelectedClientData() {
		const company = api.companies.filter((f) => f.client_id == main.client.id);
		const companyId = company.length ? company.at(0).id : 0;
		const companyName = company.length ? company.at(0).name : "";

		const project = api.projects.filter((f) => f.client_id == main.client.id);
		const projectId = project.length ? project.at(0).id : 0;

		const projectName = project.length ? getMainProjectName(project.at(0).main_project_id) : "";

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
	const uiAdd = () => {
		if (main.isLoading) {
			return (
				<span className="px-3.5">
					<Spinner />
				</span>
			);
		} else {
			return "Add";
		}
	};

	function uiAffiliates() {
		const icon = main.affiliate.isActive ? faSquareCheck : faSquare;
		const clickEvent = !main.affiliate.isActive ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";
		const wrapper = `flex flex-col w-full py-2 ${clickEvent}`;

		return (
			<div className="flex flex-col w-full p-2">
				<span
					className="w-fit space-x-2 cursor-pointer font-regular-10 light-slate-gray-text"
					onClick={() => toggleInputs("affiliate", !main.affiliate.isActive)}>
					<FontAwesomeIcon className="primary-text" icon={icon} size="lg" />
					<span>Affiliates</span>
				</span>
				<div className={wrapper}>
					<div className="flex w-full justify-start items-center">
						<Combobox onChange={(e) => setInputs("affiliate", e)} value={main.affiliate.name}>
							<div className="relative w-full">
								<div className="flex w-full h-[30px] px-2.5 space-x-1 justify-center items-center relative overflow-hidden rounded bottom-shadow black-white-background full-border">
									<FontAwesomeIcon className="primary-text" icon={faUserGroup} />
									<ComboboxInput
										autoComplete="off"
										className="w-full p-2 font-regular-10 bg-transparent black-text outline-none"
										displayValue={(m) => m}
										onChange={(e) => setFind("affiliate", e.target.value)}
										tabIndex={3}
									/>
									<ComboboxButton className="flex absolute pr-2 items-center inset-y-0 right-0 outline-none">
										<FontAwesomeIcon className="gray-text" icon={faAngleDown} />
									</ComboboxButton>
								</div>
								<ComboboxOptions className="absolute w-full max-h-[148px] mt-1 overflow-auto rounded bottom-shadow outline-none z-50 full-border black-white-background">
									{uiAffiliatesList()}
								</ComboboxOptions>
							</div>
						</Combobox>
					</div>
				</div>
			</div>
		);
	}

	function uiAffiliatesList() {
		return getFilteredAffiliates().map((m, i) => {
			const isSelected = m.id == main.affiliate.id;

			const nameStyle = isSelected ? "font-medium-10 primary-text" : "font-regular-10 black-text";
			const wrapper = `flex w-full p-2 justify-between items-center select-none cursor-pointer hovered-rows ${
				isSelected && "primary-background-transparent-01"
			}`;

			return (
				<ComboboxOption className={wrapper} key={i} value={{ details: m.details, id: m.id, name: m.name }}>
					<span className={nameStyle}>
						<span>{m.name}</span>
					</span>
					{isSelected && <FontAwesomeIcon className="primary-text" icon={faCheck} />}
				</ComboboxOption>
			);
		});
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

	function uiAmountReceived(record, rowId) {
		const disable = record.amountPaid > 0 || main.affiliate.isActive;

		return (
			<TextInput
				disable={disable}
				icon={faIndianRupee}
				id={`amountReceived${rowId + 1}`}
				isReadOnly={disable}
				label={`Amount Received #${rowId + 1}`}
				onChange={(e) => setPayments("amountReceived", rowId, e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasNumbers(e.key) && e.preventDefault()}
				tabIndex={`${rowId}2`}
				value={record.amountReceived}
				width="w-full"
			/>
		);
	}

	function uiClients() {
		const icon = main.client.isActive ? faSquareCheck : faSquare;
		const clickEvent = !main.client.isActive || main.isOfficeExpense ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";
		const wrapper = `flex flex-col w-full py-2 ${clickEvent}`;

		return (
			<div className="flex flex-col w-full py-2">
				<div
					className="w-fit space-x-2 cursor-pointer font-regular-10 light-slate-gray-text"
					onClick={() => toggleInputs("client", !main.client.isActive)}>
					<FontAwesomeIcon className="primary-text" icon={icon} size="lg" />
					<span>Clients</span>
				</div>
				<div className={wrapper}>
					<div className="flex w-full justify-start items-center">
						<Combobox onChange={(e) => setInputs("client", e)} value={main.client.name}>
							<div className="relative w-full">
								<div className="flex w-full h-[30px] px-2.5 space-x-1 justify-center items-center relative overflow-hidden rounded bottom-shadow black-white-background full-border">
									<FontAwesomeIcon className="primary-text" icon={faUserGroup} />
									<ComboboxInput
										autoComplete="off"
										className="w-full p-2 font-regular-10 bg-transparent black-text outline-none"
										displayValue={(m) => m}
										onChange={(e) => setFind("client", e.target.value)}
										tabIndex={4}
									/>
									<ComboboxButton className="flex absolute pr-2 items-center inset-y-0 right-0 outline-none">
										<FontAwesomeIcon className="gray-text" icon={faAngleDown} />
									</ComboboxButton>
								</div>
								<ComboboxOptions className="absolute w-full max-h-[148px] mt-1 overflow-auto rounded bottom-shadow outline-none z-50 full-border black-white-background">
									{uiClientsList()}
								</ComboboxOptions>
							</div>
						</Combobox>
					</div>
				</div>
			</div>
		);
	}

	function uiClientsList() {
		return getFilteredClients().map((m, i) => {
			const isSelected = m.id == main.client.id;

			const textStyle = isSelected ? "font-medium-10 primary-text" : "font-regular-10 black-text";

			const wrapper = `flex w-full p-2 justify-between items-center select-none cursor-pointer hovered-rows ${
				isSelected && "primary-background-transparent-01"
			}`;

			return (
				<ComboboxOption className={wrapper} key={i} value={{ id: m.id, name: m.name }}>
					<span className={textStyle}>{m.name}</span>
					{isSelected && <FontAwesomeIcon className="primary-text" icon={faCheck} />}
				</ComboboxOption>
			);
		});
	}

	function uiCompanies() {
		const clickEvent = !main.client.isActive ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";
		const wrapper = `flex flex-col w-full p-2 space-y-1 ${clickEvent}`;

		return (
			<div className={wrapper}>
				<span className="font-regular-10 light-slate-gray-text">Companies</span>
				<div className="flex w-full justify-start items-center">
					<Combobox onChange={(e) => setInputs("company", e)} value={main.company.name}>
						<div className="relative w-full">
							<div className="flex w-full h-[30px] px-2.5 space-x-1 justify-center items-center relative overflow-hidden rounded bottom-shadow black-white-background full-border">
								<FontAwesomeIcon className="primary-text" icon={faBriefcase} />
								<ComboboxInput
									autoComplete="off"
									className="w-full p-2 font-regular-10 bg-transparent black-text outline-none"
									displayValue={(m) => m}
									onChange={(e) => setFind("company", e.target.value)}
									tabIndex={5}
								/>
								<ComboboxButton className="flex absolute pr-2 items-center inset-y-0 right-0 outline-none">
									<FontAwesomeIcon className="gray-text" icon={faAngleDown} />
								</ComboboxButton>
							</div>
							<ComboboxOptions className="absolute w-full max-h-[148px] mt-1 overflow-auto rounded bottom-shadow outline-none z-50 full-border black-white-background">
								{uiCompaniesList()}
							</ComboboxOptions>
						</div>
					</Combobox>
				</div>
			</div>
		);
	}

	function uiCompaniesList() {
		return getFilteredCompanies().map((m, i) => {
			const isSelected = m.id == main.company.id;

			const textStyle = isSelected ? "font-medium-10 primary-text" : "font-regular-10 black-text";

			const wrapper = `flex w-full p-2 justify-between items-center select-none cursor-pointer hovered-rows ${
				isSelected && "primary-background-transparent-01"
			}`;

			return (
				<ComboboxOption className={wrapper} key={i} value={{ id: m.id, name: m.name }}>
					<span className={textStyle}>{m.name}</span>
					{isSelected && <FontAwesomeIcon className="primary-text" icon={faCheck} />}
				</ComboboxOption>
			);
		});
	}

	function uiEntryDate() {
		return <DatePicker icon={faCalendar} label="Date" onChange={(e) => setInputs("entryDate", e)} tabIndex={1} value={main.entryDate} width="w-full" />;
	}

	function uiOfficeExpense() {
		const icon = main.isOfficeExpense ? faSquareCheck : faSquare;
		const clickEvent = main.affiliate.isActive ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";
		const wrapper = `flex w-full h-full py-2 ${clickEvent}`;

		return (
			<div className="flex flex-col w-full py-2">
				<span
					className="w-fit space-x-2 cursor-pointer font-regular-10 light-slate-gray-text"
					onClick={() => toggleInputs("officeExpense", !main.isOfficeExpense)}>
					<FontAwesomeIcon className="primary-text" icon={icon} size="lg" />
					<span>Is Office Expense?</span>
				</span>
				<div className={wrapper}>
					<div className="flex w-full justify-center items-center">
						<span className="flex w-full h-[30px] px-2.5 space-x-1 justify-start items-center relative overflow-hidden rounded shadow contrast-background font-regular-10 gray-text full-border">
							This is office's internal expense.
						</span>
					</div>
				</div>
			</div>
		);
	}

	function uiParticulars() {
		return (
			<TextArea
				icon={faNoteSticky}
				label="Particulars"
				onChange={(e) => setInputs("particulars", e.target.value)}
				onKeyDown={() => {}}
				rows={3}
				tabIndex={7}
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
				rows={3}
				tabIndex={8}
				value={main.paymentFor}
				width="w-full"
			/>
		);
	}

	function uiPaymentType(record, rowId) {
		return (
			<div className="flex flex-col w-full p-2 space-y-1">
				<span className="font-regular-10 light-slate-gray-text">Payment Type #{rowId + 1}</span>
				<div className="flex w-full justify-start items-center">
					<Combobox onChange={(e) => setPayments("paymentType", rowId, e)} value={MyGlobal.GetInitials(record.paymentType)}>
						<div className="relative w-full">
							<div className="flex w-full h-[30px] px-2.5 space-x-1 justify-center items-center relative overflow-hidden rounded bottom-shadow black-white-background full-border">
								<FontAwesomeIcon className="primary-text" icon={faFile} />
								<ComboboxInput
									autoComplete="off"
									className="w-full p-2 font-regular-10 bg-transparent black-text outline-none"
									displayValue={(m) => m}
									onChange={{}}
									tabIndex={`${rowId}3`}
								/>
								<ComboboxButton className="flex absolute pr-2 items-center inset-y-0 right-0 outline-none">
									<FontAwesomeIcon className="gray-text" icon={faAngleDown} />
								</ComboboxButton>
							</div>
							<ComboboxOptions className="absolute w-full max-h-[148px] mt-1 overflow-auto rounded bottom-shadow outline-none z-50 full-border black-white-background">
								{uiPaymentTypeList(record, rowId)}
							</ComboboxOptions>
						</div>
					</Combobox>
				</div>
			</div>
		);
	}

	function uiPaymentTypeList(record) {
		return api.paymentTypes.map((m, i) => {
			const isSelected = m == record.paymentType;

			const textStyle = isSelected ? "font-medium-10 primary-text" : "font-regular-10 black-text";

			const wrapper = `flex w-full p-2 justify-between items-center select-none cursor-pointer hovered-rows ${
				isSelected && "primary-background-transparent-01"
			}`;

			return (
				<ComboboxOption className={wrapper} key={i} value={m}>
					<span className={textStyle}>{m}</span>
					{isSelected && <FontAwesomeIcon className="primary-text" icon={faCheck} />}
				</ComboboxOption>
			);
		});
	}

	function uiProjects() {
		const value = `${main.project.id} - ${main.project.name}`;
		const clickEvent = main.isOfficeExpense ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";
		const wrapper = `flex flex-col w-full py-2 space-y-1 ${clickEvent}`;

		return (
			<div className={wrapper}>
				<span className="font-regular-10 light-slate-gray-text">Projects</span>
				<div className="flex w-full justify-start items-center">
					<Combobox onChange={(e) => setInputs("project", e)} value={value}>
						<div className="relative w-full">
							<div className="flex w-full h-[30px] px-2.5 space-x-1 justify-center items-center relative overflow-hidden rounded bottom-shadow black-white-background full-border">
								<FontAwesomeIcon className="primary-text" icon={faDiagramProject} />
								<ComboboxInput
									autoComplete="off"
									className="w-full p-2 font-regular-10 bg-transparent black-text outline-none"
									displayValue={(m) => m}
									onChange={(e) => setFind("project", e.target.value)}
									tabIndex={6}
								/>
								<ComboboxButton className="flex absolute pr-2 items-center inset-y-0 right-0 outline-none">
									<FontAwesomeIcon className="gray-text" icon={faAngleDown} />
								</ComboboxButton>
							</div>
							<ComboboxOptions className="absolute w-full max-h-[148px] mt-1 overflow-auto rounded bottom-shadow outline-none z-50 full-border black-white-background">
								{uiProjectsList()}
							</ComboboxOptions>
						</div>
					</Combobox>
				</div>
			</div>
		);
	}

	function uiProjectsList() {
		return api.projects.list.map((m, i) => {
			const projectName = getMainProjectName(m.main_project_id);
			const isSelected = m.id == main.project.id;

			const textStyle = isSelected ? "font-medium-10 primary-text" : "font-regular-10 black-text";

			const wrapper = `flex w-full p-2 justify-between items-center select-none cursor-pointer hovered-rows ${
				isSelected && "primary-background-transparent-01"
			}`;

			return (
				<ComboboxOption className={wrapper} key={i} value={{ id: m.id, name: projectName }}>
					<span className={textStyle}>
						{m.id} - {projectName}
					</span>
					{isSelected && <FontAwesomeIcon className="primary-text" icon={faCheck} />}
				</ComboboxOption>
			);
		});
	}

	function uiRows() {
		return main.paymentDetails
			.sort((a, b) => a.rowId - b.rowId)
			.map((m, i) => {
				const showAddButton = i == main.paymentDetails.length - 1 && main.paymentDetails.length != api.paymentTypes.length ? "visible" : "invisible";

				const showDeleteButton = main.paymentDetails.length > 1 ? "visible" : "invisible";

				const addButtonWrapper = `flex w-fit h-[55px] justify-center items-center ${showAddButton}`;

				const deleteButtonWrapper = `flex w-fit h-[55px] justify-center items-center ${showDeleteButton}`;

				return (
					<div className="flex w-full space-x-3 justify-between items-end" key={m.rowId}>
						{uiAmountPaid(m, i)}
						{uiAmountReceived(m, i)}
						{uiPaymentType(m, i)}
						<div className={addButtonWrapper}>
							<FontAwesomeIcon className="cursor-pointer primary-text" icon={faPlusCircle} onClick={() => addPayment()} size="lg" />
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
		<>
			<div className="flex w-full px-5 py-2.5 justify-between items-center bottom-border black-white-background">
				<div className="flex w-full space-x-2.5 justify-start items-center">
					<FontAwesomeIcon className="pr-1 cursor-pointer black-text" icon={faChevronLeft} onClick={() => unmount()} />
					<div className="flex w-full justify-start items-center">
						<span className="view-heading">New Cash Flow</span>
					</div>
				</div>
			</div>
			<div className="flex flex-col w-full h-[calc(100vh-102px)] justify-center items-center overflow-y-auto">
				<div className="flex flex-col w-2/5 h-full space-y-2 justify-start items-center">
					<div className="flex w-full space-x-7 justify-between items-center">
						{uiEntryDate()}
						{uiOfficeExpense()}
					</div>
					<div className="flex w-full space-x-7 justify-between items-center">
						{uiAffiliates()}
						{uiClients()}
					</div>
					<div className="flex w-full space-x-7 justify-between items-center">
						{uiCompanies()}
						{uiProjects()}
					</div>
					<div className="flex flex-col w-full justify-between items-center">{uiRows()}</div>
					<div className="flex w-full space-x-7 justify-center items-start">
						{uiParticulars()}
						{uiPaymentFor()}
					</div>
				</div>
			</div>
			<footer className="w-full dialog-footer">
				<button className={addButtonStyle} onClick={() => addToDatabase()} tabIndex={9}>
					{uiAdd()}
				</button>
			</footer>
		</>
	);
}
