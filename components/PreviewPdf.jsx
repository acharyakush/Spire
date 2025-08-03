"use client";

import { useEffect, useRef } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

GlobalWorkerOptions.workerSrc = "/pdf.worker.js";

export default function PreviewPdf({ fileUrl, visible }) {
	const canvasRef = useRef(null);

	useEffect(() => {
		if (!visible || !fileUrl) return;

		let canceled = false;

		const loadPdfPreview = async () => {
			try {
				const loadingTask = getDocument(fileUrl);
				const pdf = await loadingTask.promise;
				const page = await pdf.getPage(1);

				const viewport = page.getViewport({ scale: 1.5 });
				const canvas = canvasRef.current;
				if (!canvas) return;

				canvas.width = viewport.width;
				canvas.height = viewport.height;

				const context = canvas.getContext("2d");

				await page.render({
					canvasContext: context,
					viewport,
				}).promise;
			} catch (error) {
				console.error("Failed to load PDF preview: ", error);

				const canvas = canvasRef.current;
				if (canvas) {
					const ctx = canvas.getContext("2d");
					canvas.width = 200;
					canvas.height = 50;
					ctx.fillStyle = "#f8d7da";
					ctx.fillRect(0, 0, 200, 50);
					ctx.fillStyle = "#721c24";
					ctx.font = "12px sans-serif";
					ctx.fillText("PDF not found", 10, 30);
				}
			}
		};

		loadPdfPreview();

		return () => {
			canceled = true;
		};
	}, [fileUrl, visible]);

	if (!visible) return null;

	return (
		<div
			style={{
				position: "absolute",
				top: "100%",
				right: "0",
				zIndex: 999,
				padding: "0px",
				backgroundColor: "white",
				boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
				maxHeight: "300px",
				overflow: "auto",
				borderRadius: "4px",
			}}>
			<canvas ref={canvasRef} />
		</div>
	);
}
