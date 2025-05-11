// Web Worker for handling data processing
self.onmessage = function (e) {
	const { data, supportData, type, filters, sortConfig } = e.data;

	switch (type) {
		case "processData":
			const processed = processInquiriesData(data, supportData);
			self.postMessage({ type: "processData", data: processed });
			break;

		case "filterData":
			const filtered = filterInquiriesData(data, filters);
			self.postMessage({ type: "filterData", data: filtered });
			break;

		case "sortData":
			const sorted = sortInquiriesData(data, sortConfig);
			self.postMessage({ type: "sortData", data: sorted });
			break;
	}
};

function processInquiriesData(data, supportData) {
	const result = [];
	for (let i = 0; i < data.length; i++) {
		const fe = data[i];
		const clientName = getNameFromId(fe.client_id, supportData.clients);
		const referenceName = getNameFromId(fe.reference_id, supportData.references);
		const followUps = getAnyDataFromId(fe.follow_ups, "full_name");
		const entryBy = getAnyDataFromId(fe.entry_by_id, "full_name");

		let phoneNumber = fe.phone_number;
		for (let j = 0; j < supportData.clients.length; j++) {
			const client = supportData.clients[j];
			if (client.id == fe.client_id && client.is_edited == 1) {
				phoneNumber = client.phone_number;
				break;
			}
		}

		result.push({
			...fe,
			client_id_and_name: `${fe.client_id} - ${clientName}`,
			client_name: clientName,
			entry_by_id_and_name: `${fe.entry_by_id} - ${entryBy}`,
			entry_date: formatDate(fe.entry_date),
			entry_by_name: entryBy,
			follow_ups: followUps,
			follow_ups_data: getFullDetailsFromIds(fe.follow_ups),
			follow_ups_initials: getInitials(followUps),
			main_project: getNameFromId(fe.main_project_id, supportData.mainProjects),
			notes: "",
			phone_number: phoneNumber,
			reference_id_and_name: `${fe.reference_id} - ${referenceName}`,
			reference_name: referenceName,
			sub_project: getNameFromId(fe.sub_project_id, supportData.subProjects),
		});
	}
	return result;
}

function filterInquiriesData(data, filters) {
	const result = [];
	for (let i = 0; i < data.length; i++) {
		const item = data[i];
		let shouldInclude = false;

		if (filters.type === "entryDate") {
			const checkDate = new Date(item.entry_date);
			shouldInclude = checkDate >= filters.from && checkDate <= filters.to;
		} else {
			const searchText = filters.findText.toLowerCase();
			const searchableFields = [
				item.client_id,
				item.client_name,
				item.phone_number,
				item.main_project,
				item.sub_project,
				item.reference_id,
				item.reference_name,
				item.follow_ups,
				item.follow_ups_initials,
				item.quote,
				item.status,
				item.notes,
				item.entry_by_name,
			];

			for (let j = 0; j < searchableFields.length; j++) {
				if (String(searchableFields[j]).toLowerCase().includes(searchText)) {
					shouldInclude = true;
					break;
				}
			}
		}

		if (shouldInclude) {
			result.push(item);
		}
	}
	return result;
}

function sortInquiriesData(data, sortConfig) {
	const { column, isAscending } = sortConfig;
	const result = [...data];

	for (let i = 0; i < result.length - 1; i++) {
		for (let j = 0; j < result.length - i - 1; j++) {
			let shouldSwap = false;

			if (column === "Client") {
				shouldSwap = isAscending ? result[j].client_name.localeCompare(result[j + 1].client_name) > 0 : result[j + 1].client_name.localeCompare(result[j].client_name) > 0;
			} else if (column === "Projects") {
				shouldSwap = isAscending ? result[j].main_project.localeCompare(result[j + 1].main_project) > 0 : result[j + 1].main_project.localeCompare(result[j].main_project) > 0;
			} else if (column === "CreatedBy") {
				shouldSwap = isAscending ? result[j].reference_name.localeCompare(result[j + 1].reference_name) > 0 : result[j + 1].reference_name.localeCompare(result[j].reference_name) > 0;
			} else if (column === "FollowUps") {
				shouldSwap = isAscending ? result[j].follow_ups.localeCompare(result[j + 1].follow_ups) > 0 : result[j + 1].follow_ups.localeCompare(result[j].follow_ups) > 0;
			} else if (column === "Quote") {
				shouldSwap = isAscending ? result[j].quote > result[j + 1].quote : result[j + 1].quote > result[j].quote;
			} else if (column === "Status") {
				shouldSwap = isAscending ? result[j].status.localeCompare(result[j + 1].status) > 0 : result[j + 1].status.localeCompare(result[j].status) > 0;
			} else {
				shouldSwap = result[j + 1].id > result[j].id;
			}

			if (shouldSwap) {
				const temp = result[j];
				result[j] = result[j + 1];
				result[j + 1] = temp;
			}
		}
	}
	return result;
}

// Helper functions
function getNameFromId(id, data) {
	for (let i = 0; i < data.length; i++) {
		if (data[i].id == id) {
			return data[i].name;
		}
	}
	return "";
}

function getAnyDataFromId(id, field) {
	// Implementation depends on your data structure
	return id;
}

function getFullDetailsFromIds(ids) {
	// Implementation depends on your data structure
	return ids;
}

function getInitials(name) {
	const words = name.split(" ");
	let result = "";
	for (let i = 0; i < words.length; i++) {
		result += words[i][0];
	}
	return result;
}

function formatDate(date) {
	return new Date(date).toLocaleDateString("en-US", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}
