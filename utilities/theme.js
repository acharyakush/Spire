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
				variant: "filled",
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
				variant: "filled",
			},
		},
	},
	cssVariables: true,
	typography: {
		fontFamily: "'Inter', sans-serif",
		fontSize: 13,
	},
});

export default theme;
