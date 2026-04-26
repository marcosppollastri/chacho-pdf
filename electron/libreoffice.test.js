const { findLibreOffice, setLibreOfficePath, checkLibreOffice } = require("./libreoffice");
const fs = require("fs");
const { execSync } = require("child_process");

jest.mock("fs");
jest.mock("child_process");

describe("libreoffice detection", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test("checkLibreOffice returns not found when no soffice exists", () => {
    fs.existsSync = jest.fn().mockReturnValue(false);
    execSync.mockImplementation(() => { throw new Error("not found"); });

    const result = checkLibreOffice();
    expect(result.found).toBe(false);
    expect(result.path).toBeNull();
  });

  test("checkLibreOffice finds soffice on Linux via which", () => {
    fs.existsSync = jest.fn().mockReturnValue(false);
    execSync.mockReturnValue("/usr/bin/soffice\n");

    Object.defineProperty(process, "platform", { value: "linux" });
    const result = checkLibreOffice();

    expect(result.found).toBe(true);
    expect(result.path).toBe("/usr/bin/soffice");
  });

  test("setLibreOfficePath caches path and returns it", () => {
    const path = "/custom/soffice";
    const result = setLibreOfficePath(path);
    expect(result).toBe(path);

    // After setting, findLibreOffice should return cached path
    expect(findLibreOffice()).toBe(path);
  });
});
