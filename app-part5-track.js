/* ============================================================
   ПУТЬ 16 · СОТВОРЦОМ
   app-part5-track.js — ТРЕКЕРЫ (привычки, настроение, тело, финансы, план, цели)
   ============================================================ */

'use strict';

/* ============================================================
   1. ТРЕКЕР ПРИВЫЧЕК
   ============================================================ */
function getAllHabits() {
  return DEFAULT_HABITS;
}

function getHabitState(id) {
  if (!state.habits[id]) state.habits[id] = { days: {} };
  return state.habits[id];
}

function renderHabits() {
  const el = document.getElementById('habitsContainer');
  if (!el) return;

  const habits = getAllHabits();
  const today = new Date();
  const dates = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(getDayKey(d));
  }

  el.innerHTML = habits.map(h => {
    const hs = getHabitState(h.id);
    const days = hs.days || {};
    const streak = calcHabitStreak(days);

    return '<div class="card" style="padding:14px">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">' +
        '<div style="font-size:24px">' + h.icon + '</div>' +
        '<div style="flex:1;font-size:14px;font-weight:800">' + escapeHtml(h.name) + '</div>' +
        '<div style="font-size:11px;font-weight:900;color:var(--green)">🔥 ' + streak + '</div>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(14, 1fr);gap:3px">' +
        dates.map(k => {
          const on = !!days[k];
          const isToday = k === getToday();
          return '<div onclick="toggleHabit(\'' + h.id + '\',\'' + k + '\')" ' +
            'style="aspect-ratio:1;border-radius:4px;cursor:pointer;background:' +
            (on ? 'linear-gradient(135deg, var(--accent-1), var(--accent-2))' : 'rgba(255,255,255,.06)') +
            ';border:1px solid ' + (isToday ? 'var(--accent-1)' : 'transparent') +
            ';transition:transform .15s" ' +
            'title="' + k + '"></div>';
        }).join('') +
      '</div>' +
    '</div>';
  }).join('');
}

function toggleHabit(habitId, dayKey) {
  const hs = getHabitState(habitId);
  if (!hs.days) hs.days = {};
  if (hs.days[dayKey]) {
    delete hs.days[dayKey];
  } else {
    hs.days[dayKey] = true;
    if (dayKey === getToday()) {
      addXP(5, 'Привычка отмечена');
      registerActivity();
    }
  }
  saveState();
  renderHabits();
  updateHeaderUI();
}

function calcHabitStreak(days) {
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const k = getDayKey(d);
    if (days[k]) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else if (i === 0) {
      /* сегодня можно пропустить — начинаем со вчера */
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

/* ============================================================
   2. НАСТРОЕНИЕ
   ============================================================ */
const MOOD_EMOJI = ['😭','😔','😐','🙂','😄'];
const MOOD_LABEL = ['Ужасно','Плохо','Нормально','Хорошо','Отлично'];
const MOOD_COLOR = ['#ff3b5c','#ff8c42','#ffd166','#4cd964','#00c6ff'];

let moodEditDay = '';

function renderMood() {
  const el = document.getElementById('moodContainer');
  const analyticEl = document.getElementById('moodAnalyticsContainer');
  if (!el) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const offset = (firstDay + 6) % 7; /* Пн = 0 */

  const monthNames = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];

  let html = '<div style="font-size:13px;font-weight:900;text-align:center;margin-bottom:12px">' +
    monthNames[month] + ' ' + year + '</div>';

  html += '<div style="display:grid;grid-template-columns:repeat(7, 1fr);gap:4px;text-align:center;font-size:10px;font-weight:800;color:var(--text-soft);margin-bottom:6px">' +
    ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d => '<div>' + d + '</div>').join('') +
  '</div>';

  html += '<div style="display:grid;grid-template-columns:repeat(7, 1fr);gap:4px">';
  for (let i = 0; i < offset; i++) html += '<div></div>';

  for (let d = 1; d <= daysInMonth; d++) {
    const key = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    const m = state.mood[key];
    const isToday = key === getToday();
    const bg = m ? MOOD_COLOR[m.mood - 1] : 'rgba(255,255,255,.06)';

    html += '<div onclick="openMoodPicker(\'' + key + '\')" ' +
      'style="aspect-ratio:1;border-radius:8px;cursor:pointer;background:' + bg +
      ';display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:' +
      (m ? '#fff' : 'var(--text-soft)') +
      ';border:1px solid ' + (isToday ? 'var(--accent-1)' : 'transparent') + ';transition:transform .15s">' +
      (m ? MOOD_EMOJI[m.mood - 1] : d) +
    '</div>';
  }
  html += '</div>';

  /* легенда */
  html += '<div style="display:flex;gap:8px;justify-content:center;margin-top:14px;flex-wrap:wrap">' +
    MOOD_EMOJI.map((e, i) =>
      '<div style="display:flex;align-items:center;gap:4px;font-size:10px;font-weight:700;color:var(--text-soft)">' +
        '<span style="font-size:14px">' + e + '</span>' + MOOD_LABEL[i] +
      '</div>'
    ).join('') +
  '</div>';

  el.innerHTML = html;

  /* аналитика */
  if (analyticEl) renderMoodAnalytics();
}

