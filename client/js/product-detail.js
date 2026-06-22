import { showToast } from "./toast.js";

document.addEventListener("DOMContentLoaded", () => {

  const container = document.getElementById("product-detail");

  const product = JSON.parse(localStorage.getItem("selectedProduct"));

  if (!product) {
    container.innerHTML = "<p>Product not found</p>";
    return;
  }

  container.innerHTML = `
  <div class="detail-grid">
    <img src="${product.image}" class="detail-image">

    <div class="detail-info">
      <h1>${product.name}</h1>
      <p class="price">₦${product.price}</p>
      <p>${product.description || "Premium quality product."}</p>

      <div class="detail-actions">
        <button id="add-cart" class="button button-secondary">
          Add to Cart
        </button>

        <button id="buy" class="button button-primary">
          Order on WhatsApp
        </button>
      </div>
    </div>
  </div>
`;
// ADD TO CART FROM DETAIL PAGE
document.getElementById("add-cart").addEventListener("click", () => {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const existing = cart.find(item => item.name === product.name);

  if (existing) {
    existing.qty++;
  } else {
    cart.push({
      name: product.name,
      price: Number(product.price),
      image: product.image,
      qty: 1
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  // 🔥 THIS IS THE MAGIC
  window.dispatchEvent(new Event("cartUpdated"));

  showToast({
    name: product.name, 
    price: product.price, 
    image: product.image });
});

  document.getElementById("buy").addEventListener("click", () => {
    const msg = `Hello, I want to order: ${product.name} - ₦${product.price}`;
    const url = `https://wa.me/23480511019?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  });

});

