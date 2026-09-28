const storageKey = "statistik-labor-v1";
const defaultState = { path: "examples", completed: [], project: {} };
let state;

try {
  state = { ...defaultState, ...JSON.parse(localStorage.getItem(storageKey) || "{}") };
} catch {
  state = { ...defaultState };
}

const saveState = () => localStorage.setItem(storageKey, JSON.stringify(state));
const chapters = [...document.querySelectorAll(".chapter")];
const navItems = [...document.querySelectorAll(".nav-item")];

function showChapter(id, updateHash = true) {
  const target = document.getElementById(id) || document.getElementById("start");
  chapters.forEach(chapter => chapter.classList.toggle("active", chapter === target));
  navItems.forEach(item => item.classList.toggle("active", item.dataset.target === target.id));
  if (updateHash) history.replaceState(null, "", `#${target.id}`);
  document.getElementById("course").focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

navItems.forEach(item => item.addEventListener("click", () => showChapter(item.dataset.target)));
document.querySelectorAll(".next").forEach(button => button.addEventListener("click", () => showChapter(button.dataset.next)));

function updateProgress() {
  const labs = ["labor1", "labor2", "labor3", "labor4", "labor5", "labor6"];
  const count = labs.filter(id => state.completed.includes(id)).length;
  document.getElementById("progressLabel").textContent = `${count} von 6 Laboren`;
  document.getElementById("progressBar").style.width = `${count / 6 * 100}%`;
  navItems.forEach(item => item.classList.toggle("done", state.completed.includes(item.dataset.target)));
  document.querySelectorAll(".complete-btn[data-complete]").forEach(button => {
    const done = state.completed.includes(button.dataset.complete);
    button.classList.toggle("completed", done);
    if (button.dataset.complete !== "example") button.textContent = done ? "Labor abgeschlossen" : `${button.dataset.complete.replace("labor", "Labor ")} abschliessen`;
  });
  const completionBox = document.getElementById("completionBox");
  const completionText = document.getElementById("completionText");
  if (count === 6) {
    completionBox.classList.add("finished");
    completionText.textContent = "Alle Lernlabore abgeschlossen. Du bist bereit für die Auswertung.";
  } else {
    completionBox.classList.remove("finished");
    completionText.textContent = `Noch ${6 - count} ${6 - count === 1 ? "Lernlabor" : "Lernlabore"} offen. Du kannst trotzdem schon planen.`;
  }
}

document.querySelectorAll(".complete-btn").forEach(button => button.addEventListener("click", () => {
  const id = button.dataset.complete;
  if (!state.completed.includes(id)) state.completed.push(id);
  else state.completed = state.completed.filter(item => item !== id);
  saveState();
  updateProgress();
}));

document.querySelectorAll(".path-card").forEach(button => button.addEventListener("click", () => {
  state.path = button.dataset.path;
  document.body.dataset.path = state.path;
  document.querySelectorAll(".path-card").forEach(card => card.classList.toggle("selected", card === button));
  saveState();
}));

document.body.dataset.path = state.path;
document.querySelectorAll(".path-card").forEach(card => card.classList.toggle("selected", card.dataset.path === state.path));

const scaleQuestions = [
  ["Blutgruppe", "nominal"],
  ["Schmerzstärke: leicht, mittel, stark", "ordinal"],
  ["Reaktionszeit in Sekunden", "metric"],
  ["Blütenfarbe", "nominal"],
  ["Bewertung einer Creme von 1 bis 9", "ordinal"],
  ["CO₂-Volumen in Millilitern", "metric"],
  ["Lawinenwarnstufe", "ordinal"],
  ["Anzahl Bakterienkolonien", "metric"]
];
let scaleCorrect = new Set();
const scaleCards = document.getElementById("scaleCards");

scaleQuestions.forEach(([label, correct], index) => {
  const row = document.createElement("div");
  row.className = "quiz-item";
  row.innerHTML = `<strong>${label}</strong><div class="mini-choices"><button data-choice="nominal">nominal</button><button data-choice="ordinal">ordinal</button><button data-choice="metric">metrisch</button></div>`;
  row.querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
    row.querySelectorAll("button").forEach(b => b.classList.remove("correct", "wrong"));
    const isCorrect = button.dataset.choice === correct;
    button.classList.add(isCorrect ? "correct" : "wrong");
    if (isCorrect) scaleCorrect.add(index); else scaleCorrect.delete(index);
    document.getElementById("scaleScore").textContent = `${scaleCorrect.size} / ${scaleQuestions.length}`;
    const feedback = document.getElementById("scaleFeedback");
    feedback.className = `feedback visible ${isCorrect ? "success" : "error"}`;
    feedback.textContent = isCorrect ? "Passt. Entscheidend ist, welche Vergleiche zwischen den Werten möglich sind." : `Noch nicht. ${correct === "nominal" ? "Es gibt keine natürliche Reihenfolge." : correct === "ordinal" ? "Es gibt eine Rangfolge, aber keine sicher gleichen Abstände." : "Abstände zwischen den Werten sind messbar und bedeutsam."}`;
  }));
  scaleCards.appendChild(row);
});

