# uwuOS

A little operating system that runs in your browser. No installs, no downloads, just open it and mess around. I built it as a personal site that's actually fun to use instead of a boring portfolio page.

Everything is plain HTML, CSS, and JavaScript. No frameworks, no build step.

## What's in it

- **Boot screen** that asks your name the first time, then remembers you ("welcome back... uwu~")
- **Draggable, resizable windows** with a dock you can reorder
- **Spotlight search** — hit `Cmd/Ctrl + K` to jump to any app
- **Apps:**
  - Notes (saves to your device)
  - Calculator
  - Terminal (a fake shell called uwush with real commands)
  - Sketch (draw on a canvas)
  - Shorts (pulls live videos from YouTube channels, with likes + comments)
  - Weather (real forecast for your location)
  - Music (paste any mp3 link and it plays)
  - Settings (wallpaper, idle screen, your name)
- **AFK screen** with a big clock that slides in when you go idle
- **Desktop widgets** for the time and your stats
- Works on mobile too

## Running it

It's just static files, so anything that serves a folder works:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Deploying

This is set up for Vercel. Push to GitHub and import the repo, or use the CLI:

```bash
vercel
```

No config needed beyond the `vercel.json` that's already here.

## Notes

- Your name, notes, liked videos, music, and settings all live in your browser's local storage. Clearing site data resets everything.
- Shorts likes use a free shared counter API, so the counts are global across everyone who visits.

Made by [blazfxx](https://github.com/blazfxx).
