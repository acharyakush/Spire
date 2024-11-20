"use client";

import dayjs from "dayjs";
import axios from "axios";
import MyConstants from "@/utilities/constants";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Form, Input, Typography } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";
import { applicationName, isDevelopment, MyGlobal } from "@/utilities/global";

export default function Home() {
	// Business Logic
	const router = useRouter();
	const { Title } = Typography;

	const [form] = Form.useForm();
	const [data, setData] = useState({ error: "", isLoading: false });

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
			setData((old) => ({ ...old, error: "Please enter your Spire account's email address." }));
		} else if (emailAddressValidation.hasError) {
			setData((old) => ({ ...old, error: emailAddressValidation.text }));
		} else if (!password) {
			setData((old) => ({ ...old, error: "Please enter your Spire account's password." }));
		} else {
			setData((old) => ({ ...old, error: "", isLoading: true }));

			const currentTimestamp = dayjs().format("hh:mm:ss a DD-MM-YYYY");
			const sessionToken = MyGlobal.obfuscate(`${currentTimestamp}${emailAddress}${password}`);

			const jsonBody = JSON.stringify({ emailAddress, password });
			const body = { credentials: MyGlobal.obfuscate(jsonBody) };

			try {
				const response = await axios.post(MyConstants.apiEndpoints.authenticate, body);

				if (response.status === 200) {
					MyGlobal.Storages.local.set(`${applicationName}_user_details`, JSON.stringify(response.data));
					MyGlobal.Storages.session.set(`${applicationName}_token`, sessionToken);
					MyGlobal.addActivity({ activity: "Logged in.", session_id: sessionToken, user_id: response.data.user_id });

					router.replace("/home");
				}
			} catch (error) {
				console.error("Authentication failed:", error);
			} finally {
				setData((s) => ({ ...s, error: "", isLoading: false }));
			}
		}
	};

	const signInLabel = data.isLoading ? "Signing In ..." : "Sign In";

	// Main UI
	return (
		<div className="flex w-screen min-h-screen p-4 justify-center items-center">
			<div className="w-1/4 p-4 shadow-sm">
				<span className="flex w-full justify-center items-center">
					<Title level={2} onClick={autofill}>
						Welcome to {process.env.NEXT_PUBLIC_APPLICATION_NAME}
					</Title>
				</span>

				<Form form={form} initialValues={{ remember: true }} layout="vertical" name="login" onFinish={authenticate}>
					<Form.Item label="Email Address" name="email-address" rules={[{ message: data.error }]}>
						<Input prefix={<FontAwesomeIcon icon={faEnvelope} />} variant="filled" />
					</Form.Item>

					<Form.Item label="Password" name="password" rules={[{ message: data.error }]}>
						<Input prefix={<FontAwesomeIcon icon={faLock} />} type="password" variant="filled" />
					</Form.Item>

					<Form.Item>
						<Button block htmlType="submit" loading={data.isLoading} type="primary">
							{signInLabel}
						</Button>
					</Form.Item>
				</Form>
			</div>
		</div>
	);
}
