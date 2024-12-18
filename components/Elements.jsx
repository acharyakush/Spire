"use client";

export const Badge = ({ value }) => {
	return <span className="flex h-5 px-1.5 justify-center items-end rounded-full text-white font-regular-9 primary-border primary-background">{value}</span>;
};

export const BadgeSmall = ({ value }) => {
	return (
		<span className="flex h-5 px-2 justify-center items-center rounded-full font-regular-9 primary-text primary-border primary-background-transparent-01">
			{value}
		</span>
	);
};

export const BadgeSmallGreen = ({ value }) => {
	return (
		<span className="flex h-5 px-1 justify-center items-center rounded-full font-regular-7 green-text green-border green-background-transparent-01">
			{value}
		</span>
	);
};

export const BadgeSmallWithBackground = ({ style, value }) => {
	return (
		<span className={`flex h-5 px-1.5 justify-center items-center rounded-full font-regular-7 ${style.text} ${style.border} ${style.background}`}>
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
	return <span className="font-regular-10">{text}</span>;
};

export const TooltipList = ({ payload }) => {
	const formattedPayload = String(payload).includes(",") ? String(payload).split(",") : payload;

	return (
		<div className="flex flex-col w-full p-1 justify-between items-center font-regular-9">
			{!String(payload).includes(",") ? (
				<span className="font-regular-10">{payload}</span>
			) : (
				formattedPayload.map((item, index) => {
					const verticalSpacing = String(item).includes("\n") ? "py-2.5" : "";
					const bottomBorder = index != formattedPayload.length - 1 ? "bottom-border" : "border-transparent";
					const wrapper = `flex w-full justify-start items-center whitespace-pre ${verticalSpacing} ${bottomBorder}`;

					return (
						<div className={wrapper} key={index}>
							{index + 1}. {item}
						</div>
					);
				})
			)}
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
