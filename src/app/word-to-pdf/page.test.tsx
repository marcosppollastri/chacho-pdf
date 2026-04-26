import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import WordToPdfPage from "./page";
import { saveAs } from "file-saver";

jest.mock("file-saver", () => ({ saveAs: jest.fn() }));

describe("WordToPdfPage", () => {
  afterEach(() => {
    delete (window as Window & { electronAPI?: unknown }).electronAPI;
    jest.clearAllMocks();
  });

  it("renders page title", () => {
    render(<WordToPdfPage />);
    expect(screen.getByText("Word a PDF")).toBeInTheDocument();
  });

  it("renders dropzone", () => {
    render(<WordToPdfPage />);
    expect(screen.getByText(/Arrastra un archivo Word/i)).toBeInTheDocument();
  });

  it("accepts word file on drop", () => {
    render(<WordToPdfPage />);
    const input = document.querySelector("input[type='file']")!;
    const doc = new File(["doc"], "a.docx", { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    fireEvent.change(input, { target: { files: [doc] } });
    expect(screen.getByText("a.docx")).toBeInTheDocument();
  });

  it("removes file with trash button", () => {
    const { container } = render(<WordToPdfPage />);
    const input = document.querySelector("input[type='file']")!;
    const doc = new File(["doc"], "a.docx", { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    fireEvent.change(input, { target: { files: [doc] } });
    expect(screen.getByText("a.docx")).toBeInTheDocument();
    const trashButton = container.querySelector("button.text-red-600")!;
    fireEvent.click(trashButton);
    expect(screen.queryByText("a.docx")).not.toBeInTheDocument();
  });

  it("converts via web api", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      blob: jest.fn().mockResolvedValue(new Blob(["pdf"])),
    } as unknown as Response);

    render(<WordToPdfPage />);
    const input = document.querySelector("input[type='file']")!;
    const doc = new File(["doc"], "a.docx", { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    fireEvent.change(input, { target: { files: [doc] } });
    const convertButton = screen.getByRole("button", { name: /Descargar PDF/i });
    fireEvent.click(convertButton);
    await waitFor(() => {
      expect(saveAs).toHaveBeenCalled();
    });
    expect(fetch).toHaveBeenCalledWith("/api/convert/word-to-pdf", expect.any(Object));
  });

  it("converts via electron api", async () => {
    (window as Window & { electronAPI?: { convertWordToPdf: jest.Mock } }).electronAPI = {
      convertWordToPdf: jest.fn().mockResolvedValue({ success: true, data: [1, 2, 3] }),
    };

    render(<WordToPdfPage />);
    const input = document.querySelector("input[type='file']")!;
    const doc = new File(["doc"], "a.docx", { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    Object.defineProperty(doc, "arrayBuffer", { value: jest.fn().mockResolvedValue(new ArrayBuffer(4)) });
    fireEvent.change(input, { target: { files: [doc] } });
    const convertButton = screen.getByRole("button", { name: /Descargar PDF/i });
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

    render(<WordToPdfPage />);
    const input = document.querySelector("input[type='file']")!;
    const doc = new File(["doc"], "a.docx", { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    fireEvent.change(input, { target: { files: [doc] } });
    const convertButton = screen.getByRole("button", { name: /Descargar PDF/i });
    fireEvent.click(convertButton);
    await waitFor(() => {
      expect(saveAs).not.toHaveBeenCalled();
    });
  });
});
