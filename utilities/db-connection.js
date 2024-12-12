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

export const query = async (query) => {
	let connection;

	try {
		connection = await (global.dbConnection || getConnectionPool()).getConnection();
		const [rows] = await connection.execute(query);
		return rows;
	} catch (error) {
		console.error("Database query error: ", error);
	} finally {
		if (connection) {
			connection.release();
		}
	}
};
