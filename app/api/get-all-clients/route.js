import prisma from "@/utilities/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
	if (request.method !== "GET") {
		return NextResponse.json(
			{ error: "Method Not Allowed" },
			{ status: 405 },
		);
	}

	try {
		const permissions = await prisma.clients.findMany();
		return NextResponse.json(permissions, { status: 200 });
	} catch (error) {
		return NextResponse.json(
			{ object: error, text: "Failed to fetch statuses." },
			{ status: 500 },
		);
	}
}
