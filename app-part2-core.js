/* ============================================================
   ПУТЬ 16 · СОТВОРЦОМ
   app-part2-core.js — ЯДРО (state, XP, стрики, роутер)
   ============================================================ */

'use strict';

/* ---------- СОСТОЯНИЕ ---------- */
let state = null;
let autosaveTimer = null;

function defaultState() {
  return {
    version: APP_VERSION,
    created: Date.now(),

    /* профиль */
    profile: {
      name: '',
      birth: '',
      gender: '',
      height: 0,
      weight: 0,
      targetWeight: 0,
      goal: 'maintain',
      activity: 'moderate',
      sleep: 8,
      water: 2000,
      avatar: '🧘',
      mealSchedule: []
    },

    /* прогресс */
    xp: 0,
    xpEarned: 0,
    level: 1,
    streak: 0,
    maxStreak: 0,
    lastActiveDay: '',
    lastStreakDay: '',

    /* практики */
    practices: {},
    customPractices: [],
    totalPractices: 0,

    /* ежедневное */
    fateCard:    { day:'', id:'' },
    fateCardDone:{},
    rune:        { day:'', id:'' },
    stone:       { day:'', name:'' },
    affirmation: { day:'', text:'' },
    mantra:      { day:'', text:'' },
    quote:       { day:'', text:'' },
    colorDay:    { day:'', hex:'' },
    wheel:       { day:'', spun:false },
    chest:       { day:'', opened:false },
    weekly:      { week:'', claimed:false },
    customAffirmations: [],

    /* квесты */
    quests: { day:'', list:[], done:[] },

    /* курсы */
    courses: {},

    /* аскезы */
    askesis: {},

    /* преграды */
    barriers: {},

    /* путь пробуждения */
    pathStep: 0,
    pathProgress: 0,

    /* боссы */
    bossesDefeated: [],
    currentBoss: { week:'', id:'', hp:0, maxHp:0, defeated:false },

    /* питомцы */
    pets: { owned:['rat'], active:'rat', names:{ rat:'Дух' } },

    /* коллекция */
    cards: [],

    /* достижения */
    achievements: [],

    /* домен */
    domain: {},

    /* трекеры */
    habits: {},
    mood: {},
    body: {
      weight: [],
      workouts: [],
      foods: {},
      mealSchedule: []
    },
    finance: {
      savings: [],
      strategy: '',
      balance: 0,
      history: []
    },
    plan: {},
    goals: [],

    /* эзотерика */
    esoteric: { lastHoroscope:'', zodiac:'' },

    /* природа */
    garden: [],
    bees: { hives:[], queens:[] },
    mushrooms: [],

    /* знания */
    booksRead: [],
    knowledgeFav: [],

    /* вечерние практики */
    reflection: {},
    wins: {},
    gratitude: {},
    balance: {},
    insights: [],

    /* история */
    history: {},
    log: [],

    /* настройки */
    settings: {
      sound: true,
      notify: false,
      batterySaver: false,
      reducedMotion: false,
      seasonal: true,
      theme: 'cosmos',
      fractal: 'mandelbrot'
    }
  };
}

/* ---------- ДАТЫ ---------- */
function getToday() {
  const d = new Date();
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

function getDayKey(d) {
  const dt = d || new Date();
  return dt.getFullYear() + '-' +
    String(dt.getMonth() + 1).padStart(2, '0') + '-' +
    String(dt.getDate()).padStart(2, '0');
}

function daysDiff(a, b) {
  const d1 = new Date(a + 'T00:00:00');
  const d2 = new Date(b + 'T00:00:00');
  return Math.round((d2 - d1) / 86400000);
}

function getWeekKey() {
  const d = new Date();
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
  return d.getFullYear() + '-W' + String(week).padStart(2, '0');
}

function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getDayKey(d);
}

/* ---------- DEEP MERGE ---------- */
function deepMerge(target, source) {
  if (!source || typeof source !== 'object') return target;
  const out = Array.isArray(target) ? target.slice() : Object.assign({}, target);
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      out[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      out[key] = source[key];
    }
  }
  return out;
}

/* ---------- СОХРАНЕНИЕ / ЗАГРУЗКА ---------- */
function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      state = defaultState();
      saveState();
      return;
    }
    const parsed = JSON.parse(raw);
    state = deepMerge(defaultState(), parsed);
  } catch (e) {
    console.error('Ошибка загрузки state:', e);
    state = defaultState();
    try {
      localStorage.setItem(BACKUP_KEY, localStorage.getItem(SAVE_KEY) || '');
    } catch (_) {}
  }
}

