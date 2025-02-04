"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import Transactions from "./Transactions";
import MyConstants from "@/utilities/constants";
import NewEntity from "@/modals/cashFlows/others/NewEntity";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Badge, BadgeSmall, Spinner } from "@/components/Elements";
import { faBank, faChevronLeft, faCoins, faEnvelope, faPhone, faPlusCircle } from "@fortawesome/free-solid-svg-icons";

export default function Others({ module, reload, unmount }) {
	// Business Logic

	const [api, setApi] = useState({
		list: [],
	});

	const [main, setMain] = useState({
		find: "",
		isLoading: false,
		selectedEntity: {
			amount: "",
			emailAddress: "",
			entryAt: "",
			entryBy: { id: "", name: "" },
			id: "",
			moduleId: "",
			name: "",
			ownerFirm: { id: "", name: "" },
			ownerFirmBank: { id: "", name: "" },
			paymentSource: "",
			phoneNumber: "",
			purpose: "",
			upiId: "",
		},
	});

	const [mounted, setMounted] = useState({
		mainComponent: false,
		newEntity: false,
	});

	const [other, setOther] = useState({
		isLoading: false,
	});

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
		if (other.isLoading) {
			return (
				<span className="pl-5 relative">
					<Spinner />
				</span>
			);
		} else {
			return api.list.length > 0 && <Badge value={api.list.length} />;
		}
	}

	function openEmailClient() {
		globalThis.window.open(`mailto:${main.selectedEntity.emailAddress}`, "_blank");
	}

	function openWhatsAppWeb() {
		globalThis.window.open(`https://wa.me/1${main.selectedEntity.phoneNumber}`, "_blank");
	}

	function setEntity(obj) {
		setMain((s) => ({
			...s,
			selectedEntity: {
				amount: obj.amount,
				emailAddress: obj.emailAddress,
				entryAt: obj.entryAt,
				entryBy: { id: obj.entryBy.id, name: obj.entryBy.name },
				id: obj.id,
				moduleId: obj.moduleId,
				name: obj.name,
				ownerFirm: { id: obj.ownerFirm.id, name: obj.ownerFirm.name },
				ownerFirmBank: { id: obj.ownerFirmBank.id, name: obj.ownerFirmBank.name },
				paymentSource: obj.paymentSource,
				phoneNumber: obj.phoneNumber,
				purpose: obj.purpose,
				upiId: obj.upiId,
			},
		}));
	}

	async function getSupportData(action) {
		if (action) {
			reload();
		}

		setOther((s) => ({ ...s, isLoading: true }));

		try {
			const response = await axios.get(MyConstants.ApiEndpoints.Getter, MyGlobal.GetHeaders({ moduleId: module.id, type: "get-cash-flows-entities" }));

			if (Array.isArray(response.data) && response.data.length) {
				const list = [];
				const modules = [];

				response.data.forEach((fe) => {
					list.push({
						amount: "",
						emailAddress: fe.email_address,
						entryAt: fe.entry_at,
						entryBy: {
							id: fe.entry_by_id,
							name: MyGlobal.GetAnyDataFromId(fe.entry_by, "full_name"),
						},
						id: fe.id,
						moduleId: fe.module_id,
						name: fe.name,
						ownerFirm: {
							id: fe.owner_firm_id,
							name: "",
						},
						ownerFirmBank: {
							id: fe.owner_firm_bank_id,
							name: "",
						},
						paymentSource: fe.payment_source,
						phoneNumber: fe.phone_number,
						purpose: fe.purpose,
						upiId: fe.upi_id,
					});
				});

				setApi({ list, modules });
				setMounted((s) => ({ ...s, mainComponent: true }));
				setEntity(list.at(0));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, `${module.name} => Get Support Data`);
		} finally {
			setOther((s) => ({ ...s, isLoading: false }));
		}
	}

	function toggleNewEntity() {
		setMounted((s) => ({ ...s, newEntity: !s.newEntity }));
	}

	function toggleTransactions(object) {
		setMain((s) => ({ ...s, selectedEntity: { ...s.selectedEntity, selectedProject: object ?? {} } }));
		setMounted((s) => ({ ...s, transactions: object ? true : false }));
	}

	// UI Components
	function uiBody() {
		return (
			<div className="flex w-full h-full justify-center items-start">
				<div className="flex flex-col w-[10%] space-y-2.5 mx-5 justify-start items-center">{uiModules()}</div>
				<div className="flex flex-col w-[90%] h-full mr-5 justify-start items-center rounded shadow contrast-background">{uiSelectedEntity()}</div>
				{mounted.newEntity && <NewEntity module={module} mount={mounted.newEntity} reload={getSupportData} unmount={toggleNewEntity} />}
			</div>
		);
	}

	function uiCards() {
		return main.selectedEntity.projects.map((m) => {
			return (
				<div
					className="flex flex-col w-1/3 p-4 space-y-3 justify-center items-center relative rounded shadow primary-border primary-background-transparent-01"
					key={m.id}>
					<span className="font-medium-16 black-text">{m.company_name}</span>
					<div className="flex space-x-2.5 justify-center items-center font-regular-14 black-text">
						<span>{m.main_project_name}</span>
						<BadgeSmall value={m.project_id} />
					</div>
					<div className="flex flex-col w-full p-4 space-y-2 rounded shadow contrast-background">
						<div className="flex w-full justify-between items-center">
							<span className="font-regular-12">Total Pending</span>
							<span className="font-medium-12 red-text">{MyGlobal.ThousandSeparator(m.pending_fees)}</span>
						</div>
						<div className="full-border" />
						<div className="flex w-full justify-between items-center">
							<span className="font-regular-12">Total Paid</span>
							<span className="font-medium-12 green-text">{MyGlobal.ThousandSeparator(m.paid_fees)}</span>
						</div>
						<div className="full-border" />
						<div className="flex w-full justify-between items-center">
							<span className="font-regular-12">Total Fees</span>
							<span className="font-medium-14 black-text">{MyGlobal.ThousandSeparator(m.total_fees)}</span>
						</div>
					</div>
					<div className="absolute -bottom-5 cursor-pointer" onClick={() => toggleTransactions(m)}>
						<span className="flex w-fit px-4 py-2 space-x-2.5 justify-center items-center rounded-full text-white font-medium-11 primary-background primary-border">
							<FontAwesomeIcon icon={faCoins} />
							<span>Transactions</span>
						</span>
					</div>
				</div>
			);
		});
	}

	function uiMain() {
		if (other.isLoading) {
			return (
				<div className={blankDataWrapper}>
					<span className="font-regular-12 gray-text">Loading...</span>
				</div>
			);
		} else if (!api.list.length) {
			return (
				<div className={blankDataWrapper}>
					<span className="font-regular-12 gray-text">No data found.</span>
				</div>
			);
		} else {
			return uiBody();
		}
	}

	function uiModules() {
		return api.list.map((m, i) => {
			const selectedStyle =
				m.id == main.selectedEntity.id ? "primary-border primary-background-transparent-01 primary-text" : "full-border bg-white black-text";

			const wrapper = `flex w-full px-4 py-2 justify-between items-center rounded shadow ${selectedStyle} font-regular-10 hovered-rows`;

			return (
				<button className={wrapper} key={i} onClick={() => setEntity(m)}>
					{m.name}
				</button>
			);
		});
	}

	function uiNew() {
		return (
			<button className="space-x-1.5 primary-button-transparent-background" onClick={() => toggleNewEntity()}>
				<FontAwesomeIcon icon={faPlusCircle} />
				<span>New</span>
			</button>
		);
	}

	function uiSelectedEntity() {
		if (main.selectedEntity.id == 0) {
			return (
				<div className="flex flex-col w-full h-full px-5 py-2.5 space-y-5 justify-center items-center font-medium-12 gray-text">Select an entity</div>
			);
		} else {
			return (
				<div className="flex flex-col w-full h-full px-5 py-2.5 space-y-5 justify-start items-center">
					<div className="flex w-full justify-between items-center">
						<div className="flex flex-col w-1/2 justify-center items-start">
							<span className="view-heading">{main.selectedEntity.name}</span>
							<span className="font-regular-11 gray-text">Registered on {dayjs(main.selectedEntity.entryAt).format("DD MMM, YYYY")}</span>
						</div>
						<div className="flex flex-col w-1/2 space-y-2 justify-center items-end">
							<div className="flex space-x-2.5 justify-center items-center">
								<FontAwesomeIcon className="primary-text" icon={faPhone} />
								<span className="cursor-pointer font-regular-11 primary-text" onClick={() => openWhatsAppWeb()}>
									{main.selectedEntity.phoneNumber}
								</span>
							</div>
							<div className="flex space-x-2.5 justify-center items-center">
								<FontAwesomeIcon className="primary-text" icon={faEnvelope} />
								<span className="cursor-pointer font-regular-11 primary-text" onClick={() => openEmailClient()}>
									{main.selectedEntity.emailAddress}
								</span>
							</div>
							<div className="flex space-x-2.5 justify-center items-center primary-text">
								<FontAwesomeIcon icon={faBank} />
								<span className="font-regular-11">{main.selectedEntity.upiId}</span>
							</div>
						</div>
					</div>
					{/* <div className="flex w-full space-x-2.5 justify-start items-center">{uiCards()}</div> */}
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

	if (mounted.transactions) {
		return <Transactions project={main.selectedEntity.selectedProject} reload={getSupportData} unmount={toggleTransactions} />;
	} else {
		return (
			<div className="flex flex-col w-full h-full justify-start items-center">
				<div className="flex w-full px-5 py-2.5 justify-between items-center">
					<div className="flex w-full space-x-2 justify-start items-center">
						<FontAwesomeIcon className="pr-1 cursor-pointer black-text" icon={faChevronLeft} onClick={() => unmount()} />
						<span className="view-heading">{module.name}</span>
						{getIconOrBadge()}
					</div>
					<div className="flex w-1/2 space-x-2 justify-end items-center">{uiNew()}</div>
				</div>
				{uiMain()}
			</div>
		);
	}
}
