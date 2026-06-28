# Chat Enhanced for YouTube

A small Chrome (Manifest V3) extension that restyles the **YouTube Live chat** to
make it easier to read: compact, dark, dense, no avatars, colored usernames, less
noise — fully configurable from a control panel.

> Not affiliated with YouTube or Google.

![Classic YouTube chat next to the enhanced version](docs/classic-vs-enhanced.jpg)

## Features

- **Compact, dense layout** — more messages on screen, less padding and noise.
- **Colored usernames** — each author gets a stable color, so you recognize
  people at a glance.
- **Dark mode aware** — follows YouTube's light/dark theme.
- **Per-feature toggles** — turn individual tweaks on or off (zebra rows, colored
  usernames, avatars, timestamps, system messages) from a popup.
- **Multilingual interface** — the control panel is localized.

### Dark mode

![Enhanced chat in dark mode](docs/dark-mode.jpg)

### Control panel

Click the extension icon to open the control panel and toggle each feature live —
changes apply instantly, no page reload.

![Control panel popup with per-feature toggles](docs/control-panel.jpg)

### Languages

![Language options in the control panel](docs/languages.jpg)

### More examples

![Example of the enhanced chat](docs/examples-1.jpg)

![Another example of the enhanced chat](docs/examples-2.jpg)

## How it works

The live chat is served at its own URL (`youtube.com/live_chat`) and embedded as
an iframe on the watch page (and as a top-level page in popout mode). A single
content script is injected there:

- **`src/content/chat.css`** — does ~90% of the work in pure CSS. Pure CSS is
  robust against YouTube recycling chat DOM nodes and costs nothing at runtime.
- **`src/content/chat.ts`** — the only thing CSS can't do: hashes each author
  name to a stable color and exposes it as a CSS custom property.

Selectors target stable custom-element tags (`yt-live-chat-*-renderer`) and
stable internal IDs (`#author-name`, `#message`…), never YouTube's generated
utility classes.

Settings live in `chrome.storage.sync`; the content script mirrors them onto
`<html>` as attributes and chat.css gates each feature on them, so changes apply
live without reloading the page. See `src/settings.ts`, `src/popup/`.

## Privacy

The extension collects no personal data, makes no network requests, and contacts
no server. The only thing it stores is your own settings (which toggles are on,
and your chosen language) via the browser's sync storage. Full details in
[PRIVACY.md](PRIVACY.md).

## Develop

```bash
npm install
npm run dev      # HMR build into dist/ via @crxjs/vite-plugin
# or
npm run build    # production build into dist/
```

## Load in Chrome

1. `npm run build`
2. Go to `chrome://extensions`, enable **Developer mode**.
3. **Load unpacked** → select the `dist/` folder.
4. Open any YouTube live stream and pop out / open the chat.

## Roadmap

- V1 (done): CSS restyle + author coloring + light/dark theme awareness.
- V2 (done): control-panel popup with per-feature toggles.
- Next: per-feature fine-tuning (font size slider, zebra contrast), keyword highlights.

## License

Released under the MIT License — see [LICENSE](LICENSE).
