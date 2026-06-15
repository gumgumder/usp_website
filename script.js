"use strict";

// Schnell anpassbare Werte für die Statistik-Karten.
const statistics = [
  { target: 2500, suffix: "+" },
  { target: 18000, suffix: "+" },
  { target: 25, suffix: "+" }
];

// Zieladresse für Anfragen aus dem Kontaktformular.
const contactEmail = "hallo@usp-bote.at";

const menuButton = document.querySelector(".menu-button");
const mobileNav = document.querySelector(".mobile-nav");

if (menuButton && mobileNav) {
  const closeMenu = () => {
    menuButton.setAttribute("aria-expanded", "false");
    mobileNav.hidden = true;
    document.body.classList.remove("menu-open");
  };

  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    mobileNav.hidden = isOpen;
    document.body.classList.toggle("menu-open", !isOpen);
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 940) closeMenu();
  });
}

const formatNumber = (value) => new Intl.NumberFormat("de-AT").format(value);
const statElements = document.querySelectorAll(".stat-number");

statElements.forEach((element, index) => {
  const config = statistics[index];
  if (!config) return;
  element.dataset.target = String(config.target);
  element.dataset.suffix = config.suffix;
});

const animateNumber = (element) => {
  const target = Number(element.dataset.target);
  const suffix = element.dataset.suffix || "";
  const duration = 1400;
  const startTime = performance.now();

  const update = (currentTime) => {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.round(target * easedProgress);

    element.textContent = `${formatNumber(currentValue)}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  };

  requestAnimationFrame(update);
};

if ("IntersectionObserver" in window) {
  const statsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateNumber(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.4 });

  statElements.forEach((element) => statsObserver.observe(element));
} else {
  statElements.forEach(animateNumber);
}

const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    const formData = new FormData(contactForm);
    const subject = encodeURIComponent("Anfrage für eine kostenlose Demo");
    const body = encodeURIComponent(
      `Vorname und Nachname: ${formData.get("name")}\n` +
      `Firmenname: ${formData.get("company")}\n` +
      `Telefonnummer: ${formData.get("phone")}\n` +
      `E-Mail-Adresse: ${formData.get("email")}\n\n` +
      "Ich interessiere mich für eine Demo von USP-Bote."
    );

    formStatus.textContent = "Ihr E-Mail-Programm wird geöffnet.";
    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
  });
}

const currentYear = document.querySelector("#current-year");
if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}
