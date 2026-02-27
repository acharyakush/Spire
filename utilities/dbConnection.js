"use client";

import mysql from "mysql2/promise";

let connectionPool;

const getConnectionPool = () => {
	if (!connectionPool) {
		connectionPool = mysql.createPool({
			database: process.env.NEXT_PUBLIC_ENV === "uat" ? process.env.NEXT_PUBLIC_UAT_DATABASE : process.env.NEXT_PUBLIC_DATABASE,
			host: process.env.NEXT_PUBLIC_HOST,
			password: process.env.NEXT_PUBLIC_PASSWORD,
			user: process.env.NEXT_PUBLIC_USER,
			port: 3306,
			multipleStatements: true,
			connectionLimit: 10,
			connectTimeout: 10000,
		});
	}

	return connectionPool;
};

if (process.env.NEXT_PUBLIC_ENV !== "production") {
	if (!global.dbConnection) {
		console.debug("No global database connection, creating one...");
		global.dbConnection = getConnectionPool();
	} else {
		console.debug("Reusing global database connection.");
	}
}

export const query = async (query, parameters) => {
	let connection;

	try {
		const safeParameters = Array.isArray(parameters)
			? parameters.map((value) => {
					if (value instanceof Date) {
						return value.toISOString().slice(0, 19).replace("T", " ");
					}

					if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value)) {
						return value.slice(0, 19).replace("T", " ");
					}

					return value;
				})
			: [];

		connection = await (global.dbConnection || getConnectionPool()).getConnection();
		const [rows] = await connection.execute(query, safeParameters);
		return rows;
	} catch (error) {
		console.error("Database query error: ", error);
		throw error;
	} finally {
		if (connection) {
			connection.release();
		}
	}
};
