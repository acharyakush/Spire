"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import MyConstants from "@/utilities/constants";
import EditInquiryPreview from "./EditInquiryPreview";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { Spinner } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ComboBox2, ComboBoxWithChips, DatePicker, EmailAddress, TextInput } from "@/components/Inputs";
import { faCalendar, faChevronLeft, faFile, faIndianRupee, faPhone, faUser, faUserGroup } from "@fortawesome/free-solid-svg-icons";

export default function EditInquiry({ reloadInquiries, selectedInquiry, unmount }) {
	// Business Logic
	const [oldInquiry, setOldInquiry] = useState({
		client: { id: 0, name: "" },
		contactNumber: "",
		entryDate: new Date(),
		emailAddress: "",
		followUps: [],
		mainProject: { id: 0, name: "" },
		quote: 2500,
		reference: { id: 0, name: "" },
		subProject: { id: 0, name: "" },
	});

	const [editInquiry, setEditInquiry] = useState({
		client: { id: 0, name: "" },
		contactNumber: "",
		entryDate: new Date(),
		emailAddress: "",
		followUps: [],
		mainProject: { id: 0, name: "" },
		quote: 0,
		reference: { id: 0, name: "" },
		subProject: { id: 0, name: "" },
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

	const isUserAdministrator = MyGlobal.IsUserAdministrator();

	const showFollowUpsMenu = otherData.isFollowUpsMenuOpen
		? "flex flex-col w-[98%] max-h-[220px] justify-start items-center absolute rounded overflow-y-auto bottom-shadow light-gray-background full-border"
		: "hidden";

	const disableEditButton = otherData.isLoading ? "pointer-events-none" : "pointer-events-auto";
	const editButtonStyle = `primary-button-condensed ${disableEditButton}`;

	// Functions
	const addNewClient = (client) => {
		const copy = [...otherData.allClients.apiCopy];
		const name = MyGlobal.Capitalize(client);

		const revisedCopy = copy.filter((client) => client.id != 0);
		revisedCopy.unshift({ id: 0, name });

		handleSearch("client", "");

		setEditInquiry((s) => ({ ...s, client: { id: 0, name } }));
		setOtherData((s) => ({ ...s, allClients: { api: revisedCopy, apiCopy: revisedCopy } }));
	};

	const addNewReference = (reference) => {
		const copy = [...otherData.allReferences.apiCopy];
		const name = MyGlobal.Capitalize(reference);

		const revisedCopy = copy.filter((reference) => reference.id != 0);
		revisedCopy.unshift({ id: 0, name });

		handleSearch("reference", "");

		setEditInquiry((s) => ({ ...s, reference: { id: 0, name } }));
		setOtherData((s) => ({ ...s, allReferences: { api: revisedCopy, apiCopy: revisedCopy } }));
	};

	const addNewSubProject = (subProject) => {
		const copy = [...otherData.allSubProjects.apiCopy];
		copy.unshift({ id: 0, name: MyGlobal.Capitalize(subProject) });

		handleSearch("subProject", "");

		setEditInquiry((s) => ({ ...s, subProject: copy.at(0) }));
		setOtherData((s) => ({ ...s, allSubProjects: { api: copy, apiCopy: copy } }));
	};

	const doInquiryEdit = async () => {
		try {
			setOtherData((s) => ({ ...s, isLoading: true }));

			const body = {
				...editInquiry,
				entryDate: dayjs(editInquiry.entryDate).format("YYYY-MM-DD hh:mm:ss"),
				followUps: getFollowUpsIds(),
				mainProjectId: editInquiry.mainProject.id,
				id: selectedInquiry.id,
				source: MyConstants.Modules.Base.Inquiries,
				type: "edit-inquiry",
				userId: MyGlobal.GetUserId(),
			};

			const response = await axios.post(MyConstants.ApiEndpoints.Inquiries.EditInquiry, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reloadInquiries();

				MyGlobal.AddActivity(`Inquiries :: Edited inquiry (${selectedInquiry.id}).`);
				MyGlobal.ShowSuccessToast(MyConstants.Messages.InquiryEdited);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}

			unmount();
		} catch (error) {
			MyGlobal.HandleErrors(error, "Edit Inquiry");
		} finally {
			setOtherData((s) => ({ ...s, isLoading: false }));
		}
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
		return editInquiry.followUps.map((user) => user.id).join(",");
	};

	const getSupportingData = async () => {
		try {
			const response = await axios.get(MyConstants.ApiEndpoints.Inquiries.GetNewInquirySupportData, MyGlobal.GetHeaders());

			if (response.status == 200) {
				const allClients = response.data.clients;
				const allMainProjects = response.data.mainProjects;
				const allReferences = response.data.references;
				const allSubProjects = response.data.subProjects;

				const clientName = allClients.filter((client) => client.id == selectedInquiry.client_id).at(0).name;
				const followUps = MyGlobal.GetFullDetailsFromIds(selectedInquiry.follow_ups);

				const mainProjectName = allMainProjects.filter((mainProject) => mainProject.id == selectedInquiry.main_project_id).at(0).name;

				const referenceName = allReferences.filter((reference) => reference.id == selectedInquiry.reference_id).at(0).name;

				const subProjectName = allSubProjects.filter((subProject) => subProject.id == selectedInquiry.sub_project_id).at(0).name;

				setEditInquiry({
					client: { id: selectedInquiry.client_id, name: clientName },
					contactNumber: selectedInquiry.contact_number,
					entryDate: new Date(selectedInquiry.entry_date),
					emailAddress: selectedInquiry.email_address,
					followUps,
					mainProject: { id: selectedInquiry.main_project_id, name: mainProjectName },
					quote: selectedInquiry.quote,
					reference: { id: selectedInquiry.reference_id, name: referenceName },
					subProject: { id: selectedInquiry.sub_project_id, name: subProjectName },
				});

				setOldInquiry({
					client: { id: selectedInquiry.client_id, name: clientName },
					contactNumber: selectedInquiry.contact_number,
					entryDate: new Date(selectedInquiry.entry_date),
					emailAddress: selectedInquiry.email_address,
					followUps,
					mainProject: { id: selectedInquiry.main_project_id, name: mainProjectName },
					quote: selectedInquiry.quote,
					reference: { id: selectedInquiry.reference_id, name: referenceName },
					subProject: { id: selectedInquiry.sub_project_id, name: subProjectName },
				});

				setOtherData((old) => ({
					...old,
					allClients: { api: allClients, apiCopy: allClients },
					allMainProjects: { api: allMainProjects, apiCopy: allMainProjects },
					allReferences: { api: allReferences, apiCopy: allReferences },
					allSubProjects: { api: allSubProjects, apiCopy: allSubProjects },
					hasMounted: true,
				}));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Edit Inquiry => Get Supporting Data");
		}
	};

	const getSelectedClientData = () => {
		return otherData.allClients.api.filter((client) => client.id == editInquiry.client.id).at(0);
	};

	const getSelectedReferenceData = () => {
		return otherData.allReferences.apiCopy.filter((reference) => reference.id == editInquiry.reference.id).at(0);
	};

	const handleFollowUps = (selectedUser) => {
		let revisedData = [];
		const copy = [...editInquiry.followUps];

		if (copy.includes(selectedUser)) {
			revisedData = copy.filter((user) => user.id != selectedUser.id);
		} else {
			copy.push(selectedUser);
			revisedData = copy;
		}

		setEditInquiry((s) => ({ ...s, followUps: revisedData }));
	};

	const handleInputs = (key, value) => {
		if (key == "client") {
			const client = otherData.allClients.apiCopy.filter((client) => client.id == value.id).at(0);
			const isExistingClient = client.id !== 0;

			const emailAddress = isExistingClient ? client.email_address : "";
			const contactNumber = isExistingClient ? client.contact_number : "";

			const referenceId = isExistingClient ? client.reference_id : "";
			const referenceName = isExistingClient ? otherData.allReferences.apiCopy.filter((reference) => reference.id == referenceId).at(0)?.name : "";

			if (isExistingClient) {
				handleSearch("client", "");
			}

			setEditInquiry((s) => ({
				...s,
				client: { id: value.id, name: value.name },
				contactNumber,
				emailAddress,
				reference: { id: referenceId, name: referenceName },
			}));
		} else if (key == "reference") {
			handleSearch("reference", "");
			setEditInquiry((s) => ({ ...s, reference: { id: value.id, name: value.name } }));
		} else if (key == "mainProject" || key == "subProject") {
			handleSearch(key, "");
			setEditInquiry((s) => ({ ...s, [key]: { ...s[key], id: value.id, name: value.name } }));
		} else {
			setEditInquiry((s) => ({ ...s, [key]: value }));
		}
	};

	const handleSearch = (key, value) => {
		setOtherData((s) => ({ ...s, searched: { ...s.searched, [key]: { ...s.searched[key], name: value } } }));
	};

	const toggleFollowUpsMenu = () => {
		setOtherData((s) => ({ ...s, isFollowUpsMenuOpen: !otherData.isFollowUpsMenuOpen }));
	};

	const togglePreviewBox = (value) => {
		if (value) {
			doInquiryEdit();
		}

		setOtherData((s) => ({ ...s, isPreviewBoxOpen: !otherData.isPreviewBoxOpen }));
	};

	// UI Components
	const uiClient = () => {
		return (
			<ComboBox2
				allowCreatingNewItem={true}
				comparingValue1="name"
				comparingValue2={editInquiry.client.name}
				displayValue="name"
				filteredData={getFilteredClients}
				hasDataObject={true}
				icon={faUser}
				isReadOnly={!isUserAdministrator}
				label="Client"
				onChange={(event) => handleInputs("client", event)}
				onClick={() => addNewClient(otherData.searched.client.name)}
				onInputChange={(event) => handleSearch("client", event.target.value)}
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
				isReadOnly={!isUserAdministrator}
				label="Contact Number"
				maxLength={10}
				onChange={(event) => handleInputs("contactNumber", event.target.value)}
				onKeyPress={(event) => !MyGlobal.HasNumbers(event.key) && event.preventDefault()}
				tabIndex={2}
				value={editInquiry.contactNumber}
				width="w-full"
			/>
		);
	};

	const uiEmailAddress = () => {
		return (
			<EmailAddress
				isReadOnly={!isUserAdministrator}
				onChange={(event) => handleInputs("emailAddress", event.target.value)}
				suffix=""
				tabIndex={3}
				value={editInquiry.emailAddress}
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
				onItemClick={(event) => handleFollowUps(event)}
				onSelectedItemClick={(event) => handleFollowUps(event)}
				selectedItems={editInquiry.followUps}
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
				onChange={(event) => handleInputs("entryDate", event)}
				tabIndex={7}
				value={editInquiry.entryDate}
				width="w-full"
			/>
		);
	};

	const uiMainProjects = () => {
		return (
			<ComboBox2
				allowCreatingNewItem={false}
				comparingValue1="name"
				comparingValue2={editInquiry.mainProject.name}
				displayValue="name"
				filteredData={getFilteredMainProjects}
				hasDataObject={true}
				icon={faFile}
				isReadOnly={false}
				label="Main Project"
				onChange={(event) => handleInputs("mainProject", event)}
				onClick={() => {}}
				onInputChange={(event) => handleSearch("mainProject", event.target.value)}
				onKeyPress={(event) => !MyGlobal.HasAlphabets(event.key) && event.preventDefault()}
				searchedItem={otherData.searched.mainProject.name}
				tabIndex={4}
				value={editInquiry.mainProject.name}
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
				onChange={(event) => handleInputs("quote", event.target.value)}
				onKeyPress={() => {}}
				tabIndex={8}
				value={editInquiry.quote}
				width="w-full"
			/>
		);
	};

	const uiReferences = () => {
		return (
			<ComboBox2
				allowCreatingNewItem={true}
				comparingValue1="name"
				comparingValue2={editInquiry.reference.name}
				displayValue="name"
				filteredData={getFilteredReferences}
				hasDataObject={true}
				icon={faUser}
				isReadOnly={!isUserAdministrator}
				label="Reference"
				onChange={(event) => handleInputs("reference", event)}
				onClick={() => addNewReference(otherData.searched.reference.name)}
				onInputChange={(event) => handleSearch("reference", event.target.value)}
				onKeyPress={(event) => !MyGlobal.HasAlphabets(event.key) && event.preventDefault()}
				searchedItem={otherData.searched.reference.name}
				tabIndex={6}
				value={getSelectedReferenceData()?.name}
				width="w-full"
			/>
		);
	};

	const uiSubProjects = () => {
		return (
			<ComboBox2
				allowCreatingNewItem={true}
				comparingValue1="name"
				comparingValue2={editInquiry.subProject.name}
				displayValue="name"
				filteredData={getFilteredSubProjects}
				hasDataObject={true}
				icon={faFile}
				isReadOnly={false}
				label="Sub Project"
				onChange={(event) => handleInputs("subProject", event)}
				onClick={() => addNewSubProject(otherData.searched.subProject.name)}
				onInputChange={(event) => handleSearch("subProject", event.target.value)}
				onKeyPress={(event) => !MyGlobal.HasAlphabets(event.key) && event.preventDefault()}
				searchedItem={otherData.searched.subProject.name}
				tabIndex={5}
				value={editInquiry.subProject.name}
				width="w-full"
			/>
		);
	};

	// Hooks
	useEffect(() => {
		getSupportingData();
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
						<span className="view-heading">Edit Inquiry</span>
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
					</div>
					<div className="flex w-full px-3 space-x-6 justify-between items-center">{uiFollowUps()}</div>
				</div>
			</div>
			<footer className="w-full dialog-footer">
				<button className={editButtonStyle} onClick={() => togglePreviewBox("")}>
					{uiPreview()}
				</button>
			</footer>

			{otherData.isPreviewBoxOpen && (
				<EditInquiryPreview editInquiry={editInquiry} mount={otherData.isPreviewBoxOpen} oldInquiry={oldInquiry} unmount={togglePreviewBox} />
			)}
		</>
	);
}
