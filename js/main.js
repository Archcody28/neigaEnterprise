import { initNav } from "./nav.js";
import { initUI, initRecentAndLive } from "./ui.js";
import { initProducts, trackViewedProducts } from "./products.js";
import { initCart, updateMiniCart } from "./cart.js";
import { initTestimonialWall } from "./ui.js";
import { initContact } from "./contact.js";
import { loadProducts } from "./products.js";
import { loadHomeProducts, loadTestimonials } from "./home.js";

window.initUI = initUI;

window.addEventListener("DOMContentLoaded", () => {
initNav();
initUI();
loadProducts();

initRecentAndLive();
initContact();
initCart();
updateMiniCart();
initTestimonialWall();
loadHomeProducts();
loadTestimonials();
});
