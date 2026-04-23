"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File } from "lucide-react";

interface FileDropzoneProps {
  onFiles: (files: File[]) => void;
  accept?: Record<string, string[]>;
  multiple?: boolean;
  label?: string;
}

export default function FileDropzone({ onFiles, accept, multiple = true, label }: FileDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFiles(acceptedFiles);
    },
    [onFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
  });

  return (
    <div
      {...getRootProps()}
      className={`flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-10 transition ${
        isDragActive
          ? "border-primary bg-rose-50"
          : "border-zinc-300 bg-white hover:border-zinc-400"
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100">
        {isDragActive ? <File className="h-7 w-7 text-primary" /> : <Upload className="h-7 w-7 text-zinc-400" />}
      </div>
      <p className="text-center text-sm text-zinc-600">
        {label || (isDragActive ? "Suelta los archivos aquí" : "Arrastra archivos o haz clic para seleccionar")}
      </p>
    </div>
  );
}
