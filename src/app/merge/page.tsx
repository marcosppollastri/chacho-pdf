"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import FileDropzone from "@/components/FileDropzone";
import { ArrowUp, ArrowDown, Trash2, Download, Merge } from "lucide-react";

export default function MergePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const onFiles = useCallback((newFiles: File[]) => {
    const pdfs = newFiles.filter((f) => f.type === "application/pdf");
    setFiles((prev) => [...prev, ...pdfs]);
  }, []);

  const move = (index: number, dir: number) => {
    setFiles((prev) => {
      const next = [...prev];
      const swap = next[index + dir];
      next[index + dir] = next[index];
      next[index] = swap;
      return next;
    });
  };

  const remove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const merge = async () => {
    if (files.length < 2) return;
    setLoading(true);
    try {
      const merged = await PDFDocument.create();
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const pdf = await PDFDocument.load(bytes);
        const pages = await merged.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      const bytes = new Uint8Array(await merged.save());
      const blob = new Blob([bytes], { type: "application/pdf" });
      saveAs(blob, "merged.pdf");
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
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600">
            <Merge className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Unir PDFs</h1>
        </div>
        <FileDropzone
          onFiles={onFiles}
          accept={{ "application/pdf": [".pdf"] }}
          label="Arrastra archivos PDF aquí (puedes añadir varios)"
        />
        {files.length > 0 && (
          <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4">
            <p className="mb-3 text-sm font-medium text-zinc-600">
              {files.length} archivo(s) — ordena con las flechas
            </p>
            <ul className="flex flex-col gap-2">
              {files.map((file, i) => (
                <li
                  key={`${file.name}-${i}`}
                  className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2"
                >
                  <span className="truncate text-sm">{file.name}</span>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={i === 0}
                      onClick={() => move(i, -1)}
                      className="rounded p-1 hover:bg-zinc-200 disabled:opacity-30"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      disabled={i === files.length - 1}
                      onClick={() => move(i, 1)}
                      className="rounded p-1 hover:bg-zinc-200 disabled:opacity-30"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => remove(i)}
                      className="rounded p-1 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <button
              onClick={merge}
              disabled={files.length < 2 || loading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-medium text-white transition hover:bg-primary-hover disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {loading ? "Procesando..." : "Descargar PDF unido"}
            </button>
          </div>
        )}
      </main>
    </>
  );
}
