"use client";

import { useState, useCallback } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import FileDropzone from "@/components/FileDropzone";
import { ImageIcon, Download, Trash2 } from "lucide-react";

export default function PdfToJpgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onFiles = useCallback((files: File[]) => {
    const pdf = files.find((f) => f.type === "application/pdf");
    if (pdf) {
      setFile(pdf);
      setProgress(0);
    }
  }, []);

  const convert = async () => {
    if (!file) return;
    setLoading(true);
    setProgress(0);
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "";
      const bytes = new Uint8Array(await file.arrayBuffer());
      const doc = await pdfjs.getDocument({ data: bytes }).promise;
      const zip = new JSZip();
      const scale = 2;

      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;

        const blob = await new Promise<Blob>((resolve) =>
          canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.9)
        );
        zip.file(`page_${i}.jpg`, blob);
        setProgress(Math.round((i / doc.numPages) * 100));
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, "pdf-pages.zip");
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
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-600">
            <ImageIcon className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">PDF a JPG</h1>
        </div>
        <FileDropzone
          onFiles={onFiles}
          accept={{ "application/pdf": [".pdf"] }}
          multiple={false}
          label="Arrastra un PDF aquí"
        />
        {file && (
          <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-600">{file.name}</p>
              <button
                onClick={() => {
                  setFile(null);
                  setProgress(0);
                }}
                className="rounded p-1 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            {loading && (
              <div className="mb-4">
                <div className="h-2 w-full rounded-full bg-zinc-100">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-500">{progress}%</p>
              </div>
            )}
            <button
              onClick={convert}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-medium text-white transition hover:bg-primary-hover disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {loading ? "Renderizando..." : "Descargar ZIP con imágenes"}
            </button>
          </div>
        )}
      </main>
    </>
  );
}
