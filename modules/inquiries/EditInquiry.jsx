"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import MyConstants from "@/utilities/constants";
import EditInquiryPreview from "@/modals/inquiries/EditInquiryPreview";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { Spinner } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ComboBox2, ComboBoxWithChips, DatePicker, EmailAddress, TextInput } from "@/components/Inputs";
import { faCalendar, faChevronLeft, faFile, faIndianRupee, faPhone, faUser, faUserGroup } from "@fortawesome/free-solid-svg-icons";

export default function EditInquiry({ reloadInquiries, selectedInquiry, unmount }) {
	// Business Logic
	const [apiData, setApiData] = useState({
		allClients: { api: [], apiCopy: [] },
		allMainProjects: { api: [], apiCopy: [] },
		allReferences: { api: [], apiCopy: [] },
		allSubProjects: { api: [], apiCopy: [] },
	});

	const [mainData, setMainData] = useState({
		client: { id: 0, name: "" },
		phoneNumber: "",
		entryDate: new Date(),
		emailAddress: "",
		followUps: [],
		mainProject: { id: 0, name: "" },
		quote: 0,
		reference: { id: 0, name: "" },
		subProject: { id: 0, name: "" },
	});

	const [oldInquiry, setOldInquiry] = useState({
		client: { id: 0, name: "" },
		phoneNumber: "",
		entryDate: new Date(),
		emailAddress: "",
		followUps: [],
		mainProject: { id: 0, name: "" },
		quote: 0,
		reference: { id: 0, name: "" },
		subProject: { id: 0, name: "" },
	});

	const [otherData, setOtherData] = useState({
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
		const copy = [...apiData.allClients.apiCopy];
		const name = MyGlobal.Capitalize(client);

		const revisedCopy = copy.filter((client) => client.id != 0);
		revisedCopy.unshift({ id: 0, name });

		handleSearch("client", "");

		setMainData((s) => ({ ...s, client: { id: 0, name } }));
		setApiData((s) => ({ ...s, allClients: { api: revisedCopy, apiCopy: revisedCopy } }));
	};

	const addNewReference = (reference) => {
		const copy = [...apiData.allReferences.apiCopy];
		const name = MyGlobal.Capitalize(reference);

		const revisedCopy = copy.filter((reference) => reference.id != 0);
		revisedCopy.unshift({ id: 0, name });

		handleSearch("reference", "");

		setMainData((s) => ({ ...s, reference: { id: 0, name } }));
		setApiData((s) => ({ ...s, allReferences: { api: revisedCopy, apiCopy: revisedCopy } }));
	};

	const addNewSubProject = (subProject) => {
		const copy = [...apiData.allSubProjects.apiCopy];
		copy.unshift({ id: 0, name: MyGlobal.Capitalize(subProject) });

		handleSearch("subProject", "");

		setMainData((s) => ({ ...s, subProject: copy.at(0) }));
		setApiData((s) => ({ ...s, allSubProjects: { api: copy, apiCopy: copy } }));
	};

	const doInquiryEdit = async () => {
		try {
			setOtherData((s) => ({ ...s, isLoading: true }));

			const body = {
				...mainData,
				entryDate: dayjs(mainData.entryDate).format("YYYY-MM-DD hh:mm:ss"),
				followUps: getFollowUpsIds(),
				mainProjectId: mainData.mainProject.id,
				id: selectedInquiry.id,
				source: MyConstants.Modules.Base.Inquiries,
				type: "edit-inquiry",
				userId: MyGlobal.GetUserId(),
			};

			const response = await axios.post(MyConstants.ApiEndpoints.Inquiries.EditInquiry, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reloadInquiries();

				MyGlobal.AddActivity(`Edited <b>${selectedInquiry.id}</b>.`, MyConstants.Modules.Base.Inquiries);
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
		let clients = apiData.allClients.apiCopy;

		if (value !== "undefined") {
			clients = apiData.allClients.apiCopy.filter((client) => {
				return String(client.name).toLowerCase().includes(value.toLowerCase());
			});
		}

		return clients;
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

	const getFilteredReferences = () => {
		const value = String(otherData.searched.reference.name);
		let references = apiData.allReferences.apiCopy;

		if (value !== "undefined") {
			references = apiData.allReferences.apiCopy.filter((reference) => {
				return String(reference.name).toLowerCase().includes(value.toLowerCase());
			});
		}

		return references;
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

	const getFollowUpsIds = () => {
		return mainData.followUps.map((user) => user.id).join(",");
	};

	const getSupportData = async () => {
		try {
			const response = await axios.get(MyConstants.ApiEndpoints.Inquiries.GetSupportData, MyGlobal.GetHeaders());

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

				setApiData((old) => ({
					...old,
					allClients: { api: allClients, apiCopy: allClients },
					allMainProjects: { api: allMainProjects, apiCopy: allMainProjects },
					allReferences: { api: allReferences, apiCopy: allReferences },
					allSubProjects: { api: allSubProjects, apiCopy: allSubProjects },
				}));

				setMainData({
					client: { id: selectedInquiry.client_id, name: clientName },
					phoneNumber: selectedInquiry.phone_number,
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
					phoneNumber: selectedInquiry.phone_number,
					entryDate: new Date(selectedInquiry.entry_date),
					emailAddress: selectedInquiry.email_address,
					followUps,
					mainProject: { id: selectedInquiry.main_project_id, name: mainProjectName },
					quote: selectedInquiry.quote,
					reference: { id: selectedInquiry.reference_id, name: referenceName },
					subProject: { id: selectedInquiry.sub_project_id, name: subProjectName },
				});

				setOtherData((old) => ({ ...old, hasMounted: true }));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Edit Inquiry => Get Support Data");
		}
	};

	const getSelectedClientData = () => {
		return apiData.allClients.api.filter((client) => client.id == mainData.client.id).at(0);
	};

	const getSelectedReferenceData = () => {
		return apiData.allReferences.apiCopy.filter((reference) => reference.id == mainData.reference.id).at(0);
	};

	const handleFollowUps = (selectedUser) => {
		let revisedData = [];
		const copy = [...mainData.followUps];

		if (copy.includes(selectedUser)) {
			revisedData = copy.filter((user) => user.id != selectedUser.id);
		} else {
			copy.push(selectedUser);
			revisedData = copy;
		}

		setMainData((s) => ({ ...s, followUps: revisedData }));
	};

	const handleInputs = (key, value) => {
		if (key == "client") {
			const client = apiData.allClients.apiCopy.filter((client) => client.id == value.id).at(0);
			const isExistingClient = client.id !== 0;

			const emailAddress = isExistingClient ? client.email_address : "";
			const phoneNumber = isExistingClient ? client.phone_number : "";

			const referenceId = isExistingClient ? client.reference_id : "";
			const referenceName = isExistingClient ? apiData.allReferences.apiCopy.filter((reference) => reference.id == referenceId).at(0)?.name : "";

			if (isExistingClient) {
				handleSearch("client", "");
			}

			setMainData((s) => ({
				...s,
				client: { id: value.id, name: value.name },
				phoneNumber,
				emailAddress,
				reference: { id: referenceId, name: referenceName },
			}));
		} else if (key == "reference") {
			handleSearch("reference", "");
			setMainData((s) => ({ ...s, reference: { id: value.id, name: value.name } }));
		} else if (key == "mainProject" || key == "subProject") {
			handleSearch(key, "");
			setMainData((s) => ({ ...s, [key]: { ...s[key], id: value.id, name: value.name } }));
		} else {
			setMainData((s) => ({ ...s, [key]: value }));
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
				comparingValue2={mainData.client.name}
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

	const uiPhoneNumber = () => {
		return (
			<TextInput
				icon={faPhone}
				isReadOnly={!isUserAdministrator}
				label="Phone Number"
				maxLength={10}
				onChange={(event) => handleInputs("phoneNumber", event.target.value)}
				onKeyPress={(event) => !MyGlobal.HasNumbers(event.key) && event.preventDefault()}
				tabIndex={2}
				value={mainData.phoneNumber}
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
				value={mainData.emailAddress}
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
				selectedItems={mainData.followUps}
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
				value={mainData.entryDate}
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
				onChange={(event) => handleInputs("mainProject", event)}
				onClick={() => {}}
				onInputChange={(event) => handleSearch("mainProject", event.target.value)}
				onKeyPress={(event) => !MyGlobal.HasAlphabets(event.key) && event.preventDefault()}
				searchedItem={otherData.searched.mainProject.name}
				tabIndex={4}
				value={mainData.mainProject.name}
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
				value={mainData.quote}
				width="w-full"
			/>
		);
	};

	const uiReferences = () => {
		return (
			<ComboBox2
				allowCreatingNewItem={true}
				comparingValue1="name"
				comparingValue2={mainData.reference.name}
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
				comparingValue2={mainData.subProject.name}
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
				value={mainData.subProject.name}
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
						<span className="view-heading">Edit Inquiry</span>
					</div>
				</div>
			</div>
			<div className="flex w-full h-full justify-center items-center contrast-background">
				<div className="flex flex-col w-3/5 h-full space-y-3 justify-start items-center">
					<div className="flex w-full px-3 space-x-6 justify-between items-center">
						{uiClient()}
						{uiPhoneNumber()}
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
				<EditInquiryPreview editInquiry={mainData} mount={otherData.isPreviewBoxOpen} oldInquiry={oldInquiry} unmount={togglePreviewBox} />
			)}
		</>
	);
}
