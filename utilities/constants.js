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
		AddActivity: "/api/add-activity",
		Authenticate: "/api/authenticate",
		GetData: "/api/get-data",
		Admins: `api/admins`,
		Affiliates: Object.freeze({
			Handler: `api/affiliates/handler`,
			SingleAffiliate: `api/affiliates/details`,
		}),
		Authenticate: `api/authenticate`,
		CashFlows: Object.freeze({
			AdjustAffiliateFees: `api/cash-flows/adjust-affiliate-fees`,
			DeleteCashFlow: `api/cash-flows/delete-cash-flow`,
			EditCashFlow: `api/cash-flows/edit-cash-flow`,
			Handler: `api/cash-flows/handler`,
		}),
		Clients: Object.freeze({
			DeleteFile: `api/clients/delete-file`,
			GetAllClients: `api/clients/all-clients`,
			GetAllFiles: `api/clients/all-files`,
			GetDetails: `api/clients/details`,
			UploadFiles: `api/clients/upload-files`,
		}),
		Dashboard: Object.freeze({
			GetRequiredData: `api/dashboard/handler`,
			GetTasksProject: `api/dashboard/get-tasks-project`,
			HandleNotes: `api/dashboard/handle-notes`,
		}),
		Getter: `api/getter`,
		GetInvoices: `api/invoices`,
		GetStaff: `api/staff`,
		Inquiries: Object.freeze({
			GetAllInquiries: `api/inquiries/all-inquiries`,
			Handler: `api/inquiries/handler`,
		}),
		ErrorLogger: `api/errorLogger`,
		Projects: Object.freeze({
			DeleteProject: `api/projects/delete-project`,
			EditProject: `api/projects/edit-project`,
			GetDetails: `api/projects/details`,
			GetStatus: `api/projects/status`,
			Handler: `api/projects/handler`,
			MapAffiliates: `api/projects/map-affiliates`,
		}),
		Settings: `api/settings`,
		SingleProject: Object.freeze({
			GenerateInvoice: `api/single-project/generate-invoice`,
			HandleTasks: `api/single-project/handle-tasks`,
		}),
		Setter: `api/setter`,
		UploadKycFiles: `api/upload-kyc-files`,
		UserActivities: `api/user-activities`,
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
		InquiryUpdated: "Inquiry updated.",
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
		ProjectEdited: "Project edited.",
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
	PrimaryModules: Object.freeze({
		Dashboard: "Dashboard",
		Inquiry: "Inquiry",
		Projects: "Projects",
		Clients: "Clients",
		Affiliates: "Affiliates",
		Admins: "Admins",
		Invoices: "Invoices",
		CashFlow: "Cash Flow",
	}),
	Statuses: Object.freeze({
		Inquiries: Object.freeze({
			Closed: "Closed",
			Confirmed: "Confirmed",
			Hold: "Hold",
			Open: "Open",
		}),
	}),
	TableHeaders: Object.freeze({
		Inquiries: [
			"Entry Date",
			"Client",
			"Contact Number",
			"Main Project",
			"Sub Project",
			"Reference",
			"Follow Ups",
			"Quote",
			"Status",
			"Notes",
			"Created By",
			"Inquiry Type",
		],
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
