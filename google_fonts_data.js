// *** API KEY ***
const API_KEY = 'AIzaSyC941rSK-K3iehOd2osiSv7PPQV6MYl0Ac';

// ── Core State ──
const CATEGORIES = ['serif', 'sans-serif', 'monospace', 'display', 'handwriting'];
let allFonts        = [];
let currentCategory = 'all';
let currentLetter   = '';
let currentSearch   = '';

// ─────────────────────────────────────────────
// Strip style words so "Lora Italic" finds "Lora"
// ─────────────────────────────────────────────
const STYLE_WORDS = ['italic','bold','light','thin','regular','medium',
                     'black','extra','semi','condensed','oblique','variable'];

function cleanQuery(raw) {
  return raw.toLowerCase()
    .split(' ')
    .filter(function(w) { return !STYLE_WORDS.includes(w); })
    .join(' ')
    .trim();
}

// ─────────────────────────────────────────────
// Load a font face into the browser
// ─────────────────────────────────────────────
function loadFontFace(name, url) {
  const style = document.createElement('style');
  style.textContent = '@font-face { font-family: "' + name + '"; src: url("' + url + '"); }';
  document.head.appendChild(style);
}

// ─────────────────────────────────────────────
// Copy static code boxes
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
// Weight label helpers
// ─────────────────────────────────────────────
function getWeightLabel(variant) {
  const map = {
    '100': 'Thin', '200': 'Extra Light', '300': 'Light',
    'regular': 'Regular (400)', '400': 'Regular', '500': 'Medium',
    '600': 'Semi Bold', '700': 'Bold', '800': 'Extra Bold', '900': 'Black'
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
// Clear both static code boxes
// ─────────────────────────────────────────────
function clearCodeBoxes() {
  document.getElementById('static-code-1').textContent = '';
  document.getElementById('static-code-2').textContent = '';
}

// ─────────────────────────────────────────────
// Dropdown suggestions
// ─────────────────────────────────────────────
function showSuggestions(query) {
  const dropdown = document.getElementById('search-dropdown');
  if (!dropdown) return;
  const cleaned = cleanQuery(query);
  if (!cleaned) { hideSuggestions(); return; }

  const matches = allFonts
    .filter(function(f) { return f.family.toLowerCase().includes(cleaned); })
    .slice(0, 8);

  if (matches.length === 0) { hideSuggestions(); return; }

  dropdown.innerHTML = '';
  matches.forEach(function(font) {
    const item = document.createElement('div');
    item.className = 'dropdown-item';
    item.textContent = font.family;
    item.addEventListener('mousedown', function() {
      document.getElementById('font-search').value = font.family;
      currentSearch = font.family;
      currentLetter = '';
      document.querySelectorAll('.az-btn').forEach(function(b) { b.classList.remove('active'); });
      hideSuggestions();
      renderFonts();
    });
    item.addEventListener('touchstart', function(e) {
      e.preventDefault();
      document.getElementById('font-search').value = font.family;
      currentSearch = font.family;
      currentLetter = '';
      document.querySelectorAll('.az-btn').forEach(function(b) { b.classList.remove('active'); });
      hideSuggestions();
      renderFonts();
    });
    dropdown.appendChild(item);
  });
  dropdown.style.display = 'block';
}

function hideSuggestions() {
  const dropdown = document.getElementById('search-dropdown');
  if (dropdown) dropdown.style.display = 'none';
}

// ─────────────────────────────────────────────
// Build A–Z letter row
// ─────────────────────────────────────────────
function buildAZRow() {
  const row = document.getElementById('az-row');
  if (!row) return;
  row.innerHTML = '';
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(function(letter, i) {
    if (i > 0) {
      const dot = document.createElement('span');
      dot.className = 'az-dot';
      dot.textContent = '·';
      row.appendChild(dot);
    }
    const btn = document.createElement('span');
    btn.className = 'az-btn';
    btn.textContent = letter;
    btn.addEventListener('click', function() {
      if (currentLetter === letter) {
        currentLetter = '';
        btn.classList.remove('active');
      } else {
        currentLetter = letter;
        document.querySelectorAll('.az-btn').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
      }
      currentSearch = '';
      document.getElementById('font-search').value = '';
      hideSuggestions();
      renderFonts();
    });
    row.appendChild(btn);
  });
}

// ─────────────────────────────────────────────
// Sync code boxes with current font + state
// ─────────────────────────────────────────────
function syncCodeBoxes(font, variant, state) {
  const weightNum = getWeightNumber(variant);
  const isItalic  = variant.includes('italic') || state.italic;

  const linkCode = '<link href="https://fonts.googleapis.com/css2?family=' +
    font.family.replace(/\s+/g, '+') +
    ':wght@' + weightNum + '&display=swap" rel="stylesheet">';

  let cssCode = "font-family: '" + font.family + "', " + font.category + ';\n' +
                'font-size: '   + state.size   + 'px;\n' +
                'font-weight: ' + state.weight + ';\n' +
                'font-style: '  + (isItalic ? 'italic' : 'normal') + ';\n' +
                'color: '       + state.color  + ';';

  document.getElementById('static-code-1').textContent = linkCode;
  document.getElementById('static-code-2').textContent = cssCode;
}

// ─────────────────────────────────────────────
// Font card expander with toolbar
// ─────────────────────────────────────────────
function toggleVariants(card, font) {
  const existing = card.querySelector('.font-expanded');
  if (existing) {
    existing.remove();
    clearCodeBoxes();
    return;
  }

  const panel = document.createElement('div');
  panel.className = 'font-expanded';

  // ── Per-card state ──
  const state = {
    size:    20,
    weight:  400,
    italic:  false,
    color:   '#ffffff',
    variant: 'regular'
  };

  // ── Step 1 heading ──
  const heading = document.createElement('div');
  heading.className = 'blue-block';
  heading.textContent = '◆ Step 1 : Choose a weight ◆';
  panel.appendChild(heading);

  const tip = document.createElement('p');
  tip.className = 'tip-box';
  tip.textContent = font.family + ' has ' + font.variants.length + ' style' +
    (font.variants.length > 1 ? 's' : '') + '. Tap one to preview.';
  panel.appendChild(tip);

  // ── Variant buttons ──
  const variantWrap = document.createElement('div');
  variantWrap.className = 'variant-row';

  // ── Preview area ──
  const preview = document.createElement('div');
  preview.className = 'font-preview-text';
  preview.textContent = font.family;

  // ── Step 2 heading ──
  const toolHeading = document.createElement('div');
  toolHeading.className = 'blue-block';
  toolHeading.style.marginTop = '12px';
  toolHeading.textContent = '◆ Step 2 : Adjust style ◆';

  // ── Toolbar ──
  const toolbar = document.createElement('div');
  toolbar.className = 'font-preview-tools';

  // Size label + slider
  const sizeLabel = document.createElement('p');
  sizeLabel.textContent = 'Size : ' + state.size + 'px';
  sizeLabel.style.marginBottom = '2px';

  const sizeSlider = document.createElement('input');
  sizeSlider.type  = 'range';
  sizeSlider.min   = 10;
  sizeSlider.max   = 72;
  sizeSlider.value = state.size;

  // Bold / Italic / Color row
  const styleRow = document.createElement('div');
  styleRow.style.display    = 'flex';
  styleRow.style.gap        = '8px';
  styleRow.style.alignItems = 'center';
  styleRow.style.flexWrap   = 'wrap';

  const boldBtn = document.createElement('button');
  boldBtn.textContent = 'B';
  boldBtn.title = 'Toggle Bold';

  const italicBtn = document.createElement('button');
  italicBtn.textContent = 'I';
  italicBtn.style.fontStyle = 'italic';
  italicBtn.title = 'Toggle Italic';

  const colorLabel = document.createElement('span');
  colorLabel.textContent = 'Color :';
  colorLabel.style.color    = 'var(--gold)';
  colorLabel.style.fontSize = '13px';

  const colorPicker = document.createElement('input');
  colorPicker.type  = 'color';
  colorPicker.value = state.color;
  colorPicker.title = 'Pick color';

  styleRow.append(boldBtn, italicBtn, colorLabel, colorPicker);
  toolbar.append(sizeLabel, sizeSlider, styleRow);

  // ── Update preview and code boxes ──
  function updateAll() {
    preview.style.fontSize     = state.size   + 'px';
    preview.style.fontWeight   = state.weight;
    preview.style.fontStyle    = state.italic ? 'italic' : 'normal';
    preview.style.color        = state.color;
    sizeLabel.textContent      = 'Size : ' + state.size + 'px';
    boldBtn.style.background   = state.weight === 700 ? 'var(--gold)' : '';
    boldBtn.style.color        = state.weight === 700 ? '#0a0904'     : '';
    italicBtn.style.background = state.italic ? 'var(--gold)' : '';
    italicBtn.style.color      = state.italic ? '#0a0904'     : '';
    syncCodeBoxes(font, state.variant, state);
  }

  // ── Toolbar events — stopPropagation prevents card from collapsing ──
  sizeSlider.addEventListener('click',  function(e) { e.stopPropagation(); });
  sizeSlider.addEventListener('input',  function(e) {
    e.stopPropagation();
    state.size = parseInt(this.value);
    updateAll();
  });

  boldBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    state.weight = (state.weight === 700) ? 400 : 700;
    updateAll();
  });

  italicBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    state.italic = !state.italic;
    updateAll();
  });

  colorPicker.addEventListener('click', function(e) { e.stopPropagation(); });
  colorPicker.addEventListener('input', function(e) {
    e.stopPropagation();
    state.color = this.value;
    updateAll();
  });

  // ── Build variant buttons ──
  Object.entries(font.files).forEach(function(entry) {
    const variant  = entry[0];
    const fileUrl  = entry[1];
    const safeName = font.family.replace(/\s+/g, '_') + '_' + variant;
    loadFontFace(safeName, fileUrl);

    const btn = document.createElement('button');
    btn.className   = 'variant-btn';
    btn.textContent = getWeightLabel(variant);

    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      variantWrap.querySelectorAll('.variant-btn').forEach(function(b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');
      preview.style.fontFamily = '"' + safeName + '", serif';
      state.variant = variant;
      state.weight  = parseInt(getWeightNumber(variant));
      state.italic  = variant.includes('italic');
      updateAll();
    });

    variantWrap.appendChild(btn);
  });

  // Load first variant automatically
  const firstVariant = Object.keys(font.files)[0];
  const firstUrl     = font.files[firstVariant];
  const firstSafe    = font.family.replace(/\s+/g, '_') + '_' + firstVariant;
  loadFontFace(firstSafe, firstUrl);
  preview.style.fontFamily = '"' + firstSafe + '", serif';
  state.variant = firstVariant;
  state.weight  = parseInt(getWeightNumber(firstVariant));
  state.italic  = firstVariant.includes('italic');
  const firstBtn = variantWrap.querySelector('.variant-btn');
  if (firstBtn) firstBtn.classList.add('active');

  panel.appendChild(variantWrap);
  panel.appendChild(toolHeading);
  panel.appendChild(toolbar);
  panel.appendChild(preview);
  card.appendChild(panel);

  updateAll();
}

