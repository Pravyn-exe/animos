# Animos

Browser motion-template studio. Pick a template, drop in photos, animate text,
tweak speed / easing / 3D space, then export MP4 or WebP.

No account or database. Everything runs in the browser.

## Run locally

You need **[Node.js 22](https://nodejs.org/)** or later (includes npm).

```bash
git clone https://github.com/Pravyn-exe/animos.git
cd animos
npm install
npm run dev
```

Open [http://localhost:8080](http://localhost:8080)

| Page | URL |
| --- | --- |
| Landing | `/` |
| Templates | `/templates` |
| Editor | `/editor` |

The dev server uses port **8080**. If that port is already in use, close the
other app and start again.

Stop the server with `Ctrl+C`.

### Windows (PowerShell)

```powershell
git clone https://github.com/Pravyn-exe/animos.git
cd animos
npm install
npm run dev
```

Then open http://localhost:8080

## Export

Use **Chrome, Edge, or Brave**. Safari and Firefox cannot encode H.264 MP4 via
WebCodecs.

- **MP4** — H.264, pick a frame rate (24 / 25 / 30 / 48 / 60)
- **WebP** — animated, including true transparent backgrounds
- **Save frame** — still PNG or WebP
- Transparent background also offers a PNG sequence zip

## Production build

```bash
npm run build
npm run preview
```

Production preview serves at [http://127.0.0.1:8081](http://127.0.0.1:8081).
