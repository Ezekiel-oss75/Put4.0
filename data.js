/* ============================================================
   ПУТЬ 10.0 · DATA.JS — Все базы данных
   ============================================================ */

var STORAGE = 'put_v10';

var LEVELS = [
  {name:'Новичок',xp:0,mult:1.0,rank:'🌱'},
  {name:'Искатель',xp:150,mult:1.1,rank:'🔍'},
  {name:'Практик',xp:400,mult:1.25,rank:'⚙️'},
  {name:'Воин духа',xp:900,mult:1.5,rank:'⚔️'},
  {name:'Мудрец',xp:1600,mult:1.75,rank:'🦉'},
  {name:'Мастер',xp:2800,mult:2.0,rank:'🎖️'},
  {name:'Просветлённый',xp:4500,mult:2.5,rank:'✨'},
  {name:'Легенда',xp:7000,mult:3.0,rank:'👑'},
  {name:'Сотворцом',xp:12000,mult:4.0,rank:'💫'}
];

var RANK_TITLES = [
  'Начало пути','В поиске','Дисциплина дня','Путь воина',
  'Спокойствие ума','Мастер тела','Свет внутри','Тот, кто шёл до конца',
  'Сотворцом реальности'
];

/* ============================================================
   ЦИТАТЫ И УРОКИ ДНЯ (365)
   ============================================================ */
var QUOTES = [
  {q:'Мы — то, что мы делаем постоянно. Совершенство — не действие, а привычка.',a:'Аристотель'},
  {q:'Ты не обязан быть великим, чтобы начать. Но нужно начать, чтобы стать великим.',a:'Зиг Зиглар'},
  {q:'Дисциплина — это выбор между тем, что ты хочешь сейчас, и тем, чего хочешь больше всего.',a:'Августин'},
  {q:'Тот, кто владеет собой, владеет миром.',a:'Сенека'},
  {q:'Не бойся медленно идти. Бойся стоять на месте.',a:'Китайская мудрость'},
  {q:'Всё, что нас не убивает, делает нас сильнее.',a:'Ницше'},
  {q:'Стань тем изменением, которое хочешь видеть в мире.',a:'Ганди'},
  {q:'Ум — это всё. Ты становишься тем, о чём думаешь.',a:'Будда'},
  {q:'Сначала мы формируем привычки, потом привычки формируют нас.',a:'Джон Драйден'},
  {q:'Единственный способ сделать великую работу — любить то, что делаешь.',a:'Стив Джобс'},
  {q:'Не откладывай на завтра то, что можешь сделать сегодня.',a:'Бенджамин Франклин'},
  {q:'Ты сильнее, чем думаешь. И слабее, чем мог бы быть.',a:'Наполеон Хилл'},
  {q:'Чтобы иметь то, чего никогда не имел, нужно делать то, чего никогда не делал.',a:'Т. Харв Экер'},
  {q:'Успех — это сумма маленьких усилий, повторяемых день за днём.',a:'Роберт Кольер'},
  {q:'В каждом человеке солнце. Только дайте ему светить.',a:'Сократ'},
  {q:'Терпение — это не ожидание, это способность сохранять хорошее настроение, работая для достижения цели.',a:'Билл Гейтс'},
  {q:'Будь собой. Прочие роли уже заняты.',a:'Оскар Уайльд'},
  {q:'Разум — слуга сердца. Сделай сердце чистым, и разум поведёт правильно.',a:'Неизвестный'},
  {q:'Мы страдаем больше в воображении, чем в реальности.',a:'Сенека'},
  {q:'Начинай с того, что необходимо, потом делай возможное. И вдруг ты делаешь невозможное.',a:'Франциск Ассизский'},
  {q:'Только тот живёт по-настоящему, кто живёт для других.',a:'Альберт Швейцер'},
  {q:'Знание — сила. Но применение знания — большая сила.',a:'Бенджамин Франклин'},
  {q:'Наше величайшее счастье зависит от состояния нашего ума.',a:'Далай-лама XIV'},
  {q:'Не имеет значения, как медленно ты идёшь, если ты не останавливаешься.',a:'Конфуций'},
  {q:'Прошлое — это урок, а не приговор.',a:'Джейсон Файфер'},
  {q:'Действие — фундаментальный ключ к любому успеху.',a:'Пабло Пикассо'},
  {q:'Чтобы справиться с собой, нужно сначала понять себя.',a:'Карл Юнг'},
  {q:'Когда ты меняешь взгляд на вещи — вещи меняются.',a:'Уэйн Дайер'},
  {q:'Счастье — это не отсутствие проблем, а способность справляться с ними.',a:'Неизвестный'},
  {q:'Кто не рискует, тот не пьёт шампанского.',a:'Русская пословица'},
  {q:'Молчи, слушай и запоминай. Сила — в тишине.',a:'Неизвестный'},
  {q:'Ты никогда не бываешь слишком стар, чтобы поставить новую цель.',a:'К.С. Льюис'},
  {q:'Успешные люди делают то, что неудачники делать не хотят.',a:'Джим Рон'},
  {q:'Не жалей о прошлом. Строй будущее.',a:'Неизвестный'},
  {q:'Меняя себя, ты меняешь мир вокруг.',a:'Неизвестный'},
  {q:'Страх — это иллюзия. Действие побеждает его.',a:'Неизвестный'},
  {q:'Каждый день — новая возможность стать лучше.',a:'Неизвестный'},
  {q:'Не бойся разочаровать других — бойся разочаровать себя.',a:'Неизвестный'},
  {q:'Единственная граница — та, что ты сам себе поставил.',a:'Неизвестный'},
  {q:'Тот, кто не читает, ничем не лучше того, кто не умеет читать.',a:'Марк Твен'},
  {q:'Порядок в уме — порядок в жизни.',a:'Неизвестный'},
  {q:'Ты сам — причина всех своих результатов.',a:'Неизвестный'},
  {q:'Начни с малого, мечтай о великом.',a:'Неизвестный'},
  {q:'Истинный успех — встать больше раз, чем упал.',a:'Неизвестный'},
  {q:'Тишина — лучший ответ.',a:'Неизвестный'},
  {q:'Никогда не поздно стать тем, кем ты мог бы быть.',a:'Джордж Элиот'},
  {q:'Дорогу осилит идущий.',a:'Китайская пословица'},
  {q:'Кто хочет — ищет возможности, кто не хочет — ищет причины.',a:'Сократ'},
  {q:'Каждая неудача — это шанс начать снова, но уже умнее.',a:'Генри Форд'},
  {q:'Сложнее всего начать. Потом будет легче.',a:'Неизвестный'}
];

/* ============================================================
   ПИТОМЕЦ — 5 стадий эволюции
   ============================================================ */
var PET_STAGES = [
  {level:0, name:'Яйцо',         emoji:'🥚', xpNeeded:0,    desc:'Спит. Ждёт тебя.'},
  {level:1, name:'Детёныш',      emoji:'🐣', xpNeeded:200,  desc:'Вылупился! Смотрит на мир.'},
  {level:2, name:'Подросток',    emoji:'🦎', xpNeeded:800,  desc:'Растёт, играет, учится.'},
  {level:3, name:'Юный дракон',  emoji:'🐲', xpNeeded:2000, desc:'Набирает силу. Летает.'},
  {level:4, name:'Дракон',       emoji:'🐉', xpNeeded:5000, desc:'Могучий. Дышит огнём.'},
  {level:5, name:'Легендарный',  emoji:'🌟', xpNeeded:10000,desc:'Бессмертный. Светится.'}
];

/* Формы питомца в зависимости от стиля игры */
var PET_FORMS = {
  warrior: {emoji:['🥚','🐺','🦁','🐯','🐉','🌟'], name:['Яйцо','Волчонок','Львёнок','Тигр','Дракон','Легендарный Воин'], color:'#f5576c'},
  monk:    {emoji:['🥚','🦉','🕊️','🦅','🐉','✨'], name:['Яйцо','Совёнок','Голубь','Орёл','Дракон','Святой Мудрец'], color:'#8b7cff'},
  sage:    {emoji:['🥚','🐢','🦎','🐊','🐲','💫'], name:['Яйцо','Черепашка','Ящер','Крокодил','Дракон','Вечный Страж'], color:'#4cd964'}
};

/* ============================================================
   ДОМЕН — постройки
   ============================================================ */
