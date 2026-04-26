# chacho-pdf

Alternativa libre, gratuita y privada a iLovePDF. Procesa tus archivos en tu propio servidor o de forma 100% offline con la app de escritorio, sin depender de terceros.

## Herramientas disponibles

| Herramienta      | Modo web (navegador) | Modo servidor | Modo desktop (Electron) |
|------------------|---------------------|---------------|------------------------|
| Word a PDF       | No                  | Si            | Si (LibreOffice offline) |
| PDF a Word       | No                  | Si            | Si (LibreOffice offline) |
| Unir PDFs        | Si                  | No            | Si (navegador)         |
| Separar PDF      | Si                  | No            | Si (navegador)         |
| JPG a PDF        | Si                  | No            | Si (navegador)         |
| PDF a JPG        | Si                  | No            | Si (navegador)         |

## Desarrollo local (web)

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Desktop con Electron

```bash
npm install
npm run electron:dev
```

Levanta Next.js en modo desarrollo y lanza la ventana de Electron apuntando al servidor local.

### Build de producción desktop

```bash
npm run electron:build
```

Genera el binario para la plataforma actual (`.deb` en Linux, `.exe` con NSIS en Windows).

## Tests

```bash
npm test
```

Suite con Jest cubriendo renderer (React + jsdom) y proceso principal de Electron (Node).

## Deployment con Docker

```bash
docker compose up --build
```

La aplicación estará disponible en `http://localhost:3000`.

## Privacidad

- **Modo navegador**: las herramientas de unir, separar, jpg↔pdf y pdf↔jpg procesan todo en el cliente. Los archivos nunca salen de tu computadora.
- **Modo servidor**: las conversiones Word↔PDF se procesan en el servidor con archivos temporales que se eliminan inmediatamente después.
- **Modo desktop (Electron)**: las conversiones Word↔PDF usan LibreOffice instalado localmente. Funciona 100% offline, sin conexión a internet ni servidor.
