import { useState, useRef, useEffect } from "react";

export function useDragAndDrop({ items, onDrop }) {
	const containerRef = useRef(null);
	const [draggedItem, setDraggedItem] = useState(null);
	const [movingItems, setMovingItems] = useState(new Set());

	useEffect(() => {
		const container = containerRef.current;
		if (!container || !items?.length) return;

		const rows = Array.from(container.children);

		rows.forEach((row, index) => {
			row.setAttribute("draggable", true);
			row.dataset.index = index;

			row.ondragstart = (e) => {
				setDraggedItem({ index, element: row });
				e.dataTransfer.effectAllowed = "move";
				e.dataTransfer.setData("text/plain", "dragging");
				row.classList.add("opacity-50");
			};

			row.ondragend = () => {
				setDraggedItem(null);
				row.classList.remove("opacity-50");
			};

			row.ondragover = (e) => {
				e.preventDefault();
				row.classList.add("ring", "ring-blue-300");
			};

			row.ondragleave = () => {
				row.classList.remove("ring", "ring-blue-300");
			};

			row.ondrop = (e) => {
				e.preventDefault();
				row.classList.remove("ring", "ring-blue-300");

				const fromIndex = draggedItem?.index;
				const toIndex = index;

				if (fromIndex === undefined || toIndex === undefined || fromIndex === toIndex) return;

				const newItems = [...items];
				const [moved] = newItems.splice(fromIndex, 1);
				newItems.splice(toIndex, 0, moved);

				// Trigger update for items after the drop
				onDrop(newItems);
			};

			row.ondrag = (e) => {
				const draggedIndex = draggedItem?.index;
				if (draggedIndex !== undefined && draggedIndex !== index) {
					setMovingItems((prev) => new Set([...prev, index]));
				}
			};
		});

		return () => {
			rows.forEach((row) => {
				row.ondragstart = null;
				row.ondragend = null;
				row.ondragover = null;
				row.ondragleave = null;
				row.ondrop = null;
				row.ondrag = null;
			});
		};
	}, [items, onDrop, draggedItem]);

	return { containerRef, draggedItem, movingItems };
}
