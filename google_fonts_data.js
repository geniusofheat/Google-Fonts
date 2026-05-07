// ── API KEY ──────────────────────────────────────────────────
const API_KEY = 'AIzaSyC941rSK-K3iehOd2osiSv7PPQV6MYl0Ac';
// ── END API KEY ──────────────────────────────────────────────


// ── CORE STATE ───────────────────────────────────────────────
const CATEGORIES = ['serif', 'sans-serif', 'monospace', 'display', 'handwriting'];
let allFonts        = [];
let currentCategory = 'all';
let currentSearch   = '';
let selectedFont    = null;
let filteredFonts   = [];
let currentPage     = 0;
const PAGE_SIZE     = 5;

let currentSize   = 20;
let currentWeight = 400;
// ── END CORE STATE ───────────────────────────────────────────


// ── UTILITY : CLEAN SEARCH QUERY ─────────────────────────────
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


// ── UTILITY : COLOR CONVERTERS ───────────────────────────────
function hexToRgb(hex) {
  var r = parseInt(hex.slice(1, 3), 16);
  var g = parseInt(hex.slice(3, 5), 16);
  var b = parseInt(hex.slice(5, 7), 16);
  return { r: r, g: g, b: b };
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

function syncColorDisplays(hex) {
  var rgb = hexToRgb(hex);
  var hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  var hexEl = document.getElementById('color-hex');
  var rgbEl = document.getElementById('color-rgb');
  var hslEl = document.getElementById('color-hsl');
  if (hexEl) hexEl.value = hex;
  if (rgbEl) rgbEl.value = 'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')';
  if (hslEl) hslEl.value = 'hsl(' + hsl.h + ', ' + hsl.s + '%, ' + hsl.l + '%)';
}
// ── END UTILITY : COLOR CONVERTERS ───────────────────────────


// ── PAGE SECTION 1 : UPDATE ALL PREVIEW BOXES ────────────────
function updateAllPreviews() {
  var previewInput = document.getElementById('font-preview-input');
  var previewText  = (previewInput && previewInput.value.trim())
    ? previewInput.value.trim()
    : (selectedFont ? selectedFont.family : 'Preview');

  var color    = document.getElementById('color-picker').value;
  var isItalic = document.getElementById('italic-toggle').classList.contains('active');

  var safeName = selectedFont
    ? selectedFont.family.replace(/\s+/g, '_') + '_preview'
    : null;

  var fontFamily = safeName
    ? '"' + safeName + '", serif'
    : 'inherit';

  var el = document.getElementById('preview-text');
  if (el) {
    el.textContent      = previewText;
    el.style.fontFamily = fontFamily;
    el.style.fontSize   = currentSize + 'px';
    el.style.fontWeight = currentWeight;
    el.style.fontStyle  = isItalic ? 'italic' : 'normal';
    el.style.color      = color;
  }

  syncCodeBoxes();
}
// ── END PAGE SECTION 1 : UPDATE ALL PREVIEW BOXES ────────────


// ── PAGE SECTION 2 : SYNC CODE BOXES ─────────────────────────
function syncCodeBoxes() {
  if (!selectedFont) return;

  var color    = document.getElementById('color-picker').value;
  var isItalic = document.getElementById('italic-toggle').classList.contains('active');

  var linkCode = '<link href="https://fonts.googleapis.com/css2?family=' +
    selectedFont.family.replace(/\s+/g, '+') +
    ':wght@' + currentWeight + '&display=swap" rel="stylesheet">';

  var cssCode = "font-family: '" + selectedFont.family + "', " + selectedFont.category + ';\n' +
                'font-size: '    + currentSize   + 'px;\n' +
                'font-weight: '  + currentWeight + ';\n' +
                'font-style: '   + (isItalic ? 'italic' : 'normal') + ';\n' +
                'color: '        + color + ';';

  var c1 = document.getElementById('static-code-1');
  var c2 = document.getElementById('static-code-2');
  if (c1) c1.textContent = linkCode;
  if (c2) c2.textContent = cssCode;
}
// ── END PAGE SECTION 2 : SYNC CODE BOXES ─────────────────────


