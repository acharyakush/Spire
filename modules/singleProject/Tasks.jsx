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
import { AddParticularAndRemark, AddTask, DeleteTask, EditParticularAndRemark, EditTask, EditTaskStatus } from "@/modals/singleProject/tasks";
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
	faStar,
	faStopwatch,
	faTrash,
} from "@fortawesome/free-solid-svg-icons";

export default function Tasks({ selectedClient, selectedProject, source }) {
	// Business Logic
	const allTasksTableHeaders = MyConstants.TableHeaders.Tasks;
	const allTasksRemarksTableHeaders = MyConstants.TableHeaders.TasksRemarks;
	const isSourceSingleClient = source === "Single Client => Single Project";

	const [apiData, setApiData] = useState({
		allTasks: { api: [], apiCopy: [] },
		allTasksRemarks: { api: [], apiCopy: [] },
	});

	const [hasMounted, setHasMounted] = useState({
		addParticularAndRemark: false,
		addTask: false,
		deleteTask: false,
		editParticularAndRemark: false,
		editTask: false,
		editTaskStatus: false,
		markTaskCompleted: false,
	});

	const [mainData, setMainData] = useState({
		isLoading: false,
		searchTerm: "",
		selectedModuleId: 1,
		selectedTask: {},
		sortAllTasksRemarks: { column: allTasksRemarksTableHeaders.Date, isAscending: false },
		sortSelectedTask: { column: allTasksTableHeaders.Particulars, isAscending: true },
	});

	const allowDeletingTask = MyGlobal.HasPermission(MyConstants.Modules.Derived.DeleteTask);
	const allowDisablingTask = MyGlobal.HasPermission(MyConstants.Modules.Derived.DisableTask);

	const allowEditingTask = MyGlobal.HasPermission(MyConstants.Modules.Derived.EditTask);
	const allowEnablingTask = MyGlobal.HasPermission(MyConstants.Modules.Derived.EnableTask);

	const allowMarkingTaskCompleted = MyGlobal.HasPermission(MyConstants.Modules.Derived.MarkTaskCompleted);
	const allowNewTask = MyGlobal.HasPermission(MyConstants.Modules.Derived.NewTask);

	const allowDeletingParticularAndRemark = MyGlobal.HasPermission(MyConstants.Modules.Derived.DeleteParticularAndRemark);

	const allowEditingParticularAndRemark = MyGlobal.HasPermission(MyConstants.Modules.Derived.EditParticularAndRemark);

	// Functions
	const exportToExcel = () => {
		const records = [];
		const _records = [];

		const columnsWidth = [];
		const dataHeaders = [];

		const rowHeight = 28;
		const maximumColumnWidth = 20;

		const getHeaders = Object.values(allTasksTableHeaders).filter((header) => header != allTasksTableHeaders.Actions);
		const blankRows = [{ span: getHeaders.length, height: rowHeight, colSpan: 2 }];

		sortSelectedTaskRows().forEach((task) => {
			const isNewTask = apiData.allTasks.apiCopy.filter((_task) => _task.id == task.id && _task.project_id == selectedProject.id);

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

	const getSelectedTaskData = () => {
		let array = [];

		if (apiData.allTasks.api.length) {
			const result = apiData.allTasks.api.filter((object) => object.project_id == selectedProject.id && object.id == mainData.selectedTask.id);

			if (result.length) {
				array = result;
			}
		}

		return array;
	};

	const getTasks = async () => {
		setMainData((old) => ({ ...old, isLoading: true }));

		try {
			const allTasksResult = await axios.get(MyConstants.ApiEndpoints.Getter, MyGlobal.GetHeaders({ projectId: selectedProject.id, type: "get-tasks" }));

			const allTasksParticularsAndRemarksResult = await axios.get(
				MyConstants.ApiEndpoints.Getter,
				MyGlobal.GetHeaders({ projectId: selectedProject.id, type: "get-tasks-particulars-and-remarks" }),
			);

			const allTasks = allTasksResult.data.map((task) => {
				const particularsAndRemarks = allTasksParticularsAndRemarksResult.data.filter(
					(record) => record.task_id == task.id && record.project_id == task.project_id,
				);

				return { ...task, particulars_and_remarks: particularsAndRemarks };
			});

			const allTasksRemarks = allTasksParticularsAndRemarksResult.data.map((record) => {
				const taskName = allTasksResult.data.filter((task) => task.id == record.task_id).at(0).task;
				const writtenBy = MyGlobal.GetAnyDataFromId(record.created_by, "full_name");

				return { ...record, created_by: writtenBy, task_name: taskName };
			});

			setApiData({
				allTasks: { api: allTasks, apiCopy: allTasks },
				allTasksRemarks: { api: allTasksRemarks, apiCopy: allTasksRemarks },
			});
		} catch (error) {
			MyGlobal.HandleErrors(error, "Get Tasks");
		} finally {
			setMainData((old) => ({ ...old, isLoading: false }));
		}
	};

	const setAllTasksRemarksSorting = (column) => {
		setMainData((old) => ({ ...old, sortAllTasksRemarks: { column, isAscending: !mainData.sortAllTasksRemarks.isAscending } }));
	};

	const setSelectedModule = (moduleId) => {
		setMainData((old) => ({ ...old, selectedModuleId: moduleId, selectedTask: {} }));
	};

	const setSelectedTask = (task) => {
		setMainData((old) => ({ ...old, selectedModuleId: 0, selectedTask: task }));
	};

	const setSelectedTaskSorting = (column) => {
		if (column != allTasksTableHeaders.Actions) {
			setMainData((old) => ({ ...old, sortSelectedTask: { column, isAscending: !mainData.sortSelectedTask.isAscending } }));
		}
	};

	const sortAllTasksRemarksRows = () => {
		return apiData.allTasksRemarks.api.sort((a, b) => {
			const aCreatedAt = new Date(a.created_at);
			const bCreatedAt = new Date(b.created_at);

			const { column, isAscending } = mainData.sortAllTasksRemarks;

			if (column == allTasksRemarksTableHeaders.Task && isAscending) {
				return a.task_name.localeCompare(b.task_name);
			} else if (column == allTasksRemarksTableHeaders.Task && !isAscending) {
				return b.task_name.localeCompare(a.task_name);
			} else if (column == allTasksRemarksTableHeaders.Remark && isAscending) {
				return a.remark.localeCompare(b.remark);
			} else if (column == allTasksRemarksTableHeaders.Remark && !isAscending) {
				return b.remark.localeCompare(a.remark);
			} else if (column == allTasksRemarksTableHeaders.Date && isAscending) {
				return aCreatedAt - bCreatedAt;
			} else if (column == allTasksRemarksTableHeaders.Date && !isAscending) {
				return bCreatedAt - aCreatedAt;
			} else if (column == allTasksRemarksTableHeaders.WrittenBy && !isAscending) {
				return a.created_by.localeCompare(b.created_by);
			} else if (column == allTasksRemarksTableHeaders.WrittenBy && !isAscending) {
				return b.created_by.localeCompare(a.created_by);
			}
		});
	};

	const sortSelectedTaskRows = () => {
		return getSelectedTaskData()
			.at(0)
			?.particulars_and_remarks?.sort((a, b) => {
				const { column, isAscending } = mainData.sortSelectedTask;

				if (column == allTasksTableHeaders.Particulars && isAscending) {
					return a.particular.localeCompare(b.particular);
				} else if (column == allTasksTableHeaders.Particulars && !isAscending) {
					return b.particular.localeCompare(a.particular);
				} else if (column == allTasksTableHeaders.Remark && isAscending) {
					return a.remark.localeCompare(b.remark);
				} else if (column == allTasksTableHeaders.Remark && !isAscending) {
					return b.remark.localeCompare(a.remark);
				}
			});
	};

	const toggleAddParticularAndRemarkBox = (task) => {
		setHasMounted((old) => ({ ...old, addParticularAndRemark: !hasMounted.addParticularAndRemark }));
	};

	const toggleAddTaskBox = () => {
		setHasMounted((old) => ({ ...old, addTask: !hasMounted.addTask }));
	};

	const toggleDeleteTaskBox = (task) => {
		setMainData((old) => ({ ...old, selectedTask: task ?? {} }));
		setHasMounted((old) => ({ ...old, deleteTask: !hasMounted.deleteTask }));
	};

	const toggleEditParticularAndRemarkBox = (task) => {
		setHasMounted((old) => ({ ...old, editParticularAndRemark: !hasMounted.editParticularAndRemark }));
	};

	const toggleEditTaskBox = (task) => {
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
		setHasMounted((old) => ({ ...old, editTask: task ? true : false }));
	};

	const toggleEditTaskStatusBox = (task) => {
		setMainData((old) => ({ ...old, selectedTask: task ?? {} }));
		setHasMounted((old) => ({ ...old, editTaskStatus: task ? true : false }));
	};

	// UI Components
	const uiAllTasks = () => {
		return apiData.allTasks.api.map((task, index) => {
			const showAddTaskButton = apiData.allTasks.api.length - 1 == index;
			const totalParticularsAndRemarks = apiData.allTasksRemarks.api.filter((record) => record.task_id == task.id).length;

			const iconColour = task.is_completed == 1 ? "green-text" : "red-text";
			const iconStyle = `mr-2.5 ${iconColour}`;

			const icon =
				task.is_completed == 1 ? (
					<FontAwesomeIcon className={iconStyle} icon={faCircleCheck} />
				) : task.is_disabled == 1 ? (
					<FontAwesomeIcon className={iconStyle} icon={faBan} />
				) : (
					""
				);

			const selectedTaskStyle =
				task.id == mainData.selectedTask?.id ? "primary-border primary-background-transparent-01 primary-text" : "full-border bg-white black-text";

			const wrapper = `flex w-full h-10 px-5 justify-between items-center rounded shadow ${selectedTaskStyle} font-regular-11 hovered-rows`;

			return (
				<div className="flex w-full space-x-3 justify-start items-center">
					<button className={wrapper} key={index} onClick={() => setSelectedTask(task)}>
						<div className="flex justify-center items-center">
							{icon}
							<span>{task.task}</span>
						</div>
						{totalParticularsAndRemarks > 0 && <span className="font-regular-10 gray-text">{totalParticularsAndRemarks}</span>}
					</button>
					{allowNewTask && showAddTaskButton && (
						<FontAwesomeIcon className="cursor-pointer primary-text" icon={faPlusCircle} onClick={() => toggleAddTaskBox()} size="lg" />
					)}
				</div>
			);
		});
	};

	const uiAllTasksRemarksButton = () => {
		const selectedAesthetics =
			mainData.selectedModuleId == 1 ? "primary-border primary-background-transparent-01 primary-text" : "full-border bg-white black-text";

		const wrapper = `flex w-full h-10 px-5 justify-between items-center rounded shadow ${selectedAesthetics} font-regular-11 hovered-rows`;

		return (
			<button className={wrapper} onClick={() => setSelectedModule(1)}>
				<span>All Remarks</span>
				<span className="font-regular-10 gray-text">{apiData.allTasksRemarks.api.length}</span>
			</button>
		);
	};

	const uiAllTasksRemarks = () => {
		return (
			<div className="flex flex-col w-full h-full justify-between items-center contrast-background">
				<div className="flex w-full px-4 justify-center items-center primary-background">{uiAllTasksRemarksHeaders()}</div>
				<div className="flex flex-col w-full h-full overflow-y-auto">
					{sortAllTasksRemarksRows().map((remark, index) => uiAllTasksRemarksRows(remark, index))}
				</div>
			</div>
		);
	};

	const uiAllTasksRemarksHeaders = () => {
		return Object.values(MyConstants.TableHeaders.TasksRemarks).map((header, index) => {
			const showSortArrow = header == mainData.sortAllTasksRemarks.column ? "visible" : "invisible";

			return (
				<span
					className="flex w-1/4 h-10 space-x-1.5 justify-center items-center cursor-pointer text-center text-white font-medium-11"
					onClick={() => setAllTasksRemarksSorting(header)}
					key={index}>
					<span>{header}</span>
					<span className={showSortArrow}>{uiAllTasksRemarksHeadersSortArrows(header)}</span>
				</span>
			);
		});
	};

	const uiAllTasksRemarksHeadersSortArrows = (column) => {
		if (mainData.sortAllTasksRemarks.column == column) {
			if (mainData.sortAllTasksRemarks.isAscending) {
				return <FontAwesomeIcon icon={faSortAmountAsc} />;
			} else {
				return <FontAwesomeIcon icon={faSortAmountDesc} />;
			}
		}
	};

	const uiAllTasksRemarksRows = (remark, rowIndex) => {
		const style = `flex w-1/4 justify-center items-center whitespace-pre-wrap`;

		return (
			<div className="flex w-full px-4 py-2 justify-center items-center contrast-background bottom-border font-regular-11 hovered-rows-2" key={rowIndex}>
				<span className={style}>{remark.task_name}</span>

				<span className={style} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(remark.remark, mainData.searchTerm) }} />

				<span className={style}>{dayjs(remark.created_at).format("hh:mm:ss a, DD MMM, YYYY")}</span>

				<span className={style} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(remark.created_by, mainData.searchTerm) }} />
			</div>
		);
	};

	const uiMain = () => {
		if (mainData.isLoading) {
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
								<div className="flex flex-col w-full h-full space-y-2.5 justify-start items-center">{uiAllTasks()}</div>
								{uiAllTasksRemarksButton()}
							</div>
							<div className="flex flex-col w-[85%] h-full mr-5 space-y-2 justify-start items-center rounded shadow contrast-background">
								{!apiData.allTasksRemarks.api.length
									? uiNoDataFound()
									: Object.keys(mainData.selectedTask).length
									? uiSelectedTask()
									: uiAllTasksRemarks()}
							</div>
						</div>
					</div>
				</>
			);
		}
	};

	const uiNoDataFound = () => {
		return (
			<div className="flex flex-col w-[85%] h-full space-y-2 justify-center items-center rounded shadow gray-text contrast-background">
				<FontAwesomeIcon className="text-6xl" icon={faCircleExclamation} />
				<span>No tasks alloted</span>
				<button className="space-x-1.5 primary-button-transparent-background" onClick={() => toggleAddTaskBox()}>
					<FontAwesomeIcon className="primary-text" icon={faPlusCircle} />
					<span>Add</span>
				</button>
			</div>
		);
	};

	const uiNoParticularsAndRemarksFound = () => {
		return (
			<div className="flex flex-col w-full h-full space-y-2 justify-center items-center rounded shadow gray-text contrast-background">
				<FontAwesomeIcon className="text-6xl" icon={faCircleExclamation} />
				<span>No particulars or remarks found</span>
				<button className="space-x-1.5 primary-button-transparent-background" onClick={() => toggleAddParticularAndRemarkBox()}>
					<FontAwesomeIcon className="primary-text" icon={faPlusCircle} />
					<span>Add</span>
				</button>
			</div>
		);
	};

	const uiSelectedTask = () => {
		return (
			<div className="flex flex-col w-full h-full justify-start items-center">
				<div className="flex w-full contrast-background">{uiSelectedTaskPrimaryInformation()}</div>
				{!sortSelectedTaskRows().length ? (
					uiNoParticularsAndRemarksFound()
				) : (
					<div className="flex flex-col w-full h-full contrast-background">
						<div className="flex w-full px-4 justify-center items-center primary-background">{uiSelectedTaskRowsHeaders()}</div>
						<div className="flex flex-col w-full h-full overflow-y-auto">
							{sortSelectedTaskRows().map((task, index) => uiSelectedTaskRows(task, index))}
						</div>
					</div>
				)}
			</div>
		);
	};

	const uiSelectedTaskActions = (task) => {
		const style = "flex w-full py-2 space-x-2.5 justify-start items-center cursor-pointer border-y hovered-rows";

		const noClickAndHalfOpacity = "pointer-events-none opacity-25";
		const clickAndFullOpacity = "pointer-events-auto opacity-100";

		const editTaskStyle = allowEditingTask && (task.is_disabled == 1 || task.is_completed == 1) ? noClickAndHalfOpacity : clickAndFullOpacity;

		const deleteTaskStyle = allowDeletingTask ? noClickAndHalfOpacity : clickAndFullOpacity;
		const enableTaskStyle = allowEnablingTask && task.is_disabled == 1 ? clickAndFullOpacity : noClickAndHalfOpacity;

		const disableTaskStyle = allowDisablingTask && task.is_completed == 0 && task.is_disabled == 0 ? clickAndFullOpacity : noClickAndHalfOpacity;

		const markTaskCompletedStyle =
			allowMarkingTaskCompleted && task.is_completed == 0 && task.is_disabled == 0 ? clickAndFullOpacity : noClickAndHalfOpacity;

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
	};

	const uiSelectedTaskParticularsAndRemarksActions = (task) => {
		const style = "flex w-full p-2 space-x-2.5 justify-start items-center cursor-pointer border-y hovered-rows-2";

		const deleteRecordStyle = allowDeletingParticularAndRemark ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-25";

		const editRecordStyle = allowEditingParticularAndRemark ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-25";

		return (
			<Tippy
				allowHTML
				animation="fade"
				arrow
				className="relative z-40"
				content={
					<div className="flex flex-col justify-center items-center">
						<div className={style} onClick={() => toggleAddParticularAndRemarkBox(task)}>
							<FontAwesomeIcon className="w-5 primary-text" icon={faPlusCircle} />
							<span>Add</span>
						</div>

						<div className={`${style} ${editRecordStyle}`} onClick={() => toggleEditParticularAndRemarkBox(task)}>
							<FontAwesomeIcon className="w-5 orange-text" icon={faStar} />
							<span>Edit</span>
						</div>

						<div className={`${style} ${deleteRecordStyle}`} onClick={() => toggleDeleteTaskBox(task)}>
							<FontAwesomeIcon className="w-5 red-text" icon={faTrash} />
							<span>Delete</span>
						</div>
					</div>
				}
				hideOnClick
				interactive
				placement="bottom"
				theme="light"
				trigger="click">
				<FontAwesomeIcon className="cursor-pointer green-text" icon={faBolt} />
			</Tippy>
		);
	};

	const uiSelectedTaskPrimaryInformation = () => {
		const selectedTask = apiData.allTasks.api.find((task) => task.id == mainData.selectedTask.id);
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
					{!isCompleted && uiSelectedTaskActions(mainData.selectedTask)}
				</div>
				<div className="flex !px-2.5 space-x-2.5 justify-between items-center red-tag-transparent-01">
					<FontAwesomeIcon className="font-regular-11" icon={faStopwatch} />
					<span className="font-medium-11">{dueOn}</span>
				</div>
			</div>
		);
	};

	const uiSelectedTaskRows = (task, rowIndex) => {
		const style = "flex w-1/3 justify-center items-center whitespace-pre-wrap";

		return (
			<div className="flex w-full px-4 py-2 justify-center items-center contrast-background border-y font-regular-11 hovered-rows-2" key={rowIndex}>
				<span className={style} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(task.particular, mainData.searchTerm) }} />

				<span className={style} dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(task.remark, mainData.searchTerm) }} />

				<span className={style}>{uiSelectedTaskParticularsAndRemarksActions(task)}</span>
			</div>
		);
	};

	const uiSelectedTaskRowsHeaders = () => {
		return Object.values(allTasksTableHeaders).map((header, index) => {
			const showSortArrow = header == mainData.sortSelectedTask.column && header != allTasksTableHeaders.Actions ? "visible" : "invisible";
			const wrapper = `flex w-1/3 h-10 space-x-1.5 justify-center items-center cursor-pointer text-center text-white font-medium-11`;

			return (
				<span className={wrapper} onClick={() => setSelectedTaskSorting(header)} key={index}>
					<span>{header}</span>
					<span className={showSortArrow}>{uiSelectedTaskRowsHeadersSortArrows(header)}</span>
				</span>
			);
		});
	};

	const uiSelectedTaskRowsHeadersSortArrows = (column) => {
		if (mainData.sortSelectedTask.column == column) {
			if (mainData.sortSelectedTask.isAscending) {
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

			{hasMounted.addParticularAndRemark && (
				<AddParticularAndRemark
					mount={hasMounted.addParticularAndRemark}
					reloadTasks={getTasks}
					selectedTask={mainData.selectedTask}
					unmount={toggleAddParticularAndRemarkBox}
				/>
			)}

			{hasMounted.addTask && <AddTask mount={hasMounted.addTask} reloadTasks={getTasks} selectedProject={selectedProject} unmount={toggleAddTaskBox} />}

			{hasMounted.deleteTask && (
				<DeleteTask mount={hasMounted.deleteTask} reloadTasks={getTasks} selectedTask={mainData.selectedTask} unmount={toggleDeleteTaskBox} />
			)}

			{hasMounted.editParticularAndRemark && (
				<EditParticularAndRemark
					mount={hasMounted.editParticularAndRemark}
					reloadTasks={getTasks}
					selectedTask={mainData.selectedTask}
					unmount={toggleEditParticularAndRemarkBox}
				/>
			)}

			{hasMounted.editTask && (
				<EditTask mount={hasMounted.editTask} reloadTasks={getTasks} selectedTask={mainData.selectedTask} unmount={toggleEditTaskBox} />
			)}

			{hasMounted.editTaskStatus && (
				<EditTaskStatus
					mount={hasMounted.editTaskStatus}
					reloadTasks={getTasks}
					selectedTask={mainData.selectedTask}
					unmount={toggleEditTaskStatusBox}
				/>
			)}
		</>
	);
}
