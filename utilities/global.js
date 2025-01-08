"use client";

import axios from "axios";
import dayjs from "dayjs";
import MyConstants from "./constants";
import secureLocalStorage from "react-secure-storage";

import { toast } from "react-toastify";

const CryptoJS = require("crypto-js");
const encryptionIv = CryptoJS.enc.Hex.parse("00000000000000000000000000000000");
const encryptionKey = CryptoJS.enc.Hex.parse(process.env.NEXT_PUBLIC_SECRET_KEY);

export const applicationName = process.env.NEXT_PUBLIC_APPLICATION_NAME;
export const isDevelopment = process.env.NODE_ENV !== "production";

let allUsers = [];
let fullName = "";
let permissions = [];
let userId = "";
let userFullData = {};

export const MyGlobal = Object.freeze({
	AddActivity: async (activity, module = "General") => {
		try {
			const body = { activity, module, type: "add-user-activity", userId };
			await axios.post(MyConstants.ApiEndpoints.Setter, body, MyGlobal.GetHeaders());
		} catch (error) {
			MyGlobal.HandleErrors(error, "Add Activity");
		}
	},

	AllowOnlyAlphabetsAndSpace: (value) => {
		return String(value).replace(/[^A-Za-z\s]/g, "");
	},

	Capitalize: (payload) => {
		return !payload
			? ""
			: String(payload)
					.toLowerCase()
					.split(" ")
					.map((character) => character.charAt(0).toUpperCase() + character.slice(1))
					.join(" ");
	},

	ClearAllUserData: () => {
		MyGlobal.Storages.Local.RemoveAll();
		MyGlobal.Storages.Session.RemoveAll();
	},

	Decrypt: (encryptedValue) => {
		return CryptoJS.AES.decrypt(encryptedValue, encryptionKey, { iv: encryptionIv }).toString(CryptoJS.enc.Utf8);
	},

	Encrypt: (rawValue) => {
		return CryptoJS.AES.encrypt(rawValue, encryptionKey, { iv: encryptionIv }).toString();
	},

	EscapeString: (value) => {
		return String(value).replace(/'/g, "''");
	},

	ExtractNumbers: (value) => {
		return Number(String(value).replace(/[^0-9-]/g, ""));
	},

	FormatBytes: (bytes) => {
		if (bytes === 0) return "0 Bytes";

		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes.at(i);
	},

	FormatCurrency: (value) => {
		if (typeof value === "string") {
			const result = MyGlobal.GetNumbers(value);
			return result.toLocaleString("en-IN", { style: "currency", currency: "INR" });
		}

		return Number(value).toLocaleString("en-IN", { style: "currency", currency: "INR" });
	},

	GenerateYearForInvoiceId: () => {
		return `${dayjs(new Date()).format("YYYY")}-${dayjs(new Date()).set("year", 1)}`;
	},

	GetAllUsers: () => {
		return allUsers;
	},

	GetAffiliatesInitials: (payload, source = []) => {
		if (!source.length) return;

		let initials = "";
		const payloadArray = String(payload).split(",");

		initials = payloadArray
			.map((id) => {
				const object = source.find((affiliate) => affiliate.id == id);
				return affiliate ? MyGlobal.GetInitials(object.name) : "";
			})
			.filter(Boolean);

		return initials;
	},

	GetFullDetailsFromIds: (ids) => {
		const idsAsArray = String(ids).split(",");
		const idsArrayOfObjects = idsAsArray.map((value) => ({ id: value, label: "" }));
		const fullDetailsOfIds = allUsers.filter((user) => idsArrayOfObjects.some((_user) => _user.id == user.id));

		return fullDetailsOfIds;
	},

	GetAnyDataFromId: (id, type) => {
		if (String(id).includes(",")) {
			const names = [];
			const idsArray = String(id).split(",");

			idsArray.forEach((id) => {
				const object = allUsers.filter((user) => user.id == id).at(0);

				if (object) {
					names.push(object[type]);
				}
			});

			return names.join(", ");
		} else {
			const user = allUsers.filter((_user) => _user.id == id);
			return user.at(0)[type] ?? "Ex Employee";
		}
	},

	GetHeaders: (parameters) => {
		if (parameters) {
			return { maxBodyLength: Infinity, maxContentLength: Infinity, params: parameters };
		} else {
			return { maxBodyLength: Infinity, maxContentLength: Infinity };
		}
	},

	GetInitials: (payload) => {
		const initialsArray = [];
		const namesArray = String(payload).split(",");

		namesArray.forEach((word) => {
			const names = word.trim().split(" ");
			const initials = names.map((character) => character.charAt(0)).join("");
			initialsArray.push(initials);
		});

		return initialsArray;
	},

	GetModuleSequence: (module) => {
		return permissions.find((f) => f.module == module).sequence;
	},

	GetMultipleInitials: (payload) => {
		if (!payload) return "";

		const namesArray = String(payload).split(",");
		return namesArray.map((name) => MyGlobal.GetInitials(name.trim())).join(", ");
	},

	GetNumbers: (payload) => {
		return Number(String(payload).replace(/[^0-9]/g, ""));
	},

	GetStrings: (payload) => {
		return String(payload).replace(/[^a-zA-Z]/g, "");
	},

	GetTheme: () => {
		return MyGlobal.Storages.Local.Get(`${applicationName}Theme`);
	},

	GetUserData: () => {
		return userFullData;
	},

	GetUserFullName: () => {
		return fullName;
	},

	GetUserId: () => {
		return userId;
	},

	HandleErrors: async (error, source) => {
		console.error(source, error);

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
						message = error.response.statusText;
						break;
				}

				if (message.length) {
					MyGlobal.ShowToasts(MyConstants.ToastTypes.Error, message);
				}

				if (source) {
					try {
						await axios.post(MyConstants.ApiEndpoints.ErrorLogger, { errorText: error.response.statusText, source, userId });
					} catch (error) {
						console.error(error);
					}
				}
			}
		}
	},

	HasAlphabets: (payload) => {
		const regex = /^[a-zA-Z ]+$/;
		return regex.test(payload);
	},

	HasNumbers: (payload) => {
		const regex = /^[0-9]+$/;
		return regex.test(payload);
	},

	HasPermission: (permission) => {
		return permissions.filter((object) => object.name == permission).length > 0;
	},

	HighlightText: (payload, searchString) => {
		const regex = new RegExp(searchString.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");

		if (searchString) {
			return String(payload).replace(regex, (match) => `<span class='highlight-characters'>${match}</span>`);
		} else {
			return payload;
		}
	},

	IsApiCallMethodValid: (request) => {
		if (request.method === "GET") {
			return request.headers["sec-fetch-dest"] === "empty";
		}

		return Object.keys(request.body || {}).length > 0;
	},

	IsUserAdministrator: () => {
		return userFullData.role == "Administrator";
	},

	LogErrors: async (errorText, source) => {
		try {
			await axios.post(MyConstants.ApiEndpoints.ErrorLogger, { errorText, source, userId });
		} catch (error) {
			console.error(error);
		}
	},

	MakeNewInvoiceId: (payload) => {
		if (payload.length) {
			const getLatestId = [...payload].sort((a, b) => b.id.localeCompare(a.id)).at(0).id;

			if (!getLatestId) {
				return "00001";
			} else {
				const incrementedId = (parseInt(getLatestId, 10) + 1).toString();
				const newId = incrementedId.padStart(String(getLatestId).length, "0");

				return String(newId).padStart(5, "0");
			}
		} else {
			return "00001";
		}
	},

	SetAllUsers: (allUsersArray) => {
		allUsers = allUsersArray;
	},

	SetPermission: (permission) => {
		permissions = permission;
	},

	SetUserData: () => {
		const userDetails = MyGlobal.Storages.Local.DoesExist(`${applicationName}UserDetails`);

		if (userDetails) {
			const decryptedUserDetails = MyGlobal.Decrypt(userDetails);
			const parsedUserDetails = JSON.parse(decryptedUserDetails);

			userId = parsedUserDetails.id;
			fullName = parsedUserDetails.full_name;
			userFullData = parsedUserDetails;
		}
	},

	SetUserStatus: async (status) => {
		if (!MyGlobal.IsUserAdministrator()) {
			const body = { status, type: "set-user-status", userId };
			axios.post(MyConstants.ApiEndpoints.Setter, body, MyGlobal.GetHeaders());
		}
	},

	SeparateObjectsIntoArrays: (array, chunkSize) => {
		const result = [];

		for (let i = 0; i < array.length; i += chunkSize) {
			const chunk = array.slice(i, i + chunkSize);
			result.push(chunk);
		}

		return result;
	},

	ShowErrorToast: (message) => {
		MyGlobal.ShowToasts(MyConstants.ToastTypes.Error, message);
	},

	ShowInformationToast: (message) => {
		MyGlobal.ShowToasts(MyConstants.ToastTypes.Information, message);
	},

	ShowSuccessToast: (message) => {
		MyGlobal.ShowToasts(MyConstants.ToastTypes.Success, message);
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

	ShowWarningToast: (message) => {
		MyGlobal.ShowToasts(MyConstants.ToastTypes.Warning, message);
	},

	Storages: {
		Local: {
			DoesExist: (key) => (!isDevelopment ? secureLocalStorage.get(key) : globalThis.localStorage.getItem(key)),
			Get: (key) => (!isDevelopment ? secureLocalStorage.get(key) : globalThis.localStorage.getItem(key)),
			Remove: (key) => (!isDevelopment ? secureLocalStorage.remove(key) : globalThis.localStorage.removeItem(key)),
			RemoveAll: () => {
				for (let i = 0; i < globalThis.localStorage.length; i++) {
					const key = globalThis.localStorage.key(i) || "";

					if (key && key.startsWith(applicationName)) {
						!isDevelopment ? secureLocalStorage.remove(key) : globalThis.localStorage.removeItem(key);
						i--;
					}
				}

				globalThis.console.clear();
			},
			Set: (key, value) => (!isDevelopment ? secureLocalStorage.set(key, value) : globalThis.localStorage.setItem(key, value)),
		},
		Session: {
			DoesExist: (key) => globalThis.sessionStorage.getItem(key) !== null,
			Get: (key) => globalThis.sessionStorage.getItem(key),
			Remove: (key) => globalThis.sessionStorage.removeItem(key),
			RemoveAll: () => {
				for (let i = 0; i < globalThis.sessionStorage.length; i++) {
					const key = globalThis.sessionStorage.key(i) || "";

					if (key && key.startsWith(applicationName)) {
						!isDevelopment ? secureLocalStorage.remove(key) : globalThis.sessionStorage.removeItem(key);
						i--;
					}
				}

				globalThis.console.clear();
			},
			Set: (key, value) => globalThis.sessionStorage.setItem(key, value),
		},
	},

	StripHtmlTags: (payload) => {
		const regex = /<\/?[^>]+>/gi;
		return String(payload).replace(regex, "");
	},

	ThousandSeparator: (payload) => {
		const value = MyGlobal.GetNumbers(payload);
		return new Intl.NumberFormat("en-IN").format(value);
	},

	ValidateEmailAddress(emailAddress) {
		const _emailAddress = String(emailAddress);

		if (!_emailAddress.includes("@")) {
			return { hasError: true, text: MyConstants.Messages.NoAtSymbolInEmailAddress };
		}

		if (!_emailAddress.includes(".")) {
			return { hasError: true, text: MyConstants.Messages.NoPeriodSymbolInEmailAddress };
		}

		const emailRegex = /^[a-zA-Z0-9._%+-]+@(admins\.spire\.com|spire\.com)$/;

		if (!emailRegex.test(_emailAddress)) {
			return { hasError: true, text: MyConstants.Messages.SpireDomainOnly };
		}

		return { hasError: false, text: "" };
	},
});
