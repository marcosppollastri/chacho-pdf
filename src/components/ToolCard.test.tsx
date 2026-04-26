import { render, screen } from "@testing-library/react";
import ToolCard from "./ToolCard";
import { FileText } from "lucide-react";

describe("ToolCard", () => {
  it("renders title and description", () => {
    render(
      <ToolCard
        href="/merge"
        icon={<FileText className="h-6 w-6 text-white" />}
        title="Unir PDFs"
        description="Combina varios archivos"
        color="bg-emerald-600"
      />
    );
    expect(screen.getByText("Unir PDFs")).toBeInTheDocument();
    expect(screen.getByText("Combina varios archivos")).toBeInTheDocument();
  });

  it("has correct link href", () => {
    render(
      <ToolCard
        href="/merge"
        icon={<FileText className="h-6 w-6 text-white" />}
        title="Unir PDFs"
        description="Combina varios archivos"
        color="bg-emerald-600"
      />
    );
    expect(screen.getByText("Unir PDFs").closest("a")).toHaveAttribute("href", "/merge");
  });
});
