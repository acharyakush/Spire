"use client";

// Imports
import axios from "axios";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import MuiDrawer from "@mui/material/Drawer";
import ListItem from "@mui/material/ListItem";
import MyConstants from "@/utilities/constants";
import Typography from "@mui/material/Typography";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { styled } from "@mui/material/styles";
import { useSnackbar } from "../providers/SnackBar";
import { applicationName, MyGlobal } from "@/utilities/global";
import { Avatar, Collapse, IconButton, Stack } from "@mui/material";
import {
	AccountTreeRounded,
	BadgeRounded,
	DashboardRounded,
	ExpandLessRounded,
	ExpandMoreRounded,
	FactoryRounded,
	GroupAddRounded,
	LogoutRounded,
	MultipleStopRounded,
	PeopleAltRounded,
	PlaylistAddCheckRounded,
	QuizRounded,
	ReceiptRounded,
	StarRounded,
	SupervisorAccountRounded,
} from "@mui/icons-material";

// Business Logic
const sidebarWidth = 240;

const closedMixin = (theme) => ({
	overflowX: "hidden",
	transition: theme.transitions.create("width", {
		easing: theme.transitions.easing.easeInOut,
		duration: theme.transitions.duration.leavingScreen,
	}),
	width: `calc(${theme.spacing(7)} + 1px)`,
	[theme.breakpoints.up("sm")]: {
		width: `calc(${theme.spacing(8)} + 1px)`,
	},
});

const openedMixin = (theme) => ({
	overflowX: "hidden",
	transition: theme.transitions.create("width", {
		easing: theme.transitions.easing.easeInOut,
		duration: theme.transitions.duration.enteringScreen,
	}),
	width: sidebarWidth,
});

// Functions
const Sidebar = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== "open" })(({ theme }) => ({
	boxSizing: "border-box",
	flexShrink: 0,
	variants: [
		{
			props: ({ open }) => open,
			style: { ...openedMixin(theme), "& .MuiDrawer-paper": openedMixin(theme) },
		},
		{
			props: ({ open }) => !open,
			style: { ...closedMixin(theme), "& .MuiDrawer-paper": closedMixin(theme) },
		},
	],
	whiteSpace: "nowrap",
	width: sidebarWidth,
}));

const SidebarHeader = styled("div")(({ theme }) => ({
	alignItems: "center",
	display: "flex",
	justifyContent: "flex-end",
	padding: theme.spacing(0, 1),
	// necessary for content to be below app bar
	...theme.mixins.toolbar,
}));

