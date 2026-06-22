import { API_BASE } from "./config.js";
let allProducts = [];
let allOrders = [];
function authHeaders() {
  const token = localStorage.getItem("adminToken");

  if (!token) return {};

  return {
    Authorization: `Bearer ${token}`
  };
}
function handleUnauthorized(res) {
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem("adminToken");
    showLogin();
    return true;
  }

  return false;
}


let salesChart;

// ================= LOAD ORDERS =================
async function loadOrders() {
  const container = document.getElementById("orders-list");

  try {
    const res = await fetch(`${API_BASE}/api/orders/all`, {
      headers: authHeaders()}
    );
    if (handleUnauthorized(res)) return;
    const orders = await res.json();

    animateCounter(
  document.getElementById("total-orders"),
  orders.length
);

    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
    animateCounter(
  document.getElementById("total-sales"),
  totalSales,
  "₦"
);

    renderChart(orders);

    container.innerHTML = orders.map(order => `
      <div class="admin-order admin-card">
        <h3>Order #${order._id.slice(-6)}</h3>

        <p><strong>Customer:</strong> ${order.customerName || "Guest Customer"}</p>
        <p><strong>Phone:</strong> ${order.customerPhone || "-"}</p>
        <p><strong>Total:</strong> ₦${order.total}</p>

       <div class="admin-order-items">
  ${order.items.map(item => `
    <div class="admin-order-item">
      <img
        src="${item.image}"
        alt="${item.name}"
        class="admin-order-image"
      >
      <div>
        <p>${item.name}</p>
        <small>Qty: ${item.qty}</small>
      </div>
    </div>
  `).join("")}
</div>


        <select data-id="${order._id}" class="status-select">
          <option value="pending" ${order.status === "pending" ? "selected" : ""}>pending</option>
          <option value="processing" ${order.status === "processing" ? "selected" : ""}>processing</option>
          <option value="completed" ${order.status === "completed" ? "selected" : ""}>completed</option>
        </select>

        <button class="delete-order button button-secondary" data-id="${order._id}">
          Cancel Order
        </button>
      </div>
    `).join("");

    document.querySelectorAll(".status-select").forEach(select => {
      select.addEventListener("change", async () => {
        await fetch(`${API_BASE}/api/orders/${select.dataset.id}/status`, {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
    ...authHeaders()
  },
          body: JSON.stringify({
            status: select.value
          })
        });

        loadOrders();
      });
    });

    document.querySelectorAll(".delete-order").forEach(btn => {
      btn.addEventListener("click", async () => {
        await fetch(`${API_BASE}/api/orders/${btn.dataset.id}`, {
          method: "DELETE",
  headers: authHeaders()
});

        loadOrders();
        showNotification(
  "Order cancelled",
  "danger"
);
      });
    });

  } catch (err) {
    container.innerHTML = "<p>Failed to load orders.</p>";
  }
}

function renderProducts(products, container) {

  if (!products.length) {

    container.innerHTML = `
      <div class="admin-empty">
        <h3>No matching products</h3>
      </div>
    `;

    return;
  }

  container.innerHTML = products.map(product => {

    const imageUrl =
      `${API_BASE}${product.image || ""}`;

    return `
      <div class="admin-product">

        <div class="admin-product-media">
          <img
            src="${imageUrl}"
            alt="${product.name}"
            class="admin-product-image"
          >
        </div>

        <div class="admin-product-content">

          <div class="admin-product-top">

            <div>
              <h3>${product.name}</h3>

              <div class="admin-product-badges">

                <span class="badge">
                  ${product.category}
                </span>

                <span class="badge stock">
                  Stock: ${product.stock}
                </span>

              </div>
            </div>

            <strong class="product-price">
              ₦${product.price}
            </strong>

          </div>

          <div class="admin-product-footer">

            <button
              class="delete-product button button-secondary"
              data-id="${product._id}"
            >
              Delete
            </button>

          </div>

        </div>

      </div>
    `;

  }).join("");

  attachDeleteProductEvents();
}

