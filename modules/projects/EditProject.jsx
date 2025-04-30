"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import MyConstants from "@/utilities/constants";
import EditProjectPreview from "@/modals/projects/EditProjectPreview";

import { MyGlobal } from "@/utilities/global";
import { useEffect, useRef, useState } from "react";
import { Spinner, SpinnerBig } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ComboBox2, ComboBoxWithChips, TextInput } from "@/components/Inputs";
import { faBriefcase, faChevronLeft, faExclamationCircle, faFile, faIndianRupee, faPhone, faUser, faUserGroup } from "@fortawesome/free-solid-svg-icons";

export default function EditProject({ project, reload, unmount }) {
	// Business Logic
	const teamsMenuRef = useRef(null);

	const [api, setApi] = useState({
		clients: [],
		clientsCompanies: { copy: [], data: [] },
		mainProjects: { copy: [], data: [] },
		firms: [],
		subProjects: { copy: [], data: [] },
	});

	const [main, setMain] = useState({
		client: { id: 0, name: "" },
		company: { id: 0, name: "" },
		generatedInvoice: {},
		generatedInvoiceTransaction: {},
		invoiceFees: 0,
		invoiceFirm: { id: 0, name: "" },
		isInvoiceGenerated: false,
		isInvoiceTransactionDone: false,
		mainProject: { id: 0, name: "" },
		phoneNumber: 0,
		quote: 0,
		reimburseVoucher: 0,
		remarks: "",
		subProject: { id: 0, name: "" },
		teams: [],
	});

	const [mounted, setMounted] = useState({
		preview: false,
		teamsMenu: false,
	});

	const [other, setOther] = useState({
		find: { affiliate: {}, company: {}, mainProject: {}, subProject: {} },
		isLoading: false,
		originalProject: {},
		supportData: false,
	});

	const showTeamsMenu = mounted.teamsMenu ? "flex flex-col w-[98%] max-h-[220px] justify-start items-center absolute rounded overflow-y-auto bottom-shadow primary-light-background full-border" : "hidden";

	const disableAddButton = other.isLoading ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";
	const addButtonStyle = `primary-button-condensed ${disableAddButton}`;

	// Functions
	function addNewCompany(company) {
		const copy = [...api.clientsCompanies.copy];
		const name = company;

		const revised = copy.filter((f) => f.id != 0);
		revised.unshift({ id: 0, name });

		setFind("company", "");

		setMain((s) => ({ ...s, company: { id: 0, name } }));
		setApi((s) => ({ ...s, clientsCompanies: { copy: revised, data: revised } }));
	}

	function addNewSubProject(subProject) {
		const copy = [...api.subProjects.copy];
		copy.unshift({ id: 0, name: subProject });

		setFind("subProject", "");

		setMain((s) => ({ ...s, subProject: copy.at(0) }));
		setApi((s) => ({ ...s, subProjects: { copy, data: copy } }));
	}

	function calculateQuote() {
		const totalAmount = MyGlobal.GetNumbers(main.invoiceFees) + MyGlobal.GetNumbers(main.reimburseVoucher);

		setMain((s) => ({ ...s, quote: totalAmount }));
	}

	function detectEscapeKey(event) {
		if (event.key === "Escape") {
			setMounted((s) => ({ ...s, teamsMenu: false }));
		}
	}

	function detectOutsideClick(event) {
		if (teamsMenuRef.current && !teamsMenuRef.current.contains(event.target)) {
			setMounted((s) => ({ ...s, teamsMenu: false }));
		}
	}

	async function doProjectEditing() {
		try {
			setOther((s) => ({ ...s, isLoading: true }));

			const body = {
				client: main.client,
				company: main.company,
				remarks: main.remarks,
				generatedInvoice: main.generatedInvoice,
				id: project.id,
				invoiceFees: MyGlobal.GetNumbers(main.invoiceFees),
				invoiceFirmId: main.invoiceFirm.id,
				isInvoiceGenerated: main.isInvoiceGenerated,
				isInvoiceTransactionDone: main.isInvoiceGenerated,
				mainProjectId: main.mainProject.id,
				phoneNumber: main.phoneNumber,
				quote: MyGlobal.GetNumbers(main.invoiceFees),
				reimburseVoucher: MyGlobal.GetNumbers(main.reimburseVoucher),
				subProject: main.subProject,
				teams: getTeamsIds(),
				userId: MyGlobal.GetUserId(),
			};

			const response = await axios.post(MyConstants.ApiEndpoints.Projects.EditProject, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reload();

				MyGlobal.AddActivity(`Edited <b>${project.id}</b>.`, MyConstants.Modules.Base.Projects);

				if (main.isInvoiceGenerated) {
					MyGlobal.AddActivity(`Edited already generated invoices amount of <b>${project.id}</b> from <b>${main.generatedInvoice?.amount}</b> to <b>${main.invoiceFees}</b>.`, MyConstants.Modules.Base.Projects);
				}

				if (main.isInvoiceTransactionDone) {
					MyGlobal.AddActivity(`Edited invoices transactions amount of <b>${project.id}</b> from <b>${main.generatedInvoiceTransaction?.amount}</b> to <b>${main.invoiceFees}</b>.`, MyConstants.Modules.Base.Projects);
				}

				MyGlobal.ShowSuccessToast(MyConstants.Messages.ProjectEdited);

				unmount();
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Projects => Edit Project");
		} finally {
			setOther((s) => ({ ...s, isLoading: false }));
		}
	}

	function getFilteredCompanies() {
		let list = !api.clientsCompanies.copy.length ? [] : api.clientsCompanies.copy;

		if (list.length) {
			const value = String(other.find.company.name);

			if (value !== "undefined") {
				list = api.clientsCompanies.copy.filter((f) => {
					return String(f.name).toLowerCase().includes(value.toLowerCase());
				});
			}
		}

		return list;
	}

	function getFilteredMainProjects() {
		let list = !api.mainProjects.copy.length ? [] : api.mainProjects.copy;

		if (list.length) {
			const value = String(other.find.mainProject.name);

			if (value !== "undefined") {
				list = api.mainProjects.copy.filter((f) => {
					return String(f.name).toLowerCase().includes(value.toLowerCase());
				});
			}
		}

		return list;
	}

	function getFilteredSubProjects() {
		let list = !api.subProjects.copy.length ? [] : api.subProjects.copy;

		if (list.length) {
			const value = String(other.find.subProject.name);

			if (value !== "undefined") {
				list = api.subProjects.copy.filter((f) => {
					return String(f.name).toLowerCase().includes(value.toLowerCase());
				});
			}
		}

		return list;
	}

	async function setSupportData() {
		try {
			setOther((s) => ({ ...s, supportData: true }));

			const response = await axios.get(MyConstants.ApiEndpoints.Projects.GetSupportData, MyGlobal.GetHeaders());

			if (response.status == 200) {
				const firms = response.data.firms;

				const inquiry = response.data.inquiries.find((f) => f.id == project.inquiry_id);
				const invoiceFirm = firms.find((f) => f.id == project.firm_id);
				const isInvoiceGenerated = response.data.invoices.find((f) => f.project_id == project.id);
				const isInvoiceTransactionDone = response.data.invoicesTransactions.find((f) => f.project_id == project.id);

				const object = {
					client: {
						id: project.client_id,
						name: project.client_name,
					},
					company: {
						id: project.company_id,
						name: project.company_name,
					},
					phoneNumber: inquiry.phone_number,
					remarks: project.remarks,
					generatedInvoice: isInvoiceGenerated,
					generatedInvoiceTransaction: isInvoiceTransactionDone,
					invoiceFees: Number(project.invoice_fees),
					invoiceFirm: {
						id: invoiceFirm.id,
						name: invoiceFirm.name,
					},
					isInvoiceGenerated: typeof isInvoiceGenerated === "object",
					isInvoiceTransactionDone: typeof isInvoiceTransactionDone === "object",
					mainProject: {
						id: project.main_project_id,
						name: project.main_project_name,
					},
					quote: Number(project.quote),
					subProject: {
						id: project.sub_project_id,
						name: project.sub_project_name,
					},
					teams: project.teams_data,
				};

				const clientsCompanies = response.data.companies.filter((f) => f.client_id === project.client_id);

				setApi({
					clients: response.data.clients,
					clientsCompanies: {
						copy: clientsCompanies,
						data: clientsCompanies,
					},
					mainProjects: {
						copy: response.data.mainProjects,
						data: response.data.mainProjects,
					},
					firms,
					subProjects: {
						copy: response.data.subProjects,
						data: response.data.subProjects,
					},
				});

				setMain(object);
				setOther((s) => ({ ...s, originalProject: object }));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Edit Project => Set Support Data");
		} finally {
			setOther((s) => ({ ...s, supportData: false }));
		}
	}

	function getTeamsIds() {
		let ids = "";

		if (main.teams.length) {
			ids = main.teams.map((m) => m.id).join(",");
		}

		return ids;
	}

	function setFind(key, value) {
		setOther((s) => ({ ...s, find: { ...s.find, [key]: { ...s.find[key], name: value } } }));
	}

	function setInputs(key, value) {
		if (value) {
			if (key == "remarks" || key == "invoiceFees" || key == "reimburseVoucher" || key == "note") {
				setMain((s) => ({ ...s, [key]: value }));
			} else {
				setFind(key, "");
				setMain((s) => ({ ...s, [key]: { id: value.id, name: value.name } }));
			}
		} else {
			if (key == "remarks" || key == "invoiceFees" || key == "reimburseVoucher" || key == "note") {
				setMain((s) => ({ ...s, [key]: "" }));
			}
		}
	}

	function setTeamsSelection(user) {
		let revisedData = [];
		const copy = [...main.teams];

		if (copy.includes(user)) {
			revisedData = copy.filter((f) => f != user);
		} else {
			copy.push(user);
			revisedData = copy;
		}

		setMain((s) => ({ ...s, teams: revisedData }));
	}

	function togglePreviewBox(value) {
		setMounted((s) => ({ ...s, preview: !s.preview }));

		if (value) {
			doProjectEditing();
		}
	}

	function toggleTeamsMenu() {
		setMounted((s) => ({ ...s, teamsMenu: !s.teamsMenu }));
	}

	// UI Components
	function uiClient() {
		return <TextInput icon={faUser} id="editProjectClientName" isReadOnly label="Client" onChange={() => {}} onKeyPress={() => {}} tabIndex={1} value={main.client.name} width="w-full" />;
	}

	function uiCompany() {
		return (
			<ComboBox2
				allowCreatingNewItem
				comparingValue1="name"
				comparingValue2={main.company.name}
				displayValue="name"
				filteredData={getFilteredCompanies}
				hasDataObject
				icon={faBriefcase}
				isReadOnly={false}
				label="Company"
				onChange={(e) => setInputs("company", e)}
				onClick={() => addNewCompany(other.find.company.name)}
				onInputChange={(e) => setFind("company", e.target.value)}
				onKeyPress={() => {}}
				searchedItem={other.find.company.name}
				tabIndex={2}
				value={main.company.name}
				width="w-full"
			/>
		);
	}

	function uiRemarks() {
		return <TextInput icon={faExclamationCircle} label="Remarks" onChange={(e) => setInputs("remarks", e.target.value)} tabIndex={6} value={main.remarks} width="w-full" />;
	}

	function uiInvoiceFees() {
		return (
			<TextInput
				icon={faIndianRupee}
				id="newProjectFees"
				label={`${main.invoiceFirm.name}'s Fees`}
				onChange={(e) => setInputs("invoiceFees", e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasNumbers(e.key) && e.preventDefault()}
				tabIndex={7}
				value={main.invoiceFees}
				width="w-full"
			/>
		);
	}

	function uiInvoiceFirm() {
		return (
			<ComboBox2
				allowCreatingNewItem={false}
				comparingValue1="name"
				comparingValue2={main.invoiceFirm.name}
				displayValue="name"
				filteredData={api.firms}
				hasDataObject
				icon={faBriefcase}
				isReadOnly={false}
				label="Invoice Firm"
				onChange={(e) => setInputs("invoiceFirm", e)}
				onClick={() => {}}
				onInputChange={() => {}}
				onKeyPress={() => {}}
				searchedItem={{}}
				tabIndex={9}
				value={main.invoiceFirm.name}
				width="w-full"
			/>
		);
	}

	function uiMainProjects() {
		return (
			<ComboBox2
				allowCreatingNewItem={false}
				comparingValue1="name"
				comparingValue2={main.mainProject.name}
				displayValue="name"
				filteredData={getFilteredMainProjects}
				hasDataObject
				icon={faFile}
				isReadOnly={false}
				label="Main Project"
				onChange={(e) => setInputs("mainProject", e)}
				onClick={() => {}}
				onInputChange={(e) => setFind("mainProject", e.target.value)}
				onKeyPress={() => {}}
				searchedItem={other.find.mainProject.name}
				tabIndex={4}
				value={main.mainProject.name}
				width="w-full"
			/>
		);
	}

	function uiPhoneNumber() {
		return <TextInput icon={faPhone} isReadOnly label="Phone Number" onChange={() => {}} onKeyPress={() => {}} tabIndex={3} value={main.phoneNumber} width="w-full" />;
	}

	function uiPreview() {
		if (other.isLoading) {
			return (
				<span className="px-3.5">
					<Spinner />
				</span>
			);
		} else {
			return "Preview";
		}
	}

	function uiQuote() {
		return <TextInput icon={faIndianRupee} isReadOnly label={`Quote (Original ${project.quote})`} onChange={() => {}} onKeyPress={() => {}} tabIndex={9} value={MyGlobal.ThousandSeparator(main.quote)} width="w-full" />;
	}

	function uiReimburseVoucher() {
		return (
			<TextInput
				icon={faIndianRupee}
				id="newProjectReimburseVoucher"
				label="Reimbursement Voucher"
				onChange={(e) => setInputs("reimburseVoucher", e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasNumbers(e.key) && e.preventDefault()}
				tabIndex={8}
				value={main.reimburseVoucher}
				width="w-full"
			/>
		);
	}

	function uiSubProjects() {
		return (
			<ComboBox2
				allowCreatingNewItem
				comparingValue1="name"
				comparingValue2={main.subProject.name}
				displayValue="name"
				filteredData={getFilteredSubProjects}
				hasDataObject
				icon={faFile}
				isReadOnly={false}
				label="Sub Project"
				onChange={(e) => setInputs("subProject", e)}
				onClick={() => addNewSubProject(other.find.subProject.name)}
				onInputChange={(e) => setFind("subProject", e.target.value)}
				onKeyPress={() => {}}
				searchedItem={other.find.subProject.name}
				tabIndex={5}
				value={main.subProject.name}
				width="w-full"
			/>
		);
	}

	function uiTeams() {
		return (
			<div className="w-full" ref={teamsMenuRef}>
				<ComboBoxWithChips
					displayKey="full_name"
					label="Teams"
					icon={faUserGroup}
					isMenuInverted
					onBlur={() => toggleTeamsMenu()}
					onItemClick={(e) => setTeamsSelection(e)}
					onSelectedItemClick={(e) => setTeamsSelection(e)}
					selectedItems={main.teams}
					showList={showTeamsMenu}
					source={MyGlobal.GetAllUsers()}
					toggleMenu={() => toggleTeamsMenu()}
				/>
			</div>
		);
	}

	// Hooks
	useEffect(() => {
		setSupportData();
	}, []);

	useEffect(() => {
		if (main.invoiceFees || main.reimburseVoucher) {
			calculateQuote();
		}
	}, [main.invoiceFees, main.reimburseVoucher]);

	useEffect(() => {
		if (mounted.teamsMenu) {
			document.addEventListener("mousedown", detectOutsideClick);
			document.addEventListener("keydown", detectEscapeKey);
		}

		return () => {
			document.removeEventListener("mousedown", detectOutsideClick);
			document.removeEventListener("keydown", detectEscapeKey);
		};
	}, [mounted.teamsMenu]);

	// Main UI
	if (other.supportData) {
		return (
			<div className="flex w-full h-full justify-center items-center font-regular-12 gray-text contrast-background full-border">
				<SpinnerBig />
			</div>
		);
	} else {
		return (
			<>
				<div className="flex w-full px-5 py-2.5 justify-between items-center bottom-border primary-light-background">
					<div className="flex w-full space-x-2.5 justify-start items-center">
						<FontAwesomeIcon className="pr-1 cursor-pointer black-text" icon={faChevronLeft} onClick={() => unmount()} />
						<div className="flex w-full justify-start items-center">
							<span className="view-heading">Edit Project</span>
						</div>
					</div>
				</div>
				<div className="flex w-full h-full justify-center items-center contrast-background">
					<div className="flex flex-col w-3/5 h-full space-y-3 justify-start items-center">
						<div className="flex w-full px-3 space-x-6 justify-between items-center">
							{uiClient()}
							{uiCompany()}
							{uiPhoneNumber()}
						</div>
						<div className="flex w-full px-3 space-x-6 justify-between items-center">
							{uiMainProjects()}
							{uiSubProjects()}
							{uiRemarks()}
						</div>
						<div className="flex w-full px-3 space-x-6 justify-between items-center">
							{uiInvoiceFees()}
							{uiReimburseVoucher()}
							{uiQuote()}
						</div>
						<div className="flex w-full px-3 space-x-6 justify-between items-center">{uiTeams()}</div>
						<div className="flex w-full px-3 space-x-6 justify-between items-start">{uiInvoiceFirm()}</div>
					</div>
				</div>
				<footer className="w-full dialog-footer">
					<button className={addButtonStyle} onClick={() => togglePreviewBox(false)}>
						{uiPreview()}
					</button>
				</footer>

				{mounted.preview && <EditProjectPreview mount={mounted.preview} newProject={main} oldProject={other.originalProject} unmount={togglePreviewBox} />}
			</>
		);
	}
}
