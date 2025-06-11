"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import "tippy.js/animations/shift-away.css";

import Tippy from "@tippyjs/react";
import ReactDatePicker from "react-datepicker";

import { useRef } from "react";
import { applicationName, MyGlobal } from "@/utilities/global";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faCheck, faEnvelope, faLock, faMultiply, faUser } from "@fortawesome/free-solid-svg-icons";
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";

export const ComboBox = ({ allowCreatingNewItem, comparisonValue, filteredData, icon, isReadOnly = false, label, onChange, onClick, onKeyPress, searchedItem, tabIndex, value, width }) => {
	const aesthetics = isReadOnly ? "opacity-50" : " opacity-100";
	const clickEvent = isReadOnly ? `pointer-events-none ${aesthetics}` : "pointer-events-auto";
	const cursor = isReadOnly ? "cursor-not-allowed" : "cursor-default";

	const mainWrapper = `flex flex-col ${width} p-2 space-y-1 ${aesthetics} ${cursor}`;
	const childWrapper = `flex w-full justify-start items-center ${clickEvent}`;
	const noItemFound = allowCreatingNewItem ? `Create ${searchedItem}` : "Nothing found.";
	const noItemFoundClickAction = allowCreatingNewItem ? onClick : () => {};

	let _filteredData;

	if (typeof filteredData === "function") {
		_filteredData = filteredData();
	} else {
		_filteredData = filteredData;
	}

	const uiBox = () => {
		return (
			<div className={mainWrapper}>
				<span className="font-regular-10 light-slate-gray-text">{label}</span>
				<div className={childWrapper}>
					<Combobox
						onChange={onChange}
						onKeyPress={onKeyPress}
						value={value}>
						<div className="relative w-full">
							<div className="flex w-full h-9 px-3 space-x-1 justify-center items-center relative overflow-hidden rounded primary-background-transparent-01 primary-bottom-border-transparent-05">
								<FontAwesomeIcon
									className="primary-text"
									icon={icon}
								/>
								<ComboboxInput
									autoComplete="off"
									className="w-full p-2 font-regular-11 bg-transparent black-text outline-none"
									displayValue={(m) => m}
									tabIndex={tabIndex}
								/>
								<ComboboxButton className="flex absolute pr-2 items-center inset-y-0 right-0 outline-none">
									<FontAwesomeIcon
										className="gray-text"
										icon={faAngleDown}
									/>
								</ComboboxButton>
							</div>
							<ComboboxOptions className="absolute w-full max-h-[150px] mt-1 overflow-auto divide-y rounded bottom-shadow outline-none z-50 full-border primary-light-background">{uiList()}</ComboboxOptions>
						</div>
					</Combobox>
				</div>
			</div>
		);
	};

	const uiList = () => {
		if (!_filteredData) {
			return <div className="flex w-full p-2 justify-between items-center cursor-pointer font-regular-11 black-text">Nothing found.</div>;
		} else if (!_filteredData?.length && searchedItem) {
			return (
				<div
					className="flex w-full p-2 justify-between items-center cursor-pointer font-regular-11 black-text"
					onClick={noItemFoundClickAction}>
					{noItemFound}
				</div>
			);
		} else {
			return _filteredData?.map((m, n) => {
				const isSelected = comparisonValue == m;

				const nameStyle = isSelected ? `font-regular-10 primary-text` : "font-regular-10 black-text";
				const wrapper = `flex w-full p-2 justify-between items-center select-none cursor-pointer border-y hovered-rows ${isSelected && "primary-background-transparent-01"}`;

				return (
					<ComboboxOption
						className={wrapper}
						key={n}
						value={m}>
						<span className={nameStyle}>{m}</span>
						{isSelected && (
							<FontAwesomeIcon
								className="primary-text"
								icon={faCheck}
							/>
						)}
					</ComboboxOption>
				);
			});
		}
	};

	return uiBox();
};

