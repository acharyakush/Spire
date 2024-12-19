"use client";

const protocol = globalThis.location?.protocol;
const hostname = globalThis.location?.hostname;
const port = globalThis.location?.port;

const developmentBaseUrl = `${protocol}//${hostname}:${port}`;
const productionBaseUrl = "https://www.spire.com";
const uatBaseUrl = "https://uat.spire.com";

let baseUrl = productionBaseUrl;

if (process.env.NEXT_PUBLIC_ENV === "development") {
	baseUrl = developmentBaseUrl;
} else if (process.env.NEXT_PUBLIC_ENV === "uat") {
	baseUrl = uatBaseUrl;
}

const MyConstants = Object.freeze({
	ApiEndpoints: Object.freeze({
		Authenticate: "/api/authenticate",
		ErrorLogger: `api/errorLogger`,
		Getter: `api/getter`,
		Inquiries: Object.freeze({
			AddInquiry: `api/inquiries/addInquiry`,
			EditInquiry: `api/inquiries/editInquiry`,
			GetInquiries: `api/inquiries/getInquiries`,
			GetSupportData: `api/inquiries/getSupportData`,
		}),
		Projects: Object.freeze({
			AddProject: `api/projects/addProject`,
			EditProject: `api/projects/editProject`,
			GetProjects: `api/projects/getProjects`,
			GetSupportData: `api/projects/getSupportData`,
		}),
		Setter: `api/setter`,
	}),
	Messages: Object.freeze({
		AccessRevoked: "Your access has been revoked.",
		AddEmployee: "New employee added.",
		AdminCompanyAdded: "New admin company added.",
		AdminCompanyEdit: "Admin company edited.",
		AffiliateAdded: "Affiliate(s) added.",
		ApiCallForbidden: "Invalid API method.",
		BadRequest: "Incompatible request sent.",
		CashFlowEntryAdded: "Cash Flow added.",
		CompanyAdded: "New company added.",
		CompanyEdited: "Company edited.",
		EmployeeEdited: "Employee edited.",
		FilesDeleted: "File(s) deleted.",
		GovernmentIdAdded: "Government ID added.",
		InquiryAdded: "New inquiry added.",
		InquiryClosed: "Inquiry closed.",
		InquiryConvertedToProject: "Inquiry converted to Project.",
		InquiryEdited: "Inquiry edited.",
		InvoiceAdded: "New invoice added.",
		InvalidUser: "Invalid user.",
		InvoiceEdited: "Invoice edited.",
		NoAtSymbolInEmailAddress: "Must contain @ symbol.",
		NoDataFound: "No data found.",
		NoEmailAddress: "Type your email address.",
		NoPassword: "Type your password.",
		NoPeriodSymbolInEmailAddress: "Must contain period (.) symbol.",
		NoteAdded: "New note added.",
		NoteUpdated: "Note updated.",
		ProfileEdited: "Profile edited.",
		ProjectClosed: "Project closed.",
		ProjectEdited: "Project edited.",
		ProjectStatusChanged: "Project status changed.",
		ProjectDeleted: "Project deleted.",
		QuoteEdited: "Quote edited.",
		SettingsUpdated: "Settings updated.",
		SomeErrorOccurred: "Something went wrong. Contact help desk.",
		SpireDomainOnly: "Domain must exactly be spire.com.",
		StatusChanged: "Status updated.",
		TaskAdded: "New task added.",
		TaskDisabled: "Task disabled.",
		TaskEnabled: "Task enabled.",
		TaskUpdated: "Task updated.",
		UnauthorizedAccess: "Unauthorized access.",
	}),
	Modules: Object.freeze({
		Base: Object.freeze({
			Admins: "Admins",
			Affiliates: "Affiliates",
			CashFlow: "Cash Flow",
			Clients: "Clients",
			Companies: "Companies",
			Dashboard: "Dashboard",
			Employees: "Employees",
			Inquiries: "Inquiries",
			Invoices: "Invoices",
			Projects: "Projects",
			References: "References",
			Tasks: "Tasks",
		}),
		Derived: Object.freeze({
			NewAdminCompany: "New Admin Company",
			EditAdminCompany: "Edit Admin Company",
			EditAffiliate: "Edit Affiliate",
			DeleteAffiliate: "Delete Affiliate",
			EditCashFlow: "Edit Cash Flow",
			DeleteCashFlow: "Delete Cash Flow",
			EditClient: "Edit Client",
			DeleteClient: "Delete Client",
			EditCompany: "Edit Company",
			DeleteCompany: "Delete Company",
			EditEmployee: "Edit Employee",
			DeleteEmployee: "Delete Employee",
			NewInquiry: "New Inquiry",
			EditInquiry: "Edit Inquiry",
			DeleteInquiry: "Delete Inquiry",
			ConvertInquiryToProject: "Convert Inquiry To Project",
			GenerateInvoice: "Generate Invoice",
			DeleteInvoice: "Delete Invoice",
			EditProject: "Edit Project",
			DeleteProject: "Delete Project",
			PaymentReceived: "Payment Received",
			EditReference: "Edit Reference",
			DeleteReference: "Delete Reference",
			NewTask: "New Task",
			UpdateTask: "Update Task",
			DisableTask: "Disable Task",
			MarkTaskCompleted: "Mark Task Completed",
			DeleteTaskFromReimbursementVoucher: "Delete Task From Reimbursement Voucher",
		}),
	}),
	Statuses: Object.freeze({
		Inquiries: Object.freeze({
			Closed: "Closed",
			Confirmed: "Confirmed",
			Hold: "Hold",
			Open: "Open",
		}),
		Projects: Object.freeze({
			Active: "Active",
			Cancelled: "Cancelled",
			Closed: "Closed",
			Completed: "Completed",
			Hold: "Hold",
		}),
	}),
	TableHeaders: Object.freeze({
		Inquiries: Object.freeze({
			EntryDate: "Date",
			Client: "Client",
			ContactNumber: "Contact Number",
			MainProject: "Main Project",
			SubProject: "Sub Project",
			Reference: "Reference",
			FollowUps: "Follow Ups",
			Quote: "Quote",
			Status: "Status",
			Notes: "Notes",
			CreatedBy: "Created By",
		}),
		Notes: Object.freeze({
			date: "Date",
			note: "Note",
			writer: "Writer",
		}),
		Projects: Object.freeze({
			Id: "ID",
			GovermentId: "Gov ID",
			Client: "Client",
			Company: "Company",
			MainProject: "Main Project",
			SubProject: "Sub Project",
			Teams: "Teams",
			DueOn: "Due On",
			LastNote: "Last Note",
			Status: "Status",
		}),
	}),
	ToastTypes: Object.freeze({
		Error: "error",
		Information: "info",
		Success: "success",
		Warning: "warning",
	}),
	UserMenu: Object.freeze({
		Activity: "Activities",
		Employees: "Employees",
		Profile: "Profile",
		Settings: "Settings",
		Storage: "Storage",
		Logout: "Logout",
	}),
	UserType: Object.freeze({
		Administrators: "Administrators",
		Employees: "Employees",
	}),
});

export default MyConstants;
