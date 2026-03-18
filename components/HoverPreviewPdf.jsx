"use client";

import PreviewPdf from "./PreviewPdf";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faIndianRupee } from "@fortawesome/free-solid-svg-icons";

export default function HoverPreviewWrapper({ fileUrl }) {
	const [hovering, setHovering] = useState(false);

	return (
		<div style={{ position: "relative", display: "inline-block" }} onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
			<FontAwesomeIcon className="w-5 text-amber-600 cursor-pointer scale-100 hover:scale-150 duration-200" icon={faIndianRupee} size="1x" />
			<PreviewPdf fileUrl={fileUrl} visible={hovering} />
		</div>
	);
}
