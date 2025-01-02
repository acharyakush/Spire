"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import dayjs from "dayjs";
import Tippy from "@tippyjs/react";
import writeXlsxFile from "write-excel-file";
import MyConstants from "@/utilities/constants";

import { Virtuoso } from "react-virtuoso";
import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { TextInputNative } from "@/components/Inputs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Badge, SpinnerBig, Tooltip } from "@/components/Elements";
import { faFileExcel, faSearch, faSortAmountAsc, faSortAmountDesc } from "@fortawesome/free-solid-svg-icons";

export default function Clients() {
	// Business Logic
	const [apiData, setApiData] = useState({ allClients: { api: [], apiCopy: [] } });

	const [hasMounted, setHasMounted] = useState({ mainComponent: false, singleClientView: false });

	const [mainData, setMainData] = useState({
		isLoading: false,
		searchTerm: "",
		selectedClientId: 0,
		sort: { column: "ID", isAscending: false },
	});

	const thisView = MyConstants.Modules.Base.Clients;
	const tableHeaders = MyConstants.TableHeaders.Clients;

	const showSearchBoxClearButton = mainData.searchTerm ? "cursor-pointer primary-text" : "hidden";
	const blankDataWrapper = "flex w-full h-full justify-center items-center contrast-background full-border";

	// Functions
	const detectKeystrokes = (event) => {
		switch (true) {
			case event.ctrlKey && event.key == "f":
				event.preventDefault();
				document.getElementById("searchBox").focus();
				break;
		}
	};

	const doFiltering = () => {
		const filteredData = apiData.allClients.apiCopy.filter((client) => {
			const searchedText = mainData.searchTerm.toLowerCase();

			const clientId = String(client.id).toLowerCase();
			const clientName = String(client.name).toLowerCase();
			const contactNumber = String(client.contact_number);
			const emailAddress = String(client.email_address).toLowerCase();

			return (
				clientId.includes(searchedText) ||
				clientName.includes(searchedText) ||
				contactNumber.includes(searchedText) ||
				emailAddress.includes(searchedText)
			);
		});

		setApiData((s) => ({ ...s, allClients: { ...s.allClients, api: filteredData } }));
	};

	const doSorting = () => {
		return apiData.allClients.api.sort((a, b) => {
			const aJoinedOn = new Date(a.joined_on);
			const bJoinedOn = new Date(b.joined_on);

			const { column, isAscending } = mainData.sort;

			switch (true) {
				case column == tableHeaders.Id && isAscending:
					return a.id.localeCompare(b.id);
				case column == tableHeaders.Id && !isAscending:
					return b.id.localeCompare(a.id);
				case column == tableHeaders.Name && isAscending:
					return a.name.localeCompare(b.name);
				case column == tableHeaders.Name && !isAscending:
					return b.name.localeCompare(a.name);
				case column == tableHeaders.EmailAddress && isAscending:
					return a.email_address.localeCompare(b.email_address);
				case column == tableHeaders.EmailAddress && !isAscending:
					return b.email_address.localeCompare(a.email_address);
				case column == tableHeaders.JoinedOn && isAscending:
					return aJoinedOn - bJoinedOn;
				case column == tableHeaders.JoinedOn && !isAscending:
					return bJoinedOn - aJoinedOn;
			}
		});
	};

	const exportAsExcel = () => {
		const records = [];
		const _records = [];

		const columnsWidth = [];
		const dataHeaders = [];

		const rowHeight = 34;
		const headerHeight = 44;
		const maximumColumnWidth = 20;

		const headers = Object.values(tableHeaders);
		const blankRows = [{ span: headers.length, height: rowHeight, colSpan: 2 }];

		doSorting().forEach((client) => {
			records.push(
				client.id,
				client.name,
				client.contact_number,
				client.email_address,
				`${dayjs(client.joined_on).format("hh:mm:ss A")}\n${dayjs(client.joined_on).format("DD MMM YYYY")}`,
			);
		});

		records.forEach((record) => {
			_records.push({
				align: "center",
				alignVertical: "center",
				color: "#000000",
				height: rowHeight,
				type: String,
				value: String(record),
				wrap: true,
			});
		});

		headers.forEach((header) => {
			dataHeaders.push({
				align: "center",
				alignVertical: "center",
				fontWeight: "bold",
				height: rowHeight,
				value: header,
				width: maximumColumnWidth,
			});

			columnsWidth.push({ width: maximumColumnWidth });
		});

		const separatedRowValues = MyGlobal.SeparateObjectsIntoArrays(_records, headers.length);
		const headerText = `${thisView} (${apiData.allClients.api.length})`;

		const header = [
			{
				align: "center",
				alignVertical: "center",
				fontSize: 16,
				fontWeight: "bold",
				height: headerHeight,
				span: headers.length,
				value: headerText,
			},
		];

		const finalData = [header, blankRows, dataHeaders];
		separatedRowValues.forEach((row) => finalData.push(row));

		writeXlsxFile(finalData, {
			fontFamily: "Segoe UI",
			fontSize: 9,
			columns: columnsWidth,
			fileName: `${thisView}.xlsx`,
		});
	};

	const getDataCount = () => {
		const apiCount = apiData.allClients.api.length;
		const apiCopyCount = apiData.allClients.apiCopy.length;

		if (apiCount != apiCopyCount) {
			return `${apiCount} / ${apiCopyCount}`;
		} else {
			return apiCount;
		}
	};

	const getAllClients = async () => {
		setMainData((old) => ({ ...old, isLoading: true }));

		try {
			const response = await axios.get(MyConstants.ApiEndpoints.Clients.GetClients, MyGlobal.GetHeaders());

			if (response.status === 200) {
				setApiData({ allClients: { api: response.data, apiCopy: response.data } });
				setHasMounted((old) => ({ ...old, mainComponent: true }));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, `${thisView} => Get All Clients`);
		} finally {
			setMainData((old) => ({ ...old, isLoading: false }));
		}
	};

	const openEmailClient = (emailAddress) => {
		globalThis.window.open(`mailto:${emailAddress}`, "_blank");
	};

	const openWhatsApp = (phone) => {
		globalThis.window.open(`https://wa.me/1${phone}`, "_blank");
	};

	const setInputs = (key, value) => {
		setMainData((old) => ({ ...old, [key]: value }));
	};

	const setSort = (column) => {
		setMainData((old) => ({ ...old, sort: { column, isAscending: !mainData.sort.isAscending } }));
	};

	const toggleSingleClientView = (clientId) => {
		setMainData((old) => ({ ...old, selectedClientId: clientId ?? {} }));
		setHasMounted((old) => ({ ...old, singleClientView: clientId ? true : false }));
	};

	// UI Components
	const uiBody = () => {
		return (
			<div className="flex flex-col w-full h-full justify-center items-start full-border">
				<div className="flex w-full h-9 justify-center items-center primary-background">{uiHeaders()}</div>
				<Virtuoso
					className="w-full h-full overflow-y-auto bottom-border contrast-background"
					data={doSorting()}
					itemContent={(index, client) => uiRows(client, index)}
					totalCount={apiData.allClients.api.length}
				/>
			</div>
		);
	};

	const uiExport = () => {
		if (apiData.allClients.api.length && apiData.allClients.apiCopy.length) {
			return (
				<button className="space-x-1.5 primary-button-transparent-background" onClick={() => exportAsExcel()}>
					<FontAwesomeIcon className="primary-text" icon={faFileExcel} />
					<span>Export</span>
				</button>
			);
		}
	};

	const uiHeaders = () => {
		return Object.values(tableHeaders).map((header, index) => {
			const showIndicator = header == mainData.sort.column ? "visible" : "invisible";

			return (
				<span className="w-1/5 space-x-1 cursor-pointer text-center text-white font-medium-10" onClick={() => setSort(header)} key={index}>
					<span>{header}</span>
					<span className={showIndicator}>{uiSortArrows(header)}</span>
				</span>
			);
		});
	};

	const uiMain = () => {
		if (mainData.isLoading) {
			return (
				<div className={blankDataWrapper}>
					<SpinnerBig />
				</div>
			);
		} else if (!apiData.allClients.api.length && apiData.allClients.apiCopy.length) {
			return (
				<div className={blankDataWrapper}>
					<span className="font-regular-12 gray-text">No clients found.</span>
				</div>
			);
		} else if (!apiData.allClients.api.length && !apiData.allClients.apiCopy.length) {
			return (
				<div className={blankDataWrapper}>
					<span className="font-regular-12 gray-text">No clients registered.</span>
				</div>
			);
		} else if (hasMounted.singleClientView) {
			return "";
		} else {
			return uiBody();
		}
	};

	const uiRows = (client) => {
		const style = "flex flex-wrap w-1/5 min-h-9 justify-center items-center text-center";
		const tooltipStyle = `${style} cursor-pointer primary-text`;

		const clientId = MyGlobal.HighlightText(client.id, mainData.searchTerm);
		const clientName = MyGlobal.HighlightText(client.name, mainData.searchTerm);
		const contactNumber = MyGlobal.HighlightText(client.contact_number, mainData.searchTerm);
		const emailAddress = MyGlobal.HighlightText(client.email_address, mainData.searchTerm);

		const joinedOn = dayjs(client.joined_on).format("DD MMM, YYYY");

		return (
			<div className="flex w-full justify-center items-center contrast-background bottom-border font-regular-11 black-text" key={client.id}>
				<span className={style} dangerouslySetInnerHTML={{ __html: clientId }} />

				<Tippy allowHTML content={<Tooltip text={"Open this client's detailed view."} />}>
					<span className={tooltipStyle} dangerouslySetInnerHTML={{ __html: clientName }} onClick={() => toggleSingleClientView(client.id)} />
				</Tippy>

				<Tippy allowHTML content={<Tooltip text={"Open this contact on WhatsApp Web."} />}>
					<span className={tooltipStyle} dangerouslySetInnerHTML={{ __html: contactNumber }} onClick={() => openWhatsApp(client.contact_number)} />
				</Tippy>

				<Tippy allowHTML content={<Tooltip text={client.email_address} />}>
					<span className={tooltipStyle} dangerouslySetInnerHTML={{ __html: emailAddress }} onClick={() => openEmailClient(client.email_address)} />
				</Tippy>

				<span className={style}>{joinedOn}</span>
			</div>
		);
	};

	const uiSearch = () => {
		if (apiData.allClients.apiCopy.length) {
			return (
				<TextInputNative
					id="searchBox"
					icon={faSearch}
					onChange={(event) => setInputs("searchTerm", event.target.value)}
					onClearButtonClick={() => setInputs("searchTerm", "")}
					placeholder=""
					showClearButton={showSearchBoxClearButton}
					tabIndex={1}
					value={mainData.searchTerm}
					width="w-60"
				/>
			);
		}
	};

	const uiSortArrows = (column) => {
		if (mainData.sort.column == column) {
			if (mainData.sort.isAscending) {
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
		if (hasMounted.mainComponent) {
			doFiltering();
		}
	}, [mainData.searchTerm]);

	// Main UI
	if (!hasMounted.mainComponent) {
		return;
	}

	return (
		<div className="flex flex-col w-full h-full justify-start items-center">
			<>
				{!hasMounted.singleClientView && (
					<div className="flex w-full px-5 py-2.5 justify-between items-center">
						<div className="flex w-1/3 space-x-2 justify-start items-center">
							<span className="view-heading">{thisView}</span>
							{apiData.allClients.api.length > 0 && <Badge value={getDataCount()} />}
						</div>
						<div className="flex w-1/3 justify-center items-center">{uiSearch()}</div>
						<div className="flex w-1/3 justify-end items-center">{uiExport()}</div>
					</div>
				)}
				{uiMain()}
			</>
		</div>
	);
}