function mean(values) { return values.reduce((sum, value) => sum + value, 0) / values.length; }
function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}
function sampleSd(values) {
  if (values.length < 2) return NaN;
  const avg = mean(values);
  return Math.sqrt(values.reduce((sum, value) => sum + (value - avg) ** 2, 0) / (values.length - 1));
}
function modes(values) {
  const counts = new Map();
  values.forEach(value => counts.set(value, (counts.get(value) || 0) + 1));
  const highest = Math.max(...counts.values());
  if (highest === 1) return [];
  return [...counts.entries()].filter(([, count]) => count === highest).map(([value]) => value).sort((a, b) => a - b);
}

const creamData = [
  [1, 3, 5, 6, 7, 8, 9, 8, 7, 6, 5, 2, 3, 2, 5, 6, 7, 5, 6, 6],
  [1, 2, 3, 2, 4, 1, 2, 3, 2, 1, 7, 6, 8, 9, 8, 7, 8, 7, 8, 1],
  [2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 9],
  [1, 2, 3, 4, 3, 2, 1, 2, 2, 2, 3, 2, 3, 2, 3, 4, 1, 2, 3, 2]
];

function updateCreamMode(index) {
  const values = creamData[index];
  const counts = Array.from({ length: 9 }, (_, i) => values.filter(value => value === i + 1).length);
  const maxCount = Math.max(...counts);
  const allModes = counts.map((count, i) => count === maxCount ? i + 1 : null).filter(Boolean);
  const plot = document.getElementById("creamModePlot");
  plot.innerHTML = counts.map((count, i) => `<div class="frequency-bar ${count === maxCount ? "mode" : ""}" style="height:${count / 10 * 100}%"><b>${count}</b><span>${i + 1}</span></div>`).join("");
  document.getElementById("creamModeResult").innerHTML = `<b>Modalwert${allModes.length > 1 ? "e" : ""}: ${allModes.join(", ")}</b> – ${maxCount} von 20 Personen vergaben ${allModes.length > 1 ? "diese Bewertungen jeweils" : "diese Bewertung"}. Der Modalwert ist direkt an ${allModes.length > 1 ? "den höchsten Balken" : "dem höchsten Balken"} erkennbar.`;
  document.querySelectorAll("#creamButtons button").forEach((button, buttonIndex) => button.classList.toggle("active", buttonIndex === index));
}
document.querySelectorAll("#creamButtons button").forEach(button => button.addEventListener("click", () => updateCreamMode(Number(button.dataset.cream))));
updateCreamMode(0);

