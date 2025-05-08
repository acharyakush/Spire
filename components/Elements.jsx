"use client";

import { MyGlobal } from "@/utilities/global";

const getInitials = (name) => {
	if (!name) return "";
	const words = name.trim().split(" ");
	const initials = words.map((word) => word[0].toUpperCase());
	return initials.slice(0, 2).join("");
};

const getRandomPastel = (seed = 0) => {
	const pastelColors = [
		"#E8DFF5", // Lavender Mist
		"#D5E8D4", // Mint Court
		"#FDEBD0", // Peach Champagne
		"#F9E79F", // Golden Glow
		"#E6E6FA", // Soft Amethyst
		"#F6DDCC", // Apricot Blush
		"#D6EAF8", // Powder Sapphire
		"#F2F4F4", // Imperial Pearl
		"#FADBD8", // Rose Dust
		"#EBDEF0", // Lilac Silk
	];
	return pastelColors[seed % pastelColors.length];
};

export function AvatarCircle({ name, names }) {
	const people = Array.isArray(names) ? names : name ? [name] : [];

	const renderAvatar = (person, index) => {
		const initials = getInitials(person);
		const bg = getRandomPastel(index);

		const style = {
			backgroundColor: bg,
			color: "#333",
			width: 36,
			height: 36,
			borderRadius: "50%",
			border: "1px solid rgba(0, 0, 0, 0.05)",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			userSelect: "none",
			boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
			marginLeft: index === 0 ? 0 : -7,
			zIndex: people.length - index,
		};

		return (
			<div className="font-medium-10" key={index} title={person} style={style}>
				{initials}
			</div>
		);
	};

	return <div style={{ display: "flex", alignItems: "center" }}>{people.map((person, i) => renderAvatar(person, i))}</div>;
}

export const Badge = ({ value }) => {
	return (
		<div className="relative inline-block">
			<span className="flex min-w-[1.5rem] w-max h-6 px-2 justify-center items-center rounded-full text-white font-semibold-10 primary-background">{value}</span>
		</div>
	);
};

export const BadgeGreenLarge = ({ value }) => {
	return (
		<div className="relative inline-block">
			<span className="flex min-w-11 w-max px-2.5 justify-center items-center rounded-full shadow text-white font-semibold-30 green-background">{value}</span>
		</div>
	);
};

export const BadgeLarge = ({ value }) => {
	return (
		<div className="relative inline-block">
			<span className="flex min-w-9 w-max px-2.5 justify-center items-center rounded-full text-white font-semibold-20 primary-background">{value}</span>
		</div>
	);
};

export const BadgeLarge2 = ({ children }) => {
	return (
		<div className="relative inline-block">
			<span className="flex min-w-9 w-max px-2.5 justify-center items-center rounded-full text-white font-bold-12 primary-background">{children}</span>
		</div>
	);
};

export const BadgeSmall = ({ value }) => {
	return <span className="flex h-5 px-2 justify-center items-center rounded-full font-regular-9 primary-text primary-border primary-background-transparent-01">{value}</span>;
};

export const BadgeSmallGreen = ({ value }) => {
	return <span className="flex h-5 px-1 justify-center items-center rounded-full font-regular-7 green-text green-border green-background-transparent-01">{value}</span>;
};

export const BadgeSmallWithBackground = ({ style, value }) => {
	return (
		<span className={`flex min-w-7 h-7 px-2 justify-center items-center rounded-full font-medium-10 leading-none ${style.text} ${style.border} ${style.background}`} style={{ lineHeight: "1", fontFeatureSettings: "'tnum'" }}>
			{value}
		</span>
	);
};

export const Spinner = () => {
	return <span className="login-spinner" />;
};

export const SpinnerBig = () => {
	return <span className="spinner" />;
};

export const SpinnerSmall = () => {
	return <span className="small-spinner" />;
};

export const SpinnerSmallWhite = () => {
	return <span className="small-spinner-white" />;
};

export const Tooltip = ({ text }) => {
	return <span className="font-regular-11">{text}</span>;
};

export const TooltipList = ({ payload }) => {
	const _payload = String(payload);
	const formattedPayload = _payload.includes(",") ? _payload.split(",") : _payload;

	return (
		<div className="flex flex-col w-full p-1 justify-between items-center font-regular-12">
			{!_payload.includes(",") ? (
				<span className="font-regular-11">{payload}</span>
			) : (
				formattedPayload.map((m, i) => {
					const name = String(m).trim();

					return (
						<div className="flex w-full py-1 space-x-1.5 justify-start items-center whitespace-pre" key={i}>
							<span>{i + 1}.</span>
							<span>{name}</span>
						</div>
					);
				})
			)}
		</div>
	);
};

export const UsersTooltipList = ({ list }) => {
	const _list = Array.isArray(list) ? list : Object.values(list);

	return (
		<div className="flex flex-col w-full p-1 justify-between items-center font-regular-11">
			{_list.map((m, i) => {
				return (
					<div className="flex w-full space-x-2 py-px justify-between items-center whitespace-pre" key={i}>
						<span>{i + 1}</span>.<span>{m.full_name}</span>
					</div>
				);
			})}
		</div>
	);
};

export const ErrorFallbackComponent = ({ error }) => {
	return (
		<div className="flex flex-col w-full h-full space-y-2 justify-center items-center red-background-transparent-01 font-medium-16 red-text" role="alert">
			<span>There is a technical glitch. Contact help desk and give below message.</span>
			<span className="flex space-x-2.5 font-regular-14">
				<span>Reason ::</span>
				<span>{error.message}</span>
			</span>
		</div>
	);
};
