"use client";

import axios from "axios";
import crypto from "crypto";
import SecureLS from "secure-ls";

import { PrismaClient } from "@prisma/client";
import type {
  AddActivityApiRequest,
  EmailAddressValidation,
} from "./interfaces";

export const applicationName: string =
  process.env.NEXT_PUBLIC_APPLICATION_NAME!;

export const isDevelopment: boolean = process.env.NODE_ENV !== "production";

export const prisma = new PrismaClient();

const secureLocalStorage = new SecureLS({
  encodingType: "aes",
  encryptionSecret: process.env.NEXT_PUBLIC_SECRET_KEY!,
});

export const MyGlobal = {
  async addActivity(activityData: AddActivityApiRequest): Promise<void> {
    try {
      await axios.post("/api/add-activity", activityData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Error calling add-activity API:", error);
    }
  },

  async hashPassword(password: string): Promise<string> {
    if (!password) throw new Error("Password cannot be empty");

    const salt = crypto.randomBytes(16).toString("hex");
    const derivedKey = await MyGlobal.pbkdf2Async(password, salt);
    return `${salt}:${derivedKey}`;
  },

  async verifyPassword(storedHash: string, password: string): Promise<boolean> {
    if (!storedHash || !password) return false;

    const [salt, originalHash] = storedHash.split(":");
    const derivedKey = await MyGlobal.pbkdf2Async(password, salt);
    return originalHash === derivedKey;
  },

  pbkdf2Async(password: string, salt: string): Promise<string> {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, 100000, 64, "sha512", (err, derivedKey) => {
        if (err) return reject(new Error("Error generating hash"));
        resolve(derivedKey.toString("hex"));
      });
    });
  },

  obfuscate(input: string): string {
    const inputBytes = new TextEncoder().encode(input);
    const secretBytes = new TextEncoder().encode(
      process.env.NEXT_PUBLIC_SECRET_KEY!,
    );
    const obfuscatedBytes = new Uint8Array(inputBytes.length);

    for (let i = 0; i < inputBytes.length; i++) {
      obfuscatedBytes[i] = inputBytes[i] ^ secretBytes[i % secretBytes.length];
    }

    return Buffer.from(obfuscatedBytes).toString("base64");
  },

  deobfuscate(obfuscated: string): string {
    const obfuscatedBytes = Uint8Array.from(Buffer.from(obfuscated, "base64"));
    const secretBytes = new TextEncoder().encode(
      process.env.NEXT_PUBLIC_SECRET_KEY!,
    );
    const originalBytes = new Uint8Array(obfuscatedBytes.length);

    for (let i = 0; i < obfuscatedBytes.length; i++) {
      originalBytes[i] =
        obfuscatedBytes[i] ^ secretBytes[i % secretBytes.length];
    }

    return new TextDecoder().decode(originalBytes);
  },

  Storages: {
    local: {
      doesExist: (key: string): boolean => {
        return !isDevelopment
          ? secureLocalStorage.get(key)
          : globalThis.localStorage.getItem(key);
      },
      get: (key: string): string | null => {
        return !isDevelopment
          ? secureLocalStorage.get(key)
          : globalThis.localStorage.getItem(key);
      },
      remove: (key: string): void => {
        return !isDevelopment
          ? secureLocalStorage.remove(key)
          : globalThis.localStorage.removeItem(key);
      },
      removeAll: (): void => {
        for (let i = 0; i < globalThis.localStorage.length; i++) {
          const key: string = globalThis.localStorage.key(i) || "";

          if (key && key.startsWith(applicationName)) {
            !isDevelopment
              ? secureLocalStorage.remove(key)
              : globalThis.localStorage.removeItem(key);
            i--;
          }
        }

        globalThis.console.clear();
      },
      set: (key: string, value: string): void => {
        return !isDevelopment
          ? secureLocalStorage.set(key, value)
          : globalThis.localStorage.setItem(key, value);
      },
    },
    session: {
      doesExist: (key: string): boolean =>
        globalThis.sessionStorage.getItem(key) !== null,
      get: (key: string): string | null =>
        globalThis.sessionStorage.getItem(key),
      remove: (key: string): void => globalThis.sessionStorage.removeItem(key),
      removeAll: (): void => {
        for (let i = 0; i < globalThis.sessionStorage.length; i++) {
          const key: string = globalThis.sessionStorage.key(i) || "";

          if (key && key.startsWith(applicationName)) {
            globalThis.sessionStorage.removeItem(key);
            i--;
          }
        }
        globalThis.console.clear();
      },
      set: (key: string, value: string): void =>
        globalThis.sessionStorage.setItem(key, value),
    },
  },

  validateEmailAddress(emailAddress: string): EmailAddressValidation {
    if (!emailAddress.includes("@")) {
      return {
        hasError: true,
        text: "<span>Must contain <b>@</b> symbol.</span>",
      };
    }

    if (!emailAddress.includes(".")) {
      return {
        hasError: true,
        text: "<span>Must contain <b>.</b> symbol.</span>",
      };
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@(admins\.spire\.com|spire\.com)$/;

    if (!emailRegex.test(emailAddress)) {
      return {
        hasError: true,
        text: "<span>Domain must exactly be <b>spire.com</b>.</span>",
      };
    }

    return { hasError: false, text: "" };
  },
};
