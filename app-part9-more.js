/* ============================================================
   ПУТЬ 16 · СОТВОРЦОМ
   app-part9-more.js — ЕЩЁ (профиль, рефлексия, победы, благодарность, баланс, инсайты, аналитика, ДНК, прогресс, настройки)
   ============================================================ */

'use strict';

/* ============================================================
   1. ПРОФИЛЬ
   ============================================================ */
let profileEditBuffer = {};

function renderProfile() {
  const el = document.getElementById('profileContainer');
  if (!el) return;

  const p = state.profile;
  const zodiac = p.birth ? getZodiacSign(p.birth) : null;
  const chinese = p.birth ? getChineseSign(new Date(p.birth).getFullYear()) : null;

  el.innerHTML =
    '<div class="card primary" style="text-align:center;padding:24px 20px">' +
      '<div style="font-size:80px;margin-bottom:10px">' + (p.avatar || '🧘') + '</div>' +
      '<div style="font-size:22px;font-weight:900;margin-bottom:4px">' + escapeHtml(p.name || 'Путник') + '</div>' +
      '<div style="font-size:11.5px;color:var(--text-soft);font-weight:700;letter-spacing:1px">' + getLevelTitle() + ' · Ур. ' + state.level + '</div>' +
      '<div style="display:flex;gap:6px;justify-content:center;margin-top:14px;flex-wrap:wrap">' +
        (zodiac ? '<span style="font-size:10.5px;font-weight:800;padding:5px 12px;border-radius:999px;background:rgba(79,172,254,.15);color:var(--accent-1)">' + zodiac.icon + ' ' + zodiac.name + '</span>' : '') +
        (chinese ? '<span style="font-size:10.5px;font-weight:800;padding:5px 12px;border-radius:999px;background:rgba(176,107,255,.15);color:var(--accent-2)">' + chinese.icon + ' ' + chinese.name + '</span>' : '') +
      '</div>' +
      '<div style="display:flex;gap:8px;justify-content:center;margin-top:16px">' +
        '<button class="btn-small purple" onclick="openProfile()">✏️ Редактировать</button>' +
        '<button class="btn-small" onclick="openAvatarPicker()">🎨 Аватар</button>' +
      '</div>' +
    '</div>' +

    '<div style="font-size:11px;font-weight:800;color:var(--text-soft);letter-spacing:1.5px;text-transform:uppercase;margin:16px 0 8px">📊 Данные</div>' +
    '<div class="setting"><span class="setting-label">📅 Дата рождения</span><b class="setting-value">' + (p.birth || '—') + '</b></div>' +
    '<div class="setting"><span class="setting-label">⚧ Пол</span><b class="setting-value">' + (p.gender === 'male' ? 'Мужской' : p.gender === 'female' ? 'Женский' : '—') + '</b></div>' +
    '<div class="setting"><span class="setting-label">📏 Рост</span><b class="setting-value">' + (p.height ? p.height + ' см' : '—') + '</b></div>' +
    '<div class="setting"><span class="setting-label">⚖️ Вес</span><b class="setting-value">' + (p.weight ? p.weight + ' кг' : '—') + '</b></div>' +
    '<div class="setting"><span class="setting-label">🎯 Цель</span><b class="setting-value">' + (p.goal === 'lose' ? 'Похудеть' : p.goal === 'gain' ? 'Набрать' : p.goal === 'recomp' ? 'Рельеф' : 'Держать') + '</b></div>' +
    '<div class="setting"><span class="setting-label">🏃 Активность</span><b class="setting-value">' + ({sedentary:'Сидячий',light:'Лёгкий',moderate:'Средний',active:'Высокий',athlete:'Спортсмен'}[p.activity] || '—') + '</b></div>' +
    '<div class="setting"><span class="setting-label">💤 Сон</span><b class="setting-value">' + (p.sleep || 8) + ' ч</b></div>' +
    '<div class="setting"><span class="setting-label">💧 Вода</span><b class="setting-value">' + (p.water || 2000) + ' мл</b></div>' +

    '<button class="btn primary" onclick="openProfileMealsModal()" style="margin-top:14px">🍽 Настроить приёмы пищи</button>';
}

function openProfile() {
  profileEditBuffer = Object.assign({}, state.profile);
  const p = state.profile;

  document.getElementById('pfName').value = p.name || '';
  document.getElementById('pfBirth').value = p.birth || '';
  document.getElementById('pfHeight').value = p.height || '';
  document.getElementById('pfWeight').value = p.weight || '';
  document.getElementById('pfTargetWeight').value = p.targetWeight || '';
  document.getElementById('pfSleep').value = p.sleep || 8;
  document.getElementById('pfWater').value = p.water || 2000;

  /* активные табы */
  document.querySelectorAll('.gender-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.gender === p.gender);
  });
  document.querySelectorAll('.goal-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.goal === p.goal);
  });
  document.querySelectorAll('.activity-opt').forEach(t => {
    t.classList.toggle('active', t.dataset.activity === p.activity);
  });

  openModal('profileEditModal');
}

function quickProfile() {
  openProfile();
}

function pickGender(g) {
  profileEditBuffer.gender = g;
  document.querySelectorAll('.gender-tab').forEach(t => t.classList.toggle('active', t.dataset.gender === g));
}

function pickGoal(g) {
  profileEditBuffer.goal = g;
  document.querySelectorAll('.goal-tab').forEach(t => t.classList.toggle('active', t.dataset.goal === g));
}

function pickActivity(a) {
  profileEditBuffer.activity = a;
  document.querySelectorAll('.activity-opt').forEach(t => t.classList.toggle('active', t.dataset.activity === a));
}

function saveProfile() {
  const name = document.getElementById('pfName').value.trim();
  const birth = document.getElementById('pfBirth').value;
  const height = parseFloat(document.getElementById('pfHeight').value) || 0;
  const weight = parseFloat(document.getElementById('pfWeight').value) || 0;
  const targetWeight = parseFloat(document.getElementById('pfTargetWeight').value) || 0;
  const sleep = parseFloat(document.getElementById('pfSleep').value) || 8;
  const water = parseFloat(document.getElementById('pfWater').value) || 2000;

  state.profile = Object.assign({}, state.profile, {
    name, birth, height, weight, targetWeight, sleep, water,
    gender: profileEditBuffer.gender || state.profile.gender,
    goal: profileEditBuffer.goal || state.profile.goal,
    activity: profileEditBuffer.activity || state.profile.activity
  });

  saveState();
  closeModal('profileEditModal');
  renderProfile();
  updateHeaderUI();
  showToast('✅ Профиль сохранён');
}

/* ============================================================
   2. АВАТАР
   ============================================================ */
function openAvatarPicker() {
  const el = document.getElementById('avatarPicker');
  if (!el) return;

  el.innerHTML = AVATARS.map(a =>
    '<button class="avatar-opt ' + (a === state.profile.avatar ? 'active' : '') + '" ' +
      'onclick="pickAvatar(\'' + a + '\')">' + a + '</button>'
  ).join('');

  openModal('avatarModal');
}

