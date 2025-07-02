"use client";

import dayjs from "dayjs";
import { useState } from "react";

export default function useTodos() {
	const [todos, setTodos] = useState({
		all: 0,
		completed: 0,
		inProgress: 0,
		overdue: 0,
		pending: 0,
		today: 0,
		tomorrow: 0,
		total: 0,
	});

	function updateTodos(list) {
		const obj = {
			all: list.length,
			completed: 0,
			inProgress: 0,
			overdue: 0,
			pending: 0,
			today: 0,
			tomorrow: 0,
			total: 0,
		};

		const today = dayjs();

		for (let i = 0; i < list.length; i++) {
			const j = list[i];

			const dueDate = dayjs(j.due_date, "DD-MM-YYYY");

			if (j.status === "Completed") {
				obj.completed++;
			} else {
				if (j.due_date) {
					if (dueDate.isBefore(dayjs().startOf("day"))) {
						obj.overdue++;
					} else if (dueDate.isSame(today, "date")) {
						obj.today++;
					} else if (dueDate.isSame(dayjs(today).add(1, "day"), "date")) {
						obj.tomorrow++;
					}
				}
			}

			if (j.status === "InProgress") obj.inProgress++;
			if (j.status === "Pending") obj.pending++;
		}

		setTodos(obj);
	}

	return { todos, updateTodos };
}
