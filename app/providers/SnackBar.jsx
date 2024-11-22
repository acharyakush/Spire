"use client";

import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import MyConstants from "@/utilities/constants";

import { createContext, useContext, useState } from "react";

const SnackbarContext = createContext();

export const SnackbarProvider = ({ children }) => {
	const [snackbar, setSnackbar] = useState({
		message: "",
		open: false,
		severity: "info",
	});

	const hideSnackbar = () => {
		setSnackbar((old) => ({ ...old, open: false }));
	};

	const showSnackbar = (message, severity = MyConstants.NOTIFICATION_TYPES.info) => {
		setSnackbar({ message, open: true, severity });
	};

	return (
		<SnackbarContext.Provider value={showSnackbar}>
			{children}
			<Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "center" }} autoHideDuration={3000} onClose={hideSnackbar} open={snackbar.open}>
				<Alert className="!text-sm" onClose={hideSnackbar} severity={snackbar.severity} sx={{ width: "100%" }} variant="filled">
					<span dangerouslySetInnerHTML={{ __html: snackbar.message }} />
				</Alert>
			</Snackbar>
		</SnackbarContext.Provider>
	);
};

export const useSnackbar = () => useContext(SnackbarContext);
