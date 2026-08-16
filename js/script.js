/* ============================================
   Trendora — Store Logic (products, cart, UI)
   ============================================ */

// ---------- Product catalog ----------
const PRODUCTS = [
  { id: 1,  name: "Aura Wireless Headphones", cat: "electronics", price: 89.99,  oldPrice: 129.99, emoji: "🎧", bg: "linear-gradient(135deg,#e0c3fc,#8ec5fc)", rating: 4.9, reviews: 320, badge: "sale" },
  { id: 2,  name: "Pulse Smart Watch",        cat: "electronics", price: 149.00, oldPrice: null,   emoji: "⌚", bg: "linear-gradient(135deg,#fbc2eb,#a6c1ee)", rating: 4.8, reviews: 214, badge: "hot" },
  { id: 3,  name: "Nova Bluetooth Speaker",   cat: "electronics", price: 59.50,  oldPrice: 79.99,  emoji: "🔊", bg: "linear-gradient(135deg,#a1c4fd,#c2e9fb)", rating: 4.7, reviews: 188, badge: "sale" },
  { id: 4,  name: "Vision Pro Camera",        cat: "electronics", price: 399.00, oldPrice: null,   emoji: "📷", bg: "linear-gradient(135deg,#fddb92,#d1fdff)", rating: 4.9, reviews: 96,  badge: "new" },
  { id: 5,  name: "Classic Denim Jacket",     cat: "fashion",     price: 64.99,  oldPrice: 89.99,  emoji: "🧥", bg: "linear-gradient(135deg,#c2e9fb,#a1c4fd)", rating: 4.6, reviews: 142, badge: "sale" },
  { id: 6,  name: "Cloud Runner Sneakers",    cat: "fashion",     price: 74.50,  oldPrice: null,   emoji: "👟", bg: "linear-gradient(135deg,#fff1eb,#ace0f9)", rating: 4.8, reviews: 267, badge: "hot" },
  { id: 7,  name: "Urban Street Hoodie",      cat: "fashion",     price: 42.00,  oldPrice: 55.00,  emoji: "👕", bg: "linear-gradient(135deg,#fdcbf1,#e6dee9)", rating: 4.5, reviews: 178, badge: null },
  { id: 8,  name: "Aviator Sunglasses",       cat: "accessories", price: 29.99,  oldPrice: 45.00,  emoji: "🕶️", bg: "linear-gradient(135deg,#f6d365,#fda085)", rating: 4.7, reviews: 203, badge: "sale" },
  { id: 9,  name: "Voyager Leather Backpack", cat: "accessories", price: 88.00,  oldPrice: null,   emoji: "🎒", bg: "linear-gradient(135deg,#d4fc79,#96e6a1)", rating: 4.9, reviews: 154, badge: "new" },
  { id: 10, name: "Minimal Quartz Wallet",    cat: "accessories", price: 24.50,  oldPrice: null,   emoji: "👛", bg: "linear-gradient(135deg,#e2ebf0,#cfd9df)", rating: 4.4, reviews: 89,  badge: null },
  { id: 11, name: "Lumen Desk Lamp",          cat: "home",        price: 39.99,  oldPrice: 54.99,  emoji: "💡", bg: "linear-gradient(135deg,#fff6b7,#f6416c22)", rating: 4.6, reviews: 121, badge: "sale" },
  { id: 12, name: "Zen Ceramic Vase Set",     cat: "home",        price: 34.00,  oldPrice: null,   emoji: "🏺", bg: "linear-gradient(135deg,#fbc7a4,#fdeff9)", rating: 4.8, reviews: 76,  badge: "new" },
];

const FREE_SHIP_AT = 75;

// ---------- State ----------
let cart = JSON.parse(localStorage.getItem("trendora-cart") || "[]");
let activeCat = "all";
let searchTerm = "";

// ---------- DOM refs ----------
const $ = (id) => document.getElementById(id);
const grid = $("productGrid");
const noResults = $("noResults");
const cartDrawer = $("cartDrawer");
const overlay = $("overlay");
const toast = $("toast");

// ---------- Helpers ----------
const money = (n) => "$" + n.toFixed(2);
const stars = (r) => "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));
const saveCart = () => localStorage.setItem("trendora-cart", JSON.stringify(cart));

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 2200);
}

// ---------- Render products ----------
function renderProducts() {
  const list = PRODUCTS.filter((p) => {
    const matchCat = activeCat === "all" || p.cat === activeCat;
    const matchSearch = p.name.toLowerCase().includes(searchTerm);
    return matchCat && matchSearch;
  });

  noResults.hidden = list.length > 0;

  grid.innerHTML = list
    .map(
      (p, i) => `
    <article class="product-card" style="animation-delay:${i * 0.05}s">
      <div class="product-img" style="background:${p.bg}">
        ${p.badge ? `<span class="badge ${p.badge}">${p.badge.toUpperCase()}</span>` : ""}
        ${p.emoji}
      </div>
      <div class="product-info">
        <div class="product-cat">${p.cat}</div>
        <h3 class="product-name">${p.name}</h3>
        <div class="product-rating">${stars(p.rating)}<span>${p.rating} (${p.reviews})</span></div>
        <div class="product-bottom">
          <div class="product-price">${money(p.price)}${p.oldPrice ? `<del>${money(p.oldPrice)}</del>` : ""}</div>
          <button class="add-btn" data-add="${p.id}" aria-label="Add ${p.name} to cart">+</button>
        </div>
      </div>
    </article>`
    )
    .join("");
}

