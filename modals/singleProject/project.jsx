"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import { ApiEndpoints, BaseModules, Messages, Statuses } from "@/utilities/constants";

import { useEffect, useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Badge, Spinner, SpinnerBig } from "@/components/Elements";
import { ComboBox2, TextArea, TextInput } from "@/components/Inputs";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { faCirclePlus, faIdCardClip, faIndianRupee, faIndianRupeeSign, faLinkSlash, faNoteSticky, faStickyNote, faUserGroup, faXmark } from "@fortawesome/free-solid-svg-icons";
import { MappedAffiliatesHeaders } from "@/utilities/headers";

export function EditStatus({ mount, reloadTasks, selectedTask, unmount }) {
	// Business Logic
	const [state, setState] = useState({ isBoxDragged: false, isLoading: false, reason: "" });

	const isStatusNotCompleted = selectedTask.status != Statuses.Tasks.Completed;

	const reasonBoxStyle = isStatusNotCompleted ? "flex flex-col w-full px-2.5 pt-0 pb-5 justify-center items-center" : "hidden";

	const titleBarCursor = state.isBoxDragged ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header shadow draggable-handle ${titleBarCursor}`;

	let disableEditButton = state.isLoading ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";

	if (isStatusNotCompleted) {
		disableEditButton = state.isLoading || !state.reason ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";
	}

	const disableButtonStyle = `primary-button-condensed ${disableEditButton}`;

	let activityMessage = `Disabled <b>${selectedTask.id}</b>.`;
	let messageBody = "Are you sure you want to disable this task? You are required to write a reason below.";

	if (selectedTask.status == Statuses.Tasks.Enable) {
		activityMessage = `Enabled <b>${selectedTask.id}</b>.`;
		messageBody = "Are you sure you want to enable this task? You are required to write a reason below.";
	}

	// Functions
	const editStatus = async () => {
		setState((old) => ({ ...old, isLoading: true }));

		const body = {
			reason: state.reason,
			status: selectedTask.status,
			taskId: selectedTask.id,
			type: "edit-task-status",
			userId: MyGlobal.GetUserId(),
		};

		try {
			const response = await axios.post(ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reloadTasks();

				const successMessage = selectedTask.status == Statuses.Tasks.Disable ? Messages.TaskDisabled : Messages.TaskEnabled;

				MyGlobal.AddActivity(activityMessage, BaseModules.Tasks);
				MyGlobal.ShowSuccessToast(successMessage);
			} else {
				MyGlobal.ShowErrorToast(Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Edit Project Status");
		} finally {
			setState((old) => ({ ...old, isLoading: false, reason: "" }));
			unmount(false);
		}
	};

	const setBoxDrag = () => {
		setState((old) => ({ ...old, isBoxDragged: !state.isBoxDragged }));
	};

	const setReason = (reason) => {
		setState((old) => ({ ...old, reason }));
	};

	// UI Components
	const uiButton = () => {
		if (state.isLoading) {
			return (
				<span className="px-3.5">
					<Spinner />
				</span>
			);
		} else {
			return "Edit";
		}
	};

	const uiTitleBar = () => {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">Edit Status</span>
				<FontAwesomeIcon className="cursor-pointer" icon={faXmark} onClick={() => unmount(false)} />
			</DialogTitle>
		);
	};

	// Main UI
	return (
		<Dialog as="div" className="relative z-50" open={mount} onClose={() => unmount(false)}>
			<div className="fixed inset-0 bg-black/50" />
			<div className="flex w-full justify-center items-center fixed inset-0 overflow-y-auto">
				<DialogPanel className="w-100 transform overflow-hidden rounded contrast-background shadow">
					{uiTitleBar()}
					<span className="block w-full p-5 whitespace-pre-line font-regular-11 black-text" dangerouslySetInnerHTML={{ __html: messageBody }} />
					<div className={reasonBoxStyle}>
						<TextArea icon={faNoteSticky} key={1} label="Reason" onChange={(e) => setReason(e.target.value)} onKeyDown={() => {}} rows={3} tabIndex={1} value={state.reason} width="w-full" />
					</div>
					<footer className="dialog-footer">
						<button className={disableButtonStyle} onClick={() => editStatus()}>
							{uiButton()}
						</button>
					</footer>
				</DialogPanel>
			</div>
		</Dialog>
	);
}

export function EditQuote({ mount, project, reload, unmount }) {
	// Business Logic
	const [main, setMain] = useState({
		isBoxMoved: false,
		isLoading: false,
		quote: "",
	});

	const titleBarCursor = main.isBoxMoved ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header shadow draggable-handle ${titleBarCursor}`;

	const disableEditButton = main.isLoading || !main.quote ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";

	const editButtonStyle = `primary-button-condensed ${disableEditButton}`;

	// Functions
	async function doQuoteEditing() {
		setMain((s) => ({ ...s, isLoading: true }));

		const body = {
			projectId: project.id,
			quote: main.quote,
			type: "edit-quote",
			userId: MyGlobal.GetUserId(),
		};

		try {
			const response = await axios.post(ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reload(project.id);

				MyGlobal.AddActivity(`Edited quote of <b>${project.id}</b> from <b>${project.quote}</b> to <b>${main.quote}</b>.`, BaseModules.Projects);

				MyGlobal.ShowSuccessToast(Messages.QuoteEdited);
			} else {
				MyGlobal.ShowErrorToast(Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Edit Project Quote");
		} finally {
			setMain((s) => ({ ...s, isLoading: false, quote: "" }));
			unmount(false);
		}
	}

	function setBoxDrag() {
		setMain((s) => ({ ...s, isBoxMoved: !s.isBoxMoved }));
	}

	function setQuote(quote) {
		setMain((s) => ({ ...s, quote }));
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
				<span className="flex w-full justify-start items-center">Edit Quote</span>
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
						<TextInput icon={faIndianRupeeSign} isReadOnly key={1} label="Current Quote" onChange={() => {}} onKeyPress={() => {}} tabIndex={1} value={project.quote} width="w-full" />
						<TextInput icon={faIndianRupeeSign} key={2} label="New Quote" onChange={(e) => setQuote(e.target.value)} onKeyPress={(e) => !MyGlobal.HasNumbers(e.key) && e.preventDefault()} tabIndex={2} value={main.quote} width="w-full" />
					</div>
					<footer className="dialog-footer">
						<button className={editButtonStyle} onClick={() => doQuoteEditing()}>
							{uiButton()}
						</button>
					</footer>
				</DialogPanel>
			</div>
		</Dialog>
	);
}

export function ManageGovernmentId({ mount, project, reload, unmount }) {
	// Business Logic
	const isTypeAdd = !project.government_id ? true : false;

	const [main, setMain] = useState({
		id: "",
		isBoxMoved: false,
		isLoading: false,
	});

	const activityMessage = isTypeAdd ? `Added government id <b>${main.id}</b> in <b>${project.id}</b>.` : `Edited government id of <b>${project.id}</b> to <b>${main.id}</b> from <b>${project.government_id}</b>.`;

	const successMessage = isTypeAdd ? Messages.GovernmentIdAdded : Messages.GovernmentIdEdited;

	const titleBarText = isTypeAdd ? "Add Government ID" : "Edit Government ID";

	const titleBarCursor = main.isBoxMoved ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header shadow draggable-handle ${titleBarCursor}`;

	const buttonClickEvent = main.isLoading || !main.id ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";
	const buttonStyle = `primary-button-condensed ${buttonClickEvent}`;

	// Functions
	async function doIdManagement() {
		setMain((s) => ({ ...s, isLoading: true }));

		const body = {
			governmentId: main.id,
			projectId: project.id,
			type: "manage-government-id",
		};

		try {
			const response = await axios.post(ApiEndpoints.Setter, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reload(project.id);

				MyGlobal.AddActivity(activityMessage, BaseModules.Projects);
				MyGlobal.ShowSuccessToast(successMessage);

				unmount();
			} else {
				MyGlobal.ShowErrorToast(Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, titleBarText);
		} finally {
			setMain((s) => ({ ...s, isLoading: false, id: "" }));
		}
	}

	function setBoxDrag() {
		setMain((s) => ({ ...s, isBoxMoved: !s.isBoxMoved }));
	}

	function setInput(id) {
		setMain((s) => ({ ...s, id: String(id).toUpperCase() }));
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
			return isTypeAdd ? "Add" : "Edit";
		}
	}

	function uiTitleBar() {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">{titleBarText}</span>
				<FontAwesomeIcon className="cursor-pointer" icon={faXmark} onClick={() => unmount(false)} />
			</DialogTitle>
		);
	}

	// Main UI
	return (
		<Dialog as="div" className="relative z-50" open={mount} onClose={() => unmount()}>
			<div className="fixed inset-0 bg-black/50" />
			<div className="flex w-full justify-center items-center fixed inset-0 overflow-y-auto">
				<DialogPanel className="w-100 transform overflow-hidden rounded contrast-background shadow">
					{uiTitleBar()}
					<div className="flex flex-col w-full p-5 space-y-2.5 justify-center items-center">
						{!isTypeAdd && <TextInput icon={faIdCardClip} isReadOnly label="Current Government ID" onChange={() => {}} onKeyPress={() => {}} tabIndex={1} value={project.government_id} width="w-full" />}
						<TextInput icon={faIdCardClip} label="New Government ID" onChange={(e) => setInput(e.target.value)} onKeyPress={() => {}} tabIndex={2} value={main.id} width="w-full" />
					</div>
					<footer className="dialog-footer">
						<button className={buttonStyle} onClick={() => doIdManagement()}>
							{uiButton()}
						</button>
					</footer>
				</DialogPanel>
			</div>
		</Dialog>
	);
}

export function ManageAffiliates({ mount, project, reload, unmount }) {
	// Business Logic
	const [api, setApi] = useState({
		affiliates: { copy: [], data: [] },
		mapped: [],
	});

	const [main, setMain] = useState({
		affiliate: { fees: "", id: "", name: "" },
		isBoxMoved: false,
		isLoading: false,
		isMapping: false,
		selected: [{ fees: "", id: 0, name: "" }],
		selectedAffiliate: {},
	});

	const [mounted, setMounted] = useState({
		unmapAffiliate: false,
	});

	const disableManageButton = main.selected.length > 1 ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-50";

	const width = !project.affiliate_ids ? "w-1/2" : "w-4/5";
	const mainWrapper = `${width} h-[90%] transform overflow-hidden rounded contrast-background shadow`;

	const manageButtonStyle = `primary-button-condensed ${disableManageButton}`;

	const titleBarCursor = main.isBoxMoved ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header shadow draggable-handle ${titleBarCursor}`;

	// Functions
	function addAffiliate() {
		const copy = [...main.selected];
		copy.push(main.affiliate);

		if (main.affiliate.fees && main.affiliate.name) {
			setMain((s) => ({
				...s,
				affiliate: { fees: "", id: "", name: "" },
				selected: copy,
			}));
		}
	}

	function deleteAffiliate(object) {
		const copy = [...main.selected];
		const revised = copy.filter((f) => f.id != object.id);

		setMain((s) => ({ ...s, selected: revised }));
	}

	async function getAffiliates() {
		setMain((s) => ({ ...s, isLoading: true }));

		try {
			const response = await axios.get(ApiEndpoints.Affiliates.GetMappedAffiliates, MyGlobal.GetHeaders());

			if (response.status === 200) {
				const mapped = [];
				const _affiliates = [];

				const affiliateIds = String(project.affiliate_ids);
				let _affiliateIds = [project.affiliate_ids];

				if (affiliateIds.includes(",")) {
					_affiliateIds = affiliateIds.split(",");
				}

				_affiliateIds.forEach((fe) => {
					const object = response.data.affiliates.find((f) => f.id === fe);

					let totalFees = 0;
					let totalPaid = 0;

					response.data.projects.filter((f) => f.affiliate_id === fe && f.client_id === project.client_id && f.project_id === project.id).forEach((_fe) => (totalFees += Number(_fe.total_fees)));

					response.data.transactions.filter((f) => f.affiliate_id === fe && f.project_id === project.id).forEach((_fe) => (totalPaid += Number(_fe.amount)));

					mapped.push({
						...object,
						fees: MyGlobal.ThousandSeparator(totalFees),
						paid: MyGlobal.ThousandSeparator(totalPaid),
					});
				});

				response.data.affiliates.forEach((fe) => {
					if (!_affiliateIds.includes(fe.id)) {
						_affiliates.push(fe);
					}
				});

				setApi((s) => ({
					...s,
					affiliates: {
						copy: _affiliates,
						data: _affiliates,
					},
					mapped,
				}));
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Single Project => Map Affiliates => Get Affiliates");
		} finally {
			setMain((s) => ({ ...s, isLoading: false }));
		}
	}

	function getFilteredList() {
		return !api.affiliates.copy.length
			? []
			: api.affiliates.copy.filter((f) => {
					const isSelected = main.selected.some((_f) => _f.id === f.id);
					return !isSelected;
				});
	}

	async function doMapping() {
		setMain((s) => ({ ...s, isMapping: true }));

		const affiliates = main.selected.filter((f) => f.id);
		let ids = affiliates.map((m) => m.id).join(",");

		if (project.affiliate_ids) {
			ids = `${project.affiliate_ids},${ids}`;
		}

		const body = {
			affiliates,
			clientId: project.client_id,
			companyId: project.company_id,
			ids,
			projectId: project.id,
		};

		try {
			const response = await axios.post(ApiEndpoints.SingleProject.MapAffiliate, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reload(project.id);

				MyGlobal.AddActivity(`Mapped <b>(${ids})</b> to <b>${project.id}</b>.`, BaseModules.Projects);

				MyGlobal.ShowSuccessToast(Messages.AffiliateAdded);
			} else {
				MyGlobal.ShowErrorToast(Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Single Project => Map Affiliates");
		} finally {
			setMain((s) => ({ ...s, isMapping: false }));
			unmount();
		}
	}

	function setAffiliate(object) {
		if (object && typeof object === "object") {
			if ("id" in object && "name" in object) {
				setMain((s) => ({ ...s, affiliate: { ...s.affiliate, id: object.id, name: object.name } }));
			}
		} else {
			setMain((s) => ({ ...s, affiliate: { ...s.affiliate, id: "", name: "" } }));
		}
	}

	function setBoxDrag() {
		setMain((s) => ({ ...s, isBoxMoved: !s.isBoxMoved }));
	}

	function setFees(value) {
		setMain((s) => ({ ...s, affiliate: { ...s.affiliate, fees: value } }));
	}

	function setInputs(key, value) {
		if (value) {
			setMain((s) => ({ ...s, [key]: value }));
		}
	}

	function toggleUnmapAffiliate(object) {
		setMain((s) => ({ ...s, selectedAffiliate: object ?? {} }));
		setMounted((s) => ({ ...s, unmapAffiliate: object ? true : false }));
	}

	// UI Components
	function uiAffiliates() {
		return <ComboBox2 allowCreatingNewItem={false} comparingValue1="name" comparingValue2={main.affiliate.name} displayValue="name" filteredData={getFilteredList} hasDataObject icon={faUserGroup} isReadOnly={false} label="Affiliates" onChange={(e) => setAffiliate(e)} onClick={() => {}} onInputChange={(e) => setInputs("find", e.target.value)} onKeyPress={() => {}} searchedItem={main.affiliate.name} tabIndex={1} value={main.affiliate.name} width="w-full" />;
	}

	function uiFees() {
		return <TextInput icon={faIndianRupee} label="Fees" onChange={(e) => setFees(e.target.value)} onKeyPress={(e) => !MyGlobal.HasNumbers(e.key) && e.preventDefault()} tabIndex={2} value={main.affiliate.fees} width="w-full" />;
	}

	function uiHeaders() {
		return Object.values(MappedAffiliatesHeaders).map((m, i) => {
			const wrapper = `flex w-1/3 h-9 space-x-1.5 justify-center items-center text-center text-white font-medium-11`;

			return (
				<span className={wrapper} key={i}>
					<span>{m}</span>
				</span>
			);
		});
	}

	function uiRows(row, i) {
		const style = `flex flex-wrap w-1/3 justify-center items-center whitespace-pre-wrap`;

		return (
			<div className="flex w-full px-4 py-2 justify-center items-center rounded bottom-shadow contrast-background bottom-border font-regular-11" key={i}>
				<span className={style}>{row.name}</span>
				<span className={style}>{row.paid}</span>
				<span className={style}>{row.fees}</span>
				<div className={`${style} cursor-pointer red-text space-x-2.5 hover:underline hover:underline-offset-8 hover:decoration-[--red]`} onClick={() => toggleUnmapAffiliate(row)}>
					<FontAwesomeIcon icon={faLinkSlash} />
					<span>Unmap</span>
				</div>
			</div>
		);
	}

	function uiMain() {
		if (main.isLoading) {
			return (
				<div className="flex w-full h-[calc(100%-95px)] justify-center items-center">
					<SpinnerBig />
				</div>
			);
		} else {
			return (
				<div className="flex w-full h-full p-5 space-x-10 justify-between items-center">
					{project.affiliate_ids && (
						<div className="flex flex-col w-full h-full justify-between items-center">
							<div className="flex w-full space-x-2.5 pb-8 justify-start items-center">
								<span className="view-heading">Mapped</span>
								<Badge value={api.mapped.length} />
							</div>
							<span className="flex w-full px-4 justify-center items-center rounded-tl rounded-tr primary-background">{uiHeaders()}</span>
							<div className="flex flex-col w-full h-[calc(100%-100px)] p-2 space-y-2 rounded-bl rounded-br overflow-y-auto bottom-shadow full-border primary-background-transparent-01 scrollbar-gutter">{api.mapped.map((m, i) => uiRows(m, i))}</div>
						</div>
					)}
					<div className="flex flex-col w-full h-full justify-start items-center">
						{project.affiliate_ids && <span className="flex w-full justify-start items-center view-heading">New Mapping</span>}
						<div className="flex flex-col w-full h-full justify-between items-center">
							<div className="flex w-full space-x-5 justify-center items-center">
								{uiAffiliates()}
								{uiFees()}
								<FontAwesomeIcon className="cursor-pointer relative top-2.5 primary-text" icon={faCirclePlus} onClick={() => addAffiliate()} size="2xl" />
							</div>
							<div className="flex w-full px-2.5 py-5 space-x-5 justify-start items-center rounded bottom-shadow full-border primary-background-transparent-01">{uiSelected()}</div>
						</div>
					</div>
				</div>
			);
		}
	}

	function uiManage() {
		if (main.isMapping) {
			return (
				<span className="px-3.5">
					<Spinner />
				</span>
			);
		} else {
			return "Manage";
		}
	}

	function uiSelected() {
		return main.selected.map((m, i) => {
			if (m.id != 0) {
				return (
					<div className="flex w-fit px-2 py-1 space-x-5 justify-between items-center rounded shadow contrast-background font-medium-12 primary-border primary-text" key={i}>
						<div className="flex w-full p-2.5 space-x-2.5 justify-between items-center">
							<span>{m.name}</span>
							<Badge value={MyGlobal.ThousandSeparator(m.fees)} />
						</div>
						<FontAwesomeIcon className="cursor-pointer gray-text" icon={faXmark} onClick={() => deleteAffiliate(m)} />
					</div>
				);
			}
		});
	}

	function uiTitleBar() {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">Manage Affiliates</span>
				<FontAwesomeIcon className="cursor-pointer" icon={faXmark} onClick={() => unmount(false)} />
			</DialogTitle>
		);
	}

	// Hooks
	useEffect(() => {
		getAffiliates();
	}, []);

	// Main UI
	return (
		<Dialog as="div" className="relative z-50" open={mount} onClose={() => unmount()}>
			<div className="fixed inset-0 bg-black/50" />
			<div className="flex w-full justify-center items-center fixed inset-0 overflow-y-auto">
				<DialogPanel className={mainWrapper}>
					{uiTitleBar()}
					<div className="flex flex-col w-full h-[calc(100%-95px)] justify-between items-center">{uiMain()}</div>
					<footer className="dialog-footer w-full">
						<button className={manageButtonStyle} onClick={() => doMapping()}>
							{uiManage()}
						</button>
					</footer>
					{mounted.unmapAffiliate && <UnmapAffiliate mount={mounted.unmapAffiliate} affiliate={main.selectedAffiliate} project={project} reload={reload} unmount={toggleUnmapAffiliate} />}
				</DialogPanel>
			</div>
		</Dialog>
	);
}

export function UnmapAffiliate({ mount, affiliate, project, reload, unmount }) {
	// Business Logic
	const [main, setMain] = useState({
		isBoxMoved: false,
		isLoading: false,
		reason: "",
	});

	const titleBarCursor = main.isBoxMoved ? "cursor-grabbing" : "cursor-grab";
	const titleBarStyle = `dialog-header shadow draggable-handle ${titleBarCursor}`;

	const disableUnmapButton = main.isLoading || !main.reason ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";

	const unmapButtonStyle = `primary-button-condensed ${disableUnmapButton}`;

	// Functions
	async function doUnmapping() {
		try {
			setMain((s) => ({ ...s, isLoading: true }));

			const affiliateIds = String(project.affiliate_ids);
			let _affiliateIds = project.affiliate_ids;

			if (affiliateIds.includes(",")) {
				_affiliateIds = affiliateIds
					.split(",")
					.filter((f) => f !== affiliate.id)
					.join(", ")
					.trim();
			} else {
				_affiliateIds = "";
			}

			const body = {
				clientId: project.client_id,
				affiliateId: affiliate.id,
				affiliateIds: _affiliateIds,
				projectId: project.id,
			};

			const response = await axios.post(ApiEndpoints.Affiliates.UnmapAffiliate, body, MyGlobal.GetHeaders());

			if (response.status === 200) {
				reload(project.id);

				MyGlobal.AddActivity(`Unmapped affiliate <b>${affiliate.id}</b> from <b>${project.id}</b> due to <b>${main.reason}</b>.`, BaseModules.Affiliates);

				MyGlobal.ShowSuccessToast(Messages.AffiliateUnmapped);
			} else {
				MyGlobal.ShowErrorToast(Messages.SomeErrorOccurred);
			}
		} catch (error) {
			MyGlobal.HandleErrors(error, "Unmap Affiliate");
		} finally {
			setMain((s) => ({ ...s, isLoading: false, reason: "" }));
			unmount();
		}
	}

	function setBoxDrag() {
		setMain((s) => ({ ...s, isBoxMoved: !s.isBoxMoved }));
	}

	function setReason(reason) {
		setMain((s) => ({ ...s, reason }));
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
			return "Unmap";
		}
	}

	function uiTitleBar() {
		return (
			<DialogTitle as="h2" className={titleBarStyle}>
				<span className="flex w-full justify-start items-center">Unmap {affiliate.name}</span>
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
					<div className="flex flex-col w-full p-5 space-y-2 justify-center items-center">
						<span className="block w-full pl-2.5 font-regular-11 black-text">Are you sure you want to unmap this affiliate? You are required to write a reason below.</span>
						<TextArea icon={faStickyNote} label="Reason" onChange={(e) => setReason(e.target.value)} onKeyDown={() => {}} rows="3" tabIndex="1" value={main.reason} width="w-full" />
					</div>
					<footer className="dialog-footer">
						<button className={unmapButtonStyle} onClick={() => doUnmapping()}>
							{uiButton()}
						</button>
					</footer>
				</DialogPanel>
			</div>
		</Dialog>
	);
}
