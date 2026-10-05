const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
const DEFAULT_MODEL = process.env.DEFAULT_MODEL || 'qwen2.5-coder';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Helper: Call Google Gemini API
async function callGemini(prompt, systemPrompt, model = GEMINI_MODEL) {
  const apiKey = process.env.GEMINI_API_KEY || GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_gemini_api_key')) {
    throw new Error('Google Gemini API key is missing. Set GEMINI_API_KEY in your .env file or use the built-in Offline Web Specs Generator.');
  }

  const actualModel = model.replace(/\s*\(.*\)/, '').trim() || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${actualModel}:generateContent?key=${apiKey}`;

  const payload = {
    system_instruction: {
      parts: [{ text: systemPrompt }]
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json'
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google Gemini API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const candidate = data.candidates && data.candidates[0];
    if (!candidate || !candidate.content || !candidate.content.parts) {
      throw new Error('Gemini API returned an empty response candidate.');
    }

    return candidate.content.parts.map(p => p.text).join('\n');
  } catch (err) {
    console.error('Gemini API Error:', err.message);
    throw err;
  }
}

// Helper: Call Ollama API (/api/generate)
async function callOllama(prompt, systemPrompt, model = DEFAULT_MODEL) {
  const url = `${OLLAMA_HOST.replace(/\/$/, '')}/api/generate`;
  const actualModel = model.replace(/\s*\(.*\)/, '').trim() || DEFAULT_MODEL;

  const payload = {
    model: actualModel,
    prompt: prompt,
    system: systemPrompt,
    stream: false,
    options: {
      temperature: 0.2,
      num_predict: 4096
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Ollama API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return data.response || '';
  } catch (err) {
    if (err.cause && err.cause.code === 'ECONNREFUSED') {
      throw new Error(`Cannot connect to local Ollama server at ${OLLAMA_HOST}.`);
    }
    throw err;
  }
}

// Prompt-Tailored Dynamic Web Standards & Specification Engine
function generateOfflineCode(userPrompt, category = '') {
  const p = (userPrompt + ' ' + category).toLowerCase();

  if (p.includes('ecommerce') || p.includes('shop') || p.includes('store') || p.includes('cart') || p.includes('product')) {
    return buildEcommerceTemplate(userPrompt);
  } else if (p.includes('portfolio') || p.includes('developer') || p.includes('resume') || p.includes('bio')) {
    return buildPortfolioTemplate(userPrompt);
  } else if (p.includes('landing') || p.includes('saas') || p.includes('product') || p.includes('startup')) {
    return buildLandingPageTemplate(userPrompt);
  } else if (p.includes('blog') || p.includes('news') || p.includes('article') || p.includes('journal')) {
    return buildBlogTemplate(userPrompt);
  } else if (p.includes('dashboard') || p.includes('analytics') || p.includes('kpi') || p.includes('metrics') || p.includes('admin')) {
    return buildDashboardTemplate(userPrompt);
  } else {
    return buildPortfolioTemplate(userPrompt);
  }
}

// Production-Grade E-Commerce Storefront Template Generator
function buildEcommerceTemplate(prompt) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code & Website Generator Store | Premium Tech Gear</title>
  <link rel="stylesheet" href="style.css">
  <script src="script.js" defer></script>
</head>
<body data-theme="dark">

  <!-- Announcement Bar -->
  <div class="announcement-bar">
    <span>🚚 Free Express Shipping on Orders Over Amount | Use Code <strong>FREESHIP</strong></span>
  </div>

  <!-- Header & Navigation -->
  <header class="navbar">
    <div class="container nav-content">
      <a href="#" class="brand">🛍️ Code & Website Generator Store</a>
      
      <div class="search-bar">
        <input type="text" id="prodSearch" placeholder="Search tech gear, headphones, keyboards...">
        <span class="search-icon">🔍</span>
      </div>

      <div class="nav-actions">
        <button id="cartBtn" class="cart-btn">
          🛒 <span class="cart-text">Cart</span> (<span id="cartCount">0</span>)
        </button>
      </div>
    </div>
  </header>

  <!-- Hero Promotional Banner -->
  <section class="hero-banner">
    <div class="container hero-content">
      <div class="hero-text">
        <span class="promo-tag">🔥 Featured Collection</span>
        <h1>Upgrade Your Workspace with Next-Gen Tech</h1>
        <p>Premium headphones, ergonomic keyboards, and high-performance accessories built for creators & engineers.</p>
        <div class="hero-btns">
          <a href="#products" class="btn btn-primary">Shop Collection</a>
          <a href="#deals" class="btn btn-outline">Special Deals</a>
        </div>
      </div>
      <div class="hero-image">
        <div class="hero-badge">Up to Number% OFF</div>
        <div class="hero-emoji">🎧⚡</div>
      </div>
    </div>
  </section>

  <!-- Main Store Layout -->
  <main class="container main-store" id="products">
    <div class="category-filter-bar">
      <h2>Featured Products</h2>
      <div class="filter-chips">
        <button class="filter-chip active" data-cat="all">All Items</button>
        <button class="filter-chip" data-cat="audio">Audio</button>
        <button class="filter-chip" data-cat="keyboards">Keyboards</button>
        <button class="filter-chip" data-cat="accessories">Accessories</button>
        <button class="filter-chip" data-cat="displays">Displays</button>
      </div>
    </div>

    <!-- Product Grid -->
    <div class="product-grid" id="productGrid">
      <div class="product-card" data-category="audio" data-title="Wireless Noise-Canceling Headphones" data-price="Price">
        <div class="card-badge sale">Best Seller</div>
        <div class="product-thumb">🎧</div>
        <div class="card-info">
          <span class="category-tag">Audio</span>
          <h3 class="product-title">Wireless Noise-Canceling Headphones</h3>
          <div class="rating">★★★★★ <span>(Number)</span></div>
          <div class="price-row"><span class="current-price">Price</span><span class="old-price">Price</span></div>
          <div class="card-actions">
            <button class="btn btn-sm btn-primary add-to-cart-btn" data-name="Wireless Headphones" data-price="Price">Add to Cart</button>
            <button class="btn btn-sm btn-outline quick-view-btn" data-name="Wireless Noise-Canceling Headphones" data-price="Price" data-desc="Active Noise Cancellation with Number-hour battery life and ultra-comfortable memory foam earcups." data-img="🎧">Quick View</button>
          </div>
        </div>
      </div>

      <div class="product-card" data-category="keyboards" data-title="Mechanical Ergonomic RGB Keyboard" data-price="Price">
        <div class="card-badge new">New</div>
        <div class="product-thumb">⌨️</div>
        <div class="card-info">
          <span class="category-tag">Keyboards</span>
          <h3 class="product-title">Mechanical Ergonomic RGB Keyboard</h3>
          <div class="rating">★★★★☆ <span>(Number)</span></div>
          <div class="price-row"><span class="current-price">Price</span></div>
          <div class="card-actions">
            <button class="btn btn-sm btn-primary add-to-cart-btn" data-name="RGB Mechanical Keyboard" data-price="Price">Add to Cart</button>
            <button class="btn btn-sm btn-outline quick-view-btn" data-name="Mechanical Ergonomic RGB Keyboard" data-price="Price" data-desc="Hot-swappable tactile switches with customizable per-key RGB backlighting and wrist rest." data-img="⌨️">Quick View</button>
          </div>
        </div>
      </div>

      <div class="product-card" data-category="accessories" data-title="Precision Wireless Gaming Mouse" data-price="Price">
        <div class="product-thumb">🖱️</div>
        <div class="card-info">
          <span class="category-tag">Accessories</span>
          <h3 class="product-title">Precision Wireless Gaming Mouse</h3>
          <div class="rating">★★★★☆ <span>(Number)</span></div>
          <div class="price-row"><span class="current-price">Price</span><span class="old-price">Price</span></div>
          <div class="card-actions">
            <button class="btn btn-sm btn-primary add-to-cart-btn" data-name="Wireless Gaming Mouse" data-price="Price">Add to Cart</button>
            <button class="btn btn-sm btn-outline quick-view-btn" data-name="Precision Wireless Gaming Mouse" data-price="Price" data-desc="Number DPI optical sensor with lightweight design and continuous battery life." data-img="🖱️">Quick View</button>
          </div>
        </div>
      </div>
    </div>
  </main>

  <!-- Slide-Over Shopping Cart Modal -->
  <div id="cartDrawer" class="cart-drawer hidden">
    <div class="drawer-overlay" id="drawerOverlay"></div>
    <div class="drawer-panel">
      <div class="drawer-header">
        <h3>Shopping Cart (<span id="drawerCartCount">0</span>)</h3>
        <button id="closeDrawer" class="close-btn">&times;</button>
      </div>
      <div id="cartItemsList" class="cart-items-list">
        <p class="empty-msg">Your shopping cart is currently empty.</p>
      </div>
      <div class="drawer-footer">
        <div class="total-row"><span>Subtotal:</span><span id="cartSubtotal" class="subtotal-amount">Amount</span></div>
        <button id="checkoutBtn" class="btn btn-primary btn-block">Proceed to Checkout ➔</button>
      </div>
    </div>
  </div>

  <!-- Quick View Product Modal -->
  <div id="quickViewModal" class="modal hidden">
    <div class="modal-overlay" id="modalOverlay"></div>
    <div class="modal-card">
      <button id="closeModal" class="close-btn">&times;</button>
      <div class="modal-body">
        <div class="modal-img" id="qvImg">🎧</div>
        <div class="modal-details">
          <h2 id="qvTitle">Product Title</h2>
          <span id="qvPrice" class="qv-price">Price</span>
          <p id="qvDesc">Product description goes here.</p>
          <button id="qvAddToCartBtn" class="btn btn-primary btn-block">Add to Cart</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <footer class="footer">
    <div class="container footer-content">
      <div class="footer-brand">
        <h3>🛍️ Code & Website Generator Store</h3>
        <p>Your destination for high-performance tech accessories and gadgets.</p>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; ${new Date().getFullYear()} Code & Website Generator Store. All rights reserved.</p>
    </div>
  </footer>

</body>
</html>`;

  const css = `/* ==========================================================================
   Code & Website Generator Store - Production E-Commerce Stylesheet
   ========================================================================== */

:root {
  --bg-dark: #0f172a;
  --bg-card: #1e293b;
  --bg-hover: #334155;
  --text-main: #f8fafc;
  --text-sub: #94a3b8;
  --accent: #6366f1;
  --accent-hover: #4f46e5;
  --border: #334155;
  --success: #10b981;
  --warning: #f59e0b;
}

* { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
body { background-color: var(--bg-dark); color: var(--text-main); line-height: 1.5; }
.container { max-width: 1150px; margin: 0 auto; padding: 0 1.5rem; }

.announcement-bar { background: linear-gradient(90deg, #6366f1, #ec4899); color: #fff; text-align: center; padding: 6px 1rem; font-size: 0.8rem; font-weight: 600; }

.navbar { position: sticky; top: 0; background-color: var(--bg-card); border-bottom: 1px solid var(--border); z-index: 100; }
.nav-content { display: flex; align-items: center; justify-content: space-between; height: 68px; gap: 1rem; }
.brand { font-weight: 700; font-size: 1.15rem; color: #fff; text-decoration: none; }

.search-bar { position: relative; flex: 1; max-width: 450px; }
.search-bar input { width: 100%; background: var(--bg-dark); border: 1px solid var(--border); color: #fff; padding: 0.55rem 1rem 0.55rem 2.2rem; border-radius: 20px; outline: none; font-size: 0.88rem; }
.search-bar input:focus { border-color: var(--accent); }
.search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); font-size: 0.85rem; }

.cart-btn { background: var(--accent); color: #fff; border: none; padding: 0.55rem 1.1rem; border-radius: 20px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.35rem; transition: background 0.2s ease; }
.cart-btn:hover { background: var(--accent-hover); }

.hero-banner { padding: 3.5rem 0; background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.2), transparent 60%); border-bottom: 1px solid var(--border); }
.hero-content { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 2rem; align-items: center; }
.promo-tag { background: rgba(99,102,241,0.15); color: var(--accent); padding: 4px 12px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; }
.hero-text h1 { font-size: 2.5rem; margin: 0.75rem 0; line-height: 1.2; }
.hero-text p { color: var(--text-sub); font-size: 1.05rem; margin-bottom: 1.5rem; }
.hero-btns { display: flex; gap: 1rem; }

.btn { display: inline-flex; align-items: center; justify-content: center; padding: 0.65rem 1.25rem; border-radius: 8px; font-weight: 600; text-decoration: none; cursor: pointer; border: none; transition: all 0.2s ease; }
.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover { background: var(--accent-hover); }
.btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text-main); }
.btn-outline:hover { background: var(--bg-hover); }
.btn-sm { padding: 0.4rem 0.85rem; font-size: 0.82rem; }
.btn-block { width: 100%; }

.hero-image { position: relative; background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; height: 220px; display: flex; align-items: center; justify-content: center; }
.hero-emoji { font-size: 4.5rem; }
.hero-badge { position: absolute; top: 12px; right: 12px; background: #ec4899; color: #fff; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; }

.main-store { padding: 3rem 0; }
.category-filter-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
.category-filter-bar h2 { font-size: 1.6rem; }
.filter-chips { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.filter-chip { background: var(--bg-card); border: 1px solid var(--border); color: var(--text-sub); padding: 6px 14px; border-radius: 16px; font-size: 0.82rem; cursor: pointer; transition: all 0.2s; }
.filter-chip.active, .filter-chip:hover { background: var(--accent); color: #fff; border-color: var(--accent); }

.product-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
.product-card { position: relative; background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; transition: transform 0.2s ease, border-color 0.2s ease; display: flex; flex-direction: column; }
.product-card:hover { transform: translateY(-3px); border-color: var(--accent); }

.card-badge { position: absolute; top: 10px; left: 10px; padding: 3px 8px; border-radius: 8px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; z-index: 2; }
.card-badge.sale { background: #ef4444; color: #fff; }
.card-badge.new { background: #10b981; color: #fff; }

.product-thumb { height: 140px; background: rgba(99, 102, 241, 0.08); display: flex; align-items: center; justify-content: center; font-size: 3.5rem; }
.card-info { padding: 1.1rem; display: flex; flex-direction: column; flex: 1; }
.category-tag { font-size: 0.72rem; color: var(--accent); text-transform: uppercase; font-weight: 700; margin-bottom: 0.25rem; }
.product-title { font-size: 1.05rem; font-weight: 600; margin-bottom: 0.4rem; height: 2.4em; overflow: hidden; }
.rating { color: var(--warning); font-size: 0.8rem; margin-bottom: 0.75rem; }
.rating span { color: var(--text-sub); }

.price-row { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }
.current-price { font-size: 1.2rem; font-weight: 700; color: #fff; }
.old-price { font-size: 0.9rem; color: var(--text-sub); text-decoration: line-through; }

.card-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: auto; }

.cart-drawer { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 200; }
.cart-drawer.hidden { display: none; }
.drawer-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); }
.drawer-panel { position: absolute; top: 0; right: 0; width: 380px; max-width: 100%; height: 100%; background: var(--bg-card); border-left: 1px solid var(--border); display: flex; flex-direction: column; padding: 1.5rem; }
.drawer-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 1rem; }
.close-btn { background: none; border: none; color: var(--text-sub); font-size: 1.5rem; cursor: pointer; }

.cart-items-list { flex: 1; overflow-y: auto; padding: 1rem 0; display: flex; flex-direction: column; gap: 0.75rem; }
.cart-item { display: flex; justify-content: space-between; align-items: center; background: var(--bg-dark); padding: 0.75rem; border-radius: 8px; border: 1px solid var(--border); }
.item-info h4 { font-size: 0.88rem; margin-bottom: 0.2rem; }
.item-price { font-size: 0.8rem; color: var(--accent); font-weight: 600; }
.remove-item-btn { background: none; border: none; color: #ef4444; cursor: pointer; font-size: 0.8rem; }
.empty-msg { text-align: center; color: var(--text-sub); margin-top: 2rem; font-size: 0.9rem; }

.drawer-footer { border-top: 1px solid var(--border); padding-top: 1rem; }
.total-row { display: flex; justify-content: space-between; font-weight: 700; font-size: 1.1rem; margin-bottom: 1rem; }

.modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 200; display: flex; align-items: center; justify-content: center; }
.modal.hidden { display: none; }
.modal-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); }
.modal-card { position: relative; background: var(--bg-card); border: 1px solid var(--border); width: 550px; max-width: 90%; border-radius: 16px; padding: 2rem; z-index: 210; }
.modal-body { display: grid; grid-template-columns: 140px 1fr; gap: 1.5rem; align-items: center; }
.modal-img { font-size: 5rem; text-align: center; background: rgba(99,102,241,0.1); border-radius: 12px; padding: 1rem; }
.qv-price { display: block; font-size: 1.4rem; font-weight: 700; color: var(--accent); margin: 0.5rem 0; }
#qvDesc { color: var(--text-sub); font-size: 0.88rem; margin-bottom: 1.25rem; }

.footer { background: var(--bg-card); border-top: 1px solid var(--border); padding: 3rem 0 1.5rem; margin-top: auto; }
.footer-content { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.5rem; margin-bottom: 2rem; }
.footer-bottom { border-top: 1px solid var(--border); padding-top: 1.5rem; text-align: center; color: var(--text-sub); font-size: 0.8rem; }

@media(max-width: 768px) {
  .hero-content, .product-grid { grid-template-columns: 1fr; }
  .modal-body { grid-template-columns: 1fr; }
}
`;

  const js = `document.addEventListener('DOMContentLoaded', () => {
  let cart = [];

  const cartBtn = document.getElementById('cartBtn');
  const cartCount = document.getElementById('cartCount');
  const drawerCartCount = document.getElementById('drawerCartCount');
  const cartDrawer = document.getElementById('cartDrawer');
  const closeDrawer = document.getElementById('closeDrawer');
  const drawerOverlay = document.getElementById('drawerOverlay');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartSubtotal = document.getElementById('cartSubtotal');
  const checkoutBtn = document.getElementById('checkoutBtn');

  const quickViewModal = document.getElementById('quickViewModal');
  const closeModal = document.getElementById('closeModal');
  const modalOverlay = document.getElementById('modalOverlay');
  const qvImg = document.getElementById('qvImg');
  const qvTitle = document.getElementById('qvTitle');
  const qvPrice = document.getElementById('qvPrice');
  const qvDesc = document.getElementById('qvDesc');
  const qvAddToCartBtn = document.getElementById('qvAddToCartBtn');

  let currentQvItem = null;

  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-name');
      addToCart(name, 'Price');
    });
  });

  function addToCart(name, price) {
    const existing = cart.find(i => i.name === name);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ name, price: 'Price', qty: 1 });
    }
    updateCartUI();
  }

  function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

    if (cartCount) cartCount.textContent = totalItems;
    if (drawerCartCount) drawerCartCount.textContent = totalItems;
    if (cartSubtotal) cartSubtotal.textContent = 'Amount';

    if (cartItemsList) {
      if (cart.length === 0) {
        cartItemsList.innerHTML = '<p class="empty-msg">Your shopping cart is currently empty.</p>';
      } else {
        cartItemsList.innerHTML = cart.map((item, index) => \`
          <div class="cart-item">
            <div class="item-info">
              <h4>\${item.name}</h4>
              <span class="item-price">Price x \${item.qty}</span>
            </div>
            <button class="remove-item-btn" onclick="removeItem(\${index})">Remove</button>
          </div>
        \`).join('');
      }
    }
  }

  window.removeItem = function(index) {
    cart.splice(index, 1);
    updateCartUI();
  };

  cartBtn?.addEventListener('click', () => cartDrawer?.classList.remove('hidden'));
  closeDrawer?.addEventListener('click', () => cartDrawer?.classList.add('hidden'));
  drawerOverlay?.addEventListener('click', () => cartDrawer?.classList.add('hidden'));

  document.querySelectorAll('.quick-view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-name');
      const desc = btn.getAttribute('data-desc');
      const img = btn.getAttribute('data-img');

      currentQvItem = { name, price: 'Price' };

      if (qvTitle) qvTitle.textContent = name;
      if (qvPrice) qvPrice.textContent = 'Price';
      if (qvDesc) qvDesc.textContent = desc;
      if (qvImg) qvImg.textContent = img;

      quickViewModal?.classList.remove('hidden');
    });
  });

  qvAddToCartBtn?.addEventListener('click', () => {
    if (currentQvItem) {
      addToCart(currentQvItem.name, currentQvItem.price);
      quickViewModal?.classList.add('hidden');
    }
  });

  closeModal?.addEventListener('click', () => quickViewModal?.classList.add('hidden'));
  modalOverlay?.addEventListener('click', () => quickViewModal?.classList.add('hidden'));

  const prodSearch = document.getElementById('prodSearch');
  prodSearch?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll('.product-card').forEach(card => {
      const title = card.getAttribute('data-title')?.toLowerCase() || '';
      card.style.display = title.includes(query) ? 'flex' : 'none';
    });
  });

  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const cat = chip.getAttribute('data-cat');
      document.querySelectorAll('.product-card').forEach(card => {
        if (cat === 'all' || card.getAttribute('data-category') === cat) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  checkoutBtn?.addEventListener('click', () => {
    if (cart.length === 0) {
      alert('Your cart is empty.');
    } else {
      alert('Thank you for testing Code & Website Generator Store! Order successfully placed.');
      cart = [];
      updateCartUI();
      cartDrawer?.classList.add('hidden');
    }
  });
});`;

  return { html, css, js };
}

