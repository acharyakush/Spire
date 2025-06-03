import dayjs from "dayjs";
import { useState } from "react";

export default function useInvoices(today = dayjs()) {
	const [invoices, setInvoices] = useState({
		due: { amount: 0, count: 0, label: "DUE" },
		overdue: { amount: 0, count: 0, label: "OVERDUE" },
		generated: { amount: 0, count: 0, label: "GENERATED" },
		notGenerated: { amount: 0, count: 0, label: "NOT GENERATED" },
		pending: [],
		received: [],
		receivedCopy: [],
		totalCount: 0,
	});

	function updateInvoices(list = [], paymentOverdue = [], paymentPending = [], paymentReceived = [], projects = []) {
		const result = {
			due: { amount: 0, count: 0, label: "DUE" },
			overdue: { amount: 0, count: 0, label: "OVERDUE" },
			generated: { amount: 0, count: 0, label: "GENERATED" },
			notGenerated: { amount: 0, count: 0, label: "NOT GENERATED" },
			pending: paymentPending,
			received: paymentReceived,
			receivedCopy: [...paymentReceived],
			totalCount: list.length,
		};

		// DUE & GENERATED
		for (const i of list) {
			const amount = +i.amount;

			if (i.due_date && dayjs(i.due_date).isBefore(today, "day")) {
				result.due.amount += amount;
				result.due.count += 1;
			}

			if (i.custom_id) {
				result.generated.amount += amount;
				result.generated.count += 1;
			}
		}

		// OVERDUE
		for (const f of paymentOverdue) {
			result.overdue.amount += f.amount_pending;
			result.overdue.count += 1;
		}

		// NOT GENERATED
		const invoiceProjectIds = new Set(list.map((m) => m.project_id));
		const notGenerated = projects.filter((f) => !invoiceProjectIds.has(f.id));

		for (const prj of notGenerated) {
			result.notGenerated.amount += +prj.quote;
			result.notGenerated.count += 1;
		}

		setInvoices(result);
	}

	return { invoices, updateInvoices };
}