function saveState() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Ошибка сохранения:', e);
    if (typeof showToast === 'function') showToast('⚠️ Ошибка сохранения');
  }
}

function backupNow() {
  try {
    localStorage.setItem(BACKUP_KEY, JSON.stringify(state));
    const stamp = new Date().toLocaleString('ru-RU');
    state.log.unshift({ t: Date.now(), msg: '💾 Бэкап создан: ' + stamp });
    if (state.log.length > 200) state.log.length = 200;
    saveState();
    if (typeof showToast === 'function') showToast('💾 Бэкап создан');
  } catch (e) {
    if (typeof showToast === 'function') showToast('⚠️ Не удалось создать бэкап');
  }
}

function startAutosave() {
  if (autosaveTimer) clearInterval(autosaveTimer);
  autosaveTimer = setInterval(() => {
    saveState();
  }, 30000);
}

/* ---------- XP / УРОВНИ ---------- */
function xpForLevel(lvl) {
  return XP_PER_LEVEL_BASE + (lvl - 1) * XP_PER_LEVEL_STEP;
}

function xpForNextLevel() {
  return xpForLevel(state.level);
}

function getXpMultiplier() {
  let mult = 1;
  const pet = PETS.find(p => p.id === state.pets.active);
  if (pet && pet.bonus) {
    const m = pet.bonus.match(/(\d+)/);
    if (m) mult += parseInt(m[1], 10) / 100;
  }
  return mult;
}

function addXP(amount, reason) {
  if (!amount || amount <= 0) return 0;

  const mult = getXpMultiplier();
  const final = Math.round(amount * mult);

  state.xp += final;
  state.xpEarned += final;

  const today = getToday();
  if (!state.history[today]) {
    state.history[today] = { xp: 0, practices: [] };
  }
  state.history[today].xp = (state.history[today].xp || 0) + final;

  logEvent('+' + final + ' XP — ' + (reason || ''));

  if (typeof showToast === 'function') showToast('+' + final + ' XP');

  checkLevelUp();
  saveState();
  updateHeaderUI();
  if (typeof renderAll === 'function') renderAll();

  return final;
}

function checkLevelUp() {
  let leveled = false;
  while (state.xp >= xpForNextLevel()) {
    state.xp -= xpForNextLevel();
    state.level++;
    leveled = true;
    logEvent('🎉 Уровень ' + state.level);
    if (typeof showLevelUpModal === 'function') showLevelUpModal();
    if (typeof unlockAchievement === 'function') {
      if (state.level >= 10) unlockAchievement('a_10lvl');
      if (state.level >= 25) unlockAchievement('a_25lvl');
      if (state.level >= 50) unlockAchievement('a_50lvl');
    }
  }
  return leveled;
}

function getRank() {
  let r = RANKS[0];
  for (const rank of RANKS) {
    if (state.level >= rank.min) r = rank;
  }
  return r;
}

function getLevelTitle() {
  const idx = Math.min(Math.floor((state.level - 1) / 5), LEVEL_TITLES.length - 1);
  return LEVEL_TITLES[idx];
}

function getRankTitle() {
  const idx = Math.min(Math.floor((state.level - 1) / 5), RANK_TITLES.length - 1);
  return RANK_TITLES[idx];
}

/* ---------- СТРИК ---------- */
function updateStreak() {
  const today = getToday();
  if (state.lastStreakDay === today) return;

  if (!state.lastStreakDay) {
    state.streak = 1;
  } else {
    const diff = daysDiff(state.lastStreakDay, today);
    if (diff === 1) {
      state.streak++;
    } else if (diff > 1) {
      state.streak = 1;
    }
  }

  if (state.streak > state.maxStreak) state.maxStreak = state.streak;
  state.lastStreakDay = today;
}

function registerActivity() {
  const today = getToday();
  state.lastActiveDay = today;

  if (!state.history[today]) {
    state.history[today] = { xp: 0, practices: [] };
  }

  updateStreak();

  if (typeof unlockAchievement === 'function') {
    if (state.streak >= 7)  unlockAchievement('a_week');
    if (state.streak >= 30) unlockAchievement('a_month');
    if (state.streak >= 100)unlockAchievement('a_100d');
  }

  saveState();
}

