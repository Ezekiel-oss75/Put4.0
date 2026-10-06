/* ============================================================
   ПУТЬ 16 · СОТВОРЦОМ
   app-part10-init.js — ФРАКТАЛ + INIT (запуск приложения)
   ============================================================ */

'use strict';

/* ============================================================
   1. ФРАКТАЛ НА CANVAS
   ============================================================ */
let fractalCtx = null;
let fractalRAF = null;
let fractalZoom = 1;
let fractalOffset = { x: -0.5, y: 0 };
let fractalColorShift = 0;
let fractalType = 'mandelbrot';

function startFractal() {
  if (state.settings.batterySaver) return;

  const canvas = document.getElementById('fractalCanvas');
  if (!canvas) return;

  fractalType = state.settings.fractal || 'mandelbrot';

  /* адаптивный размер */
  const w = Math.min(window.innerWidth, 800);
  const h = window.innerHeight;
  canvas.width = w;
  canvas.height = h;

  fractalCtx = canvas.getContext('2d');

  fractalZoom = 1;
  fractalOffset = { x: -0.5, y: 0 };
  fractalColorShift = 0;

  drawFractal();
  animateFractal();
}

function restartFractal(type) {
  fractalType = type || state.settings.fractal || 'mandelbrot';
  fractalZoom = 1;
  fractalOffset = { x: -0.5, y: 0 };
  drawFractal();
}

function drawFractal() {
  if (!fractalCtx) return;
  const canvas = fractalCtx.canvas;
  const W = canvas.width;
  const H = canvas.height;

  const imgData = fractalCtx.createImageData(W, H);
  const data = imgData.data;

  const maxIter = state.settings.reducedMotion ? 30 : 60;
  const scale = 3 / fractalZoom;

  for (let py = 0; py < H; py += 1) {
    for (let px = 0; px < W; px += 1) {
      const x0 = (px / W - 0.5) * scale + fractalOffset.x;
      const y0 = (py / H - 0.5) * scale + fractalOffset.y;

      let x = 0, y = 0;
      let iter = 0;

      if (fractalType === 'julia') {
        x = x0;
        y = y0;
        const cx = -0.7 + 0.27 * Math.cos(fractalColorShift * 0.5);
        const cy = 0.27 * Math.sin(fractalColorShift * 0.5);
        while (x * x + y * y <= 4 && iter < maxIter) {
          const xt = x * x - y * y + cx;
          y = 2 * x * y + cy;
          x = xt;
          iter++;
        }
      } else if (fractalType === 'burning') {
        x = 0; y = 0;
        while (x * x + y * y <= 4 && iter < maxIter) {
          const xt = x * x - y * y + x0;
          y = Math.abs(2 * x * y) + y0;
          x = xt;
          iter++;
        }
      } else if (fractalType === 'tricorn') {
        x = 0; y = 0;
        while (x * x + y * y <= 4 && iter < maxIter) {
          const xt = x * x - y * y + x0;
          y = -2 * x * y + y0;
          x = xt;
          iter++;
        }
      } else {
        /* mandelbrot */
        x = 0; y = 0;
        while (x * x + y * y <= 4 && iter < maxIter) {
          const xt = x * x - y * y + x0;
          y = 2 * x * y + y0;
          x = xt;
          iter++;
        }
      }

      const idx = (py * W + px) * 4;

      if (iter === maxIter) {
        data[idx] = 0;
        data[idx + 1] = 0;
        data[idx + 2] = 0;
        data[idx + 3] = 0;
      } else {
        /* HSV-подобная окраска через сдвиг */
        const t = iter / maxIter;
        const hue = (t * 360 + fractalColorShift * 40) % 360;

        const rgb = hsvToRgb(hue, 0.65, 0.35 + t * 0.4);
        data[idx] = rgb[0];
        data[idx + 1] = rgb[1];
        data[idx + 2] = rgb[2];
        data[idx + 3] = 255;
      }
    }
  }

  fractalCtx.putImageData(imgData, 0, 0);
}

function animateFractal() {
  if (state.settings.batterySaver) return;
  if (state.settings.reducedMotion) return;

  const start = performance.now();
  let frame = 0;

  function loop(now) {
    if (state.settings.batterySaver) return;

    fractalRAF = requestAnimationFrame(loop);

    /* перерисовываем раз в ~4 секунды для плавности и экономии */
    if (now - start > 4000 + frame * 4000) {
      frame++;
      fractalColorShift += 0.15;
      drawFractal();
    }
  }

  fractalRAF = requestAnimationFrame(loop);
}

function hsvToRgb(h, s, v) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r, g, b;

  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
}

/* ============================================================
   2. INIT ПРИЛОЖЕНИЯ
   ============================================================ */
function hideLoading() {
  const el = document.getElementById('loading');
  if (!el) return;
  el.classList.add('hide');
  setTimeout(() => {
    el.style.display = 'none';
  }, 500);
}

function showApp() {
  const app = document.getElementById('appRoot');
  if (app) app.style.display = 'block';
}

