import { app, BrowserWindow, shell } from "electron";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 8080;
const URL = `http://127.0.0.1:${PORT}`;

let child = null;

function waitForPort(port, tries = 80) {
  return new Promise((resolve, reject) => {
    const attempt = (left) => {
      const socket = createServer();
      socket.once("error", () => {
        socket.close();
        resolve();
      });
      socket.once("listening", () => {
        socket.close();
        if (left <= 0) reject(new Error("dev server did not start"));
        else setTimeout(() => attempt(left - 1), 250);
      });
      socket.listen(port, "127.0.0.1");
    };
    attempt(tries);
  });
}

function startVite() {
  const viteJs = join(root, "node_modules", "vite", "bin", "vite.js");
  child = spawn(process.execPath, [viteJs, "dev", "--host", "127.0.0.1", "--port", String(PORT)], {
    cwd: root,
    stdio: "inherit",
    windowsHide: true,
    env: { ...process.env },
  });
  child.on("error", (err) => {
    console.error("failed to start vite:", err);
  });
}

async function createWindow() {
  startVite();
  await waitForPort(PORT).catch(() => {});
  const win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 960,
    minHeight: 640,
    title: "Animos",
    backgroundColor: "#0f0f0f",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
  await win.loadURL(URL);
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (child && !child.killed) child.kill();
  app.quit();
});

app.on("before-quit", () => {
  if (child && !child.killed) child.kill();
});
