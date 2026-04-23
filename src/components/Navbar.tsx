"use client";

import Link from "next/link";
import { FileText, Shield } from "lucide-react";

export default function Navbar() {
  return (
    <header className="w-full border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
          <FileText className="h-6 w-6" />
          chacho-pdf
        </Link>
        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <Shield className="h-4 w-4" />
          Privado y libre
        </div>
      </div>
    </header>
  );
}
