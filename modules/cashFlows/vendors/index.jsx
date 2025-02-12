"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import NewVendor from "./NewVendor";
import Transactions from "./Transactions";
import MyConstants from "@/utilities/constants";
import NewHead from "@/modals/cashFlows/vendors/NewHead";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Badge, BadgeGreenLarge, Spinner } from "@/components/Elements";
import { faBank, faChevronRight, faCoins, faEnvelope, faPhone, faPlusCircle } from "@fortawesome/free-solid-svg-icons";

export default function Vendors({ unmount }) {
	// Business Logic

	const [api, setApi] = useState({
		heads: [],
		vendors: [],
	});

	const [loading, setLoading] = useState({
		entities: false,
		supportData: false,
	});

	const [main, setMain] = useState({
		find: "",
		isLoading: false,
		selectedVendor: {
			details: {
				email_address: "",
				joined_on: "",
				name: "",
				phone_number: "",
				upi_id: "",
			},
			id: 0,
			selectedHead: {},
		},
	});

	const [mounted, setMounted] = useState({
		mainComponent: false,
		newHead: false,
		newVendor: false,
		transactions: false,
	});

	const thisView = MyConstants.Modules.Base.Vendors;
	const blankDataWrapper = "flex w-full h-full justify-center items-center contrast-background full-border";

	// Functions
	function detectKeystrokes(event) {
		switch (true) {
			case event.ctrlKey && event.key == "f":
				event.preventDefault();
				document.getElementById("findBox").focus();
				break;
		}
	}

	function getIconOrBadge() {
		if (loading.supportData) {
			return (
				<span className="pl-5 relative">
					<Spinner />
				</span>
			);
		} else {
			return api.vendors.length > 0 && <Badge value={api.vendors.length} />;
		}
	}

	async function getSelectedVendorHeads(vendorId) {
		setLoading((s) => ({ ...s, entities: true }));

		try {
			const response = await axios.get(MyConstants.ApiEndpoints.Vendors.GetHeads, MyGlobal.GetHeaders({ vendorId }));

			const heads = [];

			if (response.data.heads.length) {
				response.data.heads.forEach((fe) => {
					let amountPaid = 0;

					if (response.data.transactions.length) {
						response.data.transactions
							.filter((f) => f.head_id === fe.id)
							.forEach((_fe) => {
								amountPaid += Number(_fe.amount);
							});
					}

					heads.push({
						amount: Number(fe.amount),
						amountPaid,
						amountPending: Number(fe.amount) - amountPaid,
						entryAt: fe.entry_at,
						entryBy: {
							id: fe.entry_by_id,
							name: MyGlobal.GetAnyDataFromId(fe.entry_by_id, "full_name"),
						},
						ownerFirm: {
							id: fe.owner_firm_id,
							name: "",
						},
						ownerFirmBank: {
							id: fe.owner_firm_bank_id,
							name: "",
						},
						paymentSource: fe.payment_source,
						purpose: fe.purpose,
						remark: fe.remarks,
						vendorId: fe.vendor_id,
					});
				});
			}

			setApi((s) => ({ ...s, heads }));
		} catch (error) {
			MyGlobal.HandleErrors(error, `Vendors => Get Support Data`);
		} finally {
			setLoading((s) => ({ ...s, entities: false }));
		}
	}

	async function getSupportData() {
		setLoading((s) => ({ ...s, supportData: true }));

		try {
			const response = await axios.get(MyConstants.ApiEndpoints.Vendors.GetVendors, MyGlobal.GetHeaders());

			if (response.status === 200) {
				const vendors = [];

				if (response.data.vendors.length) {
					response.data.vendors.forEach((fe) => {
						const projects = [];

						response.data.transactions
							.filter((f) => f.vendor_id == fe.id)
							.forEach((_fe) => {
								let companyName = "";
								let mainProjectName = "";

								const company = response.data.companies.find((f) => f.client_id == _fe.client_id);

								if (typeof company === "object") {
									companyName = company.name;
								}

								const project = response.data.projects.find((f) => f.client_id == _fe.client_id && f.id == _fe.project_id);

								if (typeof project === "object") {
									const mainProject = response.data.mainProjects.find((f) => f.id == project.main_project_id);

									if (typeof mainProject === "object") {
										mainProjectName = mainProject.name;
									}
								}

								let paidFees = 0;

								response.data.transactions.forEach((__fe) => {
									if (__fe.project_id == _fe.project_id) {
										paidFees += Number(__fe.amount);
									}
								});

								const totalFees = Number(_fe.total_fees);
								const pendingFees = MyGlobal.ThousandSeparator(totalFees - paidFees);

								projects.push({
									..._fe,
									company_name: companyName,
									main_project_name: mainProjectName,
									paid_fees: paidFees,
									pending_fees: pendingFees,
									total_fees: totalFees,
								});
							});

						vendors.push({ ...fe, projects });
					});

					setApi((s) => ({ ...s, vendors }));
					setVendor(vendors.at(0));
				}

				setMounted((s) => ({ ...s, mainComponent: true }));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, `${thisView} => Get All Vendors`);
		} finally {
			setLoading((s) => ({ ...s, supportData: false }));
		}
	}

	function openEmailClient() {
		globalThis.window.open(`mailto:${main.selectedVendor.details.email_address}`, "_blank");
	}

	function openWhatsAppWeb() {
		globalThis.window.open(`https://wa.me/1${main.selectedVendor.details.phone_number}`, "_blank");
	}

	function setVendor(object) {
		setMain((s) => ({
			...s,
			selectedVendor: {
				...s.selectedVendor,
				details: object,
				id: object.id,
			},
		}));

		getSelectedVendorHeads(object.id);
	}

	function toggleNewHead() {
		setMounted((s) => ({ ...s, newHead: !s.newHead }));
	}

	function toggleNewVendor() {
		setMounted((s) => ({ ...s, newVendor: !s.newVendor }));
	}

	function toggleTransactions(object) {
		setMain((s) => ({ ...s, selectedVendor: { ...s.selectedVendor, selectedHead: object ?? {} } }));
		setMounted((s) => ({ ...s, transactions: object ? true : false }));
	}

	// UI Components
	function uiBody() {
		return (
			<div className="flex w-full h-full justify-center items-start">
				<div className="flex flex-col w-[10%] space-y-2.5 mx-5 justify-start items-center">{uiModules()}</div>
				<div className="flex flex-col w-[90%] h-[calc(100vh-100px)] mr-5 justify-start items-center rounded shadow contrast-background">
					{uiSelectedVendor()}
				</div>
			</div>
		);
	}

	function uiHeads() {
		return api.heads.map((m, i) => {
			return (
				<div
					className="flex flex-col w-full p-4 space-y-3 justify-center items-center relative rounded shadow full-border primary-background-transparent-01"
					key={m.id}>
					<span className="absolute -left-5 -top-2.5">
						<BadgeGreenLarge value={i + 1} />
					</span>
					<span className="font-medium-16 black-text">{m.purpose}</span>
					<div className="flex flex-col w-full p-4 space-y-2 rounded shadow contrast-background">
						<div className="flex w-full justify-between items-center">
							<span className="font-regular-12">Total Pending</span>
							<span className="font-medium-12 red-text">{MyGlobal.ThousandSeparator(m.amountPending)}</span>
						</div>
						<div className="full-border" />
						<div className="flex w-full justify-between items-center">
							<span className="font-regular-12">Total Paid</span>
							<span className="font-medium-12 green-text">{MyGlobal.ThousandSeparator(m.amountPaid)}</span>
						</div>
						<div className="full-border" />
						<div className="flex w-full justify-between items-center">
							<span className="font-regular-12">Total Fees</span>
							<span className="font-medium-14 black-text">{MyGlobal.ThousandSeparator(m.amount)}</span>
						</div>
					</div>
					<div className="absolute -bottom-5 cursor-pointer group" onClick={() => toggleTransactions(m)}>
						<span className="flex w-fit px-4 py-2 justify-center items-center rounded-full text-white font-medium-11 primary-background primary-border transition-all duration-500 ease-in-out">
							<FontAwesomeIcon icon={faCoins} />
							<span className="flex justify-center items-center max-w-0 overflow-hidden opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-3 transition-all duration-500 ease-in-out whitespace-nowrap">
								Transactions
							</span>
						</span>
					</div>
				</div>
			);
		});
	}

	function uiNewHead() {
		if (main.selectedVendor.id) {
			return <FontAwesomeIcon className="ml-2.5 cursor-pointer primary-text" icon={faPlusCircle} onClick={() => toggleNewHead()} />;
		}
	}

	function uiMain() {
		if (loading.supportData) {
			return (
				<div className={blankDataWrapper}>
					<span className="font-regular-12 gray-text">Loading...</span>
				</div>
			);
		} else if (!api.vendors.length) {
			return (
				<div className={blankDataWrapper}>
					<span className="font-regular-12 gray-text">No vendors registered.</span>
				</div>
			);
		} else {
			return uiBody();
		}
	}

	function uiModules() {
		const modules = api.vendors.length ? [...api.vendors] : [];

		return modules.map((m, i) => {
			const selectedStyle =
				m.id == main.selectedVendor.id ? "primary-border primary-background-transparent-01 primary-text" : "full-border bg-white black-text";

			const wrapper = `flex w-full px-4 py-2 justify-between items-center rounded shadow ${selectedStyle} font-regular-10 hovered-rows`;

			return (
				<button className={wrapper} key={i} onClick={() => setVendor(m)}>
					{m.name}
				</button>
			);
		});
	}

	function uiNew() {
		return (
			<button className="space-x-1.5 primary-button-transparent-background" onClick={() => toggleNewVendor()}>
				<FontAwesomeIcon icon={faPlusCircle} />
				<span>New</span>
			</button>
		);
	}

	function uiSelectedVendor() {
		if (main.selectedVendor.id == 0) {
			return (
				<div className="flex flex-col w-full h-full px-5 py-2.5 space-y-5 justify-center items-center font-medium-12 gray-text">Select a vendor</div>
			);
		} else {
			return (
				<div className="flex flex-col w-full h-full px-5 py-2.5 space-y-5 justify-start items-center">
					<div className="flex w-full justify-between items-center">
						<div className="flex flex-col w-1/2 justify-center items-start">
							<span className="view-heading">
								{main.selectedVendor.details.name}
								{uiNewHead()}
							</span>
							<span className="font-regular-11 gray-text">
								Associated since {dayjs(main.selectedVendor.details.joined_on).format("DD MMM, YYYY")}
							</span>
						</div>
						<div className="flex flex-col w-1/2 space-y-2 justify-center items-end">
							<div className="flex space-x-2.5 justify-center items-center">
								<FontAwesomeIcon className="primary-text" icon={faPhone} />
								<span className="cursor-pointer font-regular-11 primary-text" onClick={() => openWhatsAppWeb()}>
									{main.selectedVendor.details.phone_number}
								</span>
							</div>
							<div className="flex space-x-2.5 justify-center items-center">
								<FontAwesomeIcon className="primary-text" icon={faEnvelope} />
								<span className="cursor-pointer font-regular-11 primary-text" onClick={() => openEmailClient()}>
									{main.selectedVendor.details.email_address}
								</span>
							</div>
							<div className="flex space-x-2.5 justify-center items-center primary-text">
								<FontAwesomeIcon icon={faBank} />
								<span className="font-regular-11">{main.selectedVendor.details.upi_id}</span>
							</div>
						</div>
					</div>
					<div className="w-full h-[calc(100%-105px)] p-5 overflow-y-auto scrollbar-gutter">
						<div className="w-full grid grid-cols-3 gap-x-20 gap-y-16 justify-items-start items-center">{uiHeads()}</div>
					</div>
				</div>
			);
		}
	}

	// Hooks
	useEffect(() => {
		getSupportData();

		globalThis.addEventListener("keydown", detectKeystrokes);
		return () => globalThis.removeEventListener("keydown", detectKeystrokes);
	}, []);

	// Main UI
	if (!mounted.mainComponent) {
		return;
	}

	if (mounted.newVendor) {
		return <NewVendor reload={getSupportData} unmount={toggleNewVendor} />;
	} else if (mounted.transactions) {
		return <Transactions head={main.selectedVendor.selectedHead} reload={getSupportData} unmount={toggleTransactions} />;
	} else {
		return (
			<div className="flex flex-col w-full h-full justify-start items-center">
				<div className="flex w-full px-5 py-2.5 justify-between items-center">
					<div className="flex w-full space-x-2 justify-start items-center">
						<span
							className="cursor-pointer hover:underline hover:underline-offset-8 hover:decoration-[--primary] view-heading"
							onClick={() => unmount()}>
							{MyConstants.Modules.Base.CashFlow}
						</span>
						<FontAwesomeIcon className="gray-text" icon={faChevronRight} size="xs" />
						<span className="view-heading">{thisView}</span>
						{getIconOrBadge()}
					</div>
					<div className="flex w-1/2 space-x-2 justify-end items-center">{uiNew()}</div>
				</div>
				{uiMain()}

				{mounted.newHead && (
					<NewHead mount={mounted.newHead} reload={getSelectedVendorHeads} vendor={main.selectedVendor.details} unmount={toggleNewHead} />
				)}
			</div>
		);
	}
}
