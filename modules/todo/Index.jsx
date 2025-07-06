"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import Tippy from "@tippyjs/react";
import MyConstants from "@/utilities/constants";

import { CSS } from "@dnd-kit/utilities";
import { MyGlobal } from "@/utilities/global";
import { useEffect, useMemo, useState } from "react";
import { TextInputNative } from "@/components/Inputs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { AvatarCircle, Badge, BadgeSmall, Tooltip } from "@/components/Elements";
import { faClock, faClockRotateLeft, faCrown, faFilter, faFilterCircleXmark, faHourglassEnd, faHourglassHalf, faPencilAlt, faPlusCircle, faSearch, faTrash, faUserAlt } from "@fortawesome/free-solid-svg-icons";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, useDroppable, DragOverlay } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, sortableKeyboardCoordinates, defaultAnimateLayoutChanges, verticalListSortingStrategy } from "@dnd-kit/sortable";

const DynamicAddToDo = dynamic(() => import("@/modals/todos/AddTodo"), { ssr: false });
const DynamicDeleteTodo = dynamic(() => import("@/modals/todos/DeleteTodo"), { ssr: false });
const DynamicEditTodo = dynamic(() => import("@/modals/todos/EditTodo"), { ssr: false });
const DynamicDetails = dynamic(() => import("@/modals/todos/Details"), { ssr: false });

const animateLayoutChanges = (args) => defaultAnimateLayoutChanges({ ...args, wasDragging: true });

