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

function loadVariantFace(safeName, fileUrl) {
  const style = document.createElement('style');
  style.textContent = `@font-face { font-family: "${safeName}"; src: url("${fileUrl}"); }`;
  document.head.appendChild(style);
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

  Object.entries(font.files).forEach(function(entry) {
    const variant = entry[0];
    const fileUrl = entry[1];
    const safeName = font.family.replace(/\s+/g, '_') + '_' + variant.replace(/\s+/g, '_');
    loadVariantFace(safeName, fileUrl);

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
