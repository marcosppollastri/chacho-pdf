import { isElectron, convertWordToPdfElectron, convertPdfToWordElectron } from "./electron";

describe("electron helpers", () => {
  afterEach(() => {
    delete (window as Window & { electronAPI?: { convertWordToPdf: jest.Mock; convertPdfToWord: jest.Mock } }).electronAPI;
  });

  test("isElectron returns false when no electronAPI", () => {
    expect(isElectron()).toBe(false);
  });

  test("isElectron returns true when electronAPI exists", () => {
    (window as Window & { electronAPI?: { convertWordToPdf: jest.Mock; convertPdfToWord: jest.Mock } }).electronAPI = {
      convertWordToPdf: jest.fn(),
      convertPdfToWord: jest.fn(),
    };
    expect(isElectron()).toBe(true);
  });

  test("convertWordToPdfElectron throws outside electron", async () => {
    await expect(convertWordToPdfElectron(new File([], "test.docx"))).rejects.toThrow(
      "No disponible fuera de Electron"
    );
  });

  test("convertPdfToWordElectron throws outside electron", async () => {
    await expect(convertPdfToWordElectron(new File([], "test.pdf"))).rejects.toThrow(
      "No disponible fuera de Electron"
    );
  });

  test("convertWordToPdfElectron calls electronAPI", async () => {
    const mockApi = {
      convertWordToPdf: jest.fn().mockResolvedValue({
        success: true,
        data: [1, 2, 3],
      }),
      convertPdfToWord: jest.fn(),
    };
    (window as Window & { electronAPI?: { convertWordToPdf: jest.Mock; convertPdfToWord: jest.Mock } }).electronAPI = mockApi;

    const file = new File(["test"], "test.docx", { type: "application/msword" });
    Object.defineProperty(file, "arrayBuffer", { value: jest.fn().mockResolvedValue(new ArrayBuffer(4)) });
    const blob = await convertWordToPdfElectron(file);

    expect(mockApi.convertWordToPdf).toHaveBeenCalled();
    expect(blob).toBeInstanceOf(Blob);
  });

  test("convertPdfToWordElectron calls electronAPI", async () => {
    const mockApi = {
      convertWordToPdf: jest.fn(),
      convertPdfToWord: jest.fn().mockResolvedValue({
        success: true,
        data: [1, 2, 3],
      }),
    };
    (window as Window & { electronAPI?: { convertWordToPdf: jest.Mock; convertPdfToWord: jest.Mock } }).electronAPI = mockApi;

    const file = new File(["test"], "test.pdf", { type: "application/pdf" });
    Object.defineProperty(file, "arrayBuffer", { value: jest.fn().mockResolvedValue(new ArrayBuffer(4)) });
    const blob = await convertPdfToWordElectron(file);

    expect(mockApi.convertPdfToWord).toHaveBeenCalled();
    expect(blob).toBeInstanceOf(Blob);
  });

  test("convertPdfToWordElectron throws on api error", async () => {
    const mockApi = {
      convertWordToPdf: jest.fn(),
      convertPdfToWord: jest.fn().mockResolvedValue({
        success: false,
        error: "conversion failed",
      }),
    };
    (window as Window & { electronAPI?: { convertWordToPdf: jest.Mock; convertPdfToWord: jest.Mock } }).electronAPI = mockApi;

    const file = new File(["test"], "test.pdf", { type: "application/pdf" });
    Object.defineProperty(file, "arrayBuffer", { value: jest.fn().mockResolvedValue(new ArrayBuffer(4)) });
    await expect(convertPdfToWordElectron(file)).rejects.toThrow("conversion failed");
  });

  test("convertWordToPdfElectron throws on api error", async () => {
    const mockApi = {
      convertWordToPdf: jest.fn().mockResolvedValue({
        success: false,
        error: "conversion failed",
      }),
      convertPdfToWord: jest.fn(),
    };
    (window as Window & { electronAPI?: { convertWordToPdf: jest.Mock; convertPdfToWord: jest.Mock } }).electronAPI = mockApi;

    const file = new File(["test"], "test.docx", { type: "application/msword" });
    Object.defineProperty(file, "arrayBuffer", { value: jest.fn().mockResolvedValue(new ArrayBuffer(4)) });
    await expect(convertWordToPdfElectron(file)).rejects.toThrow("conversion failed");
  });
});
