"use client";

// Imports
import MyConstants from "@/utilities/constants";

import { Chips } from "primereact/chips";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { NewInquiryContext } from "../layout";
import { MyGlobal } from "@/utilities/global";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { useToast } from "@/app/context/ToastContext";
import { useContext, useEffect, useState } from "react";
import { InputTextarea } from "primereact/inputtextarea";

// Component
export default function Page() {
	// Business Logic
	const showToast = useToast();
	const { data } = useContext(NewInquiryContext);

	const [newInquiry, setNewInquiry] = useState({
		client: { fullName: "", id: "" },
		contactNumber: "",
		date: new Date(),
		emailAddress: "",
		followUps: [],
		mainProjectId: { id: "", name: "" },
		notes: "",
		quote: 2500,
		reference: { id: "", name: "" },
		status: MyConstants.Statuses.inquiries.open,
		subProjectId: { id: "", name: "" },
		tags: [],
	});

	const [otherData, setOtherData] = useState({
		allClients: data?.allClients,
		isNewClientBoxOpen: false,
		newClient: { fullName: "", id: "" },
	});

	const countries = [
		{ name: "Australia", code: "AU" },
		{ name: "Brazil", code: "BR" },
		{ name: "China", code: "CN" },
		{ name: "Egypt", code: "EG" },
		{ name: "France", code: "FR" },
		{ name: "Germany", code: "DE" },
		{ name: "India", code: "IN" },
		{ name: "Japan", code: "JP" },
		{ name: "Spain", code: "ES" },
		{ name: "United States", code: "US" },
	];

	// Functions
	const addNewClient = () => {
		setOtherData((old) => ({ ...old, allClients: [...old.allClients, otherData.newClient], isNewClientBoxOpen: false, newClient: "" }));
	};

	const getAllClients = async () => {
		const response = await MyGlobal.getAnyData(MyConstants.ApiEndpoints.getAllClients);

		if (response.statusCode == 200) {
			setOtherData((old) => ({ ...old, allClients: response.data }));
		} else {
			if ("response" in error) {
				if ("object" in error.response.data) {
					showToast(error.response.data.object.name, MyConstants.ToastTypes.error);
				} else {
					showToast(error.response.data.error, MyConstants.ToastTypes.error);
				}
			}
		}
	};

	const setNewInquiryValues = (key, value) => {
		if (key == "client") {
			setNewInquiry((old) => ({ ...old, client: { fullName: value?.fullName, id: value?.id } }));
		} else if (key == "status") {
			setNewInquiry((old) => ({ ...old, status: { key: value, value } }));
		} else {
			setNewInquiry((old) => ({ ...old, [key]: value }));
		}
	};

	const setOtherDataValues = (key, value) => {
		if (key == "newClient") {
			const newClientName = value.trim();
			const clientAlreadyExists = otherData.allClients.some((client) => client.fullName == newClientName);

			if (!clientAlreadyExists) {
				const newClient = { fullName: MyGlobal.capitalize(newClientName), id: 0 };
				setOtherData((old) => ({ ...old, newClient }));
			} else {
				showToast(`${newClientName} already exists`, MyConstants.ToastTypes.error);
			}
		} else {
			setOtherData((old) => ({ ...old, [key]: value }));
		}
	};

	// UI Components
	const uiClientsList = (client) => {
		return (
			<div className="flex items-center">
				<i className="w-5 mx-2 pi pi-user" />
				<div>{client?.fullName}</div>
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

	const uiSelectedClient = (option, props) => {
		if (option) {
			return (
				<div className="flex items-center">
					<i className="w-5 mx-2 pi pi-user" />
					<div>{option?.fullName}</div>
				</div>
			);
		}

		return <span>{props.placeholder}</span>;
	};

	// Hooks
	useEffect(() => {
		if (!data.allClients.length) {
			getAllClients();
		}
	}, []);

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
			<div className="flex flex-col w-1/2 space-y-10 justify-center items-center">
				<div className="flex w-full space-x-10 justify-center items-center">
					<div className="flex w-full justify-center">
						<div className="flex flex-col w-full gap-2">
							<label htmlFor="clientsList">
								<span>Clients</span>
								<span className="cursor-pointer pi pi-plus" onClick={() => setOtherDataValues("isNewClientBoxOpen", true)} />
							</label>
							<Dropdown
								className="w-full p-inputtext-sm"
								emptyFilterMessage="No clients found."
								emptyMessage="No clients registered."
								filter
								id="clientsList"
								itemTemplate={uiClientsList}
								onChange={(event) => setNewInquiryValues("client", event.value)}
								options={otherData.allClients}
								optionValue="fullName"
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
										keyfilter="alpha"
										onChange={(event) => setOtherDataValues("newClient", event.target.value)}
										value={otherData.newClient.fullName}
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
								onChange={(event) => setNewInquiryValues("emailAddress", event.target.value)}
								value={newInquiry.emailAddress}
							/>
						</div>
					</div>
				</div>
				<div className="flex w-full space-x-10 justify-center items-center">
					<div className="flex w-full justify-center">
						<div className="flex flex-col w-full gap-2">
							<label htmlFor="mainProjectsList">Main Project</label>
							<Dropdown
								className="w-full p-inputtext-sm"
								filter
								id="mainProjectsList"
								onChange={(event) => setNewInquiryValues("mainProject", event.value)}
								options={countries}
								optionLabel="name"
								placeholder="Select a Main Project"
								value={newInquiry.mainProjectId}
								valueTemplate={uiSelectedClient}
								variant="filled"
							/>
						</div>
					</div>
					<div className="flex w-full justify-center">
						<div className="flex flex-col w-full gap-2">
							<label htmlFor="subProjectsList">Sub Project</label>
							<Dropdown
								className="w-full p-inputtext-sm"
								filter
								id="subProjectsList"
								onChange={(event) => setNewInquiryValues("subProject", event.value)}
								options={countries}
								optionLabel="name"
								placeholder="Select a Sub Project"
								value={newInquiry.subProjectId}
								valueTemplate={uiSelectedClient}
								variant="filled"
							/>
						</div>
					</div>
					<div className="flex w-full justify-center">
						<div className="flex flex-col w-full gap-2">
							<label htmlFor="referenceList">Reference</label>
							<Dropdown
								className="w-full p-inputtext-sm"
								filter
								id="referenceList"
								onChange={(event) => setNewInquiryValues("reference", event.value)}
								options={countries}
								optionLabel="label"
								optionValue="value"
								placeholder="Select a Reference"
								value={newInquiry.reference.name}
								valueTemplate={uiSelectedClient}
								variant="filled"
							/>
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
							<label htmlFor="statusList">Status</label>
							<Dropdown
								checkmark={true}
								className="w-full p-inputtext-sm"
								highlightOnSelect={false}
								id="statusList"
								onChange={(event) => setNewInquiryValues("status", event.value)}
								optionLabel="key"
								options={Object.values(MyConstants.Statuses.inquiries)}
								placeholder="Open"
								value={newInquiry.status.value}
								variant="filled"
							/>
						</div>
					</div>
				</div>
				<div className="flex w-full space-x-10 justify-center items-center">
					<div className="flex w-full justify-center">
						<div className="flex flex-col w-full gap-2">
							<label htmlFor="newInquiryNotes">Notes</label>
							<InputTextarea
								autoResize
								cols={20}
								id="newInquiryNotes"
								onChange={(event) => setNewInquiryValues("notes", event.target.value)}
								rows={2}
								value={newInquiry.notes}
								variant="filled"
							/>
						</div>
					</div>
					<div className="flex w-full justify-center">
						<div className="flex flex-col w-full gap-2">
							<label htmlFor="newInquiryTags">Tags</label>
							<Chips onChange={(event) => setNewInquiryValues("tags", event.value)} value={newInquiry.tags} variant="filled" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