/* ---------- ПЕНАЛЬТИ / ПОДСКАЗКИ ---------- */
function checkPenalty() {
  const banner = document.getElementById('penaltyBanner');
  if (!banner) return;

  if (!state.lastActiveDay) { banner.innerHTML = ''; return; }

  const today = getToday();
  const diff = daysDiff(state.lastActiveDay, today);

  if (diff >= 3) {
    banner.innerHTML = '<div class="banner danger">⚠️ Ты пропал на ' + diff + ' дней. Начни с малого — одна практика сегодня!</div>';
  } else if (diff >= 2) {
    banner.innerHTML = '<div class="banner warn">🔥 Стрик под угрозой. Сделай практику сегодня.</div>';
  } else {
    banner.innerHTML = '';
  }
}

function checkSmartNudge() {
  const banner = document.getElementById('smartNudgeBanner');
  if (!banner) return;

  const h = new Date().getHours();
  const today = getToday();
  const hist = state.history[today];
  const done = hist ? (hist.practices ? hist.practices.length : 0) : 0;

  let msg = '';
  if (h >= 20 && done === 0) {
    msg = '🌙 Вечер. Успей сделать хотя бы одну практику!';
  } else if (h >= 12 && h < 18 && done === 0) {
    msg = '☀️ День идёт. Самое время для практики.';
  } else if (h >= 6 && h < 10 && done === 0 && state.streak > 0) {
    msg = '🌅 Доброе утро! Начни день с практики.';
  }

  if (msg && state.streak > 0) {
    banner.innerHTML = '<div class="banner info">' + msg + '</div>';
  } else {
    banner.innerHTML = '';
  }
}

