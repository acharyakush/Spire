"use client";

import "./globals.css";
import MyTheme from "@/utilities/theme";

import { createContext } from "react";
import { ConfigProvider, notification } from "antd";
import { AntdRegistry } from "@ant-design/nextjs-registry";

export const NotificationContext = createContext({
	openNotification: () => {},
});

export default function RootLayout({ children }) {
	const [api, contextHolder] = notification.useNotification();

	const openNotificationWithIcon = (description, message, type) => {
		api[type]({ description, duration: 5, message, placement: "top", style: { fontFamily: "'Inter', sans-serif" } });
	};

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<title>Welcome | Spire</title>
			</head>
			<body>
				<NotificationContext.Provider value={{ openNotification: openNotificationWithIcon }}>
					{contextHolder}
					<AntdRegistry>
						<ConfigProvider theme={MyTheme}>{children}</ConfigProvider>
					</AntdRegistry>
				</NotificationContext.Provider>
			</body>
		</html>
	);
}
