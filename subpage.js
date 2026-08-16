const subpageTranslations = document.querySelectorAll("[data-pl][data-en]");
const subpageAiPrompts = {
  pl: "Opowiedz mi szczegółowo o aplikacji Zostaje. Sprawdź aktualne informacje na https://zostaje.com/ oraz w organizacji https://github.com/zostaje. Opisz problem, funkcje, platformy, prywatność, planowane MCP, etap rozwoju i cennik. Oddziel fakty od planów i własnych wniosków. Cytuj źródła i dodawaj linki. Jeśli czegoś nie da się potwierdzić, napisz to wprost.",
  en: "Tell me in detail about the Zostaje app. Check current information at https://zostaje.com/ and https://github.com/zostaje. Describe the problem, features, platforms, privacy, planned MCP, development stage and pricing. Separate facts from plans and your own inferences. Cite sources with links. If something cannot be confirmed, say so explicitly.",
};

function updateSubpageAiLinks(language) {
  const prompt = subpageAiPrompts[language];
  const encodedPrompt = encodeURIComponent(prompt);
  const chatgpt = document.querySelector('[data-ai="chatgpt"]');
  const claude = document.querySelector('[data-ai="claude"]');
  const gemini = document.querySelector('[data-ai="gemini"]');
  if (!chatgpt || !claude || !gemini) return;
  chatgpt.href = `https://chatgpt.com/?q=${encodedPrompt}&hints=search`;
  claude.href = `https://claude.ai/new?q=${encodedPrompt}`;
  gemini.dataset.prompt = prompt;
}

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
  updateSubpageAiLinks(language);
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

const subpageGeminiLink = document.querySelector('[data-ai="gemini"]');
if (subpageGeminiLink) {
  subpageGeminiLink.addEventListener("click", () => {
    const note = document.querySelector(".footer-ai-note");
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(subpageGeminiLink.dataset.prompt).then(() => {
      note.textContent =
        document.documentElement.lang === "en"
          ? "Prompt copied. Paste it into Gemini."
          : "Prompt skopiowany. Wklej go w Gemini.";
    });
  });
}