function initApp() {
  /* 1. загрузка state */
  loadState();

  /* 2. настройки: тема / сезон / reduced motion / battery saver */
  applyTheme(state.settings.theme || 'cosmos');
  applySeasonal();
  document.body.classList.toggle('reduced-motion', state.settings.reducedMotion);
  applyBatterySaver();

  /* 3. таймеры автосейва */
  startAutosave();

  /* 4. первый рендер */
  updateHeaderUI();
  renderSubTabs('game');
  renderPage('card');

  /* 5. фрактал */
  startFractal();

  /* 6. показ приложения */
  showApp();

  /* 7. скрыть лоадер */
  setTimeout(hideLoading, 400);

  /* 8. автопроверки достижений при старте */
  checkStartupAchievements();

  /* 9. показать приветствие, если новый пользователь */
  setTimeout(() => {
    if (!state.profile.name && !state.profile.birth) {
      showToast('👋 Добро пожаловать в Путь 16!');
      setTimeout(() => {
        showToast('👤 Заполни профиль во вкладке «Ещё»');
      }, 2500);
    }
  }, 1200);
}

function checkStartupAchievements() {
  if (typeof unlockAchievement !== 'function') return;

  if (state.totalPractices >= 1) unlockAchievement('a_first');
  if (state.totalPractices >= 100) unlockAchievement('a_100prac');
  if (state.totalPractices >= 500) unlockAchievement('a_500prac');
  if (state.streak >= 7) unlockAchievement('a_week');
  if (state.streak >= 30) unlockAchievement('a_month');
  if (state.streak >= 100) unlockAchievement('a_100d');
  if (state.level >= 10) unlockAchievement('a_10lvl');
  if (state.level >= 25) unlockAchievement('a_25lvl');
  if (state.level >= 50) unlockAchievement('a_50lvl');
  if (state.xpEarned >= 1000) unlockAchievement('a_1000xp');
  if (state.xpEarned >= 10000) unlockAchievement('a_10000xp');
}

/* ============================================================
   3. ОБРАБОТЧИКИ СОБЫТИЙ
   ============================================================ */
function setupEventListeners() {

  /* сохранение при уходе со страницы */
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      saveState();
    }
  });

  /* сохранение при закрытии */
  window.addEventListener('beforeunload', () => {
    saveState();
  });

  /* сохранение при потере фокуса */
  window.addEventListener('blur', () => {
    saveState();
  });

  /* пересчёт фрактала при resize (debounced) */
  const debouncedResize = debounce(() => {
    if (!state.settings.batterySaver) {
      startFractal();
    }
  }, 500);
  window.addEventListener('resize', debouncedResize);
  window.addEventListener('orientationchange', debouncedResize);

  /* обработка горячих клавиш */
  document.addEventListener('keydown', (e) => {
    /* Ctrl/Cmd + K — поиск */
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      openGlobalSearch();
    }
    /* Escape — закрыть поиск */
    if (e.key === 'Escape') {
      const search = document.getElementById('globalSearchOverlay');
      if (search && search.classList.contains('show')) {
        closeGlobalSearch();
      }
    }
  });

  /* клик по фону поиска */
  document.getElementById('globalSearchOverlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'globalSearchOverlay') closeGlobalSearch();
  });

  /* автообновление квестов при смене дня */
  setInterval(() => {
    const today = getToday();
    if (state.quests.day !== today) {
      /* новый день — сброс дневных флагов */
      if (state.wheel.day !== today) state.wheel = { day: '', spun: false };
      if (state.chest.day !== today) state.chest = { day: '', opened: false };
      if (state.fateCard.day !== today) state.fateCard = { day: '', id: '' };
      if (state.rune.day !== todayона) state.rune = { day:
 '', id: '' };
     - if (state.stone.day !== today) От state.stone = { day: '', name: '' };
      if (state.affirmation.day !== today) state.affirmation = { day: '', text: '' };
      if (state.mantra.day !== today) state.mantra = { day: '', text: '' };
      if (state.quote.day !== today) state.quote = { day: '', text: '' };
      saveState();
      if (typeof renderAll === 'function') renderAll();
      showToast('🌅 Новый день начался!');
    }
  }, 60000); /* раз в минуту */

  /* обновление босса по неделям */
  setInterval(() => {
    const week = getWeekKey();
    if (state.currentBoss && state.currentBoss.week !== week) {
      state.currentBoss = { week:'', id:'', hp:0, maxHp:0, defeated:false };
      saveState();
    }
  }, 3600000); /* раз в час */

  /* обработка ошибок */
  window.addEventListener('error', (e) => {
    console.error('Ошибка приложения:', e.message, e.filename, e.lineno);
  });

  window.addEventListener('unhandledrejection', (e) => {
    console.error('Необработанный Promise:', e.reason);
  });
}

/* ============================================================
   4. PWA INSTALL PROMPT (заглушка — можно расширить)
   ============================================================ */
let deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  /* при желании можно показать кнопку «Установить приложение» */
});

/* ============================================================
   5. ЗАПУСК
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  try {
    initApp();
    setupEventListeners();
    console.log('🚀 Путь 16 · приложение запущено');
  } catch (e) {
    console.error('Ошибка запуска:', e);
    /* аварийный показ */
    showApp();
    hideLoading();
  }
});

/* ============================================================
   6. ЭКСПОРТ
   ============================================================ */
window.startFractal = startFractal;
window.restartFractal = restartFractal;

/* ---------- КОНЕЦ ЧАСТИ 10 ---------- */
console.log('✅ Путь 16 · Часть 10 (фрактал + init) загружена');
