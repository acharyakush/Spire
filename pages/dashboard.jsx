"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckDouble, faCirclePause, faLock, faQuestionCircle, faUnlock } from "@fortawesome/free-solid-svg-icons";

export default function Dashboard() {
	return (
		<div className="flex flex-col w-full p-10 space-y-5 justify-center items-center">
			<div className="flex w-full py-5 space-y-2.5 justify-center items-center">
				<div className="flex flex-col w-1/3 p-2.5 space-y-2.5 justify-between items-center">
					<div className="flex w-full space-x-2.5 text-2xl font-semibold primary-text">
						<FontAwesomeIcon className="primary-text" icon={faQuestionCircle} />
						<span>Inquiries</span>
					</div>
					<div className="flex w-full space-x-5 justify-between items-center">
						<div className="flex flex-col w-1/2 px-6 pb-4 justify-between items-center rounded shadow-xl text-white orange-background-gradient">
							<div className="py-4 px-8 rounded-b-full shadow-2xl gray-background-transparent-01">
								<FontAwesomeIcon className="text-2xl text-white" icon={faUnlock} />
							</div>
							<div className="flex flex-col pt-2 justify-center items-center">
								<span className="tracking-widest font-medium-8 light-gray-text">OPEN</span>
								<span className="font-bold-20">25</span>
							</div>
						</div>

						<div className="flex flex-col w-1/2 px-6 pb-4 justify-between items-center rounded shadow-xl text-white green-background-gradient">
							<div className="py-4 px-8 rounded-b-full shadow-2xl gray-background-transparent-01">
								<FontAwesomeIcon className="text-2xl text-white" icon={faCheckDouble} />
							</div>
							<div className="flex flex-col pt-2 justify-center items-center">
								<span className="tracking-widest font-medium-8 light-gray-text">CONFIRMED</span>
								<span className="font-bold-20">17</span>
							</div>
						</div>
					</div>
					<div className="flex w-full space-x-5 justify-between items-center">
						<div className="flex flex-col w-1/2 px-6 pb-4 justify-between items-center rounded shadow-xl text-white red-background-gradient">
							<div className="py-4 px-8 rounded-b-full shadow-2xl gray-background-transparent-01">
								<FontAwesomeIcon className="text-2xl text-white" icon={faCirclePause} />
							</div>
							<div className="flex flex-col pt-2 justify-center items-center">
								<span className="tracking-widest font-medium-8 light-gray-text">HOLD</span>
								<span className="font-bold-20">21</span>
							</div>
						</div>
						<div className="flex flex-col w-1/2 px-6 pb-4 justify-between items-center rounded shadow-xl text-white primary-background-gradient">
							<div className="py-4 px-8 rounded-b-full shadow-2xl gray-background-transparent-01">
								<FontAwesomeIcon className="text-2xl text-white" icon={faLock} />
							</div>
							<div className="flex flex-col pt-2 justify-center items-center">
								<span className="tracking-widest font-medium-8 light-gray-text">CLOSED</span>
								<span className="font-bold-20">15</span>
							</div>
						</div>
					</div>
				</div>
				<div className="flex w-1/3 p-5 space-y-2.5 justify-between items-center"></div>
				<div className="flex flex-col w-1/3 p-5 space-y-2.5 justify-between items-center"></div>
			</div>
		</div>
	);
}