export default function Todos({ presetStatus, setModuleProps }) {
	// Business Logic
	const initialTodos = {
		pending: [],
		inProgress: [],
		completed: [],
	};

	const IsUserAdministrator = MyGlobal.IsUserAdministrator();

	const [activeCard, setActiveCard] = useState(null);
	const [projects, setProjects] = useState([]);
	const [subProjects, setSubProjects] = useState([]);

	const [columns, setColumns] = useState(initialTodos);
	const [columnsCopy, setColumnsCopy] = useState(initialTodos);

	const [isLoading, setIsLoading] = useState({ updateStatus: false });
	const [mounted, setMounted] = useState({ addTodoBox: false, deleteTodo: false, editTodo: false, details: false });

	const [statuses, setStatuses] = useState([
		{ count: 0, label: "Overdue" },
		{ count: 0, label: "Today" },
		{ count: 0, label: "Tomorrow" },
		{ count: 0, label: "All" },
	]);

	const [main, setMain] = useState({
		find: "",
		isLoading: false,
		revisedStaff: [],
		selectedTodo: {},
		selectedStaff: { fullName: "", id: "", type: "" },
		status: presetStatus || statuses.at(-1).label,
	});

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const thisView = MyConstants.Modules.Base.Todos;
	const showFindClearButton = useMemo(() => (main.find ? "cursor-pointer primary-text" : "hidden"), [main.find]);

	const totalCount = columns.completed.length + columns.inProgress.length + columns.pending.length;
	const totalCopyCount = columnsCopy.completed.length + columnsCopy.inProgress.length + columnsCopy.pending.length;

	function Card({ item, column, activeCard }) {
		const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
			id: item.id,
			data: { column },
			animateLayoutChanges,
		});

		const isActive = activeCard?.id === item.id;

		const style = {
			boxShadow: isDragging ? "0 2px 6px rgba(0,0,0,0.1)" : "none",
			transform: CSS.Transform.toString(transform),
			transition: `${transition}, transform 250ms ease, margin 250ms ease`,
			opacity: isDragging && isActive ? 0 : 1,
			visibility: isDragging && isActive ? "hidden" : "visible",
			zIndex: isDragging ? 999 : "auto",
			pointerEvents: isDragging && isActive ? "none" : "auto",
			cursor: "grab",
			willChange: "transform, margin",
		};

		let svgFileName = "";
		let dueDateTextColor = "";

		const getAssignedToNames = MyGlobal.GetAnyDataFromId(item.assigned_to, "full_name");
		const assignedToNames = String(getAssignedToNames).split(",");

		function getBackgroundColour() {
			switch (item.priority) {
				case "Low":
					svgFileName = "gray";
					dueDateTextColor = "text-gray-900";
					return "low-priority";
				case "Medium":
					svgFileName = "red";
					dueDateTextColor = "text-red-900";
					return "medium-priority";
				case "High":
					svgFileName = "orange";
					dueDateTextColor = "text-orange-900";
					return "high-priority";
				case "Urgent":
					svgFileName = "yellow";
					dueDateTextColor = "text-yellow-900";
					return "urgent-priority";
			}
		}

		function getPriorityStyle() {
			switch (item.priority) {
				case "Low":
					return "px-1.5 py-0.5 bg-gray-100 text-gray-900 text-xs font-medium rounded";
				case "Medium":
					return "px-1.5 py-0.5 bg-red-100 text-red-900 text-xs font-medium rounded";
				case "High":
					return "px-1.5 py-0.5 bg-orange-100 text-orange-900 text-xs font-medium rounded";
				case "Urgent":
					return "px-1.5 py-0.5 bg-yellow-100 text-yellow-900 text-xs font-medium rounded";
			}
		}

		const descriptionColour = item.priority === "Low" ? "text-black" : "text-white";

		const container = `flex flex-col w-full h-full space-y-3 px-4 py-3 justify-between items-center bottom-border rounded-md transition-all duration-200 ease-in-out hover:scale-105 hover:-translate-y-1.5 hover:shadow-lg ${getBackgroundColour()}`;

		const dueDateStyle = `font-regular-9 ${dueDateTextColor}`;

		let isDelayed = false;

		if (item.description_timeline) {
			if (typeof item.description_timeline === "string") {
				const parsed = JSON.parse(item.description_timeline);

				if (Array.isArray(parsed) && parsed.length) {
					isDelayed = parsed.length > 1;
				}
			}
		}

		const project = item.project_id ? projects.find((f) => f.id === item.project_id) : "";
		const subProjectId = item.project_id && project ? subProjects.find((f) => f.id === project.sub_project_id).name : "";

		return (
			<div
				className={container}
				ref={setNodeRef}
				style={style}
				{...attributes}
				{...listeners}>
				<div className="flex w-full justify-between items-start">
					<div className="w-4/5 h-11 flex flex-col font-medium-12 overflow-hidden whitespace-nowrap">
						<span
							className={descriptionColour}
							dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(item.description, main.find) }}
						/>
						<span className={descriptionColour + " text-xs !font-normal"}>{subProjectId}</span>
					</div>
					<div className="flex w-1/5 space-x-3 justify-end items-center">
						<Tippy
							animation="shift-away"
							content={<Tooltip text={item.notes_timeline ? JSON.parse(item.notes_timeline)?.at(0) : item.notes ?? "No notes entered."} />}
							placement="bottom">
							<img
								src={`/information-circle-${svgFileName}.svg`}
								alt="icon"
								className="w-5 h-5 cursor-pointer"
								onClick={(e) => {
									e.stopPropagation();
									toggleDetails({ item });
								}}
							/>
						</Tippy>
						{IsUserAdministrator && (
							<Tippy
								animation="shift-away"
								content={<Tooltip text="Edit" />}
								placement="bottom">
								<FontAwesomeIcon
									className="cursor-pointer outline-none text-sky-600"
									icon={faPencilAlt}
									onClick={(e) => {
										e.stopPropagation();
										toggleEditTodo({ item });
									}}
								/>
							</Tippy>
						)}
						{IsUserAdministrator && (
							<Tippy
								animation="shift-away"
								content={<Tooltip text="Delete" />}
								placement="bottom">
								<FontAwesomeIcon
									className="cursor-pointer outline-none text-red-600"
									icon={faTrash}
									onClick={(e) => {
										e.stopPropagation();
										toggleDeleteTodo({ item });
									}}
								/>
							</Tippy>
						)}
					</div>
				</div>

				<div className="flex w-full justify-between items-center">
					<div className="flex w-2/ justify-start items-center">
						<AvatarCircle names={assignedToNames} />
					</div>
					<div className="flex w-1/2 space-x-2 justify-end items-center">
						<span className={dueDateStyle}>{item.due_date ? dayjs(item.due_date).format("DD MMM, YYYY") : ""}</span>

						{isDelayed && (
							<span
								className="px-1.5 py-0.5 bg-purple-900 text-purple-100 text-xs 
						font-medium rounded">
								Delayed
							</span>
						)}

						<span className={getPriorityStyle()}>{item.priority}</span>
					</div>
				</div>
			</div>
		);
	}

	function Column({ id, items, activeCard }) {
		const { setNodeRef, isOver } = useDroppable({ id });

		const icon = id === "pending" ? faClockRotateLeft : id === "inProgress" ? faHourglassHalf : faHourglassEnd;

		const cardsAreaBackground = isOver ? "bg-[#e0f7fa]" : "bg-[#f9f9f9]";
		const cardsAreaStyle = `flex flex-col gap-2.5 overflow-y-auto transition-all duration-200 ease-linear ${cardsAreaBackground}`;

		return (
			<div className="flex flex-col w-full h-full p-3 space-y-3 rounded justify-start bg-gray-50 border border-gray-300">
				<div className="flex w-full px-3 justify-between items-center">
					<div className="flex w-full space-x-2 justify-start items-center">
						<FontAwesomeIcon icon={icon} />
						<span className="font-semibold-14 capitalize">{id}</span>
					</div>
					{items.length > 0 && <Badge value={items.length} />}
				</div>

				<div
					className={cardsAreaStyle}
					ref={setNodeRef}>
					<SortableContext
						items={items.map((m) => m.id)}
						strategy={verticalListSortingStrategy}>
						<div className="flex flex-col px-3 space-y-4 overflow-visible">
							{items.map((m) => (
								<Card
									key={m.id}
									item={m}
									column={id}
									activeCard={activeCard}
								/>
							))}
						</div>
					</SortableContext>
				</div>
			</div>
		);
	}

	// Functions
	function getFilteredData() {
		return Object.fromEntries(
			Object.entries(columnsCopy).map(([key, todos]) => {
				let filteredTodos = todos;

				// Step 1: filter by selected staff
				if (main.selectedStaff.id) {
					filteredTodos = filteredTodos.filter((f) => {
						if (main.selectedStaff.type && main.selectedStaff.type === "Assigned alone") {
							return String(f.assigned_to) === main.selectedStaff.id;
						}

						return String(f.assigned_to).includes(main.selectedStaff.id);
					});
				}

				if (main.find) {
					filteredTodos = filteredTodos.filter((f) => String(f.description).toLowerCase().includes(main.find.toLowerCase()));
				}

				// Step 2: filter by due date
				if (main.status === "Today") {
					filteredTodos = filteredTodos.filter((f) => dayjs(f.due_date).format("DD-MM-YYYY") === dayjs().format("DD-MM-YYYY"));
				} else if (main.status === "Overdue") {
					filteredTodos = filteredTodos.filter((f) => f.status !== "Completed" && dayjs(f.due_date, "DD-MM-YYYY").isBefore(dayjs().startOf("day")));
				} else if (main.status === "Tomorrow") {
					filteredTodos = filteredTodos.filter((f) => dayjs(f.due_date).format("DD-MM-YYYY") === dayjs().add(1, "day").format("DD-MM-YYYY"));
				}

				return [key, filteredTodos];
			}),
		);
	}

	function getIconAndBadge() {
		const count = main.status === "All" && !main.selectedStaff.id && !main.find ? totalCopyCount : `${totalCount} / ${totalCopyCount}`;
		return totalCount > 0 && <Badge value={count} />;
	}

	async function getTodos() {
		try {
			setMain((s) => ({ ...s, isLoading: true }));

			const response = await axios.get(MyConstants.ApiEndpoints.Todos.GetTodos, MyGlobal.GetHeaders());

			if (response.status === 200) {
				const completed = [];
				const inProgress = [];
				const pending = [];

				const result = response.data.todos;

				if (Array.isArray(result)) {
					for (let i = 0; i < result.length; i++) {
						const obj = result[i];

						if (IsUserAdministrator) {
							if (obj.status === "Completed") completed.push(obj);
							if (obj.status === "Pending") pending.push(obj);
							if (obj.status === "InProgress") inProgress.push(obj);
						} else {
							const doesUserHaveAnyTodosAssigned = String(obj.assigned_to).split(",").includes(MyGlobal.GetUserId());

							if (doesUserHaveAnyTodosAssigned) {
								if (obj.status === "Completed") completed.push(obj);
								if (obj.status === "Pending") pending.push(obj);
								if (obj.status === "InProgress") inProgress.push(obj);
							}
						}
					}

					setColumnsCopy({ pending, inProgress, completed });
				}

				setProjects(response.data.projects);
				setSubProjects(response.data.subProjects);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Todos > Get Todos");
		} finally {
			setMain((s) => ({ ...s, isLoading: false }));
		}
	}

	function handleDragEndAndUpdateStatus(event) {
		const { active, over } = event;

		if (!over || active.id === over.id) {
			setActiveCard(null);
			return;
		}

		// Normalize IDs to string
		const activeId = String(active.id);
		const overId = String(over.id);

		// Find source and destination columns
		let sourceColumn = null;
		let destinationColumn = null;

		for (const col in columns) {
			if (columns[col].some((item) => String(item.id) === activeId)) sourceColumn = col;
			if (columns[col].some((item) => String(item.id) === overId)) destinationColumn = col;
		}

		// Special case: dropped into empty column by id
		if (!destinationColumn && columns[overId]) {
			destinationColumn = overId;
		}

		if (!sourceColumn || !destinationColumn) {
			setActiveCard(null);
			return;
		}

		const sourceItems = [...columns[sourceColumn]];
		const destinationItems = [...columns[destinationColumn]];

		const draggedItem = sourceItems.find((i) => String(i.id) === activeId);

		// Remove from source
		const updatedSource = sourceItems.filter((f) => String(f.id) !== activeId);

		let updatedDestination = destinationItems;

		if (sourceColumn === destinationColumn) {
			// Reorder within same column
			const oldIndex = sourceItems.findIndex((i) => String(i.id) === activeId);
			const newIndex = destinationItems.findIndex((i) => String(i.id) === overId);

			updatedDestination = arrayMove(destinationItems, oldIndex, newIndex);
		} else {
			// Move to another column
			const overIndex = destinationItems.findIndex((i) => String(i.id) === overId);
			const insertAt = overIndex >= 0 ? overIndex : destinationItems.length;

			updatedDestination = [...destinationItems.slice(0, insertAt), draggedItem, ...destinationItems.slice(insertAt)];
		}

		// Update columns state
		setColumns((prev) => ({
			...prev,
			[sourceColumn]: sourceColumn === destinationColumn ? updatedDestination : updatedSource,
			[destinationColumn]: updatedDestination,
		}));

		// Update backend status
		if (sourceColumn !== destinationColumn) {
			updateStatus({
				active: { column: sourceColumn, id: activeId },
				over: { column: destinationColumn, id: overId },
			});
		}

		setActiveCard(null);
	}

	function toggleAddTodo() {
		setMounted((s) => ({ ...s, addTodoBox: !s.addTodoBox }));
	}

	function toggleEditTodo(todo) {
		setMain((s) => ({ ...s, selectedTodo: todo }));
		setMounted((s) => ({ ...s, editTodo: !s.editTodo }));
	}

	function toggleDeleteTodo(todo) {
		setMain((s) => ({ ...s, selectedTodo: todo }));
		setMounted((s) => ({ ...s, deleteTodo: !s.deleteTodo }));
	}

	function toggleDetails(todo) {
		setMain((s) => ({ ...s, selectedTodo: todo }));
		setMounted((s) => ({ ...s, details: !s.details }));
	}

	function setSearch(value) {
		setMain((s) => ({ ...s, find: value }));
	}

	function setStaff(obj) {
		setMain((s) => ({ ...s, selectedStaff: { ...s.selectedStaff, fullName: obj.full_name, id: obj.id } }));
	}

	function setStaffType(value) {
		setMain((s) => ({ ...s, selectedStaff: { ...s.selectedStaff, type: value } }));
	}

	function setStatus(value) {
		setMain((s) => ({ ...s, status: value }));
	}

	async function updateStatus({ active, over }) {
		try {
			setIsLoading((s) => ({ ...s, updateStatus: true }));

			const newStatus = MyGlobal.Capitalize(over.column);

			const body = {
				id: active.id,
				status: newStatus,
			};

			const response = await axios.post(MyConstants.ApiEndpoints.Todos.UpdateStatus, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				getTodos();

				const activityMessage = `Updated status from <b>${MyGlobal.Capitalize(active?.column)}</b> to <b>${newStatus}</b>.`;

				MyGlobal.AddActivity(activityMessage, MyConstants.Modules.Base.Todos);
				MyGlobal.ShowSuccessToast(MyConstants.Messages.TodoStatusUpdated);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Todos > Update Status");
		} finally {
			setIsLoading((s) => ({ ...s, updateStatus: false }));
		}
	}

	// UI Components
	function uiBody() {
		const activeItem = Object.values(columns)
			.flat()
			.find((f) => f.id === activeCard?.id);

		return (
			<div className="flex flex-col w-full h-full justify-center items-center full-border">
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragEnd={handleDragEndAndUpdateStatus}
					onDragStart={({ active }) => {
						setActiveCard({
							id: active.id,
							...Object.values(columns)
								.flat()
								.find((t) => t.id === active.id),
						});
					}}
					onDragCancel={() => setActiveCard(null)}>
					<div className="flex w-full h-full justify-center items-center space-x-5 overflow-x-hidden overflow-y-auto p-4">
						{Object.keys(columns).map((m) => (
							<div
								key={m}
								className="flex w-1/3 h-full justify-center items-center">
								<Column
									id={m}
									items={columns[m]}
									activeCard={activeCard}
									openDeleteTodoBox={toggleDeleteTodo}
									openDetailsBox={toggleDetails}
									search={main.find}
								/>
							</div>
						))}
					</div>

					<DragOverlay>
						{activeItem ? (
							<div
								className="bg-white border border-gray-300 font-medium-12 rounded px-4 py-3 shadow-md"
								style={{
									boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
									transition: "transform 0.2s ease",
									zIndex: 1000,
								}}>
								{activeItem.description}
							</div>
						) : null}
					</DragOverlay>
				</DndContext>
			</div>
		);
	}

	function uiClearFilter() {
		return (
			<FontAwesomeIcon
				className="cursor-pointer outline-none focus:outline-none red-text"
				icon={faFilterCircleXmark}
				onClick={() => setMain((s) => ({ ...s, selectedStaff: { full_name: "", id: "", type: "" } }))}
			/>
		);
	}

	function uiFind() {
		return (
			<TextInputNative
				id="findBox"
				icon={faSearch}
				onChange={(e) => setSearch(e.target.value)}
				onClearButtonClick={() => setSearch("")}
				placeholder="Find"
				showClearButton={showFindClearButton}
				tabIndex={1}
				value={main.find}
				width="w-40"
			/>
		);
	}

	function uiNew() {
		return (
			<button
				className="block space-x-1.5 primary-button-transparent-background"
				onClick={() => toggleAddTodo()}>
				<FontAwesomeIcon icon={faPlusCircle} />
				<span>New</span>
			</button>
		);
	}

	function uiStaff() {
		const wrapper = "flex max-w-full min-w-40 h-[30px] px-2.5 space-x-2 justify-start items-center focus:outline-none relative z-40 rounded bottom-shadow contrast-background full-border font-regular-10";

		return (
			<Menu
				as="div"
				className="flex max-w-full min-w-40 justify-center items-center relative">
				<MenuButton className={wrapper}>
					<FontAwesomeIcon
						className="primary-text"
						icon={faUserAlt}
					/>
					<span className="gray-text">{main.selectedStaff.fullName || "Team"}</span>
				</MenuButton>
				<MenuItems className="absolute w-full top-8 right-0 origin-top-right rounded contrast-background bottom-shadow focus:outline-none z-50 full-border">{uiStaffList()}</MenuItems>
			</Menu>
		);
	}

	function uiStaffList() {
		return MyGlobal.GetAllUsers().map((m, i) => {
			const isSelected = m.id === main.selectedStaff;
			const aesthetics = isSelected ? "primary-background-transparent-01 primary-text" : "contrast-background black-text";
			const wrapper = `flex w-full p-2 space-x-2.5 justify-start items-center cursor-pointer border-y ${aesthetics} font-regular-10 text-left hovered-rows`;

			return (
				<MenuItem
					as="div"
					className={wrapper}
					key={i}
					onClick={() => setStaff(m)}>
					<span>{m.full_name}</span>
				</MenuItem>
			);
		});
	}

	function uiStaffAdvanced() {
		const wrapper = "flex max-w-full min-w-40 h-[30px] px-2.5 space-x-2 justify-start items-center focus:outline-none relative z-40 rounded bottom-shadow contrast-background full-border font-regular-10";

		return (
			<Menu
				as="div"
				className="flex max-w-full min-w-40 justify-center items-center relative">
				<MenuButton className={wrapper}>
					<FontAwesomeIcon
						className="primary-text"
						icon={faFilter}
					/>
					<span className="gray-text">{main.selectedStaff.type || "Type"}</span>
				</MenuButton>
				<MenuItems className="absolute w-full top-8 right-0 origin-top-right rounded contrast-background bottom-shadow focus:outline-none z-50 full-border">{uiStaffListAdvanced()}</MenuItems>
			</Menu>
		);
	}

	function uiStaffListAdvanced() {
		return ["Assigned alone", "Assigned with team"].map((m, i) => {
			const isSelected = m.id === main.selectedStaff.type;
			const aesthetics = isSelected ? "primary-background-transparent-01 primary-text" : "contrast-background black-text";
			const wrapper = `flex w-full p-2 space-x-2.5 justify-start items-center cursor-pointer border-y ${aesthetics} font-regular-10 text-left hovered-rows`;

			return (
				<MenuItem
					as="div"
					className={wrapper}
					key={i}
					onClick={() => setStaffType(m)}>
					<span>{m}</span>
				</MenuItem>
			);
		});
	}

	function uiStatus() {
		const wrapper = "flex max-w-full min-w-40 h-[30px] px-2.5 space-x-2 justify-start items-center focus:outline-none relative z-40 rounded bottom-shadow contrast-background full-border font-regular-10";

		return (
			<Menu
				as="div"
				className="flex max-w-full min-w-40 justify-center items-center relative">
				<MenuButton className={wrapper}>
					<FontAwesomeIcon
						className="primary-text"
						icon={faClock}
					/>
					<span className="gray-text">{main.status}</span>
				</MenuButton>
				<MenuItems className="absolute w-full top-8 right-0 origin-top-right rounded contrast-background bottom-shadow focus:outline-none z-50 full-border">{uiStatusList()}</MenuItems>
			</Menu>
		);
	}

	function uiStatusList() {
		return statuses.map((m, i) => {
			const isSelected = m.label === main.status;
			const aesthetics = isSelected ? "primary-background-transparent-01 primary-text" : "contrast-background black-text";
			const wrapper = `flex w-full p-2 space-x-2.5 justify-between items-center cursor-pointer border-y ${aesthetics} font-regular-10 text-left hovered-rows`;

			return (
				<MenuItem
					as="div"
					className={wrapper}
					key={i}
					onClick={() => setStatus(m.label)}>
					<span>{m.label}</span>
					{m.count > 0 && <BadgeSmall value={m.count} />}
				</MenuItem>
			);
		});
	}

	// Hooks
	useEffect(() => {
		getTodos();
	}, []);

	useEffect(() => {
		setColumns(getFilteredData());
	}, [main.selectedStaff]);

	useEffect(() => {
		function calculateStatusCounts() {
			const allTodos = Object.values(columnsCopy).flat();

			const todayStr = dayjs().format("DD-MM-YYYY");
			const tomorrowStr = dayjs().add(1, "day").format("DD-MM-YYYY");

			const statusCounts = [
				{
					label: "Overdue",
					count: allTodos.filter((f) => f.status !== "Completed" && dayjs(f.due_date, "DD-MM-YYYY").isBefore(dayjs().startOf("day"))).length,
				},
				{
					label: "Today",
					count: allTodos.filter((todo) => dayjs(todo.due_date).format("DD-MM-YYYY") === todayStr).length,
				},
				{
					label: "Tomorrow",
					count: allTodos.filter((todo) => dayjs(todo.due_date).format("DD-MM-YYYY") === tomorrowStr).length,
				},
				{
					label: "All",
					count: allTodos.length,
				},
			];

			return statusCounts;
		}

		setStatuses(calculateStatusCounts());
		setColumns(getFilteredData());
	}, [columnsCopy]);

	useEffect(() => {
		setColumns(getFilteredData());
	}, [main.find, main.selectedStaff, main.status]);

	// Main UI
	return (
		<div className="flex flex-col w-full justify-between items-center">
			<div className="flex w-full px-5 py-2.5 space-x-5 justify-between items-center">
				<div className="flex w-1/4 space-x-2 justify-start items-center">
					<span className="view-heading">{thisView}</span>
					{getIconAndBadge()}
				</div>
				<div className="flex w-1/2 space-x-3 justify-center items-center">
					{uiStatus()}
					{uiFind()}
					{IsUserAdministrator && uiStaff()}
					{IsUserAdministrator && uiStaffAdvanced()}
					{IsUserAdministrator && (
						<Tippy
							content={<Tooltip text="Clear filters" />}
							placement="bottom">
							{uiClearFilter()}
						</Tippy>
					)}
				</div>
				<div className="flex w-1/4 justify-end items-center">{uiNew()}</div>
			</div>
			<div className="flex w-full h-[calc(100vh-105px)] justify-center items-center overflow-y-auto contrast-background">{uiBody()}</div>

			{mounted.addTodoBox && (
				<DynamicAddToDo
					mount={mounted.addTodoBox}
					refresh={getTodos}
					unmount={toggleAddTodo}
				/>
			)}

			{mounted.editTodo && (
				<DynamicEditTodo
					mount={mounted.editTodo}
					refresh={getTodos}
					todo={main.selectedTodo?.item}
					unmount={toggleEditTodo}
				/>
			)}

			{mounted.deleteTodo && (
				<DynamicDeleteTodo
					mount={mounted.deleteTodo}
					refresh={getTodos}
					todo={main.selectedTodo?.item}
					unmount={toggleDeleteTodo}
				/>
			)}

			{mounted.details && (
				<DynamicDetails
					mount={mounted.details}
					refresh={getTodos}
					todo={main.selectedTodo?.item}
					unmount={toggleDetails}
				/>
			)}
		</div>
	);
}
