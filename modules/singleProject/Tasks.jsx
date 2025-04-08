"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import "dragula/dist/dragula.css";
import "tippy.js/themes/light.css";
import "tippy.js/animations/shift-away.css";

import axios from "axios";
import dayjs from "dayjs";
import Tippy from "@tippyjs/react";
import dynamic from "next/dynamic";
import MyConstants from "@/utilities/constants";

import { MyGlobal } from "@/utilities/global";
import { useEffect, useRef, useState } from "react";
import { SpinnerBig, Tooltip } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AddParticularRemark, AddTask, DeleteParticularRemark, DeleteTask, EditParticularRemark, EditTask, EditTaskStatus, MarkSubTaskCompleted } from "@/modals/singleProject/tasks";
import {
	faBan,
	faBars,
	faBolt,
	faCheckCircle,
	faCircleCheck,
	faCircleExclamation,
	faClipboardCheck,
	faClock,
	faIndianRupee,
	faPencil,
	faPlusCircle,
	faSortAmountAsc,
	faSortAmountDesc,
	faStopwatch,
	faTrash,
} from "@fortawesome/free-solid-svg-icons";

const Dragula = dynamic(() => import("dragula"), { ssr: false });

export default function Tasks({ project }) {
	// Business Logic
	const isUserAdministrator = MyGlobal.IsUserAdministrator();
	const notesHeaders = MyConstants.TableHeaders.Notes;
	const remarksHeaders = MyConstants.TableHeaders.TasksRemarks;
	const taskHeaders = MyConstants.TableHeaders.Tasks;

	const tippyReference = useRef(null);
	const tasksReference = useRef(null);

	const [api, setApi] = useState({
		notes: { copy: [], data: [] },
		remarks: { copy: [], data: [] },
		tasks: { copy: [], data: [] },
	});

	const [main, setMain] = useState({
		findText: "",
		selectedModuleId: 1,
		selectedRemark: {},
		selectedTask: {},
		selectedTaskForActions: {},
		sortNotes: { column: remarksHeaders.Date, isAscending: false },
		sortRemarks: { column: remarksHeaders.Date, isAscending: false },
		sortTasks: { column: "", isAscending: false },
	});

	const [mounted, setMounted] = useState({
		addParticularRemark: false,
		addTask: false,
		deleteParticularRemark: false,
		deleteTask: false,
		editParticularRemark: false,
		editTask: false,
		editTaskStatus: false,
		markSubTaskCompleted: false,
		markTaskCompleted: false,
	});

	const [loading, setLoading] = useState({
		notes: false,
		sort: false,
		tasks: false,
	});

	const allowDeletingTask = MyGlobal.HasPermission(MyConstants.Modules.Derived.DeleteTask);
	const allowDisablingTask = MyGlobal.HasPermission(MyConstants.Modules.Derived.DisableTask);
	const allowEditingTask = MyGlobal.HasPermission(MyConstants.Modules.Derived.EditTask);
	const allowEnablingTask = MyGlobal.HasPermission(MyConstants.Modules.Derived.EnableTask);
	const allowMarkingTaskCompleted = MyGlobal.HasPermission(MyConstants.Modules.Derived.MarkTaskCompleted);
	const allowNewTask = MyGlobal.HasPermission(MyConstants.Modules.Derived.NewTask);
	const allowDeletingParticularRemark = MyGlobal.HasPermission(MyConstants.Modules.Derived.DeleteSubTask);
	const allowEditingSubTask = MyGlobal.HasPermission(MyConstants.Modules.Derived.EditSubTask);
	const allowMarkingSubTaskCompleted = MyGlobal.HasPermission(MyConstants.Modules.Derived.MarkSubTaskCompleted);

	// Functions
	async function updateTaskOrder(updatedOrder) {
		setLoading((s) => ({ ...s, sort: true }));

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.Tasks.SortTasks, MyGlobal.GetHeaders({ updatedOrder }));

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
			const response = await axios.get(MyConstants.ApiEndpoints.Getter, MyGlobal.GetHeaders({ inquiryId: project.inquiry_id, type: "get-tasks-notes" }));

			const notes = response.data.map((m) => {
				return { ...m, entry_by_name: MyGlobal.GetAnyDataFromId(m.entry_by_id, "full_name") };
			});

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
			const tasks = await axios.get(MyConstants.ApiEndpoints.Getter, MyGlobal.GetHeaders({ projectId: project.id, type: "get-tasks" }));

			const tasksDetails = await axios.get(MyConstants.ApiEndpoints.Getter, MyGlobal.GetHeaders({ projectId: project.id, type: "get-tasks-particulars-remarks" }));

			const _tasks = tasks.data.map((m) => {
				const details = tasksDetails.data.filter((f) => f.task_id == m.id && f.project_id == m.project_id);

				return { ...m, particulars_remarks: details };
			});

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

			if (column == notesHeaders.date && isAscending) {
				return aEntryDate - bEntryDate;
			} else if (column == notesHeaders.date && !isAscending) {
				return bEntryDate - aEntryDate;
			} else if (column == notesHeaders.note && isAscending) {
				return a.content.localeCompare(b.content);
			} else if (column == notesHeaders.note && !isAscending) {
				return b.content.localeCompare(a.content);
			} else if (column == notesHeaders.entryBy && isAscending) {
				return a.entry_by_name.localeCompare(b.entry_by_name);
			} else if (column == notesHeaders.entryBy && !isAscending) {
				return b.entry_by_name.localeCompare(a.entry_by_name);
			}
		});
	}

	function sortRemarks() {
		return api.remarks.data.sort((a, b) => {
			const aEntryAt = new Date(a.entry_at);
			const bEntryAt = new Date(b.entry_at);

			const { column, isAscending } = main.sortRemarks;

			if (column == remarksHeaders.Task && isAscending) {
				return a.task_name.localeCompare(b.task_name);
			} else if (column == remarksHeaders.Task && !isAscending) {
				return b.task_name.localeCompare(a.task_name);
			} else if (column == remarksHeaders.Remark && isAscending) {
				return a.remark.localeCompare(b.remark);
			} else if (column == remarksHeaders.Remark && !isAscending) {
				return b.remark.localeCompare(a.remark);
			} else if (column == remarksHeaders.Date && isAscending) {
				return aEntryAt - bEntryAt;
			} else if (column == remarksHeaders.Date && !isAscending) {
				return bEntryAt - aEntryAt;
			} else if (column == remarksHeaders.WrittenBy && !isAscending) {
				return a.entry_by.localeCompare(b.entry_by);
			} else if (column == remarksHeaders.WrittenBy && !isAscending) {
				return b.entry_by.localeCompare(a.entry_by);
			}
		});
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
		if (column != taskHeaders.Actions) {
			setMain((s) => ({ ...s, sortTasks: { column, isAscending: !s.sortTasks.isAscending } }));
		}
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

				if (column == taskHeaders.Particulars && isAscending) {
					return a.particular.localeCompare(b.particular);
				} else if (column == taskHeaders.Particulars && !isAscending) {
					return b.particular.localeCompare(a.particular);
				} else if (column == taskHeaders.Remark && isAscending) {
					return a.remark.localeCompare(b.remark);
				} else if (column == taskHeaders.Remark && !isAscending) {
					return b.remark.localeCompare(a.remark);
				} else if (column == taskHeaders.DueDate && isAscending) {
					return aDueDate - bDueDate;
				} else if (column == taskHeaders.DueDate && !isAscending) {
					return bDueDate - aDueDate;
				}
			});
	}

	function toggleAddParticularRemarkBox() {
		setMounted((s) => ({ ...s, addParticularRemark: !s.addParticularRemark }));
	}

	function toggleAddTaskBox() {
		setMounted((s) => ({ ...s, addTask: !s.addTask }));
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
								{allowNewTask && project.status != MyConstants.Statuses.Projects.Completed && <FontAwesomeIcon className="cursor-pointer primary-text" icon={faPlusCircle} onClick={() => toggleAddTaskBox()} size="xl" />}
								<div className="flex flex-col w-full h-[calc(100vh-265px)] px-5 space-y-2.5 justify-start items-center overflow-y-auto scrollbar-gutter">{uiTaskList()}</div>
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

		if (!api.remarks.copy.length && !api.tasks.copy.length && !isTaskSelected) {
			return uiNoDataFound();
		}

		if (!api.remarks.copy.length && main.selectedModuleId === 1) {
			return <span className="flex flex-col w-full h-full space-y-2 justify-center items-center rounded shadow font-medium-12 gray-text contrast-background">No sub tasks found</span>;
		}

		if (main.selectedModuleId === -1) {
			return uiNotes();
		}

		if (main.selectedModuleId === 1) {
			return uiRemarks();
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

	// Remarks
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
		return Object.values(notesHeaders).map((m, i) => {
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
				<Tippy animation="shift-away" content={<Tooltip text={dayjs(row.entry_at).format("hh:mm:ss a")} />} placement="bottom">
					<span className={`${style} cursor-help`}>{dayjs(row.entry_at).format("DD MMM, YYYY")}</span>
				</Tippy>

				<span className={style} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(row.content, main.findText) }} />

				<span className={style} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(row.entry_by_name, main.findText) }} />
			</div>
		);
	}

	// Remarks
	function uiRemarks() {
		return (
			<div className="flex flex-col w-full h-full justify-between items-center contrast-background">
				<div className="flex w-full px-4 justify-center items-center primary-background">{uiRemarksHeaders()}</div>
				<div className="flex flex-col w-full h-[calc(100vh-146px)] overflow-y-auto">{sortRemarks().map((m, i) => uiRemarksRows(m, i))}</div>
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
		return Object.values(remarksHeaders).map((m, i) => {
			const showSortArrow = m == main.sortRemarks.column ? "visible" : "invisible";

			return (
				<span className="flex w-1/4 h-9 space-x-1.5 justify-center items-center cursor-pointer text-center text-white font-medium-11" onClick={() => setRemarksSorting(m)} key={i}>
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
		const style = `flex w-1/4 justify-center items-center whitespace-pre-wrap`;

		return (
			<div className="flex w-full px-4 py-2 justify-center items-center contrast-background bottom-border font-regular-11" key={i}>
				<span className={style}>{row.task_name}</span>

				<span className={style} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(row.remark, main.findText) }} />

				<Tippy content={<Tooltip text={dayjs(row.entry_at).format("hh:mm:ss a")} />} placement="bottom">
					<span className={style}>{dayjs(row.entry_at).format("DD MMM, YYYY")}</span>
				</Tippy>

				<span className={style} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(row.entry_by, main.findText) }} />
			</div>
		);
	}

	// Tasks
	function uiTask() {
		const addSubTaskButton = main.selectedTask.is_completed == 0 ? "absolute right-5 bottom-5 cursor-pointer" : "hidden";

		return (
			<div className="flex flex-col w-full h-[calc(100vh-110px)] justify-start items-center">
				<div className="flex w-full rounded-lg contrast-background">{uiTaskPrimaryInformation()}</div>
				{!sortTasks().length ? (
					uiNoParticularsRemarksFound()
				) : (
					<div className="flex flex-col w-full h-full relative contrast-background">
						<div className="flex w-full px-4 justify-center items-center primary-background">{uiTaskHeaders()}</div>
						<div className="flex flex-col w-full h-[calc(100vh-195px)] overflow-y-auto" ref={tasksReference}>
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
		if (!isCompleted || isUserAdministrator) {
			const style = "flex w-full py-2 space-x-2.5 justify-start items-center cursor-pointer border-y hovered-rows";

			const noClickAndHalfOpacity = "pointer-events-none opacity-25";
			const clickAndFullOpacity = "pointer-events-auto opacity-100";

			const editTaskStyle = isUserAdministrator ? clickAndFullOpacity : allowEditingTask && (task.is_disabled == 1 || task.is_completed == 1) ? noClickAndHalfOpacity : clickAndFullOpacity;

			const deleteTaskStyle = isUserAdministrator ? clickAndFullOpacity : allowDeletingTask ? clickAndFullOpacity : noClickAndHalfOpacity;

			const enableTaskStyle = isUserAdministrator ? clickAndFullOpacity : allowEnablingTask && task.is_disabled == 1 ? clickAndFullOpacity : noClickAndHalfOpacity;

			const disableTaskStyle = isUserAdministrator ? clickAndFullOpacity : allowDisablingTask && task.is_completed == 0 && task.is_disabled == 0 ? clickAndFullOpacity : noClickAndHalfOpacity;

			const markTaskCompletedStyle = isUserAdministrator && allowMarkingTaskCompleted && task.is_completed == 0 && task.is_disabled == 0 ? clickAndFullOpacity : noClickAndHalfOpacity;

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
							<div className={`${style} ${enableTaskStyle}`} onClick={() => handleTaskActionClicks(() => toggleEditTaskStatusBox({ ...task, status: MyConstants.Statuses.Tasks.Enable }))}>
								<FontAwesomeIcon className="w-5 green-text" icon={faCheckCircle} />
								<span>Enable</span>
							</div>
							<div className={`${style} ${disableTaskStyle}`} onClick={() => handleTaskActionClicks(() => toggleEditTaskStatusBox({ ...task, status: MyConstants.Statuses.Tasks.Disable }))}>
								<FontAwesomeIcon className="w-5 red-text" icon={faBan} />
								<span>Disable</span>
							</div>
							<div className={`${style} ${markTaskCompletedStyle}`} onClick={() => handleTaskActionClicks(() => toggleEditTaskStatusBox({ ...task, status: MyConstants.Statuses.Tasks.Completed }))}>
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
		return Object.values(taskHeaders).map((m, i) => {
			const showSortArrow = m == main.sortTasks.column && m != taskHeaders.Actions ? "visible" : "invisible";
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
		const dueOn = isSelectedTaskDefined ? dayjs(selectedTask.due_on).format("DD/MM/YYYY") : "";

		return (
			<div className="flex w-full px-4 py-2 justify-between items-center bottom-border">
				<div className="flex space-x-2.5 justify-center items-center font-medium-14">
					<span>{task}</span>
					{uiTaskActions(isCompleted, main.selectedTask)}
				</div>
				<div className="flex space-x-2.5 justify-between items-center">
					<div className="flex !px-2 space-x-2 justify-between items-center green-tag-transparent-02">
						<FontAwesomeIcon icon={faIndianRupee} size="lg" />
						<span className="font-regular-10">{expense}</span>
					</div>
					<div className="flex !pl-2 space-x-2 justify-between items-center primary-tag-transparent-01">
						<FontAwesomeIcon icon={faClock} size="lg" />
						<span className="w-[80px] font-regular-10">{entryAt}</span>
					</div>
					<div className="flex !pl-2 space-x-2 justify-between items-center red-tag-transparent-01">
						<FontAwesomeIcon icon={faStopwatch} size="lg" />
						<span className="w-[80px] font-regular-10">{dueOn}</span>
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
			<div className="flex w-full px-4 py-2 justify-center items-center contrast-background border-y font-regular-11" key={row.id} data-id={row.id}>
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
		if (api.tasks.data.length && tasksReference.current) {
			requestAnimationFrame(() => {
				if (dragula) {
					const drake = dragula([tasksReference.current]);

					drake.on("drop", (el, target, source, sibling) => {
						const reorderedTasks = Array.from(tasksReference.current.children).map((i) => i.getAttribute("data-id"));

						const newTasks = reorderedTasks.map((m, i) => {
							const exists = sortTasks().filter((t) => t.id === Number(m));

							if (exists.length) {
								return { ...exists.at(0), sequence: i + 1 };
							}
						});

						updateTaskOrder(newTasks);
					});

					return () => drake.destroy();
				}
			});
		}
	}, [getSelectedTask()]);

	// Main UI
	return (
		<>
			{uiMain()}

			{mounted.addParticularRemark && <AddParticularRemark mount={mounted.addParticularRemark} reload={getTasks} task={main.selectedTask} unmount={toggleAddParticularRemarkBox} />}

			{mounted.addTask && <AddTask mount={mounted.addTask} reload={getTasks} project={project} tasks={api.tasks.copy} unmount={toggleAddTaskBox} />}

			{mounted.deleteParticularRemark && <DeleteParticularRemark mount={mounted.deleteParticularRemark} reload={getTasks} task={main.selectedRemark} unmount={toggleDeleteParticularRemarkBox} />}

			{mounted.deleteTask && <DeleteTask mount={mounted.deleteTask} reload={getTasks} task={main.selectedTaskForActions} unmount={toggleDeleteTaskBox} />}

			{mounted.editParticularRemark && <EditParticularRemark mount={mounted.editParticularRemark} reload={getTasks} task={main.selectedRemark} unmount={toggleEditParticularRemarkBox} />}

			{mounted.editTask && <EditTask mount={mounted.editTask} reload={getTasks} task={main.selectedTaskForActions} unmount={toggleEditTaskBox} />}

			{mounted.editTaskStatus && <EditTaskStatus mount={mounted.editTaskStatus} reload={getTasks} task={main.selectedTaskForActions} unmount={toggleEditTaskStatusBox} />}

			{mounted.markSubTaskCompleted && <MarkSubTaskCompleted mount={mounted.markSubTaskCompleted} reload={getTasks} remark={main.selectedRemark} unmount={toggleMarkSubTaskCompletedBox} />}
		</>
	);
}
