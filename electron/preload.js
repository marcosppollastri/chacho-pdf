const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  convertWordToPdf: (fileData, fileName) =>
    ipcRenderer.invoke("convert-word-to-pdf", fileData, fileName),
  convertPdfToWord: (fileData, fileName) =>
    ipcRenderer.invoke("convert-pdf-to-word", fileData, fileName),
  checkLibreOffice: () => ipcRenderer.invoke("check-libreoffice"),
  selectLibreOfficePath: () => ipcRenderer.invoke("select-libreoffice-path"),
});
