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
import { AvatarCircle, Badge, Tooltip } from "@/components/Elements";
import { faClockRotateLeft, faCrown, faHourglassEnd, faHourglassHalf, faPlusCircle, faSearch, faWebAwesome } from "@fortawesome/free-solid-svg-icons";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, useDroppable, DragOverlay } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, sortableKeyboardCoordinates, defaultAnimateLayoutChanges, verticalListSortingStrategy } from "@dnd-kit/sortable";

const animateLayoutChanges = (args) => defaultAnimateLayoutChanges({ ...args, wasDragging: true });

function Card({ item, column, activeCard, openDetailsBox }) {
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
				dueDateTextColor = "text-gray-800";
				return "low-priority";
			case "Medium":
				svgFileName = "red";
				dueDateTextColor = "text-red-800";
				return "medium-priority";
			case "High":
				svgFileName = "orange";
				dueDateTextColor = "text-orange-800";
				return "high-priority";
			case "Urgent":
				svgFileName = "yellow";
				dueDateTextColor = "text-yellow-800";
				return "urgent-priority";
		}
	}

	function getPriorityStyle() {
		switch (item.priority) {
			case "Low":
				return "px-1.5 py-0.5 bg-gray-100 text-gray-800 text-xs font-medium rounded";
			case "Medium":
				return "px-1.5 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded";
			case "High":
				return "px-1.5 py-0.5 bg-orange-100 text-orange-800 text-xs font-medium rounded";
			case "Urgent":
				return "px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded";
		}
	}

	const descriptionColour = item.priority === "Low" ? "text-black" : "text-white";
	const descriptionStyle = `w-4/5 whitespace-pre-wrap font-medium-12 ${descriptionColour}`;

	const container = `flex flex-col w-full h-full space-y-3 px-4 py-3 justify-between items-center bottom-border rounded-md transition-all duration-200 ease-in-out hover:scale-105 hover:-translate-y-1.5 hover:shadow-lg ${getBackgroundColour()}`;

	const dueDateStyle = `font-regular-10 ${dueDateTextColor}`;

	return (
		<div className={container} ref={setNodeRef} style={style} {...attributes} {...listeners}>
			<div className="flex w-full justify-between items-center">
				<span className={descriptionStyle}>{item.description}</span>
				<div className="flex w-1/5 space-x-5 justify-end items-center">
					{item.todays_task && (
						<Tippy animation="shift-away" content={<Tooltip text={item.todays_task} />} placement="bottom">
							<FontAwesomeIcon className="animate-bounce text-red-600" icon={faCrown} size="xl" />
						</Tippy>
					)}
					<Tippy animation="shift-away" content={<Tooltip text={item.notes ?? "No notes entered."} />} placement="bottom">
						<img
							src={`/information-circle-${svgFileName}.svg`}
							alt="icon"
							className="w-6 h-6 cursor-pointer"
							onClick={(e) => {
								e.stopPropagation();
								openDetailsBox({ item });
							}}
						/>
					</Tippy>
				</div>
			</div>
			<div className="flex w-full justify-start items-center">
				<AvatarCircle names={assignedToNames} />
			</div>
			<div className="flex w-full justify-between items-center">
				<span className={dueDateStyle}>{item.due_date ? dayjs(item.due_date).format("DD MMM, YYYY") : ""}</span>
				<span className={getPriorityStyle()}>{item.priority}</span>
			</div>
		</div>
	);
}

function Column({ id, items, activeCard, openDetailsBox }) {
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

			<div className={cardsAreaStyle} ref={setNodeRef}>
				<SortableContext items={items.map((m) => m.id)} strategy={verticalListSortingStrategy}>
					<div className="flex flex-col px-3 space-y-4 overflow-visible">
						{items.map((m) => (
							<Card key={m.id} item={m} column={id} activeCard={activeCard} openDetailsBox={openDetailsBox} />
						))}
					</div>
				</SortableContext>
			</div>
		</div>
	);
}

export default function Todos() {
	// Business Logic
	const initialTodos = {
		pending: [],
		inProgress: [],
		completed: [],
	};

	const [activeCard, setActiveCard] = useState(null);
	const [columns, setColumns] = useState(initialTodos);
	const [isLoading, setIsLoading] = useState({ updateStatus: false });
	const [mounted, setMounted] = useState({ addTodoBox: false, details: false });

	const [main, setMain] = useState({
		find: "",
		isLoading: false,
		selectedTodo: {},
	});

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8, // drag starts after 8px movement
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const IsUserAdministrator = MyGlobal.IsUserAdministrator();

	const thisView = MyConstants.Modules.Base.Todos;
	const showFindClearButton = useMemo(() => (main.find ? "cursor-pointer primary-text" : "hidden"), [main.find]);

	const totalCount = columns.completed.length + columns.inProgress.length + columns.pending.length;

	const DynamicAddToDo = dynamic(() => import("@/modals/todos/AddTodo"), { ssr: false });
	const DynamicDetails = dynamic(() => import("@/modals/todos/Details"), { ssr: false });

	// Functions
	function getIconAndBadge() {
		return totalCount > 0 && <Badge value={totalCount} />;
	}

	async function getTodos() {
		try {
			setMain((s) => ({ ...s, isLoading: true }));

			const response = await axios.get(MyConstants.ApiEndpoints.Todos.GetTodos, MyGlobal.GetHeaders());

			if (response.status === 200) {
				const completed = [];
				const inProgress = [];
				const pending = [];

				const result = response.data;

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

					setColumns({ pending, inProgress, completed });
				}
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

	function toggleDetails(todo) {
		setMain((s) => ({ ...s, selectedTodo: todo }));
		setMounted((s) => ({ ...s, details: !s.details }));
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
					<div className="flex w-full h-full justify-center items-center space-x-5 overflow-y-auto p-4">
						{Object.keys(columns).map((m) => (
							<div key={m} className="flex w-1/3 h-full justify-center items-center">
								<Column id={m} items={columns[m]} activeCard={activeCard} openDetailsBox={toggleDetails} />
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

	function uiFind() {
		if (totalCount) {
			return <TextInputNative id="findBox" icon={faSearch} onChange={() => {}} onClearButtonClick={() => {}} placeholder="Find" showClearButton={showFindClearButton} tabIndex={1} value={main.find} width="w-36" />;
		}
	}

	function uiNew() {
		return (
			<button className="block space-x-1.5 primary-button-transparent-background" onClick={() => toggleAddTodo()}>
				<FontAwesomeIcon icon={faPlusCircle} />
				<span>New</span>
			</button>
		);
	}

	// Hooks
	useEffect(() => {
		getTodos();
	}, []);

	// Main UI
	return (
		<div className="flex flex-col w-full justify-between items-center">
			<div className="flex w-full px-5 py-2.5 justify-between items-center">
				<div className="flex w-1/5 space-x-2 justify-start items-center">
					<span className="view-heading">{thisView}</span>
					{getIconAndBadge()}
				</div>
				<div className="flex w-4/5 space-x-2 justify-end items-center">
					{/* {uiFind()} */}
					{uiNew()}
				</div>
			</div>
			<div className="flex w-full h-[calc(100vh-105px)] justify-center items-center overflow-y-auto contrast-background">{uiBody()}</div>

			{mounted.addTodoBox && <DynamicAddToDo mount={mounted.addTodoBox} refresh={getTodos} unmount={toggleAddTodo} />}

			{mounted.details && <DynamicDetails mount={mounted.details} refresh={getTodos} todo={main.selectedTodo?.item} unmount={toggleDetails} />}
		</div>
	);
}
