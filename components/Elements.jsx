"use client";

function getInitials(namesArray) {
	const result = [];
	const used = new Set();

	namesArray.forEach((fullName) => {
		const [firstRaw, lastRaw] = fullName.trim().split(/\s+/);
		const first = firstRaw || "";
		const last = lastRaw || "";

		if (!first || !last) {
			result.push("??");
			return;
		}

		let baseInitial = (first[0] + last[0]).toUpperCase();
		let initials = baseInitial;

		// Try to make it unique
		let i = 1;
		while (used.has(initials)) {
			// Try taking more letters from first name or fallback to numbered suffix
			initials = (first.substring(0, i + 1) + last[0]).toUpperCase();
			i++;
		}

		used.add(initials);
		result.push(initials);
	});

	return result;
}

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

	// Get all initials in one pass, with uniqueness detection
	const initialsList = getInitials(people);

	function renderAvatar(person, index) {
		const initials = initialsList[index];
		let backgroundColour = getRandomPastel(index);

		if (person === "Drashti Sharma") backgroundColour = "#D5E8D4";
		if (person === "Abhishek Gor") backgroundColour = "#F2F4F4";

		const isWide = initials.length > 2;

		const style = {
			backgroundColor: backgroundColour,
			border: "1px solid rgba(0, 0, 0, 0.09)",
			borderRadius: "50%",
			boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
			color: "#333",
			marginLeft: index === 0 ? 0 : isWide ? -5 : -7,
			zIndex: people.length - index,
		};

		const avatarClass = `flex w-9 h-9 justify-center items-center select-none font-medium ${isWide ? "text-[0.7rem]" : "text-[0.9rem]"}`;

		return (
			<div className={avatarClass} key={index} title={person} style={style}>
				{initials}
			</div>
		);
	}

	return <div className="flex items-center">{people.map((m, i) => renderAvatar(m, i))}</div>;
}

export const Badge = ({ value }) => {
	return (
		<div className="relative inline-block">
			<span className="flex min-w-6 w-max h-6 px-2 justify-center items-center rounded-full text-white font-semibold-11 primary-background">{value}</span>
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
	return <span className="flex h-5 px-2 justify-center items-center rounded-full font-regular-9 primary-text primary-background-transparent-01">{value}</span>;
};

export const BadgeSmallGreen = ({ value }) => {
	return <span className="flex h-5 px-1 justify-center items-center rounded-full font-regular-7 green-text green-border green-background-transparent-01">{value}</span>;
};

export const BadgeSmallWithBackground = ({ style, value }) => {
	return <span className={`flex min-w-6 h-6 px-2 justify-center items-center rounded-full font-regular-10 ${style.text} ${style.border} ${style.background}`}>{value}</span>;
};

export const BadgeSmallWithBackground2 = ({ style, value }) => {
	return <span className={`flex h-5 px-2 justify-center items-center rounded-full font-regular-9 ${style.text} ${style.background}`}>{value}</span>;
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
