import dayjs from "dayjs";
import { useState } from "react";

export default function useRv() {
	const [rv, setRv] = useState({
		due: { amount: 0, count: 0, label: "DUE" },
		overdue: { amount: 0, count: 0, label: "OVERDUE" },
		generated: { amount: 0, count: 0, label: "GENERATED" },
		notGenerated: { amount: 0, count: 0, label: "NOT GENERATED" },
		total: 0,
	});

	function updateRv(rvList, taskList) {
		const obj = {
			due: { amount: 0, count: 0, label: "DUE" },
			overdue: { amount: 0, count: 0, label: "OVERDUE" },
			generated: { amount: 0, count: 0, label: "GENERATED" },
			notGenerated: { amount: 0, count: 0, label: "NOT GENERATED" },
			total: 0,
		};

		const todayStr = dayjs().format("YYYY-MM-DD");
		const rvProjectIds = new Set();

		for (const fe of rvList) {
			const { due_date, amount, amount_pending, custom_id, project_id } = fe;

			const amountNum = +amount;
			const pendingNum = +amount_pending;

			rvProjectIds.add(project_id);

			if (dayjs(due_date).isBefore(todayStr)) {
				obj.due.amount += amountNum;
				obj.due.count += 1;

				if (pendingNum !== 0) {
					obj.overdue.amount += pendingNum;
					obj.overdue.count += 1;
				}
			}

			if (custom_id) {
				obj.generated.amount += amountNum;
				obj.generated.count += 1;
			}
		}

		for (const fe of taskList) {
			if (!rvProjectIds.has(fe.project_id)) {
				obj.notGenerated.amount += +fe.expense;
				obj.notGenerated.count += 1;
			}
		}

		obj.total = rvList.length;
		setRv(obj);
	}

	return { rv, updateRv };
}