// ---------- Cart logic ----------
function addToCart(id) {
  const item = cart.find((c) => c.id === id);
  if (item) item.qty++;
  else cart.push({ id, qty: 1 });
  saveCart();
  renderCart();
  const product = PRODUCTS.find((p) => p.id === id);
  showToast(`✅ ${product.name} added to cart`);
  $("cartCount").classList.remove("pop");
  void $("cartCount").offsetWidth; // restart animation
  $("cartCount").classList.add("pop");
}

function changeQty(id, delta) {
  const item = cart.find((c) => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter((c) => c.id !== id);
  saveCart();
  renderCart();
}

function removeItem(id) {
  cart = cart.filter((c) => c.id !== id);
  saveCart();
  renderCart();
}

function cartTotals() {
  let count = 0, total = 0;
  for (const c of cart) {
    const p = PRODUCTS.find((p) => p.id === c.id);
    if (!p) continue;
    count += c.qty;
    total += p.price * c.qty;
  }
  return { count, total };
}

function renderCart() {
  const { count, total } = cartTotals();

  $("cartCount").textContent = count;
  $("cartHeadCount").textContent = `(${count})`;
  $("cartTotal").textContent = money(total);

  // Free-shipping progress
  const pct = Math.min((total / FREE_SHIP_AT) * 100, 100);
  $("barFill").style.width = pct + "%";
  $("shipMsg").innerHTML =
    total >= FREE_SHIP_AT
      ? "🎉 You've unlocked <strong>FREE shipping!</strong>"
      : `Spend <strong>${money(FREE_SHIP_AT - total)}</strong> more for free shipping 🚚`;

  const box = $("cartItems");
  if (cart.length === 0) {
    box.innerHTML = `<div class="cart-empty"><span>🛒</span>Your cart is empty.<br />Add something you love!</div>`;
    return;
  }

  box.innerHTML = cart
    .filter((c) => PRODUCTS.some((p) => p.id === c.id))
    .map((c) => {
      const p = PRODUCTS.find((p) => p.id === c.id);
      return `
      <div class="cart-item">
        <div class="cart-item-img" style="background:${p.bg}">${p.emoji}</div>
        <div class="cart-item-info">
          <h5>${p.name}</h5>
          <div class="price">${money(p.price)}</div>
          <div class="qty-row">
            <div class="qty">
              <button data-dec="${p.id}" aria-label="Decrease">−</button>
              <b>${c.qty}</b>
              <button data-inc="${p.id}" aria-label="Increase">+</button>
            </div>
            <button class="remove-item" data-remove="${p.id}">Remove</button>
          </div>
        </div>
      </div>`;
    })
    .join("");
}

// ---------- Drawer / modal ----------
function openCart() {
  cartDrawer.classList.add("open");
  overlay.classList.add("show");
  document.body.style.overflow = "hidden";
}
function closeCart() {
  cartDrawer.classList.remove("open");
  overlay.classList.remove("show");
  document.body.style.overflow = "";
}

// ---------- Events ----------
document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-add],[data-inc],[data-dec],[data-remove]");
  if (!t) return;
  if (t.dataset.add) addToCart(+t.dataset.add);
  if (t.dataset.inc) changeQty(+t.dataset.inc, 1);
  if (t.dataset.dec) changeQty(+t.dataset.dec, -1);
  if (t.dataset.remove) removeItem(+t.dataset.remove);
});

$("cartBtn").addEventListener("click", openCart);
$("closeCart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCart(); });

$("clearCart").addEventListener("click", () => {
  if (!cart.length) return;
  cart = [];
  saveCart();
  renderCart();
  showToast("🗑️ Cart cleared");
});

$("checkoutBtn").addEventListener("click", () => {
  if (!cart.length) { showToast("Your cart is empty 🛒"); return; }
  $("orderId").textContent = "#TR-" + Math.floor(1000 + Math.random() * 9000);
  cart = [];
  saveCart();
  renderCart();
  closeCart();
  $("successModal").classList.add("show");
});

$("closeModal").addEventListener("click", () => $("successModal").classList.remove("show"));

$("dealBtn").addEventListener("click", () => { addToCart(1); openCart(); });

// Category tabs
$("filterTabs").addEventListener("click", (e) => {
  const tab = e.target.closest(".tab");
  if (!tab) return;
  document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
  tab.classList.add("active");
  activeCat = tab.dataset.cat;
  renderProducts();
});

// Live search
$("searchInput").addEventListener("input", (e) => {
  searchTerm = e.target.value.trim().toLowerCase();
  renderProducts();
});

// Newsletter
$("newsForm").addEventListener("submit", (e) => {
  e.preventDefault();
  showToast("💌 Subscribed! Check your inbox for 10% off");
  e.target.reset();
});

// Mobile menu
$("hamburger").addEventListener("click", () => {
  $("hamburger").classList.toggle("open");
  $("navLinks").classList.toggle("open");
});
$("navLinks").addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    $("hamburger").classList.remove("open");
    $("navLinks").classList.remove("open");
  }
});

// Navbar shadow + active link on scroll
window.addEventListener("scroll", () => {
  $("navbar").classList.toggle("scrolled", window.scrollY > 10);
});

// ---------- Init ----------
renderProducts();
renderCart();
