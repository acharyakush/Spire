/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import { Messages } from "@/utilities/constants";

import { MyGlobal } from "@/utilities/global";
import { query } from "@/utilities/dbConnection";

export default async function handler(req, res) {
    if (req.method !== "GET" || !MyGlobal.IsApiCallMethodValid(req)) {
        return res.status(405).send(Messages.ApiCallForbidden);
    }

    res.setHeader("Cache-Control", "no-store, max-age=0");

    try {
        const response = await query("SELECT id, name, count FROM (SELECT TRIM(j.id) AS id, COALESCE(CONCAT(a.first_name, ' ', a.last_name), CONCAT(e.first_name, ' ', e.last_name)) AS name, COUNT(*) AS count FROM projects p JOIN JSON_TABLE(CONCAT('[\"', REPLACE(p.teams, ',', '\",\"'), '\"]'), '$[*]' COLUMNS (id VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci PATH '$')) AS j LEFT JOIN administrators a ON a.id COLLATE utf8mb4_general_ci = TRIM(j.id) COLLATE utf8mb4_general_ci LEFT JOIN employees e ON e.id COLLATE utf8mb4_general_ci = TRIM(j.id) COLLATE utf8mb4_general_ci WHERE p.status = 'Active' AND TRIM(p.teams) <> '' AND TRIM(j.id) <> 'A3' AND (e.id IS NULL OR e.employment_status = 'Active') GROUP BY TRIM(j.id), a.first_name, a.last_name, e.first_name, e.last_name) AS result ORDER BY count DESC;", []);

        if (!response.length) return res.status(204).end();

        return res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
}
