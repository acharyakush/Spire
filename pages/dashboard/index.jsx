"use client";

import axios from "axios";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import useRv from "@/hooks/useDashboardRv";
import useInvoices from "@/hooks/useDashboardInvoices";
import useProjects from "@/hooks/useDashboardProjects";
import useInquiries from "@/hooks/useDashboardInquiries";

import { MyGlobal } from "@/utilities/global";
import { ApiEndpoints, DerivedModules } from "@/utilities/constants";
import { useEffect, useMemo, startTransition, useState } from "react";

const DynamicRVs = dynamic(() => import("./RVs"), { ssr: false });
const DynamicProjects = dynamic(() => import("./Projects"), { ssr: false });
const DynamicInvoices = dynamic(() => import("./Invoices"), { ssr: false });
const DynamicInquiries = dynamic(() => import("./Inquiries"), { ssr: false });
const DynamicInquiryAmount = dynamic(() => import("./InquiryAmount"), { ssr: false });
const DynamicStaffsProjects = dynamic(() => import("./StaffsProjects"), { ssr: false });
const DynamicPendingPayments = dynamic(() => import("./PendingPayments"), { ssr: false });
const DynamicPaymentsReceived = dynamic(() => import("./PaymentsReceived"), { ssr: false });
const DynamicConfirmedProjects = dynamic(() => import("./ConfirmedProjects"), { ssr: false });

export default function Dashboard({ setModuleProps }) {
	// Business Logic
	const today = useMemo(() => dayjs(), []);
	const [staffsActiveProjects, setStaffsActiveProjects] = useState([]);

	const { rv, updateRv } = useRv();
	const { projects, updateProjects } = useProjects();
	const { inquiries, updateInquiries } = useInquiries();
	const { invoices, updateInvoices } = useInvoices(today);

	// Memoized values
	const memoizedRv = useMemo(() => rv, [rv]);
	const memoizedProjects = useMemo(() => projects, [projects]);
	const memoizedInvoices = useMemo(() => invoices, [invoices]);
	const memoizedInquiries = useMemo(() => inquiries, [inquiries]);

	// Functions
	async function getStaffsActiveProjects() {
		try {
			const response = await axios.get(ApiEndpoints.GetStaffsActiveProjects, MyGlobal.GetHeaders());

			if (response.status === 200) {
				setStaffsActiveProjects(response.data);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Dashboard => Get Staffs Active Project");
		}
	}

	async function getSupportData() {
		try {
			const response = await axios.get(ApiEndpoints.Dashboard, MyGlobal.GetHeaders());

			if (response.status == 200) {
				const { companies, inquiries, invoices, projects, rv, tasks, transactions } = response.data;

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

	function uiInquiriesRow() {
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

	function uiInvoiceAndRv() {
		return (
			<div className="flex w-full p-2.5 space-x-10 justify-between items-center-safe">
				{MyGlobal.HasPermission(DerivedModules.ShowInvoicesInDashboard) && <div className="flex w-full space-x-10 justify-between items-center-safe">
					<DynamicInvoices invoices={memoizedInvoices} setModuleProps={setModuleProps} />
				</div>}
				{MyGlobal.HasPermission(DerivedModules.ShowRvInDashboard) && <div className="flex w-full space-x-10 justify-between items-center-safe">
					<DynamicRVs rv={memoizedRv} setModuleProps={setModuleProps} />
				</div>}
			</div>
		);
	}

	function uiProjectsRow() {
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

	function uiStaffProjectsRow() {
		return (
			<div className="flex w-full px-2.5 justify-center-safe items-center-safe">
				<DynamicStaffsProjects data={staffsActiveProjects} setModuleProps={setModuleProps} />
			</div>
		);
	}


	// Hooks
	useEffect(() => {
		getStaffsActiveProjects();
		getSupportData();
	}, []);

	// Main UI
	return (
		<div className="w-full h-full p-5 space-y-5 overflow-x-hidden overflow-y-auto bg-white">
			{MyGlobal.IsUserAdministrator() && uiStaffProjectsRow()}
			{MyGlobal.HasPermission(DerivedModules.ShowProjectsInDashboard) && uiProjectsRow()}
			{MyGlobal.HasPermission(DerivedModules.ShowInquiriesInDashboard) && uiInquiriesRow()}
			{uiInvoiceAndRv()}
		</div>
	);
}