// Component
export default function MySidebar() {
	// Business Logic
	const router = useRouter();
	const showSnackbar = useSnackbar();

	const [hasMounted, setHasMounted] = useState({ sidebar: false });
	const [otherData, setOtherData] = useState({ modules: [] });

	const loggedInUserDetails = MyGlobal.getLoggedInUserDetails();

	// Functions
	const getAllPermissions = async () => {
		try {
			const response = await axios.get(MyConstants.API_ENDPOINTS.getPermissions);

			const revisedModules = response.data.reduce((group, currentItem) => {
				if (currentItem.type === "Base") {
					// Create a new group for the Base item
					group.push({ ...currentItem, children: [], is_expanded: false });
				} else {
					// Find the parent in the same module and add this as a child
					const parent = group.find((group) => group.module === currentItem.module && group.type === "Base");

					if (parent) {
						if (currentItem.sidebar_visibility) {
							parent.children.push(currentItem);
						}
					}
				}
				return group;
			}, []);

			setOtherData((old) => ({ ...old, modules: revisedModules }));
		} catch (error) {
			if ("response" in error) {
				showSnackbar(error.response.data.error, MyConstants.NOTIFICATION_TYPES.error);
			}
		}
	};

	const getModuleIcon = (module) => {
		switch (module) {
			case "Affiliates":
				return <SupervisorAccountRounded fontSize="small" />;
			case "Cash Flow":
				return <MultipleStopRounded fontSize="small" sx={{ transform: "rotate(90deg)" }} />;
			case "Clients":
				return <PeopleAltRounded fontSize="small" />;
			case "Companies":
				return <FactoryRounded fontSize="small" />;
			case "Dashboard":
				return <DashboardRounded fontSize="small" />;
			case "Employees":
				return <BadgeRounded fontSize="small" />;
			case "Invoices":
				return <ReceiptRounded fontSize="small" />;
			case "Inquiry":
				return <QuizRounded fontSize="small" />;
			case "Admins":
				return <StarRounded fontSize="small" />;
			case "Projects":
				return <AccountTreeRounded fontSize="small" />;
			case "References":
				return <GroupAddRounded fontSize="small" />;
			case "Tasks":
				return <PlaylistAddCheckRounded fontSize="small" />;
		}
	};

	const logout = () => {
		router.replace("/");
	};

	const setPageTitle = () => {
		return `${loggedInUserDetails?.user?.first_name} ${loggedInUserDetails?.user?.last_name} :: ${applicationName}`;
	};

	const toggleModuleChildren = (module) => {
		const oldModules = [...otherData.modules];

		const updatedModule = oldModules.filter((_module) => _module.id == module.id).at(0);
		updatedModule.is_expanded = !updatedModule.is_expanded;

		const revisedModules = oldModules.filter((_module) => _module.id != module.id);
		revisedModules.push(updatedModule);
		revisedModules.sort((a, b) => a.id - b.id);

		setOtherData((old) => ({ ...old, modules: revisedModules }));
	};

	const toggleSidebar = () => {
		setHasMounted((old) => ({ ...old, sidebar: !hasMounted.sidebar }));
	};

	// UI Components
	const uiModules = () => {
		return otherData.modules.map((module, index) => {
			return (
				<ListItem disablePadding key={module.id} sx={{ display: "block" }}>
					<ListItemButton
						onClick={() => toggleModuleChildren(module)}
						sx={[{ justifyContent: hasMounted.sidebar ? "initial" : "center", minHeight: 24, px: 2.5 }]}>
						<ListItemIcon sx={[{ justifyContent: "center", minWidth: 0, mr: hasMounted.sidebar ? 3 : "auto" }]}>
							{getModuleIcon(module.module)}
						</ListItemIcon>
						<ListItemText primary={module.module} sx={[{ opacity: hasMounted.sidebar ? 1 : 0 }]} />
						{uiToggleChildrenArrows(module)}
					</ListItemButton>
					<Collapse in={module.is_expanded} key={index} timeout="auto" unmountOnExit>
						{uiModulesChild(module)}
					</Collapse>
				</ListItem>
			);
		});
	};

	const uiModulesChild = (module) => {
		return module.children.map((child) => {
			return (
				<List component="div" dense disablePadding key={child.id}>
					<ListItemButton>
						<ListItemText inset primary={child.name} />
					</ListItemButton>
				</List>
			);
		});
	};

	const uiToggleChildrenArrows = (module) => {
		if (hasMounted.sidebar) {
			if (module.children.length) {
				return module.is_expanded ? <ExpandLessRounded /> : <ExpandMoreRounded />;
			}
		}
	};

	// Hooks
	useEffect(() => {
		document.title = setPageTitle();
		getAllPermissions();
	}, []);

	// Main UI
	return (
		<Box sx={{ display: "flex" }}>
			<Sidebar
				className="flex flex-col h-screen justify-between"
				onMouseEnter={toggleSidebar}
				onMouseLeave={toggleSidebar}
				open={hasMounted.sidebar}
				variant="permanent">
				<SidebarHeader>
					<Typography className="flex w-full justify-center items-center !font-semibold" component="h3" noWrap variant="h4">
						{!hasMounted.sidebar ? applicationName.charAt(0) : applicationName.toUpperCase()}
					</Typography>
				</SidebarHeader>
				<Divider />
				<List dense>{uiModules()}</List>
				<Divider />
				<Box className="flex flex-col w-full py-4 mt-auto justify-center items-center">
					{hasMounted.sidebar ? (
						<Box
							sx={{
								alignItems: "center",
								display: "flex",
								justifyContent: "space-between",
								paddingLeft: 3,
								paddingRight: 2,
								width: "100%",
							}}>
							<Stack>
								<Typography variant="subtitle1">
									{loggedInUserDetails?.user?.first_name} {loggedInUserDetails?.user?.last_name?.charAt(0)}.
								</Typography>
								<Typography variant="caption">{loggedInUserDetails?.user?.designation}</Typography>
							</Stack>
							<IconButton color="neutral" onClick={logout} size="small" variant="plain">
								<LogoutRounded />
							</IconButton>
						</Box>
					) : (
						<Avatar
							className="!text-sm"
							sx={{ width: 24, height: 24 }}
							{...MyGlobal.stringAvatar(`${loggedInUserDetails?.user?.first_name} ${loggedInUserDetails?.user?.last_name}`)}
						/>
					)}
				</Box>
			</Sidebar>
		</Box>
	);
}
