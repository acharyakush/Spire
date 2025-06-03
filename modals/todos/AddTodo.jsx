"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import dayjs from "dayjs";
import axios from "axios";
import Draggable from "react-draggable";
import MyConstants from "@/utilities/constants";

import { MyGlobal } from "@/utilities/global";
import { Spinner } from "@/components/Elements";
import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { ComboBox2, ComboBoxWithChips, DatePicker, TextArea } from "@/components/Inputs";
import { faCalendar, faNoteSticky, faStar, faUserGroup, faXmark } from "@fortawesome/free-solid-svg-icons";

export default function AddTodo({ mount, refresh, unmount }) {
	// Business Logic
	const assignedToMenuRef = useRef(null);

	const [data, setData] = useState({
		assignedTo: [],
		description: "",
		dueDate: "",
		priority: "Medium",
	});

	const [isLoading, setIsLoading] = useState(false);
	const [isBoxDragged, setIsBoxDragged] = useState(false);

	const [mounted, setMounted] = useState({ assignedToMenu: false });

	const disableAddButton = isLoading || !data.description || !data.assignedTo.length ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";
	const addButtonStyle = `primary-button-condensed ${disableAddButton}`;

	// Functions
	async function addTodo() {
		try {
			setIsLoading(true);

			const body = {
				description: data.description,
				assignedTo: data.assignedTo.map((m) => m.id).join(","),
				dueDate: data.dueDate,
				priority: data.priority,
				userId: MyGlobal.GetUserId(),
			};

			const response = await axios.post(MyConstants.ApiEndpoints.Todos.AddTodo, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				refresh();

				const assignedTos = data.assignedTo.map((m) => m.full_name).join(", ");

				let activityMessage = `Added <b>${data.description}</b> for <b>${assignedTos}</b> on <b>${data.priority}</b> basis.`;

				if (data.dueDate) {
					activityMessage = `Added <b>${data.description}</b> for <b>${assignedTos}</b> to be completed by <b>${dayjs(data.dueDate).format("DD/MM/YYYY")}</b> on <b>${data.priority}</b> basis.`;
				}

				MyGlobal.AddActivity(activityMessage, MyConstants.Modules.Base.Todos);
				MyGlobal.ShowSuccessToast(MyConstants.Messages.TodoAdded);

				unmount();
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Todos > Add Todo");
		} finally {
			setIsLoading(false);
		}
	}

	function detectOutsideClick(event) {
		if (assignedToMenuRef.current && !assignedToMenuRef.current.contains(event.target)) {
			setMounted((s) => ({ ...s, assignedToMenu: false }));
		}
	}

	function setValues(key, value) {
		if (key === "assignedTo") {
			const old = [...data.assignedTo];
			old.push(value);

			setData((s) => ({ ...s, assignedTo: old }));
		} else {
			setData((s) => ({ ...s, [key]: value }));
		}
	}

	function toggleAssignedToMenu() {
		setMounted((s) => ({ ...s, assignedToMenu: !s.assignedToMenu }));
	}

	// UI Components
	function uiAddButton() {
		if (isLoading) {
			return (
				<span className="px-3.5">
					<Spinner />
				</span>
			);
		} else {
			return "Add";
		}
	}

	function uiAssignedTo() {
		const showMenu = mounted.assignedToMenu ? "flex flex-col w-[98%] max-h-[220px] justify-start items-center absolute rounded overflow-y-auto bottom-shadow primary-light-background full-border" : "hidden";

		return (
			<div className="w-full" ref={assignedToMenuRef}>
				<ComboBoxWithChips
					displayKey="full_name"
					label="Assigned To"
					icon={faUserGroup}
					isMenuInverted
					onBlur={() => toggleAssignedToMenu()}
					onItemClick={(e) => setValues("assignedTo", e)}
					onSelectedItemClick={(e) => setValues("assignedTo", e)}
					selectedItems={data.assignedTo}
					showList={showMenu}
					source={MyGlobal.GetAllUsers()}
					toggleMenu={() => toggleAssignedToMenu()}
				/>
			</div>
		);
	}

	function uiDueDate() {
		return <DatePicker icon={faCalendar} label="Due Date" onChange={(e) => setValues("dueDate", e)} tabIndex={3} value={data.dueDate} width="w-full" />;
	}

	function uiPriority() {
		return (
			<ComboBox2
				allowCreatingNewItem
				comparingValue1=""
				comparingValue2={data.priority}
				displayValue=""
				filteredData={["Low", "Medium", "High"]}
				icon={faStar}
				isReadOnly={false}
				label="Priority"
				onChange={(e) => setValues("priority", e)}
				onClick={() => {}}
				onInputChange={() => {}}
				onKeyPress={() => {}}
				searchedItem={{}}
				tabIndex={4}
				value={data.priority}
				width="w-full"
			/>
		);
	}

	function uiTitleBar() {
		const titleBarCursor = isBoxDragged ? "cursor-grabbing" : "cursor-grab";
		const titleBarStyle = `dialog-header shadow draggable-handle ${titleBarCursor}`;

		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">Add To-Do</span>
				<FontAwesomeIcon className="cursor-pointer" icon={faXmark} onClick={() => unmount()} />
			</DialogTitle>
		);
	}

	// Hooks
	useEffect(() => {
		if (mounted.assignedToMenu) {
			document.addEventListener("mousedown", detectOutsideClick);
		}

		return () => document.removeEventListener("mousedown", detectOutsideClick);
	}, [mounted.assignedToMenu]);

	// Main UI
	return (
		<Dialog as="div" className="relative z-50" open={mount} onClose={() => unmount()}>
			<div className="fixed inset-0 bg-black/50" />
			<div className="flex w-full justify-center items-center fixed inset-0 overflow-y-auto">
				<Draggable handle=".draggable-handle" onStart={() => setIsBoxDragged(!isBoxDragged)} onStop={() => setIsBoxDragged(!isBoxDragged)}>
					<DialogPanel className="w-1/2 transform overflow-hidden rounded contrast-background shadow">
						{uiTitleBar()}
						<div className="flex flex-col w-full p-6 space-y-3 justify-between items-center">
							<TextArea icon={faNoteSticky} key={1} label="Description" onChange={(e) => setValues("description", e.target.value)} onKeyDown={() => {}} rows={3} tabIndex={1} value={data.description} width="w-full" />
							{uiAssignedTo()}
							{uiDueDate()}
							{uiPriority()}
						</div>
						<footer className="dialog-footer">
							<button className={addButtonStyle} onClick={() => addTodo()}>
								{uiAddButton()}
							</button>
						</footer>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}
