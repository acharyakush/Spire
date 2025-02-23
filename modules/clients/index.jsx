"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import Tippy from "@tippyjs/react";
import SingleClient from "../singleClient";
import writeXlsxFile from "write-excel-file";
import MyConstants from "@/utilities/constants";

import { Virtuoso } from "react-virtuoso";
import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { EditClient } from "@/modals/singleClient";
import { TextInputNative } from "@/components/Inputs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Badge, Spinner, SpinnerBig, Tooltip } from "@/components/Elements";
import { faFileExcel, faSearch, faSortAmountAsc, faSortAmountDesc } from "@fortawesome/free-solid-svg-icons";

export default function Clients() {
	// Business Logic
	const [api, setApi] = useState({
		clients: { copy: [], data: [] },
	});

	const [main, setMain] = useState({
		find: "",
		isLoading: false,
		selectedClient: {},
		sort: { column: "ID", isAscending: false },
	});

	const [mounted, setMounted] = useState({
		editClient: false,
		mainComponent: false,
		singleClient: false,
	});

	const thisView = MyConstants.Modules.Base.Clients;
	const headers = MyConstants.TableHeaders.Clients;

	const showFindBoxClearButton = main.find ? "cursor-pointer primary-text" : "hidden";
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

	function doFiltering() {
		const filteredData = api.clients.copy.filter((f) => {
			const findText = main.find.toLowerCase();

			const id = String(f.id).toLowerCase();
			const name = String(f.name).toLowerCase();
			const phoneNumber = String(f.phone_number);
			const emailAddress = String(f.email_address).toLowerCase();

			return id.includes(findText) || name.includes(findText) || phoneNumber.includes(findText) || emailAddress.includes(findText);
		});

		setApi((s) => ({ ...s, clients: { ...s.clients, data: filteredData } }));
	}

	function doSorting() {
		return api.clients.data.sort((a, b) => {
			const aJoinedOn = new Date(a.joined_on);
			const bJoinedOn = new Date(b.joined_on);

			const { column, isAscending } = main.sort;

			switch (true) {
				case column == headers.Id && isAscending:
					return a.id.localeCompare(b.id);
				case column == headers.Id && !isAscending:
					return b.id.localeCompare(a.id);
				case column == headers.Name && isAscending:
					return a.name.localeCompare(b.name);
				case column == headers.Name && !isAscending:
					return b.name.localeCompare(a.name);
				case column == headers.EmailAddress && isAscending:
					return a.email_address.localeCompare(b.email_address);
				case column == headers.EmailAddress && !isAscending:
					return b.email_address.localeCompare(a.email_address);
				case column == headers.JoinedOn && isAscending:
					return aJoinedOn - bJoinedOn;
				case column == headers.JoinedOn && !isAscending:
					return bJoinedOn - aJoinedOn;
			}
		});
	}

	function doExcelExport() {
		const records = [];
		const _records = [];

		const columnsWidth = [];
		const dataHeaders = [];

		const rowHeight = 34;
		const headerHeight = 44;
		const maximumColumnWidth = 20;

		const _headers = Object.values(headers);
		const blankRows = [{ span: _headers.length, height: rowHeight, colSpan: 2 }];

		doSorting().forEach((fe) => {
			records.push(
				fe.id,
				fe.name,
				fe.phone_number,
				fe.email_address,
				`${dayjs(fe.joined_on).format("hh:mm:ss A")}\n${dayjs(fe.joined_on).format("DD MMM YYYY")}`,
			);
		});

		records.forEach((fe) => {
			_records.push({
				align: "center",
				alignVertical: "center",
				color: "#000000",
				height: rowHeight,
				type: String,
				value: String(fe),
				wrap: true,
			});
		});

		_headers.forEach((fe) => {
			dataHeaders.push({
				align: "center",
				alignVertical: "center",
				fontWeight: "bold",
				height: rowHeight,
				value: fe,
				width: maximumColumnWidth,
			});

			columnsWidth.push({ width: maximumColumnWidth });
		});

		const separatedRowValues = MyGlobal.SeparateObjectsIntoArrays(_records, _headers.length);
		const headerText = `${thisView} (${api.clients.data.length})`;

		const header = [
			{
				align: "center",
				alignVertical: "center",
				fontSize: 16,
				fontWeight: "bold",
				height: headerHeight,
				span: _headers.length,
				value: headerText,
			},
		];

		const finalData = [header, blankRows, dataHeaders];
		separatedRowValues.forEach((fe) => finalData.push(fe));

		writeXlsxFile(finalData, {
			fontFamily: "Segoe UI",
			fontSize: 9,
			columns: columnsWidth,
			fileName: `${thisView}.xlsx`,
		});
	}

	async function getAllClients() {
		setMain((s) => ({ ...s, isLoading: true }));

		try {
			const response = await axios.get(MyConstants.ApiEndpoints.Clients.GetClients, MyGlobal.GetHeaders());

			if (response.status === 200) {
				if (Array.isArray(response.data) && response.data.length) {
					const confirmedClients = response.data.filter((f) => f.is_confirmed == 1);

					setApi({
						clients: {
							copy: confirmedClients,
							data: confirmedClients,
						},
					});
				}
			}

			setMounted((s) => ({ ...s, mainComponent: true }));
		} catch (error) {
			MyGlobal.HandleErrors(error, `${thisView} => Get All Clients`);
		} finally {
			setMain((s) => ({ ...s, isLoading: false }));
		}
	}

	function getRowsCount() {
		const apiCount = api.clients.data.length;
		const apiCopyCount = api.clients.copy.length;

		if (apiCount != apiCopyCount) {
			return `${apiCount} / ${apiCopyCount}`;
		} else {
			return apiCount;
		}
	}

	function getIconOrBadge() {
		if (main.isLoading) {
			return (
				<span className="pl-5 relative">
					<Spinner />
				</span>
			);
		} else {
			return api.clients.data.length > 0 && <Badge value={getRowsCount()} />;
		}
	}

	function openEmailClient(emailAddress) {
		globalThis.window.open(`mailto:${emailAddress}`, "_blank");
	}

	function openWhatsApp(phoneNumber) {
		globalThis.window.open(`https://wa.me/1${phoneNumber}`, "_blank");
	}

	function setInputs(key, value) {
		setMain((s) => ({ ...s, [key]: value }));
	}

	function setSort(column) {
		setMain((s) => ({ ...s, sort: { column, isAscending: !s.sort.isAscending } }));
	}

	function toggleEditClient(clientId) {
		setMain((s) => ({ ...s, selectedClient: clientId ?? {} }));
		setMounted((s) => ({ ...s, editClient: clientId ? true : false }));
	}

	function toggleSingleClient(clientId) {
		setMain((s) => ({ ...s, selectedClient: clientId ?? {} }));
		setMounted((s) => ({ ...s, singleClient: clientId ? true : false }));
	}

	// UI Components
	const uiBody = () => {
		return (
			<div className="flex flex-col w-full h-full justify-center items-start full-border">
				<div className="flex w-full h-9 justify-center items-center primary-background">{uiHeaders()}</div>
				<Virtuoso
					className="w-full h-full overflow-y-auto bottom-border contrast-background"
					data={doSorting()}
					itemContent={(i, row) => uiRows(row, i)}
					totalCount={api.clients.data.length}
				/>

				{mounted.editClient && <EditClient client={main.selectedClient} mount={mounted.editClient} reload={getAllClients} unmount={toggleEditClient} />}
			</div>
		);
	};

	const uiExport = () => {
		if (api.clients.data.length && api.clients.copy.length) {
			return (
				<button className="primary-button-transparent-background" onClick={() => doExcelExport()}>
					<FontAwesomeIcon className="primary-text" icon={faFileExcel} />
				</button>
			);
		}
	};

	const uiFind = () => {
		if (api.clients.copy.length) {
			return (
				<TextInputNative
					id="findBox"
					icon={faSearch}
					onChange={(e) => setInputs("find", e.target.value)}
					onClearButtonClick={() => setInputs("find", "")}
					placeholder=""
					showClearButton={showFindBoxClearButton}
					tabIndex={1}
					value={main.find}
					width="w-60"
				/>
			);
		}
	};

	const uiHeaders = () => {
		return Object.values(headers).map((m, i) => {
			const showArrow = m == main.sort.column ? "visible" : "invisible";

			return (
				<span className="w-1/5 space-x-1 cursor-pointer text-center text-white font-medium-10" onClick={() => setSort(m)} key={i}>
					<span>{m}</span>
					<span className={showArrow}>{uiSortArrows(m)}</span>
				</span>
			);
		});
	};

	const uiMain = () => {
		if (main.isLoading) {
			return (
				<div className={blankDataWrapper}>
					<SpinnerBig />
				</div>
			);
		} else if (!api.clients.data.length && api.clients.copy.length) {
			return (
				<div className={blankDataWrapper}>
					<span className="font-regular-12 gray-text">No clients found.</span>
				</div>
			);
		} else if (!api.clients.data.length && !api.clients.copy.length) {
			return (
				<div className={blankDataWrapper}>
					<span className="font-regular-12 gray-text">No clients registered.</span>
				</div>
			);
		} else if (mounted.singleClient) {
			return <SingleClient client={main.selectedClient} unmount={toggleSingleClient} />;
		} else {
			return uiBody();
		}
	};

	const uiRows = (row) => {
		const style = "flex flex-wrap w-1/5 min-h-9 justify-center items-center text-center";
		const tooltipStyle = `${style} cursor-pointer primary-text`;

		const clientId = MyGlobal.HighlightText(row.id, main.find);
		const clientName = MyGlobal.HighlightText(row.name, main.find);
		const phoneNumber = MyGlobal.HighlightText(row.phone_number, main.find);
		const emailAddress = MyGlobal.HighlightText(row.email_address, main.find);

		const joinedOn = dayjs(row.joined_on).format("DD MMM, YYYY");

		return (
			<div className="flex w-full justify-center items-center contrast-background bottom-border font-regular-11 black-text" key={row.id}>
				<Tippy content={<Tooltip text="Edit this client's details." />} placement="bottom">
					<span className={tooltipStyle} dangerouslySetInnerHTML={{ __html: clientId }} onClick={() => toggleEditClient(row)} />
				</Tippy>

				<Tippy content={<Tooltip text="Open this client's detailed view." />} placement="bottom">
					<span className={tooltipStyle} dangerouslySetInnerHTML={{ __html: clientName }} onClick={() => toggleSingleClient(row)} />
				</Tippy>

				<Tippy content={<Tooltip text="Open this contact on WhatsApp Web." />} placement="bottom">
					<span className={tooltipStyle} dangerouslySetInnerHTML={{ __html: phoneNumber }} onClick={() => openWhatsApp(row.phone_number)} />
				</Tippy>

				<Tippy content={<Tooltip text={row.email_address} />} placement="bottom">
					<span className={tooltipStyle} dangerouslySetInnerHTML={{ __html: emailAddress }} onClick={() => openEmailClient(row.email_address)} />
				</Tippy>

				<span className={style}>{joinedOn}</span>
			</div>
		);
	};

	const uiSortArrows = (column) => {
		if (main.sort.column == column) {
			if (main.sort.isAscending) {
				return <FontAwesomeIcon className="text-white" icon={faSortAmountDesc} />;
			} else {
				return <FontAwesomeIcon className="text-white" icon={faSortAmountAsc} />;
			}
		}
	};

	// Hooks
	useEffect(() => {
		getAllClients();

		globalThis.addEventListener("keydown", detectKeystrokes);
		return () => globalThis.removeEventListener("keydown", detectKeystrokes);
	}, []);

	useEffect(() => {
		if (mounted.mainComponent) {
			doFiltering();
		}
	}, [main.find]);

	// Main UI
	return (
		<div className="flex flex-col w-full h-full justify-start items-center">
			<>
				{!mounted.singleClient && (
					<div className="flex w-full px-5 py-2.5 justify-between items-center">
						<div className="flex w-1/3 space-x-2 justify-start items-center">
							<span className="view-heading">{thisView}</span>
							{getIconOrBadge()}
						</div>
						<div className="flex w-1/3 justify-center items-center">{uiFind()}</div>
						<div className="flex w-1/3 justify-end items-center">{uiExport()}</div>
					</div>
				)}
				{uiMain()}
			</>
		</div>
	);
}
