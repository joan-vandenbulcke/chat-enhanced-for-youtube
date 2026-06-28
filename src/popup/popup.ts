import { DEFAULTS, getSettings, setSetting, type Settings } from '../settings'
import { LANGS, MESSAGES, getLang, setLang, type Lang, type MsgKey } from '../translations'

const subtitle = document.getElementById('subtitle') as HTMLElement
const langLabel = document.getElementById('lang-label') as HTMLElement
const langSelect = document.getElementById('lang') as HTMLSelectElement
const container = document.getElementById('options') as HTMLElement

let currentLang: Lang

function t(key: MsgKey): string {
  return MESSAGES[currentLang][key] ?? MESSAGES.en[key]
}

function renderRow(key: keyof Settings, checked: boolean): HTMLElement {
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

/** (Re)apply all visible strings for the current language. */
function applyTranslations(): void {
  document.documentElement.lang = currentLang
  subtitle.textContent = t('subtitle')
  langLabel.textContent = t('language')
  for (const key of Object.keys(DEFAULTS) as Array<keyof Settings>) {
    const el = document.getElementById(`label-${key}`)
    if (el) el.textContent = t(key as MsgKey)
  }
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
    container.appendChild(renderRow(key, settings[key]))
  }
  applyTranslations()
}

void init()
