/* ============================================================
   ПУТЬ 16 · СОТВОРЦОМ
   app-part7-nature.js — ПРИРОДА (сад, пасека, грибница, травы)
   ============================================================ */

'use strict';

/* ============================================================
   1. САД
   ============================================================ */
function renderGarden() {
  const el = document.getElementById('gardenContainer');
  if (!el) return;

  const plants = state.garden || [];
  const moon = getMoonPhase(new Date());

  let html =
    '<div class="card primary" style="padding:14px;margin-bottom:14px">' +
      '<div style="display:flex;align-items:center;gap:12px">' +
        '<div style="font-size:32px">' + moon.info.icon + '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:13px;font-weight:900">' + escapeHtml(moon.info.name) + '</div>' +
          '<div style="font-size:11px;color:var(--text-dim);font-weight:600">' + getGardenMoonAdvice(moon.idx) + '</div>' +
        '</div>' +
      '</div>' +
    '</div>';

  html += '<button class="btn primary" onclick="openGardenAdd()" style="margin-bottom:14px">🌱 Новая посадка</button>';

  html += '<div style="font-size:11px;font-weight:800;color:var(--text-soft);letter-spacing:1.5px;text-transform:uppercase;margin:8px 0">Справочник</div>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:8px;margin-bottom:14px">';
  html += GARDEN_CULTURES.map(c =>
    '<div class="card" style="text-align:center;padding:10px 4px;margin:0;cursor:pointer" onclick="showCulture(\'' + c.id + '\')">' +
      '<div style="font-size:30px;margin-bottom:4px">' + c.icon + '</div>' +
      '<div style="font-size:10.5px;font-weight:800">' + escapeHtml(c.name) + '</div>' +
      '<div style="font-size:9px;color:var(--text-soft);font-weight:700;margin-top:2px">' + c.days + ' дн.</div>' +
    '</div>'
  ).join('');
  html += '</div>';

  if (!plants.length) {
    html += '<div style="font-size:11px;font-weight:800;color:var(--text-soft);letter-spacing:1.5px;text-transform:uppercase;margin:8px 0">Мои посадки</div>';
    html += '<div class="card"><div class="info-text">Пока ничего не посажено.</div></div>';
  } else {
    html += '<div style="font-size:11px;font-weight:800;color:var(--text-soft);letter-spacing:1.5px;text-transform:uppercase;margin:8px 0">Мои посадки (' + plants.length + ')</div>';
    html += plants.slice().reverse().map(p => {
      const culture = GARDEN_CULTURES.find(c => c.id === p.cultureId);
      if (!culture) return '';

      const planted = new Date(p.plantedDate + 'T00:00:00');
      const daysPassed = Math.floor((Date.now() - planted.getTime()) / 86400000);
      const daysLeft = Math.max(0, culture.days - daysPassed);
      const pct = Math.min(100, (daysPassed / culture.days) * 100);
      const ready = daysLeft === 0;

      return '<div class="card" style="padding:14px">' +
        '<div style="display:flex;gap:12px;align-items:flex-start">' +
          '<div style="font-size:36px">' + culture.icon + '</div>' +
          '<div style="flex:1;min-width:0">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">' +
              '<div style="font-size:14px;font-weight:900">' + escapeHtml(culture.name) + '</div>' +
              '<button class="btn-small danger" onclick="deletePlant(\'' + p.id + '\')">✖</button>' +
            '</div>' +
            (p.note ? '<div style="font-size:11px;color:var(--text-soft);font-weight:600;margin-bottom:6px">' + escapeHtml(p.note) + '</div>' : '') +
            '<div style="font-size:11px;color:var(--text-soft);font-weight:700;margin-bottom:6px">' +
              'Посажено: ' + p.plantedDate + ' · ' + daysPassed + ' дн. назад' +
            '</div>' +
            '<div class="progress-bar" style="height:6px;margin-bottom:6px">' +
              '<div class="progress-fill" style="width:' + pct + '%"></div>' +
            '</div>' +
            '<div style="font-size:11px;font-weight:800;color:' + (ready ? 'var(--gold)' : 'var(--accent-1)') + '">' +
              (ready ? '🌾 ГОТОВО К СБОРУ!' : '⏳ Осталось ' + daysLeft + ' дн.') +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  el.innerHTML = html;
}

function getGardenMoonAdvice(idx) {
  const advice = [
    'Новолуние — не сажай, время планирования.',
    'Растущая — время сажать зелень и листовые.',
    'I четверть — сажай плодовые.',
    'Прибывающая — сажай корнеплоды.',
    'Полнолуние — не сажай, собирай урожай.',
    'Убывающая — сажай корнеплоды на хранение.',
    'III четверть — обрезай, пропалывай.',
    'Бальзамическая — отдых, готовь почву.'
  ];
  return advice[idx] || '';
}

function openGardenAdd() {
  const sel = document.getElementById('gardenCultureSelect');
  if (!sel) return;

  const currentMonth = new Date().getMonth() + 1;
  sel.innerHTML = GARDEN_CULTURES.map(c => {
    const inSeason = c.sow.includes(currentMonth);
    return '<option value="' + c.id + '">' + c.icon + ' ' + c.name +
      (inSeason ? ' ✅ сейчас сезон' : '') +
      ' (' + c.days + ' дн.)</option>';
  }).join('');

  document.getElementById('gardenPlantDate').value = getToday();
  document.getElementById('gardenNote').value = '';
  openModal('gardenAddModal');
}

function addGardenPlant() {
  const cid = document.getElementById('gardenCultureSelect').value;
  const date = document.getElementById('gardenPlantDate').value || getToday();
  const note = document.getElementById('gardenNote').value.trim();

  const culture = GARDEN_CULTURES.find(c => c.id === cid);
  if (!culture) return;

  if (!state.garden) state.garden = [];
  state.garden.push({
    id: 'p_' + Date.now(),
    cultureId: cid,
    plantedDate: date,
    note: note.slice(0, 60),
    created: Date.now()
  });

  addXP(15, 'Посажено: ' + culture.name);
  registerActivity();
  saveState();
  closeModal('gardenAddModal');
  renderGarden();
  showToast('🌱 Посажено: ' + culture.name);
  updateHeaderUI();
}

function deletePlant(id) {
  if (!confirm('Удалить посадку?')) return;
  state.garden = (state.garden || []).filter(p => p.id !== id);
  saveState();
  renderGarden();
}

function showCulture(id) {
  const c = GARDEN_CULTURES.find(x => x.id === id);
  if (!c) return;

  const titleEl = document.getElementById('gardenCultureTitle');
  const bodyEl = document.getElementById('gardenCultureBody');
  if (!titleEl || !bodyEl) return;

  const monthNames = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
  const sowNames = c.sow.map(m => monthNames[m - 1]).join(', ');

  titleEl.textContent = c.icon + ' ' + c.name;
  bodyEl.innerHTML =
    '<div class="setting"><span class="setting-label">⏱ Срок созревания</span><b class="setting-value">' + c.days + ' дней</b></div>' +
    '<div class="setting"><span class="setting-label">📅 Посев</span><b class="setting-value" style="text-align:right;max-width:60%">' + sowNames + '</b></div>' +
    '<div class="info-text" style="margin-top:16px"><b>Описание:</b> ' + escapeHtml(c.desc) + '</div>';

  openModal('gardenCultureModal');
}

/* ============================================================
   2. ПАСЕКА
   ============================================================ */
function renderBees() {
  const el = document.getElementById('beesContainer');
  if (!el) return;

  const hives = state.bees.hives || [];
  const currentMonth = new Date().getMonth() + 1;
  const activePlants = HONEY_PLANTS.filter(p => p.month.includes(currentMonth));

  let html =
    '<div class="card primary" style="padding:14px;margin-bottom:14px">' +
      '<div style="font-size:11px;font-weight:800;color:var(--text-soft);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px">🌼 Сейчас цветёт</div>' +
      (activePlants.length
        ? activePlants.map(p =>
            '<div style="display:flex;gap:10px;align-items:center;padding:6px 0">' +
              '<div style="font-size:22px">' + p.icon + '</div>' +
              '<div style="flex:1;min-width:0">' +
                '<div style="font-size:12.5px;font-weight:800">' + escapeHtml(p.name) + '</div>' +
                '<div style="font-size:10px;color:var(--text-soft);font-weight:600">' + escapeHtml(p.desc) + '</div>' +
              '</div>' +
              '<div style="font-size:10px;font-weight:800;color:var(--green)">' + escapeHtml(p.honey) + '</div>' +
            '</div>'
          ).join('')
        : '<div class="info-text">Сейчас активных медоносов нет</div>') +
    '</div>';

  html += '<div style="display:flex;gap:8px;margin-bottom:14px">' +
    '<button class="btn primary" style="flex:1;margin:0" onclick="openHiveAdd()">🐝 Новый улей</button>' +
    '<button class="btn" style="flex:1;margin:0" onclick="openHoneyBase()">🌼 Медоносы</button>' +
    '</div>';

  if (!hives.length) {
    html += '<div class="card"><div class="info-text">Ульев пока нет. Создай первый 👆</div></div>';
  } else {
    html += '<div style="font-size:11px;font-weight:800;color:var(--text-soft);letter-spacing:1.5px;text-transform:uppercase;margin:8px 0">Мои ульи (' + hives.length + ')</div>';
    html += hives.map(h => {
      const breed = BEE_BREEDS.find(b => b.id === h.breed);
      return '<div class="card" style="padding:14px">' +
        '<div style="display:flex;gap:12px;align-items:flex-start">' +
          '<div style="font-size:36px">🐝</div>' +
          '<div style="flex:1;min-width:0">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">' +
              '<div style="font-size:14px;font-weight:900">' + escapeHtml(h.name) + '</div>' +
              '<button class="btn-small danger" onclick="deleteHive(\'' + h.id + '\')">✖</button>' +
            '</div>' +
            '<div style="font-size:11px;color:var(--text-soft);font-weight:700;margin-bottom:4px">' +
              'Установлен: ' + h.date + ' · ' + (breed ? breed.name : '') +
            '</div>' +
            (breed ? '<div style="font-size:11px;color:var(--text-dim);font-weight:600">' + escapeHtml(breed.desc) + '</div>' : '') +
          '</div>' +
        '</div>' +
        '<button class="btn-small purple" style="width:100%;margin-top:10px" onclick="openQueenTimeline(\'' + h.id + '\')">👑 Вывод матки</button>' +
      '</div>';
    }).join('');
  }

  el.innerHTML = html;
}

function openHiveAdd() {
  const sel = document.getElementById('hiveBreedSelect');
  if (sel) {
    sel.innerHTML = BEE_BREEDS.map(b => '<option value="' + b.id + '">' + b.name + ' — ' + b.desc + '</option>').join('');
  }
  document.getElementById('hiveName').value = '';
  document.getElementById('hiveDate').value = getToday();
  openModal('hiveAddModal');
}

function addHive() {
  const name = document.getElementById('hiveName').value.trim();
  const date = document.getElementById('hiveDate').value || getToday();
  const breed = document.getElementById('hiveBreedSelect').value;

  if (!name) { showToast('Введи название'); return; }

  if (!state.bees) state.bees = { hives: [], queens: [] };
  if (!state.bees.hives) state.bees.hives = [];
  state.bees.hives.push({
    id: 'h_' + Date.now(),
    name: name.slice(0, 30),
    date: date,
    breed: breed,
    created: Date.now()
  });

  addXP(20, 'Улей создан: ' + name);
  registerActivity();
  saveState();
  closeModal('hiveAddModal');
  renderBees();
  showToast('🐝 Улей создан');
  updateHeaderUI();
}

function deleteHive(id) {
  if (!confirm('Удалить улей?')) return;
  state.bees.hives = (state.bees.hives || []).filter(h => h.id !== id);
  saveState();
  renderBees();
}

function openQueenTimeline(hiveId) {
  const hive = (state.bees.hives || []).find(h => h.id === hiveId);
  if (!hive) return;

  const titleEl = document.getElementById('queenTimelineTitle');
  const bodyEl = document.getElementById('queenTimelineBody');
  if (!titleEl || !bodyEl) return;

  const stages = [
    { day:'1-3',   name:'Яйцо',                icon:'🥚', desc:'Матка откладывает яйцо в мисочку' },
    { day:'4-8',   name:'Личинка',              icon:'🐛', desc:'Пчёлы кормят маточным молочком' },
    { day:'9',     name:'Запечатывание',        icon:'🔒', desc:'Ячейка закрывается воском' },
    { day:'10-15', name:'Куколка',              icon:'🦋', desc:'Метаморфоз внутри ячейки' },
    { day:'16',    name:'Выход матки',          icon:'👑', desc:'Молодая матка выходит' },
    { day:'17-21', name:'Облёт и спаривание',   icon:'☀️', desc:'Матка вылетает на спаривание' },
    { day:'21-24', name:'Начало яйцекладки',    icon:'🥚', desc:'Матка начинает откладывать яйца' },
    { day:'~25',   name:'Полноценная матка',    icon:'✅', desc:'Семья работает в полную силу' }
  ];

  titleEl.textContent = '👑 Вывод матки · ' + hive.name;
  bodyEl.innerHTML =
    '<div class="info-text" style="margin-bottom:14px">Полный цикл вывода матки — 16-25 дней. Вот этапы:</div>' +
    stages.map(s =>
      '<div style="display:flex;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">' +
        '<div style="font-size:26px;flex-shrink:0;width:36px;text-align:center">' + s.icon + '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:13px;font-weight:900">' + s.name + '</div>' +
          '<div style="font-size:11px;color:var(--text-soft);font-weight:600">' + s.desc + '</div>' +
        '</div>' +
        '<div style="font-size:10px;font-weight:800;color:var(--accent-1);flex-shrink:0">день ' + s.day + '</div>' +
      '</div>'
    ).join('');

  openModal('queenTimelineModal');
}

function openHoneyBase() {
  renderHoneyBaseList('');
  openModal('honeyBaseModal');
}

let honeyBaseFilter = '';
function filterHoneyBase(q) {
  honeyBaseFilter = q;
  renderHoneyBaseList(q);
}

function renderHoneyBaseList(q) {
  const list = document.getElementById('honeyBaseList');
  if (!list) return;

  const currentMonth = new Date().getMonth() + 1;

  let items = HONEY_PLANTS.slice();
  if (q) {
    const qq = q.toLowerCase();
    items = items.filter(p => p.name.toLowerCase().includes(qq));
  }

  if (!items.length) {
    list.innerHTML = '<div class="info-text">Ничего не найдено</div>';
    return;
  }

  list.innerHTML = items.map(p => {
    const inSeason = p.month.includes(currentMonth);
    return '<div class="card" style="padding:12px;margin-bottom:8px">' +
      '<div style="display:flex;gap:12px;align-items:center">' +
        '<div style="font-size:30px">' + p.icon + '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:13.5px;font-weight:800">' + escapeHtml(p.name) +
            (inSeason ? ' <span style="font-size:10px;color:var(--green)">🌼 сейчас</span>' : '') +
          '</div>' +
          '<div style="font-size:11px;color:var(--text-soft);font-weight:600">' + escapeHtml(p.desc) + '</div>' +
          '<div style="font-size:10px;color:var(--text-soft);font-weight:700;margin-top:4px">Месяцы: ' + p.month.join(', ') + '</div>' +
        '</div>' +
        '<div style="font-size:10px;font-weight:800;color:var(--gold);flex-shrink:0">' + escapeHtml(p.honey) + '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

/* ============================================================
   3. ГРИБНИЦА
   ============================================================ */
function renderMushrooms() {
  const el = document.getElementById('mushroomsContainer');
  if (!el) return;

  const batches = state.mushrooms || [];

  let html = '<button class="btn primary" onclick="openMushroomAdd()" style="margin-bottom:14px">🍄 Новая грибница</button>';

  /* справочник */
  html += '<div style="font-size:11px;font-weight:800;color:var(--text-soft);letter-spacing:1.5px;text-transform:uppercase;margin:8px 0">Виды</div>';
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:8px;margin-bottom:14px">';
  html += MUSHROOM_SPECIES.map(m =>
    '<div class="card" style="text-align:center;padding:10px 4px;margin:0;cursor:pointer" onclick="showMushroomSpecies(\'' + m.id + '\')">' +
      '<div style="font-size:28px;margin-bottom:4px">' + m.icon + '</div>' +
      '<div style="font-size:10.5px;font-weight:800">' + escapeHtml(m.name) + '</div>' +
      '<div style="font-size:9px;color:var(--text-soft);font-weight:700;margin-top:2px">' + m.days + ' дн.</div>' +
    '</div>'
  ).join('');
  html += '</div>';

  if (!batches.length) {
    html += '<div style="font-size:11px;font-weight:800;color:var(--text-soft);letter-spacing:1.5px;text-transform:uppercase;margin:8px 0">Мои грибницы</div>';
    html += '<div class="card"><div class="info-text">Пока грибниц нет. Создай первую 👆</div></div>';
  } else {
    html += '<div style="font-size:11px;font-weight:800;color:var(--text-soft);letter-spacing:1.5px;text-transform:uppercase;margin:8px 0">Мои грибницы (' + batches.length + ')</div>';
    html += batches.slice().reverse().map(b => {
      const sp = MUSHROOM_SPECIES.find(m => m.id === b.speciesId);
      if (!sp) return '';

      const planted = new Date(b.date + 'T00:00:00');
      const daysPassed = Math.floor((Date.now() - planted.getTime()) / 86400000);
      const daysLeft = Math.max(0, sp.days - daysPassed);
      const pct = Math.min(100, (daysPassed / sp.days) * 100);
      const ready = daysLeft === 0;

      return '<div class="card" style="padding:14px">' +
        '<div style="display:flex;gap:12px;align-items:flex-start">' +
          '<div style="font-size:36px">' + sp.icon + '</div>' +
          '<div style="flex:1;min-width:0">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">' +
              '<div style="font-size:14px;font-weight:900">' + escapeHtml(sp.name) + '</div>' +
              '<button class="btn-small danger" onclick="deleteMushroomBatch(\'' + b.id + '\')">✖</button>' +
            '</div>' +
            '<div style="font-size:11px;color:var(--text-soft);font-weight:700;margin-bottom:4px">' +
              'Субстрат: ' + escapeHtml(b.substrate) + ' · ' + b.weight + ' кг' +
            '</div>' +
            '<div style="font-size:11px;color:var(--text-soft);font-weight:600;margin-bottom:6px">' +
              '🌡 ' + sp.temp + ' · 💧 ' + sp.humidity +
            '</div>' +
            '<div class="progress-bar" style="height:6px;margin-bottom:6px">' +
              '<div class="progress-fill" style="width:' + pct + '%"></div>' +
            '</div>' +
            '<div style="font-size:11px;font-weight:800;color:' + (ready ? 'var(--gold)' : 'var(--accent-1)') + '">' +
              (ready ? '🍄 ГОТОВО К СБОРУ!' : '⏳ Осталось ' + daysLeft + ' дн.') +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;gap:6px;margin-top:10px">' +
          '<button class="btn-small" style="flex:1" onclick="waterBatch(\'' + b.id + '\')">💧 Полить</button>' +
          '<button class="btn-small purple" style="flex:1" onclick="harvestBatch(\'' + b.id + '\')" ' + (ready ? '' : 'disabled style="opacity:.4"') + '>🍄 Собрать</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  el.innerHTML = html;
}

function openMushroomAdd() {
  const sel = document.getElementById('mushroomSpeciesSelect');
  if (sel) {
    sel.innerHTML = MUSHROOM_SPECIES.map(m => '<option value="' + m.id + '">' + m.icon + ' ' + m.name + ' (' + m.days + ' дн.)</option>').join('');
  }
  document.getElementById('mushroomDate').value = getToday();
  document.getElementById('mushroomWeight').value = 5;
  openModal('mushroomAddModal');
}

function addMushroomBatch() {
  const speciesId = document.getElementById('mushroomSpeciesSelect').value;
  const substrate = document.getElementById('mushroomSubstrateSelect').value;
  const date = document.getElementById('mushroomDate').value || getToday();
  const weight = parseFloat(document.getElementById('mushroomWeight').value) || 5;

  const sp = MUSHROOM_SPECIES.find(m => m.id === speciesId);
  if (!sp) return;

  if (!state.mushrooms) state.mushrooms = [];
  state.mushrooms.push({
    id: 'm_' + Date.now(),
    speciesId,
    substrate,
    date,
    weight,
    created: Date.now(),
    lastWater: '',
    waterCount: 0
  });

  addXP(20, 'Грибница: ' + sp.name);
  registerActivity();
  saveState();
  closeModal('mushroomAddModal');
  renderMushrooms();
  showToast('🍄 Грибница создана');
  updateHeaderUI();
}

function deleteMushroomBatch(id) {
  if (!confirm('Удалить грибницу?')) return;
  state.mushrooms = (state.mushrooms || []).filter(b => b.id !== id);
  saveState();
  renderMushrooms();
}

function waterBatch(id) {
  const b = (state.mushrooms || []).find(x => x.id === id);
  if (!b) return;

  const today = getToday();
  if (b.lastWater === today) { showToast('Уже поливал сегодня'); return; }

  b.lastWater = today;
  b.waterCount = (b.waterCount || 0) + 1;

  addXP(3, 'Полив грибницы');
  saveState();
  renderMushrooms();
  showToast('💧 Полито');
}

function harvestBatch(id) {
  const b = (state.mushrooms || []).find(x => x.id === id);
  if (!b) return;

  const sp = MUSHROOM_SPECIES.find(m => m.id === b.speciesId);
  if (!sp) return;

  const yieldKg = (b.weight * 0.25).toFixed(1);

  addXP(80, 'Урожай: ' + sp.name);
  state.mushrooms = state.mushrooms.filter(x => x.id !== id);
  saveState();
  renderMushrooms();
  showToast('🍄 Собрано: ~' + yieldKg + ' кг');
  updateHeaderUI();
}

function showMushroomSpecies(id) {
  const sp = MUSHROOM_SPECIES.find(m => m.id === id);
  if (!sp) return;

  const titleEl = document.getElementById('mushroomSpeciesTitle');
  const bodyEl = document.getElementById('mushroomSpeciesBody');
  if (!titleEl || !bodyEl) return;

  titleEl.textContent = sp.icon + ' ' + sp.name;
  bodyEl.innerHTML =
    '<div class="setting"><span class="setting-label">⏱ Срок</span><b class="setting-value">' + sp.days + ' дней</b></div>' +
    '<div class="setting"><span class="setting-label">🌡 Температура</span><b class="setting-value">' + sp.temp + '</b></div>' +
    '<div class="setting"><span class="setting-label">💧 Влажность</span><b class="setting-value">' + sp.humidity + '</b></div>' +
    '<div class="info-text" style="margin-top:16px">' + escapeHtml(sp.desc) + '</div>';

  openModal('mushroomSpeciesModal');
}

/* ============================================================
   4. ТРАВЫ
   ============================================================ */
function renderHerbs() {
  const el = document.getElementById('herbsContainer');
  if (!el) return;

  const currentMonth = new Date().getMonth() + 1;
  const monthNames = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];

  /* фильтр по времени сбора */
  const inSeason = HERBS.filter(h => {
    const monthsMap = {
      'Июнь-август':[6,7,8], 'Июнь-сентябрь':[6,7,8,9], 'Июнь-июль':[6,7],
      'Июль-август':[7,8], 'Май-сентябрь':[5,6,7,8,9], 'Апрель-май':[4,5]
    };
    const months = monthsMap[h.time] || [];
    return months.includes(currentMonth);
  });

  let html =
    '<div class="card primary" style="padding:14px;margin-bottom:14px">' +
      '<div style="font-size:11px;font-weight:800;color:var(--text-soft);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px">🌿 Сейчас можно собрать</div>' +
      (inSeason.length
        ? inSeason.map(h => '<span style="display:inline-block;font-size:12px;font-weight:800;padding:4px 10px;border-radius:999px;background:rgba(76,217,100,.15);color:var(--green);margin:3px 3px 0 0">' + h.icon + ' ' + h.name + '</span>').join('')
        : '<div class="info-text">Сейчас не сезон сбора</div>') +
    '</div>';

  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px">';
  html += HERBS.map(h =>
    '<div class="card" style="padding:14px;margin:0;cursor:pointer" onclick="showHerbDetail(\'' + escapeHtml(h.name) + '\')">' +
      '<div style="font-size:36px;text-align:center;margin-bottom:8px">' + h.icon + '</div>' +
      '<div style="font-size:13px;font-weight:900;text-align:center;margin-bottom:4px">' + escapeHtml(h.name) + '</div>' +
      '<div style="font-size:10px;color:var(--text-soft);font-weight:700;text-align:center">' + escapeHtml(h.parts) + '</div>' +
      '<div style="font-size:9.5px;color:var(--accent-1);font-weight:800;text-align:center;margin-top:4px">' + escapeHtml(h.time) + '</div>' +
    '</div>'
  ).join('');
  html += '</div>';

  el.innerHTML = html;
}

function showHerbDetail(name) {
  const h = HERBS.find(x => x.name === name);
  if (!h) return;

  const titleEl = document.getElementById('herbDetailTitle');
  const bodyEl = document.getElementById('herbDetailBody');
  if (!titleEl || !bodyEl) return;

  titleEl.textContent = h.icon + ' ' + h.name;
  bodyEl.innerHTML =
    '<div class="setting"><span class="setting-label">🌿 Части сбора</span><b class="setting-value">' + escapeHtml(h.parts) + '</b></div>' +
    '<div class="setting"><span class="setting-label">📅 Время сбора</span><b class="setting-value">' + escapeHtml(h.time) + '</b></div>' +
    '<div class="info-text" style="margin-top:16px"><b>Свойства:</b> ' + escapeHtml(h.props) + '</div>';

  openModal('herbDetailModal');
}

/* ============================================================
   ЭКСПОРТ В WINDOW
   ============================================================ */
window.renderGarden = renderGarden;
window.openGardenAdd = openGardenAdd;
window.addGardenPlant = addGardenPlant;
window.deletePlant = deletePlant;
window.showCulture = showCulture;

window.renderBees = renderBees;
window.openHiveAdd = openHiveAdd;
window.addHive = addHive;
window.deleteHive = deleteHive;
window.openQueenTimeline = openQueenTimeline;
window.openHoneyBase = openHoneyBase;
window.filterHoneyBase = filterHoneyBase;

window.renderMushrooms = renderMushrooms;
window.openMushroomAdd = openMushroomAdd;
window.addMushroomBatch = addMushroomBatch;
window.deleteMushroomBatch = deleteMushroomBatch;
window.waterBatch = waterBatch;
window.harvestBatch = harvestBatch;
window.showMushroomSpecies = showMushroomSpecies;

window.renderHerbs = renderHerbs;
window.showHerbDetail = showHerbDetail;

/* ---------- КОНЕЦ ЧАСТИ 7 ---------- */
console.log('✅ Путь 16 · Часть 7 (природа) загружена');