var BUILDINGS = [
  {id:'tent',     name:'Палатка',        emoji:'⛺', cost:100,  reqLevel:0, bonus:'Старт пути',           bonusType:null, bonusValue:0},
  {id:'hut',      name:'Хижина',         emoji:'🏕️', cost:300,  reqLevel:1, bonus:'+5% ко всему XP',      bonusType:'all', bonusValue:5},
  {id:'house',    name:'Дом',            emoji:'🏠', cost:800,  reqLevel:2, bonus:'+10% ко всему XP',     bonusType:'all', bonusValue:10},
  {id:'medroom',  name:'Медитационный зал',emoji:'🧘',cost:1500,reqLevel:3, bonus:'+20% к разуму и духу', bonusType:'mind_spirit', bonusValue:20},
  {id:'gym',      name:'Спортзал',       emoji:'🏋️', cost:2000, reqLevel:3, bonus:'+20% к телу',          bonusType:'body', bonusValue:20},
  {id:'library',  name:'Библиотека',     emoji:'📚', cost:2500, reqLevel:4, bonus:'+15% ко всему XP',     bonusType:'all', bonusValue:15},
  {id:'garden',   name:'Сад',            emoji:'🌳', cost:3000, reqLevel:4, bonus:'+25% к здоровью',      bonusType:'health', bonusValue:25},
  {id:'temple',   name:'Храм',           emoji:'🏛️', cost:5000, reqLevel:5, bonus:'+30% ко всему XP',     bonusType:'all', bonusValue:30},
  {id:'citadel',  name:'Цитадель',       emoji:'🏰', cost:10000,reqLevel:6, bonus:'+50% ко всему XP',     bonusType:'all', bonusValue:50},
  {id:'sanctuary',name:'Святилище',      emoji:'⚜️', cost:20000,reqLevel:7, bonus:'×2 ко всему XP',       bonusType:'all', bonusValue:100}
];

/* ============================================================
   СУНДУК — таблица наград
   ============================================================ */
var CHEST_REWARDS = [
  {rarity:'common',    chance:55, icon:'📦', name:'Обычный сундук',    minXp:20,  maxXp:50},
  {rarity:'rare',      chance:25, icon:'💎', name:'Редкий сундук',     minXp:80,  maxXp:150},
  {rarity:'epic',      chance:15, icon:'🔮', name:'Эпический сундук',  minXp:200, maxXp:400},
  {rarity:'legendary', chance:5,  icon:'👑', name:'Легендарный сундук',minXp:600, maxXp:1000}
];

/* ============================================================
   ТРЕКЕР ПРИВЫЧЕК — стандартные
   ============================================================ */
var DEFAULT_HABITS = [
  {id:'h_water',   name:'💧 Вода 2л',       goal:30},
  {id:'h_wake',    name:'🌅 Ранний подъём', goal:30},
  {id:'h_cold',    name:'🚿 Холодный душ',  goal:30},
  {id:'h_meditate',name:'🧘 Медитация',     goal:30},
  {id:'h_sport',   name:'💪 Тренировка',    goal:20},
  {id:'h_read',    name:'📖 Чтение',        goal:30},
  {id:'h_nophone', name:'📵 Цифровая тишина',goal:30}
];

/* ============================================================
   ПРАКТИКИ (полный набор)
   ============================================================ */
