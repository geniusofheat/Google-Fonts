// ── API KEY ──────────────────────────────────────────────────
const API_KEY = 'AIzaSyC941rSK-K3iehOd2osiSv7PPQV6MYl0Ac';
// ── END API KEY ──────────────────────────────────────────────


// ── CORE STATE ───────────────────────────────────────────────
const CATEGORIES = ['serif', 'sans-serif', 'monospace', 'display', 'handwriting'];
let allFonts      = [];
let currentCategory = 'all';
let currentSearch   = '';
let selectedFont    = null;
let filteredFonts   = [];
let currentPage     = 0;
const PAGE_SIZE     = 5;
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


// ── PAGE SECTION 1 : UPDATE ALL PREVIEW BOXES ────────────────
function updateAllPreviews() {
  const previewText = document.getElementById('font-preview-input').value.trim()
  || (selectedFont ? selectedFont.family : 'Preview');

  const size     = document.getElementById('font-size-control').value + 'px';
  const weight   = document.getElementById('font-weight-control').value;
  const color    = document.getElementById('color-picker').value;
  const isItalic = document.getElementById('italic-toggle').classList.contains('active');
  const fontFamily = selectedFont ? '"' + selectedFont.family + '", serif' : 'inherit';

  const previews = [
    document.getElementById('font-preview-output'),
    document.getElementById('font-size-preview'),
    document.getElementById('font-weight-preview'),
    document.getElementById('font-color-preview')
  ];

  previews.forEach(function(el) {
    if (!el) return;
    el.textContent      = previewText;
    el.style.fontFamily = fontFamily;
    el.style.fontSize   = size;
    el.style.fontWeight = weight;
    el.style.fontStyle  = isItalic ? 'italic' : 'normal';
    el.style.color      = color;
  });

  syncCodeBoxes();
}
// ── END PAGE SECTION 1 : UPDATE ALL PREVIEW BOXES ────────────


// ── PAGE SECTION 2 : SYNC CODE BOXES ─────────────────────────
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
  const dropdown = document.getElementById('search-dropdown');
  if (dropdown) dropdown.style.display = 'none';
}
// ── END PAGE SECTION 3 : SEARCH DROPDOWN ─────────────────────


// ── PAGE SECTION 4 : RENDER PAGE NAV ROW ─────────────────────
// Builds [ 1–5 ] [ 6–10 ] [ 11–15 ] buttons above font list

