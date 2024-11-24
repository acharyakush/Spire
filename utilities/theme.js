"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
	components: {
		MuiButtonBase: {
			defaultProps: {
				disableRipple: true,
			},
		},
		MuiFormControl: {
			defaultProps: {
				size: "small",
				variant: "outlined",
			},
		},
		MuiInputBase: {
			defaultProps: {
				size: "small",
			},
		},
		MuiTextField: {
			defaultProps: {
				size: "small",
				variant: "outlined",
			},
		},
	},
	cssVariables: true,
	typography: {
		fontFamily: "'Inter', sans-serif",
		fontSize: 14,
		fontWeightLight: 100, // Lightest
		fontWeightRegular: 400, // Regular
		fontWeightMedium: 500, // Medium
		fontWeightBold: 700, // Bold
		fontWeightBlack: 900,
	},
});

export default theme;
