# Privacy Policy

_Last updated: 2026-09-07_

**Chat Restyler for YouTube** ("the extension") is a browser extension that
restyles the YouTube Live chat. This policy explains exactly what the extension
does and does not do with your data.

## Summary

**The extension developer does not collect or receive personal data.** The
extension processes limited information from the visible YouTube Live chat
locally in your browser, sends nothing to an external server, and stores only
your extension preferences.

## What data is processed locally

To provide its visible features, the extension temporarily reads:

- author names or handles displayed in the chat, to assign each author a color
  for the duration of the page;
- visible chat message text, to identify `@mentions`;
- your own handle as displayed by YouTube in the chat input, when the "Only
  mine" mention setting is enabled.

This information is used only inside the open chat page. Author names, handles,
and message contents are not written to extension storage, transmitted, or made
available to the extension developer. Temporary author-to-color associations
are discarded when the page is closed or reloaded.

## What data is stored

The only data stored by the extension is your **own settings** (e.g. which
visual options are enabled and your chosen interface language). These are saved
using the browser's built-in `chrome.storage.sync` API. Depending on your browser
and account settings, the browser provider may synchronize these preferences
across your signed-in devices.

- This data contains only extension options and a language code.
- The extension author cannot see, access, or receive this data.

## What the extension does NOT do

- It does **not** retain, transmit, or sell personal data.
- It does **not** use analytics, tracking, advertising, or telemetry.
- It does **not** send author names, handles, chat messages, or settings to the
  extension developer or any third party.
- It does **not** initiate network requests.
- It does **not** access YouTube account APIs, authentication data, browsing
  history, or any site other than the YouTube Live chat page it restyles.

## Permissions

The extension requests a single permission:

- **`storage`** — to save and optionally synchronize your settings through the
  browser, as described above.

It runs only on the YouTube Live chat page
(`https://www.youtube.com/live_chat*`).

## Changes to this policy

If this policy ever changes, the updated version will be published here with a
new "Last updated" date.

## Contact

Questions about this policy: **vandenbulckejoan@gmail.com**