var BASE_PRACTICES = [
  /* ДИСЦИПЛИНА */
  {id:'wake',cat:'disc',icon:'🌅',name:'Ранний подъём',tiers:[
    {name:'Встать до 8:00',xp:10,lvl:0},{name:'Встать до 7:00',xp:20,lvl:0},
    {name:'Встать до 6:00',xp:35,lvl:1},{name:'Встать до 5:00',xp:55,lvl:3},
    {name:'Встать до 4:30 + зарядка',xp:80,lvl:5}]},
  {id:'cold',cat:'disc',icon:'🚿',name:'Холодный душ',tiers:[
    {name:'30 секунд',xp:10,lvl:0},{name:'1 минута',xp:15,lvl:0},
    {name:'2 минуты',xp:25,lvl:1},{name:'5 минут + дыхание',xp:40,lvl:3},
    {name:'10 минут + медитация',xp:70,lvl:5}]},
  {id:'nophone',cat:'disc',icon:'📵',name:'Цифровая тишина',tiers:[
    {name:'30 минут утром',xp:10,lvl:0},{name:'1 час утром',xp:20,lvl:1},
    {name:'2 часа днём',xp:30,lvl:2},{name:'Полдня без соцсетей',xp:50,lvl:4},
    {name:'Весь день без интернета',xp:90,lvl:6}]},
  {id:'fast',cat:'disc',icon:'⏳',name:'Голодание',tiers:[
    {name:'12 часов',xp:15,lvl:1},{name:'14 часов',xp:20,lvl:1},
    {name:'16 часов',xp:30,lvl:2},{name:'18 часов',xp:45,lvl:3},
    {name:'24 часа',xp:80,lvl:5}]},
  {id:'silence',cat:'disc',icon:'🤫',name:'Час тишины',tiers:[
    {name:'15 минут',xp:10,lvl:2},{name:'30 минут',xp:18,lvl:3},
    {name:'1 час',xp:30,lvl:4},{name:'2 часа',xp:50,lvl:5},
    {name:'Полдня',xp:100,lvl:6}]},
  {id:'mono',cat:'disc',icon:'🎯',name:'Монозадача',tiers:[
    {name:'30 минут',xp:12,lvl:2},{name:'1 час',xp:22,lvl:3},
    {name:'2 часа',xp:40,lvl:4},{name:'4 часа',xp:75,lvl:5},
    {name:'Весь день',xp:150,lvl:6}]},
  {id:'dopamine_fast',cat:'disc',icon:'🧠',name:'Дофаминовое голодание',tiers:[
    {name:'3 часа без экранов',xp:20,lvl:2},{name:'6 часов',xp:35,lvl:3},
    {name:'Весь день',xp:70,lvl:4},{name:'24 часа',xp:120,lvl:5},
    {name:'48 часов',xp:220,lvl:7}]},
  {id:'dark_day',cat:'disc',icon:'🌑',name:'Тёмный день',tiers:[
    {name:'День без музыки',xp:20,lvl:3},{name:'Без сахара и кофе',xp:30,lvl:3},
    {name:'Полностью без допингов',xp:50,lvl:4},{name:'48 часов',xp:100,lvl:5},
    {name:'Неделя',xp:250,lvl:6}]},

  /* ДЫХАНИЕ */
  {id:'breath478',cat:'breath',icon:'💨',name:'Дыхание 4-7-8',tiers:[
    {name:'4 цикла',xp:10,lvl:0,breath:'478'},{name:'8 циклов',xp:18,lvl:1,breath:'478'},
    {name:'12 циклов',xp:30,lvl:2,breath:'478'},{name:'20 циклов',xp:50,lvl:4,breath:'478'},
    {name:'30 циклов',xp:80,lvl:6,breath:'478'}]},
  {id:'box',cat:'breath',icon:'🟦',name:'Квадратное дыхание',tiers:[
    {name:'1 минута',xp:10,lvl:1,breath:'box'},{name:'3 минуты',xp:20,lvl:2,breath:'box'},
    {name:'5 минут',xp:32,lvl:3,breath:'box'},{name:'10 минут',xp:55,lvl:5,breath:'box'},
    {name:'20 минут',xp:100,lvl:6,breath:'box'}]},
  {id:'wim',cat:'breath',icon:'❄️',name:'Вима Хофа',tiers:[
    {name:'1 раунд',xp:15,lvl:2,breath:'wim'},{name:'2 раунда',xp:28,lvl:3,breath:'wim'},
    {name:'3 раунда',xp:45,lvl:4,breath:'wim'},{name:'4 раунда + 2 мин',xp:85,lvl:6,breath:'wim'},
    {name:'6 раундов + 3 мин',xp:150,lvl:7,breath:'wim'}]},
  {id:'alt',cat:'breath',icon:'🌊',name:'Нади Шодхана',tiers:[
    {name:'3 минуты',xp:15,lvl:2,breath:'alt'},{name:'5 минут',xp:25,lvl:3,breath:'alt'},
    {name:'10 минут',xp:45,lvl:4,breath:'alt'},{name:'15 минут',xp:70,lvl:5,breath:'alt'},
    {name:'20 минут',xp:120,lvl:7,breath:'alt'}]},
  {id:'deep',cat:'breath',icon:'🌌',name:'Осознанное дыхание',tiers:[
    {name:'5 минут',xp:15,lvl:3},{name:'10 минут',xp:30,lvl:4},
    {name:'20 минут',xp:55,lvl:5},{name:'30 минут',xp:80,lvl:6},
    {name:'60 минут',xp:150,lvl:7}]},
  {id:'holo',cat:'breath',icon:'🫁',name:'Холотропное дыхание',tiers:[
    {name:'20 минут',xp:30,lvl:5},{name:'40 минут',xp:55,lvl:5},
    {name:'60 минут',xp:90,lvl:6},{name:'90 минут',xp:150,lvl:7},
    {name:'2 часа',xp:250,lvl:7}]},

  /* ТЕЛО */
  {id:'pushups',cat:'body',icon:'🤸',name:'Отжимания',tiers:[
    {name:'3×10',xp:10,lvl:0},{name:'3×20',xp:20,lvl:1},
    {name:'3×30',xp:35,lvl:2},{name:'4×40',xp:55,lvl:4},
    {name:'5×50 + алмазные',xp:100,lvl:6}]},
  {id:'squats',cat:'body',icon:'🏋️',name:'Приседания',tiers:[
    {name:'50 раз',xp:10,lvl:0},{name:'100 раз',xp:20,lvl:1},
    {name:'150 раз',xp:35,lvl:2},{name:'250 раз',xp:55,lvl:4},
    {name:'400 раз',xp:110,lvl:6}]},
  {id:'walk',cat:'body',icon:'🚶',name:'Прогулка',tiers:[
    {name:'5000 шагов',xp:10,lvl:0},{name:'8000 шагов',xp:20,lvl:0},
    {name:'12000 шагов',xp:35,lvl:2},{name:'15000 шагов',xp:50,lvl:4},
    {name:'20000+ шагов',xp:85,lvl:6}]},
  {id:'plank',cat:'body',icon:'🧱',name:'Планка',tiers:[
    {name:'3×30 сек',xp:12,lvl:1},{name:'3×60 сек',xp:25,lvl:2},
    {name:'3×90 сек',xp:42,lvl:3},{name:'3×2 мин',xp:75,lvl:5},
    {name:'5×3 мин',xp:140,lvl:7}]},
  {id:'stretch',cat:'body',icon:'🧘‍♂️',name:'Растяжка',tiers:[
    {name:'10 минут',xp:10,lvl:1},{name:'20 минут',xp:20,lvl:2},
    {name:'30 минут йога',xp:35,lvl:3},{name:'45 минут',xp:60,lvl:5},
    {name:'60 минут',xp:100,lvl:6}]},
  {id:'run',cat:'body',icon:'🏃',name:'Пробежка',tiers:[
    {name:'2 км',xp:20,lvl:2},{name:'5 км',xp:35,lvl:3},
    {name:'8 км',xp:55,lvl:4},{name:'10 км',xp:80,lvl:5},
    {name:'Полумарафон',xp:200,lvl:7}]},
  {id:'hiit',cat:'body',icon:'⚡',name:'HIIT',tiers:[
    {name:'10 минут',xp:20,lvl:3},{name:'15 минут',xp:30,lvl:3},
    {name:'20 минут',xp:42,lvl:4},{name:'30 минут',xp:65,lvl:5},
    {name:'45 минут + силовая',xp:110,lvl:7}]},
  {id:'iron',cat:'body',icon:'🏋️‍♂️',name:'Силовая тренировка',tiers:[
    {name:'Базовая',xp:25,lvl:4},{name:'Средняя',xp:45,lvl:5},
    {name:'Интенсив',xp:75,lvl:6},{name:'Тяжёлая',xp:120,lvl:7},
    {name:'Соревновательная',xp:200,lvl:7}]},

  /* РАЗУМ */
  {id:'meditate',cat:'mind',icon:'🧘',name:'Медитация',tiers:[
    {name:'5 минут',xp:10,lvl:0},{name:'10 минут',xp:20,lvl:1},
    {name:'15 минут',xp:30,lvl:2},{name:'25 минут',xp:50,lvl:3},
    {name:'45 минут',xp:90,lvl:5}]},
  {id:'read',cat:'mind',icon:'📖',name:'Чтение',tiers:[
    {name:'10 страниц',xp:10,lvl:0},{name:'20 страниц',xp:18,lvl:0},
    {name:'30 страниц',xp:28,lvl:1},{name:'50 страниц',xp:45,lvl:3},
    {name:'100 страниц',xp:85,lvl:5}]},
  {id:'journal',cat:'mind',icon:'✍️',name:'Дневник',tiers:[
    {name:'3 строки',xp:10,lvl:0},{name:'Полная страница',xp:20,lvl:1},
    {name:'Разбор дня',xp:30,lvl:2},{name:'Глубокий анализ',xp:50,lvl:4},
    {name:'Час письма',xp:90,lvl:6}]},
  {id:'grat',cat:'mind',icon:'🙏',name:'Благодарность',tiers:[
    {name:'3 вещи',xp:10,lvl:1},{name:'5 вещей',xp:15,lvl:2},
    {name:'10 вещей',xp:28,lvl:3},{name:'Письмо благодарности',xp:50,lvl:4},
    {name:'Мета-медитация 20 мин',xp:85,lvl:6}]},
  {id:'learn',cat:'mind',icon:'🎓',name:'Обучение',tiers:[
    {name:'15 минут',xp:15,lvl:2},{name:'30 минут',xp:28,lvl:2},
    {name:'1 час',xp:42,lvl:3},{name:'2 часа + практика',xp:75,lvl:5},
    {name:'4 часа',xp:140,lvl:7}]},
  {id:'deepwork',cat:'mind',icon:'🔥',name:'Глубокая работа',tiers:[
    {name:'1 час',xp:25,lvl:3},{name:'2 часа',xp:45,lvl:4},
    {name:'3 часа',xp:70,lvl:5},{name:'4 часа',xp:110,lvl:6},
    {name:'6 часов',xp:200,lvl:7}]},
  {id:'shadow',cat:'mind',icon:'🌑',name:'Работа с тенью',tiers:[
    {name:'15 минут',xp:20,lvl:4},{name:'30 минут',xp:35,lvl:5},
    {name:'1 час',xp:60,lvl:6},{name:'2 часа',xp:110,lvl:7},
    {name:'Целый день',xp:220,lvl:7}]},

  /* ДУХ */
  {id:'observer',cat:'spirit',icon:'👁️',name:'Я — Наблюдатель',tiers:[
    {name:'Заметить 3 мысли',xp:15,lvl:3},{name:'Наблюдать 10 минут',xp:28,lvl:4},
    {name:'30 минут',xp:50,lvl:5},{name:'Замечать весь день',xp:90,lvl:6},
    {name:'Постоянное осознание',xp:180,lvl:7}]},
  {id:'metta',cat:'spirit',icon:'✨',name:'Мета-медитация',tiers:[
    {name:'5 минут',xp:15,lvl:3},{name:'10 минут',xp:30,lvl:4},
    {name:'20 минут',xp:55,lvl:5},{name:'40 минут',xp:110,lvl:6},
    {name:'60 минут',xp:200,lvl:7}]},
  {id:'solitude',cat:'spirit',icon:'🏔️',name:'Уединение',tiers:[
    {name:'1 час без людей',xp:20,lvl:3},{name:'3 часа',xp:40,lvl:4},
    {name:'Полдня',xp:75,lvl:5},{name:'Весь день',xp:150,lvl:6},
    {name:'Уик-энд в тишине',xp:300,lvl:7}]},
  {id:'whoami',cat:'spirit',icon:'🕉️',name:'Кто я?',tiers:[
    {name:'Вопрос 10 раз',xp:20,lvl:4},{name:'30 минут',xp:45,lvl:5},
    {name:'1 час',xp:80,lvl:6},{name:'3 часа',xp:160,lvl:7},
    {name:'День самоисследования',xp:350,lvl:7}]},
  {id:'cosmos',cat:'spirit',icon:'🌟',name:'Единство',tiers:[
    {name:'Наблюдать природу 15 мин',xp:20,lvl:4},{name:'Раствориться в небе',xp:40,lvl:5},
    {name:'Медитация на единство',xp:70,lvl:6},{name:'Созерцание 1 час',xp:130,lvl:7},
    {name:'Глубокое переживание',xp:250,lvl:7}]},

  /* ЗДОРОВЬЕ */
  {id:'water',cat:'health',icon:'💧',name:'Вода',tiers:[
    {name:'1 литр',xp:10,lvl:0},{name:'1.5 литра',xp:18,lvl:1},
    {name:'2 литра',xp:28,lvl:2},{name:'2.5 литра',xp:45,lvl:3},
    {name:'3 литра',xp:70,lvl:5}]},
  {id:'sleep',cat:'health',icon:'😴',name:'Здоровый сон',tiers:[
    {name:'7 часов',xp:15,lvl:0},{name:'7.5 часов',xp:22,lvl:1},
    {name:'8 часов без телефона',xp:35,lvl:2},{name:'8.5 часов + ритуал',xp:55,lvl:4},
    {name:'9 часов идеально',xp:90,lvl:6}]},
  {id:'sun',cat:'health',icon:'☀️',name:'Солнце',tiers:[
    {name:'10 минут утром',xp:10,lvl:0},{name:'20 минут',xp:18,lvl:1},
    {name:'30 минут',xp:28,lvl:2},{name:'Час на улице',xp:50,lvl:4},
    {name:'Весь день на природе',xp:120,lvl:6}]},
  {id:'cleanfood',cat:'health',icon:'🥗',name:'Чистое питание',tiers:[
    {name:'Без сладкого 1 день',xp:15,lvl:0},{name:'Без сахара 2 дня',xp:28,lvl:1},
    {name:'Без обработанной еды 3 дня',xp:45,lvl:2},{name:'Неделя',xp:120,lvl:5},
    {name:'30 дней',xp:400,lvl:7}]},
  {id:'noscreen',cat:'health',icon:'📴',name:'Цифровой детокс',tiers:[
    {name:'1 час без телефона',xp:10,lvl:0},{name:'3 часа',xp:20,lvl:1},
    {name:'Полдня',xp:40,lvl:2},{name:'Весь день',xp:80,lvl:4},
    {name:'48 часов',xp:180,lvl:7}]},
  {id:'sauna',cat:'health',icon:'🔥',name:'Сауна / баня',tiers:[
    {name:'10 минут',xp:15,lvl:2},{name:'15 минут',xp:25,lvl:3},
    {name:'20 минут + контраст',xp:40,lvl:4},{name:'30 минут',xp:65,lvl:5},
    {name:'2 часа ритуал',xp:120,lvl:7}]}
];

