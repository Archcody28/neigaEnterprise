export function openWhatsApp(message) {
  const url = `https://wa.me/2348063511019?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank");

  // 🔥 follow-up after 25 seconds
  setTimeout(() => {
    alert("Need help choosing? We respond instantly on WhatsApp 😊");
  }, 25000);
}
