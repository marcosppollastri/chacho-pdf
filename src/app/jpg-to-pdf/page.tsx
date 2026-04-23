"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import Navbar from "@/components/Navbar";
import FileDropzone from "@/components/FileDropzone";
import { FileImage, ArrowUp, ArrowDown, Trash2, Download } from "lucide-react";

export default function JpgToPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const onFiles = useCallback((newFiles: File[]) => {
    const imgs = newFiles.filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => [...prev, ...imgs]);
  }, []);

  const move = (index: number, dir: number) => {
    setFiles((prev) => {
      const next = [...prev];
      const t = next[index + dir];
      next[index + dir] = next[index];
      next[index] = t;
      return next;
    });
  };

  const remove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const convert = async () => {
    if (files.length === 0) return;
    setLoading(true);
    try {
      const doc = await PDFDocument.create();
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        let img;
        if (file.type === "image/png") {
          img = await doc.embedPng(bytes);
        } else {
          img = await doc.embedJpg(bytes);
        }
        const page = doc.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      }
      const data = new Uint8Array(await doc.save());
      const blob = new Blob([data], { type: "application/pdf" });
      saveAs(blob, "images.pdf");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-3xl px-6 py-10">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-600">
            <FileImage className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">JPG a PDF</h1>
        </div>
        <FileDropzone
          onFiles={onFiles}
          accept={{ "image/*": [".jpg", ".jpeg", ".png"] }}
          label="Arrastra imágenes JPG o PNG"
        />
        {files.length > 0 && (
          <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4">
            <p className="mb-3 text-sm font-medium text-zinc-600">
              {files.length} imagen(es) — ordena con las flechas
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
              onClick={convert}
              disabled={loading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-medium text-white transition hover:bg-primary-hover disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {loading ? "Procesando..." : "Descargar PDF"}
            </button>
          </div>
        )}
      </main>
    </>
  );
}
