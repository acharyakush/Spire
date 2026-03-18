"use client";

import axios from "axios";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import useRv from "@/hooks/useDashboardRv";
import MyConstants from "@/utilities/constants";
import useInvoices from "@/hooks/useDashboardInvoices";
import useProjects from "@/hooks/useDashboardProjects";
import useInquiries from "@/hooks/useDashboardInquiries";

import { MyGlobal } from "@/utilities/global";
import { useEffect, useMemo, startTransition } from "react";

const DynamicConfirmedProjects = dynamic(() => import("./ConfirmedProjects"), { ssr: false });
const DynamicPaymentsReceived = dynamic(() => import("./PaymentsReceived"), { ssr: false });
const DynamicPendingPayments = dynamic(() => import("./PendingPayments"), { ssr: false });
const DynamicInquiryAmount = dynamic(() => import("./InquiryAmount"), { ssr: false });
const DynamicInquiries = dynamic(() => import("./Inquiries"), { ssr: false });
const DynamicProjects = dynamic(() => import("./Projects"), { ssr: false });
const DynamicInvoices = dynamic(() => import("./Invoices"), { ssr: false });
const DynamicRVs = dynamic(() => import("./RVs"), { ssr: false });

export default function Dashboard({ setModuleProps }) {
	// Business Logic
	const today = useMemo(() => dayjs(), []);

	const { inquiries, updateInquiries } = useInquiries();
	const { invoices, updateInvoices } = useInvoices(today);
	const { projects, updateProjects } = useProjects();
	const { rv, updateRv } = useRv();

	// Memoized values
	const memoizedProjects = useMemo(() => projects, [projects]);
	const memoizedInvoices = useMemo(() => invoices, [invoices]);
	const memoizedInquiries = useMemo(() => inquiries, [inquiries]);
	const memoizedRv = useMemo(() => rv, [rv]);

	// Functions
	async function getSupportData() {
		try {
			const response = await axios.get(MyConstants.ApiEndpoints.Dashboard, MyGlobal.GetHeaders());

			if (response.status == 200) {
				const { companies, inquiries, invoices, projects, rv, tasks, todos, transactions } = response.data;

				startTransition(() => {
					const prjs = updateProjects(companies, invoices, transactions, projects);

					updateInquiries(inquiries);
					updateInvoices(invoices, prjs.paymentOverdue, prjs.paymentPending, prjs.paymentReceived, projects);
					updateRv(rv, tasks);
				});
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Dashboard => Get Support Data");
		}
	}

	// UI Components
	function uiRow1() {
		return (
			<div className="flex w-full px-2.5 space-x-10 justify-between items-center-safe">
				<div className="flex w-1/5 justify-center-safe items-center-safe">
					<DynamicProjects projects={memoizedProjects} setModuleProps={setModuleProps} />
				</div>
				<div className="flex w-3/5 justify-center-safe items-center-safe">
					<DynamicConfirmedProjects projects={memoizedProjects} />
				</div>
				<div className="flex w-1/5 justify-center-safe items-center-safe">
					<DynamicPendingPayments invoices={memoizedInvoices.pending} />
				</div>
			</div>
		);
	}

	function uiRow2() {
		return (
			<div className="flex w-full p-2.5 space-x-10 justify-between items-center-safe">
				<div className="flex w-1/5 justify-center-safe items-center-safe">
					<DynamicInquiries inquiries={memoizedInquiries} setModuleProps={setModuleProps} />
				</div>
				<div className="flex w-3/5 justify-center-safe items-center-safe">
					<DynamicInquiryAmount inquiries={memoizedInquiries} />
				</div>
				<div className="flex w-1/5 justify-center-safe items-center-safe">
					<DynamicPaymentsReceived invoices={memoizedInvoices} />
				</div>
			</div>
		);
	}

	function uiRow3() {
		return (
			<div className="flex w-full p-2.5 space-x-10 justify-between items-center-safe">
				<div className="flex w-full space-x-10 justify-between items-center-safe">
					<DynamicInvoices invoices={memoizedInvoices} setModuleProps={setModuleProps} />
				</div>
				<div className="flex w-full space-x-10 justify-between items-center-safe">
					<DynamicRVs rv={memoizedRv} setModuleProps={setModuleProps} />
				</div>
			</div>
		);
	}

	// Hooks
	useEffect(() => {
		getSupportData();
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
