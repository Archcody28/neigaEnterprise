import { API_BASE } from "./config.js";
import { openWhatsApp } from "./whatsapp.js";
import { showToast } from "./toast.js";
import { updateMiniCart } from "./cart.js";

// ================= LOAD PRODUCTS FROM BACKEND =================
export async function loadProducts() {
  const container = document.getElementById("products-container");

  if (!container) return;
container.innerHTML = `
  <p class="loading-state">
    Loading products...
  </p>
`;
  try {
    const res = await fetch(`${API_BASE}/api/products/all`);
    const products = await res.json();

    if (!products.length) {
      container.innerHTML = "<p>No products available.</p>";
      return;
    }

    container.innerHTML = products.map(product => {
      const imageUrl = product.image.startsWith("http")
        ? product.image
        : `${API_BASE}${product.image}`;

      return `
        <article class="product-card reveal"
          data-id="${product._id}"
          data-category="${product.category}"
          data-name="${product.name}"
          data-price="${product.price}"
          data-image="${imageUrl}">

          <img src="${imageUrl}" alt="${product.name}" loading="lazy">

          <div class="product-content">
            <h3>${product.name}</h3>
            <span class="price">₦${product.price}</span>
            <p>${product.description || ""}</p>

            <button class="add-to-cart button button-primary">
              Add to Cart
            </button>

            <button class="buy-now button button-secondary">
              Buy via WhatsApp
            </button>
          </div>
        </article>
      `;
    }).join("");

    initProducts();
    trackViewedProducts();
    initProductFilters();

    if (typeof window.initReveal === "function") {
      window.initReveal(container);
    }

  } catch (error) {
    console.error(error);
    container.innerHTML = "<p>Failed to load products.</p>";
  }
}

// ================= INIT PRODUCTS =================
export function initProducts() {
  document
  .querySelectorAll(".product-card")
  .forEach(card => {
    const cloned = card.cloneNode(true);
    card.parentNode.replaceChild(cloned, card);
  });
  document.querySelectorAll(".product-card").forEach(card => {
    const buyBtn = card.querySelector(".buy-now");
    const cartBtn = card.querySelector(".add-to-cart");

    // ADD TO CART
    if (cartBtn) {
      cartBtn.addEventListener("click", (e) => {
        e.stopPropagation();

        const product = {
          name: card.dataset.name,
          price: Number(card.dataset.price),
          image: card.dataset.image,
          qty: 1
        };

        let cart = JSON.parse(localStorage.getItem("cart")) || [];

        const existing = cart.find(item => item.name === product.name);

        if (existing) {
          existing.qty += 1;
        } else {
          cart.push(product);
        }

        localStorage.setItem("cart", JSON.stringify(cart));

        updateMiniCart();

        if (typeof window.updateCart === "function") {
          window.updateCart();
        }

        showToast({
          name: product.name,
          price: product.price,
          image: product.image
        }); 
    if (typeof window.animateAddToCart === "function") {
  window.animateAddToCart(cartBtn);
}    
      });
    }


    // BUY NOW
    if (buyBtn) {
      buyBtn.addEventListener("click", (e) => {
        e.stopPropagation();

        const message = `
Hello, I'm interested in this product:

🛍️ ${card.dataset.name}
💰 Price: ₦${card.dataset.price}
🖼️ Image: ${card.dataset.image}

Please confirm availability.
        `;

        openWhatsApp(message);
      });
    }

    // PRODUCT DETAIL
    card.addEventListener("click", (e) => {
      if (
        e.target.closest(".add-to-cart") ||
        e.target.closest(".buy-now")
      ) return;

      const product = {
        name: card.dataset.name,
        price: card.dataset.price,
        image: card.dataset.image,
        description: card.querySelector("p")?.textContent || ""
      };

      localStorage.setItem("selectedProduct", JSON.stringify(product));
      window.location.href = "product-detail.html";
    });
  });
}

// ================= TRACK VIEWED =================
let viewed = JSON.parse(localStorage.getItem("viewed")) || [];

export function trackViewedProducts() {
  document.querySelectorAll(".product-card").forEach(card => {
    card.addEventListener("click", (e) => {
      if (
        e.target.closest(".add-to-cart") ||
        e.target.closest(".buy-now")
      ) return;

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

// ================= FILTERS + SEARCH =================
function initProductFilters() {
  const filterButtons = document.querySelectorAll(".filters button");
  const searchInput = document.getElementById("search");

  const applyFilters = () => {
    const activeBtn =
      document.querySelector(".filters button.active") ||
      document.querySelector('.filters button[data-filter="all"]');

    const activeFilter = activeBtn?.dataset.filter || "all";
    const searchValue = (searchInput?.value || "").toLowerCase().trim();

    document.querySelectorAll(".product-card").forEach(card => {
      const category = card.dataset.category || "";
      const name = (card.dataset.name || "").toLowerCase();

      const normalize = value =>
  (value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

const matchesFilter =
  normalize(activeFilter) === "all" ||
  normalize(category) === normalize(activeFilter);

      const matchesSearch = name.includes(searchValue);

      card.style.display = matchesFilter && matchesSearch ? "" : "none";
    });
  };

  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      applyFilters();
    });
  });

  searchInput?.addEventListener("input", applyFilters);

  applyFilters();
}
const popup =
  document.getElementById("email-popup");

if (
  popup &&
  !localStorage.getItem("visitorEmail")
) {

  setTimeout(() => {
    popup.classList.add("active");
  }, 12000);

}

document
  .getElementById("close-email-popup")
  ?.addEventListener("click", () => {

    popup.classList.remove("active");

  });
document
  .getElementById("email-capture-form")
  ?.addEventListener("submit", async e => {

    e.preventDefault();

    const email =
      document
        .getElementById("visitor-email")
        .value;

    localStorage.setItem(
  "visitorEmail",
  email
);

await fetch(
  `${API_BASE}/api/subscribers`,
  {
    method: "POST",

    headers: {
      "Content-Type":
        "application/json"
    },

    body: JSON.stringify({
      email
    })
  }
);

    popup.classList.remove("active");

  });