// ── API KEY ──────────────────────────────────────────────────
const API_KEY = 'AIzaSyC941rSK-K3iehOd2osiSv7PPQV6MYl0Ac';
// ── END API KEY ──────────────────────────────────────────────


// ── CORE STATE ───────────────────────────────────────────────
const CATEGORIES = ['serif', 'sans-serif', 'monospace', 'display', 'handwriting'];
let allFonts        = [];
let currentCategory = 'all';
let currentLetter   = '';
let currentSearch   = '';
let selectedFont    = null;   // the font object the user tapped
// ── END CORE STATE ───────────────────────────────────────────


// ── UTILITY : CLEAN SEARCH QUERY ─────────────────────────────
// Strips style words so "Lora Italic" finds "Lora"
const STYLE_WORDS = ['italic','bold','light','thin','regular','medium',
                     'black','extra','semi','condensed','oblique','variable'];

function cleanQuery(raw) {
  return raw.toLowerCase()
    .split(' ')
    .filter(function(w) { return !STYLE_WORDS.includes(w); })
    .join(' ')
    .trim();
}
// ── END UTILITY : CLEAN SEARCH QUERY ─────────────────────────


// ── UTILITY : LOAD FONT FACE ──────────────────────────────────
function loadFontFace(name, url) {
  const style = document.createElement('style');
  style.textContent = '@font-face { font-family: "' + name + '"; src: url("' + url + '"); }';
  document.head.appendChild(style);
}
// ── END UTILITY : LOAD FONT FACE ─────────────────────────────


// ── UTILITY : COPY STATIC CODE BOX ───────────────────────────
// Called by onclick on copy buttons in HTML
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
// ── END UTILITY : COPY STATIC CODE BOX ───────────────────────


// ── UTILITY : WEIGHT NUMBER HELPER ───────────────────────────
function getWeightNumber(variant) {
  if (variant === 'regular' || variant === 'italic') return '400';
  return variant.replace('italic', '').trim();
}
// ── END UTILITY : WEIGHT NUMBER HELPER ───────────────────────


// ── PAGE SECTION 1 : UPDATE ALL PREVIEW BOXES ────────────────
// Updates font-family-preview, font-size-preview,
// font-weight-preview, font-color-preview
// with current font + control values
function updateAllPreviews() {
  const previewText = document.getElementById('font-preview-text').value.trim()
    || (selectedFont ? selectedFont.family : 'Preview');

  const size    = document.getElementById('font-size-control').value + 'px';
  const weight  = document.getElementById('font-weight-control').value;
  const color   = document.getElementById('color-picker').value;
  const isItalic = document.getElementById('italic-toggle').classList.contains('active');
  const fontFamily = selectedFont
    ? '"' + selectedFont.family + '", serif'
    : 'inherit';

  const previews = [
    document.getElementById('font-family-preview'),
    document.getElementById('font-size-preview'),
    document.getElementById('font-weight-preview'),
    document.getElementById('font-color-preview')
  ];

  previews.forEach(function(el) {
    if (!el) return;
    el.textContent       = previewText;
    el.style.fontFamily  = fontFamily;
    el.style.fontSize    = size;
    el.style.fontWeight  = weight;
    el.style.fontStyle   = isItalic ? 'italic' : 'normal';
    el.style.color       = color;
  });

  syncCodeBoxes();
}
// ── END PAGE SECTION 1 : UPDATE ALL PREVIEW BOXES ────────────


// ── PAGE SECTION 2 : SYNC CODE BOXES ─────────────────────────
// Updates static-code-1 (link tag) and static-code-2 (CSS rules)
function syncCodeBoxes() {
  if (!selectedFont) return;

  const weight   = document.getElementById('font-weight-control').value;
  const size     = document.getElementById('font-size-control').value;
  const color    = document.getElementById('color-picker').value;
  const isItalic = document.getElementById('italic-toggle').classList.contains('active');

  const linkCode = '<link href="https://fonts.googleapis.com/css2?family=' +
    selectedFont.family.replace(/\s+/g, '+') +
    ':wght@' + weight + '&display=swap" rel="stylesheet">';

  const cssCode = "font-family: '" + selectedFont.family + "', " + selectedFont.category + ';\n' +
                  'font-size: '    + size   + 'px;\n' +
                  'font-weight: '  + weight + ';\n' +
                  'font-style: '   + (isItalic ? 'italic' : 'normal') + ';\n' +
                  'color: '        + color  + ';';

  const c1 = document.getElementById('static-code-1');
  const c2 = document.getElementById('static-code-2');
  if (c1) c1.textContent = linkCode;
  if (c2) c2.textContent = cssCode;
}
// ── END PAGE SECTION 2 : SYNC CODE BOXES ─────────────────────


