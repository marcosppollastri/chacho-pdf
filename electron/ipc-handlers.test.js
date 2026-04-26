const { ipcMain, dialog } = require("electron");
const fs = require("fs/promises");
const { exec } = require("child_process");
const { handleConversions } = require("./ipc-handlers");
const { findLibreOffice, setLibreOfficePath, checkLibreOffice } = require("./libreoffice");

jest.mock("electron", () => ({
  ipcMain: { handle: jest.fn() },
  dialog: { showOpenDialog: jest.fn() },
}));

jest.mock("./libreoffice", () => ({
  findLibreOffice: jest.fn(),
  setLibreOfficePath: jest.fn(),
  checkLibreOffice: jest.fn().mockReturnValue({ found: true, path: "/usr/bin/soffice" }),
}));

jest.mock("fs/promises", () => ({
  mkdtemp: jest.fn().mockResolvedValue("/tmp/chacho-test"),
  writeFile: jest.fn().mockResolvedValue(undefined),
  readFile: jest.fn().mockResolvedValue(Buffer.from("pdf")),
  unlink: jest.fn().mockResolvedValue(undefined),
  rmdir: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("child_process", () => ({
  exec: jest.fn((cmd, cb) => cb(null, "", "")),
  execSync: jest.fn(),
}));

describe("ipc handlers", () => {
  const handlers = {};

  beforeAll(() => {
    ipcMain.handle.mockImplementation((channel, handler) => {
      handlers[channel] = handler;
    });
    handleConversions();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("registers check-libreoffice handler", () => {
    expect(handlers["check-libreoffice"]).toBeDefined();
  });

  test("registers convert-word-to-pdf handler", () => {
    expect(handlers["convert-word-to-pdf"]).toBeDefined();
  });

  test("registers convert-pdf-to-word handler", () => {
    expect(handlers["convert-pdf-to-word"]).toBeDefined();
  });

  test("registers select-libreoffice-path handler", () => {
    expect(handlers["select-libreoffice-path"]).toBeDefined();
  });

  test("check-libreoffice returns libreoffice status", async () => {
    const result = await handlers["check-libreoffice"]();
    expect(checkLibreOffice).toHaveBeenCalled();
    expect(result).toEqual({ found: true, path: "/usr/bin/soffice" });
  });

  test("select-libreoffice-path returns null when cancelled", async () => {
    dialog.showOpenDialog.mockResolvedValue({ canceled: true, filePaths: [] });
    const result = await handlers["select-libreoffice-path"]();
    expect(result).toBeNull();
    expect(setLibreOfficePath).not.toHaveBeenCalled();
  });

  test("select-libreoffice-path sets path when file selected", async () => {
    dialog.showOpenDialog.mockResolvedValue({ canceled: false, filePaths: ["/usr/bin/soffice"] });
    const result = await handlers["select-libreoffice-path"]();
    expect(setLibreOfficePath).toHaveBeenCalledWith("/usr/bin/soffice");
    expect(result).toEqual({ path: "/usr/bin/soffice" });
  });

  test("convert-word-to-pdf succeeds", async () => {
    findLibreOffice.mockReturnValue("/usr/bin/soffice");
    const fileData = [1, 2, 3];
    const result = await handlers["convert-word-to-pdf"]({}, fileData, "test.docx");
    expect(fs.mkdtemp).toHaveBeenCalled();
    expect(fs.writeFile).toHaveBeenCalled();
    expect(exec).toHaveBeenCalled();
    expect(fs.readFile).toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
  });

  test("convert-word-to-pdf returns error when libreoffice not found", async () => {
    findLibreOffice.mockReturnValue(null);
    const fileData = [1, 2, 3];
    const result = await handlers["convert-word-to-pdf"]({}, fileData, "test.docx");
    expect(result.success).toBe(false);
    expect(result.error).toContain("LibreOffice");
  });

  test("convert-pdf-to-word succeeds", async () => {
    const fileData = [1, 2, 3];
    const result = await handlers["convert-pdf-to-word"]({}, fileData, "test.pdf");
    expect(fs.mkdtemp).toHaveBeenCalled();
    expect(fs.writeFile).toHaveBeenCalled();
    expect(exec).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });
});