function pickAvatar(a) {
  state.profile.avatar = a;
  saveState();
  closeModal('avatarModal');
  renderProfile();
  updateHeaderUI();
  showToast('🎨 Аватар обновлён');
}

/* ============================================================
   3. ПРИЁМЫ ПИЩИ (meal schedule)
   ============================================================ */
let mealBuffer = { count: 3, times: ['08:00','13:00','19:00'] };

function openProfileMealsModal() {
  const existing = state.profile.mealSchedule || [];
  mealBuffer.count = existing.length || 3;
  mealBuffer.times = existing.length ? existing.map(m => m.time) : ['08:00','13:00','19:00'];

  document.querySelectorAll('#mealCountTabs button').forEach(b => {
    b.classList.toggle('active', parseInt(b.dataset.count, 10) === mealBuffer.count);
  });

  renderMealEditor();
  openModal('profileMealsModal');
}

function pickMealCount(n) {
  mealBuffer.count = n;
  const defaults = ['07:00','10:00','13:00','16:00','19:00','22:00'];
  mealBuffer.times = defaults.slice(0, n);

  document.querySelectorAll('#mealCountTabs button').forEach(b => {
    b.classList.toggle('active', parseInt(b.dataset.count, 10) === n);
  });

  renderMealEditor();
}

function renderMealEditor() {
  const el = document.getElementById('mealScheduleEditor');
  if (!el) return;

  el.innerHTML = mealBuffer.times.map((t, i) =>
    '<div class="profile-form-row full" style="align-items:center">' +
      '<div>' +
        '<div class="profile-form-label">Приём ' + (i + 1) + '</div>' +
        '<input type="time" class="profile-form-input" value="' + t + '" onchange="updateMealTime(' + i + ', this.value)">' +
      '</div>' +
    '</div>'
  ).join('');
}

function updateMealTime(i, v) {
  mealBuffer.times[i] = v;
}

function saveMealSchedule() {
  state.profile.mealSchedule = mealBuffer.times.map((t, i) => ({ index: i + 1, time: t }));
  saveState();
  closeModal('profileMealsModal');
  showToast('🍽 Приёмы пищи сохранены');
}

/* ============================================================
   4. РЕФЛЕКСИЯ ДНЯ
   ============================================================ */
function renderReflection() {
  const el = document.getElementById('reflectionContainer');
  if (!el) return;

  const today = getToday();
  const existing = state.reflection[today] || null;

  const question = existing && existing.q ? existing.q : pickSeeded(REFLECTION_QUESTIONS, today + 'refl');

  el.innerHTML =
    '<div class="card primary" style="padding:20px">' +
      '<div style="font-size:10.5px;font-weight:800;color:var(--text-soft);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px">Вопрос дня</div>' +
      '<div style="font-size:16px;font-weight:900;line-height:1.4;margin-bottom:16px">' + escapeHtml(question) + '</div>' +
      '<textarea class="mood-note-modal-textarea" id="reflText" placeholder="Напиши свой ответ..." maxlength="1000">' + escapeHtml((existing && existing.a) || '') + '</textarea>' +
      '<button class="btn primary" onclick="saveReflection()" style="width:100%">💾 Сохранить</button>' +
    '</div>';

  /* прошлые записи */
  const keys = Object.keys(state.reflection).filter(k => k !== today).sort().reverse().slice(0, 10);
  if (keys.length) {
    el.innerHTML += '<div style="font-size:11px;font-weight:800;color:var(--text-soft);letter-spacing:1.5px;text-transform:uppercase;margin:16px 0 8px">Прошлые записи</div>';
    el.innerHTML += keys.map(k => {
      const r = state.reflection[k];
      return '<div class="card" style="padding:12px;margin-bottom:8px">' +
        '<div style="font-size:10.5px;color:var(--text-soft);font-weight:800;margin-bottom:4px">' + k + '</div>' +
        '<div style="font-size:12px;font-weight:700;color:var(--accent-1);margin-bottom:4px">' + escapeHtml(r.q) + '</div>' +
        '<div style="font-size:12px;color:var(--text-dim);font-weight:600;line-height:1.5">' + escapeHtml(r.a) + '</div>' +
      '</div>';
    }).join('');
  }
}

function saveReflection() {
  const el = document.getElementById('reflText');
  if (!el) return;
  const v = el.value.trim();
  if (!v) { showToast('Напиши что-нибудь'); return; }

  const today = getToday();
  const question = pickSeeded(REFLECTION_QUESTIONS, today + 'refl');
  const existing = state.reflection[today];
  const isNew = !existing;

  state.reflection[today] = { q: question, a: v.slice(0, 1000) };

  if (isNew) {
    addXP(15, 'Рефлексия дня');
    registerActivity();
  }

  saveState();
  renderReflection();
  updateHeaderUI();
  showToast('💭 Сохранено');
}

/* ============================================================
   5. ДНЕВНИК ПОБЕД
   ============================================================ */
function renderWins() {
  const el = document.getElementById('winsContainer');
  if (!el) return;

  const today = getToday();
  const wins = state.wins[today] || [];

  let html =
    '<div class="card" style="padding:14px">' +
      '<div style="display:flex;gap:8px">' +
        '<input class="plan-input" id="winInput" placeholder="Маленькая победа сегодня..." style="margin:0">' +
        '<button class="btn-small purple" onclick="addWin()">➕</button>' +
      '</div>' +
    '</div>';

  if (!wins.length) {
    html += '<div class="card"><div class="info-text">Запиши первую победу дня 👆</div></div>';
  } else {
    html += wins.map((w, i) =>
      '<div class="card" style="display:flex;gap:12px;align-items:center;padding:12px">' +
        '<div style="font-size:22px">🏆</div>' +
        '<div style="flex:1;font-size:13px;font-weight:700">' + escapeHtml(w) + '</div>' +
        '<button class="btn-small danger" onclick="removeWin(' + i + ')">✖</button>' +
      '</div>'
    ).join('');
  }

  el.innerHTML = html;
}

function addWin() {
  const inp = document.getElementById('winInput');
  if (!inp) return;
  const v = inp.value.trim();
  if (!v) return;

  const today = getToday();
  if (!state.wins[today]) state.wins[today] = [];
  state.wins[today].push(v.slice(0, 150));

  inp.value = '';
  addXP(5, 'Победа записана');
  registerActivity();
  saveState();
  renderWins();
  showToast('🏆 +победа');
  updateHeaderUI();
}

function removeWin(i) {
  const today = getToday();
  if (!state.wins[today]) return;
  state.wins[today].splice(i, 1);
  saveState();
  renderWins();
}

/* ============================================================
   6. БЛАГОДАРНОСТЬ
   ============================================================ */