// ─────────────────────────────────────────────
// Render font list with all filters applied
// ─────────────────────────────────────────────
function renderFonts(category) {
  if (category !== undefined) {
    currentCategory = category;
    currentLetter   = '';
    currentSearch   = '';
    document.querySelectorAll('.az-btn').forEach(function(b) { b.classList.remove('active'); });
    const searchEl = document.getElementById('font-search');
    if (searchEl) searchEl.value = '';
    hideSuggestions();
  }

  const container = document.getElementById('font-container');
  container.innerHTML = '';

  const cats = currentCategory === 'all' ? CATEGORIES : [currentCategory];

  cats.forEach(function(cat) {
    let fonts = allFonts.filter(function(f) { return f.category === cat; });

    if (currentLetter) {
      fonts = fonts.filter(function(f) {
        return f.family.toUpperCase().startsWith(currentLetter);
      });
    }

    if (currentSearch) {
      const cleaned = cleanQuery(currentSearch);
      fonts = fonts.filter(function(f) {
        return f.family.toLowerCase().includes(cleaned);
      });
    }

    if (currentLetter || currentSearch) {
      fonts.sort(function(a, b) { return a.family.localeCompare(b.family); });
    }

    if (fonts.length === 0) return;

    const catCard = document.createElement('div');
    catCard.className = 'card';
    const catTitle = document.createElement('div');
    catTitle.className = 'blue-block';
    catTitle.textContent = '◆ ' + cat.replace('-', ' ').toUpperCase() + ' (' + fonts.length + ') ◆';
    catCard.appendChild(catTitle);
    container.appendChild(catCard);

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
// Nav button clicks
// ─────────────────────────────────────────────
document.getElementById('font-family-options').addEventListener('click', function(e) {
  if (!e.target.matches('.nav-btn')) return;
  document.querySelectorAll('.nav-btn').forEach(function(b) { b.classList.remove('active'); });
  e.target.classList.add('active');
  renderFonts(e.target.dataset.cat);
});

// ─────────────────────────────────────────────
// Search bar listeners
// ─────────────────────────────────────────────
document.getElementById('font-search').addEventListener('input', function() {
  showSuggestions(this.value);
});

document.getElementById('font-search').addEventListener('keyup', function(e) {
  if (e.key === 'Enter' || e.keyCode === 13) {
    currentSearch = cleanQuery(this.value.trim());
    currentLetter = '';
    document.querySelectorAll('.az-btn').forEach(function(b) { b.classList.remove('active'); });
    hideSuggestions();
    renderFonts();
  }
});

document.getElementById('font-search').addEventListener('blur', function() {
  setTimeout(hideSuggestions, 200);
});

document.getElementById('search-btn').addEventListener('click', function() {
  currentSearch = cleanQuery(document.getElementById('font-search').value.trim());
  currentLetter = '';
  document.querySelectorAll('.az-btn').forEach(function(b) { b.classList.remove('active'); });
  hideSuggestions();
  renderFonts();
});

// ─────────────────────────────────────────────
// Fetch fonts from Google Fonts API
// ─────────────────────────────────────────────
async function loadFonts() {
  const container = document.getElementById('font-container');
  try {
    const url  = 'https://www.googleapis.com/webfonts/v1/webfonts?key=' + API_KEY + '&sort=popularity';
    const res  = await fetch(url);
    if (!res.ok) throw new Error('API error ' + res.status);
    const data = await res.json();
    allFonts   = data.items;
    container.classList.remove('hidden');
    renderFonts('all');
    buildAZRow();
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
