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
      "clear": "clear",
      "en":"en",
      // NutritionPage
      "myPantry":"myPantry",
      "Recipes":"Recipes",
      "Pantry":"Pantry",
      "Take Photo":"Take Photo",
      "Switch Camera": "Switch Camera",
      "Exit": "Exit",
      "Open Camera": "Open Camera",
      "Upload Photo": "Upload Photo",
      "Add": "Add",
      "Ingredients":"Ingredients:",
      "Instructions":"Instructions:",
      "Close":"Close",
      "Identify":"Identify the main object in this picture in as few words as possible",
      'Generate':'Here is a list of ingredients: {{ingredients}}. Classify them into foods and non-foods. Create recipes only using the foods provided. Do not use foods that are not in the ingredients list. Only print the recipes. Format it like this: Recipe: Fish & Ham Sandwich (linebreak) Ingredients: Fish, Ham (linebreak) Instructions: Layer slices of ham and cooked fish between two pieces of bread. Serve chilled or grilled.',
      // equipmentPage
      "myEquipment":"myEquipment",
      "Equipment":"Equipment",
      "Summary":"Summary",
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
      "clear": "清除",
      "en":"cn",
      // NutritionPage
      "myPantry":"我的储藏",
      "Recipes":"食谱",
      "Pantry":"储藏室",
      "Take Photo":"拍照",
      "Switch Camera": "切换摄像头",
      "Exit": "退出",
      "Open Camera": "打开摄像头",
      "Upload Photo": "上传照片",
      "Add": "加",
      "Ingredients":"成分:",
      "Instructions":"说明:",
      "Close":"关闭",
      "Identify":"用尽可能少的字识别此图片中的主要对象",
      'Generate':'这里有一个成分列表：{{ingredients}}。将它们分为食物和非食物。只使用提供的食物创建食谱。不要使用成分列表中没有的食物。只打印食谱。格式如下：食谱：鱼和火腿三明治 (linebreak) 成分：鱼，火腿 (linebreak) 说明：在两片面包之间夹上火腿和煮熟的鱼片。冷藏或烤制后食用。',
      // equipmentPage
      "myEquipment":"我的设备",
      "Equipment":"设备",
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
      "clear": "清除",
      "en":"tc",
      // NutritionPage
      "myPantry":"我的儲藏",
      "Recipes":"食譜",
      "Pantry":"儲藏室",
      "Take Photo":"拍照",
      "Switch Camera": "切換攝像頭",
      "Exit": "退出",
      "Open Camera": "打開攝像頭",
      "Upload Photo": "上傳照片",
      "Add": "加",
      "Ingredients":"成分:",
      "Instructions":"說明:",
      "Close":"關閉",
      "Identify":"儘可能少地識別此圖片中的主要對象",
      'Generate':'這裡有一個成分列表：{{ingredients}}。將它們分為食物和非食物。只使用提供的食物創建食譜。不要使用成分列表中沒有的食物。只打印食譜。格式如下：食譜：魚和火腿三明治 (linebreak) 成分：魚，火腿 (linebreak) 說明：在兩片麵包之間夾上火腿和煮熟的魚片。冷藏或烤製後食用。'
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
      "clear": "limpiar",
      "en":"es",
      // NutritionPage
      "myPantry":"miDespensa",
      "Recipes":"Recetas",
      "Pantry":"Despensa",
      "Take Photo":"Tomar Foto",
      "Switch Camera": "Cambiar Cámara",
      "Exit": "Salir",
      "Open Camera": "Abrir Cámara",
      "Upload Photo": "Subir Foto",
      "Add": "Añadir",
      "Ingredients":"Ingredientes:",
      "Instructions":"Instrucciones:",
      "Close":"Cerrar",
      "Identify":"Identifica el objeto principal en esta imagen con la menor cantidad de palabras posible",
      'Generate':'Aquí tienes una lista de ingredientes: {{ingredients}}. Clasifícalos en alimentos y no alimentos. Crea recetas solo utilizando los alimentos proporcionados. No utilices alimentos que no estén en la lista de ingredientes. Solo imprime las recetas. Formatea de esta manera: Receta: Sándwich de Pescado y Jamón (linebreak) Ingredientes: Pescado, Jamón (linebreak) Instrucciones: Coloca capas de jamón y pescado cocido entre dos rebanadas de pan. Servir frío o a la parrilla.'
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
      "clear": "effacer",
      "en":"fr",
      // NutritionPage
      "myPantry":"monGardeManger",
      "Recipes":"Recettes",
      "Pantry":"Garde-Manger",
      "Take Photo":"Prendre Photo",
      "Switch Camera": "Changer de Caméra",
      "Exit": "Quitter",
      "Open Camera": "Ouvrir Caméra",
      "Upload Photo": "Télécharger Photo",
      "Add": "Ajouter",
      "Ingredients":"Ingrédients:",
      "Instructions":"Instructions:",
      "Close":"Fermer",
      "Identify":"Identifiez l'objet principal dans cette image avec le moins de mots possible",
      "Generate":"Voici une liste d'ingrédients:{{ingredients}}. Classifiez-les en aliments et non-aliments. Créez des recettes en utilisant uniquement les aliments fournis. N'utilisez pas d'aliments qui ne figurent pas dans la liste des ingrédients. Imprimez uniquement les recettes. Formatez-le de cette manière : Recette : Sandwich au Poisson et Jambon (linebreak) Ingrédients : Poisson, Jambon (linebreak) Instructions : Superposez des tranches de jambon et de poisson cuit entre deux morceaux de pain. Servir froid ou grillé."
    }
  },
  de: {
    translation: {
      "welcome": "Hallo {{name}}! Ich bin Ihr KI-Fitnesstrainer. Wie kann ich Ihnen heute helfen?",
      "send": "Senden",
      "signIn": "Anmelden",
      "signOut": "Abmelden",
      "trainerGPT": "trainerGPT",
      "Message": "Nachricht",
      "language": "Sprache",
      "guest": "Gast",
      "clear": "klar",
      "en":"de",
      // NutritionPage
      "myPantry":"meineSpeisekammer",
      "Recipes":"Rezepte",
      "Pantry":"Speisekammer",
      "Take Photo":"Foto machen",
      "Switch Camera": "Kamera wechseln",
      "Exit": "Beenden",
      "Open Camera": "Kamera öffnen",
      "Upload Photo": "Foto hochladen",
      "Add": "Hinzufügen",
      "Ingredients":"Zutaten:",
      "Instructions":"Anleitung:",
      "Close":"Schließen",
      "Identify":"Identifizieren Sie das Hauptobjekt auf diesem Bild mit so wenigen Worten wie möglich",
      'Generate':'Hier ist eine Liste der Zutaten: {{ingredients}}. Klassifizieren Sie sie in Lebensmittel und Nicht-Lebensmittel. Erstellen Sie Rezepte nur mit den bereitgestellten Lebensmitteln. Verwenden Sie keine Lebensmittel, die nicht auf der Zutatenliste stehen. Drucken Sie nur die Rezepte. Formatieren Sie es wie folgt: Rezept: Fisch- und Schinkensandwich (linebreak) Zutaten: Fisch, Schinken (linebreak) Anweisungen: Legen Sie Schinkenscheiben und gekochten Fisch zwischen zwei Brotscheiben. Kalt oder gegrillt servieren.'
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
      "clear": "クリア",
      "en":"jp",
      // NutritionPage
      "myPantry":"私の食料貯蔵室",
      "Recipes":"レシピ",
      "Pantry":"食料貯蔵室",
      "Take Photo":"写真を撮る",
      "Switch Camera": "カメラを切り替える",
      "Exit": "終了",
      "Open Camera": "カメラを開く",
      "Upload Photo": "写真をアップロード",
      "Add": "追加",
      "Ingredients":"材料:",
      "Instructions":"手順:",
      "Close":"閉じる",
      "Identify":"できるだけ少ない言葉でこの画像の主要なオブジェクトを特定する",
      'Generate':'ここに材料のリストがあります: {{ingredients}}。それらを食品と非食品に分類してください。提供された食品のみを使用してレシピを作成します。材料リストにない食品は使用しないでください。レシピだけを印刷してください。このようにフォーマットしてください: レシピ: 魚とハムのサンドイッチ (linebreak) 材料: 魚、ハム (linebreak) 手順: ハムと調理済みの魚を2枚のパンの間に挟みます。冷やしてまたはグリルして提供します。'
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
      "clear": "지우다",
      "en":"kr",
      // NutritionPage
      "myPantry":"나의식료품저장실",
      "Recipes":"레시피",
      "Pantry":"식료품저장실",
      "Take Photo":"사진 찍기",
      "Switch Camera": "카메라 전환",
      "Exit": "종료",
      "Open Camera": "카메라 열기",
      "Upload Photo": "사진 업로드",
      "Add": "추가하다",
      "Ingredients":"재료:",
      "Instructions":"지침:",
      "Close":"닫기",
      "Identify":"이 사진에서 가능한 한 적은 단어로 주요 객체를 식별하십시오",
      'Generate':'여기에 재료 목록이 있습니다: {{ingredients}}. 이를 음식과 비음식으로 분류하십시오. 제공된 음식만 사용하여 요리법을 만드십시오. 재료 목록에 없는 음식은 사용하지 마십시오. 요리법만 인쇄하십시오. 다음과 같이 형식화하십시오: 레시피: 생선 & 햄 샌드위치 (linebreak) 재료: 생선, 햄 (linebreak) 지침: 햄과 조리된 생선을 빵 두 조각 사이에 겹쳐서 냉장 또는 그릴에 구워서 제공합니다.'
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
