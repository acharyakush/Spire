import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faCheck, faMultiply } from "@fortawesome/free-solid-svg-icons";

function optionValue(option) {
	return typeof option === "object" ? option.value : option;
}

function optionLabel(option) {
	return typeof option === "object" ? option.label ?? option.value : option;
}

export default function HeadlessSelect({ className = "w-full", clearable = false, data = [], label, onChange, onClear, placeholder = "Select", value }) {
	const selected = data.find((option) => optionValue(option) === value) ?? null;

	return (
		<div className={`flex flex-col p-2 space-y-1 justify-center items-center ${className}`}>
			{label && <span className="flex w-full justify-start items-center font-regular-10 light-slate-gray-text">{label}</span>}
			<Listbox nullable={clearable} value={selected} onChange={(option) => (option ? onChange?.(optionValue(option), option) : onClear?.())}>
				<div className="relative w-full">
					<ListboxButton className="flex w-full h-9 px-3 justify-between items-center rounded primary-background-transparent-01 primary-bottom-border-transparent-05 outline-none font-regular-11 black-text">
						<span className={clearable && selected ? "pr-6" : ""}>{selected ? optionLabel(selected) : placeholder}</span>
						<FontAwesomeIcon className="gray-text" icon={faAngleDown} />
					</ListboxButton>
					{clearable && selected && <button aria-label={`Clear ${label || placeholder}`} className="flex absolute inset-y-0 right-8 z-10 px-1 items-center outline-none" onClick={(event) => { event.stopPropagation(); onClear?.(); }} type="button"><FontAwesomeIcon className="gray-text" icon={faMultiply} /></button>}
					<ListboxOptions className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded bottom-shadow outline-none full-border primary-light-background">
						{data.map((option) => (
							<ListboxOption className={({ active }) => `flex w-full p-2 justify-between items-center select-none cursor-pointer border-y border-gray-300 hovered-rows ${active ? "primary-background-transparent-01" : ""}`} key={optionValue(option)} value={option}>
								<span className="font-regular-10 black-text">{optionLabel(option)}</span>
								{selected && optionValue(selected) === optionValue(option) && <FontAwesomeIcon className="primary-text" icon={faCheck} />}
							</ListboxOption>
						))}
					</ListboxOptions>
				</div>
			</Listbox>
		</div>
	);
}
