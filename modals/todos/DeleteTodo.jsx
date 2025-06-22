"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import Draggable from "react-draggable";
import MyConstants from "@/utilities/constants";

import { useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { Spinner } from "@/components/Elements";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

export default function DeleteTodo({ mount, refresh, todo, unmount }) {
	// Business Logic
	const [isLoading, setIsLoading] = useState(false);
	const [isBoxDragged, setIsBoxDragged] = useState(false);

	const disableDeleteButton = isLoading ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";
	const deleteButtonStyle = `primary-button-condensed ${disableDeleteButton}`;

	// Functions
	async function deleteTodo() {
		try {
			setIsLoading(true);

			const response = await axios.post(MyConstants.ApiEndpoints.Todos.DeleteTodo, { customId: todo?.custom_id, id: todo?.id }, MyGlobal.GetHeaders());

			if (response.status === 200) {
				refresh();

				MyGlobal.AddActivity(`Deleted <b>${todo?.description}</b>`, MyConstants.Modules.Base.Todos);
				MyGlobal.ShowSuccessToast(MyConstants.Messages.TodoDeleted);

				unmount();
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Todos > deleteTodo()");
		} finally {
			setIsLoading(false);
		}
	}

	// UI Components
	function uiDeleteButton() {
		if (isLoading) {
			return (
				<span className="px-3.5">
					<Spinner />
				</span>
			);
		} else {
			return "Delete";
		}
	}

	function uiTitleBar() {
		const titleBarCursor = isBoxDragged ? "cursor-grabbing" : "cursor-grab";
		const titleBarStyle = `dialog-header shadow draggable-handle ${titleBarCursor}`;

		return (
			<DialogTitle
				as="h2"
				className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">Delete To-Do</span>
				<FontAwesomeIcon
					className="cursor-pointer"
					icon={faXmark}
					onClick={() => unmount()}
				/>
			</DialogTitle>
		);
	}

	// Main UI
	return (
		<Dialog
			as="div"
			className="relative z-50"
			open={mount}
			onClose={() => unmount()}>
			<div className="fixed inset-0 bg-black/50" />
			<div className="flex w-full justify-center items-center fixed inset-0 overflow-y-auto">
				<Draggable
					handle=".draggable-handle"
					onStart={() => setIsBoxDragged(true)}
					onStop={() => setIsBoxDragged(false)}>
					<DialogPanel className="w-1/4 transform overflow-hidden rounded contrast-background shadow">
						{uiTitleBar()}
						<div className="flex flex-col w-full p-6 space-y-3 justify-center items-start font-regular-12">
							<span>Are you sure you want to delete this todo?</span>
							<span>It will be hidden. You can recover it from the bin.</span>
						</div>
						<footer className="dialog-footer">
							<button
								className={deleteButtonStyle}
								onClick={() => deleteTodo()}>
								{uiDeleteButton()}
							</button>
						</footer>
					</DialogPanel>
				</Draggable>
			</div>
		</Dialog>
	);
}
