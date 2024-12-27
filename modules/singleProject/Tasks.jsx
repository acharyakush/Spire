"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import writeXlsxFile from "write-excel-file";
import MyConstants from "@/utilities/constants";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { SpinnerBig } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { AddTask, UpdateProjectStatus, UpdateTask, UpdateTaskStatus } from "@/modals/singleProject/miscellaneous";
import {
	faBan,
	faCheckCircle,
	faCircleExclamation,
	faClipboardCheck,
	faEllipsis,
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
		tasksParticularsRemarks: { api: [], apiCopy: [] },
	});

	const [hasMounted, setHasMounted] = useState({
		addTask: false,
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

			setApiData({
				tasks: { api: allTasks.data, apiCopy: allTasks.data },
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
			<Menu as="div" className="flex justify-center items-center relative">
				<MenuButton className="flex w-full justify-center items-center focus:outline-none font-regular-11">
					<FontAwesomeIcon className="gray-text" icon={faEllipsis} />
				</MenuButton>
				<MenuItems className="absolute w-max top-6 right-0 origin-top-right rounded focus:outline-none z-50 black-white-background bottom-shadow full-border">
					{allowNewTask && (
						<MenuItem as="div" className={style} onClick={() => toggleAddTaskBox()}>
							<FontAwesomeIcon className="w-5 primary-text" icon={faPlusCircle} />
							<span className="font-regular-11">Add</span>
						</MenuItem>
					)}

					{allowNewTask && (
						<MenuItem as="div" className={`${style} ${deleteOrSaveTaskStyle}`} onClick={() => saveTask(task)}>
							<FontAwesomeIcon className="w-5 green-text" icon={faSave} />
							<span className="font-regular-11">Save</span>
						</MenuItem>
					)}

					{allowUpdatingTask && (
						<MenuItem as="div" className={`${style} ${updateTaskStyle}`} onClick={() => toggleUpdateTaskBox(task)}>
							<FontAwesomeIcon className="w-5 orange-text" icon={faStar} />
							<span className="font-regular-11">Update</span>
						</MenuItem>
					)}

					{allowNewTask && (
						<MenuItem as="div" className={`${style} ${deleteOrSaveTaskStyle}`} onClick={() => deleteTask(task)}>
							<FontAwesomeIcon className="w-5 red-text" icon={faTrash} />
							<span className="font-regular-11">Delete</span>
						</MenuItem>
					)}

					{allowEnablingTask && (
						<MenuItem
							as="div"
							className={`${style} ${enableTaskStyle}`}
							onClick={() => toggleUpdateTaskStatusBox({ ...task, status: MyConstants.Statuses.Tasks.Enable })}>
							<FontAwesomeIcon className="w-5 green-text" icon={faCheckCircle} />
							<span className="font-regular-11">Enable</span>
						</MenuItem>
					)}

					{allowDisablingTask && (
						<MenuItem
							as="div"
							className={`${style} ${disableTaskStyle}`}
							onClick={() => toggleUpdateTaskStatusBox({ ...task, status: MyConstants.Statuses.Tasks.Disable })}>
							<FontAwesomeIcon className="w-5 red-text" icon={faBan} />
							<span className="font-regular-11">Disable</span>
						</MenuItem>
					)}

					{allowMarkingTaskCompleted && (
						<MenuItem
							as="div"
							className={`${style} ${markTaskCompletedStyle}`}
							onClick={() => toggleUpdateTaskStatusBox({ ...task, status: MyConstants.Statuses.Tasks.Completed })}>
							<FontAwesomeIcon className="w-5 green-text" icon={faClipboardCheck} />
							<span className="font-regular-11">Mark Completed</span>
						</MenuItem>
					)}
				</MenuItems>
			</Menu>
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
					<div className="flex w-full justify-between items-center">
						<div className="flex flex-col w-[15%] h-full px-5 justify-start items-center">
							{doSorting().map((task, index) => uiTasksList(task, index))}
						</div>
						{!Object.keys(mainData.selectedTask).length ? uiNoTaskSelected() : uiSelectedTask()}
					</div>
				</>
			);
		}
	};

	const uiNoTaskSelected = () => {
		return (
			<div className="flex flex-col w-[85%] h-[calc(100vh-140px)] space-y-2 justify-center items-center rounded shadow gray-text black-white-background">
				<FontAwesomeIcon className="text-6xl" icon={faCircleExclamation} />
				<span>Select a task</span>
			</div>
		);
	};

	const uiSelectedTaskNotesHeader = () => {
		const selectedTask = apiData.tasks.api.filter((task) => task.id == mainData.selectedTask.id).at(0);

		const task = typeof selectedTask === "object" ? selectedTask.task : "";
		const expense = typeof selectedTask === "object" ? Number(selectedTask.expense) : 0;
		const dueOn = typeof selectedTask === "object" ? dayjs(selectedTask.due_on).format("DD MMM, YYYY") : "";

		return <div className="flex w-full px-4 py-2 justify-center items-center bottom-border font-medium-14">Notes</div>;
	};

	const uiSelectedTask = () => {
		return (
			<div className="flex flex-col w-[85%] h-[calc(100vh-140px)] space-y-2 justify-start items-center rounded shadow black-white-background">
				<div className="flex flex-col w-full justify-start items-center shadow animate__animated animate__slideInDown">
					<div className="flex w-full black-white-background">{uiSelectedTaskHeader()}</div>
					<div className="flex flex-col w-full h-[244px] black-white-background">
						<div className="flex w-full pl-4 justify-center items-center primary-background">{uiSelectedTaskRowsHeaders()}</div>
						<div className="flex flex-col w-full h-[205px] overflow-y-auto">
							{getSelectedTaskData().map((task, index) => uiSelectedTaskRows(task, index))}
						</div>
					</div>
				</div>
				<div className="flex flex-col w-full justify-start items-center shadow animate__animated animate__slideInUp">
					<div className="flex w-full">{uiSelectedTaskNotesHeader()}</div>
					<div className="flex flex-col w-full h-[244px] shadow-md black-white-background">
						<div className="flex w-full pl-4 justify-center items-center primary-background">{uiSelectedTaskRowsHeaders()}</div>
						<div className="flex flex-col w-full h-[205px] overflow-y-auto">
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

	const uiSelectedTaskRows = (task, rowIndex) => {
		const style = "flex w-2/5 justify-start items-center whitespace-pre";

		return (
			<div className="flex w-full px-4 py-2 justify-center items-center black-white-background bottom-border font-regular-12" key={rowIndex}>
				<span className="mr-1">{rowIndex + 1}.</span>

				<span className={style} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(task.particular, mainData.searchTerm) }} />

				<span className={style} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(task.remark, mainData.searchTerm) }} />

				<span className="w-1/5 black-white-background black-text">{uiActions(task)}</span>
			</div>
		);
	};

	const uiSelectedTaskRowsHeaders = () => {
		return Object.values(tableHeaders).map((header, index) => {
			const width = index != 2 ? "w-2/5" : "w-1/5";
			const justification = index != 2 ? "justify-start" : "justify-center";

			const showSortArrow = header == mainData.sort.column ? "visible" : "invisible";
			const wrapper = `flex ${width} h-10 ${justification} items-center cursor-pointer text-center text-white font-medium-12`;

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

	// Main UI
	return (
		<>
			{uiMain()}

			{hasMounted.addTask && <AddTask addTask={addTask} mount={hasMounted.addTask} unmount={toggleAddTaskBox} />}

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
