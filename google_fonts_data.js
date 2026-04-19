// *** PASTE YOUR API KEY HERE ***
const API_KEY = 'AIzaSyC941rSK-K3iehOd2osiSv7PPQV6MYl0Ac';

const CATEGORIES = ['serif', 'sans-serif', 'monospace', 'display', 'handwriting'];
let allFonts = [];
let activeCategory = 'all';

async function loadFonts() {
  try {
    const url = `https://www.googleapis.com/webfonts/v1/webfonts?key=${API_KEY}&sort=popularity`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('API error: ' + res.status);
    const data = await res.json();
    allFonts = data.items;
    document.getElementById('status').style.display = 'none';
    renderFonts('all');
  } catch (err) {
    document.getElementById('status').textContent = 'Failed to load fonts. Check your API key.';
    console.error(err);
  }
}

function loadFontFace(safeName, url) {
  const style = document.createElement('style');
  style.textContent = `@font-face { font-family: "${safeName}"; src: url("${url}"); }`;
  document.head.appendChild(style);
}

function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(function() {
    btn.textContent = '✓ Copied';
    setTimeout(function() { btn.textContent = '📋 Copy'; }, 2000);
  }).catch(function() {
    btn.textContent = 'Failed';
  });
}

function makeCodeRow(code, id) {
  const row = document.createElement('div');
  row.className = 'code-wrap';

  const codeEl = document.createElement('code');
  codeEl.className = 'instruction-code';
  codeEl.textContent = code;
  if (id) codeEl.id = id;

  const copyBtn = document.createElement('button');
  copyBtn.className = 'copy-btn';
  copyBtn.textContent = '📋 Copy';
  copyBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    copyText(codeEl.textContent, copyBtn);
  });

  row.appendChild(codeEl);
  row.appendChild(copyBtn);
  return row;
}

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
  const label = map[base] || base;
  return label + (isItalic ? ' Italic' : '');
}

function getWeightNumber(variant) {
  if (variant === 'regular' || variant === 'italic') return '400';
  return variant.replace('italic', '').trim();
}

