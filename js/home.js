import { API_BASE } from "./config.js";

export async function loadHomeProducts() {
  const container = document.getElementById("home-products");
  if (!container) return;

  container.innerHTML = `
  <p class="loading-state">
    Loading products...
  </p>
`;

  try {
    const res = await fetch(`${API_BASE}/api/home/products`);
    const products = await res.json();

    console.log("home products:", products);

    if (!Array.isArray(products)) return;

    container.innerHTML = "";

    products.forEach(product => {
      const imageUrl = product.image?.startsWith("http")
        ? product.image
        : `${API_BASE}${product.image || ""}`;

      const card = document.createElement("article");
      card.className = "product-card";

      card.setAttribute("data-name", product.name);
      card.setAttribute("data-price", product.price);
      card.setAttribute("data-image", imageUrl);

      card.innerHTML = `
        <img src="${imageUrl}" alt="${product.name}">

        <div class="product-content">
          <h3>${product.name}</h3>
          <p>${product.description || ""}</p>

          <div class="product-footer">
            <span class="price">₦${product.price}</span>

            <button class="button button-ghost" data-action="buy-now">
              Order
            </button>
          </div>
        </div>
      `;

      container.appendChild(card);
    });

  } catch (error) {
    console.error("Failed to load homepage products:", error);
  }
}
export async function loadTestimonials() {
  const container = document.getElementById("home-testimonials");
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE}/api/home/testimonials`);
    const items = await res.json();

    if (!Array.isArray(items) || !items.length) {
      container.innerHTML = "";
      return;
    }

    const columns = 4;
    const grouped = Array.from({ length: columns }, () => []);

    items.forEach((item, i) => {
      grouped[i % columns].push(item);
    });

    container.innerHTML = grouped.map(group => `
      <div class="testimonial-column">

        ${group.map((item, i) => {

          const frontImage = item.frontImage?.startsWith("http")
            ? item.frontImage
            : `${API_BASE}${item.frontImage || ""}`;

          const backImage = item.backImage?.startsWith("http")
            ? item.backImage
            : `${API_BASE}${item.backImage || ""}`;

          return `
            <article class="t-card ${i === 0 ? "active" : ""}">

              <div class="card-inner">

                <div class="card-front">
                  <img
                    src="${frontImage}"
                    alt="${item.author || "testimonial"}"
                  >
                </div>

                <div class="card-back">
                  <img
                    src="${backImage}"
                    alt="${item.author || "testimonial"}"
                  >
                </div>

              </div>

              <p>${item.quote || ""}</p>
              <strong>— ${item.author || ""}</strong>

            </article>
          `;
        }).join("")}

      </div>
    `).join("");

    requestAnimationFrame(() => {
      startTestimonialSlider();
    });

  } catch (error) {
    console.error("Failed to load testimonials:", error);
  }

}

function startTestimonialSlider() {

  const columns = document.querySelectorAll(
    "#home-testimonials .testimonial-column"
  );

  columns.forEach(column => {

    const cards = column.querySelectorAll(".t-card");

    if (!cards.length) return;

    let current = 0;

    // INITIAL STATE
    cards.forEach((card, index) => {

      card.style.display = "none";
      card.style.opacity = "0";
      card.style.transform = "translateY(40px)";

      if (index === 0) {
        card.style.display = "block";
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      }
    });

    setInterval(() => {

      // HIDE CURRENT
      cards[current].style.opacity = "0";
      cards[current].style.transform = "translateY(-40px)";

      setTimeout(() => {
        cards[current].style.display = "none";

        current++;

        if (current >= cards.length) {
          current = 0;
        }

        // SHOW NEXT
        cards[current].style.display = "block";

        requestAnimationFrame(() => {
          cards[current].style.opacity = "1";
          cards[current].style.transform = "translateY(0)";
        });

      }, 500);

    }, 6000);

  });
}