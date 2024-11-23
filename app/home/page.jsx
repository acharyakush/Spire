"use client";

// Imports
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import Toolbar from "@mui/material/Toolbar";
import Divider from "@mui/material/Divider";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import ListItem from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import CssBaseline from "@mui/material/CssBaseline";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { styled } from "@mui/material/styles";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { applicationName, MyGlobal } from "@/utilities/global";
import { AccountCircleRounded, InboxRounded, MailLockRounded, MailRounded, NotificationsRounded } from "@mui/icons-material";

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
const AppBar = styled(MuiAppBar, { shouldForwardProp: (prop) => prop !== "open" })(({ theme }) => ({
	transition: theme.transitions.create(["width", "margin"], {
		easing: theme.transitions.easing.easeInOut,
		duration: theme.transitions.duration.leavingScreen,
	}),
	variants: [
		{
			props: ({ open }) => open,
			style: {
				marginLeft: sidebarWidth,
				width: `calc(100% - ${sidebarWidth}px)`,
				transition: theme.transitions.create(["width", "margin"], {
					easing: theme.transitions.easing.easeInOut,
					duration: theme.transitions.duration.enteringScreen,
				}),
			},
		},
	],
	zIndex: theme.zIndex.drawer + 1,
}));

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
export default function Home() {
	// Business Logic
	const router = useRouter();

	const [hasMounted, setHasMounted] = useState({ contextMenu: false, sidebar: false });
	const [otherData, setOtherData] = useState({ contextMenuAnchor: null });

	// Functions
	const logout = () => {
		router.replace("/");
	};

	const setContextMenuAnchor = (event) => {
		setOtherData((old) => ({ ...old, contextMenuAnchor: event.currentTarget }));
	};

	const setPageTitle = () => {
		const loggedInUserDetails = MyGlobal.Storages.local.doesExist(`${applicationName.toLocaleLowerCase()}_user_details`);

		if (loggedInUserDetails) {
			const userDetails = MyGlobal.Storages.local.get(`${applicationName.toLocaleLowerCase()}_user_details`);
			const parsedUserDetails = typeof userDetails === "string" && JSON.parse(userDetails);

			return `${parsedUserDetails?.user?.first_name} ${parsedUserDetails?.user?.last_name} :: ${applicationName}`;
		}
	};

	const toggleContextMenu = () => {
		if (!hasMounted.contextMenu) {
			setHasMounted((old) => ({ ...old, contextMenu: false }));
			setOtherData((old) => ({ ...old, contextMenuAnchor: null }));
		} else {
			setHasMounted((old) => ({ ...old, contextMenu: true }));
		}
	};

	const toggleSidebar = () => {
		setHasMounted((old) => ({ ...old, sidebar: !hasMounted.sidebar }));
	};

	// UI Components
	const ContextMenu = () => {
		return (
			<Menu
				anchorEl={otherData.contextMenuAnchor}
				anchorOrigin={{ horizontal: "right", vertical: "top" }}
				id="primaryContextMenu"
				keepMounted
				onClose={toggleContextMenu}
				open={Boolean(otherData.contextMenuAnchor)}
				sx={{ mt: "45px" }}
				transformOrigin={{ horizontal: "right", vertical: "top" }}>
				<MenuItem onClick={toggleContextMenu}>Profile</MenuItem>
				<MenuItem onClick={toggleContextMenu}>My account</MenuItem>
				<MenuItem onClick={logout}>Logout</MenuItem>
			</Menu>
		);
	};

	// Hooks
	useEffect(() => {
		document.title = setPageTitle();
	}, []);

	// Main UI
	return (
		<Box sx={{ display: "flex" }}>
			<CssBaseline />
			<AppBar
				position="fixed"
				sx={{ ml: `${!hasMounted.sidebar ? 65 : sidebarWidth}px)`, width: `calc(100% - ${!hasMounted.sidebar ? 65 : sidebarWidth}px)` }}>
				<Toolbar>
					<Typography component="div" noWrap variant="h5">
						{applicationName.toUpperCase()}
					</Typography>
					<Box sx={{ flexGrow: 1 }} />
					<Box>
						<IconButton color="inherit" size="large">
							<MailRounded />
						</IconButton>
						<IconButton color="inherit" size="large">
							<NotificationsRounded />
						</IconButton>
						<IconButton color="inherit" edge="end" onClick={setContextMenuAnchor} size="large">
							<AccountCircleRounded />
						</IconButton>
					</Box>
				</Toolbar>
			</AppBar>
			<ContextMenu />
			<Sidebar onMouseEnter={toggleSidebar} onMouseLeave={toggleSidebar} open={hasMounted.sidebar} variant="permanent">
				<Divider />
				<List>
					{["Inbox", "Starred", "Send email", "Drafts"].map((text, index) => (
						<ListItem disablePadding key={text} sx={{ display: "block" }}>
							<ListItemButton sx={[{ justifyContent: hasMounted.sidebar ? "initial" : "center", minHeight: 48, px: 2.5 }]}>
								<ListItemIcon sx={[{ justifyContent: "center", minWidth: 0, mr: hasMounted.sidebar ? 3 : "auto" }]}>
									{index % 2 === 0 ? <InboxRounded /> : <MailLockRounded />}
								</ListItemIcon>
								<ListItemText primary={text} sx={[{ opacity: hasMounted.sidebar ? 1 : 0 }]} />
							</ListItemButton>
						</ListItem>
					))}
				</List>
				<Divider />
				<List>
					{["All mail", "Trash", "Spam"].map((text, index) => (
						<ListItem disablePadding key={text} sx={{ display: "block" }}>
							<ListItemButton sx={[{ justifyContent: hasMounted.sidebar ? "initial" : "center", minHeight: 48, px: 2.5 }]}>
								<ListItemIcon sx={[{ justifyContent: "center", minWidth: 0, mr: hasMounted.sidebar ? 3 : "auto" }]}>
									{index % 2 === 0 ? <InboxRounded /> : <MailLockRounded />}
								</ListItemIcon>
								<ListItemText primary={text} sx={[{ opacity: hasMounted.sidebar ? 1 : 0 }]} />
							</ListItemButton>
						</ListItem>
					))}
				</List>
			</Sidebar>
			<Box component="main" sx={{ flexGrow: 1, p: 3 }}>
				<SidebarHeader />
				<Typography sx={{ marginBottom: 2 }}>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
					Rhoncus dolor purus non enim praesent elementum facilisis leo vel. Risus at ultrices mi tempus imperdiet. Semper risus in
					hendrerit gravida rutrum quisque non tellus. Convallis convallis tellus id interdum velit laoreet id donec ultrices. Odio morbi
					quis commodo odio aenean sed adipiscing. Amet nisl suscipit adipiscing bibendum est ultricies integer quis. Cursus euismod quis
					viverra nibh cras. Metus vulputate eu scelerisque felis imperdiet proin fermentum leo. Mauris commodo quis imperdiet massa
					tincidunt. Cras tincidunt lobortis feugiat vivamus at augue. At augue eget arcu dictum varius duis at consectetur lorem. Velit sed
					ullamcorper morbi tincidunt. Lorem donec massa sapien faucibus et molestie ac.
				</Typography>
				<Typography sx={{ marginBottom: 2 }}>
					Consequat mauris nunc congue nisi vitae suscipit. Fringilla est ullamcorper eget nulla facilisi etiam dignissim diam. Pulvinar
					elementum integer enim neque volutpat ac tincidunt. Ornare suspendisse sed nisi lacus sed viverra tellus. Purus sit amet volutpat
					consequat mauris. Elementum eu facilisis sed odio morbi. Euismod lacinia at quis risus sed vulputate odio. Morbi tincidunt ornare
					massa eget egestas purus viverra accumsan in. In hendrerit gravida rutrum quisque non tellus orci ac. Pellentesque nec nam aliquam
					sem et tortor. Habitant morbi tristique senectus et. Adipiscing elit duis tristique sollicitudin nibh sit. Ornare aenean euismod
					elementum nisi quis eleifend. Commodo viverra maecenas accumsan lacus vel facilisis. Nulla posuere sollicitudin aliquam ultrices
					sagittis orci a.
				</Typography>
			</Box>
		</Box>
	);
}
