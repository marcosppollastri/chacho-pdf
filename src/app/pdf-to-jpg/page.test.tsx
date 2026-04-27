import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PdfToJpgPage from "./page";
import { saveAs } from "file-saver";

jest.mock("pdfjs-dist", () => ({
  GlobalWorkerOptions: { workerSrc: "" },
  getDocument: jest.fn().mockReturnValue({
    promise: Promise.resolve({
      numPages: 2,
      getPage: jest.fn().mockResolvedValue({
        getViewport: jest.fn().mockReturnValue({ width: 100, height: 100 }),
        render: jest.fn().mockReturnValue({ promise: Promise.resolve() }),
      }),
    }),
  }),
}));
jest.mock("jszip", () => jest.fn().mockImplementation(() => ({
  file: jest.fn(),
  generateAsync: jest.fn().mockResolvedValue(new Blob(["zip"])),
})));
jest.mock("file-saver", () => ({ saveAs: jest.fn() }));

describe("PdfToJpgPage", () => {
  const originalToBlob = HTMLCanvasElement.prototype.toBlob;

  beforeAll(() => {
    HTMLCanvasElement.prototype.toBlob = jest.fn((callback) => callback(new Blob(["jpg"])));
  });

  afterAll(() => {
    HTMLCanvasElement.prototype.toBlob = originalToBlob;
  });

  it("renders page title", () => {
    render(<PdfToJpgPage />);
    expect(screen.getByText("PDF a JPG")).toBeInTheDocument();
  });

  it("renders dropzone", () => {
    render(<PdfToJpgPage />);
    expect(screen.getByText(/Arrastra un PDF/i)).toBeInTheDocument();
  });

  it("accepts pdf file on drop", () => {
    render(<PdfToJpgPage />);
    const input = document.querySelector("input[type='file']")!;
    const pdf = new File(["pdf"], "a.pdf", { type: "application/pdf" });
    fireEvent.change(input, { target: { files: [pdf] } });
    expect(screen.getByText("a.pdf")).toBeInTheDocument();
  });

  it("removes file with trash button", () => {
    const { container } = render(<PdfToJpgPage />);
    const input = document.querySelector("input[type='file']")!;
    const pdf = new File(["pdf"], "a.pdf", { type: "application/pdf" });
    fireEvent.change(input, { target: { files: [pdf] } });
    expect(screen.getByText("a.pdf")).toBeInTheDocument();
    const trashButton = container.querySelector("button.text-red-600")!;
    fireEvent.click(trashButton);
    expect(screen.queryByText("a.pdf")).not.toBeInTheDocument();
  });

  it("converts pdf to jpg and shows progress", async () => {
    render(<PdfToJpgPage />);
    const input = document.querySelector("input[type='file']")!;
    const pdf = new File(["pdf"], "a.pdf", { type: "application/pdf" });
    Object.defineProperty(pdf, "arrayBuffer", { value: jest.fn().mockResolvedValue(new ArrayBuffer(4)) });
    fireEvent.change(input, { target: { files: [pdf] } });
    const convertButton = screen.getByRole("button", { name: /Descargar ZIP/i });
    fireEvent.click(convertButton);
    await waitFor(() => {
      expect(saveAs).toHaveBeenCalled();
    });
  });

  it("handles empty convert gracefully", () => {
    render(<PdfToJpgPage />);
    expect(screen.queryByText(/Descargar ZIP/i)).not.toBeInTheDocument();
  });
});
