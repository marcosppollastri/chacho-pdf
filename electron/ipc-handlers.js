const { ipcMain, dialog } = require("electron");
const { exec } = require("child_process");
const { promisify } = require("util");
const fs = require("fs/promises");
const path = require("path");
const os = require("os");
const { findLibreOffice, setLibreOfficePath, checkLibreOffice } = require("./libreoffice");

const execAsync = promisify(exec);

async function convertWordToPdf(inputPath, outputDir) {
  const soffice = findLibreOffice();
  if (!soffice) throw new Error("LibreOffice no encontrado");
  await execAsync(`"${soffice}" --headless --convert-to pdf --outdir "${outputDir}" "${inputPath}"`);
  const base = path.basename(inputPath, path.extname(inputPath));
  return path.join(outputDir, `${base}.pdf`);
}

async function convertPdfToWord(inputPath, outputDir) {
  const txtPath = path.join(outputDir, "output.txt");
  const docxPath = path.join(outputDir, "output.docx");
  await execAsync(`pdftotext "${inputPath}" "${txtPath}"`);
  await execAsync(`pandoc "${txtPath}" -o "${docxPath}"`);
  return docxPath;
}

function handleConversions() {
  ipcMain.handle("check-libreoffice", async () => checkLibreOffice());

  ipcMain.handle("select-libreoffice-path", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [
        { name: "Ejecutable", extensions: ["exe", ""] },
      ],
    });
    if (!result.canceled && result.filePaths.length > 0) {
      setLibreOfficePath(result.filePaths[0]);
      return { path: result.filePaths[0] };
    }
    return null;
  });

  ipcMain.handle("convert-word-to-pdf", async (event, fileData, fileName) => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "chacho-"));
    const inputPath = path.join(tmpDir, fileName);
    await fs.writeFile(inputPath, Buffer.from(fileData));
    try {
      const outputPath = await convertWordToPdf(inputPath, tmpDir);
      const result = await fs.readFile(outputPath);
      await fs.unlink(inputPath);
      await fs.unlink(outputPath);
      await fs.rmdir(tmpDir);
      return { success: true, data: Array.from(result) };
    } catch (err) {
      await fs.unlink(inputPath).catch(() => {});
      await fs.rmdir(tmpDir).catch(() => {});
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle("convert-pdf-to-word", async (event, fileData, fileName) => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "chacho-"));
    const inputPath = path.join(tmpDir, fileName);
    await fs.writeFile(inputPath, Buffer.from(fileData));
    try {
      const outputPath = await convertPdfToWord(inputPath, tmpDir);
      const result = await fs.readFile(outputPath);
      await fs.unlink(inputPath);
      await fs.unlink(path.join(tmpDir, "output.txt"));
      await fs.unlink(outputPath);
      await fs.rmdir(tmpDir);
      return { success: true, data: Array.from(result) };
    } catch (err) {
      await fs.unlink(inputPath).catch(() => {});
      await fs.rmdir(tmpDir).catch(() => {});
      return { success: false, error: err.message };
    }
  });
}

module.exports = { handleConversions };