function toggleVariants(card, font) {
  const existing = card.querySelector('.variants-panel');
  if (existing) {
    existing.remove();
    card.classList.remove('expanded');
    return;
  }

  card.classList.add('expanded');

  const panel = document.createElement('div');
  panel.className = 'variants-panel';

  // ── How to add this font ──
  const heading = document.createElement('div');
  heading.className = 'instructions-heading';
  heading.textContent = 'How to add this font:';
  panel.appendChild(heading);

  // Instructions list
  const ol = document.createElement('ol');
  ol.className = 'instructions-list';

  // Step 1
  const li1 = document.createElement('li');
  li1.textContent = 'Add this link to your <head> once. All fonts you choose will share this one link:';
  li1.appendChild(makeCodeRow('<link href="https://fonts.googleapis.com/css2?[ADD FONTS HERE]&display=swap" rel="stylesheet">'));
  ol.appendChild(li1);

  // Step 2
  const familySnippet = '&family=' + font.family.replace(/\s+/g, '+');
  const li2 = document.createElement('li');
  li2.textContent = 'Add this inside [ADD FONTS HERE] for ' + font.family + ':';
  li2.appendChild(makeCodeRow(familySnippet));
  ol.appendChild(li2);

// Step 3
const fontFamilySnippet = "font-family: '" + font.family + "', " + font.category + ';';
const weightCodeId = 'weight-code-' + font.family.replace(/\s+/g, '_');
const li3 = document.createElement('li');
li3.textContent = 'Add these two lines to your stylesheet inside any CSS rule you want ' + font.family + ' to appear in:';

const li3sub = document.createElement('p');
li3sub.className = 'instruction-sub';
li3sub.textContent = 'Font weight controls thickness. Choose a style by clicking one from the options below. The weight will be updated in the paste code. Copy and paste it into your stylesheet.';
li3.appendChild(li3sub);

const step3Box = document.createElement('div');
step3Box.className = 'code-wrap';

const codeEl = document.createElement('code');
codeEl.className = 'instruction-code';
codeEl.id = weightCodeId;
codeEl.textContent = fontFamilySnippet + '\nfont-weight: 400;';

const copyBtn = document.createElement('button');
copyBtn.className = 'copy-btn';
copyBtn.textContent = '📋 Copy';
copyBtn.addEventListener('click', function(e) {
  e.stopPropagation();
  copyText(codeEl.textContent, copyBtn);
});

step3Box.appendChild(codeEl);
step3Box.appendChild(copyBtn);
li3.appendChild(step3Box);
ol.appendChild(li3);

  // ── Available styles ──
  const divider = document.createElement('div');
  divider.className = 'variants-divider';
  divider.textContent = 'Available styles — tap one to select:';
  panel.appendChild(divider);

  const variantDesc = document.createElement('p');
  variantDesc.className = 'instruction-sub';
  variantDesc.textContent = 'Each style below shows ' + font.family + ' at that weight. Tap a style to update the font-weight code above.';
  panel.appendChild(variantDesc);

  Object.entries(font.files).forEach(function(entry) {
    const variant = entry[0];
    const fileUrl = entry[1];
    const safeName = font.family.replace(/\s+/g, '_') + '_' + variant;
    const weightNum = getWeightNumber(variant);
    const weightLabel = getWeightLabel(variant);

    loadFontFace(safeName, fileUrl);

    const row = document.createElement('div');
    row.className = 'variant-row';

    const label = document.createElement('div');
    label.className = 'variant-label';
    label.textContent = weightLabel;

    const sample = document.createElement('div');
    sample.className = 'variant-sample';
    sample.style.fontFamily = `"${safeName}", serif`;
    sample.textContent = font.family;

    row.appendChild(label);
    row.appendChild(sample);

    // Tap to update font-weight code
    row.addEventListener('click', function(e) {
      e.stopPropagation();
      const codeEl = document.getElementById(weightCodeId);
      if (codeEl) {
        const isItalic = variant.includes('italic');
        let newCode = 'font-weight: ' + weightNum + ';';
        if (isItalic) newCode += '\nfont-style: italic;';
        codeEl.textContent = newCode;
      }
      // Highlight selected row
      panel.querySelectorAll('.variant-row').forEach(function(r) {
        r.classList.remove('selected');
      });
      row.classList.add('selected');
    });

    panel.appendChild(row);
  });

  card.appendChild(panel);
}

function renderFonts(category) {
  const container = document.getElementById('font-container');
  container.innerHTML = '';

  const cats = category === 'all' ? CATEGORIES : [category];

  cats.forEach(function(cat) {
    const fonts = allFonts.filter(function(f) { return f.category === cat; });
    if (fonts.length === 0) return;

    const section = document.createElement('div');
    section.className = 'category-section';

    const title = document.createElement('h2');
    title.className = 'category-title';
    title.textContent = cat.replace('-', ' ') + ' (' + fonts.length + ')';
    section.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'font-grid';

    fonts.forEach(function(font) {
      const card = document.createElement('div');
      card.className = 'font-card';

      const safeName = font.family.replace(/\s+/g, '_') + '_preview';
      loadFontFace(safeName, font.menu);

      const nameEl = document.createElement('div');
      nameEl.className = 'font-name-display';
      nameEl.style.fontFamily = `"${safeName}", serif`;
      nameEl.textContent = font.family;

      const meta = document.createElement('div');
      meta.className = 'font-meta';
      meta.textContent = font.variants.length + ' style' + (font.variants.length > 1 ? 's' : '') + ' — tap to expand';

      card.appendChild(nameEl);
      card.appendChild(meta);

      card.addEventListener('click', function() {
        toggleVariants(card, font);
      });

      grid.appendChild(card);
    });

    section.appendChild(grid);
    container.appendChild(section);
  });
}

document.getElementById('filter-bar').addEventListener('click', function(e) {
  if (!e.target.matches('.filter-btn')) return;
  document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
  e.target.classList.add('active');
  activeCategory = e.target.dataset.cat;
  renderFonts(activeCategory);
});

loadFonts();
