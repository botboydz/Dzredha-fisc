"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  Upload,
  FileText,
  Loader2,
  AlertCircle,
  X,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ParsedRow {
  itemNumber: string;
  description: string;
  dimensions: string;
  quantity: string;
  specialNotes: string;
}

interface UploadState {
  file: File | null;
  status: "idle" | "reading" | "processing" | "done" | "error";
  error: string | null;
  result: ParsedRow[];
}

/* ------------------------------------------------------------------ */
/*  Markdown-table parser                                              */
/* ------------------------------------------------------------------ */

function parseMarkdownTable(md: string): ParsedRow[] {
  const lines = md
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("|"));

  if (lines.length < 3) return []; // header + separator + at least 1 row

  // Skip the header line (index 0) and the separator line (index 1)
  const dataLines = lines.slice(2);

  return dataLines
    .map((line) => {
      const cells = line
        .split("|")
        .map((c) => c.trim())
        .filter(Boolean);
      if (cells.length < 5) return null;
      return {
        itemNumber: cells[0],
        description: cells[1],
        dimensions: cells[2],
        quantity: cells[3],
        specialNotes: cells[4],
      };
    })
    .filter((row): row is ParsedRow => row !== null);
}

/* ------------------------------------------------------------------ */
/*  Spinner component                                                  */
/* ------------------------------------------------------------------ */

