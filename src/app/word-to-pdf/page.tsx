"use client";

import { useState, useCallback } from "react";
import { saveAs } from "file-saver";
import Navbar from "@/components/Navbar";
import FileDropzone from "@/components/FileDropzone";
import { FileType, Download, Trash2 } from "lucide-react";

export default function WordToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const onFiles = useCallback((files: File[]) => {
    const doc = files.find(
      (f) =>
        f.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        f.type === "application/msword"
    );
    if (doc) setFile(doc);
  }, []);

  const convert = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/convert/word-to-pdf", {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error("Error en la conversión");
      const blob = await res.blob();
      saveAs(blob, file.name.replace(/\.docx?$/i, ".pdf"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-3xl px-6 py-10">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
            <FileType className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Word a PDF</h1>
        </div>
        <FileDropzone
          onFiles={onFiles}
          accept={{
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
              ".docx",
            ],
            "application/msword": [".doc"],
          }}
          multiple={false}
          label="Arrastra un archivo Word (.docx o .doc)"
        />
        {file && (
          <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-600">{file.name}</p>
              <button
                onClick={() => setFile(null)}
                className="rounded p-1 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={convert}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-medium text-white transition hover:bg-primary-hover disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {loading ? "Convirtiendo..." : "Descargar PDF"}
            </button>
          </div>
        )}
      </main>
    </>
  );
}
