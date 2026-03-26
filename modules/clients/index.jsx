"use client";

import axios from "axios";
import dayjs from "dayjs";
import Tippy from "@tippyjs/react";
import dynamic from "next/dynamic";
import { ApiEndpoints, BaseModules } from "@/utilities/constants";
import writeXlsxFile from "write-excel-file/browser";

import { Virtuoso } from "react-virtuoso";
import { MyGlobal } from "@/utilities/global";
import { TextInputNative } from "@/components/Inputs";
import { ClientsSkeleton } from "@/components/Skeleton";
import { useEffect, useState, useMemo, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Badge, Spinner, Tooltip } from "@/components/Elements";
import { faArrowUpFromBracket, faDownload, faSearch, faSortAmountAsc, faSortAmountDesc } from "@fortawesome/free-solid-svg-icons";
import { ClientsHeaders } from "@/utilities/headers";

const thisView = BaseModules.Clients;
const arrHeaders = Object.values(ClientsHeaders);

const DynSingleClient = dynamic(() => import("../singleClient"), { ssr: false });
const DynEditClient = dynamic(() => import("@/modals/singleClient").then((t) => ({ default: t.EditClient })), {
	ssr: false,
});

export default function Clients() {
	// Business Logic
	const currentScrollPositionReference = useRef(null);
	const goToTopAnimationFrameReference = useRef(null);
	const rangeChangeTimeoutReference = useRef(null);
	const currentTopIndexReference = useRef(0);
	const showGoToTopReference = useRef(false);

	const [api, setApi] = useState({ copy: [], data: [] });
	const [selectedClient, setSelectedClient] = useState({});

	const [initialTopMostItemIndex, setInitialTopMostItemIndex] = useState(0);
	const [showGoToTopOrb, setShowGoToTopOrb] = useState(false);
	const [main, setMain] = useState({ find: "", isLoading: true });
	const [sort, setSort] = useState({ column: ClientsHeaders.Id, isAscending: false });
	const [isOpen, setIsOpen] = useState({ editClient: false, singleClient: false });

	const showFindBoxClearButton = main.find ? "cursor-pointer text-gray-300" : "hidden!";
	const blankDataWrapper = "flex w-full h-full justify-center-safe items-center-safe contrast-background";

	// Functions
	function detectKeystrokes(e) {
		if (e.ctrlKey && e.key === "f") {
			e.preventDefault();
			document.getElementById("findBox").focus();
		}
	}

	function doExcelExport() {
		const records = [];
		const _records = [];

		const columnsWidth = [];
		const dataHeaders = [];

		const rowHeight = 34;
		const headerHeight = 44;
		const maximumColumnWidth = 20;

		const _headers = Object.values(ClientsHeaders);
		const blankRows = [{ span: _headers.length, height: rowHeight, colSpan: 2 }];

		doSorting().forEach((fe) => records.push(fe.id, fe.name, fe.phoneNumber, fe.emailAddress, fe.joinedOnDate + "\n" + fe.joinedOnTime));

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
		const headerText = `${thisView} (${api.data.length})`;

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

	function doFiltering() {
		const filtered = api.copy.filter((f) => {
			const findText = main.find.toLowerCase();

			const id = String(f.id).toLowerCase();
			const name = String(f.name).toLowerCase();
			const phoneNumber = String(f.phoneNumber);
			const emailAddress = String(f.emailAddress).toLowerCase();

			return id.includes(findText) || name.includes(findText) || phoneNumber.includes(findText) || emailAddress.includes(findText);
		});

		setApi((s) => ({ ...s, data: filtered }));
	}

	function doSorting() {
		const { column, isAscending } = sort;

		return [...api.data].sort((a, b) => {
			const aJoinedOn = new Date(a.joined_on);
			const bJoinedOn = new Date(b.joined_on);

			switch (true) {
				case column === ClientsHeaders.JoinedOn && isAscending:
					return aJoinedOn - bJoinedOn;
				case column === ClientsHeaders.JoinedOn && !isAscending:
					return bJoinedOn - aJoinedOn;
				case column === ClientsHeaders.Name && isAscending:
					return a.name.localeCompare(b.name);
				case column === ClientsHeaders.Name && !isAscending:
					return b.name.localeCompare(a.name);
				default:
					return 0;
			}
		});
	}

	async function getData() {
		try {
			const response = await axios.get(ApiEndpoints.Clients.GetClients, MyGlobal.GetHeaders());

			if (response.status !== 200) return [];
			if (!Array.isArray(response.data)) return [];
			if (!response.data.length) return [];

			const confirmedClients = response.data
				.filter((f) => f.is_confirmed === 1)
				.map((m) => ({
					emailAddress: m.email_address,
					id: m.id,
					joinedOnDate: dayjs(m.joined_on).format("DD MMM, YYYY"),
					joinedOnTime: dayjs(m.joined_on).format("hh:mm:ss A"),
					name: m.name,
					phoneNumber: m.phone_number,
				}));

			setApi({ copy: confirmedClients, data: confirmedClients });
		} catch (error) {
			MyGlobal.HandleErrors(error, thisView + " > Get Data");
		} finally {
			setMain((s) => ({ ...s, isLoading: false }));
		}
	}

	function getIconOrBadge() {
		if (main.isLoading) {
			return (
				<span className="pl-5 relative">
					<Spinner />
				</span>
			);
		}

		return api.data.length > 0 && <Badge value={getRowsCount()} />;
	}

	function getRowsCount() {
		const apiCount = api.data.length;
		const apiCopyCount = api.copy.length;

		return apiCount !== apiCopyCount ? `${apiCount} / ${apiCopyCount}` : apiCount;
	}

	function handleGoToTopClick() {
		const previousTopIndex = currentTopIndexReference.current;

		window.localStorage.setItem("clientsScrollPosition", String(0));
		showGoToTopReference.current = false;
		setShowGoToTopOrb(false);

		if (rangeChangeTimeoutReference.current) {
			clearTimeout(rangeChangeTimeoutReference.current);
			rangeChangeTimeoutReference.current = null;
		}

		if (goToTopAnimationFrameReference.current) {
			cancelAnimationFrame(goToTopAnimationFrameReference.current);
			goToTopAnimationFrameReference.current = null;
		}

		if (currentScrollPositionReference.current) {
			if (previousTopIndex > 120) {
				currentScrollPositionReference.current.scrollToIndex({
					index: 18,
					align: "start",
					behavior: "auto",
				});

				goToTopAnimationFrameReference.current = globalThis.requestAnimationFrame(() => {
					currentScrollPositionReference.current?.scrollToIndex({
						index: 0,
						align: "start",
						behavior: "smooth",
					});
					goToTopAnimationFrameReference.current = null;
				});
			} else {
				currentScrollPositionReference.current.scrollToIndex({
					index: 0,
					align: "start",
					behavior: "smooth",
				});
			}
		}

		currentTopIndexReference.current = 0;
	}

	function handleRangeChange(range) {
		currentTopIndexReference.current = range.startIndex;
		const shouldShowGoToTop = range.startIndex > 8;

		if (showGoToTopReference.current !== shouldShowGoToTop) {
			showGoToTopReference.current = shouldShowGoToTop;
			setShowGoToTopOrb(shouldShowGoToTop);
		}

		if (rangeChangeTimeoutReference.current) clearTimeout(rangeChangeTimeoutReference.current);

		rangeChangeTimeoutReference.current = setTimeout(() => {
			localStorage.setItem("clientsScrollPosition", String(range.startIndex));
		}, 500);
	}

	function getSavedClientsScrollPosition() {
		const savedIndex = Number(localStorage.getItem("clientsScrollPosition"));
		if (!Number.isFinite(savedIndex) || savedIndex < 0) return 0;
		return savedIndex;
	}

	function restoreClientsScrollPosition() {
		if (!currentScrollPositionReference.current) return;

		const savedIndex = getSavedClientsScrollPosition();

		currentTopIndexReference.current = savedIndex;
		showGoToTopReference.current = savedIndex > 8;
		setShowGoToTopOrb(savedIndex > 8);

		currentScrollPositionReference.current.scrollToIndex({
			index: Math.min(savedIndex, Math.max(sortedData.length - 1, 0)),
			align: "start",
			behavior: "auto",
		});
	}

	function openEmailClient(emailAddress) {
		window.open(`mailto:${emailAddress}`, "_blank");
	}

	function openWhatsApp(phoneNumber) {
		window.open(`https://wa.me/1${phoneNumber}`, "_blank");
	}

	function toggleEditClient(clientId) {
		setSelectedClient(clientId ?? {});
		setIsOpen((s) => ({ ...s, editClient: clientId ? true : false }));
	}

	function toggleSingleClient(clientId) {
		if (clientId) {
			if (rangeChangeTimeoutReference.current) {
				clearTimeout(rangeChangeTimeoutReference.current);
				rangeChangeTimeoutReference.current = null;
			}

			localStorage.setItem("clientsScrollPosition", String(currentTopIndexReference.current));
		}

		setInitialTopMostItemIndex(getSavedClientsScrollPosition());
		setSelectedClient(clientId ?? {});
		setIsOpen((s) => ({ ...s, singleClient: clientId ? true : false }));
	}

	const sortedData = useMemo(() => doSorting(), [doSorting]);

	// UI Components
	function uiFind() {
		if (!api.copy.length) return;

		return (
			<div className="flex items-center-safe justify-center-safe space-x-5">
				<TextInputNative id="findBox" icon={faSearch} onChange={(e) => setMain((s) => ({ ...s, find: e.target.value }))} onClearButtonClick={() => setMain((s) => ({ ...s, find: "" }))} placeholder="" showClearButton={showFindBoxClearButton} tabIndex={1} value={main.find} width="w-60" />
				<Tippy content={<Tooltip text="Download all clients data in Excel file." />} placement="bottom">
					<FontAwesomeIcon className="bg-transparent cursor-pointer text-emerald-600 transition-all duration-200 hover:scale-125 focus:outline-none" icon={faDownload} onClick={() => doExcelExport()} size="lg" />
				</Tippy>
			</div>
		);
	}

	function uiGoToTopOrb() {
		const wrapperStyle = showGoToTopOrb ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-90 translate-y-2 pointer-events-none";

		return (
			<div className={`transform-gpu transition-all duration-300 ease-out will-change-transform ${wrapperStyle}`} aria-hidden={!showGoToTopOrb}>
				<Tippy content={<Tooltip text="Go to top" />} disabled={!showGoToTopOrb} interactive placement="top" theme="dark" trigger="mouseenter" animation="shift-toward" appendTo={() => document.body}>
					<button type="button" aria-label="Go to top" className="w-10 h-10 flex items-center justify-center rounded-full bg-linear-to-br from-blue-400 via-indigo-500 to-blue-600 text-white border border-blue-300 shadow transition-all duration-300 ease-out hover:scale-110 hover:shadow-lg cursor-pointer" onClick={() => handleGoToTopClick()} tabIndex={showGoToTopOrb ? 0 : -1}>
						<FontAwesomeIcon icon={faArrowUpFromBracket} size="1x" />
					</button>
				</Tippy>
			</div>
		);
	}

	function uiHeaders() {
		return arrHeaders.map((m, i) => {
			const showArrow = m === sort.column ? "visible" : "invisible";

			return (
				<button
					className="w-1/3 space-x-1 cursor-pointer text-center text-white font-medium-10"
					onClick={() => {
						if (m !== ClientsHeaders.PhoneNumber && m !== ClientsHeaders.EmailAddress) setSort((s) => ({ ...s, column: m, isAscending: !s.isAscending }));
					}}
					key={i}>
					<span>{m}</span>
					<span className={showArrow}>{uiSortArrows(m)}</span>
				</button>
			);
		});
	}

	function uiMain() {
		if (main.isLoading) return <ClientsSkeleton />;

		if (!api.data.length && api.copy.length) {
			return (
				<div className={blankDataWrapper}>
					<span className="font-regular-12 gray-text">No clients found.</span>
				</div>
			);
		}

		if (!api.data.length && !api.copy.length) {
			return (
				<div className={blankDataWrapper}>
					<span className="font-regular-12 gray-text">No clients registered.</span>
				</div>
			);
		}

		if (isOpen.singleClient) return <DynSingleClient client={selectedClient} unmount={toggleSingleClient} />;

		return (
			<div className="flex flex-col w-full h-full justify-center-safe items-start">
				<div className="flex w-full h-9 justify-center-safe items-center-safe primary-background">{uiHeaders()}</div>
				<Virtuoso
					ref={currentScrollPositionReference}
					className="w-full h-full contrast-background"
					data={sortedData}
					initialTopMostItemIndex={Math.min(initialTopMostItemIndex, Math.max(sortedData.length - 1, 0))}
					itemContent={(_, row) => {
						const fancyRightBorderStyle = "absolute w-2.5 h-[50px] rounded-tr-full rounded-br-full blue-background left-2";
						const style = `flex flex-col w-1/3 justify-center-safe items-center-safe text-center`;
						const childStyle = "flex w-full justify-center-safe items-center-safe";

						const parentLabelStyle = childStyle + " font-semibold text-base";
						const childLabelStyle = childStyle + " gray-text";

						const clientId = MyGlobal.HighlightText(row.id, main.find);
						const clientName = MyGlobal.HighlightText(row.name, main.find);
						const phoneNumber = MyGlobal.HighlightText(row.phoneNumber, main.find);
						const emailAddress = MyGlobal.HighlightText(row.emailAddress, main.find);

						return (
							<div className="flex p-2 m-2 justify-center-safe items-center-safe blue-background-transparent-01 shadow rounded" key={row.id}>
								<span className={fancyRightBorderStyle} />
								<div className={style}>
									<span className={parentLabelStyle}>{row.joinedOnDate}</span>
									<span className={`${childLabelStyle} font-normal text-xs`}>{row.joinedOnTime}</span>
								</div>
								<div className={style}>
									<div className={`${parentLabelStyle} cursor-pointer hover:underline hover:underline-offset-4`}>
										<Tippy content={<Tooltip text="Open this client's detailed view." />} placement="bottom">
											<button className="cursor-pointer primary-text" dangerouslySetInnerHTML={{ __html: clientName }} onClick={() => toggleSingleClient(row)} />
										</Tippy>
									</div>
									<button className={`${childLabelStyle} font-normal text-xs`} dangerouslySetInnerHTML={{ __html: clientId }} onClick={() => toggleEditClient(row)} />
								</div>
								<div className={style}>
									<div className={`${parentLabelStyle} cursor-pointer hover:underline hover:underline-offset-4`}>
										<Tippy content={<Tooltip text="Open this contact on WhatsApp Web." />} placement="bottom">
											<button className="cursor-pointer primary-text" dangerouslySetInnerHTML={{ __html: phoneNumber }} onClick={() => openWhatsApp(row.phone_number)} />
										</Tippy>
									</div>
									<Tippy content={<Tooltip text="Send an email to this client." />} placement="bottom">
										<button className={`${childLabelStyle} cursor-pointer font-normal text-xs hover:underline hover:underline-offset-4`} dangerouslySetInnerHTML={{ __html: emailAddress }} onClick={() => openEmailClient(row.email_address)} />
									</Tippy>
								</div>
							</div>
						);
					}}
					totalCount={api.data.length}
					rangeChanged={handleRangeChange}
				/>
				<div className="fixed bottom-3 right-3 z-50 flex items-center space-x-3">{uiGoToTopOrb()}</div>

				{isOpen.editClient && <DynEditClient client={selectedClient} mount={isOpen.editClient} reload={getData} unmount={toggleEditClient} />}
			</div>
		);
	}

	function uiSortArrows(column) {
		if (sort.column !== column) return;
		if (sort.isAscending) return <FontAwesomeIcon className="text-white" icon={faSortAmountDesc} />;

		return <FontAwesomeIcon className="text-white" icon={faSortAmountAsc} />;
	}

	// Hooks
	useEffect(() => {
		getData();
		setInitialTopMostItemIndex(getSavedClientsScrollPosition());
	}, []);

	useEffect(() => {
		window.addEventListener("keydown", detectKeystrokes);

		return () => {
			if (rangeChangeTimeoutReference.current) clearTimeout(rangeChangeTimeoutReference.current);
			if (goToTopAnimationFrameReference.current) cancelAnimationFrame(goToTopAnimationFrameReference.current);

			window.removeEventListener("keydown", detectKeystrokes);
		};
	}, [detectKeystrokes]);

	useEffect(() => {
		doFiltering();
	}, [main.find]);

	useEffect(() => {
		restoreClientsScrollPosition();
	}, [sortedData.length]);

	useEffect(() => {
		if (isOpen.singleClient || main.isLoading || !sortedData.length) return;
		const animationFrame = globalThis.requestAnimationFrame(() => restoreClientsScrollPosition());

		return () => globalThis.cancelAnimationFrame(animationFrame);
	}, [isOpen.singleClient, main.isLoading, sortedData.length]);

	// Main UI
	return (
		<div className="flex flex-col w-full h-full items-center-safe blue-background-transparent-01">
			{!isOpen.singleClient && (
				<div className="flex w-full px-5 py-2.5 justify-between items-center-safe">
					<div className="flex w-2/5 space-x-2 items-center-safe">
						<span className="font-bold text-2xl blue-text">{thisView}</span>
						{getIconOrBadge()}
					</div>
					<div className="flex w-3/5 items-center-safe">{uiFind()}</div>
				</div>
			)}
			{isOpen.singleClient ? <DynSingleClient client={selectedClient} unmount={toggleSingleClient} /> : uiMain()}
		</div>
	);
}
