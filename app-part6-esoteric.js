/* ============================================================
   ПУТЬ 16 · СОТВОРЦОМ
   app-part6-esoteric.js — ЭЗОТЕРИКА (гороскоп, нумерология, луна, руны, камни, шар, цвет)
   ============================================================ */

'use strict';

/* ============================================================
   1. ГОРОСКОП
   ============================================================ */
function getZodiacSign(date) {
  if (!date) return null;
  const d = new Date(date);
  const m = d.getMonth() + 1;
  const day = d.getDate();

  for (const z of ZODIAC) {
    const [m1, d1, m2, d2] = z.dates;
    if (m1 <= m2) {
      if ((m === m1 && day >= d1) || (m === m2 && day <= d2) || (m > m1 && m < m2)) return z;
    } else {
      /* через новый год, не должно случаться с нашими данными */
      if ((m === m1 && day >= d1) || (m === m2 && day <= d2)) return z;
    }
  }
  return null;
}

function getChineseSign(year) {
  for (const c of CHINESE_ZODIAC) {
    if (c.years.includes(year)) return c;
  }
  /* fallback — расчёт по циклу */
  const idx = (year - 1924) % 12;
  return CHINESE_ZODIAC[idx] || null;
}

function getCelticSign(date) {
  if (!date) return null;
  const d = new Date(date);
  const m = d.getMonth() + 1;
  const day = d.getDate();

  for (const c of CELTIC_ZODIAC) {
    const [m1, d1, m2, d2] = c.dates;
    if ((m === m1 && day >= d1) || (m === m2 && day <= d2)) return c;
    if (m1 > m2 && ((m === m1 && day >= d1) || (m === m2 && day <= d2))) return c;
  }
  return null;
}

function renderHoroscope() {
  const el = document.getElementById('horoscopeContainer');
  if (!el) return;

  const birth = state.profile.birth;
  if (!birth) {
    el.innerHTML =
      '<div class="card primary" style="text-align:center;padding:32px 20px">' +
        '<div style="font-size:60px;margin-bottom:12px">✨</div>' +
        '<div style="font-size:16px;font-weight:900;margin-bottom:8px">Заполни дату рождения</div>' +
        '<div class="info-text" style="margin-bottom:16px">Это нужно для точного гороскопа по 3 системам</div>' +
        '<button class="btn primary" onclick="openProfile()">👤 В профиль</button>' +
      '</div>';
    return;
  }

  const zodiac = getZodiacSign(birth);
  const birthYear = new Date(birth).getFullYear();
  const chinese = getChineseSign(birthYear);
  const celtic = getCelticSign(birth);

  let html = '';

  if (zodiac) {
    html +=
      '<div class="card" style="text-align:center;padding:20px;cursor:pointer" onclick="showZodiacDetail(\'western\')">' +
        '<div style="font-size:10px;font-weight:800;color:var(--text-soft);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px">🌍 Западная</div>' +
        '<div style="font-size:52px;margin-bottom:6px">' + zodiac.icon + '</div>' +
        '<div style="font-size:18px;font-weight:900;margin-bottom:4px">' + escapeHtml(zodiac.name) + '</div>' +
        '<div style="font-size:11.5px;color:var(--text-dim);font-weight:600">' + escapeHtml(zodiac.traits) + '</div>' +
        '<div style="display:flex;gap:6px;justify-content:center;margin-top:10px;flex-wrap:wrap">' +
          '<span style="font-size:10px;font-weight:800;padding:4px 10px;border-radius:999px;background:rgba(79,172,254,.15);color:var(--accent-1)">' + escapeHtml(zodiac.element) + '</span>' +
          '<span style="font-size:10px;font-weight:800;padding:4px 10px;border-radius:999px;background:rgba(176,107,255,.15);color:var(--accent-2)">' + escapeHtml(zodiac.planet) + '</span>' +
        '</div>' +
      '</div>';
  }

  if (chinese) {
    html +=
      '<div class="card" style="text-align:center;padding:20px;cursor:pointer" onclick="showZodiacDetail(\'chinese\')">' +
        '<div style="font-size:10px;font-weight:800;color:var(--text-soft);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px">🇨🇳 Китайская</div>' +
        '<div style="font-size:52px;margin-bottom:6px">' + chinese.icon + '</div>' +
        '<div style="font-size:18px;font-weight:900;margin-bottom:4px">' + escapeHtml(chinese.name) + '</div>' +
        '<div style="font-size:11.5px;color:var(--text-dim);font-weight:600">' + escapeHtml(chinese.traits) + '</div>' +
      '</div>';
  }

  if (celtic) {
    html +=
      '<div class="card" style="text-align:center;padding:20px;cursor:pointer" onclick="showZodiacDetail(\'celtic\')">' +
        '<div style="font-size:10px;font-weight:800;color:var(--text-soft);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px">🍀 Кельтская</div>' +
        '<div style="font-size:52px;margin-bottom:6px">' + celtic.icon + '</div>' +
        '<div style="font-size:18px;font-weight:900;margin-bottom:4px">' + escapeHtml(celtic.name) + '</div>' +
        '<div style="font-size:11.5px;color:var(--text-dim);font-weight:600">' + escapeHtml(celtic.traits) + '</div>' +
      '</div>';
  }

  el.innerHTML = html;
}