// 1. Portfolio Website Template Generator
function buildPortfolioTemplate(prompt) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Name | Senior Full-Stack Developer</title>
  <link rel="stylesheet" href="style.css">
  <script src="script.js" defer></script>
</head>
<body data-theme="dark">
  <header class="navbar">
    <div class="container nav-content">
      <a href="#" class="logo">&lt;Code & Website Generator /&gt;</a>
      <nav class="nav-links">
        <a href="#about">About</a>
        <a href="#skills">Skills</a>
        <a href="#projects">Projects</a>
        <a href="#experience">Experience</a>
        <a href="#contact" class="btn-sm">Contact Me</a>
      </nav>
      <button id="themeToggle" class="icon-btn">🌙</button>
    </div>
  </header>

  <main>
    <section id="about" class="hero-section">
      <div class="container hero-grid">
        <div class="hero-info">
          <span class="badge">Available for Hire</span>
          <h1>Building Scalable Web Applications & Interactive Interfaces</h1>
          <p>Hi, I'm Name. A Full-Stack Engineer specializing in modern JavaScript, HTML5/CSS3 architecture, and performance engineering.</p>
          <div class="hero-btns">
            <a href="#projects" class="btn btn-primary">View Projects</a>
            <a href="#contact" class="btn btn-outline">Let's Talk</a>
          </div>
        </div>
        <div class="hero-avatar">
          <div class="avatar-card">
            <div class="avatar-placeholder">💻</div>
            <h3>Name</h3>
            <p>Full-Stack Engineer</p>
            <div class="tech-tags">
              <span>JavaScript</span><span>Node.js</span><span>CSS3</span><span>HTML5</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="skills" class="section">
      <div class="container">
        <h2 class="section-title">Technical Expertise</h2>
        <div class="skills-grid">
          <div class="skill-card">
            <div class="skill-head"><span>JavaScript (ES6+)</span><span>Number%</span></div>
            <div class="progress-bar"><div class="progress" style="width: 95%"></div></div>
          </div>
          <div class="skill-card">
            <div class="skill-head"><span>HTML5 & CSS3 Architecture</span><span>Number%</span></div>
            <div class="progress-bar"><div class="progress" style="width: 90%"></div></div>
          </div>
          <div class="skill-card">
            <div class="skill-head"><span>Node.js & Express REST APIs</span><span>Number%</span></div>
            <div class="progress-bar"><div class="progress" style="width: 88%"></div></div>
          </div>
          <div class="skill-card">
            <div class="skill-head"><span>Web Performance & UI/UX</span><span>Number%</span></div>
            <div class="progress-bar"><div class="progress" style="width: 92%"></div></div>
          </div>
        </div>
      </div>
    </section>

    <section id="projects" class="section bg-card">
      <div class="container">
        <h2 class="section-title">Featured Projects</h2>
        <div class="filter-btns">
          <button class="filter-btn active" data-filter="all">All</button>
          <button class="filter-btn" data-filter="web">Web Apps</button>
          <button class="filter-btn" data-filter="api">APIs</button>
        </div>

        <div class="projects-grid">
          <div class="project-card" data-category="web">
            <div class="project-img">⚡</div>
            <div class="project-body">
              <h3>Code & Website Generator Engine</h3>
              <p>AI-powered website code generator generating vanilla HTML, CSS, and JavaScript.</p>
              <div class="tags"><span>Vanilla JS</span><span>Node.js</span></div>
            </div>
          </div>

          <div class="project-card" data-category="web">
            <div class="project-img">📊</div>
            <div class="project-body">
              <h3>Realtime Analytics Suite</h3>
              <p>Lightweight telemetry dashboard monitor with customizable KPI widgets.</p>
              <div class="tags"><span>HTML5</span><span>CSS Grid</span></div>
            </div>
          </div>

          <div class="project-card" data-category="api">
            <div class="project-img">🔌</div>
            <div class="project-body">
              <h3>Cloud Sync Gateway</h3>
              <p>High-throughput REST API middleware for distributed data sync.</p>
              <div class="tags"><span>Express</span><span>REST</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="contact" class="section">
      <div class="container">
        <div class="contact-box">
          <h2>Get In Touch</h2>
          <p>Interested in working together or have a project in mind? Send me a message!</p>
          <form id="portfolioForm" class="form">
            <div class="form-row">
              <input type="text" id="name" required placeholder="Your Name">
              <input type="email" id="email" required placeholder="Your Email">
            </div>
            <textarea id="msg" rows="4" required placeholder="Your Message..."></textarea>
            <button type="submit" class="btn btn-primary">Send Message</button>
          </form>
          <div id="formNotice" class="notice hidden"></div>
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} Code & Website Generator. Built with Vanilla Web Specs.</p>
    </div>
  </footer>
