"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import Tippy from "@tippyjs/react";
import writeXlsxFile from "write-excel-file";
import ReactDatePicker from "react-datepicker";
import MyConstants from "@/utilities/constants";

import { useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { TextAreaNative } from "@/components/Inputs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AddTask, UpdateStatus } from "@/modals/singleProject/miscellaneous";
import { SpinnerBig, SpinnerSmall, Tooltip } from "@/components/Elements";
import {
	faBan,
	faCheck,
	faCheckCircle,
	faPen,
	faPlus,
	faPlusCircle,
	faRotate,
	faSave,
	faSortAmountAsc,
	faSortAmountDesc,
	faTrash,
} from "@fortawesome/free-solid-svg-icons";

export default function Tasks({ reloadProjects, selectedClient, selectedProject, source }) {
	// Business Logic
	const [apiData, setApiData] = useState({
		tasks: { api: [], apiCopy: [] },
	});

	const [hasMounted, setHasMounted] = useState({
		addTask: false,
		updateStatus: false,
		markTaskCompleted: false,
	});

	const [mainData, setMainData] = useState({
		isLoading: {
			addSingleTask: 0,
			disableSingleTask: 0,
			changeStatus: 0,
			markTaskAsCompleted: 0,
			tasks: false,
		},
		searchTerm: "",
		selectedTask: {},
		sort: { column: "ID", isAscending: true },
	});

	const userId = MyGlobal.GetUserId();
	const tableHeaders = MyConstants.TableHeaders.Tasks;
	const isSourceSingleClient = source === "Single Client => Single Project";

	const allowNewTask = MyGlobal.HasPermission(MyConstants.Modules.Derived.NewTask);
	const allowUpdatingTask = MyGlobal.HasPermission(MyConstants.Modules.Derived.UpdateTask);
	const allowDisablingTask = MyGlobal.HasPermission(MyConstants.Modules.Derived.DisableTask);
	const allowMarkingTaskCompleted = MyGlobal.HasPermission(MyConstants.Modules.Derived.MarkTaskCompleted);

	// Functions
	const addNewTask = (task) => {
		if (allowNewTask) {
			const copy = [...apiData.tasks.api];

			copy.unshift({
				due_on: task.due_on,
				expense: task.expense,
				input_by: userId,
				is_disabled: false,
				is_new: true,
				remark: task.remark,
				content: task.content,
			});

			setApiData((old) => ({ ...old, tasks: { ...old.tasks, api: copy } }));
		}
	};

	const addTask = async (task) => {
		if (task.task && task.note) {
			setMainData((old) => ({ ...old, isLoading: { ...old.isLoading, addSingleTask: task.id } }));

			const body = {
				clientId: selectedClient.id,
				dueOn: dayjs(task.due_on).format("YYYY-MM-DD"),
				expense: task.expense,
				note: MyGlobal.EscapeString(task.note),
				projectId: selectedProject.id,
				task: MyGlobal.EscapeString(task.task),
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

	const deleteTask = (task) => {
		const copy = [...apiData.tasks.api];
		const finalTasks = copy.filter((_task) => _task.id != task.id);

		setApiData((old) => ({ ...old, tasks: { ...old.tasks, api: finalTasks } }));
	};

	const doSorting = () => {
		return apiData.tasks.api.sort((a, b) => {
			const aDate = new Date(a.due_on);
			const bDate = new Date(b.due_on);

			if (mainData.sort.column == tableHeaders.Id && mainData.sort.isAscending) {
				return a.id.localeCompare(b.id);
			} else if (mainData.sort.column == tableHeaders.Id && !mainData.sort.isAscending) {
				return b.id.localeCompare(a.id);
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
				return a.id.localeCompare(b.id);
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

	const setDueDate = (event, isDisabledTask, isNewTask, task) => {
		const date = dayjs(event).format("YYYY-MM-DD");

		if (isNewTask.length) {
			setMainData((old) => ({ ...old, selectedTask: { id: task.id, source: "due_on", value: date } }));
		}

		if (!isDisabledTask) {
			setInput(task.id, date, "due_on");
		}
	};

	const setExpense = (event, isDisabledTask, isNewTask, task) => {
		const value = Number(event.target.value);

		if (MyGlobal.HasNumbers(value)) {
			if (isNewTask.length) {
				setMainData((old) => ({ ...old, selectedTask: { id: task.id, source: "expense", value: value } }));
			}

			if (!isDisabledTask) {
				setInput(task.id, value, "expense");
			}
		}
	};

	const setInput = (id, input, source) => {
		const copy = [...apiData.tasks.api];

		const obj = copy.filter((task) => task.id == id).at(0);
		obj[source] = input;

		const revisedTasks = copy.filter((task) => task.id != id);
		revisedTasks.push(obj);

		setApiData((old) => ({ ...old, tasks: { ...old.tasks, api: revisedTasks } }));
	};

	const setRemark = (event, isDisabledTask, isNewTask, task) => {
		if (isNewTask.length) {
			setMainData((old) => ({ ...old, selectedTask: { id: task.id, source: "remark", value: event.target.value } }));
		}

		if (!isDisabledTask) {
			setInput(task.id, event.target.value, "remark");
		}
	};

	const setSort = (column) => {
		setMainData((old) => ({ ...old, sort: { column, isAscending: !mainData.sort.isAscending } }));
	};

	const setTask = (event, isDisabledTask, isNewTask, task) => {
		if (isNewTask.length) {
			setMainData((old) => ({ ...old, selectedTask: { id: task.id, source: "task", value: event.target.value } }));
		}

		if (!isDisabledTask) {
			setInput(task.id, event.target.value, "task");
		}
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

	// UI Components
	const uiAddOrUpdateTask = (iconClass, task) => {
		if (mainData.isLoading.addSingleTask == task.id) {
			return (
				<div className="w-4 h-4 relative">
					<SpinnerSmall />
				</div>
			);
		} else if (task.is_new) {
			return <FontAwesomeIcon className={iconClass} icon={faSave} onClick={() => addTask(task)} size="lg" />;
		} else {
			return <FontAwesomeIcon className={iconClass} icon={faRotate} onClick={() => allowUpdatingTask && toggleUpdateStatusBox(task)} size="lg" />;
		}
	};

	const uiDeleteOrDisableTask = (disabledIcon, disabledIconClass, task, title) => {
		if (mainData.isLoading.disableSingleTask == task.id) {
			return (
				<div className="w-4 h-4 relative">
					<SpinnerSmall />
				</div>
			);
		} else if (task.is_new) {
			return <FontAwesomeIcon className="cursor-pointer text-base red-text" icon={faTrash} onClick={() => deleteTask(task)} size="lg" />;
		} else {
			return (
				<FontAwesomeIcon
					className={disabledIconClass}
					icon={disabledIcon}
					onClick={() => allowDisablingTask && toggleUpdateStatusBox(task)}
					size="lg"
					title={title}
				/>
			);
		}
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
				<div className="flex flex-col w-full h-full space-y-2.5 justify-center items-center black-white-background top-border font-regular-12 gray-text">
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
		const lastTaskId = apiData.tasks.api.length && apiData.tasks.api.sort((a, b) => b.id.localeCompare(a.id)).at(0).id;

		// UI
		const style = "flex w-[14.28%] min-h-10 justify-center items-center text-center relative";
		const horizontalSpacing = isCompleted ? "space-x-1.5" : "space-x-0";
		const showCircledTick = isCompleted ? "block green-text" : "hidden";

		const strikeThrough = isDisabled ? "line-through decoration-3 gray-text" : "black-text";
		const background = isCompleted ? "light-gray-background pointer-events-none" : "bg-transparent pointer-events-auto";
		const inputClickEvent = isDisabled || isCompleted ? "pointer-events-none" : "pointer-events-auto";

		const wrapper = `flex w-full justify-center items-center black-text black-white-background bottom-border font-regular-12`;

		const tickIconClickEvent = isDisabled ? "opacity-25 pointer-events-none" : "opacity-100 pointer-events-auto";
		const tickIconStyle = `text-lg cursor-pointer green-text ${tickIconClickEvent}`;

		const addTaskIconStyle = task.id == lastTaskId ? "cursor-pointer !pointer-events-auto visible primary-text" : "invisible";

		const disableIcon = isDisabled ? faBan : faPen;
		const disableIconColour = isDisabled ? "primary-text" : "red-text";

		const disabledTaskClickEvent =
			task.input_by == userId ? `opacity-100 pointer-events-auto cursor-pointer ${disableIconColour}` : "opacity-25 pointer-events-none";

		const title = isDisabled ? "Enable Task" : "Disable Task";

		// Variables
		const insertedBy = MyGlobal.GetAnyDataFromId(task.input_by, "full_name");
		const isNewTask = apiData.tasks.api.filter((_task) => _task.id == task.id && _task.project_id == selectedProject.id);
		const tag = !isNewTask.length && <span className="green-tag text-xs">New</span>;

		return (
			<div className={wrapper} key={rowIndex}>
				<span className={`${style} ${horizontalSpacing}`}>
					<FontAwesomeIcon className={showCircledTick} icon={faCheckCircle} size="lg" />
					{isNewTask.length > 0 && <span>{task.id}</span>}
					{tag}
				</span>

				<span className={style} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(task.content, mainData.searchTerm) }} />

				<span
					className={style}
					dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(dayjs(task.due_on).format("DD/MM/YYYY"), mainData.searchTerm) }}
				/>

				<span className={style} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(insertedBy, mainData.searchTerm) }} />

				<span className={style} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(task.remark, mainData.searchTerm) }} />

				<span className={style} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(task.expense, mainData.searchTerm) }} />

				<span className={`${style} space-x-5`}>
					{!task.is_new && <FontAwesomeIcon className={addTaskIconStyle} icon={faPlus} onClick={() => addNewTask()} size="lg" />}

					{!isCompleted && uiAddOrUpdateTask(tickIconStyle, task)}
					{!isCompleted && uiDeleteOrDisableTask(disableIcon, disabledTaskClickEvent, task, title)}
					{uiTick(isCompleted, isDisabled, task)}
				</span>
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

	const uiTick = (isCompleted, isDisabled, task) => {
		if (!task.is_new && !isCompleted && !isDisabled) {
			return (
				<FontAwesomeIcon
					className="cursor-pointer green-text"
					icon={faCheck}
					onClick={() => allowMarkingTaskCompleted && toggleMarkTaskAsCompletedBox(task)}
					size="lg"
				/>
			);
		} else {
			return <FontAwesomeIcon className="green-text invisible" icon={faCheck} size="lg" />;
		}
	};

	// Main UI
	return (
		<>
			{uiMain()}

			{hasMounted.addTask && <AddTask addTask={addNewTask} mount={hasMounted.addTask} unmount={toggleAddTaskBox} />}

			{hasMounted.updateStatus && (
				<UpdateStatus mount={hasMounted.updateStatus} reloadTasks={getTasks} selectedTask={mainData.selectedTask} unmount={toggleUpdateStatusBox} />
			)}
		</>
	);
}
