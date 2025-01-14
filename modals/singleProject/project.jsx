"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import Draggable from "react-draggable";
import MyConstants from "@/utilities/constants";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { Spinner, SpinnerBig } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ComboBox2, TextArea, TextInput } from "@/components/Inputs";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { faCircleCheck, faIdCardClip, faIndianRupee, faIndianRupeeSign, faNoteSticky, faUserGroup, faXmark } from "@fortawesome/free-solid-svg-icons";

export function EditStatus({ mount, reloadTasks, selectedTask, unmount }) {
	// Business Logic
	const [state, setState] = useState({ isBoxDragged: false, isLoading: false, reason: "" });

	const isStatusNotCompleted = selectedTask.status != MyConstants.Statuses.Tasks.Completed;

	const reasonBoxStyle = isStatusNotCompleted ? "flex flex-col w-full px-2.5 pt-0 pb-5 justify-center items-center" : "hidden";

	const titleBarCursor = state.isBoxDragged ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header draggable-handle ${titleBarCursor}`;

	let disableEditButton = state.isLoading ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";

	if (isStatusNotCompleted) {
		disableEditButton = state.isLoading || !state.reason ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";
	}

	const disableButtonStyle = `primary-button-condensed ${disableEditButton}`;

	let activityMessage = `Disabled <b>${selectedTask.id}</b>.`;
	let messageBody = "Are you sure you want to disable this task? You are required to write a reason below.";

	if (selectedTask.status == MyConstants.Statuses.Tasks.Enable) {
		activityMessage = `Enabled <b>${selectedTask.id}</b>.`;
		messageBody = "Are you sure you want to enable this task? You are required to write a reason below.";
	}

	// Functions
	const editStatus = async () => {
		setState((old) => ({ ...old, isLoading: true }));

		const body = {
			reason: state.reason,
			status: selectedTask.status,
			taskId: selectedTask.id,
			type: "edit-task-status",
			userId: MyGlobal.GetUserId(),
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reloadTasks();

				const successMessage =
					selectedTask.status == MyConstants.Statuses.Tasks.Disable ? MyConstants.Messages.TaskDisabled : MyConstants.Messages.TaskEnabled;

				MyGlobal.AddActivity(activityMessage, MyConstants.Modules.Base.Tasks);
				MyGlobal.ShowSuccessToast(successMessage);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Edit Project Status");
		} finally {
			setState((old) => ({ ...old, isLoading: false, reason: "" }));
			unmount(false);
		}
	};

	const setBoxDrag = () => {
		setState((old) => ({ ...old, isBoxDragged: !state.isBoxDragged }));
	};

	const setReason = (reason) => {
		setState((old) => ({ ...old, reason }));
	};

	// UI Components
	const uiButton = () => {
		if (state.isLoading) {
			return (
				<span className="px-3.5">
					<Spinner />
				</span>
			);
		} else {
			return "Edit";
		}
	};

	const uiTitleBar = () => {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">Edit Status</span>
				<FontAwesomeIcon className="cursor-pointer" icon={faXmark} onClick={() => unmount(false)} />
			</DialogTitle>
		);
	};

	// Main UI
	return (
		<Dialog as="div" className="relative z-50" open={mount} onClose={() => unmount(false)}>
			<div className="fixed inset-0 bg-black/50" />
			<div className="flex w-full justify-center items-center fixed inset-0 overflow-y-auto">
				<Draggable handle=".draggable-handle" onStart={() => setBoxDrag()} onStop={() => setBoxDrag()}>
					<DialogPanel className="w-[400px] transform overflow-hidden rounded contrast-background shadow">
						{uiTitleBar()}
						<span className="block w-full p-5 whitespace-pre-line font-regular-11 black-text" dangerouslySetInnerHTML={{ __html: messageBody }} />
						<div className={reasonBoxStyle}>
							<TextArea
								icon={faNoteSticky}
								key={1}
								label="Reason"
								onChange={(event) => setReason(event.target.value)}
								onKeyDown={() => {}}
								rows={3}
								tabIndex={1}
								value={state.reason}
								width="w-full"
							/>
						</div>
						<footer className="dialog-footer">
							<button className={disableButtonStyle} onClick={() => editStatus()}>
								{uiButton()}
							</button>
						</footer>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}

export function EditQuote({ mount, project, reload, unmount }) {
	// Business Logic
	const [main, setMain] = useState({
		isBoxMoved: false,
		isLoading: false,
		quote: "",
	});

	const titleBarCursor = main.isBoxMoved ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header draggable-handle ${titleBarCursor}`;

	const disableEditButton = main.isLoading || !main.quote ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";

	const editButtonStyle = `primary-button-condensed ${disableEditButton}`;

	// Functions
	async function doQuoteEditing() {
		setMain((s) => ({ ...s, isLoading: true }));

		const body = {
			projectId: project.id,
			quote: main.quote,
			type: "edit-quote",
			userId: MyGlobal.GetUserId(),
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reload(project.id);

				MyGlobal.AddActivity(
					`Edited quote of <b>${project.id}</b> from <b>${project.quote}</b> to <b>${main.quote}</b>.`,
					MyConstants.Modules.Base.Projects,
				);

				MyGlobal.ShowSuccessToast(MyConstants.Messages.QuoteEdited);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Edit Project Quote");
		} finally {
			setMain((s) => ({ ...s, isLoading: false, quote: "" }));
			unmount(false);
		}
	}

	function setBoxDrag() {
		setMain((s) => ({ ...s, isBoxMoved: !s.isBoxMoved }));
	}

	function setQuote(quote) {
		setMain((s) => ({ ...s, quote }));
	}

	// UI Components
	function uiButton() {
		if (main.isLoading) {
			return (
				<span className="px-3.5">
					<Spinner />
				</span>
			);
		} else {
			return "Edit";
		}
	}

	function uiTitleBar() {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">Edit Quote</span>
				<FontAwesomeIcon className="cursor-pointer" icon={faXmark} onClick={() => unmount(false)} />
			</DialogTitle>
		);
	}

	// Main UI
	return (
		<Dialog as="div" className="relative z-50" open={mount} onClose={() => unmount(false)}>
			<div className="fixed inset-0 bg-black/50" />
			<div className="flex w-full justify-center items-center fixed inset-0 overflow-y-auto">
				<Draggable handle=".draggable-handle" onStart={() => setBoxDrag()} onStop={() => setBoxDrag()}>
					<DialogPanel className="w-[400px] transform overflow-hidden rounded shadow contrast-background">
						{uiTitleBar()}
						<div className="flex flex-col w-full p-5 space-y-2.5 justify-center items-center">
							<TextInput
								icon={faIndianRupeeSign}
								isReadOnly
								key={1}
								label="Current Quote"
								onChange={() => {}}
								onKeyPress={() => {}}
								tabIndex={1}
								value={project.quote}
								width="w-full"
							/>
							<TextInput
								icon={faIndianRupeeSign}
								key={2}
								label="New Quote"
								onChange={(e) => setQuote(e.target.value)}
								onKeyPress={(e) => !MyGlobal.HasNumbers(e.key) && e.preventDefault()}
								tabIndex={2}
								value={main.quote}
								width="w-full"
							/>
						</div>
						<footer className="dialog-footer">
							<button className={editButtonStyle} onClick={() => doQuoteEditing()}>
								{uiButton()}
							</button>
						</footer>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}

