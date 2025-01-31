"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import MyConstants from "@/utilities/constants";
import EditInquiryPreview from "@/modals/inquiries/EditInquiryPreview";

import { MyGlobal } from "@/utilities/global";
import { useEffect, useRef, useState } from "react";
import { Spinner, SpinnerBig } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ComboBox2, ComboBoxWithChips, DatePicker, EmailAddress, TextInput } from "@/components/Inputs";
import { faCalendar, faChevronLeft, faFile, faIndianRupee, faPhone, faUser, faUserGroup } from "@fortawesome/free-solid-svg-icons";

export default function EditInquiry({ inquiry, reload, unmount }) {
	// Business Logic
	const followUpsMenuRef = useRef(null);

	const [api, setApi] = useState({
		clients: { copy: [], data: [] },
		mainProjects: { copy: [], data: [] },
		references: { copy: [], data: [] },
		subProjects: { copy: [], data: [] },
	});

	const [main, setMain] = useState({
		client: { id: 0, name: "" },
		emailAddress: "",
		entryDate: new Date(),
		followUps: [],
		mainProject: { id: 0, name: "" },
		phoneNumber: "",
		quote: 0,
		reference: { id: 0, name: "" },
		subProject: { id: 0, name: "" },
	});

	const [mounted, setMounted] = useState({
		followUpsMenu: false,
		preview: false,
	});

	const [oldData, setOldData] = useState({
		client: { id: 0, name: "" },
		emailAddress: "",
		entryDate: new Date(),
		followUps: [],
		mainProject: { id: 0, name: "" },
		phoneNumber: "",
		quote: 0,
		reference: { id: 0, name: "" },
		subProject: { id: 0, name: "" },
	});

	const [other, setOther] = useState({
		find: { client: {}, mainProject: {}, reference: {}, subProject: {} },
		isLoading: false,
	});

	const isUserAdministrator = MyGlobal.IsUserAdministrator();

	const showFollowUpsMenu = mounted.followUpsMenu
		? "flex flex-col w-[98%] max-h-[220px] justify-start items-center absolute rounded overflow-y-auto bottom-shadow primary-light-background full-border"
		: "hidden";

	const disableEditButton = other.isLoading ? "pointer-events-none" : "pointer-events-auto";
	const editButtonStyle = `primary-button-condensed ${disableEditButton}`;

	// Functions
	function addNewClient(client) {
		const copy = [...api.clients.copy];
		const name = client;

		const revised = copy.filter((f) => f.id != 0);
		revised.unshift({ id: 0, name });

		setFind("client", "");

		setMain((s) => ({ ...s, client: { id: 0, name } }));
		setApi((s) => ({ ...s, clients: { copy: revised, data: revised } }));
	}

	function addNewReference(reference) {
		const copy = [...api.references.copy];
		const name = reference;

		const revised = copy.filter((f) => f.id != 0);
		revised.unshift({ id: 0, name });

		setFind("reference", "");

		setMain((s) => ({ ...s, reference: { id: 0, name } }));
		setApi((s) => ({ ...s, references: { copy: revised, data: revised } }));
	}

	function addNewSubProject(subProject) {
		const copy = [...api.subProjects.copy];
		copy.unshift({ id: 0, name: subProject });

		setFind("subProject", "");

		setMain((s) => ({ ...s, subProject: copy.at(0) }));
		setApi((s) => ({ ...s, subProjects: { copy, data: copy } }));
	}

	function detectEscapeKey(event) {
		if (event.key === "Escape") {
			setMounted((s) => ({ ...s, followUpsMenu: false }));
		}
	}

	function detectOutsideClick(event) {
		if (followUpsMenuRef.current && !followUpsMenuRef.current.contains(event.target)) {
			setMounted((s) => ({ ...s, followUpsMenu: false }));
		}
	}

	async function doInquiryEdit() {
		try {
			setOther((s) => ({ ...s, isLoading: true }));

			const body = {
				...main,
				entryDate: dayjs(main.entryDate).format("YYYY-MM-DD hh:mm:ss"),
				followUps: getFollowUpsIds(),
				mainProjectId: main.mainProject.id,
				id: inquiry.id,
				source: MyConstants.Modules.Base.Inquiries,
				type: "edit-inquiry",
				userId: MyGlobal.GetUserId(),
			};

			const response = await axios.post(MyConstants.ApiEndpoints.Inquiries.EditInquiry, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reload();

				MyGlobal.AddActivity(`Edited <b>${inquiry.id}</b>.`, MyConstants.Modules.Base.Inquiries);
				MyGlobal.ShowSuccessToast(MyConstants.Messages.InquiryEdited);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}

			unmount();
		} catch (error) {
			MyGlobal.HandleErrors(error, "Edit Inquiry");
		} finally {
			setOther((s) => ({ ...s, isLoading: false }));
		}
	}

	function getClientName() {
		let name = "";

		if (api.clients.copy.length) {
			const client = api.clients.copy.find((f) => f.id == main.client.id);

			if (typeof client === "object") {
				name = client.name;
			}
		}

		return name;
	}

	function getFilteredClients() {
		let list = !api.clients.copy.length ? [] : api.clients.copy;

		if (list.length) {
			const value = String(other.find.client.name);

			if (value !== "undefined") {
				list = api.clients.copy.filter((f) => {
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

	function getFilteredReferences() {
		let list = !api.references.copy.length ? [] : api.references.copy;

		if (list.length) {
			const value = String(other.find.reference.name);

			if (value !== "undefined") {
				list = api.references.copy.filter((f) => {
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

	function getFollowUpsIds() {
		let ids = "";

		if (main.followUps.length) {
			ids = main.followUps.map((m) => m.id).join(",");
		}

		return ids;
	}

	function getReferenceName() {
		let name = "";

		if (api.references.copy.length) {
			const object = api.references.copy.find((f) => f.id == main.reference.id);

			if (typeof object === "object") {
				name = object.name;
			}
		}

		return name;
	}

	function setFind(key, value) {
		setOther((s) => ({ ...s, find: { ...s.find, [key]: { ...s.find[key], name: value } } }));
	}

	function setFollowUps(user) {
		let revised = [];
		const copy = [...main.followUps];

		if (copy.includes(user)) {
			revised = copy.filter((f) => f.id != user.id);
		} else {
			copy.push(user);
			revised = copy;
		}

		setMain((s) => ({ ...s, followUps: revised }));
	}

	function setInputs(key, value) {
		if (value) {
			if (key == "client") {
				const client = api.clients.copy.find((f) => f.id == value.id);
				let isExistingClient = false;

				if (typeof client === "object") {
					if (client.id !== 0) {
						isExistingClient = true;
					}
				}

				const emailAddress = isExistingClient ? client.email_address : "";
				const phoneNumber = isExistingClient ? client.phone_number : "";
				const referenceId = isExistingClient ? client.reference_id : "";

				const reference = api.references.copy.find((f) => f.id == referenceId);
				let referenceName = "";

				if (typeof reference === "object") {
					if (isExistingClient) {
						referenceName = reference.name;
					}
				}

				if (isExistingClient) {
					setFind("client", "");
				}

				setMain((s) => ({
					...s,
					client: { id: value.id, name: value.name },
					emailAddress,
					phoneNumber,
					reference: { id: referenceId, name: referenceName },
				}));
			} else if (key == "reference") {
				setFind("reference", "");
				setMain((s) => ({ ...s, reference: { id: value.id, name: value.name } }));
			} else if (key == "mainProject" || key == "subProject") {
				setFind(key, "");
				setMain((s) => ({ ...s, [key]: { ...s[key], id: value.id, name: value.name } }));
			} else {
				setMain((s) => ({ ...s, [key]: value }));
			}
		}
	}

	async function setSupportData() {
		try {
			setOther((s) => ({ ...s, isLoading: true }));

			const response = await axios.get(MyConstants.ApiEndpoints.Inquiries.GetSupportData, MyGlobal.GetHeaders());

			if (response.status == 200) {
				const _inquiry = {
					client: {
						id: inquiry.client_id,
						name: inquiry.client_name,
					},
					entryDate: new Date(inquiry.entry_date),
					emailAddress: inquiry.email_address,
					followUps: inquiry.follow_ups_data,
					mainProject: {
						id: inquiry.main_project_id,
						name: inquiry.main_project,
					},
					phoneNumber: inquiry.phone_number,
					quote: inquiry.quote,
					reference: {
						id: inquiry.reference_id,
						name: inquiry.reference_name,
					},
					subProject: {
						id: inquiry.sub_project_id,
						name: inquiry.sub_project,
					},
				};

				setApi({
					clients: {
						copy: response.data.clients,
						data: response.data.clients,
					},
					mainProjects: {
						copy: response.data.mainProjects,
						data: response.data.mainProjects,
					},
					references: {
						copy: response.data.references,
						data: response.data.references,
					},
					subProjects: {
						copy: response.data.subProjects,
						data: response.data.subProjects,
					},
				});

				setMain(_inquiry);
				setOldData(_inquiry);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Edit Inquiry => Get Support Data");
		} finally {
			setOther((s) => ({ ...s, isLoading: false }));
		}
	}

	function toggleFollowUpsMenu() {
		setMounted((s) => ({ ...s, followUpsMenu: !mounted.followUpsMenu }));
	}

	function togglePreviewBox(value) {
		if (value) {
			doInquiryEdit();
		}

		setMounted((s) => ({ ...s, preview: !mounted.preview }));
	}

	// UI Components
	function uiClient() {
		return (
			<ComboBox2
				allowCreatingNewItem
				comparingValue1="name"
				comparingValue2={main.client.name}
				displayValue="name"
				filteredData={getFilteredClients}
				hasDataObject
				icon={faUser}
				isReadOnly={!isUserAdministrator}
				label="Client"
				onChange={(e) => setInputs("client", e)}
				onClick={() => addNewClient(other.find.client.name)}
				onInputChange={(e) => setFind("client", e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasAlphabets(e.key) && e.preventDefault()}
				searchedItem={other.find.client.name}
				tabIndex={1}
				value={getClientName()}
				width="w-full"
			/>
		);
	}

	function uiDate() {
		return <DatePicker icon={faCalendar} label="Date" onChange={(e) => setInputs("entryDate", e)} tabIndex={7} value={main.entryDate} width="w-full" />;
	}

	function uiEmailAddress() {
		return (
			<EmailAddress
				isReadOnly={!isUserAdministrator}
				onChange={(e) => setInputs("emailAddress", e.target.value)}
				suffix=""
				tabIndex={3}
				value={main.emailAddress}
				width="w-full"
			/>
		);
	}

	function uiFollowUps() {
		return (
			<div className="w-full" ref={followUpsMenuRef}>
				<ComboBoxWithChips
					displayKey="full_name"
					label="Follow Ups"
					icon={faUserGroup}
					isMenuInverted
					onBlur={() => toggleFollowUpsMenu()}
					onItemClick={(e) => setFollowUps(e)}
					onSelectedItemClick={(e) => setFollowUps(e)}
					selectedItems={main.followUps}
					showList={showFollowUpsMenu}
					source={MyGlobal.GetAllUsers()}
					toggleMenu={() => toggleFollowUpsMenu()}
				/>
			</div>
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
				onKeyPress={(e) => !MyGlobal.HasAlphabets(e.key) && e.preventDefault()}
				searchedItem={other.find.mainProject.name}
				tabIndex={4}
				value={main.mainProject.name}
				width="w-full"
			/>
		);
	}

	function uiPhoneNumber() {
		return (
			<TextInput
				icon={faPhone}
				isReadOnly={!isUserAdministrator}
				label="Phone Number"
				maxLength={10}
				onChange={(e) => setInputs("phoneNumber", e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasNumbers(e.key) && e.preventDefault()}
				tabIndex={2}
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
		return (
			<TextInput
				icon={faIndianRupee}
				label="Quote"
				onChange={(e) => setInputs("quote", e.target.value)}
				onKeyPress={() => {}}
				tabIndex={8}
				value={main.quote}
				width="w-full"
			/>
		);
	}

	function uiReferences() {
		return (
			<ComboBox2
				allowCreatingNewItem
				comparingValue1="name"
				comparingValue2={main.reference.name}
				displayValue="name"
				filteredData={getFilteredReferences}
				hasDataObject
				icon={faUser}
				isReadOnly={!isUserAdministrator}
				label="Reference"
				onChange={(e) => setInputs("reference", e)}
				onClick={() => addNewReference(other.find.reference.name)}
				onInputChange={(e) => setFind("reference", e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasAlphabets(e.key) && e.preventDefault()}
				searchedItem={other.find.reference.name}
				tabIndex={6}
				value={getReferenceName()}
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
				onKeyPress={(e) => !MyGlobal.HasAlphabets(e.key) && e.preventDefault()}
				searchedItem={other.find.subProject.name}
				tabIndex={5}
				value={main.subProject.name}
				width="w-full"
			/>
		);
	}

	// Hooks
	useEffect(() => {
		setSupportData();
	}, []);

	useEffect(() => {
		if (mounted.followUpsMenu) {
			document.addEventListener("mousedown", detectOutsideClick);
			document.addEventListener("keydown", detectEscapeKey);
		}

		return () => {
			document.removeEventListener("mousedown", detectOutsideClick);
			document.removeEventListener("keydown", detectEscapeKey);
		};
	}, [mounted.followUpsMenu]);

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

				{mounted.preview && <EditInquiryPreview editInquiry={main} mount={mounted.preview} oldInquiry={oldData} unmount={togglePreviewBox} />}
			</>
		);
	}
}
