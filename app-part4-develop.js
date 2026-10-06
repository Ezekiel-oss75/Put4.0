/* ============================================================
   ПУТЬ 16 · СОТВОРЦОМ
   app-part4-develop.js — РАЗВИТИЕ (практики, квесты, курсы, аскезы, преграды, путь)
   ============================================================ */

'use strict';

/* ============================================================
   1. ПРАКТИКИ
   ============================================================ */
let currentPracticeTimer = null;
let currentPracticeId = null;

function getAllPractices() {
  return PRACTICES.concat(state.customPractices || []);
}

function getPracticeState(id) {
  if (!state.practices[id]) {
    state.practices[id] = { level: 1, count: 0, lastDone: 0, todayCount: 0, today: '' };
  }
  return state.practices[id];
}

function canDoPractice(id) {
  const ps = getPracticeState(id);
  const today = getToday();
  const now = Date.now();

  /* сброс todayCount если новый день */
  if (ps.today !== today) {
    ps.today = today;
    ps.todayCount = 0;
  }

  /* макс 2 раза в день */
  if (ps.todayCount >= MAX_PRACTICES_PER_DAY) {
    return { ok: false, reason: 'Максимум 2 раза в день' };
  }

  /* кулдаун 9ч */
  if (ps.lastDone) {
    const diffH = (now - ps.lastDone) / 3600000;
    if (diffH < PRACTICE_COOLDOWN_HOURS) {
      const left = PRACTICE_COOLDOWN_HOURS - diffH;
      const h = Math.floor(left);
      const m = Math.floor((left - h) * 60);
      return { ok: false, reason: 'Кулдаун: ' + h + 'ч ' + m + 'м' };
    }
  }

  return { ok: true };
}

function renderPractices() {
  const el = document.getElementById('practicesContainer');
  if (!el) return;

  const all = getAllPractices();

  /* группировка по категориям */
  const byCat = {};
  all.forEach(p => {
    if (!byCat[p.cat]) byCat[p.cat] = [];
    byCat[p.cat].push(p);
  });

  let html = '';

  Object.keys(PRACTICE_CATS).forEach(catId => {
    const cat = PRACTICE_CATS[catId];
    const items = byCat[catId] || [];
    if (!items.length) return;

    html += '<div style="font-size:12px;font-weight:800;color:var(--text-soft);letter-spacing:1.5px;text-transform:uppercase;margin:20px 0 10px">' +
      cat.icon + ' ' + cat.name +
    '</div>';

    html += items.map(p => {
      const ps = getPracticeState(p.id);
      const check = canDoPractice(p.id);
      const todayCount = ps.todayCount || 0;

      return '<div class="card" style="display:flex;gap:14px;align-items:center;padding:14px;' +
        (check.ok ? '' : 'opacity:.6') + '">' +
        '<div style="font-size:36px;flex-shrink:0">' + p.icon + '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:14.5px;font-weight:800;margin-bottom:2px">' + escapeHtml(p.name) +
            ' <span style="font-size:11px;color:var(--text-soft);font-weight:800">Ур. ' + ps.level + '</span>' +
          '</div>' +
          '<div style="font-size:11.5px;color:var(--text-dim);font-weight:600;margin-bottom:4px">' + escapeHtml(p.desc) + '</div>' +
          '<div style="font-size:11px;color:var(--green);font-weight:800">+' + p.xp + ' XP · ' + formatTime(p.sec) +
            ' · сегодня ' + todayCount + '/' + MAX_PRACTICES_PER_DAY +
          '</div>' +
          (check.ok ? '' : '<div style="font-size:10.5px;color:var(--orange);font-weight:800;margin-top:2px">⏳ ' + check.reason + '</div>') +
        '</div>' +
        '<button class="btn-small ' + (check.ok ? 'purple' : 'danger') + '" ' +
          (check.ok ? '' : 'disabled') +
          ' onclick="startPractice(\'' + p.id + '\')">▶</button>' +
      '</div>';
    }).join('');
  });

  el.innerHTML = html;
}

