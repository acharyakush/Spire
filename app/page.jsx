"use client";

// Imports
import dayjs from "dayjs";
import axios from "axios";
import MyConstants from "@/utilities/constants";

import { Button } from "primereact/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Password } from "primereact/password";
import { InputText } from "primereact/inputtext";
import { useToast } from "./context/ToastContext";
import { applicationName, isDevelopment, MyGlobal } from "@/utilities/global";

// Component
export default function Home() {
	// Business Logic
	const router = useRouter();
	const showToast = useToast();

	const [emailAddress, setEmailAddress] = useState({ error: "", value: "" });
	const [flags, setFlags] = useState({ isLoading: false });
	const [password, setPassword] = useState("");

	// Functions
	const autofill = () => {
		if (isDevelopment) {
			setEmailAddress((old) => ({ ...old, value: "kush@admins.spire.com" }));
			setPassword("acharyakush2604");
		}
	};

	const authenticate = async () => {
		const emailAddressValidation = MyGlobal.validateEmailAddress(emailAddress.value);

		if (!emailAddress.value) {
			showToast(MyConstants.MESSAGES.noEmailAddress, MyConstants.NOTIFICATION_TYPES.error);
		} else if (emailAddressValidation.hasError) {
			showToast(emailAddressValidation.text, MyConstants.NOTIFICATION_TYPES.error);
		} else if (!password) {
			showToast(MyConstants.MESSAGES.noPassword, MyConstants.NOTIFICATION_TYPES.error);
		} else {
			setEmailAddress((old) => ({ ...old, error: "" }));
			setFlags((old) => ({ ...old, isLoading: true }));

			const currentTimestamp = dayjs().format("hh:mm:ss a DD-MM-YYYY");
			const sessionToken = MyGlobal.obfuscate(`${currentTimestamp}${emailAddress}${password}`);

			const jsonBody = JSON.stringify({ emailAddress: emailAddress.value, password });
			const body = { credentials: MyGlobal.obfuscate(jsonBody) };

			try {
				const response = await axios.post(MyConstants.API_ENDPOINTS.authenticate, body);

				if (response.status === 200) {
					const userDetails = MyGlobal.deobfuscate(response.data);
					const jsonUserDetails = JSON.parse(userDetails);

					MyGlobal.Storages.local.set(`${applicationName.toLocaleLowerCase()}_user_details`, userDetails);
					MyGlobal.addActivity({ activity: "Logged in.", session_id: sessionToken, user_id: jsonUserDetails.user.id });

					router.replace("/home");
				}
			} catch (error) {
				if ("response" in error) {
					if ("object" in error.response.data) {
						showToast(error.response.data.object.name, MyConstants.NOTIFICATION_TYPES.error);
					} else {
						showToast(error.response.data.error, MyConstants.NOTIFICATION_TYPES.error);
					}
				}
			} finally {
				setFlags((old) => ({ ...old, isLoading: false }));
			}
		}
	};

	const setCredentials = (event) => {
		if (event.target.id === "emailAddress") {
			setEmailAddress((old) => ({ ...old, value: event.target.value }));
		} else {
			setPassword(event.target.value);
		}
	};

	// Hooks
	useEffect(() => {
		MyGlobal.Storages.local.removeAll();
	}, []);

	// Main UI
	return (
		<div className="flex w-screen min-h-screen p-4 justify-center items-center login-background">
			<div className="flex w-1/5 space-y-6 justify-center items-center">
				<div className="w-full p-8 space-y-6 rounded shadow-sm bg-white">
					<span className="block py-3 w-full text-center font-semibold text-4xl" onClick={autofill}>
						{process.env.NEXT_PUBLIC_APPLICATION_NAME.toUpperCase()}
					</span>

					<div className="space-y-6">
						<div className="flex w-full justify-center">
							<div className="flex flex-col w-full gap-2">
								<label htmlFor="emailAddress">Email Address</label>
								<InputText className="w-full p-inputtext-sm" id="emailAddress" onChange={setCredentials} value={emailAddress.value} />
							</div>
						</div>
						<div className="flex w-full justify-center">
							<div className="flex flex-col w-full gap-2">
								<label htmlFor="password">Password</label>
								<Password
									className="w-full p-inputtext-sm"
									feedback={false}
									inputClassName="w-full"
									inputId="password"
									onChange={setCredentials}
									toggleMask
									value={password}
								/>
							</div>
						</div>
					</div>
					<div className="flex w-full h-14 justify-center items-end">
						<Button className="w-full" loading={flags.isLoading} label="Sign In" onClick={authenticate} />
					</div>
				</div>
			</div>
		</div>
	);
}
