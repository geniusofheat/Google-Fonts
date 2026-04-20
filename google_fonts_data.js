// *** PASTE YOUR API KEY HERE ***
const API_KEY = 'AIzaSyC941rSK-K3iehOd2osiSv7PPQV6MYl0Ac';

// ── Font categories ──
const CATEGORIES = ['serif', 'sans-serif', 'monospace', 'display', 'handwriting'];
let allFonts = [];

// ── Code boxes start empty and clear back to empty on collapse ──
const DEFAULT_CODE_1 = '';
const DEFAULT_CODE_2 = '';

// ─────────────────────────────────────────────
// Load a font face into the browser
// ─────────────────────────────────────────────
function loadFontFace(safeName, url) {
  const style = document.createElement('style');
  style.textContent = '@font-face { font-family: "' + safeName + '"; src: url("' + url + '"); }';
  document.head.appendChild(style);
}

// ─────────────────────────────────────────────
// Copy the text from a static code box
// ─────────────────────────────────────────────
function copyStatic(codeId, btnId) {
  const code = document.getElementById(codeId).textContent.trim();
  const btn  = document.getElementById(btnId);
  if (!code) return;
  navigator.clipboard.writeText(code).then(function() {
    btn.textContent = '✓ Copied';
    setTimeout(function() { btn.textContent = '📋 Copy'; }, 2000);
  }).catch(function() {
    btn.textContent = 'Failed';
    setTimeout(function() { btn.textContent = '📋 Copy'; }, 2000);
  });
}

// ─────────────────────────────────────────────
// Weight label map
// ─────────────────────────────────────────────
function getWeightLabel(variant) {
  const map = {
    '100':     'Thin',
    '200':     'Extra Light',
    '300':     'Light',
    'regular': 'Regular (400)',
    '400':     'Regular',
    '500':     'Medium',
    '600':     'Semi Bold',
    '700':     'Bold',
    '800':     'Extra Bold',
    '900':     'Black'
  };
  const base     = variant.replace('italic', '').trim() || 'regular';
  const isItalic = variant.includes('italic');
  return (map[base] || base) + (isItalic ? ' Italic' : '');
}

function getWeightNumber(variant) {
  if (variant === 'regular' || variant === 'italic') return '400';
  return variant.replace('italic', '').trim();
}

// ─────────────────────────────────────────────
// Toggle expanded weight panel on a font card
// ─────────────────────────────────────────────
function toggleVariants(card, font) {
  const existing = card.querySelector('.font-expanded');

  // Collapsing — remove panel and clear both code boxes
  if (existing) {
    existing.remove();
    document.getElementById('static-code-1').textContent = DEFAULT_CODE_1;
    document.getElementById('static-code-2').textContent = DEFAULT_CODE_2;
    return;
  }

  // Expanding — build the weight list panel
  const panel = document.createElement('div');
  panel.className = 'font-expanded';

  // Heading
  const heading = document.createElement('div');
  heading.className = 'blue-block';
  heading.textContent = '◆ Step 1 : Tap a weight ◆';
  panel.appendChild(heading);

  // Tip
  const tip = document.createElement('p');
  tip.className = 'tip-box';
  tip.textContent = font.family + ' has ' + font.variants.length + ' style' +
    (font.variants.length > 1 ? 's' : '') + '. Tap one to fill in both code boxes.';
  panel.appendChild(tip);

  // One row per weight variant
  Object.entries(font.files).forEach(function(entry) {
    const variant     = entry[0];
    const fileUrl     = entry[1];
    const safeName    = font.family.replace(/\s+/g, '_') + '_' + variant;
    const weightNum   = getWeightNumber(variant);
    const weightLabel = getWeightLabel(variant);
    const isItalic    = variant.includes('italic');

    loadFontFace(safeName, fileUrl);

    const row = document.createElement('div');
    row.className = 'card';

    const label = document.createElement('h4');
    label.textContent = weightLabel;

    const sample = document.createElement('p');
    sample.style.fontFamily  = '"' + safeName + '", serif';
    sample.style.fontSize    = '1.15rem';
    sample.style.fontWeight  = weightNum;
    sample.style.fontStyle   = isItalic ? 'italic' : 'normal';
    sample.textContent       = font.family;

    row.appendChild(label);
    row.appendChild(sample);

    row.addEventListener('click', function(e) {
      e.stopPropagation();

      // Fill code box 1 — HTML link tag
      document.getElementById('static-code-1').textContent =
        '<link href="https://fonts.googleapis.com/css2?family=' +
        font.family.replace(/\s+/g, '+') + '&display=swap" rel="stylesheet">';

      // Fill code box 2 — CSS rules
      let css = "font-family: '" + font.family + "', " + font.category + ';\n' +
                'font-weight: ' + weightNum + ';';
      if (isItalic) css += '\nfont-style: italic;';
      document.getElementById('static-code-2').textContent = css;

      // Highlight the selected row, clear others
      panel.querySelectorAll('.card').forEach(function(r) {
        r.style.borderColor = '';
      });
      row.style.borderColor = 'var(--gold)';
    });

    panel.appendChild(row);
  });

  card.appendChild(panel);
}