const outlierRange = document.getElementById("outlierRange");
function updateOutlier() {
  const special = Number(outlierRange.value);
  const values = [9, 10, 10, 10, 11, special];
  document.getElementById("outlierValue").textContent = special;
  document.getElementById("outlierValues").innerHTML = `<b>Einzelwerte:</b> ${values.map((value, index) => `Keimling ${index + 1}: ${value} mm`).join(" · ")}`;
  document.getElementById("meanValue").textContent = `${mean(values).toFixed(1)} mm`;
  document.getElementById("medianValue").textContent = `${median(values).toFixed(1)} mm`;
  const currentModes = modes(values);
  document.getElementById("modeValue").textContent = currentModes.length ? `${currentModes.join(" / ")} mm` : "kein eindeutiger";
  const plot = document.getElementById("outlierPlot");
  plot.innerHTML = "";
  values.forEach((value, index) => {
    const dot = document.createElement("i");
    dot.className = `dot ${index === values.length - 1 ? "outlier" : ""}`;
    dot.style.left = `${(value - 5) / 45 * 100}%`;
    dot.style.bottom = `${values.slice(0, index).filter(v => Math.abs(v - value) < .2).length * 20}px`;
    dot.title = `${value} mm`;
    plot.appendChild(dot);
  });
  const difference = Math.abs(mean(values) - median(values));
  document.getElementById("outlierInsight").textContent = difference > 2 ? "Der einzelne hohe Wert zieht den Mittelwert deutlich nach oben. Der Median bleibt näher bei den übrigen Keimlingen." : "Mittelwert und Median liegen nahe beieinander, solange kein starker Ausreisser vorliegt.";
}
outlierRange.addEventListener("input", updateOutlier);
updateOutlier();

document.querySelectorAll(".quick-check").forEach(check => {
  check.querySelectorAll("button[data-answer]").forEach(button => button.addEventListener("click", () => {
    check.querySelectorAll("button[data-answer]").forEach(b => b.classList.remove("correct", "wrong"));
    const correct = button.dataset.answer === check.dataset.correct;
    button.classList.add(correct ? "correct" : "wrong");
    const feedback = check.querySelector(".feedback");
    feedback.className = `feedback visible ${correct ? "success" : "error"}`;
    if (check.dataset.feedbackCorrect || check.dataset.feedbackWrong) {
      feedback.textContent = correct ? check.dataset.feedbackCorrect : check.dataset.feedbackWrong;
    } else if (check.dataset.correct === "median") feedback.textContent = correct ? "Richtig. Der Median reagiert weniger stark auf Extremwerte." : "Versuche es nochmals: Gesucht ist ein Kennwert, der gegenüber Extremwerten robust ist.";
    else feedback.textContent = correct ? "Richtig. Die Daten liefern nicht genug Grund, H₀ zu verwerfen. Gleichheit ist damit nicht bewiesen." : "Nicht korrekt. Ein p-Wert ist weder die Wahrscheinlichkeit für eine Hypothese noch ein Beweis für Gleichheit.";
  }));
});

let selectedPattern = null;
document.querySelectorAll(".target-grid button").forEach(button => button.addEventListener("click", () => {
  selectedPattern = button.dataset.pattern;
  document.querySelectorAll(".target-grid button").forEach(b => b.classList.toggle("selected", b === button));
  document.getElementById("precisionFeedback").className = "feedback visible";
  document.getElementById("precisionFeedback").textContent = "Ordne den gewählten Fall nun ein.";
}));
document.querySelectorAll("#precisionChoices button").forEach(button => button.addEventListener("click", () => {
  const feedback = document.getElementById("precisionFeedback");
  document.querySelectorAll("#precisionChoices button").forEach(b => b.classList.remove("correct", "wrong"));
  if (!selectedPattern) {
    feedback.className = "feedback visible error";
    feedback.textContent = "Wähle zuerst eines der vier Zielbilder.";
    return;
  }
  const correct = button.dataset.answer === selectedPattern;
  button.classList.add(correct ? "correct" : "wrong");
  feedback.className = `feedback visible ${correct ? "success" : "error"}`;
  feedback.textContent = correct ? "Richtig. Richtigkeit betrifft die Nähe zum Ziel, Präzision die Enge der Treffer." : "Noch nicht: Liegt der Mittelpunkt der Treffer am Ziel? Und liegen die Treffer eng zusammen?";
}));