// ── PAGE SECTION 3 : SEARCH DROPDOWN ─────────────────────────
// Matches <div id="search-dropdown"> in index.html
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

    function selectFromDropdown() {
      document.getElementById('font-search').value = font.family;
      currentSearch = font.family;
      currentLetter = '';
      document.querySelectorAll('.az-btn').forEach(function(b) { b.classList.remove('active'); });
      hideSuggestions();
      renderFontList();
    }

    item.addEventListener('mousedown', selectFromDropdown);
    item.addEventListener('touchstart', function(e) {
      e.preventDefault();
      selectFromDropdown();
    });
    dropdown.appendChild(item);
  });
  dropdown.style.display = 'block';
}

function hideSuggestions() {
  const dropdown = document.getElementById('search-dropdown');
  if (dropdown) dropdown.style.display = 'none';
}
// ── END PAGE SECTION 3 : SEARCH DROPDOWN ─────────────────────


// ── PAGE SECTION 4 : RENDER FONT LIST ────────────────────────
// Populates font-list with compact inline font names + bullets
// Updates info badges: font-list-category, total, showing
function renderFontList(category) {
  if (category !== undefined) {
    currentCategory = category;
    currentLetter   = '';
    currentSearch   = '';
    document.querySelectorAll('.az-btn').forEach(function(b) { b.classList.remove('active'); });
    const searchEl = document.getElementById('font-search');
    if (searchEl) searchEl.value = '';
    hideSuggestions();
  }

  const list = document.getElementById('font-list');
  if (!list) return;
  list.innerHTML = '';

  const cats = currentCategory === 'all' ? CATEGORIES : [currentCategory];
  let matchedFonts = [];

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

    matchedFonts = matchedFonts.concat(fonts);
  });

  // Update info badges
  const catEl      = document.getElementById('font-list-category');
  const totalEl    = document.getElementById('font-list-total');
  const showingEl  = document.getElementById('font-list-showing');
  if (catEl)     catEl.textContent     = 'Category: ' + (currentCategory === 'all' ? 'All' : currentCategory);
  if (totalEl)   totalEl.textContent   = 'Total: ' + matchedFonts.length;
  if (showingEl) showingEl.textContent = currentLetter
    ? 'Showing: ' + currentLetter
    : currentSearch
      ? 'Showing: "' + currentSearch + '"'
      : 'Showing: A–Z';

  if (matchedFonts.length === 0) {
    const none = document.createElement('span');
    none.className   = 'font-list-name';
    none.textContent = 'No fonts found.';
    list.appendChild(none);
    return;
  }

  // Render font names as inline tappable text with bullet dots
  matchedFonts.forEach(function(font, i) {
    if (i > 0) {
      const dot = document.createElement('span');
      dot.className   = 'font-list-dot';
      dot.textContent = '·';
      list.appendChild(dot);
    }

    const safeName = font.family.replace(/\s+/g, '_') + '_preview';
    loadFontFace(safeName, font.menu);

    const nameSpan = document.createElement('span');
    nameSpan.className       = 'font-list-name';
    nameSpan.textContent     = font.family;
    nameSpan.style.fontFamily = '"' + safeName + '", serif';

    nameSpan.addEventListener('click', function() {
      // Mark active
      document.querySelectorAll('.font-list-name').forEach(function(n) {
        n.classList.remove('active');
      });
      nameSpan.classList.add('active');

      // Set selected font and load first variant
      selectedFont = font;
      const firstVariant = Object.keys(font.files)[0];
      const firstUrl     = font.files[firstVariant];
      const firstSafe    = font.family.replace(/\s+/g, '_') + '_' + firstVariant;
      loadFontFace(firstSafe, firstUrl);

      // Update weight dropdown to match font's first variant
      const weightEl = document.getElementById('font-weight-control');
      if (weightEl) weightEl.value = getWeightNumber(firstVariant);

      updateAllPreviews();
    });

    list.appendChild(nameSpan);
  });
}
// ── END PAGE SECTION 4 : RENDER FONT LIST ────────────────────