function showZodiacDetail(system) {
  const birth = state.profile.birth;
  const titleEl = document.getElementById('horoscopeDetailTitle');
  const bodyEl = document.getElementById('horoscopeDetailBody');
  if (!titleEl || !bodyEl) return;

  if (system === 'western') {
    const z = getZodiacSign(birth);
    if (!z) return;
    titleEl.textContent = z.icon + ' ' + z.name;
    bodyEl.innerHTML =
      '<div class="setting"><span class="setting-label">📅 Период</span><b class="setting-value">' +
        String(z.dates[0]).padStart(2,'0') + '.' + String(z.dates[1]).padStart(2,'0') + ' — ' +
        String(z.dates[2]).padStart(2,'0') + '.' + String(z.dates[3]).padStart(2,'0') +
      '</b></div>' +
      '<div class="setting"><span class="setting-label">🔥 Стихия</span><b class="setting-value">' + z.element + '</b></div>' +
      '<div class="setting"><span class="setting-label">🪐 Планета</span><b class="setting-value">' + z.planet + '</b></div>' +
      '<div class="setting"><span class="setting-label">💎 Камень</span><b class="setting-value">' + z.stone + '</b></div>' +
      '<div class="setting"><span class="setting-label">🎨 Цвет</span><b class="setting-value" style="color:' + z.color + '">' + z.color + '</b></div>' +
      '<div class="info-text" style="margin-top:16px"><b>Черты:</b> ' + escapeHtml(z.traits) + '</div>';
  } else if (system === 'chinese') {
    const year = new Date(birth).getFullYear();
    const c = getChineseSign(year);
    if (!c) return;
    titleEl.textContent = c.icon + ' ' + c.name;
    bodyEl.innerHTML =
      '<div class="setting"><span class="setting-label">📅 Год рождения</span><b class="setting-value">' + year + '</b></div>' +
      '<div class="info-text" style="margin-top:16px"><b>Черты:</b> ' + escapeHtml(c.traits) + '</div>';
  } else if (system === 'celtic') {
    const c = getCelticSign(birth);
    if (!c) return;
    titleEl.textContent = c.icon + ' ' + c.name;
    bodyEl.innerHTML =
      '<div class="info-text"><b>Черты:</b> ' + escapeHtml(c.traits) + '</div>';
  }

  openModal('horoscopeDetailModal');
}

/* ============================================================
   2. НУМЕРОЛОГИЯ
   ============================================================ */
function digitSum(n) {
  n = Math.abs(n);
  while (n > 9) {
    n = String(n).split('').reduce((s, d) => s + parseInt(d, 10), 0);
  }
  return n;
}

function calcLifePathNumber(dateStr) {
  if (!dateStr) return null;
  const digits = dateStr.replace(/\D/g, '');
  let sum = 0;
  for (const d of digits) sum += parseInt(d, 10);
  return digitSum(sum);
}

