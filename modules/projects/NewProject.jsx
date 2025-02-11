"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import MyConstants from "@/utilities/constants";
import NewProjectPreview from "@/modals/projects/NewProjectPreview";

import { MyGlobal } from "@/utilities/global";
import { useEffect, useRef, useState } from "react";
import { Spinner, SpinnerBig } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ComboBox2, ComboBoxWithChips, DatePicker, TextArea, TextInput } from "@/components/Inputs";
import { faBriefcase, faCalendar, faChevronLeft, faFile, faIndianRupee, faNoteSticky, faPhone, faUser, faUserGroup } from "@fortawesome/free-solid-svg-icons";

export default function NewProject({ inquiry, reload, unmount }) {
	// Business Logic
	const teamsMenuRef = useRef(null);

	const [api, setApi] = useState({
		clients: [],
		clientsCompanies: { copy: [], data: [] },
		mainProjects: { copy: [], data: [] },
		ownerFirms: [],
		subProjects: { copy: [], data: [] },
	});

	const [main, setMain] = useState({
		company: { id: 0, name: "" },
		dueOn: "",
		invoiceFees: "",
		invoiceFirm: { id: 0, name: "" },
		mainProject: { id: 0, name: "" },
		note: "",
		phoneNumber: "",
		quote: 0,
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
	});

	const showTeamsMenu = mounted.teamsMenu
		? "flex flex-col w-[98%] max-h-[220px] justify-start items-center absolute rounded overflow-y-auto bottom-shadow primary-light-background full-border"
		: "hidden";

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

	async function addProject() {
		setOther((s) => ({ ...s, isLoading: true }));

		const body = {
			...main,
			clientId: inquiry.client_id,
			inquiryId: inquiry.id,
			invoiceFees: MyGlobal.GetNumbers(main.invoiceFees),
			quote: MyGlobal.GetNumbers(main.quote),
			teams: getTeamsIds(),
			userId: MyGlobal.GetUserId(),
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.Projects.AddProject, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reload();

				MyGlobal.AddActivity(`Added <b>${response.data}</b>.`, MyConstants.Modules.Base.Inquiries);
				MyGlobal.ShowSuccessToast(MyConstants.Messages.InquiryConvertedToProject);

				unmount();
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Inquiries => Add Project");
		} finally {
			setOther((s) => ({ ...s, isLoading: false }));
		}
	}

	function calculateQuote() {
		const totalAmount = MyGlobal.GetNumbers(main.invoiceFees);

		let quote = MyGlobal.ThousandSeparator(totalAmount);

		if (!main.invoiceFees) {
			quote = Number(inquiry.quote);
		}

		setMain((s) => ({ ...s, quote }));
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
		if (key == "invoiceFees") {
			setMain((s) => ({ ...s, [key]: value }));
		} else {
			if (value) {
				if (key == "dueOn" || key == "note") {
					setMain((s) => ({ ...s, [key]: value }));
				} else {
					setFind(key, "");
					setMain((s) => ({ ...s, [key]: { id: value.id, name: value.name } }));
				}
			}
		}
	}

	async function setSupportData() {
		try {
			setOther((s) => ({ ...s, isLoading: true }));

			const response = await axios.get(MyConstants.ApiEndpoints.Projects.GetSupportData, MyGlobal.GetHeaders());

			if (response.status == 200) {
				const ownerFirms = response.data.ownerFirms;

				const companiesByClient = response.data.companies.filter((f) => f.client_id == inquiry.client_id);

				setApi({
					clients: response.data.clients,
					clientsCompanies: {
						copy: companiesByClient,
						data: companiesByClient,
					},
					mainProjects: {
						copy: response.data.mainProjects,
						data: response.data.mainProjects,
					},
					ownerFirms,
					subProjects: {
						copy: response.data.subProjects,
						data: response.data.subProjects,
					},
				});

				setMain((s) => ({
					...s,
					dueOn: new Date(inquiry.entry_date),
					invoiceFirm: {
						id: ownerFirms.at(0).id,
						name: ownerFirms.at(0).name,
					},
					mainProject: {
						id: inquiry.main_project_id,
						name: inquiry.main_project,
					},
					phoneNumber: inquiry.phone_number,
					quote: Number(inquiry.quote),
					subProject: {
						id: inquiry.sub_project_id,
						name: inquiry.sub_project,
					},
					teams: inquiry.follow_ups_data,
				}));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "New Project => Get Support Data");
		} finally {
			setOther((s) => ({ ...s, isLoading: false }));
		}
	}

	function setTeamsSelection(user) {
		let revised = [];
		const copy = [...main.teams];

		if (copy.includes(user)) {
			revised = copy.filter((f) => f != user);
		} else {
			copy.push(user);
			revised = copy;
		}

		setMain((s) => ({ ...s, teams: revised }));
	}

	function togglePreviewBox(value) {
		setMounted((s) => ({ ...s, preview: !mounted.preview }));

		if (value) {
			addProject();
		}
	}

	function toggleTeamsMenu() {
		setMounted((s) => ({ ...s, teamsMenu: !mounted.teamsMenu }));
	}

	// UI Components
	function uiClient() {
		return (
			<TextInput
				icon={faUser}
				id="newProjectClientName"
				isReadOnly
				label="Client"
				onChange={() => {}}
				onKeyPress={() => {}}
				tabIndex={1}
				value={inquiry.client_name}
				width="w-full"
			/>
		);
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

	function uiDueOn() {
		return <DatePicker icon={faCalendar} label="Due On" onChange={(e) => setInputs("dueOn", e)} tabIndex={6} value={main.dueOn} width="w-full" />;
	}

	function uiInvoiceFees() {
		return (
			<TextInput
				icon={faIndianRupee}
				id="newProjectFees"
				label={`${main.invoiceFirm.name} Fees`}
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
				filteredData={api.ownerFirms}
				hasDataObject
				icon={faBriefcase}
				isMenuInverted
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

	function uiNotes() {
		return (
			<TextArea
				icon={faNoteSticky}
				key={1}
				label="Notes"
				onChange={(e) => setInputs("note", e.target.value)}
				onKeyDown={() => {}}
				rows={2}
				tabIndex={10}
				value={main.note}
				width="w-full"
			/>
		);
	}

	function uiPhoneNumber() {
		return (
			<TextInput
				icon={faPhone}
				isReadOnly
				label="Phone Number"
				onChange={() => {}}
				onKeyPress={() => {}}
				tabIndex={3}
				value={main.phoneNumber}
				width="w-full"
			/>
		);
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
		let label = "Quote";

		if (inquiry.quote != main.quote) {
			label = `Quote (Original ${inquiry.quote})`;
		}

		return (
			<TextInput
				icon={faIndianRupee}
				isReadOnly
				label={label}
				onChange={() => {}}
				onKeyPress={() => {}}
				tabIndex="8"
				value={MyGlobal.ThousandSeparator(main.quote)}
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
		calculateQuote();
	}, [main.invoiceFees]);

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
	if (other.isLoading) {
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
							<span className="view-heading">New Project</span>
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
							{uiDueOn()}
						</div>
						<div className="flex w-full px-3 space-x-6 justify-between items-center">
							{uiInvoiceFees()}
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

				{mounted.preview && <NewProjectPreview mount={mounted.preview} project={{ ...main, inquiry }} unmount={togglePreviewBox} />}
			</>
		);
	}
}
