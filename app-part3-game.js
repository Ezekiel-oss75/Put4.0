/* ============================================================
   ПУТЬ 16 · СОТВОРЦОМ
   app-part3-game.js — ИГРА (карта, колесо, сундук, босс, питомцы, домен, weekly)
   ============================================================ */

'use strict';

/* ============================================================
   1. КАРТА СУДЬБЫ
   ============================================================ */
function renderFateCard() {
  const el = document.getElementById('cardContainer');
  if (!el) return;

  const today = getToday();
  let card;

  if (state.fateCard.day === today && state.fateCard.id) {
    card = FATE_CARDS.find(c => c.id === state.fateCard.id);
  } else {
    card = pickSeeded(FATE_CARDS, today);
    state.fateCard = { day: today, id: card.id };
    saveState();
  }

  if (!card) { el.innerHTML = ''; return; }

  const suitIcons = { свет:'☀️', сила:'⚔️', сердце:'💗', дух:'🕯️', вызов:'⚡', судьба:'🎡', мудрость:'📜', путь:'🛞' };

  el.innerHTML =
    '<div class="card primary" style="text-align:center;padding:28px 20px">' +
      '<div style="font-size:10px;font-weight:800;letter-spacing:2px;color:var(--text-soft);text-transform:uppercase;margin-bottom:8px">' +
        (suitIcons[card.suit] || '✨') + ' ' + escapeHtml(card.suit) +
      '</div>' +
      '<div style="font-size:88px;margin:8px 0;filter:drop-shadow(0 0 24px rgba(79,172,254,.5))">' + card.icon + '</div>' +
      '<div style="font-size:26px;font-weight:900;margin-bottom:10px">' + escapeHtml(card.name) + '</div>' +
      '<div style="font-size:13.5px;color:var(--text-dim);line-height:1.6;margin-bottom:18px;font-weight:600">' + escapeHtml(card.desc) + '</div>' +
      '<div style="background:rgba(255,255,255,.05);border-radius:14px;padding:14px;margin-bottom:16px">' +
        '<div style="font-size:10.5px;font-weight:800;letter-spacing:1.5px;color:var(--text-soft);text-transform:uppercase;margin-bottom:6px">Задача дня</div>' +
        '<div style="font-size:14px;font-weight:800">' + escapeHtml(card.task) + '</div>' +
      '</div>' +
      '<button class="btn primary" onclick="completeFateCard()" style="width:100%">✅ Выполнил задачу · +' + card.xp + ' XP</button>' +
    '</div>';

  /* аффирмация */
  const aEl = document.getElementById('affirmationContainer');
  if (aEl) {
    let aff;
    if (state.affirmation.day === today && state.affirmation.text) {
      aff = state.affirmation.text;
    } else {
      const pool = AFFIRMATIONS.concat(state.customAffirmations || []);
      aff = pickSeeded(pool, today + 'aff');
      state.affirmation = { day: today, text: aff };
      saveState();
    }
    aEl.innerHTML =
      '<div class="card" style="text-align:center;padding:18px">' +
        '<div style="font-size:15px;font-weight:800;line-height:1.5;font-style:italic">«' + escapeHtml(aff) + '»</div>' +
      '</div>';
  }

  /* мантра */
  const mEl = document.getElementById('mantraContainer');
  if (mEl) {
    let m;
    if (state.mantra.day === today && state.mantra.text) {
      m = MANTRAS.find(x => x.text === state.mantra.text) || MANTRAS[0];
    } else {
      m = pickSeeded(MANTRAS, today + 'mantra');
      state.mantra = { day: today, text: m.text };
      saveState();
    }
    mEl.innerHTML =
      '<div class="card" style="text-align:center;padding:18px">' +
        '<div style="font-size:26px;font-weight:900;letter-spacing:3px;margin-bottom:8px;background:linear-gradient(90deg,var(--accent-1),var(--accent-2));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent">' + escapeHtml(m.text) + '</div>' +
        '<div style="font-size:12.5px;color:var(--text-dim);font-weight:600">' + escapeHtml(m.meaning) + '</div>' +
      '</div>';
  }

  /* цитата */
  const qEl = document.getElementById('quoteContainer');
  if (qEl) {
    let q;
    if (state.quote.day === today && state.quote.text) {
      q = QUOTES.find(x => x.text === state.quote.text) || QUOTES[0];
    } else {
      q = pickSeeded(QUOTES, today + 'quote');
      state.quote = { day: today, text: q.text };
      saveState();
    }
    qEl.innerHTML =
      '<div class="card" style="padding:18px">' +
        '<div style="font-size:13.5px;line-height:1.6;font-style:italic;font-weight:600;margin-bottom:8px">«' + escapeHtml(q.text) + '»</div>' +
        '<div style="font-size:11.5px;color:var(--text-soft);font-weight:800;text-align:right">— ' + escapeHtml(q.author) + '</div>' +
      '</div>';
  }
}

