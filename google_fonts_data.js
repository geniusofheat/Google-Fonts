// *** PASTE YOUR API KEY HERE ***
const API_KEY = 'AIzaSyC941rSK-K3iehOd2osiSv7PPQV6MYl0Ac';

const CATEGORIES = ['serif', 'sans-serif', 'monospace', 'display', 'handwriting'];
let allFonts = [];

// ── Load a font face into the page ──
function loadFontFace(safeName, url) {
  const style = document.createElement('style');
  style.textContent = `@font-face { font-family: "${safeName}"; src: url("${url}"); }`;
  document.head.appendChild(style);
}

// ── Copy button logic ──
function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(function() {
    btn.textContent = '✓ Copied';
    setTimeout(function() { btn.textContent = '📋 Copy'; }, 2000);
  }).catch(function() {
    btn.textContent = 'Failed';
  });
}

// ── Build a code box with a copy button ──
function makeCodeBox(code, id) {
  const wrap = document.createElement('div');
  wrap.className = 'gold-block';

  const codeEl = document.createElement('code');
  codeEl.textContent = code;
  if (id) codeEl.id = id;

  const btn = document.createElement('button');
  btn.className = 'gold-btn';
  btn.textContent = '📋 Copy';
  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    copyText(codeEl.textContent, btn);
  });

  wrap.appendChild(codeEl);
  wrap.appendChild(btn);
  return wrap;
}

// ── Weight helpers ──
function getWeightLabel(variant) {
  const map = {
    '100': 'Thin',
    '200': 'Extra Light',
    '300': 'Light',
    'regular': 'Regular (400)',
    '400': 'Regular',
    '500': 'Medium',
    '600': 'Semi Bold',
    '700': 'Bold',
    '800': 'Extra Bold',
    '900': 'Black'
  };
  const base = variant.replace('italic', '').trim() || 'regular';
  const isItalic = variant.includes('italic');
  return (map[base] || base) + (isItalic ? ' Italic' : '');
}

function getWeightNumber(variant) {
  if (variant === 'regular' || variant === 'italic') return '400';
  return variant.replace('italic', '').trim();
}

// ── Build and toggle the expanded card panel ──
function toggleVariants(card, font) {
  const existing = card.querySelector('.font-expanded');
  if (existing) {
    existing.remove();
    return;
  }

  const panel = document.createElement('div');
  panel.className = 'font-expanded';

  // ── How to add heading ──
  const heading = document.createElement('div');
  heading.className = 'blue-block';
  heading.textContent = '◆ How to add ' + font.family + ' ◆';
  panel.appendChild(heading);

  // ── Steps list ──
  const ol = document.createElement('ol');
  ol.className = 'menu';

  // Step 1
  const li1 = document.createElement('li');
  const li1text = document.createElement('p');
  li1text.textContent = 'Add this link to your head once. All fonts share this one link:';
  li1.appendChild(li1text);
  li1.appendChild(makeCodeBox('<link href="https://fonts.googleapis.com/css2?[ADD FONTS HERE]&display=swap" rel="stylesheet">'));
  ol.appendChild(li1);

  // Step 2
  const li2 = document.createElement('li');
  const li2text = document.createElement('p');
  li2text.textContent = 'Add this inside [ADD FONTS HERE] for ' + font.family + ':';
  li2.appendChild(li2text);
  li2.appendChild(makeCodeBox('&family=' + font.family.replace(/\s+/g, '+')));
  ol.appendChild(li2);

  // Step 3
  const fontFamilyLine = "font-family: '" + font.family + "', " + font.category + ';';
  const weightCodeId = 'weight-code-' + font.family.replace(/\s+/g, '_');
  const li3 = document.createElement('li');
  const li3text = document.createElement('p');
  li3text.textContent = 'Add these two lines to your stylesheet. Tap a style below to update the font weight:';
  li3.appendChild(li3text);
  li3.appendChild(makeCodeBox(fontFamilyLine + '\nfont-weight: 400;', weightCodeId));
  ol.appendChild(li3);

  panel.appendChild(ol);

  // ── Available styles ──
  const stylesHeading = document.createElement('div');
  stylesHeading.className = 'blue-block';
  stylesHeading.textContent = '◆ Available Styles ◆';
  panel.appendChild(stylesHeading);

  const stylesDesc = document.createElement('p');
  stylesDesc.className = 'tip-box';
  stylesDesc.textContent = 'Each style below shows ' + font.family + ' at that weight. Tap a style to update the font-weight code above.';
  panel.appendChild(stylesDesc);

  // Variant rows
  Object.entries(font.files).forEach(function(entry) {
    const variant = entry[0];
    const fileUrl = entry[1];
    const safeName = font.family.replace(/\s+/g, '_') + '_' + variant;
    const weightNum = getWeightNumber(variant);
    const weightLabel = getWeightLabel(variant);

    loadFontFace(safeName, fileUrl);

    const row = document.createElement('div');
    row.className = 'card';

    const label = document.createElement('h4');
    label.textContent = weightLabel;

    const sample = document.createElement('p');
    sample.style.fontFamily = `"${safeName}", serif`;
    sample.style.fontSize = '1.2rem';
    sample.textContent = font.family;

    row.appendChild(label);
    row.appendChild(sample);

    row.addEventListener('click', function(e) {
      e.stopPropagation();
      const codeEl = document.getElementById(weightCodeId);
      if (codeEl) {
        const isItalic = variant.includes('italic');
        let newCode = fontFamilyLine + '\nfont-weight: ' + weightNum + ';';
        if (isItalic) newCode += '\nfont-style: italic;';
        codeEl.textContent = newCode;
      }
      panel.querySelectorAll('.card').forEach(function(r) {
        r.style.borderColor = '';
      });
      row.style.borderColor = 'var(--gold)';
    });

    panel.appendChild(row);
  });

  card.appendChild(panel);
}