/* ---------- РОУТЕР ---------- */
function switchCategory(cat) {
  document.querySelectorAll('.category-pages').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('cat-' + cat);
  if (target) target.classList.add('active');

  document.querySelectorAll('.main-menu-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.cat === cat);
  });

  renderSubTabs(cat);

  const pages = document.querySelectorAll('#cat-' + cat + ' .page');
  pages.forEach(p => p.classList.remove('active'));
  if (pages.length) {
    pages[0].classList.add('active');
    renderPage(pages[0].id.replace('page-', ''));
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

const SUB_TABS = {
  game: [
    { id:'card',      name:'Карта' },
    { id:'wheel',     name:'Колесо' },
    { id:'chest',     name:'Сундук' },
    { id:'boss',      name:'Босс' },
    { id:'pet',       name:'Питомец' },
    { id:'petshop',   name:'Магазин' },
    { id:'domain',    name:'Домен' },
    { id:'weekly',    name:'Неделя' },
    { id:'awards',    name:'Награды' },
    { id:'cards',     name:'Коллекция' },
    { id:'heatmap',   name:'Карта' },
    { id:'forecast',  name:'Прогноз' },
    { id:'dailypath', name:'Путь' }
  ],
  develop: [
    { id:'practices', name:'Практики' },
    { id:'quests',    name:'Квесты' },
    { id:'courses',   name:'Курсы' },
    { id:'askesis',   name:'Аскезы' },
    { id:'barriers',  name:'Преграды' },
    { id:'path',      name:'Путь' }
  ],
  track: [
    { id:'habits',  name:'Привычки' },
    { id:'mood',    name:'Настроение' },
    { id:'body',    name:'Тело' },
    { id:'finance', name:'Финансы' },
    { id:'plan',    name:'План' },
    { id:'goals',   name:'Цели' }
  ],
  esoterica: [
    { id:'horoscope',  name:'Гороскоп' },
    { id:'numerology', name:'Нумерология' },
    { id:'moon',       name:'Луна' },
    { id:'runes',      name:'Руны' },
    { id:'stones',     name:'Камни' },
    { id:'ball',       name:'Шар' },
    { id:'color',      name:'Цвет' }
  ],
  nature: [
    { id:'garden',    name:'Сад' },
    { id:'bees',      name:'Пасека' },
    { id:'mushrooms', name:'Грибница' },
    { id:'herbs',     name:'Травы' }
  ],
  know: [
    { id:'books',       name:'Библиотека' },
    { id:'knowledge',   name:'Знания' },
    { id:'health',      name:'Здоровье' },
    { id:'esoteric-kb', name:'Эзотерика' }
  ],
  more: [
    { id:'profile',    name:'Профиль' },
    { id:'reflection', name:'Рефлексия' },
    { id:'wins',       name:'Победы' },
    { id:'gratitude',  name:'Благодарность' },
    { id:'balance',    name:'Баланс' },
    { id:'insights',   name:'Инсайты' },
    { id:'analytics',  name:'Аналитика' },
    { id:'dna',        name:'ДНК' },
    { id:'progress',   name:'Прогресс' },
    { id:'settings',   name:'Настройки' }
  ]
};

function renderSubTabs(cat) {
  const container = document.getElementById('subTabs');
  if (!container) return;
  const tabs = SUB_TABS[cat] || [];
  container.innerHTML = tabs.map(t =>
    '<button class="sub-tab" data-page="' + t.id + '" onclick="switchTab(\'' + t.id + '\')">' + t.name + '</button>'
  ).join('');
  const first = container.querySelector('.sub-tab');
  if (first) first.classList.add('active');
}

function switchTab(pageId) {
  const cat = document.querySelector('.category-pages.active');
  if (!cat) return;

  cat.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + pageId);
  if (target) target.classList.add('active');

  document.querySelectorAll('.sub-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.page === pageId);
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
  renderPage(pageId);
}

/* ---------- РЕНДЕР-РОУТЕР ---------- */
function renderAll() {
  const cat = document.querySelector('.category-pages.active');
  if (!cat) return;
  const page = cat.querySelector('.page.active');
  if (page && page.id) {
    renderPage(page.id.replace('page-', ''));
  }
}

function renderPage(id) {
  const map = {
    card:          window.renderFateCard,
    wheel:         window.renderWheel,
    chest:         window.renderChest,
    boss:          window.renderBoss,
    pet:           window.renderPet,
    petshop:       window.renderPetShop,
    domain:        window.renderDomain,
    weekly:        window.renderWeekly,
    awards:        window.renderAchievements,
    cards:         window.renderCollection,
    heatmap:       window.renderHeatmap,
    forecast:      window.renderForecast,
    dailypath:     window.renderDailyPath,
    practices:     window.renderPractices,
    quests:        window.renderQuests,
    courses:       window.renderCourses,
    askesis:       window.renderAskesis,
    barriers:      window.renderBarriers,
    path:          window.renderPath,
    habits:        window.renderHabits,
    mood:          window.renderMood,
    body:          window.renderBody,
    finance:       window.renderFinance,
    plan:          window.renderPlan,
    goals:         window.renderGoals,
    horoscope:     window.renderHoroscope,
    numerology:    window.renderNumerology,
    moon:          window.renderMoon,
    runes:         window.renderRunes,
    stones:        window.renderStones,
    ball:          window.renderBall,
    color:         window.renderColor,
    garden:        window.renderGarden,
    bees:          window.renderBees,
    mushrooms:     window.renderMushrooms,
    herbs:         window.renderHerbs,
    books:         window.renderBooks,
    knowledge:     window.renderKnowledge,
    health:        window.renderHealth,
    'esoteric-kb': window.renderEsotericKb,
    profile:       window.renderProfile,
    reflection:    window.renderReflection,
    wins:          window.renderWins,
    gratitude:     window.renderGratitude,
    balance:       window.renderBalance,
    insights:      window.renderInsights,
    analytics:     window.renderAnalytics,
    dna:           window.renderDNA,
    progress:      window.renderProgress,
    settings:      window.renderSettings
  };
  const fn = map[id];
  if (typeof fn === 'function') {
    try { fn(); } catch (e) { console.error('Ошибка рендера страницы ' + id, e); }
  }
}

/* ---------- HEADER UI ---------- */
function updateHeaderUI() {
  const rank = getRank();

  setText('levelBadge', 'Ур. ' + state.level + ' · ' + getLevelTitle());
  setText('rankTitle', getRankTitle());
  setText('mainTitle', 'Путь');
  setText('statStreak', state.streak);
  setText('statTotal', Object.keys(state.history).length);

  const today = getToday();
  const hist = state.history[today];
  const todayCount = hist ? (hist.practices ? hist.practices.length : 0) : 0;
  setText('statToday', todayCount);

  const rk = document.getElementById('statRank');
  if (rk) rk.textContent = rank.icon;

  const avatar = document.getElementById('avatar');
  if (avatar) avatar.textContent = state.profile.avatar || '🧘';

  const next = xpForNextLevel();
  const fill = document.getElementById('xpFill');
  const txt = document.getElementById('xpText');
  if (fill) fill.style.width = Math.min(100, (state.xp / next) * 100) + '%';
  if (txt) txt.textContent = state.xp + ' / ' + next + ' XP';

  checkPenalty();
  checkSmartNudge();
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/* ---------- ЛОГ ---------- */
function logEvent(msg) {
  state.log.unshift({ t: Date.now(), msg: msg });
  if (state.log.length > 200) state.log.length = 200;
}

/* ---------- TOAST ---------- */
let toastTimeout = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => el.classList.remove('show'), 2200);
}