function calcPythagorasMatrix(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();

  const digits = String(day).padStart(2,'0') + String(month).padStart(2,'0') + year;
  let sum = 0;
  for (const c of digits) sum += parseInt(c, 10);

  let first = sum;
  let firstDigit = parseInt(String(first)[0], 10);

  let second = digitSum(first) ;

  let third = first - 2 * firstDigit;
  let fourth = digitSum(third);

  const all = String(first) + String(second) + String(third) + String(fourth) + digits;

  const counts = {};
  for (let i = 1; i <= 9; i++) counts[i] = 0;
  for (const c of all) {
    const n = parseInt(c, 10);
    if (n >= 1 && n <= 9) counts[n]++;
  }
  return counts;
}

const NUM_MEANINGS = {
  1: { name:'Лидер',      desc:'Единица. Ты — лидер, пионер, первопроходец. Тебе важно быть первым.' },
  2: { name:'Дипломат',   desc:'Двойка. Ты — миротворец, дипломат, эмпат. Чувствуешь других.' },
  3: { name:'Творец',     desc:'Тройка. Ты — творец, коммуникатор, оптимист. Легко выражаешь себя.' },
  4: { name:'Строитель',  desc:'Четвёрка. Ты — строитель, труженик, надёжный. Ценишь порядок.' },
  5: { name:'Искатель',   desc:'Пятёрка. Ты — искатель свободы, путешественник, экспериментатор.' },
  6: { name:'Хранитель',  desc:'Шестёрка. Ты — хранитель, семьянин, целитель. Заботишься о близких.' },
  7: { name:'Мудрец',     desc:'Семёрка. Ты — мудрец, философ, исследователь. Ищешь истину.' },
  8: { name:'Магнат',     desc:'Восьмёрка. Ты — магнат, стратег, лидер. Умеешь зарабатывать.' },
  9: { name:'Гуманист',   desc:'Девятка. Ты — гуманист, альтруист, наставник. Служишь миру.' }
};

function renderNumerology() {
  const el = document.getElementById('numerologyContainer');
  if (!el) return;

  const birth = state.profile.birth;
  if (!birth) {
    el.innerHTML =
      '<div class="card primary" style="text-align:center;padding:32px 20px">' +
        '<div style="font-size:60px;margin-bottom:12px">🔢</div>' +
        '<div style="font-size:16px;font-weight:900;margin-bottom:8px">Нужна дата рождения</div>' +
        '<div class="info-text" style="margin-bottom:16px">Для расчёта чисел судьбы</div>' +
        '<button class="btn primary" onclick="openProfile()">👤 В профиль</button>' +
      '</div>';
    return;
  }

  const lifePath = calcLifePathNumber(birth);
  const matrix = calcPythagorasMatrix(birth);

  let html = '';

  /* число судьбы */
  if (lifePath) {
    const m = NUM_MEANINGS[lifePath];
    html +=
      '<div class="card primary" style="text-align:center;padding:20px;cursor:pointer" onclick="showNumerologyDetail(\'lifePath\')">' +
        '<div style="font-size:10px;font-weight:800;color:var(--text-soft);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px">Число судьбы</div>' +
        '<div style="font-size:60px;font-weight:900;background:linear-gradient(90deg,var(--accent-1),var(--accent-2));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent">' + lifePath + '</div>' +
        '<div style="font-size:16px;font-weight:900;margin-top:6px">' + m.name + '</div>' +
        '<div class="info-text" style="margin-top:8px">' + escapeHtml(m.desc) + '</div>' +
      '</div>';
  }

  /* матрица */
  if (matrix) {
    html += '<div style="font-size:11px;font-weight:800;color:var(--text-soft);letter-spacing:1.5px;text-transform:uppercase;margin:16px 0 8px">Матрица Пифагора</div>';
    html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:14px">';
    for (let i = 1; i <= 9; i++) {
      const n = matrix[i] || 0;
      const opacity = n === 0 ? 0.25 : Math.min(1, 0.4 + n * 0.15);
      html +=
        '<div style="aspect-ratio:1;border-radius:12px;background:linear-gradient(135deg,rgba(79,172,254,' + opacity + '),rgba(176,107,255,' + opacity + '));border:1px solid var(--border);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer" onclick="showNumerologyDetail(\'matrix\',' + i + ')">' +
          '<div style="font-size:22px;font-weight:900">' + (n > 0 ? String(i).repeat(n) : i) + '</div>' +
          '<div style="font-size:9px;font-weight:800;color:var(--text-soft);margin-top:2px">' + NUM_MEANINGS[i].name + '</div>' +
        '</div>';
    }
    html += '</div>';
  }

  el.innerHTML = html;
}

