import Navbar from "@/components/Navbar";
import ToolCard from "@/components/ToolCard";
import {
  Merge,
  Split,
  FileImage,
  ImageIcon,
  FileType,
  FileText,
} from "lucide-react";

const tools = [
  {
    href: "/word-to-pdf",
    icon: FileType,
    title: "Word a PDF",
    description: "Convierte documentos Word a PDF de forma rápida.",
    color: "bg-blue-600",
  },
  {
    href: "/split",
    icon: Split,
    title: "Separar PDF",
    description: "Divide un PDF por página, rango o selección.",
    color: "bg-orange-500",
  },
  {
    href: "/merge",
    icon: Merge,
    title: "Unir PDFs",
    description: "Combina varios archivos PDF en uno solo.",
    color: "bg-emerald-600",
  },
  {
    href: "/pdf-to-word",
    icon: FileText,
    title: "PDF a Word",
    description: "Convierte archivos PDF a documentos Word.",
    color: "bg-indigo-600",
  },
  {
    href: "/jpg-to-pdf",
    icon: FileImage,
    title: "JPG a PDF",
    description: "Convierte imágenes JPG/PNG a un PDF.",
    color: "bg-rose-600",
  },
  {
    href: "/pdf-to-jpg",
    icon: ImageIcon,
    title: "PDF a JPG",
    description: "Extrae las páginas de un PDF como imágenes JPG.",
    color: "bg-cyan-600",
  },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col items-center px-6 py-12">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
              Herramientas PDF
            </h1>
            <p className="mt-3 text-lg text-zinc-500">
              Todo el procesamiento en tu servidor privado. Sin logins, sin
              terceros.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <ToolCard key={tool.href} {...tool} icon={<tool.icon className="h-6 w-6 text-white" />} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
