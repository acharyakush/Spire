export const ActivitiesHeaders = Object.freeze({
	EntryAt: "Entry At",
	Module: "Module",
	Activity: "Activity",
	EntryBy: "Entry By",
});

export const ClientsHeaders = Object.freeze({
	JoinedOn: "Joined On",
	Name: "Name",
	EmailAddress: "Email Address",
});

export const InquiriesHeaders = Object.freeze({
	Client: "Client",
	Contacts: "Contacts",
	Projects: "Projects",
	FollowUps: "Follow Ups",
	Quote: "Quote",
	NextFollowUpOn: "Next Follow Up",
	Status: "Status",
	References: "References",
});

export const MyInquiriesHeaders = Object.freeze({
	EntryDate: "Date",
	Client: "Client & Inquiry DT",
	PhoneNumber: "Contact Info",
	MainProject: "Projects",
	SubProject: "Sub Project",
	Reference: "Reference",
	FollowUps: "Follow Ups",
	Quote: "Quote",
	Status: "Status",
	Notes: "Notes",
	CreatedBy: "Created By",
});

export const InvoicesHeaders = Object.freeze({
	Id: "ID",
	Company: "Company",
	MainProject: "Main Project",
	SubProject: "Sub Project",
	CreatedAt: "Created At",
	DueDate: "Due Date",
	Amount: "Amount",
	AmountReceived: "Received",
	AmountPending: "Pending",
	InvoiceId: "Invoice ID",
	Actions: "Actions",
});

export const MappedAffiliatesHeaders = Object.freeze({
	Name: "Name",
	Paid: "Paid",
	Fees: "Fees",
	Action: "Action",
});

export const NotesHeaders = Object.freeze({
	date: "Date",
	note: "Note",
	entryBy: "Entry By",
});

export const ProjectsHeaders = Object.freeze({
	Started: "Started On",
	Client: "Client",
	Projects: "Projects",
	Teams: "Teams",
	Quote: "Quote",
	Status: "Status",
});

export const ProjectsHeaders2 = Object.freeze({
	Started: "Started On",
	Client: "Client",
	Projects: "Projects",
	Teams: "Teams",
	Quote: "Quote",
	Status: "Status",
	WorkFrequency: "Work Frequency"
});

export const RvHeaders = Object.freeze({
	Id: "ID",
	Company: "Company",
	MainProject: "Main Project",
	SubProject: "Sub Project",
	CreatedAt: "Created At",
	Amount: "Amount",
	AmountReceived: "Received",
	AmountPending: "Pending",
	RvId: "RV ID",
	Actions: "Actions",
});

export const SingleClientHeaders = Object.freeze({
	Id: "ID",
	SubProject: "Sub Project",
	Company: "Company",
	Teams: "Teams",
	InvoiceFirm: "Invoice Firm",
	InvoiceFees: "Prof Fees",
	ReimbursementVoucher: "RV",
	AmountReceived: "Received",
	AmountPending: "Pending",
	Total: "Total",
});

export const TasksHeaders = Object.freeze({
	Particulars: "Particulars",
	Remark: "Remark",
	DueDate: "Due Date",
	Actions: "Actions",
});

export const TasksRemarksHeaders = Object.freeze({
	Task: "Task",
	Remark: "Remark",
	DueDate: "Due Date",
	AllotedTo: "Alloted To",
	WrittenBy: "Written By",
});

export const AllTransactionsHeaders = Object.freeze({
	Date: "Date",
	Module: "Module",
	BankName: "Bank Name",
	AmountPaid: "Amount Paid",
	AmountReceived: "Amount Received",
	Particulars: "Particulars",
	PaymentSource: "Payment Source",
	PaymentType: "Payment Type",
	Remarks: "Remarks",
	EntryBy: "Entry By",
});

export const GeneralTransactionsHeaders = Object.freeze({
	Date: "Date",
	Firm: "Firm",
	Bank: "Bank",
	Amount: "Amount",
	Particulars: "Particulars",
	PaymentSource: "Payment Source",
	PaymentType: "Payment Type",
	Remarks: "Remarks",
	EntryBy: "Entry By",
});

export const InvoiceTransactionsHeaders = Object.freeze({
	Date: "Date",
	Particulars: "Particulars",
	AmountReceived: "Amt Received",
	PaymentSource: "Payment Source",
});

export const PettyCashTransactionsHeaders = Object.freeze({
	Date: "Date",
	Firm: "Firm",
	PaymentType: "Payment Type",
	Particulars: "Particulars",
	Remarks: "Remarks",
	AmountPaid: "Amount Paid",
	AmountReceived: "Amount Received",
	Balance: "Balance",
	EntryBy: "Entry By",
});

export const RvListTransactionsHeaders = Object.freeze({
	Date: "Date",
	Id: "ID",
	Amount: "Amount",
	Download: "Download",
});
