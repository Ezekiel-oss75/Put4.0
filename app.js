/* ============================================================
   ПУТЬ 10.0 · APP.JS — Вся логика
   ============================================================ */

/* ============================================================
   СОСТОЯНИЕ
   ============================================================ */
var DEFAULT_STATE = {
  xp:0, streak:0, maxStreak:0, lastDate:null, todayDone:[],
  history:{}, totalDays:0, totalDone:0, achievements:[],
  avatar:'🧘', theme:'dark', fractalStyle:'mixed',
  sound:true, notify:false,
  practiceTiers:{}, completionCounter:{}, customPractices:[], askesis:[],
  dailyQuests:{date:null,list:[],completed:[]},
  barriersCleared:0, barrierProgress:{}, currentPathStep:0,
  dailyCard:null, cardsCompleted:0,
  goals:[], goalsCompleted:0, milestonesCompleted:0,
  moods:{}, moodNotes:{},
  userPlan:null,
  /* Новое в 10.0 */
  petLevel:0, petForm:'warrior', petFed:0,
  buildings:[], buildingSlots:0,
  chestsOpened:0, legendaryChests:0, lastChestDate:null,
  habits:{list:[],log:{}},
  bodyLog:[], financeLog:[], financeGoal:0,
  voiceMeditations:0,
  currentQuoteIndex:0,
  /* Аналитика */
  categoryStats:{disc:0,breath:0,body:0,mind:0,spirit:0,health:0}
};

var state = (function(){
  try {
    var saved = localStorage.getItem(STORAGE);
    if (saved) {
      var parsed = JSON.parse(saved);
      return Object.assign({}, DEFAULT_STATE, parsed);
    }
  } catch(e) {}
  return Object.assign({}, DEFAULT_STATE);
})();

if(!state.goals) state.goals = [];
if(!state.moods) state.moods = {};
if(!state.bodyLog) state.bodyLog = [];
if(!state.financeLog) state.financeLog = [];
if(!state.buildings) state.buildings = [];
if(!state.habits) state.habits = {list:[],log:{}};
if(!state.habits.list || !state.habits.list.length) {
  state.habits.list = DEFAULT_HABITS.map(function(h){return Object.assign({},h);});
}
if(!state.habits.log) state.habits.log = {};
if(!state.categoryStats) state.categoryStats = {disc:0,breath:0,body:0,mind:0,spirit:0,health:0};
if(!state.petForm) state.petForm = 'warrior';

/* ============================================================
   СОХРАНЕНИЕ
   ============================================================ */
function save(){
  try {
    localStorage.setItem(STORAGE, JSON.stringify(state));
  } catch(e) {
    console.warn('Save failed', e);
  }
}

function getAllPractices(){
  return BASE_PRACTICES.concat(state.customPractices || []);
}

function getTier(id){
  return (state.practiceTiers && state.practiceTiers[id]) || 1;
}

function countPractice(id){
  return (state.completionCounter && state.completionCounter[id]) || 0;
}

function closeModal(id){
  var el = document.getElementById(id);
  if(el) el.classList.remove('active');
}

