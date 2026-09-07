/*
 * Chat Restyler for YouTube — the only thing CSS can't do: per-author coloring.
 *
 * We assign each author an unused class from the Tailwind CSS color palette.
 * We re-apply it when YouTube adds or
 * recycles chat DOM nodes (a node that showed user A may be reused for user B).
 *
 * It also mirrors the user's settings (from the popup) onto <html> so chat.css
 * can switch features on/off, and keeps them in sync live via storage events.
 */

import { applyToRoot, getSettings, type MentionMode } from '../settings'
import chatCss from './chat.css?inline'
import nameColorsCss from './name-colors.css?inline'

const STYLE_ID = 'yci-styles'
const COLORED = 'yci-colored'
const COLOR_CLASS = 'yci-color-class'
const MESSAGE_SELECTOR = 'yt-live-chat-text-message-renderer'
const INPUT_AUTHOR_SELECTOR = 'yt-live-chat-message-input-renderer #author-name'

/** Inject or remove the whole stylesheet — this is the global on/off switch. */
function setStylesEnabled(enabled: boolean): void {
  const existing = document.getElementById(STYLE_ID)
  if (enabled) {
    if (existing) return
    const style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent = `${chatCss}\n${nameColorsCss}`
    document.documentElement.appendChild(style)
  } else {
    existing?.remove()
  }
}

// Inject optimistically (default is enabled) to avoid a flash of unstyled chat;
// syncSettings() corrects it if the user has disabled the extension.
setStylesEnabled(true)
const ROW = 'yci-row'

// Stable zebra parity: assigned when a renderer first represents an author.
// Removing old messages from the top therefore doesn't reshuffle visible rows
// (which position-based CSS :nth-child would do, causing a visible shimmer).
let rowCounter = 0

const COLOR_FAMILIES = [
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
  'slate',
] as const
const COLOR_SHADES = [300, 400, 500, 600, 700] as const

function shuffled<T>(values: readonly T[]): T[] {
  const result = [...values]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// A Latin-square order guarantees every family once and spreads all five
// shades across each block of 18 authors. Both axes shuffle on every reload.
const shuffledFamilies = shuffled(COLOR_FAMILIES)
const shuffledShades = shuffled(COLOR_SHADES)
const colorClasses = COLOR_SHADES.flatMap((_, round) =>
  shuffledFamilies.map(
    (family, familyIndex) =>
      `yt-name-color-${family}-${shuffledShades[(familyIndex + round) % shuffledShades.length]}`,
  ),
)
const authorColors = new Map<string, string>()
let paletteCursor = 0

function colorClassForAuthor(name: string): string {
  const existing = authorColors.get(name)
  if (existing) return existing

  const colorClass = colorClasses[paletteCursor++ % colorClasses.length]
  authorColors.set(name, colorClass)
  return colorClass
}

// Updated from settings; controls the (DOM-mutating) mention wrapping. The
// current user's handle is read from YouTube's chat input and cached.
let mentionMode: MentionMode = 'off'
let currentUserHandle: string | null = null
let observedItems: Element | null = null

function normalizeHandle(value: string): string {
  return value
    .trim()
    .replace(/^@/, '')
    .replace(/[\u200b-\u200d\ufeff]/g, '')
    .normalize('NFKC')
    .toLocaleLowerCase()
}

/** Cache the signed-in user's handle when YouTube exposes the chat input. */
function refreshCurrentUser(): boolean {
  const text = document.querySelector(INPUT_AUTHOR_SELECTOR)?.textContent
  if (!text) return false
  const handle = normalizeHandle(text)
  if (!handle || handle === currentUserHandle) return false
  currentUserHandle = handle
  return true
}

function refreshMessage(message: Element): void {
  const authorEl = message.querySelector('#author-name')
  const name = authorEl?.textContent?.trim()
  if (!name) return

  if (message.getAttribute(COLORED) !== name) {
    const previousColorClass = message.getAttribute(COLOR_CLASS)
    if (previousColorClass) message.classList.remove(previousColorClass)
    const colorClass = colorClassForAuthor(name)
    message.classList.add(colorClass)
    message.setAttribute(COLOR_CLASS, colorClass)
    message.setAttribute(COLORED, name)

    // A changed author means YouTube created or recycled this renderer.
    message.setAttribute(ROW, rowCounter++ % 2 === 0 ? 'a' : 'b')
  }

  if (mentionMode !== 'off') highlightMentions(message)
}

/** Wrap mentions selected by the user with a span chat.css can style. */
function highlightMentions(message: Element): void {
  const msg = message.querySelector('#message')
  if (!msg || (mentionMode === 'mine' && !currentUserHandle)) return
  const re = /@[\p{L}\p{N}_.\-]+/gu
  for (const node of Array.from(msg.childNodes)) {
    if (node.nodeType !== Node.TEXT_NODE) continue
    const text = node.textContent ?? ''
    re.lastIndex = 0
    const frag = document.createDocumentFragment()
    let last = 0
    let found = false
    let m: RegExpExecArray | null
    while ((m = re.exec(text)) !== null) {
      if (mentionMode === 'mine' && normalizeHandle(m[0]) !== currentUserHandle) continue
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)))
      const span = document.createElement('span')
      span.className = 'yci-mention'
      span.textContent = m[0]
      frag.appendChild(span)
      last = m.index + m[0].length
      found = true
    }
    if (!found) continue
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)))
    node.replaceWith(frag)
  }
}

