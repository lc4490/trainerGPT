// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "welcome": "Hi {{name}}! I am your AI gym trainer. How can I help you today?",
      "send": "Send",
      "signIn": "Sign In",
      "signOut": "Sign Out",
      "trainerGPT": "trainerGPT",
      "Message": "Message",
      "language": "Language",
      "guest": "guest",
      "clear": "clear"
    }
  },
  cn: {
    translation: {
      "welcome": "嗨{{name}}！我是您的AI健身教练。今天有什么可以帮你的吗？",
      "send": "发",
      "signIn": "登入",
      "signOut": "登出",
      "trainerGPT": "教练GPT",
      "Message": "讯息",
      "language": "语言",
      "guest": "访客",
      "clear": "清除"
    }
  },
  tc: {
    translation: {
      "welcome": "嗨{{name}}！我是您的AI健身教練。今天有什麼可以幫你的吗？",
      "send": "發送",
      "signIn": "登入",
      "signOut": "登出",
      "trainerGPT": "教練GPT",
      "Message": "訊息",
      "language": "語言",
      "guest": "訪客",
      "clear": "清除"
    }
  },
  es: {
    translation: {
      "welcome": "¡Hola {{name}}! Soy tu entrenador de gimnasio AI. ¿Cómo puedo ayudarte hoy?",
      "send": "Enviar",
      "signIn": "Iniciar sesión",
      "signOut": "Cerrar sesión",
      "trainerGPT": "entrenadorGPT",
      "Message": "Mensaje",
      "language": "Idioma",
      "guest": "invitado",
      "clear": "limpiar"
    }
  },
  fr: {
    translation: {
      "welcome": "Salut {{name}}! Je suis votre entraîneur de gym IA. Comment puis-je vous aider aujourd'hui?",
      "send": "Envoyer",
      "signIn": "Se connecter",
      "signOut": "Se déconnecter",
      "trainerGPT": "entraineurGPT",
      "Message": "Message",
      "language": "Langue",
      "guest": "invité",
      "clear": "effacer"
    }
  },
  de: {
    "translation": {
      "welcome": "Hallo {{name}}! Ich bin Ihr KI-Fitnesstrainer. Wie kann ich Ihnen heute helfen?",
      "send": "Senden",
      "signIn": "Anmelden",
      "signOut": "Abmelden",
      "trainerGPT": "trainerGPT",
      "Message": "Nachricht",
      "language": "Sprache",
      "guest": "Gast",
      "clear": "klar"
    }
  },
  jp: {
    translation: {
      "welcome": "こんにちは {{name}}！私はあなたのAIジムトレーナーです。今日はどうされましたか？",
      "send": "送信",
      "signIn": "サインイン",
      "signOut": "サインアウト",
      "trainerGPT": "トレーナーGPT",
      "Message": "メッセージ",
      "language": "言語",
      "guest": "ゲスト",
      "clear": "クリア"
    }
  },
  kr: {
    translation: {
      "welcome": "안녕하세요 {{name}}! 저는 당신의 AI 체육관 트레이너입니다. 오늘 어떻게 도와드릴까요?",
      "send": "보내다",
      "signIn": "로그인",
      "signOut": "로그아웃",
      "trainerGPT": "트레이너GPT",
      "Message": "메시지",
      "language": "언어",
      "guest": "손님",
      "clear": "지우다"
    }
  }
};

i18n
  .use(LanguageDetector) // Add language detector
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en", // Default language if detection fails
    keySeparator: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage', 'cookie']
    }
  });

export default i18n;