function renderGratitude() {
  const el = document.getElementById('gratitudeContainer');
  if (!el) return;

  const today = getToday();
  const items = state.gratitude[today] || [];

  let html =
    '<div class="card" style="padding:14px">' +
      '<div style="display:flex;gap:8px">' +
        '<input class="plan-input" id="gratInput" placeholder="За что благодарен?" style="margin:0">' +
        '<button class="btn-small purple" onclick="addGratitude()">➕</button>' +
      '</div>' +
    '</div>';

  if (!items.length) {
    html += '<div class="card"><div class="info-text">3 вещи, за которые ты благодарен сегодня</div></div>';
  } else {
    html += items.map((g, i) =>
      '<div class="card" style="display:flex;gap:12px;align-items:center;padding:12px">' +
        '<div style="font-size:22px">🙏</div>' +
        '<div style="flex:1;font-size:13px;font-weight:700">' + escapeHtml(g) + '</div>' +
        '<button class="btn-small danger" onclick="removeGratitude(' + i + ')">✖</button>' +
      '</div>'
    ).join('');
  }

  el.innerHTML = html;
}

function addGratitude() {
  const inp = document.getElementById('gratInput');
  if (!inp) return;
  const v = inp.value.trim();
  if (!v) return;

  const today = getToday();
  if (!state.gratitude[today]) state.gratitude[today] = [];
  state.gratitude[today].push(v.slice(0, 150));

  inp.value = '';
  addXP(5, 'Благодарность');
  registerActivity();
  saveState();
  renderGratitude();
  showToast('🙏 Спасибо записано');
  updateHeaderUI();
}

function removeGratitude(i) {
  const today = getToday();
  if (!state.gratitude[today]) return;
  state.gratitude[today].splice(i, 1);
  saveState();
  renderGratitude();
}

/* ============================================================
   7. КОЛЕСО БАЛАНСА
   ============================================================ */
function renderBalance() {
  const el = document.getElementById('balanceContainer');
  if (!el) return;

  const today = getToday();
  const todayData = state.balance[today] || null;

  let html = '';

  if (todayData) {
    html +=
      '<div class="card primary" style="padding:14px">' +
        '<div style="display:flex;justify-content:center">' +
          '<canvas id="balanceRadar" width="320" height="320" style="max-width:100%"></canvas>' +
        '</div>' +
        '<button class="btn-small purple" style="width:100%;margin-top:10px" onclick="openBalanceEdit()">✏️ Изменить оценки</button>' +
      '</div>';
  } else {
    html +=
      '<div class="card primary" style="text-align:center;padding:28px 20px">' +
        '<div style="font-size:60px;margin-bottom:12px">⚖️</div>' +
        '<div style="font-size:16px;font-weight:900;margin-bottom:8px">Оцени 8 сфер жизни</div>' +
        '<div class="info-text" style="margin-bottom:16px">От 1 до 10 — насколько ты удовлетворён каждой сферой</div>' +
        '<button class="btn primary" onclick="openBalanceEdit()">🎯 Начать</button>' +
      '</div>';
  }

  el.innerHTML = html;

  if (todayData) {
    setTimeout(() => drawBalanceRadar(todayData), 50);
  }
}

function drawBalanceRadar(data) {
  const canvas = document.getElementById('balanceRadar');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const cx = W / 2;
  const cy = W / 2;
  const R = W / 2 - 40;
  const n = BALANCE_SPHERES.length;

  ctx.clearRect(0, 0, W, W);

  /* сетка */
  for (let lvl = 1; lvl <= 5; lvl++) {
    ctx.beginPath();
    const r = (R * lvl) / 5;
    for (let i = 0; i <= n; i++) {
      const a = (Math.PI * 2 * i) / n - Math.PI / 2;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(255,255,255,.08)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  /* лучи */
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
    ctx.strokeStyle = 'rgba(255,255,255,.08)';
    ctx.stroke();
  }

  /* значения */
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    const val = (data[BALANCE_SPHERES[i].id] || 5) / 10;
    const x = cx + Math.cos(a) * R * val;
    const y = cy + Math.sin(a) * R * val;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(79,172,254,.3)';
  ctx.fill();
  ctx.strokeStyle = '#4facfe';
  ctx.lineWidth = 2;
  ctx.stroke();

  /* точки */
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    const val = (data[BALANCE_SPHERES[i].id] || 5) / 10;
    const x = cx + Math.cos(a) * R * val;
    const y = cy + Math.sin(a) * R * val;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#4facfe';
    ctx.fill();
  }

  /* подписи */
  ctx.font = 'bold 11px sans-serif';
  ctx.fillStyle = '#a8a8bd';
  ctx.textAlign = 'center';
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    const x = cx + Math.cos(a) * (R + 22);
    const y = cy + Math.sin(a) * (R + 22);
    ctx.fillText(BALANCE_SPHERES[i].icon, x, y + 4);
  }
}

function openBalanceEdit() {
  const el = document.getElementById('balanceEditList');
  if (!el) return;

  const today = getToday();
  const existing = state.balance[today] || {};

  el.innerHTML = BALANCE_SPHERES.map(s =>
    '<div style="margin-bottom:14px">' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:6px">' +
        '<span style="font-size:13px;font-weight:800">' + s.icon + ' ' + escapeHtml(s.name) + '</span>' +
        '<b style="font-size:13px;color:var(--accent-1)" id="balVal_' + s.id + '">' + (existing[s.id] || 5) + '</b>' +
      '</div>' +
      '<input type="range" min="1" max="10" value="' + (existing[s.id] || 5) + '" ' +
        'style="width:100%" oninput="document.getElementById(\'balVal_' + s.id + '\').textContent = this.value" ' +
        'data-sphere="' + s.id + '" class="bal-slider">' +
    '</div>'
  ).join('');

  openModal('balanceEditModal');
}

function saveBalance() {
  const today = getToday();
  const data = {};
  document.querySelectorAll('.bal-slider').forEach(s => {
    data[s.dataset.sphere] = parseInt(s.value, 10);
  });

  const isNew = !state.balance[today];
  state.balance[today] = data;

  if (isNew) {
    addXP(20, 'Колесо баланса заполнено');
    registerActivity();
    if (typeof unlockAchievement === 'function') unlockAchievement('a_balance');
  }

  saveState();
  closeModal('balanceEditModal');
  renderBalance();
  updateHeaderUI();
  showToast('⚖️ Баланс сохранён');
}

/* ============================================================
   8. ИНСАЙТЫ НЕДЕЛИ
   ============================================================ */
function renderInsights() {
  const el = document.getElementById('insightsContainer');
  if (!el) return;

  const week = getWeekKey();
  const items = state.insights || [];

  let html =
    '<div class="card" style="padding:14px">' +
      '<div style="display:flex;gap:8px">' +
        '<input class="plan-input" id="insightInput" placeholder="Что понял за неделю?" style="margin:0">' +
        '<button class="btn-small purple" onclick="addInsight()">➕</button>' +
      '</div>' +
    '</div>';

  if (!items.length) {
    html += '<div class="card"><div class="info-text">Пока нет инсайтов. Запиши первый 👆</div></div>';
  } else {
    html += items.slice().reverse().map((it, i) =>
      '<div class="card" style="padding:12px">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">' +
          '<div style="flex:1;min-width:0">' +
            '<div style="font-size:10.5px;color:var(--text-soft);font-weight:800;margin-bottom:4px">' + it.week + '</div>' +
            '<div style="font-size:13px;font-weight:700;line-height:1.5">' + escapeHtml(it.text) + '</div>' +
          '</div>' +
          '<button class="btn-small danger" onclick="removeInsight(' + (items.length - 1 - i) + ')">✖</button>' +
        '</div>' +
      '</div>'
    ).join('');
  }

  el.innerHTML = html;
}