function completeFateCard() {
  const today = getToday();
  if (state.fateCard.day !== today) return;

  const card = FATE_CARDS.find(c => c.id === state.fateCard.id);
  if (!card) return;

  const key = 'fate_' + today;
  if (state[key]) { showToast('Уже выполнено сегодня'); return; }

  state[key] = true;
  addXP(card.xp, 'Карта судьбы: ' + card.name);
  registerActivity();
  showToast('🌟 Задача дня выполнена!');
  saveState();
}

/* ============================================================
   2. КОЛЕСО ФОРТУНЫ
   ============================================================ */
let wheelAngle = 0;
let wheelSpinning = false;

function renderWheel() {
  const el = document.getElementById('wheelContainer');
  if (!el) return;

  const today = getToday();
  const spun = state.wheel.day === today && state.wheel.spun;

  el.innerHTML =
    '<div style="position:relative;width:260px;height:260px;margin:20px auto">' +
      '<canvas id="wheelCanvas" width="520" height="520" style="width:100%;height:100%;filter:drop-shadow(0 8px 32px rgba(79,172,254,.35))"></canvas>' +
      '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:32px;pointer-events:none">🎯</div>' +
    '</div>' +
    '<button class="btn primary" ' + (spun ? 'disabled style="opacity:.5"' : '') + ' onclick="spinWheel()">' +
      (spun ? '✅ Уже крутил сегодня' : '🎡 Крутить!') +
    '</button>';

  drawWheel();
}

function drawWheel() {
  const canvas = document.getElementById('wheelCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const R = W / 2 - 10;
  const cx = W / 2;
  const cy = W / 2;

  ctx.clearRect(0, 0, W, W);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(wheelAngle);

  const total = WHEEL_PRIZES.length;
  const arc = (Math.PI * 2) / total;

  for (let i = 0; i < total; i++) {
    const p = WHEEL_PRIZES[i];
    const start = i * arc;
    const end = start + arc;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, R, start, end);
    ctx.closePath();
    ctx.fillStyle = p.color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.3)';
    ctx.lineWidth = 3;
    ctx.stroke();

    /* текст */
    ctx.save();
    ctx.rotate(start + arc / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(p.label, R - 16, 8);
    ctx.restore();
  }

  /* центр */
  ctx.beginPath();
  ctx.arc(0, 0, 42, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(10,10,25,.95)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.2)';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.restore();
}

function spinWheel() {
  if (wheelSpinning) return;
  const today = getToday();
  if (state.wheel.day === today && state.wheel.spun) return;

  wheelSpinning = true;
  wheelAngle = 0;

  const prize = weightedRandom(WHEEL_PRIZES);
  const total = WHEEL_PRIZES.length;
  const arc = (Math.PI * 2) / total;
  const idx = WHEEL_PRIZES.indexOf(prize);

  /* цель: середина сегмента idx сверху (угол -PI/2 от 0) */
  const targetBase = -Math.PI / 2 - (idx * arc) - arc / 2;
  const totalRotation = Math.PI * 2 * 6 + targetBase; /* 6 оборотов */

  const start = performance.now();
  const duration = 4200;
  const startAngle = wheelAngle;

  function anim(now) {
    const t = Math.min(1, (now - start) / duration);
    const ease = 1 - Math.pow(1 - t, 4); /* easeOutQuart */
    wheelAngle = startAngle + totalRotation * ease;
    drawWheel();

    if (t < 1) {
      requestAnimationFrame(anim);
    } else {
      wheelSpinning = false;
      state.wheel = { day: today, spun: true };
      saveState();

      if (prize.xp > 0) {
        addXP(prize.xp, 'Колесо фортуны');
        showToast('🎉 ' + prize.label + '!');
      } else {
        showToast('😅 Пусто. Попробуй завтра.');
      }

      renderWheel();
      updateHeaderUI();
    }
  }
  requestAnimationFrame(anim);
}

