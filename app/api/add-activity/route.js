import prisma from "@/utilities/prisma";
import { NextResponse } from "next/server";

export async function POST(request) {
	if (request.method !== "POST") {
		return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
	}

	let ipAddress = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || request.socket?.remoteAddress || "";

	if (ipAddress === "::1" || ipAddress === "127.0.0.1") {
		ipAddress = "Localhost";
	}

	const userAgent = request.headers.get("user-agent") || "";

	const body = await request.json();
	const { activity, session_id, user_id } = body;

	try {
		await prisma.activities.create({
			data: {
				user_id,
				activity,
				ip_address: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
				user_agent: userAgent,
				session_id,
			},
		});

		return NextResponse.json({}, { status: 200 });
	} catch (error) {
		console.error(error);
		return NextResponse.json({ error: "Failed to add activity." }, { status: 500 });
	}
}
