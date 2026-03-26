import axios from "axios";
import { ApiEndpoints, Messages, ToastTypes } from "./constants";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import secureLocalStorage from "react-secure-storage";

const CryptoJS = require("crypto-js");
const encryptionIv = CryptoJS.enc.Hex.parse("00000000000000000000000000000000");
const encryptionKey = CryptoJS.enc.Hex.parse(process.env.NEXT_PUBLIC_SECRET_KEY);

export const applicationName = process.env.NEXT_PUBLIC_APPLICATION_NAME;
export const isDevelopment = process.env.NODE_ENV === "development";

let allUsers = [];
let fullName = "";
let permissions = [];
let userId = "";
let userFullData = {};

export function getFinancialYear() {
	const today = dayjs();
	const fyStart = dayjs().month(3).date(1); // April 1

	const startYear = today.isBefore(fyStart) ? today.year() - 1 : today.year();

	return `${startYear}-${String(startYear + 1).slice(-2)}`;
}

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

let scrollMap = {};

export function safeJsonParse(input) {
	if (typeof input !== "string") return null;

	try {
		// First attempt — normal parse
		return JSON.parse(input);
	} catch (err) {
		// Try to repair common issues
		let repaired = input
			.replace(/\\(?!["\\/bfnrtu])/g, "\\\\") // Fix bad backslashes
			.replace(/\"\s*:\s*\"?([^\"]*)\n/g, '": "$1\\n') // Escape newlines inside values
			.replace(/,\s*([\]}])/g, "$1") // Remove trailing commas
			.replace(/\"$/g, '"') // Add missing closing quote if last char isn't closed
			.replace(/\]$/g, "]"); // Ensure array ends properly

		// If string ends abruptly in middle of array, try to close it
		if (!repaired.trim().endsWith("]")) repaired += '"]';

		try {
			return JSON.parse(repaired);
		} catch (err2) {
			console.error("Could not parse even after repair:", err2.message);
			return null; // Graceful fail
		}
	}
}

export function capitalize(payload) {
	if (!payload) return "";
	return String(payload)
		.toLowerCase()
		.split(" ")
		.map((m) => m.charAt(0).toUpperCase() + m.slice(1))
		.join(" ");
}

export function clearAllUserData() {
	LocalRemoveAll();
	SessionRemoveAll();
}

export function decrypt(value) {
	return CryptoJS.AES.decrypt(value, encryptionKey, { iv: encryptionIv }).toString(CryptoJS.enc.Utf8);
}

export function encrypt(value) {
	return CryptoJS.AES.encrypt(value, encryptionKey, { iv: encryptionIv }).toString();
}

export function escapeString(value) {
	if (!value) return "";
	return String(value).replace(/'/g, "''");
}

export function formatBytes(bytes) {
	if (bytes === 0) return "0 Bytes";

	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes.at(i);
}

export function getAllUsers() {
	return allUsers;
}

export function getAffiliatesInitials(payload, source = []) {
	if (!source.length) return;

	const arrPayload = String(payload).split(",");
	return arrPayload
		.map((m, i) => {
			const obj = source.find((f) => f.id == m);

			if (!obj) return "";
			if (i != arrPayload.length - 1) return getInitials(obj.name) + ", ";
			return getInitials(obj.name);
		})
		.filter(Boolean);
}

export function getAnyDataFromId(id, type) {
	if (!id) return "";
	const _id = String(id);

	if (_id.includes(",")) {
		const names = [];
		const idsArray = _id.split(",");

		idsArray.forEach((fe) => {
			const obj = allUsers.find((f) => f.id == fe);
			if (typeof obj === "object") names.push(obj[type]);
		});

		return names.join(", ");
	}

	const user = allUsers.find((f) => f.id == id);
	if (!user) return "Ex User";

	return user[type] ?? "Ex User";
}

export function getBankName(id, list) {
	if (typeof id !== "string") return "";
	if (!id.length) return "";

	if (!Array.isArray(list)) return "";
	if (!list.length) return "";

	let name = "";
	const obj = list.find((f) => f.id === id);

	if (typeof obj === "object") {
		if ("name" in obj) name = obj.name;
	}

	return name;
}

export function getChangedValues(obj1, obj2, path = "") {
	const changes = [];

	for (const key in obj1) {
		const currentPath = path ? `${path}.${key}` : key;

		if (obj1[key] && typeof obj1[key] === "object" && !Array.isArray(obj1[key])) {
			changes.push(...getChangedValues(obj1[key], obj2[key], currentPath));
		} else if (obj1[key] !== obj2[key]) {
			changes.push(currentPath);
		}
	}

	return changes;
}

export function getFullDetailsFromIds(ids) {
	if (typeof ids !== "string") return [];
	if (!ids.length) return [];

	if (ids.includes(",")) {
		const idsAsArray = ids.split(",");
		const idsArrayOfObjects = idsAsArray.map((m) => ({ id: m, label: "" }));

		return allUsers.filter((f) => idsArrayOfObjects.some((s) => s.id == f.id));
	}

	return allUsers.filter((f) => f.id == ids);
}

export function getHeaders(params) {
	if (params) return { maxBodyLength: Infinity, maxContentLength: Infinity, params: params };
	return { maxBodyLength: Infinity, maxContentLength: Infinity };
}

export function getInitials(payload) {
	if (!Array.isArray(payload)) return [];
	if (!payload.length) return [];

	let result = [];

	const array = String(payload).split(",");
	array.forEach((fe) => {
		const names = fe.trim().split(" ");
		const initials = names
			.map((m) => m.charAt(0))
			.join("")
			.replace(/[^A-Za-z0-9]/g, "");

		result.push(initials);
	});

	return result;
}

export function getMultipleInitials(payload) {
	if (typeof payload !== "string") return "";
	if (!payload.length) return "";

	const aray = String(payload).split(",");
	return aray.map((m) => getInitials(m.trim())).join(", ");
}

export function getNameFromId(id = "", source = []) {
	let name = "";

	if (typeof id !== "string") return name;
	if (!id.length) return name;

	if (!Array.isArray(source)) return name;
	if (!source.length) return name;

	const obj = source.find((f) => f.id == id);
	if (typeof obj === "object") name = obj.name;

	return name;
}

export function getNumbers(payload) {
	if (typeof payload !== "string") return "";
	return Number(payload.replace(/[^0-9.-]/g, ""));
}

export function getBasicPaymentSourceList() {
	return [
		{ id: "CASH", name: "Cash" },
		{ id: "CHEQUE", name: "Cheque" },
		{ id: "CC", name: "Credit Card" },
		{ id: "DC", name: "Debit Card" },
		{ id: "INSTAMOJO", name: "InstaMojo" },
		{ id: "NETBANKING", name: "NetBanking" },
		{ id: "TDS", name: "TDS Deducted" },
		{ id: "UPI", name: "UPI" },
	];
}

export function getRevisedPaymentSourceList(payload) {
	const list = [...payload];

	list.push({ id: "CASH", name: "Cash" }, { id: "CHEQUE", name: "Cheque" }, { id: "CC", name: "Credit Card" }, { id: "DC", name: "Debit Card" }, { id: "INSTAMOJO", name: "InstaMojo" }, { id: "NETBANKING", name: "NetBanking" }, { id: "TDS", name: "TDS Deducted" }, { id: "UPI", name: "UPI" });

	return list;
}

export function getStrings(payload) {
	return String(payload).replace(/[^a-zA-Z]/g, "");
}

export function getUserData() {
	const userData = LocalDoesExist(`${applicationName}UserDetails`);

	if (userData) {
		const decrypted = decrypt(userData);
		const parsed = JSON.parse(decrypted);

		userId = parsed.id;
		fullName = parsed.full_name;
		userFullData = parsed;

		return parsed;
	}

	return {};
}

export function getUserFullName() {
	return fullName;
}

export function getUserId() {
	return userId;
}

export async function HandleErrors(error, source) {
	console.error(source, error);

	if ("response" in error) {
		if ("status" in error.response) {
			let message = "";

			switch (error.response.status) {
				case 400:
					message = Messages.BadRequest;
					break;
				case 401:
					message = Messages.InvalidUser;
					break;
				case 403:
					message = Messages.AccessRevoked;
					break;
				case 404:
					message = Messages.NoDataFound;
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
					ShowToasts(ToastTypes.Error, message);
				}
			}

			if (source) {
				try {
					await axios.post(ApiEndpoints.ErrorLogger, {
						errorText: error.response.statusText,
						source,
						userId,
					});
				} catch (error) {
					console.error(error);
				}
			}
		}
	}
}

export function HasAlphabets(payload) {
	const regex = /^[a-zA-Z ]+$/;
	return regex.test(payload);
}

export function HasNumbers(payload) {
	const regex = /^[0-9]+$/;
	return regex.test(payload);
}

export function HasPermission(permission) {
	const has = permissions.filter(function (f) {
		return f.name == permission;
	});
	const has_ = has.length;
	const has__ = has_ > 0;

	return has__;
}

export function HighlightText(payload, searchString) {
	const regex = getSafeRegex(searchString);

	if (!regex) return payload;

	return String(payload).replace(regex, function (m) {
		return `<span class='highlight-characters'>${m}</span>`;
	});
}

export function IsApiCallMethodValid(request) {
	if (request.method === "GET") return request.headers["sec-fetch-dest"] === "empty";

	return Object.keys(request.body || {}).length > 0;
}

export function IsUserAdministrator() {
	return userFullData.role == "Administrator";
}

export async function LogErrors(errorText, source) {
	try {
		await axios.post(ApiEndpoints.ErrorLogger, { errorText, source, userId });
	} catch (error) {
		console.error(error);
	}
}

export function MakeNewInvoiceId(firmName, payload, source = "") {
	if (payload.length) {
		const initials = getInitials(firmName).at(0);

		const target = [...payload].filter(function (f) {
			const customIdInitials = String(f.custom_id).split("/").at(0);

			if (initials === "SCL") return customIdInitials === "PSCL";
			if (String(initials).startsWith(customIdInitials)) {
				return f;
			}
		});

		if (!target.length) {
			return "00001";
		} else {
			const extractedIds = [];

			target.forEach(function (m) {
				const splitCustomId = String(m.custom_id).split("/");

				if (splitCustomId.at(1) === getFinancialYear()) {
					try {
						const extractNumber = +splitCustomId.at(2).match(/\d+$/)[0].replace(/^0+/, "");

						if (!extractedIds.includes(extractNumber)) {
							extractedIds.push(extractNumber);
						}
					} catch (error) {
						console.log(m.custom_id + " > ", error);
					}
				}
			});

			const latestId = extractedIds
				.sort(function (a, b) {
					return b - a;
				})
				.at(0);

			const incrementedId = (parseInt(latestId, 10) + 1).toString();
			const newId = incrementedId.padStart(String(latestId).length, "0");

			return String(newId).padStart(5, "0");
		}
	} else {
		return "00001";
	}
}

export function MakeNewQuotationId(firmName, payload) {
	if (payload.length) {
		const initials = getInitials(firmName).at(0);
		const prefix = `QTN/${initials}`;

		const target = payload.filter(function (f) {
			return String(f.custom_id).startsWith(prefix);
		});

		if (!target.length) {
			return "041";
		} else {
			const extractedIds = target.map(function (m) {
				const idPart = String(m.custom_id).split("/").at(2);
				const matched = idPart?.match(/\d+$/);

				let number = 0;
				if (matched && matched[0]) {
					const cleaned = matched[0].replace(/^0+/, "") || "0";
					number = parseInt(cleaned, 10);
				}

				return number;
			});

			const latestId = Math.max(...extractedIds);
			const nextId = latestId + 1;

			if (nextId > 999) return "999";

			const safeId = Math.max(nextId, 41);
			return String(safeId).padStart(3, "0");
		}
	} else {
		return "041";
	}
}

export function NumberToWordsIndian(num) {
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
}

export function SetAllUsers(allUsersArray) {
	allUsers = allUsersArray;
}

export function SetPermission(_permission) {
	permissions = _permission;
}

export function SetUserData() {
	const userDetails = LocalDoesExist(`${applicationName}UserDetails`);

	if (userDetails) {
		const decryptedUserDetails = decrypt(userDetails);
		const parsedUserDetails = JSON.parse(decryptedUserDetails);

		userId = parsedUserDetails.id;
		fullName = parsedUserDetails.full_name;
		userFullData = parsedUserDetails;
	}
}

export function SeparateObjectsIntoArrays(array, chunkSize) {
	const result = [];

	for (let i = 0; i < array.length; i += chunkSize) {
		const chunk = array.slice(i, i + chunkSize);
		result.push(chunk);
	}

	return result;
}

export function ShowErrorToast(message) {
	ShowToasts(ToastTypes.Error, message);
}

export function ShowInformationToast(message) {
	ShowToasts(ToastTypes.Information, message);
}

export function ShowSuccessToast(message) {
	ShowToasts(ToastTypes.Success, message);
}

export function ShowToasts(type, message) {
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
		toastId: type + "_toast",
	});
}

