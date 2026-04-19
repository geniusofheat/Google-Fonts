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

function loadFontFace(safeName, menuUrl) {
  const style = document.createElement('style');
  style.textContent = `@font-face { font-family: "${safeName}"; src: url("${menuUrl}"); }`;
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

function makeCodeRow(label, code) {
  const row = document.createElement('div');
  row.className = 'instruction-row';

  const labelEl = document.createElement('div');
  labelEl.className = 'instruction-label';
  labelEl.textContent = label;

  const codeWrap = document.createElement('div');
  codeWrap.className = 'code-wrap';

  const codeEl = document.createElement('code');
  codeEl.className = 'instruction-code';
  codeEl.textContent = code;

  const copyBtn = document.createElement('button');
  copyBtn.className = 'copy-btn';
  copyBtn.textContent = '📋 Copy';
  copyBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    copyText(code, copyBtn);
  });

  codeWrap.appendChild(codeEl);
  codeWrap.appendChild(copyBtn);
  row.appendChild(labelEl);
  row.appendChild(codeWrap);
  return row;
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

  // Instructions heading
  const heading = document.createElement('div');
  heading.className = 'instructions-heading';
  heading.textContent = 'How to add this font:';
  panel.appendChild(heading);

  const ol = document.createElement('ol');
  ol.className = 'instructions-list';

  // Step 1
  const li1 = document.createElement('li');
  li1.textContent = 'Start with this in your <head>:';
  const step1Row = makeCodeRow('', '<link href="https://fonts.googleapis.com/css2?[ADD FONTS HERE]&display=swap" rel="stylesheet">');
  li1.appendChild(step1Row);
  ol.appendChild(li1);

  // Step 2
  const familySnippet = '&family=' + font.family.replace(/\s+/g, '+');
  const li2 = document.createElement('li');
  li2.textContent = 'Add this inside [ADD FONTS HERE]:';
  const step2Row = makeCodeRow('', familySnippet);
  li2.appendChild(step2Row);
  ol.appendChild(li2);

  // Step 3
  const cssSnippet = 'font-weight: 400;';
  const li3 = document.createElement('li');
  li3.textContent = 'Paste this section inside the stylesheet for a css rule. Normal font weight is 400 by default. Change the 400 in the code to whatever weight you want from the choices below. ' + font.family + ':';
  const step3Row = makeCodeRow('', cssSnippet);
  li3.appendChild(step3Row);
  ol.appendChild(li3);

  panel.appendChild(ol);

  // Divider before variants
  const divider = document.createElement('div');
  divider.className = 'variants-divider';
  divider.textContent = 'Available styles:';
  panel.appendChild(divider);

  // Variant rows
  Object.entries(font.files).forEach(function(entry) {
    const variant = entry[0];
    const fileUrl = entry[1];
    const safeName = font.family.replace(/\s+/g, '_') + '_' + variant;

    const style = document.createElement('style');
    style.textContent = `@font-face { font-family: "${safeName}"; src: url("${fileUrl}"); }`;
    document.head.appendChild(style);

    const row = document.createElement('div');
    row.className = 'variant-row';

    const label = document.createElement('div');
    label.className = 'variant-label';
    label.textContent = variant;

    const sample = document.createElement('div');
    sample.className = 'variant-sample';
    sample.style.fontFamily = `"${safeName}", serif`;
    sample.textContent = font.family;

    row.appendChild(label);
    row.appendChild(sample);
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
