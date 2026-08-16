const subpageTranslations = document.querySelectorAll("[data-pl][data-en]");

function applySubpageLanguage(language) {
  subpageTranslations.forEach((element) => {
    element.textContent = element.dataset[language];
  });
  document.documentElement.lang = language;
  const languageSuffix = language === "en" ? "En" : "Pl";
  document.title = document.body.dataset[`title${languageSuffix}`];
  document.querySelector('meta[name="description"]').content =
    document.body.dataset[`description${languageSuffix}`];
  document.querySelectorAll(".footer-language-name").forEach((element) => {
    element.textContent = language === "en" ? "English" : "Polski";
  });
  document
    .querySelectorAll(".language-menu, .footer-language")
    .forEach((menu) => menu.removeAttribute("open"));
  try {
    localStorage.setItem("zostaje-language", language);
  } catch {
    // Language switching still works without persistent storage.
  }
}

document.querySelectorAll("[data-language]").forEach((button) => {
  button.addEventListener("click", () =>
    applySubpageLanguage(button.dataset.language),
  );
});

const mobileMenu = document.querySelector("#mobile-menu");
const openMenuButton = document.querySelector(".menu-toggle");
const closeMenuButton = document.querySelector(".menu-close");

function closeSubpageMenu() {
  mobileMenu.classList.remove("is-open");
  document.body.classList.remove("menu-open");
  openMenuButton.setAttribute("aria-expanded", "false");
  window.setTimeout(() => {
    mobileMenu.hidden = true;
  }, 180);
}

openMenuButton.addEventListener("click", () => {
  mobileMenu.hidden = false;
  requestAnimationFrame(() => mobileMenu.classList.add("is-open"));
  document.body.classList.add("menu-open");
  openMenuButton.setAttribute("aria-expanded", "true");
  closeMenuButton.focus();
});
closeMenuButton.addEventListener("click", closeSubpageMenu);
mobileMenu
  .querySelectorAll("a")
  .forEach((link) => link.addEventListener("click", closeSubpageMenu));

document
  .querySelector(".mobile-language-toggle")
  .addEventListener("click", () => {
    const panel = document.querySelector(".mobile-language-panel");
    panel.hidden = !panel.hidden;
  });

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !mobileMenu.hidden) closeSubpageMenu();
});

const siteHeader = document.querySelector(".site-header");
const updateHeader = () =>
  siteHeader.classList.toggle("is-scrolled", window.scrollY > 12);
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

let savedLanguage = "pl";
try {
  savedLanguage =
    localStorage.getItem("zostaje-language") === "en" ? "en" : "pl";
} catch {
  savedLanguage = "pl";
}
applySubpageLanguage(savedLanguage);