/* ============================================================
   АЧИВКИ
   ============================================================ */
var ACHIEVEMENTS = [
  {id:'first',icon:'🌱',name:'Первый шаг',desc:'1 практика',check:function(s){return s.totalDone>=1;}},
  {id:'streak3',icon:'🔥',name:'Три дня',desc:'Стрик 3',check:function(s){return s.maxStreak>=3;}},
  {id:'streak7',icon:'⚡',name:'Неделя силы',desc:'Стрик 7',check:function(s){return s.maxStreak>=7;}},
  {id:'streak21',icon:'💫',name:'Привычка',desc:'Стрик 21',check:function(s){return s.maxStreak>=21;}},
  {id:'streak30',icon:'💎',name:'Железная воля',desc:'Стрик 30',check:function(s){return s.maxStreak>=30;}},
  {id:'streak100',icon:'👑',name:'Легенда',desc:'Стрик 100',check:function(s){return s.maxStreak>=100;}},
  {id:'streak365',icon:'🌟',name:'Год пути',desc:'Стрик 365',check:function(s){return s.maxStreak>=365;}},
  {id:'xp500',icon:'⭐',name:'500 XP',desc:'500',check:function(s){return s.xp>=500;}},
  {id:'xp1500',icon:'🌟',name:'1500 XP',desc:'1500',check:function(s){return s.xp>=1500;}},
  {id:'xp4000',icon:'✨',name:'4000 XP',desc:'4000',check:function(s){return s.xp>=4000;}},
  {id:'xp10000',icon:'💫',name:'10000 XP',desc:'10000',check:function(s){return s.xp>=10000;}},
  {id:'lvl4',icon:'🏅',name:'Воин духа',desc:'Ур 4',check:function(s){return getLevel(s.xp)>=3;}},
  {id:'lvl6',icon:'🏆',name:'Мастер',desc:'Ур 6',check:function(s){return getLevel(s.xp)>=5;}},
  {id:'lvl8',icon:'👑',name:'Легенда',desc:'Ур 8',check:function(s){return getLevel(s.xp)>=7;}},
  {id:'lvl9',icon:'💫',name:'Сотворцом',desc:'Макс уровень',check:function(s){return getLevel(s.xp)>=8;}},
  {id:'done10',icon:'💪',name:'10 практик',desc:'10',check:function(s){return s.totalDone>=10;}},
  {id:'done100',icon:'🚀',name:'100 практик',desc:'100',check:function(s){return s.totalDone>=100;}},
  {id:'done500',icon:'🛸',name:'500 практик',desc:'500',check:function(s){return s.totalDone>=500;}},
  {id:'done1000',icon:'🌌',name:'Тысячник',desc:'1000',check:function(s){return s.totalDone>=1000;}},
  {id:'ask3',icon:'⛰',name:'Аскеза 3 дня',desc:'Пройдена',check:function(s){return s.askesis.some(function(a){return a.completed&&a.targetDays===3;});}},
  {id:'ask7',icon:'🗻',name:'Аскеза 7 дней',desc:'Пройдена',check:function(s){return s.askesis.some(function(a){return a.completed&&a.targetDays===7;});}},
  {id:'ask30',icon:'🏔',name:'Аскеза 30 дней',desc:'Пройдена',check:function(s){return s.askesis.some(function(a){return a.completed&&a.targetDays===30;});}},
  {id:'breather',icon:'🌬',name:'Дыши глубже',desc:'20 дыхательных',check:function(s){return countCat(s,'breath')>=20;}},
  {id:'ironman',icon:'🦾',name:'Атлет',desc:'30 тренировок',check:function(s){return countCat(s,'body')>=30;}},
  {id:'thinker',icon:'🧠',name:'Мыслитель',desc:'30 разума',check:function(s){return countCat(s,'mind')>=30;}},
  {id:'monk',icon:'🕉',name:'Монах',desc:'50 дисциплины',check:function(s){return countCat(s,'disc')>=50;}},
  {id:'healthy',icon:'💚',name:'Здоровяк',desc:'20 здоровья',check:function(s){return countCat(s,'health')>=20;}},
  {id:'enlightened',icon:'✨',name:'Пробуждённый',desc:'20 духовных',check:function(s){return countCat(s,'spirit')>=20;}},
  {id:'barrier1',icon:'🚧',name:'Первый прорыв',desc:'1 преграда',check:function(s){return (s.barriersCleared||0)>=1;}},
  {id:'barrier3',icon:'🧗',name:'Преодоление',desc:'3 преграды',check:function(s){return (s.barriersCleared||0)>=3;}},
  {id:'barrier7',icon:'🏆',name:'Свобода',desc:'Все 7 преград',check:function(s){return (s.barriersCleared||0)>=7;}},
  {id:'path3',icon:'🔥',name:'Ковка',desc:'Ступень 3',check:function(s){return (s.currentPathStep||0)>=3;}},
  {id:'path5',icon:'👁️',name:'Свидетель',desc:'Ступень 5',check:function(s){return (s.currentPathStep||0)>=5;}},
  {id:'path7',icon:'🌟',name:'Сотворчество',desc:'Ступень 7',check:function(s){return (s.currentPathStep||0)>=7;}},
  {id:'card1',icon:'🎴',name:'Судьба',desc:'Первая карта',check:function(s){return (s.cardsCompleted||0)>=1;}},
  {id:'card10',icon:'🃏',name:'Исполнитель судьбы',desc:'10 карт',check:function(s){return (s.cardsCompleted||0)>=10;}},
  {id:'card30',icon:'🎰',name:'Мастер судьбы',desc:'30 карт',check:function(s){return (s.cardsCompleted||0)>=30;}},
  {id:'goal1',icon:'🎯',name:'Целеустремлённый',desc:'1 цель',check:function(s){return (s.goalsCompleted||0)>=1;}},
  {id:'goal3',icon:'🏹',name:'Достигатор',desc:'3 цели',check:function(s){return (s.goalsCompleted||0)>=3;}},
  {id:'goal10',icon:'🏆',name:'Легенда целей',desc:'10 целей',check:function(s){return (s.goalsCompleted||0)>=10;}},
  {id:'grand1',icon:'👑',name:'Великая цель',desc:'Грандиозная цель',check:function(s){return s.goals.some(function(g){return g.completed&&g.isGrand;});}},
  {id:'mood7',icon:'📔',name:'Дневник души',desc:'7 отметок',check:function(s){return Object.keys(s.moods||{}).length>=7;}},
  {id:'mood30',icon:'📖',name:'Летописец',desc:'30 отметок',check:function(s){return Object.keys(s.moods||{}).length>=30;}},
  {id:'plan1',icon:'🧠',name:'Проектировщик',desc:'Создан план дня',check:function(s){return !!s.userPlan;}},
  {id:'milestone10',icon:'✅',name:'Шаги к мечте',desc:'10 шагов',check:function(s){return (s.milestonesCompleted||0)>=10;}},
  {id:'milestone50',icon:'🏗',name:'Строитель',desc:'50 шагов',check:function(s){return (s.milestonesCompleted||0)>=50;}},
  /* НОВЫЕ — питомец, домен, сундуки */
  {id:'pet1',icon:'🥚',name:'Появление',desc:'Питомец вылупился',check:function(s){return (s.petLevel||0)>=1;}},
  {id:'pet3',icon:'🐲',name:'Юный дракон',desc:'Питомец вырос',check:function(s){return (s.petLevel||0)>=3;}},
  {id:'pet5',icon:'🌟',name:'Легендарный',desc:'Максимум питомца',check:function(s){return (s.petLevel||0)>=5;}},
  {id:'build1',icon:'⛺',name:'Первая постройка',desc:'1 постройка',check:function(s){return (s.buildings||[]).length>=1;}},
  {id:'build5',icon:'🏰',name:'Зодчий',desc:'5 построек',check:function(s){return (s.buildings||[]).length>=5;}},
  {id:'build10',icon:'👑',name:'Владыка',desc:'Все постройки',check:function(s){return (s.buildings||[]).length>=10;}},
  {id:'chest10',icon:'📦',name:'Собиратель',desc:'10 сундуков',check:function(s){return (s.chestsOpened||0)>=10;}},
  {id:'chest50',icon:'💎',name:'Кладоискатель',desc:'50 сундуков',check:function(s){return (s.chestsOpened||0)>=50;}},
  {id:'legendary1',icon:'🔮',name:'Легендарка!',desc:'Легендарный сундук',check:function(s){return (s.legendaryChests||0)>=1;}},
  {id:'habit7',icon:'📅',name:'Неделя привычек',desc:'7 дней заполнено',check:function(s){return countHabitDays(s)>=7;}},
  {id:'habit30',icon:'🗓',name:'Месяц привычек',desc:'30 дней',check:function(s){return countHabitDays(s)>=30;}},
  {id:'meditation_voice',icon:'🎧',name:'Голос внутри',desc:'Первая аудиомедитация',check:function(s){return (s.voiceMeditations||0)>=1;}},
  {id:'body_log1',icon:'⚖️',name:'Следим за телом',desc:'Первая запись веса',check:function(s){return (s.bodyLog||[]).length>=1;}},
  {id:'body_log30',icon:'📈',name:'Дисциплина тела',desc:'30 записей тела',check:function(s){return (s.bodyLog||[]).length>=30;}},
  {id:'finance1',icon:'💰',name:'Финансист',desc:'Первая запись трат',check:function(s){return (s.financeLog||[]).length>=1;}},
  {id:'finance30',icon:'💵',name:'Бухгалтер',desc:'30 записей',check:function(s){return (s.financeLog||[]).length>=30;}}
];

