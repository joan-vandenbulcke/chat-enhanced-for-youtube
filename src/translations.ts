/*
 * Lightweight i18n for the popup UI only (the content script needs no strings).
 *
 * We deliberately avoid Chrome's native _locales system: it picks the browser
 * UI language and can't be changed by the user. Here the user chooses the
 * language from a dropdown; the choice is stored in chrome.storage.sync and
 * defaults to English until the user picks one.
 */

export type Lang = 'en' | 'fr' | 'es' | 'pt' | 'de' | 'ru' | 'zh' | 'ja' | 'ko'

/** Languages offered in the dropdown, each shown in its own script. */
export const LANGS: ReadonlyArray<{ code: Lang; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português (BR)' },
  { code: 'de', label: 'Deutsch' },
  { code: 'ru', label: 'Русский' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
]

/** Translation keys = settings keys + a few UI strings. */
export type MsgKey =
  | 'subtitle'
  | 'language'
  | 'enabled'
  | 'zebra'
  | 'colorAuthors'
  | 'underlineNames'
  | 'highlightMentions'
  | 'hideAvatars'
  | 'hideMemberBadges'
  | 'hideEngagement'

export const MESSAGES: Record<Lang, Record<MsgKey, string>> = {
  en: {
    subtitle: 'YouTube Live chat styling',
    language: 'Language',
    enabled: 'Enhancements enabled',
    zebra: 'Alternating rows (zebra)',
    colorAuthors: 'Colored usernames',
    underlineNames: 'Underline usernames',
    highlightMentions: 'Highlight mentions',
    hideAvatars: 'Hide avatars',
    hideMemberBadges: 'Hide member badges',
    hideEngagement: 'Hide system messages',
  },
  fr: {
    subtitle: 'Style du chat YouTube Live',
    language: 'Langue',
    enabled: 'Améliorations activées',
    zebra: 'Lignes alternées (zebra)',
    colorAuthors: 'Pseudos colorés',
    underlineNames: 'Souligner les pseudos',
    highlightMentions: 'Surligner les mentions',
    hideAvatars: 'Masquer les avatars',
    hideMemberBadges: "Masquer les badges d'abonné",
    hideEngagement: 'Masquer les messages système',
  },
  es: {
    subtitle: 'Estilo del chat en directo de YouTube',
    language: 'Idioma',
    enabled: 'Mejoras activadas',
    zebra: 'Filas alternas (zebra)',
    colorAuthors: 'Nombres de usuario con color',
    underlineNames: 'Subrayar nombres de usuario',
    highlightMentions: 'Resaltar menciones',
    hideAvatars: 'Ocultar avatares',
    hideMemberBadges: 'Ocultar insignias de miembro',
    hideEngagement: 'Ocultar mensajes del sistema',
  },
  zh: {
    subtitle: 'YouTube 直播聊天样式',
    language: '语言',
    enabled: '启用美化',
    zebra: '隔行变色（斑马纹）',
    colorAuthors: '彩色用户名',
    underlineNames: '用户名加下划线',
    highlightMentions: '高亮提及',
    hideAvatars: '隐藏头像',
    hideMemberBadges: '隐藏会员徽章',
    hideEngagement: '隐藏系统消息',
  },
  ru: {
    subtitle: 'Оформление чата трансляций YouTube',
    language: 'Язык',
    enabled: 'Улучшения включены',
    zebra: 'Чередование строк (зебра)',
    colorAuthors: 'Цветные имена пользователей',
    underlineNames: 'Подчёркивать имена пользователей',
    highlightMentions: 'Выделять упоминания',
    hideAvatars: 'Скрыть аватары',
    hideMemberBadges: 'Скрыть значки участников',
    hideEngagement: 'Скрыть системные сообщения',
  },
  pt: {
    subtitle: 'Estilo do chat ao vivo do YouTube',
    language: 'Idioma',
    enabled: 'Melhorias ativadas',
    zebra: 'Linhas alternadas (zebra)',
    colorAuthors: 'Nomes de usuário coloridos',
    underlineNames: 'Sublinhar nomes de usuário',
    highlightMentions: 'Destacar menções',
    hideAvatars: 'Ocultar avatares',
    hideMemberBadges: 'Ocultar selos de membro',
    hideEngagement: 'Ocultar mensagens do sistema',
  },
  de: {
    subtitle: 'Gestaltung des YouTube-Livechats',
    language: 'Sprache',
    enabled: 'Verbesserungen aktiviert',
    zebra: 'Abwechselnde Zeilen (Zebra)',
    colorAuthors: 'Farbige Benutzernamen',
    underlineNames: 'Benutzernamen unterstreichen',
    highlightMentions: 'Erwähnungen hervorheben',
    hideAvatars: 'Avatare ausblenden',
    hideMemberBadges: 'Mitglieder-Abzeichen ausblenden',
    hideEngagement: 'Systemnachrichten ausblenden',
  },
  ja: {
    subtitle: 'YouTube ライブチャットのスタイル',
    language: '言語',
    enabled: 'カスタマイズを有効化',
    zebra: '行の交互配色（ゼブラ）',
    colorAuthors: 'ユーザー名に色を付ける',
    underlineNames: 'ユーザー名に下線',
    highlightMentions: 'メンションを強調',
    hideAvatars: 'アイコンを非表示',
    hideMemberBadges: 'メンバーバッジを非表示',
    hideEngagement: 'システムメッセージを非表示',
  },
  ko: {
    subtitle: 'YouTube 라이브 채팅 스타일',
    language: '언어',
    enabled: '스타일 적용',
    zebra: '줄 교차 배경 (제브라)',
    colorAuthors: '사용자 이름 색상',
    underlineNames: '사용자 이름 밑줄',
    highlightMentions: '멘션 강조',
    hideAvatars: '아바타 숨기기',
    hideMemberBadges: '멤버 배지 숨기기',
    hideEngagement: '시스템 메시지 숨기기',
  },
}

function isLang(value: string): value is Lang {
  return value in MESSAGES
}

export async function getLang(): Promise<Lang> {
  const { lang } = await chrome.storage.sync.get('lang')
  if (typeof lang === 'string' && isLang(lang)) return lang
  // Default to English until the user explicitly picks a language.
  return 'en'
}

export async function setLang(lang: Lang): Promise<void> {
  await chrome.storage.sync.set({ lang })
}
