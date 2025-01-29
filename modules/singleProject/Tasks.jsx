"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import "tippy.js/themes/light.css";

import axios from "axios";
import dayjs from "dayjs";
import Tippy from "@tippyjs/react";
import MyConstants from "@/utilities/constants";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { SpinnerBig } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	AddParticularRemark,
	AddTask,
	DeleteParticularRemark,
	DeleteTask,
	EditParticularRemark,
	EditTask,
	EditTaskStatus,
	MarkSubTaskCompleted,
} from "@/modals/singleProject/tasks";
import {
	faBan,
	faBolt,
	faCheckCircle,
	faCircleCheck,
	faCircleExclamation,
	faClipboardCheck,
	faIndianRupee,
	faPencil,
	faPlusCircle,
	faSortAmountAsc,
	faSortAmountDesc,
	faStopwatch,
	faTrash,
} from "@fortawesome/free-solid-svg-icons";

export default function Tasks({ project }) {
	// Business Logic
	const isUserAdministrator = MyGlobal.IsUserAdministrator();
	const remarksHeaders = MyConstants.TableHeaders.TasksRemarks;
	const taskHeaders = MyConstants.TableHeaders.Tasks;

	const [api, setApi] = useState({
		remarks: { copy: [], data: [] },
		tasks: { copy: [], data: [] },
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

	const [main, setMain] = useState({
		findText: "",
		isLoading: false,
		selectedModuleId: 1,
		selectedRemark: {},
		selectedTask: {},
		sortRemarks: { column: remarksHeaders.Date, isAscending: false },
		sortTasks: { column: taskHeaders.Particulars, isAscending: true },
	});

	const allowDeletingTask = MyGlobal.HasPermission(MyConstants.Modules.Derived.DeleteTask);

	const allowDisablingTask = MyGlobal.HasPermission(MyConstants.Modules.Derived.DisableTask);

	const allowEditingTask = MyGlobal.HasPermission(MyConstants.Modules.Derived.EditTask);

	const allowEnablingTask = MyGlobal.HasPermission(MyConstants.Modules.Derived.EnableTask);

	const allowMarkingTaskCompleted = MyGlobal.HasPermission(MyConstants.Modules.Derived.MarkTaskCompleted);

	const allowNewTask = MyGlobal.HasPermission(MyConstants.Modules.Derived.NewTask);

	const allowDeletingParticularRemark = MyGlobal.HasPermission(MyConstants.Modules.Derived.DeleteParticularRemark);

	const allowEditingParticularRemark = MyGlobal.HasPermission(MyConstants.Modules.Derived.EditParticularRemark);

	const allowMarkingSubTaskCompleted = MyGlobal.HasPermission(MyConstants.Modules.Derived.MarkSubTaskCompleted);

	// Functions
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

	async function getTasks() {
		setMain((s) => ({ ...s, isLoading: true }));

		try {
			const tasks = await axios.get(MyConstants.ApiEndpoints.Getter, MyGlobal.GetHeaders({ projectId: project.id, type: "get-tasks" }));

			const tasksParticularsRemarks = await axios.get(
				MyConstants.ApiEndpoints.Getter,
				MyGlobal.GetHeaders({ projectId: project.id, type: "get-tasks-particulars-remarks" }),
			);

			const _tasks = tasks.data.map((m) => {
				const particularsAndRemarks = tasksParticularsRemarks.data.filter((f) => f.task_id == m.id && f.project_id == m.project_id);

				return { ...m, particulars_remarks: particularsAndRemarks };
			});

			const _tasksRemarks = tasksParticularsRemarks.data.map((m) => {
				let taskName = "";
				const object = tasks.data.find((f) => f.id == m.task_id);

				if (typeof object === "object") {
					taskName = object.task;
				}

				const entryBy = MyGlobal.GetAnyDataFromId(m.entry_by_id, "full_name");
				return { ...m, entry_by: entryBy, task_name: taskName };
			});

			setApi({
				tasks: { copy: _tasks, data: _tasks },
				remarks: { copy: _tasksRemarks, data: _tasksRemarks },
			});
		} catch (error) {
			MyGlobal.HandleErrors(error, "Get Tasks");
		} finally {
			setMain((old) => ({ ...old, isLoading: false }));
		}
	}

	function setModule(moduleId) {
		setMain((s) => ({ ...s, selectedModuleId: moduleId, selectedTask: {} }));
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
		return getSelectedTask()
			.at(0)
			?.particulars_remarks?.sort((a, b) => {
				const { column, isAscending } = main.sortTasks;

				if (column == taskHeaders.Particulars && isAscending) {
					return a.particular.localeCompare(b.particular);
				} else if (column == taskHeaders.Particulars && !isAscending) {
					return b.particular.localeCompare(a.particular);
				} else if (column == taskHeaders.Remark && isAscending) {
					return a.remark.localeCompare(b.remark);
				} else if (column == taskHeaders.Remark && !isAscending) {
					return b.remark.localeCompare(a.remark);
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
		setMain((s) => ({ ...s, selectedTask: task ?? {} }));
		setMounted((s) => ({ ...s, deleteTask: !s.deleteTask }));
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

		setMain((s) => ({ ...s, selectedTask: selectedTaskObject ?? {} }));
		setMounted((s) => ({ ...s, editTask: task ? true : false }));
	}

	function toggleEditTaskStatusBox(task) {
		setMain((s) => ({ ...s, selectedTask: task ?? {} }));
		setMounted((s) => ({ ...s, editTaskStatus: task ? true : false }));
	}

	function toggleMarkSubTaskCompletedBox(object) {
		setMain((s) => ({ ...s, selectedRemark: object ?? {} }));
		setMounted((s) => ({ ...s, markSubTaskCompleted: object ? true : false }));
	}

	// UI Components
	function uiMain() {
		if (main.isLoading) {
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
							<div className="flex flex-col w-[15%] h-full px-5 pb-5 space-y-2.5 justify-between items-center">
								<div className="flex flex-col w-full h-full space-y-2.5 justify-start items-center">{uiTaskList()}</div>
								{uiRemarksButton()}
							</div>
							<div className="flex flex-col w-[85%] h-full mr-5 space-y-2 justify-start items-center rounded shadow contrast-background">
								{uiTaskOrAllRemarks()}
							</div>
						</div>
					</div>
				</>
			);
		}
	}

	function uiNoDataFound() {
		return (
			<div className="flex flex-col w-[85%] h-full space-y-2 justify-center items-center rounded gray-text contrast-background">
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
			<div className="flex flex-col w-full h-full space-y-2 justify-center items-center rounded shadow font-medium-12 gray-text contrast-background">
				<span>No sub tasks found.</span>
				<button className="space-x-1.5 primary-button-transparent-background" onClick={() => toggleAddParticularRemarkBox()}>
					<FontAwesomeIcon className="primary-text" icon={faPlusCircle} />
					<span>Add</span>
				</button>
			</div>
		);
	}

	function uiTaskOrAllRemarks() {
		if (!api.remarks.copy.length && !api.tasks.copy.length) {
			return uiNoDataFound();
		}

		if (!api.remarks.copy.length && main.selectedModuleId === 1) {
			return (
				<span className="flex flex-col w-full h-full space-y-2 justify-center items-center rounded shadow font-medium-12 gray-text contrast-background">
					No sub tasks found
				</span>
			);
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
	function uiRemarks() {
		return (
			<div className="flex flex-col w-full h-full justify-between items-center contrast-background">
				<div className="flex w-full px-4 justify-center items-center primary-background">{uiRemarksHeaders()}</div>
				<div className="flex flex-col w-full h-full overflow-y-auto">{sortRemarks().map((m, i) => uiRemarksRows(m, i))}</div>
			</div>
		);
	}

	function uiRemarksButton() {
		const showTotalRemarks = api.remarks.data.length > 0 ? "font-regular-10 gray-text" : "hidden";

		const selectedAesthetics =
			main.selectedModuleId == 1 ? "primary-border primary-background-transparent-01 primary-text" : "full-border bg-white black-text";

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
				<span
					className="flex w-1/4 h-10 space-x-1.5 justify-center items-center cursor-pointer text-center text-white font-medium-11"
					onClick={() => setRemarksSorting(m)}
					key={i}>
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

				<Tippy className="font-regular-11" content={dayjs(row.entry_at).format("hh:mm:ss a")} placement="bottom">
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
			<div className="flex flex-col w-full h-[calc(100vh-110px)] justify-start items-center overflow-y-auto">
				<div className="flex w-full contrast-background">{uiTaskPrimaryInformation()}</div>
				{!sortTasks().length ? (
					uiNoParticularsRemarksFound()
				) : (
					<div className="flex flex-col w-full h-full relative contrast-background">
						<div className="flex w-full px-4 justify-center items-center primary-background">{uiTaskHeaders()}</div>
						<div className="flex flex-col w-full h-full overflow-y-auto">{sortTasks().map((m, i) => uiTaskRows(m, i))}</div>
						<div className={addSubTaskButton} onClick={() => toggleAddParticularRemarkBox()}>
							<FontAwesomeIcon className="primary-text" icon={faPlusCircle} size="3x" />
						</div>
					</div>
				)}
			</div>
		);
	}

	function uiTaskActions(task) {
		const style = "flex w-full py-2 space-x-2.5 justify-start items-center cursor-pointer border-y hovered-rows";

		const noClickAndHalfOpacity = "pointer-events-none opacity-25";
		const clickAndFullOpacity = "pointer-events-auto opacity-100";

		const editTaskStyle = allowEditingTask && (task.is_disabled == 1 || task.is_completed == 1) ? noClickAndHalfOpacity : clickAndFullOpacity;

		const deleteTaskStyle = allowDeletingTask ? noClickAndHalfOpacity : clickAndFullOpacity;
		const enableTaskStyle = allowEnablingTask && task.is_disabled == 1 ? clickAndFullOpacity : noClickAndHalfOpacity;

		const disableTaskStyle = allowDisablingTask && task.is_completed == 0 && task.is_disabled == 0 ? clickAndFullOpacity : noClickAndHalfOpacity;

		const markTaskCompletedStyle =
			isUserAdministrator && allowMarkingTaskCompleted && task.is_completed == 0 && task.is_disabled == 0 ? clickAndFullOpacity : noClickAndHalfOpacity;

		return (
			<Tippy
				allowHTML
				animation="fade"
				arrow
				className="relative z-40"
				content={
					<div className="flex flex-col justify-center items-center">
						<div className={`${style} ${editTaskStyle}`} onClick={() => toggleEditTaskBox(task)}>
							<FontAwesomeIcon className="w-5 primary-text" icon={faPencil} />
							<span>Edit</span>
						</div>
						<div className={`${style} ${deleteTaskStyle}`} onClick={() => toggleDeleteTaskBox(task)}>
							<FontAwesomeIcon className="w-5 red-text" icon={faTrash} />
							<span>Delete</span>
						</div>
						<div
							className={`${style} ${enableTaskStyle}`}
							onClick={() => toggleEditTaskStatusBox({ ...task, status: MyConstants.Statuses.Tasks.Enable })}>
							<FontAwesomeIcon className="w-5 green-text" icon={faCheckCircle} />
							<span>Enable</span>
						</div>
						<div
							className={`${style} ${disableTaskStyle}`}
							onClick={() => toggleEditTaskStatusBox({ ...task, status: MyConstants.Statuses.Tasks.Disable })}>
							<FontAwesomeIcon className="w-5 red-text" icon={faBan} />
							<span>Disable</span>
						</div>
						<div
							className={`${style} ${markTaskCompletedStyle}`}
							onClick={() => toggleEditTaskStatusBox({ ...task, status: MyConstants.Statuses.Tasks.Completed })}>
							<FontAwesomeIcon className="w-5 green-text" icon={faClipboardCheck} />
							<span>Mark Task Completed</span>
						</div>
					</div>
				}
				interactive
				placement="bottom"
				theme="light"
				trigger="click">
				<FontAwesomeIcon className="cursor-pointer font-regular-11 green-text" icon={faBolt} />
			</Tippy>
		);
	}

	function uiTaskHeaders() {
		return Object.values(taskHeaders).map((m, i) => {
			const showSortArrow = m == main.sortTasks.column && m != taskHeaders.Actions ? "visible" : "invisible";
			const wrapper = `flex w-1/3 h-10 space-x-1.5 justify-center items-center cursor-pointer text-center text-white font-medium-11`;

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
			const showAddTaskButton = api.tasks.data.length - 1 == i;
			const totalParticularsAndRemarks = api.remarks.data.filter((f) => f.task_id == m.id).length;

			const iconColour = m.is_completed == 1 ? "green-text" : "red-text";
			const iconStyle = `mr-2.5 ${iconColour}`;

			const icon =
				m.is_completed == 1 ? (
					<FontAwesomeIcon className={iconStyle} icon={faCircleCheck} />
				) : m.is_disabled == 1 ? (
					<FontAwesomeIcon className={iconStyle} icon={faBan} />
				) : (
					""
				);

			const selectedTaskStyle =
				m.id == main.selectedTask?.id ? "primary-border primary-background-transparent-01 primary-text" : "full-border bg-white black-text";

			const wrapper = `flex w-full h-10 px-5 justify-between items-center rounded shadow ${selectedTaskStyle} font-regular-11 hovered-rows`;

			return (
				<div className="flex w-full space-x-3 justify-start items-center">
					<button className={wrapper} key={i} onClick={() => setTask(m)}>
						<div className="flex justify-center items-center">
							{icon}
							<span>{m.task}</span>
						</div>
						{totalParticularsAndRemarks > 0 && <span className="font-regular-10 gray-text">{totalParticularsAndRemarks}</span>}
					</button>
					{allowNewTask && showAddTaskButton && (
						<FontAwesomeIcon className="cursor-pointer primary-text" icon={faPlusCircle} onClick={() => toggleAddTaskBox()} size="lg" />
					)}
				</div>
			);
		});
	}

	function uiTaskPrimaryInformation() {
		const selectedTask = api.tasks.data.find((f) => f.id == main.selectedTask.id);
		const isSelectedTaskDefined = typeof selectedTask === "object";

		const isCompleted = isSelectedTaskDefined ? selectedTask.is_completed : false;
		const task = isSelectedTaskDefined ? selectedTask.task : "";
		const expense = isSelectedTaskDefined ? Number(selectedTask.expense) : 0;
		const dueOn = isSelectedTaskDefined ? dayjs(selectedTask.due_on).format("DD MMM, YYYY") : "";

		return (
			<div className="flex w-full px-4 py-2 justify-between items-center bottom-border">
				<div className="flex !px-2.5 space-x-2.5 justify-between items-center red-tag-transparent-01">
					<FontAwesomeIcon className="font-regular-11" icon={faIndianRupee} />
					<span className="font-medium-11">{expense}</span>
				</div>
				<div className="flex space-x-2.5 justify-center items-center font-medium-14">
					<span>{task}</span>
					{!isCompleted && uiTaskActions(main.selectedTask)}
				</div>
				<div className="flex !px-2.5 space-x-2.5 justify-between items-center red-tag-transparent-01">
					<FontAwesomeIcon className="font-regular-11" icon={faStopwatch} />
					<span className="font-medium-11">{dueOn}</span>
				</div>
			</div>
		);
	}

	function uiTaskRows(row, i) {
		const style = "flex w-1/3 justify-center items-center whitespace-pre-wrap";

		const deleteSubTaskStyle =
			allowDeletingParticularRemark && row.is_completed == 0 ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-25";

		const editSubTaskStyle = allowEditingParticularRemark && row.is_completed == 0 ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-25";

		const markSubTaskCompletedStyle =
			allowMarkingSubTaskCompleted && row.is_completed == 0 ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-25";

		return (
			<div className="flex w-full px-4 py-2 justify-center items-center contrast-background border-y font-regular-11" key={i}>
				<span className={style} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(row.particular, main.findText) }} />

				<span className={style} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(row.remark, main.findText) }} />

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
		getTasks();
	}, []);

	// Main UI
	return (
		<>
			{uiMain()}

			{mounted.addParticularRemark && (
				<AddParticularRemark mount={mounted.addParticularRemark} reload={getTasks} task={main.selectedTask} unmount={toggleAddParticularRemarkBox} />
			)}

			{mounted.addTask && <AddTask mount={mounted.addTask} reload={getTasks} project={project} unmount={toggleAddTaskBox} />}

			{mounted.deleteParticularRemark && (
				<DeleteParticularRemark
					mount={mounted.deleteParticularRemark}
					reload={getTasks}
					task={main.selectedRemark}
					unmount={toggleDeleteParticularRemarkBox}
				/>
			)}

			{mounted.deleteTask && <DeleteTask mount={mounted.deleteTask} reload={getTasks} task={main.selectedTask} unmount={toggleDeleteTaskBox} />}

			{mounted.editParticularRemark && (
				<EditParticularRemark
					mount={mounted.editParticularRemark}
					reload={getTasks}
					task={main.selectedRemark}
					unmount={toggleEditParticularRemarkBox}
				/>
			)}

			{mounted.editTask && <EditTask mount={mounted.editTask} reload={getTasks} task={main.selectedTask} unmount={toggleEditTaskBox} />}

			{mounted.editTaskStatus && (
				<EditTaskStatus mount={mounted.editTaskStatus} reload={getTasks} task={main.selectedTask} unmount={toggleEditTaskStatusBox} />
			)}

			{mounted.markSubTaskCompleted && (
				<MarkSubTaskCompleted
					mount={mounted.markSubTaskCompleted}
					reload={getTasks}
					remark={main.selectedRemark}
					unmount={toggleMarkSubTaskCompletedBox}
				/>
			)}
		</>
	);
}