function attachDeleteProductEvents() {

  document
    .querySelectorAll(".delete-product")
    .forEach(btn => {

      btn.addEventListener("click", async () => {

        const confirmed =
          await openConfirmModal(
            "Delete this product?"
          );

        if (!confirmed) return;

        await fetch(
          `${API_BASE}/api/products/${btn.dataset.id}`,
          {
            method: "DELETE",
            headers: authHeaders()
          }
        );

        showNotification(
          "Product deleted",
          "danger"
        );

        loadProducts();
      });

    });
}

function animateCounter(element, target, prefix = "") {

  const duration = 1000;

  const startTime = performance.now();

  function update(currentTime) {

    const progress = Math.min(
      (currentTime - startTime) / duration,
      1
    );

    const current =
      Math.floor(progress * target);

    element.textContent =
      `${prefix}${current.toLocaleString()}`;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// ================= LOAD PRODUCTS =================
async function loadProducts() {

  const container =
    document.getElementById("products-list");

    container.innerHTML = `
  <div class="admin-skeleton"></div>
  <div class="admin-skeleton"></div>
  <div class="admin-skeleton"></div>
`;
  try {

    const res = await fetch(
      `${API_BASE}/api/products/all`,
      {
        headers: authHeaders()
      }
    );

    if (handleUnauthorized(res)) return;

    const products = await res.json();
     allProducts = products;
    // =========================
    // PREMIUM EMPTY STATE
    // =========================

    if (!products.length) {

      container.innerHTML = `
        <div class="admin-empty">

          <div class="admin-empty-icon">
            📦
          </div>

          <h3>No products yet</h3>

          <p>
            Start adding products to populate
            your store dashboard.
          </p>

        </div>
      `;

      return;
    }

    // =========================
    // PRODUCTS UI
    // =========================

   renderProducts(products, container);
  } catch (err) {

    container.innerHTML = `
      <div class="admin-empty error">

        <div class="admin-empty-icon">
          ⚠️
        </div>

        <h3>Failed to load products</h3>

        <p>
          Something went wrong while fetching
          products from the server.
        </p>

      </div>
    `;

  }

}
// ================= ADD PRODUCT =================

const productForm =
  document.getElementById("product-form");

let isUploading = false;

productForm?.addEventListener(
  "submit",
  async e => {

    e.preventDefault();

    if (isUploading) return;

    isUploading = true;

    const submitButton =
      productForm.querySelector(
        'button[type="submit"]'
      );

    const originalText =
      submitButton.textContent;

    submitButton.disabled = true;

    submitButton.textContent =
      "Uploading...";

    try {

      const imageFile =
        document.getElementById("image")
        ?.files?.[0];

      if (!imageFile) {

        showNotification(
          "Please select an image",
          "danger"
        );

        return;
      }

      const formData =
        new FormData();

      formData.append(
        "name",
        document.getElementById("name")
          .value
          .trim()
      );

      formData.append(
        "price",
        document.getElementById("price")
          .value
      );

      formData.append(
        "image",
        imageFile
      );

      formData.append(
        "description",
        document.getElementById(
          "description"
        ).value.trim()
      );

      formData.append(
        "category",
        document.getElementById(
          "category"
        ).value.trim()
      );

      formData.append(
        "stock",
        document.getElementById(
          "stock"
        ).value
      );

      formData.append(
        "featured",
        false
      );

      const res = await fetch(
        `${API_BASE}/api/products`,
        {
          method: "POST",

          headers:
            authHeaders(),

          body: formData
        }
      );

      if (
        handleUnauthorized(res)
      ) return;

      const data =
        await res.json();

      if (!res.ok) {

        showNotification(
          data.message ||
          "Failed to add product",
          "danger"
        );

        return;
      }

      showNotification(
        "Product added successfully"
      );

      productForm.reset();

      const preview =
        document.getElementById(
          "image-preview"
        );

      if (preview) {

        preview.src = "";

        preview.style.display =
          "none";
      }

      await loadProducts();

    } catch (error) {

      console.error(error);

      showNotification(
        "Upload failed",
        "danger"
      );

    } finally {

      isUploading = false;

      submitButton.disabled =
        false;

      submitButton.textContent =
        originalText;
    }

  }
);

// ================= SALES CHART =================
function renderChart(orders) {
  const labels = orders.map(order =>
    new Date(order.createdAt).toLocaleDateString()
  );

  const data = orders.map(order => order.total);

  if (salesChart) salesChart.destroy();

  salesChart = new Chart(document.getElementById("salesChart"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Sales",
        data
      }]
    }
  });
}