/* ============================================================
   3. СУНДУК ДНЯ
   ============================================================ */
function renderChest() {
  const el = document.getElementById('chestContainer');
  if (!el) return;

  const today = getToday();
  const opened = state.chest.day === today && state.chest.opened;

  el.innerHTML =
    '<div class="card primary" style="text-align:center;padding:32px 20px">' +
      '<div style="font-size:100px;margin-bottom:12px;' + (opened ? 'opacity:.35;' : 'animation:pulse 2s ease-in-out infinite;') + '">' +
        (opened ? '📭' : '📦') +
      '</div>' +
      '<div style="font-size:18px;font-weight:900;margin-bottom:8px">' +
        (opened ? 'Сундук открыт' : 'Сундук дня') +
      '</div>' +
      '<div class="info-text" style="margin-bottom:16px">' +
        (opened ? 'Возвращайся завтра за новым!' : 'Открой и получи награду от 10 до 500 XP') +
      '</div>' +
      '<button class="btn primary" ' + (opened ? 'disabled style="opacity:.5"' : '') + ' onclick="openChest()">' +
        (opened ? '✅ Уже открыт' : '🎁 Открыть сундук') +
      '</button>' +
    '</div>';
}

function openChest() {
  const today = getToday();
  if (state.chest.day === today && state.chest.opened) return;

  const rarity = weightedRandom(CHEST_RARITIES);
  const xp = Math.floor(rarity.xpMin + Math.random() * (rarity.xpMax - rarity.xpMin + 1));

  state.chest = { day: today, opened: true };
  addXP(xp, 'Сундук: ' + rarity.name);

  const popup = document.getElementById('chestPopup');
  const icon = document.getElementById('chestIcon');
  const name = document.getElementById('chestName');
  const xpEl = document.getElementById('chestXP');
  const rarEl = document.getElementById('chestRarity');

  if (popup && icon) {
    icon.textContent = rarity.id === 'legendary' ? '👑' : rarity.id === 'epic' ? '💎' : rarity.id === 'rare' ? '🎁' : '📦';
    name.textContent = rarity.name + ' сундук';
    xpEl.textContent = '+' + xp + ' XP';
    rarEl.textContent = rarity.name.toUpperCase();
    rarEl.className = 'chest-rarity rarity-' + rarity.id;
    popup.classList.add('show');
    setTimeout(() => popup.classList.remove('show'), 2800);
  }

  saveState();
  renderChest();
  updateHeaderUI();
}

/* ============================================================
   4. БОСС НЕДЕЛИ
   ============================================================ */
function renderBoss() {
  const el = document.getElementById('bossContainer');
  if (!el) return;

  const week = getWeekKey();
  let boss = state.currentBoss;

  if (!boss || boss.week !== week || boss.defeated) {
    const newBoss = pickSeeded(BOSSES, week + 'boss');
    boss = {
      week: week,
      id: newBoss.id,
      hp: newBoss.hp,
      maxHp: newBoss.hp,
      defeated: false
    };
    state.currentBoss = boss;
    saveState();
  }

  const bossData = BOSSES.find(b => b.id === boss.id);
  if (!bossData) { el.innerHTML = ''; return; }

  const hpPct = Math.max(0, (boss.hp / boss.maxHp) * 100);

  el.innerHTML =
    '<div class="card" style="text-align:center;padding:24px 20px">' +
      '<div style="font-size:90px;margin-bottom:8px;filter:drop-shadow(0 0 24px rgba(255,59,92,.6))">' + bossData.icon + '</div>' +
      '<div style="font-size:22px;font-weight:900;margin-bottom:6px">' + escapeHtml(bossData.name) + '</div>' +
      '<div class="info-text" style="margin-bottom:16px">' + escapeHtml(bossData.desc) + '</div>' +
      '<div class="progress-bar" style="height:14px;margin-bottom:6px">' +
        '<div class="progress-fill" style="width:' + hpPct + '%;background:linear-gradient(90deg,#ff3b5c,#ff6b35)"></div>' +
      '</div>' +
      '<div style="font-size:12px;font-weight:800;color:var(--text-soft);margin-bottom:18px">' +
        boss.hp + ' / ' + boss.maxHp + ' HP' +
      '</div>' +
      '<div class="info-text">💪 Каждая практика — 10 урона. Преграды — 30 урона. Аскезы — 50 урона.</div>' +
      (boss.defeated ? '<div style="font-size:14px;font-weight:900;color:var(--gold);margin-top:12px">🏆 БОСС ПОВЕРЖЕН!</div>' : '') +
    '</div>';
}