function addInsight() {
  const inp = document.getElementById('insightInput');
  if (!inp) return;
  const v = inp.value.trim();
  if (!v) return;

  if (!state.insights) state.insights = [];
  state.insights.push({ week: getWeekKey(), text: v.slice(0, 200), t: Date.now() });

  inp.value = '';
  addXP(10, 'Инсайт недели');
  registerActivity();
  saveState();
  renderInsights();
  showToast('💡 Инсайт записан');
  updateHeaderUI();
}

function removeInsight(i) {
  if (!state.insights || !state.insights[i]) return;
  state.insights.splice(i, 1);
  saveState();
  renderInsights();
}

/* ============================================================
   ЭКСПОРТ 9.1
   ============================================================ */
window.renderProfile = renderProfile;
window.openProfile = openProfile;
window.quickProfile = quickProfile;
window.pickGender = pickGender;
window.pickGoal = pickGoal;
window.pickActivity = pickActivity;
window.saveProfile = saveProfile;

window.openAvatarPicker = openAvatarPicker;
window.pickAvatar = pickAvatar;

window.openProfileMealsModal = openProfileMealsModal;
window.pickMealCount = pickMealCount;
window.updateMealTime = updateMealTime;
window.saveMealSchedule = saveMealSchedule;

window.renderReflection = renderReflection;
window.saveReflection = saveReflection;

window.renderWins = renderWins;
window.addWin = addWin;
window.removeWin = removeWin;

window.renderGratitude = renderGratitude;
window.addGratitude = addGratitude;
window.removeGratitude = removeGratitude;

window.renderBalance = renderBalance;
window.openBalanceEdit = openBalanceEdit;
window.saveBalance = saveBalance;

window.renderInsights = renderInsights;
window.addInsight = addInsight;
window.removeInsight = removeInsight;

console.log('✅ Путь 16 · Часть 9.1 (профиль, рефлексия, победы, благодарность, баланс, инсайты)');
/* ============================================================
   9. АНАЛИТИКА
   ============================================================ */
function renderAnalytics() {
  const el = document.getElementById('analyticsContainer');
  if (!el) return;

  const days = Object.keys(state.history).sort();
  const last30 = days.slice(-30);

  /* средние */
  const totalXP = last30.reduce((s, k) => s + (state.history[k].xp || 0), 0);
  const avgXP = last30.length ? Math.round(totalXP / last30.length) : 0;

  /* топ практик */
  const practiceCount = {};
  days.forEach(k => {
    (state.history[k].practices || []).forEach(p => {
      practiceCount[p] = (practiceCount[p] || 0) + 1;
    });
  });
  const topPractices = Object.entries(practiceCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

  /* активность по дням недели */
  const weekdayCount = [0,0,0,0,0,0,0];
  days.forEach(k => {
    const d = new Date(k + 'T00:00:00').getDay();
    weekdayCount[d]++;
  });
  const weekdayNames = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];
  const maxWeekday = Math.max(1, ...weekdayCount);

  /* активность по часам (из log) */
  const hourCount = new Array(24).fill(0);
  (state.log || []).forEach(l => {
    const h = new Date(l.t).getHours();
    hourCount[h]++;
  });
  const maxHour = Math.max(1, ...hourCount);

  let html = '';

  /* сводка */
  html +=
    '<div class="card primary" style="padding:16px;margin-bottom:14px">' +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;text-align:center">' +
        '<div><div style="font-size:22px;font-weight:900;color:var(--accent-1)">' + days.length + '</div><div style="font-size:9.5px;font-weight:800;color:var(--text-soft);text-transform:uppercase">Всего дней</div></div>' +
        '<div><div style="font-size:22px;font-weight:900;color:var(--green)">' + state.streak + '</div><div style="font-size:9.5px;font-weight:800;color:var(--text-soft);text-transform:uppercase">Стрик</div></div>' +
        '<div><div style="font-size:22px;font-weight:900;color:var(--accent-2)">' + avgXP + '</div><div style="font-size:9.5px;font-weight:800;color:var(--text-soft);text-transform:uppercase">XP/день</div></div>' +
      '</div>' +
    '</div>';

  /* топ практик */
  if (topPractices.length) {
    html += '<div style="font-size:11px;font-weight:800;color:var(--text-soft);letter-spacing:1.5px;text-transform:uppercase;margin:16px 0 8px">🏆 Топ практик</div>';
    const maxP = topPractices[0][1];
    html += topPractices.map(([name, count]) =>
      '<div class="card" style="padding:10px 12px;margin-bottom:6px">' +
        '<div style="display:flex;justify-content:space-between;margin-bottom:4px">' +
          '<span style="font-size:12.5px;font-weight:800">' + escapeHtml(name) + '</span>' +
          '<span style="font-size:12px;font-weight:900;color:var(--accent-1)">' + count + '×</span>' +
        '</div>' +
        '<div class="progress-bar" style="height:5px">' +
          '<div class="progress-fill" style="width:' + (count / maxP * 100) + '%"></div>' +
        '</div>' +
      '</div>'
    ).join('');
  }

  /* дни недели */
  html += '<div style="font-size:11px;font-weight:800;color:var(--text-soft);letter-spacing:1.5px;text-transform:uppercase;margin:16px 0 8px">📅 Активность по дням</div>';
  html += '<div class="card" style="padding:14px">' +
    '<div style="display:flex;align-items:flex-end;gap:6px;height:120px">' +
      weekdayCount.map((c, i) =>
        '<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%">' +
          '<div style="width:100%;background:linear-gradient(180deg,var(--accent-1),var(--accent-2));border-radius:6px 6px 0 0;height:' + (c / maxWeekday * 100) + '%;min-height:4px;transition:height .3s"></div>' +
          '<div style="font-size:10px;font-weight:800;color:var(--text-soft);margin-top:6px">' + weekdayNames[i] + '</div>' +
        '</div>'
      ).join('') +
    '</div>' +
  '</div>';

  /* часы */
  html += '<div style="font-size:11px;font-weight:800;color:var(--text-soft);letter-spacing:1.5px;text-transform:uppercase;margin:16px 0 8px">⏰ Активность по часам</div>';
  html += '<div class="card" style="padding:14px">' +
    '<div style="display:grid;grid-template-columns:repeat(12,1fr);gap:3px">' +
      hourCount.map((c, h) => {
        const intensity = c / maxHour;
        return '<div title="' + h + ':00 — ' + c + ' событий" style="aspect-ratio:1;border-radius:4px;background:rgba(79,172,254,' + (0.06 + intensity * 0.7) + ')"></div>';
      }).join('') +
    '</div>' +
    '<div style="display:flex;justify-content:space-between;font-size:9px;font-weight:800;color:var(--text-soft);margin-top:6px">' +
      '<span>00:00</span><span>12:00</span><span>23:00</span>' +
    '</div>' +
  '</div>';

  el.innerHTML = html;
}