const imageInput = document.getElementById("image");
const preview = document.getElementById("image-preview");

if (imageInput && preview) {
  imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];

    if (file) {
      preview.src = URL.createObjectURL(file);
      preview.style.display = "block";
    }
  });
}


const loginSection = document.getElementById("admin-login");
const dashboardSection = document.getElementById("admin-dashboard");
const loginForm = document.getElementById("admin-login-form");

function getToken() {
  return localStorage.getItem("adminToken");
}

function showDashboard() {
  if (loginSection) {
    loginSection.style.display = "none";
    loginSection.setAttribute("hidden", "hidden");
  }

  if (dashboardSection) {
    dashboardSection.style.display = "block";
    dashboardSection.removeAttribute("hidden");
  }

  loadOrders();
  loadProducts();
  loadHomeProducts();
  loadTestimonials();
}

function showLogin() {
  if (loginSection) {
    loginSection.style.display = "block";
    loginSection.removeAttribute("hidden");
  }

  if (dashboardSection) {
    dashboardSection.style.display = "none";
    dashboardSection.setAttribute("hidden", "hidden");
  }
}

  showLogin();


loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("admin-email").value;
  const password = document.getElementById("admin-password").value;

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Login failed");
      return;
    }

    localStorage.setItem("adminToken", data.token);
    showDashboard();
    loadSubscribers();

  } catch (error) {
    alert("Login failed");
  }
});

document.getElementById("admin-logout")?.addEventListener("click", () => {
  localStorage.removeItem("adminToken");
  location.reload();
});

// ================= HOMEPAGE FEATURED PRODUCTS =================
async function loadHomeProducts() {
  const container = document.getElementById("home-products-list");
  if (!container) return;

  const res = await fetch(`${API_BASE}/api/home/products`, {
    headers: authHeaders()
  });

  if (handleUnauthorized(res)) return;

  const products = await res.json();

  container.innerHTML = products.map(product => {
    const imageUrl = product.image?.startsWith("http")
      ? product.image
      : `${API_BASE}${product.image || ""}`;

    return `
      <div class="admin-product">
        <img
          src="${imageUrl}"
          alt="${product.name}"
          class="admin-product-image"
        >

        <div class="admin-product-info">
          <h3>${product.name}</h3>
          <p>₦${product.price}</p>
          <p>${product.description}</p>
        </div>

        <button class="delete-home-product" data-id="${product._id}">
          Delete
        </button>
      </div>
    `;
  }).join("");

  document.querySelectorAll(".delete-home-product").forEach(btn => {
    btn.addEventListener("click", async () => {
      const res = await fetch(`${API_BASE}/api/home/products/${btn.dataset.id}`, {
        method: "DELETE",
        headers: authHeaders()
      });

      if (handleUnauthorized(res)) return;

      loadHomeProducts();
    });
  });
}

document.getElementById("home-product-form")?.addEventListener("submit", async e => {
  e.preventDefault();

  const formData = new FormData();

  formData.append("name", document.getElementById("home-name").value);
  formData.append("price", document.getElementById("home-price").value);
  formData.append("image", document.getElementById("home-image").files[0]);
  formData.append("description", document.getElementById("home-description").value);

  const res = await fetch(`${API_BASE}/api/home/products`, {
    method: "POST",
    headers: authHeaders(),
    body: formData
  });

  if (handleUnauthorized(res)) return;

  e.target.reset();
  loadHomeProducts();

showNotification(
  "Homepage product added"
);
});