export const ComboBox2 = ({
	allowCreatingNewItem,
	comparingValue1,
	comparingValue2,
	displayValue,
	filteredData,
	hasDataObject,
	icon,
	isMenuInverted = false,
	isReadOnly,
	label,
	onChange,
	onClick,
	onInputChange,
	onKeyPress,
	searchedItem,
	tabIndex,
	value,
	width,
}) => {
	const mainBoxReference = useRef(null);

	const aesthetics = isReadOnly ? "cursor-not-allowed opacity-50" : "cursor-default opacity-100";
	const clickEvent = isReadOnly ? "pointer-events-none" : "pointer-events-auto";
	const wrapper = `flex flex-col ${width} p-2 space-y-1 ${aesthetics}`;
	const inputWrapper = `relative w-full ${clickEvent}`;
	const noItemFound = allowCreatingNewItem ? `Create ${searchedItem}` : "Nothing found.";
	const noItemFoundClickAction = allowCreatingNewItem ? onClick : () => {};

	let _filteredData;

	if (typeof filteredData === "function") {
		_filteredData = filteredData();
	} else {
		_filteredData = filteredData;
	}

	const top = mainBoxReference.current && mainBoxReference.current.getBoundingClientRect();

	const uiBox = () => {
		return (
			<div
				className={wrapper}
				ref={mainBoxReference}>
				<span className="font-regular-10 light-slate-gray-text">{label}</span>
				<div className="flex w-full justify-start items-center">
					<Combobox
						onChange={onChange}
						onKeyPress={onKeyPress}
						value={value}>
						<div className={inputWrapper}>
							<div className="flex w-full h-9 px-3 space-x-1 justify-center items-center relative overflow-hidden rounded primary-background-transparent-01 primary-bottom-border-transparent-05">
								<FontAwesomeIcon
									className="primary-text"
									icon={icon}
								/>
								<ComboboxInput
									autoComplete="off"
									className="w-full p-2 font-regular-11 bg-transparent black-text outline-none"
									displayValue={(m) => m}
									onChange={onInputChange}
									readOnly={isReadOnly}
									tabIndex={tabIndex}
								/>
								<ComboboxButton className="flex absolute pr-2 items-center inset-y-0 right-0 outline-none">
									<FontAwesomeIcon
										className="gray-text"
										icon={faAngleDown}
									/>
								</ComboboxButton>
							</div>
							<ComboboxOptions
								className="absolute w-full max-h-[150px] mt-1 overflow-auto rounded bottom-shadow outline-none z-50 full-border primary-light-background"
								style={{ top: isMenuInverted ? "-160px" : "36px", zIndex: 50 }}>
								{uiList()}
							</ComboboxOptions>
						</div>
					</Combobox>
				</div>
			</div>
		);
	};

	const uiList = () => {
		if (!_filteredData?.length && searchedItem) {
			return (
				<div
					className="flex w-full p-2 justify-between items-center cursor-pointer font-regular-11 black-text"
					onClick={noItemFoundClickAction}>
					{noItemFound}
				</div>
			);
		} else {
			return _filteredData?.map((m, n) => {
				const _comparingValue1 = comparingValue1 ? m?.[comparingValue1] : m;
				const _displayValue = displayValue ? m?.[displayValue] : m;
				const isSelected = _comparingValue1 == comparingValue2;
				const dataObject = hasDataObject ? { id: m.id, name: m.name } : m;

				const nameStyle = isSelected ? "font-regular-10 primary-text" : "font-regular-10 black-text";
				const wrapper = `flex w-full p-2 justify-between items-center select-none cursor-pointer border-y hovered-rows ${isSelected && `primary-background-transparent-01`}`;

				return (
					<ComboboxOption
						className={wrapper}
						key={n}
						value={dataObject}>
						<span className={nameStyle}>{_displayValue}</span>
						{isSelected && (
							<FontAwesomeIcon
								className="primary-text"
								icon={faCheck}
							/>
						)}
					</ComboboxOption>
				);
			});
		}
	};

	return uiBox();
};