export function ShowWarningToast(message) {
	ShowToasts(ToastTypes.Warning, message);
}

export function LocalDoesExist(key) {
	return !isDevelopment ? secureLocalStorage.getItem(key) : globalThis.localStorage.getItem(key);
}

export function LocalGet(key) {
	return !isDevelopment ? secureLocalStorage.getItem(key) : globalThis.localStorage.getItem(key);
}

export function LocalRemove(key) {
	return !isDevelopment ? secureLocalStorage.removeItem(key) : globalThis.localStorage.removeItem(key);
}

export function LocalRemoveAll() {
	const keysToRemove = [];

	for (let i = 0; i < globalThis.localStorage.length; i++) {
		const key = globalThis.localStorage.key(i) || "";
		if (key && key.startsWith(applicationName)) keysToRemove.push(key);
	}

	keysToRemove.forEach(function (key) {
		!isDevelopment ? secureLocalStorage.removeItem(key) : globalThis.localStorage.removeItem(key);
	});

	globalThis.console.clear();
}

export function LocalSet(key, value) {
	return !isDevelopment ? secureLocalStorage.setItem(key, value) : globalThis.localStorage.setItem(key, value);
}

export function SessionDoesExist(key) {
	return globalThis.sessionStorage.getItem(key) !== null;
}

