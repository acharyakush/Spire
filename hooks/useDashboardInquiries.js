import { useState } from "react";
import { MyGlobal } from "@/utilities/global";

import { Statuses } from "@/utilities/constants";

export default function useInquiries() {
	const [inquiries, setInquiries] = useState({
		api: [],
		closed: 0,
		confirmed: 0,
		hold: 0,
		my: 0,
		open: 0,
		totalCount: 0,
		totalQuote: 0,
	});

	function updateInquiries(list) {
		const result = {
			api: list,
			closed: 0,
			confirmed: 0,
			hold: 0,
			my: 0,
			open: 0,
			totalCount: list.length,
			totalQuote: 0,
		};

		const inqStatus = Statuses.Inquiries;
		const userId = MyGlobal.GetUserId();

		for (const i of list) {
			if (i.status == inqStatus.Closed) result.closed++;
			if (i.status == inqStatus.Confirmed) result.confirmed++;
			if (i.status == inqStatus.Hold) result.hold++;
			if (i.status == inqStatus.Open) result.open++;

			if (String(i.follow_ups).includes(userId)) result.my++;

			result.totalQuote += +i.quote;
		}

		setInquiries(result);
	}

	return { inquiries, updateInquiries };
}
