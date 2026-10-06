/* ============================================================
   ПУТЬ 16 · СОТВОРЦОМ
   app-part8-knowledge.js — ЗНАНИЯ (библиотека, знания, здоровье, эзотерика-KB)
   ============================================================ */

'use strict';

/* ============================================================
   1. БИБЛИОТЕКА
   ============================================================ */
let currentBookId = null;

function renderBooks() {
  const el = document.getElementById('booksContainer');
  if (!el) return;

  const read = state.booksRead || [];

  el.innerHTML = BOOKS.map(b => {
    const isRead = read.includes(b.id);
    return '<div class="card" style="padding:14px;cursor:pointer" onclick="openBook(\'' + b.id + '\')">' +
      '<div style="display:flex;gap:12px;align-items:flex-start">' +
        '<div style="font-size:32px;flex-shrink:0">' + (isRead ? '✅' : '📖') + '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:14.5px;font-weight:900;margin-bottom:4px">' + escapeHtml(b.title) + '</div>' +
          '<div style="font-size:11.5px;color:var(--text-soft);font-weight:700;margin-bottom:6px">' + escapeHtml(b.author) + '</div>' +
          '<div style="display:flex;gap:4px;flex-wrap:wrap">' +
            b.tags.map(t => '<span style="font-size:9.5px;font-weight:800;padding:3px 8px;border-radius:999px;background:rgba(79,172,254,.12);color:var(--accent-1)">' + escapeHtml(t) + '</span>').join('') +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function openBook(id) {
  const b = BOOKS.find(x => x.id === id);
  if (!b) return;
  currentBookId = id;

  const titleEl = document.getElementById('bookTitle');
  const authorEl = document.getElementById('bookAuthor');
  const bodyEl = document.getElementById('bookBody');
  if (!titleEl || !bodyEl) return;

  titleEl.textContent = '📖 ' + b.title;
  if (authorEl) authorEl.textContent = b.author;

  const isRead = (state.booksRead || []).includes(id);

  bodyEl.innerHTML =
    '<div class="info-text" style="margin-bottom:16px">' + escapeHtml(b.summary) + '</div>' +
    '<div style="font-size:11px;font-weight:800;color:var(--text-soft);letter-spacing:1.5px;text-transform:uppercase;margin:16px 0 10px">💡 Ключевые советы</div>' +
    b.tips.map(t => '<div style="display:flex;gap:10px;padding:6px 0"><div style="color:var(--green);font-weight:900">✓</div><div style="font-size:13px;font-weight:600">' + escapeHtml(t) + '</div></div>').join('') +
    '<div style="font-size:11px;font-weight:800;color:var(--text-soft);letter-spacing:1.5px;text-transform:uppercase;margin:16px 0 10px">🏷 Теги</div>' +
    b.tags.map(t => '<span style="display:inline-block;font-size:10px;font-weight:800;padding:3px 10px;border-radius:999px;background:rgba(79,172,254,.12);color:var(--accent-1);margin:3px 3px 0 0">' + escapeHtml(t) + '</span>').join('');

  openModal('bookModal');

  /* обновляем кнопку «Отметить прочитанной» */
  const btn = document.querySelector('#bookModal .btn.primary, #bookModal .btn:not(.ghost)');
  if (btn) {
    btn.textContent = isRead ? '✅ Уже прочитано' : '✅ Отметить прочитанной';
    btn.disabled = isRead;
    btn.style.opacity = isRead ? '.5' : '1';
  }
}

function markBookRead() {
  if (!currentBookId) return;
  if ((state.booksRead || []).includes(currentBookId)) return;

  state.booksRead = state.booksRead || [];
  state.booksRead.push(currentBookId);

  const b = BOOKS.find(x => x.id === currentBookId);
  addXP(30, 'Книга прочитана: ' + (b ? b.title : ''));

  saveState();
  closeModal('bookModal');
  renderBooks();
  showToast('📖 Книга отмечена');
  updateHeaderUI();
}

/* ============================================================
   2. БАЗА ЗНАНИЙ
   ============================================================ */
function renderKnowledge(filter) {
  const el = document.getElementById('knowledgeContainer');
  if (!el) return;

  let items = KNOWLEDGE_BASE.slice();
  if (filter) {
    const q = filter.toLowerCase();
    items = items.filter(k =>
      k.title.toLowerCase().includes(q) ||
      k.text.toLowerCase().includes(q) ||
      k.cat.toLowerCase().includes(q)
    );
  }

  if (!items.length) {
    el.innerHTML = '<div class="card"><div class="info-text">Ничего не найдено</div></div>';
    return;
  }

  /* группировка по категориям */
  const byCat = {};
  items.forEach(k => {
    if (!byCat[k.cat]) byCat[k.cat] = [];
    byCat[k.cat].push(k);
  });

  el.innerHTML = Object.keys(byCat).map(cat =>
    '<div style="font-size:11px;font-weight:800;color:var(--text-soft);letter-spacing:1.5px;text-transform:uppercase;margin:16px 0 8px">' + escapeHtml(cat) + '</div>' +
    byCat[cat].map(k =>
      '<div class="card" style="padding:12px;margin-bottom:8px">' +
        '<div style="display:flex;gap:12px;align-items:flex-start">' +
          '<div style="font-size:22px;flex-shrink:0">' + k.icon + '</div>' +
          '<div style="flex:1;min-width:0">' +
            '<div style="font-size:13.5px;font-weight:900;margin-bottom:4px">' + escapeHtml(k.title) + '</div>' +
            '<div style="font-size:12px;color:var(--text-dim);font-weight:600;line-height:1.55">' + escapeHtml(k.text) + '</div>' +
          '</div>' +
        '</div>' +
      '</div>'
    ).join('')
  ).join('');
}

/* ============================================================
   3. ЗДОРОВЬЕ
   ============================================================ */
function renderHealth(filter) {
  const el = document.getElementById('healthContainer');
  if (!el) return;

  let items = HEALTH_BASE.slice();
  if (filter) {
    const q = filter.toLowerCase();
    items = items.filter(h =>
      h.title.toLowerCase().includes(q) ||
      h.text.toLowerCase().includes(q)
    );
  }

  if (!items.length) {
    el.innerHTML = '<div class="card"><div class="info-text">Ничего не найдено</div></div>';
    return;
  }

  el.innerHTML = items.map(h =>
    '<div class="card" style="padding:14px;margin-bottom:8px">' +
      '<div style="display:flex;gap:12px;align-items:flex-start">' +
        '<div style="font-size:28px;flex-shrink:0">' + h.icon + '</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:13.5px;font-weight:900;margin-bottom:4px">' + escapeHtml(h.title) + '</div>' +
          '<div style="font-size:12px;color:var(--text-dim);font-weight:600;line-height:1.55">' + escapeHtml(h.text) + '</div>' +
        '</div>' +
      '</div>' +
    '</div>'
  ).join('');
}

/* ============================================================
   4. БАЗА ЭЗОТЕРИКИ
   ============================================================ */
function renderEsotericKb(filter) {
  const el = document.getElementById('esotericKbContainer');
  if (!el) return;

  let items = ESOTERIC_KB.slice();
  if (filter) {
    const q = filter.toLowerCase();
    items = items.filter(e =>
      e.term.toLowerCase().includes(q) ||
      e.def.toLowerCase().includes(q)
    );
  }

  if (!items.length) {
    el.innerHTML = '<div class="card"><div class="info-text">Ничего не найдено</div></div>';
    return;
  }

  /* сортировка по алфавиту */
  items.sort((a, b) => a.term.localeCompare(b.term, 'ru'));

  el.innerHTML = items.map(e =>
    '<div class="card" style="padding:12px;margin-bottom:8px">' +
      '<div style="font-size:13.5px;font-weight:900;color:var(--accent-1);margin-bottom:4px">' + escapeHtml(e.term) + '</div>' +
      '<div style="font-size:12px;color:var(--text-dim);font-weight:600;line-height:1.55">' + escapeHtml(e.def) + '</div>' +
    '</div>'
  ).join('');
}

/* ============================================================
   5. DEBOUNCED FILTER (универсальный)
   ============================================================ */
function _runFilter(type, value) {
  switch (type) {
    case 'knowledge': renderKnowledge(value); break;
    case 'health':    renderHealth(value); break;
    case 'esoKb':     renderEsotericKb(value); break;
    case 'foodLib':   if (typeof filterFoodLibrary === 'function') filterFoodLibrary(value); break;
    case 'honeyBase': if (typeof filterHoneyBase === 'function') filterHoneyBase(value); break;
  }
}

const _debouncedFilterFn = debounce(function(type, value) {
  _runFilter(type, value);
}, 220);

function debouncedFilter(type, value) {
  _debouncedFilterFn(type, value);
}

/* ---------- СОВМЕСТИМОСТЬ (старый API) ---------- */
function filterKnowledge(q) { renderKnowledge(q); }
function filterHealth(q)    { renderHealth(q); }
function filterEsotericKb(q){ renderEsotericKb(q); }

/* ============================================================
   ЭКСПОРТ В WINDOW
   ============================================================ */
window.renderBooks = renderBooks;
window.openBook = openBook;
window.markBookRead = markBookRead;

window.renderKnowledge = renderKnowledge;
window.renderHealth = renderHealth;
window.renderEsotericKb = renderEsotericKb;

window.debouncedFilter = debouncedFilter;
window.filterKnowledge = filterKnowledge;
window.filterHealth = filterHealth;
window.filterEsotericKb = filterEsotericKb;

/* ---------- КОНЕЦ ЧАСТИ 8 ---------- */
console.log('✅ Путь 16 · Часть 8 (знания) загружена');
