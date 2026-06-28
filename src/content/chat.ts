/*
 * Chat Enhanced for YouTube — the only thing CSS can't do: per-author coloring.
 *
 * We hash each author's name to a stable hue and expose it as the
 * `--yci-author-hue` custom property on the message element. chat.css does the
 * actual painting. We re-apply on every added node because YouTube recycles
 * chat DOM nodes (a node that showed user A may be reused for user B).
 *
 * It also mirrors the user's settings (from the popup) onto <html> so chat.css
 * can switch features on/off, and keeps them in sync live via storage events.
 */

import { applyToRoot, getSettings } from '../settings'
import chatCss from './chat.css?inline'

const STYLE_ID = 'yci-styles'
const COLORED = 'yci-colored'

/** Inject or remove the whole stylesheet — this is the global on/off switch. */
function setStylesEnabled(enabled: boolean): void {
  const existing = document.getElementById(STYLE_ID)
  if (enabled) {
    if (existing) return
    const style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent = chatCss
    document.documentElement.appendChild(style)
  } else {
    existing?.remove()
  }
}

// Inject optimistically (default is enabled) to avoid a flash of unstyled chat;
// syncSettings() corrects it if the user has disabled the extension.
setStylesEnabled(true)
const ROW = 'yci-row'

// Stable zebra parity: assigned once when a message first appears and never
// recomputed, so removing old messages from the top doesn't reshuffle colors
// (which position-based CSS :nth-child would do, causing a visible shimmer).
let rowCounter = 0

/** Deterministic name -> hue (0-359) via FNV-1a hash for good spread.
 * Only the hue is decided here; chat.css applies theme-aware saturation and
 * lightness so names stay legible in both light and dark mode. */
function hueForAuthor(name: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < name.length; i++) {
    hash ^= name.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0) % 360
}

// Updated from settings; gates the (DOM-mutating) mention wrapping.
let mentionsEnabled = false

function colorize(message: Element): void {
  const authorEl = message.querySelector('#author-name')
  const name = authorEl?.textContent?.trim()
  if (!name) return
  ;(message as HTMLElement).style.setProperty('--yci-author-hue', String(hueForAuthor(name)))
  message.setAttribute(COLORED, name)

  // Assign zebra parity in arrival order. colorize runs once per new (or
  // recycled) message, so the counter stays in sync with on-screen order.
  message.setAttribute(ROW, rowCounter++ % 2 === 0 ? 'a' : 'b')

  if (mentionsEnabled) highlightMentions(message)
}

/** Wrap @mentions in the message text with a span chat.css can style.
 * YouTube has no native marker for mentions, so we scan the text nodes.
 * Only messages containing "@" get touched; the chip look is gated in CSS. */
function highlightMentions(message: Element): void {
  const msg = message.querySelector('#message')
  if (!msg) return
  const re = /@[\p{L}\p{N}_.\-]+/gu
  for (const node of Array.from(msg.childNodes)) {
    if (node.nodeType !== Node.TEXT_NODE) continue
    const text = node.textContent ?? ''
    re.lastIndex = 0
    if (!re.test(text)) continue
    re.lastIndex = 0
    const frag = document.createDocumentFragment()
    let last = 0
    let m: RegExpExecArray | null
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)))
      const span = document.createElement('span')
      span.className = 'yci-mention'
      span.textContent = m[0]
      frag.appendChild(span)
      last = m.index + m[0].length
    }
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)))
    node.replaceWith(frag)
  }
}

/** A node is a message we care about (and either new or recycled to a new author). */
function isUncoloredMessage(node: Node): node is Element {
  if (!(node instanceof Element)) return false
  if (node.tagName !== 'YT-LIVE-CHAT-TEXT-MESSAGE-RENDERER') return false
  const current = node.querySelector('#author-name')?.textContent?.trim()
  return node.getAttribute(COLORED) !== current
}

function observe(itemList: Element): void {
  // Color whatever is already on screen.
  itemList.querySelectorAll('yt-live-chat-text-message-renderer').forEach(colorize)

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (isUncoloredMessage(node)) colorize(node)
      }
    }
  })
  observer.observe(itemList, { childList: true })
}

/** #items appears asynchronously after the chat app boots; wait for it. */
function waitForItems(): void {
  const items = document.querySelector('#items.yt-live-chat-item-list-renderer')
  if (items) {
    observe(items)
    return
  }
  const boot = new MutationObserver(() => {
    const found = document.querySelector('#items.yt-live-chat-item-list-renderer')
    if (found) {
      boot.disconnect()
      observe(found)
    }
  })
  boot.observe(document.documentElement, { childList: true, subtree: true })
}

/** Apply popup settings (styles on/off + feature attributes) and stay in sync. */
async function syncSettings(): Promise<void> {
  const apply = (s: Awaited<ReturnType<typeof getSettings>>) => {
    setStylesEnabled(s.enabled)
    mentionsEnabled = s.highlightMentions
    applyToRoot(s, document.documentElement)
  }
  apply(await getSettings())
  chrome.storage.onChanged.addListener(async (_changes, area) => {
    if (area === 'sync') apply(await getSettings())
  })
}

void syncSettings()
waitForItems()
