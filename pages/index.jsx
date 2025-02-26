"use client";

import dayjs from "dayjs";
import axios from "axios";
import MyConstants from "@/utilities/constants";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { EmailAddress, Password } from "@/components/Inputs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import { applicationName, isDevelopment, MyGlobal } from "@/utilities/global";

export default function Home() {
	// Business Logic
	const router = useRouter();
	const emailAddressReference = useRef(null);
	const passwordReference = useRef(null);

	const [userData, setUserData] = useState({
		emailAddress: "",
		isLoading: false,
		password: "",
		revealPassword: false,
	});

	const passwordType = !userData.revealPassword ? "password" : "text";
	const eyeIconStyle = userData.password.length ? "w-5 cursor-pointer visible" : "invisible";
	const signInButtonLabel = userData.isLoading ? "Signing in ..." : "Sign In";
	const signInButtonStyle = userData.isLoading ? "pointer-events-none opacity-50" : "pointer-events-auto opacity-100";
	const signInButtonClass = `primary-button-wide ${signInButtonStyle}`;

	// Functions
	const autofill = () => {
		if (isDevelopment) {
			setUserData((s) => ({ ...s, emailAddress: "kush@admins.spire.com", password: "saa.ka.spire.2024" }));
		}
	};

	const authenticate = async (source) => {
		const emailAddress = source == "click" ? userData.emailAddress : emailAddressReference.current?.value;
		const password = source == "click" ? userData.password : passwordReference.current?.value;

		const emailAddressValidation = MyGlobal.ValidateEmailAddress(emailAddress);

		if (emailAddressValidation.hasError) {
			MyGlobal.ShowErrorToast(emailAddressValidation.text);
		} else if (!password) {
			MyGlobal.ShowErrorToast(MyConstants.Messages.NoPassword);
		} else {
			setUserData((s) => ({ ...s, isLoading: true }));

			const currentTimestamp = dayjs().format("hh:mm:ss a DD-MM-YYYY");
			const sessionToken = MyGlobal.Encrypt(`${currentTimestamp}${emailAddress}${password}`);

			const jsonBody = JSON.stringify({ emailAddress, password });
			const body = { credentials: MyGlobal.Encrypt(jsonBody) };

			try {
				setUserData((s) => ({ ...s, isLoading: true }));

				const response = await axios.post(MyConstants.ApiEndpoints.Authenticate, body);

				MyGlobal.Storages.Local.Set(`${applicationName}UserDetails`, response.data);
				MyGlobal.Storages.Session.Set(`${applicationName}Token`, sessionToken);

				MyGlobal.SetUserData();
				MyGlobal.AddActivity("Logged in.");

				router.replace("/home");
			} catch (error) {
				MyGlobal.HandleErrors(error, "Authenticate");
			} finally {
				setUserData((s) => ({ ...s, isLoading: false }));
			}
		}
	};

	const detectKeystrokes = (event) => {
		if (event.key == "Enter") {
			event.preventDefault();
			authenticate("key");
		}
	};

	const handleInputs = (key, value) => {
		setUserData((s) => ({ ...s, [key]: value }));
	};

	const togglePasswordCharacters = () => {
		setUserData((s) => ({ ...s, revealPassword: !userData.revealPassword }));
	};

	// UI Components
	const uiEye = () => {
		if (userData.revealPassword) {
			return <FontAwesomeIcon className="w-5 gray-text" icon={faEye} />;
		} else {
			return <FontAwesomeIcon className="w-5 gray-text" icon={faEyeSlash} />;
		}
	};

	// Hooks
	useEffect(() => {
		document.body.setAttribute("app-theme", "light");
		document.title = `Welcome ${String.fromCharCode(183)} ${process.env.NEXT_PUBLIC_APPLICATION_NAME}`;

		MyGlobal.ClearAllUserData();

		// Kush Acharya => "saa.ka.spire.2024"
		// Abhishek Gor => "saa.ag.spire.2024"
		// Drashti Sharma => "saa.ds.spire.2024"

		globalThis.addEventListener("keydown", detectKeystrokes);
		return () => globalThis.removeEventListener("keydown", detectKeystrokes);
	}, []);

	// Main UI
	return (
		<div className="flex flex-col min-w-full min-h-screen space-y-4 justify-center items-center">
			<main className="flex flex-col min-w-max w-1/5 px-10 py-5 space-y-2.5 justify-center items-center rounded shadow bg-white full-border">
				<span className="login-heading">
					<button onClick={autofill}>{process.env.NEXT_PUBLIC_APPLICATION_NAME.toUpperCase()}</button>
				</span>

				<EmailAddress
					onChange={(e) => handleInputs("emailAddress", e.target.value)}
					reference={emailAddressReference}
					suffix=""
					tabIndex="1"
					value={userData.emailAddress}
					width="w-full"
				/>

				<Password
					eyeIconStyle={eyeIconStyle}
					eyeIconUi={uiEye}
					key={2}
					onChange={(e) => handleInputs("password", e.target.value)}
					reference={passwordReference}
					tabIndex="2"
					toggleCharacters={togglePasswordCharacters}
					type={passwordType}
					value={userData.password}
					width="w-full"
				/>

				<div className="flex w-full px-2 py-4 justify-center items-center">
					<button className={signInButtonClass} disabled={userData.isLoading} onClick={() => authenticate("click")} tabIndex={3}>
						{signInButtonLabel}
					</button>
				</div>
			</main>
			<footer className="flex w-full justify-center items-center">
				<span className="text-center font-regular-10 gray-text">&#169; Signiix Advisors</span>
			</footer>
		</div>
	);
}