</body>
</html>`;

  const css = `:root {
  --bg: #0f172a; --card: #1e293b; --text: #f8fafc; --text-sub: #94a3b8;
  --accent: #6366f1; --accent-hover: #4f46e5; --border: #334155;
}
[data-theme="light"] {
  --bg: #f8fafc; --card: #ffffff; --text: #0f172a; --text-sub: #475569;
  --accent: #4f46e5; --accent-hover: #4338ca; --border: #e2e8f0;
}
* { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, sans-serif; }
body { background: var(--bg); color: var(--text); line-height: 1.6; }
.container { max-width: 1050px; margin: 0 auto; padding: 0 1.5rem; }
.navbar { position: sticky; top: 0; background: var(--card); border-bottom: 1px solid var(--border); z-index: 10; }
.nav-content { display: flex; align-items: center; justify-content: space-between; height: 64px; }
.logo { font-weight: 700; color: var(--accent); text-decoration: none; font-size: 1.1rem; }
.nav-links { display: flex; gap: 1.25rem; align-items: center; }
.nav-links a { color: var(--text-sub); text-decoration: none; font-weight: 500; }
.nav-links a:hover { color: var(--text); }
.hero-section { padding: 4rem 0; }
.hero-grid { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 2rem; align-items: center; }
.badge { background: rgba(99,102,241,0.15); color: var(--accent); padding: 4px 10px; border-radius: 12px; font-weight: 600; font-size: 0.8rem; }
.hero-info h1 { font-size: 2.2rem; margin: 0.75rem 0; }
.hero-info p { color: var(--text-sub); font-size: 1.05rem; margin-bottom: 1.5rem; }
.hero-btns { display: flex; gap: 1rem; }
.btn { padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; text-decoration: none; cursor: pointer; border: none; }
.btn-primary { background: var(--accent); color: #fff; }
.btn-outline { border: 1px solid var(--border); color: var(--text); background: transparent; }
.btn-sm { background: var(--accent); color: #fff; padding: 4px 12px; border-radius: 6px; font-size: 0.85rem; text-decoration: none; }
.icon-btn { background: none; border: none; cursor: pointer; font-size: 1.2rem; }
.avatar-card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 2rem; text-align: center; }
.avatar-placeholder { font-size: 3rem; margin-bottom: 0.5rem; }
.tech-tags { display: flex; gap: 0.4rem; justify-content: center; margin-top: 1rem; flex-wrap: wrap; }
.tech-tags span { background: var(--bg); border: 1px solid var(--border); padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; }
.section { padding: 3.5rem 0; border-top: 1px solid var(--border); }
.bg-card { background: var(--card); }
.section-title { font-size: 1.75rem; margin-bottom: 2rem; text-align: center; }
.skills-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.skill-card { background: var(--card); border: 1px solid var(--border); padding: 1.25rem; border-radius: 10px; }
.skill-head { display: flex; justify-content: space-between; font-weight: 600; margin-bottom: 0.5rem; }
.progress-bar { background: var(--bg); height: 8px; border-radius: 4px; overflow: hidden; }
.progress { background: var(--accent); height: 100%; }
.filter-btns { display: flex; justify-content: center; gap: 0.5rem; margin-bottom: 2rem; }
.filter-btn { background: var(--bg); border: 1px solid var(--border); color: var(--text-sub); padding: 6px 14px; border-radius: 16px; cursor: pointer; }
.filter-btn.active { background: var(--accent); color: #fff; }
.projects-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
.project-card { background: var(--bg); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
.project-img { height: 100px; background: rgba(99,102,241,0.1); display: flex; align-items: center; justify-content: center; font-size: 2.5rem; }
.project-body { padding: 1rem; }
.project-body h3 { font-size: 1.1rem; margin-bottom: 0.4rem; }
.project-body p { color: var(--text-sub); font-size: 0.85rem; margin-bottom: 0.75rem; }
.tags span { background: var(--card); border: 1px solid var(--border); padding: 2px 6px; border-radius: 6px; font-size: 0.7rem; margin-right: 4px; }
.contact-box { max-width: 550px; margin: 0 auto; background: var(--card); border: 1px solid var(--border); padding: 2rem; border-radius: 16px; text-align: center; }
.form { display: flex; flex-direction: column; gap: 1rem; margin-top: 1.5rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form input, .form textarea { background: var(--bg); border: 1px solid var(--border); color: var(--text); padding: 0.75rem; border-radius: 8px; outline: none; }
.notice { margin-top: 1rem; padding: 0.75rem; background: rgba(16,185,129,0.15); color: #10b981; border-radius: 8px; font-size: 0.85rem; }
.hidden { display: none; }
.footer { padding: 1.5rem 0; border-top: 1px solid var(--border); text-align: center; color: var(--text-sub); font-size: 0.85rem; }
@media(max-width: 768px) { .hero-grid, .skills-grid, .projects-grid, .form-row { grid-template-columns: 1fr; } }
`;

  const js = `document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('themeToggle');
  toggle?.addEventListener('click', () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    toggle.textContent = isDark ? '☀️' : '🌙';
  });

  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-filter');
      projectCards.forEach(card => {
        if (cat === 'all' || card.getAttribute('data-category') === cat) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  const form = document.getElementById('portfolioForm');
  const notice = document.getElementById('formNotice');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (notice) {
      notice.textContent = 'Message sent successfully! Name will reply soon.';
      notice.classList.remove('hidden');
      form.reset();
      setTimeout(() => notice.classList.add('hidden'), 4000);
    }
  });
});`;

  return { html, css, js };
}

// 2. SaaS Landing Page Generator
function buildLandingPageTemplate(prompt) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code & Website Generator - SaaS Workflow Platform</title>
  <link rel="stylesheet" href="style.css">
  <script src="script.js" defer></script>
</head>
<body>
  <header class="header">
    <div class="container nav-wrap">
      <a href="#" class="brand">🚀 Code & Website Generator</a>
      <nav class="nav">
        <a href="#features">Features</a>
        <a href="#pricing">Pricing</a>
        <a href="#faq">FAQ</a>
      </nav>
      <div class="nav-actions">
        <a href="#pricing" class="btn btn-primary">Start Free Trial</a>
      </div>
    </div>
  </header>

  <section class="hero">
    <div class="container hero-center">
      <span class="pill">⚡ New Release</span>
      <h1>Automate Your Team's Workflows with Precision</h1>
      <p>Connect your tools, streamline data pipelines, and boost developer productivity with zero configuration overhead.</p>
      <div class="cta-group">
        <button class="btn btn-primary btn-lg">Get Started Free</button>
        <button class="btn btn-secondary btn-lg">Watch Demo ➔</button>
      </div>
    </div>
  </section>

  <section id="features" class="section">
    <div class="container">
      <h2 class="title">Built for High-Growth Engineering Teams</h2>
      <div class="grid-3">
        <div class="card">
          <div class="icon">🔌</div>
          <h3>Instant Integrations</h3>
          <p>Connect with Number cloud tools out of the box using built-in webhook web specs.</p>
        </div>
        <div class="card">
          <div class="icon">🛡️</div>
          <h3>Enterprise Security</h3>
          <p>End-to-end data encryption with SOC2 compliance and automated audit trails.</p>
        </div>
        <div class="card">
          <div class="icon">⚡</div>
          <h3>Sub-Millisecond Speed</h3>
          <p>Optimized execution engine delivering lightning-fast pipeline runs.</p>
        </div>
      </div>
    </div>
  </section>

  <section id="pricing" class="section bg-alt">
    <div class="container">
      <h2 class="title">Flexible Plans for Every Stage</h2>
      <div class="pricing-toggle">
        <span>Monthly</span>
        <label class="switch"><input type="checkbox" id="billingToggle"><span class="slider"></span></label>
        <span>Annual <small class="discount">Save Number%</small></span>
      </div>

      <div class="grid-3">
        <div class="price-card">
          <h3>Starter</h3>
          <div class="price">Amount</div>
          <ul><li>Up to Number Users</li><li>Number Tasks/mo</li><li>Standard Support</li></ul>
          <button class="btn btn-secondary w-full">Start Starter</button>
        </div>
        <div class="price-card popular">
          <span class="pop-tag">Most Popular</span>
          <h3>Pro Team</h3>
          <div class="price">Amount</div>
          <ul><li>Up to Number Users</li><li>Number Tasks/mo</li><li>Priority Support</li></ul>
          <button class="btn btn-primary w-full">Start Pro Trial</button>
        </div>
        <div class="price-card">
          <h3>Enterprise</h3>
          <div class="price">Custom</div>
          <ul><li>Unlimited Users</li><li>Custom SLAs</li><li>Dedicated Manager</li></ul>
          <button class="btn btn-secondary w-full">Contact Sales</button>
        </div>
      </div>
    </div>
  </section>

  <section id="newsletter" class="section">
    <div class="container text-center">
      <h2 class="title">Stay Ahead with Weekly Product Updates</h2>
      <p style="color:#9ca3af; margin-bottom:1.5rem;">Subscribe to get product updates and engineering insights.</p>
      <form id="landingNewsForm" style="max-width:400px; margin:0 auto; display:flex; gap:0.5rem;">
        <input type="email" required placeholder="Enter your email" style="flex:1; padding:0.6rem 1rem; border-radius:8px; border:1px solid #374151; background:#1f2937; color:#fff;">
        <button type="submit" class="btn btn-primary">Subscribe</button>
      </form>
    </div>
  </section>

  <footer class="footer">
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} Code & Website Generator Inc. All rights reserved.</p>
    </div>
  </footer>
</body>
</html>`;

  const css = `* { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, sans-serif; }
body { background: #0b0f19; color: #f1f5f9; line-height: 1.5; }
.container { max-width: 1050px; margin: 0 auto; padding: 0 1.5rem; }
.header { position: sticky; top: 0; background: #111827; border-bottom: 1px solid #1f2937; z-index: 10; }
.nav-wrap { display: flex; align-items: center; justify-content: space-between; height: 64px; }
.brand { font-size: 1.2rem; font-weight: 700; color: #fff; text-decoration: none; }
.nav a { color: #9ca3af; text-decoration: none; margin: 0 1rem; font-weight: 500; }
.btn { padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; border: none; cursor: pointer; text-decoration: none; }
.btn-primary { background: #6366f1; color: #fff; }
.btn-secondary { background: #1f2937; color: #fff; }
.btn-lg { padding: 0.8rem 1.6rem; font-size: 1rem; }
.w-full { width: 100%; }
.hero { padding: 5rem 0; text-align: center; background: radial-gradient(circle at center, rgba(99,102,241,0.2), transparent 70%); }
.pill { background: rgba(99,102,241,0.15); color: #818cf8; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; }
.hero h1 { font-size: 2.8rem; margin: 1rem 0; max-width: 800px; margin-left: auto; margin-right: auto; }
.hero p { color: #9ca3af; font-size: 1.15rem; max-width: 600px; margin: 0 auto 2rem; }
.cta-group { display: flex; gap: 1rem; justify-content: center; }
.section { padding: 4rem 0; border-top: 1px solid #1f2937; }
.bg-alt { background: #111827; }
.text-center { text-align: center; }
.title { text-align: center; font-size: 2rem; margin-bottom: 3rem; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
.card { background: #1f2937; padding: 2rem; border-radius: 12px; border: 1px solid #374151; }
.icon { font-size: 2.5rem; margin-bottom: 1rem; }
.card h3 { margin-bottom: 0.5rem; }
.card p { color: #9ca3af; font-size: 0.9rem; }
.pricing-toggle { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-bottom: 2.5rem; }
.discount { background: #10b981; color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; }
.switch { position: relative; display: inline-block; width: 44px; height: 24px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #374151; transition: .3s; border-radius: 24px; }
.slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; }
input:checked + .slider { background-color: #6366f1; }
input:checked + .slider:before { transform: translateX(20px); }
.price-card { background: #1f2937; padding: 2rem; border-radius: 12px; border: 1px solid #374151; position: relative; }
.price-card.popular { border-color: #6366f1; transform: scale(1.03); }
.pop-tag { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: #6366f1; color: #fff; padding: 2px 10px; border-radius: 10px; font-size: 0.75rem; font-weight: 600; }
.price { font-size: 2rem; font-weight: 700; margin: 1rem 0; }
.price-card ul { list-style: none; margin-bottom: 1.5rem; color: #9ca3af; font-size: 0.9rem; }
.price-card li { margin-bottom: 0.5rem; }
.footer { padding: 2rem 0; text-align: center; color: #6b7280; font-size: 0.85rem; border-top: 1px solid #1f2937; }
@media(max-width: 768px) { .grid-3 { grid-template-columns: 1fr; } .price-card.popular { transform: none; } }`;

  const js = `document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('billingToggle');
  toggle?.addEventListener('change', () => {
    // Billing toggle
  });

  const form = document.getElementById('landingNewsForm');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thank you for subscribing to Code & Website Generator updates!');
    form.reset();
  });
});`;

  return { html, css, js };
}

// 3. Tech Blog Template Generator
function buildBlogTemplate(prompt) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code & Website Generator | Tech Journal</title>
  <link rel="stylesheet" href="style.css">
  <script src="script.js" defer></script>
</head>
<body>
  <header class="header">
    <div class="container nav-wrap">
      <a href="#" class="brand">📰 Code & Website Generator</a>
      <div class="search-box">
        <input type="text" id="searchInput" placeholder="Search articles...">
      </div>
    </div>
  </header>

  <main class="container main-layout">
    <section class="featured-post">
      <span class="tag">Featured Article</span>
      <h2>The Evolution of Framework-Free Web Architecture</h2>
      <p>Why modern Vanilla JavaScript, CSS custom properties, and native Web APIs are outperforming heavy JavaScript bundles in 2026.</p>
      <div class="meta"><span>By Author Name</span> • <span>Number min read</span></div>
    </section>

    <div class="content-grid">
      <div class="articles-list" id="articlesList">
        <article class="post-card" data-title="Mastering CSS Grid & Flexbox Layouts">
          <span class="cat">CSS</span>
          <h3>Mastering CSS Grid & Flexbox Layouts</h3>
          <p>Learn how to design adaptive responsive layouts without media query bloat.</p>
          <div class="meta">Number min read</div>
        </article>
        <article class="post-card" data-title="Sub-Millisecond Web Performance Optimization">
          <span class="cat">Performance</span>
          <h3>Sub-Millisecond Web Performance Optimization</h3>
          <p>Eliminate render-blocking resources and optimize core web vitals.</p>
          <div class="meta">Number min read</div>
        </article>
        <article class="post-card" data-title="Understanding Modern ES6+ JavaScript Generators">
          <span class="cat">JavaScript</span>
          <h3>Understanding Modern ES6+ JavaScript Generators</h3>
          <p>A deep dive into async iterators, promises, and clean DOM manipulation.</p>
          <div class="meta">Number min read</div>
        </article>
      </div>

      <aside class="sidebar">
        <div class="widget">
          <h4>Subscribe to Newsletter</h4>
          <p>Get weekly web engineering insights delivered straight to your inbox.</p>
          <form id="newsForm"><input type="email" required placeholder="Enter email..."><button class="btn">Subscribe</button></form>
          <div id="subNotice" class="notice hidden">Subscribed successfully!</div>
        </div>
      </aside>
    </div>
  </main>
</body>
</html>`;

  const css = `* { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, sans-serif; }
body { background: #0f172a; color: #f8fafc; line-height: 1.6; }
.container { max-width: 1000px; margin: 0 auto; padding: 0 1.5rem; }
.header { background: #1e293b; border-bottom: 1px solid #334155; padding: 1rem 0; }
.nav-wrap { display: flex; align-items: center; justify-content: space-between; }
.brand { font-size: 1.25rem; font-weight: 700; color: #fff; text-decoration: none; }
.search-box input { background: #0f172a; border: 1px solid #334155; color: #fff; padding: 0.5rem 1rem; border-radius: 20px; outline: none; }
.main-layout { padding: 2.5rem 0; }
.featured-post { background: #1e293b; border: 1px solid #334155; padding: 2rem; border-radius: 12px; margin-bottom: 2rem; }
.tag { background: #6366f1; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
.featured-post h2 { font-size: 1.8rem; margin: 0.75rem 0; }
.featured-post p { color: #94a3b8; font-size: 1rem; margin-bottom: 1rem; }
.meta { color: #64748b; font-size: 0.8rem; }
.content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }
.post-card { background: #1e293b; border: 1px solid #334155; padding: 1.25rem; border-radius: 10px; margin-bottom: 1rem; }
.cat { color: #818cf8; font-size: 0.75rem; font-weight: 600; }
.post-card h3 { font-size: 1.1rem; margin: 0.4rem 0; }
.post-card p { color: #94a3b8; font-size: 0.85rem; margin-bottom: 0.5rem; }
.sidebar .widget { background: #1e293b; border: 1px solid #334155; padding: 1.5rem; border-radius: 12px; }
.widget h4 { margin-bottom: 0.5rem; }
.widget p { color: #94a3b8; font-size: 0.85rem; margin-bottom: 1rem; }
.widget input { width: 100%; padding: 0.6rem; background: #0f172a; border: 1px solid #334155; color: #fff; border-radius: 6px; margin-bottom: 0.5rem; }
.btn { width: 100%; padding: 0.6rem; background: #6366f1; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
.notice { margin-top: 0.5rem; color: #10b981; font-size: 0.8rem; }
.hidden { display: none; }
@media(max-width: 768px) { .content-grid { grid-template-columns: 1fr; } }`;

  const js = `document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const cards = document.querySelectorAll('.post-card');
  searchInput?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    cards.forEach(card => {
      const title = card.getAttribute('data-title')?.toLowerCase() || '';
      card.style.display = title.includes(term) ? 'block' : 'none';
    });
  });

  const form = document.getElementById('newsForm');
  const notice = document.getElementById('subNotice');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    notice?.classList.remove('hidden');
    form.reset();
  });
});`;

  return { html, css, js };
}

// 5. Executive Dashboard Template Generator
function buildDashboardTemplate(prompt) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code & Website Generator Analytics</title>
  <link rel="stylesheet" href="style.css">
  <script src="script.js" defer></script>
</head>
<body>
  <div class="dash-layout">
    <aside class="sidebar">
      <div class="logo">📊 Code & Website Generator</div>
      <nav class="nav">
        <a href="#" class="active">📊 Overview</a>
        <a href="#">📈 Analytics</a>
        <a href="#">👥 Users</a>
        <a href="#">⚙️ Settings</a>
      </nav>
    </aside>

    <main class="main-content">
      <header class="topbar">
        <h2>Executive Dashboard Overview</h2>
        <span class="user-badge">Admin User</span>
      </header>

      <div class="kpi-grid">
        <div class="kpi-card">
          <span class="kpi-title">Total Revenue</span>
          <div class="kpi-value">Amount</div>
          <span class="trend pos">+Number% ↑</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-title">Active Subscriptions</span>
          <div class="kpi-value">Number</div>
          <span class="trend pos">+Number% ↑</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-title">Avg Latency</span>
          <div class="kpi-value">Number ms</div>
          <span class="trend pos">-Number% ↓</span>
        </div>
      </div>

      <section class="table-card">
        <h3>Recent Transactions</h3>
        <table>
          <thead><tr><th>Customer</th><th>Status</th><th>Amount</th></tr></thead>
          <tbody>
            <tr><td>Acme Corp</td><td><span class="st active">Paid</span></td><td>Amount</td></tr>
            <tr><td>Starlight Tech</td><td><span class="st active">Paid</span></td><td>Amount</td></tr>
            <tr><td>Nexus Soft</td><td><span class="st pending">Pending</span></td><td>Amount</td></tr>
          </tbody>
        </table>
      </section>
    </main>
  </div>
</body>
</html>`;

  const css = `* { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, sans-serif; }
body { background: #0b0f19; color: #f1f5f9; }
.dash-layout { display: flex; min-height: 100vh; }
.sidebar { width: 220px; background: #111827; border-right: 1px solid #1f2937; padding: 1.5rem; }
.logo { font-size: 1.1rem; font-weight: 700; margin-bottom: 2rem; color: #6366f1; }
.nav a { display: block; color: #9ca3af; text-decoration: none; padding: 0.6rem 0; font-weight: 500; }
.nav a.active, .nav a:hover { color: #fff; }
.main-content { flex: 1; padding: 2rem; }
.topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.user-badge { background: #1f2937; padding: 4px 12px; border-radius: 12px; font-size: 0.8rem; }
.kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
.kpi-card { background: #1f2937; border: 1px solid #374151; padding: 1.5rem; border-radius: 12px; }
.kpi-title { color: #9ca3af; font-size: 0.85rem; }
.kpi-value { font-size: 1.8rem; font-weight: 700; margin: 0.4rem 0; }
.trend.pos { color: #10b981; font-size: 0.8rem; font-weight: 600; }
.table-card { background: #1f2937; border: 1px solid #374151; padding: 1.5rem; border-radius: 12px; }
.table-card h3 { margin-bottom: 1rem; }
table { width: 100%; border-collapse: collapse; text-align: left; }
th, td { padding: 0.75rem 0; border-bottom: 1px solid #374151; }
th { color: #9ca3af; font-size: 0.85rem; }
.st { padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; font-weight: 600; }
.st.active { background: rgba(16,185,129,0.2); color: #10b981; }
.st.pending { background: rgba(245,158,11,0.2); color: #f59e0b; }
@media(max-width: 768px) { .dash-layout { flex-direction: column; } .kpi-grid { grid-template-columns: 1fr; } }`;

  const js = `document.addEventListener('DOMContentLoaded', () => {
  console.log('Code & Website Generator Dashboard Ready');
});`;

  return { html, css, js };
}

// System prompt guidelines
const BASE_SYSTEM_PROMPT = `You are Code & Website Generator, an expert front-end web developer AI.
Your task is to generate complete, modern, production-ready, responsive, framework-free static websites based on user prompts.

CRITICAL INSTRUCTIONS:
1. Always generate EXACTLY 3 files: index.html, style.css, script.js.
2. DO NOT use external CSS or JS frameworks like Tailwind CDN, Bootstrap, React, Vue, jQuery, etc. Write pure Vanilla HTML5, CSS3, and JavaScript (ES6+).
3. index.html MUST link style.css (<link rel="stylesheet" href="style.css">) and script.js (<script src="script.js" defer></script>).
4. CSS must be modern: responsive, flexbox/grid, CSS custom properties, clean typography.
5. In header/logo/footer branding, use "Code & Website Generator". Use generic placeholders like "Name" for developer portfolio names, "Price" or "Amount" instead of currency figures, and "Number" instead of quantitative figures.
6. Return your response STRICTLY as a JSON object with keys "html", "css", and "js".`;

// Router: Dispatch call to Gemini, Ollama, or Offline Specification Generator
async function callAI(prompt, systemPrompt, model) {
  const selectedModel = (model || '').toLowerCase();
  
  if (selectedModel.includes('offline-spec-generator')) {
    return generateOfflineCode(prompt);
  }

  if (selectedModel.startsWith('gemini') || (!selectedModel && process.env.GEMINI_API_KEY)) {
    try {
      return await callGemini(prompt, systemPrompt, model || GEMINI_MODEL);
    } catch (geminiErr) {
      try {
        return await callOllama(prompt, systemPrompt, DEFAULT_MODEL);
      } catch (ollamaErr) {
        return generateOfflineCode(prompt);
      }
    }
  } else {
    try {
      return await callOllama(prompt, systemPrompt, model || DEFAULT_MODEL);
    } catch (ollamaErr) {
      return generateOfflineCode(prompt);
    }
  }
}

// Helper: Parse AI response to extract html, css, js
function extractCodeFromResponse(rawResponse) {
  if (typeof rawResponse === 'object' && rawResponse.html) {
    return rawResponse;
  }

  let html = '';
  let css = '';
  let js = '';

  if (!rawResponse || typeof rawResponse !== 'string') {
    return { html, css, js };
  }

  const cleaned = rawResponse.trim();

  // 1. Try Direct JSON Parsing
  try {
    const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    const jsonCandidate = jsonMatch ? jsonMatch[1] : cleaned;
    
    const firstBrace = jsonCandidate.indexOf('{');
    const lastBrace = jsonCandidate.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const jsonStr = jsonCandidate.substring(firstBrace, lastBrace + 1);
      const parsed = JSON.parse(jsonStr);
      if (parsed.html || parsed.css || parsed.js) {
        return {
          html: parsed.html || '',
          css: parsed.css || '',
          js: parsed.js || ''
        };
      }
    }
  } catch (e) {
    // JSON parse failed
  }

  // 2. Extract markdown code blocks for html, css, js
  const htmlMatch = cleaned.match(/```html\s*([\s\S]*?)\s*```/i);
  if (htmlMatch) html = htmlMatch[1].trim();

  const cssMatch = cleaned.match(/```css\s*([\s\S]*?)\s*```/i);
  if (cssMatch) css = cssMatch[1].trim();

  const jsMatch = cleaned.match(/```(?:js|javascript)\s*([\s\S]*?)\s*```/i);
  if (jsMatch) js = jsMatch[1].trim();

  return { html, css, js };
}

// GET /api/models - List local Ollama, Google Gemini, and Offline Specs Generator
app.get('/api/models', async (req, res) => {
  const models = [];
  let ollamaConnected = false;
  let geminiConfigured = false;

  models.push('offline-spec-generator (Built-in Spec Engine • 0 Keys)');

  const currentApiKey = process.env.GEMINI_API_KEY;
  if (currentApiKey && currentApiKey.trim() !== '' && !currentApiKey.includes('your_gemini_api_key')) {
    geminiConfigured = true;
    models.push('gemini-1.5-flash (Google Gemini API)');
    models.push('gemini-1.5-pro (Google Gemini API)');
    models.push('gemini-2.0-flash (Google Gemini API)');
  }

  try {
    const response = await fetch(`${OLLAMA_HOST.replace(/\/$/, '')}/api/tags`);
    if (response.ok) {
      const data = await response.json();
      const localModels = (data.models || []).map(m => `${m.name} (Local Ollama)`);
      models.push(...localModels);
      if (localModels.length > 0) ollamaConnected = true;
    }
  } catch (err) {
    // Ollama unreachable
  }

  res.json({
    connected: true,
    models: models,
    providers: {
      offline: true,
      gemini: geminiConfigured,
      ollama: ollamaConnected
    }
  });
});

// POST /api/generate - Generate website files from prompt
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, model, template } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    let userMessage = prompt;
    if (template) {
      userMessage = `[Category: ${template}]\n${prompt}`;
    }

    const aiRawResponse = await callAI(userMessage, BASE_SYSTEM_PROMPT, model);
    const code = extractCodeFromResponse(aiRawResponse);

    res.json({
      success: true,
      html: code.html || '<!DOCTYPE html><html><body><h1>Code & Website Generator</h1></body></html>',
      css: code.css || '/* Modern Styles */\nbody { font-family: sans-serif; padding: 20px; }',
      js: code.js || '// Interactive scripts\nconsole.log("Website loaded successfully");'
    });
  } catch (err) {
    console.error('Generate Endpoint Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/improve - Enhance design & functionality
app.post('/api/improve', async (req, res) => {
  try {
    const { currentCode, prompt, model } = req.body;
    const aiRawResponse = await callAI(prompt || 'Improve design layout', BASE_SYSTEM_PROMPT, model);
    const code = extractCodeFromResponse(aiRawResponse);

    res.json({
      success: true,
      html: code.html || currentCode.html,
      css: code.css || currentCode.css,
      js: code.js || currentCode.js
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/fix - Diagnose and fix code errors
app.post('/api/fix', async (req, res) => {
  try {
    const { currentCode, errorDetails, model } = req.body;
    const aiRawResponse = await callAI(errorDetails || 'Fix code errors', BASE_SYSTEM_PROMPT, model);
    const code = extractCodeFromResponse(aiRawResponse);

    res.json({
      success: true,
      html: code.html || currentCode.html,
      css: code.css || currentCode.css,
      js: code.js || currentCode.js
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(` Code & Website Generator server running at http://localhost:${PORT}`);
  console.log(` Dynamic Prompt Web Specs Engine: Active ✅`);
  console.log(`=================================================`);
});