function renderMoodAnalytics() {
  const el = document.getElementById('moodAnalyticsContainer');
  if (!el) return;

  const keys = Object.keys(state.mood);
  if (!keys.length) {
    el.innerHTML = '<div class="card"><div class="info-text">Пока нет данных. Отметь настроение 👆</div></div>';
    return;
  }

  /* группировка по месяцам */
  const byMonth = {};
  keys.forEach(k => {
    const m = k.slice(0, 7);
    if (!byMonth[m]) byMonth[m] = [];
    byMonth[m].push(state.mood[k].mood);
  });

  const monthNames = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];

  el.innerHTML = Object.keys(byMonth).sort().reverse().slice(0, 6).map(mk => {
    const arr = byMonth[mk];
    const avg = arr.reduce((s, v) => s + v, 0) / arr.length;
    const monthIdx = parseInt(mk.slice(5, 7), 10) - 1;
    const year = mk.slice(0, 4);

    return '<div class="card" style="padding:12px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">' +
        '<div style="font-size:13px;font-weight:800">' + monthNames[monthIdx] + ' ' + year + '</div>' +
        '<div style="font-size:14px">' + MOOD_EMOJI[Math.round(avg) - 1] + '</div>' +
      '</div>' +
      '<div class="progress-bar" style="height:6px">' +
        '<div class="progress-fill" style="width:' + (avg / 5 * 100) + '%;background:' + MOOD_COLOR[Math.round(avg) - 1] + '"></div>' +
      '</div>' +
      '<div style="font-size:10.5px;color:var(--text-soft);font-weight:700;margin-top:4px">' +
        arr.length + ' дней · среднее ' + avg.toFixed(1) + '/5' +
      '</div>' +
    '</div>';
  }).join('');
}

function openMoodPicker(key) {
  moodEditDay = key;
  const existing = state.mood[key];

  const html =
    '<h2>😊 Настроение</h2>' +
    '<div class="info-text" style="margin-bottom:16px">' + key + '</div>' +
    '<div style="display:flex;gap:8px;justify-content:center;margin-bottom:16px">' +
      MOOD_EMOJI.map((e, i) =>
        '<button onclick="setMood(' + (i + 1) + ')" ' +
          'style="font-size:38px;padding:6px;border-radius:12px;background:' +
          (existing && existing.mood === i + 1 ? MOOD_COLOR[i] : 'var(--card)') +
          ';border:2px solid ' + (existing && existing.mood === i + 1 ? MOOD_COLOR[i] : 'var(--border)') +
          ';transition:transform .15s">' + e + '</button>'
      ).join('') +
    '</div>' +
    '<div class="plan-label">Заметка (опционально)</div>' +
    '<textarea class="mood-note-modal-textarea" id="moodQuickNote" placeholder="Что было? Что чувствовал?" maxlength="500">' +
      escapeHtml((existing && existing.note) || '') +
    '</textarea>' +
    '<button class="btn primary" onclick="saveMoodQuick()" style="width:100%">💾 Сохранить</button>' +
    '<button class="btn ghost" onclick="closeModal(\'moodNoteModal\')" style="width:100%;margin-top:8px">Закрыть</button>';

  /* используем модалку moodNoteModal */
  document.getElementById('moodNoteTitle').textContent = '😊 Настроение';
  document.getElementById('moodNoteDay').textContent = key;

  /* подменим содержимое через контейнер */
  const modal = document.getElementById('moodNoteModal');
  const content = modal.querySelector('.modal-content');
  content.innerHTML = html;
  modal.classList.add('show');
}

function setMood(v) {
  if (!moodEditDay) return;
  if (!state.mood[moodEditDay]) state.mood[moodEditDay] = { mood: 3, note: '' };
  state.mood[moodEditDay].mood = v;

  /* сохраняем заметку */
  const noteEl = document.getElementById('moodQuickNote');
  if (noteEl) state.mood[moodEditDay].note = noteEl.value;

  saveState();
  showToast('Настроение сохранено');
  closeModal('moodNoteModal');
  renderMood();

  if (moodEditDay === getToday()) {
    addXP(10, 'Настроение отмечено');
    registerActivity();
  }
}

function saveMoodQuick() {
  if (!moodEditDay) return;
  const noteEl = document.getElementById('moodQuickNote');
  if (noteEl && state.mood[moodEditDay]) state.mood[moodEditDay].note = noteEl.value;
  saveState();
  showToast('💾 Сохранено');
  closeModal('moodNoteModal');
}

/* заглушка (совместимость с HTML) */
function saveMoodNote() { saveMoodQuick(); }

/* ============================================================
   3. ТЕЛО
   ============================================================ */
let currentBodyTab = 'weight';

function switchBodyTab(tab) {
  currentBodyTab = tab;
  document.querySelectorAll('.body-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.bodyTab === tab);
  });
  document.querySelectorAll('.body-pane').forEach(p => {
    p.classList.toggle('active', p.id === 'bodyPane-' + tab);
  });

  if (tab === 'weight') renderBody();
  if (tab === 'workout') renderWorkout();
  if (tab === 'food') renderFood();
  if (tab === 'tips') renderTips();
}