/* ============================================================
   АСКЕЗЫ
   ============================================================ */
var ASKESIS = [
  {id:'ask_water',name:'💧 Только вода',targetDays:3,xp:50},
  {id:'ask_nosugar',name:'🍬 Без сахара',targetDays:7,xp:120},
  {id:'ask_nophone',name:'📵 Без соцсетей',targetDays:7,xp:130},
  {id:'ask_cold',name:'🥶 Холодный душ',targetDays:14,xp:250},
  {id:'ask_med14',name:'🧘 Медитация 14 дней',targetDays:14,xp:250},
  {id:'ask_silence',name:'🤫 Тишина 21 день',targetDays:21,xp:400},
  {id:'ask_wake5',name:'🌅 Подъём в 5:00 · 30',targetDays:30,xp:700},
  {id:'ask_med30',name:'🕉 Медитация 30 дней',targetDays:30,xp:700},
  {id:'ask_monk',name:'⛩ Монашеский режим · 90',targetDays:90,xp:2500}
];

/* ============================================================
   КВЕСТЫ
   ============================================================ */
var QUEST_POOL = [
  {id:'q_breath',icon:'🌬️',name:'Мастер дыхания',desc:'3 дыхательные',reward:40,check:function(s){return todayCatCount(s,'breath')>=3;}},
  {id:'q_body',icon:'💪',name:'Атлет дня',desc:'3 телесные',reward:40,check:function(s){return todayCatCount(s,'body')>=3;}},
  {id:'q_mind',icon:'🧠',name:'Мыслитель',desc:'3 разума',reward:40,check:function(s){return todayCatCount(s,'mind')>=3;}},
  {id:'q_disc',icon:'⚔️',name:'Стойкий воин',desc:'3 дисциплины',reward:40,check:function(s){return todayCatCount(s,'disc')>=3;}},
  {id:'q_health',icon:'💚',name:'Здоровяк',desc:'3 здоровья',reward:45,check:function(s){return todayCatCount(s,'health')>=3;}},
  {id:'q_spirit',icon:'✨',name:'Духовный поиск',desc:'2 духовные',reward:55,check:function(s){return todayCatCount(s,'spirit')>=2;}},
  {id:'q_early',icon:'🌅',name:'Ранняя птица',desc:'Ранний подъём',reward:30,check:function(s){return s.todayDone.indexOf('wake')>=0;}},
  {id:'q_5',icon:'⭐',name:'Пять побед',desc:'5 практик',reward:50,check:function(s){return s.todayDone.length>=5;}},
  {id:'q_med',icon:'🧘',name:'Тишина',desc:'Медитация',reward:30,check:function(s){return s.todayDone.indexOf('meditate')>=0;}},
  {id:'q_read',icon:'📖',name:'Читатель',desc:'Чтение',reward:25,check:function(s){return s.todayDone.indexOf('read')>=0;}},
  {id:'q_journal',icon:'✍️',name:'Рефлексия',desc:'Дневник',reward:25,check:function(s){return s.todayDone.indexOf('journal')>=0;}},
  {id:'q_cold',icon:'🚿',name:'Холодный разум',desc:'Холодный душ',reward:30,check:function(s){return s.todayDone.indexOf('cold')>=0;}},
  {id:'q_7',icon:'🏆',name:'Семь дел',desc:'7 практик',reward:80,check:function(s){return s.todayDone.length>=7;}},
  {id:'q_water',icon:'💧',name:'Вода',desc:'Норма воды',reward:20,check:function(s){return s.todayDone.indexOf('water')>=0;}},
  {id:'q_deepwork',icon:'🔥',name:'Монах работы',desc:'2ч глубокой работы',reward:70,check:function(s){return s.todayDone.indexOf('deepwork')>=0;}},
  {id:'q_solitude',icon:'🏔️',name:'Отшельник',desc:'3 часа уединения',reward:75,check:function(s){return s.todayDone.indexOf('solitude')>=0;}}
];

/* ============================================================
   ПУТЬ
   ============================================================ */
