"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import MyConstants from "@/utilities/constants";
import EditProjectPreview from "@/modals/projects/EditProjectPreview";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { Spinner } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ComboBox2, ComboBoxWithChips, DatePicker, TextInput } from "@/components/Inputs";
import { faBriefcase, faCalendar, faChevronLeft, faFile, faIndianRupee, faPhone, faUser, faUserGroup } from "@fortawesome/free-solid-svg-icons";

export default function EditProject({ reloadProjects, selectedProject, unmount }) {
	// Business Logic
	const [editProject, setEditProjectData] = useState({
		client: { id: 0, name: "" },
		company: { id: 0, name: "" },
		contactNumber: 0,
		dueOn: "",
		invoiceFees: 0,
		invoiceFirm: { id: 0, name: "" },
		mainProject: { id: 0, name: "" },
		quote: 0,
		reimbursementVoucher: 0,
		subProject: { id: 0, name: "" },
		teams: [],
	});

	const [hasMounted, setHasMounted] = useState({
		mainComponent: false,
		preview: false,
		teamsMenu: false,
	});

	const [otherData, setOtherData] = useState({
		allAdministratorsCompanies: [],
		allClients: [],
		allMainProjects: { api: [], apiCopy: [] },
		allSubProjects: { api: [], apiCopy: [] },
		companiesByClients: { api: [], apiCopy: [] },
		isLoading: false,
		originalProject: {},
		searched: { affiliate: {}, company: {}, mainProject: {}, subProject: {} },
	});

	const isUserAdministrator = MyGlobal.IsUserAdministrator();

	const showTeamsDropdown = hasMounted.teamsMenu
		? "flex flex-col w-[98%] max-h-[220px] justify-start items-center absolute rounded overflow-y-auto bottom-shadow light-gray-background full-border"
		: "hidden";

	const disableAddButton = otherData.isLoading ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";
	const addButtonStyle = `primary-button-condensed ${disableAddButton}`;

	// Functions
	const addNewCompany = (company) => {
		const copy = [...otherData.companiesByClients.apiCopy];
		const name = MyGlobal.Capitalize(company);

		const revisedCopy = copy.filter((_company) => _company.id != 0);
		revisedCopy.unshift({ id: 0, name });

		setSearch("company", "");

		setEditProjectData((old) => ({ ...old, company: { id: 0, name } }));
		setOtherData((old) => ({ ...old, companiesByClients: { api: revisedCopy, apiCopy: revisedCopy } }));
	};

	const addNewSubProject = (subProject) => {
		const copy = [...otherData.allSubProjects.apiCopy];
		copy.unshift({ id: 0, name: MyGlobal.Capitalize(subProject) });

		setSearch("subProject", "");

		setEditProjectData((s) => ({ ...s, subProject: copy.at(0) }));
		setOtherData((s) => ({ ...s, allSubProjects: { api: copy, apiCopy: copy } }));
	};

	const calculateQuote = () => {
		const totalAmount = MyGlobal.GetNumbers(editProject.invoiceFees) + MyGlobal.GetNumbers(editProject.reimbursementVoucher);

		setEditProjectData((s) => ({ ...s, quote: totalAmount }));
	};

	const doProjectEditing = async () => {
		try {
			setOtherData((s) => ({ ...s, isLoading: true }));

			const body = {
				client: editProject.client,
				company: editProject.company,
				contactNumber: editProject.contactNumber,
				dueOn: editProject.dueOn,
				id: selectedProject.id,
				invoiceFees: MyGlobal.GetNumbers(editProject.invoiceFees),
				invoiceFirmId: editProject.invoiceFirm.id,
				mainProjectId: editProject.mainProject.id,
				quote: MyGlobal.GetNumbers(editProject.quote),
				reimbursementVoucher: MyGlobal.GetNumbers(editProject.reimbursementVoucher),
				subProject: editProject.subProject,
				teams: getTeamsIds(),
				userId: MyGlobal.GetUserId(),
			};

			const response = await axios.post(MyConstants.ApiEndpoints.Projects.EditProject, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reloadProjects();

				MyGlobal.AddActivity(`Projects :: Edited project (${selectedProject.id}).`);
				MyGlobal.ShowSuccessToast(MyConstants.Messages.ProjectEdited);

				unmount();
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Projects => Edit Project");
		} finally {
			setOtherData((s) => ({ ...s, isLoading: false }));
		}
	};

	const getFilteredCompanies = () => {
		const value = String(otherData.searched.company.name);
		let companies = otherData.companiesByClients.apiCopy;

		if (value !== "undefined") {
			companies = otherData.companiesByClients.apiCopy.filter((company) => {
				return String(company.name).toLowerCase().includes(value.toLowerCase());
			});
		}

		return companies;
	};

	const getFilteredMainProjects = () => {
		const value = String(otherData.searched.mainProject.name);
		let mainProjects = otherData.allMainProjects.apiCopy;

		if (value !== "undefined") {
			mainProjects = otherData.allMainProjects.apiCopy.filter((mainProject) => {
				return String(mainProject.name).toLowerCase().includes(value.toLowerCase());
			});
		}

		return mainProjects;
	};

	const getFilteredSubProjects = () => {
		const value = String(otherData.searched.subProject.name);
		let subProjects = otherData.allSubProjects.apiCopy;

		if (value !== "undefined") {
			subProjects = otherData.allSubProjects.apiCopy.filter((subProject) => {
				return String(subProject.name).toLowerCase().includes(value.toLowerCase());
			});
		}

		return subProjects;
	};

	const getSupportData = async () => {
		try {
			const response = await axios.get(MyConstants.ApiEndpoints.Projects.GetSupportData, MyGlobal.GetHeaders());

			if (response.status == 200) {
				const allAdministratorsCompanies = response.data.administratorsCompanies;
				const allClients = response.data.clients;
				const allMainProjects = response.data.mainProjects;
				const allSubProjects = response.data.subProjects;

				const clientName = allClients.filter((client) => client.id == selectedProject.client_id).at(0).name;

				const companyName = response.data.companies.filter((company) => company.id == selectedProject.company_id).at(0).name;

				const inquiry = response.data.inquiries.filter((inquiry) => inquiry.id == selectedProject.inquiry_id).at(0);

				const invoiceFirm = allAdministratorsCompanies.filter((company) => company.id == selectedProject.invoice_firm_id).at(0);

				const mainProjectName = allMainProjects.filter((mainProject) => mainProject.id == selectedProject.main_project_id).at(0).name;

				const subProjectName = allSubProjects.filter((subProject) => subProject.id == selectedProject.sub_project_id).at(0).name;

				const teams = MyGlobal.GetFullDetailsFromIds(selectedProject.teams);

				const revisedProjectData = {
					client: { id: selectedProject.client_id, name: clientName },
					company: { id: selectedProject.company_id, name: companyName },
					contactNumber: inquiry.contact_number,
					dueOn: selectedProject.due_on,
					invoiceFees: Number(selectedProject.invoice_fees),
					invoiceFirm: { id: invoiceFirm.id, name: invoiceFirm.name },
					mainProject: { id: selectedProject.main_project_id, name: mainProjectName },
					quote: Number(selectedProject.quote),
					reimbursementVoucher: Number(selectedProject.reimbursement_voucher),
					subProject: { id: selectedProject.sub_project_id, name: subProjectName },
					teams,
				};

				setEditProjectData(revisedProjectData);

				setOtherData((old) => ({
					...old,
					allAdministratorsCompanies,
					allClients,
					allMainProjects: { api: allMainProjects, apiCopy: allMainProjects },
					allSubProjects: { api: allSubProjects, apiCopy: allSubProjects },
					companiesByClients: { api: response.data.companies, apiCopy: response.data.companies },
					originalProject: revisedProjectData,
				}));

				setHasMounted((old) => ({ ...old, mainComponent: true }));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Edit Project => Get Supporting Data");
		}
	};

	const getTeamsIds = () => {
		return editProject.teams.map((user) => user.id).join(",");
	};

	const setInputs = (key, value) => {
		if (key == "dueOn" || key == "invoiceFees" || key == "reimbursementVoucher" || key == "note") {
			setEditProjectData((s) => ({ ...s, [key]: value }));
		} else {
			setSearch(key, "");
			setEditProjectData((s) => ({ ...s, [key]: { id: value.id, name: value.name } }));
		}
	};

	const setSearch = (key, value) => {
		setOtherData((s) => ({ ...s, searched: { ...s.searched, [key]: { ...s.searched[key], name: value } } }));
	};

	const setTeamsSelection = (user) => {
		let revisedData = [];
		const copy = [...editProject.teams];

		if (copy.includes(user)) {
			revisedData = copy.filter((_user) => _user != user);
		} else {
			copy.push(user);
			revisedData = copy;
		}

		setEditProjectData((s) => ({ ...s, teams: revisedData }));
	};

	const togglePreviewBox = (value) => {
		setHasMounted((s) => ({ ...s, preview: !hasMounted.preview }));

		if (value) {
			doProjectEditing();
		}
	};

	const toggleTeamsMenu = () => {
		setHasMounted((s) => ({ ...s, teamsMenu: !hasMounted.teamsMenu }));
	};

	// UI Components
	const uiClient = () => {
		return (
			<TextInput
				icon={faUser}
				id="newProjectClientName"
				isReadOnly={!isUserAdministrator}
				label="Client"
				onChange={() => {}}
				onKeyPress={() => {}}
				tabIndex={1}
				value={editProject.client.name}
				width="w-full"
			/>
		);
	};

	const uiCompany = () => {
		return (
			<ComboBox2
				allowCreatingNewItem={true}
				comparingValue1="name"
				comparingValue2={editProject.company.name}
				displayValue="name"
				filteredData={getFilteredCompanies}
				hasDataObject={true}
				icon={faBriefcase}
				isReadOnly={false}
				label="Company"
				onChange={(event) => setInputs("company", event)}
				onClick={() => addNewCompany(otherData.searched.company.name)}
				onInputChange={(event) => setSearch("company", event.target.value)}
				onKeyPress={(event) => !MyGlobal.HasAlphabets(event.key) && event.preventDefault()}
				searchedItem={otherData.searched.company.name}
				tabIndex={2}
				value={editProject.company.name}
				width="w-full"
			/>
		);
	};

	const uiContactNumber = () => {
		return (
			<TextInput
				icon={faPhone}
				isReadOnly={true}
				label="Contact Number"
				onChange={() => {}}
				onKeyPress={() => {}}
				tabIndex={3}
				value={editProject.contactNumber}
				width="w-full"
			/>
		);
	};

	const uiDueOn = () => {
		return (
			<DatePicker
				icon={faCalendar}
				label="Due On"
				onChange={(event) => setInputs("dueOn", event)}
				tabIndex={6}
				value={editProject.dueOn}
				width="w-full"
			/>
		);
	};

	const uiInvoiceFees = () => {
		const label = `${editProject.invoiceFirm.name}'s Fees`;

		return (
			<TextInput
				icon={faIndianRupee}
				id="newProjectFees"
				label={label}
				onChange={(event) => setInputs("invoiceFees", event.target.value)}
				onKeyPress={(event) => !MyGlobal.HasNumbers(event.key) && event.preventDefault()}
				tabIndex={7}
				value={editProject.invoiceFees}
				width="w-full"
			/>
		);
	};

	const uiInvoiceFirm = () => {
		return (
			<ComboBox2
				allowCreatingNewItem={false}
				comparingValue1="name"
				comparingValue2={editProject.invoiceFirm.name}
				displayValue="name"
				filteredData={otherData.allAdministratorsCompanies}
				hasDataObject={true}
				icon={faBriefcase}
				isReadOnly={false}
				label="Invoice Firm"
				onChange={(event) => setInputs("invoiceFirm", event)}
				onClick={() => {}}
				onInputChange={() => {}}
				onKeyPress={() => {}}
				searchedItem={{}}
				tabIndex={9}
				value={editProject.invoiceFirm.name}
				width="w-full"
			/>
		);
	};

	const uiMainProjects = () => {
		return (
			<ComboBox2
				allowCreatingNewItem={false}
				comparingValue1="name"
				comparingValue2={editProject.mainProject.name}
				displayValue="name"
				filteredData={getFilteredMainProjects}
				hasDataObject={true}
				icon={faFile}
				isReadOnly={false}
				label="Main Project"
				onChange={(event) => setInputs("mainProject", event)}
				onClick={() => {}}
				onInputChange={(event) => setSearch("mainProject", event.target.value)}
				onKeyPress={(event) => !MyGlobal.HasAlphabets(event.key) && event.preventDefault()}
				searchedItem={otherData.searched.mainProject.name}
				tabIndex={4}
				value={editProject.mainProject.name}
				width="w-full"
			/>
		);
	};

	const uiPreview = () => {
		if (otherData.isLoading) {
			return (
				<span className="px-3.5">
					<Spinner />
				</span>
			);
		} else {
			return "Preview";
		}
	};

	const uiQuote = () => {
		return (
			<TextInput
				icon={faIndianRupee}
				isReadOnly={true}
				label="Quote"
				onChange={() => {}}
				onKeyPress={() => {}}
				tabIndex={9}
				value={MyGlobal.ThousandSeparator(editProject.quote)}
				width="w-full"
			/>
		);
	};

	const uiReimbursementVoucher = () => {
		return (
			<TextInput
				icon={faIndianRupee}
				id="newProjectReimbursementVoucher"
				label="Reimbursement Voucher"
				onChange={(event) => setInputs("reimbursementVoucher", event.target.value)}
				onKeyPress={(event) => !MyGlobal.HasNumbers(event.key) && event.preventDefault()}
				tabIndex={8}
				value={editProject.reimbursementVoucher}
				width="w-full"
			/>
		);
	};

	const uiSubProjects = () => {
		return (
			<ComboBox2
				allowCreatingNewItem={true}
				comparingValue1="name"
				comparingValue2={editProject.subProject.name}
				displayValue="name"
				filteredData={getFilteredSubProjects}
				hasDataObject={true}
				icon={faFile}
				isReadOnly={false}
				label="Sub Project"
				onChange={(event) => setInputs("subProject", event)}
				onClick={() => addNewSubProject(otherData.searched.subProject.name)}
				onInputChange={(event) => setSearch("subProject", event.target.value)}
				onKeyPress={(event) => !MyGlobal.HasAlphabets(event.key) && event.preventDefault()}
				searchedItem={otherData.searched.subProject.name}
				tabIndex={5}
				value={editProject.subProject.name}
				width="w-full"
			/>
		);
	};

	const uiTeams = () => {
		return (
			<ComboBoxWithChips
				displayKey="full_name"
				label="Teams"
				icon={faUserGroup}
				isMenuInverted={true}
				onBlur={() => toggleTeamsMenu()}
				onItemClick={(event) => setTeamsSelection(event)}
				onSelectedItemClick={(event) => setTeamsSelection(event)}
				selectedItems={editProject.teams}
				showList={showTeamsDropdown}
				source={MyGlobal.GetAllUsers()}
				toggleMenu={() => toggleTeamsMenu()}
			/>
		);
	};

	// Hooks
	useEffect(() => {
		getSupportData();
	}, []);

	useEffect(() => {
		if (editProject.invoiceFees || editProject.reimbursementVoucher) {
			calculateQuote();
		}
	}, [editProject.invoiceFees, editProject.reimbursementVoucher]);

	if (!hasMounted.mainComponent) {
		return;
	}

	// Main UI
	return (
		<>
			<div className="flex w-full px-5 py-2.5 justify-between items-center bottom-border light-gray-background">
				<div className="flex w-full space-x-2.5 justify-start items-center">
					<FontAwesomeIcon className="pr-1 cursor-pointer black-text" icon={faChevronLeft} onClick={() => unmount()} />
					<div className="flex w-full justify-start items-center">
						<span className="view-heading">Edit Project</span>
					</div>
				</div>
			</div>
			<div className="flex w-full h-full justify-center items-center black-white-background">
				<div className="flex flex-col w-3/5 h-full space-y-3 justify-start items-center">
					<div className="flex w-full px-3 space-x-6 justify-between items-center">
						{uiClient()}
						{uiCompany()}
						{uiContactNumber()}
					</div>
					<div className="flex w-full px-3 space-x-6 justify-between items-center">
						{uiMainProjects()}
						{uiSubProjects()}
						{uiDueOn()}
					</div>
					<div className="flex w-full px-3 space-x-6 justify-between items-center">
						{uiInvoiceFees()}
						{uiReimbursementVoucher()}
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

			{hasMounted.preview && (
				<EditProjectPreview mount={hasMounted.preview} newProject={editProject} oldProject={otherData.originalProject} unmount={togglePreviewBox} />
			)}
		</>
	);
}
