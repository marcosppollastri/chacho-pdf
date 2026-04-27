"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import FileDropzone from "@/components/FileDropzone";
import { Split, Download, Trash2 } from "lucide-react";

export default function SplitPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode] = useState<"all" | "ranges" | "custom">("all");
  const [ranges, setRanges] = useState("");
  const [custom, setCustom] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const onFiles = useCallback(async (files: File[]) => {
    const pdf = files.find((f) => f.type === "application/pdf");
    if (!pdf) return;
    setFile(pdf);
    const bytes = await pdf.arrayBuffer();
    const doc = await PDFDocument.load(bytes);
    setPageCount(doc.getPageCount());
    setCustom([]);
    setRanges("");
  }, []);

  const togglePage = (page: number) => {
    setCustom((prev) =>
      prev.includes(page)
        ? prev.filter((p) => p !== page)
        : [...prev, page].sort((a, b) => a - b)
    );
  };

  const split = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const bytes = await file.arrayBuffer();
      const src = await PDFDocument.load(bytes);
      const zip = new JSZip();

      const addSingle = async (index: number, name: string) => {
        const dst = await PDFDocument.create();
        const [page] = await dst.copyPages(src, [index]);
        dst.addPage(page);
        const data = new Uint8Array(await dst.save());
        zip.file(name, data);
      };

      if (mode === "all") {
        for (let i = 0; i < pageCount; i++) {
          await addSingle(i, `page_${i + 1}.pdf`);
        }
      } else if (mode === "ranges") {
        const parts = ranges.split(",").map((s) => s.trim());
        for (const part of parts) {
          if (!part) continue;
          const [startStr, endStr] = part.split("-");
          const start = parseInt(startStr, 10);
          const end = endStr ? parseInt(endStr, 10) : start;
          if (isNaN(start) || start < 1 || start > pageCount) continue;
          const dst = await PDFDocument.create();
          for (let i = start - 1; i < Math.min(end, pageCount); i++) {
            const [page] = await dst.copyPages(src, [i]);
            dst.addPage(page);
          }
          const data = new Uint8Array(await dst.save());
          zip.file(`pages_${start}-${Math.min(end, pageCount)}.pdf`, data);
        }
      } else {
        for (const pageNum of custom) {
          await addSingle(pageNum - 1, `page_${pageNum}.pdf`);
        }
      }

      const blob = await zip.generateAsync({ type: "blob" });
      saveAs(blob, "split.zip");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-3xl px-6 py-10">
        <div className="mb-2">
          <BackButton />
        </div>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500">
            <Split className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Separar PDF</h1>
        </div>
        <FileDropzone
          onFiles={onFiles}
          accept={{ "application/pdf": [".pdf"] }}
          multiple={false}
          label="Arrastra un PDF aquí"
        />
        {file && pageCount > 0 && (
          <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-600">
                {file.name} — {pageCount} página(s)
              </p>
              <button
                onClick={() => {
                  setFile(null);
                  setPageCount(0);
                  setCustom([]);
                }}
                className="rounded p-1 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="mb-4 flex gap-2">
              {(["all", "ranges", "custom"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    mode === m
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  }`}
                >
                  {m === "all" ? "Todas las páginas" : m === "ranges" ? "Por rangos" : "Selección manual"}
                </button>
              ))}
            </div>
            {mode === "ranges" && (
              <div className="mb-4">
                <input
                  type="text"
                  value={ranges}
                  onChange={(e) => setRanges(e.target.value)}
                  placeholder="Ej: 1-3, 5, 8-10"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <p className="mt-1 text-xs text-zinc-500">
                  Introduce rangos separados por comas. Ej: 1-3, 5, 8-10
                </p>
              </div>
            )}
            {mode === "custom" && (
              <div className="mb-4 grid grid-cols-5 gap-2 sm:grid-cols-8">
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => togglePage(p)}
                    className={`rounded-lg py-2 text-sm font-medium transition ${
                      custom.includes(p)
                        ? "bg-primary text-white"
                        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={split}
              disabled={
                loading ||
                (mode === "custom" && custom.length === 0) ||
                (mode === "ranges" && !ranges.trim())
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-medium text-white transition hover:bg-primary-hover disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {loading ? "Procesando..." : "Descargar ZIP"}
            </button>
          </div>
        )}
      </main>
    </>
  );
}
