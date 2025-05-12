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
export const allowedKeysForOnKeyPressEvent = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];

let allUsers = [];
let fullName = "";
let permissions = [];
let userId = "";
let userFullData = {};

const getSafeRegex = (() => {
	const cache = new Map();

	return (searchString) => {
		if (!searchString) return null;
		if (cache.has(searchString)) return cache.get(searchString);

		const escaped = searchString.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		const regex = new RegExp(escaped, "gi");

		cache.set(searchString, regex);

		return regex;
	};
})();

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
		const formatOptions = {
			style: "currency",
			currency: "INR",
			minimumFractionDigits: 0,
			maximumFractionDigits: 2,
		};

		const numberValue = typeof value === "string" ? MyGlobal.GetNumbers(value) : Number(value);
		const formattedValue = numberValue.toLocaleString("en-IN", formatOptions);

		return formattedValue.includes(".00") ? formattedValue.replace(".00", "") : formattedValue;
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
			.map((m, i) => {
				const object = source.find((f) => f.id == m);

				if (object) {
					if (i != payloadArray.length - 1) {
						return `${MyGlobal.GetInitials(object.name)}, `;
					} else {
						return MyGlobal.GetInitials(object.name);
					}
				} else {
					return "";
				}
			})
			.filter(Boolean);

		return initials;
	},

	GetAnyDataFromId: (id, type) => {
		if (id) {
			const _id = String(id);

			if (_id.includes(",")) {
				const names = [];
				const idsArray = _id.split(",");

				idsArray.forEach((fe) => {
					const object = allUsers.find((f) => f.id == fe);

					if (typeof object === "object") {
						names.push(object[type]);
					}
				});

				return names.join(", ");
			} else {
				const user = allUsers.find((f) => f.id == id);
				return user[type] ?? "Ex User";
			}
		} else {
			return "";
		}
	},

	GetBankName(id, list) {
		let name = "";

		if (Array.isArray(list) && list.length) {
			const object = list.find((f) => f.id === id);

			if (typeof object === "object") {
				if ("name" in object) {
					name = object.name;
				}
			}
		}

		return name;
	},

	GetChangedValues(obj1, obj2, path = "") {
		const changes = [];

		for (const key in obj1) {
			const currentPath = path ? `${path}.${key}` : key;

			if (obj1[key] && typeof obj1[key] === "object" && !Array.isArray(obj1[key])) {
				changes.push(...this.GetChangedValues(obj1[key], obj2[key], currentPath));
			} else if (obj1[key] !== obj2[key]) {
				changes.push(currentPath);
			}
		}

		return changes;
	},

	GetFullDetailsFromIds: (ids) => {
		let array = [];
		const _ids = String(ids);

		if (_ids.includes(",")) {
			const idsAsArray = _ids.split(",");
			const idsArrayOfObjects = idsAsArray.map((m) => ({ id: m, label: "" }));

			array = allUsers.filter((f) => idsArrayOfObjects.some((s) => s.id == f.id));
		} else {
			array = allUsers.filter((f) => f.id == ids);
		}

		return array;
	},

	GetHeaders: (parameters) => {
		if (parameters) {
			return { maxBodyLength: Infinity, maxContentLength: Infinity, params: parameters };
		} else {
			return { maxBodyLength: Infinity, maxContentLength: Infinity };
		}
	},

	GetInitials: (payload) => {
		let result = [];

		String(payload)
			.split(",")
			.forEach((fe) => {
				const names = fe.trim().split(" ");
				const initials = names
					.map((m) => m.charAt(0))
					.join("")
					.replace(/[^A-Za-z0-9]/g, "");

				result.push(initials);
			});

		return result;
	},

	GetMultipleInitials: (payload) => {
		if (!payload) return "";

		const namesArray = String(payload).split(",");
		return namesArray.map((name) => MyGlobal.GetInitials(name.trim())).join(", ");
	},

	GetNameFromId: (id, source = []) => {
		let name = "";

		if (source.length) {
			const object = source.find((f) => f.id == id);

			if (typeof object === "object") {
				name = object.name;
			}
		}

		return name;
	},

	GetNumbers: (payload) => {
		return Number(String(payload).replace(/[^0-9.-]/g, ""));
	},

	GetBasicPaymentSourceList: () => {
		return [
			{ id: "CASH", name: "Cash" },
			{ id: "CHEQUE", name: "Cheque" },
			{ id: "CC", name: "Credit Card" },
			{ id: "DC", name: "Debit Card" },
			{ id: "INSTAMOJO", name: "InstaMojo" },
			{ id: "NETBANKING", name: "NetBanking" },
			{ id: "UPI", name: "UPI" },
		];
	},

	GetRevisedPaymentSourceList: (payload) => {
		const list = [...payload];

		list.push(
			{ id: "CASH", name: "Cash" },
			{ id: "CHEQUE", name: "Cheque" },
			{ id: "CC", name: "Credit Card" },
			{ id: "DC", name: "Debit Card" },
			{ id: "INSTAMOJO", name: "InstaMojo" },
			{ id: "NETBANKING", name: "NetBanking" },
			{ id: "UPI", name: "UPI" },
		);

		return list;
	},

	GetStrings: (payload) => {
		return String(payload).replace(/[^a-zA-Z]/g, "");
	},

	GetTheme: () => {
		return MyGlobal.Storages.Local.Get(`${applicationName}Theme`);
	},

	GetUserData: () => {
		const userData = MyGlobal.Storages.Local.DoesExist(`${applicationName}UserDetails`);

		if (userData) {
			const decrypted = MyGlobal.Decrypt(userData);
			const parsed = JSON.parse(decrypted);

			userId = parsed.id;
			fullName = parsed.full_name;
			userFullData = parsed;

			return parsed;
		}

		return {};
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

				if (source == "Single Project => Map Affiliates") {
					message = error.response.statusText;
				}

				if (message.length) {
					if (source != "Single Client => Set Uploaded Files") {
						MyGlobal.ShowToasts(MyConstants.ToastTypes.Error, message);
					}
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
		const has = permissions.filter((f) => f.name == permission);
		const has_ = has.length;
		const has__ = has_ > 0;

		return has__;
	},

	HighlightText: (payload, searchString) => {
		const regex = getSafeRegex(searchString);

		if (!regex) return payload;

		return String(payload).replace(regex, (m) => `<span class='highlight-characters'>${m}</span>`);
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

	MakeNewInvoiceId: (firmName, payload) => {
		if (payload.length) {
			const initials = MyGlobal.GetInitials(firmName).at(0);

			const target = [...payload].filter((f) => {
				const customIdInitials = String(f.custom_id).split("/").at(0);

				if (String(initials).startsWith(customIdInitials)) {
					return f;
				}
			});

			if (!target.length) {
				return "00001";
			} else {
				const extractedIds = [];

				target.forEach((m) => {
					const getLastUsedId = String(m.custom_id).split("/").at(2);
					const extractNumber = +getLastUsedId.match(/\d+$/)[0].replace(/0/g, "");

					extractedIds.push(extractNumber);
				});

				const latestId = extractedIds.sort((a, b) => b - a).at(0);
				const incrementedId = (parseInt(latestId, 10) + 1).toString();
				const newId = incrementedId.padStart(String(latestId).length, "0");

				return String(newId).padStart(5, "0");
			}
		} else {
			return "00001";
		}
	},

	MakeNewQuotationId: (payload) => {
		if (payload.length) {
			const extractedIds = payload.map((m) => {
				const idPart = String(m.custom_id).split("/").at(2) || "";
				const match = idPart.match(/\d+$/);
				return match ? parseInt(match[0], 10) : 0;
			});

			const latestId = Math.max(...extractedIds);
			const nextId = latestId + 1;

			if (nextId > 999) return "999";

			return String(nextId).padStart(3, "0");
		} else {
			return "001";
		}
	},

	NumberToWordsIndian(num) {
		if (num === 0) return "Zero Rupees Only";

		const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
		const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
		const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];

		const words = [];

		function addPart(n, label) {
			if (n > 0) {
				if (n < 10) words.push(ones[n]);
				else if (n < 20) words.push(teens[n - 10]);
				else words.push(tens[Math.floor(n / 10)], ones[n % 10]);
				if (label) words.push(label);
			}
		}

		const crore = Math.floor(num / 10000000);
		const lakh = Math.floor((num / 100000) % 100);
		const thousand = Math.floor((num / 1000) % 100);
		const hundred = Math.floor((num / 100) % 10);
		const rest = Math.floor(num % 100);

		addPart(crore, "Crore");
		addPart(lakh, "Lakh");
		addPart(thousand, "Thousand");
		if (hundred) words.push(ones[hundred], "Hundred");
		if (rest && words.length) words.push("and");
		addPart(rest, "");

		words.push("Rupees Only");
		return words.filter(Boolean).join(" ");
	},

	SetAllUsers: (allUsersArray) => {
		allUsers = allUsersArray;
	},

	SetPermission: (_permission) => {
		permissions = _permission;
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
			DoesExist: (key) => (!isDevelopment ? secureLocalStorage.getItem(key) : globalThis.localStorage.getItem(key)),
			Get: (key) => (!isDevelopment ? secureLocalStorage.getItem(key) : globalThis.localStorage.getItem(key)),
			Remove: (key) => (!isDevelopment ? secureLocalStorage.removeItem(key) : globalThis.localStorage.removeItem(key)),
			RemoveAll: () => {
				const keysToRemove = [];

				for (let i = 0; i < globalThis.localStorage.length; i++) {
					const key = globalThis.localStorage.key(i) || "";
					if (key && key.startsWith(applicationName)) {
						keysToRemove.push(key);
					}
				}

				keysToRemove.forEach((key) => {
					!isDevelopment ? secureLocalStorage.removeItem(key) : globalThis.localStorage.removeItem(key);
				});

				globalThis.console.clear();
			},

			Set: (key, value) => (!isDevelopment ? secureLocalStorage.setItem(key, value) : globalThis.localStorage.setItem(key, value)),
		},
		Session: {
			DoesExist: (key) => globalThis.sessionStorage.getItem(key) !== null,
			Get: (key) => globalThis.sessionStorage.getItem(key),
			Remove: (key) => globalThis.sessionStorage.removeItem(key),
			RemoveAll: () => {
				const keysToRemove = [];

				for (let i = 0; i < globalThis.sessionStorage.length; i++) {
					const key = globalThis.sessionStorage.key(i) || "";
					if (key && key.startsWith(applicationName)) {
						keysToRemove.push(key);
					}
				}

				keysToRemove.forEach((key) => {
					!isDevelopment ? secureLocalStorage.removeItem(key) : globalThis.sessionStorage.removeItem(key);
				});

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
		return new Intl.NumberFormat("en-IN", { signDisplay: "auto" }).format(value);
	},

	TrimInnerSpace: (value) => {
		return String(value).replace(/\s/g, "");
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