var AWAKENING_PATH = [
  {n:1,icon:'🌱',title:'Пробуждение',subtitle:'Первые шаги',desc:'Ты замечаешь, что жил на автопилоте.',
    reqs:[{type:'totalDone',value:5,label:'5 практик'},{type:'streak',value:3,label:'Стрик 3'}]},
  {n:2,icon:'💧',title:'Очищение',subtitle:'Убираем шум',desc:'Убираешь лишнее.',
    reqs:[{type:'totalDone',value:25,label:'25 практик'},{type:'streak',value:7,label:'Стрик 7'},{type:'cat',cat:'disc',value:10,label:'10 дисциплины'}]},
  {n:3,icon:'🔥',title:'Ковка',subtitle:'Тело и воля',desc:'Тело — инструмент. Ум — слуга.',
    reqs:[{type:'totalDone',value:60,label:'60 практик'},{type:'streak',value:14,label:'Стрик 14'},{type:'cat',cat:'body',value:20,label:'20 телесных'},{type:'barrier',value:1,label:'1 преграда'}]},
  {n:4,icon:'🌊',title:'Поток',subtitle:'Осознанность',desc:'Действия без усилий.',
    reqs:[{type:'totalDone',value:120,label:'120 практик'},{type:'streak',value:21,label:'Стрик 21'},{type:'cat',cat:'breath',value:30,label:'30 дыхательных'},{type:'cat',cat:'mind',value:30,label:'30 разума'}]},
  {n:5,icon:'👁️',title:'Свидетель',subtitle:'Наблюдатель',desc:'Видишь себя со стороны.',
    reqs:[{type:'totalDone',value:250,label:'250 практик'},{type:'streak',value:30,label:'Стрик 30'},{type:'askesis',value:1,label:'1 аскеза'},{type:'barrier',value:3,label:'3 преграды'}]},
  {n:6,icon:'☀️',title:'Единство',subtitle:'Растворение',desc:'Границы истончаются.',
    reqs:[{type:'totalDone',value:500,label:'500 практик'},{type:'streak',value:60,label:'Стрик 60'},{type:'askesis',value:3,label:'3 аскезы'},{type:'barrier',value:5,label:'5 преград'}]},
  {n:7,icon:'🌟',title:'Сотворчество',subtitle:'Полное осознание',desc:'Ты — наблюдатель и творец.',
    reqs:[{type:'totalDone',value:1000,label:'1000 практик'},{type:'streak',value:100,label:'Стрик 100'},{type:'askesis',value:5,label:'5 аскез'},{type:'barrier',value:7,label:'Все 7 преград'}]}
];

/* ============================================================
   ШАБЛОНЫ ЦЕЛЕЙ
   ============================================================ */
var GRAND_GOALS_TEMPLATES = [
  {id:'quit_smoking',icon:'🚭',title:'Бросить курить',desc:'Полный отказ от никотина за 30 дней',
    milestones:['Решить окончательно','Назначить дату','Сказать близким','Выбросить всё в день X','День 1 без сигарет','День 3 — самый тяжёлый','Неделя свободы','2 недели чистоты','Месяц без курения','Вернуться к спорту','Сказать себе: я не курю']},
  {id:'quit_alcohol',icon:'🍷',title:'Бросить алкоголь',desc:'Полная трезвость',
    milestones:['Признать проблему','Определить триггеры','Избегать компаний пьющих','День 1 трезвости','Первая неделя','Первый трезвый вечер с друзьями','Месяц','Найти замену ритуалу','3 месяца','Год трезвости','Помогать другим']},
  {id:'quit_sugar',icon:'🍬',title:'Бросить сахар',desc:'Убрать добавленный сахар',
    milestones:['Убрать сладкие напитки','Не покупать сладкое домой','Заменить на фрукты','День 1 без сахара','3 дня','Неделя','Тяга уходит','2 недели','Месяц без сахара','Новые вкусы','Сахар больше не нужен']},
  {id:'start_run',icon:'🏃',title:'Начать бегать',desc:'С нуля до 5 км за 8 недель',
    milestones:['Купить кроссовки','День 1: 500 м','Неделя 1: 1 км','Неделя 2: 1.5 км','Неделя 3: 2 км','Неделя 4: 3 км','Неделя 5: 3.5 км','Неделя 6: 4 км','Неделя 7: 4.5 км','Неделя 8: 5 км 🏆','Участвовать в забеге']},
  {id:'gym',icon:'💪',title:'Регулярный спортзал',desc:'4 тренировки в неделю, 3 месяца',
    milestones:['Абонемент','Составить план','Первая тренировка','Неделя 1','Месяц','Прогресс в весах','Отказ от пропусков','2 месяца','3 месяца','Новое тело']},
  {id:'meditate30',icon:'🧘',title:'Медитация 30 дней',desc:'15 минут ежедневно',
    milestones:['День 1: 5 минут','День 3: не пропускать','День 7: 10 минут','День 14: 15 минут','3 недели','30 дней 🏆','До завтрака','Спокойствие ума']},
  {id:'learn_english',icon:'🗣️',title:'Выучить английский',desc:'До B2 за 6 месяцев',
    milestones:['Определить уровень','Найти метод','20 мин ежедневно','Первая неделя','500 слов','1000 слов','Первая беседа','Месяц ежедневно','Фильмы без субтитров','Свободная речь','Уровень B2 🏆']},
  {id:'start_business',icon:'🚀',title:'Запустить своё дело',desc:'С нуля до первого дохода',
    milestones:['Идея','Изучить нишу','MVP','Первая продажа','Оформить документы','Первые 100₽','Первые 1000₽','Первые 10000₽','Стабильный поток','Найм помощника','Масштабирование']},
  {id:'write_book',icon:'✍️',title:'Написать книгу',desc:'От идеи до публикации',
    milestones:['Идея','План глав','Глава 1','10 000 слов','30 000 слов','50 000 — черновик','Редактура','Обложка','Публикация','Первые читатели','Отзывы']},
  {id:'custom',icon:'🎯',title:'Своя цель',desc:'Твоя личная грандиозная цель',milestones:[]}
];

/* ============================================================
   БАЗА ЗНАНИЙ
   ============================================================ */
