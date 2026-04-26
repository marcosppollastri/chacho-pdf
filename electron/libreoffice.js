const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

let cachedPath = null;

function findLibreOffice() {
  if (cachedPath) return cachedPath;

  const platform = os.platform();

  if (platform === "win32") {
    const candidates = [
      "C:\\Program Files\\LibreOffice\\program\\soffice.exe",
      "C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe",
      "C:\\Program Files\\LibreOffice 7\\program\\soffice.exe",
      "C:\\Program Files (x86)\\LibreOffice 7\\program\\soffice.exe",
      "C:\\Program Files\\LibreOffice 24.2\\program\\soffice.exe",
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) {
        cachedPath = c;
        return c;
      }
    }
  } else {
    try {
      const result = execSync("which soffice", { encoding: "utf8" }).trim();
      if (result) {
        cachedPath = result;
        return result;
      }
    } catch {}
  }

  return null;
}

function setLibreOfficePath(p) {
  cachedPath = p;
  return p;
}

function checkLibreOffice() {
  const p = findLibreOffice();
  return { found: !!p, path: p };
}

module.exports = { findLibreOffice, setLibreOfficePath, checkLibreOffice };