function showNumerologyDetail(type, idx) {
  const titleEl = document.getElementById('numerologyDetailTitle');
  const bodyEl = document.getElementById('numerologyDetailBody');
  if (!titleEl || !bodyEl) return;

  if (type === 'lifePath') {
    const n = calcLifePathNumber(state.profile.birth);
    const m = NUM_MEANINGS[n];
    titleEl.textContent = '🔢 Число судьбы ' + n;
    bodyEl.innerHTML =
      '<div style="font-size:20px;font-weight:900;margin-bottom:10px">' + m.name + '</div>' +
      '<div class="info-text">' + escapeHtml(m.desc) + '</div>';
  } else if (type === 'matrix' && idx) {
    const m = NUM_MEANINGS[idx];
    const matrix = calcPythagorasMatrix(state.profile.birth);
    const count = matrix ? (matrix[idx] || 0) : 0;
    titleEl.textContent = '🔢 ' + idx + ' · ' + m.name;
    bodyEl.innerHTML =
      '<div class="setting"><span class="setting-label">Количество</span><b class="setting-value">' + count + '</b></div>' +
      '<div class="info-text" style="margin-top:10px">' + escapeHtml(m.desc) + '</div>' +
      (count === 0
        ? '<div class="info-text" style="color:var(--orange);margin-top:10px">⚠️ Число отсутствует — эту энергию нужно развивать.</div>'
        : '<div class="info-text" style="color:var(--green);margin-top:10px">✅ Число присутствует — качество выражено.</div>');
  }

  openModal('numerologyDetailModal');
}

/* ============================================================
   3. ЛУННЫЙ КАЛЕНДАРЬ
   ============================================================ */
function getMoonPhase(date) {
  const d = date || new Date();
  /* Простой расчёт: фаза = (дней с 2000-01-06) mod 29.53 */
  const known = new Date('2000-01-06T18:14:00Z').getTime();
  const diff = d.getTime() - known;
  const days = diff / 86400000;
  const cycle = 29.530588853;
  let phase = ((days % cycle) + cycle) % cycle;

  /* фаза 0 = новолуние, 14.7 = полнолуние */
  const idx = Math.floor((phase / cycle) * 8) % 8;
  return { phase, idx, info: MOON_PHASES[idx] };
}

function renderMoon() {
  const el = document.getElementById('moonContainer');
  if (!el) return;

  const m = getMoonPhase(new Date());
  const illum = Math.round((1 - Math.abs(m.phase - 14.765) / 14.765) * 100);

  el.innerHTML =
    '<div class="card primary" style="text-align:center;padding:24px 20px;cursor:pointer" onclick="showMoonDetail()">' +
      '<div style="font-size:10px;font-weight:800;color:var(--text-soft);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px">Сегодня</div>' +
      '<div style="font-size:90px;margin-bottom:10px">' + m.info.icon + '</div>' +
      '<div style="font-size:20px;font-weight:900;margin-bottom:6px">' + escapeHtml(m.info.name) + '</div>' +
      '<div style="display:flex;gap:8px;justify-content:center;margin-top:12px">' +
        '<div style="background:rgba(255,255,255,.05);padding:8px 14px;border-radius:10px">' +
          '<div style="font-size:16px;font-weight:900">' + illum + '%</div>' +
          '<div style="font-size:9px;font-weight:800;color:var(--text-soft);text-transform:uppercase">Освещено</div>' +
        '</div>' +
        '<div style="background:rgba(255,255,255,.05);padding:8px 14px;border-radius:10px">' +
          '<div style="font-size:16px;font-weight:900">' + m.phase.toFixed(1) + '</div>' +
          '<div style="font-size:9px;font-weight:800;color:var(--text-soft);text-transform:uppercase">День цикла</div>' +
        '</div>' +
      '</div>' +
      '<div class="info-text" style="margin-top:14px">' + escapeHtml(m.info.effects) + '</div>' +
    '</div>' +

    '<div style="font-size:11px;font-weight:800;color:var(--text-soft);letter-spacing:1.5px;text-transform:uppercase;margin:16px 0 8px">Календарь на 30 дней</div>' +
    '<div class="card" style="padding:14px">' +
      '<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:6px">' +
        (function() {
          let h = '';
          for (let i = 0; i < 30; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            const mm = getMoonPhase(d);
            h += '<div style="text-align:center;padding:6px 2px;border-radius:8px;background:rgba(255,255,255,.04)">' +
              '<div style="font-size:9px;font-weight:800;color:var(--text-soft)">' + (d.getMonth() + 1) + '/' + d.getDate() + '</div>' +
              '<div style="font-size:20px;margin-top:2px">' + mm.info.icon + '</div>' +
            '</div>';
          }
          return h;
        })() +
      '</div>' +
    '</div>';
}

