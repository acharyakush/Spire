export function ClientsSkeleton() {
	const fancyRightBorderStyle = "absolute w-2.5 h-[50px] rounded-tr-full rounded-br-full blue-background left-2";

	return (
		<div className="w-full h-full contrast-background">
			<div className="flex w-full h-[34.06px] justify-between items-center-safe primary-background">
				<div className="flex w-full justify-center-safe items-center-safe">
					<span className="w-[61.8px] h-[15.2px] bg-gray-300 rounded" />
				</div>
				<div className="flex w-full justify-center-safe items-center-safe">
					<span className="w-[36.08px] h-[15.2px] bg-gray-300 rounded" />
				</div>
				<div className="flex w-full justify-center-safe items-center-safe">
					<span className="w-[86.61px] h-[15.2px] bg-gray-300 rounded" />
				</div>
			</div>
			{[...Array(8)].map((_, i) => {
				return (
					<div className="flex p-2 m-2 justify-center-safe items-center-safe bg-gray-100 shadow rounded animate-pulse" key={i}>
						<span className={fancyRightBorderStyle} />
						<div className="flex flex-col w-1/3 justify-center-safe items-center-safe text-center">
							<span className="w-[94.69px] h-6 bg-gray-300 rounded mb-1" />
							<span className="w-[83.56px] h-[21.99px] bg-gray-300 rounded" />
						</div>
						<div className="flex flex-col w-1/3 justify-center-safe items-center-safe text-center">
							<span className="w-[94.69px] h-6 bg-gray-300 rounded mb-1" />
							<span className="w-[69.63px] h-[21.99px] bg-gray-300 rounded" />
						</div>
						<div className="flex flex-col w-1/3 justify-center-safe items-center-safe text-center">
							<span className="w-[89.93px] h-6 bg-gray-300 rounded mb-1" />
							<span className="w-[47.14px] h-[21.99px] bg-gray-300 rounded" />
						</div>
					</div>
				);
			})}
		</div>
	);
}