function renderBody() {
  const el = document.getElementById('bodyContainer');
  if (!el) return;

  const weights = state.body.weight || [];

  /* быстрый ввод */
  let html =
    '<div class="card" style="padding:16px">' +
      '<div style="display:flex;gap:8px">' +
        '<input class="plan-input" id="weightInput" type="number" step="0.1" placeholder="Вес (кг)" style="margin:0">' +
        '<button class="btn-small purple" onclick="addWeight()">➕</button>' +
      '</div>' +
    '</div>';

  if (!weights.length) {
    html += '<div class="card"><div class="info-text">Записей пока нет. Добавь свой первый вес 👆</div></div>';
  } else {
    const last = weights[weights.length - 1];
    const first = weights[0];
    const diff = last.kg - first.kg;
    const diffColor = diff < 0 ? 'var(--green)' : diff > 0 ? 'var(--red)' : 'var(--text-soft)';

    html +=
      '<div class="card" style="padding:16px;display:flex;justify-content:space-between;align-items:center">' +
        '<div>' +
          '<div style="font-size:11px;font-weight:800;color:var(--text-soft);text-transform:uppercase;letter-spacing:1px">Сейчас</div>' +
          '<div style="font-size:28px;font-weight:900">' + last.kg + ' кг</div>' +
        '</div>' +
        '<div style="text-align:right">' +
          '<div style="font-size:11px;font-weight:800;color:var(--text-soft);text-transform:uppercase;letter-spacing:1px">Изм.</div>' +
          '<div style="font-size:20px;font-weight:900;color:' + diffColor + '">' +
            (diff > 0 ? '+' : '') + diff.toFixed(1) + ' кг' +
          '</div>' +
        '</div>' +
      '</div>';

    /* список последних 10 */
    html += '<div style="font-size:11px;font-weight:800;color:var(--text-soft);letter-spacing:1.5px;text-transform:uppercase;margin:16px 0 8px">История</div>';
    const recent = weights.slice(-10).reverse();
    html += recent.map((w, i) => {
      const prev = recent[i + 1];
      const delta = prev ? (w.kg - prev.kg) : 0;
      return '<div class="setting" style="padding:10px 14px">' +
        '<span class="setting-label">' + w.date + '</span>' +
        '<b class="setting-value" style="color:' + (delta < 0 ? 'var(--green)' : delta > 0 ? 'var(--red)' : 'var(--text-soft)') + '">' +
          w.kg + ' кг' + (delta ? ' (' + (delta > 0 ? '+' : '') + delta.toFixed(1) + ')' : '') +
        '</b>' +
      '</div>';
    }).join('');
  }

  el.innerHTML = html;
}

function addWeight() {
  const inp = document.getElementById('weightInput');
  if (!inp) return;
  const v = parseFloat(inp.value);
  if (!v || v < 20 || v > 400) { showToast('Введи корректный вес'); return; }

  const today = getToday();
  if (!state.body.weight) state.body.weight = [];

  /* если сегодня уже есть — обновим */
  const existing = state.body.weight.find(w => w.date === today);
  if (existing) existing.kg = v;
  else state.body.weight.push({ date: today, kg: v });

  state.profile.weight = v;
  inp.value = '';

  addXP(5, 'Вес записан');
  registerActivity();
  saveState();
  renderBody();
  showToast('⚖️ Вес записан');
  updateHeaderUI();
}

/* ============================================================
   4. ТРЕНИРОВКИ
   ============================================================ */
let currentWorkoutId = null;

function renderWorkout() {
  const el = document.getElementById('workoutContainer');
  if (!el) return;

  const workouts = state.body.workouts || [];

  let html =
    '<button class="btn primary" onclick="openWorkoutAdd()" style="margin-bottom:14px">➕ Новая тренировка</button>';

  if (!workouts.length) {
    html += '<div class="card"><div class="info-text">Пока нет тренировок. Создай первую 👆</div></div>';
  } else {
    html += workouts.slice().reverse().map(w =>
      '<div class="card" style="padding:14px">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
          '<div>' +
            '<div style="font-size:14px;font-weight:900">' + escapeHtml(w.name) + '</div>' +
            '<div style="font-size:11px;color:var(--text-soft);font-weight:700">' + w.date + '</div>' +
          '</div>' +
          '<button class="btn-small danger" onclick="deleteWorkout(\'' + w.id + '\')">✖</button>' +
        '</div>' +
        '<div style="font-size:11.5px;color:var(--text-dim);font-weight:600;margin-bottom:6px">' +
          (w.exercises && w.exercises.length ? w.exercises.length + ' упражнений' : 'Пока пусто') +
        '</div>' +
        (w.exercises || []).map(ex =>
          '<div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 0;border-top:1px solid var(--border)">' +
            '<span>' + escapeHtml(ex.name) + '</span>' +
            '<span style="color:var(--text-soft);font-weight:700">' + ex.sets + '×' + ex.reps + (ex.weight ? ' · ' + ex.weight + 'кг' : '') + '</span>' +
          '</div>'
        ).join('') +
        '<button class="btn-small" style="width:100%;margin-top:10px" onclick="openExerciseAdd(\'' + w.id + '\')">➕ Упражнение</button>' +
      '</div>'
    ).join('');
  }

  el.innerHTML = html;
}

