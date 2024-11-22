"use client";

import "./globals.css";
import theme from "@/utilities/theme";

import { SnackbarProvider } from "./providers/SnackBar";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";

export default function RootLayout({ children }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<title>Welcome | Spire</title>
			</head>
			<body>
				<AppRouterCacheProvider>
					<ThemeProvider theme={theme}>
						<CssBaseline enableColorScheme />
						<SnackbarProvider>{children}</SnackbarProvider>
					</ThemeProvider>
				</AppRouterCacheProvider>
			</body>
		</html>
	);
}
