"use client";

import axios from "axios";
import NewProjectPreview from "@/modals/projects/NewProjectPreview";

import { MyGlobal } from "@/utilities/global";
import { useEffect, useRef, useState } from "react";
import { Spinner, SpinnerBig } from "@/components/Elements";
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ComboBox2, ComboBoxWithChips, TextArea, TextInput } from "@/components/Inputs";
import { ApiEndpoints, BaseModules, InquiriesWorkFrequency, Messages } from "@/utilities/constants";
import { faAngleDown, faBriefcase, faCheck, faChevronLeft, faFile, faIndianRupee, faNoteSticky, faPhone, faUser, faUserGroup } from "@fortawesome/free-solid-svg-icons";

const arrFinancialYears = [
	{ key: "2024-25", value: "2024-25" },
	{ key: "2025-26", value: "2025-26" },
	{ key: "2026-27", value: "2026-27" },
];

const workFrequencies = Object.values(InquiriesWorkFrequency).map((m) => ({ label: m, value: m }));

export default function NewProject({ inquiry, reload, unmount }) {
	// Business Logic
	const teamsMenuRef = useRef(null);
	const enteredSubProjectRef = useRef("");

	const [api, setApi] = useState({
		clients: [],
		clientsCompanies: { copy: [], data: [] },
		mainProjects: { copy: [], data: [] },
		firms: [],
		subProjects: { copy: [], data: [] },
	});

	const [main, setMain] = useState({
		company: { id: 0, name: "" },
		invoiceFees: inquiry.quote,
		invoiceFirm: { id: 0, name: "" },
		mainProject: { id: 0, name: "" },
		note: "",
		phoneNumber: "",
		quote: 0,
		financialYear: "",
		subProject: { id: 0, name: "" },
		teams: [],
		workFrequency: { id: workFrequencies[0].value, name: workFrequencies[0].label }
	});

	const [mounted, setMounted] = useState({
		preview: false,
		teamsMenu: false,
	});

	const [other, setOther] = useState({
		find: { affiliate: {}, company: {}, mainProject: {}, subProject: {} },
		isLoading: false,
	});
	const [mainProjectSearch, setMainProjectSearch] = useState("");
	const [subProjectSearch, setSubProjectSearch] = useState("");

	const showTeamsMenu = mounted.teamsMenu ? "flex flex-col w-[98%] max-h-[220px] justify-start items-center absolute rounded overflow-y-auto bottom-shadow primary-light-background full-border" : "hidden";

	const disableAddButton = other.isLoading || !main.financialYear.length || !main.invoiceFirm.name.length ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";
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

	function addNewSubProject() {
		const copy = [...api.subProjects.copy];
		copy.unshift({ id: 0, key: enteredSubProjectRef.current?.value, name: enteredSubProjectRef.current?.value, value: enteredSubProjectRef.current?.value });

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
			const response = await axios.post(ApiEndpoints.Projects.AddProject, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reload();

				MyGlobal.AddActivity(`Added <b>${response.data}</b>.`, BaseModules.Inquiries);
				MyGlobal.ShowSuccessToast(Messages.InquiryConvertedToProject);

				unmount();
			} else {
				MyGlobal.ShowErrorToast(Messages.SomeErrorOccurred);
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
				if (key == "remarks" || key == "note") {
					setMain((s) => ({ ...s, [key]: value }));
				} else {
					setFind(key, "");
					setMain((s) => ({ ...s, [key]: { id: value.id, name: value.name } }));
				}
			} else {
				if (key == "remarks" || key == "note") {
					setMain((s) => ({ ...s, [key]: "" }));
				}
			}
		}
	}

	async function setSupportData() {
		try {
			setOther((s) => ({ ...s, isLoading: true }));

			const response = await axios.get(ApiEndpoints.Projects.GetSupportData, MyGlobal.GetHeaders());

			if (response.status == 200) {
				const firms = response.data.firms.map((m) => ({ ...m, key: m.id, value: String(m.id), label: m.name }));

				const companiesByClient = response.data.companies.filter((f) => f.client_id == inquiry.client_id);
				const mainProjects = response.data.mainProjects.map((m) => ({ ...m, key: m.id, value: m.name }));
				const subProjects = response.data.subProjects.filter((f) => f.name).map((m) => ({ ...m, key: m.id, value: m.name }));

				setApi({
					clients: response.data.clients,
					clientsCompanies: {
						copy: companiesByClient,
						data: companiesByClient,
					},
					mainProjects: {
						copy: mainProjects,
						data: mainProjects,
					},
					firms,
					subProjects: {
						copy: subProjects,
						data: subProjects,
					},
				});

				setMain((s) => ({
					...s,
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
		return <TextInput icon={faUser} id="newProjectClientName" isReadOnly label="Client" onChange={() => { }} onKeyPress={() => { }} tabIndex={1} value={inquiry.client_name} width="w-full" />;
	}

	function uiCompany() {
		return <ComboBox2 allowCreatingNewItem comparingValue1="name" comparingValue2={main.company.name} displayValue="name" filteredData={getFilteredCompanies} hasDataObject icon={faBriefcase} isReadOnly={false} label="Company" onChange={(e) => setInputs("company", e)} onClick={() => addNewCompany(other.find.company.name)} onInputChange={(e) => setFind("company", e.target.value)} onKeyPress={() => { }} searchedItem={other.find.company.name} tabIndex={2} value={main.company.name} width="w-full" />;
	}

	function uiInvoiceFees() {
		return <TextInput icon={faIndianRupee} id="newProjectFees" label={`${main.invoiceFirm.name} Fees`} onChange={(e) => setInputs("invoiceFees", e.target.value)} onKeyPress={(e) => !MyGlobal.HasNumbers(e.key) && e.preventDefault()} tabIndex={7} value={main.invoiceFees} width="w-full" />;
	}

	function uiNotes() {
		return <TextArea icon={faNoteSticky} key={1} label="Notes" onChange={(e) => setInputs("note", e.target.value)} onKeyDown={() => { }} rows={2} tabIndex={10} value={main.note} width="w-full" />;
	}

	function uiPhoneNumber() {
		return <TextInput icon={faPhone} isReadOnly label="Phone Number" onChange={() => { }} onKeyPress={() => { }} tabIndex={3} value={main.phoneNumber} width="w-full" />;
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

		return <TextInput icon={faIndianRupee} isReadOnly label={label} onChange={() => { }} onKeyPress={() => { }} tabIndex="8" value={MyGlobal.ThousandSeparator(main.quote)} width="w-full" />;
	}

	function uiSubProjects() {
		return <ComboBox2 allowCreatingNewItem comparingValue1="name" comparingValue2={main.subProject.name} displayValue="name" filteredData={getFilteredSubProjects} hasDataObject icon={faFile} isReadOnly={false} label="Sub Project" onChange={(e) => setInputs("subProject", e)} onClick={() => addNewSubProject(other.find.subProject.name)} onInputChange={(e) => setFind("subProject", e.target.value)} onKeyPress={() => { }} searchedItem={other.find.subProject.name} tabIndex={5} value={main.subProject.name} width="w-full" />;
	}

	function uiTeams() {
		return (
			<div className="w-full" ref={teamsMenuRef}>
				<ComboBoxWithChips displayKey="full_name" label="Teams" icon={faUserGroup} isMenuInverted onBlur={() => toggleTeamsMenu()} onItemClick={(e) => setTeamsSelection(e)} onSelectedItemClick={(e) => setTeamsSelection(e)} selectedItems={main.teams} showList={showTeamsMenu} source={MyGlobal.GetAllUsers()} toggleMenu={() => toggleTeamsMenu()} />
			</div>
		);
	}

	// Hooks
	useEffect(() => {
		setSupportData();
	}, []);

	useEffect(() => {
		console.log(main);
	}, [main]);

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
							<div className="flex flex-col w-full p-2 space-y-1 justify-center items-center">
								<span className="flex w-full justify-start items-center font-regular-10 light-slate-gray-text">Main Projects</span>
								<Combobox
									value={api.mainProjects.copy.find((project) => project.value === main.mainProject.name) ?? null}
									onChange={(project) => {
										if (!project) return;
										setMain((s) => ({ ...s, mainProject: { id: project.id, name: project.value } }));
										setMainProjectSearch("");
									}}
								>
									<div className="relative w-full">
										<ComboboxInput autoComplete="off" className="flex w-full h-9 px-3 pr-9 justify-start items-center rounded primary-background-transparent-01 primary-bottom-border-transparent-05 outline-none font-regular-11 black-text" displayValue={(project) => project?.value ?? ""} onChange={(event) => setMainProjectSearch(event.target.value)} placeholder="Main Projects" />
										<ComboboxButton className="flex absolute inset-y-0 right-0 pr-3 items-center outline-none">
											<FontAwesomeIcon className="gray-text" icon={faAngleDown} />
										</ComboboxButton>
										<ComboboxOptions className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded bottom-shadow outline-none full-border primary-light-background">
											{api.mainProjects.copy.filter((project) => project.value.toLowerCase().includes(mainProjectSearch.toLowerCase())).map((project) => (
												<ComboboxOption className={({ active }) => `flex w-full p-2 justify-between items-center select-none cursor-pointer border-y border-gray-300 hovered-rows ${active ? "primary-background-transparent-01" : ""}`} key={project.id} value={project}>
													<span className="font-regular-10 black-text">{project.value}</span>
													{main.mainProject.id === project.id && <FontAwesomeIcon className="primary-text" icon={faCheck} />}
												</ComboboxOption>
											))}
										</ComboboxOptions>
									</div>
								</Combobox>
							</div>
							<div className="flex flex-col w-full p-2 space-y-1 justify-center items-center">
								<span className="flex w-full justify-start items-center font-regular-10 light-slate-gray-text">Sub Projects</span>
								<Combobox
									value={api.subProjects.copy.find((project) => project.value === main.subProject.name) ?? null}
									onChange={(project) => {
										if (!project) return;
										setMain((s) => ({ ...s, subProject: { id: project.id, name: project.value } }));
										setSubProjectSearch("");
									}}
								>
									<div className="relative w-full">
										<ComboboxInput autoComplete="off" className="flex w-full h-9 px-3 pr-9 justify-start items-center rounded primary-background-transparent-01 primary-bottom-border-transparent-05 outline-none font-regular-11 black-text" displayValue={(project) => project?.value ?? ""} onChange={(event) => setSubProjectSearch(event.target.value)} placeholder="Sub Projects" ref={enteredSubProjectRef} />
										<ComboboxButton className="flex absolute inset-y-0 right-0 pr-3 items-center outline-none">
											<FontAwesomeIcon className="gray-text" icon={faAngleDown} />
										</ComboboxButton>
										<ComboboxOptions className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded bottom-shadow outline-none full-border primary-light-background">
											{api.subProjects.copy.filter((project) => project.value.toLowerCase().includes(subProjectSearch.toLowerCase())).map((project) => (
												<ComboboxOption className={({ active }) => `flex w-full p-2 justify-between items-center select-none cursor-pointer border-y border-gray-300 hovered-rows ${active ? "primary-background-transparent-01" : ""}`} key={project.id} value={project}>
													<span className="font-regular-10 black-text">{project.value}</span>
													{main.subProject.id === project.id && <FontAwesomeIcon className="primary-text" icon={faCheck} />}
												</ComboboxOption>
											))}
											{!api.subProjects.copy.some((project) => project.value.toLowerCase().includes(subProjectSearch.toLowerCase())) && subProjectSearch && (
												<button className="flex w-full p-2 justify-start items-center cursor-pointer font-regular-10 black-text" onClick={addNewSubProject} type="button">
													Not found. Add this now
												</button>
											)}
										</ComboboxOptions>
									</div>
								</Combobox>
							</div>
							<div className="flex flex-col w-full p-2 space-y-1 justify-center items-center">
								<span className="flex w-full justify-start items-center font-regular-10 light-slate-gray-text">Financial Year</span>
								<Listbox value={main.financialYear} onChange={(financialYear) => setMain((s) => ({ ...s, financialYear }))}>
									<div className="relative w-full">
										<ListboxButton className="flex w-full h-9 px-3 justify-between items-center rounded primary-background-transparent-01 primary-bottom-border-transparent-05 outline-none font-regular-11 black-text">
											<span>{main.financialYear}</span>
											<FontAwesomeIcon className="gray-text" icon={faAngleDown} />
										</ListboxButton>
										<ListboxOptions className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded bottom-shadow outline-none full-border primary-light-background">
											{arrFinancialYears.map((financialYear) => (
												<ListboxOption className={({ active }) => `flex w-full p-2 justify-between items-center select-none cursor-pointer border-y border-gray-300 hovered-rows ${active ? "primary-background-transparent-01" : ""}`} key={financialYear.key} value={financialYear.value}>
													<span className="font-regular-10 black-text">{financialYear.value}</span>
													{main.financialYear === financialYear.value && <FontAwesomeIcon className="primary-text" icon={faCheck} />}
												</ListboxOption>
											))}
										</ListboxOptions>
									</div>
								</Listbox>
							</div>
						</div>
						<div className="flex w-full px-3 space-x-6 justify-between items-center">
							{uiInvoiceFees()}
							{uiQuote()}
						</div>
						<div className="flex w-full px-3 space-x-6 justify-between items-center">{uiTeams()}</div>
						<div className="flex w-full px-3 space-x-6 justify-between items-center">
							<div className="flex flex-col w-[90%] p-2 space-y-1 justify-center items-center">
								<span className="flex w-full justify-start items-center font-regular-10 light-slate-gray-text">Invoice Firm</span>
								<Listbox value={api.firms.find((firm) => firm.value === main.invoiceFirm.id) ?? null} onChange={(firm) => firm && setMain((s) => ({ ...s, invoiceFirm: { id: firm.value, name: firm.label } }))}>
									<div className="relative w-full">
										<ListboxButton className="flex w-full h-9 px-3 justify-between items-center rounded primary-background-transparent-01 primary-bottom-border-transparent-05 outline-none font-regular-11 black-text">
											<span>{main.invoiceFirm.name}</span>
											<FontAwesomeIcon className="gray-text" icon={faAngleDown} />
										</ListboxButton>
										<ListboxOptions className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded bottom-shadow outline-none full-border primary-light-background">
											{api.firms.map((firm) => (
												<ListboxOption className={({ active }) => `flex w-full p-2 justify-between items-center select-none cursor-pointer border-y border-gray-300 hovered-rows ${active ? "primary-background-transparent-01" : ""}`} key={firm.value} value={firm}>
													<span className="font-regular-10 black-text">{firm.label}</span>
													{main.invoiceFirm.id === firm.value && <FontAwesomeIcon className="primary-text" icon={faCheck} />}
												</ListboxOption>
											))}
										</ListboxOptions>
									</div>
								</Listbox>
							</div>
							<div className="flex flex-col w-[90%] p-2 space-y-1 justify-center items-center">
								<span className="flex w-full justify-start items-center font-regular-10 light-slate-gray-text">Work Frequency</span>
								<Listbox value={workFrequencies.find((frequency) => frequency.value === main.workFrequency.id) ?? null} onChange={(frequency) => frequency && setMain((s) => ({ ...s, workFrequency: { id: frequency.value, name: frequency.label } }))}>
									<div className="relative w-full">
										<ListboxButton className="flex w-full h-9 px-3 justify-between items-center rounded primary-background-transparent-01 primary-bottom-border-transparent-05 outline-none font-regular-11 black-text">
											<span>{main.workFrequency.name}</span>
											<FontAwesomeIcon className="gray-text" icon={faAngleDown} />
										</ListboxButton>
										<ListboxOptions className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded bottom-shadow outline-none full-border primary-light-background">
											{workFrequencies.map((frequency) => (
												<ListboxOption className={({ active }) => `flex w-full p-2 justify-between items-center select-none cursor-pointer border-y border-gray-300 hovered-rows ${active ? "primary-background-transparent-01" : ""}`} key={frequency.value} value={frequency}>
													<span className="font-regular-10 black-text">{frequency.label}</span>
													{main.workFrequency.id === frequency.value && <FontAwesomeIcon className="primary-text" icon={faCheck} />}
												</ListboxOption>
											))}
										</ListboxOptions>
									</div>
								</Listbox>
							</div>
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
