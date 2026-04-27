const { app, BrowserWindow } = require("electron");
const path = require("path");
const http = require("http");
const { parse } = require("url");
const { handleConversions } = require("./ipc-handlers");

let mainWindow;
let httpServer;

async function detectDevPort() {
  for (let port = 3000; port <= 3005; port++) {
    try {
      const res = await fetch(`http://localhost:${port}`);
      if (res.status === 200) return port;
    } catch {}
  }
  return 3000;
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    const port = await detectDevPort();
    mainWindow.loadURL(`http://localhost:${port}`);
    mainWindow.webContents.openDevTools();
  } else {
    const port = await startNextServer();
    mainWindow.loadURL(`http://localhost:${port}`);
  }
}

async function startNextServer() {
  const port = 3000;
  const appPath = app.getAppPath().replace(/\.asar$/, ".asar.unpacked");
  const next = require("next");
  const nextApp = next({ dev: false, dir: appPath });
  const handle = nextApp.getRequestHandler();

  await nextApp.prepare();

  httpServer = http.createServer((req, res) => {
    handle(req, res, parse(req.url, true));
  });

  const actualPort = await new Promise((resolve) => {
    httpServer.listen(0, "127.0.0.1", () => {
      resolve(httpServer.address().port);
    });
  });
  return actualPort;
}

app.whenReady().then(async () => {
  await createWindow();
  handleConversions();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (httpServer) httpServer.close();
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  if (httpServer) httpServer.close();
});
