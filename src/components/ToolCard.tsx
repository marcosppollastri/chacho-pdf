import Link from "next/link";
import { ReactNode } from "react";

interface ToolCardProps {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
  color: string;
}

export default function ToolCard({ href, icon, title, description, color }: ToolCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-zinc-300 hover:shadow-md"
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
      <p className="text-sm text-zinc-500">{description}</p>
    </Link>
  );
}