var KNOWLEDGE_BASE = [
  {cat:'🌬️ Дыхательные практики',items:[
    {name:'Дыхание 4-7-8',what:'Вдох 4 · задержка 7 · выдох 8.',benefits:['Парасимпатическая','Меньше тревоги','Заснуть','Давление'],how:'Вдох носом 4, задержка 7, выдох 8. 4 цикла.',when:'Перед сном.'},
    {name:'Квадратное',what:'4-4-4-4.',benefits:['Фокус','Спецназ','Баланс','Контроль'],how:'4 вдох → 4 держишь → 4 выдох → 4 держишь.',when:'Перед встречей.'},
    {name:'Вима Хофа',what:'30 быстрых вдохов + задержка.',benefits:['Энергия','Иммунитет','Холод','Против воспаления'],how:'30 вдохов. Задержи. 3-4 раунда.',when:'Утром.'},
    {name:'Нади Шодхана',what:'Попеременное через ноздри.',benefits:['Баланс','Успокоение','Ясность','Головная боль'],how:'Зажми правую — вдох левой. И наоборот.',when:'Перед медитацией.'},
    {name:'Холотропное',what:'Связное глубокое дыхание.',benefits:['Травмы','Изменённые состояния','Катарсис','Расслабление'],how:'40-60 мин. С ведущим.',when:'По случаю.'},
    {name:'Осознанное',what:'Наблюдение за дыханием.',benefits:['Осознанность','Тишина','Медитация','Кортизол'],how:'Внимание на кончик носа.',when:'Всегда.'}
  ]},
  {cat:'🧘 Медитация',items:[
    {name:'Наблюдение',what:'Наблюдай за дыханием и мыслями.',benefits:['Префронтальная кора','Тревога','Память','Воспаление'],how:'Сядь. Глаза закрыты. Мысли приходят — вернись.',when:'Утром и вечером.'},
    {name:'Мета-медитация',what:'Пожелание счастья.',benefits:['Одиночество','Эмпатия','Связи','Депрессия'],how:'Себе → близкому → врагу.',when:'Утром.'},
    {name:'Сканирование тела',what:'Внимание по телу.',benefits:['Напряжение','Чувствительность','Сон','В теле'],how:'Стопы → голова. 15-20 мин.',when:'Перед сном.'},
    {name:'Випассана',what:'Наблюдение за ощущениями.',benefits:['Понимание','Освобождение','Прозрение','Уравновешенность'],how:'10 дней по 10 часов.',when:'Ретрит.'}
  ]},
  {cat:'⚔️ Дисциплина',items:[
    {name:'Холодный душ',what:'30 сек — 3 мин холода.',benefits:['Дофамин +250%','Жир','Настроение','Иммунитет'],how:'После душа — выключай горячую.',when:'Утром.'},
    {name:'Ранний подъём',what:'5-7 утра.',benefits:['Пик дофамина','Тишина','Ритмы','Время'],how:'Ложись в 22:00.',when:'Ежедневно.'},
    {name:'Голодание',what:'Окно 8ч, голод 16ч.',benefits:['Аутофагия','Инсулин','Кетоны','Долголетие'],how:'С 12ч → до 16ч.',when:'Ежедневно.'},
    {name:'Дофаминовое голодание',what:'Отказ от быстрых удовольствий.',benefits:['Рецепторы','Ясность','Мотивация','Тишина'],how:'Ни соцсетей, ни сахара.',when:'Раз в неделю.'},
    {name:'Цифровая тишина',what:'Первый час без телефона.',benefits:['Дофамин','Фокус','Тревога','Слышишь себя'],how:'Телефон в другой комнате.',when:'Утром.'},
    {name:'Монозадача',what:'Одно дело за раз.',benefits:['+40%','Меньше ошибок','Погружение','Выгорание'],how:'Одна задача. 25-90 мин.',when:'При работе.'}
  ]},
  {cat:'💪 Тело',items:[
    {name:'Отжимания',what:'Базовая сила.',benefits:['Сила','Осанка','Тестостерон','Доступно'],how:'3×10 → 5×50.',when:'Утром.'},
    {name:'Приседания',what:'Ноги, ягодицы, кор.',benefits:['Гормон роста','Метаболизм','Ноги','Подвижность'],how:'3×20 → 100+.',when:'Ежедневно.'},
    {name:'Планка',what:'Статика на кор.',benefits:['Спина','Осанка','Поясница','Стойкость'],how:'30→120 сек.',when:'Утром/вечером.'},
    {name:'Пробежка',what:'Медленный бег.',benefits:['Выносливость','BDNF','Депрессия','Сердце'],how:'1-2 км → 10+ км.',when:'Утром.'},
    {name:'Растяжка',what:'Статические позы.',benefits:['Зажимы','Стресс','Сон','Связь'],how:'15-20 мин.',when:'Вечером.'},
    {name:'Сауна',what:'Тепло + контраст.',benefits:['Детокс','Иммунитет','Восстановление','Гормон роста'],how:'10-20 мин × 3.',when:'Раз в неделю.'}
  ]},
  {cat:'🧠 Разум',items:[
    {name:'Глубокая работа',what:'Фокус на одной задаче.',benefits:['+500%','Мастерство','Погружение','Смысл'],how:'2-4 часа без телефона.',when:'Утром.'},
    {name:'Работа с тенью',what:'Тёмные стороны себя.',benefits:['Целостность','Проекции','Энергия','Свобода'],how:'Что раздражает в других?',when:'Раз в неделю.'},
    {name:'Дневник',what:'Письменная рефлексия.',benefits:['Ясность','Катарсис','Паттерны','Память'],how:'Вечером: что было, что чувствовал.',when:'Вечером.'},
    {name:'Чтение',what:'Медленное с карандашом.',benefits:['Знания','Словарь','Эмпатия','Фокус'],how:'20-30 страниц.',when:'Утром.'}
  ]},
  {cat:'✨ Дух',items:[
    {name:'Наблюдатель',what:'Ты не мысли, не тело.',benefits:['Свобода','Меньше страха','Покой','Реакции'],how:'«Кто я?». Мысли приходят — ты их видишь.',when:'При эмоциях.'},
    {name:'Свидетельствование',what:'Наблюдение без вмешательства.',benefits:['Осознанность','Эмоции','Выбор','Тишина'],how:'«Что я делаю? Что чувствую?».',when:'Везде.'},
    {name:'Уединение',what:'Время в тишине.',benefits:['Душу','Понимание','Тишина','Ответы'],how:'С 1 часа → целый день.',when:'Раз в неделю.'},
    {name:'Кто я?',what:'Самоисследование.',benefits:['Эго','Покой','Прозрение','Я'],how:'«Кому пришла эта мысль?».',when:'Ежедневно.'},
    {name:'Единство',what:'Ты — часть мира.',benefits:['Отделённость','Сострадание','Страх','Блаженство'],how:'Смотри на природу.',when:'На природе.'}
  ]},
  {cat:'💚 Здоровье',items:[
    {name:'Сон 7-9ч',what:'Фундамент.',benefits:['Гормоны','Память','Иммунитет','Воля'],how:'Одно время. Тёмная комната.',when:'Ежедневно.'},
    {name:'Вода 2л',what:'Мозг 75% вода.',benefits:['Ясность','Энергия','Метаболизм','Кожа'],how:'30 мл/кг.',when:'Весь день.'},
    {name:'Солнце 30 мин',what:'Витамин D.',benefits:['Настроение','Иммунитет','Гормоны','Сон'],how:'15-30 мин утром.',when:'Утром.'},
    {name:'Чистое питание',what:'Цельная еда.',benefits:['Энергия','Ясность','Вес','Долголетие'],how:'Белок+овощи+жиры.',when:'Всегда.'},
    {name:'Детокс',what:'Отказ от экранов.',benefits:['Дофамин','Внимание','Сон','Спокойствие'],how:'1 час → весь день.',when:'Раз в неделю.'},
    {name:'Инсулиновое голодание',what:'Окно еды 8ч.',benefits:['Инсулин','Вес','Энергия','Аутофагия'],how:'8 часов еды, 16 голода.',when:'Ежедневно.'}
  ]},
  {cat:'🧬 Нейробиология',items:[
    {name:'Нейропластичность',what:'Мозг меняется всю жизнь.',benefits:['Учёба','Привычки','Восстановление','Гибкость'],how:'Повторение. 21 день.',when:'Постоянно.'},
    {name:'Дофамин',what:'Мотивация, не удовольствие.',benefits:['Импульсы','Мотивация','Контроль','Фокус'],how:'Выделяется В ОЖИДАНИИ.',when:'Всегда.'},
    {name:'Аутофагия',what:'Очистка клеток.',benefits:['Омоложение','Рак','Нейро','Долголетие'],how:'Голодание 16+.',when:'Голодание.'},
    {name:'BDNF',what:'Белок роста нейронов.',benefits:['Память','Настроение','Антидепрессия','Нейрогенез'],how:'Спорт, холод, омега-3.',when:'Регулярно.'},
    {name:'Кортизол',what:'Гормон стресса.',benefits:['Понимание','Контроль','Сон','Вес'],how:'Сон, спорт, медитация.',when:'Каждый день.'}
  ]},
  {cat:'📿 Философия',items:[
    {name:'Стоицизм',what:'Управляй тем, что в твоей власти.',benefits:['Устойчивость','Спокойствие','Практичность','Свобода'],how:'Что могу — что нет.',when:'Каждый день.'},
    {name:'Дзен',what:'Прямое постижение.',benefits:['Простота','Покой','Присутствие','Спонтанность'],how:'Не привязывайся.',when:'Везде.'},
    {name:'Экзистенциализм',what:'Смысл создаёшь сам.',benefits:['Свобода','Ответственность','Смысл','Подлинность'],how:'Ты выбираешь.',when:'При выборе.'},
    {name:'Уровни сознания',what:'Разные состояния.',benefits:['Путь','Прогресс','Ориентиры','Терпение'],how:'От выживания → к Свидетелю → ко всему.',when:'Постепенно.'}
  ]}
];