function startPractice(id) {
  const p = getAllPractices().find(x => x.id === id);
  if (!p) return;

  const check = canDoPractice(id);
  if (!check.ok) { showToast('⏳ ' + check.reason); return; }

  currentPracticeId = id;

  const modal = document.getElementById('practiceTimerModal');
  const titleEl = document.getElementById('timerPracTitle');
  const descEl = document.getElementById('timerPracDesc');
  const hintEl = document.getElementById('pracTimerHint');
  const textEl = document.getElementById('pracTimerText');
  const labelEl = document.getElementById('pracTimerLabel');
  const circleEl = document.getElementById('pracTimerCircle');
  const confirmBtn = document.getElementById('pracConfirmBtn');

  if (!modal) return;

  titleEl.textContent = p.icon + ' ' + p.name;
  descEl.textContent = p.hint || p.desc;
  hintEl.textContent = '⏱ Таймер идёт. Не закрывай окно.';
  textEl.textContent = formatTime(p.sec);
  labelEl.textContent = 'Осталось';
  confirmBtn.disabled = true;
  confirmBtn.textContent = '⏳ Подожди...';

  /* SVG circle: r=80 → circumference ≈ 502.65 */
  const circ = 502.65;
  circleEl.setAttribute('stroke-dasharray', circ);
  circleEl.setAttribute('stroke-dashoffset', '0');

  modal.classList.add('show');

  const startTime = Date.now();
  const duration = p.sec * 1000;

  if (currentPracticeTimer) cancelAnimationFrame(currentPracticeTimer);

  function tick() {
    const elapsed = Date.now() - startTime;
    const left = Math.max(0, duration - elapsed);
    const secLeft = Math.ceil(left / 1000);
    const pct = 1 - (left / duration);

    textEl.textContent = formatTime(secLeft);
    circleEl.setAttribute('stroke-dashoffset', String(circ * pct));

    if (left <= 0) {
      /* таймер закончился */
      hintEl.textContent = '✅ Время вышло. Подтверди выполнение!';
      labelEl.textContent = 'Готово';
      confirmBtn.disabled = false;
      confirmBtn.textContent = '✅ Подтвердить · +' + p.xp + ' XP';
      return;
    }

    currentPracticeTimer = requestAnimationFrame(tick);
  }
  tick();
}

function confirmPracticeComplete() {
  if (!currentPracticeId) return;
  const p = getAllPractices().find(x => x.id === currentPracticeId);
  if (!p) return;

  const ps = getPracticeState(currentPracticeId);
  const today = getToday();

  if (ps.today !== today) {
    ps.today = today;
    ps.todayCount = 0;
  }

  ps.count = (ps.count || 0) + 1;
  ps.todayCount = (ps.todayCount || 0) + 1;
  ps.lastDone = Date.now();

  /* уровень каждые 5 практик */
  const newLevel = Math.floor(ps.count / PRACTICE_LEVEL_EVERY) + 1;
  if (newLevel > ps.level) {
    ps.level = newLevel;
    showToast('🎉 ' + p.name + ' → Ур. ' + ps.level);
  }

  state.totalPractices = (state.totalPractices || 0) + 1;

  /* история дня */
  if (!state.history[today]) state.history[today] = { xp: 0, practices: [] };
  if (!state.history[today].practices) state.history[today].practices = [];
  state.history[today].practices.push(p.name);

  /* награды */
  addXP(p.xp, 'Практика: ' + p.name);
  registerActivity();

  /* босс, коллекция, ачивки */
  if (typeof hitBoss === 'function') hitBoss(10);
  if (typeof unlockCard === 'function') {
    if (state.totalPractices === 1) unlockCard('cc1');
    if (state.totalPractices >= 50) unlockCard('cc4');
    if (state.totalPractices >= 100) unlockCard('cc5');
  }
  if (typeof unlockAchievement === 'function') {
    if (state.totalPractices >= 1) unlockAchievement('a_first');
    if (state.totalPractices >= 100) unlockAchievement('a_100prac');
    if (state.totalPractices >= 500) unlockAchievement('a_500prac');
  }

  saveState();
  closePracticeTimer();
  showToast('🌟 ' + p.name + ' +' + p.xp + ' XP');
  renderPractices();
  updateHeaderUI();
}