function showMoonDetail() {
  const m = getMoonPhase(new Date());
  const titleEl = document.getElementById('moonDetailTitle');
  const bodyEl = document.getElementById('moonDetailBody');
  if (!titleEl || !bodyEl) return;

  titleEl.textContent = m.info.icon + ' ' + m.info.name;
  bodyEl.innerHTML =
    '<div class="setting"><span class="setting-label">День цикла</span><b class="setting-value">' + m.phase.toFixed(2) + ' / 29.53</b></div>' +
    '<div class="setting"><span class="setting-label">Освещённость</span><b class="setting-value">' +
      Math.round((1 - Math.abs(m.phase - 14.765) / 14.765) * 100) + '%</b></div>' +
    '<div class="info-text" style="margin-top:16px">' +
      '<b>Что делать:</b><br>' + escapeHtml(m.info.effects) +
    '</div>';

  openModal('moonDetailModal');
}

/* ============================================================
   4. РУНА ДНЯ
   ============================================================ */
function renderRunes() {
  const el = document.getElementById('runeContainer');
  if (!el) return;

  const today = getToday();
  let rune;

  if (state.rune.day === today && state.rune.id) {
    rune = RUNES.find(r => r.id === state.rune.id);
  } else {
    rune = pickSeeded(RUNES, today + 'rune');
    state.rune = { day: today, id: rune.id };
    saveState();
  }

  if (!rune) { el.innerHTML = ''; return; }

  el.innerHTML =
    '<div class="card primary" style="text-align:center;padding:28px 20px;cursor:pointer" onclick="showRuneDetail()">' +
      '<div style="font-size:10px;font-weight:800;color:var(--text-soft);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px">Руна дня</div>' +
      '<div style="font-size:110px;font-weight:400;line-height:1;margin-bottom:8px;text-shadow:0 0 40px rgba(79,172,254,.6)">' + rune.icon + '</div>' +
      '<div style="font-size:22px;font-weight:900;margin-bottom:8px">' + escapeHtml(rune.name) + '</div>' +
      '<div style="font-size:13px;color:var(--text-dim);font-weight:600">' + escapeHtml(rune.meaning) + '</div>' +
      '<div style="background:rgba(79,172,254,.12);border:1px solid rgba(79,172,254,.3);border-radius:12px;padding:12px;margin-top:16px">' +
        '<div style="font-size:10px;font-weight:800;color:var(--text-soft);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:4px">Совет</div>' +
        '<div style="font-size:13px;font-weight:700">' + escapeHtml(rune.advice) + '</div>' +
      '</div>' +
    '</div>';
}

function showRuneDetail() {
  const rune = RUNES.find(r => r.id === state.rune.id);
  if (!rune) return;

  const titleEl = document.getElementById('runeDetailTitle');
  const bodyEl = document.getElementById('runeDetailBody');
  if (!titleEl || !bodyEl) return;

  titleEl.textContent = rune.name;
  bodyEl.innerHTML =
    '<div style="text-align:center;font-size:90px;margin-bottom:16px;text-shadow:0 0 40px rgba(79,172,254,.6)">' + rune.icon + '</div>' +
    '<div class="setting"><span class="setting-label">Значение</span><b class="setting-value" style="text-align:right;max-width:60%">' + escapeHtml(rune.meaning) + '</b></div>' +
    '<div class="info-text" style="margin-top:16px"><b>Совет:</b> ' + escapeHtml(rune.advice) + '</div>';

  openModal('runeDetailModal');
}