var HEALTH_BASE = [
  {cat:'🚭 Зависимости',items:[
    {name:'Курение',what:'Никотиновая зависимость.',mechanism:'Никотин стимулирует дофамин в 2-3 раза выше нормы.',steps:['Назначь дату','Выбрось всё','Скажи близким','Замени привычку','Дыши 4-7-8','Спорт','Отмечай дни'],when:'Лёгкие — 1-9 мес. Дофамин — 3 мес.'},
    {name:'Сахар',what:'Легальный наркотик.',mechanism:'Инсулиновые скачки.',steps:['Убери напитки','Не покупай','Замени на фрукты','Белок+жиры','21 день','Спи 7-8ч'],when:'2-3 недели.'},
    {name:'Соцсети',what:'Убивает внимание.',mechanism:'Случайные дофаминовые всплески.',steps:['Удали приложения','Телефон в комнате','Первый час без','Серый режим','Уведомления off','Замени на книгу'],when:'Внимание — 2 нед. Рецепторы — 1 мес.'},
    {name:'Кофеин',what:'Зависимость за 2 недели.',mechanism:'Блокирует аденозин.',steps:['Снижай постепенно','Кофе до 12:00','Цикорий, матча','Вода с лимоном'],when:'2-3 недели.'},
    {name:'Алкоголь',what:'Депрессант.',mechanism:'GABA+ и глутамат−.',steps:['«Я не пью»','Избегай пьющих','Безалкогольное','Спорт','Сон и еда'],when:'Сон — 1 нед. Мозг — 6-12 мес.'},
    {name:'Порно',what:'Скрытая зависимость.',mechanism:'Дофамин выше реального секса.',steps:['Признай','Блокировщики','Убери триггеры','Спорт','Социализация','Пережди 10 мин','30/90 дней'],when:'30-90 дней.'}
  ]},
  {cat:'🧠 Страхи и комплексы',items:[
    {name:'Страх отказа',what:'Боязнь «нет».',mechanism:'Мозг = социальная смерть.',steps:['Практика отказов','1 просьба в неделю','Дневник','Отказ = информация'],when:'10 отказов.'},
    {name:'Выступления',what:'Страх говорить.',mechanism:'Адреналин — используй.',steps:['Готовься ×3','4-7-8','1 лицо','Говори медленно','Практикуй'],when:'5-10 выступлений.'},
    {name:'Самозванец',what:'«Я обманщик».',mechanism:'Перфекционизм + сравнение.',steps:['Записывай достижения','У всех сомнения','Не сравнивай','«Я учусь»','Помогай'],when:'Через доказательства.'},
    {name:'Одиночество',what:'Боязнь без партнёра.',mechanism:'Эволюционно = смерть.',steps:['Уединение','Медитируй','Хобби','Радуйся себе'],when:'Через практику.'},
    {name:'Стеснительность',what:'Скованность.',mechanism:'Страх оценки.',steps:['Говори первым','Задавай вопросы','С малого','Прими неловкость','1 разговор/день'],when:'30 дней.'},
    {name:'Сравнение',what:'«Он лучше».',mechanism:'Дофаминовая петля.',steps:['Убери завистливых','С собой вчера','Дневник','Чужое ≠ твоё','Фокус на своём'],when:'2-3 недели.'}
  ]},
  {cat:'💚 ЗОЖ',items:[
    {name:'Сон 7-9ч',what:'Фундамент.',mechanism:'Недосып = кортизол+.',steps:['Одно время','Тёмная комната','Без экранов за час','Кофе до 12','Не есть за 3ч','Свет утром','Магний'],when:'2-3 недели.'},
    {name:'Питание',what:'Еда = информация.',mechanism:'Обработанная = скачки.',steps:['Короткий состав','Белок','Овощи 1/2','Жиры','Убери сахар','Готовь дома','Медленно'],when:'1-2 месяца.'},
    {name:'Вода',what:'Мозг 75%.',mechanism:'2% = спад.',steps:['Утром стакан','До еды','Бутылка с собой','30 мл/кг','Соль+лимон'],when:'2-3 дня.'},
    {name:'Солнце',what:'D — 200+ генов.',mechanism:'Серотонин + D.',steps:['15-30 мин утром','Шторы','Прогулки','D3+K2 зимой','Умеренно'],when:'Настроение сразу.'},
    {name:'Движение',what:'Мышцы — орган.',mechanism:'Миокины + BDNF.',steps:['8000-10000 шагов','Каждый час 2 мин','3 силовые','2 кардио','Растяжка','После еды'],when:'3 месяца.'},
    {name:'Стресс',what:'Хронический убивает.',mechanism:'Кортизол.',steps:['4-7-8','Медитация','Спорт','Природа','Связи','Дневник','«Нет» лишнему'],when:'2-4 недели.'}
  ]}
];

/* ============================================================
   КАРТЫ СУДЬБЫ
   ============================================================ */
var CARD_TEMPLATES = [
  {id:'c_breath',icon:'🌬️',title:'Дыхание ветра',desc:'5 минут дыхания 4-7-8 до телефона.',reward:60,action:'Дыхание 4-7-8',checkId:'breath478'},
  {id:'c_cold',icon:'❄️',title:'Ледяное пробуждение',desc:'Холодный душ 1 минуту.',reward:60,action:'Холодный душ',checkId:'cold'},
  {id:'c_silence',icon:'🤫',title:'Час тишины',desc:'Час без телефона и музыки.',reward:70,action:'Час тишины',checkId:'silence'},
  {id:'c_run',icon:'🏃',title:'Бег ветра',desc:'Пробежка 3 км.',reward:80,action:'Пробежка',checkId:'run'},
  {id:'c_med',icon:'🧘',title:'Внутренний покой',desc:'Медитация 15+ минут.',reward:60,action:'Медитация',checkId:'meditate'},
  {id:'c_write',icon:'✍️',title:'Слово правды',desc:'Полная страница дневника.',reward:55,action:'Дневник',checkId:'journal'},
  {id:'c_grat',icon:'🙏',title:'Благодарность',desc:'10 вещей.',reward:50,action:'Благодарность',checkId:'grat'},
  {id:'c_water',icon:'💧',title:'Живая вода',desc:'2 литра.',reward:45,action:'Вода',checkId:'water'},
  {id:'c_sun',icon:'☀️',title:'Свет солнца',desc:'30 минут на улице.',reward:50,action:'Солнце',checkId:'sun'},
  {id:'c_deep',icon:'🔥',title:'Глубокая работа',desc:'2 часа монозадачи.',reward:80,action:'Глубокая работа',checkId:'deepwork'},
  {id:'c_early',icon:'🌅',title:'Ранний восход',desc:'Подъём до 6:00.',reward:60,action:'Ранний подъём',checkId:'wake'},
  {id:'c_read',icon:'📖',title:'Мудрость страниц',desc:'30+ страниц.',reward:50,action:'Чтение',checkId:'read'},
  {id:'c_stretch',icon:'🧘‍♂️',title:'Гибкое тело',desc:'20+ минут растяжки.',reward:50,action:'Растяжка',checkId:'stretch'},
  {id:'c_push',icon:'🤸',title:'Сила рук',desc:'3 подхода отжиманий.',reward:50,action:'Отжимания',checkId:'pushups'},
  {id:'c_nophone',icon:'📵',title:'Цифровая тишина',desc:'1 час без телефона.',reward:55,action:'Цифровая тишина',checkId:'nophone'},
  {id:'c_observer',icon:'👁️',title:'Свидетель',desc:'30 минут наблюдения.',reward:80,action:'Я — Наблюдатель',checkId:'observer'},
  {id:'c_solitude',icon:'🏔️',title:'Уединение',desc:'3 часа в одиночестве.',reward:90,action:'Уединение',checkId:'solitude'},
  {id:'c_fast',icon:'⏳',title:'Окно ясности',desc:'16 часов без еды.',reward:80,action:'Голодание',checkId:'fast'},
  {id:'c_plank',icon:'🧱',title:'Камень',desc:'Планка 3×60 сек.',reward:55,action:'Планка',checkId:'plank'},
  {id:'c_learn',icon:'🎓',title:'Ученик',desc:'1+ час обучения.',reward:60,action:'Обучение',checkId:'learn'},
  {id:'c_metta',icon:'💗',title:'Сердце открыто',desc:'Мета-медитация 10+.',reward:70,action:'Мета-медитация',checkId:'metta'}
];

/* ============================================================
   ВСПОМОГАТЕЛЬНЫЕ — используются везде
   ============================================================ */
function dateKey(d){
  var y=d.getFullYear();
  var m=String(d.getMonth()+1).padStart(2,'0');
  var dd=String(d.getDate()).padStart(2,'0');
  return y+'-'+m+'-'+dd;
}
function todayStr(){return new Date().toDateString();}

function todayCatCount(s,cat){
  var ids=[];
  for(var i=0;i<BASE_PRACTICES.length;i++){
    if(BASE_PRACTICES[i].cat===cat)ids.push(BASE_PRACTICES[i].id);
  }
  var c=0;
  for(var j=0;j<s.todayDone.length;j++){
    if(ids.indexOf(s.todayDone[j])>=0)c++;
  }
  return c;
}

function countCat(s,cat){
  var ids=[];
  for(var i=0;i<BASE_PRACTICES.length;i++){
    if(BASE_PRACTICES[i].cat===cat)ids.push(BASE_PRACTICES[i].id);
  }
  var sum=0;
  for(var j=0;j<ids.length;j++){
    sum+=(s.completionCounter&&s.completionCounter[ids[j]])||0;
  }
  return sum;
}

function countHabitDays(s){
  if(!s.habits||!s.habits.log)return 0;
  var keys=Object.keys(s.habits.log);
  var cnt=0;
  for(var i=0;i<keys.length;i++){
    var day=s.habits.log[keys[i]];
    if(day&&Object.keys(day).length>0)cnt++;
  }
  return cnt;
}

function getLevel(xp){
  var l=0;
  for(var i=0;i<LEVELS.length;i++){
    if(xp>=LEVELS[i].xp)l=i;
  }
  return l;
}

/* БАЗА ВРЕМЕНИ — Pomodoro */
var POMODORO_WORK=25*60;
var POMODORO_BREAK=5*60;
var POMODORO_LONG=15*60;
</script>
