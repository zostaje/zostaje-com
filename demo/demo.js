const STORAGE_KEY = "zostaje-web-demo-v1";

const initialState = {
  liquidBalance: 500000,
  expectedIncome: 100000,
  commitments: 240000,
  protectedGoals: 50000,
  safetyBuffer: 30000,
  remainingDays: 14,
  entries: [],
};

const copy = {
  pl: {
    kinds: {
      note: "notatka",
      expense: "wydatek",
      income: "wpływ",
      plan: "plan",
      goal: "cel",
      question: "pytanie",
    },
    result: {
      note: "Zachowaliśmy tę myśl bez wciskania jej w formularz.",
      expense: "Wydatek pomniejszył dostępną kwotę i trafił do Skrzynki.",
      income: "Wpływ zwiększył środki uwzględnione w planie.",
      plan: "Kwota została zarezerwowana jako przyszłe zobowiązanie.",
      goal: "Kwota została ochroniona jako cel oszczędnościowy.",
      question:
        "Pytanie czeka w Skrzynce na decyzję — niczego nie zaksięgowaliśmy.",
    },
    safe: "Saldo + wpływy − zobowiązania − cele − bufor, podzielone przez pozostałe dni.",
    empty: "Dodaj pierwszy wpis, aby zobaczyć go w Skrzynce.",
    entryNode: "Nowy wpis",
    safeNode: "Bezpiecznie dziś",
    planNode: "Plan i cele",
  },
  en: {
    kinds: {
      note: "note",
      expense: "expense",
      income: "income",
      plan: "plan",
      goal: "goal",
      question: "question",
    },
    result: {
      note: "We kept this thought without forcing it into a form.",
      expense:
        "The expense reduced your available amount and entered the Inbox.",
      income: "The income increased the funds included in your plan.",
      plan: "The amount is now reserved as an upcoming commitment.",
      goal: "The amount is now protected as a savings goal.",
      question: "The question is waiting in the Inbox. Nothing was booked.",
    },
    safe: "Balance + income − commitments − goals − buffer, divided by remaining days.",
    empty: "Add your first entry to see it in the Inbox.",
    entryNode: "New entry",
    safeNode: "Safe today",
    planNode: "Plan and goals",
  },
};

function loadState() {
  try {
    return {
      ...initialState,
      ...JSON.parse(localStorage.getItem(STORAGE_KEY)),
    };
  } catch {
    return structuredClone(initialState);
  }
}

let state = loadState();
let lastInterpretation = null;

const form = document.querySelector("#demo-entry-form");
const input = document.querySelector("#demo-entry-input");
const result = document.querySelector("#demo-result");
const resultTitle = document.querySelector("#demo-result-title");
const resultCopy = document.querySelector("#demo-result-copy");
const resultTags = document.querySelector("#demo-result-tags");
const safeValue = document.querySelector("#demo-safe-value");
const safeDetail = document.querySelector("#demo-safe-detail");
const entryList = document.querySelector("#demo-entry-list");
const mapEntry = document.querySelector("#demo-map-entry");
const mapSafe = document.querySelector("#demo-map-safe");
const mapPlan = document.querySelector("#demo-map-plan");

function language() {
  return document.documentElement.lang === "en" ? "en" : "pl";
}

