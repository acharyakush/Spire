"use client";

import axios from "axios";
import crypto from "crypto";
import SecureLS from "secure-ls";
import MyConstants from "./constants";

let secureLocalStorage = null;

if (typeof window !== "undefined") {
	secureLocalStorage = new SecureLS({
		encodingType: "aes",
		encryptionSecret: process.env.NEXT_PUBLIC_SECRET_KEY,
	});
}

export const applicationName = process.env.NEXT_PUBLIC_APPLICATION_NAME;
export const isDevelopment = process.env.NODE_ENV !== "production";

export const MyGlobal = Object.freeze({
	async addActivity(activityData) {
		try {
			await axios.post(MyConstants.API_ENDPOINTS.addActivity, JSON.stringify(activityData), {
				headers: {
					"Content-Type": "application/json",
				},
			});
		} catch (error) {
			console.error("Error calling add-activity API:", error);
		}
	},

	deobfuscate(obfuscated) {
		const obfuscatedBytes = Uint8Array.from(Buffer.from(obfuscated, "base64"));
		const secretBytes = new TextEncoder().encode(process.env.NEXT_PUBLIC_SECRET_KEY);
		const originalBytes = new Uint8Array(obfuscatedBytes.length);

		for (let i = 0; i < obfuscatedBytes.length; i++) {
			originalBytes[i] = obfuscatedBytes[i] ^ secretBytes[i % secretBytes.length];
		}

		return new TextDecoder().decode(originalBytes);
	},

	async hashPassword(password) {
		if (!password) throw new Error("Password cannot be empty");

		const salt = crypto.randomBytes(16).toString("hex");
		const derivedKey = await pbkdf2Async(password, salt);
		return `${salt}:${derivedKey}`;
	},

	obfuscate(input) {
		const inputBytes = new TextEncoder().encode(input);
		const secretBytes = new TextEncoder().encode(process.env.NEXT_PUBLIC_SECRET_KEY);
		const obfuscatedBytes = new Uint8Array(inputBytes.length);

		for (let i = 0; i < inputBytes.length; i++) {
			obfuscatedBytes[i] = inputBytes[i] ^ secretBytes[i % secretBytes.length];
		}

		return Buffer.from(obfuscatedBytes).toString("base64");
	},

	pbkdf2Async(password, salt) {
		return new Promise((resolve, reject) => {
			crypto.pbkdf2(password, salt, 100000, 64, "sha512", (err, derivedKey) => {
				if (err) return reject(new Error("Error generating hash"));
				resolve(derivedKey.toString("hex"));
			});
		});
	},

	Storages: {
		local: {
			doesExist: (key) => {
				return !isDevelopment ? secureLocalStorage.get(key) : globalThis.localStorage.getItem(key);
			},
			get: (key) => {
				return !isDevelopment ? secureLocalStorage.get(key) : globalThis.localStorage.getItem(key);
			},
			remove: (key) => {
				return !isDevelopment ? secureLocalStorage.remove(key) : globalThis.localStorage.removeItem(key);
			},
			removeAll: () => {
				for (let i = 0; i < globalThis.localStorage.length; i++) {
					const key = globalThis.localStorage.key(i) || "";

					if (key && key.startsWith(applicationName)) {
						!isDevelopment ? secureLocalStorage.remove(key) : globalThis.localStorage.removeItem(key);
						i--;
					}
				}

				globalThis.console.clear();
			},
			set: (key, value) => {
				return !isDevelopment ? secureLocalStorage.set(key, value) : globalThis.localStorage.setItem(key, value);
			},
		},
	},

	validateEmailAddress(emailAddress) {
		const _emailAddress = String(emailAddress);

		if (!_emailAddress.includes("@")) {
			return {
				hasError: true,
				text: MyConstants.MESSAGES.noAtSymbolInEmailAddress,
			};
		}

		if (!_emailAddress.includes(".")) {
			return {
				hasError: true,
				text: MyConstants.MESSAGES.noPeriodSymbolInEmailAddress,
			};
		}

		const emailRegex = /^[a-zA-Z0-9._%+-]+@(admins\.spire\.com|spire\.com)$/;

		if (!emailRegex.test(_emailAddress)) {
			return {
				hasError: true,
				text: MyConstants.MESSAGES.spireDomainOnly,
			};
		}

		return { hasError: false, text: "" };
	},

	async verifyPassword(storedHash, password) {
		if (!storedHash || !password) return false;

		if (typeof storedHash === "string") {
			const [salt, originalHash] = storedHash.split(":");
			const derivedKey = await pbkdf2Async(password, salt);

			return originalHash === derivedKey;
		}
	},
});