/* ============================================================
   10. ДНК ПРИВЫЧЕК (90 дней)
   ============================================================ */
function renderDNA() {
  const el = document.getElementById('dnaWrap');
  if (!el) return;

  const today = new Date();
  const days = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(getDayKey(d));
  }

  function level(k) {
    const h = state.history[k];
    if (!h || !h.practices) return 0;
    const c = h.practices.length;
    if (c >= 5) return 4;
    if (c >= 3) return 3;
    if (c >= 2) return 2;
    if (c >= 1) return 1;
    return 0;
  }

  const colors = ['rgba(255,255,255,.05)', 'rgba(76,217,100,.3)', 'rgba(76,217,100,.55)', 'rgba(76,217,100,.8)', '#4cd964'];
  const activeDays = days.filter(k => level(k) > 0).length;
  const pct = Math.round((activeDays / 90) * 100);

  let html =
    '<div class="card primary" style="padding:16px;text-align:center;margin-bottom:14px">' +
      '<div style="font-size:44px;font-weight:900;background:linear-gradient(90deg,#4cd964,#00c6ff);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent">' + pct + '%</div>' +
      '<div class="info-text">' + activeDays + ' из 90 дней активно</div>' +
    '</div>';

  html += '<div class="card" style="padding:14px">';
  html += '<div style="display:grid;grid-template-columns:repeat(15, 1fr);gap:4px">';
  days.forEach(k => {
    const lvl = level(k);
    html += '<div title="' + k + '" style="aspect-ratio:1;border-radius:5px;background:' + colors[lvl] + ';cursor:pointer" onclick="showDayDetail(\'' + k + '\')"></div>';
  });
  html += '</div>';
  html += '<div style="display:flex;justify-content:space-between;font-size:10px;font-weight:800;color:var(--text-soft);margin-top:10px">' +
    '<span>90 дней назад</span><span>Сегодня</span>' +
  '</div>';
  html += '</div>';

  /* распределение */
  const dist = [0,0,0,0,0];
  days.forEach(k => dist[level(k)]++);
  html += '<div class="card" style="padding:14px;margin-top:14px">';
  html += '<div style="font-size:11px;font-weight:800;color:var(--text-soft);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:10px">Распределение</div>';
  ['Пропущено','1 практика','2 практики','3-4 практики','5+ практик'].forEach((label, i) => {
    html += '<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px">' +
      '<span style="font-weight:700">' + label + '</span>' +
      '<b style="color:' + (i === 0 ? 'var(--text-soft)' : 'var(--green)') + '">' + dist[i] + '</b>' +
    '</div>';
  });
  html += '</div>';

  el.innerHTML = html;
}

/* ============================================================
   11. ПРОГРЕСС (график 14 дней + календарь)
   ============================================================ */
function renderProgress() {
  renderXPChart();
  renderCalendar();

  /* детали */
  setText('detailXp', state.xp);
  setText('detailXpEarned', state.xpEarned);
  setText('detailStreak', state.maxStreak);
  setText('detailDone', state.totalPractices || 0);
  setText('detailAch', (state.achievements || []).length);
  setText('detailCards', (state.cards || []).length);
  setText('detailBosses', (state.bossesDefeated || []).length);
  setText('detailPets', (state.pets.owned || []).length);
  setText('detailGarden', (state.garden || []).length);
  setText('detailBees', (state.bees.hives || []).length);
  setText('detailMushrooms', (state.mushrooms || []).length);
}

function renderXPChart() {
  const el = document.getElementById('chart');
  if (!el) return;

  const days = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(getDayKey(d));
  }

  const values = days.map(k => (state.history[k] && state.history[k].xp) || 0);
  const max = Math.max(10, ...values);

  el.innerHTML =
    '<div style="display:flex;align-items:flex-end;gap:4px;height:120px;padding:4px 0">' +
      values.map((v, i) =>
        '<div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;height:100%" title="' + days[i] + ': ' + v + ' XP">' +
          '<div style="width:100%;background:linear-gradient(180deg,var(--accent-1),var(--accent-2));border-radius:4px 4px 0 0;height:' + Math.max(2, (v / max * 100)) + '%;transition:height .4s"></div>' +
        '</div>'
      ).join('') +
    '</div>' +
    '<div style="display:flex;justify-content:space-between;font-size:9px;font-weight:800;color:var(--text-soft);margin-top:6px">' +
      '<span>' + days[0].slice(5) + '</span>' +
      '<span>Сегодня</span>' +
    '</div>';
}

function renderCalendar() {
  const el = document.getElementById('calendar');
  if (!el) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const offset = (firstDay + 6) % 7;

  const monthNames = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];

  let html = '<div style="font-size:13px;font-weight:900;text-align:center;margin-bottom:10px">' +
    monthNames[month] + ' ' + year + '</div>';

  html += '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;font-size:10px;font-weight:800;color:var(--text-soft);text-align:center;margin-bottom:6px">' +
    ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d => '<div>' + d + '</div>').join('') +
  '</div>';

  html += '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px">';
  for (let i = 0; i < offset; i++) html += '<div></div>';

  for (let d = 1; d <= daysInMonth; d++) {
    const key = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    const h = state.history[key];
    const count = h && h.practices ? h.practices.length : 0;
    const isToday = key === getToday();

    let bg = 'rgba(255,255,255,.04)';
    if (count >= 3) bg = 'rgba(79,172,254,.8)';
    else if (count >= 2) bg = 'rgba(79,172,254,.5)';
    else if (count >= 1) bg = 'rgba(79,172,254,.25)';

    html += '<div onclick="showDayDetail(\'' + key + '\')" style="aspect-ratio:1;border-radius:6px;background:' + bg +
      ';display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:var(--text);cursor:pointer;border:1px solid ' +
      (isToday ? 'var(--accent-1)' : 'transparent') + '">' + d + '</div>';
  }
  html += '</div>';

  el.innerHTML = html;
}

/* ============================================================
   ЭКСПОРТ 9.2
   ============================================================ */
window.renderAnalytics = renderAnalytics;
window.renderDNA = renderDNA;
window.renderProgress = renderProgress;
window.renderXPChart = renderXPChart;
window.renderCalendar = renderCalendar;

console.log('✅ Путь 16 · Часть 9.2 (аналитика, ДНК, прогресс)');
/* ============================================================
   12. НАСТРОЙКИ
   ============================================================ */
function renderSettings() {
  renderThemePicker();
  renderFractalPicker();
  renderFrequencyPicker();
  renderSoundPicker();
  renderCustomAffirmations();
  renderCustomPractices();
  updateSwitchUI();
  setText('appVersion', APP_VERSION);
}

function updateSwitchUI() {
  const s = state.settings;
  setSwitch('switchSound', s.sound);
  setSwitch('switchNotify', s.notify);
  setSwitch('switchBattery', s.batterySaver);
  setSwitch('switchMotion', s.reducedMotion);
  setSwitch('switchSeasonal', s.seasonal);
}

