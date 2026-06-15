"use strict";

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
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    const submitButton = contactForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    formStatus.classList.remove("is-error");
    formStatus.textContent = "Anfrage wird gesendet …";

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { Accept: "application/json" }
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Die Anfrage konnte nicht gesendet werden.");
      }

      contactForm.reset();
      formStatus.textContent = result.message;
    } catch (error) {
      formStatus.classList.add("is-error");
      formStatus.textContent = error.message || "Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut.";
    } finally {
      submitButton.disabled = false;
    }
  });
}

const currentYear = document.querySelector("#current-year");
if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}
