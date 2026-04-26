import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SplitPage from "./page";
import { saveAs } from "file-saver";

jest.mock("pdf-lib");
jest.mock("jszip", () => jest.fn().mockImplementation(() => ({
  file: jest.fn(),
  generateAsync: jest.fn().mockResolvedValue(new Blob(["zip"])),
})));
jest.mock("file-saver", () => ({ saveAs: jest.fn() }));

describe("SplitPage", () => {
  it("renders page title", () => {
    render(<SplitPage />);
    expect(screen.getByText("Separar PDF")).toBeInTheDocument();
  });

  it("renders dropzone", () => {
    render(<SplitPage />);
    expect(screen.getByText(/Arrastra un PDF/i)).toBeInTheDocument();
  });

  it("accepts pdf file on drop and shows page count", async () => {
    render(<SplitPage />);
    const input = document.querySelector("input[type='file']")!;
    const pdf = new File(["pdf"], "a.pdf", { type: "application/pdf" });
    Object.defineProperty(pdf, "arrayBuffer", { value: jest.fn().mockResolvedValue(new ArrayBuffer(4)) });
    fireEvent.change(input, { target: { files: [pdf] } });
    await waitFor(() => {
      expect(screen.getByText(/a.pdf/)).toBeInTheDocument();
    });
  });

  it("switches between split modes", async () => {
    render(<SplitPage />);
    const input = document.querySelector("input[type='file']")!;
    const pdf = new File(["pdf"], "a.pdf", { type: "application/pdf" });
    Object.defineProperty(pdf, "arrayBuffer", { value: jest.fn().mockResolvedValue(new ArrayBuffer(4)) });
    fireEvent.change(input, { target: { files: [pdf] } });
    await waitFor(() => {
      expect(screen.getByText("Todas las páginas")).toBeInTheDocument();
    });
    const rangesButton = screen.getByText("Por rangos");
    fireEvent.click(rangesButton);
    expect(screen.getByPlaceholderText(/Ej: 1-3/)).toBeInTheDocument();
    const customButton = screen.getByText("Selección manual");
    fireEvent.click(customButton);
    const buttons = screen.getAllByRole("button");
    expect(buttons.some((b) => b.textContent === "1")).toBe(true);
  });

  it("toggles pages in custom mode", async () => {
    render(<SplitPage />);
    const input = document.querySelector("input[type='file']")!;
    const pdf = new File(["pdf"], "a.pdf", { type: "application/pdf" });
    Object.defineProperty(pdf, "arrayBuffer", { value: jest.fn().mockResolvedValue(new ArrayBuffer(4)) });
    fireEvent.change(input, { target: { files: [pdf] } });
    await waitFor(() => {
      expect(screen.getByText("Selección manual")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Selección manual"));
    const pageButton = screen.getByRole("button", { name: "1" });
    fireEvent.click(pageButton);
    expect(pageButton.className).toContain("bg-primary");
    fireEvent.click(pageButton);
    expect(pageButton.className).not.toContain("bg-primary");
  });

  it("splits all pages by default", async () => {
    render(<SplitPage />);
    const input = document.querySelector("input[type='file']")!;
    const pdf = new File(["pdf"], "a.pdf", { type: "application/pdf" });
    Object.defineProperty(pdf, "arrayBuffer", { value: jest.fn().mockResolvedValue(new ArrayBuffer(4)) });
    fireEvent.change(input, { target: { files: [pdf] } });
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Descargar ZIP/i })).toBeInTheDocument();
    });
    const splitButton = screen.getByRole("button", { name: /Descargar ZIP/i });
    fireEvent.click(splitButton);
    await waitFor(() => {
      expect(saveAs).toHaveBeenCalled();
    });
  });

  it("splits with ranges mode", async () => {
    render(<SplitPage />);
    const input = document.querySelector("input[type='file']")!;
    const pdf = new File(["pdf"], "a.pdf", { type: "application/pdf" });
    Object.defineProperty(pdf, "arrayBuffer", { value: jest.fn().mockResolvedValue(new ArrayBuffer(4)) });
    fireEvent.change(input, { target: { files: [pdf] } });
    await waitFor(() => {
      expect(screen.getByText("Por rangos")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Por rangos"));
    const rangeInput = screen.getByPlaceholderText(/Ej: 1-3/);
    fireEvent.change(rangeInput, { target: { value: "1-2" } });
    const splitButton = screen.getByRole("button", { name: /Descargar ZIP/i });
    fireEvent.click(splitButton);
    await waitFor(() => {
      expect(saveAs).toHaveBeenCalled();
    });
  });

  it("splits with custom mode", async () => {
    render(<SplitPage />);
    const input = document.querySelector("input[type='file']")!;
    const pdf = new File(["pdf"], "a.pdf", { type: "application/pdf" });
    Object.defineProperty(pdf, "arrayBuffer", { value: jest.fn().mockResolvedValue(new ArrayBuffer(4)) });
    fireEvent.change(input, { target: { files: [pdf] } });
    await waitFor(() => {
      expect(screen.getByText("Selección manual")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Selección manual"));
    const pageButton = screen.getByRole("button", { name: "1" });
    fireEvent.click(pageButton);
    const splitButton = screen.getByRole("button", { name: /Descargar ZIP/i });
    fireEvent.click(splitButton);
    await waitFor(() => {
      expect(saveAs).toHaveBeenCalled();
    });
  });

  it("removes file with trash button", async () => {
    const { container } = render(<SplitPage />);
    const input = document.querySelector("input[type='file']")!;
    const pdf = new File(["pdf"], "a.pdf", { type: "application/pdf" });
    Object.defineProperty(pdf, "arrayBuffer", { value: jest.fn().mockResolvedValue(new ArrayBuffer(4)) });
    fireEvent.change(input, { target: { files: [pdf] } });
    await waitFor(() => {
      expect(screen.getByText(/a.pdf/)).toBeInTheDocument();
    });
    const trashButton = container.querySelector("button.text-red-600")!;
    fireEvent.click(trashButton);
    expect(screen.queryByText(/a.pdf/)).not.toBeInTheDocument();
  });
});