function setSwitch(id, on) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('on', !!on);
}

/* ---------- ТЕМА ---------- */
function renderThemePicker() {
  const el = document.getElementById('themePicker');
  if (!el) return;

  el.className = 'theme-picker';
  el.innerHTML = THEMES.map(t =>
    '<button class="theme-opt ' + (t.id === state.settings.theme ? 'active' : '') + '" ' +
      'onclick="pickTheme(\'' + t.id + '\')">' +
      '<span class="theme-ico">' + t.icon + '</span>' +
      escapeHtml(t.name) +
    '</button>'
  ).join('');
}

function pickTheme(id) {
  state.settings.theme = id;
  applyTheme(id);
  saveState();
  renderThemePicker();
  showToast('🎨 Тема: ' + (THEMES.find(t => t.id === id) || {}).name);
}

function applyTheme(id) {
  document.documentElement.setAttribute('data-theme', id);
  const theme = THEMES.find(t => t.id === id);
  if (theme) {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme.color);
  }
}

/* ---------- ФРАКТАЛ ---------- */
function renderFractalPicker() {
  const el = document.getElementById('fractalPicker');
  if (!el) return;

  el.className = 'fractal-picker';
  el.innerHTML = FRACTALS.map(f =>
    '<button class="fractal-opt ' + (f.id === state.settings.fractal ? 'active' : '') + '" ' +
      'onclick="pickFractal(\'' + f.id + '\')">' +
      '<span class="fractal-ico">' + f.icon + '</span>' +
      escapeHtml(f.name) +
    '</button>'
  ).join('');
}

function pickFractal(id) {
  state.settings.fractal = id;
  saveState();
  renderFractalPicker();
  if (typeof window.restartFractal === 'function') window.restartFractal(id);
  showToast('🌀 Фрактал: ' + (FRACTALS.find(f => f.id === id) || {}).name);
}

/* ---------- ЧАСТОТЫ ---------- */
function renderFrequencyPicker() {
  const el = document.getElementById('frequencyPicker');
  if (!el) return;

  el.className = 'sound-grid';
  el.innerHTML = FREQUENCIES.map(f =>
    '<button class="sound-opt" onclick="playFrequency(' + f.hz + ')">' +
      '<span class="sound-ico">' + f.icon + '</span>' +
      f.hz + ' Гц<br>' +
      '<span style="font-size:9px;color:var(--text-soft)">' + escapeHtml(f.name) + '</span>' +
    '</button>'
  ).join('');
}

/* ---------- ЗВУКИ ПРИРОДЫ ---------- */
function renderSoundPicker() {
  const el = document.getElementById('soundPicker');
  if (!el) return;

  el.className = 'sound-grid';
  el.innerHTML = NATURE_SOUNDS.map(s =>
    '<button class="sound-opt" onclick="playNatureSound(\'' + s.id + '\')">' +
      '<span class="sound-ico">' + s.icon + '</span>' +
      escapeHtml(s.name) +
    '</button>'
  ).join('');
}

/* ---------- СВОИ АФФИРМАЦИИ ---------- */
function renderCustomAffirmations() {
  const el = document.getElementById('customAffirmationsList');
  if (!el) return;

  const list = state.customAffirmations || [];
  if (!list.length) {
    el.innerHTML = '<div class="info-text">Своих аффирмаций пока нет.</div>';
    return;
  }

  el.innerHTML = list.map((a, i) =>
    '<div class="card" style="display:flex;gap:10px;align-items:center;padding:10px 12px;margin-bottom:6px">' +
      '<div style="flex:1;font-size:12.5px;font-weight:700;font-style:italic">«' + escapeHtml(a) + '»</div>' +
      '<button class="btn-small danger" onclick="removeCustomAffirmation(' + i + ')">✖</button>' +
    '</div>'
  ).join('');
}

function addCustomAffirmation() {
  const inp = document.getElementById('newAffirmation');
  if (!inp) return;
  const v = inp.value.trim();
  if (!v) { showToast('Введи текст'); return; }

  if (!state.customAffirmations) state.customAffirmations = [];
  state.customAffirmations.push(v.slice(0, 100));
  inp.value = '';
  saveState();
  renderCustomAffirmations();
  showToast('✨ Аффирмация добавлена');
}

function removeCustomAffirmation(i) {
  if (!state.customAffirmations) return;
  state.customAffirmations.splice(i, 1);
  saveState();
  renderCustomAffirmations();
}

/* ---------- СВОИ ПРАКТИКИ ---------- */
function renderCustomPractices() {
  const el = document.getElementById('customList');
  if (!el) return;

  const list = state.customPractices || [];
  if (!list.length) {
    el.innerHTML = '<div class="info-text">Своих практик пока нет.</div>';
    return;
  }

  el.innerHTML = list.map((p, i) =>
    '<div class="card" style="display:flex;gap:10px;align-items:center;padding:10px 12px;margin-bottom:6px">' +
      '<div style="font-size:22px">' + (p.icon || '✨') + '</div>' +
      '<div style="flex:1;min-width:0">' +
        '<div style="font-size:13px;font-weight:800">' + escapeHtml(p.name) + '</div>' +
        '<div style="font-size:10.5px;color:var(--text-soft);font-weight:700">' +
          (PRACTICE_CATS[p.cat] ? PRACTICE_CATS[p.cat].icon + ' ' + PRACTICE_CATS[p.cat].name : '') +
        '</div>' +
      '</div>' +
      '<button class="btn-small danger" onclick="removeCustomPractice(' + i + ')">✖</button>' +
    '</div>'
  ).join('');
}

function addCustomPractice() {
  const nameEl = document.getElementById('newName');
  const catEl = document.getElementById('newCat');
  if (!nameEl || !catEl) return;

  const name = nameEl.value.trim();
  const cat = catEl.value;

  if (!name) { showToast('Введи название'); return; }
  if (name.length < 2) { showToast('Слишком короткое'); return; }

  if (!state.customPractices) state.customPractices = [];
  state.customPractices.push({
    id: 'custom_' + Date.now(),
    name: name.slice(0, 30),
    cat: cat,
    icon: '✨',
    desc: 'Своя практика',
    xp: 20,
    sec: 300,
    hint: 'Выполни и подтверди'
  });

  nameEl.value = '';
  saveState();
  renderCustomPractices();
  showToast('✨ Практика добавлена');
}

function removeCustomPractice(i) {
  if (!state.customPractices) return;
  state.customPractices.splice(i, 1);
  saveState();
  renderCustomPractices();
}

/* ---------- ПЕРЕКЛЮЧАТЕЛИ ---------- */
function toggleSound() {
  state.settings.sound = !state.settings.sound;
  saveState();
  updateSwitchUI();
  showToast(state.settings.sound ? '🔊 Звуки вкл' : '🔇 Звуки выкл');
}

