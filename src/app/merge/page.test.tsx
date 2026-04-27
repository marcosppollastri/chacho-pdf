import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MergePage from "./page";
import { saveAs } from "file-saver";

jest.mock("pdf-lib");
jest.mock("file-saver", () => ({ saveAs: jest.fn() }));

describe("MergePage", () => {
  it("renders page title", () => {
    render(<MergePage />);
    expect(screen.getByText("Unir PDFs")).toBeInTheDocument();
  });

  it("renders dropzone", () => {
    render(<MergePage />);
    expect(screen.getByText(/Arrastra archivos PDF/i)).toBeInTheDocument();
  });

  it("filters non-pdf files on drop", () => {
    render(<MergePage />);
    const input = document.querySelector("input[type='file']")!;
    const pdf = new File(["pdf"], "a.pdf", { type: "application/pdf" });
    const img = new File(["img"], "b.jpg", { type: "image/jpeg" });
    fireEvent.change(input, { target: { files: [pdf, img] } });
    expect(screen.getByText("a.pdf")).toBeInTheDocument();
    expect(screen.queryByText("b.jpg")).not.toBeInTheDocument();
  });

  it("reorders pdfs with arrow buttons", () => {
    const { container } = render(<MergePage />);
    const input = document.querySelector("input[type='file']")!;
    const pdf1 = new File(["1"], "a.pdf", { type: "application/pdf" });
    const pdf2 = new File(["2"], "b.pdf", { type: "application/pdf" });
    fireEvent.change(input, { target: { files: [pdf1, pdf2] } });
    const items = container.querySelectorAll("li");
    expect(items[0].textContent).toContain("a.pdf");
    expect(items[1].textContent).toContain("b.pdf");
    const downButton = items[0].querySelector("button[disabled=''] + button")!;
    fireEvent.click(downButton);
    const newItems = container.querySelectorAll("li");
    expect(newItems[0].textContent).toContain("b.pdf");
    expect(newItems[1].textContent).toContain("a.pdf");
  });

  it("removes a pdf with trash button", () => {
    const { container } = render(<MergePage />);
    const input = document.querySelector("input[type='file']")!;
    const pdf = new File(["pdf"], "a.pdf", { type: "application/pdf" });
    fireEvent.change(input, { target: { files: [pdf] } });
    expect(screen.getByText("a.pdf")).toBeInTheDocument();
    const trashButton = container.querySelector("button.text-red-600")!;
    fireEvent.click(trashButton);
    expect(screen.queryByText("a.pdf")).not.toBeInTheDocument();
  });

  it("merge button disabled with less than 2 files", () => {
    render(<MergePage />);
    const input = document.querySelector("input[type='file']")!;
    const pdf = new File(["pdf"], "a.pdf", { type: "application/pdf" });
    fireEvent.change(input, { target: { files: [pdf] } });
    const mergeButton = screen.getByRole("button", { name: /Descargar PDF unido/i });
    expect(mergeButton).toBeDisabled();
  });

  it("merges pdfs successfully", async () => {
    render(<MergePage />);
    const input = document.querySelector("input[type='file']")!;
    const pdf1 = new File(["1"], "a.pdf", { type: "application/pdf" });
    const pdf2 = new File(["2"], "b.pdf", { type: "application/pdf" });
    Object.defineProperty(pdf1, "arrayBuffer", { value: jest.fn().mockResolvedValue(new ArrayBuffer(4)) });
    Object.defineProperty(pdf2, "arrayBuffer", { value: jest.fn().mockResolvedValue(new ArrayBuffer(4)) });
    fireEvent.change(input, { target: { files: [pdf1, pdf2] } });
    const mergeButton = screen.getByRole("button", { name: /Descargar PDF unido/i });
    expect(mergeButton).not.toBeDisabled();
    fireEvent.click(mergeButton);
    await waitFor(() => {
      expect(saveAs).toHaveBeenCalled();
    });
  });
});