// ── Render font grid ──
function renderFonts(category) {
  const container = document.getElementById('font-container');
  container.innerHTML = '';

  const cats = category === 'all' ? CATEGORIES : [category];

  cats.forEach(function(cat) {
    const fonts = allFonts.filter(function(f) { return f.category === cat; });
    if (fonts.length === 0) return;

    // Category heading card
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
      nameEl.style.fontFamily = `"${safeName}", serif`;
      nameEl.textContent = font.family;

      const meta = document.createElement('p');
      meta.textContent = font.variants.length + ' style' + (font.variants.length > 1 ? 's' : '') + ' — tap to expand';

      card.appendChild(nameEl);
      card.appendChild(meta);

      card.addEventListener('click', function() {
        toggleVariants(card, font);
      });

      container.appendChild(card);
    });
  });
}

// ── Filter buttons ──
document.getElementById('font-family-options').addEventListener('click', function(e) {
  if (!e.target.matches('.nav-btn')) return;
  document.querySelectorAll('.nav-btn').forEach(function(b) { b.classList.remove('active'); });
  e.target.classList.add('active');
  renderFonts(e.target.dataset.cat);
});

// ── Fetch fonts from Google API ──
async function loadFonts() {
  try {
    const url = `https://www.googleapis.com/webfonts/v1/webfonts?key=${API_KEY}&sort=popularity`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('API error: ' + res.status);
    const data = await res.json();
    allFonts = data.items;
    renderFonts('all');
  } catch (err) {
    const container = document.getElementById('font-container');
    const errCard = document.createElement('div');
    errCard.className = 'card';
    const errMsg = document.createElement('p');
    errMsg.className = 'tip-box';
    errMsg.textContent = 'Failed to load fonts. Check your API key.';
    errCard.appendChild(errMsg);
    container.appendChild(errCard);
    console.error(err);
  }
}

loadFonts();

    function copyStatic(codeId, btnId) {
      const code = document.getElementById(codeId).textContent;
      const btn = document.getElementById(btnId);
      navigator.clipboard.writeText(code).then(function() {
        btn.textContent = '✓ Copied';
        setTimeout(function() { btn.textContent = '📋 Copy'; }, 2000);
      });
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/Google-Fonts/google_fonts_service_worker.js');
    }
