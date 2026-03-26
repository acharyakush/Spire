"use client";

import axios from "axios";
import { ApiEndpoints, BaseModules, Messages } from "@/utilities/constants";

import { useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { Spinner } from "@/components/Elements";
import { TextInput } from "@/components/Inputs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { faIndianRupeeSign, faXmark } from "@fortawesome/free-solid-svg-icons";

export function DeleteTransaction({ mount, transaction, reload, unmount }) {
	// Business Logic
	const [main, setMain] = useState({
		isBoxMoving: false,
		isLoading: false,
	});

	const buttonClickEvent = main.isLoading ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";
	const buttonStyle = `primary-button-condensed ${buttonClickEvent}`;

	const titleBarCursor = main.isBoxMoving ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header shadow draggable-handle ${titleBarCursor}`;

	// Functions
	async function doDeletion() {
		try {
			setMain((s) => ({ ...s, isLoading: true }));

			const body = { payload: transaction.transaction, type: "delete-invoice-transaction" };
			const response = await axios.post(ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reload();

				MyGlobal.AddActivity(`Deleted transaction <b>${transaction.transaction.particulars}</b> having amount <b>${transaction.transaction.amount}</b> of <b>${transaction.transaction.project_id}</b>`, BaseModules.Invoices);
				MyGlobal.ShowSuccessToast(Messages.InvoiceTransactionDeleted);

				unmount();
			} else {
				MyGlobal.ShowErrorToast(Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Delete Invoice Transaction");
		} finally {
			setMain((s) => ({ ...s, isLoading: false }));
		}
	}

	function setBoxDrag() {
		setMain((s) => ({ ...s, isBoxMoving: !s.isBoxMoving }));
	}

	// UI
	function uiButton() {
		if (main.isLoading) {
			return (
				<span className="px-3.5">
					<Spinner />
				</span>
			);
		} else {
			return <span>Yes</span>;
		}
	}

	function uiTitleBar() {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">Delete Invoice Transaction</span>
				<FontAwesomeIcon className="cursor-pointer" icon={faXmark} onClick={() => unmount()} />
			</DialogTitle>
		);
	}

	// Main UI
	return (
		<Dialog as="div" className="relative z-50" open={mount} onClose={() => unmount()}>
			<div className="fixed inset-0 bg-black/50" />
			<div className="flex w-full justify-center items-center fixed inset-0 overflow-y-auto">
				<DialogPanel className="w-100 transform overflow-hidden rounded shadow contrast-background">
					{uiTitleBar()}
					<div className="flex flex-col w-full p-4 justify-center items-center font-regular-12 black-text">
						<div className="flex flex-col px-1 text-left">
							<span className="py-2">Do you want to delete this transaction?</span>
						</div>
					</div>
					<footer className="dialog-footer">
						<button className={buttonStyle} onClick={() => doDeletion()}>
							{uiButton()}
						</button>
					</footer>
				</DialogPanel>
			</div>
		</Dialog>
	);
}

export function EditAmount({ invoice, mount, reload, unmount }) {
	// Business Logic
	const [main, setMain] = useState({
		amount: "",
		isBoxMoved: false,
		isLoading: false,
	});

	const titleBarCursor = main.isBoxMoved ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header shadow draggable-handle ${titleBarCursor}`;

	const disableEditButton = main.isLoading || !main.amount ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";

	const editButtonStyle = `primary-button-condensed ${disableEditButton}`;

	// Functions
	async function doEditing() {
		setMain((s) => ({ ...s, isLoading: true }));

		const body = {
			amount: Number(main.amount),
			id: invoice.transaction.id,
			old: invoice.transaction.amount,
			projectId: invoice.transaction.project_id,
			source: invoice.invoice?.at(0)?.bank_id,
			type: "edit-invoice-transaction-amount",
			userId: MyGlobal.GetUserId(),
		};

		try {
			const response = await axios.post(ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reload();

				const invoiceCustomId = invoice.transaction.invoice_custom_id || "Not Generated";

				MyGlobal.AddActivity(`Edited transaction amount of <b>${invoice.transaction.project_id}</b> <b>${invoice.company_name}</b> (Invoice ID - <b>${invoiceCustomId}</b>) from <b>${invoice.transaction.amount}</b> to <b>${main.amount}</b>.`, BaseModules.Invoices);

				MyGlobal.ShowSuccessToast(Messages.AmountEdited);
			} else {
				MyGlobal.ShowErrorToast(Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Edit Invoice Transaction Amount");
		} finally {
			setMain((s) => ({ ...s, isLoading: false, quote: "" }));
			unmount(false);
		}
	}

	function setBoxDrag() {
		setMain((s) => ({ ...s, isBoxMoved: !s.isBoxMoved }));
	}

	function setQuote(quote) {
		setMain((s) => ({ ...s, amount: quote }));
	}

	// UI Components
	function uiButton() {
		if (main.isLoading) {
			return (
				<span className="px-3.5">
					<Spinner />
				</span>
			);
		} else {
			return "Edit";
		}
	}

	function uiTitleBar() {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">Edit Amount</span>
				<FontAwesomeIcon className="cursor-pointer" icon={faXmark} onClick={() => unmount(false)} />
			</DialogTitle>
		);
	}

	// Main UI
	return (
		<Dialog as="div" className="relative z-50" open={mount} onClose={() => unmount(false)}>
			<div className="fixed inset-0 bg-black/50" />
			<div className="flex w-full justify-center items-center fixed inset-0 overflow-y-auto">
				<DialogPanel className="w-100 transform overflow-hidden rounded shadow contrast-background">
					{uiTitleBar()}
					<div className="flex flex-col w-full p-5 space-y-2.5 justify-center items-center">
						<TextInput icon={faIndianRupeeSign} isReadOnly key={1} label="Current Amount" onChange={() => {}} onKeyPress={() => {}} tabIndex={1} value={invoice.transaction.amount} width="w-full" />
						<TextInput icon={faIndianRupeeSign} key={2} label="New Amount" onChange={(e) => setQuote(e.target.value)} onKeyPress={(e) => !MyGlobal.HasNumbers(e.key) && e.preventDefault()} tabIndex={2} value={main.amount} width="w-full" />
					</div>
					<footer className="dialog-footer">
						<button className={editButtonStyle} onClick={() => doEditing()}>
							{uiButton()}
						</button>
					</footer>
				</DialogPanel>
			</div>
		</Dialog>
	);
}
