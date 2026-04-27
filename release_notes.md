# Release Notes

## v0.2.0

- **Electron desktop wrapper**: la app ahora corre como aplicación de escritorio con ventana propia.
- **Conversión Word↔PDF offline vía LibreOffice**: sin necesidad de servidor ni conexión a internet.
- **Detección automática de LibreOffice** en Windows (paths comunes) y Linux (`which soffice`).
- **Selector manual de ruta de LibreOffice** en caso de que la detección automática falle.
- **Preload script seguro** con `contextIsolation: true` y `nodeIntegration: false`.
- **IPC handlers** para `convert-word-to-pdf`, `convert-pdf-to-word`, `check-libreoffice` y `select-libreoffice-path`.
- **Helpers en renderer** (`src/lib/electron.ts`): `isElectron()`, `convertWordToPdfElectron()`, `convertPdfToWordElectron()`.
- **Auto-detección de puerto de desarrollo** (`3000-3005`) para el modo `electron:dev`.
- **Tests unitarios con Jest**: 78 tests pasando, >95% statements coverage en renderer y proceso principal.
- **Corrección de manejo de errores** en conversiones web (`catch` silencioso en `pdf-to-word` y `word-to-pdf`).

## v0.1.0

- **App web Next.js** con 6 herramientas de procesamiento de archivos.
- **Procesamiento 100% privado**: sin logins, sin terceros, sin enviar archivos a servicios externos.
- **Herramientas browser-side**: unir PDFs, separar PDF (por página/rango/selección), JPG a PDF, PDF a JPG.
- **Herramientas server-side**: Word a PDF y PDF a Word con archivos temporales auto-eliminados.
- **UI moderna** con Tailwind CSS, dropzones y lista de archivos con reordenamiento.
- **Docker deployment** listo con `docker compose up --build`.
- **Estructura de componentes** reutilizables: `FileDropzone`, `ToolCard`, `BackButton`, `Navbar`.
- **Navegación** entre herramientas con tarjetas visuales en la home.
- **Procesamiento de imágenes** con `pdf-lib` y `pdfjs-dist` completamente en el cliente.
- **Separación de responsabilidades** entre páginas de herramientas y componentes compartidos.
