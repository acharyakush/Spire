"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import MyConstants from "@/utilities/constants";
import NewInquiryPreview from "@/modals/inquiries/NewInquiryPreview";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { Spinner } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ComboBox, ComboBox2, ComboBoxWithChips, DatePicker, EmailAddress, TextArea, TextInput } from "@/components/Inputs";
import {
	faCalendar,
	faChevronLeft,
	faCircleExclamation,
	faFile,
	faIndianRupee,
	faNoteSticky,
	faPhone,
	faUser,
	faUserGroup,
} from "@fortawesome/free-solid-svg-icons";

export default function NewInquiry({ reloadInquiries, unmount }) {
	// Business Logic

	const [newInquiry, setNewInquiry] = useState({
		client: { id: "", name: "" },
		contactNumber: "",
		entryDate: new Date(),
		emailAddress: "",
		followUps: [],
		mainProject: { id: "", name: "" },
		note: "",
		quote: 2500,
		reference: { id: "", name: "" },
		status: MyConstants.Statuses.Inquiries.Open,
		subProject: { id: "", name: "" },
	});

	const [otherData, setOtherData] = useState({
		allClients: { api: [], apiCopy: [] },
		allMainProjects: { api: [], apiCopy: [] },
		allReferences: { api: [], apiCopy: [] },
		allSubProjects: { api: [], apiCopy: [] },
		hasMounted: false,
		isFollowUpsMenuOpen: false,
		isLoading: false,
		isPreviewBoxOpen: false,
		searched: { client: {}, mainProject: {}, reference: {}, status: "", subProject: {} },
	});

	const showFollowUpsMenu = otherData.isFollowUpsMenuOpen
		? "flex flex-col w-[98%] max-h-[220px] justify-start items-center absolute rounded overflow-y-auto bottom-shadow light-gray-background full-border"
		: "hidden";

	const disableAddButton = otherData.isLoading ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";
	const addButtonStyle = `primary-button-condensed ${disableAddButton}`;

	// Functions
	const addInquiry = async () => {
		setOtherData((s) => ({ ...s, isLoading: true }));

		try {
			const body = {
				...newInquiry,
				followUps: getFollowUpsIds(),
				mainProjectId: newInquiry.mainProject.id,
				note: MyGlobal.EscapeString(newInquiry.note),
				quote: MyGlobal.GetNumbers(newInquiry.quote),
				userId: MyGlobal.GetUserId(),
			};

			const response = await axios.post(MyConstants.ApiEndpoints.Inquiries.AddInquiry, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reloadInquiries();

				MyGlobal.AddActivity(`Added new inquiry ${response.data}.`);
				MyGlobal.ShowSuccessToast(MyConstants.Messages.InquiryAdded);

				unmount();
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "New Inquiry");
		} finally {
			setOtherData((s) => ({ ...s, isLoading: false }));
		}
	};

	const addNewClient = (client) => {
		const copy = [...otherData.allClients.apiCopy];
		const name = MyGlobal.Capitalize(client);

		const revisedCopy = copy.filter((client) => client.id != 0);
		revisedCopy.unshift({ id: 0, name });

		setSearch("client", "");

		setNewInquiry((s) => ({ ...s, client: { id: 0, name } }));
		setOtherData((s) => ({ ...s, allClients: { api: revisedCopy, apiCopy: revisedCopy } }));
	};

	const addNewReference = (reference) => {
		const copy = [...otherData.allReferences.apiCopy];
		const name = MyGlobal.Capitalize(reference);

		const revisedCopy = copy.filter((reference) => reference.id != 0);
		revisedCopy.unshift({ id: 0, name });

		setSearch("reference", "");

		setNewInquiry((s) => ({ ...s, reference: { id: 0, name } }));
		setOtherData((s) => ({ ...s, allReferences: { api: revisedCopy, apiCopy: revisedCopy } }));
	};

	const addNewSubProject = (subProject) => {
		const copy = [...otherData.allSubProjects.apiCopy];
		copy.unshift({ id: 0, name: MyGlobal.Capitalize(subProject) });

		setSearch("subProject", "");

		setNewInquiry((s) => ({ ...s, subProject: copy.at(0) }));
		setOtherData((s) => ({ ...s, allSubProjects: { api: copy, apiCopy: copy } }));
	};

	const getFilteredClients = () => {
		const value = String(otherData.searched.client.name);
		let clients = otherData.allClients.apiCopy;

		if (value !== "undefined") {
			clients = otherData.allClients.apiCopy.filter((client) => {
				return String(client.name).toLowerCase().includes(value.toLowerCase());
			});
		}

		return clients;
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

	const getFilteredReferences = () => {
		const value = String(otherData.searched.reference.name);
		let references = otherData.allReferences.apiCopy;

		if (value !== "undefined") {
			references = otherData.allReferences.apiCopy.filter((reference) => {
				return String(reference.name).toLowerCase().includes(value.toLowerCase());
			});
		}

		return references;
	};

	const getFilteredStatuses = () => {
		const value = String(otherData.searched.status);
		let statuses = MyConstants.Statuses.Inquiries;

		if (value !== "undefined") {
			statuses = Object.values(MyConstants.Statuses.Inquiries).filter((status) => {
				return String(status).toLowerCase().includes(value.toLowerCase());
			});
		}

		return statuses;
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

	const getFollowUpsIds = () => {
		return newInquiry.followUps.map((user) => user.id).join(",");
	};

	const getSupportData = async () => {
		try {
			const response = await axios.get(MyConstants.ApiEndpoints.Inquiries.GetSupportData, MyGlobal.GetHeaders());

			if (response.status == 200) {
				setOtherData((old) => ({
					...old,
					allClients: { api: response.data.clients, apiCopy: response.data.clients },
					allMainProjects: { api: response.data.mainProjects, apiCopy: response.data.mainProjects },
					allReferences: { api: response.data.references, apiCopy: response.data.references },
					allSubProjects: { api: response.data.subProjects, apiCopy: response.data.subProjects },
					hasMounted: true,
				}));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "New Inquiry => Get Supporting Data");
		}
	};

	const getSelectedClientData = () => {
		return otherData.allClients.api.filter((client) => client.id == newInquiry.client.id).at(0);
	};

	const getSelectedReferenceData = () => {
		return otherData.allReferences.apiCopy.filter((reference) => reference.id == newInquiry.reference.id).at(0);
	};

	const setFollowUps = (selectedUser) => {
		let revisedData = [];
		const copy = [...newInquiry.followUps];

		if (copy.includes(selectedUser)) {
			revisedData = copy.filter((user) => user.id != selectedUser.id);
		} else {
			copy.push(selectedUser);
			revisedData = copy;
		}

		setNewInquiry((s) => ({ ...s, followUps: revisedData }));
	};

	const setInputs = (key, value) => {
		if (key == "client") {
			const client = otherData.allClients.apiCopy.filter((client) => client.id == value.id).at(0);
			const isExistingClient = client.id !== 0;

			const emailAddress = isExistingClient ? client.email_address : "";
			const contactNumber = isExistingClient ? client.contact_number : "";

			const referenceId = isExistingClient ? client.reference_id : "";
			const referenceName = isExistingClient ? otherData.allReferences.apiCopy.filter((reference) => reference.id == referenceId).at(0)?.name : "";

			if (isExistingClient) {
				setSearch("client", "");
			}

			setNewInquiry((s) => ({
				...s,
				client: { id: value.id, name: value.name },
				contactNumber,
				emailAddress,
				reference: { id: referenceId, name: referenceName },
			}));
		} else if (key == "reference") {
			setSearch("reference", "");
			setNewInquiry((s) => ({ ...s, reference: { id: value.id, name: value.name } }));
		} else if (key == "mainProject" || key == "subProject") {
			setSearch(key, "");
			setNewInquiry((s) => ({ ...s, [key]: { ...s[key], id: value.id, name: value.name } }));
		} else {
			setNewInquiry((s) => ({ ...s, [key]: value }));
		}
	};

	const setSearch = (key, value) => {
		setOtherData((s) => ({ ...s, searched: { ...s.searched, [key]: { ...s.searched[key], name: value } } }));
	};

	const toggleFollowUpsMenu = () => {
		setOtherData((s) => ({ ...s, isFollowUpsMenuOpen: !otherData.isFollowUpsMenuOpen }));
	};

	const togglePreviewBox = (value) => {
		if (value) {
			addInquiry();
		}

		setOtherData((s) => ({ ...s, isPreviewBoxOpen: !otherData.isPreviewBoxOpen }));
	};

	// UI Components
	const uiClient = () => {
		return (
			<ComboBox2
				allowCreatingNewItem={true}
				comparingValue1="name"
				comparingValue2={newInquiry.client.name}
				displayValue="name"
				filteredData={getFilteredClients}
				hasDataObject={true}
				icon={faUser}
				isReadOnly={false}
				label="Client"
				onChange={(event) => setInputs("client", event)}
				onClick={() => addNewClient(otherData.searched.client.name)}
				onInputChange={(event) => setSearch("client", event.target.value)}
				onKeyPress={(event) => !MyGlobal.HasAlphabets(event.key) && event.preventDefault()}
				searchedItem={otherData.searched.client.name}
				tabIndex={1}
				value={getSelectedClientData()?.name}
				width="w-full"
			/>
		);
	};

	const uiContactNumber = () => {
		return (
			<TextInput
				icon={faPhone}
				label="Contact Number"
				maxLength={10}
				onChange={(event) => setInputs("contactNumber", event.target.value)}
				onKeyPress={(event) => !MyGlobal.HasNumbers(event.key) && event.preventDefault()}
				tabIndex={2}
				value={newInquiry.contactNumber}
				width="w-full"
			/>
		);
	};

	const uiEmailAddress = () => {
		return (
			<EmailAddress
				onChange={(event) => setInputs("emailAddress", event.target.value)}
				suffix=""
				tabIndex={3}
				value={newInquiry.emailAddress}
				width="w-full"
			/>
		);
	};

	const uiFollowUps = () => {
		return (
			<ComboBoxWithChips
				displayKey="full_name"
				label="Follow Ups"
				icon={faUserGroup}
				isMenuInverted={true}
				onBlur={() => toggleFollowUpsMenu()}
				onItemClick={(event) => setFollowUps(event)}
				onSelectedItemClick={(event) => setFollowUps(event)}
				selectedItems={newInquiry.followUps}
				showList={showFollowUpsMenu}
				source={MyGlobal.GetAllUsers()}
				toggleMenu={() => toggleFollowUpsMenu()}
			/>
		);
	};

	const uiDate = () => {
		return (
			<DatePicker
				icon={faCalendar}
				label="Date"
				onChange={(event) => setInputs("entryDate", event)}
				tabIndex={7}
				value={newInquiry.entryDate}
				width="w-full"
			/>
		);
	};

	const uiMainProjects = () => {
		return (
			<ComboBox2
				allowCreatingNewItem={false}
				comparingValue1="name"
				comparingValue2={newInquiry.mainProject.name}
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
				value={newInquiry.mainProject.name}
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
				value={newInquiry.note}
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
				label="Quote"
				onChange={(event) => setInputs("quote", event.target.value)}
				onKeyPress={() => {}}
				tabIndex={8}
				value={MyGlobal.ThousandSeparator(newInquiry.quote)}
				width="w-full"
			/>
		);
	};

	const uiReferences = () => {
		return (
			<ComboBox2
				allowCreatingNewItem={true}
				comparingValue1="name"
				comparingValue2={newInquiry.reference.name}
				displayValue="name"
				filteredData={getFilteredReferences}
				hasDataObject={true}
				icon={faUser}
				isReadOnly={false}
				label="Reference"
				onChange={(event) => setInputs("reference", event)}
				onClick={() => addNewReference(otherData.searched.reference.name)}
				onInputChange={(event) => setSearch("reference", event.target.value)}
				onKeyPress={(event) => !MyGlobal.HasAlphabets(event.key) && event.preventDefault()}
				searchedItem={otherData.searched.reference.name}
				tabIndex={6}
				value={getSelectedReferenceData()?.name}
				width="w-full"
			/>
		);
	};

	const uiStatus = () => {
		return (
			<ComboBox
				allowCreatingNewItem={false}
				comparisonValue={newInquiry.status}
				filteredData={getFilteredStatuses}
				icon={faCircleExclamation}
				label="Status"
				onChange={(event) => setInputs("status", event)}
				onClick={() => {}}
				onKeyPress={(event) => !MyGlobal.HasAlphabets(event.key) && event.preventDefault()}
				searchedItem={otherData.searched.status}
				tabIndex={9}
				value={newInquiry.status}
				width="w-full"
			/>
		);
	};

	const uiSubProjects = () => {
		return (
			<ComboBox2
				allowCreatingNewItem={true}
				comparingValue1="name"
				comparingValue2={newInquiry.subProject.name}
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
				value={newInquiry.subProject.name}
				width="w-full"
			/>
		);
	};

	// Hooks
	useEffect(() => {
		getSupportData();
	}, []);

	if (!otherData.hasMounted) {
		return;
	}

	return (
		<>
			<div className="flex w-full px-5 py-2.5 justify-between items-center bottom-border light-gray-background">
				<div className="flex w-full space-x-2.5 justify-start items-center">
					<FontAwesomeIcon className="pr-1 cursor-pointer black-text" icon={faChevronLeft} onClick={() => unmount()} />
					<div className="flex w-full justify-start items-center">
						<span className="view-heading">New Inquiry</span>
					</div>
				</div>
			</div>
			<div className="flex w-full h-full justify-center items-center black-white-background">
				<div className="flex flex-col w-3/5 h-full space-y-3 justify-start items-center">
					<div className="flex w-full px-3 space-x-6 justify-between items-center">
						{uiClient()}
						{uiContactNumber()}
						{uiEmailAddress()}
					</div>
					<div className="flex w-full px-3 space-x-6 justify-between items-center">
						{uiMainProjects()}
						{uiSubProjects()}
						{uiReferences()}
					</div>
					<div className="flex w-full px-3 space-x-6 justify-between items-center">
						{uiDate()}
						{uiQuote()}
						{uiStatus()}
					</div>
					<div className="flex w-full px-3 space-x-6 justify-between items-center">{uiFollowUps()}</div>
					<div className="flex w-full px-3 space-x-6 justify-between items-center">{uiNotes()}</div>
				</div>
			</div>
			<footer className="w-full dialog-footer">
				<button className={addButtonStyle} onClick={() => togglePreviewBox("")}>
					{uiPreview()}
				</button>
			</footer>

			{otherData.isPreviewBoxOpen && <NewInquiryPreview mount={otherData.isPreviewBoxOpen} selectedInquiry={newInquiry} unmount={togglePreviewBox} />}
		</>
	);
}
