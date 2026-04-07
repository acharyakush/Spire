"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import "dragula/dist/dragula.css";
import "tippy.js/themes/light.css";
import "tippy.js/animations/shift-away.css";

import axios from "axios";
import dayjs from "dayjs";
import Tippy from "@tippyjs/react";
import { ApiEndpoints, BaseModules, DerivedModules, Messages, Statuses } from "@/utilities/constants";

import { MyGlobal } from "@/utilities/global";
import { useEffect, useRef, useState } from "react";
import { useDragAndDrop } from "@/utilities/useDragAndDrop";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ComboBoxWithChips, DatePicker, TextInputNative } from "@/components/Inputs";
import { AvatarCircle, SpinnerBig, SpinnerSmall, Tooltip } from "@/components/Elements";
import { AddParticularRemark, AddRVExpense, AddTask, DeleteParticularRemark, DeleteTask, EditParticularRemark, EditRVExpense, EditTask, EditTaskStatus, MarkSubTaskCompleted } from "@/modals/singleProject/tasks";
import { faBan, faBars, faBolt, faCalendar, faCheck, faCheckCircle, faCircleCheck, faCircleExclamation, faClipboardCheck, faClock, faListAlt, faPen, faPencil, faPlusCircle, faSortAmountAsc, faSortAmountDesc, faStickyNote, faTrash, faUserGroup } from "@fortawesome/free-solid-svg-icons";
import { NotesHeaders, TasksHeaders, TasksRemarksHeaders } from "@/utilities/headers";
import { escapeString } from "@/utilities/myGlobal";

