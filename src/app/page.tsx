"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  Upload,
  FileText,
  Loader2,
  AlertCircle,
  X,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Zap,
  Shield,
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

  if (lines.length < 3) return [];

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
/*  Loading component with pulsing dots                                */
/* ------------------------------------------------------------------ */

function AnalyzingLoader() {
  return (
    <div className="flex flex-col items-center gap-5 py-14 animate-fade-in-up">
      <div className="relative">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Sparkles className="h-7 w-7 text-white" />
        </div>
        <div className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-600/20 blur-xl animate-pulse" />
      </div>
      <div className="text-center">
        <p className="text-base font-semibold text-gray-800 mb-1">Analyzing blueprint</p>
        <div className="dot-loader mt-2">
          <span />
          <span />
          <span />
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Extracting specifications with AI
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Feature cards for hero section                                     */
/* ------------------------------------------------------------------ */

const features = [
  {
    icon: Zap,
    title: "Instant Extraction",
    desc: "AI reads your entire PDF in seconds",
  },
  {
    icon: Sparkles,
    title: "Smart Parsing",
    desc: "Materials, dimensions, quantities",
  },
  {
    icon: Shield,
    title: "Precise Results",
    desc: "Every spec captured, nothing missed",
  },
];

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
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
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
  const showResults = state.status === "done" && state.result.length > 0;

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] relative overflow-hidden">
      {/* ---- Animated mesh gradient background ---- */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="mesh-blob mesh-blob-1" />
        <div className="mesh-blob mesh-blob-2" />
        <div className="mesh-blob mesh-blob-3" />
      </div>

      {/* ---------- Glassmorphism Header ---------- */}
      <header className="sticky top-0 z-30 border-b border-white/40 bg-white/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-md shadow-blue-500/20">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight gradient-text">
              SpecMatch
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-white/70 backdrop-blur-sm px-3 py-1.5 border border-gray-200/50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-medium text-gray-500">AI Ready</span>
          </div>
        </div>
      </header>

      {/* ---------- Main Content ---------- */}
      <main className="flex-1 relative z-10">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10 sm:py-16">
          {/* Hero */}
          {!showResults && (
            <section className="text-center mb-10 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-4 py-1.5 mb-6">
                <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-xs font-semibold text-blue-600 tracking-wide uppercase">
                  AI-Powered Extraction
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 leading-[1.1]">
                <span className="gradient-text">Extract Specs</span>
                <br />
                <span className="text-gray-900">From Any Blueprint</span>
              </h1>
              <p className="text-gray-500 max-w-lg mx-auto text-base sm:text-lg leading-relaxed">
                Upload a PDF blueprint, schematic, or RFP and let AI extract
                every specification into a clean, structured table.
              </p>
            </section>
          )}

          {/* Feature cards — only show when idle */}
          {!state.file && state.status === "idle" && (
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 animate-fade-in-up-delay">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="group rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-200/60 p-5 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-100/50 mb-3 group-hover:scale-110 transition-transform duration-300">
                    <f.icon className="h-5 w-5 text-blue-500" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-1">{f.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </section>
          )}

          {/* Upload Zone */}
          <section className="mb-8">
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => !isProcessing && inputRef.current?.click()}
              className={`
                gradient-border
                relative flex flex-col items-center justify-center gap-4
                py-14 px-6 cursor-pointer transition-all duration-300
                bg-white/80 backdrop-blur-sm
                ${dragOver ? "drag-over active" : state.file ? "active" : ""}
                ${isProcessing ? "pointer-events-none opacity-60" : ""}
                hover:shadow-xl hover:shadow-blue-500/5
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
                  <div className="animate-float flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-100/60">
                    <Upload className="h-7 w-7 text-blue-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-base font-semibold text-gray-700 mb-1">
                      Drop your Blueprint PDF here
                    </p>
                    <p className="text-sm text-gray-400">
                      or <span className="text-blue-500 font-medium underline underline-offset-2">click to browse</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="inline-block rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      PDF
                    </span>
                    <span className="text-[10px] text-gray-300">Max 32 MB</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-4 animate-scale-pop">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/20">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-800 truncate max-w-[240px] sm:max-w-[400px]">
                      {state.file.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {(state.file.size / 1024).toFixed(1)} KB &middot; Ready to process
                    </p>
                  </div>
                  {!isProcessing && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        reset();
                      }}
                      className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-400 transition-all duration-200"
                      aria-label="Remove file"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Action Button */}
          {!showResults && (
            <section className="flex justify-center mb-10">
              <Button
                onClick={processPdf}
                disabled={!canProcess}
                size="lg"
                className="btn-glow bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white font-semibold px-10 h-12 rounded-xl gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Process Blueprint
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </section>
          )}

          {/* Loading */}
          {isProcessing && <AnalyzingLoader />}

          {/* Error Display */}
          {state.status === "error" && state.error && (
            <div className="mb-10 rounded-2xl bg-white/80 backdrop-blur-sm border border-red-100 p-5 flex items-start gap-4 animate-fade-in-up shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-red-800">Processing Error</p>
                <p className="text-sm text-red-600 mt-1 whitespace-pre-wrap leading-relaxed">{state.error}</p>
              </div>
            </div>
          )}

          {/* Results Table */}
          {showResults && (
            <section className="animate-fade-in-up">
              {/* Results header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-3">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Extracted Specifications
                  </h2>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {state.result.length} item{state.result.length !== 1 ? "s" : ""} extracted from your document
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={reset}
                  className="gap-2 cursor-pointer rounded-xl border-gray-200 hover:bg-gray-50 transition-all"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  New Upload
                </Button>
              </div>

              {/* Table card */}
              <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/60 overflow-hidden shadow-lg shadow-gray-200/40">
                <div className="overflow-x-auto max-h-[560px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-gradient-to-r from-blue-600 to-violet-600">
                        <th className="px-5 py-3.5 text-left text-[11px] font-bold text-white/90 uppercase tracking-widest">
                          Item #
                        </th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-bold text-white/90 uppercase tracking-widest">
                          Description / Material
                        </th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-bold text-white/90 uppercase tracking-widest">
                          Dimensions / Size
                        </th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-bold text-white/90 uppercase tracking-widest">
                          Quantity
                        </th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-bold text-white/90 uppercase tracking-widest">
                          Special Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {state.result.map((row, i) => (
                        <tr
                          key={i}
                          className={`table-row-hover ${
                            i % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                          }`}
                        >
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-600">
                              {row.itemNumber}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-gray-700 font-medium">
                            {row.description}
                          </td>
                          <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">
                            {row.dimensions}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span className="inline-flex items-center rounded-md bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
                              {row.quantity}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-gray-500 text-sm max-w-[280px]">
                            {row.specialNotes}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* Done but empty result */}
          {state.status === "done" && state.result.length === 0 && !state.error && (
            <div className="text-center py-14 text-gray-400 text-sm animate-fade-in-up">
              No specifications found in this document.
            </div>
          )}

          {/* Done but with parsing error */}
          {state.status === "done" && state.result.length === 0 && state.error && (
            <div className="mb-10 rounded-2xl bg-white/80 backdrop-blur-sm border border-amber-100 p-5 flex items-start gap-4 animate-fade-in-up shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50">
                <AlertCircle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-800">Parsing Notice</p>
                <p className="text-sm text-amber-700 mt-1 whitespace-pre-wrap leading-relaxed">{state.error}</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="relative z-10 border-t border-gray-200/40 py-6 text-center bg-white/40 backdrop-blur-sm">
        <p className="text-xs text-gray-400 font-medium">
          SpecMatch &middot; Powered by Claude AI
        </p>
      </footer>
    </div>
  );
}
