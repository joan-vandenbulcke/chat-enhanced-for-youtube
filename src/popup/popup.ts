import {
  DEFAULTS,
  getSettings,
  setSetting,
  type Density,
  type MentionMode,
  type Settings,
} from '../settings'
import { LANGS, MESSAGES, getLang, setLang, type Lang, type MsgKey } from '../translations'

const subtitle = document.getElementById('subtitle') as HTMLElement
const langLabel = document.getElementById('lang-label') as HTMLElement
const langSelect = document.getElementById('lang') as HTMLSelectElement
const container = document.getElementById('options') as HTMLElement

let currentLang: Lang

const MENTION_MODES: ReadonlyArray<{ value: MentionMode; label: MsgKey }> = [
  { value: 'mine', label: 'mentionsMine' },
  { value: 'all', label: 'mentionsAll' },
  { value: 'off', label: 'mentionsOff' },
]

const DENSITIES: ReadonlyArray<{ value: Density; label: MsgKey }> = [
  { value: 'comfortable', label: 'densityComfortable' },
  { value: 'compact', label: 'densityCompact' },
  { value: 'ultra', label: 'densityUltra' },
]

function t(key: MsgKey): string {
  return MESSAGES[currentLang][key] ?? MESSAGES.en[key]
}

function renderToggleRow(
  key: Exclude<keyof Settings, 'density' | 'mentionMode'>,
  checked: boolean,
): HTMLElement {
  const row = document.createElement('div')
  row.className = 'row'

  const id = `opt-${key}`
  const label = document.createElement('label')
  label.htmlFor = id
  label.id = `label-${key}`

  const sw = document.createElement('span')
  sw.className = 'switch'

  const input = document.createElement('input')
  input.type = 'checkbox'
  input.id = id
  input.checked = checked
  input.addEventListener('change', () => setSetting(key, input.checked))

  const track = document.createElement('span')
  track.className = 'track'

  sw.append(input, track)
  row.append(label, sw)
  return row
}

function renderDensityRow(value: Density): HTMLElement {
  const row = document.createElement('div')
  row.className = 'row'

  const label = document.createElement('label')
  label.htmlFor = 'opt-density'
  label.id = 'label-density'

  const select = document.createElement('select')
  select.id = 'opt-density'
  for (const density of DENSITIES) {
    const option = document.createElement('option')
    option.value = density.value
    option.dataset.msg = density.label
    select.appendChild(option)
  }
  select.value = value
  select.addEventListener('change', () => setSetting('density', select.value as Density))

  row.append(label, select)
  return row
}

function renderMentionRow(value: MentionMode): HTMLElement {
  const row = document.createElement('div')
  row.className = 'row'

  const label = document.createElement('label')
  label.htmlFor = 'opt-mentionMode'
  label.id = 'label-mentionMode'

  const select = document.createElement('select')
  select.id = 'opt-mentionMode'
  for (const mode of MENTION_MODES) {
    const option = document.createElement('option')
    option.value = mode.value
    option.dataset.msg = mode.label
    select.appendChild(option)
  }
  select.value = value
  select.addEventListener('change', () => setSetting('mentionMode', select.value as MentionMode))

  row.append(label, select)
  return row
}

/** (Re)apply all visible strings for the current language. */
function applyTranslations(): void {
  document.documentElement.lang = currentLang
  subtitle.textContent = t('subtitle')
  langLabel.textContent = t('language')
  for (const key of Object.keys(DEFAULTS) as Array<keyof Settings>) {
    const el = document.getElementById(`label-${key}`)
    if (el) el.textContent = t(key as MsgKey)
  }
  document.querySelectorAll<HTMLOptionElement>('option[data-msg]').forEach((option) => {
    option.textContent = t(option.dataset.msg as MsgKey)
  })
}

async function init(): Promise<void> {
  const [settings, lang] = await Promise.all([getSettings(), getLang()])
  currentLang = lang

  for (const l of LANGS) {
    const opt = document.createElement('option')
    opt.value = l.code
    opt.textContent = l.label
    langSelect.appendChild(opt)
  }
  langSelect.value = lang
  langSelect.addEventListener('change', () => {
    currentLang = langSelect.value as Lang
    void setLang(currentLang)
    applyTranslations()
  })

  for (const key of Object.keys(DEFAULTS) as Array<keyof Settings>) {
    if (key === 'density') {
      container.appendChild(renderDensityRow(settings.density))
    } else if (key === 'mentionMode') {
      container.appendChild(renderMentionRow(settings.mentionMode))
    } else {
      container.appendChild(renderToggleRow(key, settings[key]))
    }
  }
  applyTranslations()
}

void init()