export const ComboBoxWithChips = ({
	background = "primary-background-transparent-01",
	displayKey,
	fontSize = "font-regular-11",
	height = "h-full",
	icon,
	iconSize = "",
	isMenuInverted,
	label,
	onBlur,
	onItemClick,
	onSelectedItemClick,
	padding = "p-2",
	selectedItems,
	showInitials = false,
	showList,
	source,
	subIcon = faUser,
	toggleMenu,
	topPosition = "-90px",
	width = "w-full",
}) => {
	const uiBox = () => {
		const verticalSpacing = label ? "space-y-1" : "space-y-0";
		const wrapper = `flex flex-col ${width} ${padding} ${verticalSpacing} relative`;

		const childWrapper = `flex w-full ${height} px-3 space-x-1 justify-center items-center rounded ${background} primary-bottom-border-transparent-05`;

		const selectedItemsStyle = `flex w-full space-x-1 justify-start items-center cursor-pointer ${fontSize} black-text`;

		return (
			<div
				className={wrapper}
				onBlur={onBlur}>
				{label && <span className="font-regular-10 light-slate-gray-text">{label}</span>}
				<div className={childWrapper}>
					<FontAwesomeIcon
						className="primary-text"
						icon={icon}
						size={iconSize}
					/>
					<div className="flex w-full h-[34px] pl-2.5 justify-between items-center relative">
						<div
							className={selectedItemsStyle}
							onClick={(e) => {
								if (!e.target.closest(".selected-item")) {
									toggleMenu();
								}
							}}>
							{uiSelectedItems()}
						</div>
						<FontAwesomeIcon
							className="cursor-pointer gray-text"
							icon={faAngleDown}
							onClick={toggleMenu}
						/>
					</div>
				</div>
				<div
					className={showList}
					style={{ top: isMenuInverted ? topPosition : "66px", zIndex: 50 }}>
					{uiList()}
				</div>
			</div>
		);
	};

	const uiList = () => {
		return source?.map((m, n) => {
			const isSelected = selectedItems?.filter((f) => f.id == m.id)?.length > 0;
			const _background = isSelected && "primary-background-transparent-01";
			const _colour = isSelected ? "primary-text" : "black-text";
			const wrapper = `flex w-full p-2 justify-between items-center cursor-pointer border-y font-regular-10 ${_colour} ${_background} hovered-rows`;

			return (
				<span
					className={wrapper}
					key={n}
					onClick={() => onItemClick(m)}>
					<div className="flex pr-2 space-x-2 justify-center items-center">
						<FontAwesomeIcon
							className="primary-text"
							icon={subIcon}
						/>
						<span>{m?.[displayKey]}</span>
					</div>
					{isSelected && (
						<FontAwesomeIcon
							className="primary-text"
							icon={faCheck}
						/>
					)}
				</span>
			);
		});
	};

	const uiSelectedItems = () => {
		if (selectedItems?.length) {
			const wrapper = "flex py-px px-2 space-x-2 justify-between items-center rounded primary-background-transparent-01";

			if (selectedItems?.length > 5) {
				return (
					<Tippy
						allowHTML
						content={uiTooltipUi()}
						placement="bottom">
						<span className={`${wrapper} cursor-pointer`}>{selectedItems?.length} people selected</span>
					</Tippy>
				);
			} else {
				return selectedItems?.map((m, n) => {
					return (
						<span
							className={wrapper}
							key={n}
							onClick={(e) => e.stopPropagation()}>
							<span>{showInitials ? MyGlobal.GetInitials(m?.[displayKey]) : m?.[displayKey]}</span>
							<FontAwesomeIcon
								className="cursor-pointer gray-text"
								icon={faMultiply}
								onClick={(e) => {
									e.stopPropagation();
									onSelectedItemClick(m);
								}}
							/>
						</span>
					);
				});
			}
		}
	};

	const uiTooltipUi = () => {
		return selectedItems?.map((m, n) => {
			return (
				<div className="font-regular-10 text-white">
					{++n}. {m?.[displayKey]}
				</div>
			);
		});
	};

	return uiBox();
};

