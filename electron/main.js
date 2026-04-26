const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const { handleConversions } = require("./ipc-handlers");

let mainWindow;
let nextServer;

async function detectDevPort() {
  for (let port = 3000; port <= 3005; port++) {
    try {
      const res = await fetch(`http://localhost:${port}`);
      if (res.status === 200) return port;
    } catch {}
  }
  return 3000;
}

function createWindow() {
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
    // Auto-detect Next.js dev port (3000 may be in use)
    detectDevPort().then((port) => {
      mainWindow.loadURL(`http://localhost:${port}`);
      mainWindow.webContents.openDevTools();
    });
  } else {
    // In production, start Next.js server internally
    startNextServer().then((port) => {
      mainWindow.loadURL(`http://localhost:${port}`);
    });
  }
}

function startNextServer() {
  return new Promise((resolve, reject) => {
    const port = 3000;
    const appPath = app.getAppPath();
    const serverPath = path.join(appPath, ".next", "standalone", "server.js");
    nextServer = spawn(process.execPath, [serverPath], {
      env: { ...process.env, PORT: port, HOSTNAME: "127.0.0.1" },
      cwd: appPath,
    });

    let ready = false;
    nextServer.stdout.on("data", (data) => {
      const str = data.toString();
      console.log("[Next.js]", str);
      if (!ready && str.includes("Ready")) {
        ready = true;
        resolve(port);
      }
    });

    nextServer.stderr.on("data", (data) => {
      console.error("[Next.js]", data.toString());
    });

    nextServer.on("error", reject);

    // Fallback timeout
    setTimeout(() => {
      if (!ready) {
        ready = true;
        resolve(port);
      }
    }, 5000);
  });
}

app.whenReady().then(() => {
  createWindow();
  handleConversions();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (nextServer) nextServer.kill();
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  if (nextServer) nextServer.kill();
});
