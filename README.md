# Animos

Browser motion-template studio. Pick a template, drop in photos, animate text,
tweak speed / easing / 3D space, then export MP4 or WebP.

No account. Everything runs on your machine.

---

## Windows — easiest way

1. Install **[Node.js LTS](https://nodejs.org)** once (next, next, finish).
2. Download this repo as a zip: [Download ZIP](https://github.com/Pravyn-exe/animos/archive/refs/heads/main.zip)
3. Unzip the folder.
4. Double-click **`START.bat`**

The first launch installs packages (1–2 minutes). After that it opens
[http://localhost:8080](http://localhost:8080) by itself.

Leave the black window open while you work. Close it (or Ctrl+C) to quit.

### Make a Windows .exe

Double-click **`MAKE-EXE.bat`**. When it finishes, open the `release` folder
and copy **Animos.exe** wherever you want. Double-click that file next time —
no terminal.

Or in PowerShell:

```powershell
npm install
npm run dist
```

---

## Run from source (any OS)

You need **Node.js 22+**.

```bash
npm install
npm start
```

Open [http://localhost:8080](http://localhost:8080)

| Page      | URL           |
| --------- | ------------- |
| Landing   | `/`           |
| Templates | `/templates`  |
| Editor    | `/editor`     |

Desktop window (optional):

```bash
npm run desktop
```

---

## Export

Use **Chrome, Edge, Brave, or the Animos.exe window**. Safari and Firefox
cannot encode H.264 MP4 via WebCodecs.

- **MP4** — H.264, pick a frame rate (24 / 25 / 30 / 48 / 60)
- **WebP** — animated, including true transparent backgrounds
- **Save frame** — still PNG or WebP