function hitBoss(damage) {
  const boss = state.currentBoss;
  if (!boss || boss.defeated) return;
  boss.hp = Math.max(0, boss.hp - damage);
  if (boss.hp === 0) {
    boss.defeated = true;
    if (!state.bossesDefeated) state.bossesDefeated = [];
    state.bossesDefeated.push({ week: boss.week, id: boss.id, t: Date.now() });
    const bossData = BOSSES.find(b => b.id === boss.id);
    addXP(bossData.xp, 'Победа над боссом: ' + bossData.name);
    showToast('⚔️ Босс повержен! +' + bossData.xp + ' XP');

    if (typeof unlockAchievement === 'function') {
      unlockAchievement('a_boss1');
      if (state.bossesDefeated.length >= 5) unlockAchievement('a_boss5');
    }
  }
  saveState();
}

/* ============================================================
   5. ПИТОМЕЦ
   ============================================================ */
function renderPet() {
  const el = document.getElementById('petContainer');
  if (!el) return;

  const petId = state.pets.active;
  const pet = PETS.find(p => p.id === petId);
  if (!pet) { el.innerHTML = ''; return; }

  const name = state.pets.names[petId] || pet.name;

  el.innerHTML =
    '<div class="card primary" style="text-align:center;padding:32px 20px">' +
      '<div style="font-size:120px;margin-bottom:12px;filter:drop-shadow(0 0 32px rgba(79,172,254,.5));animation:float 3s ease-in-out infinite">' + pet.icon + '</div>' +
      '<div style="font-size:24px;font-weight:900;margin-bottom:4px">' + escapeHtml(name) + '</div>' +
      '<div style="font-size:12px;color:var(--text-soft);font-weight:800;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:16px">' + escapeHtml(pet.name) + '</div>' +
      '<div class="info-text" style="margin-bottom:12px">' + escapeHtml(pet.desc) + '</div>' +
      '<div style="display:inline-block;background:rgba(76,217,100,.15);border:1px solid rgba(76,217,100,.35);color:var(--green);padding:8px 18px;border-radius:999px;font-size:13px;font-weight:900;margin-bottom:18px">' + escapeHtml(pet.bonus) + '</div>' +
      '<button class="btn" onclick="openPetNameModal()" style="width:100%">✏️ Переименовать</button>' +
    '</div>' +
    '<style>@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }</style>';
}

function renderPetShop() {
  const el = document.getElementById('petshopContainer');
  if (!el) return;

  el.innerHTML = PETS.map(p => {
    const owned = state.pets.owned.includes(p.id);
    const active = state.pets.active === p.id;
    const canBuy = state.xp >= p.price;

    return '<div class="card" style="display:flex;gap:14px;align-items:center;padding:14px">' +
      '<div style="font-size:44px;flex-shrink:0">' + p.icon + '</div>' +
      '<div style="flex:1;min-width:0">' +
        '<div style="font-size:15px;font-weight:800;margin-bottom:2px">' + escapeHtml(p.name) + '</div>' +
        '<div style="font-size:11.5px;color:var(--text-dim);font-weight:600;margin-bottom:4px">' + escapeHtml(p.desc) + '</div>' +
        '<div style="font-size:11px;color:var(--green);font-weight:800">' + escapeHtml(p.bonus) + '</div>' +
      '</div>' +
      (owned
        ? (active
            ? '<div style="font-size:11px;font-weight:900;color:var(--green);padding:8px 12px;background:rgba(76,217,100,.15);border-radius:10px">✓ Активен</div>'
            : '<button class="btn-small" onclick="setActivePet(\'' + p.id + '\')">Выбрать</button>')
        : '<button class="btn-small ' + (canBuy ? 'purple' : 'danger') + '" ' + (canBuy ? '' : 'disabled style="opacity:.5"') + ' onclick="buyPet(\'' + p.id + '\')">' + p.price + ' XP</button>'
      ) +
    '</div>';
  }).join('');
}

