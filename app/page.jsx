"use client";

import dayjs from "dayjs";
import axios from "axios";
import MyConstants from "@/utilities/constants";

import { LoadingButton } from "@mui/lab";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSnackbar } from "./providers/SnackBar";
import { applicationName, isDevelopment, MyGlobal } from "@/utilities/global";
import { VisibilityOffRounded, VisibilityRounded } from "@mui/icons-material";
import { FilledInput, FormControl, IconButton, InputAdornment, InputLabel, TextField, Typography } from "@mui/material";

export default function Home() {
	// Business Logic
	const router = useRouter();
	const showSnackbar = useSnackbar();

	const [emailAddress, setEmailAddress] = useState({ error: "", value: "" });
	const [flags, setFlags] = useState({ isLoading: false });
	const [password, setPassword] = useState({ value: "", show: false });

	// Functions
	const autofill = () => {
		if (isDevelopment) {
			setEmailAddress((old) => ({ ...old, value: "kush@admins.spire.com" }));
			setPassword((old) => ({ ...old, value: "acharyakush2604" }));
		}
	};

	const authenticate = async () => {
		const emailAddressValidation = MyGlobal.validateEmailAddress(emailAddress.value);

		if (!emailAddress.value) {
			showSnackbar(MyConstants.MESSAGES.noEmailAddress, MyConstants.NOTIFICATION_TYPES.error);
		} else if (emailAddressValidation.hasError) {
			showSnackbar(emailAddressValidation.text, MyConstants.NOTIFICATION_TYPES.error);
		} else if (!password.value) {
			showSnackbar(MyConstants.MESSAGES.noPassword, MyConstants.NOTIFICATION_TYPES.error);
		} else {
			setEmailAddress((old) => ({ ...old, error: "" }));
			setFlags((old) => ({ ...old, isLoading: true }));

			const currentTimestamp = dayjs().format("hh:mm:ss a DD-MM-YYYY");
			const sessionToken = MyGlobal.obfuscate(`${currentTimestamp}${emailAddress}${password}`);

			const jsonBody = JSON.stringify({ emailAddress, password });
			const body = { credentials: MyGlobal.obfuscate(jsonBody) };

			try {
				const response = await axios.post(MyConstants.API_ENDPOINTS.authenticate, body);

				if (response.status === 200) {
					const userDetails = MyGlobal.deobfuscate(response.data);
					const jsonUserDetails = JSON.parse(userDetails);

					MyGlobal.Storages.local.set(`${applicationName.toLocaleLowerCase()}_user_details`, response.data);
					MyGlobal.addActivity({ activity: "Logged in.", session_id: sessionToken, user_id: jsonUserDetails.user.id });

					router.replace("/home");
				}
			} catch (error) {
				if ("response" in error) {
					if ("object" in error.response.data) {
						showSnackbar(error.response.data.object.name, MyConstants.NOTIFICATION_TYPES.error);
					} else {
						showSnackbar(error.response.data.error, MyConstants.NOTIFICATION_TYPES.error);
					}
				}
			} finally {
				setFlags((old) => ({ ...old, isLoading: false }));
			}
		}
	};

	const setValues = (event) => {
		if (event.target.id === "email-address") {
			setEmailAddress((old) => ({ ...old, value: event.target.value }));
		} else {
			setPassword((old) => ({ ...old, value: event.target.value }));
		}
	};

	const togglePasswordCharacters = () => {
		setPassword((old) => ({ ...old, show: !password.show }));
	};

	// Hooks
	useEffect(() => {
		MyGlobal.Storages.local.removeAll();
	}, []);

	// Main UI
	return (
		<div className="flex w-screen min-h-screen p-4 justify-center items-center bg-slate-200">
			<div className="w-1/4 p-8 space-y-6 rounded shadow-sm bg-white">
				<div className="flex flex-col w-full justify-center items-center">
					<Typography className="!font-bold" onClick={autofill} variant="h3">
						{process.env.NEXT_PUBLIC_APPLICATION_NAME}
					</Typography>
				</div>

				<TextField
					color={emailAddress.error ? "error" : "primary"}
					error={emailAddress.error}
					fullWidth
					label="Email Address"
					id="email-address"
					name="email-address"
					onChange={setValues}
					type="email"
					value={emailAddress.value}
				/>

				<FormControl fullWidth>
					<InputLabel htmlFor="password">Password</InputLabel>
					<FilledInput
						autoComplete="current-password"
						endAdornment={
							<InputAdornment position="end">
								<IconButton onClick={togglePasswordCharacters}>
									{password.show ? <VisibilityOffRounded /> : <VisibilityRounded />}
								</IconButton>
							</InputAdornment>
						}
						fullWidth
						id="password"
						label="Password"
						name="password"
						onChange={setValues}
						type={password.show ? "text" : "password"}
						value={password.value}
					/>
				</FormControl>

				<FormControl className="flex justify-center items-center" fullWidth variant="standard">
					<LoadingButton disabled={flags.isLoading} loading={flags.isLoading} onClick={authenticate} size="medium" variant="contained">
						Authenticate
					</LoadingButton>
				</FormControl>
			</div>
		</div>
	);
}