function Spinner() {
  return (
    <div className="flex flex-col items-center gap-4 py-12">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[#2563eb]" />
      </div>
      <p className="text-sm font-medium text-gray-500">Analyzing blueprint...</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function Home() {
  const [state, setState] = useState<UploadState>({
    file: null,
    status: "idle",
    error: null,
    result: [],
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  /* ---- helpers ---- */

  const reset = useCallback(() => {
    setState({ file: null, status: "idle", error: null, result: [] });
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const handleFile = useCallback((file: File) => {
    if (file.type !== "application/pdf") {
      setState((s) => ({ ...s, error: "Please upload a PDF file.", status: "error" }));
      return;
    }
    setState({ file, status: "idle", error: null, result: [] });
  }, []);

  /* ---- file-input handlers ---- */

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => setDragOver(false), []);

  /* ---- process PDF ---- */

  const processPdf = useCallback(async () => {
    if (!state.file) return;

    setState((s) => ({ ...s, status: "reading", error: null }));

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove the data URI prefix (e.g. "data:application/pdf;base64,")
          const base64Data = result.split(",")[1];
          if (!base64Data) {
            reject(new Error("Failed to read PDF data."));
            return;
          }
          resolve(base64Data);
        };
        reader.onerror = () => reject(new Error("Failed to read the file."));
        reader.readAsDataURL(state.file!);
      });

      setState((s) => ({ ...s, status: "processing" }));

      // Send to API
      const response = await fetch("/api/process-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfBase64: base64 }),
      });

      const data = await response.json();

      if (!response.ok) {
        setState((s) => ({
          ...s,
          status: "error",
          error: data.error || "An unexpected error occurred.",
        }));
        return;
      }

      const rawResult: string = data.result || "";

      // Check for the error sentinel from the system prompt
      if (rawResult.includes("Error: Could not extract valid specifications")) {
        setState((s) => ({
          ...s,
          status: "error",
          error: "Could not extract valid specifications from this document. Please ensure the PDF contains blueprint or specification content.",
        }));
        return;
      }

      const rows = parseMarkdownTable(rawResult);

      if (rows.length === 0) {
        // If parsing failed but we got a response, show raw markdown
        setState((s) => ({
          ...s,
          status: "done",
          result: [],
          error: rawResult
            ? `The AI returned data but it could not be parsed into a table. Raw output:\n\n${rawResult}`
            : "No specifications could be extracted from this document.",
        }));
        return;
      }

      setState((s) => ({ ...s, status: "done", result: rows }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setState((s) => ({ ...s, status: "error", error: message }));
    }
  }, [state.file]);

  /* ---- derived booleans ---- */

  const isProcessing = state.status === "reading" || state.status === "processing";
  const canProcess = state.file !== null && !isProcessing && state.status !== "error";

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ---------- Header ---------- */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563eb]">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-gray-900">
              SpecMatch
            </span>
          </div>
          <span className="text-xs text-gray-400 hidden sm:inline">
            AI-Powered Specification Extractor
          </span>
        </div>
      </header>

      {/* ---------- Main Content ---------- */}
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
          {/* Hero */}
          <section className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-3">
              Extract Specifications Instantly
            </h1>
            <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              Upload a PDF blueprint, schematic, or RFP and let AI extract every
              specification, material, dimension, and quantity into a clean, structured table.
            </p>
          </section>

          {/* Upload Zone */}
          <section className="mb-8">
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => !isProcessing && inputRef.current?.click()}
              className={`
                relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed
                py-12 px-6 cursor-pointer transition-all duration-200
                ${
                  dragOver
                    ? "border-[#2563eb] bg-blue-50/60"
                    : state.file
                    ? "border-gray-300 bg-gray-50/60"
                    : "border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50/40"
                }
                ${isProcessing ? "pointer-events-none opacity-60" : ""}
              `}
            >
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf"
                onChange={onInputChange}
                className="hidden"
                disabled={isProcessing}
              />

              {!state.file ? (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                    <Upload className="h-5 w-5 text-[#2563eb]" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    Drop your Blueprint PDF here or click to upload
                  </p>
                  <p className="text-xs text-gray-400">Supports PDF files only</p>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                    <FileText className="h-5 w-5 text-[#2563eb]" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-800 truncate max-w-[240px] sm:max-w-[360px]">
                      {state.file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(state.file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  {!isProcessing && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        reset();
                      }}
                      className="ml-2 flex h-7 w-7 items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                      aria-label="Remove file"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Action Button */}
          <section className="flex justify-center mb-10">
            <Button
              onClick={processPdf}
              disabled={!canProcess}
              size="lg"
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium px-8 gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Process Blueprint
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </section>

          {/* Loading Spinner */}
          {isProcessing && <Spinner />}

          {/* Error Display */}
          {state.status === "error" && state.error && (
            <div className="mb-10 rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Processing Error</p>
                <p className="text-sm text-red-600 mt-1 whitespace-pre-wrap">{state.error}</p>
              </div>
            </div>
          )}

          {/* Results Table */}
          {state.status === "done" && state.result.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Extracted Specifications
                </h2>
                <span className="text-xs text-gray-400">
                  {state.result.length} item{state.result.length !== 1 ? "s" : ""} found
                </span>
              </div>

              <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#2563eb] sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                          Item #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                          Description / Material
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                          Dimensions / Size
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                          Special Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {state.result.map((row, i) => (
                        <tr
                          key={i}
                          className={
                            i % 2 === 0
                              ? "bg-white"
                              : "bg-gray-50"
                          }
                        >
                          <td className="px-4 py-3 text-gray-700 font-medium whitespace-nowrap">
                            {row.itemNumber}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {row.description}
                          </td>
                          <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                            {row.dimensions}
                          </td>
                          <td className="px-4 py-3 text-gray-700 text-center whitespace-nowrap">
                            {row.quantity}
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-sm">
                            {row.specialNotes}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Re-process button */}
              <div className="flex justify-center mt-8">
                <Button
                  variant="outline"
                  onClick={reset}
                  className="gap-2 cursor-pointer"
                >
                  Upload Another PDF
                </Button>
              </div>
            </section>
          )}

          {/* Done but empty result with no error message (shouldn't happen often) */}
          {state.status === "done" && state.result.length === 0 && !state.error && (
            <div className="text-center py-10 text-gray-400 text-sm">
              No specifications found in this document.
            </div>
          )}

          {/* Done but with error message (e.g. couldn't parse) */}
          {state.status === "done" && state.result.length === 0 && state.error && (
            <div className="mb-10 rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">Parsing Notice</p>
                <p className="text-sm text-amber-700 mt-1 whitespace-pre-wrap">{state.error}</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-gray-100 py-6 text-center">
        <p className="text-xs text-gray-400">
          SpecMatch &mdash; Powered by Claude AI
        </p>
      </footer>
    </div>
  );
}