function buyPet(id) {
  const pet = PETS.find(p => p.id === id);
  if (!pet) return;
  if (state.pets.owned.includes(id)) return;
  if (state.xp < pet.price) { showToast('Недостаточно XP'); return; }

  state.xp -= pet.price;
  state.pets.owned.push(id);
  state.pets.names[id] = pet.name;

  if (id === 'dragon' && typeof unlockCard === 'function') unlockCard('cc9');

  showToast('🎉 Питомец куплен: ' + pet.name);
  saveState();
  renderPetShop();
  renderPet();
  updateHeaderUI();

  if (typeof unlockAchievement === 'function') {
    if (state.pets.owned.length >= 1) unlockAchievement('a_pet1');
    if (state.pets.owned.length >= 5) unlockAchievement('a_pet5');
  }
}

function setActivePet(id) {
  if (!state.pets.owned.includes(id)) return;
  state.pets.active = id;
  saveState();
  showToast('✨ Питомец изменён');
  renderPetShop();
  renderPet();
  updateHeaderUI();
}

function openPetNameModal() {
  const petId = state.pets.active;
  const pet = PETS.find(p => p.id === petId);
  if (!pet) return;
  document.getElementById('petNameEmoji').textContent = pet.icon;
  document.getElementById('petNewName').value = state.pets.names[petId] || pet.name;
  openModal('petNameModal');
}

function savePetName() {
  const v = document.getElementById('petNewName').value.trim();
  if (!v) { showToast('Введи имя'); return; }
  state.pets.names[state.pets.active] = v.slice(0, 20);
  saveState();
  closeModal('petNameModal');
  renderPet();
  showToast('✅ Имя сохранено');
}

/* ============================================================
   6. ДОМЕН
   ============================================================ */
function renderDomain() {
  const el = document.getElementById('domainContainer');
  if (!el) return;

  const totalIncome = DOMAIN_BUILDINGS.reduce((sum, b) => {
    const cnt = state.domain[b.id] ? state.domain[b.id].count : 0;
    return sum + (b.income * cnt);
  }, 0);

  el.innerHTML =
    '<div class="card primary" style="padding:16px;text-align:center;margin-bottom:14px">' +
      '<div style="font-size:11px;font-weight:800;letter-spacing:1.5px;color:var(--text-soft);text-transform:uppercase;margin-bottom:4px">Доход домена</div>' +
      '<div style="font-size:24px;font-weight:900;color:var(--green)">' + totalIncome + ' XP/день</div>' +
    '</div>' +
    DOMAIN_BUILDINGS.map(b => {
      const cnt = state.domain[b.id] ? state.domain[b.id].count : 0;
      const canBuy = state.xp >= b.price;

      return '<div class="card" style="display:flex;gap:14px;align-items:center;padding:14px">' +
        '<div style="font-size:44px;flex-shrink:0">' + b.icon + '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:15px;font-weight:800;margin-bottom:2px">' + escapeHtml(b.name) + (cnt > 0 ? ' ×' + cnt : '') + '</div>' +
          '<div style="font-size:11.5px;color:var(--text-dim);font-weight:600;margin-bottom:4px">' + escapeHtml(b.desc) + '</div>' +
          '<div style="font-size:11px;color:var(--green);font-weight:800">+' + b.income + ' XP/день</div>' +
        '</div>' +
        '<button class="btn-small ' + (canBuy ? 'purple' : 'danger') + '" ' + (canBuy ? '' : 'disabled style="opacity:.5"') + ' onclick="buildBuilding(\'' + b.id + '\')">' + b.price + ' XP</button>' +
      '</div>';
    }).join('');
}

function buildBuilding(id) {
  const b = DOMAIN_BUILDINGS.find(x => x.id === id);
  if (!b) return;
  if (state.xp < b.price) { showToast('Недостаточно XP'); return; }

  state.xp -= b.price;
  if (!state.domain[id]) state.domain[id] = { count: 0 };
  state.domain[id].count++;

  showToast('🏗 Построено: ' + b.name);
  saveState();
  renderDomain();
  updateHeaderUI();

  if (typeof unlockAchievement === 'function') {
    unlockAchievement('a_domain1');
    const allBuilt = DOMAIN_BUILDINGS.every(b => state.domain[b.id] && state.domain[b.id].count > 0);
    if (allBuilt) unlockAchievement('a_domainall');
  }
}