export const DatePicker = ({
	background = "primary-background-transparent-01",
	fontSize = "font-regular-11",
	height = "h-9",
	icon,
	label,
	onChange,
	showLabel = true,
	placeholder = "",
	iconSize = "",
	padding = "p-2",
	gap = "space-x-2",
	tabIndex,
	value,
	width,
}) => {
	const verticalSpacing = showLabel ? "space-y-1" : "space-y-0";
	const mainWrapper = `flex flex-col ${width} ${padding} ${verticalSpacing} justify-center items-center`;

	const datePickerStyle = `bg-transparent w-full outline-none relative ${fontSize} black-text`;
	const wrapper = `flex w-full ${height} px-3 ${gap} justify-start items-center rounded ${background} primary-bottom-border-transparent-05`;

	return (
		<div className={mainWrapper}>
			{showLabel && <span className="flex w-full justify-start items-center font-regular-10 light-slate-gray-text">{label}</span>}
			<div className={wrapper}>
				<FontAwesomeIcon
					className="primary-text"
					icon={icon}
					size={iconSize}
				/>
				<ReactDatePicker
					autoFocus={false}
					className={datePickerStyle}
					dateFormat="dd-MM-yyyy"
					dropdownMode="select"
					onChange={onChange}
					placeholderText={placeholder}
					peekNextMonth
					selected={value}
					showMonthDropdown
					showYearDropdown
					tabIndex={tabIndex}
				/>
			</div>
		</div>
	);
};

export const EmailAddress = ({ autoComplete = false, isReadOnly = false, label = "Email Address", onChange, reference = null, suffix, tabIndex, value, width }) => {
	const _autoComplete = autoComplete ? "off" : "on";
	const emailAddressSuffix = `@${applicationName.toLowerCase()}.com`;

	const aesthetics = isReadOnly ? "cursor-not-allowed opacity-50" : "cursor-default opacity-100";
	const wrapper = `flex flex-col ${width} p-2 space-y-1 justify-center items-center ${aesthetics}`;
	const horizontalPadding = suffix ? "pl-2" : "px-3";
	const pointerEvents = isReadOnly ? "pointer-events-none" : "pointer-events-auto";

	const inputWrapper = `flex w-full h-9 ${horizontalPadding} space-x-1 justify-start items-center rounded primary-background-transparent-01 ${pointerEvents} primary-bottom-border-transparent-05`;

	return (
		<div className={wrapper}>
			<span className="flex w-full justify-start items-center font-regular-10 light-slate-gray-text">{label}</span>
			<div className={inputWrapper}>
				<FontAwesomeIcon
					className="primary-text"
					icon={faEnvelope}
				/>
				<input
					autoComplete={_autoComplete}
					className="inputs"
					onChange={onChange}
					readOnly={isReadOnly}
					ref={reference}
					tabIndex={tabIndex}
					value={value}
				/>
				{suffix && <span className="flex h-9 px-1 justify-center items-center full-border no-right-border font-regular-8 primary-light-background black-text">{emailAddressSuffix}</span>}
			</div>
		</div>
	);
};

export const Password = ({ eyeIconStyle, eyeIconUi, onChange, reference, toggleCharacters, tabIndex, type, value, width }) => {
	const wrapper = `flex flex-col ${width} p-2 space-y-1 justify-center items-center`;

	return (
		<div className={wrapper}>
			<span className="flex w-full justify-start items-center font-regular-10 light-slate-gray-text">Password</span>
			<div className="flex w-full h-9 px-3 justify-between items-center rounded primary-background-transparent-01 primary-bottom-border-transparent-05">
				<div className="flex w-full space-x-2 justify-start items-center">
					<FontAwesomeIcon
						className="primary-text"
						icon={faLock}
					/>
					<input
						autoComplete="off"
						className="inputs"
						onChange={onChange}
						ref={reference}
						tabIndex={tabIndex}
						type={type}
						value={value}
					/>
				</div>
				<span
					className={eyeIconStyle}
					onClick={toggleCharacters}>
					{eyeIconUi()}
				</span>
			</div>
		</div>
	);
};

