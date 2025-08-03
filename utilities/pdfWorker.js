// utils/pdfWorker.js
import { GlobalWorkerOptions } from "pdfjs-dist/build/pdf";
import pdfWorkerPath from "pdfjs-dist/build/pdf.worker.min.js";

GlobalWorkerOptions.workerSrc = pdfWorkerPath;