/* ============================================================
   7. НАГРАДА НЕДЕЛИ
   ============================================================ */
function renderWeekly() {
  const el = document.getElementById('weeklyContainer');
  if (!el) return;

  const week = getWeekKey();
  const claimed = state.weekly.week === week && state.weekly.claimed;
  const canClaim = state.streak >= 7;
  const daysLeft = Math.max(0, 7 - state.streak);

  el.innerHTML =
    '<div class="card primary" style="text-align:center;padding:28px 20px">' +
      '<div style="font-size:80px;margin-bottom:8px">' + (claimed ? '✅' : '🎁') + '</div>' +
      '<div style="font-size:20px;font-weight:900;margin-bottom:8px">' +
        (claimed ? 'Награда получена' : 'Награда за неделю') +
      '</div>' +
      '<div class="info-text" style="margin-bottom:16px">' +
        (claimed ? 'Возвращайся на следующей неделе!' : '7 дней подряд — большая награда') +
      '</div>' +
      '<div class="progress-bar" style="height:12px;margin-bottom:8px">' +
        '<div class="progress-fill" style="width:' + Math.min(100, (state.streak / 7) * 100) + '%"></div>' +
      '</div>' +
      '<div style="font-size:12px;font-weight:800;color:var(--text-soft);margin-bottom:18px">' +
        state.streak + ' / 7 дней' + (daysLeft > 0 ? ' · ещё ' + daysLeft : '') +
      '</div>' +
      '<button class="btn primary" ' + (canClaim && !claimed ? '' : 'disabled style="opacity:.5"') + ' onclick="claimWeekly()">' +
        (claimed ? '✅ Получено' : (canClaim ? '🎁 Забрать 500 XP' : '🔥 Нужно 7 дней')) +
      '</button>' +
    '</div>';
}

function claimWeekly() {
  const week = getWeekKey();
  if (state.streak < 7) { showToast('Нужно 7 дней подряд'); return; }
  if (state.weekly.week === week && state.weekly.claimed) { showToast('Уже получено'); return; }

  state.weekly = { week: week, claimed: true };
  addXP(500, 'Награда недели');
  showToast('🎁 +500 XP за неделю!');
  saveState();
  renderWeekly();
}

/* ============================================================
   8. ДОСТИЖЕНИЯ
   ============================================================ */
function renderAchievements() {
  const el = document.getElementById('achGrid');
  if (!el) return;

  el.innerHTML = ACHIEVEMENTS.map(a => {
    const unlocked = state.achievements.includes(a.id);
    return '<div class="ach-item ' + (unlocked ? 'unlocked' : 'locked') + '">' +
      '<div class="ach-item-icon">' + a.icon + '</div>' +
      '<div class="ach-item-name">' + escapeHtml(a.name) + '</div>' +
    '</div>';
  }).join('');
}

function unlockAchievement(id) {
  if (state.achievements.includes(id)) return;
  const a = ACHIEVEMENTS.find(x => x.id === id);
  if (!a) return;

  state.achievements.push(id);
  showAchPopup(a.icon, a.name);
  addXP(50, 'Достижение: ' + a.name);
  saveState();
  renderAchievements();
}

/* ============================================================
   9. КОЛЛЕКЦИЯ КАРТОЧЕК
   ============================================================ */
function renderCollection() {
  const el = document.getElementById('collectionContainer');
  if (!el) return;

  el.innerHTML = COLLECTION_CARDS.map(c => {
    const owned = state.cards.includes(c.id);
    return '<div class="card" style="opacity:' + (owned ? '1' : '.35') + ';text-align:center;padding:16px 8px;margin-bottom:0">' +
      '<div style="font-size:44px;margin-bottom:6px">' + (owned ? c.icon : '❓') + '</div>' +
      '<div style="font-size:12px;font-weight:800;margin-bottom:2px">' + escapeHtml(c.name) + '</div>' +
      '<div style="font-size:9.5px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:var(--text-soft)">' + c.rarity + '</div>' +
    '</div>';
  }).join('');

  /* сеткой */
  el.style.display = 'grid';
  el.style.gridTemplateColumns = 'repeat(auto-fill, minmax(110px, 1fr))';
  el.style.gap = '10px';
}

