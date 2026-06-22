import { createOrder } from "./api.js";
import { openWhatsApp } from "./whatsapp.js";
import { animateAddToCart } from "./ui.js";
import { showToast } from "./toast.js";

// GLOBAL CART
let cart = JSON.parse(localStorage.getItem("cart")) || [];

export function initCart() {
  const cartModal = document.getElementById("cart-modal");
  const cartItems = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");
  const cartCount = document.getElementById("cart-count");
  const checkoutBtn = document.getElementById("checkout");

  if (!cartModal) return;

  function syncCart() {
    cart = JSON.parse(localStorage.getItem("cart")) || [];
  }

  function openCart() {
    cartModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeCart() {
    cartModal.classList.remove("active");
    document.body.style.overflow = "";
  }

  function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    updateMiniCart();
  }

  function updateCart() {
    syncCart();

    if (!cartItems || !totalEl || !cartCount) return;

    if (cart.length === 0) {
      cartItems.innerHTML = `<p>Your cart is empty</p>`;
      totalEl.textContent = "0";
      cartCount.textContent = "0";
      return;
    }

    cartItems.innerHTML = "";
    let total = 0;
    let deliveryFee = 0;

    cart.forEach((item, i) => {
      total += item.price * item.qty;

      const div = document.createElement("div");
      div.className = "cart-item";

      div.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-info">
          <h4>${item.name}</h4>

          <div class="cart-controls">
            <button class="minus">−</button>
            <span>${item.qty}</span>
            <button class="plus">+</button>
          </div>

          <button class="remove">Remove</button>
        </div>
      `;

      div.querySelector(".minus").onclick = () => changeQty(i, -1);
      div.querySelector(".plus").onclick = () => changeQty(i, 1);
      div.querySelector(".remove").onclick = () => removeItem(i);

      cartItems.appendChild(div);
    });

    totalEl.textContent = total;
    cartCount.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
  }

  function changeQty(i, delta) {
    cart[i].qty += delta;

    if (cart[i].qty <= 0) {
      cart.splice(i, 1);
    }

    saveCart();
    updateCart();
  }

  function removeItem(i) {
    cart.splice(i, 1);
    saveCart();
    updateCart();
  }

  // ADD TO CART (PRODUCT PAGE)
  document.querySelectorAll(".product-card").forEach(card => {
    const btn = card.querySelector(".add-to-cart");
    if (!btn) return;

    btn.addEventListener("click", (e) => {
      e.stopPropagation();

      animateAddToCart(btn);

      const item = {
        name: card.dataset.name,
        price: Number(card.dataset.price),
        image: card.dataset.image,
        qty: 1
      };

      const existing = cart.find(p => p.name === item.name);

      if (existing) {
        existing.qty++;
      } else {
        cart.push(item);
      }

      saveCart();
      updateCart();

      showToast(item);
      
    });
  });

  // GLOBAL UPDATE LISTENER
  window.addEventListener("cartUpdated", updateCart);
  window.updateCart = updateCart;
// CHECKOUT
// ================= CHECKOUT FLOW =================

checkoutBtn?.addEventListener("click", () => {

  if (cart.length === 0) return;

  document
    .getElementById("checkout-modal")
    ?.classList.add("active");

});

// ================= SUBMIT CHECKOUT =================

document
  .getElementById("checkout-form")
  ?.addEventListener("submit", async e => {

    e.preventDefault();

    let total = 0;
    let deliveryFee = 0;
    const items = cart.map(item => {

      total += item.price * item.qty;

      return {
        name: item.name,
        price: item.price,
        qty: item.qty,
        image: item.image
      };

    });

    const customer = {
     deliveryMethod:
  document.querySelector(
    'input[name="delivery-method"]:checked'
  )?.value || "pickup",
      name:
        document
          .getElementById("customer-name")
          .value,

      phone:
        document
          .getElementById("customer-phone")
          .value,

      email:
        document
          .getElementById("customer-email")
          .value,

      address:
        document
          .getElementById("customer-address")
          .value
    };
    if (customer.deliveryMethod === "doorstep") {
  deliveryFee = 3000;
}

    localStorage.setItem(
      "customer",
      JSON.stringify(customer)
    );

    const orderData = {
      deliveryMethod:
  customer.deliveryMethod,

deliveryFee,
      items,
      total,
      
      customerName:
        customer.name,

      customerPhone:
        customer.phone,

      customerEmail:
        customer.email,

      deliveryAddress:
        customer.address
        
    };

    try {

      const savedOrder =
        await createOrder(orderData);

      let msg =
`🛒 NEW ORDER

👤 Customer: ${customer.name}

📞 Phone: ${customer.phone}

📧 Email: ${customer.email}

📍 Address:
${customer.address}

━━━━━━━━━━
ITEMS:
━━━━━━━━━━

`;

      cart.forEach((item, i) => {

        msg +=
`${i + 1}. ${item.name}

Qty: ${item.qty}

Price: ₦${item.price}

\n`;

      });

      msg +=
`━━━━━━━━━━

Delivery Method:
${customer.deliveryMethod}

Delivery Fee:
₦${deliveryFee}

TOTAL:
₦${total + deliveryFee}

Order ID:
${savedOrder._id}
`;

      openWhatsApp(msg);

      cart = [];

      saveCart();

      updateCart();

      document
        .getElementById("checkout-modal")
        ?.classList.remove("active");

      document
        .getElementById("checkout-form")
        ?.reset();

    } catch (err) {

      console.error(err);

      alert("Order failed to save.");

    }

});  // OPEN CART
  document.querySelector(".cart-icon")?.addEventListener("click", openCart);

  // CLOSE CART
  document.getElementById("close-cart")?.addEventListener("click", closeCart);

  cartModal.addEventListener("click", (e) => {
    if (e.target === cartModal) {
      closeCart();
    }
  });

  updateCart();
}

export function updateMiniCart() {
  const mini = document.getElementById("mini-cart");
  if (!mini) return;

  syncMini();

  function syncMini() {
    cart = JSON.parse(localStorage.getItem("cart")) || [];
  }

  mini.innerHTML = cart
    .slice(0, 3)
    .map(item => `<img src="${item.image}" alt="${item.name}">`)
    .join("");

  mini.classList.add("show");

  setTimeout(() => {
    mini.classList.remove("show");
  }, 2000);
}

document.getElementById("cart-back")
?.addEventListener("click", () => {

  document
    .getElementById("cart-modal")
    ?.classList.remove("active");

});
document
  .getElementById("close-checkout")
  ?.addEventListener("click", () => {

    document
      .getElementById("checkout-modal")
      ?.classList.remove("active");

});

window.updateMiniCart = updateMiniCart;
window.showToast = showToast;