// ── PAGE SECTION 5 : NAV BUTTON CLICKS ───────────────────────
// Matches <div id="font-family-options"> in index.html
document.getElementById('font-family-options').addEventListener('click', function(e) {
  if (!e.target.matches('.gold-btn') && !e.target.matches('.gold-btn-active')) return;
  document.querySelectorAll('#font-family-options button').forEach(function(b) {
    b.className = 'gold-btn';
  });
  e.target.className = 'gold-btn-active';
  renderFontList(e.target.dataset.cat);
});
// ── END PAGE SECTION 5 : NAV BUTTON CLICKS ───────────────────


// ── PAGE SECTION 6 : A–Z ROW CLICKS ──────────────────────────
// Matches static <span class="az-btn"> elements in index.html
document.getElementById('az-row').addEventListener('click', function(e) {
  if (!e.target.matches('.az-btn')) return;
  const letter = e.target.dataset.letter;
  if (currentLetter === letter) {
    currentLetter = '';
    e.target.classList.remove('active');
  } else {
    currentLetter = letter;
    document.querySelectorAll('.az-btn').forEach(function(b) { b.classList.remove('active'); });
    e.target.classList.add('active');
  }
  currentSearch = '';
  document.getElementById('font-search').value = '';
  hideSuggestions();
  renderFontList();
});
// ── END PAGE SECTION 6 : A–Z ROW CLICKS ──────────────────────


// ── PAGE SECTION 7 : SEARCH BAR LISTENERS ────────────────────
// Matches <div class="search-bar-container"> in index.html
document.getElementById('font-search').addEventListener('input', function() {
  showSuggestions(this.value);
});

document.getElementById('font-search').addEventListener('keyup', function(e) {
  if (e.key === 'Enter' || e.keyCode === 13) {
    currentSearch = cleanQuery(this.value.trim());
    currentLetter = '';
    document.querySelectorAll('.az-btn').forEach(function(b) { b.classList.remove('active'); });
    hideSuggestions();
    renderFontList();
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
  renderFontList();
});
// ── END PAGE SECTION 7 : SEARCH BAR LISTENERS ────────────────


// ── PAGE SECTION 8 : CONTROLS — SIZE, WEIGHT, COLOR, ITALIC ──
// Matches Step 3, 4, 5 controls in index.html

document.getElementById('font-size-control').addEventListener('change', function() {
  updateAllPreviews();
});

document.getElementById('font-weight-control').addEventListener('change', function() {
  updateAllPreviews();
});

document.getElementById('color-picker').addEventListener('input', function() {
  updateAllPreviews();
});

document.getElementById('italic-toggle').addEventListener('click', function() {
  this.classList.toggle('active');
  updateAllPreviews();
});

// Variant buttons (Step 4 static HTML buttons with data-weight)
document.getElementById('variants').addEventListener('click', function(e) {
  if (!e.target.matches('.gold-btn')) return;
  document.querySelectorAll('#variants .gold-btn').forEach(function(b) {
    b.className = 'gold-btn';
  });
  e.target.className = 'gold-btn-active';
  const weightEl = document.getElementById('font-weight-control');
  if (weightEl) weightEl.value = e.target.dataset.weight;
  updateAllPreviews();
});
// ── END PAGE SECTION 8 : CONTROLS ────────────────────────────


// ── PAGE SECTION 9 : FONT PREVIEW TEXT INPUT ─────────────────
// Matches <input id="font-preview-text"> in index.html
document.getElementById('font-preview-text').addEventListener('input', function() {
  updateAllPreviews();
});
// ── END PAGE SECTION 9 : FONT PREVIEW TEXT INPUT ─────────────


// ── PAGE SECTION 10 : LOAD FONTS FROM API ────────────────────
async function loadFonts() {
  try {
    const url  = 'https://www.googleapis.com/webfonts/v1/webfonts?key=' + API_KEY + '&sort=popularity';
    const res  = await fetch(url);
    if (!res.ok) throw new Error('API error ' + res.status);
    const data = await res.json();
    allFonts   = data.items;
    renderFontList('all');
  } catch (err) {
    const list = document.getElementById('font-list');
    if (list) {
      list.innerHTML = '';
      const errMsg = document.createElement('span');
      errMsg.className   = 'font-list-name';
      errMsg.textContent = 'Could not load fonts. Check your API key.';
      list.appendChild(errMsg);
    }
    console.error(err);
  }
}

loadFonts();
// ── END PAGE SECTION 10 : LOAD FONTS FROM API ────────────────
