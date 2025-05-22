"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import ReactDatePicker from "react-datepicker";
import MyConstants from "@/utilities/constants";

import { Virtuoso } from "react-virtuoso";
import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { TextInputNative } from "@/components/Inputs";
import { Badge, SpinnerBig } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { faCalendar, faChevronLeft, faFilter, faMultiply, faSearch, faSortAmountAsc, faSortAmountDesc } from "@fortawesome/free-solid-svg-icons";

export default function Activities({ source = "", unmount }) {
	// Business Logic
	const tableHeaders = MyConstants.TableHeaders.Activities;

	const [api, setApi] = useState({
		activities: { copy: [], data: [] },
		staff: [],
	});

	const [main, setMain] = useState({
		find: {
			date: { from: "", to: "" },
			text: "",
		},
		modules: { list: [], selected: "" },
		selectedStaff: 0,
		sort: { column: tableHeaders.EntryAt, isAscending: false },
	});

	const [loading, setLoading] = useState({
		activities: false,
	});

	const blankContainerStyle = "flex w-full h-full justify-center items-center font-regular-12 gray-text contrast-background full-border";

	const showFindClearButton = main.find.text.length ? "cursor-pointer primary-text" : "hidden";
	const showFromDateClearButton = main.find.date.from ? "cursor-pointer primary-text" : "hidden";
	const showToDateClearButton = main.find.date.to ? "cursor-pointer primary-text" : "hidden";

	// Functions
	function doFiltering(type) {
		const filtered = api.activities.copy
			.filter((f) => {
				if (main.selectedStaff != 0) {
					if (f.entry_by_id == main.selectedStaff) {
						return f;
					}
				} else {
					return f;
				}
			})
			.filter((f) => {
				if (type == "entryAt") {
					const checkDate = new Date(f.entry_at);
					const startDate = main.find.date.from;
					const endDate = main.find.date.to;

					if (checkDate >= startDate && checkDate <= endDate) {
						return f;
					}
				} else if (type == "module") {
					return f.module == main.modules.selected;
				} else {
					const findText = main.find.text.toLowerCase();

					const activity = String(f.activity).toLowerCase();
					const entryBy = String(f.entry_by_name).toLowerCase();
					const module = String(f.module).toLowerCase();

					return activity.includes(findText) || entryBy.includes(findText) || module.includes(findText);
				}
			});

		setApi((s) => ({ ...s, activities: { ...s.activities, data: filtered } }));
	}

	function doSorting() {
		return api.activities.data.sort((a, b) => {
			const aEntryAt = new Date(a.entry_at);
			const bEntryAt = new Date(b.entry_at);

			const { column, isAscending } = main.sort;

			switch (true) {
				case column == tableHeaders.EntryAt && isAscending:
					return aEntryAt - bEntryAt;
				case column == tableHeaders.EntryAt && !isAscending:
					return bEntryAt - aEntryAt;
				case column == tableHeaders.Module && isAscending:
					return a.module.localeCompare(b.module);
				case column == tableHeaders.Module && !isAscending:
					return b.module.localeCompare(a.module);
				case column == tableHeaders.Activity && isAscending:
					return a.activity.localeCompare(b.activity);
				case column == tableHeaders.Activity && !isAscending:
					return b.activity.localeCompare(a.activity);
				case column == tableHeaders.EntryBy && isAscending:
					return a.entry_by_name.localeCompare(b.entry_by_name);
				case column == tableHeaders.EntryBy && !isAscending:
					return b.entry_by_name.localeCompare(a.entry_by_name);
			}
		});
	}

	async function getActivities() {
		try {
			setLoading((s) => ({ ...s, activities: true }));

			const response = await axios.get(MyConstants.ApiEndpoints.Getter, MyGlobal.GetHeaders({ type: "get-activities" }));

			if (response.status === 200) {
				const revised = response.data.map((m) => {
					return {
						...m,
						entry_at_time: dayjs(m.entry_at).format("hh:mm:ss a"),
						entry_at_date: dayjs(m.entry_at).format("DD-MM-YYYY"),
						_entry_at: `${dayjs(m.entry_at).format("hh:mm:ss a")}\n${dayjs(m.entry_at).format("DD-MM-YYYY")}`,
						entry_by_name: MyGlobal.GetAnyDataFromId(m.entry_by_id, "full_name"),
					};
				});

				const staff = [];

				MyGlobal.GetAllUsers().forEach((fe) => {
					const count = revised.filter((f) => f.entry_by_id === fe.id).length;
					staff.push({ ...fe, count });
				});

				staff.unshift({ id: 0, count: 0, full_name: "All" });

				setApi((s) => ({
					...s,
					activities: {
						copy: revised,
						data: revised,
					},
					staff,
				}));

				const moduleMap = new Map();

				response.data.forEach(({ module }) => {
					if (moduleMap.has(module)) {
						moduleMap.set(module, moduleMap.get(module) + 1);
					} else {
						moduleMap.set(module, 1);
					}
				});

				const modules = Array.from(moduleMap, ([name, count]) => ({ name, count }));

				setMain((s) => ({
					...s,
					modules: {
						list: modules,
						selected: "",
					},
				}));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Activities");
		} finally {
			setLoading((s) => ({ ...s, activities: false }));
		}
	}

	function getRowsCount() {
		if (api.activities.data.length != api.activities.copy.length) {
			return `${api.activities.data.length} / ${api.activities.copy.length}`;
		} else {
			return MyGlobal.ThousandSeparator(api.activities.data.length);
		}
	}

	function setInputs(key, value) {
		if (key == "from" || key == "to") {
			setMain((s) => ({ ...s, find: { ...s.find, date: { ...s.find.date, [key]: value } } }));
		} else if (key == "module") {
			setMain((s) => ({ ...s, modules: { ...s.modules, selected: value.name } }));
		} else {
			setMain((s) => ({ ...s, find: { ...s.find, [key]: value } }));
		}
	}

	function setSort(column) {
		setMain((s) => ({ ...s, sort: { column, isAscending: !s.sort.isAscending } }));
	}

	function setStaff(object) {
		if (object.id != main.selectedStaff) {
			const moduleMap = new Map();

			api.activities.copy
				.filter((f) => {
					if (object.id != 0) {
						if (f.entry_by_id == object.id) {
							return f;
						}
					} else {
						return f;
					}
				})
				.forEach(({ module }) => {
					if (moduleMap.has(module)) {
						moduleMap.set(module, moduleMap.get(module) + 1);
					} else {
						moduleMap.set(module, 1);
					}
				});

			const modules = Array.from(moduleMap, ([name, count]) => ({ name, count }));

			setMain((s) => ({ ...s, modules: { list: modules, selected: "" }, selectedStaff: object.id }));
		}
	}

	// UI Components
	function uiBody() {
		return (
			<div className="flex w-full h-full justify-center items-start">
				<div className="flex flex-col w-[15%] space-y-2.5 mx-5 justify-start items-center">{uiStaff()}</div>
				<div className="flex flex-col w-[85%] h-full mr-5 justify-start items-center">
					<div className="flex flex-col w-full h-full justify-center items-start full-border">
						<div className="flex w-full h-9 justify-center items-center primary-background">{uiHeaders()}</div>
						<Virtuoso className="w-full h-full overflow-y-auto bottom-border contrast-background" data={doSorting()} itemContent={(i, row) => uiRows(row, i)} totalCount={api.activities.data.length} />
					</div>
				</div>
			</div>
		);
	}

	function uiFind() {
		if (api.activities.copy.length) {
			return (
				<TextInputNative
					id="findBox"
					icon={faSearch}
					onChange={(e) => setInputs("text", e.target.value)}
					onClearButtonClick={() => setInputs("text", "")}
					placeholder="Find"
					showClearButton={showFindClearButton}
					tabIndex="3"
					value={main.find.text}
					width="w-36"
				/>
			);
		}
	}

	function uiFromDate() {
		if (api.activities.copy.length) {
			return (
				<div className="flex w-36 h-[30px] px-2.5 space-x-1 justify-start items-center rounded bg-white bottom-shadow full-border">
					<FontAwesomeIcon className="primary-text" icon={faCalendar} size="sm" />
					<ReactDatePicker
						className="w-20 h-6 bg-transparent outline-none font-regular-10"
						dateFormat="dd-MM-YYYY"
						dropdownMode="select"
						endDate={main.find.date.to}
						onChange={(e) => setInputs("from", e)}
						placeholderText="From"
						peekNextMonth
						selected={main.find.date.from}
						selectsStart
						startDate={main.find.date.from}
						showMonthDropdown
						showYearDropdown
						tabIndex="1"
					/>
					<FontAwesomeIcon className={showFromDateClearButton} onClick={() => setInputs("from", "")} icon={faMultiply} />
				</div>
			);
		}
	}

	function uiHeaders() {
		return Object.values(tableHeaders).map((m, i) => {
			const showArrow = m == main.sort.column ? "visible" : "invisible";

			return (
				<span className="w-1/4 space-x-1 cursor-pointer text-center text-white font-medium-10" onClick={() => setSort(m)} key={i}>
					<span>{m}</span>
					<span className={showArrow}>{uiSortArrows(m)}</span>
				</span>
			);
		});
	}

	function uiMain() {
		if (loading.activities) {
			return (
				<div className={blankContainerStyle}>
					<span className="font-regular-12 gray-text">Loading Activities ...</span>
				</div>
			);
		} else if (!api.activities.data.length && api.activities.copy.length) {
			return (
				<div className={blankContainerStyle}>
					<span className="font-regular-12 gray-text">No activities found.</span>
				</div>
			);
		} else if (!api.activities.data.length && !api.activities.copy.length) {
			return (
				<div className={blankContainerStyle}>
					<span className="font-regular-12 gray-text">No activities logged.</span>
				</div>
			);
		} else {
			return uiBody();
		}
	}

	function uiModulesMenu() {
		const wrapper = "flex w-36 h-[30px] px-2.5 space-x-2 justify-start items-center focus:outline-none relative z-40 rounded bottom-shadow bg-white full-border font-regular-10";

		return (
			<Menu as="div" className="flex w-36 justify-center items-center relative">
				<MenuButton className={wrapper}>
					<FontAwesomeIcon className="primary-text" icon={faFilter} size="sm" />
					<span className="gray-text">{main.modules.selected || "Module"}</span>
				</MenuButton>
				<MenuItems className="absolute w-full top-8 right-0 origin-top-right rounded contrast-background bottom-shadow focus:outline-none z-50 full-border">{uiModulesMenuList()}</MenuItems>
			</Menu>
		);
	}

	function uiModulesMenuList() {
		return main.modules.list.map((m, i) => {
			return (
				<MenuItem as="div" className="flex w-full justify-between items-center p-2 cursor-pointer border-y font-regular-9 black-text hovered-rows" key={i} onClick={() => setInputs("module", m)}>
					<span className="text-left">{m.name}</span>
					<span className="font-regular-9 gray-text">{m.count}</span>
				</MenuItem>
			);
		});
	}

	function uiRows(row) {
		const style = "flex flex-wrap w-1/4 min-h-12 max-h-max justify-center items-center whitespace-pre-wrap";

		const activity = MyGlobal.HighlightText(row.activity, main.find.text);
		const entryByName = MyGlobal.HighlightText(row.entry_by_name, main.find.text);
		const module = MyGlobal.HighlightText(row.module, main.find.text);

		return (
			<div className="flex w-full justify-center items-center contrast-background bottom-border black-text" key={row.id}>
				<div className={`${style} flex-col -space-y-0`}>
					<span className="font-regular-9 gray-text">{row.entry_at_time}</span>
					<span className="font-regular-11 black-text">{row.entry_at_date}</span>
				</div>
				<span className={`${style} font-regular-11`} dangerouslySetInnerHTML={{ __html: module }} />
				<span className={`${style} font-general-11`} dangerouslySetInnerHTML={{ __html: activity }} />
				<span className={`${style} font-regular-11`} dangerouslySetInnerHTML={{ __html: entryByName }} />
			</div>
		);
	}

	function uiSortArrows(column) {
		if (main.sort.column == column) {
			if (main.sort.isAscending) {
				return <FontAwesomeIcon className="text-white" icon={faSortAmountDesc} />;
			} else {
				return <FontAwesomeIcon className="text-white" icon={faSortAmountAsc} />;
			}
		}
	}

	function uiStaff() {
		return api.staff.map((m, i) => {
			const style = m.id == main.selectedStaff ? "primary-border primary-background-transparent-01 primary-text" : "full-border bg-white black-text";

			const wrapper = `flex w-full px-4 py-2 justify-between items-center rounded shadow ${style} font-regular-10 hovered-rows`;

			const name = m.id != 0 ? `${m.first_name} ${String(m.last_name).charAt(0)}.` : "All";

			return (
				<button className={wrapper} key={i} onClick={() => setStaff(m)}>
					<span className="text-left">{name}</span>
					{m.id != 0 && m.count > 0 && <span className="font-regular-9 gray-text">{m.count}</span>}
				</button>
			);
		});
	}

	function uiToDate() {
		if (api.activities.copy.length) {
			return (
				<div className="flex w-36 h-[30px] px-2.5 space-x-1 justify-center items-center rounded bottom-shadow bg-white full-border">
					<FontAwesomeIcon className="primary-text" icon={faCalendar} size="sm" />
					<ReactDatePicker
						className="w-20 h-6 bg-transparent outline-none font-regular-10"
						dateFormat="dd-MM-YYYY"
						dropdownMode="select"
						endDate={main.find.date.to}
						onChange={(e) => setInputs("to", e)}
						placeholderText="To"
						peekNextMonth
						selected={main.find.date.to}
						selectsEnd
						startDate={main.find.date.to}
						showMonthDropdown
						showYearDropdown
						tabIndex="2"
					/>
					<FontAwesomeIcon className={showToDateClearButton} onClick={() => setInputs("to", "")} icon={faMultiply} />
				</div>
			);
		}
	}

	// Hooks
	useEffect(() => {
		getActivities();
	}, []);

	useEffect(() => {
		doFiltering("");
	}, [main.find.text]);

	useEffect(() => {
		doFiltering("module");
	}, [main.modules.selected]);

	useEffect(() => {
		doFiltering("");
	}, [main.selectedStaff]);

	useEffect(() => {
		if (main.find.date.from && main.find.date.to) {
			doFiltering("entryAt");
		} else {
			doFiltering("");
		}
	}, [main.find.date]);

	// Main UI
	if (loading.activities) {
		return (
			<div className={blankContainerStyle}>
				<SpinnerBig />
			</div>
		);
	} else {
		return (
			<div className="flex flex-col w-full h-full justify-start items-center">
				<div className="flex w-full px-5 py-2.5 justify-between items-center">
					<div className="flex w-full space-x-2.5 justify-start items-center">
						{source == "" && <FontAwesomeIcon className="pr-1 cursor-pointer black-text" icon={faChevronLeft} onClick={() => unmount()} />}
						<div className="flex w-1/5 space-x-2 justify-start items-center">
							<span className="view-heading">Activities</span>
							{api.activities.data.length > 0 && <Badge value={getRowsCount()} />}
						</div>
					</div>
					<div className="flex w-4/5 space-x-2 justify-end items-center">
						<div className="flex w-1/2 space-x-2 justify-end items-center">
							{uiFromDate()}
							{uiToDate()}
						</div>
						{uiModulesMenu()}
						{uiFind()}
					</div>
				</div>
				{uiMain()}
			</div>
		);
	}
}
