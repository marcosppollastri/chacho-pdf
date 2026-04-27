interface ElectronAPI {
  convertWordToPdf: (data: number[], name: string) => Promise<{ success: boolean; data?: number[]; error?: string }>;
  convertPdfToWord: (data: number[], name: string) => Promise<{ success: boolean; data?: number[]; error?: string }>;
}

export function isElectron(): boolean {
  return typeof window !== "undefined" && !!(window as Window & { electronAPI?: ElectronAPI }).electronAPI;
}

function getApi(): ElectronAPI {
  const api = (window as Window & { electronAPI?: ElectronAPI }).electronAPI;
  if (!api) throw new Error("No disponible fuera de Electron");
  return api;
}

export async function convertWordToPdfElectron(file: File): Promise<Blob> {
  const api = getApi();
  const arrayBuffer = await file.arrayBuffer();
  const result = await api.convertWordToPdf(Array.from(new Uint8Array(arrayBuffer)), file.name);
  if (!result.success) throw new Error(result.error || "Error en conversión");
  return new Blob([new Uint8Array(result.data!)], { type: "application/pdf" });
}

export async function convertPdfToWordElectron(file: File): Promise<Blob> {
  const api = getApi();
  const arrayBuffer = await file.arrayBuffer();
  const result = await api.convertPdfToWord(Array.from(new Uint8Array(arrayBuffer)), file.name);
  if (!result.success) throw new Error(result.error || "Error en conversión");
  return new Blob([new Uint8Array(result.data!)], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}