function closePracticeTimer() {
  if (currentPracticeTimer) cancelAnimationFrame(currentPracticeTimer);
  currentPracticeTimer = null;
  currentPracticeId = null;
  closeModal('practiceTimerModal');
}

function cancelPracticeTimer() {
  if (currentPracticeTimer) cancelAnimationFrame(currentPracticeTimer);
  currentPracticeTimer = null;
  currentPracticeId = null;
  closeModal('practiceTimerModal');
}

/* ============================================================
   2. КВЕСТЫ ДНЯ
   ============================================================ */
let questTimerInterval = null;

function getDailyQuests() {
  const today = getToday();
  if (state.quests.day === today && state.quests.list && state.quests.list.length) {
    return state.quests.list;
  }

  /* выбираем 3 seeded по дате */
  const pool = QUESTS_POOL.slice();
  const picked = [];
  for (let i = 0; i < QUESTS_PER_DAY && pool.length; i++) {
    const seed = today + 'q' + i;
    let h = 0;
    for (let j = 0; j < seed.length; j++) { h = ((h << 5) - h) + seed.charCodeAt(j); h |= 0; }
    const idx = Math.abs(h) % pool.length;
    picked.push(pool[idx]);
    pool.splice(idx, 1);
  }

  state.quests = { day: today, list: picked, done: [] };
  saveState();
  return picked;
}

function renderQuests() {
  const el = document.getElementById('questsContainer');
  if (!el) return;

  const quests = getDailyQuests();
  const done = state.quests.done || [];

  el.innerHTML = quests.map(q => {
    const isDone = done.includes(q.id);
    return '<div class="card" style="display:flex;gap:14px;align-items:center;padding:14px;' +
      (isDone ? 'opacity:.6' : '') + '">' +
      '<div style="font-size:34px;flex-shrink:0">' + q.icon + '</div>' +
      '<div style="flex:1;min-width:0">' +
        '<div style="font-size:14px;font-weight:800;' + (isDone ? 'text-decoration:line-through' : '') + '">' + escapeHtml(q.text) + '</div>' +
        '<div style="font-size:11px;color:var(--green);font-weight:800;margin-top:2px">+' + q.xp + ' XP</div>' +
      '</div>' +
      (isDone
        ? '<div style="font-size:22px">✅</div>'
        : '<button class="btn-small purple" onclick="completeQuest(\'' + q.id + '\')">✓</button>'
      ) +
    '</div>';
  }).join('');

  startQuestTimer();
}

function completeQuest(id) {
  const quests = state.quests.list || [];
  const q = quests.find(x => x.id === id);
  if (!q) return;

  if (!state.quests.done) state.quests.done = [];
  if (state.quests.done.includes(id)) return;

  state.quests.done.push(id);
  addXP(q.xp, 'Квест: ' + q.text);
  registerActivity();
  saveState();
  renderQuests();
  updateHeaderUI();
  showToast('⚔️ Квест выполнен');
}

function startQuestTimer() {
  if (questTimerInterval) clearInterval(questTimerInterval);
  const el = document.getElementById('questTimer');
  if (!el) return;

  function tick() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setHours(24, 0, 0, 0);
    const diff = tomorrow - now;

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    el.textContent = String(h).padStart(2, '0') + ':' +
                     String(m).padStart(2, '0') + ':' +
                     String(s).padStart(2, '0');
  }
  tick();
  questTimerInterval = setInterval(tick, 1000);
}

/* ============================================================
   3. КУРСЫ
   ============================================================ */