export const TextInput = ({ disable = false, errorText = "", hasError = false, icon, iconSize = "1x", id, isReadOnly = false, label, maxLength = 255, onChange, onKeyPress, tabIndex, value, width }) => {
	const aesthetics = disable || isReadOnly ? "opacity-50" : " opacity-100";
	const clickEvent = isReadOnly ? `pointer-events-none ${aesthetics}` : "pointer-events-auto";
	const cursor = isReadOnly ? "cursor-not-allowed" : "cursor-default";
	const wrapper = `flex flex-col ${width} p-2 space-y-1 justify-center items-center ${cursor}`;

	const animation = hasError ? "animate__animated animate__shakeX animate__faster" : "";
	const colour = hasError ? "red-text-important" : "primary-text";

	const background = hasError ? "red-background-transparent-01 red-bottom-border-transparent-05" : "primary-background-transparent-01 primary-bottom-border-transparent-05";

	const inputStyle = `inputs ${colour}`;
	const inputWrapper = `flex w-full h-9 px-3 space-x-1 justify-start items-center ${clickEvent} rounded ${animation} ${background}`;

	return (
		<div className={wrapper}>
			<span className="flex w-full justify-start items-center font-regular-10 light-slate-gray-text">{label}</span>

			<Tippy
				allowHTML
				animation="shift-away"
				content={errorText}
				visible={hasError}
				placement="right">
				<div className={inputWrapper}>
					<FontAwesomeIcon
						className={colour}
						icon={icon}
						size={iconSize}
					/>
					<input
						autoComplete="off"
						className={inputStyle}
						id={id}
						maxLength={maxLength}
						onChange={onChange}
						onKeyPress={onKeyPress}
						readOnly={isReadOnly}
						tabIndex={tabIndex}
						type="text"
						value={value}
					/>
				</div>
			</Tippy>
		</div>
	);
};

export const TextInputNative = ({ id, icon, onChange, onClearButtonClick, placeholder, showClearButton, source, tabIndex, value, width }) => {
	const background = source ? (source === "singleProject" ? "bg-white primary-bottom-border-transparent-05" : "bg-[var(--primary-transparent-01)] bottom-shadow full-border") : "contrast-background shadow";
	const wrapper = `flex ${width} px-3 justify-start items-center rounded ${background}`;

	return (
		<div className={wrapper}>
			<FontAwesomeIcon
				className="primary-text"
				icon={icon}
				size="sm"
			/>
			<input
				autoComplete="off"
				autoFocus
				className="inputs !h-[30px] !text-[13px]"
				id={id}
				onChange={onChange}
				placeholder={placeholder}
				tabIndex={tabIndex}
				type="text"
				value={value}
			/>
			<FontAwesomeIcon
				className={showClearButton}
				icon={faMultiply}
				onClick={onClearButtonClick}
			/>
		</div>
	);
};

export const TextArea = ({ icon, isReadOnly = false, label, onChange, onKeyDown, rows, tabIndex, value, width }) => {
	const wrapper = `flex flex-col ${width} p-2 space-y-1 justify-center items-center`;
	const inputWrapper = `flex w-full h-full px-3 py-2 space-x-1 justify-start items-start rounded primary-background-transparent-01 primary-bottom-border-transparent-05`;

	return (
		<div className={wrapper}>
			<span className="flex w-full justify-start items-center font-regular-10 light-slate-gray-text">{label}</span>
			<div className={inputWrapper}>
				<FontAwesomeIcon
					className="primary-text"
					icon={icon}
				/>
				<textarea
					className="textarea-inputs whitespace-pre-line"
					onChange={onChange}
					onKeyDown={onKeyDown}
					readOnly={isReadOnly}
					rows={rows}
					tabIndex={tabIndex}
					value={value}
				/>
			</div>
		</div>
	);
};

export const TextAreaNative = ({ className, isReadOnly = false, onChange, onKeyDown, rows, tabIndex, value }) => {
	return (
		<textarea
			className={className}
			onChange={onChange}
			onKeyDown={onKeyDown}
			tabIndex={tabIndex}
			readOnly={isReadOnly}
			rows={rows}
			value={value}
		/>
	);
};