function escapeHtml(str){
  if(!str) return '';
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

/* ============================================================
   МНОЖИТЕЛЬ XP — базовый × уровень × бонус построек
   ============================================================ */
function getMultiplier(){
  return LEVELS[getLevel(state.xp)].mult;
}

function getBuildingBonus(category){
  var total = 0;
  var buildings = state.buildings || [];
  for(var i = 0; i < buildings.length; i++){
    var b = null;
    for(var j = 0; j < BUILDINGS.length; j++){
      if(BUILDINGS[j].id === buildings[i]) b = BUILDINGS[j];
    }
    if(!b) continue;
    if(b.bonusType === 'all') total += b.bonusValue;
    else if(b.bonusType === 'mind_spirit' && (category === 'mind' || category === 'spirit')) total += b.bonusValue;
    else if(b.bonusType === category) total += b.bonusValue;
  }
  return total;
}

function getTotalMultiplier(category){
  var baseMult = getMultiplier();
  var buildingBonus = getBuildingBonus(category) / 100;
  return baseMult * (1 + buildingBonus);
}

/* ============================================================
   ЕЖЕДНЕВНЫЕ ОБНОВЛЕНИЯ
   ============================================================ */
function ensureNewDay(){
  if(state.lastDate !== todayStr()){
    var y = new Date(Date.now() - 86400000).toDateString();
    state.streak = (state.lastDate === y) ? state.streak + 1 : 1;
    if(state.streak > state.maxStreak) state.maxStreak = state.streak;
    state.totalDays++;
    state.todayDone = [];
    state.lastDate = todayStr();
    generateDailyQuests();
    generateDailyCard();
    /* Обновляем цитату */
    state.currentQuoteIndex = (state.currentQuoteIndex + 1) % QUOTES.length;
    /* Питомец худеет, если не кормили */
    if(!state.petFed || state.petFed < state.totalDays - 1){
      /* Питомец голоден — но не наказываем сильно */
    }
    save();
  }
}

function generateDailyQuests(){
  var today = dateKey(new Date());
  if(state.dailyQuests.date === today) return;
  var pool = QUEST_POOL.slice().sort(function(){return Math.random() - 0.5;});
  state.dailyQuests = {
    date: today,
    list: pool.slice(0, 3).map(function(q){return q.id;}),
    completed: []
  };
  save();
}

function generateDailyCard(){
  var today = dateKey(new Date());
  if(state.dailyCard && state.dailyCard.date === today) return;
  var card = CARD_TEMPLATES[Math.floor(Math.random() * CARD_TEMPLATES.length)];
  state.dailyCard = {date: today, id: card.id, done: false, accepted: false};
  save();
}

/* ============================================================
   ПРЕГРАДЫ
   ============================================================ */
function calculateBarrierProgress(barrierId){
  var b = null;
  for(var i = 0; i < BARRIERS.length; i++){
    if(BARRIERS[i].id === barrierId) b = BARRIERS[i];
  }
  if(!b) return 0;
  return Math.min(100, (state.xp / b.requiredXp) * 100);
}

function isBarrierCleared(id){
  return (state.barrierProgress && state.barrierProgress[id]) || false;
}

function checkBarriers(){
  for(var i = 0; i < BARRIERS.length; i++){
    var b = BARRIERS[i];
    if(isBarrierCleared(b.id)) continue;
    if(calculateBarrierProgress(b.id) >= 100){
      if(!state.barrierProgress) state.barrierProgress = {};
      state.barrierProgress[b.id] = true;
      state.barriersCleared = (state.barriersCleared || 0) + 1;
      state.xp += 300;
      showToast('🚧 Преграда: ' + b.name + '! +300 XP');
      if(state.sound) achSound();
      checkAchievements();
      checkPath();
      save();
    }
  }
}

/* ============================================================
   ВЫПОЛНЕНИЕ ПРАКТИКИ
   ============================================================ */
function completePractice(id, xp){
  var p = null;
  var all = getAllPractices();
  for(var i = 0; i < all.length; i++) if(all[i].id === id) p = all[i];
  var cat = p ? p.cat : 'disc';

  var mult = getTotalMultiplier(cat);
  var gained = Math.round(xp * mult);

  state.xp += gained;
  state.totalDone++;
  if(!state.completionCounter) state.completionCounter = {};
  state.completionCounter[id] = (state.completionCounter[id] || 0) + 1;

  if(!state.categoryStats) state.categoryStats = {disc:0,breath:0,body:0,mind:0,spirit:0,health:0};
  state.categoryStats[cat] = (state.categoryStats[cat] || 0) + 1;

  var k = dateKey(new Date());
  state.history[k] = (state.history[k] || 0) + gained;

  /* Тиры */
  if(!state.practiceTiers) state.practiceTiers = {};
  if(p && p.tiers){
    var cur = getTier(id);
    var maxT = p.tiers.length;
    var count = state.completionCounter[id];
    var newT = Math.min(maxT, 1 + Math.floor(count / 5));
    if(newT > cur){
      state.practiceTiers[id] = newT;
      showToast('⭐ ' + p.name + ' · Ур. ' + newT + '!');
    }
  }

  /* Лог привычки автоматически */
  logHabitFromPractice(id);

  /* Обновляем счётчики в сундуке/питомце */
  updatePetProgress();

  save();
  showToast('+' + gained + ' XP' + (mult > 1.01 ? ' (×' + mult.toFixed(2) + ')' : '') + ' ✨');
  if(state.sound) beep();

  checkAchievements();
  checkQuests();
  checkBarriers();
  checkPath();
  checkDailyCard();
}

/* Связь практик и привычек */
var PRACTICE_TO_HABIT = {
  'water': 'h_water',
  'wake': 'h_wake',
  'cold': 'h_cold',
  'meditate': 'h_meditate',
  'read': 'h_read',
  'nophone': 'h_nophone'
};

function logHabitFromPractice(practiceId){
  var habitId = PRACTICE_TO_HABIT[practiceId];
  if(!habitId) return;
  /* Спорт — любая практика тела */
  var p = null;
  var all = getAllPractices();
  for(var i = 0; i < all.length; i++) if(all[i].id === practiceId) p = all[i];
  if(p && p.cat === 'body') habitId = 'h_sport';
  if(!habitId) return;

  var today = dateKey(new Date());
  if(!state.habits.log[today]) state.habits.log[today] = {};
  state.habits.log[today][habitId] = true;
  save();
}

/* ============================================================
   КАРТА СУДЬБЫ
   ============================================================ */
function acceptDailyCard(){
  if(!state.dailyCard) return;
  state.dailyCard.accepted = true;
  save();
  render();
  showToast('⚡ Вызов принят!');
}

function checkDailyCard(){
  if(!state.dailyCard || state.dailyCard.done) return;
  var card = null;
  for(var i = 0; i < CARD_TEMPLATES.length; i++){
    if(CARD_TEMPLATES[i].id === state.dailyCard.id) card = CARD_TEMPLATES[i];
  }
  if(!card) return;
  if(state.todayDone.indexOf(card.checkId) >= 0){
    state.dailyCard.done = true;
    state.xp += card.reward;
    state.cardsCompleted = (state.cardsCompleted || 0) + 1;
    showToast('🎴 Карта судьбы: +' + card.reward + ' XP');
    if(state.sound) achSound();
    checkAchievements();
    save();
  }
}

/* ============================================================
   КВЕСТЫ
   ============================================================ */
function checkQuests(){
  var dq = state.dailyQuests;
  if(!dq || dq.date !== dateKey(new Date())) return;
  for(var i = 0; i < dq.list.length; i++){
    var qid = dq.list[i];
    if(dq.completed.indexOf(qid) >= 0) continue;
    var q = null;
    for(var j = 0; j < QUEST_POOL.length; j++){
      if(QUEST_POOL[j].id === qid) q = QUEST_POOL[j];
    }
    if(!q) continue;
    if(q.check(state)){
      dq.completed.push(qid);
      state.xp += q.reward;
      showToast('📜 Квест: +' + q.reward + ' XP');
      save();
    }
  }
}

/* ============================================================
   ПУТЬ
   ============================================================ */
function checkPathStep(step){
  var s = AWAKENING_PATH[step - 1];
  if(!s) return false;
  for(var i = 0; i < s.reqs.length; i++){
    var r = s.reqs[i], ok = false;
    if(r.type === 'totalDone') ok = state.totalDone >= r.value;
    if(r.type === 'streak') ok = state.maxStreak >= r.value;
    if(r.type === 'cat') ok = countCat(state, r.cat) >= r.value;
    if(r.type === 'askesis') ok = (state.askesis || []).filter(function(a){return a.completed;}).length >= r.value;
    if(r.type === 'barrier') ok = (state.barriersCleared || 0) >= r.value;
    if(!ok) return false;
  }
  return true;
}

function checkPath(){
  var changed = false;
  for(var i = state.currentPathStep || 0; i < AWAKENING_PATH.length; i++){
    if(checkPathStep(i + 1)){
      state.currentPathStep = i + 1;
      changed = true;
      showToast('🗺️ Ступень ' + (i + 1) + ': ' + AWAKENING_PATH[i].title + '!');
      if(state.sound) achSound();
    } else break;
  }
  if(changed){ save(); checkAchievements(); }
}

/* ============================================================
   ДОСТИЖЕНИЯ
   ============================================================ */
function checkAchievements(){
  for(var i = 0; i < ACHIEVEMENTS.length; i++){
    var a = ACHIEVEMENTS[i];
    if(state.achievements.indexOf(a.id) >= 0) continue;
    try {
      if(a.check(state)){
        state.achievements.push(a.id);
        save();
        showAchievementPopup(a);
      }
    } catch(e) {}
  }
}

function showAchievementPopup(a){
  var p = document.getElementById('achPopup');
  if(!p) return;
  document.getElementById('achPopupIcon').textContent = a.icon;
  document.getElementById('achPopupName').textContent = a.name;
  p.classList.add('show');
  if(state.sound) achSound();
  setTimeout(function(){ p.classList.remove('show'); }, 3200);
}

/* ============================================================
   ПИТОМЕЦ
   ============================================================ */
function updatePetProgress(){
  /* Питомец растёт по XP */
  var lvl = 0;
  for(var i = 0; i < PET_STAGES.length; i++){
    if(state.xp >= PET_STAGES[i].xpNeeded) lvl = i;
  }
  if(lvl > (state.petLevel || 0)){
    state.petLevel = lvl;
    /* Уведомление */
    var stage = PET_STAGES[lvl];
    var form = PET_FORMS[state.petForm || 'warrior'];
    showToast('🐣 Питомец вырос: ' + (form.name[lvl] || stage.name) + '!');
    if(state.sound) achSound();
  }
}

function feedPet(){
  if(state.xp < 50){ showToast('Нужно 50 XP', true); return; }
  state.xp -= 50;
  state.petFed = (state.petFed || 0) + 1;
  save();
  render();
  showToast('🍖 Питомец покормлен!');
}

/* ============================================================
   ДОМЕН
   ============================================================ */
function buyBuilding(id){
  var b = null;
  for(var i = 0; i < BUILDINGS.length; i++){
    if(BUILDINGS[i].id === id) b = BUILDINGS[i];
  }
  if(!b) return;
  if((state.buildings || []).indexOf(id) >= 0){ showToast('Уже построено', true); return; }
  var lvl = getLevel(state.xp);
  if(lvl < b.reqLevel){ showToast('Нужен уровень ' + (b.reqLevel + 1), true); return; }
  if(state.xp < b.cost){ showToast('Нужно ' + b.cost + ' XP', true); return; }
  state.xp -= b.cost;
  if(!state.buildings) state.buildings = [];
  state.buildings.push(id);
  save();
  render();
  showToast('🏗 ' + b.name + ' построен! ' + b.bonus);
  if(state.sound) achSound();
  checkAchievements();
}

/* ============================================================
   СУНДУК
   ============================================================ */
function openChest(){
  var today = dateKey(new Date());
  if(state.lastChestDate === today){
    showToast('Сундук уже открыт сегодня', true);
    return;
  }
  var roll = Math.random() * 100;
  var cum = 0;
  var reward = CHEST_REWARDS[0];
  for(var i = 0; i < CHEST_REWARDS.length; i++){
    cum += CHEST_REWARDS[i].chance;
    if(roll < cum){ reward = CHEST_REWARDS[i]; break; }
  }
  var gained = Math.floor(reward.minXp + Math.random() * (reward.maxXp - reward.minXp));
  state.xp += gained;
  state.chestsOpened = (state.chestsOpened || 0) + 1;
  if(reward.rarity === 'legendary') state.legendaryChests = (state.legendaryChests || 0) + 1;
  state.lastChestDate = today;
  save();
  render();
  showChestPopup(reward, gained);
  if(state.sound) achSound();
  checkAchievements();
}

function showChestPopup(reward, gained){
  var pop = document.getElementById('chestPopup');
  if(!pop) return;
  document.getElementById('chestIcon').textContent = reward.icon;
  document.getElementById('chestName').textContent = reward.name;
  document.getElementById('chestXP').textContent = '+' + gained + ' XP';
  document.getElementById('chestRarity').textContent = reward.rarity.toUpperCase();
  document.getElementById('chestRarity').className = 'chest-rarity rarity-' + reward.rarity;
  pop.classList.add('show');
  setTimeout(function(){ pop.classList.remove('show'); }, 4000);
}

/* ============================================================
   ПРИВЫЧКИ
   ============================================================ */
function toggleHabitToday(habitId){
  var today = dateKey(new Date());
  if(!state.habits.log[today]) state.habits.log[today] = {};
  if(state.habits.log[today][habitId]){
    delete state.habits.log[today][habitId];
    state.xp = Math.max(0, state.xp - 10);
    showToast('−10 XP');
  } else {
    state.habits.log[today][habitId] = true;
    state.xp += 10;
    showToast('✅ Привычка: +10 XP');
    if(state.sound) beep();
  }
  save();
  render();
  checkAchievements();
}

function addHabit(){
  var name = document.getElementById('habitName');
  if(!name) return;
  var val = name.value.trim();
  if(!val){ showToast('Введи название', true); return; }
  state.habits.list.push({
    id: 'h_custom_' + Date.now(),
    name: val,
    goal: 30
  });
  save();
  name.value = '';
  render();
  showToast('➕ Привычка добавлена');
}

function removeHabit(id){
  if(!confirm('Удалить привычку?')) return;
  state.habits.list = state.habits.list.filter(function(h){return h.id !== id;});
  save();
  render();
}

/* ============================================================
   ЖУРНАЛ ТЕЛА
   ============================================================ */
function addBodyLog(){
  var w = parseFloat((document.getElementById('bodyWeight') || {}).value);
  var waist = parseFloat((document.getElementById('bodyWaist') || {}).value);
  if(!w || isNaN(w)){ showToast('Введи вес', true); return; }
  state.bodyLog.push({
    date: dateKey(new Date()),
    weight: w,
    waist: (waist && !isNaN(waist)) ? waist : null
  });
  save();
  document.getElementById('bodyWeight').value = '';
  document.getElementById('bodyWaist').value = '';
  render();
  showToast('⚖️ Запись добавлена');
  checkAchievements();
}

function removeBodyLog(i){
  if(!confirm('Удалить запись?')) return;
  state.bodyLog.splice(i, 1);
  save();
  render();
}

/* ============================================================
   ФИНАНСЫ
   ============================================================ */
function addFinanceLog(){
  var amount = parseFloat((document.getElementById('finAmount') || {}).value);
  var cat = (document.getElementById('finCat') || {}).value || 'Прочее';
  var comment = (document.getElementById('finComment') || {}).value || '';
  if(!amount || isNaN(amount)){ showToast('Введи сумму', true); return; }
  state.financeLog.push({
    date: dateKey(new Date()),
    amount: amount,
    cat: cat,
    comment: comment
  });
  save();
  document.getElementById('finAmount').value = '';
  document.getElementById('finComment').value = '';
  render();
  showToast('💰 Запись добавлена');
  checkAchievements();
}

function removeFinanceLog(i){
  if(!confirm('Удалить запись?')) return;
  state.financeLog.splice(i, 1);
  save();
  render();
}

function setFinanceGoal(){
  var g = parseFloat((document.getElementById('finGoal') || {}).value);
  if(!g || isNaN(g)){ showToast('Введи цель', true); return; }
  state.financeGoal = g;
  save();
  render();
  showToast('🎯 Цель накоплений: ' + g);
}

/* ============================================================
   ГОЛОСОВАЯ МЕДИТАЦИЯ (Web Speech API)
   ============================================================ */
var voiceMedInterval = null;
var MEDITATION_SCRIPTS = {
  relax: {
    title: 'Медитация расслабления',
    lines: [
      'Закрой глаза. Сделай глубокий вдох.',
      'Почувствуй, как воздух входит в твоё тело.',
      'Медленно выдохни. Отпусти напряжение.',
      'Позволь мыслям проходить мимо.',
      'Ты не мысли. Ты — тот, кто наблюдает.',
      'Расслабь плечи. Расслабь челюсть.',
      'Побудь в этой тишине.',
      'Просто дыши. Ты в безопасности.',
      'С каждым вдохом — покой.',
      'С каждым выдохом — глубже.',
      'Продолжай наблюдать.',
      'Спокойствие внутри тебя.'
    ]
  },
  focus: {
    title: 'Медитация фокуса',
    lines: [
      'Сядь ровно. Спина прямая.',
      'Сделай три глубоких вдоха.',
      'Выбери одну точку внимания.',
      'Это может быть дыхание.',
      'Мысли приходят — заметь их.',
      'Мягко вернись к точке.',
      'Ты тренируешь свой ум.',
      'Каждое возвращение — это победа.',
      'Ты здесь. Сейчас.',
      'Ничего больше не важно.',
      'Только эта секунда.',
      'Продолжай.'
    ]
  },
  gratitude: {
    title: 'Медитация благодарности',
    lines: [
      'Закрой глаза и дыши.',
      'Подумай о том, что у тебя есть.',
      'Тёплый дом. Вода. Еда.',
      'Кто-то думает о тебе.',
      'Ты жив. Ты дышишь.',
      'Это уже много.',
      'Пожелай себе счастья.',
      'Пожелай счастья близким.',
      'Пожелай счастья всем.',
      'Пусть все существа будут счастливы.',
      'Твоё сердце становится мягче.',
      'Побудь с этим чувством.'
    ]
  }
};

function startVoiceMeditation(type){
  if(!('speechSynthesis' in window)){
    showToast('Голос недоступен на этом устройстве', true);
    return;
  }
  var script = MEDITATION_SCRIPTS[type];
  if(!script) return;

  document.getElementById('voiceTitle').textContent = script.title;
  document.getElementById('voiceText').textContent = 'Приготовься...';
  document.getElementById('voiceModal').classList.add('active');

  var i = 0;
  function speakNext(){
    if(i >= script.lines.length){
      document.getElementById('voiceText').textContent = '🧘 Медитация завершена';
      state.voiceMeditations = (state.voiceMeditations || 0) + 1;
      state.xp += 40;
      save();
      checkAchievements();
      render();
      showToast('🧘 Медитация: +40 XP');
      return;
    }
    document.getElementById('voiceText').textContent = script.lines[i];
    var u = new SpeechSynthesisUtterance(script.lines[i]);
    u.lang = 'ru-RU';
    u.rate = 0.85;
    u.pitch = 0.95;
    u.volume = 0.9;
    u.onend = function(){
      i++;
      setTimeout(speakNext, 2500);
    };
    speechSynthesis.speak(u);
  }
  speakNext();
}

function stopVoiceMeditation(){
  if('speechSynthesis' in window){
    speechSynthesis.cancel();
  }
  closeModal('voiceModal');
}

/* ============================================================
   ТАЙМЕРЫ
   ============================================================ */
var activeTimer = null;
var timerEndTime = 0;
var timerMode = '';

function openTimer(mode){
  timerMode = mode;
  var titles = {
    stopwatch: '⏱ Секундомер',
    pomodoro: '🍅 Pomodoro (25/5)',
    custom: '⏰ Обратный отсчёт'
  };
  document.getElementById('timerTitle').textContent = titles[mode] || 'Таймер';
  document.getElementById('timerDisplay').textContent = '00:00';
  document.getElementById('timerHint').textContent = '';
  document.getElementById('timerModal').classList.add('active');
}

function toggleTimer(){
  var btn = document.getElementById('timerBtn');
  if(activeTimer){
    clearInterval(activeTimer);
    activeTimer = null;
    btn.textContent = 'Продолжить';
    return;
  }
  btn.textContent = 'Пауза';
  var start = Date.now();
  var offset = 0;
  if(timerMode === 'stopwatch'){
    var disp = document.getElementById('timerDisplay').textContent;
    var parts = disp.split(':');
    offset = (parseInt(parts[0]) * 60 + parseInt(parts[1])) * 1000;
  } else if(timerMode === 'pomodoro'){
    var disp2 = document.getElementById('timerDisplay').textContent;
    var parts2 = disp2.split(':');
    var remaining = (parseInt(parts2[0]) * 60 + parseInt(parts2[1])) * 1000;
    offset = -remaining;
    if(remaining === 0 && !timerEndTime) offset = -POMODORO_WORK * 1000;
  } else if(timerMode === 'custom'){
    var disp3 = document.getElementById('timerDisplay').textContent;
    var parts3 = disp3.split(':');
    var rem = (parseInt(parts3[0]) * 60 + parseInt(parts3[1])) * 1000;
    offset = rem > 0 ? -rem : -5 * 60 * 1000;
  }

  activeTimer = setInterval(function(){
    var elapsed = Date.now() - start - offset;
    var totalSec = Math.floor(elapsed / 1000);
    if(timerMode !== 'stopwatch' && totalSec >= 0){
      /* Обратный отсчёт истёк */
      clearInterval(activeTimer);
      activeTimer = null;
      document.getElementById('timerBtn').textContent = 'Начать';
      document.getElementById('timerHint').textContent = '⏰ Время вышло!';
      if(state.sound) achSound();
      if(navigator.vibrate) navigator.vibrate([200, 100, 200]);
      return;
    }
    var absSec = Math.abs(totalSec);
    var m = Math.floor(absSec / 60);
    var s = absSec % 60;
    document.getElementById('timerDisplay').textContent =
      (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }, 100);
}

/* ============================================================
   АНАЛИТИКА КОРРЕЛЯЦИЙ
   ============================================================ */
function analyzeCorrelations(){
  var moods = state.moods || {};
  var moodKeys = Object.keys(moods);
  if(moodKeys.length < 5) return null;

  /* Для каждой практики считаем среднее настроение в дни с ней и без */
  var practiceStats = {};
  var all = getAllPractices();

  for(var i = 0; i < all.length; i++){
    var pid = all[i].id;
    var withMood = [], withoutMood = [];
    for(var k = 0; k < moodKeys.length; k++){
      var day = moodKeys[k];
      var moodEmoji = moods[day];
      var moodScore = MOOD_SCORE[moodEmoji] || 3;
      /* Проверяем, была ли практика в этот день */
      /* В history есть только XP за день — не детально. Упрощаем: */
      /* Используем completionCounter и не знаем по дням. Пока пропускаем детальную аналитику. */
    }
  }

  /* Простая аналитика: связь стрика с настроением */
  var goodDays = 0, badDays = 0;
  for(var m = 0; m < moodKeys.length; m++){
    var mood = moods[moodKeys[m]];
    if(mood === '🔥' || mood === '😊') goodDays++;
    if(mood === '😔' || mood === '😰' || mood === '😤') badDays++;
  }

  var insights = [];

  /* Инсайт 1: общий тренд */
  if(goodDays > badDays){
    insights.push({icon:'📈', text:'Ты в хорошем настроении ' + goodDays + ' из ' + moodKeys.length + ' дней. Продолжай!'});
  } else if(badDays > goodDays){
    insights.push({icon:'🌧', text:'Больше сложных дней, чем хороших. Обрати внимание на сон и движение.'});
  }

  /* Инсайт 2: связь с активностью */
  var activeDays = 0;
  for(var d = 0; d < moodKeys.length; d++){
    var dayKey = moodKeys[d];
    if((state.history[dayKey] || 0) > 50) activeDays++;
  }
  if(activeDays / moodKeys.length > 0.6){
    insights.push({icon:'⚡', text:'Больше половины дней были активными. Это отлично!'});
  } else if(activeDays / moodKeys.length < 0.3){
    insights.push({icon:'💡', text:'Мало активных дней. Попробуй добавить одну практику утром.'});
  }

  /* Инсайт 3: соотношение категорий */
  var cats = state.categoryStats || {};
  var totalCats = 0;
  for(var cat in cats) if(cats.hasOwnProperty(cat)) totalCats += cats[cat];
  if(totalCats > 10){
    var weakest = 'disc', weakestCount = 9999;
    for(var cat2 in cats) if(cats.hasOwnProperty(cat2) && cats[cat2] < weakestCount){
      weakestCount = cats[cat2];
      weakest = cat2;
    }
    var catNames = {disc:'Дисциплина', breath:'Дыхание', body:'Тело', mind:'Разум', spirit:'Дух', health:'Здоровье'};
    insights.push({icon:'🎯', text:'Слабее всего развита ветка: ' + catNames[weakest] + '. Добавь её практик.'});
  }

  /* Инсайт 4: питомец голоден */
  if(state.petLevel > 0 && (!state.petFed || state.petFed < 3)){
    insights.push({icon:'🐉', text:'Питомец хочет есть. Покорми его за 50 XP.'});
  }

  return insights;
}

var MOOD_SCORE = {'🔥':5, '😊':4, '😐':3, '😔':2, '😰':2, '😤':2, '😴':3};

/* ============================================================
   RENDER — главная функция
   ============================================================ */
function render(){
  ensureNewDay();
  generateDailyQuests();
  generateDailyCard();
  checkPath();
  checkQuests();
  checkBarriers();
  checkDailyCard();

  var lvlIdx = getLevel(state.xp);
  var cur = LEVELS[lvlIdx];
  var next = LEVELS[lvlIdx + 1];

  var badge = document.getElementById('levelBadge');
  if(badge) badge.textContent = 'Ур. ' + (lvlIdx + 1) + ' · ' + cur.name;

  var rTitle = document.getElementById('rankTitle');
  if(rTitle) rTitle.textContent = RANK_TITLES[lvlIdx] || 'Мастер';

  var av = document.getElementById('avatar');
  if(av) av.textContent = state.avatar;

  var sR = document.getElementById('statRank');
  if(sR) sR.textContent = cur.rank;

  if(next){
    var prog = (state.xp - cur.xp) / (next.xp - cur.xp) * 100;
    var fill = document.getElementById('xpFill');
    if(fill) fill.style.width = prog + '%';
    var txt = document.getElementById('xpText');
    if(txt) txt.textContent = state.xp + ' / ' + next.xp + ' XP · ×' + getMultiplier().toFixed(2);
  } else {
    var fill2 = document.getElementById('xpFill');
    if(fill2) fill2.style.width = '100%';
    var txt2 = document.getElementById('xpText');
    if(txt2) txt2.textContent = state.xp + ' XP · МАКС · ×' + getMultiplier().toFixed(2);
  }

  var sStr = document.getElementById('statStreak');
  if(sStr) sStr.textContent = state.streak;
  var sTod = document.getElementById('statToday');
  if(sTod) sTod.textContent = state.todayDone.length;
  var sTot = document.getElementById('statTotal');
  if(sTot) sTot.textContent = state.totalDays;

  renderCard();
  renderPet();
  renderChest();
  renderDomain();
  renderPlan();
  renderGoals();
  renderHabits();
  renderBody();
  renderFinance();
  renderAnalytics();
  renderQuote();
  renderDNA();
  renderPath();
  renderPractices();
  renderQuests();
  renderBarriers();
  renderMood();
  renderHealth();
  renderAskesis();
  renderKnowledge();
  renderProgress();
  renderAwards();
  renderCustomList();
  renderSettings();

  if(state.theme && state.theme !== 'dark'){
    document.documentElement.setAttribute('data-theme', state.theme);
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

/* ============================================================
   RENDER: Карта Судьбы
   ============================================================ */
function renderCard(){
  var c = document.getElementById('cardContainer');
  if(!c) return;
  if(!state.dailyCard){ c.innerHTML = ''; return; }
  var card = null;
  for(var i = 0; i < CARD_TEMPLATES.length; i++){
    if(CARD_TEMPLATES[i].id === state.dailyCard.id) card = CARD_TEMPLATES[i];
  }
  if(!card){ c.innerHTML = ''; return; }
  var done = state.dailyCard.done;
  var accepted = state.dailyCard.accepted;
  var isChecked = state.todayDone.indexOf(card.checkId) >= 0;
  var h = '<div class="card-day ' + (done ? 'done' : '') + '">' +
    '<div class="card-day-label">' + (done ? '✅ ВЫПОЛНЕНО' : (accepted ? '⚡ ВЫЗОВ ПРИНЯТ' : '🎴 КАРТА ДНЯ')) + '</div>' +
    '<div class="card-day-icon">' + card.icon + '</div>' +
    '<div class="card-day-title">' + card.title + '</div>' +
    '<div class="card-day-desc">' + card.desc + '</div>' +
    '<div class="card-day-reward">+' + (done ? '✓ ' : '') + card.reward + ' XP</div>';
  if(!done){
    if(!accepted){
      h += '<div class="card-day-actions"><button class="card-day-btn" onclick="acceptDailyCard()">⚡ ПРИНЯТЬ ВЫЗОВ</button></div>';
    } else {
      h += '<div class="card-day-progress">' +
        '<b>Что делать:</b> ' + card.action + '<br>' +
        (isChecked ? '✅ Практика выполнена! Награда зачисляется...' : '⏳ Выполни практику на вкладке «📋»') +
        '</div>';
    }
  } else {
    h += '<div class="card-day-progress" style="background:rgba(76,217,100,0.15);">✅ Карта выполнена! +' + card.reward + ' XP получено.</div>';
  }
  h += '</div>';
  c.innerHTML = h;
}

/* ============================================================
   RENDER: Питомец
   ============================================================ */
function renderPet(){
  var c = document.getElementById('petContainer');
  if(!c) return;
  var form = PET_FORMS[state.petForm || 'warrior'];
  var level = state.petLevel || 0;
  var emoji = form.emoji[level] || form.emoji[0];
  var name = form.name[level] || form.name[0];
  var nextStage = PET_STAGES[level + 1];
  var curStage = PET_STAGES[level];
  var progress = 0;
  if(nextStage){
    progress = (state.xp - curStage.xpNeeded) / (nextStage.xpNeeded - curStage.xpNeeded) * 100;
    progress = Math.max(0, Math.min(100, progress));
  } else {
    progress = 100;
  }
  var fed = state.petFed || 0;
  var h = '<div class="pet-card">' +
    '<div class="pet-emoji" style="filter:drop-shadow(0 0 30px ' + form.color + ')">' + emoji + '</div>' +
    '<div class="pet-name">' + name + '</div>' +
    '<div class="pet-level">Уровень ' + level + ' / 5</div>' +
    '<div class="pet-progress-bar"><div class="pet-progress-fill" style="width:' + progress + '%;background:linear-gradient(90deg,' + form.color + ',#8b7cff)"></div></div>';
  if(nextStage){
    h += '<div class="pet-info">До следующего: ' + (nextStage.xpNeeded - state.xp) + ' XP</div>';
  } else {
    h += '<div class="pet-info">Питомец достиг максимума! 🌟</div>';
  }
  h += '<div class="pet-stats">Кормлений: ' + fed + '</div>' +
    '<div class="pet-actions">' +
    '<button class="mini-btn purple" onclick="feedPet()">🍖 Покормить (50 XP)</button>' +
    '<button class="mini-btn" onclick="changePetForm()">🔄 Форма</button>' +
    '</div></div>';
  c.innerHTML = h;
}

function changePetForm(){
  var forms = ['warrior', 'monk', 'sage'];
  var idx = forms.indexOf(state.petForm);
  state.petForm = forms[(idx + 1) % forms.length];
  save();
  render();
  showToast('🐉 Форма: ' + PET_FORMS[state.petForm].name[state.petLevel || 0]);
}

/* ============================================================
   RENDER: Сундук
   ============================================================ */
function renderChest(){
  var c = document.getElementById('chestContainer');
  if(!c) return;
  var today = dateKey(new Date());
  var canOpen = state.lastChestDate !== today;
  var h = '<div class="chest-card">' +
    '<div class="chest-main' + (canOpen ? ' available' : '') + '">' +
    (canOpen ? '🎁' : '📦') +
    '</div>' +
    '<div class="chest-title">' + (canOpen ? 'Сундук дня готов!' : 'Приходи завтра') + '</div>' +
    '<div class="chest-sub">Всего открыто: ' + (state.chestsOpened || 0) + ' · Легендарных: ' + (state.legendaryChests || 0) + '</div>' +
    (canOpen ? '<button class="card-day-btn" onclick="openChest()">🎁 ОТКРЫТЬ СУНДУК</button>' : '') +
    '</div>';
  c.innerHTML = h;
}

/* ============================================================
   RENDER: Домен
   ============================================================ */
function renderDomain(){
  var c = document.getElementById('domainContainer');
  if(!c) return;
  var h = '';
  var owned = state.buildings || [];
  /* Текущий бонус */
  var totalBonus = 0;
  var mindSpiritBonus = 0;
  var bodyBonus = 0;
  var healthBonus = 0;
  for(var i = 0; i < owned.length; i++){
    var b = null;
    for(var j = 0; j < BUILDINGS.length; j++){
      if(BUILDINGS[j].id === owned[i]) b = BUILDINGS[j];
    }
    if(!b) continue;
    if(b.bonusType === 'all') totalBonus += b.bonusValue;
    if(b.bonusType === 'mind_spirit') mindSpiritBonus += b.bonusValue;
    if(b.bonusType === 'body') bodyBonus += b.bonusValue;
    if(b.bonusType === 'health') healthBonus += b.bonusValue;
  }
  h += '<div class="domain-summary">' +
    '<div class="domain-title">Твой домен</div>' +
    '<div class="domain-bonus">+' + totalBonus + '% ко всему XP</div>' +
    (mindSpiritBonus ? '<div class="domain-extra">+' + mindSpiritBonus + '% разум+дух</div>' : '') +
    (bodyBonus ? '<div class="domain-extra">+' + bodyBonus + '% к телу</div>' : '') +
    (healthBonus ? '<div class="domain-extra">+' + healthBonus + '% к здоровью</div>' : '') +
    '</div>';
  h += '<div class="section-title" style="margin-top:20px;">Постройки</div>';
  for(var k = 0; k < BUILDINGS.length; k++){
    var b2 = BUILDINGS[k];
    var has = owned.indexOf(b2.id) >= 0;
    var lvl = getLevel(state.xp);
    var canBuy = !has && lvl >= b2.reqLevel && state.xp >= b2.cost;
    var cls = has ? 'building-card built' : 'building-card';
    if(!canBuy && !has) cls += ' locked';
    h += '<div class="' + cls + '">' +
      '<div class="building-emoji">' + b2.emoji + '</div>' +
      '<div class="building-info">' +
      '<div class="building-name">' + b2.name + '</div>' +
      '<div class="building-bonus">' + b2.bonus + '</div>' +
      '<div class="building-cost">' + (has ? '✅ Построено' : '💰 ' + b2.cost + ' XP' + (lvl < b2.reqLevel ? ' · нужен Ур. ' + (b2.reqLevel + 1) : '')) + '</div>' +
      '</div>';
    if(!has){
      h += '<button class="build-btn" ' + (canBuy ? '' : 'disabled') + ' onclick="buyBuilding(\'' + b2.id + '\')">' + (canBuy ? '🏗 Построить' : '🔒') + '</button>';
    }
    h += '</div>';
  }
  c.innerHTML = h;
}

/* ============================================================
   RENDER: План дня
   ============================================================ */
function renderPlan(){
  var c = document.getElementById('planContainer');
  if(!c) return;
  var h = '';
  if(state.userPlan && state.userPlan.plan){
    h += '<div class="plan-section">' +
      '<div class="plan-title">📅 Твой персональный распорядок</div>' +
      '<div style="font-size:11.5px;color:var(--text-dim);margin-bottom:14px;font-weight:600;">Построен: ' + state.userPlan.created + '</div>';
    for(var i = 0; i < state.userPlan.plan.length; i++){
      var item = state.userPlan.plan[i];
      h += '<div class="schedule-item">' +
        '<div class="schedule-time">' + item.time + '</div>' +
        '<div class="schedule-info"><div class="schedule-name">' + item.name + '</div>' +
        '<div class="schedule-desc">' + item.desc + '</div>' +
        '<span class="schedule-tag tag-' + item.tag + '">' + item.tag + '</span>' +
        '</div></div>';
    }
    h += '<button class="btn-block" style="margin-top:16px;" onclick="resetPlan()">🔄 Построить заново</button>';
    h += '</div>';
  }
  var prof = state.userPlan ? state.userPlan.profile : null;
  h += '<div class="plan-section">' +
    '<div class="plan-title">🧠 ' + (state.userPlan ? 'Обновить данные' : 'Заполни о себе') + '</div>' +
    '<div class="plan-label">🌅 Время подъёма</div>' +
    '<input class="plan-input" type="time" id="pWake" value="' + (prof ? prof.wakeTime : '07:00') + '">' +
    '<div class="plan-label">😴 Время сна</div>' +
    '<input class="plan-input" type="time" id="pSleep" value="' + (prof ? prof.sleepTime : '23:00') + '">' +
    '<div class="plan-label">⏰ Сколько часов сна</div>' +
    '<input class="plan-input" type="number" id="pSleepHours" min="5" max="11" value="' + (prof ? prof.sleepHours : 8) + '">' +
    '<div class="plan-label">💼 Начало работы</div>' +
    '<input class="plan-input" type="time" id="pWorkStart" value="' + (prof ? prof.workStart : '09:00') + '">' +
    '<div class="plan-label">💼 Конец работы</div>' +
    '<input class="plan-input" type="time" id="pWorkEnd" value="' + (prof ? prof.workEnd : '18:00') + '">' +
    '<div class="plan-label">🌓 Режим работы</div>' +
    '<div class="radio-row">' +
    '<button class="radio-opt' + ((!prof || prof.workType === 'day') ? ' selected' : '') + '" data-r="workType" data-v="day" onclick="pickRadio(this,\'workType\')">☀️ День</button>' +
    '<button class="radio-opt' + ((prof && prof.workType === 'night') ? ' selected' : '') + '" data-r="workType" data-v="night" onclick="pickRadio(this,\'workType\')">🌙 Ночь</button>' +
    '<button class="radio-opt' + ((prof && prof.workType === 'flexible') ? ' selected' : '') + '" data-r="workType" data-v="flexible" onclick="pickRadio(this,\'workType\')">🔀 Гибкий</button>' +
    '</div>' +
    '<div class="plan-label">🎯 Чего хочешь достичь</div>' +
    '<div class="interest-grid">' +
    '<button class="interest-opt' + (hasInterest('body') ? ' selected' : '') + '" data-i="body" onclick="toggleInterest(this)"><span class="emo">💪</span>Спорт</button>' +
    '<button class="interest-opt' + (hasInterest('mind') ? ' selected' : '') + '" data-i="mind" onclick="toggleInterest(this)"><span class="emo">🧠</span>Ум</button>' +
    '<button class="interest-opt' + (hasInterest('meditation') ? ' selected' : '') + '" data-i="meditation" onclick="toggleInterest(this)"><span class="emo">🧘</span>Медитация</button>' +
    '<button class="interest-opt' + (hasInterest('spirit') ? ' selected' : '') + '" data-i="spirit" onclick="toggleInterest(this)"><span class="emo">✨</span>Дух</button>' +
    '<button class="interest-opt' + (hasInterest('journal') ? ' selected' : '') + '" data-i="journal" onclick="toggleInterest(this)"><span class="emo">✍️</span>Дневник</button>' +
    '<button class="interest-opt' + (hasInterest('quit') ? ' selected' : '') + '" data-i="quit" onclick="toggleInterest(this)"><span class="emo">🚭</span>Отвыкнуть</button>' +
    '</div>' +
    '<button class="btn-block primary" onclick="saveUserPlan()">🧠 ' + (state.userPlan ? 'Обновить план' : 'Построить план') + '</button>' +
    '</div>';
  c.innerHTML = h;
}

function hasInterest(i){
  if(!state.userPlan || !state.userPlan.profile) return false;
  return state.userPlan.profile.interests.indexOf(i) >= 0;
}

function pickRadio(el, group){
  document.querySelectorAll('.radio-opt[data-r="' + group + '"]').forEach(function(x){ x.classList.remove('selected'); });
  el.classList.add('selected');
}

function toggleInterest(el){
  el.classList.toggle('selected');
}

function saveUserPlan(){
  var profile = {
    wakeTime: (document.getElementById('pWake') || {}).value || '07:00',
    sleepTime: (document.getElementById('pSleep') || {}).value || '23:00',
    workStart: (document.getElementById('pWorkStart') || {}).value || '09:00',
    workEnd: (document.getElementById('pWorkEnd') || {}).value || '18:00',
    workType: (document.querySelector('.radio-opt[data-r="workType"].selected') || {}).dataset ? document.querySelector('.radio-opt[data-r="workType"].selected').dataset.v : 'day',
    sleepHours: parseInt((document.getElementById('pSleepHours') || {}).value) || 8,
    interests: []
  };
  document.querySelectorAll('.interest-opt.selected').forEach(function(el){ profile.interests.push(el.dataset.i); });
  state.userPlan = {profile: profile, plan: buildDayPlan(profile), created: dateKey(new Date())};
  save();
  render();
  showToast('🧠 План построен!');
  if(state.sound) achSound();
  checkAchievements();
}

function resetPlan(){
  if(!confirm('Построить план заново?')) return;
  state.userPlan = null;
  save();
  render();
}

/* ============================================================
   ПОСТРОЕНИЕ ПЛАНА
   ============================================================ */
function buildDayPlan(profile){
  var plan = [];
  function tToMin(s){ var parts = s.split(':'); return parseInt(parts[0]) * 60 + parseInt(parts[1]); }
  function minToT(m){ var h = Math.floor(m / 60) % 24; var mm = m % 60; return String(h).padStart(2, '0') + ':' + String(mm).padStart(2, '0'); }
  var wake = tToMin(profile.wakeTime);
  var sleep = tToMin(profile.sleepTime);
  if(sleep <= wake) sleep += 24 * 60;
  var workStart = tToMin(profile.workStart);
  var workEnd = tToMin(profile.workEnd);
  if(workEnd <= workStart) workEnd += 24 * 60;

  plan.push({time: profile.wakeTime, name: '🌅 Пробуждение', desc: 'Вода + свет + 5 мин дыхания 4-7-8', tag: 'breath'});
  plan.push({time: minToT(wake + 15), name: '🚿 Холодный душ', desc: '30 сек — 2 мин. Дыхание ровное', tag: 'health'});
  if(profile.interests.indexOf('body') >= 0){
    plan.push({time: minToT(wake + 30), name: '💪 Тренировка', desc: '20-40 мин: зарядка / отжимания / бег', tag: 'body'});
  } else {
    plan.push({time: minToT(wake + 30), name: '🧘 Растяжка', desc: '10-15 мин мягкой растяжки', tag: 'body'});
  }
  plan.push({time: minToT(wake + 70), name: '🍳 Завтрак', desc: 'Белок + жиры. Без сахара', tag: 'food'});
  if(profile.interests.indexOf('mind') >= 0){
    plan.push({time: minToT(wake + 90), name: '📖 Обучение', desc: '30 мин книги или навыка', tag: 'mind'});
  }
  plan.push({time: minToT(wake + 120), name: '🧠 Глубокая работа', desc: '2-4 часа без телефона', tag: 'work'});

  plan.push({time: minToT(workStart + 180), name: '🍽 Обед', desc: 'Белок + овощи + жиры', tag: 'food'});
  plan.push({time: minToT(workStart + 240), name: '🚶 Прогулка', desc: '15 мин на улице', tag: 'health'});

  if(profile.workType === 'night'){
    plan.push({time: minToT(wake + 50), name: '😴 Дневной сон', desc: '60-90 мин перед ночной', tag: 'rest'});
  }
  plan.push({time: minToT(workEnd + 30), name: '🏃 Активность', desc: 'Бег / прогулка 30-45 мин', tag: 'body'});
  plan.push({time: minToT(workEnd + 90), name: '🍽 Ужин', desc: 'Лёгкий. За 3 часа до сна', tag: 'food'});
  if(profile.interests.indexOf('meditation') >= 0 || profile.interests.indexOf('spirit') >= 0){
    plan.push({time: minToT(workEnd + 120), name: '🧘 Медитация', desc: '10-20 мин наблюдения', tag: 'spirit'});
  }
  if(profile.interests.indexOf('journal') >= 0){
    plan.push({time: minToT(workEnd + 150), name: '✍️ Дневник', desc: 'Что было, что чувствовал', tag: 'mind'});
  }
  plan.push({time: minToT(sleep - 60), name: '📵 Цифровая тишина', desc: 'За час до сна — без экранов', tag: 'health'});
  plan.push({time: minToT(sleep - 30), name: '🛁 Ритуал сна', desc: 'Тёплый душ, тёмная комната', tag: 'rest'});
  plan.push({time: profile.sleepTime, name: '😴 Сон', desc: 'Цель: ' + profile.sleepHours + ' часов', tag: 'rest'});

  plan.sort(function(a, b){ return tToMin(a.time) - tToMin(b.time); });
  return plan;
}

/* ============================================================
   RENDER: Цели
   ============================================================ */
function renderGoals(){
  var c = document.getElementById('goalsContainer');
  if(!c) return;
  var h = '';
  if(state.goals && state.goals.length){
    for(var i = 0; i < state.goals.length; i++){
      var g = state.goals[i];
      var gDate = new Date(g.deadline);
      var now = new Date();
      var days = Math.ceil((gDate - now) / 86400000);
      if(days < 0) days = 0;
      var totalM = g.milestones ? g.milestones.length : 0;
      var doneM = 0;
      if(g.milestones) for(var mm = 0; mm < g.milestones.length; mm++) if(g.milestones[mm].done) doneM++;
      var prog = totalM > 0 ? doneM / totalM * 100 : (g.completed ? 100 : 0);
      var cls = 'goal-card';
      if(g.completed) cls += '';
      else if(g.isGrand) cls += ' grand active';
      else cls += ' active';
      h += '<div class="' + cls + '">' +
        '<div class="goal-head">' +
        '<div><div class="goal-title">' + (g.isGrand ? '👑 ' : '') + escapeHtml(g.title) + '</div>' +
        '<div class="goal-deadline">' + gDate.toLocaleDateString('ru-RU') + (g.isGrand ? ' · Грандиозная' : '') + '</div></div>' +
        '<div><div class="goal-days">' + (g.completed ? '✓' : days) + '</div>' +
        '<div class="goal-days-label">' + (g.completed ? 'Готово' : 'дней') + '</div></div></div>' +
        '<div class="goal-progress-bar"><div class="goal-progress-fill" style="width:' + prog + '%"></div></div>' +
        '<div class="goal-progress-text"><span>' + (totalM > 0 ? doneM + ' / ' + totalM + ' шагов' : 'Прогресс') + '</span><span>' + Math.round(prog) + '%</span></div>';
      if(g.milestones && g.milestones.length){
        h += '<div class="milestone-list">';
        for(var mi = 0; mi < g.milestones.length; mi++){
          var m = g.milestones[mi];
          h += '<button class="milestone ' + (m.done ? 'done' : '') + '" onclick="toggleMilestone(' + i + ',' + mi + ')">' +
            '<span class="milestone-icon">' + (m.done ? '✓' : '') + '</span>' +
            '<span>' + escapeHtml(m.text) + '</span></button>';
        }
        h += '</div>';
      }
      h += '<div class="goal-actions">' +
        (g.completed ? '<button class="mini-btn green" disabled>✅ Достигнута</button>' : '<button class="mini-btn green" onclick="completeGoal(' + i + ')">🏆 Достигнута</button>') +
        '<button class="mini-btn danger" onclick="deleteGoal(' + i + ')">✖ Удалить</button>' +
        '</div></div>';
    }
  } else {
    h = '<div class="empty-state"><div class="empty-state-icon">🎯</div>Нет целей. Создай первую ниже!</div>';
  }
  c.innerHTML = h;

  var form = document.getElementById('goalForm');
  if(!form) return;
  var fh = '<div class="plan-section">' +
    '<div class="plan-label">📋 Шаблон</div>' +
    '<select class="plan-input" id="gTemplate" onchange="onGoalTemplateChange()"><option value="none">— Своя цель —</option>';
  for(var t = 0; t < GRAND_GOALS_TEMPLATES.length; t++){
    var tpl = GRAND_GOALS_TEMPLATES[t];
    if(tpl.id === 'custom') continue;
    fh += '<option value="' + tpl.id + '">' + tpl.icon + ' ' + tpl.title + '</option>';
  }
  fh += '</select>' +
    '<div class="plan-label">📝 Название</div>' +
    '<input class="plan-input" id="gTitle" placeholder="Например: пробежать марафон" maxlength="60">' +
    '<div class="plan-label">📅 К какому сроку</div>' +
    '<input class="plan-input" type="date" id="gDate">' +
    '<label style="display:flex;align-items:center;gap:10px;margin-top:14px;font-size:13px;color:var(--text-dim);font-weight:600;cursor:pointer;">' +
    '<input type="checkbox" id="gGrand" style="width:20px;height:20px;accent-color:#8b7cff;">' +
    '👑 Грандиозная (+1000 XP)' +
    '</label>' +
    '<button class="btn-block primary" style="margin-top:16px;" onclick="addCustomGoal()">🎯 Создать цель</button>' +
    '</div>';
  form.innerHTML = fh;
}

function onGoalTemplateChange(){
  var v = (document.getElementById('gTemplate') || {}).value;
  if(v && v !== 'none'){
    for(var i = 0; i < GRAND_GOALS_TEMPLATES.length; i++){
      if(GRAND_GOALS_TEMPLATES[i].id === v){
        document.getElementById('gTitle').value = GRAND_GOALS_TEMPLATES[i].title;
        document.getElementById('gGrand').checked = true;
        var d = new Date();
        d.setDate(d.getDate() + 90);
        var y = d.getFullYear();
        var m = String(d.getMonth() + 1).padStart(2, '0');
        var dd = String(d.getDate()).padStart(2, '0');
        document.getElementById('gDate').value = y + '-' + m + '-' + dd;
        break;
      }
    }
  } else {
    document.getElementById('gTitle').value = '';
    document.getElementById('gGrand').checked = false;
  }
}

function addCustomGoal(){
  var title = (document.getElementById('gTitle') || {}).value;
  var date = (document.getElementById('gDate') || {}).value;
  var isGrand = (document.getElementById('gGrand') || {}).checked;
  var templateId = (document.getElementById('gTemplate') || {}).value;
  title = title ? title.trim() : '';
  if(!title || !date){ showToast('Заполни название и дату', true); return; }
  var milestones = [];
  if(templateId && templateId !== 'none'){
    for(var i = 0; i < GRAND_GOALS_TEMPLATES.length; i++){
      if(GRAND_GOALS_TEMPLATES[i].id === templateId){
        var tpl = GRAND_GOALS_TEMPLATES[i];
        for(var j = 0; j < tpl.milestones.length; j++){
          milestones.push({text: tpl.milestones[j], done: false});
        }
        break;
      }
    }
  }
  if(!state.goals) state.goals = [];
  state.goals.push({
    title: title,
    deadline: date,
    created: dateKey(new Date()),
    completed: false,
    isGrand: isGrand,
    milestones: milestones,
    templateId: templateId && templateId !== 'none' ? templateId : null
  });
  save();
  document.getElementById('gTitle').value = '';
  document.getElementById('gDate').value = '';
  document.getElementById('gTemplate').value = 'none';
  document.getElementById('gGrand').checked = false;
  render();
  showToast('🎯 Цель создана!');
}

function completeGoal(i){
  if(!state.goals || !state.goals[i]) return;
  if(state.goals[i].completed) return;
  state.goals[i].completed = true;
  state.goalsCompleted = (state.goalsCompleted || 0) + 1;
  var bonus = state.goals[i].isGrand ? 1000 : 500;
  state.xp += bonus;
  showToast('🏆 Цель достигнута! +' + bonus + ' XP');
  if(state.sound) achSound();
  save();
  render();
  checkAchievements();
}

function deleteGoal(i){
  if(!confirm('Удалить цель?')) return;
  if(!state.goals) return;
  state.goals.splice(i, 1);
  save();
  render();
}

function toggleMilestone(gi, mi){
  if(!state.goals || !state.goals[gi]) return;
  if(!state.goals[gi].milestones || !state.goals[gi].milestones[mi]) return;
  var m = state.goals[gi].milestones[mi];
  m.done = !m.done;
  if(m.done){
    state.xp += 30;
    state.milestonesCompleted = (state.milestonesCompleted || 0) + 1;
    showToast('✅ Шаг: +30 XP');
    if(state.sound) beep();
  } else {
    state.xp = Math.max(0, state.xp - 30);
    state.milestonesCompleted = Math.max(0, (state.milestonesCompleted || 0) - 1);
    showToast('−30 XP');
  }
  save();
  render();
  checkAchievements();
}

/* ============================================================
   RENDER: Привычки
   ============================================================ */
function renderHabits(){
  var c = document.getElementById('habitsContainer');
  if(!c) return;
  var today = dateKey(new Date());
  var todayLog = state.habits.log[today] || {};
  var days = [];
  for(var d = 6; d >= 0; d--){
    var dd = new Date(Date.now() - d * 86400000);
    days.push(dateKey(dd));
  }
  var h = '<div class="habit-table-wrap">';
  /* Header с датами */
  h += '<div class="habit-header"><div class="habit-name-col">Привычка</div>';
  for(var dh = 0; dh < days.length; dh++){
    var dayNum = days[dh].split('-')[2];
    h += '<div class="habit-day-col">' + dayNum + '</div>';
  }
  h += '</div>';

  for(var i = 0; i < state.habits.list.length; i++){
    var habit = state.habits.list[i];
    h += '<div class="habit-row">';
    h += '<div class="habit-name-col">' + escapeHtml(habit.name) + '</div>';
    for(var di = 0; di < days.length; di++){
      var dk = days[di];
      var log = state.habits.log[dk] || {};
      var done = log[habit.id];
      var isToday = dk === today;
      h += '<div class="habit-day-col"><button class="habit-cell' + (done ? ' done' : '') + (isToday ? ' today' : '') + '" ' + (isToday ? 'onclick="toggleHabitToday(\'' + habit.id + '\')"' : 'disabled') + '>' + (done ? '✓' : '') + '</button></div>';
    }
    h += '</div>';
  }
  h += '</div>';

  h += '<div class="habit-add-row">' +
    '<input class="plan-input" id="habitName" placeholder="Новая привычка" maxlength="30">' +
    '<button class="mini-btn purple" onclick="addHabit()">➕</button>' +
    '</div>';

  c.innerHTML = h;
}

/* ============================================================
   RENDER: Журнал тела
   ============================================================ */
function renderBody(){
  var c = document.getElementById('bodyContainer');
  if(!c) return;
  var h = '<div class="plan-section">' +
    '<div class="plan-title">⚖️ Запиши вес</div>' +
    '<div class="input-row">' +
    '<input class="plan-input" type="number" step="0.1" id="bodyWeight" placeholder="Вес (кг)">' +
    '<input class="plan-input" type="number" step="0.1" id="bodyWaist" placeholder="Обхват (см)">' +
    '</div>' +
    '<button class="btn-block primary" onclick="addBodyLog()">➕ Добавить</button>' +
    '</div>';

  if(state.bodyLog && state.bodyLog.length){
    var recent = state.bodyLog.slice().reverse().slice(0, 10);
    h += '<div class="section-title">Последние записи</div>';
    for(var i = 0; i < recent.length; i++){
      var entry = recent[i];
      h += '<div class="log-item">' +
        '<div class="log-date">' + entry.date + '</div>' +
        '<div class="log-value">' + entry.weight + ' кг' + (entry.waist ? ' · ' + entry.waist + ' см' : '') + '</div>' +
        '<button class="mini-btn danger" style="flex:0;padding:6px 10px;" onclick="removeBodyLog(' + (state.bodyLog.length - 1 - i) + ')">✖</button>' +
        '</div>';
    }
    /* Динамика */
    if(state.bodyLog.length >= 2){
      var first = state.bodyLog[0].weight;
      var last = state.bodyLog[state.bodyLog.length - 1].weight;
      var diff = (last - first).toFixed(1);
      var sign = diff > 0 ? '+' : '';
      var color = diff > 0 ? '#f5576c' : '#4cd964';
      h += '<div class="log-diff" style="color:' + color + ';">Изменение: ' + sign + diff + ' кг</div>';
    }
  } else {
    h += '<div class="empty-state">Начни отслеживать своё тело</div>';
  }
  c.innerHTML = h;
}

/* ============================================================
   RENDER: Финансы
   ============================================================ */
function renderFinance(){
  var c = document.getElementById('financeContainer');
  if(!c) return;
  var total = 0;
  if(state.financeLog) for(var i = 0; i < state.financeLog.length; i++) total += state.financeLog[i].amount;
  var h = '<div class="plan-section">' +
    '<div class="plan-title">💰 Финансы</div>' +
    '<div class="finance-total">Всего записей: <b>' + (state.financeLog ? state.financeLog.length : 0) + '</b> · Сумма: <b>' + total.toFixed(0) + ' ₽</b></div>' +
    (state.financeGoal ? '<div class="finance-goal">🎯 Цель: ' + state.financeGoal + ' ₽</div>' : '') +
    '</div>';

  h += '<div class="plan-section">' +
    '<div class="plan-title">➕ Новая запись</div>' +
    '<div class="input-row">' +
    '<input class="plan-input" type="number" id="finAmount" placeholder="Сумма">' +
    '<select class="plan-input" id="finCat" style="max-width:130px;">' +
    '<option value="Еда">Еда</option>' +
    '<option value="Транспорт">Транспорт</option>' +
    '<option value="Развлечения">Развлечения</option>' +
    '<option value="Одежда">Одежда</option>' +
    '<option value="Здоровье">Здоровье</option>' +
    '<option value="Дом">Дом</option>' +
    '<option value="Прочее">Прочее</option>' +
    '</select>' +
    '</div>' +
    '<input class="plan-input" id="finComment" placeholder="Комментарий (необязательно)">' +
    '<button class="btn-block primary" onclick="addFinanceLog()">➕ Добавить</button>' +
    '<div class="input-row" style="margin-top:10px;">' +
    '<input class="plan-input" type="number" id="finGoal" placeholder="Цель накоплений" value="' + (state.financeGoal || '') + '">' +
    '<button class="mini-btn purple" onclick="setFinanceGoal()">🎯</button>' +
    '</div>' +
    '</div>';

  if(state.financeLog && state.financeLog.length){
    h += '<div class="section-title">Последние</div>';
    var recent = state.financeLog.slice().reverse().slice(0, 10);
    for(var j = 0; j < recent.length; j++){
      var e = recent[j];
      h += '<div class="log-item">' +
        '<div class="log-date">' + e.date + '</div>' +
        '<div class="log-value">' + e.amount + ' ₽ · ' + e.cat + (e.comment ? ' · ' + escapeHtml(e.comment) : '') + '</div>' +
        '<button class="mini-btn danger" style="flex:0;padding:6px 10px;" onclick="removeFinanceLog(' + (state.financeLog.length - 1 - j) + ')">✖</button>' +
        '</div>';
    }
  }
  c.innerHTML = h;
}

/* ============================================================
   RENDER: Аналитика
   ============================================================ */
function renderAnalytics(){
  var c = document.getElementById('analyticsContainer');
  if(!c) return;
  var insights = analyzeCorrelations();
  var h = '';
  if(!insights || !insights.length){
    h += '<div class="empty-state"><div class="empty-state-icon">📊</div>Отмечай настроение 5+ дней, чтобы увидеть инсайты</div>';
  } else {
    for(var i = 0; i < insights.length; i++){
      var ins = insights[i];
      h += '<div class="insight-card"><div class="insight-icon">' + ins.icon + '</div><div class="insight-text">' + ins.text + '</div></div>';
    }
  }
  /* Категорийная статистика */
  var cats = state.categoryStats || {};
  var total = 0;
  for(var k in cats) if(cats.hasOwnProperty(k)) total += cats[k];
  if(total > 0){
    h += '<div class="section-title">По категориям</div>';
    var catNames = {disc:'⚔️ Дисциплина', breath:'🌬️ Дыхание', body:'💪 Тело', mind:'🧠 Разум', spirit:'✨ Дух', health:'💚 Здоровье'};
    for(var cat in catNames){
      if(!cats.hasOwnProperty(cat)) continue;
      var pct = (cats[cat] / total * 100).toFixed(0);
      h += '<div class="cat-stat">' +
        '<div class="cat-stat-name">' + catNames[cat] + '</div>' +
        '<div class="cat-stat-bar"><div class="cat-stat-fill" style="width:' + pct + '%"></div></div>' +
        '<div class="cat-stat-value">' + cats[cat] + ' (' + pct + '%)</div>' +
        '</div>';
    }
  }
  c.innerHTML = h;
}

/* ============================================================
   RENDER: Цитата дня
   ============================================================ */
function renderQuote(){
  var c = document.getElementById('quoteContainer');
  if(!c) return;
  var idx = (state.currentQuoteIndex || 0) % QUOTES.length;
  var q = QUOTES[idx];
  c.innerHTML = '<div class="quote-card">' +
    '<div class="quote-icon">💭</div>' +
    '<div class="quote-text">«' + q.q + '»</div>' +
    '<div class="quote-author">— ' + q.a + '</div>' +
    '<button class="mini-btn purple" style="margin-top:14px;" onclick="nextQuote()">🔄 Другая цитата</button>' +
    '</div>';
}

function nextQuote(){
  state.currentQuoteIndex = ((state.currentQuoteIndex || 0) + 1) % QUOTES.length;
  save();
  renderQuote();
}

/* ============================================================
   RENDER: ДНК
   ============================================================ */
function renderDNA(){
  var w = document.getElementById('dnaWrap');
  if(!w) return;
  var cells = '';
  var today = dateKey(new Date());
  for(var i = 89; i >= 0; i--){
    var d = new Date(Date.now() - i * 86400000);
    var k = dateKey(d);
    var xp = state.history[k] || 0;
    var level = 0;
    if(xp >= 100) level = 4;
    else if(xp >= 60) level = 3;
    else if(xp >= 30) level = 2;
    else if(xp > 0) level = 1;
    var cls = 'dna-cell';
    if(level > 0) cls += ' level-' + level;
    if(k === today) cls += ' today';
    cells += '<div class="' + cls + '"></div>';
  }
  w.innerHTML = '<div class="dna-title">90 дней твоего пути</div><div class="dna-grid">' + cells + '</div>' +
    '<div class="dna-legend">' +
    '<span><span class="dot" style="background:rgba(79,172,254,0.35);"></span>1-29</span>' +
    '<span><span class="dot" style="background:rgba(139,124,255,0.55);"></span>30-59</span>' +
    '<span><span class="dot" style="background:rgba(240,147,251,0.75);"></span>60-99</span>' +
    '<span><span class="dot" style="background:linear-gradient(135deg,#ffd166,#f5576c);"></span>100+</span>' +
    '</div>';
}

/* ============================================================
   RENDER: Путь
   ============================================================ */
function renderPath(){
  var c = document.getElementById('pathContainer');
  if(!c) return;
  var h = '';
  for(var i = 0; i < AWAKENING_PATH.length; i++){
    var s = AWAKENING_PATH[i], n = i + 1;
    var isC = state.currentPathStep >= n;
    var isCur = state.currentPathStep === i;
    var isL = state.currentPathStep < i;
    var cls = 'path-step';
    if(isC) cls += ' completed';
    if(isCur) cls += ' current';
    if(isL) cls += ' locked';
    var reqs = '';
    for(var j = 0; j < s.reqs.length; j++){
      var r = s.reqs[j], done = false, current = '';
      if(r.type === 'totalDone'){ done = state.totalDone >= r.value; current = state.totalDone + ' / ' + r.value; }
      if(r.type === 'streak'){ done = state.maxStreak >= r.value; current = state.maxStreak + ' / ' + r.value; }
      if(r.type === 'cat'){ var cc = countCat(state, r.cat); done = cc >= r.value; current = cc + ' / ' + r.value; }
      if(r.type === 'askesis'){ var c2 = (state.askesis || []).filter(function(a){return a.completed;}).length; done = c2 >= r.value; current = c2 + ' / ' + r.value; }
      if(r.type === 'barrier'){ done = (state.barriersCleared || 0) >= r.value; current = (state.barriersCleared || 0) + ' / ' + r.value; }
      reqs += '<div class="path-req ' + (done ? 'done' : 'pending') + '"><span>' + (done ? '✅' : '⏳') + ' ' + r.label + '</span><span>' + current + '</span></div>';
    }
    h += '<div class="' + cls + '"><div class="path-header"><div class="path-num">' + s.icon + '</div>' +
      '<div style="flex:1;"><div class="path-title">Ступень ' + n + ': ' + s.title + '</div>' +
      '<div class="path-subtitle">' + s.subtitle + '</div></div></div>' +
      '<div class="path-desc">' + s.desc + '</div>' +
      (isCur || !isC ? '<div class="path-reqs">' + reqs + '</div>' : '') +
      '</div>';
  }
  c.innerHTML = h;
}

/* ============================================================
   RENDER: Практики
   ============================================================ */
function renderPractices(){
  var c = document.getElementById('practicesContainer');
  if(!c) return;
  var lvl = getLevel(state.xp);
  var cats = [
    {key:'disc', title:'⚔️ Дисциплина'},
    {key:'breath', title:'🌬️ Дыхание'},
    {key:'body', title:'💪 Тело'},
    {key:'mind', title:'🧠 Разум'},
    {key:'spirit', title:'✨ Дух'},
    {key:'health', title:'💚 Здоровье'}
  ];
  var h = '', all = getAllPractices();
  for(var ci = 0; ci < cats.length; ci++){
    var cat = cats[ci];
    var list = [];
    for(var k = 0; k < all.length; k++) if(all[k].cat === cat.key) list.push(all[k]);
    if(!list.length) continue;
    h += '<div class="section-title">' + cat.title + '</div>';
    for(var i = 0; i < list.length; i++){
      var p = list[i], tier = getTier(p.id);
      var tiers = p.tiers || [{name:p.desc || '', xp:p.xp || 15, lvl:0}];
      var td = tiers[tier - 1] || tiers[0];
      var locked = lvl < (td.lvl || 0);
      var done = state.todayDone.indexOf(p.id) >= 0;
      var mastered = tier >= tiers.length && countPractice(p.id) >= 25;
      var dots = '';
      for(var t = 0; t < tiers.length; t++) dots += '<div class="tier-dot ' + (t < tier ? 'filled' : '') + '"></div>';
      h += '<div class="practice ' + (done ? 'done' : '') + ' ' + (locked ? 'locked' : '') + ' ' + (mastered ? 'mastered' : '') + '">' +
        '<div class="practice-row" onclick="handlePracticeClick(\'' + p.id + '\')">' +
        '<div class="practice-icon icon-' + p.cat + '">' + p.icon + '</div>' +
        '<div class="practice-info">' +
        '<div class="practice-name">' + p.name + (mastered ? ' <span class="badge gold">MAX</span>' : '') + '</div>' +
        '<div class="practice-desc">' + (td.name || '') + '</div>' +
        '<div class="practice-meta"><span class="badge">Ур. ' + tier + '/' + tiers.length + '</span>' +
        (locked ? '<span class="badge blue">Откр. Ур. ' + (td.lvl + 1) + '</span>' : '') + '</div>' +
        '<div class="practice-tiers">' + dots + '</div></div>' +
        '<div class="practice-xp">+' + Math.round((td.xp || 15) * getTotalMultiplier(p.cat)) + '</div>' +
        '</div>' +
        '<div class="practice-actions">' +
        '<button class="p-btn downgrade" ' + (tier <= 1 ? 'disabled' : '') + ' onclick="event.stopPropagation(); changeTier(\'' + p.id + '\', -1)">▼ Ниже</button>' +
        '<button class="p-btn upgrade" ' + (tier >= tiers.length ? 'disabled' : '') + ' onclick="event.stopPropagation(); changeTier(\'' + p.id + '\', 1)">▲ Выше</button>' +
        '<button class="p-btn info" onclick="event.stopPropagation(); showPracticeInfo(\'' + p.id + '\')">ℹ</button>' +
        '</div></div>';
    }
  }
  c.innerHTML = h;
}

function handlePracticeClick(id){
  var p = null, all = getAllPractices();
  for(var i = 0; i < all.length; i++) if(all[i].id === id) p = all[i];
  if(!p) return;
  var tier = getTier(id);
  var tiers = p.tiers || [{name:p.desc, xp:p.xp, breath:p.breath}];
  var td = tiers[tier - 1] || tiers[0];
  var xp = td.xp || 15;
  var breath = td.breath || p.breath;
  if(breath){ openBreath(breath, id, xp); return; }
  if(state.todayDone.indexOf(id) >= 0){
    state.todayDone = state.todayDone.filter(function(x){ return x !== id; });
    var mult = getTotalMultiplier(p.cat);
    state.xp = Math.max(0, state.xp - Math.round(xp * mult));
    state.totalDone = Math.max(0, state.totalDone - 1);
    if(state.completionCounter[id]) state.completionCounter[id]--;
    save();
    render();
    showToast('−' + Math.round(xp * mult) + ' XP');
  } else {
    state.todayDone.push(id);
    completePractice(id, xp);
    render();
  }
}

function changeTier(id, delta){
  var p = null, all = getAllPractices();
  for(var i = 0; i < all.length; i++) if(all[i].id === id) p = all[i];
  if(!p || !p.tiers) return;
  var cur = getTier(id);
  var newT = Math.max(1, Math.min(p.tiers.length, cur + delta));
  if(newT === cur) return;
  if(!state.practiceTiers) state.practiceTiers = {};
  state.practiceTiers[id] = newT;
  state.todayDone = state.todayDone.filter(function(x){ return x !== id; });
  save();
  render();
  showToast('Уровень: ' + newT + ' / ' + p.tiers.length);
  if(newT === p.tiers.length) checkAchievements();
}

function showPracticeInfo(id){
  var p = null, all = getAllPractices();
  for(var i = 0; i < all.length; i++) if(all[i].id === id) p = all[i];
  if(!p) return;
  document.getElementById('infoTitle').textContent = p.icon + ' ' + p.name;
  var tiers = p.tiers || [], h = '';
  for(var j = 0; j < tiers.length; j++){
    var t = tiers[j], reached = j + 1 <= getTier(id);
    h += '<div style="margin-bottom:10px;padding:12px;background:rgba(255,255,255,0.04);border-radius:12px;border-left:3px solid ' + (reached ? '#4cd964' : 'rgba(245,241,255,0.3)') + ';">' +
      '<b style="color:' + (reached ? '#4cd964' : '#4facfe') + ';">Уровень ' + (j + 1) + ':</b> ' + t.name + '<br>' +
      '<span style="font-size:11.5px;color:var(--text-soft);">+' + t.xp + ' XP</span></div>';
  }
  document.getElementById('infoBody').innerHTML = h;
  document.getElementById('infoModal').classList.add('active');
}

/* ============================================================
   RENDER: Квесты
   ============================================================ */
function renderQuests(){
  var c = document.getElementById('questsContainer');
  if(!c) return;
  var dq = state.dailyQuests;
  if(!dq || !dq.list.length) return;
  var h = '';
  for(var i = 0; i < dq.list.length; i++){
    var qid = dq.list[i];
    var q = null;
    for(var j = 0; j < QUEST_POOL.length; j++) if(QUEST_POOL[j].id === qid) q = QUEST_POOL[j];
    if(!q) continue;
    var done = dq.completed.indexOf(qid) >= 0;
    h += '<div class="quest ' + (done ? 'done' : '') + '">' +
      '<div class="quest-icon">' + (done ? '✅' : q.icon) + '</div>' +
      '<div class="quest-info"><div class="quest-name">' + q.name + '</div>' +
      '<div class="quest-desc">' + q.desc + '</div></div>' +
      '<div class="quest-reward">+' + q.reward + '</div></div>';
  }
  c.innerHTML = h;
  var pt = document.getElementById('phaseText');
  if(pt){
    var step = AWAKENING_PATH[state.currentPathStep] || AWAKENING_PATH[0];
    pt.textContent = 'Ступень ' + state.currentPathStep + ': ' + step.title + ' · ' + step.subtitle;
  }
}

/* ============================================================
   RENDER: Преграды
   ============================================================ */
function renderBarriers(){
  var c = document.getElementById('barriersContainer');
  if(!c) return;
  var h = '', prevCleared = true;
  for(var i = 0; i < BARRIERS.length; i++){
    var b = BARRIERS[i];
    var cleared = isBarrierCleared(b.id);
    var prog = calculateBarrierProgress(b.id);
    var isActive = !cleared && prevCleared;
    var isLocked = !cleared && !isActive;
    var cls = 'barrier-card';
    if(cleared) cls += ' cleared';
    else if(isActive) cls += ' active';
    else if(isLocked) cls += ' locked';
    var status = cleared ? '✨ Пройдена' : (isActive ? '🔥 Активна' : '🔒 Закрыта');
    var progT = cleared ? '100%' : Math.round(prog) + '%';
    h += '<div class="' + cls + '"><div class="barrier-head">' +
      '<div class="barrier-icon">' + b.icon + '</div>' +
      '<div class="barrier-info"><div class="barrier-name">' + b.name + '</div>' +
      '<div class="barrier-tag">' + b.tag + ' · ' + status + '</div></div></div>' +
      '<div class="barrier-desc">' + b.desc + '</div>' +
      '<div class="barrier-progress-bar"><div class="barrier-progress-fill" style="width:' + prog + '%"></div></div>' +
      '<div class="barrier-progress-text"><span>Прогресс</span><span>' + progT + '</span></div>' +
      '<div class="barrier-hint"><b>Как преодолеть:</b> ' + b.hint + '</div></div>';
    prevCleared = cleared;
  }
  c.innerHTML = h;
}

/* ============================================================
   RENDER: Настроение
   ============================================================ */
var MOODS = [
  {e:'🔥', n:'Энергия'}, {e:'😊', n:'Хорошо'}, {e:'😐', n:'Норма'},
  {e:'😔', n:'Грусть'}, {e:'😰', n:'Тревога'}, {e:'😤', n:'Злость'},
  {e:'😴', n:'Усталость'}
];

function renderMood(){
  var c = document.getElementById('moodContainer');
  if(!c) return;
  var today = dateKey(new Date());
  var currentMood = state.moods && state.moods[today];
  var h = '<div class="section-title" style="margin-top:0;">Как ты сегодня?</div>';
  h += '<div class="mood-row">';
  for(var i = 0; i < MOODS.length; i++){
    h += '<div class="mood-btn ' + (currentMood === MOODS[i].e ? 'selected' : '') + '" onclick="setMood(\'' + MOODS[i].e + '\')">' + MOODS[i].e + '</div>';
  }
  h += '</div>';
  if(currentMood){
    h += '<div style="text-align:center;color:var(--text-dim);font-size:13px;margin-bottom:14px;">Сегодня: ' + currentMood + ' ' + getMoodName(currentMood) + '</div>';
  }
  var keys = Object.keys(state.moods || {}).sort().slice(-14);
  if(keys.length){
    h += '<div class="mood-history">';
    for(var k = keys.length - 1; k >= 0; k--){
      h += '<div class="mood-dot">' + (state.moods[keys[k]] || '') + '</div>';
    }
    h += '</div>';
  }
  c.innerHTML = h;
}

function getMoodName(e){
  for(var i = 0; i < MOODS.length; i++) if(MOODS[i].e === e) return MOODS[i].n;
  return '';
}

function setMood(e){
  if(!state.moods) state.moods = {};
  var today = dateKey(new Date());
  if(state.moods[today] === e) delete state.moods[today];
  else state.moods[today] = e;
  save();
  render();
  checkAchievements();
}

/* ============================================================
   RENDER: Здоровье
   ============================================================ */
function renderHealth(){
  var c = document.getElementById('healthContainer');
  if(!c) return;
  var h = '';
  for(var ci = 0; ci < HEALTH_BASE.length; ci++){
    var cat = HEALTH_BASE[ci];
    var parts = cat.cat.split(' ');
    var emoji = parts[0], name = parts.slice(1).join(' ');
    h += '<div class="health-cat" id="hc-' + ci + '">' +
      '<div class="health-header" onclick="toggleHealth(' + ci + ')">' +
      '<div class="health-title"><div class="health-icon" style="background:linear-gradient(135deg,#8b7cff,#f093fb);">' + emoji + '</div><span>' + name + '</span></div>' +
      '<span class="health-arrow">›</span></div>' +
      '<div class="health-body">';
    for(var ii = 0; ii < cat.items.length; ii++){
      var item = cat.items[ii];
      h += '<div class="health-item">' +
        '<div class="health-item-title">' + item.name + '</div>' +
        '<div class="health-item-what">' + item.what + '</div>' +
        '<div class="health-mechanism"><b>Как работает</b>' + item.mechanism + '</div>' +
        '<div class="health-steps"><b>План</b>';
      for(var s = 0; s < item.steps.length; s++) h += '<div class="health-step">' + item.steps[s] + '</div>';
      h += '</div>' + (item.when ? '<div class="health-when"><b>⏰ Сроки:</b> ' + item.when + '</div>' : '') + '</div>';
    }
    h += '</div></div>';
  }
  c.innerHTML = h;
}

function toggleHealth(i){
  var el = document.getElementById('hc-' + i);
  if(el) el.classList.toggle('open');
}

function filterHealth(q){
  var query = q.toLowerCase().trim();
  for(var ci = 0; ci < HEALTH_BASE.length; ci++){
    var el = document.getElementById('hc-' + ci);
    if(!el) continue;
    if(!query){ el.style.display = ''; el.classList.remove('open'); continue; }
    var cat = HEALTH_BASE[ci], has = false;
    for(var i = 0; i < cat.items.length; i++){
      var item = cat.items[i];
      if(item.name.toLowerCase().indexOf(query) >= 0) has = true;
      else if(item.what.toLowerCase().indexOf(query) >= 0) has = true;
      else if(item.mechanism.toLowerCase().indexOf(query) >= 0) has = true;
      if(has) break;
    }
    el.style.display = has ? '' : 'none';
    if(has) el.classList.add('open');
  }
}

/* ============================================================
   RENDER: Аскезы
   ============================================================ */
function renderAskesis(){
  var c = document.getElementById('askesisActive');
  if(!c) return;
  var active = (state.askesis || []).filter(function(a){ return !a.completed && !a.failed; });
  var h = '';
  if(active.length){
    for(var i = 0; i < active.length; i++){
      var a = active[i], days = a.days || [];
      var prog = Math.min(100, days.length / a.targetDays * 100);
      var today = dateKey(new Date());
      var marked = days.indexOf(today) >= 0;
      h += '<div class="askesis-card">' +
        '<div class="askesis-head"><div class="askesis-name">' + a.name + '</div>' +
        '<div class="askesis-days">' + days.length + ' / ' + a.targetDays + ' · +' + a.xp + '</div></div>' +
        '<div class="progress-bar"><div class="progress-fill" style="width:' + prog + '%"></div></div>' +
        '<div class="askesis-actions">' +
        '<button class="mini-btn ' + (marked ? 'gold' : 'green') + '" onclick="markAskesisDay(\'' + a.id + '\')">' + (marked ? '✅ Отмечено' : '✅ Отметить') + '</button>' +
        '<button class="mini-btn danger" onclick="failAskesis(\'' + a.id + '\')">✖ Провал</button>' +
        '</div></div>';
    }
  } else h = '<div class="empty-state"><div class="empty-state-icon">🔥</div>Нет активных аскез.</div>';
  c.innerHTML = h;

  var c2 = document.getElementById('askesisAvailable');
  if(!c2) return;
  var usedIds = (state.askesis || []).map(function(a){ return a.id; });
  var ah = '';
  for(var j = 0; j < ASKESIS.length; j++){
    var ask = ASKESIS[j];
    if(usedIds.indexOf(ask.id) >= 0) continue;
    ah += '<div class="askesis-card">' +
      '<div class="askesis-head"><div class="askesis-name">' + ask.name + '</div>' +
      '<div class="askesis-days">' + ask.targetDays + ' дн · +' + ask.xp + '</div></div>' +
      '<button class="mini-btn purple" style="margin-top:8px;" onclick="startAskesis(\'' + ask.id + '\')">▶ Начать</button></div>';
  }
  var fin = (state.askesis || []).filter(function(a){ return a.completed || a.failed; });
  for(var k = 0; k < fin.length; k++){
    var f = fin[k];
    ah += '<div class="askesis-card" style="opacity:0.55;">' +
      '<div class="askesis-head"><div class="askesis-name">' + f.name + '</div>' +
      '<div class="askesis-days">' + (f.completed ? '✅ Завершено' : '❌ Провалено') + '</div></div></div>';
  }
  c2.innerHTML = ah;
}

function startAskesis(id){
  var a = null;
  for(var i = 0; i < ASKESIS.length; i++) if(ASKESIS[i].id === id) a = ASKESIS[i];
  if(!a) return;
  if(!state.askesis) state.askesis = [];
  state.askesis.push({
    id: a.id, name: a.name, targetDays: a.targetDays, xp: a.xp,
    days: [], completed: false, failed: false, startedAt: dateKey(new Date())
  });
  save(); render();
  showToast('Аскеза начата! 🔥');
}

function markAskesisDay(id){
  var a = null;
  for(var i = 0; i < (state.askesis || []).length; i++) if(state.askesis[i].id === id) a = state.askesis[i];
  if(!a || a.completed || a.failed) return;
  var today = dateKey(new Date());
  if(a.days.indexOf(today) >= 0){ showToast('Уже отмечено'); return; }
  a.days.push(today);
  if(a.days.length >= a.targetDays){
    a.completed = true;
    state.xp += a.xp;
    showToast('🏆 Аскеза пройдена! +' + a.xp + ' XP');
    checkAchievements();
    checkPath();
  } else showToast('День ' + a.days.length + ' / ' + a.targetDays + ' ✅');
  save(); render();
}

function failAskesis(id){
  if(!confirm('Провалить аскезу?')) return;
  var a = null;
  for(var i = 0; i < (state.askesis || []).length; i++) if(state.askesis[i].id === id) a = state.askesis[i];
  if(!a) return;
  a.failed = true;
  save(); render();
}

/* ============================================================
   RENDER: База знаний
   ============================================================ */
function renderKnowledge(){
  var c = document.getElementById('knowledgeContainer');
  if(!c) return;
  var h = '';
  for(var ci = 0; ci < KNOWLEDGE_BASE.length; ci++){
    var cat = KNOWLEDGE_BASE[ci];
    var parts = cat.cat.split(' ');
    var emoji = parts[0], name = parts.slice(1).join(' ');
    h += '<div class="health-cat" id="kc-' + ci + '">' +
      '<div class="health-header" onclick="toggleKb(' + ci + ')">' +
      '<div class="health-title"><div class="health-icon" style="background:linear-gradient(135deg,#4facfe,#8b7cff);">' + emoji + '</div><span>' + name + '</span></div>' +
      '<span class="health-arrow">›</span></div>' +
      '<div class="health-body">';
    for(var ii = 0; ii < cat.items.length; ii++){
      var item = cat.items[ii];
      h += '<div class="health-item">' +
        '<div class="health-item-title">' + item.name + '</div>' +
        '<div class="health-item-what">' + item.what + '</div>' +
        '<div class="health-steps"><b>Что даёт</b>';
      for(var b = 0; b < item.benefits.length; b++) h += '<div class="health-step">' + item.benefits[b] + '</div>';
      h += '</div><div class="health-mechanism"><b>Как делать</b>' + item.how + '</div>' +
        (item.when ? '<div class="health-when"><b>⏰ Когда:</b> ' + item.when + '</div>' : '') + '</div>';
    }
    h += '</div></div>';
  }
  c.innerHTML = h;
}

function toggleKb(i){
  var el = document.getElementById('kc-' + i);
  if(el) el.classList.toggle('open');
}

function filterKnowledge(q){
  var query = q.toLowerCase().trim();
  for(var ci = 0; ci < KNOWLEDGE_BASE.length; ci++){
    var el = document.getElementById('kc-' + ci);
    if(!el) continue;
    if(!query){ el.style.display = ''; el.classList.remove('open'); continue; }
    var cat = KNOWLEDGE_BASE[ci], has = false;
    for(var i = 0; i < cat.items.length; i++){
      var item = cat.items[i];
      if(item.name.toLowerCase().indexOf(query) >= 0) has = true;
      else if(item.what.toLowerCase().indexOf(query) >= 0) has = true;
      else if(item.how.toLowerCase().indexOf(query) >= 0) has = true;
      else { for(var b = 0; b < item.benefits.length; b++) if(item.benefits[b].toLowerCase().indexOf(query) >= 0){ has = true; break; } }
      if(has) break;
    }
    el.style.display = has ? '' : 'none';
    if(has) el.classList.add('open');
  }
}

/* ============================================================
   RENDER: Прогресс
   ============================================================ */
function renderProgress(){
  var chart = document.getElementById('chart');
  if(chart){
    var days = [];
    for(var i = 13; i >= 0; i--){
      var d = new Date(Date.now() - i * 86400000);
      days.push({key: dateKey(d), label: d.getDate()});
    }
    var maxXp = 50;
    for(var j = 0; j < days.length; j++){
      var v = state.history[days[j].key] || 0;
      if(v > maxXp) maxXp = v;
    }
    var ch = '';
    for(var k = 0; k < days.length; k++){
      var val = state.history[days[k].key] || 0;
      var hh = (val / maxXp) * 100;
      ch += '<div class="bar-wrap"><div class="bar" style="height:' + hh + '%"></div><div class="bar-label">' + days[k].label + '</div></div>';
    }
    chart.innerHTML = ch;
  }

  var cal = document.getElementById('calendar');
  if(cal){
    var now = new Date();
    var year = now.getFullYear(), month = now.getMonth();
    var firstDay = new Date(year, month, 1);
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var offset = (firstDay.getDay() + 6) % 7;
    var calH = '';
    for(var o = 0; o < offset; o++) calH += '<div class="cal-day empty"></div>';
    for(var dd = 1; dd <= daysInMonth; dd++){
      var key = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(dd).padStart(2, '0');
      var has = (state.history[key] || 0) > 0;
      var isToday = key === dateKey(new Date());
      calH += '<div class="cal-day ' + (has ? 'has' : '') + ' ' + (isToday ? 'today' : '') + '">' + dd + '</div>';
    }
    cal.innerHTML = calH;
  }

  var dXp = document.getElementById('detailXp');
  if(dXp) dXp.textContent = state.xp;
  var dStr = document.getElementById('detailStreak');
  if(dStr) dStr.textContent = state.maxStreak;
  var dDone = document.getElementById('detailDone');
  if(dDone) dDone.textContent = state.totalDone;
  var dAch = document.getElementById('detailAch');
  if(dAch) dAch.textContent = state.achievements.length + ' / ' + ACHIEVEMENTS.length;
  var dBar = document.getElementById('detailBarriers');
  if(dBar) dBar.textContent = (state.barriersCleared || 0) + ' / ' + BARRIERS.length;
  var dGoals = document.getElementById('detailGoals');
  if(dGoals) dGoals.textContent = (state.goalsCompleted || 0);
  var dCards = document.getElementById('detailCards');
  if(dCards) dCards.textContent = (state.cardsCompleted || 0);
  var dChests = document.getElementById('detailChests');
  if(dChests) dChests.textContent = (state.chestsOpened || 0);
  var dPet = document.getElementById('detailPet');
  if(dPet) dPet.textContent = 'Ур. ' + (state.petLevel || 0);
}

/* ============================================================
   RENDER: Достижения
   ============================================================ */
function renderAwards(){
  var c = document.getElementById('achGrid');
  if(!c) return;
  var h = '';
  for(var i = 0; i < ACHIEVEMENTS.length; i++){
    var a = ACHIEVEMENTS[i];
    var u = state.achievements.indexOf(a.id) >= 0;
    h += '<div class="ach ' + (u ? 'unlocked' : '') + '">' +
      '<div class="ach-icon">' + a.icon + '</div>' +
      '<div class="ach-name">' + a.name + '</div>' +
      '<div class="ach-desc">' + a.desc + '</div></div>';
  }
  c.innerHTML = h;
}

/* ============================================================
   RENDER: Своя практика
   ============================================================ */
function renderCustomList(){
  var c = document.getElementById('customList');
  if(!c) return;
  if(!state.customPractices || !state.customPractices.length){ c.innerHTML = ''; return; }
  var h = '';
  for(var i = 0; i < state.customPractices.length; i++){
    var p = state.customPractices[i];
    h += '<div class="setting"><span class="setting-label">' + p.icon + ' ' + p.name + '</span>' +
      '<button class="mini-btn danger" style="flex:0;padding:6px 12px;" onclick="removeCustom(\'' + p.id + '\')">✖</button></div>';
  }
  c.innerHTML = h;
}

/* ============================================================
   RENDER: Настройки
   ============================================================ */
function renderSettings(){
  var tp = document.getElementById('themePicker');
  if(tp){
    var themes = [
      {id:'dark', name:'Тёмная', c1:'#05040f', c2:'#8b7cff'},
      {id:'light', name:'Светлая', c1:'#f8f5ff', c2:'#8b7cff'},
      {id:'cosmic', name:'Космос', c1:'#0a0514', c2:'#ff6ec7'},
      {id:'zen', name:'Дзен', c1:'#0a1a14', c2:'#4ade80'}
    ];
    var th = '';
    for(var i = 0; i < themes.length; i++){
      var t = themes[i], sel = state.theme === t.id;
      th += '<div style="aspect-ratio:1;border-radius:16px;cursor:pointer;border:2px solid ' + (sel ? '#8b7cff' : 'transparent') + ';background:linear-gradient(135deg, ' + t.c1 + ', ' + t.c2 + ');display:flex;align-items:flex-end;justify-content:center;padding:8px;font-size:10.5px;font-weight:800;color:#fff;text-shadow:0 1px 6px rgba(0,0,0,0.7);' + (sel ? 'box-shadow:0 0 24px rgba(139,124,255,0.55);' : '') + '" onclick="setTheme(\'' + t.id + '\')">' + t.name + '</div>';
    }
    tp.innerHTML = th;
  }

  var fp = document.getElementById('fractalPicker');
  if(fp){
    var styles = [
      {id:'mixed', name:'Микс'}, {id:'koch', name:'Снежинки'},
      {id:'sierpinski', name:'Треугольники'}, {id:'pentagon', name:'Пятиугольники'},
      {id:'star', name:'Звёзды'}, {id:'hex', name:'Шестиугольники'},
      {id:'none', name:'Выкл'}
    ];
    var sh = '';
    for(var j = 0; j < styles.length; j++){
      var s = styles[j], sel2 = state.fractalStyle === s.id;
      sh += '<div style="text-align:center;font-size:12px;font-weight:800;padding:12px 8px;cursor:pointer;border-radius:14px;border:2px solid ' + (sel2 ? '#8b7cff' : 'var(--glass-border)') + ';background:' + (sel2 ? 'rgba(139,124,255,0.22)' : 'var(--glass)') + ';color:var(--text);" onclick="setFractalStyle(\'' + s.id + '\')">' + s.name + '</div>';
    }
    fp.innerHTML = sh;
  }

  var swS = document.getElementById('switchSound');
  if(swS) swS.classList.toggle('on', state.sound);
  var swN = document.getElementById('switchNotify');
  if(swN) swN.classList.toggle('on', state.notify);
}

function setTheme(t){ state.theme = t; save(); render(); showToast('Тема: ' + t); }
function setFractalStyle(s){ state.fractalStyle = s; currentFractalStyle = s; if(s === 'none' && ctx) ctx.clearRect(0, 0, W, H); save(); render(); showToast(s === 'none' ? 'Выключено' : 'Стиль изменён'); }
function toggleSound(){ state.sound = !state.sound; save(); render(); }
function toggleNotify(){ state.notify = !state.notify; if(state.notify && 'Notification' in window) Notification.requestPermission(); save(); render(); }

/* ============================================================
   СВОЯ ПРАКТИКА
   ============================================================ */
function addCustomPractice(){
  var nameEl = document.getElementById('newName');
  var catEl = document.getElementById('newCat');
  if(!nameEl || !catEl) return;
  var name = nameEl.value.trim();
  var cat = catEl.value;
  if(!name){ showToast('Введи название', true); return; }
  var icons = {disc:'⚔️', breath:'🌬️', body:'💪', mind:'🧠', spirit:'✨', health:'💚'};
  var bx = 15;
  if(!state.customPractices) state.customPractices = [];
  state.customPractices.push({
    id: 'custom_' + Date.now(),
    cat: cat, icon: icons[cat], name: name, custom: true,
    tiers: [
      {name:'Начальный', xp:bx, lvl:0},
      {name:'Уверенный', xp:bx*2, lvl:1},
      {name:'Продвинутый', xp:bx*3, lvl:2},
      {name:'Мастерский', xp:bx*5, lvl:4},
      {name:'Легендарный', xp:bx*8, lvl:6}
    ]
  });
  save();
  nameEl.value = '';
  render();
  showToast('Практика добавлена ✨');
}

function removeCustom(id){
  if(!confirm('Удалить?')) return;
  state.customPractices = state.customPractices.filter(function(p){ return p.id !== id; });
  save(); render();
}

/* ============================================================
   ЭКСПОРТ / ИМПОРТ
   ============================================================ */
function exportData(){
  var data = JSON.stringify(state, null, 2);
  var blob = new Blob([data], {type: 'application/json'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'put-' + dateKey(new Date()) + '.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importData(e){
  var file = e.target.files[0];
  if(!file) return;
  var reader = new FileReader();
  reader.onload = function(ev){
    try {
      var data = JSON.parse(ev.target.result);
      if(!confirm('Заменить прогресс?')) return;
      state = Object.assign({}, DEFAULT_STATE, data);
      if(!state.goals) state.goals = [];
      if(!state.moods) state.moods = {};
      if(!state.bodyLog) state.bodyLog = [];
      if(!state.financeLog) state.financeLog = [];
      if(!state.buildings) state.buildings = [];
      if(!state.habits) state.habits = {list:DEFAULT_HABITS.slice(), log:{}};
      save(); render();
      showToast('Импортировано ✅');
    } catch(err){ showToast('Ошибка', true); }
  };
  reader.readAsText(file);
}

function resetAll(){
  if(!confirm('Сбросить ВСЁ?')) return;
  localStorage.removeItem(STORAGE);
  location.reload();
}

/* ============================================================
   АВАТАР
   ============================================================ */
var AVATARS = ['🧘','🥷','🧙','⚔️','🐉','🦅','🐺','🦁','🔥','⚡','🌟','🌙','☯️','🌊','🏔','🛡','🦉','👑','💎','🎭','🗿','🕊','🐯','🌋','🐲','🦄','🦊','🐻','🐼','⚜️','🔮','👁️','✨','🕉️','☀️'];

function openAvatarPicker(){
  var p = document.getElementById('avatarPicker');
  if(!p) return;
  var h = '';
  for(var i = 0; i < AVATARS.length; i++){
    var a = AVATARS[i];
    h += '<div class="av-option ' + (a === state.avatar ? 'selected' : '') + '" onclick="setAvatar(\'' + a + '\')">' + a + '</div>';
  }
  p.innerHTML = h;
  document.getElementById('avatarModal').classList.add('active');
}

function setAvatar(a){ state.avatar = a; save(); render(); closeModal('avatarModal'); }

/* ============================================================
   ЗВУК
   ============================================================ */
var audioCtx;
function beep(){
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    var o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination); o.frequency.value = 880;
    g.gain.setValueAtTime(0.1, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    o.start(); o.stop(audioCtx.currentTime + 0.15);
  } catch(e){}
}
function achSound(){
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    var freqs = [523, 659, 784, 1047];
    for(var i = 0; i < freqs.length; i++){
      (function(f, idx){
        var o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.connect(g); g.connect(audioCtx.destination); o.frequency.value = f;
        var t = audioCtx.currentTime + idx * 0.1;
        g.gain.setValueAtTime(0.12, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        o.start(t); o.stop(t + 0.3);
      })(freqs[i], i);
    }
  } catch(e){}
}

function showToast(text, isErr){
  var t = document.getElementById('toast');
  if(!t) return;
  t.textContent = text;
  if(isErr) t.classList.add('error'); else t.classList.remove('error');
  t.classList.add('show');
  if(t._timeout) clearTimeout(t._timeout);
  t._timeout = setTimeout(function(){ t.classList.remove('show'); }, 2000);
}

/* ============================================================
   ДЫХАНИЕ
   ============================================================ */
var breathInterval = null, breathPattern = null, breathId = null, breathXp = 0;

function openBreath(type, id, xp){
  document.getElementById('breathModal').classList.add('active');
  breathPattern = type; breathId = id; breathXp = xp;
  var titles = {'478':'Дыхание 4-7-8', 'box':'Квадратное', 'wim':'Вима Хофа', 'alt':'Нади Шодхана'};
  document.getElementById('breathTitle').textContent = titles[type] || 'Дыхание';
  document.getElementById('breathCircle').textContent = 'Приготовься';
  document.getElementById('breathCircle').className = 'breath-circle';
  document.getElementById('breathPhase').textContent = 'Нажми «Начать»';
  document.getElementById('breathBtn').textContent = 'Начать';
  document.getElementById('breathBtn').onclick = startBreath;
}

function closeBreath(){
  if(breathInterval){ clearInterval(breathInterval); breathInterval = null; }
  closeModal('breathModal');
}

function startBreath(){
  if(breathInterval) clearInterval(breathInterval);
  var circle = document.getElementById('breathCircle');
  var phase = document.getElementById('breathPhase');
  var btn = document.getElementById('breathBtn');
  btn.textContent = 'Стоп';
  btn.onclick = function(){
    if(breathInterval){ clearInterval(breathInterval); breathInterval = null; }
    btn.textContent = 'Начать';
    btn.onclick = startBreath;
  };
  var patterns = {
    '478':[['Вдох',4,'inhale'],['Задержка',7,''],['Выдох',8,'exhale']],
    'box':[['Вдох',4,'inhale'],['Задержка',4,''],['Выдох',4,'exhale'],['Задержка',4,'']],
    'wim':[['Вдох',2,'inhale'],['Выдох',2,'exhale']],
    'alt':[['Вдох Л',4,'inhale'],['Задержка',4,''],['Выдох П',4,'exhale'],['Задержка',4,'']]
  };
  var cycles = patterns[breathPattern] || patterns['478'];
  var step = 0, secondsLeft = cycles[0][1], cycleCount = 0;
  var tick = function(){
    var c = cycles[step];
    circle.textContent = c[0] + ' ' + secondsLeft;
    circle.className = 'breath-circle ' + c[2];
    phase.textContent = 'Цикл ' + (cycleCount + 1);
    secondsLeft--;
    if(secondsLeft < 0){
      step++;
      if(step >= cycles.length){ step = 0; cycleCount++; }
      secondsLeft = cycles[step][1];
    }
    if(cycleCount >= 4 && state.todayDone.indexOf(breathId) < 0){
      state.todayDone.push(breathId);
      completePractice(breathId, breathXp);
      if(breathInterval){ clearInterval(breathInterval); breathInterval = null; }
      closeModal('breathModal');
      render();
    }
  };
,  tick();
  breathInterval = setInterval(t sick, 1000);
}

/* ========================================================= *===
   ФРАКТАЛЫ
   ========================================================= === */
var canvas = document.getElementById('fractalCanvas0');
var ctx = canvas ? canvas..getContext('2d', {alpha: true}) : null;
var W = 0, H = 0;
var currentFractalStyle = 'mixed';
var fTime = 0;
var fractalParticles = [];

function resizeCanvas(){
  if(!canvas) return;
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

for(var fi = 0; fi < 45; fi++){
  fractalParticles.push({
    x: Math.random(), y: Math.random(),
    size: 40 + Math.random() * 130,
    speed: 0.015 + Math.random() * 0.04,
    phase: Math.random() * Math.PI * 2,
    hue: Math.random() * 360,
    type: Math.floor(Math.random() * 5),
    alpha: 0.25 + Math.random() * 0.3
  });
}

function drawKoch(cx, cy, size, rot, hue, alpha){
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
  for(var i = 0; i < 6; i++){
    ctx.rotate(Math.PI / 3);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(size, 0);
    ctx.lineTo(size * 0.66, size * 0.35); ctx.lineTo(size * 0.33, -size * 0.15); ctx.closePath();
    ctx.strokeStyle = 'hsla(' + hue + ',80%,68%,' + alpha + ')'; ctx.lineWidth = 1.6; ctx.stroke();
  }
  ctx.restore();
}
function drawSierpinski(cx, cy, size, rot, hue, alpha){
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
  function tri(x, y, s, d){
    if(d === 0){
      ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x - s * 0.9, y + s * 0.7); ctx.lineTo(x + s * 0.9, y + s * 0.7); ctx.closePath();
      ctx.strokeStyle = 'hsla(' + hue + ',85%,68%,' + alpha + ')'; ctx.lineWidth = 1.3; ctx.stroke();
      return;
    }
    tri(x, y - s * 0.55, d - 1);
    tri(x - s * 0.5, y + s * 0.4, s * 0.5, d - 1);
    tri(x + s * 0.5, y + s * 0.4, s * 0.5, d - 1);
  }
  tri(0, 0, size, 3);
  ctx.restore();
}
function drawPentagon(cx, cy, size, rot, hue, alpha){
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
  for(var layer = 0; layer < 3; layer++){
    var s = size * (1 - layer * 0.25);
    ctx.beginPath();
    for(var i = 0; i <= 5; i++){
      var a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      var x = Math.cos(a) * s, y = Math.sin(a) * s;
      if(i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'hsla(' + (hue + layer * 25) + ',80%,70%,' + (alpha * (1 - layer * 0.22)) + ')';
    ctx.lineWidth = 1.5; ctx.stroke();
  }
  ctx.restore();
}
function drawStar(cx, cy, size, rot, hue, alpha){
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
  for(var layer = 0; layer < 2; layer++){
    var s = size * (1 - layer * 0.4);
    ctx.beginPath();
    for(var i = 0; i < 16; i++){
      var a = (i / 16) * Math.PI * 2 - Math.PI / 2;
      var r = i % 2 === 0 ? s : s * 0.42;
      var x = Math.cos(a) * r, y = Math.sin(a) * r;
      if(i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'hsla(' + (hue + layer * 35) + ',85%,72%,' + (alpha * (1 - layer * 0.28)) + ')';
    ctx.lineWidth = 1.5; ctx.stroke();
  }
  ctx.restore();
}
function drawHex(cx, cy, size, rot, hue, alpha){
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
  for(var layer = 0; layer < 3; layer++){
    var s = size * (1 - layer * 0.3);
    ctx.beginPath();
    for(var i = 0; i <= 6; i++){
      var a = (i / 6) * Math.PI * 2;
      var x = Math.cos(a) * s, y = Math.sin(a) * s;
      if(i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'hsla(' + (hue + layer * 20) + ',80%,70%,' + (alpha * (1 - layer * 0.22)) + ')';
    ctx.lineWidth = 1.6; ctx.stroke();
  }
  ctx.restore();
}

function animateFractals(){
  if(!ctx) return;
  fTime += 0.007;
  ctx.clearRect(0, 0, W, H);
  if(currentFractalStyle !== 'none'){
    for(var i = 0; i < fractalParticles.length; i++){
      var p = fractalParticles[i];
      p.phase += p.speed * 0.025;
      var cx = (p.x + Math.cos(fTime * 0.35 + p.phase) * 0.09) * W;
      var cy = (p.y + Math.sin(fTime * 0.28 + p.phase * 0.9) * 0.09) * H;
      var rot = fTime * 0.5 + p.phase;
      var hue = (p.hue + fTime * 12) % 360;
      var alpha = p.alpha * (0.75 + Math.sin(fTime * 1.2 + p.phase) * 0.25);
      var fn;
      if(currentFractalStyle === 'mixed') fn = [drawKoch, drawSierpinski, drawPentagon, drawStar, drawHex][p.type];
      else if(currentFractalStyle === 'koch') fn = drawKoch;
      else if(currentFractalStyle === 'sierpinski') fn = drawSierpinski;
      else if(currentFractalStyle === 'pentagon') fn = drawPentagon;
      else if(currentFractalStyle === 'star') fn = drawStar;
      else if(currentFractalStyle === 'hex') fn = drawHex;
      if(fn) fn(cx, cy, p.size, rot, hue, alpha);
    }
  }
  requestAnimationFrame(animateFractals);
}

/* ============================================================
   TABS
   ============================================================ */
document.querySelectorAll('.tab').forEach(function(t){
  t.onclick = function(){
    document.querySelectorAll('.tab').forEach(function(x){ x.classList.remove('active'); });
    document.querySelectorAll('.page').forEach(function(x){ x.classList.remove('active'); });
    t.classList.add('active');
    var pg = document.getElementById('page-' + t.dataset.page);
    if(pg) pg.classList.add('active');
    window.scrollTo({top: 0, behavior: 'smooth'});
  };
});

/* ============================================================
   СТАРТ
   ============================================================ */
try {
  currentFractalStyle = state.fractalStyle || 'mixed';
  render();
  document.getElementById('appRoot').style.display = 'block';
  document.getElementById('loading').classList.add('hidden');
  setTimeout(animateFractals, 100);
} catch(err) {
  var l = document.getElementById('loading');
  if(l) l.innerHTML = '<div class="err">⚠️ Ошибка:<br>' + (err.message || 'Unknown') + '<br><br>' + (err.stack || '').slice(0, 250) + '</div>';
}
