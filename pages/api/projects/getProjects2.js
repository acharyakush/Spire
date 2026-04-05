/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import dayjs from "dayjs";
import { Messages } from "@/utilities/constants";

import { MyGlobal } from "@/utilities/global";
import { query } from "@/utilities/dbConnection";

function getInitials(payload = "") {
	return String(payload)
		.split(",")
		.map((item) =>
			item
				.trim()
				.split(" ")
				.map((word) => word.charAt(0))
				.join("")
				.replace(/[^A-Za-z0-9]/g, ""),
		);
}

function getUsersDetails(ids, usersMap) {
	if (!ids) return [];

	return String(ids)
		.split(",")
		.map((id) => usersMap.get(String(id).trim()))
		.filter(Boolean);
}

export default async function handler(req, res) {
	if (req.method !== "GET" || !MyGlobal.IsApiCallMethodValid(req)) {
		return res.status(405).send(Messages.ApiCallForbidden);
	}

	res.setHeader("Cache-Control", "no-store, max-age=0");

	try {
		const today = dayjs();

		const [administrators, employees, clients, companies, mainProjects, notes, projects, subProjects, tasks, todos] = await Promise.all([
			query("SELECT * FROM administrators", []), // abc
			query("SELECT * FROM employees WHERE access_revoked=0", []),
			query("SELECT * FROM clients WHERE is_confirmed=1", []),
			query("SELECT * FROM companies WHERE is_deleted = 0", []),
			query("SELECT * FROM main_projects", []),
			query("SELECT * FROM notes", []),
			query("SELECT * FROM projects WHERE is_deleted=0 ORDER BY id DESC", []),
			query("SELECT * FROM sub_projects", []),
			query("SELECT * FROM tasks", []),
			query("SELECT * FROM todos WHERE is_deleted=0", []),
		]);

		const users = [...administrators, ...employees];
		const usersMap = new Map(users.map((m) => [String(m.id), m]));
		const clientsMap = new Map(clients.map((m) => [m.id, m.name]));
		const companiesMap = new Map(companies.map((m) => [m.id, m.name]));
		const mainProjectsMap = new Map(mainProjects.map((m) => [m.id, m.name]));
		const subProjectsMap = new Map(subProjects.map((m) => [m.id, m.name]));

		const tasksByProject = tasks.reduce((acc, task) => {
			const key = task.project_id;

			if (!acc[key]) acc[key] = [];
			acc[key].push(task);

			return acc;
		}, {});

		const todosByProject = todos.reduce((acc, todo) => {
			const key = todo.project_id;

			if (!acc[key]) acc[key] = [];
			acc[key].push(todo);

			return acc;
		}, {});

		const _projects = projects.map((m) => {
			const projectTasks = tasksByProject[m.id] || [];
			const teamsData = getUsersDetails(m.teams, usersMap);
			const teamNames = teamsData.map((_m) => _m.full_name).join(", ");

			let hasTasksOverdue = false;
			let hasTasksDueToday = false;
			let hasTasksDueTomorrow = false;
			let hasTasksUpcoming = false;
			let reimburseVoucher = 0;

			projectTasks.forEach((f) => {
				const expense = Number(f.expense);
				const tasksDueDate = dayjs(f.due_on);
				const isOpenTask = f.is_disabled === 0 && f.is_completed === 0;

				reimburseVoucher += Number.isFinite(expense) ? expense : 0;

				if (!isOpenTask) return;

				if (m.status == "Active" && tasksDueDate.isBefore(today, "date")) hasTasksOverdue = true;
				if (tasksDueDate.isSame(today, "date")) hasTasksDueToday = true;
				if (tasksDueDate.isSame(today.add(1, "day"), "date")) hasTasksDueTomorrow = true;
				if (tasksDueDate.isAfter(today.add(1, "day"), "date")) hasTasksUpcoming = true;
			});

			const clientName = clientsMap.get(m.client_id) || "";

			return {
				...m,
				client_id_and_name: `${m.client_id} - ${clientName}`,
				client_name: clientName,
				company_name: companiesMap.get(m.company_id) || "",
				has_tasks_overdue: hasTasksOverdue,
				has_tasks_due_today: hasTasksDueToday,
				has_tasks_due_tomorrow: hasTasksDueTomorrow,
				has_tasks_upcoming: hasTasksUpcoming,
				main_project_name: mainProjectsMap.get(m.main_project_id) || "",
				reimburse_voucher: reimburseVoucher,
				sub_project_name: subProjectsMap.get(m.sub_project_id) || "",
				team_names: teamNames,
				team_names_initials: getInitials(teamNames),
				teams_data: teamsData,
				todos: todosByProject[m.id] || [],
			};
		});

		return res.status(200).json({ notes, projects: _projects });
	} catch (error) {
		console.error(error);
		return res.status(500).send("Internal Server Error");
	}
}
