"use client";

/* eslint eqeqeq: "off", no-tabs: "off", indent: "off", react/jsx-indent: "off", semi: "off", comma-dangle: "off", quotes: "off", space-before-function-paren: "off", jsx-quotes: "off", react/jsx-indent-props: "off", react/jsx-closing-bracket-location: "off", array-callback-return: "off", object-shorthand: "off", multiline-ternary: "off", camelcase: "off" */

import axios from "axios";
import MyConstants from "@/utilities/constants";

import { useState } from "react";
import { MyGlobal } from "@/utilities/global";
import { SpinnerSmall } from "@/components/Elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faFile, faFileCircleCheck, faFileCirclePlus, faTrash, faUpload } from "@fortawesome/free-solid-svg-icons";

export default function Files({ close, files, refresh, thisClient }) {
	// Business Logic
	const defaultView = files?.length ? MyConstants.Modules.Other.Files.Existing : MyConstants.Modules.Other.Files.New;

	const [data, setData] = useState({
		activeTab: defaultView,
		files: [],
		pendingResult: {
			deleteFile: { fileIndex: -1, status: false },
			uploadFiles: false,
		},
	});

	const isNew = data.activeTab == MyConstants.Modules.Other.Files.New;

	const headerCellStyle1 = "flex w-4/5 h-9 pl-2 items-center text-left text-white font-medium-10";
	const headerCellStyle2 = "flex w-[10%] h-9 justify-center items-center text-white font-medium-10";

	const rowCellStyle1 = "flex w-4/5 h-9 pl-2 items-center text-left black-text font-regular-10";
	const rowCellStyle2 = "flex w-[10%] h-9 justify-center items-center black-text font-regular-10";

	// Functions
	const deleteFileFromList = (rowIndex) => {
		const old = { ...data.files };
		delete old[rowIndex];

		setData((s) => ({ ...s, files: old }));
	};

	const deleteFileFromStorage = (file, rowIndex) => {
		setData((s) => ({ ...s, pendingResult: { ...s.pendingResult, deleteFile: { fileIndex: rowIndex, status: true } } }));

		const parameters = { clientId: thisClient?.id, fileNames: file?.name };

		axios
			.delete(MyConstants.ApiEndpoints.Clients.DeleteFile, MyGlobal.GetHeaders(parameters))
			.then((response) => {
				if (response.status == 200) {
					refresh();

					MyGlobal.AddActivity(`Deleted ${file?.name} for ${thisClient?.id}.`, "Files");
					MyGlobal.ShowSuccessToast("File(s) deleted.");
				} else {
					MyGlobal.ShowErrorToast("Some error occurred");
				}
			})
			.catch((error) => MyGlobal.HandleErrors(error, "Delete File(s)"))
			.finally(() => setData((s) => ({ ...s, pendingResult: { ...s.pendingResult, deleteFile: { fileIndex: 0, status: false } } })));
	};

	const clearAllSelectedFiles = () => {
		setData((s) => ({ ...s, files: [] }));
	};

	const handleFileSelection = (payload) => {
		setData((s) => ({ ...s, files: payload }));
	};

	const upload = async () => {
		if (Object.values(data.files).length > 0) {
			setData((s) => ({ ...s, pendingResult: { ...s.pendingResult, uploadFiles: true } }));

			const formData = new FormData();
			formData.append("clientId", thisClient?.id);

			[...data.files].forEach((file) => formData.append("files", file));

			try {
				const response = await axios.post(MyConstants.ApiEndpoints.Clients.UploadFiles, formData, {
					headers: {
						"Content-Type": "multipart/form-data",
					},
					maxBodyLength: Infinity,
					maxContentLength: Infinity,
				});

				if (response.status === 200) {
					refresh();
					clearAllSelectedFiles();

					MyGlobal.ShowSuccessToast("Successfully uploaded files.");
					MyGlobal.AddActivity(`Uploaded files of ${thisClient?.id}.`, "Files");
				}
			} catch (error) {
				MyGlobal.ShowErrorToast("Failed to upload files.");
			} finally {
				setData((s) => ({ ...s, pendingResult: { ...s.pendingResult, uploadFiles: false } }));
			}
		}
	};

	// UI Components
	const uiBrowse = () => {
		return (
			<label className="space-x-2 cursor-pointer primary-button-transparent-background" htmlFor="file-upload">
				<FontAwesomeIcon className="primary-text" icon={faFile} />
				<span>Browse</span>
				<input className="hidden" id="file-upload" multiple onChange={(event) => handleFileSelection(event.target.files)} type="file" />
			</label>
		);
	};

	const uiDeleteExistingFile = (file, rowIndex) => {
		if (data.pendingResult.deleteFile.fileIndex == rowIndex && data.pendingResult.deleteFile.status) {
			return <SpinnerSmall />;
		} else {
			return <FontAwesomeIcon className="cursor-pointer red-text" icon={faTrash} onClick={() => deleteFileFromStorage(file, rowIndex)} size="sm" />;
		}
	};

	const uiExisting = () => {
		return (
			<div className="flex flex-col w-full h-[calc(100%-78px)] justify-start items-center overflow-y-hidden">
				{uiExistingFilesDetails()}
				{uiExistingFiles()}
			</div>
		);
	};

	const uiExistingFiles = () => {
		if (!files?.length) {
			return (
				<div className="flex flex-col space-y-2.5 w-full h-full justify-center items-center contrast-background font-regular-12 gray-text">
					<span>No files uploaded.</span>
				</div>
			);
		} else {
			return (
				<div className="flex flex-col w-full h-full justify-start items-center">
					<div className="flex w-full justify-center items-center primary-background bottom-border">
						<span className={headerCellStyle1}>Files</span>
						<span className={headerCellStyle2}>Size</span>
						<span className={headerCellStyle2}>Delete</span>
					</div>
					<div className="w-full h-[calc(100%-99px)] overflow-y-auto">
						{files?.map((file, index) => {
							return (
								<div className="flex w-full left-border bottom-border" key={index}>
									<div className={rowCellStyle1}>
										<span
											className="cursor-pointer hover:underline underline-offset-2 primary-text"
											onClick={() => {
												const link = document.createElement("a");

												link.href = `/${thisClient?.id}/${file.name}`;
												link.download = file.name;
												link.click();
											}}>
											{index + 1}. {file.name}
										</span>
									</div>
									<div className={`${rowCellStyle2} left-border right-border`}>{MyGlobal.FormatBytes(file.size)}</div>
									<div className={`${rowCellStyle2} relative right-border`}>{uiDeleteExistingFile(file, index)}</div>
								</div>
							);
						})}
					</div>
				</div>
			);
		}
	};

	const uiExistingFilesDetails = () => {
		const size = files?.reduce((total, file) => total + Number(file.size), 0);

		return (
			<div className="flex w-full py-2 justify-start items-center font-medium-10 black-text">
				{files?.length > 0 && (
					<div className="flex w-1/2 h-[46px] space-x-2 justify-start items-center">
						<span>Total {MyGlobal.FormatBytes(size)}</span>
					</div>
				)}
			</div>
		);
	};

	const uiNew = () => {
		return (
			<div className="flex flex-col w-full h-[calc(100%-80px)] justify-start items-center overflow-y-hidden">
				{uiSelectedFilesDetails()}
				{uiSelectedFiles()}
			</div>
		);
	};

	const uiSelectedFiles = () => {
		if (!Object.values(data.files).length) {
			return (
				<div className="flex flex-col space-y-2.5 w-full h-full justify-center items-center contrast-background font-regular-12 gray-text">
					<span>No files selected.</span>
					{uiBrowse()}
				</div>
			);
		} else {
			return (
				<div className="flex flex-col w-full h-full justify-start items-center">
					<div className="flex w-full justify-center items-center primary-background bottom-border">
						<span className={headerCellStyle1}>Files</span>
						<span className={headerCellStyle2}>Size</span>
						<span className={headerCellStyle2}>Delete</span>
					</div>
					<div className="w-full h-[calc(100%-99px)] overflow-y-auto">
						{Object.values(data.files).map((file, index) => {
							return (
								<div className="flex w-full left-border bottom-border" key={index}>
									<div className={rowCellStyle1}>
										{index + 1}. {file.name}
									</div>
									<div className={`${rowCellStyle2} left-border right-border`}>{MyGlobal.FormatBytes(file.size)}</div>
									<div className={`${rowCellStyle2} right-border`}>
										<FontAwesomeIcon className="cursor-pointer red-text" icon={faTrash} onClick={() => deleteFileFromList(index)} size="sm" />
									</div>
								</div>
							);
						})}
					</div>
				</div>
			);
		}
	};

	const uiSelectedFilesDetails = () => {
		const size = Object.values(data.files).reduce((total, file) => total + Number(file.size), 0);

		return (
			<div className="flex w-full py-2 justify-between items-center font-medium-10 black-text">
				{Object.values(data.files).length > 0 && (
					<div className="flex w-1/2 h-[46px] space-x-2 justify-start items-center">
						<span>{Object.values(data.files).length} files</span>
						<span>{String.fromCharCode(183)}</span>
						<span>{MyGlobal.FormatBytes(size)}</span>
					</div>
				)}
				{Object.values(data.files).length > 0 && (
					<div className="flex w-1/2 space-x-2.5 justify-end items-center">
						{uiUpload()}
						<button className="space-x-1.5 red-button-transparent-background" onClick={() => clearAllSelectedFiles()}>
							<FontAwesomeIcon className="red-text" icon={faTrash} />
							<span>Clear All</span>
						</button>
					</div>
				)}
			</div>
		);
	};

	const uiTabsContent = () => {
		switch (data.activeTab) {
			case MyConstants.Modules.Other.Files.Existing:
				return uiExisting();
			case MyConstants.Modules.Other.Files.New:
				return uiNew();
		}
	};

	const uiTabs = () => {
		return Object.values(MyConstants.Modules.Other.Files).map((tab, index) => {
			const icon = index == 0 ? faFileCircleCheck : faFileCirclePlus;
			const aesthetics = isNew ? "green-background-transparent-01 green-text" : "primary-background-transparent-01 primary-text";
			const counts = files?.length;
			const counterStyle = tab == MyConstants.Modules.Other.Files.Existing && counts > 0 ? "block font-regular-9 gray-text" : "hidden";
			const background = tab == data.activeTab ? aesthetics : "bg-transparent gray-text";
			const wrapper = `flex w-full px-5 py-2 space-x-2 justify-between items-center ${background} font-medium-11`;

			return (
				<button key={index} className={wrapper} onClick={() => setData((s) => ({ ...s, activeTab: tab }))}>
					<div className="flex space-x-2 justify-center items-center">
						<FontAwesomeIcon icon={icon} />
						<span>{tab}</span>
					</div>
					<span className={counterStyle}>{counts}</span>
				</button>
			);
		});
	};

	const uiUpload = () => {
		return (
			<button className="primary-button-transparent-background" onClick={() => upload()}>
				{uiUploadButton()}
			</button>
		);
	};

	const uiUploadButton = () => {
		if (data.pendingResult.uploadFiles) {
			return (
				<span className="flex px-3.5 justify-center items-center relative">
					<SpinnerSmall />
				</span>
			);
		} else {
			return (
				<div className="flex space-x-2 justify-center items-center">
					<FontAwesomeIcon className="primary-text" icon={faUpload} />
					<span>Upload</span>
				</div>
			);
		}
	};

	// Main UI
	return (
		<>
			<div className="flex w-full px-5 py-2.5 justify-between items-center bottom-border">
				<div className="flex w-full space-x-2.5 justify-start items-center">
					<FontAwesomeIcon className="pr-1 cursor-pointer black-text" icon={faChevronLeft} onClick={() => close()} />
					<div className="flex w-full justify-start items-center">
						<span className="view-heading">{thisClient?.name}'s Files</span>
					</div>
				</div>
			</div>
			<div className="flex w-full h-full justify-center items-center contrast-background">
				<div className="flex flex-col w-1/6 h-full py-4 space-y-1.5 justify-start items-center">{uiTabs()}</div>
				<div className="flex flex-col w-5/6 h-full px-5 justify-start items-center left-border">{uiTabsContent()}</div>
			</div>
		</>
	);
}