/* ============================================================
   5. КАМЕНЬ ДНЯ
   ============================================================ */
function renderStones() {
  const el = document.getElementById('stoneContainer');
  if (!el) return;

  const today = getToday();
  let stone;

  if (state.stone.day === today && state.stone.name) {
    stone = STONES.find(s => s.name === state.stone.name);
  } else {
    stone = pickSeeded(STONES, today + 'stone');
    state.stone = { day: today, name: stone.name };
    saveState();
  }

  if (!stone) { el.innerHTML = ''; return; }

  el.innerHTML =
    '<div class="card primary" style="text-align:center;padding:28px 20px;cursor:pointer" onclick="showStoneDetail()">' +
      '<div style="font-size:10px;font-weight:800;color:var(--text-soft);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px">Камень дня</div>' +
      '<div style="font-size:100px;margin-bottom:12px;filter:drop-shadow(0 0 30px ' + stone.color + ')">' + stone.icon + '</div>' +
      '<div style="font-size:22px;font-weight:900;margin-bottom:6px">' + escapeHtml(stone.name) + '</div>' +
      '<div style="font-size:13px;color:var(--text-dim);font-weight:600;margin-bottom:12px">' + escapeHtml(stone.props) + '</div>' +
      '<div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap">' +
        '<span style="font-size:10px;font-weight:800;padding:4px 10px;border-radius:999px;background:rgba(79,172,254,.15);color:var(--accent-1)">' + escapeHtml(stone.planet) + '</span>' +
        '<span style="font-size:10px;font-weight:800;padding:4px 10px;border-radius:999px;background:rgba(176,107,255,.15);color:var(--accent-2)">' + escapeHtml(stone.chakra) + '</span>' +
      '</div>' +
    '</div>';
}

function showStoneDetail() {
  const stone = STONES.find(s => s.name === state.stone.name);
  if (!stone) return;

  const titleEl = document.getElementById('stoneDetailTitle');
  const bodyEl = document.getElementById('stoneDetailBody');
  if (!titleEl || !bodyEl) return;

  titleEl.textContent = stone.icon + ' ' + stone.name;
  bodyEl.innerHTML =
    '<div class="setting"><span class="setting-label">🪐 Планета</span><b class="setting-value">' + escapeHtml(stone.planet) + '</b></div>' +
    '<div class="setting"><span class="setting-label">🌀 Чакра</span><b class="setting-value">' + escapeHtml(stone.chakra) + '</b></div>' +
    '<div class="info-text" style="margin-top:16px"><b>Свойства:</b> ' + escapeHtml(stone.props) + '</div>';

  openModal('stoneDetailModal');
}

/* ============================================================
   6. ШАР ДА / НЕТ
   ============================================================ */
const BALL_ANSWERS = [
  { text:'Да',                 color:'var(--green)',   icon:'✅' },
  { text:'Нет',                color:'var(--red)',     icon:'❌' },
  { text:'Определённо да',     color:'var(--green)',   icon:'💚' },
  { text:'Определённо нет',    color:'var(--red)',     icon:'🚫' },
  { text:'Возможно',           color:'var(--gold)',    icon:'🤔' },
  { text:'Скорее да',          color:'var(--green)',   icon:'👍' },
  { text:'Скорее нет',         color:'var(--red)',     icon:'👎' },
  { text:'Спроси позже',       color:'var(--text-dim)',icon:'⏳' },
  { text:'Не могу сказать',    color:'var(--text-dim)',icon:'🤷' },
  { text:'Сконцентрируйся',    color:'var(--accent-1)',icon:'🧘' },
  { text:'Бесспорно',          color:'var(--green)',   icon:'🌟' },
  { text:'Мои источники говорят нет', color:'var(--red)', icon:'📕' },
  { text:'Перспективы хорошие',color:'var(--green)',   icon:'🌱' },
  { text:'Всё указывает на да',color:'var(--green)',   icon:'🎯' },
  { text:'Весьма сомнительно', color:'var(--orange)',  icon:'❓' }
];

let ballLastIdx = -1;

