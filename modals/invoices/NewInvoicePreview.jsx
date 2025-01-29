"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import Draggable from "react-draggable";

import { useState } from "react";
import { Spinner } from "@/components/Elements";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

export default function NewInvoicePreview({ mount, invoice, isGeneratingPdf, unmount }) {
	// Business Logic
	const [isBoxMoved, setIsBoxMoved] = useState(false);

	const titleBarCursor = isBoxMoved ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header shadow draggable-handle ${titleBarCursor}`;

	// UI Components
	function uiButton() {
		if (isGeneratingPdf) {
			return (
				<span className="px-3.5">
					<Spinner />
				</span>
			);
		} else {
			return "Generate";
		}
	}

	function uiTitleBar() {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">Preview</span>
				<FontAwesomeIcon className="cursor-pointer" icon={faXmark} onClick={() => unmount(false)} />
			</DialogTitle>
		);
	}

	return (
		<Dialog as="div" className="relative z-50" open={mount ?? false} onClose={() => unmount(false)}>
			<div className="fixed inset-0 bg-black/50" />
			<div className="flex w-full justify-center items-center fixed inset-0 overflow-y-auto">
				<Draggable handle=".draggable-handle" onStart={() => setIsBoxMoved(true)} onStop={() => setIsBoxMoved(false)}>
					<DialogPanel className="w-fit h-4/5 transform overflow-hidden rounded shadow contrast-background">
						{uiTitleBar()}
						<div
							className="flex w-full h-[calc(100%-92px)] justify-center items-center overflow-y-auto primary-light-background"
							id="invoicePreviewWrapper">
							{invoice()}
						</div>
						<footer className="dialog-footer">
							<button className="primary-button-condensed" onClick={() => unmount(true)}>
								{uiButton()}
							</button>
						</footer>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}
