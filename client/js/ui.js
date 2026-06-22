// ================= INIT UI =================
export function initUI() {
  initReveal();
  trackViewedProducts();
}

// ================= REVEAL ANIMATION =================
function initReveal(scope = document) {
  const elements = scope.querySelectorAll(".reveal");
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("is-visible");
      obs.unobserve(entry.target);
    });
  }, {
    threshold: 0.08,
    rootMargin: "0px 0px -40px 0px"
  });

  elements.forEach((el, i) => {
    // soft stagger only for nearby siblings
    el.style.transitionDelay = `${Math.min(i * 0.04, 0.18)}s`;
    observer.observe(el);
  });
}


// ================= TRACK VIEWED PRODUCTS =================
function trackViewedProducts() {
  const cards = document.querySelectorAll(".product-card");
  if (!cards.length) return;

  let viewed = JSON.parse(localStorage.getItem("viewed")) || [];

  cards.forEach(card => {
    card.addEventListener("click", () => {
      const product = {
        name: card.dataset.name,
        image: card.dataset.image,
        price: card.dataset.price
      };

      viewed = viewed.filter(p => p.name !== product.name);
      viewed.unshift(product);
      viewed = viewed.slice(0, 4);

      localStorage.setItem("viewed", JSON.stringify(viewed));
    });
  });
}

// ================= RECENT + LIVE =================
export function initRecentAndLive() {
  renderRecent();
  startLivePurchase();
}

// ================= RECENT PRODUCTS =================
function renderRecent() {
  const container = document.getElementById("recent-container");
  if (!container) return;

  const viewed = JSON.parse(localStorage.getItem("viewed")) || [];

  container.innerHTML = viewed.map(item => `
    <div class="recent-item">
      <img src="${item.image}" />
      <p>${item.name}</p>
      <span>₦${item.price}</span>
    </div>
  `).join("");
}

// ================= LIVE PURCHASE =================
function startLivePurchase() {
  const toast = document.getElementById("live-toast");
  const products = document.querySelectorAll(".product-card");

  if (!toast || !products.length) return;

  const names = ["John", "Mary", "David", "Sarah", "Michael"];

  let running = true;

  const show = () => {
    if (!running) return;

    const name = names[Math.floor(Math.random() * names.length)];
    const product = products[Math.floor(Math.random() * products.length)];

    toast.textContent = `${name} just bought ${product.dataset.name}`;
    toast.classList.add("show");

    setTimeout(() => toast.classList.remove("show"), 3500);

    setTimeout(show, Math.random() * 12000 + 8000);
  };

  show();
}



// ================= ADD TO CART ANIMATION =================
export function animateAddToCart(button) {
  const card = button.closest(".product-card");
  if (!card) return;

  const img = card.querySelector("img");
  const cartIcon =
  document.getElementById("cart-icon");

if (!img) return;

if (!cartIcon) {
  console.warn("Cart icon not found");
  return;
}

if (!img.complete) return;

  const imgRect = img.getBoundingClientRect();
  const cartRect = cartIcon.getBoundingClientRect();

  const flying = img.cloneNode(true);

  Object.assign(flying.style, {
    position: "fixed",
    left: imgRect.left + "px",
    top: imgRect.top + "px",
    width: imgRect.width + "px",
    height: imgRect.height + "px",
    borderRadius: "16px",
    objectFit: "cover",
    zIndex: "9999",
    pointerEvents: "none",
    willChange: "transform, opacity"
  });

  document.body.appendChild(flying);

flying.style.transform = "translate3d(0,0,0)";
  let startX = imgRect.left;
  let startY = imgRect.top;

  let endX = cartRect.left + cartRect.width / 2 - 12;
  let endY = cartRect.top + cartRect.height / 2 - 12;

  const duration = 700;
  const startTime = performance.now();

  const controlX = (startX + endX) / 2;
  const controlY = startY - 120;

  function animate(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const t = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

    const x =
      (1 - t) * (1 - t) * startX +
      2 * (1 - t) * t * controlX +
      t * t * endX;

    const y =
      (1 - t) * (1 - t) * startY +
      2 * (1 - t) * t * controlY +
      t * t * endY;

    const scale = 1 - t * 0.7;

    flying.style.transform =
  `translate3d(${x - startX}px, ${y - startY}px, 0) scale(${scale})`;
    flying.style.opacity = 1 - t * 0.7;

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      finish();
    }
  }

  requestAnimationFrame(animate);

  function finish() {
    flying.remove();

   cartIcon.classList.remove("cart-bounce");

void cartIcon.offsetWidth;

cartIcon.classList.add("cart-bounce");

    showPlusOne(cartRect);
  }
}

// ================= +1 FLOAT =================
function showPlusOne(rect) {
  const el = document.createElement("div");

  el.textContent = "+1";
  el.className = "cart-float";

  Object.assign(el.style, {
    position: "fixed",
    left: rect.left + "px",
    top: rect.top + "px",
    fontWeight: "700",
    color: "#C8A96A",
    pointerEvents: "none",
    zIndex: "9999"
  });

  document.body.appendChild(el);

  el.animate(
    [
      { transform: "translateY(0) scale(1)", opacity: 1 },
      { transform: "translateY(-30px) scale(1.4)", opacity: 1 },
      { transform: "translateY(-60px) scale(0.9)", opacity: 0 }
    ],
    {
      duration: 700,
      easing: "cubic-bezier(.22,1,.36,1)"
    }
  );

  setTimeout(() => el.remove(), 700);
}

let testimonialIntervals = [];

export function initTestimonialWall() {

  // =========================
  // CLEAR OLD INTERVALS
  // =========================
  testimonialIntervals.forEach(clearInterval);
  testimonialIntervals = [];

  const columns =
    document.querySelectorAll(".testimonial-column");

  if (!columns.length) return;

  columns.forEach((column, colIndex) => {

    const cards =
      column.querySelectorAll(".t-card");

    if (!cards.length) return;

    let current = 0;

    // =========================
    // RESET STATES
    // =========================
    cards.forEach((card, i) => {
      card.classList.remove(
        "active",
        "flipped"
      );

      if (i === 0) {
        card.classList.add("active");
      }
    });

    // =========================
    // VERTICAL SLIDER
    // =========================
    const slideInterval = setInterval(() => {

      cards[current]
        .classList.remove("active");

      current++;

      if (current >= cards.length) {
        current = 0;
      }

      cards[current]
        .classList.add("active");

    }, 6000 + colIndex * 500);

    testimonialIntervals.push(
      slideInterval
    );

    // =========================
    // CARD FLIP
    // =========================
    cards.forEach((card, i) => {

      let flipped = false;

      const flipInterval = setInterval(() => {

        flipped = !flipped;

        card.classList.toggle(
          "flipped",
          flipped
        );

      }, 4000 + i * 300);

      testimonialIntervals.push(
        flipInterval
      );

    });

  });

}
window.initReveal = initReveal;
window.animateAddToCart = animateAddToCart;