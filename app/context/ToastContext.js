"use client";

// Imports
import { Toast } from "primereact/toast";
import { MyGlobal } from "@/utilities/global";
import { createContext, useContext, useRef } from "react";

// Create Context
const ToastContext = createContext();

// Component
export const ToastProvider = ({ children }) => {
	const toastRef = useRef(null);

	const showToast = (message, severity) => {
		toastRef.current?.show({
			severity,
			summary: MyGlobal.capitalize(severity),
			detail: message,
			life: 3000,
		});
	};

	return (
		<ToastContext.Provider value={showToast}>
			{children}
			<Toast position="bottom-center" ref={toastRef} />
		</ToastContext.Provider>
	);
};

// Custom Hook
export const useToast = () => useContext(ToastContext);
