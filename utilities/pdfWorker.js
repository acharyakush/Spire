// utils/pdfWorker.js
"use client";

import { GlobalWorkerOptions } from "pdfjs-dist/build/pdf.mjs";

GlobalWorkerOptions.workerSrc = new URL(
	"pdfjs-dist/build/pdf.worker.min.mjs",
	import.meta.url
).toString();