const distributions = [
  { name: "A", bars: [1, 3, 6, 9, 6, 3, 1], answer: "normal" },
  { name: "B", bars: [10, 8, 5, 3, 2, 1, 1], answer: "skewed" },
  { name: "C", bars: [1, 4, 8, 4, 1, 4, 8], answer: "bimodal" }
];
let normalCorrect = new Set();
const distributionCases = document.getElementById("distributionCases");
distributions.forEach((item, index) => {
  const card = document.createElement("article");
  card.className = "distribution-card";
  card.innerHTML = `<h3>Verteilung ${item.name}</h3><div class="histogram">${item.bars.map(height => `<i style="height:${height * 10}%"></i>`).join("")}</div><select aria-label="Verteilung ${item.name} beurteilen"><option value="">Beurteilen …</option><option value="normal">ungefähr glockenförmig</option><option value="skewed">einseitig schief</option><option value="bimodal">zweigipflig (bimodal)</option><option value="unclear">zu wenig Information</option></select>`;
  card.querySelector("select").addEventListener("change", event => {
    if (event.target.value === item.answer) normalCorrect.add(index); else normalCorrect.delete(index);
    document.getElementById("normalScore").textContent = `${normalCorrect.size} / ${distributions.length}`;
    const feedback = document.getElementById("normalFeedback");
    const correct = event.target.value === item.answer;
    feedback.className = `feedback visible ${correct ? "success" : "error"}`;
    feedback.textContent = correct ? (item.answer === "normal" ? "Richtig: ungefähr symmetrisch mit einem Gipfel in der Mitte." : item.answer === "skewed" ? "Richtig: Die Häufigkeiten ziehen sich deutlich zu einer Seite." : "Richtig: Zwei getrennte Gipfel heissen zweigipflig oder bimodal und können zwei Teilgruppen anzeigen.") : "Achte auf Symmetrie, einen langen einseitigen Ausläufer und die Anzahl der Gipfel.";
  });
  distributionCases.appendChild(card);
});

const distanceRange = document.getElementById("distanceRange");
function updateErrorBars() {
  const meanA = 4.3;
  const meanB = meanA + Number(distanceRange.value);
  const sdA = 1.3;
  const sdB = 1.2;
  document.getElementById("barA").style.height = `${meanA * 10}%`;
  document.getElementById("barB").style.height = `${Math.min(meanB, 9.3) * 10}%`;
  const lineA = document.getElementById("errorA");
  const lineB = document.getElementById("errorB");
  lineA.style.bottom = `${(meanA - sdA) * 10}%`;
  lineA.style.height = `${sdA * 20}%`;
  lineB.style.bottom = `${Math.max(0, meanB - sdB) * 10}%`;
  lineB.style.height = `${sdB * 20}%`;
  const overlap = meanA + sdA >= meanB - sdB;
  const result = document.getElementById("overlapResult");
  result.className = `feedback visible ${overlap ? "" : "success"}`;
  result.innerHTML = overlap ? "<b>Die SD-Balken überlappen sich.</b> Ein signifikanter Unterschied ist trotzdem möglich. Das Bild allein entscheidet nicht." : "<b>Die SD-Balken überlappen sich nicht.</b> Das ist ein deutlicher optischer Hinweis auf einen Unterschied. Bestätige ihn mit dem passenden Test.";
}
distanceRange.addEventListener("input", updateErrorBars);
updateErrorBars();