// ================= TESTIMONIALS =================
async function loadTestimonials() {
  const container = document.getElementById("testimonials-list");
  if (!container) return;

  const res = await fetch(`${API_BASE}/api/home/testimonials`, {
    headers: authHeaders()
  });

  if (handleUnauthorized(res)) return;

  const items = await res.json();

  container.innerHTML = items.map(item => {
    const frontImage = item.frontImage?.startsWith("http")
      ? item.frontImage
      : `${API_BASE}${item.frontImage || ""}`;

    const backImage = item.backImage?.startsWith("http")
      ? item.backImage
      : `${API_BASE}${item.backImage || ""}`;

    return `
      <div class="admin-product">
        <img src="${frontImage}" class="admin-product-image">
        <img src="${backImage}" class="admin-product-image">

        <div class="admin-product-info">
          <p>${item.quote}</p>
          <strong>${item.author}</strong>
        </div>

        <button class="delete-testimonial" data-id="${item._id}">
          Delete
        </button>
      </div>
    `;
  }).join("");

  document.querySelectorAll(".delete-testimonial").forEach(btn => {
    btn.addEventListener("click", async () => {
      const res = await fetch(`${API_BASE}/api/home/testimonials/${btn.dataset.id}`, {
        method: "DELETE",
        headers: authHeaders()
      });

      if (handleUnauthorized(res)) return;

      loadTestimonials();
    });
  });
}

document.getElementById("testimonial-form")?.addEventListener("submit", async e => {
  e.preventDefault();

  const formData = new FormData();

  formData.append("frontImage", document.getElementById("front-image").files[0]);
  formData.append("backImage", document.getElementById("back-image").files[0]);
  formData.append("quote", document.getElementById("testimonial-quote").value);
  formData.append("author", document.getElementById("testimonial-author").value);

  const res = await fetch(`${API_BASE}/api/home/testimonials`, {
    method: "POST",
    headers: authHeaders(),
    body: formData
  });

  if (handleUnauthorized(res)) return;

  e.target.reset();
loadTestimonials();

showNotification(
  "Testimonial added successfully"
);
});



// =========================
// SECTION NAVIGATION
// =========================

const navLinks = document.querySelectorAll(".admin-nav-link");
const adminSections = document.querySelectorAll(".admin-section");

function switchSection(sectionId) {

  adminSections.forEach(section => {
    section.classList.remove("active");
  });

  navLinks.forEach(link => {
    link.classList.remove("active");
  });

  const activeSection =
    document.getElementById(sectionId);

  const activeLink =
    document.querySelector(
      `[data-section="${sectionId}"]`
    );

  if (activeSection) {
    activeSection.classList.add("active");
  }

  if (activeLink) {
    activeLink.classList.add("active");
  }

  // close mobile sidebar after click
  closeSidebar();
}

navLinks.forEach(link => {
  link.addEventListener("click", () => {
    switchSection(link.dataset.section);
  });
});

// =========================
// MOBILE SIDEBAR
// =========================

const sidebar =
  document.getElementById("admin-sidebar");

const overlay =
  document.getElementById("admin-overlay");

const menuToggle =
  document.getElementById("menu-toggle");

const sidebarClose =
  document.getElementById("sidebar-close");

function openSidebar() {
  sidebar?.classList.add("active");
  overlay?.classList.add("active");
}

function closeSidebar() {
  sidebar?.classList.remove("active");
  overlay?.classList.remove("active");
}

menuToggle?.addEventListener("click", openSidebar);

sidebarClose?.addEventListener("click", closeSidebar);

overlay?.addEventListener("click", closeSidebar);

// =========================
// THEME TOGGLE
// =========================

const themeToggle =
  document.getElementById("theme-toggle");

const savedTheme =
  localStorage.getItem("adminTheme");

if (savedTheme === "dark") {
  document.body.classList.add("dark-theme");
}

themeToggle?.addEventListener("click", () => {

  document.body.classList.toggle("dark-theme");

  const isDark =
    document.body.classList.contains("dark-theme");

  localStorage.setItem(
    "adminTheme",
    isDark ? "dark" : "light"
  );
});

// =========================
// NOTIFICATIONS
// =========================

