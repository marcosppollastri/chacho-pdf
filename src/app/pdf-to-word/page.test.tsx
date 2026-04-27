import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PdfToWordPage from "./page";
import { saveAs } from "file-saver";

jest.mock("file-saver", () => ({ saveAs: jest.fn() }));

describe("PdfToWordPage", () => {
  afterEach(() => {
    delete (window as Window & { electronAPI?: unknown }).electronAPI;
    jest.clearAllMocks();
  });

  it("renders page title", () => {
    render(<PdfToWordPage />);
    expect(screen.getByText("PDF a Word")).toBeInTheDocument();
  });

  it("renders dropzone", () => {
    render(<PdfToWordPage />);
    expect(screen.getByText(/Arrastra un PDF/i)).toBeInTheDocument();
  });

  it("accepts pdf file on drop", () => {
    render(<PdfToWordPage />);
    const input = document.querySelector("input[type='file']")!;
    const pdf = new File(["pdf"], "a.pdf", { type: "application/pdf" });
    fireEvent.change(input, { target: { files: [pdf] } });
    expect(screen.getByText("a.pdf")).toBeInTheDocument();
  });

  it("removes file with trash button", () => {
    const { container } = render(<PdfToWordPage />);
    const input = document.querySelector("input[type='file']")!;
    const pdf = new File(["pdf"], "a.pdf", { type: "application/pdf" });
    fireEvent.change(input, { target: { files: [pdf] } });
    expect(screen.getByText("a.pdf")).toBeInTheDocument();
    const trashButton = container.querySelector("button.text-red-600")!;
    fireEvent.click(trashButton);
    expect(screen.queryByText("a.pdf")).not.toBeInTheDocument();
  });

  it("converts via web api", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      blob: jest.fn().mockResolvedValue(new Blob(["docx"])),
    } as unknown as Response);

    render(<PdfToWordPage />);
    const input = document.querySelector("input[type='file']")!;
    const pdf = new File(["pdf"], "a.pdf", { type: "application/pdf" });
    fireEvent.change(input, { target: { files: [pdf] } });
    const convertButton = screen.getByRole("button", { name: /Descargar Word/i });
    fireEvent.click(convertButton);
    await waitFor(() => {
      expect(saveAs).toHaveBeenCalled();
    });
    expect(fetch).toHaveBeenCalledWith("/api/convert/pdf-to-word", expect.any(Object));
  });

  it("converts via electron api", async () => {
    (window as Window & { electronAPI?: { convertPdfToWord: jest.Mock } }).electronAPI = {
      convertPdfToWord: jest.fn().mockResolvedValue({ success: true, data: [1, 2, 3] }),
    };

    render(<PdfToWordPage />);
    const input = document.querySelector("input[type='file']")!;
    const pdf = new File(["pdf"], "a.pdf", { type: "application/pdf" });
    Object.defineProperty(pdf, "arrayBuffer", { value: jest.fn().mockResolvedValue(new ArrayBuffer(4)) });
    fireEvent.change(input, { target: { files: [pdf] } });
    const convertButton = screen.getByRole("button", { name: /Descargar Word/i });
    fireEvent.click(convertButton);
    await waitFor(() => {
      expect(saveAs).toHaveBeenCalled();
    });
  });

  it("handles web api error", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      blob: jest.fn(),
    } as unknown as Response);

    render(<PdfToWordPage />);
    const input = document.querySelector("input[type='file']")!;
    const pdf = new File(["pdf"], "a.pdf", { type: "application/pdf" });
    fireEvent.change(input, { target: { files: [pdf] } });
    const convertButton = screen.getByRole("button", { name: /Descargar Word/i });
    fireEvent.click(convertButton);
    await waitFor(() => {
      expect(saveAs).not.toHaveBeenCalled();
    });
  });
});
