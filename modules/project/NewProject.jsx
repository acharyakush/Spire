"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import MyConstants from "@/utilities/constants";
import NewProjectPreview from "@/modals/projects/NewProjectPreview";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { Spinner } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ComboBox2, ComboBoxWithChips, DatePicker, TextArea, TextInput } from "@/components/Inputs";
import { faBriefcase, faCalendar, faChevronLeft, faFile, faIndianRupee, faNoteSticky, faPhone, faUser, faUserGroup } from "@fortawesome/free-solid-svg-icons";

export default function NewProject({ reloadInquiries, selectedInquiry, unmount }) {
	// Business Logic
	const [apiData, setApiData] = useState({
		allAdministratorsCompanies: [],
		allClients: [],
		allMainProjects: { api: [], apiCopy: [] },
		allSubProjects: { api: [], apiCopy: [] },
		companiesByClients: { api: [], apiCopy: [] },
	});

	const [hasMounted, setHasMounted] = useState({
		mainComponent: false,
		preview: false,
		teamsMenu: false,
	});

	const [mainData, setMainData] = useState({
		company: { id: 0, name: "" },
		contactNumber: "",
		dueOn: "",
		invoiceFees: "",
		invoiceFirm: { id: 0, name: "" },
		mainProject: { id: 0, name: "" },
		note: "",
		quote: 0,
		reimbursementVoucher: "",
		subProject: { id: 0, name: "" },
		teams: [],
	});

	const [otherData, setOtherData] = useState({
		isLoading: false,
		searched: { affiliate: {}, company: {}, mainProject: {}, subProject: {} },
	});

	const selectedInquiryClient = apiData.allClients.length && apiData.allClients.filter((client) => client.id == selectedInquiry?.client_id).at(0);

	const showTeamsDropdown = hasMounted.teamsMenu
		? "flex flex-col w-[98%] max-h-[220px] justify-start items-center absolute rounded overflow-y-auto bottom-shadow light-gray-background full-border"
		: "hidden";

	const disableAddButton = otherData.isLoading ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";
	const addButtonStyle = `primary-button-condensed ${disableAddButton}`;

	// Functions
	const addNewCompany = (company) => {
		const copy = [...apiData.companiesByClients.apiCopy];
		const name = MyGlobal.Capitalize(company);

		const revisedCopy = copy.filter((_company) => _company.id != 0);
		revisedCopy.unshift({ id: 0, name });

		setSearch("company", "");

		setMainData((old) => ({ ...old, company: { id: 0, name } }));
		setApiData((old) => ({ ...old, companiesByClients: { api: revisedCopy, apiCopy: revisedCopy } }));
	};

	const addNewSubProject = (subProject) => {
		const copy = [...apiData.allSubProjects.apiCopy];
		copy.unshift({ id: 0, name: MyGlobal.Capitalize(subProject) });

		setSearch("subProject", "");

		setMainData((s) => ({ ...s, subProject: copy.at(0) }));
		setApiData((s) => ({ ...s, allSubProjects: { api: copy, apiCopy: copy } }));
	};

	const addProject = async () => {
		setOtherData((s) => ({ ...s, isLoading: true }));

		const body = {
			...mainData,
			clientId: selectedInquiry.client_id,
			inquiryId: selectedInquiry.id,
			invoiceFees: MyGlobal.GetNumbers(mainData.invoiceFees),
			quote: MyGlobal.GetNumbers(mainData.quote),
			reimbursementVoucher: MyGlobal.GetNumbers(mainData.reimbursementVoucher),
			teams: getTeamsIds(),
			userId: MyGlobal.GetUserId(),
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.Projects.AddProject, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reloadInquiries();

				MyGlobal.AddActivity(`Inquiries :: Added new project (${response.data}).`);
				MyGlobal.ShowSuccessToast(MyConstants.Messages.InquiryConvertedToProject);

				unmount();
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Inquiries => Add Project");
		} finally {
			setOtherData((s) => ({ ...s, isLoading: false }));
		}
	};

	const calculateQuote = () => {
		const totalAmount = MyGlobal.GetNumbers(mainData.invoiceFees) + MyGlobal.GetNumbers(mainData.reimbursementVoucher);
		const quote = MyGlobal.ThousandSeparator(totalAmount);

		setMainData((s) => ({ ...s, quote }));
	};

	const getFilteredCompanies = () => {
		const value = String(otherData.searched.company.name);
		let companies = apiData.companiesByClients.apiCopy;

		if (value !== "undefined") {
			companies = apiData.companiesByClients.apiCopy.filter((company) => {
				return String(company.name).toLowerCase().includes(value.toLowerCase());
			});
		}

		return companies;
	};

	const getFilteredMainProjects = () => {
		const value = String(otherData.searched.mainProject.name);
		let mainProjects = apiData.allMainProjects.apiCopy;

		if (value !== "undefined") {
			mainProjects = apiData.allMainProjects.apiCopy.filter((mainProject) => {
				return String(mainProject.name).toLowerCase().includes(value.toLowerCase());
			});
		}

		return mainProjects;
	};

	const getFilteredSubProjects = () => {
		const value = String(otherData.searched.subProject.name);
		let subProjects = apiData.allSubProjects.apiCopy;

		if (value !== "undefined") {
			subProjects = apiData.allSubProjects.apiCopy.filter((subProject) => {
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
				const allMainProjects = response.data.mainProjects;
				const allSubProjects = response.data.subProjects;

				const companiesByClient = response.data.companies.filter((company) => company.client_id == selectedInquiry.client_id);

				const mainProjectName = allMainProjects.filter((mainProject) => mainProject.id == selectedInquiry.main_project_id).at(0).name;

				const subProjectName = allSubProjects.filter((subProject) => subProject.id == selectedInquiry.sub_project_id).at(0).name;

				setApiData({
					allAdministratorsCompanies,
					allClients: response.data.clients,
					allMainProjects: { api: allMainProjects, apiCopy: allMainProjects },
					allSubProjects: { api: allSubProjects, apiCopy: allSubProjects },
					companiesByClients: { api: companiesByClient, apiCopy: companiesByClient },
				});

				setMainData((old) => ({
					...old,
					contactNumber: selectedInquiry.contact_number,
					dueOn: selectedInquiry.entry_date,
					invoiceFirm: {
						id: allAdministratorsCompanies.at(0).id,
						name: allAdministratorsCompanies.at(0).name,
					},
					mainProject: { id: selectedInquiry.main_project_id, name: mainProjectName },
					quote: Number(selectedInquiry.quote),
					subProject: { id: selectedInquiry.sub_project_id, name: subProjectName },
				}));

				setHasMounted((old) => ({ ...old, mainComponent: true }));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "New Project => Get Supporting Data");
		}
	};

	const getTeamsIds = () => {
		return mainData.teams.map((user) => user.id).join(",");
	};

	const setInputs = (key, value) => {
		if (key == "dueOn" || key == "invoiceFees" || key == "reimbursementVoucher" || key == "note") {
			setMainData((s) => ({ ...s, [key]: value }));
		} else {
			setSearch(key, "");
			setMainData((s) => ({ ...s, [key]: { id: value.id, name: value.name } }));
		}
	};

	const setSearch = (key, value) => {
		setOtherData((s) => ({ ...s, searched: { ...s.searched, [key]: { ...s.searched[key], name: value } } }));
	};

	const setTeamsSelection = (user) => {
		let revisedData = [];
		const copy = [...mainData.teams];

		if (copy.includes(user)) {
			revisedData = copy.filter((_user) => _user != user);
		} else {
			copy.push(user);
			revisedData = copy;
		}

		setMainData((s) => ({ ...s, teams: revisedData }));
	};

	const togglePreviewBox = (value) => {
		setHasMounted((s) => ({ ...s, preview: !hasMounted.preview }));

		if (value) {
			addProject();
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
				isReadOnly={true}
				label="Client"
				onChange={() => {}}
				onKeyPress={() => {}}
				tabIndex={1}
				value={selectedInquiryClient?.name}
				width="w-full"
			/>
		);
	};

	const uiCompany = () => {
		return (
			<ComboBox2
				allowCreatingNewItem={true}
				comparingValue1="name"
				comparingValue2={mainData.company.name}
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
				value={mainData.company.name}
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
				value={mainData.contactNumber}
				width="w-full"
			/>
		);
	};

	const uiDueOn = () => {
		return (
			<DatePicker icon={faCalendar} label="Due On" onChange={(event) => setInputs("dueOn", event)} tabIndex={6} value={mainData.dueOn} width="w-full" />
		);
	};

	const uiInvoiceFees = () => {
		const label = `${mainData.invoiceFirm.name} Fees`;

		return (
			<TextInput
				icon={faIndianRupee}
				id="newProjectFees"
				label={label}
				onChange={(event) => setInputs("invoiceFees", event.target.value)}
				onKeyPress={(event) => !MyGlobal.HasNumbers(event.key) && event.preventDefault()}
				tabIndex={7}
				value={mainData.invoiceFees}
				width="w-full"
			/>
		);
	};

	const uiInvoiceFirm = () => {
		return (
			<ComboBox2
				allowCreatingNewItem={false}
				comparingValue1="name"
				comparingValue2={mainData.invoiceFirm.name}
				displayValue="name"
				filteredData={apiData.allAdministratorsCompanies}
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
				value={mainData.invoiceFirm.name}
				width="w-full"
			/>
		);
	};

	const uiMainProjects = () => {
		return (
			<ComboBox2
				allowCreatingNewItem={false}
				comparingValue1="name"
				comparingValue2={mainData.mainProject.name}
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
				value={mainData.mainProject.name}
				width="w-full"
			/>
		);
	};

	const uiNotes = () => {
		return (
			<TextArea
				icon={faNoteSticky}
				key={1}
				label="Notes"
				onChange={(event) => setInputs("note", event.target.value)}
				onKeyDown={() => {}}
				rows={2}
				tabIndex={10}
				value={mainData.note}
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
				value={MyGlobal.ThousandSeparator(mainData.quote)}
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
				value={mainData.reimbursementVoucher}
				width="w-full"
			/>
		);
	};

	const uiSubProjects = () => {
		return (
			<ComboBox2
				allowCreatingNewItem={true}
				comparingValue1="name"
				comparingValue2={mainData.subProject.name}
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
				value={mainData.subProject.name}
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
				selectedItems={mainData.teams}
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
		if (mainData.invoiceFees || mainData.reimbursementVoucher) {
			calculateQuote();
		}
	}, [mainData.invoiceFees, mainData.reimbursementVoucher]);

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
						<span className="view-heading">New Project</span>
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
					<div className="flex w-full px-3 space-x-6 justify-between items-start">
						{uiInvoiceFirm()}
						{uiNotes()}
					</div>
				</div>
			</div>
			<footer className="w-full dialog-footer">
				<button className={addButtonStyle} onClick={() => togglePreviewBox(false)}>
					{uiPreview()}
				</button>
			</footer>

			{hasMounted.preview && (
				<NewProjectPreview
					mount={hasMounted.preview}
					projectData={{ ...mainData, clientName: selectedInquiryClient.name }}
					unmount={togglePreviewBox}
				/>
			)}
		</>
	);
}