function normalize(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function containsAny(text, words) {
  return words.some((word) => text.includes(word));
}

function parseAmount(text) {
  const match = text.match(
    /(?:^|\s)(\d{1,3}(?:[ .]\d{3})+|\d+)(?:[,.](\d{1,2}))?/,
  );
  if (!match) return null;
  const major = Number(match[1].replace(/[ .]/g, ""));
  const fraction = Number((match[2] || "0").padEnd(2, "0"));
  return major * 100 + fraction;
}

function interpret(text) {
  const normalized = normalize(text.trim());
  const amount = parseAmount(normalized);
  let kind = "note";

  if (
    normalized.includes("?") ||
    containsAny(normalized, ["czy ", "can i", "should i", "how "])
  ) {
    kind = "question";
  } else if (
    containsAny(normalized, [
      "chce odlozyc",
      "odkladam",
      "cel ",
      "save for",
      "saving for",
    ])
  ) {
    kind = "goal";
  } else if (
    containsAny(normalized, [
      "wyplata",
      "pensja",
      "dostalem",
      "wplyw",
      "salary",
      "income",
      "received",
    ])
  ) {
    kind = "income";
  } else if (
    containsAny(normalized, [
      "za tydzien",
      "jutro",
      "do zaplaty",
      "musze zaplacic",
      "next week",
      "tomorrow",
      "due ",
    ])
  ) {
    kind = "plan";
  } else if (amount !== null) {
    kind = "expense";
  }

  const categoryRules = [
    ["Jedzenie", ["mcdonald", "obiad", "lunch", "biedronka", "lidl"]],
    ["Subskrypcje", ["netflix", "spotify", "subskrypc"]],
    ["Transport", ["uber", "bolt", "paliwo", "parking"]],
    ["Mieszkanie", ["czynsz", "mieszkanie", "prad", "rent"]],
    ["Ubezpieczenie", ["ubezpieczen", "insurance"]],
  ];
  const category =
    categoryRules.find(([, words]) => containsAny(normalized, words))?.[0] ||
    null;

  return {
    text: text.trim(),
    kind,
    amount,
    category,
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
  };
}

function applyEntry(entry) {
  if (entry.amount !== null) {
    if (entry.kind === "expense") state.liquidBalance -= entry.amount;
    if (entry.kind === "income") state.expectedIncome += entry.amount;
    if (entry.kind === "plan") state.commitments += entry.amount;
    if (entry.kind === "goal") state.protectedGoals += entry.amount;
  }
  state.entries.unshift(entry);
  state.entries = state.entries.slice(0, 12);
  lastInterpretation = entry;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function money(minorUnits) {
  return new Intl.NumberFormat(language() === "en" ? "en-GB" : "pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 2,
  }).format(minorUnits / 100);
}

function safeToSpend() {
  const available = Math.max(
    state.liquidBalance +
      state.expectedIncome -
      state.commitments -
      state.protectedGoals -
      state.safetyBuffer,
    0,
  );
  return {
    available,
    daily: Math.floor(available / Math.max(state.remainingDays, 1)),
  };
}

function renderResult() {
  const lang = language();
  if (!lastInterpretation) {
    result.hidden = true;
    return;
  }
  const entry = lastInterpretation;
  result.hidden = false;
  resultTitle.textContent = copy[lang].kinds[entry.kind];
  resultCopy.textContent = copy[lang].result[entry.kind];
  resultTags.innerHTML = "";
  [
    entry.amount !== null ? money(entry.amount) : null,
    entry.category,
    entry.kind === "plan" ? (lang === "pl" ? "termin" : "due date") : null,
  ]
    .filter(Boolean)
    .forEach((tag) => {
      const span = document.createElement("span");
      span.className = "demo-tag";
      span.textContent = tag;
      resultTags.append(span);
    });
}

function renderInbox() {
  const lang = language();
  entryList.innerHTML = "";
  if (!state.entries.length) {
    const empty = document.createElement("li");
    empty.className = "demo-empty";
    empty.textContent = copy[lang].empty;
    entryList.append(empty);
    return;
  }
  state.entries.forEach((entry) => {
    const item = document.createElement("li");
    const text = document.createElement("span");
    const type = document.createElement("small");
    text.textContent = entry.text;
    type.textContent = copy[lang].kinds[entry.kind];
    item.append(text, type);
    entryList.append(item);
  });
}

function renderMap() {
  const lang = language();
  const safe = safeToSpend();
  mapEntry.textContent = lastInterpretation?.text || copy[lang].entryNode;
  mapSafe.textContent = `${copy[lang].safeNode}: ${money(safe.daily)}`;
  mapPlan.textContent = `${copy[lang].planNode}: ${money(state.commitments + state.protectedGoals)}`;
}

function render() {
  const lang = language();
  const safe = safeToSpend();
  safeValue.innerHTML = `${money(safe.daily)
    .replace(/\s?zł|PLN/g, "")
    .trim()} <small>PLN</small>`;
  safeDetail.textContent = `${copy[lang].safe} ${money(safe.available)} ${lang === "pl" ? "do końca okresu." : "until the end of the period."}`;
  renderResult();
  renderInbox();
  renderMap();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!input.value.trim()) return;
  applyEntry(interpret(input.value));
  input.value = "";
  render();
});

document.querySelectorAll(".demo-example").forEach((button) => {
  button.addEventListener("click", () => {
    input.value = button.dataset.example;
    input.focus();
  });
});

document.querySelector("#demo-reset").addEventListener("click", () => {
  state = structuredClone(initialState);
  lastInterpretation = null;
  localStorage.removeItem(STORAGE_KEY);
  render();
});

new MutationObserver(render).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["lang"],
});

render();
