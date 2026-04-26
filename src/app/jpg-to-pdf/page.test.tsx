import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import JpgToPdfPage from "./page";
import { saveAs } from "file-saver";

jest.mock("pdf-lib");
jest.mock("file-saver", () => ({ saveAs: jest.fn() }));

describe("JpgToPdfPage", () => {
  it("renders page title", () => {
    render(<JpgToPdfPage />);
    expect(screen.getByText("JPG a PDF")).toBeInTheDocument();
  });

  it("renders dropzone", () => {
    render(<JpgToPdfPage />);
    expect(screen.getByText(/Arrastra imágenes/i)).toBeInTheDocument();
  });

  it("filters non-image files on drop", () => {
    render(<JpgToPdfPage />);
    const input = document.querySelector("input[type='file']")!;
    const imgFile = new File(["img"], "a.jpg", { type: "image/jpeg" });
    Object.defineProperty(imgFile, "arrayBuffer", { value: jest.fn().mockResolvedValue(new ArrayBuffer(4)) });
    const pdfFile = new File(["pdf"], "b.pdf", { type: "application/pdf" });
    fireEvent.change(input, { target: { files: [imgFile, pdfFile] } });
    expect(screen.getByText("a.jpg")).toBeInTheDocument();
    expect(screen.queryByText("b.pdf")).not.toBeInTheDocument();
  });

  it("reorders images with arrow buttons", () => {
    const { container } = render(<JpgToPdfPage />);
    const input = document.querySelector("input[type='file']")!;
    const img1 = new File(["1"], "a.jpg", { type: "image/jpeg" });
    const img2 = new File(["2"], "b.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [img1, img2] } });
    const items = container.querySelectorAll("li");
    expect(items[0].textContent).toContain("a.jpg");
    expect(items[1].textContent).toContain("b.png");
    const downButton = items[0].querySelector("button[disabled=''] + button")!;
    fireEvent.click(downButton);
    const newItems = container.querySelectorAll("li");
    expect(newItems[0].textContent).toContain("b.png");
    expect(newItems[1].textContent).toContain("a.jpg");
  });

  it("removes an image with trash button", () => {
    const { container } = render(<JpgToPdfPage />);
    const input = document.querySelector("input[type='file']")!;
    const img = new File(["img"], "a.jpg", { type: "image/jpeg" });
    fireEvent.change(input, { target: { files: [img] } });
    expect(screen.getByText("a.jpg")).toBeInTheDocument();
    const trashButton = container.querySelector("button.text-red-600")!;
    fireEvent.click(trashButton);
    expect(screen.queryByText("a.jpg")).not.toBeInTheDocument();
  });

  it("converts png images to PDF", async () => {
    render(<JpgToPdfPage />);
    const input = document.querySelector("input[type='file']")!;
    const img = new File(["img"], "a.png", { type: "image/png" });
    Object.defineProperty(img, "arrayBuffer", { value: jest.fn().mockResolvedValue(new ArrayBuffer(4)) });
    fireEvent.change(input, { target: { files: [img] } });
    const convertButton = screen.getByRole("button", { name: /Descargar PDF/i });
    fireEvent.click(convertButton);
    await waitFor(() => {
      expect(saveAs).toHaveBeenCalled();
    });
  });

  it("converts jpg images to PDF", async () => {
    render(<JpgToPdfPage />);
    const input = document.querySelector("input[type='file']")!;
    const img = new File(["img"], "a.jpg", { type: "image/jpeg" });
    Object.defineProperty(img, "arrayBuffer", { value: jest.fn().mockResolvedValue(new ArrayBuffer(4)) });
    fireEvent.change(input, { target: { files: [img] } });
    const convertButton = screen.getByRole("button", { name: /Descargar PDF/i });
    fireEvent.click(convertButton);
    await waitFor(() => {
      expect(saveAs).toHaveBeenCalled();
    });
  });

  it("handles empty convert gracefully", () => {
    render(<JpgToPdfPage />);
    expect(screen.queryByText(/Descargar PDF/i)).not.toBeInTheDocument();
  });
});