// ─────────────────────────────────────────────
// Render the font list for a given category
// ─────────────────────────────────────────────
function renderFonts(category) {
  const container = document.getElementById('font-container');
  container.innerHTML = '';

  const cats = category === 'all' ? CATEGORIES : [category];

  cats.forEach(function(cat) {
    const fonts = allFonts.filter(function(f) { return f.category === cat; });
    if (fonts.length === 0) return;

    // Category heading
    const catCard = document.createElement('div');
    catCard.className = 'card';

    const catTitle = document.createElement('div');
    catTitle.className = 'blue-block';
    catTitle.textContent = '◆ ' + cat.replace('-', ' ').toUpperCase() + ' (' + fonts.length + ') ◆';
    catCard.appendChild(catTitle);
    container.appendChild(catCard);

    // Font cards
    fonts.forEach(function(font) {
      const card = document.createElement('div');
      card.className = 'card';

      const safeName = font.family.replace(/\s+/g, '_') + '_preview';
      loadFontFace(safeName, font.menu);

      const nameEl = document.createElement('h4');
      nameEl.style.fontFamily = '"' + safeName + '", serif';
      nameEl.textContent = font.family;

      const meta = document.createElement('p');
      meta.textContent = font.variants.length + ' style' +
        (font.variants.length > 1 ? 's' : '') + ' — tap to expand';

      card.appendChild(nameEl);
      card.appendChild(meta);

      card.addEventListener('click', function() {
        toggleVariants(card, font);
      });

      container.appendChild(card);
    });
  });
}

// ─────────────────────────────────────────────
// Nav button filter clicks
// ─────────────────────────────────────────────
document.getElementById('font-family-options').addEventListener('click', function(e) {
  if (!e.target.matches('.nav-btn')) return;
  document.querySelectorAll('.nav-btn').forEach(function(b) {
    b.classList.remove('active');
  });
  e.target.classList.add('active');
  renderFonts(e.target.dataset.cat);
});

// ─────────────────────────────────────────────
// Fetch fonts from Google Fonts API
// ─────────────────────────────────────────────
async function loadFonts() {
  const container = document.getElementById('font-container');
  try {
    const url = 'https://www.googleapis.com/webfonts/v1/webfonts?key=' + API_KEY + '&sort=popularity';
    const res  = await fetch(url);
    if (!res.ok) throw new Error('API error ' + res.status);
    const data = await res.json();
    allFonts   = data.items;
    container.classList.remove('hidden');
    renderFonts('all');
  } catch (err) {
    container.classList.remove('hidden');
    const errCard = document.createElement('div');
    errCard.className = 'card';
    const errMsg = document.createElement('p');
    errMsg.className = 'tip-box';
    errMsg.textContent = 'Could not load fonts. Make sure your API key is set correctly.';
    errCard.appendChild(errMsg);
    container.appendChild(errCard);
    console.error(err);
  }
}

loadFonts();