function chooseTest(scale, groups, relation, distribution) {
  if (!scale) return { test: "Datenart noch festlegen", reason: "Ordne zuerst die abhängige Variable ein." };
  if (scale === "nominal") return { test: "Chi-Quadrat-Test oder Fisher-Test", reason: "Vergleiche Häufigkeiten. Bei kleinen erwarteten Häufigkeiten ist der Fisher-Test geeigneter." };
  if (scale === "ordinal") {
    if (groups === "3") return relation === "paired" ? { test: "Friedman-Test", reason: "Mehr als zwei verbundene ordinale Messungen." } : { test: "Kruskal-Wallis-Test", reason: "Mehr als zwei unabhängige ordinale Gruppen." };
    return relation === "paired" ? { test: "Wilcoxon-Vorzeichen-Rang-Test", reason: "Zwei verbundene ordinale Messungen, zum Beispiel dieselben Personen vorher und nachher." } : { test: "Mann-Whitney-U-Test", reason: "Zwei unabhängige ordinale Gruppen." };
  }
  if (groups === "3") {
    if (distribution === "normal") return relation === "paired" ? { test: "ANOVA mit Messwiederholung", reason: "Mehr als zwei verbundene metrische Messungen, Voraussetzungen erfüllt." } : { test: "Einfaktorielle ANOVA", reason: "Mehr als zwei unabhängige metrische Gruppen, ungefähr normalverteilt." };
    return relation === "paired" ? { test: "Friedman-Test", reason: "Mehr als zwei verbundene metrische Messungen ohne sichere Normalverteilung." } : { test: "Kruskal-Wallis-Test", reason: "Mehr als zwei unabhängige metrische Gruppen ohne sichere Normalverteilung." };
  }
  if (distribution === "normal") return relation === "paired" ? { test: "Gepaarter t-Test", reason: "Zwei verbundene metrische Messungen; die Differenzen sind ungefähr normalverteilt." } : { test: "Welch-t-Test", reason: "Zwei unabhängige metrische Gruppen. Der Welch-t-Test verlangt keine gleichen Varianzen." };
  return relation === "paired" ? { test: "Wilcoxon-Vorzeichen-Rang-Test", reason: "Zwei verbundene Messungen ohne sichere Normalverteilung." } : { test: "Mann-Whitney-U-Test", reason: "Zwei unabhängige Gruppen ohne sichere Normalverteilung." };
}

const finderInputs = ["finderScale", "finderGroups", "finderRelation", "finderDistribution"].map(id => document.getElementById(id));
function updateFinder() {
  const scale = document.getElementById("finderScale").value;
  document.getElementById("distributionLabel").style.display = scale === "nominal" || scale === "ordinal" ? "none" : "flex";
  const result = chooseTest(scale, document.getElementById("finderGroups").value, document.getElementById("finderRelation").value, document.getElementById("finderDistribution").value);
  document.getElementById("finderResult").textContent = result.test;
  document.getElementById("finderReason").textContent = result.reason;
}
finderInputs.forEach(input => input.addEventListener("change", updateFinder));
updateFinder();

document.getElementById("checkCase").addEventListener("click", () => {
  const answers = Object.fromEntries([...document.querySelectorAll("[data-case]")].map(input => [input.dataset.case, input.value]));
  const correct = answers.scale === "ordinal" && answers.relation === "paired" && answers.test === "wilcoxon";
  const feedback = document.getElementById("caseFeedback");
  feedback.className = `feedback visible ${correct ? "success" : "error"}`;
  feedback.textContent = correct ? "Richtig. Dieselben Personen liefern gepaarte ordinale Daten. Deshalb passt der Wilcoxon-Vorzeichen-Rang-Test." : "Prüfe nochmals: Bewertungen von 1 bis 9 sind ordinal. Da dieselben Personen beide Cremes testen, sind die Messungen gepaart.";
});

document.querySelectorAll("[data-project-tab]").forEach(button => button.addEventListener("click", () => {
  document.querySelectorAll("[data-project-tab]").forEach(tab => { tab.classList.toggle("active", tab === button); tab.setAttribute("aria-selected", tab === button ? "true" : "false"); });
  document.getElementById("projectPlan").classList.toggle("active", button.dataset.projectTab === "plan");
  document.getElementById("exampleFinish").classList.toggle("active", button.dataset.projectTab === "example");
}));

const projectFields = ["researchQuestion", "dependentVariable", "projectScale", "projectGroups", "projectRelation", "projectDistribution", "sampleSize", "measurementMethod", "instrumentResolution", "errorControls", "limitations", "dataA", "dataB"];
projectFields.forEach(id => {
  const field = document.getElementById(id);
  if (state.project[id] !== undefined) field.value = state.project[id];
  field.addEventListener("input", () => {
    state.project[id] = field.value;
    saveState();
    updateProjectAdvice();
  });
  field.addEventListener("change", updateProjectAdvice);
});

