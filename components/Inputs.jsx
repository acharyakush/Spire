"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import ReactDatePicker from "react-datepicker";

import { Combobox } from "@headlessui/react";
import { MyGlobal } from "@/utilities/global";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faCheck, faEnvelope, faLock, faMultiply } from "@fortawesome/free-solid-svg-icons";

export const ComboBox = ({
	allowCreatingNewItem,
	compareWith,
	comparisonValue,
	displayValue,
	filteredData,
	icon,
	isNew,
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
	const colour = isNew ? "green-text" : "primary-text";
	const wrapper = `flex flex-col ${width} p-2 space-y-1`;
	const background = isNew ? "green-background-transparent-01" : "primary-background-transparent-01";
	const noItemFound = allowCreatingNewItem ? `Create ${MyGlobal.Capitalize(searchedItem)}` : "Nothing found.";
	const noItemFoundClickAction = allowCreatingNewItem ? onClick : () => {};

	let _filteredData;

	if (typeof filteredData === "function") {
		_filteredData = filteredData();
	} else {
		_filteredData = filteredData;
	}

	const uiBox = () => {
		return (
			<div className={wrapper}>
				<span className="font-regular-10 light-slate-gray-text">{label}</span>
				<div className="flex w-full justify-start items-center">
					<Combobox onChange={onChange} onKeyPress={onKeyPress} value={value}>
						<div className="relative w-full">
							<div className="flex w-full h-[30px] px-2.5 space-x-1 justify-center items-center relative overflow-hidden rounded bottom-shadow black-white-background full-border">
								<FontAwesomeIcon className={colour} icon={icon} />
								<Combobox.Input
									autoComplete="off"
									className="w-full p-2 font-regular-10 bg-transparent black-text outline-none"
									displayValue={(m) => m}
									onChange={onInputChange}
									tabIndex={tabIndex}
								/>
								<Combobox.Button className="flex absolute pr-2 items-center inset-y-0 right-0 outline-none">
									<FontAwesomeIcon className="gray-text" icon={faAngleDown} />
								</Combobox.Button>
							</div>
							<Combobox.Options className="absolute w-full max-h-[148px] mt-1 overflow-auto rounded bottom-shadow outline-none z-50 full-border black-white-background">
								{uiList()}
							</Combobox.Options>
						</div>
					</Combobox>
				</div>
			</div>
		);
	};

	const uiList = () => {
		if (!_filteredData) {
			return <div className="flex w-full p-2 justify-between items-center cursor-pointer font-medium-10 black-text">Nothing found.</div>;
		} else if (!_filteredData?.length && searchedItem) {
			return (
				<div className="flex w-full p-2 justify-between items-center cursor-pointer font-medium-10 black-text" onClick={noItemFoundClickAction}>
					{noItemFound}
				</div>
			);
		} else {
			return _filteredData?.map((m, n) => {
				const _compareWith = compareWith ? m?.[compareWith] : m;
				const _displayValue = displayValue ? m?.[displayValue] : m;
				const isSelected = comparisonValue == _compareWith;

				const nameStyle = isSelected ? `font-medium-10 ${colour}` : "font-regular-10 black-text";
				const wrapper = `flex w-full p-2 justify-between items-center select-none cursor-pointer hovered-rows ${isSelected && background}`;

				return (
					<Combobox.Option className={wrapper} key={n} value={_compareWith}>
						<span className={nameStyle}>{_displayValue}</span>
						{isSelected && <FontAwesomeIcon className={colour} icon={faCheck} />}
					</Combobox.Option>
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
	isNew,
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
	const colour = isNew ? "green-text" : "primary-text";
	const wrapper = `flex flex-col ${width} p-2 space-y-1`;
	const background = isNew ? "green-background-transparent-01" : "primary-background-transparent-01";
	const noItemFound = allowCreatingNewItem ? `Create ${MyGlobal.Capitalize(searchedItem)}` : "Nothing found.";
	const noItemFoundClickAction = allowCreatingNewItem ? onClick : () => {};

	let _filteredData;

	if (typeof filteredData === "function") {
		_filteredData = filteredData();
	} else {
		_filteredData = filteredData;
	}

	const uiBox = () => {
		return (
			<div className={wrapper}>
				<span className="font-regular-10 light-slate-gray-text">{label}</span>
				<div className="flex w-full justify-start items-center">
					<Combobox onChange={onChange} onKeyPress={onKeyPress} value={value}>
						<div className="relative w-full">
							<div className="flex w-full h-[30px] px-2.5 space-x-1 justify-center items-center relative overflow-hidden rounded bottom-shadow black-white-background full-border">
								<FontAwesomeIcon className={colour} icon={icon} />
								<Combobox.Input
									autoComplete="off"
									className="w-full p-2 font-regular-10 bg-transparent black-text outline-none"
									displayValue={(m) => m}
									onChange={onInputChange}
									readOnly={isReadOnly}
									tabIndex={tabIndex}
								/>
								<Combobox.Button className="flex absolute pr-2 items-center inset-y-0 right-0 outline-none">
									<FontAwesomeIcon className="gray-text" icon={faAngleDown} />
								</Combobox.Button>
							</div>
							<Combobox.Options className="absolute w-full max-h-[148px] mt-1 overflow-auto rounded bottom-shadow outline-none z-50 full-border black-white-background">
								{uiList()}
							</Combobox.Options>
						</div>
					</Combobox>
				</div>
			</div>
		);
	};

	const uiList = () => {
		if (!_filteredData?.length && searchedItem) {
			return (
				<div className="flex w-full p-2 justify-between items-center cursor-pointer font-medium-10 black-text" onClick={noItemFoundClickAction}>
					{noItemFound}
				</div>
			);
		} else {
			return _filteredData?.map((m, n) => {
				const _comparingValue1 = comparingValue1 ? m?.[comparingValue1] : m;
				const _displayValue = displayValue ? m?.[displayValue] : m;
				const isSelected = _comparingValue1 == comparingValue2;
				const dataObject = hasDataObject ? { id: m.id, name: m.name } : m;

				const nameStyle = isSelected ? `font-medium-10 ${colour}` : "font-regular-10 black-text";
				const wrapper = `flex w-full p-2 justify-between items-center select-none cursor-pointer hovered-rows ${isSelected && background}`;

				return (
					<Combobox.Option className={wrapper} key={n} value={dataObject}>
						<span className={nameStyle}>{_displayValue}</span>
						{isSelected && <FontAwesomeIcon className={colour} icon={faCheck} />}
					</Combobox.Option>
				);
			});
		}
	};

	return uiBox();
};

// const ComboBoxWithChips = ({ compareWith, label, icon, isMenuInverted, isNew, onBlur, onItemClick, onSelectedItemClick, selectedItems, showList, toggleMenu }) => {
// 	const { staffData } = useContext(DashboardContext);

// 	const colour = isNew ? "green-text" : "primary-text";
// 	const background = isNew ? "green-background-transparent-01" : "primary-background-transparent-01";

// 	const uiBox = () => {
// 		return (
// 			<div className="flex flex-col w-full p-2 space-y-1 relative">
// 				<span className="font-regular-10 light-slate-gray-text">{label}</span>
// 				<div className="flex w-full h-full px-2.5 space-x-1 justify-center items-center rounded bottom-shadow black-white-background full-border">
// 					<FontAwesomeIcon className={colour} icon={icon} />
// 					<div className="flex w-full h-[30px] pl-2.5 justify-between items-center relative">
// 						<div className="flex w-full space-x-1 justify-start items-center font-regular-10 black-text">{uiSelectedItems()}</div>
// 						<FontAwesomeIcon className="cursor-pointer gray-text" icon={faAngleDown} onClick={toggleMenu} />
// 					</div>
// 				</div>
// 				<div className={showList} style={{ top: isMenuInverted ? "-155px" : "66px", zIndex: 50 }}>
// 					{uiList()}
// 				</div>
// 			</div>
// 		);
// 	};

// 	const uiList = () => {
// 		return staffData?.map((m, n) => {
// 			const isSelected = selectedItems?.includes(m?.[compareWith]);
// 			const _background = isSelected && background;
// 			const _colour = isSelected ? colour : "black-text";
// 			const wrapper = `flex w-full p-2 justify-between items-center cursor-pointer font-regular-10 ${_colour} ${_background} hovered-rows`;

// 			return (
// 				<span className={wrapper} key={n} onClick={() => onItemClick(m?.[compareWith])}>
// 					<span>{m?.[compareWith]}</span>
// 					{isSelected && <FontAwesomeIcon className={colour} icon={faCheck} />}
// 				</span>
// 			);
// 		});
// 	};

// 	const uiSelectedItems = () => {
// 		if (selectedItems?.length) {
// 			const wrapper = `flex py-px px-2 space-x-2 justify-between items-center rounded ${background}`;

// 			if (selectedItems?.length > 5) {
// 				return (
// 					<Tippy allowHTML={true} content={uiTooltipUi()}>
// 						<span className={`${wrapper} cursor-pointer`}>{selectedItems?.length} people selected</span>
// 					</Tippy>
// 				);
// 			} else {
// 				return selectedItems?.map((m, n) => {
// 					return (
// 						<span className={wrapper} key={n}>
// 							<span>{m}</span>
// 							<FontAwesomeIcon className="cursor-pointer gray-text" icon={faMultiply} onClick={() => onSelectedItemClick(m)} />
// 						</span>
// 					);
// 				});
// 			}
// 		}
// 	};

// 	const uiTooltipUi = () => {
// 		return selectedItems?.map((m, n) => {
// 			return (
// 				<div className="font-regular-10 text-white">
// 					{++n}. {m}
// 				</div>
// 			);
// 		});
// 	};

// 	return uiBox();
// };

export const DatePicker = ({ icon, isNew, label, onChange, tabIndex, value, width }) => {
	const colour = isNew ? "green-text" : "primary-text";
	const mainWrapper = `flex flex-col ${width} p-2 space-y-1 justify-center items-center`;

	return (
		<div className={mainWrapper}>
			<span className="flex w-full justify-start items-center font-regular-10 light-slate-gray-text">{label}</span>
			<div className="flex w-full h-[30px] px-2 space-x-2 justify-start items-center rounded bottom-shadow black-white-background full-border">
				<FontAwesomeIcon className={colour} icon={icon} />
				<ReactDatePicker
					autoFocus={false}
					className="bg-transparent w-full outline-none relative -top-0.5 font-regular-10 black-text"
					dateFormat="dd-MM-YYYY"
					dropdownMode="select"
					onChange={onChange}
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

export const EmailAddress = ({ isNew, isReadOnly = false, label = "Email Address", onChange, reference = null, suffix, tabIndex, value, width }) => {
	const colour = `font-regular-12 ${isNew ? "green-text" : "primary-text"}`;
	const wrapper = `flex flex-col ${width} p-2 space-y-1 justify-center items-center`;
	const horizontalPadding = suffix ? "pl-2" : "px-2.5";
	const pointerEvents = isReadOnly ? "pointer-events-none" : "pointer-events-auto";

	const inputWrapper = `flex w-full h-[34px] ${horizontalPadding} space-x-1 justify-start items-center rounded bottom-shadow light-gray-background ${pointerEvents} full-border`;

	return (
		<div className={wrapper}>
			<span className="flex w-full justify-start items-center font-regular-12 light-slate-gray-text">{label}</span>
			<div className={inputWrapper}>
				<FontAwesomeIcon className={colour} icon={faEnvelope} />
				<input autoComplete="off" className="inputs" onChange={onChange} readOnly={isReadOnly} ref={reference} tabIndex={tabIndex} value={value} />
				{suffix && (
					<span className="flex h-[34px] px-1 justify-center items-center full-border no-right-border font-regular-8 light-gray-background black-text">
						@spire.com
					</span>
				)}
			</div>
		</div>
	);
};

export const Password = ({ eyeIconStyle, eyeIconUi, isNew, onChange, reference, toggleCharacters, tabIndex, type, value, width }) => {
	const wrapper = `flex flex-col ${width} p-2 space-y-1 justify-center items-center`;
	const colour = `font-regular-12 ${isNew ? "green-text" : "primary-text"}`;

	return (
		<div className={wrapper}>
			<span className="flex w-full justify-start items-center font-regular-12 light-slate-gray-text">Password</span>
			<div className="flex w-full h-[34px] px-2.5 justify-between items-center rounded bottom-shadow light-gray-background full-border">
				<div className="flex w-full space-x-1 justify-start items-center">
					<FontAwesomeIcon className={colour} icon={faLock} />
					<input autoComplete="off" className="inputs" onChange={onChange} ref={reference} tabIndex={tabIndex} type={type} value={value} />
				</div>
				<span className={eyeIconStyle} onClick={toggleCharacters}>
					{eyeIconUi()}
				</span>
			</div>
		</div>
	);
};

export const TextInput = ({ disable = false, icon, id, isNew, isReadOnly = false, label, maxLength = 255, onChange, onKeyPress, tabIndex, value, width }) => {
	const disabledAesthetics = disable ? "opacity-75 black-white-background" : " opacity-100 light-gray-background";
	const clickEvent = isReadOnly ? `pointer-events-none ${disabledAesthetics}` : "pointer-events-auto black-white-background";
	const cursor = isReadOnly ? "cursor-not-allowed" : "cursor-default";
	const wrapper = `flex flex-col ${width} p-2 space-y-1 justify-center items-center ${cursor}`;
	const inputWrapper = `flex w-full h-[30px] px-2 space-x-1 justify-start items-center ${clickEvent} rounded bottom-shadow full-border`;
	const colour = isNew ? "green-text" : "primary-text";

	return (
		<div className={wrapper}>
			<span className="flex w-full justify-start items-center font-regular-10 light-slate-gray-text">{label}</span>
			<div className={inputWrapper}>
				<FontAwesomeIcon className={colour} icon={icon} />
				<input
					autoComplete="off"
					className="inputs"
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
		</div>
	);
};

export const TextInputNative = ({ id, icon, onChange, onClearButtonClick, placeholder, showClearButton, tabIndex, value, width }) => {
	const wrapper = `flex ${width} h-7 px-2.5 justify-start items-center rounded bottom-shadow black-white-background`;

	return (
		<div className={wrapper}>
			<FontAwesomeIcon className="primary-text" icon={icon} size="sm" />
			<input
				autoComplete="off"
				autoFocus
				className="inputs"
				id={id}
				onChange={onChange}
				placeholder={placeholder}
				tabIndex={tabIndex}
				type="text"
				value={value}
			/>
			<FontAwesomeIcon className={showClearButton} onClick={onClearButtonClick} icon={faMultiply} />
		</div>
	);
};

export const TextArea = ({ icon, isNew, isReadOnly = false, label, onChange, onKeyDown, rows, tabIndex, value, width }) => {
	const wrapper = `flex flex-col ${width} p-2 space-y-1 justify-center items-center`;
	const colour = isNew ? "green-text" : "primary-text";
	const background = isReadOnly ? "light-gray-background" : "black-white-background";
	const inputWrapper = `flex w-full h-full p-2 space-x-1 justify-start items-start rounded bottom-shadow ${background} full-border`;

	return (
		<div className={wrapper}>
			<span className="flex w-full justify-start items-center font-regular-10 light-slate-gray-text">{label}</span>
			<div className={inputWrapper}>
				<FontAwesomeIcon className={colour} icon={icon} />
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
	return <textarea className={className} onChange={onChange} onKeyDown={onKeyDown} tabIndex={tabIndex} readOnly={isReadOnly} rows={rows} value={value} />;
};
