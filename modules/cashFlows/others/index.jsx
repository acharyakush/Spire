"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import Transactions from "./Transactions";
import MyConstants from "@/utilities/constants";
import NewHead from "@/modals/cashFlows/others/NewHead";
import NewEntity from "@/modals/cashFlows/others/NewEntity";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { Badge, Spinner } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBank, faChevronRight, faCoins, faEnvelope, faPhone, faPlusCircle } from "@fortawesome/free-solid-svg-icons";

export default function Others({ module, unmount }) {
	// Business Logic

	const [api, setApi] = useState({
		heads: [],
		list: [],
	});

	const [loading, setLoading] = useState({
		entities: false,
		supportData: false,
	});

	const [main, setMain] = useState({
		find: "",
		isLoading: false,
		selectedEntity: {
			emailAddress: "",
			entryAt: "",
			entryBy: { id: "", name: "" },
			head: {},
			id: "",
			module: { id: "", name: "" },
			name: "",
			paymentSource: "",
			phoneNumber: "",
			purpose: "",
			upiId: "",
		},
	});

	const [mounted, setMounted] = useState({
		mainComponent: false,
		newEntity: false,
		newHead: false,
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
		if (loading.supportData) {
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

	async function getSupportData() {
		setLoading((s) => ({ ...s, supportData: true }));

		try {
			const response = await axios.get(MyConstants.ApiEndpoints.CashFlows.Modules.Entities.GetEntities, MyGlobal.GetHeaders({ moduleId: module.id }));

			const list = [];

			if (Array.isArray(response.data.entities) && response.data.entities.length) {
				response.data.entities.forEach((fe) => {
					let moduleName = "";
					const module = response.data.modules.find((f) => f.custom_id === fe.module_id);

					if (typeof module === "object") {
						moduleName = module.name;
					}

					list.push({
						emailAddress: fe.email_address,
						entryAt: fe.entry_at,
						entryBy: {
							id: fe.entry_by_id,
							name: MyGlobal.GetAnyDataFromId(fe.entry_by_id, "full_name"),
						},
						id: fe.id,
						module: {
							id: fe.module_id,
							name: moduleName,
						},
						name: fe.name,
						paymentSource: fe.payment_source,
						phoneNumber: fe.phone_number,
						purpose: fe.purpose,
						upiId: fe.upi_id,
					});
				});

				setEntity(list.at(0));
			}

			setApi((s) => ({ ...s, list }));
			setMounted((s) => ({ ...s, mainComponent: true }));
		} catch (error) {
			MyGlobal.HandleErrors(error, `${module.name} => Get Support Data`);
		} finally {
			setLoading((s) => ({ ...s, supportData: false }));
		}
	}

	async function getSelectedEntityHeads(entityId, moduleId) {
		setLoading((s) => ({ ...s, entities: true }));

		try {
			const response = await axios.get(MyConstants.ApiEndpoints.CashFlows.Modules.Entities.GetHeads, MyGlobal.GetHeaders({ entityId, moduleId }));

			const heads = [];

			if (response.data.heads.length) {
				response.data.heads.forEach((fe) => {
					let amountPaid = 0;

					const transaction = response.data.transactions.filter(
						(f) => f.entity_id === fe.entity_id && f.head_id === fe.id && f.module_id === fe.module_id,
					);

					if (Array.isArray(transaction) && transaction.length) {
						transaction.forEach((_fe) => {
							amountPaid += Number(_fe.amount);
						});
					}

					heads.push({
						amount: fe.amount,
						amountPaid,
						amountPending: Number(fe.amount) - amountPaid,
						entryAt: fe.entry_at,
						entryBy: {
							id: fe.entry_by_id,
							name: MyGlobal.GetAnyDataFromId(fe.entry_by_id, "full_name"),
						},
						id: fe.id,
						moduleId: fe.module_id,
						firm: {
							id: fe.firm_id,
							name: "",
						},
						bank: {
							id: fe.bank_id,
							name: "",
						},
						paymentSource: fe.payment_source,
						purpose: fe.purpose,
						remark: fe.remarks,
					});
				});
			}

			setApi((s) => ({ ...s, heads }));
		} catch (error) {
			MyGlobal.HandleErrors(error, `${module.name} => Get Support Data`);
		} finally {
			setLoading((s) => ({ ...s, entities: false }));
		}
	}

	function setEntity(object) {
		setMain((s) => ({
			...s,
			selectedEntity: {
				emailAddress: object.emailAddress,
				entryAt: object.entryAt,
				entryBy: {
					id: object.entryBy.id,
					name: object.entryBy.name,
				},
				id: object.id,
				module: {
					id: object.module.id,
					name: object.module.name,
				},
				name: object.name,
				paymentSource: object.paymentSource,
				phoneNumber: object.phoneNumber,
				purpose: object.purpose,
				upiId: object.upiId,
			},
		}));

		getSelectedEntityHeads(object.id, object.module.id);
	}

	function toggleNewEntity() {
		setMounted((s) => ({ ...s, newEntity: !s.newEntity }));
	}

	function toggleNewHead() {
		setMounted((s) => ({ ...s, newHead: !s.newHead }));
	}

	function toggleTransactions(object) {
		const _object = { ...main.selectedEntity, head: object ?? {} };

		setMain((s) => ({ ...s, selectedEntity: _object }));
		setMounted((s) => ({ ...s, transactions: object ? true : false }));
	}

	// UI Components
	function uiBody() {
		return (
			<div className="flex w-full h-full justify-center items-start">
				<div className="flex flex-col w-[10%] space-y-2.5 mx-5 justify-start items-center">{uiEntities()}</div>
				<div className="flex flex-col w-[90%] h-full mr-5 justify-start items-center rounded shadow contrast-background">{uiSelectedEntity()}</div>
			</div>
		);
	}

	function uiEntities() {
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

	function uiHeads() {
		return api.heads.map((m) => {
			const totalPaidOrReceived = module.name === MyConstants.Modules.Other.CashFlowModules.OtherIncome.name ? "Total Received" : "Total Paid";
			return (
				<div
					className="flex flex-col w-1/3 p-4 space-y-3 justify-center items-center relative rounded shadow primary-border primary-background-transparent-01"
					key={m.id}>
					<span className="font-medium-16 black-text">{m.purpose}</span>
					<div className="flex flex-col w-full p-4 space-y-2 rounded shadow contrast-background">
						<div className="flex w-full justify-between items-center">
							<span className="font-regular-12">Total Pending</span>
							<span className="font-medium-12 red-text">{MyGlobal.ThousandSeparator(m.amountPending)}</span>
						</div>
						<div className="full-border" />
						<div className="flex w-full justify-between items-center">
							<span className="font-regular-12">{totalPaidOrReceived}</span>
							<span className="font-medium-12 green-text">{MyGlobal.ThousandSeparator(m.amountPaid)}</span>
						</div>
						<div className="full-border" />
						<div className="flex w-full justify-between items-center">
							<span className="font-regular-12">Total Fees</span>
							<span className="font-medium-14 black-text">{MyGlobal.ThousandSeparator(m.amount)}</span>
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
		if (loading.supportData) {
			return (
				<div className={blankDataWrapper}>
					<span className="font-regular-12 gray-text">Loading...</span>
				</div>
			);
		} else if (!api.list.length) {
			return (
				<div className={`${blankDataWrapper} flex-col space-y-2`}>
					<span className="font-regular-12 gray-text">No records entered.</span>
					{uiNewButton()}
				</div>
			);
		} else {
			return uiBody();
		}
	}

	function uiNewEntity() {
		if (api.list.length) {
			return <FontAwesomeIcon className="cursor-pointer primary-text" icon={faPlusCircle} onClick={() => toggleNewEntity()} size="xl" />;
		}
	}

	function uiNewHead() {
		if (main.selectedEntity.id) {
			return <FontAwesomeIcon className="ml-2.5 cursor-pointer primary-text" icon={faPlusCircle} onClick={() => toggleNewHead()} />;
		}
	}

	function uiNewButton() {
		return (
			<button className="space-x-1.5 primary-button-transparent-background" onClick={() => toggleNewEntity()}>
				<FontAwesomeIcon className="cursor-pointer primary-text" icon={faPlusCircle} />
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
			const showEmailAddress = main.selectedEntity.emailAddress && main.selectedEntity.emailAddress.length > 0;
			const showPhoneNumber = main.selectedEntity.phoneNumber && String(main.selectedEntity.phoneNumber).length > 0;
			const showUpiId = main.selectedEntity.upiId && main.selectedEntity.upiId.length > 0;

			const wrapper = "flex h-[22px] space-x-2.5 justify-center items-center primary-text";

			const emailAddressWrapper = showEmailAddress ? `${wrapper} visible` : "h-[22px] invisible";
			const phoneNumberWrapper = showPhoneNumber ? `${wrapper} visible` : "h-[22px] invisible";
			const upiIdWrapper = showUpiId ? `${wrapper} visible` : "h-[22px] invisible";

			return (
				<div className="flex flex-col w-full h-full px-5 py-2.5 space-y-5 justify-start items-center">
					<div className="flex w-full justify-between items-center">
						<div className="flex flex-col w-1/2 justify-center items-start">
							<span className="view-heading">
								{main.selectedEntity.name}
								{uiNewHead()}
							</span>
							<span className="font-regular-11 gray-text">Purpose {main.selectedEntity.purpose}</span>
							<span className="font-regular-11 gray-text">Registered on {dayjs(main.selectedEntity.entryAt).format("DD MMM, YYYY")}</span>
						</div>
						<div className="flex flex-col w-1/2 space-y-2 justify-center items-end">
							<div className={emailAddressWrapper}>
								<FontAwesomeIcon className="primary-text" icon={faPhone} />
								<span className="cursor-pointer font-regular-11 primary-text" onClick={() => openWhatsAppWeb()}>
									{main.selectedEntity.phoneNumber}
								</span>
							</div>

							<div className={phoneNumberWrapper}>
								<FontAwesomeIcon className="primary-text" icon={faEnvelope} />
								<span className="cursor-pointer font-regular-11 primary-text" onClick={() => openEmailClient()}>
									{main.selectedEntity.emailAddress}
								</span>
							</div>

							<div className={upiIdWrapper}>
								<FontAwesomeIcon icon={faBank} />
								<span className="font-regular-11">{main.selectedEntity.upiId}</span>
							</div>
						</div>
					</div>
					<div className="flex w-full space-x-2.5 justify-start items-center">{uiHeads()}</div>
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
		return <Transactions entity={main.selectedEntity} reload={getSupportData} unmount={toggleTransactions} />;
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
						<span className="view-heading">{module.name}</span>
						{getIconOrBadge()}
					</div>
					<div className="flex w-1/2 space-x-2 justify-end items-center">{uiNewEntity()}</div>
				</div>
				{uiMain()}

				{mounted.newHead && <NewHead entity={main.selectedEntity} mount={mounted.newHead} reload={getSelectedEntityHeads} unmount={toggleNewHead} />}

				{mounted.newEntity && <NewEntity module={module} mount={mounted.newEntity} reload={getSupportData} unmount={toggleNewEntity} />}
			</div>
		);
	}
}
