"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import "tippy.js/themes/light.css";

import axios from "axios";
import dayjs from "dayjs";
import Tippy from "@tippyjs/react";
import writeXlsxFile from "write-excel-file";
import MyConstants from "@/utilities/constants";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { SpinnerBig } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AddParticularAndRemark, AddTask, UpdateProjectStatus, UpdateTask, UpdateTaskStatus } from "@/modals/singleProject/miscellaneous";
import {
	faBan,
	faBolt,
	faCheckCircle,
	faCircleExclamation,
	faClipboardCheck,
	faIndianRupee,
	faPlusCircle,
	faSave,
	faSortAmountAsc,
	faSortAmountDesc,
	faStar,
	faStopwatch,
	faTrash,
} from "@fortawesome/free-solid-svg-icons";

export default function Tasks({ reloadProjects, selectedClient, selectedProject, source }) {
	// Business Logic
	const [apiData, setApiData] = useState({
		tasks: { api: [], apiCopy: [] },
		tasksNotes: { api: [], apiCopy: [] },
		tasksParticularsRemarks: { api: [], apiCopy: [] },
	});

	const [hasMounted, setHasMounted] = useState({
		addTask: false,
		addParticularAndRemark: false,
		markTaskCompleted: false,
		updateStatus: false,
		updateTask: false,
		updateTaskStatus: false,
	});

	const [mainData, setMainData] = useState({
		isLoading: {
			addSingleTask: 0,
			disableSingleTask: 0,
			markTaskAsCompleted: 0,
			tasks: false,
			updateStatus: 0,
		},
		searchTerm: "",
		selectedTask: {},
		selectedTaskMetaData: {},
		sort: { column: "ID", isAscending: true },
	});

	const userId = MyGlobal.GetUserId();
	const tableHeaders = MyConstants.TableHeaders.Tasks;
	const isSourceSingleClient = source === "Single Client => Single Project";

	const allowEnablingTask = MyGlobal.HasPermission(MyConstants.Modules.Derived.EnableTask);
	const allowDisablingTask = MyGlobal.HasPermission(MyConstants.Modules.Derived.DisableTask);
	const allowMarkingTaskCompleted = MyGlobal.HasPermission(MyConstants.Modules.Derived.MarkTaskCompleted);
	const allowNewTask = MyGlobal.HasPermission(MyConstants.Modules.Derived.NewTask);
	const allowUpdatingTask = MyGlobal.HasPermission(MyConstants.Modules.Derived.UpdateTask);

	// Functions
	const addParticularAndRemark = (particularAndRemark) => {
		if (allowNewTask) {
			const copy = [...apiData.tasksParticularsRemarks.api];

			copy.unshift({
				created_by: userId,
				id: "TK000000",
				particular: particularAndRemark.particular,
				project_id: selectedProject.id,
				remark: particularAndRemark.remark,
				task_id: particularAndRemark.taskId,
			});

			setApiData((old) => ({ ...old, tasksParticularsRemarks: { ...old.tasksParticularsRemarks, api: copy } }));
		}
	};

	const addTask = (task) => {
		if (allowNewTask) {
			const copy = [...apiData.tasks.api];

			copy.unshift({
				completed_on: new Date(),
				task: task.task,
				due_on: task.dueOn,
				expense: task.expense,
				id: task.id,
				input_by: userId,
				is_completed: 0,
				is_disabled: 0,
				remark: task.remark,
			});

			setApiData((old) => ({ ...old, tasks: { ...old.tasks, api: copy } }));
		}
	};

	const deleteTask = (task) => {
		const copy = [...apiData.tasks.api];
		const finalTasks = copy.filter((_task) => _task.id != task.id);

		setApiData((old) => ({ ...old, tasks: { ...old.tasks, api: finalTasks } }));
	};

	const doSorting = () => {
		return apiData.tasks.api.sort((a, b) => {
			const aDate = new Date(a.dueOn);
			const bDate = new Date(b.dueOn);

			if (mainData.sort.column == tableHeaders.Id && mainData.sort.isAscending) {
				return a.id - b.id;
			} else if (mainData.sort.column == tableHeaders.Id && !mainData.sort.isAscending) {
				return b.id - a.id;
			} else if (mainData.sort.column == tableHeaders.Task && mainData.sort.isAscending) {
				return a.task.localeCompare(b.task);
			} else if (mainData.sort.column == tableHeaders.Task && !mainData.sort.isAscending) {
				return b.task.localeCompare(a.task);
			} else if (mainData.sort.column == tableHeaders.DueOn && mainData.sort.isAscending) {
				return aDate - bDate;
			} else if (mainData.sort.column == tableHeaders.DueOn && !mainData.sort.isAscending) {
				return bDate - aDate;
			} else if (mainData.sort.column == tableHeaders.AddedBy && mainData.sort.isAscending) {
				return a.input_by.localeCompare(b.input_by);
			} else if (mainData.sort.column == tableHeaders.AddedBy && !mainData.sort.isAscending) {
				return b.input_by.localeCompare(a.input_by);
			} else if (mainData.sort.column == tableHeaders.Remarks && mainData.sort.isAscending) {
				return a.remark.localeCompare(b.remark);
			} else if (mainData.sort.column == tableHeaders.Remarks && !mainData.sort.isAscending) {
				return b.remark.localeCompare(a.remark);
			} else if (mainData.sort.column == tableHeaders.Expense && mainData.sort.isAscending) {
				return a.expense - b.expense;
			} else if (mainData.sort.column == tableHeaders.Expense && !mainData.sort.isAscending) {
				return b.expense - a.expense;
			} else {
				return a.id - b.id;
			}
		});
	};

	const exportToExcel = () => {
		const records = [];
		const _records = [];

		const columnsWidth = [];
		const dataHeaders = [];

		const rowHeight = 28;
		const maximumColumnWidth = 20;

		const getHeaders = Object.values(tableHeaders).filter((header) => header != tableHeaders.Actions);
		const blankRows = [{ span: getHeaders.length, height: rowHeight, colSpan: 2 }];

		doSorting().forEach((task) => {
			const isNewTask = apiData.tasks.apiCopy.filter((_task) => _task.id == task.id && _task.project_id == selectedProject.id);

			if (isNewTask.length) {
				const insertedBy = MyGlobal.GetAnyDataFromId(task.input_by, "full_name");
				const dueOn = dayjs(task.due_on).format("DD MMM, YYYY");
				const formattedExpenses = MyGlobal.ThousandSeparator(task.expense);

				_records.push(task.id, task.task, dueOn, insertedBy, task.note, formattedExpenses);
			}
		});

		_records.forEach((task) => {
			records.push({
				align: "center",
				alignVertical: "center",
				color: "#000000",
				height: rowHeight,
				type: String,
				value: String(task),
				wrap: true,
			});
		});

		getHeaders.forEach((header) => {
			dataHeaders.push({
				align: "center",
				alignVertical: "center",
				fontWeight: "bold",
				height: rowHeight,
				value: header,
				width: maximumColumnWidth,
			});
			columnsWidth.push({ width: maximumColumnWidth });
		});

		const separatedRowValues = MyGlobal.SeparateObjectsIntoArrays(records, getHeaders.length);

		let headerText = `[${selectedProject.id}] ${selectedProject.main_project} > Tasks (${separatedRowValues.length})`;

		if (isSourceSingleClient) {
			headerText = `[${selectedClient.id}] - ${selectedClient.name} > [${selectedProject.id}] - ${selectedProject.main_project} > Tasks (${separatedRowValues.length})`;
		}

		const header = [
			{
				align: "center",
				alignVertical: "center",
				fontSize: 16,
				fontWeight: "bold",
				height: 42,
				span: getHeaders.length,
				value: `${headerText}`,
			},
		];

		const finalData = [header, blankRows, dataHeaders];
		separatedRowValues.forEach((row) => finalData.push(row));

		writeXlsxFile(finalData, {
			columns: columnsWidth,
			fileName: "Tasks.xlsx",
			fontFamily: "Segoe UI",
			fontSize: 9,
		});
	};

	const getTasks = async () => {
		setMainData((old) => ({ ...old, isLoading: { ...old.isLoading, tasks: true } }));

		try {
			const allTasks = await axios.get(MyConstants.ApiEndpoints.Getter, MyGlobal.GetHeaders({ projectId: selectedProject.id, type: "get-tasks" }));

			const allTasksParticularsRemarks = await axios.get(
				MyConstants.ApiEndpoints.Getter,
				MyGlobal.GetHeaders({ projectId: selectedProject.id, type: "get-tasks-particulars-remarks" }),
			);

			const allTasksNotes = await axios.get(
				MyConstants.ApiEndpoints.Getter,
				MyGlobal.GetHeaders({ inquiryId: selectedProject.inquiry_id, projectId: selectedProject.id, type: "get-tasks-notes" }),
			);

			setApiData({
				tasks: { api: allTasks.data, apiCopy: allTasks.data },
				tasksNotes: { api: allTasksNotes.data, apiCopy: allTasksNotes.data },
				tasksParticularsRemarks: { api: allTasksParticularsRemarks.data, apiCopy: allTasksParticularsRemarks.data },
			});
		} catch (error) {
			MyGlobal.HandleErrors(error, "Get Tasks");
		} finally {
			setMainData((old) => ({ ...old, isLoading: { ...old.isLoading, tasks: false } }));
		}
	};

	const getSelectedTaskData = () => {
		let array = [];

		if (apiData.tasksParticularsRemarks.api.length) {
			const result = apiData.tasksParticularsRemarks.api.filter(
				(object) => object.project_id == selectedProject.id && object.task_id == mainData.selectedTask.id,
			);

			if (result.length) {
				array = result;
			}
		}

		return array;
	};

	const getSelectedTaskNotes = () => {
		let array = [];

		if (apiData.tasksNotes.api.length) {
			const result = apiData.tasksNotes.api.filter((object) => object.project_id == selectedProject.id && object.task_id == mainData.selectedTask.id);

			if (result.length) {
				array = result;
			}
		}

		return array;
	};

	const saveTask = async (task) => {
		if (task.task) {
			setMainData((old) => ({ ...old, isLoading: { ...old.isLoading, addSingleTask: task.id } }));

			const body = {
				clientId: selectedProject.client_id,
				task: MyGlobal.EscapeString(task.task),
				dueOn: dayjs(task.due_on).format("YYYY-MM-DD"),
				expense: Number(task.expense),
				projectId: selectedProject.id,
				remark: MyGlobal.EscapeString(task.remark),
				userId,
			};

			try {
				const response = await axios.post(MyConstants.ApiEndpoints.Tasks.AddTask, body, MyGlobal.GetHeaders());

				if (response.status === 200) {
					getTasks();

					MyGlobal.AddActivity(`Added <b>${response.data}</b> in <b>${selectedProject.id}</b>.`, MyConstants.Modules.Base.Tasks);

					MyGlobal.ShowSuccessToast(MyConstants.Messages.TaskAdded);
				} else {
					MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
				}
			} catch (error) {
				MyGlobal.HandleErrors(error, "Add Task");
			} finally {
				setMainData((old) => ({ ...old, isLoading: { ...old.isLoading, addSingleTask: 0 } }));
			}
		}
	};

	const setTask = (task) => {
		setMainData((old) => ({ ...old, selectedTask: task }));
	};

	const setSort = (column) => {
		setMainData((old) => ({ ...old, sort: { column, isAscending: !mainData.sort.isAscending } }));
	};

	const toggleAddParticularAndRemarkBox = (task) => {
		setMainData((old) => ({ ...old, selectedTaskMetaData: task ?? {} }));
		setHasMounted((old) => ({ ...old, addParticularAndRemark: !hasMounted.addParticularAndRemark }));
	};

	const toggleAddTaskBox = () => {
		setHasMounted((old) => ({ ...old, addTask: !hasMounted.addTask }));
	};

	const toggleUpdateStatusBox = (task) => {
		setMainData((old) => ({ ...old, selectedTask: task ?? {} }));
		setHasMounted((old) => ({ ...old, updateStatus: task ? true : false }));
	};

	const toggleUpdateTaskBox = (task) => {
		const selectedTaskObject = {
			...task,
			due_on: mainData.selectedTask.due_on,
			expense: mainData.selectedTask.expense,
			id: mainData.selectedTask.id,
			project_id: mainData.selectedTask.project_id,
			rowId: task ? task.id : 0,
			task: mainData.selectedTask.task,
		};

		setMainData((old) => ({ ...old, selectedTask: selectedTaskObject ?? {} }));
		setHasMounted((old) => ({ ...old, updateTask: task ? true : false }));
	};

	const toggleUpdateTaskStatusBox = (task) => {
		setMainData((old) => ({ ...old, selectedTask: task ?? {} }));
		setHasMounted((old) => ({ ...old, updateTaskStatus: task ? true : false }));
	};

	// UI Components
	const uiActions = (task) => {
		const style = "flex w-full p-2 space-x-2.5 justify-start items-center cursor-pointer border-y hovered-rows";

		const noClickAndHalfOpacity = "pointer-events-none opacity-25";
		const clickAndFullOpacity = "pointer-events-auto opacity-100";

		const isUnsavedTask = task.id == "TK000000";

		const updateTaskStyle = !isUnsavedTask && (task.is_disabled == 1 || task.is_completed == 1) ? noClickAndHalfOpacity : clickAndFullOpacity;

		const deleteOrSaveTaskStyle = !isUnsavedTask ? noClickAndHalfOpacity : clickAndFullOpacity;

		const enableTaskStyle = !isUnsavedTask && task.is_disabled == 1 ? clickAndFullOpacity : noClickAndHalfOpacity;

		const disableTaskStyle = !isUnsavedTask && task.is_completed == 0 && task.is_disabled == 0 ? clickAndFullOpacity : noClickAndHalfOpacity;

		const markTaskCompletedStyle = !isUnsavedTask && task.is_completed == 0 && task.is_disabled == 0 ? clickAndFullOpacity : noClickAndHalfOpacity;

		return (
			<Tippy
				allowHTML
				animation="fade"
				arrow
				className="relative z-40"
				content={
					<div className="flex flex-col justify-center items-center">
						{allowNewTask && (
							<div className={style} onClick={() => toggleAddParticularAndRemarkBox(task)}>
								<FontAwesomeIcon className="w-5 primary-text" icon={faPlusCircle} />
								<span>Add</span>
							</div>
						)}

						{allowNewTask && (
							<div className={`${style} ${deleteOrSaveTaskStyle}`} onClick={() => saveTask(task)}>
								<FontAwesomeIcon className="w-5 green-text" icon={faSave} />
								<span>Save</span>
							</div>
						)}

						{allowUpdatingTask && (
							<div className={`${style} ${updateTaskStyle}`} onClick={() => toggleUpdateTaskBox(task)}>
								<FontAwesomeIcon className="w-5 orange-text" icon={faStar} />
								<span>Update</span>
							</div>
						)}

						{allowNewTask && (
							<div className={`${style} ${deleteOrSaveTaskStyle}`} onClick={() => deleteTask(task)}>
								<FontAwesomeIcon className="w-5 red-text" icon={faTrash} />
								<span>Delete</span>
							</div>
						)}

						{allowEnablingTask && (
							<div
								className={`${style} ${enableTaskStyle}`}
								onClick={() => toggleUpdateTaskStatusBox({ ...task, status: MyConstants.Statuses.Tasks.Enable })}>
								<FontAwesomeIcon className="w-5 green-text" icon={faCheckCircle} />
								<span>Enable</span>
							</div>
						)}

						{allowDisablingTask && (
							<div
								className={`${style} ${disableTaskStyle}`}
								onClick={() => toggleUpdateTaskStatusBox({ ...task, status: MyConstants.Statuses.Tasks.Disable })}>
								<FontAwesomeIcon className="w-5 red-text" icon={faBan} />
								<span>Disable</span>
							</div>
						)}

						{allowMarkingTaskCompleted && (
							<div
								className={`${style} ${markTaskCompletedStyle}`}
								onClick={() => toggleUpdateTaskStatusBox({ ...task, status: MyConstants.Statuses.Tasks.Completed })}>
								<FontAwesomeIcon className="w-5 green-text" icon={faClipboardCheck} />
								<span>Mark Task Completed</span>
							</div>
						)}
					</div>
				}
				interactive
				placement="bottom"
				theme="light"
				trigger="click">
				<button className="space-x-2 font-regular-10 green-tag-transparent-01">
					<FontAwesomeIcon className="cursor-pointer green-text" icon={faBolt} />
					<span>Actions</span>
				</button>
			</Tippy>
		);
	};

	const uiMain = () => {
		if (mainData.isLoading.tasks) {
			return (
				<div className="flex w-full h-full justify-center items-center black-white-background full-border">
					<SpinnerBig />
				</div>
			);
		} else if (!apiData.tasks.api.length) {
			return (
				<div className="flex flex-col w-full h-full space-y-2.5 justify-center items-center black-white-background top-border font-regular-11 gray-text">
					<span>No tasks alloted</span>
					<button className="space-x-1.5 primary-button-transparent-background" onClick={() => toggleAddTaskBox()}>
						<FontAwesomeIcon className="primary-text" icon={faPlusCircle} />
						<span>Add</span>
					</button>
				</div>
			);
		} else {
			return (
				<>
					<div className="flex flex-col w-full justify-between items-center">
						<div className="flex w-full justify-start items-center">
							<div className="flex flex-col w-[15%] h-full px-5 space-y-2.5 justify-start items-center">
								{doSorting().map((task, index) => uiTasksList(task, index))}
								<button className="space-x-1.5 primary-button-transparent-background" onClick={() => toggleAddTaskBox()}>
									<FontAwesomeIcon className="primary-text" icon={faPlusCircle} />
									<span>Add</span>
								</button>
							</div>
							{!Object.keys(mainData.selectedTask).length ? uiNoTaskSelected() : uiSelectedTask()}
						</div>
						{Object.keys(mainData.selectedTask).length > 0 && (
							<div className="flex w-full justify-between items-center">
								<div className="flex flex-col w-[15%] h-full px-5 justify-start items-center" />
								{!getSelectedTaskNotes().length ? uiNoNotesWritten() : uiSelectedTaskNotes()}
							</div>
						)}
					</div>
				</>
			);
		}
	};

	const uiNoNotesWritten = () => {
		return (
			<div className="flex flex-col w-[85%] h-[272px] space-y-2 justify-center items-center rounded shadow black-white-background font-regular-11 gray-text">
				<FontAwesomeIcon className="text-6xl" icon={faCircleExclamation} />
				<span>No notes written.</span>
				<button className="space-x-1.5 primary-button-transparent-background" onClick={() => toggleAddTaskBox()}>
					<FontAwesomeIcon className="primary-text" icon={faPlusCircle} />
					<span>Add</span>
				</button>
			</div>
		);
	};

	const uiNoTaskSelected = () => {
		return (
			<div className="flex flex-col w-[85%] h-[calc(100vh-140px)] space-y-2 justify-center items-center rounded shadow gray-text black-white-background">
				<FontAwesomeIcon className="text-6xl" icon={faCircleExclamation} />
				<span>Select a task</span>
			</div>
		);
	};

	const uiSelectedTask = () => {
		return (
			<div className="flex flex-col w-[85%] space-y-2 justify-start items-center rounded shadow black-white-background">
				<div className="flex flex-col w-full justify-start items-center">
					<div className="flex w-full black-white-background">{uiSelectedTaskHeader()}</div>
					<div className="flex flex-col w-full h-[272px] black-white-background">
						<div className="flex w-full px-4 justify-center items-center primary-background">{uiSelectedTaskRowsHeaders()}</div>
						<div className="flex flex-col w-full h-[232px] overflow-y-auto">
							{getSelectedTaskData().map((task, index) => uiSelectedTaskRows(task, index))}
						</div>
					</div>
				</div>
			</div>
		);
	};

	const uiSelectedTaskHeader = () => {
		const selectedTask = apiData.tasks.api.filter((task) => task.id == mainData.selectedTask.id).at(0);

		const task = typeof selectedTask === "object" ? selectedTask.task : "";
		const expense = typeof selectedTask === "object" ? Number(selectedTask.expense) : 0;
		const dueOn = typeof selectedTask === "object" ? dayjs(selectedTask.due_on).format("DD MMM, YYYY") : "";

		return (
			<div className="flex w-full px-4 py-2 justify-between items-center bottom-border">
				<div className="flex !px-2.5 space-x-2.5 justify-between items-center red-tag-transparent-01">
					<FontAwesomeIcon className="font-regular-10" icon={faIndianRupee} />
					<span className="font-medium-10">{expense}</span>
				</div>
				<span className="font-medium-14">{task}</span>
				<div className="flex !px-2.5 space-x-2.5 justify-between items-center red-tag-transparent-01">
					<FontAwesomeIcon className="font-regular-10" icon={faStopwatch} />
					<span className="font-medium-10">{dueOn}</span>
				</div>
			</div>
		);
	};

	const uiSelectedTaskNotes = () => {
		return (
			<div className="flex flex-col w-[85%] space-y-2 justify-start items-center rounded shadow black-white-background">
				<div className="flex flex-col w-full justify-start items-center">
					<div className="flex flex-col w-full h-[272px] black-white-background">
						<div className="flex w-full px-4 justify-center items-center primary-background">{uiSelectedTaskNotesRowsHeaders()}</div>
						<div className="flex flex-col w-full h-[232px] overflow-y-auto">
							{getSelectedTaskNotes().map((note, index) => uiSelectedTaskNotesRows(note, index))}
						</div>
					</div>
				</div>
			</div>
		);
	};

	const uiSelectedTaskNotesRowsHeaders = () => {
		return ["Date", "Note", "Written By"].map((header, index) => {
			const width = index != 2 ? "w-2/5" : "w-1/5";

			const showSortArrow = header == mainData.sort.column ? "visible" : "invisible";
			const wrapper = `flex ${width} h-10 justify-start items-center cursor-pointer text-center text-white font-medium-12`;

			return (
				<span className={wrapper} onClick={() => setSort(header)} key={index}>
					<span>{header}</span>
					<span className={showSortArrow}>{uiSortArrows(header)}</span>
				</span>
			);
		});
	};

	const uiSelectedTaskNotesRows = (note, rowIndex) => {
		const style = `flex w-2/5 justify-start items-center whitespace-pre`;
		const lastColumnStyle = `flex w-1/5 justify-start items-center whitespace-pre`;

		const entryDate = dayjs(note.entry_date).format("hh:mm:ss a, DD MMM, YYYY");
		const writtenBy = MyGlobal.GetAnyDataFromId(note.user_id, "full_name");

		return (
			<div className="flex w-full px-4 py-2 justify-center items-center black-white-background bottom-border font-regular-12" key={rowIndex}>
				<span className={style}>{entryDate}</span>

				<span className={style} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(note.content, mainData.searchTerm) }} />

				<span className={lastColumnStyle} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(writtenBy, mainData.searchTerm) }} />
			</div>
		);
	};

	const uiSelectedTaskRows = (task, rowIndex) => {
		const style = "flex w-2/5 justify-start items-center whitespace-pre";

		return (
			<div className="flex w-full px-4 py-2 justify-center items-center black-white-background bottom-border font-regular-12" key={rowIndex}>
				<span className="pr-1">{rowIndex + 1}. </span>

				<span className={style} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(task.particular, mainData.searchTerm) }} />

				<span className={style} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(task.remark, mainData.searchTerm) }} />

				<span className="w-1/5">{uiActions(task)}</span>
			</div>
		);
	};

	const uiSelectedTaskRowsHeaders = () => {
		return Object.values(tableHeaders).map((header, index) => {
			const width = index != 2 ? "w-2/5" : "w-1/5";

			const showSortArrow = header == mainData.sort.column ? "visible" : "invisible";
			const wrapper = `flex ${width} h-10 justify-start items-center cursor-pointer text-center text-white font-medium-12`;

			return (
				<span className={wrapper} onClick={() => setSort(header)} key={index}>
					<span>{header}</span>
					<span className={showSortArrow}>{uiSortArrows(header)}</span>
				</span>
			);
		});
	};

	const uiSortArrows = (column) => {
		if (mainData.sort.column == column) {
			if (mainData.sort.isAscending) {
				return <FontAwesomeIcon icon={faSortAmountAsc} />;
			} else {
				return <FontAwesomeIcon icon={faSortAmountDesc} />;
			}
		}
	};

	const uiTasksList = (task, rowIndex) => {
		// UI
		const wrapper = `flex w-full justify-center items-center rounded shadow black-text black-white-background font-regular-11 hovered-rows-2`;

		return (
			<div className={wrapper} key={rowIndex}>
				<button
					className="flex w-full min-h-10 justify-center items-center text-center relative"
					dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(task.task, mainData.searchTerm) }}
					onClick={() => setTask(task)}
				/>
			</div>
		);
	};

	// Hooks
	useEffect(() => {
		getTasks();
	}, []);

	useEffect(() => {
		console.log(apiData.tasksParticularsRemarks.api);
	}, [apiData.tasksParticularsRemarks.api]);

	// Main UI
	return (
		<>
			{uiMain()}

			{hasMounted.addTask && <AddTask addTask={addTask} mount={hasMounted.addTask} unmount={toggleAddTaskBox} />}

			{hasMounted.addParticularAndRemark && (
				<AddParticularAndRemark
					addParticularAndRemark={addParticularAndRemark}
					mount={hasMounted.addParticularAndRemark}
					selectedTaskMetaData={mainData.selectedTaskMetaData}
					unmount={toggleAddParticularAndRemarkBox}
				/>
			)}

			{hasMounted.updateStatus && (
				<UpdateProjectStatus
					mount={hasMounted.updateStatus}
					reloadTasks={getTasks}
					selectedTask={mainData.selectedTask}
					unmount={toggleUpdateStatusBox}
				/>
			)}

			{hasMounted.updateTask && (
				<UpdateTask mount={hasMounted.updateTask} reloadTasks={getTasks} selectedTask={mainData.selectedTask} unmount={toggleUpdateTaskBox} />
			)}

			{hasMounted.updateTaskStatus && (
				<UpdateTaskStatus
					mount={hasMounted.updateTaskStatus}
					reloadTasks={getTasks}
					selectedTask={mainData.selectedTask}
					unmount={toggleUpdateTaskStatusBox}
				/>
			)}
		</>
	);
}