function openWorkoutAdd() {
  document.getElementById('wName').value = '';
  document.getElementById('wDate').value = getToday();
  openModal('workoutAddModal');
}

function createWorkout() {
  const name = document.getElementById('wName').value.trim();
  const date = document.getElementById('wDate').value || getToday();
  if (!name) { showToast('Введи название'); return; }

  if (!state.body.workouts) state.body.workouts = [];
  state.body.workouts.push({
    id: 'w_' + Date.now(),
    name: name.slice(0, 40),
    date: date,
    exercises: [],
    created: Date.now()
  });

  addXP(20, 'Тренировка создана');
  registerActivity();
  saveState();
  closeModal('workoutAddModal');
  renderWorkout();
  showToast('💪 Тренировка создана');
  updateHeaderUI();
}

function deleteWorkout(id) {
  if (!confirm('Удалить тренировку?')) return;
  state.body.workouts = (state.body.workouts || []).filter(w => w.id !== id);
  saveState();
  renderWorkout();
}

function openExerciseAdd(workoutId) {
  currentWorkoutId = workoutId;
  document.getElementById('exName').value = '';
  document.getElementById('exSets').value = 3;
  document.getElementById('exReps').value = 10;
  document.getElementById('exWeight').value = 0;
  openModal('exerciseAddModal');
}

function addExercise() {
  if (!currentWorkoutId) return;
  const name = document.getElementById('exName').value.trim();
  if (!name) { showToast('Введи название'); return; }

  const sets = parseInt(document.getElementById('exSets').value, 10) || 3;
  const reps = parseInt(document.getElementById('exReps').value, 10) || 10;
  const weight = parseFloat(document.getElementById('exWeight').value) || 0;

  const w = (state.body.workouts || []).find(x => x.id === currentWorkoutId);
  if (!w) return;
  if (!w.exercises) w.exercises = [];
  w.exercises.push({ name: name.slice(0, 30), sets, reps, weight });

  addXP(10, 'Упражнение добавлено');
  saveState();
  closeModal('exerciseAddModal');
  renderWorkout();
  showToast('✅ Упражнение добавлено');
}

/* ============================================================
   5. ЕДА
   ============================================================ */
function renderFood() {
  const el = document.getElementById('foodContainer');
  if (!el) return;

  const today = getToday();
  const todayFoods = (state.body.foods && state.body.foods[today]) || [];
  const targets = calcNutritionTargets();

  const totals = todayFoods.reduce((acc, f) => ({
    p: acc.p + (f.p || 0),
    f: acc.f + (f.f || 0),
    c: acc.c + (f.c || 0),
    cal: acc.cal + (f.cal || 0)
  }), { p: 0, f: 0, c: 0, cal: 0 });

  let html =
    '<div class="card primary" style="padding:16px;margin-bottom:14px">' +
      '<div style="font-size:11px;font-weight:800;color:var(--text-soft);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px">Сегодня</div>' +
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;text-align:center">' +
        '<div><div style="font-size:16px;font-weight:900">' + Math.round(totals.p) + '</div><div style="font-size:9.5px;font-weight:800;color:var(--text-soft);text-transform:uppercase">Белки</div><div style="font-size:9px;color:var(--text-soft)">/' + targets.p + 'г</div></div>' +
        '<div><div style="font-size:16px;font-weight:900">' + Math.round(totals.f) + '</div><div style="font-size:9.5px;font-weight:800;color:var(--text-soft);text-transform:uppercase">Жиры</div><div style="font-size:9px;color:var(--text-soft)">/' + targets.f + 'г</div></div>' +
        '<div><div style="font-size:16px;font-weight:900">' + Math.round(totals.c) + '</div><div style="font-size:9.5px;font-weight:800;color:var(--text-soft);text-transform:uppercase">Углев.</div><div style="font-size:9px;color:var(--text-soft)">/' + targets.c + 'г</div></div>' +
        '<div><div style="font-size:16px;font-weight:900;color:var(--accent-1)">' + Math.round(totals.cal) + '</div><div style="font-size:9.5px;font-weight:800;color:var(--text-soft);text-transform:uppercase">Ккал</div><div style="font-size:9px;color:var(--text-soft)">/' + targets.cal + '</div></div>' +
      '</div>' +
    '</div>';

  html +=
    '<div style="display:flex;gap:8px;margin-bottom:14px">' +
      '<button class="btn" style="flex:1;margin:0" onclick="openFoodLibrary()">🍳 База блюд</button>' +
      '<button class="btn" style="flex:1;margin:0" onclick="openModal(\'foodAddModal\')">➕ Вручную</button>' +
    '</div>';

  if (!todayFoods.length) {
    html += '<div class="card"><div class="info-text">Сегодня пока ничего не записано.</div></div>';
  } else {
    html += '<div style="font-size:11px;font-weight:800;color:var(--text-soft);letter-spacing:1.5px;text-transform:uppercase;margin:8px 0">Съедено</div>';
    html += todayFoods.map((f, i) =>
      '<div class="card" style="display:flex;gap:12px;align-items:center;padding:12px">' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:13.5px;font-weight:800">' + escapeHtml(f.name) + '</div>' +
          '<div style="font-size:10.5px;color:var(--text-soft);font-weight:700">Б' + f.p + ' Ж' + f.f + ' У' + f.c + ' · ' + f.cal + ' ккал</div>' +
        '</div>' +
        '<button class="btn-small danger" onclick="removeFood(' + i + ')">✖</button>' +
      '</div>'
    ).join('');
  }

  el.innerHTML = html;
}