function toggleNotify() {
  state.settings.notify = !state.settings.notify;
  saveState();
  updateSwitchUI();

  if (state.settings.notify && 'Notification' in window) {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(p => {
        if (p !== 'granted') {
          state.settings.notify = false;
          saveState();
          updateSwitchUI();
          showToast('🔔 Уведомления запрещены');
        } else {
          showToast('🔔 Уведомления включены');
        }
      });
    } else if (Notification.permission === 'granted') {
      showToast('🔔 Уведомления включены');
    } else {
      state.settings.notify = false;
      saveState();
      updateSwitchUI();
      showToast('🔔 Уведомления запрещены в браузере');
    }
  } else if (state.settings.notify) {
    showToast('🔔 Уведомления недоступны');
  }
}

function toggleBatterySaver() {
  state.settings.batterySaver = !state.settings.batterySaver;
  saveState();
  updateSwitchUI();
  applyBatterySaver();
  showToast(state.settings.batterySaver ? '💾 Экономия энергии вкл' : '⚡ Обычный режим');
}

function applyBatterySaver() {
  const notice = document.getElementById('batterySaverNotice');
  const canvas = document.getElementById('fractalCanvas');

  if (state.settings.batterySaver) {
    if (notice) notice.style.display = 'block';
    if (canvas) canvas.style.display = 'none';
    if (window._fractalRAF) cancelAnimationFrame(window._fractalRAF);
  } else {
    if (notice) notice.style.display = 'none';
    if (canvas) canvas.style.display = '';
    if (typeof window.startFractal === 'function') window.startFractal();
  }
}

function toggleReducedMotion() {
  state.settings.reducedMotion = !state.settings.reducedMotion;
  document.body.classList.toggle('reduced-motion', state.settings.reducedMotion);
  saveState();
  updateSwitchUI();
  showToast(state.settings.reducedMotion ? '🎬 Анимации уменьшены' : '🎬 Анимации включены');
}

function toggleSeasonal() {
  state.settings.seasonal = !state.settings.seasonal;
  saveState();
  updateSwitchUI();
  applySeasonal();
  showToast(state.settings.seasonal ? '🌸 Сезонная тема вкл' : '🌸 Сезонная тема выкл');
}

function applySeasonal() {
  const overlay = document.getElementById('seasonalOverlay');
  if (!overlay) return;

  if (!state.settings.seasonal) {
    overlay.classList.remove('active');
    return;
  }

  const month = new Date().getMonth() + 1;
  let season = null;
  for (const k in SEASONS) {
    if (SEASONS[k].months.includes(month)) { season = SEASONS[k]; break; }
  }

  if (season) {
    overlay.style.background = 'linear-gradient(180deg, ' + season.colorA + ', ' + season.colorB + ')';
    overlay.classList.add('active');
  }
}

/* ============================================================
   13. ТАЙМЕРЫ
   ============================================================ */
let timerState = {
  type: 'stopwatch',
  running: false,
  elapsed: 0,
  duration: 0,
  raf: null,
  lastTick: 0
};

function openTimer(type) {
  timerState.type = type;
  timerState.running = false;
  timerState.elapsed = 0;

  const titleEl = document.getElementById('timerTitle');
  const displayEl = document.getElementById('timerDisplay');
  const hintEl = document.getElementById('timerHint');
  const btn = document.getElementById('timerBtn');

  if (type === 'stopwatch') {
    titleEl.textContent = '⏱ Секундомер';
    hintEl.textContent = '';
    timerState.duration = 0;
  } else if (type === 'pomodoro') {
    titleEl.textContent = '🍅 Pomodoro 25/5';
    hintEl.textContent = '25 минут работы, 5 минут отдыха';
    timerState.duration = 25 * 60;
  } else {
    titleEl.textContent = '⏰ Обратный отсчёт';
    hintEl.textContent = 'Введи минуты и нажми «Начать»';
    timerState.duration = 5 * 60;
  }

  if (displayEl) displayEl.textContent = type === 'stopwatch' ? '00:00' : formatTime(timerState.duration);
  if (btn) btn.textContent = 'Начать';

  openModal('timerModal');
}

function toggleTimer() {
  if (timerState.running) {
    timerState.running = false;
    if (timerState.raf) cancelAnimationFrame(timerState.raf);
    document.getElementById('timerBtn').textContent = 'Продолжить';
  } else {
    timerState.running = true;
    timerState.lastTick = performance.now();
    document.getElementById('timerBtn').textContent = 'Пауза';
    tickTimer();
  }
}

function tickTimer() {
  if (!timerState.running) return;

  const now = performance.now();
  const delta = (now - timerState.lastTick) / 1000;
  timerState.lastTick = now;

  if (timerState.type === 'stopwatch') {
    timerState.elapsed += delta;
    document.getElementById('timerDisplay').textContent = formatTime(Math.floor(timerState.elapsed));
  } else {
    timerState.elapsed += delta;
    const left = Math.max(0, timerState.duration - timerState.elapsed);
    document.getElementById('timerDisplay').textContent = formatTime(Math.ceil(left));

    if (left <= 0) {
      timerState.running = false;
      document.getElementById('timerBtn').textContent = 'Готово';
      playBeep();
      showToast('⏰ Время вышло!');
      return;
    }
  }

  timerState.raf = requestAnimationFrame(tickTimer);
}

function closeTimer() {
  timerState.running = false;
  if (timerState.raf) cancelAnimationFrame(timerState.raf);
  closeModal('timerModal');
}

function playBeep() {
  if (!state.settings.sound) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) { /* игнор */ }
}

/* ============================================================
   14. ДЫХАНИЕ
   ============================================================ */
let breathState = { running: false, phase: 0, timer: null, cycles: 0, maxCycles: 4 };

function openBreath() {
  breathState.running = false;
  breathState.phase = 0;
  breathState.cycles = 0;

  const circle = document.getElementById('breathCircle');
  const phaseEl = document.getElementById('breathPhase');
  const btn = document.getElementById('breathBtn');

  if (circle) { circle.textContent = 'Приготовься'; circle.className = 'breath-circle'; }
  if (phaseEl) phaseEl.textContent = 'Нажми «Начать»';
  if (btn) { btn.textContent = 'Начать'; btn.onclick = toggleBreath; }

  openModal('breathModal');
}

function toggleBreath() {
  if (breathState.running) {
    breathState.running = false;
    clearTimeout(breathState.timer);
    document.getElementById('breathBtn').textContent = 'Продолжить';
    return;
  }

  breathState.running = true;
  document.getElementById('breathBtn').textContent = 'Пауза';
  runBreathPhase();
}

