"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import MyConstants from "@/utilities/constants";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { TextInput } from "@/components/Inputs";
import { BadgeSmall } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { faSearch, faTrashArrowUp, faXmark } from "@fortawesome/free-solid-svg-icons";

export default function RestoreTodos({ mount, refresh, _todos, unmount }) {
	// Business Logic
	const [isDeleting, setIsDeleting] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isBoxDragged, setIsBoxDragged] = useState(false);
	const [todos, setTodos] = useState([]);
	const [todosCopy, setTodosCopy] = useState([]);
	const [search, setSearch] = useState("");

	// Functions
	function getFilteredTodos() {
		if (search) {
			return todosCopy.filter((f) => String(f.description).toLowerCase().includes(search.toLowerCase()));
		}

		return todos;
	}
	async function getTodos() {
		try {
			setIsDeleting(true);

			const response = await axios.get(MyConstants.ApiEndpoints.Getter, MyGlobal.GetHeaders({ type: "get-deleted-todos" }));

			if (response.status === 200) {
				setTodos(response.data);
				setTodosCopy(response.data);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Todos > Restore Todos > getTodos");
		} finally {
			setIsDeleting(false);
		}
	}

	async function restoreTodo(todo) {
		try {
			setIsLoading(true);

			const body = {
				todoId: todo.id,
				type: "restore-todo",
			};

			const response = await axios.post(MyConstants.ApiEndpoints.Setter, body, MyGlobal.GetHeaders({ id: todo.id }));

			if (response.status === 200) {
				refresh();
				getTodos();

				MyGlobal.AddActivity("Todo restored <b>" + todo.description + "</b>", MyConstants.Modules.Base.Todos);
				MyGlobal.ShowSuccessToast("Todo Restored");
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Todos > Restore Todos > restoreTodos");
		} finally {
			setIsLoading(false);
		}
	}

	// UI Components
	function uiTitleBar() {
		const totalTodos = _todos ? Object.values(_todos)?.reduce((acc, curr) => acc + curr.length, 0) + todosCopy.length : "";

		const titleBarCursor = isBoxDragged ? "cursor-grabbing" : "cursor-grab";
		const titleBarStyle = `dialog-header shadow draggable-handle ${titleBarCursor}`;

		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<div className="flex space-x-2.5 w-full justify-center items-center">
					<span>Deleted Todos</span>
					<span>{getFilteredTodos().length > 0 && <BadgeSmall value={getFilteredTodos().length + " / " + totalTodos} />}</span>
				</div>
				<FontAwesomeIcon className="cursor-pointer" icon={faXmark} onClick={() => unmount()} />
			</DialogTitle>
		);
	}

	// Hooks
	useEffect(() => {
		getTodos();
	}, []);

	// Main UI
	return (
		<Dialog as="div" className="relative z-50" open={mount} onClose={() => unmount()}>
			<div className="fixed inset-0 bg-black/50" />
			<div className="flex w-full justify-center items-center fixed inset-0 overflow-y-auto">
				<DialogPanel className="w-4/5 h-4/5 transform overflow-hidden rounded contrast-background shadow">
					{uiTitleBar()}
					<div className="flex flex-col w-full h-full justify-start items-center">
						<TextInput icon={faSearch} label="Search" onChange={(e) => setSearch(e.target.value)} value={search} width="w-1/4" />
						<div className="flex flex-col w-full h-full overflow-y-auto p-6 pt-0 pb-12 justify-start space-y-2.5 items-center">
							{getFilteredTodos().map((m, i) => (
								<div className="flex px-5 py-2 w-full justify-center items-center rounded shadow-sm bg-blue-50 border-b border-sky-400" key={i}>
									<div className="flex w-4/5 justify-start items-center font-regular-12">
										<span dangerouslySetInnerHTML={{ __html: MyGlobal.HighlightText(m.description, search) }} />
									</div>
									<span className="flex w-1/5 space-x-5 justify-end items-center">
										<BadgeSmall value={m.priority} />
										<FontAwesomeIcon className="text-sky-700 cursor-pointer hover:scale-125 duration-300" icon={faTrashArrowUp} onClick={() => restoreTodo(m)} />
									</span>
								</div>
							))}
						</div>
					</div>
				</DialogPanel>
			</div>
		</Dialog>
	);
}