function calcNutritionTargets() {
  const p = state.profile;
  if (!p.weight || !p.height || !p.birth) {
    return { p: 120, f: 70, c: 250, cal: 2200 };
  }

  const age = Math.floor((Date.now() - new Date(p.birth).getTime()) / (365.25 * 86400000));
  const isMale = p.gender === 'male';

  /* BMR по Миффлину-Сан Жеору */
  let bmr = 10 * p.weight + 6.25 * p.height - 5 * age + (isMale ? 5 : -161);

  const actMap = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, athlete: 1.9 };
  const tdee = bmr * (actMap[p.activity] || 1.55);

  /* корректировка по цели */
  let cal = tdee;
  if (p.goal === 'lose') cal -= 400;
  else if (p.goal === 'gain') cal += 400;

  /* БЖУ */
  const protein = Math.round(p.weight * 2);
  const fat = Math.round(p.weight * 1);
  const carbs = Math.max(50, Math.round((cal - protein * 4 - fat * 9) / 4));

  return { p: protein, f: fat, c: carbs, cal: Math.round(cal) };
}

function addFood() {
  const name = document.getElementById('fName').value.trim();
  if (!name) { showToast('Введи название'); return; }
  const p = parseFloat(document.getElementById('fProtein').value) || 0;
  const f = parseFloat(document.getElementById('fFat').value) || 0;
  const c = parseFloat(document.getElementById('fCarbs').value) || 0;
  const cal = parseFloat(document.getElementById('fCalories').value) || 0;

  const today = getToday();
  if (!state.body.foods) state.body.foods = {};
  if (!state.body.foods[today]) state.body.foods[today] = [];
  state.body.foods[today].push({ name: name.slice(0, 50), p, f, c, cal });

  addXP(5, 'Еда записана');
  registerActivity();
  saveState();
  closeModal('foodAddModal');
  renderFood();
  showToast('🍎 Добавлено');
  updateHeaderUI();
}

function removeFood(idx) {
  const today = getToday();
  if (!state.body.foods || !state.body.foods[today]) return;
  state.body.foods[today].splice(idx, 1);
  saveState();
  renderFood();
}

function openFoodLibrary() {
  const catRow = document.getElementById('foodCategoriesRow');
  const list = document.getElementById('foodLibraryList');
  if (!catRow || !list) return;

  catRow.innerHTML = FOOD_CATEGORIES.map(c =>
    '<button class="sub-tab" onclick="filterFoodCat(\'' + c.id + '\')">' + c.icon + ' ' + c.name + '</button>'
  ).join('');

  renderFoodLibraryList('');

  openModal('foodLibraryModal');
}

let foodLibFilter = '';
function filterFoodLibrary(q) {
  foodLibFilter = q;
  renderFoodLibraryList(q);
}

function filterFoodCat(catId) {
  renderFoodLibraryList(foodLibFilter, catId);
  document.querySelectorAll('#foodCategoriesRow .sub-tab').forEach(b => {
    b.classList.toggle('active', b.textContent.includes(FOOD_CATEGORIES.find(c => c.id === catId).name));
  });
}

