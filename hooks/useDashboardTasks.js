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

		for (const t of list) {
			if (t.is_disabled === 1) {
				obj.disabled++;
			} else if (t.is_completed === 1) {
				obj.completed++;
			} else {
				const dueDate = dayjs(t.due_on);

				if (dueDate.isBefore(today, "day")) {
					obj.overdue++;
				} else if (dueDate.isSame(today, "day")) {
					obj.today++;
				} else if (dueDate.isSame(dayjs(today).add(1, "day"), "day")) {
					obj.tomorrow++;
				} else if (dueDate.isAfter(dayjs(today).add(1, "day"), "day")) {
					obj.upcoming++;
				} else {
					obj.others++;
				}
			}
		}

		setTasks(obj);
	}

	return { tasks, updateTasks };
}
