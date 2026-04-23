# chacho-pdf

Alternativa libre, gratuita y privada a iLovePDF. Procesa tus archivos en tu propio servidor sin depender de terceros.

## Herramientas disponibles

- **Word a PDF** — Convierte documentos Word a PDF (servidor)
- **Separar PDF** — Divide un PDF por página, rango o selección manual (navegador)
- **Unir PDFs** — Combina varios PDFs en uno solo (navegador)
- **PDF a Word** — Extrae el texto de un PDF a un documento Word (servidor)
- **JPG a PDF** — Convierte imágenes a un PDF (navegador)
- **PDF a JPG** — Extrae páginas de un PDF como imágenes JPG (navegador)

## Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Deployment con Docker

```bash
docker-compose up --build
```

La aplicación estará disponible en `http://localhost:3000`.

## Privacidad

- Las herramientas que corren en el **navegador** (unir, separar, jpg↔pdf) no suben archivos al servidor.
- Las conversiones **Word↔PDF** se procesan en el servidor pero los archivos temporales se eliminan inmediatamente después.
