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
import { AddTask, UpdateProjectStatus, UpdateTask } from "@/modals/singleProject/miscellaneous";
import {
	faBan,
	faCheckCircle,
	faChevronDown,
	faClipboardCheck,
	faPlusCircle,
	faSave,
	faSortAmountAsc,
	faSortAmountDesc,
	faStar,
	faTrash,
} from "@fortawesome/free-solid-svg-icons";

export default function Tasks({ reloadProjects, selectedClient, selectedProject, source }) {
	// Business Logic
	const [apiData, setApiData] = useState({
		tasks: { api: [], apiCopy: [] },
	});

	const [hasMounted, setHasMounted] = useState({
		addTask: false,
		markTaskCompleted: false,
		updateStatus: false,
		updateTask: false,
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
				content: task.content,
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
				return a.content.localeCompare(b.content);
			} else if (mainData.sort.column == tableHeaders.Task && !mainData.sort.isAscending) {
				return b.content.localeCompare(a.content);
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
			const response = await axios.get(MyConstants.ApiEndpoints.Getter, MyGlobal.GetHeaders({ projectId: selectedProject.id, type: "get-tasks" }));

			if (response.status === 200) {
				setApiData({ tasks: { api: response.data, apiCopy: response.data } });
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Get Tasks");
		} finally {
			setMainData((old) => ({ ...old, isLoading: { ...old.isLoading, tasks: false } }));
		}
	};

	const markTaskAsCompleted = async (taskId) => {
		setMainData((old) => ({ ...old, isLoading: { ...old.isLoading, markTaskAsCompleted: taskId } }));

		const body = {
			completedOn: dayjs().format("YYYY-MM-DD"),
			projectId: selectedProject.id,
			taskId,
			type: "mark-task-as-completed",
		};

		try {
			const response = await axios.post(MyConstants.ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				getTasks();

				MyGlobal.AddActivity(`Updated <b>${taskId}</b> of <b>${selectedProject.id}</b>.`, MyConstants.Modules.Base.Tasks);

				MyGlobal.ShowSuccessToast(MyConstants.Messages.TaskUpdated);
			} else {
				MyGlobal.ShowErrorToast(MyConstants.Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Mark Task Completed");
		} finally {
			setMainData((old) => ({ ...old, isLoading: { ...old.isLoading, markTaskAsCompleted: 0 } }));
		}
	};

	const saveTask = async (task) => {
		if (task.content && task.remark) {
			setMainData((old) => ({ ...old, isLoading: { ...old.isLoading, addSingleTask: task.id } }));

			const body = {
				clientId: selectedProject.client_id,
				content: MyGlobal.EscapeString(task.content),
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

	const setSort = (column) => {
		setMainData((old) => ({ ...old, sort: { column, isAscending: !mainData.sort.isAscending } }));
	};

	const toggleAddTaskBox = () => {
		setHasMounted((old) => ({ ...old, addTask: !hasMounted.addTask }));
	};

	const toggleMarkTaskAsCompletedBox = (task) => {
		setMainData((old) => ({ ...old, selectedTask: task ?? {} }));
		setHasMounted((old) => ({ ...old, markTaskCompleted: task ? true : false }));
	};

	const toggleUpdateStatusBox = (task) => {
		setMainData((old) => ({ ...old, selectedTask: task ?? {} }));
		setHasMounted((old) => ({ ...old, updateStatus: task ? true : false }));
	};

	const toggleUpdateTaskBox = (task) => {
		setMainData((old) => ({ ...old, selectedTask: task ?? {} }));
		setHasMounted((old) => ({ ...old, updateTask: task ? true : false }));
	};

	// UI Components
	const uiActionsMenu = (task) => {
		const style = "flex w-full p-2 space-x-2.5 justify-start items-center cursor-pointer border-y hovered-rows";

		const isUnsavedTask = task.id == "TK000000";

		const addTaskStyle = `${style} ${isUnsavedTask ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100"}`;

		const saveTaskStyle = `${style} ${!isUnsavedTask ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100"}`;

		const updateTaskStyle = `${style} ${isUnsavedTask ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100"}`;

		const deleteTaskStyle = `${style} ${!isUnsavedTask ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100"}`;

		const isTaskDisabled = isUnsavedTask && task.is_disabled == 1;
		const enableTaskStyle = `${style} ${!isTaskDisabled ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100"}`;

		const isTaskEnabled = isUnsavedTask && task.is_disabled == 0;
		const disableTaskStyle = `${style} ${isTaskEnabled ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100"}`;

		const isTaskWorthCompleting = !isUnsavedTask && task.is_disabled == 0;
		const markTaskCompletedStyle = `${style} ${!isTaskWorthCompleting ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100"}`;

		return (
			<Menu as="div" className="flex justify-center items-center relative">
				<MenuButton className="flex w-full space-x-2 justify-between items-center focus:outline-none font-regular-11">
					<span>Actions</span>
					<FontAwesomeIcon className="gray-text" icon={faChevronDown} />
				</MenuButton>
				<MenuItems className="absolute w-max top-6 right-0 origin-top-right rounded focus:outline-none z-50 black-white-background bottom-shadow full-border">
					{allowNewTask && (
						<MenuItem as="div" className={addTaskStyle} onClick={() => toggleAddTaskBox()}>
							<FontAwesomeIcon className="w-5 primary-text" icon={faPlusCircle} />
							<span className="font-regular-11">Add</span>
						</MenuItem>
					)}

					{allowNewTask && (
						<MenuItem as="div" className={saveTaskStyle} onClick={() => saveTask(task)}>
							<FontAwesomeIcon className="w-5 green-text" icon={faSave} />
							<span className="font-regular-11">Save</span>
						</MenuItem>
					)}

					{allowUpdatingTask && (
						<MenuItem as="div" className={updateTaskStyle} onClick={() => toggleUpdateTaskBox(task)}>
							<FontAwesomeIcon className="w-5 orange-text" icon={faStar} />
							<span className="font-regular-11">Update</span>
						</MenuItem>
					)}

					{allowNewTask && (
						<MenuItem as="div" className={deleteTaskStyle} onClick={() => deleteTask(task)}>
							<FontAwesomeIcon className="w-5 red-text" icon={faTrash} />
							<span className="font-regular-11">Delete</span>
						</MenuItem>
					)}

					{allowEnablingTask && (
						<MenuItem as="div" className={enableTaskStyle} onClick={() => {}}>
							<FontAwesomeIcon className="w-5 green-text" icon={faCheckCircle} />
							<span className="font-regular-11">Enable</span>
						</MenuItem>
					)}

					{allowDisablingTask && (
						<MenuItem as="div" className={disableTaskStyle} onClick={() => {}}>
							<FontAwesomeIcon className="w-5 red-text" icon={faBan} />
							<span className="font-regular-11">Disable</span>
						</MenuItem>
					)}

					{allowMarkingTaskCompleted && (
						<MenuItem as="div" className={markTaskCompletedStyle} onClick={() => {}}>
							<FontAwesomeIcon className="w-5 green-text" icon={faClipboardCheck} />
							<span className="font-regular-11">Mark Completed</span>
						</MenuItem>
					)}
				</MenuItems>
			</Menu>
		);
	};

	const uiHeaders = () => {
		return Object.values(tableHeaders).map((header, index) => {
			const showSortArrow = header == mainData.sort.column ? "visible" : "invisible";

			return (
				<span
					className="flex w-[14.28%] h-9 space-x-2 justify-center items-center cursor-pointer text-center text-white font-medium-10"
					onClick={() => setSort(header)}
					key={index}>
					<span>{header}</span>
					<span className={showSortArrow}>{uiSortArrows(header)}</span>
				</span>
			);
		});
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
					<div className="flex w-full primary-background">{uiHeaders()}</div>
					<div className="w-full h-[calc(100vh-141px)] overflow-y-auto black-white-background">
						{doSorting().map((task, index) => uiRows(task, index))}
					</div>
				</>
			);
		}
	};

	const uiRows = (task, rowIndex) => {
		const isCompleted = task.is_completed == 1;
		const isDisabled = task.is_disabled == 1;

		// UI
		const style = "flex w-[14.28%] min-h-10 justify-center items-center text-center relative right-border";
		const horizontalSpacing = isCompleted ? "space-x-1.5" : "space-x-0";
		const showCircledTick = isCompleted ? "block green-text" : "hidden";

		const strikeThrough = isDisabled ? "line-through decoration-3 gray-text" : "black-text";
		const background = isCompleted ? "light-gray-background pointer-events-none" : "bg-transparent pointer-events-auto";
		const inputClickEvent = isDisabled || isCompleted ? "pointer-events-none" : "pointer-events-auto";

		const wrapper = `flex w-full justify-center items-center black-text black-white-background bottom-border font-regular-11 hovered-rows-2`;

		// Variables
		const insertedBy = MyGlobal.GetAnyDataFromId(task.input_by, "full_name");

		const isNewTask = apiData.tasks.api.filter((_task) => _task.id == task.id && _task.project_id == selectedProject.id);

		const tag = !isNewTask.length && <span className="orange-tag text-sm">Unsaved</span>;

		return (
			<div className={wrapper} key={rowIndex}>
				<span className={`${style} ${horizontalSpacing}`}>
					<FontAwesomeIcon className={showCircledTick} icon={faCheckCircle} size="lg" />
					{isNewTask.length > 0 && <span>{task.id}</span>}
					{tag}
				</span>

				<span className={style} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(task.content, mainData.searchTerm) }} />

				<span className={style}>{dayjs(task.due_on).format("DD/MM/YYYY")}</span>

				<span className={style} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(insertedBy, mainData.searchTerm) }} />

				<span className={style} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(task.remark, mainData.searchTerm) }} />

				<span className={style} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(task.expense, mainData.searchTerm) }} />

				<span className={style}>{uiActionsMenu(task)}</span>
			</div>
		);
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
		</>
	);
}