export function SessionGet(key) {
	return globalThis.sessionStorage.getItem(key);
}

export function SessionRemove(key) {
	return globalThis.sessionStorage.removeItem(key);
}

export function SessionRemoveAll() {
	const keysToRemove = [];

	for (let i = 0; i < globalThis.sessionStorage.length; i++) {
		const key = globalThis.sessionStorage.key(i) || "";
		if (key && key.startsWith(applicationName)) keysToRemove.push(key);
	}

	keysToRemove.forEach(function (key) {
		!isDevelopment ? secureLocalStorage.removeItem(key) : globalThis.sessionStorage.removeItem(key);
	});

	globalThis.console.clear();
}

export function SessionSet(key, value) {
	return globalThis.sessionStorage.setItem(key, value);
}

export function stripHtmlTags(payload) {
	const regex = /<\/?[^>]+>/gi;
	return String(payload).replace(regex, "");
}

export function thousandSeparator(payload) {
	const value = getNumbers(payload);
	return new Intl.NumberFormat("en-IN", { signDisplay: "auto" }).format(value);
}

export function trimInnerSpace(value) {
	return String(value).replace(/\s/g, "");
}

export function validateEmailAddress(emailAddress) {
	const _emailAddress = String(emailAddress);

	if (!_emailAddress.includes("@")) return { hasError: true, text: Messages.NoAtSymbolInEmailAddress };

	if (!_emailAddress.includes(".")) return { hasError: true, text: Messages.NoPeriodSymbolInEmailAddress };

	const emailRegex = /^[a-zA-Z0-9._%+-]+@(admins\.spire\.com|spire\.com)$/;

	if (!emailRegex.test(_emailAddress)) return { hasError: true, text: Messages.SpireDomainOnly };

	return { hasError: false, text: "" };
}