function unlockCard(id) {
  if (state.cards.includes(id)) return;
  const c = COLLECTION_CARDS.find(x => x.id === id);
  if (!c) return;

  state.cards.push(id);

  const modal = document.getElementById('cardUnlockModal');
  if (modal) {
    document.getElementById('cardUnlockIcon').textContent = c.icon;
    document.getElementById('cardUnlockName').textContent = c.name;
    document.getElementById('cardUnlockDesc').textContent = c.desc;
    modal.classList.add('show');
  }

  saveState();

  if (state.cards.length >= 5) unlockAchievement('a_card1');
  if (state.cards.length === COLLECTION_CARDS.length) unlockAchievement('a_cardall');
}

function closeCardUnlock() {
  closeModal('cardUnlockModal');
}

/* ============================================================
   10. ТЕПЛОВАЯ КАРТА
   ============================================================ */
function renderHeatmap() {
  const el = document.getElementById('heatmapContainer');
  if (!el) return;

  const today = new Date();
  const days = [];
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(getDayKey(d));
  }

  function level(key) {
    const h = state.history[key];
    if (!h || !h.practices || h.practices.length === 0) return 0;
    const c = h.practices.length;
    if (c >= 5) return 4;
    if (c >= 3) return 3;
    if (c >= 2) return 2;
    return 1;
  }

  const colors = ['rgba(255,255,255,.06)', 'rgba(79,172,254,.3)', 'rgba(79,172,254,.55)', 'rgba(79,172,254,.8)', 'var(--accent-1)'];

  el.innerHTML =
    '<div style="background:var(--card);border:1px solid var(--border);border-radius:14px;padding:14px">' +
      '<div style="display:grid;grid-template-columns:repeat(53, 1fr);grid-template-rows:repeat(7, 1fr);gap:3px;grid-auto-flow:column">' +
        days.map(k => {
          const lvl = level(k);
          return '<div title="' + k + ': ' + lvl + '" onclick="showDayDetail(\'' + k + '\')" style="aspect-ratio:1;background:' + colors[lvl] + ';border-radius:3px;cursor:pointer"></div>';
        }).join('') +
      '</div>' +
      '<div style="display:flex;gap:6px;align-items:center;justify-content:flex-end;margin-top:12px;font-size:10px;font-weight:700;color:var(--text-soft)">' +
        '<span>Меньше</span>' +
        colors.map(c => '<div style="width:12px;height:12px;background:' + c + ';border-radius:3px"></div>').join('') +
        '<span>Больше</span>' +
      '</div>' +
    '</div>';
}

function showDayDetail(key) {
  const h = state.history[key];
  const title = document.getElementById('dayDetailTitle');
  const body = document.getElementById('dayDetailBody');
  if (!title || !body) return;

  title.textContent = '📅 ' + key;
  if (!h) {
    body.innerHTML = '<div class="info-text">Нет активности в этот день.</div>';
  } else {
    body.innerHTML =
      '<div style="margin-bottom:10px"><b>XP:</b> ' + (h.xp || 0) + '</div>' +
      '<div style="margin-bottom:10px"><b>Практик:</b> ' + ((h.practices || []).length) + '</div>' +
      (h.practices && h.practices.length
        ? '<div style="margin-top:12px"><b>Список:</b><ul style="padding-left:20px;margin-top:6px">' +
          h.practices.map(p => '<li>' + escapeHtml(p) + '</li>').join('') +
          '</ul></div>'
        : '');
  }
  openModal('dayDetailModal');
}

/* ============================================================
   11. ПРОГНОЗ
   ============================================================ */
function renderForecast() {
  const el = document.getElementById('forecastContainer');
  if (!el) return;

  const days = Object.keys(state.history);
  if (days.length < 3) {
    el.innerHTML = '<div class="card"><div class="info-text">Нужно минимум 3 дня активности для прогноза.</div></div>';
    return;
  }

  const last14 = days.slice(-14);
  const totalXP = last14.reduce((s, k) => s + (state.history[k].xp || 0), 0);
  const avgXP = totalXP / last14.length;

  const xpToNextLevel = xpForNextLevel() - state.xp;
  const daysToNext = avgXP > 0 ? Math.ceil(xpToNextLevel / avgXP) : '∞';

  const xp30 = Math.round(avgXP * 30);
  const xp365 = Math.round(avgXP * 365);

  el.innerHTML =
    '<div class="card">' +
      '<div class="setting"><span class="setting-label">📊 Средний XP/день</span><b class="setting-value">' + Math.round(avgXP) + '</b></div>' +
      '<div class="setting"><span class="setting-label">🎯 До следующего уровня</span><b class="setting-value">' + daysToNext + ' дней</b></div>' +
      '<div class="setting"><span class="setting-label">📅 Через 30 дней</span><b class="setting-value">+' + xp30 + ' XP</b></div>' +
      '<div class="setting"><span class="setting-label">🗓 Через год</span><b class="setting-value">+' + xp365 + ' XP</b></div>' +
      '<div class="setting"><span class="setting-label">🔥 Текущий стрик</span><b class="setting-value">' + state.streak + ' дней</b></div>' +
    '</div>';
}

