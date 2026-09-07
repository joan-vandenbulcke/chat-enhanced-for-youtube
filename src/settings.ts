/*
 * Shared settings model used by both the popup and the content script.
 * Stored in chrome.storage.sync so it follows the user across devices.
 *
 * The content script maps these booleans to attributes on <html>; chat.css
 * gates each feature on those attributes. Defaults are chosen so the *absence*
 * of any attribute = the default look, which means zero flash before the
 * (async) storage read completes.
 */

export type MentionMode = 'mine' | 'all' | 'off'
export type Density = 'comfortable' | 'compact' | 'ultra'

export interface Settings {
  enabled: boolean
  density: Density
  zebra: boolean
  colorAuthors: boolean
  underlineNames: boolean
  mentionMode: MentionMode
  hideAvatars: boolean
  hideMemberBadges: boolean
  hideEngagement: boolean
}

export const DEFAULTS: Settings = {
  enabled: true,
  density: 'compact',
  zebra: true,
  colorAuthors: true,
  underlineNames: false,
  mentionMode: 'mine',
  hideAvatars: true,
  hideMemberBadges: false,
  hideEngagement: true,
}

export async function getSettings(): Promise<Settings> {
  const stored = await chrome.storage.sync.get([...Object.keys(DEFAULTS), 'highlightMentions'])
  const legacyMentionMode = stored.highlightMentions === false ? 'off' : DEFAULTS.mentionMode
  return {
    ...DEFAULTS,
    ...stored,
    density:
      stored.density === 'comfortable' || stored.density === 'compact' || stored.density === 'ultra'
        ? stored.density
        : DEFAULTS.density,
    mentionMode:
      stored.mentionMode === 'mine' || stored.mentionMode === 'all' || stored.mentionMode === 'off'
        ? stored.mentionMode
        : legacyMentionMode,
  } as Settings
}

export async function setSetting<K extends keyof Settings>(key: K, value: Settings[K]): Promise<void> {
  await chrome.storage.sync.set({ [key]: value })
}

/** Reflect feature settings as attributes on the chat document's <html>.
 * The global `enabled` switch is handled separately (it injects/removes the
 * whole stylesheet), not as an attribute. */
export function applyToRoot(s: Settings, root: HTMLElement): void {
  root.dataset.yciDensity = s.density
  root.toggleAttribute('data-yci-no-zebra', !s.zebra)
  root.toggleAttribute('data-yci-no-colors', !s.colorAuthors)
  root.toggleAttribute('data-yci-underline', s.underlineNames)
  root.toggleAttribute('data-yci-mentions', s.mentionMode !== 'off')
  root.toggleAttribute('data-yci-show-avatars', !s.hideAvatars)
  root.toggleAttribute('data-yci-hide-badges', s.hideMemberBadges)
  root.toggleAttribute('data-yci-show-engagement', !s.hideEngagement)
}
