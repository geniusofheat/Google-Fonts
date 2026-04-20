// *** PASTE YOUR API KEY HERE ***
const API_KEY = 'AIzaSyC941rSK-K3iehOd2osiSv7PPQV6MYl0Ac';

// ── Font categories ──
const CATEGORIES = ['serif', 'sans-serif', 'monospace', 'display', 'handwriting'];
let allFonts = [];

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
// Clear both static code boxes
// ─────────────────────────────────────────────
function clearCodeBoxes() {
  document.getElementById('static-code-1').textContent = '';
  document.getElementById('static-code-2').textContent = '';
}

// ─────────────────────────────────────────────
// Toggle expanded weight panel on a font card
// ─────────────────────────────────────────────
function toggleVariants(card, font) {
  const existing = card.querySelector('.font-expanded');

  // Collapsing — remove panel and clear static code boxes
  if (existing) {
    existing.remove();
    clearCodeBoxes();
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
    (font.variants.length > 1 ? 's' : '') + '. Tap one to see the code.';
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
    sample.style.fontFamily = '"' + safeName + '", serif';
    sample.style.fontSize   = '1.15rem';
    sample.style.fontWeight = weightNum;
    sample.style.fontStyle  = isItalic ? 'italic' : 'normal';
    sample.textContent      = font.family;

    row.appendChild(label);
    row.appendChild(sample);

    row.addEventListener('click', function(e) {
      e.stopPropagation();

      const alreadyOpen = row.querySelector('.inline-codeboxes');

      // Remove inline code boxes from ALL rows in this panel
      panel.querySelectorAll('.inline-codeboxes').forEach(function(el) {
        el.remove();
      });

      // Clear highlight on all rows
      panel.querySelectorAll('.card').forEach(function(r) {
        r.style.borderColor = '';
      });

      // If this row was already open — just collapse it and clear boxes
      if (alreadyOpen) {
        clearCodeBoxes();
        return;
      }

      // Otherwise open this row
      row.style.borderColor = 'var(--gold)';

      // Build codes
      const linkCode = '<link href="https://fonts.googleapis.com/css2?family=' +
        font.family.replace(/\s+/g, '+') + '&display=swap" rel="stylesheet">';

      let cssCode = "font-family: '" + font.family + "', " + font.category + ';\n' +
                    'font-weight: ' + weightNum + ';';
      if (isItalic) cssCode += '\nfont-style: italic;';

      // Update static code boxes at bottom of page
      document.getElementById('static-code-1').textContent = linkCode;
      document.getElementById('static-code-2').textContent = cssCode;

      // Build inline code box wrapper
      const inlineBoxes = document.createElement('div');
      inlineBoxes.className = 'inline-codeboxes';

      // Inline box 1
      const inlineLabel1 = document.createElement('p');
      inlineLabel1.textContent = 'Step 2 : Add to your HTML head';
      inlineLabel1.style.marginTop = '8px';
      inlineBoxes.appendChild(inlineLabel1);

      const inlineWrap1 = document.createElement('div');
      inlineWrap1.className = 'gold-block';

      const inlineCode1 = document.createElement('code');
      inlineCode1.textContent = linkCode;

      const inlineBtn1 = document.createElement('button');
      inlineBtn1.className = 'gold-btn';
      inlineBtn1.textContent = '📋 Copy';
      inlineBtn1.addEventListener('click', function(e) {
        e.stopPropagation();
        navigator.clipboard.writeText(linkCode).then(function() {
          inlineBtn1.textContent = '✓ Copied';
          setTimeout(function() { inlineBtn1.textContent = '📋 Copy'; }, 2000);
        });
      });

      inlineWrap1.appendChild(inlineCode1);
      inlineWrap1.appendChild(inlineBtn1);
      inlineBoxes.appendChild(inlineWrap1);

      // Inline box 2
      const inlineLabel2 = document.createElement('p');
      inlineLabel2.textContent = 'Step 3 : Add to your stylesheet';
      inlineBoxes.appendChild(inlineLabel2);

      const inlineWrap2 = document.createElement('div');
      inlineWrap2.className = 'gold-block';

      const inlineCode2 = document.createElement('code');
      inlineCode2.textContent = cssCode;

      const inlineBtn2 = document.createElement('button');
      inlineBtn2.className = 'gold-btn';
      inlineBtn2.textContent = '📋 Copy';
      inlineBtn2.addEventListener('click', function(e) {
        e.stopPropagation();
        navigator.clipboard.writeText(cssCode).then(function() {
          inlineBtn2.textContent = '✓ Copied';
          setTimeout(function() { inlineBtn2.textContent = '📋 Copy'; }, 2000);
        });
      });

      inlineWrap2.appendChild(inlineCode2);
      inlineWrap2.appendChild(inlineBtn2);
      inlineBoxes.appendChild(inlineWrap2);

      // Append inline boxes inside the tapped row
      row.appendChild(inlineBoxes);
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
