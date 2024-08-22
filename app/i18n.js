// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "welcome": "Hi {{name}}! I am your AI gym trainer. How can I help you today? Try asking me to make a workout plan or how to do specific exercises!",
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
      "Welcome to myPantry":"Welcome to myPantry",
      "Add in new pantry items using the + in the top left corner.":"Add in new pantry items using the + in the top left corner.",
      "Recipes will generate below based on ingredients available.":"Recipes will generate below based on ingredients available.",
      ": ": ": ",
      // equipmentPage
      "myEquipment":"myEquipment",
      "Equipment":"Equipment",
      "Welcome to myEquipment":"Welcome to myEquipment",
      "Take or upload pictures of gym equipment you have access to using the + in the top left corner.":"Take or upload pictures of gym equipment you have access to using the + in the top left corner.",
      // myInfo Page
      "Summary":"Summary",
      "Tell Us About Yourself": "Tell Us About Yourself",
      "Select your gender": "Select your gender",
      "Male": "Male",
      "Female": "Female",
      "How Old Are You?": "How Old Are You?",
      "Age is important": "Age is important",
      "What is Your Weight?": "What is Your Weight?",
      "Enter your weight": "Enter your weight",
      "What is Your Height?": "What is Your Height?",
      "Enter your height": "Enter your height",
      "What is Your Goal?": "What is Your Goal?",
      "Select your goal": "Select your goal",
      "Weight Loss": "Weight Loss",
      "Muscle Gain": "Muscle Gain",
      "Improved Endurance": "Improved Endurance",
      "General Fitness": "General Fitness",
      "Physical Activity Level?": "Physical Activity Level?",
      "Select your activity level": "Select your activity level",
      "Sedentary": "Sedentary",
      "Moderate": "Moderate",
      "Active": "Active",
      "Do you have any existing health issues or injuries?": "Do you have any existing health issues or injuries?",
      "Enter any existing health issues or injuries": "Enter any existing health issues or injuries",
      "How many days a week can you commit to working out?": "How many days a week can you commit to working out?",
      "When can you workout?": "When can you workout?",
      "Sign in failed: ": "Sign in failed: ",
      "Sign out failed: ": "Sign out failed: ",
      "Guest": "Guest",
      "Loading...": "Loading...",
      "My Info": "My Info",
      "signIn": "Sign In",
      "signOut": "Sign Out",
      "Edit": "Edit",
      "Save": "Save",
      "Take Photo": "Take Photo",
      "Switch Camera": "Switch Camera",
      "Exit": "Exit",
      "Add photo": "Add photo",
      "image": "image",
      "banner": "banner",
      "Back": "Back",
      "Finish": "Finish",
      "Next": "Next",
      "Sex":"Sex",
      "Age":"Age",
      "Weight":"Weight",
      "Height":"Height",
      "Goals":"Goals",
      "Activity":"Activity",
      "Health issues": "Health issues",
      "Availability": "Availability",
      "Not Available": "Not Available",
      "Monday": "Monday",
      "Tuesday": "Tuesday",
      "Wednesday": "Wednesday",
      "Thursday": "Thursday",
      "Friday": "Friday",
      "Saturday": "Saturday",
      "Sunday": "Sunday",
      "Mon": "Mon",
      "Tue": "Tue",
      "Wed": "Wed",
      "Thu": "Thu",
      "Fri": "Fri",
      "Sat": "Sat",
      "Sun": "Sun",
      "Everyday": "Everyday",
      // premium
      "This feature is available to premium users only.":"This feature is available to premium users only.",
      "Upgrade Now":"Upgrade Now",
      // trainerGPT
      "plan":"plan",
      "Change photo": "Change photo",

    }
  },
  cn: {
    translation: {
      "welcome": "嗨{{name}}！我是您的AI健身教练。今天有什么可以帮你的吗？试着让我为你制定一个锻炼计划，或询问如何做特定的练习！",
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
      "Welcome to myPantry": "欢迎来到我的储藏",
      "Add in new pantry items using the + in the top left corner.": "使用左上角的 + 添加新的储藏室物品。",
      "Recipes will generate below based on ingredients available.": "根据可用的食材，下方将生成食谱。",
      ": ":"：",
      // equipmentPage
      "myEquipment":"我的设备",
      "Equipment":"设备",
      "Welcome to myEquipment": "欢迎来到我的设备",
      "Take or upload pictures of gym equipment you have access to using the + in the top left corner.": "使用左上角的 + 拍摄或上传您可以使用的健身设备的照片。",
      // myInfo Page
      "Summary": "总结",
      "Tell Us About Yourself": "告诉我们关于你的信息",
      "Select your gender": "选择您的性别",
      "Male": "男",
      "Female": "女",
      "How Old Are You?": "你多大了？",
      "Age is important": "年龄很重要",
      "What is Your Weight?": "你的体重是多少？",
      "Enter your weight": "输入您的体重",
      "What is Your Height?": "你的身高是多少？",
      "Enter your height": "输入您的身高",
      "What is Your Goal?": "你的目标是什么？",
      "Select your goal": "选择您的目标",
      "Weight Loss": "减重",
      "Muscle Gain": "增肌",
      "Improved Endurance": "提高耐力",
      "General Fitness": "一般健身",
      "Physical Activity Level?": "身体活动水平？",
      "Select your activity level": "选择您的活动水平",
      "Sedentary": "久坐",
      "Moderate": "适中",
      "Active": "活跃",
      "Do you have any existing health issues or injuries?": "您有任何现有的健康问题或受伤吗？",
      "Enter any existing health issues or injuries": "输入任何现有的健康问题或受伤",
      "How many days a week can you commit to working out?": "您一周可以锻炼几天？",
      "When can you workout?": "您什么时候可以锻炼？",
      "Sign in failed: ": "登录失败：",
      "Sign out failed: ": "登出失败：",
      "Guest": "访客",
      "Loading...": "加载中...",
      "My Info": "我的信息",
      "signIn": "登入",
      "signOut": "登出",
      "Edit": "编辑",
      "Save": "保存",
      "Take Photo": "拍照",
      "Switch Camera": "切换摄像头",
      "Exit": "退出",
      "Add photo": "添加照片",
      "image": "图像",
      "banner": "横幅",
      "Back": "返回",
      "Finish": "完成",
      "Next": "下一步",
      "Sex":"性别",
      "Age":"年龄",
      "Weight":"体重",
      "Height":"身高",
      "Goals":"目标",
      "Activity":"活动水平",
      "Health issues": "健康问题",
      "Availability": "可用性",
      "Not Available": "不可用",
      "Monday": "星期一",
      "Tuesday": "星期二",
      "Wednesday": "星期三",
      "Thursday": "星期四",
      "Friday": "星期五",
      "Saturday": "星期六",
      "Sunday": "星期天",
      "Mon": "星期一",
      "Tue": "星期二",
      "Wed": "星期三",
      "Thu": "星期四",
      "Fri": "星期五",
      "Sat": "星期六",
      "Sun": "星期天",
      "Everyday": "每天",

      // premium
      "This feature is available to premium users only.": "此功能仅对高级用户开放。",
      "Upgrade Now": "立即升级",

    }
  },
  tc: {
    translation: {
      "welcome": "嗨{{name}}！我是您的AI健身教練。今天有什麼可以幫你的吗？試著讓我為你制定一個锻炼计划，或詢問如何做特定的練習！",
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
      'Generate':'這裡有一個成分列表：{{ingredients}}。將它們分為食物和非食物。只使用提供的食物創建食譜。不要使用成分列表中沒有的食物。只打印食譜。格式如下：食譜：魚和火腿三明治 (linebreak) 成分：魚，火腿 (linebreak) 說明：在兩片麵包之間夾上火腿和煮熟的魚片。冷藏或烤製後食用。',
      "Welcome to myPantry": "歡迎來到我的儲藏",
      "Add in new pantry items using the + in the top left corner.": "使用左上角的 + 添加新的儲藏室物品。",
      "Recipes will generate below based on ingredients available.": "根據可用的食材，下方將生成食譜。",
      ": ":"：",
      // equipmentPage
      "myEquipment": "我的設備",
      "Equipment": "設備",
      "Summary": "總結",
      "Welcome to myEquipment": "歡迎來到我的設備",
      "Take or upload pictures of gym equipment you have access to using the + in the top left corner.": "使用左上角的 + 拍攝或上傳您可以使用的健身設備的照片。",
      // myInfo Page
      "Tell Us About Yourself": "告訴我們有關你的信息",
      "Select your gender": "選擇您的性別",
      "Male": "男",
      "Female": "女",
      "How Old Are You?": "你多大了？",
      "Age is important": "年齡很重要",
      "What is Your Weight?": "你的體重是多少？",
      "Enter your weight": "輸入您的體重",
      "What is Your Height?": "你的身高是多少？",
      "Enter your height": "輸入您的身高",
      "What is Your Goal?": "你的目標是什麼？",
      "Select your goal": "選擇您的目標",
      "Weight Loss": "減重",
      "Muscle Gain": "增肌",
      "Improved Endurance": "提高耐力",
      "General Fitness": "一般健身",
      "Physical Activity Level?": "身體活動水平？",
      "Select your activity level": "選擇您的活動水平",
      "Sedentary": "久坐",
      "Moderate": "適中",
      "Active": "活躍",
      "Do you have any existing health issues or injuries?": "您有任何現有的健康問題或受傷嗎？",
      "Enter any existing health issues or injuries": "輸入任何現有的健康問題或受傷",
      "How many days a week can you commit to working out?": "您一週可以鍛鍊幾天？",
      "When can you workout?": "您什麼時候可以鍛鍊？",
      "Sign in failed: ": "登錄失敗：",
      "Sign out failed: ": "登出失敗：",
      "Guest": "訪客",
      "Loading...": "加載中...",
      "My Info": "我的信息",
      "signIn": "登入",
      "signOut": "登出",
      "Edit": "編輯",
      "Save": "保存",
      "Take Photo": "拍照",
      "Switch Camera": "切換攝像頭",
      "Exit": "退出",
      "Add photo": "添加照片",
      "image": "圖像",
      "banner": "橫幅",
      "Back": "返回",
      "Finish": "完成",
      "Next": "下一步",
      "Sex":"性別",
      "Age":"年齡",
      "Weight":"體重",
      "Height":"身高",
      "Goals":"目標",
      "Activity":"活動水平",
      "Health issues": "健康問題",
      "Availability": "可用性",
      "Not Available": "不可用",
      "Monday": "星期一",
      "Tuesday": "星期二",
      "Wednesday": "星期三",
      "Thursday": "星期四",
      "Friday": "星期五",
      "Saturday": "星期六",
      "Sunday": "星期日",
      "Mon": "星期一",
      "Tue": "星期二",
      "Wed": "星期三",
      "Thu": "星期四",
      "Fri": "星期五",
      "Sat": "星期六",
      "Sun": "星期日",
      "Everyday": "每天",
      // premium
      "This feature is available to premium users only.": "此功能僅對高級用戶開放。",
      "Upgrade Now": "立即升級",
    }
  },
  es: {
    translation: {
      "welcome": "¡Hola {{name}}! Soy tu entrenador de gimnasio AI. ¿Cómo puedo ayudarte hoy? ¡Intenta pedirme que haga un plan de entrenamiento o cómo hacer ejercicios específicos!",
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
      'Generate':'Aquí tienes una lista de ingredientes: {{ingredients}}. Clasifícalos en alimentos y no alimentos. Crea recetas solo utilizando los alimentos proporcionados. No utilices alimentos que no estén en la lista de ingredientes. Solo imprime las recetas. Formatea de esta manera: Receta: Sándwich de Pescado y Jamón (linebreak) Ingredientes: Pescado, Jamón (linebreak) Instrucciones: Coloca capas de jamón y pescado cocido entre dos rebanadas de pan. Servir frío o a la parrilla.',
      "Welcome to myPantry": "Bienvenido a miDespensa",
      "Add in new pantry items using the + in the top left corner.": "Añade nuevos artículos a la despensa usando el + en la esquina superior izquierda.",
      "Recipes will generate below based on ingredients available.": "Las recetas se generarán a continuación según los ingredientes disponibles.",
      ": ":": ",
      // equipmentPage
      "myEquipment": "miEquipo",
      "Equipment": "Equipo",
      "Welcome to myEquipment": "Bienvenido a miEquipo",
      "Take or upload pictures of gym equipment you have access to using the + in the top left corner.": "Toma o sube fotos del equipo de gimnasio al que tienes acceso usando el + en la esquina superior izquierda.",
      // myInfo Page
      "Summary": "Resumen",
      "Tell Us About Yourself": "Cuéntanos sobre ti",
      "Select your gender": "Selecciona tu género",
      "Male": "Masculino",
      "Female": "Femenino",
      "How Old Are You?": "¿Cuántos años tienes?",
      "Age is important": "La edad es importante",
      "What is Your Weight?": "¿Cuál es tu peso?",
      "Enter your weight": "Introduce tu peso",
      "What is Your Height?": "¿Cuál es tu altura?",
      "Enter your height": "Introduce tu altura",
      "What is Your Goal?": "¿Cuál es tu objetivo?",
      "Select your goal": "Selecciona tu objetivo",
      "Weight Loss": "Pérdida de peso",
      "Muscle Gain": "Ganancia muscular",
      "Improved Endurance": "Mejora de la resistencia",
      "General Fitness": "Estado físico general",
      "Physical Activity Level?": "¿Nivel de actividad física?",
      "Select your activity level": "Selecciona tu nivel de actividad",
      "Sedentary": "Sedentario",
      "Moderate": "Moderado",
      "Active": "Activo",
      "Do you have any existing health issues or injuries?": "¿Tienes algún problema de salud o lesiones existentes?",
      "Enter any existing health issues or injuries": "Introduce cualquier problema de salud o lesiones existentes",
      "How many days a week can you commit to working out?": "¿Cuántos días a la semana puedes comprometerte a hacer ejercicio?",
      "When can you workout?": "¿Cuándo puedes hacer ejercicio?",
      "Sign in failed: ": "Error al iniciar sesión: ",
      "Sign out failed: ": "Error al cerrar sesión: ",
      "Guest": "Invitado",
      "Loading...": "Cargando...",
      "My Info": "Mi información",
      "signIn": "Iniciar sesión",
      "signOut": "Cerrar sesión",
      "Edit": "Editar",
      "Save": "Guardar",
      "Take Photo": "Tomar foto",
      "Switch Camera": "Cambiar cámara",
      "Exit": "Salir",
      "Add photo": "Agregar foto",
      "image": "imagen",
      "banner": "banner",
      "Back": "Atrás",
      "Finish": "Terminar",
      "Next": "Siguiente",
      "Sex":"Sexo",
      "Age":"Edad",
      "Weight":"Peso",
      "Height":"Altura",
      "Goals":"Objetivos",
      "Activity":"Nivel de actividad",
      "Health issues": "Problemas de salud",
      "Availability": "Disponibilidad",
      "Not Available": "No disponible",
      "Monday": "Lunes",
      "Tuesday": "Martes",
      "Wednesday": "Miércoles",
      "Thursday": "Jueves",
      "Friday": "Viernes",
      "Saturday": "Sábado",
      "Sunday": "Domingo",
      "Mon": "Lun",
      "Tue": "Mar",
      "Wed": "Mié",
      "Thu": "Jue",
      "Fri": "Vie",
      "Sat": "Sáb",
      "Sun": "Dom",
      "Everyday": "Todos los días",
      // premium
      "This feature is available to premium users only.": "Esta función está disponible solo para usuarios premium.",
      "Upgrade Now": "Actualizar ahora",
    }
  },
  fr: {
    translation: {
      "welcome": "Salut {{name}}! Je suis votre entraîneur de gym IA. Comment puis-je vous aider aujourd'hui? Essayez de me demander de créer un plan d'entraînement ou comment faire des exercices spécifiques !",
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
      "Generate":"Voici une liste d'ingrédients:{{ingredients}}. Classifiez-les en aliments et non-aliments. Créez des recettes en utilisant uniquement les aliments fournis. N'utilisez pas d'aliments qui ne figurent pas dans la liste des ingrédients. Imprimez uniquement les recettes. Formatez-le de cette manière : Recette : Sandwich au Poisson et Jambon (linebreak) Ingrédients : Poisson, Jambon (linebreak) Instructions : Superposez des tranches de jambon et de poisson cuit entre deux morceaux de pain. Servir froid ou grillé.",
      "Welcome to myPantry": "Bienvenido a miDespensa",
      "Add in new pantry items using the + in the top left corner.": "Añade nuevos artículos a la despensa usando el + en la esquina superior izquierda.",
      "Recipes will generate below based on ingredients available.": "Las recetas se generarán a continuación según los ingredientes disponibles.",
      ": ": ": ",
      // equipmentPage
      "myEquipment": "monÉquipement",
      "Equipment": "Équipement",
      "Welcome to myEquipment": "Bienvenue dans monÉquipement",
      "Take or upload pictures of gym equipment you have access to using the + in the top left corner.": "Prenez ou téléchargez des photos de l'équipement de gym auquel vous avez accès en utilisant le + dans le coin supérieur gauche.",
      // myInfo Page
      "Summary": "Résumé",
      "Tell Us About Yourself": "Parlez-nous de vous",
      "Select your gender": "Sélectionnez votre sexe",
      "Male": "Homme",
      "Female": "Femme",
      "How Old Are You?": "Quel âge avez-vous ?",
      "Age is important": "L'âge est important",
      "What is Your Weight?": "Quel est votre poids ?",
      "Enter your weight": "Entrez votre poids",
      "What is Your Height?": "Quelle est votre taille ?",
      "Enter your height": "Entrez votre taille",
      "What is Your Goal?": "Quel est votre objectif ?",
      "Select your goal": "Sélectionnez votre objectif",
      "Weight Loss": "Perte de poids",
      "Muscle Gain": "Gain musculaire",
      "Improved Endurance": "Endurance améliorée",
      "General Fitness": "Forme générale",
      "Physical Activity Level?": "Niveau d'activité physique ?",
      "Select your activity level": "Sélectionnez votre niveau d'activité",
      "Sedentary": "Sédentaire",
      "Moderate": "Modéré",
      "Active": "Actif",
      "Do you have any existing health issues or injuries?": "Avez-vous des problèmes de santé ou des blessures existants ?",
      "Enter any existing health issues or injuries": "Entrez tous les problèmes de santé ou blessures existants",
      "How many days a week can you commit to working out?": "Combien de jours par semaine pouvez-vous vous engager à faire de l'exercice ?",
      "When can you workout?": "Quand pouvez-vous faire de l'exercice ?",
      "Sign in failed: ": "Échec de la connexion : ",
      "Sign out failed: ": "Échec de la déconnexion : ",
      "Guest": "Invité",
      "Loading...": "Chargement...",
      "My Info": "Mes informations",
      "signIn": "Se connecter",
      "signOut": "Se déconnecter",
      "Edit": "Modifier",
      "Save": "Enregistrer",
      "Take Photo": "Prendre une photo",
      "Switch Camera": "Changer de caméra",
      "Exit": "Quitter",
      "Add photo": "Ajouter une photo",
      "image": "image",
      "banner": "bannière",
      "Back": "Retour",
      "Finish": "Terminer",
      "Next": "Suivant",
      "Sex":"Sexe",
      "Age":"Âge",
      "Weight":"Poids",
      "Height":"Taille",
      "Goals":"Objectifs",
      "Activity":"Niveau d'activité",
      "Health issues": "Problèmes de santé",
      "Availability": "Disponibilité",
      "Not Available": "Non disponible",
      "Monday": "Lundi",
      "Tuesday": "Mardi",
      "Wednesday": "Mercredi",
      "Thursday": "Jeudi",
      "Friday": "Vendredi",
      "Saturday": "Samedi",
      "Sunday": "Dimanche",
      "Mon": "Lun",
      "Tue": "Mar",
      "Wed": "Mer",
      "Thu": "Jeu",
      "Fri": "Ven",
      "Sat": "Sam",
      "Sun": "Dim",
      "Everyday": "Tous les jours",
      // premium
      "This feature is available to premium users only.": "Cette fonctionnalité est disponible uniquement pour les utilisateurs premium.",
      "Upgrade Now": "Mettre à niveau maintenant",
    }
  },
  de: {
    translation: {
      "welcome": "Hallo {{name}}! Ich bin Ihr KI-Fitnesstrainer. Wie kann ich Ihnen heute helfen? Versuchen Sie, mich zu bitten, einen Trainingsplan zu erstellen oder wie man bestimmte Übungen macht!",
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
      'Generate':'Hier ist eine Liste der Zutaten: {{ingredients}}. Klassifizieren Sie sie in Lebensmittel und Nicht-Lebensmittel. Erstellen Sie Rezepte nur mit den bereitgestellten Lebensmitteln. Verwenden Sie keine Lebensmittel, die nicht auf der Zutatenliste stehen. Drucken Sie nur die Rezepte. Formatieren Sie es wie folgt: Rezept: Fisch- und Schinkensandwich (linebreak) Zutaten: Fisch, Schinken (linebreak) Anweisungen: Legen Sie Schinkenscheiben und gekochten Fisch zwischen zwei Brotscheiben. Kalt oder gegrillt servieren.',
      "Welcome to myPantry": "Willkommen in meinerSpeisekammer",
      "Add in new pantry items using the + in the top left corner.": "Fügen Sie neue Vorratsartikel mit dem + in der oberen linken Ecke hinzu.",
      "Recipes will generate below based on ingredients available.": "Rezepte werden unten basierend auf den verfügbaren Zutaten generiert.",
      ": ": ": ",
      // equipmentPage
      "myEquipment": "meineAusrüstung",
      "Equipment": "Ausrüstung",
      "Welcome to myEquipment": "Willkommen bei meinerAusrüstung",
      "Take or upload pictures of gym equipment you have access to using the + in the top left corner.": "Machen oder laden Sie Bilder von Fitnessgeräten hoch, auf die Sie Zugriff haben, indem Sie das + in der oberen linken Ecke verwenden.",
      // myInfo Page
      "Summary": "Zusammenfassung",
      "Tell Us About Yourself": "Erzählen Sie uns von sich",
      "Select your gender": "Wählen Sie Ihr Geschlecht",
      "Male": "Männlich",
      "Female": "Weiblich",
      "How Old Are You?": "Wie alt sind Sie?",
      "Age is important": "Das Alter ist wichtig",
      "What is Your Weight?": "Was ist Ihr Gewicht?",
      "Enter your weight": "Geben Sie Ihr Gewicht ein",
      "What is Your Height?": "Wie groß sind Sie?",
      "Enter your height": "Geben Sie Ihre Größe ein",
      "What is Your Goal?": "Was ist Ihr Ziel?",
      "Select your goal": "Wählen Sie Ihr Ziel",
      "Weight Loss": "Gewichtsverlust",
      "Muscle Gain": "Muskelaufbau",
      "Improved Endurance": "Verbesserte Ausdauer",
      "General Fitness": "Allgemeine Fitness",
      "Physical Activity Level?": "Körperliches Aktivitätsniveau?",
      "Select your activity level": "Wählen Sie Ihr Aktivitätsniveau",
      "Sedentary": "Sitzend",
      "Moderate": "Mäßig",
      "Active": "Aktiv",
      "Do you have any existing health issues or injuries?": "Haben Sie gesundheitliche Probleme oder Verletzungen?",
      "Enter any existing health issues or injuries": "Geben Sie gesundheitliche Probleme oder Verletzungen ein",
      "How many days a week can you commit to working out?": "Wie viele Tage in der Woche können Sie sich für das Training verpflichten?",
      "When can you workout?": "Wann können Sie trainieren?",
      "Sign in failed: ": "Anmeldung fehlgeschlagen: ",
      "Sign out failed: ": "Abmeldung fehlgeschlagen: ",
      "Guest": "Gast",
      "Loading...": "Laden...",
      "My Info": "Meine Informationen",
      "signIn": "Anmelden",
      "signOut": "Abmelden",
      "Edit": "Bearbeiten",
      "Save": "Speichern",
      "Take Photo": "Foto machen",
      "Switch Camera": "Kamera wechseln",
      "Exit": "Beenden",
      "Add photo": "Foto hinzufügen",
      "image": "Bild",
      "banner": "Banner",
      "Back": "Zurück",
      "Finish": "Fertigstellen",
      "Next": "Weiter",
      "Sex":"Geschlecht",
      "Age":"Alter",
      "Weight":"Gewicht",
      "Height":"Größe",
      "Goals":"Ziele",
      "Activity":"Aktivitätslevel",
      "Health issues": "Gesundheitsprobleme",
      "Availability": "Verfügbarkeit",
      "Not Available": "Nicht verfügbar",
      "Monday": "Montag",
      "Tuesday": "Dienstag",
      "Wednesday": "Mittwoch",
      "Thursday": "Donnerstag",
      "Friday": "Freitag",
      "Saturday": "Samstag",
      "Sunday": "Sonntag",
      "Mon": "Mon",
      "Tue": "Die",
      "Wed": "Mit",
      "Thu": "Don",
      "Fri": "Fre",
      "Sat": "Sam",
      "Sun": "Son",
      "Everyday": "Jeden Tag",
      // premium
      "This feature is available to premium users only.": "Diese Funktion ist nur für Premium-Nutzer verfügbar.",
      "Upgrade Now": "Jetzt upgraden",
    }
  },
  jp: {
    translation: {
      "welcome": "こんにちは {{name}}！私はあなたのAIジムトレーナーです。今日はどうされましたか？ トレーニングプランを作成したり、特定のエクササイズの方法を聞いてみてください！",
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
      'Generate':'ここに材料のリストがあります: {{ingredients}}。それらを食品と非食品に分類してください。提供された食品のみを使用してレシピを作成します。材料リストにない食品は使用しないでください。レシピだけを印刷してください。このようにフォーマットしてください: レシピ: 魚とハムのサンドイッチ (linebreak) 材料: 魚、ハム (linebreak) 手順: ハムと調理済みの魚を2枚のパンの間に挟みます。冷やしてまたはグリルして提供します。',
      "Welcome to myPantry": "私の食料貯蔵室へようこそ",
      "Add in new pantry items using the + in the top left corner.": "左上の + を使用して、新しい食料貯蔵品を追加してください。",
      "Recipes will generate below based on ingredients available.": "利用可能な材料に基づいて、以下にレシピが生成されます。",
      ": ": ": ",
      // equipmentPage
      "myEquipment": "私の装置",
      "Equipment": "装置",
      "Welcome to myEquipment": "私の装置へようこそ",
      "Take or upload pictures of gym equipment you have access to using the + in the top left corner.": "左上の + を使用して、利用可能なジム機器の写真を撮影またはアップロードしてください。",
      // myInfo Page
      "Summary": "概要",
      "Tell Us About Yourself": "あなた自身について教えてください",
      "Select your gender": "性別を選択してください",
      "Male": "男性",
      "Female": "女性",
      "How Old Are You?": "あなたは何歳ですか？",
      "Age is important": "年齢は重要です",
      "What is Your Weight?": "あなたの体重は何ですか？",
      "Enter your weight": "体重を入力してください",
      "What is Your Height?": "あなたの身長は何ですか？",
      "Enter your height": "身長を入力してください",
      "What is Your Goal?": "あなたの目標は何ですか？",
      "Select your goal": "目標を選択してください",
      "Weight Loss": "減量",
      "Muscle Gain": "筋肉増強",
      "Improved Endurance": "持久力の向上",
      "General Fitness": "全身のフィットネス",
      "Physical Activity Level?": "身体活動レベルは？",
      "Select your activity level": "活動レベルを選択してください",
      "Sedentary": "座りがち",
      "Moderate": "適度",
      "Active": "アクティブ",
      "Do you have any existing health issues or injuries?": "既存の健康問題や怪我はありますか？",
      "Enter any existing health issues or injuries": "既存の健康問題や怪我を入力してください",
      "How many days a week can you commit to working out?": "週に何日トレーニングできますか？",
      "When can you workout?": "いつトレーニングできますか？",
      "Sign in failed: ": "サインインに失敗しました：",
      "Sign out failed: ": "サインアウトに失敗しました：",
      "Guest": "ゲスト",
      "Loading...": "読み込み中...",
      "My Info": "私の情報",
      "signIn": "サインイン",
      "signOut": "サインアウト",
      "Edit": "編集",
      "Save": "保存",
      "Take Photo": "写真を撮る",
      "Switch Camera": "カメラを切り替える",
      "Exit": "終了",
      "Add photo": "写真を追加",
      "image": "画像",
      "banner": "バナー",
      "Back": "戻る",
      "Finish": "終了",
      "Next": "次へ",
      "Sex":"性別",
      "Age":"年齢",
      "Weight":"体重",
      "Height":"身長",
      "Goals":"目標",
      "Activity":"活動レベル",
      "Health issues": "健康問題",
      "Availability": "利用可能性",
      "Not Available": "利用不可",
      "Monday": "月曜日",
      "Tuesday": "火曜日",
      "Wednesday": "水曜日",
      "Thursday": "木曜日",
      "Friday": "金曜日",
      "Saturday": "土曜日",
      "Sunday": "日曜日",
      "Mon": "月曜日",
      "Tue": "火曜日",
      "Wed": "水曜日",
      "Thu": "木曜日",
      "Fri": "金曜日",
      "Sat": "土曜日",
      "Sun": "日曜日",
      "Everyday": "毎日",
      // premium
      "This feature is available to premium users only.": "この機能はプレミアムユーザーのみ利用可能です。",
      "Upgrade Now": "今すぐアップグレード",
    }
  },
  kr: {
    translation: {
      "welcome": "안녕하세요 {{name}}! 저는 당신의 AI 체육관 트레이너입니다. 오늘 어떻게 도와드릴까요? 운동 계획을 세우거나 특정 운동을 하는 방법을 물어보세요!",
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
      'Generate':'여기에 재료 목록이 있습니다: {{ingredients}}. 이를 음식과 비음식으로 분류하십시오. 제공된 음식만 사용하여 요리법을 만드십시오. 재료 목록에 없는 음식은 사용하지 마십시오. 요리법만 인쇄하십시오. 다음과 같이 형식화하십시오: 레시피: 생선 & 햄 샌드위치 (linebreak) 재료: 생선, 햄 (linebreak) 지침: 햄과 조리된 생선을 빵 두 조각 사이에 겹쳐서 냉장 또는 그릴에 구워서 제공합니다.',
      "Welcome to myPantry": "내 식료품저장실에 오신 것을 환영합니다",
      "Add in new pantry items using the + in the top left corner.": "왼쪽 상단 모서리에 있는 +를 사용하여 새로운 식료품 항목을 추가하세요.",
      "Recipes will generate below based on ingredients available.": "사용 가능한 재료를 기반으로 아래에 레시피가 생성됩니다.",
      ": ":": ",
      // equipmentPage
      "myEquipment": "내 장비",
      "Equipment": "장비",
      "Welcome to myEquipment": "내 장비에 오신 것을 환영합니다",
      "Take or upload pictures of gym equipment you have access to using the + in the top left corner.": "왼쪽 상단 모서리에 있는 +를 사용하여 사용 가능한 체육관 장비의 사진을 찍거나 업로드하세요.",
      // myInfo Page
      "Summary": "요약",
      "Tell Us About Yourself": "자신에 대해 알려주세요",
      "Select your gender": "성별을 선택하세요",
      "Male": "남성",
      "Female": "여성",
      "How Old Are You?": "나이가 어떻게 되세요?",
      "Age is important": "나이가 중요합니다",
      "What is Your Weight?": "몸무게가 어떻게 되세요?",
      "Enter your weight": "몸무게를 입력하세요",
      "What is Your Height?": "키가 어떻게 되세요?",
      "Enter your height": "키를 입력하세요",
      "What is Your Goal?": "목표가 무엇인가요?",
      "Select your goal": "목표를 선택하세요",
      "Weight Loss": "체중 감량",
      "Muscle Gain": "근육 증가",
      "Improved Endurance": "지구력 향상",
      "General Fitness": "전신 피트니스",
      "Physical Activity Level?": "신체 활동 수준?",
      "Select your activity level": "활동 수준을 선택하세요",
      "Sedentary": "좌식 생활",
      "Moderate": "중간 정도",
      "Active": "활동적",
      "Do you have any existing health issues or injuries?": "기존 건강 문제나 부상이 있습니까?",
      "Enter any existing health issues or injuries": "기존 건강 문제나 부상을 입력하세요",
      "How many days a week can you commit to working out?": "일주일에 몇 일 동안 운동을 할 수 있나요?",
      "When can you workout?": "언제 운동할 수 있나요?",
      "Sign in failed: ": "로그인 실패: ",
      "Sign out failed: ": "로그아웃 실패: ",
      "Guest": "손님",
      "Loading...": "로딩 중...",
      "My Info": "내 정보",
      "signIn": "로그인",
      "signOut": "로그아웃",
      "Edit": "편집",
      "Save": "저장",
      "Take Photo": "사진 찍기",
      "Switch Camera": "카메라 전환",
      "Exit": "종료",
      "Add photo": "사진 추가",
      "image": "이미지",
      "banner": "배너",
      "Back": "뒤로",
      "Finish": "완료",
      "Next": "다음",
      "Sex":"성별",
      "Age":"나이",
      "Weight":"체중",
      "Height":"키",
      "Goals":"목표",
      "Activity":"활동 수준",
      "Health issues": "건강 문제",
      "Availability": "이용 가능성",
      "Not Available": "사용할 수 없음",
      "Monday": "월요일",
      "Tuesday": "화요일",
      "Wednesday": "수요일",
      "Thursday": "목요일",
      "Friday": "금요일",
      "Saturday": "토요일",
      "Sunday": "일요일",
      "Mon": "월요일",
      "Tue": "화요일",
      "Wed": "수요일",
      "Thu": "목요일",
      "Fri": "금요일",
      "Sat": "토요일",
      "Sun": "일요일",
      "Everyday": "매일",
      // premium
      "This feature is available to premium users only.": "이 기능은 프리미엄 사용자만 사용할 수 있습니다.",
      "Upgrade Now": "지금 업그레이드",
      
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // Set the default language here
    fallbackLng: "en", // Default language if the specified language fails
    keySeparator: false,
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
