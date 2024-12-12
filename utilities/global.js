"use client";

import axios from "axios";
import crypto from "crypto";
import MyConstants from "./constants";
import secureLocalStorage from "react-secure-storage";

import { toast } from "react-toastify";

export const applicationName = process.env.NEXT_PUBLIC_APPLICATION_NAME;
export const isDevelopment = process.env.NODE_ENV !== "production";

export const MyGlobal = Object.freeze({
	async AddActivity(activityData) {
		try {
			await axios.post(MyConstants.ApiEndpoints.AddActivity, JSON.stringify(activityData), { headers: { "Content-Type": "application/json" } });
		} catch (error) {
			console.error("Error calling Add Activity API:", error);
		}
	},

	AllowOnlyAlphabetsAndSpace(value) {
		return String(value).replace(/[^A-Za-z\s]/g, "");
	},

	Capitalize(payload) {
		return !payload
			? ""
			: String(payload)
					.toLowerCase()
					.split(" ")
					.map((character) => character.charAt(0).toUpperCase() + character.slice(1))
					.join(" ");
	},

	ClearAllUserData: () => {
		MyGlobal.Storages.Local.removeAll();
	},

	Deobfuscate(obfuscated) {
		const obfuscatedBytes = Uint8Array.from(Buffer.from(obfuscated, "base64"));
		const secretBytes = new TextEncoder().encode(process.env.NEXT_PUBLIC_SECRET_KEY);
		const originalBytes = new Uint8Array(obfuscatedBytes.length);

		for (let i = 0; i < obfuscatedBytes.length; i++) {
			originalBytes[i] = obfuscatedBytes[i] ^ secretBytes[i % secretBytes.length];
		}

		return new TextDecoder().decode(originalBytes);
	},

	async GetAnyData(apiEndpoint, tableNames) {
		let result = { data: [], statusCode: 0 };

		try {
			const parameters = { table: tableNames };
			const response = await axios.get(apiEndpoint, { params: parameters });

			result.data = response.data;
			result.statusCode = response.status;
		} catch (error) {
			result.data = error;
			result.statusCode = error.response.status;
		}

		return result;
	},

	GetLoggedInUserDetails() {
		const loggedInUserDetails = this.Storages.Local.doesExist(`${applicationName.toLocaleLowerCase()}_user_details`);

		if (loggedInUserDetails) {
			const userDetails = this.Storages.Local.get(`${applicationName.toLocaleLowerCase()}_user_details`);
			const parsedUserDetails = typeof userDetails === "string" && JSON.parse(userDetails);

			return parsedUserDetails;
		}
	},

	HandleErrors: (error, source) => {
		console.error(error);

		if (source != "Single Client Files") {
			if ("response" in error) {
				if ("status" in error.response) {
					let message = "";

					switch (error.response.status) {
						case 400:
							message = MyConstants.Messages.BadRequest;
							break;
						case 401:
							message = MyConstants.Messages.InvalidUser;
							break;
						case 403:
							message = MyConstants.Messages.AccessRevoked;
							break;
						case 404:
							message = MyConstants.Messages.NoDataFound;
							break;
						case 500:
							console.log("");
							break;
					}
				}
			}
		} else {
			console.error(error);
		}

		if (source) {
			axios
				.post(MyConstants.ApiEndpoints.LogError, {
					message: error.response.statusText,
					clientId: MyGlobal.GetLoggedInUserDetails()?.user?.id,
					source,
				})
				.catch((error) => console.error(error));
		}
	},

	async HashPassword(password) {
		if (!password) throw new Error("Password cannot be empty");

		const salt = crypto.randomBytes(16).toString("hex");
		const derivedKey = await pbkdf2Async(password, salt);

		return `${salt}:${derivedKey}`;
	},

	Obfuscate(input) {
		const inputBytes = new TextEncoder().encode(input);
		const secretBytes = new TextEncoder().encode(process.env.NEXT_PUBLIC_SECRET_KEY);
		const obfuscatedBytes = new Uint8Array(inputBytes.length);

		for (let i = 0; i < inputBytes.length; i++) {
			obfuscatedBytes[i] = inputBytes[i] ^ secretBytes[i % secretBytes.length];
		}

		return Buffer.from(obfuscatedBytes).toString("base64");
	},

	Pbkdf2Async(password, salt) {
		return new Promise((resolve, reject) => {
			crypto.pbkdf2(password, salt, 100000, 64, "sha512", (err, derivedKey) => {
				if (err) return reject(new Error("Error generating hash"));
				resolve(derivedKey.toString("hex"));
			});
		});
	},

	ShowToasts: (type, message) => {
		toast(message, {
			position: "bottom-right",
			autoClose: 2000,
			icon: true,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: false,
			draggable: false,
			progress: undefined,
			closeButton: true,
			theme: "colored",
			type: type,
			toastId: `${type}_toast`,
		});
	},

	Storages: {
		Local: {
			doesExist: (key) => (!isDevelopment ? secureLocalStorage.get(key) : globalThis.localStorage.getItem(key)),
			get: (key) => (!isDevelopment ? secureLocalStorage.get(key) : globalThis.localStorage.getItem(key)),
			remove: (key) => (!isDevelopment ? secureLocalStorage.remove(key) : globalThis.localStorage.removeItem(key)),
			removeAll: () => {
				for (let i = 0; i < globalThis.localStorage.length; i++) {
					const key = globalThis.localStorage.key(i) || "";

					if (key && key.startsWith(applicationName.toLowerCase())) {
						!isDevelopment ? secureLocalStorage.remove(key) : globalThis.localStorage.removeItem(key);
						i--;
					}
				}

				globalThis.console.clear();
			},
			set: (key, value) => (!isDevelopment ? secureLocalStorage.set(key, value) : globalThis.localStorage.setItem(key, value)),
		},
		Session: {
			doesExist: (key) => globalThis.sessionStorage.getItem(key) !== null,
			get: (key) => globalThis.sessionStorage.getItem(key),
			remove: (key) => globalThis.sessionStorage.removeItem(key),
			removeAll: () => {
				MyGlobal.usedSessionStorageKeys.forEach((e) => globalThis.sessionStorage.removeItem(e));
				globalThis.console.clear();
			},
			set: (key, value) => globalThis.sessionStorage.setItem(key, value),
		},
	},

	ValidateEmailAddress(emailAddress) {
		const _emailAddress = String(emailAddress);

		if (!_emailAddress.includes("@")) {
			return {
				hasError: true,
				text: MyConstants.Messages.noAtSymbolInEmailAddress,
			};
		}

		if (!_emailAddress.includes(".")) {
			return {
				hasError: true,
				text: MyConstants.Messages.noPeriodSymbolInEmailAddress,
			};
		}

		const emailRegex = /^[a-zA-Z0-9._%+-]+@(admins\.spire\.com|spire\.com)$/;

		if (!emailRegex.test(_emailAddress)) {
			return {
				hasError: true,
				text: MyConstants.Messages.spireDomainOnly,
			};
		}

		return { hasError: false, text: "" };
	},

	async VerifyPassword(storedHash, password) {
		if (!storedHash || !password) return false;

		if (typeof storedHash === "string") {
			const [salt, originalHash] = storedHash.split(":");
			const derivedKey = await pbkdf2Async(password, salt);

			return originalHash === derivedKey;
		}
	},
});
