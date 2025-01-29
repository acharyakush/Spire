"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import Draggable from "react-draggable";
import MyConstants from "@/utilities/constants";

import { useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { Spinner } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { DatePicker, TextArea, TextInput } from "@/components/Inputs";
import { faCalendar, faCoins, faListCheck, faNoteSticky, faStickyNote, faXmark } from "@fortawesome/free-solid-svg-icons";

export function AddParticularRemark({ mount, reload, task, unmount }) {
	// Business Logic
	const [main, setMain] = useState({
		isBoxMoved: false,
		isLoading: false,
		particular: "",
		remark: "",
	});

	const addButtonAesthetics = main.particular && main.remark ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-25";
	const addButtonStyle = `primary-button-condensed ${addButtonAesthetics}`;

	const titleBarCursor = main.isBoxMoved ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header shadow draggable-handle ${titleBarCursor}`;

	// Functions
	async function doInsertion() {
		setMain((s) => ({ ...s, isLoading: true }));

		const body = {
			createdBy: MyGlobal.GetUserId(),
			particular: MyGlobal.EscapeString(main.particular),
			projectId: task.project_id,
			remark: MyGlobal.EscapeString(main.remark),
			taskId: task.id,
			type: "add-tasks-particular-remark",
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reload();

				MyGlobal.AddActivity(`Added a particular and remark in <b>${task.task_id}</b> in <b>${task.project_id}</b>.`, MyConstants.Modules.Base.Tasks);

				MyGlobal.ShowSuccessToast(MyConstants.Messages.TaskParticularRemarkAdded);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Add Particular And Remark");
		} finally {
			setMain((s) => ({ ...s, isLoading: false }));
			unmount();
		}
	}

	function setBoxDrag() {
		setMain((s) => ({ ...s, isBoxMoved: !s.isBoxMoved }));
	}

	function setInputs(key, value) {
		setMain((s) => ({ ...s, [key]: value }));
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
			return "Add";
		}
	}

	function uiTitleBar() {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">Add Particular & Remark</span>
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
						<div className="flex flex-col w-full p-5 space-y-2.5 justify-between items-center">
							<TextArea
								icon={faListCheck}
								key={1}
								label="Particular"
								onChange={(e) => setInputs("particular", e.target.value)}
								onKeyDown={() => {}}
								rows={2}
								tabIndex={1}
								value={main.particular}
								width="w-full"
							/>
							<TextArea
								icon={faStickyNote}
								key={2}
								label="Remark"
								onChange={(e) => setInputs("remark", e.target.value)}
								onKeyDown={() => {}}
								rows={2}
								tabIndex={2}
								value={main.remark}
								width="w-full"
							/>
						</div>
						<footer className="dialog-footer">
							<button className={addButtonStyle} onClick={() => doInsertion()}>
								{uiButton()}
							</button>
						</footer>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}

export function AddTask({ mount, reload, project, unmount }) {
	// Business Logic
	const today = dayjs();
	const sevenDaysFromToday = today.add(7, "day");

	const [main, setMain] = useState({
		dueOn: sevenDaysFromToday.toDate(),
		expense: 0,
		isBoxMoved: false,
		isLoading: false,
		task: "",
	});

	const addButtonAesthetics = main.task ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-25";
	const addButtonStyle = `primary-button-condensed ${addButtonAesthetics}`;

	const titleBarCursor = main.isBoxMoved ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header shadow draggable-handle ${titleBarCursor}`;

	// Functions
	async function doInsertion() {
		setMain((s) => ({ ...s, isLoading: true }));

		const body = {
			clientId: project.client_id,
			dueOn: dayjs(main.dueOn).format("YYYY-MM-DD"),
			expense: Number(main.expense),
			projectId: project.id,
			task: MyGlobal.EscapeString(main.task),
			userId: MyGlobal.GetUserId(),
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.Tasks.AddTask, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reload();

				MyGlobal.AddActivity(`Added <b>${response.data}</b> in <b>${project.id}</b>`, MyConstants.Modules.Base.Tasks);
				MyGlobal.ShowSuccessToast(MyConstants.Messages.TaskAdded);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Add Task");
		} finally {
			setMain((s) => ({ ...s, isLoading: false }));
			unmount();
		}
	}

	function setBoxDrag() {
		setMain((s) => ({ ...s, isBoxMoved: !s.isBoxMoved }));
	}

	function setInputs(key, value) {
		setMain((s) => ({ ...s, [key]: value }));
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
			return "Add";
		}
	}

	function uiTitleBar() {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">Add Task</span>
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
					<DialogPanel className="w-[400px] h-[510px] transform overflow-hidden rounded contrast-background shadow">
						{uiTitleBar()}
						<div className="flex flex-col w-full h-[calc(100%-45px)] justify-between items-center">
							<div className="flex flex-col w-full h-full p-5 space-y-2.5 justify-start items-center">
								<TextInput
									icon={faListCheck}
									label="Task"
									onChange={(e) => setInputs("task", e.target.value)}
									onKeyPress={() => {}}
									tabIndex={1}
									value={main.task}
									width="w-full"
								/>
								<DatePicker
									icon={faCalendar}
									label="Due On"
									onChange={(e) => setInputs("dueOn", e)}
									tabIndex={2}
									value={main.dueOn}
									width="w-full"
								/>
								<TextInput
									icon={faCoins}
									label="Expense"
									onChange={(e) => setInputs("expense", e.target.value)}
									onKeyPress={(e) => !MyGlobal.HasNumbers(e.key) && e.preventDefault()}
									tabIndex={3}
									value={main.expense}
									width="w-full"
								/>
							</div>
							<footer className="dialog-footer w-full">
								<button className={addButtonStyle} onClick={() => doInsertion()}>
									{uiButton()}
								</button>
							</footer>
						</div>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}

export function DeleteParticularRemark({ mount, reload, task, unmount }) {
	// Business Logic
	const [main, setMain] = useState({
		isBoxMoved: false,
		isLoading: false,
	});

	const titleBarCursor = main.isBoxMoved ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header shadow draggable-handle ${titleBarCursor}`;

	// Functions
	async function doDeletion() {
		setMain((s) => ({ ...s, isLoading: true }));

		const body = {
			projectId: task.project_id,
			rowId: task.id,
			taskId: task.task_id,
			type: "delete-tasks-particular-remark",
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reload();

				MyGlobal.AddActivity(
					`Deleted particular <b>${task.particular}</b> with remark <b>${task.remark}</b> of <b>${task.task_id}</b> in <b>${task.project_id}</b>`,
					MyConstants.Modules.Base.Tasks,
				);
				MyGlobal.ShowSuccessToast(MyConstants.Messages.TaskParticularRemarkDeleted);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Delete Tasks Particular / Remark");
		} finally {
			setMain((s) => ({ ...s, isLoading: false }));
			unmount();
		}
	}

	function setBoxDrag() {
		setMain((s) => ({ ...s, isBoxMoved: !s.isBoxMoved }));
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
			return "Delete";
		}
	}

	function uiTitleBar() {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">Delete Particular/Remark</span>
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
						<div className="flex flex-col w-full p-5 space-y-2.5 justify-center items-center font-regular-12">
							Do you want to delete the below particular & remark?
						</div>
						<footer className="dialog-footer">
							<button className="primary-button-condensed" onClick={() => doDeletion()}>
								{uiButton()}
							</button>
						</footer>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}

export function DeleteTask({ mount, reload, task, unmount }) {
	// Business Logic
	const [main, setMain] = useState({
		isBoxMoved: false,
		isLoading: false,
		reason: "",
	});

	const disableDeleteButton = main.isLoading || !main.reason ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";
	const disableButtonStyle = `primary-button-condensed ${disableDeleteButton}`;

	const titleBarCursor = main.isBoxMoved ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header shadow draggable-handle ${titleBarCursor}`;

	// Functions
	async function doDeletion() {
		setMain((s) => ({ ...s, isLoading: true }));

		const body = {
			taskId: task.id,
			type: "delete-task",
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reload();

				MyGlobal.AddActivity(`Deleted <b>${task.id}</b> in <b>${task.project_id}</b>`, MyConstants.Modules.Base.Tasks);
				MyGlobal.ShowSuccessToast(MyConstants.Messages.TaskDeleted);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Delete Task");
		} finally {
			setMain((s) => ({ ...s, isLoading: false }));
			unmount();
		}
	}

	function setBoxDrag() {
		setMain((s) => ({ ...s, isBoxMoved: !s.isBoxMoved }));
	}

	function setReason(reason) {
		setMain((s) => ({ ...s, reason }));
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
			return "Delete";
		}
	}

	function uiTitleBar() {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">Delete Task</span>
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
						<span className="block w-full p-5 whitespace-pre-line font-regular-11 black-text">
							Are you sure you want to delete this task? You are required to write a reason below.
						</span>
						<div className="flex flex-col w-full px-2.5 pt-0 pb-5 justify-center items-center">
							<TextArea
								icon={faNoteSticky}
								key={1}
								label="Reason"
								onChange={(e) => setReason(e.target.value)}
								onKeyDown={() => {}}
								rows={3}
								tabIndex={1}
								value={main.reason}
								width="w-full"
							/>
						</div>
						<footer className="dialog-footer">
							<button className={disableButtonStyle} onClick={() => doDeletion()}>
								{uiButton()}
							</button>
						</footer>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}

export function EditParticularRemark({ mount, reload, task, unmount }) {
	// Business Logic
	const [main, setMain] = useState({
		isBoxMoved: false,
		isLoading: false,
		particular: task.particular,
		remark: task.remark,
	});

	const titleBarCursor = main.isBoxMoved ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header shadow draggable-handle ${titleBarCursor}`;

	// Functions
	async function doEditing() {
		setMain((s) => ({ ...s, isLoading: true }));

		const body = {
			particular: MyGlobal.EscapeString(main.particular),
			projectId: task.project_id,
			remark: MyGlobal.EscapeString(main.remark),
			rowId: task.id,
			taskId: task.task_id,
			type: "edit-tasks-particular-remark",
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reload();

				MyGlobal.AddActivity(getAddActivityMessage(), MyConstants.Modules.Base.Tasks);
				MyGlobal.ShowSuccessToast(MyConstants.Messages.TaskParticularRemarkEdited);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Edit Tasks Particular / Remark");
		} finally {
			setMain((s) => ({ ...s, isLoading: false }));
			unmount();
		}
	}

	function getAddActivityMessage() {
		const changes = [];

		["particular", "remark"].forEach((fe) => {
			if (task[fe] !== main[fe]) {
				changes.push({
					old: task[fe],
					new: main[fe],
					label: MyGlobal.Capitalize(fe),
				});
			}
		});

		const messages = changes.map((m) => `${m.label} from <b>${m.old}</b> to <b>${m.new}</b>`);

		const finalMessage = messages.join(", ");

		return `Edited ${finalMessage} of <b>${task.task_id}</b> in <b>${task.project_id}</b>.`;
	}

	function setBoxDrag() {
		setMain((s) => ({ ...s, isBoxMoved: !s.isBoxMoved }));
	}

	function setInputs(key, value) {
		setMain((s) => ({ ...s, [key]: value }));
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
				<span className="flex w-full justify-start items-center">Edit Particulars/Remarks</span>
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
							<TextArea
								icon={faListCheck}
								key={1}
								label="Particular"
								onChange={(e) => setInputs("particular", e.target.value)}
								onKeyDown={() => {}}
								rows={2}
								tabIndex={1}
								value={main.particular}
								width="w-full"
							/>
							<TextArea
								icon={faStickyNote}
								key={2}
								label="Remark"
								onChange={(e) => setInputs("remark", e.target.value)}
								onKeyDown={() => {}}
								rows={2}
								tabIndex={2}
								value={main.remark}
								width="w-full"
							/>
						</div>
						<footer className="dialog-footer">
							<button className="primary-button-condensed" onClick={() => doEditing()}>
								{uiButton()}
							</button>
						</footer>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}

export function EditTask({ mount, reload, task, unmount }) {
	// Business Logic
	const [main, setMain] = useState({
		due_on: task.due_on,
		expense: task.expense,
		id: task.id,
		isBoxMoved: false,
		isLoading: false,
		task: task.task,
	});

	const titleBarCursor = main.isBoxMoved ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header shadow draggable-handle ${titleBarCursor}`;

	// Functions
	async function doEditing() {
		setMain((s) => ({ ...s, isLoading: true }));

		const editTaskBody = {
			dueOn: dayjs(main.due_on).format("YYYY-MM-DD"),
			expense: Number(main.expense),
			task: MyGlobal.EscapeString(main.task),
			taskId: task.id,
			type: "edit-task",
		};

		try {
			const editTaskBodyResponse = await axios.post(MyConstants.ApiEndpoints.Setter, editTaskBody, MyGlobal.GetHeaders());

			if (editTaskBodyResponse.status === 200) {
				reload();

				MyGlobal.AddActivity(getAddActivityMessage(), MyConstants.Modules.Base.Tasks);
				MyGlobal.ShowSuccessToast(MyConstants.Messages.TaskEdited);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Edit Task");
		} finally {
			setMain((s) => ({ ...s, isLoading: false }));
			unmount();
		}
	}

	function getAddActivityMessage() {
		const changes = [];

		["due_on", "expense", "task"].forEach((fe) => {
			if (task[fe] !== main[fe]) {
				changes.push({
					old: task[fe],
					new: main[fe],
					label: fe === "due_on" ? "Due Date" : MyGlobal.Capitalize(fe),
				});
			}
		});

		const messages = changes.map((m) => `${m.label} from <b>${m.old}</b> to <b>${m.new}</b>`);

		const finalMessage = messages.join(", ");

		return `Edited ${finalMessage} of <b>${task.id}</b> in <b>${task.project_id}</b>.`;
	}

	function setBoxDrag() {
		setMain((s) => ({ ...s, isBoxMoved: !s.isBoxMoved }));
	}

	function setInputs(key, value) {
		setMain((s) => ({ ...s, [key]: value }));
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
				<span className="flex w-full justify-start items-center">Edit Task</span>
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
					<DialogPanel className="w-[400px] h-[510px] transform overflow-hidden rounded contrast-background shadow">
						{uiTitleBar()}
						<div className="flex flex-col w-full h-[calc(100%-45px)] justify-between items-center">
							<div className="flex flex-col w-full h-full p-5 space-y-2.5 justify-start items-center">
								<TextInput
									icon={faListCheck}
									label="Task"
									onChange={(e) => setInputs("task", e.target.value)}
									onKeyPress={() => {}}
									tabIndex={1}
									value={main.task}
									width="w-full"
								/>
								<DatePicker
									icon={faCalendar}
									label="Due On"
									onChange={(e) => setInputs("due_on", e)}
									tabIndex={2}
									value={main.due_on}
									width="w-full"
								/>
								<TextInput
									icon={faCoins}
									label="Expense"
									onChange={(e) => setInputs("expense", e.target.value)}
									onKeyPress={(e) => !MyGlobal.HasNumbers(e.key) && e.preventDefault()}
									tabIndex={3}
									value={main.expense}
									width="w-full"
								/>
							</div>
							<footer className="dialog-footer w-full">
								<button className="primary-button-condensed" onClick={() => doEditing()}>
									{uiButton()}
								</button>
							</footer>
						</div>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}

export function EditTaskStatus({ mount, reload, task, unmount }) {
	// Business Logic
	const [main, setMain] = useState({
		isBoxMoved: false,
		isLoading: false,
		reason: "",
	});

	const titleBarCursor = main.isBoxMoved ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header shadow draggable-handle ${titleBarCursor}`;

	const editButtonClickEvent = main.isLoading || !main.reason ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";

	const editButtonStyle = `primary-button-condensed ${editButtonClickEvent}`;

	let isCompleted = 0;
	let isDisabled = 0;
	let messageBody = "";
	let activityMessage = "";

	switch (task.status) {
		case MyConstants.Statuses.Tasks.Enable:
			activityMessage = `Enabled <b>${task.id}</b> in <b>${task.project_id}</b> due to <b>${main.reason}</b>`;
			messageBody = "Are you sure you want to enable this task?";
			break;
		case MyConstants.Statuses.Tasks.Disable:
			isDisabled = 1;
			activityMessage = `Disabled <b>${task.id}</b> in <b>${task.project_id}</b> due to <b>${main.reason}</b>`;
			messageBody = "Are you sure you want to disable this task?";
			break;
		case MyConstants.Statuses.Tasks.Completed:
			isCompleted = 1;
			activityMessage = `Marked Task as Completed <b>${task.id}</b> in <b>${task.project_id}</b> due to <b>${main.reason}</b>`;
			messageBody = "Are you sure you want to mark this task completed?";
			break;
	}

	// Functions
	async function doEditing() {
		setMain((s) => ({ ...s, isLoading: true }));

		const body = {
			isCompleted,
			isDisabled,
			reason: main.reason,
			taskId: task.id,
			type: "edit-task-status",
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				markAllSubTasksCompleted();
				reload();

				MyGlobal.AddActivity(activityMessage, MyConstants.Modules.Base.Tasks);
				MyGlobal.ShowSuccessToast(MyConstants.Messages.TaskEdited);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Edit Task Status");
		} finally {
			setMain((s) => ({ ...s, isLoading: false, reason: "" }));
			unmount(false);
		}
	}

	async function markAllSubTasksCompleted() {
		if (isCompleted === 1) {
			const body = {
				projectId: task.project_id,
				taskId: task.id,
				type: "mark-all-sub-tasks-completed",
			};

			const response = await axios.post(MyConstants.ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				MyGlobal.AddActivity(`Marked all sub tasks as completed of <b>${task.id}</b> in <b>${task.project_id}</b>`, MyConstants.Modules.Base.Tasks);

				MyGlobal.ShowSuccessToast(MyConstants.Messages.AllSubTasksMarkedCompleted);
			}
		}
	}

	function setBoxDrag() {
		setMain((s) => ({ ...s, isBoxMoved: !s.isBoxMoved }));
	}

	function setReason(reason) {
		setMain((s) => ({ ...s, reason }));
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
				<span className="flex w-full justify-start items-center">Edit Status</span>
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
					<DialogPanel className="w-[400px] transform overflow-hidden rounded contrast-background shadow">
						{uiTitleBar()}
						<span className="flex w-full p-5 font-regular-12 black-text">{messageBody} You are required to write a reason below.</span>
						<div className="flex flex-col w-full px-2.5 pb-5 justify-center items-center">
							<TextArea
								icon={faNoteSticky}
								key={1}
								label="Reason"
								onChange={(e) => setReason(e.target.value)}
								onKeyDown={() => {}}
								rows={3}
								tabIndex={1}
								value={main.reason}
								width="w-full"
							/>
						</div>
						<footer className="dialog-footer">
							<button className={editButtonStyle} onClick={() => doEditing()}>
								{uiButton()}
							</button>
						</footer>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}

export function MarkSubTaskCompleted({ mount, reload, remark, unmount }) {
	// Business Logic
	const [main, setMain] = useState({
		isBoxMoved: false,
		isLoading: false,
		reason: "",
	});

	const disableDeleteButton = main.isLoading || !main.reason ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";
	const disableButtonStyle = `primary-button-condensed ${disableDeleteButton}`;

	const titleBarCursor = main.isBoxMoved ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header shadow draggable-handle ${titleBarCursor}`;

	// Functions
	async function doMarking() {
		setMain((s) => ({ ...s, isLoading: true }));

		const body = {
			projectId: remark.project_id,
			reason: main.reason,
			taskId: remark.task_id,
			taskRowId: remark.id,
			type: "mark-sub-task-completed",
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reload();

				MyGlobal.AddActivity(
					`Marked sub task having <b>${remark.particular}</b> & <b>${remark.remark}</b> as completed of <b>${remark.task_id}</b> in <b>${remark.project_id}</b>`,
					MyConstants.Modules.Base.Tasks,
				);

				MyGlobal.ShowSuccessToast(MyConstants.Messages.SubTaskMarkedCompleted);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Mark Sub Task Completed");
		} finally {
			setMain((s) => ({ ...s, isLoading: false }));
			unmount();
		}
	}

	function setBoxDrag() {
		setMain((s) => ({ ...s, isBoxMoved: !s.isBoxMoved }));
	}

	function setReason(reason) {
		setMain((s) => ({ ...s, reason }));
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
			return "Mark Completed";
		}
	}

	function uiTitleBar() {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">Mark Sub Task Completed</span>
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
						<span className="block w-full p-5 whitespace-pre-line font-regular-11 black-text">
							Are you sure you want to mark this sub task as completed? You are required to write a completion reason below.
						</span>
						<div className="flex flex-col w-full px-2.5 pt-0 pb-5 justify-center items-center">
							<TextArea
								icon={faNoteSticky}
								key={1}
								label="Reason"
								onChange={(e) => setReason(e.target.value)}
								onKeyDown={() => {}}
								rows={3}
								tabIndex={1}
								value={main.reason}
								width="w-full"
							/>
						</div>
						<footer className="dialog-footer">
							<button className={disableButtonStyle} onClick={() => doMarking()}>
								{uiButton()}
							</button>
						</footer>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}