function renderCourses() {
  const el = document.getElementById('coursesContainer');
  if (!el) return;

  el.innerHTML = COURSES.map(c => {
    const st = state.courses[c.id];
    const active = st && st.active && !st.done && !st.failed;
    const done = st && st.done;
    const failed = st && st.failed;

    const day = st ? (st.day || 0) : 0;
    const pct = (day / c.days) * 100;

    let statusText = 'Не начат';
    let statusColor = 'var(--text-soft)';
    if (done) { statusText = '🏆 Пройден!'; statusColor = 'var(--gold)'; }
    else if (failed) { statusText = '❌ Провален'; statusColor = 'var(--red)'; }
    else if (active) { statusText = '🔄 День ' + (day + 1) + ' из ' + c.days; statusColor = 'var(--accent-1)'; }

    return '<div class="card" style="padding:16px">' +
      '<div style="display:flex;gap:14px;align-items:flex-start">' +
        '<div style="font-size:40px;flex-shrink:0">' + c.icon + '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:15px;font-weight:900;margin-bottom:2px">' + escapeHtml(c.name) + '</div>' +
          '<div style="font-size:11.5px;color:var(--text-dim);font-weight:600;margin-bottom:8px">' + escapeHtml(c.desc) + '</div>' +
          '<div style="font-size:11px;font-weight:800;color:' + statusColor + ';margin-bottom:6px">' + statusText + '</div>' +
          (active
            ? '<div class="progress-bar" style="height:6px"><div class="progress-fill" style="width:' + pct + '%"></div></div>'
            : '') +
        '</div>' +
      '</div>' +
      '<div style="display:flex;gap:8px;margin-top:12px">' +
        (done || failed
          ? '<button class="btn-small danger" style="flex:1" onclick="resetCourse(\'' + c.id + '\')">Сбросить</button>'
          : active
            ? '<button class="btn-small purple" style="flex:1" onclick="markCourseDay(\'' + c.id + '\')">✅ День выполнен</button>' +
              '<button class="btn-small danger" onclick="abandonCourse(\'' + c.id + '\')">✖</button>'
            : '<button class="btn-small purple" style="flex:1" onclick="startCourse(\'' + c.id + '\')">▶ Начать</button>'
        ) +
      '</div>' +
    '</div>';
  }).join('');
}

function startCourse(id) {
  const c = COURSES.find(x => x.id === id);
  if (!c) return;
  const st = state.courses[id];
  if (st && st.active && !st.done && !st.failed) { showToast('Курс уже активен'); return; }

  state.courses[id] = { startDay: getToday(), day: 0, missed: 0, done: false, failed: false, active: true, lastMark: '' };
  saveState();
  showToast('🎓 Курс начат: ' + c.name);
  renderCourses();
}

function markCourseDay(id) {
  const c = COURSES.find(x => x.id === id);
  if (!c) return;
  const st = state.courses[id];
  if (!st || !st.active) return;

  const today = getToday();
  if (st.lastMark === today) { showToast('Сегодня уже отмечено'); return; }

  st.lastMark = today;
  st.day++;

  addXP(c.xpPerDay, 'Курс: ' + c.name + ' (день ' + st.day + ')');
  registerActivity();

  if (st.day >= c.days) {
    st.done = true;
    st.active = false;
    addXP(200, 'Курс пройден: ' + c.name);
    showToast('🏆 Курс пройден: ' + c.name);
  } else {
    showToast('✅ День ' + st.day + ' / ' + c.days);
  }

  saveState();
  renderCourses();
  updateHeaderUI();
}

function abandonCourse(id) {
  if (!confirm('Прервать курс? Прогресс сбросится.')) return;
  state.courses[id] = { startDay:'', day:0, missed:1, done:false, failed:true, active:false, lastMark:'' };
  saveState();
  renderCourses();
}

function resetCourse(id) {
  if (!confirm('Сбросить курс?')) return;
  delete state.courses[id];
  saveState();
  renderCourses();
}

/* ============================================================
   4. АСКЕЗЫ
   ============================================================ */