function renderBall() {
  const el = document.getElementById('ballContainer');
  if (!el) return;

  el.innerHTML =
    '<div style="text-align:center">' +
      '<div id="ballOrb" style="width:200px;height:200px;margin:20px auto;border-radius:50%;background:radial-gradient(circle at 30% 30%, #2a1748, #0a0418);border:3px solid rgba(176,107,255,.5);display:flex;align-items:center;justify-content:center;font-size:80px;box-shadow:0 0 60px rgba(176,107,255,.4),inset 0 0 40px rgba(79,172,254,.2);transition:transform .3s;user-select:none">🎱</div>' +
      '<div id="ballAnswer" style="font-size:18px;font-weight:900;min-height:32px;margin-bottom:8px"></div>' +
      '<div id="ballSub" style="font-size:12px;color:var(--text-soft);font-weight:700;min-height:20px;margin-bottom:20px"></div>' +
      '<button class="btn primary" onclick="askBall()" style="width:100%;max-width:280px;margin:0 auto">🎱 Задать вопрос</button>' +
      '<div class="info-text" style="margin-top:20px">Загадай вопрос в уме и нажми кнопку</div>' +
    '</div>';
}

function askBall() {
  const orb = document.getElementById('ballOrb');
  const ansEl = document.getElementById('ballAnswer');
  const subEl = document.getElementById('ballSub');
  if (!orb || !ansEl) return;

  orb.style.transform = 'scale(.9) rotate(15deg)';
  ansEl.textContent = '...';
  subEl.textContent = '';

  setTimeout(() => {
    let idx;
    do { idx = Math.floor(Math.random() * BALL_ANSWERS.length); } while (idx === ballLastIdx && BALL_ANSWERS.length > 1);
    ballLastIdx = idx;

    const a = BALL_ANSWERS[idx];
    orb.style.transform = 'scale(1) rotate(0)';
    orb.textContent = a.icon;
    ansEl.textContent = a.text;
    ansEl.style.color = a.color;
    subEl.textContent = 'Шар ответил';
  }, 800);
}

/* ============================================================
   7. ЦВЕТ ДНЯ
   ============================================================ */
function renderColor() {
  const el = document.getElementById('colorContainer');
  if (!el) return;

  const today = getToday();
  const weekday = new Date().getDay();
  const info = WEEKDAY_COLORS[weekday];

  state.colorDay = { day: today, hex: info.hex };
  saveState();

  el.innerHTML =
    '<div class="card" style="text-align:center;padding:28px 20px">' +
      '<div style="font-size:10px;font-weight:800;color:var(--text-soft);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px">Цвет дня · ' + escapeHtml(info.name) + '</div>' +
      '<div style="width:140px;height:140px;border-radius:50%;margin:0 auto 20px;background:' + info.hex + ';box-shadow:0 0 60px ' + info.hex + '80,inset 0 0 40px rgba(0,0,0,.15);border:3px solid rgba(255,255,255,.15)"></div>' +
      '<div style="font-size:20px;font-weight:900;margin-bottom:6px">' + info.hex.toUpperCase() + '</div>' +
      '<div class="setting" style="margin-top:20px"><span class="setting-label">🪐 Планета</span><b class="setting-value">' + escapeHtml(info.planet) + '</b></div>' +
      '<div class="setting"><span class="setting-label">📅 День</span><b class="setting-value">' + escapeHtml(info.name) + '</b></div>' +
      '<div class="info-text" style="margin-top:16px">' +
        'Надень что-то этого цвета, добавь акцент в интерьер или просто визуализируй его в течение дня.' +
      '</div>' +
    '</div>';
}

/* ============================================================
   ЭКСПОРТ В WINDOW
   ============================================================ */
window.renderHoroscope = renderHoroscope;
window.showZodiacDetail = showZodiacDetail;

window.renderNumerology = renderNumerology;
window.showNumerologyDetail = showNumerologyDetail;

window.renderMoon = renderMoon;
window.showMoonDetail = showMoonDetail;

window.renderRunes = renderRunes;
window.showRuneDetail = showRuneDetail;

window.renderStones = renderStones;
window.showStoneDetail = showStoneDetail;

window.renderBall = renderBall;
window.askBall = askBall;

window.renderColor = renderColor;

/* ---------- КОНЕЦ ЧАСТИ 6 ---------- */
console.log('✅ Путь 16 · Часть 6 (эзотерика) загружена');
