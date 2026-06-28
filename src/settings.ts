/*
 * Shared settings model used by both the popup and the content script.
 * Stored in chrome.storage.sync so it follows the user across devices.
 *
 * The content script maps these booleans to attributes on <html>; chat.css
 * gates each feature on those attributes. Defaults are chosen so the *absence*
 * of any attribute = the default look, which means zero flash before the
 * (async) storage read completes.
 */

export interface Settings {
  enabled: boolean
  zebra: boolean
  colorAuthors: boolean
  underlineNames: boolean
  highlightMentions: boolean
  hideAvatars: boolean
  hideMemberBadges: boolean
  hideEngagement: boolean
}

export const DEFAULTS: Settings = {
  enabled: true,
  zebra: true,
  colorAuthors: true,
  underlineNames: false,
  highlightMentions: true,
  hideAvatars: true,
  hideMemberBadges: false,
  hideEngagement: true,
}

export async function getSettings(): Promise<Settings> {
  const stored = await chrome.storage.sync.get(DEFAULTS)
  return stored as Settings
}

export async function setSetting<K extends keyof Settings>(key: K, value: Settings[K]): Promise<void> {
  await chrome.storage.sync.set({ [key]: value })
}

/** Reflect feature settings as attributes on the chat document's <html>.
 * The global `enabled` switch is handled separately (it injects/removes the
 * whole stylesheet), not as an attribute. */
export function applyToRoot(s: Settings, root: HTMLElement): void {
  root.toggleAttribute('data-yci-no-zebra', !s.zebra)
  root.toggleAttribute('data-yci-no-colors', !s.colorAuthors)
  root.toggleAttribute('data-yci-underline', s.underlineNames)
  root.toggleAttribute('data-yci-mentions', s.highlightMentions)
  root.toggleAttribute('data-yci-show-avatars', !s.hideAvatars)
  root.toggleAttribute('data-yci-hide-badges', s.hideMemberBadges)
  root.toggleAttribute('data-yci-show-engagement', !s.hideEngagement)
}
