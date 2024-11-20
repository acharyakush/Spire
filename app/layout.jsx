import "./globals.css";
import MyTheme from "@/utilities/theme";

import { ConfigProvider } from "antd";
import { AntdRegistry } from "@ant-design/nextjs-registry";

export const metadata = {
	title: "Welcome | Spire",
	description: "Developed, owned and maintained by and for Signiix Advisors.",
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body>
				<AntdRegistry>
					<ConfigProvider theme={MyTheme}>{children}</ConfigProvider>
				</AntdRegistry>
			</body>
		</html>
	);
}