function clearMentionHighlights(): void {
  observedItems
    ?.querySelectorAll('.yci-mention')
    .forEach((mention) => mention.replaceWith(document.createTextNode(mention.textContent ?? '')))
}

function addMessagesFromNode(node: Node, messages: Set<Element>): void {
  const element = node instanceof Element ? node : node.parentElement
  if (!element) return
  const parentMessage = element.closest(MESSAGE_SELECTOR)
  if (parentMessage) messages.add(parentMessage)
  if (element.matches(MESSAGE_SELECTOR)) messages.add(element)
  element.querySelectorAll(MESSAGE_SELECTOR).forEach((message) => messages.add(message))
}

function refreshVisibleMessages(): void {
  observedItems?.querySelectorAll(MESSAGE_SELECTOR).forEach(refreshMessage)
}

function observe(itemList: Element): void {
  observedItems = itemList
  refreshCurrentUser()

  // Color whatever is already on screen.
  refreshVisibleMessages()

  const pending = new Set<Element>()
  let scheduled = false

  const flush = () => {
    scheduled = false
    // The input can appear after the message list. If it just became available,
    // revisit the visible rows once so earlier mentions are not missed.
    if (mentionMode === 'mine' && refreshCurrentUser()) {
      itemList.querySelectorAll(MESSAGE_SELECTOR).forEach((message) => pending.add(message))
    }
    pending.forEach(refreshMessage)
    pending.clear()
  }

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      addMessagesFromNode(m.target, pending)
      m.addedNodes.forEach((node) => addMessagesFromNode(node, pending))
    }
    if (pending.size > 0 && !scheduled) {
      scheduled = true
      queueMicrotask(flush)
    }
  })
  observer.observe(itemList, { childList: true, characterData: true, subtree: true })
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
    const mentionModeChanged = mentionMode !== s.mentionMode
    setStylesEnabled(s.enabled)
    mentionMode = s.mentionMode
    applyToRoot(s, document.documentElement)
    if (mentionModeChanged) {
      clearMentionHighlights()
      if (mentionMode !== 'off') {
        if (mentionMode === 'mine') refreshCurrentUser()
        refreshVisibleMessages()
      }
    }
  }
  apply(await getSettings())
  chrome.storage.onChanged.addListener(async (_changes, area) => {
    if (area === 'sync') apply(await getSettings())
  })
}

async function init(): Promise<void> {
  await syncSettings()
  waitForItems()
}

void init()