function runBreathPhase() {
  if (!breathState.running) return;

  const ex = BREATH_EXERCISES.relax;
  const phases = [
    { name: 'Вдох',    dur: ex.inhale, cls: 'inhale' },
    { name: 'Задержка', dur: ex.hold,   cls: 'hold' },
    { name: 'Выдох',   dur: ex.exhale, cls: 'exhale' }
  ];

  const p = phases[breathState.phase];
  const circle = document.getElementById('breathCircle');
  const phaseEl = document.getElementById('breathPhase');

  if (circle) {
    circle.textContent = p.name;
    circle.className = 'breath-circle ' + p.cls;
  }
  if (phaseEl) phaseEl.textContent = p.name + ' · ' + p.dur + ' сек';

  breathState.timer = setTimeout(() => {
    breathState.phase = (breathState.phase + 1) % phases.length;
    if (breathState.phase === 0) {
      breathState.cycles++;
      if (breathState.cycles >= ex.cycles) {
        breathState.running = false;
        if (circle) circle.textContent = '✅ Готово';
        if (phaseEl) phaseEl.textContent = 'Цикл завершён';
        document.getElementById('breathBtn').textContent = 'Ещё раз';
        return;
      }
    }
    runBreathPhase();
  }, p.dur * 1000);
}

function closeBreath() {
  breathState.running = false;
  clearTimeout(breathState.timer);
  closeModal('breathModal');
}

/* ============================================================
   15. ГОЛОСОВЫЕ МЕДИТАЦИИ
   ============================================================ */
let voiceState = { active: false, index: 0, timer: null, utter: null };

function startVoiceMeditation(type) {
  if (!('speechSynthesis' in window)) {
    showToast('⚠️ Голос не поддерживается');
    return;
  }

  stopVoiceMeditation();

  const text = VOICE_MEDITATIONS[type];
  if (!text) return;

  voiceState.active = true;
  voiceState.index = 0;

  const stopBtn = document.getElementById('stopVoiceBtn');
  if (stopBtn) stopBtn.classList.add('show');

  const modal = document.getElementById('voiceModal');
  const titleEl = document.getElementById('voiceTitle');
  const textEl = document.getElementById('voiceText');

  if (titleEl) titleEl.textContent = { relax:'🌊 Расслабление', focus:'🎯 Фокус', gratitude:'💗 Благодарность' }[type] || 'Медитация';
  if (modal) modal.classList.add('show');

  function speakNext() {
    if (!voiceState.active || voiceState.index >= text.length) {
      if (textEl) textEl.textContent = '✅ Медитация завершена';
      setTimeout(stopVoiceMeditation, 2000);
      return;
    }

    const phrase = text[voiceState.index];
    if (textEl) textEl.textContent = phrase;

    const u = new SpeechSynthesisUtterance(phrase);
    u.lang = 'ru-RU';
    u.rate = 0.85;
    u.pitch = 1;

    u.onend = () => {
      voiceState.index++;
      voiceState.timer = setTimeout(speakNext, 1200);
    };

    u.onerror = () => {
      voiceState.index++;
      voiceState.timer = setTimeout(speakNext, 800);
    };

    voiceState.utter = u;
    window.speechSynthesis.speak(u);
  }

  speakNext();
}

function stopVoiceMeditation() {
  voiceState.active = false;
  clearTimeout(voiceState.timer);

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  const stopBtn = document.getElementById('stopVoiceBtn');
  if (stopBtn) stopBtn.classList.remove('show');

  closeModal('voiceModal');
}

/* ============================================================
   16. ЗВУКИ (Web Audio)
   ============================================================ */
let audioCtx = null;
let currentOscillator = null;

function getAudioCtx() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { return null; }
  }
  return audioCtx;
}

function playFrequency(hz) {
  if (!state.settings.sound) { showToast('🔇 Звук выключен'); return; }

  const ctx = getAudioCtx();
  if (!ctx) return;

  if (currentOscillator) {
    try { currentOscillator.stop(); } catch (e) {}
    currentOscillator = null;
  }

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = hz;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 1);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 30);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 30);

    currentOscillator = osc;

    const f = FREQUENCIES.find(x => x.hz === hz);
    showToast('🎵 ' + hz + ' Гц · ' + (f ? f.name : '') + ' (30 сек)');
  } catch (e) {
    showToast('⚠️ Ошибка звука');
  }
}

function playNatureSound(id) {
  if (!state.settings.sound) { showToast('🔇 Звук выключен'); return; }
  const s = NATURE_SOUNDS.find(x => x.id === id);
  showToast('🎧 ' + (s ? s.name : '') + ' — скоро');

  /* TODO: реальные звуки природы (аудиофайлы) */
  /* Пока — визуальный отклик */
}

/* ============================================================
   17. ЭКСПОРТ / ИМПОРТ / СБРОС
   ============================================================ */
function exportData() {
  try {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'put16-backup-' + getToday() + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('📤 Файл сохранён');
  } catch (e) {
    showToast('⚠️ Ошибка экспорта');
  }
}

function importData(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);

      /* валидация */
      if (!parsed || typeof parsed !== 'object' || !('version' in parsed) || !('profile' in parsed)) {
        showToast('⚠️ Неверный формат');
        return;
      }

      if (!confirm('Импортировать данные? Текущий прогресс будет перезаписан.')) return;

      localStorage.setItem(BACKUP_KEY, JSON.stringify(state));
      state = deepMerge(defaultState(), parsed);
      saveState();
      applyTheme(state.settings.theme);
      applySeasonal();
      document.body.classList.toggle('reduced-motion', state.settings.reducedMotion);

      updateHeaderUI();
      renderAll();
      renderSettings();
      showToast('📥 Данные импортированы');
    } catch (err) {
      showToast('⚠️ Ошибка чтения файла');
      console.error(err);
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function resetAll() {
  if (!confirm('СБРОСИТЬ ВСЁ? Это удалит весь прогресс безвозвратно!')) return;
  if (!confirm('Точно? Резервная копия сохранена в бэкапе.')) return;

  try {
    localStorage.setItem(BACKUP_KEY, JSON.stringify(state));
  } catch (e) {}

  state = defaultState();
  saveState();
  location.reload();
}

/* ============================================================
   ЭКСПОРТ 9.3
   ============================================================ */
window.renderSettings = renderSettings;
window.applyTheme = applyTheme;
window.pickTheme = pickTheme;
window.pickFractal = pickFractal;

window.toggleSound = toggleSound;
window.toggleNotify = toggleNotify;
window.toggleBatterySaver = toggleBatterySaver;
window.toggleReducedMotion = toggleReducedMotion;
window.toggleSeasonal = toggleSeasonal;
window.applySeasonal = applySeasonal;
window.applyBatterySaver = applyBatterySaver;

window.addCustomAffirmation = addCustomAffirmation;
window.removeCustomAffirmation = removeCustomAffirmation;
window.addCustomPractice = addCustomPractice;
window.removeCustomPractice = removeCustomPractice;

window.openTimer = openTimer;
window.toggleTimer = toggleTimer;
window.closeTimer = closeTimer;

window.openBreath = openBreath;
window.toggleBreath = toggleBreath;
window.closeBreath = closeBreath;

window.startVoiceMeditation = startVoiceMeditation;
window.stopVoiceMeditation = stopVoiceMeditation;

window.playFrequency = playFrequency;
window.playNatureSound = playNatureSound;

window.exportData = exportData;
window.importData = importData;
window.resetAll = resetAll;

/* ---------- КОНЕЦ ЧАСТИ 9 ---------- */
console.log('✅ Путь 16 · Часть 9.3 (настройки, таймеры, звуки, экспорт)');
