import dayjs from "dayjs";
import { useState } from "react";

export default function useTasks() {
	const [tasks, setTasks] = useState({
		overdue: 0,
		today: 0,
		tomorrow: 0,
		upcoming: 0,
		total: 0,
	});

	function updateTasks(list) {
		const today = dayjs();

		const obj = {
			overdue: 0,
			today: 0,
			tomorrow: 0,
			upcoming: 0,
			others: 0,
			completed: 0,
			disabled: 0,
			total: list.length,
		};

		for (let i = 0; i < list.length; i++) {
			const t = list[i];

			if (t.is_disabled === 1) obj.disabled++;
			if (t.is_completed === 1) obj.completed++;

			const dueDate = dayjs(t.due_on);

			if (t.due_on) {
				if (dueDate.isBefore(today, "date")) {
					if (t.status === "Active") {
						obj.overdue++;
					}
				} else if (dueDate.isSame(today, "date")) {
					if (t.is_disabled === 0 && t.is_completed === 0) obj.today++;
				} else if (dueDate.isSame(dayjs(today).add(1, "day"), "date")) {
					if (t.is_disabled === 0 && t.is_completed === 0) obj.tomorrow++;
				} else if (dueDate.isAfter(dayjs(today).add(1, "day"), "date")) {
					if (t.is_disabled === 0 && t.is_completed === 0) obj.upcoming++;
				} else {
					obj.others++;
				}
			}
		}

		setTasks(obj);
	}

	return { tasks, updateTasks };
}