export function ManageGovernmentId({ mount, project, reload, unmount }) {
	// Business Logic
	const isTypeAdd = !project.government_id ? true : false;

	const [main, setMain] = useState({
		id: "",
		isBoxMoved: false,
		isLoading: false,
	});

	const activityMessage = isTypeAdd
		? `Added government id <b>${main.id}</b> in <b>${project.id}</b>.`
		: `Edited government id of <b>${project.id}</b> to <b>${main.id}</b> from <b>${project.government_id}</b>.`;

	const successMessage = isTypeAdd ? MyConstants.Messages.GovernmentIdAdded : MyConstants.Messages.GovernmentIdEdited;

	const titleBarText = isTypeAdd ? "Add Government ID" : "Edit Government ID";

	const titleBarCursor = main.isBoxMoved ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header draggable-handle ${titleBarCursor}`;

	const buttonClickEvent = main.isLoading || !main.id ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";
	const buttonStyle = `primary-button-condensed ${buttonClickEvent}`;

	// Functions
	async function doIdManagement() {
		setMain((s) => ({ ...s, isLoading: true }));

		const body = {
			governmentId: main.id,
			projectId: project.id,
			type: "manage-government-id",
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reload(project.id);

				MyGlobal.AddActivity(activityMessage, MyConstants.Modules.Base.Projects);
				MyGlobal.ShowSuccessToast(successMessage);

				unmount();
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, titleBarText);
		} finally {
			setMain((s) => ({ ...s, isLoading: false, id: "" }));
		}
	}

	function setBoxDrag() {
		setMain((s) => ({ ...s, isBoxMoved: !s.isBoxMoved }));
	}

	function setInput(id) {
		setMain((s) => ({ ...s, id: String(id).toUpperCase() }));
	}

	// UI Components
	function uiButton() {
		if (main.isLoading) {
			return (
				<span className="px-3.5">
					<Spinner />
				</span>
			);
		} else {
			return isTypeAdd ? "Add" : "Edit";
		}
	}

	function uiTitleBar() {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">{titleBarText}</span>
				<FontAwesomeIcon className="cursor-pointer" icon={faXmark} onClick={() => unmount(false)} />
			</DialogTitle>
		);
	}

	// Main UI
	return (
		<Dialog as="div" className="relative z-50" open={mount} onClose={() => unmount()}>
			<div className="fixed inset-0 bg-black/50" />
			<div className="flex w-full justify-center items-center fixed inset-0 overflow-y-auto">
				<Draggable handle=".draggable-handle" onStart={() => setBoxDrag()} onStop={() => setBoxDrag()}>
					<DialogPanel className="w-[400px] transform overflow-hidden rounded contrast-background shadow">
						{uiTitleBar()}
						<div className="flex flex-col w-full p-5 space-y-2.5 justify-center items-center">
							{!isTypeAdd && (
								<TextInput
									icon={faIdCardClip}
									isReadOnly
									label="Current Government ID"
									onChange={() => {}}
									onKeyPress={() => {}}
									tabIndex={1}
									value={project.government_id}
									width="w-full"
								/>
							)}
							<TextInput
								icon={faIdCardClip}
								label="New Government ID"
								onChange={(e) => setInput(e.target.value)}
								onKeyPress={() => {}}
								tabIndex={2}
								value={main.id}
								width="w-full"
							/>
						</div>
						<footer className="dialog-footer">
							<button className={buttonStyle} onClick={() => doIdManagement()}>
								{uiButton()}
							</button>
						</footer>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}

export function MapAffiliates({ mount, project, unmount }) {
	// Business Logic
	const [api, setApi] = useState({
		affiliates: { copy: [], data: [] },
	});

	const [main, setMain] = useState({
		affiliate: { fees: 0, id: "", name: "" },
		isBoxMoved: false,
		isLoading: false,
		isMapping: false,
		selected: [{ fees: 0, id: 0, name: "" }],
	});

	const titleBarCursor = main.isBoxMoved ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header draggable-handle ${titleBarCursor}`;

	// Functions
	function addAffiliate() {
		const copy = [...main.selected];
		copy.push(main.affiliate);

		setMain((s) => ({
			...s,
			affiliate: { fees: 0, id: "", name: "" },
			selected: copy,
		}));
	}

	function deleteAffiliate(object) {
		const copy = [...main.selected];
		const revised = copy.filter((f) => f.id != object.id);

		setMain((s) => ({ ...s, selected: revised }));
	}

	async function getAffiliates() {
		setMain((s) => ({ ...s, isLoading: true }));

		try {
			const response = await axios.get(MyConstants.ApiEndpoints.Getter, MyGlobal.GetHeaders({ type: "get-affiliates" }));

			if (response.status === 200) {
				setApi((s) => ({
					...s,
					affiliates: {
						copy: response.data,
						data: response.data,
					},
				}));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Single Project => Map Affiliates => Get Affiliates");
		} finally {
			setMain((s) => ({ ...s, isLoading: false }));
		}
	}

	function getFilteredList() {
		let list = !api.affiliates.copy.length ? [] : api.affiliates.copy;

		if (list.length) {
			const value = String(main.affiliate.name);

			if (value !== "undefined") {
				list = api.affiliates.copy.filter((f) => {
					return String(f.name).toLowerCase().includes(value.toLowerCase());
				});
			}
		}

		return list;
	}

	function setAffiliate(object) {
		setMain((s) => ({ ...s, affiliate: { ...s.affiliate, id: object.id, name: object.name } }));
	}

	function setBoxDrag() {
		setMain((s) => ({ ...s, isBoxMoved: !s.isBoxMoved }));
	}

	function setFees(value) {
		if (value) {
			setMain((s) => ({ ...s, affiliate: { ...s.affiliate, fees: value } }));
		}
	}

	function setInputs(key, value) {
		if (value) {
			setMain((s) => ({ ...s, [key]: value }));
		}
	}

	// UI Components
	function uiAffiliates() {
		return (
			<ComboBox2
				allowCreatingNewItem={false}
				comparingValue1="name"
				comparingValue2={main.affiliate.name}
				displayValue="name"
				filteredData={getFilteredList}
				hasDataObject
				icon={faUserGroup}
				isReadOnly={false}
				label="Affiliates"
				onChange={(e) => setAffiliate(e)}
				onClick={() => {}}
				onInputChange={(e) => setInputs("find", e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasAlphabets(e.key) && e.preventDefault()}
				searchedItem={main.affiliate.name}
				tabIndex={1}
				value={main.affiliate.name}
				width="w-full"
			/>
		);
	}

	function uiFees() {
		return (
			<TextInput
				icon={faIndianRupee}
				label="Fees"
				onChange={(e) => setFees(e.target.value)}
				onKeyPress={(e) => !MyGlobal.HasNumbers(e.key) && e.preventDefault()}
				tabIndex={2}
				value={main.affiliate.fees}
				width="w-full"
			/>
		);
	}

	function uiMain() {
		if (main.isLoading) {
			return (
				<div className="flex w-full h-full justify-center items-center">
					<SpinnerBig />
				</div>
			);
		} else {
			return (
				<div className="flex flex-col w-full h-full p-5 space-y-2.5 justify-between items-center">
					<div className="flex w-full space-x-5 justify-between items-center">
						{uiAffiliates()}
						{uiFees()}
						<FontAwesomeIcon
							className="cursor-pointer relative top-2.5 green-text"
							icon={faCircleCheck}
							onClick={() => addAffiliate()}
							size="2xl"
						/>
					</div>
					<div className="flex w-full px-2.5 py-5 space-x-5 justify-start items-center rounded primary-border primary-background-transparent-01">
						{uiSelected()}
					</div>
				</div>
			);
		}
	}

	function uiMap() {
		if (main.isLoading) {
			return (
				<span className="px-3.5">
					<Spinner />
				</span>
			);
		} else {
			return "Map";
		}
	}

	function uiSelected() {
		return main.selected.map((m, i) => {
			if (m.id != 0) {
				return (
					<div
						className="flex w-fit px-2 py-1 space-x-2.5 justify-between items-center rounded shadow contrast-background font-medium-10 primary-border primary-text"
						key={i}>
						<span>
							{m.name} ({m.fees})
						</span>
						<FontAwesomeIcon className="cursor-pointer" icon={faXmark} onClick={() => deleteAffiliate(m)} />
					</div>
				);
			}
		});
	}

	function uiTitleBar() {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">Map Affiliates</span>
				<FontAwesomeIcon className="cursor-pointer" icon={faXmark} onClick={() => unmount(false)} />
			</DialogTitle>
		);
	}

	// Hooks
	useEffect(() => {
		getAffiliates();
	}, []);

	// Main UI
	return (
		<Dialog as="div" className="relative z-50" open={mount} onClose={() => unmount()}>
			<div className="fixed inset-0 bg-black/50" />
			<div className="flex w-full justify-center items-center fixed inset-0 overflow-y-auto">
				<Draggable handle=".draggable-handle" onStart={() => setBoxDrag()} onStop={() => setBoxDrag()}>
					<DialogPanel className="w-1/2 h-4/5 transform overflow-hidden rounded contrast-background shadow">
						{uiTitleBar()}
						<div className="flex flex-col w-full h-[calc(100%-45px)] justify-between items-center">
							{uiMain()}
							<footer className="dialog-footer w-full">
								<button className="primary-button-condensed" onClick={() => doMapping()}>
									{uiMap()}
								</button>
							</footer>
						</div>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}
