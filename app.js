(function(){
'use strict';

/* ============================================================
   УТИЛИТЫ
============================================================ */
function dateKey(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function todayStr(){return new Date().toDateString();}
function escapeHtml(s){if(!s)return '';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function closeModal(id){var el=document.getElementById(id);if(el)el.classList.remove('active');}

var STORAGE='put_v15';

/* ============================================================
   УРОВНИ
============================================================ */
var LEVELS=[
{name:'Новичок',xp:0,mult:1,rank:'🌱'},
{name:'Искатель',xp:150,mult:1.1,rank:'🔍'},
{name:'Практик',xp:400,mult:1.25,rank:'⚙️'},
{name:'Воин духа',xp:900,mult:1.5,rank:'⚔️'},
{name:'Мудрец',xp:1600,mult:1.75,rank:'🦉'},
{name:'Мастер',xp:2800,mult:2,rank:'🎖️'},
{name:'Просветлённый',xp:4500,mult:2.5,rank:'✨'},
{name:'Легенда',xp:7000,mult:3,rank:'👑'},
{name:'Сотворцом',xp:12000,mult:4,rank:'💫'}];
var RANK_TITLES=['Начало пути','В поиске','Дисциплина дня','Путь воина','Спокойствие ума','Мастер тела','Свет внутри','Тот, кто шёл до конца','Сотворцом реальности'];
function getLevel(xp){var l=0;for(var i=0;i<LEVELS.length;i++){if(xp>=LEVELS[i].xp)l=i;}return l;}
function getMultiplier(earned){return LEVELS[getLevel(earned)].mult;}

/* ============================================================
   БОССЫ, ЗДАНИЯ, СУНДУКИ
============================================================ */
var BOSSES=[
{id:'b_procrast',name:'Прокрастинация',icon:'🦥',hp:1500,hint:'Правило 2 минут.'},
{id:'b_doubt',name:'Сомнение',icon:'👻',hp:2000,hint:'Действуй несмотря.'},
{id:'b_lazy',name:'Лень',icon:'🐌',hp:2500,hint:'Движение побеждает.'},
{id:'b_chaos',name:'Хаос',icon:'🌪️',hp:3000,hint:'Медитация.'},
{id:'b_fear',name:'Страх',icon:'👹',hp:3500,hint:'Лицом к лицу.'},
{id:'b_ego',name:'Эго',icon:'🐲',hp:4000,hint:'Благодарность.'},
{id:'b_shadow',name:'Тень',icon:'🌑',hp:5000,hint:'Прими себя.'},
{id:'b_addiction',name:'Зависимость',icon:'⛓️',hp:4500,hint:'Заменяй.'}];

var BUILDINGS=[
{id:'tent',name:'Палатка',emoji:'⛺',cost:100,reqLevel:0,bonus:'Старт',bonusType:null,bonusValue:0},
{id:'hut',name:'Хижина',emoji:'🏕️',cost:300,reqLevel:1,bonus:'+5% XP',bonusType:'all',bonusValue:5},
{id:'house',name:'Дом',emoji:'🏠',cost:800,reqLevel:2,bonus:'+10% XP',bonusType:'all',bonusValue:10},
{id:'medroom',name:'Медзал',emoji:'🧘',cost:1500,reqLevel:3,bonus:'+20% разум+дух',bonusType:'mind_spirit',bonusValue:20},
{id:'gym',name:'Спортзал',emoji:'🏋️',cost:2000,reqLevel:3,bonus:'+20% тело',bonusType:'body',bonusValue:20},
{id:'library',name:'Библиотека',emoji:'📚',cost:2500,reqLevel:4,bonus:'+15% XP',bonusType:'all',bonusValue:15},
{id:'garden',name:'Сад',emoji:'🌳',cost:3000,reqLevel:4,bonus:'+25% здоровье',bonusType:'health',bonusValue:25},
{id:'temple',name:'Храм',emoji:'🏛️',cost:5000,reqLevel:5,bonus:'+30% XP',bonusType:'all',bonusValue:30},
{id:'citadel',name:'Цитадель',emoji:'🏰',cost:10000,reqLevel:6,bonus:'+50% XP',bonusType:'all',bonusValue:50},
{id:'sanctuary',name:'Святилище',emoji:'⚜️',cost:20000,reqLevel:7,bonus:'×2 XP',bonusType:'all',bonusValue:100}];

var CHEST_REWARDS=[
{rarity:'common',chance:55,icon:'📦',name:'Обычный',minXp:20,maxXp:50},
{rarity:'rare',chance:25,icon:'💎',name:'Редкий',minXp:80,maxXp:150},
{rarity:'epic',chance:15,icon:'🔮',name:'Эпический',minXp:200,maxXp:400},
{rarity:'legendary',chance:5,icon:'👑',name:'Легендарный',minXp:600,maxXp:1000}];

/* ============================================================
   ПИТОМЦЫ ПО КИТАЙСКОМУ ГОРОСКОПУ
============================================================ */
var PETS=[
{id:'rat',zodiac:'Крыса',emoji:'🐀',name:'Крысёнок-хранитель',rarity:'common',price:0,element:'💧 Вода',speech:['Я быстр и находчив!','Найдём выход вместе?','Крошки мудрости собираю.','Следуй за мной.'],desc:'Умный, хитрый, адаптивный.'},
{id:'ox',zodiac:'Бык',emoji:'🐂',name:'Телец-воин',rarity:'common',price:0,element:'🌍 Земля',speech:['Работаем — не жалуемся.','Медленно, но верно.','Я с тобой до конца.','Терпение — сила.'],desc:'Трудолюбивый, надёжный.'},
{id:'tiger',zodiac:'Тигр',emoji:'🐅',name:'Тигр-защитник',rarity:'rare',price:300,element:'🌳 Дерево',speech:['Смелость — моё имя!','Рычим на страхи!','Идём вперёд!','Я твой огонь.'],desc:'Храбрый, страстный.'},
{id:'rabbit',zodiac:'Кролик',emoji:'🐇',name:'Лунный кролик',rarity:'rare',price:300,element:'🌳 Дерево',speech:['В тишине — мудрость.','Я чувствую нежность мира.','Отдохни, я рядом.','Слушай сердце.'],desc:'Мягкий, чувствительный.'},
{id:'dragon',zodiac:'Дракон',emoji:'🐉',name:'Небесный дракон',rarity:'legendary',price:1500,element:'🌍 Земля',speech:['Я — император небес!','Твоя сила пробуждается.','Следуй за мной ввысь!','Ты достоин величия.'],desc:'Величественный, амбициозный.'},
{id:'snake',zodiac:'Змея',emoji:'🐍',name:'Изумрудный змей',rarity:'rare',price:400,element:'🔥 Огонь',speech:['Мудрость — в тишине.','Я знаю больше, чем говорю.','Трансформация идёт.','Сбрось старое.'],desc:'Мудрый, загадочный.'},
{id:'horse',zodiac:'Лошадь',emoji:'🐎',name:'Ветряной конь',rarity:'rare',price:400,element:'🔥 Огонь',speech:['Свобода зовёт!','Ветер в гриве!','Скачем вперёд!','Не оглядывайся.'],desc:'Свободный, энергичный.'},
{id:'goat',zodiac:'Коза',emoji:'🐐',name:'Горный козлик',rarity:'common',price:200,element:'🌍 Земля',speech:['Я поднимусь на любую гору!','Творчество — моё топливо.','Идём ввысь!','Гармония внутри.'],desc:'Творческий, упорный.'},
{id:'monkey',zodiac:'Обезьяна',emoji:'🐒',name:'Хитрый макак',rarity:'rare',price:350,element:'🔥 Огонь',speech:['Я всё придумаю!','Гибкий ум — суперсила.','Смекалка спасёт!','Давай поиграем?'],desc:'Изобретательный, умный.'},
{id:'rooster',zodiac:'Петух',emoji:'🐓',name:'Рассветный петух',rarity:'common',price:250,element:'🔥 Огонь',speech:['Я бужу рассвет!','Точность и порядок!','Кукареку — встаём!','Дисциплина — сила.'],desc:'Точный, дисциплинированный.'},
{id:'dog',zodiac:'Собака',emoji:'🐕',name:'Верный пёс',rarity:'common',price:200,element:'🌍 Земля',speech:['Я всегда рядом.','Верность — моя сила.','Защищу тебя.','Ты не один.'],desc:'Верный, честный.'},
{id:'pig',zodiac:'Свинья',emoji:'🐖',name:'Золотой поросёнок',rarity:'rare',price:300,element:'💧 Вода',speech:['Радость — в простом.','Щедрость вознаградится.','Наслаждайся жизнью!','Изобилие идёт.'],desc:'Щедрый, жизнерадостный.'}];

/* ============================================================
   ЗОДИАК
============================================================ */
var ZODIAC=[
{sign:'Овен',icon:'♈',from:[3,21],to:[4,19],element:'🔥 Огонь',planet:'Марс',stone:'Алмаз',desc:'Смелость, инициатива, лидерство.',long:'Овен — первый знак зодиака, стихия огня. Управляется Марсом. Люди-Овны рождены быть первопроходцами: они не боятся начать новое, часто идут напролом. Их сила — в скорости реакции и способности вдохновлять. Слабость — импульсивность. Камень: алмаз. День: вторник.'},
{sign:'Телец',icon:'♉',from:[4,20],to:[5,20],element:'🌍 Земля',planet:'Венера',stone:'Изумруд',desc:'Стабильность, терпение, чувственность.',long:'Телец — знак земли, управляемый Венерой. Воплощение надёжности. Тельцы ценят комфорт, вкусную еду, красивые вещи и стабильность. Их сила — терпение и умение доводить до конца. Слабость — упрямство. Камень: изумруд. День: пятница.'},
{sign:'Близнецы',icon:'♊',from:[5,21],to:[6,20],element:'💨 Воздух',planet:'Меркурий',stone:'Агат',desc:'Общительность, любопытство, гибкость.',long:'Близнецы — знак воздуха, управляемый Меркурием. Мастера коммуникации. Легко адаптируются, любят учиться, быстро схватывают новое. Их сила — ум и обаяние. Слабость — поверхностность. Камень: агат. День: среда.'},
{sign:'Рак',icon:'♋',from:[6,21],to:[7,22],element:'💧 Вода',planet:'Луна',stone:'Жемчуг',desc:'Забота, эмоции, интуиция.',long:'Рак — знак воды, управляемый Луной. Самое эмоциональное и заботливое созвездие. Раки — хранители дома и семьи. Их сила — эмпатия и память. Слабость — обидчивость. Камень: жемчуг. День: понедельник.'},
{sign:'Лев',icon:'♌',from:[7,23],to:[8,22],element:'🔥 Огонь',planet:'Солнце',stone:'Рубин',desc:'Харизма, творчество, уверенность.',long:'Лев — знак огня, управляемый Солнцем. Прирождённые лидеры и творцы. Львы любят быть в центре внимания, щедры, великодушны. Их сила — харизма и воля. Слабость — гордость. Камень: рубин. День: воскресенье.'},
{sign:'Дева',icon:'♍',from:[8,23],to:[9,22],element:'🌍 Земля',planet:'Меркурий',stone:'Сапфир',desc:'Аналитика, точность, служение.',long:'Дева — знак земли, управляемый Меркурием. Символ порядка и служения. Девы замечают детали, стремятся к совершенству. Их сила — ум и трудолюбие. Слабость — перфекционизм. Камень: сапфир. День: среда.'},
{sign:'Весы',icon:'♎',from:[9,23],to:[10,22],element:'💨 Воздух',planet:'Венера',stone:'Опал',desc:'Гармония, баланс, дипломатия.',long:'Весы — знак воздуха, управляемый Венерой. Символ баланса и партнёрства. Весы ищут гармонию во всём. Их сила — дипломатия и вкус. Слабость — нерешительность. Камень: опал. День: пятница.'},
{sign:'Скорпион',icon:'♏',from:[10,23],to:[11,21],element:'💧 Вода',planet:'Плутон',stone:'Топаз',desc:'Страсть, трансформация, глубина.',long:'Скорпион — знак воды, управляемый Плутоном. Самый интенсивный и загадочный знак. Живут страстями, способны на глубокие чувства и трансформации. Их сила — проницательность и воля. Слабость — ревность. Камень: топаз. День: вторник.'},
{sign:'Стрелец',icon:'♐',from:[11,22],to:[12,21],element:'🔥 Огонь',planet:'Юпитер',stone:'Бирюза',desc:'Свобода, оптимизм, расширение.',long:'Стрелец — знак огня, управляемый Юпитером. Символ свободы и философии. Вечные путешественники, ищущие смысл. Их сила — оптимизм и широта взглядов. Слабость — необязательность. Камень: бирюза. День: четверг.'},
{sign:'Козерог',icon:'♑',from:[12,22],to:[1,19],element:'🌍 Земля',planet:'Сатурн',stone:'Гранат',desc:'Целеустремлённость, ответственность.',long:'Козерог — знак земли, управляемый Сатурном. Символ дисциплины и времени. Идут к цели медленно, но верно, десятилетиями. Их сила — терпение и стратегическое мышление. Слабость — холодность. Камень: гранат. День: суббота.'},
{sign:'Водолей',icon:'♒',from:[1,20],to:[2,18],element:'💨 Воздух',planet:'Уран',stone:'Аметист',desc:'Оригинальность, свобода, идеи.',long:'Водолей — знак воздуха, управляемый Ураном. Символ революции и гениальности. Мыслят нестандартно, опережают время, ценят независимость. Их сила — оригинальность и гуманизм. Слабость — отстранённость. Камень: аметист. День: суббота.'},
{sign:'Рыбы',icon:'♓',from:[2,19],to:[3,20],element:'💧 Вода',planet:'Нептун',stone:'Аквамарин',desc:'Мечтательность, сострадание, искусство.',long:'Рыбы — знак воды, управляемый Нептуном. Последний знак зодиака — символ мистики и сострадания. Чувствуют мир глубже других, склонны к творчеству и духовным поискам. Их сила — интуиция и эмпатия. Слабость — уход от реальности. Камень: аквамарин. День: четверг.'}];

/* ============================================================
   НУМЕРОЛОГИЯ
============================================================ */
var NUM_MEANING={
1:'Лидер, независимость, воля.',2:'Дипломат, партнёрство, чувствительность.',3:'Творец, радость, самовыражение.',
4:'Строитель, стабильность, порядок.',5:'Искатель свободы, перемены, опыт.',6:'Хранитель, любовь, ответственность.',
7:'Мудрец, анализ, духовность.',8:'Властитель, деньги, реализация.',9:'Служитель, гуманизм, завершение.',
11:'Мастер-число: интуиция, пророчество.',22:'Мастер-число: зодчий систем.',33:'Мастер-число: учитель, целитель.'};

var NUM_MEANING_LONG={
1:'Число 1 — начало. Символ лидерства, независимости и воли. Люди с числом 1 рождены вести за собой, открывать новое. Решительны, амбициозны, иногда эгоистичны. Путь — быть лидером через вдохновение, а не давление.',
2:'Число 2 — двойственность. Партнёрство, дипломатия, чувствительность. Миротворцы, умеют слушать и понимать, но часто колеблются. Путь — научиться отстаивать границы.',
3:'Число 3 — творчество. Радость, самовыражение, коммуникация. Прирождённые творцы, артисты, ораторы. Путь — дисциплина и не распыляться.',
4:'Число 4 — структура. Стабильность, порядок, труд. Строители, надёжные и упорные. Путь — не застревать в рутине.',
5:'Число 5 — свобода. Перемены, приключения, опыт. Искатели, авантюристы. Путь — найти свободу внутри, а не только снаружи.',
6:'Число 6 — гармония. Любовь, ответственность, служение. Хранители, заботливые и щедрые. Путь — не забывать заботиться о себе.',
7:'Число 7 — мудрость. Анализ, духовность, одиночество. Мыслители, философы. Путь — соединить ум и сердце.',
8:'Число 8 — власть. Деньги, реализация, сила. Управленцы, бизнесмены. Путь — использовать силу во благо.',
9:'Число 9 — завершение. Гуманизм, служение, мудрость. Учителя, целители. Путь — научиться отпускать.',
11:'Мастер-число 11 — интуиция. Чувствительные, интуитивные, духовные. Путь — использовать дар предвидения для помощи другим.',
22:'Мастер-число 22 — зодчий. Способны реализовать мечты в реальность. Путь — строить большие системы, вдохновляя других.',
33:'Мастер-число 33 — учитель. Целители, учителя, духовные лидеры. Путь — служение через любовь.'};

var CHINESE_CYCLE=['rat','ox','tiger','rabbit','dragon','snake','horse','goat','monkey','rooster','dog','pig'];

/* ============================================================
   ПРАКТИКИ
============================================================ */
var BASE_PRACTICES=[
{id:'wake',cat:'disc',icon:'🌅',name:'Ранний подъём',timer:0,tiers:[{name:'до 8:00',xp:10,lvl:0},{name:'до 7:00',xp:20,lvl:0},{name:'до 6:00',xp:35,lvl:1},{name:'до 5:00',xp:55,lvl:3},{name:'до 4:30',xp:80,lvl:5}]},
{id:'cold',cat:'disc',icon:'🚿',name:'Холодный душ',timer:60,tiers:[{name:'30 сек',xp:10,lvl:0,timer:30},{name:'1 мин',xp:15,lvl:0,timer:60},{name:'2 мин',xp:25,lvl:1,timer:120},{name:'5 мин',xp:40,lvl:3,timer:300},{name:'10 мин',xp:70,lvl:5,timer:600}]},
{id:'nophone',cat:'disc',icon:'📵',name:'Цифровая тишина',timer:1800,tiers:[{name:'30 мин',xp:10,lvl:0,timer:1800},{name:'1 час',xp:20,lvl:1,timer:3600},{name:'2 часа',xp:30,lvl:2,timer:7200},{name:'Полдня',xp:50,lvl:4,timer:14400},{name:'День',xp:90,lvl:6,timer:28800}]},
{id:'fast',cat:'disc',icon:'⏳',name:'Голодание',timer:0,tiers:[{name:'12ч',xp:15,lvl:1},{name:'14ч',xp:20,lvl:1},{name:'16ч',xp:30,lvl:2},{name:'18ч',xp:45,lvl:3},{name:'24ч',xp:80,lvl:5}]},
{id:'silence',cat:'disc',icon:'🤫',name:'Час тишины',timer:900,tiers:[{name:'15 мин',xp:10,lvl:2,timer:900},{name:'30 мин',xp:18,lvl:3,timer:1800},{name:'1 час',xp:30,lvl:4,timer:3600},{name:'2 часа',xp:50,lvl:5,timer:7200},{name:'Полдня',xp:100,lvl:6,timer:14400}]},
{id:'mono',cat:'disc',icon:'🎯',name:'Монозадача',timer:1800,tiers:[{name:'30 мин',xp:12,lvl:2,timer:1800},{name:'1 час',xp:22,lvl:3,timer:3600},{name:'2 часа',xp:40,lvl:4,timer:7200},{name:'4 часа',xp:75,lvl:5,timer:14400},{name:'День',xp:150,lvl:6,timer:28800}]},
{id:'breath478',cat:'breath',icon:'💨',name:'Дыхание 4-7-8',tiers:[{name:'4 цикла',xp:10,lvl:0,breath:'478'},{name:'8 циклов',xp:18,lvl:1,breath:'478'},{name:'12 циклов',xp:30,lvl:2,breath:'478'},{name:'20 циклов',xp:50,lvl:4,breath:'478'},{name:'30 циклов',xp:80,lvl:6,breath:'478'}]},
{id:'box',cat:'breath',icon:'🟦',name:'Квадратное',tiers:[{name:'1 мин',xp:10,lvl:1,breath:'box'},{name:'3 мин',xp:20,lvl:2,breath:'box'},{name:'5 мин',xp:32,lvl:3,breath:'box'},{name:'10 мин',xp:55,lvl:5,breath:'box'},{name:'20 мин',xp:100,lvl:6,breath:'box'}]},
{id:'wim',cat:'breath',icon:'❄️',name:'Вима Хофа',tiers:[{name:'1 раунд',xp:15,lvl:2,breath:'wim'},{name:'2 раунда',xp:28,lvl:3,breath:'wim'},{name:'3 раунда',xp:45,lvl:4,breath:'wim'},{name:'4 раунда',xp:85,lvl:6,breath:'wim'},{name:'6 раундов',xp:150,lvl:7,breath:'wim'}]},
{id:'alt',cat:'breath',icon:'🌊',name:'Нади Шодхана',tiers:[{name:'3 мин',xp:15,lvl:2,breath:'alt'},{name:'5 мин',xp:25,lvl:3,breath:'alt'},{name:'10 мин',xp:45,lvl:4,breath:'alt'},{name:'15 мин',xp:70,lvl:5,breath:'alt'},{name:'20 мин',xp:120,lvl:7,breath:'alt'}]},
{id:'deep',cat:'breath',icon:'🌌',name:'Осознанное дыхание',timer:300,tiers:[{name:'5 мин',xp:15,lvl:3,timer:300},{name:'10 мин',xp:30,lvl:4,timer:600},{name:'20 мин',xp:55,lvl:5,timer:1200},{name:'30 мин',xp:80,lvl:6,timer:1800},{name:'60 мин',xp:150,lvl:7,timer:3600}]},
{id:'pushups',cat:'body',icon:'🤸',name:'Отжимания',timer:0,tiers:[{name:'3×10',xp:10,lvl:0},{name:'3×20',xp:20,lvl:1},{name:'3×30',xp:35,lvl:2},{name:'4×40',xp:55,lvl:4},{name:'5×50',xp:100,lvl:6}]},
{id:'squats',cat:'body',icon:'🏋️',name:'Приседания',timer:0,tiers:[{name:'50',xp:10,lvl:0},{name:'100',xp:20,lvl:1},{name:'150',xp:35,lvl:2},{name:'250',xp:55,lvl:4},{name:'400',xp:110,lvl:6}]},
{id:'walk',cat:'body',icon:'🚶',name:'Прогулка',timer:0,tiers:[{name:'5000 шагов',xp:10,lvl:0},{name:'8000',xp:20,lvl:0},{name:'12000',xp:35,lvl:2},{name:'15000',xp:50,lvl:4},{name:'20000+',xp:85,lvl:6}]},
{id:'plank',cat:'body',icon:'🧱',name:'Планка',timer:30,tiers:[{name:'3×30 сек',xp:12,lvl:1,timer:30},{name:'3×60',xp:25,lvl:2,timer:60},{name:'3×90',xp:42,lvl:3,timer:90},{name:'3×2 мин',xp:75,lvl:5,timer:120},{name:'5×3 мин',xp:140,lvl:7,timer:180}]},
{id:'stretch',cat:'body',icon:'🧘‍♂️',name:'Растяжка',timer:600,tiers:[{name:'10 мин',xp:10,lvl:1,timer:600},{name:'20 мин',xp:20,lvl:2,timer:1200},{name:'30 мин',xp:35,lvl:3,timer:1800},{name:'45 мин',xp:60,lvl:5,timer:2700},{name:'60 мин',xp:100,lvl:6,timer:3600}]},
{id:'run',cat:'body',icon:'🏃',name:'Пробежка',timer:1200,tiers:[{name:'2 км',xp:20,lvl:2,timer:1200},{name:'5 км',xp:35,lvl:3,timer:1800},{name:'8 км',xp:55,lvl:4,timer:2400},{name:'10 км',xp:80,lvl:5,timer:3000},{name:'Полумарафон',xp:200,lvl:7,timer:7200}]},
{id:'hiit',cat:'body',icon:'⚡',name:'HIIT',timer:600,tiers:[{name:'10 мин',xp:20,lvl:3,timer:600},{name:'15 мин',xp:30,lvl:3,timer:900},{name:'20 мин',xp:42,lvl:4,timer:1200},{name:'30 мин',xp:65,lvl:5,timer:1800},{name:'45 мин',xp:110,lvl:7,timer:2700}]},
{id:'iron',cat:'body',icon:'🏋️‍♂️',name:'Силовая',timer:1800,tiers:[{name:'Базовая',xp:25,lvl:4,timer:1800},{name:'Средняя',xp:45,lvl:5,timer:2700},{name:'Интенсив',xp:75,lvl:6,timer:3600},{name:'Тяжёлая',xp:120,lvl:7,timer:5400},{name:'Соревн.',xp:200,lvl:7,timer:7200}]},
{id:'meditate',cat:'mind',icon:'🧘',name:'Медитация',timer:300,tiers:[{name:'5 мин',xp:10,lvl:0,timer:300},{name:'10 мин',xp:20,lvl:1,timer:600},{name:'15 мин',xp:30,lvl:2,timer:900},{name:'25 мин',xp:50,lvl:3,timer:1500},{name:'45 мин',xp:90,lvl:5,timer:2700}]},
{id:'read',cat:'mind',icon:'📖',name:'Чтение',timer:600,tiers:[{name:'10 стр',xp:10,lvl:0,timer:600},{name:'20 стр',xp:18,lvl:0,timer:1200},{name:'30 стр',xp:28,lvl:1,timer:1800},{name:'50 стр',xp:45,lvl:3,timer:3000},{name:'100 стр',xp:85,lvl:5,timer:6000}]},
{id:'journal',cat:'mind',icon:'✍️',name:'Дневник',timer:300,tiers:[{name:'3 строки',xp:10,lvl:0,timer:60},{name:'Страница',xp:20,lvl:1,timer:300},{name:'Разбор',xp:30,lvl:2,timer:600},{name:'Анализ',xp:50,lvl:4,timer:1800},{name:'Час',xp:90,lvl:6,timer:3600}]},
{id:'grat',cat:'mind',icon:'🙏',name:'Благодарность',timer:0,tiers:[{name:'3 вещи',xp:10,lvl:1},{name:'5 вещей',xp:15,lvl:2},{name:'10 вещей',xp:28,lvl:3},{name:'Письмо',xp:50,lvl:4},{name:'Мета',xp:85,lvl:6}]},
{id:'learn',cat:'mind',icon:'🎓',name:'Обучение',timer:900,tiers:[{name:'15 мин',xp:15,lvl:2,timer:900},{name:'30 мин',xp:28,lvl:2,timer:1800},{name:'1 час',xp:42,lvl:3,timer:3600},{name:'2 часа',xp:75,lvl:5,timer:7200},{name:'4 часа',xp:140,lvl:7,timer:14400}]},
{id:'deepwork',cat:'mind',icon:'🔥',name:'Глубокая работа',timer:3600,tiers:[{name:'1 час',xp:25,lvl:3,timer:3600},{name:'2 часа',xp:45,lvl:4,timer:7200},{name:'3 часа',xp:70,lvl:5,timer:10800},{name:'4 часа',xp:110,lvl:6,timer:14400},{name:'6 часов',xp:200,lvl:7,timer:21600}]},
{id:'observer',cat:'spirit',icon:'👁️',name:'Наблюдатель',timer:600,tiers:[{name:'3 мысли',xp:15,lvl:3,timer:60},{name:'10 мин',xp:28,lvl:4,timer:600},{name:'30 мин',xp:50,lvl:5,timer:1800},{name:'День',xp:90,lvl:6,timer:28800},{name:'Постоянно',xp:180,lvl:7,timer:43200}]},
{id:'metta',cat:'spirit',icon:'✨',name:'Мета-медитация',timer:300,tiers:[{name:'5 мин',xp:15,lvl:3,timer:300},{name:'10 мин',xp:30,lvl:4,timer:600},{name:'20 мин',xp:55,lvl:5,timer:1200},{name:'40 мин',xp:110,lvl:6,timer:2400},{name:'60 мин',xp:200,lvl:7,timer:3600}]},
{id:'solitude',cat:'spirit',icon:'🏔️',name:'Уединение',timer:3600,tiers:[{name:'1 час',xp:20,lvl:3,timer:3600},{name:'3 часа',xp:40,lvl:4,timer:10800},{name:'Полдня',xp:75,lvl:5,timer:14400},{name:'День',xp:150,lvl:6,timer:28800},{name:'Уик-энд',xp:300,lvl:7,timer:86400}]},
{id:'whoami',cat:'spirit',icon:'🕉️',name:'Кто я?',timer:1800,tiers:[{name:'10 раз',xp:20,lvl:4,timer:300},{name:'30 мин',xp:45,lvl:5,timer:1800},{name:'1 час',xp:80,lvl:6,timer:3600},{name:'3 часа',xp:160,lvl:7,timer:10800},{name:'День',xp:350,lvl:7,timer:28800}]},
{id:'cosmos',cat:'spirit',icon:'🌟',name:'Единство',timer:900,tiers:[{name:'15 мин',xp:20,lvl:4,timer:900},{name:'Раствориться',xp:40,lvl:5,timer:1800},{name:'Медитация',xp:70,lvl:6,timer:3600},{name:'1 час',xp:130,lvl:7,timer:3600},{name:'Глубокое',xp:250,lvl:7,timer:7200}]},
{id:'water',cat:'health',icon:'💧',name:'Вода',timer:0,tiers:[{name:'1 л',xp:10,lvl:0},{name:'1.5 л',xp:18,lvl:1},{name:'2 л',xp:28,lvl:2},{name:'2.5 л',xp:45,lvl:3},{name:'3 л',xp:70,lvl:5}]},
{id:'sleep',cat:'health',icon:'😴',name:'Сон',timer:0,tiers:[{name:'7ч',xp:15,lvl:0},{name:'7.5ч',xp:22,lvl:1},{name:'8ч',xp:35,lvl:2},{name:'8.5ч',xp:55,lvl:4},{name:'9ч',xp:90,lvl:6}]},
{id:'sun',cat:'health',icon:'☀️',name:'Солнце',timer:600,tiers:[{name:'10 мин',xp:10,lvl:0,timer:600},{name:'20 мин',xp:18,lvl:1,timer:1200},{name:'30 мин',xp:28,lvl:2,timer:1800},{name:'1 час',xp:50,lvl:4,timer:3600},{name:'День',xp:120,lvl:6,timer:28800}]},
{id:'cleanfood',cat:'health',icon:'🥗',name:'Чистое питание',timer:0,tiers:[{name:'1 день',xp:15,lvl:0},{name:'2 дня',xp:28,lvl:1},{name:'3 дня',xp:45,lvl:2},{name:'Неделя',xp:120,lvl:5},{name:'30 дней',xp:400,lvl:7}]},
{id:'noscreen',cat:'health',icon:'📴',name:'Детокс',timer:3600,tiers:[{name:'1 час',xp:10,lvl:0,timer:3600},{name:'3 часа',xp:20,lvl:1,timer:10800},{name:'Полдня',xp:40,lvl:2,timer:14400},{name:'День',xp:80,lvl:4,timer:28800},{name:'48 часов',xp:180,lvl:7,timer:172800}]},
{id:'sauna',cat:'health',icon:'🔥',name:'Сауна',timer:600,tiers:[{name:'10 мин',xp:15,lvl:2,timer:600},{name:'15 мин',xp:25,lvl:3,timer:900},{name:'20 мин',xp:40,lvl:4,timer:1200},{name:'30 мин',xp:65,lvl:5,timer:1800},{name:'2 часа',xp:120,lvl:7,timer:7200}]}];

/* ============================================================
   АСКЕЗЫ
============================================================ */
var ASKESIS=[
{id:'ask_water',name:'💧 Только вода',targetDays:3,xp:50,diff:'easy',blockH:12},
{id:'ask_nosugar',name:'🍬 Без сахара',targetDays:7,xp:120,diff:'easy',blockH:12},
{id:'ask_nophone',name:'📵 Без соцсетей',targetDays:7,xp:130,diff:'easy',blockH:12},
{id:'ask_cold',name:'🥶 Холодный душ',targetDays:14,xp:250,diff:'medium',blockH:24},
{id:'ask_med14',name:'🧘 Медитация 14',targetDays:14,xp:250,diff:'medium',blockH:24},
{id:'ask_silence',name:'🤫 Тишина 21',targetDays:21,xp:400,diff:'medium',blockH:24},
{id:'ask_wake5',name:'🌅 Подъём 5:00',targetDays:30,xp:700,diff:'hard',blockH:48},
{id:'ask_monk',name:'⛩ Монах 90',targetDays:90,xp:2500,diff:'hard',blockH:48}];

/* ============================================================
   КВЕСТЫ ПО СЛОЖНОСТИ
============================================================ */
var QUEST_POOL={
easy:[
{id:'qe_breath',icon:'🌬️',name:'Дыхание',desc:'1 дыхательная практика',reward:25,check:function(s){return todayCatCount(s,'breath')>=1;},target:1,cur:function(s){return todayCatCount(s,'breath');}},
{id:'qe_water',icon:'💧',name:'Вода',desc:'Выпей норму воды',reward:20,check:function(s){return s.todayDone.indexOf('water')>=0;},target:1,cur:function(s){return s.todayDone.indexOf('water')>=0?1:0;}},
{id:'qe_3prac',icon:'⭐',name:'Три практики',desc:'Выполни 3 практики',reward:35,check:function(s){return s.todayDone.length>=3;},target:3,cur:function(s){return s.todayDone.length;}},
{id:'qe_med',icon:'🧘',name:'Медитация',desc:'5+ минут',reward:30,check:function(s){return s.todayDone.indexOf('meditate')>=0;},target:1,cur:function(s){return s.todayDone.indexOf('meditate')>=0?1:0;}},
{id:'qe_walk',icon:'🚶',name:'Прогулка',desc:'5000+ шагов',reward:25,check:function(s){return s.todayDone.indexOf('walk')>=0;},target:1,cur:function(s){return s.todayDone.indexOf('walk')>=0?1:0;}}
],
medium:[
{id:'qm_5prac',icon:'🏆',name:'5 побед',desc:'Выполни 5 практик',reward:70,check:function(s){return s.todayDone.length>=5;},target:5,cur:function(s){return s.todayDone.length;}},
{id:'qm_body',icon:'💪',name:'Тело',desc:'3 телесные практики',reward:80,check:function(s){return todayCatCount(s,'body')>=3;},target:3,cur:function(s){return todayCatCount(s,'body');}},
{id:'qm_cold',icon:'🚿',name:'Холод',desc:'Холодный душ 2+ мин',reward:75,check:function(s){return s.todayDone.indexOf('cold')>=0;},target:1,cur:function(s){return s.todayDone.indexOf('cold')>=0?1:0;}},
{id:'qm_silence',icon:'🤫',name:'Тишина',desc:'Час тишины',reward:90,check:function(s){return s.todayDone.indexOf('silence')>=0;},target:1,cur:function(s){return s.todayDone.indexOf('silence')>=0?1:0;}},
{id:'qm_deep',icon:'🔥',name:'Глубина',desc:'1+ час фокуса',reward:85,check:function(s){return s.todayDone.indexOf('deepwork')>=0;},target:1,cur:function(s){return s.todayDone.indexOf('deepwork')>=0?1:0;}}
],
hard:[
{id:'qh_7prac',icon:'👑',name:'7 дел',desc:'Выполни 7+ практик',reward:180,check:function(s){return s.todayDone.length>=7;},target:7,cur:function(s){return s.todayDone.length;}},
{id:'qh_multi',icon:'🌟',name:'4 стихии',desc:'Все 4 категории',reward:200,check:function(s){return todayCatCount(s,'disc')>=1&&todayCatCount(s,'body')>=1&&todayCatCount(s,'mind')>=1&&todayCatCount(s,'spirit')>=1;},target:4,cur:function(s){var c=0;if(todayCatCount(s,'disc')>0)c++;if(todayCatCount(s,'body')>0)c++;if(todayCatCount(s,'mind')>0)c++;if(todayCatCount(s,'spirit')>0)c++;return c;}},
{id:'qh_solitude',icon:'🏔️',name:'Уединение',desc:'3+ часа один',reward:220,check:function(s){return s.todayDone.indexOf('solitude')>=0;},target:1,cur:function(s){return s.todayDone.indexOf('solitude')>=0?1:0;}},
{id:'qh_fast',icon:'⏳',name:'Голодание 16ч',desc:'Полный пост',reward:240,check:function(s){return s.todayDone.indexOf('fast')>=0;},target:1,cur:function(s){return s.todayDone.indexOf('fast')>=0?1:0;}},
{id:'qh_5cat',icon:'⚡',name:'5 категорий',desc:'Практики из 5 категорий',reward:260,check:function(s){var c=0;if(todayCatCount(s,'disc')>0)c++;if(todayCatCount(s,'breath')>0)c++;if(todayCatCount(s,'body')>0)c++;if(todayCatCount(s,'mind')>0)c++;if(todayCatCount(s,'spirit')>0)c++;return c>=5;},target:5,cur:function(s){var c=0;if(todayCatCount(s,'disc')>0)c++;if(todayCatCount(s,'breath')>0)c++;if(todayCatCount(s,'body')>0)c++;if(todayCatCount(s,'mind')>0)c++;if(todayCatCount(s,'spirit')>0)c++;return c;}}
]};

/* ============================================================
   ПУТЬ ПРОБУЖДЕНИЯ + ПРЕГРАДЫ
============================================================ */
var AWAKENING_PATH=[
{n:1,icon:'🌱',title:'Пробуждение',subtitle:'Первые шаги',desc:'Начало.',reqs:[{type:'totalDone',value:5,label:'5 практик'},{type:'streak',value:3,label:'Стрик 3'}]},
{n:2,icon:'💧',title:'Очищение',subtitle:'Убираем шум',desc:'Тишина.',reqs:[{type:'totalDone',value:25,label:'25 практик'},{type:'streak',value:7,label:'Стрик 7'}]},
{n:3,icon:'🔥',title:'Ковка',subtitle:'Тело и воля',desc:'Сила.',reqs:[{type:'totalDone',value:60,label:'60 практик'},{type:'streak',value:14,label:'Стрик 14'}]},
{n:4,icon:'🌊',title:'Поток',subtitle:'Осознанность',desc:'Легкость.',reqs:[{type:'totalDone',value:120,label:'120 практик'},{type:'streak',value:21,label:'Стрик 21'}]},
{n:5,icon:'👁️',title:'Свидетель',subtitle:'Наблюдатель',desc:'Ясность.',reqs:[{type:'totalDone',value:250,label:'250 практик'},{type:'streak',value:30,label:'Стрик 30'}]},
{n:6,icon:'☀️',title:'Единство',subtitle:'Растворение',desc:'Свобода.',reqs:[{type:'totalDone',value:500,label:'500 практик'},{type:'streak',value:60,label:'Стрик 60'}]},
{n:7,icon:'🌟',title:'Сотворчество',subtitle:'Творец',desc:'Полное.',reqs:[{type:'totalDone',value:1000,label:'1000 практик'},{type:'streak',value:100,label:'Стрик 100'}]}];

var BARRIERS_DATA=[
{id:'fear',name:'Страхи',icon:'😰',tag:'Первый рубеж',desc:'Страх отказа, неудачи.',hint:'Действуй вопреки.',reqXp:150,subtasks:['Сделать 1 отказ','Поговорить с незнакомцем','Выступить публично']},
{id:'complexes',name:'Комплексы',icon:'🪞',tag:'Второй рубеж',desc:'Неуверенность.',hint:'Ты — не мысли.',reqXp:400,subtasks:['Похвалить себя 3 раза','Записать 3 достижения','Принять комплимент']},
{id:'addictions',name:'Зависимости',icon:'⛓️',tag:'Третий рубеж',desc:'Телефон, сахар.',hint:'Заменяй.',reqXp:800,subtasks:['1 день без соцсетей','Заменить привычку','Продержаться неделю']},
{id:'laziness',name:'Лень',icon:'😴',tag:'Четвёртый',desc:'Потом.',hint:'Правило 2 минут.',reqXp:1400,subtasks:['Сделать откладываемое','Утренняя зарядка','Правило 2 минут 5 раз']},
{id:'chaos',name:'Хаос',icon:'🌪️',tag:'Пятый',desc:'Разбросанность.',hint:'Медитация.',reqXp:2200,subtasks:['Медитация 20 мин','Одна задача 2 часа','Порядок на столе']},
{id:'doubt',name:'Сомнения',icon:'🌫️',tag:'Шестой',desc:'А правильно ли?',hint:'Действие лечит.',reqXp:3200,subtasks:['Принять решение','Не менять 7 дней','Записать 3 результата']},
{id:'ego',name:'Эго',icon:'👁️',tag:'Финальный',desc:'Я лучше.',hint:'Служение.',reqXp:5000,subtasks:['Помочь кому-то','Поблагодарить 5 раз','Сказать «я не знаю»']}];

var GRAND_GOALS_TEMPLATES=[
{id:'quit_smoking',icon:'🚭',title:'Бросить курить',milestones:['Решить','Дата','Сказать близким','Выбросить','День 1','День 3','Неделя','2 недели','Месяц','Спорт','Я не курю']},
{id:'quit_alcohol',icon:'🍷',title:'Бросить алкоголь',milestones:['Признать','Триггеры','Избегать компаний','День 1','Неделя','Трезвый вечер','Месяц','Замена','3 мес','Год']},
{id:'quit_sugar',icon:'🍬',title:'Бросить сахар',milestones:['Убрать напитки','Не покупать','Заменить','День 1','3 дня','Неделя','2 недели','Месяц','Свобода']},
{id:'start_run',icon:'🏃',title:'Начать бегать',milestones:['Кроссовки','500м','1км','2км','3км','4км','5км','10км','Забег']},
{id:'gym',icon:'💪',title:'Спортзал',milestones:['Абонемент','План','1 трен','Неделя','Месяц','Прогресс','2 мес','3 мес','Новое тело']}];

/* ============================================================
   КОЛЛЕКЦИОННЫЕ КАРТОЧКИ (24)
============================================================ */
var COLLECTION_CARDS=[
{id:'c_first',icon:'🌱',name:'Первый шаг',rarity:'common',desc:'Начало пути',unlock:function(s){return s.totalDone>=1;}},
{id:'c_10',icon:'⚡',name:'10 практик',rarity:'common',desc:'Набираешь темп',unlock:function(s){return s.totalDone>=10;}},
{id:'c_50',icon:'💪',name:'50 практик',rarity:'rare',desc:'Половина сотни',unlock:function(s){return s.totalDone>=50;}},
{id:'c_100',icon:'🚀',name:'100 практик',rarity:'rare',desc:'Сотня!',unlock:function(s){return s.totalDone>=100;}},
{id:'c_500',icon:'🛸',name:'500 практик',rarity:'epic',desc:'Мастер',unlock:function(s){return s.totalDone>=500;}},
{id:'c_1000',icon:'👑',name:'1000 практик',rarity:'legendary',desc:'Сотворцом',unlock:function(s){return s.totalDone>=1000;}},
{id:'c_streak3',icon:'🔥',name:'Огонь',rarity:'common',desc:'Стрик 3',unlock:function(s){return s.maxStreak>=3;}},
{id:'c_streak7',icon:'💫',name:'Неделя',rarity:'rare',desc:'Стрик 7',unlock:function(s){return s.maxStreak>=7;}},
{id:'c_streak30',icon:'💎',name:'Месяц',rarity:'epic',desc:'Стрик 30',unlock:function(s){return s.maxStreak>=30;}},
{id:'c_streak100',icon:'👑',name:'Сотка дней',rarity:'legendary',desc:'Стрик 100',unlock:function(s){return s.maxStreak>=100;}},
{id:'c_level5',icon:'⚔️',name:'Воин',rarity:'rare',desc:'Уровень 4',unlock:function(s){return getLevel(s.xpEarned)>=3;}},
{id:'c_level7',icon:'🏆',name:'Мастер',rarity:'epic',desc:'Уровень 6',unlock:function(s){return getLevel(s.xpEarned)>=5;}},
{id:'c_level9',icon:'✨',name:'Просветлённый',rarity:'legendary',desc:'Уровень 9',unlock:function(s){return getLevel(s.xpEarned)>=8;}},
{id:'c_pet1',icon:'🐣',name:'Первый питомец',rarity:'common',desc:'Получен',unlock:function(s){return (s.pets&&s.pets.owned&&s.pets.owned.length)>=1;}},
{id:'c_pet6',icon:'🐲',name:'Зоопарк',rarity:'epic',desc:'6 питомцев',unlock:function(s){return (s.pets&&s.pets.owned&&s.pets.owned.length)>=6;}},
{id:'c_pet12',icon:'🌟',name:'Все 12',rarity:'legendary',desc:'12 питомцев',unlock:function(s){return (s.pets&&s.pets.owned&&s.pets.owned.length)>=12;}},
{id:'c_mood7',icon:'📔',name:'Душа',rarity:'common',desc:'7 отметок настроения',unlock:function(s){return Object.keys(s.moods||{}).length>=7;}},
{id:'c_mood30',icon:'💜',name:'Хранитель',rarity:'rare',desc:'30 отметок',unlock:function(s){return Object.keys(s.moods||{}).length>=30;}},
{id:'c_boss1',icon:'⚔️',name:'Первый босс',rarity:'common',desc:'Победа',unlock:function(s){return (s.bossesDefeated||0)>=1;}},
{id:'c_boss5',icon:'🐲',name:'5 боссов',rarity:'epic',desc:'Разрушитель',unlock:function(s){return (s.bossesDefeated||0)>=5;}},
{id:'c_build3',icon:'🏗️',name:'Зодчий',rarity:'rare',desc:'3 здания',unlock:function(s){return (s.buildings||[]).length>=3;}},
{id:'c_chest25',icon:'📦',name:'25 сундуков',rarity:'rare',desc:'Кладоискатель',unlock:function(s){return (s.chestsOpened||0)>=25;}},
{id:'c_legendary',icon:'🔮',name:'Легендарный',rarity:'legendary',desc:'Из легендарного сундука',unlock:function(s){return (s.legendaryChests||0)>=1;}},
{id:'c_profile',icon:'👤',name:'Личность',rarity:'common',desc:'Заполнил профиль',unlock:function(s){return !!(s.profile&&s.profile.onboardingComplete);}},
{id:'c_wins10',icon:'🏆',name:'10 побед',rarity:'rare',desc:'Дневник побед',unlock:function(s){return (s.wins||[]).length>=10;}},
{id:'c_balance',icon:'⚖️',name:'Баланс',rarity:'rare',desc:'Заполнил колесо',unlock:function(s){return !!(s.balance&&Object.keys(s.balance).length>=4);}},
{id:'c_reflection7',icon:'💭',name:'Рефлексия',rarity:'rare',desc:'7 вечеров рефлексии',unlock:function(s){return Object.keys(s.reflections||{}).length>=7;}},
{id:'c_savings',icon:'💰',name:'Копилка',rarity:'common',desc:'1-я копилка',unlock:function(s){return (s.savings||[]).length>=1;}}
];

/* ============================================================
   РЕЦЕПТЫ (по цели)
============================================================ */
var RECIPES={
lose:[
{cat:'breakfast',name:'Овсянка с ягодами',cal:280,protein:12,fat:6,carbs:45,ingredients:'Овсянка 50г + черника 100г + греческий йогурт 100г'},
{cat:'breakfast',name:'Омлет с овощами',cal:250,protein:20,fat:16,carbs:6,ingredients:'2 яйца + шпинат + помидор'},
{cat:'breakfast',name:'Творог с яблоком',cal:180,protein:18,fat:5,carbs:15,ingredients:'Творог 5% 150г + яблоко'},
{cat:'lunch',name:'Курица с гречкой',cal:420,protein:38,fat:10,carbs:42,ingredients:'Куриная грудка 150г + гречка 60г + овощи'},
{cat:'lunch',name:'Индейка с рисом',cal:400,protein:35,fat:8,carbs:48,ingredients:'Индейка 150г + рис 60г'},
{cat:'dinner',name:'Рыба с салатом',cal:350,protein:35,fat:14,carbs:12,ingredients:'Треска 180г + зелёный салат'},
{cat:'dinner',name:'Тушёные овощи с тофу',cal:280,protein:18,fat:12,carbs:22,ingredients:'Тофу 150г + кабачок + перец'},
{cat:'snack',name:'Греческий йогурт',cal:200,protein:14,fat:12,carbs:10,ingredients:'Йогурт 150г + грецкие орехи'},
{cat:'snack',name:'Смузи зелёный',cal:150,protein:6,fat:2,carbs:28,ingredients:'Шпинат + банан + яблоко'}
],
gain:[
{cat:'breakfast',name:'Овсянка с бананом',cal:520,protein:16,fat:18,carbs:72,ingredients:'Овсянка 80г + банан + арахисовое масло'},
{cat:'breakfast',name:'Яичница с беконом',cal:560,protein:28,fat:38,carbs:28,ingredients:'3 яйца + бекон + тост'},
{cat:'lunch',name:'Рис с курицей',cal:650,protein:45,fat:18,carbs:72,ingredients:'Курица 200г + рис 100г + овощи'},
{cat:'lunch',name:'Паста с мясом',cal:700,protein:40,fat:22,carbs:82,ingredients:'Паста 120г + фарш 150г'},
{cat:'lunch',name:'Стейк с картофелем',cal:680,protein:50,fat:32,carbs:48,ingredients:'Стейк 200г + картофель 200г'},
{cat:'dinner',name:'Курица с рисом',cal:620,protein:45,fat:15,carbs:70,ingredients:'Курица 200г + рис 100г'},
{cat:'snack',name:'Протеиновый коктейль',cal:420,protein:35,fat:14,carbs:42,ingredients:'Протеин 30г + молоко 300мл + банан'},
{cat:'snack',name:'Творог с мёдом',cal:380,protein:24,fat:18,carbs:32,ingredients:'Творог 200г + мёд + орехи'}
],
maintain:[
{cat:'breakfast',name:'Овсянка с ягодами',cal:350,protein:14,fat:10,carbs:52,ingredients:'Овсянка 60г + ягоды + орехи'},
{cat:'breakfast',name:'Омлет с авокадо',cal:380,protein:20,fat:26,carbs:14,ingredients:'2 яйца + авокадо + помидор'},
{cat:'lunch',name:'Курица с рисом и овощами',cal:520,protein:38,fat:14,carbs:58,ingredients:'Курица 150г + рис 80г + овощи'},
{cat:'lunch',name:'Салат с рыбой',cal:450,protein:32,fat:22,carbs:28,ingredients:'Лосось 150г + микс салата'},
{cat:'dinner',name:'Тушёные овощи с курицей',cal:420,protein:35,fat:16,carbs:32,ingredients:'Курица 150г + овощи'},
{cat:'dinner',name:'Рыба на пару',cal:380,protein:38,fat:14,carbs:22,ingredients:'Белая рыба 180г + брокколи'},
{cat:'snack',name:'Творог с ягодами',cal:220,protein:18,fat:8,carbs:18,ingredients:'Творог 150г + ягоды'},
{cat:'snack',name:'Яблоко с орехами',cal:180,protein:4,fat:12,carbs:14,ingredients:'Яблоко + миндаль'}
],
recomp:[
{cat:'breakfast',name:'Яйца с овощами',cal:320,protein:22,fat:20,carbs:12,ingredients:'3 яйца + шпинат + помидор'},
{cat:'breakfast',name:'Овсянка с протеином',cal:380,protein:28,fat:8,carbs:48,ingredients:'Овсянка 50г + протеин 20г'},
{cat:'lunch',name:'Индейка с булгуром',cal:480,protein:42,fat:14,carbs:46,ingredients:'Индейка 180г + булгур 60г'},
{cat:'lunch',name:'Курица с киноа',cal:500,protein:40,fat:16,carbs:48,ingredients:'Курица 180г + киноа 60г'},
{cat:'dinner',name:'Рыба с киноа',cal:450,protein:38,fat:16,carbs:38,ingredients:'Белая рыба 180г + киноа 60г'},
{cat:'dinner',name:'Тофу с овощами',cal:380,protein:28,fat:18,carbs:24,ingredients:'Тофу 200г + овощи'},
{cat:'snack',name:'Творог с орехами',cal:250,protein:22,fat:12,carbs:12,ingredients:'Творог 180г + грецкие орехи'},
{cat:'snack',name:'Протеиновый смузи',cal:280,protein:26,fat:8,carbs:28,ingredients:'Протеин + молоко + ягоды'}
]};

/* ============================================================
   ТРЕНИРОВКИ ПО ЦЕЛИ
============================================================ */
var WORKOUT_PROGRAMS={
lose:[
{name:'Лёгкое кардио',level:'Новичок',duration:'20 мин',desc:'Ходьба, велосипед, эллипс',exercises:['Разминка 3 мин','Кардио 15 мин','Заминка 2 мин']},
{name:'Интервальная',level:'Средний',duration:'30 мин',desc:'HIIT для жиросжигания',exercises:['Разминка 5 мин','8 циклов: 30 сек работа / 30 сек отдых','Заминка 5 мин']},
{name:'Кардио + силовая',level:'Продвинутый',duration:'45 мин',desc:'Комбинированная',exercises:['Разминка 5 мин','Кардио 20 мин','Силовая 15 мин','Заминка 5 мин']}
],
gain:[
{name:'Базовые упражнения',level:'Новичок',duration:'40 мин',desc:'3 упражнения, 3 подхода',exercises:['Жим лёжа 3×10','Приседания 3×12','Становая 3×8']},
{name:'Сплит верх/низ',level:'Средний',duration:'50 мин',desc:'4 дня в неделю',exercises:['Верх: жим, тяга, жим стоя','Низ: приседания, румынская тяга','Прогрессия каждую неделю']},
{name:'Силовой цикл 5×5',level:'Продвинутый',duration:'60 мин',desc:'Классика силы',exercises:['Приседания 5×5','Жим лёжа 5×5','Становая 1×5']}
],
maintain:[
{name:'Круговая',level:'Новичок',duration:'30 мин',desc:'3 круга по 5 упражнений',exercises:['Отжимания 10','Приседания 15','Планка 30 сек','Выпады 10','Скручивания 15']},
{name:'Функциональный',level:'Средний',duration:'40 мин',desc:'Все группы',exercises:['Бёрпи 3×10','Прыжки 3×15','Отжимания 3×12','Планка 3×45']},
{name:'Смешанная',level:'Продвинутый',duration:'50 мин',desc:'Сила + выносливость',exercises:['Силовая 25 мин','Кардио 20 мин','Растяжка 5 мин']}
],
recomp:[
{name:'Силовая для рельефа',level:'Новичок',duration:'35 мин',desc:'Многоповторка',exercises:['Приседания 3×15','Отжимания 3×12','Тяга гантелей 3×12']},
{name:'HIIT + силовая',level:'Средний',duration:'45 мин',desc:'Жиросжигание',exercises:['HIIT 15 мин','Силовая 20 мин','Растяжка 10 мин']},
{name:'Программа на рельеф',level:'Продвинутый',duration:'55 мин',desc:'5 дней в неделю',exercises:['Верх силовая','Низ силовая','HIIT','Круговая','Растяжка']}
]};

/* ============================================================
   БАЗЫ ЗНАНИЙ
============================================================ */
var KNOWLEDGE_BASE=[
{cat:'🌬️ Дыхание',items:[
{name:'4-7-8',what:'Вдох 4 · задержка 7 · выдох 8.',benefits:['Парасимпатическая','Меньше тревоги','Заснуть','Давление'],how:'Вдох носом 4, задержка 7, выдох ртом 8.',when:'Перед сном.'},
{name:'Квадратное',what:'4-4-4-4.',benefits:['Фокус','Спецназ','Баланс','Контроль'],how:'4 вдох → 4 держишь → 4 выдох → 4 держишь.',when:'Перед встречей.'},
{name:'Вима Хофа',what:'30 быстрых вдохов.',benefits:['Энергия','Иммунитет','Холод'],how:'30 вдохов, задержка. 3-4 раунда.',when:'Утром.'},
{name:'Нади Шодхана',what:'Попеременное.',benefits:['Баланс','Успокоение','Ясность'],how:'Правая→левая поочерёдно.',when:'Перед медитацией.'}]},
{cat:'🧘 Медитация',items:[
{name:'Наблюдение',what:'За дыханием.',benefits:['Префронтальная кора','Тревога','Память'],how:'Сядь. Глаза закрыты. Мысли приходят — вернись.',when:'Утром и вечером.'},
{name:'Мета',what:'Пожелание счастья.',benefits:['Одиночество','Эмпатия','Связи'],how:'Себе → близкому → врагу.',when:'Утром.'},
{name:'Сканирование',what:'Внимание по телу.',benefits:['Напряжение','Сон','В теле'],how:'Стопы → голова. 15-20 мин.',when:'Перед сном.'}]},
{cat:'⚔️ Дисциплина',items:[
{name:'Холодный душ',what:'30 сек — 3 мин холода.',benefits:['Дофамин +250%','Жир','Настроение'],how:'После душа выключай горячую.',when:'Утром.'},
{name:'Ранний подъём',what:'5-7 утра.',benefits:['Дофамин','Тишина','Ритмы'],how:'Ложись в 22:00.',when:'Ежедневно.'},
{name:'Голодание',what:'Окно 8ч, голод 16ч.',benefits:['Аутофагия','Инсулин','Кетоны'],how:'С 12ч → 16ч.',when:'Ежедневно.'}]},
{cat:'💪 Тело',items:[
{name:'Отжимания',what:'Базовая сила.',benefits:['Сила','Осанка','Тестостерон'],how:'3×10 → 5×50.',when:'Утром.'},
{name:'Приседания',what:'Ноги, ягодицы.',benefits:['Гормон роста','Метаболизм'],how:'3×20 → 100+.',when:'Ежедневно.'},
{name:'Планка',what:'Статика на кор.',benefits:['Спина','Поясница'],how:'30→120 сек.',when:'Утром.'}]},
{cat:'🧠 Разум',items:[
{name:'Глубокая работа',what:'Фокус.',benefits:['+500%','Мастерство'],how:'2-4 часа без телефона.',when:'Утром.'},
{name:'Дневник',what:'Рефлексия.',benefits:['Ясность','Паттерны'],how:'Вечером.',when:'Вечером.'},
{name:'Чтение',what:'С карандашом.',benefits:['Знания','Словарь'],how:'20-30 страниц.',when:'Утром.'}]},
{cat:'✨ Дух',items:[
{name:'Наблюдатель',what:'Ты не мысли.',benefits:['Свобода','Страх','Покой'],how:'Кто я?',when:'При эмоциях.'},
{name:'Уединение',what:'В тишине.',benefits:['Понимание','Ответы'],how:'С 1 часа.',when:'Раз в неделю.'}]},
{cat:'💚 Здоровье',items:[
{name:'Сон',what:'Фундамент.',benefits:['Гормоны','Иммунитет'],how:'Одно время.',when:'Ежедневно.'},
{name:'Вода',what:'Мозг 75%.',benefits:['Ясность','Энергия'],how:'30 мл/кг.',when:'Всегда.'},
{name:'Солнце',what:'Витамин D.',benefits:['Настроение','Иммунитет'],how:'15-30 мин.',when:'Утром.'}]}];

var HEALTH_BASE=[
{cat:'🚭 Зависимости',items:[
{name:'Курение',what:'Никотин.',mechanism:'Дофамин выше нормы.',steps:['Дата','Выбросить','Близким','Замена','4-7-8','Спорт'],when:'1-9 мес.'},
{name:'Сахар',what:'Легальный наркотик.',mechanism:'Инсулиновые скачки.',steps:['Убрать напитки','Не покупать','Заменить','21 день'],when:'2-3 нед.'},
{name:'Соцсети',what:'Убивают внимание.',mechanism:'Всплески дофамина.',steps:['Удалить','Телефон далеко','Серый','Замена'],when:'2 нед.'},
{name:'Кофеин',what:'Зависимость.',mechanism:'Аденозин.',steps:['Снижать','до 12:00','Цикорий'],when:'2-3 нед.'}]},
{cat:'🧠 Страхи',items:[
{name:'Страх отказа',what:'Нет.',mechanism:'Соц. смерть.',steps:['Практика','1 просьба','Дневник'],when:'10 отказов.'},
{name:'Выступления',what:'Говорить.',mechanism:'Адреналин.',steps:['Готовиться','4-7-8','Практика'],when:'5-10.'},
{name:'Самозванец',what:'Обманщик.',mechanism:'Перфекционизм.',steps:['Записывать','Не сравнивать','Помогать'],when:'Через доказательства.'}]},
{cat:'💚 ЗОЖ',items:[
{name:'Сон',what:'Фундамент.',mechanism:'Кортизол+.',steps:['Одно время','Темно','Без экранов','Кофе до 12'],when:'2-3 нед.'},
{name:'Питание',what:'Еда — инфо.',mechanism:'Скачки.',steps:['Состав','Белок','Овощи','Сахар off'],when:'1-2 мес.'},
{name:'Движение',what:'Мышцы — орган.',mechanism:'BDNF+.',steps:['8000-10000','Каждый час','Силовые'],when:'3 мес.'},
{name:'Стресс',what:'Хронический убивает.',mechanism:'Кортизол.',steps:['4-7-8','Медитация','Спорт','Природа'],when:'2-4 нед.'}]}];

/* ============================================================
   КАРТЫ ДНЯ, АФФИРМАЦИИ, ЦИТАТЫ, КНИГИ, КУРСЫ
============================================================ */
var CARD_TEMPLATES=[
{id:'c_breath',icon:'🌬️',title:'Дыхание ветра',desc:'5 мин 4-7-8.',reward:60,action:'Дыхание 4-7-8',checkId:'breath478'},
{id:'c_cold',icon:'❄️',title:'Ледяное',desc:'Душ 1 мин.',reward:60,action:'Холодный душ',checkId:'cold'},
{id:'c_silence',icon:'🤫',title:'Час тишины',desc:'Час без телефона.',reward:70,action:'Час тишины',checkId:'silence'},
{id:'c_run',icon:'🏃',title:'Бег ветра',desc:'3 км.',reward:80,action:'Пробежка',checkId:'run'},
{id:'c_med',icon:'🧘',title:'Покой',desc:'15+ мин.',reward:60,action:'Медитация',checkId:'meditate'},
{id:'c_write',icon:'✍️',title:'Слово',desc:'Страница.',reward:55,action:'Дневник',checkId:'journal'},
{id:'c_grat',icon:'🙏',title:'Благодарность',desc:'10 вещей.',reward:50,action:'Благодарность',checkId:'grat'},
{id:'c_water',icon:'💧',title:'Вода',desc:'2 литра.',reward:45,action:'Вода',checkId:'water'},
{id:'c_sun',icon:'☀️',title:'Солнце',desc:'30 мин.',reward:50,action:'Солнце',checkId:'sun'},
{id:'c_deep',icon:'🔥',title:'Работа',desc:'2ч.',reward:80,action:'Глубокая работа',checkId:'deepwork'},
{id:'c_early',icon:'🌅',title:'Восход',desc:'До 6:00.',reward:60,action:'Ранний подъём',checkId:'wake'},
{id:'c_read',icon:'📖',title:'Мудрость',desc:'30+ стр.',reward:50,action:'Чтение',checkId:'read'},
{id:'c_stretch',icon:'🧘‍♂️',title:'Гибкость',desc:'20+ мин.',reward:50,action:'Растяжка',checkId:'stretch'},
{id:'c_push',icon:'🤸',title:'Сила',desc:'3 подхода.',reward:50,action:'Отжимания',checkId:'pushups'},
{id:'c_nophone',icon:'📵',title:'Тишина',desc:'1 час.',reward:55,action:'Цифровая тишина',checkId:'nophone'},
{id:'c_observer',icon:'👁️',title:'Свидетель',desc:'30 мин.',reward:80,action:'Наблюдатель',checkId:'observer'},
{id:'c_solitude',icon:'🏔️',title:'Уединение',desc:'3 часа.',reward:90,action:'Уединение',checkId:'solitude'},
{id:'c_fast',icon:'⏳',title:'Ясность',desc:'16 часов.',reward:80,action:'Голодание',checkId:'fast'},
{id:'c_plank',icon:'🧱',title:'Камень',desc:'3×60.',reward:55,action:'Планка',checkId:'plank'},
{id:'c_learn',icon:'🎓',title:'Ученик',desc:'1 час.',reward:60,action:'Обучение',checkId:'learn'},
{id:'c_metta',icon:'💗',title:'Сердце',desc:'10+ мин.',reward:70,action:'Мета',checkId:'metta'}];

var AFFIRMATIONS=['Я — творец своей реальности.','Моё тело — инструмент.','Я сильнее, чем думаю.','Каждый день я становлюсь на 1% лучше.','Мой ум ясен.','Я не жертва обстоятельств.','Я дышу спокойно.','Дисциплина — это свобода.','Я могу делать сложные вещи.','Мой прогресс — про постоянство.','Я благодарен за этот день.','Страх не управляет мной.','Я достоин любви, покоя, успеха.','Каждая практика укрепляет меня.','Я — наблюдатель мыслей.','Моё будущее создаётся действиями.','Я выбираю здоровье и рост.','Мой внутренний покой — суперсила.','Я с благодарностью принимаю всё.','Я — часть чего-то большего.'];
var MANTRAS=['Сегодня я выбираю осознанность.','Маленькие шаги ведут к большим переменам.','Я спокоен в любой ситуации.','Моё тело — храм моей души.','Я отпускаю то, что не могу изменить.','Каждый день — новый шанс.','Я сильнее своих привычек.','Тишина внутри меня — моя крепость.','Я благодарен за этот момент.','Спокойствие — это выбор.'];
var QUOTES=[
{q:'Мы — то, что мы делаем постоянно.',a:'Аристотель'},
{q:'Не бойся медленно идти. Бойся стоять.',a:'Китайская мудрость'},
{q:'Всё, что нас не убивает, делает нас сильнее.',a:'Ницше'},
{q:'Ты становишься тем, о чём думаешь.',a:'Будда'},
{q:'Дисциплина — мост между целью и результатом.',a:'Джим Рон'},
{q:'Мы страдаем больше в воображении.',a:'Сенека'},
{q:'Не важно, как медленно ты идёшь.',a:'Конфуций'},
{q:'Действие — ключ к успеху.',a:'Пикассо'}];

var BOOKS=[
{id:'atomic',icon:'⚛️',title:'Атомные привычки',author:'Джеймс Клир',summary:'Маленькие изменения → удивительные результаты.',ideas:['4 закона','Окружение важнее мотивации','Не цель, а система','Правило 2 минут']},
{id:'powerofnow',icon:'⏰',title:'Сила момента сейчас',author:'Экхарт Толле',summary:'Единственное, что есть — текущий момент.',ideas:['Ты — не свои мысли','Боль — сопротивление','Присутствие = свобода']},
{id:'deepwork',icon:'🔥',title:'В работу с головой',author:'Кэл Ньюпорт',summary:'Глубокая работа — суперсила.',ideas:['Фокус — редкий ресурс','Ритуалы входа','Блоками 90 мин']},
{id:'willpower',icon:'💪',title:'Сила воли',author:'Келли Макгонигал',summary:'Воля — мышца. Тренируется.',ideas:['Медитация увеличивает волю','Сон критичен','Отложи решение на 10 мин']},
{id:'mansearch',icon:'🔍',title:'Человек в поисках смысла',author:'Виктор Франкл',summary:'Смысл в любых условиях.',ideas:['Смысл — главная мотивация','Свобода выбора отношения']},
{id:'meditations',icon:'📜',title:'Наедине с собой',author:'Марк Аврелий',summary:'Стоицизм как практика.',ideas:['Управляй суждениями','Всё преходяще','Добродетель = счастье']},
{id:'flow',icon:'🌊',title:'Поток',author:'Чиксентмихайи',summary:'Полное погружение.',ideas:['Задача чуть сложнее навыка','Чёткие цели','Искажение времени']},
{id:'thinking',icon:'🧠',title:'Думай медленно',author:'Канеман',summary:'Две системы мышления.',ideas:['Система 1 быстрая','Система 2 медленная','Мы ленивые']},
{id:'miracle',icon:'🌅',title:'Чудесное утро',author:'Хэл Элрод',summary:'Утро определяет день.',ideas:['Вставай раньше','6 шагов ритуала']},
{id:'essentialism',icon:'🎯',title:'Эссенциализм',author:'МакКеон',summary:'Делай меньше, но лучше.',ideas:['Если не ДА — то НЕТ','Фокус на главном']},
{id:'antifragile',icon:'🛡️',title:'Антихрупкость',author:'Талеб',summary:'Стресс делает сильнее.',ideas:['Стресс полезен дозированно','Ошибки — информация']}];

var COURSES=[
{id:'start7',name:'Старт за 7 дней',icon:'🚀',desc:'Первая неделя пути',color:'#4facfe',days:[
{title:'День 1: Старт',desc:'Встань в 7:00. Холодный душ 30 сек. Прогулка.',task:'totalDone',value:3,reward:50},
{title:'День 2: Дыхание',desc:'4-7-8. Медитация 5 мин.',task:'totalDone',value:6,reward:60},
{title:'День 3: Тело',desc:'Зарядка. Отжимания 3×10.',task:'totalDone',value:10,reward:70},
{title:'День 4: Тишина',desc:'Час без телефона.',task:'totalDone',value:13,reward:70},
{title:'День 5: Ум',desc:'Чтение 20 стр.',task:'totalDone',value:16,reward:80},
{title:'День 6: Дух',desc:'Медитация 15 мин.',task:'totalDone',value:19,reward:90},
{title:'День 7: Интеграция',desc:'Ритуал утра.',task:'totalDone',value:22,reward:150}]},
{id:'disc30',name:'30 дней дисциплины',icon:'⚔️',desc:'Месяц практик',color:'#f5576c',days:[
{title:'Неделя 1',desc:'Ранний подъём + душ + тренировка.',task:'streak',value:7,reward:200},
{title:'Неделя 2',desc:'Медитация 10 мин.',task:'streak',value:14,reward:250},
{title:'Неделя 3',desc:'Час тишины.',task:'streak',value:21,reward:300},
{title:'Неделя 4',desc:'Чистое питание.',task:'streak',value:30,reward:400}]},
{id:'med14',name:'Медитация 14 дней',icon:'🧘',desc:'Две недели покоя',color:'#8b7cff',days:[
{title:'День 1-3',desc:'5 мин наблюдения.',task:'streak',value:3,reward:80},
{title:'День 4-7',desc:'10 мин.',task:'streak',value:7,reward:150},
{title:'День 8-14',desc:'15 мин.',task:'streak',value:14,reward:300}]}];

var FREQUENCIES=[
{id:'f432',name:'432 Гц',icon:'🌍',hz:432,desc:'Земля'},
{id:'f528',name:'528 Гц',icon:'💗',hz:528,desc:'Любовь'},
{id:'f639',name:'639 Гц',icon:'🤝',hz:639,desc:'Связи'},
{id:'f741',name:'741 Гц',icon:'✨',hz:741,desc:'Очищение'},
{id:'f852',name:'852 Гц',icon:'🔮',hz:852,desc:'Интуиция'},
{id:'f963',name:'963 Гц',icon:'🕉️',hz:963,desc:'Единство'}];
var AMBIENT_SOUNDS=[{id:'none',name:'Выкл',icon:'🔇'},{id:'rain',name:'Дождь',icon:'🌧'},{id:'forest',name:'Лес',icon:'🌲'},{id:'ocean',name:'Океан',icon:'🌊'},{id:'wind',name:'Ветер',icon:'💨'},{id:'fire',name:'Костёр',icon:'🔥'}];
var MOODS=[
{e:'🔥',n:'Энергия',s:7},{e:'😊',n:'Хорошо',s:6},{e:'😐',n:'Норма',s:5},{e:'😴',n:'Усталость',s:4},
{e:'😤',n:'Злость',s:3},{e:'😔',n:'Грусть',s:2},{e:'😰',n:'Тревога',s:1},{e:'😌',n:'Спокойствие',s:6},
{e:'💪',n:'Сила',s:7},{e:'🤔',n:'Раздумья',s:5}];

/* ============================================================
   КОЛЕСО БАЛАНСА — 8 сфер
============================================================ */
var BALANCE_SPHERES=[
{key:'health',icon:'💚',name:'Здоровье'},
{key:'relationships',icon:'💕',name:'Отношения'},
{key:'career',icon:'💼',name:'Карьера'},
{key:'finance',icon:'💰',name:'Финансы'},
{key:'spirit',icon:'✨',name:'Духовность'},
{key:'creativity',icon:'🎨',name:'Творчество'},
{key:'learning',icon:'📚',name:'Обучение'},
{key:'rest',icon:'🌙',name:'Отдых'}];

/* ============================================================
   РЕФЛЕКСИЯ — 3 вопроса
============================================================ */
var REFLECTION_QUESTIONS=[
{key:'good',icon:'✨',title:'Что сегодня было хорошо?'},
{key:'bad',icon:'🌧',title:'Что сегодня было не так?'},
{key:'tomorrow',icon:'🎯',title:'Что завтра сделаю иначе?'}];

/* ============================================================
   ХЕЛПЕРЫ
============================================================ */
function getMoodScore(e){for(var i=0;i<MOODS.length;i++)if(MOODS[i].e===e)return MOODS[i].s;return 5;}
function getMoodName(e){for(var i=0;i<MOODS.length;i++)if(MOODS[i].e===e)return MOODS[i].n;return '';}
function todayCatCount(s,cat){var ids=[];for(var i=0;i<BASE_PRACTICES.length;i++){if(BASE_PRACTICES[i].cat===cat)ids.push(BASE_PRACTICES[i].id);}var c=0;for(var j=0;j<s.todayDone.length;j++){if(ids.indexOf(s.todayDone[j])>=0)c++;}return c;}
function countHabitDays(s){if(!s.habits||!s.habits.log)return 0;var keys=Object.keys(s.habits.log);var c=0;for(var i=0;i<keys.length;i++){if(s.habits.log[keys[i]]&&Object.keys(s.habits.log[keys[i]]).length>0)c++;}return c;}

/* ============================================================
   STATE + МИГРАЦИИ
============================================================ */
var DEFAULT_STATE={
  xp:0,xpEarned:0,streak:0,maxStreak:0,lastDate:null,todayDone:[],history:{},totalDays:0,totalDone:0,
  achievements:[],avatar:'🧘',theme:'dark',fractalStyle:'mixed',sound:true,notify:false,
  seasonalTheme:true,
  practiceTiers:{},completionCounter:{},customPractices:[],
  customAffirmations:[],
  askesis:[],askesisBlocks:{},
  dailyQuests:{date:null,difficulty:null,list:[],completed:[]},dailyCard:null,cardsCompleted:0,
  goals:[],goalsCompleted:0,milestonesCompleted:0,
  moods:{},moodNotes:{},userPlan:null,
  buildings:[],chestsOpened:0,legendaryChests:0,lastChestDate:null,
  habits:{list:[],log:{}},
  bodyLog:[],workouts:[],foodLog:[],
  financeLog:[],financeGoal:0,salary:null,savings:[],activeStrategy:null,
  voiceMeditations:0,currentQuoteIndex:0,currentAffirmation:0,currentMantra:0,affirmationsRead:0,
  categoryStats:{disc:0,breath:0,body:0,mind:0,spirit:0,health:0},
  bossCurrent:null,bossHp:null,bossesDefeated:0,bossWeek:null,
  coursesCompleted:0,courseProgress:{},courseActive:null,courseStartDate:null,courseMissedDays:0,coursePaused:null,
  booksRead:0,booksReadList:[],
  weeklyRewards:0,lastWeeklyCheck:null,weekDays:[],lastWeeklyRewardClaim:null,
  combo:0,maxCombo:0,lastPracticeTime:0,
  dailyPathCompleted:0,lastPathComplete:null,
  soundAmbient:null,soundFrequency:null,
  barrierSubtasks:{},practiceDailyLog:{},practiceCooldowns:{},
  lastPenaltyCheck:null,missedDays:0,currentPathStep:0,lastShownLevel:0,
  lastWheelSpin:null,luckBonusUntil:null,
  collection:[],newCards:[],lastCardCheck:null,
  wins:[],
  reflections:{},
  balance:{},balanceHistory:[],lastBalanceUpdate:null,
  dayConstructor:[],
  profile:{
    name:'',birthDate:'',gender:'male',height:0,weight:0,targetWeight:0,
    goal:'maintain',activity:'moderate',sleepHours:8,waterGoal:2000,
    mealsPerDay:4,
    mealTimes:{breakfast:'08:00',lunch:'13:00',dinner:'19:00',snack:'16:00'},
    mealSchedule:[
      {name:'Завтрак',time:'08:00',enabled:true},
      {name:'Обед',time:'13:00',enabled:true},
      {name:'Перекус',time:'16:00',enabled:true},
      {name:'Ужин',time:'19:00',enabled:true}
    ],
    onboardingComplete:false
  },
  pets:{current:null,owned:[],names:{},levels:{},feeds:{},lastFed:{},lastPlayed:{},lastWashed:{},totalFeeds:0,autoGranted:false}
};

var state=(function(){try{var saved=localStorage.getItem(STORAGE);if(saved){var parsed=JSON.parse(saved);return Object.assign({},DEFAULT_STATE,parsed);}}catch(e){}return JSON.parse(JSON.stringify(DEFAULT_STATE));})();

/* Миграции — если поле отсутствует, ставим дефолт */
if(!state.goals)state.goals=[];
if(!state.moods)state.moods={};
if(!state.moodNotes)state.moodNotes={};
if(!state.bodyLog)state.bodyLog=[];
if(!state.workouts)state.workouts=[];
if(!state.foodLog)state.foodLog=[];
if(!state.financeLog)state.financeLog=[];
if(!state.savings)state.savings=[];
if(!state.buildings)state.buildings=[];
if(!state.habits)state.habits={list:[],log:{}};
if(!state.habits.list||!state.habits.list.length)state.habits.list=[];
if(!state.habits.log)state.habits.log={};
if(!state.categoryStats)state.categoryStats={disc:0,breath:0,body:0,mind:0,spirit:0,health:0};
if(!state.booksReadList)state.booksReadList=[];
if(!state.courseProgress)state.courseProgress={};
if(!state.weekDays)state.weekDays=[];
if(!state.barrierSubtasks)state.barrierSubtasks={};
if(!state.practiceDailyLog)state.practiceDailyLog={};
if(!state.practiceCooldowns)state.practiceCooldowns={};
if(!state.askesisBlocks)state.askesisBlocks={};
if(!state.customAffirmations)state.customAffirmations=[];
if(!state.collection)state.collection=[];
if(!state.wins)state.wins=[];
if(!state.reflections)state.reflections={};
if(!state.balance)state.balance={};
if(!state.balanceHistory)state.balanceHistory=[];
if(!state.dayConstructor)state.dayConstructor=[];
if(typeof state.currentPathStep==='undefined')state.currentPathStep=0;
if(typeof state.xpEarned==='undefined')state.xpEarned=state.xp||0;
if(typeof state.lastShownLevel==='undefined')state.lastShownLevel=getLevel(state.xpEarned);
if(typeof state.lastWheelSpin==='undefined')state.lastWheelSpin=null;
if(typeof state.luckBonusUntil==='undefined')state.luckBonusUntil=null;
if(typeof state.seasonalTheme==='undefined')state.seasonalTheme=true;
if(typeof state.currentMantra==='undefined')state.currentMantra=0;
if(!state.profile)state.profile=JSON.parse(JSON.stringify(DEFAULT_STATE.profile));
if(!state.profile.mealSchedule)state.profile.mealSchedule=JSON.parse(JSON.stringify(DEFAULT_STATE.profile.mealSchedule));
if(!state.pets)state.pets=JSON.parse(JSON.stringify(DEFAULT_STATE.pets));
if(!state.pets.owned)state.pets.owned=[];
if(!state.pets.names)state.pets.names={};
if(!state.pets.levels)state.pets.levels={};
if(!state.pets.feeds)state.pets.feeds={};
if(!state.pets.lastFed)state.pets.lastFed={};
if(!state.pets.lastPlayed)state.pets.lastPlayed={};
if(!state.pets.lastWashed)state.pets.lastWashed={};

function save(){try{localStorage.setItem(STORAGE,JSON.stringify(state));}catch(e){}}
function getAllPractices(){return BASE_PRACTICES.concat(state.customPractices||[]);}
function getTier(id){return (state.practiceTiers&&state.practiceTiers[id])||1;}
function countPractice(id){return (state.completionCounter&&state.completionCounter[id])||0;}
function getBuildingBonus(cat){var total=0;var b=state.buildings||[];for(var i=0;i<b.length;i++){var bd=null;for(var j=0;j<BUILDINGS.length;j++){if(BUILDINGS[j].id===b[i])bd=BUILDINGS[j];}if(!bd)continue;if(bd.bonusType==='all')total+=bd.bonusValue;else if(bd.bonusType==='mind_spirit'&&(cat==='mind'||cat==='spirit'))total+=bd.bonusValue;else if(bd.bonusType===cat)total+=bd.bonusValue;}return total;}
function getTotalMultiplier(cat){return getMultiplier(state.xpEarned||0)*(1+getBuildingBonus(cat)/100);}

/* ============================================================
   XP / LEVEL UP
============================================================ */
function addXP(amount){
  if(state.luckBonusUntil&&state.luckBonusUntil>Date.now()){amount=Math.round(amount*1.5);}
  state.xp+=amount;
  state.xpEarned=(state.xpEarned||0)+amount;
  var newLevel=getLevel(state.xpEarned);
  if(newLevel>(state.lastShownLevel||0)){
    state.lastShownLevel=newLevel;
    setTimeout(function(){showLevelUpModal(newLevel);},1500);
  }
}
function spendXP(amount){
  if(state.xp<amount){showToast('Недостаточно XP (нужно '+amount+')',true);return false;}
  state.xp-=amount;
  return true;
}
function showLevelUpModal(newLevel){
  var lvl=LEVELS[newLevel];if(!lvl)return;
  var rewardXP=100+newLevel*50;
  state.xp+=rewardXP;
  state.xpEarned=(state.xpEarned||0)+rewardXP;
  save();
  document.getElementById('levelUpTitle').textContent='Ур. '+(newLevel+1)+' · '+lvl.name;
  document.getElementById('levelUpRank').textContent=RANK_TITLES[newLevel]||'Мастер';
  document.getElementById('levelUpRewardText').textContent='+'+rewardXP+' XP';
  document.getElementById('levelUpModal').classList.add('active');
  if(state.sound)achSound();
}
function claimLevelUpReward(){closeModal('levelUpModal');render();showToast('🎉 Поздравляем!');}

/* ============================================================
   РАСЧЁТЫ ПРОФИЛЯ
============================================================ */
function calcAge(birthDate){if(!birthDate)return 0;var b=new Date(birthDate),t=new Date();var age=t.getFullYear()-b.getFullYear();var m=t.getMonth()-b.getMonth();if(m<0||(m===0&&t.getDate()<b.getDate()))age--;return age;}
function calcBMR(){var p=state.profile;if(!p.weight||!p.height||!p.birthDate)return 0;var age=calcAge(p.birthDate);if(p.gender==='female')return Math.round(10*p.weight+6.25*p.height-5*age-161);return Math.round(10*p.weight+6.25*p.height-5*age+5);}
function calcTDEE(){var bmr=calcBMR();if(!bmr)return 0;var factors={sedentary:1.2,light:1.375,moderate:1.55,active:1.725,athlete:1.9};var f=factors[state.profile.activity]||1.55;return Math.round(bmr*f);}
function calcTargetCalories(){var tdee=calcTDEE();if(!tdee)return 0;var goal=state.profile.goal;if(goal==='lose')return tdee-400;if(goal==='gain')return tdee+300;if(goal==='recomp')return tdee-100;return tdee;}
function calcMacros(){var cal=calcTargetCalories();var p=state.profile;if(!cal||!p.weight)return {protein:0,fat:0,carbs:0,proteinG:0,fatG:0,carbsG:0};var proteinPerKg=(p.goal==='lose'||p.goal==='recomp')?2.0:1.8;var proteinG=Math.round(p.weight*proteinPerKg);var fatG=Math.round(p.weight*0.9);var proteinCal=proteinG*4;var fatCal=fatG*9;var carbsCal=Math.max(0,cal-proteinCal-fatCal);var carbsG=Math.round(carbsCal/4);return {protein:proteinCal,fat:fatCal,carbs:carbsG*4,proteinG:proteinG,fatG:fatG,carbsG:carbsG};}
function calcBMI(){var p=state.profile;if(!p.weight||!p.height)return 0;var m=p.height/100;return +(p.weight/(m*m)).toFixed(1);}
function bmiCategory(bmi){if(!bmi)return {cat:'—',color:'var(--text-dim)',index:0};if(bmi<18.5)return {cat:'Недостаток',color:'#4facfe',index:1};if(bmi<25)return {cat:'Норма',color:'#4cd964',index:2};if(bmi<30)return {cat:'Избыток',color:'#ffd166',index:3};if(bmi<35)return {cat:'Ожирение I',color:'#ff8c42',index:4};return {cat:'Ожирение II+',color:'#f5576c',index:5};}
function calcIdealWeight(){var p=state.profile;if(!p.height)return 0;var base=50+2.3*((p.height/2.54)-60);if(p.gender==='female')base=45.5+2.3*((p.height/2.54)-60);return Math.round(base);}
function calcWaterGoal(){var p=state.profile;if(!p.weight)return p.waterGoal||2000;return Math.round(p.weight*30);}

/* ============================================================
   ГОРОСКОП И НУМЕРОЛОГИЯ
============================================================ */
function getWesternZodiac(birthDate){if(!birthDate)return null;var b=new Date(birthDate);var m=b.getMonth()+1,d=b.getDate();for(var i=0;i<ZODIAC.length;i++){var z=ZODIAC[i];var f=z.from,t=z.to;if(f[0]<=t[0]){if((m===f[0]&&d>=f[1])||(m===t[0]&&d<=t[1])||(m>f[0]&&m<t[0]))return z;}else{if((m===12&&d>=f[1])||(m===1&&d<=t[1]))return z;}}return null;}
function getChineseZodiac(birthDate){if(!birthDate)return null;var y=new Date(birthDate).getFullYear();var idx=((y-2020)%12+12)%12;var petId=CHINESE_CYCLE[idx];for(var i=0;i<PETS.length;i++)if(PETS[i].id===petId)return PETS[i];return null;}
function getPetById(id){for(var i=0;i<PETS.length;i++)if(PETS[i].id===id)return PETS[i];return null;}
function sumDigits(n){n=Math.abs(n);var s=0;while(n>0){s+=n%10;n=Math.floor(n/10);}return s;}
function reduceToSingle(n){while(n>9){if(n===11||n===22||n===33)return n;n=sumDigits(n);}return n;}
function calcLifePath(birthDate){if(!birthDate)return 0;var b=new Date(birthDate);return reduceToSingle(sumDigits(b.getDate())+sumDigits(b.getMonth()+1)+sumDigits(b.getFullYear()));}
var LETTER_VALUES={'А':1,'Б':2,'В':3,'Г':4,'Д':5,'Е':6,'Ё':7,'Ж':8,'З':9,'И':1,'Й':2,'К':3,'Л':4,'М':5,'Н':6,'О':7,'П':8,'Р':9,'С':1,'Т':2,'У':3,'Ф':4,'Х':5,'Ц':6,'Ч':7,'Ш':8,'Щ':9,'Ъ':1,'Ы':2,'Ь':3,'Э':4,'Ю':5,'Я':6};
function calcDestinyNumber(name){if(!name)return 0;name=name.toUpperCase().replace(/\s/g,'');var sum=0;for(var i=0;i<name.length;i++){var ch=name[i];if(LETTER_VALUES[ch])sum+=LETTER_VALUES[ch];else if(/[A-Z]/.test(ch))sum+=((ch.charCodeAt(0)-64-1)%9)+1;}return reduceToSingle(sum);}
function calcPersonalYear(birthDate){if(!birthDate)return 0;var b=new Date(birthDate);return reduceToSingle(sumDigits(b.getDate())+sumDigits(b.getMonth()+1)+sumDigits(new Date().getFullYear()));}
function numMeaning(n){return NUM_MEANING[n]||NUM_MEANING[sumDigits(n)]||'—';}
function numMeaningLong(n){return NUM_MEANING_LONG[n]||NUM_MEANING_LONG[sumDigits(n)]||'—';}
function calcPythagoras(birthDate){
  if(!birthDate)return null;
  var b=new Date(birthDate);
  var day=b.getDate(),month=b.getMonth()+1,year=b.getFullYear();
  var dstr=String(day).padStart(2,'0')+String(month).padStart(2,'0')+String(year);
  var sum1=0;for(var i=0;i<dstr.length;i++)sum1+=parseInt(dstr[i]);
  var sum2=sumDigits(sum1);
  var third=sum1-2*parseInt(dstr[0]||0);
  var fourth=sumDigits(third);
  var allDigits=dstr+String(sum1)+String(sum2)+String(third)+String(fourth);
  var counts={};
  for(var j=1;j<=9;j++)counts[j]=0;
  for(var k=0;k<allDigits.length;k++){var digit=parseInt(allDigits[k]);if(digit>=1&&digit<=9)counts[digit]++;}
  return {counts:counts};
}
function getMoonPhase(date){
  var d=date||new Date();
  var year=d.getFullYear(),month=d.getMonth()+1,day=d.getDate();
  var c,e,jd,b;
  if(month<3){year--;month+=12;}
  ++month;
  c=365.25*year;e=30.6001*month;
  jd=c+e+day+1720994.5;
  b=2-Math.floor(year/100)+Math.floor(Math.floor(year/100)/4);
  jd=jd+b;
  var daysSinceNew=(jd-2451550.1)/29.530588853;
  var phase=daysSinceNew-Math.floor(daysSinceNew);
  var age=phase*29.530588853;
  var phases=['🌑 Новолуние','🌒 Растущий серп','🌓 Первая четверть','🌔 Растущая луна','🌕 Полнолуние','🌖 Убывающая луна','🌗 Последняя четверть','🌘 Убывающий серп'];
  var idx=Math.floor((age/29.53)*8)%8;
  return {phase:phases[idx],age:Math.round(age),percent:Math.round(phase*100)};
}

/* ============================================================
   ЗВУК (с разблокировкой iOS)
============================================================ */
var audioCtx=null,freqOsc=null,ambientSrc=null,ambientGain=null,ambientLfo=null;
(function(){
  function unlock(){
    try{
      if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();
      if(audioCtx.state==='suspended'||audioCtx.state==='interrupted')audioCtx.resume();
      var o=audioCtx.createOscillator();var g=audioCtx.createGain();g.gain.value=0.0001;o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+0.01);
    }catch(e){}
    document.removeEventListener('touchstart',unlock);
    document.removeEventListener('click',unlock);
  }
  document.addEventListener('touchstart',unlock,{once:true});
  document.addEventListener('click',unlock,{once:true});
})();
function initAudio(){if(!audioCtx){try{audioCtx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){}}if(audioCtx&&(audioCtx.state==='suspended'||audioCtx.state==='interrupted'))audioCtx.resume();}
function playFrequency(hz){
  initAudio();if(!audioCtx)return;
  if(audioCtx.state==='suspended')audioCtx.resume();
  if(freqOsc){stopFrequency();return;}
  state.soundFrequency=hz;save();
  var o1=audioCtx.createOscillator();o1.type='sine';o1.frequency.value=hz;
  var g1=audioCtx.createGain();g1.gain.value=0;o1.connect(g1);g1.connect(audioCtx.destination);o1.start();
  g1.gain.linearRampToValueAtTime(0.06,audioCtx.currentTime+2);
  var o2=audioCtx.createOscillator();o2.type='sine';o2.frequency.value=hz*1.5;
  var g2=audioCtx.createGain();g2.gain.value=0;o2.connect(g2);g2.connect(audioCtx.destination);o2.start();
  g2.gain.linearRampToValueAtTime(0.02,audioCtx.currentTime+2.5);
  var lfo=audioCtx.createOscillator();lfo.frequency.value=0.08;
  var lfoGain=audioCtx.createGain();lfoGain.gain.value=0.015;lfo.connect(lfoGain);lfoGain.connect(g1.gain);lfo.start();
  freqOsc={o1:o1,o2:o2,lfo:lfo,g1:g1,g2:g2};
  render();showToast('🎵 '+hz+' Гц');
}
function stopFrequency(){
  if(freqOsc){
    try{freqOsc.g1.gain.linearRampToValueAtTime(0,audioCtx.currentTime+1);freqOsc.g2.gain.linearRampToValueAtTime(0,audioCtx.currentTime+1);}catch(e){}
    var f=freqOsc;
    setTimeout(function(){try{f.o1.stop();f.o2.stop();f.lfo.stop();}catch(e){}},1200);
    freqOsc=null;
  }
  state.soundFrequency=null;save();render();
}
function toggleAmbient(id){
  initAudio();if(!audioCtx)return;
  if(audioCtx.state==='suspended')audioCtx.resume();
  if(ambientSrc){try{ambientSrc.stop();}catch(e){}ambientSrc=null;}
  if(ambientLfo){try{ambientLfo.stop();}catch(e){}ambientLfo=null;}
  if(ambientGain){try{ambientGain.disconnect();}catch(e){}ambientGain=null;}
  if(id==='none'||state.soundAmbient===id){
    state.soundAmbient=null;save();render();
    if(id!=='none')showToast('🔇 Выключено');
    return;
  }
  try{
    var bufferSize=2*audioCtx.sampleRate;
    var buffer=audioCtx.createBuffer(1,bufferSize,audioCtx.sampleRate);
    var data=buffer.getChannelData(0);
    for(var i=0;i<bufferSize;i++)data[i]=Math.random()*2-1;
    var src=audioCtx.createBufferSource();src.buffer=buffer;src.loop=true;
    var filter=audioCtx.createBiquadFilter();
    if(id==='rain'){filter.type='lowpass';filter.frequency.value=3000;filter.Q.value=0.5;}
    else if(id==='forest'){filter.type='bandpass';filter.frequency.value=2000;filter.Q.value=0.6;}
    else if(id==='ocean'){filter.type='lowpass';filter.frequency.value=500;filter.Q.value=0.7;}
    else if(id==='wind'){filter.type='lowpass';filter.frequency.value=800;filter.Q.value=0.4;}
    else if(id==='fire'){filter.type='bandpass';filter.frequency.value=800;filter.Q.value=0.6;}
    var gain=audioCtx.createGain();gain.gain.value=0;
    src.connect(filter);filter.connect(gain);gain.connect(audioCtx.destination);src.start();
    gain.gain.linearRampToValueAtTime(0.12,audioCtx.currentTime+2);
    if(id==='ocean'){
      var lfo=audioCtx.createOscillator();lfo.frequency.value=0.15;
      var lfoGain=audioCtx.createGain();lfoGain.gain.value=0.06;
      lfo.connect(lfoGain);lfoGain.connect(gain.gain);lfo.start();
      ambientLfo=lfo;
    }
    ambientSrc=src;ambientGain=gain;
    state.soundAmbient=id;save();render();
    var sname=AMBIENT_SOUNDS.find(function(s){return s.id===id;});
    showToast('🌿 '+(sname?sname.name:'Звук'));
  }catch(e){showToast('Ошибка',true);}
}
function beep(){try{initAudio();if(!audioCtx)return;if(audioCtx.state==='suspended')audioCtx.resume();var o=audioCtx.createOscillator(),g=audioCtx.createGain();o.connect(g);g.connect(audioCtx.destination);o.frequency.value=432;o.type='sine';g.gain.setValueAtTime(0.06,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+0.2);o.start();o.stop(audioCtx.currentTime+0.2);}catch(e){}}
function achSound(){try{initAudio();if(!audioCtx)return;if(audioCtx.state==='suspended')audioCtx.resume();var f=[528,639,741,852];for(var i=0;i<f.length;i++)(function(fr,idx){var o=audioCtx.createOscillator(),g=audioCtx.createGain();o.connect(g);g.connect(audioCtx.destination);o.frequency.value=fr;o.type='sine';var t=audioCtx.currentTime+idx*0.15;g.gain.setValueAtTime(0.08,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.5);o.start(t);o.stop(t+0.5);})(f[i],i);}catch(e){}}
function showToast(t,err){var el=document.getElementById('toast');if(!el)return;el.textContent=t;if(err)el.classList.add('error');else el.classList.remove('error');el.classList.add('show');if(el._t)clearTimeout(el._t);el._t=setTimeout(function(){el.classList.remove('show');},2200);}

/* ============================================================
   СЕЗОН (авто-тема)
============================================================ */
function getCurrentSeason(){
  var m=new Date().getMonth()+1;
  if(m>=3&&m<=5)return 'spring';
  if(m>=6&&m<=8)return 'summer';
  if(m>=9&&m<=11)return 'autumn';
  return 'winter';
}
function applySeasonalTheme(){
  if(!state.seasonalTheme){document.documentElement.removeAttribute('data-season');return;}
  document.documentElement.setAttribute('data-season',getCurrentSeason());
}
function toggleSeasonal(){state.seasonalTheme=!state.seasonalTheme;save();applySeasonalTheme();render();}

/* ============================================================
   КОЛЛЕКЦИОННЫЕ КАРТОЧКИ — проверка
============================================================ */
function checkNewCards(){
  var today=dateKey(new Date());
  if(state.lastCardCheck===today)return;
  state.lastCardCheck=today;
  var newOnes=[];
  for(var i=0;i<COLLECTION_CARDS.length;i++){
    var card=COLLECTION_CARDS[i];
    if(state.collection.indexOf(card.id)>=0)continue;
    try{
      if(card.unlock(state)){
        state.collection.push(card.id);
        newOnes.push(card);
      }
    }catch(e){}
  }
  if(newOnes.length){
    save();
    /* Показываем по одной через очередь */
    var queue=newOnes.slice();
    function showNext(){
      if(!queue.length)return;
      var c=queue.shift();
      showCardUnlock(c);
      setTimeout(showNext,3500);
    }
    setTimeout(showNext,1500);
  }
}
function showCardUnlock(card){
  document.getElementById('cardUnlockIcon').textContent=card.icon;
  document.getElementById('cardUnlockName').textContent=card.name;
  document.getElementById('cardUnlockDesc').textContent=card.desc+' · '+({common:'Обычная',rare:'Редкая',epic:'Эпическая',legendary:'Легендарная'}[card.rarity]);
  document.getElementById('cardUnlockModal').classList.add('active');
  if(state.sound)achSound();
}
function closeCardUnlock(){closeModal('cardUnlockModal');}

/* ============================================================
   ПРИВЫЧКИ — helpers (пустой список по умолчанию)
============================================================ */
function toggleHabitToday(hid){var t=dateKey(new Date());if(!state.habits.log[t])state.habits.log[t]={};if(state.habits.log[t][hid]){delete state.habits.log[t][hid];state.xp=Math.max(0,state.xp-10);showToast('−10 XP');}else{state.habits.log[t][hid]=true;addXP(10);showToast('✅ +10 XP');if(state.sound)beep();}save();render();checkAchievements();}
function addHabit(){var el=document.getElementById('habitName');if(!el)return;var v=el.value.trim();if(!v){showToast('Введи',true);return;}state.habits.list.push({id:'h_custom_'+Date.now(),name:v,goal:30});save();el.value='';render();showToast('➕ Добавлено');}

/* ============================================================
   ПИТОМЕЦ — ЛОГИКА
============================================================ */
var PET_STAGES=[
{level:0,name:'Яйцо',feeds:0},{level:1,name:'Малыш',feeds:3},{level:2,name:'Юный',feeds:8},
{level:3,name:'Подросток',feeds:15},{level:4,name:'Взрослый',feeds:25},{level:5,name:'Опытный',feeds:40},
{level:6,name:'Мастер',feeds:60},{level:7,name:'Мудрец',feeds:85},{level:8,name:'Хранитель',feeds:120},
{level:9,name:'Легенда',feeds:170},{level:10,name:'Дух-Покровитель',feeds:250}];
function getPetLevel(petId){var feeds=state.pets.feeds[petId]||0;var lvl=0;for(var i=0;i<PET_STAGES.length;i++){if(feeds>=PET_STAGES[i].feeds)lvl=i;}return lvl;}
function getPetStageName(petId){var lvl=getPetLevel(petId);return PET_STAGES[lvl]?PET_STAGES[lvl].name:'Яйцо';}
function getPetMood(petId){var id=petId||state.pets.current;if(!id)return {key:'happy',text:'😊 Счастлив',cls:'pet-mood-happy'};var lastFed=state.pets.lastFed[id];if(!lastFed)return {key:'hungry',text:'😟 Голоден',cls:'pet-mood-hungry'};var hours=(Date.now()-lastFed)/3600000;if(hours<6)return {key:'happy',text:'😊 Счастлив',cls:'pet-mood-happy'};if(hours<24)return {key:'calm',text:'😐 Спокоен',cls:'pet-mood-calm'};if(hours<72)return {key:'hungry',text:'😟 Голоден',cls:'pet-mood-hungry'};return {key:'very',text:'😢 Очень голоден',cls:'pet-mood-very-hungry'};}
function getPetSpeech(petId){var pet=getPetById(petId||state.pets.current);if(!pet)return '';var mood=getPetMood(petId);if(mood.key==='very')return 'Я очень голоден... покорми меня 🙏';if(mood.key==='hungry')return 'Я бы не отказался от угощения...';var todayCount=state.todayDone.length;if(todayCount===0)return 'Давай начнём с малого? Одна практика — уже победа!';if(todayCount>=7)return 'Ты сегодня герой! Я горжусь тобой! 🎉';if(todayCount>=3)return 'Отличный темп! Продолжай.';var idx=Math.floor(Math.random()*pet.speech.length);return pet.speech[idx];}
function grantStarterPet(){if(state.pets.autoGranted)return;if(!state.profile.birthDate)return;var pet=getChineseZodiac(state.profile.birthDate);if(!pet)return;if(state.pets.owned.indexOf(pet.id)<0){state.pets.owned.push(pet.id);state.pets.names[pet.id]=pet.name;state.pets.levels[pet.id]=0;state.pets.feeds[pet.id]=0;if(!state.pets.current)state.pets.current=pet.id;state.pets.autoGranted=true;save();setTimeout(function(){showToast('🎉 Твой питомец: '+pet.emoji+' '+pet.name+'!');},800);}}
var RARITY_LABEL={common:'Обычный',rare:'Редкий',epic:'Эпический',legendary:'Легендарный'};

/* ============================================================
   ПРАКТИКИ
============================================================ */
function getPracticeCooldownRemaining(id){var cd=state.practiceCooldowns[id];if(!cd)return 0;var elapsed=(Date.now()-cd)/3600000;if(elapsed>=9)return 0;return 9-elapsed;}
function getPracticeDailyCount(id){var today=dateKey(new Date());var log=state.practiceDailyLog[today]||{};return log[id]||0;}
function canDoPractice(id){var cd=getPracticeCooldownRemaining(id);if(cd>0)return {ok:false,reason:'Кулдаун '+Math.ceil(cd)+'ч'};var daily=getPracticeDailyCount(id);if(daily>=2)return {ok:false,reason:'Лимит 2/день'};return {ok:true};}
function logHabitFromPractice(pid){var m={water:'h_water',wake:'h_wake',cold:'h_cold',meditate:'h_meditate',read:'h_read',nophone:'h_nophone'};var hid=m[pid];var p=null;var all=getAllPractices();for(var i=0;i<all.length;i++)if(all[i].id===pid)p=all[i];if(p&&p.cat==='body')hid='h_sport';if(!hid)return;var t=dateKey(new Date());if(!state.habits.log[t])state.habits.log[t]={};state.habits.log[t][hid]=true;save();}
function completePractice(id,xp){
  var p=null;var all=getAllPractices();
  for(var i=0;i<all.length;i++)if(all[i].id===id)p=all[i];
  var cat=p?p.cat:'disc';
  var check=canDoPractice(id);
  if(!check.ok){showToast(check.reason,true);return;}
  state.practiceCooldowns[id]=Date.now();
  var today=dateKey(new Date());
  if(!state.practiceDailyLog[today])state.practiceDailyLog[today]={};
  state.practiceDailyLog[today][id]=(state.practiceDailyLog[today][id]||0)+1;
  var now=Date.now();
  if(now-state.lastPracticeTime<600000){state.combo=(state.combo||0)+1;}else{state.combo=1;}
  state.lastPracticeTime=now;
  if(state.combo>(state.maxCombo||0))state.maxCombo=state.combo;
  var mult=getTotalMultiplier(cat);
  var comboMult=1;
  if(state.combo>=3&&getPracticeDailyCount(id)===1)comboMult=1.5;
  else if(state.combo>=2&&getPracticeDailyCount(id)===1)comboMult=1.2;
  var bonusMult=1;
  var roll=Math.random();
  if(roll>0.9)bonusMult=2;
  else if(roll>0.75)bonusMult=1.5;
  var gained=Math.round(xp*mult*comboMult*bonusMult);
  addXP(gained);
  state.totalDone++;
  if(!state.completionCounter)state.completionCounter={};
  state.completionCounter[id]=(state.completionCounter[id]||0)+1;
  if(!state.categoryStats)state.categoryStats={disc:0,breath:0,body:0,mind:0,spirit:0,health:0};
  state.categoryStats[cat]=(state.categoryStats[cat]||0)+1;
  var k=dateKey(new Date());
  state.history[k]=(state.history[k]||0)+gained;
  save();
  var msgs=[];
  if(comboMult>1)msgs.push('🔥×'+comboMult);
  if(bonusMult>1)msgs.push('✨×'+bonusMult);
  var comboTxt=msgs.length?' '+msgs.join(' '):'';
  setTimeout(function(){showToast('+'+gained+' XP'+comboTxt);},300);
  if(state.sound)beep();
  logHabitFromPractice(id);
  damageBoss(gained);
  checkAchievements();checkDailyCard();checkNewCards();
}
function changeTier(id,delta){
  var p=null;var all=getAllPractices();
  for(var i=0;i<all.length;i++)if(all[i].id===id)p=all[i];
  if(!p||!p.tiers)return;
  var cur=getTier(id);
  var newT=Math.max(1,Math.min(p.tiers.length,cur+delta));
  if(newT===cur)return;
  if(delta>0){
    var lvl=getLevel(state.xpEarned);
    var nextTd=p.tiers[newT-1];
    var needLvl=nextTd.lvl||0;
    var countOnTier=state.completionCounter[id]||0;
    var baseCount=(cur-1)*5;
    var doneOnTier=Math.max(0,countOnTier-baseCount);
    if(lvl<needLvl){showToast('Нужен Ур. '+(needLvl+1),true);return;}
    if(doneOnTier<5){showToast('Выполни ещё '+(5-doneOnTier)+'× на этом уровне',true);return;}
  }
  if(!state.practiceTiers)state.practiceTiers={};
  state.practiceTiers[id]=newT;
  save();render();
  showToast('Ур: '+newT+' / '+p.tiers.length);
}
function showPracticeInfo(id){var p=null;var all=getAllPractices();for(var i=0;i<all.length;i++)if(all[i].id===id)p=all[i];if(!p)return;document.getElementById('infoTitle').textContent=p.icon+' '+p.name;var tiers=p.tiers||[],h='';for(var j=0;j<tiers.length;j++){var t=tiers[j];var reached=j+1<=getTier(id);h+='<div style="margin-bottom:10px;padding:12px;background:rgba(255,255,255,0.04);border-radius:12px;border-left:3px solid '+(reached?'#4cd964':'rgba(245,241,255,0.3)')+'"><b style="color:'+(reached?'#4cd964':'#4facfe')+'">Ур. '+(j+1)+':</b> '+t.name+'<br><span style="font-size:11.5px;color:var(--text-soft)">+'+t.xp+' XP'+(t.lvl?' · откр. Ур. '+(t.lvl+1):'')+'</span></div>';}document.getElementById('infoBody').innerHTML=h;document.getElementById('infoModal').classList.add('active');}

/* ============================================================
   ТАЙМЕР ПРАКТИКИ
============================================================ */
var _pracTimerInterval=null,_pracTimerRemaining=0,_pracTimerTotal=0,_pracPendingId=null,_pracPendingXP=0;
function startPracticeTimer(id,xp,timerSeconds){
  if(_pracTimerInterval){clearInterval(_pracTimerInterval);_pracTimerInterval=null;}
  _pracPendingId=id;_pracPendingXP=xp;_pracTimerTotal=timerSeconds;_pracTimerRemaining=timerSeconds;
  var all=getAllPractices();
  var p=null;for(var i=0;i<all.length;i++)if(all[i].id===id)p=all[i];
  document.getElementById('timerPracTitle').textContent=p?p.icon+' '+p.name:'Практика';
  document.getElementById('timerPracDesc').textContent='Удерживай внимание. Таймер идёт.';
  document.getElementById('pracTimerText').textContent=formatTime(timerSeconds);
  document.getElementById('pracTimerLabel').textContent='Осталось';
  document.getElementById('pracTimerCircle').style.strokeDashoffset=502;
  var btn=document.getElementById('pracConfirmBtn');
  btn.disabled=true;btn.classList.remove('ready');btn.textContent='⏱ Осталось '+formatTime(timerSeconds);
  document.getElementById('practiceTimerModal').classList.add('active');
  _pracTimerInterval=setInterval(function(){
    _pracTimerRemaining--;
    if(_pracTimerRemaining<=0){
      clearInterval(_pracTimerInterval);_pracTimerInterval=null;
      _pracTimerRemaining=0;
      document.getElementById('pracTimerText').textContent='0:00';
      document.getElementById('pracTimerLabel').textContent='Готово!';
      document.getElementById('pracConfirmBtn').disabled=false;
      document.getElementById('pracConfirmBtn').classList.add('ready');
      document.getElementById('pracConfirmBtn').textContent='✅ Подтвердить';
      if(state.sound)beep();
      if(navigator.vibrate)navigator.vibrate([100,50,100]);
      return;
    }
    var progress=1-(_pracTimerRemaining/_pracTimerTotal);
    document.getElementById('pracTimerCircle').style.strokeDashoffset=502*(1-progress);
    document.getElementById('pracTimerText').textContent=formatTime(_pracTimerRemaining);
    document.getElementById('pracConfirmBtn').textContent='⏱ Осталось '+formatTime(_pracTimerRemaining);
  },1000);
}
function formatTime(s){var m=Math.floor(s/60);var sec=s%60;return m+':'+String(sec).padStart(2,'0');}
function confirmPracticeComplete(){
  if(_pracTimerRemaining>0){showToast('Таймер ещё идёт',true);return;}
  if(!_pracPendingId)return;
  var id=_pracPendingId;var xp=_pracPendingXP;
  _pracPendingId=null;_pracPendingXP=0;
  closeModal('practiceTimerModal');
  if(state.todayDone.indexOf(id)>=0){showToast('Уже выполнено',true);return;}
  state.todayDone.push(id);
  completePractice(id,xp);
  render();
}
function cancelPracticeTimer(){if(_pracTimerInterval){clearInterval(_pracTimerInterval);_pracTimerInterval=null;}_pracPendingId=null;_pracPendingXP=0;closeModal('practiceTimerModal');}
function handlePracticeClick(id){
  var p=null;var all=getAllPractices();
  for(var i=0;i<all.length;i++)if(all[i].id===id)p=all[i];
  if(!p)return;
  var tier=getTier(id);
  var tiers=p.tiers||[{name:'',xp:p.xp||15}];
  var td=tiers[tier-1]||tiers[0];
  var lvl=getLevel(state.xpEarned);
  if(lvl<(td.lvl||0)){showToast('Нужен Ур. '+((td.lvl||0)+1),true);return;}
  var check=canDoPractice(id);
  if(!check.ok){showToast(check.reason,true);return;}
  var xp=td.xp||15;
  var breath=td.breath||p.breath;
  if(breath){openBreath(breath,id,xp);return;}
  var timer=td.timer||p.timer||0;
  if(timer>0){startPracticeTimer(id,xp,timer);return;}
  startPracticeTimer(id,xp,3);
}

/* ============================================================
   ДЫХАНИЕ
============================================================ */
var breathInterval=null,breathPattern=null,breathId=null,breathXp=0;
function openBreath(type,id,xp){closeBreath();document.getElementById('breathModal').classList.add('active');breathPattern=type;breathId=id;breathXp=xp;var t={'478':'Дыхание 4-7-8','box':'Квадратное','wim':'Вима Хофа','alt':'Нади Шодхана'};document.getElementById('breathTitle').textContent=t[type]||'Дыхание';document.getElementById('breathCircle').textContent='Приготовься';document.getElementById('breathCircle').className='breath-circle';document.getElementById('breathPhase').textContent='Нажми «Начать»';var btn=document.getElementById('breathBtn');btn.textContent='Начать';btn.onclick=startBreath;}
function closeBreath(){if(breathInterval){clearInterval(breathInterval);breathInterval=null;}closeModal('breathModal');}
function startBreath(){
  if(breathInterval)clearInterval(breathInterval);
  var c=document.getElementById('breathCircle'),p=document.getElementById('breathPhase'),b=document.getElementById('breathBtn');
  b.textContent='Стоп';b.onclick=function(){if(breathInterval){clearInterval(breathInterval);breathInterval=null;}b.textContent='Начать';b.onclick=startBreath;};
  var pat={'478':[['Вдох',4,'inhale'],['Задержка',7,''],['Выдох',8,'exhale']],'box':[['Вдох',4,'inhale'],['Задержка',4,''],['Выдох',4,'exhale'],['Задержка',4,'']],'wim':[['Вдох',2,'inhale'],['Выдох',2,'exhale']],'alt':[['Вдох Л',4,'inhale'],['Задержка',4,''],['Выдох П',4,'exhale'],['Задержка',4,'']]};
  var cyc=pat[breathPattern]||pat['478'];
  var step=0,sec=cyc[0][1],count=0;
  var tick=function(){var x=cyc[step];c.textContent=x[0]+' '+sec;c.className='breath-circle '+x[2];p.textContent='Цикл '+(count+1);sec--;if(sec<0){step++;if(step>=cyc.length){step=0;count++;}sec=cyc[step][1];}if(count>=4&&state.todayDone.indexOf(breathId)<0){state.todayDone.push(breathId);completePractice(breathId,breathXp);if(breathInterval){clearInterval(breathInterval);breathInterval=null;}closeModal('breathModal');render();}};
  tick();breathInterval=setInterval(tick,1000);
}

/* ============================================================
   КВЕСТЫ (3 сложности)
============================================================ */
var _questDifficulty='easy';
function updateQuestTimer(){var el=document.getElementById('questTimer');if(!el)return;var now=new Date();var tomorrow=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1,0,0,0);var diff=tomorrow-now;var h=Math.floor(diff/3600000);var m=Math.floor((diff%3600000)/60000);var s=Math.floor((diff%60000)/1000);el.textContent=(h<10?'0':'')+h+':'+(m<10?'0':'')+m+':'+(s<10?'0':'')+s;}
function pickQuestDifficulty(d){_questDifficulty=d;document.querySelectorAll('.quest-diff-opt').forEach(function(b){b.classList.toggle('selected',b.dataset.diff===d);});}
function startQuestSetup(){
  var today=dateKey(new Date());
  var pool=QUEST_POOL[_questDifficulty]||QUEST_POOL.easy;
  var shuffled=pool.slice().sort(function(){return Math.random()-0.5;});
  state.dailyQuests={date:today,difficulty:_questDifficulty,list:shuffled.slice(0,1).map(function(q){return q.id;}),completed:[]};
  save();render();
  showToast('⚔️ Квест начат!');
}
function completeQuest(qid){
  var dq=state.dailyQuests;if(!dq||!dq.list)return;
  var q=null;
  var allQ=[].concat(QUEST_POOL.easy,QUEST_POOL.medium,QUEST_POOL.hard);
  for(var j=0;j<allQ.length;j++){if(allQ[j].id===qid)q=allQ[j];}
  if(!q)return;
  if(dq.completed.indexOf(qid)>=0)return;
  if(!q.check(state)){showToast('Ещё не выполнено',true);return;}
  dq.completed.push(qid);
  addXP(q.reward);
  save();render();
  showToast('📜 +'+q.reward+' XP');
}
function checkQuests(){
  var dq=state.dailyQuests;
  if(!dq||dq.date!==dateKey(new Date())||!dq.list)return;
  var allQ=[].concat(QUEST_POOL.easy,QUEST_POOL.medium,QUEST_POOL.hard);
  for(var i=0;i<dq.list.length;i++){
    var qid=dq.list[i];
    if(dq.completed.indexOf(qid)>=0)continue;
    var q=null;
    for(var j=0;j<allQ.length;j++){if(allQ[j].id===qid)q=allQ[j];}
    if(!q)continue;
    if(q.check(state)){
      dq.completed.push(qid);
      addXP(q.reward);
      setTimeout((function(r){return function(){showToast('📜 Авто-выполнен: +'+r+' XP');};})(q.reward),1100);
      save();
    }
  }
}

/* ============================================================
   ЕЖЕДНЕВНЫЕ СОБЫТИЯ
============================================================ */
function ensureNewDay(){
  if(state.lastDate!==todayStr()){
    var y=new Date(Date.now()-86400000).toDateString();
    state.streak=(state.lastDate===y)?state.streak+1:1;
    if(state.streak>state.maxStreak)state.maxStreak=state.streak;
    state.totalDays++;
    state.todayDone=[];
    state.lastDate=todayStr();
    state.combo=0;
    state.dailyQuests={date:null,difficulty:null,list:[],completed:[]};
    generateDailyCard();checkWeeklyReward();checkBossWeek();
    state.currentQuoteIndex=(state.currentQuoteIndex+1)%QUOTES.length;
    state.currentAffirmation=(state.currentAffirmation+1)%AFFIRMATIONS.length;
    state.currentMantra=(state.currentMantra+1)%MANTRAS.length;
    save();
  }
}
function generateDailyCard(){var t=dateKey(new Date());if(state.dailyCard&&state.dailyCard.date===t)return;var c=CARD_TEMPLATES[Math.floor(Math.random()*CARD_TEMPLATES.length)];state.dailyCard={date:t,id:c.id,done:false,accepted:false};save();}
function checkWeeklyReward(){var today=dateKey(new Date());if(state.lastWeeklyCheck===today)return;state.lastWeeklyCheck=today;if(state.weekDays.indexOf(today)<0)state.weekDays.push(today);if(state.weekDays.length>7)state.weekDays=state.weekDays.slice(-7);save();}
function checkBossWeek(){var now=new Date();var day=now.getDay();var monday=new Date(now);monday.setDate(now.getDate()-((day+6)%7));var mk=dateKey(monday);if(state.bossWeek===mk)return;var boss=BOSSES[Math.floor(Math.random()*BOSSES.length)];state.bossCurrent=boss.id;state.bossHp=boss.hp;state.bossWeek=mk;save();}
function checkMissedDayPenalty(){var today=todayStr();if(state.lastPenaltyCheck===today)return;state.lastPenaltyCheck=today;if(!state.lastDate)return;var yesterday=new Date(Date.now()-86400000).toDateString();if(state.lastDate!==yesterday&&state.lastDate!==today&&state.lastDate!==null){var penaltyXp=Math.min(50,Math.round(state.xp*0.05));state.xp=Math.max(0,state.xp-penaltyXp);state.streak=Math.max(0,state.streak-1);state.missedDays=(state.missedDays||0)+1;save();}}
function acceptDailyCard(){if(!state.dailyCard)return;state.dailyCard.accepted=true;save();render();showToast('⚡ Вызов принят!');}
function checkDailyCard(){if(!state.dailyCard||state.dailyCard.done)return;var card=null;for(var i=0;i<CARD_TEMPLATES.length;i++){if(CARD_TEMPLATES[i].id===state.dailyCard.id)card=CARD_TEMPLATES[i];}if(!card)return;if(state.todayDone.indexOf(card.checkId)>=0){state.dailyCard.done=true;addXP(card.reward);state.cardsCompleted=(state.cardsCompleted||0)+1;setTimeout(function(){showToast('🎴 +'+card.reward+' XP');},900);if(state.sound)achSound();checkAchievements();save();}}
function damageBoss(dmg){if(!state.bossCurrent||!state.bossHp)return;state.bossHp=Math.max(0,state.bossHp-dmg);if(state.bossHp===0){var boss=null;for(var i=0;i<BOSSES.length;i++)if(BOSSES[i].id===state.bossCurrent)boss=BOSSES[i];if(boss){state.bossesDefeated=(state.bossesDefeated||0)+1;addXP(500);setTimeout(function(){showToast('🏆 '+boss.name+' побеждён! +500 XP');if(state.sound)achSound();},700);state.bossCurrent=null;state.bossHp=null;}}save();}

/* ============================================================
   ДОСТИЖЕНИЯ (упрощённый список)
============================================================ */
var ACHIEVEMENTS=[
{id:'first',icon:'🌱',name:'Первый шаг',desc:'1 практика',check:function(s){return s.totalDone>=1;}},
{id:'streak3',icon:'🔥',name:'Три дня',desc:'Стрик 3',check:function(s){return s.maxStreak>=3;}},
{id:'streak7',icon:'⚡',name:'Неделя',desc:'Стрик 7',check:function(s){return s.maxStreak>=7;}},
{id:'streak30',icon:'💎',name:'Воля',desc:'Стрик 30',check:function(s){return s.maxStreak>=30;}},
{id:'streak100',icon:'👑',name:'Легенда',desc:'Стрик 100',check:function(s){return s.maxStreak>=100;}},
{id:'xp500',icon:'⭐',name:'500 XP',desc:'500',check:function(s){return s.xpEarned>=500;}},
{id:'xp1500',icon:'🌟',name:'1500 XP',desc:'1500',check:function(s){return s.xpEarned>=1500;}},
{id:'xp4000',icon:'✨',name:'4000 XP',desc:'4000',check:function(s){return s.xpEarned>=4000;}},
{id:'done10',icon:'💪',name:'10 практик',desc:'10',check:function(s){return s.totalDone>=10;}},
{id:'done100',icon:'🚀',name:'100',desc:'100',check:function(s){return s.totalDone>=100;}},
{id:'mood7',icon:'📔',name:'Душа',desc:'7 отметок',check:function(s){return Object.keys(s.moods||{}).length>=7;}},
{id:'pet1',icon:'🥚',name:'Первый питомец',desc:'Получен',check:function(s){return (s.pets&&s.pets.owned&&s.pets.owned.length)>=1;}},
{id:'pet6',icon:'🐲',name:'Зоопарк',desc:'6 питомцев',check:function(s){return (s.pets&&s.pets.owned&&s.pets.owned.length)>=6;}},
{id:'build5',icon:'🏰',name:'Зодчий',desc:'5 построек',check:function(s){return (s.buildings||[]).length>=5;}},
{id:'boss1',icon:'⚔️',name:'Первый босс',desc:'Победа',check:function(s){return (s.bossesDefeated||0)>=1;}},
{id:'boss5',icon:'🐲',name:'5 боссов',desc:'5',check:function(s){return (s.bossesDefeated||0)>=5;}},
{id:'card5',icon:'🎴',name:'Коллекционер',desc:'5 карточек',check:function(s){return (s.collection||[]).length>=5;}},
{id:'card15',icon:'🃏',name:'Мастер карт',desc:'15 карточек',check:function(s){return (s.collection||[]).length>=15;}},
{id:'win10',icon:'🏆',name:'10 побед',desc:'Дневник побед',check:function(s){return (s.wins||[]).length>=10;}},
{id:'reflect7',icon:'💭',name:'Рефлексия',desc:'7 вечеров',check:function(s){return Object.keys(s.reflections||{}).length>=7;}},
{id:'balance',icon:'⚖️',name:'Баланс',desc:'Оценка сфер',check:function(s){return Object.keys(s.balance||{}).length>=4;}},
{id:'wheel10',icon:'🎡',name:'Колесо',desc:'10 вращений',check:function(s){return (s.wheelSpins||0)>=10;}},
{id:'savings',icon:'💰',name:'Копилка',desc:'Первая',check:function(s){return (s.savings||[]).length>=1;}},
{id:'food7',icon:'🍎',name:'Питание',desc:'7 дней еды',check:function(s){var d={};if(s.foodLog)for(var i=0;i<s.foodLog.length;i++)d[s.foodLog[i].date]=1;return Object.keys(d).length>=7;}}];
function checkAchievements(){for(var i=0;i<ACHIEVEMENTS.length;i++){var a=ACHIEVEMENTS[i];if(state.achievements.indexOf(a.id)>=0)continue;try{if(a.check(state)){state.achievements.push(a.id);save();showAchievementPopup(a);}}catch(e){}}}
function showAchievementPopup(a){var p=document.getElementById('achPopup');if(!p)return;document.getElementById('achPopupIcon').textContent=a.icon;document.getElementById('achPopupName').textContent=a.name;p.classList.add('show');if(state.sound)achSound();setTimeout(function(){p.classList.remove('show');},3200);}

/* ============================================================
   ФРАКТАЛЫ (canvas)
============================================================ */
var canvas,ctx,W=0,H=0,fractalStyle='mixed',fTime=0,fParts=[];
function initFractals(){canvas=document.getElementById('fractalCanvas');if(!canvas)return;ctx=canvas.getContext('2d');resizeCanvas();window.addEventListener('resize',resizeCanvas);for(var i=0;i<35;i++){fParts.push({x:Math.random(),y:Math.random(),size:40+Math.random()*130,speed:0.015+Math.random()*0.04,phase:Math.random()*Math.PI*2,hue:Math.random()*360,type:i%5,alpha:0.25+Math.random()*0.3});}requestAnimationFrame(animateFractals);}
function resizeCanvas(){if(!canvas)return;W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;}
function drawKoch(cx,cy,size,rot,hue,a){ctx.save();ctx.translate(cx,cy);ctx.rotate(rot);for(var i=0;i<6;i++){ctx.rotate(Math.PI/3);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(size,0);ctx.lineTo(size*0.66,size*0.35);ctx.lineTo(size*0.33,-size*0.15);ctx.closePath();ctx.strokeStyle='hsla('+hue+',80%,68%,'+a+')';ctx.lineWidth=1.6;ctx.stroke();}ctx.restore();}
function drawSierp(cx,cy,size,rot,hue,a){ctx.save();ctx.translate(cx,cy);ctx.rotate(rot);function t(x,y,s,d){if(d===0){ctx.beginPath();ctx.moveTo(x,y-s);ctx.lineTo(x-s*0.9,y+s*0.7);ctx.lineTo(x+s*0.9,y+s*0.7);ctx.closePath();ctx.strokeStyle='hsla('+hue+',85%,68%,'+a+')';ctx.lineWidth=1.3;ctx.stroke();return;}t(x,y-s*0.5,s*0.5,d-1);t(x-s*0.5,y+s*0.4,s*0.5,d-1);t(x+s*0.5,y+s*0.4,s*0.5,d-1);}t(0,0,size,3);ctx.restore();}
function drawPenta(cx,cy,size,rot,hue,a){ctx.save();ctx.translate(cx,cy);ctx.rotate(rot);for(var L=0;L<3;L++){var s=size*(1-L*0.25);ctx.beginPath();for(var i=0;i<=5;i++){var ang=(i/5)*Math.PI*2-Math.PI/2;var x=Math.cos(ang)*s,y=Math.sin(ang)*s;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.closePath();ctx.strokeStyle='hsla('+(hue+L*25)+',80%,70%,'+(a*(1-L*0.22))+')';ctx.lineWidth=1.5;ctx.stroke();}ctx.restore();}
function drawStar(cx,cy,size,rot,hue,a){ctx.save();ctx.translate(cx,cy);ctx.rotate(rot);for(var L=0;L<2;L++){var s=size*(1-L*0.4);ctx.beginPath();for(var i=0;i<16;i++){var ang=(i/16)*Math.PI*2-Math.PI/2;var r=i%2===0?s:s*0.42;var x=Math.cos(ang)*r,y=Math.sin(ang)*r;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.closePath();ctx.strokeStyle='hsla('+(hue+L*35)+',85%,72%,'+(a*(1-L*0.28))+')';ctx.lineWidth=1.5;ctx.stroke();}ctx.restore();}
function drawHex(cx,cy,size,rot,hue,a){ctx.save();ctx.translate(cx,cy);ctx.rotate(rot);for(var L=0;L<3;L++){var s=size*(1-L*0.3);ctx.beginPath();for(var i=0;i<=6;i++){var ang=(i/6)*Math.PI*2;var x=Math.cos(ang)*s,y=Math.sin(ang)*s;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.closePath();ctx.strokeStyle='hsla('+(hue+L*20)+',80%,70%,'+(a*(1-L*0.22))+')';ctx.lineWidth=1.6;ctx.stroke();}ctx.restore();}
function animateFractals(){if(!ctx)return;fTime+=0.007;ctx.clearRect(0,0,W,H);if(fractalStyle!=='none'){for(var i=0;i<fParts.length;i++){var p=fParts[i];p.phase+=p.speed*0.025;var cx=(p.x+Math.cos(fTime*0.35+p.phase)*0.09)*W;var cy=(p.y+Math.sin(fTime*0.28+p.phase*0.9)*0.09)*H;var rot=fTime*0.5+p.phase;var hue=(p.hue+fTime*12)%360;var a=p.alpha*(0.75+Math.sin(fTime*1.2+p.phase)*0.25);var fn;if(fractalStyle==='mixed')fn=[drawKoch,drawSierp,drawPenta,drawStar,drawHex][p.type];else if(fractalStyle==='koch')fn=drawKoch;else if(fractalStyle==='sierpinski')fn=drawSierp;else if(fractalStyle==='pentagon')fn=drawPenta;else if(fractalStyle==='star')fn=drawStar;else if(fractalStyle==='hex')fn=drawHex;if(fn)fn(cx,cy,p.size,rot,hue,a);}}requestAnimationFrame(animateFractals);}

/* ============================================================
   РЕНДЕР: КАРТА, АФФИРМАЦИЯ, ЦИТАТА, МАНТРА
============================================================ */
function renderCard(){var c=document.getElementById('cardContainer');if(!c)return;if(!state.dailyCard){c.innerHTML='';return;}var card=null;for(var i=0;i<CARD_TEMPLATES.length;i++)if(CARD_TEMPLATES[i].id===state.dailyCard.id)card=CARD_TEMPLATES[i];if(!card){c.innerHTML='';return;}var done=state.dailyCard.done,acc=state.dailyCard.accepted,isDone=state.todayDone.indexOf(card.checkId)>=0;var h='<div class="card-day '+(done?'done':'')+'"><div class="card-day-label">'+(done?'✅ ВЫПОЛНЕНО':(acc?'⚡ ПРИНЯТ':'🎴 КАРТА ДНЯ'))+'</div><div class="card-day-icon">'+card.icon+'</div><div class="card-day-title">'+card.title+'</div><div class="card-day-desc">'+card.desc+'</div><div class="card-day-reward">+'+(done?'✓ ':'')+card.reward+' XP</div>';if(!done){if(!acc)h+='<div class="card-day-actions"><button class="card-day-btn" onclick="acceptDailyCard()">⚡ ПРИНЯТЬ ВЫЗОВ</button></div>';else h+='<div class="card-day-progress"><b>Что делать:</b> '+card.action+'<br>'+(isDone?'✅ Выполнено!':'⏳ Выполни практику')+'</div>';}else h+='<div class="card-day-progress" style="background:rgba(76,217,100,0.15)">✅ +'+card.reward+' XP</div>';h+='</div>';c.innerHTML=h;}

function renderAffirmation(){
  var c=document.getElementById('affirmationContainer');if(!c)return;
  var idx=(state.currentAffirmation||0);
  var all=AFFIRMATIONS.concat(state.customAffirmations||[]);
  if(!all.length)all=['Я — творец своей реальности.'];
  var a=all[idx%all.length];
  c.innerHTML='<div class="affirmation-card"><div class="affirmation-icon">✨</div><div class="affirmation-text">«'+escapeHtml(a)+'»</div><div class="affirmation-sub">Аффирмация дня</div><button class="mini-btn purple" style="margin-top:14px" onclick="nextAffirmation()">🔄 Другая</button></div>';
}
function nextAffirmation(){state.currentAffirmation=((state.currentAffirmation||0)+1);state.affirmationsRead=(state.affirmationsRead||0)+1;if(state.affirmationsRead===10){addXP(50);showToast('💭 10 аффирмаций! +50 XP');}save();renderAffirmation();checkAchievements();}

function renderQuote(){var c=document.getElementById('quoteContainer');if(!c)return;var idx=(state.currentQuoteIndex||0)%QUOTES.length;var q=QUOTES[idx];c.innerHTML='<div class="quote-card"><div class="quote-icon">💭</div><div class="quote-text">«'+q.q+'»</div><div class="quote-author">— '+q.a+'</div><button class="mini-btn purple" style="margin-top:14px" onclick="nextQuote()">🔄</button></div>';}
function nextQuote(){state.currentQuoteIndex=((state.currentQuoteIndex||0)+1)%QUOTES.length;save();renderQuote();}

function renderMantra(){var c=document.getElementById('mantraContainer');if(!c)return;var idx=(state.currentMantra||0)%MANTRAS.length;var m=MANTRAS[idx];c.innerHTML='<div class="mantra-card"><div class="mantra-icon">🧘</div><div class="mantra-text">«'+m+'»</div><div class="mantra-sub">Мантра дня</div><button class="mini-btn purple" style="margin-top:14px" onclick="nextMantra()">🔄 Другая</button></div>';}
function nextMantra(){state.currentMantra=((state.currentMantra||0)+1)%MANTRAS.length;save();renderMantra();}

/* ============================================================
   РЕНДЕР: КОЛЕСО ФОРТУНЫ
============================================================ */
var WHEEL_PRIZES=[
{icon:'⭐',name:'50 XP',desc:'Мгновенный бонус',type:'xp',value:50,weight:20},
{icon:'💫',name:'100 XP',desc:'Хорошо!',type:'xp',value:100,weight:15},
{icon:'🎁',name:'Бонусный сундук',desc:'Ещё один сундук!',type:'chest',value:1,weight:10},
{icon:'⚡',name:'150 XP',desc:'Отличный спин!',type:'xp',value:150,weight:10},
{icon:'💎',name:'250 XP',desc:'Редкий выигрыш',type:'xp',value:250,weight:6},
{icon:'🍀',name:'Удача дня',desc:'Всё XP ×1.5 на час',type:'luck',value:1,weight:8},
{icon:'🔥',name:'+1 стрик',desc:'Бонусный день',type:'streak',value:1,weight:5},
{icon:'👑',name:'500 XP',desc:'ДЖЕКПОТ!',type:'xp',value:500,weight:2},
{icon:'💔',name:'Пусто',desc:'Завтра повезёт!',type:'empty',value:0,weight:14},
{icon:'🌸',name:'Спокойствие',desc:'+30 XP',type:'xp',value:30,weight:10}];
function getWheelPrize(){
  var total=0;for(var i=0;i<WHEEL_PRIZES.length;i++)total+=WHEEL_PRIZES[i].weight;
  var r=Math.random()*total;var acc=0;
  for(var j=0;j<WHEEL_PRIZES.length;j++){acc+=WHEEL_PRIZES[j].weight;if(r<acc)return {prize:WHEEL_PRIZES[j],index:j};}
  return {prize:WHEEL_PRIZES[0],index:0};
}
function canSpinWheel(){var t=dateKey(new Date());return state.lastWheelSpin!==t;}
function spinWheel(){
  if(!canSpinWheel()){showToast('Завтра снова!',true);return;}
  var result=getWheelPrize();
  var angle=360*5+result.index*(360/WHEEL_PRIZES.length)+(360/WHEEL_PRIZES.length/2);
  var svg=document.getElementById('wheelSvg');
  if(svg)svg.style.transform='rotate('+angle+'deg)';
  var center=document.getElementById('wheelCenter');
  if(center)center.textContent='🌀';
  if(state.sound)beep();
  setTimeout(function(){
    state.lastWheelSpin=dateKey(new Date());
    state.wheelSpins=(state.wheelSpins||0)+1;
    var p=result.prize;
    if(p.type==='xp'){addXP(p.value);showToast('🎉 '+p.icon+' '+p.name+'!');}
    else if(p.type==='chest'){state.lastChestDate=null;showToast('🎁 Доп. сундук доступен!');}
    else if(p.type==='streak'){state.streak+=p.value;if(state.streak>state.maxStreak)state.maxStreak=state.streak;showToast('🔥 +1 стрик!');}
    else if(p.type==='luck'){state.luckBonusUntil=Date.now()+3600000;showToast('🍀 Удача! XP ×1.5 на час');}
    else{showToast('💔 Пусто... завтра повезёт!');}
    save();render();
    if(state.sound)achSound();
    checkAchievements();
  },4200);
}
function renderWheel(){
  var c=document.getElementById('wheelContainer');if(!c)return;
  var canSpin=canSpinWheel();
  var h='<div class="wheel-container">';
  h+='<div class="wheel-pointer">▼</div>';
  h+='<svg class="wheel-svg" id="wheelSvg" viewBox="0 0 200 200">';
  var colors=['#8b7cff','#4facfe','#f093fb','#f5576c','#ffd166','#4cd964','#a855f7','#ec4899','#06b6d4','#ff6b6b'];
  var seg=360/WHEEL_PRIZES.length;
  for(var i=0;i<WHEEL_PRIZES.length;i++){
    var start=seg*i-90;var end=seg*(i+1)-90;
    var startRad=start*Math.PI/180;var endRad=end*Math.PI/180;
    var x1=100+95*Math.cos(startRad);var y1=100+95*Math.sin(startRad);
    var x2=100+95*Math.cos(endRad);var y2=100+95*Math.sin(endRad);
    var large=seg>180?1:0;
    h+='<path d="M 100 100 L '+x1+' '+y1+' A 95 95 0 '+large+' 1 '+x2+' '+y2+' Z" fill="'+colors[i%colors.length]+'" opacity="0.85" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>';
    var midRad=(startRad+endRad)/2;
    var ix=100+65*Math.cos(midRad);var iy=100+65*Math.sin(midRad);
    h+='<text x="'+ix+'" y="'+(iy+5)+'" text-anchor="middle" font-size="16">'+WHEEL_PRIZES[i].icon+'</text>';
  }
  h+='</svg>';
  h+='<div class="wheel-center" id="wheelCenter" onclick="'+(canSpin?'spinWheel()':'')+'">'+(canSpin?'🎯':'⏰')+'</div>';
  h+='</div>';
  if(canSpin){h+='<div class="info-text" style="text-align:center">Нажми на центр, чтобы крутить</div>';}
  else{h+='<div class="info-text" style="text-align:center">✅ Сегодня уже крутил. Возвращайся завтра!</div>';}
  h+='<div class="section-title">Призы</div>';
  for(var j=0;j<WHEEL_PRIZES.length;j++){
    var p=WHEEL_PRIZES[j];
    h+='<div class="setting"><span class="setting-label">'+p.icon+' '+p.name+'</span><span class="setting-value" style="font-size:11px;color:var(--text-soft)">'+p.weight+'%</span></div>';
  }
  c.innerHTML=h;
}

/* ============================================================
   РЕНДЕР: ТЕПЛОВАЯ КАРТА
============================================================ */
function renderHeatmap(){
  var c=document.getElementById('heatmapContainer');if(!c)return;
  var h='';
  var totalXp=0;var activeDays=0;var bestDay=0;var bestDayDate='';
  var today=new Date();
  var cells=[];
  var startDate=new Date(today);
  startDate.setDate(startDate.getDate()-363);
  var startDay=startDate.getDay();
  startDate.setDate(startDate.getDate()-startDay);
  var curDate=new Date(startDate);
  while(curDate<=today){
    var k=dateKey(curDate);
    var xp=state.history[k]||0;
    totalXp+=xp;
    if(xp>0)activeDays++;
    if(xp>bestDay){bestDay=xp;bestDayDate=k;}
    var level=0;
    if(xp>=150)level=4;
    else if(xp>=80)level=3;
    else if(xp>=30)level=2;
    else if(xp>0)level=1;
    cells.push({key:k,xp:xp,level:level,isToday:k===dateKey(new Date())});
    curDate.setDate(curDate.getDate()+1);
  }
  h+='<div class="heatmap-wrap"><div class="heatmap-grid">';
  for(var i=0;i<cells.length;i++){
    var cls='heatmap-cell'+(cells[i].level>0?' l'+cells[i].level:'')+(cells[i].isToday?' today':'');
    h+='<div class="'+cls+'" title="'+cells[i].key+': '+cells[i].xp+' XP" onclick="showDayDetail(\''+cells[i].key+'\')"></div>';
  }
  h+='</div>';
  h+='<div class="heatmap-legend"><span>Меньше</span><div class="heatmap-legend-dot" style="background:rgba(255,255,255,0.05)"></div><div class="heatmap-legend-dot" style="background:rgba(139,124,255,0.3)"></div><div class="heatmap-legend-dot" style="background:rgba(139,124,255,0.55)"></div><div class="heatmap-legend-dot" style="background:rgba(139,124,255,0.8)"></div><div class="heatmap-legend-dot" style="background:linear-gradient(135deg,#8b7cff,#f093fb)"></div><span>Больше</span></div></div>';
  h+='<div class="profile-section"><div class="profile-section-title">📊 За год</div><div class="profile-metric-grid"><div class="profile-metric"><div class="profile-metric-value blue">'+activeDays+'</div><div class="profile-metric-label">Активных дней</div></div><div class="profile-metric"><div class="profile-metric-value gold">'+totalXp+'</div><div class="profile-metric-label">Всего XP</div></div><div class="profile-metric"><div class="profile-metric-value green">'+bestDay+'</div><div class="profile-metric-label">Лучший день</div><div class="profile-metric-hint">'+bestDayDate+'</div></div><div class="profile-metric"><div class="profile-metric-value pink">'+Math.round(activeDays/365*100)+'%</div><div class="profile-metric-label">Активность</div></div></div></div>';
  c.innerHTML=h;
}

/* ============================================================
   РЕНДЕР: ПРОГНОЗ
============================================================ */
function renderForecast(){
  var c=document.getElementById('forecastContainer');if(!c)return;
  var h='';
  var totalRecent=0,daysCounted=0;
  for(var i=0;i<14;i++){
    var k=dateKey(new Date(Date.now()-i*86400000));
    var xp=state.history[k]||0;
    totalRecent+=xp;
    if(xp>0)daysCounted++;
  }
  var avgPerDay=totalRecent/14;
  var avgPerActiveDay=daysCounted>0?totalRecent/daysCounted:0;
  var lvlIdx=getLevel(state.xpEarned||0);
  var nextLvl=LEVELS[lvlIdx+1];
  h+='<div class="forecast-card"><div class="forecast-title">⚡ Твой темп</div><div class="forecast-row"><span>Среднее в день</span><span class="forecast-value">'+Math.round(avgPerDay)+' XP</span></div><div class="forecast-row"><span>За активный день</span><span class="forecast-value">'+Math.round(avgPerActiveDay)+' XP</span></div><div class="forecast-row"><span>Активность (14д)</span><span class="forecast-value">'+Math.round(daysCounted/14*100)+'%</span></div></div>';
  if(nextLvl&&avgPerDay>0){
    var needXp=nextLvl.xp-(state.xpEarned||0);
    var daysToLevel=Math.ceil(needXp/avgPerDay);
    var levelDate=new Date(Date.now()+daysToLevel*86400000);
    h+='<div class="forecast-card"><div class="forecast-title">🎯 До следующего уровня</div><div class="forecast-highlight"><div class="forecast-highlight-value">'+daysToLevel+'</div><div class="forecast-highlight-label">дней до Ур. '+(lvlIdx+2)+'</div></div><div class="forecast-row" style="margin-top:12px"><span>Дата</span><span class="forecast-value">'+levelDate.toLocaleDateString('ru-RU')+'</span></div><div class="forecast-row"><span>Нужно XP</span><span class="forecast-value">'+needXp+'</span></div></div>';
  }
  if(state.bodyLog&&state.bodyLog.length>=7&&state.profile.targetWeight){
    var firstLog=state.bodyLog[0];
    var lastLog=state.bodyLog[state.bodyLog.length-1];
    var daysDiff=Math.max(1,(new Date(lastLog.date)-new Date(firstLog.date))/86400000);
    var weightChange=lastLog.weight-firstLog.weight;
    var ratePerDay=weightChange/daysDiff;
    var target=state.profile.targetWeight;
    var needChange=target-lastLog.weight;
    if(Math.abs(ratePerDay)>0.001&&(needChange*ratePerDay>0)){
      var daysToGoal=Math.ceil(Math.abs(needChange/ratePerDay));
      var goalDate=new Date(Date.now()+daysToGoal*86400000);
      h+='<div class="forecast-card"><div class="forecast-title">⚖️ Прогноз по весу</div><div class="forecast-row"><span>Темп</span><span class="forecast-value">'+(ratePerDay>0?'+':'')+(ratePerDay*7).toFixed(2)+' кг/нед</span></div><div class="forecast-row"><span>До цели</span><span class="forecast-value">'+Math.abs(needChange).toFixed(1)+' кг</span></div><div class="forecast-highlight"><div class="forecast-highlight-value">'+daysToGoal+'</div><div class="forecast-highlight-label">дней до цели</div></div><div class="forecast-row" style="margin-top:12px"><span>Дата</span><span class="forecast-value">'+goalDate.toLocaleDateString('ru-RU')+'</span></div></div>';
    }
  }
  if(!h)c.innerHTML='<div class="empty-state"><div class="empty-state-icon">📈</div>Мало данных</div>';
  else c.innerHTML=h;
}

/* ============================================================
   РЕНДЕР: КОЛЛЕКЦИЯ КАРТОЧЕК
============================================================ */
function renderCollection(){
  var c=document.getElementById('collectionContainer');if(!c)return;
  var owned=state.collection||[];
  var h='<div class="collection-summary"><div class="collection-count">'+owned.length+' / '+COLLECTION_CARDS.length+'</div><div class="collection-label">Карточек собрано</div></div>';
  /* Группируем по редкости */
  var groups={legendary:[],epic:[],rare:[],common:[]};
  for(var i=0;i<COLLECTION_CARDS.length;i++){
    var card=COLLECTION_CARDS[i];
    var has=owned.indexOf(card.id)>=0;
    groups[card.rarity].push({card:card,has:has});
  }
  var order=['legendary','epic','rare','common'];
  var titles={legendary:'👑 Легендарные',epic:'🔮 Эпические',rare:'💎 Редкие',common:'📦 Обычные'};
  for(var k=0;k<order.length;k++){
    var r=order[k];
    if(!groups[r].length)continue;
    h+='<div class="section-title">'+titles[r]+' ('+groups[r].filter(function(x){return x.has;}).length+'/'+groups[r].length+')</div>';
    h+='<div class="collection-grid">';
    for(var j=0;j<groups[r].length;j++){
      var item=groups[r][j];
      h+='<div class="collection-card '+r+(item.has?'':' locked')+'">';
      h+='<div class="collection-icon">'+(item.has?item.card.icon:'❓')+'</div>';
      h+='<div class="collection-name">'+(item.has?item.card.name:'???')+'</div>';
      h+='<div class="collection-rarity">'+r.toUpperCase()+'</div>';
      h+='</div>';
    }
    h+='</div>';
  }
  c.innerHTML=h;
}

/* ============================================================
   РЕФЛЕКСИЯ ВЕЧЕРОМ
============================================================ */
function renderReflection(){
  var c=document.getElementById('reflectionContainer');if(!c)return;
  var today=dateKey(new Date());
  var todayData=state.reflections[today]||{};
  var h='<div class="info-text">Ответь на 3 вопроса. Это займёт 2 минуты, но изменит взгляд на день.</div>';
  for(var i=0;i<REFLECTION_QUESTIONS.length;i++){
    var q=REFLECTION_QUESTIONS[i];
    var val=todayData[q.key]||'';
    h+='<div class="reflection-question">';
    h+='<div class="reflection-q-title"><span class="reflection-q-icon">'+q.icon+'</span>'+q.title+'</div>';
    h+='<textarea class="reflection-q-textarea" id="refl_'+q.key+'" placeholder="Напиши что-нибудь...">'+escapeHtml(val)+'</textarea>';
    h+='</div>';
  }
  h+='<button class="btn-block primary" onclick="saveReflection()">💾 Сохранить рефлексию</button>';
  /* История */
  var keys=Object.keys(state.reflections).sort().reverse().slice(1,6);
  if(keys.length){
    h+='<div class="section-title">📖 Прошлые дни</div>';
    for(var k=0;k<keys.length;k++){
      var dayData=state.reflections[keys[k]];
      h+='<div class="reflection-history-item">';
      h+='<div class="reflection-history-date">'+keys[k]+'</div>';
      for(var j=0;j<REFLECTION_QUESTIONS.length;j++){
        var qq=REFLECTION_QUESTIONS[j];
        if(dayData[qq.key]){
          h+='<div class="reflection-history-q">'+qq.icon+' '+qq.title+'</div>';
          h+='<div class="reflection-history-a">'+escapeHtml(dayData[qq.key])+'</div>';
        }
      }
      h+='</div>';
    }
  }
  c.innerHTML=h;
}
function saveReflection(){
  var today=dateKey(new Date());
  var data={};
  for(var i=0;i<REFLECTION_QUESTIONS.length;i++){
    var q=REFLECTION_QUESTIONS[i];
    var el=document.getElementById('refl_'+q.key);
    if(el&&el.value.trim())data[q.key]=el.value.trim();
  }
  if(!Object.keys(data).length){showToast('Заполни хотя бы один',true);return;}
  var isFirst=!state.reflections[today];
  state.reflections[today]=data;
  if(isFirst){addXP(30);showToast('💭 +30 XP за рефлексию!');}
  else{showToast('💾 Обновлено');}
  save();render();checkAchievements();checkNewCards();
}

/* ============================================================
   ДНЕВНИК ПОБЕД
============================================================ */
function renderWins(){
  var c=document.getElementById('winsContainer');if(!c)return;
  var h='<div class="info-text">Одна маленькая победа в день. Через месяц ты перечитаешь и удивишься.</div>';
  h+='<div class="input-row"><input class="plan-input" id="winInput" placeholder="Что сегодня получилось?" maxlength="200" style="margin-bottom:0"><button class="mini-btn green" onclick="addWin()">➕</button></div>';
  var wins=(state.wins||[]).slice().reverse();
  if(!wins.length){h+='<div class="empty-state"><div class="empty-state-icon">🏆</div>Пока пусто. Начни с чего-то маленького!</div>';}
  else{
    var grouped={};
    for(var i=0;i<wins.length;i++){
      var d=wins[i].date;
      if(!grouped[d])grouped[d]=[];
      grouped[d].push(wins[i]);
    }
    var days=Object.keys(grouped).sort().reverse();
    for(var j=0;j<days.length;j++){
      h+='<div class="section-title">'+days[j]+'</div>';
      for(var k=0;k<grouped[days[j]].length;k++){
        var w=grouped[days[j]][k];
        h+='<div class="win-item"><div class="win-icon">🏆</div><div class="win-info"><div class="win-text">'+escapeHtml(w.text)+'</div></div></div>';
      }
    }
  }
  c.innerHTML=h;
}
function addWin(){
  var el=document.getElementById('winInput');if(!el)return;
  var v=el.value.trim();
  if(!v){showToast('Напиши победу',true);return;}
  if(!state.wins)state.wins=[];
  state.wins.push({date:dateKey(new Date()),text:v,ts:Date.now()});
  addXP(15);
  save();el.value='';render();showToast('🏆 +15 XP! Победа записана');
  checkAchievements();checkNewCards();
}

/* ============================================================
   КОЛЕСО БАЛАНСА
============================================================ */
var _balanceDraft={};
function openBalanceEdit(){
  _balanceDraft=Object.assign({},state.balance||{});
  renderBalanceEditList();
  document.getElementById('balanceEditModal').classList.add('active');
}
function renderBalanceEditList(){
  var c=document.getElementById('balanceEditList');if(!c)return;
  var h='<div style="font-size:12.5px;color:var(--text-dim);margin-bottom:14px;font-weight:600;line-height:1.6">Оцени каждую сферу от 1 до 10. Будь честным — увидишь перекосы.</div>';
  for(var i=0;i<BALANCE_SPHERES.length;i++){
    var s=BALANCE_SPHERES[i];
    var val=_balanceDraft[s.key]||5;
    h+='<div class="balance-slider">';
    h+='<div class="balance-slider-icon">'+s.icon+'</div>';
    h+='<div class="balance-slider-label">'+s.name+'</div>';
    h+='<input type="range" min="1" max="10" value="'+val+'" class="balance-slider-input" id="bal_'+s.key+'" oninput="updateBalanceValue(\''+s.key+'\',this.value)">';
    h+='<div class="balance-slider-value" id="balval_'+s.key+'">'+val+'</div>';
    h+='</div>';
  }
  c.innerHTML=h;
}
function updateBalanceValue(key,val){
  _balanceDraft[key]=parseInt(val);
  var el=document.getElementById('balval_'+key);
  if(el)el.textContent=val;
}
function saveBalance(){
  for(var i=0;i<BALANCE_SPHERES.length;i++){
    var s=BALANCE_SPHERES[i];
    var el=document.getElementById('bal_'+s.key);
    if(el)_balanceDraft[s.key]=parseInt(el.value);
  }
  var isFirst=!state.balance||!Object.keys(state.balance).length;
  state.balance=_balanceDraft;
  if(!state.balanceHistory)state.balanceHistory=[];
  state.balanceHistory.push({date:dateKey(new Date()),data:Object.assign({},_balanceDraft)});
  if(state.balanceHistory.length>24)state.balanceHistory=state.balanceHistory.slice(-24);
  state.lastBalanceUpdate=dateKey(new Date());
  if(isFirst){addXP(50);showToast('⚖️ +50 XP за первый баланс!');}
  else{showToast('💾 Сохранено');}
  save();closeModal('balanceEditModal');render();checkAchievements();checkNewCards();
}
function renderBalance(){
  var c=document.getElementById('balanceContainer');if(!c)return;
  var hasBalance=state.balance&&Object.keys(state.balance).length>=4;
  var h='';
  if(!hasBalance){
    h+='<div class="profile-empty"><div class="profile-empty-icon">⚖️</div><div class="profile-empty-title">Колесо пустое</div><div class="profile-empty-text">Оцени 8 сфер жизни от 1 до 10 — увидишь, где перекос, и куда направить внимание.</div><button class="profile-save-btn" onclick="openBalanceEdit()">✨ Оценить сферы</button></div>';
    c.innerHTML=h;
    return;
  }
  /* Строим SVG-колесо */
  var n=BALANCE_SPHERES.length;
  var cx=140,cy=140,rMax=110;
  var angleStep=(Math.PI*2)/n;
  var startAngle=-Math.PI/2;
  h+='<div class="balance-wheel"><svg viewBox="0 0 280 280">';
  /* Оси */
  for(var i=0;i<n;i++){
    var a=startAngle+i*angleStep;
    var x=cx+Math.cos(a)*rMax;var y=cy+Math.sin(a)*rMax;
    h+='<line x1="'+cx+'" y1="'+cy+'" x2="'+x+'" y2="'+y+'" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>';
  }
  /* Круги уровней */
  for(var lvl=2;lvl<=10;lvl+=2){
    var rr=(lvl/10)*rMax;
    h+='<circle cx="'+cx+'" cy="'+cy+'" r="'+rr+'" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>';
  }
  /* Полигон-заливка */
  var pts=[];
  for(var k=0;k<n;k++){
    var sphere=BALANCE_SPHERES[k];
    var val=state.balance[sphere.key]||5;
    var ang=startAngle+k*angleStep;
    var rad=(val/10)*rMax;
    var px=cx+Math.cos(ang)*rad;var py=cy+Math.sin(ang)*rad;
    pts.push(px+','+py);
  }
  h+='<polygon points="'+pts.join(' ')+'" fill="rgba(139,124,255,0.35)" stroke="#8b7cff" stroke-width="2"/>';
  /* Точки + эмодзи */
  for(var m=0;m<n;m++){
    var sp=BALANCE_SPHERES[m];
    var v=state.balance[sp.key]||5;
    var a2=startAngle+m*angleStep;
    var rad2=(v/10)*rMax;
    var px2=cx+Math.cos(a2)*rad2;var py2=cy+Math.sin(a2)*rad2;
    h+='<circle cx="'+px2+'" cy="'+py2+'" r="6" fill="#f093fb" stroke="#fff" stroke-width="1.5"/>';
    var lx=cx+Math.cos(a2)*(rMax+18);var ly=cy+Math.sin(a2)*(rMax+18);
    h+='<text x="'+lx+'" y="'+(ly+5)+'" text-anchor="middle" font-size="20">'+sp.icon+'</text>';
  }
  h+='</svg></div>';
  /* Список с оценками */
  h+='<div class="balance-scores">';
  for(var p=0;p<BALANCE_SPHERES.length;p++){
    var sp2=BALANCE_SPHERES[p];
    var val2=state.balance[sp2.key]||5;
    h+='<div class="balance-score-row"><div class="balance-score-icon">'+sp2.icon+'</div><div class="balance-score-name">'+sp2.name+'</div><div class="balance-score-bar"><div class="balance-score-fill" style="width:'+(val2*10)+'%"></div></div><div class="balance-score-value">'+val2+'</div></div>';
  }
  h+='</div>';
  /* Кнопки */
  h+='<button class="btn-block primary" style="margin-top:16px" onclick="openBalanceEdit()">✏️ Обновить оценку</button>';
  /* История */
  if(state.balanceHistory&&state.balanceHistory.length>1){
    h+='<div class="section-title">📈 История</div>';
    var lastFew=state.balanceHistory.slice(-3).reverse();
    for(var q=0;q<lastFew.length;q++){
      var entry=lastFew[q];
      var avg=0;var cnt=0;
      for(var key in entry.data){avg+=entry.data[key];cnt++;}
      avg=cnt?avg/cnt:0;
      h+='<div class="setting"><span class="setting-label">'+entry.date+'</span><span class="setting-value">Средний: '+avg.toFixed(1)+'</span></div>';
    }
  }
  c.innerHTML=h;
}

/* ============================================================
   ИНСАЙТЫ НЕДЕЛИ
============================================================ */
function renderInsights(){
  var c=document.getElementById('insightsContainer');if(!c)return;
  var h='';
  /* Считаем за 7 дней */
  var totalXp=0;var activeDays=0;var totalPractices=0;
  for(var i=0;i<7;i++){
    var k=dateKey(new Date(Date.now()-i*86400000));
    var xp=state.history[k]||0;
    totalXp+=xp;
    if(xp>0)activeDays++;
  }
  /* Топ категория */
  var cats=state.categoryStats||{};
  var topCat='',topVal=0;
  for(var key in cats){if(cats[key]>topVal){topVal=cats[key];topCat=key;}}
  var catNames={disc:'Дисциплина',breath:'Дыхание',body:'Тело',mind:'Разум',spirit:'Дух',health:'Здоровье'};
  /* Настроение за неделю */
  var moodScores=[];
  for(var m=0;m<7;m++){
    var k2=dateKey(new Date(Date.now()-m*86400000));
    if(state.moods[k2])moodScores.push(getMoodScore(state.moods[k2]));
  }
  var avgMood=moodScores.length?moodScores.reduce(function(a,b){return a+b;},0)/moodScores.length:0;
  /* Собираем инсайты */
  var insights=[];
  if(activeDays>=6)insights.push({icon:'🔥',title:'Идеальная неделя!',text:'Ты был активен <b>'+activeDays+' из 7</b> дней. Это огонь! Твой стрик — <b>'+state.streak+'</b> дней.'});
  else if(activeDays>=4)insights.push({icon:'⚡',title:'Хороший темп',text:'<b>'+activeDays+' активных дней</b> из 7. Ещё чуть-чуть до идеальной недели!'});
  else if(activeDays>=1)insights.push({icon:'🌱',title:'Начало положено',text:'<b>'+activeDays+' активных дней</b>. Постарайся добавить ещё 2-3 на следующей неделе.'});
  else insights.push({icon:'💭',title:'Новая неделя',text:'Пока тишина. Начни с одной маленькой практики — этого достаточно.'});
  if(avgMood>=6)insights.push({icon:'😊',title:'Отличное настроение',text:'Средний балл за неделю — <b>'+avgMood.toFixed(1)+'/7</b>. Ты на позитиве!'});
  else if(avgMood>=4.5)insights.push({icon:'😐',title:'Стабильное настроение',text:'Среднее <b>'+avgMood.toFixed(1)+'/7</b>. Держишь ровно.'});
  else if(avgMood>0)insights.push({icon:'🌧',title:'Сложная неделя',text:'Среднее <b>'+avgMood.toFixed(1)+'/7</b>. Обрати внимание на сон и воду.'});
  if(topCat)insights.push({icon:'📊',title:'Твоя сила: '+catNames[topCat],text:'За всё время <b>'+topVal+' практик</b> в категории «'+catNames[topCat]+'». Это твоя лучшая область.'});
  /* Слабейшая категория */
  var minVal=Infinity,minCat='';
  for(var kk in catNames){var v=cats[kk]||0;if(v<minVal){minVal=v;minCat=kk;}}
  if(minCat&&minVal<topVal/2)insights.push({icon:'⚠️',title:'Слабое место: '+catNames[minCat],text:'Всего <b>'+minVal+' практик</b>. Добавь одну в эту категорию — и баланс улучшится.'});
  if(state.streak>=7)insights.push({icon:'💎',title:'Стрик '+state.streak+' дней',text:'Ты держишь серию. Возвращение на день не обнуляет прогресс — но не пропускай!'});
  /* Прогноз следующего уровня */
  var avgPerDay=totalXp/7;
  var lvlIdx=getLevel(state.xpEarned||0);
  var nextLvl=LEVELS[lvlIdx+1];
  if(nextLvl&&avgPerDay>0){
    var days=Math.ceil((nextLvl.xp-(state.xpEarned||0))/avgPerDay);
    if(days>0&&days<365)insights.push({icon:'🎯',title:'Прогноз',text:'При текущем темпе — <b>'+days+' дней</b> до уровня «'+nextLvl.name+'».'});
  }
  for(var p=0;p<insights.length;p++){
    var ins=insights[p];
    h+='<div class="insight-week-card"><div class="insight-week-title"><span style="font-size:22px">'+ins.icon+'</span>'+ins.title+'</div><div class="insight-week-body">'+ins.text+'</div></div>';
  }
  c.innerHTML=h;
}

/* ============================================================
   РЕНДЕР: ПРОФИЛЬ
============================================================ */
function renderProfileRecommendations(){
  var p=state.profile;var bmi=calcBMI();var bmiCat=bmiCategory(bmi);var h='';
  if(p.goal==='lose')h+='<div class="recommendation-card"><div class="recommendation-head"><div class="recommendation-icon">🔥</div><div class="recommendation-title">Похудение</div></div><div class="recommendation-text">Дефицит <b>400 ккал</b>. Белки <b>2 г/кг</b>. Силовые 3×нед + кардио 2×нед.</div></div>';
  else if(p.goal==='gain')h+='<div class="recommendation-card info"><div class="recommendation-head"><div class="recommendation-icon">💪</div><div class="recommendation-title">Набор массы</div></div><div class="recommendation-text">Профицит <b>300 ккал</b>. Силовые <b>4×нед</b>. Сон 8+ч.</div></div>';
  else if(p.goal==='recomp')h+='<div class="recommendation-card info"><div class="recommendation-head"><div class="recommendation-icon">✨</div><div class="recommendation-title">Рельеф</div></div><div class="recommendation-text">Лёгкий дефицит <b>100 ккал</b>, высокий белок.</div></div>';
  else h+='<div class="recommendation-card"><div class="recommendation-head"><div class="recommendation-icon">⚖️</div><div class="recommendation-title">Поддержание</div></div><div class="recommendation-text">Ешь на норму. Силовые <b>3×нед</b>.</div></div>';
  if(bmiCat.index===1)h+='<div class="recommendation-card warn"><div class="recommendation-head"><div class="recommendation-icon">⚠️</div><div class="recommendation-title">Недостаток веса</div></div><div class="recommendation-text">ИМТ '+bmi+'. Профицит и силовые.</div></div>';
  else if(bmiCat.index>=4)h+='<div class="recommendation-card warn"><div class="recommendation-head"><div class="recommendation-icon">⚠️</div><div class="recommendation-title">Высокий ИМТ</div></div><div class="recommendation-text">ИМТ '+bmi+'. Ходьба, мягкий дефицит.</div></div>';
  if(p.sleepHours<7)h+='<div class="recommendation-card warn"><div class="recommendation-head"><div class="recommendation-icon">😴</div><div class="recommendation-title">Мало сна</div></div><div class="recommendation-text">Спишь <b>'+p.sleepHours+'ч</b>. Цель 8ч.</div></div>';
  return h;
}
function renderProfile(){
  var c=document.getElementById('profileContainer');if(!c)return;
  var p=state.profile;
  if(!p.onboardingComplete){c.innerHTML='<div class="profile-empty"><div class="profile-empty-icon">👤</div><div class="profile-empty-title">Заполни профиль</div><div class="profile-empty-text">Укажи дату рождения, рост, вес, цель — получишь персональные расчёты: калории, БЖУ, воду, гороскоп, нумерологию, питомца и рекомендации.</div><button class="profile-save-btn" onclick="openProfileEdit()">✨ Заполнить профиль</button></div>';return;}
  var age=calcAge(p.birthDate);
  var z=getWesternZodiac(p.birthDate);var cz=getChineseZodiac(p.birthDate);
  var bmr=calcBMR();var tdee=calcTDEE();var target=calcTargetCalories();var macros=calcMacros();
  var bmi=calcBMI();var bmiCat=bmiCategory(bmi);var idealW=calcIdealWeight();var waterGoal=calcWaterGoal();
  var lifePath=calcLifePath(p.birthDate);var destiny=calcDestinyNumber(p.name);var personalYear=calcPersonalYear(p.birthDate);
  var pyth=calcPythagoras(p.birthDate);
  var moon=getMoonPhase(new Date());
  var goalText={lose:'🔥 Похудение',gain:'💪 Набор массы',maintain:'⚖️ Поддержание',recomp:'✨ Рельеф'}[p.goal]||'—';
  var h='';
  h+='<div class="profile-header-card"><div class="profile-avatar-lg" onclick="openAvatarPicker()">'+state.avatar+'</div><div class="profile-name">'+escapeHtml(p.name)+'</div><div class="profile-subtitle">'+age+' лет · '+goalText+'</div><div class="profile-tags">';
  if(z)h+='<span class="profile-tag purple">'+z.icon+' '+z.sign+'</span>';
  if(cz)h+='<span class="profile-tag gold">'+cz.emoji+' '+cz.zodiac+'</span>';
  if(z)h+='<span class="profile-tag blue">'+z.element+'</span>';
  h+='</div></div>';
  h+='<div class="profile-section"><div class="profile-section-title">📊 Основные</div><div class="profile-metric-grid"><div class="profile-metric"><div class="profile-metric-value blue">'+p.height+'</div><div class="profile-metric-label">Рост (см)</div></div><div class="profile-metric"><div class="profile-metric-value pink">'+p.weight+'</div><div class="profile-metric-label">Вес (кг)</div></div><div class="profile-metric"><div class="profile-metric-value green">'+bmi+'</div><div class="profile-metric-label">ИМТ</div><div class="profile-metric-hint" style="color:'+bmiCat.color+'">'+bmiCat.cat+'</div></div><div class="profile-metric"><div class="profile-metric-value gold">'+idealW+'</div><div class="profile-metric-label">Идеальный вес</div></div></div>';
  h+='<div class="imt-bar"><div class="imt-seg s1"></div><div class="imt-seg s2"></div><div class="imt-seg s3"></div><div class="imt-seg s4"></div><div class="imt-seg s5"></div></div>';
  var pointerPct=Math.min(100,Math.max(0,((bmi-15)/25)*100));
  h+='<div class="imt-marker"><div class="imt-pointer" style="left:'+pointerPct+'%">▲</div></div><div class="imt-labels"><span>15</span><span>18.5</span><span>25</span><span>30</span><span>40</span></div></div>';
  h+='<div class="profile-section"><div class="profile-section-title">🔥 Калории и БЖУ</div><div class="profile-metric-grid"><div class="profile-metric"><div class="profile-metric-value">'+bmr+'</div><div class="profile-metric-label">BMR ккал</div><div class="profile-metric-hint">Базовый</div></div><div class="profile-metric"><div class="profile-metric-value">'+tdee+'</div><div class="profile-metric-label">TDEE ккал</div><div class="profile-metric-hint">С активностью</div></div><div class="profile-metric" style="grid-column:span 2;background:linear-gradient(135deg,rgba(255,209,102,0.15),rgba(245,87,108,0.1));border-color:rgba(255,209,102,0.4)"><div class="profile-metric-value gold" style="font-size:32px">'+target+'</div><div class="profile-metric-label">🎯 Целевые калории</div></div></div>';
  var totalMacro=macros.protein+macros.fat+macros.carbs||1;
  var pProtein=Math.round(macros.protein/totalMacro*100);var pFat=Math.round(macros.fat/totalMacro*100);var pCarbs=Math.round(macros.carbs/totalMacro*100);
  h+='<div class="macro-ring-wrap"><div class="macro-ring"><svg class="macro-ring-svg" viewBox="0 0 100 100"><circle class="macro-ring-bg" cx="50" cy="50" r="42"/><circle class="macro-ring-fill protein" cx="50" cy="50" r="42" stroke-dasharray="264" stroke-dashoffset="'+(264-(264*pProtein/100))+'"/></svg><div class="macro-ring-value" style="color:#4cd964">'+macros.proteinG+'г</div><div class="macro-ring-label">Белки</div></div><div class="macro-ring"><svg class="macro-ring-svg" viewBox="0 0 100 100"><circle class="macro-ring-bg" cx="50" cy="50" r="42"/><circle class="macro-ring-fill fat" cx="50" cy="50" r="42" stroke-dasharray="264" stroke-dashoffset="'+(264-(264*pFat/100))+'"/></svg><div class="macro-ring-value" style="color:#ffd166">'+macros.fatG+'г</div><div class="macro-ring-label">Жиры</div></div><div class="macro-ring"><svg class="macro-ring-svg" viewBox="0 0 100 100"><circle class="macro-ring-bg" cx="50" cy="50" r="42"/><circle class="macro-ring-fill carbs" cx="50" cy="50" r="42" stroke-dasharray="264" stroke-dashoffset="'+(264-(264*pCarbs/100))+'"/></svg><div class="macro-ring-value" style="color:#4facfe">'+macros.carbsG+'г</div><div class="macro-ring-label">Углеводы</div></div></div></div>';
  h+='<div class="profile-section"><div class="profile-section-title">💧 Вода и сон</div><div class="water-calc-display"><div><span class="water-calc-value">'+(waterGoal/1000).toFixed(1)+'</span><span class="water-calc-unit">л</span></div><div class="water-calc-label">Норма воды в день</div></div><div class="profile-stat-row"><span class="profile-stat-label">💤 Сон</span><span class="profile-stat-value">'+p.sleepHours+' часов</span></div><div class="profile-stat-row" style="cursor:pointer" onclick="openProfileMeals()"><span class="profile-stat-label">🍽 Приёмов пищи</span><span class="profile-stat-value">'+p.mealsPerDay+' →</span></div></div>';
  if(z||cz){
    h+='<div class="profile-section"><div class="profile-section-title">✨ Гороскоп</div>';
    if(z)h+='<div class="zodiac-card"><div class="zodiac-icon">'+z.icon+'</div><div class="zodiac-info"><div class="zodiac-name">'+z.sign+'</div><div class="zodiac-sub">'+z.element+' · '+z.planet+' · '+z.stone+'</div><div class="zodiac-desc">'+z.desc+'</div></div></div><button class="zodiac-expand" onclick="openZodiacDetail()">📖 Читать подробнее о знаке</button>';
    if(cz)h+='<div class="zodiac-card"><div class="zodiac-icon">'+cz.emoji+'</div><div class="zodiac-info"><div class="zodiac-name">'+cz.zodiac+'</div><div class="zodiac-sub">'+cz.element+' · '+cz.desc+'</div><div class="zodiac-desc">Твой дух-хранитель: <b>'+cz.name+'</b></div></div></div>';
    h+='<div class="zodiac-card" style="background:linear-gradient(135deg,rgba(79,172,254,0.15),rgba(139,124,255,0.1));border-color:rgba(79,172,254,0.35)"><div class="zodiac-icon" style="font-size:44px">🌙</div><div class="zodiac-info"><div class="zodiac-name">Лунный календарь</div><div class="zodiac-sub">Сегодня · '+moon.age+' день лунного цикла</div><div class="zodiac-desc">'+moon.phase+' · '+moon.percent+'% освещённости</div></div></div>';
    h+='</div>';
  }
  h+='<div class="profile-section"><div class="profile-section-title">🔢 Нумерология</div><div class="numerology-grid">';
  h+='<div class="numerology-cell" onclick="openNumerologyDetail(\'life\')"><div class="numerology-value">'+lifePath+'</div><div class="numerology-label">Жизненный путь</div><div class="numerology-desc">'+numMeaning(lifePath)+'</div></div>';
  h+='<div class="numerology-cell" onclick="openNumerologyDetail(\'destiny\')"><div class="numerology-value">'+destiny+'</div><div class="numerology-label">Число судьбы</div><div class="numerology-desc">'+numMeaning(destiny)+'</div></div>';
  h+='<div class="numerology-cell" style="grid-column:span 2" onclick="openNumerologyDetail(\'year\')"><div class="numerology-value">'+personalYear+'</div><div class="numerology-label">Персональный год</div><div class="numerology-desc">'+numMeaning(personalYear)+'</div></div>';
  h+='</div></div>';
  if(pyth){
    h+='<div class="profile-section"><div class="profile-section-title">🔮 Матрица Пифагора</div><div style="font-size:11.5px;color:var(--text-dim);line-height:1.6;margin-bottom:12px;font-weight:600">Психоматрица по дате рождения. Каждая ячейка — характеристика личности.</div><div class="pythagoras-grid">';
    var pythLabels=['Характер','Энергия','Интерес','Здоровье','Логика','Труд','Удача','Долг','Память'];
    for(var pn=1;pn<=9;pn++){
      var cnt=pyth.counts[pn]||0;
      var display=cnt>0?String(pn).repeat(cnt):'—';
      h+='<div class="pyth-cell'+(cnt===0?' empty':'')+'" title="'+pythLabels[pn-1]+'">'+display+'</div>';
    }
    h+='</div><div style="font-size:11px;color:var(--text-soft);text-align:center;margin-top:10px;font-weight:700">'+pythLabels.join(' · ')+'</div></div>';
  }
  h+='<div class="profile-section"><div class="profile-section-title">💡 Рекомендации</div>'+renderProfileRecommendations()+'</div>';
  h+='<button class="profile-edit-btn" onclick="openProfileEdit()">✏️ Редактировать профиль</button>';
  c.innerHTML=h;
}
function openZodiacDetail(){
  var z=getWesternZodiac(state.profile.birthDate);
  if(!z)return;
  document.getElementById('zodiacDetailTitle').textContent=z.icon+' '+z.sign;
  document.getElementById('zodiacDetailBody').innerHTML='<div style="font-size:13.5px;line-height:1.75">'+z.long+'</div>';
  document.getElementById('zodiacDetailModal').classList.add('active');
}
function openNumerologyDetail(type){
  var val=0;
  if(type==='life')val=calcLifePath(state.profile.birthDate);
  else if(type==='destiny')val=calcDestinyNumber(state.profile.name);
  else if(type==='year')val=calcPersonalYear(state.profile.birthDate);
  var labels={life:'Жизненный путь',destiny:'Число судьбы',year:'Персональный год'};
  document.getElementById('numerologyDetailTitle').textContent='🔢 '+labels[type]+': '+val;
  document.getElementById('numerologyDetailBody').innerHTML='<div style="font-size:13.5px;line-height:1.75">'+numMeaningLong(val)+'</div>';
  document.getElementById('numerologyDetailModal').classList.add('active');
}

/* ============================================================
   РЕНДЕР: ПИТОМЕЦ
============================================================ */
function renderPet(){
  var c=document.getElementById('petContainer');if(!c)return;
  if(!state.pets.current||state.pets.owned.length===0){
    c.innerHTML='<div class="profile-empty"><div class="profile-empty-icon">🐣</div><div class="profile-empty-title">У тебя пока нет питомца</div><div class="profile-empty-text">Заполни дату рождения — получишь духа-хранителя по китайскому знаку.</div><button class="profile-save-btn" onclick="openProfile()">👤 Заполнить профиль</button><button class="profile-edit-btn" onclick="showPage(\'petshop\')" style="margin-top:10px">🏪 Магазин</button></div>';
    return;
  }
  var pet=getPetById(state.pets.current);if(!pet){c.innerHTML='';return;}
  var lvl=getPetLevel(state.pets.current);
  var feeds=state.pets.feeds[state.pets.current]||0;
  var name=state.pets.names[state.pets.current]||pet.name;
  var mood=getPetMood();var speech=getPetSpeech();
  var stageName=getPetStageName(state.pets.current);
  var nextStage=PET_STAGES[lvl+1];var curStage=PET_STAGES[lvl];
  var progress=0,label='';
  if(nextStage){progress=(feeds-curStage.feeds)/(nextStage.feeds-curStage.feeds)*100;progress=Math.max(0,Math.min(100,progress));label=feeds+' / '+nextStage.feeds;}
  else{progress=100;label=feeds+' — МАКС';}
  var hungerPct=0;var lastFed=state.pets.lastFed[state.pets.current];
  if(lastFed)hungerPct=Math.max(0,100-((Date.now()-lastFed)/3600000/120)*100);
  var h='';
  h+='<div class="pet-card rarity-'+pet.rarity+'">';
  h+='<div class="pet-rare-badge rare-badge-'+pet.rarity+'">'+RARITY_LABEL[pet.rarity]+'</div>';
  h+='<div class="pet-emoji">'+pet.emoji+'</div>';
  h+='<div class="pet-name editable" onclick="openPetNameModal()">'+escapeHtml(name)+' ✏️</div>';
  h+='<div class="pet-level-text">Ур. '+lvl+' · '+stageName+' · '+pet.zodiac+'</div>';
  h+='<div class="pet-mood-badge '+mood.cls+'">'+mood.text+'</div>';
  h+='<div class="pet-speech">💬 '+speech+'</div>';
  h+='<div class="pet-progress-wrap"><div class="pet-progress-label"><span>Рост</span><span>'+label+'</span></div><div class="pet-progress-bar"><div class="pet-progress-fill" style="width:'+progress+'%;background:linear-gradient(90deg,#8b7cff,#f093fb)"></div></div></div>';
  h+='<div class="pet-progress-wrap"><div class="pet-progress-label"><span>Сытость</span><span>'+Math.round(hungerPct)+'%</span></div><div class="pet-hunger-bar"><div class="pet-hunger-fill" style="width:'+hungerPct+'%;background:linear-gradient(90deg,#4cd964,#4facfe)"></div></div></div>';
  h+='<div class="pet-stats"><div class="pet-stat"><div class="pet-stat-value">'+feeds+'</div><div class="pet-stat-label">Кормлений</div></div><div class="pet-stat"><div class="pet-stat-value">'+lvl+'</div><div class="pet-stat-label">Уровень</div></div><div class="pet-stat"><div class="pet-stat-value">'+pet.zodiac+'</div><div class="pet-stat-label">Знак</div></div></div>';
  h+='<div class="pet-actions-grid"><button class="pet-action-card" onclick="feedPet()"><div class="pet-action-icon">🍖</div><div class="pet-action-name">Покормить</div><div class="pet-action-cost">50 XP</div></button><button class="pet-action-card" onclick="playWithPet()"><div class="pet-action-icon">🎾</div><div class="pet-action-name">Поиграть</div><div class="pet-action-cost">30 XP · 1/день</div></button><button class="pet-action-card" onclick="washPet()"><div class="pet-action-icon">🛁</div><div class="pet-action-name">Помыть</div><div class="pet-action-cost">20 XP · 1/день</div></button><button class="pet-action-card" onclick="showPage(\'petshop\')"><div class="pet-action-icon">🏪</div><div class="pet-action-name">Магазин</div><div class="pet-action-cost">Ещё питомцы</div></button></div>';
  if(state.pets.owned.length>1){
    h+='<div style="margin-top:20px;text-align:left"><div style="font-size:11px;color:var(--text-soft);font-weight:800;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px">Мои питомцы</div><div class="my-pets-row">';
    for(var i=0;i<state.pets.owned.length;i++){
      var pid=state.pets.owned[i];var p2=getPetById(pid);if(!p2)continue;
      var pname=state.pets.names[pid]||p2.name;var isActive=pid===state.pets.current;
      h+='<div class="my-pet-mini rarity-'+p2.rarity+(isActive?' active':'')+'" onclick="switchPet(\''+pid+'\')"><div class="my-pet-emoji">'+p2.emoji+'</div><div class="my-pet-name">'+escapeHtml(pname)+'</div></div>';
    }
    h+='</div></div>';
  }
  h+='</div>';
  c.innerHTML=h;
}
function renderPetShop(){
  var c=document.getElementById('petshopContainer');if(!c)return;
  if(!state.profile.onboardingComplete){c.innerHTML='<div class="profile-empty"><div class="profile-empty-icon">🏪</div><div class="profile-empty-title">Сначала заполни профиль</div><button class="profile-save-btn" onclick="openProfile()">👤 Заполнить</button></div>';return;}
  var h='<div class="domain-summary" style="background:linear-gradient(135deg,rgba(255,209,102,0.15),rgba(139,124,255,0.1));border-color:rgba(255,209,102,0.35)"><div class="domain-title" style="font-size:13px;color:var(--text-dim);text-transform:uppercase;letter-spacing:2px">Твой баланс</div><div class="domain-bonus" style="font-size:32px;background:linear-gradient(90deg,#ffd166,#f5576c);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent">'+state.xp+' XP</div><div class="domain-extra">Куплено: '+state.pets.owned.length+' / '+PETS.length+'</div></div>';
  h+='<div class="petshop-grid">';
  for(var i=0;i<PETS.length;i++){
    var pet=PETS[i];var owned=state.pets.owned.indexOf(pet.id)>=0;var canBuy=!owned&&state.xp>=pet.price;
    var priceText=owned?'✅ У тебя':(pet.price===0?'Бесплатно':pet.price+' XP');
    h+='<div class="petshop-card rarity-'+pet.rarity+(owned?' owned':'')+'"><div class="petshop-rarity-line '+pet.rarity+'">'+RARITY_LABEL[pet.rarity]+'</div><div class="petshop-emoji">'+pet.emoji+'</div><div class="petshop-name">'+pet.name+'</div><div class="petshop-zodiac">'+pet.zodiac+' · '+pet.element+'</div>';
    if(!owned)h+='<div class="petshop-price '+(canBuy?'can-buy':'cant-buy')+'" onclick="'+(canBuy?'buyPet(\''+pet.id+'\')':'')+'">'+priceText+'</div>';
    h+='</div>';
  }
  h+='</div>';
  c.innerHTML=h;
}

/* ============================================================
   ПИТОМЕЦ — ДЕЙСТВИЯ
============================================================ */
function feedPet(){if(!state.pets.current){showToast('Сначала получи питомца',true);return;}if(!spendXP(50))return;var id=state.pets.current;state.pets.feeds[id]=(state.pets.feeds[id]||0)+1;state.pets.totalFeeds=(state.pets.totalFeeds||0)+1;state.pets.lastFed[id]=Date.now();var oldLvl=getPetLevel(id);save();render();var newLvl=getPetLevel(id);if(newLvl>oldLvl){var pet=getPetById(id);setTimeout(function(){showToast('🐣 '+pet.name+' вырос до ур. '+newLvl+'!');},500);if(state.sound)achSound();}else{showToast('🍖 Покормил! Всего: '+(state.pets.feeds[id]||0));}checkAchievements();}
function playWithPet(){if(!state.pets.current)return;var today=dateKey(new Date());if(state.pets.lastPlayed[state.pets.current]===today){showToast('Уже играли сегодня',true);return;}if(!spendXP(30))return;state.pets.lastPlayed[state.pets.current]=today;state.pets.lastFed[state.pets.current]=Date.now();save();render();showToast('🎾 Поиграли!');}
function washPet(){if(!state.pets.current)return;var today=dateKey(new Date());if(state.pets.lastWashed[state.pets.current]===today){showToast('Уже мыли сегодня',true);return;}if(!spendXP(20))return;state.pets.lastWashed[state.pets.current]=today;save();render();showToast('🛁 Помыли!');}
function switchPet(id){if(state.pets.owned.indexOf(id)<0)return;state.pets.current=id;save();render();var pet=getPetById(id);showToast('🔄 '+(state.pets.names[id]||pet.name));}
function openPetNameModal(){if(!state.pets.current)return;var pet=getPetById(state.pets.current);if(!pet)return;document.getElementById('petNameEmoji').textContent=pet.emoji;document.getElementById('petNewName').value=state.pets.names[state.pets.current]||pet.name;document.getElementById('petNameModal').classList.add('active');}
function savePetName(){var v=(document.getElementById('petNewName').value||'').trim();if(!v){showToast('Введи имя',true);return;}if(!state.pets.current)return;state.pets.names[state.pets.current]=v;save();closeModal('petNameModal');render();showToast('✏️ Имя изменено!');}
function buyPet(id){var pet=getPetById(id);if(!pet)return;if(state.pets.owned.indexOf(id)>=0){showToast('Уже куплен',true);return;}if(!spendXP(pet.price))return;state.pets.owned.push(id);state.pets.names[id]=pet.name;state.pets.levels[id]=0;state.pets.feeds[id]=0;save();render();showToast('🎉 Куплен: '+pet.emoji+' '+pet.name+'!');if(state.sound)achSound();checkAchievements();}

/* ============================================================
   РЕНДЕР: ДОМЕН, СУНДУК, WEEKLY, БОСС
============================================================ */
function renderDomain(){var c=document.getElementById('domainContainer');if(!c)return;var owned=state.buildings||[];var total=0,mind=0,body=0,health=0;for(var i=0;i<owned.length;i++){var b=null;for(var j=0;j<BUILDINGS.length;j++)if(BUILDINGS[j].id===owned[i])b=BUILDINGS[j];if(!b)continue;if(b.bonusType==='all')total+=b.bonusValue;if(b.bonusType==='mind_spirit')mind+=b.bonusValue;if(b.bonusType==='body')body+=b.bonusValue;if(b.bonusType==='health')health+=b.bonusValue;}var h='<div class="domain-summary"><div class="domain-title">Твой домен</div><div class="domain-bonus">+'+total+'% XP</div>'+(mind?'<div class="domain-extra">+'+mind+'% разум+дух</div>':'')+(body?'<div class="domain-extra">+'+body+'% тело</div>':'')+(health?'<div class="domain-extra">+'+health+'% здоровье</div>':'')+'</div>';h+='<div class="section-title">Постройки</div>';for(var k=0;k<BUILDINGS.length;k++){var bd=BUILDINGS[k];var has=owned.indexOf(bd.id)>=0;var lvl=getLevel(state.xpEarned);var can=!has&&lvl>=bd.reqLevel&&state.xp>=bd.cost;var cls='building-card'+(has?' built':'')+(!can&&!has?' locked':'');h+='<div class="'+cls+'"><div class="building-emoji">'+bd.emoji+'</div><div class="building-info"><div class="building-name">'+bd.name+'</div><div class="building-bonus">'+bd.bonus+'</div><div class="building-cost">'+(has?'✅ Построено':'💰 '+bd.cost+' XP'+(lvl<bd.reqLevel?' · Ур. '+(bd.reqLevel+1):''))+'</div></div>';if(!has)h+='<button class="build-btn" '+(can?'':'disabled')+' onclick="buyBuilding(\''+bd.id+'\')">'+(can?'🏗':'🔒')+'</button>';h+='</div>';}c.innerHTML=h;}
function buyBuilding(id){var b=null;for(var i=0;i<BUILDINGS.length;i++){if(BUILDINGS[i].id===id)b=BUILDINGS[i];}if(!b)return;if((state.buildings||[]).indexOf(id)>=0){showToast('Построено',true);return;}var lvl=getLevel(state.xpEarned);if(lvl<b.reqLevel){showToast('Нужен Ур. '+(b.reqLevel+1),true);return;}if(!spendXP(b.cost))return;if(!state.buildings)state.buildings=[];state.buildings.push(id);save();render();showToast('🏗 '+b.name);if(state.sound)achSound();checkAchievements();}
function renderChest(){var c=document.getElementById('chestContainer');if(!c)return;var t=dateKey(new Date());var can=state.lastChestDate!==t;var h='<div class="chest-card"><div class="chest-main'+(can?' available':'')+'">'+(can?'🎁':'📦')+'</div><div class="chest-title">'+(can?'Сундук готов!':'Приходи завтра')+'</div><div class="chest-sub">Открыто: '+(state.chestsOpened||0)+' · Легенд: '+(state.legendaryChests||0)+'</div>'+(can?'<button class="card-day-btn" onclick="openChest()">🎁 ОТКРЫТЬ</button>':'')+'</div>';c.innerHTML=h;}
function openChest(){var t=dateKey(new Date());if(state.lastChestDate===t){showToast('Уже открыт',true);return;}var roll=Math.random()*100;var cum=0;var r=CHEST_REWARDS[0];for(var i=0;i<CHEST_REWARDS.length;i++){cum+=CHEST_REWARDS[i].chance;if(roll<cum){r=CHEST_REWARDS[i];break;}}var gained=Math.floor(r.minXp+Math.random()*(r.maxXp-r.minXp));addXP(gained);state.chestsOpened=(state.chestsOpened||0)+1;if(r.rarity==='legendary')state.legendaryChests=(state.legendaryChests||0)+1;state.lastChestDate=t;save();render();var p=document.getElementById('chestPopup');if(p){document.getElementById('chestIcon').textContent=r.icon;document.getElementById('chestName').textContent=r.name+' сундук';document.getElementById('chestXP').textContent='+'+gained+' XP';var el=document.getElementById('chestRarity');el.textContent=r.rarity.toUpperCase();el.className='chest-rarity rarity-'+r.rarity;p.classList.add('show');setTimeout(function(){p.classList.remove('show');},4000);}if(state.sound)achSound();checkAchievements();checkNewCards();}
function renderWeekly(){var c=document.getElementById('weeklyContainer');if(!c)return;var days=state.weekDays.length;var h='<div class="weekly-card"><div class="weekly-icon">'+(days>=7?'🎁':'📦')+'</div><div class="weekly-title">'+(days>=7?'Награда доступна!':'Накопи 7 дней')+'</div><div class="weekly-sub">Прогресс: '+days+' / 7</div><div class="weekly-progress">';for(var i=0;i<7;i++)h+='<div class="weekly-dot'+(i<days?' done':'')+'">'+(i<days?'✓':(i+1))+'</div>';h+='</div>';if(days>=7&&state.lastWeeklyRewardClaim!==dateKey(new Date()))h+='<button class="card-day-btn" onclick="claimWeeklyReward()">🎁 +1000 XP</button>';else if(days>=7)h+='<div style="font-size:13px;color:#7ce68d;font-weight:800;margin-top:12px">✅ Получено</div>';h+='</div>';c.innerHTML=h;}
function claimWeeklyReward(){if(state.weekDays.length<7){showToast('Нужно 7 дней',true);return;}var today=dateKey(new Date());if(state.lastWeeklyRewardClaim===today){showToast('Уже получено',true);return;}state.weeklyRewards=(state.weeklyRewards||0)+1;addXP(1000);state.lastWeeklyRewardClaim=today;state.weekDays=[];showToast('🎁 +1000 XP!');if(state.sound)achSound();save();render();checkAchievements();}
function renderBoss(){var c=document.getElementById('bossContainer');if(!c)return;if(!state.bossCurrent){c.innerHTML='<div class="empty-state"><div class="empty-state-icon">⚔️</div>Босс придёт в понедельник</div>';return;}var boss=null;for(var i=0;i<BOSSES.length;i++)if(BOSSES[i].id===state.bossCurrent)boss=BOSSES[i];if(!boss){c.innerHTML='';return;}var hp=state.bossHp||0;var prog=(1-hp/boss.hp)*100;c.innerHTML='<div class="boss-card"><div class="boss-head"><div class="boss-avatar">'+boss.icon+'</div><div class="boss-info"><div class="boss-name">'+boss.name+'</div><div class="boss-tag">HP '+hp+' / '+boss.hp+'</div></div></div><div class="boss-hp-bar"><div class="boss-hp-fill" style="width:'+prog+'%"></div></div><div class="boss-hp-text"><span>Урон: '+Math.round(prog)+'%</span><span>Осталось: '+hp+'</span></div><div class="boss-hint">'+boss.hint+'</div></div>';}
function renderDailyPath(){var c=document.getElementById('dailyPathContainer');if(!c)return;var nodes=['🌅','🧘','💪','📖','🚶','✍️','😴'];var doneCount=state.todayDone.length;var h='<div class="daily-path"><div class="daily-path-title">🗺️ Маршрут дня</div><div class="daily-path-sub">Пройдено: '+doneCount+'</div><div class="daily-path-track">';for(var i=0;i<nodes.length;i++){var cls='daily-path-node';if(i<doneCount)cls+=' done';else if(i===doneCount)cls+=' current';h+='<div class="'+cls+'">'+(i<doneCount?'✓':nodes[i])+'</div>';}h+='</div></div>';if(doneCount>=7){var today=dateKey(new Date());if(state.lastPathComplete!==today){state.lastPathComplete=today;state.dailyPathCompleted=(state.dailyPathCompleted||0)+1;addXP(100);save();}}c.innerHTML=h;}
function renderAwards(){var c=document.getElementById('achGrid');if(!c)return;var h='';for(var i=0;i<ACHIEVEMENTS.length;i++){var a=ACHIEVEMENTS[i];var u=state.achievements.indexOf(a.id)>=0;h+='<div class="ach '+(u?'unlocked':'')+'"><div class="ach-icon">'+a.icon+'</div><div class="ach-name">'+a.name+'</div><div class="ach-desc">'+a.desc+'</div></div>';}c.innerHTML=h;}

/* ============================================================
   РЕНДЕР: ПРАКТИКИ
============================================================ */
function renderPractices(){
  var c=document.getElementById('practicesContainer');if(!c)return;
  var lvl=getLevel(state.xpEarned);
  var cats=[{key:'disc',title:'⚔️ Дисциплина'},{key:'breath',title:'🌬️ Дыхание'},{key:'body',title:'💪 Тело'},{key:'mind',title:'🧠 Разум'},{key:'spirit',title:'✨ Дух'},{key:'health',title:'💚 Здоровье'}];
  var h='';var all=getAllPractices();
  for(var ci=0;ci<cats.length;ci++){
    var cat=cats[ci];var list=[];
    for(var k=0;k<all.length;k++)if(all[k].cat===cat.key)list.push(all[k]);
    if(!list.length)continue;
    h+='<div class="section-title">'+cat.title+'</div>';
    for(var i=0;i<list.length;i++){
      var p=list[i];var tier=getTier(p.id);
      var tiers=p.tiers||[{name:'',xp:15,lvl:0}];
      var td=tiers[tier-1]||tiers[0];
      var locked=lvl<(td.lvl||0);
      var done=state.todayDone.indexOf(p.id)>=0;
      var check=canDoPractice(p.id);
      var cd=getPracticeCooldownRemaining(p.id);
      var dailyCount=getPracticeDailyCount(p.id);
      var dots='';
      for(var t=0;t<tiers.length;t++)dots+='<div class="tier-dot '+(t<tier?'filled':'')+'"></div>';
      var cls='practice';
      if(done)cls+=' done';
      if(locked)cls+=' locked';
      if(!check.ok&&!done)cls+=' practice-cooldown';
      var badges='';
      badges+='<span class="badge">Ур. '+tier+'/'+tiers.length+'</span>';
      if(locked)badges+='<span class="badge blue">Откр. Ур. '+(td.lvl+1)+'</span>';
      if(cd>0)badges+='<span class="cooldown-badge">⏱ '+Math.ceil(cd)+'ч</span>';
      else if(dailyCount>=2)badges+='<span class="daily-limit-badge">Лимит 2/день</span>';
      else if(dailyCount===1)badges+='<span class="badge green">Осталось 1</span>';
      var canUpgrade=tier<tiers.length;
      var upgradeReason='▲ Выше';
      if(canUpgrade){
        var nextTd=tiers[tier];
        var needLvl=nextTd.lvl||0;
        var countOnTier=state.completionCounter[p.id]||0;
        var baseCount=(tier-1)*5;
        var doneOnTier=Math.max(0,countOnTier-baseCount);
        if(lvl<needLvl){canUpgrade=false;upgradeReason='🔒 Ур.'+(needLvl+1);}
        else if(doneOnTier<5){canUpgrade=false;upgradeReason='▲ '+doneOnTier+'/5';}
      }
      var upgradeDisabled=!canUpgrade?'disabled':'';
      h+='<div class="'+cls+'"><div class="practice-row" onclick="handlePracticeClick(\''+p.id+'\')"><div class="practice-icon icon-'+p.cat+'">'+p.icon+'</div><div class="practice-info"><div class="practice-name">'+p.name+'</div><div class="practice-desc">'+(td.name||'')+'</div><div class="practice-meta">'+badges+'</div><div class="practice-tiers">'+dots+'</div></div><div class="practice-xp">+'+Math.round((td.xp||15)*getTotalMultiplier(p.cat))+'</div></div><div class="practice-actions"><button class="p-btn downgrade" '+(tier<=1?'disabled':'')+' onclick="event.stopPropagation();changeTier(\''+p.id+'\',-1)">▼ Ниже</button><button class="p-btn upgrade" '+upgradeDisabled+' onclick="event.stopPropagation();changeTier(\''+p.id+'\',1)">'+upgradeReason+'</button><button class="p-btn info" onclick="event.stopPropagation();showPracticeInfo(\''+p.id+'\')">ℹ</button></div></div>';
    }
  }
  c.innerHTML=h;
}

/* ============================================================
   РЕНДЕР: КВЕСТЫ
============================================================ */
function renderQuests(){
  var c=document.getElementById('questsContainer');if(!c)return;
  updateQuestTimer();
  var dq=state.dailyQuests;
  var today=dateKey(new Date());
  var h='';
  if(!dq||dq.date!==today||!dq.list||!dq.list.length){
    h+='<div class="quest-setup-card">';
    h+='<div style="font-size:32px;margin-bottom:8px">⚔️</div>';
    h+='<div style="font-size:17px;font-weight:900;margin-bottom:6px">Выбери сложность</div>';
    h+='<div style="font-size:12.5px;color:var(--text-dim);font-weight:600">Один квест в день. Сложнее — больше награда.</div>';
    h+='<div class="quest-difficulty-grid">';
    h+='<button class="quest-diff-opt easy'+(_questDifficulty==='easy'?' selected':'')+'" data-diff="easy" onclick="pickQuestDifficulty(\'easy\')"><div class="quest-diff-icon">🌱</div><div class="quest-diff-name">Лёгкий</div><div class="quest-diff-reward">+20-40 XP</div></button>';
    h+='<button class="quest-diff-opt medium'+(_questDifficulty==='medium'?' selected':'')+'" data-diff="medium" onclick="pickQuestDifficulty(\'medium\')"><div class="quest-diff-icon">🔥</div><div class="quest-diff-name">Средний</div><div class="quest-diff-reward">+70-90 XP</div></button>';
    h+='<button class="quest-diff-opt hard'+(_questDifficulty==='hard'?' selected':'')+'" data-diff="hard" onclick="pickQuestDifficulty(\'hard\')"><div class="quest-diff-icon">⚡</div><div class="quest-diff-name">Сложный</div><div class="quest-diff-reward">+180-260 XP</div></button>';
    h+='</div>';
    h+='<button class="quest-btn" onclick="startQuestSetup()">▶ НАЧАТЬ КВЕСТ</button>';
    h+='</div>';
    c.innerHTML=h;
    return;
  }
  h+='<div class="info-text" style="text-align:center;font-weight:800;color:#b3a6ff;letter-spacing:1px;margin-bottom:14px">Сложность: '+(dq.difficulty==='easy'?'🌱 Лёгкий':dq.difficulty==='medium'?'🔥 Средний':'⚡ Сложный')+'</div>';
  var allQ=[].concat(QUEST_POOL.easy,QUEST_POOL.medium,QUEST_POOL.hard);
  for(var i=0;i<dq.list.length;i++){
    var qid=dq.list[i];var q=null;
    for(var j=0;j<allQ.length;j++)if(allQ[j].id===qid)q=allQ[j];
    if(!q)continue;
    var done=dq.completed.indexOf(qid)>=0;
    var cur=q.cur?q.cur(state):0;var target=q.target||1;
    var prog=Math.min(100,cur/target*100);
    var canComplete=q.check(state)&&!done;
    h+='<div class="quest '+(done?'done':'')+'"><div class="quest-icon">'+(done?'✅':q.icon)+'</div><div style="flex:1"><div class="quest-info"><div class="quest-name">'+q.name+'</div><div class="quest-desc">'+q.desc+' ('+cur+'/'+target+')</div><div class="quest-progress-bar"><div class="quest-progress-fill" style="width:'+prog+'%"></div></div></div>'+(canComplete?'<button class="quest-btn" onclick="completeQuest(\''+qid+'\')">✅ Выполнить +'+q.reward+'</button>':'')+'</div><div class="quest-reward">+'+q.reward+'</div></div>';
  }
  c.innerHTML=h;
}

/* ============================================================
   ТЕЛО / ВЕС
============================================================ */
function addBodyLog(){var w=parseFloat((document.getElementById('bodyWeight')||{}).value);var wa=parseFloat((document.getElementById('bodyWaist')||{}).value);if(!w||isNaN(w)){showToast('Введи вес',true);return;}state.bodyLog.push({date:dateKey(new Date()),weight:w,waist:(wa&&!isNaN(wa))?wa:null});state.profile.weight=w;save();document.getElementById('bodyWeight').value='';document.getElementById('bodyWaist').value='';render();showToast('⚖️ Добавлено');checkAchievements();checkNewCards();}
function removeBodyLog(i){state.bodyLog.splice(i,1);save();render();}
function switchBodyTab(tab){document.querySelectorAll('.body-tab').forEach(function(t){t.classList.toggle('active',t.dataset.bodyTab===tab);});document.querySelectorAll('.body-pane').forEach(function(p){p.classList.remove('active');});var el=document.getElementById('bodyPane-'+tab);if(el)el.classList.add('active');}
function renderBody(){
  var c=document.getElementById('bodyContainer');if(!c)return;
  var p=state.profile;var h='';
  if(p.onboardingComplete){
    var bmi=calcBMI();var bmiCat=bmiCategory(bmi);
    h+='<div class="profile-section" style="margin-bottom:14px"><div class="profile-section-title">📊 Текущие показатели</div><div class="profile-metric-grid"><div class="profile-metric"><div class="profile-metric-value pink">'+p.weight+'</div><div class="profile-metric-label">Вес (кг)</div></div><div class="profile-metric"><div class="profile-metric-value green">'+bmi+'</div><div class="profile-metric-label">ИМТ</div><div class="profile-metric-hint" style="color:'+bmiCat.color+'">'+bmiCat.cat+'</div></div></div>';
    if(p.goal==='lose')h+='<div class="recommendation-card"><div class="recommendation-head"><div class="recommendation-icon">🏃</div><div class="recommendation-title">Фокус на снижение</div></div><div class="recommendation-text">Кардио <b>3-4×нед</b> по 30-45 мин + силовые 2-3×нед. Дефицит <b>400 ккал</b>.</div></div>';
    else if(p.goal==='gain')h+='<div class="recommendation-card info"><div class="recommendation-head"><div class="recommendation-icon">🏋️</div><div class="recommendation-title">Фокус на массу</div></div><div class="recommendation-text">Силовые <b>4×нед</b>. Профицит <b>300 ккал</b>. Сон 8+ч.</div></div>';
    else if(p.goal==='recomp')h+='<div class="recommendation-card info"><div class="recommendation-head"><div class="recommendation-icon">✨</div><div class="recommendation-title">Рельеф</div></div><div class="recommendation-text">Силовые 4×нед + HIIT 2×нед. Лёгкий дефицит.</div></div>';
    else h+='<div class="recommendation-card"><div class="recommendation-head"><div class="recommendation-icon">⚖️</div><div class="recommendation-title">Поддержание</div></div><div class="recommendation-text">Разнообразные тренировки 3-4×нед.</div></div>';
    h+='</div>';
  }
  /* Динамика веса */
  if(state.bodyLog&&state.bodyLog.length>=2){
    var last14=state.bodyLog.slice(-14);
    var minW=Infinity,maxW=-Infinity;
    for(var i=0;i<last14.length;i++){if(last14[i].weight<minW)minW=last14[i].weight;if(last14[i].weight>maxW)maxW=last14[i].weight;}
    var range=maxW-minW||1;
    h+='<div class="section-title">📈 Динамика (последние 14)</div>';
    h+='<div style="display:flex;align-items:flex-end;gap:4px;height:140px;background:rgba(0,0,0,0.2);border-radius:18px;padding:16px 12px 10px;margin-bottom:12px">';
    var prevW=null;
    for(var j=0;j<last14.length;j++){
      var w=last14[j].weight;
      var height=((w-minW)/range)*70+30;
      var color='linear-gradient(180deg,#f093fb,#8b7cff)';
      if(prevW!==null){if(w>prevW)color='linear-gradient(180deg,#ff8296,#f5576c)';else if(w<prevW)color='linear-gradient(180deg,#7ce68d,#4cd964)';}
      h+='<div style="flex:1;background:'+color+';border-radius:4px 4px 2px 2px;height:'+height+'%" title="'+w+' кг"></div>';
      prevW=w;
    }
    h+='</div>';
    var first=state.bodyLog[0].weight;var last=state.bodyLog[state.bodyLog.length-1].weight;
    var totalDiff=(last-first).toFixed(1);
    var trendColor=totalDiff<0?'#4cd964':(totalDiff>0?'#f5576c':'#7dc7ff');
    var trendIcon=totalDiff<0?'📉':(totalDiff>0?'📈':'➡️');
    h+='<div style="background:linear-gradient(135deg,rgba(139,124,255,0.15),rgba(79,172,254,0.1));border-radius:16px;padding:14px;margin-bottom:12px;text-align:center"><div style="font-size:28px;font-weight:900;color:'+trendColor+';line-height:1;margin-bottom:4px">'+trendIcon+' '+(totalDiff>0?'+':'')+totalDiff+' кг</div><div style="font-size:11px;color:var(--text-soft);font-weight:800;text-transform:uppercase;letter-spacing:1px">Общее изменение</div></div>';
  }
  h+='<div class="plan-section"><div class="plan-title">⚖️ Запиши вес</div><div class="input-row"><input class="plan-input" type="number" step="0.1" id="bodyWeight" placeholder="Вес (кг)"><input class="plan-input" type="number" step="0.1" id="bodyWaist" placeholder="Обхват (см)"></div><button class="btn-block primary" onclick="addBodyLog()">➕ Добавить</button></div>';
  if(state.bodyLog&&state.bodyLog.length){
    var recent=state.bodyLog.slice().reverse().slice(0,10);
    h+='<div class="section-title">Последние записи</div>';
    for(var i=0;i<recent.length;i++){
      var e=recent[i];
      var diffHtml='';
      if(i<recent.length-1){var d=(e.weight-recent[i+1].weight).toFixed(1);var col=d<0?'#4cd964':(d>0?'#f5576c':'#7dc7ff');diffHtml=' <span style="color:'+col+';font-size:11px">'+(d>0?'+':'')+d+'</span>';}
      h+='<div class="log-item"><div class="log-date">'+e.date+'</div><div class="log-value">'+e.weight+' кг'+diffHtml+(e.waist?' · '+e.waist+' см':'')+'</div><button class="mini-btn danger" style="flex:0;padding:6px 10px" onclick="removeBodyLog('+(state.bodyLog.length-1-i)+')">✖</button></div>';
    }
  } else h+='<div class="empty-state">Начни отслеживать</div>';
  c.innerHTML=h;
}

/* ============================================================
   ТРЕНИРОВКИ
============================================================ */
function createWorkout(){var n=(document.getElementById('wName')||{}).value;var d=(document.getElementById('wDate')||{}).value||dateKey(new Date());if(!n){showToast('Введи название',true);return;}if(!state.workouts)state.workouts=[];state.workouts.push({id:'w_'+Date.now(),name:n,date:d,exercises:[]});save();document.getElementById('wName').value='';render();closeModal('workoutAddModal');showToast('🏋️ Создана');checkAchievements();}
function addExercise(){var n=(document.getElementById('exName')||{}).value;var s=parseInt((document.getElementById('exSets')||{}).value)||3;var r=parseInt((document.getElementById('exReps')||{}).value)||10;var w=parseFloat((document.getElementById('exWeight')||{}).value)||0;if(!n){showToast('Введи упражнение',true);return;}if(!state.workouts||!state.workouts.length){showToast('Сначала тренировку',true);return;}state.workouts[state.workouts.length-1].exercises.push({name:n,sets:s,reps:r,weight:w});save();document.getElementById('exName').value='';render();closeModal('exerciseAddModal');showToast('💪 Добавлено');}
function renderWorkouts(){
  var c=document.getElementById('workoutContainer');if(!c)return;
  var h='';
  if(state.profile.onboardingComplete){
    var goal=state.profile.goal||'maintain';
    var programs=WORKOUT_PROGRAMS[goal]||WORKOUT_PROGRAMS.maintain;
    h+='<div class="section-title">🎯 Рекомендуемые программы</div>';
    h+='<div class="info-text">Подобраны под твою цель. От лёгкого к сложному.</div>';
    for(var k=0;k<programs.length;k++){
      var prog=programs[k];
      h+='<div class="workout-card"><div class="workout-head"><div class="workout-name">'+prog.name+'</div><div class="workout-date">'+prog.level+'</div></div><div style="font-size:12px;color:var(--text-dim);font-weight:600;margin-bottom:8px">'+prog.desc+' · '+prog.duration+'</div>';
      for(var m=0;m<prog.exercises.length;m++)h+='<div class="workout-exercise"><span>▸</span><span>'+prog.exercises[m]+'</span></div>';
      h+='</div>';
    }
  }
  h+='<button class="btn-block primary" onclick="document.getElementById(\'wDate\').value=\''+dateKey(new Date())+'\';document.getElementById(\'workoutAddModal\').classList.add(\'active\')">➕ Своя тренировка</button>';
  if(state.workouts&&state.workouts.length){
    h+='<div class="section-title">📅 Мои тренировки</div>';
    for(var i=state.workouts.length-1;i>=0;i--){
      var w=state.workouts[i];
      h+='<div class="workout-card"><div class="workout-head"><div class="workout-name">'+escapeHtml(w.name)+'</div><div class="workout-date">'+w.date+'</div></div>';
      if(w.exercises&&w.exercises.length){for(var j=0;j<w.exercises.length;j++){var ex=w.exercises[j];h+='<div class="workout-exercise"><span>'+escapeHtml(ex.name)+'</span><span><b>'+ex.sets+'×'+ex.reps+'</b> · '+ex.weight+' кг</span></div>';}}
      h+='<button class="mini-btn purple" style="margin-top:8px" onclick="state.workouts.splice('+i+',1);save();render()">🗑 Удалить</button></div>';
    }
  }
  c.innerHTML=h;
}

/* ============================================================
   ЕДА — БАЗА + КОНСТРУКТОР
============================================================ */
var FOOD_CATEGORIES=[
{key:'breakfast',icon:'🍳',name:'Завтраки'},
{key:'chicken',icon:'🍗',name:'Курица'},
{key:'meat',icon:'🥩',name:'Мясо'},
{key:'fish',icon:'🐟',name:'Рыба'},
{key:'salad',icon:'🥗',name:'Салаты'},
{key:'soup',icon:'🍲',name:'Супы'},
{key:'garnish',icon:'🍚',name:'Гарниры'},
{key:'snack',icon:'🍎',name:'Перекусы'},
{key:'drink',icon:'🥤',name:'Напитки'}];

var FOOD_LIBRARY=[
/* Завтраки */
{cat:'breakfast',name:'Овсянка с ягодами',cal:280,protein:12,fat:6,carbs:45,desc:'Овсянка 50г + ягоды 100г + йогурт'},
{cat:'breakfast',name:'Омлет с овощами',cal:250,protein:20,fat:16,carbs:6,desc:'2 яйца + шпинат + помидор'},
{cat:'breakfast',name:'Творог с яблоком',cal:180,protein:18,fat:5,carbs:15,desc:'Творог 5% 150г + яблоко'},
{cat:'breakfast',name:'Сырники',cal:340,protein:22,fat:12,carbs:38,desc:'Творог + яйцо + мука + сметана'},
{cat:'breakfast',name:'Яичница с беконом',cal:420,protein:24,fat:32,carbs:8,desc:'3 яйца + бекон 40г'},
{cat:'breakfast',name:'Гранола с молоком',cal:380,protein:12,fat:14,carbs:52,desc:'Гранола 60г + молоко 200мл'},
{cat:'breakfast',name:'Бутерброд с авокадо',cal:320,protein:10,fat:22,carbs:24,desc:'Хлеб + авокадо 1/2 + яйцо'},
{cat:'breakfast',name:'Панкейки протеиновые',cal:340,protein:26,fat:8,carbs:38,desc:'Протеин + яйцо + овсянка'},
{cat:'breakfast',name:'Овсяноблин',cal:300,protein:18,fat:12,carbs:32,desc:'Овсянка + яйцо + начинка'},
{cat:'breakfast',name:'Каша рисовая',cal:260,protein:6,fat:4,carbs:52,desc:'Рис + молоко + масло'},
{cat:'breakfast',name:'Тост с лососем',cal:290,protein:18,fat:12,carbs:26,desc:'Хлеб + лосось + слив. сыр'},
{cat:'breakfast',name:'Смузи-боул',cal:320,protein:8,fat:10,carbs:52,desc:'Банан + ягоды + йогурт + гранола'},
/* Курица */
{cat:'chicken',name:'Куриная грудка на гриле',cal:220,protein:40,fat:5,carbs:0,desc:'Грудка 180г + специи'},
{cat:'chicken',name:'Курица с гречкой',cal:420,protein:38,fat:10,carbs:42,desc:'Курица 150г + гречка 60г'},
{cat:'chicken',name:'Куриные бёдра запечённые',cal:280,protein:32,fat:16,carbs:0,desc:'Бёдра 180г + розмарин'},
{cat:'chicken',name:'Курица с рисом',cal:450,protein:35,fat:9,carbs:55,desc:'Курица 150г + рис 70г'},
{cat:'chicken',name:'Куриный суп-лапша',cal:280,protein:22,fat:8,carbs:28,desc:'Курица + лапша + овощи'},
{cat:'chicken',name:'Курица терияки',cal:380,protein:34,fat:12,carbs:32,desc:'Курица + соус терияки + рис'},
{cat:'chicken',name:'Шашлык из курицы',cal:290,protein:38,fat:14,carbs:2,desc:'Курица маринованная 180г'},
{cat:'chicken',name:'Куриные котлеты',cal:310,protein:28,fat:18,carbs:8,desc:'Фарш куриный + лук + яйцо'},
{cat:'chicken',name:'Курица с овощами вок',cal:340,protein:32,fat:14,carbs:22,desc:'Курица + овощи + соевый соус'},
{cat:'chicken',name:'Цезарь с курицей',cal:420,protein:30,fat:24,carbs:20,desc:'Курица + салат + соус + сухарики'},
{cat:'chicken',name:'Куриное филе в кляре',cal:360,protein:32,fat:20,carbs:14,desc:'Филе + кляр + масло'},
{cat:'chicken',name:'Куриные крылья BBQ',cal:440,protein:26,fat:32,carbs:12,desc:'Крылья + соус BBQ'},
/* Мясо */
{cat:'meat',name:'Стейк из говядины',cal:380,protein:46,fat:22,carbs:0,desc:'Стейк 200г + соль + перец'},
{cat:'meat',name:'Телятина тушёная',cal:290,protein:38,fat:14,carbs:4,desc:'Телятина + лук + морковь'},
{cat:'meat',name:'Свинина с овощами',cal:420,protein:32,fat:28,carbs:12,desc:'Свинина 180г + овощи'},
{cat:'meat',name:'Котлеты домашние',cal:340,protein:24,fat:22,carbs:12,desc:'Фарш + хлеб + лук'},
{cat:'meat',name:'Борщ с мясом',cal:320,protein:20,fat:14,carbs:28,desc:'Борщ 400мл + сметана'},
{cat:'meat',name:'Плов с говядиной',cal:520,protein:28,fat:18,carbs:62,desc:'Рис + мясо + морковь'},
{cat:'meat',name:'Голубцы',cal:340,protein:22,fat:16,carbs:28,desc:'Капуста + фарш + рис + соус'},
{cat:'meat',name:'Бефстроганов',cal:380,protein:32,fat:22,carbs:14,desc:'Говядина + сметана + грибы'},
{cat:'meat',name:'Шашлык из свинины',cal:420,protein:34,fat:28,carbs:4,desc:'Свинина маринованная 180г'},
{cat:'meat',name:'Пельмени',cal:440,protein:20,fat:18,carbs:48,desc:'Пельмени 250г + сметана'},
/* Рыба */
{cat:'fish',name:'Лосось запечённый',cal:340,protein:34,fat:20,carbs:0,desc:'Лосось 180г + лимон'},
{cat:'fish',name:'Треска на пару',cal:180,protein:34,fat:2,carbs:0,desc:'Треска 180г'},
{cat:'fish',name:'Тунец с рисом',cal:380,protein:32,fat:8,carbs:46,desc:'Тунец + рис + овощи'},
{cat:'fish',name:'Сельдь с картофелем',cal:420,protein:24,fat:22,carbs:34,desc:'Сельдь + картофель отварной'},
{cat:'fish',name:'Скумбрия запечённая',cal:380,protein:30,fat:24,carbs:2,desc:'Скумбрия 180г'},
{cat:'fish',name:'Минтай тушёный',cal:200,protein:28,fat:6,carbs:6,desc:'Минтай + овощи + томат'},
{cat:'fish',name:'Креветки с овощами',cal:240,protein:28,fat:8,carbs:14,desc:'Креветки 150г + овощи'},
{cat:'fish',name:'Рыбные котлеты',cal:280,protein:22,fat:14,carbs:16,desc:'Фарш рыбный + хлеб + лук'},
{cat:'fish',name:'Уха',cal:180,protein:16,fat:6,carbs:14,desc:'Рыба + картофель + морковь'},
{cat:'fish',name:'Суши-сет (6 шт)',cal:320,protein:14,fat:6,carbs:52,desc:'Рис + рыба + нори'},
/* Салаты */
{cat:'salad',name:'Греческий салат',cal:220,protein:8,fat:16,carbs:12,desc:'Огурец + помидор + фета + оливки'},
{cat:'salad',name:'Салат Цезарь',cal:340,protein:18,fat:24,carbs:16,desc:'Салат + пармезан + соус + сухарики'},
{cat:'salad',name:'Витаминный',cal:120,protein:4,fat:6,carbs:12,desc:'Капуста + морковь + масло'},
{cat:'salad',name:'Свёкла с чесноком',cal:160,protein:4,fat:10,carbs:14,desc:'Свёкла + чеснок + майонез'},
{cat:'salad',name:'Оливье',cal:320,protein:10,fat:22,carbs:22,desc:'Картофель + яйца + горошек + майонез'},
{cat:'salad',name:'Салат с тунцом',cal:280,protein:22,fat:14,carbs:14,desc:'Тунец + салат + помидор'},
{cat:'salad',name:'Морковь по-корейски',cal:180,protein:3,fat:12,carbs:14,desc:'Морковь + специи + масло'},
{cat:'salad',name:'Салат с креветками',cal:240,protein:20,fat:12,carbs:14,desc:'Креветки + авокадо + салат'},
/* Супы */
{cat:'soup',name:'Куриный бульон',cal:120,protein:14,fat:4,carbs:4,desc:'Бульон куриный 400мл'},
{cat:'soup',name:'Суп-пюре из тыквы',cal:220,protein:6,fat:10,carbs:28,desc:'Тыква + сливки + семечки'},
{cat:'soup',name:'Щи',cal:180,protein:10,fat:8,carbs:14,desc:'Капуста + мясо + морковь'},
{cat:'soup',name:'Солянка',cal:340,protein:18,fat:22,carbs:18,desc:'Мясо + огурцы + оливки'},
{cat:'soup',name:'Грибной суп',cal:220,protein:8,fat:10,carbs:24,desc:'Грибы + картофель + сливки'},
{cat:'soup',name:'Том-ям',cal:280,protein:20,fat:14,carbs:18,desc:'Креветки + кокосовое молоко + специи'},
/* Гарниры */
{cat:'garnish',name:'Гречка отварная',cal:220,protein:8,fat:2,carbs:44,desc:'Гречка 100г + масло'},
{cat:'garnish',name:'Рис белый',cal:260,protein:6,fat:1,carbs:56,desc:'Рис 100г'},
{cat:'garnish',name:'Рис бурый',cal:240,protein:8,fat:2,carbs:48,desc:'Бурый рис 100г'},
{cat:'garnish',name:'Картофель отварной',cal:180,protein:4,fat:4,carbs:32,desc:'Картофель 200г + масло'},
{cat:'garnish',name:'Картофель запечённый',cal:220,protein:4,fat:8,carbs:34,desc:'Картофель + масло + специи'},
{cat:'garnish',name:'Макароны',cal:340,protein:12,fat:4,carbs:66,desc:'Паста 100г'},
{cat:'garnish',name:'Киноа',cal:280,protein:12,fat:6,carbs:48,desc:'Киноа 100г'},
{cat:'garnish',name:'Булгур',cal:260,protein:10,fat:2,carbs:52,desc:'Булгур 100г'},
{cat:'garnish',name:'Овощи на пару',cal:120,protein:4,fat:4,carbs:16,desc:'Брокколи + цветная капуста + морковь'},
{cat:'garnish',name:'Тушёные овощи',cal:160,protein:4,fat:8,carbs:18,desc:'Кабачок + перец + лук'},
/* Перекусы */
{cat:'snack',name:'Яблоко',cal:80,protein:0,fat:0,carbs:20,desc:'Яблоко 150г'},
{cat:'snack',name:'Банан',cal:110,protein:1,fat:0,carbs:28,desc:'Банан 120г'},
{cat:'snack',name:'Греческий йогурт',cal:130,protein:14,fat:4,carbs:10,desc:'Йогурт 150г'},
{cat:'snack',name:'Творог с мёдом',cal:220,protein:18,fat:8,carbs:18,desc:'Творог 150г + мёд 1ч.л.'},
{cat:'snack',name:'Орехи микс',cal:280,protein:8,fat:24,carbs:8,desc:'Грецкие + миндаль + кешью 30г'},
{cat:'snack',name:'Протеиновый батончик',cal:220,protein:20,fat:8,carbs:20,desc:'Батончик 60г'},
{cat:'snack',name:'Горький шоколад',cal:170,protein:3,fat:12,carbs:14,desc:'Шоколад 70% 30г'},
{cat:'snack',name:'Сыр твёрдый',cal:200,protein:14,fat:16,carbs:2,desc:'Сыр 40г'},
{cat:'snack',name:'Хлебцы с сыром',cal:180,protein:10,fat:8,carbs:18,desc:'Хлебцы 3шт + сыр 20г'},
/* Напитки */
{cat:'drink',name:'Вода',cal:0,protein:0,fat:0,carbs:0,desc:'Вода 250мл'},
{cat:'drink',name:'Зелёный чай',cal:0,protein:0,fat:0,carbs:0,desc:'Чай без сахара'},
{cat:'drink',name:'Кофе с молоком',cal:80,protein:4,fat:4,carbs:6,desc:'Кофе 200мл + молоко 50мл'},
{cat:'drink',name:'Протеиновый коктейль',cal:220,protein:24,fat:4,carbs:22,desc:'Протеин + молоко 300мл'},
{cat:'drink',name:'Свежевыжатый сок',cal:120,protein:1,fat:0,carbs:28,desc:'Апельсин 3шт'},
{cat:'drink',name:'Смузи',cal:180,protein:4,fat:2,carbs:36,desc:'Банан + ягоды + йогурт'}];

var _foodLibCategory='all';
var _foodLibSearch='';
function openFoodLibrary(){
  _foodLibCategory='all';_foodLibSearch='';
  renderFoodLibCats();
  renderFoodLibrary();
  var inp=document.getElementById('foodSearchInput');
  if(inp)inp.value='';
  document.getElementById('foodLibraryModal').classList.add('active');
}
function renderFoodLibCats(){
  var c=document.getElementById('foodCategoriesRow');if(!c)return;
  var h='<button class="food-cat-btn'+(_foodLibCategory==='all'?' active':'')+'" onclick="pickFoodCat(\'all\')">Все</button>';
  for(var i=0;i<FOOD_CATEGORIES.length;i++){
    var cat=FOOD_CATEGORIES[i];
    h+='<button class="food-cat-btn'+(_foodLibCategory===cat.key?' active':'')+'" onclick="pickFoodCat(\''+cat.key+'\')">'+cat.icon+' '+cat.name+'</button>';
  }
  c.innerHTML=h;
}
function pickFoodCat(cat){_foodLibCategory=cat;renderFoodLibCats();renderFoodLibrary();}
function filterFoodLibrary(v){_foodLibSearch=(v||'').toLowerCase();renderFoodLibrary();}
function renderFoodLibrary(){
  var c=document.getElementById('foodLibraryList');if(!c)return;
  var h='';
  var count=0;
  for(var i=0;i<FOOD_LIBRARY.length;i++){
    var f=FOOD_LIBRARY[i];
    if(_foodLibCategory!=='all'&&f.cat!==_foodLibCategory)continue;
    if(_foodLibSearch&&f.name.toLowerCase().indexOf(_foodLibSearch)<0)continue;
    count++;
    h+='<div class="food-lib-item" onclick="addFoodFromLibrary(\''+i+'\')"><div style="flex:1;min-width:0"><div class="food-lib-name">'+f.name+'</div><div class="food-lib-macros">Б '+f.protein+'г · Ж '+f.fat+'г · У '+f.carbs+'г</div></div><div class="food-lib-cal">'+f.cal+' ккал</div></div>';
  }
  if(!count)h='<div class="empty-state" style="padding:24px">Ничего не найдено</div>';
  c.innerHTML=h;
}
function addFoodFromLibrary(idx){
  var f=FOOD_LIBRARY[parseInt(idx)];
  if(!f)return;
  if(!state.dayConstructor)state.dayConstructor=[];
  state.dayConstructor.push({name:f.name,cal:f.cal,protein:f.protein,fat:f.fat,carbs:f.carbs});
  save();
  showToast('✅ '+f.name+' добавлено в день');
  updateConstructorSummary();
}
function updateConstructorSummary(){
  var el=document.getElementById('dayConstructorSummary');
  if(!el)return;
  var tCal=0,tP=0,tF=0,tC=0;
  for(var i=0;i<state.dayConstructor.length;i++){
    var d=state.dayConstructor[i];
    tCal+=d.cal;tP+=d.protein;tF+=d.fat;tC+=d.carbs;
  }
  var target=calcTargetCalories();
  var macros=calcMacros();
  var pct=target>0?Math.min(100,Math.round(tCal/target*100)):0;
  var h='<div style="font-size:12px;color:var(--text-soft);font-weight:800;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Набрано сегодня</div>';
  h+='<div style="font-size:26px;font-weight:900;background:linear-gradient(90deg,#4cd964,#4facfe);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;line-height:1">'+tCal+' / '+target+'</div>';
  h+='<div style="font-size:11px;color:var(--text-dim);font-weight:700;margin-top:4px">'+pct+'% от нормы</div>';
  h+='<div style="display:flex;gap:10px;margin-top:10px;font-size:11.5px;font-weight:800;justify-content:space-around"><span style="color:#4cd964">Б '+tP+'/'+macros.proteinG+'</span><span style="color:#ffd166">Ж '+tF+'/'+macros.fatG+'</span><span style="color:#4facfe">У '+tC+'/'+macros.carbsG+'</span></div>';
  el.innerHTML=h;
  /* Список выбранных */
  var listEl=document.getElementById('dayConstructorList');
  if(listEl){
    var lh='';
    if(!state.dayConstructor.length){lh='<div class="empty-state" style="padding:20px">Пока пусто. Добавь блюда из базы.</div>';}
    else{
      for(var k=0;k<state.dayConstructor.length;k++){
        var item=state.dayConstructor[k];
        lh+='<div class="day-constructor-item"><div class="day-constructor-item-info">'+item.name+'<div style="font-size:10.5px;color:var(--text-soft);font-weight:700">'+item.cal+' ккал</div></div><button class="day-constructor-item-remove" onclick="removeFromConstructor('+k+')">✖</button></div>';
      }
    }
    listEl.innerHTML=lh;
  }
}
function removeFromConstructor(idx){
  state.dayConstructor.splice(idx,1);
  save();updateConstructorSummary();
}
function openDayConstructor(){
  if(!state.dayConstructor)state.dayConstructor=[];
  updateConstructorSummary();
  document.getElementById('dayConstructorModal').classList.add('active');
}
function saveDayConstructor(){
  if(!state.dayConstructor.length){showToast('Добавь хотя бы одно блюдо',true);return;}
  var today=dateKey(new Date());
  for(var i=0;i<state.dayConstructor.length;i++){
    var d=state.dayConstructor[i];
    state.foodLog.push({id:'f_'+Date.now()+'_'+i,date:today,name:d.name,protein:d.protein,fat:d.fat,carbs:d.carbs,calories:d.cal});
  }
  state.dayConstructor=[];
  addXP(20);
  save();closeModal('dayConstructorModal');render();
  showToast('🍽 День сохранён! +20 XP');
  checkAchievements();checkNewCards();
}
function addFood(){var n=(document.getElementById('fName')||{}).value;var p=parseFloat((document.getElementById('fProtein')||{}).value)||0;var f=parseFloat((document.getElementById('fFat')||{}).value)||0;var c=parseFloat((document.getElementById('fCarbs')||{}).value)||0;var cal=parseFloat((document.getElementById('fCalories')||{}).value)||0;if(!n){showToast('Введи еду',true);return;}if(!state.foodLog)state.foodLog=[];state.foodLog.push({id:'f_'+Date.now(),date:dateKey(new Date()),name:n,protein:p,fat:f,carbs:c,calories:cal});save();document.getElementById('fName').value='';render();closeModal('foodAddModal');showToast('🍎 Добавлено');checkAchievements();checkNewCards();}
function removeFood(id){if(!confirm('Удалить?'))return;state.foodLog=state.foodLog.filter(function(f){return f.id!==id;});save();render();}
function renderFood(){
  var c=document.getElementById('foodContainer');if(!c)return;
  var today=dateKey(new Date());
  var todayCal=0,todayP=0,todayF=0,todayC=0;
  if(state.foodLog)for(var i=0;i<state.foodLog.length;i++){if(state.foodLog[i].date===today){todayCal+=state.foodLog[i].calories;todayP+=state.foodLog[i].protein;todayF+=state.foodLog[i].fat;todayC+=state.foodLog[i].carbs;}}
  var h='';
  if(state.profile.onboardingComplete){
    var target=calcTargetCalories();var macros=calcMacros();
    var pct=target>0?Math.min(100,Math.round(todayCal/target*100)):0;
    h+='<div class="plan-section"><div class="plan-title">🎯 Норма из профиля</div><div class="water-calc-display"><div><span class="water-calc-value">'+todayCal+'</span><span class="water-calc-unit">/ '+target+'</span></div><div class="water-calc-label">Ккал сегодня · '+pct+'%</div></div><div class="progress-bar" style="height:14px"><div class="progress-fill" style="width:'+pct+'%;background:linear-gradient(90deg,#4cd964,#4facfe)"></div></div><div class="progress-mini" style="margin-top:12px"><div class="progress-mini-item"><div class="progress-mini-value" style="color:#4cd964">'+Math.round(todayP)+'/'+macros.proteinG+'</div><div class="progress-mini-label">Белки</div></div><div class="progress-mini-item"><div class="progress-mini-value" style="color:#ffd166">'+Math.round(todayF)+'/'+macros.fatG+'</div><div class="progress-mini-label">Жиры</div></div><div class="progress-mini-item"><div class="progress-mini-value" style="color:#4facfe">'+Math.round(todayC)+'/'+macros.carbsG+'</div><div class="progress-mini-label">Углеводы</div></div></div></div>';
  }
  h+='<div class="plan-section"><div class="plan-title">🍽 Что съесть?</div><div class="info-text" style="margin:4px 0 12px">Выбери из базы 80+ блюд или собери свой день.</div><button class="btn-block primary" onclick="openFoodLibrary()" style="margin-bottom:8px">🍳 Открыть базу блюд</button><button class="btn-block" onclick="openDayConstructor()">📋 Составить день</button><button class="btn-block" onclick="document.getElementById(\'foodAddModal\').classList.add(\'active\')">➕ Своё блюдо</button></div>';
  if(state.foodLog&&state.foodLog.length){
    var recent=state.foodLog.slice().reverse().slice(0,20);
    h+='<div class="section-title">Записи</div>';
    for(var j=0;j<recent.length;j++){
      var f=recent[j];
      h+='<div class="food-log-item"><div style="flex:1;min-width:0"><div style="font-weight:800">'+escapeHtml(f.name)+'</div><div class="food-macros"><span>Б:<b>'+f.protein+'</b></span><span>Ж:<b>'+f.fat+'</b></span><span>У:<b>'+f.carbs+'</b></span></div><div style="font-size:10px;color:var(--text-soft);font-weight:700;margin-top:2px">'+f.date+'</div></div><div style="text-align:right"><div style="font-weight:800;color:#7dc7ff">'+f.calories+' ккал</div><button class="mini-btn danger" style="padding:4px 8px;font-size:10px;margin-top:4px" onclick="removeFood(\''+f.id+'\')">✖</button></div></div>';
    }
  }
  c.innerHTML=h;
}
function renderTips(){var c=document.getElementById('tipsContainer');if(!c)return;var p=state.profile;var tips=[];
  if(p.onboardingComplete){
    if(p.goal==='lose')tips.push({icon:'🔥',title:'Цель: похудение',text:'Дефицит 400 ккал. Кардио 3-4×нед, силовые 2-3×нед. Вода 2-3 л. Сон 8ч. Белок 2 г/кг.'});
    else if(p.goal==='gain')tips.push({icon:'💪',title:'Цель: масса',text:'Профицит 300 ккал. Силовые 4×нед с базовыми. Прогрессия весов каждые 1-2 нед. Сон 8+ч.'});
    else if(p.goal==='recomp')tips.push({icon:'✨',title:'Цель: рельеф',text:'Силовые 4×нед + HIIT 2×нед. Лёгкий дефицит. Белок 2 г/кг.'});
    else tips.push({icon:'⚖️',title:'Цель: поддержание',text:'Разнообразие тренировок 3-4×нед.'});
    var bmi=calcBMI();
    if(bmi&&bmi<18.5)tips.push({icon:'⚠️',title:'Недостаток веса',text:'ИМТ '+bmi+'. Профицит и силовые. Врач.'});
    if(bmi&&bmi>=30)tips.push({icon:'⚠️',title:'Высокий ИМТ',text:'ИМТ '+bmi+'. Ходьба 30 мин/день. Врач.'});
    if(p.sleepHours<7)tips.push({icon:'😴',title:'Мало сна',text:'Спишь '+p.sleepHours+'ч. Цель 8ч.'});
  }
  tips.push({icon:'🏋️',title:'Как тренироваться',text:'3-4 силовые/нед + 2 кардио. Разминка 5 мин, основа 40 мин, заминка 5 мин.'});
  tips.push({icon:'🍎',title:'Что есть',text:'Белок 1.6-2.2 г/кг. Жиры 0.8-1 г/кг. Овощи в каждом приёме. Вода 30 мл/кг.'});
  tips.push({icon:'💤',title:'Восстановление',text:'Сон 7-9 часов. 48 часов отдыха для группы мышц.'});
  var h='';for(var i=0;i<tips.length;i++)h+='<div class="tip-card"><div class="tip-card-icon">'+tips[i].icon+'</div><div class="tip-card-title">'+tips[i].title+'</div><div class="tip-card-text">'+tips[i].text+'</div></div>';
  c.innerHTML=h;}

/* ============================================================
   ФИНАНСЫ — СТРАТЕГИИ И КОПИЛКИ
============================================================ */
var STRATEGIES=[
{id:'50-30-20',icon:'💎',name:'50/30/20',author:'Элизабет Уоррен',desc:'50% нужно · 30% желания · 20% сбережения',save:0.2},
{id:'70-20-10',icon:'💰',name:'70/20/10',author:'Харв Экер',desc:'70% траты · 20% сбережения · 10% инвестиции',save:0.3},
{id:'envelopes',icon:'✉️',name:'4 конверта',author:'Японская школа',desc:'Разделить на категории + 20% в копилку',save:0.2},
{id:'fire',icon:'🔥',name:'FIRE',author:'Financial Independence',desc:'70%+ накоплений',save:0.7},
{id:'pay_yourself',icon:'🏦',name:'Плати себе',author:'Уоррен Баффет',desc:'Сначала отложи 10-20%, потом трать',save:0.15},
{id:'kakeibo',icon:'🎋',name:'Kakeibo',author:'Японская система',desc:'Веди дневник расходов + 15% копилка',save:0.15},
{id:'snowball',icon:'❄️',name:'Снежный ком',author:'Дэйв Рэмси',desc:'Сначала закрывай мелкие долги, потом крупные',save:0.2},
{id:'avalanche',icon:'🏔️',name:'Лавина',author:'Финансовая школа',desc:'Сначала закрывай долги с высоким %',save:0.25}];

function renderStrategyList(){
  var c=document.getElementById('strategyList');if(!c)return;
  var h='';
  if(!state.salary){h='<div class="info-text" style="text-align:center;padding:20px 0">Укажи зарплату, чтобы увидеть расчёты</div>';c.innerHTML=h;return;}
  for(var i=0;i<STRATEGIES.length;i++){
    var s=STRATEGIES[i];
    var monthly=state.salary.amount*s.save;
    var yearly=monthly*12;
    var sel=state.activeStrategy===s.id;
    h+='<button class="strategy-opt'+(sel?' selected':'')+'" onclick="selectStrategy(\''+s.id+'\')">';
    h+='<div class="strategy-head"><div class="strategy-icon">'+s.icon+'</div><div><div class="strategy-name">'+s.name+'</div><div class="strategy-author">'+s.author+'</div></div></div>';
    h+='<div class="strategy-desc">'+s.desc+'</div>';
    h+='<div class="strategy-calc">💵 '+monthly.toFixed(0)+' ₽/мес · '+yearly.toFixed(0)+' ₽/год</div>';
    h+='</button>';
  }
  c.innerHTML=h;
}
function openStrategyModal(){renderStrategyList();document.getElementById('strategyModal').classList.add('active');}
function selectStrategy(id){
  state.activeStrategy=id;save();
  closeModal('strategyModal');render();
  var s=null;for(var i=0;i<STRATEGIES.length;i++)if(STRATEGIES[i].id===id)s=STRATEGIES[i];
  showToast('✅ Стратегия: '+s.name);
  checkAchievements();
}
function renderSavings(){
  var h='';
  if(!state.savings||!state.savings.length){
    h+='<div class="empty-state" style="padding:24px"><div class="empty-icon">🏦</div>Нет копилок. Создай первую!</div>';
  } else {
    for(var i=0;i<state.savings.length;i++){
      var s=state.savings[i];
      var pct=Math.min(100,(s.current/s.target*100));
      h+='<div class="savings-card"><div class="savings-head"><div class="savings-name">🏦 '+escapeHtml(s.name)+'</div><div class="savings-amount">'+Math.round(s.current)+' / '+Math.round(s.target)+' ₽</div></div><div class="savings-progress"><div class="savings-progress-fill" style="width:'+pct+'%"></div></div><div class="savings-meta"><span>'+Math.round(pct)+'%</span><span>'+(pct>=100?'🎉 Цель!':'Осталось: '+Math.round(s.target-s.current)+' ₽')+'</span></div><div style="display:flex;gap:8px;margin-top:12px"><button class="mini-btn green" onclick="addToSavings(\''+s.id+'\')">💰 Пополнить</button><button class="mini-btn danger" onclick="removeSavings(\''+s.id+'\')">✖</button></div></div>';
    }
  }
  return h;
}
function createSavings(){
  var n=(document.getElementById('savName')||{}).value;
  var t=parseFloat((document.getElementById('savTarget')||{}).value);
  var c=parseFloat((document.getElementById('savCurrent')||{}).value)||0;
  if(!n||!t||t<=0){showToast('Заполни',true);return;}
  if(!state.savings)state.savings=[];
  state.savings.push({id:'sav_'+Date.now(),name:n,target:t,current:c,created:dateKey(new Date())});
  save();closeModal('savingsAddModal');
  render();showToast('🏦 Копилка создана!');
  checkAchievements();checkNewCards();
}
function removeSavings(id){if(!confirm('Удалить копилку?'))return;state.savings=state.savings.filter(function(s){return s.id!==id;});save();render();}
function addToSavings(id){
  var s=null;for(var i=0;i<state.savings.length;i++)if(state.savings[i].id===id)s=state.savings[i];
  if(!s)return;
  var v=prompt('Сколько добавить?','1000');
  if(!v)return;
  var num=parseFloat(v);
  if(isNaN(num)||num<=0){showToast('Некорректно',true);return;}
  s.current+=num;
  state.financeLog.push({date:dateKey(new Date()),amount:num,cat:'Копилка: '+s.name,type:'expense'});
  save();render();showToast('🏦 +'+num+' ₽ в копилку');
}
function addFinanceLog(type){var a=parseFloat((document.getElementById('finAmount')||{}).value);var c=(document.getElementById('finCat')||{}).value||'Прочее';if(!a||isNaN(a)){showToast('Введи сумму',true);return;}state.financeLog.push({date:dateKey(new Date()),amount:a,cat:c,type:type});save();document.getElementById('finAmount').value='';render();showToast('💰 Добавлено');checkAchievements();}
function removeFinanceLog(i){state.financeLog.splice(i,1);save();render();}
function saveSalary(){var a=parseFloat((document.getElementById('salaryAmount')||{}).value);var d=parseInt((document.getElementById('salaryDay')||{}).value);var p=(document.getElementById('salaryPeriod')||{}).value||'month';if(!a||!d){showToast('Заполни',true);return;}state.salary={amount:a,day:d,period:p};save();render();showToast('💼 Настроено');checkAchievements();}
function renderFinance(){
  var c=document.getElementById('financeContainer');if(!c)return;
  var income=0,expense=0;
  if(state.financeLog)for(var i=0;i<state.financeLog.length;i++){if(state.financeLog[i].type==='income')income+=state.financeLog[i].amount;else expense+=state.financeLog[i].amount;}
  var balance=income-expense;
  var h='<div class="plan-section"><div class="plan-title">📊 Баланс</div><div class="progress-mini"><div class="progress-mini-item"><div class="progress-mini-value" style="color:#7ce68d">+'+income.toFixed(0)+'</div><div class="progress-mini-label">Доход</div></div><div class="progress-mini-item"><div class="progress-mini-value" style="color:#ff8296">−'+expense.toFixed(0)+'</div><div class="progress-mini-label">Расход</div></div><div class="progress-mini-item"><div class="progress-mini-value" style="color:'+(balance>=0?'#7dc7ff':'#ff8296')+'">'+balance.toFixed(0)+'</div><div class="progress-mini-label">Баланс</div></div></div></div>';
  /* Активная стратегия */
  if(state.activeStrategy&&state.salary){
    var s=null;for(var k=0;k<STRATEGIES.length;k++)if(STRATEGIES[k].id===state.activeStrategy)s=STRATEGIES[k];
    if(s){
      var monthly=state.salary.amount*s.save;
      h+='<div class="strategy-active-banner"><div class="strategy-active-icon">'+s.icon+'</div><div class="strategy-active-name">'+s.name+'</div><div class="strategy-active-amount">'+monthly.toFixed(0)+' ₽</div><div class="strategy-active-label">откладывать в месяц</div><button class="mini-btn purple" style="margin-top:12px;flex:0;padding:8px 20px" onclick="openStrategyModal()">Изменить стратегию</button></div>';
    }
  } else {
    h+='<div class="plan-section"><div class="plan-title">🎯 Стратегия сбережения</div><div class="info-text">Выбери стратегию — приложение рассчитает, сколько откладывать каждый месяц.</div><button class="btn-block primary" onclick="openStrategyModal()">💰 Выбрать стратегию</button></div>';
  }
  /* Копилки */
  h+='<div class="section-title">🏦 Копилки</div>';
  h+=renderSavings();
  h+='<button class="btn-block primary" onclick="document.getElementById(\'savingsAddModal\').classList.add(\'active\')">🏦 Создать копилку</button>';
  /* Зарплата */
  h+='<div class="plan-section"><div class="plan-title">💼 Зарплата</div>';
  if(state.salary){var per=state.salary.period==='month'?'раз в месяц':state.salary.period==='2weeks'?'раз в 2 недели':'раз в неделю';h+='<div class="insight-card" style="margin-bottom:12px"><div class="insight-icon">💰</div><div class="insight-text"><b>'+state.salary.amount+' ₽</b> · '+state.salary.day+' числа · '+per+'</div></div>';}
  h+='<div class="input-row"><input class="plan-input" type="number" id="salaryAmount" placeholder="Сумма" value="'+(state.salary?state.salary.amount:'')+'"><input class="plan-input" type="number" id="salaryDay" min="1" max="31" placeholder="День" value="'+(state.salary?state.salary.day:'')+'"></div>';
  h+='<div class="input-row"><select class="plan-input" id="salaryPeriod"><option value="month"'+(state.salary&&state.salary.period==='month'?' selected':'')+'>Месяц</option><option value="2weeks"'+(state.salary&&state.salary.period==='2weeks'?' selected':'')+'>2 недели</option><option value="week"'+(state.salary&&state.salary.period==='week'?' selected':'')+'>Неделя</option></select><button class="mini-btn purple" onclick="saveSalary()">💾</button></div></div>';
  /* Новая запись */
  h+='<div class="plan-section"><div class="plan-title">➕ Новая запись</div><div class="input-row"><input class="plan-input" type="number" id="finAmount" placeholder="Сумма"><select class="plan-input" id="finCat" style="max-width:130px"><option value="Еда">Еда</option><option value="Транспорт">Транспорт</option><option value="Развлечения">Развлечения</option><option value="Здоровье">Здоровье</option><option value="Дом">Дом</option><option value="ЗП">ЗП</option><option value="Прочее">Прочее</option></select></div><div class="input-row"><button class="mini-btn green" onclick="addFinanceLog(\'income\')" style="flex:1">💵 Доход</button><button class="mini-btn danger" onclick="addFinanceLog(\'expense\')" style="flex:1">💸 Расход</button></div></div>';
  if(state.financeLog&&state.financeLog.length){
    h+='<div class="section-title">Последние</div>';
    var recent=state.financeLog.slice().reverse().slice(0,10);
    for(var j=0;j<recent.length;j++){
      var e=recent[j];
      var col=e.type==='income'?'#7ce68d':'#ff8296';
      var sign=e.type==='income'?'+':'−';
      h+='<div class="log-item"><div class="log-date">'+e.date+'</div><div class="log-value" style="color:'+col+'">'+sign+e.amount+' ₽ · '+e.cat+'</div><button class="mini-btn danger" style="flex:0;padding:6px 10px" onclick="removeFinanceLog('+(state.financeLog.length-1-j)+')">✖</button></div>';
    }
  }
  c.innerHTML=h;
}

/* ============================================================
   ПРИВЫЧКИ
============================================================ */
function renderHabits(){
  var c=document.getElementById('habitsContainer');if(!c)return;
  if(!state.habits.list.length){
    c.innerHTML='<div class="info-text">Пока нет привычек. Добавь первую!</div><div class="habit-add-row"><input class="plan-input" id="habitName" placeholder="Новая привычка" maxlength="30"><button class="mini-btn purple" onclick="addHabit()">➕</button></div>';
    return;
  }
  var t=dateKey(new Date());
  var days=[];for(var d=13;d>=0;d--){var dd=new Date(Date.now()-d*86400000);days.push(dateKey(dd));}
  var h='';
  var totalChecks=0,maxChecks=state.habits.list.length*14;
  for(var dk in state.habits.log)if(state.habits.log.hasOwnProperty(dk))for(var hid in state.habits.log[dk])if(state.habits.log[dk][hid])totalChecks++;
  var rate=maxChecks>0?Math.round(totalChecks/maxChecks*100):0;
  h+='<div class="plan-section" style="margin-bottom:14px"><div class="plan-title">📊 За 14 дней</div><div style="display:flex;justify-content:space-between;font-size:13px;color:var(--text-dim);font-weight:700;margin-bottom:10px"><span>Выполнено: '+totalChecks+'</span><span>Успех: '+rate+'%</span></div><div class="progress-bar" style="height:14px"><div class="progress-fill" style="width:'+rate+'%;background:linear-gradient(90deg,#4cd964,#4facfe)"></div></div></div>';
  h+='<div class="habit-table-wrap"><div class="habit-header"><div class="habit-name-col">Привычка</div>';
  for(var i=0;i<days.length;i++)h+='<div class="habit-day-col">'+days[i].split('-')[2]+'</div>';
  h+='<div class="habit-day-col" style="color:var(--gold)">%</div></div>';
  for(var j=0;j<state.habits.list.length;j++){
    var habit=state.habits.list[j];var habitCount=0;
    for(var dk3 in state.habits.log)if(state.habits.log[dk3][habit.id])habitCount++;
    var habitPct=Math.round(habitCount/14*100);
    h+='<div class="habit-row"><div class="habit-name-col">'+escapeHtml(habit.name)+'</div>';
    for(var k=0;k<days.length;k++){
      var dk4=days[k];var log=state.habits.log[dk4]||{};var done=log[habit.id];var isT=dk4===t;
      h+='<div class="habit-day-col"><button class="habit-cell'+(done?' done':'')+(isT?' today':'')+'" '+(isT?'onclick="toggleHabitToday(\''+habit.id+'\')"':'disabled')+'>'+(done?'✓':'')+'</button></div>';
    }
    h+='<div class="habit-day-col" style="color:var(--gold);font-weight:800;font-size:11px">'+habitPct+'%</div></div>';
  }
  h+='</div><div class="habit-add-row"><input class="plan-input" id="habitName" placeholder="Новая привычка" maxlength="30"><button class="mini-btn purple" onclick="addHabit()">➕</button></div>';
  c.innerHTML=h;
}

/* ============================================================
   НАСТРОЕНИЕ
============================================================ */
function setMood(e){if(!state.moods)state.moods={};var t=dateKey(new Date());if(state.moods[t]===e){delete state.moods[t];}else{state.moods[t]=e;setTimeout(function(){openMoodNote(t);},300);}save();render();checkAchievements();checkNewCards();}
function openMoodNote(dayKey){document.getElementById('moodNoteTitle').textContent='📝 Заметка';document.getElementById('moodNoteDay').textContent=dayKey;document.getElementById('moodNoteText').value=(state.moodNotes&&state.moodNotes[dayKey])||'';document.getElementById('moodNoteModal').classList.add('active');document.getElementById('moodNoteModal').dataset.day=dayKey;}
function saveMoodNote(){var k=document.getElementById('moodNoteModal').dataset.day;var v=document.getElementById('moodNoteText').value.trim();if(!state.moodNotes)state.moodNotes={};if(v)state.moodNotes[k]=v;else delete state.moodNotes[k];save();closeModal('moodNoteModal');render();showToast('💾 Сохранено');}
function showDayDetail(dayKey){var xp=state.history[dayKey]||0;var mood=state.moods[dayKey]||'';var moodName=mood?getMoodName(mood):'Не отмечено';var note=(state.moodNotes&&state.moodNotes[dayKey])||'';var pr=0;if(state.habits.log[dayKey]){for(var id in state.habits.log[dayKey])if(state.habits.log[dayKey][id])pr++;}var h='<div style="margin-bottom:12px;font-size:15px;font-weight:900;color:#7dc7ff">'+dayKey+'</div>';h+='<div class="insight-card"><div class="insight-icon">⚡</div><div class="insight-text">XP: <b>'+xp+'</b></div></div>';h+='<div class="insight-card"><div class="insight-icon">'+(mood||'❔')+'</div><div class="insight-text">Настроение: <b>'+moodName+'</b></div></div>';h+='<div class="insight-card"><div class="insight-icon">📅</div><div class="insight-text">Привычек: <b>'+pr+'</b></div></div>';if(note)h+='<div class="insight-card"><div class="insight-icon">📝</div><div class="insight-text">'+escapeHtml(note)+'</div></div>';document.getElementById('dayDetailTitle').textContent='📅 '+dayKey;document.getElementById('dayDetailBody').innerHTML=h;document.getElementById('dayDetailModal').classList.add('active');}
function showMoodMonth(year,month){var daysInMonth=new Date(year,month+1,0).getDate();var scores=[],count=0;for(var d=1;d<=daysInMonth;d++){var k=year+'-'+String(month+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');var m=state.moods[k];if(m){scores.push(getMoodScore(m));count++;}}var avg=scores.length?scores.reduce(function(a,b){return a+b;},0)/scores.length:0;var monthNames=['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];var h='<div class="insight-card"><div class="insight-icon">📊</div><div class="insight-text">Средний: <b>'+avg.toFixed(1)+' / 7</b></div></div>';h+='<div class="insight-card"><div class="insight-icon">📝</div><div class="insight-text">Отметок: <b>'+count+'</b> из '+daysInMonth+'</div></div>';document.getElementById('moodDetailTitle').textContent=monthNames[month]+' '+year;document.getElementById('moodDetailBody').innerHTML=h;document.getElementById('moodDetailModal').classList.add('active');}
function renderMood(){
  var c=document.getElementById('moodContainer');if(!c)return;
  var t=dateKey(new Date());var cur=state.moods&&state.moods[t];
  var h='<div class="section-title" style="margin-top:0">Как ты сегодня?</div><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin:14px 0">';
  for(var i=0;i<MOODS.length;i++)h+='<div style="aspect-ratio:1;border-radius:14px;background:var(--glass);border:2px solid '+(cur===MOODS[i].e?'#8b7cff':'var(--glass-border)')+';display:flex;align-items:center;justify-content:center;font-size:26px;cursor:pointer" onclick="setMood(\''+MOODS[i].e+'\')">'+MOODS[i].e+'</div>';
  h+='</div>';
  if(cur)h+='<div style="text-align:center;color:var(--text-dim);font-size:13px;margin-bottom:14px">Сегодня: '+cur+' '+getMoodName(cur)+'</div>';
  h+='<div class="mood-grid-wrap">';
  var now=new Date();
  for(var mo=5;mo>=0;mo--){
    var dt=new Date(now.getFullYear(),now.getMonth()-mo,1);var y=dt.getFullYear(),m=dt.getMonth();
    var daysInMonth=new Date(y,m+1,0).getDate();
    var monthNames=['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
    h+='<div class="mood-month-title">'+monthNames[m]+' '+y+'</div><div class="mood-grid">';
    for(var d=1;d<=daysInMonth;d++){
      var key=y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
      var mood=state.moods[key]||'';var cls='mood-square';if(!mood)cls+=' empty';else cls+=' s'+getMoodScore(mood);
      if(key===t)cls+=' today';
      var hasNote=state.moodNotes&&state.moodNotes[key];
      h+='<div class="'+cls+'" onclick="showDayDetail(\''+key+'\')">'+(mood||d)+(hasNote?'<span class="mood-note-preview"></span>':'')+'</div>';
    }
    h+='</div>';
  }
  h+='<div class="mood-legend">';
  var legends=[{e:'🔥',s:7},{e:'😊',s:6},{e:'😐',s:5},{e:'😴',s:4},{e:'😤',s:3},{e:'😔',s:2},{e:'😰',s:1}];
  for(var li=0;li<legends.length;li++)h+='<div class="mood-legend-item"><div class="mood-legend-dot mood-square s'+legends[li].s+'" style="width:18px;height:18px;border:none"></div>'+legends[li].e+'</div>';
  h+='</div></div>';
  c.innerHTML=h;
}
function renderMoodAnalytics(){
  var c=document.getElementById('moodAnalyticsContainer');if(!c)return;
  var now=new Date();var h='';
  for(var mo=5;mo>=0;mo--){
    var dt=new Date(now.getFullYear(),now.getMonth()-mo,1);var y=dt.getFullYear(),m=dt.getMonth();
    var daysInMonth=new Date(y,m+1,0).getDate();var scores=[],count=0;
    for(var d=1;d<=daysInMonth;d++){var key=y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');var mm=state.moods[key];if(mm){scores.push(getMoodScore(mm));count++;}}
    if(count===0)continue;
    var avg=scores.reduce(function(a,b){return a+b;},0)/scores.length;
    var mid=Math.floor(scores.length/2);var fh=scores.slice(0,mid),sh=scores.slice(mid);
    var avg1=fh.length?fh.reduce(function(a,b){return a+b;},0)/fh.length:avg;
    var avg2=sh.length?sh.reduce(function(a,b){return a+b;},0)/sh.length:avg;
    var td=avg2-avg1;var tt='➡️ Стабильно';
    if(td>0.5)tt='📈 Растёт';else if(td<-0.5)tt='📉 Падает';
    var mNames=['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
    h+='<div class="mood-analytics"><div class="mood-analytics-month" onclick="showMoodMonth('+y+','+m+')"><div class="mood-analytics-head"><div class="mood-analytics-name">'+mNames[m]+' '+y+'</div><div class="mood-analytics-count">'+count+' / '+daysInMonth+'</div></div><div class="mood-analytics-stats"><div class="mood-analytics-stat"><div class="mood-analytics-stat-value">'+avg.toFixed(1)+'</div><div class="mood-analytics-stat-label">Средний</div></div><div class="mood-analytics-stat"><div class="mood-analytics-stat-value">'+count+'</div><div class="mood-analytics-stat-label">Отметок</div></div><div class="mood-analytics-stat"><div class="mood-analytics-stat-value" style="font-size:12px">'+tt+'</div><div class="mood-analytics-stat-label">Тренд</div></div></div></div></div>';
  }
  if(!h)h='<div class="empty-state"><div class="empty-state-icon">📊</div>Отмечай настроение</div>';
  c.innerHTML=h;
}

/* ============================================================
   КНИГИ, ЗНАНИЯ, ЗДОРОВЬЕ
============================================================ */
var currentBookId=null;
function openBook(id){var b=null;for(var i=0;i<BOOKS.length;i++)if(BOOKS[i].id===id)b=BOOKS[i];if(!b)return;currentBookId=id;document.getElementById('bookTitle').textContent=b.title;document.getElementById('bookAuthor').textContent=b.author+' · '+b.summary;var h='';for(var i=0;i<b.ideas.length;i++)h+='<div style="padding:12px 14px;background:rgba(255,255,255,0.04);border-radius:12px;margin-bottom:10px;border-left:3px solid #4facfe;font-size:13px;line-height:1.6">💡 '+b.ideas[i]+'</div>';document.getElementById('bookBody').innerHTML=h;document.getElementById('bookModal').classList.add('active');}
function markBookRead(){if(!currentBookId)return;if(state.booksReadList.indexOf(currentBookId)>=0){showToast('Уже прочитано');return;}state.booksReadList.push(currentBookId);state.booksRead=(state.booksRead||0)+1;addXP(100);showToast('📚 +100 XP');save();render();checkAchievements();closeModal('bookModal');}
function renderBooks(){var c=document.getElementById('booksContainer');if(!c)return;var h='';for(var i=0;i<BOOKS.length;i++){var b=BOOKS[i];var isRead=state.booksReadList.indexOf(b.id)>=0;h+='<div class="book-card" onclick="openBook(\''+b.id+'\')"><div class="book-cover">'+b.icon+'</div><div class="book-info"><div class="book-title">'+b.title+(isRead?' ✅':'')+'</div><div class="book-author">'+b.author+'</div><div class="book-summary">'+b.summary+'</div></div></div>';}c.innerHTML=h;}
function renderHealth(){var c=document.getElementById('healthContainer');if(!c)return;var h='';for(var ci=0;ci<HEALTH_BASE.length;ci++){var cat=HEALTH_BASE[ci];var parts=cat.cat.split(' ');h+='<div class="health-cat" id="hc-'+ci+'"><div class="health-header" onclick="toggleHealth('+ci+')"><div class="health-title"><div class="health-icon" style="background:linear-gradient(135deg,#8b7cff,#f093fb)">'+parts[0]+'</div><span>'+parts.slice(1).join(' ')+'</span></div><span class="health-arrow">›</span></div><div class="health-body">';for(var ii=0;ii<cat.items.length;ii++){var it=cat.items[ii];h+='<div class="health-item"><div class="health-item-title">'+it.name+'</div><div class="health-item-what">'+it.what+'</div><div class="health-mechanism"><b>Как работает</b>'+it.mechanism+'</div><div class="health-steps"><b>План</b>';for(var s=0;s<it.steps.length;s++)h+='<div class="health-step">'+it.steps[s]+'</div>';h+='</div>'+(it.when?'<div class="health-when"><b>⏰</b> '+it.when+'</div>':'')+'</div>';}h+='</div></div>';}c.innerHTML=h;}
function toggleHealth(i){var el=document.getElementById('hc-'+i);if(el)el.classList.toggle('open');}
function filterHealth(q){var query=q.toLowerCase().trim();for(var ci=0;ci<HEALTH_BASE.length;ci++){var el=document.getElementById('hc-'+ci);if(!el)continue;if(!query){el.style.display='';el.classList.remove('open');continue;}var cat=HEALTH_BASE[ci];var has=false;for(var i=0;i<cat.items.length;i++){var it=cat.items[i];if(it.name.toLowerCase().indexOf(query)>=0)has=true;else if(it.what.toLowerCase().indexOf(query)>=0)has=true;if(has)break;}el.style.display=has?'':'none';if(has)el.classList.add('open');}}
function renderKnowledge(){var c=document.getElementById('knowledgeContainer');if(!c)return;var h='';for(var ci=0;ci<KNOWLEDGE_BASE.length;ci++){var cat=KNOWLEDGE_BASE[ci];var parts=cat.cat.split(' ');h+='<div class="health-cat" id="kc-'+ci+'"><div class="health-header" onclick="toggleKb('+ci+')"><div class="health-title"><div class="health-icon" style="background:linear-gradient(135deg,#4facfe,#8b7cff)">'+parts[0]+'</div><span>'+parts.slice(1).join(' ')+'</span></div><span class="health-arrow">›</span></div><div class="health-body">';for(var ii=0;ii<cat.items.length;ii++){var it=cat.items[ii];h+='<div class="health-item"><div class="health-item-title">'+it.name+'</div><div class="health-item-what">'+it.what+'</div><div class="health-steps"><b>Что даёт</b>';for(var b=0;b<it.benefits.length;b++)h+='<div class="health-step">'+it.benefits[b]+'</div>';h+='</div><div class="health-mechanism"><b>Как делать</b>'+it.how+'</div>'+(it.when?'<div class="health-when"><b>⏰</b> '+it.when+'</div>':'')+'</div>';}h+='</div></div>';}c.innerHTML=h;}
function toggleKb(i){var el=document.getElementById('kc-'+i);if(el)el.classList.toggle('open');}
function filterKnowledge(q){var query=q.toLowerCase().trim();for(var ci=0;ci<KNOWLEDGE_BASE.length;ci++){var el=document.getElementById('kc-'+ci);if(!el)continue;if(!query){el.style.display='';el.classList.remove('open');continue;}var cat=KNOWLEDGE_BASE[ci];var has=false;for(var i=0;i<cat.items.length;i++){var it=cat.items[i];if(it.name.toLowerCase().indexOf(query)>=0)has=true;else if(it.what.toLowerCase().indexOf(query)>=0)has=true;if(has)break;}el.style.display=has?'':'none';if(has)el.classList.add('open');}}

/* ============================================================
   КУРСЫ, АСКЕЗЫ, ПРЕГРАДЫ, ПУТЬ
============================================================ */
function renderCourses(){var c=document.getElementById('coursesContainer');if(!c)return;var h='';for(var i=0;i<COURSES.length;i++){var course=COURSES[i];var prog=state.courseProgress[course.id]||{completedDays:[]};var done=prog.completedDays.length,total=course.days.length,pct=(done/total)*100;var active=state.courseActive===course.id;h+='<div class="course-card'+(active?' course-active-card':'')+'" onclick="startCourseModal(\''+course.id+'\')"><div class="course-head"><div class="course-icon" style="background:linear-gradient(135deg,'+course.color+',#8b7cff)">'+course.icon+'</div><div class="course-info"><div class="course-name">'+course.name+(active?' (активен)':'')+'</div><div class="course-desc">'+course.desc+'</div></div></div><div class="course-meta"><span>📅 '+total+'</span><span>📊 '+done+' / '+total+'</span></div><div class="course-progress-bar"><div class="course-progress-fill" style="width:'+pct+'%"></div></div></div>';}c.innerHTML=h;}
function startCourseModal(id){var c=null;for(var i=0;i<COURSES.length;i++)if(COURSES[i].id===id)c=COURSES[i];if(!c)return;if(state.courseActive){showToast('Уже есть активный курс',true);return;}state.courseActive=id;state.courseStartDate=Date.now();state.courseMissedDays=0;if(!state.courseProgress[id])state.courseProgress[id]={completedDays:[]};save();render();showToast('🎓 Курс начат!');}
function completeCourseDay(courseId,dayIdx){var c=null;for(var i=0;i<COURSES.length;i++)if(COURSES[i].id===courseId)c=COURSES[i];if(!c)return;if(!state.courseProgress[courseId])state.courseProgress[courseId]={completedDays:[]};var prog=state.courseProgress[courseId];if(prog.completedDays.indexOf(dayIdx)>=0)return;var day=c.days[dayIdx];var met=false;if(day.task==='totalDone')met=state.totalDone>=day.value;if(day.task==='streak')met=state.maxStreak>=day.value;if(!met){showToast('Пока не выполнено',true);return;}prog.completedDays.push(dayIdx);addXP(day.reward);save();render();showToast('✅ +'+day.reward+' XP');if(prog.completedDays.length===c.days.length){state.coursesCompleted=(state.coursesCompleted||0)+1;addXP(500);state.courseActive=null;save();render();showToast('🏆 Курс пройден!');}checkAchievements();}
function renderAskesis(){var c=document.getElementById('askesisActive');if(!c)return;var active=(state.askesis||[]).filter(function(a){return !a.completed&&!a.failed;});var h='';if(active.length){for(var i=0;i<active.length;i++){var a=active[i];var days=a.days||[];var prog=Math.min(100,days.length/a.targetDays*100);var t=dateKey(new Date());var marked=days.indexOf(t)>=0;h+='<div class="askesis-card"><div class="askesis-head"><div class="askesis-name">'+a.name+'</div><div class="askesis-days">'+days.length+' / '+a.targetDays+'</div></div><div class="progress-bar"><div class="progress-fill" style="width:'+prog+'%"></div></div><div class="askesis-actions"><button class="mini-btn '+(marked?'gold':'green')+'" onclick="markAskesisDay(\''+a.id+'\')">'+(marked?'✅ Отмечено':'✅ Отметить')+'</button><button class="mini-btn danger" onclick="failAskesis(\''+a.id+'\')">✖ Провал</button></div></div>';}}else h='<div class="empty-state"><div class="empty-icon">🔥</div>Нет аскез</div>';c.innerHTML=h;var c2=document.getElementById('askesisAvailable');if(!c2)return;var used=(state.askesis||[]).map(function(a){return a.id;});var ah='';for(var j=0;j<ASKESIS.length;j++){var ask=ASKESIS[j];if(used.indexOf(ask.id)>=0)continue;ah+='<div class="askesis-card"><div class="askesis-head"><div class="askesis-name">'+ask.name+'</div><div class="askesis-days">'+ask.targetDays+' дн · +'+ask.xp+'</div></div><button class="mini-btn purple" style="margin-top:8px" onclick="startAskesis(\''+ask.id+'\')">▶ Начать</button></div>';}c2.innerHTML=ah;}
function startAskesis(id){var a=null;for(var i=0;i<ASKESIS.length;i++)if(ASKESIS[i].id===id)a=ASKESIS[i];if(!a)return;if(!state.askesis)state.askesis=[];state.askesis.push({id:a.id,name:a.name,targetDays:a.targetDays,xp:a.xp,diff:a.diff,blockH:a.blockH,days:[],completed:false,failed:false,lastMarked:null});save();render();showToast('Аскеза! 🔥');}
function markAskesisDay(id){var a=null;for(var i=0;i<(state.askesis||[]).length;i++)if(state.askesis[i].id===id)a=state.askesis[i];if(!a||a.completed||a.failed)return;var t=dateKey(new Date());if(a.days.indexOf(t)>=0){showToast('Уже');return;}a.days.push(t);a.lastMarked=t;if(a.days.length>=a.targetDays){a.completed=true;addXP(a.xp);showToast('🏆 +'+a.xp+' XP');}else showToast('День '+a.days.length+' / '+a.targetDays);save();render();}
function failAskesis(id){if(!confirm('Провалить?'))return;var a=null;for(var i=0;i<(state.askesis||[]).length;i++)if(state.askesis[i].id===id)a=state.askesis[i];if(!a)return;state.xp=Math.max(0,state.xp-10);a.failed=true;save();render();showToast('❌ Провал',true);}
function toggleBarrierSubtask(barrierId,idx){if(!state.barrierSubtasks)state.barrierSubtasks={};if(!state.barrierSubtasks[barrierId])state.barrierSubtasks[barrierId]=[];var arr=state.barrierSubtasks[barrierId];var i=arr.indexOf(idx);if(i>=0)arr.splice(i,1);else arr.push(idx);save();render();}
function renderBarriers(){var c=document.getElementById('barriersContainer');if(!c)return;var h='';for(var i=0;i<BARRIERS_DATA.length;i++){var b=BARRIERS_DATA[i];var clearedXp=state.xpEarned>=b.reqXp;var subDone=(state.barrierSubtasks[b.id]||[]).length;var subTotal=b.subtasks.length;var allDone=clearedXp&&subDone>=subTotal;var cls='barrier-card'+(allDone?' cleared':'');h+='<div class="'+cls+'"><div class="barrier-head"><div class="barrier-icon">'+b.icon+'</div><div class="barrier-info"><div class="barrier-name">'+b.name+'</div><div class="barrier-tag">'+b.tag+'</div></div></div><div class="barrier-desc">'+b.desc+'</div><div class="barrier-dual-progress"><div class="barrier-progress-mini"><div class="barrier-progress-mini-value">'+Math.min(100,Math.round(state.xpEarned/b.reqXp*100))+'%</div><div class="barrier-progress-mini-label">XP</div></div><div class="barrier-progress-mini"><div class="barrier-progress-mini-value">'+subDone+'/'+subTotal+'</div><div class="barrier-progress-mini-label">Подзадачи</div></div></div><div class="barrier-subtasks">';for(var j=0;j<b.subtasks.length;j++){var done2=(state.barrierSubtasks[b.id]||[]).indexOf(j)>=0;h+='<button class="barrier-subtask '+(done2?'done':'')+'" onclick="toggleBarrierSubtask(\''+b.id+'\','+j+')"><div class="barrier-subtask-check">'+(done2?'✓':'')+'</div><span>'+b.subtasks[j]+'</span></button>';}h+='</div></div>';}c.innerHTML=h;}
function renderPath(){var c=document.getElementById('pathContainer');if(!c)return;var h='';for(var i=0;i<AWAKENING_PATH.length;i++){var s=AWAKENING_PATH[i];var n=i+1;var isC=state.currentPathStep>=n;var isCur=state.currentPathStep===i;var isL=state.currentPathStep<i;var cls='path-step'+(isC?' completed':'')+(isCur?' current':'')+(isL?' locked':'');var reqs='';for(var j=0;j<s.reqs.length;j++){var r=s.reqs[j];var done=false,cur='';if(r.type==='totalDone'){done=state.totalDone>=r.value;cur=state.totalDone+' / '+r.value;}if(r.type==='streak'){done=state.maxStreak>=r.value;cur=state.maxStreak+' / '+r.value;}reqs+='<div class="path-req '+(done?'done':'pending')+'"><span>'+(done?'✅':'⏳')+' '+r.label+'</span><span>'+cur+'</span></div>';}h+='<div class="'+cls+'"><div class="path-header"><div class="path-num">'+s.icon+'</div><div style="flex:1"><div class="path-title">Ступень '+n+': '+s.title+'</div><div class="path-subtitle">'+s.subtitle+'</div></div></div><div class="path-desc">'+s.desc+'</div>'+(isCur||!isC?'<div class="path-reqs">'+reqs+'</div>':'')+'</div>';}c.innerHTML=h;}

/* ============================================================
   ПЛАН ДНЯ
============================================================ */
function hasInterest(i){if(!state.userPlan||!state.userPlan.profile)return false;return state.userPlan.profile.interests.indexOf(i)>=0;}
function pickRadio(el,g){document.querySelectorAll('.radio-opt[data-r="'+g+'"]').forEach(function(x){x.classList.remove('selected');});el.classList.add('selected');}
function toggleInterest(el){el.classList.toggle('selected');}
function buildDayPlan(profile){
  var plan=[];
  function t2m(s){var p=s.split(':');return parseInt(p[0])*60+parseInt(p[1]);}
  function m2t(m){var h=Math.floor(m/60)%24,mm=m%60;return String(h).padStart(2,'0')+':'+String(mm).padStart(2,'0');}
  var wake=t2m(profile.wakeTime),sleep=t2m(profile.sleepTime);
  if(sleep<=wake)sleep+=1440;
  var ws=t2m(profile.workStart),we=t2m(profile.workEnd);
  if(we<=ws)we+=1440;
  plan.push({time:profile.wakeTime,name:'🌅 Пробуждение',desc:'Вода + дыхание',tag:'breath'});
  plan.push({time:m2t(wake+15),name:'🚿 Душ',desc:'Холодный',tag:'health'});
  if(profile.interests.indexOf('body')>=0)plan.push({time:m2t(wake+30),name:'💪 Тренировка',desc:'20-40 мин',tag:'body'});
  plan.push({time:m2t(wake+70),name:'🍳 Завтрак',desc:'Белок',tag:'food'});
  if(profile.interests.indexOf('mind')>=0)plan.push({time:m2t(wake+90),name:'📖 Обучение',desc:'30 мин',tag:'mind'});
  plan.push({time:m2t(wake+120),name:'🧠 Работа',desc:'2-4 часа',tag:'work'});
  plan.push({time:m2t(ws+180),name:'🍽 Обед',desc:'',tag:'food'});
  plan.push({time:m2t(we+30),name:'🏃 Активность',desc:'30-45 мин',tag:'body'});
  plan.push({time:m2t(we+90),name:'🍽 Ужин',desc:'',tag:'food'});
  if(profile.interests.indexOf('meditation')>=0)plan.push({time:m2t(we+120),name:'🧘 Медитация',desc:'',tag:'spirit'});
  if(profile.interests.indexOf('journal')>=0)plan.push({time:m2t(we+150),name:'✍️ Дневник',desc:'',tag:'mind'});
  plan.push({time:m2t(sleep-60),name:'📵 Тишина',desc:'За час',tag:'health'});
  plan.push({time:profile.sleepTime,name:'😴 Сон',desc:'',tag:'rest'});
  plan.sort(function(a,b){return t2m(a.time)-t2m(b.time);});
  return plan;
}
function saveUserPlan(){var w=document.getElementById('pWake'),s=document.getElementById('pSleep'),ws=document.getElementById('pWorkStart'),we=document.getElementById('pWorkEnd'),sh=document.getElementById('pSleepHours');var wt=document.querySelector('.radio-opt[data-r="workType"].selected');var profile={wakeTime:(w||{}).value||'07:00',sleepTime:(s||{}).value||'23:00',workStart:(ws||{}).value||'09:00',workEnd:(we||{}).value||'18:00',workType:wt?wt.dataset.v:'day',sleepHours:parseInt((sh||{}).value)||8,interests:[]};document.querySelectorAll('.interest-opt.selected').forEach(function(el){profile.interests.push(el.dataset.i);});state.userPlan={profile:profile,plan:buildDayPlan(profile),created:dateKey(new Date())};save();render();showToast('🧠 План!');if(state.sound)achSound();checkAchievements();}
function resetPlan(){if(!confirm('Заново?'))return;state.userPlan=null;save();render();}
function renderPlan(){var c=document.getElementById('planContainer');if(!c)return;var h='';if(state.userPlan&&state.userPlan.plan){h+='<div class="plan-section"><div class="plan-title">📅 Распорядок</div>';for(var i=0;i<state.userPlan.plan.length;i++){var it=state.userPlan.plan[i];h+='<div class="schedule-item"><div class="schedule-time">'+it.time+'</div><div class="schedule-info"><div class="schedule-name">'+it.name+'</div><div class="schedule-desc">'+it.desc+'</div><span class="schedule-tag tag-'+it.tag+'">'+it.tag+'</span></div></div>';}h+='<button class="btn-block" style="margin-top:16px" onclick="resetPlan()">🔄 Заново</button></div>';}var pr=state.userPlan?state.userPlan.profile:null;h+='<div class="plan-section"><div class="plan-title">🧠 '+(state.userPlan?'Обновить':'Заполни')+'</div><div class="plan-label">🌅 Подъём</div><input class="plan-input" type="time" id="pWake" value="'+(pr?pr.wakeTime:'07:00')+'"><div class="plan-label">😴 Сон</div><input class="plan-input" type="time" id="pSleep" value="'+(pr?pr.sleepTime:'23:00')+'"><div class="plan-label">⏰ Часов сна</div><input class="plan-input" type="number" id="pSleepHours" min="5" max="11" value="'+(pr?pr.sleepHours:8)+'"><div class="plan-label">💼 Начало работы</div><input class="plan-input" type="time" id="pWorkStart" value="'+(pr?pr.workStart:'09:00')+'"><div class="plan-label">💼 Конец работы</div><input class="plan-input" type="time" id="pWorkEnd" value="'+(pr?pr.workEnd:'18:00')+'"><div class="plan-label">🌓 Режим</div><div class="radio-row"><button class="radio-opt'+((!pr||pr.workType==='day')?' selected':'')+'" data-r="workType" data-v="day" onclick="pickRadio(this,\'workType\')">☀️ День</button><button class="radio-opt'+((pr&&pr.workType==='night')?' selected':'')+'" data-r="workType" data-v="night" onclick="pickRadio(this,\'workType\')">🌙 Ночь</button><button class="radio-opt'+((pr&&pr.workType==='flexible')?' selected':'')+'" data-r="workType" data-v="flexible" onclick="pickRadio(this,\'workType\')">🔀 Гибкий</button></div><div class="plan-label">🎯 Чего достичь</div><div class="interest-grid"><button class="interest-opt'+(hasInterest('body')?' selected':'')+'" data-i="body" onclick="toggleInterest(this)"><span class="emo">💪</span>Спорт</button><button class="interest-opt'+(hasInterest('mind')?' selected':'')+'" data-i="mind" onclick="toggleInterest(this)"><span class="emo">🧠</span>Ум</button><button class="interest-opt'+(hasInterest('meditation')?' selected':'')+'" data-i="meditation" onclick="toggleInterest(this)"><span class="emo">🧘</span>Медитация</button><button class="interest-opt'+(hasInterest('spirit')?' selected':'')+'" data-i="spirit" onclick="toggleInterest(this)"><span class="emo">✨</span>Дух</button><button class="interest-opt'+(hasInterest('journal')?' selected':'')+'" data-i="journal" onclick="toggleInterest(this)"><span class="emo">✍️</span>Дневник</button></div><button class="btn-block primary" onclick="saveUserPlan()">🧠 '+(state.userPlan?'Обновить':'Построить')+'</button></div>';c.innerHTML=h;}

/* ============================================================
   ЦЕЛИ
============================================================ */
function onGoalTemplateChange(){var v=(document.getElementById('gTemplate')||{}).value;if(v&&v!=='none'){for(var i=0;i<GRAND_GOALS_TEMPLATES.length;i++){if(GRAND_GOALS_TEMPLATES[i].id===v){document.getElementById('gTitle').value=GRAND_GOALS_TEMPLATES[i].title;document.getElementById('gGrand').checked=true;var d=new Date();d.setDate(d.getDate()+90);document.getElementById('gDate').value=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');break;}}}else{document.getElementById('gTitle').value='';document.getElementById('gGrand').checked=false;}}
function addCustomGoal(){var title=((document.getElementById('gTitle')||{}).value||'').trim();var date=(document.getElementById('gDate')||{}).value;var isGrand=(document.getElementById('gGrand')||{}).checked;var tid=(document.getElementById('gTemplate')||{}).value;if(!title||!date){showToast('Заполни',true);return;}var ms=[];if(tid&&tid!=='none'){for(var i=0;i<GRAND_GOALS_TEMPLATES.length;i++){if(GRAND_GOALS_TEMPLATES[i].id===tid){for(var j=0;j<GRAND_GOALS_TEMPLATES[i].milestones.length;j++)ms.push({text:GRAND_GOALS_TEMPLATES[i].milestones[j],done:false});break;}}}if(!state.goals)state.goals=[];state.goals.push({title:title,deadline:date,created:dateKey(new Date()),completed:false,isGrand:isGrand,milestones:ms});save();document.getElementById('gTitle').value='';document.getElementById('gDate').value='';document.getElementById('gTemplate').value='none';document.getElementById('gGrand').checked=false;render();showToast('🎯 Цель!');}
function completeGoal(i){if(!state.goals[i])return;if(state.goals[i].completed)return;state.goals[i].completed=true;state.goalsCompleted=(state.goalsCompleted||0)+1;var b=state.goals[i].isGrand?1000:500;addXP(b);showToast('🏆 +'+b+' XP');if(state.sound)achSound();save();render();checkAchievements();}
function deleteGoal(i){if(!confirm('Удалить?'))return;state.goals.splice(i,1);save();render();}
function toggleMilestone(gi,mi){if(!state.goals[gi]||!state.goals[gi].milestones[mi])return;var m=state.goals[gi].milestones[mi];m.done=!m.done;if(m.done){addXP(30);state.milestonesCompleted=(state.milestonesCompleted||0)+1;showToast('✅ +30 XP');}else{state.xp=Math.max(0,state.xp-30);}save();render();checkAchievements();}
function renderGoals(){var c=document.getElementById('goalsContainer');if(!c)return;var h='';if(state.goals&&state.goals.length){for(var i=0;i<state.goals.length;i++){var g=state.goals[i];var gD=new Date(g.deadline);var days=Math.ceil((gD-new Date())/86400000);if(days<0)days=0;var totM=g.milestones?g.milestones.length:0,doneM=0;if(g.milestones)for(var m=0;m<g.milestones.length;m++)if(g.milestones[m].done)doneM++;var prog=totM>0?doneM/totM*100:(g.completed?100:0);var cls='goal-card'+(g.completed?'':(g.isGrand?' grand active':' active'));h+='<div class="'+cls+'"><div class="goal-head"><div><div class="goal-title">'+(g.isGrand?'👑 ':'')+escapeHtml(g.title)+'</div><div class="goal-deadline">'+gD.toLocaleDateString('ru-RU')+'</div></div><div><div class="goal-days">'+(g.completed?'✓':days)+'</div><div class="goal-days-label">'+(g.completed?'Готово':'дней')+'</div></div></div><div class="goal-progress-bar"><div class="goal-progress-fill" style="width:'+prog+'%"></div></div><div class="goal-progress-text"><span>'+(totM>0?doneM+' / '+totM:'Прогресс')+'</span><span>'+Math.round(prog)+'%</span></div>';if(g.milestones&&g.milestones.length){h+='<div class="milestone-list">';for(var mi=0;mi<g.milestones.length;mi++){var ms=g.milestones[mi];h+='<button class="milestone '+(ms.done?'done':'')+'" onclick="toggleMilestone('+i+','+mi+')"><span class="milestone-icon">'+(ms.done?'✓':'')+'</span><span>'+escapeHtml(ms.text)+'</span></button>';}h+='</div>';}h+='<div class="goal-actions">'+(g.completed?'<button class="mini-btn green" disabled>✅ Готово</button>':'<button class="mini-btn green" onclick="completeGoal('+i+')">🏆</button>')+'<button class="mini-btn danger" onclick="deleteGoal('+i+')">✖</button></div></div>';}}else h='<div class="empty-state"><div class="empty-state-icon">🎯</div>Нет целей</div>';c.innerHTML=h;var f=document.getElementById('goalForm');if(!f)return;var fh='<div class="plan-section"><div class="plan-label">📋 Шаблон</div><select class="plan-input" id="gTemplate" onchange="onGoalTemplateChange()"><option value="none">— Своя —</option>';for(var t=0;t<GRAND_GOALS_TEMPLATES.length;t++)fh+='<option value="'+GRAND_GOALS_TEMPLATES[t].id+'">'+GRAND_GOALS_TEMPLATES[t].icon+' '+GRAND_GOALS_TEMPLATES[t].title+'</option>';fh+='</select><div class="plan-label">📝 Название</div><input class="plan-input" id="gTitle" placeholder="..." maxlength="60"><div class="plan-label">📅 Срок</div><input class="plan-input" type="date" id="gDate"><label style="display:flex;align-items:center;gap:10px;margin-top:14px;font-size:13px;color:var(--text-dim);font-weight:600;cursor:pointer"><input type="checkbox" id="gGrand" style="width:20px;height:20px;accent-color:#8b7cff">👑 Грандиозная (+1000 XP)</label><button class="btn-block primary" style="margin-top:16px" onclick="addCustomGoal()">🎯 Создать</button></div>';f.innerHTML=fh;}

/* ============================================================
   ДНК ПРИВЫЧЕК / ПРОГРЕСС / АНАЛИТИКА
============================================================ */
function renderDNA(){var w=document.getElementById('dnaWrap');if(!w)return;var cells='';var t=dateKey(new Date());var totalXp=0,activeDays=0,maxXpDay=0;for(var i=89;i>=0;i--){var d=new Date(Date.now()-i*86400000);var k=dateKey(d);var xp=state.history[k]||0;totalXp+=xp;if(xp>0)activeDays++;if(xp>maxXpDay)maxXpDay=xp;var lvl=0;if(xp>=150)lvl=5;else if(xp>=100)lvl=4;else if(xp>=60)lvl=3;else if(xp>=30)lvl=2;else if(xp>0)lvl=1;var cls='dna-cell'+(lvl>0?' level-'+lvl:'')+(k===t?' today':'');cells+='<div class="'+cls+'" onclick="showDayDetail(\''+k+'\')" title="'+k+'"></div>';}var avg=Math.round(totalXp/90);var h='<div class="dna-title">90 дней</div><div class="dna-grid">'+cells+'</div>';h+='<div class="dna-legend"><div class="dna-legend-item"><div class="dna-legend-dot" style="background:rgba(79,172,254,0.35)"></div>1-29</div><div class="dna-legend-item"><div class="dna-legend-dot" style="background:rgba(79,172,254,0.7)"></div>30-59</div><div class="dna-legend-item"><div class="dna-legend-dot" style="background:linear-gradient(135deg,#8b7cff,#a855f7)"></div>60-99</div><div class="dna-legend-item"><div class="dna-legend-dot" style="background:linear-gradient(135deg,#f093fb,#f5576c)"></div>100-149</div><div class="dna-legend-item"><div class="dna-legend-dot" style="background:linear-gradient(135deg,#ffd166,#f5576c)"></div>150+</div></div>';h+='<div class="dna-summary"><div class="dna-summary-stat"><div class="dna-summary-value">'+activeDays+'</div><div class="dna-summary-label">Активных</div></div><div class="dna-summary-stat"><div class="dna-summary-value">'+avg+'</div><div class="dna-summary-label">Сред. XP</div></div><div class="dna-summary-stat"><div class="dna-summary-value">'+maxXpDay+'</div><div class="dna-summary-label">Лучший</div></div></div>';w.innerHTML=h;}
function renderProgress(){
  var ch=document.getElementById('chart');
  if(ch){var days=[];for(var i=13;i>=0;i--){var d=new Date(Date.now()-i*86400000);days.push({key:dateKey(d),label:d.getDate()});}var maxX=50;for(var j=0;j<days.length;j++){var v=state.history[days[j].key]||0;if(v>maxX)maxX=v;}var html='';for(var k=0;k<days.length;k++){var val=state.history[days[k].key]||0;var hh=(val/maxX)*100;html+='<div class="bar-wrap"><div class="bar" style="height:'+hh+'%"></div><div class="bar-label">'+days[k].label+'</div></div>';}ch.innerHTML=html;}
  var cal=document.getElementById('calendar');
  if(cal){var now=new Date();var y=now.getFullYear(),m=now.getMonth();var fd=new Date(y,m,1);var dim=new Date(y,m+1,0).getDate();var off=(fd.getDay()+6)%7;var cH='';for(var o=0;o<off;o++)cH+='<div class="cal-day empty"></div>';for(var dd=1;dd<=dim;dd++){var key=y+'-'+String(m+1).padStart(2,'0')+'-'+String(dd).padStart(2,'0');var has=(state.history[key]||0)>0;var isT=key===dateKey(new Date());cH+='<div class="cal-day '+(has?'has':'')+' '+(isT?'today':'')+'">'+dd+'</div>';}cal.innerHTML=cH;}
  var el;
  el=document.getElementById('detailXp');if(el)el.textContent=state.xp;
  el=document.getElementById('detailXpEarned');if(el)el.textContent=state.xpEarned||0;
  el=document.getElementById('detailStreak');if(el)el.textContent=state.maxStreak;
  el=document.getElementById('detailDone');if(el)el.textContent=state.totalDone;
  el=document.getElementById('detailAch');if(el)el.textContent=state.achievements.length+' / '+ACHIEVEMENTS.length;
  el=document.getElementById('detailCards');if(el)el.textContent=(state.collection||[]).length+' / '+COLLECTION_CARDS.length;
  el=document.getElementById('detailBosses');if(el)el.textContent=(state.bossesDefeated||0);
  el=document.getElementById('detailPets');if(el)el.textContent=(state.pets.owned.length||0)+' / '+PETS.length;
}
function renderAnalytics(){
  var c=document.getElementById('analyticsContainer');if(!c)return;
  var h='';
  h+='<div class="section-title">🧠 Корреляции</div>';
  h+=renderCorrelations();
  var moodKeys=Object.keys(state.moods||{}).sort();
  if(moodKeys.length>=5){
    h+='<div class="section-title">😊 Настроение</div>';
    var good=0,bad=0;
    for(var i=0;i<moodKeys.length;i++){var m=state.moods[moodKeys[i]];if(m==='🔥'||m==='😊'||m==='💪'||m==='😌')good++;else if(m==='😔'||m==='😰'||m==='😤')bad++;}
    if(good>bad)h+='<div class="insight-card"><div class="insight-icon">📈</div><div class="insight-text">Хороших: <b>'+good+'</b> из '+moodKeys.length+'</div></div>';
    else if(bad>good)h+='<div class="insight-card"><div class="insight-icon">🌧</div><div class="insight-text">Сложных больше. Обрати внимание на сон.</div></div>';
    else h+='<div class="insight-card"><div class="insight-icon">⚖️</div><div class="insight-text">Баланс.</div></div>';
  }
  var cats=state.categoryStats||{};var total2=0;for(var k in cats)if(cats.hasOwnProperty(k))total2+=cats[k];
  if(total2>0){
    h+='<div class="section-title">📚 По категориям</div>';
    var names={disc:'⚔️ Дисциплина',breath:'🌬️ Дыхание',body:'💪 Тело',mind:'🧠 Разум',spirit:'✨ Дух',health:'💚 Здоровье'};
    for(var cat in names){if(!cats.hasOwnProperty(cat))continue;var pct=(cats[cat]/total2*100).toFixed(0);h+='<div class="cat-stat"><div class="cat-stat-name">'+names[cat]+'</div><div class="cat-stat-bar"><div class="cat-stat-fill" style="width:'+pct+'%"></div></div><div class="cat-stat-value">'+cats[cat]+' ('+pct+'%)</div></div>';}
  }
  c.innerHTML=h;
}
function renderCorrelations(){
  var h='';
  if(!state.bodyLog||state.bodyLog.length<7){
    h+='<div class="info-text">📊 Заполняй дневники 7+ дней — покажу корреляции.</div>';
    return h;
  }
  var moodKeys=Object.keys(state.moods||{});
  /* Сон vs настроение */
  var goodSleep=0,badSleep=0,goodCount=0,badCount=0;
  for(var j=0;j<moodKeys.length;j++){
    var sc=getMoodScore(state.moods[moodKeys[j]]);
    if((state.profile.sleepHours||8)>=7){goodSleep+=sc;goodCount++;}else{badSleep+=sc;badCount++;}
  }
  if(goodCount>0&&badCount>0){
    var avgG=goodSleep/goodCount,avgB=badSleep/badCount;
    if(avgG>avgB+0.5)h+='<div class="insight-card"><div class="insight-icon">💤</div><div class="insight-text">При сне 7+ч настроение выше на <b>'+(avgG-avgB).toFixed(1)+'</b></div></div>';
  }
  /* Вес */
  if(state.bodyLog.length>=7){
    var first=state.bodyLog[0].weight;var last=state.bodyLog[state.bodyLog.length-1].weight;
    var diff=(last-first).toFixed(1);
    if(Math.abs(diff)>0.5){
      if(diff<0&&state.profile.goal==='lose')h+='<div class="insight-card"><div class="insight-icon">📉</div><div class="insight-text">Вес снижается: <b>'+diff+' кг</b>. Отличный темп!</div></div>';
      else if(diff>0&&state.profile.goal==='gain')h+='<div class="insight-card"><div class="insight-icon">📈</div><div class="insight-text">Вес растёт: <b>+'+diff+' кг</b>. Хорошо!</div></div>';
    }
    var target=state.profile.targetWeight||last;
    var toTarget=(last-target).toFixed(1);
    if(Math.abs(toTarget)>0.5)h+='<div class="insight-card"><div class="insight-icon">🎯</div><div class="insight-text">До цели: <b>'+toTarget+' кг</b></div></div>';
  }
  var foodDays=0;
  if(state.foodLog){var dates={};for(var f=0;f<state.foodLog.length;f++){dates[state.foodLog[f].date]=true;}foodDays=Object.keys(dates).length;}
  if(foodDays>=7)h+='<div class="insight-card"><div class="insight-icon">🍎</div><div class="insight-text">Ведёшь дневник еды <b>'+foodDays+' дней</b>.</div></div>';
  if(!h)h='<div class="info-text">📊 Пока данных мало.</div>';
  return h;
}

/* ============================================================
   НАСТРОЙКИ — ТЕМЫ, ФРАКТАЛЫ, ЗВУКИ
============================================================ */
function renderSettings(){
  var tp=document.getElementById('themePicker');
  if(tp){
    var themes=[{id:'dark',n:'Тёмная',c1:'#05040f',c2:'#8b7cff'},{id:'light',n:'Светлая',c1:'#f8f5ff',c2:'#8b7cff'},{id:'cosmic',n:'Космос',c1:'#0a0514',c2:'#ff6ec7'},{id:'zen',n:'Дзен',c1:'#0a1a14',c2:'#4ade80'},{id:'neon',n:'Неон',c1:'#0a0014',c2:'#00ffff'},{id:'sakura',n:'Сакура',c1:'#1a0a14',c2:'#ffb3d9'},{id:'aurora',n:'Сияние',c1:'#051015',c2:'#00ffaa'},{id:'cosmic2',n:'Космос+',c1:'#000',c2:'#a855f7'}];
    var th='';
    for(var i=0;i<themes.length;i++){
      var t=themes[i];var sel=state.theme===t.id;
      th+='<div style="aspect-ratio:1;border-radius:16px;cursor:pointer;border:2px solid '+(sel?'#8b7cff':'transparent')+';background:linear-gradient(135deg, '+t.c1+', '+t.c2+');display:flex;align-items:flex-end;justify-content:center;padding:6px;font-size:10px;font-weight:800;color:#fff;text-shadow:0 1px 6px rgba(0,0,0,0.7);'+(sel?'box-shadow:0 0 24px rgba(139,124,255,0.55)':'')+'" onclick="setTheme(\''+t.id+'\')">'+t.n+'</div>';
    }
    tp.innerHTML=th;
  }
  var fp=document.getElementById('fractalPicker');
  if(fp){
    var st=[{id:'mixed',n:'Микс'},{id:'koch',n:'Снежинки'},{id:'sierpinski',n:'Треуг.'},{id:'pentagon',n:'Пятиуг.'},{id:'star',n:'Звёзды'},{id:'hex',n:'Шестиуг.'},{id:'none',n:'Выкл'}];
    var sh='';
    for(var j=0;j<st.length;j++){
      var s=st[j];var sel2=state.fractalStyle===s.id;
      sh+='<div style="text-align:center;font-size:11px;font-weight:800;padding:12px 4px;cursor:pointer;border-radius:14px;border:2px solid '+(sel2?'#8b7cff':'var(--glass-border)')+';background:'+(sel2?'rgba(139,124,255,0.22)':'var(--glass)')+';color:var(--text)" onclick="setFractalStyle(\''+s.id+'\')">'+s.n+'</div>';
    }
    fp.innerHTML=sh;
  }
  var swS=document.getElementById('switchSound');if(swS)swS.classList.toggle('on',state.sound);
  var swN=document.getElementById('switchNotify');if(swN)swN.classList.toggle('on',state.notify);
  var swSeason=document.getElementById('switchSeasonal');if(swSeason)swSeason.classList.toggle('on',state.seasonalTheme);
  renderCustomAffirmationsList();
}
function renderCustomAffirmationsList(){
  var c=document.getElementById('customAffirmationsList');if(!c)return;
  if(!state.customAffirmations||!state.customAffirmations.length){c.innerHTML='';return;}
  var h='';
  for(var i=0;i<state.customAffirmations.length;i++){
    h+='<div class="setting"><span class="setting-label" style="font-size:12.5px">💭 '+escapeHtml(state.customAffirmations[i])+'</span><button class="mini-btn danger" style="flex:0;padding:6px 12px" onclick="removeCustomAffirmation('+i+')">✖</button></div>';
  }
  c.innerHTML=h;
}
function addCustomAffirmation(){
  var el=document.getElementById('newAffirmation');if(!el)return;
  var v=el.value.trim();if(!v){showToast('Введи текст',true);return;}
  if(!state.customAffirmations)state.customAffirmations=[];
  state.customAffirmations.push(v);
  save();el.value='';render();showToast('💭 Добавлено');
}
function removeCustomAffirmation(i){state.customAffirmations.splice(i,1);save();render();}
function renderSoundPicker(){var c=document.getElementById('soundPicker');if(!c)return;var h='';for(var i=0;i<AMBIENT_SOUNDS.length;i++){var s=AMBIENT_SOUNDS[i];var sel=state.soundAmbient===s.id||(!state.soundAmbient&&s.id==='none');var cls='sound-opt '+(sel?'selected':'');if(state.soundAmbient===s.id)cls+=' playing';h+='<button class="'+cls+'" onclick="toggleAmbient(\''+s.id+'\')"><span class="emoji">'+s.icon+'</span>'+s.name+'</button>';}c.innerHTML=h;}
function renderFrequencyPicker(){var c=document.getElementById('frequencyPicker');if(!c)return;var h='';for(var i=0;i<FREQUENCIES.length;i++){var f=FREQUENCIES[i];var sel=state.soundFrequency===f.hz;var cls='sound-opt '+(sel?'selected':'');if(sel)cls+=' playing';h+='<button class="'+cls+'" onclick="playFrequency('+f.hz+')"><span class="emoji">'+f.icon+'</span>'+f.name+'<br><span style="font-size:9px;opacity:0.7">'+f.desc+'</span></button>';}c.innerHTML=h;}
function setTheme(t){state.theme=t;save();render();}
function setFractalStyle(s){state.fractalStyle=s;fractalStyle=s;if(s==='none'&&ctx)ctx.clearRect(0,0,W,H);save();render();}
function toggleSound(){state.sound=!state.sound;save();render();}
function toggleNotify(){state.notify=!state.notify;if(state.notify&&'Notification' in window)Notification.requestPermission();save();render();}
function addCustomPractice(){var n=document.getElementById('newName'),c=document.getElementById('newCat');if(!n||!c)return;var v=n.value.trim(),cat=c.value;if(!v){showToast('Введи',true);return;}var icons={disc:'⚔️',breath:'🌬️',body:'💪',mind:'🧠',spirit:'✨',health:'💚'};var bx=15;if(!state.customPractices)state.customPractices=[];state.customPractices.push({id:'custom_'+Date.now(),cat:cat,icon:icons[cat],name:v,custom:true,timer:300,tiers:[{name:'Начальный',xp:bx,lvl:0,timer:300},{name:'Уверенный',xp:bx*2,lvl:1,timer:600},{name:'Продвинутый',xp:bx*3,lvl:2,timer:1200},{name:'Мастерский',xp:bx*5,lvl:4,timer:1800},{name:'Легендарный',xp:bx*8,lvl:6,timer:3600}]});save();n.value='';render();showToast('Добавлено ✨');}
function removeCustom(id){if(!confirm('Удалить?'))return;state.customPractices=state.customPractices.filter(function(p){return p.id!==id;});save();render();}
function renderCustomList(){var c=document.getElementById('customList');if(!c)return;if(!state.customPractices||!state.customPractices.length){c.innerHTML='';return;}var h='';for(var i=0;i<state.customPractices.length;i++){var p=state.customPractices[i];h+='<div class="setting"><span class="setting-label">'+p.icon+' '+p.name+'</span><button class="mini-btn danger" style="flex:0;padding:6px 12px" onclick="removeCustom(\''+p.id+'\')">✖</button></div>';}c.innerHTML=h;}
function exportData(){var data=JSON.stringify(state,null,2);var blob=new Blob([data],{type:'application/json'});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='put-'+dateKey(new Date())+'.json';a.click();URL.revokeObjectURL(url);}
function importData(e){var f=e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(ev){try{var d=JSON.parse(ev.target.result);if(!confirm('Заменить?'))return;state=Object.assign({},DEFAULT_STATE,d);save();location.reload();}catch(err){showToast('Ошибка',true);}};r.readAsText(f);}
function resetAll(){if(!confirm('Сбросить?'))return;localStorage.removeItem(STORAGE);location.reload();}

/* ============================================================
   АВАТАР
============================================================ */
var AVATARS=['🧘','🥷','🧙','⚔️','🐉','🦅','🐺','🦁','🔥','⚡','🌟','🌙','☯️','🌊','🏔','🛡','🦉','👑','💎','🎭','🗿','🕊','🐯','🌋','🐲','🦄','🦊','🐻','🐼','⚜️','🔮','👁️','✨','🕉️','☀️'];
function openAvatarPicker(){var p=document.getElementById('avatarPicker');if(!p)return;var h='';for(var i=0;i<AVATARS.length;i++){var a=AVATARS[i];h+='<div class="av-option '+(a===state.avatar?'selected':'')+'" onclick="setAvatar(\''+a+'\')">'+a+'</div>';}p.innerHTML=h;document.getElementById('avatarModal').classList.add('active');}
function setAvatar(a){state.avatar=a;save();render();closeModal('avatarModal');}
function openProfile(){switchCategory('more');setTimeout(function(){showPage('profile');},100);}

/* ============================================================
   ПРОФИЛЬ — UI
============================================================ */
var _editGender='male',_editGoal='maintain',_editActivity='moderate';
function openProfileEdit(){
  var p=state.profile;
  _editGender=p.gender||'male';_editGoal=p.goal||'maintain';_editActivity=p.activity||'moderate';
  document.getElementById('pfName').value=p.name||'';
  document.getElementById('pfBirth').value=p.birthDate||'';
  document.getElementById('pfHeight').value=p.height||'';
  document.getElementById('pfWeight').value=p.weight||'';
  document.getElementById('pfTargetWeight').value=p.targetWeight||'';
  document.getElementById('pfSleep').value=p.sleepHours||8;
  document.getElementById('pfWater').value=p.waterGoal||2000;
  pickGender(_editGender);pickGoal(_editGoal);pickActivity(_editActivity);
  document.getElementById('profileEditModal').classList.add('active');
}
function pickGender(g){_editGender=g;document.querySelectorAll('.gender-tab').forEach(function(b){b.classList.toggle('selected',b.dataset.gender===g);});}
function pickGoal(g){_editGoal=g;document.querySelectorAll('.goal-tab').forEach(function(b){b.classList.toggle('selected',b.dataset.goal===g);});}
function pickActivity(a){_editActivity=a;document.querySelectorAll('.activity-opt').forEach(function(b){b.classList.toggle('selected',b.dataset.activity===a);});}
function saveProfile(){
  var name=(document.getElementById('pfName').value||'').trim();
  var birth=document.getElementById('pfBirth').value;
  var height=parseFloat(document.getElementById('pfHeight').value)||0;
  var weight=parseFloat(document.getElementById('pfWeight').value)||0;
  var targetWeight=parseFloat(document.getElementById('pfTargetWeight').value)||0;
  var sleep=parseInt(document.getElementById('pfSleep').value)||8;
  var water=parseInt(document.getElementById('pfWater').value)||2000;
  if(!name){showToast('Введи имя',true);return;}
  if(!birth){showToast('Введи дату рождения',true);return;}
  if(height<100||height>250){showToast('Проверь рост',true);return;}
  if(weight<30||weight>300){showToast('Проверь вес',true);return;}
  var p=state.profile;
  p.name=name;p.birthDate=birth;p.gender=_editGender;
  p.height=height;p.weight=weight;p.targetWeight=targetWeight||weight;
  p.goal=_editGoal;p.activity=_editActivity;
  p.sleepHours=sleep;p.waterGoal=water;
  p.onboardingComplete=true;
  grantStarterPet();
  save();closeModal('profileEditModal');render();
  showToast('✅ Профиль сохранён!');
  if(state.sound)achSound();
  checkAchievements();checkNewCards();
}

/* ============================================================
   ПРИЁМЫ ПИЩИ
============================================================ */
var _mealCount=4;
function openProfileMeals(){_mealCount=state.profile.mealsPerDay||4;pickMealCount(_mealCount);document.getElementById('profileMealsModal').classList.add('active');}
function pickMealCount(n){_mealCount=n;document.querySelectorAll('.meal-count-tabs button').forEach(function(b){b.classList.toggle('selected',parseInt(b.dataset.count)===n);});renderMealScheduleEditor();}
function renderMealScheduleEditor(){
  var c=document.getElementById('mealScheduleEditor');if(!c)return;
  var defaultNames=['Завтрак','Второй завтрак','Обед','Перекус','Полдник','Ужин'];
  var schedule=state.profile.mealSchedule||[];
  var h='';
  for(var i=0;i<_mealCount;i++){
    var item=schedule[i]||{name:defaultNames[i]||('Приём '+(i+1)),time:defaultTimeForIndex(i,_mealCount),enabled:true};
    h+='<div class="meal-schedule-row"><input type="text" id="mealName'+i+'" value="'+escapeHtml(item.name)+'" maxlength="20"><input type="time" id="mealTime'+i+'" value="'+(item.time||'12:00')+'"></div>';
  }
  c.innerHTML=h;
}
function defaultTimeForIndex(i,total){var startH=8,endH=20;var step=(endH-startH)/(total>1?total-1:1);var hour=Math.round(startH+i*step);return String(hour).padStart(2,'0')+':00';}
function saveMealSchedule(){
  var schedule=[];var defaultNames=['Завтрак','Второй завтрак','Обед','Перекус','Полдник','Ужин'];
  for(var i=0;i<_mealCount;i++){
    var nameEl=document.getElementById('mealName'+i);
    var timeEl=document.getElementById('mealTime'+i);
    schedule.push({name:(nameEl&&nameEl.value.trim())||defaultNames[i]||('Приём '+(i+1)),time:(timeEl&&timeEl.value)||'12:00',enabled:true});
  }
  state.profile.mealsPerDay=_mealCount;state.profile.mealSchedule=schedule;
  state.profile.mealTimes={breakfast:(schedule[0]&&schedule[0].time)||'08:00',lunch:(schedule[Math.floor(_mealCount/2)]&&schedule[Math.floor(_mealCount/2)].time)||'13:00',dinner:(schedule[_mealCount-1]&&schedule[_mealCount-1].time)||'19:00',snack:(schedule[1]&&schedule[1].time)||'16:00'};
  save();closeModal('profileMealsModal');render();showToast('🍽 Сохранено');
}

/* ============================================================
   ТАЙМЕРЫ / ГОЛОС
============================================================ */
var activeTimer=null,timerMode='';
function openTimer(mode){closeTimer();timerMode=mode;var t={stopwatch:'⏱ Секундомер',pomodoro:'🍅 Pomodoro',custom:'⏰ Отсчёт'};document.getElementById('timerTitle').textContent=t[mode]||'Таймер';document.getElementById('timerDisplay').textContent='00:00';document.getElementById('timerHint').textContent='';document.getElementById('timerBtn').textContent='Начать';document.getElementById('timerBtn').onclick=toggleTimer;document.getElementById('timerModal').classList.add('active');}
function closeTimer(){if(activeTimer){clearInterval(activeTimer);activeTimer=null;}closeModal('timerModal');}
function toggleTimer(){var b=document.getElementById('timerBtn'),d=document.getElementById('timerDisplay'),h=document.getElementById('timerHint');if(activeTimer){clearInterval(activeTimer);activeTimer=null;b.textContent='Продолжить';return;}b.textContent='Пауза';var start=Date.now();var init=0;if(timerMode==='stopwatch'){var p=d.textContent.split(':');init=(parseInt(p[0])*60+parseInt(p[1]))*1000;}else{var p2=d.textContent.split(':');var cur=(parseInt(p2[0])*60+parseInt(p2[1]))*1000;if(cur===0)init=timerMode==='pomodoro'?25*60*1000:5*60*1000;else init=cur;}var last='';activeTimer=setInterval(function(){var el=Date.now()-start;var rem;if(timerMode==='stopwatch')rem=init+el;else rem=init-el;if(rem<=0){clearInterval(activeTimer);activeTimer=null;b.textContent='Начать';h.textContent='⏰ Время вышло!';if(state.sound)achSound();if(navigator.vibrate)navigator.vibrate([200,100,200]);return;}var s=Math.floor(rem/1000),m=Math.floor(s/60);s=s%60;var txt=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');if(txt!==last){d.textContent=txt;last=txt;}},100);}
var voiceCancelled=false,voiceTimeout=null;
var MEDITATION_SCRIPTS={relax:{title:'Расслабление',lines:['Закрой глаза.','Сделай глубокий вдох.','Медленно выдохни.','Позволь мыслям проходить мимо.','Ты не мысли. Ты — наблюдатель.','Расслабь плечи.','Расслабь челюсть.','Побудь в тишине.','Просто дыши.','Ты в безопасности.']},focus:{title:'Фокус',lines:['Сядь ровно.','Три глубоких вдоха.','Выбери точку внимания.','Это может быть дыхание.','Мысли приходят — заметь.','Мягко вернись.','Ты тренируешь ум.','Ты здесь.','Сейчас.']},gratitude:{title:'Благодарность',lines:['Закрой глаза и дыши.','Подумай о том, что есть.','Тёплый дом. Вода. Еда.','Кто-то думает о тебе.','Ты жив. Ты дышишь.','Пожелай себе счастья.','Пожелай близким.','Пожелай всем существам.']}};
function startVoiceMeditation(type){if(!('speechSynthesis' in window)){showToast('Голос недоступен',true);return;}stopVoiceMeditation();voiceCancelled=false;var s=MEDITATION_SCRIPTS[type];if(!s)return;document.getElementById('voiceTitle').textContent=s.title;document.getElementById('voiceText').textContent='Приготовься...';document.getElementById('voiceModal').classList.add('active');document.getElementById('stopVoiceBtn').classList.add('show');var i=0;function next(){if(voiceCancelled)return;if(i>=s.lines.length){document.getElementById('voiceText').textContent='🧘 Завершено';state.voiceMeditations=(state.voiceMeditations||0)+1;addXP(40);save();checkAchievements();render();showToast('🧘 +40 XP');setTimeout(stopVoiceMeditation,1500);return;}document.getElementById('voiceText').textContent=s.lines[i];var u=new SpeechSynthesisUtterance(s.lines[i]);u.lang='ru-RU';u.rate=0.85;u.pitch=0.95;u.volume=0.9;u.onend=function(){if(voiceCancelled)return;i++;voiceTimeout=setTimeout(next,2500);};speechSynthesis.speak(u);}next();}
function stopVoiceMeditation(){voiceCancelled=true;if(voiceTimeout){clearTimeout(voiceTimeout);voiceTimeout=null;}if('speechSynthesis' in window){try{speechSynthesis.cancel();}catch(e){}}var btn=document.getElementById('stopVoiceBtn');if(btn)btn.classList.remove('show');closeModal('voiceModal');}

/* ============================================================
   КАТЕГОРИИ И SUB-TABS
============================================================ */
var CATEGORY_TABS={
game:[{id:'card',icon:'🎴',name:'Карта'},{id:'wheel',icon:'🎡',name:'Колесо'},{id:'cards',icon:'🃏',name:'Коллекция'},{id:'heatmap',icon:'🔥',name:'Год'},{id:'forecast',icon:'📈',name:'Прогноз'},{id:'dailypath',icon:'🗺️',name:'Путь'},{id:'boss',icon:'⚔️',name:'Босс'},{id:'pet',icon:'🐉',name:'Питомец'},{id:'petshop',icon:'🏪',name:'Магазин'},{id:'chest',icon:'🎁',name:'Сундук'},{id:'domain',icon:'🏰',name:'Домен'},{id:'weekly',icon:'🎁',name:'Неделя'},{id:'awards',icon:'🏆',name:'Награды'}],
develop:[{id:'practices',icon:'📋',name:'Практики'},{id:'quests',icon:'⚔️',name:'Квесты'},{id:'courses',icon:'🎓',name:'Курсы'},{id:'askesis',icon:'🔥',name:'Аскезы'},{id:'barriers',icon:'🚧',name:'Преграды'},{id:'path',icon:'🌌',name:'Путь'}],
track:[{id:'habits',icon:'📅',name:'Привычки'},{id:'mood',icon:'😊',name:'Настроение'},{id:'body',icon:'💪',name:'Тело'},{id:'finance',icon:'💰',name:'Финансы'},{id:'plan',icon:'🧠',name:'План'},{id:'goals',icon:'🎯',name:'Цели'}],
know:[{id:'books',icon:'📖',name:'Библиотека'},{id:'knowledge',icon:'🧠',name:'База'},{id:'health',icon:'💚',name:'Здоровье'}],
more:[{id:'profile',icon:'👤',name:'Профиль'},{id:'reflection',icon:'💭',name:'Рефлексия'},{id:'wins',icon:'🏆',name:'Победы'},{id:'balance',icon:'⚖️',name:'Баланс'},{id:'insights',icon:'💡',name:'Инсайты'},{id:'analytics',icon:'📊',name:'Аналитика'},{id:'dna',icon:'🧬',name:'ДНК'},{id:'progress',icon:'📈',name:'Прогресс'},{id:'settings',icon:'⚙️',name:'Настройки'}]
};
var selectedCategory='game';
function switchCategory(cat){
  selectedCategory=cat;
  document.querySelectorAll('.main-menu-btn').forEach(function(b){b.classList.toggle('active',b.dataset.cat===cat);});
  document.querySelectorAll('.category-pages').forEach(function(p){p.classList.remove('active');});
  var el=document.getElementById('cat-'+cat);
  if(el)el.classList.add('active');
  renderSubTabs();
  window.scrollTo({top:0,behavior:'smooth'});
}
function renderSubTabs(){
  var bar=document.getElementById('subTabs');if(!bar)return;
  var tabs=CATEGORY_TABS[selectedCategory]||[];
  var h='';
  for(var i=0;i<tabs.length;i++){
    var t=tabs[i];
    h+='<div class="sub-tab'+(i===0?' active':'')+'" data-page="'+t.id+'" onclick="showPage(\''+t.id+'\')">'+t.icon+' '+t.name+'</div>';
  }
  bar.innerHTML=h;
  var first=tabs[0];if(first)showPage(first.id);
}
function showPage(id){
  document.querySelectorAll('.sub-tab').forEach(function(t){t.classList.toggle('active',t.dataset.page===id);});
  document.querySelectorAll('#cat-'+selectedCategory+' .page').forEach(function(p){p.classList.remove('active');});
  var el=document.getElementById('page-'+id);
  if(el)el.classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
}

/* ============================================================
   ГЛАВНЫЙ РЕНДЕР
============================================================ */
function render(){
  try{ensureNewDay();generateDailyCard();checkQuests();checkDailyCard();checkMissedDayPenalty();checkNewCards();}catch(e){console.error('ensure',e);}
  var lvlIdx=getLevel(state.xpEarned||state.xp),cur=LEVELS[lvlIdx],next=LEVELS[lvlIdx+1];
  var earned=state.xpEarned||0;
  var el;
  el=document.getElementById('levelBadge');if(el)el.textContent='Ур. '+(lvlIdx+1)+' · '+cur.name;
  el=document.getElementById('rankTitle');if(el)el.textContent=RANK_TITLES[lvlIdx]||'Мастер';
  el=document.getElementById('avatar');if(el)el.textContent=state.avatar;
  el=document.getElementById('statRank');if(el)el.textContent=cur.rank;
  if(next){var prog=(earned-cur.xp)/(next.xp-cur.xp)*100;el=document.getElementById('xpFill');if(el)el.style.width=prog+'%';el=document.getElementById('xpText');if(el)el.textContent='💰 '+state.xp+' XP · 🏆 '+earned+' / '+next.xp+' · ×'+getMultiplier(earned).toFixed(2);}
  else{el=document.getElementById('xpFill');if(el)el.style.width='100%';el=document.getElementById('xpText');if(el)el.textContent='💰 '+state.xp+' XP · 🏆 '+earned+' — МАКС';}
  el=document.getElementById('statStreak');if(el)el.textContent=state.streak;
  el=document.getElementById('statToday');if(el)el.textContent=state.todayDone.length;
  el=document.getElementById('statTotal');if(el)el.textContent=state.totalDays;
  try{renderPenalty();}catch(e){}
  try{renderCard();}catch(e){console.error('card',e);}
  try{renderAffirmation();}catch(e){}
  try{renderMantra();}catch(e){}
  try{renderQuote();}catch(e){}
  try{renderWheel();}catch(e){console.error('wheel',e);}
  try{renderCollection();}catch(e){console.error('collection',e);}
  try{renderHeatmap();}catch(e){console.error('heatmap',e);}
  try{renderForecast();}catch(e){console.error('forecast',e);}
  try{renderDailyPath();}catch(e){}
  try{renderBoss();}catch(e){}
  try{renderPet();}catch(e){}
  try{renderPetShop();}catch(e){}
  try{renderChest();}catch(e){}
  try{renderDomain();}catch(e){}
  try{renderWeekly();}catch(e){}
  try{renderAwards();}catch(e){}
  try{renderCourses();}catch(e){}
  try{renderBooks();}catch(e){}
  try{renderPlan();}catch(e){}
  try{renderGoals();}catch(e){}
  try{renderHabits();}catch(e){}
  try{renderMood();}catch(e){}
  try{renderMoodAnalytics();}catch(e){}
  try{renderBody();}catch(e){}
  try{renderWorkouts();}catch(e){}
  try{renderFood();}catch(e){}
  try{renderTips();}catch(e){}
  try{renderFinance();}catch(e){}
  try{renderAnalytics();}catch(e){}
  try{renderDNA();}catch(e){}
  try{renderPath();}catch(e){}
  try{renderPractices();}catch(e){console.error('practices',e);}
  try{renderQuests();}catch(e){console.error('quests',e);}
  try{renderBarriers();}catch(e){}
  try{renderHealth();}catch(e){}
  try{renderAskesis();}catch(e){}
  try{renderKnowledge();}catch(e){}
  try{renderProgress();}catch(e){}
  try{renderCustomList();}catch(e){}
  try{renderSettings();}catch(e){}
  try{renderSoundPicker();}catch(e){}
  try{renderFrequencyPicker();}catch(e){}
  try{renderProfile();}catch(e){console.error('profile',e);}
  try{renderReflection();}catch(e){console.error('reflection',e);}
  try{renderWins();}catch(e){console.error('wins',e);}
  try{renderBalance();}catch(e){console.error('balance',e);}
  try{renderInsights();}catch(e){console.error('insights',e);}
  if(state.theme&&state.theme!=='dark')document.documentElement.setAttribute('data-theme',state.theme);
  else document.documentElement.removeAttribute('data-theme');
  try{applySeasonalTheme();}catch(e){}
}

/* ============================================================
   ЭКСПОРТ В WINDOW
============================================================ */
var EXPORTED={
  switchCategory:switchCategory,showPage:showPage,closeModal:closeModal,
  openAvatarPicker:openAvatarPicker,setAvatar:setAvatar,openProfile:openProfile,
  openProfileEdit:openProfileEdit,saveProfile:saveProfile,
  pickGender:pickGender,pickGoal:pickGoal,pickActivity:pickActivity,
  openProfileMeals:openProfileMeals,pickMealCount:pickMealCount,saveMealSchedule:saveMealSchedule,
  openZodiacDetail:openZodiacDetail,openNumerologyDetail:openNumerologyDetail,
  claimLevelUpReward:claimLevelUpReward,closeCardUnlock:closeCardUnlock,
  acceptDailyCard:acceptDailyCard,
  spinWheel:spinWheel,
  feedPet:feedPet,playWithPet:playWithPet,washPet:washPet,
  openPetNameModal:openPetNameModal,savePetName:savePetName,switchPet:switchPet,buyPet:buyPet,
  openChest:openChest,buyBuilding:buyBuilding,
  pickQuestDifficulty:pickQuestDifficulty,startQuestSetup:startQuestSetup,completeQuest:completeQuest,
  toggleHabitToday:toggleHabitToday,addHabit:addHabit,
  addBodyLog:addBodyLog,removeBodyLog:removeBodyLog,switchBodyTab:switchBodyTab,
  createWorkout:createWorkout,addExercise:addExercise,
  addFood:addFood,removeFood:removeFood,
  openFoodLibrary:openFoodLibrary,pickFoodCat:pickFoodCat,filterFoodLibrary:filterFoodLibrary,
  addFoodFromLibrary:addFoodFromLibrary,openDayConstructor:openDayConstructor,
  saveDayConstructor:saveDayConstructor,removeFromConstructor:removeFromConstructor,
  addFinanceLog:addFinanceLog,removeFinanceLog:removeFinanceLog,saveSalary:saveSalary,
  createSavings:createSavings,removeSavings:removeSavings,addToSavings:addToSavings,
  openStrategyModal:openStrategyModal,selectStrategy:selectStrategy,
  pickRadio:pickRadio,toggleInterest:toggleInterest,saveUserPlan:saveUserPlan,resetPlan:resetPlan,
  onGoalTemplateChange:onGoalTemplateChange,addCustomGoal:addCustomGoal,completeGoal:completeGoal,deleteGoal:deleteGoal,toggleMilestone:toggleMilestone,
  setMood:setMood,openMoodNote:openMoodNote,saveMoodNote:saveMoodNote,showDayDetail:showDayDetail,showMoodMonth:showMoodMonth,
  startAskesis:startAskesis,markAskesisDay:markAskesisDay,failAskesis:failAskesis,
  openBreath:openBreath,closeBreath:closeBreath,startBreath:startBreath,
  confirmPracticeComplete:confirmPracticeComplete,cancelPracticeTimer:cancelPracticeTimer,
  openTimer:openTimer,closeTimer:closeTimer,toggleTimer:toggleTimer,
  startVoiceMeditation:startVoiceMeditation,stopVoiceMeditation:stopVoiceMeditation,
  setTheme:setTheme,setFractalStyle:setFractalStyle,toggleSound:toggleSound,toggleNotify:toggleNotify,toggleSeasonal:toggleSeasonal,
  addCustomPractice:addCustomPractice,removeCustom:removeCustom,
  addCustomAffirmation:addCustomAffirmation,removeCustomAffirmation:removeCustomAffirmation,
  exportData:exportData,importData:importData,resetAll:resetAll,
  handlePracticeClick:handlePracticeClick,changeTier:changeTier,showPracticeInfo:showPracticeInfo,
  toggleHealth:toggleHealth,filterHealth:filterHealth,toggleKb:toggleKb,filterKnowledge:filterKnowledge,
  nextQuote:nextQuote,nextAffirmation:nextAffirmation,nextMantra:nextMantra,
  startCourseModal:startCourseModal,completeCourseDay:completeCourseDay,
  openBook:openBook,markBookRead:markBookRead,claimWeeklyReward:claimWeeklyReward,
  toggleAmbient:toggleAmbient,playFrequency:playFrequency,stopFrequency:stopFrequency,
  toggleBarrierSubtask:toggleBarrierSubtask,
  addWin:addWin,saveReflection:saveReflection,
  openBalanceEdit:openBalanceEdit,saveBalance:saveBalance,updateBalanceValue:updateBalanceValue
};
for(var k in EXPORTED){if(EXPORTED.hasOwnProperty(k))window[k]=EXPORTED[k];}

/* ============================================================
   INIT
============================================================ */
function init(){
  try{
    initFractals();
    applySeasonalTheme();
    renderSubTabs();
    render();
    var app=document.getElementById('appRoot');
    if(app)app.style.display='block';
    var ld=document.getElementById('loading');
    if(ld)ld.classList.add('hidden');
    setInterval(function(){updateQuestTimer();},1000);
  }catch(err){
    var l=document.getElementById('loading');
    if(l)l.innerHTML='<div class="err">⚠️ Ошибка:<br>'+(err.message||'Unknown')+'\n\n'+((err.stack||'').slice(0,600))+'</div>';
    console.error(err);
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();

})();
