"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import MyConstants from "@/utilities/constants";

import useRv from "@/hooks/useDashboardRv";
import useTasks from "@/hooks/useDashboardTasks";
import useInvoices from "@/hooks/useDashboardInvoices";
import useProjects from "@/hooks/useDashboardProjects";
import useInquiries from "@/hooks/useDashboardInquiries";

import { MyGlobal } from "@/utilities/global";
import { useEffect, useState, useMemo, useCallback, startTransition } from "react";

const DynamicConfirmedProjects = dynamic(() => import("./ConfirmedProjects"), { ssr: false });
const DynamicPaymentsReceived = dynamic(() => import("./PaymentsReceived"), { ssr: false });
const DynamicPendingPayments = dynamic(() => import("./PendingPayments"), { ssr: false });
const DynamicInquiryAmount = dynamic(() => import("./InquiryAmount"), { ssr: false });
const DynamicInquiries = dynamic(() => import("./Inquiries"), { ssr: false });
const DynamicProjects = dynamic(() => import("./Projects"), { ssr: false });
const DynamicInvoices = dynamic(() => import("./Invoices"), { ssr: false });
const DynamicTasks = dynamic(() => import("./Tasks"), { ssr: false });
const DynamicRVs = dynamic(() => import("./RVs"), { ssr: false });

export default function Dashboard({ setModuleProps }) {
	// Business Logic
	const [data, setData] = useState({
		showRow1: false,
		showRow2: false,
		showRow3: false,
	});

	const today = useMemo(() => dayjs(), []);

	const { inquiries, updateInquiries } = useInquiries();
	const { invoices, updateInvoices } = useInvoices(today);
	const { projects, updateProjects } = useProjects();
	const { rv, updateRv } = useRv();
	const { tasks, updateTasks } = useTasks();

	// Memoized values
	const memoizedProjects = useMemo(() => projects, [projects]);
	const memoizedInvoices = useMemo(() => invoices, [invoices]);
	const memoizedTasks = useMemo(() => tasks, [tasks]);
	const memoizedInquiries = useMemo(() => inquiries, [inquiries]);
	const memoizedRv = useMemo(() => rv, [rv]);

	// Functions
	async function getSupportData() {
		try {
			const response = await axios.get(MyConstants.ApiEndpoints.Dashboard, MyGlobal.GetHeaders());

			if (response.status == 200) {
				const { companies, inquiries, invoices, projects, rv, tasks, transactions } = response.data;

				// const prjs = updateProjects(companies, invoices, transactions, projects);

				// updateTasks(tasks);
				// updateInquiries(inquiries);
				// updateInvoices(invoices, prjs.paymentOverdue, prjs.paymentPending, prjs.paymentReceived, projects);
				// updateRv(rv, tasks);

				startTransition(() => {
					const prjs = updateProjects(companies, invoices, transactions, projects);

					updateTasks(tasks);
					updateInquiries(inquiries);
					updateInvoices(invoices, prjs.paymentOverdue, prjs.paymentPending, prjs.paymentReceived, projects);
					updateRv(rv, tasks);
				});
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Dashboard => Get Support Data");
		}
	}

	function setValues(key, value) {
		setData((s) => ({ ...s, [key]: value }));
	}

	// Memoized UI functions
	const uiRow1 = useCallback(() => {
		if (data.showRow1) {
			const transition = `row-fade ${data.showRow1 ? "shown" : ""}`;

			return (
				<div className={transition}>
					<div className="flex w-full px-2.5 space-x-10 justify-between items-center">
						<div className="flex w-full space-x-10 justify-between items-center">
							<DynamicProjects projects={memoizedProjects} setModuleProps={setModuleProps} />
							<DynamicConfirmedProjects projects={memoizedProjects} />
						</div>
						<div className="flex w-full space-x-10 justify-between items-center">
							<DynamicTasks setModuleProps={setModuleProps} tasks={memoizedTasks} />
							<DynamicPendingPayments invoices={memoizedInvoices.pending} />
						</div>
					</div>
				</div>
			);
		}
	}, [data.showRow1, memoizedProjects, memoizedTasks, memoizedInvoices, setModuleProps]);

	const uiRow2 = useCallback(() => {
		if (data.showRow2) {
			const transition = `row-fade ${data.showRow2 ? "shown" : ""}`;

			return (
				<div className={transition}>
					<div className="flex w-full p-2.5 space-x-10 justify-between items-center">
						<div className="flex w-full space-x-10 justify-between items-center">
							<DynamicInquiries inquiries={memoizedInquiries} setModuleProps={setModuleProps} />
							<DynamicInquiryAmount inquiries={memoizedInquiries} />
						</div>
						<div className="flex w-full space-x-10 justify-between items-center">
							<DynamicPaymentsReceived invoices={memoizedInvoices} />
							{uiReports()}
						</div>
					</div>
				</div>
			);
		}
	}, [data.showRow2, memoizedInquiries, memoizedInvoices, setModuleProps]);

	const uiRow3 = useCallback(() => {
		if (data.showRow3) {
			const transition = `row-fade ${data.showRow3 ? "shown" : ""}`;

			return (
				<div className={transition}>
					<div className="flex w-full p-2.5 space-x-10 justify-between items-center">
						<div className="flex w-full space-x-10 justify-between items-center">
							<DynamicInvoices invoices={memoizedInvoices} setModuleProps={setModuleProps} />
						</div>
						<div className="flex w-full space-x-10 justify-between items-center">
							<DynamicRVs rv={memoizedRv} setModuleProps={setModuleProps} />
						</div>
					</div>
				</div>
			);
		}
	}, [data.showRow3, memoizedInvoices, memoizedRv, setModuleProps]);

	const uiReports = useCallback(() => {
		return (
			<div className="flex flex-col w-full space-y-2 justify-start items-center anim zoom-in">
				<div className="flex w-full justify-between items-center">
					<div className="flex w-full space-x-2.5 justify-start items-center font-bold-18 primary-text">
						<span>Reports</span>
					</div>
				</div>
				<div className="flex w-full h-[279.59px] justify-between items-center full-border rounded shadow-md contrast-background"></div>
			</div>
		);
	}, []);

	// Hooks
	useEffect(() => {
		getSupportData();

		const delay1 = setTimeout(() => setValues("showRow1", true), 200);
		const delay2 = setTimeout(() => setValues("showRow2", true), 600);
		const delay3 = setTimeout(() => setValues("showRow3", true), 1000);

		return () => {
			clearTimeout(delay1);
			clearTimeout(delay2);
			clearTimeout(delay3);
		};
	}, []);

	// Main UI
	return (
		<div className="w-full h-full p-5 space-y-5 overflow-x-hidden overflow-y-auto bg-white">
			{uiRow1()}
			{uiRow2()}
			{uiRow3()}
		</div>
	);
}
