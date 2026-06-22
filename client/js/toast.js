let toastTimeout;

export function showToast({ name, price, image }) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  const finalImage = image
  ? image.startsWith("http")
    ? image
    : `http://localhost:5000${image}`
  : "assets/images/placeholder.jpg";
  toast.innerHTML = `
    <div class="toast-inner">
      <img src="${finalImage}" class="toast-img" />
      <div class="toast-info">
        <strong>${name}</strong>
        <span>$${price}</span>
      </div>
      <div class="toast-check">✓</div>
    </div>
  `;

  toast.classList.add("show");

  // 🔊 subtle sound
  playSound();

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// 🔊 SOUND (very soft click)
function playSound() {
  const audio = new Audio("assets/sounds/add.mp3"); // optional file
  audio.volume = 0.2;
  audio.play().catch(() => {});
}