function renderPageNav() {
  const nav = document.getElementById('font-page-nav');
  if (!nav) return;
  nav.innerHTML = '';

  const total = filteredFonts.length;
  if (total <= PAGE_SIZE) return;

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Sliding window based on current page
  const windowStart = Math.max(0, currentPage - 1);

  const isFirst = currentPage === 0;

  // ── BACK BUTTON ──
  if (!isFirst) {
    const backBtn = document.createElement('button');
    backBtn.className = 'gold-btn';
    backBtn.textContent = 'Back';

    backBtn.onclick = function() {
      currentPage -= 1;
      renderPageNav();
      renderFontPage();
    };

    nav.appendChild(backBtn);
  }

  // ── RANGE BUTTONS ──
  const visibleCount = isFirst ? 4 : 3;

  for (let i = 0; i < visibleCount; i++) {
    const pageIndex = windowStart + i;

    if (pageIndex >= totalPages) break;

    const start = pageIndex * PAGE_SIZE + 1;
    const end = Math.min((pageIndex + 1) * PAGE_SIZE, total);

    const btn = document.createElement('button');
    btn.className = pageIndex === currentPage ? 'gold-btn-active' : 'gold-btn';
    btn.textContent = start + '–' + end;

    btn.onclick = function() {
      currentPage = pageIndex;
      renderPageNav();
      renderFontPage();
    };

    nav.appendChild(btn);
  }

  // ── NEXT BUTTON ──
  if (currentPage < totalPages - 1) {
    const nextBtn = document.createElement('button');
    nextBtn.className = 'gold-btn';
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
// Shows 5 fonts for the current page as a numbered ordered list
function renderFontPage() {
  const list = document.getElementById('font-family-list');
  if (!list) return;
  list.innerHTML = '';

  const start = currentPage * PAGE_SIZE;
  const end   = Math.min(start + PAGE_SIZE, filteredFonts.length);
  const page  = filteredFonts.slice(start, end);

  if (page.length === 0) {
    const none = document.createElement('p');
    none.textContent = 'No fonts found.';
    list.appendChild(none);
    return;
  }

  const ol = document.createElement('ol');
  ol.className = 'font-names-list';
  ol.start     = start + 1;

  page.forEach(function(font) {
    const safeName = font.family.replace(/\s+/g, '_') + '_preview';
    loadFontFace(safeName, font.menu);

    const li = document.createElement('li');
    li.className       = 'font-family-list-item';
    li.textContent     = font.family;
    li.style.fontFamily = '"' + safeName + '", serif';

    li.addEventListener('click', function() {
      // Mark active
      ol.querySelectorAll('.font-family-list-item').forEach(function(item) {
        item.classList.remove('active');
      });
      li.classList.add('active');

      // Set selected font
      selectedFont = font;

      // Load first variant
      const firstVariant = Object.keys(font.files)[0];
      const firstSafe    = font.family.replace(/\s+/g, '_') + '_' + firstVariant;
      loadFontFace(firstSafe, font.files[firstVariant]);

      // Update weight dropdown
      const weightEl = document.getElementById('font-weight-control');
      if (weightEl) weightEl.value = getWeightNumber(firstVariant);

      updateAllPreviews();
    });

    ol.appendChild(li);
  });

  list.appendChild(ol);
}
// ── END PAGE SECTION 5 : RENDER FONT PAGE ────────────────────


// ── PAGE SECTION 6 : RENDER FONT LIST ────────────────────────
// Filters fonts, updates info badges, builds page nav, shows page 1
function renderFontList(category) {
  if (category !== undefined) {
    currentCategory = category;
    currentSearch   = '';
    const searchEl  = document.getElementById('font-search');
    if (searchEl) searchEl.value = '';
    hideSuggestions();
  }

  const cats = currentCategory === 'all' ? CATEGORIES : [currentCategory];
  filteredFonts = [];

  cats.forEach(function(cat) {
    let fonts = allFonts.filter(function(f) { return f.category === cat; });

    if (currentSearch) {
      const cleaned = cleanQuery(currentSearch);
      fonts = fonts.filter(function(f) {
	  return f.family.toLowerCase().startsWith(cleaned);
      });
    }

    fonts.sort(function(a, b) { return a.family.localeCompare(b.family); });
    filteredFonts = filteredFonts.concat(fonts);
    filteredFonts.sort(function(a, b) {
  return a.family.localeCompare(b.family);
});
  });

  // Update info badges
  const catEl     = null;
  const totalEl   = document.getElementById('font-list-total');
  const showingEl = document.getElementById('font-family-list-showing');

  if (catEl)     catEl.textContent     = 'Category: ' + (currentCategory === 'all' ? 'All' : currentCategory);
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
  const letter = e.target.dataset.letter;

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


// ── PAGE SECTION 10 : CONTROLS — SIZE, WEIGHT, COLOR, ITALIC ─
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

document.getElementById('variants').addEventListener('click', function(e) {
  if (!e.target.matches('.gold-btn') && !e.target.matches('.gold-btn-active')) return;
  document.querySelectorAll('#variants button').forEach(function(b) { b.className = 'gold-btn'; });
  e.target.className = 'gold-btn-active';
  const weightEl = document.getElementById('font-weight-control');
  if (weightEl) weightEl.value = e.target.dataset.weight;
  updateAllPreviews();
});
// ── END PAGE SECTION 10 : CONTROLS ───────────────────────────


// ── PAGE SECTION 11 : FONT PREVIEW INPUT HANDLER ───────────────

// INPUT FIELD → LOCAL PREVIEW + OPTIONAL GLOBAL UPDATE
document.getElementById('font-preview-input').addEventListener('input', function () {

  const preview = document.getElementById('font-preview-output');

const value = this.value.trim();

preview.textContent = value || 'Your text will appear here';

  // optional: keep global system in sync (DO NOT REMOVE)
  updateAllPreviews();

});

// ── END PAGE SECTION 11 : FONT PREVIEW INPUT HANDLER ───────────


// ── PAGE SECTION 12 : LOAD FONTS FROM API ────────────────────
async function loadFonts() {
  try {
    const url  = 'https://www.googleapis.com/webfonts/v1/webfonts?key=' + API_KEY + '&sort=popularity';
    const res  = await fetch(url);
    if (!res.ok) throw new Error('API error ' + res.status);
    const data = await res.json();
    allFonts   = data.items;
    renderFontList('serif');
  } catch (err) {
    const list = document.getElementById('font-family-options');
    if (list) {
      list.innerHTML = '';
      const errMsg = document.createElement('p');
      errMsg.textContent = 'Could not load fonts. Check your API key.';
      list.appendChild(errMsg);
    }
    console.error(err);
  }
}

loadFonts();
// ── END PAGE SECTION 12 : LOAD FONTS FROM API ────────────────