function updateProjectAdvice() {
  const scale = document.getElementById("projectScale").value;
  const distributionValue = document.getElementById("projectDistribution").value;
  const distribution = distributionValue === "normal" ? "normal" : "non-normal";
  const result = chooseTest(scale, document.getElementById("projectGroups").value, document.getElementById("projectRelation").value, distribution);
  document.getElementById("projectTest").textContent = result.test;
  const unknown = scale === "metric" && distributionValue === "unknown";
  document.getElementById("projectAdvice").textContent = `${result.reason}${unknown ? " Prüfe später zuerst die Verteilung; bei ungefähr normalverteilten Daten kann sich die Empfehlung ändern." : ""}`;
}
updateProjectAdvice();

function parseNumbers(text) {
  return text.trim().split(/[\s;]+/).map(value => Number(value.replace(",", "."))).filter(Number.isFinite);
}
document.getElementById("analyseData").addEventListener("click", () => {
  const a = parseNumbers(document.getElementById("dataA").value);
  const b = parseNumbers(document.getElementById("dataB").value);
  const output = document.getElementById("dataSummary");
  if (!a.length || !b.length) {
    output.innerHTML = `<article><b>Noch keine zwei Zahlenreihen</b><span>Füge in beide Felder mindestens einen gültigen Wert ein.</span></article>`;
    return;
  }
  const format = values => `n = ${values.length} · Median = ${median(values).toFixed(2)} · Mittelwert = ${mean(values).toFixed(2)} · SD = ${values.length > 1 ? sampleSd(values).toFixed(2) : "–"}`;
  output.innerHTML = `<article><b>Gruppe A</b><span>${format(a)}</span></article><article><b>Gruppe B</b><span>${format(b)}</span></article>`;
});

function buildPlanText() {
  const get = id => document.getElementById(id).value || "noch offen";
  return [
    "STATISTISCHER AUSWERTUNGSPLAN",
    `Forschungsfrage: ${get("researchQuestion")}`,
    `Abhängige Variable: ${get("dependentVariable")}`,
    `Datenart: ${get("projectScale")}`,
    `Gruppen: ${get("projectGroups")}`,
    `Messungen: ${get("projectRelation")}`,
    `Verteilung: ${get("projectDistribution")}`,
    `Stichprobengrösse pro Gruppe: ${get("sampleSize")}`,
    `Messgerät / Methode: ${get("measurementMethod")}`,
    `Kleinste Einheit / Auflösung: ${get("instrumentResolution")}`,
    `Kontrollen gegen Messfehler: ${get("errorControls")}`,
    `Vorgeschlagener Test: ${document.getElementById("projectTest").textContent}`,
    `Begründung: ${document.getElementById("projectAdvice").textContent}`,
    `Fehler und Grenzen: ${get("limitations")}`,
    "Ergebnis später berichten: Kennwert + Streuung + n + Test + p-Wert + praktische Bedeutung."
  ].join("\n");
}

document.getElementById("copyPlan").addEventListener("click", async () => {
  const feedback = document.getElementById("copyFeedback");
  try {
    await navigator.clipboard.writeText(buildPlanText());
    feedback.className = "feedback visible success";
    feedback.textContent = "Der Auswertungsplan wurde kopiert.";
  } catch {
    feedback.className = "feedback visible error";
    feedback.textContent = "Kopieren war nicht möglich. Markiere die Angaben und kopiere sie manuell.";
  }
});

document.getElementById("clearPlan").addEventListener("click", () => {
  projectFields.forEach(id => { document.getElementById(id).value = ""; });
  document.getElementById("projectGroups").value = "2";
  document.getElementById("projectRelation").value = "independent";
  document.getElementById("projectDistribution").value = "unknown";
  state.project = {};
  saveState();
  updateProjectAdvice();
  document.getElementById("dataSummary").innerHTML = "";
});

document.getElementById("resetCourse").addEventListener("click", () => {
  if (!window.confirm("Kursfortschritt und Projekteingaben auf diesem Gerät löschen?")) return;
  localStorage.removeItem(storageKey);
  location.reload();
});

updateProgress();
showChapter(location.hash.replace("#", "") || "start", false);
