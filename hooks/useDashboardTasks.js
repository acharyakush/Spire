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
		const today = dayjs(); // lock "today" once for consistency
		const obj = {
			overdue: 0,
			today: 0,
			tomorrow: 0,
			upcoming: 0,
			total: list.length,
		};

		for (const t of list) {
			const dueDate = dayjs(t.due_on);

			if (dueDate.isBefore(today, "date")) obj.overdue++;
			else if (dueDate.isSame(today, "date")) obj.today++;
			else if (dueDate.isSame(today.add(1, "day"), "date")) obj.tomorrow++;
			else if (dueDate.isAfter(today.add(1, "day"), "date") && t.is_completed == 0) {
				obj.upcoming++;
			}
		}

		setTasks(obj);
	}

	return { tasks, updateTasks };
}
