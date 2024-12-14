"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import MyConstants from "@/utilities/constants";

import { MyGlobal } from "@/utilities/global";
import { DashboardContext } from "@/pages/home";
import { Spinner } from "@/components/Elements";
import { useContext, useEffect, useState } from "react";
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
	const { staffData } = useContext(DashboardContext);

	const [data, setData] = useState({
		client: { id: "", name: "" },
		contactNumber: "",
		entryDate: new Date(),
		emailAddress: "",
		followUps: [],
		mainProject: { id: "", name: "" },
		note: "",
		quote: "",
		reference: { id: "", name: "" },
		status: MyConstants.Statuses.Inquiries.Open,
		subProject: { id: "", name: "" },
	});

	const [otherData, setOtherData] = useState({
		allClients: { api: [], apiCopy: [] },
		allMainProjects: { api: [], apiCopy: [] },
		allReferences: { api: [], apiCopy: [] },
		allSubProjects: { api: [], apiCopy: [] },
		followUpsList: [],
		hasMounted: false,
		isFollowUpsMenuOpen: false,
		isLoading: false,
		isPreviewBoxOpen: false,
		searched: { client: {}, mainProject: {}, reference: {}, status: "", subProject: {} },
	});

	const showFollowUpsMenu = otherData.isFollowUpsMenuOpen
		? "flex flex-col w-[99%] max-h-[220px] justify-start items-center absolute rounded overflow-y-auto bottom-shadow black-white-background full-border"
		: "hidden";

	const disableAddButton = otherData.isLoading ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";
	const addButtonStyle = `primary-button-condensed ${disableAddButton}`;

	// Functions
	const addInquiry = async () => {
		setOtherData((s) => ({ ...s, isLoading: true }));

		try {
			const body = {
				...data,
				followUps: getFollowUpsIds(),
				note: MyGlobal.EscapeString(data.note),
				quote: Number(data.quote),
			};

			const response = await axios.post(MyConstants.ApiEndpoints.Inquiries.Handler, body, MyGlobal.GetHeaders());

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
		const copy = [...otherData.allClients];
		const name = MyGlobal.Capitalize(client);

		const revisedCopy = copy.filter((client) => client.id == 0);
		revisedCopy.unshift({ id: 0, name });

		handleSearch("client", "");

		setData((s) => ({ ...s, client: { id: "", name } }));
		setOtherData((s) => ({ ...s, allClients: revisedCopy }));
	};

	const addNewReference = (reference) => {
		const copy = [...otherData.references.apiCopy];
		const revisedCopy = copy.filter((reference) => reference.id == 0);
		const name = MyGlobal.Capitalize(reference);

		revisedCopy.unshift({ id: 0, name });
		handleSearch("reference", "");

		setData((s) => ({ ...s, reference: { id: "", name } }));
		setOtherData((s) => ({ ...s, references: { api: revisedCopy, apiCopy: revisedCopy } }));
	};

	const addSubProject = (subProject) => {
		const copy = [...otherData.allSubProjects.apiCopy];
		copy.unshift({ id: 0, name: MyGlobal.Capitalize(subProject) });

		handleSearch("subProject", "");

		setData((s) => ({ ...s, subProject: copy.at(0) }));
		setOtherData((s) => ({ ...s, allSubProjects: { api: copy, apiCopy: copy } }));
	};

	const getFilteredClients = () => {
		const value = String(otherData.searched.client.name);

		return otherData.allClients.apiCopy.filter((client) => {
			if (value) {
				return String(client.name).toLowerCase().includes(value.toLowerCase());
			}
			return true;
		});
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
		let subProjects = otherData.allReferences.apiCopy;

		if (value !== "undefined") {
			subProjects = otherData.allReferences.apiCopy.filter((reference) => {
				return String(reference.name).toLowerCase().includes(value.toLowerCase());
			});
		}

		return subProjects;
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
		let ids = "";

		data.followUps.forEach((staff, index) => {
			const id = MyGlobal.GetIds(staff, staffData);

			if (index != data.followUps.length - 1) {
				ids += id + ",";
			} else {
				ids += id;
			}
		});

		return ids;
	};

	const getSupportingData = async () => {
		try {
			const response = await axios.get(MyConstants.ApiEndpoints.Inquiries.GetSupportingData, MyGlobal.GetHeaders());

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
		return otherData.allClients.api.filter((client) => client.id == data.client.id).at(0);
	};

	const getSelectedReferenceData = () => {
		return otherData.allMainProjects.apiCopy.filter((reference) => reference.id == data.reference.id).at(0);
	};

	const handleFollowUps = (selectedUser) => {
		let revisedData = [];
		const copy = [...data.followUps];

		if (copy.includes(selectedUser)) {
			revisedData = copy.filter((user) => user != selectedUser);
		} else {
			copy.push(selectedUser);
			revisedData = copy;
		}

		setData((s) => ({ ...s, followUps: revisedData }));
	};

	const handleInputs = (key, value) => {
		if (key == "client") {
			const client = otherData.allClients.filter((client) => client.id == value.id).at(0);

			const email = !client.is_new ? client.email : "";
			const phone = !client.is_new ? client.phone : "";

			const referenceId = !client.is_new ? client.reference_id : "";
			const referenceName = !client.is_new ? otherData.references.apiCopy.filter((reference) => reference.id == referenceId).at(0)?.name : "";

			if (!client.is_new) {
				handleSearch("client", "");
			}

			setData((s) => ({
				...s,
				client: { id: value.id, name: value.name },
				email,
				phone,
				reference: { id: referenceId, name: referenceName },
			}));
		} else if (key == "reference") {
			handleSearch("reference", "");
			setData((s) => ({ ...s, reference: { id: value.id, name: value.name } }));
		} else if (key == "mainProject" || key == "subProject") {
			handleSearch(key, "");
			setData((s) => ({ ...s, [key]: { ...s[key], name: value } }));
		} else if (key == "status") {
			handleSearch(key, "");
			setData((s) => ({ ...s, [key]: value }));
		} else {
			setData((s) => ({ ...s, [key]: value }));
		}
	};

	const handleSearch = (key, value) => {
		setOtherData((s) => ({ ...s, searched: { ...s.searched, [key]: { ...s.searched[key], name: value } } }));
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
				comparingValue1="id"
				comparingValue2={data.client.id}
				displayValue="name"
				filteredData={getFilteredClients}
				hasDataObject={true}
				icon={faUser}
				isNew={false}
				isReadOnly={false}
				label="Client"
				onChange={(event) => handleInputs("client", event)}
				onClick={() => addNewClient(otherData.find.client)}
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
				isNew={false}
				label="Contact Number"
				maxLength={10}
				onChange={(event) => handleInputs("contactNumber", event.target.value)}
				onKeyPress={(event) => !MyGlobal.HasNumbers(event.key) && event.preventDefault()}
				tabIndex={2}
				value={data.contactNumber}
				width="w-full"
			/>
		);
	};

	const uiEmailAddress = () => {
		return (
			<EmailAddress
				isNew={false}
				onChange={(event) => handleInputs("emailAddress", event.target.value)}
				suffix=""
				tabIndex={3}
				value={data.emailAddress}
				width="w-full"
			/>
		);
	};

	const uiFollowUps = () => {
		return (
			<ComboBoxWithChips
				compareWith="full_name"
				label="Follow Ups"
				icon={faUserGroup}
				isMenuInverted={true}
				isNew={false}
				onItemClick={(event) => handleFollowUps(event)}
				onSelectedItemClick={(event) => handleFollowUps(event)}
				selectedItems={data.followUps}
				showList={showFollowUpsMenu}
				toggleMenu={() => setOtherData((s) => ({ ...s, isFollowUpsMenuOpen: !otherData.isFollowUpsMenuOpen }))}
			/>
		);
	};

	const uiDate = () => {
		return (
			<DatePicker
				icon={faCalendar}
				isNew={false}
				label="Date"
				onChange={(event) => handleInputs("entryDate", event)}
				tabIndex={7}
				value={data.entryDate}
				width="w-full"
			/>
		);
	};

	const uiMainProjects = () => {
		return (
			<ComboBox
				allowCreatingNewItem={false}
				compareWith="name"
				comparisonValue={data.mainProject.name}
				displayValue="name"
				filteredData={getFilteredMainProjects}
				icon={faFile}
				isNew={false}
				label="Main Project"
				onChange={(event) => handleInputs("mainProject", event)}
				onClick={() => {}}
				onInputChange={(event) => handleSearch("mainProject", event.target.value)}
				onKeyPress={(event) => !MyGlobal.HasAlphabets(event.key) && event.preventDefault()}
				searchedItem={otherData.searched.mainProject.name}
				tabIndex={4}
				value={data.mainProject.name}
				width="w-full"
			/>
		);
	};

	const uiNotes = () => {
		return (
			<TextArea
				icon={faNoteSticky}
				isNew={false}
				key={1}
				label="Notes"
				onChange={(event) => handleInputs("note", event.target.value)}
				onKeyDown={() => {}}
				rows={2}
				tabIndex={10}
				value={data.note}
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
				isNew={false}
				label="Quote"
				onChange={(event) => handleInputs("quote", event.target.value)}
				onKeyPress={() => {}}
				tabIndex={8}
				value={MyGlobal.ThousandSeparator(data.quote)}
				width="w-full"
			/>
		);
	};

	const uiReferences = () => {
		return (
			<ComboBox2
				allowCreatingNewItem={true}
				comparingValue1="name"
				comparingValue2={data.reference.name}
				displayValue="name"
				filteredData={getFilteredReferences}
				hasDataObject={true}
				icon={faUser}
				isNew={false}
				isReadOnly={false}
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

	const uiStatus = () => {
		return (
			<ComboBox
				allowCreatingNewItem={false}
				compareWith=""
				comparisonValue={data.status}
				displayValue=""
				filteredData={getFilteredStatuses}
				icon={faCircleExclamation}
				isNew={false}
				label="Status"
				onChange={(event) => handleInputs("status", event)}
				onClick={() => {}}
				onInputChange={(event) => handleSearch("status", event.target.value)}
				onKeyPress={(event) => !MyGlobal.HasAlphabets(event.key) && event.preventDefault()}
				searchedItem={otherData.searched.status}
				tabIndex={9}
				value={data.status}
				width="w-full"
			/>
		);
	};

	const uiSubProjects = () => {
		return (
			<ComboBox
				allowCreatingNewItem={true}
				compareWith="name"
				comparisonValue={data.subProject.name}
				displayValue="name"
				filteredData={getFilteredSubProjects}
				icon={faFile}
				isNew={false}
				label="Sub Project"
				onChange={(event) => handleInputs("subProject", event)}
				onClick={() => addSubProject(otherData.searched.subProject.name)}
				onInputChange={(event) => handleSearch("subProject", event.target.value)}
				onKeyPress={(event) => !MyGlobal.HasAlphabets(event.key) && event.preventDefault()}
				searchedItem={otherData.searched.subProject.name}
				tabIndex={5}
				value={data.subProject.name}
				width="w-full"
			/>
		);
	};

	// Hooks
	useEffect(() => {
		getSupportingData();
	}, []);

	useEffect(() => {
		console.log(otherData);
	}, [otherData]);

	if (!otherData.hasMounted) {
		return;
	}

	return (
		<>
			<div className="flex w-full px-5 py-2.5 justify-between items-center bottom-border black-white-background">
				<div className="flex w-full space-x-2.5 justify-start items-center">
					<FontAwesomeIcon className="pr-1 cursor-pointer black-text" icon={faChevronLeft} onClick={() => unmount()} />
					<div className="flex w-full justify-start items-center">
						<span className="view-heading">New Inquiry</span>
					</div>
				</div>
			</div>
			<div className="flex flex-col w-1/2 h-full justify-start items-center">
				<div className="flex w-full px-3 space-x-5 justify-between items-center">
					{uiClient()}
					{uiContactNumber()}
					{uiEmailAddress()}
				</div>
				<div className="flex w-full px-3 space-x-5 justify-between items-center">
					{uiMainProjects()}
					{uiSubProjects()}
					{uiReferences()}
				</div>
				<div className="flex w-full px-3 space-x-5 justify-between items-center">
					{uiDate()}
					{uiQuote()}
					{uiStatus()}
				</div>
				<div className="flex w-full px-3 space-x-5 justify-between items-center">{uiFollowUps()}</div>
				<div className="flex w-full px-3 space-x-5 justify-between items-center">{uiNotes()}</div>
			</div>
			<footer className="w-full dialog-footer">
				<button className={addButtonStyle} onClick={() => togglePreviewBox("")}>
					{uiPreview()}
				</button>
			</footer>

			{otherData.isPreviewBoxOpen && <NewInquiryPreview close={togglePreviewBox} inquiry={data} open={otherData.isPreviewBoxOpen} />}
		</>
	);
}
