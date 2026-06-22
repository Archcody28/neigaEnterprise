export function initContact() {
  const contactForm = document.getElementById("contact-form");

  if (!contactForm) return;

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = contactForm.name.value.trim();
    const phone = contactForm.phone.value.trim();
    const product = contactForm.product?.value || "";
    const message = contactForm.message.value.trim();

    // SAVE CUSTOMER INFO FOR CHECKOUT
    localStorage.setItem(
      "customer",
      JSON.stringify({
        name,
        phone,
        note: message
      })
    );

    const text = `
Hello Neiga Enterprise,

My name is ${name}
Phone: ${phone}
Product: ${product}

Message:
${message}
    `;

    window.open(
      `https://wa.me/2348063511019?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  });
}