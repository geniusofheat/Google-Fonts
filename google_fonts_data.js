 
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

    function renderFonts(category) {
      const container = document.getElementById('font-container');
      container.innerHTML = '';

      const cats = category === 'all' ? CATEGORIES : [category];

      cats.forEach(cat => {
        const fonts = allFonts.filter(f => f.category === cat);
        if (fonts.length === 0) return;

        const section = document.createElement('div');
        section.className = 'category-section';

        const title = document.createElement('h2');
        title.className = 'category-title';
        title.textContent = cat.replace('-', ' ') + ' (' + fonts.length + ')';
        section.appendChild(title);

        const grid = document.createElement('div');
        grid.className = 'font-grid';

        fonts.forEach(font => {
          const card = document.createElement('div');
          card.className = 'font-card';

          // Load the font using its menu file
          const style = document.createElement('style');
          const safeName = font.family.replace(/\s+/g, '_') + '_preview';
          style.textContent = `@font-face { font-family: "${safeName}"; src: url("${font.menu}"); }`;
          document.head.appendChild(style);

          const nameEl = document.createElement('div');
          nameEl.className = 'font-name-display';
          nameEl.style.fontFamily = `"${safeName}", serif`;
          nameEl.textContent = font.family;

          const meta = document.createElement('div');
          meta.className = 'font-meta';
          meta.textContent = font.variants.length + ' style' + (font.variants.length > 1 ? 's' : '');

          card.appendChild(nameEl);
          card.appendChild(meta);
          grid.appendChild(card);
        });

        section.appendChild(grid);
        container.appendChild(section);
      });
    }

    // Filter buttons
    document.getElementById('filter-bar').addEventListener('click', function(e) {
      if (!e.target.matches('.filter-btn')) return;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeCategory = e.target.dataset.cat;
      renderFonts(activeCategory);
    });

    loadFonts();
  
