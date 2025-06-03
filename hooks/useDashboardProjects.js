// hooks/useProjects.js
import dayjs from "dayjs";
import MyConstants from "@/utilities/constants";

import { useState } from "react";
import { MyGlobal } from "@/utilities/global";

export default function useProjects() {
	const [projects, setProjects] = useState({
		active: 0,
		closed: 0,
		completed: 0,
		hold: 0,
		my: 0,
		totalCount: 0,
		totalInvoiceFees: 0,
		api: [],
		apiCopy: [],
		paymentOverdue: [],
		paymentPending: [],
		paymentReceived: [],
	});

	function updateProjects(companies = [], invoiceList = [], transactions = [], projectList = []) {
		const prjStatus = MyConstants.Statuses.Projects;
		const userId = MyGlobal.GetUserId();

		let active = 0,
			closed = 0,
			completed = 0,
			hold = 0,
			my = 0;
		let totalInvoiceFees = 0;

		const paymentPending = [],
			paymentOverdue = [],
			paymentReceived = [];

		const invoiceMap = groupBy(invoiceList, "project_id");
		const txMap = groupBy(transactions, "project_id");
		const companyMap = Object.fromEntries(companies.map((c) => [c.id, c.name]));

		for (const p of projectList) {
			if (p.status == prjStatus.Active) active++;
			if (p.status == prjStatus.Closed) closed++;
			if (p.status == prjStatus.Completed) completed++;
			if (p.status == prjStatus.Hold) hold++;

			if (String(p.teams).includes(userId)) my++;

			const invoices = invoiceMap[p.id] || [];
			const txs = txMap[p.id] || [];

			const invoiceAmount = invoices.reduce((t, i) => t + +i.amount, 0) || +p.invoice_fees;
			const dueDate = invoices.map((i) => i.due_date).find(Boolean);
			const received = txs.reduce((t, x) => t + +x.amount, 0);
			const pending = invoiceAmount - received;

			const projectObj = {
				...p,
				amount: invoiceAmount,
				amount_received: received,
				amount_pending: pending,
				company_name: companyMap[p.company_id] || "",
				invoice_due_date: dueDate ? dayjs(dueDate).format("DD/MM/YYYY") : "",
			};

			if (dueDate && pending != 0) paymentOverdue.push(projectObj);
			if (pending > 0) paymentPending.push(projectObj);
			if (received > 0) paymentReceived.push(projectObj);

			totalInvoiceFees += +p.invoice_fees;
		}

		const updated = {
			active,
			closed,
			completed,
			hold,
			my,
			totalInvoiceFees,
			api: projectList,
			apiCopy: projectList,
			paymentOverdue,
			paymentPending,
			paymentReceived,
			totalCount: projectList.length,
		};

		setProjects(updated);
		return updated;
	}

	return { projects, updateProjects };
}

// Helper function
function groupBy(arr, key) {
	return arr.reduce((acc, val) => {
		const groupKey = val[key];
		if (!acc[groupKey]) acc[groupKey] = [];
		acc[groupKey].push(val);
		return acc;
	}, {});
}