// ── PAGE SECTION 3 : SEARCH DROPDOWN ─────────────────────────
function showSuggestions(query) {
  var dropdown = document.getElementById('search-dropdown');
  if (!dropdown) return;
  var cleaned = cleanQuery(query);
  if (!cleaned) { hideSuggestions(); return; }

  var matches = allFonts
    .filter(function(f) { return f.family.toLowerCase().includes(cleaned); })
    .slice(0, 8);

  if (matches.length === 0) { hideSuggestions(); return; }

  dropdown.innerHTML = '';
  matches.forEach(function(font) {
    var item = document.createElement('div');
    item.className   = 'dropdown-item';
    item.textContent = font.family;

    function selectFromDropdown() {
      document.getElementById('font-search').value = font.family;
      currentSearch = font.family;
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
  var dropdown = document.getElementById('search-dropdown');
  if (dropdown) dropdown.style.display = 'none';
}
// ── END PAGE SECTION 3 : SEARCH DROPDOWN ─────────────────────


// ── PAGE SECTION 4 : RENDER PAGE NAV ROW ─────────────────────
function renderPageNav() {
  var nav = document.getElementById('font-page-nav');
  if (!nav) return;
  nav.innerHTML = '';

  var total = filteredFonts.length;
  if (total <= PAGE_SIZE) return;

  var totalPages  = Math.ceil(total / PAGE_SIZE);
  var windowStart = Math.max(0, currentPage - 1);
  var isFirst     = currentPage === 0;

  if (!isFirst) {
    var backBtn = document.createElement('button');
    backBtn.className   = 'gold-btn';
    backBtn.textContent = 'Back';
    backBtn.onclick = function() {
      currentPage -= 1;
      renderPageNav();
      renderFontPage();
    };
    nav.appendChild(backBtn);
  }

  var visibleCount = isFirst ? 4 : 3;
  for (var i = 0; i < visibleCount; i++) {
    var pageIndex = windowStart + i;
    if (pageIndex >= totalPages) break;

    var start = pageIndex * PAGE_SIZE + 1;
    var end   = Math.min((pageIndex + 1) * PAGE_SIZE, total);

    var btn = document.createElement('button');
    btn.className    = pageIndex === currentPage ? 'gold-btn-active' : 'gold-btn';
    btn.textContent  = start + '–' + end;

    (function(pi) {
      btn.onclick = function() {
        currentPage = pi;
        renderPageNav();
        renderFontPage();
      };
    })(pageIndex);

    nav.appendChild(btn);
  }

  if (currentPage < totalPages - 1) {
    var nextBtn = document.createElement('button');
    nextBtn.className   = 'gold-btn';
    nextBtn.textContent = 'Next';
    nextBtn.onclick = function() {
      currentPage += 1;
      renderPageNav();
      renderFontPage();
    };
    nav.appendChild(nextBtn);
  }
}
// ── END PAGE SECTION 4 : RENDER PAGE NAV ROW ─────────────────


// ── PAGE SECTION 5 : RENDER FONT PAGE ────────────────────────
function renderFontPage() {
  var list = document.getElementById('font-family-list');
  if (!list) return;
  list.innerHTML = '';

  var start = currentPage * PAGE_SIZE;
  var end   = Math.min(start + PAGE_SIZE, filteredFonts.length);
  var page  = filteredFonts.slice(start, end);

  if (page.length === 0) {
    var none = document.createElement('p');
    none.textContent = 'No fonts found.';
    list.appendChild(none);
    return;
  }

  var ol = document.createElement('ol');
  ol.className = 'font-names-list';
  ol.start     = start + 1;

  page.forEach(function(font) {
    var safeName    = font.family.replace(/\s+/g, '_') + '_preview';
    var menuVariant = font.files['regular'] || font.files['italic'] || Object.values(font.files)[0];
    loadFontFace(safeName, menuVariant);

    var li = document.createElement('li');
    li.className        = 'font-list-item';
    li.textContent      = font.family;
    li.style.fontFamily = '"' + safeName + '", serif';

    li.addEventListener('click', function() {
      ol.querySelectorAll('.font-list-item').forEach(function(item) {
        item.classList.remove('active');
      });
      li.classList.add('active');
      selectedFont = font;
      updateAllPreviews();
    });

    ol.appendChild(li);
  });

  list.appendChild(ol);
}
// ── END PAGE SECTION 5 : RENDER FONT PAGE ────────────────────


// ── PAGE SECTION 6 : RENDER FONT LIST ────────────────────────
function renderFontList(category) {
  if (category !== undefined) {
    currentCategory = category;
    currentSearch   = '';
    var searchEl    = document.getElementById('font-search');
    if (searchEl) searchEl.value = '';
    hideSuggestions();
  }

  var cats = currentCategory === 'all' ? CATEGORIES : [currentCategory];
  filteredFonts = [];

  cats.forEach(function(cat) {
    var fonts = allFonts.filter(function(f) { return f.category === cat; });

    if (currentSearch) {
      var cleaned = cleanQuery(currentSearch);
      fonts = fonts.filter(function(f) {
        return f.family.toLowerCase().startsWith(cleaned);
      });
    }

    fonts.sort(function(a, b) { return a.family.localeCompare(b.family); });
    filteredFonts = filteredFonts.concat(fonts);
  });

  filteredFonts.sort(function(a, b) { return a.family.localeCompare(b.family); });

  var totalEl   = document.getElementById('font-list-total');
  var showingEl = document.getElementById('font-list-showing');

  if (totalEl)   totalEl.textContent   = 'Total: ' + filteredFonts.length;
  if (showingEl) showingEl.textContent = 'Showing: 1–' + Math.min(PAGE_SIZE, filteredFonts.length);

  currentPage = 0;
  renderPageNav();
  renderFontPage();
}
// ── END PAGE SECTION 6 : RENDER FONT LIST ────────────────────


// ── PAGE SECTION 7 : NAV BUTTON CLICKS ───────────────────────
document.getElementById('font-family-options').addEventListener('click', function(e) {
  if (!e.target.matches('.gold-btn') && !e.target.matches('.gold-btn-active')) return;
  document.querySelectorAll('#font-family-options button').forEach(function(b) {
    b.className = 'gold-btn';
  });
  e.target.className = 'gold-btn-active';
  renderFontList(e.target.dataset.cat);
});
// ── END PAGE SECTION 7 : NAV BUTTON CLICKS ───────────────────


// ── PAGE SECTION 8 : A–Z ROW CLICKS ──────────────────────────
document.getElementById('az-row').addEventListener('click', function(e) {
  if (!e.target.matches('.az-btn')) return;
  var letter = e.target.dataset.letter;

  if (currentSearch === letter) {
    currentSearch = '';
    e.target.classList.remove('active');
  } else {
    currentSearch = letter;
    document.querySelectorAll('.az-btn').forEach(function(b) { b.classList.remove('active'); });
    e.target.classList.add('active');
  }

  document.getElementById('font-search').value = '';
  hideSuggestions();
  renderFontList();
});
// ── END PAGE SECTION 8 : A–Z ROW CLICKS ──────────────────────


// ── PAGE SECTION 9 : SEARCH BAR LISTENERS ────────────────────
document.getElementById('font-search').addEventListener('input', function() {
  showSuggestions(this.value);
});

document.getElementById('font-search').addEventListener('keyup', function(e) {
  if (e.key === 'Enter' || e.keyCode === 13) {
    currentSearch = cleanQuery(this.value.trim());
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
  document.querySelectorAll('.az-btn').forEach(function(b) { b.classList.remove('active'); });
  hideSuggestions();
  renderFontList();
});
// ── END PAGE SECTION 9 : SEARCH BAR LISTENERS ────────────────


// ── PAGE SECTION 10 : COLOR AND ITALIC CONTROLS ──────────────
document.getElementById('color-picker').addEventListener('input', function() {
  syncColorDisplays(this.value);
  updateAllPreviews();
});

document.getElementById('italic-toggle').addEventListener('click', function() {
  this.classList.toggle('active');
  updateAllPreviews();
});

// Initialize color displays on load
syncColorDisplays(document.getElementById('color-picker').value);
// ── END PAGE SECTION 10 : COLOR AND ITALIC CONTROLS ──────────


// ── PAGE SECTION 11 : FONT PREVIEW INPUT ─────────────────────
document.getElementById('font-preview-input').addEventListener('input', function() {
  var preview = document.getElementById('preview-text');
  var value   = this.value.trim();
  if (preview) preview.textContent = value || 'Your text will appear here';
  updateAllPreviews();
});
// ── END PAGE SECTION 11 : FONT PREVIEW INPUT ─────────────────


// ── PAGE SECTION 12 : FONT SIZE SLIDER ───────────────────────
document.getElementById('font-size-slider').addEventListener('input', function() {
  currentSize = parseInt(this.value);
  document.getElementById('font-size-label').textContent = 'Size: ' + currentSize + 'px';
  updateAllPreviews();
});
// ── END PAGE SECTION 12 : FONT SIZE SLIDER ───────────────────


// ── PAGE SECTION 13 : LOAD FONTS FROM API ────────────────────
async function loadFonts() {
  try {
    var url  = 'https://www.googleapis.com/webfonts/v1/webfonts?key=' + API_KEY + '&sort=popularity';
    var res  = await fetch(url);
    if (!res.ok) throw new Error('API error ' + res.status);
    var data = await res.json();
    allFonts = data.items;
    renderFontList('all');
  } catch (err) {
    var list = document.getElementById('font-family-list');
    if (list) {
      list.innerHTML = '';
      var errMsg = document.createElement('p');
      errMsg.textContent = 'Could not load fonts. Check your API key.';
      list.appendChild(errMsg);
    }
    console.error(err);
  }
}

loadFonts();
// ── END PAGE SECTION 13 : LOAD FONTS FROM API ────────────────