export default function Tasks({ project }) {
	// Business Logic
	const isUserAdministrator = MyGlobal.IsUserAdministrator();
	const rvHeaders = { date: "Date", description: "Description", amount: "Amount", entryBy: "Entry By", _: "Actions" };

	const tippyReference = useRef(null);
	const assignedToMenuRef = useRef(null);

	const [api, setApi] = useState({
		notes: { copy: [], data: [] },
		rv: { copy: [], data: [] },
		remarks: { copy: [], data: [] },
		tasks: { copy: [], data: [] },
	});

	const [main, setMain] = useState({
		assignedTo: [],
		findText: "",
		selectedModuleId: 1,
		selectedRemark: {},
		selectedRv: {},
		selectedTask: {},
		selectedTaskForActions: {},
		sortRv: { column: rvHeaders.date, isAscending: false },
		sortNotes: { column: TasksRemarksHeaders.DueDate, isAscending: false },
		sortRemarks: { column: TasksRemarksHeaders.DueDate, isAscending: false },
		sortTasks: { column: "", isAscending: false },
	});

	const [mounted, setMounted] = useState({
		addParticularRemark: false,
		addRvExpense: false,
		editRVExpense: false,
		addTask: false,
		deleteParticularRemark: false,
		deleteTask: false,
		editParticularRemark: false,
		editTask: false,
		editTaskStatus: false,
		markSubTaskCompleted: false,
		markTaskCompleted: false,
		assignedToMenu: false,
	});

	const [addRemarksTask, setAddRemarkTask] = useState({});
	const [addRemarksRemark, setAddRemarksRemark] = useState("");
	const [addRemarkTaskDueDate, setAddRemarkTaskDueDate] = useState("");

	const [loading, setLoading] = useState({
		notes: false,
		remark: false,
		sort: false,
		tasks: false,
	});

	const handleDrop = (newOrder) => {
		const updated = newOrder.map((item, index) => ({
			...item,
			sequence: index + 1,
		}));

		updateTaskOrder(updated); // API call or local update
	};

	const { containerRef, draggedItem, handleDragStart, handleDragEnd } = useDragAndDrop({
		items: sortTasks(),
		onDrop: handleDrop,
	});

	const allowDeletingTask = MyGlobal.HasPermission(DerivedModules.DeleteTask);
	const allowDisablingTask = MyGlobal.HasPermission(DerivedModules.DisableTask);
	const allowEditingTask = MyGlobal.HasPermission(DerivedModules.EditTask);
	const allowEnablingTask = MyGlobal.HasPermission(DerivedModules.EnableTask);
	const allowMarkingTaskCompleted = MyGlobal.HasPermission(DerivedModules.MarkTaskCompleted);
	const allowNewTask = MyGlobal.HasPermission(DerivedModules.NewTask);
	const allowDeletingParticularRemark = MyGlobal.HasPermission(DerivedModules.DeleteSubTask);
	const allowEditingSubTask = MyGlobal.HasPermission(DerivedModules.EditSubTask);
	const allowMarkingSubTaskCompleted = MyGlobal.HasPermission(DerivedModules.MarkSubTaskCompleted);

	// Functions
	async function addRemark() {
		setLoading((s) => ({ ...s, remark: true }));

		const body = {
			allotedTo: isUserAdministrator ? main.assignedTo.map((m) => m.id).join(",") : MyGlobal.GetUserId(),
			createdBy: MyGlobal.GetUserId(),
			dueOn: dayjs(addRemarkTaskDueDate).format("YYYY-MM-DD"),
			particular: "",
			projectId: project.id,
			remark: escapeString(addRemarksRemark),
			taskId: addRemarksTask.id,
			type: "add-tasks-particular-remark",
		};

		try {
			const response = await axios.post(ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				getTasks();

				setAddRemarkTask({});
				setAddRemarksRemark("");
				setAddRemarkTaskDueDate("");
				setMain((s) => ({ ...s, assignedTo: [] }));

				MyGlobal.AddActivity(`Added a remark in <b>${project.id}</b>.`, BaseModules.Tasks);
				MyGlobal.ShowSuccessToast(Messages.TaskRemarkAdded);
			} else {
				MyGlobal.ShowErrorToast(Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Tasks > Add Remark");
		} finally {
			setLoading((s) => ({ ...s, remark: false }));
		}
	}

	function detectOutsideClick(event) {
		if (assignedToMenuRef.current && !assignedToMenuRef.current.contains(event.target)) {
			setMounted((s) => ({ ...s, assignedToMenu: false }));
		}
	}

	async function updateTaskOrder(updatedOrder) {
		const currentOrder = sortTasks().map((task) => task.id);
		const newOrder = updatedOrder.map((task) => task.id);

		// 🌶 1. Check if order is really different
		const isSameOrder = currentOrder.every((id, index) => id === newOrder[index]);

		if (isSameOrder) {
			MyGlobal.ShowSuccessToast("Already sorted.");
			return;
		}

		setLoading((s) => ({ ...s, sort: true }));

		try {
			const response = await axios.post(ApiEndpoints.Tasks.SortTasks, MyGlobal.GetHeaders({ updatedOrder }));

			if (response.status === 200) {
				setMain((s) => ({ ...s, sortTasks: { ...s.sortTasks, column: "" } }));
				getTasks();
				MyGlobal.ShowSuccessToast("Sorted successfully.");
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Sort Tasks");
		} finally {
			setLoading((s) => ({ ...s, sort: false }));
		}
	}

	function getSelectedTask() {
		let array = [];

		if (api.tasks.data.length) {
			const result = api.tasks.data.filter((f) => f.project_id == project.id && f.id == main.selectedTask.id);

			if (result.length) {
				array = result;
			}
		}

		return array;
	}

	async function getNotes() {
		setLoading((s) => ({ ...s, notes: true }));

		try {
			const response = await axios.get(ApiEndpoints.Getter, MyGlobal.GetHeaders({ inquiryId: project.inquiry_id, type: "get-tasks-notes" }));

			const notes = response.data.map((m) => {
				return { ...m, entry_by_name: MyGlobal.GetAnyDataFromId(m.entry_by_id, "full_name") };
			});

			console.log(notes);

			setApi((s) => ({ ...s, notes: { copy: notes, data: notes } }));
		} catch (error) {
			MyGlobal.HandleErrors(error, "Get Single Project Notes");
		} finally {
			setLoading((s) => ({ ...s, notes: false }));
		}
	}

	async function getTasks(source) {
		setLoading((s) => ({ ...s, tasks: true }));

		try {
			const tasks = await axios.get(ApiEndpoints.Getter, MyGlobal.GetHeaders({ projectId: project.id, type: "get-tasks" }));

			const tasksDetails = await axios.get(ApiEndpoints.Getter, MyGlobal.GetHeaders({ projectId: project.id, type: "get-tasks-particulars-remarks" }));

			const _tasks = tasks.data.map((m) => {
				const details = tasksDetails.data.filter((f) => f.task_id == m.id && f.project_id == m.project_id);

				return { ...m, particulars_remarks: details };
			});

			const rv = await axios.get(ApiEndpoints.Getter, MyGlobal.GetHeaders({ projectId: project.id, type: "get-project-expenses" }));

			const _tasksRemarks = tasksDetails.data.map((m) => {
				let taskName = "";
				const object = tasks.data.find((f) => f.id == m.task_id);

				if (typeof object === "object") {
					taskName = object.task;
				}

				const entryBy = MyGlobal.GetAnyDataFromId(m.entry_by_id, "full_name");
				return { ...m, entry_by: entryBy, task_name: taskName };
			});

			if (!source) {
				const selectedTask = _tasks.find((f) => f.id === main.selectedTaskForActions.id);

				if (typeof selectedTask === "object") {
					setMain((s) => ({ ...s, selectedTask }));
				}
			}

			setApi((s) => ({
				...s,
				tasks: { copy: _tasks, data: _tasks },
				rv: { copy: rv.data, data: rv.data },
				remarks: { copy: _tasksRemarks, data: _tasksRemarks },
			}));
		} catch (error) {
			MyGlobal.HandleErrors(error, "Get Tasks");
		} finally {
			setLoading((s) => ({ ...s, tasks: false }));
		}
	}

	function handleTaskActionClicks(action) {
		if (typeof action === "function") {
			if (tippyReference.current) {
				tippyReference.current.hide();
			}

			action();
		}
	}

	function setModule(moduleId) {
		setMain((s) => ({ ...s, selectedModuleId: moduleId, selectedTask: {} }));
	}

	function sortNotes() {
		return api.notes.data.sort((a, b) => {
			const aEntryDate = new Date(a.entry_date);
			const bEntryDate = new Date(b.entry_date);

			const { column, isAscending } = main.sortNotes;

			if (column == NotesHeaders.date && isAscending) {
				return aEntryDate - bEntryDate;
			} else if (column == NotesHeaders.date && !isAscending) {
				return bEntryDate - aEntryDate;
			} else if (column == NotesHeaders.note && isAscending) {
				return a.content.localeCompare(b.content);
			} else if (column == NotesHeaders.note && !isAscending) {
				return b.content.localeCompare(a.content);
			} else if (column == NotesHeaders.entryBy && isAscending) {
				return a.entry_by_name.localeCompare(b.entry_by_name);
			} else if (column == NotesHeaders.entryBy && !isAscending) {
				return b.entry_by_name.localeCompare(a.entry_by_name);
			}
		});
	}

	function sortRemarks() {
		return api.remarks.data.sort((a, b) => {
			const aEntryAt = new Date(a.entry_at);
			const bEntryAt = new Date(b.entry_at);

			const { column, isAscending } = main.sortRemarks;

			if (column == TasksRemarksHeaders.Task && isAscending) {
				return a.task_name.localeCompare(b.task_name);
			} else if (column == TasksRemarksHeaders.Task && !isAscending) {
				return b.task_name.localeCompare(a.task_name);
			} else if (column == TasksRemarksHeaders.Remark && isAscending) {
				return a.remark.localeCompare(b.remark);
			} else if (column == TasksRemarksHeaders.Remark && !isAscending) {
				return b.remark.localeCompare(a.remark);
			} else if (column == TasksRemarksHeaders.DueDate && isAscending) {
				return aEntryAt - bEntryAt;
			} else if (column == TasksRemarksHeaders.DueDate && !isAscending) {
				return bEntryAt - aEntryAt;
			} else if (column == TasksRemarksHeaders.WrittenBy && !isAscending) {
				return a.entry_by.localeCompare(b.entry_by);
			} else if (column == TasksRemarksHeaders.WrittenBy && !isAscending) {
				return b.entry_by.localeCompare(a.entry_by);
			}
		});
	}

	function sortRV() {
		return api.rv.data.sort((a, b) => {
			const aEntryDate = new Date(a.entry_at);
			const bEntryDate = new Date(b.entry_at);

			const { column, isAscending } = main.sortRv;

			if (column == rvHeaders.date && isAscending) {
				return aEntryDate - bEntryDate;
			} else if (column == rvHeaders.date && !isAscending) {
				return bEntryDate - aEntryDate;
			} else if (column == rvHeaders.description && isAscending) {
				return a.description.localeCompare(b.description);
			} else if (column == rvHeaders.description && !isAscending) {
				return b.description.localeCompare(a.description);
			} else if (column == rvHeaders.amount && isAscending) {
				return a.expense - b.expense;
			} else if (column == rvHeaders.amount && !isAscending) {
				return b.expense - a.expense;
			}
		});
	}

	function setAllRvSorting(column) {
		setMain((s) => ({ ...s, sortRv: { column, isAscending: !s.sortRv.isAscending } }));
	}

	function setNotesSorting(column) {
		setMain((s) => ({ ...s, sortNotes: { column, isAscending: !s.sortNotes.isAscending } }));
	}

	function setRemarksSorting(column) {
		setMain((s) => ({ ...s, sortRemarks: { column, isAscending: !s.sortRemarks.isAscending } }));
	}

	function setTask(task) {
		setMain((s) => ({ ...s, selectedModuleId: 0, selectedTask: task }));
	}

	function setTaskSorting(column) {
		if (column != TasksHeaders.Actions) {
			setMain((s) => ({ ...s, sortTasks: { column, isAscending: !s.sortTasks.isAscending } }));
		}
	}

	function setAllotedTo(value) {
		let old = [...main.assignedTo];

		if (old.includes(value)) {
			old = old.filter((f) => f !== value);
		} else {
			old.push(value);
		}

		setMain((s) => ({ ...s, assignedTo: old }));
	}

	function sortTasks() {
		if (!main.sortTasks.column)
			return getSelectedTask()
				.at(0)
				?.particulars_remarks?.sort((a, b) => Number(a.sequence) - Number(b.sequence));

		return getSelectedTask()
			.at(0)
			?.particulars_remarks?.sort((a, b) => {
				const aDueDate = new Date(a.due_date);
				const bDueDate = new Date(b.due_date);

				const { column, isAscending } = main.sortTasks;

				if (column == TasksHeaders.Particulars && isAscending) {
					return a.particular.localeCompare(b.particular);
				} else if (column == TasksHeaders.Particulars && !isAscending) {
					return b.particular.localeCompare(a.particular);
				} else if (column == TasksHeaders.Remark && isAscending) {
					return a.remark.localeCompare(b.remark);
				} else if (column == TasksHeaders.Remark && !isAscending) {
					return b.remark.localeCompare(a.remark);
				} else if (column == TasksHeaders.DueDate && isAscending) {
					return aDueDate - bDueDate;
				} else if (column == TasksHeaders.DueDate && !isAscending) {
					return bDueDate - aDueDate;
				}
			});
	}

	function toggleAddParticularRemarkBox() {
		setMounted((s) => ({ ...s, addParticularRemark: !s.addParticularRemark }));
	}

	function toggleAddRVExpenseBox() {
		setMounted((s) => ({ ...s, addRvExpense: !s.addRvExpense }));
	}

	function toggleAddTaskBox() {
		setMounted((s) => ({ ...s, addTask: !s.addTask }));
	}

	function toggleAssignedToMenu() {
		setMounted((s) => ({ ...s, assignedToMenu: !s.assignedToMenu }));
	}

	function toggleDeleteParticularRemarkBox(remark) {
		setMain((s) => ({ ...s, selectedRemark: remark ?? {} }));
		setMounted((s) => ({ ...s, deleteParticularRemark: remark ? true : false }));
	}

	function toggleDeleteTaskBox(task) {
		if (task) {
			if (task.particulars_remarks.length) {
				MyGlobal.ShowErrorToast("Cannot delete task where sub tasks are added.");
			} else {
				setMain((s) => ({ ...s, selectedTaskForActions: task }));
				setMounted((s) => ({ ...s, deleteTask: true }));
			}
		} else {
			setMain((s) => ({ ...s, selectedTaskForActions: {} }));
			setMounted((s) => ({ ...s, deleteTask: false }));
		}
	}

	function toggleEditParticularRemarkBox(remark) {
		setMain((s) => ({ ...s, selectedRemark: remark ?? {} }));
		setMounted((s) => ({ ...s, editParticularRemark: remark ? true : false }));
	}

	function toggleEditRVExpenseBox(remark) {
		setMain((s) => ({ ...s, selectedRv: remark ?? {} }));
		setMounted((s) => ({ ...s, editRVExpense: remark ? true : false }));
	}

	function toggleEditTaskBox(task) {
		const selectedTaskObject = {
			...task,
			due_on: main.selectedTask.due_on,
			expense: main.selectedTask.expense,
			id: main.selectedTask.id,
			project_id: main.selectedTask.project_id,
			rowId: task ? task.id : 0,
			task: main.selectedTask.task,
		};

		setMain((s) => ({ ...s, selectedTaskForActions: selectedTaskObject ?? {} }));
		setMounted((s) => ({ ...s, editTask: task ? true : false }));
	}

	function toggleEditTaskStatusBox(task) {
		setMain((s) => ({ ...s, selectedTaskForActions: task ?? {} }));
		setMounted((s) => ({ ...s, editTaskStatus: task ? true : false }));
	}

	function toggleMarkSubTaskCompletedBox(object) {
		setMain((s) => ({ ...s, selectedRemark: object ?? {} }));
		setMounted((s) => ({ ...s, markSubTaskCompleted: object ? true : false }));
	}

	// UI Components
	function uiMain() {
		if (loading.tasks) {
			return (
				<div className="flex w-full h-full justify-center items-center contrast-background full-border">
					<SpinnerBig />
				</div>
			);
		} else {
			return (
				<>
					<div className="flex flex-col w-full h-full justify-between items-center">
						<div className="flex w-full h-full justify-start items-center">
							<div className="flex flex-col w-[15%] h-full px-2.5 pb-5 space-y-2.5 justify-between items-center">
								{allowNewTask && project.status != Statuses.Projects.Completed && <FontAwesomeIcon className="cursor-pointer primary-text" icon={faPlusCircle} onClick={() => toggleAddTaskBox()} size="xl" />}
								<div className="flex flex-col w-full h-[calc(100vh-315px)] px-5 space-y-2.5 justify-start items-center overflow-y-auto scrollbar-gutter">{uiTaskList()}</div>
								{uiAllRVButton()}
								{uiNotesButton()}
								{uiRemarksButton()}
							</div>
							<div className="flex flex-col w-[85%] h-full mr-5 space-y-2 justify-start items-center rounded shadow contrast-background">{uiSelectedModuleDataContainer()}</div>
						</div>
					</div>
				</>
			);
		}
	}

	function uiNoDataFound() {
		return (
			<div className="flex flex-col w-[85%] h-full space-y-2 justify-center items-center rounded font-regular-12 gray-text contrast-background">
				<FontAwesomeIcon className="text-6xl" icon={faCircleExclamation} />
				<span>No tasks alloted</span>
				<button className="space-x-1.5 primary-button-transparent-background" onClick={() => toggleAddTaskBox()}>
					<FontAwesomeIcon className="primary-text" icon={faPlusCircle} />
					<span>Add</span>
				</button>
			</div>
		);
	}

	function uiNoParticularsRemarksFound() {
		return (
			<div className="flex flex-col w-full h-full space-y-2 justify-center items-center rounded shadow font-regular-12 gray-text contrast-background">
				<span>No sub tasks found.</span>
				<button className="space-x-1.5 primary-button-transparent-background" onClick={() => toggleAddParticularRemarkBox()}>
					<FontAwesomeIcon className="primary-text" icon={faPlusCircle} />
					<span>Add</span>
				</button>
			</div>
		);
	}

	function uiSelectedModuleDataContainer() {
		const isTaskSelected = main.selectedModuleId === -1 || main.selectedModuleId === 1;

		if (main.selectedModuleId !== 2 && !api.remarks.copy.length && !api.tasks.copy.length && !isTaskSelected) {
			return uiNoDataFound();
		}

		if (main.selectedModuleId === 1) {
			return uiRemarks();
		}

		if (!api.remarks.copy.length && main.selectedModuleId === 1) {
			return <span className="flex flex-col w-full h-full space-y-2 justify-center items-center rounded shadow font-medium-12 gray-text contrast-background">No sub tasks found</span>;
		}

		if (main.selectedModuleId === -1) {
			return uiNotes();
		}

		if (main.selectedModuleId === 2) {
			return uiRV();
		}

		if (!api.tasks.data.length) {
			return uiNoDataFound();
		}

		if (Object.keys(main.selectedTask).length) {
			return uiTask();
		}

		if (!main.selectedTask.at?.particulars_remarks?.length) {
			return uiNoParticularsRemarksFound();
		}

		return uiRemarks();
	}

	// Notes
	function uiNotes() {
		return (
			<div className="flex flex-col w-full h-full justify-between items-center contrast-background">
				<div className="flex w-full px-4 justify-center items-center primary-background">{uiNotesHeaders()}</div>
				<div className="flex flex-col w-full h-[calc(100vh-146px)] overflow-y-auto">{sortNotes().map((m, i) => uiNotesRows(m, i))}</div>
			</div>
		);
	}

	function uiNotesButton() {
		const showTotalNotes = api.notes.data.length > 0 ? "font-regular-10 gray-text" : "hidden";

		const selectedAesthetics = main.selectedModuleId == -1 ? "primary-border primary-background-transparent-01 primary-text" : "full-border bg-white black-text";

		const wrapper = `flex w-full h-10 px-5 justify-between items-center rounded shadow ${selectedAesthetics} font-regular-11 hovered-rows`;

		return (
			<button className={wrapper} onClick={() => setModule(-1)}>
				<span>All Notes</span>
				<span className={showTotalNotes}>{api.notes.data.length}</span>
			</button>
		);
	}

	function uiNotesHeaders() {
		return Object.values(NotesHeaders).map((m, i) => {
			const showSortArrow = m == main.sortNotes.column ? "visible" : "invisible";

			return (
				<span className="flex w-1/3 h-9 space-x-1.5 justify-center items-center cursor-pointer text-center text-white font-medium-11" onClick={() => setNotesSorting(m)} key={i}>
					<span>{m}</span>
					<span className={showSortArrow}>{uiNotesHeadersSortArrows(m)}</span>
				</span>
			);
		});
	}

	function uiNotesHeadersSortArrows(column) {
		if (main.sortNotes.column == column) {
			if (main.sortNotes.isAscending) {
				return <FontAwesomeIcon icon={faSortAmountAsc} />;
			} else {
				return <FontAwesomeIcon icon={faSortAmountDesc} />;
			}
		}
	}

	function uiNotesRows(row, i) {
		const style = `flex w-1/3 justify-center items-center whitespace-pre-wrap`;

		return (
			<div className="flex w-full px-4 py-2 justify-center items-center contrast-background bottom-border font-regular-11" key={i}>
				<Tippy animation="shift-away" content={<Tooltip text={dayjs(row.entry_date).format("hh:mm:ss a")} />} placement="bottom">
					<span className={`${style} cursor-help`}>{dayjs(row.entry_date).format("DD MMM, YYYY")}</span>
				</Tippy>

				<span className={style} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(row.content, main.findText) }} />

				<span className={style} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(row.entry_by_name, main.findText) }} />
			</div>
		);
	}

	// Remarks
	function uiAddRemarkTaskAllotedTo() {
		const showMenu = mounted.assignedToMenu ? "flex flex-col w-full max-h-[220px] justify-start items-center absolute rounded overflow-y-auto bottom-shadow bg-white full-border" : "hidden";

		return (
			<div className="w-full" ref={assignedToMenuRef}>
				<ComboBoxWithChips background="bg-white" displayKey="full_name" fontSize="font-regular-10" height="h-[30px]" icon={faUserGroup} iconSize="sm" isMenuInverted={true} label="" onBlur={() => toggleAssignedToMenu()} onItemClick={(e) => setAllotedTo(e)} onSelectedItemClick={(e) => setAllotedTo(e)} padding="p-0" selectedItems={main.assignedTo} showInitials showList={showMenu} source={MyGlobal.GetAllUsers()} toggleMenu={() => toggleAssignedToMenu()} topPosition="-225px" width="w-full" />
			</div>
		);
	}

	function uiAddRemarkTaskButton() {
		return (
			<button className="primary-button-condensed !text-sm" onClick={() => addRemark()}>
				{loading.remark ? <SpinnerSmall /> : "Add"}
			</button>
		);
	}

	function uiAddRemarkTaskMenu() {
		const wrapper = "flex max-w-full min-w-36 h-[30px] px-2.5 space-x-2 justify-start items-center focus:outline-none relative z-40 rounded contrast-background primary-bottom-border-transparent-05 font-regular-10";

		return (
			<Menu as="div" className="flex max-w-full min-w-36 justify-center items-center relative">
				<MenuButton className={wrapper}>
					<FontAwesomeIcon className="primary-text" icon={faListAlt} />
					<span className="gray-text">{addRemarksTask?.task || "Tasks"}</span>
					{/* <FontAwesomeIcon className={showClearCompanyButton} onClick={() => setCompany({})} icon={faMultiply} /> */}
				</MenuButton>
				<MenuItems className="absolute w-full bottom-full mb-2 rounded contrast-background bottom-shadow focus:outline-none z-50">{uiAddRemarkTaskMenuList()}</MenuItems>
			</Menu>
		);
	}

	function uiAddRemarkTaskMenuList() {
		return api.tasks.copy.map((m, i) => {
			const isSelected = m.id == addRemarksTask?.id;
			const aesthetics = isSelected ? "primary-background-transparent-01 primary-text" : "contrast-background black-text";
			const wrapper = `flex w-full p-2 space-x-2.5 justify-between items-center cursor-pointer border-y ${aesthetics} font-regular-10 text-left hovered-rows`;

			return (
				<MenuItem as="div" className={wrapper} key={i} onClick={() => setAddRemarkTask(m)}>
					{m.task}
					{isSelected && <FontAwesomeIcon className="primary-text" icon={faCheck} />}
				</MenuItem>
			);
		});
	}

	function uiAddRemarkTaskRemark() {
		return <TextInputNative id="findBox" icon={faStickyNote} onChange={(e) => setAddRemarksRemark(e.target.value)} onClearButtonClick={() => setAddRemarksRemark("")} placeholder="Remark" showClearButton="invisible" tabIndex="2" value={addRemarksRemark} source="singleProject" width="w-60" />;
	}

	function uiAddRemarkTaskDueDate() {
		return <DatePicker icon={faCalendar} background="bg-white" height="h-[30px]" label="Due Date" iconSize="sm" onChange={(e) => setAddRemarkTaskDueDate(e)} tabIndex={4} showLabel={false} gap="space-x-1" placeholder="Due Date" value={addRemarkTaskDueDate} width="w-60" padding="p-0" fontSize="font-regular-10" />;
	}

	function uiRemarks() {
		return (
			<div className="flex flex-col w-full h-full justify-between items-center contrast-background">
				<div className="flex w-full px-4 justify-center items-center primary-background">{uiRemarksHeaders()}</div>
				<div className="flex flex-col w-full h-[calc(100vh-156px)] justify-between items-center">
					<div className="flex flex-col w-full h-full justify-start items-center overflow-y-auto shadow-md">{sortRemarks().map((m, i) => uiRemarksRows(m, i))}</div>
					<div className="flex w-full p-5 space-x-5 justify-around items-center gray-background-transparent-02">
						{uiAddRemarkTaskMenu()}
						{uiAddRemarkTaskRemark()}
						{uiAddRemarkTaskDueDate()}
						{isUserAdministrator && uiAddRemarkTaskAllotedTo()}
						{uiAddRemarkTaskButton()}
					</div>
				</div>
			</div>
		);
	}

	function uiRemarksButton() {
		const showTotalRemarks = api.remarks.data.length > 0 ? "font-regular-10 gray-text" : "hidden";

		const selectedAesthetics = main.selectedModuleId == 1 ? "primary-border primary-background-transparent-01 primary-text" : "full-border bg-white black-text";

		const wrapper = `flex w-full h-10 px-5 justify-between items-center rounded shadow ${selectedAesthetics} font-regular-11 hovered-rows`;

		return (
			<button className={wrapper} onClick={() => setModule(1)}>
				<span>All Remarks</span>
				<span className={showTotalRemarks}>{api.remarks.data.length}</span>
			</button>
		);
	}

	function uiRemarksHeaders() {
		return Object.values(TasksRemarksHeaders).map((m, i) => {
			const showSortArrow = m === main.sortRemarks.column ? "visible" : "invisible";

			return (
				<span className="flex w-1/5 h-9 space-x-1.5 justify-center items-center cursor-pointer text-center text-white font-medium-11" onClick={() => setRemarksSorting(m)} key={i}>
					<span>{m}</span>
					<span className={showSortArrow}>{uiRemarksHeadersSortArrows(m)}</span>
				</span>
			);
		});
	}

	function uiRemarksHeadersSortArrows(column) {
		if (main.sortRemarks.column == column) {
			if (main.sortRemarks.isAscending) {
				return <FontAwesomeIcon icon={faSortAmountAsc} />;
			} else {
				return <FontAwesomeIcon icon={faSortAmountDesc} />;
			}
		}
	}

	function uiRemarksRows(row, i) {
		const style = `flex w-1/5 justify-center items-center whitespace-pre-wrap`;
		const allotedTo = MyGlobal.GetAnyDataFromId(row.alloted_to, "full_name");

		return (
			<div className="flex w-full px-4 py-2 justify-center items-center contrast-background bottom-border font-regular-11" key={i}>
				<span className={style}>{row.task_name}</span>

				<span className={style} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(row.remark, main.findText) }} />

				<span className={style}>{row.due_date ? dayjs(row.due_date).format("DD MMM, YYYY") : "NA"}</span>
				<span className={`${style} !flex-row space-x-1`}>{row.alloted_to && <AvatarCircle names={String(allotedTo).split(",")} />}</span>

				<span className={style} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(row.entry_by, main.findText) }} />
			</div>
		);
	}

	// RV
	function uiAllRVButton() {
		const showTotalNotes = api.rv.data.length > 0 ? "font-regular-10 gray-text" : "hidden";

		const selectedAesthetics = main.selectedModuleId === 2 ? "primary-border primary-background-transparent-01 primary-text" : "full-border bg-white black-text";

		const wrapper = `flex w-full h-10 px-5 justify-between items-center rounded shadow ${selectedAesthetics} font-regular-11 hovered-rows`;

		return (
			<button className={wrapper} onClick={() => setModule(2)}>
				<span>RV</span>
				<span className={showTotalNotes}>
					{api.rv.data.length} @ {MyGlobal.FormatCurrency(api.rv.data.reduce((p, v) => p + +v.expense, 0))}
				</span>
			</button>
		);
	}

	function uiRV() {
		return (
			<div className="flex flex-col w-full h-full justify-between items-center contrast-background">
				<div className="flex w-full px-4 justify-center items-center primary-background">{uiAllRVHeaders()}</div>
				<div className="flex flex-col w-full h-[calc(100vh-146px)] overflow-y-auto">{sortRV().map((m, i) => uiAllRVRows(m, i))}</div>

				<div className="absolute right-10 bottom-5 cursor-pointer" onClick={() => toggleAddRVExpenseBox()}>
					<FontAwesomeIcon className="primary-text" icon={faPlusCircle} size="3x" />
				</div>
			</div>
		);
	}

	function uiAllRVHeaders() {
		return Object.values(rvHeaders).map((m, i) => {
			const showSortArrow = m == main.sortRv.column ? "visible" : "invisible";

			return (
				<span className="flex w-1/5 h-9 space-x-1.5 justify-center items-center cursor-pointer text-center text-white font-medium-11" onClick={() => setAllRvSorting(m)} key={i}>
					<span>{m}</span>
					<span className={showSortArrow}>{uiAllRVHeadersSortArrows(m)}</span>
				</span>
			);
		});
	}

	function uiAllRVHeadersSortArrows(column) {
		if (main.sortRv.column == column) {
			if (main.sortRv.isAscending) {
				return <FontAwesomeIcon icon={faSortAmountAsc} />;
			} else {
				return <FontAwesomeIcon icon={faSortAmountDesc} />;
			}
		}
	}

	function uiAllRVRows(row, i) {
		const style = `flex w-1/5 justify-center text-center items-center whitespace-pre-wrap`;

		return (
			<div className="flex w-full px-4 py-2 justify-center items-center contrast-background bottom-border font-regular-11" key={i}>
				<span className={style}>{row.entry_date && dayjs(row.entry_date).format("DD MMM, YYYY")}</span>

				<span className={style}>{row.description}</span>
				<span className={style}>{row.expense}</span>

				<span className={style}>{MyGlobal.GetAnyDataFromId(row.entry_by_id, "full_name")}</span>
				<span className={style}>
					<FontAwesomeIcon className="green-text cursor-pointer" icon={faPen} onClick={() => toggleEditRVExpenseBox(row)} size="1x" />
				</span>
			</div>
		);
	}

	// Tasks
	function uiTask() {
		const addSubTaskButton = isUserAdministrator || main.selectedTask.is_completed == 0 ? "absolute right-5 bottom-5 cursor-pointer" : "hidden";

		return (
			<div className="flex flex-col w-full h-[calc(100vh-110px)] justify-start items-center">
				<div className="flex w-full rounded-lg contrast-background">{uiTaskPrimaryInformation()}</div>
				{!sortTasks().length ? (
					uiNoParticularsRemarksFound()
				) : (
					<div className="flex flex-col w-full h-full relative contrast-background">
						<div className="flex w-full px-4 justify-center items-center primary-background">{uiTaskHeaders()}</div>
						<div className="flex flex-col w-full h-[calc(100vh-195px)] overflow-y-auto" ref={containerRef}>
							{sortTasks().map((m, i) => uiTaskRows(m, i))}
						</div>
						<div className={addSubTaskButton} onClick={() => toggleAddParticularRemarkBox()}>
							<FontAwesomeIcon className="primary-text" icon={faPlusCircle} size="3x" />
						</div>
					</div>
				)}
			</div>
		);
	}

	function uiTaskActions(isCompleted, task) {
		if (!isCompleted) {
			const style = "flex w-full py-2 space-x-2.5 justify-start items-center cursor-pointer border-y hovered-rows";

			const noClickAndHalfOpacity = "pointer-events-none opacity-25";
			const clickAndFullOpacity = "pointer-events-auto opacity-100";

			const editTaskStyle = isUserAdministrator ? clickAndFullOpacity : allowEditingTask && (task.is_disabled == 1 || task.is_completed == 1) ? noClickAndHalfOpacity : clickAndFullOpacity;

			const deleteTaskStyle = isUserAdministrator ? clickAndFullOpacity : allowDeletingTask ? clickAndFullOpacity : noClickAndHalfOpacity;

			const enableTaskStyle = isUserAdministrator ? clickAndFullOpacity : allowEnablingTask && task.is_disabled == 1 ? clickAndFullOpacity : noClickAndHalfOpacity;

			const disableTaskStyle = isUserAdministrator ? clickAndFullOpacity : allowDisablingTask && task.is_completed == 0 && task.is_disabled == 0 ? clickAndFullOpacity : noClickAndHalfOpacity;

			let markTaskCompletedStyle = "";

			if (isUserAdministrator) {
				markTaskCompletedStyle = task.is_completed == 0 && task.is_disabled == 0 ? clickAndFullOpacity : noClickAndHalfOpacity;
			} else {
				if (allowMarkingTaskCompleted) {
					markTaskCompletedStyle = task.is_completed == 0 && task.is_disabled == 0 ? clickAndFullOpacity : noClickAndHalfOpacity;
				} else {
					markTaskCompletedStyle = noClickAndHalfOpacity;
				}
			}

			return (
				<Tippy
					animation="shift-away"
					className="relative z-40"
					content={
						<div className="flex flex-col justify-center items-center">
							<div className={`${style} ${editTaskStyle}`} onClick={() => handleTaskActionClicks(() => toggleEditTaskBox(task))}>
								<FontAwesomeIcon className="w-5 primary-text" icon={faPencil} />
								<span>Edit</span>
							</div>
							<div className={`${style} ${deleteTaskStyle}`} onClick={() => handleTaskActionClicks(() => toggleDeleteTaskBox(task))}>
								<FontAwesomeIcon className="w-5 red-text" icon={faTrash} />
								<span>Delete</span>
							</div>
							<div className={`${style} ${enableTaskStyle}`} onClick={() => handleTaskActionClicks(() => toggleEditTaskStatusBox({ ...task, status: Statuses.Tasks.Enable }))}>
								<FontAwesomeIcon className="w-5 green-text" icon={faCheckCircle} />
								<span>Enable</span>
							</div>
							<div className={`${style} ${disableTaskStyle}`} onClick={() => handleTaskActionClicks(() => toggleEditTaskStatusBox({ ...task, status: Statuses.Tasks.Disable }))}>
								<FontAwesomeIcon className="w-5 red-text" icon={faBan} />
								<span>Disable</span>
							</div>
							<div className={`${style} ${markTaskCompletedStyle}`} onClick={() => handleTaskActionClicks(() => toggleEditTaskStatusBox({ ...task, status: Statuses.Tasks.Completed }))}>
								<FontAwesomeIcon className="w-5 green-text" icon={faClipboardCheck} />
								<span>Mark Task Completed</span>
							</div>
						</div>
					}
					interactive
					onCreate={(i) => (tippyReference.current = i)}
					placement="bottom"
					theme="light"
					trigger="click">
					<FontAwesomeIcon className="cursor-pointer font-regular-11 green-text" icon={faBolt} />
				</Tippy>
			);
		}
	}

	function uiTaskHeaders() {
		return Object.values(TasksHeaders).map((m, i) => {
			const showSortArrow = m == main.sortTasks.column && m != TasksHeaders.Actions ? "visible" : "invisible";
			const wrapper = `flex w-1/4 h-10 space-x-1.5 justify-center items-center cursor-pointer text-center text-white font-medium-11`;

			return (
				<span className={wrapper} onClick={() => setTaskSorting(m)} key={i}>
					<span>{m}</span>
					<span className={showSortArrow}>{uiTaskHeadersSortArrows(m)}</span>
				</span>
			);
		});
	}

	function uiTaskHeadersSortArrows(column) {
		if (main.sortTasks.column == column) {
			if (main.sortTasks.isAscending) {
				return <FontAwesomeIcon icon={faSortAmountAsc} />;
			} else {
				return <FontAwesomeIcon icon={faSortAmountDesc} />;
			}
		}
	}

	function uiTaskList() {
		return api.tasks.data.map((m, i) => {
			const totalSubTasks = api.remarks.data.filter((f) => f.task_id == m.id).length;

			const taskName = String(m.task);
			const trimTaskName = taskName.length > 8;
			const _taskName = trimTaskName ? `${taskName.substring(0, 6)}...` : taskName;

			const iconColour = m.is_completed == 1 ? "green-text" : "red-text";

			const icon = m.is_completed == 1 ? <FontAwesomeIcon className={iconColour} icon={faCircleCheck} size="lg" /> : m.is_disabled == 1 ? <FontAwesomeIcon className={iconColour} icon={faBan} size="lg" /> : "";

			const selectedTaskStyle = m.id == main.selectedTask?.id ? "primary-border primary-background-transparent-01 primary-text" : "full-border bg-white black-text";

			const wrapper = `flex w-full h-10 pl-5 pr-3 justify-between items-center rounded shadow ${selectedTaskStyle} font-regular-11 hovered-rows`;

			return (
				<Tippy animation="shift-away" className="font-regular-11" content={taskName} disabled={!trimTaskName} placement="right">
					<div className="flex w-full space-x-3 justify-start items-center relative">
						<span className="absolute -left-5">{icon}</span>
						<button className={wrapper} key={i} onClick={() => setTask(m)}>
							<div className="flex w-4/5 justify-start items-center">
								<span>{_taskName}</span>
							</div>
							{totalSubTasks > 0 && <span className="flex w-1/5 justify-end items-center font-regular-10 gray-text">{totalSubTasks}</span>}
						</button>
					</div>
				</Tippy>
			);
		});
	}

	function uiTaskPrimaryInformation() {
		const selectedTask = api.tasks.data.find((f) => f.id == main.selectedTask.id);
		const isSelectedTaskDefined = typeof selectedTask === "object";

		const isCompleted = isSelectedTaskDefined ? selectedTask.is_completed : false;
		const task = isSelectedTaskDefined ? selectedTask.task : "";
		const expense = isSelectedTaskDefined ? MyGlobal.ThousandSeparator(selectedTask.expense) : 0;

		const entryAt = isSelectedTaskDefined ? dayjs(selectedTask.entry_at).format("DD/MM/YYYY") : "";

		return (
			<div className="flex w-full px-4 py-2 justify-between items-center bottom-border">
				<div className="flex space-x-2.5 justify-center items-center font-medium-14">
					<span>{task}</span>
					{uiTaskActions(isCompleted, main.selectedTask)}
				</div>
				<div className="flex space-x-2.5 justify-end items-center">
					{/* <div className="flex !px-2 space-x-2 justify-between items-center green-tag-transparent-02">
						<FontAwesomeIcon
							icon={faIndianRupee}
							size="lg"
						/>
						<span className="font-regular-10">{expense}</span>
					</div> */}
					<div className="flex !pl-2 space-x-2 justify-between items-center primary-tag-transparent-01">
						<FontAwesomeIcon icon={faClock} size="lg" />
						<span className="w-[80px] font-regular-10">{entryAt}</span>
					</div>
				</div>
			</div>
		);
	}

	function uiTaskRows(row, i) {
		const style = "flex w-1/4 justify-center items-center whitespace-pre-wrap";

		const deleteSubTaskStyle = allowDeletingParticularRemark && row.is_completed == 0 ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-25";

		const editSubTaskStyle = allowEditingSubTask && row.is_completed == 0 ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-25";

		const markSubTaskCompletedStyle = allowMarkingSubTaskCompleted && row.is_completed == 0 ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-25";

		return (
			<div className={`flex w-full px-4 py-2 justify-center items-center contrast-background border-y font-regular-11 transition-all duration-200 `} key={row.id} data-id={row.id}>
				<span className="drag-handle cursor-grab px-2">
					<FontAwesomeIcon icon={faBars} className="text-gray-500" />
				</span>

				<span className={style} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(row.particular, main.findText) }} />

				<span className={style} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(row.remark, main.findText) }} />

				<span className={style}>{row.due_date ? dayjs(row.due_date).format("DD-MM-YYYY") : "NA"}</span>

				<span className={style}>
					<div className="flex space-x-5 justify-center items-center">
						<div className={`${style} ${editSubTaskStyle}`} onClick={() => toggleEditParticularRemarkBox(row)}>
							<FontAwesomeIcon className="w-5 cursor-pointer primary-text" icon={faPencil} size="lg" />
						</div>
						<div className={`${style} ${deleteSubTaskStyle}`} onClick={() => toggleDeleteParticularRemarkBox(row)}>
							<FontAwesomeIcon className="w-5 cursor-pointer red-text" icon={faTrash} size="lg" />
						</div>
						<div className={`${style} ${markSubTaskCompletedStyle}`} onClick={() => toggleMarkSubTaskCompletedBox(row)}>
							<FontAwesomeIcon className="w-5 cursor-pointer green-text" icon={faCircleCheck} size="lg" />
						</div>
					</div>
				</span>
			</div>
		);
	}

	// Hooks
	useEffect(() => {
		getNotes();
		getTasks("mount");
	}, []);

	useEffect(() => {
		if (mounted.assignedToMenu) {
			document.addEventListener("mousedown", detectOutsideClick);
		}

		return () => document.removeEventListener("mousedown", detectOutsideClick);
	}, [mounted.assignedToMenu]);

	// Main UI
	return (
		<>
			{uiMain()}

			{mounted.addParticularRemark && <AddParticularRemark mount={mounted.addParticularRemark} reload={getTasks} task={main.selectedTask} unmount={toggleAddParticularRemarkBox} />}

			{mounted.addRvExpense && <AddRVExpense mount={mounted.addRvExpense} reload={getTasks} project={project} tasks={api.tasks.copy} unmount={toggleAddRVExpenseBox} />}

			{mounted.addTask && <AddTask mount={mounted.addTask} reload={getTasks} project={project} tasks={api.tasks.copy} unmount={toggleAddTaskBox} />}

			{mounted.deleteParticularRemark && <DeleteParticularRemark mount={mounted.deleteParticularRemark} reload={getTasks} task={main.selectedRemark} unmount={toggleDeleteParticularRemarkBox} />}

			{mounted.deleteTask && <DeleteTask mount={mounted.deleteTask} reload={getTasks} task={main.selectedTaskForActions} unmount={toggleDeleteTaskBox} />}

			{mounted.editRVExpense && <EditRVExpense mount={mounted.editRVExpense} reload={getTasks} project={project} rv={main.selectedRv} unmount={toggleEditRVExpenseBox} />}

			{mounted.editParticularRemark && <EditParticularRemark mount={mounted.editParticularRemark} reload={getTasks} task={main.selectedRemark} unmount={toggleEditParticularRemarkBox} />}

			{mounted.editTask && <EditTask mount={mounted.editTask} reload={getTasks} task={main.selectedTaskForActions} unmount={toggleEditTaskBox} />}

			{mounted.editTaskStatus && <EditTaskStatus mount={mounted.editTaskStatus} reload={getTasks} task={main.selectedTaskForActions} unmount={toggleEditTaskStatusBox} />}

			{mounted.markSubTaskCompleted && <MarkSubTaskCompleted mount={mounted.markSubTaskCompleted} reload={getTasks} remark={main.selectedRemark} unmount={toggleMarkSubTaskCompletedBox} />}
		</>
	);
}