function renderFoodLibraryList(q, catId) {
  const list = document.getElementById('foodLibraryList');
  if (!list) return;

  let items = FOOD_LIBRARY.slice();
  if (catId) items = items.filter(f => f.cat === catId);
  if (q) {
    const qq = q.toLowerCase();
    items = items.filter(f => f.name.toLowerCase().includes(qq));
  }

  if (!items.length) {
    list.innerHTML = '<div class="info-text">Ничего не найдено</div>';
    return;
  }

  list.innerHTML = items.map(f =>
    '<div class="card" style="padding:12px;display:flex;gap:10px;align-items:center;cursor:pointer" onclick="quickAddFood(\'' + escapeHtml(f.name).replace(/'/g, "\\'") + '\',' + f.p + ',' + f.f + ',' + f.c + ',' + f.cal + ')">' +
      '<div style="flex:1;min-width:0">' +
        '<div style="font-size:13.5px;font-weight:800">' + escapeHtml(f.name) + '</div>' +
        '<div style="font-size:10.5px;color:var(--text-soft);font-weight:700">Б' + f.p + ' Ж' + f.f + ' У' + f.c + ' · ' + f.cal + ' ккал</div>' +
      '</div>' +
      '<div style="font-size:20px">➕</div>' +
    '</div>'
  ).join('');
}

function quickAddFood(name, p, f, c, cal) {
  const today = getToday();
  if (!state.body.foods) state.body.foods = {};
  if (!state.body.foods[today]) state.body.foods[today] = [];
  state.body.foods[today].push({ name, p, f, c, cal });
  addXP(5, 'Еда: ' + name);
  registerActivity();
  saveState();
  showToast('✅ ' + name);
  updateHeaderUI();
}

function saveDayConstructor() {
  closeModal('dayConstructorModal');
  showToast('💾 День сохранён');
}

/* ============================================================
   6. СОВЕТЫ
   ============================================================ */
function renderTips() {
  const el = document.getElementById('tipsContainer');
  if (!el) return;

  const t = calcNutritionTargets();
  const p = state.profile;

  el.innerHTML =
    '<div class="card primary" style="padding:16px;margin-bottom:14px">' +
      '<div style="font-size:14px;font-weight:900;margin-bottom:10px">🎯 Твоя норма на день</div>' +
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;text-align:center">' +
        '<div><div style="font-size:20px;font-weight:900;color:var(--accent-1)">' + t.cal + '</div><div style="font-size:10px;color:var(--text-soft);font-weight:800">ККАЛ</div></div>' +
        '<div><div style="font-size:20px;font-weight:900">' + t.p + '</div><div style="font-size:10px;color:var(--text-soft);font-weight:800">БЕЛКИ</div></div>' +
        '<div><div style="font-size:20px;font-weight:900">' + t.f + '</div><div style="font-size:10px;color:var(--text-soft);font-weight:800">ЖИРЫ</div></div>' +
        '<div><div style="font-size:20px;font-weight:900">' + t.c + '</div><div style="font-size:10px;color:var(--text-soft);font-weight:800">УГЛЕВ.</div></div>' +
      '</div>' +
      (!p.weight || !p.height || !p.birth
        ? '<div class="info-text" style="margin-top:10px;color:var(--orange)">⚠️ Заполни профиль для точного расчёта</div>'
        : '') +
    '</div>' +

    '<div class="card" style="padding:16px">' +
      '<div style="font-size:14px;font-weight:900;margin-bottom:10px">📚 Рекомендации</div>' +
      '<div style="font-size:13px;line-height:1.7;color:var(--text-dim);font-weight:600">' +
        '• Белок: 1.6–2.2 г на кг веса для роста мышц<br>' +
        '• Вода: 30 мл на кг веса (≈ ' + Math.round((p.weight || 70) * 30) + ' мл)<br>' +
        '• Овощи: минимум 3 порции в день<br>' +
        '• Сон: ' + (p.sleep || 8) + ' часов для восстановления<br>' +
        '• Приёмов пищи: ' + ((p.mealSchedule && p.mealSchedule.length) || 3) + ' в день<br>' +
        '• Не ешь за 2 часа до сна<br>' +
        '• Сахар — максимум 25 г в день<br>' +
      '</div>' +
    '</div>';
}

/* ============================================================
   7. ФИНАНСЫ
   ============================================================ */
function renderFinance() {
  const el = document.getElementById('financeContainer');
  if (!el) return;

  const savings = state.finance.savings || [];
  const strategy = FINANCE_STRATEGIES.find(s => s.id === state.finance.strategy);

  let html =
    '<div class="card primary" style="padding:16px;margin-bottom:14px">' +
      '<div style="font-size:11px;font-weight:800;color:var(--text-soft);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px">Стратегия</div>' +
      '<div style="font-size:16px;font-weight:900;margin-bottom:6px">' + (strategy ? strategy.name : 'Не выбрана') + '</div>' +
      (strategy ? '<div class="info-text">' + escapeHtml(strategy.desc) + '</div>' : '') +
      '<button class="btn-small purple" style="width:100%;margin-top:10px" onclick="openModal(\'strategyModal\')">' +
        (strategy ? 'Изменить' : 'Выбрать стратегию') +
      '</button>' +
    '</div>';

  html += '<button class="btn primary" onclick="openModal(\'savingsAddModal\')" style="margin-bottom:14px">➕ Новая копилка</button>';

  if (!savings.length) {
    html += '<div class="card"><div class="info-text">Копилок пока нет. Создай первую 👆</div></div>';
  } else {
    html += savings.map(s => {
      const pct = s.target > 0 ? Math.min(100, (s.current / s.target) * 100) : 0;
      return '<div class="card" style="padding:14px">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
          '<div style="font-size:14px;font-weight:900">🏦 ' + escapeHtml(s.name) + '</div>' +
          '<button class="btn-small danger" onclick="deleteSavings(\'' + s.id + '\')">✖</button>' +
        '</div>' +
        '<div class="progress-bar" style="height:8px;margin-bottom:6px">' +
          '<div class="progress-fill" style="width:' + pct + '%"></div>' +
        '</div>' +
        '<div style="display:flex;justify-content:space-between;font-size:12px;font-weight:800;color:var(--text-soft);margin-bottom:10px">' +
          '<span>' + s.current.toLocaleString('ru-RU') + ' ₽</span>' +
          '<span>' + s.target.toLocaleString('ru-RU') + ' ₽</span>' +
        '</div>' +
        '<div style="display:flex;gap:6px">' +
          '<input class="plan-input" type="number" placeholder="Сумма" id="sav_' + s.id + '" style="margin:0;flex:1">' +
          '<button class="btn-small purple" onclick="addToSavings(\'' + s.id + '\')">💰</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  el.innerHTML = html;
}

function createSavings() {
  const name = document.getElementById('savName').value.trim();
  const target = parseFloat(document.getElementById('savTarget').value) || 0;
  const current = parseFloat(document.getElementById('savCurrent').value) || 0;
  if (!name) { showToast('Введи название'); return; }

  if (!state.finance.savings) state.finance.savings = [];
  state.finance.savings.push({
    id: 's_' + Date.now(),
    name: name.slice(0, 30),
    target,
    current,
    created: Date.now()
  });

  addXP(10, 'Копилка создана');
  saveState();
  closeModal('savingsAddModal');
  renderFinance();
  showToast('🏦 Копилка создана');
  updateHeaderUI();
}

function addToSavings(id) {
  const inp = document.getElementById('sav_' + id);
  if (!inp) return;
  const v = parseFloat(inp.value);
  if (!v) return;

  const s = (state.finance.savings || []).find(x => x.id === id);
  if (!s) return;
  s.current += v;
  inp.value = '';

  addXP(5, 'В копилку: ' + v + '₽');
  saveState();
  renderFinance();
  showToast('💰 +' + v + ' ₽');

  if (s.current >= s.target && s.target > 0) {
    showToast('🏆 Цель достигнута: ' + s.name);
    addXP(100, 'Финансовая цель: ' + s.name);
  }
}

function deleteSavings(id) {
  if (!confirm('Удалить копилку?')) return;
  state.finance.savings = (state.finance.savings || []).filter(s => s.id !== id);
  saveState();
  renderFinance();
}

/* ============================================================
   8. ПЛАН ДНЯ
   ============================================================ */
function renderPlan() {
  const el = document.getElementById('planContainer');
  if (!el) return;

  const today = getToday();
  const items = (state.plan[today] && state.plan[today].items) || [];

  let html =
    '<div class="card" style="padding:14px">' +
      '<div style="display:flex;gap:8px">' +
        '<input class="plan-input" id="planInput" placeholder="Что нужно сделать?" style="margin:0">' +
        '<button class="btn-small purple" onclick="addPlanItem()">➕</button>' +
      '</div>' +
    '</div>';

  if (!items.length) {
    html += '<div class="card"><div class="info-text">План на сегодня пуст.</div></div>';
  } else {
    html += items.map((it, i) =>
      '<div class="card" style="display:flex;gap:12px;align-items:center;padding:12px;' +
        (it.done ? 'opacity:.6' : '') + '">' +
        '<div onclick="togglePlanItem(' + i + ')" style="font-size:22px;cursor:pointer">' +
          (it.done ? '✅' : '○') +
        '</div>' +
        '<div style="flex:1;font-size:13.5px;font-weight:700;' + (it.done ? 'text-decoration:line-through' : '') + '">' +
          escapeHtml(it.text) +
        '</div>' +
        '<button class="btn-small danger" onclick="removePlanItem(' + i + ')">✖</button>' +
      '</div>'
    ).join('');
  }

  el.innerHTML = html;
}

function addPlanItem() {
  const inp = document.getElementById('planInput');
  if (!inp) return;
  const v = inp.value.trim();
  if (!v) return;

  const today = getToday();
  if (!state.plan[today]) state.plan[today] = { items: [] };
  if (!state.plan[today].items) state.plan[today].items = [];
  state.plan[today].items.push({ text: v.slice(0, 100), done: false });

  inp.value = '';
  saveState();
  renderPlan();
}

function togglePlanItem(i) {
  const today = getToday();
  const items = state.plan[today] && state.plan[today].items;
  if (!items || !items[i]) return;
  items[i].done = !items[i].done;

  if (items[i].done) {
    addXP(5, 'Пункт плана');
    registerActivity();
  }

  saveState();
  renderPlan();
  updateHeaderUI();
}

function removePlanItem(i) {
  const today = getToday();
  if (!state.plan[today] || !state.plan[today].items) return;
  state.plan[today].items.splice(i, 1);
  saveState();
  renderPlan();
}

/* ============================================================
   9. ЦЕЛИ
   ============================================================ */
function renderGoals() {
  const el = document.getElementById('goalsContainer');
  const formEl = document.getElementById('goalForm');
  if (!el) return;

  const goals = state.goals || [];

  if (!goals.length) {
    el.innerHTML = '<div class="card"><div class="info-text">Пока нет целей. Создай первую ниже 👇</div></div>';
  } else {
    el.innerHTML = goals.map(g => {
      const steps = g.steps || [];
      const doneCount = steps.filter(s => s.done).length;
      const pct = steps.length ? Math.round((doneCount / steps.length) * 100) : 0;

      return '<div class="card" style="padding:14px">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
          '<div style="font-size:15px;font-weight:900">🎯 ' + escapeHtml(g.name) + '</div>' +
          '<button class="btn-small danger" onclick="deleteGoal(\'' + g.id + '\')">✖</button>' +
        '</div>' +
        '<div class="progress-bar" style="height:6px;margin-bottom:6px">' +
          '<div class="progress-fill" style="width:' + pct + '%"></div>' +
        '</div>' +
        '<div style="font-size:11px;color:var(--text-soft);font-weight:700;margin-bottom:10px">' +
          doneCount + ' / ' + steps.length + ' шагов · ' + pct + '%' +
        '</div>' +
        steps.map((s, i) =>
          '<div style="display:flex;gap:8px;align-items:center;padding:6px 0;border-top:1px solid var(--border)">' +
            '<div onclick="toggleGoalStep(\'' + g.id + '\',' + i + ')" style="font-size:18px;cursor:pointer">' +
              (s.done ? '✅' : '○') +
            '</div>' +
            '<div style="flex:1;font-size:12.5px;font-weight:700;' + (s.done ? 'text-decoration:line-through;opacity:.6' : '') + '">' +
              escapeHtml(s.text) +
            '</div>' +
          '</div>'
        ).join('') +
        '<div style="display:flex;gap:6px;margin-top:10px">' +
          '<input class="plan-input" id="step_' + g.id + '" placeholder="Новый шаг" style="margin:0;flex:1">' +
          '<button class="btn-small purple" onclick="addGoalStep(\'' + g.id + '\')">➕</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  if (formEl) {
    formEl.innerHTML =
      '<div class="card" style="padding:14px">' +
        '<input class="plan-input" id="goalName" placeholder="Название цели" maxlength="60">' +
        '<button class="btn primary" style="width:100%" onclick="createGoal()">🎯 Создать цель</button>' +
      '</div>';
  }
}

function createGoal() {
  const inp = document.getElementById('goalName');
  if (!inp) return;
  const v = inp.value.trim();
  if (!v) { showToast('Введи название'); return; }

  if (!state.goals) state.goals = [];
  state.goals.push({
    id: 'g_' + Date.now(),
    name: v.slice(0, 60),
    steps: [],
    created: Date.now()
  });

  inp.value = '';
  addXP(20, 'Цель создана: ' + v);
  saveState();
  renderGoals();
  showToast('🎯 Цель создана');
  updateHeaderUI();
}

function deleteGoal(id) {
  if (!confirm('Удалить цель?')) return;
  state.goals = (state.goals || []).filter(g => g.id !== id);
  saveState();
  renderGoals();
}

function addGoalStep(id) {
  const inp = document.getElementById('step_' + id);
  if (!inp) return;
  const v = inp.value.trim();
  if (!v) return;

  const g = (state.goals || []).find(x => x.id === id);
  if (!g) return;
  if (!g.steps) g.steps = [];
  g.steps.push({ text: v.slice(0, 100), done: false });

  inp.value = '';
  saveState();
  renderGoals();
}

function toggleGoalStep(id, idx) {
  const g = (state.goals || []).find(x => x.id === id);
  if (!g || !g.steps[idx]) return;
  g.steps[idx].done = !g.steps[idx].done;

  if (g.steps[idx].done) {
    addXP(10, 'Шаг цели выполнен');
    registerActivity();

    if (g.steps.every(s => s.done)) {
      addXP(100, 'Цель достигнута: ' + g.name);
      showToast('🏆 Цель достигнута: ' + g.name);
    }
  }

  saveState();
  renderGoals();
  updateHeaderUI();
}

/* ============================================================
   ЭКСПОРТ В WINDOW
   ============================================================ */
window.renderHabits = renderHabits;
window.toggleHabit = toggleHabit;

window.renderMood = renderMood;
window.openMoodPicker = openMoodPicker;
window.setMood = setMood;
window.saveMoodQuick = saveMoodQuick;
window.saveMoodNote = saveMoodNote;

window.switchBodyTab = switchBodyTab;
window.renderBody = renderBody;
window.addWeight = addWeight;
window.renderWorkout = renderWorkout;
window.openWorkoutAdd = openWorkoutAdd;
window.createWorkout = createWorkout;
window.deleteWorkout = deleteWorkout;
window.openExerciseAdd = openExerciseAdd;
window.addExercise = addExercise;
window.renderFood = renderFood;
window.addFood = addFood;
window.removeFood = removeFood;
window.openFoodLibrary = openFoodLibrary;
window.filterFoodLibrary = filterFoodLibrary;
window.filterFoodCat = filterFoodCat;
window.quickAddFood = quickAddFood;
window.saveDayConstructor = saveDayConstructor;
window.renderTips = renderTips;

window.renderFinance = renderFinance;
window.createSavings = createSavings;
window.addToSavings = addToSavings;
window.deleteSavings = deleteSavings;

window.renderPlan = renderPlan;
window.addPlanItem = addPlanItem;
window.togglePlanItem = togglePlanItem;
window.removePlanItem = removePlanItem;

window.renderGoals = renderGoals;
window.createGoal = createGoal;
window.deleteGoal = deleteGoal;
window.addGoalStep = addGoalStep;
window.toggleGoalStep = toggleGoalStep;

/* ---------- КОНЕЦ ЧАСТИ 5 ---------- */
console.log('✅ Путь 16 · Часть 5 (трекеры) загружена');