function renderAskesis() {
  const activeEl = document.getElementById('askesisActive');
  const availEl = document.getElementById('askesisAvailable');
  if (!activeEl || !availEl) return;

  const today = getToday();

  /* активные */
  const active = Object.keys(state.askesis || {}).filter(id => {
    const a = state.askesis[id];
    return a && a.active && !a.failed;
  });

  if (!active.length) {
    activeEl.innerHTML = '<div class="card"><div class="info-text">Нет активных аскез. Начни одну ниже 👇</div></div>';
  } else {
    activeEl.innerHTML = active.map(id => {
      const a = ASKESIS.find(x => x.id === id);
      if (!a) return '';
      const st = state.askesis[id];
      const dayNum = st.day || 0;
      const pct = (dayNum / a.days) * 100;
      const markedToday = st.lastMark === today;

      return '<div class="card" style="padding:16px">' +
        '<div style="display:flex;gap:14px;align-items:flex-start">' +
          '<div style="font-size:40px;flex-shrink:0">' + a.icon + '</div>' +
          '<div style="flex:1;min-width:0">' +
            '<div style="font-size:15px;font-weight:900;margin-bottom:2px">' + escapeHtml(a.name) + '</div>' +
            '<div style="font-size:11.5px;color:var(--text-dim);font-weight:600;margin-bottom:8px">' + escapeHtml(a.desc) + '</div>' +
            '<div style="font-size:11px;font-weight:800;color:var(--accent-1);margin-bottom:6px">День ' + (dayNum + 1) + ' / ' + a.days + '</div>' +
            '<div class="progress-bar" style="height:6px"><div class="progress-fill" style="width:' + pct + '%"></div></div>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;gap:8px;margin-top:12px">' +
          '<button class="btn-small ' + (markedToday ? 'danger' : 'purple') + '" style="flex:1" ' +
            (markedToday ? 'disabled' : '') +
            ' onclick="markAskesis(\'' + id + '\')">' +
            (markedToday ? '✅ Отмечено сегодня' : '✅ Отметить день') +
          '</button>' +
          '<button class="btn-small danger" onclick="abandonAskesis(\'' + id + '\')">✖</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  /* доступные */
  const available = ASKESIS.filter(a => !state.askesis[a.id] || state.askesis[a.id].failed);
  if (!available.length) {
    availEl.innerHTML = '<div class="card"><div class="info-text">Все аскезы уже приняты или пройдены.</div></div>';
  } else {
    availEl.innerHTML = available.map(a =>
      '<div class="card" style="display:flex;gap:14px;align-items:center;padding:14px">' +
        '<div style="font-size:34px;flex-shrink:0">' + a.icon + '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:14px;font-weight:800;margin-bottom:2px">' + escapeHtml(a.name) + '</div>' +
          '<div style="font-size:11.5px;color:var(--text-dim);font-weight:600">' + escapeHtml(a.desc) + '</div>' +
          '<div style="font-size:11px;color:var(--green);font-weight:800;margin-top:2px">+' + a.xp + ' XP · ' + a.days + ' дн.</div>' +
        '</div>' +
        '<button class="btn-small purple" onclick="startAskesis(\'' + a.id + '\')">▶</button>' +
      '</div>'
    ).join('');
  }
}

function startAskesis(id) {
  const a = ASKESIS.find(x => x.id === id);
  if (!a) return;
  state.askesis[id] = { startDay: getToday(), day: 0, failed: false, active: true, lastMark: '' };
  saveState();
  showToast('🔥 Аскеза начата: ' + a.name);
  renderAskesis();
}

function markAskesis(id) {
  const a = ASKESIS.find(x => x.id === id);
  if (!a) return;
  const st = state.askesis[id];
  if (!st || !st.active) return;

  const today = getToday();
  if (st.lastMark === today) { showToast('Уже отмечено'); return; }

  st.lastMark = today;
  st.day++;

  addXP(50, 'Аскеза: ' + a.name + ' (день ' + st.day + ')');
  registerActivity();

  if (typeof hitBoss === 'function') hitBoss(50);

  if (st.day >= a.days) {
    addXP(a.xp, 'Аскеза пройдена: ' + a.name);
    st.active = false;
    showToast('🏆 Аскеза пройдена: ' + a.name);
  } else {
    showToast('✅ День ' + st.day + ' / ' + a.days);
  }

  saveState();
  renderAskesis();
  updateHeaderUI();
}

function abandonAskesis(id) {
  if (!confirm('Прервать аскезу? Это провал.')) return;
  state.askesis[id].failed = true;
  state.askesis[id].active = false;
  saveState();
  renderAskesis();
  showToast('❌ Аскеза провалена');
}

/* ============================================================
   5. ПРЕГРАДЫ
   ============================================================ */
function renderBarriers() {
  const el = document.getElementById('barriersContainer');
  if (!el) return;

  const boss = state.currentBoss;
  const bossData = boss ? BOSSES.find(b => b.id === boss.id) : null;

  el.innerHTML = BARRIERS.map(b => {
    const st = state.barriers[b.id] || { count: 0, lastDone: 0 };
    const today = getToday();
    const markedToday = st.lastMark === today;

    return '<div class="card" style="display:flex;gap:14px;align-items:center;padding:14px">' +
      '<div style="font-size:38px;flex-shrink:0">' + b.icon + '</div>' +
      '<div style="flex:1;min-width:0">' +
        '<div style="font-size:14.5px;font-weight:800;margin-bottom:2px">' + escapeHtml(b.name) + '</div>' +
        '<div style="font-size:11.5px;color:var(--text-dim);font-weight:600;margin-bottom:4px">' + escapeHtml(b.desc) + '</div>' +
        '<div style="font-size:11px;color:var(--green);font-weight:800">+' + b.xp + ' XP · 30 урона боссу' +
          (st.count ? ' · пройдено ×' + st.count : '') +
        '</div>' +
      '</div>' +
      (markedToday
        ? '<div style="font-size:22px">✅</div>'
        : '<button class="btn-small purple" onclick="completeBarrier(\'' + b.id + '\')">✓</button>'
      ) +
    '</div>';
  }).join('');
}

function completeBarrier(id) {
  const b = BARRIERS.find(x => x.id === id);
  if (!b) return;

  const today = getToday();
  if (!state.barriers[id]) state.barriers[id] = { count: 0, lastDone: 0, lastMark: '' };
  if (state.barriers[id].lastMark === today) { showToast('Уже пройдено сегодня'); return; }

  state.barriers[id].lastMark = today;
  state.barriers[id].count++;
  state.barriers[id].lastDone = Date.now();

  addXP(b.xp, 'Преграда: ' + b.name);
  registerActivity();

  if (typeof hitBoss === 'function') hitBoss(30);

  saveState();
  renderBarriers();
  updateHeaderUI();
  showToast('🚧 Преграда пройдена: ' + b.name);
}

/* ============================================================
   6. ПУТЬ ПРОБУЖДЕНИЯ
   ============================================================ */
const PATH_STEPS = [
  { name:'Осознание',    icon:'👁️', desc:'Ты видишь свою жизнь ясно',                  need:3 },
  { name:'Принятие',     icon:'🤲', desc:'Ты принимаешь себя и мир',                   need:7 },
  { name:'Дисциплина',   icon:'⚔️', desc:'Ты действуешь каждый день',                  need:14 },
  { name:'Очищение',     icon:'🌊', desc:'Ты отпускаешь лишнее',                       need:21 },
  { name:'Сила',         icon:'🦁', desc:'Ты обрёл внутреннюю силу',                   need:30 },
  { name:'Мудрость',     icon:'🦉', desc:'Ты понимаешь законы жизни',                  need:45 },
  { name:'Просветление', icon:'🕉️', desc:'Ты — свет. Ты — путь.',                      need:60 }
];

function renderPath() {
  const el = document.getElementById('pathContainer');
  if (!el) return;

  const step = state.pathStep || 0;
  const progress = state.pathProgress || 0;
  const current = PATH_STEPS[step];

  if (!current) {
    el.innerHTML = '<div class="card primary" style="text-align:center;padding:32px"><div style="font-size:80px;margin-bottom:12px">🕉️</div><div style="font-size:22px;font-weight:900">Путь пройден</div><div class="info-text" style="margin-top:8px">Ты достиг просветления. Ты — свет.</div></div>';
    return;
  }

  el.innerHTML =
    '<div class="card primary" style="text-align:center;padding:28px 20px;margin-bottom:18px">' +
      '<div style="font-size:72px;margin-bottom:8px">' + current.icon + '</div>' +
      '<div style="font-size:22px;font-weight:900;margin-bottom:6px">' + escapeHtml(current.name) + '</div>' +
      '<div class="info-text" style="margin-bottom:14px">' + escapeHtml(current.desc) + '</div>' +
      '<div class="progress-bar" style="height:10px;margin-bottom:6px">' +
        '<div class="progress-fill" style="width:' + Math.min(100, (progress / current.need) * 100) + '%"></div>' +
      '</div>' +
      '<div style="font-size:12px;font-weight:800;color:var(--text-soft)">' +
        progress + ' / ' + current.need + ' дней' +
      '</div>' +
    '</div>' +

    '<div style="font-size:12px;font-weight:800;color:var(--text-soft);letter-spacing:1.5px;text-transform:uppercase;margin:20px 0 10px">Ступени пути</div>' +

    PATH_STEPS.map((s, i) => {
      const done = i < step;
      const active = i === step;
      return '<div class="card" style="display:flex;gap:12px;align-items:center;padding:12px;' +
        (done ? 'opacity:.55' : '') + (active ? 'border-color:var(--accent-1);background:rgba(79,172,254,.1)' : '') + '">' +
        '<div style="font-size:28px">' + (done ? '✅' : s.icon) + '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:13.5px;font-weight:800">' + escapeHtml(s.name) + '</div>' +
          '<div style="font-size:11px;color:var(--text-soft);font-weight:600">' + s.need + ' дней практик</div>' +
        '</div>' +
        (active ? '<div style="font-size:11px;font-weight:900;color:var(--accent-1)">СЕЙЧАС</div>' : '') +
      '</div>';
    }).join('');
}

function advancePath() {
  const step = state.pathStep || 0;
  const cur = PATH_STEPS[step];
  if (!cur) return;

  state.pathProgress = (state.pathProgress || 0) + 1;

  if (state.pathProgress >= cur.need) {
    state.pathStep = step + 1;
    state.pathProgress = 0;
    addXP(200, 'Ступень пути: ' + cur.name);
    showToast('🌌 Новая ступень: ' + (PATH_STEPS[step + 1] ? PATH_STEPS[step + 1].name : 'Путь пройден!'));
  }

  saveState();
  renderPath();
}

/* ============================================================
   ЭКСПОРТ В WINDOW
   ============================================================ */
window.renderPractices = renderPractices;
window.startPractice = startPractice;
window.confirmPracticeComplete = confirmPracticeComplete;
window.cancelPracticeTimer = cancelPracticeTimer;
window.closePracticeTimer = closePracticeTimer;

window.renderQuests = renderQuests;
window.completeQuest = completeQuest;

window.renderCourses = renderCourses;
window.startCourse = startCourse;
window.markCourseDay = markCourseDay;
window.abandonCourse = abandonCourse;
window.resetCourse = resetCourse;

window.renderAskesis = renderAskesis;
window.startAskesis = startAskesis;
window.markAskesis = markAskesis;
window.abandonAskesis = abandonAskesis;

window.renderBarriers = renderBarriers;
window.completeBarrier = completeBarrier;

window.renderPath = renderPath;
window.advancePath = advancePath;

/* ---------- КОНЕЦ ЧАСТИ 4 ---------- */
console.log('✅ Путь 16 · Часть 4 (развитие) загружена');
