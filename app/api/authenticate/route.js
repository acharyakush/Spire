const crypto = require("crypto");
import prisma from "@/utilities/prisma";

import { SignJWT } from "jose";
import { NextResponse } from "next/server";

const JWT_EXPIRATION = "24h";
const JWT_SECRET = new TextEncoder().encode(process.env.NEXT_PUBLIC_SECRET_KEY);

const deobfuscate = (obfuscated) => {
	const obfuscatedBytes = Uint8Array.from(Buffer.from(obfuscated, "base64"));
	const secretBytes = new TextEncoder().encode(process.env.NEXT_PUBLIC_SECRET_KEY);
	const originalBytes = new Uint8Array(obfuscatedBytes.length);

	for (let i = 0; i < obfuscatedBytes.length; i++) {
		originalBytes[i] = obfuscatedBytes[i] ^ secretBytes[i % secretBytes.length];
	}

	return new TextDecoder().decode(originalBytes);
};

const pbkdf2Async = (password, salt) => {
	return new Promise((resolve, reject) => {
		crypto.pbkdf2(password, salt, 100000, 64, "sha512", (err, derivedKey) => {
			if (err) return reject(new Error("Error generating hash"));
			resolve(derivedKey.toString("hex"));
		});
	});
};

const verifyPassword = async (storedHash, password) => {
	if (!storedHash || !password) return false;

	if (typeof storedHash === "string") {
		const [salt, originalHash] = storedHash.split(":");
		const derivedKey = await pbkdf2Async(password, salt);

		return originalHash === derivedKey;
	}
};

export async function POST(request) {
	if (request.method !== "POST") {
		return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
	}

	try {
		const body = await request.json();
		const parsedCredentials = deobfuscate(body.credentials);

		const { emailAddress, password } = JSON.parse(parsedCredentials);

		let user;

		const _emailAddress = String(emailAddress);

		if (_emailAddress.split("@").at(1) === "admins.spire.com") {
			user = await prisma.administrators.findUnique({
				where: { email_address: emailAddress },
			});
		} else {
			user = await prisma.employees.findUnique({
				where: { email_address: emailAddress },
			});
		}

		if (!user) {
			return NextResponse.json({ error: "No user found." }, { status: 404 });
		}

		const isPasswordValid = await verifyPassword(user.password, password);

		if (!isPasswordValid) {
			return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
		}

		const token = await new SignJWT({ id: user.id, email_address: user.email_address })
			.setProtectedHeader({ alg: "HS256" })
			.setExpirationTime(JWT_EXPIRATION)
			.sign(JWT_SECRET);

		return NextResponse.json({ token, user_id: user.id }, { status: 200 });
	} catch (error) {
		console.error(`Login failed: ${error}`);

		return NextResponse.json(
			{
				detailedError: error,
				error: "Technical glitch occurred. Please contact support desk.",
			},
			{ status: 500 },
		);
	}
}