/* ---------- ACH POPUP ---------- */
function showAchPopup(icon, name) {
  const el = document.getElementById('achPopup');
  if (!el) return;
  const iconEl = document.getElementById('achPopupIcon');
  const nameEl = document.getElementById('achPopupName');
  if (iconEl) iconEl.textContent = icon;
  if (nameEl) nameEl.textContent = name;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3500);
}

/* ---------- МОДАЛКИ ---------- */
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('show');
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('show');
}

document.addEventListener('click', (e) => {
  if (e.target && e.target.classList && e.target.classList.contains('modal')) {
    e.target.classList.remove('show');
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal.show').forEach(m => m.classList.remove('show'));
  }
});

/* ---------- УТИЛИТЫ ---------- */
function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function pickSeeded(arr, seedStr) {
  let h = 0;
  const s = String(seedStr);
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h |= 0;
  }
  const idx = Math.abs(h) % arr.length;
  return arr[idx];
}

function weightedRandom(items, weightKey) {
  const wKey = weightKey || 'weight';
  const total = items.reduce((sum, it) => sum + (it[wKey] || 1), 0);
  let r = Math.random() * total;
  for (const it of items) {
    r -= (it[wKey] || 1);
    if (r <= 0) return it;
  }
  return items[items.length - 1];
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

function debounce(fn, wait) {
  let t = null;
  return function(...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m + ':' + String(s).padStart(2, '0');
}

function formatHoursMin(ms) {
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return h + 'ч ' + m + 'м';
  return m + 'м';
}

/* ---------- ГЛОБАЛЬНЫЙ ПОИСК ---------- */
function openGlobalSearch() {
  const el = document.getElementById('globalSearchOverlay');
  if (!el) return;
  el.classList.add('show');
  setTimeout(() => {
    const inp = document.getElementById('globalSearchInput');
    if (inp) inp.focus();
  }, 100);
}

function closeGlobalSearch(e) {
  if (e && e.target && e.target.id !== 'globalSearchOverlay') return;
  const el = document.getElementById('globalSearchOverlay');
  if (el) el.classList.remove('show');
  const inp = document.getElementById('globalSearchInput');
  if (inp) inp.value = '';
  const res = document.getElementById('globalSearchResults');
  if (res) res.innerHTML = '<div class="search-hint">Начни вводить — найду практики, знания, травы, блюда...</div>';
}

const SEARCH_INDEX_BUILDER = [
  { cat:'Практика',     icon:'📋', items: () => PRACTICES.map(p => ({ id:p.id, title:p.name, desc:p.desc, page:'practices', catName:'develop' })) },
  { cat:'Квест',        icon:'⚔️', items: () => QUESTS_POOL.map(q => ({ id:q.id, title:q.text, desc:'+' + q.xp + ' XP', page:'quests', catName:'develop' })) },
  { cat:'Курс',         icon:'🎓', items: () => COURSES.map(c => ({ id:c.id, title:c.name, desc:c.desc, page:'courses', catName:'develop' })) },
  { cat:'Аскеза',       icon:'🔥', items: () => ASKESIS.map(a => ({ id:a.id, title:a.name, desc:a.desc, page:'askesis', catName:'develop' })) },
  { cat:'Преграда',     icon:'🚧', items: () => BARRIERS.map(b => ({ id:b.id, title:b.name, desc:b.desc, page:'barriers', catName:'develop' })) },
  { cat:'Знание',       icon:'📖', items: () => KNOWLEDGE_BASE.map(k => ({ id:k.title, title:k.title, desc:k.text, page:'knowledge', catName:'know' })) },
  { cat:'Здоровье',     icon:'💚', items: () => HEALTH_BASE.map(h => ({ id:h.title, title:h.title, desc:h.text, page:'health', catName:'know' })) },
  { cat:'Эзотерика',    icon:'🔮', items: () => ESOTERIC_KB.map(e => ({ id:e.term, title:e.term, desc:e.def, page:'esoteric-kb', catName:'know' })) },
  { cat:'Книга',        icon:'📚', items: () => BOOKS.map(b => ({ id:b.id, title:b.title, desc:b.author, page:'books', catName:'know' })) },
  { cat:'Руна',         icon:'ᚱ',  items: () => RUNES.map(r => ({ id:r.id, title:r.name, desc:r.meaning, page:'runes', catName:'esoterica' })) },
  { cat:'Камень',       icon:'💎', items: () => STONES.map(s => ({ id:s.name, title:s.name, desc:s.props, page:'stones', catName:'esoterica' })) },
  { cat:'Трава',        icon:'🌿', items: () => HERBS.map(h => ({ id:h.name, title:h.name, desc:h.props, page:'herbs', catName:'nature' })) },
  { cat:'Культура',     icon:'🌱', items: () => GARDEN_CULTURES.map(c => ({ id:c.id, title:c.name, desc:c.desc, page:'garden', catName:'nature' })) },
  { cat:'Медонос',      icon:'🌼', items: () => HONEY_PLANTS.map(p => ({ id:p.name, title:p.name, desc:p.desc, page:'bees', catName:'nature' })) },
  { cat:'Гриб',         icon:'🍄', items: () => MUSHROOM_SPECIES.map(m => ({ id:m.id, title:m.name, desc:m.desc, page:'mushrooms', catName:'nature' })) },
  { cat:'Блюдо',        icon:'🍽', items: () => FOOD_LIBRARY.map(f => ({ id:f.name, title:f.name, desc:f.p + 'б / ' + f.f + 'ж / ' + f.c + 'у / ' + f.cal + 'ккал', page:'body', catName:'track' })) },
  { cat:'Достижение',   icon:'🏆', items: () => ACHIEVEMENTS.map(a => ({ id:a.id, title:a.name, desc:a.desc, page:'awards', catName:'game' })) },
  { cat:'Питомец',      icon:'🐾', items: () => PETS.map(p => ({ id:p.id, title:p.name, desc:p.desc + ' · ' + p.bonus, page:'petshop', catName:'game' })) },
  { cat:'Босс',         icon:'👹', items: () => BOSSES.map(b => ({ id:b.id, title:b.name, desc:b.desc, page:'boss', catName:'game' })) },
  { cat:'Карта судьбы', icon:'🎴', items: () => FATE_CARDS.map(c => ({ id:c.id, title:c.name, desc:c.desc, page:'card', catName:'game' })) }
];

let searchIndexCache = null;

function buildSearchIndex() {
  if (searchIndexCache) return searchIndexCache;
  const idx = [];
  SEARCH_INDEX_BUILDER.forEach(group => {
    try {
      const items = group.items();
      items.forEach(it => {
        idx.push({
          cat: group.cat,
          icon: group.icon,
          title: it.title,
          desc: it.desc,
          page: it.page,
          catName: it.catName
        });
      });
    } catch (e) { /* игнор */ }
  });
  searchIndexCache = idx;
  return idx;
}

function runGlobalSearch(query) {
  const res = document.getElementById('globalSearchResults');
  if (!res) return;

  const q = query.trim().toLowerCase();
  if (q.length < 2) {
    res.innerHTML = '<div class="search-hint">Введи минимум 2 символа...</div>';
    return;
  }

  const idx = buildSearchIndex();
  const found = idx.filter(it =>
    it.title.toLowerCase().includes(q) || (it.desc && it.desc.toLowerCase().includes(q))
  ).slice(0, 40);

  if (!found.length) {
    res.innerHTML = '<div class="search-empty">🔍 Ничего не найдено</div>';
    return;
  }

  res.innerHTML = found.map((it, i) =>
    '<div class="search-result" onclick="goToSearchResult(' + i + ')" data-idx="' + i + '">' +
      '<div class="search-result-icon">' + it.icon + '</div>' +
      '<div style="flex:1;min-width:0">' +
        '<div class="search-result-cat">' + escapeHtml(it.cat) + '</div>' +
        '<div class="search-result-title">' + escapeHtml(it.title) + '</div>' +
        '<div class="search-result-desc">' + escapeHtml(it.desc || '') + '</div>' +
      '</div>' +
    '</div>'
  ).join('');

  window._lastSearchResults = found;
}

const debouncedSearch = debounce(runGlobalSearch, 200);

function goToSearchResult(i) {
  const found = window._lastSearchResults;
  if (!found || !found[i]) return;
  const it = found[i];
  closeGlobalSearch();
  if (it.catName) switchCategory(it.catName);
  setTimeout(() => switchTab(it.page), 50);
}

/* ---------- КОНЕЦ ЧАСТИ 2 ---------- */
console.log('✅ Путь 16 · Часть 2 (ядро) загружена');