function showNotification(message, type = "success") {

  const notification =
    document.createElement("div");

  notification.className =
    `admin-notification ${type}`;

  notification.innerHTML = `
    <div class="admin-notification-content">
      ${message}
    </div>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("show");
  }, 50);

  setTimeout(() => {

    notification.classList.remove("show");

    setTimeout(() => {
      notification.remove();
    }, 300);

  }, 3000);
}

// =========================
// GLOBAL SEARCH
// =========================

const searchInput =
  document.getElementById("admin-search");

searchInput?.addEventListener("input", e => {

  const value =
    e.target.value.toLowerCase().trim();

  const productsContainer =
    document.getElementById("products-list");

  if (!value) {
    renderProducts(allProducts, productsContainer);
    return;
  }

  const filteredProducts =
    allProducts.filter(product => {

      return (
        product.name
          .toLowerCase()
          .includes(value)

        ||

        product.category
          ?.toLowerCase()
          .includes(value)
      );

    });

  renderProducts(
    filteredProducts,
    productsContainer
  );

});

function openConfirmModal(message) {

  return new Promise(resolve => {

    const modal =
      document.getElementById("confirm-modal");

    const text =
      document.getElementById("confirm-modal-text");

    const accept =
      document.getElementById("confirm-accept");

    const cancel =
      document.getElementById("confirm-cancel");

    text.textContent = message;

    modal.classList.add("active");

    function cleanup(result) {

      modal.classList.remove("active");

      accept.removeEventListener("click", onAccept);
      cancel.removeEventListener("click", onCancel);

      resolve(result);
    }

    function onAccept() {
      cleanup(true);
    }

    function onCancel() {
      cleanup(false);
    }

    accept.addEventListener("click", onAccept);
    cancel.addEventListener("click", onCancel);

  });
}

// =========================
// PROFILE MENU
// =========================

const profileToggle =
  document.getElementById("profile-toggle");

const profileMenu =
  document.getElementById("profile-menu");

profileToggle?.addEventListener("click", () => {

  profileMenu?.classList.toggle("active");

});

document.addEventListener("click", e => {

  if (
    !profileMenu?.contains(e.target)
    &&
    !profileToggle?.contains(e.target)
  ) {
    profileMenu?.classList.remove("active");
  }

});

// =========================
// COMMAND PALETTE
// =========================

const commandPalette =
  document.getElementById("command-palette");

document.addEventListener("keydown", e => {

  if (
    (e.ctrlKey || e.metaKey)
    &&
    e.key.toLowerCase() === "k"
  ) {

    e.preventDefault();

    commandPalette?.classList.toggle("active");
  }

});

commandPalette?.addEventListener("click", e => {

  if (e.target === commandPalette) {
    commandPalette.classList.remove("active");
  }

});

document
  .querySelectorAll(".command-results button")
  .forEach(button => {

    button.addEventListener("click", () => {

      switchSection(
        button.dataset.section
      );

      commandPalette?.classList.remove("active");
    });

  });

  // =========================
// CATEGORY TABS
// =========================

const categoryTabs =
  document.querySelectorAll(".category-tab");

const categoryInput =
  document.getElementById("category");

categoryTabs.forEach(tab => {

  tab.addEventListener("click", () => {

    categoryTabs.forEach(btn => {
      btn.classList.remove("active");
    });

    tab.classList.add("active");

    categoryInput.value =
      tab.dataset.category;

  });

});

async function loadSubscribers() {

  const container =
    document.getElementById(
      "subscribers-list"
    );

  if (!container) return;

  const res = await fetch(
    `${API_BASE}/api/subscribers`,
    {
      headers: authHeaders()
    }
  );

  const subscribers =
    await res.json();

  container.innerHTML =
    subscribers.map(sub => `

      <div class="admin-product">

        <div class="admin-product-content">

          <h3>${sub.email}</h3>

          <button
            class="button button-primary"
            onclick="
              window.location.href=
              'mailto:${sub.email}'
            "
          >
            Email Customer
          </button>

        </div>

      </div>

    `).join("");

}