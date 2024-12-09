"use client";

// Imports
import axios from "axios";
import dayjs from "dayjs";
import MyConstants from "@/utilities/constants";

import { Chips } from "primereact/chips";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { NewInquiryContext } from "../layout";
import { MyGlobal } from "@/utilities/global";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { MultiSelect } from "primereact/multiselect";
import { useToast } from "@/app/context/ToastContext";
import { useContext, useEffect, useState } from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiagramProject, faInfoCircle, faPlusCircle, faShapes, faUserTie } from "@fortawesome/free-solid-svg-icons";

// Component
export default function Page() {
	// Business Logic
	const showToast = useToast();
	const { data, getRequiredData } = useContext(NewInquiryContext);

	const statuses = typeof data?.inquiryStatuses === "string" ? JSON.parse(data?.inquiryStatuses) : [];

	const [newInquiry, setNewInquiry] = useState({
		client: {},
		contactNumber: "",
		date: new Date(),
		emailAddress: "",
		followUps: [],
		mainProject: {},
		note: "",
		quote: 2500,
		reference: {},
		status: MyConstants.Statuses.inquiries.open.value,
		subProject: {},
		tags: [],
	});

	const [otherData, setOtherData] = useState({
		allClients: data?.allClients,
		allReferences: data?.allReferences,
		isAddNewInquiryLoading: false,
		isNewClientBoxOpen: false,
		isNewReferenceBoxOpen: false,
		isPreviewBoxOpen: false,
		newClient: {},
		newReference: {},
	});

	// Functions
	const addNewClient = () => {
		setOtherData((old) => ({ ...old, allClients: [...old?.allClients, otherData.newClient], isNewClientBoxOpen: false, newClient: "" }));
	};

	const addNewInquiry = async () => {
		setOtherData((old) => ({ ...old, isAddNewInquiryLoading: true }));

		const body = {
			client: newInquiry.client,
			contactNumber: newInquiry.contactNumber,
			date: newInquiry.date,
			emailAddress: newInquiry.emailAddress,
			followUps: newInquiry.followUps.map((staff) => staff.id).join(","),
			mainProjectId: newInquiry.mainProject.id,
			note: newInquiry.note,
			quote: newInquiry.quote,
			reference: newInquiry.reference,
			status: newInquiry.status,
			subProjectId: newInquiry.subProject.id,
			userId: MyGlobal.getLoggedInUserDetails()?.user?.id,
			tags: newInquiry.tags.join(","),
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.addInquiry, body);

			if (response.status === 200) {
				getRequiredData();
				setOtherDataValues("isPreviewBoxOpen", false);
				showToast(MyConstants.Messages.inquiryAdded, MyConstants.ToastTypes.success);
			}
		} catch (error) {
			if ("response" in error) {
				if ("object" in error.response.data) {
					showToast(error.response.data.object.name, MyConstants.ToastTypes.error);
				} else {
					showToast(error.response.data.error, MyConstants.ToastTypes.error);
				}
			}
		} finally {
			setOtherData((old) => ({ ...old, isAddNewInquiryLoading: false }));
		}
	};

	const addNewReference = () => {
		setOtherData((old) => ({ ...old, allReferences: [...old?.allReferences, otherData.newReference], isNewReferenceBoxOpen: false, newReference: "" }));
	};

	const getInquiryPreview = () => {
		return [
			{
				client: newInquiry.client.name,
				contactNumber: newInquiry.contactNumber,
				emailAddress: newInquiry.emailAddress,
				mainProject: newInquiry.mainProject.name,
				subProject: newInquiry.subProject.name,
				reference: newInquiry.reference.name,
				date: dayjs(newInquiry.date).format("DD/MM/YYYY"),
				quote: newInquiry.quote,
				status: newInquiry.status,
				followUps: newInquiry.followUps.map((item) => item.full_name).join(", "),
				note: newInquiry.note,
				tags: newInquiry.tags.join(","),
			},
		];
	};

	const setNewInquiryValues = (key, value) => {
		setNewInquiry((old) => ({ ...old, [key]: value }));
	};

	const setOtherDataValues = (key, value) => {
		if (key == "newClient") {
			const clientAlreadyExists = otherData.allClients.some((client) => client.name == value);

			if (!clientAlreadyExists) {
				const newClient = { name: MyGlobal.capitalize(value), id: 0 };
				setOtherData((old) => ({ ...old, newClient }));
			} else {
				showToast(`${value} already exists`, MyConstants.ToastTypes.error);
			}
		} else if (key == "newReference") {
			const referenceAlreadyExists = otherData.allReferences.some((reference) => reference.name == value);

			if (!referenceAlreadyExists) {
				const newReference = { name: MyGlobal.capitalize(value), id: 0 };
				setOtherData((old) => ({ ...old, newReference }));
			} else {
				showToast(`${value} already exists`, MyConstants.ToastTypes.error);
			}
		} else {
			setOtherData((old) => ({ ...old, [key]: value }));
		}
	};

	// UI Components
	const uiClientsList = (client) => {
		return (
			<div className="flex items-center">
				<div>{client?.name}</div>
			</div>
		);
	};

	const uiMainProjectsList = (mainProject) => {
		return (
			<div className="flex items-center">
				<div>{mainProject?.name}</div>
			</div>
		);
	};

	const uiReferencesList = (reference) => {
		return (
			<div className="flex items-center">
				<div>{reference?.name}</div>
			</div>
		);
	};

	const uiStatusesList = (status) => {
		return (
			<div className="flex items-center">
				<div>{status}</div>
			</div>
		);
	};

	const uiSubProjectsList = (subProject) => {
		return (
			<div className="flex items-center">
				<div>{subProject?.name}</div>
			</div>
		);
	};

	const uiNewClientBoxFooter = () => {
		return (
			<div>
				<Button className="p-button-text" label="Cancel" onClick={() => setOtherDataValues("isNewClientBoxOpen", false)} size="small" />
				<Button autoFocus label="Add" onClick={() => addNewClient()} size="small" />
			</div>
		);
	};

	const uiNewReferenceBoxFooter = () => {
		return (
			<div>
				<Button className="p-button-text" label="Cancel" onClick={() => setOtherDataValues("isNewReferenceBoxOpen", false)} size="small" />
				<Button autoFocus label="Add" onClick={() => addNewReference()} size="small" />
			</div>
		);
	};

	const uiPreviewBoxFooter = () => {
		return (
			<div>
				<Button className="p-button-text" label="Cancel" onClick={() => setOtherDataValues("isPreviewBoxOpen", false)} size="small" />
				<Button autoFocus label="Add" onClick={() => addNewInquiry()} size="small" />
			</div>
		);
	};

	const uiSelectedClient = (option, props) => {
		if (option) {
			return (
				<div className="flex space-x-2.5 justify-start items-center">
					<FontAwesomeIcon className="text-blue-600" icon={faUserTie} />
					<span>{option?.name}</span>
				</div>
			);
		}

		return <span>{props.placeholder}</span>;
	};

	const uiSelectedMainProject = (option, props) => {
		if (option) {
			return (
				<div className="flex space-x-2.5 justify-start items-center">
					<FontAwesomeIcon className="text-blue-600" icon={faDiagramProject} />
					<span>{option?.name}</span>
				</div>
			);
		}

		return <span>{props.placeholder}</span>;
	};

	const uiSelectedReference = (option, props) => {
		if (option) {
			return (
				<div className="flex space-x-2.5 justify-start items-center">
					<FontAwesomeIcon className="text-blue-600" icon={faUserTie} />
					<span>{option?.name}</span>
				</div>
			);
		}

		return <span>{props.placeholder}</span>;
	};

	const uiSelectedSubProject = (option, props) => {
		if (option) {
			return (
				<div className="flex space-x-2.5 justify-start items-center">
					<FontAwesomeIcon className="text-blue-600" icon={faShapes} />
					<span>{option?.name}</span>
				</div>
			);
		}

		return <span>{props.placeholder}</span>;
	};

	const uiSelectedStatus = (option, props) => {
		if (option) {
			return (
				<div className="flex space-x-2.5 justify-start items-center">
					<FontAwesomeIcon className="text-blue-600" icon={faInfoCircle} size="lg" />
					<span>{option}</span>
				</div>
			);
		}

		return <span>{props.placeholder}</span>;
	};

	// Hooks
	useEffect(() => {
		console.log(newInquiry);
	}, [newInquiry]);

	useEffect(() => {
		console.log(otherData);
	}, [otherData]);

	// Main UI
	return (
		<div className="flex flex-col w-full h-full justify-center items-center">
			<Toolbar className="w-full !py-0 !bg-transparent !border-none" start={<h2>New Inquiry</h2>} />
			<div className="flex flex-col w-1/2 space-y-9 justify-center items-center">
				<div className="flex w-full space-x-10 justify-center items-center">
					<div className="flex w-full justify-center">
						<div className="flex flex-col w-full gap-2">
							<label className="flex w-full justify-between items-center" htmlFor="clientsList">
								<div className="flex space-x-2.5">
									<span>Clients</span>
									<span className="ml-2.5 text-sm text-gray-400">{data?.allClients?.length}</span>
								</div>
								<FontAwesomeIcon
									className="cursor-pointer text-blue-600"
									icon={faPlusCircle}
									onClick={() => setOtherDataValues("isNewClientBoxOpen", true)}
								/>
							</label>
							<Dropdown
								checkmark={true}
								className="w-full p-inputtext-sm"
								emptyFilterMessage="No clients found."
								emptyMessage="No clients registered."
								filter
								id="clientsList"
								itemTemplate={uiClientsList}
								onChange={(event) => setNewInquiryValues("client", event.value)}
								options={otherData.allClients}
								placeholder="Select a Client"
								showFilterClear
								value={newInquiry.client}
								valueTemplate={uiSelectedClient}
								variant="filled"
							/>
							<Dialog
								className="w-1/4"
								footer={uiNewClientBoxFooter}
								header="New Client"
								onHide={() => {
									if (!otherData.isNewClientBoxOpen) return;
									setOtherDataValues("isNewClientBoxOpen", false);
								}}
								visible={otherData.isNewClientBoxOpen}>
								<div className="flex flex-col w-full gap-2">
									<label htmlFor="newInquiryNewClient">Name</label>
									<InputText
										className="w-full p-inputtext-sm"
										id="newInquiryNewClient"
										keyfilter={/^[A-Za-z\s]*$/}
										onChange={(event) => setOtherDataValues("newClient", event.target.value)}
										validateOnly
										value={otherData.newClient.name}
									/>
								</div>
							</Dialog>
						</div>
					</div>
					<div className="flex w-full justify-center">
						<div className="flex flex-col w-full gap-2">
							<label htmlFor="clientsContactNumber">Contact Number</label>
							<InputNumber
								className="p-inputtext-sm"
								id="clientsContactNumber"
								onValueChange={(event) => setNewInquiryValues("contactNumber", event.value)}
								value={newInquiry.contactNumber}
								useGrouping={false}
							/>
						</div>
					</div>
					<div className="flex w-full justify-center">
						<div className="flex flex-col w-full gap-2">
							<label htmlFor="clientsEmailAddress">Email Address</label>
							<InputText
								className="w-full p-inputtext-sm"
								id="clientsEmailAddress"
								keyfilter="email"
								onChange={(event) => setNewInquiryValues("emailAddress", event.target.value)}
								value={newInquiry.emailAddress}
							/>
						</div>
					</div>
				</div>
				<div className="flex w-full space-x-10 justify-center items-center">
					<div className="flex w-full justify-center">
						<div className="flex flex-col w-full gap-2">
							<label htmlFor="mainProjectsList">
								<span>Main Projects</span>
								<span className="ml-2.5 text-sm text-gray-400">{data?.allMainProjects?.length}</span>
							</label>
							<Dropdown
								checkmark={true}
								className="w-full p-inputtext-sm"
								emptyFilterMessage="No main projects found."
								emptyMessage="No main projects registered."
								filter
								id="mainProjectsList"
								itemTemplate={uiMainProjectsList}
								onChange={(event) => setNewInquiryValues("mainProject", event.value)}
								options={data?.allMainProjects}
								placeholder="Select a Main Project"
								showFilterClear
								value={newInquiry.mainProject}
								valueTemplate={uiSelectedMainProject}
								variant="filled"
							/>
						</div>
					</div>
					<div className="flex w-full justify-center">
						<div className="flex flex-col w-full gap-2">
							<label htmlFor="subProjectsList">
								<span>Sub Projects</span>
								<span className="ml-2.5 text-sm text-gray-400">{data?.allSubProjects?.length}</span>
							</label>
							<Dropdown
								checkmark={true}
								className="w-full p-inputtext-sm"
								emptyFilterMessage="No sub projects found."
								emptyMessage="No sub projects registered."
								filter
								id="subProjectsList"
								itemTemplate={uiSubProjectsList}
								onChange={(event) => setNewInquiryValues("subProject", event.value)}
								options={data?.allSubProjects}
								placeholder="Select a Sub Project"
								showFilterClear
								value={newInquiry.subProject}
								valueTemplate={uiSelectedSubProject}
								variant="filled"
							/>
						</div>
					</div>
					<div className="flex w-full justify-center">
						<div className="flex flex-col w-full gap-2">
							<label className="flex w-full justify-between items-center" htmlFor="referenceList">
								<div className="flex space-x-2.5">
									<span>References</span>
									<span className="ml-2.5 text-sm text-gray-400">{data?.allReferences?.length}</span>
								</div>
								<FontAwesomeIcon
									className="cursor-pointer text-blue-600"
									icon={faPlusCircle}
									onClick={() => setOtherDataValues("isNewReferenceBoxOpen", true)}
								/>
							</label>
							<Dropdown
								checkmark={true}
								className="w-full p-inputtext-sm"
								emptyFilterMessage="No references found."
								emptyMessage="No references registered."
								filter
								id="referenceList"
								itemTemplate={uiReferencesList}
								onChange={(event) => setNewInquiryValues("reference", event.value)}
								options={otherData.allReferences}
								placeholder="Select a Reference"
								showFilterClear
								value={newInquiry.reference}
								valueTemplate={uiSelectedReference}
								variant="filled"
							/>
							<Dialog
								className="w-1/4"
								footer={uiNewReferenceBoxFooter}
								header="New Reference"
								onHide={() => {
									if (!otherData.isNewReferenceBoxOpen) return;
									setOtherDataValues("isNewReferenceBoxOpen", false);
								}}
								visible={otherData.isNewReferenceBoxOpen}>
								<div className="flex flex-col w-full gap-2">
									<label htmlFor="newInquiryNewReference">Name</label>
									<InputText
										className="w-full p-inputtext-sm"
										id="newInquiryNewReference"
										keyfilter={/^[A-Za-z\s]*$/}
										onChange={(event) => setOtherDataValues("newReference", event.target.value)}
										validateOnly
										value={otherData.newReference.name}
									/>
								</div>
							</Dialog>
						</div>
					</div>
				</div>
				<div className="flex w-full space-x-10 justify-center items-center">
					<div className="flex w-full justify-center">
						<div className="flex flex-col w-full gap-2">
							<label htmlFor="newInquiryDate">Inquiry Date</label>
							<Calendar
								className="p-inputtext-sm"
								dateFormat="dd M, yy"
								id="newInquiryDate"
								onChange={(event) => setNewInquiryValues("date", event.value)}
								variant="filled"
								value={newInquiry.date}
							/>
						</div>
					</div>
					<div className="flex w-full justify-center">
						<div className="flex flex-col w-full gap-2">
							<label htmlFor="newInquiryQuote">Quote</label>
							<InputNumber
								className="p-inputtext-sm"
								id="newInquiryQuote"
								onValueChange={(event) => setNewInquiryValues("quote", event.value)}
								value={newInquiry.quote}
							/>
						</div>
					</div>
					<div className="flex w-full justify-center">
						<div className="flex flex-col w-full gap-2">
							<label htmlFor="statusList">
								<span>Status</span>
								<span className="ml-2.5 text-sm text-gray-400">{statuses?.length}</span>
							</label>
							<Dropdown
								checkmark={true}
								className="w-full p-inputtext-sm"
								emptyMessage="No statuses registered."
								id="statusList"
								itemTemplate={uiStatusesList}
								onChange={(event) => setNewInquiryValues("status", event.value)}
								options={statuses}
								placeholder="Open"
								value={newInquiry.status}
								valueTemplate={uiSelectedStatus}
								variant="filled"
							/>
						</div>
					</div>
				</div>
				<div className="flex w-full justify-center items-center">
					<div className="flex flex-col w-full gap-2">
						<label htmlFor="newInquiryFollowUps">
							<span>Follow Ups</span>
							<span className="ml-2.5 text-sm text-gray-400">{data?.allStaff?.length}</span>
						</label>
						<MultiSelect
							className="w-full p-inputtext-sm"
							display="chip"
							emptyFilterMessage="No staff found."
							filter
							maxSelectedLabels={4}
							id="newInquiryFollowUps"
							onChange={(event) => setNewInquiryValues("followUps", event.value)}
							optionLabel="full_name"
							options={data?.allStaff}
							placeholder="Select Staff(s)"
							resetFilterOnHide
							value={newInquiry.followUps}
						/>
					</div>
				</div>
				<div className="flex w-full space-x-10 justify-center items-start">
					<div className="flex w-full justify-center">
						<div className="flex flex-col w-full gap-2">
							<label htmlFor="newInquiryNote">Note</label>
							<InputTextarea
								autoResize
								className="p-inputtext-sm"
								cols={20}
								id="newInquiryNote"
								onChange={(event) => setNewInquiryValues("note", event.target.value)}
								rows={2}
								value={newInquiry.note}
								variant="filled"
							/>
						</div>
					</div>
					<div className="flex w-full justify-center">
						<div className="flex flex-col w-full gap-2">
							<label htmlFor="newInquiryTags">Tags</label>
							<div className="w-full">
								<Chips
									className="w-full"
									onChange={(event) => setNewInquiryValues("tags", event.value)}
									value={newInquiry.tags}
									variant="filled"
								/>
							</div>
						</div>
					</div>
				</div>
				<div className="flex w-full justify-center items-center">
					<Button label="Preview" onClick={() => setOtherDataValues("isPreviewBoxOpen", true)} size="small" />
					<Dialog
						className="w-3/4"
						footer={uiPreviewBoxFooter}
						header="Preview"
						onHide={() => {
							if (!otherData.isPreviewBoxOpen) return;
							setOtherDataValues("isPreviewBoxOpen", false);
						}}
						visible={otherData.isPreviewBoxOpen}>
						<DataTable className="w-full" showGridlines size="small" stripedRows value={getInquiryPreview()}>
							<Column field="client" header="Client" />
							<Column field="contactNumber" header="Contact" />
							<Column field="emailAddress" header="Email Address" />
							<Column field="mainProject" header="Main Project" />
							<Column field="subProject" header="Sub Project" />
							<Column field="reference" header="Reference" />
							<Column field="date" header="Date" />
							<Column field="quote" header="Quote" />
							<Column field="status" header="Status" />
							<Column field="followUps" header="Follow Ups" />
							<Column field="note" header="Note" />
							<Column field="tags" header="Tags" />
						</DataTable>
					</Dialog>
				</div>
			</div>
		</div>
	);
}
