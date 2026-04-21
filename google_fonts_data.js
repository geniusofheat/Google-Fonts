// *** PASTE YOUR API KEY HERE ***
const API_KEY = 'AIzaSyC941rSK-K3iehOd2osiSv7PPQV6MYl0Ac';

// ── Core State ──
const CATEGORIES = ['serif', 'sans-serif', 'monospace', 'display', 'handwriting'];
let allFonts = [];
let currentCategory = 'all';
let currentLetter = '';
let currentSearch = '';

// ── Global Export Target (Code Box #2) ──
const codeBox2 = document.getElementById('static-code-2');

// ─────────────────────────────────────────────
// Utility: clean search
// ─────────────────────────────────────────────
const STYLE_WORDS = ['italic','bold','light','thin','regular','medium','black','extra','semi','condensed','oblique','variable'];

function cleanQuery(raw) {
  return raw.toLowerCase()
    .split(' ')
    .filter(w => !STYLE_WORDS.includes(w))
    .join(' ')
    .trim();
}

// ─────────────────────────────────────────────
// Load font
// ─────────────────────────────────────────────
function loadFontFace(name, url) {
  const style = document.createElement('style');
  style.textContent = `@font-face { font-family:"${name}"; src:url("${url}"); }`;
  document.head.appendChild(style);
}

// ─────────────────────────────────────────────
// Copy static code boxes
// ─────────────────────────────────────────────
function copyStatic(codeId, btnId) {
  const code = document.getElementById(codeId).textContent.trim();
  const btn = document.getElementById(btnId);

  navigator.clipboard.writeText(code).then(() => {
    btn.textContent = '✓ Copied';
    setTimeout(() => btn.textContent = '📋 Copy', 2000);
  }).catch(() => {
    btn.textContent = 'Failed';
    setTimeout(() => btn.textContent = '📋 Copy', 2000);
  });
}

// ─────────────────────────────────────────────
// AZ row
// ─────────────────────────────────────────────
function buildAZRow() {
  const row = document.getElementById('az-row');
  if (!row) return;

  row.innerHTML = '';

  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(letter => {
    const btn = document.createElement('span');
    btn.className = 'az-btn';
    btn.textContent = letter;

    btn.addEventListener('click', () => {
      currentLetter = (currentLetter === letter) ? '' : letter;
      document.querySelectorAll('.az-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderFonts();
    });

    row.appendChild(btn);
  });
}

// ─────────────────────────────────────────────
// EXPORT BUILDER (Code Box #2)
// ─────────────────────────────────────────────
function buildCSS(state, font) {
  return `
font-family: "${font.family}", serif;
font-size: ${state.size}px;
font-weight: ${state.weight};
font-style: ${state.italic ? 'italic' : 'normal'};
color: ${state.color};
`.trim();
}

function syncExport(state, font) {
  if (!codeBox2) return;
  codeBox2.textContent = buildCSS(state, font);
}

// ─────────────────────────────────────────────
// FONT CARD EXPANDER
// ─────────────────────────────────────────────
function toggleVariants(card, font) {
  const existing = card.querySelector('.font-expanded');
  if (existing) {
    existing.remove();
    return;
  }

  const panel = document.createElement('div');
  panel.className = 'font-expanded';

  // ── LOCAL STATE PER FONT CARD
  const state = {
    size: 16,
    weight: 400,
    italic: false,
    color: '#000000',
    family: font.family
  };

  // ── TOOLBAR
  const toolbar = document.createElement('div');
  toolbar.className = 'toolbar';

  const size = document.createElement('input');
  size.type = 'range';
  size.min = 8;
  size.max = 20;
  size.value = state.size;

  const bold = document.createElement('button');
  bold.textContent = 'Bold';

  const italic = document.createElement('button');
  italic.textContent = 'Italic';

  const color = document.createElement('input');
  color.type = 'color';

  toolbar.append(size, bold, italic, color);

  // ── PREVIEW
  const preview = document.createElement('div');
  preview.textContent = font.family;
  preview.style.marginTop = '10px';

  function updatePreview() {
    preview.style.fontSize = state.size + 'px';
    preview.style.fontWeight = state.weight;
    preview.style.fontStyle = state.italic ? 'italic' : 'normal';
    preview.style.color = state.color;
  }

  function updateAll() {
    updatePreview();
    syncExport(state, font);
  }

  // ── EVENTS
  size.addEventListener('input', e => {
    state.size = e.target.value;
    updateAll();
  });

  bold.addEventListener('click', () => {
    state.weight = (state.weight === 700) ? 400 : 700;
    updateAll();
  });

  italic.addEventListener('click', () => {
    state.italic = !state.italic;
    updateAll();
  });

  color.addEventListener('input', e => {
    state.color = e.target.value;
    updateAll();
  });

  // ── FONT VARIANTS
  Object.entries(font.files).forEach(([variant, url]) => {
    const safeName = font.family.replace(/\s+/g, '_') + '_' + variant;
    loadFontFace(safeName, url);

    const btn = document.createElement('button');
    btn.textContent = variant;

    btn.addEventListener('click', () => {
      preview.style.fontFamily = `"${safeName}", serif`;
      state.family = font.family;
      updateAll();
    });

    panel.appendChild(btn);
  });

  panel.appendChild(toolbar);
  panel.appendChild(preview);

  card.appendChild(panel);

  updateAll();
}

// ─────────────────────────────────────────────
// Render fonts
// ─────────────────────────────────────────────
function renderFonts() {
  const container = document.getElementById('font-container');
  container.innerHTML = '';

  allFonts.forEach(font => {
    const card = document.createElement('div');
    card.className = 'card';

    const title = document.createElement('h4');
    title.textContent = font.family;

    card.appendChild(title);

    card.addEventListener('click', () => {
      toggleVariants(card, font);
    });

    container.appendChild(card);
  });
}

// ─────────────────────────────────────────────
// Load fonts
// ─────────────────────────────────────────────
async function loadFonts() {
  const res = await fetch(
    `https://www.googleapis.com/webfonts/v1/webfonts?key=${API_KEY}&sort=popularity`
  );

  const data = await res.json();
  allFonts = data.items;

  renderFonts();
  buildAZRow();
}

loadFonts();