/* ============================================================
   12. ПУТЬ ДНЯ
   ============================================================ */
function renderDailyPath() {
  const el = document.getElementById('dailyPathContainer');
  if (!el) return;

  const today = getToday();
  const hist = state.history[today] || { practices: [] };
  const done = hist.practices || [];

  const steps = [
    { icon:'🌅', text:'Аффирмация дня',      done: true, page:'card' },
    { icon:'🎴', text:'Карта судьбы',         done: !!state['fate_' + today], page:'card' },
    { icon:'📋', text:'1 практика',           done: done.length >= 1, page:'practices' },
    { icon:'⚔️', text:'1 квест дня',          done: (state.quests.done || []).length >= 1, page:'quests' },
    { icon:'💧', text:'Вода 2л',              done: done.includes('Вода'), page:'practices' },
    { icon:'🙏', text:'Вечерняя рефлексия',   done: !!state.reflection[today], page:'reflection' },
    { icon:'🎁', text:'Сундук дня',           done: state.chest.day === today && state.chest.opened, page:'chest' }
  ];

  const totalDone = steps.filter(s => s.done).length;
  const pct = Math.round((totalDone / steps.length) * 100);

  el.innerHTML =
    '<div class="card primary" style="text-align:center;margin-bottom:14px">' +
      '<div style="font-size:38px;font-weight:900;background:linear-gradient(90deg,var(--accent-1),var(--accent-2));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent">' + pct + '%</div>' +
      '<div class="info-text">Пройдено сегодня</div>' +
      '<div class="progress-bar" style="margin-top:10px">' +
        '<div class="progress-fill" style="width:' + pct + '%"></div>' +
      '</div>' +
    '</div>' +
    steps.map(s =>
      '<div class="card" style="display:flex;gap:12px;align-items:center;padding:12px;' + (s.done ? 'opacity:.65' : '') + '" onclick="switchTab(\'' + s.page + '\')">' +
        '<div style="font-size:24px">' + s.icon + '</div>' +
        '<div style="flex:1;font-size:13.5px;font-weight:700;' + (s.done ? 'text-decoration:line-through' : '') + '">' + s.text + '</div>' +
        (s.done ? '<div style="font-size:20px">✅</div>' : '<div style="font-size:20px;opacity:.3">○</div>') +
      '</div>'
    ).join('');
}

/* ============================================================
   ЭКСПОРТ В WINDOW
   ============================================================ */
window.renderFateCard = renderFateCard;
window.completeFateCard = completeFateCard;
window.renderWheel = renderWheel;
window.spinWheel = spinWheel;
window.renderChest = renderChest;
window.openChest = openChest;
window.renderBoss = renderBoss;
window.hitBoss = hitBoss;
window.renderPet = renderPet;
window.renderPetShop = renderPetShop;
window.buyPet = buyPet;
window.setActivePet = setActivePet;
window.openPetNameModal = openPetNameModal;
window.savePetName = savePetName;
window.renderDomain = renderDomain;
window.buildBuilding = buildBuilding;
window.renderWeekly = renderWeekly;
window.claimWeekly = claimWeekly;
window.renderAchievements = renderAchievements;
window.unlockAchievement = unlockAchievement;
window.renderCollection = renderCollection;
window.unlockCard = unlockCard;
window.closeCardUnlock = closeCardUnlock;
window.renderHeatmap = renderHeatmap;
window.showDayDetail = showDayDetail;
window.renderForecast = renderForecast;
window.renderDailyPath = renderDailyPath;

/* ---------- КОНЕЦ ЧАСТИ 3 ---------- */
console.log('✅ Путь 16 · Часть 3 (игра) загружена');
