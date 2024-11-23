"use client";

// Imports
import "./globals.css";
import theme from "@/utilities/theme";

import { SnackbarProvider } from "./providers/SnackBar";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";

// Component
export default function RootLayout({ children }) {
	// Main UI
	return (
		<html suppressHydrationWarning>
			<head>
				<title>Welcome :: Spire</title>
			</head>
			<body>
				<AppRouterCacheProvider>
					<ThemeProvider theme={theme}>
						<SnackbarProvider>
							<CssBaseline enableColorScheme />
							{children}
						</SnackbarProvider>
					</ThemeProvider>
				</AppRouterCacheProvider>
			</body>
		</html>
	);
}
