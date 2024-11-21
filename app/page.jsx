"use client";

import dayjs from "dayjs";
import axios from "axios";
import MyConstants from "@/utilities/constants";

import { useRouter } from "next/navigation";
import { NotificationContext } from "./layout";
import { Button, Form, Input, Typography } from "antd";
import { useContext, useEffect, useState } from "react";
import { applicationName, isDevelopment, MyGlobal } from "@/utilities/global";

export default function Home() {
	// Business Logic
	const router = useRouter();

	const { Title } = Typography;
	const { openNotification } = useContext(NotificationContext);

	const [form] = Form.useForm();
	const [data, setData] = useState({ error: "", isLoading: false });

	const signInLabel = data.isLoading ? "Signing In ..." : "Sign In";

	// Functions
	const autofill = () => {
		if (isDevelopment) {
			form.setFieldsValue({ "email-address": "kush@admins.spire.com", password: "acharyakush2604" });
		}
	};

	const authenticate = async (formValues) => {
		const emailAddress = formValues["email-address"];
		const password = formValues?.password;
		const emailAddressValidation = MyGlobal.validateEmailAddress(emailAddress);

		if (!emailAddress) {
			openNotification("Type your Spire account's email address.", "Email Address", MyConstants.NOTIFICATION_TYPES.error);
		} else if (emailAddressValidation.hasError) {
			openNotification(emailAddressValidation.text, "Email Address", MyConstants.NOTIFICATION_TYPES.error);
		} else if (!password) {
			openNotification("Type your Spire account's password.", "Password", MyConstants.NOTIFICATION_TYPES.error);
		} else {
			setData((old) => ({ ...old, error: "", isLoading: true }));

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
						openNotification(error.response.data.object.name, "Authentication Failed", MyConstants.NOTIFICATION_TYPES.error);
					} else {
						openNotification(error.response.data.error, "Authentication Failed", MyConstants.NOTIFICATION_TYPES.error);
					}
				}
			} finally {
				setData((s) => ({ ...s, error: "", isLoading: false }));
			}
		}
	};

	// Hooks
	useEffect(() => {
		MyGlobal.Storages.local.removeAll();
	}, []);

	// Main UI
	return (
		<div className="flex w-screen min-h-screen p-4 justify-center items-center bg-slate-200">
			<div className="w-1/4 p-8 pb-4 rounded shadow-sm bg-white">
				<div className="flex flex-col w-full pb-4 space-y-px justify-center items-center">
					<Title className="!font-bold" onClick={autofill}>
						{process.env.NEXT_PUBLIC_APPLICATION_NAME}
					</Title>
				</div>

				<Form form={form} initialValues={{ remember: true }} layout="vertical" name="login" onFinish={authenticate}>
					<Form.Item label="Email Address" name="email-address">
						<Input variant="filled" />
					</Form.Item>

					<Form.Item label="Password" name="password">
						<Input.Password variant="filled" />
					</Form.Item>

					<Form.Item className="flex h-12 justify-center items-end">
						<Button disabled={data.isLoading} htmlType="submit" loading={data.isLoading} type="primary">
							{signInLabel}
						</Button>
					</Form.Item>
				</Form>
			</div>
		</div>
	);
}
