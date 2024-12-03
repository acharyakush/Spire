import prisma from "@/utilities/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
	const { searchParams } = new URL(request.url);
	const tableNames = searchParams.get("table")?.split(",") || [];

	const allowedTables = Object.keys(prisma)
		.filter((key) => prisma[key] && typeof prisma[key].findMany === "function")
		.reduce((acc, key) => {
			acc[key] = prisma[key];
			return acc;
		}, {});

	const invalidTables = tableNames.filter((name) => !allowedTables[name]);

	if (invalidTables.length > 0) {
		return NextResponse.json({ error: `Invalid table names: ${invalidTables.join(", ")}` }, { status: 400 });
	}

	try {
		const data = await Promise.all(tableNames.map((table) => allowedTables[table].findMany().then((result) => ({ table, data: result }))));

		return NextResponse.json(data, { status: 200 });
	} catch (error) {
		return NextResponse.json({ object: error, text: "Failed to fetch data." }, { status: 500 });
	}
}
