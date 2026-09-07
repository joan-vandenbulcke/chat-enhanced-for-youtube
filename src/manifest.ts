import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "../package.json";

export default defineManifest({
  manifest_version: 3,
  name: "Chat Restyler for YouTube",
  // Single source of truth: bumped by release-please in package.json.
  version: pkg.version,
  description: "Makes the YouTube Live chat look and read better. Not affiliated with YouTube or Google.",
  icons: {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png",
  },
  permissions: ["storage"],
  action: {
    default_title: "Chat Restyler for YouTube",
    default_popup: "src/popup/popup.html",
    default_icon: {
      "16": "icons/icon16.png",
      "32": "icons/icon32.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png",
    },
  },
  content_scripts: [
    {
      // The live chat is served at its own URL and rendered inside an iframe
      // on the watch page, plus as a top-level page in popout mode.
      // Matching this URL with all_frames covers both cases in one shot.
      matches: ["https://www.youtube.com/live_chat*"],
      all_frames: true,
      run_at: "document_start",
      // chat.css is injected by chat.ts (imported as a string) so the global
      // enable/disable switch can add or remove the whole stylesheet at once.
      js: ["src/content/chat.ts"],
    },
  ],
});
